/* ============================================================
   Les logos sur les stands — la vue immersive, vue de près

   De loin, le hall se lit par ses volumes et ses noms. Quand on s'approche,
   l'enseigne d'un stand dit plus vite que son nom qui l'occupe : son logo se
   pose alors à plat sur le toit du stand, imprimé comme une enseigne peinte,
   sans plaque ni bord, et le nom lui cède la place.

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

   Seules les vignettes déjà reçues par lot (`vignettes.mjs`) font un logo :
   recadrées à la synchronisation, elles pèsent quelques kilo-octets, et le lot
   est déjà parti au démarrage. Sans vignette, le stand garde son nom.

   Le logo d'origine, deux à quatre fois plus fin, a été demandé un temps à
   sa source de très près : il pèse jusqu'à deux mégaoctets, et le gain ne
   valait pas ce chargement pour un toit. La vignette sert à tous les zooms.
   ============================================================ */
import { $ } from "./dom.mjs";
import { P } from "./donnees.mjs";
import { cameraEnJeu, SINUS_INCLINAISON } from "./camera.mjs";
import { VIGNETTES, VIGNETTES_ARRIVEES } from "./vignettes.mjs";
import { creeAnnonce } from "./annonce.mjs";

/** La classe que la racine porte quand l'option est prise en vue immersive. */
export const CLASSE_LOGOS = "logos-stands";

/* Le seuil, en zoom de la carte graphique — le logarithme des pixels par
   mètre. Au-delà, le nom d'un stand qui a un logo se tait ; le logo, lui,
   paraît sur le dernier quart de cran qui y mène, pour que le stand ne reste
   jamais vide entre les deux. */
const ZOOM_LOGO = Math.log2(16), ZOOM_FONDU = ZOOM_LOGO - .25;

/* La part du toit que le logo occupe, dans un sens comme dans l'autre. */
const PART_DU_TOIT = .82;
/* Au-delà, un logo de grand stand d'angle ne gagne plus rien à grandir. */
const LARGEUR_MAX = 12;

/* La finesse du logo, en pixels de sa toile par mètre de toit. Réduites à
   256 pixels, les vignettes — 600 de large — se lisaient en escalier dès
   qu'on s'approchait ; à cette finesse, un logo de quatre mètres garde deux
   cents pixels, et la vignette entière dès douze mètres. Jamais plus que
   ce qu'elle porte : l'agrandir n'inventerait aucun détail. */
const PIXELS_PAR_METRE = 50, PIXELS_MIN = 96;
/* Un rien de marge vide autour du logo, pour que ses bords ne se coupent pas
   net. */
const MARGE = 2;
/* Le logo est imprimé sur le toit, sans plaque ni bord : le fond blanc que
   la plupart des vignettes portent est retiré, à partir de leur pourtour. Un
   pixel compte pour du fond au-dessus de ce clair, et s'efface tout à fait
   au-dessus du second ; entre les deux, il s'estompe, pour que le contour du
   logo ne crénelle pas. */
const CLAIR_FOND = 225, BLANC_FOND = 245;
/* Couchée sur le sol incliné, une image se tasse en hauteur d'autant que le
   hall fuit. Le logo est donc dessiné étiré d'autant : vu de biais, il
   reprend ses proportions. Le compte est juste de face, et reste bon aux
   quelques degrés de cap qu'un hall prend d'ordinaire. */
const TASSEMENT = Math.sqrt(1 - SINUS_INCLINAISON * SINUS_INCLINAISON);

/* Seuls les logos autour de la vue se posent. Une texture par logo, à pleine
   finesse : les cinq cents d'un salon comme Franchise Expo tiendraient des
   centaines de mégaoctets de carte graphique, et une seule texture pour tous
   passerait la taille qu'elle accepte. La vue ne montre de près que quelques
   dizaines de stands ; on pose ceux-là et leurs voisins, d'une demi-vue de
   chaque côté, et l'on repose quand la vue sort de cette marge. Reculée sous
   le seuil, plus aucun : leurs textures sont rendues. */
const MARGE_VUE = .5;

/** Un logo vient d'être prêt : le dessin doit le poser, et le nom du stand
 *  lui céder la place. */
export const PANNEAU_PRET = creeAnnonce();
VIGNETTES_ARRIVEES.suis(() => PANNEAU_PRET.dis());

/** Les vignettes décodées, par clé. */
/** @type {Map<string, "attente" | "panne" | HTMLImageElement>} */
const images = new Map();
/** Les toiles prêtes à poser, par clé et par finesse. */
/** @type {Map<string, HTMLCanvasElement | null>} */
const toiles = new Map();

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
    PANNEAU_PRET.dis();
  };
  i.onerror = () => images.set(cle, "panne");
  i.src = src;
  return null;
}

/**
 * Le logo à cette largeur, son fond retiré.
 *
 * Seul le clair qui touche le pourtour, de proche en proche, est du fond : le
 * blanc d'une lettre ou d'un motif, enclos dans le logo, reste. Un logo déjà
 * détouré n'a rien de clair au bord, et passe tel quel.
 */
