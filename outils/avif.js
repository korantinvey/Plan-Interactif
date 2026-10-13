/**
 * L'encodeur AVIF des vignettes de logos : `npm run avif`.
 *
 * Les vignettes se fabriquent dans le navigateur de l'exploitant
 * (`modules/marque.mjs`), et aucun navigateur ne sait écrire de l'AVIF depuis
 * une toile : Chrome répond en PNG sans rien dire. Or, sur les logos de
 * FUNEXPO 2026, l'AVIF pèse moitié moins que le WebP pour les petites
 * vignettes et trois fois moins pour les grandes, sans écart visible — et le
 * lot des petites part chez chaque visiteur au démarrage (5,4 Mo compressés
 * pour les 564 logos de Franchise Expo).
 *
 * Ce script rapatrie l'encodeur de jSquash (libavif compilé en WebAssembly),
 * dans sa version à un seul fil : celle à plusieurs fils exige une isolation
 * de la page que la console n'a pas, et une vignette de six cents pixels n'en
 * a pas besoin. Seule la console le charge, et seulement quand elle prépare
 * des logos ; le visiteur ne le reçoit jamais.
 *
 * Il ne se refait qu'avec le réseau, comme `npm run deck` : le paquet se
 * télécharge hors du dépôt, et seuls les deux fichiers produits sont
 * versionnés (`web/bibliotheques/`). Une version neuve s'écrit dans
 * `VERSION`, puis on relance et l'on reporte dans `modules/encodeur-avif.mjs`
 * (`ENCODEUR_AVIF`) les noms et empreintes que ce script affiche.
 *
 *   npm run avif
 */
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");
const esbuild = require("esbuild");

const VERSION = "2.1.1";

/* Le nom porte l'empreinte du contenu : le site garde ce dossier un an sans
   revalider (`genere.js`, `_headers`). */
const DOSSIER = path.join(__dirname, "..", "web", "bibliotheques");

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "avif-"));
try {
  fs.writeFileSync(path.join(tmp, "package.json"), "{}");
  execFileSync("npm", ["install", "--no-audit", "--no-fund", "--silent",
    "@jsquash/avif@" + VERSION], { cwd: tmp, stdio: "inherit" });
  const paquet = path.join(tmp, "node_modules", "@jsquash", "avif");

  /* La colle d'Emscripten, et rien du module de jSquash qui choisit entre un
     et plusieurs fils : il importe la détection des fils, et la version à
     plusieurs fils avec. Le module WebAssembly arrive déjà compilé par la
     page, qui l'a demandé avec son empreinte : la colle ne va rien chercher
     elle-même. */
  const entree = `
import fabrique from "./node_modules/@jsquash/avif/codec/enc/avif_enc.js";
import { defaultOptions } from "./node_modules/@jsquash/avif/meta.js";
let module = null;
globalThis.encodeurAvif = {
  async prepare(compile) {
    module = await fabrique({
      noInitialRun: true,
      instantiateWasm(imports, rappel) {
        const instance = new WebAssembly.Instance(compile, imports);
        rappel(instance);
        return instance.exports;
      },
    });
  },
  encode(image, options) {
    if (!module) throw new Error("encodeur AVIF non préparé");
    const sortie = module.encode(new Uint8Array(image.data.buffer), image.width,
      image.height, { ...defaultOptions, ...options });
    if (!sortie) throw new Error("encodage AVIF impossible");
    return sortie;
  },
};
`;
  fs.writeFileSync(path.join(tmp, "entree.mjs"), entree);

  const r = esbuild.buildSync({
    entryPoints: [path.join(tmp, "entree.mjs")],
    bundle: true, minify: true, format: "iife", write: false,
    legalComments: "none", target: "es2020",
    /* La colle bâtit dès son chargement l'adresse du .wasm sur la sienne, et
       une page classique n'a pas d'`import.meta`. Une base fictive suffit :
       le module arrive déjà compilé, rien n'est demandé à cette adresse. */
    define: { "import.meta.url": '"https://encodeur.invalid/"' },
    platform: "browser",
    logLevel: "warning",
  });
  const code = r.outputFiles[0].text;
  const wasm = fs.readFileSync(path.join(paquet, "codec", "enc", "avif_enc.wasm"));
  const court = (b) => crypto.createHash("sha256").update(b).digest("hex").slice(0, 8);
  const sri = (b) => "sha384-" + crypto.createHash("sha384").update(b).digest("base64");
  const nomJs = "avif-enc-" + VERSION + "-" + court(code) + ".min.js";
  const nomWasm = "avif-enc-" + VERSION + "-" + court(wasm) + ".wasm";
  fs.writeFileSync(path.join(DOSSIER, nomJs), code);
  fs.writeFileSync(path.join(DOSSIER, nomWasm), wasm);
  console.log("Écrits : web/bibliotheques/" + nomJs + " (" + Math.round(code.length / 1024) +
    " Ko) et web/bibliotheques/" + nomWasm + " (" + Math.round(wasm.length / 1024) + " Ko)\n" +
    "À reporter dans modules/encodeur-avif.mjs (ENCODEUR_AVIF) :\n" +
    '  script: "bibliotheques/' + nomJs + '",\n' +
    '  integriteScript: "' + sri(code) + '",\n' +
    '  wasm: "bibliotheques/' + nomWasm + '",\n' +
    '  integriteWasm: "' + sri(wasm) + '",\n' +
    "Puis retirez du dépôt les fichiers qu'ils remplacent.");
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
