/* ============================================================
   Les figurants — du monde dans les allées

   La maquette d'un salon vide a l'air d'un salon fermé. Vue de biais
   (`camera.mjs`), quelques silhouettes dans les allées donnent l'échelle — un
   stand se mesure à ceux qui passent devant — et disent que le lieu se visite.
   À plat, en classique et en tuiles, les mêmes silhouettes se couchent un peu
   vers le haut de l'écran (`webgl.mjs`) : vues d'aplomb, elles n'étaient
   qu'une tache, et c'est le corps entrevu qui fait lire une personne.

   L'exploitant les allume ou les éteint pour toutes les ambiances
   (`ambiance.mjs` `figurantsRetenus`) ; le dessin l'apprend par la classe
   `CLASSE_FIGURANTS` sur la racine, comme pour les logos.

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

/** La classe de la racine quand il y a du monde dans les allées. */
export const CLASSE_FIGURANTS = "avec-figurants";

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

/* Un figurant visite : il marche à quelques mètres d'un stand ou d'une zone,
   jamais au milieu d'un parvis vide. La grille de marche, elle, ouvre tout ce
   que l'exploitant a dessiné comme circulation — y compris le chemin de la
   gare au hall, et le parvis devant l'entrée. Sans cette borne, une foule s'y
   promenait, dehors. */
const PROCHE_STAND = 6;

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
 * @property {Uint8Array} barrage non nul sous un stand ou une zone fermée
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
 * @property {number} modele   l'indice de son allure dans `MODELES`
 * @property {number} chaussures l'indice de leur couleur dans `CHAUSSURES`
 */

/**
 * Les figurants d'une grille de marche.
 *
 * Chaque case d'allée a sa chance, à proportion de la surface qu'elle couvre ;
 * celle qui touche un mur n'en a pas, pour qu'aucun figurant ne rase une
 * cloison ou ne disparaisse à moitié dans un stand. Un tirage trop près d'un
 * autre est écarté : la foule se répartit au lieu de s'agglutiner.
 *
 * Seules comptent les cases du salon : à moins de `PROCHE_STAND` d'un stand
 * ou d'une zone, et dans le hall quand on sait le dire (`dansLeHall`).
 * @param {GrilleMarche} g
 * @param {number} pas      le côté d'une case, en mètres
 * @param {number} graine
 * @param {((x: number, y: number) => boolean) | null} [dansLeHall] le point est-il dans le bâtiment
 * @returns {Figurant[]}
 */
export function placeFigurants(g, pas, graine, dansLeHall = null){
  const tire = hasard(graine);
  const proche = presDesStands(g, Math.round(PROCHE_STAND / pas));
  /* Un hall trop grand pour la borne voit chaque case perdre de sa chance,
     plutôt que le semis s'arrêter en route : la borne atteinte au premier
     tiers de la grille peuplait le fond du hall et laissait l'entrée vide.
     Les duos et les tirages écartés laissent assez de marge sous la borne. */
  let cases = 0;
  for (let i = 0; i < g.nappe.length; i++) if (g.nappe[i] && g.marge[i] >= 2 && proche[i]) cases++;
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
  const marche = (/** @type {number} */ i) => i >= 0 && g.nappe[i] && g.marge[i] >= 2 && proche[i] === 1;
  const dedans = (/** @type {number} */ x, /** @type {number} */ y) => !dansLeHall || dansLeHall(x, y);
  const nouveau = (/** @type {number} */ x, /** @type {number} */ y, /** @type {number} */ cap) => ({ x, y,
    tenue: Math.floor(tire() * TENUES.length), peau: Math.floor(tire() * TEINTS.length),
    cheveux: Math.floor(tire() * CHEVEUX.length), taille: .92 + tire() * .16, cap,
    modele: Math.floor(tire() * MODELES.length), chaussures: Math.floor(tire() * CHAUSSURES.length) });
  /* On marche dans le sens d'une allée, pas en travers : le cap suit l'un des
     quatre sens de la grille, tournée avec le hall, à quelques degrés près. */
  const angleHall = Math.atan2(g.si, g.co) * 180 / Math.PI;
  const capTire = () => angleHall + Math.floor(tire() * 4) * 90 + (tire() - .5) * 24;

  for (let i = 0; i < g.nappe.length && l.length < FIGURANTS_MAX; i++){
    if (!marche(i) || tire() >= chance) continue;
    const cx = i % g.w, cy = (i - cx) / g.w;
    // un peu de jeu dans la case : la trame de la grille ne doit pas se voir
    const [x, y] = auPlan(g.x0 + (cx + tire()) * pas, g.y0 + (cy + tire()) * pas);
    if (!dedans(x, y) || !libre(x, y, ECART)) continue;
    const cap = capTire();
    range(nouveau(x, y, cap));
    /* Un compagnon, côte à côte : à cinquante-cinq centimètres sur le flanc,
       regardant du même côté, et seulement s'il a lui aussi les pieds dans
       l'allée. */
    if (tire() < PART_DUOS && l.length < FIGURANTS_MAX){
      const flanc = (cap + (tire() < .5 ? 90 : -90)) * Math.PI / 180;
      const x2 = x + .55 * Math.cos(flanc), y2 = y + .55 * Math.sin(flanc);
      if (marche(caseDe(x2, y2)) && dedans(x2, y2) && libre(x2, y2, .5)) range(nouveau(x2, y2, cap));
    }
  }
  return l;
}

