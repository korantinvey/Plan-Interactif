/**
 * La relecture du code des pages par ESLint : `npm run lint`.
 *
 * Les modules (`outils/gabarit/modules/`) et les outils se relisent par la
 * voie ordinaire, `eslint.config.js`, que ce script lance d'abord. Restent les
 * scripts que chaque page porte hors des modules — la configuration et le
 * moteur de langue, posés en tête, et ce qu'un balisage garderait en ligne.
 * Ceux-là ne se relisent que tels que la page les assemble : `genere.js`
 * `epure` retire les commentaires de la page servie, directives de relecture
 * comprises, et ses lignes ne sont plus celles qu'on édite.
 *
 * On relit donc chaque page à partir des sources : les fichiers mis bout à
 * bout dans l'ordre de la construction, le balisage effacé — remplacé par des
 * blancs, lignes conservées —, les scripts gardés à leur place. Une remarque
 * tombe ainsi sur une ligne que l'on sait ramener au fichier qui la porte.
 */
const fs = require("fs");
const path = require("path");
const { ESLint, Linter } = require("eslint");
const { BOUTS, lisBout } = require("./assemble.js");
const { REGLES, GLOBALES_PAGE } = require("../eslint.config.js");
const globals = require("globals");

const RACINE = path.join(__dirname, "..");
const G = path.join(__dirname, "gabarit");
const lis = (f) => fs.readFileSync(path.join(G, f), "utf8");

/* Chaque page, telle que `genere.js` la compose : la configuration et le
   moteur de langue en tête, puis son balisage. `js` marque un fichier qui
   n'est que du script ; les autres sont du balisage où des scripts se logent.
   Le script des modules n'y est pas : relu comme module, il est posé par la
   construction après tout le reste. */
const js = (f) => ({ fichier: f, js: true, texte: lis(f) });
const html = (f, texte = lis(f)) => ({ fichier: f, js: false, texte });
const TETE = [js("_config.js"), js("_langue.js")];

const PAGES = {
  /* Le plan public, sa démonstration et l'administration ont le même
     balisage ; les tranches `@admin` n'y retirent que du balisage. */
  "plan.html": [...TETE, ...BOUTS.map((b) => html(b, lisBout(b)))],
  "admin-plans.html": [...TETE, html("_console-head.html"), html("_console-base.html")],
  "rapport.html": [...TETE, html("_rapport-head.html"), html("_console-base.html")],
  "index.html": [...TETE, html("_index.html")],
  "motdepasse.html": [...TETE, html("_motdepasse.html")],
  "hors-ligne.html": [...TETE, html("_hors-ligne.html")],
};

/**
 * Le texte qu'ESLint relira, et la table qui ramène chacune de ses lignes à
 * un fichier. Le balisage devient des blancs ; chaque fin de script, un `;` :
 * deux scripts ne doivent pas se souder en une instruction que la page,
 * elle, n'exécute jamais d'un seul tenant.
 */
function compose(morceaux) {
  let texte = "";
  const table = [];  // [première ligne, fichier], dans l'ordre
  let ligne = 1;
  let dansScript = false;
  for (const m of morceaux) {
    table.push([ligne, m.fichier]);
    let t = m.texte;
    if (m.js) {
      if (dansScript) throw new Error(m.fichier + " : un script est déjà ouvert");
      t += "\n;";
    } else {
      // le balisage s'efface caractère par caractère, ses scripts restent
      let sortie = "";
      let i = 0;
      while (i < t.length) {
        if (!dansScript) {
          const m2 = /<script\b([^>]*)>/gi;
          m2.lastIndex = i;
          const ouv = m2.exec(t);
          const fin = ouv ? ouv.index + ouv[0].length : t.length;
          sortie += t.slice(i, fin).replace(/[^\n]/g, " ");
          i = fin;
          if (!ouv) break;
          // données ou fichier à part : pas du code de la page
          if (/\bsrc=|application\/json/.test(ouv[1])) {
            const f = t.indexOf("</script>", i);
            const bout = f < 0 ? t.length : f + 9;
            sortie += t.slice(i, bout).replace(/[^\n]/g, " ");
            i = bout;
          } else dansScript = true;
        } else {
          const f = t.indexOf("</script>", i);
          if (f < 0) { sortie += t.slice(i); break; }
          sortie += t.slice(i, f) + ";" + " ".repeat(8);
          i = f + 9;
          dansScript = false;
        }
      }
      t = sortie;
    }
    texte += t + "\n";
    ligne += t.split("\n").length;
  }
  return { texte, table };
}

