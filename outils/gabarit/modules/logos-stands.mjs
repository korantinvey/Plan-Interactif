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
import { VIGNETTES, VIGNETTES_ARRIVEES, adresseGrande } from "./vignettes.mjs";
import { VIGNETTE_SORTIE } from "./marque.mjs";
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
/** Les vignettes détourées, à leur pleine finesse, par clé, de la moins
 *  récemment posée à la plus récente. */
/** @type {Map<string, HTMLCanvasElement | null>} */
const detourees = new Map();
/* Combien on en garde, en pixels. Chacune tient les siens — un
   demi-mégaoctet pour une vignette de six cents sur deux cents, le triple pour
   une grande —, et un visiteur qui parcourt de près tout un salon de cinq
   cents stands les aurait toutes gardées. Vingt millions de pixels, quatre-
   vingts mégaoctets, couvrent la vue et ses abords ; une vignette oubliée se
   détoure à nouveau quand on revient vers elle, comme à la première fois. Les
   vignettes reçues, elles, restent : quelques kilo-octets chacune, et c'est
   par elles que le nom d'un stand sait qu'il a un logo. */
const PIXELS_GARDES = 20e6;
/** Les toiles prêtes à poser, par clé et par largeur — seules celles de la
 *  dernière pose : une finesse quittée se refait d'une simple réduction. */
/** @type {Map<string, HTMLCanvasElement | null>} */
const toiles = new Map();

/** Les grandes vignettes, par clé : demandées par les seuls toits vus de
 *  près, quand la petite ne suffit plus à leur finesse. */
/** @type {Map<string, "attente" | "panne" | HTMLImageElement>} */
const grandes = new Map();
/* La petite doit manquer d'au moins ce rapport pour qu'on aille chercher la
   grande : en deçà, l'écart ne se voit pas, et le trajet coûterait pour rien. */
const PLUS_FIN = 1.25;

/** La grande vignette décodée, ou rien : pas encore arrivée, ou inutile —
 *  l'original n'en tenait pas plus, et le service répond qu'il n'y en a pas. */
