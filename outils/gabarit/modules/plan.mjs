/* ============================================================
   Point d'entrée des trois pages du plan — public, démonstration,
   administration

   Le code du plan est encore soudé en un seul script classique, qui ne sait
   pas importer. Ce que les modules lui fournissent lui est donc confié par
   l'objet global, le temps qu'il devienne module à son tour : chaque nom qui
   quitte cette liste est un nom que le code soudé n'utilise plus.

   La liste est relue par les outils (`outils/modules.js`) : la relecture et
   les types la tiennent pour déclarée, la construction la pose avant le
   script du plan. On n'y met donc qu'un objet littéral de noms.
   ============================================================ */
import { $ } from "./dom.mjs";
import { esc, separeValeurs, COLLATION } from "./texte.mjs";
import { hslHex, rgbHex, hexa, luminance } from "./couleurs.mjs";
import { marquePrete, recadreMarque } from "./marque.mjs";
import { vivants } from "./vivant.mjs";
import { DATA, TOUS, parId, CONFS, EXPOSANTS, HEBERGES, CONFERENCES, PAR_HEBERGE, poseDonnees, state, P }
  from "./donnees.mjs";
import { API, SLUG, cheminDuSalon, cheminPartageable } from "./salon.mjs";
import { accesBase, base } from "./session.mjs";
import { RAPPELS_API, poussePossible, iOSsansInstallation, adresseDuRappel, empreinteDebut,
  abonnementCourant, abonne } from "./notifications.mjs";
import { ouvreModale, fermeModale, poseAvantFermeture, poseApresFermeture, brancheFenetre }
  from "./fenetre.mjs";
import { lien, adresseWeb, adresseSure, IMAGE_SURE, adresseImage, imageSure, assainitRiche }
  from "./sur.mjs";
import { arrondiGeo, empreinteGeo, anneauxGeo, traceGeo, boiteAnneaux, boiteGeo }
  from "./forme.mjs";
import { DEG, metresParDegre, versTerre, versLePlan, reancre, PX_TUILE, TOUR_MERCATOR, pixelsMercator,
  latitudeDePixel, echelleDesTuiles, niveauDesTuiles, aireDuContour, centreDuContour, axeDuContour }
  from "./terre.mjs";
import { JOURS, MOIS, momentLocal, jourLong, jourCourt, dateDeCle, jourBref, jourISO,
  minutesDe, ecritHeure, ecritMinutes, instantMural } from "./temps.mjs";
import { QR_VERSION_LISIBLE, qrTrame, qrChemin, qrSvg } from "./qr.mjs";
import { mesure, mesureOuverte, jetonMesure, supportMesure, renouvelleVisiteur, brancheMesure }
  from "./mesure.mjs";
import { appDuSalon, iconeDeLApplication } from "./application.mjs";
import { sponsorRetenu, ouvreSponsor, suitSponsor, resteSponsor, fermeSponsor, accueilleSponsor,
  brancheSponsor } from "./sponsor.mjs";
import { brancheItineraire, PAS_GRILLE, ALLURE, ALLURE_PMR, sommets, oublieGrilles, calquesDe, roleIti,
  anglePlan, grille, accroche, distancesDepuis, heureAuSalon, pointObjet, pointRepere, candidats,
  pointSaisi, portesDe, typeLiaison, nomRepere, oublieLiaisons, sortiesDe, plansRelies, routeEntre,
  mesureMarches, coupeMarche, distancesDesArrets, ecritDistance, ecritDuree, phraseLiaison, liensDe }
  from "./itineraire.mjs";
import { identifiantParcours, chargeParcours, signetParcours, boutonParcours, dessineMarques, marqueParcours,
  instantConf } from "./parcours.mjs";
import { demandeGardeParcours, branchePartage } from "./partage.mjs";
import { RENDU_WEBGL, GL, brancheWebgl, monteWebgl, vueWebgl, majEditionWebgl, planifieWebgl,
  poseModelesLibelles, cibleWebgl, priseWebgl, libelleSousWebgl, rectEcranWebgl } from "./webgl.mjs";
