/**
 * Le pincement sur un téléphone, quand un tiroir occupe le bas de l'écran.
 *
 * Les doigts passent par le protocole du navigateur et non par des événements
 * fabriqués : seuls les vrais doigts ont une capture, et c'est elle qui dit
 * qu'un doigt tient le plan (`modules/gestes.mjs` `adopteSecondDoigt`).
 * En SVG, comme les autres essais qui éprouvent un chemin et non le dessin :
 * sans carte graphique, chaque image d'un pincement WebGL coûte des secondes.
 */
const { test, expect } = require("@playwright/test");
const { prepare, attendLaListe } = require("./aide.js");

const PLAN = "/plan?plan=smcl-2026&rendu=svg";

/** Le plan ouvert, la liste hissée au cran du milieu et immobile. */
async function listeAuMilieu(page) {
  await page.goto(PLAN);
  await attendLaListe(page);
  await page.locator("#poignee").click();
  await expect(page.locator("#side")).toHaveAttribute("data-cran", "demi");
  await page.waitForFunction(() => document.getElementById("side").getAnimations().length === 0);
}

const doigt = (id, x, y) => ({ id, x, y });

test.describe("le pincement, tiroir ouvert", () => {
  test.skip(({ isMobile }) => !isMobile, "la liste n'est un tiroir que sur écran étroit");

  /* Au cran du milieu, la liste couvre près de la moitié de l'écran, et le
     second doigt d'un pincement y tombait : il n'arrivait jamais au plan, qui
     glissait sous le premier au lieu de grandir. */
  test("un doigt posé sur le tiroir pince quand même le plan @telephone", async ({ page, context }) => {
    const erreurs = await prepare(page);
    await listeAuMilieu(page);
    const plan = await page.locator("#plan").boundingBox();
    const tiroir = await page.locator("#side").boundingBox();
    const x = plan.x + plan.width / 2;
    const haut = plan.y + plan.height * .25;
    // sous le bord du tiroir, sur ses lignes
    const bas = tiroir.y + 80;
    expect(await page.evaluate(([x, y]) => !!document.elementFromPoint(x, y).closest("#side"), [x, bas]))
      .toBe(true);

    const avant = await page.evaluate(() => /** @type {any} */ (globalThis).__essais.view.w);
    const cdp = await context.newCDPSession(page);
    const toucher = (type, points) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: points });
    await toucher("touchStart", [doigt(0, x, haut)]);
    await toucher("touchStart", [doigt(0, x, haut), doigt(1, x, bas)]);
    // les doigts s'écartent : le plan doit grandir
    for (let i = 1; i <= 6; i++) {
      await toucher("touchMove", [doigt(0, x, haut - i * 10), doigt(1, x, bas + i * 10)]);
    }
    await toucher("touchEnd", []);
    const apres = await page.evaluate(() => /** @type {any} */ (globalThis).__essais.view.w);
    expect(apres).toBeLessThan(avant * .9);
    // la liste n'a pas défilé sous le second doigt
    expect(await page.locator("#list").evaluate((n) => n.scrollTop)).toBe(0);
    expect(erreurs).toEqual([]);
  });

  /* Le premier doigt a souvent déjà glissé quand le second se pose, et plié
     la barre et le tiroir. Le pincement les dépliait à son premier appui pour
     les replier à sa première image : le tiroir faisait l'aller-retour sous les
     doigts à chaque début de zoom. */
  test("le tiroir plié ne remonte pas quand le pincement commence @telephone", async ({ page, context }) => {
    const erreurs = await prepare(page);
    await listeAuMilieu(page);
    const plan = await page.locator("#plan").boundingBox();
    const x = plan.x + plan.width / 2, y = plan.y + plan.height * .25;

    const cdp = await context.newCDPSession(page);
    const toucher = (type, points) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: points });
    await toucher("touchStart", [doigt(0, x, y)]);
    for (let i = 1; i <= 3; i++) await toucher("touchMove", [doigt(0, x, y + i * 6)]);
    await expect(page.locator("#side")).toHaveClass(/pliee/);

    // chaque fois que le tiroir perd son pli, d'ici au doigt levé
    await page.evaluate(() => {
      const g = /** @type {any} */ (globalThis);
      g.__deplie = 0;
      new MutationObserver(() => {
        if (!document.getElementById("side").classList.contains("pliee")) g.__deplie++;
      }).observe(document.getElementById("side"), { attributes: true, attributeFilter: ["class"] });
    });
    await toucher("touchStart", [doigt(0, x, y + 18), doigt(1, x + 60, y + 60)]);
    for (let i = 1; i <= 3; i++) {
      await toucher("touchMove", [doigt(0, x - i * 8, y + 18), doigt(1, x + 60 + i * 8, y + 60)]);
    }
    expect(await page.evaluate(() => /** @type {any} */ (globalThis).__deplie)).toBe(0);
    await toucher("touchEnd", []);
    expect(erreurs).toEqual([]);
  });
});

/* Sous la carte graphique, savoir quelle forme est sous le doigt oblige à
   relire ses pixels, ce qui arrête la page jusqu'à ce qu'elle ait fini son
   image. On ne le lui demandait au doigt posé que pour l'appui, et chaque
   glissé, chaque pincement commençait donc par cet à-coup. */
test.describe("l'appui sous la carte graphique", () => {
  test("ne relit les pixels qu'au doigt levé, et ouvre toujours la fiche", async ({ page }) => {
    const erreurs = await prepare(page);
    await page.addInitScript(() => {
      const g = /** @type {any} */ (globalThis);
      g.__relectures = 0;
      for (const C of [g.WebGL2RenderingContext, g.WebGLRenderingContext]) {
        if (!C) continue;
        const lit = C.prototype.readPixels;
        C.prototype.readPixels = function () { g.__relectures++; return lit.apply(this, arguments); };
      }
    });
    await page.goto("/plan?plan=smcl-2026");
    await attendLaListe(page);
    test.skip(!(await page.evaluate(() => /** @type {any} */ (globalThis).__essais.GL.actif)),
      "pas de WebGL2 dans ce navigateur");
    await page.waitForFunction(() => document.documentElement.classList.contains("gl-pret"));
    // le plus grand stand entièrement dans le cadre : l'appui ne peut pas le manquer
    const vise = await page.evaluate(() => {
      const { rectEcranWebgl } = /** @type {any} */ (globalThis).__essais;
      const c = document.getElementById("plan").getBoundingClientRect();
      let mieux = null;
      for (const n of document.querySelectorAll("#stands [data-id]")) {
        const r = rectEcranWebgl(n);
        if (!r || r.left < c.left || r.top < c.top || r.right > c.right || r.bottom > c.bottom) continue;
        if (!mieux || r.width * r.height > mieux.aire) {
          mieux = { id: n.getAttribute("data-id"), x: r.left + r.width / 2, y: r.top + r.height / 2,
                    aire: r.width * r.height };
        }
      }
      return mieux;
    });
    expect(vise).not.toBeNull();

    await page.mouse.move(vise.x, vise.y);
    const avant = await page.evaluate(() => /** @type {any} */ (globalThis).__relectures);
    await page.mouse.down();
    expect(await page.evaluate(() => /** @type {any} */ (globalThis).__relectures)).toBe(avant);
    await page.mouse.up();
    await expect(page.locator("#detail")).toHaveClass(/open/);
    expect(erreurs).toEqual([]);
  });
});
