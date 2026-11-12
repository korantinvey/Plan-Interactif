/* ============================================================
   Les écritures en file — l'écran change au clic, la base dit le dernier mot

   La console et l'administration changent l'écran sans attendre le serveur :
   attendre ferait douter du clic. L'écriture part derrière, et si la base la
   refuse, l'écran revient à ce qu'elle tient. Ce geste était recodé à la main
   dans une demi-douzaine de modules, et chacun s'y trompait à sa façon, une
   revue après l'autre :

   - deux écritures lancées de front, la plus lente l'emportait, et l'ancien
     état pouvait rester ;
   - la réponse d'une écriture antérieure, arrivée pendant le geste suivant,
     remettait l'écran à un état d'avant ce geste ;
   - un refus défaisait le geste refusé (« l'inverse du clic ») au lieu de
     revenir à ce que la base tenait — deux refus de suite laissaient l'écran
     à l'inverse de la base ;
   - l'état confirmé et l'état affiché étaient le même objet, que le clic
     suivant modifiait en place : la restauration gardait le refusé.

   Ce module tient ces quatre règles une fois pour toutes. Les écritures
   passent l'une après l'autre ; chacune reçoit l'état que la précédente a
   fait confirmer ; sa réponse dit si elle est encore la dernière de sa clé —
   seule la dernière remet l'écran à jour ; l'état confirmé n'est jamais
   partagé, on n'en reçoit que des copies.

   Il ne dépend de rien, ne touche ni au DOM ni au réseau, et s'éprouve seul
   (`outils/essais/ecritures-en-file.js`). Ce qu'il faut afficher, et comment
   revenir en arrière, reste au module qui s'en sert.
   ============================================================ */

/**
 * @template T
 * @typedef {object} Reponse
 * @property {boolean} ok la base a pris l'écriture
 * @property {boolean} dernier aucun geste plus récent de la même clé n'a été
 *   demandé depuis : c'est à cette réponse de remettre l'écran à jour
 * @property {T} confirme une copie de l'état que la base tient à présent
 * @property {unknown} [erreur] ce qui a fait échouer l'écriture
 */

/**
 * Une file d'écritures et l'état qu'elles ont fait confirmer.
 *
 * @template T
 * @param {T} [initial] l'état tel que chargé ; il est copié, le module qui le
 *   tient peut donc le modifier sans toucher à celui-ci
 * @param {{ copie?: (v: T) => T }} [options] `copie` remplace
 *   `structuredClone`, pour un état qui ne s'y prête pas
 */
export function creeFileEcritures(initial, options = {}) {
  const copie = options.copie || ((v) => (v === undefined ? v : structuredClone(v)));
  /** @type {Promise<unknown>} */
  let fin = Promise.resolve();
  let confirme = copie(/** @type {T} */ (initial));
  /** Le numéro du dernier geste, par clé. */
  const numeros = new Map();

  return {
    /** Une copie de l'état que la base a confirmé en dernier. */
    confirme: () => copie(confirme),

    /**
     * Un geste de plus. `envoie` part quand les écritures d'avant ont répondu,
     * et reçoit une copie de l'état confirmé ; ce qu'elle rend, si elle rend
     * quelque chose, devient l'état confirmé. Elle peut lever : la file n'en
     * est pas rompue, et la réponse le dit.
     *
     * La clé sépare les gestes qui ne se remplacent pas : deux cases d'une
     * même fiche partagent la file — elles écrivent la même colonne —, mais
     * le refus de l'une ne doit pas attendre que l'autre ait fini de bouger.
     *
     * @param {(confirme: T) => (T | void | Promise<T | void>)} envoie
     * @param {string} [cle]
     * @returns {Promise<Reponse<T>>} ne rejette jamais
     */
    ecrit(envoie, cle = "") {
      const n = (numeros.get(cle) || 0) + 1;
      numeros.set(cle, n);
      const tache = fin.then(async () => {
        try {
          const rendu = await envoie(copie(confirme));
          if (rendu !== undefined) confirme = copie(/** @type {T} */ (rendu));
          return { ok: true, dernier: numeros.get(cle) === n, confirme: copie(confirme) };
        } catch (erreur) {
          return { ok: false, dernier: numeros.get(cle) === n, confirme: copie(confirme), erreur };
        }
      });
      fin = tache;
      return tache;
    },

    /** Quand toutes les écritures demandées jusqu'ici ont répondu. */
    vide: () => fin.then(() => undefined),
  };
}
