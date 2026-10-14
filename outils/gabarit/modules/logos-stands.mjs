/* ============================================================
   Les logos sur les stands, vus de près

   De loin, le hall se lit par ses formes et ses noms. Quand on s'approche,
   l'enseigne d'un stand dit plus vite que son nom qui l'occupe : son logo se
   pose alors à plat sur le stand — sur son toit en vue immersive —, imprimé
   comme une enseigne peinte, sans plaque ni bord, et le nom lui cède la place.
   Toutes les ambiances le permettent : à plat, en classique comme en tuiles,
   le logo est seulement dessiné sans l'étirement que la vue de biais
   demande.

   À la place, et non en plus. Un premier essai le faisait flotter au-dessus
   du stand : le nom restait dessous, les noms des stands de devant — peints
   par-dessus le relief — passaient en travers des logos de derrière, et le
   hall se lisait deux fois, en lettres et en marques. Couché sur le toit, le
   logo occupe l'endroit du nom et rien d'autre.

   Le passage de l'un à l'autre se fait au zoom, au même seuil des deux
   côtés : le nom se tait (`cedeAuLogo`, appelé par `libelles.mjs`), le logo
   paraît en un court fondu peint par le shader (`fonduZoom`). Rien ne bouge de
   lui-même : c'est le geste qui règle le passage.

   Une option de l'exploitant (volet « Apparence ») ; la racine en porte la
   classe, posée par `ambiance.mjs`, et `webgl.mjs` demande ici ses couches.
   Le SVG (`?rendu=svg`) n'en pose pas : ses noms restent.

   Le toit pose la grande vignette (`vignettes.mjs` `adresseGrande`),
   fabriquée à la synchronisation et déjà détourée — son fond blanc retiré
   une fois pour tous (`marque.mjs` `vignetteDeLogo`). Ce tri se faisait ici,
   chez chaque visiteur, deux logos à la fois : sur un écran de bureau, la
   centaine de stands autour de la vue de Franchise Expo paraissait un à un,
   pendant de longues secondes, et leurs noms s'étaient tus avant. Le nom ne
   cède donc la place qu'au logo que la couche pose (`logoPose`). Un salon que la
   synchronisation n'a pas encore refait n'a pas de grande, ou une grande au
   fond blanc : la page la détoure alors elle-même, ou à défaut la petite du
   lot. Sans vignette, le stand garde son nom.

   Le logo d'origine, deux à quatre fois plus fin, a été demandé un temps à
   sa source de très près : il pèse jusqu'à deux mégaoctets, et le gain ne
   valait pas ce chargement pour un toit.
   ============================================================ */
import { $ } from "./dom.mjs";
import { P } from "./donnees.mjs";
import { cameraEnJeu, ecranVersPlat, SINUS_INCLINAISON } from "./camera.mjs";
import { cadrePlan } from "./vue-etat.mjs";
import { VIGNETTES, VIGNETTES_ARRIVEES, adresseGrande } from "./vignettes.mjs";
import { detoure } from "./detourage.mjs";
import { creeAnnonce } from "./annonce.mjs";
import { ETROIT } from "./ecran.mjs";
import { placementLogo, PLACE_LIBELLES, PREFIXE_LOGO } from "./libelle-place.mjs";

/** La classe que la racine porte quand l'option est prise. */
export const CLASSE_LOGOS = "logos-stands";

/* Le seuil, en zoom de la carte graphique — le logarithme des pixels par
   mètre. Au-delà, le nom d'un stand qui a un logo se tait ; le logo, lui,
   paraît sur le dernier quart de cran qui y mène, pour que le stand ne reste
   jamais vide entre les deux. Seize pixels par mètre l'ont fait paraître trop
   tôt, puis vingt-quatre trop tard : il fallait s'approcher si près, surtout
   sur téléphone où l'écran ne montre qu'un bout du hall, que les logos ne
   paraissaient presque jamais. Il est vu de deux fois plus haut, à douze, et
   sur écran étroit d'une fois et demie plus haut encore, à huit. Lu une fois,
   au chargement : le shader et les noms le figent. */
const ZOOM_LOGO = Math.log2(ETROIT() ? 8 : 12), ZOOM_FONDU = ZOOM_LOGO - .25;

/* La part du toit que le logo occupe, dans un sens comme dans l'autre. */
const PART_DU_TOIT = .82;
/* Au-delà, un logo de grand stand d'angle ne gagne plus rien à grandir. */
const LARGEUR_MAX = 12;

/* La finesse du logo, en pixels de sa toile par mètre de toit. Elle suit ce
   que l'écran en montre : fixée à cinquante, elle laissait un logo de deux
   mètres et demi à cent vingt pixels, que la vue de près étalait sur deux
   cents pixels d'écran dense — le logo paraissait flou au moment même où il
   prenait la place du nom. Elle vaut donc les pixels d'écran par mètre, densité
   comprise, majorés pour les stands du premier plan, que la perspective
   grossit au-delà de ce que dit le zoom du centre. Elle avance par demi-crans,
   pour qu'un pincement ne refasse pas les toiles à chaque image. Jamais plus
   que ce que la vignette porte : l'agrandir n'inventerait aucun détail. */
const PIXELS_PAR_METRE_MIN = 50, PIXELS_MIN = 96, PREMIER_PLAN = 1.5;
const finesse = (/** @type {number} */ zoom) => {
  const voulue = 2 ** zoom * Math.min(3, window.devicePixelRatio || 1) * PREMIER_PLAN;
  return Math.max(PIXELS_PAR_METRE_MIN, 2 ** (Math.ceil(Math.log2(voulue) * 2) / 2));
};
/* La largeur d'une toile, d'après ce que le logo occupe à l'écran à sa
   place : en vue immersive, un logo du premier plan s'étale, un logo du fond
   n'est qu'un trait. La finesse unique, prise au premier plan et sur la
   densité de l'écran, les faisait tous aussi fins : sur un téléphone à trois
   pixels par point, la planche débordait sans cesse — six agrandissements,
   onze rangements et 343 Mo envoyés en quarante secondes (`?perf`, FEP27,
   14 octobre 2026). Elle avance par demi-octaves, pour qu'un zoom ne refasse
   pas les toiles à chaque cran, et se borne : jamais moins qu'un trait
   lisible, jamais plus que la vignette. */
const TOILE_MIN = 64, TOILE_MAX = 1024;
const palier = (/** @type {number} */ px) =>
  Math.min(TOILE_MAX, Math.max(TOILE_MIN, 2 ** (Math.ceil(Math.log2(Math.max(1, px)) * 2) / 2)));
/* Un rien de marge vide autour du logo, pour que ses bords ne se coupent pas
   net. */
const MARGE = 2;
/* Couchée sur le sol incliné, une image se tasse en hauteur d'autant que le
   hall fuit. Le logo est donc dessiné étiré d'autant : vu de biais, il
   reprend ses proportions. Le compte est juste de face, et reste bon aux
   quelques degrés de cap qu'un hall prend d'ordinaire. À plat, vu d'en haut,
   rien ne se tasse. */
const TASSEMENT = Math.sqrt(1 - SINUS_INCLINAISON * SINUS_INCLINAISON);
const tassement = () => cameraEnJeu() ? TASSEMENT : 1;

/* Seuls les logos autour de la vue se posent. Une texture par logo, à pleine
   finesse : les cinq cents d'un salon comme Franchise Expo tiendraient des
   centaines de mégaoctets de carte graphique, et une seule texture pour tous
   passerait la taille qu'elle accepte. La vue ne montre de près que quelques
   dizaines de stands ; on pose ceux-là et leurs voisins, d'une demi-vue de
   chaque côté, et l'on repose quand la vue sort de cette marge. Reculée sous
   le seuil, plus aucun : leurs textures sont rendues. */
