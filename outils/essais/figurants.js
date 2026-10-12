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
  const { placeFigurants, silhouette, graineDe, FIGURANTS_MAX, TENUES, TEINTS } =
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

  console.log("La silhouette");
  const s = silhouette({ x: 3, y: 4, tenue: 0, peau: 0, taille: 1 });
  dit(s.length === 3, "jambes, buste, tête");
  dit(s.every((p, i) => i === 0 || p.polygon[0][2] >= s[i - 1].polygon[0][2] + s[i - 1].haut - 1e-9),
    "chaque pièce se pose sur la précédente");
  const haut = s[2].polygon[0][2] + s[2].haut;
  dit(haut < 1.6, "plus petit qu'un stand", haut.toFixed(2) + " m");

  if (ko){ console.log("\n" + ko + " échec(s)"); process.exit(1); }
  console.log("\nTout passe.");
})();
