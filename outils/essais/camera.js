/**
 * La caméra du plan immersif (`modules/camera.mjs`), éprouvée hors de la page.
 *
 * Elle est tenue en trois écritures qui doivent dire la même chose : les
 * matrices que la carte graphique emploie pour dessiner, la conversion du sol
 * vers l'écran, et son inverse, par où passent les gestes. Qu'une seule
 * diverge, et le doigt saisit le plan ailleurs que là où il le voit — sans
 * erreur, seulement un plan qui glisse de travers. On fait donc passer les
 * mêmes points par les trois.
 *
 *   node outils/essais/camera.js     (lancé par `npm run essais`)
 */
const path = require("path");
const { pathToFileURL } = require("url");

let ko = 0;
const dit = (ok, q, d) => {
  console.log((ok ? "  ok   " : "  ÉCHEC") + "  " + q + (d ? "   → " + d : ""));
  if (!ok) ko++;
};
const pres = (a, b, e = 1e-6) => Math.abs(a - b) <= e * Math.max(1, Math.abs(a), Math.abs(b));

/** Une matrice en colonnes appliquée à un point. */
const applique = (m, [x, y, z]) => [0, 1, 2, 3].map((r) =>
  m[r] * x + m[4 + r] * y + m[8 + r] * z + m[12 + r]);

(async () => {
  const C = await import(pathToFileURL(path.join(__dirname, "..", "gabarit", "modules", "camera.mjs")));
  const W = 1200, H = 800;

  console.log("Hors jeu, la caméra ne touche à rien");
  C.demandeCamera(true, 20);
  dit(String(C.ecranVersPlat(123, 456, W, H)) === "123,456", "l'écran reste le sol tant que le dessin ne l'a pas mise en jeu");

  for (const cap of [0, -8, 35, 180]){
    C.demandeCamera(true, cap);
    C.metsEnJeu(true);
    console.log("Cap " + cap + "°");
    const points = [[600, 400], [100, 700], [1100, 650], [300, 250], [950, 120]];
    let allerRetour = true, centre;
    for (const [x, y] of points){
      const e = C.platVersEcran(x, y, W, H), p = C.ecranVersPlat(e[0], e[1], W, H);
      if (!pres(p[0], x) || !pres(p[1], y)) allerRetour = false;
      if (x === 600 && y === 400) centre = e;
    }
    dit(allerRetour, "le sol vu puis redressé retombe sur lui-même");
    dit(pres(centre[0], 600) && pres(centre[1], 400), "le centre de la scène ne bouge pas");

    /* La vue 3D pour un cadre de 60 × 40 m centré en (10, 20), à vingt
       pixels par mètre : un point du sol doit tomber à l'écran là où la
       conversion le place, depuis sa position à plat. */
    const s = 20, cx = 10, cy = 20;
    const { vue, projection } = C.matricesCamera(W, H, s);
    let accord = true, ecart = "";
    for (const [x, y] of [[10, 20], [-15, 5], [35, 38], [0, 0]]){
      const v = applique(vue, [x - cx, y - cy, 0]);
      const c = applique(projection, v.slice(0, 3));
      const sx = (c[0] / c[3] + 1) / 2 * W, sy = (1 - c[1] / c[3]) / 2 * H;
      const att = C.platVersEcran(W / 2 + (x - cx) * s, H / 2 + (y - cy) * s, W, H);
      if (!pres(sx, att[0], 1e-9) || !pres(sy, att[1], 1e-9)){ accord = false; ecart = sx + "," + sy + " ≠ " + att; }
    }
    dit(accord, "les matrices du dessin placent le sol là où le geste le cherche", ecart);

    // ce qui monte se rapproche de l'œil et remonte à l'écran
    const bas = applique(projection, applique(vue, [0, 0, 0]).slice(0, 3));
    const haut = applique(projection, applique(vue, [0, 0, 2]).slice(0, 3));
    dit(haut[1] / haut[3] > bas[1] / bas[3] && haut[2] / haut[3] < bas[2] / bas[3],
      "un stand monte vers le haut de l'écran, devant le sol");
  }

  C.metsEnJeu(false);
  if (ko){ console.log("\n" + ko + " échec(s)."); process.exit(1); }
  console.log("\nLa caméra tient.");
})();
