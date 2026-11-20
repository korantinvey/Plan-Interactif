/**
 * À la souris, l'appui et le survol ne demandent plus rien à la carte
 * graphique (`modules/gestes.mjs`, `webgl.mjs` `viseEnAvance`,
 * `moteur-gl.mjs` `designe`).
 *
 * L'appui demandait ce qui était sous la souris en attendant la réponse : la
 * page patientait jusqu'à ce que la carte graphique ait fini l'image en cours,
 * trente-cinq à cinquante millisecondes par clic sur un PC à carte intégrée,
 * en vue immersive, avant que le stand ne commence à monter (`?perf`, FUNEXPO,
 * 20 novembre 2026). Le survol n'en dispensait qu'une souris immobile depuis sa
 * réponse : un clic qui suit un mouvement la redemandait. La question part
 * ensuite sans l'attendre — mais sa relecture, différée, bloquait encore la
 * page une tâche plus tard, jusqu'à cent millisecondes, au clic comme au
 * survol (même relevé, sur la branche). Le moteur la tranche désormais par le
 * calcul. L'essai compte les questions posées à la carte, attendues
 * (`pickObject`) ou différées (`pickObjectAsync`), pendant un survol puis un
 * clic bref qui suit un mouvement : aucune, et le stand est choisi.
 */
const { test, expect } = require("@playwright/test");
const { prepare, attendLaListe, standAViser } = require("./aide.js");

test("un survol et un clic à la souris choisissent leur stand sans rien demander à la carte graphique", async ({ page }) => {
  const erreurs = await prepare(page);
  await page.goto("/plan?plan=smcl-2026");
  await attendLaListe(page);
  const webgl = await page.waitForFunction(() => window.__essais.GL.actif && window.__essais.GL.deck, null, { timeout: 30_000 })
    .then(() => true, () => false);
  test.skip(!webgl, "pas de carte graphique : le plan reste en SVG");
  test.skip(await page.evaluate(() => innerWidth <= 900), "la souris est celle d'un écran large");
  await page.waitForFunction(() => document.documentElement.classList.contains("plan-affiche"), null, { timeout: 30_000 });
  await page.waitForTimeout(1000);

  // les questions posées à la carte, attendues ou différées, comptées sur le moteur même
  await page.evaluate(() => {
    const d = window.__essais.GL.deck, pick = d.pickObject.bind(d), differe = d.pickObjectAsync.bind(d);
    window.__attendues = 0;
    d.pickObject = (o) => { window.__attendues++; return pick(o); };
    d.pickObjectAsync = (o) => { window.__attendues++; return differe(o); };
  });
  const p = await standAViser(page);
  expect(p).not.toBeNull();
  // la souris arrive sur le stand et clique aussitôt : le survol n'a pas encore répondu
  await page.mouse.move(p.x - 40, p.y - 40);
  await page.waitForTimeout(300);
  // le survol d'abord : la souris passe sur le plan, et la question lui est répondue sans la carte
  const calculees = () => page.evaluate(() => window.__essais.GL.deck.designationsCalculees || 0);
  const avant = await calculees();
  await page.mouse.move(p.x - 20, p.y - 20, { steps: 4 });
  await expect.poll(calculees).toBeGreaterThan(avant);
  expect(await page.evaluate(() => window.__attendues)).toBe(0);
  await page.mouse.move(p.x, p.y);
  // un clic bref : au banc, sans carte graphique, plus court que la réponse — le relâché l'attend
  await page.mouse.down();
  await page.waitForTimeout(80);
  await page.mouse.up();
  await expect.poll(() => page.evaluate(() => (document.querySelector("#stands > g.sel") || {}).dataset?.id)).toBe(p.id);
  expect(await page.evaluate(() => window.__attendues)).toBe(0);
  expect(erreurs).toEqual([]);
});
