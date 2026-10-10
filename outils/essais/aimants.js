/**
 * Les aimants de l'outil de dessin : `modules/aimants.mjs`, éprouvé seul.
 *
 * Ce module ne se trompe jamais bruyamment. Un sommet qui ne prend plus, une
 * grille qui cale au mauvais cran, une taille reprise d'un centimètre trop
 * courte : rien ne plante, l'exploitant obtient seulement des stands qui ne
 * se touchent pas, et ne s'en aperçoit qu'une fois le salon publié. On pose
 * donc un pavillon connu au centimètre, des formes dessinées à côté, et l'on
 * mesure où chaque geste atterrit.
 *
 * Le module n'importe pas l'outil de dessin : ce qu'il lui demande — la vue,
 * la tolérance de la main, la boîte d'une forme, l'enregistrement — est confié
 * ici par `brancheAimants`, comme `outil-dessin.mjs` le fait dans la page. Le
 * document se réduit aux quelques éléments que le module lit ou pose.
 *
 *   node outils/essais/aimants.js     (chaîné dans `npm run essais`)
 */
const path = require("path");
const { pathToFileURL } = require("url");

let ko = 0;
const dit = (ok, q, d) => {
  console.log((ok ? "  ok   " : "  ÉCHEC") + "  " + q + (d ? "   → " + d : ""));
  if (!ok) ko++;
};
const egal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const proche = (a, b) => a.length === b.length && a.every((v, i) => Math.abs(v - b[i]) < 1e-9);

/* Le document, réduit à ce que le module touche : les champs de la boîte à
   outils, et les deux éléments qu'il pose sur le plan (la cote, les aimants
   montrés), qu'on retrouve par leur identifiant comme la page le ferait. */
const elements = new Map();
const noeud = (tag) => ({
  tag, id: "", attrs: {}, textContent: "", ecritures: 0, _html: "",
  setAttribute(k, v){ this.attrs[k] = v; },
  set innerHTML(v){ this._html = v; this.ecritures++; },
  get innerHTML(){ return this._html; },
  remove(){ elements.delete(this.id); },
});
globalThis.document = {
  getElementById: (id) => elements.get(id) || null,
  createElementNS: (ns, tag) => noeud(tag),
};
const champ = (id, props) => elements.set(id, Object.assign({ id }, props));
champ("aimants", { checked: true });
champ("aimantPas", { value: "" });
champ("elemDim", { hidden: false });
champ("elemLargeur", { value: "" });
champ("elemHauteur", { value: "" });

