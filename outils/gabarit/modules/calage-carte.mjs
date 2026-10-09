/* ============================================================
   16 bis. Les environs — le calage de la carte sous le pavillon

   Poser le plan sur la Terre, le tourner, s'accrocher au bâtiment
   d'OpenStreetMap, l'enregistrer pour tous : des gestes d'exploitant, que le
   visiteur ne reçoit pas. Un module de l'administration, donc :
   `plan-admin.mjs` l'embarque, `plan.mjs` jamais. Le fond lui-même — ce que
   le visiteur voit — vit dans `environs.mjs`, qui lit d'ici le calage en
   cours de réglage par un lecteur confié au branchement.

   Ce que le code soudé tient encore — les réglages et leur enregistrement,
   le panneau des calques, la vue et ses gestes — lui est confié par
   `brancheCalageCarte`, que `_environs.html` appelle à la place que ce code y
   tenait : les boutons de la palette s'y branchent au même rang qu'avant. Les
   identifiants de base des pavillons, et l'oubli du plan public par le
   relais, viennent de `enregistrement.mjs`, module d'administration lui aussi.
   ============================================================ */
import { $ } from "./dom.mjs";
import { DATA, P } from "./donnees.mjs";
import { accesBase, base } from "./session.mjs";
import { fermeModale } from "./fenetre.mjs";
import { anglePlan } from "./itineraire.mjs";
import { DEG, versTerre, versLePlan, reancre, aireDuContour, centreDuContour, axeDuContour }
  from "./terre.mjs";
import { CARTES, forceCarte, calagePose, calageCourant, fondCourant, relanceCarteGL, dessineFondCarte,
  cleMasqueCarte, masqueCarte, contourDuHall, poseMasqueCarte, refaitFondCarte,
  confieCalageEnCours } from "./environs.mjs";
import { identifiants, oublieCache } from "./enregistrement.mjs";
import { vue, svg, versPlan, poseVue } from "./vue.mjs";

/* Ce que le code soudé confie au branchement : les réglages (`CONF`, que le
   changement de salon remplace, et `conf`, qui en ouvre une entrée) et leur
   enregistrement, le panneau des calques et ce qui dit s'il est là
   (`ADMIN`, `MONTE`), et la main qui tient le plan. Ce qui change se lit à
   l'instant. La vue, elle, s'importe de `vue.mjs`. */
/**
 * @typedef {object} PageCalage
 * @property {() => Record<string, any>} conf les réglages du moment, `CONF`
 * @property {(cle: string) => any} confDe une entrée des réglages, ouverte au besoin, `conf`
 * @property {() => void} enregistreConf
 * @property {() => void} construitPanneau
 * @property {() => boolean} estAdmin le mode administrateur, `ADMIN`
 * @property {() => boolean} monte le plan monté, `MONTE`
 * @property {(tenu: boolean) => void} saisitPlan
 */
/** @type {PageCalage} */
let soude;

const racine = document.documentElement;

/* ------------------------------------------------------------
   Le calage — les passages entre le plan et la Terre : `modules/terre.mjs`
   ------------------------------------------------------------ */

/**
 * L'emprise du pavillon qu'on situe.
 *
 * Du pavillon, et non du salon : depuis que le calage est descendu sur le
 * pavillon, c'est un hall à la fois qu'on pose sur la Terre, et lui seul dit
 * autour de quoi chercher. Réunir les pavillons ne se justifiait que s'ils
 * partagent une origine — ce qui est faux précisément des salons qui ont fait
 * descendre le calage. À LUXMC26, les cinq espaces du Grimaldi Forum s'étalent
 * sur 265 × 339 m quand le bâtiment n'en couvre que 11 427 : l'union demandait
 * à OpenStreetMap un kilomètre carré centré à cent mètres du hall, et faisait
 * chercher un bâtiment à la taille de l'ensemble.
 *
 * Le repli sur l'union sert au pavillon sans emprise — il vaut mieux se situer
 * à peu près que pas du tout.
 */
function emprisePavillon(){
  const p = DATA && DATA.plans ? P() : null;
  if (p && p.emprise) return Object.assign({}, p.emprise);
  let e = null;
  for (const q of (DATA && DATA.plans ? DATA.plans : [])){
    if (!q.emprise) continue;
    e = e ? { x0: Math.min(e.x0, q.emprise.x0), y0: Math.min(e.y0, q.emprise.y0),
              x1: Math.max(e.x1, q.emprise.x1), y1: Math.max(e.y1, q.emprise.y1) }
          : Object.assign({}, q.emprise);
  }
  return e;
}

/** Le milieu de ce que ce pavillon occupe : le point sur lequel on cale, et
 *  autour duquel on tourne. */
function centrePavillon(){
  const e = emprisePavillon();
  return e ? [(e.x0 + e.x1) / 2, (e.y0 + e.y1) / 2] : [0, 0];
}

