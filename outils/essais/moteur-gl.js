/**
 * Le moteur du plan (`modules/moteur-gl*.mjs`), éprouvé hors de la page.
 *
 * Le moteur parle comme deck.gl, et `webgl.mjs` compte sur deux de ses
 * règles sans les redire : où une vue met un point à l'écran, et quand une
 * couche se refait. Qu'une vue se trompe, et le doigt désigne un stand
 * voisin de celui qu'il voit ; qu'une couche se refasse trop souvent, et le
 * plan entier se reconvertit à chaque image, sans rien dire. On les
 * éprouve ici, contre la caméra du plan (`camera.mjs`) et contre les règles
 * de deck.gl écrites en clair.
 *
 *   node outils/essais/moteur-gl.js     (lancé par `npm run essais`)
 */
const path = require("path");
const { pathToFileURL } = require("url");

let ko = 0;
const dit = (ok, q, d) => {
  console.log((ok ? "  ok   " : "  ÉCHEC") + "  " + q + (d ? "   → " + d : ""));
  if (!ok) ko++;
};
const pres = (a, b, e = 1e-6) => Math.abs(a - b) <= e * Math.max(1, Math.abs(a), Math.abs(b));
const module_ = (nom) => import(pathToFileURL(path.join(__dirname, "..", "gabarit", "modules", nom)));

