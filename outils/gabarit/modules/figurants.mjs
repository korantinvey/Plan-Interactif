/* ============================================================
   Les figurants de la vue immersive — du monde dans les allées

   La maquette d'un salon vide a l'air d'un salon fermé. Vue de biais
   (`camera.mjs`), quelques silhouettes dans les allées donnent l'échelle — un
   stand se mesure à ceux qui passent devant — et disent que le lieu se visite.

   Les figurants ne disent rien de la fréquentation : aucune donnée ne place
   un visiteur, et la carte de chaleur est là pour la vraie. Ils sont semés
   au hasard, mais un hasard qui ne change pas : la même graine d'un pavillon
   rend la même foule à chaque visite et à chaque image, et personne ne
   saute d'une allée à l'autre quand le plan se redessine. Ils ne bougent pas
   non plus — le plan ne s'anime pas sous les yeux du visiteur.

   Ils ne se posent que là où l'on marche : la nappe de la grille de
   l'itinéraire (`itineraire.mjs` `grille`), qui sait déjà ce qui est allée
   et ce qui est stand, cloison ou zone fermée. Ce module ne lit pas la page :
   il reçoit la grille, rend des pièces comme le décor (`decor.mjs`), que le
   dessin (`webgl.mjs`) monte en volume. Il s'éprouve seul dans Node
   (`outils/essais/figurants.js`).
   ============================================================ */

/* Un figurant pour tant de mètres carrés d'allée : assez pour peupler le
   hall, pas assez pour qu'il ait l'air bondé ni pour cacher les noms. */
const METRES_PAR_FIGURANT = 14;

/* Au-delà, on cesse de semer : un pavillon immense ne doit pas coûter au
   dessin plus que son mobilier. */
export const FIGURANTS_MAX = 600;

/* L'écart minimal entre deux figurants qui ne marchent pas ensemble. */
const ECART = 1.6;

/* La part de ceux qui vont à deux, côte à côte. */
const PART_DUOS = .3;

