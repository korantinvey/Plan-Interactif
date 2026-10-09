/**
 * La visite guidée : la bulle ne doit pas cacher ce qu'elle désigne.
 *
 * `prepare` présente d'ordinaire l'essai en habitué, la visite déjà proposée :
 * ici on la veut, et seule l'invitation à installer reste écartée — elle
 * passerait devant la proposition.
 */
/* Ce que l'essai lit dans la page : la visite en cours et le rendu du plan,
   visibles par leur nom depuis `page.evaluate`. */
/* global TUTO, GL, rectEcranWebgl */
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
  const boite = (r) => r && { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
  const lis = () => {
    const z = document.getElementById("tutoZone");
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
        await page.waitForFunction(() => TUTO && TUTO.cle === "zones:zone", null,
          { polling: 250, timeout: 60_000 });
        if (!rendu) {
          // c'est la carte graphique qu'on éprouve : sans elle, l'essai ne dirait rien
          test.skip(!(await page.evaluate(() => GL.actif)), "pas de WebGL2 dans ce navigateur");
        }
        // la zone est amenée sous les yeux, et la bulle posée à côté
        const avant = await auRepos(page);
        expect(avant.zone).not.toBeNull();
        expect(recouvre(avant.bulle, avant.zone)).toBe(0);

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
});
