/**
 * L'état des stands et des zones que tient le modèle (`modules/etat-emplacements.mjs`),
 * contre celui que les modules posent sur le SVG.
 *
 * Le dessin ne lit plus l'état d'un emplacement sur son groupe SVG : chaque
 * module qui le décide le dit aussi au modèle — la fiche le stand choisi, la
 * recherche ceux qu'elle retire, le cartouche les zones mises en avant, les
 * secteurs leurs teintes. Un écrivain qui oublierait le modèle laisserait le
 * dessin en retard sur le SVG, sans que rien ne casse ailleurs. On parcourt
 * donc des états réels de la page, et, pour chaque groupe, on compare ce que
 * le modèle dit à ce que le groupe porte.
 *
 * Les écrivains de l'exploitant — carte de chaleur, reprise de forme, zone
 * masquée — ne s'éprouvent pas ici : la page publique ne les a pas.
 */
const { test, expect } = require("@playwright/test");
const { prepare, attendLaListe, DONNEES } = require("./aide.js");

/* En SVG : les écrivains posent l'état de la même façon dans les deux rendus,
   et le WebGL logiciel des machines d'essai ralentirait chaque geste dix fois. */
const PLAN = "/plan?plan=smcl-2026&rendu=svg";

/* Les données de SMCL 2026, enrichies de ce qu'elles n'ont pas et que d'autres
   salons ont : des secteurs — dont un d'une couleur choisie —, et deux zones de
   restauration, que le cartouche propose de mettre en avant. */
function enrichies() {
  const d = JSON.parse(JSON.stringify(DONNEES));
  d.plans.forEach((p) => {
    p.stands.forEach((s, i) => { s.sect = ["Alimentaire", "Bâtiment", "Services"][i % 3]; });
    p.zones.slice(0, 2).forEach((z) => { z.type = "restauration"; });
    p.apparence = { ...(p.apparence || {}), reglages: { ...((p.apparence || {}).reglages || {}),
      "secteur:Bâtiment": { couleur: "#3a7d44" } } };
  });
  return d;
}

/** Dans la page : les groupes dont le modèle et le SVG ne disent pas la même chose. */
function ecartsDuModele() {
  const G = /** @type {any} */ (globalThis).__essais.emplacements;
  const ecarts = [];
  let vus = 0;
  const compte = { sel: 0, dim: 0, phare: 0, sect: 0 };
  for (const g of document.querySelectorAll("#stands > g, #zones > g")) {
    const cl = g.classList, st = g.style, d = g.dataset;
    const porte = { sel: cl.contains("sel"), dim: cl.contains("dim"), phare: cl.contains("phare"),
      masquee: cl.contains("masquee"),
      sect: g.hasAttribute("data-sect") ? st.getPropertyValue("--sect-h") + "|" + (st.getPropertyValue("--sect-c") || "") : null };
    const e = G.etatEmplacement(d.id, d.aj, cl.contains("zone"), false);
    const dit = { sel: e.sel, dim: e.dim, phare: e.phare, masquee: e.masquee,
      sect: e.sect ? e.sect.h + "|" + (e.sect.c || "") : null };
    vus++;
    for (const k of Object.keys(compte)) if (porte[k]) compte[k]++;
    if (JSON.stringify(porte) !== JSON.stringify(dit) && ecarts.length < 8)
      ecarts.push({ groupe: (d.aj ? "aj:" + d.aj : "id:" + d.id), porte, dit });
  }
  return { vus, compte, ecarts };
}

test("le modèle dit l'état que les modules posent sur les stands et les zones", async ({ page }) => {
  test.slow();
  const erreurs = await prepare(page);
  const donnees = JSON.stringify(enrichies());
  await page.route("**/api/plan*", (r) => new URL(r.request().url()).searchParams.get("entete")
    ? r.fulfill({ json: { v: "essai-etat" } })
    : r.fulfill({ status: 200, contentType: "application/json", headers: { "X-Version": "essai-etat" }, body: donnees }));
  await page.goto(PLAN);
  const lignes = await attendLaListe(page);
  /** @type {Record<string, any>} */
  const vu = {};
  const etape = async (nom) => {
    const r = await page.evaluate(ecartsDuModele);
    vu[nom] = r.compte;
    expect(r.ecarts, nom + " : " + JSON.stringify(r.ecarts, null, 1)).toEqual([]);
    expect(r.vus, nom).toBeGreaterThan(0);
  };

  await etape("au repos");

  // la recherche retire des stands, puis les rend
  const texte = (await lignes.nth(2).innerText()).trim().split("\n")[0];
  await page.fill("#q", texte);
  await expect.poll(() => page.evaluate(() => document.querySelectorAll("#stands > g.dim").length)).toBeGreaterThan(0);
  await etape("recherche");

  // un stand choisi depuis la liste, puis la fiche refermée
  await lignes.first().click();
  await expect(page.locator("#detail")).toHaveClass(/\bopen\b/);
  await etape("stand choisi");
  await page.fill("#q", "");
  await etape("recherche effacée, stand toujours choisi");
  await page.keyboard.press("Escape");
  await expect(page.locator("#detail")).not.toHaveClass(/\bopen\b/);
  await etape("fiche refermée");

  // un type de repère mis en avant par le cartouche, puis rendu
  const pastilles = page.locator("#poi .poiBtn");
  if (await pastilles.count()) {
    await pastilles.first().click();
    await etape("repère mis en avant");
    await pastilles.first().click();
    await etape("repère rendu");
  }

  // un autre pavillon, et un stand choisi là-bas
  if (DONNEES.plans.length > 1) {
    await page.locator("#halls [data-p='1']").first().evaluate((b) => b.click());
    await expect.poll(() => page.evaluate(() => document.querySelectorAll("#stands > g").length)).toBeGreaterThan(0);
    await etape("autre pavillon");
    await lignes.first().click();
    await expect(page.locator("#detail")).toHaveClass(/\bopen\b/);
    await etape("stand choisi dans l'autre pavillon");
  }

  // chaque état a bien été vu au moins une fois : un essai qui ne marque rien ne prouve rien
  const total = (k) => Object.values(vu).reduce((s, c) => s + c[k], 0);
  expect(total("sel"), "un stand choisi a été vu").toBeGreaterThan(0);
  expect(total("dim"), "un stand retiré a été vu").toBeGreaterThan(0);
  expect(total("phare"), "une zone mise en avant a été vue").toBeGreaterThan(0);
  expect(total("sect"), "une teinte de secteur a été vue").toBeGreaterThan(0);
  test.info().annotations.push({ type: "vus", description: JSON.stringify(vu) });
  expect(erreurs).toEqual([]);
});
