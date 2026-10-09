/* `outils/gabarit/_admin1.html` — la fenêtre « Réglages du plan » et ses
   onglets, la fiche d'une zone organisateur, le placement des libellés. */
module.exports = {
  // l'onglet du fond de carte, dans les réglages du plan
  "Environs": "Surroundings",
  // les commandes du plan
  "Afficher les icônes de zoom": "Show the zoom buttons",
  "Afficher l'échelle": "Show the scale",
  "Proposer le parcours de visite": "Offer the visit plan",
  "Proposer le calcul d'itinéraire": "Offer directions",

  // l'onglet « Recherche »
  "Stands et exposants": "Stands and exhibitors",
  "Le nom d'une enseigne, son numéro d'emplacement, son secteur, ses thématiques, et les sociétés hébergées sur un stand partagé.":
    "A brand's name, its stand number, its sector, its themes, and the companies hosted on a shared stand.",
  "Ce salon ne porte aucun emplacement.": "This show has no stands.",
  "Accueil, restauration, village start-up — les endroits que le salon fournit avec son plan.":
    "Reception, catering, start-up village — the places the show provides along with its map.",
  "Ce salon ne porte aucune zone organisateur.": "This show has no organiser areas.",
  "Le titre d'une session, sa salle, son thème, et l'exposant qui la tient — souvent le seul nom dont on se souvienne.":
    "A session's title, its room, its theme, and the exhibitor running it — often the only name people remember.",
  "Le programme n'est pas synchronisé : sa source se règle depuis la console, dans « Source des données ».":
    "The programme is not synchronised: its source is set in the console, under “Data sources”.",
  "Produits": "Products",
  "Le nom de ce qu'un exposant présente, et les thématiques du produit : le stand qui le porte répond au mot-clé.":
    "The name of what an exhibitor presents, and the product's themes: the stand carrying it answers the keyword.",
  "La fiche ne montre pas les produits : la case se coche depuis la console, dans « Fiche détail ».":
    "The details panel does not show products: tick the box in the console, under “Details panel”.",
  "Aucun produit n'est remonté par la synchronisation : leur source se règle depuis la console, dans « Source des données ».":
    "No product came back from the synchronisation: their source is set in the console, under “Data sources”.",
  "Les repères posés sur le plan : entrées, WC, escaliers, parkings, vestiaires. Le cartouche du bas les récapitule de son côté, que cette case soit cochée ou non.":
    "The landmarks placed on the map: entrances, toilets, stairs, car parks, cloakrooms. The panel at the bottom lists them anyway, whether this box is ticked or not.",
  "Aucun repère n'est posé sur les plans de ce salon : ils se dessinent depuis la boîte à outils.":
    "No landmarks are placed on this show's maps: they are drawn from the toolbox.",
  "Ce que le champ de recherche remonte. Le sommaire du pavillon n'en dépend pas : sans mot-clé, la liste reste celle de ses emplacements. Publiez la configuration pour que le changement parvienne aux visiteurs.":
    "What the search box brings up. The hall's list does not depend on it: without a keyword, the list stays that of its stands. Publish the configuration for the change to reach visitors.",

  // l'ordre des filtres, au bas de l'onglet « Recherche »
  "L'ordre des filtres": "The order of the filters",
  "Le panneau qui se déplie sous la recherche range ses filtres dans cet ordre. Mettez en tête ce par quoi un visiteur de ce salon commence à trancher : c'est le seul filtre qu'il lise sans dérouler. Les champs qui servent de filtre, eux, se cochent dans la console, dans « Fiche détail ».":
    "The panel that unfolds under the search box lists its filters in this order. Put first whatever a visitor to this show narrows down by: it is the only filter they read without scrolling. The fields used as filters are ticked in the console, under “Details panel”.",
  "Un seul filtre : il n'y a pas d'ordre à régler.": "Only one filter: there is no order to set.",
  "Aucun filtre : le panneau des critères ne s'ouvre pas. Les champs qui servent de filtre se cochent dans la console, dans « Fiche détail ».":
    "No filter: the criteria panel does not open. The fields used as filters are ticked in the console, under “Details panel”.",
  "vient du plan": "comes from the map",

  // les modèles d'habillage
  "Sobre": "Plain",
  "Le rendu d'origine : un seul rythme, de la liste à la fiche.": "The original look: one rhythm, from the list to the details.",
  "Grille": "Grid",
  "Encre pleine, numéro en filigrane, filets francs jusque dans la liste.": "Solid ink, watermarked number, crisp rules right down the list.",
  "Console": "Console",
  "Chasse fixe et invites de commande, sur un phosphore à la couleur du salon.": "Monospace type and command prompts, on a phosphor glow in the show's colour.",
  "Billet": "Ticket",
  "Bandeau d'accent sur la recherche, numéros comptables, lignes perforées.": "Accent band on the search, ledger numbers, perforated lines.",
  "Magazine": "Magazine",
  "Serif à fort contraste et italiques : le catalogue et son sommaire.": "High-contrast serif and italics: the catalogue and its contents page.",
  "Brut": "Raw",
  "Trait épais, ombre dure, aplat franc. Papier et noir, sans rien emprunter au salon.": "Thick lines, hard shadows, flat colour. Paper and black, borrowing nothing from the show.",
  "Verre": "Glass",
  "Un bloc de la couleur du salon, champs et lignes en carreaux translucides.": "A block in the show's colour, with fields and rows as translucent panes.",
  "Kraft": "Kraft",
  "Carton et machine à écrire, « nouvel exposant » tamponné de travers.": "Cardboard and typewriter, with “new exhibitor” stamped askew.",
  "Signalétique": "Signage",
  "Aplat, flèche et capitales : un stand se lit comme une direction de hall.": "Flat colour, arrows and capitals: a stand reads like a hall sign.",
  "Chronologie": "Timeline",
  "Le programme en ligne de temps, et la liste égrenée le long du même rail.": "The programme as a timeline, and the list strung along the same rail.",
  "Nu": "Bare",
  "Ni cadre ni libellés : la hiérarchie typographique seule.": "No frames, no labels: typographic hierarchy alone.",

  // l'aperçu des modèles, sur une fiche d'exemple — les noms propres et
  // l'adresse d'un exposant imaginaire restent ce qu'ils sont
  "Ateliers Ligneron": "Ateliers Ligneron",
  "Ligneron & Fils SARL": "Ligneron & Fils SARL",
  "8 rue de la Filature": "8 rue de la Filature",
  "44000 Nantes": "44000 Nantes",
  "France": "France",
  "Atelier du Marais": "Atelier du Marais",
  "Bois & Compagnie": "Bois & Compagnie",
  "Duchêne Agencement": "Duchêne Agencement",
  "Fonderie de l'Ouest": "Fonderie de l'Ouest",
  "Granit Armor": "Granit Armor",
  "Habitat Lumière": "Habitat Lumière",
  "Menuiseries Rocher": "Menuiseries Rocher",
  "Pavillon 2": "Hall 2",
  "Aménagement & second œuvre": "Fit-out & finishing works",
  "Menuiserie;Agencement de boutique": "Joinery;Shop fitting",
  "Réemploi;Bois de pays": "Reuse;Local timber",
  "Menuiserie": "Joinery",
  "Agencement de boutique": "Shop fitting",
  "Réemploi": "Reuse",
  "Bois de pays": "Local timber",
  "Valeur d'exemple": "Sample value",
  "Le bois de pays dans la commande publique": "Local timber in public procurement",
  "Table ronde": "Round table",
  "Agencer une boutique en réemploi": "Fitting out a shop with reused materials",
  "Démonstration": "Demonstration",

  // la fenêtre et ses onglets
  "Plan": "Map",
  "Recherche": "Search",
  "Admin": "Admin",
  "Fiche Stand": "Stand details",
  "Apparence": "Appearance",
  "Zones": "Areas",
  "PMR": "Accessibility",
  "Co-Exposants": "Co-exhibitors",

  // l'onglet « Zones »
  "Ce que le visiteur lit sur une zone organisateur. La source n'en donne que le contour et parfois un nom : le reste s'écrit ici, et paraît sans attendre la prochaine synchronisation.":
    "What visitors read about an organiser area. The source only gives its outline and sometimes a name: the rest is written here, and shows up without waiting for the next synchronisation.",
  "fiche": "details",
  "traversée": "walk-through",
  "masquée": "hidden",
  "Logo": "Logo",
  "L'image déposée sur la zone, dans l'en-tête de sa fiche.": "The image uploaded for the area, at the top of its details.",
  "Ce qu'on trouve dans la zone, ses horaires, ses conditions d'accès. Elle ne paraît que sur les zones où elle est remplie.":
    "What you find in the area, its opening hours, how to get in. It only appears on areas where it has been filled in.",
  "La page où en savoir plus, saisie avec la description.": "The page to find out more, entered with the description.",
  "Le programme tenu dans la zone, par ordre chronologique.": "The programme held in the area, in chronological order.",
  "Ce que la fiche montre": "What the details show",
  "Les champs qu'une fiche de zone déroule, pour toutes les zones à la fois. Un champ décoché reste écrit : il cesse de paraître, et revient tel quel en le recochant.":
    "The fields an area's details show, for all areas at once. An unticked field stays written: it stops appearing, and comes back as it was when ticked again.",
  "Ces cases s'enregistrent dès qu'on les coche.": "These boxes are saved as soon as they are ticked.",
  "Enregistré.": "Saved.",
  "Échec : {raison}": "Failed: {raison}",
  "retirée du plan public": "removed from the public map",
  "Ce que vous écrivez est enregistré en quittant la fiche.": "What you write is saved when you leave these details.",

  // l'onglet « Plan »
  "Ce qui règle la journée d'un visiteur. Publiez la configuration pour que le changement parvienne aux visiteurs.":
    "What shapes a visitor's day. Publish the configuration for the change to reach visitors.",

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
  "min": "min",
  "Temps de visite par stand": "Visiting time per stand",
  "Sert à organiser la journée d'un visiteur depuis son parcours : c'est ce qui décide combien de stands tiennent entre deux conférences.":
    "Used to plan a visitor's day from their visit plan: it decides how many stands fit between two conferences.",
  "Du": "From",
  "au": "to",
  "Ouverture": "Opening",

  // les genres, qui filtrent les vignettes
  "Sans serif": "Sans serif",
  "Étroites": "Condensed",
  "Serif": "Serif",
  "Arrondies": "Rounded",
  "Haute lisibilité": "High legibility",
  "Affiche": "Display",
  "Manuscrites": "Handwritten",
  "Chasse fixe": "Monospace",
  // les noms des polices, identiques dans les deux langues
  "Archivo": "Archivo",
  "Barlow": "Barlow",
  "DM Sans": "DM Sans",
  "Fira Sans": "Fira Sans",
  "IBM Plex Sans": "IBM Plex Sans",
  "Instrument Sans": "Instrument Sans",
  "Inter": "Inter",
  "Jost": "Jost",
  "Lato": "Lato",
  "Manrope": "Manrope",
  "Montserrat": "Montserrat",
  "Noto Sans": "Noto Sans",
  "Open Sans": "Open Sans",
  "Plus Jakarta Sans": "Plus Jakarta Sans",
  "Poppins": "Poppins",
  "Raleway": "Raleway",
  "Roboto": "Roboto",
  "Source Sans 3": "Source Sans 3",
  "Space Grotesk": "Space Grotesk",
  "Work Sans": "Work Sans",
  "Anton": "Anton",
  "Archivo Narrow": "Archivo Narrow",
  "Barlow Condensed": "Barlow Condensed",
  "Bebas Neue": "Bebas Neue",
  "Fira Sans Condensed": "Fira Sans Condensed",
  "Oswald": "Oswald",
  "PT Sans Narrow": "PT Sans Narrow",
  "Roboto Condensed": "Roboto Condensed",
  "Bitter": "Bitter",
  "Cormorant Garamond": "Cormorant Garamond",
  "EB Garamond": "EB Garamond",
  "Fraunces": "Fraunces",
  "Libre Baskerville": "Libre Baskerville",
  "Lora": "Lora",
  "Merriweather": "Merriweather",
  "Playfair Display": "Playfair Display",
  "PT Serif": "PT Serif",
  "Roboto Slab": "Roboto Slab",
  "Source Serif 4": "Source Serif 4",
  "Comfortaa": "Comfortaa",
  "Fredoka": "Fredoka",
  "Nunito": "Nunito",
  "Quicksand": "Quicksand",
  "Varela Round": "Varela Round",
  "Andika": "Andika",
  "Atkinson Hyperlegible Next": "Atkinson Hyperlegible Next",
  "Lexend": "Lexend",
  "Abril Fatface": "Abril Fatface",
  "Alfa Slab One": "Alfa Slab One",
  "Archivo Black": "Archivo Black",
  "Bungee": "Bungee",
  "Righteous": "Righteous",
  "Caveat": "Caveat",
  "Dancing Script": "Dancing Script",
  "Kalam": "Kalam",
  "Patrick Hand": "Patrick Hand",
  "Courier Prime": "Courier Prime",
  "IBM Plex Mono": "IBM Plex Mono",
  "Inconsolata": "Inconsolata",
  "JetBrains Mono": "JetBrains Mono",
  "Roboto Mono": "Roboto Mono",
  "Space Mono": "Space Mono",
  // l'onglet « Fiche Stand » — le volet lui-même vit dans `reglage-fiche.js` ;
  // ces phrases-ci servent aussi à l'ordre des critères et aux aperçus
  "Aperçu": "Preview",
  "Monter": "Move up",
  "Descendre": "Move down",
  "Monter {champ}": "Move up {champ}",
  "Descendre {champ}": "Move down {champ}",
  "propre au salon": "specific to this show",

  // la barre d'administration
  "Télécharger une sauvegarde": "Download a backup",
  "Restaurer une sauvegarde…": "Restore a backup…",

  // la fiche d'une zone
  "Libellé": "Label",
  "Le nom de la zone, sur le plan comme sur sa fiche. Laissez vide pour revenir au nom d'origine, s'il y en a un.":
    "The area's name, on the map and in its details. Leave empty to go back to the original name, if there is one.",
  "Agora, Halte-garderie, Pitch Retail…": "Agora, Crèche, Pitch Retail…",
  "Libellé en français": "Label in French",
  "Libellé en anglais": "Label in English",
  "Le nom de la zone dans la version anglaise du plan. Laissé vide, c'est le libellé en français qui s'y affiche.":
    "The area's name in the English version of the map. Left empty, the French label is shown there.",
  "Agora, Childcare, Pitch Retail…": "Agora, Childcare, Pitch Retail…",
  "Description en français": "Description in French",
  "Description en anglais": "Description in English",
  "Ce que lit le visiteur de la version anglaise. Laissée vide, la fiche anglaise montre la description en français.":
    "What visitors read in the English version. Left empty, the English details show the French description.",
  "Type": "Type",
  "Ouvre l'entrée correspondante dans le cartouche des points d'intérêt, au bas du plan : le visiteur y retrouve d'un geste toutes les zones du même type. Sans type, la zone reste sur le plan comme aujourd'hui.":
    "Opens the matching entry in the points of interest panel, at the bottom of the map: visitors find all areas of the same type there in one tap. Without a type, the area stays on the map as it is today.",
  "L'itinéraire peut la traverser": "Routes can go through it",
  "Les trajets coupent par cette zone au lieu d'en faire le tour. À cocher sur un accueil, une agora, une esplanade — tout sol qu'on franchit à pied. À laisser décoché sur une réserve, un local technique, un espace clos : le trajet les contourne, comme un stand.":
    "Routes cut through this area instead of going around it. Tick it for a reception, an agora, a forecourt — any floor people walk across. Leave it unticked for a storeroom, a service room, an enclosed space: the route goes around them, like a stand.",
  "Ce qu'on trouve dans cette zone, ses horaires, ses conditions d'accès. Le libellé « Description » ne paraît sur la fiche que si vous en écrivez une.":
    "What you find in this area, its opening hours, how to get in. The “Description” heading only appears in the details if you write one.",
  "Une page où en savoir plus. Elle s'ouvre dans un nouvel onglet, et n'apparaît sur la fiche que si vous en donnez une.":
    "A page to find out more. It opens in a new tab, and only appears in the details if you give one.",
  "trouvée automatiquement": "found automatically",
  "choisie à la main": "chosen by hand",
  "rattachée à {zone}": "linked to {zone}",
  "à situer": "to be located",
  "Salles de conférence": "Conference rooms",
  "Le programme du salon, salle par salle. Cochez celles qui se tiennent dans cette zone : leurs conférences paraissent aussitôt sur sa fiche. Un rattachement choisi ici n'est plus modifié par les synchronisations suivantes.":
    "The show's programme, room by room. Tick the ones located in this area: their conferences appear straight away in its details. A link chosen here is no longer changed by later synchronisations.",
  "une zone absente du plan": "an area not on the map",
  "une zone sans nom": "an unnamed area",
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
  "L'image paraît dans l'en-tête de la fiche, au-dessus du type et du nom. Elle est réduite puis enregistrée dans la fiche : elle part avec le plan, sans dépendre d'un fichier hébergé ailleurs. Glissez-la sur la vignette, ou choisissez-la.":
    "The image appears at the top of the details, above the type and the name. It is reduced then saved in the details: it travels with the map, without depending on a file hosted elsewhere. Drag it onto the thumbnail, or choose it.",
  "Gras": "Bold",
  "Italique": "Italic",
  "Liste à puces": "Bulleted list",
  "Liste numérotée": "Numbered list",
  "Description de la zone": "Area description",
  "Ce qu'on trouve dans cette zone, ses horaires…": "What you find in this area, its opening hours…",
  "Poser": "Apply",
  "Poser un lien sur le texte choisi": "Add a link to the selected text",
  "Enregistrement de la zone impossible : {raison}": "Could not save the area: {raison}",
  "Changement impossible : {raison}": "Change failed: {raison}",

  // le placement des libellés
  "Glissez le libellé, ou ajustez-le aux flèches du clavier.": "Drag the label, or nudge it with the arrow keys.",
  "Glissez ce libellé pour le déplacer, ou tirez la taille.": "Drag this label to move it, or pull the size slider.",

  // la visite guidée, dans l'onglet « Admin » — le reste vit dans `tutoriel.js`
  "Essayer": "Try it",

  /* L'essai d'un vrai rappel, à côté de l'aperçu de la fenêtre. */
  "Essayer un vrai rappel": "Send a real reminder",
  "Envoi…": "Sending…",
  "Posé. La notification doit arriver dans la minute qui suit.":
    "Sent. The notification should arrive within the next minute.",
  "Les notifications n'ont pas été autorisées sur ce navigateur.":
    "Notifications were not allowed in this browser.",
  "Ouvrez d'abord votre plan public une fois sur ce navigateur : c'est lui qui installe le service qui reçoit les notifications.":
    "Open your public map once in this browser first: it is what installs the worker that receives notifications.",
  "Le salon n'est pas publié : le serveur refuse d'enregistrer un rappel.":
    "The show is not published: the server refuses to store a reminder.",
  "Ce navigateur ne sait pas recevoir de notifications. Sur iPhone, il faut avoir ajouté le plan à l'écran d'accueil.":
    "This browser cannot receive notifications. On iPhone, the map must have been added to the home screen.",
  /* Le rappel avant une conférence : ce que l'exploitant offre, et à quelle
     avance. */
  "Rappeler les conférences retenues": "Remind about picked conferences",
  "Prévenir avant le début": "Warn before the start",
  "Le visiteur qui a retenu une conférence peut demander à en être prévenu, plan fermé. Il lui faut l'autoriser, et sur iPhone avoir ajouté le plan à son écran d'accueil — sans quoi rien n'est proposé. Les heures et les titres retenus sont alors gardés sur nos serveurs jusqu'à la conférence.":
    "A visitor who picked a conference can ask to be reminded of it, with the map closed. They have to allow it, and on iPhone to have added the map to their home screen \u2014 otherwise nothing is offered. The times and titles they picked are then kept on our servers until the conference.",
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
  "Le programme de conférences n'est pas pris sur ce salon : il n'y a pas d'horaire à rappeler.":
    "The conference programme is not taken on this show: there is no time to remind anyone of.",

  // les marques, une planche par surface
  "Point d'angle": "Corner dot",
  "Coin corn\u00e9": "Folded corner",
  "\u00c9tincelle": "Sparkle",
  "Liser\u00e9": "Outline",
  "Point devant le nom": "Dot before the name",
  "Cartouche": "Tag",
  "Mention sous le nom": "Caption under the name",
  "Pastille": "Pill",
  "Bandeau": "Banner",
  // l'onglet « Parcours intelligent » : ce qu'un stand reçoit à la fois
  "Parcours intelligent": "Smart visit plan",
  // l'aperçu au pied du volet : ce que les réglages donnent sur ce salon-ci
  "Aucun emplacement n'est dessiné sur ce salon : la surface ne dit rien d'eux, et aucun ne porte de seuil.":
    "No stand is drawn on this show: floor area says nothing about them, and none of them carries a threshold.",
  "Sur ce salon : {n} emplacements dessinés. Seuil médian : {n2}.":
    "On this show: {n} stands drawn. Median threshold: {n2}.",
  "Sur ce salon : {n} emplacement dessiné. Seuil médian : {n2}.":
    "On this show: {n} stand drawn. Median threshold: {n2}.",
};
