/*
 * Un salon synthétique, et sa journée organisée.
 *
 * Ce module ne connaît aucun salon en particulier : il fabrique un hall, des
 * exposants, des conférences et des visiteurs à partir de caractéristiques
 * qu'on lui donne, puis fait ranger leur journée par le vrai moteur. Le
 * scénario — combien d'exposants, quelle fréquentation, quels secteurs — est
 * une donnée, jamais une constante d'ici : voir `fep26.js`.
 *
 * Deux mots sur ce que ces chiffres ne sont pas. Ils ne reconstituent aucun
 * parcours réel : personne n'a ces données, et les inventer en les appelant
 * « réelles » serait pire que de ne rien mesurer. Ce qu'on produit ici est une
 * **population synthétique** tirée d'hypothèses écrites, pour comparer deux
 * moteurs sur exactement les mêmes gens.
 */
const O = require("./ordonnanceur.js");
const { rangeSejour, trancheDe, peineDeCharge } = O;

/* ------------------------------------------------------------------
   Le seuil de concentration

   Ce n'est **pas** une capacité physique, et le mot ne doit pas revenir par
   la fenêtre. Le compteur d'Event2Map ne voit que les journées organisées
   depuis le plan : il ignore tout des visiteurs qui n'ouvrent jamais
   l'application, c'est-à-dire de l'immense majorité. Un seuil de trois ne dit
   donc pas « ce stand reçoit trois personnes », il dit « au-delà de trois des
   nôtres en même temps, le moteur cherche à répartir » — parce qu'au-delà,
   c'est **lui** qui fabrique l'attroupement en donnant le même ordre à tout
   le monde.

   Le seuil est un compte brut de nos utilisateurs, et il ne se divise pas par
   le taux d'adoption : c'est notre propre trafic qu'on régule, et il est ce
   qu'il est quel que soit le nombre de gens qui nous ignorent.

   La fonction est isolée pour être remplacée. La surface est ce qu'on a
   aujourd'hui, faute de mieux ; des seuils empiriques, relevés stand par
   stand, prendraient sa place sans que rien d'autre ne bouge.
   ------------------------------------------------------------------ */
const REGLAGE_SEUIL = { parDix: 3, plancher: 3, plafond: 60 };

function seuilConcentration(stand, reglage){
  const r = reglage || REGLAGE_SEUIL;
  const a = stand && stand.surface;
  if (!(a > 0)) return 0;   // rien de dessiné : aucun seuil, aucune peine
  return Math.max(r.plancher, Math.min(r.plafond, Math.round(a * r.parDix / 10)));
}

/* ------------------------------------------------------------------
   Le hasard, reproductible
   ------------------------------------------------------------------ */
function hasardDe(graine){
  let g = (graine >>> 0) || 1;
  return () => {
    g = (g * 1103515245 + 12345) & 0x7fffffff;
    return g / 0x7fffffff;
  };
}
/* Une loi normale tronquée, pour les durées et les heures : un tirage
   uniforme rendrait autant de visiteurs de deux heures que de sept. */
const normale = (h, moy, ec, min, max) => {
  const u = Math.max(1e-9, h()), v = h();
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return Math.max(min, Math.min(max, moy + z * ec));
};
/* Un tirage pondéré, par recherche dichotomique dans les cumuls. */
const tirePondere = (cumuls, total, h) => {
  const x = h() * total;
  let lo = 0, hi = cumuls.length - 1;
  while (lo < hi){ const m = (lo + hi) >> 1; if (cumuls[m] < x) lo = m + 1; else hi = m; }
  return lo;
};

/* ------------------------------------------------------------------
   Le hall, les exposants, les conférences
   ------------------------------------------------------------------ */
/**
 * Un hall en travées, des exposants de tailles inégales groupés par secteur.
 *
 * Les secteurs sont contigus sur le plan, comme dans un vrai salon : les
 * franchises de restauration ne sont pas dispersées aux quatre coins du hall.
 * C'est ce qui rend la corrélation des souhaits intéressante — un visiteur
 * qui veut trois enseignes du même secteur les trouve côte à côte, et le
 * moteur n'a donc pas de détour à lui faire faire pour les grouper. Sans
 * cette contiguïté, la répartition temporelle paraîtrait gratuite.
 */
