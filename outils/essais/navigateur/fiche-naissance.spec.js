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

/** L'animation de naissance de la fiche, et ce qu'elle vise, lus à l'image où elle part. */
const naissance = (page) => page.waitForFunction(() => {
  const p = document.getElementById("detail");
  const a = p.getAnimations().find((x) => x.playState === "running" && x.effect &&
    /scale\(0?\.16\)/.test(String(x.effect.getKeyframes()[0].transform)));
  if (!a) return false;
  const [ox, oy] = p.style.transformOrigin.split(" ").map(parseFloat);
  return { ox, oy, gauche: p.offsetLeft, haut: p.offsetTop };
}, null, { timeout: 5_000, polling: "raf" }).then((h) => h.jsonValue());

test("la fiche naît du point touché, mesuré sur le tiroir où elle arrive @telephone", async ({ page }) => {
  const erreurs = await prepare(page);
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
