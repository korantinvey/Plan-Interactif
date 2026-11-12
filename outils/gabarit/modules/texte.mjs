/* ============================================================
   Le texte : l'écrire dans la page, le découper, le ranger
   ============================================================ */

/** Un texte rendu inoffensif avant d'entrer dans du balisage.
 *
 *  L'apostrophe aussi, bien qu'aucun attribut du dépôt ne s'écrive entre
 *  apostrophes : `npm run html` prouve un morceau sûr dès qu'il passe par ici,
 *  sans regarder les guillemets qui l'entourent. Un `title='…'` écrit demain
 *  aurait été prouvé sûr à tort. */
export const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g,
  (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

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

/**
 * Un texte tel que la recherche le compare : en minuscules et sans accents.
 *
 * Le visiteur tape « cafe » sur un téléphone, ou « elec » faute de trouver
 * l'accent, et attend « Café » ou « Électricité » : la recherche ne doit pas
 * dépendre d'un accent oublié — ni d'un accent ajouté. Les deux côtés passent
 * donc par ici, le mot tapé comme ce qu'on y cherche. La décomposition (NFD)
 * sépare chaque lettre de ses signes, qu'on retire ; les ligatures, qui n'en
 * ont pas, se défont à la main — « oeuvre » trouve « Œuvre ».
 */
export const pourRecherche = (s) => String(s == null ? "" : s).toLowerCase()
  .normalize("NFD").replace(/\p{M}/gu, "")
  .replace(/œ/g, "oe").replace(/æ/g, "ae").replace(/ß/g, "ss");
