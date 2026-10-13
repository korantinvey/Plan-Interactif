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

/** Le plan public, logos demandés, de près sur le premier stand de la liste.
 *  Rend les erreurs relevées, ou rien sans carte graphique. Sans `grandes`,
 *  l'API n'a de grande pour aucun logo — un salon que la synchronisation n'a
 *  pas refait — et le toit pose la petite, que la page détoure. */
async function deP(page, ambiance, grandes = false) {
  const erreurs = await prepare(page);
  await page.goto("/plan-smcl.html");
  // des vignettes rouges sur fond blanc, que le détourage laisse rouges, de
  // largeurs différentes : sept logos qui ne se confondent pas sur la planche
  const webps = await page.evaluate(() => Array.from({ length: 7 }, (_, k) => {
    const c = document.createElement("canvas"); c.width = 60 + 20 * k; c.height = 40;
    const x = /** @type {CanvasRenderingContext2D} */ (c.getContext("2d"));
    x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, 40);
    x.fillStyle = "#c00"; x.fillRect(10, 8, c.width - 20, 24);
    return c.toDataURL("image/webp").split(",")[1];
  }));
  // la grande telle que la synchronisation la fait : déjà sans fond
  const grande = Buffer.from(await page.evaluate(() => {
    const c = document.createElement("canvas"); c.width = 200; c.height = 60;
    const x = /** @type {CanvasRenderingContext2D} */ (c.getContext("2d"));
    x.fillStyle = "#c00"; x.fillRect(16, 12, 168, 36);
    return c.toDataURL("image/png").split(",")[1];
  }), "base64");
  const donnees = JSON.parse(JSON.stringify(DONNEES));
  donnees.plans[0].stands.forEach((s, i) => { s.vignette = (i % 7).toString(16).padStart(8, "a"); });
  await page.route((u) => u.pathname === "/api/plan", (r) => {
    const u = new URL(r.request().url()), lot = u.searchParams.get("vignettes");
    if (lot) return r.fulfill({ json: Object.fromEntries(lot.split(",").map((k) => [k, webps[parseInt(k, 16) % 7]])) });
    if (u.searchParams.get("grande")) {
      return grandes ? r.fulfill({ contentType: "image/png", body: grande })
        : r.fulfill({ status: 404, body: "Pas de grande vignette." });
    }
    if (u.searchParams.get("entete")) return r.fulfill({ json: { v: "essai-logos" } });
    return r.fulfill({ status: 200, contentType: "application/json",
                       headers: { "X-Version": "essai-logos" }, body: JSON.stringify(donnees) });
  });
  await page.goto("/plan.html?plan=smcl-2026&logos=1&ambiance=" + ambiance);
  await attendLaListe(page);
  const webgl = await page.waitForFunction(() => window.__essais.GL.deck, null, { timeout: 15_000 })
    .then(() => true, () => false);
  if (!webgl) return null;
  // ouvrir un stand le cadre de près ; un cran de plus passe le seuil des logos
  await page.locator("#list .row").first().click();
  await page.waitForTimeout(1500);
  await page.evaluate(() => document.getElementById("zIn").click());
  return erreurs;
}

/** La couche des logos, une fois posée : chaque logo, et la case qu'il lit. */
const logosPoses = (page) => page.waitForFunction(() => {
  const d = window.__essais.GL.deck;
  const c = (d.props.layers || []).flat(Infinity).filter(Boolean).find((l) => l.id === "logos-stands");
  if (!c || !c.props.data.length) return false;
  return c.props.data.map((e) => ({ z: e.z, cle: e.t.dataset.cle, cas: c.props.getCaseLogo(e) }));
}, null, { timeout: 20_000 }).then((h) => h.jsonValue());

for (const ambiance of ["classique", "tuiles"]) {
  test("le logo prend la place du nom, en " + ambiance, async ({ page }) => {
    test.setTimeout(90_000);
    const erreurs = await deP(page, ambiance);
    test.skip(!erreurs, "pas de carte graphique : le plan reste en SVG, et ses noms");

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

/* Reculé sous le seuil, plus aucun logo n'est posé et leurs toiles sont
   oubliées ; revenu au même endroit, elles se refont sous les mêmes clés. La
   planche gardée d'avant rangeait ses cases par toile : les neuves n'y
   trouvaient plus la leur, et chaque stand peignait la planche entière — tous
   les logos des environs, en réduction, sur chacun. */
test("revenu de loin, chaque logo lit sa case et non la planche entière", async ({ page }) => {
  test.setTimeout(180_000);
  const erreurs = await deP(page, "classique");
  test.skip(!erreurs, "pas de carte graphique");
  const avant = await logosPoses(page);
  expect(new Set(avant.map((l) => l.cle)).size).toBeGreaterThan(1);

  const zoom = () => page.evaluate(() => window.__essais.GL.deck.props.viewState.zoom);
  const z0 = await zoom();
  const cran = async (id) => { await page.evaluate((b) => document.getElementById(b).click(), id); await page.waitForTimeout(700); };
  for (let i = 0; i < 3; i++) await cran("zOut");
  await page.waitForFunction(() => {
    const d = window.__essais.GL.deck;
    return !(d.props.layers || []).flat(Infinity).filter(Boolean).some((l) => l.id === "logos-stands");
  }, null, { timeout: 20_000 });
  for (let i = 0; i < 3; i++) await cran("zIn");
  await page.waitForFunction((z) => Math.abs(window.__essais.GL.deck.props.viewState.zoom - z) < .05, z0, { timeout: 20_000 })
    .catch(async () => { throw new Error("zoom " + await zoom() + " au lieu de " + z0); });
  await page.waitForTimeout(1000);

  const apres = await logosPoses(page);
  for (const l of apres) expect(l.cas, l.cle).not.toEqual([0, 0, 1, 1]);
  expect(erreurs).toEqual([]);
});

/* La grande arrive détourée de la synchronisation : le toit la pose telle
   quelle, sans repasser par le détourage de la page — qui, deux logos à la
   fois, faisait paraître un à un la centaine de stands d'un écran de
   bureau. */
test("la grande arrivée sans fond se pose telle quelle", async ({ page }) => {
  test.setTimeout(90_000);
  const erreurs = await deP(page, "classique", true);
  test.skip(!erreurs, "pas de carte graphique");
  const poses = await logosPoses(page);
  for (const l of poses) expect(l.cle, "la grande, et non la petite").toContain("+g@");
  expect(erreurs).toEqual([]);
});
