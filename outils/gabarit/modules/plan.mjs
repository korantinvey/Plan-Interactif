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
import { vivants } from "./vivant.mjs";
import { P } from "./donnees.mjs";
import { SLUG } from "./salon.mjs";
import { base } from "./session.mjs";
import { brancheFenetre } from "./fenetre.mjs";
import { lien, adresseSure, adresseImage, imageSure, assainitRiche } from "./sur.mjs";
import { mesure, brancheMesure } from "./mesure.mjs";
import { brancheSponsor } from "./sponsor.mjs";
import { brancheItineraire } from "./itineraire.mjs";
import { instantConf } from "./parcours.mjs";
import { branchePartage } from "./partage.mjs";
import { GL, brancheWebgl, rectEcranWebgl } from "./webgl.mjs";
import { brancheEnvirons } from "./environs.mjs";
import { brancheRappels } from "./rappels.mjs";
import { brancheInstallation } from "./installation.mjs";
import { brancheBorne, rafraichitBorne } from "./borne.mjs";
import { brancheIci } from "./ici.mjs";
import { brancheSuggestion } from "./suggestion.mjs";
import { TUTO } from "./tutoriel.mjs";
import { finInstant } from "./sejour.mjs";
import { brancheJournee } from "./journee.mjs";
import { retireAdmin } from "./mode-admin.mjs";
import { SORTE_GEO } from "./emplacements.mjs";
import { ITI, visee, poseVisee, rafraichitBouts, effaceItineraire, relance, bandeauVisee, fermeItineraire,
  brancheTiroirItineraire } from "./tiroir-itineraire.mjs";
import { basculeParcours, poseToutAuParcours, brancheParcours, rafraichitParcours, rangParcours,
  remplitParcours, fermeParcours, videLeParcours, brancheTiroirParcours } from "./tiroir-parcours.mjs";
import { brancheVue, cadrePlan, appliqueVue } from "./vue.mjs";
import { CONF, brancheConfiguration, conf } from "./configuration.mjs";
import { brancheApparence } from "./apparence.mjs";
import { brancheHabillage } from "./habillage.mjs";
import { P_NOM, P_CODE, branchePolices } from "./polices-plan.mjs";
import { SECTEURS, brancheSecteurs } from "./secteurs.mjs";
import { brancheBandes } from "./bandes.mjs";
import { brancheRecherche, PREFIXE_PERSO, libelleCritere, fermeCriteres, liste } from "./recherche.mjs";
import { view, svg } from "./vue.mjs";
import { brancheIndex } from "./index-salon.mjs";
import { brancheTonDeLaBarre } from "./ton-barre.mjs";
import { brancheDemarrage, chargeFond } from "./demarrage.mjs";
import { brancheCorpsFiche } from "./corps-fiche.mjs";
import { select, centre, ficheConf, adresseVignette, ouvre, ferme, onglet, brancheFiche } from "./fiche.mjs";
import { _lg, largeur } from "./texte-plan.mjs";
import { brancheLibelles, libelles, libellesWebgl } from "./libelles.mjs";
import { DISTINCTIONS, porteDist, standPorte, dessineDists, marquesListe, poseDistsFiche,
  refaitDistsFiche } from "./distinctions.mjs";
import { MONTE, brancheRendu, montePlan, changePlan } from "./rendu.mjs";
import { brancheCalquesDessin, DESSINS, mesCalques, calqueActif }
  from "./calques-dessin.mjs";
import { estCadre } from "./chemin-forme.mjs";
import { rafraichitFleches, dessineDessins, redessineForme, apercuGuide, nomSurLePlan, societeDeForme,
  poseLibellesDessines, decoupeStand, marqueStandsDessines, signale } from "./dessin.mjs";
import { reperesCherchables, vaAuRepere, phareZone } from "./points-interet.mjs";
import { appliqueOptions } from "./options.mjs";
import { enEdition } from "./edition-en-cours.mjs";
import { drag, pince, brancheGestes, brancheLangue } from "./gestes.mjs";
import { brancheTiroirs } from "./tiroirs.mjs";

