/**
 * Les fenêtres de l'administration qui en remplacent une autre, puis y
 * ramènent.
 *
 * La fenêtre commune est une seule : celle qui s'ouvre prend la place de la
 * précédente. Un bouton qui rouvre la fenêtre d'où l'on venait doit donc dire
 * qu'il ne ferme pas (`ferme: false`), ou fermer avant de rouvrir — sans quoi
 * la fermeture qui suit son action emporte ce qu'il vient d'ouvrir, et il ne
 * reste que le plan.
 *
 * La session de l'exploitant et la base sont simulées : rien ne sort.
 */
const { test, expect } = require("@playwright/test");
const { prepare, attendLaListe } = require("./aide");

const BASE = "https://base.essai";

/** Le plan d'administration, une session admise et une base qui acquitte. */
async function ouvreAdmin(page, requete = "") {
  const erreurs = await prepare(page);
  await page.addInitScript((base) => {
    localStorage.setItem("console-config", JSON.stringify({ url: base, anonKey: "anon" }));
    localStorage.setItem("console-session", JSON.stringify({ access_token: "a.b.c" }));
  }, BASE);
  await page.route(BASE + "/**", (r) => {
    const req = r.request();
    const url = new URL(req.url());
    if (url.pathname === "/auth/v1/user") return r.fulfill({ json: { id: "u1" } });
    if (url.pathname === "/rest/v1/evenement") return r.fulfill({ json: [{ id: "e1" }] });
    // les compteurs à effacer : sans eux, la remise à zéro se dit illisible
    if (url.pathname === "/rest/v1/rpc/rapport_utilisation") {
      return r.fulfill({ json: { depuis: "2026-01-01", visites: 3, visiteurs: 2,
                                 recherches: 1, stands: { total: 4 } } });
    }
    if (req.method() !== "GET") return r.fulfill({ status: 204, body: "" });
    return r.fulfill({ json: [] });
  });
  await page.goto("/plan-admin.html?plan=smcl-2026" + requete);
  await attendLaListe(page);
  return erreurs;
}

const fenetre = (page) => page.locator("#modale");

test.describe("les fenêtres qui ramènent d'où l'on vient", () => {
  test("« Annuler » la remise à zéro ramène sur l'onglet Statistiques", async ({ page }) => {
    const erreurs = await ouvreAdmin(page);
    await page.locator("#btnReglages").click();
    await page.locator(".ongReg button", { hasText: "Statistiques" }).click();
    await page.locator(".voletReg:not([hidden]) button", { hasText: "Réinitialiser les compteurs" }).click();
    await expect(page.locator("#mTitre")).toHaveText("Réinitialiser les compteurs");

    await page.locator("#mPied button", { hasText: "Annuler" }).click();
    // la fenêtre des réglages rouverte restait fermée : l'action rouvrait, le pied refermait
    await expect(fenetre(page)).toHaveClass(/\bopen\b/);
    await expect(page.locator("#mTitre")).toHaveText("Réglages du plan");
    await expect(page.locator(".ongReg button[aria-pressed=true]")).toHaveText("Statistiques");
    expect(erreurs).toEqual([]);
  });

  for (const geste of ["Valider", "Entrée", "Annuler"]) {
    test("renommer un calque depuis l'ordre des calques y ramène (" + geste + ")", async ({ page }) => {
      const erreurs = await ouvreAdmin(page);
      await page.locator("#btnLayers").click();
      await page.locator("#pile button.ajout", { hasText: "Nouveau calque" }).click();
      await page.locator("#mPied button", { hasText: "Valider" }).click();
      await expect(fenetre(page)).not.toHaveClass(/\bopen\b/);

      await page.locator("#pile button.reorg").click();
      await page.locator("#mCorps .ordre button.crayon").first().click();
      await expect(page.locator("#mTitre")).toHaveText("Renommer le calque");
      const champ = page.locator("#mCorps input.nomcalque");
      await champ.fill("Signalétique");
      if (geste === "Entrée") await champ.press("Enter");
      else await page.locator("#mPied button", { hasText: geste }).click();

      await expect(fenetre(page)).toHaveClass(/\bopen\b/);
      await expect(page.locator("#mTitre")).toHaveText("Ordre des calques");
      // renoncer ramène aussi, sans rien renommer
      await expect(page.locator("#mCorps .ordre .nom", { hasText: "Signalétique" }))
        .toHaveCount(geste === "Annuler" ? 0 : 1);
      expect(erreurs).toEqual([]);
    });
  }

  /* Un nom d'exposant ne se traduit jamais — mais la protection valait pour
     toute la page, et une enseigne nommée « Recherche » retenait l'onglet des
     réglages en français. */
  test("une enseigne qui porte le nom d'un onglet ne le garde pas en français", async ({ page }) => {
    const erreurs = await ouvreAdmin(page, "&lang=en");
    await page.evaluate(() => window.LANGUE.protege(["Recherche"]));
    await page.locator("#btnReglages").click();
    await expect(page.locator(".ongReg button", { hasText: /^Search$/ })).toHaveCount(1);
    await expect(page.locator(".ongReg button", { hasText: /^Recherche$/ })).toHaveCount(0);
    // ailleurs, le nom reste protégé
    expect(await page.evaluate(() => window.LANGUE.traduit("Recherche"))).toBe("Recherche");
    expect(erreurs).toEqual([]);
  });
});

