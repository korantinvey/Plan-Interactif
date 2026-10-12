/**
 * Les figurants de la vue immersive (`modules/figurants.mjs`), éprouvés hors de la page.
 *
 * Ce qu'on vérifie : qu'ils ne se posent que dans l'allée et jamais contre un
 * mur, que la même graine rend la même foule — sans quoi elle sauterait d'une
 * image à l'autre —, qu'ils ne se marchent pas dessus, et que la borne tient.
 *
 *   node outils/essais/figurants.js     (chaîné dans `npm run essais`)
 */
const path = require("path");
const { pathToFileURL } = require("url");

let ko = 0;
const dit = (ok, q, d) => {
  console.log((ok ? "  ok   " : "  ÉCHEC") + "  " + q + (d ? "   → " + d : ""));
  if (!ok) ko++;
};

/** Une grille de `w` × `h` cases : une allée en croix, large de `l` cases, le reste en stands. */
function croix(w, h, l, deg = 0){
  const a = deg * Math.PI / 180;
  const nappe = new Uint8Array(w * h), marge = new Uint8Array(w * h);
  const mx = w / 2, my = h / 2;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++){
    const dx = Math.abs(x + .5 - mx), dy = Math.abs(y + .5 - my);
    const d = Math.max(l / 2 - dx, l / 2 - dy);
    if (d > 0){ nappe[y * w + x] = 1; marge[y * w + x] = Math.ceil(d); }
  }
  return { x0: -10, y0: 20, w, h, co: Math.cos(a), si: Math.sin(a), nappe, marge };
}

