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
import { vivants } from "./vivant.mjs";
import { SLUG } from "./salon.mjs";
import { brancheFenetre } from "./fenetre.mjs";
import { adresseSure, adresseImage, imageSure, assainitRiche } from "./sur.mjs";
import { brancheMesure } from "./mesure.mjs";
import { brancheSponsor } from "./sponsor.mjs";
import { brancheItineraire } from "./itineraire.mjs";
import { instantConf } from "./parcours.mjs";
import { branchePartage } from "./partage.mjs";
import { GL, brancheWebgl, rectEcranWebgl } from "./webgl.mjs";
import { brancheRappels } from "./rappels.mjs";
import { brancheInstallation } from "./installation.mjs";
import { brancheBorne } from "./borne.mjs";
import { brancheIci } from "./ici.mjs";
import { brancheSuggestion } from "./suggestion.mjs";
import { TUTO } from "./tutoriel.mjs";
import { finInstant } from "./sejour.mjs";
import { brancheJournee } from "./journee.mjs";
import { retireAdmin } from "./mode-admin.mjs";
import { brancheTiroirItineraire } from "./tiroir-itineraire.mjs";
import { basculeParcours, brancheParcours, rafraichitParcours, rangParcours,
  remplitParcours, fermeParcours, brancheTiroirParcours } from "./tiroir-parcours.mjs";
import { brancheVue, cadrePlan } from "./vue.mjs";
import { CONF, brancheConfiguration } from "./configuration.mjs";
import { brancheApparence } from "./apparence.mjs";
import { brancheHabillage } from "./habillage.mjs";
import { P_NOM, P_CODE, branchePolices } from "./polices-plan.mjs";
import { SECTEURS } from "./secteurs.mjs";
import { brancheBandes } from "./bandes.mjs";
import { brancheRecherche, PREFIXE_PERSO, libelleCritere, fermeCriteres, liste } from "./recherche.mjs";
import { view, svg } from "./vue.mjs";
import { brancheTonDeLaBarre } from "./ton-barre.mjs";
import { brancheDemarrage } from "./demarrage.mjs";
import { brancheCorpsFiche } from "./corps-fiche.mjs";
import { ferme, brancheFiche } from "./fiche.mjs";
import { _lg, largeur } from "./texte-plan.mjs";
import { brancheLibelles, libelles } from "./libelles.mjs";
import { DISTINCTIONS, dessineDists, poseDistsFiche,
  refaitDistsFiche } from "./distinctions.mjs";
import { MONTE, montePlan, changePlan } from "./rendu.mjs";
import { DESSINS, mesCalques, calqueActif }
  from "./calques-dessin.mjs";
import { estCadre } from "./chemin-forme.mjs";
import { rafraichitFleches, dessineDessins, redessineForme, apercuGuide, nomSurLePlan, societeDeForme,
  poseLibellesDessines, decoupeStand, marqueStandsDessines, signale } from "./dessin.mjs";
import { phareZone } from "./points-interet.mjs";
import { appliqueOptions } from "./options.mjs";
/* Ce qui dit si l'on édite n'est plus importé par personne : la vue et le
   rendu par la carte graphique le reçoivent de ce module, qui le leur confie
   en se chargeant (`confieALaVue`, `confieAuWebgl`). Il doit donc être
   chargé, et c'est d'ici. */
import "./edition-en-cours.mjs";
import { brancheGestes, brancheLangue } from "./gestes.mjs";
import { brancheTiroirs } from "./tiroirs.mjs";

Object.assign(globalThis, {
  brancheFenetre,
  brancheMesure,
  brancheSponsor,
  brancheItineraire,
  instantConf,
  brancheWebgl,
  brancheRappels,
  brancheInstallation,
  brancheBorne,
  brancheIci,
  brancheSuggestion,
  finInstant,
  brancheJournee,
  retireAdmin,
  brancheTiroirItineraire,
  basculeParcours, brancheParcours, rafraichitParcours, rangParcours,
  remplitParcours, fermeParcours, brancheTiroirParcours,
  branchePartage,
  brancheVue, cadrePlan, brancheConfiguration,
  brancheApparence,
  brancheHabillage,
  branchePolices,
  brancheBandes,
  brancheRecherche, PREFIXE_PERSO,
  libelleCritere,
  fermeCriteres,
  liste,
  svg,
  brancheTonDeLaBarre,
  brancheDemarrage, brancheCorpsFiche,
  ferme, brancheFiche,
  brancheLibelles, libelles, DISTINCTIONS, dessineDists, poseDistsFiche,
  refaitDistsFiche,
  montePlan, changePlan,
  mesCalques,
  estCadre,
  rafraichitFleches, dessineDessins, redessineForme, apercuGuide, nomSurLePlan,
  societeDeForme, poseLibellesDessines, decoupeStand, marqueStandsDessines, signale,
  phareZone,
  appliqueOptions,
  brancheGestes, brancheLangue,
  brancheTiroirs,
});

/* La visite guidée en cours, ou rien : le module la pose en la lançant et
   l'efface en la quittant. La proposition des rappels la lit par accesseur,
   confiée par le code soudé, pour ne pas passer devant elle. */
Object.defineProperties(globalThis, vivants({ TUTO: () => TUTO }, "lanceTutoriel"));

/* La configuration du salon ouvert : le code soudé la lit encore, pour la
   confier au calcul de l'itinéraire ; seule l'ouverture d'un salon la
   remplace (`configuration.mjs` `ouvreConf`). On change ce qu'elle contient,
   jamais l'objet lui-même. */
Object.defineProperties(globalThis, vivants({ CONF: () => CONF }, "ouvreConf"));

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

/* Ce que les essais du navigateur lisent dans la page, et que le code soudé
   n'appelle pas : les règles de `sur.mjs` éprouvées sur des entrées hostiles,
   le salon que l'adresse nomme, les mesures du texte et le rendu par la carte
   graphique. Rangé à part de la liste exposée, pour que celle-ci ne compte
   que ce qui soude encore la page (`outils/soudure.js`) ; écrit comme une
   affectation, que `outils/modules.js` ne relit pas. La graisse et la police
   des libellés se remplacent au choix d'un modèle : elles se lisent donc par
   un accesseur, qui rend celles du moment. */
globalThis.__essais = {
  SLUG, GL, rectEcranWebgl, _lg, largeur,
  adresseSure, adresseImage, imageSure, assainitRiche,
  get P_NOM(){ return P_NOM; },
  get P_CODE(){ return P_CODE; },
};
