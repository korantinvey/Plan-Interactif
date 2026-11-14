/**
 * Les surcouches qui portent leur style en attributs (`modules/style-attributs.mjs`) :
 * le dessin les lit sans la feuille, et doit en tirer ce que la feuille dessinait.
 *
 * Les marques des distinctions écrivent leur couleur, leur trait et leur
 * retrait en attributs (`modules/distinctions.mjs` `traceDist`), la zone que
 * désigne la visite guidée son halo et son trait (`modules/tutoriel.mjs`
 * `marqueZoneTuto`), et la feuille ne les peint plus. On compare, pour chaque réglage, ce que le dessin tire du
 * bloc par la lecture d'avant — le style calculé — et par la sienne — les
 * attributs : un écart dirait qu'une règle de la feuille les peint encore, ou
 * qu'un attribut se lit de travers. Puis on vérifie que les marques portent
 * bien la teinte réglée, et le retrait d'une recherche.
 */
const { test, expect } = require("@playwright/test");
const { prepare, attendLaListe, avecUnProgramme, commenceLaVisite, DONNEES } = require("./aide.js");

/** SMCL 2026, des nouveaux venus et des adhérents, et ces deux marques sur le plan. */
function avecDistinctions(modeNeuf, modeAdherent, couleur) {
  const d = JSON.parse(JSON.stringify(DONNEES));
  d.fiche = { ...(d.fiche || {}), stand: { ...((d.fiche || {}).stand || {}), nouveau: true, adherent: true } };
  d.plans.forEach((p) => {
    p.stands.forEach((s, i) => { if (i % 3 === 0) s.neuf = true; if (i % 4 === 0) s.adh = true; });
    p.apparence = { ...(p.apparence || {}), reglages: { ...((p.apparence || {}).reglages || {}),
      _neuf: { plan: modeNeuf, ...(couleur ? { couleur } : {}) }, _adherent: { plan: modeAdherent } } };
  });
  return d;
}

const CAS = [
  ["point", "lisere", null, ""], ["corne", "point", "#e67e22", ""], ["etoile", "lisere", null, ""],
  ["lisere", "lisere", "#8e44ad", ""], ["corne", "etoile", null, "&ambiance=tuiles"],
];

for (const [modeNeuf, modeAdherent, couleur, ambiance] of CAS) {
  test("les marques des distinctions se lisent dans leurs attributs — " + modeNeuf + " et " + modeAdherent +
    (couleur ? ", teinte réglée" : "") + (ambiance ? ", en tuiles" : ""), async ({ page }) => {
    const erreurs = await prepare(page);
    const corps = JSON.stringify(avecDistinctions(modeNeuf, modeAdherent, couleur));
    await page.route("**/api/plan*", (r) => new URL(r.request().url()).searchParams.get("entete")
      ? r.fulfill({ json: { v: "essai-surcouches" } })
      : r.fulfill({ status: 200, contentType: "application/json", headers: { "X-Version": "essai-surcouches" }, body: corps }));
    // en SVG : on compare deux lectures du même bloc, sans attendre le dessin
    await page.goto("/plan?plan=smcl-2026&rendu=svg" + ambiance);
    const lignes = await attendLaListe(page);
    await expect.poll(() => page.evaluate(() => document.querySelectorAll("#dists .dM").length)).toBeGreaterThan(10);

    const compare = () => page.evaluate(() => globalThis.__essais.compareLectures(document.getElementById("dists")));
    const r = await compare();
    expect(r.ecarts, JSON.stringify(r.ecarts, null, 1)).toEqual([]);
    expect(r.formes).toBeGreaterThan(10);

    // la teinte réglée est celle des marques du nouveau venu
    if (couleur) {
      const teintes = await page.evaluate(() => [...document.querySelectorAll("#dists .dM.d-neuf [fill], #dists .dM.d-neuf [stroke]")]
        .map((n) => n.getAttribute(n.getAttribute("fill") === "none" ? "stroke" : "fill")));
      expect(new Set(teintes)).toEqual(new Set([couleur]));
    }

    // une recherche retire des stands : leurs marques s'effacent avec eux, en attribut
    const texte = (await lignes.nth(2).innerText()).trim().split("\n")[0];
    await page.fill("#q", texte);
    await expect.poll(() => page.evaluate(() => document.querySelectorAll('#dists .dM[opacity=".22"]').length)).toBeGreaterThan(0);
    const r2 = await compare();
    expect(r2.ecarts, JSON.stringify(r2.ecarts, null, 1)).toEqual([]);
    expect(erreurs).toEqual([]);
  });
}

test("la zone que désigne la visite guidée se lit dans ses attributs", async ({ page }) => {
  /* En SVG, la zone bat (`tutoBat`) : son opacité calculée varie d'un instant à
     l'autre, quand le dessin, qui ne rejoue aucune animation de la feuille, la
     lit toujours pleine. Sans mouvement, la feuille la tient immobile. */
  await page.emulateMedia({ reducedMotion: "reduce" });
  // en SVG : on compare deux lectures du même bloc, sans attendre le dessin
  const erreurs = await commenceLaVisite(page, { adresse: "/plan?plan=smcl-2026&rendu=svg", donnees: avecUnProgramme() });
  await page.waitForFunction(() => {
    const TUTO = /** @type {any} */ (globalThis).__essais.TUTO;
    return TUTO && TUTO.cle === "zones:zone" && document.querySelector("#tutoZone path");
  }, null, { polling: 250, timeout: 60_000 });
  const r = await page.evaluate(() => globalThis.__essais.compareLectures(document.getElementById("tutoZone")));
  expect(r.ecarts, JSON.stringify(r.ecarts, null, 1)).toEqual([]);
  // le halo et le trait : deux aplats et deux traits au plus, selon que la zone a un ou plusieurs anneaux
  expect(r.formes).toBeGreaterThanOrEqual(2);
  expect(erreurs).toEqual([]);
});
