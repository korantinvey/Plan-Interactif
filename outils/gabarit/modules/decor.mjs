/* ============================================================
   Le décor de la vue immersive — le mobilier des zones de l'organisateur

   Vue de biais (`camera.mjs`), une zone montée d'un bloc ne dit rien de ce
   qu'on y fait : un restaurant et une salle de conférence y sont deux pavés
   de la même couleur. La maquette d'un salon les meuble — des tables rondes
   et leurs chaises, une scène, son écran et des rangées de sièges — et c'est
   ce qui la rend vivante. Ce module meuble donc une zone d'après le type que
   l'exploitant lui a donné (`reperes.mjs` `TYPES_ZONE`).

   Il ne dessine rien : il rend des pièces — un contour au sol en mètres, une
   hauteur, un rôle — que le dessin (`webgl.mjs`) monte en volume et peint
   d'après leur rôle. Il n'importe rien, et s'éprouve seul dans Node
   (`outils/essais/decor.js`).

   Le mobilier n'a pas de vérité à dire : aucune donnée ne place les tables
   d'un restaurant. Il est rangé sur une trame, dans l'axe du plus long côté
   de la zone, et une pièce qui ne tient pas entière dans le contour n'est
   pas posée. Les quantités ne promettent rien ; c'est une image du lieu.
   ============================================================ */

/** Les types que le décor sait meubler. Une zone d'un autre type, ou sans
 *  type, reste un bloc. */
export const TYPES_MEUBLES = ["restauration", "conferences", "accueil", "vestiaire"];

/* Au-delà, on cesse de poser : une zone immense — un hall d'exposition
   déclaré « restauration » par erreur — ne doit pas coûter dix mille pièces
   au dessin. */
const PIECES_MAX = 600;

/**
 * @typedef {object} Piece
 * @property {number[][]} polygon   le contour au sol, en mètres
 * @property {number} haut          la hauteur, en mètres
 * @property {string} role          plateau, assise, scene, ecran, comptoir, plante, portant
 */

/** Le point est-il dans l'anneau ? */
function dedans(/** @type {number[][]} */ an, /** @type {number} */ x, /** @type {number} */ y){
  let ok = false;
  for (let i = 0, j = an.length - 1; i < an.length; j = i++){
    const [xi, yi] = an[i], [xj, yj] = an[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) ok = !ok;
  }
  return ok;
}

/**
 * Le repère de la zone : l'axe de son plus long côté, et l'étendue qu'elle
 * y couvre. Une zone tournée se meuble ainsi dans son propre sens.
 */
function repere(/** @type {number[][]} */ an){
  let best = 0, ux = 1, uy = 0;
  an.forEach((p, i) => {
    const q = an[(i + 1) % an.length], l = Math.hypot(q[0] - p[0], q[1] - p[1]);
    if (l > best){ best = l; ux = (q[0] - p[0]) / l; uy = (q[1] - p[1]) / l; }
  });
  const vx = -uy, vy = ux;
  const s = an.map(p => p[0] * ux + p[1] * uy), t = an.map(p => p[0] * vx + p[1] * vy);
  const s0 = Math.min(...s), s1 = Math.max(...s), t0 = Math.min(...t), t1 = Math.max(...t);
  /** Du repère de la zone au plan. */
  const plan = (/** @type {number} */ a, /** @type {number} */ b) => [a * ux + b * vx, a * uy + b * vy];
  return { s0, s1, t0, t1, plan };
}

/**
 * Le mobilier d'une zone.
 * @param {string} type       le type de la zone
 * @param {number[][]} anneau son contour, en mètres
 * @returns {Piece[]}
 */
