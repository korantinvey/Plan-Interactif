/**
 * Les heures du salon : `modules/temps.mjs`, éprouvé seul.
 *
 * Un rappel de conférence part à un instant, quand tout le plan raisonne en
 * heure murale du salon. Une erreur ici ne casse rien à l'écran : elle fait
 * sonner le téléphone une heure trop tôt, le jour du changement d'heure, chez
 * un visiteur d'un autre fuseau. D'où des cas qui mesurent l'instant rendu
 * contre l'heure UTC attendue, plutôt que de rejouer le calcul.
 *
 *   node outils/essais/temps.js     (chaîné dans `npm run essais`)
 */
const path = require("path");
const { pathToFileURL } = require("url");

let ko = 0;
const dit = (ok, q, d) => {
  console.log((ok ? "  ok   " : "  ÉCHEC") + "  " + q + (d ? "   → " + d : ""));
  if (!ok) ko++;
};

(async () => {
  const T = await import(pathToFileURL(path.join(__dirname, "..", "gabarit", "modules", "temps.mjs")).href);
  const mural = (an, mois, jour, h, min) => ({ an, mois, jour, h: String(h).padStart(2, "0"), min: String(min).padStart(2, "0") });
  const iso = (t) => isNaN(t) ? "NaN" : new Date(t).toISOString().slice(0, 16) + "Z";

  console.log("\n=== 1. L'instant d'une heure murale, dans le fuseau du salon ===");
  const CAS = [
    ["Paris, en été (UTC+2)", mural(2026, 7, 14, 10, 0), "Europe/Paris", "2026-07-14T08:00Z"],
    ["Paris, en hiver (UTC+1)", mural(2026, 1, 14, 10, 0), "Europe/Paris", "2026-01-14T09:00Z"],
    ["Paris, la veille du passage à l'heure d'été", mural(2026, 3, 28, 14, 30), "Europe/Paris", "2026-03-28T13:30Z"],
    ["Paris, le lendemain", mural(2026, 3, 29, 14, 30), "Europe/Paris", "2026-03-29T12:30Z"],
    ["Paris, une heure avant le saut de 2 h", mural(2026, 3, 29, 1, 30), "Europe/Paris", "2026-03-29T00:30Z"],
    ["Paris, une heure après", mural(2026, 3, 29, 3, 30), "Europe/Paris", "2026-03-29T01:30Z"],
    ["Paris, le retour à l'heure d'hiver", mural(2026, 10, 25, 14, 0), "Europe/Paris", "2026-10-25T13:00Z"],
    ["New York, au passage à l'heure d'été (8 mars)", mural(2026, 3, 8, 10, 0), "America/New_York", "2026-03-08T14:00Z"],
    ["Tokyo, sans changement d'heure", mural(2026, 3, 29, 10, 0), "Asia/Tokyo", "2026-03-29T01:00Z"],
    ["Nouméa, à l'autre bout du jour", mural(2026, 12, 31, 23, 30), "Pacific/Noumea", "2026-12-31T12:30Z"],
  ];
  for (const [nom, p, fz, attendu] of CAS){
    const t = iso(T.instantMural(p, fz));
    dit(t === attendu, nom, t);
  }
  /* Une heure qui n'existe pas — 2 h 30 le jour où l'on saute de 2 h à 3 h —
     ne doit pas faire perdre la conférence : elle tombe sur l'un des deux
     instants voisins, à une heure près. */
  const trou = T.instantMural(mural(2026, 3, 29, 2, 30), "Europe/Paris");
  dit(["2026-03-29T00:30Z", "2026-03-29T01:30Z"].includes(iso(trou)), "Paris, 2 h 30 un jour qui n'en a pas", iso(trou));
  dit(isNaN(T.instantMural(mural(2026, 7, 14, 10, 0), "Pas/Un_Fuseau")), "un fuseau inconnu ne donne pas d'instant");

  console.log("\n=== 2. Les deux formes d'Eventmaker ===");
  const l = T.momentLocal("03/14/2026 9:05", "Asia/Tokyo");
  dit(l && l.jour === 14 && l.mois === 3 && l.h === "09" && l.min === "05" && l.cle === "20260314",
    "l'heure locale se relit telle quelle, sans regarder le fuseau", JSON.stringify(l));
  const z = T.momentLocal("2026-03-29T08:30:00Z", "Europe/Paris");
  dit(z && z.h === "10" && z.min === "30" && z.cle === "20260329", "la forme ISO est ramenée au fuseau du salon", z && z.h + "h" + z.min);
  dit(T.momentLocal("nimporte", "Europe/Paris") === null && T.momentLocal("2026-03-29T08:30:00Z", "Pas/Un_Fuseau") === null,
    "une heure illisible ou un fuseau inconnu ne rendent rien");
  const aller = T.momentLocal("03/29/2026 14:30", "Europe/Paris");
  dit(iso(T.instantMural(aller, "Europe/Paris")) === "2026-03-29T12:30Z", "ce que la page affiche est ce qui sonne");

  console.log("\n=== 3. Les jours et les durées écrits ===");
  dit(T.jourLong(T.dateDeCle("20260314")) === "samedi 14 mars 2026", "jourLong", T.jourLong(T.dateDeCle("20260314")));
  dit(T.jourBref("20270321") === "dim. 21" && T.jourISO("20270321") === "2027-03-21", "jourBref et jourISO");
  dit(T.dateDeCle("2026031") === null && T.jourBref("abc") === "", "une clé de jour malformée ne rend rien");
  dit(T.ecritHeure(1500) === "01h00" && T.ecritHeure(-30) === "23h30", "une journée qui déborde repasse par minuit");
  dit(T.ecritMinutes(0.4) === "1 min" && T.ecritMinutes(75) === "1 h 15 min" && T.ecritMinutes(120) === "2 h",
    "les durées", [T.ecritMinutes(0.4), T.ecritMinutes(75), T.ecritMinutes(120)].join(", "));

  console.log(ko ? "\n" + ko + " ÉCHEC(S)\n" : "\nLes heures du salon tombent juste.\n");
  process.exit(ko ? 1 : 0);
})();
