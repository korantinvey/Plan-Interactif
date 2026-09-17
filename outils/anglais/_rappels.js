/* `outils/gabarit/_rappels.html` — le rappel avant une conférence :
   l'interrupteur du tiroir, et le texte de la notification elle-même.

   Ce module est le seul dont des phrases quittent la page : la notification est
   composée ici, puis confiée au serveur qui la postera telle quelle. Elle doit
   donc être traduite au moment où le visiteur pose son rappel, et non à
   l'affichage — il n'y aura plus de page pour la traduire. */
module.exports = {
  /* Ce que la notification écrit sous le titre de la conférence. */
  "Dans {n} min": "In {n} min",
  "Conférence": "Conference",

  /* L'interrupteur, et ce qu'il promet. */
  "Me prévenir {n} min avant": "Remind me {n} min before",
  "Une notification par conférence retenue, même plan fermé.":
    "One notification per conference you picked, even with the map closed.",
  "Une notification par conférence retenue, même plan fermé. Les heures et les titres retenus partent alors sur nos serveurs, et s'effacent après le salon.":
    "One notification per conference you picked, even with the map closed. The times and titles you picked then go to our servers, and are erased after the show.",

  /* La fenêtre qui propose le rappel, à la première conférence retenue. */
  "Pour ne pas la manquer": "So you don't miss it",
  "Le plan peut vous prévenir {n} min avant le début de chaque conférence de votre parcours, même fermé.":
    "The map can remind you {n} min before each conference on your route starts, even when closed.",
  "Il vous faudra autoriser les notifications. Les heures et les titres retenus partent alors sur nos serveurs, et s'effacent après le salon.":
    "You will have to allow notifications. The times and titles you picked then go to our servers, and are erased after the show.",
  "Non merci": "No thanks",
  "Oui, me prévenir": "Yes, remind me",

  /* Trop tard : la conférence commence avant que le rappel n'ait pu tomber. */
  "Vos conférences retenues commencent dans moins de {n} min : il est trop tard pour un rappel.":
    "The conferences you picked start in less than {n} min: too late for a reminder.",

  /* Ce qui empêche, et ce qu'on peut y faire. */
  "Pour être prévenu avant vos conférences, ajoutez le plan à votre écran d'accueil : sur iPhone, les notifications n'existent que là.":
    "To be reminded before your conferences, add the map to your home screen: on iPhone, notifications only exist there.",
  "Les notifications sont bloquées pour ce site. Vous pouvez les réautoriser dans les réglages de votre navigateur.":
    "Notifications are blocked for this site. You can allow them again in your browser settings.",
  "Les notifications n'ont pas été autorisées.": "Notifications were not allowed.",
  "Le rappel n'a pas pu être posé. Réessayez dans un instant.":
    "The reminder could not be set. Please try again in a moment.",
};
