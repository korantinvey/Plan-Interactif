/**
 * Le système d'un appareil quand le navigateur ne le dit pas :
 * `modules/mesures-page.mjs` `systemeDeRepli`, éprouvé seul.
 *
 * Hors de Chromium, `userAgentData` n'existe pas, et la sonde partait sans
 * système : les appareils d'Apple disparaissaient des relevés. Le repli doit
 * rendre les noms mêmes de `userAgentData.platform`, sans quoi un Mac sous
 * Chrome et un Mac sous Safari se compteraient en deux familles.
 *
 *   node outils/essais/systeme-repli.js     (lancé par `npm run essais`)
 */
const path = require("path");
const { pathToFileURL } = require("url");

let ko = 0;
const dit = (ok, q, d) => {
  console.log((ok ? "  ok   " : "  ÉCHEC") + "  " + q + (d ? "   → " + d : ""));
  if (!ok) ko++;
};

(async () => {
  const { systemeDeRepli } = await import(pathToFileURL(path.join(__dirname, "..", "gabarit", "modules", "mesures-page.mjs")).href);
  const cas = [
    ["Safari sur iPhone", "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1", 5, "iOS"],
    ["Chrome sur iPhone", "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/157.0 Mobile/15E148 Safari/604.1", 5, "iOS"],
    ["iPad qui se dit Macintosh", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15", 5, "iOS"],
    ["Safari sur Mac", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15", 0, "macOS"],
    ["Firefox sur Mac", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:160.0) Gecko/20100101 Firefox/160.0", 0, "macOS"],
    ["Firefox sur Windows", "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:160.0) Gecko/20100101 Firefox/160.0", 0, "Windows"],
    ["Firefox sur Android", "Mozilla/5.0 (Android 15; Mobile; rv:160.0) Gecko/160.0 Firefox/160.0", 5, "Android"],
    ["Firefox sur Linux", "Mozilla/5.0 (X11; Linux x86_64; rv:160.0) Gecko/20100101 Firefox/160.0", 0, "Linux"],
    ["Chromebook", "Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0 Safari/537.36", 0, "Chrome OS"],
    ["agent inconnu", "Robot/1.0", 0, undefined],
  ];
  for (const [nom, ua, points, attendu] of cas){
    const vu = systemeDeRepli(ua, points);
    dit(vu === attendu, nom, vu === attendu ? "" : "vu " + vu + ", attendu " + attendu);
  }
  if (ko) { console.log(ko + " échec(s)"); process.exit(1); }
})();
