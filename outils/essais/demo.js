/**
 * Le salon de démonstration ne nomme personne, et tient debout.
 *
 * `outils/demo.js` tire de `source-demo.json` (un salon réel) un salon qu'on
 * montre à des prospects. Rien ne se verrait s'il laissait passer un nom :
 * un champ neuf dans la source, un réglage qui recopie une enseigne. On vérifie
 * donc ici, sur tout ce que la page reçoit, qu'aucun exposant réel, aucun site,
 * aucun réseau social, aucune adresse de logo signée ni aucune marque de
 * l'organisateur n'y survit — et que le salon inventé est complet : chaque
 * stand occupé, chaque exposant avec son logo et ses produits, chaque
 * conférence rattachée à ce qui existe, le même résultat d'une construction à
 * l'autre.
 *
 *   node outils/essais/demo.js     (chaîné dans `npm run essais`)
 */
const { salonDemo, lisSource, ORIGINE, DOSSIER_PRODUITS, imagesProduits } = require("../demo.js");

let ko = 0;
const dit = (ok, q, d) => {
  console.log((ok ? "  ok   " : "  ÉCHEC") + "  " + q + (d ? "   → " + d : ""));
  if (!ok) ko++;
};

const source = lisSource();
const demo = salonDemo(source);
const texte = JSON.stringify(demo);
/* Les noms se cherchent dans le texte, et non dans les octets des logos : le
   base64 finit toujours par écrire n'importe quel mot quelque part. */
const lisible = JSON.stringify({ ...demo, vignettes: null });
const bas = lisible.toLowerCase();

/* Les noms réels : exposants, raisons sociales, co-exposants. Cherchés en
   mots entiers — un exposant peut s'appeler comme un mot du programme. */
const reels = new Set();
const sites = new Set();
const releve = (s) => {
  [s.nom, s.plan].forEach((n) => n && reels.add(String(n).trim().toLowerCase()));
  if (s.site) sites.add(String(s.site).replace(/^https?:\/\/(www\.)?/i, "").replace(/\/.*$/, "").toLowerCase());
  (s.coex || []).forEach(releve);
};
source.plans.forEach((p) => p.stands.forEach(releve));
const lettre = "a-z0-9à-ÿœ";
const motEntier = (n) => new RegExp("(^|[^" + lettre + "])" +
  n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "($|[^" + lettre + "])");
/* Un emplacement libre porte parfois, en guise de raison sociale, un mot de
   la nomenclature — « beauté » : ce vocabulaire n'identifie personne, et la
   démonstration le reprend légitimement. */
const vocabulaire = source.plans.flatMap((p) => p.stands.flatMap((s) => [s.sect, ...(s.nomencl || [])]))
  .concat(Object.keys(source.anglais || {})).filter(Boolean).join(" | ").toLowerCase();
const longs = [...reels].filter((n) => n.length >= 6 && !motEntier(n).test(vocabulaire));
const fuites = longs.filter((n) => motEntier(n).test(bas));
dit(!fuites.length, "aucun nom réel de six lettres ou plus, nulle part", fuites.slice(0, 5).join(" ; "));

const plan = demo.plans[0];
const societes = demo.plans.flatMap((p) => p.stands.flatMap((s) => [s, ...(s.coex || [])]));
const repris = societes.flatMap((s) => [s.nom, s.plan]).filter((n) => n && reels.has(n.toLowerCase()));
dit(!repris.length, "aucun exposant ne porte un nom réel, même court", repris.slice(0, 5).join(" ; "));

const sitesRepris = [...sites].filter((d) => d.length >= 6 && bas.includes(d));
dit(!sitesRepris.length, "aucun site réel", sitesRepris.slice(0, 5).join(" ; "));
const horsExample = societes.filter((s) => !/^https:\/\/www\.[a-z0-9-]+\.example$/.test(s.site || ""));
dit(!horsExample.length, "chaque site est en .example", horsExample.slice(0, 3).map((s) => s.site).join(" ; "));
const tels = societes.filter((s) => s.tel && !/^01 99 00 \d\d \d\d$/.test(s.tel));
dit(!tels.length, "les numéros sont dans la plage réservée à la fiction", tels.slice(0, 3).map((s) => s.tel).join(" ; "));
const reseaux = societes.filter((s) => s.fb || s.li || s.ig);
dit(!reseaux.length, "aucun réseau social", reseaux.length + " sociétés");

