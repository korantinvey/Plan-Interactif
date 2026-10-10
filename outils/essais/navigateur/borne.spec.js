/**
 * La borne et le code affiché dans le hall : le plan qui sait où il est.
 *
 * Les deux posent le même départ imposé et le même point (`modules/vous-etes-ici.mjs`),
 * et la borne referme au repos ce qu'un visiteur a laissé ouvert — fiche,
 * parcours, itinéraire, recherche. Tout cela passait par le code soudé, qui le
 * confiait à la borne ; elle l'importe désormais, et ces essais tiennent ce
 * qu'elle en fait.
 */
const { test, expect } = require("@playwright/test");
const { prepare, attendLaListe, DONNEES } = require("./aide.js");

const PLAN = "/plan?plan=smcl-2026";
/* Un stand du premier pavillon, nommé par son numéro : c'est ainsi que
   l'exploitant écrit une borne ou un code dans l'adresse. */
const STAND = DONNEES.plans[0].stands.find((s) => s.code);

/** Un point du plan que rien ne recouvre à l'écran, pour y poser le doigt. */
const pointLibre = (page) => page.evaluate(() => {
  const st = document.getElementById("stage").getBoundingClientRect();
  for (let fy = .5; fy < .9; fy += .1) {
    for (let fx = .5; fx < .9; fx += .1) {
      const x = st.left + st.width * fx, y = st.top + st.height * fy;
      const e = document.elementFromPoint(x, y);
      if (e && e.closest("#stage") &&
          !e.closest("#viseur, .tools, .zoombar, #poi, #side, #detail, #parcours, #itineraire, .topbar"))
        return { x, y };
    }
  }
  return null;
});

test.describe("la borne", () => {
  test("posée par l'adresse, elle dit d'où l'on part", async ({ page }) => {
    const erreurs = await prepare(page);
    await page.goto(PLAN + "&borne=" + encodeURIComponent(STAND.code));
    await attendLaListe(page);
    await expect(page.locator("html")).toHaveClass(/mode-borne/);
    await expect(page.locator("#iDepart")).toHaveValue("Vous êtes ici");
    expect(await page.locator("#iDepart").evaluate((c) => /** @type {HTMLInputElement} */ (c).readOnly))
      .toBe(true);
    await expect(page.locator("#borneIci")).toHaveCount(1);
    await expect(page.locator("#bornePose")).toBeHidden();
    expect(erreurs).toEqual([]);
  });

  test("à poser, la visée s'arme et son bandeau cède la place", async ({ page }) => {
    const erreurs = await prepare(page);
    await page.goto(PLAN + "&borne=poser");
    await attendLaListe(page);
    // la pose est demandée d'emblée : le bandeau de la visée parle, celui de la borne se tait
    await expect(page.locator("#viseur")).toBeVisible();
    await expect(page.locator("#viseurTxt")).toHaveText("Touchez le plan à l'endroit où cette borne est posée.");
    await expect(page.locator("#bornePose")).toBeHidden();
    const pt = await pointLibre(page);
    expect(pt).not.toBeNull();
    await page.mouse.click(pt.x, pt.y);
    await expect(page.locator("#borneIci")).toHaveCount(1);
    await expect(page.locator("#viseur")).toBeHidden();
    await expect(page.locator("#iDepart")).toHaveValue("Vous êtes ici");
    expect(await page.evaluate(() => localStorage.getItem("plan-borne:smcl-2026"))).toBeTruthy();
    expect(erreurs).toEqual([]);
  });

  test("au repos, elle referme ce que le visiteur a laissé", async ({ page }) => {
    const erreurs = await prepare(page);
    await page.clock.install();
    await page.goto(PLAN + "&borne=" + encodeURIComponent(STAND.code));
    const lignes = await attendLaListe(page);
    await page.fill("#q", STAND.code);
    await lignes.first().click();
    await expect(page.locator("#detail")).toHaveClass(/open/);
    // quatre-vingt-dix secondes sans un geste (`BORNE_REPOS`)
    await page.clock.fastForward(91_000);
    await expect(page.locator("#detail")).not.toHaveClass(/open/);
    await expect(page.locator("#q")).toHaveValue("");
    await expect(page.locator("#borneIci")).toHaveCount(1);
    await expect(page.locator("#iDepart")).toHaveValue("Vous êtes ici");
    expect(erreurs).toEqual([]);
  });
});

test.describe("le code affiché dans le hall", () => {
  test("pose le point, puis se retire avec lui", async ({ page }) => {
    const erreurs = await prepare(page);
    await page.goto(PLAN + "&ici=" + encodeURIComponent(STAND.code));
    await attendLaListe(page);
    await expect(page.locator("html")).toHaveClass(/mode-ici/);
    await expect(page.locator("#iDepart")).toHaveValue("Vous êtes ici");
    await expect(page.locator("#borneIci")).toHaveCount(1);
    await expect(page.locator("#iciRappel")).toBeVisible();
    await page.locator("#iciStop").click();
    await expect(page.locator("#borneIci")).toHaveCount(0);
    await expect(page.locator("#iciRappel")).toBeHidden();
    expect(new URL(page.url()).searchParams.has("ici")).toBe(false);
    expect(await page.locator("#iDepart").evaluate((c) => /** @type {HTMLInputElement} */ (c).readOnly))
      .toBe(false);
    expect(erreurs).toEqual([]);
  });
});
