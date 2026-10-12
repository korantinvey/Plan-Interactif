/**
 * Le décor de la vue immersive (`modules/decor.mjs`), éprouvé hors de la page.
 *
 * Le mobilier se range seul dans une zone dont rien ne dit l'aménagement : ce
 * qu'on vérifie, c'est qu'il y tient — aucune pièce ne déborde du contour,
 * même tourné — qu'une zone se meuble selon son type, et qu'une zone immense
 * ne coûte pas au dessin plus que la borne.
 *
 *   node outils/essais/decor.js     (chaîné dans `npm run essais`)
 */
const path = require("path");
const { pathToFileURL } = require("url");

let ko = 0;
const dit = (ok, q, d) => {
  console.log((ok ? "  ok   " : "  ÉCHEC") + "  " + q + (d ? "   → " + d : ""));
  if (!ok) ko++;
};
const dedans = (an, x, y) => {
  let ok = false;
  for (let i = 0, j = an.length - 1; i < an.length; j = i++){
    const [xi, yi] = an[i], [xj, yj] = an[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) ok = !ok;
  }
  return ok;
};
/** Un rectangle de `w` × `h` mètres, tourné de `deg` degrés autour de (x, y). */
const rect = (x, y, w, h, deg = 0) => {
  const a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
  return [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]]
    .map(([u, v]) => [x + u * c - v * s, y + u * s + v * c]);
};

(async () => {
  const { meuble, TYPES_MEUBLES } = await import(pathToFileURL(path.join(__dirname, "..", "gabarit", "modules", "decor.mjs")));

  for (const deg of [0, 27]){
    console.log("Zones tournées de " + deg + "°");
    for (const type of TYPES_MEUBLES){
      const zone = rect(1350, -1500, 22, 14, deg);
      const p = meuble(type, zone);
      dit(p.length > 0, type + " : la zone se meuble", p.length + " pièces");
      const deborde = p.filter(x => x.polygon.some(([a, b]) => !dedans(zone, a, b)));
      dit(!deborde.length, type + " : rien ne déborde du contour", deborde.length ? deborde[0].role : "");
    }
  }

  console.log("Ce que chaque type pose");
  const roles = (type) => new Set(meuble(type, rect(0, 0, 22, 14)).map(x => x.role));
  dit(["plateau", "assise"].every(r => roles("restauration").has(r)), "un restaurant : des tables et des chaises");
  dit(["scene", "ecran", "assise"].every(r => roles("conferences").has(r)), "une salle : une scène, un écran, des sièges");
  dit(roles("accueil").has("comptoir"), "un accueil : un comptoir");
  dit(roles("vestiaire").has("portant"), "un vestiaire : des portants");
  dit(!meuble("transport", rect(0, 0, 22, 14)).length && !meuble("", rect(0, 0, 22, 14)).length,
    "une zone sans type meublable reste vide");
  dit(!meuble("restauration", rect(0, 0, 1.5, 1.5)).length, "une zone trop petite ne reçoit rien");

  console.log("Une zone immense");
  const n = meuble("conferences", rect(0, 0, 400, 300)).length;
  dit(n <= 600, "le décor s'arrête à la borne", n + " pièces");

  if (ko){ console.log("\n" + ko + " échec(s)."); process.exit(1); }
  console.log("\nLe décor tient.");
})();
