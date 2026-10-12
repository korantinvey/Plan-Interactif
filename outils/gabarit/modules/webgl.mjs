/* ============================================================
   13 bis. Le plan peint par la carte graphique — WebGL2

   Le SVG remet le plan en page et le repeint à chaque image d'un zoom : son
   coût grandit avec le nombre de formes, et les noms, qu'il faudrait
   re-rastériser à chaque taille, doivent se taire pendant le geste. Ici la
   carte graphique redessine tout d'un changement de matrice, noms compris.

   Ce rendu ne réécrit ni le plan ni ses règles. Le SVG reste construit comme
   avant, caché : c'est lui qui dit quoi dessiner, dans quel ordre et de
   quelle couleur — secteurs, sélection, retrait de la recherche, calques
   dessinés, itinéraire. Ce module le relit et le repeint. Deux peintres pour
   un seul modèle : le jour où une règle de style change, elle change pour
   les deux.

   Deux exceptions, et elles sont voulues. Les noms ne sont pas relus : le SVG
   les choisit pour la vue du moment, alors qu'ici on les prépare une fois
   pour toutes et la carte graphique les montre ou les tait selon le zoom. Et
   les gestes restent au SVG, transparent au-dessus du dessin : le zoom, le
   pincement, la glissade n'ont pas été touchés.

   C'est le rendu par défaut, dès que le navigateur a WebGL2 et que la
   bibliothèque arrive. Sinon le plan reste en SVG : c'est le repli des
   appareils qui ne l'ont pas. `?rendu=svg` le force, pour comparer ou pour
   écarter le dessin le temps d'un dépannage.

   Ce module lit la vue, le SVG et son cadre dans `vue-etat.mjs` ; le reste,
   les modules qui l'importent le lui confient en se chargeant
   (`confieAuWebgl`) : l'application de la vue, les gestes, l'édition en
   cours, et la préparation des noms, qui tient aux règles des libellés. Ce qu'il lit du SVG passe par `trace.mjs` ; le
   placement des libellés à la main s'importe (`libelle-place.mjs`).
   ============================================================ */
import { avive, eclate } from "./couleurs.mjs";
import { $ } from "./dom.mjs";
import { M_ID, mulM, appM, echelleM, lisTransform, lisTrace, lisPoints, num, anneau, rectArrondi,
  avecTrous, couleurGl } from "./trace.mjs";
import { PLACE_LIBELLES } from "./libelle-place.mjs";
import { MODES_TRANSPORT } from "./reperes.mjs";
import { svg, vue as vueDuPlan, cadrePlan } from "./vue-etat.mjs";
import { TRAIT_PLEIN, TRAIT_PLANCHER } from "./chemin-forme.mjs";
import { meuble, TYPES_MEUBLES, objetRepere, OBJETS_REPERE, ECHELLE_PASTILLE } from "./decor.mjs";
import { placeFigurants, maillagesFigurant, maillageReuni, graineDe, TENUES, TEINTS, CHEVEUX, CHAUSSURES, OMBRE } from "./figurants.mjs";
import { grille, PAS_GRILLE, enveloppe as enveloppeDuSalon } from "./itineraire.mjs";
import { couchesLogos, logosARevoir, PANNEAU_PRET, CLASSE_LOGOS } from "./logos-stands.mjs";
import { DATA, P } from "./donnees.mjs";
import { CAMERA_CHANGEE, cameraVoulue, cleCamera, metsEnJeu, cameraEnJeu, matricesCamera, HAUTEUR_STAND, HAUTEUR_LIBRE,
  HAUTEUR_ZONE, HAUSSE_CHOIX, SINUS_INCLINAISON, TRAJET_CHANGE, boutsDuTrajet, HAUTEUR_ABAISSEE, capCamera } from "./camera.mjs";

/* Ce que le module demande au plan sans pouvoir l'importer, confié par la
   porte plus bas. Rien de cela ne sert avant — le dessin ne monte qu'une fois
   la bibliothèque arrivée, et celle-ci n'est demandée qu'au branchement. */
/**
 * @typedef {object} PageWebgl
 * @property {() => void} appliqueVue
 * @property {() => void} libelles
 * @property {() => boolean} enEdition
 * @property {() => any} drag le glissé en cours
 * @property {() => any} pince le pincement en cours
 * @property {() => void} libellesWebgl
 */
/** @type {PageWebgl} */
const _page = { appliqueVue: () => {}, libelles: () => {},
  enEdition: () => false, drag: () => null, pince: () => null,
  libellesWebgl: () => {} };
/* Ce que ce rendu appelle chez les modules qui l'importent — l'application
   de la vue (`vue.mjs`), les noms (`libelles.mjs`), l'édition en cours
   (`edition-en-cours.mjs`), le glissé et le pincement (`gestes.mjs`). Il ne
   peut les importer : chacun l'importe. Chacun le lui confie donc au
   chargement de son module, avant que rien ne se dessine. La vue du moment,
   le SVG — le modèle, caché, que ce rendu relit — et son cadre, il les lit
   dans `vue-etat.mjs`.
   @param {Partial<PageWebgl>} o */
export function confieAuWebgl(o){ Object.assign(_page, o); }

export const RENDU_WEBGL = new URLSearchParams(location.search).get("rendu") !== "svg";
/* Version figée, empreinte vérifiée : une bibliothèque qui changerait sous
   nos pieds changerait le plan des visiteurs sans que rien ne soit publié.
   La 9.3 et non la 9.4 : sur la carte graphique d'essai, la 9.4.0 ne
   dessinait plus les points.

   Servie par le site lui-même, comme les polices : un réseau tiers aurait
   reçu l'adresse de chaque visiteur, et sa panne privait le plan du dessin.
   Le nom du fichier porte la version — il ne change jamais sous une même
   adresse, et le service hors ligne le garde tel quel.

   Réduite aux classes que ce module emprunte à `deck` : la bibliothèque
   entière pesait 470 Ko compressés, celle-ci 213. Elle se refait par
   `npm run deck` (`outils/deck.js`), qui dit le nom et l'empreinte à
   reporter ici — et une classe de plus employée ci-dessous doit d'abord s'y
   ajouter. */
const DECK_WEBGL = {
  src: "bibliotheques/deck.gl-9.3.11-plan-53efd7e8.min.js",
  integrite: "sha384-RgImRMIyrd9hP0UaVP6ndqdVVIGUnZ7JVuk0LuYnVHqAYAOqHaGRzJPpuWdEDR1k",
};
export const GL = {
  charge: false, actif: false, deck: null, geste: false,
  blocs: new Map(), sales: new Set(), tout: true, image: 0,
  libelles: [], cleLibelles: "", couchesLibelles: null, pastilles: [], dessines: new Map(),
  groupes: new Map(), survol: null, focus: null, libellesPhare: [], temps: 0, imageAnim: 0, cleAnim: "",
  modeles: new Map(), tailles: new Map(), duree: 0,
  hote: null, toile: null, branche: false, veille: false, aRemonter: false, attente: 0, remontes: 0, abandon: false,
  // la clé d'un bloc vit hors du DOM : l'écrire dans le SVG réveillerait le guet
  cles: new WeakMap(), compteur: 0, versionModeles: 0, signatureModeles: "",
  // la vue immersive est-elle à l'écran — voir « La vue immersive »
  camera: false,
  // la reconversion en cours change le plan entier de hauteur : sans mouvement
  massif: false,
  /** @type {number[] | null} le sol du hall, sur lequel un volume rend sa transparence */
  sol: null,
};

function chargeWebgl(){
  if (!RENDU_WEBGL) return;
  let gl2 = null;
  try { gl2 = document.createElement("canvas").getContext("webgl2"); } catch (e) {}
  if (!gl2) return;
  /* Le plan ne paraît qu'une fois. Montré d'abord en SVG puis remplacé par
     le dessin, il semblait se charger deux fois — les noms n'étant pas les
     mêmes d'un rendu à l'autre. Le SVG attend donc caché, et ne sert qu'en
     secours : bibliothèque introuvable, ou dessin trop long à venir. */
  const racine = document.documentElement;
  racine.classList.add("gl-attente");
  const secours = () => racine.classList.remove("gl-attente");
  setTimeout(secours, 4000);
  const s = document.createElement("script");
  s.src = DECK_WEBGL.src; s.integrity = DECK_WEBGL.integrite;
  s.onload = () => { GL.charge = true; monteWebgl(); };
  s.onerror = () => { secours(); console.warn("Rendu WebGL : bibliothèque indisponible, le plan reste en SVG."); };
  document.head.appendChild(s);
}

/**
 * Brancher le rendu sur le plan, appelé par `lancement.mjs` `lancePlan` à son
 * rang : la bibliothèque n'est demandée qu'ici, au même moment qu'avant
 * parmi le reste du plan.
 */
export function brancheWebgl(){
  chargeWebgl();
}

/** Le dessin prend la main dès que la bibliothèque et le plan sont là, dans
 *  n'importe quel ordre : c'est « appliqueVue » qui rappelle, une fois la vue
 *  posée. */
export function monteWebgl(){
  if (GL.actif || !GL.charge || !window.deck || !vueDuPlan()) return;
  /* Après une perte de contexte, c'est « remonteWebgl » qui dit quand : la
     vue repasse par ici à chaque geste, et remonterait le dessin sur-le-champ
     — sur la mémoire qui vient justement de manquer. */
  if (GL.aRemonter || GL.attente || GL.abandon) return;
  const hote = document.createElement("div");
  hote.className = "plan-gl";
  hote.setAttribute("aria-hidden", "true");
  svg.before(hote);
  GL.hote = hote;
  GL.camera = enCamera();
  GL.deck = new deck.Deck({
    parent: hote, controller: false,
    views: vuesGl(), effects: effetsGl(),
    viewState: vueDeck(), layers: [],
    layerFilter: filtreCouches,
    onError: e => console.warn("Rendu WebGL :", e && e.message),
    // la toile ne naît qu'avec la carte graphique, que la bibliothèque prépare à part
    onLoad: poseToileWebgl,
    // le SVG reste à l'écran jusqu'à la première image du dessin : voir « gl-pret »
    onAfterRender: () => {
      if (GL.pret || !GL.deck.props.layers.length) return;
      GL.pret = true;
      document.documentElement.classList.add("gl-pret");
      document.documentElement.classList.remove("gl-attente");
    },
  });
  GL.actif = true;
  /* La caméra n'entre en jeu qu'une fois le dessin actif : son annonce fait
     recadrer la vue, qui repasse par ici et remonterait le dessin. */
  metsEnJeu(GL.camera);
  /* La bibliothèque ne garde que trois atlas de police, et le plan en demande
     un par famille, par graisse et par taille — deux tailles de rendu, autant
     de familles que l'exploitant a choisies pour ses noms et ses numéros. Au
     quatrième, les atlas se chassaient l'un l'autre et se refabriquaient en
     boucle : mesuré à deux cent quatre-vingts millisecondes de plus par
     ouverture de fiche, sur un salon qui n'employait que quatre combinaisons.
     La limite est un simple nombre d'entrées gardées ; on la relève une fois. */
  try { deck.TextLayer.fontAtlasCacheLimit = 24; } catch (e) {}
  document.documentElement.classList.add("rendu-webgl");
  poseModelesLibelles();
  guetteContexteWebgl();

  /* Le guet du SVG et les écoutes ne se posent qu'une fois : le dessin peut
     remonter après une perte de contexte, le SVG qu'ils surveillent, lui, n'a
     pas bougé. */
  if (!GL.branche){
    GL.branche = true;
    /* Ce qui change le dessin passe par le SVG caché : on le guette plutôt que
       d'appeler le peintre depuis chaque fonction qui touche au plan. Seule la
       vue n'y passe pas — elle ne s'écrit plus dans la « viewBox ». */
    new MutationObserver(notes => {
      for (const n of notes){
        const b = blocDe(n.target);
        if (b === "ordre") GL.ordre = true;
        else if (b) GL.sales.add(b);
        // un stand qui monte ou s'abaisse emporte ses marques, posées sur son dessus
        if (b && b !== "ordre" && b.id === "stands" && GL.camera && $("dists")) GL.sales.add($("dists"));
      }
      // ouvrir un calque se lit ici : c'est lui qui prend la classe « editable »
      majEditionWebgl();
      anticipeHausses(notes);
      planifieWebgl();
    }).observe(svg, { subtree: true, childList: true, attributes: true, characterData: true });
    // le mode carte de chaleur, un calque de noms éteint, une couleur réglée :
    // autant de classes et de jetons posés sur la racine, que la feuille lit
    /* Une écriture qui repose la même valeur n'est pas un changement, mais le
       guet la signale quand même — et repeindre tout le plan coûte un demi-
       millier de millisecondes. On compare donc l'avant et l'après : une frappe
       dans la recherche remesurait le cartouche, réécrivait la même hauteur, et
       faisait reconvertir les six cents stands à chaque lettre. */
    new MutationObserver(notes => {
      if (notes.every(n => n.oldValue === document.documentElement.getAttribute(n.attributeName))) return;
      majEditionWebgl();
      // l'ambiance ou le cap de l'immersif : la vue suit, avec le reste
      if (!basculeCamera()){ GL.deck.setProps({ viewState: vueDeck() }); toutRepeindreWebgl(); }
    }).observe(document.documentElement, { attributes: true, attributeOldValue: true,
      attributeFilter: ["class", "style"] });
    if (document.fonts) document.fonts.addEventListener("loadingdone", toutRepeindreWebgl);
    /* Un logo prêt à se poser n'a rien à reconvertir : le prochain
       assemblage le pose, et aucun bloc n'est sali. Le nom de son stand, lui,
       doit apprendre à lui céder la place. */
    PANNEAU_PRET.suis(() => {
      if (!GL.camera || !document.documentElement.classList.contains(CLASSE_LOGOS)) return;
      _page.libellesWebgl();
      planifieWebgl();
    });

    brancheSurvolWebgl();
  }
  _page.libellesWebgl();
  toutRepeindreWebgl();
}

/* ------------------------------------------------------------
   Le contexte perdu.

   Un téléphone à court de mémoire reprend la carte graphique aux onglets
   qu'on a quittés. Au retour, la toile est morte — le navigateur y peint un
   petit visage triste — et le plan reste blanc : le SVG, lui, est caché,
   puisque le dessin était censé le montrer à sa place. C'est le seul endroit
   où le rendu par la carte graphique peut laisser la page sans plan du tout.

   On rend donc la main au SVG dès la perte : il n'a jamais cessé d'être tenu
   à jour, il lui manque seulement la vue, que le dessin ne lui écrivait plus.
   Puis le dessin remonte, sur une toile neuve — la bibliothèque ne refait pas
   ses ressources sur un contexte rendu, et sa toile morte part avec elle.

   Deux prudences. Remonter seulement quand la page est visible : un contexte
   demandé pendant que l'onglet dort serait repris aussitôt. Et pas
   indéfiniment : un appareil qui le reprend à chaque fois garde le SVG,
   plutôt que de faire clignoter le plan.
   ------------------------------------------------------------ */
const REMONTES_WEBGL = 3;
/* Le temps qu'il faut à la mémoire pour retomber. Redemandé dans la seconde,
   le contexte se reperd. */
const ATTENTE_REMONTE = 600;

function poseToileWebgl(){
  if (!GL.actif || GL.toile) return;
  GL.toile = (GL.deck.getCanvas && GL.deck.getCanvas()) || (GL.hote && GL.hote.querySelector("canvas"));
  if (GL.toile) GL.toile.addEventListener("webglcontextlost", perdContexteWebgl);
}

function guetteContexteWebgl(){
  poseToileWebgl();
  if (GL.veille) return;
  GL.veille = true;
  /* L'événement peut ne jamais venir : l'onglet dormait quand la carte
     graphique lui a été reprise. Au retour, on regarde la toile nous-mêmes. */
  document.addEventListener("visibilitychange", verifieContexteWebgl);
  addEventListener("pageshow", verifieContexteWebgl);
}

const contextePerduWebgl = () => {
  if (!GL.toile) return false;
  let gl = null;
  try { gl = GL.toile.getContext("webgl2"); } catch (e) {}
  return !gl || gl.isContextLost();
};

function verifieContexteWebgl(){
  if (document.visibilityState !== "visible") return;
  if (!GL.actif){ remonteWebgl(); return; }
  poseToileWebgl();
  if (contextePerduWebgl()) perdContexteWebgl();
}

/** Le SVG reprend le plan, tel qu'il est : tout ce qui tenait à l'ancienne
 *  carte graphique est jeté, couches comprises. */
function perdContexteWebgl(){
  if (!GL.actif) return;
  console.warn("Rendu WebGL : contexte perdu, le plan repasse en SVG.");
  GL.actif = false; GL.pret = false;
  // le SVG ne sait pas se pencher : le plan revient à plat, et les gestes avec
  GL.camera = false; metsEnJeu(false);
  document.documentElement.classList.remove("rendu-webgl", "gl-pret", "gl-attente", "en-edition");
  stage().classList.remove("survol-gl");
  GL.survol = null; GL.focus = null; TUILES.clear();
  try { GL.deck.finalize(); } catch (e) {}
  GL.deck = null;
  if (GL.hote) GL.hote.remove();
  GL.hote = null; GL.toile = null;
  GL.blocs.clear(); GL.sales.clear(); GL.groupes.clear();
  GL.couchesLibelles = null; GL.cleLibelles = ""; GL.tout = true;
  GL.aRemonter = true;
  /* Le SVG ne suivait plus la vue depuis la première image du dessin, et ses
     noms étaient éteints : il les retrouve pour la vue du moment. */
  if (typeof _page.appliqueVue === "function") _page.appliqueVue();
  if (typeof _page.libelles === "function") _page.libelles();
  remonteWebgl();
}

function remonteWebgl(){
  if (GL.actif || !GL.aRemonter || GL.attente || document.visibilityState !== "visible") return;
  if (GL.remontes >= REMONTES_WEBGL){
    GL.aRemonter = false; GL.abandon = true;
    console.warn("Rendu WebGL : contexte repris trop souvent, le plan reste en SVG.");
    return;
  }
  GL.remontes++;
  GL.attente = setTimeout(() => {
    GL.attente = 0; GL.aRemonter = false;
    // la carte graphique peut refuser la toile suivante : le SVG garde alors le plan
    monteWebgl();
  }, ATTENTE_REMONTE);
}

/** La vue du plan, dite comme la bibliothèque l'attend : un centre et une
 *  puissance de deux. Même règle que la « viewBox » — « meet », centrée. */