/**
 * Les cases à moins de `portee` cases d'un stand ou d'une zone fermée, de
 * proche en proche — un balayage en largeur depuis tout ce qui barre. Il
 * traverse les murs : c'est la distance au salon qu'on mesure, pas le chemin.
 */
function presDesStands(/** @type {GrilleMarche} */ g, /** @type {number} */ portee){
  const n = g.w * g.h, d = new Int16Array(n).fill(-1), file = new Int32Array(n);
  let tete = 0, queue = 0;
  for (let i = 0; i < n; i++) if (g.barrage[i]){ d[i] = 0; file[queue++] = i; }
  while (tete < queue){
    const i = file[tete++];
    if (d[i] >= portee) continue;
    const cx = i % g.w, cy = (i - cx) / g.w;
    for (const [nx, ny] of [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]]){
      if (nx < 0 || ny < 0 || nx >= g.w || ny >= g.h) continue;
      const j = ny * g.w + nx;
      if (d[j] >= 0) continue;
      d[j] = d[i] + 1; file[queue++] = j;
    }
  }
  const r = new Uint8Array(n);
  for (let i = 0; i < n; i++) if (d[i] >= 0) r[i] = 1;
  return r;
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

   Le dessin est celui des maquettes d'architecte : des formes simples, mais
   toutes celles qu'on reconnaît d'un coup d'œil — chaussures, mains, cou,
   un buste qui s'évase de la taille aux épaules, une coiffure sombre sur le
   visage —, et une ombre douce au sol, sans laquelle un figurant flotte
   au-dessus de l'allée. Des modèles d'artiste, téléchargés, auraient dit
   plus encore, mais pesaient un mégaoctet et demi chacun : tout est tracé
   ici, en quelques kilooctets de code.

   Pour chaque allure, cinq maillages — le bas, les chaussures, le haut, la
   peau, les cheveux —, plus l'ombre commune, que la carte graphique répète
   pour chaque figurant, chacun teint de sa couleur. Un figurant y coûte une
   position, et non mille sommets.
   ------------------------------------------------------------ */
/* Saisis en marche, et non au garde-à-vous. Droits, jambes et bras collés
   au corps, ils se lisaient comme des plots posés dans l'allée : ce qui dit
   qu'on marche, c'est le pas. Les jambes partent donc en compas de la
   hanche, les bras balancent à l'inverse, et le buste penche un rien vers
   l'avant. Un pas tranquille, de salon, et non une course. Immobiles
   pourtant : la pose suffit à l'œil, et le plan ne s'anime pas tout seul.

   La jambe droite (s = 1) est devant, le bras droit derrière. */
const HANCHE = { z: .5, ecart: .075, avance: .02 };
const PIED = { avance: .12, rayon: .052 };
const CHAUSSURE = { haut: .055, long: [.075, .065], large: [.042, .036], bout: .025 };
const BUSTE = { taille: .48, poitrine: .7, epaules: .86, penche: .025,
  prof: [.095, .108, .1], larg: [.118, .142, .15] };
const BRAS = { main: .1, ecart: .175, rayon: .036, bas: .53, haut: .84, coude: .7 };
const MAIN = { rayon: .034 };
const COU = { rayon: .04, haut: .9 };
const TETE = { avance: .03, centre: .965, rayon: .1 };
const JUPE = { bas: .3, larg: .2, prof: .165 };
/* Les cheveux : une calotte un peu plus grande que la tête, tirée vers
   l'arrière — de face on voit le visage, de dos la chevelure. Longs, ils
   descendent en plus dans le dos jusqu'aux épaules. */
