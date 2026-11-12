/* ============================================================
   Du chemin en cases au trait qu'on suit

   A* rend une suite de cases ; le visiteur doit lire un trait. Ce module le
   réduit à ses sommets, le recentre dans l'allée, le lisse, le redresse et en
   retire les allers-retours — tout ce qui fait qu'un trajet calculé ressemble à
   un trajet qu'on marcherait. Il ne sait rien des emplacements ni des
   pavillons : `troncon.mjs` l'appelle sur chaque morceau.
   ============================================================ */
import { DEGAGEMENT, PAS_GRILLE, caseDe, centreCase, conf } from "./grille-marche.mjs";

/* ------------------------------------------------------------
   Du chemin en cases au trait qu'on suit
   ------------------------------------------------------------ */
/**
 * Le chemin, réduit à ses tournants.
 *
 * Les cases alignées se fondent en un segment, et rien d'autre n'est touché :
 * pas de fil tendu entre deux angles. C'était la version précédente, et c'est
 * elle qui produisait les diagonales — un fil tendu coupe les coins par
 * définition, y compris au milieu d'une allée qu'il fallait suivre droit.
 */
export function reduit(g, suite){
  const pts = [];
  for (let k = 0; k < suite.length; k++){
    const i = suite[k];
    // une case dont les deux voisines sont symétriques n'est pas un tournant
    if (k > 0 && k < suite.length - 1 && suite[k - 1] + suite[k + 1] === 2 * i) continue;
    pts.push(centreCase(g, i));
  }
  return pts;
}

/* Ce qu'on accepte entre le trait montré et le trajet calculé. Un peu plus
   d'une case : en deçà, l'escalier ne se laisse pas redresser ; au-delà, on
   raboterait des détours que le trajet fait pour de bonnes raisons. */
const LISSAGE = .5;   // mètres

/* Ce qu'on accepte de plus quand la corde passe au large.
   Le milieu d'une allée se déplace dès qu'un seul de ses bords recule — une
   zone ouverte, une rangée moins profonde — et le trait suivait ce
   déplacement par un angle, au beau milieu d'une allée que le visiteur voit
   droite. Or ce milieu-là n'a rien de sacré : ce qu'on lui demande, c'est de
   ne frôler personne. Là où la corde garde un mètre de chaque côté, elle vaut
   donc mieux que le milieu exact, et le trait reste droit.
   Un vrai virage n'y gagne rien : le sommet d'un carrefour s'écarte de sa
   corde de la moitié d'une allée, des mètres et non des centimètres. */
const LISSAGE_LARGE = 2.5;   // mètres
const AU_LARGE = 2;          // cases de marge, de part et d'autre

/* Jusqu'où l'on va chercher le bord de l'allée, de part et d'autre du trait.
   Au-delà ce n'est plus une allée mais une esplanade, et son milieu ne veut
   plus rien dire — on laisse alors le trajet où il passe. */
const DEMI_ALLEE = 4;   // mètres

/* Sur quelle longueur de trait se lisent la direction de l'allée et sa
   largeur. Une longueur de stand pour la direction : assez pour enjamber les
   marches de la grille, assez peu pour suivre une allée qui tourne. Deux fois
   plus pour la largeur, qui ne tourne pas : plus la lecture porte loin, mieux
   les bouches de stands y restent minoritaires. */
const CORDE_ALLEE = 3;     // mètres de trait, de part et d'autre
const PORTEE_LARGEUR = 6;

/* De combien la largeur lue peut s'écarter de celle de l'allée sans que ce
   soit une porte. Le dégagement referme déjà dans la grille tout ce qui est
   plus étroit qu'un passage : ce qui reste ouvert et recule de trois quarts
   de mètre au-delà de la façade est une bouche de stand ou une transversale,
   et non le bord dont on cherche le milieu. */
const ECART_LARGEUR = .75;   // mètres

