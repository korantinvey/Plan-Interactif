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

   Ce qui a échoué y a sa place, à côté de ce qui a été lent : les erreurs de
   la page pendant la visite (`erreurs.mjs` `bilanErreurs`, que la base ne
   comptait que par jour), la raison d'un plan qui n'a pas paru
   (`demarrage.mjs` `PLAN_EN_PANNE`), si la page était cachée avant de
   paraître — un départ, non une panne —, les appels à nos services qui ont
   répondu en erreur, et les visites d'un navigateur piloté (`robot`), que la
   fiche du lundi écarte de ses médianes.

   Une mesure fausse se découvre après coup, dans les relevés : survols pris
   pour des interactions, jalon des données négatif, Safari tenu pour un
   navigateur qui dit ses gels. Chaque correction de ce que mesure un champ
   avance donc `REVISION`, que le résumé porte (`rev`) : la fiche sépare les
   relevés d'avant et d'après sans deviner la règle à la présence d'un champ.
   Et ce qu'un relevé doit tenir pour être vraisemblable — jalons dans
   l'ordre, parts bornées, pires gels triés — est écrit une fois, dans
   `outils/scripts/sonde-coherence.js`, que les essais imposent à chaque
   résumé et que la fiche du lundi applique à chaque relevé de la semaine.

     1 — jusqu'au 10 novembre 2026, sans `rev`.
     2 — 10 novembre 2026. Le transfert et la part du cache ne comptent plus
         ce que le service de second plan a servi sans dire d'où
         (`mesures-page.mjs` `trajet`) ; le temps passé caché ou hors de
         l'écran avant l'affichage est dit (`invisibleAvantMs`), et le LCP
         s'arrête au premier départ ; un geste fait hors du plan — la liste,
         la recherche, une fiche — ne compte plus dans la fluidité du plan
         (`fluidite.horsPlan`) ; un gel dit comment le navigateur est entré
         dans son script, et ce que l'image a passé hors des scripts ; un
         instant que la page n'a pas atteint, un aller-retour qu'elle ne
         connaît pas, ne valent plus zéro ; `visibleMs` dit la durée vue.
   ============================================================ */
import { API, SLUG, PLAN_ADMIN, BORNE, entetesApi, configProjet } from "./salon.mjs";
import { GL, RENDU_WEBGL, REPEINT_FINI, CONTEXTE_PERDU, COMPTES_DECK, IMAGE_DECK, TOILE_PRETE, carteDuWebgl, sousPixelOffert } from "./webgl.mjs";
import { quandAffiche, estAffiche } from "./affichage.mjs";
import { PLAN_DEMARRE, PLAN_EN_PANNE } from "./demarrage.mjs";
import { CARTE_ENVIRONS } from "./environs.mjs";
import { bilanErreurs } from "./erreurs.mjs";
import { TOUS } from "./donnees.mjs";
import { bilanLogos } from "./logos-stands.mjs";
import { mesureOuverte, supportMesure } from "./mesure.mjs";
import { SACCADE, FIN_GESTE, TRANCHES, PREMIERE_LENTE, centile, fichier, observe, chargement, appareil, carteGraphique } from "./mesures-page.mjs";

const PERF = /[?&]perf(?:[=&]|$)/.test(location.search);
// ce que mesure chaque champ a changé : voir l'en-tête
const REVISION = 2;
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
/* Les pertes du dessin, chacune avec sa raison : un compte seul ne disait pas
   si la carte graphique avait été reprise ou si la garde de la boucle avait
   conclu à tort — trois pertes sur un même téléphone, sans moyen de trancher
   (sonde, 6 novembre 2026). Les premières suffisent. */
const PERTES_DITES = 3;

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
/* Une image lente : au-delà de 33 ms, deux rafraîchissements manqués, que la main sent. */
const LENTE = PREMIERE_LENTE;
/* `repos` et `lentesRepos` comptent, parmi les images d'un geste, celles où le
   dessin était revenu au repos (`webgl.mjs` `poseGeste`) : le texte entier,
   sous-pixel et petit atlas compris, les logos dégelés. Le dessin y revient
   250 ms après la dernière entrée, quand le geste ne se clôt qu'à 300
   (`FIN_GESTE`) : l'image qui remet tout au complet se compte donc dans le
   geste, et sur les tours de molette du bureau, courts, elle pèse lourd dans
   la part des images lentes. Les tranches ne changent pas : la fiche reste
   comparable d'une semaine à l'autre. */
const vue0 = () => ({ gestes: 0, tranches: TRANCHES.map(() => 0), saccades: 0, repos: 0, lentesRepos: 0 });

/** @type {any} */
let V = null;
/* Ce que l'ouverture de la page a connu avant de paraître : une page cachée
   (un onglet ouvert en arrière-plan, une application quittée aussitôt) n'a
   pas paru parce qu'on ne la regardait pas ; une panne, parce qu'elle ne le
   pouvait pas. */
let cacheeAvant = false;
/** @type {{ sorte: string, statut?: number } | null} */
let panne = null;

/** Une visite neuve. `chargee` dit si elle commence avec la page : une borne
 *  qui change d'heure, une page revenue du cache arrière n'ont rien rechargé,
 *  et répéter leur chargement le compterait plusieurs fois au bilan. */
