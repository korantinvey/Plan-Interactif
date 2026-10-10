/**
 * Les modules du gabarit, et le script que chaque page en reçoit.
 *
 * Tout le JavaScript des pages vit dans `outils/gabarit/modules/`, en vrais
 * modules qui disent ce qu'ils exportent et ce qu'ils importent. esbuild les
 * réunit, par point d'entrée, en un script posé après le balisage de la page.
 *
 * Le plan public et l'administration reçoivent un script **minifié** : c'est
 * ce que chaque visiteur télécharge, et la minification en retire plus d'un
 * cinquième, compressé compris. Il vient avec sa carte de correspondance
 * (`.map`), qui ramène chaque position au module et à la ligne d'origine : la
 * console du navigateur montre `modules/fiche.mjs:132`, non une colonne d'une
 * ligne de trois cent mille caractères. La carte ne porte pas les sources
 * (`sourcesContent`) — les commentaires du gabarit n'atteignent toujours pas
 * le visiteur —, seulement les noms des fichiers et des variables.
 *
 * `PLAN_LISIBLE=1 npm run construire` rend le script tel qu'il était : ni
 * minifié ni renommé, commentaires retirés avec ceux de la page (`genere.js`
 * `epure`). Les écrans de l'exploitant, qu'aucun visiteur ne charge, le
 * restent toujours.
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

/** Les points d'entrée dont le script est minifié, sauf `PLAN_LISIBLE=1`. */
const MINIFIES = process.env.PLAN_LISIBLE === "1" ? [] : ["plan", "plan-admin"];

/* La carte de chaque script minifié, retrouvée par son code au moment où la
   construction le sort de la page (`genere.js` `sortScripts`). */
const CARTES = new Map();

/**
 * Le script d'un point d'entrée, prêt à poser dans une page. Ce que la
 * construction y verse passe par `define`, qu'esbuild remplace en lisant les
 * modules : une substitution faite après coup, dans un script minifié tenant
 * sur une ligne, décalerait toutes les colonnes qui la suivent, et la carte
 * mentirait.
 */
function assemble(entree, define = {}) {
  const minifie = MINIFIES.includes(entree);
  const r = esbuild.buildSync({
    entryPoints: [path.join(MODULES, ENTREES[entree])],
    bundle: true,
    format: "iife",
    write: false,
    // les accents tels quels : échappés, chaque « é » coûterait six octets
    charset: "utf8",
    legalComments: "none",
    logLevel: "silent",
    minify: minifie,
    // une adresse de rangement fictive, pour que la carte nomme les modules
    // depuis la racine du site : `../../outils/gabarit/modules/fiche.mjs`
    outfile: path.join(MODULES, "..", "..", "..", "web", "versions", entree + ".js"),
    sourcemap: minifie ? "external" : false,
    sourcesContent: false,
    metafile: minifie,
    define,
  });
  const code = r.outputFiles.find((f) => f.path.endsWith(".js")).text;
  if (!minifie) return code;
  CARTES.set(code.trim(), r.outputFiles.find((f) => f.path.endsWith(".map")).text);
  /* Le dictionnaire anglais se choisit d'après les modules qu'une page
     embarque, qu'il repère au chemin qu'esbuild écrit devant chacun
     (`traductions.js` `repereModule`) — et que la minification efface. On
     les écrit donc à la suite du code, où ils ne décalent rien ; l'épuration
     de la page les retire ensuite avec les autres commentaires. */
  const reperes = Object.keys(r.metafile.inputs).filter((f) => f.endsWith(".mjs"))
    .map((f) => "// " + path.relative(path.join(MODULES, "..", "..", ".."), path.resolve(f)).split(path.sep).join("/"));
  return code + reperes.join("\n") + "\n";
}

/** La carte d'un script minifié, d'après son code ; `undefined` s'il ne l'est pas. */
const carteDe = (code) => CARTES.get(code.trim());

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

module.exports = { MODULES, ENTREES, assemble, carteDe, entreesDe };
