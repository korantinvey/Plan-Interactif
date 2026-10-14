/**
 * Le survol à la souris, peint par la carte graphique.
 *
 * Ce qui est sous la souris se demande à la carte graphique, et sa réponse
 * se relit sans attendre qu'elle ait fini l'image en cours (`webgl.mjs`,
 * « La désignation sans attendre la carte graphique ») : le stand survolé
 * s'allume une image ou deux plus tard, et un clic au même point reprend ce
 * que le survol a trouvé au lieu de redemander.
 */
const { test, expect } = require("@playwright/test");
const { prepare, attendLaListe } = require("./aide");

test("le survol allume le stand, et le clic au même point le choisit sans redemander", async ({ page }) => {
  test.setTimeout(120_000);
  const erreurs = await prepare(page);
  await page.goto("/plan.html?plan=smcl-2026");
  await attendLaListe(page);
  const webgl = await page.waitForFunction(() => window.__essais.GL.deck, null, { timeout: 15_000 })
    .then(() => true, () => false);
  test.skip(!webgl, "pas de carte graphique : le survol reste au SVG");
  await page.waitForTimeout(1500);

  // un stand bien dans l'écran, assez grand pour qu'on le vise en son milieu
  const vise = await page.evaluate(() => {
    const plan = document.getElementById("plan").getBoundingClientRect();
    for (const g of document.querySelectorAll("#stands g.stand[data-id]")) {
      const r = window.__essais.rectEcranWebgl(g);
      if (!r || r.width < 24 || r.height < 24) continue;
      const x = r.left + r.width / 2, y = r.top + r.height / 2;
      if (x < plan.left + 40 || y < plan.top + 40 || x > plan.right - 40 || y > plan.bottom - 40) continue;
      return { id: g.getAttribute("data-id"), x: Math.round(x), y: Math.round(y) };
    }
    return null;
  });
  expect(vise, "un stand à viser").not.toBeNull();

  // chaque demande immédiate à la carte graphique — celle qui fige la page — comptée
  await page.evaluate(() => {
    const d = window.__essais.GL.deck, avant = d.pickObject;
    window.__demandes = 0;
    d.pickObject = function (...a) { window.__demandes++; return avant.apply(this, a); };
  });
  await page.mouse.move(vise.x - 30, vise.y - 30);
  await page.mouse.move(vise.x, vise.y, { steps: 4 });
  await page.waitForFunction((id) => {
    const s = window.__essais.GL.survol;
    return s && s.getAttribute("data-id") === id;
  }, vise.id, { timeout: 20_000 });

  // le survol a relu sans attendre : aucune demande immédiate
  expect(await page.evaluate(() => window.__demandes)).toBe(0);

  // le clic, sans bouger : il reprend ce que le survol a trouvé
  await page.mouse.down();
  await page.mouse.up();
  await page.waitForFunction((id) => {
    const g = document.querySelector("#stands g.sel");
    return g && g.getAttribute("data-id") === id;
  }, vise.id, { timeout: 20_000 });
  expect(await page.evaluate(() => window.__demandes)).toBe(0);

  /* Que le stand se soit allumé dit que la relecture différée rend bien ce
     qui est peint. Passé sur une allée vide, elle ne rend rien : la
     bibliothèque l'avertit alors une fois, et ce n'est pas une panne. */
  expect(erreurs).toEqual([]);
});
