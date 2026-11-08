/**
 * Le plan sur un poste sans carte graphique.
 *
 * Le navigateur y imite le WebGL au processeur : le dessin tenait une image
 * par seconde et le plan mettait seize secondes à paraître, là où le SVG en
 * tient près de soixante. Le plan reste donc au SVG, à plat, sans même
 * exécuter la bibliothèque du dessin (`webgl.mjs` `sansCarteGraphique`) —
 * la page l'annonce en préchargement dès son entête, avant tout script :
 * elle arrive, mais ne se lit pas.
 *
 * Le Chromium des essais est justement un tel poste. Mais un navigateur
 * piloté garde le dessin — sans quoi aucun autre essai n'éprouverait plus le
 * WebGL —, et celui-ci se fait donc passer pour un visiteur.
 */
const { test, expect } = require("@playwright/test");
const { prepare, attendLaListe } = require("./aide");

const PLAN = "/plan.html?plan=smcl-2026&ambiance=immersif";

/** Un visiteur, non un navigateur piloté — et une carte graphique imitée, sans quoi l'essai n'a pas lieu d'être. */
async function visiteur(page) {
  await page.addInitScript(() => {
    Object.defineProperty(Navigator.prototype, "webdriver", { get: () => false, configurable: true });
  });
  const imitee = await page.evaluate(() => {
    const gl = document.createElement("canvas").getContext("webgl2");
    const info = gl && gl.getExtension("WEBGL_debug_renderer_info");
    return Boolean(info && /SwiftShader|llvmpipe|softpipe|Software|Basic Render|WARP/i.test(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)));
  });
  test.skip(!imitee, "une vraie carte graphique : le dessin y a sa place");
}

test.describe("sans carte graphique", () => {
  test("le plan reste au SVG, à plat, et la sonde dit pourquoi", async ({ page }) => {
    const erreurs = await prepare(page);
    await visiteur(page);
    await page.goto(PLAN);
    await attendLaListe(page);
    const etat = await page.evaluate(() => ({
      repli: window.__essais.GL.repli, actif: window.__essais.GL.actif, camera: window.__essais.GL.camera,
      attente: document.documentElement.classList.contains("gl-attente"),
      script: Boolean(document.querySelector('script[src*="deck.gl"]')),
    }));
    // et la bibliothèque du dessin ne se lit pas
    expect(etat).toEqual({ repli: "sans carte graphique", actif: false, camera: false, attente: false, script: false });
    // le plan est là, et se laisse faire
    await expect(page.locator("#stands g.stand").first()).toBeAttached();
    const carte = await page.evaluate(() => window.__essais.sonde && window.__essais.sonde.resume.appareil.carte);
    if (carte){
      expect(carte.repli).toBe("sans carte graphique");
    }
    expect(erreurs).toEqual([]);
  });

  test("« ?rendu=webgl » garde le dessin à qui le demande", async ({ page }) => {
    const erreurs = await prepare(page);
    await visiteur(page);
    await page.goto(PLAN + "&rendu=webgl");
    await attendLaListe(page);
    await page.waitForFunction(() => window.__essais.GL.pret, null, { timeout: 30_000 });
    expect(await page.evaluate(() => window.__essais.GL.repli)).toBe("");
    expect(erreurs).toEqual([]);
  });
});
