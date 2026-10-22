/* ============================================================
   Le décor du plan — le mobilier des zones de l'organisateur

   Vue de biais (`camera.mjs`), une zone montée d'un bloc ne dit rien de ce
   qu'on y fait : un restaurant et une salle de conférence y sont deux pavés
   de la même couleur. La maquette d'un salon les meuble — des tables rondes
   et leurs chaises, une scène, son écran et des rangées de sièges — et c'est
   ce qui la rend vivante. Ce module meuble donc une zone d'après le type que
   l'exploitant lui a donné (`reperes.mjs` `TYPES_ZONE`). À plat, les mêmes
   pièces vues d'aplomb distinguent encore le restaurant de la salle.

   Il ne dessine rien : il rend des pièces — un contour au sol en mètres, une
   hauteur, un rôle — que le dessin (`webgl.mjs`) monte en volume et peint
   d'après leur rôle. Il n'importe rien, et s'éprouve seul dans Node
   (`outils/essais/decor.js`).

   Le mobilier n'a pas de vérité à dire : aucune donnée ne place les tables
   d'un restaurant. Il est rangé sur une trame, dans l'axe du plus long côté
   de la zone, et une pièce qui ne tient pas entière dans le contour n'est
   pas posée. Les quantités ne promettent rien ; c'est une image du lieu.
   Une exception : le comptoir d'un accueil, que le visiteur cherche des yeux
   en entrant, se place et se tourne à la main (`comptoir`).
   ============================================================ */

/** Les types que le décor sait meubler. Une zone d'un autre type, ou sans
 *  type, reste un bloc. */
export const TYPES_MEUBLES = ["restauration", "foodtruck", "conferences", "accueil", "vestiaire", "lounge"];

/* Au-delà, on cesse de poser : une zone immense — un hall d'exposition
   déclaré « restauration » par erreur — ne doit pas coûter dix mille pièces
   au dessin. */
const PIECES_MAX = 600;

/**
 * @typedef {object} Piece
 * @property {number[][]} polygon   le contour au sol, en mètres
 * @property {number} haut          la hauteur, en mètres
 * @property {string} role          plateau, assise, scene, ecran, comptoir, plante, portant,
 *                                  canape, tapis, carrosserie, habitacle, store,
 *                                  et sur un comptoir choisi : comptoir-choisi, tige, poignee
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
  return { s0, s1, t0, t1, plan, ux, uy };
}

/**
 * @typedef {object} ReglageComptoir
 * @property {number} u   le milieu du comptoir, en part de la largeur de l'emprise de la zone
 * @property {number} v   et de sa hauteur, sur le plan
 * @property {number} a   l'angle de son long côté sur le plan, en degrés
 */

/** Un réglage tenable : trois nombres, le milieu dans l'emprise. */
export const reglageComptoirValide = (/** @type {any} */ r) => Boolean(r &&
  [r.u, r.v, r.a].every(Number.isFinite) && r.u >= 0 && r.u <= 1 && r.v >= 0 && r.v <= 1);

/**
 * Le comptoir d'un accueil : son milieu, le sens de son long côté et ses
 * demi-côtés, en mètres sur le plan.
 *
 * Rien ne dit où est l'entrée d'un hall : posé d'office, le comptoir se met
 * au milieu de la zone, en travers de son plus long côté — et tombait souvent
 * en plein passage. L'exploitant le place donc et le tourne lui-même
 * (`reglage-comptoir.mjs`, `outil-comptoir.mjs`) ; le milieu est rangé en
 * part de l'emprise de la zone et non en mètres, pour qu'une zone retouchée
 * garde son comptoir chez elle.
 *
 * Il reste dans sa zone : c'est le comptoir de cet accueil, pas un meuble
 * posé dans l'allée. Les outils l'y retiennent pendant le geste
 * (`rapprocheComptoir`) ; un réglage qui n'y tient plus — la zone retouchée
 * a rétréci — est oublié au profit du placement d'office, plutôt que de
 * laisser le comptoir déborder. La fiche, l'outil et le dessin le relisent
 * tous par cette seule règle.
 * @param {number[][]} anneau
 * @param {ReglageComptoir | null | undefined} reglage
 */
export function comptoir(anneau, reglage){
  const R = repere(anneau), l = R.t1 - R.t0;
  const demi = Math.min(l * .35, 4), prof = .35;
  if (reglageComptoirValide(reglage)){
    const r = /** @type {ReglageComptoir} */ (reglage);
    const xs = anneau.map(p => p[0]), ys = anneau.map(p => p[1]);
    const x0 = Math.min(...xs), y0 = Math.min(...ys);
    const c = { cx: x0 + r.u * (Math.max(...xs) - x0), cy: y0 + r.v * (Math.max(...ys) - y0),
      angle: r.a, demi, prof, choisi: true };
    if (comptoirTient(anneau, c)) return c;
  }
  const [cx, cy] = R.plan((R.s0 + R.s1) / 2, (R.t0 + R.t1) / 2);
  // en travers : le long côté suit la normale au plus long côté de la zone
  return { cx, cy, angle: Math.atan2(R.ux, -R.uy) * 180 / Math.PI, demi, prof, choisi: false };
}