function sansFond(/** @type {CanvasImageSource} */ i, /** @type {number} */ w, /** @type {number} */ h){
  const toile = document.createElement("canvas");
  toile.width = w; toile.height = h;
  const ctx = toile.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(i, 0, 0, w, h);
  const img = ctx.getImageData(0, 0, w, h), px = img.data;
  const clarte = (/** @type {number} */ k) => px[k * 4 + 3] < 16 ? 255 : Math.min(px[k * 4], px[k * 4 + 1], px[k * 4 + 2]);
  const vu = new Uint8Array(w * h), file = [];
  for (let x = 0; x < w; x++) file.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y++) file.push(y * w, y * w + w - 1);
  while (file.length){
    const k = /** @type {number} */ (file.pop());
    if (vu[k]) continue;
    vu[k] = 1;
    const c = clarte(k);
    if (c < CLAIR_FOND) continue;
    // le fond s'efface, son liseré s'estompe
    px[k * 4 + 3] = Math.round(px[k * 4 + 3] * Math.max(0, Math.min(1, (BLANC_FOND - c) / (BLANC_FOND - CLAIR_FOND))));
    const x = k % w;
    if (x > 0) file.push(k - 1);
    if (x < w - 1) file.push(k + 1);
    if (k >= w) file.push(k - w);
    if (k < w * (h - 1)) file.push(k + w);
  }
  /* Le bord. Un pixel du contour mêle la couleur du logo au blanc du fond :
     laissé tel quel, il dessinait un liseré clair et crénelé sur le toit. On
     défait ce mélange — sa part de blanc devient de la transparence, et sa
     couleur redevient celle du logo, que le plus foncé de ses voisins dit —,
     sur deux pixels de profondeur. */
  const fond = (/** @type {number} */ k) => vu[k] === 1 && px[k * 4 + 3] < 255 * .5;
  // seuls les pixels à deux pas du fond au plus : sur un logo d'origine, tous
  // les parcourir avec leurs vingt-cinq voisins figeait la page
  const bord = new Uint8Array(w * h);
  for (let k = 0; k < w * h; k++){
    if (!fond(k)) continue;
    const x0 = k % w, y0 = (k - x0) / w;
    // un fond qui ne touche pas le logo n'a pas de bord autour de lui
    if (!((x0 > 0 && !fond(k - 1)) || (x0 < w - 1 && !fond(k + 1)) ||
      (y0 > 0 && !fond(k - w)) || (y0 < h - 1 && !fond(k + w)))) continue;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++){
      const xx = x0 + dx, yy = y0 + dy;
      if (xx >= 0 && yy >= 0 && xx < w && yy < h) bord[yy * w + xx] = 1;
    }
  }
  for (let k = 0; k < w * h; k++){
    if (!bord[k] || fond(k)) continue;
    const x = k % w, y = (k - x) / w;
    let pres = false, encre = 255;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++){
      const xx = x + dx, yy = y + dy;
      if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
      const kk = yy * w + xx;
      if (fond(kk)){ pres = true; continue; }
      const m = Math.min(px[kk * 4], px[kk * 4 + 1], px[kk * 4 + 2]);
      if (m < encre) encre = m;
    }
    if (!pres || encre > 235) continue;
    const m = Math.min(px[k * 4], px[k * 4 + 1], px[k * 4 + 2]);
    const a = Math.max(0, Math.min(1, (255 - m) / (255 - encre)));
    if (a >= 1) continue;
    for (let c = 0; c < 3; c++)
      px[k * 4 + c] = a > .02 ? Math.max(0, Math.min(255, Math.round((px[k * 4 + c] - (1 - a) * 255) / a))) : px[k * 4 + c];
    px[k * 4 + 3] = Math.round(px[k * 4 + 3] * a);
  }
  ctx.putImageData(img, 0, 0);
  return toile;
}



/** La toile d'un logo à cette largeur en pixels : détouré, puis étiré en
 *  hauteur de ce que la vue de biais lui reprendra. */
function toile(/** @type {string} */ cle, /** @type {CanvasImageSource} */ i,
  /** @type {number} */ iw, /** @type {number} */ ih, /** @type {number} */ largeur){
  const lw = Math.max(1, Math.min(iw, Math.round(largeur)));
  const k = cle + "@" + lw;
  if (toiles.has(k)) return toiles.get(k) || null;
  const lh = Math.max(1, Math.round(ih * lw / iw));
  const logo = sansFond(i, lw, lh);
  const t = document.createElement("canvas");
  t.width = lw + 2 * MARGE;
  t.height = Math.round((lh + 2 * MARGE) / TASSEMENT);
  const ctx = t.getContext("2d");
  if (logo && ctx){
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(logo, MARGE, MARGE / TASSEMENT, lw, lh / TASSEMENT);
  }
  toiles.set(k, logo && ctx ? t : null);
  return toiles.get(k) || null;
}

/** Le stand montre-t-il son logo de près ? Sa vignette se décode si elle ne
 *  l'est pas encore. */
