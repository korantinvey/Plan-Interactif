/**
 * L'itinéraire : la grille de marche de `modules/itineraire.mjs`, éprouvée
 * seule.
 *
 * La grille d'un vrai pavillon se peint sur un canevas, que Node n'a pas. Ce
 * qui vient après, en revanche — l'écart au mur, la nappe, la recherche du
 * chemin, le trait qu'on en tire — ne lit que des cases. On dessine donc des
 * halls à la main, case par case, et l'on mesure ce que le calcul en fait :
 * la longueur d'un chemin connu, le passage par la seule ouverture d'une
 * cloison, l'absence de chemin quand on la referme. Une régression n'y fait
 * rien planter : elle envoie le visiteur par le mauvais côté de l'allée, ou
 * lui annonce dix minutes pour cinq.
 *
 *   node outils/essais/itineraire.js     (chaîné dans `npm run essais`)
 */
const path = require("path");
const { pathToFileURL } = require("url");

let ko = 0;
const dit = (ok, q, d) => {
  console.log((ok ? "  ok   " : "  ÉCHEC") + "  " + q + (d ? "   → " + d : ""));
  if (!ok) ko++;
};

(async () => {
  const I = await import(pathToFileURL(
    path.join(__dirname, "..", "gabarit", "modules", "itineraire.mjs")).href);
  const PAS = I.PAS_GRILLE;

  /* Un hall dessiné : « # » est un mur, tout le reste se marche. La grille est
     posée d'équerre, à l'origine, comme celle d'un pavillon que rien ne
     tourne ; elle se complète comme `grille` la complète. */
  const hall = (dessin) => {
    const rangs = dessin.trim().split("\n").map(l => l.trim());
    const h = rangs.length, w = rangs[0].length;
    const mur = new Uint8Array(w * h);
    rangs.forEach((l, y) => [...l].forEach((c, x) => { mur[y * w + x] = c === "#" ? 1 : 0; }));
    const g = { x0: 0, y0: 0, w: w, h: h, mur: mur, cloisons: null,
                barrage: new Uint8Array(w * h), pmr: false, co: 1, si: 0 };
    g.marge = I.distanceAuMur(g);
    g.nappe = I.nappePrincipale(g);
    g.crete = I.cretes(g);
    return g;
  };
  /* Un hall rectangulaire vide, ceint de murs, avec ce qu'on veut y ajouter. */
  const vide = (w, h, ajoute) => {
    const r = [];
    for (let y = 0; y < h; y++){
      let l = "";
      for (let x = 0; x < w; x++)
        l += x === 0 || y === 0 || x === w - 1 || y === h - 1 || (ajoute && ajoute(x, y)) ? "#" : ".";
      r.push(l);
    }
    return hall(r.join("\n"));
  };
  const c = (g, x, y) => y * g.w + x;
  const xy = (g, i) => [i % g.w, Math.floor(i / g.w)];
  /* Un chemin tient s'il ne touche aucun mur et n'avance que d'une case, en
     ligne ou en colonne — jamais en diagonale. */
  const tient = (g, suite) => suite.every((i, k) => {
    if (g.mur[i]) return false;
    if (!k) return true;
    const [ax, ay] = xy(g, suite[k - 1]), [bx, by] = xy(g, i);
    return Math.abs(ax - bx) + Math.abs(ay - by) === 1;
  });
  const virages = (g, suite) => Math.max(0, I.reduit(g, suite).length - 2);

  console.log("\n=== 1. L'écart au mur et la nappe ===");
  {
    // une allée de cinq cases entre deux murs, et une poche close à part
    const g = hall(`
      ##############################
      ..............................
      ..............................
      ..............................
      ..............................
      ..............................
      ##############################
      ##############.#.#############
      ##############################`);
    const m = [1, 2, 3, 4, 5].map(y => g.marge[c(g, 15, y)]);
    dit(m.join(",") === "1,2,3,2,1", "l'écart au mur, du bord au milieu de l'allée", m.join(", ") + " cases");
    dit(g.nappe[c(g, 15, 3)] === 1 && g.nappe[c(g, 14, 7)] === 0 && g.nappe[c(g, 16, 7)] === 0,
      "la nappe tient l'allée et laisse les poches closes");
    dit(g.crete[c(g, 15, 1)] === 3, "la crête d'une case de bord est le milieu de son allée",
      g.crete[c(g, 15, 1)] + " cases");
  }

  console.log("\n=== 2. Une allée droite ===");
  {
    const g = vide(60, 7);
    const s = I.cherche(g, c(g, 2, 3), c(g, 55, 3), null);
    dit(s && s.length === 54 && tient(g, s), "le chemin le long de l'allée fait sa longueur",
      s && (s.length - 1) * PAS + " m pour " + 53 * PAS + " m");
    const pts = s ? I.reduit(g, s) : [];
    dit(pts.length === 2, "réduit à ses tournants, il n'en a aucun", pts.length + " sommets");
    dit(Math.abs(I.longueur(pts) - 53 * PAS) < 1e-9, "sa longueur en mètres", I.longueur(pts) + " m");

    /* Parti du bord, le trajet rejoint le milieu de l'allée plutôt que de
       raser les stands d'un bout à l'autre : c'est le prix du bord. */
    const b = I.cherche(g, c(g, 2, 1), c(g, 55, 1), null);
    const auMilieu = b ? b.filter(i => xy(g, i)[1] === 3).length / b.length : 0;
    dit(auMilieu > .6, "parti du bord, il tient le milieu de l'allée",
      Math.round(auMilieu * 100) + " % des cases au milieu");
  }

  console.log("\n=== 3. Un virage, un seul ===");
  {
    // un couloir en L : on le suit sans escalier
    const g = vide(30, 30, (x, y) => x > 6 && y < 23);
    const s = I.cherche(g, c(g, 3, 2), c(g, 27, 26), null);
    dit(s && tient(g, s), "le chemin contourne l'angle sans toucher le mur");
    dit(s && virages(g, s) === 1, "un seul virage, à l'angle", s && virages(g, s) + " virage(s)");
    const pts = s ? I.reduit(g, s) : [];
    dit(pts.length === 3 && I.lisse(g, pts).length === 3,
      "le redressement ne coupe pas l'angle à travers le mur", I.lisse(g, pts).length + " sommets");
  }

  console.log("\n=== 4. Une cloison et son ouverture ===");
  {
    const cloison = (ouverte) => vide(21, 21, (x, y) => x === 10 && (ouverte ? y < 17 : true));
    const g = cloison(true);
    const s = I.cherche(g, c(g, 3, 5), c(g, 17, 5), null);
    const passe = s ? s.filter(i => xy(g, i)[0] === 10).map(i => xy(g, i)[1]) : [];
    dit(s && tient(g, s) && passe.length > 0 && passe.every(y => y >= 17),
      "le chemin passe par l'ouverture, et par elle seule", "traversée en y = " + passe.join(", "));
    /* Le balayage ne paie ni virage ni bord : c'est la longueur pure, qu'on
       sait compter à la main — douze cases pour descendre à l'ouverture,
       quatorze pour la franchir, douze pour remonter. */
    const d = I.distancesDepuis(g, c(g, 3, 5));
    dit(d[c(g, 17, 5)] === 38, "la distance de marche autour de la cloison", d[c(g, 17, 5)] + " cases, 38 attendues");
    dit(s && s.length - 1 >= 38, "le trajet tracé n'est jamais plus court que le balayage",
      s && (s.length - 1) + " cases");

    const f = cloison(false);
    dit(I.cherche(f, c(f, 3, 5), c(f, 17, 5), null) === null, "la cloison fermée : aucun chemin");
    const df = I.distancesDepuis(f, c(f, 3, 5));
    dit(df[c(f, 17, 5)] === -1, "le balayage le dit aussi", String(df[c(f, 17, 5)]));
  }

  console.log("\n=== 5. Accrocher un point à l'allée ===");
  {
    const g = vide(40, 7);
    /* Un point posé dans le mur, au-dessus de l'allée, en case 20 : il descend
       à la première case d'allée, puis gagne le milieu en diagonale — à trois
       cases de son aplomb au plus, la largeur qu'il faut remonter. */
    const i = I.accroche(g, null, [10.25, .25], null);
    const [x, y] = xy(g, i);
    dit(i >= 0 && g.nappe[i] === 1 && y === 3 && Math.abs(x - 20) <= 3,
      "un point hors de l'allée s'y accroche, au milieu, près de son aplomb", "case " + x + ", " + y);
    // emmuré : rien à moins de quarante mètres
    const f = hall(`
      #########
      #.......#
      #########`);
    const j = I.accroche(f, null, [2.25, .75], null);
    dit(j >= 0 && f.nappe[j] === 1, "dans un couloir étroit, l'accroche le trouve");
  }

  console.log("\n=== 6. Le trait nettoyé ===");
  {
    // un aller-retour : le trait remonte l'allée puis revient sur ses pas
    const ar = I.nettoie([[0, 0], [10, 0], [6, .1]]);
    dit(ar.length === 2 && Math.abs(I.longueur(ar) - Math.hypot(6, .1)) < 1e-9,
      "l'aller-retour se replie en un seul trait", I.longueur(ar).toFixed(2) + " m au lieu de 14");
    // un demi-tour d'une allée à l'autre garde ses deux branches
    const dt = I.nettoie([[0, 0], [10, 0], [6, 3]]);
    dit(dt.length === 3, "un vrai demi-tour reste", dt.length + " sommets");
    // deux sommets confondus n'en font qu'un
    dit(I.nettoie([[0, 0], [5, 0], [5.01, 0], [5, 7]]).length === 3, "deux sommets à un centimètre se fondent");
  }

  console.log("\n=== 7. Le trait mesuré, et ce qu'on en dit ===");
  {
    const marches = [{ pts: [[0, 0], [10, 0], [10, 10]] }, { pts: [[50, 50], [50, 55]] }];
    const mes = I.mesureMarches(marches);
    dit(mes.total === 25 && mes.cumuls[1].join(",") === "20,25",
      "les distances cumulées d'une marche à l'autre", mes.total + " m");
    const coupe = I.coupeMarche(marches[0].pts, mes.cumuls[0], 15);
    dit(coupe && coupe.length === 3 && coupe[2][0] === 10 && coupe[2][1] === 5,
      "le trait arrêté aux trois quarts s'arrête au milieu du second côté", JSON.stringify(coupe));
    dit(I.coupeMarche(marches[1].pts, mes.cumuls[1], 15) === null, "une marche pas encore atteinte ne se trace pas");
    const ou = I.distancesDesArrets(marches, mes, [{ xy: [10, 9] }, { xy: [49, 54] }]);
    dit(ou.join(",") === "20,25", "chaque arrêt se place au sommet le plus proche", ou.join(", ") + " m");

    const e = [[12, "10 m"], [948, "950 m"], [1234, "1,2 km"]].map(([m, t]) => [I.ecritDistance(m), t]);
    dit(e.every(([a, b]) => a === b), "les distances s'arrondissent à cinq mètres, puis au kilomètre",
      e.map(x => x[0]).join(" · "));
    const d = [I.ecritDuree(66, false), I.ecritDuree(660, false), I.ecritDuree(660, true), I.ecritDuree(660, true, 2),
      I.ecritDuree(10, false)];
    dit(d.join("|") === "≈ 1 min|≈ 10 min|≈ 14 min|≈ 16 min|≈ 1 min",
      "la durée suit l'allure, l'accessible plus lente, les passages en sus", d.join(" · "));
  }

  console.log(ko ? "\n" + ko + " échec(s)." : "\nTout tient.");
  process.exit(ko ? 1 : 0);
})();
