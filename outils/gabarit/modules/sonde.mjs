/* ============================================================
   La sonde silencieuse — chaque visite dépose son résumé de performance

   Le relevé (`releve.mjs`, `?perf`) ne dit que ce qu'on a fait soi-même, sur
   son propre appareil. La sonde mesure chaque visite et en dépose un résumé
   au serveur, en silence, comme les erreurs (`erreurs.mjs`) : combien de
   temps le plan a mis à paraître et à quelle étape, ce qui a pesé, si le plan
   a suivi la main, ce qu'on a demandé à la carte graphique, et sur quel
   matériel. Le format est `sonde-plan/1` ; la base en extrait ses colonnes
   chiffrées par ces chemins exacts (migration `sonde_de_performance`).

   Elle ne doit rien coûter qu'on sente, sans quoi elle ralentirait ce
   qu'elle mesure :
     — pas de boucle d'images au repos : elle ne tourne que pendant un geste
       et sa traîne (`FIN_GESTE`), là où le plan dessine de toute façon ;
     — les observateurs du navigateur ne coûtent rien ;
     — `deck.metrics` se lit à la fin d'un geste, la carte graphique sur le
       contexte du plan, ou une seule fois dans un moment creux ;
     — chaque compte est borné : une journée de borne pèse ce que pèse une
       minute de visite.

   Ce qui part ne nomme personne : ni l'agent utilisateur complet — sa famille
   et sa version majeure suffisent —, ni adresse de page, ni identifiant qui
   survive à la page. La visite est un tirage au hasard, jamais rangé ailleurs
   que dans la file d'envoi. Rien ne part chez qui a refusé la mesure, sauf
   sur la page d'administration — même règle que les erreurs. Et sous `?perf`
   la sonde se tait : le relevé complet prend sa place.

   Une erreur de la sonde ne doit jamais devenir une erreur du plan : chaque
   écoute est sous garde.
   ============================================================ */
import { API, SLUG, PLAN_ADMIN, BORNE, entetesApi, configProjet } from "./salon.mjs";
import { GL, RENDU_WEBGL, REPEINT_FINI, CONTEXTE_PERDU } from "./webgl.mjs";
import { quandAffiche, estAffiche } from "./affichage.mjs";
import { PLAN_DEMARRE } from "./demarrage.mjs";
import { TOUS } from "./donnees.mjs";
import { bilanLogos } from "./logos-stands.mjs";
import { mesureOuverte, supportMesure } from "./mesure.mjs";
import { SACCADE, FIN_GESTE, TRANCHES, centile, fichier, observe, chargement, appareil, carteGraphique } from "./mesures-page.mjs";

const PERF = /[?&]perf(?:[=&]|$)/.test(location.search);
const SONDE_API = API ? API.replace(/[^/]*$/, "sonde") : "";
const PAGE = PLAN_ADMIN ? "admin" : BORNE ? "borne" : "plan";

// le chargement, la partie la plus précieuse, part sans attendre la suite de la visite
const PREMIER_ENVOI = 10000;
// un plan qui ne paraît jamais a d'autant plus à dire
const SANS_AFFICHAGE = 30000;
const RYTHME = 10 * 60000;
// une borne vit la journée entière : une ligne par heure dit si elle se dégrade
const HEURE = 3600000;
/* La base refuse au-delà de 4 096 octets, comptés sur le texte de Postgres,
   qui met une espace après chaque « : » et chaque « , » : le navigateur vise
   donc plus bas. */
const PLAFOND = 3500;
// des échantillons, non des listes : au-delà, chaque valeur neuve en remplace une au hasard
const ECHANTILLON = 300;

const sur = (/** @type {Function} */ f) => (/** @type {any[]} */ ...a) => { try { return f(...a); } catch (e) { return undefined; } };
const ms = (/** @type {number} */ x) => Math.round(x * 10) / 10;
const enCreux = (/** @type {() => void} */ f) => window.requestIdleCallback
  ? requestIdleCallback(sur(f), { timeout: 8000 }) : setTimeout(sur(f), 2000);

