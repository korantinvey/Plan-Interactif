/**
 * Le choix de l'ambiance, offert sur la démonstration.
 *
 * Le salon de démonstration existe deux fois : figé dans `/demo`, et écrit
 * dans la base, servi par le plan public à `?plan=demo`. Le second avait
 * perdu les trois boutons que le premier porte, sans que rien ne le relève
 * (`modules/choix-ambiance.mjs`). Les données sont celles de `plans.json` :
 * c'est le nom du salon qui décide, pas ce qu'il montre.
 */
const { test, expect } = require("@playwright/test");
const { prepare, attendLaListe } = require("./aide");

test("le salon de démonstration offre le choix de l'ambiance", async ({ page }) => {
  const erreurs = await prepare(page);
  // en habitué de ce salon-ci aussi : la visite guidée couvrirait les boutons
  await page.addInitScript(() => {
    localStorage.setItem("plan-tutoriel:demo", "proposee");
    localStorage.setItem("plan-installation:demo", JSON.stringify({ compris: true }));
  });
  await page.goto("/plan.html?plan=demo");
  await attendLaListe(page);
  const boite = page.locator("#choixAmbiance");
  await expect(boite).toBeVisible();
  await boite.locator('[data-ambiance="tuiles"]').click();
  await expect(page.locator("html")).toHaveClass(/ambiance-tuiles/);
  await expect(boite.locator('[data-ambiance="tuiles"]')).toHaveAttribute("aria-pressed", "true");
  expect(erreurs).toEqual([]);
});

test("un autre salon ne l'offre pas", async ({ page }) => {
  await prepare(page);
  await page.goto("/plan.html?plan=smcl-2026");
  await attendLaListe(page);
  await expect(page.locator("#choixAmbiance")).toBeHidden();
});
