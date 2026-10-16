/* ============================================================
   Le relevé des performances — `?perf`

   Un plan qui saccade sur le téléphone d'un visiteur ne se voit pas depuis
   un ordinateur : le profileur du navigateur demande un câble et un poste,
   et la machine de développement dessine dix fois plus vite. Ce module
   mesure la page là où elle tourne, et rend ce qu'il a vu dans un fichier
   que le téléphone partage comme une photo.

   Il ne fait rien sans `?perf` dans l'adresse : ni boucle d'images, ni
   écoute, ni pastille. Avec, il note
     — chaque geste (appui, glisser, pincer, molette) et l'intervalle entre
       les images qu'il a produites : c'est la fluidité que la main sent ;
     — chaque repeint WebGL et sa durée (`webgl.mjs` `REPEINT_FINI`) ;
     — les images longues que le navigateur attribue à un script (« long
       animation frames », Chrome) ou, à défaut, les longues tâches ;
     — les événements lents à répondre (Event Timing) ;
     — le démarrage, les ressources lourdes, la mémoire, l'appareil ;
     — ce que la planche des logos a créé et envoyé, et ce que cela vaut par
       logo affiché (`logos-stands.mjs` `bilanLogos`) ;
     — la fluidité que l'œil voit : à chaque image que la bibliothèque
       dessine, où est la vue, combien de positions du doigt sont arrivées
       depuis la précédente, et depuis combien de temps — d'où les à-coups
       du pas, les images figées en plein geste, le retard sur le doigt ;
     — chaque programme que la carte graphique compile, et le temps que la
       page l'a attendu, et chaque dessin jeté — contexte perdu, ou boucle
       tenue pour arrêtée (`webgl.mjs` `DESSIN_JETE`) : sur un téléphone, une
       compilation pendant un geste fige l'écran, et un dessin jeté se
       remonte en recompilant tout.

   Rien ne part au serveur : le relevé reste dans la page jusqu'à ce qu'on
   touche « Partager », et part alors par le menu de partage du téléphone.
   Il ne dit rien de plus que ce que l'on y a fait soi-même. Chaque liste est
   bornée : une heure de relevé ne doit pas peser sur ce qu'il mesure.

   La boucle d'images qui compte coûte elle-même un rappel par image : le
   relevé est un instrument, pas un mode à laisser aux visiteurs.
   ============================================================ */
import { SLUG, PLAN_ADMIN } from "./salon.mjs";
import { GL, RENDU_WEBGL, REPEINT_FINI, DESSIN_JETE } from "./webgl.mjs";
import { quandAffiche } from "./affichage.mjs";
import { PLAN_DEMARRE } from "./demarrage.mjs";
import { TOUS } from "./donnees.mjs";
import { bilanLogos } from "./logos-stands.mjs";
import { vue, cadrePlan } from "./vue-etat.mjs";

export const RELEVE_ACTIF = /[?&]perf(?:[=&]|$)/.test(location.search);
const ACTIF = RELEVE_ACTIF;

// au-delà, une liste garde ses premières entrées et compte celles qu'elle perd
const BORNES = { gestes: 400, saccades: 800, repeints: 1500, images: 300, evenements: 400,
  memoire: 720, deck: 720, erreurs: 50, programmes: 200, contextes: 50, trace: 9000 };
// une image plus longue que ceci est une saccade que l'œil voit
const SACCADE = 50;
// un geste dure tant qu'une entrée arrive à moins de ceci de la précédente
const FIN_GESTE = 300;
const TRANCHES = [17, 25, 33, 50, 100, 250, Infinity];

/** @typedef {{ t: number, fin: number, type: string, doigts: number, chemin: number,
 *    cible: string, images: number[], repeints: number, msRepeints: number,
 *    dernier: number, image: number }} Geste */

