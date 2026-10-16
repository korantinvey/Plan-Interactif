/* ============================================================
   Les gestes sur le plan — glisser, pincer, la molette, l'appui qui ouvre
   une fiche, le clavier ; et les commandes de la recherche et du zoom

   La chaîne des appuis est le cœur du plan : chaque doigt posé passe d'abord
   par le pincement, puis par les outils de l'exploitant, puis par le glisser
   et l'appui du visiteur. L'ordre de ces priorités est tout le comportement.

   Le visiteur reçoit ce module par `plan.mjs`. Les outils de l'exploitant — le
   calage de la carte, le placement d'un libellé, la reprise d'un emplacement,
   le calage d'un hall, le dessin — ne sont pas ici : `modules/gestes-admin.mjs`,
   que seul `plan-admin.mjs` embarque, les insère dans la chaîne par
   `poseGestesAdmin`, au rang qu'ils tenaient dans le script d'avant. Faute
   de quoi la chaîne les saute : c'est le cas de la page publique.

   Ses écoutes se posent par `brancheGestes`, que le lancement
   (`lancement.mjs`) appelle au rang que ce code tenait : elles gardent leur
   rang parmi celles du plan.
   Tout ce qu'il appelle s'importe ; la vue se lit par `view` et se remplace
   par `changeVue`, comme partout ailleurs.

   L'écoute de la langue y est aussi, parce qu'elle se posait au même endroit
   (`brancheLangue`) : elle refait ce que le plan a mesuré dans la langue
   d'avant.
   ============================================================ */
import { inscritGesteTenu } from "./geste-tenu.mjs";
import { $ } from "./dom.mjs";
import { DATA, parId, state } from "./donnees.mjs";
import { ETROIT, REDUIT } from "./ecran.mjs";
import { mesure } from "./mesure.mjs";
import { recul } from "./environs.mjs";
import { GL, cibleWebgl, confieAuWebgl, monteALAppui, rendLAppui, viseEnAvance } from "./webgl.mjs";
import { svg, view, changeVue, emp, cadrePlan, figeTextes, rafraichitVue, poseVue, stoppeZoom, zoom, fit,
  redresse, retiensVue } from "./vue.mjs";
import { filtre, retraitLeve, oublieRetrait, reposeRetrait, appliqueFiltre, basculeCriteres, videCriteres,
  fermeCriteres, majVideQ, videRecherche, reprendRecherche, liste } from "./recherche.mjs";
import { dernierAppuiTactile, poseAppuiTactile, select, canalPlan, rangSociete, ferme } from "./fiche.mjs";
import { oublieChoixPoi, ouvrePoi, oublieReperes } from "./points-interet.mjs";
import { poseBorneIci } from "./borne.mjs";
import { vibre, PRISE, BUTEE } from "./toucher.mjs";
import { visePoi, viseItineraire, finVisee } from "./tiroir-itineraire.mjs";
import { _lg } from "./texte-plan.mjs";
import { dessineDessins } from "./dessin.mjs";
import { libelles } from "./libelles.mjs";
import { nomDeLaZone } from "./noms-zones.mjs";

/* Ce que l'administration insère dans la chaîne, et rien sur la page
   publique : chaque maillon y répond « je n'ai rien pris », et la chaîne
   continue comme si l'outil n'existait pas. */
/**
 * @typedef {object} GestesAdmin
 * @property {(e: PointerEvent) => boolean} appui le doigt posé, pris par un outil de l'exploitant
 * @property {(e: PointerEvent) => boolean} suit le doigt qui bouge, pris par un outil
 * @property {(e: PointerEvent) => boolean} leve le doigt levé, pris par un outil
 * @property {() => void} annule le geste annulé : ce que les outils tenaient se lâche
 * @property {(x: number, y: number, cible: any) => boolean} codeIci l'appui qui désigne
 *   l'endroit d'un code « Vous êtes ici »
 * @property {(e: KeyboardEvent, saisie: boolean) => boolean} clavier les raccourcis et les
 *   flèches de l'éditeur, avant tout le reste
 * @property {() => boolean} echap Échap, qui referme d'abord les modes de l'éditeur
 * @property {() => void} apresEchap ce qu'Échap ferme encore après la fiche
 * @property {(e: KeyboardEvent, saisie: boolean) => void} entree Entrée, qui ferme un tracé
 */
