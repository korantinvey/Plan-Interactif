/* ============================================================
   La préparation du séjour — répartir les stands, puis dérouler les jours

   Elle ne touche pas l'écran : elle reçoit des
   jours, une heure d'arrivée, un départ, et rend un déroulé par jour — d'où
   un essai qui la mesure seule, dans Node (`outils/essais/sejour.js`). Le
   rangement lui-même est dans `ordonnanceur.mjs`, la charge annoncée dans
   `charge-annoncee.mjs`, la question posée et le tiroir dans `journee.mjs`.
   ============================================================ */
import { DATA, parId, CONFS } from "./donnees.mjs";
import { momentLocal, jourBref, minutesDe } from "./temps.mjs";
import { PARCOURS, instantConf, cleTemps } from "./parcours.mjs";
import { PAS_GRILLE, ALLURE, ALLURE_PMR, grille, accroche, distancesDepuis, pointObjet, sortiesDe,
  plansRelies, routeEntre } from "./itineraire.mjs";
import { GENRES_RESSOURCE, poidsDesJours, rangeSejour } from "./ordonnanceur.mjs";
import { CHARGE, chargeSuivie, chargeCellule, dilatationDuJour } from "./charge-annoncee.mjs";

/* Ce que `journee.mjs` lui confie, et rien avant qu'il l'ait fait : un
   calcul lancé trop tôt doit échouer bruyamment plutôt que de rendre une
   visite fausse. Les réglages du salon (`horaires.mjs`, `seuil.mjs`) et le mode accessible
   de l'itinéraire (`tiroir-itineraire.mjs` `ITI`), lu par une fonction que
   `journee.mjs` confie : l'importer d'ici tirerait le tiroir et la page dans
   l'essai qui éprouve ce calcul seul, sous Node. */
/** @type {Record<string, any>} */
let soude = {};

/**
 * Le branchement, appelé par `journee.mjs` en se branchant lui-même
 * (`brancheJournee`).
 *
 * @param {{ minutesVisite: () => number, horairesSalon: (jour: string) => any,
 *   seuilConcentration: (o: any) => number, seuilImpose: () => boolean,
 *   iti: () => { pmr: boolean } }} b
 */
export function brancheSejour(b){ soude = b; }

const minutesVisite = () => soude.minutesVisite();
const horairesSalon = (jour) => soude.horairesSalon(jour);
const seuilConcentration = (o) => soude.seuilConcentration(o);
const seuilImpose = () => soude.seuilImpose();

/**
 * Ce que coûte un changement de pavillon.
 *
 * Les données ne disent rien de ce qui relie deux halls — ni passerelle, ni
 * allée extérieure, ni distance — et l'itinéraire s'y coupe franchement
 * plutôt que d'inventer un tracé. Ordonner une journée demande pourtant un
 * prix : sans lui, l'algorithme ferait l'aller-retour entre deux pavillons
 * comme il change d'allée, et rendrait un programme absurde.
 *
 * Ce forfait n'est donc pas une mesure, c'est une dissuasion : plus cher que
 * n'importe quel détour à l'intérieur d'un seul hall, ce qui suffit à
 * regrouper les visites pavillon par pavillon. Il ne compte jamais dans la
 * distance annoncée — celle-ci ne porte que ce qui est tracé, et le dit.
 */
const TRANSFERT_M = 300;     // pour ordonner, jamais pour annoncer
const LIAISON_M = 60;        // quand un passage déclaré joint les deux plans
const TRANSFERT_MIN = 5;     // ce qu'on réserve dans l'horaire

/* L'équilibre entre les jours, la peine d'une demi-heure chargée, la
   répartition et l'ordre de visite (`rangeSejour`) : `modules/ordonnanceur.mjs`.
   Ils ne lisent rien de la page, et les essais les importent tels quels. */

