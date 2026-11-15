/* ============================================================
   Le SVG porte-t-il ce que le dessin peint ?

   Le SVG caché n'est plus la source du dessin (`webgl.mjs`) : l'habillage de
   Klipso se lit dans une copie détachée de son balisage (`calque-detache.mjs`),
   les stands et les zones dans leurs données (`etat-emplacements.mjs`). Les
   remplir aussi dans le SVG, c'était tenir à jour le style et la mise en
   page de milliers d'éléments que personne ne voit — neuf sur dix du SVG
   d'un salon comme SMCL pour l'habillage. Ils ne s'y remplissent donc que si
   le SVG peut avoir à les montrer : c'est alors le rendu de secours.

   Le dessin le dit : il prend la main au SVG quand il tente de peindre, et la
   lui rend s'il échoue — un dessin trop long à venir, une carte graphique
   perdue. `apparence.mjs`, qui remplit les calques de l'habillage, et
   `rendu.mjs`, qui pose les tracés des stands et des zones dans leurs
   groupes, ne le font que lorsque le SVG peint, et le font au signal.

   Les groupes des stands et des zones, eux, restent dans les deux cas : ils
   sont la couche que le clavier parcourt et que lit la lecture d'écran, et ce
   par quoi le dessin désigne un emplacement. Seul leur tracé s'en va.

   Un module neutre : le dessin ne peut importer ni `apparence.mjs` ni
   `rendu.mjs`, qui l'atteignent déjà.
   ============================================================ */
import { creeEvenement } from "./evenement.mjs";

/** Le SVG reprend la main : ce qu'il montre est à remplir. */
export const SVG_REPRIS = creeEvenement();

let peint = true;
/** Le SVG peint-il le plan ? Oui tant que rien ne peint à sa place. */
export const svgPeint = () => peint;
/** Le dessin prend la main au SVG, ou la lui rend. */
export function poseSvgPeint(/** @type {boolean} */ oui){
  if (peint === oui) return;
  peint = oui;
  if (oui) SVG_REPRIS.emet();
}
