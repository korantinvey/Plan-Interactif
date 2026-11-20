/**
 * Sur grand écran, la fiche d'un modèle aux coins taillés (« verre ») s'étire
 * depuis le stand avec des coins arrondis, et retrouve sa découpe arrivée
 * (`modules/fiche.mjs` `coinsArrondisLeTempsDuMouvement`).
 *
 * La découpe « clip-path » se refaisait à chaque image de la mise à
 * l'échelle : sur un PC à carte graphique intégrée, le stand qui montait au
 * clic se figeait un à deux dixièmes de seconde (`?perf`, FUNEXPO, 20 novembre
 * 2026). L'arrondi du même rayon la remplace le temps du mouvement. L'essai
 * lit la fiche à chaque image de son animation : pas de découpe, l'arrondi de
 * la découpe ; et, l'animation finie, la découpe revenue et rien de posé à
 * la main. Une seconde ouverture qui interrompt la première finit de même.
 */
const { test, expect } = require("@playwright/test");
const { prepare, attendLaListe, standAViser } = require("./aide.js");

/** Ce que la fiche porte à chaque image de son animation, relevé jusqu'à ce qu'elle cesse. */
const releveAnimation = (page) => page.evaluate(() => {
  const d = document.getElementById("detail");
  window.__images = [];
  const f = () => {
    const a = d.getAnimations().filter((x) => x.playState === "running");
    if (a.length) {
      const s = getComputedStyle(d);
      window.__images.push({ clip: s.clipPath, rayon: s.borderTopLeftRadius });
    }
    if (!a.length && window.__images.length) return;
    requestAnimationFrame(f);
  };
  requestAnimationFrame(f);
});

test("la fiche « verre » s'étire avec des coins arrondis, et retrouve sa découpe", async ({ page }) => {
  const erreurs = await prepare(page);
  await page.addInitScript(() => localStorage.setItem("plan-conf:smcl-2026", JSON.stringify({ _fiche: { modele: "verre" } })));
  await page.goto("/plan?plan=smcl-2026");
  await attendLaListe(page);
  test.skip(await page.evaluate(() => innerWidth <= 900), "la fiche ne s'étire depuis le stand que sur grand écran");
  await page.waitForFunction(() => document.documentElement.classList.contains("plan-affiche"), null, { timeout: 30_000 });
  const repos = await page.evaluate(() => getComputedStyle(document.getElementById("detail")).clipPath);
  expect(repos).toMatch(/^inset\(0px round 20px/);

  const p = await standAViser(page);
  expect(p).not.toBeNull();
  await releveAnimation(page);
  await page.mouse.click(p.x, p.y);
  await expect.poll(() => page.evaluate(() => window.__images.length)).toBeGreaterThan(0);
  await page.waitForFunction(() => !document.getElementById("detail").getAnimations().some((x) => x.playState === "running"));
  const images = await page.evaluate(() => window.__images);
  // pendant le mouvement : aucune découpe, l'arrondi de la découpe
  expect(images.filter((i) => i.clip !== "none")).toEqual([]);
  expect(images.every((i) => i.rayon === "20px")).toBe(true);
  // arrivée : la découpe revient, rien ne reste posé à la main
  const fin = await page.evaluate(() => {
    const d = document.getElementById("detail");
    return { clip: getComputedStyle(d).clipPath, enLigne: [d.style.clipPath, d.style.borderRadius, d.style.overflow].join("") };
  });
  expect(fin).toEqual({ clip: repos, enLigne: "" });

  // une seconde ouverture interrompt la première : la découpe revient tout de même
  const q = await standAViser(page, { saufId: p.id });
  expect(q).not.toBeNull();
  await page.mouse.click(q.x, q.y);
  await page.waitForTimeout(60);
  await page.mouse.click(p.x, p.y);
  await page.waitForFunction(() => !document.getElementById("detail").getAnimations().some((x) => x.playState === "running"));
  await page.waitForTimeout(200);
  expect(await page.evaluate(() => getComputedStyle(document.getElementById("detail")).clipPath)).toBe(repos);
  expect(erreurs).toEqual([]);
});
