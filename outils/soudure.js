/**
 * Le cliquet de la soudure : `npm run soudure`.
 *
 * Le code des pages sort du script soudé vers de vrais modules, un domaine
 * après l'autre (`outils/modules.js`). Tant qu'il n'en est pas tout à fait
 * sorti, deux choses mesurent ce qui le tient encore :
 *
 * - les noms qu'un point d'entrée confie au code soudé
 *   (`Object.assign(globalThis, { … })`, `vivants({ … })`) — chacun est un
 *   appel que le code soudé fait sans import, et les `branche…` parmi eux
 *   sont les places où un module attend qu'on lui confie ce qu'il ne peut
 *   importer ;
 * - les gardes `typeof nom === "function"` du code soudé — un appel à un nom
 *   qui n'existe que dans certaines pages, que ni les types ni la relecture ne
 *   suivent.
 *
 * Ces deux chiffres ne doivent que baisser. Rien ne le garantissait : un nom
 * ajouté à la liste exposée passait toutes les vérifications, et la soudure
 * pouvait regagner d'un côté ce qu'elle perdait de l'autre. On tient donc,
 * comme pour les types (`types.js`), un cliquet : l'état d'aujourd'hui est
 * inscrit dans `outils/soudure-acceptee.json`, et tout nom ou garde
 * **nouveau** fait échouer. Le relevé est une liste de noms et non un total,
 * sans quoi un nom retiré paierait pour un nom ajouté.
 *
 * Quand la soudure recule, le fichier se resserre de lui-même — un retrait est
 * toujours sûr — et `npm run verifie` demande de le valider, comme `CARTE.md`.
 * Un nom ajouté qu'on assume vraiment s'inscrit par
 * `npm run soudure -- --accepte` : la poussée le montre alors dans le diff.
 *
 *   node outils/soudure.js
 */
const fs = require("fs");
const path = require("path");
const acorn = require("acorn");
const modules = require("./modules.js");
const { compose, PAGES } = require("./relecture.js");

const ACCEPTEE = path.join(__dirname, "soudure-acceptee.json");

/* Ce qui ouvre chaque page sans être du code soudé : la configuration et le
   moteur de langue, qui ne lisent aucun nom des modules — un `typeof f` y
   teste un paramètre. */
const HORS_SOUDURE = new Set(["_config.js", "_langue.js"]);

/** Les noms que chaque point d'entrée expose en propre : l'administration
 *  reprend le plan public, ses noms sont comptés une fois, au plan. */
function exposes() {
  const r = {};
  for (const e of Object.keys(modules.ENTREES)) {
    const herites = new Set(modules.reprises(e).flatMap(modules.exposes));
    r[e] = [...new Set(modules.exposes(e).filter((n) => !herites.has(n)))].sort();
  }
  return r;
}

/** Une garde `typeof nom === "function"`, dans un sens ou dans l'autre. */
function garde(n) {
  if (n.type !== "BinaryExpression" || !/^[!=]==?$/.test(n.operator)) return null;
  const [t, l] = n.left.type === "UnaryExpression" ? [n.left, n.right] : [n.right, n.left];
  return t.type === "UnaryExpression" && t.operator === "typeof" && t.argument.type === "Identifier" &&
    l.type === "Literal" && l.value === "function" ? t.argument.name : null;
}

function parcourt(n, vu) {
  if (!n || typeof n.type !== "string") return;
  vu(n);
  for (const k of Object.keys(n)) {
    const v = n[k];
    if (Array.isArray(v)) v.forEach((x) => parcourt(x, vu));
    else if (v && typeof v === "object" && typeof v.type === "string") parcourt(v, vu);
  }
}

/** Les gardes du code soudé, « fichier | nom » → nombre, lues page par page
 *  telle qu'elle s'assemble ; une garde vue dans deux pages compte une fois. */
function gardes() {
  const r = {};
  for (const page of Object.keys(PAGES)) {
    const { texte, table } = compose(PAGES[page]);
    const ast = acorn.parse(texte, { ecmaVersion: "latest", sourceType: "script", locations: true });
    const ici = {};
    parcourt(ast, (n) => {
      const nom = garde(n);
      if (!nom) return;
      let i = table.length - 1;
      while (i > 0 && table[i][0] > n.loc.start.line) i--;
      if (HORS_SOUDURE.has(table[i][1])) return;
      const k = table[i][1] + " | " + nom;
      ici[k] = (ici[k] || 0) + 1;
    });
    for (const [k, v] of Object.entries(ici)) r[k] = Math.max(r[k] || 0, v);
  }
  return Object.fromEntries(Object.entries(r).sort(([a], [b]) => a.localeCompare(b)));
}

const releve = () => ({ exposes: exposes(), gardes: gardes() });

const ecrit = (etat) => fs.writeFileSync(ACCEPTEE, JSON.stringify(etat, null, 1) + "\n");

/** Le compte qu'on suit : noms exposés, dont branchements, et gardes. */
function bilan(etat) {
  const noms = Object.values(etat.exposes).flat();
  return noms.length + " noms exposés au code soudé, dont " +
    noms.filter((n) => /^branche[A-Z]/.test(n)).length + " branchements ; " +
    Object.values(etat.gardes).reduce((a, b) => a + b, 0) + " gardes `typeof`";
}

if (require.main === module) {
  const vu = releve();

  if (process.argv.includes("--accepte") || !fs.existsSync(ACCEPTEE)) {
    ecrit(vu);
    console.log("Soudure inscrite dans outils/soudure-acceptee.json : " + bilan(vu) + ".");
    process.exit(0);
  }

  const acceptee = JSON.parse(fs.readFileSync(ACCEPTEE, "utf8"));
  const nouveaux = [];
  for (const [e, noms] of Object.entries(vu.exposes)) {
    const avant = new Set(acceptee.exposes[e] || []);
    for (const n of noms) if (!avant.has(n)) nouveaux.push("  " + modules.ENTREES[e] + " expose « " + n + " »");
  }
  for (const [k, v] of Object.entries(vu.gardes))
    if (v > (acceptee.gardes[k] || 0)) nouveaux.push("  garde `typeof " + k.split(" | ")[1] +
      " === \"function\"` dans " + k.split(" | ")[0]);

  if (nouveaux.length) {
    console.log(nouveaux.join("\n"));
    console.error("\nLa soudure regagne du terrain. Un module importe ce qu'il lui faut ; le code soudé\n" +
      "le reçoit d'un branchement plutôt que d'un nom de plus. Si l'ajout est vraiment\n" +
      "voulu, `npm run soudure -- --accepte` l'inscrit, et le diff le montre.");
    process.exit(1);
  }

  /* La soudure a reculé : le cliquet se referme sur le nouvel état, sans rien
     inscrire qu'il ne connaissait déjà. */
  const resserre = {
    exposes: Object.fromEntries(Object.entries(acceptee.exposes)
      .map(([e, noms]) => [e, noms.filter((n) => (vu.exposes[e] || []).includes(n))])),
    gardes: Object.fromEntries(Object.entries(acceptee.gardes)
      .filter(([k]) => vu.gardes[k]).map(([k, v]) => [k, Math.min(v, vu.gardes[k])])),
  };
  if (JSON.stringify(resserre) !== JSON.stringify(acceptee)) {
    ecrit(resserre);
    console.log("La soudure a reculé, le cliquet s'est resserré : " + bilan(resserre) + ".");
  } else {
    console.log("Soudure : " + bilan(vu) + ", rien de nouveau.");
  }
}

module.exports = { releve, bilan };
