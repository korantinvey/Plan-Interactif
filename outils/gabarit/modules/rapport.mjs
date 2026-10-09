/* ============================================================
   Point d'entrée du rapport

   Le rapport partage le socle de la console (`_console-base.html`) mais pas
   ses outils : il ne reçoit que ce que ce socle et lui appellent. Mêmes
   règles que `plan.mjs` pour ce qui est confié au code soudé. L'export du
   classeur est le même module que celui de la console, branché par le même
   `_export.html` : les deux boutons rendent le même fichier.

   L'écran lui-même est un module, `rapport-utilisation.mjs` : il importe ce
   qu'il prend à l'export (canaux, formatage, l'export lui-même), que le code
   soudé n'appelle donc plus. Ne lui sont confiés que le branchement, ce que
   le socle rappelle (`demarre`, `videEcran`) et ce que l'export lit.
   ============================================================ */
import { $ } from "./dom.mjs";
import { separeValeurs } from "./texte.mjs";
import { CLE_CFG, CLE_SESSION, contenuJeton, resteJeton, echangeSession, RESTE_JETON }
  from "./session.mjs";
import { brancheExport } from "./export.mjs";
import { vivants } from "./vivant.mjs";
import { selection, courant, demarre, videEcran, brancheRapport } from "./rapport-utilisation.mjs";

Object.assign(globalThis, {
  $, separeValeurs,
  CLE_CFG, CLE_SESSION, contenuJeton, resteJeton, echangeSession, RESTE_JETON,
  brancheExport,
  courant, demarre, videEcran, brancheRapport,
});
/* Le salon lu, que l'export demande au moment du clic (`_export.html`) : un
   accesseur, la valeur changeant à chaque choix dans la barre. Le code soudé
   ne l'écrit jamais — le module seul le remplace, par les commandes que
   `brancheRapport` pose. */
Object.defineProperties(globalThis, vivants({ selection: () => selection }, "brancheRapport"));
