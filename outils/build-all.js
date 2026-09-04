/* Assemble les trois pavillons en un seul jeu de données.
   Repère : x_svg = x_wkt, y_svg = -y_wkt, 1 unité = 1 mètre.         */
const fs = require("fs"), path = require("path");
const D = __dirname;
const index = JSON.parse(fs.readFileSync(path.join(D, "brut", "index.json"), "utf8"));

const r2 = n => Math.round(n * 100) / 100;
function wkt(s) {
  if (!s) return null;
  const anneaux = [];
  const re = /\(([^()]+)\)/g; let m;
  while ((m = re.exec(s))) {
    const pts = m[1].trim().split(",").map(p => {
      const [x, y] = p.trim().split(/\s+/).map(Number);
      return [r2(x), r2(-y)];
    });
    if (pts.length > 2 && pts.every(p => isFinite(p[0]) && isFinite(p[1]))) anneaux.push(pts);
  }
  return anneaux.length ? anneaux : null;
}
const trace = a => a.map(r => "M" + r.map(p => p.join(" ")).join("L") + "Z").join("");
const bbox = a => {
  const p = a.flat();
  const x0 = Math.min(...p.map(q => q[0])), x1 = Math.max(...p.map(q => q[0]));
  const y0 = Math.min(...p.map(q => q[1])), y1 = Math.max(...p.map(q => q[1]));
  return { c: [r2((x0 + x1) / 2), r2((y0 + y1) / 2)], bb: [r2(x1 - x0), r2(y1 - y0)] };
};
function dedans(pt, anneau) {
  let ok = false;
  for (let i = 0, j = anneau.length - 1; i < anneau.length; j = i++) {
    const [xi, yi] = anneau[i], [xj, yj] = anneau[j];
    if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) ok = !ok;
  }
  return ok;
}

const NOMS = {
  "Batiment": "Bâtiment",
  "INFOPRO_SURFACE_POTEAUX": "Poteaux",
  "INFOPRO_SECTEURS_DELIMITATION": "Délimitation des secteurs",
  "INFOPRO_SECTEURS_DELIMITATIONS": "Délimitation des secteurs",
  "INFOPRO_FIL_JAUNE": "Fil jaune",
  "INFOPRO_COTES_ALLEES": "Cotes des allées",
  "INFOPRO_COTES_ILOTS": "Cotes des îlots",
  "INFOPRO_LETTRE_ALLEE": "Lettres d'allée",
  "INFOPRO_NUMEROTATION_STAND_VALIDEE": "Numérotation des stands",
  "INFOPRO_TEXTE_ZONES_ORGA": "Textes des zones organisateur",
  "INFOPRO_NOM_ZONE_IG": "Noms des zones IG",
  "INFOPRO_ZONE_NON_ELINGUABLE": "Zones non élingables",
};
// masqués au départ : ils feraient doublon avec les libellés calculés
const DOUBLONS = ["INFOPRO_NUMEROTATION_STAND_VALIDEE", "INFOPRO_TEXTE_ZONES_ORGA",
                  "INFOPRO_NOM_ZONE_IG", "INFOPRO_COTES_ALLEES", "INFOPRO_COTES_ILOTS"];
const CALQUES_TEXTE = ["INFOPRO_TEXTE_ZONES_ORGA", "INFOPRO_NOM_ZONE_IG"];

