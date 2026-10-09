/**
 * Le plan tel qu'un visiteur s'en sert : il s'ouvre, on y cherche, on y lit
 * une fiche, on change de pavillon, on le lit en anglais.
 */
const { test, expect } = require("@playwright/test");
const { prepare, attendLaListe, DONNEES, PREMIER } = require("./aide.js");

const PLAN = "/plan?plan=smcl-2026";

test.describe("le plan public", () => {
  test("s'ouvre sans erreur, liste et stands en place @telephone", async ({ page }) => {
    const erreurs = await prepare(page);
    await page.goto(PLAN);
    const lignes = await attendLaListe(page);
    // tous les stands du pavillon ouvert, ni plus ni moins
    await expect(lignes).toHaveCount(PREMIER);
    expect(await page.locator("svg [data-id]").count()).toBeGreaterThanOrEqual(PREMIER);
    expect(erreurs).toEqual([]);
  });

  /* Sur un téléphone, le premier cadrage mesurait le tiroir de la liste en
     train de glisser : il variait de quelques pixels d'un chargement à
     l'autre, et ne valait pour aucun. Une fois tout posé, il doit être celui
     que la page referait d'elle-même — c'est ce que fait un « resize ». */
  test("le premier cadrage vaut pour la liste posée @telephone", async ({ page }) => {
    const erreurs = await prepare(page);
    await page.goto(PLAN);
    await attendLaListe(page);
    await page.waitForFunction(() => document.getElementById("side").getAnimations().length === 0);
    // l'écart, en pixels d'écran : il en faisait une quinzaine
    const ecart = await page.evaluate(() => {
      const g = /** @type {any} */ (globalThis);
      const avant = g.view;
      dispatchEvent(new Event("resize"));
      const pixel = g.view.w / document.getElementById("plan").getBoundingClientRect().width;
      return Math.max(...["x", "y", "w", "h"].map((k) => Math.abs(g.view[k] - avant[k]) / pixel));
    });
    expect(ecart).toBeLessThan(1);
    expect(erreurs).toEqual([]);
  });

  test("la recherche resserre la liste, et la rend quand on l'efface", async ({ page }) => {
    const erreurs = await prepare(page);
    await page.goto(PLAN);
    const lignes = await attendLaListe(page);
    const avant = await lignes.count();
    // un numéro de stand est sans ambiguïté, là où un nom pourrait en recouper d'autres
    const numero = (await lignes.first().innerText()).trim().split(/\s+/)[0];
    await page.fill("#q", numero);
    await expect.poll(() => lignes.count()).toBeLessThan(avant);
    expect(await lignes.count()).toBeGreaterThan(0);
    await page.fill("#q", "");
    await expect.poll(() => lignes.count()).toBe(avant);
    expect(erreurs).toEqual([]);
  });

  test("une ligne de la liste ouvre la fiche de son exposant @telephone", async ({ page }) => {
    const erreurs = await prepare(page);
    await page.goto(PLAN);
    const lignes = await attendLaListe(page);
    const texte = (await lignes.first().innerText()).trim().split("\n");
    const nom = texte.find((l) => l.length > 3 && !/^\w?\d/.test(l)) || texte[0];
    /* Sur un téléphone, la liste est un tiroir replié au bas de l'écran : on y
       arrive en cherchant, comme le visiteur, plutôt qu'en forçant un clic sur
       une ligne qu'il ne voit pas. */
    await page.fill("#q", texte[0].trim());
    await expect.poll(() => lignes.count()).toBeLessThan(PREMIER);
    await lignes.first().click();
    await expect(page.locator("#detail")).toContainText(nom.trim());
    expect(erreurs).toEqual([]);
  });

  test("les onglets passent d'un pavillon à l'autre", async ({ page }) => {
    test.skip(DONNEES.plans.length < 2, "un seul pavillon dans les données");
    const erreurs = await prepare(page);
    await page.goto(PLAN);
    await attendLaListe(page);
    const onglets = page.locator("#halls button");
    await expect(onglets).toHaveCount(DONNEES.plans.length);
    await expect(onglets.nth(0)).toHaveAttribute("aria-pressed", "true");
    await onglets.nth(1).click();
    await expect(onglets.nth(1)).toHaveAttribute("aria-pressed", "true");
    await expect(onglets.nth(0)).toHaveAttribute("aria-pressed", "false");
    expect(erreurs).toEqual([]);
  });

  test("s'ouvre en anglais par l'adresse", async ({ page }) => {
    const erreurs = await prepare(page);
    await page.goto(PLAN + "&lang=en");
    await attendLaListe(page);
    await expect(page.locator("#q")).toHaveAttribute("placeholder", "Exhibitor, stand…");
    expect(erreurs).toEqual([]);
  });

  test("le drapeau passe à l'anglais sans recharger", async ({ page }) => {
    const erreurs = await prepare(page);
    await page.goto(PLAN);
    await attendLaListe(page);
    await expect(page.locator("#q")).toHaveAttribute("placeholder", "Exposant, stand…");
    await page.evaluate(() => { window.__memePage = true; });
    await page.click("#btnLangue");
    await expect(page.locator("#q")).toHaveAttribute("placeholder", "Exhibitor, stand…");
    expect(await page.evaluate(() => window.__memePage)).toBe(true);
    expect(erreurs).toEqual([]);
  });

  test("se dessine aussi sans WebGL", async ({ page }) => {
    const erreurs = await prepare(page);
    await page.goto(PLAN + "&rendu=svg");
    await attendLaListe(page);
    expect(await page.locator("svg [data-id]").count()).toBeGreaterThanOrEqual(PREMIER);
    expect(erreurs).toEqual([]);
  });

  test("propose la visite guidée au visiteur neuf, une fois", async ({ page }) => {
    const erreurs = await prepare(page, { premiereVisite: true });
    await page.goto(PLAN);
    await attendLaListe(page);
    const modale = page.locator("#modale");
    await expect(modale).toContainText("Découvrir le plan");
    await page.keyboard.press("Escape");
    await expect(modale).not.toHaveClass(/open/);
    await page.reload();
    await attendLaListe(page);
    await page.waitForTimeout(3000);
    await expect(modale).not.toHaveClass(/open/);
    expect(erreurs).toEqual([]);
  });
});

