/* ============================================================
   Le document : ce que tout le code demande à la page
   ============================================================ */

/* Un élément de la page, lu par son identifiant. Rendu sans type précis
   pour `npm run types` : chaque appel saurait mieux que lui ce qu'il attend
   — un champ, un bouton, un canevas —, et le dire à chaque fois chargerait
   le code de plus d'annotations qu'il n'en éviterait d'erreurs. */
/** @returns {any} */
export const $ = (id) => document.getElementById(id);

/**
 * Un téléphone ou une tablette : le pointeur principal est un doigt.
 *
 * La largeur de l'écran ne le dirait pas — une tablette en paysage est plus
 * large que bien des portables — et un portable à écran tactile se pilote
 * d'abord au pavé : il reste un ordinateur. L'invitation à installer
 * (`installation.mjs`) et le lecteur de codes (`scan-parcours.mjs`) ne
 * s'adressent qu'au premier.
 */
export function auDoigt(){
  try { return matchMedia("(pointer: coarse)").matches; } catch (e) { return false; }
}
