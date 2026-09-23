/*
 * Les huit cas de la capacité, joués sur le vrai `rangeSejour`.
 *
 *     npm run essais
 *
 * Ce que chacun vérifie est écrit en tête de sa section ; ce qu'ils vérifient
 * ensemble tient en une phrase : la capacité d'un stand est un prix, et jamais
 * une porte fermée. Un cas qui casse dit donc, au choix, qu'un stand a été
 * retiré du parcours de quelqu'un, ou que la courbe ne départage plus un
 * détour d'une attente.
 *
 * Le module est extrait du gabarit à la volée — voir `ordonnanceur.js` — plutôt
 * que recopié : un essai qui juge une copie ne juge rien.
 */
const O = require("./ordonnanceur.js");
const { rangeSejour, trancheDe, peineDeCharge } = O;

const TV = 20, ALLURE = 1.2, OUV = 600, FERM = 1140;
const tempsCreneau = (c, m, n) => m / (ALLURE * 60) + n * TV;

let ko = 0;
const dit = (ok, q, d) => {
  console.log((ok ? "  ok   " : "  ÉCHEC") + "  " + q + (d ? "   → " + d : ""));
  if (!ok) ko++;
};

/* Un hall en couloir : chaque stand a une abscisse en mètres, et `dist` rend
   zéro sur un indice négatif — comme la vraie, pour qui « pas de retour » et
   « porte d'entrée » se disent tous deux par -1. */
function hall(x){
  return (a, b) => (a < 0 || b < 0) ? 0 : Math.abs(x[a] - x[b]);
}

/* Le contrat d'essai, avec les trois notions sous leurs vrais noms :
   `cap` est la capacité **théorique**, `charge` la **charge annoncée** par les
   journées organisées, et `dilat` ce dont le moteur desserre la mesure. */
const P = (cap, charge, dilat) => ({
  ressource: (i) => {
    const n = typeof cap === "function" ? cap(i) : cap;
    return n > 0 ? { id: "s" + i, genre: "stand", seuil: n,
                     source: "surface" } : null;
  },
  chargeAnnoncee: (cle, i, tr) => charge(i, tr),
  dilatation: () => (dilat || 1),
});

/* `de` : l'indice du point de départ, ou -1 pour « la porte ne compte pas ».
   La vraie `dist` rend zéro sur un indice négatif — partir de -1, c'est donc
   partir de partout à la fois, et aucun ordre n'y coûte plus qu'un autre. */
function journee(x, stands, plafond, de){
  const dep = de === undefined ? -1 : de;
  const j = { cle: "J", poids: 1, arrivee: OUV, fermeture: FERM, creneaux: [] };
  j.creneaux.push({ de: dep, t0: OUV, vers: -1, tMax: FERM, dernier: true, stands: [] });
  const restants = stands.slice();
  rangeSejour([j], restants, hall(x), tempsCreneau, ALLURE * 60 * TV, null, plafond);
  const ordre = j.creneaux[0].stands.slice();
  /* L'heure d'arrivée sur chaque stand, telle que le moteur la calcule. */
  const heures = {};
  let m = 0, prec = dep;
  ordre.forEach((s, k) => {
    m += hall(x)(prec, s); prec = s;
    heures[s] = OUV + tempsCreneau({}, m, k);
  });
  return { ordre, dehors: restants.slice(), heures,
           tranche: (s) => trancheDe(heures[s]) };
}

console.log("\n=== La courbe elle-même ===");
[[0, 3], [1, 3], [2, 3], [3, 3], [3.6, 3], [4.5, 3], [9, 3], [30, 3]]
  .forEach(([c, k]) => console.log("   " + String(Math.round(c / k * 100) + " %").padStart(6) +
    "  →  " + Math.round(peineDeCharge(c, k)) + " m"));

console.log("\n=== 1. Petit stand, faible demande : aucune pénalité ===");
dit(peineDeCharge(0, 3) === 0, "vide : 0 m");
dit(peineDeCharge(1, 3) === 0, "un visiteur sur trois places (33 %) : 0 m");
dit(peineDeCharge(1.8, 3) === 0, "pile au seuil de 60 % : 0 m");
{
  const x = [0, 100, 200];
  const sans = journee(x, [0, 1, 2], null);
  const avec = journee(x, [0, 1, 2], P(3, (i, t) => (t === 20 ? 1 : 0)));
  dit(JSON.stringify(sans.ordre) === JSON.stringify(avec.ordre),
      "l'ordre est celui du calcul sans capacité", JSON.stringify(avec.ordre));
}

