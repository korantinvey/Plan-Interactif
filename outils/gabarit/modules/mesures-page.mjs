/* ============================================================
   Les mesures de la page, partagées

   Deux lecteurs regardent la même page : le relevé qu'on partage à la main
   (`releve.mjs`, `?perf`) et la sonde silencieuse qui en rend un résumé au
   serveur (`sonde.mjs`). Ils comptent les mêmes choses — les tranches
   d'intervalle entre images, le seuil de saccade, ce que la page a chargé,
   l'appareil et sa carte graphique. Chacun les mesurant de son côté, les
   chiffres de l'un auraient cessé de se comparer à ceux de l'autre à la
   première retouche ; ils vivent donc ici, une fois.

   Ce module ne fait rien en s'important : il ne pose ni écoute, ni boucle,
   ni observateur. Ce sont des fonctions que l'on appelle, ou non.

   Sans import de module du plan : tous peuvent l'importer.
   ============================================================ */

// une image plus longue que ceci est une saccade que l'œil voit
export const SACCADE = 50;
// un geste dure tant qu'une entrée arrive à moins de ceci de la précédente
export const FIN_GESTE = 300;
// les tranches d'intervalle entre deux images, en millisecondes
export const TRANCHES = [17, 25, 33, 50, 100, 250, Infinity];

/** Le centile `p` (0 à 1) d'une liste déjà triée. */
export function centile(/** @type {number[]} */ tri, /** @type {number} */ p){
  return tri.length ? tri[Math.min(tri.length - 1, Math.floor(tri.length * p))] : 0;
}

/** Le nom d'un fichier, sans son chemin ni sa requête : ce que le relevé
 *  garde d'une adresse, qui peut porter un jeton ou un identifiant. */
export const fichier = (/** @type {string} */ u) => { try { return new URL(u).pathname.split("/").pop() || u; } catch (e) { return u; } };

/** Un observateur de performances, sous garde : un navigateur qui ne connaît
 *  pas ce type d'entrée lève, et la mesure manquante ne doit rien casser.
 *  Dit s'il a pu s'inscrire. */
export function observe(/** @type {string} */ type, /** @type {(e: any) => void} */ f, /** @type {any} */ plus = {}){
  try {
    const po = new PerformanceObserver(l => l.getEntries().forEach(f));
    po.observe({ type, buffered: true, ...plus });
    return true;
  } catch (e) { return false; }
}

/* ------------------------------------------------------------
   L'appareil
   ------------------------------------------------------------ */
/** La carte graphique, lue sur un contexte qu'on tient déjà (`gl`) ou, à
 *  défaut, sur un canevas jeté aussitôt. Lire celui du plan évite de
 *  consommer un second contexte, que les téléphones comptent au plus juste. */
export function carteGraphique(/** @type {any} */ gl = null){
  try {
    const neuf = !gl;
    if (neuf){
      const c = document.createElement("canvas");
      gl = c.getContext("webgl2") || c.getContext("webgl");
    }
    if (!gl) return null;
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const r = {
      webgl2: typeof WebGL2RenderingContext !== "undefined" && gl instanceof WebGL2RenderingContext,
      fabricant: ext ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR),
      puce: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
      textureMax: gl.getParameter(gl.MAX_TEXTURE_SIZE),
    };
    // le contexte jeté est rendu ; celui du plan, lui, continue de servir
    if (neuf){
      const perte = gl.getExtension("WEBGL_lose_context");
      if (perte) perte.loseContext();
    }
    return r;
  } catch (e) { return null; }
}

/** La famille du navigateur et sa version majeure, tirées de l'agent
 *  utilisateur sans le garder : le reste de la chaîne (modèle du téléphone,
 *  build) rendrait la visite reconnaissable. L'ordre compte : Edge, Opera et
 *  Samsung se disent aussi « Chrome », Chrome se dit aussi « Safari ». */
