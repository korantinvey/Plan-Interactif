/* ============================================================
   La grille de marche — le sol d'un pavillon, case par case

   Le socle du calcul de l'itinéraire (`itineraire.mjs`) : ce qu'il reçoit de
   la page, ses constantes, l'enveloppe du hall, le rôle que l'exploitant donne
   aux calques, la grille elle-même — ce qui se marche, ce qui barre, la marge
   au mur — et le raccrochage d'un point à la case marchable la plus proche.

   Le calcul lit les réglages (`CONF`), les calques de dessin (`DESSINS`), et
   ce que le parcours et la journée savent des conférences, sans les importer :
   `tiroir-itineraire.mjs` les lui injecte en se chargeant, par
   `brancheItineraire`. Ils s'injectent plutôt qu'ils ne s'importent : leurs
   modules lisent la page et son adresse, ce que les essais menés dans Node
   n'ont pas. Le tracé d'une forme et ce qu'un repère est, des lectures pures,
   s'importent (`chemin-forme.mjs`, `reperes.mjs`).

   Ce module ne dépend d'aucun autre de l'itinéraire ; tous dépendent de lui.
   ============================================================ */
import { cheminForme } from "./chemin-forme.mjs";

/* Ce que `tiroir-itineraire.mjs` confie, et rien avant qu'il l'ait fait : un appel
   arrivé trop tôt doit échouer bruyamment plutôt que de rendre un trajet faux. */
/** @type {Record<string, any>} */
let dependances = {};

/**
 * Le branchement, appelé par `tiroir-itineraire.mjs` en se chargeant (et
 * par les essais dans Node).
 *
 * `conf` et `dessins` sont des lecteurs, non des valeurs : l'ouverture d'un
 * salon remplace l'un et l'autre, et le calcul doit lire ceux du moment.
 *
 * @param {{ conf: () => any, dessins: () => any, instantConf: Function, finInstant: Function }} b
 */
export function brancheItineraire(b){ dependances = b; }

export const conf = () => dependances.conf();
export const instantConf = (c) => dependances.instantConf(c);
export const finInstant = (c) => dependances.finInstant(c);

/**
 * Un visiteur cherche le G77 ; il est devant le E10 et n'a aucune idée du
 * chemin. Son téléphone ne l'aidera pas : sous une charpente métallique le
 * GPS ne situe rien, et poser des balises dans les allées demanderait un
 * budget et une pose que personne n'a. On ne lui demande donc pas où il est —
 * il désigne son départ comme il désigne son arrivée, dans la même liste que
 * la recherche.
 *
 * Reste à trouver le chemin. Les données ne décrivent aucune allée : elles ne
 * donnent que des emplacements. L'allée, c'est ce qui reste — le vide entre
 * les stands. On la calcule donc en creux : le hall est pavé de cases d'un
 * demi-mètre, on noircit ce que les stands occupent, et on cherche la suite
 * de cases blanches la plus courte entre deux points.
 *
 * Ce détour par la grille a un mérite qui vaut à lui seul le calcul : le mode
 * PMR y devient presque gratuit. Un escalier, une pente, un passage trop
 * étroit se noircissent comme un stand, et la même recherche rend un autre
 * chemin — ou dit franchement qu'il n'y en a pas.
 */

/* Un demi-mètre par case : plus fin, la grille d'un pavillon dépasse le
   million de cases pour un tracé qui ne change plus ; plus grossier, une
   allée de deux mètres se referme. */
export const PAS_GRILLE = .5;

/* Ce qu'on écarte des stands. Le chemin est calculé pour un point sans
   épaisseur : on épaissit donc les obstacles de la moitié du passage
   nécessaire. Quatre-vingt-dix centimètres pour un marcheur ; un mètre
   quarante en mode accessible, la largeur qu'exige un fauteuil roulant pour
   circuler et se croiser. Un couloir plus étroit disparaît de la grille, et
   le trajet passe ailleurs — c'est l'essentiel de ce que « PMR » change. */
export const DEGAGEMENT = .45;
export const DEGAGEMENT_PMR = .70;

/* Allure de salon, arrêts non compris : on marche moins vite entre deux
   allées pleines que sur un trottoir. */
export const ALLURE = 1.1;        // m/s
export const ALLURE_PMR = .8;

/**
 * Ce que coûte un virage, en cases.
 *
 * Entre deux points d'une allée, une grille offre des milliers de chemins de
 * même longueur : tout escalier de marches horizontales et verticales vaut la
 * diagonale qu'il approche. Sans prix du virage, A* en choisit un au hasard,
 * et le trajet traverse l'allée en biais au lieu de la suivre. À quatre cases
 * — deux mètres — un crochet ne se justifie plus que s'il fait gagner
 * davantage, et les tronçons redeviennent de longues lignes droites.
 */
export const TOURNANT = 4;

/**
 * De quoi préférer le milieu de l'allée à ses bords.
 *
 * La pénalité s'éteint à deux mètres du mur le plus proche : au-delà — dans
 * une aire dégagée, une entrée, un carrefour — aucun « milieu » n'a de sens,
 * et vouloir le tenir ferait faire des détours pour rien.
 *
 * Elle se compte sur ce que l'allée offre, et non sur la distance au mur
 * elle-même. La nuance décide plus que le choix d'une file : comptée sur la
 * distance au mur, toute case d'une allée étroite est en faute, du premier
 * mètre au dernier — aucune n'y atteint jamais les deux mètres. La pénalité
 * cessait alors d'être un prix de bord pour devenir un prix de passage, et
 * comme elle se paie à la case, elle multipliait la longueur des allées
 * étroites : le trajet faisait le tour du hall par les larges plutôt que de
 * traverser. Sur les trajets d'essai, trois pour cent et demi de trop en tout,
 * et jusqu'à cinquante-cinq mètres sur un seul — un détour que personne ne
 * s'explique en le voyant.
 *
 * On compare donc chaque case à la crête de son allée — la marge qu'on
 * atteindrait en remontant la pente depuis elle, ce que `versLeMilieu` fait
 * déjà pour un point. Au milieu d'une allée étroite, la case est à sa crête et
 * ne doit rien ; contre une façade dans une allée large, elle doit tout. Le
 * prix redevient ce qu'il devait être : un choix de file, et non de route.
 */