const MARGE_VUE = .5;
/* Les grandes vignettes, elles, se demandent plus loin : une par logo, au
   service, elles arrivaient quand la vue entrait dans leur marge — un geste
   faisait alors paraître les logos un à un devant soi, après les noms. D'une
   vue et demie de chaque côté, elles sont là quand on y arrive. */
const MARGE_PRECHARGE = 1.5;
/* Combien de grandes en route à la fois. Toutes à la fois, dans l'ordre du
   plan, celles du milieu de l'écran attendaient derrière celles des bords ;
   rangées par distance au centre de la vue, les plus proches arrivent les
   premières. */
const GRANDES_EN_ROUTE = 8;

/** Les logos posés ont changé : les noms des stands doivent se refaire — se
 *  taire devant un logo qui vient de se poser, revenir là où il n'y en a plus. */
export const PANNEAU_PRET = creeAnnonce();
/** Un logo vient d'être prêt : le dessin doit le poser. Les noms n'ont rien à
 *  en apprendre tant qu'il ne l'est pas (`PANNEAU_PRET`) — les refaire à
 *  chaque arrivée doublait le travail d'une apparition massive. */
export const LOGO_PRET = creeAnnonce();
VIGNETTES_ARRIVEES.suis(() => annoncePret());

/* ------------------------------------------------------------
   Rien ne se prépare sous le doigt

   Un logo prêt faisait refaire la planche entière, la renvoyer à la carte
   graphique et retaire les noms — elle ne reçoit plus que sa case
   (« La planche gardée »), mais un geste ne doit rien attendre d'autre. Le 13 octobre 2026, sur un téléphone Android
   récent, des logos arrivés pendant un pincement l'ont gelé une seconde, à
   six images par seconde (`?perf`). Pendant un geste, ce qui devient prêt
   attend donc sa fin (`geleLogos`, appelé par `webgl.mjs`) ; la couche ne
   se refait alors que si la vue quitte ce qu'elle couvre, avec les logos
   qu'elle avait déjà.

   La finesse attend aussi. Elle avance par demi-crans de zoom, et un
   pincement en franchit plusieurs : chacun refaisait les toiles de tous les
   logos autour de la vue, leur planche, l'envoi à la carte graphique et
   l'assemblage du plan entier — cent quarante-sept repeints en vingt
   secondes de pincement, des images de cinquante à cent quarante
   millisecondes, le même soir, sur le même téléphone. Les logos gardent
   donc pendant le geste la finesse où ils ont été posés, un peu flous si
   l'on s'approche, et reprennent la juste à sa fin.
   ------------------------------------------------------------ */
let gele = false, annonceRetenue = false;
/** Les logos devenus prêts pendant le geste, posés à sa fin. */
/** @type {Map<string, Logo>} */
const enRetard = new Map();

function annoncePret(){
  if (gele) annonceRetenue = true;
  else LOGO_PRET.dis();
}

/** Un logo est prêt à poser — tout de suite, ou à la fin du geste. */
function pret(/** @type {string} */ cle, /** @type {Logo} */ logo){
  if (gele) enRetard.set(cle, logo);
  else detourees.set(cle, logo);
  annoncePret();
}

/** Un geste commence ou finit : à sa fin, ce qui a attendu se pose. */
export function geleLogos(/** @type {boolean} */ oui){
  gele = oui;
  if (oui) return;
  for (const [cle, logo] of enRetard) detourees.set(cle, logo);
  enRetard.clear();
  // les logos posés pendant le geste reprennent la finesse de la vue où il s'arrête
  const affiner = couvert !== null && pres(zoomVu) && finesse(zoomVu) !== finesseCouverte;
  if (annonceRetenue || affiner){ annonceRetenue = false; LOGO_PRET.dis(); }
}

/** Les vignettes décodées, par clé. */
/** @type {Map<string, "attente" | "panne" | HTMLImageElement>} */
const images = new Map();
/** Les vignettes détourées, à leur pleine finesse, par clé, de la moins
 *  récemment posée à la plus récente : une toile quand la page les a
 *  détourées, l'image même quand elles sont arrivées sans fond. */
/** @typedef {HTMLCanvasElement | HTMLImageElement | ImageBitmap | null} Logo */
/** @type {Map<string, Logo>} */
const detourees = new Map();
/* Combien on en garde, en pixels. Chacune tient les siens — un
   demi-mégaoctet pour une vignette de six cents sur deux cents, le triple pour
   une grande —, et un visiteur qui parcourt de près tout un salon de cinq
   cents stands les aurait toutes gardées. Vingt millions de pixels, quatre-
   vingts mégaoctets, couvrent la vue et ses abords ; une vignette oubliée se
   détoure à nouveau quand on revient vers elle, comme à la première fois. Les
   vignettes reçues, elles, restent : quelques kilo-octets chacune — et la
   grande arrivée sans fond n'est que l'image reçue, qui ne s'oublie pas. */
const PIXELS_GARDES = 20e6;
/** Les toiles prêtes à poser, par clé et par largeur — seules celles de la
 *  dernière pose : une finesse quittée se refait d'une simple réduction. */
/** @type {Map<string, HTMLCanvasElement | null>} */
const toiles = new Map();

/** Les grandes vignettes, par clé : demandées par les seuls toits vus de
 *  près. */
/** @type {Map<string, "attente" | "panne" | HTMLImageElement | ImageBitmap>} */
const grandes = new Map();

/**
 * L'image est-elle arrivée sans fond ? Un de ses coins transparent suffit à
 * le dire : une grande au fond blanc — fabriquée avant que la
 * synchronisation ne détoure — n'en a aucun. Quatre pixels lus, au lieu
 * de tous les trier.
 */
function arriveeSansFond(/** @type {CanvasImageSource} */ i, /** @type {number} */ w, /** @type {number} */ h){
  try {
    const t = document.createElement("canvas");
    t.width = 2; t.height = 2;
    const ctx = t.getContext("2d", { willReadFrequently: true });
    if (!ctx) return false;
    for (const [x, y] of [[0, 0], [1, 0], [0, 1], [1, 1]])
      ctx.drawImage(i, x * (w - 1), y * (h - 1), 1, 1, x, y, 1, 1);
    const d = ctx.getImageData(0, 0, 2, 2).data;
    return d[3] < 16 || d[7] < 16 || d[11] < 16 || d[15] < 16;
  } catch (e) { return false; }
}

/** La grande vignette décodée, ou rien : pas encore arrivée, ou absente —
 *  le service répond qu'il n'y en a pas pour un logo que la synchronisation
 *  n'a pas encore refait. Arrivée sans fond, elle est prête à poser. */
function grande(/** @type {string} */ cle){
  const deja = grandes.get(cle);
  if (deja) return typeof deja === "string" ? null : deja;
  if (!adresseGrande(cle)){ grandes.set(cle, "panne"); return null; }
  if (!fileGrandes.includes(cle)) fileGrandes.push(cle);
  pompeGrandes();
  return null;
}

/** Les grandes qui attendent leur tour, la plus voulue en tête. */
/** @type {string[]} */
const fileGrandes = [];
let grandesEnRoute = 0;

function pompeGrandes(){
  while (grandesEnRoute < GRANDES_EN_ROUTE && fileGrandes.length) demandeGrande(/** @type {string} */ (fileGrandes.shift()));
}

