/**
 * Les logos sur les stands, vus de près, dans les ambiances à plat.
 *
 * Rien ne sort sur le réseau : les données sont celles de `plans.json`, chaque
 * stand y reçoit une clé de vignette, et le lot de vignettes est une image
 * fabriquée par la page même.
 */
const { test, expect } = require("@playwright/test");
const { prepare, attendLaListe, DONNEES } = require("./aide");

// le service worker relaierait le lot de vignettes hors de l'interception
test.use({ serviceWorkers: "block" });

for (const ambiance of ["classique", "tuiles"]) {
  test("le logo prend la place du nom, en " + ambiance, async ({ page }) => {
    test.setTimeout(90_000);
    const erreurs = await prepare(page);
    await page.goto("/plan-smcl.html");
    // une vignette rouge sur fond blanc, que le détourage laisse rouge
    const webp = await page.evaluate(() => {
      const c = document.createElement("canvas"); c.width = 120; c.height = 40;
      const x = /** @type {CanvasRenderingContext2D} */ (c.getContext("2d"));
      x.fillStyle = "#fff"; x.fillRect(0, 0, 120, 40);
      x.fillStyle = "#c00"; x.fillRect(10, 8, 100, 24);
      return c.toDataURL("image/webp").split(",")[1];
    });
    const donnees = JSON.parse(JSON.stringify(DONNEES));
    donnees.plans[0].stands.forEach((s, i) => { s.vignette = (i % 7).toString(16).padStart(8, "a"); });
    await page.route((u) => u.pathname === "/api/plan", (r) => {
      const u = new URL(r.request().url()), lot = u.searchParams.get("vignettes");
      if (lot) return r.fulfill({ json: Object.fromEntries(lot.split(",").map((k) => [k, webp])) });
      if (u.searchParams.get("entete")) return r.fulfill({ json: { v: "essai-logos" } });
      return r.fulfill({ status: 200, contentType: "application/json",
                         headers: { "X-Version": "essai-logos" }, body: JSON.stringify(donnees) });
    });
    await page.goto("/plan.html?plan=smcl-2026&logos=1&ambiance=" + ambiance);
    await attendLaListe(page);
    const webgl = await page.waitForFunction(() => window.__essais.GL.deck, null, { timeout: 15_000 })
      .then(() => true, () => false);
    test.skip(!webgl, "pas de carte graphique : le plan reste en SVG, et ses noms");
    // ouvrir un stand le cadre de près
    await page.locator("#list .row").first().click();

    // un logo posé, à plat, se laisse viser là où il est peint
    const vise = await page.waitForFunction(() => {
      const d = window.__essais.GL.deck, vp = d.getViewports()[0];
      const c = (d.props.layers || []).flat(Infinity).filter(Boolean).find((l) => l.id === "logos-stands");
      if (!c || !c.props.data.length || !vp) return false;
      const plan = document.getElementById("plan").getBoundingClientRect();
      for (const e of c.props.data) {
        const [x, y] = vp.project([e.x, e.y, e.z]);
        if (x < 40 || y < 40 || x > plan.width - 40 || y > plan.height - 40) continue;
        return { z: e.z, pris: Boolean(d.pickObject({ x, y, radius: 2, layerIds: ["logos-stands"] })) };
      }
      return false;
    }, null, { timeout: 20_000 }).then((h) => h.jsonValue());
    expect(vise).toEqual({ z: 0, pris: true });
    expect(erreurs).toEqual([]);
  });
}