function vueDeck(){
  const r = cadrePlan(), view = vueDuPlan();
  const s = Math.min((r.width || 1) / view.w, (r.height || 1) / view.h);
  /* Le cap ne sert pas au cadre ; il y est pour que la bibliothèque refasse
     la vue quand l'exploitant tourne le hall sans bouger le plan — elle ne
     recompose ses matrices que sur un changement de l'état de la vue. */
  return { target: [view.x + view.w / 2, view.y + view.h / 2, 0], zoom: Math.log2(s), cap: cleCamera() };
}

/* ------------------------------------------------------------
   La vue immersive

   La même vue, vue de biais : le cadre à plat que les gestes manipulent ne
   change pas, la caméra (`camera.mjs`) l'incline par-dessus. La bibliothèque
   n'a pas de vue en perspective qui s'accorde à un cadre en mètres ; on lui
   en donne une, faite des matrices que la caméra calcule.

   À plat pendant l'édition : poser une forme, tirer une poignée, tracer un
   calque se fait au millimètre, et d'en haut.
   ------------------------------------------------------------ */
const enCamera = () => cameraVoulue() && !_page.enEdition();

/** @type {any} */
let VueCamera = null;
function vuesGl(){
  if (!GL.camera) return new deck.OrthographicView({ id: "plan", flipY: true });
  if (!VueCamera){
    class ViewportCamera extends deck.Viewport {
      constructor(/** @type {any} */ p){
        const { vue, projection } = matricesCamera(p.width || 1, p.height || 1, Math.pow(2, p.zoom || 0));
        super({ ...p, position: p.target, viewMatrix: vue, projectionMatrix: projection });
      }
    }
    VueCamera = class extends deck.View {
      getViewportType(){ return ViewportCamera; }
    };
  }
  return new VueCamera({ id: "plan" });
}

/* La lumière des volumes : une ambiance claire, qui garde aux stands la
   couleur que l'exploitant leur a donnée, et un jour qui vient du fond du
   hall et de la gauche. Les dessus reçoivent la lumière ; les façades qui
   regardent l'entrée restent dans leur ombre, et c'est ce qui les fait
   monter. Sans volume, pas de lumière : un aplat éclairé changerait de ton. */
function effetsGl(){
  if (!GL.camera) return [];
  return [new deck.LightingEffect({
    ambiante: new deck.AmbientLight({ color: [255, 255, 255], intensity: 1 }),
    jour: new deck.DirectionalLight({ color: [255, 255, 255], intensity: .5, direction: [.55, .9, -1] }),
  })];
}

/** La caméra demandée, ou rendue : la vue, la lumière et tout le dessin
 *  changent avec elle — les stands montent ou se couchent. */
function basculeCamera(){
  const cam = enCamera();
  if (!GL.deck || cam === GL.camera) return false;
  GL.camera = cam;
  metsEnJeu(cam);
  GL.deck.setProps({ views: vuesGl(), effects: effetsGl(), viewState: vueDeck() });
  toutRepeindreWebgl();
  return true;
}

/** Appelée à chaque image d'un geste : la matrice, et rien d'autre. Les noms
 *  qui passent un seuil de lisibilité se montrent ou se taisent dans le
 *  shader, qui connaît le zoom — voir « FiltreZoom ». */
export function vueWebgl(enGeste = false){
  basculeCamera();
  poseGeste(enGeste);
  const v = vueDeck();
  GL.deck.setProps({ viewState: v });
  // les logos des stands ne couvrent que les abords de la vue (`logos-stands.mjs`)
  if (GL.camera && logosARevoir(vueDuPlan(), v.zoom)) planifieWebgl();
}

/* ------------------------------------------------------------
   Le SVG caché, découpé en blocs : un par calque de la pile, puis ce qui vit
   hors des calques (marques, itinéraire). Chaque bloc garde ses couches
   deck.gl tant que rien n'y bouge.
   ------------------------------------------------------------ */
function blocDe(n){
  if (n === svg) return "ordre";
  const couches = $("couches");
  if (n === couches) return "ordre";
  let x = n.nodeType === 1 ? n : n.parentNode;
  // le nom d'un stand dessiné, que le SVG réécrit à chaque vue, est peint à part
  if (x && x.closest && x.closest(".lab")) return null;
  while (x && x.parentNode !== couches && x.parentNode !== svg) x = x.parentNode;
  if (!x || x.id === "labels") return null;
  return x;
}

/** Entrer ou sortir de l'édition change ce qui s'attrape : tout se repeint. */
export function majEditionWebgl(){
  if (!GL.actif) return;
  const r = document.documentElement, ed = _page.enEdition();
  if (r.classList.contains("en-edition") === ed) return;
  r.classList.toggle("en-edition", ed);
  if (!basculeCamera()) toutRepeindreWebgl();
}

/** La clé des couches d'un bloc. Elle tient au calque et non au nœud :
 *  l'éditeur recrée tous les calques de dessin à chaque mouvement de souris,
 *  et des couches renommées à chaque fois rechargeaient leurs images et
 *  remettaient leurs textes en page. */
function cleBloc(b){
  if (b.dataset && b.dataset.dcal) return "d:" + b.dataset.dcal;
  if (b.id) return "#" + b.id;
  if (!GL.cles.has(b)) GL.cles.set(b, "b" + (++GL.compteur));
  return GL.cles.get(b);
}

/**
 * Le peintre, à la première occasion — mais après que la page a montré ce
 * qu'elle vient d'écrire.
 *
 * Un « requestAnimationFrame » s'exécute dans la trame qui précède
 * l'affichage : le peintre y passait donc avant que le navigateur ne peigne
 * la fiche, et la reconversion du plan retardait ce qu'elle n'avait pas
 * écrit. Changer de fiche coûte vingt millisecondes ; poser la classe « sel »
 * sur un stand en salit le bloc entier, et le reconvertir — neuf cents
 * formes, chacune interrogée sur son style — en coûte trente de plus. La
 * fiche d'avant restait à l'écran tout ce temps, sur le seul écran où l'on
 * voit les deux à la fois.
 *
 * Le délai posé depuis la trame laisse celle-ci se peindre, et le plan suit
 * dans la suivante. Il ne rallonge rien : la reconversion coûte ce qu'elle
 * coûte, elle ne la paie simplement plus avant ce qu'on regarde. La vue, elle,
 * ne passe pas par là — un geste garde sa trame, « vueWebgl » la sert
 * directement.
 */
export function planifieWebgl(){
  if (!GL.actif || GL.image) return;
  GL.image = requestAnimationFrame(() => { GL.image = setTimeout(repeintWebgl, 0); });
}
function toutRepeindreWebgl(){
  GL.tout = true; GL.couchesLibelles = null;
  /* Le sol du hall : l'aplat qui le vide est peint de la couleur du fond
     que l'exploitant a choisie, ou du gris de la page à défaut. */
  const trou = $("trouDuFond");
  GL.sol = trou ? couleurGl(getComputedStyle(trou).fill, 1) : null;
  // une mise en avant, la carte de chaleur : les noms s'estompent ou changent d'encre
  if (GL.actif){ lisModelesLibelles(); _page.libellesWebgl(); }
  planifieWebgl();
}

function blocsDansLOrdre(){
  const couches = $("couches");
  return [...couches.children, ...[...svg.children].filter(c => c !== couches)];
}

function repeintWebgl(){
  GL.image = 0;
  if (!GL.actif) return;
  const t0 = performance.now();
  const vus = new Set();
  let n = 0;
  // un stand dessiné a pu naître, changer d'exposant ou disparaître : son nom suit
  if ([...GL.sales].some(b => b.classList && b.classList.contains("dcal"))) _page.libellesWebgl();
  for (const b of blocsDansLOrdre()){
    vus.add(b);
    if (b.id === "labels") continue;
    if (GL.tout || GL.sales.has(b) || !GL.blocs.has(b)){
      GL.blocs.set(b, convertitBloc(b, cleBloc(b)));
      n++;
    }
  }
  for (const b of [...GL.blocs.keys()]) if (!vus.has(b)) GL.blocs.delete(b);
  GL.sales.clear(); GL.tout = false; GL.ordre = false; GL.massif = false;
  GL.deck.setProps({ layers: assembleWebgl() });
  majAnimationWebgl();
  GL.duree = performance.now() - t0;
  GL.reconstruits = n;
}

function assembleWebgl(){
  const out = [];
  for (const b of blocsDansLOrdre()){
    if (b.id === "labels"){ out.push(...couchesFigurants(), ...(GL.camera ? couchesLogos(deck, hauteurVolume, vueDuPlan(), vueDeck().zoom) : []), ...couchesLibellesWebgl().map(animeCouche), ...couchesPhareNoms()); continue; }
    const couches = GL.blocs.get(b) || [];
    /* Une tuile soulevée passe devant le vide qui borde ses voisines — ce vide
       est le trait de leur contour — et donc après tout le bloc. */
    const choisies = enTuiles() ? new Set(document.querySelectorAll("#stands > g.sel, #zones > g.sel, .dcal .sdes.sel")) : new Set();
    const tuile = (TUILES.size > 0 || choisies.size > 0) && enTuiles(), apres = [];
    for (const c of couches){
      out.push(animeCouche(c));
      if (GL.camera && GL.survol && c.props.extruded) out.push(...coucheSurvolVolume(c));
      if (tuile) apres.push(...couchesTuiles(c, choisies));
      // la teinte du survol juste sur l'aplat : cloisons et noms restent devant
      else if (GL.survol) out.push(...coucheSurvol(c));
    }
    out.push(...apres);
    out.push(...couchesDessineesWebgl(b), ...coucheFocus(couches));
  }
  return out;
}

/* Le texte SDF garde des bords nets quand il grandit, mais il se désagrège
   sous une douzaine de pixels : les noms de la vue d'ensemble devenaient des
   pointillés, là où le SVG les écrivait encore lisibles. Chaque couche de
   texte se double donc d'une autre, tirée d'un atlas à petite taille, et la
   carte graphique passe de l'une à l'autre au seuil. */
const SEUIL_PETIT_TEXTE = 14;

/* Montrer ou taire un texte selon le zoom, sans que rien ne bouge côté page.

   Chaque texte porte trois nombres : le zoom où il devient lisible, celui où
   il cède la place à un autre empilement, et celui où il change d'atlas. Le
   shader les compare au zoom qu'il connaît déjà — l'échelle de la projection
   — et envoie hors du cadre ce qui n'a pas à paraître.

   Le filtre de données de la bibliothèque faisait la même chose, mais sa
   plage se passait en réglage de couche : il fallait recréer les couches à
   chaque pas de zoom. Sur un téléphone lent, ce seul travail coupait la
   cadence de moitié. */
let CONST_TEXTE = null;
function constTexte(){
  if (CONST_TEXTE) return CONST_TEXTE;
  /* Le choix de l'atlas passe en réglage — 0 pour ce qui n'en a pas, 1 pour
     les petits textes, 2 pour les grands — et non en variante du shader :
     chaque variante est un programme que la carte graphique prépare avant la
     première image, et six programmes coûtaient près de deux secondes. */
  class FiltreZoom extends deck.LayerExtension {
    getShaders(){
      return {
        modules: [{ name: "filtreZoom", vs: "layout(std140) uniform filtreZoomUniforms {\n  float mode;\n  float muet;\n} filtreZoom;\n",
                    uniformTypes: { mode: "f32", muet: "f32" } }],
        inject: {
          "vs:#decl": "in vec3 instanceZoomFiltre;",
          "vs:DECKGL_FILTER_GL_POSITION":
            "float z = log2(project.scale);\n" +
            "bool garde = filtreZoom.mode > 1.5 ? z < instanceZoomFiltre.z : (filtreZoom.mode > 0.5 && z >= instanceZoomFiltre.z);\n" +
            "if (filtreZoom.muet > 0.5 && !bool(picking.isActive)) garde = true;\n" +
            "if (z < instanceZoomFiltre.x || z >= instanceZoomFiltre.y || garde) position = vec4(0.0, 0.0, 2.0, 1.0);",
        },
      };
    }
    initializeState(){
      const am = this.getAttributeManager();
      if (am) am.addInstanced({ instanceZoomFiltre: { size: 3, accessor: "getZoomFiltre" } });
    }
    draw(){ this.setShaderModuleProps({ filtreZoom: { mode: this.props.modeFiltre || 0,
      muet: this.props.muetALEcran && !GL.geste ? 1 : 0 } }); }
  }
  FiltreZoom.extensionName = "FiltreZoom";
  /* Les pointillés de l'itinéraire avancent : ils disent le sens du trajet.

     Ils taillent leurs tirets eux-mêmes, au lieu de décaler ceux de la
     bibliothèque. Décaler les siens paraissait pourtant tenir en une ligne —
     ajouter au « vDashOffset » qu'elle pose en fin de shader — mais cette
     ligne n'a jamais rien fait : les deux extensions écrivent au même endroit,
     et celle de la bibliothèque repasse derrière, quel que soit leur ordre.
     Rien ne le signalait, le trait se dessinait juste immobile, et le rendu
     SVG défilait pendant ce temps — c'est-à-dire chez presque personne, le
     WebGL étant le rendu par défaut.

     Le trajet garde donc sa propre distance parcourue, « vDefilePos », et le
     fragment décide lui-même de ce qu'il jette. Les longueurs se comptent en
     demi-épaisseurs de trait, comme celles de la bibliothèque, et le décalage
     arrive en pixels — comme le « stroke-dashoffset » d'un trait qui ne
     grossit pas au zoom —, d'où la division au moment de le passer.

     Un trait qui ne défile pas donne des tirets de longueur nulle : le
     fragment n'en tient alors aucun compte, et la bibliothèque reste seule à
     pointiller ce qu'elle pointille. */
  class TiretsQuiDefilent extends deck.LayerExtension {
    getShaders(){
      const bloc = "layout(std140) uniform defileUniforms {\n  vec2 tirets;\n  float decalage;\n} defile;\n";
      return {
        modules: [{ name: "defile", vs: bloc, fs: bloc,
                    uniformTypes: { tirets: "vec2<f32>", decalage: "f32" } }],
        inject: {
          "vs:#decl": "out float vDefilePos;",
          "vs:#main-end": "vDefilePos = vPathPosition.y;",
          "fs:#decl": "in float vDefilePos;",
          "fs:DECKGL_FILTER_COLOR":
            "float uniteDefile = defile.tirets.x + defile.tirets.y;\n" +
            "if (uniteDefile > 0.0 &&\n" +
            "    mod(vDefilePos + defile.decalage, uniteDefile) > defile.tirets.x) discard;",
        },
      };
    }
    draw(){
      const demi = Math.max(this.props.demiEpaisseur || 1, .001);
      this.setShaderModuleProps({ defile: { tirets: this.props.tirets || [0, 0],
                                            decalage: (this.props.decalage || 0) / demi } });
    }
  }
  TiretsQuiDefilent.extensionName = "TiretsQuiDefilent";
  TiretsQuiDefilent.defaultProps = { tirets: [0, 0], decalage: 0, demiEpaisseur: 1 };
  /* Les deux drapeaux du texte sont des réglages de l'extension : la
     bibliothèque les transmet ainsi aux lettres, que lit `filtreCouches`. */
  FiltreZoom.defaultProps = { getZoomFiltre: { type: "accessor", value: [-100, 100, -100] }, modeFiltre: 0,
    muetALEcran: false, passeSousPixel: false };
  /* Le contour d'une lettre, et le flou qu'il prenait au zoom.

     Un texte SDF ne garde pas la forme de ses lettres : il garde, pour chaque
     point de l'atlas, la distance au bord le plus proche. Le shader fond le
     contour sur une bande fixe — deux points et demi de l'atlas —, mesurée
     dans la texture et non à l'écran. Tant que la lettre reste petite, cette
     bande vaut une fraction de pixel et ne se voit pas ; agrandie vingt fois,
     elle s'agrandit autant, et le nom d'un stand devient une tache.

     Elle se recalcule donc pour chaque pixel, d'après ce que la distance varie
     d'un pixel au suivant — « fwidth » —, ce qui la ramène à la largeur d'un
     pixel quel que soit le zoom. Elle ne dépasse jamais celle d'origine : aux
     tailles où le rendu convenait, rien ne change. Grossir l'atlas aurait eu
     le même effet à l'œil, mais sa fabrication est quatre fois plus lourde, et
     elle se refait dès qu'un caractère nouveau paraît.

     L'injection se pose en fin de fragment, seul endroit où les variables de
     la bibliothèque sont déclarées, et se tait pendant la passe de
     désignation, dont la couleur ne doit rien recevoir. Elle est posée sur
     toutes les couches de texte, et non sur les seules grandes : deux jeux
     d'extensions feraient deux programmes à compiler là où un seul suffit, et
     « sdf.enabled » la rend muette sur l'atlas des petits textes.

     Les petits textes avaient leur défaut à eux, à l'autre bout : leur atlas
     est dessiné en 24 points et presque toujours lu plus petit, par les
     réductions successives que la carte graphique en tient. Un seul
     échantillon mélange alors deux de ces réductions, et les plus fortes ne
     gardent plus rien d'une lettre : les jambages s'empâtent, les lettres
     voisines de l'atlas bavent dans le glyphe, et un nom de six pixels
     s'étire en tache. Quatre échantillons répartis sur le pixel, chacun lu
     une réduction plus nette, rendent ce que la lettre couvre vraiment. Cela
     ne coûte qu'aux pixels de texte — une fraction de l'écran —, et rien à
     l'atlas.

     La couverture est ensuite relevée : un navigateur renforce le contraste
     d'une petite lettre sombre sur fond clair, et la couverture brute la
     laissait grise et grêle à côté du même nom en SVG. Il la renforce
     d'autant plus que la lettre est petite, et le relèvement fait de même —
     puissance ¾ tant que l'atlas n'est réduit que de moitié, jusqu'à 0,55
     quand il l'est cinq fois, vers cinq pixels de corps. Plus fort, les
     lettres s'empâtent ; un nom de stand à cette taille restait
     pâle et paraissait flou.

     Caler les lettres sur la grille des pixels, comme le navigateur cale sa
     ligne de base, a été essayé : à l'horizontale l'espacement se dérègle
     (« VE RT »), à la verticale le gain ne se voit pas, et les noms
     sautillent d'un pixel pendant le zoom. */
  class LissageSdf extends deck.LayerExtension {
    getShaders(){
      const bloc = "layout(std140) uniform sousPixelUniforms {\n  float decalage;\n  float largeur;\n} sousPixel;\n";
      return { modules: [{ name: "sousPixel", fs: bloc, uniformTypes: { decalage: "f32", largeur: "f32" } }],
               inject: { "fs:#main-end": [
        "if (sdf.enabled && !bool(picking.isActive)) {",
        "  float dist = texture(iconsTexture, vTextureCoords).a;",
        "  float bande = clamp(fwidth(dist) * 0.6, 0.0008, sdf.gamma);",
        "  float dedans = smoothstep(sdf.buffer - bande, sdf.buffer + bande, dist);",
        "  if (sdf.outlineBuffer > 0.0) {",
        "    vec4 teinte = mix(sdf.outlineColor, vColor, dedans);",
        "    dedans = smoothstep(sdf.outlineBuffer - bande, sdf.outlineBuffer + bande, dist);",
        "    fragColor = vec4(teinte.rgb, dedans * teinte.a * layer.opacity);",
        "  } else {",
        "    fragColor.a = dedans * vColor.a * layer.opacity;",
        "  }",
        "} else if (!bool(picking.isActive)) {",
        "  vec2 pasX = dFdx(vTextureCoords), pasY = dFdy(vTextureCoords);",
        "  vec2 centre = vTextureCoords + pasX * sousPixel.decalage;",
        "  pasX *= sousPixel.largeur;",
        "  float couvre = texture(iconsTexture, centre - 0.125 * pasX - 0.375 * pasY, -1.0).a;",
        "  couvre += texture(iconsTexture, centre + 0.375 * pasX - 0.125 * pasY, -1.0).a;",
        "  couvre += texture(iconsTexture, centre + 0.125 * pasX + 0.375 * pasY, -1.0).a;",
        "  couvre += texture(iconsTexture, centre - 0.375 * pasX + 0.125 * pasY, -1.0).a;",
        "  float reduit = length(fwidth(vTextureCoords) * vec2(textureSize(iconsTexture, 0)));",
        "  float releve = mix(0.75, 0.55, clamp((reduit - 2.0) / 3.0, 0.0, 1.0));",
        "  fragColor.a = pow(0.25 * couvre, releve) * vColor.a * layer.opacity;",
        "}",
      ].join("\n") } };
    }
  }
  LissageSdf.extensionName = "LissageSdf";
  LissageSdf.defaultProps = { sousPixel: [0, 1] };
  LissageSdf.prototype.draw = function(){
    const [decalage, largeur] = this.props.sousPixel || [0, 1];
    this.setShaderModuleProps({ sousPixel: { decalage, largeur } });
  };
  /* Des objets créés une fois pour toutes : la bibliothèque compare ces
     réglages par identité, et un nouvel objet — même identique — lui faisait
     régénérer l'atlas des polices et recompiler ses shaders. */
  const textes = [new FiltreZoom(), new LissageSdf()];
  return (CONST_TEXTE = {
    /* Quatre points de marge autour de chaque glyphe, et non deux : dans les
       réductions de l'atlas où lisent les petits textes, deux points n'en
       valaient plus qu'un demi, et la lettre d'à côté s'invitait. */
    petit: { ext: textes, mode: 1, atlas: { sdf: false, fontSize: 24, buffer: 4 } },
    grand: { ext: textes, mode: 2, atlas: { sdf: true, fontSize: 64, buffer: 6 } },
    /* Tous les traits partagent un seul programme : tirets — un trait plein
       en a de longueur nulle —, défilement arrêté, filtre de zoom ouvert. */
    traits: [new deck.PathStyleExtension({ dash: true, highPrecisionDash: true }), new TiretsQuiDefilent(), new FiltreZoom()],
    sansDeclencheur: {},
  });
}
/**
 * Les caractères que la bibliothèque doit savoir dessiner : l'union de tous
 * ceux déjà rencontrés, et qui ne fait que grandir.
 *
 * `characterSet: "auto"` laissait chaque couche de texte réclamer les seuls
 * caractères de ses propres noms. Deux couches n'en demandaient donc jamais
 * les mêmes, et la bibliothèque refabriquait son atlas — mesurer, dessiner et
 * téléverser mille glyphes — à chaque fois que l'une d'elles recevait un nom
 * de plus. Ouvrir une fiche, qui rapproche la vue et fait paraître des noms
 * jusque-là trop petits, coûtait ainsi cent vingt millisecondes d'atlas.
 *
 * Une seule chaîne pour toutes les couches, et la même d'une image à l'autre :
 * l'atlas est fabriqué une fois par police, puis resservi. Elle ne rétrécit
 * jamais — un caractère retiré du plan ne vaut pas de tout refaire — et son
 * contenu est trié, pour que deux salons aux mêmes noms donnent la même chaîne.
 *
 * Un jeu fixe et généreux, posé d'avance, coûtait plus cher que « auto » : on
 * y payait les accents et les symboles que le salon n'emploie pas. C'est bien
 * l'union exacte qu'il faut, pas un sur-ensemble commode.
 */
