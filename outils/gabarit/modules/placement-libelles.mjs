/* ============================================================
   Placer un libellé à la main — l'outil de l'exploitant

   Le mode, la palette du libellé retouché, le glisser et le pas du clavier.
   Le pourquoi du réglage, et ce que le visiteur en reçoit — le placement
   relu au dessin des noms —, sont dans `modules/libelle-place.mjs`, dont ce
   module pose l'état par ses portes.

   Un module de l'administration : `plan-admin.mjs` l'embarque, le visiteur ne
   le reçoit jamais. L'outil de dessin et la reprise d'un emplacement, avec
   lesquels il se dispute le glisser et qui importent ce module, lui confient
   en se chargeant ce qu'il leur emprunte (`confieAuPlacementLibelles`). Il se
   branche par `branchePlacementLibelles`, que `_mode-admin.html` appelle à la
   place que ce code y tenait : les commandes de la palette s'y branchent au
   même rang qu'avant. Les réglages et leur enregistrement, le calque ouvert,
   la couche reprise, le dessin des noms et la vue s'importent.
   ============================================================ */
import { $ } from "./dom.mjs";
import { parId } from "./donnees.mjs";
import { ADMIN } from "./mode-admin.mjs";
import { GL, libelleSousWebgl } from "./webgl.mjs";
import { cleLibelle, PLACE_LIBELLES, libSel, poseModeLibelles, poseLibelleChoisi, empreinteLibelle,
  placementLibelle } from "./libelle-place.mjs";
import { svg, versPlan } from "./vue.mjs";
import { libelles } from "./libelles.mjs";
import { CONF, enregistreConf } from "./configuration.mjs";
import { calqueActif } from "./calques-dessin.mjs";
import { SORTE_GEO } from "./emplacements.mjs";

/* Ce que l'outil de dessin et la reprise d'un emplacement, qui importent ce
   module, lui confient en se chargeant. Les réglages (`CONF`, que le
   changement de salon remplace), le calque de dessin ouvert et la couche
   reprise, importés, se lisent tels qu'ils sont à l'instant. Le plan et le
   passage de l'écran au plan s'importent de `vue.mjs`, le dessin des noms de
   `libelles.mjs`. */
/**
 * @typedef {object} PretePlacementLibelles
 * @property {typeof import("./outil-dessin.mjs").activeCalque} activeCalque
 * @property {typeof import("./reprise-emplacements.mjs").modeGeometrie} modeGeometrie
 */
/** @type {PretePlacementLibelles} */
const prete = { activeCalque: () => {}, modeGeometrie: () => {} };
/** La porte par laquelle l'outil de dessin (`activeCalque`) et la reprise
 *  d'un emplacement (`modeGeometrie`) confient chacun ce qu'ils tiennent.
 *  @param {Partial<PretePlacementLibelles>} o */
export function confieAuPlacementLibelles(o){ Object.assign(prete, o); }
const racine = document.documentElement;

/** @type {any} */
let glisseLib = null;   // le geste en cours
/** Un libellé est-il tenu sous le doigt ? L'envoi au repos attend qu'on le lâche. */
export const libelleGlisse = () => Boolean(glisseLib);

/** Le geste abandonné : le pointeur annulé ne relâchera rien (`gestes-admin.mjs`). */
export function lacheLibelle(){
  glisseLib = null;
}

/**
 * Poser un placement, sans l'écrire sur le poste : un glisser en produit un
 * par image, et enregistrer à chaque fois sérialiserait toute la configuration
 * soixante fois par seconde. C'est la fin du geste qui enregistre.
 */
function posePlacement(o, change){
  const r = placementLibelle(o);
  const n = { dx: r ? r.dx || 0 : 0, dy: r ? r.dy || 0 : 0, k: r && r.k > 0 ? r.k : 1,
              e: empreinteLibelle(o) };
  change(n);
  n.dx = +(+n.dx).toFixed(2);
  n.dy = +(+n.dy).toFixed(2);
  n.k = Math.max(.4, Math.min(3, +n.k || 1));
  /* Un placement qui ne déplace ni n'agrandit rien n'est pas un réglage : il
     sort de la configuration plutôt que d'y peser et d'y vieillir. */
  if (!n.dx && !n.dy && Math.abs(n.k - 1) < .001) delete CONF[cleLibelle(o.id)];
  else CONF[cleLibelle(o.id)] = n;
  libelles();
  majPaletteLibelle();
}

/** Rendre un libellé à son placement automatique. */
function libelleAutomatique(){
  const o = libSel && parId.get(libSel);
  if (!o) return;
  delete CONF[cleLibelle(o.id)];
  enregistreConf();
  libelles();
  majPaletteLibelle();
}

