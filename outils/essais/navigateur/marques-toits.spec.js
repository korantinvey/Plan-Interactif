/**
 * En vue immersive, les marques d'un stand qui monte le suivent seules
 * (`modules/webgl.mjs` `marquesSurLesToits`).
 *
 * Le temps qu'un stand choisi monte, chaque image reposait toutes les marques
 * des distinctions à la hauteur du moment : leur couche changeait de
 * déclencheur à chaque image, et le moteur refaisait la géométrie de toutes les
 * marques du salon pour celles d'un seul stand (banc de FUNEXPO, 20 novembre
 * 2026). La couche garde désormais sa géométrie et tait par la couleur les
 * marques en route ; une petite couche à part les porte à la hauteur du moment,
 * et disparaît à l'arrivée.
 */
const { test, expect } = require("@playwright/test");
const { prepare, attendLaListe, DONNEES } = require("./aide.js");

/** SMCL 2026, un stand sur trois nouveau venu, marqué d'une corne sur le plan. */
function avecDistinctions() {
  const d = JSON.parse(JSON.stringify(DONNEES));
  d.fiche = { ...(d.fiche || {}), stand: { ...((d.fiche || {}).stand || {}), nouveau: true } };
  d.plans.forEach((p) => {
    p.stands.forEach((s, i) => { if (i % 3 === 0) s.neuf = true; });
    p.apparence = { ...(p.apparence || {}), reglages: { ...((p.apparence || {}).reglages || {}), _neuf: { plan: "corne" } } };
  });
  return d;
}

test("en immersif, seules les marques du stand qui monte se reposent à chaque image", async ({ page }) => {
  test.setTimeout(120_000);
  const erreurs = await prepare(page);
  const corps = JSON.stringify(avecDistinctions());
  await page.route("**/api/plan*", (r) => new URL(r.request().url()).searchParams.get("entete")
    ? r.fulfill({ json: { v: "essai-marques" } })
    : r.fulfill({ status: 200, contentType: "application/json", headers: { "X-Version": "essai-marques" }, body: corps }));
  await page.goto("/plan?plan=smcl-2026&ambiance=immersif");
  await attendLaListe(page);
  const webgl = await page.waitForFunction(() => window.__essais.GL.actif && window.__essais.GL.camera, null, { timeout: 30_000 })
    .then(() => true, () => false);
  test.skip(!webgl, "pas de carte graphique : pas de vue immersive");
  await expect.poll(() => page.evaluate(() => document.querySelectorAll("#dists [data-sur]").length)).toBeGreaterThan(10);
  await page.waitForTimeout(1500);

  // un stand marqué, choisi par la liste : il monte
  const lignes = page.locator("#list .row");
  let id = null;
  for (let i = 0; i < 12 && !id; i++) {
    await lignes.nth(i).click();
    id = await page.evaluate(() => {
      const g = document.querySelector("#stands > g.sel");
      return g && document.querySelector('#dists [data-sur="' + CSS.escape(g.dataset.id) + '"]') ? g.dataset.id : null;
    });
  }
  expect(id).not.toBeNull();
  await page.evaluate((id) => { window.__choisi = id; window.__donnees = null; }, id);

  // pendant la montée : ses marques ont leur couche, les autres gardent la leur, données comprises
  const pendant = await page.waitForFunction(() => {
    // les couches des marques, telles que le moteur les reçoit à cette image
    const l = (window.__essais.GL.deck.props.layers || []).flat(Infinity).filter(Boolean);
    const m = { toutes: l.filter((c) => /^#dists-/.test(c.id) && !/-en-route$/.test(c.id)),
      enRoute: l.filter((c) => /-en-route$/.test(c.id)) };
    if (!m.enRoute.length) return false;
    const toutes = m.toutes.find((c) => c.props.data.some((d) => d.sur && d.sur.dataset.id === window.__choisi));
    if (!toutes) return false;
    const mobile = toutes.props.data.find((d) => d.sur && d.sur.dataset.id === window.__choisi);
    const acces = toutes.props.getColor !== undefined && toutes.constructor.name !== "SolidPolygonLayer" ? "getColor" : "getFillColor";
    const f = toutes.props[acces];
    if (!window.__donnees) { window.__donnees = toutes.props.data; return false; }
    return {
      memesDonnees: window.__donnees === toutes.props.data,
      tue: typeof f === "function" ? [...f(mobile)] : null,
      enRoute: m.enRoute.map((c) => c.props.data.every((d) => d.sur && d.sur.dataset.id === window.__choisi)),
    };
  }, null, { timeout: 10_000, polling: "raf" })
    .then((h) => h.jsonValue(), async (e) => {
      throw new Error("aucune couche des marques en route pendant la montée : " + e.message);
    });
  expect(pendant.memesDonnees).toBe(true);
  expect(pendant.tue).toEqual([0, 0, 0, 0]);
  expect(pendant.enRoute.length).toBeGreaterThan(0);
  expect(pendant.enRoute.every(Boolean)).toBe(true);

  // arrivé : plus de couche à part, et ses marques de nouveau peintes dans la leur
  await page.waitForFunction(() => !(window.__essais.GL.deck.props.layers || []).flat(Infinity).filter(Boolean)
    .some((c) => /-en-route$/.test(c.id)), null, { timeout: 10_000 });
  expect(erreurs).toEqual([]);
});
