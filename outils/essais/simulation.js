/*
 * Trois moteurs, cinq taux d'adoption.
 *
 *     npm run simulation            # les cinq taux
 *     npm run simulation -- 3 10    # ces taux-là seulement, en pour cent
 *
 * La question : la gestion temporelle de la congestion réduit-elle les
 * attroupements sans faire exploser la marche ? Elle ne se répond que par la
 * mesure, et sur les mêmes gens — chaque taux tire une population une fois,
 * et les trois moteurs la rangent tous les trois.
 *
 * Les trois moteurs :
 *   • **ancien**   — le moteur sans aucune gestion de la congestion ;
 *   • **actuelle** — celui du dernier commit : la peine en mètres, la
 *     tranche de trente minutes lue comme une case, le visiteur non compté ;
 *   • **nouvelle** — celui de l'arbre de travail : charge lissée autour de
 *     l'heure d'arrivée, visiteur compté parmi ceux qu'il gêne, permutation
 *     des créneaux qui paient.
 *
 * « actuelle » est vraiment extraite du commit, et non réécrite ici : sans
 * quoi la comparaison porterait sur ce que je dis de l'ancienne version.
 */
const fs = require("fs");
const cp = require("child_process");
const os = require("os");
const path = require("path");
const { depuis } = require("./ordonnanceur.js");

const NEUF = depuis();
const tmp = path.join(os.tmpdir(), "journee-committee.html");
fs.writeFileSync(tmp, cp.execSync("git show HEAD:outils/gabarit/_journee.html",
                                  { cwd: path.join(__dirname, "..", ".."),
                                    maxBuffer: 64 << 20 }));
const ANCIEN = depuis(tmp);

/* ------------------------------------------------------------------
   Le salon : Franchise Expo Paris, à la louche. Cinq cents exposants,
   dix mille visiteurs par jour, un hall de Porte de Versailles.
   ------------------------------------------------------------------ */
const EXPOSANTS = 500, VISITEURS_JOUR = 10000, PAR_LISTE = 14;
const ARGS = process.argv.slice(2).map(Number).filter(n => n > 0);
const TAUX = ARGS.length ? ARGS.map(n => n / 100) : [.03, .05, .10, .20, .30];

const TV = 20, ALLURE = 1.2, OUVERTURE = 600, FERMETURE = 1140;
const tempsCreneau = (c, m, n) => m / (ALLURE * 60) + n * TV;

const PAR_TRAVEE = 25, XY = [];
for (let i = 0; i < EXPOSANTS; i++)
  XY.push([(i % PAR_TRAVEE) * 6, Math.floor(i / PAR_TRAVEE) * 12]);
const TOUT = XY.concat([[-20, -20]]), I_ENTREE = EXPOSANTS;
const dist = (a, b) => (a < 0 || b < 0 || !TOUT[a] || !TOUT[b]) ? 0 :
  Math.abs(TOUT[a][0] - TOUT[b][0]) + Math.abs(TOUT[a][1] - TOUT[b][1]);

/* Un tirage reproductible : deux exécutions rendent les mêmes chiffres, sans
   quoi comparer deux moteurs ne voudrait rien dire. */