export function modePlacementLibelles(on){
  poseModeLibelles(!!on && ADMIN);
  racine.classList.toggle("mode-libelles", PLACE_LIBELLES);
  /* Le placement, le dessin et la reprise d'une géométrie se disputeraient le
     glisser : entrer dans l'un referme les autres, plutôt que de laisser trois
     gestes viser le même pointeur. */
  if (PLACE_LIBELLES && calqueActif) prete.activeCalque(calqueActif);
  if (PLACE_LIBELLES && SORTE_GEO) prete.modeGeometrie(null);
  if (!PLACE_LIBELLES){ poseLibelleChoisi(null); glisseLib = null; }
  /* On sort d'ici par quatre chemins — le crayon, la croix de la palette, la
     touche d'échappement, l'ouverture d'un calque de dessin. Le crayon se
     rallume ou s'éteint donc ici, une fois pour tous, plutôt que dans chacun. */
  const crayon = document.querySelector("#pile .rlib");
  if (crayon) crayon.setAttribute("aria-pressed", PLACE_LIBELLES);
  majPaletteLibelle();
  libelles();
}

/** La palette du libellé retouché : sa taille, et de quoi y renoncer. */
function majPaletteLibelle(){
  const z = $("libReg");
  if (!z || !ADMIN || !$("libNom")) return;
  const o = libSel && parId.get(libSel);
  z.classList.toggle("open", !!(PLACE_LIBELLES && o));
  if (!(PLACE_LIBELLES && o)) return;
  const r = placementLibelle(o);
  $("libNom").textContent = o.nom || o.code ||
    (o.kind === "zone" ? "Zone sans nom" : "Stand");
  $("libTaille").value = r && r.k ? r.k : 1;
  $("libAuto").disabled = !r;
  $("libAide").textContent = r
    ? "Glissez le libellé, ou ajustez-le aux flèches du clavier."
    : "Glissez ce libellé pour le déplacer, ou tirez la taille.";
}

/** Choisir le libellé qu'on retouche — au clic, ou en le glissant. */
function choisitLibelle(id){
  poseLibelleChoisi(id);
  libelles();
  majPaletteLibelle();
}

/** Le pas du clavier : un quart de mètre, un mètre touche majuscule tenue. */
export function pousseLibelle(dx, dy){
  const o = libSel && parId.get(libSel);
  if (!o) return;
  posePlacement(o, n => { n.dx += dx; n.dy += dy; });
  enregistreConf();
}

/* --- le geste ; renvoie vrai si l'événement est consommé --- */
export function libellePointerDown(e){
  if (!PLACE_LIBELLES) return false;
  const g = GL.actif ? null : e.target.closest("#labels .lbl");
  const id = GL.actif ? libelleSousWebgl(e.clientX, e.clientY) : g && g.dataset.lbl;
  if (!id) return false;
  const o = parId.get(id);
  if (!o) return false;
  e.preventDefault();
  choisitLibelle(o.id);
  const r = placementLibelle(o);
  glisseLib = { o: o, depart: versPlan(e.clientX, e.clientY),
                dx: r ? r.dx || 0 : 0, dy: r ? r.dy || 0 : 0 };
  try { svg.setPointerCapture(e.pointerId); } catch (err) {}
  return true;
}

export function libellePointerMove(e){
  if (!glisseLib) return false;
  const p = versPlan(e.clientX, e.clientY);
  const dx = glisseLib.dx + p[0] - glisseLib.depart[0];
  const dy = glisseLib.dy + p[1] - glisseLib.depart[1];
  posePlacement(glisseLib.o, n => { n.dx = dx; n.dy = dy; });
  return true;
}

export function libellePointerUp(e){
  if (!glisseLib) return false;
  glisseLib = null;
  try { if (svg.hasPointerCapture(e.pointerId)) svg.releasePointerCapture(e.pointerId); } catch (err) {}
  enregistreConf();
  return true;
}

/**
 * Appelé par le code soudé à la place que ce code tenait (`_mode-admin.html`),
 * dans une tranche que le visiteur ne reçoit pas : les commandes de la palette
 * s'y branchent au même rang qu'avant.
 */
export function branchePlacementLibelles(){
  if ($("libFerme")) $("libFerme").onclick = () => modePlacementLibelles(false);
  if ($("libAuto")) $("libAuto").onclick = libelleAutomatique;
  if ($("libTaille")){
    $("libTaille").oninput = e => {
      const o = libSel && parId.get(libSel);
      if (o) posePlacement(o, n => { n.k = +e.target.value; });
    };
    $("libTaille").onchange = enregistreConf;
  }
}
