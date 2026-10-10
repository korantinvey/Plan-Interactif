/* ============================================================
   La couleur de la barre du système

   Un module à elle, plutôt qu'une place dans l'index du salon : la
   bande du salon la redemande à chaque modèle et à chaque accent
   (`habillage.mjs`), la bande d'administration en s'ouvrant
   (`bande-admin.mjs`). Elle ne dépend que de la page, et se laisse importer
   par tous.
   ============================================================ */
import { $ } from "./dom.mjs";

/**
 * La couleur dont le système peint sa barre, celle de l'heure et de la
 * batterie.
 *
 * La page va maintenant jusqu'aux bords de l'écran (`viewport-fit=cover`,
 * posé par `outils/genere.js`) : la bande du salon monte derrière l'horloge,
 * et le système ne sait rien de ce qu'elle porte. Il n'a qu'un indice,
 * `theme-color`, dont il tire le fond qu'il peint sous ses pictogrammes et
 * leur noir ou leur blanc. Écrite une fois pour toutes à la construction — le
 * crème de la surface, voir `outils/pwa.js` — elle annonçait une barre claire
 * au-dessus d'un bandeau que le modèle du salon peint en bleu profond :
 * l'heure s'y écrivait en sombre sur du sombre.
 *
 * Elle suit donc la bande qui touche le haut de l'écran — celle de
 * l'administration quand elle est là, celle du salon sinon.
 *
 * La couleur se lit sur une sonde plutôt que dans le jeton : un modèle compose
 * la sienne avec `color-mix()`, un autre l'emprunte à l'accent du salon, et
 * seul le navigateur sait ce que cela donne. Un élément vide, peint du jeton
 * et grand comme rien, répond en `rgb(…)` — la seule forme qu'un
 * `theme-color` accepte.
 *
 * La mesure attend l'image suivante, et une seule par image : l'accent se pose
 * en rafale pendant qu'on le cherche au nuancier, et demander un style calculé
 * au milieu du geste aurait fait recalculer la page entière à chaque
 * mouvement du doigt. Le système, lui, ne repeint pas sa barre soixante fois
 * par seconde.
 */
let tonPrevu = 0;
export function poseTonDeLaBarre(){
  cancelAnimationFrame(tonPrevu);
  tonPrevu = requestAnimationFrame(() => {
    const bande = document.querySelector(".bandeAdmin:not([hidden])") || $("bandeau");
    if (!bande) return;
    const sonde = document.createElement("i");
    sonde.style.cssText = "position:absolute;width:0;height:0;background:var(--ton-barre)";
    bande.appendChild(sonde);
    const ton = getComputedStyle(sonde).backgroundColor;
    sonde.remove();
    /* Un jeton absent ou translucide ne dit rien à un système qui peint un
       aplat : la couleur de la construction vaut mieux qu'un noir deviné. */
    if (!ton || /^rgba\(.*,\s*0\)$/.test(ton)) return;
    /** @type {HTMLMetaElement | null} */
    let m = document.querySelector('meta[name="theme-color"]');
    if (!m){
      m = document.createElement("meta");
      m.name = "theme-color";
      document.head.appendChild(m);
    }
    m.content = ton;
  });
}

/**
 * Appelé par `lancement.mjs` `lancePlan` en tête de suite, pour que l'écoute
 * se pose à son rang parmi celles de la page.
 *
 * Le ton ne dépend pas que du modèle : il dépend aussi de la largeur. Sur un
 * téléphone la bande du salon n'est plus une bande, et c'est le fond du plan
 * qui touche la barre du système (voir `_styles-modeles-parcours.css`, « max-width:900px »). Une
 * tablette qu'on tourne franchit ce seuil sans rien changer d'autre.
 */
export function brancheTonDeLaBarre(){
  matchMedia("(max-width:900px)").addEventListener("change", () => poseTonDeLaBarre());
}
