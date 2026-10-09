/* ============================================================
   16. Les environs — le pavillon dans son quartier

   Un plan de salon s'arrête au mur. Le visiteur, lui, arrive par une rue, se
   gare sur un parking, ressort par une porte qui donne quelque part.

   Le hall est pourtant déjà situé. Klipso stocke sa géométrie en mètres dans
   le repère monde du parc, l'import ne fait qu'en retourner le Y
   (`_partage/geometrie.ts`), et l'échelle affichée dit des mètres parce que ce
   sont des mètres. Il ne manque que trois nombres — où tombe un point du plan
   sur la Terre, et vers où pointe l'axe des X — pour glisser une carte dessous.

   Une carte, et non un quartier dessiné. La première version allait chercher
   les rues et les bâtiments d'OpenStreetMap et les traçait elle-même : il a
   fallu en écrire la classification, les largeurs, les tons, l'ordre de tracé
   et le découpage, et chaque correction en découvrait une autre. Un style de
   carte, ce sont des centaines de règles, et les réinventer une par une ne
   converge pas. On pose donc des tuiles servies par des gens dont c'est le
   métier, et il ne reste ici que ce que personne d'autre ne peut faire à notre
   place : dire où le plan tombe sur la Terre.

   Le fond vit hors de la pile des calques et ne s'enregistre nulle part : il
   se refait à chaque changement de vue, comme la barre d'échelle. Ce qui
   s'enregistre tient en une ligne — `evenement.calage` — et part au visiteur
   avec le plan.

   Ce module porte ce que le visiteur reçoit : le fond lui-même, en tuiles ou
   en vectoriel, et le trou sous le pavillon. Le calage — le poser, le tourner,
   l'enregistrer — est un geste d'exploitant, et vit dans `calage-carte.mjs`,
   que seul `plan-admin.mjs` embarque. Ce que le code soudé tient encore — la
   vue, les réglages, les calques de dessin — lui est confié par
   `brancheEnvirons`, que `_environs.html` appelle à la place que ce code y
   tenait.
   ============================================================ */
import { $ } from "./dom.mjs";
import { esc } from "./texte.mjs";
import { DATA, P } from "./donnees.mjs";
import { DEG, versTerre, PX_TUILE, TOUR_MERCATOR, pixelsMercator, echelleDesTuiles, niveauDesTuiles }
  from "./terre.mjs";

/* Ce que le code soudé tient encore, et confie au branchement : la vue
   (`view`, que chaque geste remplace), son cadre à l'écran, les réglages
   (`CONF`, remplacés en changeant de salon), les calques de dessin du
   pavillon et le tracé d'une forme (`_dessin.html`). Des lecteurs, non des
   valeurs : il faut lire celles du moment. Rien ne sert avant le branchement
   — le plan n'a pas encore de vue —, d'où des lecteurs vides en attendant. */
/**
 * @typedef {object} PageEnvirons
 * @property {() => any} vue la vue du moment, `view`
 * @property {() => DOMRect} cadrePlan
 * @property {() => Record<string, any>} conf les réglages du moment, `CONF`
 * @property {() => any[]} mesCalques les calques de dessin du pavillon courant
 * @property {(f: any) => string} cheminForme
 */
/** @type {PageEnvirons} */
let soude = { vue: () => undefined, cadrePlan: () => new DOMRect(), conf: () => ({}),
  mesCalques: () => [], cheminForme: () => "" };

/** Le branchement, appelé par `_environs.html` à la place de ce code. */
export function brancheEnvirons(b){ soude = b; }

const racine = document.documentElement;

/* Le calage qu'un exploitant est en train de régler, que seule
   l'administration connaît : `calage-carte.mjs` le tient, et le confie ici par
   un lecteur. Chez le visiteur il n'y en a jamais. */
/** @type {() => any} */
let calageEnCours = () => null;
/** @param {() => any} lecteur */
export function confieCalageEnCours(lecteur){ calageEnCours = lecteur; }

/* ------------------------------------------------------------
   Le fond de carte

   Les tuiles d'une pyramide Web Mercator : un carré de 256 pixels par
   (niveau, colonne, ligne), servi par un fournisseur.

   Le placement tient en une rotation, et c'est la seule chose à comprendre
   ici. Le passage plan ↔ est/nord retourne le Y ; les tuiles, elles, se
   rangent en est/**sud**, comme les pixels d'une image. Deux retournements
   s'annulent : de l'est/sud vers le plan, il ne reste qu'une rotation pure.
   D'où un seul groupe SVG portant `rotate`, et des tuiles posées à l'équerre
   dedans — pas de transformation par tuile, pas de trigonométrie répétée.
   ------------------------------------------------------------ */

/* La pyramide elle-même — taille d'une tuile, passages en pixels, niveau à
   retenir — se calcule dans `modules/terre.mjs`. */

/* Les fonds proposés. La Géoplateforme de l'IGN d'abord : ouverte, sans clé à
   cacher dans une page publique, et couvrant le pays où se tiennent les salons
   qui nous occupent. OpenStreetMap en recours, hors de France.

   Chacun se cite : c'est la contrepartie d'un fond qu'on n'a pas dessiné. */
const GEOPF = "https://data.geopf.fr/wmts?SERVICE=WMTS&VERSION=1.0.0" +
  "&REQUEST=GetTile&STYLE=normal&TILEMATRIXSET=PM" +
  "&TILEMATRIX={z}&TILECOL={x}&TILEROW={y}";
