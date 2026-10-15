/**
 * La page restée ouverte, au retour d'une longue absence.
 *
 * Une application installée qu'on réduit ne recharge rien : une correction
 * mise en ligne entre-temps ne l'atteignait pas. Au retour, la page relit son
 * adresse ; si le script des modules n'y est plus le sien, elle se recharge.
 * L'essai fait passer l'horloge au-delà de l'absence, puis sert la page une
 * fois telle quelle — rien ne doit bouger —, une fois sous un autre script.
 */
const { test, expect } = require("@playwright/test");
const { prepare, attendLaListe } = require("./aide");

/** Cache la page, avance l'horloge d'une heure, et la remontre. */
const absence = (page) => page.evaluate(() => {
  const vraie = Date.now, decalage = 60 * 60 * 1000;
  const etat = (v) => Object.defineProperty(document, "visibilityState", { configurable: true, get: () => v });
  etat("hidden"); document.dispatchEvent(new Event("visibilitychange"));
  Date.now = () => vraie() + decalage;
  etat("visible"); document.dispatchEvent(new Event("visibilitychange"));
});

// le service hors ligne relaierait la relecture hors de portée des routes de l'essai
test.use({ serviceWorkers: "block" });

test("au retour, la page suit la construction mise en ligne", async ({ page }) => {
  const erreurs = await prepare(page);
  await page.goto("/plan.html?plan=smcl-2026");
  await attendLaListe(page);
  await page.evaluate(() => { window.__toujours = true; });

  // la même construction en ligne : la page reste telle quelle
  let relue = page.waitForResponse((r) => r.url().includes("/plan.html") && r.request().resourceType() === "fetch");
  await absence(page);
  await relue;
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => window.__toujours)).toBe(true);

  // une autre : elle se recharge
  await page.route((u) => u.pathname === "/plan.html", async (r) => {
    if (r.request().resourceType() !== "fetch") return r.continue();
    const rep = await r.fetch();
    const corps = (await rep.text()).replace(/versions\/plan\.[0-9a-f]+\.js/, "versions/plan.0000000000.js");
    return r.fulfill({ response: rep, body: corps });
  });
  const recharge = page.waitForEvent("load");
  await absence(page);
  await recharge;
  await attendLaListe(page);
  expect(await page.evaluate(() => window.__toujours)).toBeUndefined();
  expect(erreurs).toEqual([]);
});
