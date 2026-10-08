/**
 * La relecture par ESLint. `npm run lint` la lance en entier : ce fichier pour
 * les outils, le Worker et les essais ; `outils/relecture.js` pour le code des
 * pages, qu'on ne peut relire que tel que la page l'assemble (il y explique
 * pourquoi), et qui reprend d'ici ses règles et ses globales.
 */
const js = require("@eslint/js");
const globals = require("globals");

/* Les règles recommandées, et trois écarts assumés. */
const REGLES = {
  ...js.configs.recommended.rules,
  /* Un `catch (e) {}` vide est ici une décision, pas un oubli : le stockage
     refusé d'un navigateur privé, une mesure qui échoue — la visite continue,
     et le commentaire qui l'explique est d'ordinaire juste au-dessus. */
  "no-empty": ["error", { allowEmptyCatch: true }],
  /* Les paramètres et les erreurs rattrapées restent nommés même inutilisés :
     la signature d'un rappel dit ce qu'il reçoit. Les variables, elles, non. */
  "no-unused-vars": ["error", { args: "none", caughtErrors: "none" }],
  /* Les caractères de contrôle sont justement ce que l'export retire d'une
     cellule de classeur, et ce qu'on refuse dans un identifiant reçu. */
  "no-control-regex": "off",
};

/* Ce que le code des pages trouve sans le déclarer lui-même. */
const GLOBALES_PAGE = {
  // posés sur `window` par le moteur de langue, `_langue.js`
  LANGUE: "readonly",
  traduit: "readonly",
  // deck.gl, chargé à la demande depuis `web/bibliotheques/` par `_webgl.html`
  deck: "readonly",
  // la place du dictionnaire anglais dans `_langue.js`, que `genere.js` remplit
  __DICTIONNAIRE__: "readonly",
};

const NODE = { ...globals.node };

module.exports = [
  {
    ignores: [
      "web/**", "node_modules/**", "supabase/**", ".wrangler/**",
      "outils/tpl-multi.html", "outils/chk.js", "outils/brut/**", "outils/svg/**",
      "simulations/**", "test-results/**", "playwright-report/**",
      // relus par `outils/relecture.js`, tels que la page les assemble
      "outils/gabarit/**", "!outils/gabarit/_sw.js",
    ],
  },
  {
    files: ["**/*.js"],
    languageOptions: { ecmaVersion: "latest", sourceType: "commonjs", globals: NODE },
    rules: REGLES,
  },
  {
    files: ["src/**/*.mjs"],
    // un Worker de Cloudflare : l'environnement d'un service de second plan, à
    // peu de chose près — `AbortSignal` y est, que la liste ne nomme pas
    languageOptions: { ecmaVersion: "latest", sourceType: "module",
      globals: { ...globals.serviceworker, AbortSignal: "readonly" } },
    rules: REGLES,
  },
  {
    // le service de second plan : un script à part, dans son propre monde
    files: ["outils/gabarit/_sw.js"],
    languageOptions: { sourceType: "script", globals: globals.serviceworker },
  },
  {
    // ce que les essais font exécuter dans la page voit le navigateur
    files: ["outils/essais/navigateur/**/*.js"],
    languageOptions: { globals: { ...NODE, ...globals.browser } },
  },
];

module.exports.REGLES = REGLES;
module.exports.GLOBALES_PAGE = GLOBALES_PAGE;
