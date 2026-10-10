/* ============================================================
   Point d'entrée de la page d'administration du plan

   Le plan entier d'abord — `plan.mjs`, repris tel quel —, puis ce que le
   visiteur ne reçoit pas. Un seul script pour la page : deux auraient chacun
   leur exemplaire des modules partagés, et la fenêtre commune, par exemple,
   deux états qui divergent.

   Le plan public lance la suite des branchements depuis son point d'entrée ;
   ici, c'est ce point d'entrée qui lance, une fois les modules de
   l'exploitant chargés : leurs branchements prennent, dans la suite de
   `lancement.mjs`, les rangs que leurs tranches `@admin` tenaient dans le
   script soudé d'avant (`confieLancementAdmin`).
   ============================================================ */
import "./plan.mjs";
import { confieLancementAdmin, lancePlan } from "./lancement.mjs";
import { brancheChaleur } from "./chaleur.mjs";
import { brancheCalageCarte } from "./calage-carte.mjs";
import { brancheAcces } from "./acces-admin.mjs";
import "./affiche-ici.mjs";
import { brancheEnregistrement } from "./enregistrement.mjs";
import { brancheBatiments } from "./batiments.mjs";
/* L'ouverture du mode et la bande de l'outil : rien d'autre ne l'importe.
   Chargée ici, elle confie l'ouverture du mode à la porte authentifiée
   (`acces-admin.mjs` `confieALAcces`). */
import "./bande-admin.mjs";
import { branchePlacementLibelles } from "./placement-libelles.mjs";
import { brancheRepriseEmplacements } from "./reprise-emplacements.mjs";
import { brancheNuancier } from "./nuancier.mjs";
/* L'outil de dessin confie en se chargeant aux aimants ce qu'ils lisent
   (`brancheAimants`) : ils ne s'importent donc plus d'ici. */
import { brancheOutilDessin } from "./outil-dessin.mjs";
/* Le panneau des calques : aucun autre module ne l'importe. Chargé ici, il
   confie son contenu à l'ordre de tracé (`ordre-trace.mjs`
   `construitPanneau`), et sa fenêtre de réorganisation vient avec lui. */
import "./pile.mjs";
import { brancheGestesAdmin } from "./gestes-admin.mjs";

/* La bibliothèque des halls de lieux connus, que la construction verse dans
   cette page seule, en données (`genere.js`, `outils/lieux.json`). Lue au
   lancement : la balise précède le script des modules. */
function lieux(){
  const el = document.getElementById("lieux");
  try { return el ? JSON.parse(el.textContent) : null; } catch (e) { return null; }
}

confieLancementAdmin({
  // les gestes de l'exploitant prennent leur rang dans la chaîne des appuis
  apresLesGestes: () => brancheGestesAdmin(),
  /* le nuancier, le placement des libellés, l'outil de dessin, la reprise et
     l'ajout d'emplacements, les halls d'un lieu connu, l'enregistrement de la
     configuration — dans l'ordre de leurs morceaux d'avant */
  apresLHabillage: () => {
    brancheNuancier();
    branchePlacementLibelles();
    brancheOutilDessin();
    brancheRepriseEmplacements();
    brancheBatiments({ lieux: lieux() });
    brancheEnregistrement();
  },
  // la carte de chaleur et la remise à zéro, puis le calage de la carte
  apresLaMesure: () => {
    brancheChaleur();
    brancheCalageCarte();
  },
  // la fenêtre d'accès et le menu du compte, une fois la page démarrée
  apresLeDemarrage: () => brancheAcces(),
});
lancePlan();