function demandeGrande(/** @type {string} */ cle){
  const src = adresseGrande(cle);
  grandes.set(cle, "attente");
  grandesEnRoute++;
  /** Arrivée et décodée : prête à poser si elle vient sans fond, à détourer sinon. */
  const recue = (/** @type {HTMLImageElement | ImageBitmap} */ i, /** @type {number} */ w, /** @type {number} */ h) => {
    if (!(w && h)){ panne(); return; }
    // prête avant l'annonce : les noms qu'elle fait refaire doivent la savoir prête
    grandes.set(cle, i);
    grandesEnRoute--; pompeGrandes();
    if (arriveeSansFond(i, w, h)) pret(cle + "+g", i);
    else annoncePret();
  };
  // sans grande, le toit se rabat sur la petite : il doit l'apprendre
  const panne = () => { grandes.set(cle, "panne"); grandesEnRoute--; pompeGrandes(); annoncePret(); };
  /* Reçue en octets et décodée hors de la page. Une image de la page se
     décodait sur son fil au moment d'être lue — pour savoir si elle venait
     sans fond, puis pour chaque toile —, et créer une « ImageBitmap » d'une
     balise image le fait aussi, dans Chrome : de cinq à cinquante
     millisecondes par logo sur un téléphone, deux à trois cents fois en
     parcourant un salon de près, souvent en plein geste (`?perf`, le 13
     octobre 2026). Décodée depuis ses octets, elle l'est à côté, et la page
     n'en reçoit que le résultat. */
  if (typeof createImageBitmap === "function" && typeof fetch === "function"){
    fetch(src)
      .then(r => r.ok ? r.blob() : Promise.reject(new Error("HTTP " + r.status)))
      .then(octets => createImageBitmap(octets))
      .then(b => recue(b, b.width, b.height), panne);
    return;
  }
  const i = new Image();
  // lue par le détourage : une origine qui ne le permettrait pas la rendrait muette
  i.crossOrigin = "anonymous";
  i.onload = () => recue(i, i.naturalWidth, i.naturalHeight);
  i.onerror = panne;
  i.src = src;
}

/** La vignette décodée, ou rien tant qu'elle ne l'est pas. */
function image(/** @type {string} */ cle){
  const deja = images.get(cle);
  if (deja) return typeof deja === "string" ? null : deja;
  const src = VIGNETTES.get(cle);
  if (!src) return null;
  images.set(cle, "attente");
  const i = new Image();
  i.onload = () => {
    images.set(cle, i.naturalWidth && i.naturalHeight ? i : "panne");
    annoncePret();
  };
  i.onerror = () => images.set(cle, "panne");
  i.src = src;
  return null;
}

/**
 * Le logo à cette largeur, son fond blanc retiré (`detourage.mjs`) : il est
 * imprimé sur le toit, sans plaque ni bord.
 */
function sansFond(/** @type {CanvasImageSource} */ i, /** @type {number} */ w, /** @type {number} */ h){
  const toile = document.createElement("canvas");
  toile.width = w; toile.height = h;
  const ctx = toile.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(i, 0, 0, w, h);
  const img = ctx.getImageData(0, 0, w, h);
  detoure(img.data, w, h);
  ctx.putImageData(img, 0, 0);
  return toile;
}

/* ------------------------------------------------------------
   Le détourage, hors de la page

   Fait sur place, au moment de poser les logos, il figeait la page : sept
   cents millisecondes sur Funexpo, quand le zoom passait le seuil et que les
   quinze logos autour de la vue se détouraient dans la même image. Il se fait
   désormais dans un travailleur (`detourage-travail.mjs`), deux à la fois au
   plus — chacun tient son image décodée pendant le trajet —, et chaque logo
   paraît quand le sien revient (`PANNEAU_PRET`). Sans travailleur — script
   absent des essais, navigateur qui le refuse —, la page détoure elle-même,
   mais un logo par tâche : la page respire entre deux.

   Depuis que la synchronisation détoure la grande, ce chemin n'est plus que
   le recours d'un salon qu'elle n'a pas encore refait.
   ------------------------------------------------------------ */
/** Ce qui attend son détourage, et ce qui y est. */
/** @type {{ cle: string, i: CanvasImageSource, iw: number, ih: number }[]} */
const aDetourer = [];
/** @type {Map<number, { cle: string, i: CanvasImageSource, iw: number, ih: number }>} */
const enDetourage = new Map();
const EN_MEME_TEMPS = 2;
let numero = 0;
/** @type {Worker | null | undefined} — `undefined` tant qu'on ne l'a pas demandé */
let travailleur;
let parLaPage = 0;

function lanceTravailleur(){
  if (travailleur !== undefined) return travailleur;
  travailleur = null;
  try {
    if (typeof TRAVAIL_DETOURAGE !== "string" || typeof Worker !== "function" ||
      typeof OffscreenCanvas !== "function" || typeof createImageBitmap !== "function") return null;
    const t = new Worker(URL.createObjectURL(new Blob([TRAVAIL_DETOURAGE], { type: "text/javascript" })));
    t.addEventListener("message", e => detoureRevenu(e.data.n, e.data.img));
    // perdu en route : ce qu'il tenait repasse par la page
    t.addEventListener("error", () => {
      travailleur = null;
      for (const a of enDetourage.values()) aDetourer.push(a);
      enDetourage.clear();
      pompe();
    });
    travailleur = t;
  } catch (e) { travailleur = null; }
  return travailleur;
}

/** Le logo de cette clé se détoure dès qu'il le peut ; il paraîtra au retour. */
function demandeDetourage(/** @type {string} */ cle, /** @type {CanvasImageSource} */ i,
  /** @type {number} */ iw, /** @type {number} */ ih){
  if (aDetourer.some(a => a.cle === cle) || [...enDetourage.values()].some(a => a.cle === cle)) return;
  aDetourer.push({ cle, i, iw, ih });
  pompe();
}

function pompe(){
  const t = lanceTravailleur();
  if (!t){
    if (!parLaPage && aDetourer.length) parLaPage = setTimeout(parLaPageSeule, 0);
    return;
  }
  while (enDetourage.size < EN_MEME_TEMPS && aDetourer.length){
    const a = /** @type {{ cle: string, i: CanvasImageSource, iw: number, ih: number }} */ (aDetourer.shift());
    const n = ++numero;
    enDetourage.set(n, a);
    createImageBitmap(/** @type {ImageBitmapSource} */ (a.i))
      .then(image => {
        if (travailleur && enDetourage.has(n)) travailleur.postMessage({ n, image }, [image]);
        else image.close();
      })
      .catch(() => detoureRevenu(n, null));
  }
}

/** Un logo par tâche, quand la page détoure elle-même. */
function parLaPageSeule(){
  parLaPage = 0;
  const a = aDetourer.shift();
  if (!a) return;
  pret(a.cle, sansFond(a.i, a.iw, a.ih));
  pompe();
}

/** Le travailleur rend un logo — ou rien, et la page le détoure elle-même. */
function detoureRevenu(/** @type {number} */ n, /** @type {ImageData | null} */ img){
  const a = enDetourage.get(n);
  if (!a) return;
  enDetourage.delete(n);
  /** @type {HTMLCanvasElement | null} */
  let t = null;
  if (img){
    t = document.createElement("canvas");
    t.width = img.width; t.height = img.height;
    const ctx = t.getContext("2d");
    if (ctx) ctx.putImageData(img, 0, 0);
    else t = null;
  }
  pret(a.cle, t || sansFond(a.i, a.iw, a.ih));
  pompe();
}

const largeurDeToile = (/** @type {number} */ iw, /** @type {number} */ largeur) => Math.max(1, Math.min(iw, Math.round(largeur)));
/** La clé de la toile d'un logo à cette largeur — le tassement dedans :
 *  passer de l'immersif au plat refait la toile. */
const cleDeToile = (/** @type {string} */ cle, /** @type {number} */ iw, /** @type {number} */ largeur, /** @type {number} */ tasse) =>
  cle + "@" + largeurDeToile(iw, largeur) + (tasse === 1 ? "" : "~");

