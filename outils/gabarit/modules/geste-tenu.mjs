/* ============================================================
   Un geste tenu — ce qui retient l'envoi au repos

   L'envoi automatique de la configuration (`enregistrement.mjs`) ne doit pas
   partir pendant qu'une main tient le plan, une forme, une poignée, un
   libellé, la carte ou un hall qu'on cale — ni pendant qu'un tracé commencé
   attend son sommet suivant : il publierait une forme à mi-chemin.

   La question se posait autrefois aux gestes de l'exploitant, qui
   connaissaient tous les outils et la confiaient à l'enregistrement par une
   porte : plusieurs de ces outils importent l'enregistrement, qui ne pouvait
   donc pas les interroger lui-même. Chaque outil inscrit désormais ici, en se
   chargeant, ce qui dit qu'il tient un geste, et l'enregistrement ne lit que
   ce registre. Un outil de plus s'y inscrit, sans que personne d'autre change.

   Sans aucun import, comme `tiroirs-exclusifs.mjs` : tous peuvent l'importer.
   ============================================================ */
/** @type {Array<() => unknown>} */
const TENUS = [];

/**
 * Inscrire ce qui dit qu'un outil tient un geste.
 * @param {() => unknown} tient
 */
export function inscritGesteTenu(tient){ TENUS.push(tient); }

/** Un geste est-il tenu, par quelque outil que ce soit ? */
export const unGesteTenu = () => TENUS.some(tient => Boolean(tient()));
