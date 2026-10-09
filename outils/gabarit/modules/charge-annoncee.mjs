/* ============================================================
   La charge annoncée — ce que les autres journées ont déjà posé

   Sortie de `_journee.html`. Elle se branche par `brancheCharge`, que
   `journee.mjs` appelle en se branchant lui-même, à la place qu'elle tenait :
   le réglage du salon vient du code soudé, le parcours et la visite calculée
   des modules qui les tiennent. Le calcul qu'elle nourrit, lui, est dans
   `ordonnanceur.mjs`.
   ============================================================ */
import { API, SLUG, BORNE } from "./salon.mjs";
import { mesureOuverte } from "./mesure.mjs";
import { parId } from "./donnees.mjs";
import { jourISO } from "./temps.mjs";
import { SEUIL_PEINE, TRANCHES_JOUR, TRANCHES_MINI, trancheDe, dilatationPour }
  from "./ordonnanceur.mjs";

/* Ce qu'on lui confie : le réglage de la concentration (`_admin1.html`, code
   soudé), l'identifiant du parcours et le parcours lui-même (`parcours.mjs`),
   la visite calculée (`journee.mjs`, qui importe ce module : l'importer en
   retour bouclerait). Les deux derniers sont réaffectés là-bas : on les lit
   donc par une fonction, qui rend la valeur du moment. */
/** @type {(() => boolean) | null} */
let seuilGere = null;
/** @type {(o: any) => number} */
let seuilConcentration = () => 0;
/** @type {() => string} */
let identifiantParcours = () => "";
/** @type {() => { stands: string[] }} */
let parcours = () => ({ stands: [] });
/** @type {() => any} */
let sejour = () => null;

/**
 * Le branchement, appelé par `journee.mjs` à la place que ce code tenait
 * dans `_journee.html`.
 *
 * @param {{ seuilGere: () => boolean, seuilConcentration: (o: any) => number,
 *           identifiantParcours: () => string, parcours: () => { stands: string[] },
 *           sejour: () => any }} confie
 */
export function brancheCharge(confie){
  ({ seuilGere, seuilConcentration, identifiantParcours, parcours, sejour } = confie);
}

/**
 * Deux mouvements, et un seul objet : que les stands ne se remplissent pas
 * tous à la même demi-heure.
 *
 * On annonce ce qu'on a prévu, on lit ce que les autres ont prévu. Ce qui en
 * sort est une peine à payer en mètres : une demi-heure chargée sur un stand
 * coûte plus cher qu'une demi-heure calme, et l'ordonnanceur cherche le
 * meilleur arrangement en la comptant — ce qui ne mène pas forcément à la
 * demi-heure d'après, tout l'ordre pouvant se rejouer autour. Jamais un refus :
 * un stand très demandé reste visitable, simplement plus cher à placer là.
 *
 * Rien de cela ne se tente sans les deux conditions qui le rendent honnête :
 * l'exploitant a ouvert le réglage (`seuilGere`), et le visiteur n'a pas
 * refusé la mesure. Un plan annoncé est une donnée qu'on garde, fût-ce deux
 * jours, et il tombe sous le même refus que le reste.
 */
const PLAN_API = API ? API.replace(/[^/]*$/, "plan-de-visite") : "";
const CHARGE_API = API ? API.replace(/[^/]*$/, "charge") : "";

/* Le temps mort avant d'annoncer. Une journée se recalcule à chaque retouche,
   et annoncer chacune ferait payer un aller-retour pour un plan qui n'aura pas
   vécu dix secondes. Quatre secondes : plus long qu'une rafale de retouches,
   plus court que le temps de refermer le tiroir. */
const REPOS_PLAN = 4000;

/* Le dernier plan annoncé, pour ne pas le redire. Sur l'appareil et non en
   mémoire : rouvrir le plan le lendemain rejouerait sinon l'annonce d'un
   séjour que personne n'a retouché. */
const CLE_POSE = "plan-journee-pose";

export let CHARGE = null;          // ce que les autres ont annoncé, par jour et par stand
let _chargeEnCours = false;
let _reposPlan = null;

/** La journée organisée doit-elle répartir ? Deux clés, et les deux doivent
 *  tourner : le réglage du salon, et le consentement du visiteur. */
export const chargeSuivie = () =>
  typeof seuilGere === "function" && seuilGere() &&
  typeof mesureOuverte === "function" && mesureOuverte() &&
  !!SLUG && !BORNE;

/** Le séjour, réduit à ce qu'il annonce : un stand, un jour, une demi-heure. */
function etapesDuSejour(){
  const SEJOUR = sejour();
  if (!SEJOUR) return [];
  const l = [];
  SEJOUR.jours.forEach(j => {
    const jour = jourISO(j.cle);
    if (!jour || !Array.isArray(j.etapes)) return;
    j.etapes.forEach(e => {
      if (e.genre !== "stand" || !e.o) return;
      l.push({ jour: jour, tranche: trancheDe(e.t0), cible: String(e.o.id) });
    });
  });
  return l;
}

/**
 * Annoncer le plan — une fois le calme revenu, et seulement s'il a changé.
 *
 * L'identifiant du parcours est ce qui rend l'annonce répétable : le serveur
 * efface le plan précédent avant de poser celui-ci, si bien que dix retouches
 * d'un même visiteur restent un visiteur. C'est la seule raison pour laquelle
 * il existe, et il ne se tire qu'ici, au premier plan annoncé.
 *
 * Une panne ne se rattrape pas, à la différence des mesures : un plan raté
 * sera réannoncé au prochain calcul, et un plan périmé ne vaut rien. La file
 * de `_mesure.html` porte des gestes déjà faits ; ici on porte une intention,
 * qui n'a pas à survivre à la journée qu'elle décrit.
 */
