/**
 * Les repères des outils de l'exploitant, peints et visés par le dessin
 * (`modules/scene-edition.mjs`).
 *
 * L'administration exige le WebGL : les poignées et le cadre de la forme
 * choisie ne s'écrivent plus dans le SVG caché, ils se posent en données dans
 * la scène d'édition, que le dessin peint et vise. L'essai trace un
 * rectangle — son ébauche et sa cote passent par la scène —, le choisit,
 * demande à la carte graphique ce qui est sous une poignée — elle doit rendre
 * la prise de l'éditeur, en données —, puis la tire : la forme s'agrandit, et
 * les poignées la suivent.
 *
 * En WebGL logiciel, ce geste prend du temps : l'essai ne vise qu'une
 * poignée, une fois.
 */
const { test, expect } = require("@playwright/test");
const { ouvreAdmin } = require("./aide");

/** La boîte à l'écran d'un repère de la scène, et son centre. */
const ecranDe = (page, nom, rang) => page.evaluate(([nom, rang]) => {
  const { reperes, rectEcranBoite } = window.__essais.scene;
  const r = reperes(nom)[rang];
  if (!r) return null;
  const pts = r.anneaux ? r.anneaux.flat() : r.chemin;
  const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]);
  const b = rectEcranBoite([Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]);
  return { x: b.left + b.width / 2, y: b.top + b.height / 2, w: b.width, h: b.height, prise: r.prise || null };
}, [nom, rang]);

test("les poignées de la forme choisie se peignent et se saisissent par le dessin", async ({ page }) => {
  test.setTimeout(180_000);
  const erreurs = await ouvreAdmin(page);
  const dessin = await page.waitForFunction(() => window.__essais.GL.pret, null, { timeout: 20_000 })
    .then(() => true, () => false);
  test.skip(!dessin, "pas de carte graphique : l'administration n'édite pas");

  // un calque neuf, un rectangle tracé au milieu du plan
  await page.locator("#btnLayers").click();
  await page.locator("#pile button.ajout", { hasText: "Nouveau calque" }).click();
  await page.locator("#mPied button", { hasText: "Valider" }).click();
  await expect(page.locator("#outils")).toHaveClass(/\bopen\b/);
  const scene = await page.locator("#stage").evaluate((e) => {
    const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  await page.locator('#outils .outilsBtns button[data-o="rect"]').click();
  await page.mouse.move(scene.x - 60, scene.y - 40);
  await page.mouse.down();
  await page.mouse.move(scene.x + 60, scene.y + 40, { steps: 3 });
  // en traçant : l'ébauche et la cote du geste, dans la scène et non dans le SVG
  const enTracant = await page.evaluate(() => {
    const { reperes } = window.__essais.scene;
    return { ebauche: reperes("ebauche").length, cote: (reperes("cote")[0] || {}).texte || "",
             svg: Boolean(document.querySelector("#apercu, #cote")) };
  });
  expect(enTracant.ebauche).toBeGreaterThan(0);
  expect(enTracant.cote).toMatch(/×/);
  expect(enTracant.svg).toBe(false);
  await page.mouse.up();
  await expect.poll(() => page.evaluate(() => window.__essais.scene.reperes("ebauche").length)).toBe(0);

  // la main : la forme tracée se choisit, ses poignées entrent dans la scène, pas dans le SVG
  await page.locator('#outils .outilsBtns button[data-o="main"]').click();
  await page.mouse.click(scene.x, scene.y);
  await expect.poll(() => page.evaluate(() => window.__essais.scene.reperes("poignees").length),
    { timeout: 30_000 }).toBeGreaterThan(1);
  expect(await page.evaluate(() => document.querySelector("#poignees"))).toBeNull();

  // la première poignée : le cadre vient d'abord dans la scène, les poignées après
  const p = await ecranDe(page, "poignees", 1);
  expect(p && p.prise).toEqual(expect.objectContaining({ outil: "edition", i: 0 }));
  await page.waitForFunction(() => !window.__essais.GL.image, null, { timeout: 30_000 });
  const visee = await page.evaluate(([x, y]) => window.__essais.scene.repereSousWebgl(x, y, "edition"), [p.x, p.y]);
  expect(visee, "la carte graphique rend la prise de la poignée").toEqual(expect.objectContaining({ outil: "edition", i: 0 }));

  // tirée vers le haut à gauche, elle agrandit la forme, et le cadre suit
  const avant = await ecranDe(page, "poignees", 0);
  await page.mouse.move(p.x, p.y);
  await page.mouse.down();
  await page.mouse.move(p.x - 40, p.y - 30, { steps: 4 });
  await page.mouse.up();
  await expect.poll(async () => (await ecranDe(page, "poignees", 0)).w, { timeout: 30_000 })
    .toBeGreaterThan(avant.w + 20);
  expect(erreurs).toEqual([]);
});
