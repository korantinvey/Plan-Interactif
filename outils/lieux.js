/**
 * La bibliothèque des lieux : les halls des sites où l'on expose le plus
 * souvent, tirés d'OpenStreetMap et simplifiés, ou relevés à la main quand OSM
 * ne les connaît pas séparément.
 *
 *   node outils/lieux.js              → outils/lieux.json (versionné)
 *   node outils/lieux.js grimaldi     → ce lieu seul, les autres gardés tels quels
 *
 * Un contour de hall ne change pas d'un salon à l'autre, et le retracer à la
 * main sur chaque plan prenait une après-midi pour un résultat moins juste que
 * le cadastre. On le relève donc une fois, ici, et l'administration le pose en
 * quelques clics (voir `gabarit/_batiments.html`).
 *
 * Les bâtiments sont désignés par leur identifiant OSM plutôt que cherchés par
 * leur nom : « Hall 1 » existe dans toutes les villes, et une recherche qui
 * change de réponse le jour où quelqu'un renomme un bâtiment ne se rejoue pas.
 * Les identifiants se trouvent sur openstreetmap.org, en cliquant le bâtiment.
 *
 * Tous les halls ne sont pas des bâtiments. Au Grimaldi Forum, les espaces
 * d'exposition sont des salles d'un seul volume, en partie enterrées : OSM n'en
 * connaît que l'enveloppe, et une enveloppe ne distingue pas Ravel de Diaghilev.
 * Un lieu peut donc aussi porter des contours relevés à la main sur un plan
 * coté (voir `lieuSaisi`), en mètres, dans un repère commun à ses halls.
 *
 * Les deux origines ne se mélangent pas dans un même lieu : un contour saisi
 * est placé dans le repère du plan dont il vient, qu'on ne connaît pas d'avance
 * face à celui d'OSM. Les rapprocher demanderait un point d'ancrage commun, que
 * personne n'a ; les juxtaposer à l'aveugle poserait deux halls l'un sur
 * l'autre, ce qui se voit mal et se corrige plus mal encore.
 *
 * Le fichier produit est versionné : la construction ne doit pas dépendre du
 * réseau, et un contour ne se régénère que lorsqu'on le décide. Nommer un lieu
 * en argument ne refait que lui — utile pour ajouter un lieu saisi sans rien
 * redemander à OSM, et pour ne pas laisser un relevé d'aujourd'hui réécrire
 * silencieusement les seize halls d'Eurexpo.
 */
const fs = require("fs");
const https = require("https");
const path = require("path");

const LIEUX = [
  {
    cle: "paris-expo", nom: "Paris Expo Porte de Versailles", ville: "Paris",
    batiments: [
      ["way", 404252944, "Pavillon 1"],
      ["way", 124188857, "Pavillon 2"],
      ["way", 23811461, "Pavillon 3"],
      ["way", 42736344, "Pavillon 4"],
      ["way", 42736338, "Pavillon 5"],
      ["way", 754205326, "Pavillon 6"],
      ["way", 23811464, "Pavillon 7"],
      ["way", 1152642684, "Passerelle 4-6"],
      // sans nom dans OSM : un espace d'exposition surélevé, au nord du 6
      ["way", 754205324, "Bâtiment au nord du Pavillon 6"],
    ],
  },
  {
    cle: "eurexpo", nom: "Eurexpo Lyon", ville: "Chassieu",
    batiments: [
      ["way", 209080710, "Hall 1"],
      ["way", 209080711, "Hall 2.1A"],
      ["way", 473505671, "Hall 2.1B"],
      ["way", 473505670, "Hall 2.1C"],
      ["way", 139151667, "Hall 2.2"],
      ["way", 209080712, "Hall 2.3 Espace Confluence"],
      ["way", 50389612, "Hall 3.1"],
      ["way", 209080713, "Hall 3.2"],
      ["way", 50389610, "Hall 4.1"],
      ["way", 209080714, "Hall 4.2"],
      ["way", 209080715, "Hall 5.1"],
      ["way", 209080716, "Hall 5.2"],
      ["way", 209080718, "Hall 6.1"],
      ["way", 50389599, "Hall 6.2"],
      ["way", 209080719, "Hall 6.3 Espace Paul Bocuse"],
      ["way", 667777793, "Hall 7"],
    ],
  },
];