/* ------------------------------------------------------------
   Notre style de carte

   Après avoir visé trois adresses de style et manqué les trois, on cesse de
   deviner : un style MapLibre n'est qu'un objet, et le moteur en prend un
   aussi bien qu'une adresse. Celui-ci est écrit ici, une quinzaine de couches
   au lieu des trois cents d'un style du commerce — un fond de salon situe, il
   ne raconte pas le quartier — et il ne dépend plus que du serveur de tuiles.

   Le schéma est « shortbread », et les noms de couches comme les valeurs
   d'attributs ci-dessous ont été relevés dans le paquet `@versatiles/style`
   plutôt que supposés. Les tuiles s'arrêtent au niveau 14 et se regardent de
   plus près par sur-zoom : c'est la limite du service, pas la nôtre.
   ------------------------------------------------------------ */

const TUILES_VT = "https://tiles.versatiles.org/tiles/osm/{z}/{x}/{y}";
const GLYPHES_VT = "https://tiles.versatiles.org/assets/glyphs/{fontstack}/{range}.pbf";
const CREDIT_VT = "Fond de plan © les contributeurs d'OpenStreetMap, © VersaTiles";

/* Deux jeux de tons, clair et sombre. Pâles des deux côtés : ce fond passe
   sous des stands, et doit se laisser oublier. */
const TONS_CARTE = {
  clair: { sol: "#F3F3EF", eau: "#CBDDE6", vert: "#E4EBDC", bati: "#E6E6E0",
           voie: "#FFFFFF", bord: "#DEDED6", ruelle: "#FAFAF6",
           encre: "#6E7478", halo: "rgba(255,255,255,.85)" },
  sombre: { sol: "#11161A", eau: "#17262E", vert: "#182119", bati: "#1C2226",
            voie: "#2B3339", bord: "#222A2F", ruelle: "#222930",
            encre: "#8C9498", halo: "rgba(14,17,19,.85)" },
};

/* Les classes de voies qui méritent un trait large. Le reste passe en ruelle :
   à l'échelle d'un salon, la hiérarchie fine d'OpenStreetMap n'apprend rien. */
const GRANDES_VOIES = ["motorway", "trunk", "primary", "secondary", "tertiary"];

/**
 * Le style, tel que le moteur le prend — un objet, pas une adresse.
 *
 * Onze couches et trois kilo-octets, contre deux cents et soixante-quinze pour
 * le plus sobre des styles du commerce : c'est la simplification qu'on
 * cherchait, et elle tient à ce qu'on écarte, non à ce qu'on ajoute.
 *
 * Vérifié par le validateur officiel de la spécification, qui se relit sans
 * navigateur :
 *   npm i --no-save @maplibre/maplibre-gl-style-spec
 *   node -e "…validateStyleMin(styleSobre(false))…"
 */
function styleSobre(sombre){
  const t = TONS_CARTE[sombre ? "sombre" : "clair"];
  const large = (a, b, c) => ["interpolate", ["exponential", 1.6], ["zoom"],
                              10, a, 14, b, 18, c];
  const couche = (id, source, type, peinture, extra) => Object.assign(
    { id: id, type: type, source: "vt", "source-layer": source, paint: peinture }, extra || {});
  return {
    version: 8,
    glyphs: GLYPHES_VT,
    sources: { vt: { type: "vector", tiles: [TUILES_VT], maxzoom: 14,
                     attribution: CREDIT_VT } },
    layers: [
      { id: "sol", type: "background", paint: { "background-color": t.sol } },
      couche("vert", "land", "fill", { "fill-color": t.vert }, {
        filter: ["match", ["get", "kind"],
          ["park", "garden", "forest", "grass", "village_green", "recreation_ground",
           "cemetery", "allotments", "meadow", "orchard", "farmland"], true, false] }),
      couche("eau", "water_polygons", "fill", { "fill-color": t.eau }),
      couche("ocean", "ocean", "fill", { "fill-color": t.eau }),
      couche("esplanades", "street_polygons", "fill",
             { "fill-color": t.ruelle, "fill-outline-color": t.bord }),
      /* Les ruelles d'abord, les grandes voies par-dessus : un carrefour se lit
         mal quand la petite rue passe sur l'avenue. */
      couche("ruelles", "streets", "line",
             { "line-color": t.ruelle, "line-width": large(0.4, 1.4, 6) }, {
        filter: ["!", ["match", ["get", "kind"], GRANDES_VOIES, true, false]],
        layout: { "line-cap": "round", "line-join": "round" } }),
      couche("voies-bord", "streets", "line",
             { "line-color": t.bord, "line-width": large(1.6, 4.4, 17) }, {
        filter: ["match", ["get", "kind"], GRANDES_VOIES, true, false],
        layout: { "line-cap": "round", "line-join": "round" } }),
      couche("voies", "streets", "line",
             { "line-color": t.voie, "line-width": large(1, 3.2, 14) }, {
        filter: ["match", ["get", "kind"], GRANDES_VOIES, true, false],
        layout: { "line-cap": "round", "line-join": "round" } }),
      couche("bati", "buildings", "fill",
             { "fill-color": t.bati, "fill-opacity": ["interpolate", ["linear"], ["zoom"],
                                                     13, 0, 15, 1] }),
      /* Les libellés, et toute la raison d'être du vectoriel : le moteur les
         repose droits à chaque changement d'orientation, là où un texte cuit
         dans une image tourne avec le plan et se lit à l'envers. */
      couche("nomsRues", "street_labels", "symbol",
             { "text-color": t.encre, "text-halo-color": t.halo, "text-halo-width": 1.2 }, {
        filter: ["match", ["get", "kind"], GRANDES_VOIES, true, false],
        layout: { "text-field": ["get", "name"], "text-font": ["noto_sans_regular"],
                  "symbol-placement": "line", "text-size": 11, "text-letter-spacing": .02 } }),
      couche("nomsLieux", "place_labels", "symbol",
             { "text-color": t.encre, "text-halo-color": t.halo, "text-halo-width": 1.4 }, {
        filter: ["match", ["get", "kind"],
          ["city", "town", "village", "suburb", "quarter", "neighbourhood"], true, false],
        layout: { "text-field": ["get", "name"], "text-font": ["noto_sans_bold"],
                  "text-size": ["match", ["get", "kind"], ["city", "town"], 14, 11.5] } }),
    ],
  };
}

