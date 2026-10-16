/* ============================================================
   La vue du plan — cadrage, zoom, libellés à l'échelle, part du plan que
   couvre la barre

   Presque tout le plan lit la vue : la fiche pour cadrer sur un stand, les
   gestes pour la déplacer, le dessin pour passer de l'écran au plan, la carte
   graphique et le fond de carte pour la suivre. Ce module tient ce qui la
   calcule et ce qui l'applique, pour qu'un module puisse l'importer au lieu
   de se la faire confier.

   La vue elle-même (`view`), le SVG du plan (`svg`) et son cadre à l'écran
   (`cadrePlan`) vivent dans `vue-etat.mjs`, que le fond de carte et la carte
   graphique importent aussi, et ce module les réexporte. Les gestes
   remplacent la vue sans cesse, le cadrage sur un trajet aussi : elle se
   remplace par sa porte, `changeVue(v)`. Les modules l'importent, ou la lisent
   par `vue()` ; seuls les essais la lisent encore dans la page, par un
   accesseur de `__essais` (`plan.mjs`). Le SVG est dans la page avant que les
   modules ne s'exécutent, et ne se remplace jamais.

   L'emprise du pavillon (`emp`), elle, n'était remplacée que par le montage
   du plan : elle vit ici, se remplace par `poseEmprise`, et s'importe.

   Ce que la vue appelle et qu'elle ne peut importer sans boucler, ou qui
   n'existe pas partout — les noms, les poignées de l'éditeur, les pastilles
   de l'itinéraire, les pointes de flèche, le point de la borne, le calage
   d'un hall — lui est confié par les modules qui le tiennent, en se chargeant
   (`confieALaVue`).
   L'ordre des calques, elle l'importe (`ordre-trace.mjs`).
   ============================================================ */
import { $ } from "./dom.mjs";
import { RENDU_WEBGL, GL, monteWebgl, vueWebgl, majEditionWebgl, rectEcranWebgl, confieAuWebgl }
  from "./webgl.mjs";
import { recul, dessineFondCarte, DEBORD_VUE, vueLibre } from "./environs.mjs";
import { svg, vue, changeVue, cadrePlan, oublieCadre, redresse, incline } from "./vue-etat.mjs";
import { cameraEnJeu, ecranVersPlat, CAMERA_CHANGEE } from "./camera.mjs";
import { REDUIT, ETROIT } from "./ecran.mjs";
import { ordonneDom } from "./ordre-trace.mjs";
import { facteurTrait } from "./chemin-forme.mjs";

/* Ce que la vue rappelle chez les modules qui l'importent — ce qui dit si
   l'on édite, les noms, et ce qui garde sa taille à l'écran quel que soit le
   zoom : poignées de l'éditeur, pastilles de l'itinéraire, pointes de flèche,
   point de la borne, poignée du calage d'un hall. Elle ne peut les importer :
   chacun l'importe. Chacun le lui confie donc au chargement de son module
   (`confieALaVue`), et ce que la page n'embarque pas — l'éditeur, la reprise
   des emplacements, le calage, tous d'administration — reste sans effet.
   Les appels restent là où ils étaient, et dans le même ordre : c'est le
   chemin de chaque image pendant un geste. */
/**
 * @typedef {object} PageVue
 * @property {() => boolean} enEdition
 * @property {() => void} libelles
 * @property {() => void} dessinePoignees
 * @property {() => void} dessinePoigneesGeo
 * @property {() => void} rafraichitBouts
 * @property {() => void} rafraichitFleches
 * @property {() => void} rafraichitBorne
 * @property {(() => void) | null} calage
 */
/** @type {PageVue} */
const prete = {
  enEdition: () => false, libelles: () => {}, dessinePoignees: () => {}, dessinePoigneesGeo: () => {},
  rafraichitBouts: () => {}, rafraichitFleches: () => {}, rafraichitBorne: () => {}, calage: null,
};

/** La porte des modules qui confient à la vue ce qu'elle rappelle.
 *  @param {Partial<PageVue>} o */
export function confieALaVue(o){ Object.assign(prete, o); }

/* La vue, le SVG et le cadre vivent dans `vue-etat.mjs`, que le fond de carte
   et la carte graphique importent aussi ; les autres modules les importent
   d'ici, comme avant. */
export { view, vue, changeVue, svg, cadrePlan, redresse } from "./vue-etat.mjs";
const enEdition = () => prete.enEdition();
const libelles = () => prete.libelles();

/** L'emprise du pavillon, posée au montage du plan. */
/** @type {any} */
export let emp;
/** La porte de l'emprise : `rendu.mjs` `montePlan` la remplace à chaque pavillon. */
export function poseEmprise(/** @type {any} */ e){ emp = e; }

