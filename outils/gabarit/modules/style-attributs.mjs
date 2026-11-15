/* ============================================================
   Le style d'une surcouche, lu dans ses attributs

   Les surcouches que le plan dessine lui-même — les marques des distinctions,
   d'abord — portent leur style en attributs SVG, écrits par le module qui
   les dessine : couleur, trait, épaisseur, opacité. Le SVG de secours les lit
   comme tels, et le dessin (`webgl.mjs`) aussi, ici, sans demander au
   navigateur un style calculé (`docs/migration-webgl.md`, étape 2).

   C'est l'inverse du chemin des stands et de l'habillage, dont les règles
   restent dans la feuille parce qu'elles sont nombreuses et que le SVG caché
   les portait par milliers. Une surcouche n'a que quelques dizaines
   d'éléments : reprendre ses règles en JavaScript en aurait fait une seconde
   copie, quand le SVG de secours a toujours besoin de la première. Son style
   n'a donc qu'une source, le module qui la dessine, et la feuille ne la
   peint plus.

   Les valeurs sont celles du SVG : héritées d'un parent pour les propriétés
   qui s'héritent, initiales sinon. Un module neutre, qui n'importe rien.
   ============================================================ */

/* La valeur d'un attribut, héritée jusqu'à la racine du bloc comprise, ou rien. */
function herite(/** @type {Element} */ el, /** @type {Element} */ racine, /** @type {string} */ nom){
  for (let n = /** @type {Element | null} */ (el); n; n = /** @type {Element | null} */ (n.parentElement)){
    const v = n.getAttribute(nom);
    // `inherit` renvoie au parent, comme une valeur absente
    if (v !== null && v.trim() !== "" && v.trim() !== "inherit") return v.trim();
    if (n === racine) break;
  }
  return null;
}

/**
 * Le style d'un élément d'après ses attributs et ceux de ses parents, sous la
 * forme que `webgl.mjs` `formeGl` et `texteGl` lisent dans un style calculé.
 * @param {Element} el
 * @param {Element} racine le groupe du bloc, au-delà duquel rien ne s'hérite
 */
export function styleParAttributs(el, racine){
  const h = (/** @type {string} */ nom) => herite(el, racine, nom);
  const couleur = h("color") || "black";
  const teinte = (/** @type {string} */ v) => v === "currentColor" ? couleur : v;
  return {
    fill: teinte(h("fill") || "black"), fillOpacity: h("fill-opacity") || "1",
    stroke: teinte(h("stroke") || "none"), strokeOpacity: h("stroke-opacity") || "1",
    strokeWidth: h("stroke-width") || "1", strokeDasharray: h("stroke-dasharray") || "none",
    // ni l'un ni l'autre ne s'hérite
    vectorEffect: el.getAttribute("vector-effect") || "none", opacity: el.getAttribute("opacity") || "1",
    display: el.getAttribute("display") === "none" ? "none" : "inline",
    fontFamily: h("font-family") || "sans-serif", fontWeight: h("font-weight") || "400",
    fontSize: h("font-size") || "16px", textAnchor: h("text-anchor") || "start",
    pointerEvents: "auto", getPropertyValue: () => "",
  };
}
