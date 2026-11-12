/* ============================================================
   Le pas d'une hauteur à l'autre, dans la fenêtre des réglages

   Un module de l'administration, à part de `reglages.mjs` pour que les volets
   que celle-ci importe — le générique (`reglage-sponsor.mjs`), la suggestion
   (`reglage-suggestion.mjs`) — puissent l'importer aussi : logé dans la
   fenêtre, il devait leur être confié au chargement, faute de pouvoir
   s'importer sans boucle.
   ============================================================ */
import { $ } from "./dom.mjs";
import { REDUIT } from "./ecran.mjs";

/**
 * Passer d'un volet à l'autre sans que la fenêtre saute.
 *
 * Les volets n'ont pas la même hauteur — trois cases d'un côté, une planche
 * d'aperçus de l'autre — et la fenêtre en changeait d'un coup. Son haut est
 * déjà tenu par la feuille de style, qui l'accroche en haut plutôt que de la
 * centrer ; reste sa hauteur, qui se rend d'un pas à l'autre au lieu d'y
 * sauter.
 *
 * Les deux hauteurs se mesurent de part et d'autre du changement — « auto » ne
 * s'interpole pas, il faut donc deux nombres — et l'animation est posée sur la
 * fenêtre elle-même : le corps défile déjà pour son compte, il absorbe sans
 * broncher d'être quelques dizaines de pixels trop court le temps du geste.
 */
export function glisseFenetre(change){
  const fen = $("modale").querySelector(".mfen");
  if (!fen || REDUIT){ change(); return; }
  const avant = fen.offsetHeight;
  change();
  const apres = fen.offsetHeight;
  if (avant === apres) return;
  fen.animate([{ height: avant + "px" }, { height: apres + "px" }],
              { duration: 190, easing: "ease-out" });
}
