/**
 * La visite guidée : la bulle ne doit cacher ni ce qu'elle désigne, ni ce
 * qu'elle demande de toucher.
 *
 * `prepare` présente d'ordinaire l'essai en habitué, la visite déjà proposée :
 * ici on la veut, et seule l'invitation à installer reste écartée — elle
 * passerait devant la proposition.
 */
/* Ce que l'essai lit dans la page : la visite en cours et le rendu du plan,
   que les modules ne confient qu'aux essais (`modules/plan.mjs` `__essais`).
   La visite change à chaque chapitre : `__essais.TUTO` est un accesseur, relu
   à chaque fois. */
const { test, expect } = require("@playwright/test");
const { prepare, DONNEES } = require("./aide.js");

const PLAN = "/plan?plan=smcl-2026";

/* `plans.json` n'a pas de programme : sans conférence rattachée à une zone, la
   visite n'a pas de chapitre des zones. On en pose une, dans une zone nommée
   du premier pavillon — celui qu'on regarde à l'ouverture. */
function avecUnProgramme() {
  const d = JSON.parse(JSON.stringify(DONNEES));
  const zone = d.plans[0].zones.find((z) => z.nom);
  d.plans[0].conferences = [{
    id: "essai-visite", nom: "Conférence d'essai", texte: null,
    debut: "2026-03-14T09:00:00Z", fin: "2026-03-14T10:00:00Z",
    debutLocal: "2026-03-14T10:00:00", finLocal: "2026-03-14T11:00:00",
    salleId: null, salle: zone.nom, zone: zone.id, type: null, couleur: null, theme: null,
  }];
  return JSON.stringify(d);
}

/** Ouvre le plan en premier visiteur, et accepte la visite qu'on lui propose. */
async function commenceLaVisite(page, { adresse = PLAN, donnees = null } = {}) {
  const erreurs = await prepare(page, { premiereVisite: true });
  await page.addInitScript(() => {
    for (const salon of ["smcl-2026", ""]) {
      localStorage.setItem("plan-installation:" + salon, JSON.stringify({ compris: true }));
    }
  });
  if (donnees) {
    // posée après celle de `prepare`, cette route passe devant elle
    await page.route("**/api/plan*", (r) => {
      if (new URL(r.request().url()).searchParams.get("entete")) {
        return r.fulfill({ json: { v: "essai" } });
      }
      return r.fulfill({ status: 200, contentType: "application/json",
        headers: { "X-Version": "essai" }, body: donnees });
    });
  }
  await page.goto(adresse);
  await page.locator("#modale.open").getByRole("button", { name: "Commencer" }).click();
  await expect(page.locator("#tuto")).toBeVisible();
  return erreurs;
}

/**
 * La zone désignée et la bulle, une fois l'une et l'autre au repos : la zone
 * telle que le visiteur la voit, quel que soit le rendu, et la bulle arrivée à
 * la place qu'elle a choisie. L'attente se fait dans la page, en un seul
 * aller-retour : à cette étape, la carte graphique logicielle d'un navigateur
 * sans écran ne tient que deux ou trois images par seconde, et chaque question
 * posée de l'extérieur attend la sienne.
 */
const auRepos = (page) => page.evaluate(() => new Promise((fini) => {
  const essais = /** @type {any} */ (globalThis).__essais;
  const { GL, rectEcranWebgl } = essais;
  const boite = (r) => r && { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
  const lis = () => {
    const z = document.getElementById("tutoZone");
    const TUTO = essais.TUTO;
    return { cle: TUTO && TUTO.cle, pos: TUTO && TUTO.pos,
      zone: boite(z && (GL.actif ? rectEcranWebgl(z) : z.getBoundingClientRect())),
      bulle: boite(document.getElementById("tuto").getBoundingClientRect()) };
  };
  const fin = performance.now() + 20000;
  let avant = "";
  const tour = () => {
    const e = lis(), cle = JSON.stringify(e);
    const posee = !!e.pos && Math.round(e.bulle.left) === e.pos[0] &&
                  Math.round(e.bulle.top) === e.pos[1];
    if ((cle === avant && posee) || performance.now() > fin) return fini(e);
    avant = cle;
    setTimeout(tour, 300);
  };
  tour();
}));

const recouvre = (a, b) =>
  Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
  Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));