/** Une toile de ce logo déjà rangée sur la planche gardée, à une autre
 *  finesse, la plus fine : elle tient la place de celle qui attend son tour,
 *  un peu floue ou un peu lourde, plutôt que de rendre le toit à son nom. */
function toileDejaRangee(/** @type {string} */ cle, /** @type {number} */ tasse){
  if (!gardee) return null;
  const debut = cle + "@", fin = tasse === 1 ? "" : "~";
  let mieux = null, large = 0;
  for (const k of gardee.cases.keys()){
    if (!k.startsWith(debut) || k.endsWith("~") !== (fin === "~")) continue;
    const t = toiles.get(k);
    if (t && t.width > large){ mieux = t; large = t.width; }
  }
  return mieux;
}

/** La toile d'un logo à cette largeur en pixels : détouré, puis étiré en
 *  hauteur de ce que la vue de biais lui reprendra — `tasse`, 1 à plat.
 *
 *  Le détourage se fait une fois, sur la vignette entière, et chaque finesse
 *  n'en est qu'une réduction : la refaire à chaque demi-cran de zoom coûtait
 *  un parcours de chaque logo, et détourée en petit, la vignette perdait au
 *  bord ce que la réduction avait déjà fondu. */
function toile(/** @type {string} */ cle, /** @type {CanvasImageSource} */ i,
  /** @type {number} */ iw, /** @type {number} */ ih, /** @type {number} */ largeur,
  /** @type {number} */ tasse){
  const lw = largeurDeToile(iw, largeur), k = cleDeToile(cle, iw, largeur, tasse);
  if (toiles.has(k)) return toiles.get(k) || null;
  // pas encore détouré : rien à poser, le logo paraîtra à son retour — ou à la fin du geste
  if (!detourees.has(cle)){ if (!enRetard.has(cle)) demandeDetourage(cle, i, iw, ih); return null; }
  const lh = Math.max(1, Math.round(ih * lw / iw));
  const logo = detourees.get(cle);
  // la plus récente passe en dernier
  detourees.delete(cle);
  detourees.set(cle, logo || null);
  const t = document.createElement("canvas");
  t.width = lw + 2 * MARGE;
  t.height = Math.round((lh + 2 * MARGE) / tasse);
  const ctx = t.getContext("2d");
  if (logo && ctx){
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(logo, MARGE, MARGE / tasse, lw, lh / tasse);
  }
  t.dataset.cle = k;
  toiles.set(k, logo && ctx ? t : null);
  return toiles.get(k) || null;
}

/** Les stands dont le logo est posé, d'après la dernière couche. */
/** @type {Set<string>} */
let posesDerniers = new Set();

/** Le stand montre-t-il son logo de près ? Seulement s'il est posé : un nom
 *  qui se taisait dès la vignette reçue laissait le stand vide tant que son
 *  logo se préparait, et un nom qui se taisait dès le logo prêt le laissait
 *  vide hors des abords de la vue, que la couche ne couvre pas — un stand
 *  déjà vu de près, puis quitté, restait sans nom ni logo au retour, jusqu'à
 *  ce que la vue bouge assez pour que la couche se refasse. */
export function logoPose(/** @type {any} */ s){
  return Boolean(s && s.vignette &&
    document.documentElement.classList.contains(CLASSE_LOGOS) && posesDerniers.has(s.id));
}

/**
 * Ce que le toit d'un stand pose : la grande, arrivée sans fond ; une grande
 * au fond blanc, que la page détoure ; à défaut de grande, la petite, que la
 * page détoure aussi. Rien tant que la grande est en route.
 */
function sourceDuToit(/** @type {string} */ cle){
  const g = grande(cle);
  if (g) return { cle: cle + "+g", i: g };
  if (grandes.get(cle) !== "panne") return null;
  const i = image(cle);
  return i && { cle, i };
}

/**
 * Le nom d'un stand cède la place à son logo : chaque texte et chaque pastille
 * posés pour lui depuis `depuis` se taisent au-delà du seuil, et ceux qui ne
 * paraissaient qu'au-delà disparaissent.
 */
export function cedeAuLogo(/** @type {any[]} */ liste, /** @type {number} */ depuis){
  const siens = liste.splice(depuis);
  for (const d of siens){
    if (d.z0 >= ZOOM_LOGO) continue;
    liste.push({ ...d, z1: Math.min(d.z1, ZOOM_LOGO) });
  }
}

/* ------------------------------------------------------------
   Une couche pour tous

   Une couche par logo coûtait cher : la bibliothèque paie, pour chaque
   couche et à chaque image, ses réglages, ses tampons et son dessin. Treize
   logos ajoutaient un cinquième au plan entier de Funexpo, et un grand salon
   en aurait doublé le coût. Les logos autour de la vue se rangent donc sur
   une seule planche, et un seul maillage — un carré — se répète une fois par
   logo, chacun lisant sa case de la planche.
   ------------------------------------------------------------ */

/* La planche : sa largeur, le vide entre deux cases — sans lui, les niveaux
   réduits de la texture mêlaient au bord d'un logo celui du voisin —, et son
   côté au plus, au-delà duquel les logos s'y rangent réduits. Elle s'élargit
   avant de réduire : à la finesse d'un écran dense, la centaine de logos
   autour de la vue débordait souvent la planche étroite, et la réduction
   rendait le flou qu'on venait d'ôter. */
const PLANCHE = 2048, JOINT = 6, PLANCHE_MAX = 4096;

/** Le carré d'un mètre de côté, couché, que chaque logo étire à sa taille. Le
 *  haut de l'image regarde le fond du hall, vers les y décroissants. */
const CARRE = (() => {
  const c = [[-.5, -.5, 0, 0], [.5, -.5, 1, 0], [.5, .5, 1, 1], [-.5, -.5, 0, 0], [.5, .5, 1, 1], [-.5, .5, 0, 1]];
  return { attributes: {
    positions: { value: new Float32Array(c.flatMap(([x, y]) => [x, y, 0])), size: 3 },
    normals: { value: new Float32Array(c.flatMap(() => [0, 0, 1])), size: 3 },
    texCoords: { value: new Float32Array(c.flatMap(([, , u, w]) => [u, w])), size: 2 },
  } };
})();

/* Le logo est imprimé, non éclairé : la lumière des volumes, appliquée au
   carré, ternissait ses couleurs — le rouge de RTS Chapuis tournait au brun.
   Une matière toute d'ambiance rend la couleur telle quelle. Sa brillance
   n'est pas nulle, quoique sans reflet : à zéro, le reflet se calcule en
   « pow(x, 0) », que la carte graphique ne définit pas pour un x nul ou
   négatif — une ellipse noire couvrait le logo de très près, là où la vue
   tombait dans ce cas. */
const IMPRIME = { ambient: 1, diffuse: 0, shininess: 1, specularColor: [0, 0, 0] };
/* Les niveaux réduits de la planche. Une version de la bibliothèque ne les
   fabriquait pas pour une toile qu'on lui donnait : demandés au filtrage, ils
   restaient vides, et dès que le toit fuyait assez, le logo virait au noir
   passé un arc de cercle. La 9.3 les fabrique, et la planche gardée les
   recalcule à chaque pose (`range`) : le filtrage peut les lire.

   Vu de biais, un toit se réduit plus en profondeur qu'en largeur ; le
   filtrage ordinaire lisse alors le logo dans les deux sens, à la mesure du
   plus réduit, et le logo paraissait flou dès le seuil franchi, quand le
   toit est encore petit et fuyant. Le filtrage anisotrope, que presque
   toutes les cartes graphiques offrent, ne lisse que dans le sens où l'image
   se tasse. */
const FILTRAGE = { minFilter: "linear", magFilter: "linear" };
const ANISOTROPE = 8;
/** Le filtrage, anisotrope si la carte graphique le sait faire. La question
 *  active l'extension, que la bibliothèque n'active pas d'elle-même. */
