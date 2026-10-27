/**
 * Les logos sur les stands, vus de près, dans les ambiances à plat.
 *
 * Rien ne sort sur le réseau : les données sont celles de `plans.json`, chaque
 * stand y reçoit une clé de vignette, et le lot de vignettes est une image
 * fabriquée par la page même.
 */
const { test, expect } = require("@playwright/test");
const { prepare, attendLaListe, DONNEES } = require("./aide");

// le service worker relaierait le lot de vignettes hors de l'interception
test.use({ serviceWorkers: "block" });

/** Le plan public, logos demandés, de près sur le premier stand de la liste.
 *  Rend les erreurs relevées, ou rien sans carte graphique. Sans `grandes`,
 *  l'API n'a de grande pour aucun logo — un salon que la synchronisation n'a
 *  pas refait — et le toit pose la petite, que la page détoure. `conf`, le
 *  réglage du salon tel que l'exploitant l'a laissé sur ce poste. */
async function deP(page, ambiance, grandes = false, conf = null) {
  const erreurs = await prepare(page);
  if (conf) await page.addInitScript((c) => localStorage.setItem("plan-conf:smcl-2026", c), JSON.stringify(conf));
  /* Les vignettes se peignent sur la page vierge où l'essai commence : y
     charger d'abord la démonstration coûtait vingt secondes de carte
     graphique logicielle, sur un essai qui en passe déjà plus d'une minute à
     amener ses logos. */
  // des vignettes rouges sur fond blanc, que le détourage laisse rouges, de
  // largeurs différentes : sept logos qui ne se confondent pas sur la planche
  const webps = await page.evaluate(() => Array.from({ length: 7 }, (_, k) => {
    const c = document.createElement("canvas"); c.width = 60 + 20 * k; c.height = 40;
    const x = /** @type {CanvasRenderingContext2D} */ (c.getContext("2d"));
    x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, 40);
    x.fillStyle = "#c00"; x.fillRect(10, 8, c.width - 20, 24);
    return c.toDataURL("image/webp").split(",")[1];
  }));
  // la grande telle que la synchronisation la fait : déjà sans fond
  const grande = Buffer.from(await page.evaluate(() => {
    const c = document.createElement("canvas"); c.width = 200; c.height = 60;
    const x = /** @type {CanvasRenderingContext2D} */ (c.getContext("2d"));
    x.fillStyle = "#c00"; x.fillRect(16, 12, 168, 36);
    return c.toDataURL("image/png").split(",")[1];
  }), "base64");
  const donnees = JSON.parse(JSON.stringify(DONNEES));
  donnees.plans[0].stands.forEach((s, i) => { s.vignette = (i % 7).toString(16).padStart(8, "a"); });
  await page.route((u) => u.pathname === "/api/plan", (r) => {
    const u = new URL(r.request().url()), lot = u.searchParams.get("vignettes");
    if (lot) return r.fulfill({ json: Object.fromEntries(lot.split(",").map((k) => [k, webps[parseInt(k, 16) % 7]])) });
    if (u.searchParams.get("grande")) {
      return grandes ? r.fulfill({ contentType: "image/png", body: grande })
        : r.fulfill({ status: 404, body: "Pas de grande vignette." });
    }
    if (u.searchParams.get("entete")) return r.fulfill({ json: { v: "essai-logos" } });
    return r.fulfill({ status: 200, contentType: "application/json",
                       headers: { "X-Version": "essai-logos" }, body: JSON.stringify(donnees) });
  });
  await page.goto("/plan.html?plan=smcl-2026&logos=1&ambiance=" + ambiance);
  await attendLaListe(page);
  const webgl = await page.waitForFunction(() => window.__essais.GL.deck, null, { timeout: 15_000 })
    .then(() => true, () => false);
  if (!webgl) return null;
  // ouvrir un stand le cadre de près ; un cran de plus passe le seuil des logos
  await page.locator("#list .row").first().click();
  await page.waitForTimeout(1500);
  await page.evaluate(() => document.getElementById("zIn").click());
  return erreurs;
}

/* Chaque logo attend son détourage par le travailleur, puis une image pour
   se poser ; sous la carte graphique logicielle de l'intégration, une image
   prend plusieurs secondes, et sept logos deux à deux en font une douzaine. */
const ATTENTE_LOGOS = 40_000;

/** La couche des logos, une fois posée : chaque logo, et la case qu'il lit.
 *  Avec `distincts`, une fois qu'elle en pose autant de différents — les logos
 *  paraissent à mesure qu'ils sont prêts, et la première pose peut n'en
 *  montrer qu'un. */
