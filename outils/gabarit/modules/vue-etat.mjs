/* ============================================================
   L'état de la vue — la vue du moment, le SVG du plan, son cadre à l'écran

   À part de `vue.mjs`, qui les calcule et les applique, pour que les deux
   rendus que la vue importe — le fond de carte (`environs.mjs`) et la carte
   graphique (`webgl.mjs`) — puissent les lire sans boucler : logés dans la
   vue, ils devaient leur être confiés au chargement. La vue les réexporte,
   si bien que les autres modules les importent d'elle comme avant.
   ============================================================ */
import { $ } from "./dom.mjs";
import { ecranVersPlat, platVersEcran } from "./camera.mjs";

/** La vue du moment — `{ x, y, w, h }` en mètres, ou rien avant le premier plan. */
/** @type {any} */
export let view;
/** La vue du moment, lue à l'instant. */
export const vue = () => view;
/** Remplace la vue, sans l'appliquer : c'est `poseVue` ou `rafraichitVue` qui l'écrivent. */
export const changeVue = (/** @type {any} */ v) => { view = v; };

/** Le SVG du plan. */
/** @type {any} */
export const svg = $("plan");

/* Mesurer le cadre force le navigateur à remettre en page tout le SVG — sept
   mille éléments — et on le mesurait juste après avoir posé la « viewBox »,
   qui vient précisément de tout salir : quatre-vingt-cinq millisecondes, à
   chaque image, pour lire une largeur qui n'avait pas bougé. Car le cadre ne
   dépend pas de la « viewBox » : c'est le CSS qui le pose.

   On le mesure donc une fois, et on l'oublie quand la mise en page change
   (`oublieCadre`, que `vue.mjs` écoute). */
/** @type {DOMRect | null} */
let _cadre = null;
/** @returns {DOMRect} */
export const cadrePlan = () => _cadre || (_cadre = svg.getBoundingClientRect());
export const oublieCadre = () => { _cadre = null; };

/**
 * Le point de l'écran que le doigt touche, ramené sur le plan à plat.
 *
 * En vue immersive, le plan se voit incliné (`camera.mjs`) mais la vue reste
 * le cadre à plat qu'elle a toujours été : un geste qui calcule depuis le
 * point touché doit d'abord le redresser, sans quoi le plan glisserait de
 * travers sous le doigt. Hors de cette vue, rien ne change.
 * @returns {[number, number]}
 */
export function redresse(/** @type {number} */ clientX, /** @type {number} */ clientY){
  const r = cadrePlan();
  const [x, y] = ecranVersPlat(clientX - r.left, clientY - r.top, r.width, r.height);
  return [x + r.left, y + r.top];
}

/** L'inverse : un point du cadre à plat, vu à l'écran (pixels de la scène). */
export function incline(/** @type {number} */ x, /** @type {number} */ y){
  const r = cadrePlan();
  return platVersEcran(x, y, r.width, r.height);
}