/**
 * Ce que le visiteur a placé lui-même.
 *
 * Le calcul propose, il ne décide pas : un exposant qu'on veut voir le premier
 * jour se déplace d'un geste, et ce geste doit tenir. Ces choix vivent hors du
 * séjour calculé, sinon les refaire les effacerait — or on change souvent
 * d'heure d'arrivée après avoir rangé deux ou trois stands à la main.
 */
export const PLACES = new Map();   // identifiant de stand → clé du jour imposé

/**
 * La matrice des distances, gardée d'un calcul à l'autre.
 *
 * Elle coûte un balayage du hall par arrêt : c'est le gros du calcul, et elle
 * ne dépend ni des jours retenus ni de l'heure d'arrivée — seulement des
 * arrêts. Déplacer un stand d'un jour à l'autre la referait pour rien, et le
 * tiroir clignoterait sur « calcul… » à chaque geste. Une demande franche la
 * jette (voir `lanceSejour`) : entre-temps, les cloisons du plan ont pu bouger
 * sous l'exploitant qui le dessine.
 */
let MATRICE = null;   // { cle, D }

/** Jeter la matrice gardée : la prochaine demande rebalaie le plan. */
export function oublieMatrice(){ MATRICE = null; }

/* ------------------------------------------------------------
   Les heures — les lire et les écrire : `modules/temps.mjs`
   ------------------------------------------------------------ */
export const finInstant = (c) => momentLocal(c.finLocal, DATA.fuseau) || momentLocal(c.fin, DATA.fuseau);

/* ------------------------------------------------------------
   Les points de la visite
   ------------------------------------------------------------ */
/** Là où se tient une conférence : sa zone, qui est un objet du plan. Une
 *  conférence qui n'en a pas garde son heure et sa place dans la journée —
 *  on ne sait simplement pas y mener. */
function pointConf(c){
  const z = c.zone && parId.get(String(c.zone));
  return z ? pointObjet(z) : null;
}

/**
 * De chaque arrêt à tous les autres.
 *
 * Un balayage en largeur par arrêt, et non un A* par paire : vingt arrêts
 * font quatre cents paires, et le hall entier coûte moins cher à balayer
 * qu'un seul chemin à chercher. La longueur obtenue est celle des allées,
 * sans prix du virage ni du bord — de quoi comparer deux ordres de visite,
 * ce qu'on lui demande. Le tracé montré au visiteur reste celui de `troncon`.
 *
 * Elle se calcule une fois pour tout le séjour, et non une fois par jour : les
 * arrêts sont les mêmes d'un jour à l'autre, seule leur répartition change.
 * Trois jours coûteraient sinon trois balayages du salon là où un seul dit
 * déjà tout.
 */