const R = {
  ouvert: Date.now(),
  /** @type {Record<string, number>} */
  jalons: {},
  /** @type {any[]} */ gestes: [],
  /** @type {any[]} */ saccades: [],
  /** @type {any[]} */ repeints: [],
  /** @type {any[]} */ images: [],
  /** @type {any[]} */ evenements: [],
  /** @type {any[]} */ memoire: [],
  /** @type {any[]} */ deck: [],
  /** @type {any[]} */ erreurs: [],
  /** @type {any[]} */ programmes: [],
  /** @type {any[]} */ contextes: [],
  /** chaque image dessinée pendant un mouvement @type {any[]} */ trace: [],
  /** @type {Record<string, number>} */
  perdus: {},
  /** ce que d'autres modules joignent au relevé (`banc.mjs`) @type {Record<string, any>} */
  annexes: {},
  histo: { geste: TRANCHES.map(() => 0), repos: TRANCHES.map(() => 0) },
};

const ms = (/** @type {number} */ x) => Math.round(x * 10) / 10;

function garde(/** @type {keyof typeof BORNES} */ liste, /** @type {any} */ o){
  const l = R[liste];
  if (l.length < BORNES[liste]) l.push(o);
  else R.perdus[liste] = (R.perdus[liste] || 0) + 1;
}

/** Ce qu'un geste a visé, sans rien de ce qu'il contenait : un identifiant,
 *  ou la balise et sa première classe. */
function decrit(/** @type {EventTarget | null | undefined} */ c){
  const n = c instanceof Element ? c : null;
  if (!n) return "";
  const avecId = n.closest("[id]");
  const balise = n.tagName.toLowerCase();
  const classe = typeof n.className === "string" && n.className ? "." + n.className.split(/\s+/)[0] : "";
  return balise + classe + (avecId ? " @" + avecId.id : "");
}

/* ------------------------------------------------------------
   Les gestes
   ------------------------------------------------------------ */
/** @type {Geste | null} */
let geste = null;
let numeroGeste = 0;
const doigts = new Map();

function dansLeReleve(/** @type {Event} */ e){
  return e.target instanceof Element && !!e.target.closest("#releve-perf");
}

function commence(/** @type {string} */ type, /** @type {Event} */ e){
  const t = performance.now();
  if (geste && t - geste.dernier < FIN_GESTE && geste.type === type){
    geste.dernier = t; return geste;
  }
  if (geste) clos();
  numeroGeste++;
  geste = { t, fin: 0, type, doigts: 0, chemin: 0, cible: decrit(e.target), images: [],
    repeints: 0, msRepeints: 0, dernier: t, image: t };
  return geste;
}

function centile(/** @type {number[]} */ tri, /** @type {number} */ p){
  return tri.length ? tri[Math.min(tri.length - 1, Math.floor(tri.length * p))] : 0;
}

/** La sorte du geste, telle qu'on la sait à ce moment : un appui devient
 *  glisser ou pincer en chemin. */
function sorte(/** @type {Geste} */ g){
  return g.type !== "appui" ? g.type : g.doigts > 1 ? "pincer" : g.chemin > 10 ? "glisser" : "appui";
}

function clos(){
  const g = geste;
  geste = null;
  if (!g) return;
  const tri = [...g.images].sort((a, b) => a - b);
  // jusqu'à la dernière image de son élan, pas seulement jusqu'au doigt levé
  const duree = Math.max(g.fin || g.dernier, g.image) - g.t;
  const type = sorte(g);
  garde("gestes", {
    t: Math.round(g.t), type, cible: g.cible, ms: Math.round(duree),
    doigts: g.doigts || undefined, chemin: g.chemin ? Math.round(g.chemin) : undefined,
    images: tri.length,
    ips: duree > 0 && tri.length ? Math.round(tri.length * 1000 / Math.max(duree, tri.reduce((a, b) => a + b, 0))) : 0,
    p50: ms(centile(tri, .5)), p95: ms(centile(tri, .95)), max: ms(tri[tri.length - 1] || 0),
    plus33: tri.filter(x => x > 33).length, plus50: tri.filter(x => x > SACCADE).length,
    repeints: g.repeints, msRepeints: ms(g.msRepeints),
  });
}

