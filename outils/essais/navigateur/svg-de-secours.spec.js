/**
 * Les groupes des stands et des zones, selon qui peint le plan
 * (`modules/svg-de-secours.mjs`).
 *
 * Quand le WebGL peint, il lit chaque emplacement dans ses données : le groupe
 * SVG n'est plus que la couche que le clavier parcourt et que la lecture
 * d'écran nomme. Il ne doit donc pas porter de tracé — ce serait le style et
 * la mise en page de centaines d'éléments que personne ne voit. Mais quand le
 * SVG reprend la main — une carte graphique perdue —, c'est lui qui montre le
 * plan : chaque groupe doit alors retrouver son tracé, sans quoi le visiteur
 * aurait un hall vide.
 *
 * Les groupes ne disent plus rien au dessin, non plus : il ne les guette plus
 * et suit le modèle (`etat-emplacements.mjs` `EMPLACEMENTS_CHANGES`). Une
 * classe posée sur un groupe à l'insu du modèle ne fait relire aucun bloc ; un
 * choix dit au modèle fait relire celui des stands. De même pour les calques
 * de l'habillage, que leur réglage prévient (`style-habillage.mjs`
 * `CALQUE_CHANGE`) : un attribut posé sur le groupe ne fait rien relire, un
 * calque éteint dans la pile relit le sien.
 */
const { test, expect } = require("@playwright/test");
const { prepare, attendLaListe, ouvreAdmin } = require("./aide.js");

/** Les groupes des emplacements, et combien portent un tracé. */
const comptes = () => {
  const groupes = [...document.querySelectorAll("#stands > g, #zones > g")];
  return { groupes: groupes.length,
    traces: groupes.filter((g) => g.firstElementChild && g.firstElementChild.localName === "path").length };
};

test("les groupes ne portent leur tracé que si le SVG peint le plan", async ({ page }) => {
  const erreurs = await prepare(page);
  await page.goto("/plan.html?plan=smcl-2026");
  await attendLaListe(page);
  const dessin = await page.waitForFunction(() => window.__essais.GL.pret, null, { timeout: 15_000 })
    .then(() => true, () => false);
  test.skip(!dessin, "pas de carte graphique : le plan reste en SVG");

  // le dessin peint : des groupes, nommés et focalisables, sans tracé
  const avant = await page.evaluate(comptes);
  expect(avant.groupes).toBeGreaterThan(0);
  expect(avant.traces).toBe(0);
  const nomme = await page.evaluate(() => {
    const g = document.querySelector("#stands > g");
    return Boolean(g && g.getAttribute("aria-label") && g.getAttribute("tabindex") === "0");
  });
  expect(nomme).toBe(true);

  // la carte graphique perdue : le SVG reprend le plan, chaque groupe son tracé
  await page.evaluate(() =>
    window.__essais.GL.toile.dispatchEvent(new Event("webglcontextlost", { cancelable: true })));
  /* Le dessin remonte de lui-même un peu plus tard ; les tracés rendus restent
     dans les groupes jusqu'au montage suivant, et ne pressent rien. */
  const apres = await page.evaluate(comptes);
  expect(apres.traces).toBe(apres.groupes);
  expect(erreurs).toEqual([]);
});

test("le dessin suit le modèle, et non les classes des groupes", async ({ page }) => {
  const erreurs = await prepare(page);
  await page.goto("/plan.html?plan=smcl-2026");
  await attendLaListe(page);
  const dessin = await page.waitForFunction(() => window.__essais.GL.pret, null, { timeout: 15_000 })
    .then(() => true, () => false);
  test.skip(!dessin, "pas de carte graphique : le plan reste en SVG");
  // au repos : aucune image du dessin en attente
  await page.waitForFunction(() => !window.__essais.GL.image);
  await page.evaluate(() => { window.__blocAvant = window.__essais.GL.blocs.get(document.getElementById("stands")); });

  // une classe que le modèle ignore : le bloc des stands ne se relit pas
  await page.evaluate(() => document.querySelector("#stands > g").classList.add("dim"));
  await page.waitForTimeout(500);
  const relu = await page.evaluate(() =>
    window.__essais.GL.blocs.get(document.getElementById("stands")) !== window.__blocAvant);
  expect(relu, "le guet relit encore les groupes").toBe(false);
  await page.evaluate(() => document.querySelector("#stands > g").classList.remove("dim"));

  // un choix, dit au modèle par la fiche : le bloc se relit
  await page.locator("#list .row").first().click();
  await expect.poll(() => page.evaluate(() =>
    window.__essais.GL.blocs.get(document.getElementById("stands")) !== window.__blocAvant)).toBe(true);
  expect(erreurs).toEqual([]);
});

test("un calque de l'habillage se relit par son réglage, et non par son groupe", async ({ page }) => {
  test.setTimeout(120_000);
  const erreurs = await ouvreAdmin(page);
  const dessin = await page.waitForFunction(() => window.__essais.GL.pret, null, { timeout: 20_000 })
    .then(() => true, () => false);
  test.skip(!dessin, "pas de carte graphique : le plan reste en SVG");
  await page.waitForFunction(() => !window.__essais.GL.image);
  // les blocs des calques de l'habillage, tels qu'ils sont peints
  const releve = () => page.evaluate(() => {
    window.__blocsCal = new Map([...document.querySelectorAll("#couches > .cal")]
      .map((g) => [g, window.__essais.GL.blocs.get(g)]));
    return window.__blocsCal.size;
  });
  const relus = () => page.evaluate(() =>
    [...window.__blocsCal].filter(([g, c]) => window.__essais.GL.blocs.get(g) !== c).length);
  expect(await releve()).toBeGreaterThan(0);

  // un attribut posé sur le groupe, à l'insu du réglage : rien ne se relit
  await page.evaluate(() => document.querySelector("#couches > .cal").setAttribute("data-essai", "1"));
  await page.waitForTimeout(500);
  expect(await relus(), "le guet relit encore les calques de l'habillage").toBe(0);

  // un calque éteint dans la pile : son réglage change, son bloc se relit
  await page.locator("#btnLayers").click();
  await page.locator("#pile .calq:not(.perso):has(.fillbtn) input[type=checkbox]").first().click();
  await expect.poll(relus).toBeGreaterThan(0);
  expect(erreurs).toEqual([]);
});
