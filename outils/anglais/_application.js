/* `outils/gabarit/_application.html` — l'icône et le nom de l'application
   installée : le volet où l'exploitant dépose le logo du salon, ou laisse
   celui du produit.

   « Écran d'accueil » se dit « home screen », et « rogner » « mask » : c'est
   le mot d'Android, celui que les icônes portent dans le manifeste
   (« maskable »), et celui qu'un exploitant anglophone reconnaît. */
module.exports = {
  /* La marque n'est pas traduite — c'est un nom propre, et celui que le relais
     écrit dans le nom de l'application. L'entrée reste, sans quoi le contrôle
     la signalerait à chaque construction. */
  "Event2Plan": "Event2Plan",

  // le bloc, dans l'onglet « Admin » des réglages
  "Le plan s'installe comme une application : l'icône qui se pose sur l'écran d'accueil du visiteur, et le nom écrit dessous. Les deux se lisent au moment de l'installation — un changement vaut pour qui installera ensuite, et rejoint les autres au lancement suivant. Enregistrés d'eux-mêmes, sans attendre la publication.":
    "The map installs like an app: the icon that lands on the visitor's home screen, and the name written under it. Both are read at install time — a change applies to whoever installs next, and reaches the others on their following launch. Saved on their own, without waiting for publication.",

  // les deux choix
  "L'icône Event2Map": "The Event2Map icon",
  "Celle du produit, la même pour tous les salons. Rien à déposer.":
    "The product's own, the same for every show. Nothing to upload.",
  "Le logo du salon": "The show's logo",
  "Déposé ici, il remplace l'icône du produit sur l'écran d'accueil.":
    "Uploaded here, it replaces the product icon on the home screen.",

  // l'aperçu : les deux formes qu'un système donne à une icône
  "Rognée par Android": "Masked by Android",

  // le dépôt du logo
  "Logo du salon": "Show logo",
  "Aucun logo déposé.": "No logo uploaded.",
  "Ramené à un carré de cinq cent douze pixels, puis enregistré avec l'événement : il ne part pas avec le plan — seule l'installation le demande. Une seconde version est fabriquée pour Android, qui rogne l'icône à la forme du système : le logo y est rentré dans la zone sûre, sur un fond tiré du logo lui-même. Glissez-le sur l'aperçu, ou choisissez-le. Un logo carré tient mieux qu'un logo en longueur, qui sera réduit pour tenir dans le rond. Revenir à l'icône du produit le retire : il n'est gardé nulle part en réserve.":
    "Resized to a 512-pixel square, then saved with the event: it does not travel with the map — only installing asks for it. A second version is built for Android, which masks the icon to the system's shape: there the logo is pulled inside the safe zone, on a background taken from the logo itself. Drag it onto the preview, or choose it. A square logo fares better than a wide one, which will be shrunk to fit the circle. Going back to the product icon removes it: it is not kept in reserve anywhere.",

  // le nom de l'application
  "Nom de l'application": "App name",
  "Écrit sous l'icône de l'écran d'accueil, et dans la fenêtre qui propose l'installation. Laissez vide pour le nom composé du salon et de la marque. La place est d'une douzaine de signes : au-delà, le système coupe — c'est le salon qu'on y cherche, pas une phrase.":
    "Written under the home screen icon, and in the window that offers to install. Leave it empty for the name made of the show and the brand. There is room for about a dozen characters: past that the system cuts — what people look for there is the show, not a sentence.",
  "Nom par défaut.": "Default name.",
};