function ecouteGestes(){
  const o = { capture: true, passive: true };
  addEventListener("pointerdown", e => {
    if (dansLeReleve(e)) return;
    doigts.set(e.pointerId, [e.clientX, e.clientY]);
    const g = geste && geste.type === "appui" && doigts.size > 1 ? geste : commence("appui", e);
    g.doigts = Math.max(g.doigts, doigts.size);
    g.fin = 0;
  }, o);
  addEventListener("pointermove", e => {
    if (doigts.has(e.pointerId)){ positionsDepuis++; derniere = performance.now(); }
    const avant = doigts.get(e.pointerId);
    if (!avant || !geste) return;
    geste.chemin += Math.hypot(e.clientX - avant[0], e.clientY - avant[1]);
    doigts.set(e.pointerId, [e.clientX, e.clientY]);
    geste.dernier = performance.now();
  }, o);
  const leve = (/** @type {PointerEvent} */ e) => {
    if (!doigts.delete(e.pointerId) || !geste) return;
    geste.dernier = performance.now();
    if (!doigts.size) geste.fin = geste.dernier;
  };
  addEventListener("pointerup", leve, o);
  addEventListener("pointercancel", leve, o);
  addEventListener("wheel", e => { if (!dansLeReleve(e)) commence("molette", e); }, o);
  addEventListener("keydown", e => { if (!dansLeReleve(e)) commence("clavier", e); }, o);
}

/* ------------------------------------------------------------
   Les images : une boucle qui ne fait que compter
   ------------------------------------------------------------ */
let precedente = 0, imagesSeconde = 0, debutSeconde = 0, ips = 0;

function image(/** @type {number} */ ts){
  requestAnimationFrame(image);
  guetteDessins();
  if (document.hidden){ precedente = 0; return; }
  /* L'heure de l'image sert à l'écart entre deux images, le plus juste ; tout
     le reste se date à `performance.now()`, comme les gestes — certains
     navigateurs ne tiennent pas les deux horloges ensemble. */
  const t = performance.now();
  if (precedente){
    const dt = ts - precedente;
    // un retour d'arrière-plan n'est pas une saccade
    if (dt < 2000){
      const enGeste = !!geste && (doigts.size > 0 || t - geste.dernier < FIN_GESTE);
      const histo = enGeste ? R.histo.geste : R.histo.repos;
      histo[TRANCHES.findIndex(b => dt <= b)]++;
      if (enGeste && geste){ geste.images.push(dt); geste.image = t; }
      if (dt > SACCADE) garde("saccades", { t: Math.round(t), ms: ms(dt), geste: enGeste && geste ? sorte(geste) : undefined });
    }
  }
  precedente = ts;
  // le geste fini, et les images de son élan comptées avec lui
  if (geste && !doigts.size && t - geste.dernier >= FIN_GESTE) clos();
  imagesSeconde++;
  if (t - debutSeconde >= 1000){
    ips = Math.round(imagesSeconde * 1000 / (t - debutSeconde));
    imagesSeconde = 0; debutSeconde = t;
    affiche();
  }
}

/* ------------------------------------------------------------
   Ce que le navigateur sait dire de lui-même
   ------------------------------------------------------------ */
function observe(/** @type {string} */ type, /** @type {(e: any) => void} */ f, /** @type {any} */ plus = {}){
  try {
    const po = new PerformanceObserver(l => l.getEntries().forEach(f));
    po.observe({ type, buffered: true, ...plus });
    return true;
  } catch (e) { return false; }
}

const fichier = (/** @type {string} */ u) => { try { return new URL(u).pathname.split("/").pop() || u; } catch (e) { return u; } };

