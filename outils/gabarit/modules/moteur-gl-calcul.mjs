/* ============================================================
   Le moteur du plan — la désignation par le calcul

   Ce qui est sous la souris se demandait à la carte graphique : elle repeint
   les couches désignables dans un tampon d'un pixel, et la page relit ce
   pixel. La relecture attend que la carte ait fini tout ce qu'on lui a
   confié avant — l'image en cours, la montée d'un stand. Différée
   (`pickObjectAsync`), elle n'attend plus au moment du clic, mais une tâche
   plus tard : vingt-neuf à cent onze millisecondes sur un PC à carte
   graphique intégrée, en vue immersive, au clic comme au survol, et le
   relâché attendait derrière (`?perf`, FUNEXPO, 20 novembre 2026).

   Ici, la même passe se rejoue sur le processeur, triangle par triangle : les
   sommets que la carte a reçus, la même matrice, la même découpe par les
   plans proche et lointain, la profondeur arrondie aux vingt-quatre bits du
   tampon et comparée comme le moteur la compare (`depthCompare`, « moins ou
   égal » par défaut : à profondeur égale, ce qui se peint après l'emporte).
   Quelques milliers de triangles pour un salon entier, moins d'une
   milliseconde.

   Rien ici ne touche à la page : les essais l'importent tel quel
   (`outils/essais/moteur-gl-calcul.js`).
   ============================================================ */

/** La profondeur d'un tampon vidé à 1, en vingt-quatre bits. */
export const PROFONDEUR_VIDE = 0xffffff;

/** Les comparaisons de profondeur que le calcul sait rejouer ; une autre le fait s'abstenir. */
export const COMPARAISONS = /** @type {Record<string, (z: number, tenu: number) => boolean>} */ ({
  less: (z, tenu) => z < tenu,
  "less-equal": (z, tenu) => z <= tenu,
  always: () => true,
});

/** La profondeur d'un point de l'espace normalisé (-1 à 1), telle que le tampon la garde. */
export const profondeur24 = (/** @type {number} */ zNdc) => Math.round((zNdc * .5 + .5) * PROFONDEUR_VIDE);

/**
 * Un polygone de l'espace de découpe, gardé du côté où `plan(v) ≥ 0`
 * (Sutherland-Hodgman) : ce qui passe le plan proche ou le plan lointain
 * n'est pas peint.
 * @param {number[][]} poly
 * @param {(v: number[]) => number} plan
 */
function coupe(poly, plan){
  const out = [];
  for (let i = 0; i < poly.length; i++){
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const da = plan(a), db = plan(b);
    if (da >= 0) out.push(a);
    if ((da >= 0) !== (db >= 0)){
      const t = da / (da - db);
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t, a[3] + (b[3] - a[3]) * t]);
    }
  }
  return out;
}
const PROCHE = (/** @type {number[]} */ v) => v[2] + v[3];
const LOINTAIN = (/** @type {number[]} */ v) => v[3] - v[2];

/**
 * La profondeur en vingt-quatre bits où le triangle `a b c` (espace de
 * découpe) couvre le point `q` de l'écran (espace normalisé), ou -1 s'il ne
 * le couvre pas. Les bords comptent : un point posé juste sur la couture de
 * deux triangles revient à l'un d'eux, comme à la carte graphique.
 * @param {number[]} a @param {number[]} b @param {number[]} c @param {number[]} q
 */
export function couvre(a, b, c, q){
  let poly = [a, b, c];
  // tout le triangle devant l'œil et avant le lointain : rien à couper (le cas courant)
  if (!(a[3] > 0 && b[3] > 0 && c[3] > 0 && PROCHE(a) >= 0 && PROCHE(b) >= 0 && PROCHE(c) >= 0
    && LOINTAIN(a) >= 0 && LOINTAIN(b) >= 0 && LOINTAIN(c) >= 0)){
    poly = coupe(coupe(poly, PROCHE), LOINTAIN);
    if (poly.length < 3) return -1;
  }
  const n = poly.map(v => [v[0] / v[3], v[1] / v[3], v[2] / v[3]]);
  // le polygone coupé, en éventail depuis son premier sommet
  for (let k = 1; k + 1 < n.length; k++){
    const z = dansTriangle(n[0], n[k], n[k + 1], q);
    if (z !== null) return profondeur24(z);
  }
  return -1;
}

