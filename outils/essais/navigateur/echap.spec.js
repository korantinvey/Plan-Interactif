/**
 * « Échap » ferme ce qui est devant, et rien d'autre.
 *
 * La fenêtre commune se pose par-dessus les tiroirs : la touche qui la ferme
 * ne doit pas emporter du même coup le tiroir qu'elle couvrait — le parcours
 * qu'on partageait, la fiche qu'on lisait, la liste qu'on parcourait. Un
 * second appui, la fenêtre partie, retrouve le tiroir et fait ce qu'il fait
 * sans elle.
 */
const { test, expect } = require("@playwright/test");
const { prepare, attendLaListe, DONNEES } = require("./aide.js");

const PLAN = "/plan?plan=smcl-2026";

const fenetre = (page) => page.locator("#modale");

test.describe("« Échap » sur une fenêtre ouverte", () => {
  /* Chaque essai charge le plan entier, ouvre un tiroir puis une fenêtre :
     le délai ordinaire y passe presque tout entier sur une machine lente. */
  test.slow();

  test("ferme la fenêtre de partage, et laisse le tiroir du parcours", async ({ page }) => {
    const erreurs = await prepare(page);
    /* Un parcours d'un stand, posé comme le plan l'aurait gardé : vide, le
       bouton de partage reste éteint. */
    const stand = DONNEES.plans[0].stands[0].id;
    await page.addInitScript((id) => {
      localStorage.setItem("plan-parcours:smcl-2026", JSON.stringify({ stands: [id], confs: [] }));
    }, stand);
    await page.goto(PLAN);
    await attendLaListe(page);

    await page.click("#btnParcours");
    await expect(page.locator("#parcours")).toHaveClass(/\bopen\b/);
    await page.click("#btnPartage");
    await expect(fenetre(page)).toHaveClass(/\bopen\b/);

    await page.keyboard.press("Escape");
    await expect(fenetre(page)).not.toHaveClass(/\bopen\b/);
    await expect(page.locator("#parcours")).toHaveClass(/\bopen\b/);

    // sans fenêtre devant, « Échap » referme le tiroir, comme il l'a toujours fait
    await page.keyboard.press("Escape");
    await expect(page.locator("#parcours")).not.toHaveClass(/\bopen\b/);
    expect(erreurs).toEqual([]);
  });

  test("ferme la fenêtre, et laisse la fiche ouverte dessous", async ({ page }) => {
    const erreurs = await prepare(page);
    await page.goto(PLAN);
    const lignes = await attendLaListe(page);
    await lignes.first().click();
    await expect(page.locator("#detail")).toHaveClass(/\bopen\b/);

    // la notice de confidentialité, au pied de la liste, s'ouvre par-dessus la fiche
    await page.click("#btnConfidentialite");
    await expect(fenetre(page)).toHaveClass(/\bopen\b/);

    await page.keyboard.press("Escape");
    await expect(fenetre(page)).not.toHaveClass(/\bopen\b/);
    await expect(page.locator("#detail")).toHaveClass(/\bopen\b/);

    await page.keyboard.press("Escape");
    await expect(page.locator("#detail")).not.toHaveClass(/\bopen\b/);
    expect(erreurs).toEqual([]);
  });

  test("ferme la fenêtre, et laisse la liste à son cran @telephone", async ({ page }) => {
    const erreurs = await prepare(page);
    await page.goto(PLAN);
    await attendLaListe(page);
    test.skip(await page.evaluate(() => innerWidth > 900), "la liste n'est un tiroir que sur écran étroit");

    // la liste montée en entier, la notice ouverte depuis son pied
    await page.click("#poignee");
    await expect(page.locator("#side")).toHaveAttribute("data-cran", "demi");
    await page.click("#poignee");
    await expect(page.locator("#side")).toHaveAttribute("data-cran", "plein");
    await page.click("#btnConfidentialite");
    await expect(fenetre(page)).toHaveClass(/\bopen\b/);

    await page.keyboard.press("Escape");
    await expect(fenetre(page)).not.toHaveClass(/\bopen\b/);
    await expect(page.locator("#side")).toHaveAttribute("data-cran", "plein");

    await page.keyboard.press("Escape");
    await expect(page.locator("#side")).toHaveAttribute("data-cran", "replie");
    expect(erreurs).toEqual([]);
  });
});
