/* ============================================================
   Point d'entrée du rapport — et son démarrage

   Le rapport partage le socle de la console (`socle-console.mjs`,
   `fenetre-console.mjs`) mais pas ses outils. L'export du classeur est le
   même module que celui de la console, branché de la même façon : les deux
   boutons rendent le même fichier.

   L'écran lui-même est un module, `rapport-utilisation.mjs` : il importe ce
   qu'il prend à l'export (canaux, formatage, l'export lui-même) et au socle
   (l'appel à la base, la session, la barre d'état, la brique d'un bloc,
   l'adresse des pages).

   Il n'y a plus de code soudé : les branchements que la page gardait se font
   ici, dans l'ordre où elle les faisait, et le script de ce point d'entrée
   est posé après tout le balisage (`genere.js` `poseModulesSeuls`), là où se
   tenait le sien. Rien n'est donc plus confié à l'objet global.
   ============================================================ */
import { brancheSocle, premierEcran } from "./socle-console.mjs";
import { brancheExport } from "./export.mjs";
import { selection, courant, demarre, videEcran, brancheRapport } from "./rapport-utilisation.mjs";

/* Le socle en tête, comme dans la console ; il reçoit ce que le rapport fait
   après la connexion et à la déconnexion. */
brancheSocle({ demarre, videEcran });

/* Le salon lu, que l'export demande au moment du clic : la liaison importée
   suit chaque choix dans la barre, que le module seul remplace. */
brancheExport({ selection: () => selection, courant: () => courant() });

/* Les commandes de la barre. */
brancheRapport();

premierEcran();
