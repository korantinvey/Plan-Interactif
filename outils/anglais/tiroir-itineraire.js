/* `outils/gabarit/modules/tiroir-itineraire.mjs` — l'itinéraire d'un point du
   salon à un autre : le tiroir, la visée, et ce que le bilan du trajet en dit.
   Le calcul et ses phrases sont dans `itineraire.js`. */
module.exports = {
  // le tiroir ; la distance d'un trajet coupé se dit au moins égale
  "≥ {distance}": "≥ {distance}",
  "Touchez le plan à l'endroit où cette borne est posée.":
    "Touch the map where this kiosk stands.",
  // la même visée, quand l'exploitant place un code « Vous êtes ici »
  "Touchez le plan à l'endroit où ce code sera affiché.":
    "Tap the map where this code will be displayed.",
  "Choisissez votre destination : le trajet part de cette borne.":
    "Choose where you are going: the route starts from this kiosk.",
  "Aucun stand, zone ni repère ne porte ce nom.": "No stand, area or landmark has this name.",
  "Tapez le nom ou le numéro d'un stand.": "Type a stand name or number.",
  "Changement de pavillon": "Change of hall",
  "Recherche du chemin…": "Finding the way…",
  "Choisissez un départ et une arrivée. Sans localisation, c'est vous qui dites d'où vous partez — l'entrée du hall, ou le stand devant lequel vous êtes.":
    "Choose a start and a destination. There is no location tracking: you say where you start from — the hall entrance, or the stand you are standing at.",
  "Vous y êtes déjà.": "You are already there.",
  "Le calcul n'a pas abouti sur cet appareil.": "The route could not be worked out on this device.",
  "Aucun chemin accessible ne relie ces deux points : les passages disponibles sont trop étroits, ou coupés par un escalier. Décochez l'option pour voir le trajet ordinaire.":
    "No accessible path links these two points: the available passages are too narrow, or cut off by stairs. Untick the option to see the standard route.",
  "Aucun chemin ne relie ces deux points sur ce plan.": "No path links these two points on this map.",
  "non tracé": "not drawn",
  "au moins {distance}": "at least {distance}",
  "hors trajet entre pavillons": "not counting the way between halls",
  "{n} passage": "{n} connection",
  "{n} passages": "{n} connections",
  "Le trajet contourne « {salle} » : sa conférence se termine à {heure}, et l'allée qui la borde va se remplir. Environ {distance} de plus.":
    "The route goes around “{salle}”: its conference ends at {heure}, and the aisle beside it is about to fill up. About {distance} further.",
  "Le trajet contourne « {salle} » : sa conférence commence à {heure}, et l'allée qui la borde va se remplir. Environ {distance} de plus.":
    "The route goes around “{salle}”: its conference starts at {heure}, and the aisle beside it is about to fill up. About {distance} further.",
  "Le trajet longe « {salle} », où une conférence se termine à {heure} — attendez-vous à du monde dans l'allée.":
    "The route runs along “{salle}”, where a conference ends at {heure} — expect crowds in the aisle.",
  "Le trajet longe « {salle} », où une conférence commence à {heure} — attendez-vous à du monde dans l'allée.":
    "The route runs along “{salle}”, where a conference starts at {heure} — expect crowds in the aisle.",
  "Sortez du {de}, rejoignez le {vers}.": "Leave {de} and go to {vers}.",
  "{distance} dans le pavillon": "{distance} in the hall",
  "tracé à l'écran": "shown on screen",
  "voir": "view",
  "Indiquez votre point de départ sur le plan.": "Tap your starting point on the map.",
  "Indiquez votre arrivée sur le plan.": "Tap your destination on the map.",
};
