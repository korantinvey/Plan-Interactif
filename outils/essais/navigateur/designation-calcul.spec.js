/**
 * Ce qui est sous la souris, tranché par le calcul, est ce que la carte
 * graphique désignerait (`modules/moteur-gl.mjs` `designe`,
 * `modules/moteur-gl-calcul.mjs`).
 *
 * Le survol et le clic ne demandent plus à la carte ce qu'ils visent : sa
 * relecture bloquait la page jusqu'à cent millisecondes sur un PC à carte
 * intégrée (`?perf`, FUNEXPO, 20 novembre 2026). Le moteur rejoue sa passe de
 * désignation sur le processeur. Une erreur de calcul ferait choisir un
 * stand voisin de celui qu'on voit, sans rien dire : l'essai pose la même
 * question aux deux sur une grille de l'écran, à plat et en immersif, au
 * repos et pendant la montée d'un stand choisi. Ils doivent s'accorder,
 * sauf à moins d'un demi-pixel d'un bord, où la carte tranche par ses propres
 * arrondis.
 */
const { test, expect } = require("@playwright/test");
const { prepare, attendLaListe, standAViser } = require("./aide.js");

/** La grille comparée : le calcul, la carte, et ce qui ne s'accorde pas même à un demi-pixel près. */
const compare = (page) => page.evaluate(() => {
  const d = window.__essais.GL.deck, cv = d.canvas.getBoundingClientRect();
  const cle = (o) => (o ? o.layer.id + "#" + o.index : "rien");
  const r = { points: 0, trouves: 0, abstenus: 0, loin: [] };
  // une grille lâche : chaque question à la carte graphique logicielle du banc coûte cher, en immersif surtout
  for (let y = 6; y < cv.height; y += 31) for (let x = 6; x < cv.width; x += 31) {
    const c = d.designe({ x, y, radius: 0 });
    if (c === undefined) { r.abstenus++; continue; }
    const g = cle(d.pickObject({ x, y, radius: 0 }));
    r.points++;
    if (g !== "rien") r.trouves++;
    if (cle(c) === g) continue;
    const pres = [[.5, 0], [-.5, 0], [0, .5], [0, -.5], [.5, .5], [-.5, -.5], [.5, -.5], [-.5, .5]]
      .some(([a, b]) => cle(d.designe({ x: x + a, y: y + b, radius: 0 })) === g);
    if (!pres) r.loin.push([x, y, cle(c), g]);
  }
  return r;
});

for (const ambiance of ["classique", "immersif"]) {
  test(`la désignation calculée est celle de la carte graphique — ${ambiance}`, async ({ page }) => {
    test.setTimeout(120_000);
    const erreurs = await prepare(page);
    await page.goto(`/plan?plan=smcl-2026&ambiance=${ambiance}`);
    await attendLaListe(page);
    const webgl = await page.waitForFunction(() => window.__essais.GL.actif && window.__essais.GL.deck, null, { timeout: 30_000 })
      .then(() => true, () => false);
    test.skip(!webgl, "pas de carte graphique : le plan reste en SVG");
    await page.waitForFunction(() => document.documentElement.classList.contains("plan-affiche"), null, { timeout: 30_000 });
    await page.waitForTimeout(1000);
    test.skip(await page.evaluate(() => typeof window.__essais.GL.deck.designe !== "function"), "deck.gl, le recours, n'a pas ce calcul");

    const repos = await compare(page);
    // le calcul répond partout, et trouve des stands : une grille vide ne prouverait rien
    expect(repos.abstenus).toBe(0);
    expect(repos.trouves).toBeGreaterThan(20);
    expect(repos.loin).toEqual([]);

    // un stand choisi monte : sa couche et ses hauteurs changent pendant qu'on vise
    const p = await standAViser(page);
    expect(p).not.toBeNull();
    await page.mouse.click(p.x, p.y);
    await page.waitForTimeout(150);
    expect((await compare(page)).loin).toEqual([]);
    await page.waitForTimeout(1500);
    expect((await compare(page)).loin).toEqual([]);

    // un rayon : le calcul s'abstient, la carte répond
    expect(await page.evaluate(() => window.__essais.GL.deck.designe({ x: 100, y: 100, radius: 3 }))).toBeUndefined();
    expect(erreurs).toEqual([]);
  });
}
