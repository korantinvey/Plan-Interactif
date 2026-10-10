/* ============================================================
   Le tracé d'un itinéraire sur le plan

   Ce que le plan montre d'un trajet : l'état du trait (`TRACE`), que la
   journée organisée prend pour elle ou rend (`poseTrace`), son dessin qui
   s'écrit du départ vers l'arrivée, les pastilles des deux bouts, gardées à
   leur taille à l'écran, et le cadrage sur ce qui se voit du trajet.

   Du rendu, sans tiroir : le montage d'un pavillon le redessine
   (`rendu.mjs`), et le tiroir de l'itinéraire (`tiroir-itineraire.mjs`) le
   mène. Il vivait dans ce tiroir, et le rendu l'atteignait donc — le tiroir
   ne pouvait plus importer le rendu pour passer d'un pavillon à l'autre. Il
   ne dépend que de la vue, des données, de l'écran et du calcul.
   ============================================================ */
import { $ } from "./dom.mjs";
import { state } from "./donnees.mjs";
import { svg, vue, cadrePlan, masque, masqueDroite, masqueHaut, changeVue, poseVue, confieALaVue }
  from "./vue.mjs";
import { REDUIT } from "./ecran.mjs";
import { mesureMarches, coupeMarche, distancesDesArrets } from "./itineraire.mjs";

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

export function lanceTracage(){
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


/* Les pastilles du trajet gardent leur taille à l'écran : la vue, que ce
   module importe, les refait à chaque changement de vue — il les lui confie
   en se chargeant. */
confieALaVue({ rafraichitBouts });