function uuid(){
  if (crypto.randomUUID) return crypto.randomUUID();
  // hors contexte sûr, `randomUUID` manque : le même tirage, mis en forme à la main
  const o = crypto.getRandomValues(new Uint8Array(16));
  o[6] = (o[6] & 15) | 64; o[8] = (o[8] & 63) | 128;
  const h = [...o].map(b => b.toString(16).padStart(2, "0")).join("");
  return h.slice(0, 8) + "-" + h.slice(8, 12) + "-" + h.slice(12, 16) + "-" + h.slice(16, 20) + "-" + h.slice(20);
}

/**
 * Garde au plus `ECHANTILLON` valeurs, tirées uniformément parmi les `n` vues.
 * @template T
 * @param {T[]} l
 * @param {number} n
 * @param {T} v
 */
function echantillonne(l, n, v){
  if (l.length < ECHANTILLON) l.push(v);
  else { const i = Math.floor(Math.random() * n); if (i < ECHANTILLON) l[i] = v; }
}

/* ------------------------------------------------------------
   La visite
   ------------------------------------------------------------ */
// les jalons du chargement : ceux de la page, que la visite suivante d'une borne n'a pas refaits
/** @type {Record<string, number>} */
const J = {};
const vue0 = () => ({ gestes: 0, tranches: TRANCHES.map(() => 0), saccades: 0 });

/** @type {any} */
let V = null;

/** Une visite neuve. `chargee` dit si elle commence avec la page : une borne
 *  qui change d'heure, une page revenue du cache arrière n'ont rien rechargé,
 *  et répéter leur chargement le compterait plusieurs fois au bilan. */
function nouvelleVisite(/** @type {boolean} */ chargee){
  V = { id: uuid(), debut: Date.now(), t0: chargee ? 0 : performance.now(), chargee,
    vues: { classique: vue0(), immersif: vue0() }, gesteDepuisEnvoi: false, immersif: false,
    gels: { n: 0, totalMs: 0, maxMs: 0, /** @type {any[]} */ pires: [] },
    reactivite: { n: 0, pireMs: 0, pireType: /** @type {string | undefined} */ (undefined),
      survols: { n: 0, pireMs: 0 } },
    /** @type {number[]} */ repeints: [], nRepeints: 0, maxRepeint: 0,
    /** @type {any[]} */ deck: [], nDeck: 0, pertes: 0, picMo: 0 };
}

/* ------------------------------------------------------------
   Les gestes, et la boucle d'images qu'ils allument

   La logique est celle du relevé, sans sa boucle permanente : le premier
   appui la démarre, et elle s'arrête d'elle-même `FIN_GESTE` après la
   dernière entrée. Un doigt posé sans bouger ne produit pas d'image, et ne
   la fait donc pas tourner ; il la relance en bougeant.
   ------------------------------------------------------------ */
/** @type {any} */
let geste = null;
const doigts = new Map();
let boucle = 0, precedente = 0, images = 0;

const vueDuMoment = () => GL.camera ? "immersif" : "classique";

function commence(/** @type {string} */ type){
  const t = performance.now();
  if (geste && t - geste.dernier < FIN_GESTE && geste.type === type){ geste.dernier = t; return geste; }
  if (geste) clos();
  geste = { type, doigts: 0, chemin: 0, dernier: t, vue: vueDuMoment() };
  relance();
  return geste;
}

/** La sorte du geste, telle qu'on la sait : un appui devient glisser ou pincer en chemin. */
const sorte = (/** @type {any} */ g) => g.type !== "appui" ? g.type : g.doigts > 1 ? "pincer" : g.chemin > 10 ? "glisser" : "appui";

function clos(){
  const g = geste;
  geste = null;
  if (!g) return;
  V.vues[g.vue].gestes++;
  V.gesteDepuisEnvoi = true;
  // deck.gl ne refait ses comptes que toutes les soixante images : la fin d'un geste en a vu passer
  const d = GL.deck && /** @type {any} */ (GL.deck).metrics;
  if (d){
    const gpu = typeof d.gpuTimePerFrame === "number" ? d.gpuTimePerFrame : d.gpuTime;
    const cpu = typeof d.cpuTimePerFrame === "number" ? d.cpuTimePerFrame : d.cpuTime;
    if (gpu || cpu || d.fps) echantillonne(V.deck, ++V.nDeck, { gpu: gpu || 0, cpu: cpu || 0, fps: d.fps || 0 });
  }
  memoire();
}

