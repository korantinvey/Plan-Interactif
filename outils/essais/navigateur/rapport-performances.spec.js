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

/** Un jour relatif à aujourd'hui, dans le fuseau du salon simulé (UTC), comme la base le compte. */
const jourAvant = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);

/** Le détail d'un jeu de relevés, à la forme de `sonde_detail` ; chaque jour a le sien. */
const detail = ({ aff, classique, immersif = null, appareils, lourds }) => ({
  vues: { classique: { p50: classique, p90: 99 }, immersif: { p50: immersif, p90: immersif } },
  appareils: appareils.map(([carte, famille, visites, ms]) =>
    ({ carte, famille, visites, part_plus33_p50: 10, affiche_p50: ms })),
  lourds: lourds.map(([fichier, visites, ko]) => ({ fichier, visites, ko_p50: ko })),
  etapes: {
    reponse: { p50: 300, p90: 900 },
    donnees: { p50: 1200, p90: 3400 },
    preparation: { p50: 700, p90: 1500 },
    affichage: { p50: aff[0], p90: aff[1] },
  },
});

const ligne = (jour, page, mobile, visites, p50, p90, transfert, det) => ({
  evenement_id: "e1", jour, page, mobile, visites,
  affiche_p50: p50, affiche_p90: p90, donnees_p50: 1000, donnees_p90: 3000,
  transfert_p50: transfert, part_plus33_p50: 10, gels_moy: 1.5, pertes_contexte: 0,
  detail: det,
});

/* Des détails distincts par ligne : les attendus ci-dessous se calculent à la main.
   Le bilan de nuit d'aujourd'hui (mobile et bureau) porte un détail périmé aux
   valeurs absurdes : seul `aujourdhui` doit compter, une seule fois. */
const HIER = detail({ aff: [2000, 4000], classique: 10, appareils: [["Mali G52", "Android", 10, 6000]],
  lourds: [["plan.js", 30, 300]] });
const AVANT = detail({ aff: [4000, 9000], classique: 30, appareils: [["Mali G52", "Android", 10, 8000]],
  lourds: [["plan.js", 10, 500]] });
const PERIME = detail({ aff: [90000, 99000], classique: 99, appareils: [["Périmée", "", 999, 90000]],
  lourds: [["perime.js", 999, 9000]] });
const AUJOURDHUI = detail({ aff: [1000, 2000], classique: 20, immersif: 40,
  appareils: [["Mali G52", "Android", 5, 5000], ["Intel UHD <i>620</i>", "Windows", 5, 2000]],
  lourds: [["plan.js", 12, 400], ["logo-<b>x</b>.png", 3, 180]] });

const PERFS = {
  bilans: [
    ligne(jourAvant(0), "plan", true, 8, 2000, 6000, 900, PERIME),
    ligne(jourAvant(0), "plan", false, 7, 1500, 3000, 700, PERIME),
    ligne(jourAvant(1), "plan", true, 30, 2400, 5000, 800, HIER),
    ligne(jourAvant(2), "plan", true, 10, 3000, 7000, 1200, AVANT),
    ligne(jourAvant(1), "admin", false, 4, 1800, 3200, 500, HIER),
  ],
  aujourdhui: AUJOURDHUI,
  recues: 120,
  ecartees: 15,
};

const VIDE = {
  bilans: [],
  aujourdhui: {
    vues: { classique: { p50: null, p90: null }, immersif: { p50: null, p90: null } },
    appareils: [], lourds: [],
    etapes: { reponse: {}, donnees: {}, preparation: {}, affichage: {} },
  },
  recues: 0, ecartees: 0,
};

async function ouvreRapport(page, perfs, corps = [], requete = "") {
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
      corps.push(JSON.parse(r.request().postData() || "{}"));
      return perfs
        ? r.fulfill({ json: perfs })
        : r.fulfill({ status: 404, json: { message: "Could not find the function" } });
    }
    return r.fulfill({ json: [] });
  });
  await page.goto("/rapport.html?plan=essai" + requete);
  return erreurs;
}

const bloc = (page) => page.locator("#rapport .bloc", { hasText: "Performances" });