export const CARTES = {
  /* Le nôtre d'abord : aucune adresse de style à deviner, et deux fois moins
     de couches qu'un style du commerce. */
  maison: { nom: "Sobre (notre style)", objet: () => styleSobre(false), credit: CREDIT_VT },
  maisonSombre: { nom: "Sobre sombre (notre style)", objet: () => styleSobre(true), credit: CREDIT_VT },
  /* Les fonds vectoriels d'abord, et pour une raison qui n'a rien d'esthétique :
     eux seuls gardent les libellés droits. Un plan de salon se dessine l'entrée
     vers le bas, presque jamais le nord en haut ; la carte tourne donc avec
     lui. Dans une image, le texte est cuit et tourne avec — aucun fournisseur
     n'y peut rien, Google compris. Un moteur vectoriel, lui, replace ses
     étiquettes à chaque changement d'orientation, parce qu'il les compose au
     moment de peindre. C'est ce que fait tout plan de salon du métier. */
  vecteur: { nom: "Vectoriel sobre (service libre)",
             style: "https://tiles.openfreemap.org/styles/positron",
             credit: "Fond de plan © les contributeurs d'OpenStreetMap, © OpenFreeMap" },
  vecteurDetail: { nom: "Vectoriel détaillé (service libre)",
             style: "https://tiles.openfreemap.org/styles/liberty",
             credit: "Fond de plan © les contributeurs d'OpenStreetMap, © OpenFreeMap" },
  vecteurAutre: { nom: "Vectoriel sobre (autre service libre)",
             style: "https://tiles.versatiles.org/assets/styles/colorful/style.json",
             credit: "Fond de plan © les contributeurs d'OpenStreetMap, © VersaTiles" },
  plan: { nom: "Plan IGN", max: 19,
          url: GEOPF + "&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&FORMAT=image/png",
          credit: "Fond de plan © IGN — Géoplateforme" },
  photo: { nom: "Vue aérienne", max: 20,
           url: GEOPF + "&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&FORMAT=image/jpeg",
           credit: "Vue aérienne © IGN — Géoplateforme" },
  osm: { nom: "OpenStreetMap", max: 19,
         url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
         credit: "Fond de plan © les contributeurs d'OpenStreetMap" },
};

/* Ce que vaut un fond « à pleine force », et ce qu'on prend par défaut. Un
   fond de plan n'est pas la carte : il situe, il ne raconte pas, et il doit
   passer derrière les stands sans leur disputer l'œil. Les plans du métier
   sont tous pâlis ; on l'est donc d'office, et le curseur laisse le dernier
   mot. */
const FORCE_CARTE = 0.62;
export const forceCarte = (cal) =>
  cal && isFinite(cal.force) ? Math.max(0.1, Math.min(1, cal.force)) : FORCE_CARTE;

/* Jusqu'où l'on recule, en largeurs de pavillon : deux fois et demie tant
   qu'il n'y a rien au-delà des murs, huit fois dès qu'une carte s'y trouve —
   c'est pour la voir qu'on l'a posée, et la vue s'arrêtait au bord de la
   première rue. L'emprise, elle, ne bouge pas : elle tient aussi la grille
   d'itinéraire, au demi-mètre. */
const RECUL_CARTE = 8;

/**
 * Le calage enregistré pour le pavillon regardé.
 *
 * Sur le pavillon, et non sur le salon : deux halls d'un même parc ne partagent
 * pas toujours une origine. Au Grimaldi Forum, Klipso étale les cinq espaces
 * sur 265 × 339 m alors que le bâtiment n'en fait que 150 de long — caler l'un
 * posait la carte à cent mètres des autres.
 */
export function calagePose(){
  const p = DATA && DATA.plans ? P() : null;
  if (!p) return null;
  /* `undefined` et `null` ne disent pas la même chose. Le premier vient d'un
     serveur qui ne sert pas encore le calage par pavillon : on retombe sur
     celui du salon, le temps que les deux déploiements se rejoignent. Le
     second est un calage retiré, et se respecte. */
  return p.calage !== undefined ? p.calage : ((DATA && DATA.calage) || null);
}