function ecouteNavigateur(){
  observe("paint", e => { R.jalons[e.name] = Math.round(e.startTime); });
  observe("largest-contentful-paint", e => { R.jalons["largest-contentful-paint"] = Math.round(e.startTime); });
  /* Une image longue, et les scripts qui l'ont tenue : la position dans le
     fichier minifié se rapporte au module par la carte de correspondance. */
  const loaf = observe("long-animation-frame", e => garde("images", {
    t: Math.round(e.startTime), ms: Math.round(e.duration), bloquant: Math.round(e.blockingDuration || 0),
    rendu: e.renderStart ? Math.round(e.startTime + e.duration - e.renderStart) : undefined,
    style: e.styleAndLayoutStart ? Math.round(e.startTime + e.duration - e.styleAndLayoutStart) : undefined,
    geste: geste ? sorte(geste) : undefined,
    scripts: (e.scripts || []).filter((/** @type {any} */ s) => s.duration >= 5).slice(0, 8).map((/** @type {any} */ s) => ({
      ms: Math.round(s.duration), appel: s.invoker, sorte: s.invokerType,
      fichier: fichier(s.sourceURL || ""), fonction: s.sourceFunctionName || undefined,
      position: s.sourceCharPosition >= 0 ? s.sourceCharPosition : undefined,
      miseEnPage: s.forcedStyleAndLayoutDuration ? Math.round(s.forcedStyleAndLayoutDuration) : undefined,
    })),
  }));
  if (!loaf) observe("longtask", e => garde("images", { t: Math.round(e.startTime), ms: Math.round(e.duration),
    longueTache: true, geste: geste ? sorte(geste) : undefined }));
  observe("event", e => garde("evenements", {
    t: Math.round(e.startTime), type: e.name, ms: Math.round(e.duration),
    attente: Math.round(e.processingStart - e.startTime),
    traitement: Math.round(e.processingEnd - e.processingStart),
    cible: decrit(e.target),
  // sous cinquante millisecondes, la liste se remplissait en une minute de choses que la main ne sent pas
  }), { durationThreshold: 50 });
  addEventListener("error", e => garde("erreurs", { t: Math.round(performance.now()), message: String(e.message).slice(0, 200),
    fichier: fichier(e.filename || ""), ligne: e.lineno, colonne: e.colno }));
  addEventListener("unhandledrejection", e => garde("erreurs", { t: Math.round(performance.now()),
    message: String(e.reason && e.reason.message || e.reason).slice(0, 200) }));
}

/* ------------------------------------------------------------
   La carte graphique : ce qu'elle compile, et le dessin perdu
   ------------------------------------------------------------ */
/* deck.gl compile un programme la première fois qu'une sorte de couche se
   dessine, et l'attend en lisant son état (`LINK_STATUS`) : c'est cette
   lecture qui bloque la page, non l'appel qui lance la compilation. Le nom
   vient du `SHADER_NAME` que deck.gl écrit dans chaque source. La toile
   n'existe pas encore quand ce module se charge : on guette le prototype. */
const LINK_STATUS = 0x8B82;
function guetteProgrammes(){
  const noms = new WeakMap(), progs = new WeakMap();
  for (const C of [globalThis.WebGL2RenderingContext, globalThis.WebGLRenderingContext]){
    if (!C) continue;
    const P = /** @type {any} */ (C.prototype);
    const source = P.shaderSource, attache = P.attachShader, lie = P.linkProgram, lit = P.getProgramParameter;
    P.shaderSource = function(/** @type {any} */ sh, /** @type {string} */ src){
      const m = /SHADER_NAME\s+(\S+)/.exec(src || "");
      noms.set(sh, m ? m[1].replace(/-(vertex|fragment)-shader$/, "") : "?");
      return source.call(this, sh, src);
    };
    P.attachShader = function(/** @type {any} */ pr, /** @type {any} */ sh){
      if (noms.has(sh) && !progs.has(pr)) progs.set(pr, { nom: noms.get(sh) });
      return attache.call(this, pr, sh);
    };
    P.linkProgram = function(/** @type {any} */ pr){
      const t = performance.now();
      const r = lie.call(this, pr);
      const o = { t: Math.round(t), nom: (progs.get(pr) || {}).nom || "?", ms: ms(performance.now() - t),
        attente: 0, apresAffichage: !!R.jalons["plan-affiche"], geste: geste ? sorte(geste) : undefined };
      progs.set(pr, o);
      garde("programmes", o);
      return r;
    };
    P.getProgramParameter = function(/** @type {any} */ pr, /** @type {number} */ p){
      if (p !== LINK_STATUS) return lit.call(this, pr, p);
      const t = performance.now();
      const r = lit.call(this, pr, p);
      const o = progs.get(pr);
      if (o && "attente" in o) o.attente = ms(o.attente + performance.now() - t);
      return r;
    };
  }
  /* La perte et le retour ne remontent pas : on les prend au passage, avant
     la toile. */
  for (const type of ["webglcontextlost", "webglcontextrestored", "webglcontextcreationerror"])
    document.addEventListener(type, () => garde("contextes", { t: Math.round(performance.now()),
      type: type.slice(14), geste: geste ? sorte(geste) : undefined }), { capture: true });
}