function relance(){
  if (!boucle && !document.hidden) boucle = requestAnimationFrame(image);
}

/** Le rappel de la boucle — compté ici même, que les essais lisent
 *  (`__essais.sonde.images`) pour s'assurer qu'elle se tait au repos. */
function image(/** @type {number} */ ts){
  boucle = 0;
  images++;
  try {
    if (document.hidden || !geste){ precedente = 0; return; }
    const t = performance.now();
    if (precedente){
      const dt = ts - precedente;
      // un retour d'arrière-plan n'est pas une saccade
      if (dt < 2000){
        const v = V.vues[vueDuMoment()];
        v.tranches[TRANCHES.findIndex(b => dt <= b)]++;
        if (dt > SACCADE) v.saccades++;
      }
    }
    if (GL.camera) V.immersif = true;
    if (t - geste.dernier >= FIN_GESTE){
      // le doigt levé, le geste est fini ; posé sans bouger, il attend le mouvement suivant
      if (!doigts.size) clos();
      precedente = 0;
      return;
    }
    precedente = ts;
    boucle = requestAnimationFrame(image);
  } catch (e) { precedente = 0; }
}

function ecouteGestes(){
  const o = { capture: true, passive: true };
  addEventListener("pointerdown", sur((/** @type {PointerEvent} */ e) => {
    doigts.set(e.pointerId, [e.clientX, e.clientY]);
    const g = geste && geste.type === "appui" && doigts.size > 1 ? geste : commence("appui");
    g.doigts = Math.max(g.doigts, doigts.size);
    g.dernier = performance.now();
  }), o);
  addEventListener("pointermove", sur((/** @type {PointerEvent} */ e) => {
    const avant = doigts.get(e.pointerId);
    if (!avant || !geste) return;
    geste.chemin += Math.hypot(e.clientX - avant[0], e.clientY - avant[1]);
    doigts.set(e.pointerId, [e.clientX, e.clientY]);
    geste.dernier = performance.now();
    relance();
  }), o);
  const leve = sur((/** @type {PointerEvent} */ e) => {
    if (!doigts.delete(e.pointerId) || !geste) return;
    geste.dernier = performance.now();
    relance();
  });
  addEventListener("pointerup", leve, o);
  addEventListener("pointercancel", leve, o);
  addEventListener("wheel", sur(() => commence("molette")), o);
  addEventListener("keydown", sur(() => commence("clavier")), o);
}

/* ------------------------------------------------------------
   Ce que le navigateur sait dire de lui-même
   ------------------------------------------------------------ */
const DE_NOUS = /^\/versions\/[^/]+\.js$/;

/** Le script, tel que le résumé le nomme : le chemin du nôtre, que le Worker
 *  ramène au module d'origine par sa carte ; le seul nom de fichier des autres.
 *  Le navigateur le situe par sa position dans le fichier : c'est le Worker qui
 *  en tire la ligne et la colonne (R4) — relire le paquet ici coûterait au
 *  téléphone une tâche longue de plus, juste après celle qu'on mesure. */
function nomDuScript(/** @type {string} */ u){
  try {
    const a = new URL(u, location.href);
    return a.origin === location.origin && DE_NOUS.test(a.pathname) ? a.pathname : fichier(u);
  } catch (e) { return ""; }
}

function gel(/** @type {number} */ duree, /** @type {any} */ scripts){
  const g = V.gels;
  g.n++; g.totalMs += duree; g.maxMs = Math.max(g.maxMs, duree);
  if (g.pires.length >= 3 && duree <= g.pires[2].ms) return;
  // le premier fautif : le script qui a tenu l'image le plus longtemps
  const s = (scripts || []).reduce((/** @type {any} */ a, /** @type {any} */ b) => !a || b.duration > a.duration ? b : a, null);
  const p = { ms: Math.round(duree), geste: geste ? sorte(geste) : undefined,
    url: s ? s.sourceURL || "" : "", fonction: s && s.sourceFunctionName || undefined,
    position: s && s.sourceCharPosition >= 0 ? s.sourceCharPosition : -1 };
  g.pires.push(p);
  g.pires.sort((/** @type {any} */ a, /** @type {any} */ b) => b.ms - a.ms);
  g.pires.length = Math.min(g.pires.length, 3);
}

