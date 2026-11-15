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
 */
const { test, expect } = require("@playwright/test");
const { prepare, attendLaListe } = require("./aide.js");

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