function origine(table, ligne) {
  let i = table.length - 1;
  while (i > 0 && table[i][0] > ligne) i--;
  return { fichier: table[i][1], ligne: ligne - table[i][0] + 1 };
}

async function relitLesOutils() {
  const eslint = new ESLint({ cwd: RACINE });
  const resultats = await eslint.lintFiles(["."]);
  const forme = await eslint.loadFormatter("stylish");
  const texte = await forme.format(resultats);
  return { fautes: resultats.reduce((n, r) => n + r.errorCount, 0), texte };
}

function relitLesPages() {
  const linter = new Linter();
  const vues = new Map();
  /* Un fichier partagé — le moteur de langue — n'est relu qu'une fois, mais
     pas jugé n'importe où : ce qui est inutilisé ou inconnu ne l'est que si
     toutes les pages qui le portent le disent. */
  const pagesDe = new Map();
  for (const [page, morceaux] of Object.entries(PAGES))
    for (const m of morceaux) pagesDe.set(m.fichier, (pagesDe.get(m.fichier) || new Set()).add(page));
  for (const [page, morceaux] of Object.entries(PAGES)) {
    const { texte, table } = compose(morceaux);
    const remarques = linter.verify(texte, [{
      languageOptions: {
        ecmaVersion: "latest",
        sourceType: "script",
        globals: { ...globals.browser, ...GLOBALES_PAGE },
      },
      linterOptions: { reportUnusedDisableDirectives: "error" },
      rules: REGLES,
    }]);
    for (const r of remarques) {
      const o = r.line ? origine(table, r.line) : { fichier: page, ligne: 0 };
      // un fichier partagé par plusieurs pages n'est signalé qu'une fois
      const cle = o.fichier + ":" + o.ligne + ":" + r.ruleId + ":" + r.message;
      if (!vues.has(cle)) vues.set(cle, { ...o, colonne: r.column, regle: r.ruleId, message: r.message, pages: new Set() });
      vues.get(cle).pages.add(page);
    }
  }
  return [...vues.values()].filter((r) =>
    !["no-unused-vars", "no-undef"].includes(r.regle) || r.pages.size === (pagesDe.get(r.fichier) || new Set()).size
  ).sort((a, b) =>
    a.fichier.localeCompare(b.fichier) || a.ligne - b.ligne);
}

if (require.main === module) {
  (async () => {
    const outils = await relitLesOutils();
    if (outils.texte) process.stdout.write(outils.texte);
    const pages = relitLesPages();
    for (const r of pages) {
      console.log(`outils/gabarit/${r.fichier}:${r.ligne}:${r.colonne}  ${r.message}  (${r.regle})`);
    }
    const total = outils.fautes + pages.length;
    if (total) {
      console.error(`\n${total} remarque(s). Une règle qui se trompe sur une ligne précise se tait par\n` +
        "`// eslint-disable-next-line <règle> -- <pourquoi>` ; une règle qui se trompe partout\n" +
        "se règle dans `eslint.config.js`.");
      process.exit(1);
    }
    console.log("Relecture : les outils et le code de " + Object.keys(PAGES).length + " pages, aucune remarque.");
  })().catch((e) => { console.error(e); process.exit(1); });
}

module.exports = { compose, PAGES };
