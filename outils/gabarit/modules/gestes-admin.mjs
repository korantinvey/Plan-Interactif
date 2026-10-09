/* ============================================================
   Les gestes de l'exploitant sur le plan — leur rang dans la chaîne

   Chaque outil de l'exploitant tient ses propres gestes : le calage de la
   carte (`calage-carte.mjs`), le placement d'un libellé
   (`placement-libelles.mjs`), la reprise d'un emplacement
   (`reprise-emplacements.mjs`), le calage d'un hall (`batiments.mjs`), le
   dessin (`outil-dessin.mjs`). Ce module ne dit que leur ordre, et celui des
   touches de l'éditeur : il les insère dans la chaîne des appuis et du clavier
   de `modules/gestes.mjs` par `poseGestesAdmin`, à la place que leur tranche
   `@admin` y tenait.

   Un module de l'administration : `plan-admin.mjs` l'embarque, le visiteur ne
   le reçoit jamais. `_gestes.html` le branche dans une tranche `@admin`,
   juste après les gestes du plan. La forme dessinée choisie, il l'importe
   (`forme-choisie.mjs`), et la lit telle qu'elle est à l'instant.
   ============================================================ */
import { $ } from "./dom.mjs";
import { ADMIN } from "./mode-admin.mjs";
import { PLACE_LIBELLES, libSel } from "./libelle-place.mjs";
import { SORTE_GEO } from "./emplacements.mjs";
import { enCours, calqueActif } from "./calques-dessin.mjs";
import { poseGestesAdmin, drag, pince } from "./gestes.mjs";
import { cartePointerDown, cartePointerMove, cartePointerUp, carteGlissee } from "./calage-carte.mjs";
import { lacheLibelle, modePlacementLibelles, pousseLibelle, libellePointerDown, libellePointerMove,
  libellePointerUp, libelleGlisse } from "./placement-libelles.mjs";
import { geoSel, outilGeo, traceAjout, lacheGeo, modeGeometrie, choisitGeo, pousseGeometrie, choisitOutilGeo,
  fermeAjout, geometriePointerDown, geometriePointerMove, geometriePointerUp, geoGlisse } from "./reprise-emplacements.mjs";
import { calagePointerDown, calagePointerMove, calagePointerUp, halleGlissee } from "./batiments.mjs";
import { annule, refais, dessinPointerDown, dessinPointerMove, dessinPointerUp, termineTrace, activeCalque }
  from "./outil-dessin.mjs";
import { choisitForme, supprimeForme, geste } from "./edition.mjs";
import { confieGesteEnCours } from "./enregistrement.mjs";
import { dupliqueForme, pousseForme } from "./aimants.mjs";
import { codeIciAuPoint } from "./affiche-ici.mjs";
import { formeSel } from "./forme-choisie.mjs";

/* Le doigt posé. Caler la carte passe avant tout : tant qu'un mode est armé,
   la main saisit le fond et non le plan — c'est le seul geste que la palette
   attend. */
function appui(/** @type {PointerEvent} */ e){
  if (cartePointerDown(e)) return true;
  /* Placer un libellé passe avant tout le reste : le geste vise un nom, pas
     l'emplacement qui est dessous ni la vue qu'on déplacerait. */
  if (libellePointerDown(e)) return true;
  /* Reprendre la forme d'un emplacement passe avant sa fiche : le geste vise
     la géométrie, pas l'exposant qui la loue. */
  if (geometriePointerDown(e)) return true;
  // le contour d'un bâtiment qu'on cale se saisit avant ce qui est dessous
  if (calagePointerDown(e)) return true;
  if (dessinPointerDown(e)) return true;
  return false;
}

function suit(/** @type {PointerEvent} */ e){
  if (cartePointerMove(e)) return true;
  if (libellePointerMove(e)) return true;
  if (geometriePointerMove(e)) return true;
  if (calagePointerMove(e)) return true;
  if (dessinPointerMove(e)) return true;
  return false;
}

function leve(/** @type {PointerEvent} */ e){
  if (cartePointerUp(e)) return true;
  if (libellePointerUp(e)) return true;
  if (geometriePointerUp(e)) return true;
  if (dessinPointerUp(e)) return true;
  if (calagePointerUp()) return true;
  return false;
}

/* Le geste annulé : le libellé qu'on glissait à la main, la forme qu'on
   reprenait. */
function annuleGeste(){
  lacheLibelle();
  lacheGeo();
}

