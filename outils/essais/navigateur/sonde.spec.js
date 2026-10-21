/**
 * La sonde silencieuse (`modules/sonde.mjs`).
 *
 * Chaque visite dépose un résumé de performance, sans rien coûter au repos.
 * On éprouve ce qui part — la forme `sonde-plan/1`, sans l'agent utilisateur
 * complet, sous le plafond que la base accepte —, quand cela part — après
 * l'affichage, à chaque passage en arrière-plan, sous une visite qui ne change
 * qu'à bon escient —, et ce qui ne part pas : chez qui a refusé la mesure, ni
 * sous `?perf`. Et surtout que la sonde ne fait tourner aucune boucle d'images
 * quand personne ne touche le plan.
 *
 * `/api/sonde` et la RPC `sonde_admin` sont interceptés : rien ne sort.
 */
const { test, expect } = require("@playwright/test");
const { prepare, attendLaListe } = require("./aide.js");

/* Playwright lance Chromium sans cache arrière : on le rend, comme chez un
   visiteur — l'essai du retour en arrière en dépend, et les autres n'y perdent rien. */
test.use({ launchOptions: { ignoreDefaultArgs: ["--disable-back-forward-cache"] } });

const PLAN = "/plan?plan=smcl-2026&rendu=svg";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
// la base mesure le texte de Postgres, plus large que celui du navigateur (R3)
const PLAFOND = 3500;

/** Les envois vers `/api/sonde`, relevés sans rien laisser partir.
 *
 *  Chromium ne laisse pas la route saisir ce que `sendBeacon` emporte : le
 *  *beacon* est donc remplacé dans la page par un relais vers l'essai, qui
 *  reçoit la même adresse et le même corps — ce qu'on éprouve est ce que la
 *  sonde lui confie, pas le transport du navigateur. */
async function releve(page) {
  const envois = [];
  await page.exposeBinding("__balise", (_source, u, d) => {
    if (/\/api\/sonde$/.test(u)) envois.push(JSON.parse(d));
  });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "sendBeacon", { configurable: true, value: (u, d) => {
      window.__balise(String(u), String(d));
      return true;
    } });
  });
  await page.route("**/api/sonde", (r) => {
    envois.push(JSON.parse(r.request().postData() || "null"));
    return r.fulfill({ status: 204, body: "" });
  });
  return envois;
}

const octets = (o) => Buffer.byteLength(JSON.stringify(o), "utf8");

/** La page passe en arrière-plan, comme quand on change d'onglet. */
const cache = (page) => page.evaluate(() => {
  Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
  Object.defineProperty(document, "hidden", { value: true, configurable: true });
  // celui du navigateur remonte du document à la fenêtre, où la page l'écoute
  document.dispatchEvent(new Event("visibilitychange", { bubbles: true }));
});

/** Un glisser au milieu du plan. */
async function glisse(page) {
  const b = await page.locator("#stage").boundingBox();
  const x = b.x + b.width / 2, y = b.y + b.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 120, y + 60, { steps: 12 });
  await page.mouse.up();
}