/**
 * Sur quoi le trait se règle : l'inclinaison du hall, ou les allées.
 *
 * Les deux répondent à la même question par des bouts différents, et aucune
 * ne gagne partout. L'inclinaison du hall est une droite : le trajet en sort
 * net, d'équerre, avec le moins de sommets possible — c'est ce qu'on veut
 * partout où le pavillon est d'une seule venue, ce qui est le cas courant.
 * Les allées, elles, se suivent une à une : un hall arrondi, ou dont les
 * rangées ne s'accordent pas, y gagne un trait qui reste entre ses bordures,
 * au prix de quelques sommets de plus et d'un tracé parfois moins net.
 *
 * D'où le réglage plutôt qu'une règle : l'exploitant voit son plan, nous non.
 * Le hall par défaut — il convient à la majorité des salons, et c'est le
 * comportement que les plans déjà publiés connaissent.
 */
export const guidageAllees = () => (conf()["_guidage"] || {}).allees === true;

/**
 * Le trait ramené entre les bordures qui l'encadrent.
 *
 * La grille suit une orientation, une seule, et l'A* préfère les longues
 * lignes droites : dans un hall arrondi, dont les allées tournent d'un bout à
 * l'autre, il traverse donc l'allée en écharpe plutôt que de la suivre —
 * quarante mètres d'un trait qui entre par le milieu et ressort contre une
 * façade. Aucun redressement n'y peut rien : il n'y a pas d'escalier à
 * effacer, le trait est déjà droit, et c'est précisément le reproche.
 *
 * On le mesure donc là où le visiteur le mesure : entre les deux bordures. À
 * chaque demi-mètre on cherche le mur à droite et à gauche, en travers du
 * trait, et on pose le point à mi-distance. Les stands qui bordent l'allée
 * dictent ainsi le tracé, et un segment redevient parallèle à l'allée sans
 * qu'on ait eu à lui calculer d'angle : le milieu de deux façades parallèles
 * leur est parallèle.
 *
 * Encore faut-il mesurer en travers de l'allée, et non en travers de la
 * marche. Le trajet que rend la grille est un escalier, et pris segment par
 * segment sa perpendiculaire saute d'un quart de tour à chaque marche : le
 * décalage lu vers le nord se retrouvait mêlé au décalage lu vers l'est. La
 * direction se lit donc sur une corde d'une longueur de stand de part et
 * d'autre, qui enjambe les marches et donne l'inclinaison de l'allée
 * elle-même ; les décalages parlent alors tous de la même perpendiculaire.
 *
 * Et ce décalage s'applique tel quel, point par point. Il passait auparavant
 * par une médiane, pour ignorer l'interstice entre deux stands — mais c'est
 * justement le décalage qui oscille avec les marches, et le lisser revenait à
 * effacer la correction avec elles. Le réglage ne faisait alors rien,
 * précisément là où on l'avait demandé : sur une allée inclinée sur la grille,
 * la seule qui produise un escalier.
 *
 * L'interstice se tient autrement, et mieux : par la largeur de l'allée. Elle
 * ne bouge pas avec les marches, puisqu'elle se mesure en travers — sa médiane
 * sur deux longueurs de stand donne donc la largeur vraie, sans rien devoir au
 * tracé. Un échantillon qui lit sensiblement plus large ne lit pas une façade
 * mais une porte, et on l'écarte.
 *
 * Restent les deux façons de n'être pas dans une allée : un seul mur, ou
 * aucun. Ces passages-là — un carrefour, une esplanade, la bouche d'un stand —
 * ne s'annulent pas pour autant : le décalage s'y interpole entre les deux
 * rives, car le ramener à zéro rouvrait dans le trait une dent que le
 * redressement gardait ensuite pour un virage. Et un point ne se déplace que
 * là où il reste praticable, ce que la grille seule décide — en rognant le
 * décalage plutôt qu'en l'abandonnant, pour la même raison.
 *
 * Aux deux bouts, enfin, le décalage s'éteint sur une longueur de stand. Le
 * trait y part de la porte du stand, où l'amorce vient le prendre, et non du
 * milieu de l'allée : posé d'un coup dès le premier point, le décalage faisait
 * sortir le trait de biais, puis se reprendre — le petit crochet qu'on voyait
 * au départ et à l'arrivée. L'extinction a un second mérite : elle laisse les
 * deux extrémités exactement où le calcul les a mises, et c'est ce qui rend ce
 * recentrage identique dans les deux sens.
 */