/** Ce que la carte graphique a compilé et perdu jusqu'ici : le banc
 *  d'essai le lit avant et après chaque phase. */
export function comptesGpu(){
  return { programmes: R.programmes.length,
    msProgrammes: R.programmes.reduce((a, p) => a + p.ms + p.attente, 0),
    pertes: R.contextes.filter(c => c.type === "jete").length };
}

/** Les programmes compilés à partir du `n`-ième : leur nom, ce qu'ils ont
 *  coûté, et s'ils l'ont été après l'affichage du plan. */
export function programmesDepuis(/** @type {number} */ n){
  return R.programmes.slice(n).map(p => ({ nom: p.nom, ms: Math.round(p.ms + p.attente), apresAffichage: p.apresAffichage }));
}

/** Joindre au relevé partagé, sous `cle`, ce qu'un autre module a mesuré. */
export function joinsAuReleve(/** @type {string} */ cle, /** @type {any} */ v){ R.annexes[cle] = v; }

/* ------------------------------------------------------------
   La fluidité, image par image

   Les images par seconde ne disent pas si le mouvement est égal : à soixante
   images, un plan qui avance de dix pixels, puis de vingt, puis de zéro, se
   voit saccader. On note donc, à chaque image que la bibliothèque dessine,
   la vue qu'elle montre, et ce que le doigt a envoyé depuis la précédente.
   Le banc d'essai étiquette ses phases (`marqueReleve`) ; le doigt, ses
   gestes. Chaque morceau se résume en quatre nombres que l'on compare.
   ------------------------------------------------------------ */
/** @type {string | null} */
let etiquette = null;
/** Le banc d'essai nomme ce qu'il joue : ses images se rangent sous ce nom. */
export function marqueReleve(/** @type {string | null} */ nom){ etiquette = nom; }
let positionsDepuis = 0, derniere = 0;

function guetteDessins(){
  const d = /** @type {any} */ (GL.deck);
  if (!d || d.__releveTrace) return;
  d.__releveTrace = true;
  const avant = d.props.onAfterRender;
  d.setProps({ onAfterRender: (/** @type {any[]} */ ...a) => { if (avant) avant(...a); traceImage(); } });
}

function traceImage(){
  const enGeste = !!geste && (doigts.size > 0 || performance.now() - geste.dernier < FIN_GESTE);
  const tag = etiquette || (enGeste && geste ? "doigt " + numeroGeste + " " + sorte(geste) : null);
  if (!tag){ positionsDepuis = 0; return; }
  const v = vue(), r = cadrePlan(), t = performance.now();
  garde("trace", { t: ms(t), tag, x: v.x + v.w / 2, y: v.y + v.h / 2, w: v.w, W: r.width || 1,
    positions: positionsDepuis, retard: derniere ? ms(t - derniere) : null });
  positionsDepuis = 0;
}

/** Les quatre nombres d'un morceau : le pas de l'image à l'image, en pixels
 *  d'écran (le zoom compté au bord de l'écran), et sa régularité. */
