/**
 * Le relevé des performances (`modules/releve.mjs`, `?perf`).
 *
 * Il fige ce que le relevé partagé contient aujourd'hui : ses mesures ont été
 * sorties dans un module commun (`mesures-page.mjs`), que la sonde silencieuse
 * réutilise, et rien de ce que le téléphone partage ne doit en avoir changé.
 * Il éprouve aussi un navigateur qui ne sait pas tout mesurer : le relevé doit
 * rester valide sans « long animation frames » ni `performance.memory`.
 */
const { test, expect } = require("@playwright/test");
const { prepare, attendLaListe } = require("./aide.js");

const PLAN = "/plan?plan=smcl-2026&perf";

/** Remplace le menu de partage du système, qui n'a pas de visage ici : le
 *  fichier qu'il aurait reçu est gardé dans la page. */
const prendLePartage = (page) => page.addInitScript(() => {
  Object.defineProperty(navigator, "canShare", { value: () => true, configurable: true });
  Object.defineProperty(navigator, "share", {
    value: async (d) => { window.__partage = await d.files[0].text(); }, configurable: true,
  });
});

/** Touche « Partager le relevé » et rend le JSON du fichier partagé. */
async function partage(page) {
  await page.getByRole("button", { name: "Partager le relevé" }).click();
  await page.waitForFunction(() => window.__partage);
  return JSON.parse(await page.evaluate(() => window.__partage));
}

test.describe("le relevé des performances", { tag: "@base" }, () => {
  test("la pastille paraît et le relevé partagé garde sa forme", async ({ page }) => {
    const erreurs = await prepare(page);
    await prendLePartage(page);
    await page.goto(PLAN);
    await attendLaListe(page);
    await expect(page.locator("#releve-perf")).toBeVisible();
    const r = await partage(page);
    expect(r.format).toBe("releve-plan/1");
    expect(typeof r.appareil.agent).toBe("string");
    expect(Array.isArray(r.chargement.ressources)).toBe(true);
    expect(erreurs).toEqual([]);
  });

  test("sans long-animation-frame ni performance.memory, le relevé reste valide", async ({ page }) => {
    const erreurs = await prepare(page);
    await prendLePartage(page);
    await page.addInitScript(() => {
      const types = (PerformanceObserver.supportedEntryTypes || []).filter((t) => t !== "long-animation-frame");
      Object.defineProperty(PerformanceObserver, "supportedEntryTypes", { value: types });
      try { delete performance.memory; } catch (e) {}
      Object.defineProperty(performance, "memory", { value: undefined, configurable: true });
    });
    await page.goto(PLAN);
    await attendLaListe(page);
    const r = await partage(page);
    expect(r.format).toBe("releve-plan/1");
    expect(typeof r.appareil.agent).toBe("string");
    expect(Array.isArray(r.chargement.ressources)).toBe(true);
    expect(Array.isArray(r.memoire)).toBe(true);
    expect(erreurs).toEqual([]);
  });
});

test.describe("la perte du contexte WebGL", { tag: "@base" }, () => {
  test("un auditeur qui lève n'empêche pas le plan de repasser en SVG", async ({ page }) => {
    const erreurs = await prepare(page);
    await page.goto("/plan.html?plan=smcl-2026");
    await attendLaListe(page);
    const dessin = await page.waitForFunction(() => window.__essais.GL.pret, null, { timeout: 15_000 })
      .then(() => true, () => false);
    test.skip(!dessin, "pas de carte graphique : le plan reste en SVG");
    const { raisons, demonte } = await page.evaluate(async () => {
      const vues = [];
      window.__essais.CONTEXTE_PERDU.suis((r) => { vues.push(r); throw new Error("auditeur fautif"); });
      const toile = window.__essais.GL.toile;
      toile.dispatchEvent(new Event("webglcontextlost", { cancelable: true }));
      /* Lu tout de suite : le démontage est synchrone, et le dessin remonte de
         lui-même 600 ms plus tard. Lu après une attente, une machine chargée
         voyait déjà la toile neuve et l'essai échouait sans défaut du plan. */
      const GL = window.__essais.GL;
      return { raisons: vues, demonte: GL.deck === null && GL.actif === false };
    });
    expect(raisons).toEqual(["contexte perdu"]);
    // le démontage est allé au bout : plus de dessin déclaré
    expect(demonte).toBe(true);
    // et la page vit : rien d'autre n'a levé, remontée comprise
    await page.waitForTimeout(1000);
    expect(erreurs.filter((e) => !/auditeur/.test(e))).toEqual([]);
  });
});