const CARACTERES_VUS = new Set();
let JEU_CARACTERES = "";
function jeuDeCaracteres(items){
  let neuf = false;
  for (const it of items){
    const t = it && it.text;
    if (!t) continue;
    for (const c of t) if (!CARACTERES_VUS.has(c)){ CARACTERES_VUS.add(c); neuf = true; }
  }
  if (neuf) JEU_CARACTERES = [...CARACTERES_VUS].sort().join("");
  return JEU_CARACTERES;
}

/* Les petits noms d'un écran de PC, lissés sous-pixel par sous-pixel.

   Sur un téléphone, un nom de cinq pixels CSS en couvre dix ou quinze : il se
   lit net. Sur un écran de PC, il n'en a que cinq, et le navigateur tient son
   texte lisible par un moyen que la carte graphique ne lui emprunte pas
   d'elle-même : il lisse chaque bord sur les trois sous-pixels — rouge, vert,
   bleu — côte à côte dans le pixel (ClearType sous Windows). Trois fois plus
   de finesse à l'horizontale, là où les lettres en manquent.

   La même chose se refait ici : chaque petit nom est peint trois fois, une
   par canal, chacune ne pouvant écrire que le sien (« colorMask ») et lisant
   la lettre un tiers de pixel plus à gauche ou plus à droite. Le mélange se
   fait alors canal par canal, exactement comme le lissage du navigateur.
   Chaque passe lit 0,6 pixel de large, plus que son tiers de pixel : les
   franges colorées restent ainsi aussi discrètes que celles du navigateur.

   Ce mélange n'est juste que sur un fond opaque. La toile n'a qu'une
   opacité par pixel, pas une par canal : là où elle est transparente — le
   sol, sous lequel paraissent le fond de la page ou la carte —, les trois
   couvertures ne peuvent pas s'y reporter, et les lettres y prenaient des
   franges sombres et bleutées. Seuls les noms écrits sur l'aplat d'un stand
   en profitent donc (« SUR_UN_STAND ») : ce sont eux, justement, qu'on lit
   petits. Les noms de zone et les textes dessinés gardent le lissage
   ordinaire. La passe verte, celle du milieu, porte l'opacité du tout.

   La désignation, elle, lit la couleur de ce qui est peint : trois passes à
   un seul canal lui donneraient des identifiants tronqués. La couche
   d'origine reste donc, pour elle seule — muette à l'écran, son shader
   envoyant chaque lettre hors du cadre hors de la passe de désignation.

   Réservé aux ordinateurs, hors Mac, jusqu'à une densité de 2,5. Un écran
   de PC en densité 2 — mise à l'échelle de Windows à 200 % — paraissait
   assez fin pour s'en passer : il ne l'est pas, on le regarde de plus près
   qu'un téléphone, rapporté à ses pixels, et le navigateur y lisse encore
   son texte au sous-pixel. Les téléphones et tablettes en sont écartés :
   leur densité suffit, et on les tourne — un écran tourné ne range plus
   ses sous-pixels de gauche à droite. Les Mac aussi, que le système n'a plus lissés
   ainsi depuis 2018 : des franges colorées y détonneraient. */
const PASSES_SOUS_PIXEL = [
  { canal: "-r", masque: [true, false, false, false], decalage: -1 / 3 },
  { canal: "-v", masque: [false, true, false, true], decalage: 0 },
  { canal: "-b", masque: [false, false, true, false], decalage: 1 / 3 },
];
function sousPixelOffert(){
  if ((window.devicePixelRatio || 1) >= 2.5) return false;
  if (/Mac|iPhone|iPad|iPod/.test(navigator.platform || "")) return false;
  return !/Android|Mobi|iPhone|iPad/.test(navigator.userAgent || "");
}
/* Le texte ordinaire, muet à l'écran, est toujours là — et non plus pour la
   seule désignation : pendant un geste, c'est lui qui parle, et les trois
   passes se taisent (`filtreCouches`). */
function couchesPetites(id, commun, K, sousPixel){
  const base = { ...commun, fontSettings: K.petit.atlas, extensions: K.petit.ext, modeFiltre: K.petit.mode };
  if (!sousPixel || !sousPixelOffert()) return [new deck.TextLayer({ ...base, id: id + "-petit" })];
  return [
    new deck.TextLayer({ ...base, id: id + "-petit", muetALEcran: true }),
    ...PASSES_SOUS_PIXEL.map(p => new deck.TextLayer({ ...base, id: id + "-petit" + p.canal,
      pickable: false, passeSousPixel: true, sousPixel: [p.decalage, .6],
      parameters: { ...parametresTexte(), colorMask: p.masque } })),
  ];
}

/**
 * Ce que chaque image dessine vraiment.
 *
 * Une image de geste coûte à la carte graphique moins qu'à la bibliothèque :
 * avant de dessiner une couche, celle-ci lui recompose tous ses réglages, et
 * c'est le nombre de couches qui fait le prix, non le nombre de formes.
 * Mesuré sur un vrai salon en vue immersive : cinquante et une couches, trois
 * quarts du temps d'un zoom passés à les préparer, une image sur deux perdue.
 *
 * Or un petit texte lissé au sous-pixel en compte trois, une par canal de
 * couleur — douze sur cinquante et une. Le lissage ne se voit que sur un
 * texte immobile : pendant un geste, les trois passes se taisent, et la
 * couche ordinaire, muette au repos, les remplace. Au repos, celle-ci ne
 * sert plus qu'à la désignation.
 */
function filtreCouches(/** @type {any} */ { layer, isPicking }){
  const p = layer.props;
  if (p.muetALEcran) return isPicking || GL.geste;
  if (p.passeSousPixel) return !GL.geste;
  return true;
}

/* Le geste fini sans que la vue soit posée — rare, mais un doigt peut se
   perdre — ne doit pas laisser le texte sans son lissage. */
let _finGeste = 0;
/** Le geste commence, ou finit : le texte change de couches. */
function poseGeste(/** @type {boolean} */ oui){
  clearTimeout(_finGeste);
  if (oui) _finGeste = setTimeout(() => poseGeste(false), 250);
  if (GL.geste === oui) return;
  GL.geste = oui;
  // la vue posée ne bouge plus : rien ne redessinerait sans cela
  if (!oui) GL.deck.redraw("fin du geste");
}

/* Les noms des stands et des zones, posés sur le dessus de leur volume en vue
   immersive ; au sol, ils resteraient dedans, que les façades cachent. Celui
   d'une zone masquée reste au sol avec elle. */
function positionTexte(){
  if (!GL.camera) return d => d.position;
  /* Les lignes d'un stand s'empilent en hauteur au-dessus de son centre : un
     nom dressé face à l'œil garde sa taille, quand l'écart que le plan à plat
     met entre le nom et le numéro se tassait avec l'inclinaison — sur trois
     lignes, le nom recouvrait son numéro. Monté, l'écart reste vertical à
     l'écran, quel que soit le cap. */
  const pose = (d, h) => d.centre
    ? [d.position[0], d.centre[1], h + .02 - d.ecart / SINUS_INCLINAISON]
    : [d.position[0], d.position[1], h + .02];
  return d => {
    // déjà posé — le texte d'un jeton, que sa matrice dresse
    if (d.position.length > 2) return d.position;
    if (d.zHausse !== undefined) return pose(d, d.zHausse);
    const c = d.cls || "", zone = c.startsWith("zn");
    if (zone && /\bmasquee\b/.test(c)) return d.position;
    // le nom d'un stand abaissé sous un trajet descend avec lui
    if (!zone && boutsDuTrajet() && !debout.has(d.lbl)) return pose(d, HAUTEUR_ABAISSEE);
    return pose(d, (zone ? HAUTEUR_ZONE : HAUTEUR_STAND) * (/\bsel\b/.test(c) ? HAUSSE_CHOIX : 1));
  };
}

/* ------------------------------------------------------------
   Les noms cachés par le stand choisi

   Les noms se peignent par-dessus le relief (« parametresTexte ») : le stand
   choisi, haussé au-dessus des autres, ne cache donc pas le nom du stand qui
   se tient derrière lui, et les deux noms se mêlaient à l'écran — le sien,
   posé sur son dessus, et celui du voisin, qui tombait au même endroit. Le
   nom d'un stand plus loin de l'œil dont la place à l'écran tombe dans la
   silhouette du volume choisi se tait donc, le temps du choix.

   La silhouette se calcule vue de loin, sans la fuite : l'œil se tient à une
   fois et demie la diagonale de la scène (`camera.mjs`), et la fuite ne
   déplace un nom que d'une fraction de la taille d'un stand.
   ------------------------------------------------------------ */
/** @type {{ id: string, anneaux: number[][][], haut: number } | null} le volume choisi, relevé à la conversion */
let CHOISI = null;
const cleChoisi = () => CHOISI ? CHOISI.id + "@" + CHOISI.haut : "";

/** Un point du monde vu à l'écran, en mètres, et sa proximité de l'œil. */
function versEcran(/** @type {number} */ x, /** @type {number} */ y, /** @type {number} */ z){
  const cap = capCamera(), cc = Math.cos(cap), sc = Math.sin(cap);
  const st = SINUS_INCLINAISON, ct = Math.sqrt(1 - st * st);
  const y1 = x * sc + y * cc;
  return { u: x * cc - y * sc, v: ct * y1 - st * z, pres: st * y1 + ct * z };
}
/** L'enveloppe convexe de points de l'écran, dans un sens fixe. */
function enveloppe(/** @type {number[][]} */ pts){
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (p.length < 3) return p;
  const croix = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const bas = [], haut = [];
  for (const q of p){ while (bas.length > 1 && croix(bas[bas.length - 2], bas[bas.length - 1], q) <= 0) bas.pop(); bas.push(q); }
  for (const q of p.reverse()){ while (haut.length > 1 && croix(haut[haut.length - 2], haut[haut.length - 1], q) <= 0) haut.pop(); haut.push(q); }
  return bas.slice(0, -1).concat(haut.slice(0, -1));
}

/** Les stands et les zones dont le nom passe derrière le volume choisi. */
function nomsCaches(/** @type {any[]} */ liste){
  const caches = new Set();
  if (!GL.camera || !CHOISI || !CHOISI.anneaux[0]) return caches;
  const pied = CHOISI.anneaux[0], h = CHOISI.haut;
  const sil = enveloppe(pied.flatMap(([x, y]) =>
    [versEcran(x, y, 0), versEcran(x, y, h)].map(e => [e.u, e.v])));
  if (sil.length < 3) return caches;
  const cx = pied.reduce((t, p) => t + p[0], 0) / pied.length, cy = pied.reduce((t, p) => t + p[1], 0) / pied.length;
  const presChoisi = versEcran(cx, cy, 0).pres;
  const pos = positionTexte();
  for (const d of liste){
    if (d.lbl === CHOISI.id || caches.has(d.lbl)) continue;
    const sol = d.centre || d.position;
    // ce qui se tient devant le choisi le cache, et garde donc son nom
    if (versEcran(sol[0], sol[1], 0).pres >= presChoisi) continue;
    const [x, y, z] = pos(d), e = versEcran(x, y, z || 0);
    /* Un nom tient de la place : son milieu et ses deux bouts. Une ligne
       mesure à peu près six dixièmes de corps par lettre. */
    const lettres = Math.max(...String(d.text).split("\n").map(l => l.length));
    const demi = d.taille * lettres * .3;
    if ([-demi, 0, demi].some(du => dedansAnneau(sil, e.u + du, e.v))) caches.add(d.lbl);
  }
  return caches;
}

/* Un nom se dresse face à l'œil : en vue immersive, son rectangle traversait
   le dessus du stand et le nom s'y coupait à mi-hauteur. Les noms se peignent
   donc par-dessus le relief, sans le consulter — comme sur une maquette, où
   l'étiquette se lit toujours. */
const parametresTexte = () => GL.camera ? { depthCompare: "always", depthWriteEnabled: false } : {};

function couchesTexte(id, items, famille, graisse, extra){
  const K = constTexte();
  const halo = extra.halo;
  const commun = {
    data: items, pickable: Boolean(extra.pickable), fontFamily: famille, fontWeight: graisse, characterSet: jeuDeCaracteres(items),
    getText: d => d.text, getPosition: positionTexte(), getSize: d => d.taille, sizeUnits: "common",
    getAngle: d => d.angle || 0, getColor: extra.getColor || (d => d.couleur),
    getTextAnchor: extra.ancre || (d => d.ancre), getAlignmentBaseline: "center",
    lineHeight: extra.lineHeight || 1, parameters: parametresTexte(),
    updateTriggers: { ...(extra.updateTriggers || K.sansDeclencheur),
      getPosition: cleCamera() + GL.camera + JSON.stringify(boutsDuTrajet()) },
    getZoomFiltre: d => [d.z0 === undefined ? -100 : d.z0, d.z1 === undefined ? 100 : d.z1,
                         Math.log2(SEUIL_PETIT_TEXTE / d.taille)],
  };
  /* Le liseré clair qui détache un nom de ce qu'il recouvre — carte de
     chaleur, zone mise en avant. Les grands textes le tirent de leur champ de
     distance, en proportion du corps comme le « .15em » du SVG. Les petits
     n'en ont pas : quatre copies claires décalées d'un pixel le dessinent,
     ce qui est à peu près ce qu'un liseré mesure à cette taille. */
  const autour = halo ? [[-1, 0], [1, 0], [0, -1], [0, 1]].map(([x, y], k) =>
    new deck.TextLayer({ ...commun, id: id + "-petit-halo-" + k, fontSettings: K.petit.atlas, extensions: K.petit.ext, modeFiltre: K.petit.mode,
      getColor: halo.couleur, getPixelOffset: [x, y], updateTriggers: { ...commun.updateTriggers, getColor: halo.couleur.join() } })) : [];
  return [
    ...autour,
    ...couchesPetites(id, commun, K, extra.sousPixel),
    new deck.TextLayer({ ...commun, id: id + "-grand", fontSettings: K.grand.atlas, extensions: K.grand.ext, modeFiltre: K.grand.mode,
      ...(halo ? { outlineWidth: Math.min(.9, halo.largeur * 2.6), outlineColor: halo.couleur } : {}) }),
  ];
}

