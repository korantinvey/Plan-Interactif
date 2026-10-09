/* ============================================================
   11. Calques de dessin — ce que le poste en garde
   Des calques créés par l'exploitant, propres à un pavillon, sur lesquels
   il trace rectangles, polygones, lignes et textes. Le tracé est enregistré
   en mètres dans le repère du plan : il suit le zoom comme le reste.

   Ce module tient les calques eux-mêmes, et ce qui dit d'où ils viennent :
   leurs trois rangements sur le poste, le calque ouvert, l'outil tenu et le
   tracé en cours. Le visiteur les reçoit — le chargement confronte ses
   calques à ceux de la base, le dessin les lit —, d'où `plan.mjs`.

   Les calques, la marque d'attente et les clés publiées sont remplacés à
   l'ouverture d'un salon (`ouvreDessins`) ; le calque ouvert, l'outil et le
   tracé, par leurs portes (`poseCalqueActif`, `poseOutil`, `poseEbauche`) :
   le code soudé les lit par accesseur, et ne les affecte plus. Le bouton qui
   dit l'attente est d'administration : il est confié par
   `brancheCalquesDessin`, que `_dessin.html` appelle en tête.
   ============================================================ */
import { P } from "./donnees.mjs";
import { salonRange } from "./configuration.mjs";

/* Ce que le code soudé confie : rien avant qu'il l'ait fait, et un bouton
   absent de la page publique. */
/** @type {{ majAttente: () => void }} */
let soude = { majAttente: () => {} };
const majAttente = () => soude.majAttente();

/** Le branchement : `_dessin.html` l'appelle en tête.
 *  @param {{ majAttente: () => void }} page */
export function brancheCalquesDessin(page){
  soude = page;
}

/* Un rangement par salon, et non plus un seul pour tous — la même règle que
   pour les réglages, et un dégât de plus.

   Un pavillon se nomme ici par son identifiant Klipso, et deux éditions d'un
   même salon se le partagent : l'édition suivante se prépare en dupliquant la
   précédente, ses plans avec. Rangés sous ce seul nom, les calques d'une
   édition devenaient donc ceux de la voisine — le chargement les prenait pour
   un travail que la base n'avait pas encore vu, et l'enregistrement les y
   écrivait. Un calque supprimé revenait ainsi au chargement d'après, republié
   depuis le salon d'à côté ; supprimé de nouveau, il revenait encore.

   Les trois rangements sont cloisonnés ensemble : séparer les dessins sans
   séparer ce qui dit d'où ils viennent — la marque d'attente, la liste des
   clés publiées — reviendrait à les comparer à la mémoire d'un autre salon. */
const CLE_DESSINS = "plan-dessins";
export let cleDessins = CLE_DESSINS;
export let DESSINS = {};

/* Ce qui n'est pas encore parti en base.
   Les dessins vivent à deux endroits : la base, qui fait foi pour les
   visiteurs, et le poste, où l'exploitant travaille. Au chargement, la base
   écrasait le poste sans rien demander — un calque tracé puis non publié
   disparaissait au premier rechargement, alors qu'il était encore dans le
   stockage local. Il ne se perdait pas : il devenait invisible, puis
   l'enregistrement suivant l'effaçait pour de bon.

   On retient donc, pavillon par pavillon, qu'un dessin a bougé depuis la
   dernière publication. Ce travail-là l'emporte sur la base tant qu'il n'y est
   pas parti — lui seul n'existe nulle part ailleurs. */
const CLE_ATTENTE = "plan-dessins-attente";
let cleAttente = CLE_ATTENTE;
export let ATTENTE = {};

/** Le pavillon a-t-il des dessins que la base ne connaît pas encore ? */
export const enAttente = (id) => !!ATTENTE[id];

/* Ce que la base a confirmé, pavillon par pavillon : la liste des clés qu'elle
   nous a rendues au dernier chargement, ou que notre dernier envoi y a mises.

   Elle répond à une question que la marque d'attente ne sait pas trancher. Un
   calque présent ici et absent de la base a été supprimé ailleurs — il faut
   l'oublier. Le même calque jamais confirmé n'a, lui, jamais quitté ce poste :
   l'oublier le perd pour de bon. Faute de les distinguer, un enregistrement
   manqué — session expirée, réseau coupé — rendait un plan nu au rechargement
   suivant, alors que tout le travail était encore là, dans ce navigateur.

   Elle sert aussi à l'envers, à la publication : on n'efface en base que ce
   qu'on y a vu et qui a disparu depuis. Un poste qui ne connaît rien n'efface
   rien, là où un « tout ce que je n'ai pas » emportait le travail d'à côté. */
const CLE_PUBLIES = "plan-dessins-publies";
let clePubliees = CLE_PUBLIES;
export let PUBLIES = {};

/* Le témoin de l'adoption, un par salon. Il ne se déduit d'aucun des trois
   rangements : un salon ouvert sans qu'on y dessine n'écrit ni ses calques ni
   sa marque d'attente, et l'absence de ceux-là ne dit donc pas que l'ancien
   rangement n'a pas encore été repris. */
const CLE_REPRIS = "plan-dessins-repris";

/** Un rangement du poste, ou rien de lisible : un stockage refusé — navigation
 *  privée, quota plein — ne doit pas emporter le démarrage avec lui. */
function litRange(cle){
  try { return JSON.parse(localStorage.getItem(cle) || "{}") || {}; }
  catch (e) { return {}; }
}

/**
 * Ouvre les calques du salon qu'on vient de charger.
 *
 * Appelée avec les réglages, avant que le chargement ne confronte la base à ce
 * que le poste garde : les trois rangements doivent être ceux de ce salon-ci
 * au moment où la comparaison a lieu, sans quoi elle porterait sur le voisin.
 */
