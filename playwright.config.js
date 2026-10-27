/**
 * Les essais dans un vrai navigateur : `npm run navigateur`.
 *
 * Les essais de `outils/essais/` éprouvent le moteur de la journée organisée,
 * hors page. Rien ne vérifiait qu'un visiteur voie son plan, cherche un
 * exposant, ouvre une fiche — on le contrôlait à la main, dans Chromium, à
 * chaque chantier. Ceci le fait à chaque poussée.
 *
 * Les pages sont servies par `outils/scripts/serve.js`, comme en essai local ; les
 * données du plan, elles, ne viennent jamais du réseau : chaque essai les
 * intercepte et sert `outils/donnees/plans.json` (voir `outils/essais/navigateur/aide.js`).
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
  // Chaque essai ouvre sa propre page, et rien ne le lie à l'ordre de son
  // fichier. Sans ce réglage, un fichier passait en bloc sur un seul worker :
  // `plan.spec.js` y prenait cinq minutes à lui seul, et les tranches de
  // l'intégration (`--shard`) ne pouvaient pas le répartir.
  fullyParallel: true,
  /* Une reprise en intégration : sous sa carte graphique logicielle, un même
     essai y varie du simple au triple, et un dépassement de délai passager
     bloquait une fusion sans rien dire du code. L'essai repris reste signalé
     « flaky » ; un vrai défaut échoue deux fois et reste rouge. */
  retries: process.env.CI ? 1 : 0,
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
    command: "node outils/scripts/serve.js",
    url: "http://localhost:4180/plan-smcl.html",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