/* ------------------------------------------------------------
   Du SVG aux primitives : formes pleines, traits, textes, images. Les
   coordonnées restent en mètres ; les styles sont ceux que la feuille de
   style a calculés, variables et classes résolues.
   ------------------------------------------------------------ */
/** Ce que les outils saisissent : une poignée, une forme, le cadrage d'un bâtiment. */
const PRISES = ".pgn, [data-f], #calageApercu .contour, #calageApercu .poignee";
const accVide = prises => ({ pleins: [], traitsPx: [], traitsM: [], traitsZ: [], textes: new Map(), images: [], phares: new Map(), prises,
  decor: [], jetons: new Map(), parent: null });
function convertitBloc(racine, cle){
  // ce que l'éditeur attrape : le calque ouvert, et les poignées posées à la
  // racine — celles d'une forme dessinée comme celles d'un emplacement repris
  // le cadrage d'un bâtiment de la bibliothèque s'attrape aussi, calque ouvert ou non
  const acc = accVide((_page.enEdition() && (racine.classList.contains("editable") ||
      racine.id === "poignees" || racine.id === "poigneesGeo")) ||
    racine.id === "calageApercu");
  const avant = racine.id === "stands" ? cleChoisi() : null;
  if (avant !== null) CHOISI = null;
  parcoursGl(racine, M_ID, 1, acc);
  // un autre stand choisi, ou le même à une autre hauteur : d'autres noms passent derrière lui
  if (avant !== null && cleChoisi() !== avant) GL.couchesLibelles = null;
  const out = couchesDeBloc(acc, cle);
  let i = 0;
  for (const [el, sous] of acc.phares) out.push(...couchesPhare(el, sous, cle + "-phare-" + (i++)));
  for (const [r, sous] of acc.jetons) out.push(...couchesJeton(r, sous, cle + "-jeton-" + (i++)));
  return out;
}

/* Ce que le cartouche met en avant se range à part : il bat, et seules ses
   couches changent d'une image à l'autre. */
function accDe(el, acc){
  // un repère de la vue immersive : un jeton, à part, que sa matrice dresse (`couchesJeton`)
  const r = GL.camera && acc.jetons && el.closest(".repere[data-poi]");
  if (r){
    if (!acc.jetons.has(r)){
      // le repère a pu bouger, changer de taille ou d'objet depuis la conversion d'avant
      jetonsPoses.delete(r);
      acc.jetons.set(r, { ...accVide(acc.prises), phares: null, jetons: null, parent: acc });
    }
    return acc.jetons.get(r);
  }
  const ph = acc.phares && el.closest(".phare");
  if (!ph) return acc;
  if (!acc.phares.has(ph)) acc.phares.set(ph, accVide(acc.prises));
  return acc.phares.get(ph);
}

function parcoursGl(el, m, op, acc){
  const cs = getComputedStyle(el);
  if (cs.display === "none") return;
  const tr = el.getAttribute("transform");
  if (tr) m = mulM(m, lisTransform(tr));
  op *= parseFloat(cs.opacity);
  if (!(op > .003)) return;
  const tag = el.localName;
  // le nom d'un stand dessiné : « libellesWebgl » le prépare avec ses seuils de zoom
  if (tag === "g" && el.classList.contains("lab")) return;
  if (tag === "g" || tag === "a"){ for (const c of el.children) parcoursGl(c, m, op, acc); return; }
  if (tag === "svg"){
    const vb = (el.getAttribute("viewBox") || "").split(/[\s,]+/).map(Number);
    const x = num(el, "x"), y = num(el, "y"), w = num(el, "width"), h = num(el, "height");
    let n = [1, 0, 0, 1, x, y];
    if (vb.length === 4 && vb[2] > 0 && vb[3] > 0 && w > 0 && h > 0){
      const s = Math.min(w / vb[2], h / vb[3]);
      n = [s, 0, 0, s, x + (w - vb[2] * s) / 2 - vb[0] * s, y + (h - vb[3] * s) / 2 - vb[1] * s];
    }
    const m2 = mulM(m, n);
    for (const c of el.children) parcoursGl(c, m2, op, acc);
    return;
  }
  if (tag === "text"){ texteGl(el, cs, m, op, acc); return; }
  if (tag === "image"){ imageGl(el, m, op, acc); return; }
  let traces = null;
  if (tag === "path") traces = lisTrace(el.getAttribute("d") || "");
  else if (tag === "polyline") traces = [{ pts: lisPoints(el.getAttribute("points")), ferme: false }];
  else if (tag === "polygon") traces = [{ pts: lisPoints(el.getAttribute("points")), ferme: true }];
  else if (tag === "line") traces = [{ pts: [[num(el, "x1"), num(el, "y1")], [num(el, "x2"), num(el, "y2")]], ferme: false }];
  else if (tag === "rect") traces = [{ pts: rectArrondi(num(el, "x"), num(el, "y"), num(el, "width"), num(el, "height"), num(el, "rx"), num(el, "ry")), ferme: true }];
  else if (tag === "circle"){ const r = num(el, "r"); traces = [{ pts: anneau(num(el, "cx"), num(el, "cy"), r, r, 32), ferme: true }]; }
  else if (tag === "ellipse") traces = [{ pts: anneau(num(el, "cx"), num(el, "cy"), num(el, "rx"), num(el, "ry"), 32), ferme: true }];
  if (traces) formeGl(el, cs, m, op, traces, acc);
}

/* La hauteur d'une forme en vue immersive : celle d'un stand ou d'une zone
   de l'organisateur pour leur tracé même, rien pour tout le reste. Seul le
   tracé monte — la distinction, le halo de la chaleur, le liseré de la
   sélection posés sur lui restent des aplats, qui se peignent alors au pied
   du volume. Une zone masquée reste au sol : pâlie, elle dit à l'exploitant
   qu'elle ne sera pas sur le plan public, et un volume la ferait voir. */
/* Les stands qu'un trajet tracé garde debout : ceux où l'un de ses points
   tombe — départ, arrêt, arrivée. Vu de biais, le trajet passait derrière
   une rangée de stands et s'y cachait ; tout le reste s'abaisse donc le
   temps qu'il est tracé. Le jeu se refait à chaque conversion, et sert aux
   noms (`positionTexte`) et au mouvement qui part au clic, qui n'ont pas
   le contour sous la main. */
/** @type {Set<string>} les identifiants des stands gardés debout */
let debout = new Set();
function resteDebout(/** @type {Element} */ g, /** @type {number[][][] | undefined} */ anneaux){
  const id = g.getAttribute("data-id") || "";
  if (!anneaux || !anneaux[0]) return debout.has(id);
  const an = anneaux[0];
  const oui = (boutsDuTrajet() || []).some(b => dedansAnneau(an, b.xy[0], b.xy[1]));
  if (oui) debout.add(id); else debout.delete(id);
  return oui;
}
function dedansAnneau(/** @type {number[][]} */ an, /** @type {number} */ x, /** @type {number} */ y){
  let ok = false;
  for (let i = 0, j = an.length - 1; i < an.length; j = i++){
    const [xi, yi] = an[i], [xj, yj] = an[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) ok = !ok;
  }
  return ok;
}
/* Le trajet apparaît, change ou s'efface : le plan entier change de hauteur
   d'un coup — six cents stands en mouvement chacun dans sa couche coûteraient
   plus qu'ils ne montreraient. */
TRAJET_CHANGE.suis(() => {
  if (!GL.actif || !GL.camera) return;
  GL.massif = true;
  toutRepeindreWebgl();
});
/* Le cap tourne : les images dressées face à l'œil (`imageDressee`) se
   retournent avec lui, et elles ne tiennent leur orientation que de la
   conversion. */
CAMERA_CHANGEE.suis(() => { if (GL.actif && GL.camera) toutRepeindreWebgl(); });

/* L'itinéraire, un rien au-dessus du sol en vue immersive. Peint à même le
   sol, il en partageait la profondeur : vue de biais, la carte graphique ne
   départageait plus les deux, et le trajet se hachait de traînées pâles. */
const SOL_ITINERAIRE = .08;
const auDessusDuSol = (el) => !GL.camera ? 0 : el.closest("#itin") ? SOL_ITINERAIRE : surSonStand(el);

/* Le coin corné, la pastille, le liseré d'une distinction se posent sur le
   dessus du stand qu'ils marquent : laissés au sol, ils restaient dans le
   volume, que ses façades cachaient — la vue immersive perdait les nouveaux
   exposants et les adhérents. Ils suivent la hauteur du stand, abaissé sous
   un trajet ou haussé au choix, un rien au-dessus pour ne pas se hacher avec
   son dessus. */
function surSonStand(/** @type {Element} */ el){
  const m = el.closest("#dists [data-sur]");
  if (!m) return 0;
  const id = m.getAttribute("data-sur") || "";
  const g = $("stands").querySelector('g.stand[data-id="' + CSS.escape(id) + '"]');
  const trace = g && g.firstElementChild;
  return trace ? hauteurVolume(trace) + .02 : 0;
}

function hauteurVolume(el, anneaux){
  if (!cameraEnJeu()) return 0;
  const g = el.parentNode;
  if (!g || !g.classList || g.firstElementChild !== el) return 0;
  const stand = g.classList.contains("stand"), zone = g.classList.contains("zone");
  if (!stand && !zone) return 0;
  if (stand && g.hasAttribute("data-libre")) return HAUTEUR_LIBRE;
  if (zone && g.classList.contains("masquee")) return 0;
  /* Un trajet tracé : tout s'abaisse, sauf où il part, s'arrête et arrive. */
  if (boutsDuTrajet() && !zoneMeublee(g) && !resteDebout(g, anneaux)) return HAUTEUR_ABAISSEE;
  /* Ce qu'on a choisi se hausse au-dessus des autres : vu de biais, un liseré
     au pied d'un volume ne se voyait plus, et c'est pourtant lui qu'on cherche
     des yeux en ouvrant sa fiche. */
  /* Une zone que le décor sait meubler n'est plus qu'un sol teinté : c'est
     son mobilier qui monte, et un bloc d'un mètre le cacherait. */
  const h = stand ? HAUTEUR_STAND : zoneMeublee(g) ? SOL_MEUBLE : HAUTEUR_ZONE;
  return g.classList.contains("sel") ? h * HAUSSE_CHOIX : h;
}

/* ------------------------------------------------------------
   Le décor des zones

   Le mobilier d'une zone typée (`decor.mjs`) monte sur son sol : chaque
   pièce est un volume, peint d'après son rôle. Les assises prennent la
   couleur de la zone, assombrie, pour que le restaurant reste doré et la
   salle de sa teinte ; le reste a ses tons de mobilier, les mêmes partout.
   Le décor ne se désigne pas : un appui sur une chaise ouvre la zone, dont
   le sol est dessous.
   ------------------------------------------------------------ */
const SOL_MEUBLE = .12;
const zoneMeublee = (/** @type {Element} */ g) =>
  g.classList.contains("zone") && TYPES_MEUBLES.includes(g.getAttribute("data-type") || "");
/** @type {Record<string, number[]>} */
const TONS_DECOR = {
  plateau: [250, 249, 244, 255], comptoir: [250, 249, 244, 255],
  // le comptoir que l'exploitant tient (`outil-comptoir.mjs`), et sa poignée
  "comptoir-choisi": [138, 176, 246, 255], tige: [60, 70, 84, 255], poignee: [37, 99, 235, 255],
  scene: [78, 90, 106, 255], ecran: [34, 42, 54, 255],
  plante: [96, 156, 98, 255], portant: [128, 136, 148, 255],
  marche: [236, 238, 241, 255], flanc: [72, 82, 96, 255], cabine: [192, 214, 230, 255],
};

/* ------------------------------------------------------------
   Les repères en jetons

   Couchée sur le sol incliné, la pastille d'un repère s'écrasait en hauteur
   d'autant que le hall fuyait, et son pictogramme ne se lisait plus. En vue
   immersive, elle devient un jeton : une plaque épaisse, debout, face à l'œil
   quel que soit le cap.

   Il a tourné sur lui-même, un temps : le plan entier se redessinait alors à
   chaque image, sans fin, et l'ouverture d'une fiche saccadait. Immobile, il
   ne coûte plus rien entre deux gestes.

   Le repère se convertit à plat, dans son propre accumulateur (`accDe`),
   comme le SVG le dessine ; une matrice par couche le dresse et l'épaissit
   (`matriceJeton`). Il se plante au sol, à l'endroit qu'il désigne, ou sur
   l'escalier, l'escalator ou l'ascenseur qu'il surmonte (`decor.mjs`
   `objetRepere`).
   ------------------------------------------------------------ */

/* L'épaisseur du jeton, rapportée à sa hauteur. */
const EPAISSEUR_JETON = .16;
/* Un jeton au sol garde les trois quarts de la pastille : à pleine taille, il
   dominait les stands de deux fois leur hauteur. Celui d'un objet prend la
   réduction que le décor lui a taillée. */
const ECHELLE_JETON = .75;
/* Un arrêt de transport se dresse comme les autres, mais sans épaisseur : une
   plaque de quai est un panneau, et la tranche du jeton, vue d'au-dessus,
   mangeait le haut de l'indice. Ce qu'on lit — le pictogramme, le numéro, les
   barres du tram — reste face à l'œil, à la même taille. */
const GLYPHES_MINCES = new Set(["transport", ...MODES_TRANSPORT.map(m => m.v)]);

/* Ce qu'on sait de chaque repère pendant la conversion. L'aplat de la
   pastille, son premier enfant, le pose : son centre, sa taille, où il se
   plante, et la plaque elle-même. */
/** @type {WeakMap<Element, any>} */
const jetonsPoses = new WeakMap();
function poseJeton(el, polygon, couleur, acc){
  const r = acc.parent && el.closest(".repere[data-poi]");
  if (!r || r.firstElementChild !== el || !polygon || !polygon[0] || jetonsPoses.has(r)) return;
  const xs = polygon[0].map(p => p[0]), ys = polygon[0].map(p => p[1]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const cote = Math.max(...ys) - Math.min(...ys);
  const glyphe = r.getAttribute("data-glyphe") || "";
  let ancre = [cx, cy], z = .02, E = ECHELLE_JETON;
  if (OBJETS_REPERE.includes(glyphe)){
    /* Le sens où il monte, et s'il est tenu par l'exploitant
       (`outil-escalier.mjs`) : il bleuit alors et sort sa poignée. */
    const enMain = r.hasAttribute("data-objet-choisi");
    const obj = objetRepere(glyphe, cx, cy, cote, Number(r.getAttribute("data-sens")) || 0, enMain);
    // l'objet reste au sol du bloc : seul le jeton se dresse
    for (const p of obj.pieces) acc.parent.decor.push({ polygon: p.polygon, haut: p.haut,
      couleur: enMain && (p.role === "marche" || p.role === "cabine") ? TONS_DECOR["comptoir-choisi"] : TONS_DECOR[p.role] });
    if (obj.pieces.length){ ancre = obj.ancre; z = obj.dessus; E = ECHELLE_PASTILLE; }
  }
  const mince = GLYPHES_MINCES.has(glyphe);
  jetonsPoses.set(r, { cx, cy, demi: cote / 2, ancre, z, E, mince, e: mince ? 0 : cote * EPAISSEUR_JETON,
    polygon, couleur: opaque(couleur), el: r });
}

// des matrices 4 × 4 écrites par lignes, rendues par colonnes à la bibliothèque
const mul4 = (/** @type {number[]} */ a, /** @type {number[]} */ b) => {
  const o = [];
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++){
    let t = 0;
    for (let k = 0; k < 4; k++) t += a[i * 4 + k] * b[k * 4 + j];
    o.push(t);
  }
  return o;
};
const enColonnes = (/** @type {number[]} */ m) => [0, 1, 2, 3].flatMap(j => [0, 1, 2, 3].map(i => m[i * 4 + j]));
const translation = (/** @type {number} */ x, /** @type {number} */ y, /** @type {number} */ z) =>
  [1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z, 0, 0, 0, 1];