function navigateur(){
  const ua = navigator.userAgent;
  const familles = /** @type {Array<[string, RegExp]>} */ ([
    ["Edge", /\bEdgA?\/(\d+)/], ["Opera", /\bOPR\/(\d+)/], ["Samsung", /\bSamsungBrowser\/(\d+)/],
    ["Firefox", /\b(?:Firefox|FxiOS)\/(\d+)/], ["Chrome", /\b(?:Chrome|CriOS)\/(\d+)/],
    ["Safari", /\bVersion\/(\d+)[\s\S]*Safari\//],
  ]);
  for (const [famille, re] of familles){
    const m = ua.match(re);
    if (m) return { famille, version: Number(m[1]) };
  }
  return { famille: "autre", version: 0 };
}

/** Un téléphone ou une tablette, quand le navigateur ne le dit pas lui-même :
 *  `userAgentData` n'existe que sous Chromium, et sans ce repli chaque iPhone,
 *  chaque Firefox partait « bureau ». Le motif est lu dans l'agent sans le
 *  garder ; un iPad qui se dit Macintosh se trahit par son pointeur grossier. */
function mobileDeRepli(){
  if (/Mobi|iPhone|iPad|Android/.test(navigator.userAgent)) return true;
  try { return matchMedia("(pointer: coarse)").matches; } catch (e) { return false; }
}

/**
 * L'appareil. Par défaut avec l'agent utilisateur entier, pour le relevé qu'on
 * partage soi-même ; la sonde, qui part au serveur, demande `agentComplet:
 * false` et n'emporte que la famille et la version majeure (`mobile` et
 * `systeme` à plat, comme son résumé les attend ; `mobile` y est toujours un
 * booléen). `carte: false` laisse la carte graphique de côté : la sonde la lit
 * à part, sur le contexte du plan ou dans un moment creux.
 */
export function appareil(/** @type {{ agentComplet?: boolean, gl?: any, carte?: boolean }} */ { agentComplet = true, gl = null, carte = true } = {}){
  const n = /** @type {any} */ (navigator);
  const plateforme = n.userAgentData ? { mobile: n.userAgentData.mobile, systeme: n.userAgentData.platform } : undefined;
  return {
    ...(agentComplet
      ? { agent: navigator.userAgent, plateforme }
      : { mobile: plateforme && typeof plateforme.mobile === "boolean" ? plateforme.mobile : mobileDeRepli(), systeme: plateforme && plateforme.systeme, navigateur: navigateur() }),
    densite: devicePixelRatio,
    ecran: [screen.width, screen.height],
    fenetre: [innerWidth, innerHeight],
    coeurs: navigator.hardwareConcurrency,
    memoireGo: n.deviceMemory,
    reseau: n.connection ? { type: n.connection.effectiveType, debitMbps: n.connection.downlink, rttMs: n.connection.rtt,
      economie: n.connection.saveData } : undefined,
    carte: carte ? carteGraphique(gl) : undefined,
    mouvementReduit: matchMedia("(prefers-reduced-motion: reduce)").matches,
  };
}

/* ------------------------------------------------------------
   Le chargement
   ------------------------------------------------------------ */
/**
 * Ce que la page a chargé : le document, les `max` ressources les plus lentes
 * ou les plus lourdes, le total transféré, et la part (0 à 1) des ressources
 * servies sans rien transférer, c'est-à-dire par le cache. `jusqua` borne aux
 * ressources parties avant cet instant (ms depuis l'ouverture) : la sonde fige
 * ainsi le bilan de l'ouverture, sans ce que la visite charge ensuite.
 */
export function chargement(max = 40, jusqua = Infinity){
  const nav = /** @type {any} */ (performance.getEntriesByType("navigation")[0]);
  const toutes = performance.getEntriesByType("resource").map(e => /** @type {any} */ (e))
    .filter(e => e.startTime <= jusqua);
  const lourdes = toutes
    .filter(e => e.duration > 150 || e.transferSize > 50000 || e.decodedBodySize > 200000)
    .sort((a, b) => b.duration - a.duration).slice(0, max)
    .map(e => ({ fichier: fichier(e.name), sorte: e.initiatorType, debut: Math.round(e.startTime),
      ms: Math.round(e.duration), transfertKo: Math.round((e.transferSize || 0) / 1024),
      tailleKo: Math.round((e.decodedBodySize || 0) / 1024) }));
  // une ressource dont le corps est inconnu (autre domaine, sans autorisation) annonce 0 partout : ce n'est pas du cache
  const lues = toutes.filter(e => e.transferSize > 0 || e.decodedBodySize > 0);
  const servies = lues.filter(e => e.transferSize === 0).length;
  const transfert = (nav ? nav.transferSize || 0 : 0) + toutes.reduce((a, e) => a + (e.transferSize || 0), 0);
  return {
    page: nav ? { reponse: Math.round(nav.responseEnd), domPret: Math.round(nav.domContentLoadedEventEnd),
      charge: Math.round(nav.loadEventEnd), transfertKo: Math.round((nav.transferSize || 0) / 1024),
      type: nav.type } : null,
    ressources: lourdes,
    transfertKo: Math.round(transfert / 1024),
    depuisCache: lues.length ? Math.round(100 * servies / lues.length) / 100 : 0,
  };
}
