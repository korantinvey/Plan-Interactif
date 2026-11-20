/**
 * Sur un téléphone, la fiche naît du stand qu'on touche (`modules/fiche.mjs`
 * `anime`).
 *
 * Le point de départ de l'animation se lisait au milieu du geste qui ouvre la
 * fiche : la lecture obligeait le navigateur à remettre la page en page
 * sur-le-champ, et une seconde fois à l'image suivante, les noms et le plan
 * s'étant réécrits entre-temps — au banc de FUNEXPO, le quart du coût d'une
 * ouverture, que le doigt levé attendait. Elle se lit désormais à l'image
 * suivante. L'essai garde ce que le visiteur voit : la fiche part de la taille
 * réduite au point touché, mesuré sur le tiroir où elle arrive, et le glissement
 * CSS reprend la main à la fin.
 */
const { test, expect } = require("@playwright/test");
const { prepare, attendLaListe, standAViser } = require("./aide.js");

/**
 * L'animation de naissance de la fiche, et ce qu'elle vise, relevés à l'appel
 * même qui la lance. Guettée image par image, elle échappait à l'essai sur le
 * poste de la CI : la page s'y fige parfois plus longtemps que ses 380 ms
 * (« GPU stall due to ReadPixels »), et la fiche ouverte n'avait plus
 * d'animation en cours quand l'essai regardait.
 */
const guetteNaissance = (page) => page.addInitScript(() => {
  const animate = Element.prototype.animate;
  Element.prototype.animate = function (images, options) {
    if (this.id === "detail" && Array.isArray(images) && /scale\(0?\.16\)/.test(String(images[0] && images[0].transform))) {
      const [ox, oy] = this.style.transformOrigin.split(" ").map(parseFloat);
      window.__naissance = { ox, oy, gauche: this.offsetLeft, haut: this.offsetTop };
    }
    return animate.call(this, images, options);
  };
});
const naissance = (page) => page.waitForFunction(() => window.__naissance, null, { timeout: 5_000 })
  .then((h) => h.jsonValue());

test("la fiche naît du point touché, mesuré sur le tiroir où elle arrive @telephone", async ({ page }) => {
  const erreurs = await prepare(page);
  await guetteNaissance(page);
  await page.goto("/plan?plan=smcl-2026");
  await attendLaListe(page);
  await page.waitForFunction(() => document.documentElement.classList.contains("plan-affiche"), null, { timeout: 30_000 });
  test.skip(await page.evaluate(() => innerWidth > 900), "la fiche ne naît du toucher que sur écran étroit");
  const p = await standAViser(page);
  expect(p).not.toBeNull();
  await page.touchscreen.tap(p.x, p.y);
  const n = await naissance(page);
  // le point de départ : le toucher, dans le repère du tiroir arrivé
  expect(Math.abs(n.ox - (p.x - n.gauche))).toBeLessThanOrEqual(1);
  expect(Math.abs(n.oy - (p.y - n.haut))).toBeLessThanOrEqual(1);
  // l'animation finie, le glissement CSS reprend la main
  await expect(page.locator("#detail")).not.toHaveClass(/\bglisse\b/, { timeout: 3_000 });

  expect(erreurs).toEqual([]);
});