import { brancheEnvirons, recul, dessineFondCarte, poseMasqueCarte } from "./environs.mjs";
import { brancheRappels } from "./rappels.mjs";
import { brancheInstallation, nommeApplication, accueilleInvitation } from "./installation.mjs";
import { brancheBorne, pointBorne, poseLaBorne, poseBorneIci, montreBandeauBorne, ecritDepartBorne,
  dessineBorne, rafraichitBorne, demarreBorne } from "./borne.mjs";
import { ICI_ACTIF, brancheIci, montreBandeauIci, demarreIci } from "./ici.mjs";
import { brancheSuggestion } from "./suggestion.mjs";
import { TUTO, TUTO_DELAI, proposeTutoriel, brancheTutoriel } from "./tutoriel.mjs";
import { finInstant } from "./sejour.mjs";
import { brancheJournee } from "./journee.mjs";
import { ADMIN, retireAdmin } from "./mode-admin.mjs";
import { PLACE_LIBELLES, libSel, brancheLibellePlace, placementLibelle } from "./libelle-place.mjs";
import { SORTE_GEO, brancheEmplacements, appliqueAjouts, appliqueGeometries } from "./emplacements.mjs";
import { ITI, visee, poseVisee, dessineItineraire, rafraichitBouts, effaceItineraire, relance,
  bandeauVisee, finVisee, viseItineraire, visePoi, fermeItineraire, versItineraire, versItineraireDe,
  brancheTiroirItineraire } from "./tiroir-itineraire.mjs";
import { basculeParcours, poseToutAuParcours, brancheParcours, rafraichitParcours, rangParcours,
  remplitParcours, fermeParcours, videLeParcours, brancheTiroirParcours } from "./tiroir-parcours.mjs";
import { accueilleParcoursPartage, brancheParcoursRecu } from "./parcours-recu.mjs";
import { brancheVue, emp, poseEmprise, vise, cadrePlan, figeTextes, appliqueVue, repeintLibelles,
  rafraichitVue, poseVue, masqueHaut, masque, masqueDroite, fit, stoppeZoom, glisseVers, rectVisee, zoom,
  versPlan } from "./vue.mjs";
import { CONF, CLE_CONF, brancheConfiguration, salonRange, ouvreConf, reglagesDuSalon, conf, jeton,
  optionActive, programmeOffert, suggestionOfferte, chercheSorte } from "./configuration.mjs";
import { trio } from "./couleurs.mjs";
import { brancheApparence, appliqueApparence } from "./apparence.mjs";
import { brancheHabillage, modeDist, couleurDist } from "./habillage.mjs";
import { modeleRetenu, habilleModale } from "./modeles.mjs";
import { P_NOM, P_CODE, branchePolices, posePoliceLibelles } from "./polices-plan.mjs";
import { seuilGere, seuilImpose, seuilConcentration } from "./seuil.mjs";
import { minutesVisite, lueHeure, datesSalon, horairesSalon } from "./horaires.mjs";
import { SECTEURS, brancheSecteurs, indexeSecteurs, coloreSecteurs } from "./secteurs.mjs";
import { brancheBandes, majFondus } from "./bandes.mjs";
import { brancheRecherche, appliqueSecteurs, filtreTheme, PREFIXE_PERSO, themeFiltrable, clesCriteres,
  libelleCritere, valeursCritere, texteCriteres, texteAnglaisPerso, indexeCriteres, videCriteres, majVideQ,
  videRecherche, basculeCriteres, fermeCriteres, filtre, retraitLeve, reposeRetrait, visible, visibleSurPlan,
  visibleSociete, marqueRetrait, appliqueFiltre, oublieRetrait, reprendRecherche, liste, marqueChoisie,
  VIGNETTES, prechargeLesVignettes } from "./recherche.mjs";
import { REDUIT, ETROIT } from "./ecran.mjs";
import { montre, brancheCorpsFiche } from "./corps-fiche.mjs";
import { anime, canalPlan, rangSociete, select, centre, brancheActesFiche, centrePoint, ficheConf,
  adresseVignette, dernierAppuiTactile, poseAppuiTactile, ecarteClicFantome, societes, poseMarque, poseCode,
  ouvre, ferme, onglet, brancheFiche } from "./fiche.mjs";
import { brancheCalquesDessin, DESSINS, enAttente, ouvreDessins, notePubliees, rangeDessins, dejaPubliee,
  marqueAttente, mesCalques, calqueActif, outil, enCours, poseCalqueActif } from "./calques-dessin.mjs";
