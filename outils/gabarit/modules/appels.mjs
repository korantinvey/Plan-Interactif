/* ============================================================
   Les noms en appel — ce qui ne tient pas dans son stand sort dans la marge

   Un petit stand n'a pas la place d'écrire son nom à une taille qu'on lit :
   le plan le tait, ou l'écrit en pattes de mouche. Pour la plupart des
   stands, c'est la bonne règle — on zoome si l'on veut lire. Pas pour ceux
   qu'on vient justement de chercher, ou de choisir : on les regarde, et leur
   nom manque précisément là.

   Ceux-là sortent leur nom du stand, dans une étiquette posée à côté et
   reliée par un filet, comme les légendes d'une carte de géographie. Les
   autres ne bougent pas : une marge pleine d'étiquettes ne dirait plus rien.
   Sont appelés le stand choisi, et les résultats d'une recherche quand ils
   sont assez peu nombreux dans le pavillon pour se lire un par un.

   L'étiquette cherche sa place autour du stand — en haut à droite d'abord,
   puis les autres coins, puis les côtés —, hors de ce que la barre, le tiroir
   ou la fiche couvrent, sans chevaucher une autre étiquette ni un autre stand
   appelé. Elle garde la place qu'elle a tant qu'elle y tient : un glissé ne la
   fait pas sauter d'un coin à l'autre.

   Le calque est posé dans la scène, hors du SVG comme du dessin de la carte
   graphique, et vaut donc pour les deux rendus. Il suit chaque image d'un
   geste (`suitLaVue`), et guette dans le SVG — que la carte graphique relit
   aussi — la sélection et le retrait de la recherche, qui s'y écrivent en
   classes. Il ne prend aucun clic : le stand dessous reste ce qu'on touche.
   ============================================================ */
import { DATA, P, state } from "./donnees.mjs";
import { filtre, visibleSurPlan } from "./filtre.mjs";
import { P_NOM } from "./polices-plan.mjs";
import { habille } from "./texte-plan.mjs";
import { svg, vue, cadrePlan, masque, masqueHaut, masqueDroite, suitLaVue, versScene } from "./vue.mjs";

/* En deçà de cette taille à l'écran, en pixels, un nom ne se lit pas. */
const LISIBLE = 8;
/* Au-delà de ce nombre de résultats dans le pavillon, ils ne s'appellent
   plus : on n'en lirait aucun. Le stand choisi, lui, s'appelle toujours. */
const RESULTATS = 8;
/* L'écart entre le stand et son étiquette, et la marge tenue autour de
   chacune. */
const ECART = 18, MARGE = 6;
/* Les places essayées autour du stand, dans cet ordre : les coins, qui
   laissent le filet en biais et lisible, puis les côtés. */
const PLACES = [[1, -1], [-1, -1], [1, 1], [-1, 1], [1, 0], [-1, 0], [0, -1], [0, 1]];
const NS = "http://www.w3.org/2000/svg";

/** @type {HTMLElement | null} */
let calque = null;
/** @type {SVGSVGElement | null} */
let filets = null;
/* Une étiquette par stand appelé, gardée d'une image à l'autre avec la place
   qu'elle a prise. */
/** @type {Map<string, { el: HTMLElement, filet: SVGLineElement, w: number, h: number, place: number }>} */
const etiquettes = new Map();
let imageDemandee = 0;

function monteCalque(){
  if (calque) return;
  calque = document.createElement("div");
  calque.className = "appels";
  calque.setAttribute("aria-hidden", "true");
  filets = /** @type {SVGSVGElement} */ (document.createElementNS(NS, "svg"));
  calque.appendChild(filets);
  svg.after(calque);
}

/** Les stands à appeler : le choisi d'abord, puis les résultats, s'ils sont peu. */
function appeles(){
  const p = P();
  const l = [];
  const choisi = p.stands.find(s => s.id === state.sel);
  if (choisi) l.push(choisi);
  if (filtre()){
    const res = p.stands.filter(s => s !== choisi && visibleSurPlan(s));
    if (res.length <= RESULTATS) l.push(...res);
  }
  return l.filter(s => (s.nom || s.code) && s.c && s.bb);
}

/** Le nom écrit dans le stand serait-il trop petit pour se lire ? */
function illisible(s, pxParM){
  if (!s.nom) return s.bb[0] * pxParM < 22;
  const nom = habille(s.nom, s.bb[0] * .9, s.bb[1] * .62, 2.4, P_NOM);
  return !nom || nom.f * pxParM < LISIBLE;
}

const chevauche = (a, b) => a.x < b.x + b.w + MARGE && b.x < a.x + a.w + MARGE &&
                            a.y < b.y + b.h + MARGE && b.y < a.y + a.h + MARGE;

