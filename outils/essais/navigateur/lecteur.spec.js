/**
 * Le lecteur de code du plan : un visiteur partage son parcours, un autre le
 * lit avec la caméra du plan, sans suivre le lien.
 *
 * La caméra est une toile : le code du premier y est peint, et la page la
 * reçoit pour un flux vidéo. Chromium sans écran n'a pas de détecteur de code
 * à lui : c'est donc jsQR, servi par le site, qui lit — le chemin de l'iPhone.
 */
const { test, expect } = require("@playwright/test");
const { prepare, attendLaListe } = require("./aide.js");

const PLAN = "/plan?plan=smcl-2026";

/** Le code QR qu'affiche le partage, une fois un stand retenu. */
async function codePartage(page) {
  await page.goto(PLAN);
  const lignes = await attendLaListe(page);
  await lignes.first().click();
  await page.click("#dMarque");
  await page.click("#btnParcours");
  await page.click("#btnPartage");
  const plaque = page.locator("#mCorps .qrPlaque svg");
  await plaque.waitFor();
  // posé dans la page, le SVG n'a pas besoin de son espace de noms ; lu en image, si
  return plaque.evaluate((s) => {
    const c = /** @type {Element} */ (s.cloneNode(true));
    c.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    return c.outerHTML;
  });
}

/** Une caméra qui filme ce SVG, posée avant le chargement de la page. */
async function cameraQuiFilme(page, svg) {
  await page.addInitScript((svg) => {
    navigator.mediaDevices.getUserMedia = async () => {
      const toile = document.createElement("canvas");
      toile.width = 640; toile.height = 480;
      const ctx = toile.getContext("2d");
      const img = new Image();
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
      await img.decode();
      const peint = () => {
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, 640, 480);
        ctx.drawImage(img, 140, 60, 360, 360);
      };
      peint();
      setInterval(peint, 100);
      return toile.captureStream(10);
    };
  }, svg);
}

test.describe("le lecteur de code", () => {
  test("lit le parcours d'un autre visiteur et le propose", async ({ page, browser }) => {
    // deux visiteurs, donc deux plans chargés : plus que le temps d'un essai
    test.slow();
    await prepare(page);
    const svg = await codePartage(page);

    // l'autre visiteur, sur un appareil neuf
    const ctx = await browser.newContext();
    const autre = await ctx.newPage();
    const erreurs = await prepare(autre);
    await cameraQuiFilme(autre, svg);
    await autre.goto(PLAN);
    await attendLaListe(autre);
    await autre.click("#btnParcours");
    await autre.click("#btnScanner");
    // la fenêtre du parcours reçu prend la place du lecteur
    await expect(autre.locator("#mTitre")).toHaveText("Un parcours partagé", { timeout: 20_000 });
    await autre.locator("#mPied button", { hasText: "Charger ce parcours" }).click();
    await expect(autre.locator("#nParcours")).toHaveText("1");
    expect(erreurs).toEqual([]);
    await ctx.close();
  });

  /* Un code QR peut porter n'importe quoi. Le lecteur ne suit aucun lien : ce
     qui ne mène pas à un plan Event2Map se dit, et rien ne s'ouvre. Le code
     est fait par l'encodeur même du plan. */
  test("écarte un code qui ne vient pas d'un plan Event2Map", async ({ page }) => {
    // le module traduit son étiquette par le moteur de la page, absent de Node
    globalThis.traduit = globalThis.traduit || ((t) => t);
    const { qrTrame, qrSvg } = await import("../../gabarit/modules/qr.mjs");
    const lien = "https://exemple.org/plan?plan=smcl-2026#parcours=2&s=p0-0d40ba66";
    const svg = qrSvg(qrTrame(Array.from(new TextEncoder().encode(lien))))
      .replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
    const erreurs = await prepare(page);
    await cameraQuiFilme(page, svg);
    await page.goto(PLAN);
    await attendLaListe(page);
    await page.click("#btnParcours");
    await page.click("#btnScanner");
    await expect(page.locator("#mCorps .lecteurEtat.refus")).toHaveText("Ce code ne vient pas d'un plan Event2Map.", { timeout: 20_000 });
    await expect(page.locator("#mTitre")).toHaveText("Scanner un parcours");
    expect(erreurs).toEqual([]);
  });

  test("dit le refus de la caméra au lieu de rester muet", async ({ page }) => {
    const erreurs = await prepare(page);
    await page.addInitScript(() => {
      navigator.mediaDevices.getUserMedia = () =>
        Promise.reject(new DOMException("refus", "NotAllowedError"));
    });
    await page.goto(PLAN);
    await attendLaListe(page);
    await page.click("#btnParcours");
    await page.click("#btnScanner");
    await expect(page.locator("#mCorps .lecteurEtat.refus")).toContainText("La caméra n'est pas autorisée ici");
    expect(erreurs).toEqual([]);
  });

  test("n'est pas offert sur une borne", async ({ page }) => {
    await prepare(page);
    await page.goto(PLAN + "&borne");
    await attendLaListe(page);
    await expect(page.locator("#btnScanner")).toBeHidden();
  });
});