const COIFFE = { gonfle: 1.08, recul: .018, monte: .008, courte: .55, longue: .62 };
const OMBRE_SOL = { long: .26, large: .18, haut: .004 };

/** La hauteur d'un figurant de taille type, en mètres. */
export const HAUTEUR_FIGURANT = TETE.centre + COIFFE.monte + TETE.rayon * COIFFE.gonfle;

/**
 * Les quatre allures de la foule. Un salon n'est pas une colonne d'uniformes :
 * la jupe, les avant-bras nus, les cheveux longs suffisent à varier la
 * silhouette, et chacune reçoit en plus ses couleurs (`TENUES`, `CHEVEUX`).
 */
export const MODELES = [
  { nom: "veste", jupe: false, manches: "longues", cheveux: "courts" },
  { nom: "chemise", jupe: false, manches: "courtes", cheveux: "courts" },
  { nom: "jupe", jupe: true, manches: "courtes", cheveux: "longs" },
  { nom: "pantalon", jupe: false, manches: "longues", cheveux: "longs" },
];

/* Le bout des chaussures : sombre, quelle que soit la tenue. */
export const CHAUSSURES = [[34, 34, 38], [58, 42, 32], [26, 30, 44], [90, 92, 98]];

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

/** Un membre rond tiré d'un point à un autre, sur une part [t0, t1] de sa
 *  longueur : l'avant-bras nu et la manche sont deux parts du même bras. */