function construitSalon(cfg){
  const h = hasardDe(cfg.graine || 1);
  const n = cfg.exposants, parTravee = cfg.parTravee || 25, pas = cfg.pas || 6;
  const ecart = cfg.ecartTravee || 12;

  const stands = [];
  for (let i = 0; i < n; i++){
    const u = h();
    /* Des surfaces de salon de franchise : beaucoup de petits modules, une
       poignée de têtes d'affiche. */
    const surface = u < .55 ? 9 : u < .75 ? 12 : u < .87 ? 18 : u < .94 ? 27
                  : u < .975 ? 45 : u < .993 ? 90 : 150;
    stands.push({
      i: i,
      surface: surface,
      secteur: Math.floor(i / Math.max(1, Math.ceil(n / cfg.secteurs))),
      xy: [(i % parTravee) * pas, Math.floor(i / parTravee) * ecart],
    });
  }

  /* La notoriété : une longue traîne, et quelques têtes d'affiche qui
     concentrent une grande part des souhaits. Elle suit la taille sans lui
     être proportionnelle — un stand deux fois plus grand attire plus, pas
     deux fois plus — et porte en plus un facteur propre, parce qu'une
     enseigne très connue n'achète pas toujours grand.

     Ce facteur est **partiellement corrélé à la surface**, et l'hypothèse
     mérite d'être dite : une tête d'affiche qui attire mille visiteurs prend
     rarement un module de neuf mètres carrés, parce qu'elle sait ce qui
     l'attend. Les tirer indépendamment fabriquait des stands minuscules et
     adulés, dont le seuil de trois rendait des rapports de dix qui ne
     disaient rien du salon et tout de mon tirage. */
  stands.forEach(s => {
    const grand = Math.min(1, Math.pow(s.surface / 45, .8));
    const u = h() * (1 - .55 * grand);   // un grand stand tire plus bas, donc plus haut
    const vedette = u < .012 ? 12 : u < .05 ? 5 : u < .20 ? 2 : 1;
    s.notoriete = Math.pow(s.surface, .7) * vedette * (.6 + .8 * h());
  });

  /* Les entrées et les sorties du hall, et les salles de conférence. */
  const large = parTravee * pas, haut = Math.ceil(n / parTravee) * ecart;
  const pts = stands.map(s => s.xy);
  const iEntrees = (cfg.entrees || [[-20, -20]]).map(p => pts.push(p) - 1);
  const iSorties = (cfg.sorties || [[large + 20, haut + 20]]).map(p => pts.push(p) - 1);
  const iSalles = (cfg.salles || [[large / 2, -25], [large + 25, haut / 2]])
    .map(p => pts.push(p) - 1);

  /* Les conférences : réparties sur les jours et sur la journée, dans les
     salles. Une conférence dure une heure et ne se déplace jamais. */
  const confs = [];
  for (let k = 0; k < cfg.conferences; k++){
    const jour = k % cfg.jours;
    const t0 = 600 + Math.round((h() * 8 * 60) / 30) * 30;   // de 10 h à 18 h
    confs.push({ k: k, jour: jour, t0: t0, t1: t0 + 60,
                 i: iSalles[k % iSalles.length] });
  }
  confs.sort((a, b) => a.jour - b.jour || a.t0 - b.t0);

  /* Manhattan : les allées d'un hall sont orthogonales, et c'est la mesure
     que `matriceJournee` rend sur un vrai plan. Un indice négatif ne coûte
     rien — « peu importe le départ », « pas de retour », comme la vraie. */
  const dist = (a, b) => (a < 0 || b < 0 || !pts[a] || !pts[b]) ? 0 :
    Math.abs(pts[a][0] - pts[b][0]) + Math.abs(pts[a][1] - pts[b][1]);

  /* Les cumuls de notoriété, pour tirer les souhaits. */
  const cumuls = []; let t = 0;
  stands.forEach(s => cumuls.push(t += s.notoriete));

  /* Et, par secteur, les mêmes cumuls restreints : c'est par là que les
     souhaits se corrèlent. */
  const parSecteur = new Map();
  stands.forEach(s => {
    if (!parSecteur.has(s.secteur)) parSecteur.set(s.secteur, { l: [], c: [], t: 0 });
    const g = parSecteur.get(s.secteur);
    g.l.push(s.i); g.c.push(g.t += s.notoriete);
  });

  return { stands, confs, pts, dist, cumuls, totalNotoriete: t, parSecteur,
           iEntrees, iSorties, iSalles, jours: cfg.jours, cfg: cfg };
}

/* ------------------------------------------------------------------
   Les visiteurs
   ------------------------------------------------------------------ */
/**
 * Une population synthétique.
 *
 * Chaque visiteur porte son jour, son heure d'arrivée, le temps dont il
 * dispose, sa porte d'entrée, sa porte de sortie, sa liste d'exposants et
 * éventuellement des conférences. Rien de tout cela n'est uniforme : les
 * arrivées font une pointe le matin, un creux à midi et une traîne l'après-
 * midi ; les durées vont de l'heure et demie à la journée entière ; et les
 * souhaits se groupent par secteur.
 */
