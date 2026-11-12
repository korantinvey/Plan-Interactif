/* ============================================================
   Le tronçon — d'un point à un autre dans un même pavillon

   Par où l'on entre dans un emplacement (ses faces libres, l'amorce qui y
   mène), quels couples d'entrées essayer, et le tronçon lui-même : la grille,
   la foule, la recherche, le trait, assemblés pour un départ et une arrivée.
   Un trajet d'un plan à l'autre (`trajet.mjs`) n'est qu'une suite de
   tronçons.
   ============================================================ */
import {
  DEGAGEMENT, DEGAGEMENT_PMR, PAS_GRILLE, accroche, caseDe, centreCase,
  grille, sommets, zoneTraversee, zonesDuTerrain
} from "./grille-marche.mjs";
import { cherche, distancesMulti } from "./recherche-chemin.mjs";
import { bilanFoule, foule, sallesEnMouvement } from "./abords-salles.mjs";
import { guidageAllees, lisse, longueurDehors, nettoie, recentre, reduit } from "./trait-chemin.mjs";

/**
 * Les faces libres d'un emplacement : les portions qu'aucun voisin ne borde.
 *
 * Un stand de rangée est mitoyen sur trois côtés et n'ouvre que sur le
 * quatrième. Le déduire du pavage ne marchait qu'à moitié : entre deux stands
 * serrés, le dégagement des deux se rejoint et tout devient mur, si bien qu'on
 * ne distinguait plus une façade fermée d'un passage trop étroit. On lit donc
 * la géométrie plutôt que la grille — on échantillonne juste devant chaque
 * côté, et un côté sur lequel un autre emplacement se referme est mitoyen.
 *
 * Le résultat se garde : une emprise ne bouge qu'en administration, et une
 * journée de vingt arrêts redemanderait vingt fois les mêmes façades.
 */
const FACES = new Map();
export function oublieFaces(){ FACES.clear(); }

function facesLibres(p, o){
  const cle = p.id + "|" + o.id;
  const garde = FACES.get(cle);
  if (garde) return garde;

  const s = sommets(o);
  const ctx = document.createElement("canvas").getContext("2d");
  const moi = new Path2D(o.d);
  /* On ne compare qu'au voisinage : cinq cents emprises passées en revue pour
     chaque façade coûteraient plus que tout le reste du tronçon. */
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  s.forEach(q => { x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]);
                   y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); });
  /* Une zone qu'on traverse ne ferme aucune façade : on marche dessus, et le
     stand qu'elle longe s'ouvre par là comme sur une allée. Seul ce qui barre
     compte comme voisin. */
  const pres = [];
  for (const v of p.stands.concat(zonesDuTerrain(p).filter(z => !zoneTraversee(z)))){
    if (v === o || v.id === o.id || !v.d) continue;
    const c = v.lc || v.c;
    if (!c || c[0] < x0 - 40 || c[0] > x1 + 40 || c[1] < y0 - 40 || c[1] > y1 + 40) continue;
    pres.push(new Path2D(v.d));
  }

  const out = [];
  for (let i = 0; i + 1 < s.length; i++){
    const A = s[i], B = s[i + 1];
    const l = Math.hypot(B[0] - A[0], B[1] - A[1]);
    if (l < .8) continue;                    // un chanfrein n'est pas une façade
    // la normale qui sort : celle dont un pas ne retombe pas dans l'emprise
    let ux = -(B[1] - A[1]) / l, uy = (B[0] - A[0]) / l;
    const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2;
    if (ctx.isPointInPath(moi, mx + ux * .05, my + uy * .05)){ ux = -ux; uy = -uy; }
    /* On relève le côté pas à pas plutôt que d'en juger d'un bloc. Cinq
       points et un verdict unique suffisent à un stand, dont les côtés font
       quelques mètres ; une zone en fait quarante, bordée de stands sur toute
       sa longueur sauf aux deux passages qu'on y a laissés — et ces
       passages-là sont précisément ce par quoi on y entre. Le côté entier
       était déclaré mitoyen, la zone n'ouvrait plus que par le bout resté
       vide, et le trajet en faisait le tour pour la traverser ensuite de part
       en part. Chaque portion libre est donc une façade à elle seule — et un
       côté que rien ne borde n'en rend qu'une, la sienne, dont le milieu est
       celui qu'on relevait déjà. */
    const pas = PAS_GRILLE / 2;
    const n = Math.max(1, Math.round(l / pas));
    let debut = -1;
    const pose = (a, b) => {
      // une ouverture plus étroite que le passage n'en est pas une
      if (b - a < 2 * DEGAGEMENT) return;
      const u = (a + b) / 2 / l;
      out.push({ mid: [A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u],
                 u: [ux, uy], l: b - a });
    };
    for (let k = 0; k <= n; k++){
      const u = k / n;
      const x = A[0] + (B[0] - A[0]) * u + ux * .3, y = A[1] + (B[1] - A[1]) * u + uy * .3;
      const pris = pres.some(t => ctx.isPointInPath(t, x, y));
      if (!pris && debut < 0) debut = u * l;
      else if (pris && debut >= 0){ pose(debut, u * l); debut = -1; }
    }
    if (debut >= 0) pose(debut, l);
  }
  FACES.set(cle, out);
  return out;
}

