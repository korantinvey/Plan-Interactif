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
import { brancheIci, montreBandeauIci, demarreIci } from "./ici.mjs";
import { brancheSuggestion } from "./suggestion.mjs";
import { TUTO, proposeTutoriel } from "./tutoriel.mjs";
import { finInstant } from "./sejour.mjs";
import { brancheJournee } from "./journee.mjs";
import { retireAdmin } from "./mode-admin.mjs";
import { libSel, placementLibelle } from "./libelle-place.mjs";
import { SORTE_GEO, appliqueAjouts, appliqueGeometries } from "./emplacements.mjs";
import { ITI, visee, poseVisee, dessineItineraire, rafraichitBouts, effaceItineraire, relance,
  bandeauVisee, finVisee, viseItineraire, visePoi, fermeItineraire, versItineraire, versItineraireDe,
  brancheTiroirItineraire } from "./tiroir-itineraire.mjs";
import { basculeParcours, poseToutAuParcours, brancheParcours, rafraichitParcours, rangParcours,
  remplitParcours, fermeParcours, videLeParcours, brancheTiroirParcours } from "./tiroir-parcours.mjs";
import { accueilleParcoursPartage } from "./parcours-recu.mjs";
import { brancheVue, emp, poseEmprise, vise, cadrePlan, figeTextes, appliqueVue, repeintLibelles,
  rafraichitVue, poseVue, masqueHaut, masque, masqueDroite, fit, stoppeZoom, glisseVers, rectVisee, zoom,
  versPlan } from "./vue.mjs";
import { CONF, brancheConfiguration, salonRange, ouvreConf, conf, jeton,
  programmeOffert, chercheSorte } from "./configuration.mjs";
import { trio } from "./couleurs.mjs";
import { brancheApparence } from "./apparence.mjs";
import { brancheHabillage, modeDist, couleurDist } from "./habillage.mjs";
import { P_NOM, P_CODE, branchePolices, posePoliceLibelles } from "./polices-plan.mjs";
import { SECTEURS, brancheSecteurs, indexeSecteurs, coloreSecteurs } from "./secteurs.mjs";
import { brancheBandes, majFondus } from "./bandes.mjs";
import { brancheRecherche, appliqueSecteurs, filtreTheme, PREFIXE_PERSO, themeFiltrable, clesCriteres,
  libelleCritere, valeursCritere, texteCriteres, texteAnglaisPerso, indexeCriteres, videCriteres, majVideQ,
  videRecherche, basculeCriteres, fermeCriteres, retraitLeve, reposeRetrait, visibleSurPlan,
  visibleSociete, marqueRetrait, appliqueFiltre, oublieRetrait, reprendRecherche, liste, marqueChoisie,
  VIGNETTES, prechargeLesVignettes } from "./recherche.mjs";
import { view, changeVue, svg } from "./vue.mjs";
import { brancheIndex } from "./index-salon.mjs";
import { brancheTonDeLaBarre } from "./ton-barre.mjs";
import { brancheDemarrage, chargeFond } from "./demarrage.mjs";
import { REDUIT, ETROIT } from "./ecran.mjs";
import { montre, brancheCorpsFiche } from "./corps-fiche.mjs";
import { anime, canalPlan, rangSociete, select, centre, brancheActesFiche, centrePoint, ficheConf,
  adresseVignette, dernierAppuiTactile, poseAppuiTactile, ecarteClicFantome, societes, poseMarque, poseCode,
  ouvre, ferme, onglet, brancheFiche } from "./fiche.mjs";
import { _lg, largeur } from "./texte-plan.mjs";
import { brancheLibelles, libelles, libellesWebgl } from "./libelles.mjs";
import { DISTINCTIONS, porteDist, standPorte, dessineDists, marquesListe, poseDistsFiche,
  refaitDistsFiche } from "./distinctions.mjs";
import { MONTE, brancheRendu, montePlan, changePlan } from "./rendu.mjs";
import { brancheCalquesDessin, DESSINS, mesCalques, calqueActif, outil }
  from "./calques-dessin.mjs";
import { estCadre } from "./chemin-forme.mjs";
import { rafraichitFleches, dessineDessins, redessineForme, apercu, apercuGuide, nomSurLePlan,
  societeDeForme, poseLibellesDessines, decoupeStand, marqueStandsDessines, signale } from "./dessin.mjs";
import { oublieReperes, reperesCherchables, vaAuRepere, ouvrePoi, phareZone,
  oublieChoixPoi } from "./points-interet.mjs";