/** La boîte de l'étiquette posée à la place `i` autour du rectangle `r`. */
function boiteA(i, r, w, h){
  const [dx, dy] = PLACES[i];
  const x = dx > 0 ? r.x + r.w + ECART : dx < 0 ? r.x - ECART - w : r.x + r.w / 2 - w / 2;
  const y = dy > 0 ? r.y + r.h + ECART : dy < 0 ? r.y - ECART - h : r.y + r.h / 2 - h / 2;
  return { x, y, w, h };
}

/** Le point du rectangle `r` le plus proche de `p`. */
const auBord = (r, p) => [Math.max(r.x, Math.min(r.x + r.w, p[0])), Math.max(r.y, Math.min(r.y + r.h, p[1]))];

function pose(){
  imageDemandee = 0;
  if (!DATA || !vue()) return;
  const cadre = cadrePlan();
  if (!cadre.width) return;
  const pxParM = cadre.width / vue().w;
  // ce qu'on voit vraiment du plan : sans la barre, le tiroir ni la fiche
  const vu = { x: 8, y: masqueHaut() + 8, w: cadre.width - masqueDroite() - 16,
               h: cadre.height - masque() - masqueHaut() - 16 };
  const dedans = b => b.x >= vu.x && b.y >= vu.y && b.x + b.w <= vu.x + vu.w && b.y + b.h <= vu.y + vu.h;

  const l = [];
  for (const s of appeles()){
    const [x0, y0] = versScene(s.c[0] - s.bb[0] / 2, s.c[1] - s.bb[1] / 2);
    const r = { x: x0, y: y0, w: s.bb[0] * pxParM, h: s.bb[1] * pxParM };
    // un stand hors de la vue n'a rien à montrer, et son filet partirait du bord
    if (!chevauche(r, vu) || !illisible(s, pxParM)) continue;
    l.push({ s, r });
  }

  const gardes = new Set();
  const posees = l.map(a => a.r);
  for (const { s, r } of l){
    if (!calque) monteCalque();
    let e = etiquettes.get(s.id);
    if (!e){
      const el = document.createElement("span");
      el.className = "appel";
      el.textContent = s.nom || s.code;
      calque.appendChild(el);
      const filet = /** @type {SVGLineElement} */ (document.createElementNS(NS, "line"));
      filets.appendChild(filet);
      e = { el, filet, w: el.offsetWidth, h: el.offsetHeight, place: -1 };
      etiquettes.set(s.id, e);
      // l'étiquette naît effacée, puis paraît : voir « .appel.vu »
      requestAnimationFrame(() => e.el.classList.add("vu"));
    }
    e.el.classList.toggle("choisi", s.id === state.sel);
    /* La place d'avant d'abord, tant qu'elle convient ; sinon la première
       libre ; à défaut, la première qui reste dans la vue. */
    const libre = (/** @type {number} */ i) => {
      const b = boiteA(i, r, e.w, e.h);
      return dedans(b) && !posees.some(o => chevauche(o, b));
    };
    let i = e.place >= 0 && libre(e.place) ? e.place : PLACES.findIndex((_, k) => libre(k));
    if (i < 0) i = PLACES.findIndex((_, k) => dedans(boiteA(k, r, e.w, e.h)));
    if (i < 0) continue;
    e.place = i;
    const b = boiteA(i, r, e.w, e.h);
    posees.push(b);
    gardes.add(s.id);
    e.el.style.transform = "translate(" + b.x.toFixed(1) + "px," + b.y.toFixed(1) + "px)";
    // le filet va du bord du stand au bord de l'étiquette, sur la ligne des centres
    const cs = [r.x + r.w / 2, r.y + r.h / 2], ce = [b.x + b.w / 2, b.y + b.h / 2];
    const p0 = auBord(r, ce), p1 = auBord(b, cs);
    e.filet.setAttribute("x1", p0[0].toFixed(1)); e.filet.setAttribute("y1", p0[1].toFixed(1));
    e.filet.setAttribute("x2", p1[0].toFixed(1)); e.filet.setAttribute("y2", p1[1].toFixed(1));
    e.filet.classList.toggle("choisi", s.id === state.sel);
  }
  for (const [id, e] of etiquettes){
    if (gardes.has(id)) continue;
    e.el.remove(); e.filet.remove();
    etiquettes.delete(id);
  }
}

/* Une seule pose par image, quel que soit le nombre de raisons de la refaire. */
function planifie(){
  if (!imageDemandee) imageDemandee = requestAnimationFrame(pose);
}

suitLaVue(planifie);
/* La sélection, la recherche et le changement de pavillon s'écrivent dans le
   SVG — classes des stands, stands remplacés : on y guette ce qui change,
   comme le fait la carte graphique, plutôt que d'être appelé par chacun. */
new MutationObserver(planifie).observe(svg, { subtree: true, childList: true, attributes: true,
  attributeFilter: ["class"] });
addEventListener("resize", planifie);
