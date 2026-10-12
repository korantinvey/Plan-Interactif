/* ============================================================
   L'escalier d'un repère, attrapé sur le plan — l'outil de l'exploitant

   En vue immersive, un repère escalier, escalator ou ascenseur dresse son
   objet sous sa pastille (`decor.mjs` `objetRepere`). Ses marches montaient
   toujours vers le haut du plan, rarement dans le sens du bâtiment. Comme le
   comptoir d'un accueil (`outil-comptoir.mjs`), l'objet se prend donc à la
   main : un appui dessus le choisit — il bleuit et sort sa poignée, dans le
   sens où l'on monte —, le glisser le déplace avec sa pastille, la poignée
   le tourne par pas de cinq degrés (Maj libère le pas). Les flèches le
   déplacent au quart de mètre, au mètre Maj tenue ; R le tourne d'un quart de
   tour ; Échap ou un appui ailleurs le relâche.

   Le repère est une forme d'un calque de dessin : l'outil écrit sa position
   et son angle (`f.rot`, que l'éditeur règle aussi, `edition.mjs`) comme le
   ferait l'éditeur, par le même historique et le même enregistrement, sans
   avoir à ouvrir le calque — ce qui coucherait la vue à plat, où l'escalier
   ne se dresse pas. Pendant le geste on ne refait que la forme tirée
   (`redessineForme`) ; l'enregistrement attend le lâcher.

   La carte graphique ne désigne pas le décor : on vise par le calcul, sur le
   sol, l'empreinte que le dessin pose. Un escalier se dresse plus haut qu'un
   comptoir, et vu de biais son haut tombe derrière son pied : la visée est
   large.

   Un module de l'administration : `gestes-admin.mjs` l'insère dans la chaîne
   des gestes de l'exploitant.
   ============================================================ */
import { objetRepere, poigneeObjet, rayonPoigneeObjet, OBJETS_REPERE } from "./decor.mjs";
import { svg, versPlan, vue, cadrePlan } from "./vue.mjs";
import { cameraEnJeu } from "./camera.mjs";
import { ADMIN } from "./mode-admin.mjs";
import { inscritGesteTenu } from "./geste-tenu.mjs";
import { formeParId } from "./forme-choisie.mjs";
import { memorise, enregistreDessins } from "./socle-dessin.mjs";
import { redessineForme } from "./dessin.mjs";

/* Le pas de l'angle sous la poignée : un escalier suit les murs, droit ou
   de biais, rarement entre deux. */
const PAS_ANGLE = 5;

/** Le repère tenu : l'identifiant de sa forme, ou rien. */
let choisi = /** @type {string | null} */ (null);
/** @type {{ genre: string, id: string, dx: number, dy: number, bouge: boolean } | null} */
let geste = null;
// un escalier tenu sous le doigt : l'envoi au repos attend qu'on le lâche
inscritGesteTenu(() => geste && geste.bouge);

const noeudDe = (/** @type {string} */ id) =>
  document.querySelector('#couches .repere[data-f="' + CSS.escape(id) + '"]');

/** Un mètre du plan, compté en pixels de l'écran : la marge de la visée en dépend. */
const metresParPixel = () => vue().w / Math.max(1, cadrePlan().width);

/** Ce qu'on sait d'un repère dressé : sa forme, sa pastille, son objet. */
function lis(/** @type {Element} */ g){
  const glyphe = g.getAttribute("data-glyphe") || "";
  const id = g.getAttribute("data-f") || "";
  const cible = id && formeParId(id);
  const aplat = /** @type {SVGGraphicsElement | null} */ (g.firstElementChild);
  if (!cible || !aplat || !OBJETS_REPERE.includes(glyphe)) return null;
  let b;
  try { b = aplat.getBBox(); } catch (e) { return null; }
  if (!b || !(b.height > 0)) return null;
  const cx = b.x + b.width / 2, cy = b.y + b.height / 2, cote = b.height;
  const sens = +cible.f.rot || 0;
  return { g, id, f: cible.f, glyphe, cx, cy, cote, sens, obj: objetRepere(glyphe, cx, cy, cote, sens) };
}

/** Le point est-il dans l'anneau ? */
function dedans(/** @type {number[][]} */ an, /** @type {number} */ x, /** @type {number} */ y){
  let ok = false;
  for (let i = 0, j = an.length - 1; i < an.length; j = i++){
    const [xi, yi] = an[i], [xj, yj] = an[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) ok = !ok;
  }
  return ok;
}

/** La distance d'un point au plus proche de ces anneaux, nulle dedans. */
function distance(/** @type {number[][][]} */ anneaux, /** @type {number[]} */ p){
  let d = Infinity;
  for (const an of anneaux){
    if (dedans(an, p[0], p[1])) return 0;
    an.forEach((a, i) => {
      const b = an[(i + 1) % an.length], vx = b[0] - a[0], vy = b[1] - a[1];
      const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vy) / (vx * vx + vy * vy || 1)));
      d = Math.min(d, Math.hypot(p[0] - a[0] - t * vx, p[1] - a[1] - t * vy));
    });
  }
  return d;
}