function matriceJournee(pts, pmr){
  const n = pts.length;
  const D = [];
  for (let i = 0; i < n; i++) D.push(new Float64Array(n));
  /* Un arrêt qu'aucune allée n'atteint — un stand enclavé, un repère posé
     dans un mur — ne doit pas sortir de la journée pour autant : on retombe
     sur la distance à vol d'oiseau, majorée du détour qu'une allée impose. */
  const volDoiseau = (a, b) => Math.hypot(a.xy[0] - b.xy[0], a.xy[1] - b.xy[1]) * 1.3;

  const parPlan = new Map();
  pts.forEach((pt, i) => {
    if (!pt) return;
    if (!parPlan.has(pt.p)) parPlan.set(pt.p, []);
    parPlan.get(pt.p).push(i);
  });

  /* Ce qui sépare un arrêt de la sortie la plus proche de son plan : c'est
     par là que passe tout trajet vers un autre — la porte du hall, ou
     l'escalier qui monte à l'étage. */
  const auxPortes = new Float64Array(n);
  const relies = plansRelies(pmr);

  parPlan.forEach((idx, ip) => {
    const p = DATA.plans[ip];
    const g = grille(p, pmr);
    /* L'emprise de l'arrêt : on n'accroche pas une allée à travers un voisin.
       Le plan se passe en second — `accroche(g, p, xy, chez)` — et l'oublier
       décalait tout d'un cran : le contour partait dans `xy`, dont la première
       coordonnée valait alors `undefined`. Le balayage, parti d'une case
       `NaN`, n'était borné par rien — ni `NaN > portée`, ni `NaN >= g.w` ne
       sont vrais — et empilait neuf voisins par tour jusqu'à faire déborder la
       longueur du tableau. La journée organisée ne rendait donc rien du tout,
       et l'écran disait seulement que le calcul n'avait pas abouti. */
    const cases = idx.map(i => accroche(g, p, pts[i].xy, pts[i].d));
    const portes = sortiesDe(p, pmr).map(f => accroche(g, p, f.pts[0]))
      .filter(c => c >= 0 && g.nappe[c]);
    idx.forEach((i, k) => {
      const d = distancesDepuis(g, cases[k]);
      idx.forEach((j, l) => {
        if (j === i) return;
        const c = cases[l];
        D[i][j] = (c >= 0 && d[c] >= 0) ? d[c] * PAS_GRILLE : volDoiseau(pts[i], pts[j]);
      });
      let mieux = -1;
      portes.forEach(c => { if (d[c] >= 0 && (mieux < 0 || d[c] < mieux)) mieux = d[c]; });
      auxPortes[i] = mieux >= 0 ? mieux * PAS_GRILLE : 0;
    });
  });

  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++){
    if (i === j || !pts[i] || !pts[j] || pts[i].p === pts[j].p) continue;
    /* Deux plans qu'un passage joint ne sont pas deux pavillons éloignés : le
       premier étage se rejoint par son escalier, et l'ordre de visite doit
       pouvoir y monter puis redescendre sans que le calcul le lui compte
       comme une traversée du salon. */
    const forfait = relies.has(pts[i].p + "|" + pts[j].p) ? LIAISON_M : TRANSFERT_M;
    D[i][j] = auxPortes[i] + forfait + auxPortes[j];
  }
  return D;
}

/* ------------------------------------------------------------
   Le séjour, calculé
   ------------------------------------------------------------ */
/**
 * Le déroulé d'un jour, une fois ses stands connus.
 *
 * L'ordre est arrêté ; on le traduit en heures et en tronçons. Les mètres
 * annoncés sont ceux du tracé, pas ceux de la matrice — c'est le trait que le
 * visiteur suivra, et non le barème qui a servi à ranger.
 */
