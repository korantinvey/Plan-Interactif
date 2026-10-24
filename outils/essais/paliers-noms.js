/**
 * Les paliers des noms : `modules/paliers-noms.mjs`, éprouvé seul.
 *
 * Harmonisés, les noms des stands s'écrivent en trois tailles, la plus haute
 * celle qu'atteignent les trois quarts des noms du pavillon. Une erreur ne ferait rien planter : les noms
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
  /* Huit noms : deux minuscules, quatre moyens, deux énormes. Le plafond est
     la taille qu'atteignent les trois quarts — ni le plus petit, ni la
     médiane. */
  const tailles = [.1, .2, .8, .9, 1, 1.1, 2, 2.4];
  const p = paliersDe(tailles);
  dit(p.length === 3 && proche(p[0], .8), "le plafond est au premier quart", JSON.stringify(p));
  dit(p.every((x, i) => proche(x, .8 * PARTS[i])), "les deux autres en sont des parts fixes");
  dit(tailles.filter(f => f >= p[0]).length / tailles.length >= .75, "les trois quarts des noms l'atteignent");
  dit(PARTS[2] >= .7 - 1e-9, "le palier du bas reste aux deux tiers au moins du haut");
  dit(paliersDe([]).length === 0 && paliersDe([0, 0]).length === 0, "rien à mesurer, aucun palier");

  console.log("\n=== 2. Le palier d'un nom ===");
  dit(palierDe(2.4, p) === p[0], "un grand nom se plafonne");
  dit(palierDe(.75, p) === p[1], "un nom entre deux paliers prend celui d'en dessous");
  dit(palierDe(.6, p) === p[2], "puis le plus petit");
  dit(palierDe(.3, p) === .3, "sous le plus petit, il garde sa taille au lieu de rapetisser");
  dit(palierDe(.8 - 1e-12, p) === p[0], "le nom qui fixe le plafond l'atteint malgré l'arrondi");

  console.log(ko ? "\n" + ko + " échec(s)." : "\nTout passe.");
  process.exit(ko ? 1 : 0);
})();