export function recentre(g, pts){
  if (pts.length < 2) return pts;
  const pas = PAS_GRILLE / 2;
  const libre = (x, y) => { const i = caseDe(g, x, y); return i >= 0 && !g.mur[i]; };
  /* Jusqu'où le mur est-il, dans cette direction ? On avance par demi-cases :
     la grille ne connaît pas de bord plus fin que ça. */
  const jusquAuMur = (q, vx, vy) => {
    for (let d = pas; d <= DEMI_ALLEE; d += pas)
      if (!libre(q[0] + vx * d, q[1] + vy * d)) return d - pas;
    return DEMI_ALLEE;
  };

  // le trait échantillonné à la case, l'arrivée comprise
  const ech = [];
  for (let i = 0; i + 1 < pts.length; i++){
    const A = pts[i], B = pts[i + 1];
    const dx = B[0] - A[0], dy = B[1] - A[1], l = Math.hypot(dx, dy);
    if (!l) continue;
    const n = Math.max(1, Math.round(l / PAS_GRILLE));
    for (let k = 0; k < n; k++){
      const u = k / n;
      ech.push([A[0] + dx * u, A[1] + dy * u]);
    }
  }
  if (!ech.length) return pts;
  ech.push(pts[pts.length - 1].slice());

  const borne = (i) => ech[Math.min(ech.length - 1, Math.max(0, i))];
  const corde = Math.round(CORDE_ALLEE / PAS_GRILLE);
  // la perpendiculaire à l'allée, lue sur la corde et non sur la marche
  const norm = ech.map((q, i) => {
    const A = borne(i - corde), B = borne(i + corde);
    const dx = B[0] - A[0], dy = B[1] - A[1], l = Math.hypot(dx, dy);
    return l ? [-dy / l, dx / l] : null;
  });

  // les deux bordures, là où il y en a deux
  const bords = ech.map((q, i) => {
    const n = norm[i];
    if (!n) return null;
    const dp = jusquAuMur(q, n[0], n[1]), dm = jusquAuMur(q, -n[0], -n[1]);
    return dp >= DEMI_ALLEE || dm >= DEMI_ALLEE ? null : [dp, dm];
  });

  /* La largeur vraie de l'allée, par médiane, et le décalage de ceux qui la
     lisent : les autres regardent par une porte. */
  const portee = Math.round(PORTEE_LARGEUR / PAS_GRILLE);
  const ecart = bords.map((b, i) => {
    if (!b) return null;
    const f = [];
    for (let k = Math.max(0, i - portee); k <= Math.min(bords.length - 1, i + portee); k++)
      if (bords[k]) f.push(bords[k][0] + bords[k][1]);
    f.sort((x, y) => x - y);
    return Math.abs(b[0] + b[1] - f[f.length >> 1]) > ECART_LARGEUR ? null : (b[0] - b[1]) / 2;
  });

  // ce qui n'a pas été lu, interpolé entre les deux rives qui l'encadrent
  let rive = -1;
  for (let i = 0; i < ecart.length; i++){
    if (ecart[i] === null) continue;
    if (rive < 0) for (let k = 0; k < i; k++) ecart[k] = ecart[i];
    else for (let k = rive + 1; k < i; k++)
      ecart[k] = ecart[rive] + (ecart[i] - ecart[rive]) * (k - rive) / (i - rive);
    rive = i;
  }
  if (rive < 0) return pts;     // pas de bordure de bout en bout : rien à recentrer
  for (let k = rive + 1; k < ecart.length; k++) ecart[k] = ecart[rive];

  // éteint sur une longueur de stand à chaque bout
  const fondu = (i) => Math.min(1, i / corde, (ech.length - 1 - i) / corde);

  return ech.map((q, i) => {
    const n = norm[i];
    let e = n ? ecart[i] * fondu(i) : 0;
    while (e && !libre(q[0] + n[0] * e, q[1] + n[1] * e))
      e = Math.abs(e) <= pas ? 0 : e - (e > 0 ? pas : -pas);
    return e ? [q[0] + n[0] * e, q[1] + n[1] * e] : q;
  });
}