/* Les raccourcis et les flèches de l'éditeur, avant tout le reste du clavier. */
function clavier(/** @type {KeyboardEvent} */ e, /** @type {boolean} */ saisie){
  if (ADMIN && !saisie && (e.ctrlKey || e.metaKey)){
    const t = e.key.toLowerCase();
    if (t === "z" && !e.shiftKey){ e.preventDefault(); annule(); return true; }
    if (t === "y" || (t === "z" && e.shiftKey)){ e.preventDefault(); refais(); return true; }
    /* Répéter plutôt que redessiner : c'est ainsi qu'une rangée de stands
       identiques se déroule, la copie prenant la place de la sélection. */
    if (t === "d" && formeSel){ e.preventDefault(); dupliqueForme(); return true; }
  }
  if (ADMIN && !saisie && (e.key === "Delete" || e.key === "Backspace") && formeSel){
    e.preventDefault(); supprimeForme(); return true;
  }
  /* Le clavier ajuste au quart de mètre ce que la main pose approximativement,
     et au mètre touche majuscule tenue : c'est la finition d'un placement,
     après le glisser qui l'a amené à peu près là. */
  if (PLACE_LIBELLES && libSel && !saisie && e.key.indexOf("Arrow") === 0){
    e.preventDefault();
    const pas = e.shiftKey ? 1 : .25;
    pousseLibelle(e.key === "ArrowLeft" ? -pas : e.key === "ArrowRight" ? pas : 0,
                  e.key === "ArrowUp" ? -pas : e.key === "ArrowDown" ? pas : 0);
    return true;
  }
  /* Un emplacement repris se règle du même pas, pour la même raison : la main
     l'a posé à peu près, le clavier l'ajuste. */
  if (SORTE_GEO && geoSel && !saisie && e.key.indexOf("Arrow") === 0){
    e.preventDefault();
    const pas = e.shiftKey ? 1 : .25;
    pousseGeometrie(e.key === "ArrowLeft" ? -pas : e.key === "ArrowRight" ? pas : 0,
                    e.key === "ArrowUp" ? -pas : e.key === "ArrowDown" ? pas : 0);
    return true;
  }
  /* Une forme choisie se règle du même pas : l'aimant l'a posée contre sa
     voisine, le clavier lui donne l'allée qui les sépare. */
  if (ADMIN && formeSel && !saisie && e.key.indexOf("Arrow") === 0){
    e.preventDefault();
    const pas = e.shiftKey ? 1 : .25;
    pousseForme(e.key === "ArrowLeft" ? -pas : e.key === "ArrowRight" ? pas : 0,
                e.key === "ArrowUp" ? -pas : e.key === "ArrowDown" ? pas : 0);
    return true;
  }
  return false;
}

/* Échap referme d'abord les modes de l'éditeur, un cran par touche ; ce n'est
   qu'une fois tous refermés qu'elle ferme la fiche. */
function echap(){
  if (PLACE_LIBELLES){ modePlacementLibelles(false); return true; }
  /* Un tracé d'emplacement s'abandonne d'abord, puis l'outil qui l'a
     commencé : on renonce à une forme sans quitter la couche. */
  if (SORTE_GEO && traceAjout){ fermeAjout(false); return true; }
  if (SORTE_GEO && outilGeo){ choisitOutilGeo(""); return true; }
  /* Une forme choisie se relâche d'abord, le mode ensuite : deux crans pour
     une même touche, comme ailleurs sur le plan. */
  if (SORTE_GEO && geoSel){ choisitGeo(null); return true; }
  if (SORTE_GEO){ modeGeometrie(null); return true; }
  if (enCours){ termineTrace(false); return true; }
  if (formeSel){ choisitForme(null); return true; }
  if (calqueActif){ activeCalque(calqueActif); return true; }
  return false;
}

/* Le panneau des calques n'existe qu'en administration : Échap le referme
   avec la fiche. */
function apresEchap(){
  if ($("panel")) $("panel").classList.remove("open");
}

/* Entrée ferme le tracé, et s'arrête là : le bouton qui garde le focus — un
   outil de la palette, « Annuler » — s'activerait sinon dans la foulée, et
   défairait la forme à l'instant posée. */
function entree(/** @type {KeyboardEvent} */ e, /** @type {boolean} */ saisie){
  if (e.key === "Enter" && !saisie && enCours){ e.preventDefault(); termineTrace(true); }
  if (e.key === "Enter" && !saisie && traceAjout){ e.preventDefault(); fermeAjout(true); }
}

/* Un geste encore en cours : la main tient le plan, une forme, une poignée,
   un libellé, la carte ou un hall qu'on cale — ou un tracé commencé attend
   son sommet suivant. L'envoi au repos ne doit pas partir là-dessus : il
   publierait une forme à mi-chemin, que les visiteurs verraient le temps du
   geste suivant. Ce module connaît tous les outils ; c'est donc lui qui le
   dit à l'enregistrement, qui ne peut importer la plupart d'entre eux. */
const gesteEnCours = () => Boolean(drag || pince || geste || enCours || traceAjout) ||
  libelleGlisse() || geoGlisse() || carteGlissee() || halleGlissee();

/**
 * Insère les gestes de l'exploitant dans la chaîne du plan.
 */
export function brancheGestesAdmin(){
  confieGesteEnCours(gesteEnCours);
  poseGestesAdmin({
    appui, suit, leve, annule: annuleGeste,
    /* Désigner l'endroit d'un code « Vous êtes ici » : geste d'exploitant, que
       la page publique n'a pas. */
    codeIci: (x, y, cible) => codeIciAuPoint(x, y, cible),
    clavier, echap, apresEchap, entree,
  });
}
