/* `outils/gabarit/modules/trajet.mjs` — le trajet complet : les repères, les
   passages d'un plan à l'autre, et les morceaux de trajet qui n'ont pas pu
   être tracés. */
module.exports = {
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
};