/** Le segment tient-il dans le passage, et s'y tient-il au large ? On
 *  l'échantillonne à la demi-case : plus fin ne dirait rien de plus, la grille
 *  n'en sait pas davantage. `marge` est le nombre de cases qu'on exige entre
 *  le trait et le mur le plus proche — zéro pour demander seulement qu'il
 *  passe. */
function passable(g, A, B, marge){
  const l = Math.hypot(B[0] - A[0], B[1] - A[1]);
  const n = Math.max(1, Math.ceil(l / (PAS_GRILLE / 2)));
  for (let k = 0; k <= n; k++){
    const u = k / n;
    const i = caseDe(g, A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u);
    if (i < 0 || g.mur[i]) return false;
    if (marge && g.marge[i] < marge) return false;
  }
  return true;
}

/**
 * L'escalier redressé en la droite qu'il dessinait.
 *
 * La grille suit l'orientation dominante du pavillon, ce qui suffit tant que
 * toutes les allées la partagent. Un hall arrondi n'en a pas : ses allées
 * tournent, et celles qui s'écartent de la dominante se descendent de nouveau
 * en marches d'une demi-case. Ces marches ne sont pas un trajet, ce sont les
 * arrondis de la grille — on les efface.
 *
 * On garde donc un sommet seulement quand le supprimer écarterait le trait de
 * plus d'une case du trajet calculé : les marches, qui tiennent dans cette
 * tolérance, se fondent en la droite que le visiteur marche vraiment, et le
 * virage d'un vrai carrefour, qui la dépasse de loin, reste. C'est ce qui
 * distingue ce redressement du fil tendu qu'on tirait autrefois : le fil
 * regardait la longueur et coupait donc les coins, celui-ci regarde l'écart
 * et n'en coupe aucun.
 *
 * La tolérance seule ne suffit pourtant pas à garantir qu'on passe : une allée
 * qui se rétrécit, un poteau au milieu, et la corde traverse ce que les
 * marches contournaient. Chaque raccourci est donc essayé sur la grille avant
 * d'être retenu.
 */
export function lisse(g, pts){
  if (pts.length < 3) return pts;
  const garde = new Uint8Array(pts.length);
  garde[0] = garde[pts.length - 1] = 1;
  // en pile plutôt qu'en récursion : un pavillon traversé fait des milliers
  // de sommets, et la pile d'appels n'est pas faite pour ça
  const restes = [[0, pts.length - 1]];
  while (restes.length){
    const [i, j] = restes.pop();
    if (j <= i + 1) continue;
    const A = pts[i], B = pts[j];
    const dx = B[0] - A[0], dy = B[1] - A[1], l = Math.hypot(dx, dy);
    let pire = -1, k = i + 1;
    for (let m = i + 1; m < j; m++){
      const e = l ? Math.abs((pts[m][0] - A[0]) * dy - (pts[m][1] - A[1]) * dx) / l
                  : Math.hypot(pts[m][0] - A[0], pts[m][1] - A[1]);
      if (e > pire){ pire = e; k = m; }
    }
    if (pire <= LISSAGE && passable(g, A, B)) continue;
    // ou davantage, si la corde tient l'allée sans frôler ses bords
    if (pire <= LISSAGE_LARGE && passable(g, A, B, AU_LARGE)) continue;
    garde[k] = 1;
    restes.push([i, k], [k, j]);
  }
  return pts.filter((q, i) => garde[i]);
}

export const longueur = (pts) => pts.reduce((s, q, i) =>
  i ? s + Math.hypot(q[0] - pts[i - 1][0], q[1] - pts[i - 1][1]) : 0, 0);

/**
 * Ce qu'on marche vraiment, l'intérieur des emplacements déduit.
 *
 * Le trait part du centre du stand, parce que c'est lui qu'on montre — mais
 * personne ne traverse un stand de son milieu à sa façade pour en sortir : on
 * y est déjà. Compter ces mètres gonflait chaque tronçon de la demi-profondeur
 * de ses deux emplacements, soit une dizaine de mètres par arrêt, et autant de
 * minutes de marche annoncées pour rien sur une journée de vingt visites.
 *
 * On retranche donc les deux amorces, chacune tant qu'elle reste chez elle.
 * On ne balaie que les extrémités : entre les deux, le trait est dans les
 * allées, et l'y chercher coûterait plus que ce qu'on en retirerait.
 */
