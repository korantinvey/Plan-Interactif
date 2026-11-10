/**
 * Sur un téléphone, la fiche s'ouvre assez haute pour se lire.
 *
 * Ouverte au cran du milieu, une fiche bien remplie se lisait par une fente :
 * il fallait la hisser pour voir ce qu'on était venu y chercher. Elle s'ouvre
 * donc au plus haut — un plafond, qu'une fiche courte n'atteint pas — et la
 * première pression sur la prise la réduit au lieu de l'agrandir.
 */
const { test, expect } = require("@playwright/test");
const { prepare, attendLaListe, PREMIER } = require("./aide.js");

const PLAN = "/plan?plan=smcl-2026";

test("la fiche s'ouvre au plus haut, et la prise la réduit @telephone", async ({ page }) => {
  test.slow();
  const erreurs = await prepare(page);
  // en SVG : on éprouve le tiroir, non le dessin (voir `plan.spec.js`)
  await page.goto(PLAN + "&rendu=svg");
  test.skip(await page.evaluate(() => innerWidth > 900), "la fiche n'est un tiroir que sur écran étroit");
  const lignes = await attendLaListe(page);
  /* La liste est repliée au bas de l'écran : on y arrive en cherchant, comme
     le visiteur. */
  const texte = (await lignes.first().innerText()).trim().split("\n");
  await page.fill("#q", texte[0].trim());
  await expect.poll(() => lignes.count()).toBeLessThan(PREMIER);
  await lignes.first().click();

  const fiche = page.locator("#detail");
  await expect(fiche).toHaveClass(/\bopen\b/);
  await expect(fiche).toHaveAttribute("data-cran", "plein");

  /* Tout se voit, ou le tiroir a pris tout ce qu'il pouvait : la transition
     finie, son corps ne cache rien, ou sa hauteur touche le plafond. */
  await expect.poll(() => fiche.evaluate((n) => {
    const corps = n.querySelector(".detail-bd");
    const cache = corps ? corps.scrollHeight - corps.clientHeight : 0;
    return cache <= 1 || n.offsetHeight >= innerHeight * .92 - 2;
  })).toBe(true);

  await page.click("#poigneeFiche");
  await expect(fiche).toHaveAttribute("data-cran", "replie");
  expect(erreurs).toEqual([]);
});
