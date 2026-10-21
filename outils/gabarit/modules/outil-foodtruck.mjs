/* ============================================================
   Les camions d'un foodtruck, attrapés sur le plan — l'outil de l'exploitant

   En vue immersive, chaque camion d'une zone « Foodtruck » (`decor.mjs`
   `camions`) se prend à la main, comme le comptoir d'un accueil
   (`outil-comptoir.mjs`) : un appui dessus le choisit — il bleuit et sort sa
   poignée au bout du capot —, le glisser le déplace, la poignée le tourne,
   par pas de cinq degrés (Maj libère le pas). Les flèches l'ajustent au
   quart de mètre, au mètre Maj tenue ; R le tourne d'un quart de tour ;
   Échap ou un appui ailleurs le relâche. Le nombre de camions, lui, se règle
   dans la fiche de la zone (`reglage-foodtrucks.mjs`).

   L'outil ne prend la main qu'en vue immersive, et seulement sur un camion
   ou sa poignée : tout autre appui suit son cours. On vise par le calcul,
   sur le sol, avec la même règle que le dessin. Un camion monte à près de
   trois mètres, et vu de biais son toit tombe loin derrière ses roues : la
   visée déborde de chaque côté.

   Le réglage se range dans la configuration (`_foodtrucks`) et s'écrit au
   lâcher ; pendant le geste, seul l'attribut de la zone change.

   Un module de l'administration : `gestes-admin.mjs` l'insère dans la chaîne
   des gestes de l'exploitant.
   ============================================================ */
import { CONF, enregistreConf } from "./configuration.mjs";
import { camions, figeCamions, rapprocheCamion, poigneeCamion, reglageCamionsValide, CAMION, RAYON_POIGNEE }
  from "./decor.mjs";
import { anneauDe, emprise } from "./outil-comptoir.mjs";
import { ecritCamions } from "./reglage-foodtrucks.mjs";
import { svg, versPlan, vue, cadrePlan } from "./vue.mjs";
import { cameraEnJeu } from "./camera.mjs";
import { ADMIN } from "./mode-admin.mjs";
import { inscritGesteTenu } from "./geste-tenu.mjs";

const PAS_ANGLE = 5;

/** Le camion choisi : sa zone et son rang, ou rien. */
let choisi = /** @type {{ id: string, i: number } | null} */ (null);
/** @type {{ genre: string, id: string, i: number, dx: number, dy: number, bouge: boolean } | null} */
let geste = null;
inscritGesteTenu(() => geste && geste.bouge);

const zoneDe = (/** @type {string} */ id) =>
  document.querySelector('#zones g.zone[data-id="' + CSS.escape(id) + '"][data-type="foodtruck"]');

/** Le réglage d'une zone tel que la configuration le tient, ou rien. */
const reglageDe = (/** @type {string} */ id) => {
  const r = (CONF._foodtrucks || {})[id];
  return reglageCamionsValide(r) ? r : null;
};

/** Ce qu'on sait des camions d'une zone posée sur le plan. */
function lis(/** @type {Element} */ g){
  const path = g.querySelector("path");
  const an = path && anneauDe(path.getAttribute("d") || "");
  if (!an) return null;
  const id = g.getAttribute("data-id") || "";
  return { id, an, liste: camions(an, reglageDe(id)) };
}

const metresParPixel = () => vue().w / Math.max(1, cadrePlan().width);

/** Le camion sous ce point du sol, s'il y en a un — la poignée du choisi
 *  d'abord, puis le choisi, puis les autres. */
function vise(/** @type {number[]} */ p){
  const marge = 10 * metresParPixel(), m = Math.max(1.2, marge);
  const tous = [];
  for (const g of document.querySelectorAll('#zones g.zone[data-type="foodtruck"]:not(.masquee)')){
    const z = lis(g);
    if (z) z.liste.forEach((c, i) => tous.push({ ...z, i, c, tenu: !!choisi && choisi.id === z.id && choisi.i === i }));
  }
  const tenu = tous.find(t => t.tenu);
  if (tenu){
    const [hx, hy] = poigneeCamion(tenu.c);
    if (Math.hypot(p[0] - hx, p[1] - hy) <= RAYON_POIGNEE + Math.max(.5, marge)) return { ...tenu, genre: "tourne" };
  }
  tous.sort((a, b) => Number(b.tenu) - Number(a.tenu));
  for (const t of tous){
    const { c } = t, a = c.angle * Math.PI / 180, ox = p[0] - c.cx, oy = p[1] - c.cy;
    const lx = ox * Math.cos(a) + oy * Math.sin(a), ly = -ox * Math.sin(a) + oy * Math.cos(a);
    if (lx > -CAMION.ar * c.k - m && lx < CAMION.av * c.k + m && ly > -CAMION.dos * c.k - m && ly < CAMION.cote * c.k + m)
      return { ...t, genre: "place" };
  }
  return null;
}