function ecouteNavigateur(){
  observe("largest-contentful-paint", sur((/** @type {any} */ e) => { J.lcp = Math.round(e.startTime); }));
  const loaf = observe("long-animation-frame", sur((/** @type {any} */ e) => gel(e.duration, e.scripts)));
  if (!loaf) observe("longtask", sur((/** @type {any} */ e) => gel(e.duration, null)));
  /* La réactivité ne retient que ce que le visiteur a fait — appui, relâché,
     clic, touche : les événements qui portent un `interactionId`. Le
     navigateur rapporte aussi l'entrée et la sortie du pointeur d'un élément,
     qui partent seules dès que la page change sous une souris immobile : l'une
     d'elles, tombée dans une longue image, en prenait toute la durée, et la
     sonde désignait le survol comme la pire interaction de presque chaque
     visite sur poste fixe — 8,9 s de « pointerover » pour une image de 9,2 s
     au chargement, sans geste (relevés du 21 au 24 octobre 2026). Ces
     survols se comptent à part : ils disent qu'une longue image a eu un
     témoin, non que le survol coûte. Le champ `survols` marque aussi le
     changement de règle : les relevés qui ne l'ont pas comptaient tout. */
  observe("event", sur((/** @type {any} */ e) => {
    if (e.duration <= 100) return;
    if (e.interactionId > 0){
      const r = V.reactivite;
      r.n++;
      if (e.duration > r.pireMs){ r.pireMs = Math.round(e.duration); r.pireType = e.name; }
    } else if (SURVOLS.test(e.name)){
      const s = V.reactivite.survols;
      s.n++;
      s.pireMs = Math.max(s.pireMs, Math.round(e.duration));
    }
  }), { durationThreshold: 104 });
}
/** L'entrée et la sortie du pointeur, que rien n'a demandées au visiteur. */
const SURVOLS = /^(pointer|mouse)(over|out|enter|leave)$/;

function memoire(){
  const m = /** @type {any} */ (performance).memory;
  if (m) V.picMo = Math.max(V.picMo, Math.round(m.usedJSHeapSize / 1048576));
}

/* ------------------------------------------------------------
   L'appareil, lu une fois
   ------------------------------------------------------------ */
/** @type {any} */
let APPAREIL = null;

/** Le contexte WebGL du plan, s'il dessine : le lire ne coûte rien, quand un
 *  canevas neuf consommerait un contexte que les téléphones comptent. */
function contexteDuPlan(){
  const d = /** @type {any} */ (GL.deck);
  if (!d) return null;
  return (d.device && d.device.gl) || (GL.toile && /** @type {any} */ (GL.toile).getContext("webgl2")) || null;
}

let carteLue = false;

/** L'appareil. Tout ce qui ne coûte rien se lit dès le branchement : une
 *  visite qui ne voit jamais le plan, ou qui part avant, dit au moins sur quoi
 *  elle tournait. La carte graphique seule attend : sur le contexte du plan dès
 *  qu'il existe ; sans lui, dans le moment creux d'après l'affichage (`creux`). */
function lisAppareil(creux = false){
  if (!APPAREIL){
    // la taille de la fenêtre n'apprend rien sur l'appareil, et le distingue un peu plus
    const a = appareil({ agentComplet: false, carte: false });
    delete a.fenetre; delete a.carte;
    APPAREIL = a;
  }
  if (!carteLue){
    const gl = contexteDuPlan();
    if (gl || creux){ carteLue = true; APPAREIL.carte = carteGraphique(gl) || undefined; }
  }
  return APPAREIL;
}

/* ------------------------------------------------------------
   Le résumé
   ------------------------------------------------------------ */
