/* ============================================================
   Le document : ce que tout le code demande à la page
   ============================================================ */

/* Un élément de la page, lu par son identifiant. Rendu sans type précis
   pour `npm run types` : chaque appel saurait mieux que lui ce qu'il attend
   — un champ, un bouton, un canevas —, et le dire à chaque fois chargerait
   le code de plus d'annotations qu'il n'en éviterait d'erreurs. */
/** @returns {any} */
export const $ = (id) => document.getElementById(id);
