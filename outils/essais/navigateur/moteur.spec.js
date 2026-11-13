/**
 * Le moteur qui peint le plan, et ce qui en protège le visiteur
 * (`modules/webgl.mjs` `moteurVoulu`, `signaleRate`).
 *
 * Le moteur du plan (`moteur-gl.mjs`) peint par défaut ; deck.gl reste le
 * recours. Un exploitant dont les visiteurs verraient mal le plan doit
 * pouvoir revenir à deck.gl pour tout son salon, depuis ses réglages, sans
 * attendre un déploiement — et ce qui tourne mal dans le moteur doit lui
 * parvenir, au lieu de laisser un plan incomplet que seule la console voit.
 *
 * On éprouve que le réglage publié du salon (`_rendu.moteur`) charge deck.gl
 * et le fait peindre, que l'adresse (`?moteur=`) l'emporte sur lui, et qu'une
 * couche qui ne se prépare pas part au relais des erreurs, une seule fois
 * quoiqu'elle se répète.
 */
const { test, expect } = require("@playwright/test");
const { prepare, attendLaListe, DONNEES } = require("./aide");

/** Les données du salon, son apparence publiée portant ce réglage. */
function avecReglage(reglage) {
  const d = JSON.parse(JSON.stringify(DONNEES));
  d.plans.forEach((p) => { p.apparence = { ...(p.apparence || {}), reglages: { ...((p.apparence || {}).reglages || {}), ...reglage } }; });
  return d;
}

/** Ouvre le plan, ces données servies ; rend les envois au relais des erreurs et ce qui a demandé deck.gl. */
async function ouvre(page, donnees, requete = "") {
  const erreurs = await prepare(page);
  const envois = [], demandes = [];
  page.on("request", (q) => { if (/deck\.gl/.test(q.url())) demandes.push(q.url()); });
  await page.route("**/api/plan*", (r) => {
    const u = new URL(r.request().url());
    if (u.searchParams.get("entete")) return r.fulfill({ json: { v: "essai-moteur" } });
    return r.fulfill({ status: 200, contentType: "application/json", headers: { "X-Version": "essai-moteur" },
      body: JSON.stringify(donnees) });
  });
  await page.route("**/api/erreur", (r) => {
    envois.push(JSON.parse(r.request().postData() || "null"));
    return r.fulfill({ status: 204 });
  });
  await page.goto("/plan?plan=smcl-2026" + requete);
  await attendLaListe(page);
  /* L'absence de carte graphique est la seule raison de passer : elle se
     demande à part. Déduite de « rien n'a peint », elle faisait d'une panne du
     moteur un essai sauté, et une régression passait au vert. */
  const webgl2 = await page.evaluate(() => !!document.createElement("canvas").getContext("webgl2"));
  const peint = await page.waitForFunction(() => window.__essais.GL.pret, null, { timeout: 30_000 })
    .then(() => true, () => false);
  return { erreurs, envois, demandes, peint, webgl2 };
}

test.describe("le moteur qui peint le plan", () => {
  test("un salon réglé sur deck.gl est peint par deck.gl", async ({ page }) => {
    const { erreurs, demandes, peint, webgl2 } = await ouvre(page, avecReglage({ _rendu: { moteur: "deck" } }));
    test.skip(!webgl2, "pas de carte graphique : le plan reste en SVG");
    expect(peint, "le moteur a peint le plan").toBe(true);
    expect(await page.evaluate(() => window.__essais.GL.moteur)).toBe("deck");
    expect(demandes.length, "deck.gl demandé").toBeGreaterThan(0);
    expect(erreurs).toEqual([]);
  });

  test("l'adresse l'emporte sur le réglage du salon, et le défaut ne demande pas deck.gl", async ({ page }) => {
    const { erreurs, demandes, peint, webgl2 } = await ouvre(page, avecReglage({ _rendu: { moteur: "deck" } }), "&moteur=gl2");
    test.skip(!webgl2, "pas de carte graphique : le plan reste en SVG");
    expect(peint, "le moteur a peint le plan").toBe(true);
    expect(await page.evaluate(() => window.__essais.GL.moteur)).toBe("gl2");
    expect(demandes, "deck.gl jamais demandé").toEqual([]);
    expect(erreurs).toEqual([]);
  });

  test("un raté du moteur part au relais des erreurs, une seule fois", async ({ page }) => {
    test.setTimeout(90_000); // l'ouverture et le rapport, peints en logiciel
    const { envois, peint, webgl2 } = await ouvre(page, DONNEES);
    test.skip(!webgl2, "pas de carte graphique : le plan reste en SVG");
    expect(peint, "le moteur a peint le plan").toBe(true);
    expect(await page.evaluate(() => window.__essais.GL.moteur)).toBe("gl2");
    // une couche dont la forme ne se lit pas, remise trois fois
    await page.evaluate(() => {
      const d = window.__essais.GL.deck, L = d.props.layers;
      const Aplat = L.find((c) => c.constructor.layerName === "SolidPolygonLayer").constructor;
      for (let i = 0; i < 3; i++) {
        d.setProps({ layers: [...L, new Aplat({ id: "essai-casse", data: [i],
          getPolygon: () => { throw new Error("forme illisible"); } })] });
        d.redraw("essai");
      }
    });
    /* Le rapport part plusieurs secondes après l'erreur : Chromium sans carte
       graphique peint la page en logiciel, et la première image qui suit la
       couche cassée lui prend jusqu'à 8 s de travail natif — un profil n'y
       trouve presque aucun JavaScript, ni dans le moteur ni dans le relais.
       L'essai dit ce qui part, non en combien de temps. */
    await expect.poll(() => envois.length, { timeout: 25_000 }).toBeGreaterThan(0);
    await page.waitForTimeout(2500);
    const rates = envois.flatMap((e) => e.erreurs).filter((e) => /essai-casse/.test(e.message));
    expect(rates).toHaveLength(1);
    expect(rates[0].message).toMatch(/^Error: Moteur du plan : la couche « essai-casse » n'a pas pu se préparer : forme illisible/);
    expect(rates[0].fichier).toMatch(/\/versions\/plan\.[0-9a-f]{10}\.js$/);
  });
});