test.describe("le bloc Performances du rapport", () => {
  test("dit l'ouverture, la fluidité, le poids et les appareils en mots simples", async ({ page }) => {
    const erreurs = await ouvreRapport(page, PERFS);
    const b = bloc(page);
    await expect(b).toBeVisible();

    // ouverture : médiane pondérée par les visites, 90e centile au pire des jours
    // téléphone : (2400×30 + 3000×10 + 2000×8) / 48 = 2,46 s ; pire 90e : 7000 ms
    await expect(b).toContainText("Ouverture du plan");
    const tel = b.locator(".chiffre", { hasText: "Plan · téléphone" });
    await expect(tel.locator(".n")).toHaveText("2,5 s");
    await expect(tel.locator(".s")).toContainText("7,0 s");
    await expect(tel.locator(".s")).toContainText("48 visites");
    const bureau = b.locator(".chiffre", { hasText: "Plan · bureau" });
    await expect(bureau.locator(".n")).toHaveText("1,5 s");
    await expect(b.locator(".chiffre", { hasText: "Administration · bureau" }).locator(".n")).toHaveText("1,8 s");

    // étapes : le jour en cours (poids max(15, 10) = 15) remplace ses deux lignes, une seule fois
    // affichage : (2000×30 + 4000×10 + 1000×15) / 55 = 2,09 s ; pire 90e : 9000 ms
    await expect(b).toContainText("La page arrive après");
    await expect(b).toContainText("Les données arrivent après");
    await expect(b).toContainText("Préparation du plan");
    const affiche = b.locator(".erreur", { hasText: "Plan affiché après" });
    await expect(affiche.locator(".n")).toHaveText("2,1 s");
    await expect(affiche.locator(".o")).toContainText("9,0 s");

    // fluidité : classique (10×30 + 30×10 + 20×15) / 55 = 16 % ; immersif : le jour seul, 40 %
    await expect(b).toContainText("Fluidité");
    await expect(b.locator(".barre", { hasText: "Classique" }).locator(".v")).toHaveText("16 %");
    await expect(b.locator(".barre", { hasText: "Immersif" }).locator(".v")).toHaveText("40 %");

    // poids : (800×30 + 1200×10 + 900×8 + 700×7) / 55 = 875 Ko
    await expect(b).toContainText("Poids");
    await expect(b.locator(".chiffres.seul .n")).toHaveText("875 Ko");
    // fichiers : 30 + 10 + 12 = 52 visites, (300×30 + 500×10 + 400×12) / 52 = 362 Ko ; texte échappé
    const lourd = b.locator(".erreur", { hasText: "plan.js" });
    await expect(lourd.locator(".n")).toHaveText("362 Ko");
    await expect(lourd.locator(".o")).toContainText("52 visites");
    await expect(b).toContainText("logo-<b>x</b>.png");
    await expect(b.locator("b, i")).toHaveCount(0);
    await expect(b).not.toContainText("perime.js");

    // appareils : la plus lente d'abord ; Mali 10 + 10 + 5 = 25 visites, (6000×10 + 8000×10 + 5000×5) / 25 = 6,6 s
    await expect(b).toContainText("Appareils qui souffrent");
    const premier = b.locator(".appareil").first();
    await expect(premier).toContainText("Mali G52");
    await expect(premier.locator(".n")).toHaveText("6,6 s");
    await expect(premier).toContainText("25 visites");
    await expect(b).not.toContainText("Périmée");
    await expect(b.locator(".appareil").nth(1)).toContainText("Intel UHD <i>620</i>");

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

  test("demande 30 jours par défaut, et 90 pour « depuis le début », avec sa note", async ({ page }) => {
    const corps = [];
    await ouvreRapport(page, PERFS, corps);
    await expect(bloc(page)).toContainText("120 visites relevées");
    expect(corps.at(-1).p_jours).toBe(30);
    await expect(bloc(page)).not.toContainText("90 derniers jours au plus");

    await page.locator("#choixPeriode").selectOption("tout");
    await expect(bloc(page)).toContainText("90 derniers jours au plus");
    expect(corps.at(-1).p_jours).toBe(90);
  });

  test("sans aucun relevé, le bloc dit « Pas encore de relevé »", async ({ page }) => {
    await ouvreRapport(page, VIDE);
    await expect(bloc(page)).toContainText("Pas encore de relevé");
  });

  test("une base sans la fonction garde le rapport et dit « Pas encore de relevé »", async ({ page }) => {
    await ouvreRapport(page, null);
    await expect(page.locator("#rapport")).toContainText("Fréquentation");
    await expect(bloc(page)).toContainText("Pas encore de relevé");
  });

  test("en anglais, rien ne reste en français dans le bloc", async ({ page }) => {
    await ouvreRapport(page, PERFS, [], "&lang=en");
    const b = page.locator("#rapport .bloc", { hasText: "Opening the map" });
    await expect(b).toContainText("Map · phone");
    await expect(b).toContainText("Slowest 10%: 7.0 s".replace(".", ",") + " · 48 visits");
    await expect(b).toContainText("The page arrives after");
    await expect(b).toContainText("Among the heaviest in 52 visits");
    await expect(b).toContainText("120 visits recorded, 15 of them discarded by the daily cap.");
    const texte = await b.innerText();
    expect(texte).not.toMatch(/Les 10|visites?\b|écart|arrive après|affiché|Parmi|Plan ·|Préparation|Poids|Fluidité|souffrent|Temps comptés/);
  });
});
