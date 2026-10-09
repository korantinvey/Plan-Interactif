/**
 * Le fond de carte sous le pavillon, en administration : poser, retirer.
 *
 * Rien ne sort sur le réseau. La session de l'exploitant et la base sont
 * simulées, les tuiles d'images rendues par un pixel.
 */
const { test, expect } = require("@playwright/test");
const { prepare, attendLaListe, DONNEES } = require("./aide");

const BASE = "https://base.essai";
// un pixel transparent : une tuile qui arrive, sans rien demander à personne
const PIXEL = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64");

/**
 * Le plan d'administration ouvert sur un premier pavillon calé sur le fond
 * `fond`, une session admise et une base qui accepte tout.
 *
 * Rend les erreurs relevées et les écritures faites en base.
 */
async function ouvreCale(page, fond) {
  const erreurs = await prepare(page);
  const ecritures = [];
  await page.addInitScript((base) => {
    localStorage.setItem("console-config", JSON.stringify({ url: base, anonKey: "anon" }));
    localStorage.setItem("console-session", JSON.stringify({ access_token: "a.b.c" }));
  }, BASE);

  /* Le pavillon regardé porte un calage : celui que la base servirait après
     un « Enregistrer pour tous ». Les autres restent sans carte. */
  const donnees = JSON.parse(JSON.stringify(DONNEES));
  donnees.plans[0].calage = { lon: 2.287851, lat: 48.830212, x: 0, y: 0, angle: 0, fond: fond };
  await page.route("**/api/plan*", (r) => {
    const url = new URL(r.request().url());
    if (url.searchParams.get("entete")) return r.fulfill({ json: { v: "essai-carte" } });
    if (url.searchParams.get("fond")) return r.fulfill({ json: { calques: [] } });
    return r.fulfill({ status: 200, contentType: "application/json",
                       headers: { "X-Version": "essai-carte" }, body: JSON.stringify(donnees) });
  });

  await page.route(BASE + "/**", (r) => {
    const req = r.request();
    const url = new URL(req.url());
    if (url.pathname === "/auth/v1/user") return r.fulfill({ json: { id: "u1" } });
    if (url.pathname === "/rest/v1/profil") return r.fulfill({ json: [{ role: "admin" }] });
    if (url.pathname === "/rest/v1/evenement") return r.fulfill({ json: [{ id: "e1" }] });
    if (req.method() !== "GET") {
      ecritures.push({ methode: req.method(), chemin: url.pathname + url.search,
                       corps: req.postData() });
      return r.fulfill({ status: 204, body: "" });
    }
    if (url.pathname === "/rest/v1/plan" && /id_klipso/.test(url.search)) {
      return r.fulfill({ json: donnees.plans.map((p, i) => ({ id: "b" + i, id_klipso: p.id })) });
    }
    return r.fulfill({ json: [] });
  });
  await page.route("https://tile.openstreetmap.org/**",
    (r) => r.fulfill({ status: 200, contentType: "image/png", body: PIXEL }));

  await page.goto("/plan-admin.html?plan=smcl-2026");
  await attendLaListe(page);
  return { erreurs, ecritures };
}

/** La fenêtre des réglages, ouverte sur l'onglet « Environs ». */
async function ouvreEnvirons(page) {
  await page.locator("#btnReglages").click();
  await page.locator(".ongReg button", { hasText: "Environs" }).click();
}

test.describe("le fond de carte", () => {
  test("« Retirer la carte » retire aussi les tuiles", async ({ page }) => {
    const { erreurs, ecritures } = await ouvreCale(page, "osm");
    const tuiles = page.locator("#fondCarte image");
    await expect(tuiles.first()).toBeAttached();
    expect(await page.locator("#fondCarte").getAttribute("transform")).toBeTruthy();

    await ouvreEnvirons(page);
    await page.locator(".voletReg:not([hidden]) button", { hasText: "Retirer la carte" }).click();
    await expect(page.locator(".voletReg:not([hidden]) .envEtat")).toHaveText("La carte est retirée.");

    expect(ecritures).toEqual([
      { methode: "PATCH", chemin: "/rest/v1/plan?id=eq.b0", corps: JSON.stringify({ calage: null }) },
    ]);
    // le trou s'en allait déjà ; les tuiles et leur matrice restaient
    await expect(page.locator("#trouDuFond")).toHaveAttribute("d", "");
    await expect(tuiles).toHaveCount(0);
    expect(await page.locator("#fondCarte").getAttribute("transform")).toBeNull();
    await expect(page.locator("#creditCarte")).toBeHidden();
    expect(erreurs).toEqual([]);
  });
});
