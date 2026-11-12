/* ============================================================
   Dupliquer un salon — l'édition suivante, sans ce qui n'est qu'à celle-ci

   Le bouton « Dupliquer l'événement » de la barre aboutit ici. La fenêtre de
   saisie, l'appel à la base et la barre d'état viennent du socle de la
   console (`fenetre-console.mjs`, `socle-console.mjs`). Le rechargement de la
   console une fois la copie créée lui est confié par l'écran de la console
   (`brancheDuplication`, `ecran-console.mjs`), qui l'importe : l'importer ici
   bouclerait.
   ============================================================ */
import { slugifie } from "./evenements.mjs";
import { demande } from "./fenetre-console.mjs";
import { rest, signale } from "./socle-console.mjs";

/** @type {{ charge: () => Promise<void> }} */
let _console = {
  charge: async () => {},
};

/** Ce que la console confie à la duplication : voir `_console`. */
export function brancheDuplication(branche) {
  _console = branche;
}

export function dupliquer(e) {
  demande("Dupliquer l'événement", "Nom de la copie", e.nom + " — copie", async (nom) => {
    try {
      // l'édition suivante a ses propres identifiants Klipso : on ne recopie
      // ni l'identifiant d'événement, ni les pavillons. Le fuseau choisi, si :
      // l'édition suivante se tient d'ordinaire au même endroit
      await rest("evenement", {
        method: "POST",
        headers: { "Prefer": "return=representation" },
        body: JSON.stringify({
          // un nom sans lettre latine (« 東京 ») ne donne aucun identifiant :
          // le même repli que la création (`ecran-console.mjs`)
          nom, slug: slugifie(nom) || "evenement", instance: e.instance,
          rythme_min: e.rythme_min, etat: "brouillon",
          fuseau_choisi: e.fuseau_choisi ?? null,
        }),
      });
    } catch (err) { signale(err.message, true); return; }
    /* La copie existe dès que le POST a répondu. Un rechargement de la liste
       qui échoue ensuite ne doit pas le faire croire raté : on la redemanderait,
       et on aurait deux copies. */
    try { await _console.charge(); }
    catch (err) {
      signale("La copie est créée, mais la liste n'a pas pu se recharger : " + err.message, true);
    }
  });
}