function nouvelleVisite(/** @type {boolean} */ chargee){
  const maintenant = performance.now();
  // la visite d'avant garde le temps vu jusqu'ici ; celle-ci part de son début
  if (V) cumuleVu(maintenant);
  V = { id: uuid(), debut: Date.now(), t0: chargee ? 0 : maintenant, chargee,
    vues: { classique: vue0(), immersif: vue0() }, horsPlan: vue0(), gesteDepuisEnvoi: false, immersif: false,
    visibleMs: 0,
    gels: { n: 0, totalMs: 0, maxMs: 0, /** @type {any[]} */ pires: [] },
    battement: { n: 0, totalMs: 0, maxMs: 0, avantAffichage: 0, pendantGeste: 0, couvertMs: 0 },
    reactivite: { n: 0, pireMs: 0, pireType: /** @type {string | undefined} */ (undefined),
      survols: { n: 0, pireMs: 0 } },
    /** @type {number[]} */ repeints: [], nRepeints: 0, maxRepeint: 0,
    /** @type {any[]} */ deck: [], nDeck: 0, pertes: 0, /** @type {any[]} */ raisons: [], picMo: 0 };
  if (chargee && (document.hidden || /** @type {any} */ (document).prerendering)){
    cacheeAvant = true;
    // cachée dès l'ouverture : depuis le début de la navigation, non depuis le branchement
    vu = false; vuDepuis = 0; premierDepart = 0;
  } else { vu = !document.hidden && cadreVisible; vuDepuis = chargee ? 0 : maintenant; }
}

/* ------------------------------------------------------------
   Vue ou non

   Une page cachée, un cadre intégré sorti de l'écran, ne reçoivent plus
   d'images : le navigateur les suspend. Ce que la sonde y mesure n'est plus
   la page, mais l'absence de qui la regarde. Des plans intégrés y passaient
   pour s'être affichés en 197 s, 441 s, 8 753 s — la dernière image de leur
   ouverture durant à elle seule le temps qu'on mettait à revenir, et le
   cadre hors de l'écran n'était marqué nulle part (sonde, 3 au 10 novembre
   2026). Le LCP s'y précisait encore à 202 s, quand le cadre revenait dans
   l'écran.

   On cumule donc le temps vu (`visibleMs`), le temps passé invisible avant
   l'affichage (`invisibleAvantMs`, que la fiche du lundi retire de ses
   médianes d'ouverture), et l'instant du premier départ (`premierDepart`),
   après lequel le LCP ne dit plus rien : la règle de `web-vitals`, qui
   s'arrête à la première page cachée.
   ------------------------------------------------------------ */
let vu = true, vuDepuis = 0, invisibleAvant = 0, premierDepart = Infinity, horsVueAvant = false;

/** Range le morceau de visite qui finit à `t`, vu ou non. */
function cumuleVu(/** @type {number} */ t){
  if (!V) return;
  if (vu) V.visibleMs += Math.max(0, t - Math.max(vuDepuis, V.t0));
  else {
    const affiche = J["plan-affiche"];
    const avant = Math.min(t, affiche === undefined ? Infinity : affiche) - vuDepuis;
    if (V.chargee && avant > 0) invisibleAvant += avant;
  }
  vuDepuis = t;
}

/** Ce que la page vient d'apprendre : cachée ou non, cadre dans l'écran ou non. */
function poseVu(){
  const maintenant = !document.hidden && cadreVisible;
  if (maintenant === vu) return;
  const t = performance.now();
  cumuleVu(t);
  vu = maintenant;
  if (!vu){
    premierDepart = Math.min(premierDepart, t);
    if (!estAffiche() && !document.hidden) horsVueAvant = true;
  }
}

/** Le temps passé invisible avant l'affichage, morceau en cours compris tant que rien n'est affiché. */
function invisibleAvantAffichage(){
  const affiche = J["plan-affiche"];
  const enCours = !vu ? Math.max(0, Math.min(performance.now(), affiche === undefined ? Infinity : affiche) - vuDepuis) : 0;
  return Math.round(invisibleAvant + enCours) || undefined;
}

/** Le LCP, s'il précède le premier départ : ce qui vient après dit un retour, non l'ouverture. */
const lcpVu = () => J.lcp !== undefined && J.lcp < premierDepart ? J.lcp : undefined;

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

/* Un geste sur le plan part de `svg#plan`, où `gestes.mjs` écoute tous les
   siens : la toile du dessin ne prend aucun pointeur. La sonde écoute la page
   entière, et rangeait dans la fluidité du plan la liste qu'on fait défiler,
   la recherche qu'on tape, la fiche qu'on parcourt — des images que le plan
   ne dessinait pas. Elles se comptent à part (`horsPlan`). */
const surLePlan = (/** @type {Event} */ e) => {
  const c = /** @type {any} */ (e.target);
  return !!(c && typeof c.closest === "function" && c.closest("#plan"));
};

function commence(/** @type {string} */ type, /** @type {boolean} */ plan){
  const t = performance.now();
  if (geste && t - geste.dernier < FIN_GESTE && geste.type === type && geste.plan === plan){ geste.dernier = t; return geste; }
  if (geste) clos();
  geste = { type, plan, doigts: 0, chemin: 0, dernier: t, vue: vueDuMoment() };
  relance();
  bat();
  return geste;
}

/** La sorte du geste, telle qu'on la sait : un appui devient glisser ou pincer en chemin. */
const sorte = (/** @type {any} */ g) => (g.type !== "appui" ? g.type : g.doigts > 1 ? "pincer" : g.chemin > 10 ? "glisser" : "appui") +
  (g.plan ? "" : " hors plan");