/** Le jeu laissé entre le comptoir et le bord de sa zone, en mètres. */
const JEU_COMPTOIR = .1;

/**
 * Le comptoir tient-il dans sa zone ? Ses quatre coins, écartés du jeu,
 * tombent dedans, et aucun sommet du contour ne perce son plateau — ce qui
 * arriverait dans l'angle rentrant d'une zone en L, coins pourtant dedans.
 * @param {number[][]} anneau
 * @param {{ cx: number, cy: number, angle: number, demi: number, prof: number }} c
 */
export function comptoirTient(anneau, c){
  const t = c.angle * Math.PI / 180, dx = Math.cos(t), dy = Math.sin(t);
  const a = c.demi + JEU_COMPTOIR, b = c.prof + JEU_COMPTOIR;
  for (const [i, j] of [[-1, -1], [1, -1], [1, 1], [-1, 1]])
    if (!dedans(anneau, c.cx + i * a * dx - j * b * dy, c.cy + i * a * dy + j * b * dx)) return false;
  return !anneau.some(([x, y]) => {
    const ox = x - c.cx, oy = y - c.cy;
    return Math.abs(ox * dx + oy * dy) < a && Math.abs(-ox * dy + oy * dx) < b;
  });
}

/**
 * Le réglage le plus proche de « voulu » qui garde le comptoir dans sa zone,
 * en partant de « depart », qui y tient : celui qu'on tire contre le bord s'y
 * arrête et glisse le long, au lieu de passer au travers ; celui qu'on tourne
 * dans une zone trop étroite s'arrête au dernier angle qui passe.
 * @param {number[][]} anneau
 * @param {ReglageComptoir} depart
 * @param {ReglageComptoir} voulu
 * @returns {ReglageComptoir}
 */
export function rapprocheComptoir(anneau, depart, voulu){
  const tient = (/** @type {ReglageComptoir} */ r) => reglageComptoirValide(r) && comptoir(anneau, r).choisi;
  if (tient(voulu)) return voulu;
  /** Le dernier réglage qui tient sur le chemin de « de » à « vers ». */
  const avance = (/** @type {ReglageComptoir} */ de, /** @type {ReglageComptoir} */ vers) => {
    // l'angle se rejoint par le plus court : un comptoir à 175° est à 5° de 0°
    const da = ((vers.a - de.a) % 180 + 270) % 180 - 90;
    const entre = (/** @type {number} */ k) =>
      ({ u: de.u + k * (vers.u - de.u), v: de.v + k * (vers.v - de.v), a: de.a + k * da });
    let lo = 0, hi = 1;
    for (let k = 0; k < 16; k++){
      const m = (lo + hi) / 2;
      if (tient(entre(m))) lo = m; else hi = m;
    }
    return entre(lo);
  };
  /* Arrêté contre le bord, le geste garde la part qui le longe : chaque axe
     resté libre avance encore seul, comme une main qui glisse le long d'une
     cloison. */
  let r = avance(depart, voulu);
  r = avance(r, { ...r, u: voulu.u });
  r = avance(r, { ...r, v: voulu.v });
  return r;
}

/** La tige de la poignée, en mètres depuis le milieu du comptoir. */
const TIGE = 1.4;
/** Le rayon de la poignée ronde, en mètres. */
export const RAYON_POIGNEE = .4;

/**
 * Le milieu de la poignée qui tourne un comptoir choisi : au bout d'une tige
 * perpendiculaire à son long côté. L'outil (`outil-comptoir.mjs`) la vise au
 * même endroit que le dessin la pose.
 * @param {{ cx: number, cy: number, angle: number, prof: number }} c
 */
export function poigneeComptoir(c){
  const t = c.angle * Math.PI / 180, d = c.prof + TIGE;
  return [c.cx + Math.sin(t) * d, c.cy - Math.cos(t) * d];
}

/* ------------------------------------------------------------
   Les camions d'un foodtruck

   Rangés d'office le long du plus long côté, les camions ne disaient ni
   combien il en vient ni où ils se garent : l'exploitant en choisit le
   nombre, les place et les tourne (`reglage-foodtrucks.mjs`,
   `outil-foodtruck.mjs`). Chacun se range comme le comptoir d'un accueil —
   son milieu en part de l'emprise de la zone, son angle en degrés —, mais
   sur un tour entier : un camion a un avant, et un comptoir d'un seul côté.

   Dans le repère d'un camion, l'axe x court de l'arrière vers la cabine,
   l'axe y vers le comptoir. Le milieu du camion n'est pas celui de son
   emprise : le comptoir déborde d'un côté seulement.
   ------------------------------------------------------------ */