import { estCadre, cheminForme } from "./chemin-forme.mjs";
import { brancheDessin, rafraichitFleches, dessineDessins, redessineForme, apercu, apercuGuide, nomSurLePlan,
  societeDeForme, poseLibellesDessines, decoupeStand, marqueStandsDessines, signale } from "./dessin.mjs";
import { branchePointsInteret, oublieReperes, reperesCherchables, vaAuRepere, ouvrePoi, phareZone,
  oublieChoixPoi } from "./points-interet.mjs";

Object.assign(globalThis, {
  poseDonnees, state, P,
  $, esc, separeValeurs, COLLATION,
  hslHex, rgbHex, hexa, luminance,
  marquePrete, recadreMarque,
  API, SLUG, cheminDuSalon, cheminPartageable,
  accesBase, base,
  RAPPELS_API, poussePossible, iOSsansInstallation, adresseDuRappel, empreinteDebut,
  abonnementCourant, abonne,
  ouvreModale, fermeModale, poseAvantFermeture, poseApresFermeture, brancheFenetre,
  lien, adresseWeb, adresseSure, IMAGE_SURE, adresseImage, imageSure, assainitRiche,
  arrondiGeo, empreinteGeo, anneauxGeo, traceGeo, boiteAnneaux, boiteGeo,
  DEG, metresParDegre, versTerre, versLePlan, reancre, PX_TUILE, TOUR_MERCATOR, pixelsMercator,
  latitudeDePixel, echelleDesTuiles, niveauDesTuiles, aireDuContour, centreDuContour, axeDuContour,
  JOURS, MOIS, momentLocal, jourLong, jourCourt, dateDeCle, jourBref, jourISO,
  minutesDe, ecritHeure, ecritMinutes, instantMural,
  QR_VERSION_LISIBLE, qrTrame, qrChemin, qrSvg,
  mesure, mesureOuverte, jetonMesure, supportMesure, renouvelleVisiteur, brancheMesure,
  appDuSalon, iconeDeLApplication,
  sponsorRetenu, ouvreSponsor, suitSponsor, resteSponsor, fermeSponsor, accueilleSponsor,
  brancheSponsor,
  brancheItineraire, PAS_GRILLE, ALLURE, ALLURE_PMR, sommets, oublieGrilles, calquesDe, roleIti,
  anglePlan, grille, accroche, distancesDepuis, heureAuSalon, pointObjet, pointRepere, candidats,
  pointSaisi, portesDe, typeLiaison, nomRepere, oublieLiaisons, sortiesDe, plansRelies, routeEntre,
  mesureMarches, coupeMarche, distancesDesArrets, ecritDistance, ecritDuree, phraseLiaison, liensDe,
  identifiantParcours, chargeParcours, signetParcours, boutonParcours, dessineMarques, marqueParcours,
  instantConf,
  demandeGardeParcours,
  RENDU_WEBGL, GL, brancheWebgl, monteWebgl, vueWebgl, majEditionWebgl, planifieWebgl,
  poseModelesLibelles, cibleWebgl, priseWebgl, libelleSousWebgl, rectEcranWebgl,
  brancheEnvirons, recul, dessineFondCarte, poseMasqueCarte,
  brancheRappels,
  brancheInstallation, nommeApplication, accueilleInvitation,
  brancheBorne, pointBorne, poseLaBorne, poseBorneIci, montreBandeauBorne, ecritDepartBorne,
  dessineBorne, rafraichitBorne, demarreBorne,
  brancheIci, montreBandeauIci, demarreIci,
  brancheSuggestion,
  TUTO_DELAI, proposeTutoriel, brancheTutoriel,
  finInstant,
  brancheJournee,
  retireAdmin,
  brancheLibellePlace, placementLibelle,
  brancheEmplacements, appliqueAjouts, appliqueGeometries,
  ITI, poseVisee, dessineItineraire, rafraichitBouts, effaceItineraire, relance,
  bandeauVisee, finVisee, viseItineraire, visePoi, fermeItineraire, versItineraire, versItineraireDe,
  brancheTiroirItineraire,
  basculeParcours, poseToutAuParcours, brancheParcours, rafraichitParcours, rangParcours,
  remplitParcours, fermeParcours, videLeParcours, brancheTiroirParcours,
  accueilleParcoursPartage, brancheParcoursRecu,
  branchePartage,
  brancheVue, poseEmprise, cadrePlan, figeTextes, appliqueVue, repeintLibelles, rafraichitVue, poseVue,
  masqueHaut, masque, masqueDroite, fit, stoppeZoom, glisseVers, rectVisee, zoom, versPlan,
  brancheConfiguration, salonRange, ouvreConf, reglagesDuSalon, conf, jeton,
  optionActive, programmeOffert, suggestionOfferte, chercheSorte,
  trio,
  brancheApparence, appliqueApparence,
  brancheHabillage, modeDist, couleurDist,
  modeleRetenu, habilleModale,
  branchePolices, posePoliceLibelles,
  seuilGere, seuilImpose, seuilConcentration,
  minutesVisite, lueHeure, datesSalon, horairesSalon,
  brancheSecteurs, indexeSecteurs, coloreSecteurs,
  brancheBandes, majFondus,
  brancheRecherche, appliqueSecteurs, filtreTheme, PREFIXE_PERSO, themeFiltrable, clesCriteres,
  libelleCritere, valeursCritere, texteCriteres, texteAnglaisPerso, indexeCriteres, videCriteres, majVideQ,
  videRecherche, basculeCriteres, fermeCriteres, filtre, reposeRetrait, visible, visibleSurPlan,
  visibleSociete, marqueRetrait, appliqueFiltre, oublieRetrait, reprendRecherche, liste, marqueChoisie,
  VIGNETTES, prechargeLesVignettes,
  REDUIT, ETROIT,
  montre, brancheCorpsFiche,
  anime, canalPlan, rangSociete, select, centre, brancheActesFiche, centrePoint, ficheConf,
  adresseVignette, poseAppuiTactile, ecarteClicFantome, societes, poseMarque, poseCode,
  ouvre, ferme, onglet, brancheFiche,
  brancheCalquesDessin, enAttente, ouvreDessins, notePubliees, rangeDessins, dejaPubliee, marqueAttente,
  mesCalques, poseCalqueActif,
  estCadre, cheminForme,
  brancheDessin, rafraichitFleches, dessineDessins, redessineForme, apercu, apercuGuide, nomSurLePlan,
  societeDeForme, poseLibellesDessines, decoupeStand, marqueStandsDessines, signale,
  branchePointsInteret, oublieReperes, reperesCherchables, vaAuRepere, ouvrePoi, phareZone,
  oublieChoixPoi,
});

