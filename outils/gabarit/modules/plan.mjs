/* ============================================================
   Point d'entrée des trois pages du plan — public, démonstration,
   administration

   Le plan est fait de modules, et la suite de leurs branchements vit dans
   `lancement.mjs`. Ce point d'entrée n'expose rien sur l'objet global, hors
   de ce que lisent les essais : il charge le plan, et le lance.

   L'administration reprend ce point d'entrée en entier (`plan-admin.mjs`,
   `import "./plan.mjs"`) avant d'y ajouter ses modules : c'est elle qui
   lance alors, une fois ses étapes posées. La page publique et la
   démonstration lancent d'ici.
   ============================================================ */
import { SLUG, PLAN_ADMIN } from "./salon.mjs";
import { adresseSure, adresseImage, imageSure, assainitRiche } from "./sur.mjs";
import { GL, rectEcranWebgl } from "./webgl.mjs";
import { TUTO } from "./tutoriel.mjs";
import { P_NOM, P_CODE } from "./polices-plan.mjs";
import { view } from "./vue.mjs";
import { _lg, largeur } from "./texte-plan.mjs";
import { libelles } from "./libelles.mjs";
import { lancePlan } from "./lancement.mjs";
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

/* Ce que les essais du navigateur lisent dans la page : les règles de
   `sur.mjs` éprouvées sur des entrées hostiles, le salon que l'adresse nomme,
   les mesures du texte, le rendu par la carte graphique et les libellés qu'on
   réécrit sur des mesures neuves. Seuls les essais lisent `__essais`. La
   graisse et la police des libellés se
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

/* La page publique et la démonstration lancent d'ici ; l'administration
   lance depuis son propre point d'entrée, ses étapes posées. */
if (!PLAN_ADMIN) lancePlan();