/* L'organisateur, ses partenaires, et ce que la source transportait. */
const marques = ["franchise expo", "fep27", "fep26", "bertrand", "fff", "paul.com", "saudi", "renault",
  "mobicheckin", "eventmaker", "signature="].filter((m) => motEntier(m).test(bas) || (m.includes(".") || m.includes("=")) && bas.includes(m));
dit(!marques.length, "ni l'organisateur, ni ses partenaires, ni les logos d'origine", marques.join(" ; "));
const guids = lisible.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi) || [];
const klipso = guids.filter((g) => texteSource().includes(g));
dit(!klipso.length, "aucun identifiant Klipso", klipso.slice(0, 3).join(" ; "));

/* Le salon inventé est complet. */
const n = (d) => d.plans.reduce((a, p) => a + p.stands.length, 0);
dit(n(demo) === n(source), "autant de stands que la source", n(demo) + " / " + n(source));
const vides = demo.plans.flatMap((p) => p.stands).filter((s) => !s.nom || s.etat !== "Affecte" || !s.code);
dit(!vides.length, "chaque stand est occupé, attribué et numéroté", vides.length + " non");
const sansLogo = societes.filter((s) => !s.vignette || !demo.vignettes[s.vignette]);
dit(!sansLogo.length, "chaque exposant a son logo",
  sansLogo.length + " sans, dont " + sansLogo.slice(0, 3).map((s) => s.nom).join(" ; ") + " — npm run logos-demo");
const images = Object.values(demo.vignettes).filter((src) => !/^data:image\/webp;base64,[A-Za-z0-9+/]+=*$/.test(src));
dit(!images.length, "chaque logo est une image que la page accepte");
const sansProduit = societes.filter((s) => !(s.produits || []).length);
dit(!sansProduit.length, "chaque exposant présente des produits", sansProduit.length + " sans");
const fichiers = new Set(Object.keys(imagesProduits()));
const prefixe = ORIGINE + "/" + DOSSIER_PRODUITS + "/";
const imagesPerdues = societes.flatMap((s) => s.produits)
  .filter((p) => !p.image.startsWith(prefixe) || !fichiers.has(p.image.slice(prefixe.length)));
dit(!imagesPerdues.length, "chaque image de produit est servie par le site", imagesPerdues.slice(0, 2).map((p) => p.image).join(" ; "));

const parId = new Map(demo.plans.flatMap((p) => [...p.stands, ...p.zones].map((o) => [o.id, o])));
const confs = demo.plans.flatMap((p) => p.conferences);
dit(confs.length >= 50, "un programme fourni", confs.length + " conférences");
const orphelines = confs.filter((c) => !parId.has(c.zone) || c.exposants.some((e) => !parId.get(e.stand)));
dit(!orphelines.length, "chaque conférence a sa salle et son exposant", orphelines.map((c) => c.id).join(" ; "));
const ids = demo.plans.flatMap((p) => [...p.stands, ...p.zones].map((o) => o.id));
dit(new Set(ids).size === ids.length, "identifiants uniques");
const pileMorte = plan.apparence.pile.filter((e) => e.startsWith("dessin:") &&
  !plan.dessins.some((d) => "dessin:" + d.id === e));
dit(!pileMorte.length, "la pile ne désigne que des dessins présents", pileMorte.join(" ; "));
dit(JSON.stringify(salonDemo(source)) === texte, "deux constructions, le même salon");

function texteSource() { return JSON.stringify(source); }

if (ko) { console.log("\n" + ko + " échec(s)"); process.exit(1); }
console.log("\nle salon de démonstration ne nomme personne");
