/**
 * Le style des calques dessinés, résolu sans la feuille (`modules/style-calques.mjs`),
 * contre le style que le navigateur calcule.
 *
 * Le dessin peint les calques de l'exploitant depuis leurs pièces
 * (`modules/etat-formes.mjs`) et ne relit plus leur balisage ; la feuille
 * garde les règles `.dcal` pour le SVG de secours, et les deux doivent dire
 * la même chose. L'essai pose un jeu de calques qui couvre toutes les sortes
 * de formes — tracés, flèches, pointillés, texte tourné, image liée, stands
 * dessinés, repères à pictogramme, à libellé, arrêts de tram, de métro, de
 * bus —, dans des calques remplis, à rôle d'itinéraire, éteint. Chaque forme
 * porte ses marques une fois pour toutes, sur son nœud comme le font les
 * modules qui les décident, et au modèle : choisie, écartée, mise en avant,
 * ouverte, calée, teinte du secteur ou de la chaleur de son hôte. Puis, pour
 * chaque état de la racine, il compare, nœud par nœud, ce que la feuille
 * donne et ce que le module résout.
 */
const { test, expect } = require("@playwright/test");
const { prepare, attendLaListe, DONNEES } = require("./aide.js");

const PIXEL = "data:image/png;base64," +
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

/** Les calques de l'essai, posés près des premiers stands du premier pavillon. */
function calques(hotes) {
  const [x, y] = [-6800, 8800];
  const r = (dx, dy, w = 8, h = 6) => [[x + dx, y + dy], [x + dx + w, y + dy + h]];
  const sd = (id, i, dx) => ({ id, t: "stand", pts: r(dx, 40), stand: hotes[i], soc: -1 });
  return [
    { id: "c1", nom: "Formes", visible: true, couleur: "#c0392b", formes: [
      { id: "f-rect", t: "rect", pts: r(0, 0), r: 1 },
      { id: "f-poly", t: "poly", pts: [[x + 10, y], [x + 18, y], [x + 14, y + 7]] },
      { id: "f-fleche", t: "ligne", pts: [[x, y + 12], [x + 10, y + 14], [x + 20, y + 12]], fleche: "fin", ep: 4, pointille: true },
      { id: "f-fleches", t: "ligne", pts: [[x, y + 18], [x + 12, y + 18]], fleche: "deux" },
      { id: "f-texte", t: "texte", pts: [[x + 30, y + 5]], txt: "Allée A", taille: 3, rot: 30 },
      { id: "f-image", t: "image", src: PIXEL, pts: r(40, 0, 6, 4), stand: hotes[0], soc: -1 },
      { id: "f-cale", t: "rect", pts: r(50, 0) },
      sd("s-sel", 0, 0), sd("s-dim", 1, 10), sd("s-sect", 2, 20), sd("s-chal", 3, 30), sd("s-tout", 4, 40),
      { id: "s-seul", t: "stand", pts: r(50, 40) },
    ] },
    { id: "c2", nom: "Repères", visible: true, rempli: true, formes: [
      { id: "r-wc", t: "repere", pts: [[x, y + 60]], picto: "wc", taille: 2 },
      { id: "r-nom", t: "repere", pts: [[x + 12, y + 60]], picto: "", txt: "Accueil Nord", taille: 2 },
      { id: "r-tram", t: "repere", pts: [[x + 24, y + 60]], picto: "transport", mode: "tram", ligne: "T3a", taille: 2 },
      { id: "r-metro", t: "repere", pts: [[x + 36, y + 60]], picto: "transport", mode: "metro", ligne: "12", taille: 2 },
      { id: "r-bus", t: "repere", pts: [[x + 48, y + 60]], picto: "transport", mode: "bus", ligne: "38", taille: 2 },
      { id: "r-metro2", t: "repere", pts: [[x + 60, y + 60]], picto: "transport", mode: "metro", ligne: "3bis", taille: 2 },
    ] },
    { id: "c3", nom: "Allées", visible: true, couleur: "#16a085", formes: [
      { id: "a-rect", t: "rect", pts: r(0, 80) },
      { id: "a-fleche", t: "ligne", pts: [[x, y + 90], [x + 10, y + 90]], fleche: "fin", pointille: true },
      { id: "a-wc", t: "repere", pts: [[x + 20, y + 85]], picto: "wc", taille: 2 },
      { id: "a-tram", t: "repere", pts: [[x + 32, y + 85]], picto: "transport", mode: "tram", ligne: "2", taille: 2 },
      { ...sd("a-stand", 5, 40), pts: r(40, 80) },
    ] },
    { id: "c4", nom: "Réservé", visible: true, rempli: true, formes: [
      { id: "p-poly", t: "poly", pts: [[x, y + 100], [x + 10, y + 100], [x + 5, y + 108]] },
      { id: "p-wc", t: "repere", pts: [[x + 20, y + 104]], picto: "wc", taille: 2 },
    ] },
    { id: "c5", nom: "Murs", visible: true, rempli: true, couleur: "#333333", formes: [
      { id: "o-rect", t: "rect", pts: r(0, 120), pointille: true, ep: 3 },
      { id: "o-metro", t: "repere", pts: [[x + 20, y + 124]], picto: "transport", mode: "metro", ligne: "4", taille: 2 },
    ] },
    { id: "c6", nom: "Éteint", visible: false, formes: [{ id: "e-rect", t: "rect", pts: r(0, 140) }] },
  ];
}