export const PORTEE_CENTRE = 4;   // cases
/* Deux plutôt qu'une demie. Le prix du virage est de quatre cases : passer du
   bord au milieu en coûte deux, et il faut donc que la traversée se rembourse
   sur une longueur raisonnable d'allée. À une demie, l'écart entre le bord et
   le milieu valait un quart de case, soit seize mètres de ligne droite avant
   d'être rentable — le trait longeait les stands d'un bout à l'autre du hall.
   À deux, quatre mètres suffisent. */
export const POIDS_CENTRE = 2;

/* ------------------------------------------------------------
   L'enveloppe du hall
   ------------------------------------------------------------ */
/**
 * L'emprise d'un pavillon est une boîte : elle déborde d'une douzaine de
 * mètres autour des stands, et rien n'y empêcherait un trajet de contourner
 * le hall par l'extérieur — derrière les stands de périphérie, là où il n'y a
 * que le mur. On borne donc la marche à l'enveloppe convexe des emplacements
 * eux-mêmes : les stands du pourtour en dessinent le bord, et on ne passe
 * plus derrière eux.
 *
 * Le fond de plan porterait les vrais murs, mais mêlés aux cotes, aux
 * hachures et au mobilier : les lire découperait le hall en morceaux au lieu
 * de le fermer.
 */
export function sommets(o){
  const n = String(o.d).match(/-?\d*\.?\d+/g) || [];
  const l = [];
  for (let i = 0; i + 1 < n.length; i += 2) l.push([+n[i], +n[i + 1]]);
  return l;
}

/**
 * Enveloppe convexe, parcours monotone d'Andrew.
 *
 * Gardée sur le pavillon lui-même, et non dans une table à côté rangée par
 * identifiant. Elle ne dépend que des emplacements et des zones, que rien ne
 * retouche en cours de visite : `oublieGrilles`, qui périme tout ce qui
 * s'appuie sur les dessins, n'a donc pas à la jeter — la recalculer à chaque
 * trait tracé coûterait un tri de tous les sommets du pavillon pour rendre le
 * même contour. Mais ce qui la périmerait vraiment, c'est un jeu de données
 * remplacé ; et une table rangée par identifiant aurait alors resservi
 * l'enveloppe de l'ancien sous le nom du nouveau. Posée sur l'objet, elle s'en
 * va avec lui, et il n'y a plus d'oubli à ne pas oublier.
 */
export function enveloppe(p){
  const garde = p.enveloppe;
  if (garde) return garde;
  const pts = [];
  for (const o of p.stands) pts.push(...sommets(o));
  for (const o of zonesDuTerrain(p)) pts.push(...sommets(o));
  pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cote = (suite) => {
    const r = [];
    for (const q of suite){
      while (r.length > 1){
        const a = r[r.length - 2], b = r[r.length - 1];
        if ((b[0] - a[0]) * (q[1] - a[1]) - (b[1] - a[1]) * (q[0] - a[0]) > 0) break;
        r.pop();
      }
      r.push(q);
    }
    r.pop();
    return r;
  };
  let bord = pts.length < 3 ? [] : cote(pts).concat(cote(pts.slice().reverse()));
  /* Un pavillon sans emplacement — cela existe, le temps d'une première
     synchronisation — n'a pas d'enveloppe : on retombe sur son emprise, à
     défaut de mieux. */
  if (bord.length < 3){
    const e = p.emprise;
    bord = [[e.x0, e.y0], [e.x1, e.y0], [e.x1, e.y1], [e.x0, e.y1]];
  }
  const t = new Path2D();
  bord.forEach((q, i) => i ? t.lineTo(q[0], q[1]) : t.moveTo(q[0], q[1]));
  t.closePath();
  p.enveloppe = t;
  return t;
}

/* ------------------------------------------------------------
   La grille de marche
   ------------------------------------------------------------ */
/* Une grille par pavillon et par mode : elle ne dépend que des emplacements
   et des obstacles dessinés, qui ne bougent qu'en administration. */
const GRILLES = new Map();
/* Ce que la grille garde, et que `itineraire.mjs` `oublieGrilles` vide avec le reste. */
export function oublieGrillesDeMarche(){ GRILLES.clear(); ANGLES.clear(); }

/** Les calques de dessin d'un pavillon quelconque, pas seulement l'affiché. */
export const calquesDe = (p) => {
  const D = dependances.dessins();
  return (typeof D === "object" && D[p.id]) || [];
};

/** Les repères posés sur les calques montrés d'un pavillon.
 *  Un calque masqué ne compte pas : le trajet doit s'expliquer par ce qu'on
 *  voit, et contourner un obstacle invisible passerait pour un bogue. */
export function reperesDe(p){
  const l = [];
  for (const c of calquesDe(p)){
    if (c.visible === false) continue;
    for (const f of c.formes || []) if (f.t === "repere" && f.txt) l.push(f);
  }
  return l;
}

/* ------------------------------------------------------------
   Ce que l'exploitant déclare : où l'on marche, ce qui barre
   ------------------------------------------------------------ */
/**
 * Un bloc sanitaire, un local technique, une estrade : rien de cela n'est un
 * stand, et rien n'en ressort des données. Cela vit dans le fond de plan, que
 * le calcul ignore — d'où des trajets qui traversaient les WC.
 *
 * On a d'abord voulu lire ce fond. Il est bien rangé en sous-calques nommés —
 * « 5-SANITAIRES », « INFOPRO_SURFACE_POTEAUX » — mais ces noms sont ceux du
 * bureau d'études qui a produit le DWG, et ils changent d'un salon à l'autre :
 * ce qui marche pour trois pavillons ne s'industrialise pas. Le dessin est un
 * export de traits, où murs, cotes et hachures se ressemblent ; deviner y
 * revient à parier.
 *
 * On demande donc, plutôt que de deviner. Un calque de dessin reçoit un rôle,
 * et tout ce qu'on y trace le porte :
 *
 *   obstacle         ce qui est dessiné barre le passage à tout le monde
 *   pmr              il ne le barre qu'en itinéraire accessible
 *   circulation-pmr  il le barre sauf en itinéraire accessible
 *   circulation      ce qui est dessiné dit où l'on peut marcher ; tout le
 *                    reste du pavillon devient infranchissable
 *
 * Les trois premiers barrent, et l'accessible s'ajoute au commun : ce qui est
 * infranchissable l'est aussi en fauteuil, et le rôle « pmr » ne fait qu'en
 * fermer davantage. Le troisième sert un cas que ni barrer ni ouvrir ne savait
 * dire : le couloir qui mène à l'ascenseur est bien praticable, et le trajet
 * ordinaire n'a pourtant rien à y faire — l'escalier d'à côté est plus court,
 * et personne ne tient à y envoyer la foule d'un salon. Ouvert au fauteuil,
 * fermé au marcheur : c'est le seul rôle qui change de camp selon le mode.
 *
 * Les deux bouts par lesquels on peut prendre le problème, donc. Barrer est
 * presque toujours le plus court — un bloc sanitaire fait un rectangle, une
 * allée en fait cinquante — et c'est ce que la liste propose en premier. La
 * circulation reste là pour le hall dont le vide n'est, dans l'ensemble, pas
 * praticable ; elle coûte alors une après-midi de tracé, et il faut le savoir
 * avant de s'y mettre.
 *
 * Le rôle vit dans CONF, comme l'ordre de la pile : les colonnes de
 * `calque_dessin` sont fixées, celles des réglages ne le sont pas — et les
 * réglages partent aux visiteurs à la publication, ce qui est exactement ce
 * qu'on veut.
 */
