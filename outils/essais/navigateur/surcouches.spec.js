/**
 * Les surcouches du visiteur, posées en données dans la scène du plan
 * (`modules/scene.mjs`), ont deux peintres : le dessin, et le SVG de secours
 * (`modules/scene-svg.mjs`), qui les écrit en attributs — et la feuille ne les
 * peint plus. Ce qu'on éprouve en rendu SVG : ce que le dessin tirerait du
 * SVG ainsi peint, style calculé compris, est ce qu'il tire des données
 * (`webgl.mjs` `compareLectures`).
 *
 * Les marques des distinctions écrivent leur couleur, leur trait et leur
 * retrait en attributs (`modules/distinctions.mjs` `traceDist`), la zone que
 * désigne la visite guidée son halo et son trait (`modules/tutoriel.mjs`
 * `marqueZoneTuto`), les liserés de la sélection et du parcours leurs couleurs
 * et leurs traits (`modules/parcours.mjs` `dessineMarques`), le trajet et ses
 * pastilles les leurs (`modules/trace-itineraire.mjs` `peintItineraire`), et
 * la feuille ne les peint plus. On compare, pour chaque réglage, ce que le dessin tire du
 * bloc par la lecture d'avant — le style calculé — et par la sienne — les
 * attributs : un écart dirait qu'une règle de la feuille les peint encore, ou
 * qu'un attribut se lit de travers. Puis on vérifie que les marques portent
 * bien la teinte réglée, et le retrait d'une recherche.
 */
const { test, expect } = require("@playwright/test");
const { prepare, attendLaListe, avecUnProgramme, commenceLaVisite, standAViser, DONNEES } = require("./aide.js");

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
      const teintes = await page.evaluate(() => [...document.querySelectorAll("#dists .dM.d-neuf")]
        .map((n) => n.getAttribute(n.getAttribute("fill") === "none" ? "stroke" : "fill")));
      expect(new Set(teintes)).toEqual(new Set([couleur]));
    }

    /* Sans teinte propre, les marques prennent l'accent du salon : l'exploitant
       qui le change doit les voir suivre, comme la feuille les faisait suivre. */
    if (!couleur) {
      await page.evaluate(() => document.documentElement.style.setProperty("--accent", "#123456"));
      await expect.poll(() => page.evaluate(() => [...document.querySelectorAll("#dists .dM.d-neuf")]
        .map((n) => n.getAttribute(n.getAttribute("fill") === "none" ? "stroke" : "fill")).every((t) => t === "#123456")))
        .toBe(true);
    }

    // une recherche retire des stands : leurs marques s'effacent avec eux, en attribut
    const texte = (await lignes.nth(2).innerText()).trim().split("\n")[0];
    await page.fill("#q", texte);
    await expect.poll(() => page.evaluate(() => [...document.querySelectorAll("#dists .dM[opacity]")].filter((n) => +(n.getAttribute("opacity") || 1) === .22).length)).toBeGreaterThan(0);
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

/** Les attributs des liserés posés dans « #marques », par sorte. */
const marques = (page) => page.evaluate(() => [...document.querySelectorAll("#marques path")].map((n) => ({
  sorte: n.getAttribute("class"), stroke: n.getAttribute("stroke"), largeur: n.getAttribute("stroke-width"),
  tirets: n.getAttribute("stroke-dasharray"), fill: n.getAttribute("fill"),
})));
const accent = (page) => page.evaluate(() =>
  getComputedStyle(document.documentElement).getPropertyValue("--accent").trim());