/* ============================================================
   6. Vue
   ============================================================ */
/* Le cadre du plan se mesure une fois (`vue-etat.mjs` `cadrePlan`) et
   s'oublie quand la mise en page change. Un « ResizeObserver » couvre tout ce
   qui peut le changer, d'où qu'il vienne, sans rien mesurer lui-même ; le
   « resize » de la fenêtre s'y ajoute parce qu'il se déclenche avant lui, et
   que le recadrage qui l'écoute mesurerait sinon l'ancien cadre (voir
   `brancheVue`). */

/* Pendant un changement d'échelle, le plan se passe de ses textes : eux seuls
   coûtent quatre-vingts des quatre-vingt-huit millisecondes que réclame la
   remise en page du SVG à chaque image (voir « #plan.fige » dans la feuille de
   style). Le geste fini, « poseVue » les rend — recalculés une seule fois. */
/* Le dégel a un filet. Un geste finit normalement par « poseVue », qui rend
   les textes en même temps qu'il retrie les libellés ; mais tous les chemins
   n'y mènent pas — un doigt posé sur le plan pendant qu'une glissade finit sa
   course, un « pointercancel » du système. Le plan resterait muet. La minuterie
   est donc réarmée à chaque image du geste : elle ne se déclenche jamais tant
   qu'il dure, et toujours quand il s'interrompt sans se poser. */
/** @type {any} */
let filetTextes = null;
export function figeTextes(){
  // en WebGL les noms restent au dessin : il n'y a rien à taire
  if (GL.actif) return;
  detacheLibelles();
  svg.classList.add("fige");
  clearTimeout(filetTextes);
  filetTextes = setTimeout(rendTextes, 300);
}
function rendTextes(){
  clearTimeout(filetTextes); filetTextes = null;
  rattacheLibelles();
  svg.classList.remove("fige");
}

/* Les libellés, eux, restent à l'écran pendant le geste.

   Se taire avec le reste du plan les faisait disparaître au moment même où
   l'on zoome pour lire un nom. Mais les garder dans le SVG coûtait une image
   sur cinq, et ce n'était plus leur mise en page : c'était leur
   rastérisation, reprise à chaque image pour une taille de glyphe neuve. Rien
   ne l'évite tant qu'ils changent d'échelle dans le plan.

   Ils le quittent donc le temps du geste, pour un calque promu que le
   compositeur étire sans le repeindre — c'est « will-change » qui l'y
   autorise ; sans lui, le navigateur re-rastérise à chaque image, et l'on
   perd tout. Le groupe « #labels » déménage tel quel : ses règles de style
   tiennent à son identifiant et le suivent, et « libelles » l'écrit où qu'il
   soit. À la pose, il reprend sa place dans la pile, et s'y retrie comme
   avant.

   Deux prix, assumés. Une image étirée s'adoucit en zoom avant — jusqu'à la
   pose, ou une pause de la main, qui repeignent le calque net. Et le calque
   passe au-dessus de tout le plan : l'itinéraire, la sélection, un calque de
   dessin rangé plus haut dans la pile repassent sous les noms le temps du
   geste. */
/** @type {any} */
let calqueLib = null, svgLib = null;
/* La vue pour laquelle le calque a été peint, tant que les libellés y sont ;
   et le voisin devant lequel ils reprendront leur place dans la pile. */
/** @type {any} */
let libPeints = null, libAvant = null;
/* La dernière vue écrite dans la « viewBox », c'est-à-dire celle que l'écran
   montre. Pas « view » : le pincement la devance d'une image. */
/** @type {any} */
let vueEcrite = null;

/** Où une vue tombe dans le cadre : « meet » garde ses proportions et la centre. */
function cadrage(/** @type {any} */ v, /** @type {DOMRect} */ r){
  const s = Math.min(r.width / v.w, r.height / v.h);
  return { s, x: (r.width - v.w * s) / 2, y: (r.height - v.h * s) / 2 };
}

function peintLibelles(/** @type {any} */ v){
  libPeints = v;
  svgLib.setAttribute("viewBox", v.x + " " + v.y + " " + v.w + " " + v.h);
  calqueLib.style.transform = "";
}

/** Le calque des libellés repeint à la vue écrite, s'ils y sont — pour
 *  `libelles.mjs` `libelles`, qui les retrie en plein geste. */
export function repeintLibelles(){
  if (libPeints) peintLibelles(vueEcrite);
}

function detacheLibelles(){
  // appelée à chaque image du geste : une fois partis, rien à refaire
  if (libPeints || !vueEcrite) return;
  const g = $("labels");
  // une couche masquée, ou vide à cette échelle, n'a rien à porter
  if (!g.firstChild || g.style.display === "none") return;
  libAvant = g.nextSibling;
  peintLibelles(vueEcrite);
  svgLib.appendChild(g);
  calqueLib.hidden = false;
}