test.describe("la sonde silencieuse", { tag: "@base" }, () => {
  test("après l'affichage, le résumé part, sans l'agent complet", async ({ page }) => {
    const erreurs = await prepare(page);
    const envois = await releve(page);
    await page.goto("/plan?plan=smcl-2026");
    await attendLaListe(page);
    await expect.poll(() => envois.length, { timeout: 15_000 }).toBeGreaterThan(0);
    const e = envois[0];
    expect(e.slug).toBe("smcl-2026");
    expect(e.page).toBe("plan");
    expect(e.visite).toMatch(UUID);
    const r = e.resume;
    expect(r.format).toBe("sonde-plan/1");
    expect(r.page).toBe("plan");
    expect(r.chargement.jalons["plan-affiche"]).toBeGreaterThan(0);
    expect(r.appareil.agent).toBeUndefined();
    expect(r.appareil.fenetre).toBeUndefined();
    expect(typeof r.appareil.navigateur.famille).toBe("string");
    expect(r.fluidite.classique.tranches).toHaveLength(7);
    expect(octets(r)).toBeLessThanOrEqual(PLAFOND);
    expect(erreurs).toEqual([]);
  });

  test("le bilan de l'ouverture est figé : une vignette chargée ensuite ne le déplace pas", async ({ page }) => {
    await prepare(page);
    const envois = await releve(page);
    /* Un fond de pavillon demandé dès l'ouverture sous l'adresse des données
       (`slug=…&fond=`), et servi longtemps après l'affichage : ce n'est pas
       la fin des données. */
    await page.route((u) => u.pathname === "/api/plan" && u.searchParams.has("fond"), async (r) => {
      await new Promise((ok) => setTimeout(ok, 6000));
      return r.fulfill({ status: 404, body: "" }).catch(() => {});
    });
    await page.addInitScript(() => {
      fetch("/api/plan?slug=smcl-2026&fond=essai").then(r => r.arrayBuffer()).catch(() => {});
    });
    await page.goto(PLAN);
    await attendLaListe(page);
    // une vignette part sous l'adresse de l'API, après l'affichage — et pèse autant que le plan
    const vignette = () => page.evaluate(() => fetch("/api/plan?vignette=0123456789abcdef").then(r => r.arrayBuffer()).then(() => 0));
    await vignette();
    await expect.poll(() => envois.length, { timeout: 15_000 }).toBeGreaterThan(0);
    const avant = envois[0].resume.chargement;
    expect(avant.jalons.donnees).toBeGreaterThan(0);
    expect(avant.jalons.donnees).toBeLessThanOrEqual(avant.jalons["plan-affiche"]);
    await vignette();
    await glisse(page);
    await cache(page);
    await expect.poll(() => envois.length, { timeout: 5_000 }).toBeGreaterThan(1);
    const apres = envois[envois.length - 1].resume.chargement;
    expect(apres.jalons.donnees).toBe(avant.jalons.donnees);
    expect(apres.transfertKo).toBe(avant.transfertKo);
    expect(apres.depuisCache).toBe(avant.depuisCache);
    expect(apres.lourds).toEqual(avant.lourds);
  });

  test("rien ne part chez qui a refusé la mesure", async ({ page }) => {
    await prepare(page);
    await page.addInitScript(() => localStorage.setItem("plan-mesure-refusee", "1"));
    const envois = await releve(page);
    await page.goto(PLAN);
    await attendLaListe(page);
    await page.waitForTimeout(15_000);
    expect(envois).toEqual([]);
  });

  test("sous ?perf, la sonde laisse la place au relevé", async ({ page }) => {
    await prepare(page);
    const envois = await releve(page);
    await page.goto(PLAN + "&perf");
    await attendLaListe(page);
    await page.waitForTimeout(15_000);
    expect(envois).toEqual([]);
  });

  test("sans geste, aucune boucle d'images", async ({ page }) => {
    const erreurs = await prepare(page);
    await releve(page);
    await page.goto(PLAN);
    await attendLaListe(page);
    await page.waitForFunction(() => document.documentElement.classList.contains("plan-affiche"));
    const images = () => page.evaluate(() => window.__essais.sonde.images);
    const avant = await images();
    await page.waitForTimeout(3000);
    expect(await images()).toBe(avant);
    await glisse(page);
    await expect.poll(images).toBeGreaterThan(avant);
    // la traîne du geste passée, la boucle s'est arrêtée d'elle-même
    await page.waitForTimeout(1000);
    const fige = await images();
    await page.waitForTimeout(1500);
    expect(await images()).toBe(fige);
    expect(erreurs).toEqual([]);
  });
});