const filtrage = (/** @type {any} */ appareil) => {
  try {
    if (appareil && appareil.features && appareil.features.has("texture-filterable-anisotropic-webgl"))
      return { ...FILTRAGE, maxAnisotropy: ANISOTROPE };
  } catch (e) { /* une bibliothèque qui ne sait pas répondre : le filtrage ordinaire */ }
  return FILTRAGE;
};

/** La dernière planche posée : on ne la refait que si les logos changent.
 *  Ses cases se rangent par clé de toile, et non par toile : une toile
 *  oubliée sous le seuil se refait à l'identique sous la même clé quand on
 *  revient, et la planche gardée, qui la connaissait sous son ancien objet,
 *  n'y trouvait plus sa case — chaque logo peignait alors la planche entière. */
/** @type {{ cle: string, toile: HTMLCanvasElement, cases: Map<string, number[]> } | null} */
let planche = null;

/** La planche de ces toiles : une rangée après l'autre, de gauche à droite. */
function plancheDe(/** @type {HTMLCanvasElement[]} */ toiles){
  const cle = toiles.map(t => t.dataset.cle).join("|");
  if (planche && planche.cle === cle) return planche;
  const place = (/** @type {number} */ k, /** @type {number} */ large) => {
    /** @type {Map<HTMLCanvasElement, number[]>} */
    const cases = new Map();
    let x = 0, y = 0, rangee = 0;
    for (const t of toiles){
      const w = Math.ceil(t.width * k), h = Math.ceil(t.height * k);
      if (x + w + JOINT > large){ x = 0; y += rangee + JOINT; rangee = 0; }
      cases.set(t, [x + JOINT, y + JOINT, w, h]);
      x += w + JOINT; rangee = Math.max(rangee, h);
    }
    return { cases, haut: y + rangee + 2 * JOINT };
  };
  let large = PLANCHE, r = place(1, large);
  if (r.haut > PLANCHE_MAX){ large = PLANCHE_MAX; r = place(1, large); }
  // trop haute encore, la planche se refait réduite d'autant
  if (r.haut > PLANCHE_MAX) r = place(PLANCHE_MAX / r.haut * .98, large);
  const toile = document.createElement("canvas");
  toile.width = large; toile.height = Math.max(1, r.haut);
  const ctx = toile.getContext("2d");
  if (ctx){ ctx.imageSmoothingQuality = "high"; for (const [t, c] of r.cases) ctx.drawImage(t, c[0], c[1], c[2], c[3]); }
  // la case de chaque logo, en fractions de la planche
  /** @type {Map<string, number[]>} */
  const cases = new Map();
  for (const [t, c] of r.cases) cases.set(t.dataset.cle || "", [c[0] / toile.width, c[1] / toile.height, c[2] / toile.width, c[3] / toile.height]);
  return (planche = { cle, toile, cases });
}

/* Ce que la couche ajoute au maillage : la case que chaque logo lit sur la
   planche, et le fondu au zoom — la couche reste la même d'une image à
   l'autre, seule l'échelle de la projection change. Un objet créé une fois :
   la bibliothèque compare ses extensions par identité. */
/** @type {any} */
let PLANCHE_EXT = null;
function extensionPlanche(/** @type {any} */ L){
  if (PLANCHE_EXT) return PLANCHE_EXT;
  class CasesEtFondu extends L.LayerExtension {
    getShaders(){
      return {
        inject: {
          "vs:#decl": "in vec4 instanceCaseLogo;\nout float vFonduZoom;",
          "vs:#main-end": "vTexCoord = instanceCaseLogo.xy + vTexCoord * instanceCaseLogo.zw;\n" +
            "vFonduZoom = smoothstep(" + ZOOM_FONDU.toFixed(4) + ", " + ZOOM_LOGO.toFixed(4) + ", log2(project.scale));",
          "fs:#decl": "in float vFonduZoom;",
          // effacé, il ne se vise plus : un appui le traverse jusqu'au stand
          "fs:DECKGL_FILTER_COLOR": "color.a *= vFonduZoom;\nif (color.a < 0.02) discard;",
        },
      };
    }
    initializeState(){
      const am = this.getAttributeManager();
      if (am) am.addInstanced({ instanceCaseLogo: { size: 4, accessor: "getCaseLogo" } });
    }
  }
  CasesEtFondu.extensionName = "CasesEtFondu";
  CasesEtFondu.defaultProps = { getCaseLogo: { type: "accessor", value: [0, 0, 1, 1] } };
  return (PLANCHE_EXT = [new CasesEtFondu()]);
}

/* ------------------------------------------------------------
   La planche gardée

   La planche se refaisait entière dès qu'un seul logo changeait : une toile
   neuve, que la bibliothèque envoyait à la carte graphique comme une texture
   neuve — jusqu'à quatre mille pixels de côté, soixante-quatre mégaoctets et
   le tiers de plus pour ses niveaux réduits, alloués, remplis puis
   recalculés —, avant de rendre l'ancienne. Une apparition massive en
   faisait autant que de logos arrivés, et chaque déplacement hors des
   abords de la vue une de plus, pour une planche aux neuf dixièmes
   inchangée. Ce sont les saccades des appareils modestes.

   La texture est donc créée une fois et gardée : chaque logo neuf y prend
   une case, seule envoyée ; une case dont le logo n'est plus posé reste
   remplie, et sert telle quelle si l'on revient vers lui, jusqu'à ce qu'un
   autre ait besoin de la place. Sa taille ne dépasse pas celle que la planche
   atteignait déjà : elle commence petite et ne double que si la vue en
   demande plus — c'est alors la seule fois où tout se renvoie. Au-delà, la
   planche d'autrefois, réduite (`plancheDe`), reste le recours.

   Les niveaux réduits se recalculent une fois par pose, quel que soit le
   nombre de cases envoyées : la bibliothèque les faisait aussi, et le logo
   se lit de même.
   ------------------------------------------------------------ */

/* Ses tailles successives, jamais au-delà de ce que la carte graphique
   accepte. */
const TAILLES_PLANCHE = [[PLANCHE, 1024], [PLANCHE, PLANCHE], [PLANCHE, PLANCHE_MAX], [PLANCHE_MAX, PLANCHE_MAX]];
/* Reculé sous le seuil, la planche attend ce temps avant de rendre sa
   mémoire : un zoom qui hésite autour du seuil retrouve ses logos sans rien
   renvoyer, et la vue d'ensemble, qui n'en montre aucun, ne la garde pas. */
const OUBLI_PLANCHE = 30_000;
/* Ce qu'une pose envoie au plus : les plus proches du centre d'abord, le
   reste à l'image suivante. Le stand garde son nom en attendant. Douze au
   repos, puis sept poses pour une centaine de logos : sur un poste de bureau
   chargé (`?perf`, FEP27, 14 octobre 2026), ils paraissaient plus lentement
   qu'avec la planche refaite d'un coup. Le repos en prend donc assez pour
   une vue en deux poses ; le geste, qui ne doit rien attendre, peu. */
const ENVOIS_AU_REPOS = 48, MS_AU_REPOS = 12, ENVOIS_EN_GESTE = 12, MS_EN_GESTE = 6;

/** @typedef {{ x: number, y: number, w: number, h: number }} Case */
/**
 * @typedef {object} Planche
 * @property {any} appareil la carte graphique qui la tient
 * @property {any} tex la texture
 * @property {number} large
 * @property {number} haut
 * @property {number} rang dans `TAILLES_PLANCHE`
 * @property {Map<string, Case>} cases par clé de toile
 * @property {Case[]} libres les cases rendues, à reprendre
 * @property {{ y: number, h: number, x: number }[]} etageres
 * @property {number} bas le haut de la prochaine étagère
 */
