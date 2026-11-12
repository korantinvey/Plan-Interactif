/* ============================================================
   Le panneau des critères déplié — sa relecture, et le replier

   À part de `recherche.mjs`, qui le remplit, pour que les tiroirs
   (`tiroirs.mjs`) puissent le replier sans boucler : la recherche les importe
   pour se montrer et se hisser, et un tiroir redescendu referme le panneau.
   Logé dans la recherche, ce geste devait leur être confié au chargement.
   ============================================================ */
import { $ } from "./dom.mjs";

/* Ce que le panneau des critères, quand il est déplié, doit relire : une valeur
   peut tomber ailleurs que sous ses puces — une puce retirée de la bande des
   retenus, « Tout effacer » à son pied. Posé par le remplissage, oublié à la
   fermeture ; refermé, le panneau n'a plus rien à relire. */
/** @type {(() => void) | null} */
let relecture = null;

/** Le remplissage du panneau dit comment le relire (`recherche.mjs` `remplitCriteres`).
 *  @param {() => void} f */
export function poseRelecturePanneau(f){ relecture = f; }

/** Relit le panneau s'il est déplié ; replié, il n'y a rien à faire. */
export function relisPanneauCrit(){ if (relecture) relecture(); }

/** Replié, le panneau rend sa place à la liste. Ce qui est retenu continue de
 *  se dire sous la recherche : les puces de la bande, elles, ne se replient
 *  pas — sans quoi on ne saurait plus pourquoi la liste est si courte. */
export function fermeCriteres(){
  const pan = $("panCrit");
  if (!pan || pan.hidden) return;
  /* Replié, le panneau emporte avec lui le bouton qu'on venait d'actionner, et
     le clavier se retrouverait au début de la page. La main revient donc à la
     prise, d'où elle pourra redéplier. */
  const dedans = pan.contains(document.activeElement);
  pan.hidden = true;
  relecture = null;
  $("critCorps").innerHTML = "";
  $("critPied").innerHTML = "";
  $("btnFiltres").setAttribute("aria-expanded", "false");
  if (dedans) $("btnFiltres").focus();
}