export function logoPose(/** @type {any} */ s){
  return Boolean(s && s.vignette && cameraEnJeu() &&
    document.documentElement.classList.contains(CLASSE_LOGOS) && image(s.vignette));
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

/* Le fondu au zoom, dans le shader : la couche reste la même d'une image à
   l'autre, seule l'échelle de la projection change. Un objet créé une fois :
   la bibliothèque compare ses extensions par identité. */
/** @type {any} */
let FONDU = null;
function fonduZoom(/** @type {any} */ L){
  if (FONDU) return FONDU;
  class FonduZoom extends L.LayerExtension {
    getShaders(){
      return {
        inject: {
          "vs:#decl": "out float vFonduZoom;",
          "vs:#main-end": "vFonduZoom = smoothstep(" + ZOOM_FONDU.toFixed(4) + ", " +
            ZOOM_LOGO.toFixed(4) + ", log2(project.scale));",
          "fs:#decl": "in float vFonduZoom;",
          // effacé, il ne se vise plus : un appui le traverse jusqu'au stand
          "fs:DECKGL_FILTER_COLOR": "color.a *= vFonduZoom;\nif (color.a < 0.02) discard;",
        },
      };
    }
  }
  FonduZoom.extensionName = "FonduZoom";
  return (FONDU = [new FonduZoom()]);
}

/* Ce que les couches posées couvrent : le cadre à plat, marge comprise, ou
   rien sous le seuil. */
/** @type {{ x0: number, y0: number, x1: number, y1: number } | null} */
let couvert = null;
const pres = (/** @type {number} */ zoom) => zoom >= ZOOM_FONDU - .5;

/**
 * La vue a-t-elle quitté ce que les logos posés couvrent ? Appelée à chaque
 * image d'un geste : deux comparaisons, et rien d'autre.
 * @param {{ x: number, y: number, w: number, h: number }} v le cadre à plat
 * @param {number} zoom
 */
export function logosARevoir(v, zoom){
  if (!document.documentElement.classList.contains(CLASSE_LOGOS)) return false;
  if (!pres(zoom)) return couvert !== null;
  return !couvert || v.x < couvert.x0 || v.y < couvert.y0 || v.x + v.w > couvert.x1 || v.y + v.h > couvert.y1;
}

/**
 * Les couches des logos, pour la vue immersive : une par logo autour de la
 * vue, chacune avec sa texture.
 * @param {any} L la bibliothèque
 * @param {(el: Element) => number} hauteurDe la hauteur du volume d'un tracé de stand
 * @param {{ x: number, y: number, w: number, h: number }} v le cadre à plat
 * @param {number} zoom
 */
export function couchesLogos(L, hauteurDe, v, zoom){
  const p = P();
  couvert = null;
  if (!p || !document.documentElement.classList.contains(CLASSE_LOGOS) || !pres(zoom)) return [];
  const m = Math.max(v.w, v.h) * MARGE_VUE;
  couvert = { x0: v.x - m, y0: v.y - m, x1: v.x + v.w + m, y1: v.y + v.h + m };
  /** @type {Map<string, Element>} */
  const groupes = new Map();
  $("stands").querySelectorAll("g.stand[data-id]").forEach(g => groupes.set(g.getAttribute("data-id") || "", g));
  const fondu = fonduZoom(L), out = [], vus = new Set();
  for (const s of p.stands || []){
    if (!s.vignette || !s.c || vus.has(s.id)) continue;
    const [cx, cy] = s.c;
    if (cx < couvert.x0 || cx > couvert.x1 || cy < couvert.y0 || cy > couvert.y1) continue;
    const g = groupes.get(s.id), trace = g && g.firstElementChild;
    const i = trace && image(s.vignette);
    if (!i) continue;
    vus.add(s.id);
    // le toit, d'après la boîte du stand : le logo en suit les côtés
    const bb = s.bb || [0, 0];
    const rapport = i.naturalWidth / (i.naturalHeight / TASSEMENT);
    const prof = Math.min(bb[1] * PART_DU_TOIT, bb[0] * PART_DU_TOIT / rapport, LARGEUR_MAX / rapport);
    if (!(prof > 0)) continue;
    const large = prof * rapport;
    const t = toile(s.vignette, i, i.naturalWidth, i.naturalHeight, Math.max(PIXELS_MIN, large * PIXELS_PAR_METRE));
    if (!t) continue;
    const z = hauteurDe(trace) + .05;
    const x0 = cx - large / 2, x1 = cx + large / 2, haut = cy - prof / 2, bas = cy + prof / 2;
    /* Les coins dans l'ordre de la bibliothèque — bas gauche, haut gauche,
       haut droit, bas droit —, le haut de l'image vers le fond du hall, comme
       les images que l'exploitant pose à plat (`webgl.mjs` `imageGl`). */
    out.push(new L.BitmapLayer({ id: "logo-" + s.id, image: t, pickable: true, el: g, extensions: fondu,
      bounds: [[x0, bas, z], [x0, haut, z], [x1, haut, z], [x1, bas, z]] }));
  }
  return out;
}
