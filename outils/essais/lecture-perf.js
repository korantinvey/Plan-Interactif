/**
 * La lecture des performances par jeton : `lecture_perf` et son registre.
 *
 * Rejoue les migrations dans PGlite (`base.js`) puis éprouve la porte que la
 * clé publiable atteint : refus muet sans jeton valable, lecture seule des
 * relevés, bilans, quotas, erreurs et salons avec leur `slug`, filtres, bornes,
 * pagination, et le fait que le jeton ne se retrouve jamais en clair dans la
 * base ni n'est émis par un autre rôle que le propriétaire. Et les compteurs
 * d'usage : fréquentation, audience, visiteurs uniques exacts à chaque niveau,
 * sans qu'aucun jeton de visiteur ne sorte.
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

  // --- compteurs d'usage
  const heure = "date_trunc('hour', now())";
  const compte = (evt, decalageJours, genre, canal, support, n) => db.query(
    `insert into compteur (evenement_id, heure, genre, canal, support, n) values ($1, ${heure} - $2::int * interval '1 day', $3, $4, $5, $6)`,
    [evt, decalageJours, genre, canal, support, n]);
  await compte(A, 0, "visite", "", "web", 3); await compte(A, 0, "recherche", "", "integre", 2);
  await compte(B, 0, "visite", "", "web", 1); await compte(A, 20, "visite", "", "web", 9);
  const cpt = await lis(jeton, "compteurs");
  dit(cpt.length === 3 && cpt.every((l) => Object.keys(l).sort().join() === "canal,genre,heure,n,slug,support"),
    "compteurs des 7 jours : heure, genre, canal, porte, nombre, slug — rien d'autre", JSON.stringify(cpt[0]));
  dit((await lis(jeton, "compteurs", { slug: "a" })).reduce((t, l) => t + l.n, 0) === 5, "compteurs : p_slug filtre");
  dit((await lis(jeton, "compteurs", { de: "2000-01-01" })).length === 4, "compteurs : les bornes de dates valent comme ailleurs");

  await db.query("insert into cible (evenement_id, genre, id, code, nom) values ($1, 'fiche_stand', 's1', 'B12', 'Acme')", [A]);
  const vise = (genre, canal, n) => db.query(
    "insert into compteur_cible (evenement_id, genre, objet, cible, jour, canal, n) values ($1, $2, 'fiche_stand', 's1', current_date, $3, $4)",
    [A, genre, canal, n]);
  await vise("fiche_stand", "liste", 4); await vise("itineraire", "", 1);
  const aud = await lis(jeton, "audience");
  dit(aud.length === 2 && aud.every((l) => l.slug === "a" && l.code === "B12" && l.nom === "Acme" && !("evenement_id" in l)),
    "audience : par stand, avec son numéro et son nom", JSON.stringify(aud[0]));
  dit(aud.find((l) => l.genre === "fiche_stand").n === 4 && aud.find((l) => l.genre === "fiche_stand").canal === "liste",
    "audience : le geste, le canal et le nombre suivent");

  const passe = (decalageJours, jetonV, support, parcours, retenu) => db.query(
    "insert into visiteur_jour (evenement_id, jour, visiteur, support, parcours, retenu) values ($1, current_date - $2::int, $3, $4, $5, $6)",
    [A, decalageJours, jetonV, support, parcours, retenu]);
  await passe(0, "jeton-secret-1", "web", false, true); await passe(0, "jeton-secret-1", "integre", false, true);
  await passe(0, "jeton-secret-2", "web", true, false); await passe(1, "jeton-secret-1", "web", false, true);
  const vis = await lis(jeton, "visiteurs");
  const niveau = (jour, support) => vis.find((l) => l.jour === jour && l.support === support);
  dit(!JSON.stringify(vis).includes("jeton-secret"), "visiteurs : aucun jeton ne sort");
  dit(niveau(null, null)?.visiteurs === 2, "visiteurs : sur la fenêtre, un visiteur venu deux jours compte une fois", JSON.stringify(niveau(null, null)));
  dit(niveau(aujourdhui, null)?.visiteurs === 2 && niveau(aujourdhui, null).volatils === 1 && niveau(aujourdhui, null).avec_parcours === 1,
    "visiteurs : le jour, toutes portes, avec volatils et programmes", JSON.stringify(niveau(aujourdhui, null)));
  dit(niveau(aujourdhui, "web")?.visiteurs === 2 && niveau(aujourdhui, "integre")?.visiteurs === 1,
    "visiteurs : le jour, porte par porte");
  dit(vis.length === 6, "visiteurs : un total, puis chaque jour toutes portes et porte par porte (1 + 1 + 2 + 1 + 1)", vis.length);
  const v1 = await lis(jeton, "visiteurs", { limite: 2 });
  const v2 = await lis(jeton, "visiteurs", { limite: 2, decalage: 2 });
  const v3 = await lis(jeton, "visiteurs", { limite: 2, decalage: 4 });
  dit(JSON.stringify([...v1, ...v2, ...v3]) === JSON.stringify(vis), "visiteurs : la pagination recolle sans trou ni doublon");
  dit((await lis(jeton, "visiteurs", { slug: "b" })).length === 0, "visiteurs : p_slug filtre");

  const touche = (decalageJours, canal, jetonV) => db.query(
    "insert into visiteur_cible (evenement_id, objet, cible, genre, canal, jour, visiteur) values ($1, 'fiche_stand', 's1', 'fiche_stand', $2, current_date - $3::int, $4)",
    [A, canal, decalageJours, jetonV]);
  await touche(0, "liste", "jeton-secret-1"); await touche(0, "recherche", "jeton-secret-1");
  await touche(0, "liste", "jeton-secret-2"); await touche(1, "liste", "jeton-secret-1");
  const vc = await lis(jeton, "visiteurs_cible");
  dit(!JSON.stringify(vc).includes("jeton-secret"), "visiteurs par stand : aucun jeton ne sort");
  dit(vc.find((l) => l.jour === null)?.visiteurs === 2 && vc.find((l) => l.jour === null).code === "B12",
    "visiteurs par stand : sur la fenêtre, deux canaux et deux jours ne recomptent pas", JSON.stringify(vc.find((l) => l.jour === null)));
  dit(vc.find((l) => l.jour === aujourdhui)?.visiteurs === 2 && vc.length === 3, "visiteurs par stand : jour par jour", vc.length);
  dit(await lis("0".repeat(64), "visiteurs") === null && await lis("0".repeat(64), "compteurs") === null,
    "compteurs : un faux jeton n'apprend rien");

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
  /* La lecture des compteurs redéfinit à son tour la porte : rejouée, elle
     rend les branches d'avant et les siennes. */
  const compteurs = fs.readdirSync(MIGRATIONS).find((f) => f.endsWith("_les_compteurs_d_usage_lus_par_jeton.sql"));
  let erreurCompteurs = "";
  try {
    const sql = fs.readFileSync(path.join(MIGRATIONS, compteurs || "absente.sql"), "utf8");
    await db.exec(sql); await db.exec(sql);
  } catch (e) { erreurCompteurs = e.message; }
  dit(!erreurCompteurs, "la lecture des compteurs rejouée deux fois ne produit aucune erreur", erreurCompteurs);
  dit((await lis(jeton3, "erreurs")).length === 2 && (await lis(jeton3, "visiteurs")).length === 6,
    "après rejeu, les erreurs comme les visiteurs se lisent");

  await db.close();
  if (ko) { console.log("\n" + ko + " échec(s)"); process.exit(1); }
  console.log("\nLa lecture des performances ne répond qu'au jeton.");
}

main().catch((e) => { console.error(e); process.exit(1); });