/** Le calage qui vaut à cet instant : celui qu'on règle s'il y en a un, celui
 *  du pavillon sinon. Le visiteur n'a jamais que le second. */
export const calageCourant = () => calageEnCours() || calagePose();

/** Le fond retenu, s'il en est un de connu. */
export const fondCourant = () => {
  const c = calageCourant();
  return c && CARTES[c.fond] ? CARTES[c.fond] : null;
};

export function recul(){
  return fondCourant() ? RECUL_CARTE : 2.5;
}

/** L'adresse d'une tuile. */
const adresseTuile = (fond, z, x, y) => fond.url
  .replace("{z}", z).replace("{x}", x).replace("{y}", y);

/**
 * Les tuiles à poser pour couvrir la vue, et où les poser.
 *
 * Rendu à part du dessin pour être éprouvé sans navigateur : c'est la seule
 * arithmétique de ce module qu'une erreur de signe rendrait invisible à la
 * lecture et évidente à l'écran.
 */
function tuilesDeLaVue(cal, fond, vue, mParPx){
  const z = niveauDesTuiles(cal, mParPx, fond.max);
  const k = echelleDesTuiles(cal, z);
  const ancre = pixelsMercator(cal.lon, cal.lat, z);
  /* Les quatre coins de la vue, ramenés en est/sud puis en pixels. La
     transformation étant rigide, c'est encore un rectangle — tourné ; on
     encadre donc ses coins. */
  const co = Math.cos(cal.angle), si = Math.sin(cal.angle);
  const coins = [[vue.x, vue.y], [vue.x + vue.w, vue.y],
                 [vue.x + vue.w, vue.y + vue.h], [vue.x, vue.y + vue.h]]
    .map(q => { const dx = q[0] - cal.x, dy = q[1] - cal.y;
                return [ancre[0] + (dx * co + dy * si) / k.x,
                        ancre[1] + (-dx * si + dy * co) / k.y]; });
  const n = Math.pow(2, z);
  const X0 = Math.floor(Math.min.apply(null, coins.map(q => q[0])) / PX_TUILE);
  const X1 = Math.floor(Math.max.apply(null, coins.map(q => q[0])) / PX_TUILE);
  const Y0 = Math.floor(Math.min.apply(null, coins.map(q => q[1])) / PX_TUILE);
  const Y1 = Math.floor(Math.max.apply(null, coins.map(q => q[1])) / PX_TUILE);
  const tuiles = [];
  /* Un garde-fou, et non une limite de travail : le niveau étant choisi sur
     l'échelle, il en tient toujours quelques dizaines. Passé ce compte, c'est
     qu'un calage aberrant demande la moitié du globe. */
  if ((X1 - X0 + 1) * (Y1 - Y0 + 1) > 400) return { z: z, k: k, tuiles: [] };
  for (let X = X0; X <= X1; X++){
    for (let Y = Y0; Y <= Y1; Y++){
      if (X < 0 || Y < 0 || X >= n || Y >= n) continue;
      /* En pixels de la pyramide, relatifs à l'ancre : des entiers, que le
         groupe met à l'échelle et tourne d'un seul coup. */
      tuiles.push({ z: z, x: X, y: Y,
                    px: X * PX_TUILE - ancre[0], py: Y * PX_TUILE - ancre[1] });
    }
  }
  return { z: z, k: k, tuiles: tuiles };
}

/* ------------------------------------------------------------
   Le rendu vectoriel

   Les tuiles d'images portent leur texte cuit : un plan tourné le tourne
   aussi, et on lit les noms de rues à l'envers. Aucun fournisseur n'y change
   rien. Un moteur vectoriel, lui, reçoit de la géométrie et compose ses
   étiquettes au moment de peindre : elles restent droites quelle que soit
   l'orientation. C'est le seul correctif qui existe, et c'est ce que font les
   plans de salon du métier.

   MapLibre peint sur sa propre toile, sous le SVG, et ne reçoit aucun geste :
   c'est nous qui lui disons où regarder à chaque changement de vue. Notre
   calage donne les trois nombres qu'il demande — le centre en longitude et
   latitude, l'échelle, et le cap.
   ------------------------------------------------------------ */

/* La bibliothèque n'est chargée que lorsqu'un fond vectoriel est retenu : deux
   cent sept kilo-octets compressés qu'un salon sans carte n'a pas à
   télécharger. Une version majeure plutôt qu'exacte — le CDN résout alors
   toujours vers quelque chose qui existe, là où un numéro de correctif mal
   deviné ne rendrait qu'un 404 silencieux.

   La quatre, et pas au-delà : à partir de la six le paquet ne publie plus de
   « maplibre-gl.js », seulement des modules. Monter de majeure sans changer
   aussi le nom du fichier ferait donc disparaître la carte en silence — le
   404 d'un script ajouté à la main ne se remarque nulle part. */
const MAPLIBRE_JS = "https://cdn.jsdelivr.net/npm/maplibre-gl@4/dist/maplibre-gl.js";
const MAPLIBRE_CSS = "https://cdn.jsdelivr.net/npm/maplibre-gl@4/dist/maplibre-gl.css";

