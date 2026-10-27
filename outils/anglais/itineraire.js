/* `outils/gabarit/modules/itineraire.mjs` — l'entrée du calcul de
   l'itinéraire : les distances, les durées et les passages tels que le trajet
   les dit. Les rôles des calques, les liaisons et les morceaux non tracés ont
   leur fichier : `grille-marche.js`, `abords-salles.js`, `trajet.js`. */
module.exports = {
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