Object.assign(globalThis, {
  P,
  $,
  SLUG,
  base,
  brancheFenetre,
  lien, adresseSure, adresseImage, imageSure, assainitRiche,
  mesure, brancheMesure,
  brancheSponsor,
  brancheItineraire,
  instantConf,
  GL, brancheWebgl,
  rectEcranWebgl,
  brancheEnvirons,
  brancheRappels,
  brancheInstallation,
  brancheBorne,
  rafraichitBorne,
  brancheIci,
  brancheSuggestion,
  finInstant,
  brancheJournee,
  retireAdmin,
  ITI, poseVisee, rafraichitBouts, effaceItineraire, relance,
  bandeauVisee, fermeItineraire,
  brancheTiroirItineraire,
  basculeParcours, poseToutAuParcours, brancheParcours, rafraichitParcours, rangParcours,
  remplitParcours, fermeParcours, videLeParcours, brancheTiroirParcours,
  branchePartage,
  brancheVue, cadrePlan, appliqueVue,
  brancheConfiguration, conf,
  brancheApparence,
  brancheHabillage,
  branchePolices,
  brancheSecteurs,
  brancheBandes,
  brancheRecherche, PREFIXE_PERSO,
  libelleCritere,
  fermeCriteres,
  liste,
  svg,
  brancheIndex,
  brancheTonDeLaBarre,
  brancheDemarrage, chargeFond,
  brancheCorpsFiche,
  select, centre, ficheConf,
  adresseVignette,
  ouvre, ferme, onglet, brancheFiche,
  _lg, largeur,
  brancheLibelles, libelles, libellesWebgl,
  DISTINCTIONS, porteDist, standPorte, dessineDists, marquesListe, poseDistsFiche,
  refaitDistsFiche,
  brancheRendu, montePlan, changePlan,
  brancheCalquesDessin,
  mesCalques,
  estCadre,
  rafraichitFleches, dessineDessins, redessineForme, apercuGuide, nomSurLePlan,
  societeDeForme, poseLibellesDessines, decoupeStand, marqueStandsDessines, signale,
  reperesCherchables, vaAuRepere, phareZone,
  appliqueOptions,
  enEdition,
  brancheGestes, brancheLangue,
  brancheTiroirs,
});

/* La visite guidée en cours, ou rien : le module la pose en la lançant et
   l'efface en la quittant. La proposition des rappels la lit par accesseur,
   confiée par le code soudé, pour ne pas passer devant elle. */
Object.defineProperties(globalThis, vivants({ TUTO: () => TUTO }, "lanceTutoriel"));

/* La couche dont l'exploitant reprend les formes, ou rien : le rendu par la
   carte graphique le lit par accesseur pour savoir si l'on édite ; seul
   l'outil de l'exploitant le change (`reprise-emplacements.mjs`), hors de
   quoi il reste vide. */
Object.defineProperties(globalThis, vivants({ SORTE_GEO: () => SORTE_GEO }, "modeGeometrie"));

/* La visée de l'itinéraire en cours, ou rien : la borne la lit encore par le
   code soudé, qui la lui confie. Elle ne change que par sa porte
   (`poseVisee`), par laquelle la borne l'arme pour elle. */
Object.defineProperties(globalThis, vivants({ visee: () => visee }, "poseVisee"));
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

/* La vue du plan : les gestes la remplacent sans cesse, le cadrage sur un
   trajet aussi. Le code soudé la lit par accesseur ; il la remplace par sa
   porte (`vue.mjs` `changeVue`), jamais par affectation. */
Object.defineProperties(globalThis, vivants({ view: () => view }, "changeVue"));

/* Le pavillon est-il monté ? Le panneau des calques et la police des noms
   attendent qu'il le soit ; seul le montage le pose (`rendu.mjs`
   `montePlan`). */
Object.defineProperties(globalThis, vivants({ MONTE: () => MONTE }, "montePlan"));

/* Les calques de dessin du salon ouvert : le chargement les lit par
   accesseur ; seule l'ouverture d'un salon les remplace (`calques-dessin.mjs`
   `ouvreDessins`). On change ce qu'ils contiennent, jamais l'objet lui-même. */
Object.defineProperties(globalThis, vivants({ DESSINS: () => DESSINS }, "ouvreDessins"));
/* Le calque ouvert au dessin : le code soudé le lit par accesseur ; seul
   l'outil de l'exploitant le change, par sa porte, et le montage d'un
   pavillon le referme. */
Object.defineProperties(globalThis, vivants({ calqueActif: () => calqueActif }, "poseCalqueActif"));
/* Le glissé et le pincement en cours : la carte graphique les lit par
   accesseur, pour taire son survol pendant un geste. Seules les écoutes que
   pose `brancheGestes` les changent. */
Object.defineProperties(globalThis, vivants({ drag: () => drag, pince: () => pince }, "brancheGestes"));
