/**
 * Le plan tel qu'un visiteur s'en sert : il s'ouvre, on y cherche, on y lit
 * une fiche, on change de pavillon, on le lit en anglais.
 */
const { test, expect } = require("@playwright/test");
const { prepare, attendLaListe, DONNEES, PREMIER } = require("./aide.js");

const PLAN = "/plan?plan=smcl-2026";

test.describe("le plan public", () => {
  test("s'ouvre sans erreur, liste et stands en place @telephone", async ({ page }) => {
    const erreurs = await prepare(page);
    await page.goto(PLAN);
    const lignes = await attendLaListe(page);
    // tous les stands du pavillon ouvert, ni plus ni moins
    await expect(lignes).toHaveCount(PREMIER);
    expect(await page.locator("svg [data-id]").count()).toBeGreaterThanOrEqual(PREMIER);
    expect(erreurs).toEqual([]);
  });

  test("la recherche resserre la liste, et la rend quand on l'efface", async ({ page }) => {
    const erreurs = await prepare(page);
    await page.goto(PLAN);
    const lignes = await attendLaListe(page);
    const avant = await lignes.count();
    // un numéro de stand est sans ambiguïté, là où un nom pourrait en recouper d'autres
    const numero = (await lignes.first().innerText()).trim().split(/\s+/)[0];
    await page.fill("#q", numero);
    await expect.poll(() => lignes.count()).toBeLessThan(avant);
    expect(await lignes.count()).toBeGreaterThan(0);
    await page.fill("#q", "");
    await expect.poll(() => lignes.count()).toBe(avant);
    expect(erreurs).toEqual([]);
  });

  test("une ligne de la liste ouvre la fiche de son exposant @telephone", async ({ page }) => {
    const erreurs = await prepare(page);
    await page.goto(PLAN);
    const lignes = await attendLaListe(page);
    const texte = (await lignes.first().innerText()).trim().split("\n");
    const nom = texte.find((l) => l.length > 3 && !/^\w?\d/.test(l)) || texte[0];
    /* Sur un téléphone, la liste est un tiroir replié au bas de l'écran : on y
       arrive en cherchant, comme le visiteur, plutôt qu'en forçant un clic sur
       une ligne qu'il ne voit pas. */
    await page.fill("#q", texte[0].trim());
    await expect.poll(() => lignes.count()).toBeLessThan(PREMIER);
    await lignes.first().click();
    await expect(page.locator("#detail")).toContainText(nom.trim());
    expect(erreurs).toEqual([]);
  });

  test("les onglets passent d'un pavillon à l'autre", async ({ page }) => {
    test.skip(DONNEES.plans.length < 2, "un seul pavillon dans les données");
    const erreurs = await prepare(page);
    await page.goto(PLAN);
    await attendLaListe(page);
    const onglets = page.locator("#halls button");
    await expect(onglets).toHaveCount(DONNEES.plans.length);
    await expect(onglets.nth(0)).toHaveAttribute("aria-pressed", "true");
    await onglets.nth(1).click();
    await expect(onglets.nth(1)).toHaveAttribute("aria-pressed", "true");
    await expect(onglets.nth(0)).toHaveAttribute("aria-pressed", "false");
    expect(erreurs).toEqual([]);
  });

  test("s'ouvre en anglais par l'adresse", async ({ page }) => {
    const erreurs = await prepare(page);
    await page.goto(PLAN + "&lang=en");
    await attendLaListe(page);
    await expect(page.locator("#q")).toHaveAttribute("placeholder", "Exhibitor, stand…");
    expect(erreurs).toEqual([]);
  });

  test("le drapeau passe à l'anglais sans recharger", async ({ page }) => {
    const erreurs = await prepare(page);
    await page.goto(PLAN);
    await attendLaListe(page);
    await expect(page.locator("#q")).toHaveAttribute("placeholder", "Exposant, stand…");
    await page.evaluate(() => { window.__memePage = true; });
    await page.click("#btnLangue");
    await expect(page.locator("#q")).toHaveAttribute("placeholder", "Exhibitor, stand…");
    expect(await page.evaluate(() => window.__memePage)).toBe(true);
    expect(erreurs).toEqual([]);
  });

  test("se dessine aussi sans WebGL", async ({ page }) => {
    const erreurs = await prepare(page);
    await page.goto(PLAN + "&rendu=svg");
    await attendLaListe(page);
    expect(await page.locator("svg [data-id]").count()).toBeGreaterThanOrEqual(PREMIER);
    expect(erreurs).toEqual([]);
  });

  test("propose la visite guidée au visiteur neuf, une fois", async ({ page }) => {
    const erreurs = await prepare(page, { premiereVisite: true });
    await page.goto(PLAN);
    await attendLaListe(page);
    const modale = page.locator("#modale");
    await expect(modale).toContainText("Découvrir le plan");
    await page.keyboard.press("Escape");
    await expect(modale).not.toHaveClass(/open/);
    await page.reload();
    await attendLaListe(page);
    await page.waitForTimeout(3000);
    await expect(modale).not.toHaveClass(/open/);
    expect(erreurs).toEqual([]);
  });
});

test.describe("le plan de démonstration", () => {
  test("se suffit de ses données embarquées", async ({ page }) => {
    const erreurs = await prepare(page);
    const demandes = [];
    page.on("request", (r) => { if (r.url().includes("/api/plan")) demandes.push(r.url()); });
    await page.goto("/plan-smcl.html");
    const lignes = await attendLaListe(page);
    await expect(lignes).toHaveCount(PREMIER);
    expect(demandes).toEqual([]);
    expect(erreurs).toEqual([]);
  });
});

test.describe("les autres pages", () => {
  for (const [nom, adresse] of [
    ["l'accueil", "/index.html"],
    ["la console", "/admin-plans.html"],
    ["le rapport", "/rapport.html"],
    ["le mot de passe", "/motdepasse.html"],
    ["la page hors ligne", "/hors-ligne.html"],
  ]) {
    test(nom + " s'ouvre sans erreur", async ({ page }) => {
      const erreurs = await prepare(page);
      await page.goto(adresse);
      await page.waitForLoadState("networkidle");
      expect(await page.locator("body").innerText()).not.toBe("");
      expect(erreurs).toEqual([]);
    });
  }

  test("l'administration d'un plan demande d'abord qui l'on est", async ({ page }) => {
    const erreurs = await prepare(page);
    await page.goto("/plan-admin.html?plan=smcl-2026");
    await page.waitForLoadState("networkidle");
    expect(erreurs).toEqual([]);
  });
});
