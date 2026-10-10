/* ============================================================
   Itinéraire — le tiroir, la visée et le tracé

   Le calcul — grille de marche, recherche du chemin, faces, passages d'un
   plan à l'autre — vit dans `itineraire.mjs` ; ce module-ci tient ce que le
   visiteur en voit et en fait : le trajet demandé (`ITI`), le tiroir qui le
   dit, la visée qui le désigne sur le plan, et le trait qui s'y trace. La
   nappe de la grille, outil de l'exploitant, est à part (`nappe.mjs`).

   Il se branche dans `_itineraire.html`, à la place que son code tenait :
   ses écoutes s'y posent au même rang qu'avant parmi celles du plan, et ce
   que le code soudé tient encore lui est confié — la vue, qu'il lit et qu'il
   recadre, les volets qu'il mesure, la fiche et le parcours qu'il referme.

   Le trajet demandé ne se remplace jamais, il se modifie : `ITI` s'importe
   tel quel. Le tracé et la visée, eux, sont réaffectés par d'autres — la
   journée organisée prend le trait (`poseTrace`), la borne et l'affiche du
   code arment la visée (`poseVisee`) — et s'importent donc comme des états
   vivants.

   La borne et le code affiché dans le hall importent ce module, et lui ne les
   importe pas : ce qu'il leur doit — le départ qu'ils imposent — vit dans
   `vous-etes-ici.mjs`, et ce qu'ils font d'une visée qui les regarde, ou d'un
   bandeau qui doit céder la place, ils le lui confient en se chargeant
   (`confieVisee`, `suitLaVisee`).
   ============================================================ */
import { $ } from "./dom.mjs";
import { DATA, parId, state, P } from "./donnees.mjs";
import { mesure } from "./mesure.mjs";
import { pointObjet, pointRepere, candidats, pointSaisi, routeEntre, mesureMarches, coupeMarche,
  distancesDesArrets, ecritDistance, ecritDuree, phraseLiaison } from "./itineraire.mjs";
import { pointBorne, ecritDepartBorne } from "./vous-etes-ici.mjs";
import { vue, changeVue, poseVue, cadrePlan, masque, masqueDroite, masqueHaut, svg,
  confieALaVue } from "./vue.mjs";
import { REDUIT, ETROIT } from "./ecran.mjs";
import { formeParId } from "./forme-choisie.mjs";

/* Ce que le code soudé confie, et rien avant qu'il l'ait fait. La vue, elle,
   s'importe de `vue.mjs`, sa porte comprise : les gestes la remplacent sans
   cesse, et le trajet la recadre. */
/** @type {Record<string, any>} */
let soude = {};
const changePlan = (i) => soude.changePlan(i);
const ferme = () => soude.ferme();
const fermeParcours = () => soude.fermeParcours();
const racine = document.documentElement;

/* ------------------------------------------------------------
   Le trajet demandé
   ------------------------------------------------------------ */
export const ITI = { a: null, b: null, pmr: false };
export let ROUTE = null;

const CLE_PMR = "plan-itineraire-pmr";

/**
 * Le trajet demandé dans le tiroir.
 *
 * Dans un même pavillon il n'y a qu'un tronçon. D'un plan à l'autre, tout
 * dépend de ce que l'exploitant a relié : les passages déclarés enchaînent
 * les plans sans rupture, leur absence laisse le trajet coupé à la porte.
 */
function calculeRoute(){
  const a = ITI.a, b = ITI.b, pmr = ITI.pmr;
  if (!a || !b) return null;
  if (a.cle === b.cle) return { pmr: pmr, etapes: [], m: 0, memePoint: true };
  const r = routeEntre(a, b, pmr);
  r.pmr = pmr;
  return r;
}

/* ------------------------------------------------------------
   Le tracé sur le plan
   ------------------------------------------------------------ */
/**
 * Ce que le plan montre en ce moment.
 *
 * Deux calculs y prétendent — l'itinéraire d'un point à un autre, et la
 * journée organisée depuis le parcours — et ils empruntent le même trait :
 * deux tracés superposés ne se liraient plus. Le dernier calculé prend donc
 * la place, et l'autre disparaît du plan sans être oublié pour autant.
 */
export let TRACE = null;

/** La porte du tracé : la journée organisée le prend pour elle, ou le rend. */
export function poseTrace(t){ TRACE = t; }

const marchesIci = () => (TRACE ? TRACE.etapes : [])
  .filter(e => e.genre === "marche" && e.p === state.plan);

/** Rayon des pastilles de départ et d'arrivée : constant à l'écran, donc
 *  exprimé en mètres d'après le zoom du moment. */
function rayonBout(){
  const r = cadrePlan();
  return Math.max(.4, vue().w / (r.width || 1) * 6);
}

