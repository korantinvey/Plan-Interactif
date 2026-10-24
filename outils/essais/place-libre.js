/**
 * La place libre d'un emplacement découpé : `modules/place-libre.mjs`,
 * éprouvé seul.
 *
 * Le nom d'un emplacement qui porte des parts dessinées s'écrit dans ce qui
 * reste libre, et se tait s'il ne reste rien. Une erreur ne ferait rien
 * planter : le nom repasserait sur les parts, ou disparaîtrait d'un
 * emplacement qui avait la place. D'où des emplacements connus au mètre.
 *
 *   node outils/essais/place-libre.js     (chaîné dans `npm run essais`)
 */
const path = require("path");
const { pathToFileURL } = require("url");

let ko = 0;
const dit = (ok, q, d) => {
  console.log((ok ? "  ok   " : "  ÉCHEC") + "  " + q + (d ? "   → " + d : ""));
  if (!ok) ko++;
};
const egal = (a, b) => Boolean(a && b) && a.length === b.length && a.every((v, i) => Math.abs(v - b[i]) < 1e-9);

(async () => {
  const { rectangleLibre } = await import(pathToFileURL(
    path.join(__dirname, "..", "gabarit", "modules", "place-libre.mjs")).href);
  const b = [0, 0, 10, 10];

  console.log("\n=== 1. Sans part ===");
  dit(rectangleLibre(b, []) === b, "un emplacement sans part garde toute sa place");
  dit(rectangleLibre(b, [[20, 20, 30, 30]]) === b, "une part posée à côté ne compte pas");

  console.log("\n=== 2. Une part ===");
  /* La moitié gauche est dessinée : le nom va dans la moitié droite. */
  const r = rectangleLibre(b, [[0, 0, 5, 10]]);
  dit(egal(r, [5, 0, 10, 10]), "la moitié restée libre", JSON.stringify(r));
  /* Une part au milieu : quatre bandes libres autour d'elle, de 3 m ; la
     plus vaste est l'une des deux de toute la longueur. */
  const m = rectangleLibre(b, [[3, 3, 7, 7]]);
  dit(Boolean(m) && (m[2] - m[0]) * (m[3] - m[1]) === 30, "autour d'une part centrale, la plus grande bande", JSON.stringify(m));

  console.log("\n=== 3. La note choisit, pas la surface ===");
  /* Deux bandes libres de même surface : 2 m sur 10 debout à gauche, 10 m
     sur 2 couchée en bas. Un nom long, qu'on note par la largeur, préfère la
     couchée. */
  const parts = [[2, 0, 10, 8]];
  const surface = rectangleLibre(b, parts);
  const large = rectangleLibre(b, parts, (w, h) => Math.min(w / 8, h));
  dit(egal(surface, [0, 0, 2, 10]), "à surface égale, la première trouvée", JSON.stringify(surface));
  dit(egal(large, [0, 8, 10, 10]), "à la largeur, la bande couchée — le bas entier", JSON.stringify(large));

  console.log("\n=== 4. Entièrement découpé ===");
  dit(rectangleLibre(b, [[0, 0, 5, 10], [5, 0, 10, 10]]) === null, "deux parts couvrent tout : rien");
  /* Un liseré de 50 cm entre deux parts n'est pas une place. */
  dit(rectangleLibre(b, [[0, 0, 4.75, 10], [5.25, 0, 10, 10]]) === null, "un liseré entre deux parts ne compte pas");
  /* Un coin de 1,5 m sur 1,5 : plus d'un mètre de côté, mais 2 % de la
     surface — un reste, pas une place. */
  dit(rectangleLibre(b, [[0, 0, 10, 8.5], [0, 8.5, 8.5, 10]]) === null, "un coin minuscule ne compte pas");

  console.log(ko ? "\n" + ko + " échec(s)." : "\nTout passe.");
  process.exit(ko ? 1 : 0);
})();
