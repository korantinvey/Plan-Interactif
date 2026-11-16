/* ============================================================
   Le style d'un stand et d'une zone, résolu sans la feuille de style

   Le dessin (`webgl.mjs`) lisait la couleur de chaque stand et de chaque zone
   dans le style que le navigateur avait calculé : un `getComputedStyle` par
   groupe et par tracé, qui oblige le navigateur à tenir à jour le style des
   six à quinze mille éléments du SVG caché. Ce module rend le même style
   sans le lui demander.

   C'est le premier pas de la sortie du SVG (`docs/migration-webgl.md`,
   étape 1). Il lit ce que la feuille regarde, mais ailleurs que sur le
   groupe : l'état de l'emplacement, que tiennent les modules qui le décident
   (`etat-emplacements.mjs` — choisi, retiré, mis en avant, masqué, repris,
   teinte du secteur et de la chaleur), les états posés sur la racine
   (`ambiance-tuiles`, `ambiance-immersif`, `chaleur-halos`, `poi-actif`,
   `mode-geo-…`) et les couleurs de la page, lues une fois par conversion
   (`jetonsEmplacements`).

   Les règles sont celles de `_styles-plan.css` pour `.stand path` et
   `.zone path`, et celle de la visite guidée dans `_styles-divers.css`
   (`html.tuto-retrait #zones g`), dans leur ordre de priorité. Qui en change une change aussi
   celle d'ici : l'essai `outils/essais/navigateur/style-emplacements.spec.js`
   compare les deux, combinaison par combinaison, et nomme l'écart.

   Le dessin ignorait déjà ce que la feuille ne sait dire qu'au SVG : le
   survol, les filtres et l'agrandissement des Tuiles, qu'il refait par ses
   propres couches. Ils n'ont donc pas leur place ici.
   ============================================================ */
import { couleurGl } from "./trace.mjs";

/* La teinte dont les Tuiles foncent leur liseré (`color-mix(…, #14181a)`). */
const SOMBRE = "#14181a";

/**
 * Les couleurs de la page et les états de la racine, lus une fois pour toute
 * une conversion : sur l'élément qui porte les stands, dont les groupes
 * héritent les mêmes variables.
 * @param {Element} ref
 */
export function jetonsEmplacements(ref){
  const cs = getComputedStyle(ref);
  const v = (/** @type {string} */ n) => cs.getPropertyValue(n).trim();
  const r = document.documentElement.classList;
  return {
    stand: v("--c-stand") || v("--stand"), ligne: v("--stand-line"),
    zone: v("--c-zone") || v("--zone"),
    sectS: v("--sect-s"), sectL: v("--sect-l"),
    sel: v("--c-sel") || v("--accent-soft"), accent: v("--accent"),
    poi: v("--c-poi") || v("--accent"),
    tuiles: r.contains("ambiance-tuiles"), immersif: r.contains("ambiance-immersif"),
    halos: r.contains("chaleur-halos"), poiActif: r.contains("poi-actif"),
    tutoRetrait: r.contains("tuto-retrait"),
    geoStands: r.contains("mode-geo-stands"), geoZones: r.contains("mode-geo-zones"),
  };
}

/** `color-mix(in srgb, c part, #14181a)` — le liseré foncé des Tuiles.
 *  Comme `color-mix`, le mélange se fait sur les composantes prémultipliées
 *  par l'opacité, et l'opacité se mélange aussi : une teinte de secteur
 *  translucide (`#rrggbbaa`, que `secteurs.mjs` accepte) donne un liseré
 *  translucide, et non opaque. */
export function fonce(/** @type {string} */ c, /** @type {number} */ part){
  // une couleur illisible rend la déclaration invalide : la feuille ne poserait aucun trait
  if (!c || !CSS.supports("color", c)) return "none";
  // une couleur toute transparente se lit comme rien, mais se mélange encore
  const a = couleurGl(c, 1) || [0, 0, 0, 0], b = /** @type {number[]} */ (couleurGl(SOMBRE, 1));
  const pa = a[3] / 255 * part, pb = b[3] / 255 * (1 - part), alpha = pa + pb;
  if (!(alpha > 0)) return "none";
  const f = (/** @type {number} */ i) => (a[i] * pa + b[i] * pb) / alpha / 255;
  return "color(srgb " + f(0) + " " + f(1) + " " + f(2) + (alpha < 1 ? " / " + alpha : "") + ")";
}