(async () => {
  const M = await module_("moteur-gl-matrices.mjs");
  const C = await module_("camera.mjs");
  const W = 1200, H = 800;

  console.log("La vue d'aplomb");
  {
    const vp = new M.OrthographicViewport({ width: W, height: H, zoom: 3, target: [100, 50, 0], flipY: true, near: -1e4, far: 1e4 });
    const [x, y] = vp.project([100, 50, 0]);
    dit(pres(x, W / 2) && pres(y, H / 2), "la cible tombe au centre de l'écran", x + ", " + y);
    const [x2, y2] = vp.project([101, 51, 0]);
    dit(pres(x2 - x, 8) && pres(y2 - y, 8), "un mètre vaut 2^zoom pixels, l'axe des y vers le bas", (x2 - x) + ", " + (y2 - y));
    const [, , zBas] = vp.project([100, 50, 0]), [, , zHaut] = vp.project([100, 50, 5]);
    dit(zHaut < zBas && zHaut > -1 && zBas < 1, "un point plus haut est plus près de l'œil, sans sortir du champ", zBas + " → " + zHaut);
    const s = vp.unproject([x2, y2]);
    dit(pres(s[0], 101) && pres(s[1], 51), "l'écran se redresse sur le sol", s.join(", "));
    const d = new M.OrthographicViewport({ width: W, height: H, zoom: 0, target: [0, 0, 0] });
    dit(Math.abs(d.project([0, 0, 0])[2]) < 1, "le sol reste dans le champ par défaut — l'œil un pixel au-dessus, comme deck.gl");
  }

  console.log("La vue de biais, faite des matrices de la caméra");
  {
    C.demandeCamera(true, 12);
    C.metsEnJeu(true);
    const s = 4, cible = [300, 200, 0];
    const { vue, projection } = C.matricesCamera(W, H, s);
    const vp = new M.Viewport({ width: W, height: H, zoom: Math.log2(s), position: cible, viewMatrix: vue, projectionMatrix: projection });
    dit(vp.perspective, "elle se sait en perspective");
    let pire = 0;
    for (const [dx, dy] of [[0, 0], [10, 0], [0, 10], [-20, 15], [35, -25]]){
      // le sol à plat, en pixels de la scène, que la caméra mène à l'écran
      const fx = W / 2 + dx * s, fy = H / 2 + dy * s;
      const [ex, ey] = C.platVersEcran(fx, fy, W, H);
      const [px, py] = vp.project([cible[0] + dx, cible[1] + dy, 0]);
      pire = Math.max(pire, Math.hypot(px - ex, py - ey));
    }
    dit(pire < 1e-6, "un point du sol tombe là où la caméra le dit", "écart " + pire.toExponential(1) + " px");
    const [ex, ey] = vp.project([cible[0] + 10, cible[1] - 5, 0]);
    const r = vp.unproject([ex, ey]);
    dit(pres(r[0], cible[0] + 10, 1e-9) && pres(r[1], cible[1] - 5, 1e-9), "et l'écran se redresse sur le même sol", r.join(", "));
    C.metsEnJeu(false);
  }

  console.log("Une matrice de modèle rapportée à l'origine du moteur");
  {
    const m = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 2, 3, 0, 1];
    const o = [-6756, 8815, 0];
    const r = M.rapporte(m, o);
    const p = M.applique4(r, [10, 20, 0]);
    // le point rapporté, déplacé, puis rendu au monde, doit être le point du monde déplacé
    dit(pres(p[0] + o[0], -6756 + 10 + 2) && pres(p[1] + o[1], 8815 + 20 + 3), "le déplacement est le même, rapporté ou non");
  }

  console.log("Quand une couche se refait — les règles de deck.gl");
  {
    const K = await module_("moteur-gl-couche.mjs");
    class Essai extends K.Couche {}
    const data = [{ a: 1 }];
    const base = { id: "x", data, getPolygon: (d) => d, getFillColor: (d) => [1, 2, 3], updateTriggers: { getFillColor: "rouge" } };
    const avant = new Essai(base);
    const r1 = K.aRefaire(new Essai({ ...base, getPolygon: (d) => d, getFillColor: (d) => [9, 9, 9] }), avant, ["getPolygon"]);
    dit(!r1.tout && r1.acces.size === 0, "des fonctions d'accès neuves, sans déclencheur, ne refont rien");
    const r2 = K.aRefaire(new Essai({ ...base, updateTriggers: { getFillColor: "bleu" } }), avant, ["getPolygon"]);
    dit(!r2.tout && r2.acces.has("getFillColor") && r2.acces.size === 1, "un déclencheur changé refait son seul attribut");
    const r3 = K.aRefaire(new Essai({ ...base, data: [{ a: 1 }] }), avant, ["getPolygon"]);
    dit(r3.tout, "des données neuves refont tout");
    const r4 = K.aRefaire(new Essai({ ...base, data: [{ a: 1 }], dataComparator: () => true }), avant, ["getPolygon"]);
    dit(!r4.tout, "sauf si `dataComparator` les dit égales");
    const r5 = K.aRefaire(new Essai({ ...base, updateTriggers: { getPolygon: 2 } }), avant, ["getPolygon"]);
    dit(r5.tout, "un déclencheur de la géométrie refait tout");
    const c1 = new Essai({ ...base, getFillColor: [1, 2, 3] }), c2 = new Essai({ ...base, getFillColor: [1, 2, 3] });
    dit(!K.aRefaire(c2, c1, []).acces.size, "une constante égale, dans un tableau neuf, ne refait rien");
    const c3 = new Essai({ ...base, getFillColor: [1, 2, 4] });
    dit(K.aRefaire(c3, c1, []).acces.has("getFillColor"), "une constante changée se repose");
    const r6 = K.aRefaire(new Essai({ ...base, updateTriggers: { getFillColor: ["a", 1] } }),
      new Essai({ ...base, updateTriggers: { getFillColor: ["a", 1] } }), []);
    dit(!r6.acces.size, "un déclencheur se compare à un niveau de profondeur, comme chez deck.gl");
    const clone = avant.clone({ visible: false });
    dit(clone instanceof Essai && clone.props.getFillColor === base.getFillColor && clone.props.visible === false,
      "une copie garde la classe et les réglages, sauf ceux qu'on change");
    class Ext extends K.LayerExtension {}
    Ext.defaultProps = { getZoomFiltre: { type: "accessor", value: [-100, 100, -100] }, mode: 0 };
    const e = new Essai({ id: "e", extensions: [new Ext()] });
    dit(Array.isArray(e.props.getZoomFiltre) && e.props.getZoomFiltre[1] === 100, "une extension apporte ses réglages par défaut");
  }

  if (ko){ console.log("\n" + ko + " échec(s)"); process.exit(1); }
  console.log("\nTout est bon.");
})().catch((e) => { console.error(e); process.exit(1); });
