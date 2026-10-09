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
import { coloreChaleur, rangChaleur, NOM_VOLET_MESURE, voletMesure, evenementCourant, brancheChaleur }
  from "./chaleur.mjs";
import { ROLES_ITI, cleRoleIti, nomRoleIti, lienEcrits, ecritLiens,
  annuaireLiaisons } from "./itineraire.mjs";
import { brancheCalageCarte, basculeMasqueCarte, boutonMasqueCarte, oublieCalageEnCours, cartePointerDown,
  cartePointerMove, cartePointerUp, voletEnvirons } from "./calage-carte.mjs";
import { RAPPEL_MIN, RAPPEL_MAX, reglageRappel, rappelsVoulus, minutesRappel, rappelsOfferts,
  proposeRappels } from "./rappels.mjs";
import { essaieRappelReel } from "./essai-rappel.mjs";
import { brancheReglageInstallation } from "./reglage-installation.mjs";
import { ecranAcces, brancheAcces } from "./acces-admin.mjs";
import { codeIciAuPoint, ouvreCodeIci, boutonCodeIci, brancheAfficheIci } from "./affiche-ici.mjs";
import { NOM_VOLET_SUGGESTION, voletSuggestion, brancheReglageSuggestion } from "./reglage-suggestion.mjs";
import { majAttente, compteRescapes, programmePublication, rattrapeRetard, noteReglagesCharges,
  pousseConfiguration, brancheSauvegarde, brancheEnregistrement } from "./enregistrement.mjs";
import { ecritMetres, coteCadre, montreCote, oublieAimantsDuPlan, oublieAimants, coinsGeste, montreAimants,
  correction, aimante, DERNIERE, retientTaille, reprendTaille, dupliqueForme, pousseForme, ecritDimensions,
  appliqueDimension, brancheAimants } from "./aimants.mjs";
import { voletOrdre, brancheReglageFiche } from "./reglage-fiche.mjs";
import { CALAGE, bibliothequeDispo, ouvreBibliotheque, dessineCalage, calagePointerDown, calagePointerMove,
  calagePointerUp, brancheBatiments, boutonRecale, rouvreCalage } from "./batiments.mjs";
import { vivants } from "./vivant.mjs";
import { voletAdmin, blocHoraires, voletParcours, sallesSituees, voletPmr, MAJ_COIN, voletDist,
  voletApparence, brancheVolets } from "./volets.mjs";
import { activeAdmin, brancheBandeAdmin } from "./bande-admin.mjs";
import { champZone, champsZone, cadreLogo, suitFicheZone, verseFicheZone, ficheZone, basculeAffichageZone,
  ecritColonneEvenement, brancheFicheZone } from "./fiche-zone.mjs";
import { lacheLibelle, modePlacementLibelles, pousseLibelle, libellePointerDown, libellePointerMove,
  libellePointerUp, branchePlacementLibelles } from "./placement-libelles.mjs";
import { PROFIL_ADMIN } from "./acces-admin.mjs";
import { branchePile, remplitPanneau } from "./pile.mjs";

Object.assign(globalThis, {
  reduitLogo,
  brancheReglageApplication,
  brancheReglageSponsor,
  coloreChaleur, rangChaleur, NOM_VOLET_MESURE, voletMesure, evenementCourant, brancheChaleur,
  ROLES_ITI, cleRoleIti, nomRoleIti, lienEcrits, ecritLiens,
  annuaireLiaisons,
  brancheCalageCarte, basculeMasqueCarte, boutonMasqueCarte, oublieCalageEnCours, cartePointerDown,
  cartePointerMove, cartePointerUp, voletEnvirons,
  RAPPEL_MIN, RAPPEL_MAX, reglageRappel, rappelsVoulus, minutesRappel, rappelsOfferts,
  proposeRappels,
  essaieRappelReel,
  brancheReglageInstallation,
  ecranAcces, brancheAcces,
  codeIciAuPoint, ouvreCodeIci, boutonCodeIci, brancheAfficheIci,
  NOM_VOLET_SUGGESTION, voletSuggestion, brancheReglageSuggestion,
  majAttente, compteRescapes, programmePublication, rattrapeRetard, noteReglagesCharges,
  pousseConfiguration, brancheSauvegarde, brancheEnregistrement,
  ecritMetres, coteCadre, montreCote, oublieAimantsDuPlan, oublieAimants, coinsGeste, montreAimants,
  correction, aimante, DERNIERE, retientTaille, reprendTaille, dupliqueForme, pousseForme, ecritDimensions,
  appliqueDimension, brancheAimants,
  voletOrdre, brancheReglageFiche,
  bibliothequeDispo, ouvreBibliotheque, dessineCalage, calagePointerDown, calagePointerMove,
  calagePointerUp, brancheBatiments, boutonRecale, rouvreCalage,
  voletAdmin, blocHoraires, voletParcours, sallesSituees, voletPmr, MAJ_COIN, voletDist,
  voletApparence, brancheVolets,
  activeAdmin, brancheBandeAdmin,
  champZone, champsZone, cadreLogo, suitFicheZone, verseFicheZone, ficheZone, basculeAffichageZone,
  ecritColonneEvenement, brancheFicheZone,
  lacheLibelle, modePlacementLibelles, pousseLibelle, libellePointerDown, libellePointerMove,
  libellePointerUp, branchePlacementLibelles,
  branchePile, remplitPanneau,
});

/* Le calage d'un hall en cours, ou rien : le module le pose en le lançant et
   l'efface en le quittant. La vue le lit par accesseur, pour redessiner la
   poignée qui se mesure en pixels. */
Object.defineProperties(globalThis, vivants({ CALAGE: () => CALAGE }, "ouvreBibliotheque"));

/* Le profil du compte, « admin » ou non : le module le pose en lisant le
   compte à l'ouverture de la session. Les réglages le lisent par accesseur,
   pour ouvrir ou non les onglets que seul l'administrateur reçoit. */
Object.defineProperties(globalThis, vivants({ PROFIL_ADMIN: () => PROFIL_ADMIN }, "litProfilA"));
