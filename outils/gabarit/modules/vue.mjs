/* ============================================================
   La vue du plan — cadrage, zoom, libellés à l'échelle, part du plan que
   couvre la barre

   Presque tout le plan lit la vue : la fiche pour cadrer sur un stand, les
   gestes pour la déplacer, le dessin pour passer de l'écran au plan, la carte
   graphique et le fond de carte pour la suivre. Ce module tient ce qui la
   calcule et ce qui l'applique, pour qu'un module puisse l'importer au lieu
   de se la faire confier.

   La vue elle-même (`view`) vit ici. Les gestes la remplacent sans cesse, le
   cadrage sur un trajet aussi : elle se remplace par sa porte, `changeVue(v)`,
   et le code soudé la lit par accesseur — une affectation directe y lève une
   erreur qui nomme la porte. Les modules l'importent, ou la lisent par
   `vue()`.

   Le SVG du plan (`svg`) aussi : il est dans la page avant que les modules ne
   s'exécutent, et ne se remplace jamais.

   L'emprise du pavillon (`emp`), elle, n'était remplacée que par le montage
   du plan : elle vit ici, se remplace par `poseEmprise`, et le code soudé la
   lit par accesseur.

   Ce que la vue appelle et qui reste soudé, ou n'existe pas partout — les
   noms, les poignées de l'éditeur, les pastilles de l'itinéraire, les
   pointes de flèche, le point de la borne, le calage d'un hall — lui est
   confié au même branchement, sous la garde qu'il avait.
   ============================================================ */
import { $ } from "./dom.mjs";
import { RENDU_WEBGL, GL, monteWebgl, vueWebgl, majEditionWebgl, rectEcranWebgl } from "./webgl.mjs";
import { recul, dessineFondCarte } from "./environs.mjs";

/* Ce que le code soudé confie, et rien avant qu'il l'ait fait. */
/** @type {Record<string, any>} */
let soude = {};

/** La vue du moment — `{ x, y, w, h }` en mètres, ou rien avant le premier plan. */
/** @type {any} */
export let view;
/** La vue du moment, lue à l'instant. */
export const vue = () => view;
/** Remplace la vue, sans l'appliquer : c'est `poseVue` ou `rafraichitVue` qui l'écrivent. */
export const changeVue = (/** @type {any} */ v) => { view = v; };
const enEdition = () => soude.enEdition();
const libelles = () => soude.libelles();
const ordonneDom = () => soude.ordonneDom();
const ETROIT = () => soude.etroit();

/** Le SVG du plan. */
/** @type {any} */
export const svg = $("plan");

/** L'emprise du pavillon, posée au montage du plan. */
/** @type {any} */
export let emp;
/** La porte de l'emprise : `_rendu.html` `montePlan` la remplace à chaque pavillon. */
export function poseEmprise(/** @type {any} */ e){ emp = e; }

/* ============================================================
   6. Vue
   ============================================================ */
/* Mesurer le cadre force le navigateur à remettre en page tout le SVG — sept
   mille éléments — et on le mesurait juste après avoir posé la « viewBox »,
   qui vient précisément de tout salir : quatre-vingt-cinq millisecondes, à
   chaque image, pour lire une largeur qui n'avait pas bougé. Car le cadre ne
   dépend pas de la « viewBox » : c'est le CSS qui le pose.

   On le mesure donc une fois, et on l'oublie quand la mise en page change.
   Un « ResizeObserver » couvre tout ce qui peut le changer, d'où qu'il vienne,
   sans rien mesurer lui-même ; le « resize » de la fenêtre s'y ajoute parce
   qu'il se déclenche avant lui, et que le recadrage qui l'écoute mesurerait
   sinon l'ancien cadre. */
/** @type {DOMRect | null} */
let _cadre = null;
/** @returns {DOMRect} */
export const cadrePlan = () => _cadre || (_cadre = svg.getBoundingClientRect());
const oublieCadre = () => { _cadre = null; };

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
 *  `_rendu.html` `libelles`, qui les retrie en plein geste. */
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

export const appliqueVue = () => {
  /* Le fond de carte, avant toute chose : il ne dépend que de la vue, et le
     chemin du rendu par la carte graphique sort plus bas sans passer par la
     « viewBox ». Posé là, il suit la vue quel que soit le rendu du plan. */
  dessineFondCarte();
  /* Le plan peint par la carte graphique ne lit pas la « viewBox » : la vue
     part vers elle, et le SVG caché garde sa géométrie figée. */
  if (RENDU_WEBGL && !GL.actif) monteWebgl();
  if (GL.actif){
    vueWebgl();
    majEditionWebgl();
    // les poignées d'une forme choisie gardent leur taille à l'écran pendant le zoom
    if (enEdition()) soude.dessinePoignees();
    if (enEdition()) soude.dessinePoigneesGeo();
    // tant que la première image n'est pas dessinée, le SVG montre le plan et suit la vue
    if (GL.pret) return;
  }
  const view = vue();
  svg.setAttribute("viewBox", view.x + " " + view.y + " " + view.w + " " + view.h);
  vueEcrite = { x: view.x, y: view.y, w: view.w, h: view.h };
  if (libPeints) etireLibelles();
  soude.dessinePoignees();
  soude.dessinePoigneesGeo();
  // le trait de l'itinéraire garde son épaisseur ; ses pastilles, non
  soude.rafraichitBouts();
  // et la pointe des lignes fléchées, pas davantage
  soude.rafraichitFleches();
  // le point de la borne, pas davantage non plus
  soude.rafraichitBorne();
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
  soude.rafraichitBouts();
  soude.rafraichitFleches();
  soude.rafraichitBorne();
}

/** Pendant un geste : le strict nécessaire, une fois par image. */
export function rafraichitVue(){
  if (!imageDemandee){
    imageDemandee = requestAnimationFrame(() => {
      imageDemandee = null;
      appliqueVue(); echelle();
      // la poignée du calage se mesure en pixels : elle suit la vue
      if (soude.calage) soude.calage();
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
  if (soude.calage) soude.calage();
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
  poseVue();
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
/* La vue visée, que le code soudé lit par accesseur (`_fiche.html`
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

function glisseVersVise(){
  if (imageZoom) return;
  let precedent = performance.now();
  const pas = (/** @type {number} */ maintenant) => {
    imageZoom = null;
    if (!vise) return;
    /* Le rapprochement se compte en millisecondes, non en images : sans quoi
       un écran à 120 Hz arriverait deux fois plus vite qu'un écran à 60. */
    const dt = Math.min(64, maintenant - precedent) || 16;
    precedent = maintenant;
    figeTextes();
    const k = 1 - Math.pow(.5, dt / 45);
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
    appliqueVue(); echelle();
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
export function glisseVers(/** @type {any} */ but){
  if (soude.reduit()){ changeVue(but); poseVue(); return; }
  vise = but;
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
               w: nw, h: base.h * k });
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
  const r = cadrePlan(), view = vue();
  return [ +(view.x + (clientX - r.left) / r.width * view.w).toFixed(2),
           +(view.y + (clientY - r.top) / r.height * view.h).toFixed(2) ];
}

/**
 * Le branchement, appelé par `_vue.html` à la place que ce code tenait : les
 * écoutes du cadre et de la barre s'y posent au même rang qu'avant parmi
 * celles du plan — avant le recadrage que `demarrage.mjs` pose sur « resize ».
 *
 * @param {Record<string, any>} b
 */
export function brancheVue(b){
  soude = b;
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
