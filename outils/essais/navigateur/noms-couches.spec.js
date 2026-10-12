/**
 * Les noms couchés dans les stands étroits — une case de l'onglet « Admin ».
 *
 * Éteinte par défaut, elle fait écrire à la verticale le nom d'un stand bien
 * plus haut que large quand il y gagne en taille (`nom-emplacement.mjs`
 * `nomCouche`). On l'éprouve en SVG, où chaque libellé couché est un groupe
 * tourné qu'on peut compter ; le rendu WebGL suit la même décision.
 *
 * La session de l'exploitant et la base sont simulées : rien ne sort.
 */
const { test, expect } = require("@playwright/test");
const { prepare, attendLaListe } = require("./aide");

const BASE = "https://base.essai";
/* L'onglet « Admin » n'est offert qu'au profil administrateur, que la page ne
   demande qu'avec l'identifiant du compte : le jeton simulé doit en porter un. */
const JETON = "e30." + Buffer.from(JSON.stringify({ sub: "u1", exp: 4102444800 })).toString("base64url") + ".sig";
const couches = (page) => page.locator('#labels g[transform^="rotate"]');

/** Rapproche la vue : de loin, les noms des stands étroits ne s'écrivent pas. */
async function rapproche(page) {
  const b = await page.locator("#stage").boundingBox();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  for (let i = 0; i < 6; i++) await page.mouse.wheel(0, -400);
  // les libellés se réécrivent à l'arrêt du geste
  await page.waitForTimeout(600);
}

test.describe("les noms couchés dans les stands étroits", () => {
  test("éteints par défaut, puis allumés depuis l'onglet Admin", async ({ page }) => {
    const erreurs = await prepare(page);
    await page.addInitScript(([base, jeton]) => {
      localStorage.setItem("console-config", JSON.stringify({ url: base, anonKey: "anon" }));
      localStorage.setItem("console-session", JSON.stringify({ access_token: jeton }));
    }, [BASE, JETON]);
    await page.route(BASE + "/**", (r) => {
      const req = r.request();
      const url = new URL(req.url());
      if (url.pathname === "/auth/v1/user") return r.fulfill({ json: { id: "u1" } });
      if (url.pathname === "/rest/v1/profil") return r.fulfill({ json: [{ role: "admin" }] });
      if (url.pathname === "/rest/v1/evenement") return r.fulfill({ json: [{ id: "e1" }] });
      if (req.method() !== "GET") return r.fulfill({ status: 204, body: "" });
      return r.fulfill({ json: [] });
    });
    await page.goto("/plan-admin.html?plan=smcl-2026&rendu=svg");
    await attendLaListe(page);
    await rapproche(page);
    // rien de couché tant que la case n'est pas cochée : le salon garde son plan
    await expect(couches(page)).toHaveCount(0);

    await page.locator("#btnReglages").click();
    await page.locator(".ongReg button", { hasText: "Admin" }).click();
    const caseNoms = page.locator(".voletReg:not([hidden]) label",
      { hasText: "Écrire à la verticale le nom des stands étroits" }).locator("input");
    await expect(caseNoms).not.toBeChecked();
    await caseNoms.check();

    // le réglage se range comme les autres, et le plan se réécrit aussitôt
    const range = await page.evaluate(() => Object.keys(localStorage)
      .filter(k => k.startsWith("plan-conf:"))
      .map(k => JSON.parse(localStorage.getItem(k))._nomsPivotes));
    expect(range).toContainEqual({ visible: true });
    await expect.poll(() => couches(page).count()).toBeGreaterThan(0);

    await caseNoms.uncheck();
    await expect(couches(page)).toHaveCount(0);
    expect(erreurs).toEqual([]);
  });
});
