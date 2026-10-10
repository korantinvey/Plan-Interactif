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
import { $ } from "./dom.mjs";
import { M_ID, mulM, appM, echelleM, lisTransform, lisTrace, lisPoints, num, anneau, rectArrondi,
  avecTrous, couleurGl } from "./trace.mjs";
import { PLACE_LIBELLES } from "./libelle-place.mjs";
import { svg, vue as vueDuPlan, cadrePlan } from "./vue-etat.mjs";

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
  src: "bibliotheques/deck.gl-9.3.11-plan.min.js",
  integrite: "sha384-2vx9QLYRDQOSjHJYMBs+6exoK/4mzV4tcLtK+O+UMgXzpj+prg4XRsogBgU0Rben",
};
export const GL = {
  charge: false, actif: false, deck: null,
  blocs: new Map(), sales: new Set(), tout: true, image: 0,
  libelles: [], cleLibelles: "", couchesLibelles: null, pastilles: [], dessines: new Map(),
  groupes: new Map(), survol: null, focus: null, libellesPhare: [], temps: 0, imageAnim: 0, cleAnim: "",
  modeles: new Map(), tailles: new Map(), duree: 0,
  hote: null, toile: null, branche: false, veille: false, aRemonter: false, attente: 0, remontes: 0, abandon: false,
  // la clé d'un bloc vit hors du DOM : l'écrire dans le SVG réveillerait le guet
  cles: new WeakMap(), compteur: 0, versionModeles: 0, signatureModeles: "",
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
  GL.deck = new deck.Deck({
    parent: hote, controller: false,
    views: new deck.OrthographicView({ id: "plan", flipY: true }),
    viewState: vueDeck(), layers: [],
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
      }
      // ouvrir un calque se lit ici : c'est lui qui prend la classe « editable »
      majEditionWebgl();
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
      majEditionWebgl(); toutRepeindreWebgl();
    }).observe(document.documentElement, { attributes: true, attributeOldValue: true,
      attributeFilter: ["class", "style"] });
    if (document.fonts) document.fonts.addEventListener("loadingdone", toutRepeindreWebgl);

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
  document.documentElement.classList.remove("rendu-webgl", "gl-pret", "gl-attente", "en-edition");
  stage().classList.remove("survol-gl");
  GL.survol = null; GL.focus = null;
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
  return { target: [view.x + view.w / 2, view.y + view.h / 2, 0], zoom: Math.log2(s) };
}

/** Appelée à chaque image d'un geste : la matrice, et rien d'autre. Les noms
 *  qui passent un seuil de lisibilité se montrent ou se taisent dans le
 *  shader, qui connaît le zoom — voir « FiltreZoom ». */
export function vueWebgl(){
  GL.deck.setProps({ viewState: vueDeck() });
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
  toutRepeindreWebgl();
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
  GL.sales.clear(); GL.tout = false; GL.ordre = false;
  GL.deck.setProps({ layers: assembleWebgl() });
  majAnimationWebgl();
  GL.duree = performance.now() - t0;
  GL.reconstruits = n;
}

