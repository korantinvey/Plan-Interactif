/**
 * Sur un téléphone, le tiroir se mène d'où qu'on le prenne.
 *
 * Il ne se prenait que par sa pastille — une bande de quelques pixels au bord
 * d'un tiroir qui fait toute la largeur ; replié, le reste n'est que le champ
 * de recherche — et le glissement posé ailleurs faisait défiler la liste au
 * lieu de le monter. Le doigt le mène désormais
 * depuis tout ce qu'il porte : vers le haut tant qu'il peut grandir, vers le
 * bas une fois son corps revenu en haut (`modules/tiroirs.mjs`
 * `meneParLeCorps`).
 *
 * Par de vrais événements tactiles, que seul le protocole de Chromium envoie :
 * l'écran tactile de Playwright ne sait que taper, et c'est justement le
 * glissement — et ce que le navigateur en fait — qu'il faut éprouver.
 */
const { test, expect } = require("@playwright/test");
const { prepare, attendLaListe, PREMIER } = require("./aide.js");

const PLAN = "/plan?plan=smcl-2026";

/** Un doigt posé en (x, y), qui glisse de `dy` pixels en douze pas. */
async function glisse(cdp, x, y, dy) {
  const pas = 12;
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
  for (let i = 1; i <= pas; i++) {
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove", touchPoints: [{ x, y: y + dy * i / pas }],
    });
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}

/** Le centre de ce qu'on voit d'un élément. */
async function centre(locator) {
  const b = await locator.boundingBox();
  return { x: b.x + b.width / 2, y: b.y + Math.min(b.height / 2, 30) };
}

test("la liste monte et descend par sa bande et par ses lignes @telephone", async ({ page }) => {
  test.slow();
  const erreurs = await prepare(page);
  // en SVG : on éprouve le tiroir, non le dessin (voir `plan.spec.js`)
  await page.goto(PLAN + "&rendu=svg");
  test.skip(await page.evaluate(() => innerWidth > 900), "la liste n'est un tiroir que sur écran étroit");
  await attendLaListe(page);
  const cdp = await page.context().newCDPSession(page);
  const tiroir = page.locator("#side");
  const cran = () => tiroir.evaluate((n) => n.dataset.cran || "replie");

  /* Replié, il ne montre que sa pastille et le champ de recherche, qui en
     prend toute la largeur : c'est donc par le champ qu'on le pousse. Le
     doigt qui glisse ne s'y pose pas — sinon le tiroir monterait au plus
     haut, comme pour chercher, et le clavier s'ouvrirait. */
  const c = await centre(page.locator("#q"));
  await glisse(cdp, c.x, c.y, -200);
  await expect.poll(cran).not.toBe("replie");
  expect(await page.evaluate(() => document.activeElement && document.activeElement.id)).not.toBe("q");

  /* Au milieu, pousser la liste la monte au lieu de la faire défiler — et le
     doigt levé sur une ligne ne la choisit pas, ce qui aurait replié le
     tiroir. */
  await expect.poll(cran).toBe("demi");
  const ligne = page.locator("#list .row").first();
  await expect(ligne).toBeVisible();
  let l = await centre(ligne);
  await glisse(cdp, l.x, l.y, -250);
  await expect.poll(cran).toBe("plein");
  await expect(page.locator("#detail")).not.toHaveClass(/\bopen\b/);
  expect(await page.locator("#list").evaluate((n) => n.scrollTop)).toBe(0);

  // la liste en haut, la tirer vers le bas descend le tiroir
  await page.waitForTimeout(400);
  l = await centre(ligne);
  await glisse(cdp, l.x, l.y, 250);
  await expect.poll(cran).not.toBe("plein");
  expect(erreurs).toEqual([]);
});

test("la fiche descend par son corps @telephone", async ({ page }) => {
  test.slow();
  const erreurs = await prepare(page);
  await page.goto(PLAN + "&rendu=svg");
  test.skip(await page.evaluate(() => innerWidth > 900), "la fiche n'est un tiroir que sur écran étroit");
  const lignes = await attendLaListe(page);
  const texte = (await lignes.first().innerText()).trim().split("\n");
  await page.fill("#q", texte[0].trim());
  await expect.poll(() => lignes.count()).toBeLessThan(PREMIER);
  await lignes.first().click();

  const fiche = page.locator("#detail");
  await expect(fiche).toHaveAttribute("data-cran", "plein");
  await page.waitForTimeout(400);
  const cdp = await page.context().newCDPSession(page);
  const corps = await centre(page.locator("#dBody"));
  // jusqu'en bas de l'écran : le cran le plus bas, quelle que soit la fiche
  const bas = await page.evaluate(() => innerHeight);
  await glisse(cdp, corps.x, corps.y, bas - 10 - corps.y);
  await expect(fiche).toHaveAttribute("data-cran", "replie");
  await expect(fiche).toHaveClass(/\bopen\b/);
  expect(erreurs).toEqual([]);
});