function membre(/** @type {number[]} */ pos, /** @type {number[]} */ nor, /** @type {number[]} */ a,
  /** @type {number[]} */ b, /** @type {number} */ r, t0 = 0, t1 = 1, n = 7){
  const en = (/** @type {number} */ t) => a.map((v, i) => v + (b[i] - v) * t);
  const [p, q] = [en(t0), en(t1)];
  tronc(pos, nor, p[0], p[1], p[2], q[2], [r, r], [r, r], n, q[0] - p[0], q[1] - p[1]);
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
 * @typedef {{ attributes: { positions: { value: Float32Array, size: number },
 *   normals: { value: Float32Array, size: number } } }} Maillage
 */
const maillage = (/** @type {(pos: number[], nor: number[]) => void} */ fait) => {
  /** @type {number[]} */
  const pos = [], nor = [];
  fait(pos, nor);
  return { attributes: { positions: { value: new Float32Array(pos), size: 3 },
    normals: { value: new Float32Array(nor), size: 3 } } };
};

/** Les points d'appui de la pose : pied, hanche, épaule, main de chaque côté. */
const pose = (/** @type {number} */ s) => ({
  pied: [s * PIED.avance, s * HANCHE.ecart, CHAUSSURE.haut * .6],
  hanche: [s * HANCHE.avance, s * HANCHE.ecart, HANCHE.z],
  epaule: [BUSTE.penche, s * BRAS.ecart, BRAS.haut],
  main: [-s * BRAS.main, s * BRAS.ecart, BRAS.bas],
});
/** La part du bras, depuis la main, où s'arrête une manche courte. */
const COUDE = (BRAS.coude - BRAS.bas) / (BRAS.haut - BRAS.bas);

/**
 * Les maillages d'une allure, debout à l'origine, regardant vers les x. Ils
 * vont par couleur, chacun teint pour chaque figurant : le bas — pantalon ou
 * jupe —, les chaussures, le haut — buste et manches —, la peau — tête, cou,
 * mains, et ce que la tenue laisse nu — et les cheveux.
 * @param {typeof MODELES[number]} m
 */
function maillagesDe(m){
  const cotes = [-1, 1].map(pose);
  return {
    bas: maillage((pos, nor) => {
      if (m.jupe){
        // la jupe s'évase de la taille à mi-mollet ; les jambes nues sont à la peau
        tronc(pos, nor, 0, 0, JUPE.bas, BUSTE.taille + .03, [JUPE.prof, BUSTE.prof[0]],
          [JUPE.larg, BUSTE.larg[0]], 12, BUSTE.penche * .4, 0);
      } else for (const c of cotes) membre(pos, nor, c.pied, c.hanche, PIED.rayon, 0, 1, 8);
    }),
    chaussures: maillage((pos, nor) => {
      for (const c of cotes) tronc(pos, nor, c.pied[0] + CHAUSSURE.bout, c.pied[1], 0, CHAUSSURE.haut,
        CHAUSSURE.long, CHAUSSURE.large, 8);
    }),
    haut: maillage((pos, nor) => {
      // la taille, la poitrine, les épaules : un buste, et non un tube
      const p = BUSTE.penche, k = (BUSTE.poitrine - BUSTE.taille) / (BUSTE.epaules - BUSTE.taille);
      tronc(pos, nor, 0, 0, BUSTE.taille, BUSTE.poitrine, BUSTE.prof.slice(0, 2), BUSTE.larg.slice(0, 2), 12, p * k, 0);
      tronc(pos, nor, p * k, 0, BUSTE.poitrine, BUSTE.epaules, BUSTE.prof.slice(1), BUSTE.larg.slice(1), 12, p * (1 - k), 0);
      for (const c of cotes){
        membre(pos, nor, c.main, c.epaule, BRAS.rayon, m.manches === "courtes" ? COUDE : 0, 1, 7);
        /* une épaule ronde coiffe chaque bras : sans elle, le bout du bras
           dépassait du buste en une pastille plate, claire sous la lumière */
        boule(pos, nor, p, BRAS.haut - .01, BRAS.rayon * 1.35, 3, 6, 1, c.epaule[1] * .94);
      }
    }),
    peau: maillage((pos, nor) => {
      boule(pos, nor, TETE.avance, TETE.centre, TETE.rayon, 6, 10);
      tronc(pos, nor, BUSTE.penche, 0, BUSTE.epaules - .02, COU.haut, [COU.rayon, COU.rayon], [COU.rayon, COU.rayon], 8);
      for (const c of cotes){
        boule(pos, nor, c.main[0], c.main[2] - MAIN.rayon * .6, MAIN.rayon, 3, 6, 1, c.main[1]);
        if (m.manches === "courtes") membre(pos, nor, c.main, c.epaule, BRAS.rayon * .9, 0, COUDE + .02, 7);
        if (m.jupe) membre(pos, nor, c.pied, c.hanche, PIED.rayon * .85, 0, .62, 8);
      }
    }),
    cheveux: maillage((pos, nor) => {
      const longs = m.cheveux === "longs";
      boule(pos, nor, TETE.avance - COIFFE.recul, TETE.centre + COIFFE.monte, TETE.rayon * COIFFE.gonfle,
        5, 10, longs ? COIFFE.longue : COIFFE.courte);
      // longs, ils tombent dans le dos jusqu'aux épaules
      if (longs) tronc(pos, nor, TETE.avance - .06, 0, BUSTE.epaules - .03, TETE.centre,
        [.055, .07], [.085, .1], 10);
    }),
  };
}

/* Les parties d'une allure, dans l'ordre où le shader du dessin les numérote
   (`webgl.mjs` `TeinteDesFigurants`). */
export const PARTIES = ["bas", "chaussures", "haut", "peau", "cheveux"];

/**
 * Les parties d'une allure réunies en un seul maillage, chaque sommet portant
 * le numéro de la sienne dans le premier canal de sa couleur.
 *
 * Une couche par partie et par allure en faisait vingt : la carte graphique
 * n'y voyait rien, mais la bibliothèque recompose les réglages de chaque
 * couche à chaque image, et un zoom en payait le prix vingt fois. Réunies,
 * une allure n'en fait plus qu'une, et le shader teint chaque partie de la
 * couleur du figurant.
 * @param {any} mod les maillages d'une allure, par partie
 */
export function maillageReuni(mod){
  const n = PARTIES.reduce((s, p) => s + mod[p].attributes.positions.value.length, 0);
  const pos = new Float32Array(n), nor = new Float32Array(n), cou = new Float32Array(n);
  let o = 0;
  PARTIES.forEach((p, i) => {
    const a = mod[p].attributes;
    pos.set(a.positions.value, o); nor.set(a.normals.value, o);
    for (let k = o; k < o + a.positions.value.length; k += 3) cou[k] = i;
    o += a.positions.value.length;
  });
  return { attributes: { positions: { value: pos, size: 3 }, normals: { value: nor, size: 3 },
    colors: { value: cou, size: 3 } } };
}

/**
 * L'ombre, commune à tous, et les maillages de chaque allure, dans l'ordre
 * de `MODELES`.
 */
export function maillagesFigurant(){
  return {
    // l'ombre s'allonge dans le sens du pas, sous les deux pieds
    ombre: maillage((pos, nor) => disque(pos, nor, OMBRE_SOL.long, OMBRE_SOL.large, OMBRE_SOL.haut)),
    modeles: MODELES.map(maillagesDe),
  };
}