const plans = [];
for (const [i, meta] of index.entries()) {
  const brut = JSON.parse(fs.readFileSync(path.join(D, "brut", meta.id + ".json"), "utf8"));
  const pref = "p" + i + "-";

  /* --- stands --- */
  const stands = [];
  for (const s of brut.stands) {
    const formes = s.SetStandShapeStand ? [].concat(s.SetStandShapeStand) : [];
    const anneaux = formes.flatMap(f => wkt(f.Shape) || []);
    if (!anneaux.length) continue;
    const dos = s.RefDossierExpAff;
    const exclu = dos && dos.x_ExcluListeexposants === true;
    stands.push({
      id: pref + s.Id.slice(0, 8),
      code: [s.Allee, s.NoStand].filter(Boolean).join("") || null,
      plan: s.NomSurPlan || null,
      nom: dos && !exclu ? dos.x_Catalogue_RaisonSociale : null,
      site: dos && !exclu ? dos.x_Catalogue_SiteWeb : null,
      nomencl: dos && !exclu ? dos.x_Nomenclature : null,
      m2: s.SurfaceBrute, angles: s.NbAngles, niveaux: s.NbNiveau,
      etat: s.EtatCommercialisation,
      d: trace(anneaux), ...bbox(anneaux),
    });
  }

  /* --- libellés de zones, lus dans le calque de texte s'il existe --- */
  const dossierSvg = path.join(D, "svg", meta.id);
  const dec = t => t.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n))
                    .replace(/&amp;/g, "&").replace(/&#39;/g, "'").trim();
  const mots = [];
  for (const nomCalque of CALQUES_TEXTE) {
    const f = path.join(dossierSvg, nomCalque + ".svg");
    if (!fs.existsSync(f)) continue;
    const src = fs.readFileSync(f, "utf8");
    const reT = /<text x="(-?[\d.]+)" y="(-?[\d.]+)"[^>]*>([^<]*)<\/text>/g; let t;
    while ((t = reT.exec(src))) mots.push({ x: +t[1], y: +t[2], txt: dec(t[3]) });
  }
  const grappes = [];
  for (const w of mots.sort((a, b) => a.y - b.y)) {
    const g = grappes.find(g => g.mots.some(o => Math.abs(o.x - w.x) < 4.5 && Math.abs(o.y - w.y) < 2.6));
    if (g) g.mots.push(w); else grappes.push({ mots: [w] });
  }
  const libelles = grappes.map(g => ({
    x: g.mots.reduce((a, m) => a + m.x, 0) / g.mots.length,
    y: g.mots.reduce((a, m) => a + m.y, 0) / g.mots.length,
    txt: g.mots.sort((a, b) => a.y - b.y).map(m => m.txt).join(" ").replace(/\s+/g, " ").trim(),
  }));

  /* --- zones --- */
  const TECH = /\bkW\b|Hauteur \d|Coffret|Mur inclinable/i;
  const zones = [];
  for (const z of brut.zones) {
    const anneaux = wkt(z.Shape);
    if (!anneaux) continue;
    const b = bbox(anneaux);
    const dedansMoi = libelles
      .filter(l => dedans([l.x, l.y], anneaux[0]) && !TECH.test(l.txt))
      .sort((a, c) => Math.hypot(a.x - b.c[0], a.y - b.c[1]) - Math.hypot(c.x - b.c[0], c.y - b.c[1]));
    zones.push({
      id: pref + z.Id.slice(0, 8),
      nom: z.x_LibZOD || (dedansMoi.length ? dedansMoi[0].txt : null),
      m2: z.Surface, d: trace(anneaux), ...b,
    });
  }

  /* --- calques d'habillage --- */
  const fond = brut.calques
    .filter(c => c.SVG && c.SVG.idMedia && fs.existsSync(path.join(dossierSvg, c.Libelle + ".min.svg")))
    .sort((a, b) => a.Ordre - b.Ordre)
    .map(c => ({
      cle: c.Libelle, nom: NOMS[c.Libelle] || c.Libelle, ordre: c.Ordre,
      visible: DOUBLONS.includes(c.Libelle) ? false : c.VisibleParDefaut !== false,
      svg: fs.readFileSync(path.join(dossierSvg, c.Libelle + ".min.svg"), "utf8"),
    }));

  /* --- cadrage sur l'emprise réelle --- */
  const tous = [...stands, ...zones];
  const xs = tous.flatMap(o => [o.c[0] - o.bb[0] / 2, o.c[0] + o.bb[0] / 2]);
  const ys = tous.flatMap(o => [o.c[1] - o.bb[1] / 2, o.c[1] + o.bb[1] / 2]);
  const M = 12;
  const emprise = { x0: r2(Math.min(...xs) - M), y0: r2(Math.min(...ys) - M),
                    x1: r2(Math.max(...xs) + M), y1: r2(Math.max(...ys) + M) };

  plans.push({
    id: meta.id,
    libelle: brut.plan.Libelle.replace(/^SMCL2026_/, "").replace(/^PAVILLON /, "Pavillon "),
    hall: brut.plan.HallExp, emprise, fond, stands, zones,
  });
  console.log(plans.at(-1).libelle.padEnd(14),
    stands.length + " stands", "|", stands.filter(s => s.nom).length + " nommés",
    "|", zones.length + " zones", "|", zones.filter(z => z.nom).length + " nommées",
    "|", (emprise.x1 - emprise.x0).toFixed(0) + "×" + (emprise.y1 - emprise.y0).toFixed(0) + " m");
}

plans.sort((a, b) => a.libelle.localeCompare(b.libelle, "fr", { numeric: true }));
const out = { evenement: "SMCL 2026", plans };
fs.writeFileSync(path.join(D, "plans.json"), JSON.stringify(out));
console.log("\nplans.json :", (fs.statSync(path.join(D, "plans.json")).size / 1048576).toFixed(2), "Mo");
console.log("total      :", plans.reduce((a, p) => a + p.stands.length, 0), "stands,",
            plans.reduce((a, p) => a + p.zones.length, 0), "zones");
