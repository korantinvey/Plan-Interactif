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
import { brancheBatiments } from "./batiments.mjs";
/* L'ouverture du mode et la bande de l'outil : le code soudé ne l'appelle plus
   par son nom, et seul ce point d'entrée la charge. Chargée ici, elle confie
   l'ouverture du mode à la porte authentifiée (`acces-admin.mjs`
   `confieALAcces`). */
import "./bande-admin.mjs";
import { branchePlacementLibelles } from "./placement-libelles.mjs";
import { brancheRepriseEmplacements } from "./reprise-emplacements.mjs";
import { brancheNuancier } from "./nuancier.mjs";
/* L'outil de dessin confie en se chargeant aux aimants ce qu'ils lisent
   (`brancheAimants`) : ils ne s'importent donc plus d'ici. */
import { brancheOutilDessin } from "./outil-dessin.mjs";
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
  brancheBatiments,
  branchePlacementLibelles,
  brancheRepriseEmplacements,
  brancheNuancier,
  brancheOutilDessin,
  brancheGestesAdmin,
});

