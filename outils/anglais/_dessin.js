/* `outils/gabarit/_dessin.html` — les calques de dessin : les types de repères
   et de zones, la boîte à outils, les aides qui accompagnent chaque outil. */
module.exports = {
  "Mémoire du navigateur pleine : allégez ou supprimez une image.": "Browser storage is full: shrink or delete an image.",
  "Rien à annuler.": "Nothing to undo.",

  // ce qu'un repère est
  "Sans pictogramme": "No icon",
  "Accessibilité": "Accessibility",
  "Accueil": "Reception",
  "Ascenseur": "Lift",
  "Café": "Café",
  "Distributeur": "Cash machine",
  "Entrée": "Entrance",
  "Entrée/Sortie": "Entrance/Exit",
  "Escalator": "Escalator",
  "Escalier": "Stairs",
  "Information": "Information",
  "Parking": "Car park",
  "Restauration": "Food & drink",
  "Salle de réunion": "Meeting room",
  "Secours": "First aid",
  "Sortie": "Exit",
  "Vestiaire": "Cloakroom",
  "WC": "Toilets",
  // ce qu'une zone est
  "Sans type": "No type",

  "Mène à": "Leads to",
  "Images": "Images",
  "Image posée au centre de la vue. Glissez sur le plan pour en poser une autre.":
    "Image placed in the centre of the view. Drag on the map to place another one.",
  "Image illisible.": "Unreadable image.",
  "Choisissez d'abord l'exposant à matérialiser.": "Choose the exhibitor to draw first.",
  "Choisissez d’abord une image.": "Choose an image first.",

  // l'aide sous les outils
  "Glissez pour déplacer, les carrés pour redimensionner.": "Drag to move, use the squares to resize.",
  "Cliquez une forme de ce calque pour la modifier.": "Click a shape on this layer to edit it.",
  "Cliquez-glissez pour tracer un rectangle.": "Click and drag to draw a rectangle.",
  "Un clic par sommet, Entrée pour fermer, Échap pour annuler.": "One click per corner, Enter to close, Esc to cancel.",
  "Un clic par angle du hall. Revenez sur le premier point, ou Entrée, pour fermer le contour.":
    "One click per corner of the hall. Come back to the first point, or press Enter, to close the outline.",
  "Un clic par point, Entrée pour terminer, Échap pour annuler.": "One click per point, Enter to finish, Esc to cancel.",
  "Saisissez le texte, puis cliquez à l'emplacement voulu.": "Type the text, then click where you want it.",
  "Choisissez ou saisissez un libellé, puis cliquez à l'emplacement.": "Choose or type a label, then click where it goes.",
  "Choisissez l'exposant, puis cliquez-glissez sur sa part du stand.": "Choose the exhibitor, then click and drag over its part of the stand.",
  "Glissez sur le plan pour poser une autre copie.": "Drag on the map to place another copy.",
  "Choisissez une image, ou déposez le fichier sur le plan.": "Choose an image, or drop the file onto the map.",
  "{aide} ({n} points)": "{aide} ({n} points)",
  "{aide} ({n} point)": "{aide} ({n} point)",
  "Un clic simple repose {largeur} × {hauteur} m.": "A single click places {largeur} × {hauteur} m again.",
  "« {exposant} » matérialisé. Choisissez l'exposant suivant.": "“{exposant}” drawn. Choose the next exhibitor.",
  /* Et ce que dit une image posée : à qui elle mène, ou qu'elle ne mène nulle
     part — la seule chose que le plan ne montre pas d'elle. */
  "Image posée sur « {exposant} » : la toucher ouvrira sa fiche.":
    "Image placed on “{exposant}”: touching it will open their details.",
  "Image posée. Elle n'ouvre aucune fiche : nommez un exposant pour cela.":
    "Image placed. It opens no details: name an exhibitor for that.",
  "Dessin": "Drawing",

  // le rôle du calque dans les itinéraires
  "Ce calque n'entre pas dans le calcul des trajets.": "This layer plays no part in working out routes.",
  "Ce qui est dessiné ici barre le passage à tout le monde : entourez les sanitaires, les locaux, les réserves. C'est le plus court chemin — quelques rectangles au lieu de toutes les allées.":
    "Whatever is drawn here blocks the way for everyone: outline the toilets, the service rooms, the storerooms. It is the quickest way — a few rectangles instead of every aisle.",
  "Ce qui est dessiné ici n'est contourné qu'en itinéraire accessible : escaliers, escalators, pentes, emmarchements, estrades. Un pictogramme posé dessus les signale au visiteur, il ne les fait pas éviter.":
    "Whatever is drawn here is only avoided on the accessible route: stairs, escalators, slopes, steps, stages. An icon placed on them points them out to visitors, it does not make the route avoid them.",
  "Les trajets ne sortiront plus de ce qui est dessiné ici, et il faudra donc tracer toutes les allées. Faites-les telles qu'elles sont : le dégagement au bord est retiré tout seul.":
    "Routes will no longer leave what is drawn here, so every aisle will have to be drawn. Draw them as they are: the clearance along the edges is taken off automatically.",
  "Ce qui est dessiné ici ne s'ouvre qu'en itinéraire accessible, et reste fermé aux autres : le couloir qui mène à l'ascenseur, la rampe qui contourne les marches. Faites-le mordre d'un bon mètre sur l'allée qu'il rejoint, sans quoi il débouche sur un mur — cette morsure se ferme aux autres comme le reste, ne barrez donc pas l'allée en travers.":
    "Whatever is drawn here only opens on the accessible route, and stays closed to everyone else: the corridor leading to the lift, the ramp that goes around the steps. Make it overlap the aisle it joins by a good metre, otherwise it leads into a wall — that overlap is closed to others like the rest, so don't draw it right across the aisle.",
  "{aide} Masquer le calque ne change rien au calcul : le dessin disparaît de l'écran, pas du terrain.":
    "{aide} Hiding the layer changes nothing in the calculation: the drawing disappears from the screen, not from the ground.",

  "Nouveau calque": "New layer",
  "Calque {n}": "Layer {n}",
  "Nom du calque": "Layer name",
  "Valider": "OK",
};
