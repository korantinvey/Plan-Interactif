/**
 * Le style des noms du plan, résolu sans la feuille (`modules/style-libelles.mjs`),
 * contre le style que le navigateur calcule.
 *
 * Le dessin ne relit plus de témoins cachés dans le SVG pour savoir de quelle
 * encre, de quel liseré, de quelle police écrire chaque sorte de nom : il en
 * tient les règles en JavaScript. La feuille les garde pour le SVG de secours.
 * Une règle changée d'un seul côté changerait les noms des visiteurs sans que
 * rien ne le dise. L'essai pose donc, le temps de la mesure, les témoins
 * d'autrefois — un par sorte, dans « #labels » —, lit ce que la feuille leur
 * donne comme le dessin le lisait, et le compare à ce que le module résout,
 * pour chaque combinaison des états de la racine, couleurs réglées ou non.
 */
const { test, expect } = require("@playwright/test");
const { prepare, attendLaListe } = require("./aide.js");

function compare() {
  const E = /** @type {any} */ (globalThis).__essais;
  const { modelesLibelles, SORTES_LIBELLES, SORTES_PHARE } = E.stylesLibelles, { couleurGl } = E.emplacements;
  const NS = "http://www.w3.org/2000/svg", labels = document.getElementById("labels"), racine = document.documentElement;
  // les témoins : un texte, ou la pastille des coexposants, dans le groupe d'un nom
  const temoins = [];
  const temoin = (sorte, groupe, cle) => {
    const g = document.createElementNS(NS, "g");
    g.setAttribute("class", groupe);
    const t = document.createElementNS(NS, sorte.startsWith("coexPast") ? "rect" : "text");
    t.setAttribute("class", sorte.startsWith("coexPast") ? sorte : sorte.replace(/\bcd\b/, "").trim());
    if (t.localName === "text") t.textContent = "A";
    g.appendChild(t); labels.appendChild(g); temoins.push([cle, t]);
  };
  for (const s of SORTES_LIBELLES) temoin(s, "lbl", s);
  for (const s of SORTES_PHARE) temoin(s, "lbl phare", s + " phare");
  temoin("nm", "lbl pick", "pick");
  for (const [cle, style] of [["survol", "fill:var(--c-survol,var(--accent-soft));stroke:var(--accent)"],
                              ["poi", "fill:var(--c-poi,var(--accent))"]]) {
    const r = document.createElementNS(NS, "rect");
    r.setAttribute("style", style); labels.appendChild(r); temoins.push([cle, r]);
  }
  // ce que le dessin tirait d'un témoin (l'ancien `webgl.mjs` `lisModelesLibelles`)
  const lu = (t) => {
    const cs = getComputedStyle(t), op = parseFloat(getComputedStyle(t.parentNode).opacity) * parseFloat(cs.opacity);
    const sw = parseFloat(cs.strokeWidth), corps = parseFloat(cs.fontSize) || 16;
    const lisere = cs.paintOrder.startsWith("stroke") && cs.stroke !== "none" && sw > 0
      ? couleurGl(cs.stroke, (parseFloat(cs.strokeOpacity) || 1) * op) : null;
    return { couleur: couleurGl(cs.fill, (parseFloat(cs.fillOpacity) || 1) * op) || [0, 0, 0, 0],
      trait: couleurGl(cs.stroke, (parseFloat(cs.strokeOpacity) || 1) * op) || [0, 0, 0, 0],
      halo: lisere ? { couleur: lisere, largeur: sw / corps } : null,
      famille: cs.fontFamily, graisse: cs.fontWeight, visible: cs.display !== "none" };
  };
  const proches = (a, b) => (!a || !b) ? a === b : a.length === b.length && a.every((x, i) => Math.abs(x - b[i]) <= 1);
  const police = (f) => String(f).replace(/["']/g, "").replace(/\s*,\s*/g, ",").trim();
  /* La police et la graisse ne valent que pour un texte : une pastille ou une
     teinte n'en a pas à elle, et le dessin ne les y lit pas. */
  const pareils = (a, b, texte) => proches(a.couleur, b.couleur) && proches(a.trait, b.trait) &&
    (!a.halo || !b.halo ? !a.halo === !b.halo : proches(a.halo.couleur, b.halo.couleur) &&
      Math.abs(a.halo.largeur - b.halo.largeur) < .01) &&
    (!texte || (police(a.famille) === police(b.famille) && String(a.graisse) === String(b.graisse))) &&
    a.visible === b.visible;

  const ETATS = ["ambiance-tuiles", "mode-chaleur", "sans-lab-stand", "sans-lab-zone", "mode-libelles", "poi-actif",
    "tuto-retrait"];
  const REGLES = { "--c-lab-stand": "#2a6f97", "--c-lab-zone": "#8a5a00", "--c-lab-zone-lisere": "rgba(14,17,19,.75)",
    "--c-sel-trait": "#c0392b", "--c-survol": "#ffe9a8", "--c-poi": "#16a085", "--police-lab-nom": "Georgia, serif",
    "--graisse-lab-nom": "700" };
  const ecarts = [];
  let vus = 0;
  for (const regle of [false, true]) {
    for (const [k, val] of Object.entries(REGLES)) regle ? racine.style.setProperty(k, val) : racine.style.removeProperty(k);
    for (let m = 0; m < 1 << ETATS.length; m++) {
      ETATS.forEach((c, i) => racine.classList.toggle(c, Boolean(m & (1 << i))));
      const resolus = modelesLibelles(couleurGl);
      for (const [cle, t] of temoins) {
        const a = lu(t), b = resolus.get(cle);
        vus++;
        if (!b || !pareils(a, b, t.localName === "text")) {
          if (ecarts.length < 40) ecarts.push({ cle, etats: racine.className.replace(/ambiance-classique|page-sobre|plan-affiche/g, "").trim(), regle,
            feuille: JSON.stringify(a), resolu: JSON.stringify(b) });
        }
      }
    }
  }
  ETATS.forEach((c) => racine.classList.remove(c));
  for (const k of Object.keys(REGLES)) racine.style.removeProperty(k);
  for (const [, t] of temoins) (t.parentNode === labels ? t : t.parentNode).remove();
  return { vus, ecarts };
}

test("le style des noms résolu sans la feuille est celui qu'elle calcule", async ({ page }) => {
  test.setTimeout(120_000);
  const erreurs = await prepare(page);
  /* En rendu WebGL, comme le dessin lisait ses témoins : la feuille n'y anime
     rien (`html.rendu-webgl #plan *`), et le battement d'un nom mis en avant
     n'y couvre pas l'encre de la sélection. On n'attend pas la première image. */
  await page.goto("/plan?plan=smcl-2026");
  await attendLaListe(page);
  await page.waitForFunction(() => document.documentElement.classList.contains("rendu-webgl"), null, { timeout: 15_000 });
  const r = await page.evaluate(compare);
  expect(r.ecarts, JSON.stringify(r.ecarts, null, 1)).toEqual([]);
  // dix-neuf sortes, cent vingt-huit états de la racine, couleurs réglées ou non
  expect(r.vus).toBeGreaterThan(4000);
  expect(erreurs).toEqual([]);
});
