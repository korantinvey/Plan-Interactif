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
     — le démarrage, les ressources lourdes, la mémoire, l'appareil.

   Rien ne part au serveur : le relevé reste dans la page jusqu'à ce qu'on
   touche « Partager », et part alors par le menu de partage du téléphone.
   Il ne dit rien de plus que ce que l'on y a fait soi-même. Chaque liste est
   bornée : une heure de relevé ne doit pas peser sur ce qu'il mesure.

   La boucle d'images qui compte coûte elle-même un rappel par image : le
   relevé est un instrument, pas un mode à laisser aux visiteurs.
   ============================================================ */
import { SLUG, PLAN_ADMIN } from "./salon.mjs";
import { GL, RENDU_WEBGL, REPEINT_FINI } from "./webgl.mjs";
import { quandAffiche } from "./affichage.mjs";
import { PLAN_DEMARRE } from "./demarrage.mjs";
import { TOUS } from "./donnees.mjs";

const ACTIF = /[?&]perf(?:[=&]|$)/.test(location.search);

// au-delà, une liste garde ses premières entrées et compte celles qu'elle perd
const BORNES = { gestes: 400, saccades: 800, repeints: 1500, images: 300, evenements: 400,
  memoire: 720, deck: 720, erreurs: 50 };
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
  /** @type {Record<string, number>} */
  perdus: {},
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
function carteGraphique(){
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
  return {
    enGeste: resume(R.histo.geste), auRepos: resume(R.histo.repos),
    repeints: { n: reps.length, p50: ms(centile(reps, .5)), p95: ms(centile(reps, .95)), max: reps[reps.length - 1] || 0 },
    saccades: R.saccades.length + (R.perdus.saccades || 0),
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
    rendu: { webglVoulu: RENDU_WEBGL, webglActif: GL.actif, immersif: GL.camera, blocs: GL.blocs.size },
    plan: { emplacements: TOUS.length, noeudsDom: document.getElementsByTagName("*").length },
    appareil: appareil(),
    jalons: R.jalons,
    chargement: chargement(),
    synthese: synthese(),
    gestes: R.gestes, saccades: R.saccades, repeints: R.repeints,
    imagesLongues: R.images, evenementsLents: R.evenements,
    memoire: R.memoire, deck: R.deck, erreurs: R.erreurs,
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
  compteur.textContent = ips + " fps · " + s + " ⚠";
  compteur.style.color = ips >= 50 ? "#7CFC9A" : ips >= 30 ? "#FFD166" : "#FF6B6B";
}

async function partage(){
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
  ecouteGestes();
  ecouteNavigateur();
  REPEINT_FINI.suis((duree, blocs) => {
    garde("repeints", { t: Math.round(performance.now()), ms: ms(duree), blocs, geste: geste ? sorte(geste) : undefined });
    if (geste){ geste.repeints++; geste.msRepeints += duree; }
  });
  PLAN_DEMARRE.suis(() => { R.jalons["plan-demarre"] = Math.round(performance.now()); });
  quandAffiche(() => { R.jalons["plan-affiche"] = Math.round(performance.now()); });
  setInterval(echantillonne, 5000);
  requestAnimationFrame(image);
  if (document.body) posePastille();
  else addEventListener("DOMContentLoaded", posePastille, { once: true });
}