/** L'emprise d'un camion à l'échelle 1, en mètres depuis son milieu : vers
 *  l'arrière, l'avant, le flanc fermé, le côté du comptoir. */
export const CAMION = { ar: 3.1, av: 3.1, dos: 1.15, cote: 1.5 };
/** Le jeu laissé entre un camion et le bord de sa zone, en mètres. */
const JEU_CAMION = .1;
/** Au-delà, on n'en ajoute plus : une zone de foodtrucks n'est pas un parking. */
export const CAMIONS_MAX = 30;

/**
 * @typedef {object} Camion
 * @property {number} cx
 * @property {number} cy
 * @property {number} angle  l'axe arrière → cabine sur le plan, en degrés
 * @property {number} k      l'échelle : un camion réduit dans une zone qui n'en tient pas un entier
 */

/** Un réglage tenable : une liste — vide, c'est zéro camion — de milieux dans l'emprise. */
export const reglageCamionsValide = (/** @type {any} */ r) => Array.isArray(r) && r.length <= CAMIONS_MAX &&
  r.every(c => c && [c.u, c.v, c.a].every(Number.isFinite) && c.u >= 0 && c.u <= 1 && c.v >= 0 && c.v <= 1);

/** Les quatre coins de l'emprise d'un camion, écartés de « jeu », sur le plan. */
function coinsCamion(/** @type {Camion} */ c, jeu = 0){
  const t = c.angle * Math.PI / 180, dx = Math.cos(t), dy = Math.sin(t);
  const x0 = -CAMION.ar * c.k - jeu, x1 = CAMION.av * c.k + jeu, y0 = -CAMION.dos * c.k - jeu, y1 = CAMION.cote * c.k + jeu;
  return [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map(([x, y]) => [c.cx + x * dx - y * dy, c.cy + x * dy + y * dx]);
}

/** Le point tombe-t-il dans l'emprise du camion, écartée de « jeu » ? */
function dansCamion(/** @type {Camion} */ c, /** @type {number} */ x, /** @type {number} */ y, jeu = 0){
  const t = c.angle * Math.PI / 180, ox = x - c.cx, oy = y - c.cy;
  const lx = ox * Math.cos(t) + oy * Math.sin(t), ly = -ox * Math.sin(t) + oy * Math.cos(t);
  return lx > -CAMION.ar * c.k - jeu && lx < CAMION.av * c.k + jeu && ly > -CAMION.dos * c.k - jeu && ly < CAMION.cote * c.k + jeu;
}

/**
 * Le camion tient-il dans sa zone ? Comme le comptoir (`comptoirTient`) : ses
 * coins dedans, et aucun sommet du contour ne perce sa caisse.
 * @param {number[][]} anneau
 * @param {Camion} c
 */
export function camionTient(anneau, c){
  // le jeu suit l'échelle : dix centimètres de chaque côté n'entrent pas dans une zone d'un mètre
  const jeu = JEU_CAMION * Math.min(1, c.k);
  if (!coinsCamion(c, jeu).every(([x, y]) => dedans(anneau, x, y))) return false;
  return !anneau.some(([x, y]) => dansCamion(c, x, y, jeu));
}

/** Deux camions se chevauchent-ils ? Un coin de l'un dans l'autre, ou leurs milieux confondus. */
export const camionsSeGenent = (/** @type {Camion} */ a, /** @type {Camion} */ b) =>
  coinsCamion(a).some(([x, y]) => dansCamion(b, x, y)) || coinsCamion(b).some(([x, y]) => dansCamion(a, x, y)) ||
  dansCamion(b, a.cx, a.cy);

/**
 * Les camions rangés d'office, à l'échelle 1 si la zone en tient un entier.
 * @param {number[][]} anneau
 * @returns {Camion[]}
 */
function camionsDOffice(anneau){
  const R = repere(anneau), L = R.s1 - R.s0, l = R.t1 - R.t0;
  const angle = Math.atan2(R.uy, R.ux) * 180 / Math.PI;
  const camionEn = (/** @type {number} */ a, /** @type {number} */ b, k = 1) => {
    const [cx, cy] = R.plan(a, b);
    return { cx, cy, angle, k };
  };
  /** @type {Camion[]} */
  const out = [];
  const pas = 7.4, n = Math.floor((L + .6) / pas);
  const b = R.t0 + .3 + CAMION.dos;
  for (let i = 0; i < n; i++){
    const c = camionEn((R.s0 + R.s1) / 2 + (i - (n - 1) / 2) * pas, b);
    if (coinsCamion(c, .2).every(([x, y]) => dedans(anneau, x, y))) out.push(c);
  }
  /* Une zone dessinée à la taille d'un seul camion — c'est souvent ainsi
     qu'un foodtruck est posé sur un plan — n'en recevait aucun, et restait
     nue. Elle reçoit le sien, réduit à ce qu'elle mesure : mieux vaut un
     camion un peu court que pas de camion. Sans plancher : une zone minuscule
     refusait tout camion, et « + » répondait qu'elle était pleine alors
     qu'elle était vide. Le jeu au bord rétrécit avec lui. */
  if (!out.length){
    const ac = (R.s0 + R.s1) / 2, bc = (R.t0 + R.t1) / 2;
    for (let k = Math.min(1, L / 6.5, l / 2.95); k > 1e-4; k *= .92){
      const c = camionEn(ac, bc - .175 * k, k);
      if (coinsCamion(c, .1 * k).every(([x, y]) => dedans(anneau, x, y))){ out.push(c); break; }
    }
  }
  return out;
}

/** L'échelle des camions d'une zone : celle que le rangement d'office leur donne. */
const echelleCamions = (/** @type {number[][]} */ anneau) => (camionsDOffice(anneau)[0] || { k: 1 }).k;

/** Un réglage de camion, mis sur le plan. */
const camionDe = (/** @type {number[][]} */ anneau, /** @type {{ u: number, v: number, a: number }} */ r, /** @type {number} */ k) => {
  const xs = anneau.map(p => p[0]), ys = anneau.map(p => p[1]);
  const x0 = Math.min(...xs), y0 = Math.min(...ys);
  return { cx: x0 + r.u * (Math.max(...xs) - x0), cy: y0 + r.v * (Math.max(...ys) - y0), angle: r.a, k };
};

/**
 * Les camions d'une zone de foodtrucks : ceux que l'exploitant a placés, ou
 * le rangement d'office tant qu'il n'y a pas touché. Un camion placé qui ne
 * tient plus — la zone retouchée a rétréci — n'est pas posé, plutôt que de
 * déborder ; les autres restent où on les a mis.
 * @param {number[][]} anneau
 * @param {{ u: number, v: number, a: number }[] | null | undefined} reglage
 * @returns {Camion[]}
 */
export function camions(anneau, reglage){
  if (!reglageCamionsValide(reglage)) return camionsDOffice(anneau);
  const k = echelleCamions(anneau);
  return /** @type {any[]} */ (reglage).map(r => camionDe(anneau, r, k)).filter(c => camionTient(anneau, c));
}

/**
 * Le réglage figé des camions : celui en place, ou le rangement d'office
 * traduit en réglage, pour qu'on parte de ce qu'on voit.
 * @param {number[][]} anneau
 * @param {any} reglage
 * @returns {{ u: number, v: number, a: number }[]}
 */
export function figeCamions(anneau, reglage){
  const xs = anneau.map(p => p[0]), ys = anneau.map(p => p[1]);
  const x0 = Math.min(...xs), y0 = Math.min(...ys);
  const w = Math.max(Math.max(...xs) - x0, 1e-6), h = Math.max(Math.max(...ys) - y0, 1e-6);
  return camions(anneau, reglage).map(c => ({ u: (c.cx - x0) / w, v: (c.cy - y0) / h, a: ((c.angle % 360) + 360) % 360 }));
}

/**
 * Un camion de plus : à la première place libre d'une trame d'un mètre au plus, en
 * partant du milieu, dans le sens des autres ; ou rien si la zone est pleine.
 * @param {number[][]} anneau
 * @param {{ u: number, v: number, a: number }[]} reglage  le réglage figé
 */
export function ajouteCamion(anneau, reglage){
  if (reglage.length >= CAMIONS_MAX) return null;
  const k = echelleCamions(anneau), R = repere(anneau);
  const poses = reglage.map(r => camionDe(anneau, r, k));
  const angles = [reglage.length ? reglage[reglage.length - 1].a : Math.atan2(R.uy, R.ux) * 180 / Math.PI];
  angles.push(angles[0] + 90);
  const xs = anneau.map(p => p[0]), ys = anneau.map(p => p[1]);
  const x0 = Math.min(...xs), y0 = Math.min(...ys);
  const w = Math.max(Math.max(...xs) - x0, 1e-6), h = Math.max(Math.max(...ys) - y0, 1e-6);
  /* Les places, du milieu vers les bords : le premier camion d'une zone vide
     se pose au centre, les suivants à côté. La trame se resserre avec les
     camions réduits, sans quoi une petite zone n'offrait aucune place. */
  const pas = Math.min(1, k), places = [];
  for (let x = x0 + pas / 2; x < x0 + w; x += pas) for (let y = y0 + pas / 2; y < y0 + h; y += pas) places.push([x, y]);
  const mx = x0 + w / 2, my = y0 + h / 2;
  places.sort((p, q) => Math.hypot(p[0] - mx, p[1] - my) - Math.hypot(q[0] - mx, q[1] - my));
  /* La place du rangement d'office d'abord : un camion réduit à la mesure de
     sa zone n'entre que là, entre les nœuds de la trame. */
  const dOffice = camionsDOffice(anneau)[0];
  if (dOffice) places.unshift([dOffice.cx, dOffice.cy]);
  for (const a of angles) for (const [x, y] of places){
    const c = { cx: x, cy: y, angle: a, k };
    if (camionTient(anneau, c) && !poses.some(p => camionsSeGenent(p, c)))
      return { u: (x - x0) / w, v: (y - y0) / h, a: ((a % 360) + 360) % 360 };
  }
  return null;
}

/**
 * Le réglage le plus proche de « voulu » qui garde le camion dans sa zone,
 * en partant de « depart », qui y tient : tiré contre le bord, il s'y arrête
 * et glisse le long, comme le comptoir (`rapprocheComptoir`).
 * @param {number[][]} anneau
 * @param {{ u: number, v: number, a: number }} depart
 * @param {{ u: number, v: number, a: number }} voulu
 */
export function rapprocheCamion(anneau, depart, voulu){
  const k = echelleCamions(anneau);
  const tient = (/** @type {{ u: number, v: number, a: number }} */ r) =>
    r.u >= 0 && r.u <= 1 && r.v >= 0 && r.v <= 1 && camionTient(anneau, camionDe(anneau, r, k));
  if (tient(voulu)) return voulu;
  const avance = (/** @type {any} */ de, /** @type {any} */ vers) => {
    // l'angle se rejoint par le plus court, sur un tour entier : un camion a un avant
    const da = ((vers.a - de.a) % 360 + 540) % 360 - 180;
    const entre = (/** @type {number} */ m) => ({ u: de.u + m * (vers.u - de.u), v: de.v + m * (vers.v - de.v), a: de.a + m * da });
    let lo = 0, hi = 1;
    for (let i = 0; i < 16; i++){
      const m = (lo + hi) / 2;
      if (tient(entre(m))) lo = m; else hi = m;
    }
    return entre(lo);
  };
  let r = avance(depart, voulu);
  r = avance(r, { ...r, u: voulu.u });
  r = avance(r, { ...r, v: voulu.v });
  return r;
}

/**
 * Le milieu de la poignée qui tourne un camion tenu : au-delà de sa cabine,
 * dans l'axe. L'outil la vise au même endroit que le dessin la pose.
 * @param {Camion} c
 */
export function poigneeCamion(c){
  const t = c.angle * Math.PI / 180, d = CAMION.av * c.k + TIGE;
  return [c.cx + Math.cos(t) * d, c.cy + Math.sin(t) * d];
}

/**
 * Le mobilier d'une zone.
 * @param {string} type       le type de la zone
 * @param {number[][]} anneau son contour, en mètres
 * @param {any} [reglage] le comptoir placé à la main, sur un accueil (`ReglageComptoir`) ;
 *                        les camions, sur un foodtruck (une liste de réglages)
 * @param {boolean | number} [enMain] le comptoir est choisi par l'exploitant, ou sur un
 *                        foodtruck le rang du camion tenu : il porte sa poignée
 * @returns {Piece[]}
 */
export function meuble(type, anneau, reglage = null, enMain = false){
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
  } else if (type === "foodtruck"){
    /* Des camions rangés le long d'un côté, le comptoir ouvert vers la zone,
       et devant eux, passé la file d'attente, des mange-debout sans chaises :
       c'est ce qui distingue d'un regard le foodtruck du restaurant assis. Le
       camion n'est posé qu'entier — caisse, cabine et comptoir —, un camion
       coupé par le mur ne dirait plus ce qu'il est. Le store, une bande sur le
       toit côté comptoir, est ce qu'on voit d'aplomb.
       Leur nombre et leur place se choisissent à la main (`camions`) ; sans
       réglage, ils se rangent d'office. Les mange-debout, eux, se sèment
       partout où ni un camion ni sa file ne les gênent. */
    const liste = camions(anneau, Array.isArray(reglage) ? reglage : null);
    liste.forEach((c, i) => {
      const t = c.angle * Math.PI / 180, dx = Math.cos(t), dy = Math.sin(t), k = c.k;
      /* Une boîte du camion, posée par son milieu (x, y) et ses demi-côtés
         dans le repère du camion. */
      const boite = (/** @type {number} */ x, /** @type {number} */ y, /** @type {number} */ da,
        /** @type {number} */ db, /** @type {number} */ haut, /** @type {string} */ role) => {
        if (pieces.length >= PIECES_MAX) return;
        pieces.push({ haut, role, polygon: COINS.map(([u, v]) => {
          const lx = (x + u * da) * k, ly = (y + v * db) * k;
          return [c.cx + lx * dx - ly * dy, c.cy + lx * dy + ly * dx];
        }) });
      };
      const tenu = enMain === i;
      boite(-.7, 0, 2.4, 1.15, 2.7 * k, tenu ? "comptoir-choisi" : "carrosserie");
      boite(2.4, 0, .7, 1.05, 2.2 * k, "habitacle");
      boite(-.7, .9, 2.4, .25, 2.85 * k, "store");
      boite(-.7, 1.325, 1.6, .175, 1.05 * k, "comptoir");
      /* Tenu, il porte sa poignée au bout du capot : une tige basse, et un
         rond qu'on tire pour le tourner. */
      if (tenu){
        const [hx, hy] = poigneeCamion(c), e = .06, x0 = c.cx + CAMION.av * k * dx, y0 = c.cy + CAMION.av * k * dy;
        pieces.push({ polygon: [[x0 + e * dy, y0 - e * dx], [hx + e * dy, hy - e * dx],
          [hx - e * dy, hy + e * dx], [x0 - e * dy, y0 + e * dx]], haut: .5, role: "tige" });
        const rond = [];
        for (let q = 0; q < 12; q++)
          rond.push([hx + RAYON_POIGNEE * Math.cos(q * Math.PI / 6), hy + RAYON_POIGNEE * Math.sin(q * Math.PI / 6)]);
        pieces.push({ polygon: rond, haut: .55, role: "poignee" });
      }
    });
    /** Le point (x, y) tombe-t-il sur un camion, ou dans la file devant son comptoir ? */
    const gene = (/** @type {number} */ x, /** @type {number} */ y) => liste.some(c => {
      const t = c.angle * Math.PI / 180, ox = x - c.cx, oy = y - c.cy;
      const lx = ox * Math.cos(t) + oy * Math.sin(t), ly = -ox * Math.sin(t) + oy * Math.cos(t);
      return Math.abs(lx) < CAMION.av * c.k + 1 && ly > -CAMION.ar * c.k - 1 && ly < CAMION.cote * c.k + 2.5;
    });
    const pasT = 2.4;
    for (let tb = R.t0 + pasT / 2; tb <= R.t1 - .45 + 1e-6; tb += pasT)
      for (let a = R.s0 + pasT / 2; a <= R.s1 - pasT / 2 + 1e-6; a += pasT)
        if (tient(a, tb, .45, .45, .2) && !gene(...R.plan(a, tb))) ronde(a, tb, .4, 1.1, "plateau");
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
    /* Un comptoir, et deux plantes à ses bouts. Placé à la main, il tient
       dans sa zone par construction (`comptoir`) ; posé d'office, il n'est
       dressé que s'il y tient aussi. */
    const c = comptoir(anneau, reglage);
    const ang = c.angle * Math.PI / 180, dx = Math.cos(ang), dy = Math.sin(ang);
    const coin = (/** @type {number} */ i, /** @type {number} */ j) =>
      [c.cx + i * c.demi * dx - j * c.prof * dy, c.cy + i * c.demi * dy + j * c.prof * dx];
    const polygon = COINS.map(([i, j]) => coin(i, j));
    if (c.choisi || comptoirTient(anneau, c))
      pieces.push({ polygon, haut: 1.1, role: enMain ? "comptoir-choisi" : "comptoir" });
    /* Choisi, il porte sa poignée : une tige basse depuis son flanc, et un
       rond au bout, qu'on tire pour le tourner. Basse, pour que l'endroit où
       on la voit soit celui où le doigt la trouve sur le sol. */
    if (enMain){
      const [hx, hy] = poigneeComptoir(c), nx = Math.sin(ang), ny = -Math.cos(ang), e = .06;
      const x0 = c.cx + nx * c.prof, y0 = c.cy + ny * c.prof;
      pieces.push({ polygon: [[x0 - e * dx, y0 - e * dy], [hx - e * dx, hy - e * dy],
        [hx + e * dx, hy + e * dy], [x0 + e * dx, y0 + e * dy]], haut: .5, role: "tige" });
      const rond = [];
      for (let k = 0; k < 12; k++){
        const t = k * Math.PI / 6;
        rond.push([hx + RAYON_POIGNEE * Math.cos(t), hy + RAYON_POIGNEE * Math.sin(t)]);
      }
      pieces.push({ polygon: rond, haut: .55, role: "poignee" });
    }
    for (const sens of [-1, 1]){
      const px = c.cx + sens * (c.demi + .7) * dx, py = c.cy + sens * (c.demi + .7) * dy;
      if (!dedans(anneau, px, py)) continue;
      const rond = [];
      for (let k = 0; k < 8; k++){
        const t = (k + .5) * Math.PI / 4;
        rond.push([px + .32 * Math.cos(t), py + .32 * Math.sin(t)]);
      }
      pieces.push({ polygon: rond, haut: 1.3, role: "plante" });
    }
  } else if (type === "vestiaire"){
    // des portants parallèles, un mètre quarante entre deux
    const demi = Math.max(.5, l / 2 - .9);
    for (let a = R.s0 + 1; a <= R.s1 - 1; a += 1.4) pose(a, (R.t0 + R.t1) / 2, .18, demi, 1.6, "portant", .1);
  } else if (type === "lounge"){
    /* Des salons : sur un tapis, une table basse entre deux canapés qui se
       font face, un fauteuil à chaque bout, et une plante dans un coin. C'est
       ce qui distingue d'un regard le lounge du restaurant, dont les tables
       hautes s'alignent sans tapis. Un salon n'est posé que si son tapis
       tient entier : à moitié dans le mur, il ne dirait plus qu'on s'y
       installe. */
    const pasA = 5.6, pasB = 4.2;
    let n = 0;
    for (let a = R.s0 + pasA / 2; a <= R.s1 - pasA / 2 + 1e-6; a += pasA)
      for (let b = R.t0 + pasB / 2; b <= R.t1 - pasB / 2 + 1e-6; b += pasB){
        if (!tient(a, b, 2, 1.5, 0)) continue;
        // le tapis d'abord : à plat, ce qui est posé après se peint par-dessus
        pose(a, b, 2, 1.5, .03, "tapis", 0);
        pose(a, b, .6, .35, .4, "plateau", 0);
        for (const j of [-1, 1]) pose(a, b + j * 1.1, 1, .4, .75, "canape", 0);
        for (const i of [-1, 1]) pose(a + i * 1.55, b, .4, .4, .75, "canape", 0);
        // la plante change de coin d'un salon à l'autre, pour ne pas faire rangée
        const i = n % 2 ? 1 : -1, px = a + i * 2.4, py = b - 1.75;
        n++;
        if (pieces.length >= PIECES_MAX || !tient(px, py, .32, .32, 0)) continue;
        const rond = [];
        for (let k = 0; k < 8; k++){
          const t = (k + .5) * Math.PI / 4;
          rond.push(R.plan(px + .32 * Math.cos(t), py + .32 * Math.sin(t)));
        }
        pieces.push({ polygon: rond, haut: 1.3, role: "plante" });
      }
  }
  return pieces;
}

