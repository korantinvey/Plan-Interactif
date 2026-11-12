/**
 * La traduction par i18next : `modules/traduction.mjs` `t` et
 * `modules/ressources-langue.mjs`, éprouvés seuls, sur le vrai dictionnaire.
 *
 * Pendant la migration, deux moteurs lisent le même dictionnaire : celui
 * d'aujourd'hui (`_langue.js`), qui traduit par-dessus la page, et `t()`. Ce
 * qui compte est qu'ils disent la même chose — qu'un module migré n'écrive
 * pas autrement que ce que l'observateur aurait écrit à sa place. D'où des
 * cas qui comparent `t()` au dictionnaire lui-même, et la règle des pluriels de
 * l'un à celle de l'autre, sur toutes les phrases.
 *
 *   node outils/essais/traduction.js     (lancé par `npm run essais`)
 */
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const { chargeDictionnaire } = require("../traductions.js");

let ko = 0;
const dit = (ok, q, d) => {
  console.log((ok ? "  ok   " : "  ÉCHEC") + "  " + q + (d ? "   → " + d : ""));
  if (!ok) ko++;
};
const MODULES = path.join(__dirname, "..", "gabarit", "modules");

(async () => {
  const R = await import(pathToFileURL(path.join(MODULES, "ressources-langue.mjs")).href);
  const dico = chargeDictionnaire();
  const table = Object.fromEntries([...dico.entrees].map(([k, e]) => [k, e.en]));

  console.log("\n=== 1. Le dictionnaire, converti sans rien perdre ===");
  const { fr, en, pluriels } = R.ressources(table);
  const differentes = Object.keys(table).filter((k) => table[k] !== k);
  dit(differentes.every((k) => en[k] === table[k]), "chaque phrase garde sa traduction, sous la même clé",
    differentes.length + " phrases");
  dit(pluriels.size >= 2 * 20, "les phrases chiffrées à deux formes sont rapprochées", pluriels.size / 2 + " paires");
  dit(fr["{n} pavillon_one"] === "{n} pavillon" && fr["{n} pavillon_other"] === "{n} pavillons" &&
      en["{n} pavillon_one"] === table["{n} pavillon"] && en["{n} pavillon_other"] === table["{n} pavillons"],
    "« {n} pavillon » et « {n} pavillons » : une clé, deux formes, dans chaque langue");

  /* La règle qui rapproche les deux formes est recopiée du moteur : elles
     doivent décider pareil sur chaque phrase. */
  const moteur = fs.readFileSync(path.join(__dirname, "..", "gabarit", "_langue.js"), "utf8");
  const m = /const sansPluriel = \(fr\) => fr\.replace\((\/.+\/g), "\$1"\);/.exec(moteur);
  if (!m) throw new Error("_langue.js : `sansPluriel` introuvable — sa forme a changé, l'essai aussi doit changer");
  const regle = new Function("return " + m[1])();
  const ecarts = Object.keys(table).filter((k) => k.replace(regle, "$1") !== R.sansPluriel(k));
  dit(!ecarts.length, "la règle des pluriels est celle du moteur, sur toutes les phrases", ecarts.slice(0, 3).join(" | "));

  console.log("\n=== 2. En français ===");
  /* Ce que la page donne au module : le moteur, son dictionnaire, ses
     annonces — et les pluriels que la construction verse (`genere.js`). */
  const ecouteurs = [];
  globalThis.addEventListener = (type, f) => { if (type === "langue") ecouteurs.push(f); };
  globalThis.LANGUE = { code: "fr", dictionnaire: () => Promise.resolve(table) };
  globalThis.PLURIELS_FR = Object.fromEntries(Object.keys(fr).filter((k) => k.endsWith("_one"))
    .map((k) => [fr[k], fr[k.slice(0, -4) + "_other"]]));
  const T = await import(pathToFileURL(path.join(MODULES, "traduction.mjs")).href);
  const { t } = T;
  const annonces = [];
  T.LANGUE_CHANGEE.ecoute((l) => annonces.push(l));

  dit(t("Centrer sur le plan") === "Centrer sur le plan", "une phrase reste elle-même");
  dit(t("{n} exposants ici", { n: 3 }) === "3 exposants ici", "un trou se remplit", t("{n} exposants ici", { n: 3 }));
  dit([0, 1, 2].map((n) => t("{n} pavillon", { n })).join(" / ") === "0 pavillon / 1 pavillon / 2 pavillons",
    "le pluriel suit la règle française : zéro au singulier", [0, 1, 2].map((n) => t("{n} pavillon", { n })).join(" / "));
  dit(t("{n} pavillons", { n: 1 }) === "1 pavillon", "la forme écrite importe peu : le nombre accorde");
  dit(t("{n} exposants ici", { n: 12345.5 }) === "12\u202F345,5 exposants ici", "un nombre s'écrit à la française",
    JSON.stringify(t("{n} exposants ici", { n: 12345.5 })));
  dit(t("Une phrase qu'aucun dictionnaire n'a {x}", { x: "<b>" }) === "Une phrase qu'aucun dictionnaire n'a <b>",
    "les valeurs passent telles quelles : échapper reste l'affaire de qui écrit du HTML");

  console.log("\n=== 3. En anglais, sur l'annonce du moteur ===");
  globalThis.LANGUE.code = "en";
  await Promise.all(ecouteurs.map((f) => f({ detail: { langue: "en" } })));
  await new Promise((r) => setTimeout(r, 0));
  dit(annonces.join() === "en", "le changement est annoncé une fois, dictionnaire versé", annonces.join());
  dit(T.langueDeT() === "en", "t() écrit désormais en anglais");
  dit(t("Centrer sur le plan") === table["Centrer sur le plan"], "une phrase prend sa traduction", t("Centrer sur le plan"));
  dit(t("{n} exposants ici", { n: 3 }) === "3 exhibitors here", "un modèle aussi", t("{n} exposants ici", { n: 3 }));
  dit([0, 1, 2].map((n) => t("{n} pavillon", { n })).join(" / ") === "0 halls / 1 hall / 2 halls",
    "le pluriel suit la règle anglaise : zéro au pluriel", [0, 1, 2].map((n) => t("{n} pavillon", { n })).join(" / "));
  dit(t("{n} exposants ici", { n: 12345.5 }) === "12,345.5 exhibitors here", "un nombre s'écrit à l'anglaise",
    t("{n} exposants ici", { n: 12345.5 }));
  dit(t("Une phrase qu'aucun dictionnaire n'a") === "Une phrase qu'aucun dictionnaire n'a",
    "une phrase inconnue reste en français, comme l'observateur la laisse");

  console.log("\n=== 4. Et retour ===");
  globalThis.LANGUE.code = "fr";
  await Promise.all(ecouteurs.map((f) => f({ detail: { langue: "fr" } })));
  await new Promise((r) => setTimeout(r, 0));
  dit(annonces.join() === "en,fr" && t("Centrer sur le plan") === "Centrer sur le plan" &&
      t("{n} pavillon", { n: 0 }) === "0 pavillon", "le français revient, pluriels compris", annonces.join());

  console.log(ko ? "\n" + ko + " ÉCHEC(S)\n" : "\nt() dit ce que le dictionnaire dit, dans chaque langue.\n");
  process.exit(ko ? 1 : 0);
})();
