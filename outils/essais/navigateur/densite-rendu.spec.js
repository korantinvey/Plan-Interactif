/**
 * La densité du rendu : un téléphone modeste se peint à deux pixels par point
 * (`modules/densite-rendu.mjs`), les autres à la densité de leur écran.
 *
 * Le téléphone est celui de la sonde qui l'a demandé : un écran de 393 points
 * à 2,75 pixels par point, celui d'un Redmi Note 9 Pro. Sa mémoire et sa carte
 * graphique sont dites à la page avant qu'elle ne se charge.
 */
const { test, expect } = require("@playwright/test");
const { prepare, attendLaListe } = require("./aide");

test.use({ viewport: { width: 393, height: 873 }, deviceScaleFactor: 2.75, isMobile: true, hasTouch: true });

/** La page du visiteur, sur un appareil qui annonce `memoireGo` et, si
 *  donnée, des textures de `textureMax` au plus. Rend la densité de la toile,
 *  et ce que la bibliothèque du dessin a reçu pour la régler. */
async function densiteDeLaToile(page, { memoireGo, textureMax }) {
  const erreurs = await prepare(page);
  await page.addInitScript(({ memoireGo, textureMax }) => {
    Object.defineProperty(Navigator.prototype, "deviceMemory", { get: () => memoireGo, configurable: true });
    if (!textureMax) return;
    for (const C of [WebGLRenderingContext, WebGL2RenderingContext]) {
      const lit = C.prototype.getParameter;
      C.prototype.getParameter = function (p) {
        return p === this.MAX_TEXTURE_SIZE ? Math.min(textureMax, lit.call(this, p)) : lit.call(this, p);
      };
    }
  }, { memoireGo, textureMax });
  await page.goto("/plan.html?plan=smcl-2026");
  await attendLaListe(page);
  const gl = await page.waitForFunction(() => window.__essais.GL.toile && window.__essais.GL.toile.clientWidth > 0,
    null, { timeout: 15_000 }).then(() => true, () => false);
  test.skip(!gl, "pas de carte graphique : le plan reste en SVG");
  const { densite, demandee } = await page.evaluate(() => {
    const t = window.__essais.GL.toile;
    return { densite: t.width / t.clientWidth, demandee: window.__essais.GL.deck.props.useDevicePixels };
  });
  return { densite, demandee, erreurs };
}

test.describe("la densité du rendu", () => {
  test("quatre gigaoctets : la toile se peint à deux pixels par point", async ({ page }) => {
    const { densite, erreurs } = await densiteDeLaToile(page, { memoireGo: 4 });
    expect(densite).toBeCloseTo(2, 1);
    // la sonde le dit, à côté de la densité de l'écran
    const s = await page.evaluate(() => window.__essais.sonde.resume);
    expect(s.gpu.densite).toBeCloseTo(2, 1);
    expect(s.appareil.densite).toBeCloseTo(2.75, 2);
    expect(erreurs).toEqual([]);
  });

  test("des textures de 4096 pixels : la toile se peint à deux pixels par point", async ({ page }) => {
    const { densite, erreurs } = await densiteDeLaToile(page, { memoireGo: 8, textureMax: 4096 });
    expect(densite).toBeCloseTo(2, 1);
    expect(erreurs).toEqual([]);
  });

  test("un téléphone vif garde la densité de son écran", async ({ page }) => {
    /* La bibliothèque suit alors l'écran d'elle-même. Sous l'émulation d'un
       téléphone, Chromium ne lui dit pas les pixels de la toile, et elle la
       laisse à un pixel par point : on vérifie ce qu'elle a reçu, et non ce
       qu'elle en fait ici — la sonde l'a vue à 2,75 sur un vrai téléphone. */
    const { demandee, erreurs } = await densiteDeLaToile(page, { memoireGo: 8 });
    expect(demandee).toBe(true);
    expect(erreurs).toEqual([]);
  });
});