/* ------------------------------------------------------------
   Les objets des repères

   Un escalier, un escalator, un ascenseur sont des repères — un point et un
   pictogramme. Vue de biais, une pastille couchée au sol ne dit pas qu'on
   change d'étage : l'objet monte sous elle, à l'échelle du hall, et la
   pastille se pose dessus, comme une signalétique.

   Les marches montent d'office vers le haut du plan : vue de face, on voit
   l'escalier par où l'on y monte. Mais un escalier réel monte dans le sens du
   bâtiment, et l'exploitant le tourne (`objetRepere`, son `sens`).

   L'objet se mesure à la pastille et non au mètre : un repère se règle en
   taille pour se voir de loin, et un escalier à l'échelle vraie disparaissait
   sous elle. La pastille, elle, se réduit de moitié en montant et se pose au
   fond, au-dessus de la dernière marche : les premières restent à la vue.
   ------------------------------------------------------------ */

/** Les pictogrammes de repère qui ont un objet. */
export const OBJETS_REPERE = ["escalier", "escalator", "ascenseur"];

/** La pastille montée sur son objet, à cette fraction de sa taille. */
export const ECHELLE_PASTILLE = .5;

/**
 * L'objet d'un repère dont la pastille mesure `cote` mètres et se centre en
 * (x, y) ; la hauteur et le point où la pastille se pose.
 *
 * `sens` le tourne autour de la pastille, en degrés : à zéro les marches
 * montent vers le haut du plan, et un escalier réel monte rarement dans ce
 * sens-là. L'exploitant le tourne (`edition.mjs`, `outil-escalier.mjs`) ; la
 * pastille, elle, ne tourne pas — son pictogramme reste droit —, elle suit
 * seulement le haut de l'escalier, où elle se pose.
 *
 * `enMain` : l'exploitant tient l'objet, qui porte alors sa poignée au bout
 * d'une tige, dans le sens de la montée (`poigneeObjet`).
 * @param {string} glyphe
 * @param {number} x
 * @param {number} y
 * @param {number} cote
 * @param {number} [sens]
 * @param {boolean} [enMain]
 * @returns {{ pieces: Piece[], dessus: number, ancre: number[] }}
 */