function construitVisiteurs(salon, n, graine, cfg){
  const h = hasardDe(graine);
  const c = cfg || {};
  const partConf = c.partConferences !== undefined ? c.partConferences : .22;
  const gens = [];

  for (let v = 0; v < n; v++){
    /* Le jour. Le deuxième jour d'un salon professionnel est le plus dense,
       le dernier le moins. */
    const u = h();
    const jour = u < .36 ? 0 : u < .72 ? 1 : 2;

    /* L'heure d'arrivée : pointe à l'ouverture, creux du déjeuner, traîne. */
    const a = h();
    let arrivee = a < .32 ? 600 + h() * 75          // 10 h – 11 h 15, la pointe
                : a < .50 ? 675 + h() * 75          // 11 h 15 – 12 h 30
                : a < .60 ? 750 + h() * 60          // 12 h 30 – 13 h 30, le creux
                : a < .84 ? 810 + h() * 120         // 13 h 30 – 15 h 30
                : 930 + h() * 120;                  // 15 h 30 – 17 h 30, les tardifs
    arrivee = Math.round(arrivee);

    /* Le temps dont il dispose. Court pour qui passe entre deux rendez-vous,
       long pour qui a fait le déplacement exprès. */
    const duree = Math.round(normale(h, 240, 110, 90, 480));
    const fin = Math.min(c.fermeture || 1140, arrivee + duree);

    /* Combien d'exposants. Peu pour la plupart, beaucoup pour quelques-uns,
       et jamais plus que le temps n'en permet. */
    let combien = Math.round(normale(h, 8, 4.5, 2, 25));
    /* Trente-deux minutes par exposant : vingt de visite et douze de marche.
       Le premier chiffrage comptait quatre minutes de marche, ce qu'aucun
       hall de cinq cents stands ne permet — six pour cent des souhaits
       restaient alors dehors **dans les deux moteurs**, et ce bruit de fond
       rendait illisible le seul chiffre qui compte ici : combien de visites
       la répartition, elle, fait tomber. */
    combien = Math.max(2, Math.min(combien, Math.floor((fin - arrivee) / 32)));

    /* La liste. Une graine de secteur, puis des voisins du même secteur et
       quelques écarts — c'est ce qui fabrique les groupes d'exposants
       souvent visités ensemble. */
    const vus = new Set();
    const premier = tirePondere(salon.cumuls, salon.totalNotoriete, h);
    vus.add(premier);
    const g = salon.parSecteur.get(salon.stands[premier].secteur);
    let garde = 0;
    while (vus.size < combien && garde++ < combien * 40){
      /* Deux souhaits sur trois restent dans le secteur de la graine. */
      if (h() < .66 && g.l.length > 1)
        vus.add(g.l[tirePondere(g.c, g.t, h)]);
      else
        vus.add(tirePondere(salon.cumuls, salon.totalNotoriete, h));
    }

    /* Les conférences. Celles de son jour, dans sa fenêtre, au plus deux —
       et jamais deux qui se recouvrent. */
    const confs = [];
    if (h() < partConf){
      const possibles = salon.confs.filter(x => x.jour === jour &&
        x.t0 >= arrivee && x.t1 <= fin);
      const combienC = h() < .75 ? 1 : 2;
      for (let k = 0; k < combienC && possibles.length; k++){
        const x = possibles[Math.floor(h() * possibles.length)];
        if (confs.some(y => x.t0 < y.t1 && y.t0 < x.t1)) continue;
        confs.push(x);
      }
      confs.sort((a, b) => a.t0 - b.t0);
    }

    gens.push({
      v: v, jour: jour, arrivee: arrivee, fin: fin, duree: fin - arrivee,
      entree: salon.iEntrees[Math.floor(h() * salon.iEntrees.length)],
      /* Une sortie sur deux seulement : beaucoup de visiteurs ressortent par
         où ils sont entrés, ou ne s'en soucient pas. */
      sortie: h() < .5 ? salon.iSorties[Math.floor(h() * salon.iSorties.length)] : -1,
      stands: [...vus].sort((a, b) => a - b),
      confs: confs,
    });
  }
  return gens;
}

/* ------------------------------------------------------------------
   Ranger la journée d'un visiteur
   ------------------------------------------------------------------ */
const TV = 20, ALLURE = 1.2;
const tempsCreneau = (c, m, n) => m / (ALLURE * 60) + n * TV;

