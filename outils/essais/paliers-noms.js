/**
 * Les paliers des noms : `modules/paliers-noms.mjs`, éprouvé seul.
 *
 * Harmonisés, les noms des stands s'écrivent en trois tailles, la plus haute
 * à la médiane du pavillon. Une erreur ne ferait rien planter : les noms
 * reprendraient leurs tailles disparates, ou tomberaient tous au plus petit,
 * et l'on ne le verrait qu'à l'écran. D'où des tailles connues.
 *
 *   node outils/essais/paliers-noms.js     (chaîné dans `npm run essais`)
 */
const path = require("path");
const { pathToFileURL } = require("url");

let ko = 0;
const dit = (ok, q, d) => {
  console.log((ok ? "  ok   " : "  ÉCHEC") + "  " + q + (d ? "   → " + d : ""));
  if (!ok) ko++;
};
const proche = (a, b) => Math.abs(a - b) < 1e-9;

(async () => {
  const { paliersDe, palierDe, PARTS } = await import(pathToFileURL(
    path.join(__dirname, "..", "gabarit", "modules", "paliers-noms.mjs")).href);

  console.log("\n=== 1. Les paliers d'un pavillon ===");
  /* Cinq noms : un minuscule, trois moyens, un énorme. La médiane ne doit
     rien aux deux extrêmes. */
  const p = paliersDe([.1, .8, 1, 1.2, 2.4]);
  dit(p.length === 3 && proche(p[0], 1), "le palier du haut est la médiane", JSON.stringify(p));
  dit(p.every((x, i) => proche(x, PARTS[i])), "les deux autres en sont des parts fixes");
  dit(proche(paliersDe([1, 2])[0], 1.5), "un nombre pair de noms prend le milieu des deux du centre");
  dit(paliersDe([]).length === 0 && paliersDe([0, 0]).length === 0, "rien à mesurer, aucun palier");

  console.log("\n=== 2. Le palier d'un nom ===");
  dit(palierDe(2.4, p) === p[0], "un grand nom se plafonne");
  dit(palierDe(.9, p) === p[1], "un nom entre deux paliers prend celui d'en dessous");
  dit(palierDe(.6, p) === p[2], "puis le plus petit");
  dit(palierDe(.3, p) === .3, "sous le plus petit, il garde sa taille au lieu de rapetisser");
  dit(palierDe(1 - 1e-12, p) === p[0], "le nom qui fixe la médiane l'atteint malgré l'arrondi");

  console.log(ko ? "\n" + ko + " échec(s)." : "\nTout passe.");
  process.exit(ko ? 1 : 0);
})();