function clos(){
  const g = geste;
  geste = null;
  if (!g) return;
  (g.plan ? V.vues[g.vue] : V.horsPlan).gestes++;
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
        const v = geste.plan ? V.vues[vueDuMoment()] : V.horsPlan;
        const i = TRANCHES.findIndex(b => dt <= b);
        v.tranches[i]++;
        if (dt > SACCADE) v.saccades++;
        // l'état à la fin de l'intervalle : celui de l'image qu'il a attendue
        if (geste.plan && GL.actif && !GL.geste){ v.repos++; if (i >= LENTE) v.lentesRepos++; }
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
    const g = geste && geste.type === "appui" && doigts.size > 1 ? geste : commence("appui", surLePlan(e));
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
  addEventListener("wheel", sur((/** @type {WheelEvent} */ e) => commence("molette", surLePlan(e))), o);
  addEventListener("keydown", sur((/** @type {KeyboardEvent} */ e) => commence("clavier", surLePlan(e))), o);
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

/* Ce que deck.gl et luma.gl ont fait, en comptes cumulés : le temps passé à
   recalculer les attributs des couches et le nombre de couches remises à jour
   (`deck.stats`), les shaders, les programmes et les textures créés
   (`statsManager` de la carte graphique — un programme créé est un programme
   compilé et lié). La longue image ne nomme que la boucle de deck.gl,
   `_animationFrame`, par où le navigateur est entré : tout ce qu'elle fait
   s'y range, et le gel ne disait pas si l'image avait compilé, recalculé ou
   seulement dessiné — sur les postes Windows à carte graphique intégrée, des
   gels d'une à quatre secondes restaient sans cause (sonde, FUNEXPO 2026,
   9 novembre 2026). `deck.metrics` ne s'y prête pas : ses comptes ne se
   refont que toutes les soixante images. */
const TRAVAUX = /** @type {const} */ (["attrMs", "couches", "shaders", "programmes", "textures"]);
const lu = (/** @type {any} */ st, /** @type {string} */ nom, /** @type {string} */ champ) => {
  try { const x = st && st.get(nom); return x && Number(x[champ]) || 0; } catch (e) { return 0; }
};
/* deck.gl remet ses comptes à zéro toutes les soixante images, après en avoir
   tiré `deck.metrics` : lus d'un gel à l'autre, ils ne disaient rien. Ce qu'il
   en a tiré nous parvient avant la remise à zéro (`COMPTES_DECK`, posé sur
   `_onMetrics`), et se cumule ici, par dessin ; ce qu'il tient depuis s'y
   ajoute à la lecture. */
/** @type {WeakMap<any, { attrMs: number, couches: number }>} */
const cumulsDeck = new WeakMap();
function cumulDeck(/** @type {any} */ d){
  let c = cumulsDeck.get(d);
  if (!c) cumulsDeck.set(d, c = { attrMs: 0, couches: 0 });
  return c;
}
function travauxDeck(){
  const d = /** @type {any} */ (GL.deck);
  if (!d) return null;
  const c = cumulDeck(d);
  let res = null;
  try { res = d.device && d.device.statsManager && d.device.statsManager.getStats("GPU Resource Counts"); } catch (e) { res = null; }
  // en WebGL, le programme lié est la canalisation partagée : les autres l'enveloppent
  return { attrMs: c.attrMs + lu(d.stats, "Update Attributes", "time"),
    couches: c.couches + lu(d.stats, "Layer updates", "count"),
    shaders: lu(res, "Shaders Created", "count"), programmes: lu(res, "SharedRenderPipelines Created", "count"),
    textures: lu(res, "Textures Created", "count") };
}
/* Un gel n'est remis qu'après coup, par lots, et au démarrage — là où ils
   comptent le plus — longtemps après : le fil est pris. Les comptes lus à la
   remise ne disaient donc rien de l'image gelée ; lus pour le premier d'un
   lot, ils lui attribuaient la mise en route du dessin, survenue après lui
   (essai, 9 novembre 2026). Ils se relèvent à la place à chaque image que
   deck.gl dessine (`IMAGE_DECK`), horodatés : le gel prend ce qui a changé
   entre le dernier relevé d'avant son début et le dernier d'avant sa fin —
   ce qu'a fait son image, et elle seule. Au repos, deck.gl ne dessine pas, et
   rien ne se relève. */
const INSTANTS_MAX = 300;
/** @type {{ t: number, deck: any, v: Record<string, number> }[]} */
const instants = [];
// des relevés sont tombés du bout de la file : un gel plus ancien n'a plus d'avant
let instantsPerdus = false;
function releveInstant(){
  const v = travauxDeck();
  if (!v) return;
  instants.push({ t: performance.now(), deck: GL.deck, v });
  if (instants.length > INSTANTS_MAX){ instants.shift(); instantsPerdus = true; }
}
/** Ce que deck.gl a fait pendant l'image [debut, fin] — ou rien si l'on ne
 *  peut plus le savoir. `fenetreMs` dit l'écart réel des deux relevés : il
 *  couvre l'image, et la fin de celle d'avant. Le premier relevé d'un dessin
 *  part de zéro, sa création : il porte la mise en route. */
function travauxPendant(/** @type {number} */ debut, /** @type {number} */ fin){
  const d = /** @type {any} */ (GL.deck);
  if (!d || debut < 0) return undefined;
  /** @type {any} */
  let avant = null, apres = null;
  for (const x of instants){
    if (x.deck !== d) continue;
    if (x.t <= debut) avant = x;
    if (x.t <= fin) apres = x;
  }
  // rien de ce dessin avant le gel : il est né pendant, ou ses premiers relevés sont perdus
  if (!avant && instantsPerdus) return undefined;
  /** @type {Record<string, number>} */
  const r = {};
  if (!apres || apres === avant) return r;
  for (const k of TRAVAUX){
    const v = Math.round(apres.v[k] - (avant ? avant.v[k] : 0));
    if (v > 0) r[k] = v;
  }
  if (avant) r.fenetreMs = Math.round(apres.t - avant.t);
  return r;
}

/* L'ouverture, image par image.

   Avant que le plan paraisse, le dessin fait entrer une sorte de couche par
   image (`webgl.mjs`, « Une sorte de couche par image ») : quatre ou cinq
   images, de quatre cents millisecondes à plus d'une seconde chacune sur les
   postes Windows, quelle que soit la carte graphique (sonde, 2 au 9 novembre
   2026). Ce relevé a montré depuis que l'attente est celle d'une première
   visite : le même poste revenu ne passe plus que 20 à 140 ms à lier, quand
   la première lui en coûtait 1 à 1,7 s (FUNEXPO 2026, 10 novembre) — le
   navigateur garde les programmes liés, ce dont `webgl.mjs` profite
   (« Les programmes préparés pendant que les données arrivent »). Les
   travaux de l'image disent qu'elle a créé un
   programme, pas ce qu'il a coûté : la page a-t-elle attendu la compilation,
   ou fait autre chose ? Le navigateur compile à part, dans le processus de
   la carte graphique, et la page n'attend qu'en demandant le résultat — ce
   que deck.gl fait aussitôt. On chronomètre donc ces demandes, sur le
   contexte du dessin et jusqu'à l'affichage seulement : chaque image dit sa
   durée depuis la précédente, et ce qu'elle a passé à attendre la carte
   graphique. Puis le contexte retrouve ses fonctions d'origine. */
const IMAGES_DITES = 8;
/** [durée depuis l'image d'avant, attente de la compilation, programmes créés], en ms
 *  @type {number[][]} */
let imagesOuverture = [];
let attenteCompilation = 0, imagePrecedente = 0, programmesAvant = 0;
function guetteCompilation(/** @type {any} */ gl){
  if (!gl || estAffiche()) return;
  imagesOuverture = []; attenteCompilation = 0; programmesAvant = 0;
  imagePrecedente = performance.now();
  // d'où partent les images : ce qui sépare leur somme de « plan-affiche » est la peinture qui suit
  J.toile = Math.round(imagePrecedente);
  const noms = ["getShaderParameter", "getProgramParameter"];
  for (const nom of noms){
    const f = gl[nom];
    if (typeof f !== "function") continue;
    // posée sur ce contexte seul : la retirer rend celle de son prototype
    gl[nom] = function (/** @type {any[]} */ ...a){
      const t = performance.now();
      try { return f.apply(this, a); } finally { attenteCompilation += performance.now() - t; }
    };
  }
  quandAffiche(sur(() => { for (const nom of noms) delete gl[nom]; }));
}
function imageDOuverture(){
  if (estAffiche() || !imagePrecedente || imagesOuverture.length >= IMAGES_DITES) return;
  const t = performance.now(), v = travauxDeck(), p = v ? v.programmes : 0;
  imagesOuverture.push([Math.round(t - imagePrecedente), Math.round(attenteCompilation), p - programmesAvant]);
  imagePrecedente = t; attenteCompilation = 0; programmesAvant = p;
}

/* Comment le navigateur est entré dans le script : son évaluation, un
   rappel d'image, un écouteur, une promesse. Un mot de sa liste, rien d'autre. */
const INVOCATION = /^[a-z-]{1,24}$/;

/**
 * Ce que la longue image dit d'elle-même (`long-animation-frame`), au-delà de
 * son script le plus long. Les plus gros gels de l'ouverture — une à quatre
 * secondes et demie — se rangeaient à la ligne 1, colonne 1 du paquet, sans
 * travaux de deck.gl (sonde, 3 au 10 novembre 2026) : la position zéro est
 * celle de l'évaluation du module entier, où le point d'entrée lance le plan,
 * et ne désigne aucune ligne. L'invocation le dit ; le temps des scripts,
 * celui que le navigateur a passé à remettre la page en forme pour eux
 * (`forcedStyleAndLayoutDuration`), et celui du rendu qui suit, disent où
 * l'image a passé le reste — et si les travaux, relevés d'une image du dessin
 * à la suivante, la couvrent.
 */
function decoupe(/** @type {any} */ e, /** @type {any[]} */ scripts, /** @type {any} */ s){
  if (!e) return {};
  const fin = e.startTime + e.duration;
  const somme = (/** @type {string} */ k) => Math.round(scripts.reduce((a, x) => a + (Number(x[k]) || 0), 0));
  const invocation = s && INVOCATION.test(s.invokerType || "") ? s.invokerType : undefined;
  return { invocation, scriptsMs: somme("duration"), forceeMs: somme("forcedStyleAndLayoutDuration") || undefined,
    renduMs: e.renderStart > 0 ? Math.round(fin - e.renderStart) : undefined,
    miseEnPageMs: e.styleAndLayoutStart > 0 ? Math.round(fin - e.styleAndLayoutStart) : undefined };
}

function gel(/** @type {number} */ duree, /** @type {any} */ scripts, /** @type {number} */ debut, /** @type {any} */ entree = null){
  gelPendantLaCarte(duree, scripts, debut);
  const g = V.gels;
  g.n++; g.totalMs += duree; g.maxMs = Math.max(g.maxMs, duree);
  if (g.pires.length >= 3 && duree <= g.pires[2].ms) return;
  const travaux = travauxPendant(debut, debut + duree);
  // le premier fautif : le script qui a tenu l'image le plus longtemps
  const s = (scripts || []).reduce((/** @type {any} */ a, /** @type {any} */ b) => !a || b.duration > a.duration ? b : a, null);
  /* Le moment, depuis le début de la visite, et s'il tombe avant que le plan
     paraisse : une compilation se paie au démarrage, un recalcul de couches
     tout au long de la visite. */
  const t = debut >= 0 ? Math.round(debut - V.t0) : undefined;
  const affiche = J["plan-affiche"];
  const p = { ms: Math.round(duree), geste: geste ? sorte(geste) : undefined,
    url: s ? s.sourceURL || "" : "", fonction: s && s.sourceFunctionName || undefined,
    // zéro : l'évaluation du script entier, que `decoupe` nomme, et non sa première ligne
    position: s && s.sourceCharPosition > 0 ? s.sourceCharPosition : -1,
    t, avantAffichage: affiche === undefined || debut < affiche || undefined, travaux,
    ...decoupe(entree, scripts || [], s) };
  g.pires.push(p);
  g.pires.sort((/** @type {any} */ a, /** @type {any} */ b) => b.ms - a.ms);
  g.pires.length = Math.min(g.pires.length, 3);
}

/* ------------------------------------------------------------
   Le battement : les gels que le navigateur ne dit pas

   Safari, Firefox et tout navigateur d'iPhone n'ont ni `long-animation-frame`
   ni `longtask` ; Chrome sur Android les a, mais ne les rapporte presque
   jamais au plan intégré dans le site d'un salon — 4 visites sur 16, contre
   9 sur 9 hors du cadre (sonde, FUNEXPO 2026, 10 novembre 2026) : le cadre y
   vit dans le processus de la page hôte, à qui le navigateur rapporte la
   longue image. « Zéro gel » sur mobile ne disait donc rien, quand la pire
   image de l'ouverture y passait 700 ms.

   Une minuterie de `BATTEMENT` ms, dont on mesure le retard : une tâche qui
   tient la page la retarde d'autant, quel que soit le navigateur. Le compte
   reste à part (`gels.battement`) : la colonne `gels` et la fiche du lundi
   gardent la mesure du navigateur, et là où les deux existent — Chrome sur
   le bureau — l'une étalonne l'autre.

   Il ne bat que là où les gels se paient, et où le plan travaille de toute
   façon : l'ouverture et sa traîne (`TRAINE_OUVERTURE`, les compilations
   courent après l'affichage), puis chaque geste. Jamais au repos, ni page
   cachée, ni cadre sorti de l'écran : Safari y espace les minuteries d'un
   cadre étranger, et chaque battement retardé passerait pour un gel.
   ------------------------------------------------------------ */
const BATTEMENT = 50;
// au-delà, une tâche a tenu la page : le seuil des longues tâches du navigateur
const RETARD_GEL = 50;
const TRAINE_OUVERTURE = 10000;
let battant = 0, attendu = 0, battements = 0, cadreVisible = true;

function doitBattre(){
  if (document.hidden || !cadreVisible || !V) return false;
  if (geste) return true;
  if (!V.chargee) return false;
  const affiche = J["plan-affiche"];
  return performance.now() < (affiche === undefined ? SANS_AFFICHAGE : affiche + TRAINE_OUVERTURE);
}

/** Un battement — et le premier, d'où qu'on l'appelle : une chaîne seulement. */
function bat(){
  if (battant) return;
  if (!doitBattre()){ attendu = 0; return; }
  attendu = performance.now() + BATTEMENT;
  battant = setTimeout(battu, BATTEMENT);
}

function battu(){
  battant = 0;
  battements++;
  const t = performance.now();
  // la page cachée entre-temps : son retard est celui du navigateur, non un gel
  if (attendu && doitBattre()){
    const b = V.battement, retard = t - attendu;
    b.couvertMs += t - attendu + BATTEMENT;
    if (retard >= RETARD_GEL){
      b.n++; b.totalMs += retard; b.maxMs = Math.max(b.maxMs, retard);
      if (J["plan-affiche"] === undefined) b.avantAffichage++;
      if (geste) b.pendantGeste++;
      if (dansLaCarte(attendu)) CARTE.battementMs += retard;
    }
  }
  attendu = 0;
  bat();
}

function ecouteBattement(){
  addEventListener("visibilitychange", sur(() => { poseVu(); if (!document.hidden) bat(); }));
  // un cadre hors de l'écran : l'observateur sans racine le dit par rapport à la page hôte
  if (window.top !== window.self && typeof IntersectionObserver === "function"){
    let premiere = true;
    new IntersectionObserver(sur((/** @type {IntersectionObserverEntry[]} */ l) => {
      cadreVisible = l[l.length - 1].isIntersecting;
      /* La première réponse dit l'état de l'ouverture : un cadre posé plus bas
         que l'écran de la page hôte l'était depuis le début, et non depuis
         que l'observateur l'a dit. */
      if (premiere && !cadreVisible && V && V.chargee && vu){
        V.visibleMs = 0; vuDepuis = 0; vu = false; premierDepart = 0;
        if (!estAffiche()) horsVueAvant = true;
      } else poseVu();
      premiere = false;
      if (cadreVisible) bat();
    })).observe(document.documentElement);
  }
  bat();
}

/* ------------------------------------------------------------
   La carte des environs

   Un fond vectoriel monte MapLibre juste après l'affichage : huit cents
   kilo-octets à lire, un second contexte WebGL et ses programmes, puis les
   tuiles. Ses gels se perdaient parmi les autres — la sonde ne garde que les
   trois pires, et la compilation de deck.gl passe devant sur la plupart des
   postes (`environs.mjs` `CARTE_ENVIRONS`). On suit donc le montage à part :
   chaque étape, en millisecondes depuis la demande, et ce que la page a gelé
   entre la demande et la carte chargée, plus une seconde de traîne — en
   tout, et dans les scripts de MapLibre seuls.

   La carte est celle de la page, non de la visite : une borne qui change de
   visite à l'heure ne la remonte pas, et ne la redit donc qu'une fois.
   ------------------------------------------------------------ */
const TRAINE_CARTE = 1000;
// une carte qui ne se charge jamais ne tient pas la fenêtre ouverte toute la visite
const CARTE_MAX = 30000;
/** @type {any} */
let CARTE = null;
const DE_MAPLIBRE = /maplibre/i;

function dansLaCarte(/** @type {number} */ t){
  if (!CARTE || t < CARTE.t0) return false;
  const fin = CARTE.chargeeA !== undefined ? CARTE.chargeeA + TRAINE_CARTE : CARTE.t0 + CARTE_MAX;
  return t <= fin;
}

function gelPendantLaCarte(/** @type {number} */ duree, /** @type {any} */ scripts, /** @type {number} */ debut){
  if (!dansLaCarte(debut)) return;
  CARTE.gelsN++; CARTE.gelsMs += duree;
  for (const sc of scripts || []) if (DE_MAPLIBRE.test(sc.sourceURL || "")) CARTE.maplibreMs += sc.duration || 0;
}

function etapeDeLaCarte(/** @type {string} */ etape, /** @type {any} */ d = {}){
  const t = performance.now();
  if (etape === "demandee"){
    // un second montage — un autre fond choisi — ne refait pas la mesure du premier
    if (CARTE) return;
    CARTE = { t0: t, fond: d.fond, deja: !!d.deja, fige: !!d.fige, gelsN: 0, gelsMs: 0, maplibreMs: 0, battementMs: 0 };
    return;
  }
  if (!CARTE) return;
  const depuis = Math.round(t - CARTE.t0);
  if (etape === "bibliotheque" && CARTE.bibliothequeMs === undefined){
    CARTE.bibliothequeMs = depuis;
    /* Le fichier, tel que le navigateur l'a reçu : ce qui sépare sa fin de
       réception de son `onload` est le temps de le lire. */
    const e = /** @type {any} */ (performance.getEntriesByName(d.adresse || "")[0]);
    if (e){
      CARTE.telechargementMs = Math.round(e.duration);
      if (e.transferSize !== undefined) CARTE.transfertKo = Math.round(e.transferSize / 1024);
      if (e.responseEnd > 0) CARTE.lectureMs = Math.round(t - e.responseEnd);
    }
  } else if (etape === "creee" && CARTE.creationMs === undefined){
    CARTE.creationMs = Math.round(d.ms || 0);
  } else if (etape === "chargee" && CARTE.chargeeA === undefined){
    CARTE.chargeeA = t;
    CARTE.chargeeMs = depuis;
  } else if (etape === "echec" && !CARTE.echec){
    CARTE.echec = String(d.message || "").slice(0, 60);
  }
}

function laCarteDesEnvirons(){
  if (!CARTE || !V.chargee) return undefined;
  const c = CARTE;
  /* `fige` : le fond était le lot d'images de l'exploitant, sans MapLibre —
     ses étapes de bibliothèque et de création restent alors vides. */
  return { fond: c.fond, deja: c.deja || undefined, fige: c.fige || undefined,
    demandeeMs: Math.round(c.t0 - V.t0), bibliothequeMs: c.bibliothequeMs,
    telechargementMs: c.telechargementMs, transfertKo: c.transfertKo, lectureMs: c.lectureMs,
    creationMs: c.creationMs, chargeeMs: c.chargeeMs, echec: c.echec,
    gels: { n: c.gelsN, ms: Math.round(c.gelsMs), maplibreMs: Math.round(c.maplibreMs),
      battementMs: Math.round(c.battementMs) } };
}

/** Ce que le navigateur offre pour dire les gels : sans rien, seul le battement les voit. */
let API_GELS = "aucune";

function ecouteNavigateur(){
  // après le premier départ, une image plus grande dit seulement qu'on est revenu
  observe("largest-contentful-paint", sur((/** @type {any} */ e) => { if (e.startTime < premierDepart) J.lcp = Math.round(e.startTime); }));
  /* Un type d'entrée inconnu ne lève pas : le navigateur l'ignore, et
     `observe` se croyait inscrit — Safari passait pour un navigateur qui dit
     ses longues images, et le repli sur `longtask` ne se tentait jamais. Ce
     qu'il connaît, il le dit dans `supportedEntryTypes`. */
  const connus = (typeof PerformanceObserver === "function" && PerformanceObserver.supportedEntryTypes) || [];
  API_GELS = connus.includes("long-animation-frame") ? "loaf" : connus.includes("longtask") ? "longtask" : "aucune";
  if (API_GELS === "loaf") observe("long-animation-frame", sur((/** @type {any} */ e) => gel(e.duration, e.scripts, e.startTime, e)));
  else if (API_GELS === "longtask") observe("longtask", sur((/** @type {any} */ e) => gel(e.duration, null, e.startTime)));
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
    const a = /** @type {any} */ (appareil({ agentComplet: false, carte: false }));
    delete a.fenetre; delete a.carte;
    /* Un navigateur piloté — nos essais, un robot d'aperçu, une surveillance —
       ne dit rien du visiteur : le relevé part quand même (les essais le
       lisent), marqué, et la fiche l'écarte. Ceux du 1er novembre 2026, sans
       écran ni carte graphique, tiraient à eux seuls la médiane de
       l'ouverture sur poste fixe à 11 s. */
    if (navigator.webdriver || /Headless/.test(navigator.userAgent)) a.robot = true;
    APPAREIL = a;
  }
  if (!carteLue){
    const gl = contexteDuPlan();
    if (gl || creux){
      carteLue = true;
      APPAREIL.carte = carteGraphique(gl) || undefined;
      // sans carte graphique, le navigateur dessine au processeur : une autre classe de machine
      if (APPAREIL.carte && /SwiftShader|llvmpipe|Software/i.test(APPAREIL.carte.puce || "")) APPAREIL.carte.logiciel = true;
      if (APPAREIL.carte && APPAREIL.carte.webgl2) APPAREIL.carte.handicap = handicapDeclare();
      // la puce du dessin, quand le plan est resté au SVG faute de carte graphique
      if (APPAREIL.carte && GL.repli) APPAREIL.carte.repli = GL.repli;
      // le lissage au sous-pixel des petits textes, que seul le dessin connaît
      if (APPAREIL.carte && GL.actif) APPAREIL.carte.sousPixel = sousPixelOffert();
    }
  }
  return APPAREIL;
}

