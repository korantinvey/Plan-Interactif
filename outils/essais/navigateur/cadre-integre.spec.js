/**
 * Intégré dans le site d'un salon, le tiroir de la liste reste à portée.
 *
 * Le site de Funexpo 2026 pose le plan dans un cadre plus haut que ce qu'un
 * téléphone en montre, sous son propre en-tête. Les tiroirs se posaient au bas
 * du cadre : la liste descendue à son cran le plus bas passait sous le bord de
 * l'écran, et rien ne permettait plus de la reprendre. Ils se posent désormais
 * au bas de la part visible (`modules/cadre-visible.mjs`).
 */
const { test, expect } = require("@playwright/test");
const { prepare, attendLaListe } = require("./aide.js");

/* Un en-tête de site, puis un cadre bien plus haut que l'écran : la moitié de
   sa hauteur tombe sous le bord. Servi de la même origine que le plan, que
   `prepare` laisse seule passer. */
const SITE = "/site-du-salon.html";
const PAGE_DU_SITE = `<!doctype html><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<body style="margin:0">
<header style="height:150px">Le salon</header>
<iframe id="cadre" src="/plan?plan=smcl-2026&rendu=svg" style="display:block;width:100%;height:1400px;border:0"></iframe>
</body>`;

/** Le haut et le bas de la poignée de la liste, dans l'écran du site. */
async function poigneeVue(page, cadre) {
  const decalage = await page.locator("#cadre").evaluate((n) => n.getBoundingClientRect().top);
  const r = await cadre.locator("#poignee").evaluate((n) => {
    const b = n.getBoundingClientRect();
    return { haut: b.top, bas: b.bottom };
  });
  return { haut: r.haut + decalage, bas: r.bas + decalage, ecran: await page.evaluate(() => innerHeight) };
}

test("intégré dans un cadre plus haut que l'écran, la liste repliée reste en vue @telephone", async ({ page }) => {
  test.slow();
  const erreurs = await prepare(page);
  await page.route("**" + SITE, (r) => r.fulfill({ contentType: "text/html", body: PAGE_DU_SITE }));
  await page.goto(SITE);
  const cadre = page.frameLocator("#cadre");
  test.skip(await cadre.locator("body").evaluate(() => innerWidth > 900), "la liste n'est un tiroir que sur écran étroit");
  await attendLaListe(cadre);

  const tiroir = cadre.locator("#side");
  await expect(tiroir).not.toHaveAttribute("data-cran", /demi|plein/);
  /* Replié, la poignée et la recherche se voient au bas de l'écran — et non au
     bas du cadre, cinq cents pixels plus bas. */
  await expect.poll(async () => {
    const p = await poigneeVue(page, cadre);
    return p.haut >= 0 && p.bas <= p.ecran;
  }).toBe(true);

  /* On la hisse, puis on la redescend d'un geste poussé bien au-delà du bas :
     elle s'arrête à son cran le plus bas, toujours en vue, et se reprend. */
  await cadre.locator("#poignee").click();
  await expect(tiroir).toHaveAttribute("data-cran", "demi");
  /* La poignée se mesure posée, et non pendant la montée du tiroir : on
     visait sinon l'endroit d'où elle partait. */
  let prise = await poigneeVue(page, cadre);
  await expect.poll(async () => {
    const avant = prise.haut;
    prise = await poigneeVue(page, cadre);
    return Math.abs(prise.haut - avant) < 1;
  }).toBe(true);
  const x = 200;
  await page.mouse.move(x, prise.haut + 10);
  await page.mouse.down();
  for (let y = prise.haut + 10; y < prise.ecran - 2; y += 40) await page.mouse.move(x, y);
  await page.mouse.move(x, prise.ecran - 2);
  await page.mouse.up();
  await expect(tiroir).toHaveAttribute("data-cran", "replie");
  await expect.poll(async () => {
    const p = await poigneeVue(page, cadre);
    return p.haut >= 0 && p.bas <= p.ecran;
  }).toBe(true);

  await cadre.locator("#poignee").click();
  await expect(tiroir).toHaveAttribute("data-cran", "demi");
  expect(erreurs).toEqual([]);
});