/* Les données du plan, que le module remplace à chaque chargement : le code
   soudé les lit par accesseur, et les remplace par `poseDonnees`. */
Object.defineProperties(globalThis, vivants({
  DATA: () => DATA, TOUS: () => TOUS, parId: () => parId, CONFS: () => CONFS,
  EXPOSANTS: () => EXPOSANTS, HEBERGES: () => HEBERGES, CONFERENCES: () => CONFERENCES,
  PAR_HEBERGE: () => PAR_HEBERGE,
}));

/* Le code affiché dans le hall est-il en cours ? La visite guidée le lit pour
   céder la place ; seul le module le change, en posant le point ou en
   l'éteignant (`poseIci`, `retireIci`). */
Object.defineProperties(globalThis, vivants({ ICI_ACTIF: () => ICI_ACTIF }, "poseIci"));

/* La visite guidée en cours, ou rien : le module la pose en la lançant et
   l'efface en la quittant. L'invitation à installer et la proposition des
   rappels la lisent par accesseur, pour ne pas passer devant elle. */
Object.defineProperties(globalThis, vivants({ TUTO: () => TUTO }, "lanceTutoriel"));

/* Le mode administration est-il ouvert ? Tout le plan le lit, public compris,
   souvent pour se taire hors de l'administration ; seule son ouverture le
   pose (`bande-admin.mjs` `activeAdmin`), et la page publique ne l'a pas. */
Object.defineProperties(globalThis, vivants({ ADMIN: () => ADMIN }, "activeAdmin"));

