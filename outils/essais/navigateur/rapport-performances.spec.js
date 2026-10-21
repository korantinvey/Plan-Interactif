/**
 * Le bloc « Performances » du rapport d'utilisation.
 *
 * Ce que la sonde a relevé se lit par `performances_du_salon` ; le bloc le dit
 * en mots simples. Une base qui n'a pas encore la migration (404) ne doit pas
 * priver l'organisateur du reste de son rapport.
 *
 * La session et la base sont simulées : rien ne sort.
 */
const { test, expect } = require("@playwright/test");
const { prepare } = require("./aide");

const BASE = "https://base.essai";

const RAPPORT = {
  depuis: "2026-01-01", fuseau: "Europe/Paris", visites: 120, visiteurs: 80,
  recherches: 5, itineraires: 2, parcours: 1, parcours_gestes: 3, partages: 0,
  stands: { total: 4, canaux: {} }, conferences: { total: 0, canaux: {} }, jours: [],
};

const detail = (ko) => ({
  vues: { classique: { p50: 4, p90: 9 }, immersif: { p50: 18, p90: 30 } },
  appareils: [
    { carte: "Qualcomm Adreno 610", famille: "Android", visites: 9, affiche_p50: 4200 },
    { carte: "Apple GPU", famille: "iOS", visites: 20, affiche_p50: 1500 },
  ],
  lourds: [{ fichier: "logos.webp", visites: 25, ko_p50: ko }],
  etapes: {
    reponse: { p50: 300, p90: 800 }, donnees: { p50: 900, p90: 2000 },
    preparation: { p50: 600, p90: 1400 }, affichage: { p50: 2400, p90: 5100 },
  },
});

const PERF = {
  bilans: [
    { jour: "2026-10-20", page: "plan", mobile: true, visites: 30, affiche_p50: 2400,
      affiche_p90: 5100, transfert_p50: 640, detail: detail(310) },
    { jour: "2026-10-20", page: "plan", mobile: false, visites: 70, affiche_p50: 1200,
      affiche_p90: 2600, transfert_p50: 640, detail: detail(310) },
  ],
  aujourdhui: { vues: { classique: { p50: null }, immersif: { p50: null } },
                appareils: [], lourds: [], etapes: {} },
  recues: 100, ecartees: 12,
};

/** Le rapport, une session admise, et la sonde servie ou absente. */
async function ouvreRapport(page, perf, requete = "") {
  const erreurs = await prepare(page);
  await page.addInitScript((base) => {
    localStorage.setItem("console-config", JSON.stringify({ url: base, anonKey: "anon" }));
    localStorage.setItem("console-session", JSON.stringify({ access_token: "a.b.c" }));
  }, BASE);
  await page.route(BASE + "/**", (r) => {
    const url = new URL(r.request().url());
    if (url.pathname === "/auth/v1/user") return r.fulfill({ json: { id: "u1" } });
    if (url.pathname === "/rest/v1/evenement") {
      return r.fulfill({ json: [{ id: "e1", nom: "Salon d'essai", slug: "essai", etat: "publie" }] });
    }
    if (url.pathname === "/rest/v1/rpc/rapport_utilisation") return r.fulfill({ json: RAPPORT });
    if (url.pathname === "/rest/v1/rpc/erreurs_du_salon") return r.fulfill({ json: [] });
    if (url.pathname === "/rest/v1/rpc/performances_du_salon") {
      return perf ? r.fulfill({ json: perf })
        : r.fulfill({ status: 404, json: { message: "fonction inconnue" } });
    }
    return r.fulfill({ json: [] });
  });
  await page.goto("/rapport.html" + requete);
  return erreurs;
}

const blocPerf = (page) => page.locator(".bloc", { has: page.locator(".bloc-hd", { hasText: "Performances" }) });

test.describe("les performances dans le rapport", () => {
  test("le bloc dit l'ouverture, la fluidité, le poids et les appareils", async ({ page }) => {
    const erreurs = await ouvreRapport(page, PERF);
    const b = blocPerf(page);
    await expect(b).toBeVisible();
    await expect(b).toContainText("Ouverture du plan");
    // la médiane et le 90e centile, en secondes à une décimale
    await expect(b.locator(".erreur", { hasText: "Téléphone · plan public" })).toContainText("2,4 s");
    await expect(b.locator(".erreur", { hasText: "Téléphone · plan public" })).toContainText("au-delà de 5,1 s");
    await expect(b.locator(".erreur", { hasText: "Bureau · plan public" })).toContainText("1,2 s");
    await expect(b.locator(".erreur", { hasText: "Bureau · plan public" })).toContainText("au-delà de 2,6 s");
    await expect(b.locator(".erreur", { hasText: "Vue classique" })).toContainText("4 %");
    await expect(b.locator(".erreur", { hasText: "Vue immersive" })).toContainText("18 %");
    await expect(b).toContainText("Poids");
    await expect(b.locator(".erreur", { hasText: "Téléchargés" })).toContainText("640 Ko");
    // un fichier qui revient deux jours compte ses visites des deux
    await expect(b.locator(".erreur", { hasText: "logos.webp" })).toContainText("50");
    await expect(b).toContainText("Appareils qui souffrent");
    // la plus lente en tête
    await expect(b.locator(".erreur", { hasText: "Adreno" }).first()).toContainText("4,2 s");
    const cartes = await b.locator(".erreur .m").allTextContents();
    expect(cartes.findIndex((t) => t.includes("Adreno"))).toBeLessThan(cartes.findIndex((t) => t.includes("Apple GPU")));
    await expect(b).toContainText("112");
    await expect(b).toContainText("dont 12 écartées par le plafond");
    expect(erreurs).toEqual([]);
  });

  test("sans la sonde en base, le reste du rapport s'affiche", async ({ page }) => {
    const erreurs = await ouvreRapport(page, null);
    await expect(page.locator(".bloc-hd", { hasText: "Fréquentation" })).toBeVisible();
    await expect(blocPerf(page)).toContainText("Pas encore de relevé");
    expect(erreurs).toEqual([]);
  });

  test("en anglais, les phrases composées se traduisent entières", async ({ page }) => {
    const erreurs = await ouvreRapport(page, PERF, "?lang=en");
    const b = page.locator(".bloc", { has: page.locator(".bloc-hd", { hasText: "Performance" }) });
    await expect(b.locator(".erreur", { hasText: "Phone · public map" }))
      .toContainText("10% of visits beyond 5.1 s · page 0.3 s, data 0.9 s, preparation 0.6 s");
    await expect(b).toContainText("including 12 left out by the cap");
    await expect(b).toContainText("Median opening: 4.2 s");
    expect(erreurs).toEqual([]);
  });
});