/**
 * Les créneaux d'un visiteur : les intervalles entre ses conférences.
 *
 * C'est la structure que `prepareSejour` monte en vrai, réduite à un jour.
 * Une conférence n'est jamais dans `stands` : elle **borne** deux créneaux,
 * et c'est ce qui en fait une ancre que rien ne déplace.
 */
function creneauxDe(g){
  const creneaux = [];
  let de = g.entree, t0 = g.arrivee;
  g.confs.forEach(x => {
    creneaux.push({ de: de, t0: t0, vers: x.i, tMax: x.t0, stands: [] });
    de = x.i; t0 = x.t1;
  });
  creneaux.push({ de: de, t0: t0, vers: g.sortie, tMax: g.fin,
                  dernier: true, stands: [] });
  return creneaux;
}

/**
 * Une simulation complète.
 *
 * `mode` vaut « actuel » — le moteur de routage tel qu'il est, aucune notion
 * de concentration — ou « repartition-temporelle ». Les deux emploient
 * **le même code** : la différence est qu'on lui passe, ou non, ce qu'il faut
 * pour chiffrer la concentration. Comparer deux modes vaut mieux que comparer
 * deux versions, parce qu'alors la différence observée ne peut venir que de là.
 *
 * Les visiteurs sont traités l'un après l'autre. Chacun lit la concentration
 * **figée** au moment où il calcule : l'optimiseur essaie des dizaines
 * d'ordres, et aucun ne doit modifier ce que le suivant lira. La charge n'est
 * versée au compteur commun qu'une fois le parcours retenu.
 */
function simuleSalon(o){
  const { salon, visiteurs, mode } = o;
  const reglage = o.reglage || REGLAGE_SEUIL;
  const avec = mode === "repartition-temporelle";
  const SEUILS = salon.stands.map(s => seuilConcentration(s, reglage));

  /* La concentration engagée : ressource × jour × tranche → nos utilisateurs.
     C'est exactement la forme que la production persiste déjà. */
  const charge = new Map();
  const cle = (s, j, t) => s + "|" + j + "|" + t;

  let photo = new Map(), jourCourant = 0, appels = 0;
  const distComptee = (a, b) => { appels++; return salon.dist(a, b); };

  /* La ressource, au sens du moteur : ce qui a un seuil et se remplit. Seuls
     les stands en sont aujourd'hui ; zones, entrées et liaisons prendront la
     même forme sans que le moteur change. */
  const plafond = {
    ressource: (i) => (SEUILS[i] > 0
      ? { id: "stand-" + i, genre: "stand", seuil: SEUILS[i],
          source: "surface" } : null),
    chargeAnnoncee: (cleJour, i, tr) => photo.get(cle(i, jourCourant, tr)) || 0,
    /* Pas de dilatation ici : le seuil est un compte brut de nos utilisateurs,
       invariant au taux d'adoption. */
    dilatation: () => 1,
  };

  const t0 = Date.now();
  const parcours = [];
  for (const g of visiteurs){
    photo = new Map(charge);
    jourCourant = g.jour;
    const j = { cle: "J" + g.jour, poids: 1, creneaux: creneauxDe(g) };
    const restants = g.stands.slice();
    rangeSejour([j], restants, distComptee, tempsCreneau, ALLURE * 60 * TV,
                null, avec ? plafond : null);

    /* Le déroulé : l'heure d'arrivée sur chaque stand, telle que le moteur la
       calcule — aucun second système de temps. */
    const etapes = [];
    let metres = 0;
    j.creneaux.forEach(c => {
      let m = 0, prec = c.de;
      c.stands.forEach((s, k) => {
        m += salon.dist(prec, s); prec = s;
        etapes.push({ s: s, t: c.t0 + tempsCreneau(c, m, k) });
      });
      metres += m + salon.dist(prec, c.vers);
    });
    etapes.forEach(e => {
      const k = cle(e.s, g.jour, trancheDe(e.t));
      charge.set(k, (charge.get(k) || 0) + 1);
    });
    parcours.push({
      v: g.v, jour: g.jour, metres: metres, dehors: restants.length,
      /* La durée réelle de la journée rangée, de l'arrivée au dernier départ. */
      duree: etapes.length ? etapes[etapes.length - 1].t + TV - g.arrivee : 0,
      etapes: etapes,
    });
  }
  return { charge, parcours, seuils: SEUILS, appels,
           ms: Date.now() - t0, mode: mode };
}

module.exports = { REGLAGE_SEUIL, seuilConcentration, hasardDe,
                   construitSalon, construitVisiteurs, simuleSalon,
                   creneauxDe, tempsCreneau, TV, ALLURE, trancheDe,
                   peineDeCharge };
