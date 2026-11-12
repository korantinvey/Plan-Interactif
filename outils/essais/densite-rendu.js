/**
 * La densité du rendu : la règle de `modules/densite-rendu.mjs`, éprouvée seule.
 *
 * Une erreur n'y casse rien qui se voie : un téléphone modeste resterait peint
 * à pleine densité, et saccaderait comme avant ; un téléphone vif serait
 * plafonné, un peu moins fin. D'où des cas tirés des appareils que la sonde a
 * vus, et dont on sait lesquels saccadaient.
 *
 *   node outils/essais/densite-rendu.js     (lancé par `npm run essais`)
 */
const path = require("path");
const { pathToFileURL } = require("url");

let ko = 0;
const dit = (ok, q, d) => {
  console.log((ok ? "  ok   " : "  ÉCHEC") + "  " + q + (d ? "   → " + d : ""));
  if (!ok) ko++;
};

(async () => {
  const D = await import(pathToFileURL(
    path.join(__dirname, "..", "gabarit", "modules", "densite-rendu.mjs")).href);

  console.log("\n=== 1. Qui est modeste — les appareils relevés par la sonde ===");
  /* Sonde, 21 octobre au 11 novembre 2026 : mémoire annoncée, plus grande
     texture, et si plus d'un quart des images passaient 33 ms. */
  const vus = [
    ["Redmi Note 9 Pro, Adreno 618", 4, 4096, true],
    ["Adreno 512", 4, 4096, true],
    ["Mali-G52 MC2", 4, 4096, true],
    ["Adreno 610, 4 Go", 4, 8192, true],
    ["Adreno 610, textures 4096", 8, 4096, true],
    ["Mali-G57 MC2", 8, 4096, true],
    ["Mali-G720-Immortalis", 8, 8192, false],
    ["Adreno 740", 8, 8192, false],
    ["Xclipse 940", 8, 8192, false],
  ];
  for (const [nom, memoireGo, textureMax, lent] of vus) {
    const m = D.estModeste({ memoireGo, textureMax });
    dit(m === lent, nom + (lent ? " : modeste" : " : pas modeste"), "rendu " + m);
  }

  console.log("\n=== 2. Ce qui ne se sait pas ne désigne personne ===");
  dit(D.estModeste({}) === false, "rien de connu : pas modeste");
  // un iPhone : Safari ne dit pas sa mémoire, et ses textures vont à 16 384
  dit(D.estModeste({ textureMax: 16384 }) === false, "un iPhone : pas modeste");
  dit(D.estModeste({ memoireGo: 0, textureMax: 0 }) === false, "des zéros : pas modeste");
  dit(D.estModeste({ memoireGo: 2 }) === true, "deux gigaoctets, carte inconnue : modeste");

  console.log("\n=== 3. Le plafond ===");
  dit(D.plafonne(2.75, true) === D.DENSITE_MODESTE, "2,75 modeste → " + D.DENSITE_MODESTE);
  dit(D.plafonne(2.75, false) === 2.75, "2,75 pas modeste → 2,75");
  // jamais plus fin que l'écran : un écran ordinaire reste à sa densité
  dit(D.plafonne(1.5, true) === 1.5, "1,5 modeste → 1,5");
  dit(D.plafonne(NaN, true) === 1, "densité inconnue → 1");

  console.log(ko ? "\n" + ko + " échec(s)" : "\nTout est bon.");
  process.exit(ko ? 1 : 0);
})();
