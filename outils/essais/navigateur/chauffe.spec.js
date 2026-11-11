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
 * Le simulateur prête aussi la traduction d'ANGLE pour Direct3D : le premier
 * dessin d'un programme occupe la carte graphique un moment, et la demande
 * suivante qui attend une réponse — le lien d'un autre programme, une liste
 * d'attributs — attend qu'elle ait fini, comme dans le processus graphique de
 * Chromium. Une barrière (`fenceSync`) ne se dit franchie qu'une fois la
 * carte libre, et se lit sans attendre.
 *
 * On éprouve que tous les programmes de l'ouverture partent avant qu'aucun ne
 * soit relu, que chacun dessine pendant la chauffe et qu'elle attend la fin
 * de ce dessin, que rien ne bloque la page avant l'affichage, que la chauffe
 * ne laisse ni couche à elle ni compilation en tâche de fond derrière elle,
 * et que le plan montre les mêmes couches qu'à l'ouverture sans chauffe. Et,
 * sans compilation en tâche de fond, que la sonde dit quelle demande a fait
 * attendre la page (`sonde.mjs`, « Ce qui a fait attendre »).
 */
const { test, expect } = require("@playwright/test");
const { prepare, attendLaListe } = require("./aide");
const { incoherences } = require("../../scripts/sonde-coherence");

// ce qu'une carte graphique de poste Windows met à compiler un programme (sonde, novembre 2026)
const COMPILATION = 300;
// ce que la traduction d'un programme à son premier dessin occupe la carte graphique
const TRADUCTION = 200;

/** Prête à la page une carte graphique de poste Windows — compilation lente,
 *  en tâche de fond si `parallele`, traduction au premier dessin —, et note
 *  les liens, ce qui a bloqué avant l'affichage, et les programmes dont le
 *  premier dessin est venu après la chauffe. */
