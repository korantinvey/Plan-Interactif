/**
 * La vérification des types du code des pages : `npm run types`.
 *
 * TypeScript lit le JavaScript tel quel (`checkJs`), sans qu'on récrive rien :
 * il déduit les types de l'usage, et des quelques annotations JSDoc qu'on lui
 * donne. Il part des points d'entrée des modules et suit leurs imports, comme
 * esbuild ; il relit aussi, comme `relecture.js`, les scripts que chaque page
 * porte hors des modules, et ramène chaque remarque au fichier et à la ligne
 * qui la portent.
 *
 * Le code n'a jamais été écrit pour lui : il en relève quelques centaines de
 * remarques, presque toutes des éléments du DOM qu'il ne sait pas plus précis
 * qu'un `Element`. Exiger zéro d'un coup aurait semé des annotations partout.
 * On tient donc un cliquet : les remarques d'aujourd'hui sont inscrites dans
 * `outils/types-acceptes.json`, et seule une remarque **nouvelle** fait
 * échouer. Le stock se résorbe module par module ; quand il baisse,
 * `npm run types -- --resserre` réinscrit l'état, et le cliquet se referme.
 *
 * Une remarque est repérée par son module, son code, son message et le texte
 * de sa ligne — pas par son numéro de ligne, qui bouge à chaque retouche au
 * dessus d'elle.
 */
const fs = require("fs");
const os = require("os");
const path = require("path");
const ts = require("typescript");
const { compose, PAGES } = require("./relecture.js");
const modules = require("./modules.js");

const ACCEPTES = path.join(__dirname, "types-acceptes.json");

/* Ce que les pages trouvent sans le déclarer : les mêmes noms que
   `eslint.config.js` `GLOBALES_PAGE`, avec leur forme. */
const DECLARATIONS = [
  "declare var LANGUE: any;",
  "declare function traduit(phrase: string): string;",
  "declare var deck: any;",
  "declare var __DICTIONNAIRE__: any;",
  // la marque du produit, qu'esbuild remplace à la construction (`genere.js` `DEFINIS`)
  "declare const MARQUE_PRODUIT: string;",
  /* Un élément cherché par sélecteur, rendu sans type précis — la règle de
     `$` (`modules/dom.mjs`), pour la même raison : la bibliothèque rend un
     `Element` nu, sans `dataset`, `value` ni `onclick`, et chaque recherche
     aurait dû dire si elle tient un champ, un bouton ou une image. Le type
     se précise là où il sert, par `@type`. Une recherche par balise
     (`querySelector("svg")`) garde son type exact. */
  /* Ce que la page pose elle-même sur `window` avant son script — l'amorce de
     `genere.js` (`__plan`, `__entete`), la configuration (`PLAN_CONFIG`) —,
     ce qu'une bibliothèque chargée à la demande y pose (`maplibregl`), et ce
     que des navigateurs offrent sans que la norme le dise : chaque usage le
     teste avant de s'en servir. */
  "interface Window { PLAN_CONFIG?: any; __plan?: Promise<Response> | null;",
  "  __entete?: Promise<any> | null; maplibregl?: any; clipboardData?: DataTransfer; }",
  "interface Navigator { connection?: any; getInstalledRelatedApps?: () => Promise<any[]>; }",
  "interface ParentNode {",
  "  querySelector<E extends Element = any>(selectors: string): E | null;",
  "  querySelectorAll<E extends Element = any>(selectors: string): NodeListOf<E>;",
  "}",
].join("\n");

const OPTIONS = {
  // les modules se résolvent comme esbuild les résout : par leur chemin, extension comprise
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  allowJs: true,
  checkJs: true,
  noEmit: true,
  target: ts.ScriptTarget.ES2022,
  lib: ["lib.es2023.d.ts", "lib.dom.d.ts", "lib.dom.iterable.d.ts"],
  skipLibCheck: true,
  types: [],
};

/* Les points d'entrée, une seule fois pour toutes les pages : un module
   partagé se vérifie ainsi une fois, et l'administration, qui reprend le plan
   public en entier, couvre ce que le visiteur reçoit. */
const ENTREES = Object.values(modules.ENTREES).map((f) => path.join(modules.MODULES, f));

