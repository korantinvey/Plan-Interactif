/**
 * Les erreurs de la page, signalées (`modules/erreurs.mjs`).
 *
 * On ne fait pas planter le plan pour l'éprouver : on lui fait entendre
 * l'erreur que le navigateur lui annoncerait, par le même événement, avec le
 * fichier qu'il nommerait. Ce qu'on vérifie est ce qui part — le message et
 * l'endroit, rien du visiteur — et ce qui ne part pas : l'erreur d'un autre
 * script, celle d'un visiteur qui a refusé la mesure.
 */
const { test, expect } = require("@playwright/test");
const { prepare, attendLaListe } = require("./aide.js");

const PLAN = "/plan?plan=smcl-2026&rendu=svg";

/** Les envois vers `/api/erreur`, relevés sans rien laisser partir. */
async function releve(page) {
  const envois = [];
  await page.route("**/api/erreur", (r) => {
    envois.push(JSON.parse(r.request().postData() || "null"));
    return r.fulfill({ status: 204 });
  });
  return envois;
}

/** L'erreur qu'annoncerait le navigateur, levée dans le fichier qu'on nomme. */
const annonce = (page, fichier) => page.evaluate((f) => {
  const src = f || /** @type {HTMLScriptElement} */ (document.querySelector("script[data-modules]")).src;
  dispatchEvent(new ErrorEvent("error", {
    message: "TypeError: essai", filename: src, lineno: 1, colno: 42, error: new TypeError("essai"),
  }));
}, fichier);

test.describe("les erreurs de la page", () => {
  test("une erreur du plan part, sans rien du visiteur", async ({ page }) => {
    await prepare(page);
    const envois = await releve(page);
    await page.goto(PLAN);
    await attendLaListe(page);
    await annonce(page);
    await annonce(page);   // la même, une seconde fois : elle ne repart pas
    await expect.poll(() => envois.length, { timeout: 10_000 }).toBe(1);
    const e = envois[0];
    expect(e.slug).toBe("smcl-2026");
    expect(e.page).toBe("plan");
    expect(e.erreurs).toHaveLength(1);
    expect(e.erreurs[0]).toMatchObject({ message: "TypeError: essai", ligne: 1, colonne: 42 });
    expect(e.erreurs[0].fichier).toMatch(/\/versions\/plan\.[0-9a-f]{10}\.js$/);
    // le message et l'endroit, et rien d'autre
    expect(Object.keys(e).sort()).toEqual(["erreurs", "page", "slug"]);
    expect(Object.keys(e.erreurs[0]).sort()).toEqual(["colonne", "fichier", "ligne", "message"]);
  });

  test("l'erreur d'un autre script ne part pas", async ({ page }) => {
    await prepare(page);
    const envois = await releve(page);
    await page.goto(PLAN);
    await attendLaListe(page);
    await annonce(page, "chrome-extension://abcdef/contenu.js");
    await annonce(page, "https://ailleurs.exemple/versions/plan.0123456789.js");
    await page.waitForTimeout(3000);
    expect(envois).toEqual([]);
  });

  test("rien ne part chez qui a refusé la mesure", async ({ page }) => {
    await prepare(page);
    await page.addInitScript(() => localStorage.setItem("plan-mesure-refusee", "1"));
    const envois = await releve(page);
    await page.goto(PLAN);
    await attendLaListe(page);
    await annonce(page);
    await page.waitForTimeout(3000);
    expect(envois).toEqual([]);
  });
});
