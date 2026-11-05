/**
 * Lire le code QR d'un parcours sans quitter le plan : ce qui garde le partage
 * vivant quand le plan est embarqué dans une application, où l'appareil photo
 * du téléphone ouvrirait le lien ailleurs (`modules/scan-parcours.mjs`).
 *
 * Chromium sans tête n'a pas de caméra, ni de `BarcodeDetector` qui sache les
 * codes QR sous Linux : c'est exactement le chemin le plus long — la caméra
 * refusée, la photo, et jsQR chargé à la demande, empreinte et politique de
 * sécurité comprises.
 */
const { test, expect } = require("@playwright/test");
const { prepare, attendLaListe } = require("./aide.js");

const PLAN = "/plan?plan=smcl-2026";

/* Le lecteur ne se montre qu'au doigt (`dom.mjs` `auDoigt`) : chaque essai qui
   s'en sert se fait sur un téléphone. */
const TELEPHONE = { isMobile: true, hasTouch: true, viewport: { width: 412, height: 839 } };

/** Le code QR de la fenêtre de partage, en PNG, tel qu'on le photographierait. */
async function photoDuCode(page) {
  const url = await page.locator(".qrPlaque svg").evaluate(async (svg) => {
    const src = "data:image/svg+xml;charset=utf-8," +
      encodeURIComponent(new XMLSerializer().serializeToString(svg));
    const img = new Image();
    img.src = src;
    await img.decode();
    const t = document.createElement("canvas");
    t.width = t.height = 600;
    const ctx = t.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, 600, 600);
    ctx.drawImage(img, 40, 40, 520, 520);
    return t.toDataURL("image/png");
  });
  return Buffer.from(url.split(",")[1], "base64");
}

test.describe("le parcours lu depuis le plan", () => {
  test.use(TELEPHONE);
  test("un code photographié charge le parcours, sans quitter la page", async ({ page, browser }) => {
    test.slow();   // deux appareils, deux plans à ouvrir
    // celui qui partage : quelques stands retenus, et leur code
    const erreurs = await prepare(page);
    await page.goto(PLAN);
    const lignes = await attendLaListe(page);
    const numero = (await lignes.first().innerText()).trim().split(/\s+/)[0];
    await page.fill("#q", numero);
    await page.locator("#btnFiltres").evaluate((b) => /** @type {HTMLElement} */ (b).click());
    await page.locator(".tout-parc").click();
    await page.locator("#modale").getByRole("button", { name: "Ajouter", exact: true }).click();
    const retenus = await page.locator("#nParcours").innerText();
    await page.locator("#btnPartage").click();
    const png = await photoDuCode(page);
    expect(erreurs).toEqual([]);

    // celui qui reçoit : un autre appareil, une liste vide, pas de caméra
    // le second appareil ne reçoit pas l'adresse de base de la configuration
    const autre = await browser.newContext({ ...TELEPHONE, baseURL: new URL(page.url()).origin });
    const page2 = await autre.newPage();
    const erreurs2 = await prepare(page2);
    await page2.goto(PLAN);
    await attendLaListe(page2);
    await page2.locator("#btnParcours").click();
    const scan = page2.locator("#btnScanParcours");
    await expect(scan).toBeVisible();
    await scan.click();
    const modale = page2.locator("#modale");
    await expect(modale).toContainText("Scanner un parcours");
    await expect(modale.locator(".scanEtat")).toContainText("prenez le code en photo");

    const adresse = page2.url();
    await modale.locator(".scanPhoto input").setInputFiles(
      { name: "code.png", mimeType: "image/png", buffer: png });
    await expect(modale).toContainText("Le parcours qui vous a été partagé contient");
    await modale.getByRole("button", { name: "Charger ce parcours" }).click();
    await expect(page2.locator("#nParcours")).toHaveText(retenus);
    // la page n'a pas bougé : c'est tout l'objet
    expect(page2.url()).toBe(adresse);
    expect(erreurs2).toEqual([]);
    await autre.close();
  });

  test("un code qui n'est pas un parcours se dit, et la fenêtre reste", async ({ page }) => {
    const erreurs = await prepare(page);
    await page.goto(PLAN);
    await attendLaListe(page);
    // un code QR quelconque, fait par le plan lui-même
    await page.locator("#btnParcours").click();
    await page.locator("#btnScanParcours").click();
    const png = await page.evaluate(async () => {
      const { qrTrame, qrSvg } = /** @type {any} */ (globalThis).__essais.qr;
      const div = document.createElement("div");
      div.innerHTML = qrSvg(qrTrame(Array.from(new TextEncoder().encode("WIFI:S:Hall 5;;"))));
      const svg = div.querySelector("svg");
      const img = new Image();
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(svg));
      await img.decode();
      const t = document.createElement("canvas");
      t.width = t.height = 600;
      const ctx = t.getContext("2d");
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, 600, 600);
      ctx.drawImage(img, 40, 40, 520, 520);
      return t.toDataURL("image/png");
    });
    await page.locator("#modale .scanPhoto input").setInputFiles(
      { name: "code.png", mimeType: "image/png", buffer: Buffer.from(png.split(",")[1], "base64") });
    await expect(page.locator("#modale .scanEtat")).toContainText("n'est pas celui d'un parcours");
    await expect(page.locator("#modale")).toContainText("Scanner un parcours");
    expect(erreurs).toEqual([]);
  });
});

