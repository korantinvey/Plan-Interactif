/* ============================================================
   L'aiguillage de la racine — où mène l'adresse nue

   La page d'accueil n'a rien à montrer : elle renvoie ailleurs, et seul son
   lien de secours se voit le temps de la redirection. Sortie de `_index.html` ;
   son point d'entrée (`accueil.mjs`) la branche, posé après le balisage.
   ============================================================ */

/**
 * La racine mène à la console. Un identifiant de plan dans l'adresse mène au
 * plan correspondant : les liens partagés continuent de fonctionner.
 *
 * Sauf si l'adresse porte un jeton de courriel. Supabase, quand il ne
 * reconnaît pas l'adresse de retour demandée, se replie sans le dire sur le
 * « Site URL » du projet — c'est-à-dire ici. Le jeton qu'il dépose ne vaut
 * que pour la page qui pose un mot de passe ; l'envoyer à la console, c'était
 * présenter un écran de connexion à qui vient justement d'en perdre la clé.
 * Ce repli-ci ne dépend d'aucun réglage : le lien aboutit tant que le domaine
 * est le bon.
 */
export function brancheAiguillage(){
  const q = new URLSearchParams(location.search);
  const h = new URLSearchParams((location.hash || "").replace(/^#/, ""));
  const type = h.get("type") || q.get("type") || "";
  const jeton = (h.get("access_token") || q.get("token_hash") || q.get("token")) &&
    (type === "recovery" || type === "invite" || type === "signup");
  const souci = h.get("error_description") || q.get("error_description");

  const slug = q.get("plan");
  /* La langue demandée suit la redirection : un lien « ?plan=…&lang=en »
     imprimé pour les visiteurs étrangers doit ouvrir le plan en anglais. */
  const langue = q.get("lang") ? "lang=" + encodeURIComponent(q.get("lang")) : "";
  const cible = (jeton || souci) ? "motdepasse" + location.search + location.hash
    : slug ? "plan?plan=" + encodeURIComponent(slug) + (langue && "&" + langue) + location.hash
    : "admin-plans" + (langue && "?" + langue);
  /** @type {HTMLAnchorElement} */ (document.getElementById("secours")).href = cible;
  location.replace(cible);
}
