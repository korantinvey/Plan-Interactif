/* ============================================================
   Point d'entrée de la page d'accueil — la racine

   La page ne fait qu'aiguiller : son code est un module (`aiguillage.mjs`).
   Le branchement se fait ici, et le script de
   ce point d'entrée est posé après tout le balisage (`genere.js`
   `poseModulesSeuls`) — le lien de secours existe déjà quand il le réécrit.
   ============================================================ */
import { brancheAiguillage } from "./aiguillage.mjs";

brancheAiguillage();