console.log("\n=== 2. Proche de 100 % : peine significative, stand gardé ===");
{
  const p90 = peineDeCharge(2.7, 3);
  dit(p90 > 100 && p90 < 250, "à 90 % la peine est significative", Math.round(p90) + " m");
  dit(p90 > peineDeCharge(2.1, 3), "et plus forte qu'à 70 %",
      Math.round(peineDeCharge(2.1, 3)) + " m à 70 %");
  const x = [0, 100, 200];
  const r = journee(x, [0, 1, 2], P(3, (i) => (i === 2 ? 2.7 : 0)));
  dit(r.ordre.length === 3 && r.dehors.length === 0,
      "les trois stands sont dans la journée", JSON.stringify(r.ordre));
}

console.log("\n=== 3. Au-dessus de 100 % : peine forte, stand toujours choisi ===");
{
  const p120 = peineDeCharge(3.6, 3), p150 = peineDeCharge(4.5, 3);
  dit(p120 > 400, "à 120 % la peine dépasse un changement de pavillon (300 m)",
      Math.round(p120) + " m");
  dit(p150 > p120, "à 150 % elle est encore plus forte", Math.round(p150) + " m");
  const x = [0, 100, 200];
  const r = journee(x, [0, 1, 2], P(3, () => 4.5));   // tout à 150 %
  dit(r.ordre.length === 3 && r.dehors.length === 0,
      "tout à 150 % : personne n'est retiré", JSON.stringify(r.ordre));
}

console.log("\n=== 4. Salon surdemandé : la dilatation desserre, sans plus ===");
{
  const D = O.dilatationPour;
  dit(D(0.8) === 1 && D(1) === 1, "sous la capacité, rien n'est desserré");
  dit(D(1.25) > 1 && D(1.25) <= 1.07,
      "à 1,25× de demande, un desserrage léger", "×" + D(1.25).toFixed(3));
  dit(D(1.5) > D(1.25), "à 1,5×, un peu plus", "×" + D(1.5).toFixed(3));
  dit(D(2) > D(1.5) && D(2) <= 1.2, "à 2×, plafonné", "×" + D(2).toFixed(3));
  dit(D(4) === D(2) && D(20) === D(2),
      "et au-delà de 2× plus rien ne bouge : la dilatation ne suit pas la demande",
      "×" + D(20).toFixed(3));

  /* La propriété qui compte : la demande produit encore de la peine une fois
     la capacité adaptée. Sans quoi le système dirait « puisqu'ils sont
     nombreux à le vouloir, il peut les recevoir », ce qui est circulaire. */
  const capT = 12, demande = 24;
  const effective = capT * D(demande / capT);
  dit(peineDeCharge(demande, effective) > 700,
      "un stand à 12 places demandé 24 fois paie encore cher après dilatation",
      "capacité effective " + effective.toFixed(1) + ", peine " +
      Math.round(peineDeCharge(demande, effective)) + " m");
  dit(peineDeCharge(demande, effective) > peineDeCharge(demande, demande) + 500,
      "très au-dessus de ce qu'une dilatation à la demande rendrait",
      "contre " + Math.round(peineDeCharge(demande, demande)) + " m");

  const x = [0, 100, 200];
  const r = journee(x, [0, 1, 2], P(3, () => 6, D(2)));
  dit(r.ordre.length === 3 && r.dehors.length === 0,
      "et tout reste placé", JSON.stringify(r.ordre));
}

console.log("\n=== 5. Deux trajets équivalents : le moins chargé l'emporte ===");
{
  /* Porte au milieu (indice 2), deux stands à égale distance de part et
     d'autre : les deux ordres coûtent exactement les mêmes mètres. */
  const x = [-400, 400, 0], PORTE = 2;
  const eq = hall(x);
  console.log("   (A puis B : " + (eq(PORTE, 0) + eq(0, 1)) + " m ; B puis A : " +
              (eq(PORTE, 1) + eq(1, 0)) + " m)");
  /* A est chargé sur la première demi-heure, calme sur la seconde. */
  const r = journee(x, [0, 1], P(3, (i, t) => (i === 0 && t === 20) ? 3 : 0), PORTE);
  dit(r.ordre[0] === 1, "B passe en premier, A hérite de la demi-heure calme",
      "ordre " + JSON.stringify(r.ordre) + ", A en tranche " + r.tranche(0));
  dit(r.tranche(0) !== 20, "A ne tombe plus sur sa demi-heure chargée");
}

