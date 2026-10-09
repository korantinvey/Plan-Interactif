/**
 * Le plan sur la Terre : les calculs de `modules/terre.mjs`, éprouvés seuls.
 *
 * Ce sont eux qui disent où tombe la carte sous le pavillon. Une erreur n'y
 * fait rien planter : elle décale le quartier d'une demi-rue, et l'on ne s'en
 * aperçoit qu'en vérifiant un calage chez un client. D'où des cas qui
 * mesurent — aller et retour, valeurs connues de l'ellipsoïde, réciproques —
 * plutôt que de rejouer le code.
 *
 *   node outils/essais/terre.js     (chaîné dans `npm run essais`)
 */
const path = require("path");
const { pathToFileURL } = require("url");

let ko = 0;
const dit = (ok, q, d) => {
  console.log((ok ? "  ok   " : "  ÉCHEC") + "  " + q + (d ? "   → " + d : ""));
  if (!ok) ko++;
};
const proche = (a, b, tol) => Math.abs(a - b) <= tol;
const ecart = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);

(async () => {
  const T = await import(pathToFileURL(
    path.join(__dirname, "..", "gabarit", "modules", "terre.mjs")).href);
  const { DEG } = T;

  console.log("\n=== 1. Ce que vaut un degré, sur l'ellipsoïde ===");
  /* Les valeurs de référence de WGS84 : à l'équateur, un degré de latitude
     fait 110 574 m et un de longitude 111 320 m ; à 45°, 111 132 m et
     78 847 m. La sphère se tromperait de plusieurs centaines de mètres. */
  const eq = T.metresParDegre(0), q45 = T.metresParDegre(45);
  dit(proche(eq.lat, 110574, 1) && proche(eq.lon, 111320, 1),
    "à l'équateur", Math.round(eq.lat) + " m, " + Math.round(eq.lon) + " m");
  dit(proche(q45.lat, 111132, 1) && proche(q45.lon, 78847, 1),
    "à 45° de latitude", Math.round(q45.lat) + " m, " + Math.round(q45.lon) + " m");

  console.log("\n=== 2. Du plan à la Terre, et retour ===");
  /* Une seule matrice sert dans les deux sens : l'aller et le retour ne
     doivent pas pouvoir diverger, à aucun angle. */
  const cal = { lon: 2.2885, lat: 48.8325, x: 120, y: -40, angle: 0 };
  let pire = 0;
  for (const a of [0, 17, 90, 133.4, -61, 270]){
    const c = { ...cal, angle: a * DEG };
    for (const p of [[0, 0], [120, -40], [850, 310], [-400, 1200]])
      pire = Math.max(pire, ecart(T.versLePlan(T.versTerre(p, c), c), p));
  }
  dit(pire < 1e-6, "versLePlan défait versTerre, à six angles", pire.toExponential(1) + " m");
  /* Le Y du plan descend, le nord monte : un point posé plus bas sur le plan
     est plus au sud. */
  const sud = T.versTerre([cal.x, cal.y + 100], cal);
  dit(sud[1] < cal.lat && proche(sud[0], cal.lon, 1e-12), "le Y du plan pointe au sud");
  /* L'angle se compte comme en géométrie, de l'est vers le nord : un quart de
     tour fait de l'axe des X le nord. */
  const nord = T.versTerre([cal.x + 100, cal.y], { ...cal, angle: 90 * DEG });
  dit(nord[1] > cal.lat && proche(nord[0], cal.lon, 1e-12), "un quart de tour fait de l'axe des X le nord");

  console.log("\n=== 3. Ré-ancrer ne déplace pas la carte ===");
  /* On ré-ancre à chaque image d'une rotation, sur le point qu'on regarde :
     celui-là ne doit pas bouger du tout, sans quoi la carte glisserait sous le
     doigt. Ailleurs, le calage se relit à la latitude de la nouvelle ancre, et
     un point lointain bouge d'autant — de l'ordre du centimètre au kilomètre,
     ce qu'un pixel de la carte ne montre pas. */
  const c3 = { ...cal, angle: 23 * DEG, fond: "ign", force: 0.5, style: "s" };
  const r = T.reancre(c3, [600, 250]);
  const m3 = T.metresParDegre(cal.lat);
  const metres = (a, b) => Math.hypot((a[0] - b[0]) * m3.lon, (a[1] - b[1]) * m3.lat);
  const vise = metres(T.versTerre([600, 250], r), T.versTerre([600, 250], c3));
  dit(vise < 1e-6, "le point qu'on regarde reste où il est", vise.toExponential(1) + " m");
  let loin = 0;
  for (const p of [[0, 0], [900, -300], [-200, 900]])
    loin = Math.max(loin, metres(T.versTerre(p, r), T.versTerre(p, c3)));
  dit(loin < 0.05, "un point à un kilomètre bouge de moins de cinq centimètres", (loin * 100).toFixed(2) + " cm");
  dit(r.fond === "ign" && r.style === "s" && r.angle === c3.angle,
    "et le calage garde son fond, son style et son angle");

  console.log("\n=== 4. La pyramide de tuiles ===");
  let pirePx = 0;
  for (const z of [3, 12, 19]) for (const lat of [-70, 0, 48.83, 84]){
    const py = T.pixelsMercator(2.29, lat, z)[1];
    pirePx = Math.max(pirePx, Math.abs(T.latitudeDePixel(py, z) - lat));
  }
  dit(pirePx < 1e-9, "latitudeDePixel défait pixelsMercator", pirePx.toExponential(1) + "°");
  const coin = T.pixelsMercator(-180, 0, 0);
  dit(coin[0] === 0 && proche(coin[1], T.PX_TUILE / 2, 1e-9), "l'équateur coupe la tuile du niveau zéro en deux");
  const e = T.echelleDesTuiles(cal, 17);
  dit(proche(e.x, e.y, e.x * 0.01) && proche(e.x, 0.785, 0.01),
    "un pixel au niveau 17, à Paris, fait 0,79 m dans les deux sens", e.x.toFixed(4) + " × " + e.y.toFixed(4));
  const zz = [T.niveauDesTuiles(cal, e.x, 22), T.niveauDesTuiles(cal, 1e6, 22), T.niveauDesTuiles(cal, 1e-6, 19)];
  dit(zz[0] === 17 && zz[1] === 2 && zz[2] === 19, "le niveau retrouvé, puis borné", zz.join(", "));

  console.log("\n=== 5. Les contours d'un hall ===");
  const carre = [[0, 0], [10, 0], [10, 10], [0, 10]];
  dit(T.aireDuContour(carre) === 100 && T.aireDuContour(carre.slice().reverse()) === 100,
    "l'aire ne dépend pas du sens de parcours");
  /* Le centre de la surface, et non la moyenne des sommets : un côté chargé
     de points ne doit pas tirer le centre à lui. */
  const charge = [[0, 0], [2, 0], [4, 0], [6, 0], [8, 0], [10, 0], [10, 10], [0, 10]];
  const c5 = T.centreDuContour(charge);
  dit(proche(c5[0], 5, 1e-9) && proche(c5[1], 5, 1e-9), "le centre ne penche pas vers les sommets",
    c5.map((v) => v.toFixed(3)).join(", "));
  const tourne = (pts, a) => pts.map(([x, y]) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)]);
  const hall = [[0, 0], [80, 0], [80, 30], [0, 30]];
  const axes = [0, 12, 44, 89].map((a) => T.axeDuContour(tourne(hall, a * DEG)) / DEG);
  dit(proche(axes[0], 0, 1e-6) && proche(axes[1], 12, 1e-6) && proche(axes[2], 44, 1e-6) && proche(axes[3], -1, 1e-6),
    "l'axe d'un hall, au quart de tour près", axes.map((a) => a.toFixed(1) + "°").join(", "));
  /* Un pan coupé de moins de deux mètres ne compte pas. */
  const coupe = [[0, 0], [80, 0], [80, 29], [79, 30], [0, 30]];
  dit(proche(T.axeDuContour(coupe), 0, 1e-9), "un pan coupé ne fait pas tourner la façade");

  console.log(ko ? "\n" + ko + " ÉCHEC(S)\n" : "\nLe plan tombe juste sur la Terre.\n");
  process.exit(ko ? 1 : 0);
})();
