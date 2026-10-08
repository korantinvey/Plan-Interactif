/* ============================================================
   Point d'entrée de la console et du rapport

   Mêmes règles que `plan.mjs` : le socle commun (`_console-base.html`) et ce
   qui le suit restent un script classique, auquel ces noms sont confiés par
   l'objet global. Ce sont les mêmes fonctions que celles du plan, et non plus
   des copies : un échappement corrigé ici l'est sur toutes les pages.
   ============================================================ */
import { $ } from "./dom.mjs";
import { esc, separeValeurs } from "./texte.mjs";

Object.assign(globalThis, { $, esc, separeValeurs });