test.describe("le plan de démonstration", () => {
  test("se suffit de ses données embarquées", async ({ page }) => {
    const erreurs = await prepare(page);
    const demandes = [];
    page.on("request", (r) => { if (r.url().includes("/api/plan")) demandes.push(r.url()); });
    await page.goto("/plan-smcl.html");
    const lignes = await attendLaListe(page);
    await expect(lignes).toHaveCount(PREMIER);
    expect(demandes).toEqual([]);
    expect(erreurs).toEqual([]);
  });
});

/* Les règles de `modules/sur.mjs`, éprouvées sur ce qu'un visiteur ne devrait
   jamais recevoir. Elles ne dépendent de rien du plan : on les appelle telles
   que la page les tient, puis on pose leur sortie dans le document pour
   vérifier que rien ne s'y exécute. */
test.describe("ce qui vient d'ailleurs", () => {
  test("les adresses et les logos ne gardent que ce qui ne s'exécute pas", async ({ page }) => {
    const erreurs = await prepare(page);
    await page.goto(PLAN);
    await attendLaListe(page);
    const r = await page.evaluate(() => {
      // ce que les modules confient aux essais (`modules/plan.mjs` `__essais`)
      const { adresseSure, imageSure, adresseImage } = /** @type {any} */ (globalThis).__essais;
      return {
        refusees: ["javascript:alert(1)", " JaVaScRiPt:alert(1)", "java\u0000script:alert(1)",
          "data:text/html,<script>alert(1)</script>", "vbscript:x", "ftp://x.fr", "@compte"]
          .map((v) => adresseSure(v)),
        gardees: ["https://exemple.fr", "exemple.fr/page", "mailto:a@b.fr", "tel:+33100000000"]
          .map((v) => adresseSure(v)),
        images: ["data:image/svg+xml;base64,PHN2Zz4=", "https://x.fr/logo.png", "javascript:alert(1)",
          "data:image/png;base64,iVBORw0KGgo="].map((v) => imageSure(v)),
        logos: ["javascript:alert(1)", "data:image/png;base64,AAAA", "https://x.fr/l.png"]
          .map((v) => adresseImage(v)),
      };
    });
    expect(r.refusees).toEqual(["", "", "", "", "", "", ""]);
    expect(r.gardees).toEqual(["https://exemple.fr", "https://exemple.fr/page", "mailto:a@b.fr",
      "tel:+33100000000"]);
    expect(r.images).toEqual(["", "", "", "data:image/png;base64,iVBORw0KGgo="]);
    expect(r.logos).toEqual(["", "", "https://x.fr/l.png"]);
    expect(erreurs).toEqual([]);
  });

  /* Le dernier rempart : si une injection passait les règles de
     `modules/sur.mjs`, la politique de sécurité de la page (`outils/genere.js`
     `poseCsp`) refuse encore de l'exécuter — et la page, elle, n'en viole
     aucune en se chargeant. */
  test("un script injecté ne s'exécute pas, et la page n'enfreint pas sa politique", async ({ page }) => {
    await page.addInitScript(() => {
      const w = /** @type {any} */ (window);
      w.__violations = [];
      document.addEventListener("securitypolicyviolation",
        (e) => w.__violations.push(e.violatedDirective + " " + (e.blockedURI || "en ligne")));
    });
    const erreurs = await prepare(page);
    await page.goto(PLAN);
    await attendLaListe(page);
    expect(await page.evaluate(() => /** @type {any} */ (window).__violations)).toEqual([]);
    const r = await page.evaluate(async () => {
      const w = /** @type {any} */ (window);
      w.__pirate = 0;
      const s = document.createElement("script");
      s.textContent = "window.__pirate = 1";
      document.body.appendChild(s);
      await new Promise((ok) => setTimeout(ok, 200));
      return { pirate: w.__pirate, violations: w.__violations.length };
    });
    expect(r).toEqual({ pirate: 0, violations: 1 });
    // le refus est annoncé dans la console : c'est lui, et lui seul
    expect(erreurs.filter((e) => !/Content Security Policy/.test(e))).toEqual([]);
  });

  test("une description ne garde que sa mise en forme", async ({ page }) => {
    const erreurs = await prepare(page);
    await page.goto(PLAN);
    await attendLaListe(page);
    const r = await page.evaluate(() => {
      const { assainitRiche } = /** @type {any} */ (globalThis).__essais;
      const piege = "window.__piege = 1";
      const entrees = [
        "<p>Bonjour <b>gras</b> <i>it</i></p>",
        "<script>" + piege + "</script>texte",
        "<img src=x onerror=\"" + piege + "\">après",
        "<a href=\"javascript:" + piege + "\">lien</a>",
        "<a href=\"exemple.fr\" onclick=\"" + piege + "\">site</a>",
        "<svg><script>" + piege + "</script><style>*{}</style>t</svg>",
        "<iframe srcdoc=\"<script>" + piege + "</script>\"></iframe>ok",
        "<div>un<ul><li>a</li></ul>deux</div>",
      ];
      const sorties = entrees.map((h) => assainitRiche(h));
      // posées dans la page, comme la fiche le fait : rien ne doit s'y lancer
      const hote = document.createElement("div");
      hote.innerHTML = sorties.join("");
      document.body.appendChild(hote);
      return { sorties, balises: [...new Set([...hote.querySelectorAll("*")].map((e) => e.tagName))].sort(),
        attributs: [...new Set([...hote.querySelectorAll("*")].flatMap((e) => e.getAttributeNames()))].sort() };
    });
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => /** @type {any} */ (window).__piege)).toBeUndefined();
    expect(r.balises).toEqual(["A", "EM", "LI", "P", "STRONG", "UL"]);
    expect(r.attributs).toEqual(["href", "rel", "target"]);
    expect(r.sorties[0]).toBe("<p>Bonjour <strong>gras</strong> <em>it</em></p>");
    expect(r.sorties[3]).toBe("<p>lien</p>");
    expect(r.sorties[4]).toBe('<p><a href="https://exemple.fr" target="_blank" rel="noopener">site</a></p>');
    // le texte d'un script, même glissé dans un SVG, n'est pas du texte
    expect(r.sorties.join("")).not.toContain("__piege");
    expect(r.sorties[7]).toBe("<p>un</p><ul><li>a</li></ul><p>deux</p>");
    expect(erreurs).toEqual([]);
  });
});

