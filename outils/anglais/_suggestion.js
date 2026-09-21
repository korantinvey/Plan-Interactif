/* `outils/gabarit/_suggestion.html` — la suggestion d'un exposant de plus : la
   carte que lit le visiteur, et le volet « Suggestion » des réglages. */
module.exports = {
  "Suggestion": "Suggestion",

  // ce que lit le visiteur
  "Vous avez ajouté {n} exposants {motif} à votre liste.": "You have added {n} exhibitors {motif} to your list.",
  "du secteur « {valeur} »": "from the “{valeur}” sector",
  "de la ville « {valeur} »": "from “{valeur}”",
  "du pays « {valeur} »": "from “{valeur}”",
  "de la nomenclature « {valeur} »": "in the “{valeur}” category",
  "de la thématique « {valeur} »": "with the theme “{valeur}”",
  "marqués « {valeur} »": "marked “{valeur}”",
  "Vous pourriez être intéressé par l'exposant {nom}.": "You might be interested in {nom}.",
  "Pour compléter votre visite": "To round off your visit",
  "Ne plus me proposer celui-ci": "Don't suggest this one again",
  "Non merci": "No thanks",
  "Voir sur le plan": "See on map",

  // le volet des réglages
  "session absente, reconnectez-vous": "no session, please sign in again",
  "Un exposant de plus, proposé au visiteur quand plusieurs de ceux qu'il a retenus dans son parcours se ressemblent. Le rapprochement se fait sur son appareil, à partir de tables préparées ici : rien de ce qu'il retient ne remonte jamais.":
    "One more exhibitor, suggested to visitors when several of those they picked for their visit plan have something in common. The matching happens on their device, from tables prepared here: nothing they pick is ever sent back.",
  "Le parcours de visite est retiré de ce plan, dans l'onglet « Admin » : sans lui, il n'y a ni liste à compléter ni tiroir où poser la proposition.":
    "The visit plan is turned off for this map, in the “Admin” tab: without it, there is neither a list to round off nor a panel to show the suggestion in.",
  "Aucun critère n'est réglé sur ce salon : le rapprochement n'a rien sur quoi se faire. Les champs qui font des critères se désignent dans la console, sur la fiche du salon ; le secteur en est un dès que « Montrer les secteurs » est coché.":
    "No filters are set up for this show: there is nothing to match on. The fields used as filters are chosen in the console, on the show's record; the sector becomes one as soon as “Show sectors” is ticked.",
  "Proposer un exposant pour compléter le parcours": "Suggest an exhibitor to round off the visit plan",
  "Critère de rapprochement": "Matching filter",
  "Ce que plusieurs exposants d'une même liste doivent avoir en commun pour qu'on en propose un de plus. Ce sont les critères de recherche du salon, ceux-là mêmes que le visiteur peut cocher.":
    "What several exhibitors in the same list must have in common for one more to be suggested. These are the show's search filters, the very ones visitors can tick.",
  "Déclencher à partir de": "Trigger from",
  "Combien d'exposants d'une même valeur doivent figurer dans le parcours avant qu'on en propose un autre. Plus bas, la proposition arrive tôt et au jugé ; plus haut, elle se fait attendre.":
    "How many exhibitors with the same value must be in the visit plan before another one is suggested. Lower, the suggestion comes early and is more of a guess; higher, it takes longer to appear.",
  "Dans le parcours, la proposition attend en tête de la liste, là où le visiteur va de lui-même. Dans une fenêtre, elle s'ouvre dès que le seuil est atteint : elle se voit, et elle interrompt. Elle ne s'y impose qu'une fois par proposition, jamais par-dessus une autre fenêtre, et jamais à l'ouverture du plan sur une liste d'hier. Les deux cochées, la fenêtre refermée laisse la proposition dans le parcours.":
    "In the visit plan, the suggestion waits at the top of the list, where visitors go on their own. In a window, it opens as soon as the threshold is reached: it gets noticed, and it interrupts. It only pops up once per suggestion, never over another window, and never when the map opens on yesterday's list. With both ticked, closing the window leaves the suggestion in the visit plan.",
  "En tête du parcours de visite": "At the top of the visit plan",
  "Dans une fenêtre, dès le seuil atteint": "In a window, as soon as the threshold is reached",
  "Exposant proposé": "Suggested exhibitor",
  "D'où vient le nom qu'on met sous les yeux du visiteur.": "Where the name shown to visitors comes from.",
  "Le plus consulté du salon, dans cette valeur": "The show's most viewed, for this value",
  "Un exposant choisi, un par valeur": "A chosen exhibitor, one per value",
  "Classement": "Ranking",
  "Relevé dans les compteurs d'usage, sur toute la vie du salon. Il ne part aux visiteurs que réduit à ce qu'il en faut — les trois exposants les plus consultés de chaque valeur — et jamais entier : le classement d'un salon ne regarde que son organisateur.":
    "Taken from the usage counters, over the whole life of the show. Visitors only receive the part they need — the three most viewed exhibitors for each value — never the whole thing: a show's ranking is its organiser's business alone.",
  "{n} valeurs ont un exposant à proposer, sur {n2}": "{n} values have an exhibitor to suggest, out of {n2}",
  "{n} valeur a un exposant à proposer, sur {n2}": "{n} value has an exhibitor to suggest, out of {n2}",
  "relevé le {date}": "taken on {date}",
  "Aucun relevé pour l'instant : la suggestion se tait tant qu'elle n'a pas de classement.":
    "No ranking taken yet: the suggestion stays silent until it has one.",
  "personne n'a encore été consulté ici": "nobody has been viewed here yet",
  "Relever le classement": "Take the ranking",
  "Lecture des compteurs…": "Reading the counters…",
  "Classement non rafraîchi : {raison}": "Ranking not refreshed: {raison}",
  "Un exposant par valeur": "One exhibitor per value",
  "Chaque liste ne propose que les exposants qui portent cette valeur : ce qu'on met sous les yeux du visiteur doit ressembler à ce qu'il a retenu. Une valeur laissée vide ne propose rien, et le plan passe à la suivante.":
    "Each list only offers the exhibitors that have this value: what visitors are shown must look like what they picked. A value left empty suggests nothing, and the map moves on to the next one.",
  "— aucun —": "— none —",
};
