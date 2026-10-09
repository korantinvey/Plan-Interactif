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
import { brancheReglageSponsor } from "./reglage-sponsor.mjs";
import { coloreChaleur, brancheChaleur } from "./chaleur.mjs";
import { brancheCalageCarte, oublieCalageEnCours } from "./calage-carte.mjs";
import { ecranAcces, brancheAcces } from "./acces-admin.mjs";
import { ouvreCodeIci } from "./affiche-ici.mjs";
import { brancheReglageSuggestion } from "./reglage-suggestion.mjs";
import { majAttente, compteRescapes, rattrapeRetard, noteReglagesCharges, brancheEnregistrement }
  from "./enregistrement.mjs";
import { brancheAimants } from "./aimants.mjs";
import { CALAGE, dessineCalage, brancheBatiments } from "./batiments.mjs";
import { vivants } from "./vivant.mjs";
import { activeAdmin } from "./bande-admin.mjs";
import { ficheZone, basculeAffichageZone, brancheFicheZone }
  from "./fiche-zone.mjs";
import { branchePlacementLibelles } from "./placement-libelles.mjs";
import { glisseFenetre, ouvreReglages } from "./reglages.mjs";
import { modeGeometrie, choisitGeo, dessinePoigneesGeo, majPaletteGeo, brancheRepriseEmplacements }
  from "./reprise-emplacements.mjs";
import { dessinePoignees, choisitForme, brancheEdition, geste } from "./edition.mjs";
import { rafraichitApercu } from "./nappe.mjs";
import { brancheNuancier } from "./nuancier.mjs";
import { enregistreDessins, HIST, REFAIRE, memorise, toleranceTrace, fermeIci, ajouteForme,
  remplitListeSocietes, societeSaisie, imageEnAttente, optionsModes, activeCalque, pictoVerrou,
  brancheOutilDessin } from "./outil-dessin.mjs";
import { formeSel, formeParId, boite } from "./forme-choisie.mjs";
/* Le panneau des calques : le code soudé ne l'appelle plus par son nom, et
   aucun autre module ne l'importe. Chargé ici, il confie son contenu à
   l'ordre de tracé (`ordre-trace.mjs` `construitPanneau`), et sa fenêtre de
   réorganisation vient avec lui. */
import "./pile.mjs";
import { brancheGestesAdmin } from "./gestes-admin.mjs";

Object.assign(globalThis, {
  brancheReglageSponsor,
  coloreChaleur, brancheChaleur,
  brancheCalageCarte, oublieCalageEnCours,
  ecranAcces, brancheAcces,
  ouvreCodeIci,
  brancheReglageSuggestion,
  majAttente, compteRescapes, rattrapeRetard, noteReglagesCharges,
  brancheEnregistrement,
  brancheAimants,
  dessineCalage,
  brancheBatiments,
  activeAdmin,
  ficheZone, basculeAffichageZone, brancheFicheZone,
  branchePlacementLibelles,
  glisseFenetre, ouvreReglages,
  modeGeometrie, choisitGeo, dessinePoigneesGeo, majPaletteGeo,
  brancheRepriseEmplacements,
  dessinePoignees, choisitForme,
  brancheEdition,
  rafraichitApercu,
  brancheNuancier,
  enregistreDessins, HIST, REFAIRE, memorise, toleranceTrace, fermeIci, ajouteForme,
  remplitListeSocietes, societeSaisie,
  optionsModes, activeCalque, pictoVerrou, brancheOutilDessin,
  formeParId, boite,
  brancheGestesAdmin,
});

/* Le calage d'un hall en cours, ou rien : le module le pose en le lançant et
   l'efface en le quittant. La vue le lit par accesseur, pour redessiner la
   poignée qui se mesure en pixels. */
Object.defineProperties(globalThis, vivants({ CALAGE: () => CALAGE }, "ouvreBibliotheque"));

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
