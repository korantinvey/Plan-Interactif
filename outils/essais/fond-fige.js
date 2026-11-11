/**
 * Le fond figé : la règle du lot, `modules/lot-fige.mjs`, éprouvée seule.
 *
 * Une erreur n'y fait rien planter : une case de travers pose un morceau de
 * quartier à côté de sa place, un niveau mal choisi floute la carte ou la fait
 * télécharger dix fois trop lourde, une empreinte trop large garde un fond
 * décalé après qu'on a déplacé le calage. D'où des cas qui mesurent ce que le
 * visiteur verrait.
 *
 *   node outils/essais/fond-fige.js     (lancé par `npm run essais`)
 */
const path = require("path");
const { pathToFileURL } = require("url");

let ko = 0;
const dit = (ok, q, d) => {
  console.log((ok ? "  ok   " : "  ÉCHEC") + "  " + q + (d ? "   → " + d : ""));
  if (!ok) ko++;
};

(async () => {
  const L = await import(pathToFileURL(
    path.join(__dirname, "..", "gabarit", "modules", "lot-fige.mjs")).href);

  /* Un carré de 2 400 m — un hall de 400 m et ses abords —, posé loin de
     l'origine comme le sont les repères des parcs. */
  const f = { x0: -6000, y0: 8000, cote: 2400, px: L.PX_FIGE, niveaux: 3,
              adresse: "https://x/environs/p/lot/", ext: "webp" };

  console.log("\n=== 1. L'empreinte : ce qui refige, et ce qui ne refige pas ===");
  const zone = { x0: f.x0, y0: f.y0, x1: f.x0 + f.cote, y1: f.y0 + f.cote };
  const cal = { lon: 2.2885, lat: 48.8325, x: 120, y: -40, angle: 0.31, fond: "maison" };
  const s0 = L.sourceDuFige(cal, zone);
  /* La discrétion, le contour du hall, le trou : posés par-dessus chez le
     visiteur, ils se règlent sans rephotographier. */
  dit(L.sourceDuFige({ ...cal, force: 0.4, vide: false, halls: { H1: [[0, 0]] }, fige: { source: "x" } }, zone) === s0,
    "la discrétion, le hall et le lot lui-même n'y entrent pas");
  const bouge = [["fond", { fond: "plan" }], ["style", { style: "https://s/style.json" }],
    ["point", { lon: cal.lon + 1e-5 }], ["cap", { angle: cal.angle + 1e-4 }], ["ancre", { x: cal.x + 0.5 }]];
  dit(bouge.every(([, d]) => L.sourceDuFige({ ...cal, ...d }, zone) !== s0),
    "le fond, le style, le point, le cap, l'ancre y entrent", bouge.map(([n]) => n).join(", "));
  dit(L.sourceDuFige(cal, { ...zone, x1: zone.x1 + 10, y1: zone.y1 + 10 }) !== s0,
    "un autre carré — l'emprise resynchronisée — refige");

  console.log("\n=== 2. Le niveau suit l'échelle de la vue ===");
  const m0 = f.cote / f.px;   // 2,34 m par pixel au niveau zéro
  const vue = (mpp) => ({ x: f.x0 + 900, y: f.y0 + 900, w: 1000 * mpp, h: 700 * mpp });
  const k = (mpp) => L.imagesFigees(f, vue(mpp), mpp).k;
  dit(k(m0) === 0 && k(m0 / 2) === 1 && k(m0 / 4) === 2 && k(m0 / 8) === 3,
    "un niveau par moitié d'échelle", [m0, m0 / 2, m0 / 4, m0 / 8].map(k).join(", "));
  dit(k(m0 * 10) === 0 && k(m0 / 100) === 3, "borné au lot, de loin comme de près");
  /* Le plus proche en rapport : jamais plus d'une fois et demie d'écart. */
  let pire = 1;
  for (let mpp = m0 / 8; mpp <= m0; mpp *= 1.07){
    const kk = k(mpp), image = m0 / Math.pow(2, kk);
    pire = Math.max(pire, image / mpp, mpp / image);
  }
  dit(pire <= Math.SQRT2 + 1e-9, "l'image n'est jamais étirée ni réduite au-delà de √2", pire.toFixed(3));

  console.log("\n=== 3. Les images d'une vue la couvrent, et rien de plus ===");
  const mpp = m0 / 4, v = vue(mpp);
  const t = L.imagesFigees(f, v, mpp);
  const x0 = Math.min(...t.images.map((q) => q.x)), y0 = Math.min(...t.images.map((q) => q.y));
  const x1 = Math.max(...t.images.map((q) => q.x + q.c)), y1 = Math.max(...t.images.map((q) => q.y + q.c));
  dit(x0 <= v.x && y0 <= v.y && x1 >= v.x + v.w && y1 >= v.y + v.h, "la vue est couverte",
    t.images.length + " images au niveau " + t.k);
  dit(t.images.every((q) => q.x < v.x + v.w && q.x + q.c > v.x && q.y < v.y + v.h && q.y + q.c > v.y),
    "aucune image hors de la vue");
  const horsCarre = L.imagesFigees(f, { x: f.x0 - 5000, y: f.y0, w: 100, h: 100 }, mpp);
  dit(horsCarre.images.length === 0, "hors du carré, rien à demander");
  /* La vue inclinée découvre le sol jusqu'à l'horizon : au lieu d'une
     centaine d'images fines, le niveau du dessus. */
  const large = L.imagesFigees(f, { x: f.x0, y: f.y0, w: f.cote, h: f.cote }, m0 / 8);
  dit(large.images.length <= 36 && large.k < 3, "une vue immense remonte d'un niveau",
    large.images.length + " images au niveau " + large.k);
  dit(L.adresseFigee(f, 2, 3, 1) === "https://x/environs/p/lot/2/3/1.webp", "l'adresse : niveau, colonne, ligne");

  console.log("\n=== 4. La photographie couvre chaque image une fois ===");
  for (const maxPx of [1024, 3000, 4096, 16384]){
    const blocs = L.blocsDeCapture(f, maxPx);
    const vues = new Set(), doublons = [];
    let juste = true;
    for (const b of blocs){
      if (b.px > Math.max(maxPx, f.px)) juste = false;
      const pas = f.cote / Math.pow(2, b.k);
      for (const im of b.images){
        const cle = b.k + "/" + im.i + "/" + im.j;
        if (vues.has(cle)) doublons.push(cle);
        vues.add(cle);
        // l'image découpée tombe là où le visiteur la posera
        if (Math.abs(b.x + (im.sx / f.px) * pas - (f.x0 + im.i * pas)) > 1e-6 ||
            Math.abs(b.y + (im.sy / f.px) * pas - (f.y0 + im.j * pas)) > 1e-6) juste = false;
      }
    }
    const attendu = [0, 1, 2, 3].reduce((n, kk) => n + Math.pow(4, kk), 0);
    dit(vues.size === attendu && !doublons.length && juste,
      "toile de " + maxPx + " px", blocs.length + " vues, " + vues.size + " images");
  }

  console.log("\n=== 5. Le nombre de niveaux suit la taille du carré ===");
  dit(L.niveauxDuLot(300) === 0 && L.niveauxDuLot(1200) === 2 && L.niveauxDuLot(20000) === 3,
    "petit carré, grand carré", [300, 1200, 20000].map(L.niveauxDuLot).join(", "));

  console.log(ko ? "\n" + ko + " ÉCHEC(S)\n" : "\nLe fond figé tombe juste.\n");
  process.exit(ko ? 1 : 0);
})();
