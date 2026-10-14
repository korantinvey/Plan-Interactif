/**
 * Le salon de démonstration ne nomme personne.
 *
 * `outils/demo.js` tire de `plans.json` un salon qu'on montre à des prospects.
 * Rien ne se verrait s'il laissait passer un nom : une liste de marques à
 * remplacer qui vieillit, un champ neuf dans les données figées. On vérifie
 * donc ici, sur tout ce que la page reçoit, qu'aucun exposant réel, aucun site,
 * aucun identifiant Klipso ni aucune marque de l'organisateur n'y survit — et
 * que le salon inventé tient debout : mêmes stands, noms uniques, conférences
 * rattachées à ce qui existe, même résultat d'une construction à l'autre.
 *
 *   node outils/essais/demo.js     (chaîné dans `npm run essais`)
 */
const path = require("path");
const { salonDemo } = require("../demo.js");
const source = require(path.join(__dirname, "..", "plans.json"));

let ko = 0;
const dit = (ok, q, d) => {
  console.log((ok ? "  ok   " : "  ÉCHEC") + "  " + q + (d ? "   → " + d : ""));
  if (!ok) ko++;
};

const demo = salonDemo(source);
const texte = JSON.stringify(demo);
/* Les noms se cherchent dans le texte, et non dans les octets des logos : le
   base64 finit toujours par écrire « smcl » quelque part. */
const lisible = JSON.stringify({ ...demo, vignettes: null });
const bas = lisible.toLowerCase();

/* Les noms réels, cherchés tels quels dans tout ce que la page reçoit. Les
   plus courts — « AXA », « ORANGE » — se retrouveraient dans n'importe quel
   mot : ils sont cherchés là où ils seraient un nom, dans les champs. */
const reels = new Set();
const sites = new Set();
source.plans.forEach((p) => p.stands.forEach((s) => {
  [s.nom, s.plan].forEach((n) => n && reels.add(String(n).trim().toLowerCase()));
  if (s.site) sites.add(String(s.site).replace(/^https?:\/\/(www\.)?/i, "").replace(/\/.*$/, "").toLowerCase());
}));
/* Cherchés en mots entiers : « Territoria » est un exposant, « territorial »
   un mot du programme. */
const lettre = "a-z0-9à-ÿœ";
const motEntier = (n) => new RegExp("(^|[^" + lettre + "])" +
  n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "($|[^" + lettre + "])");
const longs = [...reels].filter((n) => n.length >= 8);
const fuites = longs.filter((n) => motEntier(n).test(bas));
dit(!fuites.length, "aucun nom réel de huit lettres ou plus, nulle part", fuites.slice(0, 5).join(" ; "));

const champs = demo.plans.flatMap((p) => [
  ...p.stands.flatMap((s) => [s.nom, s.plan, ...(s.coex || []).flatMap((c) => [c.nom, c.plan])]),
  ...p.conferences.flatMap((c) => [...c.exposants.map((e) => e.nom), ...c.intervenants.map((x) => x.societe)]),
]).filter(Boolean).map((n) => n.toLowerCase());
const repris = champs.filter((n) => reels.has(n));
dit(!repris.length, "aucun exposant ne porte un nom réel, même court", repris.slice(0, 5).join(" ; "));

const sitesRepris = [...sites].filter((d) => d.length >= 6 && bas.includes(d));
dit(!sitesRepris.length, "aucun site réel", sitesRepris.slice(0, 5).join(" ; "));
const horsExample = demo.plans.flatMap((p) => p.stands).filter((s) => s.site && !/\.example$/.test(s.site));
dit(!horsExample.length, "les sites sont tous en .example", horsExample.slice(0, 3).map((s) => s.site).join(" ; "));
const tels = demo.plans.flatMap((p) => p.stands).filter((s) => s.tel && !/^01 99 00 \d\d \d\d$/.test(s.tel));
dit(!tels.length, "les numéros sont dans la plage réservée à la fiction", tels.slice(0, 3).map((s) => s.tel).join(" ; "));

/* L'organisateur et ses marques. Les clés des calques (« INFOPRO_… ») restent :
   le visiteur n'en voit que le nom, et la configuration en connaît une. */
const sansCles = lisible.replace(/"cle":"INFOPRO_[A-Z_]+"/g, "").replace(/id=\\"INFOPRO_[A-Z_]+\\"/g, "");
const marques = ["smcl", "infopro", "vis ta ville", "vis ton sport", "atmosph", "léni", "l&#233;ni",
  "parkopolis", "arene de l", "vinci"]
  .filter((m) => sansCles.toLowerCase().includes(m));
dit(!marques.length, "ni l'organisateur ni ses marques", marques.join(" ; "));

const guids = lisible.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi) || [];
dit(!guids.length, "aucun identifiant Klipso", guids.slice(0, 3).join(" ; "));
const anciensIds = new Set(source.plans.flatMap((p) => [...p.stands, ...p.zones].map((o) => o.id)));
const gardes = demo.plans.flatMap((p) => [...p.stands, ...p.zones]).filter((o) => anciensIds.has(o.id));
dit(!gardes.length, "les identifiants des stands et des zones sont refaits", gardes.length + " gardés");

/* Le salon inventé tient debout. */
const n = (d) => d.plans.reduce((a, p) => a + p.stands.length, 0);
dit(n(demo) === n(source), "autant de stands que le plan réel", n(demo) + " / " + n(source));
const occupes = (d) => d.plans.flatMap((p) => p.stands).filter((s) => s.nom || s.plan).length;
dit(occupes(demo) === occupes(source), "les mêmes stands occupés", occupes(demo) + " / " + occupes(source));
const ids = demo.plans.flatMap((p) => [...p.stands, ...p.zones].map((o) => o.id));
dit(new Set(ids).size === ids.length, "identifiants uniques");
const parId = new Map(demo.plans.flatMap((p) => [...p.stands, ...p.zones].map((o) => [o.id, o])));
const confs = demo.plans.flatMap((p) => p.conferences);
dit(confs.length >= 30, "un programme fourni", confs.length + " conférences");
const orphelines = confs.filter((c) => !parId.has(c.zone) || c.exposants.some((e) => !parId.get(e.stand)?.nom));
dit(!orphelines.length, "chaque conférence a sa salle et son exposant", orphelines.map((c) => c.id).join(" ; "));
dit(JSON.stringify(salonDemo(source)) === texte, "deux constructions, le même salon");

/* Les logos, dessinés à part (`npm run logos-demo`) : un changement de noms
   qui ne les aurait pas refaits laisserait des sociétés sans logo. */
const societes = demo.plans.flatMap((p) => p.stands.flatMap((s) => [s, ...(s.coex || [])])).filter((s) => s.nom);
const sansLogo = [...new Set(societes.filter((s) => !s.vignette).map((s) => s.nom))];
dit(!sansLogo.length, "chaque société a son logo", sansLogo.length + " sans logo, dont " +
  sansLogo.slice(0, 3).join(" ; ") + " — relancer npm run logos-demo");
const images = Object.entries(demo.vignettes || {});
const mal = images.filter(([, src]) => !/^data:image\/webp;base64,[A-Za-z0-9+/]+=*$/.test(src));
dit(!mal.length && societes.every((s) => !s.vignette || demo.vignettes[s.vignette]),
  "chaque vignette est une image que la page accepte");

if (ko) { console.log("\n" + ko + " échec(s)"); process.exit(1); }
console.log("\nle salon de démonstration ne nomme personne");
