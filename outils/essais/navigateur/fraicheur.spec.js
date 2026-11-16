/**
 * Le dessin n'est jamais en retard sur ce que la page vient de faire.
 *
 * Il ne guette plus le SVG caché : chaque bloc du plan lui dit ce qui y
 * change — les emplacements par leur modèle, l'habillage par son réglage, les
 * calques dessinés par leurs données, la scène par ses jeux, l'ordre des
 * couches par la pile. Un module qui changerait le plan sans le dire ne ferait
 * aucune erreur : il laisserait à l'écran un dessin périmé, que rien ne
 * signalerait. L'essai fait donc ce que fait un visiteur — changer de
 * pavillon, chercher, ouvrir une fiche, la fermer, mettre un point d'intérêt
 * en avant — et, après chaque geste, compare ce que le dessin peint à ce
 * qu'il peindrait s'il reconvertissait tout.
 */
const { test, expect } = require("@playwright/test");
const { prepare, attendLaListe, DONNEES } = require("./aide.js");

const PIXEL = "data:image/png;base64," +
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

/** Ce que le dessin peint : chaque couche, le nombre de ses éléments, et une
 *  somme de toutes leurs coordonnées et de leurs couleurs — un point déplacé,
 *  une teinte changée la font bouger. */
function peint() {
  const GL = /** @type {any} */ (globalThis).__essais.GL;
  const somme = (x, prof = 0) => typeof x === "number" ? x : Array.isArray(x) && prof < 4
    ? x.reduce((t, y, i) => t + (i + 1) * somme(y, prof + 1), 0) : 0;
  const elt = (d) => !d || typeof d !== "object" ? 0 :
    somme(d.polygon) + somme(d.path) + somme(d.position) + somme(d.couleur) + somme(d.bornes) + (d.taille || 0);
  return (GL.deck.props.layers || []).flat(Infinity).filter(Boolean)
    // ce qui bat ou se déplace d'une image à l'autre n'a pas à se comparer
    .filter((c) => !/-(phare|lueur|hausse|survol|focus|tuile)/.test(c.id))
    .map((c) => c.id + ":" + (Array.isArray(c.props.data)
      ? c.props.data.length + ":" + Math.round(c.props.data.reduce((t, d) => t + elt(d), 0) * 100) / 100 : ""));
}

/** Attend que le dessin se soit tu, puis relève ce qu'il peint ; puis le
 *  fait tout reconvertir — une classe posée sur la racine, que la feuille ne
 *  regarde pas — et relève encore. */
async function compare(page, geste) {
  /* Rien en attente de peinture, et la vue immobile depuis une demi-seconde :
     une fiche recadre le plan, et ce qui garde sa taille à l'écran — la
     pointe d'une flèche — ne se refait qu'à la fin du mouvement. */
  const calme = () => page.waitForFunction(() => {
    const E = /** @type {any} */ (globalThis).__essais, v = E.view, k = v ? [v.x, v.y, v.w].join() : "";
    const t = performance.now(), m = /** @type {any} */ (globalThis).__calme || (globalThis.__calme = { k: "", t });
    if (m.k !== k){ m.k = k; m.t = t; }
    return !E.GL.image && t - m.t > 500;
  }, null, { timeout: 15_000, polling: 100 }).then(() => page.waitForTimeout(200));
  await calme();
  const avant = await page.evaluate(peint);
  await page.evaluate(() => document.documentElement.classList.toggle("essai-fraicheur"));
  await calme();
  const apres = await page.evaluate(peint);
  await page.evaluate(() => document.documentElement.classList.remove("essai-fraicheur"));
  const ecarts = avant.filter((x) => !apres.includes(x)).concat(apres.filter((x) => !avant.includes(x)));
  expect(ecarts, "après « " + geste + " », le dessin était en retard :\n" + ecarts.slice(0, 8).join("\n")).toEqual([]);
}

test("le dessin suit chaque geste du visiteur sans qu'on le relance", async ({ page }) => {
  test.setTimeout(180_000);
  const erreurs = await prepare(page);
  const donnees = JSON.parse(JSON.stringify(DONNEES));
  const hote = donnees.plans[0].stands[0].id;
  donnees.plans[0].dessins = [{ id: "c1", nom: "Repères", visible: true, rempli: true, couleur: "#16a085", formes: [
    { id: "r1", t: "repere", pts: [[-6790, 8820]], picto: "wc", taille: 2 },
    { id: "r2", t: "repere", pts: [[-6770, 8820]], picto: "", txt: "Accueil", taille: 2 },
    { id: "s1", t: "stand", pts: [[-6800, 8840], [-6792, 8846]], stand: hote, soc: -1 },
    { id: "i1", t: "image", src: PIXEL, pts: [[-6780, 8840], [-6774, 8844]], stand: hote, soc: -1 },
    { id: "l1", t: "ligne", pts: [[-6800, 8850], [-6780, 8850]], fleche: "fin" },
  ] }];
  await page.route("**/api/plan*", (r) => new URL(r.request().url()).searchParams.get("entete")
    ? r.fulfill({ json: { v: "essai-fraicheur" } })
    : r.fulfill({ status: 200, contentType: "application/json",
                  headers: { "X-Version": "essai-fraicheur" }, body: JSON.stringify(donnees) }));
  await page.goto("/plan?plan=smcl-2026");
  const lignes = await attendLaListe(page);
  const webgl = await page.waitForFunction(() => /** @type {any} */ (globalThis).__essais.GL.pret, null, { timeout: 20_000 })
    .then(() => true, () => false);
  test.skip(!webgl, "pas de carte graphique : le SVG peint lui-même ce qu'il porte");
  await compare(page, "l'arrivée du plan");

  // une recherche, puis son effacement : le retrait du filtre sur les stands et les stands dessinés
  const numero = (await lignes.first().innerText()).trim().split(/\s+/)[0];
  await page.fill("#q", numero);
  await compare(page, "une recherche");
  await page.fill("#q", "");
  await compare(page, "la recherche effacée");

  // une fiche ouverte depuis la liste, puis refermée : la sélection, au stand et au stand dessiné
  await lignes.first().click();
  await expect(page.locator("#detail")).toHaveClass(/open/);
  await compare(page, "une fiche ouverte");
  await page.keyboard.press("Escape");
  await compare(page, "la fiche refermée");

  // un point d'intérêt mis en avant par le cartouche, puis relâché
  const poi = page.locator("#poi button").first();
  if (await poi.count()) {
    await poi.click();
    await compare(page, "un point d'intérêt mis en avant");
    await poi.click();
    await compare(page, "le point d'intérêt relâché");
  }

  // un autre pavillon, et son habillage qui arrive
  const onglets = page.locator("#halls button");
  if (await onglets.count() > 1) {
    await onglets.nth(1).click();
    await compare(page, "un autre pavillon");
    await onglets.nth(0).click();
    await compare(page, "le retour au premier pavillon");
  }
  expect(erreurs).toEqual([]);
});