export const ROLES_ITI = [
  { v: "", nom: "Aucun" },
  { v: "obstacle", nom: "Infranchissable" },
  { v: "pmr", nom: "Infranchissable en fauteuil" },
  /* Nommé « Où l'on peut marcher — PMR uniquement » tant qu'on l'a pensé
     depuis le calcul, où il est bien une circulation. L'exploitant, lui, le
     pose pour fermer un passage à la foule, et lisait deux rôles d'ouverture
     là où il en cherchait un de fermeture. Il se range donc avec ce qui barre,
     dont il est le troisième degré : tout le monde, le fauteuil, tout le monde
     sauf lui. La valeur enregistrée ne bouge pas — c'est le libellé qui était
     écrit du mauvais côté. */
  { v: "circulation-pmr", nom: "Infranchissable sauf PMR" },
  { v: "circulation", nom: "Où l'on peut marcher" },
];
/**
 * Une zone organisateur qu'on traverse.
 *
 * Une zone est un mur pour le calcul : c'est vrai d'une réserve ou d'un local
 * technique, faux d'un accueil, d'une agora, d'une esplanade — des sols qu'on
 * traverse, et que le trajet contournait en faisant faire le tour de ce qu'on
 * aurait coupé. Rien dans la source ne distingue les deux : l'exploitant les
 * désigne, une par une, dans l'onglet « Zones » des réglages.
 *
 * La marque voyage sur la zone et non dans CONF : elle vient de la base, comme
 * le nom et le masquage, et s'applique à la lecture — sans attendre ni la
 * publication ni la prochaine synchronisation.
 */
export const zoneTraversee = (z) => Boolean(z && z.traversable);

/**
 * Les zones qui font le terrain : celles du plan, et celles que l'exploitant
 * a masquées. Le visiteur ne reçoit de ces dernières que la forme, à part
 * (`zonesCachees`) — assez pour que son trajet soit celui de la console. Sans
 * elles, une galerie masquée mais traversable restait fermée chez lui seul,
 * et il lisait « aucun chemin » là où l'exploitant voyait un trajet.
 */
export const zonesDuTerrain = (p) =>
  p.zonesCachees && p.zonesCachees.length ? p.zones.concat(p.zonesCachees) : p.zones;

export const cleRoleIti = (id) => "_iti:" + id;
export const roleIti = (c) => (conf()[cleRoleIti(c.id)] || {}).role || "";
export const nomRoleIti = (r) => (ROLES_ITI.find(x => x.v === r) || ROLES_ITI[0]).nom;
/* Réservée ou non, une circulation dit où l'on marche : les deux rôles se
   traitent pareil partout où c'est la surface qui parle. */
const estCirculation = (r) => r === "circulation" || r === "circulation-pmr";

/**
 * Les formes d'un pavillon portant un rôle donné.
 *
 * La visibilité du calque n'entre pas en compte, à la différence des repères :
 * un mur reste un mur quand on l'éteint. Un calque de rôle ne décrit pas ce
 * qu'on montre mais le terrain — les sanitaires, la rampe, les allées — et
 * l'exploitant l'éteint précisément parce que le visiteur n'a pas à le voir.
 * L'oublier alors faisait traverser un local par le trajet, ce qui est un
 * bogue plus grand que le détour inexpliqué qu'on cherchait à éviter.
 * Une ligne n'a pas de surface — elle barre par son trait, et ne saurait
 * délimiter une circulation. Un stand dessiné en a une, comme le rectangle
 * dont il est un cas particulier : posé hors de l'emplacement qu'il découpe,
 * il barre le passage aussi sûrement qu'une cloison.
 *
 * Un repère n'en est jamais une, quel que soit son pictogramme. Les escaliers
 * et les escalators l'ont été un temps — on reprenait leur pastille telle
 * quelle en itinéraire accessible, au motif que ce qu'on voit est ce qui est
 * évité. Mais une pastille est un panneau, pas un terrain : sa taille se règle
 * pour qu'elle se lise de loin, et l'agrandir murait d'autant l'allée qu'elle
 * désigne — près de dix mètres de côté par défaut, dégagement compris, de quoi
 * condamner l'ascenseur posé à côté de l'escalier qu'il double. Poser un point
 * d'intérêt ne doit rien changer au terrain ; ce qui barre se dessine.
 */
function formesRole(p, role){
  const l = [];
  for (const c of calquesDe(p)){
    if (roleIti(c) !== role) continue;
    for (const f of c.formes || []){
      if (f.t === "rect" || f.t === "poly" || f.t === "stand")
        l.push({ d: cheminForme(f), trait: false });
      else if (f.t === "ligne" && !estCirculation(role))
        l.push({ d: cheminForme(f), trait: true });
    }
  }
  return l;
}

