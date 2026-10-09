/* ============================================================
   Point d'entrée de la page du mot de passe

   Mêmes règles que `plan.mjs`. La page arrive sans session, depuis un
   courriel ; elle n'emprunte ni le socle de la console ni ses outils. Son
   code est un module (`mot-de-passe.mjs`), qui prend l'élément par son
   identifiant et les casiers de la console aux mêmes modules que la console
   et le plan : la page n'en garde que le branchement.
   ============================================================ */
import { brancheMotDePasse } from "./mot-de-passe.mjs";

Object.assign(globalThis, {
  brancheMotDePasse,
});
