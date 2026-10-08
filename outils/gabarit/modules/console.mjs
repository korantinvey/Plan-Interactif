/* ============================================================
   Point d'entrée de la console

   Mêmes règles que `plan.mjs` : le socle commun (`_console-base.html`) et ce
   qui le suit restent un script classique, auquel ces noms sont confiés par
   l'objet global. Ce sont les mêmes fonctions que celles du plan, et non plus
   des copies : un échappement corrigé ici l'est sur toutes les pages, et une
   vignette de logo se recadre selon la règle même du plan.
   ============================================================ */
import { $ } from "./dom.mjs";
import { esc, separeValeurs } from "./texte.mjs";
import { CLE_CFG, CLE_SESSION, contenuJeton, resteJeton, echangeSession, RESTE_JETON }
  from "./session.mjs";
import { vignetteDeLogo } from "./marque.mjs";

Object.assign(globalThis, {
  $, esc, separeValeurs,
  CLE_CFG, CLE_SESSION, contenuJeton, resteJeton, echangeSession, RESTE_JETON,
  vignetteDeLogo,
});