function fluidite(/** @type {any[]} */ l){
  const pas = [], dts = [];
  for (let i = 1; i < l.length; i++){
    const a = l[i - 1], b = l[i], k = b.W / b.w;
    const d = Math.hypot((b.x - a.x) * k, (b.y - a.y) * k) + Math.abs(Math.log(b.w / a.w)) * b.W / 2;
    pas.push(d); dts.push(b.t - a.t);
  }
  const bouge = pas.filter(d => d > .3);
  if (bouge.length < 5) return null;
  const tri = [...dts].sort((a, b) => a - b), med = centile(tri, .5);
  const vit = pas.map((d, i) => d / Math.max(1, dts[i]));
  /* l'à-coup : l'écart de chaque vitesse à la moyenne de ses deux voisines,
     rapporté à la vitesse moyenne — nul pour un mouvement égal ou qui
     accélère doucement, fort pour un pas qui hésite */
  const moy = vit.reduce((a, b) => a + b, 0) / vit.length;
  const ecarts = [];
  for (let i = 1; i < vit.length - 1; i++) ecarts.push(Math.abs(vit[i] - (vit[i - 1] + vit[i + 1]) / 2));
  const ec = [...ecarts].sort((a, b) => a - b);
  // une image qui ne bouge pas entre deux qui bougent : le plan a calé
  let figees = 0;
  for (let i = 1; i < pas.length - 1; i++) if (pas[i] <= .3 && pas[i - 1] > .3 && pas[i + 1] > .3) figees++;
  const pos = l.map(e => e.positions), ret = l.map(e => e.retard).filter(x => x != null).sort((a, b) => a - b);
  return {
    images: l.length, ms: Math.round(l[l.length - 1].t - l[0].t),
    ecartMs: { p50: ms(med), p95: ms(centile(tri, .95)), reguliers: Math.round(100 * dts.filter(x => Math.abs(x - med) <= 3).length / dts.length) },
    pasPx: { p50: ms(centile([...bouge].sort((a, b) => a - b), .5)), max: ms(Math.max(...bouge)) },
    acoups: moy ? Math.round(100 * centile(ec, .5) / moy) : 0,
    acoupsP90: moy ? Math.round(100 * centile(ec, .9) / moy) : 0,
    figees,
    positionsParImage: pos.some(x => x) ? Object.fromEntries([0, 1, 2, 3].map(n => [n === 3 ? "3+" : String(n),
      pos.filter(x => n === 3 ? x >= 3 : x === n).length])) : undefined,
    retardMs: ret.length ? { p50: ms(centile(ret, .5)), p95: ms(centile(ret, .95)) } : undefined,
  };
}

/** Chaque morceau étiqueté, résumé. */
export function bilanFluidite(){
  /** @type {Map<string, any[]>} */
  const parTag = new Map();
  for (const e of R.trace){ const l = parTag.get(e.tag); if (l) l.push(e); else parTag.set(e.tag, [e]); }
  return [...parTag].map(([tag, l]) => ({ tag, ...fluidite(l) })).filter(x => x.images);
}

function echantillonne(){
  const t = Math.round(performance.now());
  const m = /** @type {any} */ (performance).memory;
  if (m) garde("memoire", { t, utiliseMo: Math.round(m.usedJSHeapSize / 1048576),
    totalMo: Math.round(m.totalJSHeapSize / 1048576), limiteMo: Math.round(m.jsHeapSizeLimit / 1048576) });
  const d = GL.deck && /** @type {any} */ (GL.deck).metrics;
  if (d){
    /** @type {Record<string, number>} */
    const o = { t };
    let rien = true;
    for (const [k, v] of Object.entries(d)) if (typeof v === "number"){ o[k] = ms(v); if (v) rien = false; }
    // deck.gl ne refait ses comptes que toutes les soixante images dessinées
    if (!rien) garde("deck", o);
  }
}

/* ------------------------------------------------------------
   Le relevé, mis en forme
   ------------------------------------------------------------ */
export function carteGraphique(){
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    if (!gl) return null;
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const r = {
      webgl2: typeof WebGL2RenderingContext !== "undefined" && gl instanceof WebGL2RenderingContext,
      fabricant: ext ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR),
      puce: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
      textureMax: gl.getParameter(gl.MAX_TEXTURE_SIZE),
    };
    const perte = gl.getExtension("WEBGL_lose_context");
    if (perte) perte.loseContext();
    return r;
  } catch (e) { return null; }
}

