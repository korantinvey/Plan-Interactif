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
import { SLUG } from "./salon.mjs";
import { brancheFenetre } from "./fenetre.mjs";
import { adresseSure, adresseImage, imageSure, assainitRiche } from "./sur.mjs";
import { brancheMesure } from "./mesure.mjs";
import { brancheSponsor } from "./sponsor.mjs";
import { branchePartage } from "./partage.mjs";
import { GL, brancheWebgl, rectEcranWebgl } from "./webgl.mjs";
import { brancheInstallation } from "./installation.mjs";
import { brancheBorne } from "./borne.mjs";
import { brancheIci } from "./ici.mjs";
import { TUTO } from "./tutoriel.mjs";
import { brancheJournee } from "./journee.mjs";
import { brancheTiroirItineraire } from "./tiroir-itineraire.mjs";
import { brancheTiroirParcours } from "./tiroir-parcours.mjs";
import { brancheVue } from "./vue.mjs";
import { brancheHabillage } from "./habillage.mjs";
import { P_NOM, P_CODE } from "./polices-plan.mjs";
import { brancheBandes } from "./bandes.mjs";
import { brancheRecherche } from "./recherche.mjs";
import { view } from "./vue.mjs";
import { brancheTonDeLaBarre } from "./ton-barre.mjs";
import { brancheDemarrage } from "./demarrage.mjs";
import { brancheFiche } from "./fiche.mjs";
import { _lg, largeur } from "./texte-plan.mjs";
import { brancheLibelles, libelles } from "./libelles.mjs";
/* Les options vendues à part ne sont plus importées par personne dans la
   page publique : elles se confient à l'apparence en se chargeant
   (`confieALApparence`), qui les repose avec le reste de l'habillage. Il faut
   donc les charger, et c'est d'ici. */
import "./options.mjs";
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
  brancheWebgl,
  brancheInstallation,
  brancheBorne,
  brancheIci,
  brancheJournee,
  brancheTiroirItineraire,
  brancheTiroirParcours,
  branchePartage,
  brancheVue,
  brancheHabillage,
  brancheBandes,
  brancheRecherche,
  brancheTonDeLaBarre,
  brancheDemarrage,
  brancheFiche,
  brancheLibelles,
  brancheGestes, brancheLangue,
  brancheTiroirs,
});

/* Ce que les essais du navigateur lisent dans la page, et que le code soudé
   n'appelle pas : les règles de `sur.mjs` éprouvées sur des entrées hostiles,
   le salon que l'adresse nomme, les mesures du texte, le rendu par la carte
   graphique et les libellés qu'on réécrit sur des mesures neuves. Rangé à
   part de la liste exposée, pour que celle-ci ne compte que ce qui soude
   encore la page (`outils/soudure.js`) ; écrit comme une affectation, que
   `outils/modules.js` ne relit pas. La graisse et la police des libellés se
   remplacent au choix d'un modèle : elles se lisent donc par un accesseur,
   qui rend celles du moment ; la visite guidée en cours aussi, que le module
   pose en la lançant et efface en la quittant, et la vue du plan, que les
   gestes remplacent sans cesse. */
globalThis.__essais = {
  SLUG, GL, rectEcranWebgl, _lg, largeur, libelles,
  adresseSure, adresseImage, imageSure, assainitRiche,
  get P_NOM(){ return P_NOM; },
  get P_CODE(){ return P_CODE; },
  get TUTO(){ return TUTO; },
  get view(){ return view; },
};