/** La fin de la requête des données du salon : la dernière, s'il a fallu la refaire.
 *  Bien d'autres demandes partent sous la même adresse — l'entête (`entete=`),
 *  le fond du pavillon (`slug=…&fond=`, lancé avant l'affichage et souvent
 *  fini après), les vignettes. Seules comptent donc celles qui ne portent que
 *  `slug` et la version `v` : un paramètre ajouté demain n'y entrera pas. */
const DEMANDE_DU_PLAN = new Set(["slug", "v"]);
function finDesDonnees(/** @type {number} */ jusqua){
  if (!API) return undefined;
  const base = new URL(API, location.href).href;
  let fin = 0;
  for (const e of performance.getEntriesByType("resource")){
    if (!e.name.startsWith(base) || e.startTime > jusqua) continue;
    const cles = [...new URL(e.name).searchParams.keys()];
    if (cles.includes("slug") && cles.every(c => DEMANDE_DU_PLAN.has(c)))
      fin = Math.max(fin, /** @type {any} */ (e).responseEnd);
  }
  return fin ? Math.round(fin) : undefined;
}

/** Le bilan de l'ouverture, figé dès que le plan est affiché : ce que la
 *  visite charge ensuite (vignettes, fonds) n'est plus l'ouverture, et le
 *  rapport le dit « téléchargé à l'ouverture du plan ». Tant que rien n'est
 *  affiché (panne), il se refait à chaque envoi : c'est là qu'il a le plus à dire. */
/** @type {any} */
let OUVERTURE = null;

function leChargement(){
  // le LCP, lui, peut encore se préciser jusqu'au premier geste : il reste vivant
  if (OUVERTURE){ OUVERTURE.jalons.lcp = J.lcp; return OUVERTURE; }
  const affiche = J["plan-affiche"];
  const jusqua = affiche === undefined ? Infinity : affiche;
  const c = chargement(5, jusqua);
  const bilan = {
    jalons: { reponse: c.page ? c.page.reponse : undefined, domPret: c.page ? c.page.domPret : undefined,
      "plan-demarre": J["plan-demarre"], donnees: finDesDonnees(jusqua), "plan-affiche": affiche, lcp: J.lcp },
    transfertKo: c.transfertKo, depuisCache: c.depuisCache,
    lourds: c.ressources.map(({ fichier, sorte, ms, transfertKo, tailleKo }) => ({ fichier, sorte, ms, transfertKo, tailleKo })),
  };
  if (affiche !== undefined) OUVERTURE = bilan;
  return bilan;
}

function fluidite(/** @type {any} */ v){
  const n = v.tranches.reduce((/** @type {number} */ a, /** @type {number} */ b) => a + b, 0);
  // au-delà de 33 ms, l'image a manqué deux rafraîchissements : la main le sent
  const lentes = v.tranches.slice(TRANCHES.indexOf(50)).reduce((/** @type {number} */ a, /** @type {number} */ b) => a + b, 0);
  return { gestes: v.gestes, tranches: v.tranches.slice(), saccades: v.saccades,
    partPlus33: n ? ms(100 * lentes / n) : null };
}

function laCarte(){
  const reps = V.repeints.slice().sort((/** @type {number} */ a, /** @type {number} */ b) => a - b);
  const p95 = (/** @type {string} */ k) => {
    const l = V.deck.map((/** @type {any} */ d) => d[k]).filter((/** @type {number} */ x) => x > 0).sort((/** @type {number} */ a, /** @type {number} */ b) => a - b);
    return l.length ? ms(centile(l, .95)) : undefined;
  };
  const fps = V.deck.map((/** @type {any} */ d) => d.fps).filter((/** @type {number} */ x) => x > 0);
  const toile = /** @type {any} */ (GL.toile);
  return {
    // sans repeint (rendu SVG), aucun centile : un zéro tirerait la médiane vers le bas
    repeints: { n: V.nRepeints, p50: reps.length ? ms(centile(reps, .5)) : undefined,
      p95: reps.length ? ms(centile(reps, .95)) : undefined, max: reps.length ? ms(V.maxRepeint) : undefined },
    gpuMsP95: p95("gpu"), cpuMsP95: p95("cpu"), fpsMin: fps.length ? Math.round(Math.min(...fps)) : undefined,
    densite: toile && toile.clientWidth ? Math.round(100 * toile.width / toile.clientWidth) / 100 : undefined,
    logos: bilanLogos(), pertesContexte: V.pertes,
    // voulu en WebGL, le plan est en SVG : faute de contexte, de bibliothèque, ou après une perte
    basculeSvg: RENDU_WEBGL && estAffiche() && !GL.actif,
  };
}