/* ------------------------------------------------------------
   Le trait qui se trace

   Paru d'un coup, un trajet ne dit pas par où il commence : le regard le
   prend au milieu, puis cherche lequel de ses deux bouts est le départ. Il
   s'écrit donc du départ vers l'arrivée — assez vite pour qu'on n'attende
   rien, assez lentement pour qu'on voie le sens —, et les pointillés qui
   défilent le redisent ensuite tant qu'il reste à l'écran.

   Le trait se raccourcit par ses points, et non par un « stroke-dashoffset »
   animé en feuille de style : le plan est peint par la carte graphique, qui
   relit le SVG et ne verrait pas une animation qu'elle n'a pas lue. Ce sont
   les mêmes formes, écrites plus courtes à chaque image.
   ------------------------------------------------------------ */
/* Six cents millisecondes suffisaient à écrire le trait, pas à le regarder
   s'écrire : le geste était fini avant qu'on ait trouvé le départ des yeux.
   Une seconde et demie se suit du regard d'un bout à l'autre, et le trajet
   n'est de toute façon demandé qu'une fois. */
const TRACAGE_MS = 1500;
/* Réécrire le trait salit son bloc, et la carte graphique repeint alors le
   plan entier — le défilement des pointillés n'avance déjà que par paliers,
   pour cette raison même. Trente images par seconde suffisent à un trait qui
   s'allonge ; soixante doublaient la dépense sans que cela se voie. */
const TRACAGE_HZ = 30;

let tracage = null;                 // l'image demandée tant que le trait s'allonge
let vuTrace = null, vuPlan = null;  // ce que le trait montre déjà

function arreteTracage(){
  if (tracage) cancelAnimationFrame(tracage);
  tracage = null;
}

/** Le trait tel qu'il est à « p » de sa course — 1 : entier. */
function peintItineraire(p){
  const g = $("itin");
  if (!g) return;
  const marches = marchesIci();
  if (!marches.length){ g.innerHTML = ""; return; }

  const mes = mesureMarches(marches);
  const fini = p >= 1;
  const d = fini ? Infinity : p * mes.total;
  const r = rayonBout();
  let out = "";
  marches.forEach((e, j) => {
    const pts = fini ? e.pts : coupeMarche(e.pts, mes.cumuls[j], d);
    if (!pts) return;
    const chemin = "M" + pts.map(q => q[0].toFixed(2) + " " + q[1].toFixed(2)).join("L");
    out += '<path class="iHalo" d="' + chemin + '"/><path class="iTrait" d="' + chemin + '"/>';
    /* La comète attend que le trait soit arrivé. Chaque image du tracé
       réécrit le groupe, ce qui relance son animation : elle resterait figée
       au départ, une pastille de plus sur le point de départ. */
    if (fini) for (let n = 1; n <= 5; n++) out += '<path class="iSens iC' + n + '" d="' + chemin + '"/>';
  });
  /* Une journée repasse par les mêmes allées et se recoupe : sans le rang de
     chaque arrêt, le trait ne dit plus dans quel sens on le suit. Un trajet
     d'un point à un autre n'a que deux bouts, et un chiffre y serait du
     bruit — il garde ses deux pastilles nues. */
  const arrets = (TRACE.arrets || []).filter(a => a.p === state.plan);
  /* Les pastilles à venir sont écrites, mais transparentes : « rafraichitBouts »
     les retrouve par leur rang, et un zoom pendant que le trait s'allonge les
     décalerait toutes si elles manquaient. */
  if (arrets.length){
    const rr = (r * 1.5).toFixed(2);
    const ou = fini ? null : distancesDesArrets(marches, mes, arrets);
    arrets.forEach((a, i) => {
      const attend = ou && ou[i] > d ? " aVenir" : "";
      /* Le point de départ n'est pas un arrêt : on n'y visite rien, et lui
         donner un rang décalerait tous les autres d'une unité. */
      out += '<circle class="iBout' + (a.conf ? " conf" : "") + attend + '" cx="' + a.xy[0] +
             '" cy="' + a.xy[1] + '" r="' + (a.n ? rr : r.toFixed(2)) + '"/>';
      if (a.n) out += '<text class="iNum' + (a.conf ? " conf" : "") + attend + '" x="' + a.xy[0] +
             '" y="' + a.xy[1] + '" font-size="' + (r * 1.6).toFixed(2) + '">' + a.n + '</text>';
    });
  } else {
    const pd = marches[0].pts[0];
    const pa = marches[marches.length - 1].pts[marches[marches.length - 1].pts.length - 1];
    out += '<circle class="iBout" cx="' + pd[0] + '" cy="' + pd[1] + '" r="' + r.toFixed(2) + '"/>' +
           '<circle class="iBout fin' + (fini ? "" : " aVenir") + '" cx="' + pa[0] + '" cy="' + pa[1] +
           '" r="' + r.toFixed(2) + '"/>';
  }
  g.innerHTML = out;
}

