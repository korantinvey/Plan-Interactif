/**
 * Les noms se taillent dans la police où ils s'affichent.
 *
 * Le plan mesure chaque libellé avant de l'écrire, et garde la mesure. Une
 * police qui arrive après la première mesure — celle des numéros, que rien ne
 * demande avant que le plan s'écrive, ou celle d'un modèle choisi plus tard —
 * laissait en mémoire la largeur prise dans la police de repli : les noms
 * restaient placés et coupés pour une autre police que la leur.
 *
 * L'essai fait arriver les données après les polices de l'interface, puis
 * retient les fichiers de police le temps qu'il faut pour que le plan mesure
 * sans elles. Une fois tout arrivé, chaque largeur servie doit valoir une
 * mesure fraîche, et les libellés être ceux qu'un tracé neuf écrirait — en
 * SVG comme en WebGL, qui les relit.
 */
/* Ce que l'essai lit dans la page : le cache des mesures, les polices et le
   tracé des libellés, déclarés au niveau du script soudé — visibles par leur
   nom depuis `page.evaluate`, mais pas tous comme propriétés de `window`. */
/* global _lg, P_NOM, P_CODE, largeur, libelles, GL */
const { test, expect } = require("@playwright/test");
const { prepare, attendLaListe, DONNEES } = require("./aide.js");

const PLAN = "/plan?plan=smcl-2026";
const RETARD_POLICE = 800;

/* Le modèle « kraft » écrit les numéros dans une police que rien d'autre ne
   demande, et l'exploitant y préfère pour les noms une police au choix, dont
   la feuille n'arrive qu'à la demande (`feuillePolice`). */
const KRAFT = { _fiche: { modele: "kraft", police: "Anton" } };

for (const [nom, adresse, conf] of [
  ["en SVG", PLAN + "&rendu=svg", null],
  ["en WebGL", PLAN, null],
  ["en WebGL, modèle et police au choix", PLAN, KRAFT],
]) {
  test("une police arrivée après la mesure retaille les libellés " + nom, async ({ page }) => {
    const erreurs = await prepare(page);
    if (conf) await page.addInitScript((c) => localStorage.setItem("plan-conf:smcl-2026", c), JSON.stringify(conf));
    // chaque fichier de police se fait attendre : le plan a le temps de mesurer sans lui
    await page.route("**/polices/*.woff2", async (r) => {
      await new Promise((ok) => setTimeout(ok, RETARD_POLICE));
      await r.fallback();
    });
    /* Les données attendent que les polices de l'interface soient là : celles
       des libellés ne sont alors demandées qu'au premier tracé, une fois
       `document.fonts.ready` déjà tenu. */
    await page.route("**/api/plan?**", async (r) => {
      if (new URL(r.request().url()).searchParams.get("entete")) return r.fallback();
      /* Bornée en temps, non en tours : sur une machine chargée, chaque
         lecture dans la page s'allonge, et trois cents tours retenaient les
         données plus longtemps que l'essai ne les attend. */
      const limite = Date.now() + 15_000;
      while (Date.now() < limite) {
        const pret = await page.evaluate(() => document.readyState === "complete" &&
          document.fonts.status === "loaded").catch(() => false);
        if (pret) break;
        await new Promise((ok) => setTimeout(ok, 100));
      }
      await r.fallback();
    });
    await page.goto(adresse);
    await attendLaListe(page);
    await expect.poll(() => page.evaluate(() => document.fonts.status), { timeout: 60_000 }).toBe("loaded");
    // les polices des libellés ont bien attendu le tracé : sinon l'essai ne prouve rien
    const attendues = conf ? ["Courier Prime", "Anton"] : ["IBM Plex Mono"];
    expect(await page.evaluate((familles) => familles.every((n) =>
      [...document.fonts].some((f) => f.family.includes(n) && f.status === "loaded")), attendues)).toBe(true);
    await page.waitForTimeout(500);

    const bilan = await page.evaluate((stands) => {
      const c = document.createElement("canvas").getContext("2d");
      const frais = (txt, police) => {
        c.font = police[0] + " 100px " + police[1];
        const v = c.measureText(txt).width / 100;
        return v > 0 ? v : txt.length * .55;
      };
      const faux = [];
      for (const s of stands) {
        if (s.code && largeur(s.code, P_CODE) !== frais(s.code, P_CODE)) faux.push(s.code);
        if (s.nom && largeur(s.nom, P_NOM) !== frais(s.nom, P_NOM)) faux.push(s.nom);
      }
      // ce qui est écrit, comparé à ce qu'un tracé sur des mesures neuves écrirait
      const ecrit = () => GL.actif ? GL.cleLibelles : document.getElementById("labels").innerHTML;
      const avant = ecrit();
      _lg.clear();
      libelles();
      return { faux: faux.slice(0, 5), nFaux: faux.length, webgl: GL.actif, memes: avant === ecrit(),
        polices: [P_NOM[1], P_CODE[1]].join(" · ") };
    }, DONNEES.plans[0].stands.map((s) => ({ code: s.code, nom: s.nom })));

    expect(bilan.webgl).toBe(!adresse.includes("rendu=svg"));
    // la police préférée a bien remplacé celle du modèle pour les noms
    if (conf) expect(bilan.polices).toMatch(/^"Anton".*"Courier Prime"/);
    // les largeurs servies, puis les libellés écrits avec elles
    expect({ faux: bilan.faux, nFaux: bilan.nFaux, memes: bilan.memes })
      .toEqual({ faux: [], nFaux: 0, memes: true });
    expect(erreurs).toEqual([]);
  });
}
