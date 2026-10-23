/**
 * Le débord des noms sur les allées : `modules/debord-allees.mjs`, éprouvé
 * seul.
 *
 * Quand tous les noms s'écrivent à la même taille, un nom peut déborder de
 * son stand sur l'allée, jamais sur un voisin ni sur une zone. Une erreur ne
 * ferait rien planter : deux noms se chevaucheraient dans une allée, ou l'un
 * mordrait sur le stand d'à côté, et l'on ne le verrait qu'à l'écran. D'où un
 * îlot connu au centimètre, une allée, un stand d'en face, une zone.
 *
 *   node outils/essais/debord-allees.js     (chaîné dans `npm run essais`)
 */
const path = require("path");
const { pathToFileURL } = require("url");

let ko = 0;
const dit = (ok, q, d) => {
  console.log((ok ? "  ok   " : "  ÉCHEC") + "  " + q + (d ? "   → " + d : ""));
  if (!ok) ko++;
};
const proche = (a, b) => Math.abs(a - b) < 1e-9;
/** Un stand de `w` sur `h` dont le coin haut gauche est en `x`, `y`. */
const stand = (nom, x, y, w, h) => ({ nom, c: [x + w / 2, y + h / 2], bb: [w, h] });

(async () => {
  const D = await import(pathToFileURL(
    path.join(__dirname, "..", "gabarit", "modules", "debord-allees.mjs")).href);
  const { debordsAuxAllees, DEBORD_MAX } = D;

  console.log("\n=== 1. Une rangée, une allée, la rangée d'en face ===");
  /* Trois stands de 3 m sur 3 côte à côte, une allée de 4 m dessous, et trois
     autres en face. Au-dessus, rien. */
  const a = stand("A", 0, 0, 3, 3), b = stand("B", 3, 0, 3, 3), c = stand("C", 6, 0, 3, 3);
  const a2 = stand("A2", 0, 7, 3, 3), b2 = stand("B2", 3, 7, 3, 3), c2 = stand("C2", 6, 7, 3, 3);
  const r = debordsAuxAllees([a, b, c, a2, b2, c2], []);
  /* B, pris entre A et C, ne s'élargit pas. Vers le bas, la moitié de
     l'allée ; vers le haut, rien ne l'arrête mais il reste centré : il ne
     prend que ce que le bas lui laisse, deux mètres de chaque côté. */
  const rb = r.get(b) || [];
  dit(rb.length === 1 && proche(rb[0][0], 0) && proche(rb[0][1], 4),
    "le stand du milieu ne gagne qu'en hauteur, la moitié de l'allée de chaque côté", JSON.stringify(rb));
  /* Le nom de B et celui de B2 débordent chacun de 2 m vers l'allée de 4 m :
     ils se rejoignent au milieu sans se chevaucher. */
  const rb2 = r.get(b2) || [];
  dit(rb.length && rb2.length && 3 + rb[0][1] / 2 <= 7 - rb2[0][1] / 2 + 1e-9,
    "deux stands face à face se partagent l'allée sans se chevaucher");
  /* A, au bout de la rangée, a sa gauche libre mais B colle à sa droite :
     centré, il ne s'élargit pas. */
  dit((r.get(a) || []).every(([w]) => w === 0), "un stand collé à son voisin ne s'élargit pas");

  console.log("\n=== 2. Un stand seul ===");
  /* Rien autour : le débord s'arrête à sa borne, et le coin est libre. */
  const seul = stand("Seul", 0, 0, 2, 2);
  const rs = debordsAuxAllees([seul], []).get(seul) || [];
  dit(rs.length === 3 && rs.some(([w, h]) => proche(w, 2 * DEBORD_MAX) && proche(h, 2 * DEBORD_MAX)),
    "sans voisin, il gagne sa borne dans les deux sens", JSON.stringify(rs));

  console.log("\n=== 3. Les zones ===");
  /* Une zone de l'organisateur à 1 m à droite : le nom en prend la moitié. */
  const s3 = stand("S", 0, 0, 2, 2), zone = { c: [4, 1], bb: [2, 2] };
  const r3 = debordsAuxAllees([s3], [zone]).get(s3) || [];
  dit(r3.some(([w, h]) => proche(w, 1) && h === 0) && r3.every(([w]) => w <= 1 + 1e-9),
    "une zone voisine arrête le nom à mi-chemin", JSON.stringify(r3));
  /* Le carré d'un pavillon, qui contient le stand, n'est pas un obstacle. */
  const carre = { c: [1, 1], bb: [20, 20] };
  const r4 = debordsAuxAllees([s3], [carre]).get(s3) || [];
  dit(r4.length === 3, "la zone qui abrite le stand ne l'arrête pas", JSON.stringify(r4));

  console.log("\n=== 4. Le coin, au croisement de deux allées ===");
  /* Un stand en bout d'îlot, et un autre en diagonale, de l'autre côté du
     croisement, à 1 m dans chaque sens : élargi et rehaussé à la fois, le nom
     du premier mordrait sur la part du second. Chaque sens seul reste permis. */
  const p = stand("P", 0, 0, 2, 2), q = stand("Q", 3, 3, 2, 2);
  const r5 = debordsAuxAllees([p, q], []).get(p) || [];
  dit(r5.length === 2 && !r5.some(([w, h]) => w > 0 && h > 0),
    "pas de coin quand le stand d'en face en diagonale est trop proche", JSON.stringify(r5));

  console.log("\n=== 5. Un stand sans nom ===");
  const anonyme = { c: [0, 0], bb: [2, 2] };
  dit(!debordsAuxAllees([anonyme], []).has(anonyme), "un stand sans nom n'a rien à écrire");

  console.log(ko ? "\n" + ko + " échec(s)." : "\nTout passe.");
  process.exit(ko ? 1 : 0);
})();
