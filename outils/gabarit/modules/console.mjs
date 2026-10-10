/* ============================================================
   Point d'entrée de la console — et son démarrage

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

   Il n'y a plus de code soudé : la page n'avait gardé qu'un script de
   branchements, et ils se font ici, dans l'ordre où il les faisait. Le
   script de ce point d'entrée est posé après tout le balisage
   (`genere.js` `poseModulesSeuls`), là où se tenait l'autre : ce que chaque
   branchement pose au chargement trouve la page entière, comme avant. Rien
   n'est donc plus confié à l'objet global.
   ============================================================ */
import { brancheSocle, premierEcran } from "./socle-console.mjs";
import { brancheExport } from "./export.mjs";
import { selection, courant } from "./evenements.mjs";
import { brancheConsole, demarre, videEcran } from "./ecran-console.mjs";

/* Le socle d'abord, en tête : ce qu'il faisait au chargement — relire le
   projet et la session, poser la fenêtre, le thème, le menu du compte — se
   fait avant tout le reste. Il reçoit ce que la console fait après la
   connexion et à la déconnexion, qu'il ne peut importer : il sert aussi le
   rapport. */
brancheSocle({ demarre, videEcran });

/* L'export, partagé avec le rapport, lit au moment du clic le salon ouvert et
   sa ligne, que chaque écran tient à sa façon. Le salon ouvert est un état du
   module des salons, remplacé au choix dans la liste, à la création et au
   rechargement : la liaison importée le suit. */
brancheExport({ selection: () => selection, courant: () => courant() });

/* L'écran : les modules qui le rappellent reçoivent de quoi le faire, et les
   commandes de la barre se posent. */
brancheConsole();

premierEcran();
