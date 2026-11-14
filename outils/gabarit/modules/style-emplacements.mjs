/* ============================================================
   Le style d'un stand et d'une zone, résolu sans la feuille de style

   Le dessin (`webgl.mjs`) lisait la couleur de chaque stand et de chaque zone
   dans le style que le navigateur avait calculé : un `getComputedStyle` par
   groupe et par tracé, qui oblige le navigateur à tenir à jour le style des
   six à quinze mille éléments du SVG caché. Ce module rend le même style
   sans le lui demander.

   C'est le premier pas de la sortie du SVG (`docs/migration-webgl.md`,
   étape 1). Il lit ce que la feuille lit elle-même : les classes et les
   variables posées sur le groupe (`sel`, `dim`, `phare`, `masquee`,
   `geopick`, `data-sect` et sa teinte, `data-chaleur` et sa couleur), les
   états posés sur la racine (`ambiance-tuiles`, `ambiance-immersif`,
   `chaleur-halos`, `poi-actif`, `mode-geo-…`) et les couleurs de la page,
   lues une fois par conversion (`jetonsEmplacements`). Le pas suivant fera
   lire ces états dans les données plutôt que sur le groupe.

   Les règles sont celles de `_styles-plan.css` pour `.stand path` et
   `.zone path`, dans leur ordre de priorité. Qui en change une change aussi
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
    geoStands: r.contains("mode-geo-stands"), geoZones: r.contains("mode-geo-zones"),
  };
}

/** `color-mix(in srgb, c part, #14181a)` — le liseré foncé des Tuiles. */
function fonce(/** @type {string} */ c, /** @type {number} */ part){
  const a = c && couleurGl(c, 1), b = /** @type {number[]} */ (couleurGl(SOMBRE, 1));
  // une couleur illisible rend la déclaration invalide : la feuille ne poserait aucun trait
  if (!a) return "none";
  const f = (/** @type {number} */ i) => (a[i] * part + b[i] * (1 - part)) / 255;
  return "color(srgb " + f(0) + " " + f(1) + " " + f(2) + ")";
}

/**
 * Le style d'un stand ou d'une zone : l'opacité de son groupe, et ce que son
 * tracé prendrait de la feuille — sous la forme que `webgl.mjs` `formeGl`
 * lit dans un style calculé.
 * @param {Element} g le groupe `.stand` ou `.zone`
 * @param {ReturnType<typeof jetonsEmplacements>} j
 */
export function styleEmplacement(g, j){
  const cl = g.classList, zone = cl.contains("zone");
  const sel = cl.contains("sel"), dim = cl.contains("dim"), phare = cl.contains("phare");
  const geopick = cl.contains("geopick"), focus = g.matches(":focus-visible");
  const st = /** @type {HTMLElement} */ (/** @type {unknown} */ (g)).style;
  let fill, fillOpacity = 1, stroke, strokeOpacity = 1, sw, dash = "none", opacite = dim ? .22 : 1;

  if (zone){
    const masquee = cl.contains("masquee");
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
  } else {
    const sect = g.hasAttribute("data-sect"), chal = g.hasAttribute("data-chaleur");
    const teinteSect = sect ? (st.getPropertyValue("--sect-c").trim() ||
      "hsl(" + st.getPropertyValue("--sect-h").trim() + " " + j.sectS + " " + j.sectL + ")") : "";
    const teinteChal = chal ? st.getPropertyValue("--chal-c").trim() : "";
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
