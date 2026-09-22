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

/* Un plafond d'essai. `charge` est une fonction (stand, tranche) → nombre. */
const P = (cap, charge, facteur) => ({
  capacite: (i) => (typeof cap === "function" ? cap(i) : cap),
  charge: (cle, i, tr) => charge(i, tr),
  facteur: () => (facteur || 1),
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

console.log("\n=== 4. Capacité journalière dépassée : le facteur dilate ===");
{
  const x = [0, 100, 200];
  const charge = () => 6;                         // 200 % d'une capacité de 3
  const brut = journee(x, [0, 1, 2], P(3, charge, 1));
  const dilue = journee(x, [0, 1, 2], P(3, charge, 2));
  dit(brut.ordre.length === 3 && dilue.ordre.length === 3, "les deux placent tout");
  dit(peineDeCharge(6, 3) > peineDeCharge(6, 6),
      "dilater la capacité fait retomber la peine",
      Math.round(peineDeCharge(6, 3)) + " m → " + Math.round(peineDeCharge(6, 6)) + " m");
  dit(peineDeCharge(6, 6) === peineDeCharge(3, 3),
      "et un salon deux fois surdemandé se juge comme un salon plein");
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
     contre un stand à 70 % plutôt qu'à 30 %. */
  const x = [-400, 430, 0], PORTE = 2;
  const eq = hall(x);
  const court = eq(PORTE, 0) + eq(0, 1), long = eq(PORTE, 1) + eq(1, 0);
  console.log("   (A puis B : " + court + " m ; B puis A : " + long +
              " m — soit " + (long - court) + " m de détour)");
  const r = journee(x, [0, 1], P(3, (i, t) => (i === 0 && t === 20) ? 2.1 : 0.9), PORTE);
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
  const r2 = journee(y, [0, 1], P(3, (i, t) => (i === 0 && t === 20) ? 2.1 : 0.9), PORTE);
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

console.log(ko ? "\n" + ko + " ÉCHEC(S)\n" : "\nLes huit cas passent.\n");
process.exit(ko ? 1 : 0);