/** @type {GestesAdmin} */
let admin = {
  appui: () => false, suit: () => false, leve: () => false, annule: () => {},
  codeIci: () => false, clavier: () => false, echap: () => false, apresEchap: () => {},
  entree: () => {},
};
/** La porte des gestes de l'exploitant (`modules/gestes-admin.mjs`). */
export function poseGestesAdmin(/** @type {GestesAdmin} */ g){ admin = g; }

/* ============================================================
   8. Interactions du plan
   ============================================================ */
/** Le glissé en cours, ou rien : la carte graphique le lit pour taire son survol. */
/** @type {any} */
export let drag = null;
/* Le temps qu'un doigt posé sans bouger met à dire qu'il choisit : le stand
   appuyé commence alors à monter. Plus bref, c'est un appui, que le relâché
   tranche ; un glissement part presque toujours avant. */
const APPUI_TENU = 90;

/* ------------------------------------------------------------------
   Pincement à deux doigts.

   Le plan interdit au navigateur de gérer le toucher — « touch-action: none »
   — parce qu'il déplace la vue lui-même. Il lui revient donc aussi de gérer le
   pincement, sinon il n'existe pas : c'est ce qui manquait sur téléphone.

   On garde le point du plan qui était sous le milieu des deux doigts, et on
   le maintient dessous. L'écartement donne l'échelle, le déplacement du milieu
   donne la translation : les deux gestes se font d'un seul mouvement, comme on
   s'y attend.
   ------------------------------------------------------------------ */
const doigts = new Map();
/** Le pincement en cours, ou rien : la carte graphique le lit comme le glissé. */
/** @type {any} */
export let pince = null;
// le plan tenu, glissé ou pincé : l'envoi au repos attend qu'on le lâche
inscritGesteTenu(() => drag || pince);

const milieu = () => {
  const l = [...doigts.values()];
  return { x: (l[0].x + l[1].x) / 2, y: (l[0].y + l[1].y) / 2,
           d: Math.hypot(l[0].x - l[1].x, l[0].y - l[1].y) };
};

function commencePince(){
  const m = milieu();
  const r = cadrePlan();
  pince = {
    d: Math.max(1, m.d),
    w: view.w, h: view.h,
    // le point du plan sous le milieu, celui qui ne doit pas bouger
    ancre: [view.x + (m.x - r.left) / r.width * view.w,
            view.y + (m.y - r.top) / r.height * view.h],
  };
  drag = null;
  saisitPlan(false);
}

function suitPince(){
  const m = milieu();
  const r = cadrePlan();
  // le pincement change l'échelle : mêmes économies que la molette
  figeTextes();
  plieLesBandes(true);
  const large = emp ? (emp.x1 - emp.x0) * recul() : pince.w * 8;
  const voulu = pince.w * pince.d / Math.max(1, m.d);
  const nw = Math.min(large, Math.max(6, voulu));
  /* La limite du zoom se sent au doigt, une fois à chaque fois qu'on la
     touche : sans quoi le pincement continuait sans que rien ne bouge, et
     l'on ne savait pas si le plan avait cessé de répondre. */
  const nh = pince.h * (nw / pince.w);
  const x = pince.ancre[0] - (m.x - r.left) / r.width * nw,
        y = pince.ancre[1] - (m.y - r.top) / r.height * nh;
  /* Le pincement déplace aussi : les deux doigts qui glissent ensemble
     butent sur le bord du hall comme un seul. */
  const v = retiensVue({ x: x, y: y, w: nw, h: nh });
  changeVue(v);
  const bute = nw !== voulu || v.x !== x || v.y !== y;
  if (bute && !pince.bute) vibre(BUTEE);
  pince.bute = bute;
  rafraichitVue();
}

/**
 * La main qui tient le plan, ou qui le lâche.
 *
 * Le curseur ne change que pour une souris, parce qu'il s'hérite : le poser
 * sur le plan remet en cause le style de ses sept mille nœuds — cent cinquante
 * millisecondes, au doigt posé, puis autant au doigt levé. Sur un écran
 * tactile, ces trois cents millisecondes étaient dépensées pour un curseur que
 * personne ne voit ; elles retardaient tout le reste, et la fiche du stand
 * suivant semblait attendre une animation qui n'a pas lieu.
 *
 * Lâcher écrit quand même, quelle que soit la main : une souris qui a saisi le
 * plan avant qu'un doigt s'y pose doit retrouver son curseur. Réécrire la
 * valeur qui est déjà là ne coûte rien — c'est la changer qui coûte.
 *
 * Il vit en style en ligne plutôt qu'en classe pour la même raison : une règle
 * qui parle de « cursor » ferait le même travail, sans qu'on puisse choisir
 * quand.
 */