/** L'étape en cours, `chapitre:étape`. */
const etape = (page) => page.evaluate(() => {
  const TUTO = /** @type {any} */ (globalThis).__essais.TUTO;
  return TUTO ? TUTO.cle : null;
});

/**
 * Ce que la bulle cache d'un élément de la page, une fois arrivée à sa place —
 * et si un toucher en son centre tomberait sur elle plutôt que sur lui.
 */
async function cacheLElement(page, selecteur) {
  await page.waitForFunction(() => {
    const r = document.getElementById("tuto").getBoundingClientRect();
    const TUTO = /** @type {any} */ (globalThis).__essais.TUTO;
    return !!TUTO && !!TUTO.pos && Math.round(r.left) === TUTO.pos[0] &&
           Math.round(r.top) === TUTO.pos[1];
  }, null, { polling: 100 });
  return page.evaluate((s) => {
    const c = document.querySelector(s).getBoundingClientRect();
    const b = document.getElementById("tuto").getBoundingClientRect();
    const dessus = document.elementFromPoint(c.left + c.width / 2, c.top + c.height / 2);
    const aire = Math.max(0, Math.min(c.right, b.right) - Math.max(c.left, b.left)) *
                 Math.max(0, Math.min(c.bottom, b.bottom) - Math.max(c.top, b.top));
    return { aire: Math.round(aire), auCentre: !!dessus && !!dessus.closest("#tuto") };
  }, selecteur);
}

/** Un point du plan au centre d'un stand, que rien ne recouvre à l'écran. */
const standLibre = (page) => page.evaluate(() => {
  const { GL, rectEcranWebgl } = /** @type {any} */ (globalThis).__essais;
  const st = document.getElementById("stage").getBoundingClientRect();
  for (const n of document.querySelectorAll("#stands g[data-id], svg g.stand[data-id]")) {
    const r = GL.actif ? rectEcranWebgl(n) : n.getBoundingClientRect();
    if (!r || r.width < 10 || r.height < 10) continue;
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    if (x < st.left + 30 || x > st.right - 30 || y < st.top + 30 || y > st.bottom - 30) continue;
    const e = document.elementFromPoint(x, y);
    if (!e || !e.closest("#stage") ||
        e.closest("#tuto, .tools, .zoombar, #poi, #side, #detail, #parcours, #itineraire, .topbar")) continue;
    return { x, y };
  }
  return null;
});

/* La trace garde ce qui s'est passé, mais sans le film de l'écran : à l'étape
   de la zone, la carte graphique logicielle redessine sans cesse le plan, et
   filmer chaque image figeait la page au-delà du temps d'un essai. */
test.use({ trace: { mode: "retain-on-failure", screenshots: false } });

