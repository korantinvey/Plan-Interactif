/**
 * Un tap ne reconvertit que les stands qui changent (`webgl.mjs`
 * `emplacementGarde`).
 *
 * Choisir un stand salissait le bloc entier, et chacun des stands du salon se
 * redécoupait pour en allumer un seul. Chaque emplacement garde désormais sa
 * conversion d'un repeint à l'autre. L'essai éprouve les deux promesses de
 * cette mémoire, dans chaque ambiance : un tap ne refait qu'une poignée
 * d'emplacements, et ce qu'elle verse est, à l'octet près, ce que la
 * conversion aurait produit d'elle-même (`compareConversions`) — après un
 * tap, un autre, une recherche qui éteint la moitié du hall, et la fiche
 * refermée.
 */
const { test, expect } = require("@playwright/test");
const { prepare, attendLaListe, standAViser } = require("./aide");

/** Le stand choisi, d'après le SVG caché. */
const choisi = (page) => page.evaluate(() => {
  const g = document.querySelector("#stands > g.sel");
  return g ? g.getAttribute("data-id") : null;
});

/**
 * Choisit un autre stand que celui-ci par la liste, et rend celui que la
 * sélection a pris.
 *
 * Par la liste et non par un tap : en immersif, `standAViser` vise l'emprise à
 * plat, et le tap retombait sur le volume haussé du stand choisi, ou sur rien —
 * l'essai d'avant croyait avoir changé de stand en retapant le premier. Une
 * ligne choisit son stand par le même `select` (`fiche.mjs`) que le tap :
 * c'est ce changement que la mémoire doit suivre.
 */
async function choisitUnAutre(page, avant, attente) {
  const lignes = page.locator("#list .row");
  const n = Math.min(await lignes.count(), 12);
  for (let i = 0; i < n; i++) {
    await lignes.nth(i).click();
    await repose(page, attente);
    const id = await choisi(page);
    if (id && id !== avant) return id;
  }
  return null;
}

/** Le repeint qui suit une action, fini : plus rien d'attendu, et les volumes arrivés. */
async function repose(page, attente) {
  await page.waitForTimeout(attente);
  await page.waitForFunction(() => !window.__essais.GL.image, null, { timeout: 10_000 });
}

for (const ambiance of ["classique", "tuiles", "immersif"]) {
  test(`en ${ambiance}, un tap ne refait que les stands qui changent, et l'image n'en change pas`, async ({ page }) => {
    test.setTimeout(120_000);
    const erreurs = await prepare(page);
    await page.goto("/plan.html?plan=smcl-2026&ambiance=" + ambiance);
    await attendLaListe(page);
    const dessin = await page.waitForFunction(() => window.__essais.GL.pret, null, { timeout: 30_000 })
      .then(() => true, () => false);
    test.skip(!dessin, "pas de carte graphique : le plan reste en SVG");
    if (ambiance === "immersif") {
      const camera = await page.waitForFunction(() => window.__essais.GL.camera, null, { timeout: 15_000 })
        .then(() => true, () => false);
      test.skip(!camera, "pas de vue immersive : le plan reste à plat");
    }
    // un volume qui monte met une seconde à arriver : sa conversion ne se garde qu'ensuite
    const attente = ambiance === "immersif" ? 1500 : 600;
    await repose(page, 1500);
    const ecarts = () => page.evaluate(() => window.__essais.compareConversions());
    expect(await ecarts()).toEqual([]);
    const total = await page.evaluate(() => document.querySelectorAll("#stands > g, #zones > g").length);

    // un premier stand, puis un autre : à chaque fois, l'ancien et le nouveau
    const a = await standAViser(page);
    expect(a).not.toBeNull();
    await page.mouse.click(a.x, a.y);
    await expect(page.locator("#detail")).toBeVisible();
    await repose(page, attente);
    // l'image d'abord, la mesure ensuite : chacune peut échouer seule
    const refaits = await page.evaluate(() => window.__essais.GL.emplacementsRefaits);
    expect(await ecarts()).toEqual([]);
    expect(refaits).toBeGreaterThan(0);
    expect(refaits).toBeLessThanOrEqual(4);
    expect(total).toBeGreaterThan(20 * refaits);

    // un autre stand ensuite, exclu par identifiant : la sélection doit l'avoir suivi
    const idA = await choisi(page);
    expect(idA).toBeTruthy();
    const idB = await choisitUnAutre(page, idA, attente);
    expect(idB).toBeTruthy();
    expect(idB).not.toBe(idA);
    const refaitsB = await page.evaluate(() => window.__essais.GL.emplacementsRefaits);
    expect(await ecarts()).toEqual([]);
    expect(refaitsB).toBeLessThanOrEqual(4);

    // une recherche éteint une partie du hall, stands et zones dans le même repeint
    await page.keyboard.press("Escape");
    await page.fill("#q", "a");
    await repose(page, attente);
    expect(await ecarts()).toEqual([]);
    await page.fill("#q", "");
    await repose(page, attente);
    expect(await ecarts()).toEqual([]);
    /* Et le tap qui suit ne refait toujours que ce qui change : chaque bloc
       garde l'âge de son propre contexte, que le passage de l'autre ne fait
       pas vieillir. */
    const idC = await choisitUnAutre(page, idB, attente);
    expect(idC).toBeTruthy();
    expect(idC).not.toBe(idB);
    const refaitsC = await page.evaluate(() => window.__essais.GL.emplacementsRefaits);
    expect(await ecarts()).toEqual([]);
    expect(refaitsC).toBeLessThanOrEqual(4);
    expect(erreurs).toEqual([]);
  });
}