(async () => {
  const { placeFigurants, graineDe, FIGURANTS_MAX, TENUES, TEINTS } =
    await import(pathToFileURL(path.join(__dirname, "..", "gabarit", "modules", "figurants.mjs")));
  const PAS = .5;

  for (const deg of [0, 23]){
    console.log("Une allée en croix, grille tournée de " + deg + "°");
    const g = croix(200, 160, 12, deg);
    const f = placeFigurants(g, PAS, graineDe("fep27"));
    dit(f.length > 20, "l'allée se peuple", f.length + " figurants");
    const caseDe = (x, y) => {
      const u = x * g.co + y * g.si, v = -x * g.si + y * g.co;
      return Math.floor((v - g.y0) / PAS) * g.w + Math.floor((u - g.x0) / PAS);
    };
    // un compagnon se pose à cinquante-cinq centimètres : il reste sur l'allée
    dit(f.every(p => g.nappe[caseDe(p.x, p.y)]), "chacun a les pieds dans l'allée");
    let proches = 0;
    for (let i = 0; i < f.length; i++) for (let j = i + 1; j < f.length; j++)
      if (Math.hypot(f[i].x - f[j].x, f[i].y - f[j].y) < .5) proches++;
    dit(proches === 0, "personne ne se marche dessus", proches + " paires trop serrées");
    const encore = placeFigurants(g, PAS, graineDe("fep27"));
    dit(JSON.stringify(encore) === JSON.stringify(f), "la même graine rend la même foule");
    const autre = placeFigurants(g, PAS, graineDe("fep26"));
    dit(JSON.stringify(autre) !== JSON.stringify(f), "un autre pavillon, une autre foule");
    dit(f.every(p => p.tenue >= 0 && p.tenue < TENUES.length && p.peau >= 0 && p.peau < TEINTS.length),
      "tenues et teints pris dans leurs listes");
  }

  console.log("Un hall immense");
  const grand = croix(3000, 3000, 2800);
  const foule = placeFigurants(grand, PAS, 7), n = foule.length;
  dit(n <= FIGURANTS_MAX, "la borne tient", n + " ≤ " + FIGURANTS_MAX);
  // la borne ne doit pas arrêter le semis en route : le bas du hall a son monde
  const bas = foule.filter(p => p.y > grand.y0 + grand.h * PAS / 2).length;
  dit(bas > n * .35, "la foule couvre tout le hall", bas + " sur " + n + " dans la moitié basse");

  console.log("Les duos");
  {
    const g = croix(200, 160, 12, 23), f = placeFigurants(g, PAS, graineDe("fep27"));
    let duos = 0, deTravers = 0;
    for (let i = 0; i < f.length; i++) for (let j = i + 1; j < f.length; j++){
      const d = Math.hypot(f[i].x - f[j].x, f[i].y - f[j].y);
      if (d > .6) continue;
      duos++;
      // côte à côte : l'écart est perpendiculaire au sens où ils regardent
      const c = f[i].cap * Math.PI / 180;
      if (Math.abs(((f[j].x - f[i].x) * Math.cos(c) + (f[j].y - f[i].y) * Math.sin(c)) / d) > .05) deTravers++;
      if (f[i].cap !== f[j].cap) deTravers++;
    }
    dit(duos > 0, "il y a des duos", duos + "");
    dit(deTravers === 0, "un duo marche côte à côte, du même côté", deTravers + " de travers");
    // le cap suit les allées, tournées de 23° avec le hall, à douze degrés près
    dit(f.every(p => { const r = ((p.cap - 23) % 90 + 90) % 90; return r <= 12 || r >= 78; }),
      "chacun regarde le long d'une allée");
  }

  console.log("La silhouette, à l'échelle de la maquette");
  const { maillagesFigurant, HAUTEUR_FIGURANT, MODELES } =
    await import(pathToFileURL(path.join(__dirname, "..", "gabarit", "modules", "figurants.mjs")));
  // `camera.mjs` ne s'importe pas hors de la page : on relit sa hauteur de stand
  const fs = require("fs");
  const HAUTEUR_STAND = Number(/HAUTEUR_STAND = ([\d.]+)/.exec(fs.readFileSync(
    path.join(__dirname, "..", "gabarit", "modules", "camera.mjs"), "utf8"))[1]);
  const { ombre, modeles } = maillagesFigurant();
  const etendue = (m, k) => {
    const v = m.attributes.positions.value;
    let lo = Infinity, hi = -Infinity;
    for (let i = k; i < v.length; i += 3){ lo = Math.min(lo, v[i]); hi = Math.max(hi, v[i]); }
    return [lo, hi];
  };
  dit(etendue(ombre, 2)[1] < .01, "l'ombre reste au sol");
  dit(modeles.length === MODELES.length, "un jeu de maillages par allure", modeles.length + "");
  modeles.forEach((M, k) => {
    const nom = MODELES[k].nom;
    dit(Object.values(M).every(m => { const p = m.attributes.positions.value, n = m.attributes.normals.value;
      return p.length > 0 && p.length % 9 === 0 && p.length === n.length && p.every(Number.isFinite); }),
      nom + " : des triangles entiers, une normale par sommet");
    const tout = Object.values(M);
    const sommet = Math.max(...tout.map(m => etendue(m, 2)[1]));
    dit(Math.abs(Math.min(...tout.map(m => etendue(m, 2)[0]))) < 1e-9, nom + " : les pieds au sol");
    dit(Math.abs(sommet - HAUTEUR_FIGURANT) < 1e-6, nom + " : la hauteur annoncée est celle du maillage");
    // un visiteur devant une cloison de deux mètres cinquante : les deux tiers
    const part = sommet / HAUTEUR_STAND;
    dit(part > .6 && part < .72, nom + " : les deux tiers d'un stand", (part * 100).toFixed(0) + " %");
    dit(sommet * 1.08 < HAUTEUR_STAND * .75, nom + " : le plus grand reste sous les trois quarts d'un stand");
    const carrure = etendue(M.haut, 1)[1] - etendue(M.haut, 1)[0];
    dit(carrure > .34 && carrure < .46, nom + " : une carrure d'épaules", (carrure * 100).toFixed(0) + " cm");
    dit(sommet / carrure > 2.4, nom + " : une silhouette, pas une borne");
    dit(etendue(M.cheveux, 2)[1] > etendue(M.peau, 2)[1], nom + " : les cheveux coiffent la tête");
    dit(etendue(M.chaussures, 2)[1] < .08, nom + " : les chaussures au sol");
    if (!MODELES[k].jupe){
      // deux jambes qu'on voit séparées, et non un seul pilier
      const v = M.bas.attributes.positions.value;
      let creux = Infinity;
      for (let i = 0; i < v.length; i += 3) if (v[i + 2] > .3) creux = Math.min(creux, Math.abs(v[i + 1]));
      dit(creux > .015, nom + " : un jour entre les jambes", (2 * creux * 100).toFixed(1) + " cm");
    }
  });
  // assez légers pour être répétés six cents fois
  const sommets = modeles.reduce((t, M) => t + Object.values(M).reduce((u, m) => u + m.attributes.positions.value.length / 3, 0), 0);
  dit(sommets / modeles.length < 6000, "un figurant tient en peu de sommets", Math.round(sommets / modeles.length) + " par allure");

  if (ko){ console.log("\n" + ko + " échec(s)"); process.exit(1); }
  console.log("\nTout passe.");
})();