function rattacheLibelles(){
  if (!libPeints) return;
  const g = $("labels"), c = $("couches");
  /* La pile a pu se réordonner pendant le geste : elle a alors déjà remis le
     groupe chez elle, ou retiré le voisin devant lequel il devait revenir.
     Seul ce dernier cas la fait rejouer : elle déplace tout le plan, fond
     compris, et la pose en coûterait le double. Sans voisin, les textes
     fermaient la pile — ils y reviennent en dernier. */
  if (g.parentNode !== c){
    if (!libAvant || libAvant.parentNode === c) c.insertBefore(g, libAvant);
    else { c.appendChild(g); ordonneDom(); }
  }
  calqueLib.hidden = true;
  calqueLib.style.transform = "";
  libPeints = libAvant = null;
}

/** Amène ce que le calque a peint pour « libPeints » sur la vue écrite. */
function etireLibelles(){
  const r = cadrePlan();
  const a = cadrage(libPeints, r), b = cadrage(vueEcrite, r), k = b.s / a.s;
  calqueLib.style.transform =
    "translate(" + ((libPeints.x - vueEcrite.x) * b.s + b.x - a.x * k) + "px," +
    ((libPeints.y - vueEcrite.y) * b.s + b.y - a.y * k) + "px) scale(" + k + ")";
}

/* Le trait des calques de dessin s'amincit quand on recule
   (`chemin-forme.mjs` `facteurTrait`). Le SVG le lit dans une variable de
   « #couches » : la changer fait recalculer le style de tous les calques,
   d'où l'arrondi au centième, qui la laisse en paix dès que le trait a
   toute son épaisseur. La carte graphique, elle, n'en a pas besoin : elle
   compte ce trait en mètres, bornés, et le zoom le règle seul. */
let facteurPose = 1;
function poseFacteurTrait(/** @type {any} */ view){
  const f = Math.round(facteurTrait((cadrePlan().width || 1) / view.w) * 100) / 100;
  if (f === facteurPose) return;
  facteurPose = f;
  const c = $("couches");
  if (c) c.style.setProperty("--trait-f", String(f));
}

/* Ce qui se pose par-dessus le plan, hors du SVG comme du dessin de la carte
   graphique — la mini-carte, le battement de « Vous êtes ici », les halos de
   la chaleur. Ils suivent la vue quel que soit le rendu : c'est pourquoi ils
   passent avant la sortie du chemin WebGL plus bas. Chacun s'y inscrit en se
   chargeant ; la page qui ne l'embarque pas n'a rien à appeler. */
/** @type {Array<() => void>} */
const suiveurs = [];
/** Inscrit ce qui doit suivre chaque changement de vue, geste compris. */
export function suitLaVue(/** @type {() => void} */ f){ suiveurs.push(f); }

/**
 * Où un point du plan tombe dans la scène, en pixels depuis son coin haut
 * gauche — le SVG la couvre entière. La vue a les proportions du cadre
 * (`versPlan` fait le chemin inverse sur la même règle), et le cadre, mesuré
 * une fois, ne force aucune remise en page : on peut l'appeler à chaque image.
 * @returns {[number, number]}
 */
export function versScene(/** @type {number} */ x, /** @type {number} */ y){
  const r = cadrePlan(), v = vue();
  // en vue immersive, le point du sol tel qu'on le voit incliné
  return incline((x - v.x) / v.w * r.width, (y - v.y) / v.h * r.height);
}

/**
 * La vue ramenée près du hall : son milieu ne s'écarte pas de l'emprise de
 * plus de `DEBORD_VUE` fois sa taille. Elle est corrigée sur place, et rendue.
 *
 * Le recul seul ne suffisait pas : on s'arrêtait à quelques largeurs de hall,
 * mais rien n'empêchait de faire glisser le plan hors de l'écran, et l'on se
 * retrouvait devant un quartier vide, ou devant rien, sans savoir où revenir.
 * Retenue ici, à chaque image, plutôt que dans chaque geste : le glissement,
 * le pincement, la vignette et la molette passent tous par là. Le glissement
 * repartant à chaque mouvement de l'endroit saisi, la main qui revient
 * reprend le plan dès qu'elle repasse la borne. Les gestes du doigt l'appellent
 * aussi d'eux-mêmes, pour savoir s'ils butent (`gestes.mjs`).
 */
export function retiensVue(/** @type {any} */ v){
  if (!emp || !v || vueLibre()) return v;
  const cx = v.x + v.w / 2, cy = v.y + v.h / 2;
  const mx = v.w * DEBORD_VUE, my = v.h * DEBORD_VUE;
  const nx = Math.max(emp.x0 - mx, Math.min(emp.x1 + mx, cx));
  const ny = Math.max(emp.y0 - my, Math.min(emp.y1 + my, cy));
  v.x += nx - cx; v.y += ny - cy;
  return v;
}

