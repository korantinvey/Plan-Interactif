/**
 * Le plan de démonstration, parcouru comme un visiteur.
 *
 * Chaque essai part d'une page neuve, coupée de tout ce qui n'est pas le
 * serveur d'essai : une page qui dépendrait d'un tiers pour se monter, ou qui
 * lui parlerait sans consentement, échoue ici au lieu de fuir en production.
 */
const { test: base, expect } = require("@playwright/test");

const PLAN = "/plan-smcl.html";
/* La clé sous laquelle la visite guidée se retient d'avoir été proposée
   (`_tutoriel.html` `cleTuto`) : posée d'avance, elle écarte la fenêtre qui
   couvrirait le plan — sauf pour l'essai qui la regarde. */
const CLE_TUTO = "plan-tutoriel:SMCL 2026";

const test = base.extend({
  /* Les erreurs de la page, relevées pour que chaque essai finisse par
     vérifier qu'il n'y en a eu aucune. */
  erreurs: async ({ page }, use) => {
    const erreurs = [];
    page.on("pageerror", e => erreurs.push(e.message));
    page.on("console", m => { if (m.type() === "error") erreurs.push(m.text()); });
    await use(erreurs);
  },
  /* Ce que la page a tenté de joindre hors du serveur d'essai. */
  sorties: async ({ context }, use) => {
    const sorties = [];
    await context.route(u => u.origin !== "http://localhost:4180", r => {
      sorties.push(r.request().url());
      return r.abort();
    });
    await use(sorties);
  },
  tutoriel: [false, { option: true }],
  page: async ({ page, tutoriel }, use) => {
    if (!tutoriel) await page.addInitScript(cle => {
      try { localStorage.setItem(cle, "vue"); } catch (e) {}
    }, CLE_TUTO);
    await use(page);
  },
});

/* La page est prête quand l'index des exposants est rempli. */
async function ouvre(page, suite = ""){
  await page.goto(PLAN + suite);
  await page.waitForFunction(() => typeof TOUS !== "undefined" && TOUS.length > 0);
}

test.afterEach(async ({ erreurs, sorties }) => {
  expect(erreurs, "erreurs dans la page").toEqual([]);
  expect(sorties, "appels hors du serveur d'essai").toEqual([]);
});

test("le plan se monte, avec ses exposants et son dessin", async ({ page }) => {
  await ouvre(page);
  await expect(page).toHaveTitle("SMCL 2026");
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  expect(await page.evaluate(() => TOUS.length)).toBeGreaterThan(500);
  await expect(page.locator("#list .row").first()).toBeAttached();
  /* Le rendu par défaut est WebGL : son canevas doit exister. */
  await expect(page.locator("canvas").first()).toBeAttached();
});

test("la recherche retrouve un exposant et ouvre sa fiche", async ({ page }) => {
  await ouvre(page);
  await page.fill("#q", "airbnb");
  await expect(page.locator("#list .row")).toHaveCount(1);
  await expect(page.locator("#countTxt")).toContainText("1 résultat");
  await page.locator("#list .row").first().click();
  await expect(page.locator("#detail")).toHaveClass(/\bopen\b/);
  await expect(page.locator("#dName")).toHaveText(/airbnb/i);
});

test("vider la recherche rend toute la liste", async ({ page }) => {
  await ouvre(page);
  const tous = await page.locator("#list .row").count();
  await page.fill("#q", "airbnb");
  await expect(page.locator("#list .row")).toHaveCount(1);
  await page.fill("#q", "");
  await expect(page.locator("#list .row")).toHaveCount(tous);
});

test("une recherche sans réponse ne laisse aucune ligne", async ({ page }) => {
  await ouvre(page);
  await page.fill("#q", "zzqqxxw");
  await expect(page.locator("#list .row")).toHaveCount(0);
});

test("le drapeau passe en anglais sans recharger", async ({ page }) => {
  await ouvre(page);
  await expect(page.locator("#q")).toHaveAttribute("placeholder", /Exposant/);
  await page.click("#btnLangue");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("#q")).toHaveAttribute("placeholder", /Exhibitor/);
});

test("?lang=en impose l'anglais dès l'ouverture", async ({ page }) => {
  await ouvre(page, "?lang=en");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("#q")).toHaveAttribute("placeholder", /Exhibitor/);
});

test("?rendu=svg dessine le plan sans WebGL", async ({ page }) => {
  await ouvre(page, "?rendu=svg");
  await expect(page.locator("canvas")).toHaveCount(0);
  expect(await page.locator("#stands > *").count()).toBeGreaterThan(100);
});

test.describe("la visite guidée", () => {
  test.use({ tutoriel: true });

  test("se propose à la première visite, et se referme", async ({ page }) => {
    await ouvre(page);
    const fenetre = page.locator("#modale.open");
    await expect(fenetre).toContainText("Découvrir le plan");
    await fenetre.getByRole("button", { name: "Non merci" }).click();
    await expect(page.locator("#modale.open")).toHaveCount(0);
  });

  /* Le contrôle des traductions lit les sources ; il ne voit pas une phrase
     traduite que la page recolle à autre chose avant de l'afficher. Ici on
     relève ce qui reste en français à l'écran, données exceptées. */
  test("n'affiche rien en français dans la version anglaise", async ({ page }) => {
    await ouvre(page, "?lang=en&manques");
    await expect(page.locator("#modale.open")).toBeVisible();
    const restes = await page.evaluate(() =>
      (LANGUE.manques() || []).filter(l => !/\((?:\.nm|OPTION)\)\s*$/.test(l)));
    expect(restes).toEqual([]);
  });
});
