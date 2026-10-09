/* ============================================================
   L'appel des fonctions du projet, depuis la console

   La console parle à la base de deux façons : par la table (`rest`, dans le
   socle), et par les fonctions du projet — les comptes, les vignettes des
   logos. Leur appel vit ici, avec ce qu'il faut dire d'un refus, pour que les
   modules qui les appellent (`comptes.mjs`, `synchronisation.mjs`) l'importent
   au lieu de l'attendre du code soudé. Le flux d'une synchronisation
   (`fluxFonction`) est resté dans la console, et lit le refus ici.

   Ce qui porte la session reste au socle (`_console-base.html`) : l'adresse
   du projet, qu'on peut changer en cours de route, l'appel qui renouvelle le
   jeton, et la déconnexion. La console les confie ici par `brancheFonctions`,
   à la place que ce code tenait.
   ============================================================ */

/** @type {{
 *   cfg: () => ({ url: string, anonKey: string }),
 *   appel: (url: string, options?: RequestInit) => Promise<Response>,
 *   deconnecte: (message?: string) => void,
 * }} */
let _console = {
  cfg: () => ({ url: "", anonKey: "" }),
  appel: async () => new Response(null, { status: 503 }),
  deconnecte: () => {},
};

/** Ce que la console confie aux appels : voir `_console`. L'adresse se lit au
 *  moment de l'appel — l'écran de configuration la remplace. */
export function brancheFonctions(branche) {
  _console = branche;
}

/**
 * Ce qu'il faut dire d'une fonction qui refuse.
 *
 * Deux refus portent le même numéro sans venir du même endroit. La fonction
 * s'explique dans `erreur` ; la passerelle, elle, écarte les jetons qu'elle
 * juge périmés avant même de l'appeler, et nomme son champ autrement. Faute de
 * lire les deux, un « Erreur 401 » nu tenait lieu d'explication — et la
 * session, elle, restait ouverte sur un jeton qui ne valait plus rien.
 */
export async function refus(r) {
  const j = await r.json().catch(() => ({}));
  /* Le jeton a déjà été renouvelé puis réessayé par `appel` : un 401 qui
     arrive jusqu'ici est une session bel et bien finie. */
  if (r.status === 401) {
    _console.deconnecte("Session expirée, reconnectez-vous.");
    return "Session expirée.";
  }
  return j.erreur || j.message || j.msg || "Erreur " + r.status;
}

export async function fonction(nom, corps) {
  const r = await _console.appel(_console.cfg().url + "/functions/v1/" + nom, {
    method: "POST",
    body: JSON.stringify(corps),
  });
  if (!r.ok) throw new Error(await refus(r));
  return await r.json().catch(() => ({}));
}
