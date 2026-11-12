/* `outils/gabarit/modules/reglage-fiche.mjs` — le volet « Fiche Stand » des
   réglages : ce que la fiche d'un stand montre, dans quel ordre, sous quels
   titres. Seule l'administration le reçoit. */
module.exports = {
  "Ce que la fiche d'un stand montre, et dans quel ordre. Les champs dont ce salon dispose attendent à gauche : glissez-en un dans la fiche pour l'afficher, ressortez-le pour le masquer. Un champ qu'aucune fiche du salon ne renseigne n'y figure pas : il n'aurait rien à montrer, et c'est dans la console qu'on lui désigne son champ d'origine. Une section réunit plusieurs champs sous un même titre, et la case de chaque champ décide si son intitulé paraît devant sa valeur. L'en-tête — l'enseigne, le pavillon, le numéro de stand — et le volet des conférences n'en font pas partie : ils ne se déplacent pas.":
    "What a stand's details show, and in what order. The fields this show has to hand wait on the left: drag one into the details to show it, drag it back out to hide it. A field that no record of this show fills in is not listed: it would have nothing to show, and it is in the console that its source field is designated. A section gathers several fields under one title, and each field's tickbox decides whether its label appears before its value. The header — the brand, the hall, the stand number — and the conferences panel are not part of it: they don't move.",
  "Champs disponibles": "Fields available",
  "Tous les champs du salon sont sur la fiche.": "Every field of this show is in the details.",
  "Ce que la fiche montre": "What the details show",
  "Aucun champ : la fiche s'arrêtera à son en-tête.": "No field: the details will stop at their header.",
  "Nouvelle section": "New section",
  "Réunir des champs sous un titre écrit à la main.": "Gather fields under a title of your own.",
  "Aperçu": "Preview",
  "La fiche telle que le visiteur la recevra : l'habillage retenu pour ce salon, et les valeurs du stand qui remplit le mieux les champs affichés. Sur téléphone, les champs qui tiennent en un mot se rangent deux par deux.":
    "The details as visitors will get them: the template chosen for this show, and the values of the stand that best fills the fields shown. On phones, fields that fit in one word are laid out two by two.",

  // l'écriture du réglage, au pied de la fiche
  "Enregistrement…": "Saving…",
  "Enregistré.": "Saved.",
  "Échec : {raison}": "Failed: {raison}",

  // les lignes de champ et de section
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
};