for (const ambiance of ["", "&ambiance=tuiles"]) {
  test("les liserés de la sélection et du parcours se lisent dans leurs attributs" +
    (ambiance ? ", en tuiles" : ""), async ({ page }) => {
    const erreurs = await prepare(page);
    // trois stands retenus, comme le plan les aurait gardés
    const retenus = DONNEES.plans[0].stands.slice(0, 3).map((s) => s.id);
    await page.addInitScript((ids) => {
      localStorage.setItem("plan-parcours:smcl-2026", JSON.stringify({ stands: ids, confs: [] }));
    }, retenus);
    // en SVG : on compare deux lectures du même bloc, sans attendre le dessin
    await page.goto("/plan?plan=smcl-2026&rendu=svg" + ambiance);
    const lignes = await attendLaListe(page);
    await expect.poll(() => page.evaluate(() => document.querySelectorAll("#marques .parc").length)).toBe(3);
    const compare = async (n) => {
      const r = await page.evaluate(() => globalThis.__essais.compareLectures(document.getElementById("marques")));
      expect(r.ecarts, JSON.stringify(r.ecarts, null, 1)).toEqual([]);
      expect(r.formes).toBeGreaterThanOrEqual(n);
    };
    const a = await accent(page);

    // un stand choisi : son liseré par-dessus ceux du parcours
    await lignes.first().click();
    await expect.poll(() => page.evaluate(() => document.querySelectorAll("#marques .sel").length)).toBe(1);
    await compare(4);
    const m = await marques(page);
    for (const p of m.filter((x) => x.sorte === "parc")) expect(p).toMatchObject({ stroke: a, largeur: "2", tirets: null, fill: "none" });
    const sel = m.find((x) => x.sorte === "sel");
    expect(sel).toMatchObject({ largeur: "3", tirets: null, fill: "none" });
    /* En Tuiles, le liseré prend la teinte de la tuile — sauf une tuile sans
       teinte, blanche, qui garde la couleur de sélection ; ailleurs, toujours
       la couleur de sélection. */
    if (ambiance) expect(sel.stroke === a || /^rgb\(\d+,\d+,\d+\)$/.test(sel.stroke), sel.stroke).toBe(true);
    else expect(sel.stroke).toBe(a);

    // une couleur réglée sur la racine : les liserés se retracent d'eux-mêmes
    await page.evaluate(() => document.documentElement.style.setProperty("--c-parc", "#123456"));
    await expect.poll(async () => (await marques(page)).filter((x) => x.sorte === "parc").map((x) => x.stroke))
      .toEqual(["#123456", "#123456", "#123456"]);
    await compare(4);

    /* Un repère mis en avant par le cartouche, ou le parcours retiré par
       l'exploitant : deux classes de la racine, et le parcours ne se trace pas
       tant qu'elles y sont. SMCL n'a pas de pastille de repère à toucher. */
    const parcs = () => page.evaluate(() => document.querySelectorAll("#marques .parc").length);
    for (const classe of ["poi-actif", "sans-parcours"]) {
      await page.evaluate((c) => document.documentElement.classList.add(c), classe);
      await expect.poll(parcs).toBe(0);
      await page.evaluate((c) => document.documentElement.classList.remove(c), classe);
      await expect.poll(parcs).toBe(3);
    }

    // une zone choisie garde son trait discontinu
    await page.keyboard.press("Escape");
    const point = await page.evaluate(() => {
      for (const g of document.querySelectorAll("#zones > g[data-id]")) {
        const r = g.getBoundingClientRect();
        if (r.width < 20 || r.height < 20) continue;
        for (const [fx, fy] of [[.5, .5], [.2, .2], [.8, .8], [.2, .8], [.8, .2]]) {
          const x = r.left + r.width * fx, y = r.top + r.height * fy;
          const e = document.elementFromPoint(x, y);
          if (e && e.closest("#zones > g") === g) return { x, y };
        }
      }
      return null;
    });
    expect(point, "une zone qu'on puisse toucher").not.toBeNull();
    {
      await page.mouse.click(point.x, point.y);
      await expect.poll(() => page.evaluate(() => document.querySelectorAll("#marques .sel.zn").length)).toBe(1);
      const zn = (await marques(page)).find((x) => x.sorte === "sel zn");
      expect(zn).toMatchObject({ largeur: "3", tirets: "5 4", fill: "none" });
      await compare(1);
    }
    expect(erreurs).toEqual([]);
  });
}

