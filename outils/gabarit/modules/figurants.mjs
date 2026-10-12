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
   il reçoit la grille, rend la place de chacun et le maillage d'une
   silhouette, que le dessin (`webgl.mjs`) répète. Il s'éprouve seul dans Node
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
 * @property {number} cheveux  l'indice de leur couleur dans `CHEVEUX`
 * @property {number} taille   sa hauteur, en part de la hauteur type
 * @property {number} cap      le sens où il regarde, en degrés autour de la verticale
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
  const nouveau = (/** @type {number} */ x, /** @type {number} */ y, /** @type {number} */ cap) => ({ x, y,
    tenue: Math.floor(tire() * TENUES.length), peau: Math.floor(tire() * TEINTS.length),
    cheveux: Math.floor(tire() * CHEVEUX.length), taille: .92 + tire() * .16, cap });
  /* On marche dans le sens d'une allée, pas en travers : le cap suit l'un des
     quatre sens de la grille, tournée avec le hall, à quelques degrés près. */
  const angleHall = Math.atan2(g.si, g.co) * 180 / Math.PI;
  const capTire = () => angleHall + Math.floor(tire() * 4) * 90 + (tire() - .5) * 24;

  for (let i = 0; i < g.nappe.length && l.length < FIGURANTS_MAX; i++){
    if (!marche(i) || tire() >= chance) continue;
    const cx = i % g.w, cy = (i - cx) / g.w;
    // un peu de jeu dans la case : la trame de la grille ne doit pas se voir
    const [x, y] = auPlan(g.x0 + (cx + tire()) * pas, g.y0 + (cy + tire()) * pas);
    if (!libre(x, y, ECART)) continue;
    const cap = capTire();
    range(nouveau(x, y, cap));
    /* Un compagnon, côte à côte : à cinquante-cinq centimètres sur le flanc,
       regardant du même côté, et seulement s'il a lui aussi les pieds dans
       l'allée. */
    if (tire() < PART_DUOS && l.length < FIGURANTS_MAX){
      const flanc = (cap + (tire() < .5 ? 90 : -90)) * Math.PI / 180;
      const x2 = x + .55 * Math.cos(flanc), y2 = y + .55 * Math.sin(flanc);
      if (marche(caseDe(x2, y2)) && libre(x2, y2, .5)) range(nouveau(x2, y2, cap));
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

/* Des cheveux plus sombres que le visage, presque toujours : c'est ce
   contraste qui fait lire une tête, de loin, et non une boule beige. */
export const CHEVEUX = [[42, 32, 26], [28, 26, 26], [86, 58, 38], [62, 44, 32], [148, 112, 64], [150, 150, 152]];

/** L'ombre au sol : un voile, qui pose le figurant sans rien cacher de l'allée. */
export const OMBRE = [24, 28, 38, 34];

/* ------------------------------------------------------------
   La silhouette

   Les proportions se règlent sur celles de la maquette, et non sur la
   nature. Les stands y gardent leur emprise vraie, au mètre, mais ne montent
   qu'à un mètre soixante (`camera.mjs` `HAUTEUR_STAND`) quand une cloison
   réelle en fait deux et demi. Un visiteur à sa vraie taille dépassait donc
   les stands, et se lisait comme un géant dans un village : il est rabattu
   dans le même rapport — un peu plus d'un mètre, les deux tiers d'un stand,
   comme un visiteur devant une cloison. Sa carrure, elle, reste à l'échelle
   du sol, à peine affinée pour que la silhouette ne paraisse pas trapue :
   quatre de front tiennent dans une allée de deux mètres, comme dans le
   vrai salon.

   Le dessin est celui des maquettes d'architecte : peu de formes, franches.
   Deux jambes bien séparées, les bras dans la couleur du haut le long du
   corps, une tête un peu forte coiffée de cheveux sombres, et une ombre
   douce au sol, sans laquelle un figurant flotte au-dessus de l'allée.

   Cinq maillages — l'ombre, le bas, le haut, la tête, les cheveux — que la
   carte graphique répète pour chaque figurant, chacun teint de sa couleur.
   Un figurant y coûte une position, et non trois cents sommets.
   ------------------------------------------------------------ */
/* Saisis en marche, et non au garde-à-vous. Droits, jambes et bras collés
   au corps, ils se lisaient comme des plots posés dans l'allée : ce qui dit
   qu'on marche, c'est le pas. Les jambes partent donc en compas de la
   hanche, les bras balancent à l'inverse, et le buste penche un rien vers
   l'avant. Un pas tranquille, de salon, et non une course. Immobiles
   pourtant : la pose suffit à l'œil, et le plan ne s'anime pas tout seul. */
const JAMBE = { pied: .12, hanche: .02, ecart: .075, rayon: .052, haut: .5 };
const BUSTE = { bas: .48, haut: .86, larg: [.12, .15], prof: [.1, .115], penche: .025 };
const BRAS = { main: .1, ecart: .175, rayon: .036, bas: .53, haut: .84 };
const TETE = { avance: .03, centre: .965, rayon: .1 };
/* Les cheveux : une calotte un peu plus grande que la tête, tirée vers
   l'arrière — de face on voit le visage, de dos la chevelure. */
const COIFFE = { gonfle: 1.08, recul: .018, monte: .008, part: .55 };
const OMBRE_SOL = { long: .26, large: .18, haut: .004 };

/** La hauteur d'un figurant de taille type, en mètres. */
export const HAUTEUR_FIGURANT = TETE.centre + COIFFE.monte + TETE.rayon * COIFFE.gonfle;

/**
 * Un tronc elliptique entre deux hauteurs, fermé en haut, ses faces en
 * triangles. Les rayons vont d'un bout à l'autre : un buste s'évase vers les
 * épaules. Le haut peut glisser de (dx, dy) sur le bas : une jambe qui part
 * en avant, un buste qui penche.
 */
function tronc(/** @type {number[]} */ pos, /** @type {number[]} */ nor, /** @type {number} */ cx,
  /** @type {number} */ cy, /** @type {number} */ z0, /** @type {number} */ z1,
  /** @type {number[]} */ rx, /** @type {number[]} */ ry, n = 10, dx = 0, dy = 0){
  const pt = (/** @type {number} */ k, /** @type {number} */ b) => {
    const a = k * 2 * Math.PI / n;
    return [cx + b * dx + rx[b] * Math.cos(a), cy + b * dy + ry[b] * Math.sin(a), b ? z1 : z0];
  };
  // la normale d'une ellipse, perpendiculaire à son bord
  const nm = (/** @type {number} */ k) => {
    const a = k * 2 * Math.PI / n, x = Math.cos(a) / rx[1], y = Math.sin(a) / ry[1], l = Math.hypot(x, y);
    return [x / l, y / l, 0];
  };
  for (let k = 0; k < n; k++){
    const [a0, a1, b0, b1] = [pt(k, 0), pt(k + 1, 0), pt(k, 1), pt(k + 1, 1)];
    const [n0, n1] = [nm(k), nm(k + 1)];
    pos.push(...a0, ...a1, ...b1, ...a0, ...b1, ...b0);
    nor.push(...n0, ...n1, ...n1, ...n0, ...n1, ...n0);
    pos.push(cx + dx, cy + dy, z1, ...b0, ...b1);
    nor.push(0, 0, 1, 0, 0, 1, 0, 0, 1);
  }
}

/** Une boule à facettes, ses normales tirées de son centre ; ou sa seule
 *  calotte, du sommet jusqu'à la part `part` de sa hauteur. */
function boule(/** @type {number[]} */ pos, /** @type {number[]} */ nor, /** @type {number} */ cx,
  /** @type {number} */ cz, /** @type {number} */ r, nLat = 6, nLon = 10, part = 1, cy = 0){
  const pt = (/** @type {number} */ i, /** @type {number} */ j) => {
    const t = i * part * Math.PI / nLat, p = j * 2 * Math.PI / nLon;
    return [Math.sin(t) * Math.cos(p), Math.sin(t) * Math.sin(p), Math.cos(t)];
  };
  for (let i = 0; i < nLat; i++) for (let j = 0; j < nLon; j++){
    const q = [pt(i, j), pt(i + 1, j), pt(i + 1, j + 1), pt(i, j + 1)];
    for (const k of [0, 1, 2, 0, 2, 3]){
      const v = q[k];
      pos.push(cx + v[0] * r, cy + v[1] * r, cz + v[2] * r);
      nor.push(...v);
    }
  }
}

/** Une ellipse couchée au sol, en éventail. */
function disque(/** @type {number[]} */ pos, /** @type {number[]} */ nor, /** @type {number} */ rx,
  /** @type {number} */ ry, /** @type {number} */ z, n = 16){
  for (let k = 0; k < n; k++){
    const a = k * 2 * Math.PI / n, b = (k + 1) * 2 * Math.PI / n;
    pos.push(0, 0, z, rx * Math.cos(a), ry * Math.sin(a), z, rx * Math.cos(b), ry * Math.sin(b), z);
    nor.push(0, 0, 1, 0, 0, 1, 0, 0, 1);
  }
}

/**
 * @typedef {{ positions: { value: Float32Array, size: number }, normals: { value: Float32Array, size: number } }} Maillage
 */
const maillage = (/** @type {(pos: number[], nor: number[]) => void} */ fait) => {
  /** @type {number[]} */
  const pos = [], nor = [];
  fait(pos, nor);
  return { attributes: { positions: { value: new Float32Array(pos), size: 3 },
    normals: { value: new Float32Array(nor), size: 3 } } };
};

/**
 * Les maillages d'un figurant, debout à l'origine, regardant vers les x :
 * son ombre, le bas — les deux jambes —, le haut — buste et bras —, la tête
 * et les cheveux.
 */
export function maillagesFigurant(){
  return {
    // l'ombre s'allonge dans le sens du pas, sous les deux pieds
    ombre: maillage((pos, nor) => disque(pos, nor, OMBRE_SOL.long, OMBRE_SOL.large, OMBRE_SOL.haut)),
    // chaque jambe, du pied à la hanche : la droite devant, la gauche derrière
    bas: maillage((pos, nor) => {
      const r = [JAMBE.rayon, JAMBE.rayon];
      for (const s of [-1, 1]) tronc(pos, nor, s * JAMBE.pied, s * JAMBE.ecart, 0, JAMBE.haut,
        r, r, 8, s * (JAMBE.hanche - JAMBE.pied), 0);
    }),
    // chaque bras, de la main à l'épaule, à l'inverse de la jambe du même côté
    haut: maillage((pos, nor) => {
      tronc(pos, nor, 0, 0, BUSTE.bas, BUSTE.haut, BUSTE.prof, BUSTE.larg, 12, BUSTE.penche, 0);
      const r = [BRAS.rayon, BRAS.rayon];
      for (const s of [-1, 1]) tronc(pos, nor, -s * BRAS.main, s * BRAS.ecart, BRAS.bas, BRAS.haut,
        r, r, 6, s * BRAS.main + BUSTE.penche, 0);
      /* une épaule ronde coiffe chaque bras : sans elle, le bout du bras
         dépassait du buste en une pastille plate, claire sous la lumière */
      for (const s of [-1, 1]) boule(pos, nor, BUSTE.penche, BRAS.haut - .01, BRAS.rayon * 1.35, 4, 8, 1, s * (BRAS.ecart - .01));
    }),
    tete: maillage((pos, nor) => boule(pos, nor, TETE.avance, TETE.centre, TETE.rayon)),
    cheveux: maillage((pos, nor) => boule(pos, nor, TETE.avance - COIFFE.recul, TETE.centre + COIFFE.monte,
      TETE.rayon * COIFFE.gonfle, 6, 12, COIFFE.part)),
  };
}
