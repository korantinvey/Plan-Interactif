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
import { API, SLUG, cheminDuSalon, cheminPartageable, BORNE } from "./salon.mjs";
import { accesBase, base } from "./session.mjs";
import { RAPPELS_API, poussePossible, iOSsansInstallation, adresseDuRappel, empreinteDebut,
  abonnementCourant, abonne } from "./notifications.mjs";
import { ouvreModale, fermeModale, confirme, poseAvantFermeture, poseApresFermeture, brancheFenetre }
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
import { PARCOURS, poseParcours, brancheListeParcours, identifiantParcours, casierParcours, dansParcours,
  chargeParcours, enregistreParcours, tientLeStockage, plurielParcours, contenuParcours, SIGNET,
  signetParcours, boutonParcours, rafraichitMarque, dessineMarques, marqueParcours, instantConf, cleTemps,
  nomDeStand, groupeParcours } from "./parcours.mjs";
import { CLE_LIEN_PARCOURS, litCodeParcours } from "./lien-parcours.mjs";
import { ouvrePartageParcours, demandeGardeParcours, poseGardeParcours } from "./partage.mjs";
import { RENDU_WEBGL, GL, brancheWebgl, monteWebgl, vueWebgl, majEditionWebgl, planifieWebgl,
  poseModelesLibelles, cibleWebgl, priseWebgl, libelleSousWebgl, rectEcranWebgl } from "./webgl.mjs";
import { brancheEnvirons, recul, dessineFondCarte, poseMasqueCarte } from "./environs.mjs";
import { brancheRappels, synchroniseRappels, reprendRappels, poseRappels, fenetreRappel }
  from "./rappels.mjs";
import { brancheInstallation, nommeApplication, accueilleInvitation } from "./installation.mjs";
import { brancheBorne, pointBorne, poseLaBorne, poseBorneIci, montreBandeauBorne, ecritDepartBorne,
  dessineBorne, rafraichitBorne, demarreBorne } from "./borne.mjs";
import { ICI_ACTIF, brancheIci, montreBandeauIci, demarreIci } from "./ici.mjs";
import { brancheSuggestion, SUGG_ECARTES, SUGG_MONTREES, poseSuggestion, fenetreSuggestion }
  from "./suggestion.mjs";
import { TUTO, TUTO_DELAI, proposeTutoriel, brancheTutoriel } from "./tutoriel.mjs";
import { finInstant } from "./sejour.mjs";
import { appliqueVueParcours, perimeJournee, oublieSejour, brancheJournee } from "./journee.mjs";
import { ADMIN, retireAdmin } from "./mode-admin.mjs";
import { PLACE_LIBELLES, libSel, brancheLibellePlace, placementLibelle } from "./libelle-place.mjs";
import { SORTE_GEO, brancheEmplacements, appliqueAjouts, appliqueGeometries } from "./emplacements.mjs";
import { ITI, visee, poseVisee, dessineItineraire, rafraichitBouts, effaceItineraire, relance,
  bandeauVisee, finVisee, viseItineraire, visePoi, fermeItineraire, versItineraire, versItineraireDe,
  brancheTiroirItineraire } from "./tiroir-itineraire.mjs";

Object.assign(globalThis, {
  poseDonnees, state, P,
  $, esc, separeValeurs, COLLATION,
  hslHex, rgbHex, hexa, luminance,
  marquePrete, recadreMarque,
  API, SLUG, cheminDuSalon, cheminPartageable, BORNE,
  accesBase, base,
  RAPPELS_API, poussePossible, iOSsansInstallation, adresseDuRappel, empreinteDebut,
  abonnementCourant, abonne,
  ouvreModale, fermeModale, confirme, poseAvantFermeture, poseApresFermeture, brancheFenetre,
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
  poseParcours, brancheListeParcours, identifiantParcours, casierParcours, dansParcours,
  chargeParcours, enregistreParcours, tientLeStockage, plurielParcours, contenuParcours, SIGNET,
  signetParcours, boutonParcours, rafraichitMarque, dessineMarques, marqueParcours, instantConf, cleTemps,
  nomDeStand, groupeParcours,
  CLE_LIEN_PARCOURS, litCodeParcours,
  ouvrePartageParcours, demandeGardeParcours, poseGardeParcours,
  RENDU_WEBGL, GL, brancheWebgl, monteWebgl, vueWebgl, majEditionWebgl, planifieWebgl,
  poseModelesLibelles, cibleWebgl, priseWebgl, libelleSousWebgl, rectEcranWebgl,
  brancheEnvirons, recul, dessineFondCarte, poseMasqueCarte,
  brancheRappels, synchroniseRappels, reprendRappels, poseRappels, fenetreRappel,
  brancheInstallation, nommeApplication, accueilleInvitation,
  brancheBorne, pointBorne, poseLaBorne, poseBorneIci, montreBandeauBorne, ecritDepartBorne,
  dessineBorne, rafraichitBorne, demarreBorne,
  brancheIci, montreBandeauIci, demarreIci,
  brancheSuggestion, SUGG_ECARTES, SUGG_MONTREES, poseSuggestion, fenetreSuggestion,
  TUTO_DELAI, proposeTutoriel, brancheTutoriel,
  finInstant,
  appliqueVueParcours, perimeJournee, oublieSejour, brancheJournee,
  retireAdmin,
  brancheLibellePlace, placementLibelle,
  brancheEmplacements, appliqueAjouts, appliqueGeometries,
  ITI, poseVisee, dessineItineraire, rafraichitBouts, effaceItineraire, relance,
  bandeauVisee, finVisee, viseItineraire, visePoi, fermeItineraire, versItineraire, versItineraireDe,
  brancheTiroirItineraire,
});

/* Les données du plan, que le module remplace à chaque chargement : le code
   soudé les lit par accesseur, et les remplace par `poseDonnees`. */
Object.defineProperties(globalThis, vivants({
  DATA: () => DATA, TOUS: () => TOUS, parId: () => parId, CONFS: () => CONFS,
  EXPOSANTS: () => EXPOSANTS, HEBERGES: () => HEBERGES, CONFERENCES: () => CONFERENCES,
  PAR_HEBERGE: () => PAR_HEBERGE,
}));

/* La liste du visiteur, que le module remplace au chargement, au vidage, et
   quand un parcours reçu prend sa place : le code soudé la lit par accesseur,
   et la remplace par `poseParcours`. */
Object.defineProperties(globalThis, vivants({
  PARCOURS: () => PARCOURS,
}, "poseParcours"));

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
