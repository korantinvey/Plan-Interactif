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
const { prepare, attendLaListe, remplaceMapLibre, standAViser, DONNEES } = require("./aide.js");
const { incoherences } = require("../../scripts/sonde-coherence.js");

/** Le résumé ne contredit aucune règle de vraisemblance : une mesure faussée échoue ici. */
const vraisemblable = (r) => expect(incoherences(r).map((x) => x.cle + " : " + x.detail)).toEqual([]);

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

/* Le premier envoi part dix secondes après l'affichage (`sonde.mjs`
   `PREMIER_ENVOI`), et l'affichage dépend de la machine : sous un dessin
   imité au processeur, il vient en une seconde sur l'intégration, en six sur
   un conteneur plus lent — et l'envoi manquait alors les quinze secondes
   qu'on lui laissait après la liste. On attend donc le plan d'abord : le
   délai de l'envoi ne mesure plus que l'envoi. */
const affiche = (page) => page.waitForFunction(
  () => document.documentElement.classList.contains("plan-affiche"), null, { timeout: 30_000 });

/** Deux images passées : ce qu'on vient de faire est peint. */
const deuxImages = (page) => page.evaluate(() => new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok))));

/**
 * Un point du plan où rien n'est désigné : ni stand, ni zone, ni panneau
 * par-dessus. Un appui là ne fait rien monter et le relâché n'ouvre rien —
 * le geste ne coûte que ce qu'on lui fait coûter. Rend `null` si le moteur ne
 * sait pas trancher par le calcul (`moteur-gl.mjs` `designe`).
 */
const pointVide = (page) => page.evaluate(() => {
  const d = /** @type {any} */ (globalThis).__essais.GL.deck;
  const st = document.getElementById("stage").getBoundingClientRect(), cv = d.canvas.getBoundingClientRect();
  for (let y = st.top + 40; y < st.bottom - 40; y += 15) {
    for (let x = st.left + 40; x < st.right - 40; x += 15) {
      const e = document.elementFromPoint(x, y);
      if (!e || !e.closest("#stage") ||
          e.closest("#viseur, .tools, .zoombar, #poi, #side, #detail, #parcours, #itineraire, .topbar")) continue;
      if (d.designe({ x: x - cv.left, y: y - cv.top }) === null) return { x, y };
    }
  }
  return null;
});