/**
 * L'angle des allées, en radians.
 *
 * Les cases de la grille sont carrées et le trajet n'y avance que d'équerre :
 * tant qu'elle est posée sur les axes du plan, un pavillon dessiné de travers
 * — un hall arrondi, un bâtiment qui ne regarde pas le nord — voit ses allées
 * descendues en escalier, marche après marche, au lieu d'être suivies. On
 * tourne donc la grille avec le hall : l'escalier redevient la ligne droite
 * qu'un visiteur marche, et les virages retombent aux carrefours.
 *
 * L'angle se lit dans les emplacements eux-mêmes, rangés le long des allées
 * qu'ils bordent : leurs façades en donnent la direction. À un quart de tour
 * près, puisqu'un rectangle a deux directions et qu'elles se valent ici. On
 * cherche le pic plutôt que la moyenne — un hall a toujours quelques stands
 * posés de biais, et il ne faut pas qu'ils entraînent tous les autres — puis
 * on l'affine sur les degrés voisins, l'allée méritant mieux qu'un degré près.
 */
const ANGLES = new Map();
export function anglePlan(p){
  const garde = ANGLES.get(p.id);
  if (garde !== undefined) return garde;

  /* Un bac par degré pour trouver le pic ; à côté, la somme des directions
     elles-mêmes, pour ne pas rendre ensuite le milieu du bac à la place de
     l'angle qu'on y a rangé. Les directions s'ajoutent quadruplées : au quart
     de tour près, un angle fait alors le tour entier, et 89° se moyenne avec
     1° sans tomber au milieu, à 45°. */
  const bacs = new Float64Array(90), vc = new Float64Array(90), vs = new Float64Array(90);
  for (const o of p.stands.concat(zonesDuTerrain(p))){
    const s = sommets(o);
    for (let i = 0; i + 1 < s.length; i++){
      const dx = s[i + 1][0] - s[i][0], dy = s[i + 1][1] - s[i][1];
      const l = Math.hypot(dx, dy);
      if (l < .8) continue;              // un chanfrein ne dit rien de l'allée
      const a = Math.atan2(dy, dx);
      const b = Math.floor((((a * 180 / Math.PI) % 90) + 90) % 90);
      bacs[b] += l; vc[b] += l * Math.cos(4 * a); vs[b] += l * Math.sin(4 * a);
    }
  }
  let pic = 0;
  for (let i = 1; i < 90; i++) if (bacs[i] > bacs[pic]) pic = i;
  // le pic et ses voisins : l'allée mérite mieux qu'un degré près
  let sc = 0, ss = 0;
  for (let k = -2; k <= 2; k++){
    const i = (pic + k + 90) % 90;
    sc += vc[i]; ss += vs[i];
  }
  let t = (sc || ss) ? Math.atan2(ss, sc) / 4 : 0;
  // un pavillon d'équerre le reste : un quart de degré ne se voit pas, et la
  // grille droite se raisonne mieux quand il faut y revenir
  if (Math.abs(t) < .004) t = 0;
  ANGLES.set(p.id, t);
  return t;
}

/** Du plan à la grille tournée, et retour. Une rotation pure : appliquée à un
 *  vecteur — la normale d'une façade — elle vaut aussi bien que sur un point. */
const dansGrille = (g, q) => [q[0] * g.co + q[1] * g.si, -q[0] * g.si + q[1] * g.co];
const horsGrille = (g, q) => [q[0] * g.co - q[1] * g.si, q[0] * g.si + q[1] * g.co];

/**
 * Le hall en noir et blanc.
 *
 * Le canevas fait le gros du travail : il sait remplir un contour et
 * l'épaissir d'un trait, ce qui donne l'écart au mur sans une ligne de
 * géométrie. On peint donc tout en mur, on creuse l'enveloppe, on y replante
 * les stands, et on relit les pixels.
 */
