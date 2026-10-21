/**
 * La base de la sonde de performance : une visite par ligne, sous quotas.
 *
 * Rejoue toutes les migrations dans PGlite (`base.js`) puis éprouve les portes
 * `sonde_publique` et `sonde_enregistre` : remplacement d'une visite connue,
 * refus des résumés trop gros ou des salons non publiés, quotas par page,
 * tirage au-delà des cent premières visites, et le passage de minuit.
 *
 *   node outils/essais/sonde-base.js     (chaîné dans `npm run essais`)
 */
const fs = require("fs");
const path = require("path");
const { baseNeuve, MIGRATIONS } = require("./base.js");

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
  const SALON = (await un(
    "insert into evenement (nom, slug, instance, etat, fuseau) values ('Salon', 'salon', 'x', 'publie', 'Europe/Paris') returning id")).id;
  const BROUILLON = (await un(
    "insert into evenement (nom, slug, instance, etat) values ('Brouillon', 'brouillon', 'x', 'brouillon') returning id")).id;

  const resume = (affiche) => ({
    format: "sonde-plan/1", page: "plan", support: "web",
    chargement: { jalons: { "plan-affiche": affiche, donnees: 300 }, transfertKo: 812 },
    fluidite: { classique: { partPlus33: 0.05 }, immersif: { partPlus33: 0.2 } },
    gels: { n: 2 }, gpu: { repeints: { p95: 9.5 }, gpuMsP95: 4.5, pertesContexte: 1 },
    appareil: { mobile: true }, plan: { immersifUtilise: false },
  });
  // la porte publique, appelée comme le Worker : avec la clé publique
  const publique = async (slug, page, visite, r) => {
    await db.exec("set role anon");
    try {
      return (await db.query("select sonde_publique($1, $2, 'abc123', $3, $4::jsonb) as ok",
        [slug, page, visite, r === null ? null : JSON.stringify(r)])).rows[0].ok;
    } finally { await db.exec("reset role"); }
  };
  const interne = async (page, visite, r) =>
    (await db.query("select sonde_enregistre($1, $2, 'abc123', $3, $4::jsonb) as ok",
      [SALON, page, visite, JSON.stringify(r)])).rows[0].ok;
  const lignes = async (page) =>
    +(await un("select count(*) n from releve_perf where evenement_id = $1 and page = $2", [SALON, page])).n;
  const jour = async (page) => await un(
    "select coalesce(sum(recues),0)::int recues, coalesce(sum(ecartees),0)::int ecartees from perf_jour where evenement_id = $1 and page = $2",
    [SALON, page]);

  // --- une visite neuve
  const v1 = uuid();
  dit(await publique("salon", "plan", v1, resume(1500)) === true, "une visite neuve d'un salon publié entre");
  const l1 = await un("select * from releve_perf where visite = $1", [v1]);
  dit(l1 && l1.affiche_ms === 1500, "affiche_ms vient de chargement.jalons[plan-affiche]", l1 && l1.affiche_ms);
  dit(l1 && l1.donnees_ms === 300 && l1.transfert_ko === 812 && l1.gels === 2 && l1.pertes_contexte === 1,
    "les autres colonnes entières viennent du résumé");
  dit(l1 && Math.abs(l1.part_plus33_classique - 0.05) < 1e-6 && Math.abs(l1.part_plus33_immersif - 0.2) < 1e-6
      && Math.abs(l1.repeint_ms_p95 - 9.5) < 1e-6 && Math.abs(l1.gpu_ms_p95 - 4.5) < 1e-6,
    "les colonnes décimales viennent du résumé");
  dit(l1 && l1.mobile === true && l1.immersif === false && l1.support === "web" && l1.version === "abc123",
    "mobile, immersif, support et version sont rangés");

  // --- le même envoi renvoyé : une ligne, remplacée
  const jourAvant = await jour("plan");
  await db.exec("update releve_perf set maj = maj - interval '1 minute'");
  const majAvant = (await un("select maj from releve_perf where visite = $1", [v1])).maj;
  dit(await publique("salon", "plan", v1, resume(2200)) === true, "le renvoi d'une visite connue rend vrai");
  const l2 = await un("select * from releve_perf where visite = $1", [v1]);
  dit(await lignes("plan") === 1, "une seule ligne pour la visite renvoyée");
  dit(l2.maj > majAvant, "maj avance au renvoi");
  dit(l2.affiche_ms === 2200, "le résumé est remplacé", l2.affiche_ms);
  const jourApres = await jour("plan");
  dit(jourApres.recues === jourAvant.recues && jourApres.ecartees === jourAvant.ecartees,
    "perf_jour ne bouge pas au renvoi", JSON.stringify(jourApres));

  // --- refus
  dit(await publique("brouillon", "plan", uuid(), resume(1)) === false, "un salon non publié est refusé");
  dit(await un("select count(*)::int n from releve_perf where evenement_id = $1", [BROUILLON]).then((r) => r.n) === 0,
    "aucune ligne pour le salon non publié");
  dit(await publique("inconnu", "plan", uuid(), resume(1)) === false, "un salon inconnu est refusé");
  // la taille se mesure sur le jsonb sérialisé par Postgres (espaces compris), comme la porte
  const octets = async (r) =>
    Buffer.byteLength((await db.query("select $1::jsonb::text t", [JSON.stringify(r)])).rows[0].t);
  const gros = resume(1);
  gros.bruit = "";
  gros.bruit = "x".repeat(4097 - await octets(gros));
  const taille = await octets(gros);
  dit(taille === 4097, "(le résumé d'essai fait bien 4097 octets sérialisé)", taille);
  dit(await publique("salon", "plan", uuid(), gros) === false, "un résumé de 4097 octets est refusé");
  dit(await publique("salon", "plan", null, resume(1)) === false, "une visite nulle est refusée");
  dit(await publique("salon", "autre", uuid(), resume(1)) === false, "une page inconnue est refusée");
  dit(await publique("salon", "admin", uuid(), resume(1)) === false, "la porte publique n'ouvre pas la page admin");
  dit(await publique("salon", "plan", uuid(), null) === false, "un résumé nul est refusé");
  const nBase = await lignes("plan");
  dit(nBase === 1, "les refus n'ont écrit aucune ligne");

  // --- quota de la page plan : cent sûres, puis tirage jusqu'à 300
  let entrees = 0;
  for (let i = 0; i < 99; i++) if (await publique("salon", "plan", uuid(), resume(i))) entrees++;
  dit(entrees === 99 && await lignes("plan") === 100, "les 100 premières visites du plan entrent toutes");
  await db.exec("select setseed(0.5)");
  for (let i = 0; i < 400; i++) await publique("salon", "plan", uuid(), resume(i));
  const jp = await jour("plan");
  dit(await lignes("plan") <= 300, "le plan ne dépasse jamais 300 lignes", await lignes("plan"));
  dit(await lignes("plan") > 100, "le tirage en laisse entrer au-delà de 100", await lignes("plan"));
  dit(jp.recues + jp.ecartees === 500, "recues + ecartees = 500", JSON.stringify(jp));
  dit(jp.recues === await lignes("plan"), "recues égale le nombre de lignes");

  // --- admin et borne : 50 par jour, indépendants du plan
  const avantPlan = (await jour("plan")).recues;
  let admin = 0;
  for (let i = 0; i < 60; i++) if (await interne("admin", uuid(), resume(i))) admin++;
  const ja = await jour("admin");
  dit(await lignes("admin") === 50 && admin === 50, "60 visites admin : 50 lignes", await lignes("admin"));
  dit(ja.recues === 50 && ja.ecartees === 10, "dix visites admin écartées", JSON.stringify(ja));
  dit((await jour("plan")).recues === avantPlan, "les visites admin ne réduisent pas le quota plan");
  let borne = 0;
  for (let i = 0; i < 55; i++) if (await publique("salon", "borne", uuid(), resume(i))) borne++;
  dit(borne === 50 && (await jour("borne")).ecartees === 5, "55 visites de borne : 50 entrent", borne);

  // --- minuit : un renvoi le lendemain ne déplace pas la visite
  // (un salon à part : les quotas des autres sont pleins)
  const SOIR = (await un(
    "insert into evenement (nom, slug, instance, etat, fuseau) values ('Soir', 'soir', 'x', 'publie', 'Europe/Paris') returning id")).id;
  const vm = uuid();
  await publique("soir", "borne", vm, resume(1));
  const jm = (await un("select jour from releve_perf where visite = $1", [vm])).jour;
  await db.exec("update releve_perf set jour = jour - 1 where visite = '" + vm + "'");
  const avantBorne = JSON.stringify((await db.query("select * from perf_jour where evenement_id = $1 order by jour", [SOIR])).rows);
  const rejoue = await publique("soir", "borne", vm, resume(7));
  const lm = await un("select jour, affiche_ms from releve_perf where visite = $1", [vm]);
  dit(rejoue === true && lm.affiche_ms === 7, "le renvoi après minuit remplace le résumé");
  dit(String(lm.jour) !== String(jm), "la ligne garde son jour d'origine", String(lm.jour));
  dit(JSON.stringify((await db.query("select * from perf_jour where evenement_id = $1 order by jour", [SOIR])).rows) === avantBorne,
    "perf_jour du jour suivant n'est pas touché");

  // --- lecture : RLS réservée à qui a accès au salon
  await db.exec("set role anon");
  let anon = 0;
  try { anon = (await db.query("select count(*)::int n from releve_perf")).rows[0].n; } catch { anon = -1; }
  await db.exec("reset role");
  dit(anon <= 0, "le public ne lit pas les relevés", anon);

  // --- la migration rejouée une seconde fois
  const fichier = fs.readdirSync(MIGRATIONS).find((f) => f.endsWith("_sonde_de_performance.sql"));
  let erreur = "";
  try { await db.exec(fs.readFileSync(path.join(MIGRATIONS, fichier || "absente.sql"), "utf8")); }
  catch (e) { erreur = e.message; }
  dit(!erreur, "la migration rejouée une seconde fois ne produit aucune erreur", erreur);

  await db.close();
  if (ko) { console.log("\n" + ko + " échec(s)"); process.exit(1); }
  console.log("\nLa base de la sonde tient ses quotas.");
}

main().catch((e) => { console.error(e); process.exit(1); });
