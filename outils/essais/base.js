/**
 * La base, éprouvée pour de vrai : les migrations rejouées dans l'ordre sur un
 * Postgres local, puis le cloisonnement entre salons interrogé sous chacun des
 * rôles que Supabase prête à un appelant.
 *
 *   npm run essais:base
 *
 * Pourquoi un vrai Postgres et pas une relecture : une politique se lit bien,
 * mais ce qu'elle laisse passer dépend de toutes celles qui l'ont précédée, des
 * droits par défaut, des fonctions « security definer » et de l'ordre où tout a
 * été posé. Cinquante migrations plus tard, seule la base sait répondre.
 *
 * Ce que l'essai simule, et rien de plus : le schéma `auth` (la table des
 * comptes, `auth.uid()` lu dans les claims du jeton comme le fait Supabase),
 * les trois rôles `anon`, `authenticated`, `service_role`, et les droits par
 * défaut que Supabase pose sur `public` — tout ouvert aux trois rôles, la
 * sécurité au niveau des lignes faisant seule barrière. C'est ce dernier point
 * qui rend l'essai fidèle : une table sans RLS y est lisible par `anon`, comme
 * elle le serait en production.
 *
 * `pg_cron` et `pg_net` ne s'installent pas hors de Supabase : ils sont
 * remplacés par des bouchons qui acceptent les appels et ne font rien. Le texte
 * des migrations n'est pas modifié sur disque — seule la copie rejouée ici voit
 * leur test de présence répondre oui.
 *
 * Il faut les binaires de Postgres (`initdb`, `pg_ctl`, `psql`) : présents sur
 * les machines d'intégration d'Ubuntu, et chez soi par le paquet `postgresql`.
 * Sans eux l'essai le dit et s'arrête en échec — il ne se déclare pas réussi.
 */
