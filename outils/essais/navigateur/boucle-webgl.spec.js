/**
 * La boucle d'images du dessin, arrêtée pendant que l'application dormait.
 *
 * Au retour, la toile restait figée sur sa dernière image : la vue changeait,
 * les appels du plan la suivaient, et le hall ne bougeait plus sous le doigt.
 * L'essai arrête la boucle comme le fait une image qui lève une erreur — la
 * suivante n'est jamais demandée —, revient sur la page, et attend que le
 * dessin remonte sur une toile neuve. Une boucle qui tourne, elle, ne doit
 * rien remonter.
 */
const { test, expect } = require("@playwright/test");
const { prepare, attendLaListe } = require("./aide");

test.describe("la boucle d'images du dessin", () => {
  test("arrêtée en arrière-plan, le dessin remonte au retour", async ({ page }) => {
    test.setTimeout(120_000);
    const erreurs = await prepare(page);
    await page.goto("/plan.html?plan=smcl-2026");
    await attendLaListe(page);
    const dessin = await page.waitForFunction(() => window.__essais.GL.pret, null, { timeout: 15_000 })
      .then(() => true, () => false);
    test.skip(!dessin, "pas de carte graphique : le plan reste en SVG");

    // vivante, la boucle n'est pas touchée par le retour sur la page
    await page.evaluate(() => {
      window.__ancien = window.__essais.GL.deck;
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await page.waitForTimeout(2500);
    expect(await page.evaluate(() => window.__essais.GL.deck === window.__ancien)).toBe(true);

    // arrêtée, elle l'est
    await page.evaluate(() => {
      window.__essais.GL.deck.animationLoop._cancelAnimationFrame();
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await page.waitForFunction(() => {
      const GL = window.__essais.GL;
      return GL.pret && GL.deck && GL.deck !== window.__ancien;
    }, null, { timeout: 15_000 });

    // et la toile neuve suit le plan qu'on fait glisser
    const avant = await page.evaluate(() => window.__essais.GL.deck.animationLoop._lastFrameTime);
    const r = await page.locator("#plan").boundingBox();
    await page.mouse.move(r.x + r.width / 2, r.y + r.height / 2);
    await page.mouse.down();
    await page.mouse.move(r.x + r.width / 2 + 120, r.y + r.height / 2 + 60, { steps: 2 });
    await page.mouse.up();
    await page.waitForFunction((t) => window.__essais.GL.deck.animationLoop._lastFrameTime !== t, avant);

    expect(erreurs).toEqual([]);
  });

  /* Le plan intégré dans la page d'un salon, sorti de l'écran par le
     défilement : Chrome ne lui donne plus d'images, sans le dire caché. La
     boucle ne tourne plus, mais elle n'est pas morte — la garde ne doit rien
     jeter. Rendues les images, une boucle vraiment arrêtée l'est, elle. */
  test("sans image donnée par le navigateur, la garde ne jette rien", async ({ page }) => {
    test.setTimeout(120_000);
    const erreurs = await prepare(page);
    await page.goto("/plan.html?plan=smcl-2026");
    await attendLaListe(page);
    const dessin = await page.waitForFunction(() => window.__essais.GL.pret, null, { timeout: 15_000 })
      .then(() => true, () => false);
    test.skip(!dessin, "pas de carte graphique : le plan reste en SVG");

    await page.evaluate(() => {
      window.__ancien = window.__essais.GL.deck;
      // plus aucune image, pour personne : ce que fait Chrome d'un cadre hors de l'écran
      window.__rafVrai = window.requestAnimationFrame;
      window.requestAnimationFrame = () => 0;
      window.__essais.GL.deck.animationLoop._cancelAnimationFrame();
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await page.waitForTimeout(2500);
    expect(await page.evaluate(() => window.__essais.GL.deck === window.__ancien)).toBe(true);

    // les images reviennent, la boucle reste arrêtée : le dessin remonte
    await page.evaluate(() => {
      window.requestAnimationFrame = window.__rafVrai;
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await page.waitForFunction(() => {
      const GL = window.__essais.GL;
      return GL.pret && GL.deck && GL.deck !== window.__ancien;
    }, null, { timeout: 15_000 });

    expect(erreurs).toEqual([]);
  });
});