export function basculeMasqueCarte(c){
  const cle = cleMasqueCarte(c.id);
  if (masqueCarte(c)) delete soude.conf()[cle];
  else soude.confDe(cle).masque = true;
  soude.enregistreConf();
  poseMasqueCarte();
  soude.construitPanneau();
}

/** Le bouton du panneau. Il ne paraît qu'avec une carte dessous : sans elle il
 *  ne percerait rien, et un réglage sans effet fait douter des autres. */
export function boutonMasqueCarte(c){
  if (!fondCourant()) return "";
  const on = masqueCarte(c);
  return '<button class="masq" aria-pressed="' + on + '" title="' +
    (on ? "Ne plus percer le fond de carte"
        : "Percer le fond de carte : les surfaces de ce calque le laissent vide") +
    '">' + pictoMasque(on) + '</button>';
}

/** Le picto : un cadre, et le trou qu'on y perce. Pointillé, parce qu'un trou
 *  ne se voit pas — seul son bord se devine. */
const pictoMasque = (on) =>
  '<svg class="pictoMasque" viewBox="0 0 12 12" aria-hidden="true">' +
  '<rect x="1" y="2.2" width="10" height="7.6" rx="1"/>' +
  (on ? '<rect class="trou" x="3.4" y="4.2" width="5.2" height="3.6" rx=".6"/>' : "") +
  "</svg>";

/* ------------------------------------------------------------
   S'accrocher au bâtiment du parc

   Poser les trois nombres à la main demande de la patience, et ne tombe jamais
   tout à fait juste. Or le pavillon est cartographié : un parc des expositions
   est bâti, donc relevé, et OpenStreetMap en rend le contour comme celui de
   n'importe quelle maison. On s'y accroche — même orientation, même centre —
   et il ne reste à trancher que ce qu'aucun calcul ne peut trancher : lequel
   des bâtiments voisins, et lequel des quatre quarts de tour.

   Un seul appel, au moment du calage, par un exploitant. Le visiteur ne voit
   jamais passer cette requête : il reçoit trois nombres.
   ------------------------------------------------------------ */

const OVERPASS = "https://overpass-api.de/api/interpreter";
/* Le terrain demandé, en largeurs de pavillon : de quoi contenir le hall et
   ses voisins immédiats, quelle que soit la rotation — qui n'est justement pas
   encore connue au moment où l'on demande. */
const TERRAIN_BATIS = 3;

/** Le carré de terrain à fouiller, en degrés : sud, ouest, nord, est. */
function carreDeTerrain(cal, facteur){
  const e = emprisePavillon();
  if (!e) return null;
  const c = centrePavillon();
  const d = Math.max(e.x1 - e.x0, e.y1 - e.y0) * facteur / 2;
  let sud = 90, ouest = 180, nord = -90, est = -180;
  for (const q of [[c[0] - d, c[1] - d], [c[0] + d, c[1] - d],
                   [c[0] + d, c[1] + d], [c[0] - d, c[1] + d]]){
    const ll = versTerre(q, cal);
    ouest = Math.min(ouest, ll[0]); est = Math.max(est, ll[0]);
    sud = Math.min(sud, ll[1]);     nord = Math.max(nord, ll[1]);
  }
  return [sud, ouest, nord, est];
}

/** Les bâtiments du secteur, tels qu'OpenStreetMap les rend. */
async function chercheBatiments(bbox){
  /* `out geom` rend les coordonnées dans la réponse : sans lui il faudrait un
     second appel pour résoudre les nœuds, un par un. */
  const requete = "[out:json][timeout:60][bbox:" +
    bbox.map(v => v.toFixed(6)).join(",") + '];way["building"];out geom;';
  let r;
  try {
    r = await fetch(OVERPASS, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "data=" + encodeURIComponent(requete),
    });
  } catch (e) {
    throw new Error("OpenStreetMap est injoignable depuis ce poste.");
  }
  /* Le serveur public d'Overpass est partagé, et le dit : ces deux codes ne
     signalent pas une requête fautive mais un serveur qui ne peut pas répondre
     maintenant. Les confondre enverrait corriger des coordonnées justes. */
  if (r.status === 429 || r.status === 504)
    throw new Error("OpenStreetMap est saturé : réessayez dans une minute.");
  if (!r.ok) throw new Error("OpenStreetMap a répondu " + r.status + ".");
  const d = await r.json();
  return (d.elements || []).filter(x =>
    x.type === "way" && x.geometry && x.geometry.length > 3);
}

/** L'emprise réelle de ce qu'un pavillon contient — sans la marge de douze
 *  mètres que porte `emprise`, qui fausserait la comparaison des aires. */
