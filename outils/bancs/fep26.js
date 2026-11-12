/*
 * SIMULATION SYNTHÉTIQUE FEP26
 *
 *     npm run fep26              # les cinq taux, cinq tirages
 *     npm run fep26 -- 10 2      # ce taux-là, deux tirages
 *
 * Ce que ce banc mesure : deux moteurs de routage sur **exactement les mêmes**
 * visiteurs synthétiques, pour savoir si la répartition temporelle réduit les
 * concentrations qu'Event2Map fabrique lui-même, et à quel prix en marche.
 *
 * Ce que ce banc n'est pas : une reconstitution de Franchise Expo Paris 2026.
 * Les parcours des visiteurs de ce salon n'existent nulle part — ni chez nous,
 * ni ailleurs. Ce qui suit est une population **inventée** à partir de cinq
 * chiffres publics, sous des hypothèses écrites en toutes lettres plus bas.
 * Aucun chiffre produit ici n'est un chiffre de FEP26, et aucun ne doit être
 * cité comme tel.
 */
const fs = require("fs");
const path = require("path");
const S = require("./salon.js");

/* ------------------------------------------------------------------
   Ce qu'on sait de FEP26, et ce qu'on suppose

   Connu (chiffres du salon) : la fréquentation, le nombre d'exposants, la
   durée, le nombre de prises de parole et leur audience cumulée. Cinq
   nombres, et rien d'autre.
   ------------------------------------------------------------------ */
const CONNU = {
  visiteurs: 31937,
  exposants: 550,
  jours: 3,
  conferences: 178,
  auditeurs: 6919,
};

/* Supposé : tout le reste. Chacune de ces valeurs est un choix, révisable,
   et aucune ne vient d'une mesure. */
const SUPPOSE = {
  secteurs: 14,            // la franchise se range par métier, et les métiers sont contigus
  parTravee: 25, pas: 6, ecartTravee: 12,   // un hall de Porte de Versailles
  ouverture: 600, fermeture: 1140,          // 10 h – 19 h
  entrees: [[-20, -20], [80, -20]],
  sorties: [[170, 280], [-20, 280]],
  salles: [[75, -25], [175, 130], [-25, 130]],
  /* La part de visiteurs qui suivent au moins une conférence, déduite des
     6 919 auditeurs cumulés : à 1,4 conférence par auditeur, cela fait
     environ 4 940 personnes, soit 15,5 % des 31 937. On retient 16 %. */
  partConferences: 0.16,
  stands: "9 à 150 m², la moitié en modules de 9",
  souhaits: "loi normale centrée sur 8, bornée par le temps disponible",
  arrivees: "pointe 10 h–11 h 15, creux du déjeuner, traîne jusqu'à 17 h 30",
  duree: "loi normale centrée sur 4 h, de 1 h 30 à 8 h",
};

const TAUX = [.03, .05, .10, .20, .30];
const args = process.argv.slice(2).map(Number).filter(n => n > 0);
const LISTE = args.length ? [args[0] / 100] : TAUX;
const SEEDS = args.length > 1 ? args[1] : 5;

/* ------------------------------------------------------------------
   Les mesures
   ------------------------------------------------------------------ */
const moy = (a) => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
const quantile = (a, q) => {
  if (!a.length) return 0;
  const t = a.slice().sort((x, y) => x - y);
  return t[Math.min(t.length - 1, Math.floor(q * t.length))];
};

/** La suite des stands d'un parcours, dans l'ordre où on les visite. */
const suite = (p) => p.etapes.map(e => e.s);

/** La concentration, cellule par cellule : nos utilisateurs rapportés au seuil. */
function cellules(r){
  const l = [];
  for (const [k, n] of r.charge){
    const s = +k.slice(0, k.indexOf("|"));
    const seuil = r.seuils[s];
    if (seuil > 0) l.push({ s: s, n: n, seuil: seuil, taux: n / seuil });
  }
  return l;
}