/**
 * Le navigateur refuserait-il le WebGL à qui ne le veut pas au prix d'un gros
 * handicap — imité par le processeur, ou une carte graphique qu'il écarte ?
 * La même lecture que celle qui renvoie ces postes au SVG (`webgl.mjs`
 * `carteDuWebgl`), faite une fois pour les deux. Rien quand on ne sait pas.
 */
function handicapDeclare(){
  const c = carteDuWebgl();
  return c ? c.handicap : undefined;
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

/**
 * Les appels à nos services qui ont répondu en erreur, par statut.
 *
 * Le navigateur garde le statut de chaque ressource (`responseStatus`) ; le
 * lire ne coûte rien et ne demande aucune écoute de `fetch`. Il manque là où
 * le navigateur ne le donne pas (Safari) : rien n'y est alors compté, plutôt
 * qu'un faux zéro. Une demande sans réponse du tout n'y figure pas — c'est
 * `PLAN_EN_PANNE` qui la dit, pour celle qui compte.
 */
function appelsEnEchec(){
  if (!API) return undefined;
  const base = new URL(API.replace(/[^/]*$/, ""), location.href).href;
  /** @type {Record<string, number>} */
  const statuts = {};
  let echecs = 0;
  for (const e of performance.getEntriesByType("resource")){
    const st = /** @type {any} */ (e).responseStatus;
    if (!(st >= 400) || !e.name.startsWith(base)) continue;
    echecs++;
    if (Object.keys(statuts).length < 4 || statuts[st]) statuts[st] = (statuts[st] || 0) + 1;
  }
  return echecs ? { echecs, statuts } : undefined;
}

/** Le bilan de l'ouverture, figé dès que le plan est affiché : ce que la
 *  visite charge ensuite (vignettes, fonds) n'est plus l'ouverture, et le
 *  rapport le dit « téléchargé à l'ouverture du plan ». Tant que rien n'est
 *  affiché (panne), il se refait à chaque envoi : c'est là qu'il a le plus à dire. */
/** @type {any} */
let OUVERTURE = null;

function leChargement(){
  // le LCP, lui, peut encore se préciser jusqu'au premier geste : il reste vivant
  if (OUVERTURE){ OUVERTURE.jalons.lcp = lcpVu(); return OUVERTURE; }
  const affiche = J["plan-affiche"];
  const jusqua = affiche === undefined ? Infinity : affiche;
  const c = chargement(5, jusqua);
  const bilan = {
    jalons: { reponse: c.page ? c.page.reponse : undefined, domPret: c.page ? c.page.domPret : undefined,
      "plan-demarre": J["plan-demarre"], donnees: finDesDonnees(jusqua), toile: J.toile,
      "plan-affiche": affiche, lcp: lcpVu() },
    // ce que le service de second plan a servi sans dire d'où n'est ni dans l'un ni dans l'autre
    transfertKo: c.transfertKo, depuisCache: c.depuisCache, inconnus: c.inconnus || undefined,
    parLeService: c.page && c.page.parLeService,
    lourds: c.ressources.map(({ fichier, sorte, ms, transfertKo, tailleKo }) => ({ fichier, sorte, ms, transfertKo, tailleKo })),
    cacheeAvant: cacheeAvant || undefined,
    // le cadre intégré sorti de l'écran avant de paraître, et le temps passé invisible, caché ou hors de l'écran
    horsVueAvant: horsVueAvant || undefined,
    invisibleAvantMs: invisibleAvantAffichage(),
    panne: panne || undefined,
    images: imagesOuverture.length ? imagesOuverture.slice() : undefined,
    /* La chauffe des programmes (`webgl.mjs`, « La chauffe ») : sa durée et
       les programmes lancés d'un coup. Absente, elle n'a pas eu lieu — le
       navigateur ne compile pas en tâche de fond, ou le plan est au SVG. */
    chauffe: GL.bilanChauffe ? GL.bilanChauffe.slice() : undefined,
  };
  if (affiche !== undefined) OUVERTURE = bilan;
  return bilan;
}

function fluidite(/** @type {any} */ v){
  const n = v.tranches.reduce((/** @type {number} */ a, /** @type {number} */ b) => a + b, 0);
  const lentes = v.tranches.slice(LENTE).reduce((/** @type {number} */ a, /** @type {number} */ b) => a + b, 0);
  return { gestes: v.gestes, tranches: v.tranches.slice(), saccades: v.saccades,
    partPlus33: n ? ms(100 * lentes / n) : null,
    // [images au repos, dont lentes] — rien en SVG, ni sans geste
    auRepos: v.repos ? [v.repos, v.lentesRepos] : undefined };
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
    raisonsPertes: V.raisons.length ? V.raisons.slice() : undefined,
    // voulu en WebGL, le plan est en SVG : faute de contexte, de bibliothèque, ou après une perte —
    // non le repli voulu des postes sans carte graphique, que dit `carte.repli`
    basculeSvg: RENDU_WEBGL && estAffiche() && !GL.actif && !GL.repli,
  };
}

