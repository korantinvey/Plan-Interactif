/* Ce que `outils/traductions.js` prend pour une phrase affichée, et qui n'a
   pourtant rien à faire seul dans le dictionnaire : une valeur tenue par le
   code, un mot que la page ne montre jamais tel quel, ou ce qu'une autre règle
   traduit déjà.

   Chaque entrée dit pourquoi elle est là : une chaîne déclarée invisible à
   tort resterait en français sans que le contrôle le signale plus jamais. */
module.exports = [
  // `modules/encodeur-avif.mjs` : l'empreinte du module WebAssembly, que le
  // navigateur vérifie, et le message d'une erreur que la console rattrape
  // pour retomber sur le WebP — ni l'une ni l'autre ne s'affiche
  "sha384-05Hrg6MAEOyGEl+DBp138l7mH4bs/srHNfuLKY1bXS0R9WI/amgsW509B8FkaZWr",
  "encodeur AVIF indisponible",
  // `modules/recherche.mjs` : un morceau de l'adresse `data:` d'une vignette
  ";base64,",
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

  // `modules/tutoriel.mjs` : un morceau de la transformation CSS qui étire le voile
  "px) scale(",
  // `_ici.html` : un morceau de la transformation SVG qui porte le damier du
  // code à sa place sur l'affiche
  ") scale(",

  // `modules/ecran-console.mjs` : le paramètre que le lien de la console ajoute à
  // l'adresse du plan pour l'ouvrir en borne — une adresse ne se traduit pas
  "&borne",

  // `_webgl.html` : l'empreinte de la bibliothèque, du code de shader, le nom
  // d'une extension, des suffixes d'identifiants de couches, une valeur
  // d'attribut SVG et des classes de libellés — rien de tout cela ne s'affiche
  "sha384-2vx9QLYRDQOSjHJYMBs+6exoK/4mzV4tcLtK+O+UMgXzpj+prg4XRsogBgU0Rben",
  "z >= instanceZoomFiltre.z", "z < instanceZoomFiltre.z",
  // les noms des couches où les jetons se peignent ensemble
  "-jetons-plaques", "-jetons",
  // pourquoi le dessin rend la main au SVG, dit à la console seule
  "la boucle d'images s'est arrêtée", "contexte perdu",
  // la teinte des figurants, écrite en shader, et la raison d'un rafraîchissement
  // que la bibliothèque garde pour elle
  "const vec3 ", "] = vec3[", "vec3 teinte = partie == 0 ? FIG_BAS[int(instanceFigurant.x)]",
  "  : partie == 1 ? FIG_CHAUSSURES[int(instanceFigurant.w)]", "  : partie == 2 ? FIG_HAUT[int(instanceFigurant.x)]",
  "  : partie == 3 ? FIG_PEAU[int(instanceFigurant.y)]", "TeinteDesFigurants", "fin du geste",
  "if (z < instanceZoomFiltre.x || z >= instanceZoomFiltre.y || ",
  "FiltreZoom", "-petit", "-grand", "-pleins-", "-ombres-", "-volumes-", "-decor", "-decor-plat", "-hausse-", "-tot", "-contour", "labels-sans|", "labels-hausse|", "|caches|", "-traits-z-", "-textes-", "-image-",
  "xMidYMid meet", "zn masquee", "zn sel masquee", "-noms-",
  "TiretsQuiDefilent", "if (uniteDefile > 0.0 && ",
  "-petit-halo-", "-phare-", "-jeton-", "-plaque", "-defile", "lbl phare", "lbl pick", "-lueur", "gl-pret", "gl-attente",
  "LissageSdf",
  // `modules/logos-stands.mjs` : du code de shader et le nom de son extension
  "vFonduZoom = smoothstep(", "CasesEtFondu",

  // `modules/notifications.mjs` : le motif de deux pannes internes, porté par une
  // exception que la page rattrape sans jamais l'afficher — ce que le visiteur
  // lit alors est « Le rappel n'a pas pu être posé », qui a sa clé
  "clé indisponible", "clé absente",

  // `modules/installation.mjs` : deux morceaux de l'adresse `intent://` qui réveille
  // l'application installée — des noms qu'Android lit, et que rien n'affiche
  ";action=android.intent.action.VIEW",
  ";category=android.intent.category.BROWSABLE;end",

  // `_js.html` : le sélecteur qui reconnaît, dans l'en-tête d'un tiroir, ce qui
  // se clique — et que la prise du tiroir doit donc laisser tranquille
  "button,a,input,select,textarea,label,[role=tab]",
  // `_admin1.html` : les suffixes des jetons de teinte d'une distinction,
  // « --d-neuf-doux » et « --d-neuf-ink », composés nom par nom
  "-doux", "-ink",
  // `modules/donnees.mjs`, `modules/parcours.mjs` : des
  // erreurs de programmation, levées quand le code écrit un état par la mauvaise
  // porte — pour la console du développeur, jamais pour le visiteur
  "» n'est pas une donnée du plan", "» n'est pas un état du parcours",
  // `modules/comptes.mjs` : la même erreur, pour la porte du profil connecté
  "» n'est pas un état du profil connecté",
  // `modules/evenements.mjs` : la même erreur, pour la porte des salons de la console
  "» n'est ni EVTS, ni selection, ni PLANS",

  // `modules/recherche.mjs` : un morceau de l'attribut qui donne son rang à
  // une ligne de la liste dans la cascade d'entrée — du balisage, pas un texte
  'entre" style="--r:',

  // `modules/releve.mjs` : les noms de deux extensions WebGL que le relevé
  // des performances demande, et la pastille de l'instrument, `?perf`, que
  // seul celui qui mesure voit — « fps » se lit pareil dans les deux langues
  "WEBGL_debug_renderer_info", "WEBGL_lose_context", " fps · ",
];
