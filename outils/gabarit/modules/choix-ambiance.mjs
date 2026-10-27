/* ============================================================
   Le choix de l'ambiance, offert au visiteur

   Ailleurs, l'ambiance du plan — Classique, Tuiles, Immersif — est celle que
   l'exploitant a publiée, et le visiteur n'en voit qu'une. La démonstration
   les montre toutes à qui hésite entre elles : trois boutons sur le plan, qui
   la changent pour cette visite seulement, sans rien enregistrer
   (`ambiance.mjs` `essaieAmbiance`, comme « ?ambiance= » le fait au
   chargement).

   La page figée qui l'offre le dit par `data-choix-ambiance`, posé à la
   construction (`outils/genere.js` `page`). Le même salon écrit dans la base
   (`outils/scripts/salon-demo.js`), servi par le plan public à `?plan=demo` ou
   `/plan-demo`, se reconnaît à son nom : c'est lui qu'on règle, puis qu'on
   montre, et il doit garder le choix de la page figée. Pas en administration,
   où l'ambiance se choisit pour tous dans le volet « Apparence ». Ailleurs, le
   balisage reste caché et rien ne s'écoute. Il se branche en se chargeant — le
   balisage est déjà là, le script venant après lui — et ne fait que marquer
   le bouton de l'ambiance retenue une fois le plan démarré, quand la
   configuration publiée est lue.
   ============================================================ */
import { $ } from "./dom.mjs";
import { ambianceRetenue, essaieAmbiance } from "./ambiance.mjs";
import { PLAN_DEMARRE } from "./demarrage.mjs";
import { SLUG, PLAN_ADMIN } from "./salon.mjs";

/* Le slug du salon de démonstration écrit dans la base (`outils/scripts/salon-demo.js`). */
const SALON_DEMO = "demo";

const boite = $("choixAmbiance");

const offert = document.documentElement.hasAttribute("data-choix-ambiance") ||
  (!PLAN_ADMIN && SLUG === SALON_DEMO);

if (boite && offert){
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
