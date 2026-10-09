/* `outils/gabarit/modules/configuration.mjs` — les mots que la fenêtre
   « Réglages du plan » (`reglages.js`), la fiche d'une zone et les modules qui
   relisent la configuration (`apparence.mjs`, `reglage-recherche.mjs`…)
   partagent. `configuration.mjs`, que les trois pages du plan embarquent, les
   leur porte toutes, comme le faisait le code des options quand il vivait
   dans `_admin1.html`. */
module.exports = {
  // un mot de l'onglet « Recherche » que la fiche emploie aussi — l'onglet
  // lui-même vit dans `reglage-recherche.js`
  "Produits": "Products",

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
};
