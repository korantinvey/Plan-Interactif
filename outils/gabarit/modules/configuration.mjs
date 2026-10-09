/* ============================================================
   La configuration du plan — ce que l'exploitant a réglé

   Les réglages vivent dans CONF, partagés par les trois pavillons :
   changer la couleur du bâtiment une fois vaut pour tous.

   Sortie de `_admin1.html`, avec les règles qui ne font que la relire et que
   le plan public lit aussi : les options prises par le salon, la version
   anglaise, ce que la recherche remonte ; et son rangement sur le poste
   (`enregistreConf`), sorti de `_ordre-fiche.html`, que l'administration
   prolonge d'un envoi en base. Le code soudé lit CONF et sa clé de
   rangement par accesseur, et ne les remplace que par `ouvreConf` ; il se
   branche par `brancheConfiguration`, à la place que ce code tenait, pour
   confier ce que le module ne peut pas importer — les secteurs de la
   recherche, dont le module (`secteurs.mjs`) lit lui-même la configuration.
   ============================================================ */
import { DATA } from "./donnees.mjs";
import { SLUG, PLAN_ADMIN } from "./salon.mjs";

/* Ce que le code soudé confie : les secteurs, que la recherche refait à
   chaque chargement (`secteurs.mjs` `SECTEURS`), par un lecteur — le module
   qui les tient importe celui-ci, et ne peut donc s'importer d'ici. */
/** @type {() => Map<string, any>} */
let secteurs = () => new Map();

/**
 * Le branchement, appelé par `_admin1.html` à la place que ce code tenait.
 *
 * @param {{ secteurs: () => Map<string, any> }} b
 */
export function brancheConfiguration(b){
  secteurs = b.secteurs;
}

const DEFAUTS = { "INFOPRO_FIL_JAUNE": { rempli: true } };
/** @type {Record<string, any>} */
export let CONF = JSON.parse(JSON.stringify(DEFAUTS));

/* Un rangement par salon, et non plus un seul pour tous.
   Les calques sortent tous du même bureau d'études : « Batiment », « RIA »,
   « Caniveaux » et leurs sous-calques portent les mêmes noms d'un salon à
   l'autre. Rangés sous ce seul nom, les réglages suivaient l'exploitant :
   masquer une gaine chez l'un la masquait chez le suivant, sans que rien ne
   l'annonce dans son panneau — et la publication emportait le mélange en
   base. Le salon ouvert nomme donc sa clé. */
export const salonRange = (/** @type {any} */ d) =>
  (d && d.slug) || SLUG || (d && d.evenement) || "sans-salon";
const cleConf = (/** @type {any} */ d) => "plan-conf:" + salonRange(d);
export let CLE_CONF = cleConf(null);

/** Ouvre les réglages du salon qu'on vient de charger. */
export function ouvreConf(/** @type {any} */ d){
  CLE_CONF = cleConf(d);
  CONF = JSON.parse(JSON.stringify(DEFAUTS));
  try { Object.assign(CONF, JSON.parse(localStorage.getItem(CLE_CONF) || "{}")); } catch (e) {}
  /* L'ancien rangement commun ne peut que rejouer le mélange, et la base fait
     foi de toute façon : on le retire plutôt que de le laisser traîner. */
  try { localStorage.removeItem("plan-conf"); } catch (e) {}
}

/**
 * Les réglages qui parlent du salon ouvert : ceux de ses calques et de leurs
 * sous-calques, plus les réglages généraux — commandes, couches de données,
 * étiquettes. Tout le reste vient d'un salon voisin ouvert sur le même poste,
 * et ne désigne rien ici.
 *
 * Le filtre s'applique aux deux bouts : ce qu'on lit de la base, et ce qu'on y
 * renvoie. Un enregistrement déjà mélangé se nettoie donc à la publication
 * suivante, sans qu'il faille y toucher à la main.
 *
 * @param {Record<string, any>} source
 */