(async () => {
  const dossier = path.join(__dirname, "..", "gabarit", "modules");
  const A = await import(pathToFileURL(path.join(dossier, "aimants.mjs")).href);
  const D = await import(pathToFileURL(path.join(dossier, "donnees.mjs")).href);

  /* Deux pavillons. Le premier : deux stands mitoyens et une zone au loin. */
  D.poseDonnees({ DATA: { plans: [
    { id: "h1", stands: [{ id: "s1", d: "M0 0L6 0L6 3L0 3Z" }, { id: "s2", d: "M6 0L10 0L10 3L6 3Z" }],
      zones: [{ id: "z1", d: "M20 20L30 20L30 28L20 28Z" }] },
    { id: "h2", stands: [{ id: "s9", d: "M100 0L104 0L104 3L100 3Z" }], zones: [] },
  ] } });
  /* Les formes dessinées sur le premier : un rectangle, un triangle, un texte
     — qui n'aimante pas —, et un calque masqué, qui n'aimante pas non plus. */
  const DESSINS = { h1: [
    { id: "c1", formes: [
      { id: "f1", t: "rect", pts: [[40, 40], [44, 42]] },
      { id: "f2", t: "poly", pts: [[50, 50], [52, 50], [51, 53]] },
      { id: "t1", t: "texte", pts: [[60, 60]] },
    ] },
    { id: "c2", visible: false, formes: [{ id: "h", t: "rect", pts: [[70, 70], [72, 72]] }] },
  ], h2: [] };

  /* La vue : cinquante mètres sur douze cents pixels. Un pixel vaut donc
     1/24 m, et les douze pixels que la main sait viser, un demi-mètre. */
  let guide = "non posé";
  const journal = [];
  let SEL = null, ACTIF = "c1", IMAGE = null;
  const svg = { appendChild: (n) => elements.set(n.id, n) };
  const estCadre = (f) => f.t === "rect" || f.t === "image" || f.t === "stand";
  const boite = (f) => {
    const xs = f.pts.map(p => p[0]), ys = f.pts.map(p => p[1]);
    return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  };
  const formeParId = (id) => {
    for (const c of DESSINS[D.P().id]) for (const f of c.formes) if (f.id === id) return { c, f };
    return null;
  };
  A.brancheAimants({
    vue: () => ({ x: 0, y: 0, w: 50, h: 40 }),
    imageEnAttente: () => IMAGE,
    formeSel: () => SEL,
    calqueActif: () => ACTIF,
    svg,
    cadrePlan: () => ({ width: 1200 }),
    mesCalques: () => DESSINS[D.P().id],
    estCadre, boite,
    toleranceTrace: () => .5,
    apercuGuide: (d) => { guide = d; },
    formeParId,
    ajouteForme: (f) => { f.id = "copie" + journal.length; DESSINS[D.P().id][0].formes.push(f); journal.push("ajoute"); return f.id; },
    choisitForme: (id) => { SEL = id; journal.push("choisit " + id); },
    signale: (id) => journal.push("signale " + id),
    memorise: () => journal.push("memorise"),
    enregistreDessins: () => journal.push("enregistre"),
    redessineForme: (f) => journal.push("redessine " + f.id),
    dessinePoignees: () => journal.push("poignees"),
  });

  console.log("\n=== 1. Les mètres écrits ===");
  dit(A.ecritMetres(12) === "12", "un entier s'écrit sans décimales", A.ecritMetres(12));
  dit(A.ecritMetres(6.5) === "6,5", "un demi-mètre garde une décimale, en virgule", A.ecritMetres(6.5));
  dit(A.ecritMetres(3.4712) === "3,47", "au centimètre", A.ecritMetres(3.4712));
  dit(A.ecritMetres(-2.25) === "2,25", "une longueur tracée à reculons reste positive", A.ecritMetres(-2.25));
  dit(A.ecritMetres(0.004) === "0", "moins d'un demi-centimètre ne fait rien", A.ecritMetres(0.004));
  dit(A.coteCadre([10, 3], [22, 9]) === "12 × 6 m", "la cote d'un cadre", A.coteCadre([10, 3], [22, 9]));
  dit(A.coteCadre([4, 4], [1, 2.5]) === "3 × 1,5 m", "tracé vers le haut à gauche, la même cote", A.coteCadre([4, 4], [1, 2.5]));

  console.log("\n=== 2. Les points du geste qui s'accrochent ===");
  const cadre = A.coinsGeste([[10.3, 0.2], [14.3, 3.2]], true);
  dit(egal(cadre, [[10.3, 0.2], [14.3, 0.2], [14.3, 3.2], [10.3, 3.2], [12.3, 1.7]]),
    "un cadre offre ses quatre coins et son centre", JSON.stringify(cadre));
  const tri = A.coinsGeste([[0, 0], [4, 0], [2, 3]], false);
  dit(egal(tri, [[0, 0], [4, 0], [2, 3], [2, 1.5]]), "un tracé offre ses sommets et son centre", JSON.stringify(tri));
  const long = Array.from({ length: 13 }, (_, i) => [i, i % 2 ? 5 : 1]);
  dit(egal(A.coinsGeste(long, false), [[0, 1], [12, 1], [12, 5], [0, 5], [6, 3]]),
    "au-delà de douze sommets, sa boîte", JSON.stringify(A.coinsGeste(long, false)));

  console.log("\n=== 3. Un sommet d'abord ===");
  dit(egal(A.aimante([6.2, 3.1]), [6, 3]), "un coin à vingt centimètres prend le coin", JSON.stringify(A.aimante([6.2, 3.1])));
  dit(guide === "M5.65 3h0.7M6 2.65v0.7", "et la croix dit lequel", guide);
  dit(egal(A.aimante([2.9, 1.65]), [3, 1.5]), "le centre d'un stand est un aimant", JSON.stringify(A.aimante([2.9, 1.65])));
  dit(egal(A.aimante([25.3, 23.8]), [25, 24]), "celui d'une zone aussi", JSON.stringify(A.aimante([25.3, 23.8])));
  dit(egal(A.aimante([6.2, 3.1], { axes: "x" }), [6, 3.1]), "une image n'accroche que sa largeur",
    JSON.stringify(A.aimante([6.2, 3.1], { axes: "x" })));
  const c = A.correction(cadre);
  dit(proche(c, [-0.3, -0.2]), "un cadre déplacé retient la plus petite correction, au premier coin trouvé",
    c.map(v => +v.toFixed(6)).join(", "));

  console.log("\n=== 4. La grille propre au stand, puis les axes ===");
  const g1 = A.aimante([2.13, 1.04]);
  dit(egal(g1, [2, 1]), "dans un stand, le cran de sa grille bat l'axe plus lointain", JSON.stringify(g1));
  dit(guide === "M2 0v40M0 1h50", "les deux traits disent sur quoi l'on s'aligne", guide);
  elements.get("aimantPas").value = "0.75";
  const g2 = A.aimante([2.13, 1.04]);
  dit(egal(g2, [2.25, 0.75]), "au pas de 75 cm, les crans suivent", JSON.stringify(g2));
  elements.get("aimantPas").value = "abc";
  dit(egal(A.aimante([2.13, 1.04]), [2, 1]), "un pas illisible vaut un demi-mètre", JSON.stringify(A.aimante([2.13, 1.04])));
  elements.get("aimantPas").value = "0";
  dit(egal(A.aimante([2.13, 1.04]), [2, 1]), "un pas nul aussi", JSON.stringify(A.aimante([2.13, 1.04])));
  elements.get("aimantPas").value = "";
  const ax = A.aimante([6.3, 12]);
  dit(egal(ax, [6, 12]), "hors des stands, l'abscisse s'aligne seule sur la rangée", JSON.stringify(ax));
  dit(guide === "M6 0v40", "un seul trait, vertical", guide);
  const loin = [33.3, 13.3];
  dit(A.aimante(loin) === loin && guide === null, "loin de tout, le point est rendu tel quel, sans repère", String(guide));

  console.log("\n=== 5. Ce qui n'aimante pas ===");
  const p = [6.2, 3.1];
  dit(A.aimante(p, { alt: true }) === p && guide === null, "Alt tenu, rien ne prend");
  elements.get("aimants").checked = false;
  dit(A.aimante(p) === p && guide === null, "les aimants coupés, rien ne prend");
  elements.get("aimants").checked = true;
  dit(egal(A.aimante([2.9, 1.65], { saufPlan: "s1" }), [2.9, 1.5]),
    "le stand qu'on reprend ne s'accroche pas à lui-même — l'axe de son voisin reste",
    JSON.stringify(A.aimante([2.9, 1.65], { saufPlan: "s1" })));

  console.log("\n=== 6. Les formes dessinées ===");
  dit(egal(A.aimante([44.2, 41.9]), [44, 42]), "le coin d'un rectangle dessiné", JSON.stringify(A.aimante([44.2, 41.9])));
  dit(egal(A.aimante([51.1, 51.4]), [51, 51.5]), "le centre d'un triangle dessiné", JSON.stringify(A.aimante([51.1, 51.4])));
  const soi = [44.2, 41.9];
  dit(A.aimante(soi, { sauf: "f1" }) === soi, "une forme ne s'accroche pas à elle-même");
  const t = [60.1, 60.1], h = [72.1, 71.9];
  dit(A.aimante(t) === t, "un texte n'est pas un aimant");
  dit(A.aimante(h) === h, "un calque masqué non plus");
  DESSINS.h1[0].formes.push({ id: "f3", t: "rect", pts: [[80, 80], [82, 82]] });
  const avant = [82.1, 82.1];
  dit(A.aimante(avant) === avant, "une forme posée n'aimante pas avant que le relevé soit oublié");
  A.oublieAimants();
  dit(egal(A.aimante([82.1, 82.1]), [82, 82]), "après l'oubli, elle aimante", JSON.stringify(A.aimante([82.1, 82.1])));
  DESSINS.h1[0].formes.pop();
  A.oublieAimants();
  D.state.plan = 1;
  dit(egal(A.aimante([104.1, 0.1]), [104, 0]), "un autre pavillon a ses propres aimants", JSON.stringify(A.aimante([104.1, 0.1])));
  dit(A.aimante(soi) === soi, "et ne garde rien des dessins du premier");
  D.state.plan = 0;

  console.log("\n=== 7. Ce que le plan montre ===");
  A.montreAimants([[6.2, 3.1]]);
  const vus = elements.get("aimantsVus");
  const html = vus ? vus.innerHTML : "";
  const crans = (html.match(/<circle class="cran"/g) || []).length;
  const sommetsVus = (html.match(/<circle cx/g) || []).length;
  dit(sommetsVus === 6, "les six sommets à cinq mètres (cent vingt pixels) du curseur", sommetsVus + " sommets");
  dit(crans === 106, "les crans des deux stands à huit pas, sans doublon", crans + " crans");
  dit(/<circle cx="6" cy="3" r="0.125"\/>/.test(html), "un sommet garde trois pixels de rayon à l'écran");
  const n = vus.ecritures;
  A.montreAimants([[6.21, 3.1]]);
  dit(vus.ecritures === n, "le même voisinage ne se redessine pas");
  A.montreAimants(null);
  dit(!elements.has("aimantsVus"), "rien à montrer, le groupe s'en va");
  A.montreCote("12 × 6 m", [10, 5]);
  const cote = elements.get("cote");
  dit(cote && cote.textContent === "12 × 6 m" && cote.attrs["font-size"] === 0.542 &&
      cote.attrs.x === 10.5 && cote.attrs.y === 4.5,
    "la cote s'écrit à douze pixels du point, en treize pixels", cote && JSON.stringify(cote.attrs));
  A.montreCote(null);
  dit(!elements.has("cote"), "et s'efface");

  console.log("\n=== 8. La même taille, reposée ===");
  A.retientTaille({ t: "rect", pts: [[0, 0], [4.25, 3]] });
  const r = { t: "rect", pts: [[10, 10], [10, 10]] };
  dit(A.reprendTaille(r) && egal(r.pts, [[10, 10], [14.25, 13]]), "un clic repose la dernière taille depuis le coin", JSON.stringify(r.pts));
  dit(egal(A.DERNIERE.rect, [4.25, 3]), "la taille est retenue par outil", JSON.stringify(A.DERNIERE.rect));
  A.retientTaille({ t: "poly", pts: [[0, 0], [9, 0], [0, 9]] });
  dit(!("poly" in A.DERNIERE), "un tracé libre n'a pas de taille à retenir");
  dit(A.reprendTaille({ t: "stand", pts: [[0, 0]] }) === false, "rien de retenu, rien de reposé");
  A.retientTaille({ t: "image", pts: [[0, 0], [3, 1.5]] });
  IMAGE = { ratio: 1.5 };
  const im = { t: "image", pts: [[1, 1], [1, 1]] };
  A.reprendTaille(im);
  dit(egal(im.pts, [[1, 1], [4, 3]]), "une autre image garde la largeur, sa hauteur suit ses proportions", JSON.stringify(im.pts));
  IMAGE = null;

  console.log("\n=== 9. Dupliquer, pousser, donner la taille ===");
  const st = { id: "st", t: "rect", pts: [[0, 0], [4, 3]], liens: ["x"], nom: "A1" };
  DESSINS.h1[0].formes.push(st);
  SEL = "st"; journal.length = 0;
  A.dupliqueForme();
  const copie = DESSINS.h1[0].formes[DESSINS.h1[0].formes.length - 1];
  dit(copie !== st && egal(copie.pts, [[4, 0], [8, 3]]) && copie.nom === "A1",
    "la copie se pose contre l'original, de sa largeur", JSON.stringify(copie.pts));
  dit(!("liens" in copie) && egal(st.liens, ["x"]), "elle naît sans passages, l'original garde les siens");
  dit(egal(journal, ["ajoute", "choisit copie0", "signale copie0"]), "elle est choisie et signalée", journal.join(", "));
  const rep = { id: "rp", t: "repere", pts: [[5, 5]] };
  DESSINS.h1[0].formes.push(rep);
  SEL = "rp";
  A.dupliqueForme();
  const copieRep = DESSINS.h1[0].formes[DESSINS.h1[0].formes.length - 1];
  dit(egal(copieRep.pts, [[6, 5]]), "ce qui n'a pas de largeur se décale d'un mètre", JSON.stringify(copieRep.pts));
  ACTIF = "autre"; SEL = "st";
  const nb = DESSINS.h1[0].formes.length;
  A.dupliqueForme();
  dit(DESSINS.h1[0].formes.length === nb, "hors du calque actif, rien ne se duplique");
  ACTIF = "c1"; journal.length = 0;
  A.pousseForme(0.25, -1);
  dit(egal(st.pts, [[0.25, -1], [4.25, 2]]), "la flèche pousse au pas demandé", JSON.stringify(st.pts));
  dit(egal(journal, ["memorise", "enregistre", "redessine st", "poignees"]), "et l'enregistre", journal.join(", "));
  dit(elements.get("elemLargeur").value === 4 && elements.get("elemHauteur").value === 3,
    "les champs de taille se relisent");
  elements.get("elemLargeur").value = "5.5"; elements.get("elemHauteur").value = "2";
  A.appliqueDimension("l");
  dit(egal(st.pts, [[0.25, -1], [5.75, 1]]), "la taille saisie, depuis le coin supérieur gauche", JSON.stringify(st.pts));
  dit(egal(A.DERNIERE.rect, [5.5, 2]), "et retenue pour le rectangle suivant", JSON.stringify(A.DERNIERE.rect));
  elements.get("elemLargeur").value = "";
  A.appliqueDimension("l");
  dit(egal(st.pts, [[0.25, -1], [5.75, 1]]), "un champ vidé n'est pas une taille");
  const img = { id: "img", t: "image", pts: [[0, 0], [4, 2]] };
  DESSINS.h1[0].formes.push(img);
  SEL = "img";
  elements.get("elemLargeur").value = "6"; elements.get("elemHauteur").value = "2";
  A.appliqueDimension("l");
  dit(egal(img.pts, [[0, 0], [6, 3]]), "une image élargie garde ses proportions", JSON.stringify(img.pts));
  elements.get("elemLargeur").value = "6"; elements.get("elemHauteur").value = "1";
  A.appliqueDimension("h");
  dit(egal(img.pts, [[0, 0], [2, 1]]), "par sa hauteur aussi", JSON.stringify(img.pts));

  console.log(ko ? "\n" + ko + " ÉCHEC(S)\n" : "\nLes aimants posent chaque geste où on l'attend.\n");
  process.exit(ko ? 1 : 0);
})();