/** Le résumé courant de la visite, au format `sonde-plan/1`. */
export function resumeSonde(){
  if (!V) return null;
  memoire();
  const g = V.gels;
  /** @type {any} */
  const r = {
    format: "sonde-plan/1", rev: REVISION, page: PAGE, support: SUPPORT,
    debut: new Date(V.debut).toISOString(), duree: Math.round(performance.now() - V.t0),
    // la durée, page cachée et cadre hors de l'écran retirés : une visite oubliée dans un onglet en dure cinq heures
    visibleMs: Math.round(V.visibleMs + (vu ? performance.now() - Math.max(vuDepuis, V.t0) : 0)),
    chargement: V.chargee ? leChargement() : undefined,
    fluidite: { classique: fluidite(V.vues.classique), immersif: fluidite(V.vues.immersif),
      horsPlan: V.horsPlan.gestes ? fluidite(V.horsPlan) : undefined },
    gels: { n: g.n, totalMs: Math.round(g.totalMs), maxMs: Math.round(g.maxMs),
      pires: g.pires.map((/** @type {any} */ p) => ({ ms: p.ms, geste: p.geste,
        fichier: p.url ? nomDuScript(p.url) : undefined, fonction: p.fonction,
        position: p.url && p.position >= 0 ? p.position : undefined,
        t: p.t, avantAffichage: p.avantAffichage, travaux: p.travaux, invocation: p.invocation,
        scriptsMs: p.scriptsMs, forceeMs: p.forceeMs, renduMs: p.renduMs, miseEnPageMs: p.miseEnPageMs })),
      api: API_GELS, battement: leBattement() },
    reactivite: { ...V.reactivite, survols: { ...V.reactivite.survols } },
    erreurs: bilanErreurs(),
    api: appelsEnEchec(),
    gpu: laCarte(),
    environs: laCarteDesEnvirons(),
    memoire: { picMo: V.picMo || undefined },
    appareil: lisAppareil(),
    plan: { emplacements: TOUS.length, noeudsDom: document.getElementsByTagName("*").length,
      immersifUtilise: V.immersif || GL.camera },
  };
  return tronque(r);
}

