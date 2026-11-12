/* ============================================================
   Placer un libellé à la main — l'outil de l'exploitant

   Le mode, la palette du libellé retouché, le glisser et le pas du clavier.
   Le pourquoi du réglage, et ce que le visiteur en reçoit — le placement
   relu au dessin des noms —, sont dans `modules/libelle-place.mjs`, dont ce
   module pose l'état par ses portes. Le logo d'un stand, qui tient lieu de
   nom vu de près, se règle ici de la même façon.

   Un module de l'administration : `plan-admin.mjs` l'embarque, le visiteur ne
   le reçoit jamais. L'outil de dessin et la reprise d'un emplacement, avec
   lesquels il se dispute le glisser, se referment par le registre des modes
   d'édition (`modes-edition.mjs`), où il inscrit sa propre sortie. Il se
   branche par `branchePlacementLibelles`, que `plan-admin.mjs` appelle dans
   l'emplacement que le lancement lui ouvre après l'habillage : les commandes
   de la palette s'y branchent à leur rang. Les réglages et leur
   enregistrement, le dessin des noms et la vue s'importent.
   ============================================================ */
import { inscritGesteTenu } from "./geste-tenu.mjs";
import { $ } from "./dom.mjs";
import { parId } from "./donnees.mjs";
import { ADMIN } from "./mode-admin.mjs";
import { GL, libelleSousWebgl, planifieWebgl } from "./webgl.mjs";
import { cleLibelle, PLACE_LIBELLES, libSel, poseModeLibelles, poseLibelleChoisi, empreinteLibelle,
  placementLibelle, cleLogo, empreinteLogo, placementLogo, PREFIXE_LOGO } from "./libelle-place.mjs";
import { svg, versPlan } from "./vue.mjs";
import { libelles } from "./libelles.mjs";
import { CONF, enregistreConf } from "./configuration.mjs";
import { inscritMode, quitteLesAutres } from "./modes-edition.mjs";

/* Les réglages (`CONF`, que le changement de salon remplace), le calque de
   dessin ouvert et la couche reprise, importés, se lisent tels qu'ils sont à
   l'instant. Le plan et le passage de l'écran au plan s'importent de
   `vue.mjs`, le dessin des noms de `libelles.mjs`. */
const racine = document.documentElement;

/** @type {any} */
let glisseLib = null;   // le geste en cours
// un libellé tenu sous le doigt : l'envoi au repos attend qu'on le lâche
inscritGesteTenu(() => glisseLib);

/** Le geste abandonné : le pointeur annulé ne relâchera rien (`gestes-admin.mjs`). */
export function lacheLibelle(){
  glisseLib = null;
}

/**
 * Ce que l'outil retouche : un libellé, ou — vu de près, là où il tient lieu
 * de nom — le logo d'un stand. Les deux se règlent de la même façon, sous
 * deux clés ; seuls la clé, l'empreinte et ce qu'il faut repeindre changent.
 */
function choisi(){
  if (!libSel) return null;
  const logo = libSel.startsWith(PREFIXE_LOGO);
  const o = parId.get(logo ? libSel.slice(PREFIXE_LOGO.length) : libSel);
  if (!o) return null;
  return logo
    ? { o, logo, cle: cleLogo(o.id), empreinte: empreinteLogo, lu: placementLogo }
    : { o, logo, cle: cleLibelle(o.id), empreinte: empreinteLibelle, lu: placementLibelle };
}

/** Repeindre ce qui vient de changer. Le logo vit dans les couches que
 *  l'assemblage refait (`logos-stands.mjs`) : les noms seuls n'y suffisent
 *  pas, eux qui ne repeignent rien quand leur texte n'a pas bougé. */
function repeint(logo){
  libelles();
  if (logo) planifieWebgl();
}

/**
 * Poser un placement, sans l'écrire sur le poste : un glisser en produit un
 * par image, et enregistrer à chaque fois sérialiserait toute la configuration
 * soixante fois par seconde. C'est la fin du geste qui enregistre.
 */
function posePlacement(c, change){
  const r = c.lu(c.o);
  const n = { dx: r ? r.dx || 0 : 0, dy: r ? r.dy || 0 : 0, k: r && r.k > 0 ? r.k : 1,
              a: r ? +r.a || 0 : 0, e: c.empreinte(c.o) };
  change(n);
  n.dx = +(+n.dx).toFixed(2);
  n.dy = +(+n.dy).toFixed(2);
  n.k = Math.max(.4, Math.min(3, +n.k || 1));
  // en degrés, dans le sens des aiguilles d'une montre, ramené à ]-180, 180]
  n.a = +((((+n.a || 0) % 360) + 540) % 360 - 180).toFixed(1);
  if (n.a === -180) n.a = 180;
  // seul un logo se tourne ; un libellé sans angle n'en porte pas la clé
  if (!n.a) delete n.a;
  /* Un placement qui ne déplace, n'agrandit ni ne tourne rien n'est pas un
     réglage : il sort de la configuration plutôt que d'y peser et d'y vieillir. */
  if (!n.dx && !n.dy && !n.a && Math.abs(n.k - 1) < .001) delete CONF[c.cle];
  else CONF[c.cle] = n;
  repeint(c.logo);
  majPaletteLibelle();
}

/** Rendre un libellé, ou un logo, à son placement automatique. */
function libelleAutomatique(){
  const c = choisi();
  if (!c) return;
  delete CONF[c.cle];
  enregistreConf();
  repeint(c.logo);
  majPaletteLibelle();
}

