/**
 * Les logos des exposants inventés du salon de démonstration.
 *
 *   npm run logos-demo
 *
 * Un plan sans logos ne montre ni la fiche telle qu'un salon la voit, ni les
 * toits des stands (`modules/logos-stands.mjs`). Les sociétés de
 * `outils/demo.js` en reçoivent donc un chacune : un symbole et un nom, dans
 * une couleur, une police et une mise en page tirées de leur nom — deux
 * passages dessinent le même logo.
 *
 * Ils se dessinent dans Chromium, avec les polices de `web/polices/` : Node
 * ne sait pas écrire du texte dans une image, et la construction tourne chez
 * Cloudflare, sans navigateur. Le résultat est donc versionné, comme
 * `plans.json` : `outils/donnees/logos-demo.json`, en WebP sans fond, recadré au plus
 * près. À relancer quand les noms changent (le sel de `demo.js`) —
 * `outils/essais/demo.js` le dit, en nommant les sociétés sans logo.
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { pathToFileURL } = require("url");
const { chromium } = require("@playwright/test");
const { salonDemo, lisSource, FOODTRUCKS } = require("../demo.js");

const D = __dirname;
const SORTIE = path.join(D, "..", "donnees", "logos-demo.json");

/* Des polices au caractère marqué, toutes servies par `web/polices/`. */
const POLICES = [
  ["montserrat", "Montserrat", 600], ["poppins", "Poppins", 600], ["raleway", "Raleway", 600],
  ["oswald", "Oswald", 500], ["lora", "Lora", 600], ["playfair-display", "Playfair Display", 600],
  ["bebas-neue", "Bebas Neue", 400], ["comfortaa", "Comfortaa", 700], ["fredoka", "Fredoka", 600],
  ["archivo-black", "Archivo Black", 400], ["space-grotesk", "Space Grotesk", 600], ["jost", "Jost", 600],
  ["righteous", "Righteous", 400], ["nunito", "Nunito", 700], ["barlow-condensed", "Barlow Condensed", 600],
  ["roboto-slab", "Roboto Slab", 600], ["dm-sans", "DM Sans", 600], ["quicksand", "Quicksand", 700],
  ["work-sans", "Work Sans", 600], ["bitter", "Bitter", 600], ["alfa-slab-one", "Alfa Slab One", 400],
  ["lexend", "Lexend", 500], ["manrope", "Manrope", 600], ["fraunces", "Fraunces", 600],
];

/* Ce qui se dessine dans la page : un logo par spécification, rendu en WebP.
   La fonction part dans Chromium (`page.evaluate`), où le document existe. */
