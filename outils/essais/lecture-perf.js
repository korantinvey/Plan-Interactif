/**
 * La lecture des performances par jeton : `lecture_perf` et son registre.
 *
 * Rejoue les migrations dans PGlite (`base.js`) puis éprouve la porte que la
 * clé publiable atteint : refus muet sans jeton valable, lecture seule des
 * relevés, bilans, quotas, erreurs et salons avec leur `slug`, filtres, bornes,
 * pagination, et le fait que le jeton ne se retrouve jamais en clair dans la
 * base ni n'est émis par un autre rôle que le propriétaire.
 *
 *   node outils/essais/lecture-perf.js     (lancé par `npm run essais`)
 */
const fs = require("fs");
const path = require("path");
const { baseNeuve, MIGRATIONS } = require("./aides/base.js");

let ko = 0;
const dit = (ok, q, d) => {
  console.log((ok ? "  ok   " : "  ÉCHEC") + "  " + q + (d ? "   → " + d : ""));
  if (!ok) ko++;
};

const uuid = (() => {
  let n = 0;
  return () => "00000000-0000-4000-8000-" + String(++n).padStart(12, "0");
})();

async function main() {
  const db = await baseNeuve();
  const un = async (sql, args) => (await db.query(sql, args)).rows[0];
  const A = (await un("insert into evenement (nom, slug, instance, etat) values ('Salon A', 'a', 'x', 'publie') returning id")).id;
  const B = (await un("insert into evenement (nom, slug, instance, etat) values ('Salon B', 'b', 'x', 'brouillon') returning id")).id;

  const releve = (evt, decalageJours, ms) => db.query(
    "insert into releve_perf (evenement_id, visite, jour, page, mobile, affiche_ms, resume) values ($1,$2,current_date - $3::int,'plan',false,$4,'{\"format\":\"sonde-plan/1\"}')",
    [evt, uuid(), decalageJours, ms]);
  await releve(A, 0, 1000); await releve(A, 1, 1100); await releve(A, 3, 1200);
  await releve(B, 0, 2000); await releve(A, 20, 900);
  await db.query("insert into perf_bilan (evenement_id, jour, page, mobile, visites) values ($1,current_date,'plan',false,5)", [A]);
  await db.query("insert into perf_jour (evenement_id, jour, page, recues) values ($1,current_date,'plan',4)", [B]);
  const erreurPage = (evt, decalageJours, empreinte, nombre) => db.query(
    "insert into erreur_page (evenement_id, jour, page, empreinte, message, lieu, version, nombre) values ($1,current_date - $2::int,'admin',$3,'x is undefined','modules/fiche.mjs:132','1436aa6a0a',$4)",
    [evt, decalageJours, empreinte, nombre]);
  await erreurPage(A, 0, "e1", 7); await erreurPage(B, 0, "e2", 1); await erreurPage(A, 30, "e3", 2);

  const anon = async (sql, args) => {
    await db.exec("set role anon");
    try { return (await db.query(sql, args)).rows[0]; } finally { await db.exec("reset role"); }
  };
  const lis = async (jeton, quoi, extra = {}) => (await anon(
    "select lecture_perf($1, $2, $3::date, $4::date, $5, $6, $7) as r",
    [jeton, quoi, extra.de ?? null, extra.a ?? null, extra.slug ?? null, extra.limite ?? 1000, extra.decalage ?? 0])).r;
  const refuse = async (f) => { try { await f(); return ""; } catch (e) { return e.message; } };

  const jeton = (await un("select lecteur_perf_nouveau('claude') as j")).j;
  dit(/^[0-9a-f]{64}$/.test(jeton), "le jeton tient 64 caractères hexadécimaux (244 bits)");

  // --- refus muets
  dit(await lis(null, "releves") === null, "sans jeton : null");
  dit(await lis("court", "releves") === null, "jeton trop court : null");
  dit(await lis("0".repeat(64), "releves") === null, "jeton faux : null");
  dit(await lis(jeton, "releves") !== null, "le vrai jeton ouvre");

  // --- lecture
  const rel = await lis(jeton, "releves");
  dit(rel.length === 4 && rel.every((l) => l.slug && !("evenement_id" in l) && l.resume), "relevés des 7 jours, avec slug et résumé", rel.length);
  dit(rel.every((l, i) => i === 0 || rel[i - 1].jour <= l.jour), "triés par jour");
  const bil = await lis(jeton, "bilans");
  dit(bil.length === 1 && bil[0].slug === "a" && bil[0].visites === 5, "bilans avec slug");
  const jours = await lis(jeton, "jours");
  dit(jours.length === 1 && jours[0].slug === "b" && jours[0].recues === 4, "jours avec slug");
  const err = await lis(jeton, "erreurs");
  dit(err.length === 2 && err.every((l) => l.slug && !("evenement_id" in l) && l.message && l.lieu && l.version),
    "erreurs des 7 jours, avec slug, message, endroit et version", err.length);
  dit(err.find((l) => l.slug === "a").nombre === 7, "erreurs : le nombre d'occurrences suit");
  dit((await lis(jeton, "erreurs", { slug: "b" })).length === 1, "erreurs : p_slug filtre");
  dit((await lis(jeton, "erreurs", { de: "2000-01-01" })).length === 3, "erreurs : les bornes de dates valent comme ailleurs");
  dit(await lis("0".repeat(64), "erreurs") === null, "erreurs : un faux jeton n'apprend rien");
  const salons = await lis(jeton, "salons");
  dit(salons.length === 2 && salons[0].slug === "a" && Object.keys(salons[0]).sort().join() === "id,nom,slug",
    "salons : id, slug, nom seulement", JSON.stringify(salons[0]));

  // --- filtres
  const deB = await lis(jeton, "releves", { slug: "b" });
  dit(deB.length === 1 && deB[0].slug === "b", "p_slug filtre");
  dit((await lis(jeton, "releves", { slug: "inconnu" })).length === 0, "un slug inconnu rend une liste vide");
  const aujourdhui = (await un("select current_date::text d")).d;
  dit((await lis(jeton, "releves", { de: aujourdhui, a: aujourdhui })).length === 2, "bornes de dates : aujourd'hui seulement");
  const large = await lis(jeton, "releves", { de: "2000-01-01" });
  dit(large.length === 5, "au-delà de 90 jours d'écart, la borne remonte à 90 jours (le relevé de 20 jours entre)", large.length);
  await releve(A, 95, 800);
  dit((await lis(jeton, "releves", { de: "2000-01-01" })).length === 5, "un relevé de 95 jours reste hors d'atteinte");

  // --- limite et pagination
  dit((await lis(jeton, "releves", { limite: 2 })).length === 2, "p_limite borne la page");
  dit((await lis(jeton, "releves", { limite: 0 })).length === 1, "p_limite < 1 devient 1");
  const toutes = await lis(jeton, "releves", { limite: 1000 });
  const p1 = await lis(jeton, "releves", { limite: 3, decalage: 0 });
  const p2 = await lis(jeton, "releves", { limite: 3, decalage: 3 });
  dit(JSON.stringify([...p1, ...p2]) === JSON.stringify(toutes), "la pagination recolle sans trou ni doublon");
  dit((await lis(jeton, "releves", { decalage: -5 })).length === 4, "p_decalage négatif devient 0");
  // limite plafonnée à 2000
  await db.query("insert into releve_perf (evenement_id, visite, jour, page, resume) select $1, gen_random_uuid(), current_date, 'plan', '{}' from generate_series(1, 2100)", [A]);
  dit((await lis(jeton, "releves", { limite: 100000 })).length === 2000, "p_limite plafonné à 2000");

  // --- erreur claire
  dit(/p_quoi/.test(await refuse(() => lis(jeton, "tout"))), "un autre p_quoi donne une erreur claire");
  dit(await lis("0".repeat(64), "tout") === null, "…mais un faux jeton n'apprend rien : null d'abord");

  // --- droits
  // base.js ne simule pas les privilèges par défaut de Supabase sur les tables :
  // on les donne, puis on rejoue la migration, qui doit les reprendre.
  await db.exec("grant all on lecteur_perf to anon, authenticated");
  await db.exec(fs.readFileSync(path.join(MIGRATIONS, fs.readdirSync(MIGRATIONS).find((f) => f.endsWith("_lecture_des_performances.sql"))), "utf8"));
  const refus = async (sql) => /permission denied/i.test(await refuse(() => anon(sql)));
  dit(await refus("select * from lecteur_perf"), "anon ne lit pas lecteur_perf");
  dit(await refus("select lecteur_perf_nouveau('pirate')"), "anon n'appelle pas lecteur_perf_nouveau");
  dit(await refus("select lecteur_perf_retire('claude')"), "anon n'appelle pas lecteur_perf_retire");
  await db.exec("set role authenticated");
  const authRefus = /permission denied/i.test(await refuse(() => db.query("select lecteur_perf_nouveau('pirate')")));
  await db.exec("reset role");
  dit(authRefus, "authenticated n'appelle pas lecteur_perf_nouveau");

  const nul = async (sql) => { const r = await refuse(() => anon(sql)); return /permission denied/i.test(r); };
  dit(await nul("insert into lecteur_perf (empreinte, nom) values ('x', 'y')"), "anon n'écrit pas dans lecteur_perf");

  // --- une table temporaire ne se substitue pas au registre
  const faux = "ab".repeat(32);
  await db.exec("grant temp on database postgres to anon").catch(() => {});
  await db.exec("set role anon");
  let temp = "";
  try {
    await db.exec("create temp table lecteur_perf (empreinte text, nom text, cree timestamptz)");
    await db.query("insert into lecteur_perf values (encode(sha256(convert_to($1, 'UTF8')), 'hex'), 'faux', now())", [faux]);
  } catch (e) { temp = e.message; }
  let vu;
  try { vu = (await db.query("select lecture_perf($1, 'salons') as r", [faux])).rows[0].r; }
  finally { await db.exec("drop table if exists pg_temp.lecteur_perf"); await db.exec("reset role"); }
  dit(vu === null, "une table temporaire lecteur_perf ne fait pas accepter un jeton inventé", temp || "table temporaire créée");

  // --- jeton démesuré ou mal formé : refusé sans être haché
  dit(await lis("a".repeat(5000000), "salons") === null && await lis("A".repeat(64), "salons") === null,
    "un jeton hors du format [0-9a-f]{64} est refusé");

  // --- le jeton n'est pas gardé
  const ligne = await un("select * from lecteur_perf where nom = 'claude'");
  dit(ligne && !JSON.stringify(ligne).includes(jeton) && /^[0-9a-f]{64}$/.test(ligne.empreinte) && ligne.empreinte !== jeton,
    "la table garde une empreinte, jamais le jeton");

  // --- remplacement et retrait
  const jeton2 = (await un("select lecteur_perf_nouveau('claude') as j")).j;
  dit(jeton2 !== jeton && +(await un("select count(*) n from lecteur_perf")).n === 1, "recréer sous le même nom remplace");
  dit(await lis(jeton, "releves") === null, "l'ancien jeton ne sert plus");
  dit(await lis(jeton2, "releves") !== null, "le nouveau sert");
  dit((await un("select lecteur_perf_retire('claude') as r")).r === true, "le retrait rend vrai");
  dit(await lis(jeton2, "releves") === null, "après retrait le jeton ne sert plus");
  dit((await un("select lecteur_perf_retire('claude') as r")).r === false, "retirer un absent rend faux");
  dit(/nom/.test(await refuse(() => db.query("select lecteur_perf_nouveau('')"))), "un nom vide est refusé");

  // --- rien d'écrit
  dit(+(await un("select count(*) n from releve_perf where evenement_id = $1", [B])).n === 1, "la lecture n'a rien écrit ni retiré");

  // --- rejeu
  const fichier = fs.readdirSync(MIGRATIONS).find((f) => f.endsWith("_lecture_des_performances.sql"));
  let erreur = "";
  try {
    const sql = fs.readFileSync(path.join(MIGRATIONS, fichier || "absente.sql"), "utf8");
    await db.exec(sql); await db.exec(sql);
  } catch (e) { erreur = e.message; }
  dit(!erreur, "la migration rejouée deux fois ne produit aucune erreur", erreur);
  /* La lecture des erreurs redéfinit la porte en entier : rejouée par-dessus
     l'ancienne, elle doit la rendre telle qu'elle était, la branche en plus. */
  const suite = fs.readdirSync(MIGRATIONS).find((f) => f.endsWith("_les_erreurs_des_pages_lues_par_jeton.sql"));
  let erreurSuite = "";
  try {
    const sql = fs.readFileSync(path.join(MIGRATIONS, suite || "absente.sql"), "utf8");
    await db.exec(sql); await db.exec(sql);
  } catch (e) { erreurSuite = e.message; }
  dit(!erreurSuite, "la lecture des erreurs rejouée deux fois ne produit aucune erreur", erreurSuite);
  const jeton3 = (await un("select lecteur_perf_nouveau('claude') as j")).j;
  dit((await lis(jeton3, "erreurs")).length === 2 && (await lis(jeton3, "releves")).length > 0,
    "après rejeu, les erreurs comme les relevés se lisent");

  await db.close();
  if (ko) { console.log("\n" + ko + " échec(s)"); process.exit(1); }
  console.log("\nLa lecture des performances ne répond qu'au jeton.");
}

main().catch((e) => { console.error(e); process.exit(1); });
