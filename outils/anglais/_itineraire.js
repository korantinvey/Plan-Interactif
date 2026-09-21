/* `outils/gabarit/_itineraire.html` — l'itinéraire d'un point du salon à un
   autre : les rôles des calques, le tiroir, le trajet et ce qu'il en dit. */
module.exports = {
  // le rôle d'un calque dans le calcul
  "Aucun": "None",
  "Infranchissable": "Impassable",
  "Infranchissable en fauteuil": "Impassable in a wheelchair",
  "Infranchissable sauf PMR": "Impassable except for reduced mobility",
  "Où l'on peut marcher": "Where people can walk",

  "salle de conférence": "conference room",
  "repère": "landmark",

  // les passages d'un plan à l'autre
  "porte": "door",
  "la porte": "the door",
  "escalier": "stairs",
  "l'escalier": "the stairs",
  "escalator": "escalator",
  "l'escalator": "the escalator",
  "ascenseur": "lift",
  "l'ascenseur": "the lift",

  "Le chemin dans le {plan} n'a pas pu être tracé : cette partie du trajet manque à l'écran.":
    "The path in {plan} could not be drawn: this part of the route is missing on screen.",
  "La sortie du {plan} n'est pas repérée sur le plan : cette partie du trajet n'est pas tracée.":
    "The exit from {plan} is not marked on the map: this part of the route is not drawn.",
  "L'entrée du {plan} n'est pas repérée sur le plan : cette partie du trajet n'est pas tracée.":
    "The entrance to {plan} is not marked on the map: this part of the route is not drawn.",

  // les distances et les durées : le nombre change d'écriture, « 1,2 km » devient « 1.2 km »
  "{n} m": "{n} m",
  "{n} km": "{n} km",
  "≥ {distance}": "≥ {distance}",
  "≈ {n} min": "≈ {n} min",

  // le tiroir
  "Touchez le plan à l'endroit où cette borne est posée.":
    "Touch the map where this kiosk stands.",
  "Choisissez votre destination : le trajet part de cette borne.":
    "Choose where you are going: the route starts from this kiosk.",
  "Aucun stand, zone ni repère ne porte ce nom.": "No stand, area or landmark has this name.",
  "Tapez le nom ou le numéro d'un stand.": "Type a stand name or number.",
  "Comptez {duree}.": "Allow {duree}.",
  "Changement de pavillon": "Change of hall",
  "Sortez du {de} par « {porte} », puis entrez dans le {vers} par « {porteVers} ».":
    "Leave {de} through “{porte}”, then enter {vers} through “{porteVers}”.",
  "Prenez {passage} « {nom} » : vous arrivez dans le {vers}.":
    "Take {passage} “{nom}”: you come out in {vers}.",
  "Prenez {passage} « {nom} » : vous arrivez dans le {vers}, « {nomVers} ».":
    "Take {passage} “{nom}”: you come out in {vers}, at “{nomVers}”.",
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