export function annoncePlan(){
  if (!PLAN_API || !chargeSuivie()) return;
  clearTimeout(_reposPlan);
  _reposPlan = setTimeout(() => {
    const etapes = etapesDuSejour();
    const empreinte = JSON.stringify(etapes);
    let pose = "";
    try { pose = localStorage.getItem(CLE_POSE + ":" + SLUG) || ""; } catch (e) {}
    // rien n'a bougé : le serveur porte déjà ce plan-là
    if (empreinte === pose) return;
    try { localStorage.setItem(CLE_POSE + ":" + SLUG, empreinte); } catch (e) {}
    fetch(PLAN_API, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: SLUG, plan: identifiantParcours(), etapes: etapes }),
      keepalive: true,
    }).catch(() => {
      /* L'empreinte se défait : sans cela un plan qui n'est jamais parti
         passerait pour posé, et ne serait plus jamais réannoncé. */
      try { localStorage.removeItem(CLE_POSE + ":" + SLUG); } catch (e) {}
    });
  }, REPOS_PLAN);
}

/**
 * La plus petite cellule qui coûte quelque chose à cette visite.
 *
 * Elle borne ce que le serveur renvoie : en dessous du seuil de la courbe,
 * une cellule ne vaut rien ici, et l'emporter serait payer du réseau pour du
 * silence. Sur un salon de six cents stands, c'est la différence entre
 * quelques kilo-octets et le mégaoctet — dans un hall où le réseau est
 * justement ce qui manque.
 *
 * On calcule la borne sur le seuil **non desserré**, car le desserrage
 * d'adaptation ne fait jamais que l'élever : une cellule écartée ici ne
 * pourrait pas devenir coûteuse plus tard.
 */
function celluleUtile(){
  let min = 0;
  parcours().stands.forEach(id => {
    const n = seuilConcentration(parId.get(String(id)));
    if (n > 0 && (!min || n < min)) min = n;
  });
  return Math.max(1, Math.ceil(SEUIL_PEINE * (min || 1)));
}

const DILATATIONS = new Map();

/**
 * De combien les seuils de ce jour-là sont desserrés.
 *
 * Ne touche pas au seuil de concentration, qui reste celui de la configuration :
 * ce nombre ne sert qu'à `seuilEffectif`, le temps d'un rangement.
 */
export function dilatationDuJour(cleJour){
  const cle = String(cleJour);
  if (DILATATIONS.has(cle)) return DILATATIONS.get(cle);
  let f = 1;
  const j = CHARGE && CHARGE[cle];
  if (j){
    let demande = 0, seuil = 0, tMin = TRANCHES_JOUR, tMax = -1;
    for (const id in j){
      const cap = seuilConcentration(parId.get(String(id)));
      if (!(cap > 0)) continue;   // sans seuil connu, ce stand ne dit rien
      for (const tr in j[id]){
        demande += +j[id][tr] || 0;
        const t = +tr;
        if (t < tMin) tMin = t;
        if (t > tMax) tMax = t;
      }
      seuil += cap;
    }
    if (tMax >= 0 && seuil > 0){
      const tranches = Math.max(TRANCHES_MINI, tMax - tMin + 1);
      f = dilatationPour(demande / (seuil * tranches));
    }
  }
  DILATATIONS.set(cle, f);
  return f;
}

/**
 * Lire la charge, une fois par ouverture du tiroir d'organisation.
 *
 * Elle ne se redemande pas à chaque recalcul : elle bouge à l'échelle de la
 * demi-journée, le relais la garde une minute, et une visite qu'on retouche
 * trois fois n'a pas à payer trois fois. Elle ne bloque rien non plus — un
 * calcul lancé avant qu'elle n'arrive se fait sans seuil, et le suivant
 * l'aura. Mieux vaut une journée organisée sans contrainte qu'une roue qui
 * tourne devant quelqu'un qui attend son programme.
 */
export function litLaCharge(){
  if (!CHARGE_API || !chargeSuivie() || _chargeEnCours) return;
  _chargeEnCours = true;
  fetch(CHARGE_API + "?slug=" + encodeURIComponent(SLUG) +
        "&min=" + celluleUtile())
    .then(r => r.ok ? r.json() : null)
    .then(d => { if (d && d.jours){ CHARGE = d.jours; DILATATIONS.clear(); } })
    .catch(() => {})
    .then(() => { _chargeEnCours = false; });
}

/**
 * Combien de journées annoncent déjà ce stand, sur cette demi-heure-là.
 *
 * Le plan qu'on a soi-même annoncé en fait partie — on se compte donc parmi
 * ceux qui remplissent le créneau qu'on occupe déjà. C'est voulu : le retirer
 * demanderait au serveur de distinguer l'appelant, donc de le reconnaître, et
 * l'erreur qu'on éviterait ainsi vaut une unité sur un seuil qui en compte
 * trois ou quatre.
 */
export function chargeCellule(cleJour, id, tranche){
  if (!CHARGE) return 0;
  const j = CHARGE[String(cleJour)];
  const s = j && j[String(id)];
  return (s && +s[String(tranche)]) || 0;
}
