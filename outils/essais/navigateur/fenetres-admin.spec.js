/**
 * Les fenêtres de l'administration qui en remplacent une autre, puis y
 * ramènent.
 *
 * La fenêtre commune est une seule : celle qui s'ouvre prend la place de la
 * précédente. Un bouton qui rouvre la fenêtre d'où l'on venait doit donc dire
 * qu'il ne ferme pas (`ferme: false`), ou fermer avant de rouvrir — sans quoi
 * la fermeture qui suit son action emporte ce qu'il vient d'ouvrir, et il ne
 * reste que le plan.
 *
 * La session de l'exploitant et la base sont simulées : rien ne sort.
 */
const { test, expect } = require("@playwright/test");
const { prepare, attendLaListe } = require("./aide");

const BASE = "https://base.essai";

/** Le plan d'administration, une session admise et une base qui acquitte. */
async function ouvreAdmin(page) {
  const erreurs = await prepare(page);
  await page.addInitScript((base) => {
    localStorage.setItem("console-config", JSON.stringify({ url: base, anonKey: "anon" }));
    localStorage.setItem("console-session", JSON.stringify({ access_token: "a.b.c" }));
  }, BASE);
  await page.route(BASE + "/**", (r) => {
    const req = r.request();
    const url = new URL(req.url());
    if (url.pathname === "/auth/v1/user") return r.fulfill({ json: { id: "u1" } });
    if (url.pathname === "/rest/v1/evenement") return r.fulfill({ json: [{ id: "e1" }] });
    // les compteurs à effacer : sans eux, la remise à zéro se dit illisible
    if (url.pathname === "/rest/v1/rpc/rapport_utilisation") {
      return r.fulfill({ json: { depuis: "2026-01-01", visites: 3, visiteurs: 2,
                                 recherches: 1, stands: { total: 4 } } });
    }
    if (req.method() !== "GET") return r.fulfill({ status: 204, body: "" });
    return r.fulfill({ json: [] });
  });
  await page.goto("/plan-admin.html?plan=smcl-2026");
  await attendLaListe(page);
  return erreurs;
}

const fenetre = (page) => page.locator("#modale");

test.describe("les fenêtres qui ramènent d'où l'on vient", () => {
  test("« Annuler » la remise à zéro ramène sur l'onglet Statistiques", async ({ page }) => {
    const erreurs = await ouvreAdmin(page);
    await page.locator("#btnReglages").click();
    await page.locator(".ongReg button", { hasText: "Statistiques" }).click();
    await page.locator(".voletReg:not([hidden]) button", { hasText: "Réinitialiser les compteurs" }).click();
    await expect(page.locator("#mTitre")).toHaveText("Réinitialiser les compteurs");

    await page.locator("#mPied button", { hasText: "Annuler" }).click();
    // la fenêtre des réglages rouverte restait fermée : l'action rouvrait, le pied refermait
    await expect(fenetre(page)).toHaveClass(/\bopen\b/);
    await expect(page.locator("#mTitre")).toHaveText("Réglages du plan");
    await expect(page.locator(".ongReg button[aria-pressed=true]")).toHaveText("Statistiques");
    expect(erreurs).toEqual([]);
  });
});
