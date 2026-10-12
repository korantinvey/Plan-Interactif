/* ============================================================
   Le comptoir d'un accueil, attrapé sur le plan — l'outil de l'exploitant

   En vue immersive, le comptoir d'une zone « Accueil » (`decor.mjs`
   `comptoir`) se prend à la main : un appui dessus le choisit — il bleuit et
   sort sa poignée —, le glisser le déplace, la poignée ronde le tourne, par
   pas de cinq degrés (Maj libère le pas). Les flèches l'ajustent au quart de
   mètre, au mètre Maj tenue ; R le tourne d'un quart de tour ; Échap ou un
   appui ailleurs le relâche.

   Ce n'est pas un mode d'édition (`modes-edition.mjs`) : ceux-là couchent la
   vue à plat, et le comptoir ne se dresse qu'en vue immersive. L'outil ne
   prend donc la main qu'en vue immersive, et seulement sur un comptoir ou sa
   poignée : tout autre appui suit son cours, glisser le plan ou ouvrir une
   fiche. La carte graphique ne désigne pas le décor ; on vise donc par le
   calcul, sur le sol, avec la même règle que le dessin (`comptoir`,
   `poigneeComptoir`). Il reste dans sa zone : tiré contre le bord, il s'y
   arrête et glisse le long (`rapprocheComptoir`). Le plateau se dresse à un mètre du sol, et vu de biais
   son dessus tombe un peu derrière son pied : la visée est large en
   profondeur.

   Le réglage se range dans la configuration (`_comptoirs`), comme celui de la
   fiche de la zone (`reglage-comptoir.mjs`), et s'écrit au lâcher. Pendant le
   geste, seul l'attribut de la zone change : le SVG observé se repeint.

   Un module de l'administration : `gestes-admin.mjs` l'insère dans la chaîne
   des gestes de l'exploitant.
   ============================================================ */
import { CONF, enregistreConf } from "./configuration.mjs";
import { comptoir, poigneeComptoir, reglageComptoirValide, rapprocheComptoir, RAYON_POIGNEE } from "./decor.mjs";
import { lisTrace } from "./trace.mjs";
import { svg, versPlan, vue, cadrePlan } from "./vue.mjs";
import { cameraEnJeu } from "./camera.mjs";
import { ADMIN } from "./mode-admin.mjs";
import { inscritGesteTenu } from "./geste-tenu.mjs";

/* Le pas de l'angle sous la poignée : un comptoir se pose droit, ou de biais
   à quarante-cinq degrés, rarement entre deux. */
const PAS_ANGLE = 5;

