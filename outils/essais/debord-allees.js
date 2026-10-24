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

  /* Une place se dit par ce qu'elle ajoute de chaque côté : gauche, haut,
     droite, bas. */
  const montre = (r) => JSON.stringify((r || []).map(p => p.map(v => +v.toFixed(2))));

  console.log("\n=== 1. Une rangée, une allée, la rangée d'en face ===");
  /* Trois stands de 3 m sur 3 côte à côte, une allée de 4 m dessous, et trois
     autres en face. Au-dessus, rien. */
  const a = stand("A", 0, 0, 3, 3), b = stand("B", 3, 0, 3, 3), c = stand("C", 6, 0, 3, 3);
  const a2 = stand("A2", 0, 7, 3, 3), b2 = stand("B2", 3, 7, 3, 3), c2 = stand("C2", 6, 7, 3, 3);
  const r = debordsAuxAllees([a, b, c, a2, b2, c2], []);
  /* B, pris entre A et C, ne s'élargit pas. Vers le bas, la moitié de
     l'allée ; vers le haut, rien ne l'arrête que la borne. */
  const rb = r.get(b) || [];
  dit(rb.length === 1 && rb[0][0] === 0 && rb[0][2] === 0 && proche(rb[0][1], 2) && proche(rb[0][3], 2),
    "le stand du milieu ne gagne qu'en hauteur, la moitié de l'allée vers elle", montre(rb));
  /* Le nom de B et celui de B2 débordent chacun de 2 m au plus vers l'allée
     de 4 m : ils se rejoignent au milieu sans se chevaucher. */
  const rb2 = r.get(b2) || [];
  dit(rb.every(p => p[3] <= 2 + 1e-9) && rb2.every(p => p[1] <= 2 + 1e-9),
    "deux stands face à face se partagent l'allée sans se chevaucher");
  /* A, au bout de la rangée, a sa gauche libre et B collé à sa droite : il
     s'élargit vers la gauche seulement, et jamais sur B. */
  const ra = r.get(a) || [];
  dit(ra.some(p => p[0] > 0) && ra.every(p => p[2] === 0),
    "un stand collé à son voisin s'élargit du seul côté libre", montre(ra));

  console.log("\n=== 2. Un seul côté libre ===");
  /* Un stand collé à celui du dessous, une allée de 4 m au-dessus : centré,
     il ne gagnait rien ; il monte désormais seul vers l'allée. */
  const haut = stand("Haut", 0, 0, 6, 2), dessous = stand("Dessous", 0, 2, 6, 3), face = stand("Face", 0, -6, 6, 2);
  const rh = debordsAuxAllees([haut, dessous, face], []).get(haut) || [];
  dit(rh.some(p => proche(p[1], 2) && p[3] === 0) && rh.every(p => p[3] === 0),
    "il déborde vers l'allée, jamais sur le voisin collé", montre(rh));
  /* À place égale, le centré passe d'abord. */
  const libre = stand("Libre", 0, 0, 2, 2), loin = stand("Loin", 0, 4, 2, 2);
  const rl = debordsAuxAllees([libre, loin], []).get(libre) || [];
  const verticales = rl.filter(p => !p[0] && !p[2]);
  dit(verticales.length >= 1 && proche(verticales[0][1], verticales[0][3]),
    "la place centrée passe avant la décalée", montre(rl));

  console.log("\n=== 3. Un voisin qui mord ===");
  /* Le voisin de droite empiète de 10 cm : il ferme la droite, et la gauche
     reste ouverte. Il fermait tout. */
  const m1 = stand("M", 0, 0, 3, 3), mord = stand("Mord", 2.9, 0, 3, 3);
  const rm = debordsAuxAllees([m1, mord], []).get(m1) || [];
  dit(rm.some(p => p[0] > 0) && rm.every(p => p[2] === 0),
    "il ne ferme que son côté", montre(rm));

  console.log("\n=== 4. Un stand seul, les zones ===");
  const seul = stand("Seul", 0, 0, 2, 2);
  const rs = debordsAuxAllees([seul], []).get(seul) || [];
  dit(rs.some(p => p.every(v => proche(v, DEBORD_MAX))), "sans voisin, il gagne sa borne de tous côtés", montre(rs));
  /* Une zone de l'organisateur à 1 m à droite : le nom en prend la moitié. */
  const s3 = stand("S", 0, 0, 2, 2), zone = { c: [4, 1], bb: [2, 2] };
  const r3 = debordsAuxAllees([s3], [zone]).get(s3) || [];
  dit(r3.every(p => p[2] <= .5 + 1e-9) && r3.some(p => proche(p[2], .5)),
    "une zone voisine arrête le nom à mi-chemin", montre(r3));
  /* Le carré d'un pavillon, qui contient le stand, n'est pas un obstacle. */
  const carre = { c: [1, 1], bb: [20, 20] };
  const r4 = debordsAuxAllees([s3], [carre]).get(s3) || [];
  dit(r4.some(p => p.every(v => proche(v, DEBORD_MAX))), "la zone qui abrite le stand ne l'arrête pas");

  console.log("\n=== 5. Le coin, au croisement de deux allées ===");
  /* Un stand en bout d'îlot, et un autre en diagonale, de l'autre côté du
     croisement, à 1 m dans chaque sens : élargi et rehaussé à la fois, le nom
     du premier mordrait sur la part du second. Chaque sens seul reste permis. */
  const p = stand("P", 0, 0, 2, 2), q = stand("Q", 3, 3, 2, 2);
  const r5 = debordsAuxAllees([p, q], []).get(p) || [];
  dit(r5.length > 0 && !r5.some(([g, h, d, b]) => (g || d) && (h || b)),
    "pas de coin quand le stand d'en face en diagonale est trop proche", montre(r5));

  console.log("\n=== 6. Un stand sans nom ===");
  const anonyme = { c: [0, 0], bb: [2, 2] };
  dit(!debordsAuxAllees([anonyme], []).has(anonyme), "un stand sans nom n'a rien à écrire");

  console.log(ko ? "\n" + ko + " échec(s)." : "\nTout passe.");
  process.exit(ko ? 1 : 0);
})();
