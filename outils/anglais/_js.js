/* `outils/gabarit/_js.html` — l'index, la recherche et ses critères, la liste.
   La fiche d'un stand, d'une zone ou d'une conférence est dans `fiche.js` et
   `corps-fiche.js`. */
module.exports = {
  "Administration — {salon}": "Admin — {salon}",
  "{n} pavillons": "{n} halls",
  "{n} pavillon": "{n} hall",
  "Stand": "Stand",
  "Stand {code}": "Stand {code}",
  "Zone": "Area",
  "zone": "area",
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
  "Voir les résultats": "Show results",

  // la liste
  "{n} résultats": "{n} results",
  "{n} résultat": "{n} result",
  "tous pavillons": "all halls",
  "Zone sans nom": "Unnamed area",
  "Aucun résultat dans les {n} pavillons.": "No results in the {n} halls.",
  "Aucun résultat dans ce pavillon.": "No results in this hall.",
  "0 résultat": "0 results",

  // les distinctions d'un exposant — la table de `_js.html`, dont les onglets
  // des réglages et les volets d'aide tirent leurs mots
  "Nouveaux": "New arrivals",
  "Adhérents": "Members",
  "Adhérent syndicat": "Trade body member",
  "Adhérent": "Member",
  "les fiches des salons qui distinguent leurs nouveaux venus":
    "the records of shows that single out their newcomers",
  "les fiches des salons dont le syndicat tient la liste de ses membres":
    "the records of shows whose trade body keeps a list of its members",
};
