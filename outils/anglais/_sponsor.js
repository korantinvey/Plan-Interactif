/* `outils/gabarit/_sponsor.html` — le générique du démarrage : ce que le
   visiteur lit au-dessus du logo, et le volet où l'exploitant choisit entre
   rien, la marque du produit et le logo d'un sponsor.

   « Générique » se dit « splash screen » dans l'écran, et non « title card » :
   c'est le mot qu'un exploitant anglophone reconnaît d'une application, et il
   décrit ce qu'il voit — un écran qui passe. */
module.exports = {
  // ce que le visiteur lit au-dessus du logo, et ce que l'image se dit
  "Avec le soutien de": "With the support of",
  "Partenaire officiel": "Official partner",
  "Sponsor officiel": "Official sponsor",
  "En partenariat avec": "In partnership with",
  "Logo du sponsor": "Sponsor logo",
  /* La mention de la marque et son nom ne changent pas de langue : « powered
     by » est l'usage dans les deux, et « Event2Map » est un nom propre. Les
     entrées restent, sans quoi le contrôle les signalerait à chaque
     construction. */
  "powered by": "powered by",
  "Event2Map": "Event2Map",

  // le volet des réglages
  "Ce que le visiteur voit le temps que le plan s'affiche, puis qui s'efface de lui-même. C'est le seul écran que tous les visiteurs traversent — chaque visite comptée dans le rapport d'utilisation le voit — et il ne retarde personne : l'attente qu'il occupe avait lieu de toute façon. Publiez la configuration pour que le changement leur parvienne.":
    "What the visitor sees while the map appears, then fading away on its own. It is the one screen every visitor goes through — every visit counted in the usage report sees it — and it holds nobody up: the wait it fills was happening anyway. Publish the configuration for the change to reach them.",

  // les trois modes
  "Le plan s'ouvre droit sur le hall.": "The map opens straight onto the hall.",
  "Le logo Event2Map": "The Event2Map logo",
  "Avec la mention « powered by ». Rien à déposer, rien à régler.":
    "With the words “powered by”. Nothing to upload, nothing to set.",
  "Le logo d'un sponsor": "A sponsor's logo",
  "Celui d'un partenaire du salon, avec son nom et son lien.":
    "A show partner's, with their name and their link.",

  // les champs du sponsor
  "Réduite puis enregistrée avec la configuration du plan : elle part avec lui, sans dépendre d'un fichier hébergé ailleurs. Glissez-la sur la vignette, ou choisissez-la. Elle se pose sur le fond du plan, qui suit le thème clair ou sombre du visiteur tant qu'aucune couleur n'est réglée dans « Apparence » : un logo dessiné en noir sur fond transparent y disparaîtra la moitié du temps.":
    "Resized, then saved with the map's configuration: it travels with the map, without depending on a file hosted elsewhere. Drag it onto the thumbnail, or choose it. It sits on the map's background, which follows the visitor's light or dark theme as long as no colour is set under “Appearance”: a logo drawn in black on a transparent background will vanish there half the time.",
  "Nom du sponsor": "Sponsor name",
  "Écrit sous le logo. Laissez vide si le logo porte déjà le nom.":
    "Written under the logo. Leave it empty if the logo already carries the name.",
  "Mention au-dessus du logo": "Wording above the logo",
  "Choisie dans cette liste, et non écrite : le plan se lit aussi en anglais, et une phrase tapée ici n'y serait pas traduite.":
    "Picked from this list rather than typed: the map also reads in English, and a sentence typed here would not be translated there.",
  "Ouvert dans un nouvel onglet quand le visiteur touche le logo. Laissez vide pour que le générique ne mène nulle part.":
    "Opened in a new tab when the visitor taps the logo. Leave it empty for the splash screen to lead nowhere.",

  // la durée, commune aux deux modes qui montrent quelque chose
  "Durée du générique": "Splash screen length",
  "Comptée depuis l'ouverture de la page, et non depuis que le logo paraît : le chargement est compris dedans. Le logo s'efface dès que le plan est là et que ces secondes sont passées. Sur le plan public et sur la borne, jamais dans l'administration ; un doigt posé dessus l'efface aussitôt, et une panne de chargement aussi.":
    "Counted from the moment the page opens, not from the moment the logo appears: loading is included in it. The logo fades as soon as the map is there and those seconds have passed. On the public map and on the kiosk, never in the admin view; a finger on it clears it at once, and so does a loading failure.",
};