function assembleWebgl(){
  const out = [];
  for (const b of blocsDansLOrdre()){
    if (b.id === "labels"){ out.push(...couchesLibellesWebgl(), ...couchesPhareNoms()); continue; }
    const couches = GL.blocs.get(b) || [];
    for (const c of couches){
      out.push(animeCouche(c));
      // la teinte du survol juste sur l'aplat : cloisons et noms restent devant
      if (GL.survol) out.push(...coucheSurvol(c));
    }
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
    draw(){ this.setShaderModuleProps({ filtreZoom: { mode: this.props.modeFiltre || 0, muet: this.props.muetALEcran ? 1 : 0 } }); }
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
  FiltreZoom.defaultProps = { getZoomFiltre: { type: "accessor", value: [-100, 100, -100] }, modeFiltre: 0, muetALEcran: false };
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
function couchesPetites(id, commun, K, sousPixel){
  const base = { ...commun, fontSettings: K.petit.atlas, extensions: K.petit.ext, modeFiltre: K.petit.mode };
  if (!sousPixel || !sousPixelOffert()) return [new deck.TextLayer({ ...base, id: id + "-petit" })];
  return [
    ...(commun.pickable ? [new deck.TextLayer({ ...base, id: id + "-petit", muetALEcran: true })] : []),
    ...PASSES_SOUS_PIXEL.map(p => new deck.TextLayer({ ...base, id: id + "-petit" + p.canal,
      pickable: false, sousPixel: [p.decalage, .6], parameters: { colorMask: p.masque } })),
  ];
}

function couchesTexte(id, items, famille, graisse, extra){
  const K = constTexte();
  const halo = extra.halo;
  const commun = {
    data: items, pickable: Boolean(extra.pickable), fontFamily: famille, fontWeight: graisse, characterSet: jeuDeCaracteres(items),
    getText: d => d.text, getPosition: d => d.position, getSize: d => d.taille, sizeUnits: "common",
    getAngle: d => d.angle || 0, getColor: extra.getColor || (d => d.couleur),
    getTextAnchor: extra.ancre || (d => d.ancre), getAlignmentBaseline: "center",
    lineHeight: extra.lineHeight || 1, updateTriggers: extra.updateTriggers || K.sansDeclencheur,
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
const accVide = prises => ({ pleins: [], traitsPx: [], traitsM: [], textes: new Map(), images: [], phares: new Map(), prises });
function convertitBloc(racine, cle){
  // ce que l'éditeur attrape : le calque ouvert, et les poignées posées à la
  // racine — celles d'une forme dessinée comme celles d'un emplacement repris
  // le cadrage d'un bâtiment de la bibliothèque s'attrape aussi, calque ouvert ou non
  const acc = accVide((_page.enEdition() && (racine.classList.contains("editable") ||
      racine.id === "poignees" || racine.id === "poigneesGeo")) ||
    racine.id === "calageApercu");
  parcoursGl(racine, M_ID, 1, acc);
  const out = couchesDeBloc(acc, cle);
  let i = 0;
  for (const [el, sous] of acc.phares) out.push(...couchesPhare(el, sous, cle + "-phare-" + (i++)));
  return out;
}

/* Ce que le cartouche met en avant se range à part : il bat, et seules ses
   couches changent d'une image à l'autre. */
function accDe(el, acc){
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

function formeGl(el, cs, m, op, traces, acc){
  const cible = el.closest("[data-id],[data-poi]");
  acc = accDe(el, acc);
  const plein = couleurGl(cs.fill, parseFloat(cs.fillOpacity) * op);
  if (plein){
    const anneaux = traces.filter(t => t.pts.length >= 3).map(t => t.pts.map(p => appM(m, p)));
    const prise = el.closest(PRISES);
    for (const polygon of avecTrous(anneaux)) acc.pleins.push({ polygon, couleur: plein, el: cible, prise });
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
    const largeur = fixe ? sw : sw * echelleM(m);
    const tirets = cs.strokeDasharray && cs.strokeDasharray !== "none"
      ? cs.strokeDasharray.split(/[\s,]+/).map(parseFloat).filter(Number.isFinite) : null;
    // la bibliothèque mesure les tirets en demi-épaisseurs de trait
    const dash = tirets && tirets.length >= 2 ? [2 * tirets[0] / sw, 2 * tirets[1] / sw] : [0, 0];
    const defile = el.classList.contains("iSens");
    for (const t of traces){
      if (t.pts.length < 2) continue;
      const path = t.pts.map(p => appM(m, p));
      if (t.ferme) path.push(path[0]);
      (fixe ? acc.traitsPx : acc.traitsM).push({ path, couleur: trait, largeur, dash, defile, el: cible,
        prise: el.closest(PRISES) });
    }
  }
}

function texteGl(el, cs, m, op, acc){
  acc = accDe(el, acc);
  const texte = el.textContent;
  if (!texte || !texte.trim()) return;
  const coul = couleurGl(cs.fill, parseFloat(cs.fillOpacity) * op);
  if (!coul) return;
  const taille = parseFloat(cs.fontSize);
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
    text: texte, position: pos, taille: taille * echelleM(m), angle: -angle,
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
  acc.images.push({ href, bornes: [Math.min(a[0], b[0]), Math.max(a[1], b[1]), Math.max(a[0], b[0]), Math.min(a[1], b[1])],
    op, el: el.closest("[data-id],[data-poi]"), prise: el.closest("[data-f]") });
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

function couchesDeBloc(acc, cle){
  const L = deck, out = [];
  const pleins = partage(acc.pleins, acc.prises);
  pleins.forEach((liste, k) => {
    if (!liste.length) return;
    out.push(new L.SolidPolygonLayer({ id: cle + "-pleins-" + k, data: liste, pickable: k === 0,
      getPolygon: d => d.polygon, getFillColor: d => d.couleur }));
  });
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
        getPath: d => d.path, getColor: d => d.couleur, getWidth: d => d.largeur, widthUnits: unites,
        jointRounded: true, capRounded: false, widthMinPixels: unites === "common" ? .6 : 0, defile: bouge,
        extensions: K.traits, getDashArray: bouge ? [0, 0] : d => d.dash, dashJustified: false,
        tirets: bouge ? l[0].dash : [0, 0], demiEpaisseur: l[0].largeur / 2 }));
    }
  });
  let i = 0;
  for (const g of acc.textes.values()) out.push(...couchesTexte(cle + "-textes-" + (i++), g.items, g.famille, g.graisse,
    { pickable: g.items.some(d => d.el || (acc.prises && d.prise)) }));
  acc.images.forEach((d, k) => out.push(new L.BitmapLayer({ id: cle + "-image-" + k, image: d.href,
    bounds: d.bornes, opacity: d.op, pickable: Boolean(d.el || (acc.prises && d.prise)), el: d.el, prise: d.prise })));
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
  if (!GL.couchesLibelles)
    GL.couchesLibelles = [...couchesPastilles(), ...couchesNoms("libelles-", groupesNoms("labels", GL.libelles))];
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
  GL.survol = el;
  GL.deck.setProps({ layers: assembleWebgl() });
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
    getFillColor: d => [t[0], t[1], t[2], Math.round(t[3] * d.couleur[3] / 255)] })];
}

