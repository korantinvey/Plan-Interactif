/**
 * Les autres pages, ouvertes une à une : elles doivent se monter sans erreur,
 * même coupées du réseau — la console et le rapport attendent une connexion
 * qu'elles n'ont pas ici, et doivent l'attendre sans planter.
 */
const { test, expect } = require("@playwright/test");

const PAGES = [
  ["/index.html",       "Console des plans de salon"],
  ["/admin-plans.html", "Console des plans de salon"],
  ["/rapport.html",     "Rapport d'utilisation"],
  ["/motdepasse.html",  /Mot de passe/],
  ["/hors-ligne.html",  /Hors ligne/],
];

for (const [chemin, titre] of PAGES) {
  test(chemin + " se monte sans erreur", async ({ page, context }) => {
    const erreurs = [];
    page.on("pageerror", e => erreurs.push(e.message));
    await context.route(u => u.origin !== "http://localhost:4180", r => r.abort());
    await page.goto(chemin);
    await expect(page).toHaveTitle(titre);
    await page.waitForLoadState("networkidle");
    expect(erreurs).toEqual([]);
  });
}