/** @type {Planche | null} */
let gardee = null;
let poseN = 0, minuterieOubli = 0;

/** Ce que la planche a coûté depuis l'ouverture — lu par le relevé `?perf`.
 *  Des comptes, non des mesures : la mémoire de la carte graphique ne se lit
 *  pas, on n'en connaît que ce qu'on lui a demandé. */
export const COMPTES_LOGOS = { textures: 0, agrandissements: 0, rangements: 0, envois: 0, octetsEnvoyes: 0,
  niveauxReduits: 0, recours: 0, octetsTexture: 0, poses: 0, enAttente: 0 };

/* Combien de toiles la plus grande planche n'a pas su tenir : tant que la vue
   en demande autant, la planche d'autrefois sert d'emblée. Sans cela, chaque
   pose refaisait les planches gardées de toutes les tailles avant d'y
   renoncer. */
let tropDeToiles = Infinity;

/** La planche rend sa texture, et les toiles qu'elle seule gardait — sauf
 *  pour la planche d'autrefois, qui les reprend aussitôt. */
function rendPlanche(garderToiles = false){
  clearTimeout(minuterieOubli); minuterieOubli = 0;
  if (gardee) try { gardee.tex.destroy(); } catch (e) { /* contexte déjà perdu */ }
  gardee = null;
  COMPTES_LOGOS.octetsTexture = 0;
  if (!garderToiles) toiles.clear();
}

/** Les tailles que cette carte graphique accepte. */
function taillesDe(/** @type {any} */ appareil){
  const max = (appareil.limits && appareil.limits.maxTextureDimension2D) || PLANCHE;
  return TAILLES_PLANCHE.filter(([w, h]) => w <= max && h <= max);
}

/** Le premier rang où ces toiles tiennent sans doute, d'après leur aire et
 *  un quart de plus pour le jeu des étagères. Partie de la plus petite, la
 *  planche d'une vue de FEP27 a grandi deux fois et s'est rangée à neuf
 *  quatre — autant d'envois complets. */
function rangPour(/** @type {any} */ appareil, /** @type {HTMLCanvasElement[]} */ voulues){
  const aire = 1.25 * voulues.reduce((a, t) => a + (t.width + 2 * JOINT) * (t.height + 2 * JOINT), 0);
  const tailles = taillesDe(appareil);
  const i = tailles.findIndex(([w, h]) => w * h >= aire);
  return i < 0 ? Math.max(0, tailles.length - 1) : i;
}

/** Une planche neuve, vide, à ce rang de taille ; rien si la carte graphique
 *  ne la sait pas faire. */
function nouvellePlanche(/** @type {any} */ appareil, /** @type {number} */ rang){
  const tailles = taillesDe(appareil);
  if (rang >= tailles.length) return null;
  const [large, haut] = tailles[rang];
  try {
    const tex = appareil.createTexture({ width: large, height: haut, format: "rgba8unorm",
      mipLevels: appareil.getMipLevelCount(large, haut),
      // ce que la bibliothèque posait d'elle-même, et le filtrage d'ici
      sampler: { addressModeU: "clamp-to-edge", addressModeV: "clamp-to-edge", mipmapFilter: "linear", ...filtrage(appareil) } });
    COMPTES_LOGOS.textures++;
    COMPTES_LOGOS.octetsTexture = Math.round(large * haut * 4 * 4 / 3);
    return { appareil, tex, large, haut, rang, cases: new Map(), libres: [], etageres: [], bas: 0 };
  } catch (e) { return null; }
}

/** Une place de `w` sur `h` sur la planche, joints compris : une case rendue
 *  qui ne gâche pas plus qu'elle ne sert, une étagère de sa hauteur, ou une
 *  étagère neuve. Rien si la planche est pleine. */
function place(/** @type {Planche} */ pl, /** @type {number} */ w, /** @type {number} */ h){
  let k = -1, perte = w * h;
  pl.libres.forEach((c, i) => {
    if (c.w >= w && c.h >= h && c.w * c.h - w * h <= perte){ perte = c.w * c.h - w * h; k = i; }
  });
  if (k >= 0) return pl.libres.splice(k, 1)[0];
  for (const e of pl.etageres){
    if (h <= e.h && h >= e.h * .6 && e.x + w <= pl.large){ const c = { x: e.x, y: e.y, w, h: e.h }; e.x += w; return c; }
  }
  if (pl.bas + h > pl.haut || w > pl.large) return null;
  pl.etageres.push({ y: pl.bas, h, x: w });
  pl.bas += h;
  return { x: 0, y: pl.bas - h, w, h };
}

/** La toile envoyée dans sa case, le reste de la case vidé : une case
 *  reprise garde sinon le bord du logo d'avant, que les niveaux réduits
 *  mêleraient au nouveau. */
let toileEnvoi = /** @type {HTMLCanvasElement | null} */ (null);
function envoie(/** @type {Planche} */ pl, /** @type {Case} */ c, /** @type {HTMLCanvasElement} */ t){
  const e = toileEnvoi || (toileEnvoi = document.createElement("canvas"));
  e.width = c.w; e.height = c.h;
  const ctx = e.getContext("2d");
  if (!ctx) return false;
  ctx.clearRect(0, 0, c.w, c.h);
  ctx.drawImage(t, JOINT, JOINT);
  pl.tex.copyExternalImage({ image: e, x: c.x, y: c.y, width: c.w, height: c.h });
  COMPTES_LOGOS.envois++;
  COMPTES_LOGOS.octetsEnvoyes += c.w * c.h * 4;
  return true;
}

/** Chaque toile voulue dans sa case : celles déjà rangées n'envoient rien.
 *  Rend faux si elles n'y tiennent pas, même planche vidée et agrandie. */
function range(/** @type {Planche} */ pl, /** @type {HTMLCanvasElement[]} */ voulues){
  const enJeu = new Set(voulues.map(t => t.dataset.cle || ""));
  let envoye = false, vide = false;
  for (const t of voulues){
    const cle = t.dataset.cle || "";
    if (pl.cases.has(cle)) continue;
    // le joint des deux côtés, dans la case même : elle se vide avec elle
    const w = t.width + 2 * JOINT, h = t.height + 2 * JOINT;
    let c = place(pl, w, h);
    if (!c && !vide){
      // les cases des logos qui ne sont plus posés cèdent leur place, toutes à la fois
      vide = true;
      for (const [k, v] of [...pl.cases]){
        if (enJeu.has(k)) continue;
        pl.cases.delete(k); pl.libres.push(v); toiles.delete(k);
      }
      c = place(pl, w, h);
    }
    if (!c) return false;
    if (!envoie(pl, c, t)){ pl.libres.push(c); return false; }
    pl.cases.set(cle, c);
    envoye = true;
  }
  if (envoye){ pl.tex.generateMipmapsWebGL(); COMPTES_LOGOS.niveauxReduits++; }
  return true;
}

/**
 * La planche gardée, chaque toile voulue rangée dedans. Pleine même vidée,
 * elle se refait — rangée à neuf, puis plus grande — et tout se renvoie : le
 * seul cas où la pose coûte ce qu'elle coûtait toujours. Rien quand la carte
 * graphique ne s'y prête pas, ou que la plus grande n'y suffit pas : la
 * planche d'autrefois prend le relais.
 */
