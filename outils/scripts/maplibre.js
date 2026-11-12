/**
 * MapLibre, servi par le site lui-même : `npm run maplibre`.
 *
 * Le fond de carte vectoriel (`modules/environs.mjs`) chargeait MapLibre depuis
 * jsDelivr, à la majeure (`maplibre-gl@4`) et sans contrôle d'intégrité. Trois
 * défauts à la fois : le seul code tiers du plan qu'on ne maîtrisait pas — la
 * version changeait sous nos pieds à chaque correctif publié, et un CDN
 * compromis aurait exécuté ce qu'il voulait chez chaque visiteur ; l'adresse
 * IP de chaque visiteur dont le salon a une carte, transmise à un tiers,
 * contre la règle que suivent déjà les polices ; et une origine de plus dans
 * la politique de sécurité (`genere.js` `poseCsp`).
 *
 * Comme deck.gl (`deck.js`), il ne se refait qu'avec le réseau : le paquet se
 * télécharge dans un dossier temporaire, hors du dépôt, et seuls les deux
 * fichiers produits sont versionnés (`web/bibliotheques/`). Leur nom porte
 * l'empreinte du contenu : le site garde ce dossier un an sans revalider.
 * Une version neuve s'écrit dans `VERSION`, puis on relance, et l'on reporte
 * dans `modules/environs.mjs` (`MAPLIBRE`) ce que ce script affiche.
 *
 *   npm run maplibre
 */
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");

/* La quatre, et pas au-delà : à partir de la six, le paquet ne publie plus de
   « maplibre-gl.js » à poser en script, seulement des modules. 4.7.1 est ce
   que servait `maplibre-gl@4` quand on a cessé de passer par le CDN. */
const VERSION = "4.7.1";

const DOSSIER = path.join(__dirname, "..", "..", "web", "bibliotheques");

/* La carte de correspondance n'est pas livrée : la ligne qui la nomme ferait
   demander un fichier absent à chaque ouverture des outils de développement. */
const SANS_CARTE = (t) => t.replace(/\n?\/[/*]# sourceMappingURL=[^\n]*\s*$/, "\n");

function construit() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "maplibre-"));
  try {
    execFileSync("npm", ["pack", "--silent", "maplibre-gl@" + VERSION], { cwd: tmp, stdio: ["ignore", "ignore", "inherit"] });
    const archive = fs.readdirSync(tmp).find((f) => f.endsWith(".tgz"));
    if (!archive) throw new Error("npm pack n'a rien rendu");
    execFileSync("tar", ["-xzf", archive], { cwd: tmp });
    const dist = path.join(tmp, "package", "dist");

    const lignes = [];
    for (const ext of ["js", "css"]) {
      const code = SANS_CARTE(fs.readFileSync(path.join(dist, "maplibre-gl." + ext), "utf8"));
      const nom = "maplibre-gl-" + VERSION + "-" +
        crypto.createHash("sha256").update(code).digest("hex").slice(0, 8) + ".min." + ext;
      fs.writeFileSync(path.join(DOSSIER, nom), code);
      lignes.push("  " + ext + ': { src: "bibliotheques/' + nom + '", integrite: "sha384-' +
        crypto.createHash("sha384").update(code).digest("base64") + '" },' +
        "   (" + Math.round(code.length / 1024) + " Ko)");
    }
    console.log("Écrits dans web/bibliotheques/. À reporter dans modules/environs.mjs (MAPLIBRE) :\n" +
      lignes.join("\n") + "\nRemplacez aussi les deux empreintes dans outils/anglais/invisibles.js,\n" +
      "puis retirez du dépôt les fichiers qu'ils remplacent.");
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

try { construit(); } catch (e) { console.error(e.message); process.exit(1); }