function derouleJournee(j, ctx){
  const PTS = ctx.PTS, dist = ctx.dist, enMinutes = ctx.enMinutes, tv = ctx.tv;
  /** @type {Record<string, any>[]} */   // un stand, une conférence, une attente…
  const etapes = [];
  const arrets = [], trace = [], retards = [];
  let t = j.arrivee, m = 0, coupe = false, rang = 0;

  /**
   * D'un arrêt au suivant.
   *
   * C'est le même calcul que le trajet d'un point à un autre, et pour la même
   * raison : un escalier déclaré fait continuer la journée à l'étage au lieu
   * de la couper au bord du plan. Un trajet en plusieurs morceaux donne
   * plusieurs lignes dans le déroulé — on marche, on prend l'escalier, on
   * marche encore — car c'est bien ce que le visiteur fera.
   */
  const rejoint = (a, b) => {
    if (a < 0 || b < 0 || !PTS[a] || !PTS[b]) return;
    const r = routeEntre(PTS[a], PTS[b], ctx.pmr);
    if (r.coupe) coupe = true;
    for (const e of r.etapes){
      trace.push(e);
      if (e.genre === "marche"){
        etapes.push({ genre: "marche", m: e.m, min: enMinutes(e.m), trace: true });
        t += enMinutes(e.m);
        m += e.m;
      } else if (e.genre === "liaison"){
        /* Le temps du passage est celui que l'exploitant a fixé pour ce
           couple-là : la journée le réserve dans l'horaire, comme elle
           réserve le temps de marche. */
        etapes.push(e);
        t += e.min || 0;
      } else {
        etapes.push({ genre: "transfert", de: e.de, vers: e.vers, min: TRANSFERT_MIN });
        t += TRANSFERT_MIN;
      }
    }
    /* Rien de tracé alors que les deux arrêts partagent leur plan : un stand
       enclavé, une allée introuvable. La matrice, elle, a une distance — celle
       qui a servi à ranger la journée — et l'annoncer vaut mieux que de
       laisser croire à un pas de porte. Entre deux plans elle porterait le
       forfait de dissuasion, qui n'a jamais sa place dans les mètres
       annoncés : on n'ajoute alors rien. */
    if (PTS[a].p === PTS[b].p && !r.etapes.some(e => e.genre === "marche")){
      const l = dist(a, b);
      etapes.push({ genre: "marche", m: l, min: enMinutes(l), trace: false });
      t += enMinutes(l);
      m += l;
    }
  };

  const pose = (i, conf) => {
    rang++;
    if (PTS[i]) arrets.push({ p: PTS[i].p, xy: PTS[i].xy, n: String(rang), conf: !!conf });
    return rang;
  };

  if (ctx.iDepart >= 0){
    arrets.push({ p: PTS[ctx.iDepart].p, xy: PTS[ctx.iDepart].xy, n: "", depart: true });
    etapes.push({ genre: "depart", nom: ctx.depart.nom, detail: ctx.depart.detail, t: t });
  }

  let ou = ctx.iDepart;
  j.creneaux.forEach((c, k) => {
    c.stands.forEach(s => {
      /* Le rangement a jugé sur la matrice, qui ignore le prix des virages et
         des escaliers : le tracé réel peut coûter quelques minutes de plus,
         et faire passer la dernière visite après la fermeture. On ne la
         programme pas pour autant — on défait le trajet qui y menait, et le
         stand rejoint ce qui n'a pas trouvé sa place. */
      const avant = { e: etapes.length, tr: trace.length, t: t, m: m, coupe: coupe };
      rejoint(ou, s);
      if (j.fermeture !== null && t + tv > j.fermeture){
        etapes.length = avant.e; trace.length = avant.tr;
        t = avant.t; m = avant.m; coupe = avant.coupe;
        ctx.restants.push(s);
        return;
      }
      const n = pose(s, false);
      etapes.push({ genre: "stand", n: n, o: parId.get(PTS[s].id), pt: PTS[s], t0: t, t1: t + tv });
      t += tv;
      ou = s;
    });
    const r = j.rdv[k];
    if (!r) return;
    rejoint(ou, r.i);
    const arrive = t;                       // l'heure qu'il serait vraiment
    if (arrive > r.t0 + 1) retards.push({ c: r.c, min: arrive - r.t0 });
    /* Un creux avant le premier rendez-vous n'est pas de même nature que les
       autres : ceux du milieu de journée sont pris entre deux choses fixes,
       celui-là ne tient qu'à l'heure qu'on a dite en arrivant. Le visiteur
       peut donc s'en débarrasser tout seul, et c'est la seule chose utile à
       lui dire — le total, lui, ne changera pas d'un pouce. */
    else if (arrive < r.t0) etapes.push({ genre: "attente", min: r.t0 - arrive,
                                          premier: k === 0 });
    const n = pose(r.i, true);
    /* Le retard voyage avec la conférence : la ligne garde l'heure du
       programme — c'est elle qui est affichée partout ailleurs — et dit à
       côté celle où l'on y serait vraiment. Une alerte en bas de tiroir se
       lit trop tard pour la ligne qu'elle concerne. */
    etapes.push({ genre: "conf", n: n, c: r.c, pt: r.pt, t0: r.t0, t1: r.t1,
                  retard: Math.max(0, arrive - r.t0) });
    /* La conférence garde ses heures — ce sont celles du programme — mais
       l'horloge du visiteur, elle, ne remonte pas : arriver après la fin
       d'une séance n'est pas y assister, et la suite de la journée part de
       l'heure qu'il est, non de celle qu'on aurait aimé. */
    t = Math.max(arrive, r.t1);
    /* Une conférence dont la salle n'est rattachée à aucune zone ne dit pas
       où l'on se trouve après elle : on repart du dernier endroit connu,
       sans quoi le trajet suivant — un changement de pavillon, souvent —
       disparaîtrait du déroulé sans un mot. */
    if (r.pt) ou = r.i;
  });

  j.fin = t;
  /* Les mètres du jour, désormais ceux du tracé : ceux de la matrice ont fait
     leur office en rangeant, et portaient un forfait qui n'est pas une
     distance. C'est ce nombre que l'onglet du jour affiche. */
  j.m = m;
  j.coupe = coupe;
  j.etapes = etapes;
  j.arrets = arrets;
  j.trace = trace;
  j.nArrets = rang;
  /* Les exposants que ce jour porte : c'est la question que pose le visiteur
     en voulant en déplacer un — où est-il tombé ? */
  j.ids = new Set(etapes.filter(e => e.genre === "stand" && e.o).map(e => String(e.o.id)));
  j.retards = retards;
  /* De quoi expliquer un creux plutôt que de le laisser sans réponse : ce
     qu'on attend en tout, et ce qui reste programmé après le dernier
     rendez-vous — les deux ensemble disent si l'attente était évitable. */
  j.attente = etapes.reduce((a, e) => a + (e.genre === "attente" ? e.min : 0), 0);
  j.tardifs = j.creneaux[j.creneaux.length - 1].stands.length;
  return j;
}

