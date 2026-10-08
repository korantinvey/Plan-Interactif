/* ============================================================
   Un état de module, lu par le code soudé tel qu'il est à l'instant

   `Object.assign(globalThis, { … })` confie une valeur : une fonction, une
   constante, un objet qu'on modifie sans le remplacer. Un état qu'un module
   réaffecte — les données d'un salon, remplacées à chaque chargement — ne s'y
   prête pas : le code soudé garderait la première valeur. Il le lit donc par
   un accesseur, qui rend celle du moment.

   L'écriture, elle, passe par la porte que le module ouvre (`poseDonnees`).
   Le code soudé est un script non strict, où une affectation à un accesseur
   sans écrivain échoue sans bruit : celui-ci lève une erreur qui nomme la
   porte, plutôt que de laisser l'ancienne valeur en place.
   ============================================================ */

/**
 * Les descripteurs d'accès à poser sur l'objet global, depuis des lecteurs
 * `{ NOM: () => NOM }`. Le point d'entrée les pose par
 * `Object.defineProperties(globalThis, vivants({ … }))`, forme que
 * `outils/modules.js` relit comme `Object.assign`.
 *
 * @param {Record<string, () => any>} lecteurs
 * @param {string} porte le nom de la fonction par laquelle on les remplace
 */
export function vivants(lecteurs, porte = "poseDonnees"){
  /** @type {PropertyDescriptorMap} */
  const d = {};
  for (const [nom, lit] of Object.entries(lecteurs)){
    d[nom] = {
      get: lit,
      set(){ throw new Error(nom + " se remplace par " + porte + "({ " + nom + ": … })"); },
      enumerable: true,
    };
  }
  return d;
}
