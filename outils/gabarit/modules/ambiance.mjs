/* ============================================================
   L'ambiance du plan — Classique, Tuiles

   Le modèle habille les panneaux ; l'ambiance habille le plan lui-même, la
   forme de ses stands et de ses zones :

   - Classique : le plan tel qu'il a toujours été, cloisons fines.
   - Tuiles : stands et zones aux coins arrondis, détachés les uns des autres
     par un vide au lieu d'une cloison. Plus calme, plus grand public.

   Une ambiance est une forme, pas une palette : les couleurs restent celles
   que l'exploitant règle — stands, zones, secteurs, fond.

   L'exploitant choisit dans le volet « Apparence » ; le choix part avec la
   configuration publiée, comme la couleur principale.
   ============================================================ */
import { P } from "./donnees.mjs";
import { conf } from "./configuration.mjs";
import { PLAN_ADMIN } from "./salon.mjs";

const racine = document.documentElement;

export const AMBIANCES = [
  { cle: "classique", nom: "Classique", dit: "Cloisons fines, aplats francs." },
  { cle: "tuiles", nom: "Tuiles", dit: "Coins arrondis, stands détachés." },
];

/* Essayer une ambiance sans la publier : « ?ambiance=tuiles » sur le plan
   public la pose pour cette visite seulement. On montre ainsi le rendu à qui
   n'a pas d'accès administrateur, et on compare deux ambiances côte à côte
   dans deux onglets. Pas en administration, où c'est le réglage qu'on voit
   et qu'on change — l'adresse le masquerait. */
const ESSAI = PLAN_ADMIN ? null : new URLSearchParams(location.search).get("ambiance");

/** L'ambiance retenue — Classique quand rien n'est réglé, ou qu'une clé
 *  inconnue arrive d'une configuration plus récente que la page. */
export function ambianceRetenue(){
  const c = AMBIANCES.some(a => a.cle === ESSAI) ? ESSAI : conf("_ambiance").cle;
  return AMBIANCES.some(a => a.cle === c) ? c : "classique";
}

/** Les anneaux d'un tracé fait de segments, ou rien pour un tracé courbe. */
function anneaux(/** @type {string} */ d){
  if (!/^[\sMLZ0-9.,eE+-]+$/.test(d)) return null;
  return d.split(/(?=M)/).map(sous => {
    const n = (sous.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi) || []).map(Number);
    const pts = [];
    for (let i = 0; i + 1 < n.length; i += 2) pts.push([n[i], n[i + 1]]);
    const [a0, z] = [pts[0], pts[pts.length - 1]];
    if (pts.length > 1 && a0[0] === z[0] && a0[1] === z[1]) pts.pop();
    return pts;
  }).filter(a => a.length >= 3);
}

const f3 = (/** @type {number} */ v) => v.toFixed(3);

/* ------------------------------------------------------------
   Les tuiles
   ------------------------------------------------------------ */
/* Des stands et des zones aux coins arrondis, détachés les uns des autres.
   L'arrondi se fait sur le tracé même de la forme, et non sur une couche
   posée dessus : tout ce qui le peint — secteur, survol, sélection, chaleur,
   recherche — et tout ce qui le relit — la carte graphique, le liseré de la
   sélection et du parcours — suit ainsi sans rien savoir de l'ambiance.

   Chaque angle est remplacé par une courbe qui part un peu avant lui et
   finit un peu après, sur les deux côtés qui s'y rejoignent. Le rayon vaut
   quatre-vingts centimètres, moins sur un petit côté pour ne jamais en
   dévorer plus du tiers. Seuls les tracés faits de segments s'arrondissent —
   c'est la forme de presque tous les stands ; une rotonde, déjà courbe,
   reste telle quelle. */
const RAYON = .8;
let tuiles = false;

function arrondi(d){
  const an = anneaux(d);
  if (!an) return d;
  return an.map(pts => {
    const vers = (p, q, r) => {
      const l = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
      return [f3(p[0] + (q[0] - p[0]) * r / l), f3(p[1] + (q[1] - p[1]) * r / l)];
    };
    const k = pts.length;
    const coins = pts.map((p, i) => {
      const av = pts[(i + k - 1) % k], ap = pts[(i + 1) % k];
      const r = Math.min(RAYON, Math.hypot(p[0] - av[0], p[1] - av[1]) / 3,
                                Math.hypot(p[0] - ap[0], p[1] - ap[1]) / 3);
      return { p, a: vers(p, av, r), b: vers(p, ap, r) };
    });
    let t = "M" + coins[0].b.join(" ");
    for (let i = 1; i <= k; i++){
      const c = coins[i % k];
      t += "L" + c.a.join(" ") + "Q" + c.p.join(" ") + " " + c.b.join(" ");
    }
    return t + "Z";
  }).join("");
}

/** Le tracé d'un stand ou d'une zone tel que l'ambiance le dessine —
 *  `rendu.mjs` `baliseStand` et `baliseZone` le demandent pour chacun. */
export function traceStand(/** @type {string} */ d){
  return tuiles && d ? arrondi(d) : d;
}

export function appliqueAmbiance(){
  const a = ambianceRetenue();
  AMBIANCES.forEach(x => racine.classList.toggle("ambiance-" + x.cle, x.cle === a));
  /* Les tuiles changent la forme des stands et des zones déjà posés : on les
     retrace dans l'ordre où `montePlan` les a écrits, celui des données du
     pavillon. */
  if (tuiles !== (a === "tuiles")){
    tuiles = a === "tuiles";
    const p = P();
    for (const [groupe, formes] of [["stands", p.stands], ["zones", p.zones]])
      document.querySelectorAll("#" + groupe + " > g > path").forEach((el, i) => {
        if (formes[i]) el.setAttribute("d", traceStand(formes[i].d));
      });
  }
}