/** L'aire signée d'un anneau. */
const aire = (/** @type {number[][]} */ an) =>
  an.reduce((s, p, i) => { const q = an[(i + 1) % an.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0) / 2;

/** Le contour extérieur d'un tracé : son plus grand anneau. */
export function anneauDe(/** @type {string} */ d){
  const anneaux = lisTrace(d || "").map(t => t.pts).filter(p => p.length >= 3);
  return anneaux.sort((a, b) => Math.abs(aire(b)) - Math.abs(aire(a)))[0] || null;
}

/** L'emprise d'un anneau, celle dont le réglage compte ses parts. */
export function emprise(/** @type {number[][]} */ an){
  const xs = an.map(p => p[0]), ys = an.map(p => p[1]);
  const x0 = Math.min(...xs), y0 = Math.min(...ys);
  return { x0, y0, w: Math.max(Math.max(...xs) - x0, 1e-6), h: Math.max(Math.max(...ys) - y0, 1e-6) };
}

/** Le réglage d'une zone tel que la configuration le tient, ou rien. */
const reglageDe = (/** @type {string} */ id) => {
  const r = (CONF._comptoirs || {})[id];
  return reglageComptoirValide(r) ? r : null;
};

/** Le comptoir choisi : l'identifiant de sa zone, ou rien. */
let choisi = /** @type {string | null} */ (null);
/** @type {{ genre: string, id: string, dx: number, dy: number, bouge: boolean } | null} */
let geste = null;
// un comptoir tenu sous le doigt : l'envoi au repos attend qu'on le lâche
inscritGesteTenu(() => geste && geste.bouge);

const zoneDe = (/** @type {string} */ id) =>
  document.querySelector('#zones g.zone[data-id="' + CSS.escape(id) + '"][data-type="accueil"]');

/** Ce qu'on sait d'un comptoir posé sur le plan : sa zone, son contour, sa place. */
function lis(/** @type {Element} */ g){
  const path = g.querySelector("path");
  const an = path && anneauDe(path.getAttribute("d") || "");
  if (!an) return null;
  const id = g.getAttribute("data-id") || "";
  return { g, id, an, c: comptoir(an, reglageDe(id)) };
}

/** Un mètre du plan, compté en pixels de l'écran : la marge de la visée en dépend. */
const metresParPixel = () => vue().w / Math.max(1, cadrePlan().width);

/** Le comptoir sous ce point du sol, s'il y en a un — le choisi d'abord. */
function vise(/** @type {number[]} */ p){
  const zones = [...document.querySelectorAll('#zones g.zone[data-type="accueil"]:not(.masquee)')];
  if (choisi) zones.sort((a, b) => Number(b.getAttribute("data-id") === choisi) - Number(a.getAttribute("data-id") === choisi));
  const marge = 10 * metresParPixel();
  for (const g of zones){
    const z = lis(g);
    if (!z) continue;
    const { c } = z;
    if (z.id === choisi){
      const [hx, hy] = poigneeComptoir(c);
      if (Math.hypot(p[0] - hx, p[1] - hy) <= RAYON_POIGNEE + Math.max(.5, marge)) return { ...z, genre: "tourne" };
    }
    const t = c.angle * Math.PI / 180, ox = p[0] - c.cx, oy = p[1] - c.cy;
    const lx = ox * Math.cos(t) + oy * Math.sin(t), ly = -ox * Math.sin(t) + oy * Math.cos(t);
    if (Math.abs(lx) <= c.demi + Math.max(.3, marge) && Math.abs(ly) <= c.prof + Math.max(1.2, marge))
      return { ...z, genre: "place" };
  }
  return null;
}

/** Choisir un comptoir, ou n'en choisir aucun : le dessin le dit par un attribut. */
export function choisitComptoir(/** @type {string | null} */ id){
  if (choisi === id) return;
  const avant = choisi && zoneDe(choisi);
  if (avant) avant.removeAttribute("data-comptoir-choisi");
  choisi = id;
  const g = id && zoneDe(id);
  if (g) g.setAttribute("data-comptoir-choisi", "");
  else choisi = null;
}

/** Poser un réglage sur la zone, sans l'écrire encore sur le poste. Le
 *  comptoir reste dans sa zone : tiré contre le bord, il s'y arrête. */
function pose(/** @type {{ id: string, an: number[][], c: any }} */ z, /** @type {{ u: number, v: number, a: number }} */ r){
  const voulu = { u: Math.min(1, Math.max(0, r.u)), v: Math.min(1, Math.max(0, r.v)),
    a: ((r.a % 180) + 180) % 180 };
  const q = rapprocheComptoir(z.an, reglageCourant(z), voulu);
  const t = CONF._comptoirs = CONF._comptoirs || {};
  const n = { u: +q.u.toFixed(4), v: +q.v.toFixed(4), a: Math.round((((q.a % 180) + 180) % 180) * 10) / 10 };
  t[z.id] = n;
  const g = zoneDe(z.id);
  if (g) g.setAttribute("data-comptoir", [n.u, n.v, n.a].join(" "));
}

/** Le réglage en place, ou le placement d'office figé en réglage. */
function reglageCourant(/** @type {{ id: string, an: number[][], c: any }} */ z){
  const r = reglageDe(z.id);
  if (r) return { ...r };
  const e = emprise(z.an);
  return { u: (z.c.cx - e.x0) / e.w, v: (z.c.cy - e.y0) / e.h, a: z.c.angle };
}

export function comptoirPointerDown(/** @type {PointerEvent} */ e){
  if (!ADMIN || !cameraEnJeu() || !e.isPrimary) return false;
  const p = versPlan(e.clientX, e.clientY);
  const z = vise(p);
  if (!z){ choisitComptoir(null); return false; }
  e.preventDefault();
  choisitComptoir(z.id);
  geste = { genre: z.genre, id: z.id, dx: p[0] - z.c.cx, dy: p[1] - z.c.cy, bouge: false };
  try { svg.setPointerCapture(e.pointerId); } catch (err) {}
  return true;
}

export function comptoirPointerMove(/** @type {PointerEvent} */ e){
  if (!geste) return false;
  const g = zoneDe(geste.id), z = g && lis(g);
  if (!z){ geste = null; return true; }
  const p = versPlan(e.clientX, e.clientY), r = reglageCourant(z), em = emprise(z.an);
  if (geste.genre === "place"){
    r.u = (p[0] - geste.dx - em.x0) / em.w;
    r.v = (p[1] - geste.dy - em.y0) / em.h;
  } else {
    // la poignée est du côté « -y » du comptoir : l'angle se lit du milieu vers elle
    let a = Math.atan2(p[0] - z.c.cx, -(p[1] - z.c.cy)) * 180 / Math.PI;
    if (!e.shiftKey) a = Math.round(a / PAS_ANGLE) * PAS_ANGLE;
    r.a = a;
  }
  geste.bouge = true;
  pose(z, r);
  return true;
}

export function comptoirPointerUp(/** @type {PointerEvent} */ e){
  if (!geste) return false;
  const bouge = geste.bouge;
  geste = null;
  try { if (svg.hasPointerCapture(e.pointerId)) svg.releasePointerCapture(e.pointerId); } catch (err) {}
  if (bouge) enregistreConf();
  return true;
}

/** Le geste abandonné : ce qui a été posé reste, et s'écrit. */
export function lacheComptoir(){
  if (geste && geste.bouge) enregistreConf();
  geste = null;
}

/** Les flèches et R sur le comptoir choisi ; rend vrai s'il les a prises. */
export function comptoirClavier(/** @type {KeyboardEvent} */ e){
  if (!choisi || !cameraEnJeu()) return false;
  const g = zoneDe(choisi), z = g && lis(g);
  if (!z){ choisitComptoir(null); return false; }
  const r = reglageCourant(z), em = emprise(z.an);
  if (e.key.indexOf("Arrow") === 0){
    const pas = e.shiftKey ? 1 : .25;
    r.u += (e.key === "ArrowLeft" ? -pas : e.key === "ArrowRight" ? pas : 0) / em.w;
    r.v += (e.key === "ArrowUp" ? -pas : e.key === "ArrowDown" ? pas : 0) / em.h;
  } else if (e.key === "r" || e.key === "R") r.a += 90;
  else return false;
  e.preventDefault();
  pose(z, r);
  enregistreConf();
  return true;
}

/** Échap relâche le comptoir choisi ; rend vrai s'il y en avait un. */
export function relacheComptoir(){
  if (!choisi) return false;
  choisitComptoir(null);
  return true;
}
