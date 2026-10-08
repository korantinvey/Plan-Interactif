/* ============================================================
   Point d'entrée du rapport

   Le rapport partage le socle de la console (`_console-base.html`) mais pas
   ses outils : il ne reçoit que ce que ce socle et lui appellent. Mêmes
   règles que `plan.mjs` pour ce qui est confié au code soudé.
   ============================================================ */
import { $ } from "./dom.mjs";
import { esc, separeValeurs } from "./texte.mjs";
import { CLE_CFG, CLE_SESSION, contenuJeton, resteJeton, echangeSession, RESTE_JETON }
  from "./session.mjs";

Object.assign(globalThis, {
  $, esc, separeValeurs,
  CLE_CFG, CLE_SESSION, contenuJeton, resteJeton, echangeSession, RESTE_JETON,
});