function verifiePage(page, dossier) {
  const { texte, table } = compose(PAGES[page]);
  const fichier = path.join(dossier, page.replace(/\.html$/, ".js"));
  const decl = path.join(dossier, "globales.d.ts");
  fs.writeFileSync(fichier, texte);
  fs.writeFileSync(decl, DECLARATIONS);
  const racines = [fichier, decl, ...(page === Object.keys(PAGES)[0] ? ENTREES : [])];
  const programme = ts.createProgram(racines, OPTIONS);
  return ts.getPreEmitDiagnostics(programme)
    .filter((d) => d.file && (path.resolve(d.file.fileName) === path.resolve(fichier) ||
      path.resolve(d.file.fileName).startsWith(modules.MODULES + path.sep)))
    .map((d) => {
      const { line } = d.file.getLineAndCharacterOfPosition(d.start);
      // une remarque dans un module se rapporte à lui, ligne pour ligne
      if (path.resolve(d.file.fileName) !== path.resolve(fichier)) {
        const message = ts.flattenDiagnosticMessageText(d.messageText, " ").split(" ").slice(0, 40).join(" ");
        return { module: "modules/" + path.basename(d.file.fileName), ligne: line + 1, code: "TS" + d.code,
          message, source: d.file.text.split("\n")[line].trim() };
      }
      const ligne = line + 1;
      let i = table.length - 1;
      while (i > 0 && table[i][0] > ligne) i--;
      const module = table[i][1];
      const dans = ligne - table[i][0] + 1;
      const source = texte.split("\n")[line].trim();
      const message = ts.flattenDiagnosticMessageText(d.messageText, " ").split(" ").slice(0, 40).join(" ");
      return { module, ligne: dans, code: "TS" + d.code, message, source };
    });
}

const cleDe = (r) => [r.module, r.code, r.message, r.source].join(" | ");

function releve() {
  const dossier = fs.mkdtempSync(path.join(os.tmpdir(), "types-"));
  const vues = new Map();
  try {
    for (const page of Object.keys(PAGES)) {
      // une page en recouvre une autre (le plan public et son administration) :
      // une même remarque n'y compte qu'une fois par page où elle tombe, au plus
      const ici = new Map();
      for (const r of verifiePage(page, dossier)) {
        const k = cleDe(r);
        ici.set(k, { ...r, n: (ici.get(k)?.n || 0) + 1 });
      }
      for (const [k, r] of ici) if (!vues.has(k) || vues.get(k).n < r.n) vues.set(k, r);
    }
  } finally {
    fs.rmSync(dossier, { recursive: true, force: true });
  }
  return vues;
}

if (require.main === module) {
  const vues = releve();
  const acceptes = fs.existsSync(ACCEPTES) ? JSON.parse(fs.readFileSync(ACCEPTES, "utf8")) : {};

  if (process.argv.includes("--resserre")) {
    const etat = {};
    for (const [k, r] of [...vues].sort(([a], [b]) => a.localeCompare(b))) etat[k] = r.n;
    fs.writeFileSync(ACCEPTES, JSON.stringify(etat, null, 1) + "\n");
    console.log("Cliquet resserré : " + vues.size + " remarques inscrites dans outils/types-acceptes.json.");
    process.exit(0);
  }

  const nouvelles = [...vues.values()].filter((r) => r.n > (acceptes[cleDe(r)] || 0));
  const parties = Object.keys(acceptes).filter((k) => !vues.has(k) || vues.get(k).n < acceptes[k]);

  for (const r of nouvelles.sort((a, b) => a.module.localeCompare(b.module) || a.ligne - b.ligne))
    console.log(`outils/gabarit/${r.module}:${r.ligne}  ${r.code}  ${r.message}\n    ${r.source}`);

  if (nouvelles.length) {
    console.error("\n" + nouvelles.length + " remarque(s) de type nouvelle(s). Corrigez-la, ou précisez le type\n" +
      "attendu en JSDoc (`/** @type {HTMLInputElement} */`). Si TypeScript se trompe vraiment,\n" +
      "`// @ts-expect-error <pourquoi>` sur la ligne d'avant.");
    process.exit(1);
  }
  const total = [...vues.values()].reduce((n, r) => n + r.n, 0);
  console.log("Types : " + total + " remarques connues, aucune nouvelle." +
    (parties.length ? "\n" + parties.length + " ont disparu : `npm run types -- --resserre` referme le cliquet." : ""));
}
