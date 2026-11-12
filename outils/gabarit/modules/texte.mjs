/* ============================================================
   Le texte : l'écrire dans la page, le découper, le ranger
   ============================================================ */

/** Un texte rendu inoffensif avant d'entrer dans du balisage. */
export const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g,
  (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/**
 * Les valeurs d'un champ à choix, une par entrée, points-virgules défaits.
 *
 * Ni Klipso ni Eventmaker ne rendent une liste : ils joignent les valeurs
 * d'un champ à choix multiple dans une seule chaîne — « Nouveaux exposants;
 * Exposants internationaux ». Prise entière, elle ferait une valeur à cocher
 * de plus par combinaison, et aucune ne désignerait ce que l'exploitant vise.
 */
export const separeValeurs = (v) => [].concat(v)
  .filter((x) => x !== null && x !== undefined)
  .flatMap((x) => String(x).split(";"))
  .map((x) => x.trim()).filter(Boolean);

/* Comparer deux noms selon les règles du français demande un comparateur.
   `localeCompare` avec des options en rebâtit un à chaque appel : sur les
   milliers de comparaisons d'un tri, c'est lui qu'on paie, pas le tri. */
export const COLLATION = new Intl.Collator("fr", { numeric: true });
