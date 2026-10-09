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
import { brancheReglageApplication } from "./reglage-application.mjs";
import { brancheReglageSponsor } from "./reglage-sponsor.mjs";
import { coloreChaleur, rangChaleur, evenementCourant, brancheChaleur } from "./chaleur.mjs";
import { ROLES_ITI, cleRoleIti, nomRoleIti, lienEcrits, ecritLiens,
  annuaireLiaisons } from "./itineraire.mjs";
import { brancheCalageCarte, basculeMasqueCarte, boutonMasqueCarte, oublieCalageEnCours, cartePointerDown,
  cartePointerMove, cartePointerUp } from "./calage-carte.mjs";
import { brancheReglageInstallation } from "./reglage-installation.mjs";
import { ecranAcces, brancheAcces } from "./acces-admin.mjs";
import { codeIciAuPoint, ouvreCodeIci, boutonCodeIci, brancheAfficheIci } from "./affiche-ici.mjs";
import { brancheReglageSuggestion } from "./reglage-suggestion.mjs";
import { majAttente, compteRescapes, programmePublication, rattrapeRetard, noteReglagesCharges,
  pousseConfiguration, brancheSauvegarde, brancheEnregistrement } from "./enregistrement.mjs";
import { ecritMetres, coteCadre, montreCote, oublieAimantsDuPlan, oublieAimants, coinsGeste, montreAimants,
  correction, aimante, DERNIERE, retientTaille, reprendTaille, dupliqueForme, pousseForme, ecritDimensions,
  appliqueDimension, brancheAimants } from "./aimants.mjs";
import { brancheReglageFiche } from "./reglage-fiche.mjs";
import { CALAGE, bibliothequeDispo, ouvreBibliotheque, dessineCalage, calagePointerDown, calagePointerMove,
  calagePointerUp, brancheBatiments, boutonRecale, rouvreCalage } from "./batiments.mjs";
import { vivants } from "./vivant.mjs";
import { brancheVolets } from "./volets.mjs";
import { activeAdmin, brancheBandeAdmin } from "./bande-admin.mjs";
import { champZone, cadreLogo, ficheZone, basculeAffichageZone, ecritColonneEvenement, brancheFicheZone }
  from "./fiche-zone.mjs";
import { lacheLibelle, modePlacementLibelles, pousseLibelle, libellePointerDown, libellePointerMove,
  libellePointerUp, branchePlacementLibelles } from "./placement-libelles.mjs";
import { brancheApercus } from "./apercus.mjs";
import { brancheReglageRappel } from "./reglage-rappel.mjs";
import { glisseFenetre, ouvreReglages, brancheReglages } from "./reglages.mjs";
import { branchePile, remplitPanneau } from "./pile.mjs";
import { geoSel, outilGeo, traceAjout, lacheGeo, modeGeometrie, choisitGeo, dessinePoigneesGeo, majPaletteGeo,
  pousseGeometrie, choisitOutilGeo, fermeAjout, geometriePointerDown, geometriePointerMove, geometriePointerUp,
  brancheRepriseEmplacements } from "./reprise-emplacements.mjs";

Object.assign(globalThis, {
  reduitLogo,
  brancheReglageApplication,
  brancheReglageSponsor,
  coloreChaleur, rangChaleur, evenementCourant, brancheChaleur,
  ROLES_ITI, cleRoleIti, nomRoleIti, lienEcrits, ecritLiens,
  annuaireLiaisons,
  brancheCalageCarte, basculeMasqueCarte, boutonMasqueCarte, oublieCalageEnCours, cartePointerDown,
  cartePointerMove, cartePointerUp,
  brancheReglageInstallation,
  ecranAcces, brancheAcces,
  codeIciAuPoint, ouvreCodeIci, boutonCodeIci, brancheAfficheIci,
  brancheReglageSuggestion,
  majAttente, compteRescapes, programmePublication, rattrapeRetard, noteReglagesCharges,
  pousseConfiguration, brancheSauvegarde, brancheEnregistrement,
  ecritMetres, coteCadre, montreCote, oublieAimantsDuPlan, oublieAimants, coinsGeste, montreAimants,
  correction, aimante, DERNIERE, retientTaille, reprendTaille, dupliqueForme, pousseForme, ecritDimensions,
  appliqueDimension, brancheAimants,
  brancheReglageFiche,
  bibliothequeDispo, ouvreBibliotheque, dessineCalage, calagePointerDown, calagePointerMove,
  calagePointerUp, brancheBatiments, boutonRecale, rouvreCalage,
  brancheVolets,
  activeAdmin, brancheBandeAdmin,
  champZone, cadreLogo, ficheZone, basculeAffichageZone, ecritColonneEvenement, brancheFicheZone,
  lacheLibelle, modePlacementLibelles, pousseLibelle, libellePointerDown, libellePointerMove,
  libellePointerUp, branchePlacementLibelles,
  branchePile, remplitPanneau,
  brancheApercus,
  brancheReglageRappel,
  glisseFenetre, ouvreReglages, brancheReglages,
  lacheGeo, modeGeometrie, choisitGeo, dessinePoigneesGeo, majPaletteGeo,
  pousseGeometrie, choisitOutilGeo, fermeAjout, geometriePointerDown, geometriePointerMove, geometriePointerUp,
  brancheRepriseEmplacements,
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
