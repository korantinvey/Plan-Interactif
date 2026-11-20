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
  // les marques peintes sur leurs toits
  await page.waitForFunction(() => (window.__essais.GL.deck.props.layers || []).flat(Infinity).filter(Boolean)
    .some((c) => c.props.marques && c.props.data && c.props.data.length > 10), null, { timeout: 30_000 });

  /* Sous la carte graphique logicielle, la première image après un choix
     vient après la fin de la montée : on fait passer un stand marqué pour en
     route, et l'on regarde ce que deviennent les couches des marques. */
  const r = await page.evaluate(() => {
    const id = document.querySelector("#dists [data-sur]").getAttribute("data-sur");
    const sienne = (d) => Boolean(d.sur && d.sur.getAttribute("data-id") === id);
    // trois images de suite : l'animation reprend chaque fois les couches de la précédente
    const { attendue, couches } = window.__essais.marquesEnRoute(id, 3);
    return couches.map(({ avant, apres }) => {
      const poly = "getFillColor" in avant.props && !("getColor" in avant.props);
      const acces = poly ? "getFillColor" : "getColor", geo = poly ? "getPolygon" : "getPath";
      const [tues, copie] = apres;
      const lit = (c, d) => { const f = c.props[acces]; return [...(typeof f === "function" ? f(d) : f)]; };
      const mobile = avant.props.data.find(sienne), autre = avant.props.data.find((d) => !sienne(d));
      const forme = copie && copie.props[geo](copie.props.data[0]);
      const points = poly ? forme.flat() : forme;
      return {
        siennes: avant.props.data.filter(sienne).length,
        couches: apres.length,
        ids: apres.map((c) => c.id),
        source: avant.id,
        memesDonnees: tues.props.data === avant.props.data,
        memeGeometrie: JSON.stringify(tues.props.updateTriggers[geo] ?? null) === JSON.stringify(avant.props.updateTriggers[geo] ?? null),
        tue: mobile ? lit(tues, mobile) : null,
        autreGarde: autre ? JSON.stringify(lit(tues, autre)) === JSON.stringify(lit(avant, autre)) : true,
        enRoute: copie ? { id: copie.id, toutes: copie.props.data.every(sienne), n: copie.props.data.length,
          // à la hauteur du moment, connue ici, et non restées au sol
          enHauteur: attendue > 0 && points.every((p) => p.length === 3 && Math.abs(p[2] - attendue) < 1e-6) } : null,
      };
    }).filter((c) => c.siennes > 0);
  });
  expect(r.length).toBeGreaterThan(0);
  for (const c of r) {
    // deux couches par source, image après image : la paire se refait depuis elle, sans se dédoubler
    expect(c.couches).toBe(2);
    expect(c.ids).toEqual([c.source, c.source + "-en-route"]);
    // la couche des marques garde ses données et sa géométrie : seule la couleur tait les marques en route
    expect(c.memesDonnees).toBe(true);
    expect(c.memeGeometrie).toBe(true);
    expect(c.tue).toEqual([0, 0, 0, 0]);
    expect(c.autreGarde).toBe(true);
    // et une couche à part les porte, elles seules, à la hauteur du moment
    expect(c.enRoute.id).toMatch(/-en-route$/);
    expect(c.enRoute.toutes).toBe(true);
    expect(c.enRoute.n).toBe(c.siennes);
    expect(c.enRoute.enHauteur).toBe(true);
  }
  expect(erreurs).toEqual([]);
});