function plancheGardee(/** @type {any} */ appareil, /** @type {HTMLCanvasElement[]} */ voulues){
  if (!appareil || typeof appareil.createTexture !== "function") return null;
  clearTimeout(minuterieOubli); minuterieOubli = 0;
  // la carte graphique a changé — un contexte perdu, puis rendu
  if (gardee && gardee.appareil !== appareil) rendPlanche();
  if (voulues.length >= tropDeToiles * .8) return null;
  tropDeToiles = Infinity;
  poseN++;
  if (!gardee) gardee = nouvellePlanche(appareil, rangPour(appareil, voulues));
  if (!gardee) return null;
  if (range(gardee, voulues)) return gardee;
  /* Vidée, elle ne tient pas encore : rangée à neuf à sa taille, les cases
     éparses s'étant peut-être émiettées, puis plus grande. */
  for (let rang = gardee.rang; ; rang = Math.max(rang + 1, rangPour(appareil, voulues))){
    const avant = gardee;
    const pl = rang === avant.rang ? { ...avant, cases: new Map(), libres: [], etageres: [], bas: 0 }
      : nouvellePlanche(appareil, rang);
    if (!pl) break;
    if (pl !== avant && pl.tex !== avant.tex){ try { avant.tex.destroy(); } catch (e) { /* perdu */ } COMPTES_LOGOS.agrandissements++; }
    else COMPTES_LOGOS.rangements++;
    gardee = pl;
    if (range(pl, voulues)) return pl;
  }
  COMPTES_LOGOS.recours++;
  tropDeToiles = voulues.length;
  rendPlanche(true);
  return null;
}

/** Sous le seuil, la planche attend un peu, puis rend sa mémoire. */
function oubliePlancheBientot(){
  if (!gardee || minuterieOubli) return;
  minuterieOubli = setTimeout(rendPlanche, OUBLI_PLANCHE);
}

/* Ce que les logos posés couvrent : le cadre à plat, marge comprise, ou rien
   sous le seuil. */
/** @type {{ x0: number, y0: number, x1: number, y1: number } | null} */
let couvert = null;
/* La finesse à laquelle ils ont été posés, et le zoom de la dernière image
   vue, que la fin d'un geste relit (`geleLogos`). */
let finesseCouverte = 0, zoomVu = 0;
const pres = (/** @type {number} */ zoom) => zoom >= ZOOM_FONDU - .5;

/**
 * Le sol que l'écran montre, en mètres du plan. À plat, l'écran entier — un
 * peu plus que la vue quand ses proportions ne sont pas celles du cadre. En
 * vue immersive, bien plus : le fond du hall recule vers l'horizon, et la
 * couche, bornée au cadre à plat, laissait sans logo tout le haut de l'écran.
 * Jamais plus de deux vues de chaque côté : vers l'horizon, l'étendue
 * deviendrait sans fin pour des stands qu'on n'y distingue plus.
 * @param {{ x: number, y: number, w: number, h: number }} v le cadre à plat
 */
