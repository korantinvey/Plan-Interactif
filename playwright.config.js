/**
 * Essais dans un vrai navigateur, sur les pages construites de `web/`.
 *
 * Les contrôles de `npm run verifie` lisent les sources : ils voient une
 * syntaxe fautive ou une traduction absente, jamais une page qui plante au
 * démarrage, une recherche qui ne remonte plus rien ou une fiche qui ne
 * s'ouvre plus. Ces essais ouvrent les pages comme un visiteur et vérifient
 * ce qu'il verrait.
 *
 * Ils portent sur `plan-smcl.html`, qui embarque ses données : ni clé, ni
 * réseau, ni base — le résultat ne dépend que du dépôt.
 */
const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "outils/navigateur",
  /* Une page de quarante mille lignes met quelques secondes à monter ; la
     marge par défaut suffit, mais pas sur un poste d'intégration chargé. */
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? [["list"], ["github"]] : "list",
  use: {
    baseURL: "http://localhost:4180",
    /* Le français par défaut : la page suit la langue du navigateur, et celle
       d'un poste d'intégration est l'anglais. */
    locale: "fr-FR",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "ordinateur", use: { ...devices["Desktop Chrome"] } },
    { name: "telephone",  use: { ...devices["Pixel 7"] } },
  ],
  /* Le serveur d'essai du dépôt, celui de `npm run essai` : il sert `web/`
     tel quel, comme Cloudflare. */
  webServer: {
    command: "node outils/serve.js",
    url: "http://localhost:4180/index.html",
    reuseExistingServer: !process.env.CI,
  },
});
