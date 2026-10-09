/* `outils/gabarit/modules/volets.mjs` — les volets Admin, Parcours
   intelligent, PMR, Distinctions et Apparence de la fenêtre des réglages, et
   les dates et heures du salon de l'onglet « Plan ». La fenêtre elle-même et
   ses autres onglets sont dans `_admin1.js`, comme les phrases que ces volets
   partagent avec le reste du plan. */
module.exports = {
  // l'onglet « Admin »
  "Ce que les visiteurs voient sur le plan. Publiez la configuration pour que le changement leur parvienne.":
    "What visitors see on the map. Publish the configuration for the change to reach them.",
  "Montrer les secteurs — couleurs et filtre": "Show sectors — colours and filter",
  "Suivre les allées une à une — pour un hall arrondi ou aux rangées désaccordées":
    "Follow the aisles one by one — for a rounded hall or one with uneven rows",

  // les dates et les heures du salon, au pied de l'onglet « Plan »
  "Dates et heures d'ouverture du salon": "Show dates and opening hours",
  "Premier jour du salon": "First day of the show",
  "Dernier jour du salon": "Last day of the show",
  "Le dernier jour précède le premier : corrigez les dates pour régler les heures.":
    "The last day comes before the first: correct the dates to set the hours.",
  "Plus de {n} jours entre ces deux dates : seuls les {n2} premiers sont proposés. Vérifiez l'année.":
    "More than {n} days between these two dates: only the first {n2} are offered. Check the year.",
  "Une fermeture tombe avant l'ouverture : ce jour-là n'a pas d'heures tant qu'elle n'est pas corrigée.":
    "A closing time comes before the opening time: that day has no hours until it is corrected.",
  "Fermeture": "Closing",
  "Effacer les heures de ce jour": "Clear this day's hours",
  "Ouverture, {jour}": "Opening, {jour}",
  "Fermeture, {jour}": "Closing, {jour}",
  "Aucun stand n'est programmé dans la journée d'un visiteur avant l'ouverture ni après la fermeture. Ces jours sont aussi ceux qu'on lui propose. Un jour sans heures n'a pas de borne.":
    "No stand is scheduled in a visitor's day before opening or after closing. These days are also the ones offered to visitors. A day without hours has no limits.",
  "Choisissez les dates : une ligne d'heures paraît pour chaque jour. Sans elles, la journée d'un visiteur n'a ni début ni fin.":
    "Choose the dates: a row of hours appears for each day. Without them, a visitor's day has no start and no end.",

  // l'onglet « PMR »
  "L'itinéraire accessible contourne déjà ce qui est dessiné infranchissable. Ceci vise ce qu'aucun dessin ne porte : la foule d'une entrée ou d'une sortie de conférence, aux abords de la salle. Le trajet du marcheur, lui, n'en tient pas compte — il s'y faufile.":
    "The accessible route already avoids whatever is drawn as impassable. This targets what no drawing shows: the crowd going into or out of a conference, around the room. The walking route ignores it — people on foot squeeze through.",
  "Écarter l'itinéraire accessible des salles qui se vident": "Keep the accessible route away from rooms that are emptying",
  "Un mètre longé en vaut": "One metre alongside counts as",
  "mètres": "metres",
  "Trois : le trajet accepte un détour jusqu'au double de ce qu'il aurait longé, et passe tout de même s'il n'existe pas d'autre chemin. À un, plus rien ne l'écarte.":
    "Three: the route accepts a detour of up to twice what it would have gone alongside, and still goes through if there is no other way. At one, nothing keeps it away any more.",
  "Largeur des abords": "Width of the surroundings",
  "Depuis le contour de la salle, et seulement là : c'est la portion qui la jouxte qui coûte cher, pas l'allée d'un bout à l'autre. Quatre mètres valent une allée courante.":
    "From the outline of the room, and only there: it is the stretch right next to it that costs, not the whole aisle. Four metres is a standard aisle.",
  "Autour de l'heure dite": "Around the scheduled time",
  "Avant et après le début, avant et après la fin de chaque conférence. En dehors de ces minutes, le trajet est celui de toujours.":
    "Before and after the start, before and after the end of each conference. Outside these minutes, the route is the usual one.",

  // l'onglet « Apparence »
  "Bleu d'encre": "Ink blue",
  "Bleu roi": "Royal blue",
  "Bleu nuit": "Midnight blue",
  "Bleu canard": "Teal blue",
  "Turquoise": "Turquoise",
  "Vert prairie": "Meadow green",
  "Vert forêt": "Forest green",
  "Olive": "Olive",
  "Or brûlé": "Burnt gold",
  "Ambre": "Amber",
  "Terracotta": "Terracotta",
  "Brique": "Brick",
  "Grenat": "Garnet",
  "Cerise": "Cherry",
  "Framboise": "Raspberry",
  "Fuchsia": "Fuchsia",
  "Violet": "Violet",
  "Indigo": "Indigo",
  "Prune": "Plum",
  "Brun": "Brown",
  "Ardoise": "Slate",
  "Anthracite": "Charcoal",
  "La couleur principale sert partout : sélection, liens, boutons, pastilles, et les modèles s'en habillent. Le modèle décide de l'allure de tout l'écran à la fois : le bandeau du haut, la liste des exposants, la fiche qui s'ouvre sur un stand, le parcours de visite et l'itinéraire. Il pose aussi sa police sur les noms des stands et des zones : une autre peut lui être préférée, jusqu'au prochain changement de modèle. Les numéros de stand gardent la sienne.":
    "The main colour is used everywhere: selection, links, buttons, badges, and the templates dress themselves in it. The template sets the look of the whole screen at once: the top bar, the exhibitor list, the details that open on a stand, the visit plan and the directions. It also sets the font of stand and area names: another one can be preferred, until the template changes again. Stand numbers keep their own.",
  "Couleur principale": "Main colour",
  "Réglage d'origine": "Original setting",
  "Modèle d'habillage": "Template",

  // la police des noms
  "Police des noms": "Name font",
  "Police du modèle": "Template font",
  "du modèle": "from the template",
  "modèle {modele}": "{modele} template",

  // la visite guidée, dans l'onglet « Admin » — le reste vit dans `tutoriel.js`
  "Proposer la visite guidée au premier démarrage": "Offer the guided tour on first launch",
  "Le visiteur y fait lui-même chaque geste. Sur ce salon :": "Visitors make every move themselves. On this show:",
  "Proposée une fois par appareil.": "Offered once per device.",
  "Rien à présenter sur ce salon : ni programme rattaché à une zone, ni parcours de visite, ni itinéraire.":
    "Nothing to present on this show: no programme linked to an area, no visit plan, no directions.",

  /* Les options du plan, dans l'onglet « Admin » : ce que le salon a pris, et
     ce que fermer une option retire. */
  "Les options du plan": "The map's options",
  "Ce que ce salon a pris. Une option fermée grise ce qui y mène — un outil de la boîte à outils, un bouton du plan, un onglet de ces réglages — pour vous, et le retire au visiteur, sans défaire le travail fait dessous : la rouvrir le retrouve.":
    "What this show has taken. A closed option greys out the way in \u2014 a tool from the toolbox, a button on the map, a tab in these settings \u2014 for you, and removes it for the visitor, without undoing the work done underneath: reopening it brings that back.",

  /* Les langues du plan, dans l'onglet « Admin » : une case par plan, et ce que
     fermer la version anglaise retire. */
  "Les langues du plan": "The map's languages",
  "Le bouton à drapeau passe le plan en anglais sans le recharger. Fermée, la version anglaise s'en va avec son bouton et le plan ne se lit qu'en français.":
    "The flag button switches the map to English without reloading it. Closed, the English version leaves along with its button and the map reads in French only.",
  "Version anglaise du plan public": "English version of the public map",
  "Ce que voient les visiteurs. Le plan traduit ce qu'il écrit lui-même ; ce que le salon porte — noms d'exposants, descriptions, nomenclature — reste dans la langue des données, sauf là où la source en donne une version anglaise.":
    "What visitors see. The map translates what it writes itself; what the show carries \u2014 exhibitor names, descriptions, categories \u2014 stays in the language of the data, except where the source gives an English version of it.",
  "Version anglaise de l'administration": "English version of the administration",
  "Ces réglages, la boîte à outils et la bande du haut, sur le plan d'administration. Sans effet sur ce que voient les visiteurs.":
    "These settings, the toolbox and the top bar, on the administration map. No effect on what visitors see.",

  // la barre du haut sur un téléphone, avec bande ou sans
  "La barre du haut, sur un téléphone": "The top bar, on a phone",
  "Un écran de téléphone se compte en lignes de stands : la bande du haut en prend trois. Le plan peut donc s'en passer, ses commandes rangées sur le hall, ou la garder pour que le nom du salon reste lu. Sans effet sur un ordinateur, où la barre ne coûte rien.":
    "A phone screen is measured in rows of stands: the top band takes three of them. The map can do without it, its controls tucked onto the hall, or keep it so the show name stays in sight. No effect on a computer, where the bar costs nothing.",
  "Sans bandeau": "No top bar",
  "Le hall d'un bord à l'autre ; les commandes se posent dessus, au bord droit.":
    "The hall from edge to edge; the controls sit on it, along the right-hand side.",
  "Bandeau réduit": "Slim top bar",
  "Une bande aussi basse que possible : le nom du salon, les pavillons, les commandes.":
    "A band as short as it can be: the show name, the halls, the controls.",

  // les onglets « Nouveaux » et « Adhérents » — ce que le plan montre des
  // distinctions d'un exposant. Le paragraphe d'accueil et la note du champ
  // décoché nomment la distinction : deux versions, une par onglet.
  "La synchronisation pose un champ « Nouvel exposant » sur les fiches des salons qui distinguent leurs nouveaux venus. Ce que le plan en montre se règle ici, surface par surface : le stand sur le plan, la ligne dans la liste des résultats, la tête de la fiche qu'on ouvre. Le choix se voit tout de suite derrière cette fenêtre, et les deux distinctions se cumulent : un exposant qui les porte toutes deux montre les deux marques.":
    "Synchronisation puts a \u201cNew exhibitor\u201d field on the records of shows that single out their newcomers. What the map makes of it is set here, surface by surface: the stand on the map, the row in the result list, the head of the record that opens. The choice shows at once behind this window, and the two distinctions add up: an exhibitor carrying both shows both marks.",
  "La synchronisation pose un champ « Adhérent syndicat » sur les fiches des salons dont le syndicat tient la liste de ses membres. Ce que le plan en montre se règle ici, surface par surface : le stand sur le plan, la ligne dans la liste des résultats, la tête de la fiche qu'on ouvre. Le choix se voit tout de suite derrière cette fenêtre, et les deux distinctions se cumulent : un exposant qui les porte toutes deux montre les deux marques.":
    "Synchronisation puts a \u201cTrade body member\u201d field on the records of shows whose trade body keeps a list of its members. What the map makes of it is set here, surface by surface: the stand on the map, the row in the result list, the head of the record that opens. The choice shows at once behind this window, and the two distinctions add up: an exhibitor carrying both shows both marks.",
  "Aucune fiche de ce salon ne porte le champ pour l'instant : les marques réglées ici resteront invisibles jusqu'à ce que la source le renseigne. Le champ se désigne dans la console, onglet « Stand ».":
    "No record in this show carries the field yet: the marks set here will stay invisible until the source fills it in. The field is designated in the console, \u201cStand\u201d tab.",
  "Le champ « Nouvel exposant » est décoché dans la console : les marques réglées ici ne paraîtront qu'une fois le champ rendu visible.":
    "The \u201cNew exhibitor\u201d field is unticked in the console: the marks set here will only show once the field is made visible.",
  "Le champ « Adhérent syndicat » est décoché dans la console : les marques réglées ici ne paraîtront qu'une fois le champ rendu visible.":
    "The \u201cTrade body member\u201d field is unticked in the console: the marks set here will only show once the field is made visible.",
  "Couleur des marques": "Colour of the marks",
  "Sur le plan": "On the map",
  "Une forme posée sur le stand. Le coin corné se place sur l'angle de la boîte du tracé : un stand en L n'a pas cet angle-là, et sa corne déborde dans l'allée. Le liseré, lui, emprunte le trait que la sélection utilise déjà. Deux distinctions affichées prennent chacune un coin, l'une à droite et l'autre à gauche : elles ne se recouvrent pas.":
    "A shape laid on the stand. The folded corner sits on the corner of the outline's box: an L-shaped stand has no such corner, and its fold spills into the aisle. The outline, for its part, borrows the stroke selection already uses. Two distinctions on show take a corner each, one on the right and one on the left: they do not overlap.",
  "Dans la liste": "In the list",
  "La ligne des résultats. Le cartouche dit le mot, mais l'ellipse le mange sur une enseigne longue ; la mention descend sur la seconde ligne, où rien ne la tronque.":
    "The result row. The tag says the word, but the ellipsis eats it on a long brand name; the caption drops to the second line, where nothing truncates it.",
  "En tête de fiche": "At the head of the record",
  "Ce qu'on lit en ouvrant un stand. Le coin corné se pose à gauche : le coin droit porte déjà le logo de l'exposant et la croix de fermeture. Le bandeau prend toute la largeur et descend le nom d'une ligne.":
    "What you read when a stand opens. The folded corner goes on the left: the right corner already carries the exhibitor's logo and the close button. The banner takes the full width and pushes the name down a line.",

  // le coin ne se partage pas : la phrase s'ajoute à l'aide ci-dessus quand
  // l'autre distinction l'occupe déjà
  "Ce qu'on lit en ouvrant un stand. Le coin corné se pose à gauche : le coin droit porte déjà le logo de l'exposant et la croix de fermeture. Le bandeau prend toute la largeur et descend le nom d'une ligne. Le coin corné est déjà pris par l'autre distinction : choisi ici, c'est la pastille qui paraîtra.":
    "What you read when a stand opens. The folded corner goes on the left: the right corner already carries the exhibitor's logo and the close button. The banner takes the full width and pushes the name down a line. The folded corner is already taken by the other distinction: chosen here, the pill will show instead.",
  " Le coin corné est déjà pris par l'autre distinction : choisi ici, c'est la pastille qui paraîtra.":
    " The folded corner is already taken by the other distinction: chosen here, the pill will show instead.",

  // le texte que l'exploitant écrit sur la marque. Ce qu'il y met est une
  // donnée : il paraît tel quel dans les deux langues, l'aide le dit.
  "Texte de la marque": "Text of the mark",
  "Ce que la marque écrit : la pastille, le bandeau et la mention sous le nom le portent en entier, le cartouche et le coin corné n'en tiennent que deux ou trois mots. Laissez vide pour « Nouvel exposant ». Le texte s'affiche tel quel, y compris sur la version anglaise du plan.":
    "What the mark writes: the pill, the banner and the caption under the name carry it in full; the tag and the folded corner hold only two or three words. Leave empty for \u201cNew exhibitor\u201d. The text shows as typed, on the English version of the map too.",
  "Ce que la marque écrit : la pastille, le bandeau et la mention sous le nom le portent en entier, le cartouche et le coin corné n'en tiennent que deux ou trois mots. Laissez vide pour « Adhérent syndicat ». Le texte s'affiche tel quel, y compris sur la version anglaise du plan.":
    "What the mark writes: the pill, the banner and the caption under the name carry it in full; the tag and the folded corner hold only two or three words. Leave empty for \u201cTrade body member\u201d. The text shows as typed, on the English version of the map too.",

  // l'onglet « Parcours intelligent » : ce qu'un stand reçoit à la fois
  "La journée organisée range les stands au plus court depuis la porte d'entrée : tout le monde part du même point, à la même heure, et reçoit le même ordre — les premières travées se remplissent à l'ouverture pendant que le fond reste vide. Ce qui suit apprend au calcul à étaler ses propres recommandations dans la journée, plutôt que d'envoyer tout le monde au même endroit au même moment.":
    "The organised day sorts stands by the shortest walk from the entrance door: everyone sets off from the same point, at the same time, and gets the same order \u2014 the first aisles fill up at opening while the far end stays empty. What follows teaches the calculation to spread its own recommendations through the day, rather than sending everybody to the same place at the same moment.",
  "Étaler dans le temps les visiteurs qui suivent le plan":
    "Spread out the visitors who follow the map",
  "Le plan ne compte que les visiteurs qui organisent leur journée avec lui : il ignore tout des autres, et ne mesure donc pas la fréquentation de vos stands. Le seuil ci-dessous dit à partir de combien de ces visiteurs-là, en même temps sur un stand, le calcul doit chercher un autre ordre. Il ne l'interdit jamais, et ne retire l'exposant du parcours de personne.":
    "The map counts only the visitors who plan their day with it: it knows nothing of the others, and so does not measure footfall on your stands. The threshold below says how many of those visitors, at once on one stand, make the calculation look for another order. It never forbids that stand, and never drops the exhibitor from anybody's visit plan.",
  "Un seuil fixe, le même pour tous les stands":
    "A fixed threshold, the same for every stand",
  "Seuil de": "Threshold of",
  "à la fois": "at once",
  "Le choix d'un salon dont les emplacements se ressemblent, ou d'un exploitant qui connaît ses équipes mieux que la surface ne les devine. Cochée, cette case l'emporte sur le calcul à la surface.":
    "The choice for a show whose stands are much alike, or for an operator who knows their teams better than floor area guesses them. Ticked, this box overrides the floor-area calculation.",
  "Un seuil calculé sur la surface du stand": "A threshold worked out from the stand's floor area",
  "par tranche de 10 m²": "per 10 m²",
  "La surface se lit sur le plan, telle que le stand y est dessiné. Un emplacement que personne n'a dessiné n'a pas de surface, et ne porte donc aucun seuil.":
    "Floor area is read from the map, as the stand is drawn on it. A stand nobody has drawn has no area, and so carries no threshold.",
  "Jamais moins de": "Never fewer than",
  "Sans ce plancher, les plus petits stands porteraient un seuil que leur seule surface leur invente — un module de six mètres carrés tient bien trois visiteurs debout.":
    "Without this floor, the smallest stands would carry a threshold their floor area alone invents for them \u2014 a six-square-metre booth does hold three standing visitors.",
  "Jamais plus de": "Never more than",
  "Au-delà, la règle de trois rendrait un seuil si haut qu'il ne se déclencherait jamais.":
    "Beyond that, the rule of three would return a threshold so high it would never come into play.",
};
