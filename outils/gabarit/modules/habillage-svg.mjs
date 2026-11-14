/* ============================================================
   Le SVG porte-t-il l'habillage ?

   L'habillage de Klipso se lit, pour le dessin, dans une copie détachée de
   son balisage (`calque-detache.mjs`). Le remplir aussi dans le SVG caché,
   c'était tenir à jour le style et la mise en page de milliers d'éléments que
   personne ne voit — neuf sur dix du SVG d'un salon comme SMCL. Il ne s'y
   remplit donc que si le SVG peut avoir à le montrer.

   Le dessin (`webgl.mjs`) le dit : il retire l'habillage du SVG quand il
   tente de peindre, et le lui rend s'il lui rend la main — un dessin trop
   long à venir, une carte graphique perdue. `apparence.mjs`, qui remplit les
   calques, ne le fait que lorsque le SVG les porte, et les remplit au signal.

   Un module neutre : le dessin ne peut pas importer `apparence.mjs`, qui
   l'atteint déjà.
   ============================================================ */
import { creeEvenement } from "./evenement.mjs";

/** Le SVG reprend l'habillage : les calques montrés sont à remplir. */
export const HABILLAGE_REPRIS = creeEvenement();

let porte = true;
/** Le SVG doit-il porter l'habillage ? Oui tant que rien ne peint à sa place. */
export const habillageDansLeSvg = () => porte;
/** Le dessin prend l'habillage au SVG, ou le lui rend. */
export function poseHabillageDansLeSvg(/** @type {boolean} */ oui){
  if (porte === oui) return;
  porte = oui;
  if (oui) HABILLAGE_REPRIS.emet();
}
