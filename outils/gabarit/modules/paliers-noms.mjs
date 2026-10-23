/* ============================================================
   Les paliers des noms — trois tailles pour tout un pavillon

   Quand l'exploitant harmonise les noms des stands (`nom-emplacement.mjs`
   `nomsUniformes`), chaque nom n'écrit plus à la plus grande taille que sa
   place lui permet, mais au plus grand de trois paliers qu'il atteint. Ce
   module ne fait que le calcul, sur des tailles déjà mesurées : il ne dépend
   de rien, et s'éprouve seul dans Node (`outils/essais/paliers-noms.js`).
   ============================================================ */

/* Les paliers, en part du plus haut. Assez écartés pour que l'œil les
   distingue comme trois tailles et non comme un flou, assez proches pour que
   le palier du bas reste lisible quand le haut l'est. */
export const PARTS = [1, .75, .5];

/**
 * Les trois paliers d'un pavillon, du plus grand au plus petit, d'après la
 * plus grande taille que chacun de ses noms peut prendre.
 *
 * Le palier du haut est la médiane de ces tailles : c'est le plafond. Un
 * stand au nom court sur un grand emplacement n'écrit plus en lettres d'un
 * mètre et demi quand ses voisins écrivent en dix centimètres ; il s'arrête à
 * la taille que la moitié des noms atteignent. Le minimum, qui servait de
 * taille commune, tombait à rien dès qu'un petit stand portait un long nom :
 * la médiane ne doit rien aux cas extrêmes.
 *
 * @param {number[]} tailles la plus grande taille de chaque nom, en mètres
 * @returns {number[]} vide s'il n'y a rien à mesurer
 */
export function paliersDe(tailles){
  const t = tailles.filter(f => f > 0).sort((a, b) => a - b);
  if (!t.length) return [];
  const m = t.length >> 1;
  const mediane = t.length % 2 ? t[m] : (t[m - 1] + t[m]) / 2;
  return PARTS.map(k => mediane * k);
}

/**
 * La taille où un nom s'écrit : le plus grand palier qu'il atteint. Un nom
 * qui n'atteint même pas le plus petit garde la sienne — le réduire encore
 * ne servirait pas l'harmonie, seulement l'illisibilité.
 *
 * @param {number} f la plus grande taille que le nom peut prendre
 * @param {number[]} paliers du plus grand au plus petit
 */
export function palierDe(f, paliers){
  // une erreur d'arrondi ne doit pas faire tomber d'un palier le nom qui l'a fixé
  for (const p of paliers) if (f >= p * (1 - 1e-9)) return p;
  return f;
}