/**
 * Répartir, sans encore dérouler.
 *
 * C'est la moitié coûteuse du calcul — la matrice et le rangement — et c'est
 * aussi la seule dont l'aperçu du curseur a besoin : pour dire combien chaque
 * jour porte, il n'est pas utile de tracer les trajets ni d'écrire les heures.
 * Les deux chemins passent donc par ici, et le second continue seul.
 */
export function prepareSejour(choix, fige){
  const pmr = soude.iti().pmr;
  const tv = minutesVisite();
  const allure = pmr ? ALLURE_PMR : ALLURE;
  const enMinutes = (m) => m / (allure * 60);

  const stands = PARCOURS.stands.map(id => parId.get(id)).filter(Boolean);
  const horsJour = [], sansLieu = [];

  /* Les conférences retenues, rangées par date. Une conférence ne se déplace
     pas : celle qui tombe un jour qu'on ne vient pas se dit plutôt que de se
     programmer un autre jour, où elle n'a pas lieu. */
  const parJour = new Map(choix.jours.map(j => [j.cle, []]));
  PARCOURS.confs.map(id => CONFS.get(id)).filter(Boolean)
    .map(c => ({ c: c, d: instantConf(c), f: finInstant(c) }))
    .sort((a, b) => cleTemps(a.c).localeCompare(cleTemps(b.c)))
    .forEach(x => {
      if (!x.d || !parJour.has(x.d.cle)){ horsJour.push(x.c); return; }
      parJour.get(x.d.cle).push(x);
    });

  /* Les heures du salon, jour par jour. Arriver avant l'ouverture n'avance
     rien : la journée part de l'heure où les portes s'ouvrent, et le déroulé
     le dit plutôt que de programmer un stand devant un rideau baissé. La
     fermeture borne le dernier créneau comme une conférence borne les autres.
     Un salon change d'horaires d'un jour à l'autre — le dernier ferme plus
     tôt —, et c'est bien par jour que la question se pose. */
  const poids = poidsDesJours(choix.jours.length, choix.pente);
  const jours = choix.jours.map((x, i) => {
    const h = horairesSalon(x.cle);
    const avantOuverture = h.ouverture !== null && choix.arrivee < h.ouverture;
    return {
      cle: x.cle, nom: x.nom, court: x.court || jourBref(x.cle),
      ouverture: h.ouverture, fermeture: h.fermeture, poids: poids[i],
      demandee: choix.arrivee, avantOuverture: avantOuverture,
      arrivee: avantOuverture ? h.ouverture : choix.arrivee,
      rdv: [], creneaux: [], passees: [], chevauchent: [],
    };
  });

  jours.forEach(j => {
    let finPrec = -Infinity;
    (parJour.get(j.cle) || []).forEach(x => {
      const t0 = minutesDe(x.d);
      /* Une conférence commencée avant l'arrivée n'est plus un rendez-vous :
         on ne la fait pas manquer, on la dit manquée. */
      if (t0 < j.arrivee){ j.passees.push(x.c); return; }
      /* Deux conférences qui se recouvrent ne se suivent pas : on ne peut pas
         assister aux deux, et les enchaîner ferait une journée qui remonte le
         temps. On garde celle qui commence la première — retenue plus tôt dans
         la liste, elle est aussi celle qu'on peut encore attraper — et on dit
         l'autre plutôt que de la programmer pour rien. */
      if (t0 < finPrec){ j.chevauchent.push(x.c); return; }
      const pt = pointConf(x.c);
      if (!pt) sansLieu.push(x.c);
      /* Sans heure de fin, on compte une heure : enchaîner aussitôt ferait un
         programme faux, et attendre la journée entière un programme vide. */
      const t1 = x.f ? Math.max(t0 + 5, minutesDe(x.f)) : t0 + 60;
      j.rdv.push({ c: x.c, pt: pt, t0: t0, t1: t1 });
      finPrec = t1;
    });
  });

  /* Les points, dans un seul tableau, pour tout le séjour : le départ, les
     stands, les salles. C'est leur rang qui sert d'identité partout ensuite —
     et la matrice se calcule une fois, non une fois par jour. */
  const PTS = [];
  const iDepart = choix.depart ? PTS.push(choix.depart) - 1 : -1;
  const iStands = stands.map(o => PTS.push(pointObjet(o)) - 1);
  jours.forEach(j => j.rdv.forEach(r => { r.i = PTS.push(r.pt) - 1; }));

  /* Les arrêts n'ayant pas changé, la matrice non plus : une visite qu'on
     retouche — un stand déplacé d'un jour à l'autre — repart de celle du
     calcul précédent. Le rang d'un point suffit à la reconnaître : il porte
     son plan et sa position, et c'est tout ce dont le balayage dépend. */
  const cleMatrice = (pmr ? "pmr" : "") + "|" + PTS.map(pt => pt
    ? pt.p + ":" + Math.round(pt.xy[0]) + "," + Math.round(pt.xy[1]) : "-").join(";");
  if (!MATRICE || MATRICE.cle !== cleMatrice)
    MATRICE = { cle: cleMatrice, D: matriceJournee(PTS, pmr) };
  const D = MATRICE.D;
  /* Un bout de trajet dont on ignore un des deux bouts ne coûte rien : le
     départ « peu importe » et une salle non située ne sont pas des détours,
     ce sont des trous. */
  const dist = (a, b) => (a < 0 || b < 0 || !PTS[a] || !PTS[b]) ? 0 : D[a][b];
  const tempsCreneau = (c, m, n) => enMinutes(m) + n * tv;

  /* Les intervalles entre rendez-vous, c'est là qu'on range les stands. Une
     conférence dont la salle n'est située nulle part borne l'heure sans borner
     le lieu : on ne sait pas s'en approcher, et on repart d'où l'on était. */
  jours.forEach(j => {
    let de = iDepart, t0 = j.arrivee;
    j.rdv.forEach(r => {
      j.creneaux.push({ de: de, t0: t0, vers: r.pt ? r.i : -1, tMax: r.t0, stands: [] });
      if (r.pt) de = r.i;
      t0 = r.t1;
    });
    j.creneaux.push({ de: de, t0: t0, vers: -1, tMax: j.fermeture,
                      dernier: true, stands: [] });
  });

  /**
   * Ce qui fixe le jour d'un stand, dit en rangs de points : c'est par eux que
   * le calcul désigne les stands, et par leur identifiant qu'on les fixe.
   *
   * Deux sources, et elles ne se valent pas. Le visiteur d'abord — ce qu'il a
   * placé de sa main tient, et se dit quand cela ne tient pas. Puis, pour une
   * retouche seulement, la visite telle qu'elle était : déplacer un exposant
   * ne doit déplacer que lui. Sans cela, le calcul reprend tout depuis le
   * début et rend son meilleur arrangement — lequel peut être une tout autre
   * visite, où les trois pavillons ont changé de jour. C'est un arrangement
   * juste, et une réponse absurde à « mets celui-là le samedi ».
   */
  /* Un exposant retiré du parcours laisse une consigne qui ne désigne plus
     rien : elle s'en va avec lui, sans quoi elle ressusciterait le jour où on
     le remettrait dans la liste. */
  PLACES.forEach((cle, id) => { if (PARCOURS.stands.indexOf(id) < 0) PLACES.delete(id); });

  const idDuPoint = new Map();
  iStands.forEach((i, k) => idDuPoint.set(i, String(stands[k].id)));
  const parCle = new Map(jours.map(j => [j.cle, j]));
  const jourFixe = (i, table) => {
    const id = idDuPoint.get(i);
    return id !== undefined && table.has(id) ? parCle.get(table.get(id)) || null : null;
  };
  const imposeChoisi = (i) => jourFixe(i, PLACES);
  const imposeDe = fige
    ? (i) => imposeChoisi(i) || jourFixe(i, fige)
    : imposeChoisi;

  /* Ce qu'une visite vaut en mètres, au pas de marche. Le chiffre sert deux
     fois : c'est ce que coûte un stand renvoyé après le dernier rendez-vous —
     exactement ce qu'il ajoute à la fin de la journée, et ce qu'un creux plus
     tôt aurait absorbé sans rien coûter — et c'est la part des visites dans ce
     qu'une journée pèse, quand on compare les jours entre eux. */
  const restants = iStands.slice();

  /**
   * Les ressources du séjour, une par arrêt.
   *
   * Une **ressource** est ce qui porte un seuil et se remplit. Aujourd'hui les
   * stands, et eux seuls. Demain, peut-être, une zone, une allée étroite, une
   * entrée, un escalier, une liaison entre pavillons : ils se remplissent
   * aussi, et rien de ce qui suit ne les distingue d'un stand. C'est pourquoi
   * le genre est porté par la ressource et non deviné par l'ordonnanceur —
   * lui ne demande que « que peut recevoir le point numéro i », et cette
   * question aura la même forme le jour où le point sera une passerelle.
   *
   * Rien n'est implémenté pour ces autres genres, et il ne faut pas les
   * ajouter tant que rien ne les demande. Ce qui est fait ici est d'avoir
   * cessé de supposer, à trois endroits du calcul, que la chose qui se remplit
   * est un stand.
   *
   * Le tableau est bâti une fois et non à la demande : `peineDe` est dans la
   * boucle la plus chaude du calcul, et y allouer un objet par essai coûterait
   * plus que tout le reste.
   */
  const RESSOURCES = PTS.map((pt, i) => {
    const o = pt && pt.id ? parId.get(String(pt.id)) : null;
    if (!o) return null;
    const cap = seuilConcentration(o);
    /* Zéro se lit comme une absence de limite, jamais comme une limite nulle :
       un stand que personne n'a dessiné, sur un salon réglé à la surface, ne
       coûte jamais rien. */
    if (!(cap > 0)) return null;
    return {
      id: String(pt.id),
      genre: GENRES_RESSOURCE.stand,
      seuil: cap,
      /* D'où vient ce chiffre : de la surface dessinée, ou de l'exploitant.
         Ne sert pas au calcul — sert à expliquer un résultat surprenant, et à
         savoir ce qu'on peut faire évoluer sans mentir. */
      source: seuilImpose() ? "exploitant" : "surface",
    };
  });

  /**
   * Ce que l'ordonnanceur sait de la concentration.
   *
   * Nul quand l'exploitant n'a pas ouvert le réglage, quand le visiteur a
   * refusé la mesure, ou quand la charge n'est pas encore arrivée : la visite
   * se range alors comme avant, sans rien à payer.
   */
  const concentration = (chargeSuivie() && CHARGE) ? {
    ressource: (i) => RESSOURCES[i] || null,
    chargeAnnoncee: (cleJour, i, tranche) =>
      chargeCellule(cleJour, PTS[i] && PTS[i].id, tranche),
    dilatation: dilatationDuJour,
  } : null;

  rangeSejour(jours, restants, dist, tempsCreneau, allure * 60 * tv, imposeDe,
              concentration);

  return { choix: choix, jours: jours, PTS: PTS, dist: dist, enMinutes: enMinutes,
           tv: tv, pmr: pmr, iDepart: iDepart, restants: restants,
           imposeChoisi: imposeChoisi, horsJour: horsJour, sansLieu: sansLieu };
}