/* Les deux bandes s'effacent le temps qu'on manipule le plan.

   Celle du haut porte le salon, celle du bas la recherche ; ensemble elles
   prennent près de deux cents points d'un écran de téléphone, et ce sont
   exactement ceux qu'on veut voir quand on fait glisser un hall ou qu'on
   l'agrandit. Elles se retirent donc le temps du geste et reviennent au doigt
   levé — la barre par-dessus la scène, le tiroir sous le bord de l'écran, l'un
   et l'autre sans que rien ne soit remis en page : le plan ne change pas de
   taille, il se découvre.

   Pas au doigt posé : un appui qui ouvre un stand les ferait clignoter pour
   rien. C'est le mouvement qui les plie — le glissement une fois passé le
   seuil des deux points, le pincement dès la première image.

   Un filet, comme pour les textes du plan : tous les chemins ne mènent pas à
   un doigt levé — un `pointercancel` du système, une main qui sort de l'écran
   — et elles resteraient pliées sur un plan qu'on ne manipule plus. */
let bandesPliees = false, filetBandes = null;

/* L'élan du glisser.

   Le plan s'arrêtait net sous le doigt levé, quand la main, elle,
   ralentissait encore : mesuré image par image, le glisser au doigt était
   aussi régulier que le banc d'essai (`?perf`, Mali-G720, 16 octobre 2026),
   et pourtant moins fluide à l'œil — le banc freine en douceur, le doigt
   cassait le mouvement. Lâché en mouvement, le plan garde donc la vitesse
   de la main et la perd peu à peu, comme sur toute carte au doigt.

   La vitesse se lit sur les dernières positions, à moins d'un dixième de
   seconde du lâcher : plus loin, elle dirait le geste d'avant. Un doigt
   resté immobile un instant avant de se lever ne lance rien. L'élan s'éteint
   en quelques dixièmes de seconde, bute sur le bord du hall comme le
   glisser, et cède à tout ce qui reprend la vue : un appui, la molette, un
   centrage sur un stand. Le mouvement réduit du système n'en a pas. */
const ELAN_FENETRE = 100, ELAN_DEMI_VIE = 110, ELAN_MIN = .25, ELAN_FIN = .02;
/** @type {{ t: number, x: number, y: number }[]} */
let traceGlisser = [];
let elan = 0;
/** @type {{ x: number, y: number } | null} */
let vueElan = null;

function noteGlisser(){
  const t = performance.now();
  traceGlisser.push({ t, x: view.x, y: view.y });
  while (traceGlisser.length > 2 && t - traceGlisser[0].t > ELAN_FENETRE) traceGlisser.shift();
}

function stoppeElan(){
  if (!elan) return;
  cancelAnimationFrame(elan); elan = 0; vueElan = null;
}