function mesure(base, neuf){
  const cb = cellules(base), cn = cellules(neuf);
  const tauxN = cn.map(c => c.taux);
  const depass = cn.filter(c => c.n > c.seuil);
  const fort = new Set(cn.filter(c => c.taux > 1.5).map(c => c.s));

  /* Ce que la répartition a changé, visiteur par visiteur. */
  const dM = [], dT = [], changes = [];
  let modifies = 0, decales = 0;
  neuf.parcours.forEach((p, i) => {
    const b = base.parcours[i];
    dM.push(p.metres - b.metres);
    dT.push(p.duree - b.duree);
    const sa = suite(b), sb = suite(p);
    let diff = 0;
    for (let k = 0; k < Math.max(sa.length, sb.length); k++)
      if (sa[k] !== sb[k]) diff++;
    changes.push(diff);
    if (diff) modifies++;
    /* Décalé dans le temps : au moins une visite tombe dans une autre
       demi-heure qu'au calcul sans répartition. */
    const av = new Map(b.etapes.map(e => [e.s, S.trancheDe(e.t)]));
    if (p.etapes.some(e => av.has(e.s) && av.get(e.s) !== S.trancheDe(e.t)))
      decales++;
  });

  const picDe = (c) => c.length ? Math.max(...c.map(x => x.taux)) : 0;
  return {
    // parcours
    dMoy: moy(neuf.parcours.map(p => p.metres)),
    dMed: quantile(neuf.parcours.map(p => p.metres), .5),
    dP95: quantile(neuf.parcours.map(p => p.metres), .95),
    dureeMoy: moy(neuf.parcours.map(p => p.duree)),
    changesMoy: moy(changes),
    partModifies: modifies / neuf.parcours.length,
    // concentration
    picBase: picDe(cb), pic: picDe(cn),
    concMoy: moy(tauxN), concP95: quantile(tauxN, .95),
    depassements: depass.length,
    depassMoy: depass.length ? moy(depass.map(c => c.n - c.seuil)) : 0,
    depassMax: depass.length ? Math.max(...depass.map(c => c.n - c.seuil)) : 0,
    standsForts: fort.size,
    depassBase: cb.filter(c => c.n > c.seuil).length,
    standsFortsBase: new Set(cb.filter(c => c.taux > 1.5).map(c => c.s)).size,
    // coût
    surMoy: moy(dM), surMed: quantile(dM, .5), surP95: quantile(dM, .95),
    surTemps: moy(dT), decales: decales,
    // ce qu'on a perdu
    dehorsBase: base.parcours.reduce((t, p) => t + p.dehors, 0),
    dehors: neuf.parcours.reduce((t, p) => t + p.dehors, 0),
    souhaits: base.parcours.reduce((t, p) => t + p.etapes.length + p.dehors, 0),
    // performance
    msBase: base.ms, ms: neuf.ms,
    appelsBase: base.appels, appels: neuf.appels,
  };
}

/* ------------------------------------------------------------------
   L'exécution
   ------------------------------------------------------------------ */
console.log("\n╔══════════════════════════════════════════════════════════════╗");
console.log("║  SIMULATION SYNTHÉTIQUE FEP26 — données inventées, non réelles ║");
console.log("╚══════════════════════════════════════════════════════════════╝");
console.log("\nConnu du salon : " + CONNU.visiteurs.toLocaleString("fr-FR") +
  " visiteurs, " + CONNU.exposants + " exposants, " + CONNU.jours +
  " jours,\n                 " + CONNU.conferences + " prises de parole, " +
  CONNU.auditeurs.toLocaleString("fr-FR") + " auditeurs cumulés.");
console.log("Tout le reste est supposé — voir SUPPOSE dans ce fichier.\n");
console.log("Seuil de concentration = f(surface) : " +
  S.REGLAGE_SEUIL.parDix + " par tranche de 10 m², plancher " +
  S.REGLAGE_SEUIL.plancher + ", plafond " + S.REGLAGE_SEUIL.plafond +
  ".\nCe n'est PAS une capacité physique : c'est le nombre d'utilisateurs " +
  "Event2Map\nsimultanés au-delà duquel le moteur cherche à répartir.\n");

const sortie = { connu: CONNU, suppose: SUPPOSE, reglageSeuil: S.REGLAGE_SEUIL,
                 taux: [], stands: null, exemple: null };