export const appliqueVue = (enGeste = false) => {
  retiensVue(vue());
  for (const f of suiveurs) f();
  /* Le fond de carte, avant toute chose : il ne dépend que de la vue, et le
     chemin du rendu par la carte graphique sort plus bas sans passer par la
     « viewBox ». Posé là, il suit la vue quel que soit le rendu du plan. */
  dessineFondCarte(enGeste);
  /* Le plan peint par la carte graphique ne lit pas la « viewBox » : la vue
     part vers elle, et le SVG caché garde sa géométrie figée. */
  if (RENDU_WEBGL && !GL.actif) monteWebgl();
  if (GL.actif){
    vueWebgl(enGeste);
    majEditionWebgl();
    // les poignées d'une forme choisie gardent leur taille à l'écran pendant le zoom
    if (enEdition()) prete.dessinePoignees();
    if (enEdition()) prete.dessinePoigneesGeo();
    // tant que la première image n'est pas dessinée, le SVG montre le plan et suit la vue
    if (GL.pret) return;
  }
  const view = vue();
  svg.setAttribute("viewBox", view.x + " " + view.y + " " + view.w + " " + view.h);
  vueEcrite = { x: view.x, y: view.y, w: view.w, h: view.h };
  poseFacteurTrait(view);
  if (libPeints) etireLibelles();
  prete.dessinePoignees();
  prete.dessinePoigneesGeo();
  // le trait de l'itinéraire garde son épaisseur ; ses pastilles, non
  prete.rafraichitBouts();
  // et la pointe des lignes fléchées, pas davantage
  prete.rafraichitFleches();
  // le point de la borne, pas davantage non plus
  prete.rafraichitBorne();
};
/* Rafraîchir la vue coûte deux choses de nature très différente. Poser le
   « viewBox » est immédiat. Recalculer les libellés parcourt les cinq cents
   objets du pavillon et mesure chaque texte pour décider s'il tient et s'il
   reste lisible : près de six millisecondes sur un poste de bureau, bien
   davantage sur un téléphone, là où une image n'en a que seize.

   Pendant un geste on ne fait donc que le premier, et une seule fois par
   image — un écran tactile échantillonne souvent deux fois plus vite qu'il
   n'affiche, et le travail était fait deux fois pour rien. Les libellés
   attendent : leur taille étant exprimée en mètres, ils grandissent avec le
   plan sans qu'on y touche. Seul leur tri par lisibilité patiente, jusqu'à la
   fin du geste ou une pause de la main. */
/** @type {any} */
let imageDemandee = null, libellesEnAttente = null;

/**
 * Ce qu'un changement de vue, et lui seul, oblige à refaire des noms.
 *
 * En SVG, tout : `libelles` choisit pour la vue du moment ce qui tient dans
 * chaque forme et ce qui reste lisible, et il faut le refaire.
 *
 * Sous la carte graphique, rien. Les noms y sont préparés une fois pour
 * toutes, avec leurs seuils de zoom, et c'est le shader qui les montre ou les
 * tait — `libellesWebgl` ne lit pas `view`. Le parcourir quand même relisait
 * les six cents emplacements, habillait chaque nom, recomposait la clé de
 * comparaison, la trouvait identique et jetait tout : quelques dizaines de
 * millisecondes sur un téléphone, prises deux fois là où elles se voient le
 * plus — au doigt levé, et au milieu du geste, la pause de la main déclenchant
 * le retri. C'est ce qui se sentait comme des saccades en déplaçant le plan.
 *
 * Reste ce que la vue change vraiment ici : ce qui garde sa taille à l'écran
 * quel que soit le zoom — pastilles de l'itinéraire, pointes de flèche, point
 * de la borne —, que `appliqueVue` court-circuite tant que le dessin tient le
 * plan. Un nom qui change, lui, ne passe pas par la vue : la recherche, la
 * sélection et les réglages appellent `libelles` pour leur compte.
 */
function libellesDeLaVue(){
  if (!GL.actif){ libelles(); return; }
  prete.rafraichitBouts();
  prete.rafraichitFleches();
  prete.rafraichitBorne();
}

/** Pendant un geste : le strict nécessaire, une fois par image. */
export function rafraichitVue(){
  if (!imageDemandee){
    imageDemandee = requestAnimationFrame(() => {
      imageDemandee = null;
      appliqueVue(true); echelle();
      // la poignée du calage se mesure en pixels : elle suit la vue
      if (prete.calage) prete.calage();
    });
  }
  clearTimeout(libellesEnAttente);
  libellesEnAttente = setTimeout(() => { libellesEnAttente = null; libellesDeLaVue(); }, 150);
}