/** Les marques de chaque forme, posées comme leurs modules les posent. */
const MARQUES = {
  sel: ["s-sel", "s-tout"], dim: ["s-dim", "s-tout"], phare: ["r-tram", "r-metro", "r-nom", "a-tram"],
  ouvert: ["r-wc", "r-metro", "o-metro"], cale: ["f-cale"],
};

async function ouvre(page) {
  const erreurs = await prepare(page);
  const donnees = JSON.parse(JSON.stringify(DONNEES));
  const hotes = donnees.plans[0].stands.slice(0, 6).map((s) => s.id);
  donnees.plans[0].dessins = calques(hotes);
  donnees.plans[0].apparence = { modifie_le: "2026-01-01", reglages: {
    "_iti:c3": { role: "circulation" }, "_iti:c4": { role: "circulation-pmr" }, "_iti:c5": { role: "obstacle" } } };
  await page.route("**/api/plan*", (r) => new URL(r.request().url()).searchParams.get("entete")
    ? r.fulfill({ json: { v: "essai-calques" } })
    : r.fulfill({ status: 200, contentType: "application/json",
                  headers: { "X-Version": "essai-calques" }, body: JSON.stringify(donnees) }));
  /* En rendu WebGL, comme le dessin peint : la feuille n'y anime rien
     (`html.rendu-webgl #plan *`), et la forme neuve ne bat pas. */
  await page.goto("/plan?plan=smcl-2026");
  await attendLaListe(page);
  const webgl = await page.waitForFunction(() => document.documentElement.classList.contains("rendu-webgl"), null,
    { timeout: 15_000 }).then(() => true, () => false);
  await page.waitForFunction(() => document.querySelectorAll("#couches .dcal").length === 6);
  // les marques, sur les nœuds et au modèle ; la teinte des hôtes, au modèle des emplacements
  await page.evaluate(({ MARQUES, hotes }) => {
    const F = /** @type {any} */ (globalThis).__essais.formes;
    const noeud = (id) => document.querySelector('#couches [data-f="' + id + '"]');
    for (const [nom, ids] of Object.entries(MARQUES)) {
      F.poseMarques(nom, ids);
      for (const id of ids) {
        const n = noeud(id);
        if (nom === "cale") n.dataset.cale = "1";
        else n.classList.add(nom === "ouvert" ? "sel" : nom);
      }
    }
    const teinte = (id, attr, prop, val) => { const n = noeud(id); n.setAttribute(attr, ""); n.style.setProperty(prop, val); };
    teinte("s-sect", "data-sect", "--sect-h", "200"); teinte("s-tout", "data-sect", "--sect-h", "40");
    noeud("s-tout").style.setProperty("--sect-c", "#ff00aa");
    teinte("s-chal", "data-chaleur", "--chal-c", "#e74c3c"); teinte("s-tout", "data-chaleur", "--chal-c", "#3498db");
    F.poseSecteurs(new Map([[F.cleEmplacement(hotes[2]), { h: "200", c: null }], [F.cleEmplacement(hotes[4]), { h: "40", c: "#ff00aa" }]]));
    F.poseChaleurs(new Map([[F.cleEmplacement(hotes[3]), "#e74c3c"], [F.cleEmplacement(hotes[4]), "#3498db"]]));
  }, { MARQUES, hotes });
  return { erreurs, webgl };
}

/** Les états de la racine que la feuille regarde ; l'immersif porte aussi la classe des Tuiles. */
const ETATS = ["mode-edition", "poi-actif", "tuto-retrait", "ambiance-tuiles", "ambiance-immersif", "chaleur-halos"];

