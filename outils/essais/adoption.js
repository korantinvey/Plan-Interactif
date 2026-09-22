/*
 * Ce que la capacité coûte et rapporte, selon la part de visiteurs qui s'en
 * servent.
 *
 *     npm run adoption               # les cinq taux, dilatation livrée
 *     npm run adoption -- sans       # dilatation neutralisée
 *     npm run adoption -- demande    # dilatation suivant la demande (l'ancienne)
 *
 * La question à laquelle ce banc répond n'est pas « le mécanisme marche-t-il »
 * — les huit cas de `capacite.js` s'en chargent — mais « à quel taux d'adoption
 * commence-t-il à faire marcher les gens pour rien ». Elle ne se répond que par
 * la mesure : la capacité est un budget de concentration de nos seuls
 * utilisateurs, et ce budget se serre à mesure qu'ils sont nombreux.
 *
 * Chaque taux est joué deux fois sur **exactement les mêmes** listes et les
 * mêmes heures d'arrivée — sans capacité, puis avec — de sorte que les écarts
 * de marche soient des écarts, et non deux tirages différents.
 */
const O = require("./ordonnanceur.js");
const { rangeSejour, trancheDe, peineDeCharge, dilatationPour, TRANCHES_MINI } = O;

/* ------------------------------------------------------------------
   Le salon : Franchise Expo Paris, à la louche

   Cinq cents exposants, dix mille visiteurs par jour, un hall de Porte de
   Versailles — vingt travées de vingt-cinq emplacements.
   ------------------------------------------------------------------ */
const EXPOSANTS = 500, VISITEURS_JOUR = 10000, PAR_LISTE = 14;
const TAUX = [0.03, 0.05, 0.10, 0.20, 0.30];
const MODE = process.argv[2] || "livree";    // livree | sans | demande

const TV = 20, ALLURE = 1.2, OUVERTURE = 600, FERMETURE = 1140;
const tempsCreneau = (c, m, n) => m / (ALLURE * 60) + n * TV;

const PAR_TRAVEE = 25, XY = [];
for (let i = 0; i < EXPOSANTS; i++)
  XY.push([(i % PAR_TRAVEE) * 6, Math.floor(i / PAR_TRAVEE) * 12]);
const TOUT = XY.concat([[-20, -20]]), I_ENTREE = EXPOSANTS;
const dist = (a, b) => (a < 0 || b < 0 || !TOUT[a] || !TOUT[b]) ? 0 :
  Math.abs(TOUT[a][0] - TOUT[b][0]) + Math.abs(TOUT[a][1] - TOUT[b][1]);

/* Un tirage reproductible : deux exécutions doivent rendre les mêmes chiffres,
   sans quoi comparer deux réglages ne veut rien dire. */