/* Au-delà, l'amorce n'est plus un pas hors du stand mais un trajet en soi :
   la relier d'un trait reste alors plus lisible que de la couder. */
const AMORCE_MAX = 20;   // mètres

/**
 * L'amorce : du stand à l'allée.
 *
 * Le trajet part du centre du stand désigné — c'est lui qu'on montre — et
 * rejoint l'allée. Relier les deux d'un trait donnait une oblique, seul trait
 * de travers d'un tracé par ailleurs d'équerre. On la coude donc.
 *
 * Reste à savoir dans quel ordre. On sortait d'abord parallèlement à l'allée,
 * puis on la rejoignait de biais : c'est-à-dire qu'on longeait l'intérieur du
 * stand sur toute sa profondeur avant d'en franchir la façade. Quand le point
 * d'accroche tombait au-delà de l'emplacement — ce qui est le cas ordinaire
 * d'un stand d'angle — le trait dessinait un crochet au milieu de la surface,
 * puis ressortait par le côté.
 *
 * On fait donc l'inverse, qui est aussi ce qu'un visiteur fait : on quitte
 * l'emplacement **droit par sa face la plus proche**, perpendiculairement, et
 * c'est une fois dans l'allée qu'on la remonte. Un seul coude, dehors, et le
 * trait n'entre jamais de travers.
 *
 * Où poser le coude, en revanche, ne se devine pas : c'est là où la façade du
 * stand rencontre l'allée. On croise donc les deux droites — celle qui part du
 * centre en franchissant la façade, celle que suit le trajet — et le coude est
 * leur intersection. Un quart de tour ne s'y suppose nulle part, ce qui vaut
 * mieux : l'allée d'un hall arrondi n'en fait pas.
 *
 * Rend le coude à insérer, ou rien s'il n'y a pas lieu d'en poser un.
 */
function amorce(pts, ancre, sortie){
  if (pts.length < 2) return [];
  const a = pts[0], b = pts[1];
  const lu = Math.hypot(b[0] - a[0], b[1] - a[1]);
  if (!lu) return [];
  const u = [(b[0] - a[0]) / lu, (b[1] - a[1]) / lu];
  /* À défaut de face libre connue — un repère, un point désigné du doigt — on
     retombe sur l'orientation de l'allée : on en sort par le travers. */
  const f = sortie || [-u[1], u[0]];
  const den = f[0] * u[1] - f[1] * u[0];
  // on sort dans l'axe de l'allée : il n'y a alors pas de coude à poser
  if (Math.abs(den) < 1e-6) return [];
  const t = ((a[0] - ancre[0]) * u[1] - (a[1] - ancre[1]) * u[0]) / den;
  // l'allée est derrière la façade par laquelle on sort : le coude serait un
  // crochet de l'autre côté du stand, mieux vaut le trait direct
  if (t < 0) return [];
  const coude = [ancre[0] + f[0] * t, ancre[1] + f[1] * t];
  const l1 = Math.hypot(coude[0] - ancre[0], coude[1] - ancre[1]);
  const l2 = Math.hypot(a[0] - coude[0], a[1] - coude[1]);
  if (l1 > AMORCE_MAX || l2 > AMORCE_MAX) return [];
  return [coude];
}