/** Le résumé courant de la visite, au format `sonde-plan/1`. */
export function resumeSonde(){
  if (!V) return null;
  memoire();
  const g = V.gels;
  /** @type {any} */
  const r = {
    format: "sonde-plan/1", page: PAGE, support: SUPPORT,
    debut: new Date(V.debut).toISOString(), duree: Math.round(performance.now() - V.t0),
    chargement: V.chargee ? leChargement() : undefined,
    fluidite: { classique: fluidite(V.vues.classique), immersif: fluidite(V.vues.immersif) },
    gels: { n: g.n, totalMs: Math.round(g.totalMs), maxMs: Math.round(g.maxMs),
      pires: g.pires.map((/** @type {any} */ p) => ({ ms: p.ms, geste: p.geste,
        fichier: p.url ? nomDuScript(p.url) : undefined, fonction: p.fonction,
        position: p.url && p.position >= 0 ? p.position : undefined })) },
    reactivite: { ...V.reactivite, survols: { ...V.reactivite.survols } },
    gpu: laCarte(),
    memoire: { picMo: V.picMo || undefined },
    appareil: lisAppareil(),
    plan: { emplacements: TOUS.length, noeudsDom: document.getElementsByTagName("*").length,
      immersifUtilise: V.immersif || GL.camera },
  };
  return tronque(r);
}

const octets = (/** @type {any} */ o) => new TextEncoder().encode(JSON.stringify(o)).length;

/** Coupe chaque texte de `o` à `n` caractères. */
function coupe(/** @type {any} */ o, /** @type {number} */ n){
  for (const k of Object.keys(o)){
    if (typeof o[k] === "string" && o[k].length > n) o[k] = o[k].slice(0, n);
    else if (o[k] && typeof o[k] === "object") coupe(o[k], n);
  }
}

/** Ramène le résumé sous le plafond, du détail le moins utile au plus utile :
 *  les scripts des gels, puis les fichiers lourds un à un, puis les noms trop
 *  longs. Ce qui dépasse encore cède par groupes entiers : un résumé tronqué
 *  arrive, un résumé trop gros est refusé tout entier. */
function tronque(/** @type {any} */ r){
  if (octets(r) <= PLAFOND) return r;
  /* Sur une copie : le résumé partage le bilan figé de l'ouverture et
     l'appareil gardé, et ce qu'un envoi trop gros retire manquerait sinon
     à tous les suivants. */
  r = JSON.parse(JSON.stringify(r));
  r.gels.pires = r.gels.pires.map((/** @type {any} */ p) => ({ ms: p.ms, geste: p.geste }));
  const lourds = r.chargement && r.chargement.lourds;
  while (lourds && lourds.length && octets(r) > PLAFOND) lourds.pop();
  if (octets(r) > PLAFOND) coupe(r, 60);
  for (const [groupe, champ] of [["gpu", "logos"], ["gels", "pires"], ["appareil", "carte"], ["appareil", ""]]){
    if (octets(r) <= PLAFOND) break;
    if (!champ) delete r[groupe];
    else if (r[groupe]) delete r[groupe][champ];
  }
  return r;
}

/* ------------------------------------------------------------
   Les envois, et la file hors ligne

   Sur le modèle de `mesure.mjs` (`plan-mesures`) : rangé avant d'être tenté,
   repris au retour du réseau et à l'ouverture suivante. Une entrée par
   visite — chaque envoi porte tout le résumé, et le serveur remplace la
   ligne —, cinq au plus, sept jours au plus.
   ------------------------------------------------------------ */
const CLE_FILE = "plan-sonde";
const FILE_MAX = 5;
const FILE_JOURS = 7;
/** @type {any[] | null} */
let fileVolatile = null;

const fraiche = (/** @type {any} */ e) => !!e && typeof e.pose === "number" && !!e.visite && !!e.resume &&
  Date.now() - e.pose < FILE_JOURS * 86400000;

