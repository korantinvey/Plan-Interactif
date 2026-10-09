/* ============================================================
   Point d'entrée de la page d'administration du plan

   Le plan entier d'abord — `plan.mjs`, repris tel quel, ses noms exposés
   compris —, puis ce que le visiteur ne reçoit pas. Un seul script pour la
   page : deux auraient chacun leur exemplaire des modules partagés, et la
   fenêtre commune, par exemple, deux états qui divergent.

   Un nom exposé ici et non dans `plan.mjs` n'existe pas dans la page
   publique : la construction refuse qu'elle le cite (`outils/reserve.js`),
   comme un nom sorti d'une tranche `@admin`.
   ============================================================ */
import "./plan.mjs";
import { reduitLogo } from "./depot-image.mjs";
import { brancheReglageSponsor } from "./reglage-sponsor.mjs";
import { coloreChaleur, rangChaleur, evenementCourant, brancheChaleur } from "./chaleur.mjs";
import { ROLES_ITI, cleRoleIti, nomRoleIti, lienEcrits, ecritLiens,
  annuaireLiaisons } from "./itineraire.mjs";
import { brancheCalageCarte, basculeMasqueCarte, boutonMasqueCarte, oublieCalageEnCours, cartePointerDown,
  cartePointerMove, cartePointerUp } from "./calage-carte.mjs";
import { ecranAcces, brancheAcces } from "./acces-admin.mjs";
import { codeIciAuPoint, ouvreCodeIci, boutonCodeIci } from "./affiche-ici.mjs";
import { brancheReglageSuggestion } from "./reglage-suggestion.mjs";
import { majAttente, compteRescapes, rattrapeRetard, noteReglagesCharges,
  pousseConfiguration, brancheSauvegarde, brancheEnregistrement } from "./enregistrement.mjs";
import { ecritMetres, coteCadre, montreCote, oublieAimantsDuPlan, oublieAimants, coinsGeste, montreAimants,
  correction, aimante, DERNIERE, retientTaille, reprendTaille, dupliqueForme, pousseForme, ecritDimensions,
  appliqueDimension, brancheAimants } from "./aimants.mjs";
import { CALAGE, bibliothequeDispo, ouvreBibliotheque, dessineCalage, calagePointerDown, calagePointerMove,
  calagePointerUp, brancheBatiments, boutonRecale, rouvreCalage } from "./batiments.mjs";
import { vivants } from "./vivant.mjs";
import { activeAdmin } from "./bande-admin.mjs";
import { ficheZone, basculeAffichageZone, brancheFicheZone }
  from "./fiche-zone.mjs";
import { lacheLibelle, pousseLibelle, libellePointerDown, libellePointerMove,
  libellePointerUp, branchePlacementLibelles } from "./placement-libelles.mjs";
import { glisseFenetre, ouvreReglages } from "./reglages.mjs";
import { geoSel, outilGeo, traceAjout, lacheGeo, modeGeometrie, choisitGeo, dessinePoigneesGeo, majPaletteGeo,
  pousseGeometrie, choisitOutilGeo, fermeAjout, geometriePointerDown, geometriePointerMove, geometriePointerUp,
  brancheRepriseEmplacements } from "./reprise-emplacements.mjs";
import { dessinePoignees, choisitForme, majElement, changeLien, appliqueSociete, appliqueTexte,
  appliqueRotation, appliqueRayon, appliqueTrait, appliqueTransport, appliquePicto, supprimeForme,
  editionPointerDown, editionPointerMove, editionPointerUp, brancheEdition, geste } from "./edition.mjs";
import { poseNappe, rafraichitApercu } from "./nappe.mjs";
import { brancheNuancier, suitNuancier } from "./nuancier.mjs";
import { enregistreDessins, HIST, REFAIRE, memorise, annule, refais, toleranceTrace, fermeIci, ajouteForme,
  remplitListeSocietes, societeSaisie, imageEnAttente, dessinPointerDown, dessinPointerMove,
  dessinPointerUp, termineTrace, optionsModes, activeCalque, pictoVerrou, brancheOutilDessin }
  from "./outil-dessin.mjs";
import { formeSel, formeParId, boite } from "./forme-choisie.mjs";
/* Le panneau des calques : le code soudé ne l'appelle plus par son nom, et
   aucun autre module ne l'importe. Chargé ici, il confie son contenu à
   l'ordre de tracé (`ordre-trace.mjs` `construitPanneau`), et sa fenêtre de
   réorganisation vient avec lui. */
import "./pile.mjs";
import { brancheGestesAdmin } from "./gestes-admin.mjs";

