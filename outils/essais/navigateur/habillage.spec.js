/**
 * L'habillage de Klipso, lu dans ses données (`modules/webgl.mjs` « L'habillage
 * de Klipso, lu dans ses données », `modules/style-habillage.mjs`), contre la
 * lecture d'avant : le groupe du calque posé dans la page, et son style calculé,
 * relu par l'essai (`lecture-svg.js`) — le dessin, lui, ne lit plus le SVG.
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
const { installeLecture } = require("./lecture-svg.js");
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

/* Des écritures rares que le nettoyage de Klipso laisse passer (`_partage/svg.ts`),
   et que le style calculé résolvait : `inherit`, les opacités en pourcentage ou
   hors de [0, 1], les corps en mots-clés et en unités. Aucun salon d'essai n'en
   porte ; on les glisse dans le premier calque montré de chaque pavillon. */
const RARES = '<g font-size="20"><text x="0" y="0" font-size="small">Petit</text>' +
  '<text x="0" y="30" font-size="1.5em">Relatif</text><text x="0" y="60" font-size="12pt">Points</text>' +
  '<text x="0" y="90" font-size="120%">Pourcent</text><text x="0" y="120" font-size="inherit">Hérité</text>' +
  '<text x="0" y="150" font-size="medium">Moyen</text><text x="0" y="180" font-size="x-large">Grand</text></g>' +
  // au premier niveau : `inherit` y prend l'opacité du calque posé, que la copie ne porte pas
  '<path d="M100 0L110 0L110 10Z" fill="#aa5500" opacity="inherit"/>' +
  '<g fill-opacity=".4"><path d="M0 0L10 0L10 10Z" fill="#aa0000" fill-opacity="inherit" stroke="none"/></g>' +
  '<g opacity="50%"><path d="M20 0L30 0L30 10Z" fill="#336699"/></g>' +
  '<path d="M40 0L50 0L50 10Z" fill="#00aa00" opacity="150%"/>' +
  '<path d="M60 0L70 0L70 10Z" fill="#aa00aa" fill-opacity="30%" stroke="#000000" stroke-opacity="60%"/>' +
  '<g opacity=".5"><path d="M80 0L90 0L90 10Z" fill="#0000aa" opacity="inherit"/></g>';
function rares() {
  const d = JSON.parse(JSON.stringify(DONNEES));
  for (const p of d.plans) {
    const f = (p.fond || []).find((x) => x.visible !== false && x.svg);
    if (f) f.svg += RARES;
  }
  return d;
}

for (const [nom, donnees] of [["tel quel", () => DONNEES], ["réglé par l'exploitant", reglees],
  ["aux écritures rares", rares]]) {
  test("l'habillage lu dans ses données dessine ce que la feuille dessinait — " + nom, async ({ page }) => {
    test.slow();
    const erreurs = await prepare(page);
    await installeLecture(page);
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
      /* Et, pour les écritures rares, derrière un cartouche de repère : la
         feuille y pâlit les calques (`poi-actif`), ce que la copie détachée
         ne porte pas. */
      for (const poi of nom === "aux écritures rares" ? [false, true] : [false]) {
        await page.evaluate((poi) => document.documentElement.classList.toggle("poi-actif", poi), poi);
        const r = await page.evaluate(() => [...document.querySelectorAll("#couches .cal")]
          .filter((g) => g.childElementCount)
          .map((g) => ({ cle: g.dataset.cle, ...globalThis.__lectureSvg(g) })));
        for (const c of r) {
          expect(c.ecarts, "pavillon " + (i + 1) + (poi ? ", cartouche ouvert" : "") + ", calque " + c.cle + " : " +
            JSON.stringify(c.ecarts, null, 1)).toEqual([]);
          formes += c.formes; calques++;
        }
      }
      await page.evaluate(() => document.documentElement.classList.remove("poi-actif"));
    }
    expect(calques, "des calques ont été comparés").toBeGreaterThan(3);
    expect(formes, "des formes ont été comparées").toBeGreaterThan(1000);
    test.info().annotations.push({ type: "comparés", description: calques + " calques, " + formes + " formes" });
    expect(erreurs).toEqual([]);
  });
}