function grande(/** @type {string} */ cle){
  const deja = grandes.get(cle);
  if (deja) return typeof deja === "string" ? null : deja;
  const src = adresseGrande(cle);
  if (!src){ grandes.set(cle, "panne"); return null; }
  grandes.set(cle, "attente");
  const i = new Image();
  // lue par le détourage : une origine qui ne le permettrait pas la rendrait muette
  i.crossOrigin = "anonymous";
  i.onload = () => {
    grandes.set(cle, i.naturalWidth && i.naturalHeight ? i : "panne");
    PANNEAU_PRET.dis();
  };
  i.onerror = () => grandes.set(cle, "panne");
  i.src = src;
  return null;
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
  creux(px, vu, w, h, clarte);
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



/* Un creux est du fond si les trois quarts de son pourtour sont à moins de
   cette part du petit côté du logo — une épaisseur de trait — du fond
   retiré. */
const TRAIT = .12;

/**
 * Les creux des lettres. Le fond ne se retire que de proche en proche depuis
 * le pourtour : l'œil d'un « a », d'un « e », d'un « A » n'y touche pas, et
 * restait blanc sur le toit coloré. Un clair enclos est donc du fond aussi
 * quand il n'est séparé du fond retiré que par un trait mince ; le blanc d'un
 * texte posé sur un aplat, loin du bord de l'aplat, reste.
 */
function creux(/** @type {Uint8ClampedArray} */ px, /** @type {Uint8Array} */ vu,
  /** @type {number} */ w, /** @type {number} */ h, /** @type {(k: number) => number} */ clarte){
  const n = w * h, clair = (/** @type {number} */ k) => clarte(k) >= CLAIR_FOND;
  // la distance de chaque pixel au fond retiré, en pas, à travers le logo
  const dist = new Int32Array(n).fill(-1), file = new Int32Array(n);
  let debut = 0, fin = 0;
  for (let k = 0; k < n; k++) if (vu[k] && clair(k)){ dist[k] = 0; file[fin++] = k; }
  if (!fin) return;
  while (debut < fin){
    const k = file[debut++], x = k % w, d = dist[k] + 1;
    for (const kk of [x > 0 ? k - 1 : -1, x < w - 1 ? k + 1 : -1, k - w, k + w]){
      if (kk < 0 || kk >= n || dist[kk] >= 0) continue;
      dist[kk] = d; file[fin++] = kk;
    }
  }
  const seuil = Math.max(2, Math.round(TRAIT * Math.min(w, h)));
  const range = new Uint8Array(n);
  for (let k0 = 0; k0 < n; k0++){
    if (vu[k0] || range[k0] || !clair(k0)) continue;
    // le creux entier, et la distance de son pourtour au fond
    const siens = [k0], bords = [];
    range[k0] = 1;
    for (let i = 0; i < siens.length; i++){
      const k = siens[i], x = k % w;
      let auBord = false;
      for (const kk of [x > 0 ? k - 1 : -1, x < w - 1 ? k + 1 : -1, k - w, k + w]){
        if (kk < 0 || kk >= n) continue;
        if (!clair(kk)){ auBord = true; continue; }
        if (!vu[kk] && !range[kk]){ range[kk] = 1; siens.push(kk); }
      }
      if (auBord) bords.push(dist[k]);
    }
    if (!bords.length) continue;
    bords.sort((a, b) => a - b);
    if (bords[Math.floor(bords.length * .75)] > seuil) continue;
    for (const k of siens){
      px[k * 4 + 3] = Math.round(px[k * 4 + 3] * Math.max(0, Math.min(1, (BLANC_FOND - clarte(k)) / (BLANC_FOND - CLAIR_FOND))));
      vu[k] = 1;
    }
  }
}

/** La toile d'un logo à cette largeur en pixels : détouré, puis étiré en
 *  hauteur de ce que la vue de biais lui reprendra.
 *
 *  Le détourage se fait une fois, sur la vignette entière, et chaque finesse
 *  n'en est qu'une réduction : la refaire à chaque demi-cran de zoom coûtait
 *  un parcours de chaque logo, et détourée en petit, la vignette perdait au
 *  bord ce que la réduction avait déjà fondu. */
function toile(/** @type {string} */ cle, /** @type {CanvasImageSource} */ i,
  /** @type {number} */ iw, /** @type {number} */ ih, /** @type {number} */ largeur){
  const lw = Math.max(1, Math.min(iw, Math.round(largeur)));
  const k = cle + "@" + lw;
  if (toiles.has(k)) return toiles.get(k) || null;
  const lh = Math.max(1, Math.round(ih * lw / iw));
  const logo = detourees.has(cle) ? detourees.get(cle) : sansFond(i, iw, ih);
  // la plus récente passe en dernier
  detourees.delete(cle);
  detourees.set(cle, logo || null);
  const t = document.createElement("canvas");
  t.width = lw + 2 * MARGE;
  t.height = Math.round((lh + 2 * MARGE) / TASSEMENT);
  const ctx = t.getContext("2d");
  if (logo && ctx){
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(logo, MARGE, MARGE / TASSEMENT, lw, lh / TASSEMENT);
  }
  t.dataset.cle = k;
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
/* La planche se lit sans niveaux réduits. La bibliothèque ne les fabrique
   pas pour une toile qu'on lui donne : demandés au filtrage, ils restaient
   vides, et dès que le toit fuyait assez, le logo virait au noir passé un arc
   de cercle — là où la carte graphique changeait de niveau. Les logos ne
   paraissent que de près, où la réduction reste faible.

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

/** La dernière planche posée : on ne la refait que si les logos changent. */
/** @type {{ cle: string, toile: HTMLCanvasElement, cases: Map<HTMLCanvasElement, number[]> } | null} */
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
  for (const [t, c] of r.cases) r.cases.set(t, [c[0] / toile.width, c[1] / toile.height, c[2] / toile.width, c[3] / toile.height]);
  return (planche = { cle, toile, cases: r.cases });
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

/* Ce que les logos posés couvrent : le cadre à plat, marge comprise, ou rien
   sous le seuil. */
/** @type {{ x0: number, y0: number, x1: number, y1: number } | null} */
let couvert = null;
/* La finesse à laquelle ils ont été posés. */
let finesseCouverte = 0;
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
  return !couvert || finesse(zoom) !== finesseCouverte || v.x < couvert.x0 || v.y < couvert.y0 || v.x + v.w > couvert.x1 || v.y + v.h > couvert.y1;
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
  for (const k of [...toiles.keys()]) if (!posees.has(k)) toiles.delete(k);
  const enJeu = new Set([...posees].map(k => (k || "").slice(0, (k || "").lastIndexOf("@"))));
  let pixels = 0;
  for (const d of detourees.values()) if (d) pixels += d.width * d.height;
  for (const [cle, d] of [...detourees]){
    if (pixels <= PIXELS_GARDES) break;
    if (enJeu.has(cle)) continue;
    detourees.delete(cle);
    if (d) pixels -= d.width * d.height;
  }
}

/**
 * La couche des logos, pour la vue immersive : un carré par logo autour de la
 * vue, tous peints d'une planche.
 * @param {any} L la bibliothèque
 * @param {(el: Element) => number} hauteurDe la hauteur du volume d'un tracé de stand
 * @param {{ x: number, y: number, w: number, h: number }} v le cadre à plat
 * @param {number} zoom
 * @param {any} [appareil] la carte graphique, telle que la bibliothèque la tient
 */
export function couchesLogos(L, hauteurDe, v, zoom, appareil){
  const p = P();
  couvert = null;
  if (!p || !document.documentElement.classList.contains(CLASSE_LOGOS) || !pres(zoom)){ oublie([]); return []; }
  const m = Math.max(v.w, v.h) * MARGE_VUE;
  couvert = { x0: v.x - m, y0: v.y - m, x1: v.x + v.w + m, y1: v.y + v.h + m };
  finesseCouverte = finesse(zoom);
  const data = [], vus = new Set();
  for (const s of p.stands || []){
    if (!s.vignette || !s.c || vus.has(s.id)) continue;
    const [cx, cy] = s.c;
    if (cx < couvert.x0 || cx > couvert.x1 || cy < couvert.y0 || cy > couvert.y1) continue;
    const g = groupe(s.id), trace = g && g.firstElementChild;
    const i = trace && image(s.vignette);
    if (!i) continue;
    vus.add(s.id);
    // le toit, d'après la boîte du stand : le logo en suit les côtés
    const bb = s.bb || [0, 0];
    const rapport = i.naturalWidth / (i.naturalHeight / TASSEMENT);
    const prof = Math.min(bb[1] * PART_DU_TOIT, bb[0] * PART_DU_TOIT / rapport, LARGEUR_MAX / rapport);
    if (!(prof > 0)) continue;
    const large = prof * rapport;
    const voulue = Math.max(PIXELS_MIN, large * finesseCouverte);
    /* La petite a été réduite à sa taille de fiche : quand le toit en demande
       nettement plus, et qu'elle a bien été réduite — un côté au plafond —,
       la grande prend sa place dès qu'elle est là. Sa clé de toile se
       distingue, pour que les deux ne se confondent pas. */
    let src = i, cleSrc = s.vignette;
    if (voulue > i.naturalWidth * PLUS_FIN && Math.max(i.naturalWidth, i.naturalHeight) >= VIGNETTE_SORTIE - 1){
      const g = grande(s.vignette);
      if (g){ src = g; cleSrc = s.vignette + "+g"; }
    }
    const t = toile(cleSrc, src, src.naturalWidth, src.naturalHeight, voulue);
    if (!t) continue;
    data.push({ x: cx, y: cy, z: hauteurDe(trace) + .05, large, prof, t, el: g });
  }
  oublie(data);
  if (!data.length) return [];
  // dans un ordre fixe, pour qu'une même vue retrouve la même planche
  const toiles = [...new Set(data.map(d => d.t))].sort((a, b) => (a.dataset.cle || "").localeCompare(b.dataset.cle || ""));
  const pl = plancheDe(toiles);
  return [new L.SimpleMeshLayer({ id: "logos-stands", data, mesh: CARRE, texture: pl.toile, pickable: true,
    material: IMPRIME, textureParameters: filtrage(appareil), extensions: extensionPlanche(L),
    getPosition: (/** @type {any} */ d) => [d.x, d.y, d.z],
    getScale: (/** @type {any} */ d) => [d.large, d.prof, 1],
    getOrientation: [0, 0, 0],
    getCaseLogo: (/** @type {any} */ d) => pl.cases.get(d.t) || [0, 0, 1, 1],
    updateTriggers: { getCaseLogo: pl.cle } })];
}