/** À la fin d'un geste, ou pour un saut de vue : tout, sans attendre. */
export function poseVue(){
  stoppeZoom();
  if (imageDemandee){ cancelAnimationFrame(imageDemandee); imageDemandee = null; }
  clearTimeout(libellesEnAttente); libellesEnAttente = null;
  appliqueVue(); echelle(); libellesDeLaVue();
  if (prete.calage) prete.calage();
}

/**
 * Hauteur, en pixels, de ce que le tiroir ou la fiche cachent en bas du plan.
 *
 * Le cadre du plan occupe tout l'écran sur mobile, mais on n'en voit pas tout :
 * cadrer sur le cadre entier pousse une partie du plan sous le tiroir. Toute
 * mise en vue passe donc par cette mesure — l'ajustement comme le centrage sur
 * un stand, y compris celui déclenché par le cartouche des points d'intérêt.
 *
 * On raisonne sur les hauteurs au repos, jamais sur la position d'un élément en
 * cours de glissement : `offsetHeight` ignore la transformation, et la fiche
 * qui s'ouvre replie le tiroir sous elle.
 */
/* La hauteur de la barre du salon, redonnée à la feuille de style.

   Sur écran étroit elle se pose par-dessus le plan : ce qui s'ancre en haut de
   la scène — le bandeau de visée, le rappel « Vous êtes ici » — doit se ranger
   dessous, et personne d'autre qu'elle ne sait ce qu'elle mesure. Un nom de
   salon qui passe à la ligne la fait grandir, et la mesure suit.

   Sur le corps, pour la même raison que « --replie » : posée sur la racine,
   elle ferait repasser le style des sept mille nœuds du plan à chaque fois. */
function mesureBarre(){
  const b = $("bandeau");
  if (!b) return;
  /* Arrondie au pixel supérieur, et rendue à la barre elle-même : la scène
     occupe la rangée suivante de la grille, et elle commence donc là où la
     barre finit. Un nom de salon qui passe à la ligne lui donnait 79,59 —
     le plan, la liste et la fiche démarraient sur un demi-pixel, et leur
     texte s'y rejouait entre deux rangées au lieu d'une. Au supérieur, pour
     ne jamais rogner ce que la barre porte : c'est son contenu qui commande
     sa hauteur, on ne fait que la finir sur un pixel entier. */
  const px = Math.ceil(b.getBoundingClientRect().height) + "px";
  if (b.style.minHeight !== px) b.style.minHeight = px;
  if (document.body.style.getPropertyValue("--barre") !== px)
    document.body.style.setProperty("--barre", px);
}

/**
 * Ce que la barre du salon cache du plan, en pixels.
 *
 * Sur écran étroit elle ne prend plus son rang dans la grille : elle se pose
 * par-dessus la scène, qui occupe toute la hauteur. Le haut du plan passe donc
 * dessous, et un cadrage qui l'ignorerait poserait derrière elle le stand
 * qu'on vient d'ouvrir — la même faute que celle du tiroir en bas, dans
 * l'autre sens.
 *
 * Ailleurs elle garde son rang et ne cache rien : écran large, administration,
 * où la bande de l'outil tient le premier rang.
 */
export function masqueHaut(){
  const b = $("bandeau");
  if (!ETROIT() || !b || document.documentElement.classList.contains("mode-admin")) return 0;
  // au-delà, il ne resterait plus assez de plan pour que le cadrage ait un sens
  return Math.max(0, Math.min(cadrePlan().height * .4, b.getBoundingClientRect().height));
}

export function masque(){
  if (!ETROIT()) return 0;
  const r = cadrePlan();
  const fiche = $("detail"), tiroir = $("side");
  const ficheOuverte = !!fiche && fiche.classList.contains("open");
  let bas = ficheOuverte ? fiche.offsetHeight : 0;
  /* L'itinéraire occupe la même bande, et c'est en l'ouvrant qu'on demande à
     cadrer sur le trajet : l'oublier ici reviendrait à le tracer sous lui. */
  const iti = $("itineraire");
  if (iti && iti.classList.contains("open")) bas = Math.max(bas, iti.offsetHeight);
  if (tiroir){
    /* Sur le corps, là où la mesure la pose — lue sur la racine elle revenait
       vide, et le repli de 164 px tenait lieu de mesure pour une bande qui en
       fait quatre-vingt-dix. Trente pixels de masque en trop, et la moitié en
       décalage sur tout ce qui cadre. La lecture d'à côté, celle du glissement,
       le disait déjà. */
    bas = Math.max(bas, ficheOuverte
      ? parseFloat(getComputedStyle(document.body)
          .getPropertyValue("--replie")) || 164
      : r.bottom - tiroir.getBoundingClientRect().top);
  }
  // au-delà, il ne resterait plus assez de plan pour que le cadrage ait un sens
  return Math.max(0, Math.min(r.height * .6, bas));
}

