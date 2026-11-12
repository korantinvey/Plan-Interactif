/**
 * Le dictionnaire, au format JSON d'i18next : `npm run export-langues`.
 *
 * Ce qu'un outil de traduction lit (Crowdin, Lokalise, Weblate savent tous
 * « i18next JSON v4 ») et ce qu'un traducteur peut reprendre sans connaître le
 * dépôt : un fichier par langue, la phrase française pour clé, les pluriels
 * sous `…_one` / `…_other`. C'est la conversion même que la page fait en
 * confiant le dictionnaire à i18next (`modules/ressources-langue.mjs`) — ce que
 * le traducteur lit est donc ce que `t()` écrira.
 *
 * La source reste `outils/anglais/` : ces fichiers en sont tirés, et ne se
 * versionnent pas (`.gitignore`). Une langue de plus s'y ajoutera en
 * repartant de `fr.json`, et la ramener dans le dépôt sera l'affaire de la
 * migration, le jour où elle viendra.
 *
 *   npm run export-langues                 écrit traductions/fr.json et traductions/en.json
 *   npm run export-langues -- <dossier>    ailleurs
 */
const fs = require("fs");
const path = require("path");
const { chargeDictionnaire } = require("../traductions.js");
const { ressources } = require("../gabarit/modules/ressources-langue.mjs");

const RACINE = path.join(__dirname, "..", "..");
const dossier = path.resolve(RACINE, process.argv[2] || "traductions");

const dico = chargeDictionnaire();
if (dico.conflits.length) {
  console.error("Le dictionnaire se contredit — à régler avant d'exporter :\n  " + dico.conflits.join("\n  "));
  process.exit(1);
}
const table = Object.fromEntries([...dico.entrees].map(([fr, e]) => [fr, e.en]));
const { fr, en, pluriels } = ressources(table);

/* Le français complet : chaque phrase pour elle-même, et ses pluriels. i18next
   n'en a pas besoin — la phrase est sa propre clé —, mais un traducteur part de
   ce fichier, et un outil de traduction n'offre à traduire que ce qu'il y voit. */
const francais = {};
for (const k of Object.keys(table)) if (!pluriels.has(k)) francais[k] = k;
Object.assign(francais, fr);
const anglais = {};
for (const k of Object.keys(francais)) if (en[k] !== undefined || pluriels.has(k)) anglais[k] = en[k] ?? k;
for (const k of Object.keys(francais)) if (anglais[k] === undefined) anglais[k] = table[k] ?? francais[k];

const trie = (o) => Object.fromEntries(Object.keys(o).sort((a, b) => a.localeCompare(b, "fr")).map((k) => [k, o[k]]));
fs.mkdirSync(dossier, { recursive: true });
fs.writeFileSync(path.join(dossier, "fr.json"), JSON.stringify(trie(francais), null, 2) + "\n");
fs.writeFileSync(path.join(dossier, "en.json"), JSON.stringify(trie(anglais), null, 2) + "\n");
console.log("Écrits : " + path.relative(RACINE, dossier) + "/fr.json et en.json — " +
  Object.keys(francais).length + " clés, dont " + new Set(pluriels.values()).size + " phrases au pluriel.");
