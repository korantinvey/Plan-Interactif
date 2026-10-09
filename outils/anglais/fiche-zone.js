/* `outils/gabarit/modules/fiche-zone.mjs` — la fiche d'une zone organisateur :
   son formulaire, ses salles de conférence, son logo, l'éditeur de sa
   description, son enregistrement et son masquage.

   Les mots que d'autres réglages emploient aussi — « Retirer », « Poser », le
   cadre de dépôt d'un logo — restent dans `_admin1.js`, avec eux. */
module.exports = {
  "Le nom de la zone, sur le plan comme sur sa fiche. Laissez vide pour revenir au nom d'origine, s'il y en a un.":
    "The area's name, on the map and in its details. Leave empty to go back to the original name, if there is one.",
  "Agora, Halte-garderie, Pitch Retail…": "Agora, Crèche, Pitch Retail…",
  "Libellé en français": "Label in French",
  "Libellé en anglais": "Label in English",
  "Le nom de la zone dans la version anglaise du plan. Laissé vide, c'est le libellé en français qui s'y affiche.":
    "The area's name in the English version of the map. Left empty, the French label is shown there.",
  "Agora, Childcare, Pitch Retail…": "Agora, Childcare, Pitch Retail…",
  "Description en français": "Description in French",
  "Description en anglais": "Description in English",
  "Ce que lit le visiteur de la version anglaise. Laissée vide, la fiche anglaise montre la description en français.":
    "What visitors read in the English version. Left empty, the English details show the French description.",
  "Ouvre l'entrée correspondante dans le cartouche des points d'intérêt, au bas du plan : le visiteur y retrouve d'un geste toutes les zones du même type. Sans type, la zone reste sur le plan comme aujourd'hui.":
    "Opens the matching entry in the points of interest panel, at the bottom of the map: visitors find all areas of the same type there in one tap. Without a type, the area stays on the map as it is today.",
  "L'itinéraire peut la traverser": "Routes can go through it",
  "Les trajets coupent par cette zone au lieu d'en faire le tour. À cocher sur un accueil, une agora, une esplanade — tout sol qu'on franchit à pied. À laisser décoché sur une réserve, un local technique, un espace clos : le trajet les contourne, comme un stand.":
    "Routes cut through this area instead of going around it. Tick it for a reception, an agora, a forecourt — any floor people walk across. Leave it unticked for a storeroom, a service room, an enclosed space: the route goes around them, like a stand.",
  "Ce qu'on trouve dans cette zone, ses horaires, ses conditions d'accès. Le libellé « Description » ne paraît sur la fiche que si vous en écrivez une.":
    "What you find in this area, its opening hours, how to get in. The “Description” heading only appears in the details if you write one.",
  "Une page où en savoir plus. Elle s'ouvre dans un nouvel onglet, et n'apparaît sur la fiche que si vous en donnez une.":
    "A page to find out more. It opens in a new tab, and only appears in the details if you give one.",
  "trouvée automatiquement": "found automatically",
  "choisie à la main": "chosen by hand",
  "rattachée à {zone}": "linked to {zone}",
  "à situer": "to be located",
  "Salles de conférence": "Conference rooms",
  "Le programme du salon, salle par salle. Cochez celles qui se tiennent dans cette zone : leurs conférences paraissent aussitôt sur sa fiche. Un rattachement choisi ici n'est plus modifié par les synchronisations suivantes.":
    "The show's programme, room by room. Tick the ones located in this area: their conferences appear straight away in its details. A link chosen here is no longer changed by later synchronisations.",
  "une zone absente du plan": "an area not on the map",
  "une zone sans nom": "an unnamed area",
  "L'image paraît dans l'en-tête de la fiche, au-dessus du type et du nom. Elle est réduite puis enregistrée dans la fiche : elle part avec le plan, sans dépendre d'un fichier hébergé ailleurs. Glissez-la sur la vignette, ou choisissez-la.":
    "The image appears at the top of the details, above the type and the name. It is reduced then saved in the details: it travels with the map, without depending on a file hosted elsewhere. Drag it onto the thumbnail, or choose it.",
  "Gras": "Bold",
  "Italique": "Italic",
  "Liste à puces": "Bulleted list",
  "Liste numérotée": "Numbered list",
  "Description de la zone": "Area description",
  "Ce qu'on trouve dans cette zone, ses horaires…": "What you find in this area, its opening hours…",
  "Poser un lien sur le texte choisi": "Add a link to the selected text",
  "Enregistrement de la zone impossible : {raison}": "Could not save the area: {raison}",
  "Changement impossible : {raison}": "Change failed: {raison}",
};