export function objetRepere(glyphe, x, y, cote = 5, sens = 0, enMain = false){
  const o = objetDroit(glyphe, x, y, cote);
  if (enMain && o.pieces.length){
    const [hx, hy] = poigneeDroite(glyphe, x, y, cote), r = rayonPoigneeObjet(cote), e = cote * .03;
    const bord = y - etendueObjet(glyphe, cote) / 2;
    o.pieces.push({ polygon: [[x - e, bord], [x + e, bord], [x + e, hy], [x - e, hy]], haut: .5, role: "tige" });
    const rond = [];
    for (let k = 0; k < 12; k++) rond.push([hx + r * Math.cos(k * Math.PI / 6), hy + r * Math.sin(k * Math.PI / 6)]);
    o.pieces.push({ polygon: rond, haut: .55, role: "poignee" });
  }
  if (!Number.isFinite(sens) || !sens) return o;
  const tourne = tourneur(x, y, sens);
  return { pieces: o.pieces.map(p => ({ ...p, polygon: p.polygon.map(tourne) })),
    dessus: o.dessus, ancre: tourne(o.ancre) };
}

/** Le passage du repère droit au repère tourné de `sens` degrés autour de (x, y). */
const tourneur = (/** @type {number} */ x, /** @type {number} */ y, /** @type {number} */ sens) => {
  const t = sens * Math.PI / 180, c = Math.cos(t), s = Math.sin(t);
  return (/** @type {number[]} */ p) => [x + (p[0] - x) * c - (p[1] - y) * s, y + (p[0] - x) * s + (p[1] - y) * c];
};