/**
 * Par quelle face on quitte un emplacement.
 *
 * Celle qui n'est pas mitoyenne — et, s'il y en a plusieurs, la plus proche de
 * l'allée qu'on rejoint. C'est ce qui fait sortir un stand de rangée par son
 * unique côté ouvert, et non par le voisin qui se trouvait dans l'axe. Rend la
 * normale par laquelle on s'en va — telle quelle, sans la ramener à un quart
 * de tour : c'est elle qui donne son angle au coude de l'amorce, et un stand
 * de hall arrondi n'est pas posé d'équerre. Rien si l'emplacement n'ouvre
 * nulle part : l'accroche a alors déjà dû s'autoriser à passer par le voisin,
 * et l'amorce n'a plus de face à respecter.
 */
function faceDeSortie(p, obj, ancre){
  if (!obj || !obj.d) return null;
  const libres = facesLibres(p, obj);
  let mieux = null, d = Infinity;
  for (const f of libres){
    const q = Math.hypot(f.mid[0] - ancre[0], f.mid[1] - ancre[1]);
    if (q < d){ d = q; mieux = f; }
  }
  return mieux ? mieux.u.slice() : null;
}

/**
 * Par où l'on entre dans un emplacement, et par où l'on en sort.
 *
 * On s'accrochait au centre du stand : l'anneau rendait la première allée
 * rencontrée en s'écartant du milieu, c'est-à-dire la face la plus proche du
 * barycentre — pas celle par laquelle on arrive. Un stand plus large que
 * profond, abordé par l'allée qui longe son petit côté, se voyait ainsi
 * entrer par le haut, quitte à contourner tout l'emplacement pour cela.
 *
 * On énumère donc les entrées plutôt qu'on n'en devine une : le milieu de
 * chaque face non mitoyenne — c'est là qu'un visiteur franchit un stand
 * ouvert — décalé d'un pas dans l'allée pour tomber hors du dégagement. Le
 * choix entre elles ne se fait pas ici : il revient au trajet, qui garde la
 * plus courte (`troncon`).
 *
 * Un emplacement sans face libre — enclavé, ou dont le dégagement mange le
 * seul passage — retombe sur l'accroche depuis son centre, qui sait relâcher
 * la règle plutôt que de rendre la main.
 */
/**
 * Peut-on rejoindre cet accès depuis le point montré ?
 *
 * Le trait qui les relie est tiré droit, et c'est voulu : il fait partir le
 * trajet du stand et non de l'allée devant lui. Il traverse donc un mur — le
 * sien —, ce qui ne se remarque pas sur six mètres d'emplacement. Sur une
 * zone de quarante, la même droite coupait par le voisin : elle entrait bien
 * par le passage laissé entre deux stands, mais en tranchant l'angle de celui
 * qui le borde. Un visiteur ne traverse pas un stand, il en fait le tour.
 *
 * On ne garde donc un accès que si ce trait n'entre dans aucun autre
 * emplacement, et ne coupe aucune cloison tracée — pas même une posée chez
 * celui qu'on dessert, comme la cloison basse au fond d'un restaurant, que le
 * trait franchissait au motif qu'elle était chez lui. Les autres accès ne sont
 * pas des façades : le trajet passera par celle d'à côté, quitte à contourner.
 */
