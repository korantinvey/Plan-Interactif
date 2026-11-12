/**
 * Le HTML que les pages écrivent est-il fait de morceaux sûrs : `npm run html`.
 *
 * La règle est dans `regle-html.js`, qui dit ce qu'elle tient pour sûr et
 * pourquoi. Elle n'est pas posée dans `eslint.config.js` avec les autres : le
 * jour de son arrivée, elle relevait une soixantaine d'écritures qu'elle ne
 * savait pas prouver — des constantes importées d'un autre module, du SVG tracé
 * par le code lui-même, qu'elle ne voit pas d'où elle lit —, et `npm run lint`
 * aurait échoué sur chacune.
 *
 * On tient donc, comme `types.js`, une référence figée (*baseline*) : ce
 * qu'elle relevait est inscrit dans `outils/controles/html-acceptes.json`, et
 * seule une écriture **nouvelle** fait échouer. Une écriture est repérée par
 * son module et le texte de sa ligne, pas par son numéro, qui bouge à chaque
 * retouche au-dessus d'elle. Quand le stock baisse — une écriture passée par
 * `esc()`, ou bâtie par `textContent` —, `npm run html -- --resserre` réinscrit
 * l'état, et la référence se resserre : elle ne peut que diminuer.
 *
 *   node outils/controles/html.js     (lancé par `npm run verifie` et la CI)
 */
const fs = require("fs");
const path = require("path");
const { ESLint } = require("eslint");

const RACINE = path.join(__dirname, "..", "..");
const ACCEPTES = path.join(__dirname, "html-acceptes.json");
const MODULES = "outils/gabarit/modules/*.mjs";

const cleDe = (r) => r.module + " :: " + r.texte;

async function releve() {
  const eslint = new ESLint({
    cwd: RACINE,
    overrideConfigFile: true,
    overrideConfig: [{
      files: ["**/*.mjs"],
      plugins: { plan: require("./regle-html.js") },
      languageOptions: { ecmaVersion: "latest", sourceType: "module" },
      rules: { "plan/html-echappe": "error" },
    }],
  });
  const vues = new Map();
  for (const res of await eslint.lintFiles([MODULES])) {
    const fatale = res.messages.find((m) => m.fatal);
    if (fatale) throw new Error(path.relative(RACINE, res.filePath) + " : " + fatale.message);
    const lignes = (res.source || fs.readFileSync(res.filePath, "utf8")).split("\n");
    for (const m of res.messages) {
      const r = { module: path.basename(res.filePath), ligne: m.line, texte: lignes[m.line - 1].trim(), message: m.message };
      const k = cleDe(r);
      const deja = vues.get(k);
      if (deja) deja.n++;
      else vues.set(k, { ...r, n: 1 });
    }
  }
  return vues;
}

(async () => {
  const vues = await releve();
  const acceptes = fs.existsSync(ACCEPTES) ? JSON.parse(fs.readFileSync(ACCEPTES, "utf8")) : {};

  if (process.argv.includes("--resserre")) {
    const etat = {};
    for (const [k, r] of [...vues].sort(([a], [b]) => a.localeCompare(b))) etat[k] = r.n;
    fs.writeFileSync(ACCEPTES, JSON.stringify(etat, null, 1) + "\n");
    console.log("Référence resserrée : " + vues.size + " écritures inscrites dans outils/controles/html-acceptes.json.");
    return;
  }

  const nouvelles = [...vues.values()].filter((r) => r.n > (acceptes[cleDe(r)] || 0));
  const parties = Object.keys(acceptes).filter((k) => !vues.has(k) || vues.get(k).n < acceptes[k]);
  if (nouvelles.length) {
    console.error("Du HTML écrit avec un morceau qu'on ne sait pas prouver sûr :\n  " +
      nouvelles.map((r) => `outils/gabarit/modules/${r.module}:${r.ligne} — ${r.message}`).join("\n  "));
    process.exit(1);
  }
  const total = Object.values(acceptes).reduce((s, n) => s + n, 0);
  console.log("HTML : rien de nouveau à prouver (" + total + " écritures dans la référence figée)." +
    (parties.length ? "\n" + parties.length + " ont disparu : `npm run html -- --resserre` resserre la référence." : ""));
})().catch((e) => { console.error(e.message); process.exit(1); });