export function grille(p, pmr){
  const cle = p.id + (pmr ? "|pmr" : "");
  const garde = GRILLES.get(cle);
  if (garde) return garde;

  const angle = anglePlan(p), co = Math.cos(angle), si = Math.sin(angle);
  /* L'emprise est celle du plan, à l'équerre ; la grille, elle, est tournée.
     On encadre donc les quatre coins tournés : un peu large aux angles, ce
     qui ne coûte que des cases de mur. */
  const e = p.emprise;
  let X0 = Infinity, Y0 = Infinity, X1 = -Infinity, Y1 = -Infinity;
  for (const q of [[e.x0, e.y0], [e.x1, e.y0], [e.x1, e.y1], [e.x0, e.y1]]){
    const [X, Y] = dansGrille({ co: co, si: si }, q);
    X0 = Math.min(X0, X); X1 = Math.max(X1, X);
    Y0 = Math.min(Y0, Y); Y1 = Math.max(Y1, Y);
  }
  // une case pour un demi-mètre, décalée d'une case pour garder une marge
  const x0 = X0 - PAS_GRILLE, y0 = Y0 - PAS_GRILLE;
  const w = Math.ceil((X1 - X0) / PAS_GRILLE) + 2;
  const h = Math.ceil((Y1 - Y0) / PAS_GRILLE) + 2;
  // une toile réglée sur la grille : même repère, même dégagement, de sorte
  // que deux relevés faits dessus se recouvrent case pour case
  const toile = () => {
    const cv = document.createElement("canvas");
    cv.width = w; cv.height = h;
    const c = cv.getContext("2d", { willReadFrequently: true });
    c.setTransform(co / PAS_GRILLE, -si / PAS_GRILLE, si / PAS_GRILLE, co / PAS_GRILLE,
                   -x0 / PAS_GRILLE, -y0 / PAS_GRILLE);
    c.lineJoin = c.lineCap = "round";
    c.lineWidth = 2 * (pmr ? DEGAGEMENT_PMR : DEGAGEMENT);
    c.fillStyle = c.strokeStyle = "#000";
    return c;
  };
  const ctx = toile();

  const barre = (d, trait) => {
    const t = new Path2D(d);
    if (!trait) ctx.fill(t);
    ctx.stroke(t);
  };

  /* Tout est mur avant qu'on ne creuse. On peint en cases plutôt qu'en
     mètres : la grille tournée déborde l'emprise du plan par ses coins, et
     un rectangle posé à l'équerre les laisserait blancs. */
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
  /* On creuse ce qui est praticable. Si l'exploitant a dessiné la circulation,
     c'est elle qui fait foi, et rien d'autre du pavillon n'est ouvert. Sinon
     on retombe sur l'enveloppe des emplacements, qui vaut mieux que rien mais
     ignore tout ce que le fond de plan est seul à savoir. */
  const circulation = formesRole(p, "circulation").map(o => new Path2D(o.d));
  const ouvert = circulation.length ? circulation : [enveloppe(p)];
  ctx.globalCompositeOperation = "destination-out";
  ouvert.forEach(t => ctx.fill(t));
  ctx.globalCompositeOperation = "source-over";
  // le bord d'une circulation est un mur comme un autre : on s'en écarte
  ouvert.forEach(t => ctx.stroke(t));

  /* Les zones qu'on traverse, creusées après ce bord-là et non avec les
     surfaces ouvertes. Creusée avant, la zone se retrouverait murée à sa
     bouche : le trait qui vient de peindre le bord de l'allée passe entre elle
     et l'allée qu'elle touche. Creusée après, elle le perce.

     Le débord d'un trait achève la jonction. Du bord peint il resterait sinon
     la moitié posée du côté de l'allée — un demi-mètre, de quoi barrer une
     grille au pas d'une case. Borné à ce qui est déjà ouvert, car un trait
     rendu partout percerait aussi le mur du hall là où la zone l'épouse. */
  const traversees = zonesDuTerrain(p).filter(zoneTraversee).map(z => new Path2D(z.d));
  if (traversees.length){
    ctx.globalCompositeOperation = "destination-out";
    traversees.forEach(t => ctx.fill(t));
    ouvert.forEach(o => {
      ctx.save(); ctx.clip(o);
      traversees.forEach(t => ctx.stroke(t));
      ctx.restore();
    });
    ctx.globalCompositeOperation = "source-over";
  }

  for (const o of p.stands) barre(o.d);
  /* Les emplacements repassent par-dessus : un stand posé dans une zone
     traversable la barre toujours, ce que son contour ne dit pas. Elle-même ne
     se mure pas — c'est tout l'objet. */
  for (const o of zonesDuTerrain(p)) if (!zoneTraversee(o)) barre(o.d);
  formesRole(p, "obstacle").forEach(o => barre(o.d, o.trait));
  if (pmr) formesRole(p, "pmr").forEach(o => barre(o.d, o.trait));

  /* Les couloirs réservés au fauteuil, en dernier, et c'est tout l'ouvrage :
     le bord de l'allée qu'ils rejoignent vient d'être peint en mur, et un
     couloir ouvert plus tôt se serait retrouvé muré à sa bouche — ouvert sur
     rien. Creusé après, il perce ce mur-là et débouche.

     Pour le marcheur, l'inverse : on le comble. Sans l'épaissir, car ce n'est
     pas une cloison mais une consigne — le dégagement mordrait sur l'allée
     qui le borde, où rien n'empêche de passer. */
  const reserve = formesRole(p, "circulation-pmr");
  if (reserve.length && !pmr) reserve.forEach(o => ctx.fill(new Path2D(o.d)));
  if (reserve.length && pmr){
    /* Creusé de son dégagement comme une allée l'est du sien : un couloir
       trop étroit pour un fauteuil ne doit pas s'ouvrir sous prétexte qu'on
       l'a déclaré. On l'érode donc à part — son plein moins son propre trait
       — puis on reporte le masque obtenu ; l'éroder sur la grille reviendrait
       à y repeindre le mur qu'on vient d'en ôter. */
    const cm = document.createElement("canvas");
    cm.width = w; cm.height = h;
    const mx = cm.getContext("2d");
    mx.setTransform(co / PAS_GRILLE, -si / PAS_GRILLE, si / PAS_GRILLE, co / PAS_GRILLE,
                    -x0 / PAS_GRILLE, -y0 / PAS_GRILLE);
    mx.lineJoin = mx.lineCap = "round";
    mx.lineWidth = 2 * DEGAGEMENT_PMR;
    const couloirs = reserve.map(o => new Path2D(o.d));
    couloirs.forEach(t => mx.fill(t));
    mx.globalCompositeOperation = "destination-out";
    couloirs.forEach(t => mx.stroke(t));
    /* La bouche, elle, ne s'érode pas. Là où le couloir mord sur l'allée, le
       mur n'est pas le sien : c'est le bord de l'allée, épaissi vers le
       dedans juste avant. L'éroder une seconde fois refermait la jonction —
       à un mètre de recouvrement il restait un demi-mètre de mur en travers,
       et le couloir ne desservait plus rien. On rend donc au masque le
       couloir entier, borné à ce qui est déjà ouvert. Le recouvrement reste
       nécessaire : c'est dit sous la liste des rôles. */
    mx.globalCompositeOperation = "source-over";
    ouvert.forEach(o => {
      mx.save(); mx.clip(o); couloirs.forEach(t => mx.fill(t)); mx.restore();
    });
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "destination-out";
    ctx.drawImage(cm, 0, 0);
    ctx.restore();
  }

  const px = ctx.getImageData(0, 0, w, h).data;
  const mur = new Uint8Array(w * h);
  // le lissage du canevas laisse des bords à demi peints : au-delà de la
  // moitié, la case est du côté du mur
  for (let i = 0; i < mur.length; i++) mur[i] = px[i * 4 + 3] > 128 ? 1 : 0;

  /* Ce que l'exploitant a tracé pour barrer, relevé à part. La grille ne dit
     pas pourquoi une case est mur, et il faut pourtant les distinguer : on
     traverse l'emplacement qu'on a désigné — c'est ce qui fait partir le trait
     du stand et non de l'allée devant lui —, jamais la cloison tracée en
     travers, fût-elle posée dans cet emplacement. Une cloison basse au fond
     d'un restaurant est dans son contour, et le trait la coupait au motif
     qu'elle était chez lui. */
  const traces = formesRole(p, "obstacle").concat(pmr ? formesRole(p, "pmr") : []);
  let cloisons = null;
  if (traces.length){
    const bx = toile();
    traces.forEach(o => { const t = new Path2D(o.d); if (!o.trait) bx.fill(t); bx.stroke(t); });
    const bp = bx.getImageData(0, 0, w, h).data;
    cloisons = new Uint8Array(w * h);
    for (let i = 0; i < cloisons.length; i++) cloisons[i] = bp[i * 4 + 3] > 128 ? 1 : 0;
  }

  /* Ce qui barre en propre, sans dégagement : le plein des stands et des zones
     qu'on ne traverse pas. La grille le confond avec le hors-hall — tout y est
     mur —, et l'accroche d'un repère, qui doit franchir le parvis pour gagner
     la première allée, franchissait du même pas une zone fermée : faute de
     chemin, le trait passait au travers. Relevé à part, il se refuse. */
  const bz = toile();
  for (const o of zonesDuTerrain(p)) if (!zoneTraversee(o)) bz.fill(new Path2D(o.d));
  const pz = bz.getImageData(0, 0, w, h).data;
  const bs = toile();
  for (const o of p.stands) bs.fill(new Path2D(o.d));
  const ps = bs.getImageData(0, 0, w, h).data;
  const barrage = new Uint8Array(w * h);
  for (let i = 0; i < barrage.length; i++)
    barrage[i] = (pz[i * 4 + 3] > 128 ? BARRE_ZONE : 0) | (ps[i * 4 + 3] > 128 ? BARRE_STAND : 0);

  const g = { x0: x0, y0: y0, w: w, h: h, mur: mur, cloisons: cloisons, barrage: barrage,
              pmr: pmr, co: co, si: si };
  g.marge = distanceAuMur(g);
  g.nappe = nappePrincipale(g);
  g.crete = cretes(g);
  GRILLES.set(cle, g);
  return g;
}

