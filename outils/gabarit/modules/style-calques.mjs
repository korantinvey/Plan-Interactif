/* ============================================================
   Le style des calques dessinés, résolu sans la feuille

   Le dessin (`webgl.mjs`) peint les calques de l'exploitant depuis leurs
   pièces (`etat-formes.mjs`). Il lui faut pour chacune ce que la feuille
   donne au nœud du SVG qui lui répond (`_styles-plan.css`, `.dcal`) :
   l'aplat, le trait et son épaisseur, le pointillé, l'opacité de la forme, la
   police d'un texte. Il les lisait dans le style calculé, nœud par nœud. Ce
   module résout les mêmes règles en JavaScript, dans leur ordre de force,
   sur les mêmes entrées : le calque (sa couleur, son remplissage, son rôle
   d'itinéraire), la forme (son épaisseur réglée, son pointillé, la ligne d'un
   arrêt), ses marques (`etat-formes.mjs`), son hôte pour un stand dessiné
   (`etat-emplacements.mjs`), et la racine — ses jetons et ses états
   (`mode-edition`, `poi-actif`, `tuto-retrait`, ambiances, carte de chaleur).

   La feuille garde ces règles pour le SVG de secours : qui en change une
   change aussi celle-ci. `outils/essais/navigateur/style-calques.spec.js`
   compare les deux, pièce par pièce, sur les combinaisons de ce que la
   feuille regarde.

   Il ne lit que l'élément qui porte les calques, une fois par conversion
   (`jetonsCalques`) ; le reste lui est donné.
   ============================================================ */
import { jetonsEmplacements, fonce } from "./style-emplacements.mjs";

/**
 * Les couleurs de la page et les états de la racine, lus une fois pour tous
 * les calques : sur le groupe qui les porte (`#couches`), dont ils héritent
 * les variables — le facteur du trait (`--trait-f`) y est posé par la vue.
 * @param {Element} ref
 */
export function jetonsCalques(ref){
  const cs = getComputedStyle(ref);
  const v = (/** @type {string} */ n) => cs.getPropertyValue(n).trim();
  const r = document.documentElement.classList;
  return {
    ...jetonsEmplacements(ref),
    selTrait: v("--c-sel-trait") || v("--accent"), surface: v("--surface"), encre: v("--ink"),
    famille: v("--police-lab-nom") || v("--sans"), graisse: v("--graisse-lab-nom") || "600",
    f: parseFloat(v("--trait-f")) || 1, edition: r.contains("mode-edition"),
    // ce dont hérite un calque dont la couleur ne se lit pas
    couleur: cs.color,
    /** @type {(n: string) => string} */
    jeton: v,
  };
}
/** @typedef {ReturnType<typeof jetonsCalques>} JetonsCalques */

/** Une couleur écrite avec des jetons de la racine (`var(--accent)`), en
 *  toutes lettres ; illisible, celle dont le calque hérite. */