/** La longueur de l'objet dans le sens de la montée, en mètres. */
const etendueObjet = (/** @type {string} */ glyphe, /** @type {number} */ cote) =>
  glyphe === "ascenseur" ? cote * .8 : cote * 1.3;

/** Le rayon de la poignée d'un objet, à la mesure de sa pastille. */
export const rayonPoigneeObjet = (/** @type {number} */ cote) => Math.max(.3, cote * .12);

/** La poignée, avant que l'objet ne tourne : au-delà du haut des marches, assez loin
 *  pour ne pas se cacher sous la pastille qui s'y pose. */
const poigneeDroite = (/** @type {string} */ glyphe, /** @type {number} */ x, /** @type {number} */ y,
  /** @type {number} */ cote) => [x, y - etendueObjet(glyphe, cote) / 2 - cote * .85];

/**
 * Le milieu de la poignée qui tourne l'objet d'un repère tenu : au-delà du
 * haut de l'escalier, dans le sens où l'on monte. L'outil la vise au même
 * endroit que le dessin la pose.
 * @param {string} glyphe
 * @param {number} x
 * @param {number} y
 * @param {number} cote
 * @param {number} sens
 */
export function poigneeObjet(glyphe, x, y, cote, sens){
  return tourneur(x, y, sens || 0)(poigneeDroite(glyphe, x, y, cote));
}

