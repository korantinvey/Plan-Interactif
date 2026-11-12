/* `outils/gabarit/modules/recherche.mjs` — la recherche : les critères et
   leur panneau, la liste des résultats et la case qui dit la sorte d'une
   ligne. Les mots qu'elle partage avec la fiche — « Stand », « Zone » —
   restent dans `_js.js`. */
module.exports = {
  // la case d'une ligne qui n'est pas un stand
  "Conf": "Talk",
  "Repère": "Landmark",

  // les critères
  "Secteur": "Sector",
  "Ville": "City",
  "Pays": "Country",
  "Nomenclature": "Categories",
  "Thématiques": "Themes",
  "Retirer ce critère": "Remove this filter",
  "Retirer le critère {critere} {valeur}": "Remove filter {critere} {valeur}",
  "Tout effacer": "Clear all",
  "{n} exposants retenus": "{n} exhibitors match",
  "{n} exposant retenu": "{n} exhibitor matches",
  "0 exposant retenu": "0 exhibitors match",
  "aucune valeur relevée": "no values found",
  "retenu": "selected",
  "{n} retenue": "{n} selected",
  "{n} retenues": "{n} selected",
  "Aucune valeur sur les fiches. Vérifiez le champ d'origine de ce champ dans la console, puis lancez une synchronisation : les valeurs proposées ici viennent d'elle.":
    "No values on the exhibitor records. Check where this field comes from in the console, then run a synchronisation: the values offered here come from it.",
  "Aucune valeur ne correspond.": "No value matches.",
  "Filtrer {critere}…": "Filter {critere}…",

  // la liste
  "{n} résultats": "{n} results",
  "{n} résultat": "{n} result",
  "tous pavillons": "all halls",
  "Zone sans nom": "Unnamed area",
  "Aucun résultat dans les {n} pavillons.": "No results in the {n} halls.",
  "Aucun résultat dans ce pavillon.": "No results in this hall.",
  "0 résultat": "0 results",
};