function appareil(){
  const n = /** @type {any} */ (navigator);
  return {
    agent: navigator.userAgent,
    plateforme: n.userAgentData ? { mobile: n.userAgentData.mobile, systeme: n.userAgentData.platform } : undefined,
    densite: devicePixelRatio,
    ecran: [screen.width, screen.height],
    fenetre: [innerWidth, innerHeight],
    coeurs: navigator.hardwareConcurrency,
    memoireGo: n.deviceMemory,
    reseau: n.connection ? { type: n.connection.effectiveType, debitMbps: n.connection.downlink, rttMs: n.connection.rtt,
      economie: n.connection.saveData } : undefined,
    carte: carteGraphique(),
    mouvementReduit: matchMedia("(prefers-reduced-motion: reduce)").matches,
  };
}

function chargement(){
  const nav = /** @type {any} */ (performance.getEntriesByType("navigation")[0]);
  const lourdes = performance.getEntriesByType("resource")
    .map(e => /** @type {any} */ (e))
    .filter(e => e.duration > 150 || e.transferSize > 50000 || e.decodedBodySize > 200000)
    .sort((a, b) => b.duration - a.duration).slice(0, 40)
    .map(e => ({ fichier: fichier(e.name), sorte: e.initiatorType, debut: Math.round(e.startTime),
      ms: Math.round(e.duration), transfertKo: Math.round((e.transferSize || 0) / 1024),
      tailleKo: Math.round((e.decodedBodySize || 0) / 1024) }));
  return {
    page: nav ? { reponse: Math.round(nav.responseEnd), domPret: Math.round(nav.domContentLoadedEventEnd),
      charge: Math.round(nav.loadEventEnd), transfertKo: Math.round((nav.transferSize || 0) / 1024),
      type: nav.type } : null,
    ressources: lourdes,
  };
}

function synthese(){
  const resume = (/** @type {number[]} */ h) => {
    const n = h.reduce((a, b) => a + b, 0);
    return { images: n, tranchesMs: Object.fromEntries(TRANCHES.map((b, i) => [b === Infinity ? ">250" : "<=" + b, h[i]])),
      partPlus33: n ? ms(100 * (h[4] + h[5] + h[6]) / n) : 0 };
  };
  const reps = R.repeints.map(r => r.ms).sort((a, b) => a - b);
  const apres = R.programmes.filter(p => p.apresAffichage);
  return {
    programmes: { n: R.programmes.length, apresAffichage: apres.length,
      msAttente: ms(R.programmes.reduce((a, p) => a + p.ms + p.attente, 0)),
      msAttenteApresAffichage: ms(apres.reduce((a, p) => a + p.ms + p.attente, 0)) },
    dessinsJetes: R.contextes.filter(c => c.type === "jete").length,
    enGeste: resume(R.histo.geste), auRepos: resume(R.histo.repos),
    repeints: { n: reps.length, p50: ms(centile(reps, .5)), p95: ms(centile(reps, .95)), max: reps[reps.length - 1] || 0 },
    saccades: R.saccades.length + (R.perdus.saccades || 0),
    fluidite: bilanFluidite(),
  };
}

