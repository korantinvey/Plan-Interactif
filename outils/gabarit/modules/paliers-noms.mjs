/* ============================================================
   Les paliers des noms — trois tailles pour tout un pavillon

   Quand l'exploitant harmonise les noms des stands (`nom-emplacement.mjs`
   `nomsUniformes`), chaque nom n'écrit plus à la plus grande taille que sa
   place lui permet, mais au plus grand de trois paliers qu'il atteint. Ce
   module ne fait que le calcul, sur des tailles déjà mesurées : il ne dépend
   de rien, et s'éprouve seul dans Node (`outils/essais/paliers-noms.js`).
   ============================================================ */

/* Les paliers, en part du plus haut. Assez écartés pour que l'œil les
   distingue comme trois tailles et non comme un flou, assez serrés pour que
   le plan ne semble pas opposer les grands stands aux petits : la moitié,
   d'abord retenue pour le bas, laissait le double entre un nom du haut et
   un nom du bas (FEP27, 24 octobre 2026). */
export const PARTS = [1, .85, .7];
/* Où se prend le plafond parmi les tailles du pavillon : le premier quart.
   À la médiane, la moitié des noms dépassaient de loin les autres dès que
   le débord sur les allées leur donnait de la place ; au premier quart, les
   trois quarts des noms écrivent à la même taille, et les plus petits n'en
   sont plus qu'aux deux tiers. Mesuré sur les trois pavillons de la
   démonstration : l'écart entre le plafond et les plus petits noms passe
   d'un facteur 2,2 à 1,5. */
export const RANG_PLAFOND = .25;

/**
 * Les trois paliers d'un pavillon, du plus grand au plus petit, d'après la
 * plus grande taille que chacun de ses noms peut prendre.
 *
 * Le palier du haut est la taille qu'atteignent les trois quarts des noms :
 * c'est le plafond. Un stand au nom court sur un grand emplacement n'écrit
 * plus en lettres d'un mètre et demi quand ses voisins écrivent en dix
 * centimètres. Le minimum, qui servait d'abord de taille commune, tombait à
 * rien dès qu'un petit stand portait un long nom : un rang ne doit rien aux
 * cas extrêmes.
 *
 * @param {number[]} tailles la plus grande taille de chaque nom, en mètres
 * @returns {number[]} vide s'il n'y a rien à mesurer
 */
export function paliersDe(tailles){
  const t = tailles.filter(f => f > 0).sort((a, b) => a - b);
  if (!t.length) return [];
  const plafond = t[Math.min(t.length - 1, Math.floor(RANG_PLAFOND * t.length))];
  return PARTS.map(k => plafond * k);
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
