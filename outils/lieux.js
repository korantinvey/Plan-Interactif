/**
 * La bibliothèque des lieux : les halls des sites où l'on expose le plus
 * souvent, tirés d'OpenStreetMap et simplifiés.
 *
 *   node outils/lieux.js    → outils/lieux.json (versionné), copié dans web/
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
 * Le fichier produit est versionné : la construction ne doit pas dépendre du
 * réseau, et un contour ne se régénère que lorsqu'on le décide.
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

async function principal() {
  const sortie = {
    format: "plan-interactif/lieux",
    version: 1,
    mention: "© les contributeurs d'OpenStreetMap",
    licence: "ODbL",
    /* Le repère d'un lieu, et non celui d'un plan : chaque plan Klipso a son
       origine et son orientation, le calage les rattrape à la pose. */
    repere: "mètres ; x vers l'est, y vers le sud ; origine au centre du lieu",
    lieux: [],
  };
  for (const lieu of LIEUX) {
    const bruts = [];
    for (const [type, id, nom] of lieu.batiments) {
      bruts.push({ type, id, nom, anneaux: await anneaux(type, id) });
      process.stdout.write(".");
    }
    const tous = bruts.flatMap((b) => b.anneaux.flat());
    const lon0 = tous.reduce((s, p) => s + p[0], 0) / tous.length;
    const lat0 = tous.reduce((s, p) => s + p[1], 0) / tous.length;
    const metres = ([lon, lat]) => [
      (lon - lon0) * RAD * R * Math.cos(lat0 * RAD),
      -(lat - lat0) * RAD * R,
    ];
    sortie.lieux.push({
      cle: lieu.cle, nom: lieu.nom, ville: lieu.ville,
      centre: [+lon0.toFixed(7), +lat0.toFixed(7)],
      batiments: bruts.map((b) => ({
        nom: b.nom,
        osm: b.type + "/" + b.id,
        contours: b.anneaux.map((a) =>
          allegeAnneau(a.slice(0, -1).map(metres), TOLERANCE)
            .map((p) => [+p[0].toFixed(2), +p[1].toFixed(2)])),
      })),
    });
    console.log(" " + lieu.nom + " : " + bruts.length + " bâtiments");
  }
  fs.writeFileSync(path.join(__dirname, "lieux.json"), JSON.stringify(sortie) + "\n");
}

principal().catch((e) => { console.error(e.message); process.exit(1); });
