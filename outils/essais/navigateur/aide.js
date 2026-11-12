/**
 * Ce que partagent les essais dans le navigateur : une page qui ne parle
 * jamais au réseau, et le relevé de ce qui y a mal tourné.
 */
const fs = require("fs");
const path = require("path");

const PLANS = fs.readFileSync(path.join(__dirname, "..", "..", "donnees", "plans.json"), "utf8");
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
  // l'origine des pages éprouvées (`PLAN_ADRESSE`, à défaut le serveur local)
  const chez = new URL(process.env.PLAN_ADRESSE || "http://localhost:4180").origin;
  page.on("pageerror", (e) => erreurs.push("exception : " + e.message));
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const t = m.text();
    /* Un chargement refusé se tait : les essais en provoquent exprès, vers
       ailleurs comme chez soi — la bibliothèque de carte coupée, des logos en
       404. Une page incomplète se voit à ce que chaque essai vérifie d'elle. */
    if (/Failed to load resource|net::ERR_/.test(t)) return;
    erreurs.push("console : " + t.slice(0, 200));
  });

  // tout ce qui ne va pas vers les pages éprouvées (`PLAN_ADRESSE`, à défaut le serveur local)
  await page.route((url) => url.origin !== chez, (r) => r.abort());
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
  /* Une ligne d'exposant, et non n'importe quel enfant : une recherche qui ne
     retient rien écrit aussi dans `#list`, et l'essai serait reparti sur un
     plan vide. Ce qui suit lit toujours toute la liste. */
  await page.locator("#list .row").first().waitFor();
  return page.locator("#list > *");
}

/* Les deux empreintes d'intégrité de MapLibre, relues là où la page les tient
   (`modules/environs.mjs` `MAPLIBRE`) : jamais recopiées, elles changent à
   chaque `npm run maplibre`. */
const ENVIRONS = fs.readFileSync(path.join(__dirname, "..", "..", "gabarit", "modules", "environs.mjs"), "utf8");
const EMPREINTES_MAPLIBRE = ["integriteScript", "integriteStyle"].map((cle) => {
  const m = ENVIRONS.match(new RegExp(cle + ': "(sha384-[^"]+)"'));
  if (!m) throw new Error("environs.mjs : " + cle + " introuvable dans MAPLIBRE");
  return m[1];
});

/**
 * Remplace MapLibre par ce que rend `reponse` — une carte muette, une carte
 * qui gèle, une carte qui refuse sa vue.
 *
 * La page charge la bibliothèque avec son empreinte d'intégrité, et c'est bien
 * ce qui doit refuser un fichier qui n'est pas le vrai : la doublure de l'essai
 * serait refusée de même. On n'efface donc que ces deux empreintes-là, et dans
 * cette page seulement ; celles du lecteur de QR et de l'encodeur AVIF restent
 * vérifiées. Que les vraies correspondent aux fichiers servis, c'est
 * `outils/essais/bibliotheques.js` qui le garde.
 */
async function remplaceMapLibre(page, reponse) {
  await page.addInitScript((empreintes) => {
    for (const Element of [HTMLScriptElement, HTMLLinkElement]) {
      const d = Object.getOwnPropertyDescriptor(Element.prototype, "integrity");
      Object.defineProperty(Element.prototype, "integrity", {
        ...d,
        set(v) { if (!empreintes.includes(v)) d.set.call(this, v); },
      });
    }
  }, EMPREINTES_MAPLIBRE);
  await page.route("**/bibliotheques/maplibre-gl-*", reponse);
}

module.exports = { prepare, attendLaListe, remplaceMapLibre, DONNEES, PREMIER };