console.log("\n=== 6. Un détour un peu plus long, beaucoup moins chargé ===");
{
  /* Exactement l'arbitrage du cahier des charges : trente mètres de détour
     contre un stand à 70 % plutôt qu'à 30 %.

     Les charges se lisent **le visiteur compris** : 1,1 déjà annoncé plus
     lui-même font 2,1 sur trois places, soit les 70 % voulus. C'est la lecture
     du moteur depuis qu'il se compte parmi ceux qu'il gêne, et écrire 2,1 ici
     décrirait un stand à 103 %. */
  const x = [-400, 430, 0], PORTE = 2;
  const eq = hall(x);
  const court = eq(PORTE, 0) + eq(0, 1), long = eq(PORTE, 1) + eq(1, 0);
  console.log("   (A puis B : " + court + " m ; B puis A : " + long +
              " m — soit " + (long - court) + " m de détour)");
  const r = journee(x, [0, 1], P(3, (i, t) => (i === 0 && t === 20) ? 1.1 : 0), PORTE);
  dit(r.ordre[0] === 1,
      "le détour de " + (long - court) + " m est justifié par la charge",
      "ordre " + JSON.stringify(r.ordre));
  dit(peineDeCharge(2.1, 3) > long - court,
      "la peine à 70 % (" + Math.round(peineDeCharge(2.1, 3)) +
      " m) couvre bien le détour (" + (long - court) + " m)");

  /* Le contrôle en sens inverse, sans lequel le cas ne prouverait rien : un
     détour que la charge ne paie pas ne doit PAS se faire. Deux cents mètres
     contre une peine de quarante — le trajet court l'emporte. */
  const y = [-400, 600, 0];
  const eqy = hall(y);
  const c2 = eqy(PORTE, 0) + eqy(0, 1), l2 = eqy(PORTE, 1) + eqy(1, 0);
  const r2 = journee(y, [0, 1], P(3, (i, t) => (i === 0 && t === 20) ? 1.1 : 0), PORTE);
  dit(r2.ordre[0] === 0,
      "un détour de " + (l2 - c2) + " m n'est PAS justifié par la même charge",
      "ordre " + JSON.stringify(r2.ordre));
}

console.log("\n=== 7. Un stand très demandé n'est jamais impossible ===");
{
  const x = [0, 100, 200, 300];
  /* Le stand 3 est écrasé : dix fois sa capacité, à toutes les heures. */
  const r = journee(x, [0, 1, 2, 3], P(3, (i) => (i === 3 ? 30 : 0)));
  dit(r.ordre.includes(3), "il est dans la journée", JSON.stringify(r.ordre));
  dit(r.dehors.length === 0, "et rien n'est laissé dehors");
  dit(peineDeCharge(30, 3) < Infinity && peineDeCharge(30, 3) <= O.PEINE_MAX,
      "sa peine reste un nombre, plafonné", Math.round(peineDeCharge(30, 3)) + " m");
}