export function modePlacementLibelles(on){
  poseModeLibelles(!!on && ADMIN);
  racine.classList.toggle("mode-libelles", PLACE_LIBELLES);
  /* Le placement, le dessin et la reprise d'une géométrie se disputeraient le
     glisser : entrer dans l'un referme les autres (`modes-edition.mjs`). */
  if (PLACE_LIBELLES) quitteLesAutres("libelles");
  if (!PLACE_LIBELLES){ poseLibelleChoisi(null); glisseLib = null; }
  /* On sort d'ici par quatre chemins — le crayon, la croix de la palette, la
     touche d'échappement, l'ouverture d'un calque de dessin. Le crayon se
     rallume ou s'éteint donc ici, une fois pour tous, plutôt que dans chacun. */
  const crayon = document.querySelector("#pile .rlib");
  if (crayon) crayon.setAttribute("aria-pressed", PLACE_LIBELLES);
  majPaletteLibelle();
  /* Les logos ne se laissent attraper qu'en mode placement : leurs couches
     se refont pour le dire (`logos-stands.mjs`). */
  repeint(true);
}

/** La palette du libellé retouché : sa taille, l'angle d'un logo, et de quoi y renoncer. */
function majPaletteLibelle(){
  const z = $("libReg");
  if (!z || !ADMIN || !$("libNom")) return;
  const c = choisi();
  z.classList.toggle("open", !!(PLACE_LIBELLES && c));
  if (!(PLACE_LIBELLES && c)) return;
  const o = c.o, r = c.lu(o);
  $("libNom").textContent = (c.logo ? "Logo · " : "") + (o.nom || o.code ||
    (o.kind === "zone" ? "Zone sans nom" : "Stand"));
  $("libTaille").value = r && r.k ? r.k : 1;
  if ($("libAngle")){
    $("libAngleChamp").hidden = !c.logo;
    const a = r ? +r.a || 0 : 0;
    $("libAngle").value = a;
    $("libAngleVal").textContent = Math.round(a) + "°";
  }
  $("libAuto").disabled = !r;
  $("libAide").textContent = c.logo
    ? (r ? "Glissez le logo, ou ajustez-le aux flèches du clavier."
         : "Logo choisi : glissez-le pour le déplacer, tirez la taille ou l'angle.")
    : (r ? "Glissez le libellé, ou ajustez-le aux flèches du clavier."
         : "Glissez ce libellé pour le déplacer, ou tirez la taille.");
}

/** Choisir le libellé, ou le logo, qu'on retouche — au clic, ou en le glissant. */
function choisitLibelle(id){
  poseLibelleChoisi(id);
  libelles();
  majPaletteLibelle();
}

/** Le pas du clavier : un quart de mètre, un mètre touche majuscule tenue. */
export function pousseLibelle(dx, dy){
  const c = choisi();
  if (!c) return;
  posePlacement(c, n => { n.dx += dx; n.dy += dy; });
  enregistreConf();
}

/* --- le geste ; renvoie vrai si l'événement est consommé --- */
export function libellePointerDown(e){
  if (!PLACE_LIBELLES) return false;
  const g = GL.actif ? null : e.target.closest("#labels .lbl");
  // vu de près, c'est le logo qu'on attrape : il porte « logo: » devant l'identifiant du stand
  const id = GL.actif ? libelleSousWebgl(e.clientX, e.clientY) : g && g.dataset.lbl;
  if (!id) return false;
  /* Un logo couvre presque tout son stand : en glissant le plan, crayon
     resté allumé, on l'emportait au passage. Le premier appui le choisit
     seulement ; seul un logo déjà choisi se glisse. */
  const dejaChoisi = id === libSel;
  choisitLibelle(id);
  const c = choisi();
  if (!c){ choisitLibelle(null); return false; }
  e.preventDefault();
  if (c.logo && !dejaChoisi) return true;
  const r = c.lu(c.o);
  glisseLib = { c, depart: versPlan(e.clientX, e.clientY),
                dx: r ? r.dx || 0 : 0, dy: r ? r.dy || 0 : 0 };
  try { svg.setPointerCapture(e.pointerId); } catch (err) {}
  return true;
}

export function libellePointerMove(e){
  if (!glisseLib) return false;
  const p = versPlan(e.clientX, e.clientY);
  const dx = glisseLib.dx + p[0] - glisseLib.depart[0];
  const dy = glisseLib.dy + p[1] - glisseLib.depart[1];
  posePlacement(glisseLib.c, n => { n.dx = dx; n.dy = dy; });
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
 * Appelé par `plan-admin.mjs`, dans un emplacement du lancement que la page
 * publique laisse vide : les commandes de la palette s'y branchent à leur
 * rang, entre le nuancier et l'outil de dessin.
 */
export function branchePlacementLibelles(){
  if ($("libFerme")) $("libFerme").onclick = () => modePlacementLibelles(false);
  if ($("libAuto")) $("libAuto").onclick = libelleAutomatique;
  if ($("libTaille")){
    $("libTaille").oninput = e => {
      const c = choisi();
      if (c) posePlacement(c, n => { n.k = +e.target.value; });
    };
    $("libTaille").onchange = enregistreConf;
  }
  if ($("libAngle")){
    /* Un logo couché de travers se remet d'aplomb sans viser au degré près :
       à moins de trois degrés d'un quart de tour, le curseur s'y pose. */
    $("libAngle").oninput = e => {
      const c = choisi();
      if (!c || !c.logo) return;
      const a = +e.target.value, quart = Math.round(a / 90) * 90;
      posePlacement(c, n => { n.a = Math.abs(a - quart) < 3 ? quart : a; });
    };
    $("libAngle").onchange = enregistreConf;
  }
}

/* Le placement est l'un des trois modes d'édition exclusifs : ouvrir les deux
   autres le referme, s'il est ouvert. */
inscritMode("libelles", () => { if (PLACE_LIBELLES) modePlacementLibelles(false); });
