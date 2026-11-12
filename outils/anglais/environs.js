/* `outils/gabarit/modules/environs.mjs` — le fond de carte sous le pavillon :
   les fonds proposés et ce que chacun oblige à citer, et ce que la carte
   répond quand elle ne répond pas. */
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
  "Fond de plan © les contributeurs d'OpenStreetMap, © VersaTiles":
    "Base map © OpenStreetMap contributors, © VersaTiles",
  "Fond de plan © les contributeurs d'OpenStreetMap, © OpenFreeMap":
    "Base map © OpenStreetMap contributors, © OpenFreeMap",
  "Fond de plan © les contributeurs d'OpenStreetMap":
    "Base map © OpenStreetMap contributors",
  "Fond de plan © IGN — Géoplateforme": "Base map © IGN — Géoplateforme",
  "Vue aérienne © IGN — Géoplateforme": "Aerial view © IGN — Géoplateforme",

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
};