for (const t of LISTE){
  const n = Math.round(CONNU.visiteurs * t);
  const runs = [];
  process.stdout.write("── " + (Math.round(t * 1000) / 10) + " % — " + n +
    " utilisateurs Event2Map sur " + CONNU.visiteurs.toLocaleString("fr-FR") +
    " visiteurs  ");
  for (let seed = 1; seed <= SEEDS; seed++){
    const salon = S.construitSalon(Object.assign({}, SUPPOSE, {
      exposants: CONNU.exposants, jours: CONNU.jours,
      conferences: CONNU.conferences, graine: 1000 + seed }));
    const gens = S.construitVisiteurs(salon, n, 5000 + seed, SUPPOSE);
    const base = S.simuleSalon({ salon, visiteurs: gens, mode: "actuel" });
    const neuf = S.simuleSalon({ salon, visiteurs: gens,
                                 mode: "repartition-temporelle" });
    runs.push(mesure(base, neuf));
    /* Le détail par stand et l'exemple de visiteur ne se gardent qu'une fois,
       au taux qui nous intéresse le plus et au premier tirage. */
    if (Math.abs(t - .10) < 1e-9 && seed === 1)
      sortie.detail = { salon, gens, base, neuf };
    process.stdout.write(".");
  }
  process.stdout.write("\n");

  /* Moyenne, minimum, maximum sur les tirages — un seul dirait n'importe quoi. */
  const agg = {};
  Object.keys(runs[0]).forEach(k => {
    const v = runs.map(r => r[k]);
    agg[k] = { moy: moy(v), min: Math.min(...v), max: Math.max(...v) };
  });
  sortie.taux.push({ taux: t, utilisateurs: n, seeds: SEEDS, agg: agg });

  const r3 = (x) => Math.round(x * 10) / 10;
  const p = (x) => Math.round(x * 100) + " %";
  console.log("   pic de concentration     " + r3(agg.picBase.moy) + "×  →  " +
    r3(agg.pic.moy) + "×      (min " + r3(agg.pic.min) + "× / max " +
    r3(agg.pic.max) + "×)");
  console.log("   dépassements du seuil    " + Math.round(agg.depassBase.moy) +
    "  →  " + Math.round(agg.depassements.moy) + " cellules" +
    "   (excès moyen " + r3(agg.depassMoy.moy) + ", max " +
    Math.round(agg.depassMax.moy) + ")");
  console.log("   stands très concentrés   " + Math.round(agg.standsFortsBase.moy) +
    "  →  " + Math.round(agg.standsForts.moy) + "  (au-delà de 1,5× le seuil)");
  console.log("   distance  moy/méd/P95    " + Math.round(agg.dMoy.moy) + " / " +
    Math.round(agg.dMed.moy) + " / " + Math.round(agg.dP95.moy) + " m");
  console.log("   marche en plus           +" + Math.round(agg.surMoy.moy) +
    " m en moyenne, +" + Math.round(agg.surMed.moy) + " médiane, +" +
    Math.round(agg.surP95.moy) + " au P95   (min " +
    Math.round(agg.surMoy.min) + " / max " + Math.round(agg.surMoy.max) + ")");
  console.log("   temps en plus            +" + r3(agg.surTemps.moy) +
    " min par visiteur");
  console.log("   parcours modifiés        " + p(agg.partModifies.moy) +
    ", dont " + Math.round(agg.decales.moy) + " décalés d'une demi-heure" +
    "   (" + r3(agg.changesMoy.moy) + " arrêts déplacés en moyenne)");
  console.log("   visites non placées      " + Math.round(agg.dehorsBase.moy) +
    "  →  " + Math.round(agg.dehors.moy) + "  sur " +
    Math.round(agg.souhaits.moy) + " souhaits   (jamais par refus : voir plus bas)");
  console.log("   calcul                   " + Math.round(agg.msBase.moy / 1000) +
    " s  →  " + Math.round(agg.ms.moy / 1000) + " s   (" +
    r3(agg.ms.moy / n) + " ms par visiteur, " +
    Math.round(agg.appels.moy / Math.max(1, agg.appelsBase.moy) * 10) / 10 +
    "× plus de candidats évalués)");
  console.log("");
}

/* ------------------------------------------------------------------
   Le détail, au taux de dix pour cent
   ------------------------------------------------------------------ */
