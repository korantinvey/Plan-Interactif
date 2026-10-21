/**
 * La fiche de pistes hebdomadaire, sur des relevés fabriqués.
 *
 * Chaque règle doit produire sa piste quand son indicateur passe le seuil, et
 * se taire sinon ; les pistes se classent par gain ; une version qui dégrade
 * un indicateur se signale avec les deux versions ; et la fiche, publiée dans
 * un dépôt public, ne nomme aucun salon.
 *
 *   node outils/essais/performances.js     (chaîné dans `npm run essais`)
 */
const { indicateurs, corps, etiquette, lundiMesure, REQUETE } = require("../performances.js");
const { baseNeuve } = require("./base.js");
const { pistes, regressions } = require("../performances-regles.js");

let ko = 0;
const dit = (ok, q, d) => {
  console.log((ok ? "  ok   " : "  ÉCHEC") + "  " + q + (d ? "   → " + d : ""));
  if (!ok) ko++;
};

// la fiche se fait le lundi 26 octobre : la semaine mesurée commence le lundi 19
const AU = "2026-10-26";
const SALON = "7d1c2a4e-5b6f-4c3d-9e8a-1b2c3d4e5f60";
const AUTRE = "0a9b8c7d-6e5f-4a3b-8c2d-1e0f9a8b7c6d";

/** Un relevé ordinaire, qui ne déclenche rien ; chaque essai en change un trait. */
const releve = (o = {}) => ({
  evenement_id: SALON, slug: "fep27", jour: "2026-10-20", page: "plan", mobile: false,
  immersif: false, version: "aaaa111", recu: "2026-10-20T09:00:00Z",
  affiche_ms: 1800, donnees_ms: 900, transfert_ko: 600,
  part_plus33_classique: 5, part_plus33_immersif: null, gels: 0,
  repeint_ms_p95: 12, gpu_ms_p95: null, pertes_contexte: 0,
  famille: "Windows", logos_octets: 8 * 1048576, lourds: [],
  ...o,
});
const serie = (n, o) => Array.from({ length: n }, (_, i) =>
  releve(typeof o === "function" ? o(i) : o));

const ids = (rels) => pistes(indicateurs(rels, AU)).map((p) => p.id);

dit(lundiMesure(AU) === "2026-10-19", "un lundi mesure la semaine d'avant", lundiMesure(AU));
dit(lundiMesure("2026-10-28") === "2026-10-19", "un mercredi aussi", lundiMesure("2026-10-28"));

// rien ne se déclenche sur des visites ordinaires, ni sur un fichier lourd dans une visite sur trois
const calme = serie(30, (i) => ({ lourds: i < 10 ? [{ fichier: "plan.js", transfertKo: 200 }] : [] }));
dit(ids(calme).length === 0, "des visites ordinaires ne donnent aucune piste", JSON.stringify(ids(calme)));

const lentes = serie(30, { mobile: true, donnees_ms: 4000, affiche_ms: 4600 });
dit(ids(lentes).includes("donnees-telephone"), "données lentes sur téléphone", JSON.stringify(ids(lentes)));
dit(!ids(serie(30, { mobile: false, donnees_ms: 4000, affiche_ms: 4600 })).includes("donnees-telephone"),
  "les mêmes données sur bureau ne déclenchent pas la règle du téléphone");

const lourd = serie(30, (i) => ({ lourds: i < 20 ? [{ fichier: "logos.webp", transfertKo: 900 }] : [] }));
const pLourd = pistes(indicateurs(lourd, AU)).find((p) => p.id === "fichier-lourd");
dit(pLourd && pLourd.detail.includes("logos.webp"), "un fichier lourd dans plus de la moitié des visites",
  pLourd && pLourd.detail);

const longue = serie(30, { donnees_ms: 800, affiche_ms: 3500 });
dit(ids(longue).includes("preparation-longue"), "préparation longue", JSON.stringify(ids(longue)));

/* L'immersif moins fluide, sans aucune mesure de `gpuTime` : la règle porte
   sur les images lentes, le GPU n'est qu'un indice. */
const immersif = serie(40, (i) => i < 20
  ? { part_plus33_classique: 4 }
  : { immersif: true, part_plus33_classique: 4, part_plus33_immersif: 30, gpu_ms_p95: null });
const pImm = pistes(indicateurs(immersif, AU)).find((p) => p.id === "immersif-lourd");
dit(Boolean(pImm), "immersif moins fluide, sans gpuTime : la piste vient quand même", pImm && pImm.detail);
dit(pImm && !pImm.detail.includes("GPU"), "sans gpuTime, le détail ne parle pas du GPU");

const logos = serie(30, { mobile: true, logos_octets: 150 * 1048576 });
dit(ids(logos).includes("logos-telephone"), "logos lourds sur téléphone", JSON.stringify(ids(logos)));

const pertes = serie(30, (i) => ({ famille: "Android", pertes_contexte: i < 3 ? 1 : 0 }));
const pPertes = pistes(indicateurs(pertes, AU)).find((p) => p.id === "pertes-contexte");
dit(pPertes && pPertes.detail.startsWith("Android"), "pertes de contexte sur une famille", pPertes && pPertes.detail);

// la semaine d'avant et les jours hors de la semaine n'entrent pas dans les pistes
dit(ids(serie(30, { mobile: true, donnees_ms: 4000, jour: "2026-10-12" })).length === 0,
  "la semaine d'avant ne déclenche rien");

