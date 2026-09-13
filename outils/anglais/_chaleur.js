/* `outils/gabarit/_chaleur.html` — la carte de chaleur et son cartouche, le
   volet « Statistiques », la remise à zéro des compteurs. */
module.exports = {
  // le cartouche
  "{n} j": "{n} d",
  "Tout": "All",
  "emplacement": "stand",
  "{n} consultations": "{n} views",
  "{n} consultation": "{n} view",
  "Fiches ouvertes par stand": "Records opened per stand",
  "Période": "Period",
  "Déployer le cartouche": "Expand the panel",
  "Replier sur la légende": "Collapse to the legend",
  "· {n} vis.": "· {n} vis.",
  "Cet emplacement n'est plus au plan.": "This stand is no longer on the map.",
  "depuis le début": "since the start",
  "sur les {n} derniers jours": "over the last {n} days",
  "Aucune fiche ouverte {quand}.": "No records opened {quand}.",
  "Aucune consultation de fiche enregistrée pour ce salon : les compteurs par stand n'ont encore rien reçu.":
    "No record views recorded for this show: the per-stand counters have not received anything yet.",
  "{n} fiches d'exposant ouvertes {quand}, sur {n2} {emplacements}, par {n3} {visiteurs}.":
    "{n} exhibitor records opened {quand}, across {n2} {emplacements}, by {n3} {visiteurs}.",
  "{n} fiche d'exposant ouverte {quand}, sur {n2} {emplacements}, par {n3} {visiteurs}.":
    "{n} exhibitor record opened {quand}, across {n2} {emplacements}, by {n3} {visiteurs}.",
  "{n} fiches d'exposant ouvertes {quand}, sur {n2} {emplacements}.":
    "{n} exhibitor records opened {quand}, across {n2} {emplacements}.",
  "{n} fiche d'exposant ouverte {quand}, sur {n2} {emplacements}.":
    "{n} exhibitor record opened {quand}, across {n2} {emplacements}.",
  "visiteurs distincts": "unique visitors",
  "visiteur distinct": "unique visitor",
  "Consultations, non visiteurs uniques.": "Views, not unique visitors.",
  "La couleur suit les ouvertures ; les zones organisateur ne sont pas comptées.":
    "The colour follows the number of views; organiser areas are not counted.",
  "Comptage par stand depuis le {date}.": "Counted per stand since {date}.",
  "Fréquentation indisponible : {raison}": "Attendance unavailable: {raison}",
  "événement introuvable": "event not found",
  "Carte de chaleur": "Heat map",
  "non publié": "not published",
  "Une lecture pour l'exploitant : ce calque ne part jamais sur le plan public, et la publication de la configuration ne l'emporte pas.":
    "A view for the organiser: this layer never goes onto the public map, and publishing the configuration does not take it along.",

  // le volet « Statistiques »
  "Statistiques": "Statistics",
  "Le plan compte ce qu'on en fait : visites, recherches, itinéraires, et les fiches ouvertes stand par stand. Ces chiffres nourrissent le rapport d'utilisation et la carte de chaleur.":
    "The map counts how it is used: visits, searches, routes, and records opened stand by stand. These figures feed the usage report and the heat map.",
  "La recette gonfle ces compteurs — les fiches qu'on ouvre pour vérifier le plan sont comptées comme des visites, la page publique ne sachant pas qui la regarde. Remettez-les à zéro le jour où le salon ouvre, pour que le premier chiffre soit le bon.":
    "Testing inflates these counters — records opened to check the map count as visits, since the public page cannot tell who is looking at it. Reset them on the day the show opens, so that the first figure is the right one.",
  "Réinitialiser les compteurs…": "Reset the counters…",
  "Réinitialiser les compteurs": "Reset the counters",

  // la remise à zéro
  "Toute la mesure de ce salon sera effacée": "All of this show's measurements will be erased",
  ": visites, visiteurs, recherches, itinéraires, programmes de visite, et les consultations de chaque stand. Le rapport d'utilisation et la carte de chaleur repartent de zéro, pour tous les comptes.":
    ": visits, visitors, searches, routes, visit plans, and views of each stand. The usage report and the heat map start again from zero, for every account.",
  "Le plan lui-même n'est pas touché : emplacements, exposants, dessins, calques et réglages restent tels quels.":
    "The map itself is untouched: stands, exhibitors, drawings, layers and settings stay as they are.",
  "Cette action est irréversible. Aucune sauvegarde n'est conservée : ces chiffres ne pourront pas être retrouvés.":
    "This cannot be undone. No backup is kept: these figures cannot be recovered.",
  "Lecture des compteurs en cours…": "Reading the counters…",
  "réinitialiser": "reset",
  "Pour confirmer, tapez « {mot} » :": "To confirm, type “{mot}”:",
  "À effacer : {visites}, {visiteurs}, {recherches}, {fiches}, mesurés depuis le {date}.":
    "To be erased: {visites}, {visiteurs}, {recherches}, {fiches}, measured since {date}.",
  "{n} visites": "{n} visits",
  "{n} visite": "{n} visit",
  "{n} visiteurs": "{n} visitors",
  "{n} visiteur": "{n} visitor",
  "{n} recherches": "{n} searches",
  "{n} recherche": "{n} search",
  "{n} fiches d'exposant": "{n} exhibitor records",
  "{n} fiche d'exposant": "{n} exhibitor record",
  "Ce salon n'a encore aucune mesure : il n'y a rien à effacer.": "This show has no measurements yet: there is nothing to erase.",
  "Compteurs illisibles : {raison} — la remise à zéro échouerait de même.":
    "Counters unreadable: {raison} — the reset would fail in the same way.",
  "Réinitialiser": "Reset",
  "Effacement…": "Erasing…",
  "Compteurs remis à zéro : {n} lignes effacées.": "Counters reset: {n} rows erased.",
  "Compteurs remis à zéro : {n} ligne effacée.": "Counters reset: {n} row erased.",
  "Le salon repart de zéro.": "The show starts again from zero.",
  "Il n'y avait aucune mesure à effacer.": "There were no measurements to erase.",
  "Remise à zéro impossible : {raison}": "Reset failed: {raison}",
};