console.log("\n=== 8. Plusieurs visiteurs : la charge s'étale ===");
{
  /* Dix stands en enfilade, quarante visiteurs qui veulent les mêmes, chacun
     lisant ce que les précédents ont annoncé. Capacité 3 par demi-heure. */
  const N = 10, VIS = 40, CAP = 3;
  const x = Array.from({ length: N }, (_, i) => i * 60);
  const stands = Array.from({ length: N }, (_, i) => i);
  const compte = (avecCapacite) => {
    const ch = {};                                  // stand|tranche → nombre
    const lu = (i, t) => ch[i + "|" + t] || 0;
    for (let v = 0; v < VIS; v++){
      const gele = Object.assign({}, ch);           // photo figée, comme en vrai
      const p = avecCapacite
        ? P(CAP, (i, t) => gele[i + "|" + t] || 0) : null;
      const r = journee(x, stands, p);
      r.ordre.forEach(s => {
        const t = r.tranche(s);
        ch[s + "|" + t] = (ch[s + "|" + t] || 0) + 1;
      });
    }
    let pic = 0, occupees = 0;
    for (const k in ch){ pic = Math.max(pic, ch[k]); occupees++; }
    return { pic, occupees, ch };
  };
  const sans = compte(false), avec = compte(true);
  console.log("   sans capacité : pic " + sans.pic + " sur " + CAP +
              " places (" + Math.round(sans.pic / CAP * 10) / 10 + "×), " +
              sans.occupees + " cellules occupées");
  console.log("   avec capacité : pic " + avec.pic + " sur " + CAP +
              " places (" + Math.round(avec.pic / CAP * 10) / 10 + "×), " +
              avec.occupees + " cellules occupées");
  dit(avec.pic < sans.pic, "le pic baisse", sans.pic + " → " + avec.pic);
  dit(avec.occupees > sans.occupees, "et la charge occupe plus de demi-heures",
      sans.occupees + " → " + avec.occupees);
}

console.log("\n=== 9. La conférence est une ancre : on range autour, pas dedans ===");
{
  /* Une journée coupée par une conférence de 11 h à 12 h. Le moteur ne la
     déplace pas : elle borne deux créneaux, et les stands se rangent de part
     et d'autre. C'est la structure que `prepareSejour` monte en vrai. */
  const x = [0, 60, 120, 180, 240, 300, 90], PORTE = 6;
  const CONF0 = 660, CONF1 = 720;                    // 11 h → 12 h
  const j = { cle: "J", poids: 1, arrivee: OUV, fermeture: FERM, creneaux: [] };
  j.creneaux.push({ de: PORTE, t0: OUV, vers: PORTE, tMax: CONF0, stands: [] });
  j.creneaux.push({ de: PORTE, t0: CONF1, vers: -1, tMax: FERM,
                    dernier: true, stands: [] });
  const stands = [0, 1, 2, 3, 4, 5];
  const restants = stands.slice();
  /* Le stand 0 est chargé pendant toute la matinée : le moteur doit le
     repousser après la conférence plutôt que de tenter de la contourner. */
  rangeSejour([j], restants, hall(x), tempsCreneau, ALLURE * 60 * TV, null,
              P(3, (i, t) => (i === 0 && t < trancheDe(CONF0)) ? 4 : 0));

  const avant = j.creneaux[0].stands, apres = j.creneaux[1].stands;
  dit(avant.length + apres.length === 6 && restants.length === 0,
      "les six stands sont rangés", JSON.stringify(avant) + " | " + JSON.stringify(apres));
  /* L'heure de fin du premier créneau, calculée comme le moteur la calcule. */
  let m = 0, prec = PORTE;
  avant.forEach(sd => { m += hall(x)(prec, sd); prec = sd; });
  const fin = OUV + tempsCreneau({}, m + hall(x)(prec, PORTE), avant.length);
  dit(fin <= CONF0 + 1e-9,
      "rien ne déborde sur la conférence", "fin du matin " + Math.round(fin) +
      " min, conférence à " + CONF0);
  dit(apres.includes(0),
      "le stand chargé le matin est passé de l'autre côté de la conférence");
}

console.log("\n=== 10. Deux pavillons : le réordonnancement ne les multiplie pas ===");
{
  /* Six stands, deux pavillons, et trois cents mètres pour passer de l'un à
     l'autre — la dissuasion qu'emploie le vrai moteur. */
  const HALL = [0, 0, 0, 1, 1, 1];
  const POS = [0, 40, 80, 0, 40, 80];
  const eq = (a, b) => (a < 0 || b < 0) ? 0 :
    Math.abs(POS[a] - POS[b]) + (HALL[a] === HALL[b] ? 0 : 300);
  const passages = (ordre) => {
    let n = 0;
    for (let i = 1; i < ordre.length; i++)
      if (HALL[ordre[i]] !== HALL[ordre[i - 1]]) n++;
    return n;
  };
  const range = (plafond) => {
    const j = { cle: "J", poids: 1, arrivee: OUV, fermeture: FERM, creneaux: [] };
    j.creneaux.push({ de: -1, t0: OUV, vers: -1, tMax: FERM, dernier: true, stands: [] });
    const restants = [0, 1, 2, 3, 4, 5];
    rangeSejour([j], restants, eq, tempsCreneau, ALLURE * 60 * TV, null, plafond);
    return j.creneaux[0].stands.slice();
  };
  const sans = range(null);
  const avec = range(P(3, (i, t) => (i === 1 && t === 20) ? 4 : 0));
  dit(passages(sans) === 1, "sans capacité, un seul passage de pavillon",
      JSON.stringify(sans));
  dit(passages(avec) === 1,
      "avec une charge à éviter, toujours un seul — la dissuasion tient",
      JSON.stringify(avec));
  dit(avec.length === 6, "et les six stands y sont");
}