function empriseDesObjets(p){
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const o of p.stands.concat(p.zones)){
    if (!o.c || !o.bb) continue;
    x0 = Math.min(x0, o.c[0] - o.bb[0] / 2); x1 = Math.max(x1, o.c[0] + o.bb[0] / 2);
    y0 = Math.min(y0, o.c[1] - o.bb[1] / 2); y1 = Math.max(y1, o.c[1] + o.bb[1] / 2);
  }
  return isFinite(x0) ? { x0: x0, y0: y0, x1: x1, y1: y1 } : p.emprise;
}

/**
 * Les bâtiments qui pourraient être celui-ci, le plus vraisemblable d'abord.
 *
 * Le critère est l'aire : un pavillon de vingt mille mètres carrés ne se
 * confond ni avec la loge d'accueil ni avec l'immeuble d'en face. On compare
 * en logarithme pour que « deux fois trop grand » et « deux fois trop petit »
 * se vaillent, et l'on écarte ce qui tient dans un quart du hall.
 */
function batimentsCandidats(elements, cal, p){
  const e = empriseDesObjets(p);
  const aire = Math.max(1, (e.x1 - e.x0) * (e.y1 - e.y0));
  const l = [];
  for (const w of elements){
    const pts = w.geometry.map(g => versLePlan([g.lon, g.lat], cal));
    const a = aireDuContour(pts);
    if (a < aire / 4) continue;
    l.push({ w: w, aire: a, ecart: Math.abs(Math.log(a / aire)) });
  }
  return l.sort((x, y) => x.ecart - y.ecart).slice(0, 8);
}

/**
 * Le calage posé sur un bâtiment : même orientation, même centre.
 *
 * Augmenter l'angle du calage de δ fait tourner la carte de δ dans le repère
 * du plan — la matrice de passage vaut R(a)·F, et R(a+δ) = R(δ)·R(a). On amène
 * donc l'axe du bâtiment sur celui des allées, puis on fait glisser son centre
 * sur celui du pavillon.
 */
function caleSurBatiment(cand, p){
  const e = empriseDesObjets(p);
  const centre = [(e.x0 + e.x1) / 2, (e.y0 + e.y1) / 2];
  ENV_CAL = reancre(ENV_CAL, centre);
  const avant = cand.w.geometry.map(g => versLePlan([g.lon, g.lat], ENV_CAL));
  ENV_CAL.angle += anglePlan(p) - axeDuContour(avant);
  const apres = cand.w.geometry.map(g => versLePlan([g.lon, g.lat], ENV_CAL));
  const c = centreDuContour(apres);
  ENV_CAL.x += centre[0] - c[0];
  ENV_CAL.y += centre[1] - c[1];
  retientLeHall(p, cand);
}

/**
 * Le contour du hall, retenu en mètres du plan.
 *
 * En mètres, et non en degrés — c'est tout le sujet. Le contour vient de la
 * carte, mais ce qu'il décrit est l'emprise du hall sur le plan, et le plan
 * ne bouge pas : c'est la carte qu'on recentre ensuite. Gardé en longitude et
 * latitude, le trou suivait la carte et quittait le hall au premier
 * ajustement. Gelé ici, il reste où le hall est.
 *
 * Un contour par pavillon : le repère est commun à tous, mais chacun a le
 * sien, et un salon sur deux halls ne doit pas vider le premier sous le
 * second.
 */
function retientLeHall(p, cand){
  const r2 = (v) => Math.round(v * 100) / 100;
  const pts = cand.w.geometry.map(g => {
    const q = versLePlan([g.lon, g.lat], ENV_CAL);
    return [r2(q[0]), r2(q[1])];
  });
  ENV_CAL.halls = Object.assign({}, ENV_CAL.halls);
  ENV_CAL.halls[p.id] = pts;
}

/* ------------------------------------------------------------
   L'enregistrement
   ------------------------------------------------------------ */

/**
 * Ce que dit une base qui ne connaît pas encore la colonne.
 *
 * Le message de PostgREST est juste et illisible — « column evenement.calage
 * does not exist » ne dit pas quoi faire. Or le cas se rencontre pour de bon :
 * un aperçu de branche est servi avant que les migrations ne partent, et une
 * instance installée à la main peut n'avoir pas rejoué les siennes.
 */
function manqueCalage(e){
  return /calage/.test(e.message) && /column|schema|PGRST/i.test(e.message)
    ? new Error("la base ne connaît pas encore le calage : appliquez les " +
                "migrations (`npm run bd`) ou attendez la mise en ligne.")
    : e;
}

/** Le calage, enregistré pour tous. Une ligne, et rien d'autre : le fond n'est
 *  pas un dessin qu'on stocke, ce sont des tuiles qu'on va chercher. */
