/* `outils/gabarit/_environs.html` — le fond de carte sous le pavillon : le
   choix du fond, la palette de calage, et ce que la carte répond quand elle
   ne répond pas. */
module.exports = {
  // les fonds proposés, et ce que chacun oblige à citer
  "Sobre (notre style)": "Plain (our own style)",
  "Sobre sombre (notre style)": "Plain dark (our own style)",
  "Vectoriel sobre (service libre)": "Plain vector (free service)",
  "Vectoriel détaillé (service libre)": "Detailed vector (free service)",
  "Vectoriel sobre (autre service libre)": "Plain vector (other free service)",
  "Plan IGN": "IGN map",
  "Vue aérienne": "Aerial view",
  "OpenStreetMap": "OpenStreetMap",
  "Aucun": "None",
  "Fond de plan © les contributeurs d'OpenStreetMap, © VersaTiles":
    "Base map © OpenStreetMap contributors, © VersaTiles",
  "Fond de plan © les contributeurs d'OpenStreetMap, © OpenFreeMap":
    "Base map © OpenStreetMap contributors, © OpenFreeMap",
  "Fond de plan © les contributeurs d'OpenStreetMap":
    "Base map © OpenStreetMap contributors",
  "Fond de plan © IGN — Géoplateforme": "Base map © IGN — Géoplateforme",
  "Vue aérienne © IGN — Géoplateforme": "Aerial view © IGN — Géoplateforme",

  // la palette de calage
  "Fond": "Base map",
  "Rotation": "Rotation",
  "Discrétion": "Subtlety",
  "Naviguer": "Pan",
  "Déplacer": "Move",
  "Tourner": "Rotate",
  "Le plan répond comme d'habitude": "The map behaves as usual",
  "Glissez la carte sous le plan": "Drag the base map under the floor plan",
  "Faites tourner la carte autour du milieu de l'écran":
    "Turn the base map around the centre of the screen",
  "Quart de tour": "Quarter turn",
  "Bâtiment suivant ({n}/{n2})": "Next building ({n}/{n2})",
  "À gauche le fond s'efface, à droite il reprend toute sa force":
    "To the left the base map fades, to the right it regains full strength",
  "Vider le hall sous le plan": "Clear the hall under the floor plan",
  "Autre style — laissez vide sinon": "Another style — leave empty otherwise",
  "Maintenez Majuscule pendant le glissement pour tourner sans changer de mode. Un plan dessiné l'entrée vers le bas fait tourner la carte avec lui : prenez un fond sans texte, ou la vue aérienne.":
    "Hold Shift while dragging to rotate without switching mode. A floor plan drawn with its entrance at the bottom turns the base map with it: pick a base map without text, or the aerial view.",
  "Ce fond est écrit dans la page. Le champ ci-dessus ne sert qu'à essayer autre chose — l'adresse d'un fichier de style MapLibre.":
    "This base map is written into the page. The field above is only for trying something else — the address of a MapLibre style file.",
  "Le champ ci-dessus ne sert qu'à essayer un autre style que celui du fond choisi. Par défaut : {url}":
    "The field above is only for trying a style other than the one of the chosen base map. Default: {url}",

  // le volet des réglages
  "Le plan est déjà en mètres, dans le repère du parc : il ne lui manque que de savoir où il tombe sur la Terre. Donnez-lui un point, et une carte vient se glisser sous le pavillon — les rues, les accès, les parkings, dessinés par ceux dont c'est le métier.":
    "The floor plan is already in metres, in the venue's own frame: all it lacks is knowing where it falls on Earth. Give it a point, and a base map slides under the hall — streets, entrances and car parks, drawn by people whose trade it is.",
  "Le réglage se fait ensuite sur le plan lui-même, dans une palette posée à côté : on cale en regardant la carte glisser sous le pavillon, et cette fenêtre-ci serait devant.":
    "Adjusting is then done on the floor plan itself, in a palette set beside it: you align by watching the base map slide under the hall, and this window would be in the way.",
  "Coordonnées du centre du salon": "Coordinates of the centre of the show",
  "Sur n'importe quelle carte, clic droit au milieu du bâtiment puis « copier les coordonnées ». À peu près suffit : l'accrochage au bâtiment fait le reste. Les tuiles sont chargées pendant la visite et gardées par le navigateur une fois vues ; la page à données figées, qui n'appelle rien au dehors, n'en affichera pas.":
    "On any map, right-click in the middle of the building then “copy the coordinates”. Roughly is enough: snapping to the building does the rest. Tiles are loaded during the visit and kept by the browser once seen; the frozen-data page, which calls nothing outside, will show none.",
  "Situer le salon": "Locate the show",
  "Régler sur le plan": "Adjust on the floor plan",
  "Retirer la carte": "Remove the base map",
  "Enregistrer pour tous": "Save for everyone",

  // ce qui se dit pendant qu'on cale
  "Il faut deux nombres à virgule, la latitude d'abord.":
    "Two decimal numbers are needed, latitude first.",
  "Ce salon n'a pas d'emprise : synchronisez-le d'abord.":
    "This show has no extent yet: synchronise it first.",
  "Recherche du bâtiment…": "Looking for the building…",
  "Calé sur un bâtiment de {n} m².": "Aligned on a building of {n} m².",
  "Aucun bâtiment à la bonne taille ici : tournez à la main.":
    "No building of the right size here: turn it by hand.",
  "Bâtiment non cherché ({raison}) : tournez à la main.":
    "Building not looked up ({raison}): turn it by hand.",
  "Enregistrement…": "Saving…",
  "Les visiteurs voient la carte.": "Visitors can see the base map.",
  "Retrait…": "Removing…",
  "La carte est retirée.": "The base map has been removed.",
  "Échec : {raison}": "Failed: {raison}",

  // ce que la carte répond quand elle ne répond pas
  "Chargement de la carte… {url}": "Loading the base map… {url}",
  "Carte chargée.": "Base map loaded.",
  "Carte vectorielle indisponible ({raison}) : prenez un fond en images.":
    "Vector base map unavailable ({raison}): pick a tiled one instead.",
  "Ce service ne répond pas : essayez un autre fond, ou collez l'adresse d'un style qui marche. Demandé : {url}":
    "This service is not answering: try another base map, or paste the address of a style that works. Requested: {url}",
  "Ce fond demande une clé : collez-la ci-dessus, ou prenez un fond sans clé.":
    "This base map requires a key: paste it above, or pick one that needs none.",
  "Adresse introuvable : le service a changé de chemin, collez-en une autre.":
    "Address not found: the service has changed its path, paste another one.",
  "Le fond vectoriel n'a pas répondu ({code})": "The vector base map did not answer ({code})",
  "Ces tuiles ne répondent pas : essayez un autre fond.":
    "These tiles are not answering: try another base map.",
  "bibliothèque chargée mais introuvable": "library loaded but not found",
  "bibliothèque de carte injoignable": "map library unreachable",
  "OpenStreetMap est injoignable depuis ce poste.":
    "OpenStreetMap is unreachable from this machine.",
  "OpenStreetMap est saturé : réessayez dans une minute.":
    "OpenStreetMap is overloaded: try again in a minute.",
  "OpenStreetMap a répondu {code}.": "OpenStreetMap answered {code}.",
  "aucune session : reconnectez-vous depuis la console.":
    "no session: sign in again from the console.",
  "la base ne connaît pas encore le calage : appliquez les migrations (`npm run bd`) ou attendez la mise en ligne.":
    "the database does not know about the alignment yet: apply the migrations (`npm run bd`) or wait for the next deployment.",

  // le bouton par calque, dans le panneau des couches
  "Percer le fond de carte : les surfaces de ce calque le laissent vide":
    "Punch through the base map: this layer's areas leave it blank",
  "Ne plus percer le fond de carte": "Stop punching through the base map",
};