function lanceTracage(){
  const t0 = performance.now();
  let palier = -1;
  const image = (t) => {
    const p = Math.min(1, (t - t0) / TRACAGE_MS);
    /* Une course qui part vif et se pose à l'arrivée : le départ se voit
       d'emblée, et le dernier mètre ne file pas sous l'œil. */
    const q = 1 - (1 - p) * (1 - p);
    const n = Math.floor((t - t0) / (1000 / TRACAGE_HZ));
    if (n !== palier || p >= 1){ palier = n; peintItineraire(q); }
    tracage = p < 1 ? requestAnimationFrame(image) : null;
  };
  // le départ paraît le premier : sa pastille, et rien du trait
  peintItineraire(0);
  tracage = requestAnimationFrame(image);
}

/**
 * Pose le trajet sur le plan.
 *
 * « anime » ne se dit pas d'ordinaire : le trait se retrace quand ce qu'il
 * montre change — un autre calcul, un autre pavillon —, et se repose tel
 * quel autrement, sans quoi rouvrir le tiroir ou remonter le pavillon le
 * rejouerait sans raison.
 */
export function dessineItineraire(anime){
  let g = $("itin");
  if (!g){
    g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.id = "itin";
    // au-dessus des calques, sous les poignées d'édition et l'aperçu de tracé
    svg.insertBefore(g, svg.querySelector("#apercu, #poignees"));
  }
  const neuf = TRACE !== vuTrace || state.plan !== vuPlan;
  vuTrace = TRACE; vuPlan = state.plan;
  /* Le calcul remonte le pavillon du départ avant de redemander le trait :
     l'animation lancée là ne doit pas mourir de l'appel qui la suit. */
  if (tracage && !neuf && anime !== true) return;
  arreteTracage();
  const marches = marchesIci();
  if (!marches.length){ g.innerHTML = ""; return; }
  if ((anime === undefined ? neuf : anime) && !REDUIT) lanceTracage();
  else peintItineraire(1);
}

/** Le zoom change : seules les pastilles ont besoin d'être reprises, le trait
 *  garde son épaisseur à l'écran par la feuille de style. */
export function rafraichitBouts(){
  const g = $("itin");
  if (!g || !g.firstChild || !vue()) return;
  const r = rayonBout();
  /* Les pastilles d'une journée portent un chiffre et sont donc plus larges ;
     celle du départ, qui n'en porte pas, garde la taille ordinaire. */
  const numerotees = !!g.querySelector(".iNum");
  const rr = (numerotees ? r * 1.5 : r).toFixed(2);
  const arrets = (TRACE && TRACE.arrets || []).filter(a => a.p === state.plan);
  g.querySelectorAll(".iBout").forEach((c, i) =>
    c.setAttribute("r", numerotees && arrets[i] && !arrets[i].n ? r.toFixed(2) : rr));
  g.querySelectorAll(".iNum").forEach(t => t.setAttribute("font-size", (r * 1.6).toFixed(2)));
}

/**
 * Cadre la vue sur le tracé du pavillon affiché.
 *
 * Le trajet se lit à côté de son bilan, jamais dessous : le volet du bas sur un
 * téléphone, celui de droite sur un écran large, sont retirés du cadre avant de
 * calculer l'échelle, puis le tracé se centre dans la bande qui reste. Sans
 * cela, l'arrivée — le point qu'on est venu chercher — se range derrière le
 * volet qui l'annonce.
 */
export function cadreItineraire(){
  const marches = marchesIci();
  if (!marches.length || !vue()) return;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  marches.forEach(e => e.pts.forEach(q => {
    x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]);
    y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]);
  }));
  const r = cadrePlan();
  const cache = masque(), cacheD = masqueDroite(), haut = masqueHaut();
  const hUtile = Math.max(60, r.height - cache - haut);
  const lUtile = Math.max(60, (r.width || 1) - cacheD);
  const marge = 8;
  const w = Math.max(12, x1 - x0 + 2 * marge), h = Math.max(12, y1 - y0 + 2 * marge);
  const k = Math.max(w / lUtile, h / hUtile);
  changeVue({ x: (x0 + x1) / 2 - (k * r.width) / 2 + (k * cacheD) / 2,
              y: (y0 + y1) / 2 - (k * r.height) / 2 + (k * (cache - haut)) / 2,
              w: k * r.width, h: k * r.height });
  poseVue();
}

/* ------------------------------------------------------------
   Le tiroir
   ------------------------------------------------------------ */
const champIti = (r) => r === "a" ? $("iDepart") : $("iArrivee");
let champSugg = null;   // le champ auquel appartiennent les suggestions
let survolSugg = -1;    // la suggestion mise en avant au clavier

function fermeSugg(){
  champSugg = null; survolSugg = -1;
  const z = $("iSugg");
  z.hidden = true; z.innerHTML = "";
  [$("iDepart"), $("iArrivee")].forEach(c => c.setAttribute("aria-expanded", "false"));
}