function compareStyles({ ETATS, focus = null }) {
  const E = /** @type {any} */ (globalThis).__essais;
  const F = E.formes, { couleurGl } = E.emplacements;
  const racine = document.documentElement, couches = document.getElementById("couches");
  const proches = (a, b) => (!a || !b) ? a === b : a.every((x, i) => Math.abs(x - b[i]) <= 1);
  const police = (f) => String(f).replace(/["']/g, "").replace(/\s*,\s*/g, ",").trim();
  const tirets = (v) => !v || v === "none" ? null : v.split(/[\s,]+/).map(parseFloat).filter(Number.isFinite);
  const memesTirets = (a, b) => (!a || !b) ? !a === !b : a.length === b.length && a.every((x, i) => Math.abs(x - b[i]) < .01);
  // les nœuds qui peignent, dans l'ordre du balisage ; le nom d'un stand dessiné vit à part
  const feuilles = (g) => [...g.querySelectorAll("path, rect, text, image")].filter((n) => !n.closest(".lab"));
  const ecarts = [];
  let vus = 0;
  /* Le focus du clavier : un seul nœud à la fois, que le navigateur seul
     connaît — l'essai le pose et ne compare que sa forme. */
  const tenu = focus ? couches.querySelector('[data-f="' + focus + '"]') : null;
  if (focus && !(tenu && (tenu.focus(), tenu.matches(":focus-visible")))) return { vus: 0, ecarts: [{ focus, quoi: "pas de focus visible" }] };
  for (let m = 0; m < 1 << ETATS.length; m++) {
    const on = (c) => Boolean(m & (1 << ETATS.indexOf(c)));
    if (on("ambiance-immersif") && !on("ambiance-tuiles")) continue;
    ETATS.forEach((c, i) => racine.classList.toggle(c, Boolean(m & (1 << i))));
    const j = F.jetonsCalques(couches);
    for (const c of F.calquesPeints()) {
      for (const f of c.formes) {
        if (focus && f.id !== focus) continue;
        const g = couches.querySelector('[data-f="' + f.id + '"]');
        const marque = (nom) => g.classList.contains(nom === "ouvert" ? "sel" : nom) && (f.t !== "stand" || nom !== "ouvert");
        const mq = { dim: g.classList.contains("dim"), phare: g.classList.contains("phare"), cale: g.hasAttribute("data-cale") };
        const gs = F.styleGroupeForme(c, f, mq, j);
        const hote = { sect: null, chal: null };
        if (g.hasAttribute("data-sect")) hote.sect = { h: g.style.getPropertyValue("--sect-h"), c: g.style.getPropertyValue("--sect-c") || null };
        if (g.hasAttribute("data-chaleur")) hote.chal = g.style.getPropertyValue("--chal-c");
        const marques = { sel: f.t === "stand" && g.classList.contains("sel"), ouvert: f.t === "repere" && marque("ouvert"),
          phare: mq.phare, focus: Boolean(focus), ...hote };
        const ns = feuilles(g);
        if (ns.length !== f.pieces.length) {
          ecarts.push({ forme: f.id, quoi: "pièces", feuille: ns.map((n) => n.localName).join(" "),
            resolu: f.pieces.map((p) => p.sorte + ":" + p.role).join(" ") });
          continue;
        }
        ns.forEach((n, i) => {
          const p = f.pieces[i], s = F.stylePiece(c, f, p, marques, j), cs = getComputedStyle(n);
          // ce que les ancêtres donnent jusqu'au calque : l'affichage et l'opacité
          let visible = true, op = 1;
          for (let x = n; x && x !== couches; x = x.parentElement) {
            const k = getComputedStyle(x);
            if (k.display === "none") visible = false;
            op *= parseFloat(k.opacity);
          }
          vus++;
          const a = { visible, op: Math.round(op * 1000) / 1000 };
          const b = { visible: gs.visible, op: Math.round(gs.opacite * 1000) / 1000 };
          const diffs = [];
          if (a.visible !== b.visible) diffs.push("affichage");
          if (a.visible && Math.abs(a.op - b.op) > .002) diffs.push("opacité " + a.op + " ≠ " + b.op);
          if (!a.visible) { if (diffs.length) ecarts.push({ forme: f.id, piece: i, etats: racine.className, diffs }); return; }
          const plein = p.sorte === "image" ? null : couleurGl(cs.fill, parseFloat(cs.fillOpacity) || 0);
          if (p.sorte !== "image" && !proches(plein, couleurGl(s.fill, s.fillOpacity)))
            diffs.push("aplat " + cs.fill + "/" + cs.fillOpacity + " ≠ " + s.fill + "/" + s.fillOpacity);
          if (p.sorte === "trace" || p.sorte === "rect") {
            const trait = couleurGl(cs.stroke, parseFloat(cs.strokeOpacity) || 0), trait2 = couleurGl(s.stroke, 1);
            if (!proches(trait, trait2)) diffs.push("trait " + cs.stroke + " ≠ " + s.stroke);
            if (trait && trait2) {
              if (Math.abs(parseFloat(cs.strokeWidth) - s.strokeWidth) > .01) diffs.push("épaisseur " + cs.strokeWidth + " ≠ " + s.strokeWidth);
              if ((cs.vectorEffect === "non-scaling-stroke") !== s.fixe) diffs.push("trait fixe");
              if (n.classList.contains("trait") !== s.trait) diffs.push("classe trait");
              if (!memesTirets(tirets(cs.strokeDasharray), s.dash)) diffs.push("tirets " + cs.strokeDasharray + " ≠ " + JSON.stringify(s.dash));
            }
            if (!plein && (cs.pointerEvents === "all") !== s.pointer) diffs.push("prise " + cs.pointerEvents);
          }
          if (p.sorte === "texte") {
            if (police(cs.fontFamily) !== police(s.famille)) diffs.push("police " + cs.fontFamily + " ≠ " + s.famille);
            if (String(cs.fontWeight) !== String(s.graisse)) diffs.push("graisse " + cs.fontWeight + " ≠ " + s.graisse);
            if ((cs.textAnchor === "middle" ? "middle" : "start") !== s.ancre) diffs.push("ancre " + cs.textAnchor);
          }
          if (diffs.length && ecarts.length < 40)
            ecarts.push({ forme: f.id, piece: i + ":" + p.role, etats: racine.className.replace(/ambiance-classique|page-sobre|plan-affiche|rendu-webgl/g, "").trim(), diffs });
        });
      }
    }
  }
  ETATS.forEach((c) => racine.classList.remove(c));
  if (tenu) tenu.blur();
  return { vus, ecarts };
}

test("le style des calques résolu sans la feuille est celui qu'elle calcule", async ({ page }) => {
  test.setTimeout(120_000);
  const { erreurs, webgl } = await ouvre(page);
  test.skip(!webgl, "pas de carte graphique : la feuille anime ce que le dessin ne peint pas");
  const r = await page.evaluate(compareStyles, { ETATS });
  expect(r.ecarts, JSON.stringify(r.ecarts, null, 1)).toEqual([]);
  // une quarantaine de pièces, quarante-huit états de la racine
  expect(r.vus).toBeGreaterThan(1500);
  // le focus du clavier, après une touche : le navigateur le rend alors visible
  await page.keyboard.press("Shift");
  for (const focus of ["r-bus", "o-metro", "s-sect", "s-sel"]) {
    const f = await page.evaluate(compareStyles, { ETATS, focus });
    expect(f.ecarts, JSON.stringify(f.ecarts, null, 1)).toEqual([]);
    expect(f.vus).toBeGreaterThan(40);
  }
  expect(erreurs).toEqual([]);
});

test("le dessin peint les calques comme il les lisait dans le SVG", async ({ page }) => {
  test.setTimeout(120_000);
  const { erreurs, webgl } = await ouvre(page);
  test.skip(!webgl, "pas de carte graphique");
  // l'image se mesure une fois chargée : une première lecture la demande
  await page.evaluate(() => { for (const g of document.querySelectorAll("#couches .dcal")) globalThis.__essais.compareLectures(g); });
  await page.waitForTimeout(300);
  const r = await page.evaluate((ETATS) => {
    const racine = document.documentElement, out = [];
    let formes = 0;
    for (let m = 0; m < 1 << ETATS.length; m++) {
      if ((m & 16) && !(m & 8)) continue;
      ETATS.forEach((c, i) => racine.classList.toggle(c, Boolean(m & (1 << i))));
      for (const g of document.querySelectorAll("#couches .dcal")) {
        const c = globalThis.__essais.compareLectures(g);
        formes += c.formes;
        if (c.ecarts.length && out.length < 10) out.push({ calque: g.dataset.dcal, etats: racine.className, ecarts: c.ecarts });
      }
    }
    ETATS.forEach((c) => racine.classList.remove(c));
    return { formes, out };
  }, ETATS);
  expect(r.out, JSON.stringify(r.out, null, 1)).toEqual([]);
  expect(r.formes).toBeGreaterThan(1000);
  expect(erreurs).toEqual([]);
});