const graineur = (g) => () =>
  (g = (g * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;

/* Les surfaces d'un salon de franchise : beaucoup de petits modules, quelques
   têtes d'affiche. La notoriété suit la taille sans lui être proportionnelle. */
const h0 = graineur(20260322);
const SURFACES = [], POIDS = [];
for (let i = 0; i < EXPOSANTS; i++){
  const u = h0();
  SURFACES.push(u < .55 ? 9 : u < .75 ? 12 : u < .87 ? 18 : u < .94 ? 27
              : u < .975 ? 45 : u < .993 ? 90 : 150);
  POIDS.push(Math.pow(SURFACES[i], .7) * (.6 + .8 * h0()));
}
/* La capacité théorique, telle que la page la calcule : trois visiteurs par
   tranche de dix mètres carrés, plancher à trois, plafond à soixante. */
const capaciteTheorique = (i) =>
  Math.max(3, Math.min(60, Math.round(SURFACES[i] * 3 / 10)));

const CUMUL = []; { let t = 0; for (const p of POIDS) CUMUL.push(t += p); }
const TP = CUMUL[CUMUL.length - 1];

/* Les listes et les heures d'arrivée, tirées une fois par taux et partagées
   par les trois moteurs. Les heures qu'on observe : une pointe le matin, une
   traîne l'après-midi — toutes à l'ouverture serait le pire cas, pas le cas. */
function population(n){
  const h = graineur(777 + n), gens = [];
  for (let v = 0; v < n; v++){
    const vus = new Set();
    while (vus.size < PAR_LISTE){
      const x = h() * TP;
      let lo = 0, hi = EXPOSANTS - 1;
      while (lo < hi){ const m = (lo + hi) >> 1; if (CUMUL[m] < x) lo = m + 1; else hi = m; }
      vus.add(lo);
    }
    const u = h();
    const t = u < .40 ? 600 + h() * 60 : u < .70 ? 660 + h() * 90
            : u < .90 ? 750 + h() * 150 : 900 + h() * 120;
    gens.push({ liste: [...vus].sort((a, b) => a - b),
                arrivee: Math.round(t / 10) * 10 });
  }
  return gens;
}

/* ------------------------------------------------------------------
   Une passe : chacun range sa journée, l'un après l'autre, en lisant ce que
   les précédents ont annoncé — et jamais ce qu'il est en train d'essayer.
   ------------------------------------------------------------------ */
function passe(moteur, gens, avecCapacite){
  const { rangeSejour, trancheDe, dilatationPour, TRANCHES_MINI } = moteur;
  const charge = new Map();
  const cle = (s, t) => s + ":" + t;
  /* La charge du moment est figée le temps d'un rangement : l'optimiseur
     essaie des dizaines d'ordres, et aucun ne doit modifier ce que le suivant
     lira. Elle n'est versée dans le compteur commun qu'une fois le parcours
     retenu. */
  let photo = new Map(), dilat = 1;

  const recalcule = () => {
    if (!dilatationPour) return 1;
    let demande = 0, capacite = 0, tMin = 48, tMax = -1;
    const vus = new Set();
    for (const [k, n] of photo){
      const p = k.indexOf(":"), sd = +k.slice(0, p), t = +k.slice(p + 1);
      demande += n;
      if (t < tMin) tMin = t;
      if (t > tMax) tMax = t;
      if (!vus.has(sd)){ vus.add(sd); capacite += capaciteTheorique(sd); }
    }
    if (tMax < 0 || !capacite) return 1;
    return dilatationPour(demande /
      (capacite * Math.max(TRANCHES_MINI || 12, tMax - tMin + 1)));
  };

  /* Le contrat, dans les deux formes qu'il a eues : la version committée
     demande `capacite(i)`, `charge(...)` et `facteur(...)` ; celle
     d'aujourd'hui `ressource(i)`, `chargeAnnoncee(...)` et `dilatation(...)`.
     On sert les deux, pour que la comparaison porte sur les moteurs et non sur
     le nom de leurs entrées. */
  const plafond = {
    capacite: (i) => capaciteTheorique(i),
    capaciteTheorique: (i) => capaciteTheorique(i),
    ressource: (i) => ({ id: "s" + i, genre: "stand",
                         capacite: capaciteTheorique(i), source: "surface" }),
    chargeAnnoncee: (j, i, tr) => photo.get(cle(i, tr)) || 0,
    charge: (j, i, tr) => photo.get(cle(i, tr)) || 0,
    dilatation: () => dilat,
    facteur: () => dilat,
  };

  const parcours = [];
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
    let m = 0, prec = I_ENTREE;
    const etapes = j.creneaux[0].stands.map((sd, k) => {
      m += dist(prec, sd); prec = sd;
      return { s: sd, tr: trancheDe(g.arrivee + m / (ALLURE * 60) + k * TV) };
    });
    etapes.forEach(e => charge.set(cle(e.s, e.tr),
                                   (charge.get(cle(e.s, e.tr)) || 0) + 1));
    parcours.push({ metres: m, dehors: restants.length,
                    stands: etapes.map(e => e.s) });
  }
  return { charge, parcours };
}

/* ------------------------------------------------------------------
   Ce qu'on en retient. La surcharge se mesure toujours contre la capacité
   **théorique** : la dilatation est une commodité du calcul, pas une place
   de plus sur le stand.
   ------------------------------------------------------------------ */
function mesure(r){
  const d = r.parcours.map(p => p.metres).sort((a, b) => a - b);
  const moy = (a) => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
  const taux = [], surcharges = [];
  let enSurcharge = 0, visites = 0, fort = new Set();
  for (const [k, n] of r.charge){
    const s = +k.slice(0, k.indexOf(":"));
    const t = n / capaciteTheorique(s);
    taux.push(t); visites += n;
    if (n > capaciteTheorique(s)) enSurcharge += n - capaciteTheorique(s);
    surcharges.push(Math.max(0, t - 1));
    if (t > 1.5) fort.add(s);
  }
  return {
    dMoy: moy(d), dMed: d[d.length >> 1] || 0, dMax: d[d.length - 1] || 0,
    surMoy: moy(surcharges), surMax: taux.length ? Math.max(...taux) : 0,
    enSurcharge, visites, fort: fort.size,
    dehors: r.parcours.reduce((t, p) => t + p.dehors, 0),
    paires: r.parcours.reduce((t, p) => t + p.stands.length, 0),
  };
}

/* Le lissage se mesure sur le même moteur que son absence : le comparer
   d'une version à l'autre mêlerait deux changements en un chiffre. */
const NEUF_CASE = depuis();
if (NEUF_CASE.poseLissage) NEUF_CASE.poseLissage(false);

const MOTEURS = [
  ["ancien    ", ANCIEN,    false],
  ["actuelle  ", ANCIEN,    true],
  ["nouv. case", NEUF_CASE, true],
  ["nouv. liss", NEUF,      true],
];

console.log("\n" + EXPOSANTS + " exposants, " + VISITEURS_JOUR +
            " visiteurs/jour, listes de " + PAR_LISTE + " stands\n");
for (const t of TAUX){
  const n = Math.round(VISITEURS_JOUR * t);
  const gens = population(n);
  console.log("── " + (Math.round(t * 1000) / 10) + " % d'adoption — " + n +
              " journées organisées");
  console.log("              distance m/méd/max      surcharge moy/max   " +
              "visites   stands   visites    couples");
  console.log("                                                          " +
              "en surch. >150 %  impossibles  gardés");
  for (const [nom, moteur, avec] of MOTEURS){
    const t0 = Date.now();
    const m = mesure(passe(moteur, gens, avec));
    const s = (x, l) => String(x).padStart(l);
    console.log("  " + nom + "  " +
      s(Math.round(m.dMoy), 5) + " " + s(Math.round(m.dMed), 5) + " " +
      s(Math.round(m.dMax), 5) + " m   " +
      s(Math.round(m.surMoy * 100) + " %", 6) + " " +
      s((Math.round(m.surMax * 10) / 10) + "×", 7) + "   " +
      s(m.enSurcharge, 6) + "   " + s(m.fort, 4) + "   " +
      s(m.dehors, 6) + "     " + s(m.paires, 6) +
      "   (" + Math.round((Date.now() - t0) / 1000) + " s)");
  }
  console.log("");
}