test.describe("la visite guidée", () => {
  for (const rendu of ["", "&rendu=svg"]) {
    test("la bulle s'écarte de la zone désignée là où on la voit" + (rendu ? " (SVG)" : ""),
      async ({ page }) => {
        // deux ou trois images par seconde sous la carte graphique logicielle
        if (!rendu) test.slow();
        const erreurs = await commenceLaVisite(page, { adresse: PLAN + rendu, donnees: avecUnProgramme() });
        await page.waitForFunction(() => {
          const TUTO = /** @type {any} */ (globalThis).__essais.TUTO;
          return TUTO && TUTO.cle === "zones:zone";
        }, null,
          { polling: 250, timeout: 60_000 });
        if (!rendu) {
          // c'est la carte graphique qu'on éprouve : sans elle, l'essai ne dirait rien
          test.skip(!(await page.evaluate(() => /** @type {any} */ (globalThis).__essais.GL.actif)), "pas de WebGL2 dans ce navigateur");
        }
        // la zone est amenée sous les yeux, et la bulle posée à côté
        const avant = await auRepos(page);
        expect(avant.zone).not.toBeNull();
        expect(recouvre(avant.bulle, avant.zone)).toBe(0);

        /* Au repos, le plan ne se réécrit pas. La marque de la zone se
           reposait à chaque pouls de la visite, et la carte graphique, qui
           guette le SVG, redessinait tout le plan quatre fois par seconde. */
        const auCalme = await page.evaluate(() => new Promise((fini) => {
          const { GL } = /** @type {any} */ (globalThis).__essais;
          let ecritures = 0, peintures = 0;
          const guet = new MutationObserver((n) => { ecritures += n.length; });
          guet.observe(document.getElementById("plan"), { subtree: true, childList: true, attributes: true });
          const pose = GL.actif && GL.deck.setProps;
          if (pose) GL.deck.setProps = (p) => { if (p.layers) peintures++; return pose.call(GL.deck, p); };
          setTimeout(() => {
            guet.disconnect();
            if (pose) GL.deck.setProps = pose;
            fini({ ecritures, peintures });
          }, 1500);
        }));
        expect(auCalme).toEqual({ ecritures: 0, peintures: 0 });

        /* Le visiteur fait glisser le plan, et amène la zone sous la bulle :
           elle doit s'en écarter. Sous la carte graphique, la zone ne bouge
           pas dans le SVG caché — c'est ce que la bulle lisait. */
        const { bulle, zone } = avant;
        const x0 = (zone.left + zone.right) / 2, y0 = (zone.top + zone.bottom) / 2;
        const dx = (bulle.left + bulle.right) / 2 - x0, dy = (bulle.top + bulle.bottom) / 2 - y0;
        await page.mouse.move(x0, y0);
        await page.mouse.down();
        await page.mouse.move(x0 + dx / 2, y0 + dy / 2);
        await page.mouse.move(x0 + dx, y0 + dy);
        await page.mouse.up();
        const apres = await auRepos(page);
        expect(apres.cle).toBe("zones:zone");
        // la zone est bien venue là où se tenait la bulle
        expect(Math.abs(apres.zone.left - zone.left)).toBeGreaterThan(20);
        expect(Math.round(recouvre(apres.bulle, apres.zone))).toBe(0);
        expect(erreurs).toEqual([]);
      });
  }

  /* Sur un téléphone, la bulle prend la largeur de l'écran, et les pictos du
     plan se rangent au bord droit, sous la bande du salon : posée en haut, la
     bulle les couvrait, et toucher « Mon parcours » tombait sur elle — voire
     sur sa croix, qui quitte la visite. */
  test("la bulle ne couvre jamais le bouton qu'elle fait toucher @telephone", async ({ page }) => {
    // une demi-visite, geste après geste : plus que le temps d'un essai à côté d'un autre
    test.slow();
    const erreurs = await commenceLaVisite(page);
    const telephone = test.info().project.name === "telephone";
    const touche = (selecteur) => telephone ? page.locator(selecteur).tap() : page.locator(selecteur).click();
    // l'icône de l'itinéraire
    await expect.poll(() => etape(page)).toBe("itineraire:bouton");
    expect(await cacheLElement(page, "#btnItineraire")).toEqual({ aire: 0, auCentre: false });
    await touche("#tutoAvance");

    // le signet du parcours, présenté puis à toucher une fois un stand retenu
    await expect.poll(() => etape(page)).toBe("parcours:presente");
    expect(await cacheLElement(page, "#btnParcours")).toEqual({ aire: 0, auCentre: false });
    await touche("#tutoSuite");
    await expect.poll(() => etape(page)).toBe("parcours:stand");
    const stand = await standLibre(page);
    expect(stand).not.toBeNull();
    if (telephone) await page.touchscreen.tap(stand.x, stand.y);
    else await page.mouse.click(stand.x, stand.y);
    await expect.poll(() => etape(page)).toBe("parcours:signet");
    expect(await cacheLElement(page, "#dMarque")).toEqual({ aire: 0, auCentre: false });
    await touche("#dMarque");
    await expect.poll(() => etape(page)).toBe("parcours:liste");
    expect(await cacheLElement(page, "#btnParcours")).toEqual({ aire: 0, auCentre: false });
    // le toucher arrive au bouton, et la visite continue
    await touche("#btnParcours");
    await expect.poll(() => etape(page)).toBe("parcours:partage");
    expect(erreurs).toEqual([]);
  });
});