test.describe("les autres pages", () => {
  for (const [nom, adresse] of [
    ["l'accueil", "/index.html"],
    ["la console", "/admin-plans.html"],
    ["le rapport", "/rapport.html"],
    ["le mot de passe", "/motdepasse.html"],
    ["la page hors ligne", "/hors-ligne.html"],
  ]) {
    test(nom + " s'ouvre sans erreur", async ({ page }) => {
      const erreurs = await prepare(page);
      await page.goto(adresse);
      await page.waitForLoadState("networkidle");
      expect(await page.locator("body").innerText()).not.toBe("");
      expect(erreurs).toEqual([]);
    });
  }

  /* Chacune de ces deux fenêtres ouvre l'autre à sa place : la fermeture qui
     suit un bouton emportait celle qu'il venait d'ouvrir, et il ne restait
     aucune fenêtre. */
  test("la console passe de la connexion au projet, et retour", async ({ page }) => {
    const erreurs = await prepare(page);
    await page.goto("/admin-plans.html");
    const titre = page.locator("#mTitre"), pied = page.locator("#mPied button");
    await expect(titre).toHaveText("Connexion");
    await pied.filter({ hasText: "Changer de projet" }).click();
    await expect(page.locator("#modale")).toHaveClass(/\bopen\b/);
    await expect(titre).toHaveText("Connexion au projet");
    await pied.filter({ hasText: "Valider" }).click();
    await expect(page.locator("#modale")).toHaveClass(/\bopen\b/);
    await expect(titre).toHaveText("Connexion");
    expect(erreurs).toEqual([]);
  });

  // la redirection n'arrête pas le script : la console chargeait pendant qu'elle partait
  test("la console renvoie un jeton de mot de passe sans rien charger", async ({ page }) => {
    await prepare(page);
    const appels = [];
    await page.addInitScript(() => {
      localStorage.setItem("console-config", JSON.stringify({ url: "https://base.essai", anonKey: "anon" }));
      localStorage.setItem("console-session", JSON.stringify({ access_token: "a.b.c" }));
    });
    await page.route("https://base.essai/**", (r) => { appels.push(r.request().url()); return r.fulfill({ json: [] }); });
    // la page d'arrivée tarde : c'est pendant ce temps que la console chargeait
    await page.route("**/motdepasse*", async (r) => {
      await new Promise((f) => setTimeout(f, 800));
      await r.fulfill({ contentType: "text/html", body: "<p>mot de passe</p>" });
    });
    await page.goto("/admin-plans.html#access_token=x&type=recovery");
    await expect(page).toHaveURL(/\/motdepasse#access_token=x&type=recovery$/);
    expect(appels).toEqual([]);
  });

  test("l'administration d'un plan demande d'abord qui l'on est", async ({ page }) => {
    const erreurs = await prepare(page);
    await page.goto("/plan-admin.html?plan=smcl-2026");
    await page.waitForLoadState("networkidle");
    expect(erreurs).toEqual([]);
  });
});

/* `/plan-<salon>` est l'adresse que l'application d'un salon ouvre. Deux pages
   de `web/` commencent pareil, et Cloudflare sert chacune à son adresse nue :
   `/plan-admin`, `/plan-smcl`. Elles ne nomment aucun salon — l'administration
   prenait « admin » pour le sien, et le partait chercher, l'annonçait, le
   rangeait. */
test.describe("le salon que nomme l'adresse", () => {
  /** Le salon que la page s'est donné, une fois ses modules chargés — sans
   *  attendre le plan, que la démonstration met longtemps à dessiner. */
  const salonDe = async (page, adresse) => {
    await page.goto(adresse, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => typeof /** @type {any} */ (window).__essais?.SLUG === "string");
    return page.evaluate(() => /** @type {any} */ (window).__essais.SLUG);
  };

  test("l'administration à son adresse nue n'est pas un salon", async ({ page }) => {
    const erreurs = await prepare(page);
    // faute de `?plan=`, le salon que la construction a posé, comme à `/plan-admin.html`
    expect(await salonDe(page, "/plan-admin")).toBe(await salonDe(page, "/plan-admin.html"));
    expect(await salonDe(page, "/plan-admin")).toBe("smcl-2026");
    expect(await salonDe(page, "/plan-admin?plan=fep27")).toBe("fep27");
    expect(erreurs).toEqual([]);
  });

  test("la démonstration à son adresse nue n'est pas un salon", async ({ page }) => {
    await prepare(page);
    // aucun salon, comme à `/plan-smcl.html` : ses données sont dans la page
    expect(await salonDe(page, "/plan-smcl")).toBe("");
  });

  test("l'adresse d'un salon le nomme toujours", async ({ page }) => {
    await prepare(page);
    expect(await salonDe(page, "/plan-fep27")).toBe("fep27");
    expect(await salonDe(page, "/plan-admins")).toBe("admins");
    expect(await salonDe(page, "/plan-smcl-2026")).toBe("smcl-2026");
  });

  test("l'anglais fermé par l'exploitant le reste à l'adresse nue", async ({ page }) => {
    await prepare(page);
    /* Ce que l'administration de ce salon a appris de lui : le français seul.
       La clé nomme le salon ; lue sous « admin », elle ne disait plus rien. */
    await page.addInitScript(() => localStorage.setItem("plan-langues:admin@smcl-2026", "fr"));
    await page.goto("/plan-admin?lang=en");
    expect(await page.evaluate(() => /** @type {any} */ (window).LANGUE.code)).toBe("fr");
  });

  test("le service de second plan range l'administration à part", async ({ page, context }) => {
    await prepare(page);
    /* Les demandes que le service fait lui-même échappent à la page : elles
       se refusent au contexte, pour que l'essai ne doive rien au réseau. */
    await context.route("**/api/**", (r) => r.fulfill({ status: 204, body: "" }));
    // le plan public inscrit le service, qui vaut ensuite pour tout le domaine
    await page.goto(PLAN);
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.goto("/plan-admin");
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);
    const rangee = (chemin) => page.evaluate(async (c) => {
      const r = await caches.match(c);
      return r ? (await r.text()).includes('data-role="admin"') : null;
    }, chemin);
    // rangée sous son propre chemin, jamais sous celui du plan public
    await expect.poll(() => rangee("/plan-admin")).toBe(true);
    expect(await rangee("/plan")).not.toBe(true);
  });
});
