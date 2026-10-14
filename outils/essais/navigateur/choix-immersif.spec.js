/**
 * Choisir un stand en vue immersive : il monte, et le hall ne se refait pas.
 *
 * Le stand choisi quitte sa couche pour une copie qui monte. Le lui retirer
 * changeait les données de la grande couche des volumes, et la bibliothèque
 * retriangulait tous les stands du hall — deux fois par appui (`webgl.mjs`,
 * « Des couches qui gardent leurs formes »). Il y reste désormais, aplati :
 * seule sa copie, d'un seul stand, se triangule.
 */
const { test, expect } = require("@playwright/test");
const { prepare, attendLaListe } = require("./aide");

test("choisir un stand ne retriangule pas le hall", async ({ page }) => {
  test.setTimeout(150_000);
  const erreurs = await prepare(page);
  await page.goto("/plan.html?plan=smcl-2026&ambiance=immersif");
  await attendLaListe(page);
  const camera = await page.waitForFunction(() => window.__essais.GL.camera && window.__essais.GL.deck, null,
    { timeout: 15_000 }).then(() => true, () => false);
  test.skip(!camera, "pas de carte graphique : le plan reste à plat");
  // la grande couche des volumes, montée et triangulée une première fois
  await page.waitForFunction(() => window.__essais.GL.deck.layerManager.getLayers()
    .some((l) => /-volumes-\d+$/.test(l.id) && l.state && l.state.polygonTesselator), null, { timeout: 60_000 });
  await page.waitForTimeout(1500);

  // chaque triangulation, et le nombre de formes qu'elle a reprises
  await page.evaluate(() => {
    const c = window.__essais.GL.deck.layerManager.getLayers()
      .find((l) => /-volumes-\d+$/.test(l.id) && l.state && l.state.polygonTesselator);
    const proto = Object.getPrototypeOf(c.state.polygonTesselator), avant = proto.updateGeometry;
    window.__triangulees = [];
    proto.updateGeometry = function (o) {
      window.__triangulees.push(o && o.data && o.data.length !== undefined ? o.data.length : -1);
      return avant.apply(this, arguments);
    };
  });

  const id = await page.locator("#list .row").first().getAttribute("data-id");
  await page.locator("#list .row").first().click();
  await page.waitForFunction(() => document.querySelector("#stands g.sel"), null, { timeout: 20_000 });
  // la montée, l'arrivée, et la reconversion du bloc qui suit le choix
  await page.waitForTimeout(4000);

  const triangulees = await page.evaluate(() => window.__triangulees);
  // la copie qui monte, et elle seule : un stand à la fois, jamais le hall
  for (const n of triangulees) expect(n, "formes retriangulées d'un coup (" + id + ")").toBeLessThanOrEqual(2);
  expect(erreurs).toEqual([]);
});