console.log("\n=== 11. Aucune capacité réglée : le moteur est celui d'avant ===");
{
  const x = [0, 100, 200, 300, 150];
  const stands = [0, 1, 2, 3, 4];
  const sans = journee(x, stands, null);
  /* Une ressource nulle — personne n'a dessiné les stands, ou le réglage est
     fermé — ne doit rien changer du tout. */
  const nulle = journee(x, stands, P(0, () => 99));
  dit(JSON.stringify(nulle.ordre) === JSON.stringify(sans.ordre),
      "capacité inconnue : l'ordre est identique au calcul sans capacité",
      JSON.stringify(nulle.ordre));
  /* Et la capacité venue de la surface, elle, contraint bien. */
  const parSurface = journee(x, stands,
    P((i) => Math.max(3, Math.round([9, 12, 200, 27, 9][i] * 3 / 10)),
      (i, t) => (i === 0 && t === 20) ? 5 : 0));
  dit(parSurface.ordre.length === 5 && parSurface.dehors.length === 0,
      "à la surface : tout est rangé", JSON.stringify(parSurface.ordre));
  dit(parSurface.tranche(0) !== 20,
      "et le stand chargé a changé de demi-heure", "tranche " + parSurface.tranche(0));
}

console.log("\n=== 12. La demi-heure n'est pas une frontière du monde ===");
{
  /* Deux visiteurs identiques à deux minutes près, de part et d'autre de
     10 h 30. Sans lissage, l'un lit une cellule pleine et l'autre une cellule
     vide : deux journées étrangères pour deux minutes. */
  const x = [0, 30], PORTE = 1;
  const chargee = (i, t) => (t === 20 ? 6 : 0);   // la tranche de 10 h saturée
  const arrive = (t0) => {
    const j = { cle: "J", poids: 1, arrivee: t0, fermeture: FERM, creneaux: [] };
    j.creneaux.push({ de: PORTE, t0: t0, vers: -1, tMax: FERM,
                      dernier: true, stands: [] });
    const restants = [0];
    rangeSejour([j], restants, hall(x), tempsCreneau, ALLURE * 60 * TV, null,
                P(3, chargee));
    /* Ce que ce visiteur a payé, à l'heure où il arrive. */
    const m = hall(x)(PORTE, 0);
    return { cout: j.creneaux[0].cout, t: t0 + tempsCreneau({}, m, 0) };
  };
  const a = arrive(629), b = arrive(631);
  const ecart = Math.abs(a.cout - b.cout);
  dit(ecart < 400,
      "deux minutes d'écart ne font pas deux journées étrangères",
      "coûts " + Math.round(a.cout) + " m et " + Math.round(b.cout) +
      " m, soit " + Math.round(ecart) + " m d'écart");

  /* Le contrôle, et il n'est pas décoratif : la même mesure sur le même moteur,
     lissage coupé. S'il rendait le même écart, le lissage ne servirait à rien
     et il faudrait le retirer plutôt que de le garder « au cas où ». */
  if (O.poseLissage){
    O.poseLissage(false);
    const a2 = arrive(629), b2 = arrive(631);
    O.poseLissage(true);
    const brut = Math.abs(a2.cout - b2.cout);
    dit(brut > ecart + 500,
        "là où la lecture par case en fait un gouffre",
        Math.round(brut) + " m d'écart pour les deux mêmes minutes");
  }
}

console.log(ko ? "\n" + ko + " ÉCHEC(S)\n" : "\nLes douze cas passent.\n");
process.exit(ko ? 1 : 0);