function montreSugg(r){
  // le départ d'une borne ne se saisit pas : il n'y a rien à proposer
  if (r === "a" && pointBorne()) return;
  champSugg = r;
  survolSugg = -1;
  const z = $("iSugg");
  // une seule liste, déplacée dans le champ qu'on remplit
  const hote = champIti(r).parentNode;
  if (z.parentNode !== hote) hote.appendChild(z);
  const l = candidats(champIti(r).value);
  if (!l.length){
    z.innerHTML = '<p class="iRien"></p>';
    z.querySelector(".iRien").textContent = champIti(r).value.trim()
      ? "Aucun stand, zone ni repère ne porte ce nom."
      : "Tapez le nom ou le numéro d'un stand.";
  } else {
    z.innerHTML = "";
    l.forEach((pt, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "iSug" + (pt.genre === "repere" ? " rep" : "");
      b.setAttribute("role", "option");
      b.dataset.i = String(i);
      b.innerHTML = '<span class="n"></span><span class="s"></span>';
      b.querySelector(".n").textContent = pt.nom;
      b.querySelector(".s").textContent = pt.detail;
      b.onclick = () => choisitPoint(r, pt);
      z.appendChild(b);
    });
  }
  z.hidden = false;
  champIti(r).setAttribute("aria-expanded", "true");
}

function choisitPoint(r, pt){
  ITI[r] = pt;
  champIti(r).value = pt.nom;
  fermeSugg();
  relance();
}

/** Une saisie abandonnée sans choix : on tranche pour elle si c'est possible,
 *  on oublie le point sinon — mieux vaut un champ vide qu'un trajet faux. */
function valideSaisie(r){
  // une borne ne se ravise pas : le champ reprend ce qu'il disait
  if (r === "a" && pointBorne()){ ecritDepartBorne(); return; }
  const v = champIti(r).value.trim();
  if (!v){ if (ITI[r]){ ITI[r] = null; relance(); } return; }
  if (ITI[r] && ITI[r].nom === v) return;
  const pt = pointSaisi(v);
  ITI[r] = pt;
  if (pt) champIti(r).value = pt.nom;
  relance();
}

export function effaceItineraire(){
  /* Effacer, sur une borne, c'est revenir à elle : son départ n'a jamais été
     saisi, et le vider laisserait l'écran incapable de dire d'où l'on part. */
  const borne = pointBorne();
  ITI.a = borne; ITI.b = null;
  ROUTE = TRACE = null;
  /* Deux champs vides dans un tiroir ouvert : c'est l'état d'une ouverture, et
     il appelle la même visée — celle du seul champ qui reste à remplir. */
  visee = borne ? "b" : "a";
  bandeauVisee();
  $("iDepart").value = "";
  $("iArrivee").value = "";
  ecritDepartBorne();
  fermeSugg();
  dessineItineraire();
  montreResultat();
}

/**
 * Le calcul passe par un temps mort volontaire.
 *
 * Pavage du hall, A* et lissage tiennent en quelques dizaines de
 * millisecondes sur un poste, davantage sur un téléphone de salon. Les
 * enchaîner dans la foulée du clic figerait le bouton sans rien dire ; on
 * affiche d'abord, on calcule ensuite.
 */
export let attente = null;
let _dernierTrajet = "";
export function relance(){
  clearTimeout(attente);
  if (!ITI.a || !ITI.b){
    ROUTE = TRACE = null;
    dessineItineraire();
    montreResultat();
    return;
  }
  montreResultat("calcul");
  /* Un calcul, ce sont deux points et une option d'accessibilité. Corriger une
     lettre du champ d'arrivée relance le même trajet : il ne compte qu'une
     fois. */
  const empreinte = ITI.a.cle + ">" + ITI.b.cle + (ITI.pmr ? " pmr" : "");
  if (empreinte !== _dernierTrajet){
    _dernierTrajet = empreinte;
    /* Ce que l'exposant veut savoir, c'est combien de visiteurs ont demandé la
       route jusqu'à lui : le trajet se rattache donc à son arrivée, jamais à
       son départ. Une zone organisateur n'est pas un exposant, un repère non
       plus — dans les deux cas le geste se compte, sans cible. */
    const but = ITI.b.obj;
    mesure("itineraire", "", but && but.kind === "stand" ? but.id : "", "fiche_stand");
  }
  attente = setTimeout(() => {
    attente = null;
    try {
      ROUTE = calculeRoute();
    } catch (e){
      console.warn("Itinéraire :", e);
      ROUTE = { pmr: ITI.pmr, etapes: [], m: 0, panne: true };
    }
    // demander un itinéraire, c'est renoncer à voir la journée sur le plan
    TRACE = ROUTE;
    /* Le trajet commence dans le pavillon du départ : c'est celui qu'il faut
       montrer, même si l'on regardait ailleurs en le demandant. */
    const premier = ROUTE.etapes.find(e => e.genre === "marche");
    if (premier && premier.p !== state.plan) changePlan(premier.p);
    dessineItineraire();
    montreResultat();
    if (premier) cadreItineraire();
  }, 30);
}