let _biblioGL = null;
function chargeMapLibre(){
  if (_biblioGL) return _biblioGL;
  _biblioGL = new Promise((ok, non) => {
    /* Une promesse rejetée se garde comme une autre : sans cet oubli, un
       premier échec — le réseau au mauvais moment — condamnait la carte pour
       toute la session, et chaque nouvel essai retombait dessus sans rien
       redemander. */
    if (window.maplibregl) return ok(window.maplibregl);
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = MAPLIBRE_CSS;
    document.head.appendChild(css);
    const js = document.createElement("script");
    js.src = MAPLIBRE_JS;
    js.onload = () => window.maplibregl
      ? ok(window.maplibregl)
      : non(new Error("bibliothèque chargée mais introuvable"));
    js.onerror = () => { _biblioGL = null; non(new Error("bibliothèque de carte injoignable")); };
    document.head.appendChild(js);
  });
  return _biblioGL;
}

/**
 * Où la carte vectorielle doit regarder, déduit de la vue du plan.
 *
 * Le cap est l'opposé de l'angle du calage : MapLibre nomme « cap » l'azimut
 * qui se trouve en haut de l'écran, et le haut de notre plan pointe vers
 * l'azimut −angle. L'échelle suit la convention du moteur, où le monde fait
 * 512 pixels au niveau zéro — d'où le 78 271 et non le 156 543 des tuiles.
 */
function vueGL(cal){
  const view = soude.vue();
  const r = soude.cadrePlan();
  const mParPx = view.w / (r.width || 1);
  return {
    center: versTerre([view.x + view.w / 2, view.y + view.h / 2], cal),
    zoom: Math.log(TOUR_MERCATOR * Math.cos(cal.lat * DEG) / (512 * mParPx)) / Math.LN2,
    bearing: -cal.angle / DEG,
  };
}

/**
 * L'adresse du style à charger : celle que l'exploitant a collée, sinon celle
 * du fond retenu.
 *
 * L'adresse libre demeure, bien qu'aucun fond proposé n'en ait besoin : ces
 * services bougent, un chemin qui marchait l'an dernier rend aujourd'hui une
 * tuile grise, et il vaut mieux pouvoir en essayer un autre sur place que
 * d'attendre une mise en ligne. Une adresse qui demande une clé la porte
 * elle-même — il n'y a rien à y substituer.
 */
function styleDuFond(cal, fond){
  if (cal && cal.style) return cal.style;
  return (fond && fond.style) || "";
}

let _carteGL = null, _styleGL = "", _monteGL = false, _echecGL = "";
/* Le montage en cours, numéroté.

   Monter la carte demande d'aller chercher la bibliothèque, ce qui prend le
   temps d'un aller-retour réseau. Or on peut changer de fond pendant ce
   temps-là — c'est même ce qu'on fait quand le premier ne convient pas — et
   chaque changement repart d'un montage neuf sans que le précédent sache qu'il
   ne compte plus. Il aboutissait quand même : une deuxième carte s'installait
   par-dessus la première, qui restait sur place, invisible, à tenir un contexte
   graphique et à demander ses tuiles pour personne. Le drapeau `_monteGL` n'y
   pouvait rien — ce qui annule un montage le remet justement à zéro.

   Chaque montage prend donc un numéro, et ne s'installe que s'il porte encore
   le dernier. */
let _genGL = 0;
/* La minuterie du silence. Un service qui refuse proprement rend un code, et
   l'on sait quoi dire ; un service qui ne répond pas du tout ne rend rien du
   tout, et le moteur peint alors le fond du plan — un grand aplat uni qu'on
   prend pour une carte absente sans savoir pourquoi. Au bout de ce délai, on
   le dit. */
const ATTENTE_GL = 9000;
let _guetGL = null;