async function carteDePosteWindows(page, { parallele = true } = {}) {
  await page.addInitScript(({ duree, traduction, parallele }) => {
    const J = window.__compilation = { liens: 0, bloquees: 0, avantBlocage: null,
      traduits: 0, traduitsApresChauffe: 0, barrieres: 0, motifs: [] };
    const P = WebGL2RenderingContext.prototype;
    const maintenant = () => performance.now();
    const affiche = () => document.documentElement.classList.contains("plan-affiche");
    const attends = (fin) => { while (maintenant() < fin) { /* la page attend la carte graphique */ } };
    // jusqu'où la carte graphique est occupée par les traductions
    let occupee = 0;
    const note = (motif) => {
      if (affiche()) return;
      J.bloquees++;
      if (J.avantBlocage === null) J.avantBlocage = J.liens;
      if (J.motifs.length < 8) J.motifs.push(motif);
    };
    /* Une demande qui attend sa réponse : après les traductions en cours, et
       après son programme. Chromium garde ce qu'il sait d'un programme dès la
       première réponse — ses attributs, ses blocs — : les demandes suivantes
       sur le même programme ne retournent plus au processus graphique. */
    const demande = (p, nom) => {
      if (p && p.__connu) return;
      const lien = p && p.__pret ? p.__pret : 0;
      const fin = Math.max(occupee, lien);
      if (fin <= maintenant()) { if (p && lien) p.__connu = true; return; }
      const GL = window.__essais && window.__essais.GL;
      note(nom + " — " + (lien >= occupee ? "lien" : "traduction") + " — chauffe « " + (GL ? GL.chauffe : "?") + " »");
      attends(fin);
      if (p && lien) p.__connu = true;
    };
    const lie = P.linkProgram;
    P.linkProgram = function (p) {
      J.liens++;
      p.__pret = parallele ? maintenant() + duree : 0;
      const r = lie.call(this, p);
      // sans tâche de fond, le lien se paie sur-le-champ, à la première demande
      if (!parallele) p.__pret = maintenant() + duree;
      return r;
    };
    if (parallele) {
      const ext = P.getExtension;
      P.getExtension = function (n) {
        return n === "KHR_parallel_shader_compile"
          ? { COMPLETION_STATUS_KHR: 0x91B1, MAX_SHADER_COMPILER_THREADS_KHR: 0x91B0, maxShaderCompilerThreadsKHR() {} }
          : ext.call(this, n);
      };
    }
    const param = P.getProgramParameter;
    P.getProgramParameter = function (p, nom) {
      if (nom === 0x91B1) return !p.__pret || maintenant() >= p.__pret;
      demande(p, "getProgramParameter 0x" + nom.toString(16));
      return param.call(this, p, nom);
    };
    for (const n of ["getActiveAttrib", "getActiveUniform", "getAttribLocation", "getUniformLocation",
      "getUniformBlockIndex", "getActiveUniforms", "getActiveUniformBlockParameter", "getProgramInfoLog"]) {
      const f = P[n];
      P[n] = function (p, ...reste) { demande(p, n); return f.call(this, p, ...reste); };
    }
    for (const n of ["getError", "readPixels", "getBufferSubData"]) {
      const f = P[n];
      P[n] = function (...a) { demande(null, n); return f.apply(this, a); };
    }
    // le premier dessin d'un programme le fait traduire : la carte graphique s'occupe, la page continue
    const utilise = P.useProgram;
    P.useProgram = function (p) { this.__programme = p; return utilise.call(this, p); };
    for (const n of ["drawArrays", "drawElements", "drawArraysInstanced", "drawElementsInstanced", "drawRangeElements"]) {
      const f = P[n];
      P[n] = function (...a) {
        const p = this.__programme;
        if (p && !p.__dessine) {
          p.__dessine = true;
          occupee = Math.max(occupee, maintenant()) + traduction;
          J.traduits++;
          const GL = window.__essais && window.__essais.GL;
          if (GL && GL.chauffe === "faite" && !affiche()) J.traduitsApresChauffe++;
        }
        return f.apply(this, a);
      };
    }
    // la barrière se lit sans attendre, et ne passe qu'une fois la carte graphique libre
    const barriere = P.fenceSync;
    P.fenceSync = function (...a) { const b = barriere.apply(this, a); if (b) b.__fin = occupee; J.barrieres++; return b; };
    const etat = P.getSyncParameter;
    P.getSyncParameter = function (b, nom) {
      if (nom === 0x9114 && b && b.__fin !== undefined) return maintenant() >= b.__fin ? 0x9119 : 0x9118;
      return etat.call(this, b, nom);
    };
  }, { duree: COMPILATION, traduction: TRADUCTION, parallele });
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
      await carteDePosteWindows(page);
      const couches = await ouvre(page, ambiance);

      const bilan = await page.evaluate(() => {
        const GL = window.__essais.GL;
        return { ...window.__compilation, chauffe: GL.chauffe, restes: GL.couchesChauffe, relevee: GL.bilanChauffe,
          sources: GL.sourcesChauffe,
          coupee: GL.deck.device.features.disabledFeatures["compilation-status-async-webgl"],
          enAttente: GL.deck.device.__chauffe };
      });
      expect(bilan.chauffe).toBe("faite");
      // plusieurs programmes à l'ouverture, aucun relu avant d'être prêt
      expect(bilan.liens).toBeGreaterThan(1);
      expect(bilan.bloquees, "lectures bloquantes avant l'affichage : " + bilan.motifs.join(" ; ")).toBe(0);
      // chaque programme a dessiné pendant la chauffe, qui a attendu la fin de ce dessin
      expect(bilan.barrieres).toBeGreaterThan(0);
      expect(bilan.traduits).toBeGreaterThan(1);
      expect(bilan.traduitsApresChauffe, "programmes au premier dessin après la chauffe").toBe(0);
      // ce que la sonde en relève : sa durée, les programmes lancés d'un coup, et le dessin
      expect(bilan.relevee[1]).toBeGreaterThan(1);
      expect(bilan.relevee[0]).toBeGreaterThanOrEqual(COMPILATION + TRADUCTION);
      expect(bilan.relevee[2]).toBeGreaterThanOrEqual(TRADUCTION);
      // rien de la chauffe ne lui survit
      expect(couches.some((id) => id.startsWith("chauffe-"))).toBe(false);
      expect(bilan.restes).toBeNull();
      expect(bilan.sources).toBeNull();
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

test.describe("ce qui a fait attendre l'ouverture", () => {
  test("la sonde nomme la demande et son paramètre", async ({ page }) => {
    test.setTimeout(180_000);
    const erreurs = await prepare(page);
    // sans tâche de fond : pas de chauffe, chaque lien et chaque traduction se paient à la demande suivante
    await carteDePosteWindows(page, { parallele: false });
    await ouvre(page, "classique");
    await expect.poll(() => page.evaluate(() => document.documentElement.classList.contains("plan-affiche"))).toBe(true);

    const { bloquees, chauffe, resume } = await page.evaluate(() => ({
      bloquees: window.__compilation.bloquees, chauffe: window.__essais.GL.chauffe,
      resume: window.__essais.sonde.resume }));
    expect(chauffe).toBe("faite");
    expect(bloquees, "la page a bien attendu la carte graphique").toBeGreaterThan(0);
    const attentes = resume.chargement.attentes;
    expect(Array.isArray(attentes)).toBe(true);
    expect(attentes.length).toBeLessThanOrEqual(5);
    // les plus longues d'abord, chacune nommée avec son paramètre
    const durees = attentes.map((x) => x[1]);
    expect(durees).toEqual([...durees].sort((a, b) => b - a));
    const lien = attentes.find((x) => /^getProgramParameter LINK_STATUS/.test(x[0]));
    expect(lien, JSON.stringify(attentes)).toBeTruthy();
    expect(lien[1]).toBeGreaterThanOrEqual(COMPILATION);
    // ni dit prêt ni chauffe : rien ne l'a annoncé, et la chauffe n'a pas eu lieu
    expect(lien[0]).not.toMatch(/ pret| chauffe| dessin/);
    expect(incoherences(resume).map((x) => x.cle + " : " + x.detail)).toEqual([]);
    expect(erreurs).toEqual([]);
  });
});