/* Le placement des libellés à la main, et le libellé qu'on retouche : le
   dessin des noms les lit par accesseur ; seul l'outil de l'exploitant les
   change (`placement-libelles.mjs`), hors de quoi ils restent faux et vides. */
Object.defineProperties(globalThis, vivants({ PLACE_LIBELLES: () => PLACE_LIBELLES },
  "modePlacementLibelles"));
Object.defineProperties(globalThis, vivants({ libSel: () => libSel }, "choisitLibelle"));

/* La couche dont l'exploitant reprend les formes, ou rien : le rendu par la
   carte graphique le lit par accesseur pour savoir si l'on édite ; seul
   l'outil de l'exploitant le change (`reprise-emplacements.mjs`), hors de
   quoi il reste vide. */
Object.defineProperties(globalThis, vivants({ SORTE_GEO: () => SORTE_GEO }, "modeGeometrie"));

/* La visée de l'itinéraire en cours, ou rien : la borne la lit encore par le
   code soudé, qui la lui confie. Elle ne change que par sa porte
   (`poseVisee`), par laquelle la borne l'arme pour elle. */
Object.defineProperties(globalThis, vivants({ visee: () => visee }, "poseVisee"));
/* L'emprise du pavillon, que le montage du plan remplace (`poseEmprise`), et
   la vue visée par un trajet en cours, que seul `glisseVers` pose : les gestes
   et la fiche les lisent par accesseur. */
Object.defineProperties(globalThis, vivants({ emp: () => emp }, "poseEmprise"));
Object.defineProperties(globalThis, vivants({ vise: () => vise }, "glisseVers"));
/* La configuration du salon ouvert, et la clé sous laquelle le poste la
   range : tout le plan les lit, à chaque réglage ; seule l'ouverture d'un
   salon les remplace (`configuration.mjs` `ouvreConf`). On change ce qu'elle
   contient, jamais l'objet lui-même. */
Object.defineProperties(globalThis, vivants({ CONF: () => CONF, CLE_CONF: () => CLE_CONF }, "ouvreConf"));

/* La graisse et la police des libellés du plan, que les mesures relisent à
   chaque tracé : seul le choix d'un modèle ou d'une police les remplace
   (`polices-plan.mjs` `posePoliceLibelles`). */
Object.defineProperties(globalThis, vivants({ P_NOM: () => P_NOM, P_CODE: () => P_CODE },
  "posePoliceLibelles"));

/* Les secteurs du salon, que l'index refait à chaque chargement : le code
   soudé les lit par accesseur ; seul `indexeSecteurs` les remplace. */
Object.defineProperties(globalThis, vivants({ SECTEURS: () => SECTEURS }, "indexeSecteurs"));
/* Le retrait du plan levé d'un clic hors du résultat : les gestes le lisent
   par accesseur ; seuls `oublieRetrait` et `reposeRetrait` le changent. */
Object.defineProperties(globalThis, vivants({ retraitLeve: () => retraitLeve }, "reposeRetrait"));
/* Le dernier appui était-il tactile ? Les gestes le posent à chaque doigt
   (`poseAppuiTactile`) et le relisent par accesseur ; la fiche s'en sert pour
   écarter le clic fantôme qui suit un appui. */
Object.defineProperties(globalThis, vivants({ dernierAppuiTactile: () => dernierAppuiTactile },
  "poseAppuiTactile"));

/* Les calques de dessin du salon ouvert : le chargement les lit par
   accesseur ; seule l'ouverture d'un salon les remplace (`calques-dessin.mjs`
   `ouvreDessins`). On change ce qu'ils contiennent, jamais l'objet lui-même. */
Object.defineProperties(globalThis, vivants({ DESSINS: () => DESSINS }, "ouvreDessins"));
/* Le calque ouvert au dessin, l'outil tenu et le tracé en cours : la carte
   graphique, la visite guidée et les gestes les lisent par accesseur ; seul
   l'outil de l'exploitant les change, par leurs portes, et le montage d'un
   pavillon referme le calque. */
Object.defineProperties(globalThis, vivants({ calqueActif: () => calqueActif }, "poseCalqueActif"));
Object.defineProperties(globalThis, vivants({ outil: () => outil }, "poseOutil"));
Object.defineProperties(globalThis, vivants({ enCours: () => enCours }, "poseEbauche"));
