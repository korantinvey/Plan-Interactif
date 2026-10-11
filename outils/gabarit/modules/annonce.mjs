/* ============================================================
   Une annonce — dire ce qui vient de se passer, sans savoir qui écoute

   Le plan public et l'administration partagent leurs modules ; seule
   l'administration embarque les siens, que la page publique ne peut donc
   importer. Quand un module public devait prévenir l'exploitant — un pavillon
   monté, un calque en attente, une session refusée —, l'administration lui
   prêtait jadis sa fonction par une porte (`confie…`), chacune avec son objet
   de défauts sans effet : le module public nommait `majAttente`,
   `compteRescapes`, `oublieEdition`, et savait donc ce que faisait l'autre.

   Une annonce renverse cela. Le module public dit le fait (`PAVILLON_MONTE`),
   l'administration s'y inscrit en se chargeant (`suis`) ; chez le visiteur,
   personne n'écoute, et rien ne se passe. C'est le motif de
   `parcours.mjs` `suitLeParcours`, rendu commun.

   L'ordre des inscrits est celui de leur chargement. Une annonce ne convient
   donc qu'à ce dont l'ordre ne compte pas, ou qui n'a qu'un inscrit : ce qui
   doit se suivre dans un ordre fixe — le rendu de chaque image, le
   lancement — garde sa porte, où l'ordre est écrit.

   Sans aucun import : tous peuvent l'importer.
   ============================================================ */
/**
 * @template {any[]} A
 * @typedef {object} Annonce
 * @property {(f: (...a: A) => void) => void} suis   s'inscrire, en se chargeant
 * @property {(...a: A) => boolean} dis   annoncer ; dit si quelqu'un écoutait
 * @property {() => boolean} suivie   quelqu'un écoute-t-il ?
 */

/**
 * Une annonce nouvelle, que son module exporte sous le nom du fait.
 * @template {any[]} [A=[]]
 * @returns {Annonce<A>}
 */
export function creeAnnonce(){
  /** @type {Array<(...a: A) => void>} */
  const suivants = [];
  return {
    suis: f => { suivants.push(f); },
    dis: (...a) => { suivants.forEach(f => f(...a)); return suivants.length > 0; },
    suivie: () => suivants.length > 0,
  };
}