function coucheFocus(couches){
  if (!GL.focus) return [];
  const aplats = couches.flatMap(c => aplatsDe(c, GL.focus));
  if (!aplats.length) return [];
  const t = (GL.modeles.get("survol") || {}).trait || [0, 0, 0, 255];
  return [new deck.PathLayer({ id: "focus", data: aplats, getPath: d => [...d.polygon[0], d.polygon[0][0]],
    getColor: t, getWidth: 3, widthUnits: "pixels", jointRounded: true, extensions: constTexte().traits })];
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
  const pts = sous.pleins.flatMap(d => d.polygon[0]).concat(...sous.traitsM.map(d => d.path), ...sous.traitsPx.map(d => d.path));
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
/* Où en est la tête de sa course, entre 0 et 1, au palier où l'on est. */
const phaseComete = t => (palierDefile(t) / COMETE_HZ) % COMETE_DUREE / COMETE_DUREE;

/** Une couche telle qu'elle doit paraître à cet instant. */
function animeCouche(c){
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
    decalage: c.props.tirets[0] * c.props.demiEpaisseur - COMETE_PERIODE * phaseComete(GL.temps) });
  return c;
}

const MOUVEMENT_REDUIT = matchMedia("(prefers-reduced-motion: reduce)");
function majAnimationWebgl(){
  GL.bouge = !MOUVEMENT_REDUIT.matches;
  const couches = [...GL.blocs.values()].flat();
  GL.animePhare = GL.bouge && document.documentElement.classList.contains("poi-actif") &&
    (GL.libellesPhare.length > 0 || couches.some(c => c.props.phare));
  GL.anime = GL.animePhare || (GL.bouge && couches.some(c => c.props.defile));
  if (GL.anime && !GL.imageAnim) GL.imageAnim = requestAnimationFrame(animeWebgl);
}
function animeWebgl(now){
  GL.imageAnim = 0;
  if (!GL.actif || !GL.anime) return;
  GL.temps = now / 1000;
  /* Tout le plan se redessine quand une couche change : le battement se
     contente donc de trente images par seconde, et le défilement seul ne
     redessine qu'à chacun de ses paliers. */
  const cle = (GL.animePhare ? Math.floor(GL.temps * 30) : "") + "|" + palierDefile(GL.temps);
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
