/* ============================================================
   Point d'entrée de la page du mot de passe — et son démarrage

   La page arrive sans session, depuis un courriel ; elle n'emprunte ni le
   socle de la console ni ses outils. Son code est un module
   (`mot-de-passe.mjs`), qui prend l'élément par son identifiant et les
   casiers de la console aux mêmes modules que la console et le plan.

   Il n'y a plus de code soudé : le branchement que la page gardait se fait
   ici, et le script de ce point d'entrée est posé après tout le balisage
   (`genere.js` `poseModulesSeuls`), là où se tenait le sien — ses deux
   formulaires existent déjà quand il les pose.
   ============================================================ */
import { brancheMotDePasse } from "./mot-de-passe.mjs";

brancheMotDePasse();