const logosPoses = (page, distincts = 1) => page.waitForFunction((n) => {
  const d = window.__essais.GL.deck;
  const c = (d.props.layers || []).flat(Infinity).filter(Boolean).find((l) => l.id === "logos-stands");
  if (!c || new Set(c.props.data.map((e) => e.t.dataset.cle)).size < n) return false;
  // une toile : la planche refaite à chaque pose ; une texture : la planche gardée
  const gardee = !(c.props.texture instanceof HTMLCanvasElement);
  return c.props.data.map((e) => ({ z: e.z, cle: e.t.dataset.cle, cas: c.props.getCaseLogo(e), gardee }));
}, distincts, { timeout: ATTENTE_LOGOS }).then((h) => h.jsonValue());

/* En classique seulement. La couche des logos est la même dans toutes les
   ambiances, et la variante en tuiles n'éprouvait rien de plus : elle payait
   seulement le dessin des tuiles sous la carte graphique logicielle de
   l'intégration, deux minutes et demie contre moins d'une, au bord du délai
   qu'elle finissait par passer. */
test("le logo prend la place du nom", async ({ page }) => {
  test.setTimeout(150_000);
  const erreurs = await deP(page, "classique");
  test.skip(!erreurs, "pas de carte graphique : le plan reste en SVG, et ses noms");

  // un logo posé, à plat, se laisse viser là où il est peint
  const vise = await page.waitForFunction(() => {
    const d = window.__essais.GL.deck, vp = d.getViewports()[0];
    const c = (d.props.layers || []).flat(Infinity).filter(Boolean).find((l) => l.id === "logos-stands");
    if (!c || !c.props.data.length || !vp) return false;
    const plan = document.getElementById("plan").getBoundingClientRect();
    for (const e of c.props.data) {
      const [x, y] = vp.project([e.x, e.y, e.z]);
      if (x < 40 || y < 40 || x > plan.width - 40 || y > plan.height - 40) continue;
      return { z: e.z, pris: Boolean(d.pickObject({ x, y, radius: 2, layerIds: ["logos-stands"] })) };
    }
    return false;
  }, null, { timeout: ATTENTE_LOGOS }).then((h) => h.jsonValue());
  expect(vise).toEqual({ z: 0, pris: true });
  expect(erreurs).toEqual([]);
});

/* Bien au-delà du seuil, le nom d'un stand couvert par son logo n'est plus
   mesuré : chaque pose le remesurait pour le taire aussitôt. Repassé sous le
   seuil, logos encore posés, il revient — le stand ne reste pas vide. */
test("de près, le nom couvert par son logo ne se mesure plus", async ({ page }) => {
  test.setTimeout(180_000);
  const erreurs = await deP(page, "classique");
  test.skip(!erreurs, "pas de carte graphique");
  const zoom = () => page.evaluate(() => window.__essais.GL.deck.props.viewState.zoom);
  // le seuil d'un bureau : douze pixels par mètre
  const SEUIL = Math.log2(12);
  const poses = () => page.evaluate(() => {
    const c = (window.__essais.GL.deck.props.layers || []).flat(Infinity).filter(Boolean).find((l) => l.id === "logos-stands");
    return c ? c.props.data.map((e) => e.id) : [];
  });
  const nommes = (ids) => page.evaluate((ids) => window.__essais.GL.libelles
    .filter((d) => ids.includes(d.lbl) && d.cls.startsWith("nm")).map((d) => d.lbl), ids);

  while (await zoom() < SEUIL + .75) {
    await page.evaluate(() => document.getElementById("zIn").click());
    await page.waitForTimeout(800);
  }
  await logosPoses(page);
  await page.waitForTimeout(1000);
  const ids = await poses();
  expect(ids.length).toBeGreaterThan(0);
  expect(await nommes(ids)).toEqual([]);

  while (await zoom() >= SEUIL) {
    await page.evaluate(() => document.getElementById("zOut").click());
    await page.waitForTimeout(800);
  }
  // logos encore posés, et leurs noms revenus
  await page.waitForFunction(() => {
    const c = (window.__essais.GL.deck.props.layers || []).flat(Infinity).filter(Boolean).find((l) => l.id === "logos-stands");
    if (!c || !c.props.data.length) return false;
    const ids = c.props.data.map((e) => e.id);
    return window.__essais.GL.libelles.some((d) => ids.includes(d.lbl) && d.cls.startsWith("nm"));
  }, null, { timeout: ATTENTE_LOGOS });
  expect(erreurs).toEqual([]);
});

/* Reculé sous le seuil, plus aucun logo n'est posé et leurs toiles sont
   oubliées ; revenu au même endroit, elles se refont sous les mêmes clés. La
   planche gardée d'avant rangeait ses cases par toile : les neuves n'y
   trouvaient plus la leur, et chaque stand peignait la planche entière — tous
   les logos des environs, en réduction, sur chacun. */