Object.assign(globalThis, {
  reduitLogo,
  brancheReglageSponsor,
  coloreChaleur, rangChaleur, evenementCourant, brancheChaleur,
  ROLES_ITI, cleRoleIti, nomRoleIti, lienEcrits, ecritLiens,
  annuaireLiaisons,
  brancheCalageCarte, basculeMasqueCarte, boutonMasqueCarte, oublieCalageEnCours, cartePointerDown,
  cartePointerMove, cartePointerUp,
  ecranAcces, brancheAcces,
  codeIciAuPoint, ouvreCodeIci, boutonCodeIci,
  brancheReglageSuggestion,
  majAttente, compteRescapes, rattrapeRetard, noteReglagesCharges,
  pousseConfiguration, brancheSauvegarde, brancheEnregistrement,
  ecritMetres, coteCadre, montreCote, oublieAimantsDuPlan, oublieAimants, coinsGeste, montreAimants,
  correction, aimante, DERNIERE, retientTaille, reprendTaille, dupliqueForme, pousseForme, ecritDimensions,
  appliqueDimension, brancheAimants,
  bibliothequeDispo, ouvreBibliotheque, dessineCalage, calagePointerDown, calagePointerMove,
  calagePointerUp, brancheBatiments, boutonRecale, rouvreCalage,
  activeAdmin,
  ficheZone, basculeAffichageZone, brancheFicheZone,
  lacheLibelle, pousseLibelle, libellePointerDown, libellePointerMove,
  libellePointerUp, branchePlacementLibelles,
  glisseFenetre, ouvreReglages,
  lacheGeo, modeGeometrie, choisitGeo, dessinePoigneesGeo, majPaletteGeo,
  pousseGeometrie, choisitOutilGeo, fermeAjout, geometriePointerDown, geometriePointerMove, geometriePointerUp,
  brancheRepriseEmplacements,
  dessinePoignees, choisitForme, majElement, changeLien, appliqueSociete, appliqueTexte,
  appliqueRotation, appliqueRayon, appliqueTrait, appliqueTransport, appliquePicto, supprimeForme,
  editionPointerDown, editionPointerMove, editionPointerUp, brancheEdition,
  poseNappe, rafraichitApercu,
  brancheNuancier, suitNuancier,
  enregistreDessins, HIST, REFAIRE, memorise, annule, refais, toleranceTrace, fermeIci, ajouteForme,
  remplitListeSocietes, societeSaisie, dessinPointerDown, dessinPointerMove,
  dessinPointerUp, termineTrace, optionsModes, activeCalque, pictoVerrou, brancheOutilDessin,
  formeParId, boite,
  brancheGestesAdmin,
});

/* Le calage d'un hall en cours, ou rien : le module le pose en le lançant et
   l'efface en le quittant. La vue le lit par accesseur, pour redessiner la
   poignée qui se mesure en pixels. */
Object.defineProperties(globalThis, vivants({ CALAGE: () => CALAGE }, "ouvreBibliotheque"));

/* L'emplacement dont on reprend la forme, l'outil d'ajout pris et le tracé en
   cours : les gestes et le clavier les lisent par accesseur ; seul l'outil
   les change, en choisissant une forme ou un outil, ou en fermant un tracé. */
Object.defineProperties(globalThis, vivants({ geoSel: () => geoSel }, "choisitGeo"));
Object.defineProperties(globalThis, vivants({ outilGeo: () => outilGeo }, "choisitOutilGeo"));
Object.defineProperties(globalThis, vivants({ traceAjout: () => traceAjout }, "fermeAjout"));
/* Le geste d'édition en cours, ou rien : le module le pose en saisissant une
   forme et l'efface en la lâchant. Le dessin le lit par accesseur, pour garder
   les points d'accrochage d'un geste qui sort du plan. */
Object.defineProperties(globalThis, vivants({ geste: () => geste }, "editionPointerDown"));
/* L'image qu'on s'apprête à poser, ou rien : seul son import la remplace. Les
   aimants la lisent par accesseur, pour garder ses proportions au tracé. */
Object.defineProperties(globalThis, vivants({ imageEnAttente: () => imageEnAttente }, "importeImage"));
/* La forme choisie dans l'éditeur, ou rien : les aimants, que le code soudé
   branche, la lisent par accesseur ; seul l'outil de l'exploitant la change,
   par sa porte (`forme-choisie.mjs` `poseFormeSel`). */
Object.defineProperties(globalThis, vivants({ formeSel: () => formeSel }, "poseFormeSel"));