test.describe("la sonde silencieuse, au fil de la visite", () => {
  test("un glisser puis l'arrière-plan : la même visite repart, ses gestes comptés", async ({ page }) => {
    const erreurs = await prepare(page);
    const envois = await releve(page);
    await page.goto(PLAN);
    await attendLaListe(page);
    await expect.poll(() => envois.length, { timeout: 15_000 }).toBe(1);
    await glisse(page);
    await page.waitForTimeout(600);
    await cache(page);
    await expect.poll(() => envois.length).toBe(2);
    expect(envois[1].visite).toBe(envois[0].visite);
    expect(envois[1].resume.fluidite.classique.gestes).toBeGreaterThanOrEqual(1);
    expect(envois[1].resume.fluidite.classique.tranches.reduce((a, b) => a + b, 0)).toBeGreaterThan(0);
    expect(erreurs).toEqual([]);
  });

  test("la borne change de visite toutes les heures", async ({ page }) => {
    const erreurs = await prepare(page);
    const envois = await releve(page);
    await page.clock.install();
    await page.goto(PLAN + "&borne");
    await attendLaListe(page);
    await expect.poll(() => envois.length, { timeout: 15_000 }).toBeGreaterThan(0);
    const premiere = envois[0].visite;
    expect(envois[0].page).toBe("borne");
    await page.clock.fastForward("01:00:01");
    const n = envois.length;
    await cache(page);
    await expect.poll(() => envois.length).toBeGreaterThan(n);
    expect(envois[envois.length - 1].visite).toMatch(UUID);
    expect(envois[envois.length - 1].visite).not.toBe(premiere);
    expect(erreurs).toEqual([]);
  });

  /* Soixante fichiers lourds que la page charge d'elle-même. Aux noms de deux
     cents caractères, le résumé tient encore ; à deux mille, il doit céder ses
     lourds un à un — c'est ce second cas qui fait mordre la troncature. */
  for (const longueur of [200, 2000]) {
    test("trop de fichiers lourds, aux noms de " + longueur + " caractères : le résumé reste sous le plafond", async ({ page }) => {
      const erreurs = await prepare(page);
      const envois = await releve(page);
      await page.route("**/lourd/**", async (r) => {
        await new Promise((ok) => setTimeout(ok, 200));
        return r.fulfill({ status: 200, contentType: "application/octet-stream", body: Buffer.alloc(300_000, 7) });
      });
      await page.addInitScript((n) => {
        // dès l'ouverture : le bilan se fige à l'affichage, ce qui part après n'y compte plus
        // le corps lu : sans lui, Chromium peut ne laisser aucune entrée de ressource
        for (let i = 0; i < 60; i++) fetch("/lourd/" + "n".repeat(n) + "-" + i + ".bin").then(r => r.arrayBuffer()).catch(() => {});
      }, longueur);
      await page.goto(PLAN);
      await attendLaListe(page);
      await expect.poll(() => envois.length, { timeout: 15_000 }).toBeGreaterThan(0);
      const r = envois[0].resume;
      expect(octets(r)).toBeLessThanOrEqual(PLAFOND);
      expect(r.chargement.lourds.length).toBeLessThanOrEqual(5);
      // le chargement lui-même n'a pas été sacrifié au détail
      expect(r.chargement.jalons["plan-affiche"]).toBeGreaterThan(0);
      // les fichiers ont bien pesé, avant l'affichage : sans eux l'essai ne prouverait rien
      const vus = await page.evaluate((affiche) => performance.getEntriesByType("resource")
        .filter((e) => e.name.includes("/lourd/") && e.startTime <= affiche).length, r.chargement.jalons["plan-affiche"]);
      expect(vus).toBeGreaterThanOrEqual(5);
      const nommes = r.chargement.lourds.filter((l) => /^n+-\d+\.bin$/.test(l.fichier));
      if (longueur === 200) expect(nommes.length).toBeGreaterThan(0);
      // à deux mille, la troncature a mordu : des lourds retirés, ou des noms coupés
      else expect(r.chargement.lourds.length < 5 || r.chargement.lourds.every((l) => l.fichier.length <= 60)).toBe(true);
      expect(erreurs).toEqual([]);
    });
  }
});

test.describe("la sonde silencieuse et le cache arrière", () => {
  test("revenue du cache arrière, la page ouvre une nouvelle visite", async ({ page }) => {
    const erreurs = await prepare(page);
    const envois = await releve(page);
    // le serveur d'essai sert ses pages en `no-store`, que Chrome refuse de garder en cache arrière
    await page.route((u) => u.pathname === "/plan", async (r) => {
      const rep = await r.fetch();
      const entetes = { ...rep.headers() };
      delete entetes["cache-control"];
      return r.fulfill({ response: rep, headers: entetes });
    });
    await page.addInitScript(() => addEventListener("pageshow", (e) => { window.__persiste = e.persisted; }));
    await page.goto(PLAN);
    await attendLaListe(page);
    await expect.poll(() => envois.length, { timeout: 15_000 }).toBe(1);
    const premiere = envois[0].visite;
    await page.goto("/plan-smcl.html");
    // une page rendue par le cache arrière ne refait pas son « load » : on attend son « pageshow »
    await page.goBack({ waitUntil: "commit" });
    const persiste = await page.waitForFunction(() => window.__persiste === true, null, { timeout: 5000 })
      .then(() => true, () => false);
    test.skip(!persiste, "le navigateur d'essai n'a pas gardé la page dans son cache arrière");
    const n = envois.length;
    await expect.poll(() => envois.length, { timeout: 15_000 }).toBeGreaterThan(n);
    expect(envois[n].visite).toMatch(UUID);
    expect(envois[n].visite).not.toBe(premiere);
    expect(erreurs).toEqual([]);
  });
});

