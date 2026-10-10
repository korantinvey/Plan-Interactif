/* ============================================================
   10. Mode administration — ce que le plan public en sait

   Il n'existe que dans la page dédiée, et seulement une fois l'utilisateur
   authentifié. La page publique ne l'active jamais et retire ses commandes
   du document. Un raccourci clavier ne serait pas une frontière.

   Ce module tient l'état — `ADMIN`, que tout le plan lit, public compris,
   souvent pour se taire hors de l'administration — et le retrait des
   commandes, que le démarrage fait en dernier hors de l'administration
   (`demarrage.mjs` `brancheDemarrage`). L'ouverture du mode,
   elle, est d'exploitant : elle vit dans `modules/bande-admin.mjs`, que seul
   `plan-admin.mjs` embarque, et c'est elle seule qui pose l'état, par sa porte
   `ouvreModeAdmin`. Les modules l'importent.
   ============================================================ */
import { $ } from "./dom.mjs";

/** Le mode administration est-il ouvert ? Faux dans la page publique, toujours. */
export let ADMIN = false;

/** La porte de l'état : l'ouverture du mode (`bande-admin.mjs` `activeAdmin`). */
export function ouvreModeAdmin(){
  ADMIN = true;
}

/**
 * Page publique : les commandes d'administration sont neutralisées.
 * On les masque et on les vide plutôt que de les supprimer — le montage du
 * plan y touche encore, et ADMIN restant faux, rien ne peut les activer.
 */
export function retireAdmin(){
  ["btnLayers", "btnReglages", "menuCompte", "bandeAdmin"].forEach(id => { const b = $(id); if (b) b.remove(); });
  ["panel", "outils", "elemSel", "libReg", "geoReg"].forEach(id => {
    const e = $(id);
    if (!e) return;
    e.hidden = true;
    e.classList.remove("open");
    e.setAttribute("aria-hidden", "true");
    if (id !== "outils") e.innerHTML = "";
  });
}
