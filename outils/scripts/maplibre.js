/**
 * La bibliothèque du fond de carte vectoriel : `npm run maplibre`.
 *
 * MapLibre se chargeait depuis jsDelivr, sous une version majeure flottante
 * (`maplibre-gl@4`) et sans empreinte d'intégrité : le CDN servait la dernière
 * 4.x publiée, quelle qu'elle soit, et la CSP l'autorisait à s'exécuter dans la
 * page. Un paquet piégé, ou un CDN compromis, aurait tourné chez chaque
 * visiteur d'un salon posé sur un fond de carte — et chacun d'eux donnait au
 * passage son adresse IP à un tiers, ce que le dépôt refuse déjà pour les
 * polices. Elle est désormais servie d'ici, comme deck.gl, jsQR et l'encodeur
 * AVIF : une version exacte, sous un nom qui porte l'empreinte de son contenu,
 * chargée avec son empreinte d'intégrité.
 *
 * Il ne se refait qu'avec le réseau : le paquet se télécharge hors du dépôt,
 * et seuls les deux fichiers produits sont versionnés (`web/bibliotheques/`).
 * Le script et la feuille de style sont repris tels que le paquet les publie,
 * déjà réduits, mention de licence comprise. Une version neuve s'écrit dans
 * `VERSION`, puis on relance et l'on reporte dans `modules/environs.mjs`
 * (`MAPLIBRE`) les noms et les empreintes que ce script affiche — et les
 * empreintes aussi dans `outils/anglais/invisibles.js`, qui sait qu'elles ne
 * s'affichent pas.
 *
 * La quatre, et pas au-delà : à partir de la six, le paquet ne publie plus de
 * `maplibre-gl.js`, seulement des modules — monter de majeure demande de
 * revoir aussi la façon dont `environs.mjs` le charge.
 *
 *   npm run maplibre
 */
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");

const VERSION = "4.7.1";

/* Le nom porte l'empreinte du contenu : le site garde ce dossier un an sans
   revalider (`genere.js`, `_headers`). */
const DOSSIER = path.join(__dirname, "..", "..", "web", "bibliotheques");

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "maplibre-"));
try {
  fs.writeFileSync(path.join(tmp, "package.json"), "{}");
  execFileSync("npm", ["install", "--no-audit", "--no-fund", "--silent", "--ignore-scripts",
    "maplibre-gl@" + VERSION], { cwd: tmp, stdio: "inherit" });
  const dist = path.join(tmp, "node_modules", "maplibre-gl", "dist");
  const publie = JSON.parse(fs.readFileSync(path.join(tmp, "node_modules", "maplibre-gl", "package.json"), "utf8")).version;
  if (publie !== VERSION) throw new Error("npm a installé " + publie + " au lieu de " + VERSION);

  const court = (b) => crypto.createHash("sha256").update(b).digest("hex").slice(0, 8);
  const sri = (b) => "sha384-" + crypto.createHash("sha384").update(b).digest("base64");
  const ecrit = (source, extension) => {
    const contenu = fs.readFileSync(path.join(dist, source));
    const nom = "maplibre-gl-" + VERSION + "-" + court(contenu) + "." + extension;
    fs.writeFileSync(path.join(DOSSIER, nom), contenu);
    return { nom, integrite: sri(contenu), ko: Math.round(contenu.length / 1024) };
  };
  const js = ecrit("maplibre-gl.js", "js");
  const css = ecrit("maplibre-gl.css", "css");
  console.log("Écrits : web/bibliotheques/" + js.nom + " (" + js.ko + " Ko), " + css.nom + " (" + css.ko + " Ko)\n" +
    "À reporter dans modules/environs.mjs (MAPLIBRE) :\n" +
    '  script: "bibliotheques/' + js.nom + '",\n' +
    '  integriteScript: "' + js.integrite + '",\n' +
    '  style: "bibliotheques/' + css.nom + '",\n' +
    '  integriteStyle: "' + css.integrite + '",\n' +
    "Les deux empreintes aussi dans outils/anglais/invisibles.js, à la place des anciennes.\n" +
    "Puis retirez du dépôt les fichiers qu'ils remplacent.");
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
