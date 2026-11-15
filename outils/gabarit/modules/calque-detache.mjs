/* ============================================================
   La copie détachée d'un calque de Klipso

   Le balisage d'un calque d'habillage (`P().fond`, nettoyé à la
   synchronisation par `_partage/svg.ts`) se lit sans être posé dans la page :
   le panneau des calques y relève les sous-calques d'un calque éteint
   (`apparence.mjs` `sousCalques`), et le dessin y lit chaque forme
   (`webgl.mjs`, « L'habillage de Klipso, lu dans ses données »). Une copie
   hors du document ne coûte au navigateur ni style ni mise en page, et rien
   n'y réagit à un événement.

   Une seule copie par calque, partagée par les deux, gardée tant que sa
   donnée vit : un pavillon rechargé apporte de nouvelles données, et ses
   copies partent avec les anciennes.

   Un module neutre, qui n'importe rien : le dessin ne peut pas importer
   `apparence.mjs`, qui l'atteint déjà.
   ============================================================ */

/** @type {WeakMap<object, { svg: string, copie: Element }>} */
const COPIES = new WeakMap();

/**
 * La copie détachée du dessin d'un calque, analysée comme la page le pose
 * (dans un groupe SVG), ou rien s'il n'a pas de dessin.
 * @param {{ svg?: string }} f un calque du fond (`P().fond`)
 * @returns {Element | null}
 */
export function copieDuCalque(f){
  if (!f || !f.svg) return null;
  const c = COPIES.get(f);
  if (c && c.svg === f.svg) return c.copie;
  const copie = document.createElementNS("http://www.w3.org/2000/svg", "g");
  copie.innerHTML = f.svg;
  COPIES.set(f, { svg: f.svg, copie });
  return copie;
}