/** Lance l'élan d'un glisser qui vient de finir ; faux s'il n'y a pas lieu. */
function lanceElan(){
  const tr = traceGlisser;
  traceGlisser = [];
  if (REDUIT || tr.length < 2) return false;
  const a = tr[0], b = tr[tr.length - 1], maintenant = performance.now();
  if (maintenant - b.t > 50 || b.t - a.t < 8) return false;
  // la vitesse en unités du plan par milliseconde, et sa mesure en pixels d'écran
  let vx = (b.x - a.x) / (b.t - a.t), vy = (b.y - a.y) / (b.t - a.t);
  const parPixel = view.w / (cadrePlan().width || 1);
  if (Math.hypot(vx, vy) / parPixel < ELAN_MIN) return false;
  let avant = maintenant;
  const pas = (/** @type {number} */ ts) => {
    // la vue a été reprise ailleurs — centrage, molette, ajustement : l'élan lui cède
    if (vueElan && (view.x !== vueElan.x || view.y !== vueElan.y)){ elan = 0; vueElan = null; return; }
    const dt = Math.min(50, Math.max(0, ts - avant));
    avant = ts;
    const f = Math.pow(.5, dt / ELAN_DEMI_VIE);
    vx *= f; vy *= f;
    const x = view.x + vx * dt, y = view.y + vy * dt;
    view.x = x; view.y = y;
    retiensVue(view);
    // le bord du hall arrête l'élan dans ce sens
    if (view.x !== x) vx = 0;
    if (view.y !== y) vy = 0;
    vueElan = { x: view.x, y: view.y };
    if (Math.hypot(vx, vy) / parPixel < ELAN_FIN){ elan = 0; vueElan = null; poseVue(); return; }
    rafraichitVue();
    elan = requestAnimationFrame(pas);
  };
  elan = requestAnimationFrame(pas);
  return true;
}
function plieLesBandes(oui){
  const b = $("bandeau"), tiroir = $("side");
  if (!b || !ETROIT() || document.documentElement.classList.contains("mode-admin")) return;
  clearTimeout(filetBandes);
  filetBandes = oui ? setTimeout(() => plieLesBandes(false), 1200) : null;
  if (bandesPliees === oui) return;
  bandesPliees = oui;
  b.classList.toggle("pliee", oui);
  /* Le tiroir retrouve son cran en remontant : c'est une classe de plus sur
     lui, non un cran de moins — celui qu'il avait est écrit dans son attribut,
     et personne n'y touche ici. */
  if (tiroir) tiroir.classList.toggle("pliee", oui);
}

export const saisitPlan = (/** @type {boolean} */ tenu) => {
  // la main lâche : les bandes reviennent, quelle que soit la façon dont le geste finit
  if (!tenu) plieLesBandes(false);
  if (tenu && dernierAppuiTactile) return;
  svg.style.cursor = tenu ? "grabbing" : "";
};

/* ------------------------------------------------------------------
   Le doigt vise plus large que la souris.

   Un stand que la recherche éclaire est parfois un rectangle de quelques
   pixels dans un hall dézoomé : le doigt le couvre entier et tombe à côté une
   fois sur deux — sur le fond, ou sur le voisin éteint. Le résultat se voit,
   et ne s'ouvre pas : c'est le geste même auquel la recherche appelle qui
   échoue.

   Ce qu'elle a retenu déborde donc de sa forme, et lui seul, de juste ce qu'il
   faut pour atteindre la taille d'un doigt. La marge disparaît dès que la forme
   est assez grande, c'est-à-dire dès qu'on a zoomé : elle n'existe que là où
   la précision est impossible, et ne prend jamais la place d'une cible qu'on
   pouvait viser. Le voisin éteint reste ainsi ouvrable — et c'est lui qui lève
   le retrait.

   Les boîtes sont lues sur le rendu plutôt que calculées : stands du salon,
   zones et stands dessinés s'y présentent tous pareil, chacun à l'échelle où
   il est vu. Les repères n'y entrent pas : rien ne les met en retrait, et les
   élargir tous reviendrait à les préférer au reste pendant toute recherche.
   ------------------------------------------------------------------ */
/* La plus petite cible qu'un doigt atteint sans s'y reprendre. Bien en dessous
   des quarante-huit points que recommandent les systèmes : la marge est prise
   sur les stands voisins, qu'il faut pouvoir ouvrir aussi — c'est le rattrapage
   d'un geste imprécis, pas un bouton qu'on dessine. */
const DOIGT = 32;
/* Au-delà, la recherche n'a rien resserré — ses résultats couvrent le hall, et
   leurs marges se chevauchent plus qu'elles n'aident. */
const MAX_ELARGIS = 150;

function cibleElargie(x, y){
  if (!dernierAppuiTactile || !filtre() || retraitLeve) return null;
  if (GL.actif) return cibleWebgl(x, y, DOIGT / 2);
  const allumes = svg.querySelectorAll("#stands g:not(.dim), #zones g:not(.dim)," +
    " #couches .dcal .sdes[data-id]:not(.dim)");
  if (!allumes.length || allumes.length > MAX_ELARGIS) return null;
  let choix = null, mieux = Infinity;
  allumes.forEach(g => {
    const b = g.getBoundingClientRect();
    const mx = (DOIGT - b.width) / 2, my = (DOIGT - b.height) / 2;
    if (mx <= 0 && my <= 0) return;              // déjà à portée du doigt
    const dx = Math.max(b.left - Math.max(mx, 0) - x, x - b.right - Math.max(mx, 0));
    const dy = Math.max(b.top - Math.max(my, 0) - y, y - b.bottom - Math.max(my, 0));
    if (dx > 0 || dy > 0) return;                // hors de la boîte élargie
    // entre deux marges qui se recouvrent, la plus profonde : c'est celle dont
    // on est le plus près du centre
    const d = Math.max(dx, dy);
    if (d < mieux){ mieux = d; choix = g; }
  });
  return choix;
}