function litLaFile(){
  if (fileVolatile) return fileVolatile;
  try {
    const v = JSON.parse(localStorage.getItem(CLE_FILE) || "[]");
    return Array.isArray(v) ? v.filter(fraiche) : [];
  } catch (e) { return (fileVolatile = []); }
}

function ecritLaFile(/** @type {any[]} */ f){
  if (fileVolatile){ fileVolatile = f; return; }
  try {
    if (f.length) localStorage.setItem(CLE_FILE, JSON.stringify(f));
    else localStorage.removeItem(CLE_FILE);
  } catch (e) {
    try { localStorage.removeItem(CLE_FILE); } catch (err) {}
    fileVolatile = f;
  }
}

/** Retire l'entrée partie — celle-là, et non une plus récente de la même visite. */
const retire = (/** @type {any} */ e) => ecritLaFile(litLaFile().filter(x => !(x.visite === e.visite && x.pose === e.pose)));

/** Le corps d'une entrée, vers le Worker ou vers la RPC de l'administration. */
function corps(/** @type {any} */ e){
  return e.admin
    ? JSON.stringify({ p_slug: e.slug, p_version: e.version, p_visite: e.visite, p_resume: e.resume })
    : JSON.stringify({ slug: e.slug, page: e.page, visite: e.visite, resume: e.resume });
}

/* La version des pages : le Worker l'ajoute aux envois publics ; la RPC de
   l'administration ne passe pas par lui, la page la lit donc sur son script. */
function versionDesPages(){
  for (const s of document.scripts){
    const m = /\/versions\/plan(?:-admin)?\.([0-9a-f]{10})\.js$/.exec(s.src);
    if (m) return m[1];
  }
  return "";
}

/** Un envoi : « parti » (rien à attendre, refus du serveur compris), « garde »
 *  (session à refaire : il attend l'ouverture suivante), « panne » (le réseau
 *  ou le serveur manque : inutile d'essayer les suivants). */
async function envoieUne(/** @type {any} */ e, /** @type {boolean} */ dernier = false){
  /** @type {Response} */
  let r;
  try {
    if (e.admin){
      // un *beacon* ne porte pas d'en-têtes : la session passe par `fetch`
      const cfg = configProjet();
      if (!cfg?.url || !entetesApi().Authorization) return "garde";
      r = await fetch(cfg.url + "/rest/v1/rpc/sonde_admin", { method: "POST", keepalive: true,
        headers: { ...entetesApi(), "Content-Type": "application/json" }, body: corps(e) });
      // un jeton périmé ne s'échange pas ici : la sonde n'a pas à renouveler la session de l'exploitant
      if (r.status === 401 || r.status === 403) return "garde";
    } else {
      if (dernier && navigator.sendBeacon){
        // au départ de la page, `fetch` est coupé net, `sendBeacon` survit
        return navigator.sendBeacon(SONDE_API, corps(e)) ? "parti" : "panne";
      }
      r = await fetch(SONDE_API, { method: "POST", keepalive: true,
        headers: { "Content-Type": "application/json" }, body: corps(e) });
    }
    return r.ok || (r.status >= 400 && r.status < 500) ? "parti" : "panne";
  } catch (err) { return "panne"; }
}

let pousseEnCours = false;

async function pousse(/** @type {boolean} */ dernier = false){
  // un refus posé en cours de visite vaut aussi pour ce qui attendait en file (R5)
  if (!actif()) return;
  const f = litLaFile();
  // la péremption s'applique même quand rien ne part
  ecritLaFile(f);
  // la page publique n'a pas de session : ce que l'administration a laissé attend qu'elle rouvre
  const miennes = f.filter(e => PLAN_ADMIN || !e.admin);
  if (!miennes.length || navigator.onLine === false) return;
  if (dernier){
    // rien après l'appel n'est assuré de s'exécuter : on lance tout, sans attendre
    for (const e of miennes) envoieUne(e, true).then(sur((/** @type {string} */ s) => { if (s === "parti") retire(e); }));
    return;
  }
  if (pousseEnCours) return;
  pousseEnCours = true;
  try {
    for (const e of miennes){
      const s = await envoieUne(e);
      if (s === "panne") break;
      if (s === "parti") retire(e);
    }
  } finally { pousseEnCours = false; }
}

