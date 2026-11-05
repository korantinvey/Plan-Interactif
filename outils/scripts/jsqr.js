/**
 * Le lecteur de codes QR du parcours : `npm run jsqr`.
 *
 * Le plan écrit ses codes QR lui-même (`modules/qr.mjs`), mais les lire est
 * une autre affaire : redresser une photo prise de biais, trouver les trois
 * repères, corriger les erreurs. `BarcodeDetector` le fait chez Chrome sur
 * Android, et nulle part sur iPhone. Il faut donc un décodeur à nous, et
 * c'est jsQR — du JavaScript seul, sans WebAssembly, sous licence Apache 2.0.
 *
 * Le visiteur ne le reçoit qu'au moment où il demande à scanner un parcours
 * (`modules/scan-parcours.mjs`), et jamais si le navigateur sait lire seul.
 *
 * Il ne se refait qu'avec le réseau, comme `npm run avif` : le paquet se
 * télécharge hors du dépôt, et seul le fichier produit est versionné
 * (`web/bibliotheques/`). Une version neuve s'écrit dans `VERSION`, puis on
 * relance et l'on reporte dans `modules/scan-parcours.mjs` (`LECTEUR_QR`) le
 * nom et l'empreinte que ce script affiche.
 *
 *   npm run jsqr
 */
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");
const esbuild = require("esbuild");

const VERSION = "1.4.0";

/* Le nom porte l'empreinte du contenu : le site garde ce dossier un an sans
   revalider (`genere.js`, `_headers`). */
const DOSSIER = path.join(__dirname, "..", "..", "web", "bibliotheques");

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "jsqr-"));
try {
  fs.writeFileSync(path.join(tmp, "package.json"), "{}");
  execFileSync("npm", ["install", "--no-audit", "--no-fund", "--silent",
    "jsqr@" + VERSION], { cwd: tmp, stdio: "inherit" });
  /* Le paquet s'inscrit sous un nom à nous, comme l'encodeur AVIF : la page
     le cherche là, et rien d'autre du paquet ne déborde sur l'objet global. */
  fs.writeFileSync(path.join(tmp, "entree.mjs"),
    'import jsQR from "jsqr";\nglobalThis.lecteurQr = jsQR;\n');

  const r = esbuild.buildSync({
    entryPoints: [path.join(tmp, "entree.mjs")],
    bundle: true, minify: true, format: "iife", write: false,
    legalComments: "none", target: "es2020",
    nodePaths: [path.join(tmp, "node_modules")],
    platform: "browser",
    logLevel: "warning",
  });
  /* La licence demande d'accompagner le code de sa mention : une ligne en
     tête suffit, et la minification l'aurait retirée. */
  const code = "/*! jsQR " + VERSION + " — Copyright Cosmo Wolfe, Apache-2.0 */\n" +
    r.outputFiles[0].text;
  const court = (b) => crypto.createHash("sha256").update(b).digest("hex").slice(0, 8);
  const sri = (b) => "sha384-" + crypto.createHash("sha384").update(b).digest("base64");
  const nom = "jsqr-" + VERSION + "-" + court(code) + ".min.js";
  fs.writeFileSync(path.join(DOSSIER, nom), code);
  console.log("Écrit : web/bibliotheques/" + nom + " (" + Math.round(code.length / 1024) + " Ko)\n" +
    "À reporter dans modules/scan-parcours.mjs (LECTEUR_QR) :\n" +
    '  script: "bibliotheques/' + nom + '",\n' +
    '  integrite: "' + sri(code) + '",\n' +
    "Puis retirez du dépôt le fichier qu'il remplace.");
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
