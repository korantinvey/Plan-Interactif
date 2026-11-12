/* Allège les SVG d'habillage Klipso, plan par plan :
   - supprime les segments de hachurage (plus courts qu'un seuil)
   - arrondit les coordonnées
   - fusionne les <line> consécutifs en un seul <path>
   - neutralise les couleurs figées sur les éléments (une couleur posée sur
     l'élément l'emporte sur celle du groupe et rend le calque non colorisable) */
const fs = require("fs"), path = require("path");
const RACINE = path.join(__dirname, "svg");
const SEUIL = Number(process.env.SEUIL || 0.5);   // mètres
const DEC   = Number(process.env.DEC || 2);       // décimales conservées

const P = Math.pow(10, DEC);
const r = n => Math.round(n * P) / P;

function optimise(src) {
  const stats = { lignes: 0, gardees: 0, textes: 0, autres: 0 };
  const groupes = [];
  const reG = /<g id="([^"]+)"\s*>([\s\S]*?)(?=<g id="|<\/g>\s*<\/svg>|$)/g;
  let m;
  while ((m = reG.exec(src))) {
    const id = m[1], corps = m[2];
    const segs = [], autres = [];

    const reL = /<line x1="(-?[\d.]+)" y1="(-?[\d.]+)" x2="(-?[\d.]+)" y2="(-?[\d.]+)"/g;
    let l;
    while ((l = reL.exec(corps))) {
      stats.lignes++;
      const [x1, y1, x2, y2] = [+l[1], +l[2], +l[3], +l[4]];
      if (Math.hypot(x2 - x1, y2 - y1) < SEUIL) continue;
      stats.gardees++;
      segs.push(`M${r(x1)} ${r(y1)}L${r(x2)} ${r(y2)}`);
    }

    const reP = /<(polyline|path|circle)\b([^>]*)\/>/g;
    let p;
    while ((p = reP.exec(corps))) {
      stats.autres++;
      autres.push(`<${p[1]}${p[2].replace(/-?\d+\.\d+/g, s => r(+s))
        .replace(/\b(fill|stroke)="(?!none\b)[^"]*"/g, '$1="currentColor"')}/>`);
    }

    const reT = /<text\b([^>]*)>([^<]*)<\/text>/g;
    let t;
    while ((t = reT.exec(corps))) {
      stats.textes++;
      autres.push(`<text${t[1].replace(/-?\d+\.\d+/g, s => r(+s))
        .replace(/\s*(stroke|fill|font-family)="[^"]*"/g, "")}>${t[2]}</text>`);
    }

    if (!segs.length && !autres.length) continue;
    const st = /<g[^>]*\bstroke="([^"]+)"/.exec(corps);
    const fi = /<g[^>]*\bfill="([^"]+)"/.exec(corps);
    groupes.push({ id, trait: st ? st[1] : "", remplissage: fi ? fi[1] : "",
                   contenu: (segs.length ? `<path d="${segs.join("")}"/>` : "") + autres.join("") });
  }
  return { groupes, stats };
}

let avant = 0, apres = 0;
for (const plan of fs.readdirSync(RACINE).filter(d => fs.statSync(path.join(RACINE, d)).isDirectory())) {
  const dir = path.join(RACINE, plan);
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith(".svg") && !f.endsWith(".min.svg"))) {
    const src = fs.readFileSync(path.join(dir, f), "utf8");
    const { groupes } = optimise(src);
    const sortie = groupes.map(g =>
      `<g id="${g.id}" data-s="${g.trait}" data-f="${g.remplissage}">${g.contenu}</g>`).join("");
    fs.writeFileSync(path.join(dir, f.replace(/\.svg$/, ".min.svg")), sortie);
    avant += src.length; apres += sortie.length;
  }
}
console.log("SVG :", (avant / 1048576).toFixed(2), "Mo →", (apres / 1048576).toFixed(2), "Mo",
            "(" + Math.round(100 - apres / avant * 100) + " % de gain)");