/* La boîte à outils du dessin flotte sur le coin du plan : ce qui s'y trouve ne
   se choisissait ni ne se traçait, le clic tombant sur elle. Elle se replie à
   la main, et d'elle-même quand la forme qu'on édite passe dessous. */
test.describe("la boîte à outils du dessin", () => {
  async function ouvreCalque(page, requete = "") {
    const erreurs = await ouvreAdmin(page, requete);
    await page.locator("#btnLayers").click();
    await page.locator("#pile button.ajout", { hasText: "Nouveau calque" }).click();
    await page.locator("#mPied button", { hasText: "Valider" }).click();
    await expect(page.locator("#outils")).toHaveClass(/\bopen\b/);
    return erreurs;
  }
  const boite = (page) => page.locator("#outils").evaluate(e => {
    const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height };
  });

  test("se replie à la main, et rend le coin qu'elle couvrait", async ({ page }) => {
    const erreurs = await ouvreCalque(page);
    const b = await boite(page);
    const x = b.x + b.w / 2, y = b.y + b.h * 0.75;
    await page.locator("#replieOutils").click();
    await expect(page.locator("#outils")).toHaveClass(/\breplie\b/);
    expect(await page.evaluate(([x, y]) => !document.elementFromPoint(x, y).closest("#outils"), [x, y]))
      .toBe(true);
    await page.locator("#replieOutils").click();
    await expect(page.locator("#outils")).not.toHaveClass(/\breplie\b/);
    expect(erreurs).toEqual([]);
  });

  /* En SVG : le repli ne lit que les poignées, tracées en SVG dans les deux
     rendus, et le WebGL logiciel des essais coûte une minute à ce geste. */
  test("se replie quand la forme qu'on déplace passe dessous", async ({ page }) => {
    const erreurs = await ouvreCalque(page, "&rendu=svg");
    const b = await boite(page);
    // un rectangle à droite de la boîte, puis glissé sous elle
    const x0 = b.x + b.w + 80, y0 = b.y + b.h / 2;
    await page.locator('#outils .outilsBtns button[data-o="rect"]').click();
    await page.mouse.move(x0, y0);
    await page.mouse.down();
    await page.mouse.move(x0 + 60, y0 + 40, { steps: 3 });
    await page.mouse.up();
    await page.locator('#outils .outilsBtns button[data-o="main"]').click();
    await page.mouse.move(x0 + 30, y0 + 20);
    await page.mouse.down();
    await page.mouse.move(b.x + b.w / 2, y0 + 20, { steps: 3 });
    await page.mouse.up();
    await expect(page.locator("#outils")).toHaveClass(/\breplie\b/);
    expect(erreurs).toEqual([]);
  });
});

/* Dessiner sur un calque, placer un libellé, reprendre un emplacement : trois
   gestes qui viseraient le même pointeur. Ouvrir l'un referme les deux autres
   (`modules/modes-edition.mjs`), par quelque crayon qu'on y entre. */
test.describe("un seul mode d'édition à la fois", () => {
  test("le dessin, les libellés et la reprise se referment l'un l'autre", async ({ page }) => {
    const erreurs = await ouvreAdmin(page, "&rendu=svg");
    const racine = page.locator("html");
    const outils = page.locator("#outils");
    await page.locator("#btnLayers").click();
    await page.locator("#pile button.ajout", { hasText: "Nouveau calque" }).click();
    await page.locator("#mPied button", { hasText: "Valider" }).click();
    await expect(outils).toHaveClass(/\bopen\b/);

    // les libellés referment le dessin
    await page.locator("#pile .rlib").click();
    await expect(racine).toHaveClass(/\bmode-libelles\b/);
    await expect(outils).not.toHaveClass(/\bopen\b/);

    // la reprise des stands, cadenas ouvert, referme les libellés
    const reprise = page.locator('#pile .rgeo[data-geo="stands"]');
    await reprise.locator("xpath=preceding-sibling::button[contains(@class,'vgeo')][1]").click();
    await page.locator('#pile .rgeo[data-geo="stands"]').click();
    await expect(racine).toHaveClass(/\bmode-geo-stands\b/);
    await expect(racine).not.toHaveClass(/\bmode-libelles\b/);

    // et le crayon du calque referme la reprise
    await page.locator('#pile button.ren[title="Dessiner sur ce calque"]').first().click();
    await expect(outils).toHaveClass(/\bopen\b/);
    await expect(racine).not.toHaveClass(/\bmode-geo-stands\b/);
    expect(erreurs).toEqual([]);
  });
});
