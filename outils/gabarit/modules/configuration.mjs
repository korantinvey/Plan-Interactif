/* ============================================================
   La configuration du plan — ce que l'exploitant a réglé

   Les réglages vivent dans CONF, partagés par les trois pavillons :
   changer la couleur du bâtiment une fois vaut pour tous.

   Avec eux, les règles qui ne font que les relire et que le plan public lit
   aussi : les options prises par le salon, la version
   anglaise, ce que la recherche remonte ; et son rangement sur le poste
   (`enregistreConf`), sorti du réglage de la fiche, que l'administration
   prolonge d'un envoi en base. CONF et sa clé de rangement s'importent, et
   seul `ouvreConf` les remplace. Les secteurs du salon, il les lit parmi les
   index de `donnees.mjs`.
   ============================================================ */
import { creeEvenement } from "./evenement.mjs";
import { DATA } from "./donnees.mjs";
import { SLUG, PLAN_ADMIN } from "./salon.mjs";

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

/* Les réglages que ce poste a changés et que la base n'a pas encore reçus,
   clé par clé : la valeur en texte, ou `null` pour une clé retirée. Le
   chargement pose les réglages de la base par-dessus ceux du poste — c'est
   elle qui fait foi — et un réglage resté ici faute d'envoi réussi
   disparaissait au rechargement, sans que rien ne le renvoie. Comme la marque
   d'attente des calques de dessin (`calques-dessin.mjs` `ATTENTE`), cette
   liste survit au rechargement, et le chargement la repose sur la base.
   L'administration seule la tient (`enregistrement.mjs`). */
const cleAttenteConf = (/** @type {any} */ d) => "plan-conf-attente:" + salonRange(d);
let CLE_ATTENTE_CONF = cleAttenteConf(null);
/** @type {Record<string, string | null>} */
export const REGLAGES_EN_ATTENTE = {};

/** Remplace la liste des réglages en attente, et la range sur le poste. */
export function poseReglagesEnAttente(/** @type {Record<string, string | null>} */ l){
  Object.keys(REGLAGES_EN_ATTENTE).forEach(k => { delete REGLAGES_EN_ATTENTE[k]; });
  Object.assign(REGLAGES_EN_ATTENTE, l);
  try {
    if (Object.keys(l).length) localStorage.setItem(CLE_ATTENTE_CONF, JSON.stringify(l));
    else localStorage.removeItem(CLE_ATTENTE_CONF);
  } catch (e) { /* le poste refuse : la liste tient jusqu'au rechargement */ }
}

/** Repose sur les réglages ce que ce poste n'a pas encore envoyé. */
export function reposeReglagesEnAttente(){
  Object.entries(REGLAGES_EN_ATTENTE).forEach(([k, texte]) => {
    if (texte === null){ delete CONF[k]; return; }
    try { CONF[k] = JSON.parse(texte); } catch (e) { /* une valeur abîmée : la base garde la sienne */ }
  });
}

/** Ouvre les réglages du salon qu'on vient de charger. */
export function ouvreConf(/** @type {any} */ d){
  CLE_CONF = cleConf(d);
  CLE_ATTENTE_CONF = cleAttenteConf(d);
  Object.keys(REGLAGES_EN_ATTENTE).forEach(k => { delete REGLAGES_EN_ATTENTE[k]; });
  try {
    const l = JSON.parse(localStorage.getItem(CLE_ATTENTE_CONF) || "{}");
    if (l && typeof l === "object" && !Array.isArray(l))
      Object.entries(l).forEach(([k, v]) => { if (v === null || typeof v === "string") REGLAGES_EN_ATTENTE[k] = v; });
  } catch (e) {}
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
  /* Les secteurs relus sur les stands, et non dans `SECTEURS` : celui-ci suit
     le champ choisi pour colorer le plan, que ces réglages mêmes apportent —
     il n'est pas encore là. Et les couleurs de secteur doivent survivre au
     détour par la ville, pour qui reviendra au secteur. */
  const secteurs = new Set((DATA?.plans || []).flatMap(p => (p.stands || []).map(s => s.sect)));
  /** @type {Record<string, any>} */
  const sortie = {};
  Object.keys(source || {}).forEach(k => {
    if (k.indexOf("_pile:") === 0) return;          // rangé par pavillon, à part
    const general = k[0] === "_" || k.indexOf("data:") === 0 ||
                    k === "labStand" || k === "labZone" || k === "selection" ||
                    k === "survol" || k === "parcours" || k === "poi";
    /* Une couleur de secteur nomme un secteur de ce salon-ci : elle se retient
       comme un calque, au nom près. Celle d'un salon voisin ne désigne rien
       ici, et n'a rien à faire dans ce qu'on publie. */
    const dUnSecteur = k.indexOf("secteur:") === 0 && secteurs.has(k.slice(8));
    /* « calque/sous-calque », mais l'un comme l'autre peut porter une barre
       oblique : on retient la clé dès qu'une de ses têtes nomme un calque. */
    const dUnCalque = calques.has(k) ||
      k.split("/").some((_, i, t) => i && calques.has(t.slice(0, i).join("/")));
    if (general || dUnCalque || dUnSecteur) sortie[k] = source[k];
  });
  return sortie;
}

/** La configuration vient d'être écrite sur le poste. L'envoi en base n'est
 *  qu'à l'administration (`enregistrement.mjs`), seule à l'écouter. */
export const CONF_ECRITE = creeEvenement();

/** Les réglages d'apparence se posent sur le poste, puis montent en base
 *  d'eux-mêmes — le poste n'en est plus que le cache et le refuge. */
export const enregistreConf = () => {
  try { localStorage.setItem(CLE_CONF, JSON.stringify(CONF)); copieLocale = true; }
  catch (e) { copieLocale = false; }
  CONF_ECRITE.emet();
};

/* La dernière copie sur le poste a-t-elle tenu ? Un stockage plein ou refusé
   la perdait sans un mot, et l'échec de l'envoi qui suivait annonçait des
   réglages « enregistrés sur ce poste » qu'un rechargement aurait perdus. */
let copieLocale = true;
/** Le poste garde-t-il la dernière configuration écrite ? */
export const copieLocaleTient = () => copieLocale;

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