async function enregistreCalage(cal){
  const acces = accesBase();
  if (!acces) throw new Error("aucune session : reconnectez-vous depuis la console.");
  /* La page ne connaît les pavillons que par leur identifiant Klipso ;
     `identifiants` donne celui de la base, qui seul s'écrit. */
  const planId = (await identifiants(acces))[P().id];
  if (!planId) throw new Error("ce pavillon n'est pas encore en base : enregistrez la configuration d'abord.");
  await base(acces, "plan?id=eq." + planId, {
    method: "PATCH", body: JSON.stringify({ calage: cal }),
  }).catch(e => { throw manqueCalage(e); });
  P().calage = cal;
  oublieCache(acces);
}

/** Le calage déjà enregistré, s'il y en a un. Sans rattrapage : l'appelant
 *  l'ignore, et une base qui ne connaît pas encore la colonne ne doit pas
 *  empêcher d'ouvrir le volet — on y vient pour poser ce qui manque. */
async function calageEnregistre(){
  const acces = accesBase();
  if (!acces) return null;
  const planId = (await identifiants(acces))[P().id];
  if (!planId) return null;
  const l = await base(acces, "plan?select=calage&id=eq." + planId);
  return l && l.length ? l[0].calage : null;
}

/* ------------------------------------------------------------
   Le volet des réglages
   ------------------------------------------------------------ */

/* Le calage en cours de réglage, et les bâtiments auxquels s'accrocher. */
let ENV_CAL = null;
let ENV_BATIS = [];
let ENV_BATI = 0;

/** Le réglage en cours abandonné : un calage ne vaut que pour son pavillon, et
 *  le garder en changeant d'onglet poserait sa carte sous le suivant. Appelé
 *  par `changePlan`. */
export function oublieCalageEnCours(){
  ENV_CAL = null; ENV_BATIS = []; ENV_BATI = 0;
}

/**
 * Deux nombres collés depuis une carte : « 48.830212, 2.287851 ».
 *
 * Deux nombres à virgule, séparés par ce qu'on voudra — le séparateur ne vaut
 * pas qu'on le devine, et la virgule décimale française passe aussi bien que
 * le point anglais puisqu'on ne lit que les nombres. Un entier n'est pas une
 * coordonnée utile ici : à un degré près, on est à cent kilomètres.
 */