test.describe("la sonde silencieuse", { tag: "@base" }, () => {
  test("après l'affichage, le résumé part, sans l'agent complet", async ({ page }) => {
    const erreurs = await prepare(page);
    const envois = await releve(page);
    await page.goto("/plan?plan=smcl-2026");
    await attendLaListe(page);
    await affiche(page);
    await expect.poll(() => envois.length, { timeout: 15_000 }).toBeGreaterThan(0);
    const e = envois[0];
    expect(e.slug).toBe("smcl-2026");
    expect(e.page).toBe("plan");
    expect(e.visite).toMatch(UUID);
    const r = e.resume;
    expect(r.format).toBe("sonde-plan/1");
    expect(r.rev).toBe(7);
    expect(r.page).toBe("plan");
    expect(r.visibleMs).toBeGreaterThan(0);
    expect(r.visibleMs).toBeLessThanOrEqual(r.duree);
    // vue du début à la fin : rien d'invisible avant l'affichage, et le LCP dit
    expect(r.chargement.invisibleAvantMs).toBeUndefined();
    expect(r.chargement.horsVueAvant).toBeUndefined();
    vraisemblable(r);
    expect(r.chargement.jalons["plan-affiche"]).toBeGreaterThan(0);
    expect(r.appareil.agent).toBeUndefined();
    expect(r.appareil.fenetre).toBeUndefined();
    expect(typeof r.appareil.navigateur.famille).toBe("string");
    // révision 3 : le système se dit aussi hors de `userAgentData` (`mesures-page.mjs` `systemeDeRepli`)
    expect(typeof r.appareil.systeme).toBe("string");
    expect(r.fluidite.classique.tranches).toHaveLength(7);
    expect(octets(r)).toBeLessThanOrEqual(PLAFOND);
    expect(erreurs).toEqual([]);
  });

  /* Révision 4 : ce qui sépare le poste, le trajet et le relais. Le relais dit
     son temps, son point de présence et ce que son cache a rendu
     (`src/index.mjs` `minute`) ; la sonde le joint au trajet de l'appel du
     plan, avec ce que la création du contexte WebGL a tenu la page. */
  test("l'ouverture dit son trajet, le relais qui l'a servie, et ce qu'a tenu le contexte WebGL", async ({ page }) => {
    const erreurs = await prepare(page);
    const envois = await releve(page);
    const PLANS = JSON.stringify(DONNEES);
    // posée après celle de `prepare`, cette route passe devant elle
    await page.route("**/api/plan?slug=*", (r) => r.fulfill({
      status: 200, contentType: "application/json",
      headers: { "X-Version": "essai",
        "Server-Timing": 'w;dur=12, t;desc="' + Math.floor(Date.now() / 1000) + '", cf;desc="CDG", cache;desc="hit"' },
      body: PLANS,
    }));
    await page.goto("/plan?plan=smcl-2026");
    await attendLaListe(page);
    await affiche(page);
    await expect.poll(() => envois.length, { timeout: 15_000 }).toBeGreaterThan(0);
    const c = envois[0].resume.chargement;
    // fraîche, datée de l'instant : le minutage est celui de cette visite
    expect(c.trajets.donnees).toMatchObject({ relaisMs: 12, cf: "CDG", cache: "hit" });
    expect(c.trajets.donnees.rejoue).toBeUndefined();
    expect(c.trajets.donnees.attenteMs).toBeGreaterThanOrEqual(0);
    expect(c.trajets.page.attenteMs).toBeGreaterThan(0);
    expect(c.contexteMs).toBeGreaterThanOrEqual(0);
    vraisemblable(envois[0].resume);
    expect(erreurs).toEqual([]);
  });

  /* Ce que le navigateur dit du WebGL, à côté du nom de la puce : rien ne
     change encore pour le visiteur, on regarde d'abord qui serait renvoyé au
     SVG. La réponse elle-même n'est pas éprouvée : le Chromium des essais,
     qui imite pourtant la carte graphique au processeur, ne déclare aucun
     handicap (SwiftShader choisi d'emblée, non subi). C'est la sonde, chez
     les visiteurs, qui dira ce qu'elle vaut. */
  test("la carte graphique dit si le navigateur refuserait le WebGL pour gros handicap", async ({ page }) => {
    const erreurs = await prepare(page);
    await releve(page);
    await page.goto("/plan?plan=smcl-2026");
    await attendLaListe(page);
    const dessin = await page.waitForFunction(() => window.__essais.GL.pret, null, { timeout: 15_000 })
      .then(() => true, () => false);
    test.skip(!dessin, "pas de WebGL : la question ne se pose pas");
    await expect.poll(() => page.evaluate(() => window.__essais.sonde.resume.appareil.carte), { timeout: 15_000 })
      .toBeTruthy();
    const carte = await page.evaluate(() => window.__essais.sonde.resume.appareil.carte);
    expect(typeof carte.handicap).toBe("boolean");
    // le lissage sous-pixel des petits textes, que la fiche sépare des images lentes du bureau
    expect(typeof carte.sousPixel).toBe("boolean");
    // la toile d'essai, jetée, n'a rien pris au plan
    expect(await page.evaluate(() => window.__essais.GL.pret)).toBe(true);
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
    await affiche(page);
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

test.describe("la sonde silencieuse, ce qu'une longue image a fait", () => {
  /* La longue image ne nomme que la boucle de deck.gl : la sonde y joint le
     moment du gel et ce que deck.gl et la carte graphique ont fait. deck.gl
     remet ses comptes à zéro toutes les soixante images ; le cumul de la
     sonde, lui, ne doit jamais redescendre. */
  test("un gel dit son moment, et les comptes de deck.gl ne font que croître", async ({ page }) => {
    const erreurs = await prepare(page);
    await releve(page);
    // les autres essais tournent en SVG ; celui-ci a besoin de deck.gl
    await page.goto(PLAN.replace("&rendu=svg", ""));
    await attendLaListe(page);
    await page.waitForFunction(() => document.documentElement.classList.contains("plan-affiche"));
    const travaux = () => page.evaluate(() => window.__essais.sonde.travaux);
    // deck.gl se charge après que le plan a paru : on attend son dessin
    await page.waitForFunction(() => window.__essais.GL.actif, null, { timeout: 30_000 });
    await expect.poll(async () => (await travaux() || {}).programmes || 0).toBeGreaterThan(0);
    const avant = await travaux();
    expect(avant.couches).toBeGreaterThan(0);
    // deck.gl passe sa prochaine remise à zéro : ce qu'il tenait ne doit pas se perdre
    const images = () => page.evaluate(() => window.__essais.GL.deck._metricsCounter);
    const remise = Math.floor((await images() - 1) / 60) * 60 + 61;
    /* deck.gl compte une image à chaque trame, même au repos, et passe seul
       sa remise à zéro ; le moteur du plan ne compte que ce qu'il peint, et
       ne peint que ce qui change. L'essai y fait donc tourner le compte des
       images (`_compte`) jusqu'à la remise — les peindre vraiment coûterait
       une seconde chacune à la carte graphique imitée des essais. */
    await page.evaluate((n) => {
      const G = window.__essais.GL;
      if (G.moteur === "gl2") for (let i = 0; i < n; i++) G.deck._compte(0, 0, 0);
    }, remise - await images() + 1);
    await expect.poll(images, { timeout: 30_000 }).toBeGreaterThan(remise);
    const apres = await travaux();
    expect(apres.couches).toBeGreaterThanOrEqual(avant.couches);
    expect(apres.attrMs).toBeGreaterThanOrEqual(avant.attrMs);
    // une image tenue un tiers de seconde, le plan déjà paru
    await page.evaluate(() => new Promise((ok) => requestAnimationFrame(() => {
      const t = performance.now();
      while (performance.now() - t < 300) { /* l'image tenue */ }
      ok();
    })));
    await expect.poll(() => page.evaluate(() => window.__essais.sonde.resume.gels.pires
      .some((p) => p.ms >= 300 && p.t > 0 && !p.avantAffichage && p.travaux && typeof p.travaux === "object"))).toBe(true);
    /* Et où l'image a passé son temps : dans un rappel d'image, que le rendu
       contient — non à la « ligne 1 » d'un paquet. */
    const gel = await page.evaluate(() => window.__essais.sonde.resume.gels.pires.find((p) => p.ms >= 300 && !p.avantAffichage));
    expect(gel.invocation).toBe("user-callback");
    expect(gel.scriptsMs).toBeGreaterThanOrEqual(250);
    expect(gel.renduMs).toBeGreaterThanOrEqual(250);
    expect(gel.position).not.toBe(0);
    vraisemblable(await page.evaluate(() => window.__essais.sonde.resume));
    expect(erreurs).toEqual([]);
  });
});

test.describe("la sonde silencieuse, là où le navigateur ne dit pas ses gels", () => {
  /* Safari et Firefox n'ont ni `long-animation-frame` ni `longtask` : le
     battement mesure seul le gel, et se tait une fois l'ouverture passée. */
  test("sans mesure du navigateur, le battement voit le gel, puis se tait", async ({ page }) => {
    const erreurs = await prepare(page);
    await releve(page);
    await page.addInitScript(() => {
      const connus = PerformanceObserver.supportedEntryTypes
        .filter((t) => t !== "long-animation-frame" && t !== "longtask");
      Object.defineProperty(PerformanceObserver, "supportedEntryTypes", { configurable: true, get: () => connus });
    });
    await page.goto(PLAN);
    await attendLaListe(page);
    await affiche(page);
    // une tâche tenue un tiers de seconde, dans la traîne de l'ouverture
    await page.evaluate(() => new Promise((ok) => setTimeout(() => {
      const t = performance.now();
      while (performance.now() - t < 300) { /* la page tenue */ }
      ok();
    }, 0)));
    const gels = () => page.evaluate(() => window.__essais.sonde.resume.gels);
    await expect.poll(async () => (await gels()).battement.maxMs).toBeGreaterThanOrEqual(200);
    const g = await gels();
    expect(g.api).toBe("aucune");
    expect(g.n).toBe(0);
    expect(g.battement.n).toBeGreaterThan(0);
    expect(g.battement.couvertMs).toBeGreaterThan(0);
    // la traîne passée, plus un battement au repos
    const battements = () => page.evaluate(() => window.__essais.sonde.battements);
    await page.waitForTimeout(11_000);
    const fige = await battements();
    await page.waitForTimeout(1500);
    expect(await battements()).toBe(fige);
    // un geste le rallume
    await glisse(page);
    await expect.poll(battements).toBeGreaterThan(fige);
    expect(erreurs).toEqual([]);
  });
});

test.describe("la sonde silencieuse, la carte des environs", () => {
  /* Un fond vectoriel monte MapLibre après l'affichage. Cette carte-ci tient
     la page à sa création, puis dans son propre script avant de se dire
     chargée : la sonde doit dater chaque étape et rendre ce gel à MapLibre. */
  test("le montage de MapLibre, étape par étape, et ses gels", async ({ page }) => {
    const erreurs = await prepare(page);
    await releve(page);
    const donnees = JSON.parse(JSON.stringify(DONNEES));
    donnees.plans[0].calage = { lon: 2.287851, lat: 48.830212, x: 0, y: 0, angle: 0, fond: "maison" };
    await page.route("**/api/plan*", (r) => new URL(r.request().url()).searchParams.get("entete")
      ? r.fulfill({ json: { v: "essai-carte" } })
      : r.fulfill({ status: 200, contentType: "application/json",
                    headers: { "X-Version": "essai-carte" }, body: JSON.stringify(donnees) }));
    await remplaceMapLibre(page, (r) => r.fulfill({
      contentType: /\.css$/.test(r.request().url()) ? "text/css" : "application/javascript",
      body: /\.css$/.test(r.request().url()) ? "" :
        "const tiens = (ms) => { const t = performance.now(); while (performance.now() - t < ms) {} };" +
        "window.maplibregl = { Map: class { constructor(o){ this.o = o; tiens(150); } " +
        "on(ev, f){ if (ev === 'load') setTimeout(() => { tiens(200); f(); }, 100); return this; } " +
        "jumpTo(){} setStyle(){} remove(){} resize(){} redraw(){} getCanvas(){ return null; } } };" }));
    await page.goto(PLAN);
    await attendLaListe(page);
    await affiche(page);
    const environs = () => page.evaluate(() => window.__essais.sonde.resume.environs);
    await expect.poll(async () => (await environs() || {}).chargeeMs, { timeout: 15_000 }).toBeGreaterThan(0);
    const e = await environs();
    expect(e.fond).toBe("maison");
    expect(e.demandeeMs).toBeGreaterThan(0);
    expect(e.bibliothequeMs).toBeGreaterThanOrEqual(0);
    expect(e.creationMs).toBeGreaterThanOrEqual(140);
    expect(e.chargeeMs).toBeGreaterThan(e.bibliothequeMs);
    // le gel du script de la carte, vu par le navigateur et rendu à MapLibre
    await expect.poll(async () => (await environs()).gels.maplibreMs).toBeGreaterThanOrEqual(150);
    expect((await environs()).gels.n).toBeGreaterThan(0);
    expect(erreurs).toEqual([]);
  });
});

test.describe("la sonde silencieuse, au fil de la visite", () => {
  test("un glisser puis l'arrière-plan : la même visite repart, ses gestes comptés", async ({ page }) => {
    const erreurs = await prepare(page);
    const envois = await releve(page);
    await page.goto(PLAN);
    await attendLaListe(page);
    await affiche(page);
    await expect.poll(() => envois.length, { timeout: 15_000 }).toBe(1);
    await glisse(page);
    await page.waitForTimeout(600);
    await cache(page);
    await expect.poll(() => envois.length).toBe(2);
    expect(envois[1].visite).toBe(envois[0].visite);
    expect(envois[1].resume.fluidite.classique.gestes).toBeGreaterThanOrEqual(1);
    expect(envois[1].resume.fluidite.classique.tranches.reduce((a, b) => a + b, 0)).toBeGreaterThan(0);
    // le glisser était sur le plan : rien hors de lui
    expect(envois[1].resume.fluidite.horsPlan).toBeUndefined();
    vraisemblable(envois[1].resume);
    /* Les images du geste où le dessin était revenu au repos : absentes en
       SVG, ou si aucune image n'est tombée entre le retour au repos et la fin
       du geste — sous un dessin imité au processeur, cela arrive. */
    const repos = envois[1].resume.fluidite.classique.auRepos;
    if (repos !== undefined) {
      expect(repos).toHaveLength(2);
      expect(repos[0]).toBeGreaterThan(0);
      expect(repos[1]).toBeLessThanOrEqual(repos[0]);
    }
    expect(erreurs).toEqual([]);
  });

  test("la borne change de visite toutes les heures", async ({ page }) => {
    const erreurs = await prepare(page);
    const envois = await releve(page);
    await page.clock.install();
    await page.goto(PLAN + "&borne");
    await attendLaListe(page);
    await affiche(page);
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
      await affiche(page);
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
    await affiche(page);
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

/* Un tap lent sur iPhone ne disait que sa durée : l'attente, le traitement et
   l'image qui l'a suivi se séparent désormais (`sonde.mjs` `partsDeLInteraction`). */
test.describe("la sonde silencieuse, ce qu'un tap lent a coûté", () => {
  test("la pire interaction dit où son temps est passé, et qu'elle portait sur le plan", async ({ page }) => {
    const erreurs = await prepare(page);
    const envois = await releve(page);
    await page.goto(PLAN.replace("&rendu=svg", ""));
    await attendLaListe(page);
    await affiche(page);
    await page.waitForFunction(() => window.__essais.GL.actif, null, { timeout: 30_000 });
    /* Un relâché qui travaille 200 ms : c'est le traitement qui doit les porter,
       bien que l'appui, rapporté le premier, ait la même durée que lui. */
    await page.evaluate(() => document.getElementById("stage").addEventListener("pointerup", () => {
      const t = performance.now();
      while (performance.now() - t < 200) { /* le travail qu'un geste demanderait */ }
    }, true));
    const p = await standAViser(page);
    expect(p).not.toBeNull();
    await page.mouse.click(p.x, p.y);
    await expect(page.locator("#detail")).toBeVisible();
    await page.waitForTimeout(300);
    /* La mesure du geste arrive après l'image qui le montre : on cache la page
       pour faire partir le relevé, jusqu'à ce qu'il la porte. */
    await expect.poll(async () => {
      await cache(page);
      const dernier = envois.at(-1);
      return Boolean(dernier && dernier.resume.reactivite.pire);
    }, { timeout: 15_000 }).toBe(true);
    const r = envois.at(-1).resume;
    const d = r.reactivite.pire;
    expect(r.reactivite.pireMs).toBeGreaterThanOrEqual(200);
    expect(d.traitementMs).toBeGreaterThanOrEqual(190);
    expect(d.attenteMs).toBeGreaterThanOrEqual(0);
    expect(d.presentationMs).toBeGreaterThanOrEqual(0);
    expect(d.surLePlan).toBe(true);
    /* La règle du découpage seule : l'image bloquée exprès compte parfois dans
       la fluidité sans geste (« fluidite »), la même incohérence que des
       relevés réels portent déjà (18 et 19 novembre 2026), et dont cet essai
       n'est pas l'objet. */
    expect(incoherences(r).filter((x) => x.cle === "decoupe")).toEqual([]);
    expect(erreurs).toEqual([]);
  });

  /* Un relâché peint dans la même image que son appui, mais parti tard : sa
     durée est sous le seuil des statistiques, et son traitement doit pourtant
     rester au découpage. Le cas se fabrique — un vrai tap ne le donne pas à
     coup sûr — et passe par la même réception que les entrées du navigateur. */
  test("un relâché plus court que le seuil reste au découpage de son geste", async ({ page }) => {
    const erreurs = await prepare(page);
    await releve(page);
    await page.goto(PLAN);
    await attendLaListe(page);
    const pire = await page.evaluate(() => {
      const S = window.__essais.sonde, cible = document.getElementById("stage");
      const T = performance.now() + 100000, id = 987654;
      S.recoisEntree({ name: "pointerdown", interactionId: id, startTime: T, duration: 200,
        processingStart: T + 120, processingEnd: T + 130, target: cible });
      S.recoisEntree({ name: "pointerup", interactionId: id, startTime: T + 128, duration: 72,
        processingStart: T + 130, processingEnd: T + 190, target: cible });
      return S.resume.reactivite;
    });
    expect(pire.pireMs).toBe(200);
    // seul l'appui passe le seuil : le relâché ne compte pas, mais il découpe
    expect(pire.n).toBe(1);
    expect(pire.pire).toMatchObject({ attenteMs: 120, traitementMs: 70, presentationMs: 10, surLePlan: true });
    expect(erreurs).toEqual([]);
  });

  /* Les doigts levés lents sur iPhone attendaient la page sans dire ce qui la
     tenait (FUNEXPO, 19 et 20 novembre 2026). Un travail inscrit au journal
     tient la page de l'appui jusqu'après le relâché : l'attente du relâché doit
     le nommer, le battement doit avoir vu le fil tenu, et le geste se dire un
     tap — sans chemin, un doigt. */
  test("l'attente d'un doigt levé dit ce qui tenait la page, et ce qu'était le geste", async ({ page }) => {
    /* Hors de la CI, pour l'instant : l'essai règle à quelques dizaines de
       millisecondes près l'appui, le travail et le relâché, quand le poste de
       la CI gèle le rendu jusqu'à deux secondes et laisse plus de 400 ms entre
       deux ordres de l'essai — le relâché y arrivait le travail fini, ou était
       traité avant lui (journal du run 44812277148, 20 novembre 2026). Il
       garde un outil de diagnostic, non ce que voit le visiteur ; il se lance
       à la main : `npx playwright test sonde.spec.js -g "doigt levé"`. */
    test.skip(Boolean(process.env.CI), "réglé trop finement pour le poste de la CI — se lance à la main");
    const erreurs = await prepare(page);
    const envois = await releve(page);
    await page.goto(PLAN.replace("&rendu=svg", ""));
    await attendLaListe(page);
    await affiche(page);
    await page.waitForFunction(() => window.__essais.GL.actif, null, { timeout: 30_000 });
    /* L'ordre se tient sans compter sur l'horloge : sur le poste de la CI,
       « mouse.down » rendait la main plus d'une seconde après l'appui, et le
       relâché, prévu trente millisecondes plus tard, arrivait bien après le
       travail. Le doigt se pose donc là où rien ne monte ni ne s'ouvre — un
       stand qui monte y gelait la page une seconde et demie au rendu
       logiciel, et ce gel devenait la pire interaction de la visite —, son
       image passe, puis le travail commence et le relâché part aussitôt :
       il arrive pendant le travail, quelle que soit la lenteur du poste. */
    const p = await pointVide(page);
    expect(p).not.toBeNull();
    // ce que le navigateur dit du geste, pour qu'un échec sur la CI s'explique dans son journal
    await page.evaluate(() => {
      window.__geste = { entrees: [], travail: null };
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) {
          if (!/^pointer(down|up)$/.test(e.name)) continue;
          window.__geste.entrees.push({ nom: e.name, id: e.interactionId, debut: Math.round(e.startTime),
            duree: e.duration, attente: Math.round(e.processingStart - e.startTime),
            traitement: Math.round(e.processingEnd - e.processingStart) });
        }
      }).observe({ type: "event", durationThreshold: 16 });
    });
    await page.mouse.move(p.x, p.y);
    await page.mouse.down();
    await deuxImages(page);
    await page.evaluate(() => {
      setTimeout(() => window.__essais.sonde.chronometre("essai", () => {
        const t = performance.now();
        window.__geste.travail = Math.round(t);
        while (performance.now() - t < 400) { /* la page tenue */ }
      }), 0);
    });
    await page.mouse.up();
    await page.waitForTimeout(300);
    try {
      await expect.poll(async () => {
        await cache(page);
        const dernier = envois.at(-1);
        return Boolean(dernier && dernier.resume.reactivite.pire && dernier.resume.reactivite.pire.occupe);
      }, { timeout: 15_000 }).toBe(true);
    } catch (e) {
      const dernier = envois.at(-1), geste = await page.evaluate(() => window.__geste);
      const mesures = JSON.stringify({ reactivite: dernier && dernier.resume.reactivite, geste });
      /* Le préalable d'abord : un relâché arrivé hors du travail — après lui,
         ou traité avant qu'il commence — ne dit rien de la sonde. Le
         navigateur ne relève l'entrée du relâché que s'il a attendu. */
      const releve = geste.entrees.find((x) => x.nom === "pointerup");
      const pendant = Boolean(releve && geste.travail !== null &&
        releve.debut >= geste.travail && releve.debut < geste.travail + 400);
      if (!pendant) throw new Error("scénario non exploitable, le relâché n'est pas arrivé pendant le travail : " + mesures, { cause: e });
      throw new Error("la sonde n'a pas dit ce qui tenait la page : " + mesures, { cause: e });
    }
    const r = envois.at(-1).resume;
    const d = r.reactivite.pire;
    expect(r.rev).toBe(7);
    expect(d.attenteMs).toBeGreaterThanOrEqual(150);
    // l'attente est la nôtre, et le travail qui la tenait est nommé le premier
    expect(d.occupe.nosMs).toBeGreaterThanOrEqual(150);
    expect(d.occupe.travaux[0]).toMatchObject({ n: "essai" });
    expect(d.occupe.travaux[0].ms).toBeGreaterThanOrEqual(150);
    // le battement veillait depuis l'appui : il a vu le fil tenu
    expect(d.occupe.bloqueMs).toBeGreaterThanOrEqual(100);
    expect(d.geste).toMatchObject({ px: 0, doigts: 1 });
    expect(d.geste.ms).toBeGreaterThanOrEqual(0);
    expect(incoherences(r).filter((x) => x.cle === "decoupe" || x.cle === "attente-occupee")).toEqual([]);
    expect(octets(r)).toBeLessThanOrEqual(PLAFOND);
    expect(erreurs).toEqual([]);
  });

  /* Trois défauts relevés par CodeRabbit sur la #564, que le clic réel ne
     provoque pas à coup sûr : les entrées se fabriquent, et passent par la même
     réception que celles du navigateur. Les pointeurs, eux, sont de vrais
     événements, que la sonde entend comme les autres — posés sur le corps de la
     page, hors du plan, pour que ses gestes ne les reprennent pas. */
  test("l'attente suit le journal : relâché d'abord, blocage vu après, veille close avant la fin", async ({ page }) => {
    const erreurs = await prepare(page);
    await releve(page);
    await page.goto(PLAN);
    await attendLaListe(page);
    const r = await page.evaluate(async () => {
      const S = window.__essais.sonde, corps = document.body;
      const pointe = (type, x) => {
        const e = new PointerEvent(type, { pointerId: 77, bubbles: true, clientX: x, clientY: 10 });
        corps.dispatchEvent(e);
        return e;
      };
      const tient = (ms) => { const t = performance.now(); while (performance.now() - t < ms) { /* la page tenue */ } };
      const pire = () => JSON.parse(JSON.stringify(S.resume.reactivite.pire || null));

      // l'appui et le relâché d'un glisser de trente pixels, peints dans la même image
      const bas = pointe("pointerdown", 10);
      tient(20);
      pointe("pointermove", 40);
      const haut = pointe("pointerup", 40);
      const fin = haut.timeStamp + 5000;
      S.recoisEntree({ name: "pointerdown", interactionId: 9001, startTime: bas.timeStamp, duration: fin - bas.timeStamp,
        processingStart: bas.timeStamp + 1, processingEnd: bas.timeStamp + 2, target: corps });
      S.recoisEntree({ name: "pointerup", interactionId: 9001, startTime: haut.timeStamp, duration: fin - haut.timeStamp,
        processingStart: haut.timeStamp + 1, processingEnd: haut.timeStamp + 2, target: corps });
      const geste = pire().geste;

      /* Une attente qui recouvre un blocage à venir : le découpage se fait
         avant que le battement en retard l'inscrive. */
      const a = performance.now();
      S.recoisEntree({ name: "pointerup", interactionId: 9002, startTime: a, duration: 6000,
        processingStart: a + 400, processingEnd: a + 401, target: corps });
      const avant = pire().occupe;
      tient(300);
      await new Promise((ok) => setTimeout(ok, 150));
      const apres = pire().occupe;

      /* La page cachée, le battement se tait et sa veille se clôt : une
         attente qui court au-delà n'a plus de témoin. */
      Object.defineProperty(document, "hidden", { value: true, configurable: true });
      document.dispatchEvent(new Event("visibilitychange", { bubbles: true }));
      await new Promise((ok) => setTimeout(ok, 150));
      const b = performance.now();
      S.recoisEntree({ name: "pointerup", interactionId: 9003, startTime: a, duration: 7000,
        processingStart: b, processingEnd: b + 1, target: corps });
      return { geste, avant, apres, close: pire().occupe, ms: Math.round(haut.timeStamp - bas.timeStamp) };
    });
    // le relâché dit la durée et le chemin du geste, non l'appui de la même image
    expect(r.geste).toMatchObject({ px: 30, ms: r.ms, doigts: 1 });
    expect(r.geste.ms).toBeGreaterThanOrEqual(20);
    // le blocage inscrit après le découpage y entre
    expect(r.avant.bloqueMs || 0).toBeLessThan(100);
    expect(r.apres.bloqueMs).toBeGreaterThanOrEqual(200);
    // la veille close avant la fin de l'attente : sa part est tue, non dite nulle
    expect(r.close).not.toHaveProperty("bloqueMs");
    expect(erreurs).toEqual([]);
  });
});

test.describe("la sonde silencieuse, ce qu'elle tient pour le plan", () => {
  /* Taper dans la recherche, faire défiler la liste : des images que le plan
     ne dessine pas. Elles comptaient dans sa fluidité. */
  test("un geste hors du plan ne compte pas dans sa fluidité", async ({ page }) => {
    const erreurs = await prepare(page);
    const envois = await releve(page);
    await page.goto(PLAN);
    await attendLaListe(page);
    await affiche(page);
    await page.locator("#q").click();
    await page.keyboard.type("stand", { delay: 40 });
    await page.waitForTimeout(600);
    await cache(page);
    await expect.poll(() => envois.length).toBeGreaterThan(0);
    const f = envois[envois.length - 1].resume.fluidite;
    expect(f.horsPlan && f.horsPlan.gestes).toBeGreaterThanOrEqual(1);
    expect(f.classique.gestes).toBe(0);
    expect(f.classique.tranches.reduce((a, b) => a + b, 0)).toBe(0);
    vraisemblable(envois[envois.length - 1].resume);
    expect(erreurs).toEqual([]);
  });

  /* Un plan intégré plus bas que l'écran de la page hôte : le navigateur ne
     lui donne plus d'images, et son ouverture dit quand on y est descendu.
     Le relevé doit le dire, sans quoi la fiche le prend pour un plan lent. */
  test("intégré hors de l'écran, l'ouverture se dit invisible et le LCP se tait", async ({ page }) => {
    const erreurs = await prepare(page);
    const envois = await releve(page);
    await page.route("**/hote-essai", (r) => r.fulfill({ contentType: "text/html; charset=utf-8",
      body: "<!doctype html><meta charset=utf-8><div style='height:5000px'></div>" +
        "<iframe src='" + PLAN + "' style='width:800px;height:600px;border:0'></iframe>" }));
    await page.goto("/hote-essai");
    const cadre = page.frameLocator("iframe");
    await cadre.locator("#list > *").first().waitFor();
    await expect.poll(() => envois.length, { timeout: 25_000 }).toBeGreaterThan(0);
    const r = envois[0].resume;
    expect(r.support).toBe("integre");
    expect(r.chargement.horsVueAvant).toBe(true);
    expect(r.chargement.invisibleAvantMs).toBeGreaterThan(0);
    expect(r.chargement.jalons.lcp).toBeUndefined();
    vraisemblable(r);
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
    /* La liste n'a ici que son message d'attente : le plan ne vient jamais.
       `attendLaListe` attend une ligne d'exposant, qui ne paraîtra pas — c'est
       la page posée qu'on attend, non ses données. */
    await page.locator("#list > *").first().waitFor();
    await page.waitForTimeout(1000);
    expect(await page.evaluate(() => document.documentElement.classList.contains("plan-affiche"))).toBe(false);
    await cache(page);
    await expect.poll(() => envois.length).toBeGreaterThan(0);
    const a = envois[0].resume.appareil;
    expect(typeof a.navigateur.famille).toBe("string");
    expect(typeof a.mobile).toBe("boolean");
    // un départ, non une panne : la fiche ne le comptera pas parmi les plans absents
    expect(envois[0].resume.chargement.cacheeAvant).toBe(true);
    expect(envois[0].resume.chargement.panne).toBeUndefined();
    // le temps passé caché, que la fiche retire des délais d'ouverture
    expect(envois[0].resume.chargement.invisibleAvantMs).toBeGreaterThan(0);
    vraisemblable(envois[0].resume);
    expect(erreurs).toEqual([]);
  });

  test("le serveur refuse le plan : la panne part sans attendre, nommée, et le robot se dit", async ({ page }) => {
    await prepare(page);
    const envois = await releve(page);
    // la page d'erreur d'un relais n'est pas du JSON
    await page.route("**/api/plan**", (r) => r.fulfill({ status: 502, contentType: "text/html", body: "<h1>502</h1>" }));
    await page.goto(PLAN);
    await expect(page.locator("#list .empty")).toContainText("Plan indisponible : HTTP 502");
    // bien avant les trente secondes d'un plan qui ne paraît pas
    await expect.poll(() => envois.length, { timeout: 5_000 }).toBeGreaterThan(0);
    const r = envois.at(-1).resume;
    expect(r.chargement.panne).toEqual({ sorte: "http", statut: 502 });
    expect(r.chargement.cacheeAvant).toBeUndefined();
    expect(r.chargement.jalons["plan-affiche"]).toBeUndefined();
    expect(r.api.echecs).toBeGreaterThan(0);
    expect(r.api.statuts["502"]).toBeGreaterThan(0);
    // Playwright pilote le navigateur : la fiche du lundi l'écartera
    expect(r.appareil.robot).toBe(true);
    expect(r.erreurs).toBeUndefined();
  });

  /* Les demandes du plan lui-même : ni l'entête, ni les vignettes, ni le fond. */
  const lePlan = (u) => u.pathname === "/api/plan" &&
    [...u.searchParams.keys()].every((k) => k === "slug" || k === "v");
  /* Sous la version que l'entête annonce (`aide.js`) : sous une autre,
     `demandePlan` l'écarterait d'emblée, et la reprise ne serait pas éprouvée. */
  // un JSON arrêté au milieu, comme un téléchargement coupé dans un hall
  const TRONQUE = '{"plans":[{"id":"p1","nom":"Hall';

  /** Les erreurs envoyées au relais, sans rien laisser partir. */
  async function signalements(page) {
    const signalees = [];
    await page.route("**/api/erreur", (r) => {
      signalees.push(...JSON.parse(r.request().postData() || "null").erreurs.map((e) => e.message));
      return r.fulfill({ status: 204, body: "" });
    });
    return signalees;
  }

  test("un plan reçu illisible se redemande au réseau, et la reprise se signale", async ({ page }) => {
    const erreurs = await prepare(page);
    const envois = await releve(page);
    const signalees = await signalements(page);
    let demandes = 0;
    // posée après celle de `prepare`, cette route passe devant elle ; la seconde fois, elle s'efface
    await page.route(lePlan, (r) => (++demandes === 1
      ? r.fulfill({ status: 200, contentType: "application/json", headers: { "X-Version": "essai" }, body: TRONQUE })
      : r.fallback()));
    await page.goto(PLAN);
    // le visiteur ne voit rien : le plan paraît
    await attendLaListe(page);
    expect(demandes).toBe(2);
    await expect(page.locator("#list .empty")).toHaveCount(0);
    await expect.poll(() => signalees.length, { timeout: 5_000 }).toBeGreaterThan(0);
    expect(signalees[0]).toContain("Plan illisible : tronquee, réseau, repris");
    await cache(page);
    await expect.poll(() => envois.length).toBeGreaterThan(0);
    expect(envois.at(-1).resume.chargement.panne).toBeUndefined();
    expect(erreurs).toEqual([]);
  });

  test("un plan toujours illisible : la panne dit ce qui est arrivé, et « Réessayer » recharge", async ({ page }) => {
    const erreurs = await prepare(page);
    const envois = await releve(page);
    const signalees = await signalements(page);
    let casse = true;
    await page.route(lePlan, (r) => (casse
      ? r.fulfill({ status: 200, contentType: "application/json", headers: { "X-Version": "essai" }, body: TRONQUE })
      : r.fallback()));
    await page.goto(PLAN);
    await expect(page.locator("#list .empty")).toContainText("Plan indisponible : réponse illisible");
    await expect.poll(() => envois.length, { timeout: 5_000 }).toBeGreaterThan(0);
    // ce qui était arrivé à la place du plan, sans rien de son contenu
    expect(envois.at(-1).resume.chargement.panne).toEqual({
      sorte: "http", statut: 200, lecture: { recu: "tronquee", octets: TRONQUE.length } });
    await expect.poll(() => signalees.length, { timeout: 5_000 }).toBeGreaterThan(0);
    expect(signalees[0]).toContain("Plan illisible : tronquee, réseau");
    expect(signalees[0]).not.toContain("repris");
    // le relais répond de nouveau : le bouton suffit
    casse = false;
    await page.locator("#list .empty .reessai").click();
    await attendLaListe(page);
    expect(erreurs).toEqual([]);
  });

  test("une exception au démarrage : signalée, jointe au relevé, et non prise pour le réseau", async ({ page }) => {
    const erreurs = await prepare(page);
    const envois = await releve(page);
    const signalees = [];
    await page.route("**/api/erreur", (r) => {
      signalees.push(JSON.parse(r.request().postData() || "null"));
      return r.fulfill({ status: 204, body: "" });
    });
    // un pavillon vide : le montage lit ce qui n'existe pas
    await page.route((u) => u.pathname === "/api/plan" && !u.searchParams.has("entete"),
      (r) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ plans: [null] }) }));
    await page.goto(PLAN);
    await expect(page.locator("#list .empty")).toContainText("une erreur de la page");
    await expect(page.locator("#list .empty")).not.toContainText("réseau");
    await expect.poll(() => envois.length, { timeout: 5_000 }).toBeGreaterThan(0);
    const r = envois.at(-1).resume;
    expect(r.chargement.panne.sorte).toBe("code");
    expect(r.erreurs.n).toBeGreaterThan(0);
    const e = r.erreurs.premieres[0];
    expect(e.message).toMatch(/TypeError/);
    // la position dans le script servi, que le Worker ramène au module
    expect(e.fichier).toMatch(/^\/versions\/plan\.[0-9a-f]{10}\.js$/);
    expect(e.ligne).toBeGreaterThan(0);
    expect(e.colonne).toBeGreaterThan(0);
    // et la même erreur part au relais des erreurs, comme avant la garde
    await expect.poll(() => signalees.length, { timeout: 5_000 }).toBeGreaterThan(0);
    expect(signalees[0].erreurs[0].message).toBe(e.message);
    // rattrapée par le démarrage, elle ne remonte pas jusqu'à la console
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