/**
 * Largeur, en pixels, de ce que le volet de droite cache du plan.
 *
 * Sur un écran large la fiche, le parcours et l'itinéraire ne partagent pas la
 * place : ils se posent par-dessus le plan, le long du bord droit. Cadrer sur
 * la largeur entière pousse donc le bord droit du tracé sous le volet — et
 * c'est là que se trouve l'arrivée d'un itinéraire demandé depuis une fiche.
 *
 * On mesure la largeur au repos plutôt que la position à l'écran : le volet
 * arrive en glissant, et un cadrage demandé pendant la transition mesurerait
 * un volet encore à moitié dehors.
 */
export function masqueDroite(){
  if (ETROIT()) return 0;
  const r = cadrePlan();
  let cote = 0;
  ["detail", "parcours", "itineraire"].forEach(id => {
    const v = $(id);
    if (v && v.classList.contains("open")) cote = Math.max(cote, v.offsetWidth);
  });
  return Math.max(0, Math.min(r.width * .6, cote));
}

export function fit(){
  const r = cadrePlan();
  const cache = masque(), haut = masqueHaut();
  const hUtile = Math.max(60, r.height - cache - haut);
  const w = emp.x1 - emp.x0, h = emp.y1 - emp.y0;
  const k = Math.max(w / (r.width || 1), h / hUtile);
  changeVue({ x: emp.x0 + w / 2 - (k * r.width) / 2,
           /* Le plan se centre dans la bande visible, pas dans le cadre
              entier : le tiroir en mange le bas, la barre du salon le haut
              depuis qu'elle se pose dessus, et le décalage est la différence
              des deux. */
           y: emp.y0 + h / 2 - (k * r.height) / 2 + (k * (cache - haut)) / 2,
           w: k * r.width, h: k * r.height });
  if (cameraEnJeu()) recadreIncline(r, haut, cache);
  poseVue();
}

/**
 * Le cadrage, revu pour la vue immersive.
 *
 * Incliné, le hall ne prend plus à l'écran la place qu'il prend à plat : sa
 * profondeur se tasse, son fond rapetisse, et l'ajuster comme vu d'en haut le
 * laissait petit au milieu d'une scène vide. On regarde donc où ses quatre
 * coins tombent une fois inclinés, et l'on resserre le cadre d'autant, en
 * ramenant leur milieu au centre de la bande visible. La fuite ne dépend pas
 * du zoom mais de la scène : quelques passes suffisent à tomber juste.
 */
function recadreIncline(/** @type {DOMRect} */ r, /** @type {number} */ haut, /** @type {number} */ cache){
  const MARGE = 28;
  const bx0 = MARGE, bx1 = r.width - MARGE, by0 = haut + MARGE, by1 = r.height - cache - MARGE;
  if (bx1 - bx0 < 60 || by1 - by0 < 60) return;
  const coins = [[emp.x0, emp.y0], [emp.x1, emp.y0], [emp.x1, emp.y1], [emp.x0, emp.y1]];
  for (let passe = 0; passe < 4; passe++){
    const v = vue();
    const vus = coins.map(([x, y]) => incline((x - v.x) / v.w * r.width, (y - v.y) / v.h * r.height));
    const xs = vus.map(c => c[0]), ys = vus.map(c => c[1]);
    const sx0 = Math.min(...xs), sx1 = Math.max(...xs), sy0 = Math.min(...ys), sy1 = Math.max(...ys);
    const f = Math.max((sx1 - sx0) / (bx1 - bx0), (sy1 - sy0) / (by1 - by0));
    // le milieu des coins, ramené au milieu de la bande : l'écart, mesuré sur le sol
    const a = ecranVersPlat((sx0 + sx1) / 2, (sy0 + sy1) / 2, r.width, r.height);
    const b = ecranVersPlat((bx0 + bx1) / 2, (by0 + by1) / 2, r.width, r.height);
    const mx = v.x + (a[0] - b[0]) / r.width * v.w, my = v.y + (a[1] - b[1]) / r.height * v.h;
    const w = v.w * f, h = v.h * f;
    changeVue({ x: mx + (v.w - w) / 2, y: my + (v.h - h) / 2, w, h });
  }
}
/* Le zoom par crans, et la saccade qu'il donnait.

   Une molette envoie des crans, un pavé tactile une pluie de petits
   mouvements. Appliquer à chacun le même facteur fixe ratait les deux : la
   souris sautait de dix-huit pour cent d'un coup, sans rien entre les deux
   images ; le pavé, qui envoie plusieurs événements par image, les
   multipliait entre eux — le plan bondissait au lieu de glisser.

   Deux corrections, donc, et elles vont ensemble. Le facteur suit l'ampleur
   du geste au lieu d'être constant (voir l'écouteur « wheel »), et la vue
   qu'on vise se distingue de celle qu'on montre : un cran pousse la première,
   chaque image rapproche la seconde d'une fraction de ce qui les sépare.

   L'interpolation porte sur les quatre nombres à la fois et reste linéaire :
   le point visé se retrouve alors exactement sous le curseur à chaque image
   du trajet, et non seulement à l'arrivée. */