/* Un mètre d'écart toléré : c'est l'ordre de précision du cadastre dont
   viennent la plupart des tracés, et il suffit à effacer les sommets presque
   alignés qu'un relevé accumule le long d'une façade. */
const TOLERANCE = 1;

const R = 6371008.8, RAD = Math.PI / 180;

function lit(url) {
  return new Promise((ok, ko) => {
    https.get(url, { headers: { "User-Agent": "plan-interactif/lieux" } }, (r) => {
      let b = "";
      r.setEncoding("utf8");
      r.on("data", (d) => b += d).on("end", () => {
        if (r.statusCode !== 200) return ko(new Error(url + " → " + r.statusCode));
        try { ok(JSON.parse(b)); } catch (e) { ko(e); }
      });
    }).on("error", ko);
  });
}

/** Les anneaux extérieurs d'un bâtiment, en longitude/latitude. Une relation
 *  arrive en morceaux de façade : on les recoud bout à bout. */
async function anneaux(type, id) {
  const j = await lit("https://www.openstreetmap.org/api/0.6/" + type + "/" + id + "/full.json");
  const noeuds = new Map(j.elements.filter((e) => e.type === "node").map((e) => [e.id, [e.lon, e.lat]]));
  const voies = new Map(j.elements.filter((e) => e.type === "way").map((e) => [e.id, e.nodes.map((n) => noeuds.get(n))]));
  if (type === "way") return [voies.get(id)];
  const rel = j.elements.find((e) => e.type === "relation");
  const bouts = rel.members.filter((m) => m.type === "way" && (m.role || "outer") === "outer").map((m) => voies.get(m.ref));
  const egal = (a, b) => a[0] === b[0] && a[1] === b[1];
  const res = [];
  while (bouts.length) {
    let r = bouts.shift();
    for (let suite = true; suite && !egal(r[0], r[r.length - 1]);) {
      suite = false;
      for (let i = 0; i < bouts.length; i++) {
        const s = bouts[i], fin = r[r.length - 1];
        if (egal(fin, s[0])) r = r.concat(s.slice(1));
        else if (egal(fin, s[s.length - 1])) r = r.concat(s.slice(0, -1).reverse());
        else continue;
        bouts.splice(i, 1); suite = true; break;
      }
    }
    res.push(r);
  }
  return res;
}

/** Douglas-Peucker sur une ligne ouverte. */
function allege(pts, tol) {
  if (pts.length < 3) return pts;
  const a = pts[0], b = pts[pts.length - 1];
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1e-9;
  let loin = 0, iLoin = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = Math.abs((b[0] - a[0]) * (a[1] - pts[i][1]) - (a[0] - pts[i][0]) * (b[1] - a[1])) / L;
    if (d > loin) { loin = d; iLoin = i; }
  }
  if (loin <= tol) return [a, b];
  return allege(pts.slice(0, iLoin + 1), tol).slice(0, -1).concat(allege(pts.slice(iLoin), tol));
}

/** Un anneau fermé se coupe en deux au sommet le plus éloigné du premier :
 *  sur une ligne dont les deux bouts se confondent, la distance à la corde
 *  n'aurait aucun sens. */
function allegeAnneau(pts, tol) {
  if (pts.length < 4) return pts;
  let iLoin = 0, loin = 0;
  pts.forEach((p, i) => {
    const d = Math.hypot(p[0] - pts[0][0], p[1] - pts[0][1]);
    if (d > loin) { loin = d; iLoin = i; }
  });
  const r = pts.concat([pts[0]]);
  return allege(r.slice(0, iLoin + 1), tol).slice(0, -1)
    .concat(allege(r.slice(iLoin), tol).slice(0, -1));
}

