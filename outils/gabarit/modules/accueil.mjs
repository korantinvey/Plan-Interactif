/* ============================================================
   Point d'entrée de la page d'accueil — la racine

   Mêmes règles que `plan.mjs`. La page ne fait qu'aiguiller : son code est un
   module (`aiguillage.mjs`), et la page n'en garde que le branchement.
   ============================================================ */
import { brancheAiguillage } from "./aiguillage.mjs";

Object.assign(globalThis, {
  brancheAiguillage,
});