"use strict";
const { execFileSync, spawnSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const RACINE = path.resolve(__dirname, "..", "..");
const MIGRATIONS = path.join(RACINE, "supabase", "migrations");

/* ------------------------------------------------------------ la grappe */

function binaires() {
  const candidats = [];
  const racine = "/usr/lib/postgresql";
  if (fs.existsSync(racine)) {
    for (const v of fs.readdirSync(racine).sort((a, b) => Number(b) - Number(a))) {
      candidats.push(path.join(racine, v, "bin"));
    }
  }
  for (const dossier of candidats) {
    if (fs.existsSync(path.join(dossier, "initdb"))) return dossier;
  }
  const trouve = spawnSync("sh", ["-c", "command -v initdb"], { encoding: "utf8" });
  if (trouve.status === 0) return path.dirname(trouve.stdout.trim());
  return null;
}

/* `initdb` refuse de tourner sous root : sur une machine où l'on est root (un
   conteneur), la grappe appartient à l'utilisateur `postgres`. */
const ROOT = typeof process.getuid === "function" && process.getuid() === 0;
const commeServeur = (bin, args, opts = {}) =>
  ROOT
    ? execFileSync("runuser", ["-u", "postgres", "--", bin, ...args], opts)
    : execFileSync(bin, args, opts);

function demarre() {
  const bin = binaires();
  if (!bin) {
    console.error("Postgres introuvable (initdb) : installez le paquet postgresql.");
    process.exit(2);
  }
  const dossier = fs.mkdtempSync(path.join(os.tmpdir(), "plan-base-"));
  const donnees = path.join(dossier, "donnees");
  const prise = path.join(dossier, "prise");
  fs.mkdirSync(prise);
  if (ROOT) execFileSync("chown", ["-R", "postgres:postgres", dossier]);
  commeServeur(path.join(bin, "initdb"),
    ["-D", donnees, "-U", "postgres", "--auth=trust", "-E", "UTF8", "--locale=C.UTF-8"],
    { stdio: "ignore" });
  const port = String(54000 + Math.floor(Math.random() * 900));
  commeServeur(path.join(bin, "pg_ctl"),
    ["-D", donnees, "-l", path.join(dossier, "journal"), "-w", "start",
     "-o", `-p ${port} -k ${prise} -c listen_addresses=''`],
    { stdio: "ignore" });
  const arrete = () => {
    try {
      commeServeur(path.join(bin, "pg_ctl"), ["-D", donnees, "-m", "immediate", "stop"],
        { stdio: "ignore" });
    } catch (e) {
      console.error("Arrêt de la grappe :", e.message);
    }
    fs.rmSync(dossier, { recursive: true, force: true });
  };
  return { psql: path.join(bin, "psql"), prise, port, arrete };
}

/* ------------------------------------------------------- ce que Supabase pose */

const SUPABASE = `
create role anon nologin noinherit;
create role authenticated nologin noinherit;
create role service_role nologin noinherit bypassrls;
grant anon, authenticated, service_role to postgres;

/* pgcrypto vit dans « extensions » chez Supabase, et la base l'a dans son
   chemin : la migration qui le demande n'a alors rien à faire. */
create schema extensions;
create extension pgcrypto schema extensions;
grant usage on schema extensions to anon, authenticated, service_role;
alter database postgres set search_path = "$user", public, extensions;

create schema auth;
create table auth.users (
  id uuid primary key default gen_random_uuid(),
  email text,
  raw_user_meta_data jsonb not null default '{}',
  email_confirmed_at timestamptz,
  last_sign_in_at timestamptz
);
create function auth.uid() returns uuid language sql stable as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;
create function auth.role() returns text language sql stable as $$
  select nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role'
$$;
grant usage on schema auth to anon, authenticated, service_role;
grant execute on all functions in schema auth to anon, authenticated, service_role;

grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;

create schema cron;
create table cron.job (jobid serial primary key, jobname text unique, schedule text,
                       command text, active boolean not null default true);
create function cron.schedule(nom text, quand text, quoi text) returns bigint
language sql as $$
  insert into cron.job (jobname, schedule, command) values (nom, quand, quoi)
  on conflict (jobname) do update set schedule = excluded.schedule, command = excluded.command
  returning jobid::bigint
$$;
create function cron.unschedule(nom text) returns boolean language sql as $$
  delete from cron.job where jobname = nom returning true
$$;
create schema net;
create function net.http_post(url text, body jsonb default '{}', params jsonb default '{}',
                              headers jsonb default '{}', timeout_milliseconds int default 1000)
returns bigint language sql as $$ select 0::bigint $$;
`;

/** La copie rejouée d'une migration : les deux extensions qu'on ne peut pas
 *  installer ici se disent présentes. */
const adapte = (sql) =>
  sql.replace(/\(select 1 from pg_extension where extname = '(pg_cron|pg_net)'\)/g, "(select 1)");

/* ------------------------------------------------------------- les requêtes */

let BASE = null;

function sql(texte, { echoue = false } = {}) {
  const r = spawnSync(BASE.psql,
    ["-X", "-q", "-t", "-A", "-v", "ON_ERROR_STOP=1",
     "-h", BASE.prise, "-p", BASE.port, "-U", "postgres", "-d", "postgres"],
    { input: texte, encoding: "utf8" });
  if (echoue) return { ok: r.status === 0, sortie: r.stdout.trim(), erreur: r.stderr.trim() };
  if (r.status !== 0) throw new Error(r.stderr.trim() || "psql a échoué");
  return r.stdout.trim();
}

/** Une requête jouée sous l'identité d'un appelant, comme PostgREST la joue :
 *  le rôle du jeton, et ses claims dans la configuration de la transaction.
 *  Tout est annulé à la fin — un essai ne laisse rien derrière lui. */
function comme(qui, texte, opts) {
  const role = qui === "anon" ? "anon" : qui === "service" ? "service_role" : "authenticated";
  const claims = qui === "anon" || qui === "service"
    ? { role }
    : { role, sub: qui };
  return sql(`begin;
do $$ begin
  perform set_config('request.jwt.claims', '${JSON.stringify(claims)}', true);
  perform set_config('request.jwt.claim.sub', '${claims.sub ?? ""}', true);
end $$;
set local role ${role};
${texte}
rollback;`, opts);
}

/* ------------------------------------------------------------- les essais */

let echecs = 0, reussis = 0;
function verifie(nom, condition, detail) {
  if (condition) { reussis++; console.log("  ✓ " + nom); }
  else { echecs++; console.log("  ✗ " + nom + (detail ? "\n      " + detail : "")); }
}
/** La dernière ligne de ce que psql rend : les `set_config` en écrivent avant. */
const derniere = (s) => String(s).split("\n").filter(Boolean).pop() ?? "";

function prepare() {
  sql(SUPABASE);
  const fichiers = fs.readdirSync(MIGRATIONS).filter((f) => f.endsWith(".sql")).sort();
  for (const f of fichiers) {
    const r = sql(adapte(fs.readFileSync(path.join(MIGRATIONS, f), "utf8")), { echoue: true });
    if (!r.ok) throw new Error("Migration " + f + " : " + r.erreur);
  }
  console.log(fichiers.length + " migrations rejouées.");
}

/* Deux salons, deux organisateurs, un administrateur. Le premier compte d'un
   projet naît administrateur : il est créé d'abord, exprès. */
const ADMIN = "00000000-0000-4000-8000-00000000000a";
const ORGA_A = "00000000-0000-4000-8000-0000000000a1";
const ORGA_B = "00000000-0000-4000-8000-0000000000b1";
const INSCRIT = "00000000-0000-4000-8000-0000000000ff";
const SALON_A = "00000000-0000-4000-8000-00000000a000";
const SALON_B = "00000000-0000-4000-8000-00000000b000";
const BROUILLON = "00000000-0000-4000-8000-00000000c000";

function peuple() {
  sql(`
insert into auth.users (id, email) values ('${ADMIN}', 'admin@exemple.fr');
insert into auth.users (id, email) values ('${ORGA_A}', 'a@exemple.fr');
insert into auth.users (id, email) values ('${ORGA_B}', 'b@exemple.fr');
insert into auth.users (id, email, raw_user_meta_data)
  values ('${INSCRIT}', 'intrus@exemple.fr', '{"role":"admin"}');
insert into evenement (id, nom, slug, instance, etat) values
  ('${SALON_A}', 'Salon A', 'salon-a', 'a', 'publie'),
  ('${SALON_B}', 'Salon B', 'salon-b', 'b', 'publie'),
  ('${BROUILLON}', 'Brouillon', 'brouillon', 'c', 'brouillon');
insert into acces (profil_id, evenement_id) values
  ('${ORGA_A}', '${SALON_A}'), ('${ORGA_B}', '${SALON_B}');
insert into cible (evenement_id, genre, id, nom) values
  ('${SALON_A}', 'fiche_stand', 's1', 'Stand A1'),
  ('${SALON_B}', 'fiche_stand', 's1', 'Stand B1');
insert into visiteur_cible (evenement_id, objet, cible, genre, jour, visiteur) values
  ('${SALON_A}', 'fiche_stand', 's1', 'fiche_stand', current_date, 'va'),
  ('${SALON_B}', 'fiche_stand', 's1', 'fiche_stand', current_date, 'vb');
insert into rappel_de_conference (evenement, abonnement, p256dh, auth, conference, envoi_a, titre)
  values ('${SALON_B}', 'https://fcm.googleapis.com/fcm/send/x', 'p', 'a', 'c1',
          now() - interval '1 minute', 'Conférence');
`);
}

const ESSAIS = [];
const essai = (nom, fn) => ESSAIS.push({ nom, fn });

/* --------------------------------------------------------- les profils */

essai("Les rôles", () => {
  verifie("le premier compte du projet naît administrateur",
    sql(`select role from profil where id = '${ADMIN}'`) === "admin");
  verifie("un compte qui se déclare « admin » à l'inscription reste organisateur",
    sql(`select role from profil where id = '${INSCRIT}'`) === "organisateur");
  const r = comme(ORGA_A, `update profil set role = 'admin' where id = '${ORGA_A}' returning id;`,
    { echoue: true });
  verifie("un organisateur ne se promeut pas administrateur",
    !r.ok || derniere(r.sortie) === "",
    r.sortie);
  const s = comme(ORGA_A,
    `insert into acces (profil_id, evenement_id) values ('${ORGA_A}', '${SALON_B}');`,
    { echoue: true });
  verifie("un organisateur ne s'affecte pas un salon", !s.ok, s.sortie);
  verifie("un organisateur ne lit que son propre profil",
    derniere(comme(ORGA_A, "select count(*) from profil;")) === "1");
});

/* ------------------------------------------------------ le cloisonnement */

essai("Le cloisonnement entre salons", () => {
  verifie("l'organisateur de A ne voit que A",
    derniere(comme(ORGA_A, "select string_agg(slug, ',' order by slug) from evenement;")) === "salon-a");
  const maj = comme(ORGA_A,
    `update evenement set nom = 'piraté' where id = '${SALON_B}' returning id;`);
  verifie("l'organisateur de A ne modifie pas B", derniere(maj) === "");
  const sup = comme(ORGA_A, `delete from evenement where id = '${SALON_B}' returning id;`);
  verifie("l'organisateur de A ne supprime pas B", derniere(sup) === "");
  const cree = comme(ORGA_A,
    "insert into evenement (nom, slug, instance) values ('Nouveau', 'nouveau', 'n');", { echoue: true });
  verifie("un organisateur ne crée pas de salon", !cree.ok);
  const pl = comme(ORGA_A,
    `insert into plan (evenement_id, id_klipso, libelle) values ('${SALON_B}', gen_random_uuid(), 'Hall');`,
    { echoue: true });
  verifie("l'organisateur de A n'ajoute pas de pavillon à B", !pl.ok);
  /* Toutes les tables qui portent un salon, lues par l'organisateur de A :
     aucune ligne de B ne doit lui revenir. La liste est relevée dans la base,
     non tenue à la main — une table ajoutée demain sera essayée aussi. */
  const tables = sql(`select string_agg(c.table_name || ':' || c.column_name, ','
                                         order by c.table_name)
    from information_schema.columns c
    join information_schema.tables t using (table_schema, table_name)
    where c.table_schema = 'public' and c.column_name in ('evenement_id', 'evenement')
      and c.data_type = 'uuid' and t.table_type = 'BASE TABLE';`).split(",");
  for (const tc of tables) {
    const [t, col] = tc.split(":");
    const n = derniere(comme(ORGA_A,
      `select count(*) from ${t} where ${col} = '${SALON_B}';`));
    verifie(`l'organisateur de A ne lit rien de B dans « ${t} »`, n === "0", n + " ligne(s)");
  }
  verifie("l'administrateur voit tous les salons",
    derniere(comme(ADMIN, "select count(*) from evenement;")) === "3");
});

/* ---------------------------------------------------------- le visiteur */

essai("Le visiteur anonyme", () => {
  /* Le visiteur lit par la fonction `plan-public`, sous la clé de service : la
     base ne lui ouvre aucune table directement. */
  for (const table of ["evenement", "plan", "calque", "apparence", "calque_dessin",
                       "instantane", "profil", "acces", "mesure", "compteur",
                       "compteur_cible", "visiteur_jour", "vignette_de_logo"]) {
    const r = comme("anon", `select count(*) from ${table};`, { echoue: true });
    verifie(`anon ne lit rien de « ${table} »`, !r.ok || derniere(r.sortie) === "0", r.sortie || r.erreur);
  }
  /* Les fonctions de service, appelées directement par l'API avec la clé
     publique : elles ne doivent rien rendre ni rien changer. */
  const dus = comme("anon", "select count(*) from rappels_dus(100);", { echoue: true });
  verifie("anon ne relève pas les rappels dus (abonnements des visiteurs)",
    !dus.ok || derniere(dus.sortie) === "0", dus.sortie);
  verifie("… et ils restent à envoyer",
    sql("select count(*) from rappel_de_conference where envoye_a is null;") === "1");
  for (const appel of ["select purge_presences(0);", "select purge_rappels();",
                       `select reinitialise_compteurs('${SALON_B}');`,
                       `select oublie_abonnement('https://fcm.googleapis.com/fcm/send/x');`]) {
    comme("anon", appel, { echoue: true });
  }
  verifie("anon n'efface ni présences ni rappels par les fonctions de service",
    sql("select count(*) from visiteur_cible;") === "2" &&
    sql("select count(*) from rappel_de_conference;") === "1");
  const ecrit = comme("anon",
    `update evenement set etat = 'publie' where id = '${BROUILLON}' returning id;`,
    { echoue: true });
  verifie("anon ne publie pas un brouillon", !ecrit.ok || derniere(ecrit.sortie) === "");
});

/* ------------------------------------------- toutes les tables, en un coup */

essai("Aucune table de « public » sans sécurité au niveau des lignes", () => {
  const sans = sql(`select string_agg(c.relname, ', ' order by c.relname)
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind in ('r', 'p') and not c.relrowsecurity;`);
  verifie("toutes les tables ont la RLS active", sans === "", "sans RLS : " + sans);
  const vues = sql(`select string_agg(c.relname, ', ' order by c.relname)
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind in ('v', 'm')
      and (has_table_privilege('anon', c.oid, 'select')
           or has_table_privilege('authenticated', c.oid, 'select'))
      and not coalesce((select bool_or(o = 'security_invoker=true' or o = 'security_invoker=on')
                        from unnest(c.reloptions) o), false);`);
  verifie("aucune vue lisible par anon ou authenticated ne contourne la RLS", vues === "",
    "vues en « security definer » : " + vues);
});

essai("Les fonctions « security definer »", () => {
  const sansChemin = sql(`select string_agg(p.proname, ', ' order by p.proname)
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.prosecdef
      and not exists (select 1 from unnest(coalesce(p.proconfig, '{}')) c
                      where c like 'search_path=%');`);
  verifie("toutes ont un search_path figé", sansChemin === "", "sans search_path : " + sansChemin);
});

/* ------------------------------------------------ les droits repris */

essai("Un droit repris ne sert plus", () => {
  /* Le jeton d'un compte vit encore une heure après qu'on lui a retiré un
     salon : ce qui compte est que la base ne lui réponde plus. Les politiques
     relisent « acces » à chaque requête, et non une claim du jeton. */
  verifie("l'organisateur de A lit A",
    derniere(comme(ORGA_A, "select count(*) from evenement;")) === "1");
  const apres = derniere(comme(ORGA_A, `reset role;
    delete from acces where profil_id = '${ORGA_A}';
    set local role authenticated;
    select count(*) from evenement;`));
  verifie("… et plus rien sitôt l'affectation retirée, avec le même jeton", apres === "0", apres);
  const supprime = derniere(sql(`begin;
    delete from auth.users where id = '${ORGA_A}';
    do $$ begin
      perform set_config('request.jwt.claim.sub', '${ORGA_A}', true);
    end $$;
    set local role authenticated;
    select count(*) from evenement;
    rollback;`));
  verifie("un compte supprimé ne lit plus rien avec son ancien jeton", supprime === "0", supprime);
});

/* --------------------------------------------------- les affectations */

essai("Le profil et les salons d'un compte, en une transaction", () => {
  const existe = sql(`select count(*) from pg_proc where proname = 'ecrit_compte';`);
  if (existe !== "1") { verifie("la fonction ecrit_compte existe", false); return; }
  const salonsDe = (qui) => sql(`select coalesce(string_agg(evenement_id::text, ',' order by evenement_id), '')
    from acces where profil_id = '${qui}';`);

  verifie("remplace les salons d'un compte",
    derniere(sql(`begin;
      select ecrit_compte('${ORGA_A}', '{}', array['${SALON_B}']::uuid[]);
      select string_agg(evenement_id::text, ',') from acces where profil_id = '${ORGA_A}';
      rollback;`)) === SALON_B);

  /* L'échec intermédiaire : le rôle est écrit, l'effacement fait, puis un
     salon inconnu fait lever l'insertion. Rien de tout cela ne doit rester. */
  const rate = sql(`select ecrit_compte('${ORGA_A}', '{"role":"admin","nom":"Changé"}',
    array['${SALON_B}', '00000000-0000-4000-8000-000000000bad']::uuid[]);`, { echoue: true });
  verifie("un salon inexistant fait échouer l'ensemble", !rate.ok);
  verifie("… les salons d'avant restent", salonsDe(ORGA_A) === SALON_A, salonsDe(ORGA_A));
  verifie("… et le rôle d'avant aussi",
    sql(`select role || '/' || coalesce(nom, '') from profil where id = '${ORGA_A}';`) === "organisateur/");

  verifie("les doublons ne font pas échouer le remplacement",
    derniere(sql(`begin;
      select ecrit_compte('${ORGA_A}', '{}', array['${SALON_A}', '${SALON_A}']::uuid[]);
      select count(*) from acces where profil_id = '${ORGA_A}';
      rollback;`)) === "1");
  verifie("sans liste de salons, ceux du compte ne bougent pas",
    derniere(sql(`begin;
      select ecrit_compte('${ORGA_A}', '{"prenom":"Ana"}', null);
      select prenom || '/' || (select string_agg(evenement_id::text, ',') from acces
                               where profil_id = '${ORGA_A}')
        from profil where id = '${ORGA_A}';
      rollback;`)) === "Ana/" + SALON_A);
  const roleFaux = sql(`select ecrit_compte('${ORGA_A}', '{"role":"dieu"}', null);`, { echoue: true });
  verifie("un rôle inconnu est refusé par la base", !roleFaux.ok);

  const inconnu = sql(`select ecrit_compte('00000000-0000-4000-8000-00000000dead', '{}', array[]::uuid[]);`,
    { echoue: true });
  verifie("un compte inconnu est refusé", !inconnu.ok);

  for (const [qui, nom] of [["anon", "anon"], [ORGA_A, "un organisateur"],
                            [ADMIN, "l'administrateur par l'API"]]) {
    const r = comme(qui, `select ecrit_compte('${ORGA_A}', '{"role":"admin"}', array['${SALON_B}']::uuid[]);`,
      { echoue: true });
    verifie(`${nom} ne l'appelle pas directement`, !r.ok, r.sortie);
  }
  const service = comme("service", `select ecrit_compte('${ORGA_A}', '{}', array['${SALON_A}']::uuid[]);`,
    { echoue: true });
  verifie("la clé de service l'appelle", service.ok, service.erreur);
});

/* ------------------------------------------------- ce que la console appelle */

essai("Les fonctions de la console, sous la session de l'exploitant", () => {
  const appels = {
    rapport: (salon) => `select rapport_utilisation('${salon}', 30) is not null;`,
    audience: (salon) => `select jsonb_typeof(audience_cibles('${salon}', 30, 'fiche_stand', false));`,
  };
  for (const [nom, appel] of Object.entries(appels)) {
    const r = comme(ORGA_A, appel(SALON_A), { echoue: true });
    verifie(`${nom} : l'organisateur de A l'obtient pour A`, r.ok, r.erreur);
  }
  const b = derniere(comme(ORGA_A, `select audience_cibles('${SALON_B}', 30, 'fiche_stand', false)::text;`));
  verifie("audience : rien de B ne revient à l'organisateur de A", !b.includes("s1"), b);
  const raz = comme(ORGA_A, `select reinitialise_compteurs('${SALON_B}');`, { echoue: true });
  verifie("remise à zéro : refusée sur le salon d'un autre", !raz.ok);
  const razA = comme(ORGA_A, `select reinitialise_compteurs('${SALON_A}');`, { echoue: true });
  verifie("remise à zéro : permise sur le sien", razA.ok, razA.erreur);
});

/* ------------------------------------------------- les portes publiques */

essai("Les portes ouvertes à anon", () => {
  /* Toute fonction qu'anon peut exécuter est une porte publique de l'API :
     elle doit être connue. La liste ci-dessous est celle qu'on a relue ; une
     fonction qui s'y ajoute sans y être nommée fait échouer l'essai, et
     demande qu'on la relise avant de l'ouvrir. */
  const ouvertes = sql(`select string_agg(p.proname, ',' order by p.proname)
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.prokind = 'f'
      and has_function_privilege('anon', p.oid, 'execute')
      and p.prorettype <> 'trigger'::regtype;`).split(",").filter(Boolean);
  const RELUES = new Set(OUVERTES_A_ANON);
  const inconnues = ouvertes.filter((f) => !RELUES.has(f));
  verifie("anon n'exécute que des fonctions relues", !inconnues.length,
    "non relues : " + inconnues.join(", "));
});

/* Les fonctions qu'anon exécute, et pourquoi c'est sans danger : chacune a été
   relue et borne elle-même ce qu'elle fait. */
const OUVERTES_A_ANON = [
  "acces_salon",       // ne dit vrai qu'à un compte affecté : rien pour anon
  "est_admin",         // idem
  "mesure_publique",   // la porte des mesures, bornée en base
];

/* ------------------------------------------------------------- en avant */

function lance() {
  console.log("Démarrage d'un Postgres local…");
  BASE = demarre();
  let code = 0;
  try {
    prepare();
    peuple();
    for (const { nom, fn } of ESSAIS) {
      console.log("\n" + nom);
      try { fn(); }
      catch (e) { verifie(nom + " — exception", false, e.message); }
    }
    console.log(`\n${reussis} vérifications réussies, ${echecs} en échec.`);
    code = echecs ? 1 : 0;
  } catch (e) {
    console.error(e.message);
    code = 1;
  } finally {
    BASE.arrete();
  }
  process.exit(code);
}

lance();