/** L'objet tel qu'il se pose droit, les marches montant vers le haut du plan. */
function objetDroit(/** @type {string} */ glyphe, /** @type {number} */ x, /** @type {number} */ y, cote = 5){
  /** @type {Piece[]} */
  const pieces = [];
  const boite = (/** @type {number} */ x0, /** @type {number} */ y0, /** @type {number} */ x1,
    /** @type {number} */ y1, /** @type {number} */ haut, /** @type {string} */ role) =>
    pieces.push({ polygon: [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], haut, role });
  if (glyphe === "escalier" || glyphe === "escalator"){
    const meca = glyphe === "escalator";
    const larg = cote * (meca ? .5 : .75), long = cote * 1.3, haut = cote * .4;
    const n = meca ? 12 : 7, pas = long / n, x0 = x - larg / 2, x1 = x + larg / 2;
    const fond = y - long / 2, front = y + long / 2;
    // chaque marche court jusqu'au fond : posées ensemble, elles font l'escalier
    for (let i = 0; i < n; i++) boite(x0, fond, x1, front - i * pas, haut * (i + 1) / n, "marche");
    // l'escalator a ses deux flancs, pleins et sombres, qui dépassent des marches
    const f = cote * .04;
    if (meca) for (const [a, b] of [[x0 - f, x0], [x1, x1 + f]]) boite(a, fond, b, front, haut * 1.25, "flanc");
    return { pieces, dessus: haut * (meca ? 1.25 : 1) + .05, ancre: [x, fond + cote * ECHELLE_PASTILLE / 2] };
  }
  if (glyphe === "ascenseur"){
    const d = cote * .4;
    boite(x - d, y - d, x + d, y + d, cote * .55, "cabine");
    return { pieces, dessus: cote * .55 + .05, ancre: [x, y] };
  }
  return { pieces, dessus: 0, ancre: [x, y] };
}
