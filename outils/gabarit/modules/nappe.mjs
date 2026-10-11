/* ============================================================
   Itinéraire — la nappe de la grille de marche

   L'outil de mise au point de l'exploitant : la grille du calcul
   (`itineraire.mjs` `grille`), peinte sous le plan telle que le calcul la
   voit. Le visiteur ne la reçoit pas : seul `plan-admin.mjs` embarque ce
   module. Le montage d'un pavillon (`rendu.mjs`) refait la nappe sans
   l'importer : ce module suit son annonce (`PAVILLON_MONTE`), que personne
   n'écoute chez le visiteur.

   La lecture des jetons de couleur
   (`configuration.mjs`) et le plan où la nappe se pose (`vue.mjs`)
   s'importent. La case qui la montre (`outil-dessin.mjs`) passe par sa
   porte, `poseNappe`.
   ============================================================ */
import { $ } from "./dom.mjs";
import { DATA, P } from "./donnees.mjs";
import { ADMIN } from "./mode-admin.mjs";
import { PAS_GRILLE, grille } from "./itineraire.mjs";
import { ITI } from "./tiroir-itineraire.mjs";
import { jeton } from "./configuration.mjs";
import { svg } from "./vue.mjs";
import { PAVILLON_MONTE } from "./rendu.mjs";

/* ------------------------------------------------------------
   Voir ce qui est praticable
   ------------------------------------------------------------ */
/**
 * Dessiner la circulation sans la voir revient à parier.
 *
 * L'exploitant trace une allée, puis une autre, et ne saura qu'elles ne se
 * touchent pas qu'en essayant un trajet qui échoue — sans savoir où. Cette
 * teinte est la grille elle-même, telle que le calcul la voit : ce qui n'est
 * pas coloré n'est pas praticable, et une allée dessinée qui reste blanche est
 * une allée trop étroite ou détachée du reste.
 *
 * Réservée à l'administration : c'est un outil de mise au point, pas une
 * couche de plan.
 */
let voirNappe = false;

/** La porte de la case « voir la nappe » de la boîte à outils. */
export function poseNappe(v){ voirNappe = v; }

function couleurNappe(){
  const h = String(jeton("--accent")).trim();
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(h);
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [47, 73, 209];
}

export function rafraichitApercu(){
  const vieux = $("nappe");
  if (!voirNappe || !ADMIN || !DATA){ if (vieux) vieux.remove(); return; }
  const p = P();
  const g = grille(p, ITI.pmr);
  const cv = document.createElement("canvas");
  cv.width = g.w; cv.height = g.h;
  const ctx = cv.getContext("2d");
  const img = ctx.createImageData(g.w, g.h);
  const d = img.data, c = couleurNappe();
  for (let i = 0; i < g.nappe.length; i++){
    if (!g.nappe[i]) continue;
    const k = i * 4;
    d[k] = c[0]; d[k + 1] = c[1]; d[k + 2] = c[2]; d[k + 3] = 150;
  }
  ctx.putImageData(img, 0, 0);

  const el = vieux || document.createElementNS("http://www.w3.org/2000/svg", "image");
  el.id = "nappe";
  el.setAttribute("x", g.x0);
  el.setAttribute("y", g.y0);
  el.setAttribute("width", g.w * PAS_GRILLE);
  el.setAttribute("height", g.h * PAS_GRILLE);
  // la nappe est posée dans les axes de la grille : on la remet d'aplomb
  el.setAttribute("transform", "rotate(" + (Math.atan2(g.si, g.co) * 180 / Math.PI) + ")");
  el.setAttribute("preserveAspectRatio", "none");
  el.setAttribute("href", cv.toDataURL());
  if (!vieux) svg.insertBefore(el, svg.querySelector("#itin, #apercu, #poignees"));
}

/* La nappe se refait au montage d'un pavillon, que le rendu annonce. */
PAVILLON_MONTE.suis(rafraichitApercu);
