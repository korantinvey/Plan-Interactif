/**
 * Les modules du gabarit, et le script que chaque page en reçoit.
 *
 * Tout le JavaScript des pages vit dans `outils/gabarit/modules/`, en vrais
 * modules qui disent ce qu'ils exportent et ce qu'ils importent. esbuild les
 * réunit, par point d'entrée, en un script posé après le balisage de la page.
 *
 * Le script produit n'est ni minifié ni renommé : une erreur remontée d'une
 * page doit désigner une ligne qu'on lit. Ses commentaires partent avec ceux
 * de la page (`genere.js` `epure`).
 */
const path = require("path");
const esbuild = require("esbuild");

const MODULES = path.join(__dirname, "gabarit", "modules");

/** Les points d'entrée, par famille de pages. */
const ENTREES = {
  plan: "plan.mjs",             // plan public et démonstration
  "plan-admin": "plan-admin.mjs", // l'administration : le plan, et ce que le visiteur ne reçoit pas
  console: "console.mjs",       // la console
  rapport: "rapport.mjs",       // le rapport, même socle que la console sans ses outils
  motdepasse: "motdepasse.mjs", // poser son mot de passe, sans socle ni session
  accueil: "accueil.mjs",       // la racine, qui aiguille vers la console ou un plan
};

/** Le script d'un point d'entrée, prêt à poser dans une page. */
function assemble(entree) {
  const r = esbuild.buildSync({
    entryPoints: [path.join(MODULES, ENTREES[entree])],
    bundle: true,
    format: "iife",
    write: false,
    // les accents tels quels : échappés, chaque « é » coûterait six octets
    charset: "utf8",
    legalComments: "none",
    logLevel: "silent",
  });
  return r.outputFiles[0].text;
}

/**
 * Les points d'entrée qui embarquent un module (`modules/texte.mjs`), lus dans
 * le relevé d'esbuild : c'est lui qui suit les imports, et la carte ne doit
 * pas en tenir une seconde liste qui divergerait.
 */
const _embarques = {};
function entreesDe(module) {
  const vise = path.join(MODULES, module.replace(/^modules\//, ""));
  return Object.keys(ENTREES).filter((e) => {
    if (!_embarques[e]) {
      const r = esbuild.buildSync({
        entryPoints: [path.join(MODULES, ENTREES[e])],
        bundle: true, write: false, metafile: true, logLevel: "silent",
      });
      _embarques[e] = new Set(Object.keys(r.metafile.inputs).map((f) => path.resolve(f)));
    }
    return _embarques[e].has(vise);
  });
}

module.exports = { MODULES, ENTREES, assemble, entreesDe };