function raccordTient(g, p, obj, xy, c){
  if (!p || !obj || !obj.d) return true;
  const B = centreCase(g, c);
  const ctx = document.createElement("canvas").getContext("2d");
  /* Ce qu'on regarde, ce sont les contours, non la grille : le dégagement d'un
     voisin déborde sur l'allée qu'on longe, et l'interdire fermerait tout
     passage un peu serré. Frôler est permis ; entrer, non. */
  const x0 = Math.min(xy[0], B[0]) - 5, x1 = Math.max(xy[0], B[0]) + 5;
  const y0 = Math.min(xy[1], B[1]) - 5, y1 = Math.max(xy[1], B[1]) + 5;
  const autres = [];
  for (const v of p.stands.concat(zonesDuTerrain(p).filter(z => !zoneTraversee(z)))){
    if (v === obj || v.id === obj.id || !v.d) continue;
    const c2 = v.lc || v.c;
    if (!c2 || c2[0] < x0 - 40 || c2[0] > x1 + 40 || c2[1] < y0 - 40 || c2[1] > y1 + 40) continue;
    autres.push(new Path2D(v.d));
  }
  const l = Math.hypot(B[0] - xy[0], B[1] - xy[1]);
  const n = Math.max(1, Math.ceil(l / (PAS_GRILLE / 2)));
  for (let k = 0; k <= n; k++){
    const u = k / n;
    const x = xy[0] + (B[0] - xy[0]) * u, y = xy[1] + (B[1] - xy[1]) * u;
    const i = caseDe(g, x, y);
    if (i < 0) return false;
    // une cloison tracée ne se franchit pas, même posée chez celui qu'on dessert
    if (g.cloisons && g.cloisons[i]) return false;
    if (autres.some(t => ctx.isPointInPath(t, x, y))) return false;
  }
  return true;
}

function accesDe(g, p, obj, xy){
  const d = obj && obj.d;
  const out = [];
  const vus = new Set();
  if (p && d){
    const pas = PAS_GRILLE + (g.pmr ? DEGAGEMENT_PMR : DEGAGEMENT);
    for (const f of facesLibres(p, obj)){
      const c = accroche(g, p, [f.mid[0] + f.u[0] * pas, f.mid[1] + f.u[1] * pas], d);
      if (c >= 0 && g.nappe[c] && !vus.has(c)){ vus.add(c); out.push(c); }
    }
    /* Une seule façade se garde telle quelle : l'écarter rendrait
       l'emplacement injoignable, et un trait qui coupe se voit et se
       comprend là où l'absence de trajet ne s'explique pas. */
    if (out.length > 1){
      const tiennent = out.filter(c => raccordTient(g, p, obj, xy, c));
      if (tiennent.length) return tiennent;
    }
  }
  if (!out.length){
    const c = accroche(g, p, xy, d);
    if (c >= 0) out.push(c);
  }
  return out;
}

/* Combien de couples d'entrées on trace avant de trancher. Le balayage les
   classe sur la longueur d'allée seule ; l'A*, lui, paie aussi les virages et
   le milieu de l'allée, et peut préférer un détour droit à un zigzag plus
   court. Les deux ne s'accordent donc pas toujours, et le premier couple
   n'est pas toujours celui qui rend le trait le plus court. Trois suffisent :
   au-delà, on retrace des façades que le balayage a déjà mises loin derrière. */
const ESSAIS_ACCES = 3;

/**
 * Les couples entrée-sortie à essayer.
 *
 * Tracer chaque entrée contre chaque sortie ferait jusqu'à seize A* pour un
 * seul tronçon. Un balayage depuis toutes les sorties à la fois donne, pour
 * chaque entrée, la distance à la plus proche d'entre elles — et laquelle :
 * le classement des couples se lit alors d'un seul parcours du pavillon, et
 * l'A* n'est payé que sur les premiers.
 *
 * Mais classer depuis un seul bout ne dit pas la même chose selon le bout
 * qu'on prend : un stand de rangée n'ouvre que d'un côté, un stand d'angle de
 * trois, et les trois faces retenues depuis l'un ne sont pas les trois faces
 * retenues depuis l'autre. Un aller et son retour s'essayaient donc sur des
 * couples différents, et rendaient deux trajets différents — jusqu'à seize
 * mètres d'écart sur les plans d'essai, ce qu'aucun visiteur ne peut
 * comprendre. On balaie donc des deux bouts et on réunit les couples, puis on
 * les range par numéro de case : la liste est alors la même dans les deux
 * sens, jusque dans son ordre.
 */
