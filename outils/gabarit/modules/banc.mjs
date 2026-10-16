/* ============================================================
   Le banc d'essai — `?perf=banc`

   Un relevé fait à la main ne se compare pas à un autre : un pincement plus
   vif, un glisser plus long, et l'écart entre deux réglages se noie dans
   celui des gestes. Le banc joue donc tout seul, sur le téléphone même, une
   suite de mouvements fixée d'avance — zoom avant, glisser, zoom arrière,
   fiche d'un stand — deux fois de suite : la première dit ce que coûte la
   découverte (programmes compilés, atlas, logos), la seconde le régime établi.

   Chaque image d'un mouvement passe par les mêmes appels qu'un pincement
   (`gestes.mjs` `suitPince`) : la vue change, les textes se figent,
   `rafraichitVue` demande l'image, et `poseVue` clôt le geste comme le doigt
   levé. La trajectoire suit l'horloge, non le nombre d'images : un téléphone
   lent la parcourt en autant de temps avec moins d'images, et c'est ce que
   l'on compte. Chaque phase se mesure jusqu'à une seconde après son dernier
   mouvement : le travail qui suit le doigt levé est celui qui se sent.

   Le relevé (`releve.mjs`) tourne avec lui : le banc y joint ses résultats,
   et compte par phase ce que la carte graphique a compilé ou perdu.
   ============================================================ */
import { changeVue, vue, fit, figeTextes, rafraichitVue, poseVue, retiensVue } from "./vue.mjs";
import { select, ferme } from "./fiche.mjs";
import { apresAffichage } from "./affichage.mjs";
import { GL, RENDU_WEBGL } from "./webgl.mjs";
import { SLUG } from "./salon.mjs";
import { TOUS, state } from "./donnees.mjs";
import { RELEVE_ACTIF, comptesGpu, programmesDepuis, joinsAuReleve, carteGraphique } from "./releve.mjs";
import { changePlan } from "./rendu.mjs";

const ACTIF = RELEVE_ACTIF && /[?&]perf=banc(?:&|$)/.test(location.search);

// une image plus longue que ceci est une saccade que l'œil voit (`releve.mjs`)
const SACCADE = 50;
// le travail qui suit le dernier mouvement compte avec sa phase
const APRES = 1000;
// jusqu'où le zoom avant resserre la vue : un dixième, des stands lisibles
const RESSERRE = 1 / 10;

const attends = (/** @type {number} */ ms) => new Promise(ok => setTimeout(ok, ms));
const image = () => new Promise(ok => requestAnimationFrame(ok));
// lent au départ et à l'arrivée, comme une main
const doux = (/** @type {number} */ t) => t < .5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t);

/** Un mouvement de `ms` millisecondes : `pose(t)` reçoit l'avancement, de 0 à 1. */
async function bouge(/** @type {number} */ ms, /** @type {(t: number) => any} */ pose, zoome = false){
  const debut = performance.now();
  for (;;){
    const t = Math.min(1, (performance.now() - debut) / ms);
    changeVue(retiensVue(pose(t)));
    if (zoome) figeTextes();
    rafraichitVue();
    if (t >= 1) break;
    await image();
  }
  poseVue();
}

/** La vue `v` resserrée d'un facteur `k`, son centre mené de celui de `v`
 *  jusqu'à `but` à mesure qu'elle se resserre — comme deux doigts qui
 *  pincent au-dessus d'un point, et non au milieu de l'écran. */
function resserre(/** @type {any} */ v, /** @type {number} */ k, /** @type {number[]} */ but){
  const a = (1 - k) / (1 - RESSERRE);
  const cx = v.x + v.w / 2 + (but[0] - v.x - v.w / 2) * a, cy = v.y + v.h / 2 + (but[1] - v.y - v.h / 2) * a;
  return { x: cx - v.w * k / 2, y: cy - v.h * k / 2, w: v.w * k, h: v.h * k };
}

/* Le stand que l'adresse nomme (`&stand=dallorane`) : cherché dans son nom,
   son enseigne ou son numéro, sans casse ni accents. Un même banc se rejoue
   ainsi au même endroit d'une version à l'autre, sur le stand que l'on sait
   chargé — et non sur ce que le découpage en cases aurait trouvé ce jour-là. */