const homothetie = (/** @type {number} */ k) => [k, 0, 0, 0, 0, k, 0, 0, 0, 0, k, 0, 0, 0, 0, 1];
const autourDuZ = (/** @type {number} */ a) =>
  [Math.cos(a), -Math.sin(a), 0, 0, Math.sin(a), Math.cos(a), 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
// la plaque se lève : sa face (vers +z) regarde l'œil, le haut du dessin monte
const DEBOUT = [1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1];

/**
 * Ce qui mène une couche du jeton, dessinée à plat, à sa place : centrée,
 * posée sur sa face, levée, tournée face à l'œil selon le cap, puis plantée.
 */
function matriceJeton(/** @type {any} */ j, /** @type {number} */ t){
  const ph = GL.animePhare && j.el.classList.contains("phare") ? echellePhare(t) : 1;
  const k = j.E * ph;
  const pose = mul4(mul4(mul4(translation(j.ancre[0], j.ancre[1], j.z + j.demi * k),
    autourDuZ(-capCamera())), DEBOUT), homothetie(k));
  // la plaque d'épaisseur e, centrée ; le dessin juste devant sa face
  const m = j.face === "plaque" ? mul4(pose, translation(-j.cx, -j.cy, -j.e / 2))
    : mul4(pose, translation(-j.cx, -j.cy, j.e / 2 + j.e * .04));
  return enColonnes(m);
}

/* Le corps du texte d'un jeton. La matrice ne réduit que son ancrage : les
   lettres gardaient la taille de la pastille entière dans un jeton qui n'en
   tient que les trois quarts, et vu de biais il se raccourcit encore en
   hauteur quand elles, face à l'écran, ne se raccourcissent pas. Le numéro
   débordait son rond et chevauchait les barres du tram. */
function corpsDansLeJeton(/** @type {any} */ c, /** @type {any} */ j){
  if (!j) return {};
  const k = j.E, taille = c.props.getSize;
  return { getSize: (/** @type {any} */ d, /** @type {any} */ i) => k * (typeof taille === "function" ? taille(d, i) : taille),
    updateTriggers: { ...c.props.updateTriggers, getSize: k } };
}

/** Les couches d'un jeton : la plaque, puis le dessin sur sa face. */
function couchesJeton(/** @type {Element} */ r, /** @type {any} */ sous, /** @type {string} */ cle){
  const j = jetonsPoses.get(r);
  const dessin = couchesDeBloc(sous, cle)
    /* Tourné vers l'écran, comme les noms du plan. Couché sur la face, il ne
       l'était qu'en apparence : la bibliothèque ne passe que son point
       d'ancrage par la matrice du jeton, et trace les lettres à plat sur le
       sol, où le SVG les retourne — le numéro d'une ligne se lisait écrasé et
       la tête en bas, « 13 » en miroir. Et caché par ce qui se tient devant
       lui — les noms du plan se peignent par-dessus le relief, et celui d'un
       jeton passait à travers les stands. */
    .map(c => c instanceof deck.TextLayer ? c.clone({ billboard: true, ...corpsDansLeJeton(c, j),
      parameters: { ...c.props.parameters, depthCompare: "less-equal", depthWriteEnabled: false } }) : c);
  if (!j) return dessin;
  const face = dessin.map(c => c.clone({ jeton: { ...j, face: "avant" } }));
  // l'arrêt n'a pas de plaque : son dessin porte déjà le fond de la pastille
  if (j.mince) return face;
  const plaque = new deck.SolidPolygonLayer({ id: cle + "-plaque", data: [j], pickable: true,
    extruded: true, getPolygon: d => d.polygon[0], getFillColor: d => d.couleur, getElevation: d => d.e,
    material: MATIERE, el: r });
  return [plaque.clone({ jeton: { ...j, face: "plaque" } }), ...face];
}
function meubleZone(el, polygon, couleur, acc){
  const g = el.parentNode;
  if (!cameraEnJeu() || !g || !zoneMeublee(g) || !polygon || !polygon[0]) return;
  const assise = [0, 1, 2].map(i => Math.round(couleur[i] * .62)).concat(255);
  const [u, v, a] = (g.getAttribute("data-comptoir") || "").split(" ").map(Number);
  for (const p of meuble(g.getAttribute("data-type") || "", polygon[0], { u, v, a },
    g.hasAttribute("data-comptoir-choisi")))
    acc.decor.push({ polygon: p.polygon, haut: p.haut, couleur: TONS_DECOR[p.role] || assise });
}

/* ------------------------------------------------------------
   Les figurants

   Du monde dans les allées de la vue immersive (`figurants.mjs`), semé sur
   la grille de marche de l'itinéraire. Une couche à part, posée juste avant
   les noms : ceux-ci passent devant, les stands cachent ceux qui sont
   derrière eux. Les figurants ne se désignent pas — un appui passe au
   travers, jusqu'à l'allée ou au stand. La grille se calcule une fois par
   pavillon, et les couches gardent leurs données tant qu'elle ne change
   pas : la carte graphique ne les reçoit qu'une fois.

   Des maillages répétés (`SimpleMeshLayer`) et non des volumes montés à la
   main : une silhouette — deux jambes, des épaules, une tête ronde — que des
   prismes empilés ne savaient pas faire, et qui ne coûte qu'une position par
   figurant. L'ombre, un voile, n'écrit pas la profondeur : posée à quatre
   millimètres du sol, elle cacherait sinon le trait d'un itinéraire peint
   après elle.
   ------------------------------------------------------------ */
/**
 * Le bâtiment, pour ne semer personne dehors : le contour du hall relevé au
 * calage de la carte (`environs.mjs` `contourDuHall`, relu ici sur le
 * pavillon pour ne pas importer le fond de carte), sinon l'enveloppe des
 * stands et des zones — celle-là même où l'itinéraire marche quand rien
 * d'autre n'est dessiné.
 */
function dansLeHall(/** @type {any} */ p){
  const calage = p.calage !== undefined ? p.calage : DATA.calage;
  const pts = calage && calage.halls ? calage.halls[p.id] : null;
  let trace = enveloppeDuSalon(p);
  if (pts && pts.length >= 3){
    trace = new Path2D();
    pts.forEach((/** @type {number[]} */ q, /** @type {number} */ i) => i ? trace.lineTo(q[0], q[1]) : trace.moveTo(q[0], q[1]));
    trace.closePath();
  }
  const ctx = document.createElement("canvas").getContext("2d");
  return ctx ? (/** @type {number} */ x, /** @type {number} */ y) => ctx.isPointInPath(trace, x, y) : null;
}

/* La teinte de chaque partie d'un figurant, choisie dans le shader.

   Les parties d'une allure ne font qu'un maillage (`maillageReuni`), dont
   chaque sommet dit sa partie ; chaque figurant porte ses quatre choix —
   tenue, peau, cheveux, chaussures — et le shader lit la couleur dans les
   palettes, écrites en dur dans son source. La lumière s'applique ensuite,
   dans le fragment, comme pour une couleur ordinaire. */
/** @type {any} */
let _teinteFigurants = null;
function teinteDesFigurants(){
  if (_teinteFigurants) return _teinteFigurants;
  const palette = (/** @type {string} */ nom, /** @type {number[][]} */ l) =>
    "const vec3 " + nom + "[" + l.length + "] = vec3[" + l.length + "](" +
    l.map(c => "vec3(" + c.slice(0, 3).map(v => (v / 255).toFixed(4)).join(", ") + ")").join(", ") + ");\n";
  const decl = "in vec4 instanceFigurant;\n" +
    palette("FIG_BAS", TENUES.map(t => t.bas)) + palette("FIG_CHAUSSURES", CHAUSSURES) +
    palette("FIG_HAUT", TENUES.map(t => t.haut)) + palette("FIG_PEAU", TEINTS) + palette("FIG_CHEVEUX", CHEVEUX);
  class TeinteDesFigurants extends deck.LayerExtension {
    getShaders(){
      return { inject: {
        "vs:#decl": decl,
        // l'ordre de `PARTIES` : bas, chaussures, haut, peau, cheveux
        "vs:#main-end":
          "int partie = int(colors.r + 0.5);\n" +
          "vec3 teinte = partie == 0 ? FIG_BAS[int(instanceFigurant.x)]\n" +
          "  : partie == 1 ? FIG_CHAUSSURES[int(instanceFigurant.w)]\n" +
          "  : partie == 2 ? FIG_HAUT[int(instanceFigurant.x)]\n" +
          "  : partie == 3 ? FIG_PEAU[int(instanceFigurant.y)]\n" +
          "  : FIG_CHEVEUX[int(instanceFigurant.z)];\n" +
          "vColor = vec4(teinte, vColor.a);",
      } };
    }
    initializeState(){
      const am = this.getAttributeManager();
      if (am) am.addInstanced({ instanceFigurant: { size: 4, accessor: "getFigurant" } });
    }
  }
  TeinteDesFigurants.extensionName = "TeinteDesFigurants";
  TeinteDesFigurants.defaultProps = { getFigurant: { type: "accessor", value: [0, 0, 0, 0] } };
  return (_teinteFigurants = new TeinteDesFigurants());
}

/** @type {{ grille: any, couches: any[], maillages: any }} */
const FIGURANTS = { grille: null, couches: [], maillages: null };
function couchesFigurants(){
  if (!GL.camera || !cameraEnJeu() || !DATA || !P()) return [];
  const p = P(), g = grille(p, false);
  if (FIGURANTS.grille !== g){
    FIGURANTS.grille = g;
    if (!FIGURANTS.maillages){
      const M = maillagesFigurant();
      FIGURANTS.maillages = { ombre: M.ombre, modeles: M.modeles.map(maillageReuni) };
    }
    const M = FIGURANTS.maillages;
    const data = placeFigurants(g, PAS_GRILLE, graineDe(p.id), dansLeHall(p));
    const commun = { data, pickable: false, material: MATIERE,
      getPosition: (/** @type {any} */ f) => [f.x, f.y, 0],
      getOrientation: (/** @type {any} */ f) => [0, f.cap, 0],
      getScale: (/** @type {any} */ f) => [1, 1, f.taille] };
    FIGURANTS.couches = [
      new deck.SimpleMeshLayer({ ...commun, id: "figurants-ombre", mesh: M.ombre,
        getColor: OMBRE, getScale: [1, 1, 1], parameters: { depthWriteEnabled: false } }),
      // une couche par allure : chacune ne répète que les siens, et les teint toutes parties
      ...M.modeles.flatMap((/** @type {any} */ mod, /** @type {number} */ k) => {
        const siens = data.filter(f => f.modele === k);
        return siens.length ? [new deck.SimpleMeshLayer({ ...commun, data: siens, id: "figurants-" + k,
          mesh: mod, getColor: [255, 255, 255], extensions: [teinteDesFigurants()],
          getFigurant: (/** @type {any} */ f) => [f.tenue, f.peau, f.cheveux, f.chaussures] })] : [];
      }),
    ];
  }
  return FIGURANTS.couches;
}

/* Un volume ne se peint pas en transparence : on verrait ses façades du fond
   au travers de celles de devant, et la zone aurait l'air d'un bloc de verre.
   Sa teinte translucide — une zone l'est toujours, un stand que la recherche
   éteint aussi — est donc mêlée au sol qu'elle laissait voir, et le volume
   prend le ton que l'aplat avait. */
/* Le volume choisi prend sa propre teinte, en éclatant : saturée, à
   mi-clarté. Éclairci, il pâlissait vers le blanc du sol ; foncé, il
   tranchait sur ses voisins mais se lisait comme éteint plutôt que choisi.
   Un stand gris n'a pas de teinte à faire éclater : il prend celle de
   l'accent. */
function eclatant(/** @type {number[]} */ c){
  const e = eclate(c);
  if (e) return e;
  const accent = couleurGl(getComputedStyle(document.documentElement).getPropertyValue("--accent").trim(), 1);
  return (accent && eclate(accent)) || c;
}
function opaque(couleur){
  const a = (couleur[3] === undefined ? 255 : couleur[3]) / 255;
  if (a >= 1) return couleur;
  const sol = GL.sol || [233, 234, 228];
  return [0, 1, 2].map(i => Math.round(couleur[i] * a + sol[i] * (1 - a))).concat(255);
}

function formeGl(el, cs, m, op, traces, acc){
  const cible = el.closest("[data-id],[data-poi]");
  acc = accDe(el, acc);
  const plein = couleurGl(cs.fill, parseFloat(cs.fillOpacity) * op);
  if (plein){
    const anneaux = traces.filter(t => t.pts.length >= 3).map(t => t.pts.map(p => appM(m, p)));
    const prise = el.closest(PRISES), haut = hauteurVolume(el, anneaux);
    /* Le volume choisi s'allume : monté devant un stand de même couleur, il
       s'en détache au lieu de s'y confondre. */
    const choisi = haut && el.parentNode.classList.contains("sel");
    const base = haut ? opaque(plein) : plein, couleur = choisi ? eclatant(base) : base;
    const hausse = haut ? noteHauteur(el.parentNode, haut) : null;
    if (choisi && el.parentNode.classList.contains("stand"))
      CHOISI = { id: el.parentNode.getAttribute("data-id") || "", anneaux, haut };
    const sol = auDessusDuSol(el);
    for (const polygon of avecTrous(anneaux)){
      poseJeton(el, polygon, couleur, acc);
      const monte = sol ? (/** @type {number[]} */ p) => [p[0], p[1], sol] : null;
      acc.pleins.push({ polygon: monte ? polygon.map(a => a.map(monte)) : polygon, couleur, base, el: cible, prise, haut, hausse });
      if (haut) meubleZone(el, polygon, couleur, acc);
    }
  } else if (acc.prises && cs.pointerEvents === "all"){
    /* Un contour seul s'attrape par son intérieur : c'est ce que
       « pointer-events: all » donne en SVG au calque ouvert. Un aplat
       d'opacité infime le rend visable sans rien montrer. */
    const anneaux = traces.filter(t => t.pts.length >= 3).map(t => t.pts.map(p => appM(m, p)));
    const prise = el.closest(PRISES);
    if (prise) for (const polygon of avecTrous(anneaux)) acc.pleins.push({ polygon, couleur: [0, 0, 0, 1], el: cible, prise });
  }
  const trait = couleurGl(cs.stroke, parseFloat(cs.strokeOpacity) * op);
  const sw = parseFloat(cs.strokeWidth);
  if (trait && sw > 0){
    const fixe = cs.vectorEffect === "non-scaling-stroke";
    /* Le trait d'une forme dessinée s'amincit quand on recule : la feuille de
       style l'a multiplié par le facteur de la vue où le SVG a été posé, on
       retrouve donc l'épaisseur réglée, que les couches « traits-z » bornent
       elles-mêmes au fil du zoom (`chemin-forme.mjs` `facteurTrait`). */
    const amincit = fixe && el.classList.contains("trait");
    const largeur = amincit ? Math.round(sw / (parseFloat(cs.getPropertyValue("--trait-f")) || 1) * 100) / 100
      : fixe ? sw : sw * echelleM(m);
    const tirets = cs.strokeDasharray && cs.strokeDasharray !== "none"
      ? cs.strokeDasharray.split(/[\s,]+/).map(parseFloat).filter(Number.isFinite) : null;
    // la bibliothèque mesure les tirets en demi-épaisseurs de trait
    const dash = tirets && tirets.length >= 2 ? [2 * tirets[0] / sw, 2 * tirets[1] / sw] : [0, 0];
    const defile = el.classList.contains("iSens");
    const sol = auDessusDuSol(el);
    const monte = sol ? (/** @type {number[]} */ p) => [p[0], p[1], sol] : null;
    for (const t of traces){
      if (t.pts.length < 2) continue;
      const pts = t.pts.map(p => appM(m, p)), path = monte ? pts.map(monte) : pts;
      if (t.ferme) path.push(path[0]);
      (amincit ? acc.traitsZ : fixe ? acc.traitsPx : acc.traitsM).push({ path, couleur: trait, largeur, dash, defile, el: cible,
        prise: el.closest(PRISES) });
    }
  }
}

/**
 * Le corps d'un texte du plan tel que le dessin l'a écrit, en mètres.
 *
 * Le style calculé ne le rend pas fidèlement partout. Une application qui
 * embarque le plan dans sa vue web y règle souvent une taille de police
 * minimale (`minimumFontSize` de WKWebView, `setMinimumFontSize` ou le zoom
 * du texte d'Android) : le navigateur l'applique à la valeur calculée, et un
 * texte de deux mètres y valait huit ou dix. Le SVG, lui, dessine à la taille
 * écrite — seul le rendu WebGL, qui relit le style, posait alors « Food
 * Court » en géant et les « 5 minutes » des arrêts les uns sur les autres.
 * Tous les textes du plan portent leur attribut, et aucune règle de la
 * feuille de style ne le remplace : c'est donc lui qui fait foi, hérité au
 * besoin d'un groupe ; le style calculé ne reste qu'en dernier recours.
 */
function corpsDeclare(el){
  for (let n = el; n && n.getAttribute; n = n.parentNode){
    const v = n.getAttribute("font-size");
    if (v && /^\s*[\d.]+\s*(px)?\s*$/.test(v)) return parseFloat(v);
    if (n.tagName === "svg") return 0;
  }
  return 0;
}

function texteGl(el, cs, m, op, acc){
  acc = accDe(el, acc);
  const texte = el.textContent;
  if (!texte || !texte.trim()) return;
  const coul = couleurGl(cs.fill, parseFloat(cs.fillOpacity) * op);
  if (!coul) return;
  const taille = corpsDeclare(el) || parseFloat(cs.fontSize);
  if (!(taille > 0)) return;
  /* La ligne de base du SVG est au pied des lettres ; la bibliothèque centre
     le texte sur son point. On remonte d'un tiers de corps, dans le repère
     du texte, avant d'appliquer sa rotation. */
  const pos = appM(m, [num(el, "x"), num(el, "y") - taille * .33]);
  const angle = Math.atan2(m[1], m[0]) * 180 / Math.PI;
  const famille = cs.fontFamily, graisse = cs.fontWeight;
  const cle = famille + "|" + graisse;
  if (!acc.textes.has(cle)) acc.textes.set(cle, { famille, graisse, items: [] });
  acc.textes.get(cle).items.push({
    // dans un jeton, au ras de sa face : la hauteur de la position le dit à `positionTexte`
    text: texte, position: acc.parent ? [pos[0], pos[1], 0] : pos, taille: taille * echelleM(m), angle: -angle,
    ancre: cs.textAnchor === "middle" ? "middle" : cs.textAnchor === "end" ? "end" : "start",
    couleur: coul, el: el.closest("[data-id],[data-poi]"), prise: el.closest("[data-f]"),
  });
}

function imageGl(el, m, op, acc){
  acc = accDe(el, acc);
  const href = el.getAttribute("href") || el.getAttribute("xlink:href");
  if (!href) return;
  let x = num(el, "x"), y = num(el, "y"), w = num(el, "width"), h = num(el, "height");
  /* « meet » : l'image garde ses proportions dans sa boîte. Sa taille n'est
     connue qu'une fois chargée ; en attendant elle ne se dessine pas, puis
     son bloc se repeint. */
  const nat = GL.tailles.get(href);
  if (!nat){
    GL.tailles.set(href, "attente");
    const i = new Image();
    i.onload = () => { GL.tailles.set(href, [i.naturalWidth, i.naturalHeight]); toutRepeindreWebgl(); };
    i.src = href;
    return;
  }
  if (nat === "attente") return;
  if ((el.getAttribute("preserveAspectRatio") || "xMidYMid meet") !== "none" && nat[0] > 0 && nat[1] > 0){
    const s = Math.min(w / nat[0], h / nat[1]);
    const w2 = nat[0] * s, h2 = nat[1] * s;
    x += (w - w2) / 2; y += (h - h2) / 2; w = w2; h = h2;
  }
  const a = appM(m, [x, y]), b = appM(m, [x + w, y + h]);
  const bornes = [Math.min(a[0], b[0]), Math.max(a[1], b[1]), Math.max(a[0], b[0]), Math.min(a[1], b[1])];
  acc.images.push({ href, bornes: GL.camera ? imageDressee(bornes, socleImage(el)) : bornes,
    op, el: el.closest("[data-id],[data-poi]"), prise: el.closest("[data-f]") });
}

/* ------------------------------------------------------------
   Les images debout

   Couchée sur le sol incliné, une image — le logo qu'un exploitant pose
   sur un stand — s'écrasait en hauteur d'autant que le hall fuyait, et ne
   se lisait plus. En vue immersive, elle se dresse donc face à l'œil, comme
   les noms : à angle droit de l'axe de la vue, quel que soit le cap, à sa
   taille sur le plan et plantée par le milieu de son bord bas au centre de
   l'endroit qu'elle couvrait.
   ------------------------------------------------------------ */

/** Les quatre coins d'une image dressée — bas gauche, haut gauche, haut
 *  droit, bas droit, l'ordre de la bibliothèque —, depuis ses bornes à plat
 *  `[gauche, bas, droite, haut]` et la hauteur `z` où elle se plante. */
function imageDressee(/** @type {number[]} */ b, /** @type {number} */ z){
  const cap = capCamera(), cc = Math.cos(cap), sc = Math.sin(cap);
  const st = SINUS_INCLINAISON, ct = Math.sqrt(1 - st * st);
  const w = b[2] - b[0], h = b[1] - b[3], cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2;
  /* Les deux axes de l'écran, en mètres du monde (`versEcran` à l'envers) :
     la droite reste au sol, le haut se penche en arrière de l'inclinaison. */
  const droite = [cc, -sc, 0], haut = [-sc * ct, -cc * ct, st];
  const pt = (/** @type {number} */ u, /** @type {number} */ v) =>
    [cx + droite[0] * u + haut[0] * v, cy + droite[1] * u + haut[1] * v, z + haut[2] * v];
  return [pt(-w / 2, 0), pt(-w / 2, h), pt(w / 2, h), pt(w / 2, 0)];
}

/** Où une image se plante : sur le dessus du stand qu'elle désigne — au sol,
 *  ses façades la couperaient —, au sol sinon. */
function socleImage(/** @type {Element} */ el){
  const lie = el.closest("[data-id]");
  if (!lie) return 0;
  const g = $("stands").querySelector('g.stand[data-id="' + CSS.escape(lie.getAttribute("data-id") || "") + '"]');
  return g && g.firstElementChild ? hauteurVolume(g.firstElementChild) + .02 : 0;
}

/* Une forme qui ne désigne rien laisse passer le clic, comme en SVG où les
   calques dessinés sont « pointer-events: none » : un aplat décoratif posé sur
   un stand ne doit pas empêcher d'ouvrir sa fiche. Chaque sorte de primitive
   se partage donc en deux couches, l'une cliquable, l'autre non. Sur le
   calque ouvert, tout ce que l'éditeur peut saisir est cliquable. */
const partage = (liste, prises, deja) => {
  const vise = d => Boolean(d.el || (prises && d.prise)) && !(deja && deja.has(d.el || d.prise));
  return [liste.filter(vise), liste.filter(d => !vise(d))];
};

/** Ce qu'une couche désigne quand on la vise. */
const designeGl = (d) => d.el || d.prise;

/* Le stand qu'on choisit monte, celui qu'on quitte redescend : en un peu
   plus d'une seconde, et non d'un coup. Plus vite, on voyait le stand arrivé
   en haut plutôt que s'élever ; à cette allure, le mouvement se suit des yeux.

   La bibliothèque sait glisser d'une valeur à l'autre, mais pas ici : le bloc
   des stands se reconvertit en entier à chaque sélection, et sa transition
   repartait de la hauteur d'arrivée — le stand sautait. On anime donc nous-
   mêmes. La conversion note la hauteur de chaque volume ; celui dont la
   hauteur change se peint, le temps du mouvement, dans une couche à lui, à sa
   hauteur d'arrivée, et la boucle d'animation (`animeCouche`) en règle
   l'échelle d'une image à l'autre — un seul nombre, rien ne se recalcule. */
const DUREE_HAUSSE = 1040;
const sortie = (/** @type {number} */ t) => 1 - Math.pow(1 - t, 3);
/** @type {WeakMap<Element, number>} la dernière hauteur peinte de chaque volume */
const hauteursPeintes = new WeakMap();
/** @type {Map<Element, { de: number, vers: number, t0: number }>} les volumes en mouvement */
const hausses = new Map();
/** Le volume vient-il de changer de hauteur ? On le note, et l'on dit s'il bouge. */
function noteHauteur(/** @type {Element} */ g, /** @type {number} */ haut){
  const avant = hauteursPeintes.get(g);
  hauteursPeintes.set(g, haut);
  // qui demande moins de mouvement le voit changer de hauteur d'un coup, comme
  // le plan entier qui s'abaisse sous un trajet
  if (avant !== undefined && avant !== haut && !MOUVEMENT_REDUIT.matches && !GL.massif){
    /* Un volume encore en route repart d'où il est, et non d'où il allait :
       un clic sur un autre stand pendant la montée du premier le faisait
       bondir à sa hauteur d'arrivée avant de redescendre. */
    const enRoute = hausses.get(g), maintenant = performance.now();
    const de = enRoute ? hauteurHausse(enRoute, maintenant) : avant;
    hausses.set(g, { de, vers: haut, t0: maintenant });
    // son nom quitte les couches communes pour monter avec lui
    GL.couchesLibelles = null;
  }
  const h = hausses.get(g);
  if (h && (h.vers !== haut || performance.now() - h.t0 >= DUREE_HAUSSE)){ hausses.delete(g); return null; }
  return h || null;
}
/**
 * Le mouvement part au clic, sans attendre la reconversion.
 *
 * Celle-ci ne vient qu'après que la page a montré la fiche (`planifieWebgl`),
 * et reconvertir neuf cents stands prend son temps : sur un PC, le stand ne
 * se mettait à monter qu'une fois la fiche ouverte. Le guet voit pourtant la
 * sélection à l'instant où elle change. On sort donc le stand des couches
 * déjà peintes pour le poser dans une couche de mouvement, et la boucle
 * démarre ; la reconversion, quand elle vient, retrouve le mouvement noté et
 * le continue.
 */
function anticipeHausses(notes){
  if (!GL.camera) return;
  const vus = new Set();
  for (const n of notes){
    const g = n.target;
    if (n.type !== "attributes" || n.attributeName !== "class" || vus.has(g)) continue;
    if (!g.classList || !(g.classList.contains("stand") || g.classList.contains("zone"))) continue;
    vus.add(g);
    const el = g.firstElementChild, haut = el ? hauteurVolume(el) : 0;
    if (!haut || hauteursPeintes.get(g) === haut) continue;
    const h = noteHauteur(g, haut);
    if (h) detacheVolume(g, h);
  }
}
/**
 * Le mouvement part à l'appui, sans attendre le relâché.
 *
 * Un clic ne choisit qu'au relâché — on ne sait qu'alors si la main voulait
 * choisir ou glisser —, et la montée attendait d'autant : le temps d'un
 * clic, un dixième de seconde, se sentait comme un retard. Le stand appuyé
 * se met donc à monter tout de suite, vers la hauteur d'un stand choisi.
 * Le choix, au relâché, retrouve ce mouvement et le poursuit ; un glissement,
 * ou un relâché qui ne le choisit pas, le fait redescendre (`rendLAppui`).
 */
/** @type {Element | null} */
let _monteALAppui = null;
export function monteALAppui(/** @type {Element | null} */ g){
  if (!GL.actif || !GL.camera || !g || !g.classList || g.classList.contains("sel")) return;
  if (!g.classList.contains("stand") && !g.classList.contains("zone")) return;
  const el = g.firstElementChild, haut = el ? hauteurVolume(el) : 0;
  // un emplacement libre, ou un stand abaissé sous un trajet, ne monte pas au choix
  if (!haut || haut === HAUTEUR_LIBRE || haut === HAUTEUR_ABAISSEE) return;
  const h = noteHauteur(g, haut * HAUSSE_CHOIX);
  if (!h) return;
  _monteALAppui = g;
  detacheVolume(g, h);
}
/** L'appui n'a pas choisi son stand : il reprend sa hauteur. */
export function rendLAppui(){
  const g = _monteALAppui;
  _monteALAppui = null;
  if (!g || !GL.actif || g.classList.contains("sel")) return;
  const el = g.firstElementChild, haut = el ? hauteurVolume(el) : 0;
  const h = noteHauteur(g, haut);
  if (h) detacheVolume(g, h);
}

/** Le volume quitte les couches peintes de son bloc pour une couche de mouvement. */
function detacheVolume(g, h){
  const b = blocDe(g), couches = b && GL.blocs.get(b);
  if (!couches) return;
  const out = [];
  for (const c of couches){
    const volume = /-(volumes|hausse)-/.test(c.id) && Array.isArray(c.props.data);
    const siens = volume ? c.props.data.filter(d => d.el === g) : [];
    if (!siens.length){ out.push(c); continue; }
    const reste = c.props.data.filter(d => d.el !== g);
    if (reste.length) out.push(c.clone({ data: reste }));
    // le contour d'un volume parti part avec lui : il se refait avec le volume, juste après
    if (c.props.contour) continue;
    // il s'allume au clic, et reprend sa couleur dès qu'on le quitte
    const choisi = g.classList.contains("sel");
    const id = c.id.replace(/-tot$/, "") + "-tot";
    const data = siens.map(d => ({ ...d, haut: h.vers, hausse: h,
      couleur: choisi ? eclatant(d.base || d.couleur) : d.base || d.couleur }));
    out.push(c.clone({ id, data, hausse: h, elevationScale: echelleHausse(h, performance.now()) }),
      coucheContours(id, data, { hausseContour: h }));
  }
  GL.blocs.set(b, out);
  GL.deck.setProps({ layers: assembleWebgl() });
  majAnimationWebgl();
}

/** La hauteur d'un volume en mouvement, à cet instant. */
function hauteurHausse(/** @type {{ de: number, vers: number, t0: number }} */ h, /** @type {number} */ maintenant){
  const t = Math.min(1, Math.max(0, (maintenant - h.t0) / DUREE_HAUSSE));
  return h.de + (h.vers - h.de) * sortie(t);
}
/** Où en est un volume en mouvement, en fraction de sa hauteur d'arrivée. */
const echelleHausse = (/** @type {{ de: number, vers: number, t0: number }} */ h, /** @type {number} */ maintenant) =>
  hauteurHausse(h, maintenant) / h.vers;
/** Les volumes en mouvement, par l'identifiant que portent leurs noms. */
function haussesParId(){
  /** @type {Map<string, { de: number, vers: number, t0: number }>} */
  const m = new Map();
  for (const [g, h] of hausses){ const id = g.getAttribute("data-id"); if (id) m.set(id, h); }
  return m;
}

/* Le contour du dessus des volumes, d'un ton plus sombre que leur couleur.
   Vu de biais, deux stands de même couleur l'un derrière l'autre ne
   faisaient qu'une surface : le stand choisi, monté devant son voisin, s'y
   fondait. Le contour les tient séparés.

   Un trait le long du bord du dessus, et rien d'autre : les arêtes que la
   bibliothèque sait tracer suivent chaque facette, et les coins arrondis,
   faits de petites faces, se couvraient de stries verticales. Il se pose un
   rien au-dessus du dessus, pour ne pas s'y enfoncer à moitié. */
const arete = (/** @type {number[]} */ c) => [0, 1, 2].map(i => Math.round(c[i] * .62)).concat(255);
/** Le contour d'un volume : l'anneau de son dessus, à sa hauteur. */
const contourDe = (/** @type {any} */ d, /** @type {number} */ haut) =>
  ({ path: d.polygon[0].map((/** @type {number[]} */ p) => [p[0], p[1], haut + .02]).concat([[d.polygon[0][0][0], d.polygon[0][0][1], haut + .02]]),
     couleur: arete(d.couleur), el: d.el });
/** La couche des contours d'une couche de volumes. */
const coucheContours = (/** @type {string} */ id, /** @type {any[]} */ data, /** @type {any} */ extra = {}) =>
  new deck.PathLayer({ id: id + "-contour", data: data.map(d => contourDe(d, d.haut)), pickable: false,
    getPath: (/** @type {any} */ x) => x.path, getColor: (/** @type {any} */ x) => x.couleur,
    getWidth: 1, widthUnits: "pixels", contour: true, ...extra });

/* Une matière mate : un plan de salon n'a pas de reflets, et un dessus qui
   brille changerait de couleur d'un bout du hall à l'autre. Les parts sont
   comptées pour qu'un dessus, en plein jour, rende à peu près la couleur que
   l'exploitant a choisie — et qu'une façade à l'ombre en garde les quatre
   cinquièmes. Plus sombre, tout le plan tournait au terne. */
const MATIERE = { ambient: .8, diffuse: .42, shininess: 4, specularColor: [12, 12, 12] };

/* Ce qui est couché à plat — aplat, trait, image — se peint en vue immersive
   dans l'ordre du dessin, sans écrire la profondeur. Une pastille et son
   pictogramme, un cartouche et son logo, sont à la même hauteur ; vus de
   biais, la carte graphique les départageait par une profondeur qui diffère
   d'un rien d'un triangle à l'autre, et l'un perçait l'autre en dents de
   scie : le pictogramme ne se lisait plus. Les volumes, peints avant eux,
   gardent la leur : un stand devant un repère le cache toujours. */
const aPlat = () => GL.camera ? { parameters: { depthCompare: "less-equal", depthWriteEnabled: false } } : {};

function couchesDeBloc(acc, cle){
  const L = deck, out = [], plat = aPlat();
  const pleins = partage(acc.pleins, acc.prises);
  // les volumes d'abord : ce qui est à plat se mesure à leur profondeur
  const couches = [];
  pleins.forEach((liste, k) => {
    const plats = liste.filter(d => !d.haut), volumes = liste.filter(d => d.haut && !d.hausse);
    if (plats.length) couches.push(new L.SolidPolygonLayer({ id: cle + "-pleins-" + k, data: plats, pickable: k === 0,
      getPolygon: d => d.polygon, getFillColor: d => d.couleur, ...plat }));
    /* Les stands de la vue immersive : la même couleur, montée en volume. La
       lumière (`effetsGl`) fonce les façades ; le dessus garde le ton choisi. */
    if (volumes.length) out.push(new L.SolidPolygonLayer({ id: cle + "-volumes-" + k, data: volumes, pickable: k === 0,
      extruded: true, getPolygon: d => d.polygon, getFillColor: d => d.couleur, getElevation: d => d.haut,
      material: MATIERE }), coucheContours(cle + "-volumes-" + k, volumes));
    // chaque volume en mouvement, seul dans sa couche : la boucle en règle l'échelle
    liste.filter(d => d.hausse).forEach((d, n) => out.push(new L.SolidPolygonLayer({
      id: cle + "-hausse-" + k + "-" + n, data: [d], pickable: k === 0,
      extruded: true, getPolygon: x => x.polygon, getFillColor: x => x.couleur, getElevation: x => x.haut,
      material: MATIERE, hausse: d.hausse, elevationScale: echelleHausse(d.hausse, performance.now()) }),
      coucheContours(cle + "-hausse-" + k + "-" + n, [d], { hausseContour: d.hausse })));
  });
  if (acc.decor.length) out.push(new L.SolidPolygonLayer({ id: cle + "-decor", data: acc.decor, pickable: false,
    extruded: true, getPolygon: d => d.polygon, getFillColor: d => d.couleur, getElevation: d => d.haut,
    material: MATIERE }));
  out.push(...couches);
  /* Ce qu'un aplat désigne déjà, son contour n'a pas à le redésigner.
     Désigner se fait en rendant chaque couche cliquable dans un tampon qu'on
     relit ensuite — et le contour des neuf cents stands y coûtait à lui seul
     cent millisecondes sur les cent dix, quand les aplats en coûtent dix.
     C'était payé au doigt posé, avant même de savoir s'il s'agit d'un appui ou
     d'un déplacement, et cela se voyait : la fiche du stand suivant paraissait
     attendre une animation qui n'avait pas lieu.

     L'aplat couvre la forme entière ; il ne reste dehors que la moitié
     extérieure d'un trait, large d'un pixel. Une forme qui n'a pas d'aplat —
     un trait, un contour ouvert, un stand laissé sans aplat — garde le
     sien : c'est tout ce qu'elle a pour répondre. */
  const repondus = new Set(pleins[0].map(designeGl).filter(Boolean));
  for (const [suffixe, tous, unites] of [["traits-px", acc.traitsPx, "pixels"], ["traits-m", acc.traitsM, "common"]])
  partage(tous, acc.prises, repondus).forEach((liste, k) => {
    if (!liste.length) return;
    // ce qui défile a ses couches : ce sont elles seules qui bougent
    const K = constTexte();
    /* Les traits qui défilent sont taillés par « TiretsQuiDefilent », et non
       par la bibliothèque : elle les laisse donc tranquilles. Leur réglage est
       unique par couche et non porté par la donnée — d'où une couche par
       longueur, les trois traits de la comète n'ayant pas la même. */
    const parLongueur = new Map();
    for (const d of liste) if (d.defile){
      const c = d.dash.join(" ") + "/" + d.largeur;
      if (!parLongueur.has(c)) parLongueur.set(c, []);
      parLongueur.get(c).push(d);
    }
    const lots = [[liste.filter(d => !d.defile), ""]];
    [...parLongueur.values()].forEach((l, n) => lots.push([l, "-defile" + n]));
    for (const [l, marque] of lots){
      if (!l.length) continue;
      const bouge = marque !== "";
      out.push(new L.PathLayer({ id: cle + "-" + suffixe + "-" + k + marque, data: l, pickable: k === 0,
        /* Le trajet se trace face à l'œil en vue immersive : couché sur le sol
           incliné, il s'amincissait au loin jusqu'à se perdre. Et sans
           consulter la profondeur : sa lueur, peinte juste avant à la même
           hauteur, la retenait, et vu de biais le trait tombait d'un rien
           derrière elle — il ne restait du trajet qu'un ruban pâle. Peint
           par-dessus, il se lit de bout en bout, comme une signalétique au
           sol. */
        ...(GL.camera && cle === "#itin" ? { billboard: true, parameters: { depthCompare: "always", depthWriteEnabled: false } } : plat),
        getPath: d => d.path, getColor: d => d.couleur, getWidth: d => d.largeur, widthUnits: unites,
        jointRounded: true, capRounded: false, widthMinPixels: unites === "common" ? .6 : 0, defile: bouge,
        extensions: K.traits, getDashArray: bouge ? [0, 0] : d => d.dash, dashJustified: false,
        tirets: bouge ? l[0].dash : [0, 0], demiEpaisseur: l[0].largeur / 2 }));
    }
  });
  /* Les traits qui s'amincissent : comptés en mètres, à la largeur que le
     SVG leur donnerait à « TRAIT_PLEIN » pixels par mètre, et bornés par
     leur épaisseur réglée et son plancher. Les bornes tiennent à la couche,
     non au trait : une couche par épaisseur, et un plan n'en compte que
     quelques-unes. */
  partage(acc.traitsZ, acc.prises, repondus).forEach((liste, k) => {
    const parEpaisseur = new Map();
    for (const d of liste){
      if (!parEpaisseur.has(d.largeur)) parEpaisseur.set(d.largeur, []);
      parEpaisseur.get(d.largeur).push(d);
    }
    let n = 0;
    for (const [ep, l] of parEpaisseur)
      out.push(new L.PathLayer({ id: cle + "-traits-z-" + k + "-" + (n++), data: l, pickable: k === 0,
        getPath: d => d.path, getColor: d => d.couleur, getWidth: ep / TRAIT_PLEIN, widthUnits: "common",
        widthMinPixels: ep * TRAIT_PLANCHER, widthMaxPixels: ep,
        jointRounded: true, capRounded: false, extensions: constTexte().traits,
        getDashArray: d => d.dash, dashJustified: false, tirets: [0, 0], demiEpaisseur: ep / 2, ...plat }));
  });
  let i = 0;
  for (const g of acc.textes.values()) out.push(...couchesTexte(cle + "-textes-" + (i++), g.items, g.famille, g.graisse,
    { pickable: g.items.some(d => d.el || (acc.prises && d.prise)) }));
  acc.images.forEach((d, k) => out.push(new L.BitmapLayer({ id: cle + "-image-" + k, image: d.href,
    bounds: d.bornes, opacity: d.op, pickable: Boolean(d.el || (acc.prises && d.prise)), el: d.el, prise: d.prise, ...plat })));
  return out;
}

/* ------------------------------------------------------------
   Les noms.

   Le SVG écrit ceux que la vue du moment rend lisibles, et les réécrit à
   chaque arrêt. Ici chaque nom est préparé une fois, avec l'intervalle de
   zoom où il se lit ; la carte graphique les montre ou les tait à chaque
   image, sans rien recalculer. Mêmes seuils, même empilement du nom et du
   numéro que « libelleEmplacement » : l'enseigne seule tant que son numéro
   serait illisible, les deux dès qu'il le devient.

   Cette préparation suit les règles des libellés du SVG, et reste avec
   elles (`libelles.mjs` `libellesWebgl`), qui la dépose
   dans `GL`. Ici, les témoins de style qui disent l'encre et la police de
   chaque sorte de nom, et les couches qui les peignent.
   ------------------------------------------------------------ */
const CLASSES_LIBELLES = ["nm", "nm sel", "zn", "zn sel", "zn masquee", "zn sel masquee", "cd", "cd sel",
  "coexN", "coexN sel", "coexPast", "coexPast sel"];
// le libellé d'une zone mise en avant ; celui qu'on déplace à la main
const CLASSES_PHARE = ["zn", "zn sel", "zn masquee", "zn sel masquee"];

/** Des témoins dans « #labels », jamais montrés : la feuille de style leur
 *  donne la couleur et la police qu'elle donnerait aux vrais. La pastille des
 *  coexposants est un rectangle ; le survol n'a pas de classe à lui, et prend
 *  la teinte que sa règle lui donne. */
function modelesLibellesHtml(){
  const temoin = (c, groupe, cle) => '<g class="' + groupe + '">' + (c.startsWith("coexPast")
    ? '<rect class="' + c + '" data-modele="' + cle + '"/>'
    : '<text class="' + c.replace(/\bcd\b/, "").trim() + '" data-modele="' + cle + '">A</text>') + '</g>';
  return CLASSES_LIBELLES.map(c => temoin(c, "lbl", c)).join("") +
    CLASSES_PHARE.map(c => temoin(c, "lbl phare", c + " phare")).join("") +
    temoin("nm", "lbl pick", "pick") +
    '<rect data-modele="survol" style="fill:var(--accent-soft);stroke:var(--accent)"/>' +
    '<rect data-modele="poi" style="fill:var(--c-poi,var(--accent))"/>';
}
export function poseModelesLibelles(){
  // ajoutés aux libellés du SVG, qui restent à l'écran jusqu'à la première image
  if (!$("labels").querySelector("[data-modele]"))
    $("labels").insertAdjacentHTML("beforeend", modelesLibellesHtml());
  lisModelesLibelles();
}
function lisModelesLibelles(){
  const avant = GL.signatureModeles;
  GL.modeles.clear();
  $("labels").querySelectorAll("[data-modele]").forEach(t => {
    const cs = getComputedStyle(t);
    /* L'opacité du groupe — le plan en retrait derrière une mise en avant —
       et celle du texte — une zone masquée — se multiplient, comme à l'écran. */
    const op = parseFloat(getComputedStyle(t.parentNode).opacity) * parseFloat(cs.opacity);
    const couleur = couleurGl(cs.fill, (parseFloat(cs.fillOpacity) || 1) * op) || [0, 0, 0, 0];
    // un contour peint sous la lettre est un liseré ; sa largeur se dit en corps
    const sw = parseFloat(cs.strokeWidth), corps = parseFloat(cs.fontSize) || 16;
    const lisere = cs.paintOrder.startsWith("stroke") && cs.stroke !== "none" && sw > 0
      ? couleurGl(cs.stroke, (parseFloat(cs.strokeOpacity) || 1) * op) : null;
    GL.modeles.set(t.dataset.modele, { couleur,
      trait: couleurGl(cs.stroke, (parseFloat(cs.strokeOpacity) || 1) * op) || [0, 0, 0, 0],
      halo: lisere ? { couleur: lisere, largeur: sw / corps } : null,
      famille: cs.fontFamily, graisse: cs.fontWeight, visible: cs.display !== "none" });
  });
  GL.signatureModeles = JSON.stringify([...GL.modeles]);
  if (GL.signatureModeles !== avant) GL.versionModeles++;
}

/* Ce qui s'écrit sur l'aplat d'un stand — son nom, son numéro, ceux qu'il
   héberge —, par opposition au nom d'une zone, posé sur le sol ou sur un
   aplat translucide. Le lissage sous-pixel n'est juste que sur un fond
   opaque : voir « couchesPetites ». */
const SUR_UN_STAND = /^(nm|cd|coexN)\b/;

/* Les noms se regroupent par police une fois par version, et non à chaque pas
   de zoom : un nouveau tableau, même au contenu identique, passe pour des
   données neuves, et la bibliothèque remettait en page les mille noms à chaque
   image — quarante millisecondes, le zoom à vingt-cinq images par seconde. Seul
   le filtre de zoom change d'une image à l'autre. */
function groupesNoms(cle, liste){
  const version = GL.versionLibelles + "|" + GL.versionModeles;
  const deja = GL.groupes.get(cle);
  if (deja && deja.version === version) return deja.groupes;
  const groupes = new Map();
  for (const d of liste){
    const mo = GL.modeles.get(d.cls) || GL.modeles.get("nm");
    if (!mo || !mo.visible) continue;
    // un liseré se règle pour toute une couche : les noms qui en portent un vont ensemble
    const sp = SUR_UN_STAND.test(d.cls);
    const k = mo.famille + "|" + mo.graisse + "|" + (mo.halo ? mo.halo.couleur.join() + "/" + mo.halo.largeur.toFixed(3) : "") + (sp ? "|sp" : "");
    if (!groupes.has(k)) groupes.set(k, { mo, sp, items: [] });
    groupes.get(k).items.push(d);
  }
  GL.groupes.set(cle, { version, groupes: [...groupes.values()] });
  return GL.groupes.get(cle).groupes;
}
function couchesNoms(prefixe, groupes){
  let i = 0;
  return groupes.flatMap(g => couchesTexte(prefixe + (i++), g.items,
    g.mo.famille, g.mo.graisse, { lineHeight: 1.18, ancre: "middle", halo: g.mo.halo, pickable: PLACE_LIBELLES, sousPixel: g.sp,
      getColor: d => d.pick ? (GL.modeles.get("pick") || g.mo).couleur : (GL.modeles.get(d.cls) || g.mo).couleur,
      updateTriggers: { getColor: GL.versionModeles } }));
}

/* La pastille est un trait épais aux bouts arrondis : c'est la forme exacte
   d'une gélule, et un trait se montre ou se tait au zoom comme un texte. Son
   liseré est un second trait, un peu plus large, posé dessous. */
function couchesPastilles(){
  const K = constTexte();
  const liste = GL.pastilles.filter(d => (GL.modeles.get(d.cls) || {}).visible);
  if (!liste.length) return [];
  const commun = { data: liste, getPath: d => d.path, widthUnits: "common", capRounded: true,
    extensions: K.traits, getZoomFiltre: d => [d.z0, d.z1, -100],
    updateTriggers: { getColor: GL.versionModeles } };
  return [
    new deck.PathLayer({ ...commun, id: "pastilles-trait", getWidth: d => d.largeur,
      getColor: d => GL.modeles.get(d.cls).trait }),
    new deck.PathLayer({ ...commun, id: "pastilles-fond", getWidth: d => d.largeur * .9,
      getColor: d => GL.modeles.get(d.cls).couleur }),
  ];
}

function couchesLibellesWebgl(){
  if (!GL.couchesLibelles){
    /* Le nom d'un stand qui monte ou redescend se peint à part, posé à la
       hauteur d'arrivée : la boucle d'animation le décale d'image en image
       du même écart que son volume (`animeCouche`). Les autres restent
       ensemble — ce sont eux qu'on ne recalcule pas. */
    /* Les noms des stands seulement : celui d'une zone flotte au-dessus de son
       mobilier, loin de son sol, et n'a pas à suivre ce qu'il monte. */
    const mobiles = new Map([...haussesParId()].filter(([id]) =>
      GL.libelles.some(d => d.lbl === id && !(d.cls || "").startsWith("zn"))));
    const caches = nomsCaches(GL.libelles);
    const fixes = mobiles.size || caches.size
      ? GL.libelles.filter(d => !mobiles.has(d.lbl) && !caches.has(d.lbl)) : GL.libelles;
    /* Chaque liste a sa clé dans le cache des groupes : sous la même, le nom
       qui monte reprenait les groupes de tous les autres, et le plan entier
       se peignait deux fois, décalé — tous les noms paraissaient flous le
       temps du mouvement. */
    const cleFixes = (mobiles.size ? "labels-sans|" + [...mobiles.keys()].join("|") : "labels") +
      (caches.size ? "|caches|" + [...caches].join("|") : "");
    // les groupes d'un choix quitté ne reserviront pas : chaque stand choisi en ferait d'autres
    for (const k of [...GL.groupes.keys()]) if (k.includes("|caches|") && k !== cleFixes) GL.groupes.delete(k);
    GL.couchesLibelles = [...couchesPastilles(), ...couchesNoms("libelles-", groupesNoms(cleFixes, fixes))];
    for (const [id, h] of mobiles){
      /* Posé à la hauteur d'arrivée du volume, et non à celle que ses
         classes diraient : le mouvement part au clic, avant que les noms
         n'aient appris la sélection. */
      if (caches.has(id)) continue;
      const siens = GL.libelles.filter(d => d.lbl === id).map(d => ({ ...d, zHausse: h.vers }));
      if (siens.length) GL.couchesLibelles.push(...couchesNoms("libelles-hausse-" + id + "-",
        groupesNoms("labels-hausse|" + id + "|" + h.vers, siens)).map(c => c.clone({ hausseTexte: h })));
    }
  }
  return GL.couchesLibelles;
}

/** Les noms des stands dessinés d'un calque, posés juste au-dessus de lui. */
function couchesDessineesWebgl(b){
  const liste = GL.dessines.get(b);
  if (!liste || !liste.length) return [];
  const cle = cleBloc(b);
  return couchesNoms(cle + "-noms-", groupesNoms(cle, liste));
}

/* ------------------------------------------------------------
   Le survol et le focus.

   Le SVG caché ne connaît plus « :hover » : le pointeur tombe sur sa racine,
   jamais sur le stand. On demande donc à la carte graphique ce qui est sous
   la souris — une fois par image au plus — et la teinte du survol se peint
   sur l'aplat de ce stand, juste au-dessus de lui : ses cloisons et son nom
   restent devant.

   Le focus du clavier, lui, se pose toujours sur l'élément du SVG, que la
   feuille de style laisse atteignable. Son liseré se peint de même, au-dessus
   du calque qui le porte.
   ------------------------------------------------------------ */
const SURVOLABLE = ".stand, .zone, .dcal .forme.sdes.lie";
const stage = () => svg.parentNode;
const FOCALISABLE = ".stand, .zone, .dcal .forme.sdes";
let _survolXY = null, _survolImage = 0;

function brancheSurvolWebgl(){
  svg.addEventListener("pointermove", e => {
    if (e.pointerType !== "mouse" || e.buttons || _page.drag() || _page.pince()){ poseSurvolWebgl(null); return; }
    _survolXY = [e.clientX, e.clientY];
    if (!_survolImage) _survolImage = requestAnimationFrame(() => {
      _survolImage = 0;
      if (!_survolXY || !GL.actif) return;
      const o = objetSous(_survolXY[0], _survolXY[1], _page.enEdition() ? 3 : 0);
      const el = o && o.el;
      poseSurvolWebgl(el && el.matches(SURVOLABLE) ? el : null);
      poseCurseurWebgl(o);
    });
  });
  svg.addEventListener("pointerleave", () => { _survolXY = null; poseSurvolWebgl(null); poseCurseurWebgl(null); });
  svg.addEventListener("focusin", e => {
    const el = e.target.closest && e.target.closest(FOCALISABLE);
    poseFocusWebgl(el && el.matches(":focus-visible") ? el : null);
  });
  svg.addEventListener("focusout", () => poseFocusWebgl(null));
}
function poseSurvolWebgl(el){
  if (el === GL.survol) return;
  const quitte = GL.survol;
  GL.survol = el;
  if (enTuiles()){
    if (quitte) visePour(quitte, 0);
    if (el) visePour(el, 1);
    gonfleSurvol();
  } else TUILES.clear();
  GL.deck.setProps({ layers: assembleWebgl() });
}

/* ------------------------------------------------------------
   Le survol d'une tuile

   Dans l'ambiance Tuiles (`ambiance.mjs`), la tuile visée se soulève : elle
   grandit un peu autour de son centre, passe devant le vide qui la sépare de
   ses voisines, et prend une teinte vive tirée de la sienne — la même famille
   de couleur, plus franche. Une ombre légère, un peu plus grande qu'elle, dit
   qu'elle a quitté le sol. Une tuile neutre — blanche, grise — n'a pas de
   teinte à aviver : elle prend celle du survol ordinaire.

   Les deux sens s'animent : la tuile qu'on quitte se repose — elle rétrécit,
   son ombre s'efface, sa teinte revient — pendant que la suivante se soulève.
   Chaque tuile tient donc sa propre course, de 0 (au sol) à 1 (soulevée), et
   un aller-retour rapide repart de là où elle en était au lieu de sauter.
   Cent soixante millisecondes pour monter, un peu plus pour redescendre ;
   puis plus rien ne bouge tant que la souris reste où elle est.
   ------------------------------------------------------------ */
const enTuiles = () => document.documentElement.classList.contains("ambiance-tuiles");
const MONTE_MS = 160, DESCEND_MS = 220, GONFLE = .06;
/** Les tuiles en mouvement ou soulevées : où leur course partait, vers où, et quand.
 *  @type {Map<Element, { de: number, vers: number, t0: number }>} */
const TUILES = new Map();
let imageGonfle = 0;

/** Où en est une tuile, de 0 à 1, à cet instant — en fin douce. */
function hauteurTuile(st, now = performance.now()){
  if (MOUVEMENT_REDUIT.matches) return st.vers;
  const k = Math.min(1, (now - st.t0) / (st.vers > st.de ? MONTE_MS : DESCEND_MS));
  return st.de + (st.vers - st.de) * (1 - (1 - k) * (1 - k) * (1 - k));
}

function visePour(el, vers){
  const st = TUILES.get(el);
  TUILES.set(el, { de: st ? hauteurTuile(st) : 0, vers, t0: performance.now() });
}

function gonfleSurvol(){
  if (imageGonfle) return;
  const image = () => {
    imageGonfle = 0;
    if (!GL.actif) return;
    const now = performance.now();
    let bouge = false;
    for (const [el, st] of TUILES){
      const h = hauteurTuile(st, now);
      if (h !== st.vers) bouge = true;
      else if (st.vers === 0) TUILES.delete(el);   // reposée : elle n'a plus de couche à elle
    }
    GL.deck.setProps({ layers: assembleWebgl() });
    if (bouge) imageGonfle = requestAnimationFrame(image);
  };
  imageGonfle = requestAnimationFrame(image);
}

/** La tuile soulevée à la hauteur « k » : son ombre puis elle, agrandies
 *  autour du centre de leurs aplats, sa teinte à mi-chemin de la vive. Une
 *  tuile choisie garde sa teinte vive à toute hauteur : seul le survol la
 *  soulève, et en redescendant elle ne repasse pas par sa couleur d'origine. */
function coucheTuileSoulevee(aplats, k, n, choisie = false){
  const s = 1 + GONFLE * k;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const d of aplats) for (const p of d.polygon[0]){
    if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0];
    if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1];
  }
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const autour = (e) => [e, 0, 0, 0, 0, e, 0, 0, 0, 0, 1, 0, cx * (1 - e), cy * (1 - e), 0, 1];
  const t = (GL.modeles.get("survol") || {}).couleur || [0, 0, 0, 0];
  const cle = Math.round(k * 40);
  const vers = (d) => avive(d.couleur) || [t[0], t[1], t[2], Math.round(t[3] * d.couleur[3] / 255)];
  const mele = (d) => { const v = vers(d); if (choisie) return v;
    return [0, 1, 2, 3].map(i => Math.round(d.couleur[i] + (v[i] - d.couleur[i]) * k)); };
  return [
    new deck.SolidPolygonLayer({ id: "survol-ombre-" + n, data: aplats, getPolygon: d => d.polygon,
      modelMatrix: autour(1 + (GONFLE + .02) * k), getFillColor: [20, 24, 26, Math.round(20 * k)],
      updateTriggers: { getFillColor: cle } }),
    new deck.SolidPolygonLayer({ id: "survol-" + n, data: aplats, getPolygon: d => d.polygon,
      modelMatrix: autour(s), getFillColor: mele, updateTriggers: { getFillColor: cle } }),
  ];
}

