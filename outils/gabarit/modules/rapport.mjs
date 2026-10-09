/* ============================================================
   Point d'entrée du rapport

   Le rapport partage le socle de la console (`socle-console.mjs`,
   `fenetre-console.mjs`) mais pas ses outils : il ne reçoit que ce que son
   code soudé appelle. Mêmes règles que `plan.mjs` pour ce qui lui est confié.
   L'export du classeur est le même module que celui de la console, branché
   par le même `_export.html` : les deux boutons rendent le même fichier.

   L'écran lui-même est un module, `rapport-utilisation.mjs` : il importe ce
   qu'il prend à l'export (canaux, formatage, l'export lui-même) et au socle
   (l'appel à la base, la session, la barre d'état, la brique d'un bloc,
   l'adresse des pages). Ne sont confiés au code soudé que les branchements,
   ce que le socle rappelle (`demarre`, `videEcran`), ce que l'export lit, et
   de quoi ouvrir le premier écran (`premierEcran`).
   ============================================================ */
import { brancheSocle, premierEcran } from "./socle-console.mjs";
import { brancheExport } from "./export.mjs";
import { vivants } from "./vivant.mjs";
import { selection, courant, demarre, videEcran, brancheRapport } from "./rapport-utilisation.mjs";

Object.assign(globalThis, {
  brancheExport,
  courant, demarre, videEcran, brancheRapport,
  brancheSocle, premierEcran,
});
/* Le salon lu, que l'export demande au moment du clic (`_export.html`) : un
   accesseur, la valeur changeant à chaque choix dans la barre. Le code soudé
   ne l'écrit jamais — le module seul le remplace, par les commandes que
   `brancheRapport` pose. */
Object.defineProperties(globalThis, vivants({ selection: () => selection }, "brancheRapport"));
