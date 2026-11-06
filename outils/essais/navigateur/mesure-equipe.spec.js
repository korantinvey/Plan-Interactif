/**
 * Le poste de l'équipe ne compte pas dans l'audience.
 *
 * Le jour de l'ouverture de FUNEXPO 2026, les testeurs pesaient dans les
 * visiteurs du rapport sans qu'on puisse les en retirer. Un poste qui a ouvert
 * l'administration ou la console porte désormais une marque
 * (`modules/appareil-equipe.mjs`), et la mesure du plan public s'y tait — mais
 * la sonde de performance, elle, continue de partir : elle sert aux essais.
 */
const { test, expect } = require("@playwright/test");
const { prepare, attendLaListe } = require("./aide.js");

const PLAN = "/plan?plan=smcl-2026&rendu=svg";

/** Ce qui part vers la mesure et vers la sonde, relevé sans rien laisser
 *  partir. `sendBeacon` échappe à la route de Chromium : il est relayé vers
 *  l'essai, avec la même adresse et le même corps (comme `sonde.spec.js`). */
async function releve(page) {
  const envois = { mesure: [], sonde: [] };
  const range = (u, corps) => {
    const quoi = /\/api\/(mesure|sonde)$/.exec(u);
    if (quoi) envois[quoi[1]].push(JSON.parse(corps || "null"));
  };
  await page.exposeBinding("__balise", (_source, u, d) => range(u, d));
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "sendBeacon", { configurable: true, value: (u, d) => {
      window.__balise(String(u), String(d));
      return true;
    } });
  });
  for (const chemin of ["**/api/mesure", "**/api/sonde"]) {
    await page.route(chemin, (r) => {
      range(r.request().url(), r.request().postData());
      return r.fulfill({ status: 204, body: "" });
    });
  }
  return envois;
}

/** La page passe en arrière-plan : la mesure vide son paquet. */
const cache = (page) => page.evaluate(() => {
  Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
  Object.defineProperty(document, "hidden", { value: true, configurable: true });
  document.dispatchEvent(new Event("visibilitychange", { bubbles: true }));
});

const visites = (envois) => envois.mesure.flatMap((p) => p.gestes || []).filter((g) => g.genre === "visite");

test.describe("le poste de l'équipe", () => {
  test("un visiteur ordinaire compte sa visite", async ({ page }) => {
    await prepare(page);
    const envois = await releve(page);
    await page.goto(PLAN);
    await attendLaListe(page);
    await cache(page);
    await expect.poll(() => visites(envois).length).toBe(1);
  });

  for (const [cas, cle, valeur] of [
    ["marqué par l'administration", "plan-appareil-equipe", "1"],
    ["qui garde une session de la console", "console-session", JSON.stringify({ access_token: "x" })],
  ]) {
    test("un poste " + cas + " ne compte pas, et la sonde part toujours", async ({ page }) => {
      await prepare(page);
      await page.addInitScript(([c, v]) => localStorage.setItem(c, v), [cle, valeur]);
      const envois = await releve(page);
      await page.goto(PLAN);
      await attendLaListe(page);
      await cache(page);
      await expect.poll(() => envois.sonde.length).toBeGreaterThan(0);
      expect(envois.mesure).toEqual([]);
      expect(await page.evaluate(() =>
        Object.keys(localStorage).filter((k) => k.startsWith("plan-visiteur:")))).toEqual([]);
    });
  }

  test("la notice le dit au testeur", async ({ page }) => {
    await prepare(page);
    await page.addInitScript(() => localStorage.setItem("plan-appareil-equipe", "1"));
    await releve(page);
    await page.goto(PLAN);
    await attendLaListe(page);
    await page.evaluate(() => document.getElementById("btnConfidentialite").click());
    await expect(page.getByText("ses visites ne sont pas comptées")).toBeVisible();
  });
});
