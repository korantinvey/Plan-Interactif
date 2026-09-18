/* `outils/gabarit/_journee.html` — « Organiser ma journée » : la question posée
   avant le calcul, puis la journée rangée heure par heure.

   Les heures arrivent écrites « 09h30 » et les durées « 1 h 30 min » : les
   premières passent par la règle des dates de `_langue.js`, les secondes se
   lisent telles quelles en anglais. */
module.exports = {
  "Salle non située sur le plan": "Room not located on the map",
  "vous y seriez à {heure}": "you would get there at {heure}",
  "Votre parcours a changé depuis ce calcul : reprenez-le pour que la visite en tienne compte.":
    "Your visit plan has changed since this was worked out: plan your day again so it takes the change into account.",
  "Le salon ouvre à {ouverture} : la journée commence à l'ouverture, et non à {demandee}.":
    "The show opens at {ouverture}: your day starts at opening time, not at {demandee}.",
  "{n} arrêts": "{n} stops",
  "{n} arrêt": "{n} stop",
  "au moins {distance} de marche": "at least {distance} on foot",
  "{mesure} de marche": "{mesure} on foot",
  "itinéraire accessible": "accessible route",
  "Départ : {nom}": "Start: {nom}",
  "{duree} de marche (non tracé)": "{duree} on foot (not drawn)",
  "Rejoignez le {plan}": "Go to {plan}",
  "comptez {duree}, ce trajet n'est pas sur le plan": "allow {duree}, this part is not on the map",
  "{duree} sur place avant le début": "{duree} to spare before it starts",
  "en arrivant à {heure}, vous ne perdriez rien": "arriving at {heure}, you would lose nothing",
  "« {conference} » : au mieux, vous y arriveriez {duree} après le début — le trajet n'y suffit pas. Arrivez plus tôt, ou retirez ce qui la précède.":
    "“{conference}”: at best, you would arrive {duree} after it starts — there isn't enough time to walk there. Arrive earlier, or remove what comes before it.",
  "{n} exposants ne tiennent pas avant la fermeture du salon, à {heure} : vous arrivez après.":
    "{n} exhibitors don't fit in before the show closes at {heure}: you arrive after closing time.",
  "{n} exposants ne tiennent pas avant la fermeture du salon, à {heure} : arrivez plus tôt, ou retirez ce qui passe avant.":
    "{n} exhibitors don't fit in before the show closes at {heure}: arrive earlier, or remove something that comes before them.",
  "Un exposant ne tient pas avant la fermeture du salon, à {heure} : vous arrivez après.":
    "One exhibitor doesn't fit in before the show closes at {heure}: you arrive after closing time.",
  "Un exposant ne tient pas avant la fermeture du salon, à {heure} : arrivez plus tôt, ou retirez ce qui passe avant.":
    "One exhibitor doesn't fit in before the show closes at {heure}: arrive earlier, or remove something that comes before it.",
  "Après la fermeture": "After closing time",
  "Restés de côté": "Left out",
  "Un autre jour": "Another day",
  "date inconnue": "date unknown",
  "En même temps qu'une autre": "At the same time as another",
  "Déjà commencées à votre arrivée": "Already started when you arrive",
  "Certaines conférences retenues ne sont rattachées à aucune zone du plan : elles gardent leur heure, mais le trajet ne peut pas y mener.":
    "Some of the conferences you picked are not linked to any area on the map: they keep their time, but the route cannot take you there.",
  "« {conference} » n'est rattachée à aucune zone du plan : elle garde son heure, mais le trajet ne peut pas y mener.":
    "“{conference}” is not linked to any area on the map: it keeps its time, but the route cannot take you there.",
  "Il reste {duree} d'attente dans cette journée. Avancer ce qui suit la dernière conférence demanderait un détour plus long que le temps gagné.":
    "This day still has {duree} of waiting. Moving up what follows the last conference would mean a detour longer than the time saved.",
  "Il reste {duree} d'attente dans cette journée. Votre parcours ne contient plus rien à visiter d'ici là : ajoutez des exposants pour la combler.":
    "This day still has {duree} of waiting. Your visit plan has nothing left to see until then: add exhibitors to fill it.",
  "Comptez {duree} par stand. Les heures sont indicatives : elles supposent qu'on ne s'attarde pas, et ne tiennent compte ni des files ni des pauses.":
    "Allow {duree} per stand. Times are only a guide: they assume you don't linger, and allow for neither queues nor breaks.",
  "Ma journée": "My day",
  "Journée organisée": "Planned day",
  "On place d'abord les conférences que vous avez retenues — elles ne se déplacent pas — puis on glisse les stands entre elles, dans l'ordre qui fait le moins de chemin.":
    "The conferences you picked go in first — their times are fixed — then the stands are fitted in between, in the order that means the least walking.",
  "Heure d'arrivée": "Arrival time",
  "Jour de visite": "Day of your visit",
  "Le salon est ouvert de {ouverture} à {fermeture}.": "The show is open from {ouverture} to {fermeture}.",
  "Le salon ouvre à {heure}.": "The show opens at {heure}.",
  "Le salon ferme à {heure}.": "The show closes at {heure}.",
  "Peu importe": "Any",
  "Par où vous entrez": "Where you come in",
  "La journée commencera à « {entree} » ({pavillon}), la seule entrée repérée.":
    "Your day will start at “{entree}” ({pavillon}), the only entrance marked.",
  "La journée commencera à « {entree} », la seule entrée repérée.":
    "Your day will start at “{entree}”, the only entrance marked.",
  "Aucune entrée n'est repérée sur ce plan : la journée commencera au premier exposant de votre liste.":
    "No entrance is marked on this map: your day will start at the first exhibitor on your list.",
  "Organiser": "Plan my day",
  "calcul…": "working it out…",
  "Recherche du meilleur ordre de visite…": "Finding the best order to visit…",
  "Le calcul de la visite n'a pas abouti sur cet appareil. Votre parcours, lui, est intact.":
    "Your day could not be worked out on this device. Your visit plan is untouched.",
  /* — La visite sur plusieurs jours : le choix des jours, la répartition, et
       le déplacement d'un exposant de l'un à l'autre — */
  "Ma visite": "My visit",
  "Organiser ma visite": "Plan my visit",
  "{n} journée": "{n} day",
  "{n} journées": "{n} days",
  "Changer mes jours et mon heure": "Change my days and time",
  "Vos jours de visite": "The days you are coming",
  "Heure d'arrivée, chaque jour": "Arrival time, each day",
  "On place d'abord les conférences que vous avez retenues — elles ont lieu le jour qu'elles ont lieu — puis on répartit les stands entre vos journées, de façon qu'elles fassent marcher autant l'une que l'autre.":
    "The conferences you picked go in first — each on the day it takes place — then the stands are shared out between your days, so that each one means about as much walking as the next.",
  "Les horaires changent d'un jour à l'autre : chaque journée commence à l'ouverture de son jour.":
    "Opening hours differ from day to day: each day starts when the show opens that day.",
  "Il ne reste que le {jour} : c'est cette journée qu'on organise.":
    "Only {jour} is left: that is the day being planned.",
  "Le salon est terminé : il n'y a plus de journée à organiser. Votre parcours, lui, reste sur cet appareil.":
    "The show is over: there is no day left to plan. Your visit plan stays on this device.",
  "sur {n} jours · {distance} en tout": "over {n} days · {distance} in total",
  "Rien n'est tombé sur cette journée : le calcul a tout fait tenir les autres jours. Retirez-la de votre visite, ou déplacez-y un exposant.":
    "Nothing landed on this day: everything fitted into the other days. Drop it from your visit, or move an exhibitor onto it.",
  "Rien à voir ce jour-là : votre parcours est vide, ou rien n'y tient.":
    "Nothing to see that day: your visit plan is empty, or nothing fits into it.",
  "Changer le jour de cet exposant": "Change this exhibitor's day",
  "Déplacer « {nom} »": "Move “{nom}”",
  "Choisissez le jour où vous voulez le voir. Lui seul change de journée ; le reste de votre visite ne bouge pas.":
    "Pick the day you want to see them. Only this one moves; the rest of your visit stays where it is.",
  "Cet exposant n'entre dans aucune de vos journées. Choisissez celui où vous voulez le voir.":
    "This exhibitor fits into none of your days. Pick the one you want to see them on.",
  "il y est déjà — l'y retenir": "already there — keep it there",
  "Laisser le plan choisir": "Let the map choose",
  "Dans aucune de vos journées": "On none of your days",
  "« {exposant} » ne tient pas le jour où vous l'avez placé. Choisissez-lui un autre jour, ou retirez ce qui l'y précède.":
    "“{exposant}” does not fit on the day you placed it. Pick another day for it, or remove what comes before it.",
  "Ces conférences ont lieu un jour que vous n'avez pas retenu. Reprenez vos jours de visite pour les y faire entrer.":
    "These conferences take place on a day you did not pick. Change the days of your visit to fit them in.",
  "Cette conférence a lieu un jour que vous n'avez pas retenu. Reprenez vos jours de visite pour l'y faire entrer.":
    "This conference takes place on a day you did not pick. Change the days of your visit to fit it in.",
  "{n} exposants ne tiennent pas dans les journées que vous avez retenues : ajoutez un jour, arrivez plus tôt, ou retirez ce qui passe avant.":
    "{n} exhibitors don't fit into the days you picked: add a day, arrive earlier, or remove something that comes before them.",
  "Un exposant ne tient pas dans les journées que vous avez retenues : ajoutez un jour, arrivez plus tôt, ou retirez ce qui passe avant.":
    "One exhibitor doesn't fit into the days you picked: add a day, arrive earlier, or remove something that comes before it.",
};