const sansAccents = (/** @type {string} */ t) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const VOULU = sansAccents(new URLSearchParams(location.search).get("stand") || "");
function standVoulu(){
  if (!VOULU) return null;
  return TOUS.find(o => Array.isArray(o.c) &&
    [o.nom, o.plan, o.code].some(x => typeof x === "string" && sansAccents(x).includes(VOULU))) || null;
}

/** Combien d'emplacements du pavillon ouvert tombent dans la vue resserrée sur `but`. */
function dansLaVue(/** @type {any} */ v, /** @type {number[]} */ but){
  const w = v.w * RESSERRE / 2, h = v.h * RESSERRE / 2;
  return TOUS.filter(o => o.p === state.plan && Array.isArray(o.c) &&
    Math.abs(o.c[0] - but[0]) < w && Math.abs(o.c[1] - but[1]) < h).length;
}

/* Où zoomer, sans stand nommé. Le milieu de l'emprise tombait dans le vide sur un salon dont
   les halls entourent une cour ou s'étirent en équerre : on mesurait un plan
   sans rien à peindre. On découpe le pavillon ouvert en cases de la taille de
   la vue resserrée, et l'on prend la plus peuplée : c'est là qu'un visiteur
   zoome, et ce qui coûte le plus à dessiner. Le stand de la fiche est le
   plus proche de ce point. */
function cible(/** @type {any} */ v){
  const o = standVoulu();
  if (o && o.p === state.plan) return { but: o.c, stand: o.id, stands: dansLaVue(v, o.c), nom: o.nom || o.plan };
  const ici = TOUS.filter(o => o.p === state.plan && Array.isArray(o.c));
  if (!ici.length) return { but: [v.x + v.w / 2, v.y + v.h / 2], stand: null };
  const cw = v.w * RESSERRE, ch = v.h * RESSERRE;
  /** @type {Map<string, any[]>} */
  const cases = new Map();
  for (const o of ici){
    const k = Math.floor(o.c[0] / cw) + ":" + Math.floor(o.c[1] / ch);
    const l = cases.get(k);
    if (l) l.push(o); else cases.set(k, [o]);
  }
  const pleine = [...cases.values()].reduce((a, b) => b.length > a.length ? b : a);
  const but = [pleine.reduce((s, o) => s + o.c[0], 0) / pleine.length,
    pleine.reduce((s, o) => s + o.c[1], 0) / pleine.length];
  const proche = pleine.reduce((a, b) =>
    Math.hypot(b.c[0] - but[0], b.c[1] - but[1]) < Math.hypot(a.c[0] - but[0], a.c[1] - but[1]) ? b : a);
  return { but, stand: proche.id, stands: dansLaVue(v, but) };
}

/* Les phases d'un tour. Le glisser décrit un cercle et revient d'où il
   part : le zoom arrière repart ainsi de la même vue à chaque tour. */
/** @type {{ nom: string, joue: (ctx: any) => Promise<void> }[]} */
const PHASES = [
  { nom: "zoom avant", joue: async c => {
    await bouge(3000, t => resserre(c.ensemble, Math.pow(RESSERRE, doux(t)), c.but), true);
  } },
  { nom: "glisser", joue: async () => {
    const v0 = { ...vue() }, r = v0.w * .6;
    await bouge(3000, t => {
      const a = doux(t) * 2 * Math.PI;
      return { ...v0, x: v0.x + r * Math.sin(a), y: v0.y + r * (1 - Math.cos(a)) * .5 };
    });
  } },
  { nom: "zoom arrière", joue: async c => {
    const v0 = { ...vue() };
    const k = c.ensemble.w / v0.w;
    await bouge(3000, t => {
      const f = Math.pow(k, doux(t));
      // le centre revient vers celui de l'ensemble à mesure qu'on recule
      const cx = v0.x + v0.w / 2 + (c.ensemble.x + c.ensemble.w / 2 - v0.x - v0.w / 2) * doux(t);
      const cy = v0.y + v0.h / 2 + (c.ensemble.y + c.ensemble.h / 2 - v0.y - v0.h / 2) * doux(t);
      return { x: cx - v0.w * f / 2, y: cy - v0.h * f / 2, w: v0.w * f, h: v0.h * f };
    }, true);
  } },
  { nom: "fiche du stand", joue: async c => {
    if (!c.stand) return;
    select(c.stand, true);
    await attends(2500);
    ferme();
  } },
];