function montreResultat(etat){
  const z = $("iResultat"), badge = $("iResume");
  z.innerHTML = "";
  const dit = (cls, txt) => {
    const p = document.createElement("p");
    p.className = cls;
    p.textContent = txt;
    z.appendChild(p);
    return p;
  };

  if (etat === "calcul"){ badge.textContent = "calcul…"; dit("iNote", "Recherche du chemin…"); return; }
  if (!ITI.a || !ITI.b){
    badge.textContent = "à définir";
    /* « iIntro » : la seule note que l'écran étroit peut taire — les invites
       des deux champs disent la même chose (voir « _head.html »). */
    dit("iNote iIntro", pointBorne()
      ? "Choisissez votre destination : le trajet part de cette borne."
      : "Choisissez un départ et une arrivée. Sans localisation, c'est " +
        "vous qui dites d'où vous partez — l'entrée du hall, ou le stand " +
        "devant lequel vous êtes.");
    return;
  }
  if (!ROUTE) return;

  if (ROUTE.memePoint){ badge.textContent = "—"; dit("iNote", "Vous y êtes déjà."); return; }
  if (ROUTE.panne){ badge.textContent = "—"; dit("iAlerte", "Le calcul n'a pas abouti sur cet appareil."); return; }
  if (ROUTE.sansChemin){
    badge.textContent = "—";
    dit("iAlerte", ROUTE.pmr
      ? "Aucun chemin accessible ne relie ces deux points : les passages disponibles " +
        "sont trop étroits, ou coupés par un escalier. Décochez l'option pour voir le " +
        "trajet ordinaire."
      : "Aucun chemin ne relie ces deux points sur ce plan.");
    return;
  }

  if (ROUTE.aucunTrace){
    badge.textContent = "non tracé";
  } else {
    /* Ce qui sépare deux pavillons que rien ne relie ne figure sur aucun plan
       — ni passerelle, ni allée extérieure : la distance annoncée est alors
       celle des seuls tronçons tracés, et elle le dit. Un trajet qui emprunte
       des passages déclarés, lui, est complet d'un bout à l'autre ; il ne lui
       manque que les mètres de l'escalier, comptés en minutes. */
    badge.textContent = (ROUTE.coupe ? "≥ " : "") + ecritDistance(ROUTE.m) +
      " · " + ecritDuree(ROUTE.m, ROUTE.pmr, ROUTE.minutes);
    const bilan = document.createElement("div");
    bilan.className = "iBilan";
    bilan.innerHTML = '<b></b><span></span>';
    bilan.querySelector("b").textContent = (ROUTE.coupe ? "au moins " : "") + ecritDistance(ROUTE.m);
    bilan.querySelector("span").textContent =
      ecritDuree(ROUTE.m, ROUTE.pmr, ROUTE.minutes) +
      (ROUTE.pmr ? " · itinéraire accessible" : " de marche") +
      (ROUTE.coupe ? " · hors trajet entre pavillons"
                   : ROUTE.liaisons ? " · " + ROUTE.liaisons + " passage" +
                                      (ROUTE.liaisons > 1 ? "s" : "")
                   : "");
    z.appendChild(bilan);
  }

  /* Ce que le calcul a fait des sorties de conférence. Sans un mot, un détour
     de trente mètres passe pour une erreur, et une allée pleine pour une
     mauvaise surprise. */
  (ROUTE.etapes || []).forEach(e => {
    if (!e.foule) return;
    const quand = (s, sujet) => sujet + " conférence " +
      (s.quoi === "sort" ? "se termine à " : "commence à ") + s.h;
    e.foule.contournees.forEach(s => dit("iNote",
      "Le trajet contourne « " + s.nom + " » : " + quand(s, "sa") + ", et l'allée qui la " +
      "borde va se remplir. Environ " + ecritDistance(s.sup) + " de plus."));
    e.foule.longees.forEach(s => dit("iNote",
      "Le trajet longe « " + s.nom + " », où " + quand(s, "une") + " — attendez-vous " +
      "à du monde dans l'allée."));
  });

  /* Un trajet en plusieurs morceaux se lit comme une suite : où l'on marche,
     par où l'on passe. Un tronçon unique n'a rien à énumérer — le trait sur le
     plan le dit mieux qu'une ligne de texte. */
  if (ROUTE.etapes.length > 1){
    const l = document.createElement("div");
    l.className = "iEtapes";
    ROUTE.etapes.forEach(e => {
      const passage = e.genre === "transfert" || e.genre === "liaison";
      /* Le trajet traverse des plans qu'on ne regarde pas : chaque étape de
         marche ouvre le sien. Sans cela, le visiteur lit « 80 m dans le
         pavillon 7.2 » et n'a aucun moyen de voir lesquels. */
      const ailleurs = e.genre === "marche" && e.p !== state.plan;
      const d = document.createElement(ailleurs ? "button" : "div");
      if (ailleurs){
        /** @type {HTMLButtonElement} */ (d).type = "button";
        d.onclick = () => {
          changePlan(e.p);
          dessineItineraire();
          cadreItineraire();
          montreResultat();
        };
      }
      d.className = "iEtape" + (passage ? " transfert" : "") + (ailleurs ? " ailleurs" : "");
      d.innerHTML = '<span class="t"></span><span class="s"></span>';
      const dit2 = (t, s) => {
        d.querySelector(".t").textContent = t;
        d.querySelector(".s").textContent = s;
      };
      if (e.genre === "transfert"){
        dit2("Changement de pavillon",
             "Sortez du " + e.de + ", rejoignez le " + e.vers + ".");
      } else if (e.genre === "liaison"){
        const p = phraseLiaison(e);
        dit2(p.t, p.s);
      } else {
        dit2(DATA.plans[e.p].libelle,
             ecritDistance(e.m) + " dans le pavillon" +
             (e.p === state.plan ? " · tracé à l'écran" : " · voir"));
      }
      l.appendChild(d);
    });
    z.appendChild(l);
    (ROUTE.avertis || []).forEach(t => dit("iAlerte", t));
  }
}