/** La moyenne des sommets : l'origine du repère local d'un lieu. Le centre de
 *  la boîte englobante s'en irait au gré d'une passerelle isolée. */
const moyenne = (pts) => [
  pts.reduce((s, p) => s + p[0], 0) / pts.length,
  pts.reduce((s, p) => s + p[1], 0) / pts.length,
];

/** Un anneau tel que la bibliothèque le garde : fermé sans répéter son premier
 *  point, que la page remet elle-même. OSM le répète toujours, une saisie à la
 *  main tantôt l'oublie tantôt non — les deux entrent ici. */
function anneauNu(pts) {
  const r = pts.slice(), a = r[0], z = r[r.length - 1];
  if (r.length > 1 && a[0] === z[0] && a[1] === z[1]) r.pop();
  return r;
}

const arrondi = (p) => [+p[0].toFixed(2), +p[1].toFixed(2)];

/** Le nom réduit à ce qui tient dans une référence. Elle entre dans les plans
 *  enregistrés, qui s'y reconnaissent : elle ne doit plus bouger ensuite. */
const identifiant = (nom) => nom.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/* ------------------------------------------------------------
   Un lieu relevé dans OpenStreetMap
   ------------------------------------------------------------ */
async function lieuOsm(lieu) {
  const bruts = [];
  for (const [type, id, nom] of lieu.batiments) {
    bruts.push({ type, id, nom, anneaux: await anneaux(type, id) });
    process.stdout.write(".");
  }
  const [lon0, lat0] = moyenne(bruts.flatMap((b) => b.anneaux.flat()));
  const metres = ([lon, lat]) => [
    (lon - lon0) * RAD * R * Math.cos(lat0 * RAD),
    -(lat - lat0) * RAD * R,
  ];
  return {
    cle: lieu.cle, nom: lieu.nom, ville: lieu.ville,
    centre: [+lon0.toFixed(7), +lat0.toFixed(7)],
    batiments: bruts.map((b) => ({
      nom: b.nom,
      osm: b.type + "/" + b.id,
      contours: b.anneaux.map((a) =>
        allegeAnneau(anneauNu(a).map(metres), TOLERANCE).map(arrondi)),
    })),
  };
}

/* ------------------------------------------------------------
   Un lieu relevé à la main sur un plan coté

   Les contours arrivent en mètres, x vers l'est et y vers le sud comme sur le
   plan lu à l'endroit, dans un repère commun à tous les halls du lieu : leur
   position les uns par rapport aux autres est tout ce qui compte, le calage
   rattrape l'orientation et l'origine à la pose.

   On ne les allège pas. Le mètre de tolérance efface les sommets presque
   alignés qu'un relevé cadastral accumule le long d'une façade ; un traçé fait
   à la main n'a que les sommets qu'on a voulus, et il y mangerait un pan de mur.
   ------------------------------------------------------------ */
function lieuSaisi(lieu) {
  if (!lieu.source) throw new Error(lieu.cle + " : d'où viennent ces contours ?"
    + " Un lieu saisi dit sa source, sinon plus personne ne sait quoi en croire.");
  lieu.batiments.forEach((b) => verifieSaisi(lieu, b));
  const refs = lieu.batiments.map((b) => identifiant(b.nom));
  refs.forEach((r, i) => {
    if (refs.indexOf(r) !== i) throw new Error(lieu.cle + " : deux halls pour une"
      + " seule référence « " + r + " » — le second passerait pour le premier.");
  });
  const [x0, y0] = moyenne(lieu.batiments.flatMap((b) => b.contours.flat()));
  return {
    cle: lieu.cle, nom: lieu.nom, ville: lieu.ville,
    ...(lieu.centre ? { centre: lieu.centre } : {}),
    source: lieu.source,
    batiments: lieu.batiments.map((b, i) => ({
      nom: b.nom,
      /* Pas de référence OSM : rien ici n'en vient, et `_batiments.html` ne doit
         pas faire paraître sa mention sur un plan qui ne lui doit rien. */
      ref: "saisi/" + lieu.cle + "/" + refs[i],
      contours: b.contours.map((k) =>
        anneauNu(k).map((p) => arrondi([p[0] - x0, p[1] - y0]))),
    })),
  };
}