const centile = (/** @type {number[]} */ tri, /** @type {number} */ p) =>
  tri.length ? tri[Math.min(tri.length - 1, Math.floor(tri.length * p))] : 0;

/** Les images d'une phase, comptées par une boucle qui ne fait que noter. */
function compteImages(){
  /** @type {number[]} */
  const dts = [];
  let avant = 0, fini = false;
  const f = (/** @type {number} */ ts) => {
    if (fini) return;
    if (avant) dts.push(ts - avant);
    avant = ts;
    requestAnimationFrame(f);
  };
  requestAnimationFrame(f);
  return () => { fini = true; return dts; };
}

async function mesure(/** @type {number} */ tour, /** @type {any} */ phase, /** @type {any} */ ctx){
  const gpu0 = comptesGpu(), t0 = performance.now();
  const n0 = gpu0.programmes;
  const arrete = compteImages();
  await phase.joue(ctx);
  await attends(APRES);
  const dts = arrete(), duree = performance.now() - t0, gpu = comptesGpu();
  const tri = [...dts].sort((a, b) => a - b);
  return { tour, phase: phase.nom, ms: Math.round(duree), images: tri.length,
    ips: Math.round(tri.length * 1000 / duree),
    p50: Math.round(centile(tri, .5)), p95: Math.round(centile(tri, .95)), max: Math.round(tri[tri.length - 1] || 0),
    saccades: tri.filter(x => x > SACCADE).length,
    programmes: gpu.programmes - gpu0.programmes, msProgrammes: Math.round(gpu.msProgrammes - gpu0.msProgrammes),
    pertes: gpu.pertes - gpu0.pertes, shaders: programmesDepuis(n0) };
}

/* ------------------------------------------------------------
   Le panneau
   ------------------------------------------------------------ */
/** @type {HTMLElement | null} */
let etat = null;
/** @type {HTMLElement | null} */
let resultat = null;
/** @type {HTMLButtonElement | null} */
let copier = null;
/** @type {HTMLButtonElement | null} */
let rejouer = null;

function bouton(/** @type {string} */ texte){
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = texte;
  b.style.cssText = "font:inherit;padding:6px 10px;border:0;border-radius:6px;background:#fff;color:#000";
  return b;
}

function posePanneau(){
  const boite = document.createElement("div");
  boite.id = "banc-perf";
  boite.style.cssText = "position:fixed;left:50%;top:8px;transform:translateX(-50%);z-index:2147483000;" +
    "max-width:calc(100vw - 16px);max-height:70vh;overflow:auto;display:flex;flex-direction:column;gap:6px;" +
    "padding:8px 10px;border-radius:8px;background:rgba(0,0,0,.8);color:#fff;font:600 12px/1.3 system-ui,sans-serif";
  etat = document.createElement("div");
  etat.textContent = "Banc d'essai : attente du plan…";
  resultat = document.createElement("pre");
  resultat.style.cssText = "margin:0;font:11px/1.35 ui-monospace,monospace;white-space:pre;display:none";
  const ligne = document.createElement("div");
  ligne.style.cssText = "display:none;gap:6px;flex-wrap:wrap";
  copier = bouton("Copier le résumé");
  rejouer = bouton("Rejouer");
  ligne.append(copier, rejouer);
  copier.addEventListener("click", () => {
    const texte = resultat ? resultat.textContent || "" : "";
    const fait = () => { if (copier) copier.textContent = "Résumé copié"; };
    if (navigator.clipboard) navigator.clipboard.writeText(texte).then(fait, () => selectionne());
    else selectionne();
  });
  rejouer.addEventListener("click", () => { lance(); });
  boite.append(etat, resultat, ligne);
  document.body.appendChild(boite);
  return ligne;
}

// sans presse-papiers : le texte sélectionné, à copier à la main
function selectionne(){
  if (!resultat) return;
  const r = document.createRange();
  r.selectNodeContents(resultat);
  const s = getSelection();
  if (s){ s.removeAllRanges(); s.addRange(r); }
}