export function meuble(type, anneau){
  if (!TYPES_MEUBLES.includes(type) || !anneau || anneau.length < 3) return [];
  const R = repere(anneau);
  /** @type {Piece[]} */
  const pieces = [];
  /* Une pièce posée par son milieu (a, b) dans le repère de la zone et ses
     demi-côtés : elle n'entre que si ses quatre coins, agrandis d'une marge
     de passage, tombent dans la zone. */
  const COINS = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  const tient = (/** @type {number} */ a, /** @type {number} */ b, /** @type {number} */ da,
    /** @type {number} */ db, /** @type {number} */ marge) =>
    COINS.every(([i, j]) => dedans(anneau, ...R.plan(a + i * (da + marge), b + j * (db + marge))));
  const pose = (/** @type {number} */ a, /** @type {number} */ b, /** @type {number} */ da,
    /** @type {number} */ db, /** @type {number} */ haut, /** @type {string} */ role, marge = .25) => {
    if (pieces.length >= PIECES_MAX || !tient(a, b, da, db, marge)) return;
    pieces.push({ polygon: COINS.map(([i, j]) => R.plan(a + i * da, b + j * db)), haut, role });
  };
  /* Une table ronde : un octogone, à huit pans la carte graphique en fait un
     cylindre qui se lit comme tel à cette distance. */
  const ronde = (/** @type {number} */ a, /** @type {number} */ b, /** @type {number} */ r,
    /** @type {number} */ haut, /** @type {string} */ role) => {
    if (pieces.length >= PIECES_MAX) return;
    const polygon = [];
    for (let k = 0; k < 8; k++){
      const ang = (k + .5) * Math.PI / 4;
      polygon.push(R.plan(a + r * Math.cos(ang), b + r * Math.sin(ang)));
    }
    pieces.push({ polygon, haut, role });
  };
  const L = R.s1 - R.s0, l = R.t1 - R.t0;

  if (type === "restauration"){
    // des tables rondes à quatre chaises, sur une trame de deux mètres soixante
    const pas = 2.6;
    for (let a = R.s0 + pas / 2; a <= R.s1 - pas / 2 + 1e-6; a += pas)
      for (let b = R.t0 + pas / 2; b <= R.t1 - pas / 2 + 1e-6; b += pas){
        // la table n'est posée que si ses chaises tiennent aussi
        if (!tient(a, b, 1.05, 1.05, 0)) continue;
        ronde(a, b, .5, .75, "plateau");
        for (const [i, j] of [[1, 0], [-1, 0], [0, 1], [0, -1]])
          pose(a + i * .85, b + j * .85, .2, .2, .45, "assise", 0);
      }
  } else if (type === "conferences"){
    /* La scène au fond, sur toute la largeur, et l'écran qui la domine. Rien
       ne dit par où l'on entre dans la salle : le fond est le bout le plus
       haut sur le plan, celui qu'une vue de face montre au loin — la salle
       regarde alors celui qui la regarde, au lieu de lui tourner le dos. */
    const milieu = (R.t0 + R.t1) / 2;
    const sens = R.plan(R.s0, milieu)[1] < R.plan(R.s1, milieu)[1] ? -1 : 1;
    const bout = sens > 0 ? R.s1 : R.s0, debut = sens > 0 ? R.s0 : R.s1;
    const prof = Math.min(3, Math.max(1.5, L * .18));
    const fond = bout - sens * (.8 + prof / 2);
    pose(fond, milieu, prof / 2, l / 2 - 1, .45, "scene", 0);
    pose(bout - sens * .6, milieu, .08, Math.min(l * .3, 4), 2.8, "ecran", 0);
    // les rangées, de la scène vers l'entrée, une allée au milieu
    for (let a = fond - sens * (prof / 2 + 1.6); sens * (a - debut) >= .8; a -= sens * .95)
      for (let b = R.t0 + .7; b <= R.t1 - .7; b += .62){
        if (Math.abs(b - milieu) < .7) continue;
        pose(a, b, .24, .24, .45, "assise", .05);
      }
  } else if (type === "accueil"){
    // un comptoir au milieu, en travers, et deux plantes à ses bouts
    const c = (R.s0 + R.s1) / 2, demi = Math.min(l * .35, 4);
    pose(c, (R.t0 + R.t1) / 2, .35, demi, 1.1, "comptoir", .1);
    for (const sens of [-1, 1]){
      const b = (R.t0 + R.t1) / 2 + sens * (demi + .7);
      if (b > R.t0 + .4 && b < R.t1 - .4) ronde(c, b, .32, 1.3, "plante");
    }
  } else if (type === "vestiaire"){
    // des portants parallèles, un mètre quarante entre deux
    const demi = Math.max(.5, l / 2 - .9);
    for (let a = R.s0 + 1; a <= R.s1 - 1; a += 1.4) pose(a, (R.t0 + R.t1) / 2, .18, demi, 1.6, "portant", .1);
  }
  return pieces;
}
