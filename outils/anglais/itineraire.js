/* `outils/gabarit/modules/itineraire.mjs` — le calcul de l'itinéraire : les
   rôles des calques, les passages d'un plan à l'autre, les morceaux de trajet
   qui n'ont pas pu être tracés, et les distances, les durées et les passages
   tels que le trajet les dit. */
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
  "≈ {n} min": "≈ {n} min",

  // ce qu'une étape de passage dit au visiteur
  "Comptez {duree}.": "Allow {duree}.",
  "Changement de pavillon": "Change of hall",
  "Sortez du {de} par « {porte} », puis entrez dans le {vers} par « {porteVers} ».":
    "Leave {de} through “{porte}”, then enter {vers} through “{porteVers}”.",
  "Prenez {passage} « {nom} » : vous arrivez dans le {vers}.":
    "Take {passage} “{nom}”: you come out in {vers}.",
  "Prenez {passage} « {nom} » : vous arrivez dans le {vers}, « {nomVers} ».":
    "Take {passage} “{nom}”: you come out in {vers}, at “{nomVers}”.",
};
