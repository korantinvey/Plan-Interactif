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
  // deck.gl, chargé à la demande depuis `web/bibliotheques/` par `modules/webgl.mjs`
  deck: "readonly",
  // la place du dictionnaire anglais dans `_langue.js`, que `genere.js` remplit
  __DICTIONNAIRE__: "readonly",
};

const NODE = { ...globals.node };

module.exports = [
  {
    ignores: [
      "web/**", "node_modules/**", "supabase/**", ".wrangler/**",
      // les copies de travail que Claude Code ouvre à côté du dépôt : chacune est
      // un dépôt entier, relu chez elle et non deux fois depuis celui-ci
      ".claude/**",
      "outils/tpl-multi.html", "outils/chk.js", "outils/brut/**", "outils/svg/**",
      "simulations/**", "test-results/**", "playwright-report/**",
      // relus par `outils/relecture.js`, tels que la page les assemble
      "outils/gabarit/*.{html,css,js}", "!outils/gabarit/_sw.js",
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
  /* Les modules du gabarit : de vrais modules, relus seuls. Le moteur de
     langue est posé avant tout script de la page : un module peut s'en
     servir pour ce qui quitte la page traduit. deck.gl arrive plus tard,
     chargée à la demande : le rendu par la carte graphique (`webgl.mjs`) ne
     la lit qu'une fois là.

     Et rien ne se pose sur l'objet global : c'est ainsi que le code des
     pages s'était soudé en un seul espace de noms, chacun appelant les
     fonctions de tous sans le dire. Un nom passe d'un module à l'autre par
     `import`, ou par une porte (`confieALaVue`…) quand l'import bouclerait.
     Les noms en `__` font exception : l'amorce que la construction pose
     avant les scripts (`__plan`, `__entete`, que le démarrage consomme) et
     ce que les essais lisent dans la page (`__essais`, `plan.mjs`). */
  {
    files: ["outils/gabarit/modules/**/*.mjs"],
    languageOptions: { ecmaVersion: "latest", sourceType: "module", globals: {
      ...globals.browser, LANGUE: GLOBALES_PAGE.LANGUE, traduit: GLOBALES_PAGE.traduit,
      deck: GLOBALES_PAGE.deck } },
    rules: { ...REGLES, "no-restricted-syntax": ["error",
      { selector: "CallExpression[callee.object.name='Object'][arguments.0.name=/^(globalThis|window|self)$/]",
        message: "Rien ne se pose sur l'objet global : importez, ou confiez par une porte." },
      { selector: "AssignmentExpression[left.object.name=/^(globalThis|window|self)$/]" +
          ":not([left.property.name=/^__/])",
        message: "Rien ne se pose sur l'objet global : importez, ou confiez par une porte." },
    ] },
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