/** Choisir un camion, ou aucun : le dessin le dit par un attribut de sa zone. */
export function choisitFoodtruck(/** @type {{ id: string, i: number } | null} */ c){
  if (choisi && c && choisi.id === c.id && choisi.i === c.i) return;
  const avant = choisi && zoneDe(choisi.id);
  if (avant) avant.removeAttribute("data-foodtruck-choisi");
  choisi = c;
  const g = c && zoneDe(c.id);
  if (g) g.setAttribute("data-foodtruck-choisi", String(/** @type {any} */ (c).i));
  else choisi = null;
}

/** Poser un réglage sur un camion, sans l'écrire encore sur le poste. */
function pose(/** @type {{ id: string, an: number[][] }} */ z, /** @type {number} */ i,
  /** @type {{ u: number, v: number, a: number }} */ voulu){
  const liste = figeCamions(z.an, reglageDe(z.id));
  if (!liste[i]) return;
  voulu.u = Math.min(1, Math.max(0, voulu.u));
  voulu.v = Math.min(1, Math.max(0, voulu.v));
  liste[i] = rapprocheCamion(z.an, liste[i], voulu);
  ecritCamions(z.id, liste);
}

export function foodtruckPointerDown(/** @type {PointerEvent} */ e){
  if (!ADMIN || !cameraEnJeu() || !e.isPrimary) return false;
  const p = versPlan(e.clientX, e.clientY);
  const z = vise(p);
  if (!z){ choisitFoodtruck(null); return false; }
  e.preventDefault();
  choisitFoodtruck({ id: z.id, i: z.i });
  const c = z.c;
  geste = { genre: z.genre, id: z.id, i: z.i, dx: p[0] - c.cx, dy: p[1] - c.cy, bouge: false };
  try { svg.setPointerCapture(e.pointerId); } catch (err) {}
  return true;
}

export function foodtruckPointerMove(/** @type {PointerEvent} */ e){
  if (!geste) return false;
  const g = zoneDe(geste.id), z = g && lis(g), c = z && z.liste[geste.i];
  if (!z || !c){ geste = null; return true; }
  const p = versPlan(e.clientX, e.clientY), em = emprise(z.an);
  const r = figeCamions(z.an, reglageDe(z.id))[geste.i];
  if (geste.genre === "place"){
    r.u = (p[0] - geste.dx - em.x0) / em.w;
    r.v = (p[1] - geste.dy - em.y0) / em.h;
  } else {
    // la poignée prolonge l'axe arrière → cabine : l'angle se lit du milieu vers elle
    let a = Math.atan2(p[1] - c.cy, p[0] - c.cx) * 180 / Math.PI;
    if (!e.shiftKey) a = Math.round(a / PAS_ANGLE) * PAS_ANGLE;
    r.a = a;
  }
  geste.bouge = true;
  pose(z, geste.i, r);
  return true;
}

export function foodtruckPointerUp(/** @type {PointerEvent} */ e){
  if (!geste) return false;
  const bouge = geste.bouge;
  geste = null;
  try { if (svg.hasPointerCapture(e.pointerId)) svg.releasePointerCapture(e.pointerId); } catch (err) {}
  if (bouge) enregistreConf();
  return true;
}

/** Le geste abandonné : ce qui a été posé reste, et s'écrit. */
export function lacheFoodtruck(){
  if (geste && geste.bouge) enregistreConf();
  geste = null;
}

/** Les flèches et R sur le camion choisi ; rend vrai s'il les a prises. */
export function foodtruckClavier(/** @type {KeyboardEvent} */ e){
  if (!choisi || !cameraEnJeu()) return false;
  const g = zoneDe(choisi.id), z = g && lis(g);
  if (!z || !z.liste[choisi.i]){ choisitFoodtruck(null); return false; }
  const r = figeCamions(z.an, reglageDe(z.id))[choisi.i], em = emprise(z.an);
  if (e.key.indexOf("Arrow") === 0){
    const pas = e.shiftKey ? 1 : .25;
    r.u += (e.key === "ArrowLeft" ? -pas : e.key === "ArrowRight" ? pas : 0) / em.w;
    r.v += (e.key === "ArrowUp" ? -pas : e.key === "ArrowDown" ? pas : 0) / em.h;
  } else if (e.key === "r" || e.key === "R") r.a += 90;
  else return false;
  e.preventDefault();
  pose(z, choisi.i, r);
  enregistreConf();
  return true;
}

/** Échap relâche le camion choisi ; rend vrai s'il y en avait un. */
export function relacheFoodtruck(){
  if (!choisi) return false;
  choisitFoodtruck(null);
  return true;
}