/* ------------------------------------------------------------
   Désigner un point sur le plan
   ------------------------------------------------------------ */
/**
 * Taper un nom suppose qu'on le connaisse. Or on voit souvent sa destination
 * avant de savoir comment elle s'appelle — « le grand stand à l'angle, là ».
 * Le viseur laisse la désigner du doigt : le clic suivant sur le plan remplit
 * le champ au lieu d'ouvrir une fiche. C'est le geste ordinaire, et non le
 * détour : l'ouverture du tiroir l'arme sur le premier champ vide (voir
 * « ouvreItineraire »), la cible de chaque champ ne servant plus qu'à y
 * revenir après coup.
 *
 * Sur un téléphone le tiroir tient la moitié basse de l'écran : l'autre
 * moitié se touche, et la visée armée à l'ouverture y suffit le plus souvent.
 * Reste ce qu'il cache : la cible, elle, efface le tiroir le temps du geste et
 * le ramène dès qu'il aboutit — le bandeau, lui, demeure, sans quoi on ne
 * saurait plus ce qu'on est en train de choisir.
 */
export let visee = null;

/** La porte de la visée : la borne et l'affiche du code l'arment pour elles,
 *  la visite guidée l'éteint. */
export function poseVisee(v){ visee = v; }

/* Une visée qui n'est pas un bout de trajet — poser la borne, désigner
   l'endroit d'un code — appartient au module qui l'arme : il dit ici ce que
   devient le point désigné. Et les bandeaux qui occupent la même place que
   celui de la visée lui sont confiés de même, pour céder le passage. Les deux
   s'inscrivent au chargement de leur module. */
/** @type {Record<string, (pt: any) => any>} */
const VISEES = {};
/** @type {Array<() => void>} */
const SUIVENT_LA_VISEE = [];

/** @param {string} genre @param {(pt: any) => any} f */
export function confieVisee(genre, f){ VISEES[genre] = f; }
/** @param {() => void} f */
export function suitLaVisee(f){ SUIVENT_LA_VISEE.push(f); }

export function bandeauVisee(){
  const b = $("viseur");
  if (b){
    b.hidden = !visee;
    /* La visée n'est plus le geste du seul téléphone : le bandeau s'adresse
       aussi bien au doigt qu'au curseur. */
    if (visee) $("viseurTxt").textContent = visee === "borne"
      ? "Touchez le plan à l'endroit où cette borne est posée."
      : visee === "ici"
      ? "Touchez le plan à l'endroit où ce code sera affiché."
      : "Indiquez " + (visee === "a" ? "votre point de départ" : "votre arrivée") + " sur le plan.";
  }
  racine.classList.toggle("vise-plan", !!visee);
  $("iViseA").setAttribute("aria-pressed", String(visee === "a"));
  $("iViseB").setAttribute("aria-pressed", String(visee === "b"));
  /* Le bandeau d'une borne à poser s'efface le temps du geste : c'est le même
     état, dit deux fois, et deux bandeaux ne se lisent plus. Le rappel du code
     affiché, lui, occupe la même place au bas de l'écran : il cède le passage
     plutôt que de se superposer (`borne.mjs`, `ici.mjs`). */
  SUIVENT_LA_VISEE.forEach(f => f());
}

function armeVisee(r){
  /* Une borne sait d'où elle part : sa cible de départ est retirée du tiroir
     (voir « _borne.html »), et ce garde-fou vaut pour le clavier. */
  if (r === "a" && pointBorne()) return;
  /* La cible d'un champ déjà armé ne désarme pas sur un téléphone : la visée y
     est armée d'office, et ce bouton n'y a plus qu'un sens — « montre-moi tout
     le plan », car il est le seul geste qui retire le tiroir : la prise le
     baisse sans l'emporter, et son en-tête tient toujours le bas. Abandonner
     se dit dans le bandeau, qui porte « Annuler ». Au large, la cible reste
     l'interrupteur qu'elle était. */
  const efface = ETROIT() && $("itineraire").classList.contains("open");
  visee = (visee === r && !efface) ? null : r;
  fermeSugg();
  if (visee && ETROIT()) fermeItineraire();
  bandeauVisee();
}

