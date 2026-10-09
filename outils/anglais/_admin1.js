/* `outils/gabarit/_admin1.html` — les réglages que le plan relit, les onglets
   « Recherche » et « Admin » qui les écrivent, et les mots que la fenêtre
   « Réglages du plan » (`reglages.js`) et la fiche d'une zone partagent avec
   eux. */
module.exports = {
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