/** Les tuiles choisies, puis celles en vol ou soulevées qu'une couche porte —
 *  celle qu'on survole en dernier, par-dessus celles qui se reposent.
 *
 *  La tuile choisie prend la teinte du survol, à plat : la même couleur dit
 *  « c'est celle-ci », qu'on la désigne de la souris ou qu'on l'ait ouverte.
 *  Sa feuille de style la laisse à sa teinte d'origine, que la carte
 *  graphique avive ici comme elle avive le survol. */
function couchesTuiles(couche, choisies){
  const out = [], now = performance.now();
  let n = 0;
  for (const el of choisies){
    if (TUILES.has(el)) continue;
    const aplats = aplatsDe(couche, el);
    if (aplats.length) out.push(...coucheTuileSoulevee(aplats, 0, couche.id + "-c" + (n++), true));
  }
  for (const [el, st] of TUILES){
    const aplats = aplatsDe(couche, el);
    if (aplats.length) out.push(...coucheTuileSoulevee(aplats, hauteurTuile(st, now), couche.id + "-" + (n++), choisies.has(el)));
  }
  return out;
}
/** Le curseur que la feuille de style donne à ce qui est visé — la main sur un
 *  stand, la flèche de redimensionnement d'une poignée, le déplacement d'une
 *  forme choisie. La racine du SVG, seule sous la souris, le porte ; un geste
 *  en cours, qui écrit le sien sur elle, garde la main. */
