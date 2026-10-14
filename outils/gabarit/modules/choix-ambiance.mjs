/* ============================================================
   Le choix de l'ambiance, offert au visiteur

   Ailleurs, l'ambiance du plan — Classique, Tuiles, Immersif — est celle que
   l'exploitant a publiée, et le visiteur n'en voit qu'une. La démonstration
   les montre toutes à qui hésite entre elles : trois boutons sur le plan, qui
   la changent pour cette visite seulement, sans rien enregistrer
   (`ambiance.mjs` `essaieAmbiance`, comme « ?ambiance= » le fait au
   chargement).

   La page qui l'offre le dit par `data-choix-ambiance`, posé à la
   construction (`outils/genere.js` `page`) ; sur toute autre, le balisage
   reste caché et rien ne s'écoute. Il se branche en se chargeant — le
   balisage est déjà là, le script venant après lui — et ne fait que marquer
   le bouton de l'ambiance retenue une fois le plan démarré, quand la
   configuration publiée est lue.
   ============================================================ */
import { $ } from "./dom.mjs";
import { ambianceRetenue, essaieAmbiance } from "./ambiance.mjs";
import { PLAN_DEMARRE } from "./demarrage.mjs";

const boite = $("choixAmbiance");

if (boite && document.documentElement.hasAttribute("data-choix-ambiance")){
  const marque = () => boite.querySelectorAll("button").forEach(b =>
    b.setAttribute("aria-pressed", String(b.dataset.ambiance === ambianceRetenue())));
  boite.addEventListener("click", e => {
    const b = /** @type {HTMLElement | null} */ (/** @type {HTMLElement} */ (e.target).closest("button[data-ambiance]"));
    if (!b || !b.dataset.ambiance) return;
    essaieAmbiance(b.dataset.ambiance);
    marque();
  });
  PLAN_DEMARRE.suis(() => { boite.hidden = false; marque(); });
}
