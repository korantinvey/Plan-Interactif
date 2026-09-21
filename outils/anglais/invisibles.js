/* Ce que `outils/traductions.js` prend pour une phrase affichée, et qui n'a
   pourtant rien à faire seul dans le dictionnaire : une valeur tenue par le
   code, un mot que la page ne montre jamais tel quel, ou ce qu'une autre règle
   traduit déjà.

   Chaque entrée dit pourquoi elle est là : une chaîne déclarée invisible à
   tort resterait en français sans que le contrôle le signale plus jamais. */
module.exports = [
  // `_environs.html` : le corps de la requête Overpass, qui part au serveur
  // et ne s'affiche jamais
  "[out:json][timeout:60][bbox:",
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
  // `_ici.html` : un morceau de la transformation SVG qui porte le damier du
  // code à sa place sur l'affiche
  ") scale(",

  // `_console-js.html` : le paramètre que le lien de la console ajoute à
  // l'adresse du plan pour l'ouvrir en borne — une adresse ne se traduit pas
  "&borne",

  // `_webgl.html` : l'empreinte de la bibliothèque, du code de shader, le nom
  // d'une extension, des suffixes d'identifiants de couches, une valeur
  // d'attribut SVG et des classes de libellés — rien de tout cela ne s'affiche
  "sha384-n9TufhIL8BMsQ8I/frAQGFsg2D/50T9gjWMitdG+F1HtTxSz62ol4tnA1nXOoeun",
  "z >= instanceZoomFiltre.z", "z < instanceZoomFiltre.z",
  "if (z < instanceZoomFiltre.x || z >= instanceZoomFiltre.y || ",
  "FiltreZoom", "-petit", "-grand", "-pleins-", "-textes-", "-image-",
  "xMidYMid meet", "zn masquee", "zn sel masquee", "-noms-",
  "TiretsQuiDefilent", "if (uniteDefile > 0.0 && ",
  "-petit-halo-", "-phare-", "-defile", "lbl phare", "lbl pick", "-lueur", "gl-pret", "gl-attente",
  "LissageSdf",

  // `_rappels.html` : le motif de deux pannes internes, porté par une
  // exception que la page rattrape sans jamais l'afficher — ce que le visiteur
  // lit alors est « Le rappel n'a pas pu être posé », qui a sa clé
  "clé indisponible", "clé absente",

  // `_installation.html` : deux morceaux de l'adresse `intent://` qui réveille
  // l'application installée — des noms qu'Android lit, et que rien n'affiche
  ";action=android.intent.action.VIEW",
  ";category=android.intent.category.BROWSABLE;end",

  // `_js.html` : le sélecteur qui reconnaît, dans l'en-tête d'un tiroir, ce qui
  // se clique — et que la prise du tiroir doit donc laisser tranquille
  "button,a,input,select,textarea,label,[role=tab]",
  // `_admin1.html` : les suffixes des jetons de teinte d'une distinction,
  // « --d-neuf-doux » et « --d-neuf-ink », composés nom par nom
  "-doux", "-ink",
];
