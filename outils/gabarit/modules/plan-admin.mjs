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
import { brancheChaleur } from "./chaleur.mjs";
import { brancheCalageCarte } from "./calage-carte.mjs";
import { brancheAcces } from "./acces-admin.mjs";
import "./affiche-ici.mjs";
import { brancheEnregistrement }
  from "./enregistrement.mjs";
import { brancheAimants } from "./aimants.mjs";
import { brancheBatiments } from "./batiments.mjs";
import { vivants } from "./vivant.mjs";
/* L'ouverture du mode et la bande de l'outil : le code soudé ne l'appelle plus
   par son nom, et seul ce point d'entrée la charge. Chargée ici, elle confie
   l'ouverture du mode à la porte authentifiée (`acces-admin.mjs`
   `confieALAcces`). */
import "./bande-admin.mjs";
import { branchePlacementLibelles } from "./placement-libelles.mjs";
import { glisseFenetre } from "./reglages.mjs";
import { brancheRepriseEmplacements } from "./reprise-emplacements.mjs";
import { dessinePoignees, choisitForme } from "./edition.mjs";
import { brancheNuancier } from "./nuancier.mjs";
import { enregistreDessins, memorise, toleranceTrace, ajouteForme, imageEnAttente,
  brancheOutilDessin } from "./outil-dessin.mjs";
import { formeSel, formeParId, boite } from "./forme-choisie.mjs";
/* Le panneau des calques : le code soudé ne l'appelle plus par son nom, et
   aucun autre module ne l'importe. Chargé ici, il confie son contenu à
   l'ordre de tracé (`ordre-trace.mjs` `construitPanneau`), et sa fenêtre de
   réorganisation vient avec lui. */
import "./pile.mjs";
import { brancheGestesAdmin } from "./gestes-admin.mjs";

Object.assign(globalThis, {
  brancheChaleur,
  brancheCalageCarte, brancheAcces,
  brancheEnregistrement,
  brancheAimants,
  brancheBatiments,
  branchePlacementLibelles,
  glisseFenetre,
  brancheRepriseEmplacements,
  dessinePoignees, choisitForme,
  brancheNuancier,
  enregistreDessins, memorise, toleranceTrace, ajouteForme,
  brancheOutilDessin,
  formeParId, boite,
  brancheGestesAdmin,
});


/* L'image qu'on s'apprête à poser, ou rien : seul son import la remplace. Les
   aimants la lisent par accesseur, pour garder ses proportions au tracé. */
Object.defineProperties(globalThis, vivants({ imageEnAttente: () => imageEnAttente }, "importeImage"));
/* La forme choisie dans l'éditeur, ou rien : les aimants, que le code soudé
   branche, la lisent par accesseur ; seul l'outil de l'exploitant la change,
   par sa porte (`forme-choisie.mjs` `poseFormeSel`). */
Object.defineProperties(globalThis, vivants({ formeSel: () => formeSel }, "poseFormeSel"));
