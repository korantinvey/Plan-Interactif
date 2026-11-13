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
/* La première tranche lente : au-delà de 33 ms, deux rafraîchissements
   manqués, que la main sent. Le relevé comptait les siennes à partir de la
   tranche suivante — sa « partPlus33 » était une part au-delà de 50 ms, et ne
   se comparait pas à celle de la sonde. */
export const PREMIERE_LENTE = TRANCHES.indexOf(50);

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

/** Le système, quand le navigateur ne le dit pas lui-même. `userAgentData`
 *  n'existe que sous Chromium : sans ce repli, chaque Safari, chaque Firefox
 *  et tout Chrome sur iPhone partaient sans système — 20 visites sur 99 les
 *  12 et 13 novembre 2026, dont tous les appareils d'Apple. Les noms sont
 *  ceux que donne `userAgentData.platform`, pour que les deux se comptent
 *  ensemble ; seule la famille sort de l'agent, rien de sa version. Un iPad
 *  qui se dit Macintosh se trahit par son écran tactile.
 *  @returns {string | undefined} */
export function systemeDeRepli(/** @type {string} */ ua, /** @type {number=} */ pointsTactiles = 0){
  if (/iPhone|iPad|iPod/.test(ua)) return "iOS";
  if (/Android/.test(ua)) return "Android";
  if (/Windows/.test(ua)) return "Windows";
  if (/CrOS/.test(ua)) return "Chrome OS";
  if (/Macintosh|Mac OS X/.test(ua)) return pointsTactiles > 1 ? "iOS" : "macOS";
  if (/Linux|X11/.test(ua)) return "Linux";
  return undefined;
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
      : { mobile: plateforme && typeof plateforme.mobile === "boolean" ? plateforme.mobile : mobileDeRepli(), systeme: plateforme && plateforme.systeme || systemeDeRepli(navigator.userAgent, navigator.maxTouchPoints), navigateur: navigateur() }),
    densite: devicePixelRatio,
    ecran: [screen.width, screen.height],
    fenetre: [innerWidth, innerHeight],
    coeurs: navigator.hardwareConcurrency,
    memoireGo: n.deviceMemory,
    /* Ce que le navigateur en dit est arrondi exprès, et borné : le débit
       plafonne à 10 Mb/s (un 10 dit « au moins »), et un temps d'aller-retour
       nul veut dire qu'il ne le sait pas — 68 visites sur 342 du 3 au
       10 novembre 2026. */
    reseau: n.connection ? { type: n.connection.effectiveType, debitMbps: n.connection.downlink,
      rttMs: n.connection.rtt > 0 ? n.connection.rtt : undefined, economie: n.connection.saveData } : undefined,
    carte: carte ? carteGraphique(gl) : undefined,
    mouvementReduit: matchMedia("(prefers-reduced-motion: reduce)").matches,
  };
}

/* ------------------------------------------------------------
   Le chargement
   ------------------------------------------------------------ */
/**
 * Ce que le navigateur sait du trajet d'une ressource : « garde » si elle sort
 * d'un cache, « reseau » si elle a été transférée, « inconnu » sinon.
 *
 * Une ressource que le service de second plan a servie (`workerStart`) annonce
 * zéro octet transféré et une livraison « cache », qu'il l'ait sortie de sa
 * copie ou demandée au réseau : relevé dans Chromium, un entête de 200 Ko servi
 * sans cache, venu du réseau en 300 ms, s'y dit « 0 octet, depuis le cache »
 * (10 novembre 2026). Dès la deuxième visite, toute la page passe par lui :
 * le transfert de l'ouverture tombait à quelques kilo-octets et la part servie
 * par le cache à 100 %, sur des ouvertures d'une seconde et demie. Seule la
 * livraison « cache-storage » dit qu'il l'a sortie de sa copie.
 *
 * Une ressource dont le corps est caché (autre domaine sans autorisation)
 * annonce zéro partout : inconnue elle aussi, et non servie par le cache.
 */
export function trajet(/** @type {any} */ e){
  if (e.workerStart > 0) return e.deliveryType === "cache-storage" ? "garde" : "inconnu";
  if (!(e.transferSize > 0 || e.decodedBodySize > 0)) return "inconnu";
  return e.transferSize === 0 ? "garde" : "reseau";
}

/**
 * Ce que la page a chargé : le document, les `max` ressources les plus lentes
 * ou les plus lourdes, le total transféré, et la part (0 à 1) des ressources
 * servies par un cache. `jusqua` borne aux ressources parties avant cet
 * instant (ms depuis l'ouverture) : la sonde fige ainsi le bilan de
 * l'ouverture, sans ce que la visite charge ensuite.
 *
 * Le transfert et la part du cache ne comptent que ce dont le trajet est connu
 * (`trajet`) ; `inconnus` dit combien n'y sont pas, et le transfert d'une
 * ressource lourde au trajet inconnu est absent plutôt que nul. Sans rien de
 * connu, la part du cache est absente : zéro aurait dit « tout du réseau ».
 */
export function chargement(max = 40, jusqua = Infinity){
  const nav = /** @type {any} */ (performance.getEntriesByType("navigation")[0]);
  const toutes = performance.getEntriesByType("resource").map(e => /** @type {any} */ (e))
    .filter(e => e.startTime <= jusqua);
  const ko = (/** @type {number} */ o) => Math.round((o || 0) / 1024);
  const lourdes = toutes
    .filter(e => e.duration > 150 || e.transferSize > 50000 || e.decodedBodySize > 200000)
    .sort((a, b) => b.duration - a.duration).slice(0, max)
    .map(e => ({ fichier: fichier(e.name), sorte: e.initiatorType, debut: Math.round(e.startTime),
      ms: Math.round(e.duration), transfertKo: trajet(e) === "inconnu" ? undefined : ko(e.transferSize),
      tailleKo: ko(e.decodedBodySize) }));
  const trajets = toutes.map(trajet);
  const connues = trajets.filter(t => t !== "inconnu").length;
  const gardees = trajets.filter(t => t === "garde").length;
  // le document, passé par le service lui aussi, ne dit rien de son transfert
  const navConnue = nav && !(nav.workerStart > 0);
  const transfert = (navConnue ? nav.transferSize || 0 : 0) +
    toutes.reduce((a, e, i) => a + (trajets[i] === "inconnu" ? 0 : e.transferSize || 0), 0);
  // un instant que la page n'a pas encore atteint vaut zéro : il n'a pas eu lieu
  const instant = (/** @type {number} */ t) => t > 0 ? Math.round(t) : undefined;
  return {
    page: nav ? { reponse: instant(nav.responseEnd), domPret: instant(nav.domContentLoadedEventEnd),
      charge: instant(nav.loadEventEnd), transfertKo: navConnue ? ko(nav.transferSize) : undefined,
      type: nav.type, parLeService: nav.workerStart > 0 || undefined } : null,
    ressources: lourdes,
    transfertKo: ko(transfert),
    depuisCache: connues ? Math.round(100 * gardees / connues) / 100 : undefined,
    inconnus: toutes.length - connues,
  };
}