/** Une suite de nombres tirée d'une graine : toujours la même pour la même graine. */
export function hasard(/** @type {number} */ graine){
  let a = graine >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** La graine d'un pavillon, tirée de son identifiant. */
export function graineDe(/** @type {string} */ id){
  let h = 2166136261;
  for (const c of String(id)) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

/**
 * @typedef {object} GrilleMarche
 * @property {number} x0
 * @property {number} y0
 * @property {number} w
 * @property {number} h
 * @property {number} co
 * @property {number} si
 * @property {Uint8Array} nappe   1 où l'on marche
 * @property {Uint8Array} marge   la distance au mur, en cases
 */

/**
 * @typedef {object} Figurant
 * @property {number} x        sur le plan, en mètres
 * @property {number} y
 * @property {number} tenue    l'indice de sa tenue dans `TENUES`
 * @property {number} peau     l'indice de son teint dans `TEINTS`
 * @property {number} taille   sa hauteur, en part de la hauteur type
 */

/**
 * Les figurants d'une grille de marche.
 *
 * Chaque case d'allée a sa chance, à proportion de la surface qu'elle couvre ;
 * celle qui touche un mur n'en a pas, pour qu'aucun figurant ne rase une
 * cloison ou ne disparaisse à moitié dans un stand. Un tirage trop près d'un
 * autre est écarté : la foule se répartit au lieu de s'agglutiner.
 * @param {GrilleMarche} g
 * @param {number} pas      le côté d'une case, en mètres
 * @param {number} graine
 * @returns {Figurant[]}
 */
export function placeFigurants(g, pas, graine){
  const tire = hasard(graine);
  /* Un hall trop grand pour la borne voit chaque case perdre de sa chance,
     plutôt que le semis s'arrêter en route : la borne atteinte au premier
     tiers de la grille peuplait le fond du hall et laissait l'entrée vide.
     Les duos et les tirages écartés laissent assez de marge sous la borne. */
  let cases = 0;
  for (let i = 0; i < g.nappe.length; i++) if (g.nappe[i] && g.marge[i] >= 2) cases++;
  const chance = Math.min(pas * pas / METRES_PAR_FIGURANT, FIGURANTS_MAX / (1 + PART_DUOS) / Math.max(1, cases));
  /** @type {Figurant[]} */
  const l = [];
  // un casier par mètre et demi : on n'y cherche que les voisins proches
  const casiers = new Map();
  const cleCasier = (/** @type {number} */ x, /** @type {number} */ y) =>
    Math.floor(x / ECART) + "," + Math.floor(y / ECART);
  const libre = (/** @type {number} */ x, /** @type {number} */ y, /** @type {number} */ ecart) => {
    const cx = Math.floor(x / ECART), cy = Math.floor(y / ECART);
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++)
      for (const f of casiers.get((cx + i) + "," + (cy + j)) || [])
        if (Math.hypot(f.x - x, f.y - y) < ecart) return false;
    return true;
  };
  const range = (/** @type {Figurant} */ f) => {
    const k = cleCasier(f.x, f.y);
    if (!casiers.has(k)) casiers.set(k, []);
    casiers.get(k).push(f);
    l.push(f);
  };
  /** De la grille, tournée avec le hall, au plan. */
  const auPlan = (/** @type {number} */ u, /** @type {number} */ v) =>
    [u * g.co - v * g.si, u * g.si + v * g.co];
  /** La case d'un point du plan, ou -1 hors de la grille. */
  const caseDe = (/** @type {number} */ x, /** @type {number} */ y) => {
    const u = x * g.co + y * g.si, v = -x * g.si + y * g.co;
    const cx = Math.floor((u - g.x0) / pas), cy = Math.floor((v - g.y0) / pas);
    return cx < 0 || cy < 0 || cx >= g.w || cy >= g.h ? -1 : cy * g.w + cx;
  };
  const marche = (/** @type {number} */ i) => i >= 0 && g.nappe[i] && g.marge[i] >= 2;
  const nouveau = (/** @type {number} */ x, /** @type {number} */ y) => ({ x, y,
    tenue: Math.floor(tire() * TENUES.length), peau: Math.floor(tire() * TEINTS.length),
    taille: .92 + tire() * .16 });

  for (let i = 0; i < g.nappe.length && l.length < FIGURANTS_MAX; i++){
    if (!marche(i) || tire() >= chance) continue;
    const cx = i % g.w, cy = (i - cx) / g.w;
    // un peu de jeu dans la case : la trame de la grille ne doit pas se voir
    const [x, y] = auPlan(g.x0 + (cx + tire()) * pas, g.y0 + (cy + tire()) * pas);
    if (!libre(x, y, ECART)) continue;
    range(nouveau(x, y));
    /* Un compagnon, côte à côte : à cinquante-cinq centimètres, dans un sens
       tiré au hasard, et seulement s'il a lui aussi les pieds dans l'allée. */
    if (tire() < PART_DUOS && l.length < FIGURANTS_MAX){
      const a = tire() * 2 * Math.PI, x2 = x + .55 * Math.cos(a), y2 = y + .55 * Math.sin(a);
      if (marche(caseDe(x2, y2)) && libre(x2, y2, .5)) range(nouveau(x2, y2));
    }
  }
  return l;
}

/* Les tenues : un haut, un bas. Des tons de salon professionnel — beaucoup de
   sombre et de clair, un peu de couleur — pour que la foule se lise sans
   faire concurrence aux couleurs des stands. */
export const TENUES = [
  { haut: [44, 62, 92], bas: [38, 42, 52] },
  { haut: [238, 238, 234], bas: [52, 58, 72] },
  { haut: [70, 74, 82], bas: [40, 42, 48] },
  { haut: [178, 64, 58], bas: [46, 50, 60] },
  { haut: [56, 128, 132], bas: [60, 62, 66] },
  { haut: [214, 196, 162], bas: [92, 84, 72] },
  { haut: [232, 236, 242], bas: [30, 44, 74] },
  { haut: [96, 82, 140], bas: [44, 46, 54] },
  { haut: [222, 166, 62], bas: [54, 56, 62] },
];

export const TEINTS = [[240, 206, 178], [222, 178, 142], [176, 124, 92], [118, 82, 60]];

/* Les mesures d'un figurant, en mètres. Plus petit que nature : les stands
   de la maquette ne montent qu'à un mètre soixante (`camera.mjs`
   `HAUTEUR_STAND`), et un visiteur à sa vraie taille les dépasserait. */
const JAMBES = .5, BUSTE = .48, TETE = .2;
const RAYON_CORPS = .17, RAYON_TETE = .1;

/** Un octogone de rayon r autour de (x, y), à la hauteur z. */
const octogone = (/** @type {number} */ x, /** @type {number} */ y, /** @type {number} */ r,
  /** @type {number} */ z) => {
  const pts = [];
  for (let k = 0; k < 8; k++){
    const a = (k + .5) * Math.PI / 4;
    pts.push([x + r * Math.cos(a), y + r * Math.sin(a), z]);
  }
  return pts;
};

/**
 * Les volumes d'un figurant : ses jambes, son buste, sa tête, empilés. Trois
 * cylindres à huit pans ; à la distance où l'on voit le hall, il n'en faut
 * pas plus pour lire une silhouette.
 * @param {Figurant} f
 * @returns {{ polygon: number[][], haut: number, couleur: number[] }[]}
 */
export function silhouette(f){
  const k = f.taille, t = TENUES[f.tenue] || TENUES[0], p = TEINTS[f.peau] || TEINTS[0];
  const j = JAMBES * k, b = BUSTE * k, h = TETE * k;
  return [
    { polygon: octogone(f.x, f.y, RAYON_CORPS * .85, 0), haut: j, couleur: [...t.bas, 255] },
    { polygon: octogone(f.x, f.y, RAYON_CORPS, j), haut: b, couleur: [...t.haut, 255] },
    { polygon: octogone(f.x, f.y, RAYON_TETE, j + b + .02), haut: h, couleur: [...p, 255] },
  ];
}
