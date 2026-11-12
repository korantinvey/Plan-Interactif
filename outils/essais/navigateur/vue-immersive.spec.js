/**
 * La vue immersive : le hall vu de biais, et ce qui doit s'y tenir debout.
 *
 * Rien ne sort sur le réseau : les données sont celles de `plans.json`, un
 * calque de dessin ajouté par l'essai, et l'image un pixel embarqué.
 */
const { test, expect } = require("@playwright/test");
const { prepare, attendLaListe, DONNEES } = require("./aide");

// un pixel, assez pour qu'une image se pose et ait des proportions
const PIXEL = "data:image/png;base64," +
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

test.describe("la vue immersive", () => {
  test("une image se dresse face à l'œil", async ({ page }) => {
    test.setTimeout(90_000);
    const erreurs = await prepare(page);
    const donnees = JSON.parse(JSON.stringify(DONNEES));
    donnees.plans[0].dessins = [{ id: "c1", nom: "Logos", visible: true, formes: [
      { id: "f1", t: "image", src: PIXEL, pts: [[-6770, 8800], [-6750, 8820]] }] }];
    await page.route("**/api/plan*", (r) => new URL(r.request().url()).searchParams.get("entete")
      ? r.fulfill({ json: { v: "essai-immersif" } })
      : r.fulfill({ status: 200, contentType: "application/json",
                    headers: { "X-Version": "essai-immersif" }, body: JSON.stringify(donnees) }));
    const CAP = 35;
    await page.goto("/plan.html?plan=smcl-2026&ambiance=immersif&cap=" + CAP);
    await attendLaListe(page);
    const camera = await page.waitForFunction(() => window.__essais.GL.camera, null, { timeout: 15_000 })
      .then(() => true, () => false);
    test.skip(!camera, "pas de carte graphique : le plan reste à plat");

    // l'image n'entre dans le dessin qu'une fois chargée, qui le fait repeindre
    const coins = await page.waitForFunction(() => {
      const couches = (window.__essais.GL.deck.props.layers || []).flat(Infinity).filter(Boolean);
      const c = couches.find(l => /-image-/.test(l.id));
      return c && c.props.bounds;
    }, null, { timeout: 15_000 }).then(h => h.jsonValue());

    /* Couchée, l'image n'a que quatre nombres pour bornes. Debout, quatre
       coins : le bas au sol, le haut au-dessus, et chaque bord vertical
       droit à l'écran — même abscisse en bas et en haut, quel que soit le
       cap. */
    expect(coins).toHaveLength(4);
    const [bg, hg, hd, bd] = coins;
    expect(bg[2]).toBeCloseTo(0, 5);
    expect(bd[2]).toBeCloseTo(0, 5);
    expect(hg[2]).toBeGreaterThan(10);
    expect(hd[2]).toBeCloseTo(hg[2], 5);
    const cap = CAP * Math.PI / 180;
    const u = (p) => p[0] * Math.cos(cap) - p[1] * Math.sin(cap);
    expect(u(hg) - u(bg)).toBeCloseTo(0, 5);
    expect(u(hd) - u(bd)).toBeCloseTo(0, 5);
    // et sa largeur, celle qu'elle avait au sol
    expect(u(bd) - u(bg)).toBeCloseTo(20, 3);
    expect(erreurs).toEqual([]);
  });
  /* Une zone meublée n'est qu'un tapis sous son mobilier : son nom se pose
     sur ce sol, au milieu de la zone. Posé à la hauteur d'une zone en bloc, il
     remontait à l'écran vers le fond du hall, hors de la zone de près. */
  test("le nom d'une zone meublée tombe au milieu de son sol", async ({ page }) => {
    test.setTimeout(90_000);
    const erreurs = await prepare(page);
    const donnees = JSON.parse(JSON.stringify(DONNEES));
    for (const z of donnees.plans[0].zones) z.type = "restauration";
    await page.route("**/api/plan*", (r) => new URL(r.request().url()).searchParams.get("entete")
      ? r.fulfill({ json: { v: "essai-meuble" } })
      : r.fulfill({ status: 200, contentType: "application/json",
                    headers: { "X-Version": "essai-meuble" }, body: JSON.stringify(donnees) }));
    await page.goto("/plan.html?plan=smcl-2026&ambiance=immersif");
    await attendLaListe(page);
    const camera = await page.waitForFunction(() => window.__essais.GL.camera, null, { timeout: 15_000 })
      .then(() => true, () => false);
    test.skip(!camera, "pas de carte graphique : le plan reste à plat");

    // l'écart, à l'écran, entre le nom posé et le milieu de la zone au sol
    const ecarts = await page.waitForFunction(() => {
      const GL = window.__essais.GL, vp = GL.deck.getViewports()[0];
      const l = [];
      for (const c of (GL.deck.props.layers || []).flat(Infinity).filter(Boolean)){
        if (!/^libelles-/.test(c.id)) continue;
        for (const d of c.props.data || []){
          if (!(d.cls || "").startsWith("zn")) continue;
          const a = vp.project(c.props.getPosition(d)), b = vp.project([d.position[0], d.position[1], 0]);
          l.push(Math.hypot(a[0] - b[0], a[1] - b[1]));
        }
      }
      return l.length && l;
    }, null, { timeout: 15_000 }).then(h => h.jsonValue());
    for (const e of ecarts) expect(e).toBeLessThan(1.5);
    expect(erreurs).toEqual([]);
  });
});
