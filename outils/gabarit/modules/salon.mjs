/* ============================================================
   Le salon et la page : ce que l'adresse et la construction disent
   ============================================================ */

/* La construction pose ses réglages sur le script des modules — celui qui
   s'exécute en ce moment : `genere.js` `connecte`. La page à données figées
   n'en porte aucun, et se passe donc d'API. */
const reglages = document.currentScript?.dataset || {};

/* Deux origines possibles pour les données : figées dans la page, ou
   servies par l'API. La page est la même, seul le démarrage diffère. */
export const API = reglages.api || "";

/* Le salon se nomme de deux façons, et la page ne préfère pas l'une à l'autre :
   `?plan=` est ce qu'on imprime, qu'on partage et qu'on scanne ; `/plan-<salon>`
   est le chemin que son application installée ouvre, et le seul qu'elle ait le
   droit d'ouvrir — c'est ce qui sépare les salons les uns des autres, une
   portée de manifeste ne connaissant que des chemins (`outils/pwa.js`,
   `src/index.mjs`). Faute des deux, le salon que la construction a posé. */
const CHEMIN_SALON = /^\/plan-([a-z0-9][a-z0-9-]{0,63})$/;
export const SLUG = new URLSearchParams(location.search).get("plan") ||
  (CHEMIN_SALON.exec(location.pathname) || [])[1] ||
  reglages.slug || "";

/** L'adresse d'un salon, celle que son application ouvre. */
export const cheminDuSalon = (slug) => "/plan-" + slug;

/**
 * Le chemin d'où ce plan se donne à quelqu'un d'autre.
 *
 * Deux adresses ne se partagent pas. Celle de l'administration, qui réclame une
 * session que le visiteur d'en face n'a pas. Et celle qu'une application
 * installée ouvre : elle est le territoire d'un salon, et un lien qui la porte
 * n'ouvrirait chez l'autre qu'une adresse de plus à retenir. L'une et l'autre
 * renvoient au plan public, où le salon se nomme dans le paramètre.
 */
export const cheminPartageable = (chemin) =>
  chemin.replace(/plan-admin(\.html)?$/, "plan$1").replace(CHEMIN_SALON, "/plan");

/* Une borne interactive : un écran posé dans le hall, que des visiteurs se
   passent. L'adresse le dit (`?borne`, avec ou sans valeur) ; ce que la valeur
   nomme, `_borne.html` le lit. */
export const BORNE = new URLSearchParams(location.search).get("borne") !== null;