/** L'objet sous ce point du sol, s'il y en a un — le tenu d'abord. */
function vise(/** @type {number[]} */ p){
  const marge = 10 * metresParPixel();
  const noeuds = [...document.querySelectorAll("#couches .repere[data-glyphe]")];
  if (choisi) noeuds.sort((a, b) => Number(b.getAttribute("data-f") === choisi) - Number(a.getAttribute("data-f") === choisi));
  for (const g of noeuds){
    const z = lis(g);
    if (!z || !z.obj.pieces.length) continue;
    if (z.id === choisi){
      const [hx, hy] = poigneeObjet(z.glyphe, z.cx, z.cy, z.cote, z.sens);
      if (Math.hypot(p[0] - hx, p[1] - hy) <= rayonPoigneeObjet(z.cote) + Math.max(.5, marge)) return { ...z, genre: "tourne" };
    }
    // le haut de l'objet se voit derrière son pied : un tiers de sa pastille de jeu
    if (distance(z.obj.pieces.map(q => q.polygon), p) <= Math.max(z.cote * .35, marge)) return { ...z, genre: "place" };
  }
  return null;
}

/** Tenir un repère, ou n'en tenir aucun : le dessin le dit par un attribut. */
export function choisitEscalier(/** @type {string | null} */ id){
  if (choisi === id) return;
  const avant = choisi && noeudDe(choisi);
  if (avant) avant.removeAttribute("data-objet-choisi");
  choisi = id;
  const g = id && noeudDe(id);
  if (g) g.setAttribute("data-objet-choisi", "");
  else choisi = null;
}

/** La forme vient d'être refaite : son nœud est neuf, la marque s'y repose. */
function refais(/** @type {any} */ f){
  redessineForme(f);
  const g = noeudDe(f.id);
  if (g && f.id === choisi) g.setAttribute("data-objet-choisi", "");
}

const angleBorne = (/** @type {number} */ a) => {
  const b = ((Math.round(a * 10) / 10 + 180) % 360 + 360) % 360 - 180;
  return b === -180 ? 180 : b;
};

export function escalierPointerDown(/** @type {PointerEvent} */ e){
  if (!ADMIN || !cameraEnJeu() || !e.isPrimary) return false;
  const p = versPlan(e.clientX, e.clientY);
  const z = vise(p);
  if (!z){ choisitEscalier(null); return false; }
  e.preventDefault();
  choisitEscalier(z.id);
  geste = { genre: z.genre, id: z.id, dx: p[0], dy: p[1], bouge: false };
  try { svg.setPointerCapture(e.pointerId); } catch (err) {}
  return true;
}

export function escalierPointerMove(/** @type {PointerEvent} */ e){
  if (!geste) return false;
  const g = noeudDe(geste.id), z = g && lis(g);
  if (!z){ geste = null; return true; }
  const p = versPlan(e.clientX, e.clientY);
  // le premier mouvement ouvre une entrée d'historique : Ctrl+Z défait le geste entier
  if (!geste.bouge) memorise();
  geste.bouge = true;
  if (geste.genre === "place"){
    const dx = p[0] - geste.dx, dy = p[1] - geste.dy;
    geste.dx = p[0]; geste.dy = p[1];
    z.f.pts = z.f.pts.map((/** @type {number[]} */ q) => [+(q[0] + dx).toFixed(2), +(q[1] + dy).toFixed(2)]);
  } else {
    // la poignée est au haut de l'escalier : l'angle se lit du milieu vers elle
    let a = Math.atan2(p[0] - z.cx, -(p[1] - z.cy)) * 180 / Math.PI;
    if (!e.shiftKey) a = Math.round(a / PAS_ANGLE) * PAS_ANGLE;
    const b = angleBorne(a);
    if (b) z.f.rot = b; else delete z.f.rot;
  }
  refais(z.f);
  return true;
}

export function escalierPointerUp(/** @type {PointerEvent} */ e){
  if (!geste) return false;
  const bouge = geste.bouge;
  geste = null;
  try { if (svg.hasPointerCapture(e.pointerId)) svg.releasePointerCapture(e.pointerId); } catch (err) {}
  if (bouge) enregistreDessins();
  return true;
}

/** Le geste abandonné : ce qui a été posé reste, et s'écrit. */
export function lacheEscalier(){
  if (geste && geste.bouge) enregistreDessins();
  geste = null;
}

/** Les flèches et R sur le repère tenu ; rend vrai s'il les a pris. */
export function escalierClavier(/** @type {KeyboardEvent} */ e){
  if (!choisi || !cameraEnJeu()) return false;
  const cible = formeParId(choisi);
  if (!cible){ choisitEscalier(null); return false; }
  const f = cible.f;
  if (e.key.indexOf("Arrow") === 0){
    const pas = e.shiftKey ? 1 : .25;
    const dx = e.key === "ArrowLeft" ? -pas : e.key === "ArrowRight" ? pas : 0;
    const dy = e.key === "ArrowUp" ? -pas : e.key === "ArrowDown" ? pas : 0;
    memorise("fleches-escalier");
    f.pts = f.pts.map((/** @type {number[]} */ q) => [+(q[0] + dx).toFixed(2), +(q[1] + dy).toFixed(2)]);
  } else if (e.key === "r" || e.key === "R"){
    memorise();
    const b = angleBorne((+f.rot || 0) + 90);
    if (b) f.rot = b; else delete f.rot;
  } else return false;
  e.preventDefault();
  refais(f);
  enregistreDessins();
  return true;
}

/** Échap relâche le repère tenu ; rend vrai s'il y en avait un. */
export function relacheEscalier(){
  if (!choisi) return false;
  choisitEscalier(null);
  return true;
}
