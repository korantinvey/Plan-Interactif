/**
 * La recherche sans les accents : `modules/texte.mjs` `pourRecherche`, éprouvé seul.
 *
 * Le visiteur tape « cafe » sur un téléphone et attend « Café » ; il tape
 * « Électricité » et attend aussi bien ce qui s'écrit sans accent. Le mot tapé
 * et ce qu'on y cherche passent par la même fonction : c'est elle qu'on éprouve,
 * importée telle que la page la reçoit.
 *
 *   node outils/essais/recherche-accents.js     (lancé par `npm run essais`)
 */
const path = require("path");
const { pathToFileURL } = require("url");
const { test } = require("node:test");
const assert = require("node:assert/strict");

const module_ = import(pathToFileURL(path.join(__dirname, "..", "gabarit", "modules", "texte.mjs")).href);

test("les accents et la casse s'effacent des deux côtés", async () => {
  const { pourRecherche } = await module_;
  assert.equal(pourRecherche("Café Électricité"), "cafe electricite");
  assert.ok(pourRecherche("Pâtisserie Hélène").includes(pourRecherche("helene")));
  assert.ok(pourRecherche("Patisserie").includes(pourRecherche("pâtis")));
  assert.equal(pourRecherche("Çà et là, NOËL"), "ca et la, noel");
});

test("les ligatures se défont", async () => {
  const { pourRecherche } = await module_;
  assert.equal(pourRecherche("Œuvre Cæsar Straße"), "oeuvre caesar strasse");
});

test("rien d'autre ne change", async () => {
  const { pourRecherche } = await module_;
  assert.equal(pourRecherche(null), "");
  assert.equal(pourRecherche("Stand A12 — hall 3"), "stand a12 — hall 3");
});