/**
 * L'opacité du groupe qui porte tous les stands, ou toutes les zones : les
 * stands reculent en bloc sous la visite guidée et sous le cartouche
 * (`html.tuto-retrait #stands`, plus fort car écrit après, puis
 * `html.poi-actif #stands`) ; les zones, elles, s'effacent une par une
 * (`styleEmplacement`), et leur groupe garde toute sa présence.
 * @param {boolean} zones
 * @param {ReturnType<typeof jetonsEmplacements>} j
 */
export function opaciteDuGroupe(zones, j){
  if (zones) return 1;
  return j.tutoRetrait ? .22 : j.poiActif ? .16 : 1;
}

/**
 * Le style d'un stand ou d'une zone : l'opacité de son groupe, et ce que son
 * tracé prendrait de la feuille — sous la forme que `webgl.mjs` `formeGl`
 * lit dans un style calculé.
 * @param {ReturnType<typeof import("./etat-emplacements.mjs").etatEmplacement>} e son état
 * @param {ReturnType<typeof jetonsEmplacements>} j
 */
export function styleEmplacement(e, j){
  const { zone, sel, dim, phare, masquee, focus } = e, geopick = e.repris;
  let fill, fillOpacity = 1, stroke, strokeOpacity = 1, sw, dash = "none", opacite = dim ? .22 : 1;

  if (zone){
    fill = j.zone; fillOpacity = .5; stroke = j.zone; sw = 1.2; dash = "5 4";
    if (masquee){ fillOpacity = .14; strokeOpacity = .4; }
    if (focus){ stroke = j.accent; sw = 3; }
    if (j.tuiles){ sw = 1; dash = "none"; stroke = fonce(j.zone, .75); }
    if (j.immersif) stroke = "none";
    if (j.tuiles) fillOpacity = masquee ? .2 : .62;
    if (sel && !j.tuiles) fill = j.sel;
    if (j.geoZones && geopick){ stroke = j.accent; sw = 2.5; }
    if (j.poiActif && phare){ fillOpacity = .92; stroke = j.poi; sw = 3; dash = "none"; }
    // `html.poi-actif #zones g:not(.phare)` l'emporte sur `.dim`
    if (j.poiActif && !phare) opacite = .16;
    /* La visite guidée pâlit les zones qu'elle ne désigne pas
       (`_styles-divers.css`, chargée après `_styles-plan.css` : à force égale,
       elle l'emporte sur le cartouche). */
    if (j.tutoRetrait && !e.tutoCible) opacite = .22;
  } else {
    const sect = Boolean(e.sect), chal = Boolean(e.chal);
    const teinteSect = e.sect ? (e.sect.c || "hsl(" + e.sect.h + " " + j.sectS + " " + j.sectL + ")") : "";
    const teinteChal = e.chal || "";
    fill = j.stand; stroke = j.ligne; sw = 1;
    if (sect) fill = teinteSect;
    if (chal && !j.halos) fill = teinteChal;
    if (focus){ stroke = j.accent; sw = 3; }
    if (j.tuiles){
      sw = 1; dash = "none"; stroke = fonce(j.stand, .82);
      if (!j.immersif && sect) stroke = fonce(teinteSect, .82);
      if (!j.halos && !j.immersif && chal) stroke = fonce(teinteChal, .82);
    }
    if (j.immersif) stroke = "none";
    if (sel && !j.tuiles) fill = j.sel;
    if (j.geoStands && geopick){ stroke = j.accent; sw = 2.5; }
  }

  return {
    opacite,
    /* Ce que `formeGl` lit d'un style calculé. Les deux traits du plan sont
       d'épaisseur fixe à l'écran, le tracé n'a pas d'opacité propre, et rien
       ici ne s'attrape par son seul contour. */
    trace: {
      fill, fillOpacity: String(fillOpacity), stroke, strokeOpacity: String(strokeOpacity),
      strokeWidth: String(sw), strokeDasharray: dash, vectorEffect: "non-scaling-stroke",
      pointerEvents: "auto", display: "inline", opacity: "1",
      getPropertyValue: () => "",
    },
  };
}
