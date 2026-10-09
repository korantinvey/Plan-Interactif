/* `outils/gabarit/_admin1.html` — les options vendues à part, que l'onglet
   « Admin » écrit, et les mots que la fenêtre « Réglages du plan »
   (`reglages.js`), la fiche d'une zone et les modules sortis d'ici
   (`configuration.mjs`, `apparence.mjs`, `reglage-recherche.mjs`…)
   partagent avec eux. */
module.exports = {
  // un mot de l'onglet « Recherche » que la fiche emploie aussi — l'onglet
  // lui-même vit dans `reglage-recherche.js`
  "Produits": "Products",

  /* Les mots de la fiche d'exemple des aperçus (`apercus.js`) que les données
     d'un salon portent aussi — un pavillon, une thématique, un type de
     conférence : le plan public les traduisait par ce fichier, et doit
     continuer de le faire. */
  "Pavillon 2": "Hall 2",
  "Aménagement & second œuvre": "Fit-out & finishing works",
  "Menuiserie": "Joinery",
  "Agencement de boutique": "Shop fitting",
  "Réemploi": "Reuse",
  "Bois de pays": "Local timber",
  "Table ronde": "Round table",
  "Démonstration": "Demonstration",

  // les mots de l'onglet « Zones » que d'autres réglages emploient aussi — la
  // fenêtre, ses onglets et ses volets vivent dans `reglages.js`, ses aperçus
  // dans `apercus.js`
  "fiche": "details",
  "Logo": "Logo",
  "Ce que la fiche montre": "What the details show",
  "Enregistré.": "Saved.",
  "Échec : {raison}": "Failed: {raison}",
  "retirée du plan public": "removed from the public map",

  // les dates et les heures du salon, dans l'onglet « Plan »
  "min": "min",
  "Du": "From",
  "au": "to",
  "Ouverture": "Opening",

  // l'onglet « Fiche Stand » — le volet lui-même vit dans `reglage-fiche.js` ;
  // ces phrases-ci servent aussi à l'ordre des critères et aux aperçus
  "Aperçu": "Preview",
  "Monter": "Move up",
  "Descendre": "Move down",
  "Monter {champ}": "Move up {champ}",
  "Descendre {champ}": "Move down {champ}",
  "propre au salon": "specific to this show",

  // les mots de la fiche d'une zone que d'autres réglages emploient aussi — le
  // reste de la fiche vit dans `fiche-zone.js`, la bande de l'outil dans
  // `bande-admin.js`, la palette des libellés dans `placement-libelles.js`
  "Libellé": "Label",
  "Type": "Type",
  "ce fichier n'est pas une image": "this file is not an image",
  "fichier illisible": "unreadable file",
  "image illisible": "unreadable image",
  "image trop lourde, même réduite — un logo, pas une photo": "image too heavy, even reduced — a logo, not a photo",
  "Retirer": "Remove",
  "Aucun logo": "No logo",
  "Remplacer…": "Replace…",
  "Choisir un fichier…": "Choose a file…",
  "Lecture…": "Reading…",
  "{n} Ko": "{n} KB",
  "Poser": "Apply",

  // la visite guidée, dans l'onglet « Admin » — le reste vit dans `tutoriel.js`
  "Essayer": "Try it",

  /* Les options du plan, dans l'onglet « Admin » : ce que le salon a pris, et
     ce que fermer une option retire. */
  "Dessin des stands": "Drawing stands",
  "L'outil qui matérialise un exposant, ou l'une des enseignes qu'il héberge, sur sa part d'un emplacement. Fermée, l'outil reste dans la boîte à outils, grisé ; les découpages déjà tracés restent sur le plan.":
    "The tool that marks out an exhibitor, or one of the brands it hosts, on its share of a stand. Closed, the tool stays in the toolbox, greyed out; the shapes already drawn stay on the map.",
  "Ajout d'images liées à un stand": "Adding images tied to a stand",
  "Le rattachement d'une image du dessin à un exposant : le logo posé sur son emplacement ouvre sa fiche au toucher, celle de l'enseigne désignée même sur un stand partagé. C'est le lien qui se prend, non l'image : fermée, l'outil image reste et les images se posent comme n'importe quel dessin, mais le champ qui nomme l'exposant est grisé et plus aucune ne se relie. Celles qui l'étaient gardent leur lien.":
    "Tying a drawing's image to an exhibitor: a logo placed on their stand opens their details when touched, the named brand's even on a shared stand. It is the link that is bought, not the image: closed, the image tool stays and images are placed like any other drawing, but the field that names the exhibitor is greyed out, and none can be tied any more. Those already tied keep their link.",
  "Le bouton du tiroir du parcours, qui met en heures les stands et les conférences retenus et trace le trajet d'un bout à l'autre. Fermée, le bouton vous reste, grisé, et le visiteur ne l'a plus : son parcours reste une liste. Elle se calcule avec le moteur de l'itinéraire : la commande retirée plus haut emporte le bouton avec elle.":
    "The button in the visit plan drawer, which puts the stands and conferences picked into a timetable and traces the route from end to end. Closed, the button stays for you, greyed out, and the visitor no longer has it: their visit plan stays a list. It is worked out with the directions engine: unticking that command above takes the button with it.",
  "Programme de conférences": "Conference programme",
  "Les conférences du salon : le programme d'une zone, celles qu'un exposant anime sur sa fiche, la recherche par titre, les horaires que le parcours retient et les rappels qui vont avec. Fermée, le plan se comporte comme un salon qui n'a pas de programme — la synchronisation continue pourtant de le rapporter. Un visiteur qui rouvre le plan entre-temps perd de son parcours les conférences qu'il avait retenues : il ne garde que ce que le plan connaît encore.":
    "The show's conferences: an area's programme, the ones an exhibitor runs on their details, searching by title, the times the visit plan keeps and the reminders that go with them. Closed, the map behaves like a show that has no programme \u2014 the synchronisation keeps bringing it back all the same. A visitor who reopens the map meanwhile loses the conferences they had picked from their visit plan: it keeps only what the map still knows about.",
  "Recommandations sponsorisées": "Sponsored recommendations",
  "L'exposant de plus, proposé au visiteur quand plusieurs de ceux qu'il a retenus se ressemblent — le plus consulté du salon sur ce critère, ou celui que l'organisateur a désigné. Fermée, l'onglet « Suggestion » reste ici, grisé, et plus rien n'est proposé ; ce qui y était réglé est gardé.":
    "One more exhibitor, offered to a visitor when several of the ones they have picked look alike \u2014 the most viewed of the show on that criterion, or the one the organiser has named. Closed, the \u201cSuggestion\u201d tab stays here, greyed out, and nothing is offered any more; what was set there is kept.",

  /* Les deux endroits qui disent que l'option est fermée : la sorte
     « Conférences » de la recherche, et le rappel qui n'a plus d'heure. */
  "Le programme de conférences n'est pas pris sur ce salon.": "The conference programme is not taken on this show.",
};
