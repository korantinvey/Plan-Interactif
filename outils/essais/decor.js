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
  const { meuble, TYPES_MEUBLES, objetRepere, OBJETS_REPERE, comptoir } = await import(pathToFileURL(path.join(__dirname, "..", "gabarit", "modules", "decor.mjs")));

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

  console.log("Le comptoir placé à la main");
  const hall = rect(10, 20, 22, 14);       // de -1 à 21 en x, de 13 à 27 en y
  const auto = comptoir(hall, null);
  dit(!auto.choisi && Math.abs(auto.cx - 10) < 1e-6 && Math.abs(auto.cy - 20) < 1e-6,
    "sans réglage, il se pose au milieu");
  dit(Math.abs(Math.abs(Math.sin(auto.angle * Math.PI / 180)) - 1) < 1e-6,
    "sans réglage, en travers du plus long côté", auto.angle.toFixed(1) + "°");
  const place = comptoir(hall, { u: .25, v: .75, a: 0 });
  dit(place.choisi && Math.abs(place.cx - 4.5) < 1e-6 && Math.abs(place.cy - 23.5) < 1e-6,
    "réglé, il se pose où on l'a voulu, en part de l'emprise");
  const pieces = meuble("accueil", hall, { u: .25, v: .75, a: 0 });
  const plat = pieces.find(x => x.role === "comptoir");
  const ys = plat.polygon.map(p => p[1]), xs = plat.polygon.map(p => p[0]);
  dit(Math.max(...xs) - Math.min(...xs) > Math.max(...ys) - Math.min(...ys),
    "tourné à 0°, son long côté suit l'horizontale du plan");
  const tourne = meuble("accueil", hall, { u: .25, v: .75, a: 90 }).find(x => x.role === "comptoir");
  const ys2 = tourne.polygon.map(p => p[1]), xs2 = tourne.polygon.map(p => p[0]);
  dit(Math.max(...ys2) - Math.min(...ys2) > Math.max(...xs2) - Math.min(...xs2), "tourné à 90°, la verticale");
  dit(comptoir(hall, { u: 2, v: .5, a: 0 }).choisi === false, "un réglage hors de l'emprise est ignoré");
  dit(meuble("accueil", hall, { u: NaN, v: 0, a: 0 }).some(x => x.role === "comptoir"),
    "un réglage illisible laisse le placement d'office");

  console.log("Une zone immense");
  const n = meuble("conferences", rect(0, 0, 400, 300)).length;
  dit(n <= 600, "le décor s'arrête à la borne", n + " pièces");

  console.log("Les objets des repères");
  for (const g of OBJETS_REPERE){
    const o = objetRepere(g, 100, 50, 7.2);
    const sommet = Math.max(...o.pieces.map(x => x.haut));
    dit(o.pieces.length > 0 && o.dessus >= sommet, g + " : un objet, la pastille posée dessus", "dessus " + o.dessus.toFixed(2));
    const xs = o.pieces.flatMap(x => x.polygon.map(p => p[0]));
    dit(Math.max(...xs) - Math.min(...xs) <= 7.2, g + " : pas plus large que sa pastille");
  }
  dit(!objetRepere("wc", 0, 0, 7).pieces.length, "un repère sans objet reste une pastille au sol");
  const esc = objetRepere("escalier", 0, 0, 6);
  const marches = esc.pieces.map(x => x.haut);
  dit(marches.every((h, i) => !i || h > marches[i - 1]), "les marches montent l'une après l'autre");
  dit(esc.ancre[1] < 0, "la pastille se pose au fond, au-dessus de la dernière marche");

  if (ko){ console.log("\n" + ko + " échec(s)."); process.exit(1); }
  console.log("\nLe décor tient.");
})();