function litCoordonnees(txt){
  const m = String(txt || "").match(/-?\d+[.,]\d+/g);
  if (!m || m.length !== 2) return null;
  const [a, b] = m.map(v => parseFloat(v.replace(",", ".")));
  /* L'ordre est celui des cartes grand public : la latitude d'abord. Au-delà
     de quatre-vingt-dix degrés ce ne peut plus en être une — on remet les deux
     dans l'ordre plutôt que de refuser un copier-coller qui ne demandait qu'à
     être lu. */
  const [lat, lon] = Math.abs(a) > 90 ? [b, a] : [a, b];
  if (!isFinite(lat) || !isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
  return { lat: lat, lon: lon };
}

/** Le fond refait et la vue rendue : tout réglage passe par là. */
function rafraichitCarte(){
  refaitFondCarte();
  if (soude.estAdmin() && soude.monte()) soude.construitPanneau();
}

/* ------------------------------------------------------------
   La palette de calage

   Caler, c'est regarder : on fait glisser une carte sous le pavillon jusqu'à
   ce que les deux coïncident. Les commandes vivent donc sur le plan, dans une
   palette qui prend la place de celle du dessin — une fenêtre posée devant
   rendait le réglage aveugle, ce qu'aucune quantité de boutons ne rattrape.

   Les réglages, eux, gardent l'onglet « Environs » : c'est là qu'on explique,
   qu'on colle un point et qu'on retire une carte — trois gestes qui ne
   demandent pas de voir le plan.
   ------------------------------------------------------------ */

/* ------------------------------------------------------------
   Placer à la main : on saisit la carte, on la pose

   Trois boutons et quatre flèches disaient ce qu'un geste dit mieux. Tant que
   la palette arme un mode, le plan ne se déplace plus : la main saisit la
   carte dessous et la glisse, ou la fait tourner autour du milieu de l'écran.
   « Naviguer » rend le plan à ses gestes ordinaires, le temps d'aller voir
   ailleurs.

   La touche majuscule bascule en rotation sans quitter le déplacement : c'est
   l'aller-retour qu'on fait vingt fois en calant, et traverser la palette à
   chaque fois use plus que le geste lui-même.
   ------------------------------------------------------------ */

let CALAGE_MODE = "";
let _glisseCalage = null;

/** Arme un mode, et le dit au document : le curseur en dépend, et c'est la
 *  seule chose qui annonce que le plan ne répondra pas comme d'habitude. */
function armeCalage(mode){
  CALAGE_MODE = mode || "";
  racine.classList.toggle("cale-deplace", CALAGE_MODE === "deplace");
  racine.classList.toggle("cale-tourne", CALAGE_MODE === "tourne");
  const corps = $("calageCorps");
  if (corps) corps.querySelectorAll(".cMode button").forEach(b =>
    b.setAttribute("aria-pressed", String(b.dataset.mode === CALAGE_MODE)));
}

/** Le milieu de la vue : le pivot des rotations. Tourner autour de l'ancre
 *  ferait fuir la carte — elle est à sept kilomètres du hall. */
const pivotCalage = () => { const view = vue(); return [view.x + view.w / 2, view.y + view.h / 2]; };

/** Pendant le geste, on ne refait que la carte et le chiffre de la rotation :
 *  reconstruire le panneau des calques à chaque image le rendrait saccadé. */
function glisseCarte(){
  /* Le trou du hall n'est pas refait ici : il est en mètres du plan, et le
     plan ne bouge pas sous la main — c'est la carte qui glisse dessous. */
  dessineFondCarte();
  majCalage();
}

export function cartePointerDown(e){
  if (!CALAGE_MODE || !ENV_CAL || !calageCourant()) return false;
  const p = versPlan(e.clientX, e.clientY);
  const pivot = pivotCalage();
  _glisseCalage = {
    tourne: CALAGE_MODE === "tourne" || e.shiftKey,
    p: p, pivot: pivot, angle0: ENV_CAL.angle,
    a0: Math.atan2(p[1] - pivot[1], p[0] - pivot[0]),
  };
  svg.setPointerCapture(e.pointerId);
  soude.saisitPlan(true);
  return true;
}

export function cartePointerMove(e){
  if (!_glisseCalage) return false;
  const p = versPlan(e.clientX, e.clientY);
  if (_glisseCalage.tourne){
    /* L'angle du pointeur autour du pivot, et non son déplacement : on saisit
       un point et on le fait tourner, ce que la main sait faire sans y penser.
       Le ré-ancrage à chaque image tient le pivot immobile. */
    const a = Math.atan2(p[1] - _glisseCalage.pivot[1], p[0] - _glisseCalage.pivot[0]);
    ENV_CAL = reancre(ENV_CAL, _glisseCalage.pivot);
    ENV_CAL.angle = _glisseCalage.angle0 + (a - _glisseCalage.a0);
  } else {
    ENV_CAL.x += p[0] - _glisseCalage.p[0];
    ENV_CAL.y += p[1] - _glisseCalage.p[1];
    _glisseCalage.p = p;
  }
  glisseCarte();
  return true;
}

export function cartePointerUp(e){
  if (!_glisseCalage) return false;
  _glisseCalage = null;
  soude.saisitPlan(false);
  try { if (svg.hasPointerCapture(e.pointerId)) svg.releasePointerCapture(e.pointerId); } catch (err) {}
  return true;
}

function ditCalage(txt, mal){
  const e = $("calageEtat");
  if (!e) return;
  e.textContent = txt || "";
  e.classList.toggle("alerte", !!mal);
}


/** Remet à jour ce que la palette affiche de l'état courant. */
function majCalage(){
  const corps = $("calageCorps");
  if (!corps || !ENV_CAL) return;
  const rot = corps.querySelector(".cRot");
  if (rot) rot.value = Math.round(ENV_CAL.angle / DEG * 10) / 10;
  /* Ici plutôt qu'à la construction : « Situer le salon » relève le contour
     du hall alors que la palette est déjà ouverte, et la case doit paraître
     sans qu'on la referme pour la rouvrir. */
  const aVider = !!contourDuHall();
  const cv = corps.querySelector(".cVide"), cs = corps.querySelector(".cSansVide");
  if (cv) cv.hidden = !aVider;
  if (cs) cs.hidden = aVider;
  const bat = corps.querySelector(".cBati");
  if (bat){
    bat.hidden = !ENV_BATIS.length;
    bat.textContent = "Bâtiment suivant (" + (ENV_BATI + 1) + "/" + ENV_BATIS.length + ")";
  }
  const sel = corps.querySelector(".cFond");
  if (sel) sel.value = ENV_CAL.fond && CARTES[ENV_CAL.fond] ? ENV_CAL.fond : "";
}

/** Le réglage appliqué et montré : toute commande de la palette finit ici. */
function appliqueCalage(){
  rafraichitCarte();
  majCalage();
}

/** Tourner autour du point qu'on regarde, et non autour d'une origine à sept
 *  kilomètres — sans quoi la carte fuit l'écran au premier degré. */
function tourneCalage(a){
  ENV_CAL = reancre(ENV_CAL, centrePavillon());
  ENV_CAL.angle = a;
  appliqueCalage();
}

function construitCalage(){
  const corps = $("calageCorps");
  corps.innerHTML = "";

  const fond = document.createElement("div");
  fond.className = "cRang";
  fond.innerHTML = '<span>Fond</span><select class="cFond"><option value="">Aucun</option></select>';
  const sel = fond.querySelector("select");
  for (const k of Object.keys(CARTES)){
    const o = document.createElement("option");
    o.value = k; o.textContent = CARTES[k].nom;
    sel.appendChild(o);
  }
  /* La clé et l'adresse du style, sous le choix du fond et non dans les
     réglages : on choisit un service, on colle sa clé, on regarde. Traverser
     une fenêtre entre les deux ferait perdre le fil du seul geste qui compte
     ici — voir si la carte arrive. */
  const avance = document.createElement("div");
  avance.className = "cAvance";
  avance.innerHTML =
    '<input type="text" class="cStyle" autocomplete="off"' +
    ' placeholder="Autre style — laissez vide sinon">' +
    '<span class="cAide"></span>';
  const iStyle = avance.querySelector(".cStyle");
  /* Une adresse se tape ou se colle caractère par caractère : relancer à
     chacun monterait vingt cartes pour en garder une, et les dix-neuf
     premières répondraient sur une adresse en cours d'écriture. */
  let attente = null;
  const plusTard = (f) => { clearTimeout(attente); attente = setTimeout(f, 600); };
  iStyle.oninput = () => plusTard(() => {
    ENV_CAL.style = iStyle.value.trim() || undefined;
    relanceCarteGL();
  });

  const aideAvance = avance.querySelector(".cAide");
  const majAvance = () => {
    const f = CARTES[sel.value];
    /* Le champ ne paraît que pour un fond vectoriel, et reste facultatif :
       « style » est le mot du métier et ne dit rien à qui ne le connaît pas.
       C'est l'adresse d'un fichier qui décrit l'allure d'une carte — couleurs,
       épaisseurs, ce qui paraît à quel zoom. Les fonds « notre style » n'en ont
       pas : ils sont écrits dans la page. */
    avance.hidden = !(f && (f.style || f.objet));
    iStyle.value = ENV_CAL.style || "";
    if (avance.hidden) return;
    aideAvance.textContent = f.objet
      ? "Ce fond est écrit dans la page. Le champ ci-dessus ne sert qu'à " +
        "essayer autre chose — l'adresse d'un fichier de style MapLibre."
      : "Le champ ci-dessus ne sert qu'à essayer un autre style que celui du " +
        "fond choisi. Par défaut : " + f.style + ".";
  };

  sel.onchange = () => {
    ENV_CAL.fond = sel.value || undefined;
    majAvance();
    relanceCarteGL();
    appliqueCalage();
    /* Le recul dépend de la présence d'un fond : sans cette remise en vue, la
       limite change sans que rien ne le montre. */
    poseVue();
  };
  corps.appendChild(fond);
  corps.appendChild(avance);
  majAvance();

  const rot = document.createElement("div");
  rot.className = "cRang";
  rot.innerHTML = '<span>Rotation</span><input type="number" step="0.5" class="cRot"><span class="u">°</span>';
  const nRot = rot.querySelector("input");
  nRot.oninput = e => { const v = +e.target.value; if (isFinite(v)) tourneCalage(v * DEG); };
  corps.appendChild(rot);

  const ligne = document.createElement("div");
  ligne.className = "cLigne";
  const bBati = document.createElement("button");
  bBati.type = "button";
  bBati.className = "cBati";
  bBati.onclick = () => {
    if (!ENV_BATIS.length) return;
    ENV_BATI = (ENV_BATI + 1) % ENV_BATIS.length;
    caleSurBatiment(ENV_BATIS[ENV_BATI], P());
    appliqueCalage();
  };
  const bQuart = document.createElement("button");
  bQuart.type = "button";
  bQuart.textContent = "Quart de tour";
  bQuart.onclick = () => tourneCalage(ENV_CAL.angle + Math.PI / 2);
  ligne.appendChild(bBati);
  ligne.appendChild(bQuart);
  corps.appendChild(ligne);

  /* Le geste, et ce qu'il fait. Trois états plutôt que deux : sans
     « Naviguer », aller regarder l'autre bout du plan demanderait de fermer la
     palette, donc de perdre ce qu'on était en train de régler. */
  const mode = document.createElement("div");
  mode.className = "cMode";
  [["", "Naviguer", "Le plan répond comme d'habitude"],
   ["deplace", "Déplacer", "Glissez la carte sous le plan"],
   ["tourne", "Tourner", "Faites tourner la carte autour du milieu de l'écran"]]
    .forEach(([k, nom, aide]) => {
      const b = document.createElement("button");
      b.type = "button";
      b.dataset.mode = k;
      b.textContent = nom;
      b.title = aide;
      b.onclick = () => armeCalage(k);
      mode.appendChild(b);
    });
  corps.insertBefore(mode, corps.firstChild);

  const force = document.createElement("div");
  force.className = "cRang";
  force.innerHTML = '<span>Discrétion</span>' +
    '<input type="range" class="cForce" min="10" max="100" step="5">';
  const nForce = force.querySelector("input");
  nForce.value = Math.round(forceCarte(ENV_CAL) * 100);
  nForce.title = "À gauche le fond s'efface, à droite il reprend toute sa force";
  nForce.oninput = () => {
    ENV_CAL.force = +nForce.value / 100;
    racine.style.setProperty("--carte-force", String(forceCarte(ENV_CAL)));
  };
  corps.appendChild(force);

  /* Vider le hall. Coché d'office : c'est presque toujours ce qu'on veut, et
     le décocher se comprend tout de suite en voyant ce qui revient.

     Mais seulement s'il y a un contour à vider. Celui-ci vient du bâtiment
     d'OpenStreetMap auquel « Situer le salon » s'est accroché, et un hall
     enterré n'en a pas : au Grimaldi Forum les salles passent sous l'avenue
     Princesse Grace et sous la mer, qu'aucune vue aérienne ne relève. La case
     restait alors cochée sur rien — exactement ce que le bouton de la pile
     s'interdit plus haut : un réglage sans effet fait douter des autres.
     Reste à dire où aller, puisque le moyen existe, sur le calque qui dessine
     le bâtiment. */
  const vide = document.createElement("label");
  vide.className = "cCoche cVide";
  vide.innerHTML = '<input type="checkbox"><span>Vider le hall sous le plan</span>';
  const cVide = vide.querySelector("input");
  cVide.checked = ENV_CAL.vide !== false;
  cVide.onchange = () => {
    ENV_CAL.vide = cVide.checked;
    poseMasqueCarte();
  };
  corps.appendChild(vide);

  const sansHall = document.createElement("p");
  sansHall.className = "calageAide cSansVide";
  sansHall.textContent = "Aucun contour de hall n'a été relevé ici : pour vider " +
    "la carte sous le bâtiment, allumez le cadre percé sur la ligne du calque " +
    "qui le dessine, dans la pile des calques. Seules ses surfaces fermées " +
    "percent — un trait désigne un endroit, il n'en occupe pas.";
  corps.appendChild(sansHall);

  const aide = document.createElement("p");
  aide.className = "calageAide";
  aide.textContent = "Maintenez Majuscule pendant le glissement pour tourner " +
    "sans changer de mode. Un plan dessiné l'entrée vers le bas fait tourner " +
    "la carte avec lui : prenez un fond sans texte, ou la vue aérienne.";
  corps.appendChild(aide);

  armeCalage("deplace");
  majCalage();
}

/** Ouvrir la palette, et refermer ce qui occupait sa place. */
function ouvreCalage(){
  if (!ENV_CAL) return;
  fermeModale();
  /* la boîte à outils, qui occupait la place de la palette */
  const o = $("outils");
  if (o) o.classList.remove("open");
  construitCalage();
  $("calage").hidden = false;
}

function fermeCalage(){
  const c = $("calage");
  if (c) c.hidden = true;
  /* Sans cela le plan resterait saisi par un réglage refermé : on cliquerait
     sur un stand et c'est la carte qui bougerait. */
  armeCalage("");
}

/**
 * Le branchement, appelé par `_environs.html` à la place de ce code.
 *
 * @param {PageCalage} page
 */
export function brancheCalageCarte(page){
  soude = page;
  /* Le fond lit ici le calage qu'on règle : celui-là seul l'emporte sur le
     calage enregistré du pavillon. */
  confieCalageEnCours(() => ENV_CAL);
  /** Branchements de la palette. Faits une fois, au chargement : ces trois
   *  éléments sont dans le balisage, et non construits à l'ouverture. */
  if ($("calageFerme")) $("calageFerme").onclick = fermeCalage;
  if ($("calageGarde")) $("calageGarde").onclick = async () => {
    const b = $("calageGarde");
    b.disabled = true;
    ditCalage("Enregistrement…");
    try {
      await enregistreCalage(ENV_CAL);
      ditCalage("Les visiteurs voient la carte.");
    } catch (e) { ditCalage("Échec : " + e.message, true); }
    b.disabled = false;
  };
}

/**
 * Le volet « Environs ».
 *
 * Ce qui ne demande pas de voir le plan : l'explication, le point qu'on colle,
 * le retrait. Le réglage, lui, s'ouvre sur le plan — c'est le bouton du bas.
 */
export function voletEnvirons(hote){
  const p = document.createElement("p");
  p.textContent = "Le plan est déjà en mètres, dans le repère du parc : il ne " +
    "lui manque que de savoir où il tombe sur la Terre. Donnez-lui un point, " +
    "et une carte vient se glisser sous le pavillon — les rues, les accès, " +
    "les parkings, dessinés par ceux dont c'est le métier.";
  hote.appendChild(p);

  const q = document.createElement("p");
  q.textContent = "Le réglage se fait ensuite sur le plan lui-même, dans une " +
    "palette posée à côté : on cale en regardant la carte glisser sous le " +
    "pavillon, et cette fenêtre-ci serait devant.";
  hote.appendChild(q);

  const etat = document.createElement("p");
  etat.className = "envEtat";
  const dit = (txt, mal) => {
    etat.textContent = txt || "";
    etat.classList.toggle("alerte", !!mal);
  };

  const bloc = document.createElement("div");
  bloc.className = "reglage-nb envCoord";
  bloc.innerHTML = '<label><span class="l">Coordonnées du centre du salon</span></label>' +
    '<input type="text" inputmode="decimal" placeholder="48.830212, 2.287851">' +
    '<span class="aide">Sur n\'importe quelle carte, clic droit au milieu du ' +
    'bâtiment puis « copier les coordonnées ». À peu près suffit : ' +
    'l\'accrochage au bâtiment fait le reste. Les tuiles sont chargées pendant ' +
    'la visite et gardées par le navigateur une fois vues ; la page à données ' +
    'figées, qui n\'appelle rien au dehors, n\'en affichera pas.</span>';
  const champ = bloc.querySelector("input");
  hote.appendChild(bloc);

  const acts = document.createElement("div");
  acts.className = "acts";
  const bSitue = document.createElement("button");
  bSitue.type = "button";
  bSitue.className = "btn";
  bSitue.textContent = "Situer le salon";
  const bRegle = document.createElement("button");
  bRegle.type = "button";
  bRegle.className = "btn";
  bRegle.textContent = "Régler sur le plan";
  const bEfface = document.createElement("button");
  bEfface.type = "button";
  bEfface.className = "btn danger";
  bEfface.textContent = "Retirer la carte";
  acts.appendChild(bSitue);
  acts.appendChild(bRegle);
  acts.appendChild(bEfface);
  hote.appendChild(acts);
  hote.appendChild(etat);

  const maj = () => {
    bRegle.hidden = !ENV_CAL;
    bEfface.hidden = !calagePose();
  };

  bSitue.onclick = async () => {
    const ll = litCoordonnees(champ.value);
    if (!ll) return dit("Il faut deux nombres à virgule, la latitude d'abord.", true);
    const centre = centrePavillon();
    const fond = ENV_CAL && ENV_CAL.fond ? ENV_CAL.fond : "plan";
    ENV_CAL = { lon: ll.lon, lat: ll.lat, x: centre[0], y: centre[1], angle: 0, fond: fond };
    const bbox = carreDeTerrain(ENV_CAL, TERRAIN_BATIS);
    if (!bbox) return dit("Ce salon n'a pas d'emprise : synchronisez-le d'abord.", true);
    bSitue.disabled = true;
    dit("Recherche du bâtiment…");
    /* La palette s'ouvre avant la réponse d'Overpass : la carte est déjà
       posée, et l'on voit sans attendre si l'on est au bon endroit du monde. */
    ouvreCalage();
    appliqueCalage();
    try {
      ENV_BATIS = batimentsCandidats(await chercheBatiments(bbox), ENV_CAL, P());
      ENV_BATI = 0;
      if (ENV_BATIS.length){
        caleSurBatiment(ENV_BATIS[0], P());
        appliqueCalage();
        ditCalage("Calé sur un bâtiment de " +
          Math.round(ENV_BATIS[0].aire).toLocaleString("fr-FR") + " m².");
      } else {
        ditCalage("Aucun bâtiment à la bonne taille ici : tournez à la main.");
      }
    } catch (e) {
      ditCalage("Bâtiment non cherché (" + e.message + ") : tournez à la main.", true);
    }
    bSitue.disabled = false;
    majCalage();
    maj();
  };

  bRegle.onclick = () => { ouvreCalage(); appliqueCalage(); };

  bEfface.onclick = async () => {
    bEfface.disabled = true;
    dit("Retrait…");
    try {
      await enregistreCalage(null);
      ENV_CAL = null; ENV_BATIS = []; ENV_BATI = 0;
      champ.value = "";
      fermeCalage();
      rafraichitCarte();
      poseVue();
      dit("La carte est retirée.");
    } catch (e) { dit("Échec : " + e.message, true); }
    bEfface.disabled = false;
    maj();
  };

  /* Ce qui est déjà en place remplit l'écran : on revient le plus souvent pour
     retoucher, et relever deux fois un point sur une carte n'apprend rien. */
  const pose = calageCourant();
  if (pose){
    champ.value = pose.lat.toFixed(6) + ", " + pose.lon.toFixed(6);
    ENV_CAL = Object.assign({}, pose);
  }
  maj();
  calageEnregistre().then(cal => {
    if (!cal || ENV_CAL) return;
    champ.value = cal.lat.toFixed(6) + ", " + cal.lon.toFixed(6);
    ENV_CAL = cal;
    rafraichitCarte();
    maj();
  }).catch(() => {});
}