function releve(){
  if (geste) clos();
  echantillonne();
  const versions = [...document.scripts].map(s => s.src).filter(s => /\/versions\//.test(s)).map(fichier);
  return {
    format: "releve-plan/1",
    salon: SLUG || null, administration: PLAN_ADMIN, adresse: location.pathname + location.search,
    ouvert: new Date(R.ouvert).toISOString(), duree: Math.round(performance.now()),
    versions,
    rendu: { webglVoulu: RENDU_WEBGL, webglActif: GL.actif, immersif: GL.camera, blocs: GL.blocs.size,
      ambiance: [...document.documentElement.classList].filter(c => c.startsWith("ambiance-")).join(" ") || undefined },
    plan: { emplacements: TOUS.length, noeudsDom: document.getElementsByTagName("*").length },
    appareil: appareil(),
    jalons: R.jalons,
    chargement: chargement(),
    synthese: synthese(),
    gestes: R.gestes, saccades: R.saccades, repeints: R.repeints,
    imagesLongues: R.images, evenementsLents: R.evenements,
    memoire: R.memoire, deck: R.deck, erreurs: R.erreurs,
    programmes: R.programmes, contextes: R.contextes,
    /* des comptes, non des mesures : « octetsTexture » est ce qu'on a demandé à
       la carte graphique ; « envoisParLogo », « partRenvois » et « koParEnvoi »
       se comparent d'une visite à l'autre, quels qu'en soient les gestes */
    logos: bilanLogos(),
    ...R.annexes,
    perdus: R.perdus,
  };
}

/* ------------------------------------------------------------
   La pastille, et le partage
   ------------------------------------------------------------ */
/** @type {HTMLElement | null} */
let compteur = null;

function affiche(){
  if (!compteur) return;
  const s = R.saccades.length + (R.perdus.saccades || 0);
  /* Ce que la carte graphique a compilé depuis l'affichage : au repos, ce
     nombre ne devrait plus bouger. Un dessin jeté se signale à part. */
  const c = R.programmes.filter(p => p.apresAffichage).length;
  const pertes = R.contextes.filter(x => x.type === "jete").length;
  compteur.textContent = ips + " fps · " + s + " ⚠ · " + c + " ⚙" + (pertes ? " · " + pertes + " ✖" : "");
  compteur.style.color = ips >= 50 ? "#7CFC9A" : ips >= 30 ? "#FFD166" : "#FF6B6B";
}

/** Le relevé, partagé par le menu du téléphone ; le banc d'essai l'offre
 *  aussi dans son panneau, qui couvre la pastille sur un écran étroit. */
export async function partage(){
  const texte = JSON.stringify(releve());
  const jour = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
  const nom = "releve-plan-" + (SLUG || "demo") + "-" + jour + ".txt";
  // en texte brut : Chrome refuse de partager un fichier `application/json`
  const f = new File([texte], nom, { type: "text/plain" });
  const n = /** @type {any} */ (navigator);
  if (n.canShare && n.canShare({ files: [f] })){
    try { await n.share({ files: [f], title: nom }); return; }
    catch (e) { if (e && /** @type {any} */ (e).name === "AbortError") return; }
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(f); a.download = nom;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 10000);
}

function posePastille(){
  const boite = document.createElement("div");
  boite.id = "releve-perf";
  boite.style.cssText = "position:fixed;left:4px;top:45%;z-index:2147483000;display:flex;flex-direction:column;" +
    "gap:4px;padding:6px;border-radius:8px;background:rgba(0,0,0,.72);color:#fff;" +
    "font:600 12px/1.2 system-ui,sans-serif;pointer-events:auto;touch-action:manipulation";
  compteur = document.createElement("span");
  compteur.style.cssText = "font-variant-numeric:tabular-nums;white-space:nowrap";
  const bouton = document.createElement("button");
  bouton.type = "button";
  bouton.textContent = "Partager le relevé";
  bouton.style.cssText = "font:inherit;padding:6px 8px;border:0;border-radius:6px;background:#fff;color:#000";
  bouton.addEventListener("click", () => { partage(); });
  boite.append(compteur, bouton);
  document.body.appendChild(boite);
  affiche();
}

if (ACTIF){
  guetteProgrammes();
  ecouteGestes();
  ecouteNavigateur();
  REPEINT_FINI.suis((duree, blocs) => {
    garde("repeints", { t: Math.round(performance.now()), ms: ms(duree), blocs, geste: geste ? sorte(geste) : undefined });
    if (geste){ geste.repeints++; geste.msRepeints += duree; }
  });
  DESSIN_JETE.suis(raison => garde("contextes", { t: Math.round(performance.now()), type: "jete", raison,
    geste: geste ? sorte(geste) : undefined }));
  PLAN_DEMARRE.suis(() => { R.jalons["plan-demarre"] = Math.round(performance.now()); });
  quandAffiche(() => { R.jalons["plan-affiche"] = Math.round(performance.now()); });
  setInterval(echantillonne, 5000);
  requestAnimationFrame(image);
  if (document.body) posePastille();
  else addEventListener("DOMContentLoaded", posePastille, { once: true });
}
