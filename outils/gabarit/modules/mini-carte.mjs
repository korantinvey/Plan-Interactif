/* ============================================================
   La mini-carte de situation

   Zoomé sur une allée, on ne sait plus où l'on est dans le hall : le plan
   entier est sorti du cadre, et avec lui tout ce qui permettait de s'y
   retrouver. Une vignette du pavillon, dans un coin, le rend — avec le cadre
   de ce qu'on regarde, qui suit chaque geste. On y clique, on y glisse le
   doigt : la vue va où l'on montre.

   Elle ne paraît que zoomé : plan entier à l'écran, elle ne dirait rien de
   plus que lui. Elle se dessine une fois par pavillon, d'un seul tracé pour
   tous les stands — six cents chemins réunis, que le navigateur peint comme
   un seul — et seul son cadre bouge ensuite. Elle se pose dans la scène, hors
   du SVG comme du dessin de la carte graphique, et vaut donc pour les deux.
   ============================================================ */
import { DATA, P } from "./donnees.mjs";
import { ETROIT } from "./ecran.mjs";
import { vue, emp, svg, changeVue, rafraichitVue, poseVue, suitLaVue } from "./vue.mjs";

/* En deçà de cette part du pavillon à l'écran, on est « dans » le plan, et la
   vignette sert. Au-dessus, le plan se voit assez pour se situer seul. */
const SEUIL = .42;

/** @type {HTMLElement | null} */
let boite = null;
/** @type {SVGRectElement | null} */
let cadre = null;
/* L'emprise pour laquelle la vignette est dessinée : une autre, c'est un
   autre pavillon, et il faut la refaire. */
/** @type {any} */
let dessinee = null;

function monte(){
  boite = document.createElement("div");
  boite.className = "miniCarte";
  boite.hidden = true;
  boite.setAttribute("role", "img");
  boite.setAttribute("aria-label", "Situation dans le pavillon");
  boite.innerHTML = '<svg preserveAspectRatio="xMidYMid meet">' +
    '<path class="mcZones"/><path class="mcStands"/><rect class="mcCadre"/></svg>';
  cadre = boite.querySelector(".mcCadre");
  svg.after(boite);
  brancheGeste(boite);
}

function dessine(){
  const p = P(), e = emp;
  dessinee = e;
  const s = boite.firstElementChild;
  const m = Math.max(e.x1 - e.x0, e.y1 - e.y0) * .03;
  s.setAttribute("viewBox", (e.x0 - m) + " " + (e.y0 - m) + " " +
    (e.x1 - e.x0 + 2 * m) + " " + (e.y1 - e.y0 + 2 * m));
  s.querySelector(".mcStands").setAttribute("d", p.stands.map(x => x.d).join(""));
  s.querySelector(".mcZones").setAttribute("d", p.zones.map(x => x.d).join(""));
  /* La vignette prend les proportions du pavillon, dans la limite de sa
     boîte : un hall en longueur ne s'y réduit pas en timbre-poste. */
  const r = (e.x1 - e.x0) / Math.max(1, e.y1 - e.y0);
  boite.style.setProperty("--mc-r", String(Math.max(.6, Math.min(2.4, r))));
}

function suit(){
  const v = vue();
  if (!DATA || !v || !emp) return;
  // sur un téléphone, la feuille de style la cache : rien à tenir à jour
  if (ETROIT()){ if (boite) boite.hidden = true; return; }
  if (!boite) monte();
  if (dessinee !== emp) dessine();
  const part = (v.w * v.h) / Math.max(1, (emp.x1 - emp.x0) * (emp.y1 - emp.y0));
  const voir = part < SEUIL;
  if (boite.hidden === voir) boite.hidden = !voir;
  if (!voir) return;
  cadre.setAttribute("x", String(v.x));
  cadre.setAttribute("y", String(v.y));
  cadre.setAttribute("width", String(v.w));
  cadre.setAttribute("height", String(v.h));
}

/* Montrer un point de la vignette y centre la vue, à la même échelle : on
   change d'endroit, pas de distance. Le doigt qui glisse emmène la vue avec
   lui, image par image, comme sur le plan. */
function brancheGeste(/** @type {HTMLElement} */ b){
  const s = /** @type {SVGSVGElement} */ (/** @type {unknown} */ (b.firstElementChild));
  let tient = false;
  const va = (/** @type {PointerEvent} */ ev) => {
    const m = s.getScreenCTM();
    if (!m) return;
    const q = new DOMPoint(ev.clientX, ev.clientY).matrixTransform(m.inverse());
    const v = vue();
    changeVue({ x: q.x - v.w / 2, y: q.y - v.h / 2, w: v.w, h: v.h });
    rafraichitVue();
  };
  b.addEventListener("pointerdown", ev => {
    tient = true;
    b.setPointerCapture(ev.pointerId);
    va(ev);
    ev.preventDefault();
  });
  b.addEventListener("pointermove", ev => { if (tient) va(ev); });
  const lache = () => { if (!tient) return; tient = false; poseVue(); };
  b.addEventListener("pointerup", lache);
  b.addEventListener("pointercancel", lache);
}

suitLaVue(suit);
