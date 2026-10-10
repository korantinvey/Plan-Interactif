/* ============================================================
   Les trois modes d'édition — un seul à la fois

   Dessiner sur un calque (`outil-dessin.mjs`), reprendre la forme d'un
   emplacement (`reprise-emplacements.mjs`), placer un libellé à la main
   (`placement-libelles.mjs`) : les trois se disputeraient le glisser, et
   laisser deux gestes viser le même pointeur donnait un plan qui bouge sous
   deux outils à la fois. Entrer dans l'un referme donc les deux autres.

   La règle était écrite trois fois, une par outil, et chacun devait appeler
   les deux autres — l'outil de dessin par import, les deux autres par des
   portes que l'outil, qui les importe, leur ouvrait au chargement. Elle vit
   ici, une fois : chaque outil inscrit en se chargeant de quoi se refermer,
   et appelle `quitteLesAutres` en s'ouvrant.

   Un module de l'administration : le visiteur n'a aucun de ces outils.
   ============================================================ */

/** @typedef {"dessin" | "libelles" | "reprise"} ModeEdition */

/* L'ordre dans lequel les autres se referment — celui que les trois entrées
   suivaient déjà : le dessin d'abord, puis les libellés, puis la reprise. */
/** @type {ModeEdition[]} */
const ORDRE = ["dessin", "libelles", "reprise"];

/** @type {Map<ModeEdition, () => void>} */
const SORTIES = new Map();

/**
 * Ce qui referme un mode s'il est ouvert, et ne fait rien sinon : chaque outil
 * l'inscrit en se chargeant, donc avant tout geste.
 * @param {ModeEdition} mode
 * @param {() => void} sortie
 */
export function inscritMode(mode, sortie){ SORTIES.set(mode, sortie); }

/**
 * Referme les deux autres modes, appelé par celui qui s'ouvre.
 * @param {ModeEdition} moi
 */
export function quitteLesAutres(moi){
  for (const mode of ORDRE){
    const sortie = mode !== moi && SORTIES.get(mode);
    if (sortie) sortie();
  }
}
