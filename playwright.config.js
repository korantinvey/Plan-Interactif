/**
 * Les essais dans un vrai navigateur : `npm run navigateur`.
 *
 * Les essais de `outils/essais/` éprouvent le moteur de la journée organisée,
 * hors page. Rien ne vérifiait qu'un visiteur voie son plan, cherche un
 * exposant, ouvre une fiche — on le contrôlait à la main, dans Chromium, à
 * chaque chantier. Ceci le fait à chaque poussée.
 *
 * Les pages sont servies par `outils/serve.js`, comme en essai local ; les
 * données du plan, elles, ne viennent jamais du réseau : chaque essai les
 * intercepte et sert `outils/plans.json` (voir `outils/essais/navigateur/aide.js`).
 * Un essai ne dépend ainsi ni de la production, ni de son quota, ni d'une
 * synchronisation faite la veille.
 */
const { defineConfig, devices } = require("@playwright/test");

/* `PLAN_ADRESSE=https://…` fait viser un déploiement — une prévisualisation de
   branche, la production — au lieu du serveur local. Les données restent celles
   de `plans.json` : on éprouve les pages servies, pas les salons du jour. */
const ADRESSE = process.env.PLAN_ADRESSE || "http://localhost:4180";

module.exports = defineConfig({
  testDir: "outils/essais/navigateur",
  // les essais d'une page se gênent si l'on en lance trop à la fois sur une
  // petite machine d'intégration : le dessin du plan est lourd
  workers: process.env.CI ? 2 : undefined,
  retries: 0,
  timeout: 45_000,
  expect: { timeout: 15_000 },
  reporter: process.env.CI ? [["list"], ["github"]] : "list",
  use: {
    baseURL: ADRESSE,
    trace: "retain-on-failure",
    locale: "fr-FR",
    timezoneId: "Europe/Paris",
  },
  projects: [
    { name: "bureau", use: { ...devices["Desktop Chrome"], viewport: { width: 1400, height: 900 } } },
    { name: "telephone", use: { ...devices["Pixel 7"] }, grep: /@telephone/ },
  ],
  webServer: process.env.PLAN_ADRESSE ? undefined : {
    command: "node outils/serve.js",
    url: "http://localhost:4180/plan-smcl.html",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
