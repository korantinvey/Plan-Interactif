/* ============================================================
   L'appareil de l'équipe

   Le salon s'ouvre, l'équipe le teste sur le plan public, et le rapport compte
   ses propres ordinateurs parmi les visiteurs : le premier jour de FUNEXPO
   2026, quatre testeurs pesaient dans seize « visiteurs » sans qu'aucun
   chiffre permette de les retirer — la mesure est anonyme, et doit le rester.

   Ce qui distingue un appareil de l'équipe ne tient donc pas à la personne
   mais au poste : il a ouvert l'administration ou la console. Ces pages y
   posent une marque, que la mesure du plan public lit pour ne plus compter cet
   appareil (`mesure.mjs`). La session elle-même vaut marque : un poste connecté
   avant que la marque existe n'a pas à rouvrir l'administration pour cesser de
   compter.

   Un module neutre, sans import : le plan public le lit sans recevoir le code
   de l'exploitant, la console et l'administration l'écrivent sans recevoir la
   mesure. Il garde aussi le nom du casier de la session, que `session.mjs`
   reprend : la règle « ce poste a une session » n'est écrite qu'une fois.

   Ce que la marque ne voit pas : le plan posé en cadre dans la page d'un site
   tiers. Le navigateur y range le stockage à part, par site hôte, et la marque
   écrite sur notre domaine n'y paraît pas. Sur ce site-là, un testeur coche
   une fois « Ne pas mesurer mes visites » dans la notice de confidentialité.
   ============================================================ */

/** Le casier de la session de l'exploitant, partagé par la console et le plan. */
export const CLE_SESSION = "console-session";

/* Une seule clé pour tous les salons : le poste de l'exploitant l'est pour
   chacun d'eux. Elle ne porte aucun identifiant, seulement le fait. */
const CLE_EQUIPE = "plan-appareil-equipe";

/** Ce poste a-t-il servi à administrer un salon. */
export function estAppareilEquipe(){
  try {
    return localStorage.getItem(CLE_EQUIPE) === "1" || !!localStorage.getItem(CLE_SESSION);
  } catch (e) { return false; }
}

/** Retenir que ce poste est celui de l'équipe. Sortir de la session ne
 *  l'efface pas : le poste reste celui de l'exploitant. */
export function marqueAppareilEquipe(){
  try { localStorage.setItem(CLE_EQUIPE, "1"); } catch (e) {}
}
