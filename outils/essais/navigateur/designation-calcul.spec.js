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
const compare = (page, pendantLaMontee = false, autour = null) => page.evaluate(async ({ attendre, autour }) => {
  const d = window.__essais.GL.deck, cv = d.canvas.getBoundingClientRect();
  /* Un stand en mouvement : sa couche porte `hausse` (`webgl.mjs` `animeCouche`
     en règle `elevationScale` d'après `echelleHausse`). Celle que l'appui pose
     garde l'identifiant de sa couche de volumes, suffixé `-tot` ; la
     reconversion la nomme `-hausse-` : c'est la propriété qui les dit toutes
     deux. La couche reste un instant après l'arrivée, à l'échelle 1 : ce
     n'est plus la montée. */
  const bouge = (l) => Boolean(l && (l.props.hausse || /-hausse-/.test(l.id)));
  const couches = () => (d.props.layers || []).flat(Infinity);
  const monte = () => couches().some((l) => bouge(l) && l.props.elevationScale > 0 && l.props.elevationScale < 1);
  /* Pendant la montée : la grille se lit dans l'image même où la couche du
     stand qui monte est là — rien ne se peint entre les deux. Une montée
     jamais vue ne retient pas l'essai jusqu'à son délai : elle se dit
     (`enMontee`), et l'essai échoue là-dessus. */
  if (attendre) {
    const fin = performance.now() + 5000;
    await new Promise((ok) => { const f = () => (couches().some(bouge) || performance.now() > fin ? ok() : requestAnimationFrame(f)); f(); });
    /* La montée suit l'horloge : au rendu logiciel, la page gèle plus d'une
       seconde quand le stand part, et la première image qui suit le trouve
       arrivé, ou presque — à 0,99 de sa hauteur, un calcul qui l'ignorerait
       ne s'écarterait pas d'un demi-pixel. Sa couche est donc toujours
       reposée à mi-hauteur — ce que la montée lui fait à chaque image — le
       temps de la grille, qui se lit sans rendre la main : l'image suivante
       la refait d'après l'horloge. */
    if (couches().some(bouge)) {
      const mi = (ls) => ls.map((l) => (Array.isArray(l) ? mi(l) : bouge(l) ? l.clone({ elevationScale: .5 }) : l));
      d.setProps({ layers: mi(d.props.layers) });
    }
  }
  const cle = (o) => (o ? o.layer.id + "#" + o.index : "rien");
  const enMontee = monte();
  const r = { points: 0, trouves: 0, abstenus: 0, loin: [], enMontee };
  // une grille lâche : chaque question à la carte graphique logicielle du banc coûte cher, en immersif surtout
  const points = [];
  for (let y = 6; y < cv.height; y += 31) for (let x = 6; x < cv.width; x += 31) points.push([x, y]);
  /* Et serrée autour du stand qui monte : sa hauteur ne change la réponse que
     sur une bande au bord de son toit, que la grille lâche enjambe — un
     calcul qui ignorait la hauteur de la montée y passait inaperçu. */
  if (autour) {
    const cx = autour.x - cv.left, cy = autour.y - cv.top;
    for (let y = cy - 48; y <= cy + 48; y += 6) for (let x = cx - 48; x <= cx + 48; x += 6) points.push([x, y]);
  }
  for (const [x, y] of points) {
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
}, { attendre: pendantLaMontee, autour });

for (const ambiance of ["classique", "immersif"]) {
  test(`la désignation calculée est celle de la carte graphique — ${ambiance}`, async ({ page }) => {
    /* Trois grilles de près de mille questions, chacune posée aussi à la carte
       graphique logicielle : une vingtaine de secondes l'une en immersif, le
       double quand un autre essai se partage le processeur. */
    test.setTimeout(240_000);
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
    /* En immersif, la grille se lit pendant la montée même, et dit qu'elle l'a
       vue. À plat, rien ne monte : la grille se lit sur le stand choisi.
       La montée se guette avant le clic : elle dure à peine plus d'une
       seconde, et sur le poste de la CI le clic rendait parfois la main
       après elle — l'essai attendait alors une montée finie jusqu'à son délai. */
    const monte = ambiance === "immersif";
    const guet = monte ? compare(page, true, p) : null;
    await page.mouse.click(p.x, p.y);
    const pendant = await (guet || compare(page, false));
    // une grille où le calcul s'abstiendrait partout ne comparerait rien
    expect({ abstenus: pendant.abstenus, compares: pendant.points > 0, loin: pendant.loin })
      .toEqual({ abstenus: 0, compares: true, loin: [] });
    if (monte) expect(pendant.enMontee).toBe(true);
    await page.waitForTimeout(1500);
    const apres = await compare(page);
    expect({ abstenus: apres.abstenus, compares: apres.points > 0, loin: apres.loin })
      .toEqual({ abstenus: 0, compares: true, loin: [] });

    // un rayon : le calcul s'abstient, la carte répond
    expect(await page.evaluate(() => window.__essais.GL.deck.designe({ x: 100, y: 100, radius: 3 }))).toBeUndefined();
    expect(erreurs).toEqual([]);
  });
}