export function longueurDehors(pts, chezD, chezA){
  let m = longueur(pts);
  if (!chezD && !chezA) return m;
  const ctx = document.createElement("canvas").getContext("2d");
  const dedans = (t, q) => ctx.isPointInPath(t, q[0], q[1]);
  /* Depuis un bout, on avance par petits pas et on décompte tant qu'on est
     dans l'emplacement. Le premier pas dehors arrête le décompte : un trait
     qui y rentrerait de nouveau plus loin serait un trajet, pas une amorce. */
  const rogne = (suite, d) => {
    if (!d) return 0;
    const t = new Path2D(d);
    let ote = 0;
    for (let i = 0; i + 1 < suite.length; i++){
      const A = suite[i], B = suite[i + 1];
      const l = Math.hypot(B[0] - A[0], B[1] - A[1]);
      const n = Math.max(1, Math.ceil(l / (PAS_GRILLE / 2)));
      for (let k = 0; k < n; k++){
        const u = (k + .5) / n;
        if (!dedans(t, [A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u])) return ote;
        ote += l / n;
      }
    }
    return ote;
  };
  m -= rogne(pts, chezD);
  m -= rogne(pts.slice().reverse(), chezA);
  return Math.max(0, m);
}

/**
 * Deux sommets à cinq centimètres l'un de l'autre ne sont qu'un — et un
 * sommet sur lequel le trait rebrousse chemin n'en est pas un.
 *
 * Le coude de l'amorce se pose au droit du stand ; le trajet, lui, touche
 * l'allée là où la façade s'ouvre, et les deux tombent rarement au même
 * endroit. Le trait remontait donc l'allée jusqu'au bout du trajet, puis
 * revenait sur ses pas jusqu'au coude : le retour se superpose à l'aller et
 * ne se voit pas, mais le dépassement, lui, se voit — un petit T au bout de
 * l'itinéraire. On retire donc le sommet sur lequel on rebrousse : le trait
 * s'arrête là où il tourne, et le compte des mètres cesse de payer deux fois
 * un aller-retour que personne ne marche.
 */
export function nettoie(pts){
  const out = [];
  for (const q of pts){
    const p = out[out.length - 1];
    if (!p || Math.hypot(q[0] - p[0], q[1] - p[1]) > .05) out.push(q);
  }
  for (let i = 1; i + 1 < out.length; i++){
    const a = out[i - 1], b = out[i], c = out[i + 1];
    const ux = b[0] - a[0], uy = b[1] - a[1], vx = c[0] - b[0], vy = c[1] - b[1];
    const lu = Math.hypot(ux, uy), lv = Math.hypot(vx, vy);
    if (!lu || !lv) continue;
    // pointu ne suffit pas : un carrefour se prend à angle droit
    if ((ux * vx + uy * vy) / (lu * lv) > -.5) continue;
    /* Ce qui distingue l'aller-retour du demi-tour, c'est l'écart entre les
       deux branches, et non l'angle qu'elles font : un demi-tour d'allée à
       allée garde toujours la largeur de l'allée entre l'aller et le retour,
       là où l'aller-retour se replie sur lui-même. On ne regardait ce repli
       qu'exactement plat, à un millième près ; le trait n'y tombe presque
       jamais — le recentrage et le redressement le penchent toujours un peu —
       et il restait donc des crochets de quinze degrés d'écart. On mesure
       maintenant de combien la branche courte s'écarte de la longue : en deçà
       de ce que le dégagement laisse à un passage, les deux branches ne sont
       pas deux façons de se croiser, c'est une seule ligne dessinée deux fois. */
    const loin = lu <= lv ? a : c;
    const dx = lu <= lv ? vx : ux, dy = lu <= lv ? vy : uy;
    const ecart = Math.abs((loin[0] - b[0]) * dy - (loin[1] - b[1]) * dx) / Math.max(lu, lv);
    if (ecart > 2 * DEGAGEMENT) continue;
    out.splice(i, 1);
    i = Math.max(0, i - 2);
  }
  return out;
}