function enClair(/** @type {string} */ c, /** @type {JetonsCalques} */ j){
  let x = c, n = 0;
  while (/var\(/.test(x) && n++ < 4)
    x = x.replace(/var\(\s*(--[\w-]+)\s*(?:,([^()]*))?\)/g, (_, nom, defaut) => j.jeton(nom) || (defaut || "").trim());
  return x && CSS.supports("color", x) ? x : j.couleur;
}

/**
 * Ce que la forme reçoit sur son groupe : se voit-elle, et de quelle opacité.
 * @param {import("./etat-formes.mjs").CalquePeint} c
 * @param {import("./etat-formes.mjs").FormePeinte} f
 * @param {{ dim: boolean, phare: boolean, cale: boolean }} m ses marques
 * @param {JetonsCalques} j
 */
export function styleGroupeForme(c, f, m, j){
  // `.dim`, que seuls les stands dessinés reçoivent
  let opacite = f.t === "stand" && m.dim ? .22 : 1;
  // la visite guidée, puis le cartouche, plus fort que lui sauf pour ce qu'il met en avant
  if (j.tutoRetrait) opacite = .22;
  if (j.poiActif && !m.phare) opacite = .16;
  return { visible: c.visible && !m.cale, opacite };
}

/**
 * Le style d'une pièce, sous la forme que le dessin lit d'un style calculé :
 * les couleurs en toutes lettres, l'épaisseur en pixels de l'écran quand le
 * trait ne suit pas le plan (`fixe`), le pointillé en pixels.
 * @param {import("./etat-formes.mjs").CalquePeint} c
 * @param {import("./etat-formes.mjs").FormePeinte} f
 * @param {import("./etat-formes.mjs").Piece} p
 * @param {{ sel: boolean, ouvert: boolean, phare: boolean, focus: boolean,
 *   sect: { h: string, c: string | null } | null, chal: string | null }} m ses marques, son focus, la teinte de son hôte
 * @param {JetonsCalques} j
 */
export function stylePiece(c, f, p, m, j){
  const calque = enClair(c.couleur, j);
  // la couleur du groupe : celle de la ligne d'un arrêt, sinon celle du calque
  const cur = f.teinte ? enClair(f.teinte, j) : calque;
  // l'encre d'une pastille : celle que la ligne a calculée, l'encre de la page sur une plaque, sinon le fond
  const encre = f.encre ? enClair(f.encre, j) : f.plaque ? j.encre : j.surface;
  const circulation = j.edition && c.role === "circulation", pmr = j.edition && c.role === "circulation-pmr";
  const s = { fill: "none", fillOpacity: 1, stroke: "none", strokeWidth: 1, dash: /** @type {number[] | null} */ (null),
    fixe: false, trait: false, famille: j.famille, graisse: String(j.graisse), ancre: "start", pointer: false };

  if (p.sorte === "trace" && p.role !== "stand"){
    // `.dcal path`, puis le remplissage du calque, le pointillé de son rôle à l'édition
    s.stroke = cur; s.strokeWidth = 2; s.fixe = true;
    if (c.plein){ s.fill = cur; s.fillOpacity = .25; }
    if (j.edition && c.role) s.dash = [5, 3];
    if (p.role === "glyphe"){
      // `.dcal .repere .glyphe path`, plus fort que le remplissage du calque mais pas que son rôle
      s.fill = f.anneau ? cur : encre; s.stroke = "none";
    }
    if (circulation){ s.dash = null; s.fill = cur; s.fillOpacity = .12; }
    if (pmr){ s.fill = cur; s.fillOpacity = .12; }
    if (p.role === "corps" || p.role === "fleche"){
      // la classe `trait` : l'épaisseur suit le facteur de la vue, puis ce que la forme écrit sur sa balise
      s.trait = true; s.strokeWidth = 2 * j.f;
      if (f.ep !== 2) s.strokeWidth = f.ep * j.f;
      if (p.role === "fleche"){ s.fill = "none"; s.dash = null; }
      else if (f.pointille) s.dash = [.01, f.ep * 2.2 * j.f];
      s.pointer = c.editable;
    }
    return s;
  }

  if (p.sorte === "trace"){
    // un stand dessiné : l'aplat et le liseré d'un stand, quel que soit son calque
    const teinteSect = m.sect ? (m.sect.c || "hsl(" + m.sect.h + " " + j.sectS + " " + j.sectL + ")") : "";
    const chal = m.chal && !j.halos ? m.chal : "";
    s.fixe = true;
    s.fill = j.stand; s.stroke = j.ligne; s.strokeWidth = 1;
    if (teinteSect) s.fill = teinteSect;
    if (chal) s.fill = chal;
    // les Tuiles foncent le liseré dans la teinte de l'aplat ; l'immersif n'en a pas
    let teinteTuile = false;
    if (j.tuiles){
      s.stroke = fonce(j.stand, .82);
      if (!j.immersif && teinteSect){ s.stroke = fonce(teinteSect, .82); teinteTuile = true; }
      if (!j.immersif && chal){ s.stroke = fonce(chal, .82); teinteTuile = true; }
    }
    if (j.immersif) s.stroke = "none";
    // le focus du clavier : plus fort que le liseré de base, moins que celui d'une teinte en Tuiles
    if (m.focus){ s.strokeWidth = 3; if (!teinteTuile) s.stroke = j.accent; }
    if (m.sel && !j.tuiles){ s.fill = j.sel; s.stroke = j.selTrait; s.strokeWidth = 3; }
    s.pointer = Boolean(f.lie);
    return s;
  }

  if (p.sorte === "rect"){
    // un rectangle du repère : ni le trait ni le rôle des tracés ne le touchent
    s.fill = cur;
    if (p.role === "pastille"){
      if (f.plaque || f.anneau) s.fill = j.surface;
      // le repère ouvert, le focus du clavier, la mise en avant : un liseré, dans cet ordre de force
      if (m.ouvert){ s.stroke = j.surface; s.strokeWidth = .6; }
      if (m.focus){ s.stroke = j.encre; s.strokeWidth = .5; }
      if (m.phare){ s.stroke = j.surface; s.strokeWidth = .5; }
      // sur un champ clair, c'est l'encre qui le porte
      if ((f.plaque || f.anneau) && (m.ouvert || m.phare)) s.stroke = j.encre;
    }
    return s;
  }

  if (p.sorte === "texte"){
    s.ancre = "middle";
    if (p.role === "texte") s.fill = cur;
    else { s.fill = encre; s.graisse = "700"; }
    return s;
  }
  return s;
}
