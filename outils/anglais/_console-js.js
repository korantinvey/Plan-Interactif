/* `outils/gabarit/_console-js.html` — la console multi-événements : la barre
   du haut, le choix du salon, ses liens, sa création. La fiche d'un salon, sa
   provenance, la fiche détail, la duplication, le fuseau horaire, la
   synchronisation et les comptes ont leurs modules, et leur dictionnaire :
   `fiche-evenement.js`, `provenance.js`, `fiche-detail.js`, `duplication.js`,
   `fuseau.js`, `synchronisation.js`, `comptes.js`. */
module.exports = {
  // la barre du haut
  "Publié": "Published",
  "Brouillon": "Draft",
  "brouillon": "draft",
  "Repasser en brouillon": "Switch back to draft",
  "Publier l'événement": "Publish event",
  "Supprimer l'événement ?": "Delete event?",
  "« {salon} », ses pavillons, son apparence et ses dessins seront définitivement perdus.":
    "“{salon}”, its halls, its appearance and its drawings will be permanently lost.",
  // la fenêtre « Nouvel événement » ; la fiche du salon le dit aussi
  "Nom de l'événement": "Event name",

  /* Composé par `modules/correspondance.mjs` `intituleSuite`, mais rangé ici :
     un modèle sans attache fixe à ses bords est essayé dans l'ordre du
     dictionnaire, et le déplacer changerait son rang dans chaque page. */
  "{champs}, puis {suite}": "{champs}, then {suite}",

  // les liens vers le plan, la création, le rechargement
  "L'événement est en brouillon : le plan public n'est pas encore servi.": "The event is a draft: the public map is not served yet.",
  "Le plan sur un écran posé dans le salon : il demande où il est, puis les itinéraires en partent":
    "The map on a screen installed at the venue: it asks where it stands, then routes start from there",
  "Ouvrir le plan tel que le voient les visiteurs": "Open the map as visitors see it",
  "Ouvrir le plan avec les calques et les outils de dessin": "Open the map with the layers and drawing tools",
  "accessible même en brouillon": "available even as a draft",
  "Visites, recherches et fiches ouvertes": "Visits, searches and records opened",
  "Nouvel événement": "New event",
  "Création…": "Creating…",
  "Événement créé.": "Event created.",
  "Données rechargées.": "Data reloaded.",
  "Chargement impossible : {raison}": "Could not load: {raison}",
};