/** Fin de la visée, quelle qu'en soit la raison. */
export function finVisee(){
  if (!visee) return;
  /* La cible referme le tiroir sur un téléphone : on ne le rouvre que si c'est
     bien lui qui l'a fermé. Ouvert, le rouvrir réarmait la visée que ces deux
     lignes viennent d'éteindre — et l'abandon n'aboutissait jamais. */
  const rouvre = (visee === "a" || visee === "b") && ETROIT() &&
                 !$("itineraire").classList.contains("open");
  visee = null;
  bandeauVisee();
  if (rouvre) ouvreItineraire(false);
}

/**
 * Un clic sur le plan pendant une visée. Rend « vrai » s'il a servi à choisir,
 * auquel cas la fiche ne doit pas s'ouvrir par-dessus.
 */
export function viseItineraire(id){
  const o = parId.get(id);
  return o ? visePoint(pointObjet(o)) : false;
}

/** Viser un repère : le geste est le même, le point vient d'ailleurs. */
export function visePoi(id){
  if (!visee) return false;
  const cible = formeParId(id);
  return cible && cible.f.t === "repere" ? visePoint(pointRepere(cible.f, P())) : false;
}

function visePoint(pt){
  if (!visee) return false;
  /* Poser une borne n'est pas désigner un bout de trajet : le point part
     ailleurs (voir « _borne.html »). Désigner l'endroit d'un code non plus
     (voir « _ici.html ») — et c'est par ici que passe le clavier, là où le
     doigt est tranché plus tôt, dans la chaîne des appuis sur le plan. */
  if (VISEES[visee]) return VISEES[visee](pt);
  const r = visee;
  ITI[r] = pt;
  champIti(r).value = ITI[r].nom;
  /* Deux points à désigner, deux gestes : tant que l'autre champ est vide, on
     enchaîne plutôt que de faire rouvrir le tiroir pour le refermer aussitôt. */
  const autre = r === "a" ? "b" : "a";
  if (!ITI[autre]){ visee = autre; bandeauVisee(); relance(); return true; }
  finVisee();
  relance();
  return true;
}


/* ------------------------------------------------------------
   Ouverture, fermeture, branchements
   ------------------------------------------------------------ */
/**
 * @param arme  Faux pour rouvrir le tiroir sans rien réarmer — c'est le cas
 *   d'une visée abandonnée : la rouvrir doit rendre la main, non relancer le
 *   geste qu'on vient d'annuler.
 */
function ouvreItineraire(arme = true){
  // fiche, parcours et itinéraire se partagent la même bande
  if ($("detail").classList.contains("open")) ferme();
  fermeParcours();
  /* Une ouverture repart de zéro : la visée en cours s'éteint ici, et les
     lignes du bas la réarment sur le premier champ vide. On ne passe pas par
     finVisee(), qui rouvrirait ce tiroir déjà en train de s'ouvrir. */
  visee = null;
  bandeauVisee();
  /* La journée organisée a pu prendre le trait entre-temps : le tiroir le
     reprend en s'ouvrant, sinon son bilan parlerait d'un trajet et le plan en
     montrerait un autre. */
  if (ROUTE && TRACE !== ROUTE){ TRACE = ROUTE; dessineItineraire(); }
  $("itineraire").classList.add("open");
  $("btnItineraire").setAttribute("aria-pressed", "true");
  montreResultat();
  /* Un itinéraire se désigne plus vite qu'il ne se tape : la visée est donc
     armée sur le premier champ vide dès l'ouverture, départ puis arrivée, sans
     passer par la cible. Le clavier reste à portée — cliquer dans un champ y
     renonce. Le téléphone n'en est plus excepté : le tiroir ne prend que la
     moitié basse de l'écran, et ce qui reste du plan se touche. Un stand qu'il
     cache se désigne comme avant, par la cible, qui l'efface le temps du
     geste. */
  if (arme){
    visee = !ITI.a ? "a" : !ITI.b ? "b" : null;
    bandeauVisee();
  }
}
export function fermeItineraire(){
  const t = $("itineraire");
  if (!t || !t.classList.contains("open")) return;
  t.classList.remove("open");
  $("btnItineraire").setAttribute("aria-pressed", "false");
  fermeSugg();
}

/** Depuis une fiche : « j'y vais ». L'arrivée est connue, le départ reste à
 *  dire — c'est lui qu'on met sous le curseur. */
export const versItineraire = (o) => versItineraireDe(pointObjet(o));

