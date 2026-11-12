/**
 * Les bibliothèques servies d'ici : chaque fichier que nomme un module existe,
 * et l'empreinte d'intégrité qu'il inscrit est bien celle du fichier versionné.
 *
 * deck.gl, MapLibre, jsQR et l'encodeur AVIF vivent dans `web/bibliotheques/`,
 * et chaque module qui en charge un déclare à côté de son nom l'empreinte que
 * le navigateur vérifiera (`DECK_WEBGL`, `MAPLIBRE`, `LECTEUR_QR`,
 * `ENCODEUR_AVIF`). Une empreinte mal reportée après un `npm run …` ne casse
 * rien à la construction ni dans les essais du navigateur, qui remplacent
 * souvent la bibliothèque par une doublure : elle fait seulement refuser la
 * vraie chez chaque visiteur, et la carte, le lecteur ou le plan en WebGL
 * disparaissent sans bruit. C'est ici qu'on le voit.
 *
 *   node outils/essais/bibliotheques.js     (lancé par `npm run essais`)
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const RACINE = path.join(__dirname, "..", "..");
const MODULES = path.join(RACINE, "outils", "gabarit", "modules");
const WEB = path.join(RACINE, "web");

let ko = 0;
const dit = (ok, q, d) => {
  console.log((ok ? "  ok   " : "  ÉCHEC") + "  " + q + (d ? "   → " + d : ""));
  if (!ok) ko++;
};

const sri = (b) => "sha384-" + crypto.createHash("sha384").update(b).digest("base64");

console.log("\n=== Chaque bibliothèque nommée existe, sous l'empreinte qu'on inscrit ===");
let vues = 0;
for (const f of fs.readdirSync(MODULES).filter((n) => n.endsWith(".mjs")).sort()) {
  const texte = fs.readFileSync(path.join(MODULES, f), "utf8");
  /* Un objet à plat qui nomme au moins un fichier de `bibliotheques/` : ses
     empreintes sont les `sha384-…` qu'il porte. */
  for (const [objet] of texte.matchAll(/\{[^{}]*"bibliotheques\/[^"]+"[^{}]*\}/g)) {
    const empreintes = new Set([...objet.matchAll(/"(sha384-[A-Za-z0-9+/=]+)"/g)].map((m) => m[1]));
    for (const [, fichier] of objet.matchAll(/"(bibliotheques\/[^"]+)"/g)) {
      vues++;
      const chemin = path.join(WEB, fichier);
      if (!fs.existsSync(chemin)) { dit(false, f + " : " + fichier, "absent de web/"); continue; }
      const vraie = sri(fs.readFileSync(chemin));
      dit(empreintes.has(vraie), f + " : " + fichier,
        empreintes.has(vraie) ? "" : "l'empreinte du fichier est " + vraie);
    }
  }
}
dit(vues >= 6, "les bibliothèques connues sont toutes vues", vues + " fichiers");

console.log("\n=== Plus rien ne se charge d'un CDN ===");
const DEHORS = /["'`]https:\/\/(cdn\.jsdelivr\.net|unpkg\.com|cdnjs\.cloudflare\.com)\//;
const fautifs = fs.readdirSync(MODULES).filter((n) => n.endsWith(".mjs") &&
  DEHORS.test(fs.readFileSync(path.join(MODULES, n), "utf8")));
dit(!fautifs.length, "aucun module ne nomme un CDN de bibliothèques", fautifs.join(", "));

console.log(ko ? "\n" + ko + " ÉCHEC(S)\n" : "\nLes bibliothèques servies d'ici sont celles qu'on croit.\n");
process.exit(ko ? 1 : 0);
