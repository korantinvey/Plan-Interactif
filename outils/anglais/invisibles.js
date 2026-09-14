/* Ce que `outils/traductions.js` prend pour une phrase affichée, et qui n'a
   pourtant rien à faire seul dans le dictionnaire : une valeur tenue par le
   code, un mot que la page ne montre jamais tel quel, ou ce qu'une autre règle
   traduit déjà.

   Chaque entrée dit pourquoi elle est là : une chaîne déclarée invisible à
   tort resterait en français sans que le contrôle le signale plus jamais. */
module.exports = [
  // les noms de mois de `_js.html` : `_langue.js` traduit les dates entières,
  // « samedi 14 mars 2026 », sans passer par le dictionnaire
  "février", "août", "décembre",

  // `_admin2.html` : le mot d'un en-tête HTTP, `Authorization: Bearer …`
  "Bearer",
  // un morceau de l'adresse des feuilles de police
  ":wght@",

  // `_suggestion.html` : des morceaux de la phrase de la suggestion, jamais
  // affichés seuls — la phrase entière a sa clé dans `_suggestion.js`
  "du secteur", "de la ville", "du pays", "de la nomenclature", "de la thématique",

  // `_tutoriel.html` : un morceau de la transformation CSS qui étire le voile
  "px) scale(",

  // `_console-js.html` : le paramètre que le lien de la console ajoute à
  // l'adresse du plan pour l'ouvrir en borne — une adresse ne se traduit pas
  "&borne",
];