/**
 * À combien de cases chaque case est-elle du mur le plus proche ?
 *
 * C'est ce qui permet de tenir le milieu d'une allée plutôt que d'en raser un
 * bord. Deux balayages suffisent — un descendant, un remontant, chacun ne
 * regardant que les voisins déjà vus : la distance se propage de proche en
 * proche. On la plafonne bas, seuls les premiers mètres nous intéressent.
 */
export function distanceAuMur(g){
  const n = g.w * g.h, PLAFOND = 30;
  const d = new Uint8Array(n);
  const D = Math.SQRT2;
  const met = (i, v) => { d[i] = v > PLAFOND ? PLAFOND : Math.round(v); };
  const lu = new Float32Array(n);
  for (let i = 0; i < n; i++) lu[i] = g.mur[i] ? 0 : 1e6;
  for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++){
    const i = y * g.w + x;
    if (lu[i] === 0) continue;
    let m = lu[i];
    if (x > 0) m = Math.min(m, lu[i - 1] + 1);
    if (y > 0) m = Math.min(m, lu[i - g.w] + 1);
    if (x > 0 && y > 0) m = Math.min(m, lu[i - g.w - 1] + D);
    if (x < g.w - 1 && y > 0) m = Math.min(m, lu[i - g.w + 1] + D);
    lu[i] = m;
  }
  for (let y = g.h - 1; y >= 0; y--) for (let x = g.w - 1; x >= 0; x--){
    const i = y * g.w + x;
    if (lu[i] === 0) continue;
    let m = lu[i];
    if (x < g.w - 1) m = Math.min(m, lu[i + 1] + 1);
    if (y < g.h - 1) m = Math.min(m, lu[i + g.w] + 1);
    if (x < g.w - 1 && y < g.h - 1) m = Math.min(m, lu[i + g.w + 1] + D);
    if (x > 0 && y < g.h - 1) m = Math.min(m, lu[i + g.w - 1] + D);
    lu[i] = m;
    met(i, m);
  }
  return d;
}

/**
 * La marge qu'offre l'allée de chaque case — sa crête.
 *
 * C'est `versLeMilieu` appliqué à tout le pavillon d'un coup : depuis chaque
 * case on remonte la pente, et l'on retient la marge du sommet atteint. Le
 * prix du bord s'y compare, et ne reproche donc à une case que ce que son
 * allée permettait d'éviter. Se garde avec la grille, comme le reste.
 *
 * Quelques pas suffisent, `versLeMilieu` s'arrêtant à la portée au-delà de
 * laquelle un milieu n'a plus de sens : le pavillon entier coûte moins qu'un
 * seul A*.
 */
export function cretes(g){
  const n = g.w * g.h, c = new Uint8Array(n);
  for (let i = 0; i < n; i++)
    if (!g.mur[i]) c[i] = Math.min(PORTEE_CENTRE, g.marge[versLeMilieu(g, i)]);
  return c;
}

/**
 * La nappe où l'on marche vraiment.
 *
 * Le vide d'un hall n'est pas d'un seul tenant : quatre stands mitoyens
 * laissent entre eux des poches fermées de deux ou trois cases, et une cour
 * intérieure peut n'avoir aucune issue. S'accrocher à l'une d'elles rendait
 * une vingtaine d'emplacements du pavillon 7.2 injoignables, alors que leur
 * allée était à quatre mètres. On repère donc une fois pour toutes la plus
 * grande nappe — les allées du hall — et c'est à elle que les points
 * s'accrochent.
 */
export function nappePrincipale(g){
  const n = g.w * g.h;
  const marque = new Int32Array(n).fill(-1);
  const file = new Int32Array(n);
  const tailles = [];
  for (let d = 0; d < n; d++){
    if (g.mur[d] || marque[d] >= 0) continue;
    const id = tailles.length;
    let fin = 0, tete = 0;
    file[fin++] = d; marque[d] = id;
    while (tete < fin){
      const i = file[tete++];
      const cx = i % g.w, cy = (i - cx) / g.w;
      // quatre voisins, comme le trajet : deux cases en diagonale ne
      // communiquent pas plus ici qu'on ne passe entre deux angles de stand
      for (let k = 0; k < 4; k++){
        const nx = cx + VX[k], ny = cy + VY[k];
        if (nx < 0 || ny < 0 || nx >= g.w || ny >= g.h) continue;
        const j = ny * g.w + nx;
        if (g.mur[j] || marque[j] >= 0) continue;
        marque[j] = id;
        file[fin++] = j;
      }
    }
    tailles.push(fin);
  }
  let gagnante = -1, mieux = 0;
  tailles.forEach((t, i) => { if (t > mieux){ mieux = t; gagnante = i; } });
  const nappe = new Uint8Array(n);
  for (let i = 0; i < n; i++) if (marque[i] === gagnante) nappe[i] = 1;
  return nappe;
}

/** La case où tombe un point du plan, débordements compris : c'est à l'appelant
 *  de décider ce qu'il fait d'une colonne hors grille. */
