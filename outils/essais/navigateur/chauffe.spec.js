/**
 * La chauffe des programmes, à l'ouverture du plan (`modules/webgl.mjs`,
 * « La chauffe » ; `outils/scripts/deck.js` `RETOUCHES`).
 *
 * Le Chromium des essais dessine au processeur et ne compile pas en tâche de
 * fond : la chauffe n'y aurait jamais lieu. L'essai lui prête donc
 * `KHR_parallel_shader_compile`, avec la lenteur d'une carte graphique de
 * poste Windows : chaque programme n'est prêt qu'un moment après son lien,
 * et le relire avant bloque la page jusque-là — ce que la bibliothèque
 * faisait, un programme après l'autre.
 *
 * On éprouve que tous les programmes de l'ouverture partent avant qu'aucun ne
 * soit relu, que rien ne bloque la page avant l'affichage, que la chauffe ne
 * laisse ni couche à elle ni compilation en tâche de fond derrière elle, et
 * que le plan montre les mêmes couches qu'à l'ouverture sans chauffe.
 */
const { test, expect } = require("@playwright/test");
const { prepare, attendLaListe } = require("./aide");

// ce qu'une carte graphique de poste Windows met à compiler un programme (sonde, novembre 2026)
const COMPILATION = 300;

/** Prête à la page une compilation en tâche de fond, lente, et note les liens
 *  et ce qui a bloqué avant l'affichage. */
async function compilationEnTacheDeFond(page) {
  await page.addInitScript((duree) => {
    const J = window.__compilation = { liens: 0, bloquees: 0, avantBlocage: null };
    const P = WebGL2RenderingContext.prototype;
    const lie = P.linkProgram;
    P.linkProgram = function (p) { J.liens++; p.__pret = performance.now() + duree; return lie.call(this, p); };
    const ext = P.getExtension;
    P.getExtension = function (n) {
      return n === "KHR_parallel_shader_compile"
        ? { COMPLETION_STATUS_KHR: 0x91B1, MAX_SHADER_COMPILER_THREADS_KHR: 0x91B0, maxShaderCompilerThreadsKHR() {} }
        : ext.call(this, n);
    };
    const affiche = () => document.documentElement.classList.contains("plan-affiche");
    const bloque = (p) => {
      const reste = p && p.__pret ? p.__pret - performance.now() : 0;
      if (reste <= 0) return;
      if (!affiche()) { J.bloquees++; if (J.avantBlocage === null) J.avantBlocage = J.liens; }
      const fin = performance.now() + reste;
      while (performance.now() < fin) { /* la page attend la carte graphique */ }
    };
    const param = P.getProgramParameter;
    P.getProgramParameter = function (p, nom) {
      if (nom === 0x91B1) return !p.__pret || performance.now() >= p.__pret;
      bloque(p);
      return param.call(this, p, nom);
    };
    for (const n of ["getActiveAttrib", "getActiveUniform", "getAttribLocation", "getUniformLocation",
      "getUniformBlockIndex", "getActiveUniforms", "getActiveUniformBlockParameter", "getProgramInfoLog"]) {
      const f = P[n];
      P[n] = function (p, ...reste) { bloque(p); return f.call(this, p, ...reste); };
    }
  }, COMPILATION);
}

/** Ouvre le plan et attend le dessin ; rend les couches à l'écran. Sans les
 *  figurants : ils n'entrent qu'après l'affichage, à leur heure, et ne sont
 *  pas de l'ouverture. */
async function ouvre(page, ambiance) {
  await page.goto("/plan.html?plan=smcl-2026&ambiance=" + ambiance);
  await attendLaListe(page);
  const dessin = await page.waitForFunction(() => window.__essais.GL.pret, null, { timeout: 60_000 })
    .then(() => true, () => false);
  test.skip(!dessin, "pas de dessin WebGL : le plan reste en SVG");
  return page.evaluate(() => window.__essais.GL.deck.props.layers.map((c) => c.id)
    .filter((id) => !id.startsWith("figurants")).sort());
}

test.describe("la chauffe des programmes", () => {
  for (const ambiance of ["classique", "immersif"]) {
    test("tous lancés avant d'être relus — " + ambiance, async ({ page, browser }) => {
      test.setTimeout(180_000);
      const erreurs = await prepare(page);
      await compilationEnTacheDeFond(page);
      const couches = await ouvre(page, ambiance);

      const bilan = await page.evaluate(() => {
        const GL = window.__essais.GL;
        return { ...window.__compilation, chauffe: GL.chauffe, restes: GL.couchesChauffe, relevee: GL.bilanChauffe,
          coupee: GL.deck.device.features.disabledFeatures["compilation-status-async-webgl"],
          enAttente: GL.deck.device.__chauffe };
      });
      expect(bilan.chauffe).toBe("faite");
      // plusieurs programmes à l'ouverture, aucun relu avant d'être prêt
      expect(bilan.liens).toBeGreaterThan(1);
      expect(bilan.bloquees, "lectures bloquantes avant l'affichage").toBe(0);
      // ce que la sonde en relève : sa durée, et les programmes lancés d'un coup
      expect(bilan.relevee[1]).toBeGreaterThan(1);
      expect(bilan.relevee[0]).toBeGreaterThanOrEqual(COMPILATION);
      // rien de la chauffe ne lui survit
      expect(couches.some((id) => id.startsWith("chauffe-"))).toBe(false);
      expect(bilan.restes).toBeNull();
      expect(bilan.enAttente).toBeNull();
      expect(bilan.coupee, "la compilation en tâche de fond recoupée après la chauffe").toBe(true);

      // les mêmes couches qu'à l'ouverture d'un navigateur sans compilation en tâche de fond
      const sans = await browser.newPage();
      await prepare(sans);
      expect(await ouvre(sans, ambiance)).toEqual(couches);
      expect(await sans.evaluate(() => window.__essais.GL.chauffe)).toBe("faite");
      await sans.close();

      expect(erreurs).toEqual([]);
    });
  }
});