export function ouvreDessins(d){
  const s = salonRange(d);
  cleDessins = CLE_DESSINS + ":" + s;
  cleAttente = CLE_ATTENTE + ":" + s;
  clePubliees = CLE_PUBLIES + ":" + s;
  DESSINS = litRange(cleDessins);
  ATTENTE = litRange(cleAttente);
  PUBLIES = litRange(clePubliees);
  reprendCommun(d, CLE_REPRIS + ":" + s);
}

/**
 * Ce que l'ancien rangement commun gardait de ce salon.
 *
 * Il n'est pas jeté, à la différence de celui des réglages : un calque qui
 * n'est jamais parti en base n'existe nulle part ailleurs que là, et un salon
 * qu'on ne rouvrira qu'un jour prochain y a peut-être le sien. On n'y prend
 * donc que les pavillons du salon ouvert, à sa première ouverture ; ensuite
 * les deux rangements divergent, et c'est le nouveau qui fait foi.
 *
 * Deux éditions qui se partagent un pavillon le reprennent toutes les deux :
 * rien ne dit à laquelle il appartenait. C'est le mélange d'avant, une
 * dernière fois — et il se défait dès le premier enregistrement de chacune,
 * chacune n'écrivant plus que dans le sien.
 */
function reprendCommun(d, temoin){
  let fait = true;
  try { fait = localStorage.getItem(temoin) !== null; } catch (e) {}
  if (fait) return;
  const miens = new Set(((d && d.plans) || []).map(p => p.id));
  const prend = (cle, cible) => {
    const vieux = litRange(cle);
    Object.keys(vieux).forEach(id => { if (miens.has(id)) cible[id] = vieux[id]; });
  };
  prend(CLE_DESSINS, DESSINS);
  prend(CLE_ATTENTE, ATTENTE);
  prend(CLE_PUBLIES, PUBLIES);
  /* Recopié dans le nouveau rangement sur-le-champ, et le témoin posé avec.
     Sans la copie, l'adoption se perdrait au chargement suivant — un salon où
     l'on ne dessine rien n'écrit rien de lui-même. Sans le témoin, elle se
     referait à chaque fois, et rendrait chaque fois au salon les calques
     qu'il a écartés depuis : c'est le retour qu'on vient de corriger. */
  try {
    localStorage.setItem(cleDessins, JSON.stringify(DESSINS));
    localStorage.setItem(cleAttente, JSON.stringify(ATTENTE));
    localStorage.setItem(clePubliees, JSON.stringify(PUBLIES));
    localStorage.setItem(temoin, "1");
  } catch (e) {}
}

/** Note ce que la base contient pour ce pavillon, à cet instant. */
export function notePubliees(id, cles){
  PUBLIES[id] = cles.slice();
  try { localStorage.setItem(clePubliees, JSON.stringify(PUBLIES)); } catch (e) {}
}

/**
 * Range la copie du poste telle que le chargement vient de la reconstituer.
 *
 * Les deux rangements ne peuvent pas avancer l'un sans l'autre. Le chargement
 * notait les clés que la base venait de rendre, mais gardait en mémoire seule
 * la liste des calques qu'il avait confrontée à elle : le rangement du poste
 * restait à la veille, et n'était réécrit qu'au premier trait tracé. Au
 * rechargement suivant, le poste relisait donc ses vieux calques face à une
 * liste de clés déjà à jour, n'y retrouvait pas les leurs, et les prenait pour
 * un travail jamais publié. Un calque supprimé depuis un autre poste
 * disparaissait ainsi au premier rechargement, puis revenait au deuxième,
 * republié en base et annoncé comme rescapé.
 */
export function rangeDessins(){
  try { localStorage.setItem(cleDessins, JSON.stringify(DESSINS)); } catch (e) {}
}

/** Ce calque a-t-il déjà été vu en base ? */
export const dejaPubliee = (id, cle) => (PUBLIES[id] || []).indexOf(cle) >= 0;

/* L'instant du geste plutôt qu'un simple « oui » : l'envoi relève la marque
   avant d'écrire et ne l'efface qu'inchangée, faute de quoi un trait tracé
   pendant l'envoi se croyait publié — et le chargement suivant l'écrasait par
   ce que la base, qui ne l'avait pas reçu, en disait. */
export function marqueAttente(id, oui){
  if (oui) ATTENTE[id] = Date.now(); else delete ATTENTE[id];
  try { localStorage.setItem(cleAttente, JSON.stringify(ATTENTE)); } catch (e) {}
  // le bouton qui le dit est d'administration (`modules/enregistrement.mjs`)
  majAttente();
}

/** Les calques de dessin du pavillon courant. Ceux du service ont été repris
 *  au chargement ; il ne reste qu'à ouvrir la liste si elle manque. */
export const mesCalques = () => (DESSINS[P().id] = DESSINS[P().id] || []);

export let calqueActif = null;   // id du calque en cours d'édition
export let outil = "main";
export let enCours = null;       // tracé en construction

/* Leurs portes. Le calque ouvert change par l'outil de l'exploitant, et se
   referme au montage d'un pavillon (`rendu.mjs` `montePlan`) ; l'outil et
   le tracé ne changent que par l'outil de dessin (`modules/outil-dessin.mjs`). */
export function poseCalqueActif(/** @type {any} */ id){ calqueActif = id; }
export function poseOutil(/** @type {string} */ o){ outil = o; }
/* Le tracé en cours est une ébauche : sa porte le dit ainsi, et non « en
   cours », que le relevé des phrases de la page (`outils/traductions.js`)
   prendrait pour du texte affiché. */
export function poseEbauche(/** @type {any} */ t){ enCours = t; }

export const trouveCalque = id => mesCalques().find(c => c.id === id);
export const nouvelId = () => "d" + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36);
