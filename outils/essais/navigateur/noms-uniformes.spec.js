/**
 * Les noms des stands harmonisés — une case de l'onglet « Admin ».
 *
 * Éteinte par défaut, elle ramène les noms du pavillon à trois tailles, les
 * plus grands plafonnés (`nom-emplacement.mjs` `posePaliers`). On l'éprouve
 * en SVG, où chaque nom porte sa taille dans son attribut ; le rendu WebGL lit
 * la même.
 *
 * La session de l'exploitant et la base sont simulées : rien ne sort.
 */
const { test, expect } = require("@playwright/test");
const { prepare, attendLaListe } = require("./aide");

const BASE = "https://base.essai";
/* L'onglet « Admin » n'est offert qu'au profil administrateur, que la page ne
   demande qu'avec l'identifiant du compte : le jeton simulé doit en porter un. */
const JETON = "e30." + Buffer.from(JSON.stringify({ sub: "u1", exp: 4102444800 })).toString("base64url") + ".sig";
/* Les tailles des noms écrits. Le nom choisi, ou réglé à la main, suit ses
   propres règles : on ne compte que les autres. */
const tailles = (page) => page.evaluate(() => [...document.querySelectorAll("#labels .lbl:not(.pick) text.nm:not(.sel)")]
  .map(t => Number(t.getAttribute("font-size"))));
const distinctes = (t) => new Set(t).size;
/* La part des noms écrits à l'une des trois tailles les plus fréquentes : les
   autres sont ceux qui n'atteignent pas le plus petit palier. */
const auxPaliers = (t) => {
  const n = new Map();
  for (const f of t) n.set(f, (n.get(f) || 0) + 1);
  return [...n.values()].sort((a, b) => b - a).slice(0, 3).reduce((a, b) => a + b, 0) / (t.length || 1);
};

/** Rapproche la vue : de loin, les noms ne s'écrivent pas. */
async function rapproche(page) {
  const b = await page.locator("#stage").boundingBox();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  for (let i = 0; i < 6; i++) await page.mouse.wheel(0, -400);
  // les libellés se réécrivent à l'arrêt du geste
  await page.waitForTimeout(600);
}

test.describe("les noms des stands harmonisés", () => {
  test("éteinte par défaut, puis allumée depuis l'onglet Admin", async ({ page }) => {
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
    // chaque nom à la taille que sa place lui donne, tant que la case n'est pas cochée
    const avant = await tailles(page);
    expect(distinctes(avant)).toBeGreaterThan(3);

    await page.locator("#btnReglages").click();
    await page.locator(".ongReg button", { hasText: "Admin" }).click();
    const caseNoms = page.locator(".voletReg:not([hidden]) label",
      { hasText: "Harmoniser la taille des noms des stands" }).locator("input");
    await expect(caseNoms).not.toBeChecked();
    await caseNoms.check();

    // le réglage se range comme les autres, et le plan se réécrit aussitôt
    const range = await page.evaluate(() => Object.keys(localStorage)
      .filter(k => k.startsWith("plan-conf:"))
      .map(k => JSON.parse(localStorage.getItem(k))._nomsUniformes));
    expect(range).toContainEqual({ visible: true });
    /* Presque tous les noms à l'un des trois paliers, et aucun plus grand
       qu'avant : les grands se plafonnent, rien ne grossit. */
    await expect.poll(async () => auxPaliers(await tailles(page))).toBeGreaterThanOrEqual(.8);
    const apres = await tailles(page);
    expect(apres.length).toBeGreaterThan(0);
    expect(Math.max(...apres)).toBeLessThan(Math.max(...avant));

    await caseNoms.uncheck();
    await expect.poll(async () => distinctes(await tailles(page))).toBeGreaterThan(3);
    expect(erreurs).toEqual([]);
  });
});