if (sortie.detail){
  const { salon, gens, base, neuf } = sortie.detail;
  console.log("══ Les dix stands les plus demandés — 10 %, premier tirage ══\n");
  const demande = new Array(salon.stands.length).fill(0);
  gens.forEach(g => g.stands.forEach(s => demande[s]++));
  const rang = demande.map((d, i) => i).sort((a, b) => demande[b] - demande[a])
    .slice(0, 10);

  const picStand = (r, s) => {
    let m = 0;
    for (const [k, n] of r.charge)
      if (+k.slice(0, k.indexOf("|")) === s) m = Math.max(m, n);
    return m;
  };
  const etale = (r, s) => {
    let c = 0;
    for (const [k] of r.charge) if (+k.slice(0, k.indexOf("|")) === s) c++;
    return c;
  };
  console.log("  stand  surface  seuil  demande   pic avant → après   demi-heures occupées");
  const lignes = [];
  rang.forEach(s => {
    const st = salon.stands[s], seuil = neuf.seuils[s];
    const pa = picStand(base, s), pb = picStand(neuf, s);
    const ea = etale(base, s), eb = etale(neuf, s);
    lignes.push({ stand: s, surface: st.surface, seuil, demande: demande[s],
                  picAvant: pa, picApres: pb, cellulesAvant: ea, cellulesApres: eb });
    console.log("  " + String("#" + s).padStart(5) + "  " +
      String(st.surface + " m²").padStart(7) + "  " + String(seuil).padStart(5) +
      "  " + String(demande[s]).padStart(7) + "   " +
      String(pa + " → " + pb).padStart(13) + "   " +
      String(ea + " → " + eb).padStart(14) +
      "   " + (pa > seuil ? (Math.round(pa / seuil * 10) / 10) + "× → " +
               (Math.round(pb / seuil * 10) / 10) + "×" : "sous le seuil"));
  });
  sortie.stands = lignes;

  /* Deux visiteurs montrés en entier : le plus remanié de tous, et un
     ordinaire. Ne montrer que le premier donnerait le pire cas pour le cas
     général, ce qui est la façon la plus courante de mentir avec un exemple
     vrai. */
  const remaniement = (i) => {
    const sa = suite(base.parcours[i]), sb = suite(neuf.parcours[i]);
    let d = 0;
    for (let k = 0; k < Math.max(sa.length, sb.length); k++) if (sa[k] !== sb[k]) d++;
    return d;
  };
  let choix = -1, mieux = 0, ordinaire = -1;
  neuf.parcours.forEach((p, i) => {
    const d = remaniement(i);
    if (base.parcours[i].etapes.length >= 5 && d > mieux){ mieux = d; choix = i; }
    /* L'ordinaire : remanié, mais d'un écart de marche proche de la médiane. */
    if (ordinaire < 0 && d >= 2 && base.parcours[i].etapes.length >= 5 &&
        Math.abs(p.metres - base.parcours[i].metres - 26) < 15) ordinaire = i;
  });
  if (choix >= 0){
    const g = gens[choix], b = base.parcours[choix], p = neuf.parcours[choix];
    console.log("\n══ Le visiteur le PLUS remanié de tous — n° " + g.v +
      " (pire cas, non représentatif) ══\n");
    /* Arrondir la minute AVANT de la séparer de l'heure : 659,6 min rendait
       « 10h60 », ce qui n'est pas une heure. */
    const hm = (t) => {
      const m = Math.round(t);
      return String(Math.floor(m / 60)).padStart(2, "0") + "h" +
             String(m % 60).padStart(2, "0");
    };
    console.log("  jour " + (g.jour + 1) + ", arrivée " + hm(g.arrivee) +
      ", disponible jusqu'à " + hm(g.fin) +
      (g.confs.length ? ", conférence" + (g.confs.length > 1 ? "s" : "") + " à " +
        g.confs.map(c => hm(c.t0)).join(" et ") : ", aucune conférence"));
    console.log("  " + g.stands.length + " exposants souhaités\n");
    const col = (r) => r.etapes.map(e => hm(e.t) + " #" + e.s);
    const A = col(b), B = col(p);
    console.log("     sans répartition        avec répartition");
    for (let k = 0; k < Math.max(A.length, B.length); k++)
      console.log("     " + (A[k] || "").padEnd(22) + "  " + (B[k] || ""));
    console.log("\n     " + Math.round(b.metres) + " m".padEnd(19) + "   " +
      Math.round(p.metres) + " m  (" +
      (p.metres >= b.metres ? "+" : "") + Math.round(p.metres - b.metres) + " m)");
    sortie.exemple = { visiteur: g, avant: b, apres: p };

    if (ordinaire >= 0){
      const g2 = gens[ordinaire], b2 = base.parcours[ordinaire];
      const p2 = neuf.parcours[ordinaire];
      console.log("\n══ Un visiteur ORDINAIRE, réorganisé — n° " + g2.v + " ══\n");
      console.log("  jour " + (g2.jour + 1) + ", arrivée " + hm(g2.arrivee) +
        ", disponible jusqu'à " + hm(g2.fin) +
        (g2.confs.length ? ", conférence à " +
          g2.confs.map(c => hm(c.t0)).join(" et ") : ", aucune conférence"));
      console.log("  " + g2.stands.length + " exposants souhaités\n");
      const A2 = col(b2), B2 = col(p2);
      console.log("     sans répartition        avec répartition");
      for (let k = 0; k < Math.max(A2.length, B2.length); k++)
        console.log("     " + (A2[k] || "").padEnd(22) + "  " + (B2[k] || ""));
      console.log("\n     " + Math.round(b2.metres) + " m" + "".padEnd(17) + "   " +
        Math.round(p2.metres) + " m  (" +
        (p2.metres >= b2.metres ? "+" : "") +
        Math.round(p2.metres - b2.metres) + " m)");
      sortie.exempleOrdinaire = { visiteur: g2, avant: b2, apres: p2 };
    }
  }
  delete sortie.detail;
}

/* ------------------------------------------------------------------
   L'export, pour les graphiques et pour la relecture
   ------------------------------------------------------------------ */
const dossier = path.join(__dirname, "..", "..", "simulations");
fs.mkdirSync(dossier, { recursive: true });
const fichier = path.join(dossier, "fep26-synthetique.json");
fs.writeFileSync(fichier, JSON.stringify(sortie, null, 1));
console.log("\nRésultats écrits dans " + path.relative(process.cwd(), fichier) +
  "\n\nRappel : SIMULATION SYNTHÉTIQUE. Aucun de ces chiffres n'est un chiffre" +
  "\nde Franchise Expo Paris 2026.\n");
