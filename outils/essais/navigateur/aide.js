/**
 * Ce que partagent les essais dans le navigateur : une page qui ne parle
 * jamais au réseau, et le relevé de ce qui y a mal tourné.
 */
const fs = require("fs");
const path = require("path");

const PLANS = fs.readFileSync(path.join(__dirname, "..", "..", "plans.json"), "utf8");
const DONNEES = JSON.parse(PLANS);
const VERSION = "essai";

/* Ce que la liste doit montrer au premier coup d'œil : les stands du premier
   pavillon. Tiré des données, jamais recopié — il change à chaque fois que
   `plans.json` est régénéré. */
const PREMIER = DONNEES.plans[0].stands.length;

/**
 * Prépare une page : `/api/plan` répond avec `plans.json`, les autres appels
 * de `/api/` sont acquittés sans rien faire, et tout ce qui sortirait vers
 * une autre machine est refusé — un essai qui passe ne doit rien à Internet.
 *
 * Rend la liste des erreurs relevées : exceptions non rattrapées et messages
 * d'erreur de la console. Les échecs de chargement refusés exprès n'en sont pas.
 */
async function prepare(page, { premiereVisite = false } = {}) {
  const erreurs = [];
  /* Un visiteur neuf se voit proposer la visite guidée, puis l'installation :
     des fenêtres qui couvrent le plan et arrêtent les clics. Sauf à éprouver
     ce premier accueil, l'essai se présente donc en habitué. */
  if (!premiereVisite) {
    await page.addInitScript(() => {
      for (const salon of ["smcl-2026", ""]) {
        localStorage.setItem("plan-tutoriel:" + salon, "proposee");
        localStorage.setItem("plan-installation:" + salon, JSON.stringify({ compris: true }));
      }
    });
  }
  page.on("pageerror", (e) => erreurs.push("exception : " + e.message));
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const t = m.text();
    if (/Failed to load resource|net::ERR_/.test(t)) return;
    erreurs.push("console : " + t.slice(0, 200));
  });

  await page.route(/^https?:\/\/(?!localhost[:/])/, (r) => r.abort());
  await page.route("**/api/**", (r) => {
    const url = new URL(r.request().url());
    if (url.pathname === "/api/plan") {
      if (url.searchParams.get("entete")) {
        return r.fulfill({ json: { v: VERSION } });
      }
      return r.fulfill({
        status: 200,
        contentType: "application/json",
        headers: { "X-Version": VERSION },
        body: PLANS,
      });
    }
    return r.fulfill({ status: 204, body: "" });
  });
  return erreurs;
}

/** La liste des exposants, une fois remplie. */
async function attendLaListe(page) {
  const lignes = page.locator("#list > *");
  await lignes.first().waitFor();
  return lignes;
}

module.exports = { prepare, attendLaListe, DONNEES, PREMIER };