function solVu(v){
  const r = cadrePlan(), W = r.width || 1, H = r.height || 1;
  const s = Math.min(W / v.w, H / v.h), cx = v.x + v.w / 2, cy = v.y + v.h / 2;
  const coins = [[0, 0], [W, 0], [W, H], [0, H]].map(([x, y]) => ecranVersPlat(x, y, W, H));
  const xs = coins.map(q => cx + (q[0] - W / 2) / s), ys = coins.map(q => cy + (q[1] - H / 2) / s);
  const borne = 2 * Math.max(v.w, v.h);
  const x0 = Math.max(Math.min(...xs, v.x), v.x - borne), y0 = Math.max(Math.min(...ys, v.y), v.y - borne);
  const x1 = Math.min(Math.max(...xs, v.x + v.w), v.x + v.w + borne), y1 = Math.min(Math.max(...ys, v.y + v.h), v.y + v.h + borne);
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

/**
 * La vue a-t-elle quitté ce que les logos posés couvrent ? Appelée à chaque
 * image d'un geste : deux comparaisons, et rien d'autre.
 * @param {{ x: number, y: number, w: number, h: number }} v le cadre à plat
 * @param {number} zoom
 */
export function logosARevoir(v, zoom){
  zoomVu = zoom;
  if (!document.documentElement.classList.contains(CLASSE_LOGOS)) return false;
  if (!pres(zoom)) return couvert !== null;
  if (!couvert) return true;
  const sol = solVu(v);
  if (sol.x < couvert.x0 || sol.y < couvert.y0 || sol.x + sol.w > couvert.x1 || sol.y + sol.h > couvert.y1) return true;
  // la finesse attend la fin du geste (`geleLogos`)
  return !gele && finesse(zoom) !== finesseCouverte;
}

/* Les stands du plan par identifiant. Relus à chaque image tant qu'un volume
   bouge, ils se gardent ; un plan remonté a d'autres éléments, et les relit. */
/** @type {Map<string, Element>} */
let groupes = new Map();
function groupe(/** @type {string} */ id){
  const g = groupes.get(id);
  if (g && g.isConnected) return g;
  groupes = new Map();
  $("stands").querySelectorAll("g.stand[data-id]").forEach(e => groupes.set(e.getAttribute("data-id") || "", e));
  return groupes.get(id);
}

/** Ce qui n'est plus posé s'oublie : toutes les toiles d'avant, et les
 *  vignettes détourées au-delà de celles qu'on garde, les plus anciennes
 *  d'abord. */
function oublie(/** @type {{ t: HTMLCanvasElement }[]} */ data){
  const posees = new Set(data.map(d => d.t.dataset.cle));
  // une toile rangée sur la planche gardée reste : elle s'y renverrait si la planche se refait
  for (const k of [...toiles.keys()]) if (!posees.has(k) && !(gardee && gardee.cases.has(k))) toiles.delete(k);
  /* Reculé sous le seuil, rien n'est posé, et tout devenait oubliable : les
     grandes, décodées d'avance, se fermaient jusqu'au budget, et le zoom
     suivant les redemandait au service, huit à la fois — les logos
     reparaissaient un à un, comme la première fois. Elles attendent donc
     qu'une vue de près en pose d'autres pour céder leur place. */
  if (!posees.size) return;
  const enJeu = new Set([...posees].map(k => (k || "").slice(0, (k || "").lastIndexOf("@"))));
  /* Une image arrivée sans fond, gardée telle quelle, ne coûte rien de plus ;
     décodée d'avance, elle tient ses pixels comme une toile. Oubliée, elle se
     redemande au navigateur, qui l'a gardée, et se redécode. */
  const pese = (/** @type {any} */ d) => typeof ImageBitmap !== "undefined" && d instanceof ImageBitmap ? d
    : d instanceof HTMLCanvasElement ? d : null;
  let pixels = 0;
  for (const d of detourees.values()){ const t = pese(d); if (t) pixels += t.width * t.height; }
  for (const [cle, d] of [...detourees]){
    if (pixels <= PIXELS_GARDES) break;
    const t = pese(d);
    if (enJeu.has(cle) || (d && !t)) continue;
    detourees.delete(cle);
    if (!t) continue;
    pixels -= t.width * t.height;
    if (t instanceof HTMLCanvasElement) continue;
    t.close();
    if (cle.endsWith("+g")) grandes.delete(cle.slice(0, -2));
  }
}

/** Les noms suivent les logos posés : si la couche en pose d'autres que la
 *  dernière fois, ils doivent se refaire — un nom se tait devant un logo qui
 *  vient d'être posé, et revient là où la couche n'en pose plus. */
function annoncePoses(/** @type {{ id: string }[]} */ data){
  const ids = new Set(data.map(d => d.id));
  if (ids.size === posesDerniers.size && [...ids].every(id => posesDerniers.has(id))) return;
  posesDerniers = ids;
  PANNEAU_PRET.dis();
}

/**
 * La couche des logos : un carré par logo autour de la vue, tous peints
 * d'une planche.
 * @param {any} L la bibliothèque
 * @param {(el: Element) => number} hauteurDe la hauteur du volume d'un tracé de stand
 * @param {{ x: number, y: number, w: number, h: number }} v le cadre à plat
 * @param {number} zoom
 * @param {any} [appareil] la carte graphique, telle que la bibliothèque la tient
 * @param {((x: number, y: number, z: number) => number) | null} [pointsParMetre] les points d'écran
 *   que fait un mètre du plan, à cet endroit et à cette hauteur ; sans, la finesse du zoom
 */
export function couchesLogos(L, hauteurDe, v, zoom, appareil, pointsParMetre = null){
  const p = P();
  couvert = null;
  // celles qui n'ont pas pris la route se rangent à nouveau, d'après cette vue
  fileGrandes.length = 0;
  if (!p || !document.documentElement.classList.contains(CLASSE_LOGOS) || !pres(zoom)){
    oublie([]); annoncePoses([]); oubliePlancheBientot(); return [];
  }
  const sol = solVu(v), cote = Math.max(v.w, v.h);
  const autour = (/** @type {number} */ k) => ({ x0: sol.x - cote * k, y0: sol.y - cote * k, x1: sol.x + sol.w + cote * k, y1: sol.y + sol.h + cote * k });
  const dedans = (/** @type {any} */ b, /** @type {number[]} */ c) => c[0] >= b.x0 && c[0] <= b.x1 && c[1] >= b.y0 && c[1] <= b.y1;
  couvert = autour(MARGE_VUE);
  const loin = autour(MARGE_PRECHARGE);
  if (!gele || !finesseCouverte) finesseCouverte = finesse(zoom);
  const enVolume = cameraEnJeu(), tasse = tassement(), densite = Math.min(3, window.devicePixelRatio || 1);
  // du centre de la vue vers ses bords : les grandes se demandent dans cet ordre
  const vx = v.x + v.w / 2, vy = v.y + v.h / 2;
  const autourDeLaVue = (p.stands || []).filter((/** @type {any} */ s) => s.vignette && s.c && dedans(loin, s.c))
    .map((/** @type {any} */ s) => ({ s, d: (s.c[0] - vx) ** 2 + (s.c[1] - vy) ** 2 })).sort((a, b) => a.d - b.d);
  const data = [], vus = new Set();
  /* Les toiles neuves de cette pose — chacune à envoyer — et leur temps. Au-
     delà, un logo garde la toile qu'il avait, ou attend la pose suivante. */
  let faites = 0, msFaites = 0, attente = 0;
  for (const { s } of autourDeLaVue){
    if (vus.has(s.id)) continue;
    if (!dedans(couvert, s.c)){ grande(s.vignette); continue; }
    const [cx, cy] = s.c;
    const g = groupe(s.id), trace = g && g.firstElementChild;
    const src = trace && sourceDuToit(s.vignette);
    if (!src) continue;
    vus.add(s.id);
    const [iw, ih] = src.i instanceof HTMLImageElement ? [src.i.naturalWidth, src.i.naturalHeight] : [src.i.width, src.i.height];
    // le toit, d'après la boîte du stand : le logo en suit les côtés
    const bb = s.bb || [0, 0];
    const rapport = iw / (ih / tasse);
    // l'exploitant l'a peut-être déplacé ou retaillé, là où la boîte trompe (`libelle-place.mjs`)
    const reg = placementLogo(s), k = reg && reg.k > 0 ? reg.k : 1;
    const prof = Math.min(bb[1] * PART_DU_TOIT, bb[0] * PART_DU_TOIT / rapport, LARGEUR_MAX / rapport) * k;
    if (!(prof > 0)) continue;
    const large = prof * rapport;
    const x = cx + (reg ? +reg.dx || 0 : 0), y = cy + (reg ? +reg.dy || 0 : 0);
    /* Sur le toit, un rien au-dessus pour ne pas s'y confondre. À plat, au
       sol même : la vue d'en haut tient tout le plan à la hauteur zéro, et
       ce rien suffisait à sortir le logo de ce qu'elle montre. */
    const z = enVolume ? hauteurDe(trace) + .05 : 0;
    /* Mesuré au sol que l'écran montre : un logo des abords prend l'échelle
       du bord le plus proche. Mesuré à sa place, derrière la caméra quand les
       abords y débordent, il rendait une échelle sans fin. */
    const pts = pointsParMetre
      ? pointsParMetre(Math.min(Math.max(x, sol.x), sol.x + sol.w), Math.min(Math.max(y, sol.y), sol.y + sol.h), z) : 0;
    const voulue = pts > 0 && isFinite(pts) ? palier(large * pts * densite) : Math.max(PIXELS_MIN, large * finesseCouverte);
    let t = toiles.get(cleDeToile(src.cle, iw, voulue, tasse));
    // pendant un geste, un logo déjà rangé garde sa toile : la juste finesse attend sa fin
    if (t === undefined && gele) t = toileDejaRangee(src.cle, tasse) || undefined;
    if (t === undefined){
      if (faites >= (gele ? ENVOIS_EN_GESTE : ENVOIS_AU_REPOS) || msFaites > (gele ? MS_EN_GESTE : MS_AU_REPOS)){
        t = toileDejaRangee(src.cle, tasse); attente++;
      }
      else {
        const t0 = performance.now();
        t = toile(src.cle, src.i, iw, ih, voulue, tasse);
        if (t){ faites++; msFaites += performance.now() - t0; }
      }
    }
    if (!t) continue;
    data.push({ x, y, z, large, prof, t, el: g, id: s.id,
      // attrapé par l'outil de placement, et lui seul : hors de ce mode, un appui ouvre la fiche
      lbl: PLACE_LIBELLES ? PREFIXE_LOGO + s.id : null });
  }
  oublie(data);
  annoncePoses(data);
  COMPTES_LOGOS.poses++;
  COMPTES_LOGOS.enAttente = attente;
  // le reste à la pose suivante — ou à la fin du geste
  if (attente) annoncePret();
  if (!data.length) return [];
  // du centre vers les bords : les plus proches prennent les premières cases
  const voulues = [...new Set(data.map(d => d.t))];
  const gp = plancheGardee(appareil, voulues);
  /** @type {any} */
  let texture, cleCases;
  /** @type {(t: HTMLCanvasElement) => number[] | undefined} */
  let caseDe;
  if (gp){
    texture = gp.tex; cleCases = "g" + poseN;
    caseDe = t => {
      const c = gp.cases.get(t.dataset.cle || "");
      return c && [(c.x + JOINT) / gp.large, (c.y + JOINT) / gp.haut, t.width / gp.large, t.height / gp.haut];
    };
  } else {
    // dans un ordre fixe, pour qu'une même vue retrouve la même planche
    const pl = plancheDe(voulues.sort((a, b) => (a.dataset.cle || "").localeCompare(b.dataset.cle || "")));
    texture = pl.toile; cleCases = pl.cle;
    caseDe = t => pl.cases.get(t.dataset.cle || "");
  }
  return [new L.SimpleMeshLayer({ id: "logos-stands", data, mesh: CARRE, texture, pickable: true,
    material: IMPRIME, textureParameters: filtrage(appareil), extensions: extensionPlanche(L),
    /* À plat, tout est à la même hauteur : la profondeur départagerait le
       logo et son stand au hasard. L'ordre des couches suffit — il se peint
       après les stands, avant les noms. */
    ...(enVolume ? {} : { parameters: { depthCompare: "always", depthWriteEnabled: false } }),
    getPosition: (/** @type {any} */ d) => [d.x, d.y, d.z],
    getScale: (/** @type {any} */ d) => [d.large, d.prof, 1],
    getOrientation: [0, 0, 0],
    getCaseLogo: (/** @type {any} */ d) => caseDe(d.t) || [0, 0, 1, 1],
    updateTriggers: { getCaseLogo: cleCases } })];
}
