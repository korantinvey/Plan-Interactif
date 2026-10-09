/* `outils/gabarit/modules/fiche-evenement.mjs` — la fiche d'un salon dans la
   console : son identité, ses données, ses pavillons, son intégration, et la
   fenêtre de ses sources. */
module.exports = {
  // le rythme de rafraîchissement
  "Manuel uniquement": "Manual only",
  "Toutes les 15 minutes": "Every 15 minutes",
  "Toutes les heures": "Every hour",
  "Toutes les 6 heures": "Every 6 hours",
  "Une fois par jour": "Once a day",

  // la fiche du salon
  "Icône de l'onglet": "Tab icon",
  "Elle paraît dans l'onglet du plan public comme dans celui de l'administration, à côté du nom du salon. Réduite puis enregistrée avec l'événement, elle part avec le plan sans dépendre d'un fichier hébergé ailleurs. Un carré se reconnaît mieux à seize pixels qu'un logo en longueur. Glissez-la sur la vignette, ou choisissez-la.":
    "It appears in the browser tab of the public map and of the admin map, next to the show's name. Reduced and saved with the event, it travels with the map without depending on a file hosted elsewhere. A square is easier to recognise at sixteen pixels than a wide logo. Drag it onto the thumbnail, or choose it.",
  "Retrait…": "Removing…",
  "Connectez-vous pour accéder aux événements.": "Sign in to access the events.",
  "Aucun salon pour l'instant.": "No shows yet.",
  "Créez-en un avec « Nouveau ».": "Create one with “New”.",
  "Aucun salon ne vous a été affecté.": "No show has been assigned to you.",
  "Demandez l'accès à l'administrateur du projet.": "Ask the project administrator for access.",
  "Identité": "Identity",
  "Nom de l'événement": "Event name",
  "Identifiant d'URL": "URL identifier",
  "Sert d'adresse publique du plan.": "Used as the public address of the map.",
  "Données": "Data",
  "Provenance des données": "Data sources by domain",
  "Fiche détail": "Record details",
  "Rythme de rafraîchissement": "Refresh rate",
  "Synchroniser maintenant": "Synchronise now",
  "Synchronisation": "Synchronisation",
  "Pavillons": "Halls",
  "{n} publiés": "{n} published",
  "{n} publié": "{n} published",
  "Aucun pavillon connu. Lancez une synchronisation pour les récupérer.": "No known halls. Run a synchronisation to fetch them.",
  "Publier": "Publish",
  "Pavillon": "Hall",
  "Hall": "Hall no.",
  "Emplacements": "Stands",
  "Intégration": "Embedding",
  "Collez ce fragment dans la page du salon. Les visites qui en viennent se comptent à part, sous « Cadre sur un site », dans le rapport d'utilisation.":
    "Paste this snippet into the show's web page. Visits coming from it are counted separately, under “Frame on a website”, in the usage report.",
  "Copier": "Copy",
  "Échec": "Failed",

  // la fenêtre des sources
  "Format inattendu — un identifiant ressemble à « {exemple} ».": "Unexpected format — an ID looks like “{exemple}”.",
  "Alimente : {domaines}.": "Feeds: {domaines}.",
  "Aucun domaine n'utilise cette source pour le moment.": "No domain uses this source yet.",

  // le bouton des lignes « Provenance des données » et « Fiche détail »
  "Modifier": "Edit",

  // la dernière synchronisation
  "Dernière erreur : {erreur}": "Last error: {erreur}",
  "Dernière : {date}": "Last: {date}",
  "Jamais synchronisé.": "Never synchronised.",
};
