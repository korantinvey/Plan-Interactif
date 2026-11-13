/* `outils/gabarit/modules/fige-carte.mjs` — le fond figé, photographié par
   l'exploitant : l'avancement de la photographie, ce qui l'arrête, et l'état
   du lot dit dans le volet « Environs ». */
module.exports = {
  // l'avancement
  "Photographie du fond : préparation…": "Capturing the base map: preparing…",
  "Photographie du fond : {n} / {n2} images…": "Capturing the base map: {n} / {n2} images…",

  // ce qui l'arrête, dit après « Échec : »
  "les tuiles n'arrivent pas": "the tiles are not arriving",
  "le style ne répond pas": "the map style is not answering",
  "aucun fond retenu": "no base map chosen",
  "ce pavillon n'a pas d'emprise": "this hall has no extent",
  "style refusé": "style rejected",
  "photographie remplacée par une plus récente": "capture superseded by a newer one",
  "vue impossible à peindre": "view cannot be drawn",
  "image illisible": "unreadable image",

  // l'état du lot, dans le volet
  "Le fond a changé depuis sa dernière photographie : enregistrez le calage pour le figer de nouveau. D'ici là, chaque visiteur le dessine en direct.":
    "The base map has changed since it was last captured: save the alignment to freeze it again. Until then, each visitor draws it live.",
  "Le fond n'est pas encore figé : chaque visiteur le dessine en direct. Enregistrez le calage pour le figer.":
    "The base map is not frozen yet: each visitor draws it live. Save the alignment to freeze it.",
  "Fond figé le {date} — {n} images, {n2} Mo : les visiteurs ne chargent ni moteur de carte ni tuiles.":
    "Base map frozen on {date} — {n} images, {n2} MB: visitors load neither a map engine nor tiles.",
};
