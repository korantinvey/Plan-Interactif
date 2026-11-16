/**
 * La lecture du SVG d'autrefois, gardée pour les essais seuls.
 *
 * Le dessin lisait chaque bloc du plan dans le SVG caché : chaque nœud
 * interrogé sur son style calculé, son tracé relu attribut par attribut. Il ne
 * le fait plus — il peint l'habillage depuis une copie détachée, les
 * surcouches et les calques dessinés depuis leurs données —, et cette lecture
 * a quitté la page. Elle reste la meilleure référence de ce que la feuille
 * fait du SVG : les essais la rejouent dans la page, sur un bloc que le SVG de
 * secours a peint, et comparent ce qu'elle en tire à ce que le dessin tire des
 * données (`webgl.mjs` `lectureDonnees`), au format de `resumeLecture`.
 *
 * Elle lit le plan à plat : ni la vue immersive, ni ce que l'éditeur saisit.
 * `lisLeSvg` s'exécute dans la page (`page.evaluate`), et n'emporte rien
 * d'ici : ses outils sont ceux que la page expose aux essais
 * (`__essais.lectures.outils`).
 */

/**
 * Ce que la page tire d'un bloc par les deux lectures, et ce qui diffère.
 * À passer tel quel à `page.evaluate`, avec le sélecteur du bloc ou le nœud.
 * @param {Element | string} bloc
 */
