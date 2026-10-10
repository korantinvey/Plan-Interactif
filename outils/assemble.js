/**
 * Assemble le gabarit du plan : les modules mis bout à bout, dans cet ordre.
 *
 * L'ordre est exporté plutôt que recopié : `outils/relecture.js` relit le
 * code tel que la page l'assemble, et ramène chaque remarque au module et à
 * la ligne qui la portent — il lui faut donc exactement la même suite.
 */
const fs = require("fs");
const D = __dirname;

const BOUTS = ["_entete.html", "_styles-jetons.css", "_styles-plan.css", "_styles-modeles.css", "_styles-parcours.css", "_styles-modeles-parcours.css", "_styles-divers.css", "_head.html", "_js.html"];

/** Un module tel qu'il entre dans l'assemblage. */
function lisBout(b) {
  return fs.readFileSync(D + "/gabarit/" + b, "utf8");
}

module.exports = { BOUTS, lisBout };

if (require.main === module) {
  const tpl = BOUTS.map(lisBout).join("");
  fs.writeFileSync(D + "/tpl-multi.html", tpl);
  console.log("gabarit :", (tpl.length / 1024).toFixed(0), "Ko");
}