/**
 * Ce que le visiteur a demandé : des jours de venue, une heure d'arrivée, un
 * point de départ. Ce qu'on lui rend : un déroulé par jour, un tracé par jour,
 * et la liste franche de ce qui n'a trouvé sa place nulle part.
 */
export function calculeSejour(choix, fige){
  const p = prepareSejour(choix, fige);
  const jours = p.jours, PTS = p.PTS, restants = p.restants;
  const ctx = { PTS: PTS, dist: p.dist, enMinutes: p.enMinutes, tv: p.tv, pmr: p.pmr,
                depart: choix.depart, iDepart: p.iDepart, restants: restants };
  jours.forEach(j => derouleJournee(j, ctx));

  return {
    choix: choix, jours: jours, pmr: p.pmr, tv: p.tv,
    depart: choix.depart, arrivee: choix.arrivee,
    m: jours.reduce((a, j) => a + j.m, 0),
    /* Ce qui n'entre dans aucun jour appartient au séjour, non à l'un d'eux :
       le montrer sous chaque journée le répéterait trois fois, l'attacher à
       une seule le cacherait aux deux autres. */
    restants: restants.map(i => parId.get(PTS[i].id)).filter(Boolean),
    /* Ce qui n'a pas tenu là où le visiteur l'avait mis se dit à part. Ce qui
       n'a pas tenu là où il était resté figé, non : il n'a rien demandé, et
       la liste générale suffit. */
    refuses: restants.filter(i => p.imposeChoisi(i))
      .map(i => parId.get(PTS[i].id)).filter(Boolean),
    /* La visite telle qu'elle est, pour la retouche suivante. */
    assignation: new Map(jours.flatMap(j => [...j.ids].map(id => [id, j.cle]))),
    horsJour: p.horsJour, sansLieu: p.sansLieu,
  };
}

/**
 * Ce que porterait chaque jour, sans rien calculer de plus.
 *
 * L'aperçu du curseur : le nombre de conférences et d'exposants par journée,
 * et ce qui n'entre nulle part. On s'arrête juste après la répartition — le
 * déroulé, les tracés et les heures coûtent le plus cher et ne diraient rien
 * de neuf à quelqu'un qui fait glisser un curseur.
 */
export function apercuRepartition(choix){
  const p = prepareSejour(choix, null);
  return {
    jours: p.jours.map(j => ({
      cle: j.cle, nom: j.nom, court: j.court, confs: j.rdv.length,
      stands: j.creneaux.reduce((a, c) => a + c.stands.length, 0),
    })),
    restants: p.restants.length,
  };
}