function poseCurseurWebgl(o){
  let c = "";
  if (o && PLACE_LIBELLES && o.lbl) c = "move";
  else if (o && o.prise) c = getComputedStyle(o.prise).cursor;
  else if (o && o.el) c = "pointer";
  if (c === "auto" || c === "default") c = "";
  stage().classList.toggle("survol-gl", Boolean(c));
  if (c) stage().style.setProperty("--curseur-gl", c);
}
function poseFocusWebgl(el){
  if (el === GL.focus) return;
  GL.focus = el;
  GL.deck.setProps({ layers: assembleWebgl() });
}

/** Les aplats d'un élément dans une couche pleine et cliquable du dessin. */
const aplatsDe = (couche, el) => el && couche.props.pickable && couche.id.includes("-pleins-")
  ? couche.props.data.filter(d => d.el === el) : [];

function coucheSurvol(couche){
  const aplats = aplatsDe(couche, GL.survol);
  if (!aplats.length) return [];
  const t = (GL.modeles.get("survol") || {}).couleur || [0, 0, 0, 0];
  return [new deck.SolidPolygonLayer({ id: "survol", data: aplats, getPolygon: d => d.polygon,
    // l'opacité propre de l'aplat — une zone translucide, un stand écarté — reste la sienne
    getFillColor: d => [t[0], t[1], t[2], Math.round(t[3] * d.couleur[3] / 255)], ...aPlat() })];
}

