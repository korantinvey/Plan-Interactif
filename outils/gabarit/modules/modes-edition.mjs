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

   Chaque outil qui s'ouvre demande aussi `editionPossible` : l'édition exige
   que le WebGL peigne le plan. Les poignées, les cotes, les aimants et les
   contours des outils vivent dans la scène d'édition (`scene.mjs`),
   que seul le dessin peint et vise (décision du 15 novembre 2026,
   `docs/migration-webgl.md`) ; quand le SVG montre le plan — un navigateur
   sans carte graphique, `?rendu=svg` —, un outil ouvert n'aurait ni repère à
   montrer ni prise à offrir. Il ne s'ouvre pas, et la fenêtre dit pourquoi.

   Un module de l'administration : le visiteur n'a aucun de ces outils.
   ============================================================ */
import { svgPeint } from "./svg-de-secours.mjs";
import { ouvreModale } from "./fenetre.mjs";

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

/**
 * L'outil qui s'ouvre peut-il servir ? Oui si le WebGL peint le plan ; sinon
 * la fenêtre le dit, et l'outil reste fermé. Appelé par chaque entrée : le
 * dessin, les libellés, la reprise, le calage d'un hall.
 * @returns {boolean}
 */
export function editionPossible(){
  if (!svgPeint()) return true;
  ouvreModale("L'édition demande une carte graphique", corps => {
    const p = document.createElement("p");
    p.textContent = "Ce navigateur montre le plan sans carte graphique : les poignées et les repères " +
      "des outils ne peuvent pas s'y dessiner. Ouvrez l'administration dans un navigateur à jour, " +
      "ou activez l'accélération matérielle dans ses réglages.";
    corps.appendChild(p);
  }, [{ libelle: "Compris" }]);
  return false;
}