/* La vue visée, que la fiche importe (`fiche.mjs`
   `centrePoint`) ; seul le trajet la pose, par `glisseVers`. */
/** @type {any} */
export let vise = null;
/** @type {any} */
let imageZoom = null;

export function stoppeZoom(){
  if (imageZoom){ cancelAnimationFrame(imageZoom); imageZoom = null; }
  vise = null;
  rendTextes();
}

/* La demi-vie du trajet, en millisecondes : le temps qu'il faut pour couvrir
   la moitié de ce qui reste.

   Un centrage sur un stand garde quarante-cinq millisecondes : il déplace la
   vue sans qu'on l'ait poussée, et doit se laisser suivre des yeux. Un cran de
   molette en prend vingt-cinq. À quarante-cinq, la main sentait le retard :
   la première image ne parcourait qu'un dixième du cran, et il fallait un
   dixième de seconde pour que le plan semble partir — davantage là où le
   dessin ne tient pas chaque image, en vue immersive sur un vrai salon. */
const DEMI_VIE = 45, DEMI_VIE_MOLETTE = 25;
let demiVie = DEMI_VIE;

function glisseVersVise(){
  if (imageZoom) return;
  /* Le geste date d'avant la première image : compter depuis lui ne laissait
     à cette image que les quelques millisecondes écoulées, un pas à peine
     visible. Elle compte pour une image entière. */
  let precedent = performance.now() - 16;
  const pas = (/** @type {number} */ maintenant) => {
    imageZoom = null;
    if (!vise) return;
    /* Le rapprochement se compte en millisecondes, non en images : sans quoi
       un écran à 120 Hz arriverait deux fois plus vite qu'un écran à 60. */
    const dt = Math.min(64, maintenant - precedent) || 16;
    precedent = maintenant;
    figeTextes();
    const k = 1 - Math.pow(.5, dt / demiVie);
    const but = vise, avant = vue();
    const view = { x: avant.x + (but.x - avant.x) * k, y: avant.y + (but.y - avant.y) * k,
                   w: avant.w + (but.w - avant.w) * k, h: avant.h + (but.h - avant.h) * k };
    changeVue(view);
    /* Assez près pour que l'œil n'y voie rien : on s'y pose, et les libellés
       se retrient enfin — c'est la fin du geste.

       Les quatre nombres comptent, et non la seule largeur. Un cran de molette
       la fait toujours varier, si bien qu'elle suffisait à dire où l'on en
       était ; aller sur un point du plan ne la change pas forcément — on s'y
       déplace sans s'en approcher — et le trajet s'arrêtait alors à sa
       première image, juste avant de commencer. */
    const reste = Math.max(Math.abs(but.x - view.x), Math.abs(but.y - view.y),
                           Math.abs(but.w - view.w), Math.abs(but.h - view.h));
    if (reste < but.w * .002){
      changeVue(but); vise = null; poseVue(); return;
    }
    appliqueVue(true); echelle();
    imageZoom = requestAnimationFrame(pas);
  };
  imageZoom = requestAnimationFrame(pas);
}

/**
 * Viser une vue, et y aller en glissant.
 *
 * Le seul chemin pour déplacer la vue autrement que d'un coup : le zoom par
 * crans s'en sert, le centrage sur un stand ou sur un repère aussi. Qui refuse
 * les animations s'y pose tout de suite — « poseVue » arrête au passage le
 * trajet qui serait en cours.
 */
export function glisseVers(/** @type {any} */ but, demi = DEMI_VIE){
  /* Le but est retenu d'avance : retenu en chemin seulement, le trajet
     viserait un point qu'il n'atteint jamais, et ne finirait pas. */
  but = retiensVue(Object.assign({}, but));
  if (REDUIT){ changeVue(but); poseVue(); return; }
  vise = but;
  demiVie = demi;
  /* Le trajet change l'échelle — un cran de molette, un centrage qui
     rapproche — et c'est ce qui coûte : le plan se tait le temps qu'il dure. */
  figeTextes();
  glisseVersVise();
}


