/**
 * Les modules du gabarit, et ce qu'ils confient au code soudé.
 *
 * Le code des pages a longtemps été un seul script par page, fait de modules
 * mis bout à bout dans un espace de noms unique (`assemble.js`). Il en sort
 * peu à peu, vers `outils/gabarit/modules/`, en vrais modules qui disent ce
 * qu'ils exportent et ce qu'ils importent. esbuild les réunit, par point
 * d'entrée, en un script posé avant le code soudé.
 *
 * Le code soudé ne sait pas importer : chaque point d'entrée lui confie ses
 * noms par `Object.assign(globalThis, { … })`. Cette liste est relue ici, et
 * nulle part recopiée : la construction, la relecture ESLint et les types en
 * tirent ce que les pages trouvent sans le déclarer.
 *
 * Le script produit n'est ni minifié ni renommé : une erreur remontée d'une
 * page doit désigner une ligne qu'on lit. Ses commentaires partent avec ceux
 * de la page (`genere.js` `epure`).
 */
const fs = require("fs");
const path = require("path");
const acorn = require("acorn");
const esbuild = require("esbuild");

const MODULES = path.join(__dirname, "gabarit", "modules");

/** Les points d'entrée, par famille de pages. */
const ENTREES = {
  plan: "plan.mjs",             // plan public et démonstration
  "plan-admin": "plan-admin.mjs", // l'administration : le plan, et ce que le visiteur ne reçoit pas
  console: "console.mjs",       // la console
  rapport: "rapport.mjs",       // le rapport, même socle que la console sans ses outils
};

const lisEntree = (entree) => acorn.parse(
  fs.readFileSync(path.join(MODULES, ENTREES[entree]), "utf8"),
  { ecmaVersion: "latest", sourceType: "module" });

/* Un point d'entrée qui en importe un autre sans rien nommer
   (`import "./plan.mjs"`) le reprend en entier : ses noms exposés compris.
   C'est ainsi que l'administration a le plan, plus ce qui n'est qu'à elle,
   dans un seul script — deux scripts auraient chacun leur exemplaire des
   modules partagés, et deux états qui divergent. */
function reprises(entree) {
  return lisEntree(entree).body
    .filter((n) => n.type === "ImportDeclaration" && !n.specifiers.length)
    .map((n) => Object.keys(ENTREES).find((e) => "./" + ENTREES[e] === n.source.value))
    .filter(Boolean);
}

/**
 * Les noms qu'un point d'entrée confie au code soudé, dans l'ordre où il les
 * écrit. On les lit dans l'arbre du module : l'appel `Object.assign` sur
 * `globalThis`, et les clés de son objet littéral — rien d'autre n'est admis,
 * pour que la liste reste lisible par un outil comme par un humain.
 */
function exposes(entree) {
  const ast = lisEntree(entree);
  const noms = reprises(entree).flatMap(exposes);
  for (const n of ast.body) {
    const e = n.type === "ExpressionStatement" && n.expression;
    if (!e || e.type !== "CallExpression" || e.callee.type !== "MemberExpression" ||
        e.callee.object.name !== "Object" || e.callee.property.name !== "assign" ||
        !e.arguments[0] || e.arguments[0].name !== "globalThis") continue;
    const o = e.arguments[1];
    if (!o || o.type !== "ObjectExpression")
      throw new Error(ENTREES[entree] + " : Object.assign(globalThis, …) attend un objet littéral");
    for (const p of o.properties) {
      if (p.type !== "Property" || p.computed || p.key.type !== "Identifier")
        throw new Error(ENTREES[entree] + " : seules des clés nommées s'exposent au code soudé");
      noms.push(p.key.name);
    }
  }
  return noms;
}

/**
 * D'où vient chaque nom exposé : le module qui l'exporte, lu dans les
 * `import` du point d'entrée. Les types en tirent la signature exacte de
 * chaque nom plutôt qu'un `any` — c'est tout l'intérêt d'un module.
 */
function origines(entree) {
  const ast = lisEntree(entree);
  const herites = new Map(reprises(entree).flatMap(origines).map((o) => [o.nom, o]));
  const de = new Map(herites);
  for (const n of ast.body) {
    if (n.type !== "ImportDeclaration") continue;
    const source = path.join(MODULES, n.source.value);
    for (const s of n.specifiers)
      if (s.type === "ImportSpecifier") de.set(s.local.name, { source, exporte: s.imported.name });
  }
  return exposes(entree).map((nom) => {
    if (!de.has(nom)) throw new Error(ENTREES[entree] + " : « " + nom + " » est exposé sans être importé");
    return { nom, ...de.get(nom) };
  });
}

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

module.exports = { MODULES, ENTREES, exposes, origines, assemble, entreesDe };
