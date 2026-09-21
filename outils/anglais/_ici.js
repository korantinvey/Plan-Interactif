/* `outils/gabarit/_ici.html` — le code affiché dans le hall : ce que le
   visiteur lit en arrivant par là, et ce que l'exploitant lit en le produisant. */
module.exports = {
  /* Côté visiteur : le rappel du bas de l'écran. « Vous êtes ici » se traduit
     déjà pour la borne, qui pose le même point — la clé vit dans `_borne.js`. */
  "Ce code désigne un endroit que ce plan ne connaît plus.":
    "This code points to a place this map no longer knows.",
  "Désactiver": "Turn off",
  "Fermer": "Close",

  /* Côté exploitant : la visée, puis la fenêtre du code. */
  "Touchez le plan à l'endroit où ce code sera affiché.":
    "Tap the map where this code will be displayed.",
  "Produire un code « Vous êtes ici »": "Create a “You are here” code",
  "Code « Vous êtes ici »": "“You are here” code",
  "Affichez ce code à cet endroit du salon : celui qui le photographie ouvre le plan déjà situé, et ses itinéraires partent d'ici.":
    "Display this code at that spot in the show: whoever scans it opens the map already located, and their routes start from here.",
  "Cette adresse est trop longue pour un code. Le lien, lui, fait le même travail : il ouvre le plan déjà situé à cet endroit.":
    "This address is too long for a code. The link does the same job: it opens the map already located at that spot.",
  "Code à photographier qui ouvre le plan à cet endroit":
    "Code to scan that opens the map at this spot",
  "La position tient dans l'adresse elle-même : il n'y a rien à enregistrer, et le code reste valable tant que l'endroit existe. Un code déjà affiché ne se corrige pas — refaites-en un si l'endroit change.":
    "The position lives in the address itself: there is nothing to save, and the code stays valid as long as the spot exists. A code already on display cannot be corrected — make a new one if the spot changes.",
  "Copier le lien": "Copy link",
  "Copié": "Copied",
  "Échec de la copie": "Copy failed",
  "Imprimer": "Print",
  "Télécharger l'affiche": "Download the poster",

  /* L'affiche quitte la page : elle part déjà traduite. */
  "Photographiez ce code": "Scan this code",
  "Le plan du salon s'ouvre à cet endroit.": "The show map opens at this spot.",
  "Vos itinéraires en partent.": "Your routes start from here.",
};