/**
 * Où un nœud du plan se trouvera quand la vue aura fini son trajet.
 *
 * La fiche s'ouvre en s'étirant depuis la forme qu'on a choisie, et il faut
 * pour cela sa place à l'écran. Elle l'avait tant que le centrage se faisait
 * d'un coup : la forme était déjà arrivée. Elle glisse maintenant, et la
 * mesurer en chemin ferait partir la fiche d'un point de passage — le plus
 * souvent hors du cadre, la forme venant à peine d'y entrer.
 *
 * La vue visée est donc posée le temps de la mesure, puis retirée. Deux
 * écritures de « viewBox » de plus, et la géométrie est celle du navigateur
 * plutôt qu'un calcul refait à la main pour chaque sorte de forme.
 */
export function rectVisee(/** @type {any} */ n){
  if (!n) return null;
  if (GL.actif) return rectEcranWebgl(n, vise || vue());
  if (!vise) return n.getBoundingClientRect();
  const avant = vue();
  changeVue(vise); appliqueVue();
  const r = n.getBoundingClientRect();
  changeVue(avant); appliqueVue();
  return r;
}

/**
 * Zoom d'un facteur `f` autour d'un point du cadre donné en fraction de sa
 * largeur et de sa hauteur — `.5, .5` pour le centre, la position du curseur
 * pour la molette.
 *
 * Les crans s'enchaînent sur la vue visée, non sur la vue affichée : deux
 * tours de molette rapides comptent double, sans que le second reparte du
 * trajet que le premier n'avait pas fini de parcourir.
 */
export function zoom(/** @type {number} */ f, /** @type {number} */ fx, /** @type {number} */ fy){
  const base = vise || vue();
  /* Jusqu'où l'on recule : `recul()` ouvre la limite quand le quartier a été
     dessiné autour du pavillon, et la garde serrée quand il n'y a rien à voir
     au-delà des murs. */
  const nw = Math.min((emp.x1 - emp.x0) * recul(), Math.max(6, base.w * f)), k = nw / base.w;
  glisseVers({ x: base.x + fx * (base.w - nw), y: base.y + fy * base.h * (1 - k),
               w: nw, h: base.h * k }, DEMI_VIE_MOLETTE);
}
/* Ce que la règle affiche déjà. Écrire `textContent` remplace le texte même
   quand il ne change pas — le nœud est jeté et refait, et la règle se remet en
   page à chaque image d'un glissement, où pourtant l'échelle ne bouge pas. */
/** @type {number | null} */
let _pasEchelle = null;
function echelle(){
  const r = cadrePlan();
  const mParPx = vue().w / (r.width || 1);
  const pas = [1, 2, 5, 10, 20, 50, 100, 200].find(p => p >= mParPx * 90) || 200;
  $("scaleBar").style.width = (pas / mParPx) + "px";
  if (pas === _pasEchelle) return;
  _pasEchelle = pas;
  $("scaleTxt").textContent = pas + " m";
}

/* --- conversion écran → repère du plan --- */
/** @returns {[number, number]} */
export function versPlan(/** @type {number} */ clientX, /** @type {number} */ clientY){
  [clientX, clientY] = redresse(clientX, clientY);
  const r = cadrePlan(), view = vue();
  return [ +(view.x + (clientX - r.left) / r.width * view.w).toFixed(2),
           +(view.y + (clientY - r.top) / r.height * view.h).toFixed(2) ];
}

/**
 * Le branchement, appelé par `lancement.mjs` `lancePlan` à son rang : les
 * écoutes du cadre et de la barre s'y posent à leur place parmi
 * celles du plan — avant le recadrage que `demarrage.mjs` pose sur « resize ».
 */
export function brancheVue(){
  calqueLib = $("calqueLibelles");
  svgLib = calqueLib.firstElementChild;
  addEventListener("resize", oublieCadre);
  addEventListener("scroll", oublieCadre, true);
  if (window.ResizeObserver) new ResizeObserver(oublieCadre).observe(svg);
  mesureBarre();
  addEventListener("resize", mesureBarre);
  if (window.ResizeObserver && $("bandeau"))
    new ResizeObserver(mesureBarre).observe($("bandeau"));
}

/* Le rendu par la carte graphique et le fond de carte, que ce module importe,
   lisent la vue et ne peuvent l'importer : elle la leur confie en se
   chargeant — par des lecteurs, puisque chaque geste la remplace. */
confieAuWebgl({ appliqueVue });

/* Le plan se pose à plat avant que la carte graphique n'arrive, et c'est elle
   qui incline la vue : le hall cadré d'en haut se retrouvait petit au milieu
   de la scène. Il se recadre donc quand la caméra entre en jeu, en sort, ou
   que l'exploitant tourne le hall. */
CAMERA_CHANGEE.suis(() => { if (emp && vue()) fit(); });