function couplesAcces(g, A, B){
  if (A.length === 1 && B.length === 1) return [[A[0], B[0]]];
  const couples = new Map();
  const depuis = (X, Y, retourne) => {
    const bal = distancesMulti(g, Y);
    X.filter(c => c >= 0 && bal.d[c] >= 0)
     .sort((x, y) => bal.d[x] - bal.d[y] || x - y)
     .slice(0, ESSAIS_ACCES)
     .forEach(c => {
       const couple = retourne ? [Y[bal.src[c]], c] : [c, Y[bal.src[c]]];
       couples.set(couple[0] + ":" + couple[1], couple);
     });
  };
  depuis(A, B, false);
  depuis(B, A, true);
  return [...couples.values()].sort((x, y) => x[0] - y[0] || x[1] - y[1]);
}

/**
 * Un tronçon dans un pavillon, de point à point.
 *
 * Les vrais points sont raccrochés aux extrémités : le trait doit partir du
 * stand, pas de l'allée devant lui, sinon il paraît commencer à côté.
 *
 * Des couples d'entrées proposés on garde celui dont le trait, une fois tracé
 * et les amorces posées, est le plus court : c'est la seule mesure qui soit
 * celle du visiteur.
 *
 * Le trait est tracé dans un sens convenu — celui des numéros de case — et
 * retourné ensuite s'il le faut. À coût égal la grille offre mille chemins, et
 * celui qu'A* rend dépend de la case d'où il part : sans cette convention, le
 * retour ne repassait pas par où l'aller était passé.
 */
export function troncon(p, pmr, depart, arrivee, objD, objA){
  const g = grille(p, pmr);
  const dD = objD && objD.d, dA = objA && objA.d;
  const A = accesDe(g, p, objD, depart), B = accesDe(g, p, objA, arrivee);
  if (!A.length || !B.length) return null;
  /* La foule d'une sortie de conférence ne gêne que le fauteuil, et pas celui
     qui va justement à la conférence : les deux bouts du tronçon sont exempts. */
  const exempts = new Set([objD, objA].filter(Boolean).map(o => String(o.id)));
  const f = pmr ? foule(p, pmr, sallesEnMouvement(p, exempts)) : null;
  /** @type {{ genre: string, p: any, pts: any[], m: number, foule?: any } | null} */
  let mieux = null;
  let retenu = null;
  for (const [a, b] of couplesAcces(g, A, B)){
    const retourne = a > b;
    let suite = cherche(g, retourne ? b : a, retourne ? a : b, f && f.peine);
    if (!suite) continue;
    const brut = reduit(g, suite);
    let chemin = lisse(g, guidageAllees() ? recentre(g, brut) : brut);
    if (retourne){ suite = suite.slice().reverse(); chemin = chemin.reverse(); }
    const envers = chemin.slice().reverse();
    const pts = nettoie([depart.slice()]
      .concat(amorce(chemin, depart, faceDeSortie(p, objD, chemin[0])), chemin,
              amorce(envers, arrivee, faceDeSortie(p, objA, envers[0])),
              [arrivee.slice()]));
    const m = longueurDehors(pts, dD, dA);
    if (!mieux || m < mieux.m){
      mieux = { genre: "marche", p: p.i, pts: pts, m: m };
      retenu = { a: a, b: b, suite: suite };
    }
  }
  if (mieux && f) mieux.foule = bilanFoule(g, f, retenu.a, retenu.b, retenu.suite);
  return mieux;
}