function guetteLaCarte(style){
  clearTimeout(_guetGL);
  _guetGL = setTimeout(() => {
    if (_ditGL) return;              // une erreur a déjà parlé, elle en dit plus
    ditCarte("Ce service ne répond pas : essayez un autre fond, ou collez " +
             "l'adresse d'un style qui marche. Demandé : " +
             String(style).replace(/^https?:\/\//, "").slice(0, 52), true);
  }, ATTENTE_GL);
}

/** La carte vectorielle, créée puis recadrée à chaque changement de vue. */
function poseCarteGL(cal, fond){
  const hote = $("fondCarteGL");
  if (!hote || _echecGL) return;
  /* Une adresse collée l'emporte sur tout ; sinon c'est l'objet du fond, ou son
     adresse. L'empreinte sert à savoir si le style a changé — un objet n'a pas
     d'adresse à comparer, on prend le nom du fond. */
  const style = (cal && cal.style) || (fond.objet ? fond.objet() : styleDuFond(cal, fond));
  const sig = (cal && cal.style) || (fond.objet ? "objet:" + cal.fond : style);
  if (!style) return;
  hote.hidden = false;
  if (_carteGL){
    if (_styleGL !== sig){
      _styleGL = sig;
      _ditGL = "";
      ditCarte("Chargement de la carte…");
      guetteLaCarte(sig);
      _carteGL.setStyle(style);
    }
    _carteGL.jumpTo(vueGL(cal));
    return;
  }
  /* Le montage est asynchrone et la vue se refait à chaque image : sans ce
     drapeau on empilerait trente cartes le temps d'un glissement. */
  if (_monteGL) return;
  _monteGL = true;
  const gen = ++_genGL;
  /* L'adresse dans le message : si rien n'arrive, elle dit déjà laquelle a été
     demandée — et c'est la moitié du diagnostic. */
  ditCarte("Chargement de la carte… " + String(sig).replace(/^https?:\/\//, "").slice(0, 48));
  guetteLaCarte(sig);
  chargeMapLibre().then(gl => {
    /* Un autre fond a été choisi, ou la carte retirée, pendant le chargement.
       On rend le drapeau : sans cela il restait levé sur une carte jamais
       posée, et tout montage suivant sortait à la première ligne — « Situer le
       salon » ne montait plus rien, sans un mot, jusqu'au rechargement. */
    if (gen !== _genGL){ _monteGL = false; return; }
    const v = vueGL(cal);
    _styleGL = sig;
    _carteGL = new gl.Map({
      container: hote, style: style,
      center: v.center, zoom: v.zoom, bearing: v.bearing,
      /* Aucun geste : tout passe par le SVG posé dessus. Et pas d'attribution
         intégrée — la nôtre est déjà au coin du plan, à la même place pour
         tous les fonds. */
      interactive: false, attributionControl: false,
      /* Les étiquettes n'apparaissent pas en fondu : la vue est recadrée à
         chaque image du geste, et un fondu qui reprend sans cesse ferait
         clignoter les noms de rues pendant qu'on cale. */
      fadeDuration: 0,
    });
    /* Le moteur ne dit rien de lui-même d'une tuile refusée : il peint ce
       qu'on lui rend, fût-ce un carré gris barré de « API KEY REQUIRED ».
       Sans cette écoute, on cherche longtemps pourquoi la carte est laide. */
    _carteGL.on("error", ev => diagnostiqueGL(ev));
    /* Et quand elle arrive, le dire aussi : sans ce mot, une carte pâlie par
       la discrétion et posée sous le plan peut passer pour absente. */
    _carteGL.on("load", () => {
      clearTimeout(_guetGL);
      if (!_ditGL) ditCarte("Carte chargée.");
    });
  }).catch(e => {
    /* Le montage annulé ne condamne rien : celui qui l'a remplacé est en cours,
       et c'est à lui de dire s'il aboutit. Le drapeau se rend dans les deux
       cas, le remplaçant ayant le sien. */
    _monteGL = false;
    if (gen !== _genGL) return;
    /* La panne est dite : la minuterie du silence, armée pour ce montage,
       l'aurait remplacée neuf secondes plus tard par un « service qui ne
       répond pas », qui accuse le fond quand c'est la bibliothèque qui manque. */
    clearTimeout(_guetGL);
    _echecGL = e.message;
    hote.hidden = true;
    ditCarte("Carte vectorielle indisponible (" + e.message +
             ") : prenez un fond en images.", true);
  });
}

/* La première panne, et rien de plus : un style qui manque fait crier le moteur
   à chaque tuile, et vingt messages identiques n'apprennent pas davantage que
   le premier. */
let _ditGL = "";

/**
 * Ce qui a échoué, dit avec l'adresse qui a échoué.
 *
 * Le moteur ne dit rien de lui-même d'une tuile refusée : il peint ce qu'on lui
 * rend, fût-ce un carré gris barré de « API KEY REQUIRED ». Et les services de
 * tuiles changent d'adresse sans prévenir. Sans le détail — le code, et surtout
 * l'adresse qui n'a pas répondu — on cherche longtemps, et à l'aveugle.
 */
function diagnostiqueGL(ev){
  const e = (ev && ev.error) || {};
  const code = e.status;
  const url = e.url || (e.request && e.request.url) || "";
  const court = url ? url.replace(/^https?:\/\//, "").slice(0, 64) : "";
  const quoi = code === 401 || code === 403
    ? "Ce fond demande une clé : collez-la ci-dessus, ou prenez un fond sans clé."
    : code === 404
    ? "Adresse introuvable : le service a changé de chemin, collez-en une autre."
    : "Le fond vectoriel n'a pas répondu" + (code ? " (" + code + ")" : "") + ".";
  const dit = quoi + (court ? " — " + court : "") +
    (e.message && !code ? " — " + String(e.message).slice(0, 80) : "");
  if (dit === _ditGL) return;
  _ditGL = dit;
  ditCarte(dit, true);
}

/** Une adresse changée mérite un nouvel essai : sans cela un premier échec —
 *  une clé absente, un chemin faux — condamnerait le fond pour la session,
 *  alors qu'on vient justement de le corriger. */
export function relanceCarteGL(){
  clearTimeout(_guetGL);
  _genGL++;                 // ce qui est en vol ne compte plus
  _echecGL = "";
  _ditGL = "";
  _monteGL = false;
  if (_carteGL){ _carteGL.remove(); _carteGL = null; _styleGL = ""; }
  ditCarte("");
  dessineFondCarte();
}

/** La carte vectorielle, retirée — on repasse aux tuiles, ou à rien. */
function videCarteGL(){
  clearTimeout(_guetGL);
  /* Sans cela, une carte demandée puis retirée s'installait quand même, à
     l'arrivée de la bibliothèque, sur un hôte devenu invisible. */
  _genGL++;
  const hote = $("fondCarteGL");
  /* Hors du `if` : c'est quand aucune carte n'est encore posée — un montage
     justement en vol — que le drapeau avait le plus besoin d'être rendu. */
  _monteGL = false;
  if (_carteGL){ _carteGL.remove(); _carteGL = null; _styleGL = ""; }
  if (hote) hote.hidden = true;
}

/* Ce qui est déjà posé : sans cette empreinte, chaque image d'un glissement
   réécrirait les mêmes trente balises et redemanderait les mêmes tuiles. */
let _fondPose = "";
let _tuilesMuettes = 0;
/* Ce qui ne dépend que du calage, et non de la vue : l'opacité rendue à la
   feuille de style, le crédit, et la matrice du groupe des tuiles. Les
   réécrire à chaque image d'un glissement coûtait cher pour rien — surtout la
   première, posée sur la racine, qui remet en cause le style des sept mille
   nœuds du plan, et que le guet du rendu WebGL relit à chaque fois. */
let _calagePose = "";

/** Le fond de carte, refait pour la vue courante. */
export function dessineFondCarte(){
  const hote = $("fondCarte");
  if (!hote) return;
  const cal = calageCourant(), fond = fondCourant();
  const credit = $("creditCarte");
  const view = soude.vue();
  if (!cal || !fond || !view){
    /* Le groupe lui-même dit s'il porte des tuiles, et non l'empreinte :
       `refaitFondCarte` l'oublie pour forcer une réécriture, et la carte qu'on
       venait de retirer gardait alors ses tuiles et leur matrice. */
    if (hote.firstChild || hote.hasAttribute("transform")){
      hote.innerHTML = ""; hote.removeAttribute("transform"); _fondPose = "";
    }
    videCarteGL();
    _calagePose = "";
    if (credit) credit.hidden = true;
    return;
  }
  const force = forceCarte(cal);
  if (credit && credit.hidden){ credit.hidden = false; _calagePose = ""; }
  if (String(force) + "|" + fond.credit !== _calagePose){
    _calagePose = String(force) + "|" + fond.credit;
    racine.style.setProperty("--carte-force", String(force));
    if (credit) credit.textContent = fond.credit;
  }
  /* Le calque des tuiles vit hors du plan : il n'hérite plus de sa « viewBox »
     et se la voit poser ici, à chaque changement de vue. C'est le prix de
     n'être pas repris par le rendu de la carte graphique. */
  const cadre = $("fondTuiles");
  if (cadre) cadre.setAttribute("viewBox",
    view.x + " " + view.y + " " + view.w + " " + view.h);
  /* Un fond vectoriel se peint ailleurs : le groupe des tuiles se vide, et
     c'est MapLibre qui regarde. */
  if (fond.style || fond.objet){
    // le groupe, et non l'empreinte, pour la même raison qu'au retrait
    if (hote.firstChild || hote.hasAttribute("transform")){
      hote.innerHTML = ""; hote.removeAttribute("transform"); _fondPose = "";
    }
    poseCarteGL(cal, fond);
    return;
  }
  videCarteGL();
  const r = soude.cadrePlan();
  const t = tuilesDeLaVue(cal, fond, view, view.w / (r.width || 1));

  /* Le groupe suit toujours : la position de l'ancre, la rotation vers le
     repère du plan, l'échelle est/sud. Ce n'est qu'une attribution, et c'est
     elle qui rend le glissement fluide — déplacer la carte d'un mètre ne
     redemande aucune image. */
  const r6 = (v) => Math.round(v * 1e6) / 1e6;
  const matrice =
    "translate(" + r6(cal.x) + " " + r6(cal.y) + ")" +
    " rotate(" + r6(cal.angle / DEG) + ")" +
    " scale(" + r6(t.k.x) + " " + r6(t.k.y) + ")";
  // elle ne tient qu'au calage et au niveau de tuiles : un glissement ne la change pas
  if (matrice !== hote.getAttribute("transform")) hote.setAttribute("transform", matrice);

  /* Les tuiles, elles, ne se réécrivent que lorsque le carré change : les
     recréer à chaque image les ferait redécoder, et la carte scintillerait
     sous la main qui la déplace. */
  const der = t.tuiles.length ? t.tuiles[t.tuiles.length - 1] : null;
  const empreinte = !der ? cal.fond + "|vide" : [cal.fond, t.z,
    t.tuiles[0].x, t.tuiles[0].y, der.x, der.y, t.tuiles.length].join("|");
  if (empreinte === _fondPose) return;
  _fondPose = empreinte;
  _tuilesMuettes = 0;
  ditCarte("");

  /* Les tuiles n'ont que des pixels entiers à porter — le groupe fait le
     reste — ce qui les pose exactement bord à bord. Un millième de
     recouvrement malgré tout : le navigateur laisse entre deux bords calculés
     en virgule flottante un cheveu de fond, et ce cheveu dessine une grille
     sur toute la carte. */
  const c = PX_TUILE * 1.001;
  hote.innerHTML = t.tuiles.map(q =>
    '<image x="' + q.px + '" y="' + q.py + '" width="' + c + '" height="' + c +
    '" href="' + esc(adresseTuile(fond, q.z, q.x, q.y)) + '"/>').join("");
  /* Une tuile qui ne répond pas s'efface : un cadre brisé sous le plan dirait
     une panne du plan, quand seul le fond manque. On les compte, pour que le
     volet de réglage puisse dire qu'aucune n'arrive. */
  hote.querySelectorAll("image").forEach(im => {
    im.onerror = () => {
      im.remove();
      /* Une tuile perdue n'est qu'une tuile ; trois, c'est le service. Et le
         compte se dit sur la ligne de la carte, jamais sur celle des actions —
         un reste d'ici s'affichait sinon au milieu d'un fond vectoriel qui,
         lui, se chargeait très bien. */
      if (++_tuilesMuettes === 3)
        ditCarte("Ces tuiles ne répondent pas : essayez un autre fond.", true);
    };
  });
}

/* ------------------------------------------------------------
   Le trou sous le pavillon

   La carte dessine le hall tel qu'il est bâti ; le plan, lui, ne couvre que
   la part où il y a des stands — on ne trace pas les mètres carrés vides, qui
   ne donneraient qu'une impression de vide. Les deux ne coïncident donc
   jamais tout à fait, et la façade cartographiée dépasse du plan ou passe
   dessous.

   Plutôt que de deviner l'emprise du hall, on laisse l'exploitant la désigner
   avec ce qu'il a déjà : le contour qu'il a dessiné. Un calque de dessin porte
   un interrupteur de plus — « percer le fond de carte » — et ses surfaces
   fermées deviennent des trous. La zone du hall redevient vide, et le dessin
   s'y installe sans rien qui le contredise.

   Comme le verrou, l'état vit dans la configuration plutôt qu'en table : elle
   part aux autres postes avec le reste, et un calque supprimé ne laisse rien
   derrière lui.
   ------------------------------------------------------------ */

export const cleMasqueCarte = (id) => "_masqueCarte:" + id;
export const masqueCarte = (c) => !!c && !!(soude.conf()[cleMasqueCarte(c.id)] || {}).masque;


/* Les sortes de formes qui percent : celles qui ont une surface. Un trait, un
   repère ou un texte désignent un endroit, ils n'en occupent pas. */
const SORTES_MASQUE = { rect: 1, poly: 1, stand: 1 };

/** Ce qui perce, sur le pavillon courant. Un calque éteint ne perce pas : il
 *  ne se voit pas non plus, et le trou trahirait sa présence. */
function formesMasquantes(){
  const l = [];
  for (const c of soude.mesCalques()){
    if (c.visible === false || !masqueCarte(c)) continue;
    for (const f of (c.formes || []))
      if (SORTES_MASQUE[f.t] && f.pts && f.pts.length > 1) l.push(f);
  }
  return l;
}

/**
 * Le hall relevé, celui qu'on vide de la carte.
 *
 * Sans lui une voie passe par-dessus le pavillon — le périphérique le franchit
 * dans les données parce qu'il le franchit pour de bon — et le plan se
 * retrouve barré d'une route. Le dessin de l'exploitant, lui, s'installe alors
 * dans du vide.
 *
 * C'est aussi ce que ni l'enveloppe des stands ni le contour dessiné ne savent
 * donner : le premier s'arrête au dernier stand, le second ne couvre que ce
 * qu'on a bien voulu tracer.
 */
export function contourDuHall(){
  const cal = calageCourant();
  const pts = cal && cal.halls && DATA ? cal.halls[P().id] : null;
  return pts && pts.length >= 3 ? pts : null;
}

/** Le même, en tracé — et rien du tout si l'exploitant a décoché. */
function cheminDuHall(){
  const pts = contourDuHall();
  if (!pts || calageCourant().vide === false) return "";
  return "M" + pts.map(q => q[0] + " " + q[1]).join("L") + "Z";
}

/* Le contenu posé : sans cette empreinte, chaque tracé de dessin réécrirait le
   même aplat — et un aplat réécrit fait repeindre toute la carte. */
let _masquePose = null;

/**
 * L'aplat qui vide, posé par-dessus la carte et sous tout le reste.
 *
 * Un aplat de la couleur du fond, et non un découpage. Le rendu est le même —
 * il n'y a rien derrière la carte que ce fond-là — et il vaut aussi bien pour
 * des tuiles que pour la toile WebGL du rendu vectoriel, qu'aucun `clip-path`
 * du SVG n'atteindrait.
 */
export function poseMasqueCarte(){
  const el = $("trouDuFond");
  if (!el) return;
  /* Rien à cacher, rien à peindre. Sans cette porte, un salon dont la carte
     n'a pas chargé — ou qu'on vient de retirer — gardait un grand aplat clair
     posé sur rien, au milieu du plan. */
  const trous = !fondCourant() ? ""
    : cheminDuHall() + formesMasquantes().map(soude.cheminForme).join("");
  if (trous === _masquePose) return;
  _masquePose = trous;
  el.setAttribute("d", trous);
}

/** L'état de la carte, sur sa ligne à elle : un enregistrement raté ne doit
 *  pas effacer ce qu'elle a à dire, ni l'inverse. */
function ditCarte(txt, mal){
  const e = $("calageCarte");
  if (!e) return;
  e.textContent = txt || "";
  e.classList.toggle("alerte", !!mal);
}

/** Le fond et le trou refaits de zéro, empreintes oubliées : un réglage du
 *  calage change ce qu'elles résument sans changer la vue. Appelé par
 *  `calage-carte.mjs` `rafraichitCarte`, qui seul connaît ces réglages. */
export function refaitFondCarte(){
  _fondPose = "";
  /* Le bouton de perçage n'existe qu'avec une carte : le panneau des calques
     le gagne ou le perd en même temps qu'elle. */
  _masquePose = null;
  poseMasqueCarte();
  dessineFondCarte();
}