test.describe("au doigt", () => {
test.use(TELEPHONE);

test("le lecteur ne prend que les parcours de ce salon", async ({ page }) => {
  await prepare(page);
  await page.goto(PLAN);
  await attendLaListe(page);
  const lus = await page.evaluate(() => {
    const f = /** @type {any} */ (globalThis).__essais.fragmentDuCode;
    return {
      lien: f("https://exemple.fr/plan?plan=smcl-2026#parcours=2&s=a.b"),
      fragment: f("parcours=2&s=a"),
      autreSalon: f("https://exemple.fr/plan?plan=autre-2026#parcours=2&s=a"),
      sansSalon: f("https://exemple.fr/plan#parcours=2&s=a"),
      coupe: f("https://exemple.fr/plan?plan=smcl-2026#parcours=9"),
      etranger: f("https://exemple.fr/plan?plan=smcl-2026#A12"),
      texte: f("WIFI:S:Hall 5;;"),
    };
  });
  expect(lus).toEqual({
    lien: { fragment: "parcours=2&s=a.b" },
    fragment: { fragment: "parcours=2&s=a" },
    autreSalon: { refus: "autreSalon" },
    sansSalon: { fragment: "parcours=2&s=a" },
    coupe: { refus: "illisible" },
    etranger: { refus: "etranger" },
    texte: { refus: "etranger" },
  });
});

test("décoché dans les réglages, le lecteur disparaît et le parcours reste", async ({ page }) => {
  const erreurs = await prepare(page);
  await page.addInitScript(() => {
    localStorage.setItem("plan-conf:smcl-2026", JSON.stringify({ _scanParcours: { visible: false } }));
  });
  await page.goto(PLAN);
  await attendLaListe(page);
  await page.locator("#btnParcours").click();
  await expect(page.locator("#parcours")).toHaveClass(/open/);
  await expect(page.locator("#btnPartage")).toBeVisible();
  await expect(page.locator("#btnScanParcours")).toBeHidden();
  expect(erreurs).toEqual([]);
});
});

/* Sur un ordinateur, on ne vise pas un téléphone avec sa webcam : le bouton
   n'existe pas, et le partage reste. */
test("sur un ordinateur, pas de lecteur", async ({ page }) => {
  const erreurs = await prepare(page);
  await page.goto(PLAN);
  await attendLaListe(page);
  await page.locator("#btnParcours").click();
  await expect(page.locator("#btnPartage")).toBeVisible();
  await expect(page.locator("#btnScanParcours")).toHaveCount(0);
  expect(erreurs).toEqual([]);
});
