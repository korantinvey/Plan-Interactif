/* ============================================================
   Point d'entrée de la console

   Mêmes règles que `plan.mjs` : ce qui reste du code soudé est un script
   classique, auquel ces noms sont confiés par l'objet global.

   La console en est sortie morceau par morceau : l'export (partagé avec le
   rapport), le vocabulaire de la correspondance des champs, la fenêtre
   d'avancement d'une synchronisation, l'icône de l'onglet, l'appel des
   fonctions du projet, le fuseau horaire, la synchronisation et les
   vignettes des logos, les comptes ; puis les salons eux-mêmes
   (`evenements.mjs`) et ce qui ne tenait qu'à eux — la fiche d'un salon, sa
   provenance, la fiche détail, la duplication ; enfin le socle commun avec
   le rapport (`socle-console.mjs`, `fenetre-console.mjs`) et l'écran de la
   console (`ecran-console.mjs`). Chacun importe ce qu'il appelle : ils ne
   se confient plus entre eux que ce qui bouclerait.

   Le code soudé ne garde que des branchements, à la place que leur code
   tenait — le socle (`_console-base.html`), l'export (`_export.html`),
   l'écran (`_console-js.html`) — et le démarrage de la page. Il ne reçoit
   donc que ce qu'il y appelle : les branchements, ce que le socle rappelle
   (`demarre`, `videEcran`), ce que l'export lit (`courant`, `selection`), et
   de quoi choisir le premier écran (`CFG`, `SESSION`, `ecranConfig`,
   `ecranConnexion`).
   ============================================================ */
import { CFG, SESSION, brancheSocle, ecranConfig, ecranConnexion } from "./socle-console.mjs";
import { brancheExport } from "./export.mjs";
import { vivants } from "./vivant.mjs";
import { selection, courant } from "./evenements.mjs";
import { brancheConsole, demarre, videEcran } from "./ecran-console.mjs";

Object.assign(globalThis, {
  brancheExport,
  courant,
  brancheSocle, ecranConfig, ecranConnexion,
  brancheConsole, demarre, videEcran,
});

/* Le salon ouvert est un état du module des salons, remplacé au chargement,
   au choix dans la liste, à la création et au rechargement : l'export le lit
   par son nom au moment du clic, toujours à jour. */
Object.defineProperties(globalThis, vivants({ selection: () => selection }, "poseEvenements"));

/* Le projet et la session sont des états du socle, qu'il est seul à
   remplacer — à la configuration, à la connexion, au renouvellement du jeton,
   à la déconnexion : le démarrage de la page les lit par leur nom. */
Object.defineProperties(globalThis, vivants({ CFG: () => CFG, SESSION: () => SESSION }, "poseSession"));