test.describe("la sonde de l'administration", () => {
  test("session expirée : un seul essai, le résumé attend sur le poste", async ({ page }) => {
    const BASE = "https://base.essai";
    const erreurs = await prepare(page);
    const publics = await releve(page);
    await page.addInitScript((base) => {
      localStorage.setItem("console-config", JSON.stringify({ url: base, anonKey: "anon" }));
      localStorage.setItem("console-session", JSON.stringify({ access_token: "a.b.c" }));
    }, BASE);
    const essais = [];
    await page.route(BASE + "/**", (r) => {
      const req = r.request();
      const url = new URL(req.url());
      if (url.pathname === "/auth/v1/user") return r.fulfill({ json: { id: "u1" } });
      if (url.pathname === "/rest/v1/evenement") return r.fulfill({ json: [{ id: "e1" }] });
      if (url.pathname === "/rest/v1/rpc/sonde_admin") {
        essais.push({ corps: JSON.parse(req.postData() || "null"), entetes: req.headers() });
        return r.fulfill({ status: 401, json: { message: "JWT expired" } });
      }
      if (req.method() !== "GET") return r.fulfill({ status: 204, body: "" });
      return r.fulfill({ json: [] });
    });
    await page.goto("/plan-admin.html?plan=smcl-2026&rendu=svg");
    await attendLaListe(page);
    await expect.poll(() => essais.length, { timeout: 15_000 }).toBe(1);
    await page.waitForTimeout(3000);
    expect(essais).toHaveLength(1);
    const { corps, entetes } = essais[0];
    expect(entetes.authorization).toBe("Bearer a.b.c");
    expect(entetes.apikey).toBe("anon");
    expect(corps.p_slug).toBe("smcl-2026");
    expect(corps.p_visite).toMatch(UUID);
    expect(corps.p_version).toMatch(/^[0-9a-f]{10}$/);
    expect(corps.p_resume.format).toBe("sonde-plan/1");
    expect(corps.p_resume.page).toBe("admin");
    const file = JSON.parse(await page.evaluate(() => localStorage.getItem("plan-sonde")) || "[]");
    expect(file.map((e) => e.visite)).toContain(corps.p_visite);
    // l'administration n'écrit pas au Worker
    expect(publics).toEqual([]);
    expect(erreurs).toEqual([]);
  });
});

test.describe("la sonde silencieuse, ce qu'elle dit de l'appareil et du refus", () => {
  test("cachée avant que le plan paraisse, la visite dit sur quoi elle tournait", async ({ page }) => {
    const erreurs = await prepare(page);
    const envois = await releve(page);
    // les données du salon ne viennent jamais : le plan ne paraît pas
    await page.route("**/api/plan**", () => {});
    await page.goto(PLAN);
    await attendLaListe(page);
    await page.waitForTimeout(1000);
    expect(await page.evaluate(() => document.documentElement.classList.contains("plan-affiche"))).toBe(false);
    await cache(page);
    await expect.poll(() => envois.length).toBeGreaterThan(0);
    const a = envois[0].resume.appareil;
    expect(typeof a.navigateur.famille).toBe("string");
    expect(typeof a.mobile).toBe("boolean");
    expect(erreurs).toEqual([]);
  });

  test("sans userAgentData, un iPhone se dit téléphone", async ({ page }) => {
    const erreurs = await prepare(page);
    await releve(page);
    await page.addInitScript(() => {
      const iphone = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 " +
        "(KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
      Object.defineProperty(Navigator.prototype, "userAgentData", { get: () => undefined, configurable: true });
      Object.defineProperty(Navigator.prototype, "userAgent", { get: () => iphone, configurable: true });
    });
    await page.goto(PLAN);
    await attendLaListe(page);
    const a = await page.evaluate(() => window.__essais.sonde.resume.appareil);
    expect(a.mobile).toBe(true);
    expect(a.navigateur.famille).toBe("Safari");
    expect(a.agent).toBeUndefined();
    expect(erreurs).toEqual([]);
  });

  test("refus posé en cours de visite : ce qui attendait en file ne part plus", async ({ page }) => {
    const erreurs = await prepare(page);
    const envois = await releve(page);
    await page.goto(PLAN);
    await attendLaListe(page);
    /* Hors réseau : la reprise de l'ouverture, faite en creux, ne peut pas
       emporter l'entrée avant que le refus soit posé. */
    await page.context().setOffline(true);
    // un résumé d'une visite d'avant, resté sans réseau
    await page.evaluate(() => localStorage.setItem("plan-sonde", JSON.stringify([{
      visite: "11111111-2222-4333-8444-555555555555", pose: Date.now(), admin: false,
      slug: "smcl-2026", page: "plan", resume: { format: "sonde-plan/1" } }])));
    await page.locator("#btnConfidentialite").click();
    await page.locator("#modale input[type=checkbox]").check();
    // le réseau revient : c'est l'instant où la file repartirait
    await page.context().setOffline(false);
    await page.waitForTimeout(2000);
    expect(envois).toEqual([]);
    expect(erreurs).toEqual([]);
  });
});
