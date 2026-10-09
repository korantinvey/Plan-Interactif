/* `outils/gabarit/modules/reglages.mjs` — la fenêtre « Réglages du plan », ses
   onglets, et les volets « Zones », « Plan » et « Co-Exposants ». Les mots que
   la fenêtre partage avec le reste du plan restent dans `_admin1.js`. */
module.exports = {
  // les onglets de la fenêtre
  "Plan": "Map",
  "Recherche": "Search",
  "Admin": "Admin",
  "Fiche Stand": "Stand details",
  "Apparence": "Appearance",
  "Zones": "Areas",
  "PMR": "Accessibility",
  "Co-Exposants": "Co-exhibitors",
  "Environs": "Surroundings",

  // l'onglet « Zones »
  "Ce que le visiteur lit sur une zone organisateur. La source n'en donne que le contour et parfois un nom : le reste s'écrit ici, et paraît sans attendre la prochaine synchronisation.":
    "What visitors read about an organiser area. The source only gives its outline and sometimes a name: the rest is written here, and shows up without waiting for the next synchronisation.",
  "traversée": "walk-through",
  "masquée": "hidden",
  "L'image déposée sur la zone, dans l'en-tête de sa fiche.": "The image uploaded for the area, at the top of its details.",
  "Ce qu'on trouve dans la zone, ses horaires, ses conditions d'accès. Elle ne paraît que sur les zones où elle est remplie.":
    "What you find in the area, its opening hours, how to get in. It only appears on areas where it has been filled in.",
  "La page où en savoir plus, saisie avec la description.": "The page to find out more, entered with the description.",
  "Le programme tenu dans la zone, par ordre chronologique.": "The programme held in the area, in chronological order.",
  "Les champs qu'une fiche de zone déroule, pour toutes les zones à la fois. Un champ décoché reste écrit : il cesse de paraître, et revient tel quel en le recochant.":
    "The fields an area's details show, for all areas at once. An unticked field stays written: it stops appearing, and comes back as it was when ticked again.",
  "Ces cases s'enregistrent dès qu'on les coche.": "These boxes are saved as soon as they are ticked.",
  "Ce que vous écrivez est enregistré en quittant la fiche.": "What you write is saved when you leave these details.",

  // l'onglet « Plan »
  "Ce qui règle la journée d'un visiteur. Publiez la configuration pour que le changement parvienne aux visiteurs.":
    "What shapes a visitor's day. Publish the configuration for the change to reach visitors.",
  "Temps de visite par stand": "Visiting time per stand",
  "Sert à organiser la journée d'un visiteur depuis son parcours : c'est ce qui décide combien de stands tiennent entre deux conférences.":
    "Used to plan a visitor's day from their visit plan: it decides how many stands fit between two conferences.",

  // l'onglet « Co-Exposants »
  "Les sociétés hébergées sur le stand d'un autre exposant. Publiez la configuration pour que le changement parvienne aux visiteurs.":
    "Companies hosted on another exhibitor's stand. Publish the configuration for the change to reach visitors.",
  "Aucun stand partagé sur ce salon pour l'instant. Les co-exposants se rattachent à leur hôte par la synchronisation : dans la console, désignez le champ « Rattachement des co-exposants » — celui où une fiche porte le numéro du stand qui l'accueille —, puis synchronisez.":
    "No shared stand at this show yet. Co-exhibitors are linked to their host by the synchronisation: in the console, choose the “Co-exhibitor link” field — the one where a record holds the number of the stand hosting it —, then synchronise.",
  "{n} co-exposants sur {m} stands partagés.": "{n} co-exhibitors on {m} shared stands.",
  "{n} co-exposants sur un stand partagé.": "{n} co-exhibitors on one shared stand.",
  "Un co-exposant sur {m} stands partagés.": "One co-exhibitor on {m} shared stands.",
  "Un co-exposant sur un stand partagé.": "One co-exhibitor on one shared stand.",
  "Compter les co-exposants sur le plan": "Count co-exhibitors on the map",
  "Une pastille à côté du numéro du stand dit combien de sociétés il héberge, en plus de son titulaire.":
    "A badge next to the stand number shows how many companies it hosts, besides its holder.",
  "Afficher la liste des co-exposants au clic sur le stand": "Show the list of co-exhibitors when the stand is clicked",
  "Toucher un stand partagé propose d'abord de choisir la société. Décochée, le stand mène droit à son titulaire ; les sociétés hébergées restent dans la liste des exposants.":
    "Tapping a shared stand first asks which company to open. Unticked, the stand leads straight to its holder; hosted companies stay in the exhibitor list.",
};
