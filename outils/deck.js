/**
 * deck.gl, réduit à ce que le plan dessine : `npm run deck`.
 *
 * Le rendu par la carte graphique (`modules/webgl.mjs`) chargeait le
 * `dist.min.js` du paquet `deck.gl` : la bibliothèque entière, 470 Ko
 * compressés — quatre fois le script du plan — pour huit classes. Ce script
 * rassemble ces huit-là depuis les paquets de deck.gl, à la même version, et
 * laisse esbuild écarter le reste : plus de la moitié en moins, sans changer
 * une ligne de ce qui dessine.
 *
 * Il ne se refait qu'avec le réseau, comme les polices : les paquets se
 * téléchargent dans un dossier temporaire, hors du dépôt, et seul le fichier
 * produit est versionné (`web/bibliotheques/`). Une classe de plus dont le
 * plan aurait besoin s'ajoute à `CLASSES` ; une version neuve, à `VERSION`
 * — puis on relance, et l'on reporte dans `modules/webgl.mjs` (`DECK_WEBGL`)
 * le nom et l'empreinte que ce script affiche.
 *
 *   npm run deck
 */
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");
const esbuild = require("esbuild");

/* La version que le plan dessine. La 9.3 et non la 9.4 : sur la carte
   graphique d'essai, la 9.4.0 ne dessinait plus les points. */
const VERSION = "9.3.11";

/* Ce que `modules/webgl.mjs` emprunte à `deck`, et rien d'autre : un nom
   manquant ici tomberait sur `undefined` au premier dessin. */
const CLASSES = {
  "@deck.gl/core": ["Deck", "OrthographicView", "LayerExtension"],
  "@deck.gl/layers": ["TextLayer", "PathLayer", "SolidPolygonLayer", "BitmapLayer"],
  "@deck.gl/extensions": ["PathStyleExtension"],
};

/* Le nom porte l'empreinte du contenu, et non la seule version : le site garde
   ce dossier un an sans revalider (`genere.js`, `_headers`). Une classe de
   plus à la même version, sous le même nom, serait restée l'ancienne chez qui
   l'avait déjà — et, l'intégrité ne concordant plus, son plan en SVG. */
const DOSSIER = path.join(__dirname, "..", "web", "bibliotheques");

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "deck-"));
try {
  fs.writeFileSync(path.join(tmp, "package.json"), "{}");
  execFileSync("npm", ["install", "--no-audit", "--no-fund", "--silent",
    ...Object.keys(CLASSES).map((p) => p + "@" + VERSION)], { cwd: tmp, stdio: "inherit" });

  const noms = Object.values(CLASSES).flat();
  const entree = Object.entries(CLASSES)
    .map(([p, c]) => "import { " + c.join(", ") + " } from " + JSON.stringify(p) + ";").join("\n") +
    // la page attend `deck` sur l'objet global, comme le posait la bibliothèque entière
    "\nglobalThis.deck = { " + noms.join(", ") + " };\n";
  fs.writeFileSync(path.join(tmp, "entree.mjs"), entree);

  const r = esbuild.buildSync({
    entryPoints: [path.join(tmp, "entree.mjs")],
    bundle: true, minify: true, format: "iife", write: false,
    legalComments: "none", target: "es2020",
    define: { "process.env.NODE_ENV": '"production"' },
    logLevel: "warning",
  });
  const code = r.outputFiles[0].text;
  const SORTIE = path.join(DOSSIER, "deck.gl-" + VERSION + "-plan-" +
    crypto.createHash("sha256").update(code).digest("hex").slice(0, 8) + ".min.js");
  fs.writeFileSync(SORTIE, code);
  const empreinte = "sha384-" + crypto.createHash("sha384").update(code).digest("base64");
  console.log("Écrit : " + path.relative(process.cwd(), SORTIE) +
    " (" + Math.round(code.length / 1024) + " Ko)\n" +
    "À reporter dans modules/webgl.mjs (DECK_WEBGL) :\n" +
    '  src: "bibliotheques/' + path.basename(SORTIE) + '",\n' +
    '  integrite: "' + empreinte + '",\n' +
    "Puis retirez du dépôt le fichier qu'il remplace.");
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