test("revenu de loin, chaque logo lit sa case et non la planche entière", async ({ page }) => {
  test.setTimeout(180_000);
  const erreurs = await deP(page, "classique");
  test.skip(!erreurs, "pas de carte graphique");
  const avant = await logosPoses(page, 2);
  expect(new Set(avant.map((l) => l.cle)).size).toBeGreaterThan(1);

  const zoom = () => page.evaluate(() => window.__essais.GL.deck.props.viewState.zoom);
  const z0 = await zoom();
  /* Les crans s'enchaînent sur la vue visée (`vue.mjs` `zoom`) : une rafale
     ne coûte qu'un glissement, quand chaque cran attendu à part coûtait ici
     une image du plan entier, de dix secondes et plus. Six crans de 1,33
     passent sous le seuil des logos d'un bureau (douze pixels par mètre, un
     demi-cran de marge), et six de 0,75 ramènent au même zoom, à deux
     centièmes près. */
  const CRANS = 6;
  const rafale = (id) => page.evaluate(([b, n]) => { for (let i = 0; i < n; i++) document.getElementById(b).click(); }, [id, CRANS]);
  await rafale("zOut");
  await page.waitForFunction(() => {
    const d = window.__essais.GL.deck;
    return !(d.props.layers || []).flat(Infinity).filter(Boolean).some((l) => l.id === "logos-stands");
  }, null, { timeout: ATTENTE_LOGOS })
    .catch(async () => { throw new Error("des logos encore posés au zoom " + await zoom()); });
  await rafale("zIn");
  await page.waitForFunction((z) => Math.abs(window.__essais.GL.deck.props.viewState.zoom - z) < .05, z0, { timeout: 20_000 })
    .catch(async () => { throw new Error("zoom " + await zoom() + " au lieu de " + z0); });
  await page.waitForTimeout(1000);

  const apres = await logosPoses(page);
  for (const l of apres) expect(l.cas, l.cle).not.toEqual([0, 0, 1, 1]);
  // gardée sur la carte graphique, la planche n'est pas refaite à chaque pose
  expect(apres[0].gardee).toBe(true);
  expect(erreurs).toEqual([]);
});

/* Au repos, rien ne se redemande. Les grandes des abords se préchargeaient,
   le budget des vignettes décodées les libérait aussitôt, et la pose suivante
   les redemandait : sans le moindre geste, la boucle tournait tant que la vue
   restait de près — 12 182 grandes reçues en six minutes pour les 226 logos
   de fep27, et près de la moitié du temps figé (sonde, 22 octobre 2026).
   Ici, une clé par stand et des grandes assez lourdes pour qu'une quinzaine
   remplisse le budget. */
test("au repos, les grandes des abords ne se redemandent pas sans fin", async ({ page }) => {
  test.setTimeout(240_000);
  const erreurs = await prepare(page);
  const grande = Buffer.from(await page.evaluate(() => {
    const c = document.createElement("canvas"); c.width = 1200; c.height = 1200;
    const x = /** @type {CanvasRenderingContext2D} */ (c.getContext("2d"));
    // le fond transparent : une grande telle que la synchronisation la détoure
    x.fillStyle = "#c00"; x.fillRect(100, 100, 1000, 1000);
    return c.toDataURL("image/png").split(",")[1];
  }), "base64");
  const petite = await page.evaluate(() => {
    const c = document.createElement("canvas"); c.width = 80; c.height = 40;
    const x = /** @type {CanvasRenderingContext2D} */ (c.getContext("2d"));
    x.fillStyle = "#fff"; x.fillRect(0, 0, 80, 40); x.fillStyle = "#c00"; x.fillRect(10, 8, 60, 24);
    return c.toDataURL("image/webp").split(",")[1];
  });
  const donnees = JSON.parse(JSON.stringify(DONNEES));
  /* Un stand sur six porte un logo : assez pour déborder le budget, assez peu
     pour que le premier chargement finisse vite sous une carte graphique
     logicielle — la boucle ne tourne qu'une fois les abords arrivés. */
  donnees.plans[0].stands.forEach((s, i) => { if (i % 6 === 0) s.vignette = (i + 1).toString(16).padStart(8, "b"); });
  /** @type {Map<string, number>} */
  const demandes = new Map();
  await page.route((u) => u.pathname === "/api/plan", (r) => {
    const u = new URL(r.request().url()), lot = u.searchParams.get("vignettes"), g = u.searchParams.get("grande");
    if (lot) return r.fulfill({ json: Object.fromEntries(lot.split(",").map((k) => [k, petite])) });
    if (g) {
      demandes.set(g, (demandes.get(g) || 0) + 1);
      return r.fulfill({ contentType: "image/png", body: grande });
    }
    if (u.searchParams.get("entete")) return r.fulfill({ json: { v: "essai-boucle" } });
    return r.fulfill({ status: 200, contentType: "application/json",
                       headers: { "X-Version": "essai-boucle" }, body: JSON.stringify(donnees) });
  });
  await page.goto("/plan.html?plan=smcl-2026&logos=1&ambiance=classique");
  await attendLaListe(page);
  const webgl = await page.waitForFunction(() => window.__essais.GL.deck, null, { timeout: 15_000 })
    .then(() => true, () => false);
  test.skip(!webgl, "pas de carte graphique");
  await page.locator("#list .row").first().click();
  await page.waitForTimeout(1500);
  await page.evaluate(() => document.getElementById("zIn").click());
  await logosPoses(page);

  // le temps que les grandes des abords arrivent ; ensuite, plus rien ne bouge
  const recues = () => page.evaluate(() => window.__essais.COMPTES_LOGOS.vignettesRecues);
  await page.waitForTimeout(25_000);
  const avant = await recues();
  await page.waitForTimeout(20_000);
  const apres = await recues();
  const pire = Math.max(...demandes.values());
  expect(apres - avant, "grandes reçues pendant vingt secondes sans geste").toBeLessThanOrEqual(2);
  expect(pire, "une même grande redemandée").toBeLessThanOrEqual(2);
  expect(erreurs).toEqual([]);
});

