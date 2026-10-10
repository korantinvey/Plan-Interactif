/* ============================================================
   La visite guidée en cours — ou rien

   L'état seul, à part de `tutoriel.mjs` qui la mène : les rappels de
   conférence (`rappels.mjs`) et l'invitation à installer (`installation.mjs`)
   s'effacent devant elle, et les rappels ne pouvaient importer la visite
   guidée, qui les atteint par le tiroir du parcours — elle devait leur
   confier un lecteur au chargement. Ils la lisent ici.
   ============================================================ */

/** La visite en cours, ou rien. Seule la visite guidée la remplace. */
/** @type {any} */
export let TUTO = null;

/** La porte de la visite en cours, que `tutoriel.mjs` ouvre et referme.
 *  @param {any} t */
export function poseTuto(t){ TUTO = t; }