/** Un contour saisi est tapé à la main : une coquille s'y glisse sans bruit et
 *  ressort en hall plié sur le plan d'un client. */
function verifieSaisi(lieu, b) {
  const ou = lieu.cle + " « " + ((b && b.nom) || "?") + " »";
  if (!b || !b.nom) throw new Error(lieu.cle + " : un hall sans nom");
  if (!Array.isArray(b.contours) || !b.contours.length)
    throw new Error(ou + " : pas de contour");
  b.contours.forEach((k) => {
    if (!Array.isArray(k) || anneauNu(k).length < 3)
      throw new Error(ou + " : un contour de moins de trois sommets");
    k.forEach((p) => {
      if (!Array.isArray(p) || p.length !== 2 || !p.every(Number.isFinite))
        throw new Error(ou + " : un sommet qui n'est pas un couple de nombres");
    });
  });
}

const SORTIE = path.join(__dirname, "lieux.json");

/** Les lieux du fichier en place, pour garder ceux qu'on ne refait pas. */
function ancienneSortie() {
  try { return JSON.parse(fs.readFileSync(SORTIE, "utf8")).lieux || []; }
  catch (e) { return []; }
}

/** Ce qui se vérifie avant de toucher au réseau : une erreur de déclaration se
 *  dit tout de suite, et non après vingt téléchargements. */
function verifieLieux(vises) {
  const cles = LIEUX.map((l) => l.cle);
  const inconnus = vises.filter((c) => cles.indexOf(c) < 0);
  if (inconnus.length) throw new Error("lieu inconnu : " + inconnus.join(", ")
    + " (connus : " + cles.join(", ") + ")");
  LIEUX.forEach((l) => {
    const osm = l.batiments.filter((b) => Array.isArray(b)).length;
    if (osm && osm !== l.batiments.length) throw new Error(l.cle + " : des halls"
      + " d'OpenStreetMap et des halls saisis dans un même lieu. Leurs deux"
      + " repères n'ont pas de point commun connu, et les juxtaposer poserait"
      + " un hall sur l'autre — séparez-les en deux lieux.");
  });
}

async function principal() {
  const vises = process.argv.slice(2);
  verifieLieux(vises);
  const ancien = ancienneSortie();
  const sortie = {
    format: "plan-interactif/lieux",
    version: 1,
    /* Ce qui couvre les contours marqués `osm` ; un lieu saisi dit sa propre
       source, sur sa ligne. */
    mention: "© les contributeurs d'OpenStreetMap",
    licence: "ODbL",
    /* Le repère d'un lieu, et non celui d'un plan : chaque plan Klipso a son
       origine et son orientation, le calage les rattrape à la pose. */
    repere: "mètres ; x vers l'est, y vers le sud ; origine au centre du lieu",
    lieux: [],
  };
  for (const lieu of LIEUX) {
    if (vises.length && vises.indexOf(lieu.cle) < 0) {
      const garde = ancien.find((l) => l.cle === lieu.cle);
      if (!garde) throw new Error(lieu.cle + " : rien à garder dans lieux.json,"
        + " relancez sans argument pour le relever aussi.");
      sortie.lieux.push(garde);
      console.log("· " + lieu.nom + " : gardé tel quel");
      continue;
    }
    const saisi = !Array.isArray(lieu.batiments[0]);
    sortie.lieux.push(saisi ? lieuSaisi(lieu) : await lieuOsm(lieu));
    console.log((saisi ? "" : " ") + lieu.nom + " : " + lieu.batiments.length
      + " bâtiments" + (saisi ? " (saisis)" : ""));
  }
  fs.writeFileSync(SORTIE, JSON.stringify(sortie) + "\n");
}

principal().catch((e) => { console.error(e.message); process.exit(1); });
