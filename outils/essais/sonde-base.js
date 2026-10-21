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
const { baseNeuve, commeCompte, MIGRATIONS } = require("./base.js");

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

  // --- le plafond de 300 : 500 visites n'y arrivent pas, on le fait donc mordre
  // à la main (un salon à part, compte du jour posé à 299, probabilité 100/299
  // par visite : sans plafond, plusieurs des quarante entreraient)
  const PLAFOND = (await un(
    "insert into evenement (nom, slug, instance, etat, fuseau) values ('Plafond', 'plafond', 'x', 'publie', 'Europe/Paris') returning id")).id;
  await publique("plafond", "plan", uuid(), resume(1));
  await db.query("update perf_jour set recues = 299 where evenement_id = $1 and page = 'plan'", [PLAFOND]);
  await db.exec("select setseed(0.5)");
  let passees = 0;
  for (let i = 0; i < 40; i++) if (await publique("plafond", "plan", uuid(), resume(i))) passees++;
  const jpl = await un("select recues, ecartees from perf_jour where evenement_id = $1 and page = 'plan'", [PLAFOND]);
  dit(passees === 1 && jpl.recues === 300, "à 299 reçues, une seule visite de plus entre", passees + " / " + JSON.stringify(jpl));
  dit(jpl.ecartees === 39, "les suivantes sont écartées et comptées", JSON.stringify(jpl));

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

  // === la porte de l'admin, le bilan de nuit, la lecture, la purge ===
  // Supabase donne aux rôles les droits par défaut sur les tables du schéma
  // public ; PGlite non. On les pose, pour que la RLS soit seule à décider.
  await db.exec("grant select on all tables in schema public to authenticated; grant usage on schema public to authenticated, anon");
  // le premier compte devient administrateur (déclencheur), le second non
  const ADMIN = (await un("insert into auth.users (email) values ('admin@x.fr') returning id")).id;
  const AUTRE = (await un("insert into auth.users (email) values ('autre@x.fr') returning id")).id;
  await db.query("select (select role from profil where id = $1) = 'admin' as a", [ADMIN]).then((r) =>
    dit(r.rows[0].a === true, "(le premier compte d'essai est administrateur)"));
  await db.query("insert into evenement (nom, slug, instance, etat, fuseau) values ('Pas publié', 'pas-publie', 'x', 'brouillon', 'Europe/Paris')");
  const parAdmin = async (slug, visite, r) => (await db.query(
    "select sonde_admin($1, 'abc123', $2, $3::jsonb) as ok", [slug, visite, JSON.stringify(r)])).rows[0].ok;
  const sansCompte = async () => { await db.query("select set_config('request.jwt.claim.sub', '', false)"); };

  await commeCompte(db, ADMIN);
  const va = uuid();
  dit(await parAdmin("pas-publie", va, resume(900)) === true, "l'administrateur mesure un salon non publié");
  const la = await un("select page, affiche_ms from releve_perf where visite = $1", [va]);
  dit(la && la.page === "admin" && la.affiche_ms === 900, "la ligne est rangée sous la page admin", JSON.stringify(la));
  await sansCompte();
  const vb = uuid();
  dit(await parAdmin("pas-publie", vb, resume(1)) === false, "sans compte connecté, sonde_admin refuse");
  await commeCompte(db, AUTRE);
  dit(await parAdmin("pas-publie", vb, resume(1)) === false, "un compte sans accès au salon est refusé");
  dit(await parAdmin("inconnu", vb, resume(1)) === false, "un salon inconnu est refusé");
  dit((await un("select count(*)::int n from releve_perf where visite = $1", [vb])).n === 0, "aucune ligne écrite par les refus");
  const droits = await un(`select has_function_privilege('anon', 'sonde_admin(text,text,uuid,jsonb)', 'execute') a,
    has_function_privilege('authenticated', 'sonde_admin(text,text,uuid,jsonb)', 'execute') b`);
  dit(droits.a === false && droits.b === true, "sonde_admin n'est exécutable que par authenticated", JSON.stringify(droits));
  await commeCompte(db, ADMIN);

  // --- trente visites fabriquées la veille
  const veille = (await un("select (current_date - 1) j")).j;
  const CARTES = [["Google", "ANGLE (Mali-G78)", "Android"], ["Apple", "Apple GPU", "iOS"]];
  const fab = [];
  for (let i = 0; i < 30; i++) {
    const mobile = i % 2 === 0, imm = i % 3 === 0, c = CARTES[i % 4 < 2 ? 0 : 1];
    const affiche = 1000 + i * 100;
    const r = {
      format: "sonde-plan/1", page: "plan", support: "web",
      chargement: { jalons: { reponse: 100 + i, donnees: 400, "plan-affiche": affiche }, transfertKo: 500 + i,
        lourds: [{ fichier: "logos.png", transfertKo: 200 + i }, ...(i < 5 ? [{ fichier: "fond.jpg", transfertKo: 90 }] : []),
                 { fichier: "rare" + i + ".svg", transfertKo: 10 }] },
      fluidite: { classique: { partPlus33: 0.1 + (i % 4) / 100 }, immersif: { partPlus33: 0.3 } },
      gels: { n: i % 3 }, gpu: { repeints: { p95: 8 }, gpuMsP95: 4, pertesContexte: i === 0 ? 1 : 0 },
      appareil: { mobile, systeme: c[2], carte: { fabricant: c[0], puce: c[1] } }, plan: { immersifUtilise: imm },
    };
    fab.push({ mobile, imm, affiche });
    await db.query(
      "insert into releve_perf (evenement_id, visite, jour, page, mobile, immersif, affiche_ms, donnees_ms, transfert_ko, part_plus33_classique, part_plus33_immersif, gels, pertes_contexte, resume) values ($1,$2,$3,'plan',$4,$5,$6,400,$7,$8,0.3,$9,$10,$11::jsonb)",
      [SALON, uuid(), veille, mobile, imm, affiche, 500 + i, 0.1 + (i % 4) / 100, i % 3, i === 0 ? 1 : 0, JSON.stringify(r)]);
  }
  const mediane = (a) => { const t = [...a].sort((x, y) => x - y), m = t.length / 2; return t.length % 2 ? t[(t.length - 1) / 2] : (t[m - 1] + t[m]) / 2; };
  await db.query("select bilan_perf($1::date)", [veille]);
  const bil = (await db.query("select * from perf_bilan where evenement_id = $1 and jour = $2 order by page, mobile", [SALON, veille])).rows;
  dit(bil.length === 2, "un bilan par page et par support (mobile, bureau)", bil.length);
  dit(bil.reduce((a, b) => a + b.visites, 0) === 30, "les visites du bilan font 30", bil.map((b) => b.visites).join("+"));
  const bm = bil.find((b) => b.mobile === true), bb = bil.find((b) => b.mobile === false);
  dit(bm.visites === 15 && bb.visites === 15, "quinze visites mobile, quinze bureau");
  const mm = mediane(fab.filter((f) => f.mobile).map((f) => f.affiche));
  dit(Math.abs(bm.affiche_p50 - mm) < 1e-6, "affiche_p50 mobile est la médiane calculée", bm.affiche_p50 + " / " + mm);
  dit(bm.affiche_p90 >= bm.affiche_p50 && bm.donnees_p50 === 400 && bm.pertes_contexte === 1, "p90, données et pertes de contexte",
    bm.affiche_p90 + " " + bm.donnees_p50 + " " + bm.pertes_contexte);
  const dm = bm.detail;
  dit(dm.lourds[0].fichier === "logos.png" && dm.lourds[0].visites === 15, "le fichier lourd le plus fréquent vient en tête", JSON.stringify(dm.lourds[0]));
  dit(dm.lourds.length === 10 && dm.appareils.length >= 1 && dm.appareils.length <= 10, "au plus dix lourds et dix appareils", dm.lourds.length + "/" + dm.appareils.length);
  dit(dm.appareils.every((a) => a.carte && a.famille && a.visites > 0), "chaque appareil dit sa carte, sa famille, ses visites", JSON.stringify(dm.appareils[0]));
  dit(dm.vues.classique.p50 !== undefined && dm.vues.immersif.p90 !== undefined, "les deux vues ont leurs centiles");
  const e = dm.etapes;
  dit(e.donnees.p50 === 400 && e.affichage.p50 === bm.affiche_p50 && Math.abs(e.preparation.p50 - (bm.affiche_p50 - 400)) < 1e-6
      && e.reponse.p50 >= 100, "les étapes dérivent des jalons", JSON.stringify(e));
  const tout = async () => JSON.stringify((await db.query("select * from perf_bilan order by evenement_id, jour, page, mobile")).rows);
  const avant = await tout();
  await db.query("select bilan_perf($1::date)", [veille]);
  dit(await tout() === avant, "bilan_perf rejoué : mêmes lignes, pas de doublon");

  // --- la lecture, par la RLS elle-même
  const periode = async (compte, evt) => {
    await commeCompte(db, compte);
    await db.exec("set role authenticated");
    try { return (await db.query("select performances_du_salon($1, 7) as p", [evt])).rows[0].p; }
    finally { await db.exec("reset role"); }
  };
  const pAdmin = await periode(ADMIN, SALON);
  dit(pAdmin.bilans.length >= 2, "l'administrateur lit les bilans du salon", pAdmin.bilans.length);
  dit(typeof pAdmin.recues === "number" && typeof pAdmin.ecartees === "number" && pAdmin.aujourdhui && pAdmin.aujourdhui.etapes !== undefined,
    "recues, ecartees et aujourdhui sont rendus");
  const pAutre = await periode(AUTRE, SALON);
  dit(pAutre.bilans.length === 0, "un compte sans accès ne lit aucun bilan", pAutre.bilans.length);
  dit(pAutre.recues === 0 && pAutre.ecartees === 0, "ni quota ni relevé du salon", pAutre.recues + "/" + pAutre.ecartees);
  await db.exec("set role authenticated");
  const vus = (await db.query("select count(*)::int n from releve_perf where evenement_id = $1", [SALON])).rows[0].n;
  await db.exec("reset role");
  dit(vus === 0, "la RLS cache les relevés au compte sans accès (rôle authenticated)", vus);
  await commeCompte(db, ADMIN);
  await db.exec("set role authenticated");
  const vusAdmin = (await db.query("select count(*)::int n from releve_perf where evenement_id = $1", [SALON])).rows[0].n;
  await db.exec("reset role");
  dit(vusAdmin > 0, "et les montre à l'administrateur", vusAdmin);

  // --- la purge : 31 jours de relevé, 91 jours de bilan s'effacent ; 29 et 89 restent
  const vieux = uuid(), recent = uuid();
  for (const [v, age] of [[vieux, 31], [recent, 29]])
    await db.query("insert into releve_perf (evenement_id, visite, jour, page, resume) values ($1,$2,current_date - $3::int,'borne','{}')", [SALON, v, age]);
  for (const age of [91, 89])
    await db.query("insert into perf_bilan (evenement_id, jour, page, mobile, visites) values ($1,current_date - $2::int,'borne',false,1)", [SALON, age]);
  await db.query("insert into perf_jour (evenement_id, jour, page) values ($1,current_date - 91,'borne'), ($1,current_date - 89,'borne')", [SALON]);
  await db.query("select purge_perf()");
  const reste = async (v) => (await un("select count(*)::int n from releve_perf where visite = $1", [v])).n;
  dit(await reste(vieux) === 0 && await reste(recent) === 1, "purge_perf : relevé de 31 jours effacé, celui de 29 gardé");
  const b91 = (await un("select count(*)::int n from perf_bilan where jour = current_date - 91")).n;
  const b89 = (await un("select count(*)::int n from perf_bilan where jour = current_date - 89")).n;
  dit(b91 === 0 && b89 === 1, "purge_perf : bilan de 91 jours effacé, celui de 89 gardé", b91 + "/" + b89);
  const j91 = (await un("select count(*)::int n from perf_jour where jour = current_date - 91")).n;
  dit(j91 === 0, "purge_perf efface aussi perf_jour de 91 jours");
  const encore = (await un("select count(*)::int n from perf_bilan where jour = $1 and evenement_id = $2", [veille, SALON])).n;
  dit(encore === 2, "le bilan de la veille est produit puis gardé", encore);

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