// l'ordre suit le gain : beaucoup de visites un peu au-delà passent devant peu de visites très au-delà
const melange = [
  ...serie(200, { mobile: true, donnees_ms: 3000, affiche_ms: 3500 }),
  ...serie(12, { page: "admin", donnees_ms: 400, affiche_ms: 6000 }),
];
const pm = pistes(indicateurs(melange, AU));
dit(pm.length >= 2 && pm.every((p, i) => i === 0 || pm[i - 1].gain >= p.gain),
  "les pistes se classent par gain décroissant", pm.map((p) => p.id + " " + p.gain).join(", "));
dit(pm[0].id === "donnees-telephone", "le gain pèse les visites touchées", pm[0].id);

// une version qui dégrade l'ouverture se signale avec les deux versions
const versions = [
  ...serie(20, { version: "aaaa111", recu: "2026-10-19T08:00:00Z", affiche_ms: 1500 }),
  ...serie(20, { version: "bbbb222", recu: "2026-10-22T08:00:00Z", affiche_ms: 2600 }),
];
const reg = regressions(indicateurs(versions, AU));
dit(reg.some((r) => r.avant === "aaaa111" && r.apres === "bbbb222" && r.indicateur === "ouverture médiane"),
  "une ouverture qui se dégrade d'une version à l'autre", JSON.stringify(reg));
const texteVersions = corps(indicateurs(versions, AU));
dit(texteVersions.includes("version aaaa111 → version bbbb222"), "la fiche nomme les deux versions");
dit(regressions(indicateurs(serie(40, { version: "aaaa111" }), AU)).length === 0,
  "une seule version ne se compare à rien");

// rien qui nomme un salon dans un dépôt public
const deux = [...lentes, ...serie(15, { evenement_id: AUTRE, slug: "smcl-2026" })];
const texte = corps(indicateurs(deux, AU));
dit(!/fep27|smcl-2026/.test(texte), "la fiche ne contient aucun slug");
dit(!texte.includes(SALON) && !texte.includes(AUTRE), "ni aucun identifiant de salon");
const etiquettes = texte.match(/salon-[0-9a-f]{4}\b/g) || [];
dit(etiquettes.includes(etiquette(SALON)) && etiquettes.includes(etiquette(AUTRE)),
  "chaque salon y est nommé salon- et quatre caractères hexadécimaux", [...new Set(etiquettes)].join(", "));
dit(etiquette(SALON) === etiquette(SALON) && etiquette(SALON) !== etiquette(AUTRE) &&
  /^salon-[0-9a-f]{4}$/.test(etiquette(SALON)), "l'étiquette est stable pour un même salon", etiquette(SALON));
/* La base refait le même calcul (`md5(evenement_id::text)`) : l'empreinte de
   l'identifiant en minuscules, tel que Postgres l'écrit. */
dit(etiquette("00000000-0000-0000-0000-000000000000") === "salon-" +
  require("crypto").createHash("md5").update("00000000-0000-0000-0000-000000000000").digest("hex").slice(0, 4),
  "l'étiquette est celle que la base calcule");

/* La requête du script, sur le vrai schéma : une colonne renommée dans la
   migration casserait la fiche du lundi sans qu'aucun autre essai le voie. */
(async () => {
  const db = await baseNeuve();
  const id = (await db.query(
    "insert into evenement (nom, slug, instance, etat, fuseau) values ('Salon', 'fep27', 'x', 'publie', 'UTC') returning id")).rows[0].id;
  const resume = {
    format: "sonde-plan/1", page: "plan", support: "web",
    chargement: { jalons: { "plan-affiche": 2600, donnees: 1900 }, transfertKo: 812,
                  lourds: [{ fichier: "logos.webp", sorte: "img", ms: 300, transfertKo: 640, tailleKo: 700 }] },
    fluidite: { classique: { partPlus33: 6 } },
    gpu: { repeints: { p95: 14 }, logos: { octetsTexture: 3 * 1048576 }, pertesContexte: 0 },
    appareil: { mobile: true, systeme: "Android" }, plan: { immersifUtilise: false },
  };
  await db.query("select sonde_enregistre($1, 'plan', 'abc123', gen_random_uuid(), $2::jsonb)",
    [id, JSON.stringify(resume)]);
  const lignes = (await db.query(REQUETE)).rows;
  const r = lignes[0] || {};
  dit(lignes.length === 1 && /^\d{4}-\d{2}-\d{2}$/.test(r.jour) && /Z$/.test(r.recu),
    "la requête du script tourne sur le schéma", JSON.stringify({ jour: r.jour, recu: r.recu }));
  dit(r.famille === "Android" && r.logos_octets === 3 * 1048576 && r.lourds?.[0]?.fichier === "logos.webp" &&
    r.donnees_ms === 1900 && r.mobile === true, "elle rend ce que les règles lisent", JSON.stringify(r).slice(0, 200));
  const ind = indicateurs(lignes, plusSept(r.jour));
  dit(ind.visites === 1, "ses rangées nourrissent les indicateurs", String(ind.visites));
  dit(!JSON.stringify(lignes).includes("fep27"), "elle ne lit pas le slug");
  console.log(ko ? "\n" + ko + " échec(s)." : "\nTout passe.");
  process.exit(ko ? 1 : 0);
})().catch((e) => { console.log("  ÉCHEC  " + e.stack); process.exit(1); });

/** Le jour où la fiche couvrirait ce jour-là : sept jours plus tard. */
function plusSept(jour) {
  return new Date(Date.parse(jour + "T00:00:00Z") + 7 * 864e5).toISOString().slice(0, 10);
}
