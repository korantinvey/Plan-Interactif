/* ============================================================
   Le style de l'habillage de Klipso, résolu sans la feuille de style

   L'habillage — les calques que Klipso livre en SVG (`P().fond`) — fait
   l'essentiel du SVG caché : neuf éléments sur dix sur un salon comme SMCL.
   Le dessin (`webgl.mjs`) en relisait chaque élément dans le style que le
   navigateur avait calculé, un `getComputedStyle` par élément, et le
   navigateur tenait à jour, pour cela, le style de milliers d'éléments que
   personne ne voit. Ce module rend le même style sans le lui demander, pour
   que le dessin lise le calque dans une copie détachée de son balisage,
   jamais posée dans la page (`docs/migration-webgl.md`, étape 3).

   La cascade, dans son ordre :
   - le réglage de l'exploitant, par calque et par sous-calque — couleur,
     remplissage ou trait, sous-calque éteint —, que `apparence.mjs`
     `styleFond` pose sur le groupe du sous-calque : le même calcul, ici, sur
     la configuration (`styleSousCalque`) ;
   - les attributs de dessin que Klipso écrit, hérités d'un parent comme la
     feuille les hérite (`fill`, `stroke`, leurs opacités, les tirets,
     l'ancrage et la graisse d'un texte) ;
   - les deux règles de `_styles-plan.css` qui l'emportent sur eux : les
     traits des tracés, polylignes et cercles, épais de 0,7 pixel à l'écran
     quel que soit le zoom, et les textes, qui se peignent à la couleur du
     calque, sans contour, dans la police du plan.

   Les balises sont celles que le nettoyage de Klipso laisse passer
   (`_partage/svg.ts` `PERMIS`) : groupes, tracés, polylignes, cercles,
   textes. Qui change une règle de la feuille sur `#couches .cal` change aussi
   celle d'ici : l'essai `outils/essais/navigateur/habillage.spec.js` compare
   ce que le dessin tire des deux lectures, calque par calque.
   ============================================================ */
import { CONF, conf, sousCle } from "./configuration.mjs";

/* La police du plan telle que le navigateur l'écrit pour un élément qui la
   déclare (`font-family: var(--sans)`) : guillemets et espaces compris, comme
   un style calculé la rendrait. Une sonde hors du plan, où rien ne la guette. */
/** @type {HTMLElement | null} */
let sonde = null;
function famillePlan(){
  if (!sonde || !sonde.isConnected){
    sonde = document.createElement("div");
    sonde.setAttribute("aria-hidden", "true");
    sonde.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;visibility:hidden;font-family:var(--sans)";
    document.body.appendChild(sonde);
  }
  return getComputedStyle(sonde).fontFamily;
}

/**
 * Ce que la page donne à l'habillage, lu une fois pour tout un calque : la
 * couleur des calques (`--plan-line`), la police et la graisse du plan.
 * @param {Element} couches le groupe `#couches`, dont les calques héritent
 */
export function jetonsHabillage(couches){
  const cs = getComputedStyle(couches);
  return { ligne: cs.getPropertyValue("--plan-line").trim(), graisse: cs.fontWeight, famille: famillePlan() };
}

/**
 * Le style d'un sous-calque, tel que `apparence.mjs` `styleFond` le pose sur
 * son groupe : sa couleur, son remplissage, son trait, et s'il est éteint.
 * @param {string} cle la clé du calque
 * @param {Element} sous le groupe du sous-calque (`g[data-s]`)
 * @param {ReturnType<typeof jetonsHabillage>} j
 */
export function styleSousCalque(cle, sous, j){
  const c = conf(cle), sc = CONF[sousCle(cle, sous.id)] || {};
  const src = sous.getAttribute("data-s") || "", noir = !src || src === "rgb(0,0,0)";
  // une couleur vide rend la main à celle des calques, que le groupe hérite
  const color = sc.couleur || c.couleur || (noir ? j.ligne : src);
  const rempli = sc.rempli !== undefined ? sc.rempli : c.rempli;
  return {
    eteint: sc.visible === false, color,
    fill: rempli ? "currentColor" : (sous.getAttribute("data-f") || "none"),
    stroke: rempli ? "none" : "currentColor",
  };
}

/** Ce qu'un élément hors de tout sous-calque hérite du calque : sa couleur, et
 *  les valeurs initiales du SVG. */
export const styleSansSousCalque = (/** @type {ReturnType<typeof jetonsHabillage>} */ j) =>
  ({ eteint: false, color: j.ligne, fill: "black", stroke: "none" });

/* La valeur d'un attribut de dessin, héritée jusqu'au groupe du sous-calque
   (exclu : la sienne vient du réglage), ou rien. */
function herite(/** @type {Element} */ el, /** @type {Element | null} */ sous, /** @type {string} */ nom){
  for (let n = /** @type {Element | null} */ (el); n && n !== sous; n = /** @type {Element | null} */ (n.parentElement)){
    const v = n.getAttribute(nom);
    if (v !== null && v.trim() !== "") return v.trim();
  }
  return null;
}
const couleur = (/** @type {string} */ v, /** @type {{ color: string }} */ s) => v === "currentColor" ? s.color : v;

/** Les tracés dont la feuille fixe le trait à l'écran (`#couches .cal path, polyline, circle`). */
const TRAIT_FIXE = new Set(["path", "polyline", "circle"]);

/**
 * Le style d'un élément de l'habillage, sous la forme que `webgl.mjs`
 * `formeGl` et `texteGl` lisent dans un style calculé.
 * @param {Element} el
 * @param {Element | null} sous le groupe de son sous-calque, s'il en a un
 * @param {ReturnType<typeof styleSousCalque>} s le style de ce sous-calque
 * @param {ReturnType<typeof jetonsHabillage>} j
 */
export function styleElementHabillage(el, sous, s, j){
  const h = (/** @type {string} */ nom) => herite(el, sous, nom);
  const texte = el.localName === "text";
  const fixe = TRAIT_FIXE.has(el.localName);
  return {
    // `#couches .cal text{fill:currentColor;stroke:none}` l'emporte sur les attributs
    fill: texte ? s.color : couleur(h("fill") || s.fill, s),
    fillOpacity: h("fill-opacity") || "1",
    stroke: texte ? "none" : couleur(h("stroke") || s.stroke, s),
    strokeOpacity: h("stroke-opacity") || "1",
    strokeWidth: fixe ? ".7" : h("stroke-width") || "1",
    vectorEffect: fixe ? "non-scaling-stroke" : el.getAttribute("vector-effect") || "none",
    strokeDasharray: h("stroke-dasharray") || "none",
    fontFamily: j.famille, fontWeight: h("font-weight") || j.graisse,
    fontSize: h("font-size") || "16px", textAnchor: h("text-anchor") || "start",
    display: "inline", opacity: el.getAttribute("opacity") || "1", pointerEvents: "auto",
    getPropertyValue: () => "",
  };
}
