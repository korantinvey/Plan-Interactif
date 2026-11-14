/**
 * Le style des stands et des zones, résolu sans la feuille
 * (`modules/style-emplacements.mjs`), contre le style que le navigateur calcule.
 *
 * Le dessin ne relit plus la feuille de style pour les stands et les zones :
 * il en tient les règles en JavaScript. Une règle changée d'un seul côté
 * changerait le plan des visiteurs sans que rien ne le dise. On compare donc
 * les deux, sous la forme que le dessin lit (`webgl.mjs` `formeGl`) — l'aplat
 * et son opacité, le trait, son épaisseur, ses tirets, l'opacité du groupe —,
 * pour chaque combinaison de ce que la feuille regarde : les classes et les
 * variables du groupe, les états de la racine, les couleurs réglées ou non.
 *
 * Le SVG caché est encore là : c'est lui qui sert de témoin. On n'attend pas
 * la première image du dessin, seulement que la page soit en rendu WebGL — la
 * feuille n'y anime rien (`html.rendu-webgl #plan *`), comme le dessin.
 */
const { test, expect } = require("@playwright/test");
const { prepare, attendLaListe } = require("./aide.js");

const PLAN = "/plan?plan=smcl-2026";

/** Compare, dans la page, chaque combinaison ; rend les écarts et ce qui a été vu. */
function compare() {
  const G = /** @type {any} */ (globalThis).__essais.emplacements;
  const racine = document.documentElement;
  const RACINE = ["ambiance-tuiles", "ambiance-immersif", "chaleur-halos", "poi-actif", "mode-geo-stands", "mode-geo-zones"];
  const ecarts = [];
  let vus = 0, focusVu = false;

  // ce que le dessin tire d'un style, calculé ou résolu
  const lu = (op, t) => {
    const trait = G.couleurGl(t.stroke, parseFloat(t.strokeOpacity));
    return {
      op: Math.round(parseFloat(op) * 1000) / 1000,
      plein: G.couleurGl(t.fill, parseFloat(t.fillOpacity)),
      trait,
      sw: trait ? parseFloat(t.strokeWidth) : null,
      fixe: trait ? t.vectorEffect === "non-scaling-stroke" : null,
      dash: trait && t.strokeDasharray && t.strokeDasharray !== "none"
        ? t.strokeDasharray.split(/[\s,]+/).map(parseFloat).filter(Number.isFinite) : null,
    };
  };
  const proches = (a, b) => (a === null || b === null) ? a === b
    : a.length === b.length && a.every((x, i) => Math.abs(x - b[i]) <= 1);
  const pareils = (a, b) => a.op === b.op && proches(a.plein, b.plein) && proches(a.trait, b.trait) &&
    (a.sw === null ? b.sw === null : Math.abs(a.sw - b.sw) < 1e-3) && a.fixe === b.fixe &&
    JSON.stringify(a.dash) === JSON.stringify(b.dash);

  const verifie = (g, etiquette) => {
    const path = g.querySelector(":scope > path");
    const calcule = lu(getComputedStyle(g).opacity, getComputedStyle(path));
    const st = G.styleEmplacement(g, G.jetonsEmplacements(g.parentNode));
    const resolu = lu(st.opacite, st.trace);
    vus++;
    if (g.matches(":focus-visible")) focusVu = true;
    if (!pareils(calcule, resolu) && ecarts.length < 12)
      ecarts.push({ ou: etiquette, racine: racine.className, groupe: g.getAttribute("class"),
        attributs: [...g.attributes].filter((a) => /^data-(sect|chaleur)$|^style$/.test(a.name)).map((a) => a.name + "=" + a.value).join(" "),
        calcule, resolu });
  };

  // tous les emplacements du pavillon, tels qu'ils sont
  for (const g of document.querySelectorAll("#stands > g, #zones > g")) verifie(g, "au repos");

  const stand = document.querySelector("#stands > g.stand");
  const zone = document.querySelector("#zones > g.zone");
  const SECT = [null, { h: "200" }, { h: "35", c: "#3a7d44" }];
  const CHAL = [null, "rgb(200, 60, 40)", "#c33", "hsl(10 70% 50%)"];
  const COULEURS = [null, { "--c-stand": "#e8f0ff", "--c-zone": "#2a9d8f", "--c-sel": "#ffd166", "--c-poi": "#e63946" }];
  const classe = (g, c, oui) => g.classList.toggle(c, oui);

  for (const couleurs of COULEURS) {
    for (const k of Object.keys(COULEURS[1])) racine.style.removeProperty(k);
    if (couleurs) for (const [k, v] of Object.entries(couleurs)) racine.style.setProperty(k, v);
    for (let r = 0; r < 1 << RACINE.length; r++) {
      RACINE.forEach((c, i) => racine.classList.toggle(c, Boolean(r & (1 << i))));
      for (let e = 0; e < 16; e++) {
        const [sel, dim, geo, focus] = [1, 2, 4, 8].map((b) => Boolean(e & b));
        for (const s of SECT) for (const ch of CHAL) {
          classe(stand, "sel", sel); classe(stand, "dim", dim); classe(stand, "geopick", geo);
          stand.toggleAttribute("data-sect", Boolean(s));
          stand.style.removeProperty("--sect-h"); stand.style.removeProperty("--sect-c");
          if (s) { stand.style.setProperty("--sect-h", s.h); if (s.c) stand.style.setProperty("--sect-c", s.c); }
          stand.toggleAttribute("data-chaleur", Boolean(ch));
          if (ch) stand.style.setProperty("--chal-c", ch); else stand.style.removeProperty("--chal-c");
          if (focus) stand.focus(); else stand.blur();
          verifie(stand, "stand");
        }
        for (const [phare, masquee] of [[false, false], [true, false], [false, true], [true, true]]) {
          classe(zone, "sel", sel); classe(zone, "dim", dim); classe(zone, "geopick", geo);
          classe(zone, "phare", phare); classe(zone, "masquee", masquee);
          if (focus) zone.focus(); else zone.blur();
          verifie(zone, "zone");
        }
      }
    }
  }
  return { vus, focusVu, ecarts };
}

test("le style des stands et des zones, résolu sans la feuille, est celui qu'elle calcule", async ({ page }) => {
  test.slow();
  const erreurs = await prepare(page);
  await page.goto(PLAN);
  await attendLaListe(page);
  await page.waitForFunction(() => document.documentElement.classList.contains("rendu-webgl"), null, { timeout: 60_000 });
  // une touche, pour que le focus posé ensuite se montre (`:focus-visible`) comme au clavier
  await page.keyboard.press("Shift");
  const r = await page.evaluate(compare);
  expect(r.focusVu, "le focus au clavier a bien été éprouvé").toBe(true);
  expect(r.vus).toBeGreaterThan(10_000);
  expect(r.ecarts, JSON.stringify(r.ecarts, null, 1)).toEqual([]);
  expect(erreurs).toEqual([]);
});