function compareLectures(bloc) {
  const E = /** @type {any} */ (globalThis).__essais, L = E.lectures, o = L.outils, GL = E.GL;
  const racine = typeof bloc === "string" ? document.querySelector(bloc) : bloc;
  const vide = () => ({ pleins: [], traitsPx: [], traitsM: [], traitsZ: [], textes: new Map(), images: [], phares: new Map() });
  const acc = vide();
  // ce que le cartouche met en avant se range à part, comme le dessin le range
  const accDe = (el, a) => {
    const ph = el.closest(".phare");
    if (!ph || !racine.contains(ph)) return a;
    if (!a.phares.has(ph)) a.phares.set(ph, vide());
    return a.phares.get(ph);
  };
  const traces = (el, tag) => {
    const n = (a) => o.num(el, a);
    if (tag === "path") return o.lisTrace(el.getAttribute("d") || "");
    if (tag === "polyline") return [{ pts: o.lisPoints(el.getAttribute("points")), ferme: false }];
    if (tag === "polygon") return [{ pts: o.lisPoints(el.getAttribute("points")), ferme: true }];
    if (tag === "line") return [{ pts: [[n("x1"), n("y1")], [n("x2"), n("y2")]], ferme: false }];
    if (tag === "rect") return [{ pts: o.rectArrondi(n("x"), n("y"), n("width"), n("height"), n("rx"), n("ry")), ferme: true }];
    if (tag === "circle") return [{ pts: o.anneau(n("cx"), n("cy"), n("r"), n("r"), 32), ferme: true }];
    if (tag === "ellipse") return [{ pts: o.anneau(n("cx"), n("cy"), n("rx"), n("ry"), 32), ferme: true }];
    return null;
  };
  const forme = (el, cs, m, op, tr, a) => {
    a = accDe(el, a);
    const plein = o.couleurGl(cs.fill, parseFloat(cs.fillOpacity) * op);
    if (plein) {
      const anneaux = tr.filter((t) => t.pts.length >= 3).map((t) => t.pts.map((p) => o.appM(m, p)));
      for (const polygon of o.avecTrous(anneaux)) a.pleins.push({ polygon, couleur: plein });
    }
    const trait = o.couleurGl(cs.stroke, parseFloat(cs.strokeOpacity) * op), sw = parseFloat(cs.strokeWidth);
    if (!trait || !(sw > 0)) return;
    const fixe = cs.vectorEffect === "non-scaling-stroke";
    // le trait d'une forme dessinée : l'épaisseur réglée, sans le facteur de la vue
    const amincit = fixe && el.classList.contains("trait");
    const largeur = amincit ? Math.round(sw / (parseFloat(cs.getPropertyValue("--trait-f")) || 1) * 100) / 100
      : fixe ? sw : sw * o.echelleM(m);
    const tirets = cs.strokeDasharray && cs.strokeDasharray !== "none"
      ? cs.strokeDasharray.split(/[\s,]+/).map(parseFloat).filter(Number.isFinite) : null;
    const dash = tirets && tirets.length >= 2 ? [2 * tirets[0] / sw, 2 * tirets[1] / sw] : [0, 0];
    for (const t of tr) {
      if (t.pts.length < 2) continue;
      const path = t.pts.map((p) => o.appM(m, p));
      if (t.ferme) path.push(path[0]);
      (amincit ? a.traitsZ : fixe ? a.traitsPx : a.traitsM).push({ path, couleur: trait, largeur, dash });
    }
  };
  const corpsDeclare = (el) => {
    for (let n = el; n && n.getAttribute; n = n.parentNode) {
      const v = n.getAttribute("font-size");
      if (v && /^\s*[\d.]+\s*(px)?\s*$/.test(v)) return parseFloat(v);
      if (v && v.trim() && v.trim() !== "inherit") return 0;
      if (n.tagName === "svg") return 0;
    }
    return 0;
  };
  const texte = (el, cs, m, op, a) => {
    a = accDe(el, a);
    const t = el.textContent;
    if (!t || !t.trim()) return;
    const couleur = o.couleurGl(cs.fill, parseFloat(cs.fillOpacity) * op);
    if (!couleur) return;
    const taille = corpsDeclare(el) || parseFloat(cs.fontSize);
    if (!(taille > 0)) return;
    const position = o.appM(m, [o.num(el, "x"), o.num(el, "y") - (cs.dominantBaseline === "central" ? 0 : taille * .33)]);
    const cle = cs.fontFamily + "|" + cs.fontWeight;
    if (!a.textes.has(cle)) a.textes.set(cle, { items: [] });
    a.textes.get(cle).items.push({ text: t, position, taille: taille * o.echelleM(m), angle: -Math.atan2(m[1], m[0]) * 180 / Math.PI,
      ancre: cs.textAnchor === "middle" ? "middle" : cs.textAnchor === "end" ? "end" : "start", couleur });
  };
  const image = (el, m, op, a) => {
    a = accDe(el, a);
    const href = el.getAttribute("href") || el.getAttribute("xlink:href");
    const nat = href && GL.tailles.get(href);
    if (!nat || nat === "attente") return;
    let x = o.num(el, "x"), y = o.num(el, "y"), w = o.num(el, "width"), h = o.num(el, "height");
    if ((el.getAttribute("preserveAspectRatio") || "xMidYMid meet") !== "none" && nat[0] > 0 && nat[1] > 0) {
      const s = Math.min(w / nat[0], h / nat[1]), w2 = nat[0] * s, h2 = nat[1] * s;
      x += (w - w2) / 2; y += (h - h2) / 2; w = w2; h = h2;
    }
    const p = o.appM(m, [x, y]), q = o.appM(m, [x + w, y + h]);
    a.images.push({ href, bornes: [Math.min(p[0], q[0]), Math.max(p[1], q[1]), Math.max(p[0], q[0]), Math.min(p[1], q[1])], op });
  };
  const parcours = (el, m, op, a) => {
    const cs = getComputedStyle(el);
    if (cs.display === "none") return;
    const tr = el.getAttribute("transform");
    if (tr) m = o.mulM(m, o.lisTransform(tr));
    op *= parseFloat(cs.opacity);
    if (!(op > .003)) return;
    const tag = el.localName;
    // le nom d'un stand dessiné se peint avec les noms du plan
    if (tag === "g" && el.classList.contains("lab")) return;
    if (tag === "g" || tag === "a") { for (const c of el.children) parcours(c, m, op, a); return; }
    if (tag === "svg") {
      const vb = (el.getAttribute("viewBox") || "").split(/[\s,]+/).map(Number);
      const x = o.num(el, "x"), y = o.num(el, "y"), w = o.num(el, "width"), h = o.num(el, "height");
      let n = [1, 0, 0, 1, x, y];
      if (vb.length === 4 && vb[2] > 0 && vb[3] > 0 && w > 0 && h > 0) {
        const s = Math.min(w / vb[2], h / vb[3]);
        n = [s, 0, 0, s, x + (w - vb[2] * s) / 2 - vb[0] * s, y + (h - vb[3] * s) / 2 - vb[1] * s];
      }
      for (const c of el.children) parcours(c, o.mulM(m, n), op, a);
      return;
    }
    if (tag === "text") { texte(el, cs, m, op, a); return; }
    if (tag === "image") { image(el, m, op, a); return; }
    const t = traces(el, tag);
    if (t) forme(el, cs, m, op, t, a);
  };
  // la lecture des données d'abord : c'est elle qui demande la taille d'une image neuve
  const donnees = L.donnees(racine);
  parcours(racine, o.M_ID, 1, acc);
  const A = L.resume(acc), N = donnees;
  const ecarts = [];
  for (let i = 0; i < Math.max(A.length, N.length) && ecarts.length < 5; i++)
    if (A[i] !== N[i]) ecarts.push({ rang: i, feuille: (A[i] || "").slice(0, 300), donnees: (N[i] || "").slice(0, 300) });
  return { formes: A.length, ecarts };
}

/** Pose la lecture dans la page, sous `globalThis.__lectureSvg` : un essai
 *  l'appelle alors sur autant de blocs qu'il veut, en une seule évaluation.
 *  À chaque chargement de la page, et dans celle qui est déjà ouverte.
 *  @param {import("@playwright/test").Page} page */
async function installeLecture(page) {
  const source = "globalThis.__lectureSvg = " + compareLectures.toString();
  await page.addInitScript(source);
  if (page.url() !== "about:blank") await page.evaluate(source);
}

module.exports = { compareLectures, installeLecture };