function graineur(g){
  return () => (g = (g * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
}

/* Les surfaces d'un salon de franchise : beaucoup de petits modules, quelques
   têtes d'affiche. La notoriété suit la taille sans lui être proportionnelle —
   un stand deux fois plus grand attire plus, pas deux fois plus. */
const hasard0 = graineur(20260322);
const SURFACES = [], POIDS = [];
for (let i = 0; i < EXPOSANTS; i++){
  const u = hasard0();
  const m2 = u < .55 ? 9 : u < .75 ? 12 : u < .87 ? 18 : u < .94 ? 27
           : u < .975 ? 45 : u < .993 ? 90 : 150;
  SURFACES.push(m2);
  POIDS.push(Math.pow(m2, 0.7) * (0.6 + 0.8 * hasard0()));
}
/* La capacité **théorique**, telle que la page la calcule : trois visiteurs
   par tranche de dix mètres carrés, plancher à trois, plafond à soixante. */
const capaciteTheorique = (i) =>
  Math.max(3, Math.min(60, Math.round(SURFACES[i] * 3 / 10)));

const CUMUL = []; { let t = 0; for (const p of POIDS) CUMUL.push(t += p); }
const TP = CUMUL[CUMUL.length - 1];

/* Les listes et les heures d'arrivée, tirées une fois par taux et **partagées**
   entre les deux passes. */
function population(n){
  const h = graineur(777 + n);
  const gens = [];
  for (let v = 0; v < n; v++){
    const vus = new Set();
    while (vus.size < PAR_LISTE){
      const x = h() * TP;
      let lo = 0, hi = EXPOSANTS - 1;
      while (lo < hi){ const m = (lo + hi) >> 1; if (CUMUL[m] < x) lo = m + 1; else hi = m; }
      vus.add(lo);
    }
    /* Les heures d'arrivée qu'on observe : une pointe le matin, une traîne
       l'après-midi. Toutes à l'ouverture serait le pire cas, pas le cas. */
    const u = h();
    const t = u < .40 ? 600 + h() * 60 : u < .70 ? 660 + h() * 90
            : u < .90 ? 750 + h() * 150 : 900 + h() * 120;
    gens.push({ liste: [...vus].sort((a, b) => a - b),
                arrivee: Math.round(t / 10) * 10 });
  }
  return gens;
}

/* ------------------------------------------------------------------
   Une passe : tout le monde organise sa journée, l'un après l'autre,
   chacun lisant ce que les précédents ont annoncé.
   ------------------------------------------------------------------ */
function passe(gens, avecCapacite){
  const charge = new Map();
  const cle = (s, t) => s + ":" + t;
  const parcours = [];
  let photo = new Map(), dilat = 1;

  /* La dilatation, calculée comme la page la calcule : sur les stands qui ont
     une charge annoncée et une capacité connue. */
  const recalcule = () => {
    if (MODE === "sans") return 1;
    let demande = 0, capacite = 0, tMin = 48, tMax = -1;
    const vus = new Set();
    for (const [k, n] of photo){
      const p = k.indexOf(":");
      const s = +k.slice(0, p), t = +k.slice(p + 1);
      demande += n;
      if (t < tMin) tMin = t;
      if (t > tMax) tMax = t;
      if (!vus.has(s)){ vus.add(s); capacite += capaciteTheorique(s); }
    }
    if (tMax < 0 || !capacite) return 1;
    const r = demande / (capacite * Math.max(TRANCHES_MINI, tMax - tMin + 1));
    /* « demande » rejoue la dilatation d'avant — celle qui suivait le rapport
       constaté, plafonnée à quatre. C'est la comparaison qu'on veut. */
    return MODE === "demande" ? Math.min(4, Math.max(1, r)) : dilatationPour(r);
  };

  const plafond = {
    capaciteTheorique: (i) => capaciteTheorique(i),
    chargeAnnoncee: (j, i, tr) => photo.get(cle(i, tr)) || 0,
    dilatation: () => dilat,
  };

  for (const g of gens){
    photo = new Map(charge);
    if (avecCapacite) dilat = recalcule();
    const j = { cle: "J", poids: 1, arrivee: g.arrivee, fermeture: FERMETURE,
                creneaux: [] };
    j.creneaux.push({ de: I_ENTREE, t0: g.arrivee, vers: -1, tMax: FERMETURE,
                      dernier: true, stands: [] });
    const restants = g.liste.slice();
    rangeSejour([j], restants, dist, tempsCreneau, ALLURE * 60 * TV, null,
                avecCapacite ? plafond : null);
    let m = 0, prec = I_ENTREE, peine = 0;
    const etapes = j.creneaux[0].stands.map((s, k) => {
      m += dist(prec, s); prec = s;
      const tr = trancheDe(g.arrivee + m / (ALLURE * 60) + k * TV);
      /* Ce que ce visiteur-là a payé, à la charge qu'il voyait en calculant. */
      peine += peineDeCharge(photo.get(cle(s, tr)) || 0,
                             capaciteTheorique(s) * dilat);
      return { s, tr };
    });
    etapes.forEach(e => charge.set(cle(e.s, e.tr), (charge.get(cle(e.s, e.tr)) || 0) + 1));
    parcours.push({ metres: m, peine, dehors: restants.length,
                    visites: etapes.length });
  }
  return { charge, parcours };
}

/* ------------------------------------------------------------------
   Ce qu'on en retient
   ------------------------------------------------------------------ */
function mesure(gens, sans, avec){
  const taux = (c) => {
    /* La surcharge d'une cellule : ce qu'elle porte au-delà de la capacité
       **théorique**. C'est bien celle-là qu'on veut voir — la dilatation est
       une commodité du calcul, pas une place de plus sur le stand. */
    const r = [];
    for (const [k, n] of c.charge){
      const s = +k.slice(0, k.indexOf(":"));
      r.push(n / capaciteTheorique(s));
    }
    return r;
  };
  const rs = taux(sans), ra = taux(avec);
  const moy = (a) => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
  const max = (a) => a.length ? Math.max(...a) : 0;
  /* La surcharge : la part au-dessus de la capacité, zéro en dessous. Moyenner
     les taux bruts noierait le récit — la plupart des cellules sont vides. */
  const sur = (a) => a.map(x => Math.max(0, x - 1));

  const dM = avec.parcours.map((p, i) => p.metres - sans.parcours[i].metres);
  const penalises = avec.parcours.filter(p => p.peine > 0).length;
  const deviés = dM.filter(d => Math.abs(d) > 1).length;
  const perdusS = sans.parcours.reduce((t, p) => t + p.dehors, 0);
  const perdusA = avec.parcours.reduce((t, p) => t + p.dehors, 0);

  /* La distribution : combien de cellules dans chaque tranche d'occupation. */
  const BORNES = [0.6, 1, 1.5, 2, 3, Infinity];
  const hist = (a) => {
    const h = new Array(BORNES.length).fill(0);
    a.forEach(x => { for (let i = 0; i < BORNES.length; i++)
      if (x <= BORNES[i]){ h[i]++; break; } });
    return h;
  };
  return {
    gens: gens.length,
    surMoy: [moy(sur(rs)), moy(sur(ra))],
    surMax: [max(rs), max(ra)],
    penalises, deviés,
    dMoy: moy(dM), dMax: max(dM), dMin: Math.min(...dM),
    metresBase: moy(sans.parcours.map(p => p.metres)),
    perdus: [perdusS, perdusA],
    hist: [hist(rs), hist(ra)],
    cellules: [rs.length, ra.length],
  };
}

const NOM = { livree: "dilatation livrée (progressive, plafonnée à 1,20)",
              sans: "sans dilatation", demande: "dilatation suivant la demande" };
console.log("\n" + EXPOSANTS + " exposants, " + VISITEURS_JOUR +
            " visiteurs/jour, listes de " + PAR_LISTE + " stands");
console.log("Réglage : " + (NOM[MODE] || MODE) + "\n");

const ETIQ = ["≤60 %", "60–100", "100–150", "150–200", "200–300", ">300 %"];
for (const t of TAUX){
  const n = Math.round(VISITEURS_JOUR * t);
  const gens = population(n);
  const sans = passe(gens, false), avec = passe(gens, true);
  const m = mesure(gens, sans, avec);
  const p2 = (x) => (Math.round(x * 1000) / 10) + " %";
  console.log("── " + p2(t) + " d'adoption — " + n + " journées organisées");
  console.log("   surcharge moyenne des stands   " +
    p2(m.surMoy[0]) + "  →  " + p2(m.surMoy[1]));
  console.log("   surcharge maximale             " +
    (Math.round(m.surMax[0] * 10) / 10) + "×  →  " +
    (Math.round(m.surMax[1] * 10) / 10) + "×");
  console.log("   parcours payant une peine      " + m.penalises + " / " + n +
    " (" + Math.round(m.penalises / n * 100) + " %), dont " + m.deviés +
    " réellement déviés");
  console.log("   marche en plus, en moyenne     " +
    (m.dMoy >= 0 ? "+" : "") + Math.round(m.dMoy) + " m sur " +
    Math.round(m.metresBase) + " (" + (m.dMoy >= 0 ? "+" : "") +
    Math.round(m.dMoy / m.metresBase * 100) + " %)");
  console.log("   marche en plus, au pire        +" + Math.round(m.dMax) +
    " m   (au mieux " + Math.round(m.dMin) + " m)");
  console.log("   visites devenues impossibles   " +
    (m.perdus[1] - m.perdus[0]) +
    "   (hors capacité : " + m.perdus[0] + " faute d'heure)");
  console.log("   cellules par occupation        " +
    ETIQ.map((e, i) => e + " " + m.hist[0][i] + "→" + m.hist[1][i]).join("  "));
  console.log("");
}
