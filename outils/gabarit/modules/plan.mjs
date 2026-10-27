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
import { GL, rectEcranWebgl, CONTEXTE_PERDU } from "./webgl.mjs";
import { TUTO } from "./tutoriel.mjs";
import { P_NOM, P_CODE } from "./polices-plan.mjs";
import { view } from "./vue.mjs";
import { _lg, largeur } from "./texte-plan.mjs";
import { libelles } from "./libelles.mjs";
import { lancePlan } from "./lancement.mjs";
import { COMPTES_LOGOS } from "./logos-stands.mjs";
/* Ce qui dit si l'on édite n'est plus importé par personne : la vue et le
   rendu par la carte graphique le reçoivent de ce module, qui le leur confie
   en se chargeant (`injecteALaVue`, `injecteAuWebgl`). Il doit donc être
   chargé, et c'est d'ici. */
import "./edition-en-cours.mjs";
/* La mini-carte de situation ne s'importe de nulle part : elle s'inscrit
   auprès de la vue en se chargeant (`suitLaVue`), et se charge d'ici. */
import "./mini-carte.mjs";
// les noms des stands cherchés ou choisis, sortis dans la marge quand ils n'y tiennent pas
import "./appels.mjs";
/* Le relevé des performances (`?perf`) ne s'importe de nulle part : il
   s'inscrit auprès du rendu et du démarrage en se chargeant, et ne fait rien
   sans `?perf` dans l'adresse. */
import "./releve.mjs";
/* Le choix de l'ambiance offert au visiteur de la démonstration ne s'importe
   de nulle part : il se branche en se chargeant, et ne paraît que sur la page
   qui le demande. */
import "./choix-ambiance.mjs";

/* Ce que les essais du navigateur lisent dans la page : les règles de
   `sur.mjs` éprouvées sur des entrées hostiles, le salon que l'adresse nomme,
   les mesures du texte, le rendu par la carte graphique, ce que la planche
   des logos a coûté et les libellés qu'on réécrit sur des mesures neuves. Seuls les essais lisent `__essais`. La
   graisse et la police des libellés se
   remplacent au choix d'un modèle : elles se lisent donc par un accesseur,
   qui rend celles du moment ; la visite guidée en cours aussi, que le module
   pose en la lançant et efface en la quittant, et la vue du plan, que les
   gestes remplacent sans cesse. */
globalThis.__essais = {
  SLUG, GL, rectEcranWebgl, CONTEXTE_PERDU, _lg, largeur, libelles, COMPTES_LOGOS,
  adresseSure, adresseImage, imageSure, assainitRiche,
  get P_NOM(){ return P_NOM; },
  get P_CODE(){ return P_CODE; },
  get TUTO(){ return TUTO; },
  get view(){ return view; },
};

/* La page publique et la démonstration lancent d'ici ; l'administration
   lance depuis son propre point d'entrée, ses étapes posées. */
if (!PLAN_ADMIN) lancePlan();
