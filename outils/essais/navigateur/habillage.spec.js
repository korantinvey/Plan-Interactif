/**
 * L'habillage de Klipso, lu dans ses données (`modules/webgl.mjs` « L'habillage
 * de Klipso, lu dans ses données », `modules/style-habillage.mjs`), contre la
 * lecture d'avant : le groupe du calque posé dans la page, et son style calculé.
 *
 * Le dessin ne relit plus les calques de Klipso dans le SVG caché : il les lit
 * dans une copie détachée de leur balisage, et en résout le style sans la
 * feuille. Une règle de la feuille sur `#couches .cal` changée d'un seul côté,
 * un réglage de l'exploitant mal repris, et le hall changerait de couleur sans
 * que rien ne le dise. On compare donc, calque par calque et pavillon par
 * pavillon, ce que le dessin tire des deux lectures — chaque aplat, chaque
 * trait, chaque texte, avec sa couleur, son épaisseur, ses tirets —, sur des
 * données qui portent des réglages d'exploitant : couleur et remplissage d'un
 * calque, couleur, remplissage et extinction d'un sous-calque.
 */
const { test, expect } = require("@playwright/test");
const { prepare, attendLaListe, DONNEES } = require("./aide.js");

/* En SVG : les deux lectures se comparent sans attendre le dessin, et le
   WebGL logiciel des machines d'essai ralentirait chaque pavillon. */
const PLAN = "/plan?plan=smcl-2026&rendu=svg";

/** Les données de SMCL 2026, et des réglages d'exploitant sur leurs calques. */
function reglees() {
  const d = JSON.parse(JSON.stringify(DONNEES));
  const reglages = {};
  let n = 0;
  for (const p of d.plans) {
    for (const f of p.fond || []) {
      const sous = [...String(f.svg || "").matchAll(/<g id="([^"]+)"/g)].map((m) => m[1]);
      const k = n++ % 4;
      // un calque sur quatre de chaque façon : tel quel, teint, rempli, teint et rempli
      if (k === 1) reglages[f.cle] = { couleur: "#c0392b" };
      if (k === 2) reglages[f.cle] = { rempli: true };
      if (k === 3) reglages[f.cle] = { couleur: "#2e86c1", rempli: true };
      // et ses sous-calques : un teint, un éteint, un rempli à rebours du calque
      if (sous[0]) reglages[f.cle + "/" + sous[0]] = { couleur: "#27ae60" };
      if (sous[1]) reglages[f.cle + "/" + sous[1]] = { visible: false };
      if (sous[2]) reglages[f.cle + "/" + sous[2]] = { rempli: k !== 2 && k !== 3 };
    }
  }
  d.plans.forEach((p) => {
    p.apparence = { ...(p.apparence || {}), reglages: { ...((p.apparence || {}).reglages || {}), ...reglages } };
  });
  return d;
}

for (const [nom, donnees] of [["tel quel", () => DONNEES], ["réglé par l'exploitant", reglees]]) {
  test("l'habillage lu dans ses données dessine ce que la feuille dessinait — " + nom, async ({ page }) => {
    test.slow();
    const erreurs = await prepare(page);
    const corps = JSON.stringify(donnees());
    await page.route("**/api/plan*", (r) => new URL(r.request().url()).searchParams.get("entete")
      ? r.fulfill({ json: { v: "essai-habillage" } })
      : r.fulfill({ status: 200, contentType: "application/json", headers: { "X-Version": "essai-habillage" }, body: corps }));
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(PLAN);
    await attendLaListe(page);
    let formes = 0, calques = 0;
    for (let i = 0; i < DONNEES.plans.length; i++) {
      if (i) {
        await page.locator("#halls [data-p='" + i + "']").first().evaluate((b) => b.click());
        await expect.poll(() => page.evaluate((i) => document.querySelector("#halls [data-p='" + i + "']")
          .getAttribute("aria-pressed"), i)).toBe("true");
      }
      // chaque calque montré et rempli : les autres ne se dessinent dans aucune des deux lectures
      await expect.poll(() => page.evaluate(() => document.querySelectorAll("#couches .cal > *").length)).toBeGreaterThan(0);
      const r = await page.evaluate(() => [...document.querySelectorAll("#couches .cal")]
        .filter((g) => g.childElementCount)
        .map((g) => ({ cle: g.dataset.cle, ...globalThis.__essais.compareHabillage(g) })));
      for (const c of r) {
        expect(c.ecarts, "pavillon " + (i + 1) + ", calque " + c.cle + " : " + JSON.stringify(c.ecarts, null, 1)).toEqual([]);
        formes += c.formes; calques++;
      }
    }
    expect(calques, "des calques ont été comparés").toBeGreaterThan(3);
    expect(formes, "des formes ont été comparées").toBeGreaterThan(1000);
    test.info().annotations.push({ type: "comparés", description: calques + " calques, " + formes + " formes" });
    expect(erreurs).toEqual([]);
  });
}
