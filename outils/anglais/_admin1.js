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

  // l'onglet « Admin »
  "Ce que les visiteurs voient sur le plan. Publiez la configuration pour que le changement leur parvienne.":
    "What visitors see on the map. Publish the configuration for the change to reach them.",
  "Montrer les secteurs — couleurs et filtre": "Show sectors — colours and filter",
  "Suivre les allées une à une — pour un hall arrondi ou aux rangées désaccordées":
    "Follow the aisles one by one — for a rounded hall or one with uneven rows",
  "Compter les co-exposants sur le plan": "Count co-exhibitors on the map",
  "Afficher la liste des co-exposants au clic sur le stand": "Show the list of co-exhibitors when the stand is clicked",
  "min": "min",
  "Temps de visite par stand": "Visiting time per stand",
  "Sert à organiser la journée d'un visiteur depuis son parcours : c'est ce qui décide combien de stands tiennent entre deux conférences.":
    "Used to plan a visitor's day from their visit plan: it decides how many stands fit between two conferences.",
  "Dates et heures d'ouverture du salon": "Show dates and opening hours",
  "Du": "From",
  "au": "to",
  "Premier jour du salon": "First day of the show",
  "Dernier jour du salon": "Last day of the show",
  "Le dernier jour précède le premier : corrigez les dates pour régler les heures.":
    "The last day comes before the first: correct the dates to set the hours.",
  "Plus de {n} jours entre ces deux dates : seuls les {n2} premiers sont proposés. Vérifiez l'année.":
    "More than {n} days between these two dates: only the first {n2} are offered. Check the year.",
  "Une fermeture tombe avant l'ouverture : ce jour-là n'a pas d'heures tant qu'elle n'est pas corrigée.":
    "A closing time comes before the opening time: that day has no hours until it is corrected.",
  "Ouverture": "Opening",
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
  // l'onglet « Fiche Stand »
  "Ce que la fiche d'un stand montre, et dans quel ordre. Les champs dont ce salon dispose attendent à gauche : glissez-en un dans la fiche pour l'afficher, ressortez-le pour le masquer. Un champ qu'aucune fiche du salon ne renseigne n'y figure pas : il n'aurait rien à montrer, et c'est dans la console qu'on lui désigne son champ d'origine. Une section réunit plusieurs champs sous un même titre, et la case de chaque champ décide si son intitulé paraît devant sa valeur. L'en-tête — l'enseigne, le pavillon, le numéro de stand — et le volet des conférences n'en font pas partie : ils ne se déplacent pas.":
    "What a stand's details show, and in what order. The fields this show has to hand wait on the left: drag one into the details to show it, drag it back out to hide it. A field that no record of this show fills in is not listed: it would have nothing to show, and it is in the console that its source field is designated. A section gathers several fields under one title, and each field's tickbox decides whether its label appears before its value. The header — the brand, the hall, the stand number — and the conferences panel are not part of it: they don't move.",
  "Champs disponibles": "Fields available",
  "Tous les champs du salon sont sur la fiche.": "Every field of this show is in the details.",
  "Aucun champ : la fiche s'arrêtera à son en-tête.": "No field: the details will stop at their header.",
  "Nouvelle section": "New section",
  "Réunir des champs sous un titre écrit à la main.": "Gather fields under a title of your own.",
  "Aperçu": "Preview",
  "La fiche telle que le visiteur la recevra : l'habillage retenu pour ce salon, et les valeurs du stand qui remplit le mieux les champs affichés. Sur téléphone, les champs qui tiennent en un mot se rangent deux par deux.":
    "The details as visitors will get them: the template chosen for this show, and the values of the stand that best fills the fields shown. On phones, fields that fit in one word are laid out two by two.",
  "Monter": "Move up",
  "Descendre": "Move down",
  "Monter {champ}": "Move up {champ}",
  "Descendre {champ}": "Move down {champ}",
  "propre au salon": "specific to this show",
  "Afficher « {champ} » sur la fiche": "Show “{champ}” in the details",
  "Afficher l'intitulé de {champ}": "Show the label of {champ}",
  "Afficher l'intitulé devant la valeur.": "Show the label before the value.",
  "Retirer « {champ} » de la fiche": "Take “{champ}” out of the details",
  "Titre de la section": "Section title",
  "Défaire la section": "Undo the section",

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

  // la visite guidée, dans l'onglet « Admin » — le reste vit dans `_tutoriel.js`
  "Proposer la visite guidée au premier démarrage": "Offer the guided tour on first launch",
  "Le visiteur y fait lui-même chaque geste. Sur ce salon :": "Visitors make every move themselves. On this show:",
  "Proposée une fois par appareil.": "Offered once per device.",
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
  "Rien à présenter sur ce salon : ni programme rattaché à une zone, ni parcours de visite, ni itinéraire.":
    "Nothing to present on this show: no programme linked to an area, no visit plan, no directions.",
  /* Le rappel avant une conférence : ce que l'exploitant offre, et à quelle
     avance. */
  "Rappeler les conférences retenues": "Remind about picked conferences",
  "Prévenir avant le début": "Warn before the start",
  "Le visiteur qui a retenu une conférence peut demander à en être prévenu, plan fermé. Il lui faut l'autoriser, et sur iPhone avoir ajouté le plan à son écran d'accueil — sans quoi rien n'est proposé. Les heures et les titres retenus sont alors gardés sur nos serveurs jusqu'à la conférence.":
    "A visitor who picked a conference can ask to be reminded of it, with the map closed. They have to allow it, and on iPhone to have added the map to their home screen \u2014 otherwise nothing is offered. The times and titles they picked are then kept on our servers until the conference.",
  /* Les options du plan, dans l'onglet « Admin » : ce que le salon a pris, et
     ce que fermer une option retire. */
  "Les options du plan": "The map's options",
  "Ce que ce salon a pris. Une option fermée grise ce qui y mène — un outil de la boîte à outils, un bouton du plan, un onglet de ces réglages — pour vous, et le retire au visiteur, sans défaire le travail fait dessous : la rouvrir le retrouve.":
    "What this show has taken. A closed option greys out the way in \u2014 a tool from the toolbox, a button on the map, a tab in these settings \u2014 for you, and removes it for the visitor, without undoing the work done underneath: reopening it brings that back.",
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
  // le texte que l'exploitant écrit sur la marque. Ce qu'il y met est une
  // donnée : il paraît tel quel dans les deux langues, l'aide le dit.
  "Texte de la marque": "Text of the mark",
  "Ce que la marque écrit : la pastille, le bandeau et la mention sous le nom le portent en entier, le cartouche et le coin corné n'en tiennent que deux ou trois mots. Laissez vide pour « Nouvel exposant ». Le texte s'affiche tel quel, y compris sur la version anglaise du plan.":
    "What the mark writes: the pill, the banner and the caption under the name carry it in full; the tag and the folded corner hold only two or three words. Leave empty for \u201cNew exhibitor\u201d. The text shows as typed, on the English version of the map too.",
  "Ce que la marque écrit : la pastille, le bandeau et la mention sous le nom le portent en entier, le cartouche et le coin corné n'en tiennent que deux ou trois mots. Laissez vide pour « Adhérent syndicat ». Le texte s'affiche tel quel, y compris sur la version anglaise du plan.":
    "What the mark writes: the pill, the banner and the caption under the name carry it in full; the tag and the folded corner hold only two or three words. Leave empty for \u201cTrade body member\u201d. The text shows as typed, on the English version of the map too.",
  // l'onglet « Parcours intelligent » : ce qu'un stand reçoit à la fois
  "Parcours intelligent": "Smart visit plan",
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
  // l'aperçu au pied du volet : ce que les réglages donnent sur ce salon-ci
  "Aucun emplacement n'est dessiné sur ce salon : la surface ne dit rien d'eux, et aucun ne porte de seuil.":
    "No stand is drawn on this show: floor area says nothing about them, and none of them carries a threshold.",
  "Sur ce salon : {n} emplacements dessinés. Seuil médian : {n2}.":
    "On this show: {n} stands drawn. Median threshold: {n2}.",
  "Sur ce salon : {n} emplacement dessiné. Seuil médian : {n2}.":
    "On this show: {n} stand drawn. Median threshold: {n2}.",
};