function leBattement(){
  const b = V.battement;
  return { n: b.n, totalMs: Math.round(b.totalMs), maxMs: Math.round(b.maxMs),
    avantAffichage: b.avantAffichage, pendantGeste: b.pendantGeste, couvertMs: Math.round(b.couvertMs) };
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
  // le moment et les travaux pèsent peu, et disent la cause mieux que le script
  r.gels.pires = r.gels.pires.map((/** @type {any} */ p) => ({ ms: p.ms, geste: p.geste,
    t: p.t, avantAffichage: p.avantAffichage, travaux: p.travaux, invocation: p.invocation }));
  const lourds = r.chargement && r.chargement.lourds;
  while (lourds && lourds.length && octets(r) > PLAFOND) lourds.pop();
  if (octets(r) > PLAFOND) coupe(r, 60);
  for (const [groupe, champ] of [["gpu", "logos"], ["gels", "pires"], ["erreurs", "premieres"], ["appareil", "carte"], ["appareil", ""]]){
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
  ecouteBattement();
  REPEINT_FINI.ecoute(sur((/** @type {number} */ duree) => {
    V.nRepeints++;
    V.maxRepeint = Math.max(V.maxRepeint, duree);
    echantillonne(V.repeints, V.nRepeints, duree);
  }));
  CARTE_ENVIRONS.ecoute(sur(etapeDeLaCarte));
  IMAGE_DECK.ecoute(sur(releveInstant));
  IMAGE_DECK.ecoute(sur(imageDOuverture));
  TOILE_PRETE.ecoute(sur(guetteCompilation));
  COMPTES_DECK.ecoute(sur((/** @type {any} */ m) => {
    if (!GL.deck || !m) return;
    const c = cumulDeck(GL.deck);
    c.attrMs += Number(m.updateAttributesTime) || 0;
    c.couches += Number(m.updateLayersCount) || 0;
  }));
  CONTEXTE_PERDU.ecoute(sur((/** @type {string} */ raison) => {
    V.pertes++;
    if (V.raisons.length >= PERTES_DITES) return;
    V.raisons.push({ raison: String(raison).slice(0, 40), s: Math.round((performance.now() - V.t0) / 1000),
      cachee: document.hidden || undefined });
  }));
  PLAN_DEMARRE.ecoute(sur(() => { J["plan-demarre"] = Math.round(performance.now()); }));
  // le plan ne paraîtra pas : inutile d'attendre `SANS_AFFICHAGE` pour le dire
  PLAN_EN_PANNE.ecoute(sur((/** @type {{ sorte: string, statut?: number }} */ p) => {
    panne = { sorte: p.sorte, statut: p.statut || undefined };
    envoie();
  }));
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
    if (!estAffiche()) cacheeAvant = true;
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
    get battements(){ return battements; },
    get visite(){ return V.id; },
    // les comptes cumulés de deck.gl et de luma.gl, tels que le prochain gel les lirait
    get travaux(){ return travauxDeck(); } };
}
