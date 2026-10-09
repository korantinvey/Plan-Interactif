/* ============================================================
   Dupliquer un salon — l'édition suivante, sans ce qui n'est qu'à celle-ci

   Le bouton « Dupliquer l'événement » de la barre aboutit ici. Ce que le
   module ne peut pas importer lui est confié par la console
   (`brancheDuplication`, `_console-js.html`) : la fenêtre de saisie du
   socle, l'appel à la base, le rechargement de la console une fois la copie
   créée, et la barre d'état.
   ============================================================ */
import { slugifie } from "./evenements.mjs";

/** @type {{
 *   demande: (titre: string, libelle: string, valeur: string, suite: (v: string) => any) => void,
 *   rest: (chemin: string, options?: RequestInit) => Promise<any>,
 *   charge: () => Promise<void>,
 *   signale: (txt: string, erreur?: boolean) => void,
 * }} */
let _console = {
  demande: () => {},
  rest: async () => null,
  charge: async () => {},
  signale: () => {},
};

/** Ce que la console confie à la duplication : voir `_console`. */
export function brancheDuplication(branche) {
  _console = branche;
}

export function dupliquer(e) {
  _console.demande("Dupliquer l'événement", "Nom de la copie", e.nom + " — copie", async (nom) => {
    try {
      // l'édition suivante a ses propres identifiants Klipso : on ne recopie
      // ni l'identifiant d'événement, ni les pavillons. Le fuseau choisi, si :
      // l'édition suivante se tient d'ordinaire au même endroit
      await _console.rest("evenement", {
        method: "POST",
        headers: { "Prefer": "return=representation" },
        body: JSON.stringify({
          nom, slug: slugifie(nom), instance: e.instance,
          rythme_min: e.rythme_min, etat: "brouillon",
          fuseau_choisi: e.fuseau_choisi ?? null,
        }),
      });
      await _console.charge();
    } catch (err) { _console.signale(err.message, true); }
  });
}