/* global document */
function dessine(specs) {
  const COULEURS = [["#0f766e", "#5eead4"], ["#1d4ed8", "#93c5fd"], ["#b91c1c", "#fca5a5"],
    ["#7c3aed", "#c4b5fd"], ["#c2410c", "#fdba74"], ["#15803d", "#86efac"], ["#0369a1", "#7dd3fc"],
    ["#be185d", "#f9a8d4"], ["#a16207", "#fde047"], ["#334155", "#94a3b8"], ["#047857", "#fbbf24"],
    ["#4338ca", "#f472b6"], ["#0e7490", "#f97316"], ["#9f1239", "#fb7185"], ["#166534", "#a3e635"],
    ["#1e3a8a", "#facc15"]];
  const ENCRE = "#1f2937";
  const sortie = {};
  const toile = document.createElement("canvas");
  toile.width = 720; toile.height = 300;
  const ctx = toile.getContext("2d", { willReadFrequently: true });

  for (const { nom, graine, polices } of specs) {
    let a = graine >>> 0;
    const r = () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const pioche = (l) => l[Math.floor(r() * l.length)];
    const [c1, c2] = pioche(COULEURS);
    const [famille, graisse] = pioche(polices);
    const forme = Math.floor(r() * 12);
    const mise = r() < 0.6 ? "ligne" : r() < 0.75 ? "pile" : "texte";
    const casse = r();
    const texte = casse < 0.3 ? nom.toUpperCase() : casse < 0.4 && nom.length < 14 ? nom.toLowerCase() : nom;
    const encre = r() < 0.55 ? ENCRE : c1;
    const initiale = nom[0].toUpperCase();

    ctx.clearRect(0, 0, toile.width, toile.height);

    /** Le symbole, posé dans le carré de côté `t` dont le coin est en x, y. */
    const symbole = (x, y, t) => {
      const cx = x + t / 2, cy = y + t / 2;
      const lettre = (coul) => {
        ctx.fillStyle = coul;
        ctx.font = graisse + " " + Math.round(t * 0.55) + "px '" + famille + "'";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(initiale, cx, cy + t * 0.03);
      };
      ctx.save();
      switch (forme) {
        case 0: ctx.fillStyle = c1; ctx.beginPath(); ctx.arc(cx, cy, t / 2, 0, 7); ctx.fill(); lettre("#fff"); break;
        case 1: ctx.fillStyle = c1; ctx.beginPath(); ctx.roundRect(x, y, t, t, t * 0.22); ctx.fill(); lettre("#fff"); break;
        case 2: ctx.fillStyle = c1; ctx.beginPath();
          for (let k = 0; k < 6; k++) ctx.lineTo(cx + t / 2 * Math.cos(k * Math.PI / 3 + Math.PI / 6), cy + t / 2 * Math.sin(k * Math.PI / 3 + Math.PI / 6));
          ctx.fill(); lettre("#fff"); break;
        case 3: [0.45, 0.7, 1].forEach((h, k) => {
          ctx.fillStyle = k === 2 ? c1 : c2;
          ctx.beginPath(); ctx.roundRect(x + k * t * 0.36, y + t * (1 - h), t * 0.28, t * h, t * 0.06); ctx.fill();
        }); break;
        case 4: ctx.strokeStyle = c1; ctx.lineWidth = t * 0.14; ctx.beginPath(); ctx.arc(cx, cy, t * 0.4, 0, 7); ctx.stroke();
          ctx.fillStyle = c2; ctx.beginPath(); ctx.arc(cx, cy, t * 0.16, 0, 7); ctx.fill(); break;
        case 5: ctx.globalAlpha = 0.9; ctx.fillStyle = c2; ctx.beginPath(); ctx.arc(cx + t * 0.16, cy, t * 0.34, 0, 7); ctx.fill();
          ctx.fillStyle = c1; ctx.beginPath(); ctx.arc(cx - t * 0.16, cy, t * 0.34, 0, 7); ctx.fill(); break;
        case 6: ctx.fillStyle = c1; ctx.beginPath(); ctx.moveTo(x + t * 0.1, y + t * 0.9);
          ctx.quadraticCurveTo(x, y, x + t * 0.9, y + t * 0.1); ctx.quadraticCurveTo(x + t, y + t, x + t * 0.1, y + t * 0.9); ctx.fill();
          ctx.strokeStyle = c2; ctx.lineWidth = t * 0.05; ctx.beginPath(); ctx.moveTo(x + t * 0.18, y + t * 0.82); ctx.lineTo(x + t * 0.72, y + t * 0.28); ctx.stroke(); break;
        case 7: ctx.fillStyle = c2; ctx.beginPath(); ctx.moveTo(x + t * 0.35, y + t * 0.25); ctx.lineTo(x + t, y + t * 0.9); ctx.lineTo(x + t * 0.1, y + t * 0.9); ctx.fill();
          ctx.fillStyle = c1; ctx.beginPath(); ctx.moveTo(x + t * 0.3, y + t * 0.05); ctx.lineTo(x + t * 0.75, y + t * 0.9); ctx.lineTo(x - t * 0.05, y + t * 0.9); ctx.fill(); break;
        case 8: ctx.fillStyle = c1; ctx.beginPath(); ctx.moveTo(cx, y); ctx.lineTo(x + t, cy); ctx.lineTo(cx, y + t); ctx.lineTo(x, cy); ctx.fill(); lettre("#fff"); break;
        case 9: ctx.strokeStyle = c1; ctx.lineCap = "round"; ctx.lineWidth = t * 0.11;
          [0.28, 0.5, 0.72].forEach((h, k) => {
            ctx.strokeStyle = k === 1 ? c2 : c1; ctx.beginPath();
            for (let i = 0; i <= 20; i++) ctx.lineTo(x + t * 0.08 + i * t * 0.042, y + t * h + Math.sin(i / 20 * Math.PI * 2) * t * 0.08);
            ctx.stroke();
          }); break;
        case 10: [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([i, j], k) => {
          ctx.fillStyle = k === 3 ? c2 : c1; ctx.beginPath();
          const ox = x + i * t * 0.52, oy = y + j * t * 0.52, s = t * 0.48;
          if (k % 2) ctx.arc(ox + (i ? 0 : s), oy + (j ? 0 : s), s, 0, 7); else ctx.roundRect(ox, oy, s, s, s * 0.2);
          ctx.save(); ctx.clip(); ctx.fillRect(ox, oy, s, s); ctx.restore();
        }); break;
        default: ctx.fillStyle = c1; ctx.beginPath(); ctx.roundRect(x, y + t * 0.15, t, t * 0.7, t * 0.35); ctx.fill();
          ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(x + t * 0.68, cy, t * 0.2, 0, 7); ctx.fill();
      }
      ctx.restore();
    };

    /** Le nom, borné à une largeur : la police rétrécit plutôt que le nom se coupe. */
    const ecrit = (lignes, x, y, taille, largeur, aligne) => {
      let t = taille;
      const police = () => graisse + " " + t + "px '" + famille + "'";
      ctx.font = police();
      while (t > 18 && Math.max(...lignes.map((l) => ctx.measureText(l).width)) > largeur) { t -= 2; ctx.font = police(); }
      ctx.fillStyle = encre; ctx.textAlign = aligne; ctx.textBaseline = "middle";
      lignes.forEach((l, k) => ctx.fillText(l, x, y + (k - (lignes.length - 1) / 2) * t * 1.08));
      return t;
    };
    // un nom long se range sur deux lignes, coupé au milieu
    const mots = texte.split(" ");
    const lignes = texte.length > 16 && mots.length > 1
      ? [mots.slice(0, Math.ceil(mots.length / 2)).join(" "), mots.slice(Math.ceil(mots.length / 2)).join(" ")]
      : [texte];

    if (mise === "ligne") {
      symbole(20, 90, 120);
      ecrit(lignes, 165, 150, lignes.length > 1 ? 56 : 72, 530, "left");
    } else if (mise === "pile") {
      symbole(300, 14, 120);
      ecrit(lignes, 360, lignes.length > 1 ? 222 : 220, lignes.length > 1 ? 34 : 50, 680, "center");
    } else {
      const t = ecrit(lignes, 360, 140, lignes.length > 1 ? 60 : 84, 660, "center");
      ctx.font = graisse + " " + t + "px '" + famille + "'";
      const l = Math.max(...lignes.map((x) => ctx.measureText(x).width));
      ctx.fillStyle = c1 === encre ? c2 : c1;
      ctx.beginPath(); ctx.roundRect(360 - l / 2, 140 + lignes.length * t * 0.55 + 8, l * 0.4, 10, 5); ctx.fill();
    }

    /* Recadré au plus près, avec une marge : la fiche et le toit le posent
       dans leur cadre sans avoir à chercher où il commence. */
    const px = ctx.getImageData(0, 0, toile.width, toile.height).data;
    let x0 = toile.width, y0 = toile.height, x1 = 0, y1 = 0;
    for (let y = 0; y < toile.height; y++) for (let x = 0; x < toile.width; x++) {
      if (px[(y * toile.width + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    }
    const m = 8;
    x0 = Math.max(0, x0 - m); y0 = Math.max(0, y0 - m);
    x1 = Math.min(toile.width - 1, x1 + m); y1 = Math.min(toile.height - 1, y1 + m);
    /* Réduit à 240 de large au plus : c'est la taille d'une vignette, et
       sept cents logos pèsent dans une page qui les embarque tous. */
    const k = Math.min(1, 240 / (x1 - x0 + 1));
    const coupe = document.createElement("canvas");
    coupe.width = Math.round((x1 - x0 + 1) * k); coupe.height = Math.round((y1 - y0 + 1) * k);
    coupe.getContext("2d").drawImage(toile, x0, y0, x1 - x0 + 1, y1 - y0 + 1, 0, 0, coupe.width, coupe.height);
    sortie[nom] = coupe.toDataURL("image/webp", 0.72).replace(/^data:image\/webp;base64,/, "");
  }
  return sortie;
}

(async () => {
  // sans logos : ce sont eux qu'on dessine
  const salon = salonDemo(lisSource(), { logos: {} });
  const noms = [...new Set(salon.plans.flatMap((p) => p.stands.flatMap((s) =>
    [s.nom, ...(s.coex || []).map((c) => c.nom)])).filter(Boolean)), ...FOODTRUCKS].sort();
  const specs = noms.map((nom) => ({
    nom,
    graine: crypto.createHash("sha256").update("logo|" + nom).digest().readUInt32LE(0),
    polices: POLICES.map(([, f, g]) => [f, g]),
  }));

  const polices = path.join(D, "..", "..", "web", "polices");
  const feuilles = POLICES.map(([f]) => '<link rel="stylesheet" href="' + pathToFileURL(path.join(polices, f + ".css")) + '">').join("");
  const echantillon = POLICES.map(([, f, g]) =>
    '<span style="font-family:\'' + f + '\';font-weight:' + g + '">Aa ÀÉéèçœ</span>').join("");

  const navigateur = await chromium.launch(process.env.PLAYWRIGHT_BROWSERS_PATH && fs.existsSync("/opt/pw-browsers/chromium")
    ? { executablePath: "/opt/pw-browsers/chromium" } : {});
  const page = await navigateur.newPage();
  const fichier = path.join(require("os").tmpdir(), "logos-demo.html");
  fs.writeFileSync(fichier, "<!doctype html><meta charset=utf-8>" + feuilles + "<body>" + echantillon + "</body>");
  await page.goto(pathToFileURL(fichier).href);
  // chaque police chargée avant le premier logo : sinon il prendrait celle de secours
  await page.evaluate(async (l) => {
    await Promise.all(l.map(([f, g]) => document.fonts.load(g + " 40px '" + f + "'", "AaÉé")));
    await document.fonts.ready;
  }, POLICES.map(([, f, g]) => [f, g]));
  const logos = await page.evaluate(dessine, specs);
  await navigateur.close();
  fs.unlinkSync(fichier);

  const trie = Object.fromEntries(Object.keys(logos).sort().map((k) => [k, logos[k]]));
  fs.writeFileSync(SORTIE, JSON.stringify(trie, null, 0).replace(/","/g, '",\n"') + "\n");
  const poids = Object.values(trie).reduce((a, b) => a + b.length, 0);
  console.log(Object.keys(trie).length + " logos, " + Math.round(poids / 1024) + " Ko → " + path.relative(process.cwd(), SORTIE));
})().catch((e) => { console.error(e); process.exit(1); });