/* Une recherche n'est pas une frappe. On attend que la main s'arrête, et on
   ne compte pas deux fois le même mot-clé — retirer une lettre puis la
   remettre reste la même recherche. */
let _rechAttente = null, _rechDerniere = "";
/* La lettre d'abord, le filtrage ensuite.
 *
 * Filtrer réécrit les six cents lignes de la liste et repeint le plan — les
 * emplacements retenus s'y allument. Fait dans le gestionnaire de frappe, tout
 * cela passait avant que le navigateur ne peigne le caractère qu'on venait de
 * taper : trois cent trente millisecondes sur la première lettre, où la liste
 * est encore entière. On voyait la touche s'enfoncer, puis la lettre venir.
 *
 * Un « requestAnimationFrame » ne suffirait pas : il s'exécute dans la trame
 * qui précède l'affichage, donc encore avant la lettre. C'est le délai posé
 * depuis cette trame qui rend la main — le même geste que « planifieWebgl ».
 *
 * Rien n'est perdu à attendre : le filtrage coûte ce qu'il coûte, il ne le
 * fait plus payer à ce qu'on regarde. Et une frappe rapide n'en programme
 * qu'un : seul le dernier état du champ compte, et il est déjà écrit dans
 * « state » quand le report s'exécute. */
let _filtreAttendu = 0;
function planifieFiltre(){
  if (_filtreAttendu) return;
  _filtreAttendu = requestAnimationFrame(() => setTimeout(() => {
    _filtreAttendu = 0;
    reposeRetrait();
    appliqueFiltre();
  }, 0));
}

/**
 * Pose les écoutes du plan, au rang qu'elles tenaient parmi celles de la
 * page : les appuis, la molette et le clavier sur le plan, le clavier de la
 * page, puis les commandes de la recherche et du zoom.
 */