function celluleDe(g, x, y){
  const q = dansGrille(g, [x, y]);
  return [Math.floor((q[0] - g.x0) / PAS_GRILLE), Math.floor((q[1] - g.y0) / PAS_GRILLE)];
}
export function caseDe(g, x, y){
  const [cx, cy] = celluleDe(g, x, y);
  if (cx < 0 || cy < 0 || cx >= g.w || cy >= g.h) return -1;
  return cy * g.w + cx;
}
export function centreCase(g, i){
  const cx = i % g.w, cy = (i - cx) / g.w;
  return horsGrille(g, [g.x0 + (cx + .5) * PAS_GRILLE, g.y0 + (cy + .5) * PAS_GRILLE]);
}

/* Jusqu'où l'on accepte de chercher l'allée d'un emplacement : douze mètres,
   la profondeur d'un très grand stand. Au-delà, on ne s'écarte plus — un
   emplacement qu'aucune allée n'atteint doit rester injoignable, sinon le mode
   accessible tracerait des trajets vers des stands qu'il vient précisément
   d'exclure. */
const PORTEE_ACCROCHE = 24;

/**
 * Et pour un point qui n'est l'emprise de rien : quarante mètres.
 *
 * Une entrée est posée à la porte du hall, c'est-à-dire hors de ce que le
 * calcul connaît : sans calque de circulation, le praticable se réduit à
 * l'enveloppe des emplacements, et le parvis n'en fait pas partie. Sur
 * Franchise Expo Paris, l'entrée tombe à vingt et un mètres de la première
 * allée — deux fois trop loin pour l'accroche d'un stand. La journée
 * s'ouvrait donc sur un trait qui commençait au premier exposant, l'entrée
 * restant seule dans son coin.
 *
 * La borne des douze mètres ne vaut pourtant que pour les emplacements :
 * c'est d'eux qu'on veut qu'ils restent injoignables quand aucune allée ne
 * les borde. Un repère, lui, n'a pas de dégagement à faire respecter — c'est
 * un point, posé là exprès pour qu'on y mène. On le laisse donc chercher son
 * allée plus loin, et le trait dit alors les mètres qu'on marche vraiment
 * avant d'entrer.
 */
const PORTEE_POINT = 80;

/**
 * Les cases qu'un emplacement occupe en propre, son dégagement compris.
 *
 * Peinte comme la grille l'a été — même pas, même épaisseur de trait — pour
 * que les deux se recouvrent exactement : ce qui est mur à cause de ce stand
 * est ici marqué sien, ce qui l'est à cause d'un autre ne l'est pas.
 *
 * On ne peint qu'une fenêtre autour du point, de la taille de ce qu'on
 * accepte de fouiller : un pavillon entier repeint pour chaque accroche
 * coûterait plus que toutes les recherches réunies.
 */
function empriseDe(g, p, d, cx0, cy0, cote){
  const cv = document.createElement("canvas");
  cv.width = cote; cv.height = cote;
  const ctx = cv.getContext("2d", { willReadFrequently: true });
  ctx.setTransform(g.co / PAS_GRILLE, -g.si / PAS_GRILLE, g.si / PAS_GRILLE, g.co / PAS_GRILLE,
                   -g.x0 / PAS_GRILLE - cx0, -g.y0 / PAS_GRILLE - cy0);
  ctx.lineJoin = ctx.lineCap = "round";
  ctx.lineWidth = 2 * (g.pmr ? DEGAGEMENT_PMR : DEGAGEMENT);
  ctx.fillStyle = ctx.strokeStyle = "#000";
  const t = new Path2D(d);
  ctx.fill(t); ctx.stroke(t);
  /* Ce qu'un autre occupe n'est pas sien, fût-il dans son contour : une zone
     non traversable posée au fond d'une zone orga, un stand qui la déborde.
     On retranche leur plein seul — leur dégagement est partagé avec le nôtre,
     et l'ôter refermerait la bouche d'un emplacement serré. */
  if (p){
    const c0 = horsGrille(g, [g.x0 + (cx0 + cote / 2) * PAS_GRILLE,
                              g.y0 + (cy0 + cote / 2) * PAS_GRILLE]);
    const portee = cote * PAS_GRILLE + 40;
    ctx.globalCompositeOperation = "destination-out";
    for (const v of p.stands.concat(zonesDuTerrain(p).filter(z => !zoneTraversee(z)))){
      if (!v.d || v.d === d) continue;
      const c = v.lc || v.c;
      if (!c || Math.abs(c[0] - c0[0]) > portee || Math.abs(c[1] - c0[1]) > portee) continue;
      ctx.fill(new Path2D(v.d));
    }
    ctx.globalCompositeOperation = "source-over";
  }
  const px = ctx.getImageData(0, 0, cote, cote).data;
  const m = new Uint8Array(cote * cote);
  for (let i = 0; i < m.length; i++) m[i] = px[i * 4 + 3] > 128 ? 1 : 0;
  /* Et ce qui a été tracé pour barrer ne lui appartient jamais, où qu'on
     l'ait posé : c'est tout l'objet d'une cloison. */
  if (g.cloisons)
    for (let y = 0; y < cote; y++) for (let x = 0; x < cote; x++){
      const gx = cx0 + x, gy = cy0 + y;
      if (gx < 0 || gy < 0 || gx >= g.w || gy >= g.h) continue;
      if (g.cloisons[gy * g.w + gx]) m[y * cote + x] = 0;
    }
  return m;
}

/**
 * La case de la nappe principale la plus proche d'un point.
 *
 * Le centre d'un stand tombe dans le mur — c'est bien lui qu'on désigne, mais
 * c'est l'allée devant lui qu'on emprunte. On s'écarte donc en anneaux
 * jusqu'à toucher les allées : la façade la plus proche est atteinte la
 * première, sans qu'on ait eu à la chercher.
 *
 * Encore faut-il que ce soit la sienne. On traversait les murs sans distinguer
 * à qui ils étaient, si bien qu'un stand serré entre deux voisins s'accrochait
 * à l'allée d'en face, à travers le stand du voisin : le trait entrait par une
 * façade qui n'était pas la sienne, et l'amorce dessinait un crochet au milieu
 * de l'emplacement traversé. On ne franchit donc que son propre emplacement —
 * on n'entre pas chez quelqu'un pour aller chez soi.
 */