/** Les attributs des formes du trajet, par sorte. */
const formesDuTrajet = (page) => page.evaluate(() => [...document.querySelectorAll("#itin > *")].map((n) => ({
  sorte: n.getAttribute("class"), fill: n.getAttribute("fill"), stroke: n.getAttribute("stroke"),
  largeur: n.getAttribute("stroke-width"), opacite: n.hasAttribute("opacity") ? +(n.getAttribute("opacity") || 0) : null,
})));

test.describe("le trajet se lit dans ses attributs", () => {
  /* Sans mouvement, le trait paraît entier d'un coup (`REDUIT`) : on compare
     ce qu'il est une fois arrivé, et non une image de son écriture. */
  test.beforeEach(async ({ page }) => { await page.emulateMedia({ reducedMotion: "reduce" }); });

  test("d'un stand à un autre", async ({ page }) => {
    const erreurs = await prepare(page);
    // en SVG : on compare deux lectures du même bloc, sans attendre le dessin
    await page.goto("/plan?plan=smcl-2026&rendu=svg");
    const lignes = await attendLaListe(page);
    await lignes.nth(0).click();
    await page.locator("#dItin, #dItinIco").locator("visible=true").first().click();
    await expect(page.locator("#viseur")).toBeVisible();
    const autre = await standAViser(page, { sauf: await page.inputValue("#iArrivee") });
    expect(autre, "un autre stand à toucher sur le plan").not.toBeNull();
    await page.mouse.click(autre.x, autre.y);
    await expect(page.locator("#iResume")).toContainText("m ·", { timeout: 30_000 });
    await expect.poll(() => page.evaluate(() => document.querySelectorAll("#itin .iBout").length)).toBe(2);

    const compare = async () => {
      const r = await page.evaluate(() => globalThis.__essais.compareLectures(document.getElementById("itin")));
      expect(r.ecarts, JSON.stringify(r.ecarts, null, 1)).toEqual([]);
      expect(r.formes).toBeGreaterThan(4);
    };
    await compare();
    const a = await accent(page);
    const f = await formesDuTrajet(page);
    expect(f.find((x) => x.sorte === "iLueur l1")).toMatchObject({ fill: "none", stroke: a, largeur: "24", opacite: .1 });
    expect(f.find((x) => x.sorte === "iLueur l2")).toMatchObject({ stroke: a, largeur: "12", opacite: .2 });
    // le fil va du clair au foncé de la couleur du salon, tronçon par tronçon
    const traits = f.filter((x) => x.sorte === "iTrait");
    expect(traits.length).toBeGreaterThan(1);
    for (const t of traits) expect(t.stroke).toMatch(/^color-mix\(in srgb, #[0-9A-Fa-f]{6} \d+%, #[0-9A-Fa-f]{6}\)$/);
    expect(new Set(traits.map((t) => t.stroke)).size).toBeGreaterThan(1);
    // le départ plein, l'arrivée cerclée
    const surface = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--surface").trim());
    expect(f.find((x) => x.sorte === "iBout")).toMatchObject({ fill: a, stroke: surface, largeur: "2.5", opacite: null });
    expect(f.find((x) => x.sorte === "iBout fin")).toMatchObject({ fill: surface, stroke: a, largeur: "2.5", opacite: null });

    // l'accent changé : le trajet se repeint de lui-même
    await page.evaluate(() => document.documentElement.style.setProperty("--accent", "#123456"));
    await expect.poll(async () => (await formesDuTrajet(page)).find((x) => x.sorte === "iLueur l1").stroke).toBe("#123456");
    await compare();
    expect(erreurs).toEqual([]);
  });

  test("une journée organisée, ses étapes numérotées", async ({ page }) => {
    const erreurs = await prepare(page);
    // quatre stands retenus, comme le plan les aurait gardés
    const retenus = DONNEES.plans[0].stands.slice(0, 4).map((s) => s.id);
    await page.addInitScript((ids) => {
      localStorage.setItem("plan-parcours:smcl-2026", JSON.stringify({ stands: ids, confs: [] }));
    }, retenus);
    await page.goto("/plan?plan=smcl-2026&rendu=svg");
    await attendLaListe(page);
    await page.click("#btnParcours");
    await page.click("#btnJournee");
    await page.locator("#modale.open").getByRole("button", { name: "Organiser", exact: true }).click();
    await expect.poll(() => page.evaluate(() => document.querySelectorAll("#itin .iNum").length), { timeout: 30_000 })
      .toBeGreaterThan(1);

    const r = await page.evaluate(() => globalThis.__essais.compareLectures(document.getElementById("itin")));
    expect(r.ecarts, JSON.stringify(r.ecarts, null, 1)).toEqual([]);
    const a = await accent(page);
    const surface = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--surface").trim());
    const f = await formesDuTrajet(page);
    // seule la prochaine étape est pleine, son chiffre en blanc ; les autres cerclées
    expect(f.filter((x) => x.sorte === "iBout num proche")).toEqual([
      expect.objectContaining({ fill: a, stroke: surface })]);
    for (const b of f.filter((x) => x.sorte === "iBout num")) expect(b).toMatchObject({ fill: surface, stroke: a });
    expect(f.find((x) => x.sorte === "iNum proche")).toMatchObject({ fill: surface });
    for (const n of f.filter((x) => x.sorte === "iNum")) expect(n).toMatchObject({ fill: a });
    expect(erreurs).toEqual([]);
  });

  /* La prochaine étape est pleine de la couleur du salon, et son chiffre s'y
     écrit en blanc — conférence comprise : la feuille lui gardait la couleur
     du salon, et le chiffre disparaissait dans sa propre pastille. */
  test("une conférence pour prochaine étape garde son chiffre lisible", async ({ page }) => {
    const erreurs = await prepare(page);
    const corps = avecUnProgramme();
    await page.route("**/api/plan*", (r) => new URL(r.request().url()).searchParams.get("entete")
      ? r.fulfill({ json: { v: "essai-conference" } })
      : r.fulfill({ status: 200, contentType: "application/json", headers: { "X-Version": "essai-conference" }, body: corps }));
    // le matin de la conférence, avant qu'elle commence : la journée est à venir
    await page.clock.setFixedTime(new Date("2026-03-14T07:30:00Z"));
    /* La conférence et un stand ; arrivé cinq minutes avant elle, on n'a le
       temps de rien d'autre : elle est la première étape, le stand vient après. */
    await page.addInitScript((stand) => {
      localStorage.setItem("plan-parcours:smcl-2026", JSON.stringify({ stands: [stand], confs: ["essai-visite"] }));
      localStorage.setItem("plan-journee-arrivee", "09:55");
    }, DONNEES.plans[0].stands[0].id);
    await page.goto("/plan?plan=smcl-2026&rendu=svg");
    await attendLaListe(page);
    await page.click("#btnParcours");
    await page.click("#btnJournee");
    await page.locator("#modale.open").getByRole("button", { name: "Organiser", exact: true }).click();
    await expect.poll(() => page.evaluate(() => document.querySelectorAll("#itin .iNum.conf.proche").length), { timeout: 30_000 })
      .toBe(1);
    const f = await formesDuTrajet(page);
    const bout = f.find((x) => x.sorte === "iBout num conf proche"), chiffre = f.find((x) => x.sorte === "iNum conf proche");
    expect(bout.fill).toBe(await accent(page));
    expect(chiffre.fill, "le chiffre ne doit pas prendre la couleur de sa pastille").not.toBe(bout.fill);
    const r = await page.evaluate(() => globalThis.__essais.compareLectures(document.getElementById("itin")));
    expect(r.ecarts, JSON.stringify(r.ecarts, null, 1)).toEqual([]);
    expect(erreurs).toEqual([]);
  });
});