const actif = () => PLAN_ADMIN || mesureOuverte();
let dernierDepart = 0;

/** Le résumé du moment part — ou attend en file. `dernier` : la page s'en va. */
function envoie(dernier = false){
  if (!V || !actif()) return;
  // `visibilitychange` et `pagehide` arrivent souvent ensemble : un départ suffit
  if (dernier && Date.now() - dernierDepart < 1000) return;
  if (dernier) dernierDepart = Date.now();
  const resume = resumeSonde();
  V.gesteDepuisEnvoi = false;
  const f = litLaFile().filter(e => e.visite !== V.id);
  f.push({ visite: V.id, pose: Date.now(), admin: PLAN_ADMIN, slug: SLUG, page: PAGE,
    version: PLAN_ADMIN ? versionDesPages() : undefined, resume });
  ecritLaFile(f.slice(-FILE_MAX));
  pousse(dernier);
}

/* ------------------------------------------------------------
   Le branchement
   ------------------------------------------------------------ */
let SUPPORT = "";
let branchee = false;

/**
 * La sonde, branchée par `lancement.mjs` `lancePlan` juste après la mesure :
 * elle en suit le refus. Rien sous `?perf`, rien chez qui a refusé hors de
 * l'administration — et ce qu'il avait laissé en file part avec son refus.
 */
export function brancheSonde(){
  if (branchee || PERF) return;
  branchee = true;
  try {
    if (!actif()){
      const f = litLaFile();
      if (f.some(e => !e.admin)) ecritLaFile(f.filter(e => e.admin));
      return;
    }
    demarre();
  } catch (e) { /* la sonde ne doit jamais empêcher le plan de démarrer */ }
}

function demarre(){
  SUPPORT = supportMesure();
  lisAppareil();
  nouvelleVisite(true);
  ecouteGestes();
  ecouteNavigateur();
  REPEINT_FINI.ecoute(sur((/** @type {number} */ duree) => {
    V.nRepeints++;
    V.maxRepeint = Math.max(V.maxRepeint, duree);
    echantillonne(V.repeints, V.nRepeints, duree);
  }));
  CONTEXTE_PERDU.ecoute(sur(() => { V.pertes++; }));
  PLAN_DEMARRE.ecoute(sur(() => { J["plan-demarre"] = Math.round(performance.now()); }));
  quandAffiche(sur(() => {
    J["plan-affiche"] = Math.round(performance.now());
    setTimeout(sur(() => envoie()), PREMIER_ENVOI);
    // sans dessin WebGL, la carte graphique se lit une fois, au calme
    enCreux(() => lisAppareil(!RENDU_WEBGL || !GL.actif));
  }));
  setTimeout(sur(() => { if (!estAffiche()) envoie(); }), SANS_AFFICHAGE);
  setInterval(sur(() => { if (!document.hidden && V.gesteDepuisEnvoi) envoie(); }), RYTHME);
  if (BORNE) setInterval(sur(() => { envoie(); nouvelleVisite(false); }), HEURE);

  addEventListener("visibilitychange", sur(() => {
    if (document.visibilityState !== "hidden") return;
    // un doigt resté posé quand la page s'est cachée ne se lèvera jamais pour elle
    doigts.clear();
    envoie(true);
  }));
  addEventListener("pagehide", sur(() => envoie(true)));
  // revenue du cache arrière, la page reprend sans recharger : c'est une autre visite
  addEventListener("pageshow", sur((/** @type {PageTransitionEvent} */ e) => {
    if (!e.persisted) return;
    nouvelleVisite(false);
    setTimeout(sur(() => envoie()), PREMIER_ENVOI);
  }));
  addEventListener("online", sur(() => pousse()));
  // ce qu'une visite précédente n'a pas pu envoyer repart, à tête reposée
  enCreux(() => pousse());

  const essais = /** @type {any} */ (globalThis).__essais;
  if (essais) essais.sonde = { get resume(){ return resumeSonde(); }, get images(){ return images; },
    get visite(){ return V.id; } };
}
