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
import { blocApplication, brancheReglageApplication } from "./reglage-application.mjs";
import { blocSponsor, brancheReglageSponsor } from "./reglage-sponsor.mjs";
import { coloreChaleur, rangChaleur, NOM_VOLET_MESURE, voletMesure, evenementCourant, brancheChaleur }
  from "./chaleur.mjs";
import { ROLES_ITI, cleRoleIti, nomRoleIti, REGLAGES_FOULE, regleFoule, lienEcrits, ecritLiens,
  annuaireLiaisons } from "./itineraire.mjs";
import { brancheCalageCarte, basculeMasqueCarte, boutonMasqueCarte, oublieCalageEnCours, cartePointerDown,
  cartePointerMove, cartePointerUp, voletEnvirons } from "./calage-carte.mjs";
import { RAPPEL_MIN, RAPPEL_MAX, reglageRappel, rappelsVoulus, minutesRappel, rappelsOfferts,
  proposeRappels } from "./rappels.mjs";
import { essaieRappelReel } from "./essai-rappel.mjs";
import { caseInstallation, brancheReglageInstallation } from "./reglage-installation.mjs";
import { ecranAcces, brancheAcces } from "./acces-admin.mjs";
import { codeIciAuPoint, ouvreCodeIci, boutonCodeIci, brancheAfficheIci } from "./affiche-ici.mjs";
import { NOM_VOLET_SUGGESTION, voletSuggestion, brancheReglageSuggestion } from "./reglage-suggestion.mjs";
import { reglageTuto, tutoPropose, chapitresTuto, lanceTutoriel } from "./tutoriel.mjs";
import { majAttente, compteRescapes, programmePublication, rattrapeRetard, noteReglagesCharges,
  pousseConfiguration, brancheSauvegarde, brancheEnregistrement } from "./enregistrement.mjs";
import { ecritMetres, coteCadre, montreCote, oublieAimantsDuPlan, oublieAimants, coinsGeste, montreAimants,
  correction, aimante, DERNIERE, retientTaille, reprendTaille, dupliqueForme, pousseForme, ecritDimensions,
  appliqueDimension, brancheAimants } from "./aimants.mjs";
import { voletOrdre, brancheReglageFiche } from "./reglage-fiche.mjs";
import { CALAGE, bibliothequeDispo, ouvreBibliotheque, dessineCalage, calagePointerDown, calagePointerMove,
  calagePointerUp, brancheBatiments, boutonRecale, rouvreCalage } from "./batiments.mjs";
import { vivants } from "./vivant.mjs";

Object.assign(globalThis, {
  reduitLogo,
  blocApplication, brancheReglageApplication,
  blocSponsor, brancheReglageSponsor,
  coloreChaleur, rangChaleur, NOM_VOLET_MESURE, voletMesure, evenementCourant, brancheChaleur,
  ROLES_ITI, cleRoleIti, nomRoleIti, REGLAGES_FOULE, regleFoule, lienEcrits, ecritLiens,
  annuaireLiaisons,
  brancheCalageCarte, basculeMasqueCarte, boutonMasqueCarte, oublieCalageEnCours, cartePointerDown,
  cartePointerMove, cartePointerUp, voletEnvirons,
  RAPPEL_MIN, RAPPEL_MAX, reglageRappel, rappelsVoulus, minutesRappel, rappelsOfferts,
  proposeRappels,
  essaieRappelReel,
  caseInstallation, brancheReglageInstallation,
  ecranAcces, brancheAcces,
  codeIciAuPoint, ouvreCodeIci, boutonCodeIci, brancheAfficheIci,
  NOM_VOLET_SUGGESTION, voletSuggestion, brancheReglageSuggestion,
  reglageTuto, tutoPropose, chapitresTuto, lanceTutoriel,
  majAttente, compteRescapes, programmePublication, rattrapeRetard, noteReglagesCharges,
  pousseConfiguration, brancheSauvegarde, brancheEnregistrement,
  ecritMetres, coteCadre, montreCote, oublieAimantsDuPlan, oublieAimants, coinsGeste, montreAimants,
  correction, aimante, DERNIERE, retientTaille, reprendTaille, dupliqueForme, pousseForme, ecritDimensions,
  appliqueDimension, brancheAimants,
  voletOrdre, brancheReglageFiche,
  bibliothequeDispo, ouvreBibliotheque, dessineCalage, calagePointerDown, calagePointerMove,
  calagePointerUp, brancheBatiments, boutonRecale, rouvreCalage,
});

/* Le calage d'un hall en cours, ou rien : le module le pose en le lançant et
   l'efface en le quittant. La vue le lit par accesseur, pour redessiner la
   poignée qui se mesure en pixels. */
Object.defineProperties(globalThis, vivants({ CALAGE: () => CALAGE }, "ouvreBibliotheque"));
