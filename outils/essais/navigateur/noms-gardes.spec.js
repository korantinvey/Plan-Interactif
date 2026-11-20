/**
 * Les noms de chaque stand, gardés d'une écriture à l'autre (`libelles.mjs`
 * `nomsGardes`).
 *
 * Choisir un stand refaisait les noms des cent quarante stands de FUNEXPO
 * pour en changer un : plus du quart du coût d'un tap au banc. Chaque stand
 * garde désormais les siens. L'essai éprouve les deux promesses de cette
 * mémoire, à plat et en immersif : un choix ne remesure qu'une poignée de
 * stands, et ce qu'elle verse est, à l'octet près, ce que la mesure aurait
 * produit d'elle-même (`compareNoms`) — après deux choix, une recherche qui
 * éteint une partie du hall, sa levée, et la fiche refermée. Le passage du seuil
 * des logos, qui change les noms des stands qu'ils couvrent, est éprouvé avec
 * les logos (`logos-stands.spec.js`).
 */
const { test, expect } = require("@playwright/test");
const { prepare, attendLaListe } = require("./aide");

/** Le repeint qui suit une action, fini. */
async function repose(page) {
  await page.waitForTimeout(400);
  await page.waitForFunction(() => !window.__essais.GL.image, null, { timeout: 10_000 });
}
const compare = (page) => page.evaluate(() => window.__essais.compareNoms());
const refaits = (page) => page.evaluate(() => window.__essais.GL.nomsRefaits);

for (const ambiance of ["classique", "immersif"]) {
  test(`en ${ambiance}, un choix ne remesure que les noms qui changent, et les noms n'en changent pas`, async ({ page }) => {
    test.setTimeout(120_000);
    const erreurs = await prepare(page);
    await page.goto("/plan.html?plan=smcl-2026&ambiance=" + ambiance);
    await attendLaListe(page);
    const webgl = await page.waitForFunction(() => window.__essais.GL.actif && window.__essais.GL.deck, null, { timeout: 30_000 })
      .then(() => true, () => false);
    test.skip(!webgl, "pas de carte graphique : le plan reste en SVG");
    await repose(page);
    expect(await compare(page)).toBe("");

    // deux stands choisis par la liste, l'un après l'autre
    const lignes = page.locator("#list .row");
    for (const i of [0, 3]) {
      await lignes.nth(i).click();
      await repose(page);
      expect(await refaits(page)).toBeLessThanOrEqual(4);
      expect(await compare(page)).toBe("");
    }

    // une recherche qui éteint une partie du hall, puis sa levée : les stands rallumés reprennent leurs noms
    await page.keyboard.press("Escape");
    await repose(page);
    await page.locator("#q").fill("a");
    await repose(page);
    expect(await compare(page)).toBe("");
    await page.locator("#q").fill("");
    await repose(page);
    expect(await refaits(page)).toBeLessThanOrEqual(4);
    expect(await compare(page)).toBe("");
    expect(erreurs).toEqual([]);
  });
}
