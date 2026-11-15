/* ============================================================
   Le tracé des tuiles — des stands aux coins arrondis, détachés

   L'ambiance Tuiles (et l'immersif, qui en est fait) change la forme même des
   stands et des zones : chaque angle s'arrondit, chaque forme se retire un
   peu de ses voisines. C'est un calcul sur le tracé, sans écran : le rendu le
   pose dans le SVG, le dessin le peint, le parcours et les distinctions y
   posent leurs liserés et leurs marques.

   Il vivait dans `ambiance.mjs`, qui décide de l'ambiance et touche la page
   dès qu'il se charge : tout module qui voulait le tracé tirait avec lui la
   page entière, et ne s'éprouvait plus seul dans Node (`outils/essais/
   sejour.js`, par `parcours.mjs`). L'ambiance garde la décision et la pose
   ici (`poseTuiles`) ; tous lisent le tracé d'ici. Sans aucun import.
   ============================================================ */
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
/* Le vide entre deux tuiles : chacune se retire de vingt centimètres sur
   tout son tour. Un trait de la couleur du fond faisait le même vide sur un
   fond uni, mais se voyait comme un contour dès que le hall avait une autre
   couleur que ce fond — une image, un calque, une teinte de zone. Retirer la
   forme laisse passer ce qu'il y a dessous, quoi que ce soit. */
const RETRAIT = .2;
/** Les tuiles sont-elles posées ? L'ambiance le dit (`poseTuiles`). */
let tuiles = false;

/** Le rayon d'un coin de tuile, d'après les côtés qui s'y rejoignent. */
export const rayonTuile = (/** @type {number} */ a, /** @type {number} */ b) =>
  Math.min(RAYON, a / 3, b / 3);

/** Un anneau retiré de « g » vers l'intérieur : chaque côté glisse le long
 *  de sa normale, et chaque sommet va à la rencontre de ses deux côtés. */
function retire(/** @type {number[][]} */ pts, /** @type {number} */ g){
  let aire = 0;
  pts.forEach((p, i) => { const q = pts[(i + 1) % pts.length]; aire += p[0] * q[1] - q[0] * p[1]; });
  const sens = aire > 0 ? -1 : 1;           // vers l'intérieur
  const k = pts.length;
  const normale = (p, q) => { const dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1;
    return [sens * dy / l, -sens * dx / l]; };
  return pts.map((p, i) => {
    const n1 = normale(pts[(i + k - 1) % k], p), n2 = normale(p, pts[(i + 1) % k]);
    // un angle très aigu enverrait le sommet au loin : on le borne
    const f = g / Math.max(.25, 1 + n1[0] * n2[0] + n1[1] * n2[1]);
    return [p[0] + (n1[0] + n2[0]) * f, p[1] + (n1[1] + n2[1]) * f];
  });
}

function arrondi(/** @type {string} */ d){
  const an = anneaux(d);
  // rien d'arrondissable : le tracé reste, plutôt qu'une forme effacée
  if (!an || !an.length) return d;
  return an.map(brut => {
    const pts = retire(brut, RETRAIT);
    const vers = (p, q, r) => {
      const l = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
      return [f3(p[0] + (q[0] - p[0]) * r / l), f3(p[1] + (q[1] - p[1]) * r / l)];
    };
    const k = pts.length;
    const coins = pts.map((p, i) => {
      const av = pts[(i + k - 1) % k], ap = pts[(i + 1) % k];
      const r = rayonTuile(Math.hypot(p[0] - av[0], p[1] - av[1]), Math.hypot(p[0] - ap[0], p[1] - ap[1]));
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

/** Les tuiles sont-elles posées — pour qui trace un stand hors de `montePlan`. */
export const tuilesPosees = () => tuiles;

/** L'ambiance pose les tuiles, ou les retire (`ambiance.mjs` `appliqueAmbiance`). */
export function poseTuiles(/** @type {boolean} */ oui){ tuiles = oui; }