/* Les deux sortes de plein que relève `barrage` : une zone qu'on ne traverse
   pas ne se franchit jamais, un stand seulement quand on cherche l'allée
   d'un point — un repère n'entre chez personne. */
const BARRE_ZONE = 1, BARRE_STAND = 2;

function accrocheDepuis(g, p, xy, chez, portee, sansStands){
  let d = caseDe(g, xy[0], xy[1]);
  if (d < 0){
    const [gx, gy] = celluleDe(g, xy[0], xy[1]);
    const cx = Math.min(g.w - 1, Math.max(0, gx));
    const cy = Math.min(g.h - 1, Math.max(0, gy));
    d = cy * g.w + cx;
  }
  if (g.nappe[d]) return d;

  const dx0 = d % g.w, dy0 = (d - dx0) / g.w;
  const cote = 2 * portee + 1;
  const cx0 = dx0 - portee, cy0 = dy0 - portee;
  const sien = chez ? empriseDe(g, p, chez, cx0, cy0, cote) : null;
  const chezSoi = (nx, ny) => {
    if (!sien) return true;
    const px = nx - cx0, py = ny - cy0;
    return px >= 0 && py >= 0 && px < cote && py < cote && sien[py * cote + px] === 1;
  };

  /* Hors de son propre emplacement, ce qui barre ne se franchit pas : ni la
     cloison tracée, ni la zone fermée, ni — pour un point — le stand d'un
     autre. Faute d'allée atteinte sans eux, il n'y a pas de chemin, et mieux
     vaut le dire que de tracer un trait qui passe au travers.
     Un point posé dans ce qui barre — une entrée dessinée dans la zone
     d'accueil — doit pourtant pouvoir en sortir : tant qu'on n'a traversé que
     du barré depuis lui, on est encore chez lui. */
  const masque = BARRE_ZONE | (sansStands ? BARRE_STAND : 0);
  const barre = (j) => !sien && ((g.cloisons && g.cloisons[j]) || (g.barrage[j] & masque));
  const vu = new Uint8Array(g.w * g.h);
  const dedans = new Uint8Array(g.w * g.h);
  const file = [d];
  vu[d] = 1;
  if (barre(d)) dedans[d] = 1;
  let repli = -1;
  for (let k = 0; k < file.length; k++){
    const i = file[k], cx = i % g.w, cy = (i - cx) / g.w;
    // en huit voisins, le rang de l'anneau se lit sur les coordonnées
    if (Math.max(Math.abs(cx - dx0), Math.abs(cy - dy0)) > portee) break;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++){
      const nx = cx + dx, ny = cy + dy;
      if (nx < 0 || ny < 0 || nx >= g.w || ny >= g.h) continue;
      const j = ny * g.w + nx;
      if (vu[j]) continue;
      if (g.nappe[j]) return j;
      // le mur d'un autre ne se franchit pas : c'est là toute la règle
      if (g.mur[j] && !chezSoi(nx, ny)){ vu[j] = 1; continue; }
      /* Refusé depuis dehors, un barré reste à voir : on peut encore l'aborder
         depuis dedans, par un autre côté. */
      if (barre(j)){
        if (!dedans[i]) continue;
        dedans[j] = 1;
      }
      vu[j] = 1;
      // une poche fermée ne mène nulle part : on la traverse sans s'y arrêter
      if (repli < 0 && !g.mur[j]) repli = j;
      file.push(j);
    }
  }
  return repli;
}

/**
 * Du bord de l'allée à son milieu.
 *
 * L'anneau rend la première case d'allée rencontrée : celle qui touche la
 * façade, au ras du mur. Le trajet démarrait donc collé aux stands, et il
 * fallait deux virages pour rejoindre le milieu — que le calcul ne payait
 * qu'à contrecœur, si bien que le trait longeait les emplacements d'un bout à
 * l'autre. On remonte donc la pente : on s'éloigne du mur tant qu'un voisin
 * est plus au large, sans dépasser la portée au-delà de laquelle un « milieu »
 * n'a plus de sens. Quelques pas suffisent, l'allée n'ayant que sa largeur.
 */
function versLeMilieu(g, i){
  let cur = i;
  for (let pas = 0; pas < PORTEE_CENTRE; pas++){
    if (g.marge[cur] >= PORTEE_CENTRE) break;
    const cx = cur % g.w, cy = (cur - cx) / g.w;
    let mieux = cur;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++){
      const nx = cx + dx, ny = cy + dy;
      if (nx < 0 || ny < 0 || nx >= g.w || ny >= g.h) continue;
      const j = ny * g.w + nx;
      if (g.nappe[j] && g.marge[j] > g.marge[mieux]) mieux = j;
    }
    if (mieux === cur) break;
    cur = mieux;
  }
  return cur;
}

/**
 * L'accroche, et son garde-fou.
 *
 * Un emplacement qu'aucune allée ne borde — enclavé au milieu d'un îlot, ou
 * dont le dégagement mange le seul passage — n'a pas de façade à offrir. Le
 * laisser injoignable serait pire que le défaut qu'on corrige : on relâche
 * alors la règle plutôt que de rendre la main, quitte à retrouver un trait qui
 * coupe par le voisin. Ce qui se voit, au moins, se comprend.
 *
 * Relâchée, elle ne l'est qu'envers les stands : une zone fermée ou une
 * cloison tracée ne se franchit jamais, et l'emplacement qu'elles enclavent
 * reste injoignable — le tiroir le dit, au lieu d'un trait qui les traverse.
 *
 * La règle relâchée reste celle du voisinage, jamais la distance : le second
 * essai cherche à la portée d'un emplacement, sans quoi on rendrait joignable
 * le stand que la portée écarte — ce qu'elle est là pour empêcher.
 */
export function accroche(g, p, xy, chez){
  let r = accrocheDepuis(g, p, xy, chez, chez ? PORTEE_ACCROCHE : PORTEE_POINT, !chez);
  if (chez && !(r >= 0 && g.nappe[r])){
    const large = accrocheDepuis(g, p, xy, null, PORTEE_ACCROCHE);
    if (large >= 0 && g.nappe[large]) r = large;
  }
  return r >= 0 && g.nappe[r] ? versLeMilieu(g, r) : r;
}

/* Les quatre directions, dans cet ordre : est, ouest, sud, nord. */
export const VX = [1, -1, 0, 0];
export const VY = [0, 0, 1, -1];
