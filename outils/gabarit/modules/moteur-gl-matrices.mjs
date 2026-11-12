/* ============================================================
   Le moteur du plan — les matrices et les vues

   Le plan se peint par un moteur WebGL2 écrit pour lui (`moteur-gl.mjs`),
   qui parle comme la part de deck.gl dont `webgl.mjs` se servait. Ce module
   en tient la géométrie : les matrices en colonnes, comme les veut la carte
   graphique, et les vues — la vue d'aplomb du plan, et la vue de biais de
   l'immersif, que `camera.mjs` décrit par ses propres matrices.

   Une vue mène un point du monde — en mètres, l'axe des y vers le bas comme
   dans le SVG, la hauteur vers l'œil — à l'espace de découpe de la carte
   graphique, et dit où il tombe à l'écran (`project`). Mêmes conventions que
   deck.gl, pour que `camera.mjs` et `webgl.mjs` n'aient rien à savoir du
   moteur qui les dessine : la vue de biais reçoit une matrice de vue et une
   projection, qu'elle applique au point rapporté à la cible.

   Rien ici ne touche à la page : les essais l'importent tel quel
   (`outils/essais/moteur-gl.js`).
   ============================================================ */

/** La matrice identité, en colonnes. */
export const IDENTITE = Object.freeze([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

/** Le produit `a · b` de deux matrices 4 × 4 en colonnes. */
export function mul4(/** @type {ArrayLike<number>} */ a, /** @type {ArrayLike<number>} */ b){
  const o = new Array(16);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++){
    o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
  }
  return o;
}

/** La translation de `(x, y, z)`. */
export const translation4 = (/** @type {number} */ x, /** @type {number} */ y, /** @type {number} */ z = 0) =>
  [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];

/** Un point `[x, y, z]` passé par une matrice en colonnes : `[x, y, z, w]`. */
export function applique4(/** @type {ArrayLike<number>} */ m, /** @type {ArrayLike<number>} */ p){
  const x = p[0], y = p[1], z = p[2] || 0;
  return [m[0] * x + m[4] * y + m[8] * z + m[12], m[1] * x + m[5] * y + m[9] * z + m[13],
    m[2] * x + m[6] * y + m[10] * z + m[14], m[3] * x + m[7] * y + m[11] * z + m[15]];
}

/**
 * Une matrice de modèle rapportée à une origine : `T(−o) · M · T(o)`.
 *
 * Le moteur garde ses sommets rapportés à une origine proche du plan, pour
 * que les flottants de la carte graphique ne perdent pas le millimètre à
 * huit kilomètres du zéro. Une matrice de modèle écrite pour le monde se
 * réécrit donc pour ces coordonnées-là, ici, en double précision.
 */
export function rapporte(/** @type {ArrayLike<number>} */ m, /** @type {number[]} */ o){
  return mul4(translation4(-o[0], -o[1], -(o[2] || 0)), mul4(m, translation4(o[0], o[1], o[2] || 0)));
}

/**
 * Une vue, telle que le moteur la dessine : sa taille en pixels CSS, son
 * zoom, et la matrice qui mène le monde à l'espace de découpe.
 *
 * Construite comme `deck.Viewport` : avec `viewMatrix` et
 * `projectionMatrix`, la vue applique `projection · vue · (p − position)`.
 * Les sous-classes de `webgl.mjs` (`ViewportCamera`) passent par là.
 */
export class Viewport {
  constructor(/** @type {any} */ p = {}){
    this.id = p.id || "vue";
    this.width = p.width || 1;
    this.height = p.height || 1;
    this.zoom = p.zoom || 0;
    /** pixels CSS par mètre, au centre de la vue */
    this.scale = Math.pow(2, this.zoom);
    const pos = p.position || p.target || [0, 0, 0];
    this.position = [pos[0] || 0, pos[1] || 0, pos[2] || 0];
    this.viewMatrix = p.viewMatrix || IDENTITE;
    this.projectionMatrix = p.projectionMatrix || IDENTITE;
    /** monde → découpe */
    this.viewProjectionMatrix = mul4(mul4(this.projectionMatrix, this.viewMatrix),
      translation4(-this.position[0], -this.position[1], -this.position[2]));
    /** la vue est-elle en perspective ? — la fuite change la taille d'un pixel d'un point à l'autre */
    this.perspective = this.viewProjectionMatrix[3] !== 0 || this.viewProjectionMatrix[7] !== 0 || this.viewProjectionMatrix[11] !== 0;
  }

  /** Où un point du monde tombe à l'écran : pixels CSS depuis le coin haut gauche, et sa profondeur. */
  project(/** @type {number[]} */ p){
    const c = applique4(this.viewProjectionMatrix, p);
    const w = c[3] || 1e-9;
    return [(c[0] / w + 1) / 2 * this.width, (1 - c[1] / w) / 2 * this.height, c[2] / w];
  }

  /** Le point du sol (à la hauteur `z`) sous un pixel de l'écran — l'inverse de `project` sur ce plan. */
  unproject(/** @type {number[]} */ xy, /** @type {any} */ o = {}){
    const z = o.targetZ || 0, m = this.viewProjectionMatrix;
    const nx = xy[0] / this.width * 2 - 1, ny = 1 - xy[1] / this.height * 2;
    /* Deux équations, celles de x et de y en découpe divisées par w, pour
       les deux inconnues du sol : x et y. */
    const a1 = m[0] - nx * m[3], b1 = m[4] - nx * m[7], c1 = nx * (m[11] * z + m[15]) - (m[8] * z + m[12]);
    const a2 = m[1] - ny * m[3], b2 = m[5] - ny * m[7], c2 = ny * (m[11] * z + m[15]) - (m[9] * z + m[13]);
    const det = a1 * b2 - a2 * b1;
    if (Math.abs(det) < 1e-12) return [NaN, NaN, z];
    return [(c1 * b2 - c2 * b1) / det, (a1 * c2 - a2 * c1) / det, z];
  }
}

/**
 * La vue d'aplomb, comme `deck.OrthographicView` : `zoom` puissance de deux
 * de pixels par mètre, centrée sur `target`, l'axe des y vers le bas
 * (`flipY`). La profondeur s'étend de `near` à `far` pixels : les figurants
 * se tiennent debout même à plat, sans sortir du champ.
 */
export class OrthographicViewport extends Viewport {
  constructor(/** @type {any} */ p){
    const s = Math.pow(2, p.zoom || 0), W = p.width || 1, H = p.height || 1;
    const near = p.near === undefined ? 0.1 : p.near, far = p.far === undefined ? 1000 : p.far;
    // l'œil un pixel au-dessus du sol, comme celui de deck.gl : ses `near` et `far` s'y comptent
    const vue = [s, 0, 0, 0, 0, s, 0, 0, 0, 0, s, 0, 0, 0, -1, 1];
    const sy = p.flipY === false ? 2 / H : -2 / H;
    // une hauteur positive vient vers l'œil : plus près, donc moins profonde
    const projection = [2 / W, 0, 0, 0, 0, sy, 0, 0, 0, 0, -2 / (far - near), 0, 0, 0, -(far + near) / (far - near), 1];
    super({ ...p, position: p.target || [0, 0, 0], viewMatrix: vue, projectionMatrix: projection });
  }
}

/**
 * Une vue, comme `deck.View` : elle garde ses réglages, et fait sa
 * `Viewport` à chaque taille et chaque état. Une sous-classe choisit la
 * sorte de `Viewport` par `getViewportType` — c'est ainsi que `webgl.mjs`
 * pose la vue de biais.
 */
export class View {
  constructor(/** @type {any} */ props = {}){
    this.id = props.id || "vue";
    this.props = props;
  }
  getViewportType(){ return Viewport; }
  /** La `Viewport` de cet état de vue, à cette taille. */
  makeViewport(/** @type {{ width: number, height: number, viewState: any }} */ o){
    const T = this.getViewportType();
    return new T({ ...this.props, ...o.viewState, id: this.id, width: o.width, height: o.height });
  }
}

/** La vue d'aplomb, comme `deck.OrthographicView`. */
export class OrthographicView extends View {
  constructor(/** @type {any} */ props = {}){
    super({ flipY: true, near: 0.1, far: 1000, ...props });
  }
  getViewportType(){ return OrthographicViewport; }
}