/** Le même geste depuis un repère, qui n'est pas un objet du plan. */
export function versItineraireDe(pt){
  ITI.b = pt;
  $("iArrivee").value = ITI.b.nom;
  /* Le départ d'une borne reste le sien même si l'on demande la route
     jusqu'à elle : « vous y êtes déjà » se dit mieux qu'un champ vidé. */
  if (ITI.a && ITI.a.cle === ITI.b.cle && !pointBorne()){
    ITI.a = null; $("iDepart").value = "";
  }
  ouvreItineraire();
  if (ITI.a) relance();
  /* Le tiroir s'ouvre à peine : le champ est encore hors du cadre le temps de
     la transition, et un focus ordinaire ferait défiler la scène pour l'y
     amener. On demande le curseur, pas le déplacement — et seulement là où
     l'ouverture n'a pas armé la visée, que le curseur annulerait aussitôt. */
  else { montreResultat(); if (!visee) $("iDepart").focus({ preventScroll: true }); }
}

/* ------------------------------------------------------------
   Le branchement
   ------------------------------------------------------------ */
/**
 * Appelé par `_itineraire.html` à la place que ce code tenait : le choix
 * d'accessibilité retenu se relit, puis les écoutes du tiroir et de la visée
 * se posent au même rang qu'avant parmi celles du plan — celle de la touche
 * « Échap » comprise, dont l'ordre parmi les autres décide qui la reçoit.
 *
 * @param {{ changePlan: Function, ferme: Function, fermeParcours: Function }} b
 */
export function brancheTiroirItineraire(b){
  soude = b;

  try { ITI.pmr = localStorage.getItem(CLE_PMR) === "1"; } catch (e) {}

  $("iViseA").onclick = () => armeVisee("a");
  $("iViseB").onclick = () => armeVisee("b");
  $("viseurStop").onclick = finVisee;

  ["a", "b"].forEach(r => {
    const c = champIti(r);
    c.addEventListener("input", () => montreSugg(r));
    // revenir au clavier, c'est renoncer au doigt
    c.addEventListener("focus", () => { visee = null; bandeauVisee(); montreSugg(r); });
    c.addEventListener("blur", () => { if (champSugg === r) fermeSugg(); valideSaisie(r); });
    c.addEventListener("keydown", e => {
      const z = $("iSugg");
      const opts = z.hidden ? [] : [...z.querySelectorAll(".iSug")];
      if (e.key === "ArrowDown" || e.key === "ArrowUp"){
        if (!opts.length) return;
        e.preventDefault();
        survolSugg = (survolSugg + (e.key === "ArrowDown" ? 1 : opts.length - 1) + opts.length) % opts.length;
        opts.forEach((o, i) => o.classList.toggle("vis", i === survolSugg));
        opts[survolSugg].scrollIntoView({ block: "nearest" });
      } else if (e.key === "Enter"){
        e.preventDefault();
        if (opts[survolSugg]) opts[survolSugg].click();
        else { fermeSugg(); valideSaisie(r); }
      } else if (e.key === "Escape" && !z.hidden){
        e.stopPropagation();
        fermeSugg();
      }
    });
  });
  /* Le clic sur une suggestion arrive après le « blur » du champ : sans cela, la
     liste se referme sous le doigt et le clic tombe dans le vide. */
  $("iSugg").addEventListener("pointerdown", e => e.preventDefault());

  $("iEchange").onclick = () => {
    // une borne ne se déplace pas à l'arrivée d'un trajet
    if (pointBorne()) return;
    const a = ITI.a;
    ITI.a = ITI.b; ITI.b = a;
    $("iDepart").value = ITI.a ? ITI.a.nom : "";
    $("iArrivee").value = ITI.b ? ITI.b.nom : "";
    relance();
  };

  $("iPmr").checked = ITI.pmr;
  $("iPmr").onchange = e => {
    ITI.pmr = e.target.checked;
    // celui qui en a besoin en a besoin à chaque visite
    try { localStorage.setItem(CLE_PMR, ITI.pmr ? "1" : "0"); } catch (err) {}
    relance();
  };

  /* Tout le calcul repose sur le canevas : c'est lui qui remplit les contours et
     les épaissit. Sur un navigateur qui ignore Path2D, mieux vaut retirer la
     fonction que d'ouvrir un tiroir qui ne répondrait jamais. */
  if (typeof Path2D === "undefined"){
    $("btnItineraire").hidden = true;
    racine.classList.add("sans-itineraire");
  }

  $("btnItineraire").onclick = () =>
    $("itineraire").classList.contains("open") ? fermeItineraire() : ouvreItineraire();
  $("closeItineraire").onclick = fermeItineraire;
  $("videItineraire").onclick = effaceItineraire;

  addEventListener("keydown", e => {
    if (e.key !== "Escape" || $("modale").classList.contains("open")) return;
    if (visee){ e.stopPropagation(); finVisee(); return; }
    if ($("iSugg").hidden) fermeItineraire();
  });
}

/* Les pastilles du trajet gardent leur taille à l'écran : la vue, que ce
   module importe, les refait à chaque changement de vue — il les lui confie
   en se chargeant. */
confieALaVue({ rafraichitBouts });
