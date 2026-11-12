/* ============================================================
   Un événement — dire ce qui vient de se passer, sans savoir qui écoute

   Le motif publication / abonnement (pub/sub), réduit à l'essentiel. Le plan
   public et l'administration partagent leurs modules ; seule l'administration
   embarque les siens, que la page publique ne peut donc importer. Quand un
   module public devait prévenir l'exploitant — un pavillon monté, un calque
   en attente, une session refusée —, l'administration lui injectait jadis sa
   fonction (`injecte…`), chacune avec son objet de défauts sans effet : le
   module public nommait `majAttente`, `compteRescapes`, `oublieEdition`, et
   savait donc ce que faisait l'autre.

   Un événement renverse cela. Le module public émet le fait
   (`PAVILLON_MONTE.emet()`), l'administration l'écoute en se chargeant
   (`ecoute`) ; chez le visiteur, personne n'écoute, et rien ne se passe.
   C'est le motif de `parcours.mjs` `suitLeParcours`, rendu commun.

   Les écouteurs s'appellent dans l'ordre de leur chargement. Un événement ne
   convient donc qu'à ce dont l'ordre ne compte pas, ou qui n'a qu'un
   écouteur : ce qui doit se suivre dans un ordre fixe — le rendu de chaque
   image, le lancement — garde son injection, où l'ordre est écrit.

   Sans aucun import : tous peuvent l'importer.
   ============================================================ */
/**
 * @template {any[]} A
 * @typedef {object} Evenement
 * @property {(f: (...a: A) => void) => void} ecoute   s'abonner, en se chargeant
 * @property {(...a: A) => boolean} emet   émettre ; dit si quelqu'un écoutait
 * @property {() => boolean} ecoutee   quelqu'un écoute-t-il ?
 */

/**
 * Un événement nouveau, que son module exporte sous le nom du fait.
 * @template {any[]} [A=[]]
 * @returns {Evenement<A>}
 */
export function creeEvenement(){
  /** @type {Array<(...a: A) => void>} */
  const ecouteurs = [];
  return {
    ecoute: f => { ecouteurs.push(f); },
    emet: (...a) => { ecouteurs.forEach(f => f(...a)); return ecouteurs.length > 0; },
    ecoutee: () => ecouteurs.length > 0,
  };
}