export function brancheGestes(){
  svg.addEventListener("pointerdown", e => {
    poseAppuiTactile(e.pointerType === "touch" || e.pointerType === "pen");
    // la main posée l'emporte sur la molette : un glissement qui finissait sa
    // course tirerait la vue sous le doigt qui vient de la saisir
    stoppeZoom();
    // et sur l'élan du glisser d'avant : le doigt rattrape le plan
    stoppeElan();
    traceGlisser = [];
    /* Un « pointerup » se perd parfois — la main sort de l'écran, le navigateur
       passe la main à un geste système. Le doigt restait alors inscrit, et
       l'appui suivant passait pour le second d'un pincement : plus rien ne
       répondait. Le premier doigt d'un geste ouvre donc une table vierge. */
    if (e.isPrimary) doigts.clear();
    /* Les doigts se comptent sur le plan à plat : en vue immersive, le point
       touché est d'abord redressé (`redresse`), et glisser comme pincer
       tiennent alors sous le doigt le point du sol qu'il a saisi. Seule la
       désignation garde le point de l'écran : la carte graphique vise dans
       ce qu'elle voit, volumes compris. */
    const [ex, ey] = redresse(e.clientX, e.clientY);
    doigts.set(e.pointerId, { x: ex, y: ey });
    if (doigts.size === 2){ commencePince(); return; }
    if (doigts.size > 2) return;
    /* Les outils de l'exploitant passent avant le glisser : le calage de la
       carte, le libellé, l'emplacement repris, le hall qu'on cale, le dessin —
       dans cet ordre (`modules/gestes-admin.mjs`). */
    if (admin.appui(e)) return;
    // le SVG caché ne sait plus où tombent ses formes : on demande au dessin
    const ecran = [e.clientX, e.clientY], touche = e.target;
    const tactile = e.pointerType === "touch" || e.pointerType === "pen";
    /* Au doigt, la carte graphique est interrogée dès l'appui, sans
       l'attendre : le relâché trouve la réponse prête (`viseEnAvance`). Un
       stand redessiné entre-temps hors de la page ne compte plus. */
    const avance = tactile ? viseEnAvance(ecran[0], ecran[1]) : null;
    const vise = () => avance && avance.fini && (!avance.el || avance.el.isConnected) ? avance.el
      : GL.actif ? cibleWebgl(ecran[0], ecran[1])
      : touche instanceof Element ? touche.closest("[data-id],[data-poi]") : null;
    /* Au doigt, ce qu'on touche ne se cherche que si l'on choisit. Le chercher
       demande une image à la carte graphique — vingt à cinquante
       millisecondes sur un téléphone, en vue immersive —, et le stand appuyé
       qui montait sortait de la couche des volumes, que la bibliothèque
       recomptait en entier, puis y rentrait au premier glissement : chaque
       geste commençait par là (`?perf`, le 13 octobre 2026). Le doigt qui
       glisse ne paie donc que la question posée sans l'attendre ; celui qui
       reste posé voit le stand monter un instant plus tard, et le relâché
       désigne comme avant. La souris garde
       sa montée immédiate : elle ne glisse que bouton tenu, et rarement. */
    const d = drag = { x: ex, y: ey, vx: view.x, vy: view.y, bouge: false, bute: false, glisse: false,
             /** @type {any} */ cible: tactile ? undefined : vise(), vise, montee: 0 };
    svg.setPointerCapture(e.pointerId); saisitPlan(true);
    // le stand appuyé commence à monter, sans attendre que le relâché le choisisse
    if (!tactile) monteALAppui(d.cible);
    else d.montee = setTimeout(() => {
      const monte = () => {
        if (drag !== d || d.glisse || d.bouge) return;
        d.cible = vise();
        monteALAppui(d.cible);
      };
      // la réponse en route : le stand monte à son retour plutôt que de la redemander
      if (avance && !avance.fini) avance.promesse.then(monte); else monte();
    }, APPUI_TENU);
  });
  svg.addEventListener("pointermove", e => {
    const [ex, ey] = redresse(e.clientX, e.clientY);
    if (doigts.has(e.pointerId)) doigts.set(e.pointerId, { x: ex, y: ey });
    if (pince && doigts.size >= 2){ e.preventDefault(); suitPince(); return; }
    if (admin.suit(e)) return;
    if (!drag) return;
      const r = cadrePlan(), k = view.w / r.width;
    const dx = (ex - drag.x) * k, dy = (ey - drag.y) * k;
    if (Math.abs(dx) + Math.abs(dy) > 2){ drag.bouge = true; plieLesBandes(true); }
    /* La main glisse : ce n'est pas un choix, le stand redescend. Compté en
       pixels, et non en mètres comme le glissement : de près, deux mètres font
       une main entière, et le stand serait monté tout du long. */
    if (Math.abs(ex - drag.x) + Math.abs(ey - drag.y) > 6){ drag.glisse = true; rendLAppui(); }
    view.x = drag.vx - dx; view.y = drag.vy - dy;
    /* Le bord du hall se sent au doigt, comme la limite du pincement : une
       fois à chaque fois qu'on le touche. Sans quoi le plan cessait de suivre
       la main sans rien dire, et l'on croyait le glissement en panne. */
    const x = view.x, y = view.y;
    retiensVue(view);
    const bute = view.x !== x || view.y !== y;
    if (bute && !drag.bute) vibre(BUTEE, e.pointerType);
    drag.bute = bute;
    // la vue montrée, bord compris : c'est elle que l'élan prolonge
    noteGlisser();
    rafraichitVue();
  });

  /* La capture de pointeur redirige le clic vers le <svg> : on retient la cible
     au pointerdown et on tranche au pointerup. */
  svg.addEventListener("pointerup", e => {
    doigts.delete(e.pointerId);
    /* Ce que le relâché n'a pas choisi — un glissement, une visée, une borne
       posée — redescend ; le choix, lui, est déjà fait quand ceci passe. */
    setTimeout(rendLAppui, 0);
    // un doigt levé met fin au pincement ; celui qui reste ne reprend pas la
    // main sur le déplacement, sans quoi la vue sauterait
    if (pince){ if (doigts.size < 2){ pince = null; drag = null; poseVue(); } return; }
    if (admin.leve(e)) return;
    const d = drag; drag = null; saisitPlan(false);
    try { if (svg.hasPointerCapture(e.pointerId)) svg.releasePointerCapture(e.pointerId); } catch (err) {}
    if (d) clearTimeout(d.montee);
    if (d && d.bouge){ if (!lanceElan()) poseVue(); return; }
    if (!d) return;
    // un appui bref au doigt : ce qu'il touche se cherche maintenant
    if (d.cible === undefined) d.cible = d.vise();
    /* Ce que l'appui désigne. Un appui qui porte sur un objet allumé garde le
       sien — il a touché ce qu'il visait ; les autres reviennent au résultat de
       recherche dont ils débordent la marge, s'il y en a un. */
    const cible = d.cible && !d.cible.classList.contains("dim")
      ? d.cible : (cibleElargie(d.x, d.y) || d.cible);
    /* Le clic dit ce qu'on regarde maintenant : il lève donc la mise en avant
       du cartouche, sauf s'il porte justement sur ce qu'elle éclaire. */
    oublieChoixPoi(cible);
    // et de même le retrait de la recherche, qu'un objet éteint fait tomber
    oublieRetrait(cible);
    /* Poser une borne prend le clic avant tout le reste : ce n'est ni une fiche
       qu'on ouvre ni un bout de trajet qu'on désigne, et l'endroit compte même
       là où il n'y a rien (voir « borne.mjs »). */
    if (poseBorneIci(d.x, d.y, cible)) return;
    /* Désigner l'endroit d'un code « Vous êtes ici » se tranche au même rang, et
       pour la même raison : l'endroit compte même là où il n'y a rien, et ce
       n'est pas une fiche qu'on ouvre (voir « affiche-ici.mjs »). Geste d'exploitant,
       que seule l'administration embarque : le plan public n'en a pas. */
    if (admin.codeIci(d.x, d.y, cible)) return;
    /* Une visée d'itinéraire en cours prend le clic avant la fiche : c'est un
       point qu'on désigne, pas un exposant qu'on veut lire. */
    if (cible){
      /* Un repère n'est pas un objet du plan : il n'a pas de fiche d'exposant,
         mais il a un nom, et c'est ce qu'on vient lui demander. */
      // le doigt a pris quelque chose : il le sent
      vibre(PRISE, e.pointerType);
      if (!cible.dataset.id){
        if (visePoi(cible.dataset.poi)) return;
        ouvrePoi(cible.dataset.poi, cible);
        return;
      }
      if (viseItineraire(cible.dataset.id)) return;
      /* Le plan ne bouge pas sous le doigt : on a choisi ce qu'on regarde, et
         le recentrer à chaque appui — essayé, en glissant puis en volant —
         donnait la nausée à l'usage. La liste et la recherche, elles, viennent
         de loin et amènent le plan sur le stand. */
      select(cible.dataset.id, false, canalPlan(cible), rangSociete(cible));
    } else { ferme(); finVisee(); }
  });
  svg.addEventListener("pointercancel", e => {
    doigts.delete(e.pointerId);
    rendLAppui();
    if (doigts.size < 2) pince = null;
    // ce que les outils de l'exploitant tenaient se lâche aussi
    admin.annule();
    drag = null;
    saisitPlan(false);
  });
  svg.addEventListener("wheel", e => {
    e.preventDefault();
    stoppeElan();
    const r = cadrePlan();
    /* Les navigateurs ne comptent pas dans la même unité — pixels, lignes ou
       pages — et un pavé tactile envoie des dixièmes de cran là où une molette
       en envoie un entier. On ramène tout en pixels, puis on en fait un facteur
       exponentiel : deux petits mouvements valent alors exactement un grand,
       et un tour de molette garde les dix-huit pour cent qu'il avait. */
    const px = e.deltaY * (e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? r.height : 1);
    const [ex, ey] = redresse(e.clientX, e.clientY);
    zoom(Math.exp(Math.max(-400, Math.min(400, px)) / 600),
         (ex - r.left) / r.width, (ey - r.top) / r.height);
  }, { passive: false });
  svg.addEventListener("keydown", e => {
    const g = e.target.closest("[data-id],[data-poi]");
    if (g && (e.key === "Enter" || e.key === " ")){
      e.preventDefault();
      // le plan se parcourt aussi au clavier : la visée, la mise en avant et le
      // retrait doivent y répondre pareil
      oublieChoixPoi(g);
      oublieRetrait(g);
      if (!g.dataset.id){
        if (!visePoi(g.dataset.poi)) ouvrePoi(g.dataset.poi, g);
        return;
      }
      if (!viseItineraire(g.dataset.id))
        select(g.dataset.id, false, canalPlan(g), rangSociete(g));
    }
  });
  document.addEventListener("keydown", e => {
    const saisie = /^(INPUT|TEXTAREA)$/.test(/** @type {HTMLElement} */ (e.target).tagName);
    /* Les raccourcis et les flèches de l'éditeur passent avant tout le reste
       (`modules/gestes-admin.mjs`). */
    if (admin.clavier(e, saisie)) return;
    if (e.key === "Escape"){
      // Échap referme d'abord les modes de l'éditeur
      if (admin.echap()) return;
      ferme();
      admin.apresEchap();
    }
    // Entrée ferme un tracé de l'éditeur
    admin.entree(e, saisie);
  });

  $("btnFiltres").onclick = basculeCriteres;
  /* « Tout effacer » ne referme pas : on efface pour recommencer, et le panneau
     resté ouvert montre justement les critères redevenus libres. « Voir les
     résultats » referme, lui — c'est la liste qu'on veut voir. */
  $("critVider").onclick = videCriteres;
  $("critVoir").onclick = fermeCriteres;
  $("zIn").onclick = () => zoom(.75, .5, .5);
  $("zOut").onclick = () => zoom(1.33, .5, .5);
  $("zFit").onclick = fit;
  $("q").addEventListener("input", e => {
    state.q = e.target.value;
    state.qn = state.q.trim().toLowerCase();
    majVideQ();
    planifieFiltre();
    clearTimeout(_rechAttente);
    _rechAttente = setTimeout(() => {
      const q = state.qn;
      if (q.length < 2 || q === _rechDerniere) return;
      _rechDerniere = q;
      mesure("recherche");
    }, 900);
  });

  $("videQ").onclick = videRecherche;
  /* Échap dans le champ défait la recherche, et rien d'autre : la même touche
     ferme la fiche et le tiroir plus loin, et les trois d'un coup emporteraient
     ce qu'on regardait. Le champ vide, elle repart vers eux. */
  $("q").addEventListener("keydown", e => {
    if (e.key !== "Escape" || !state.q) return;
    e.stopPropagation();
    videRecherche();
  });

  /* Revenir au menu de recherche repose le retrait du plan : le champ, le bouton
     des critères, les puces de ce qui est retenu, la liste, la poignée du tiroir.
     Le geste d'avant l'avait levé pour regarder le hall ; celui-ci rouvre la
     question, et le plan redit ce qu'elle retient.

     Un écouteur sur le panneau entier plutôt qu'un par commande : les puces et
     les lignes de la liste naissent et meurent à chaque frappe, et aucune n'aurait
     gardé le sien. Le clavier compte autant que le doigt — on revient au champ
     par tabulation. */
  ["pointerdown", "focusin"].forEach(t =>
    $("side").addEventListener(t, reprendRecherche));
}

/* langue — la bascule appartient à `_langue.js`, qui récrit ce qui est à
   l'écran sans recharger la page. Restent ce que le plan a mesuré ou relevé
   dans la langue d'avant : les libellés taillés à leur largeur, les repères
   dessinés autour de leur nom, ceux que la recherche balaie. */
export function brancheLangue(){
  addEventListener("langue", () => {
    if (!DATA || !view) return;
    oublieReperes();
    _lg.clear();
    dessineDessins();
    libelles();
    liste();
    // la fiche ouverte sur une zone porte son nom dans la langue d'avant
    const o = state.sel && parId.get(state.sel);
    if (o && o.kind === "zone" && $("dName")) $("dName").textContent = nomDeLaZone(o) || "Zone sans nom";
  });
}

/* Le rendu par la carte graphique tait son survol pendant un geste, et ne
   peut importer ce module : il lui confie en se chargeant le glissé et le
   pincement en cours, par des lecteurs — ils changent à chaque appui. */
confieAuWebgl({ drag: () => drag, pince: () => pince });