/* Le survol d'un volume, en vue immersive : il n'a pas d'aplat sur lequel se
   peindre, et le stand sous la souris ne s'allumait plus — choisir le départ
   ou l'arrivée d'un itinéraire se faisait à l'aveugle. Le volume visé est
   redessiné teinté de la couleur du survol, un rien plus haut que lui pour
   ne pas s'y confondre. */
function coucheSurvolVolume(c){
  const siens = Array.isArray(c.props.data) ? c.props.data.filter(d => d.el === GL.survol) : [];
  if (!siens.length) return [];
  const t = (GL.modeles.get("survol") || {}).couleur || [0, 0, 0, 0];
  const a = Math.max(.45, t[3] / 255);
  const teinte = (/** @type {number[]} */ k) => [0, 1, 2].map(i => Math.round(k[i] * (1 - a) + t[i] * a)).concat(255);
  const e = c.props.elevationScale || 1;
  const data = siens.map(d => ({ ...d, haut: d.haut * e + .03, couleur: teinte(d.couleur) }));
  return [new deck.SolidPolygonLayer({ id: "survol-volume", data, extruded: true, pickable: false,
    getPolygon: d => d.polygon, getFillColor: d => d.couleur, getElevation: d => d.haut, material: MATIERE }),
  coucheContours("survol-volume", data)];
}

function coucheFocus(couches){
  if (!GL.focus) return [];
  const aplats = couches.flatMap(c => aplatsDe(c, GL.focus));
  if (!aplats.length) return [];
  const t = (GL.modeles.get("survol") || {}).trait || [0, 0, 0, 255];
  return [new deck.PathLayer({ id: "focus", data: aplats, getPath: d => [...d.polygon[0], d.polygon[0][0]],
    getColor: t, getWidth: 3, widthUnits: "pixels", jointRounded: true, extensions: constTexte().traits, ...aPlat() })];
}

/* ------------------------------------------------------------
   La mise en avant et ce qui bouge.

   Le cartouche met une famille de repères en avant : le reste du plan
   s'estompe — la feuille de style le dit, le rendu le lit — et ce qui est
   retenu gagne un halo et bat. Le battement change l'opacité d'une zone, la
   taille d'un repère, l'encre du nom d'une zone ; les pointillés de
   l'itinéraire avancent. Rien de tout cela ne touche aux données : les
   couches concernées sont redonnées avec un réglage neuf, et seules elles
   changent d'une image à l'autre.

   Le halo est un flou gaussien — le « drop-shadow » de la feuille de style —
   et chaque imitation par des traits laissait voir ses bandes ou ses angles.
   Il se calcule donc une fois, en image, pour chaque élément mis en avant :
   la silhouette y projette ses deux ombres floues, puis s'efface pour ne
   laisser que la lueur autour. La carte graphique la pose sous l'élément
   comme une texture, et la fait battre avec lui.
   ------------------------------------------------------------ */
function couchesPhare(el, sous, cle){
  const couches = couchesDeBloc(sous, cle);
  const pts = sous.pleins.flatMap(d => d.polygon[0]).concat(...sous.traitsM.map(d => d.path), ...sous.traitsPx.map(d => d.path),
    ...sous.traitsZ.map(d => d.path));
  if (!pts.length) return couches;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const p of pts){ x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); }
  const repere = el.classList.contains("repere");
  const phare = { sorte: repere ? "repere" : "zone", centre: [(x0 + x1) / 2, (y0 + y1) / 2] };
  const lueur = sous.pleins.length ? lueurDe(sous.pleins.map(d => d.polygon), [x0, y0, x1, y1], repere) : null;
  const avant = lueur ? [new deck.BitmapLayer({ id: cle + "-lueur", image: lueur.image, bounds: lueur.bornes })] : [];
  return [...avant, ...couches].map(c => c.clone({ phare }));
}

/* Les images de lueur se gardent : redonner la même à la bibliothèque lui
   évite de la renvoyer à la carte graphique à chaque repeinte. */
const LUEURS = new Map();
function lueurDe(polygones, b, repere){
  const poi = (GL.modeles.get("poi") || {}).couleur || [0, 0, 0, 255];
  // les rayons des deux ombres de « #zones g.phare » et « .dcal .repere.phare », en mètres
  const [r1, r2] = repere ? [1.2, 3.5] : [2, 7];
  const marge = r2 * 2;
  const w = b[2] - b[0] + 2 * marge, h = b[3] - b[1] + 2 * marge;
  // assez de pixels pour un flou, jamais une image démesurée
  const k = Math.min(16, 1024 / Math.max(w, h));
  const cle = poi.join() + "|" + k.toFixed(3) + "|" + (repere ? 1 : 0) + "|" +
    polygones.map(p => p.map(a => a.map(q => q[0].toFixed(2) + "," + q[1].toFixed(2)).join(" ")).join("/")).join(";");
  if (LUEURS.has(cle)) return LUEURS.get(cle);
  const toile = document.createElement("canvas");
  toile.width = Math.max(1, Math.ceil(w * k)); toile.height = Math.max(1, Math.ceil(h * k));
  const ctx = toile.getContext("2d");
  const trace = () => {
    ctx.beginPath();
    for (const p of polygones) for (const a of p){
      a.forEach((q, i) => ctx[i ? "lineTo" : "moveTo"]((q[0] - b[0] + marge) * k, (q[1] - b[1] + marge) * k));
      ctx.closePath();
    }
  };
  /* L'ombre d'un canevas se floute comme celle d'une feuille de style : son
     rayon, en pixels, vaut deux écarts types. Les deux passes s'ajoutent. */
  ctx.fillStyle = "#000";
  ctx.shadowColor = "rgba(" + poi[0] + "," + poi[1] + "," + poi[2] + "," + (poi[3] / 255) + ")";
  for (const r of [r2, r1]){ ctx.shadowBlur = r * k; trace(); ctx.fill("evenodd"); }
  // la silhouette s'efface : il ne reste que la lueur autour
  ctx.shadowBlur = 0; ctx.globalCompositeOperation = "destination-out";
  trace(); ctx.fill("evenodd");
  if (LUEURS.size > 64) LUEURS.clear();
  const lueur = { image: toile,
    bornes: [b[0] - marge, b[1] - marge + toile.height / k, b[0] - marge + toile.width / k, b[1] - marge] };
  LUEURS.set(cle, lueur);
  return lueur;
}

/** Le battement d'une zone et d'un repère à l'instant « t », en secondes : les
 *  courbes de « pulseZone » et « pulsePoi » — 1 → 0,58 → 1, et 1 → 1,14 → 1. */
const opacitePhare = t => .79 + .21 * Math.cos(2 * Math.PI * t / 1.5);
const echellePhare = t => 1.07 - .07 * Math.cos(2 * Math.PI * t / 1.4);

/** Les noms des zones mises en avant : leur encre bat avec elles. */
function couchesPhareNoms(){
  if (!GL.libellesPhare.length) return [];
  const poi = (GL.modeles.get("poi") || {}).couleur || [0, 0, 0, 255];
  const p = GL.animePhare ? (1 - Math.cos(2 * Math.PI * GL.temps / 1.5)) / 2 : 0;
  const pas = Math.round(p * 60);
  let i = 0;
  return groupesNoms("phare", GL.libellesPhare).flatMap(g => couchesTexte("phare-noms-" + (i++), g.items,
    g.mo.famille, g.mo.graisse, { lineHeight: 1.18, ancre: "middle", halo: g.mo.halo, pickable: PLACE_LIBELLES,
      getColor: d => { const c = (GL.modeles.get(d.cls) || g.mo).couleur;
        return [0, 1, 2].map(k => Math.round(c[k] + (poi[k] - c[k]) * p)).concat(c[3]); },
      updateTriggers: { getColor: GL.versionModeles + ":" + pas } }));
}

/* La comète du sens, tenue d'accord avec « #itin .iSens » et ses
   « @keyframes comete » : la période qu'une tête parcourt, et le temps qu'elle
   y met. Deux nombres écrits deux fois, faute de pouvoir passer une valeur de
   la feuille de style au shader ; les changer d'un seul côté fait courir la
   tête à une autre allure sous la carte graphique.

   Elle avance par images de trentième de seconde. Chacune repeint le plan
   sous le trajet, qui traverse le salon entier — trente par seconde est ce
   qu'il faut pour qu'une tête qui file à cent trente pixels par seconde ne
   saute pas, là où les tirets qu'elle remplace se contentaient de quinze : on
   ne voyait pas sauter un tiret parmi douze. */
const COMETE_PERIODE = 200, COMETE_DUREE = 1.5, COMETE_HZ = 30;
const palierDefile = t => Math.floor(t * COMETE_HZ);
/* La période d'un trait qui défile, en pixels : son tiret et son vide, que la
   feuille de style donne en demi-épaisseurs. Deux cents pour la comète ;
   l'étincelle du fil lumineux en prend six cents, pour ne passer qu'une fois
   là où la comète passait trois. Sa durée suit, à la même allure. */
const periodeDe = c => (c.props.tirets[0] + c.props.tirets[1]) * c.props.demiEpaisseur || COMETE_PERIODE;
/* Où en est la tête de sa course, entre 0 et 1, au palier où l'on est. */
const phaseDe = (c, t) => {
  const duree = COMETE_DUREE * periodeDe(c) / COMETE_PERIODE;
  return (palierDefile(t) / COMETE_HZ) % duree / duree;
};

/** Une couche telle qu'elle doit paraître à cet instant. */
/* L'instant de l'image : l'heure qu'il est, toujours. Celle de la dernière
   image de la boucle datait dès que le plan travaillait entre deux images —
   une reconversion, une fiche qui s'ouvre — et le volume repeint à ce
   moment-là reculait à ce qu'il était alors. */
const instant = () => performance.now();
function animeCouche(c){
  if (c.props.jeton) return c.clone({ modelMatrix: matriceJeton(c.props.jeton, GL.temps) });
  if (c.props.hausse) return c.clone({ elevationScale: echelleHausse(c.props.hausse, instant()) });
  // le contour d'un volume en mouvement, posé à l'arrivée, s'écrase de même
  if (c.props.hausseContour){
    const e = echelleHausse(c.props.hausseContour, instant());
    return c.clone({ modelMatrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, e, 0, 0, 0, 0, 1] });
  }
  // le nom d'un volume en mouvement : posé à l'arrivée, il descend de ce qui reste à monter
  if (c.props.hausseTexte){
    const h = c.props.hausseTexte, dz = hauteurHausse(h, instant()) - h.vers;
    return c.clone({ modelMatrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, dz, 1] });
  }
  const ph = c.props.phare;
  if (ph && GL.animePhare){
    // les courbes de « pulseZone » et « pulsePoi » : 1 → 0,58 → 1, et 1 → 1,14 → 1
    if (ph.sorte === "zone") return c.clone({ opacity: opacitePhare(GL.temps) });
    const s = echellePhare(GL.temps), [x, y] = ph.centre;
    return c.clone({ modelMatrix: [s, 0, 0, 0, 0, s, 0, 0, 0, 0, 1, 0, x * (1 - s), y * (1 - s), 0, 1] });
  }
  /* La comète : le décalage part de la longueur du trait et descend d'une
     période, comme le « stroke-dashoffset » de ses images-clés. Partir de sa
     propre longueur est ce qui fait tomber les trois têtes au même endroit. */
  if (c.props.defile && GL.bouge) return c.clone({
    decalage: c.props.tirets[0] * c.props.demiEpaisseur - periodeDe(c) * phaseDe(c, GL.temps) });
  return c;
}

const MOUVEMENT_REDUIT = matchMedia("(prefers-reduced-motion: reduce)");
function majAnimationWebgl(){
  GL.bouge = !MOUVEMENT_REDUIT.matches;
  const couches = [...GL.blocs.values()].flat();
  GL.animePhare = GL.bouge && document.documentElement.classList.contains("poi-actif") &&
    (GL.libellesPhare.length > 0 || couches.some(c => c.props.phare));
  GL.anime = GL.animePhare || (GL.bouge && couches.some(c => c.props.defile)) || hausses.size > 0;
  if (GL.anime && !GL.imageAnim) GL.imageAnim = requestAnimationFrame(animeWebgl);
}
function animeWebgl(now){
  GL.imageAnim = 0;
  if (!GL.actif || !GL.anime) return;
  GL.temps = now / 1000;
  // un volume arrivé en haut, ou en bas, quitte la boucle ; elle s'arrête après le dernier
  for (const [g, h] of hausses) if (now - h.t0 >= DUREE_HAUSSE + 34){
    hausses.delete(g);
    // arrivé : son nom rejoint les autres, et les groupes du mouvement s'oublient
    GL.couchesLibelles = null;
    for (const k of [...GL.groupes.keys()]) if (/^labels-(sans|hausse)\|/.test(k)) GL.groupes.delete(k);
  }
  if (!GL.animePhare && !hausses.size && !(GL.bouge && [...GL.blocs.values()].flat().some(c => c.props.defile))){
    GL.anime = false; GL.deck.setProps({ layers: assembleWebgl() }); return;
  }
  /* Tout le plan se redessine quand une couche change : le battement se
     contente donc de trente images par seconde, et le défilement seul ne
     redessine qu'à chacun de ses paliers. */
  const cle = (GL.animePhare ? Math.floor(GL.temps * 30) : "") + "|" + palierDefile(GL.temps) +
    (hausses.size ? "|" + Math.round(now) : "");
  if (cle !== GL.cleAnim){ GL.cleAnim = cle; GL.deck.setProps({ layers: assembleWebgl() }); }
  GL.imageAnim = requestAnimationFrame(animeWebgl);
}

/* ------------------------------------------------------------
   Désigner et situer.

   Le SVG caché ne sait plus où ses formes tombent à l'écran : sa « viewBox »
   ne suit plus la vue. On demande donc à la carte graphique ce qui est sous le
   doigt — elle rend l'élément du SVG qu'elle a peint, et tout le reste du
   code le reçoit comme avant — et l'on situe une forme par sa boîte, projetée
   avec la même règle que la vue.
   ------------------------------------------------------------ */
/** Ce qui est sous un point de l'écran : l'élément qui ouvre une fiche, celui
 *  que l'éditeur saisit, le libellé qu'on place. */
function objetSous(x, y, rayon){
  const r = cadrePlan();
  const o = GL.deck.pickObject({ x: x - r.left, y: y - r.top, radius: rayon || 0 });
  if (!o) return null;
  const d = o.object || {}, p = (o.layer && o.layer.props) || {};
  return { el: d.el || p.el || null, prise: d.prise || p.prise || null, lbl: d.lbl || null };
}
export function cibleWebgl(x, y, rayon){
  const o = objetSous(x, y, rayon);
  return o ? o.el : null;
}
/** Pour l'éditeur : le plus proche ancêtre de ce qui est visé qui réponde au
 *  sélecteur — « .pgn », « .dcal .forme » —, là où il lisait la cible du
 *  navigateur. Trois pixels de tolérance : une poignée est petite. */
export function priseWebgl(x, y, selecteur){
  const o = objetSous(x, y, 3);
  const n = o && (o.prise || o.el);
  return n && n.closest ? n.closest(selecteur) : null;
}
export function libelleSousWebgl(x, y){
  const o = objetSous(x, y, 2);
  return o && o.lbl ? o.lbl : null;
}

export function rectEcranWebgl(n, v){
  let b;
  try { b = n.getBBox(); } catch (e) { return null; }
  const r = cadrePlan(), vue = v || vueDuPlan();
  const s = Math.min(r.width / vue.w, r.height / vue.h);
  const ox = (r.width - vue.w * s) / 2, oy = (r.height - vue.h * s) / 2;
  const left = r.left + (b.x - vue.x) * s + ox, top = r.top + (b.y - vue.y) * s + oy;
  const width = b.width * s, height = b.height * s;
  return { left, top, width, height, right: left + width, bottom: top + height, x: left, y: top };
}