export function reglagesDuSalon(source){
  const calques = new Set((DATA?.plans || []).flatMap(p => (p.fond || []).map(c => c.cle)));
  /** @type {Record<string, any>} */
  const sortie = {};
  Object.keys(source || {}).forEach(k => {
    if (k.indexOf("_pile:") === 0) return;          // rangé par pavillon, à part
    const general = k[0] === "_" || k.indexOf("data:") === 0 ||
                    k === "labStand" || k === "labZone" || k === "selection" ||
                    k === "parcours" || k === "poi";
    /* Une couleur de secteur nomme un secteur de ce salon-ci : elle se retient
       comme un calque, au nom près. Celle d'un salon voisin ne désigne rien
       ici, et n'a rien à faire dans ce qu'on publie. */
    const dUnSecteur = k.indexOf("secteur:") === 0 && secteurs().has(k.slice(8));
    /* « calque/sous-calque », mais l'un comme l'autre peut porter une barre
       oblique : on retient la clé dès qu'une de ses têtes nomme un calque. */
    const dUnCalque = calques.has(k) ||
      k.split("/").some((_, i, t) => i && calques.has(t.slice(0, i).join("/")));
    if (general || dUnCalque || dUnSecteur) sortie[k] = source[k];
  });
  return sortie;
}

/* L'envoi en base n'est qu'à l'administration (`enregistrement.mjs`), qu'un
   module public ne peut importer : il ouvre cette porte en se chargeant, et
   le visiteur n'a rien derrière. */
let publie = () => {};

/** La porte de l'envoi, que `enregistrement.mjs` ouvre en se chargeant.
 *  @param {() => void} f */
export function confiePublication(f){
  publie = f;
}

/** Les réglages d'apparence se posent sur le poste, puis montent en base
 *  d'eux-mêmes — le poste n'en est plus que le cache et le refuge. */
export const enregistreConf = () => {
  try { localStorage.setItem(CLE_CONF, JSON.stringify(CONF)); } catch (e) {}
  // l'envoi est d'administration (`modules/enregistrement.mjs`)
  publie();
};

/** @returns {Record<string, any>} */
export const conf = (/** @type {string} */ c) => (CONF[c] = CONF[c] || {});
export const jeton = (/** @type {string} */ n) =>
  getComputedStyle(document.documentElement).getPropertyValue(n).trim() || "#888888";
export const sousCle = (/** @type {string} */ cle, /** @type {string} */ id) => cle + "/" + id;

/** Une option est-elle ouverte à ce salon ? Oui par défaut : un réglage absent
 *  ne doit rien retirer à un salon déjà en place. Les options elles-mêmes —
 *  leur liste, ce qui se refait quand on en ferme une — sont dans
 *  `options.mjs` (`OPTIONS`). */
export const optionActive = (/** @type {string} */ cle) => conf("_options")[cle] !== false;

/* Les deux options que d'autres modules interrogent portent un nom, plutôt que
   la clé en toutes lettres à chaque appel : elles sont lues loin d'ici — le
   programme jusque dans l'indexation, la suggestion dans sa propre fenêtre. */
export const programmeOffert = () => optionActive("programme");
export const suggestionOfferte = () => optionActive("suggestion");

/* ------------------------------------------------------------
   Les langues du plan

   Toute page sait l'anglais, mais ce qu'un plan montre vient pour moitié de
   ses données — noms d'exposants, descriptions, nomenclature — et rien ne les
   traduit. Un salon dont les données sont en français seul y gagne une page
   mi-anglaise, mi-française, moins lisible que la version française : à
   l'exploitant de fermer la version anglaise le temps que ses données suivent.

   Deux réglages plutôt qu'un, car les deux plans ne s'adressent pas aux mêmes
   gens : l'anglais du plan public est pour les visiteurs étrangers, celui de
   l'administration pour l'exploitant qui ne lit pas le français. Fermer l'un
   n'a aucune raison de fermer l'autre. C'est la page qui décide lequel des
   deux la regarde, et non le mode administration : le plan d'administration
   reste le plan d'administration avant même que l'identité soit vérifiée.
   ------------------------------------------------------------ */
/** La version anglaise est-elle ouverte sur cette page ? Oui par défaut : un
 *  réglage absent ne doit rien retirer à un salon déjà en place. */
export const langueOfferte = () => conf("_langues")[PLAN_ADMIN ? "admin" : "public"] !== false;

export const appliqueLangue = () => LANGUE.offre(langueOfferte());

/** Une sorte remonte-t-elle dans la recherche ? Oui par défaut : un réglage
 *  absent ne doit rien retirer à un salon déjà en place. Les sortes elles-mêmes
 *  et l'onglet qui les règle sont dans `reglage-recherche.mjs`. */
export const chercheSorte = (/** @type {string} */ cle) => conf("_rech")[cle] !== false;

