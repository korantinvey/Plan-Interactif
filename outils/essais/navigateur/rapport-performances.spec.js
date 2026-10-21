/**
 * Le bloc « Performances » du rapport d'utilisation.
 *
 * La session de l'exploitant et la base sont simulées : le rapport reçoit un
 * jeu fabriqué à la forme exacte de `performances_du_salon` (migration de la
 * sonde), et rien ne sort. Un salon dont la base n'a pas encore la migration
 * (la fonction répond 404) doit garder tout le reste de son rapport.
 */
const { test, expect } = require("@playwright/test");
const { prepare } = require("./aide");

const BASE = "https://base.essai";

/** Aujourd'hui dans le fuseau du salon simulé (UTC), comme la base le compte. */
const jourAvant = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);

const detail = (extra = {}) => ({
  vues: { classique: { p50: 8, p90: 20 }, immersif: { p50: 31, p90: 55 } },
  appareils: [
    { carte: "Mali G52", famille: "Android", visites: 14, part_plus33_p50: 40, affiche_p50: 6200 },
    { carte: "Intel UHD 620", famille: "Windows", visites: 9, part_plus33_p50: 12, affiche_p50: 3100 },
  ],
  lourds: [
    { fichier: "plan.abc123.js", visites: 40, ko_p50: 310 },
    { fichier: "logo-<b>x</b>.png", visites: 22, ko_p50: 180 },
  ],
  etapes: {
    reponse: { p50: 300, p90: 900 },
    donnees: { p50: 1200, p90: 3400 },
    preparation: { p50: 700, p90: 1500 },
    affichage: { p50: 2400, p90: 5200 },
  },
  ...extra,
});

const ligne = (jour, page, mobile, visites, p50, p90) => ({
  evenement_id: "e1", jour, page, mobile, visites,
  affiche_p50: p50, affiche_p90: p90, donnees_p50: 1000, donnees_p90: 3000,
  transfert_p50: 850, part_plus33_p50: 10, gels_moy: 1.5, pertes_contexte: 0,
  detail: detail(),
});

const PERFS = {
  bilans: [
    ligne(jourAvant(1), "plan", true, 30, 2400, 5000),
    ligne(jourAvant(1), "plan", false, 10, 1200, 2500),
    ligne(jourAvant(2), "plan", true, 10, 3000, 7000),
    ligne(jourAvant(1), "admin", false, 4, 1800, 3200),
  ],
  aujourdhui: detail(),
  recues: 120,
  ecartees: 15,
};

async function ouvreRapport(page, perfs) {
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
    if (url.pathname === "/rest/v1/rpc/rapport_utilisation") {
      return r.fulfill({ json: { depuis: "2026-01-01", fuseau: "UTC", visites: 50, visiteurs: 30,
                                 recherches: 5, stands: { total: 4 }, conferences: { total: 2 },
                                 supports: [], jours: [] } });
    }
    if (url.pathname === "/rest/v1/rpc/erreurs_du_salon") return r.fulfill({ json: [] });
    if (url.pathname === "/rest/v1/rpc/performances_du_salon") {
      return perfs
        ? r.fulfill({ json: perfs })
        : r.fulfill({ status: 404, json: { message: "Could not find the function" } });
    }
    return r.fulfill({ json: [] });
  });
  await page.goto("/rapport.html?plan=essai");
  return erreurs;
}

const bloc = (page) => page.locator("#rapport .bloc", { hasText: "Performances" });

test.describe("le bloc Performances du rapport", () => {
  test("dit l'ouverture, la fluidité, le poids et les appareils en mots simples", async ({ page }) => {
    const erreurs = await ouvreRapport(page, PERFS);
    const b = bloc(page);
    await expect(b).toBeVisible();

    // ouverture : médiane pondérée par les visites (2400×30 + 3000×10) / 40 = 2,55 s ; 90e centile : le pire des jours
    await expect(b).toContainText("Ouverture du plan");
    const tel = b.locator(".chiffre", { hasText: "Plan · téléphone" });
    await expect(tel.locator(".n")).toHaveText(/^2,[56] s$/);
    await expect(tel.locator(".s")).toContainText("7,0 s");
    const bureau = b.locator(".chiffre", { hasText: "Plan · bureau" });
    await expect(bureau.locator(".n")).toHaveText("1,2 s");
    await expect(b.locator(".chiffre", { hasText: "Administration · bureau" }).locator(".n")).toHaveText("1,8 s");

    // les étapes : page, données, préparation, affichage
    await expect(b).toContainText("La page arrive");
    await expect(b).toContainText("Les données arrivent");
    await expect(b).toContainText("Préparation du plan");
    await expect(b).toContainText("Plan affiché");

    // fluidité : part d'images lentes, classique contre immersif
    await expect(b).toContainText("Fluidité");
    await expect(b.locator(".barre", { hasText: "Classique" }).locator(".v")).toContainText("8 %");
    await expect(b.locator(".barre", { hasText: "Immersif" }).locator(".v")).toContainText("31 %");

    // poids : médian en Ko et fichiers les plus fréquents, échappés
    await expect(b).toContainText("Poids");
    await expect(b).toContainText("850 Ko");
    await expect(b).toContainText("plan.abc123.js");
    await expect(b.locator("b")).toHaveCount(0);
    await expect(b).toContainText("logo-<b>x</b>.png");

    // appareils : la plus lente d'abord ; 14 visites dans le détail de chacune des trois lignes
    // du plan et de la journée en cours, sans bilan du jour : 4 × 14
    await expect(b).toContainText("Appareils qui souffrent");
    await expect(b.locator(".appareil").first()).toContainText("Mali G52");
    await expect(b.locator(".appareil").first()).toContainText("56 visites");

    // le compte, et ce que le plafond a écarté
    await expect(b).toContainText("120 visites relevées");
    await expect(b).toContainText("dont 15 écartées par le plafond");
    expect(erreurs).toEqual([]);
  });

  test("sans visite écartée, la ligne du plafond n'apparaît pas", async ({ page }) => {
    await ouvreRapport(page, { ...PERFS, ecartees: 0 });
    await expect(bloc(page)).toContainText("120 visites relevées");
    await expect(bloc(page)).not.toContainText("écartées");
  });

  test("une base sans la fonction garde le rapport et dit « Pas encore de relevé »", async ({ page }) => {
    await ouvreRapport(page, null);
    await expect(page.locator("#rapport")).toContainText("Fréquentation");
    await expect(bloc(page)).toContainText("Pas encore de relevé");
  });
});