import { appliqueOptions } from "./options.mjs";
import { enEdition } from "./edition-en-cours.mjs";
import { drag, pince, brancheGestes, brancheLangue } from "./gestes.mjs";
import { brancheTiroirs } from "./tiroirs.mjs";

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
  proposeTutoriel,
  finInstant,
  brancheJournee,
  retireAdmin,
  placementLibelle,
  appliqueAjouts, appliqueGeometries,
  ITI, poseVisee, dessineItineraire, rafraichitBouts, effaceItineraire, relance,
  bandeauVisee, finVisee, viseItineraire, visePoi, fermeItineraire, versItineraire, versItineraireDe,
  brancheTiroirItineraire,
  basculeParcours, poseToutAuParcours, brancheParcours, rafraichitParcours, rangParcours,
  remplitParcours, fermeParcours, videLeParcours, brancheTiroirParcours,
  accueilleParcoursPartage,
  branchePartage,
  brancheVue, poseEmprise, cadrePlan, figeTextes, appliqueVue, repeintLibelles, rafraichitVue, poseVue,
  masqueHaut, masque, masqueDroite, fit, stoppeZoom, glisseVers, rectVisee, zoom, versPlan,
  brancheConfiguration, salonRange, ouvreConf, conf, jeton,
  programmeOffert, chercheSorte,
  trio,
  brancheApparence,
  brancheHabillage, modeDist, couleurDist,
  branchePolices, posePoliceLibelles,
  brancheSecteurs, indexeSecteurs, coloreSecteurs,
  brancheBandes, majFondus,
  brancheRecherche, appliqueSecteurs, filtreTheme, PREFIXE_PERSO, themeFiltrable, clesCriteres,
  libelleCritere, valeursCritere, texteCriteres, texteAnglaisPerso, indexeCriteres, videCriteres, majVideQ,
  videRecherche, basculeCriteres, fermeCriteres, reposeRetrait, visibleSurPlan,
  visibleSociete, marqueRetrait, appliqueFiltre, oublieRetrait, reprendRecherche, liste, marqueChoisie,
  VIGNETTES, prechargeLesVignettes,
  changeVue, svg,
  brancheIndex,
  brancheTonDeLaBarre,
  brancheDemarrage, chargeFond,
  REDUIT, ETROIT,
  montre, brancheCorpsFiche,
  anime, canalPlan, rangSociete, select, centre, brancheActesFiche, centrePoint, ficheConf,
  adresseVignette, poseAppuiTactile, ecarteClicFantome, societes, poseMarque, poseCode,
  ouvre, ferme, onglet, brancheFiche,
  _lg, largeur,
  brancheLibelles, libelles, libellesWebgl,
  DISTINCTIONS, porteDist, standPorte, dessineDists, marquesListe, poseDistsFiche,
  refaitDistsFiche,
  brancheRendu, montePlan, changePlan,
  brancheCalquesDessin,
  mesCalques,
  estCadre,
  rafraichitFleches, dessineDessins, redessineForme, apercu, apercuGuide, nomSurLePlan,
  societeDeForme, poseLibellesDessines, decoupeStand, marqueStandsDessines, signale,
  oublieReperes, reperesCherchables, vaAuRepere, ouvrePoi, phareZone,
  oublieChoixPoi,
  appliqueOptions,
  enEdition,
  brancheGestes, brancheLangue,
  brancheTiroirs,
});

/* Les données du plan, que le module remplace à chaque chargement : le code
   soudé les lit par accesseur, et les remplace par `poseDonnees`. */
Object.defineProperties(globalThis, vivants({
  DATA: () => DATA, TOUS: () => TOUS, parId: () => parId, CONFS: () => CONFS,
  EXPOSANTS: () => EXPOSANTS, HEBERGES: () => HEBERGES, CONFERENCES: () => CONFERENCES,
  PAR_HEBERGE: () => PAR_HEBERGE,
}));

/* La visite guidée en cours, ou rien : le module la pose en la lançant et
   l'efface en la quittant. L'invitation à installer et la proposition des
   rappels la lisent par accesseur, pour ne pas passer devant elle. */
Object.defineProperties(globalThis, vivants({ TUTO: () => TUTO }, "lanceTutoriel"));

/* Le libellé qu'on retouche : le dessin des noms le lit par accesseur ; seul
   l'outil de l'exploitant le change (`placement-libelles.mjs`), hors de quoi
   il reste vide. */
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
/* La configuration du salon ouvert : le code soudé la lit encore, pour la
   confier au calcul de l'itinéraire ; seule l'ouverture d'un salon la
   remplace (`configuration.mjs` `ouvreConf`). On change ce qu'elle contient,
   jamais l'objet lui-même. */
Object.defineProperties(globalThis, vivants({ CONF: () => CONF }, "ouvreConf"));

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

/* La vue du plan : les gestes la remplacent sans cesse, le cadrage sur un
   trajet aussi. Le code soudé la lit par accesseur ; il la remplace par sa
   porte (`vue.mjs` `changeVue`), jamais par affectation. */
Object.defineProperties(globalThis, vivants({ view: () => view }, "changeVue"));

/* Le dernier appui était-il tactile ? Les gestes le posent à chaque doigt
   (`poseAppuiTactile`) et le relisent par accesseur ; la fiche s'en sert pour
   écarter le clic fantôme qui suit un appui. */
Object.defineProperties(globalThis, vivants({ dernierAppuiTactile: () => dernierAppuiTactile },
  "poseAppuiTactile"));
/* Le pavillon est-il monté ? Le panneau des calques et la police des noms
   attendent qu'il le soit ; seul le montage le pose (`rendu.mjs`
   `montePlan`). */
Object.defineProperties(globalThis, vivants({ MONTE: () => MONTE }, "montePlan"));

/* Les calques de dessin du salon ouvert : le chargement les lit par
   accesseur ; seule l'ouverture d'un salon les remplace (`calques-dessin.mjs`
   `ouvreDessins`). On change ce qu'ils contiennent, jamais l'objet lui-même. */
Object.defineProperties(globalThis, vivants({ DESSINS: () => DESSINS }, "ouvreDessins"));
/* Le calque ouvert au dessin et l'outil tenu : le code soudé les lit par
   accesseur ; seul l'outil de l'exploitant les change, par leurs portes, et
   le montage d'un pavillon referme le calque. */
Object.defineProperties(globalThis, vivants({ calqueActif: () => calqueActif }, "poseCalqueActif"));
Object.defineProperties(globalThis, vivants({ outil: () => outil }, "poseOutil"));
/* Le glissé et le pincement en cours : la carte graphique les lit par
   accesseur, pour taire son survol pendant un geste. Seules les écoutes que
   pose `brancheGestes` les changent. */
Object.defineProperties(globalThis, vivants({ drag: () => drag, pince: () => pince }, "brancheGestes"));