const ombres = () => /[?&]ombres=non(?:&|$)/.test(location.search) ? "sans ombres" : "ombres";

function resume(/** @type {any[]} */ lignes){
  const c = carteGraphique();
  const racine = document.documentElement.classList;
  const ambiance = [...racine].filter(x => x.startsWith("ambiance-")).map(x => x.slice(9)).join(" ") || "?";
  const tete = [
    "banc " + (SLUG || "demo") + " · " + ambiance + " · " + ombres() + " · " +
      (RENDU_WEBGL && GL.actif ? "webgl" : "svg") + " · " + new Date().toISOString().slice(0, 16),
    (c ? c.puce : "?") + " · dpr " + devicePixelRatio + " · " + innerWidth + "x" + innerHeight,
    navigator.userAgent,
    (cibleNom ? "zoom sur " + cibleNom + " · " : "") + visee + " emplacements dans la vue zoomée",
    // ce qui s'est compilé après l'affichage, avant le premier mouvement
    ...avantBanc.map(p => "shader compilé avant le banc : " + p.nom + " (" + p.ms + " ms)"),
    "",
    "tour phase          ips  p50  p95   max  >50ms  shaders(ms)  jetés",
  ];
  const corps = lignes.map(l =>
    String(l.tour).padEnd(5) + l.phase.padEnd(15) +
    String(l.ips).padStart(4) + String(l.p50).padStart(5) + String(l.p95).padStart(5) +
    String(l.max).padStart(6) + String(l.saccades).padStart(7) +
    (l.programmes + " (" + l.msProgrammes + ")").padStart(13) + String(l.pertes).padStart(8));
  /* Le nom de chaque shader compilé pendant le banc, et où : c'est lui qu'on
     préparera pendant l'écran de chargement. */
  const noms = lignes.flatMap(l => l.shaders.map((/** @type {any} */ p) =>
    "  tour " + l.tour + " · " + l.phase + " : " + p.nom + " (" + p.ms + " ms)"));
  return tete.concat(corps, noms.length ? ["", "shaders compilés pendant le banc :", ...noms] : []).join("\n");
}

let enCours = false;
// combien d'emplacements tombent dans la vue zoomée : un banc ne se compare qu'à charge égale
let visee = 0;
// le stand nommé par l'adresse, s'il a été trouvé
let cibleNom = "";
/** ce qui s'est compilé entre l'affichage et le premier mouvement @type {any[]} */
let avantBanc = [];
async function lance(){
  if (enCours) return;
  enCours = true;
  const ligne = /** @type {HTMLElement} */ (rejouer && rejouer.parentElement);
  ligne.style.display = "none";
  if (resultat) resultat.style.display = "none";
  if (copier) copier.textContent = "Copier le résumé";
  ferme();
  /** @type {any[]} */
  const lignes = [];
  avantBanc = programmesDepuis(0).filter(p => p.apresAffichage);
  // le stand nommé peut vivre dans un autre pavillon : le banc s'y rend d'abord
  const o = standVoulu();
  if (o && o.p !== state.plan){ changePlan(o.p); await attends(2000); }
  for (let tour = 1; tour <= 2; tour++){
    fit();
    await attends(1500);
    const ensemble = { ...vue() };
    const ctx = { ensemble, ...cible(ensemble) };
    visee = ctx.stands || 0;
    cibleNom = ctx.nom || "";
    for (const phase of PHASES){
      if (etat) etat.textContent = "Banc d'essai · tour " + tour + "/2 · " + phase.nom + " — ne touchez pas l'écran";
      lignes.push(await mesure(tour, phase, ctx));
    }
  }
  fit();
  joinsAuReleve("banc", lignes);
  if (etat) etat.textContent = "Banc d'essai terminé";
  if (resultat){ resultat.textContent = resume(lignes); resultat.style.display = "block"; }
  ligne.style.display = "flex";
  enCours = false;
}

if (ACTIF){
  const go = async () => {
    posePanneau();
    await apresAffichage();
    // les logos, les polices et les atlas des noms ont le temps d'arriver
    await attends(3000);
    lance();
  };
  if (document.body) go();
  else addEventListener("DOMContentLoaded", go, { once: true });
}