/* La grande arrive détourée de la synchronisation : le toit la pose telle
   quelle, sans repasser par le détourage de la page — qui, deux logos à la
   fois, faisait paraître un à un la centaine de stands d'un écran de
   bureau. */
test("la grande arrivée sans fond se pose telle quelle", async ({ page }) => {
  test.setTimeout(150_000);
  const erreurs = await deP(page, "classique", true);
  test.skip(!erreurs, "pas de carte graphique");
  const poses = await logosPoses(page);
  for (const l of poses) expect(l.cle, "la grande, et non la petite").toContain("+g@");
  expect(erreurs).toEqual([]);
});

/* L'exploitant tourne un logo depuis l'outil de placement (`placement-libelles.mjs`).
   Tourné d'un quart de tour, un logo plus large que profond se vise au-dessus
   de son centre, là où sa largeur passe désormais, et non plus à côté — la
   carte graphique a bien reçu l'angle, et la visée le suit. */
test("un logo tourné d'un quart de tour se pose en travers", async ({ page }) => {
  test.setTimeout(150_000);
  // l'empreinte que `libelle-place.mjs` `empreinteLogo` relit, pour chaque stand
  const conf = Object.fromEntries(DONNEES.plans[0].stands.map((s) => ["_logo:" + s.id,
    { dx: 0, dy: 0, k: 1, a: 90, e: [s.c[0], s.c[1], s.bb[0], s.bb[1]].map((v) => (+v).toFixed(2)).join("|") }]));
  const erreurs = await deP(page, "classique", true, conf);
  test.skip(!erreurs, "pas de carte graphique");
  await logosPoses(page);
  const vise = await page.evaluate(() => {
    const d = window.__essais.GL.deck, vp = d.getViewports()[0];
    const c = (d.props.layers || []).flat(Infinity).filter(Boolean).find((l) => l.id === "logos-stands");
    const plan = document.getElementById("plan").getBoundingClientRect();
    const sous = (/** @type {number[]} */ p) => {
      const [x, y] = vp.project(p);
      const o = d.pickObject({ x, y, radius: 0, layerIds: ["logos-stands"] });
      return o && o.object ? o.object.id : null;
    };
    for (const e of c.props.data) {
      const m = c.props.getTransformMatrix(e);
      const large = Math.hypot(m[0], m[1]), prof = Math.hypot(m[4], m[5]);
      const [x, y] = vp.project([e.x, e.y, e.z]);
      if (large < 1.6 * prof || x < 80 || y < 80 || x > plan.width - 80 || y > plan.height - 80) continue;
      // aux quatre dixièmes de sa largeur : dedans en travers, dehors à plat
      const loin = .4 * large;
      return { centre: sous([e.x, e.y, e.z]) === e.id,
               enTravers: sous([e.x, e.y + loin, e.z]) === e.id,
               aPlat: sous([e.x + loin, e.y, e.z]) === e.id };
    }
    return null;
  });
  expect(vise).toEqual({ centre: true, enTravers: true, aPlat: false });
  expect(erreurs).toEqual([]);
});
