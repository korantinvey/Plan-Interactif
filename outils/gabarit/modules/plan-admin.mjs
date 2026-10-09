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

Object.assign(globalThis, {
  reduitLogo,
  blocApplication, brancheReglageApplication,
  blocSponsor, brancheReglageSponsor,
  coloreChaleur, rangChaleur, NOM_VOLET_MESURE, voletMesure, evenementCourant, brancheChaleur,
  ROLES_ITI, cleRoleIti, nomRoleIti, REGLAGES_FOULE, regleFoule, lienEcrits, ecritLiens,
  annuaireLiaisons,
  brancheCalageCarte, basculeMasqueCarte, boutonMasqueCarte, oublieCalageEnCours, cartePointerDown,
  cartePointerMove, cartePointerUp, voletEnvirons,
});
