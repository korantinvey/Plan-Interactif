/* ============================================================
   L'état de la vue — la vue du moment, le SVG du plan, son cadre à l'écran

   À part de `vue.mjs`, qui les calcule et les applique, pour que les deux
   rendus que la vue importe — le fond de carte (`environs.mjs`) et la carte
   graphique (`webgl.mjs`) — puissent les lire sans boucler : logés dans la
   vue, ils devaient leur être confiés au chargement. La vue les réexporte,
   si bien que les autres modules les importent d'elle comme avant.
   ============================================================ */
import { $ } from "./dom.mjs";

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