/** La profondeur normalisée de `q` dans le triangle écran `a b c`, ou `null` hors de lui. */
function dansTriangle(/** @type {number[]} */ a, /** @type {number[]} */ b, /** @type {number[]} */ c, /** @type {number[]} */ q){
  const aire = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  if (!aire) return null;
  // les poids du point, dans un sens comme dans l'autre : la carte ne retire aucune face
  const u = ((b[0] - q[0]) * (c[1] - q[1]) - (b[1] - q[1]) * (c[0] - q[0])) / aire;
  const v = ((c[0] - q[0]) * (a[1] - q[1]) - (c[1] - q[1]) * (a[0] - q[0])) / aire;
  const w = 1 - u - v;
  if (u < 0 || v < 0 || w < 0) return null;
  // la profondeur normalisée varie à plat sur l'écran
  return u * a[2] + v * b[2] + w * c[2];
}

/**
 * Les sommets d'une couche projetés pour une vue, et le cadre de chaque objet
 * à l'écran : tant que ni la vue ni les sommets ne changent — la souris qui
 * survole un plan immobile —, une question ne relit que les triangles des
 * objets dont le cadre contient le point. Les triangles d'un objet se suivent
 * dans la liste, comme la couche les a faits.
 * @param {ArrayLike<number>} m @param {ArrayLike<number>} pos
 * @param {ArrayLike<number>} indices @param {ArrayLike<number>} objets
 * @param {any} memo ce que la couche garde d'une question à l'autre, ou rien
 */
function projette(m, pos, indices, objets, memo){
  if (memo && memo.pos === pos && memo.indices === indices && memo.m && memo.m.every((/** @type {number} */ x, /** @type {number} */ k) => x === m[k]))
    return memo;
  const nb = pos.length / 3, clip = new Float64Array(nb * 4);
  for (let v = 0; v < nb; v++){
    const x = pos[3 * v], y = pos[3 * v + 1], z = pos[3 * v + 2];
    clip[4 * v] = m[0] * x + m[4] * y + m[8] * z + m[12];
    clip[4 * v + 1] = m[1] * x + m[5] * y + m[9] * z + m[13];
    clip[4 * v + 2] = m[2] * x + m[6] * y + m[10] * z + m[14];
    clip[4 * v + 3] = m[3] * x + m[7] * y + m[11] * z + m[15];
  }
  /* Les plages de triangles, objet par objet, et leur cadre à l'écran ; un
     cadre infini quand un sommet passe derrière l'œil : il se coupe, et
     son triangle se teste toujours. */
  const plages = [];
  for (let t = 0; t + 2 < indices.length; t += 3){
    const o = objets[indices[t]];
    let g = plages[plages.length - 1];
    if (!g || g.objet !== o){ g = { objet: o, debut: t, fin: t, x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity }; plages.push(g); }
    g.fin = t + 3;
    for (let s = 0; s < 3; s++){
      const v = indices[t + s], w = clip[4 * v + 3];
      if (!(w > 0)){ g.x0 = g.y0 = -Infinity; g.x1 = g.y1 = Infinity; continue; }
      const x = clip[4 * v] / w, y = clip[4 * v + 1] / w;
      if (x < g.x0) g.x0 = x; if (x > g.x1) g.x1 = x;
      if (y < g.y0) g.y0 = y; if (y > g.y1) g.y1 = y;
    }
  }
  const r = { m: Array.from(m), pos, indices, clip, plages };
  return r;
}

/**
 * Les triangles d'une couche, dans l'ordre où la carte les peint, au point
 * `q` : `rend(objet, profondeur)` pour chacun qui le couvre.
 * @param {ArrayLike<number>} m       la matrice du monde rapporté à l'espace de découpe
 * @param {ArrayLike<number>} pos     les sommets, x y z à la suite
 * @param {ArrayLike<number>} indices trois par triangle
 * @param {ArrayLike<number>} objets  le numéro d'objet de chaque sommet
 * @param {number[]} q                le point, dans l'espace normalisé de l'écran
 * @param {(objet: number, profondeur: number) => void} rend
 * @param {any} [memo]                la projection d'une question précédente
 * @returns {any} la projection, que la couche garde pour la question suivante
 */
export function traverse(m, pos, indices, objets, q, rend, memo){
  const p = projette(m, pos, indices, objets, memo), clip = p.clip;
  const sommet = (/** @type {number} */ i) => [clip[4 * i], clip[4 * i + 1], clip[4 * i + 2], clip[4 * i + 3]];
  for (const g of p.plages){
    if (q[0] < g.x0 || q[0] > g.x1 || q[1] < g.y0 || q[1] > g.y1) continue;
    for (let t = g.debut; t < g.fin; t += 3){
      const z = couvre(sommet(indices[t]), sommet(indices[t + 1]), sommet(indices[t + 2]), q);
      if (z >= 0) rend(objets[indices[t]], z);
    }
  }
  return p;
}
