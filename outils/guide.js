/**
 * Le guide (`CLAUDE.md`) ne cite que ce qui existe.
 *
 * Il nommait, en prose, pour chaque intention, les modules, leurs fonctions et
 * qui les importait — et près d'un commit sur deux le retouchait, sans que rien
 * dise quand il avait cessé d'être vrai : un module renommé y restait sous son
 * ancien nom, une fonction déplacée y gardait sa vieille adresse. La carte
 * (`CARTE.md`) dit désormais où sont les choses ; ce guide n'en cite plus que
 * l'entrée. Ce qu'il cite, on le vérifie ici :
 *
 *   — tout chemin entre accents graves (`modules/fiche.mjs`, `outils/pwa.js`,
 *     `supabase/functions/rappels/`) doit exister, cherché depuis la racine,
 *     `outils/gabarit/`, `outils/`, `supabase/functions/` et `web/` ; un nom
 *     écrit avec `<…>` est un modèle, et n'est pas cherché ;
 *   — tout nom qui suit un fichier sur la même ligne, jusqu'au fichier suivant
 *     (`modules/fiche.mjs` (`select`, `ouvre`)), doit y figurer.
 *
 * Les clés de configuration, les sélecteurs et le reste qui n'a pas la forme
 * d'un identifiant ne sont pas contrôlés.
 *
 *   node outils/guide.js     (`npm run guide`, lancé par `npm run verifie`)
 */
const fs = require("fs");
const path = require("path");

const RACINE = path.join(__dirname, "..");
const GUIDE = path.join(RACINE, "CLAUDE.md");
const BASES = ["", "outils/gabarit", "outils", "supabase/functions", "web"].map((b) => path.join(RACINE, b));

/* Un chemin : au moins un segment suivi d'une extension connue, ou un dossier
   terminé par une barre. Un nom nu sans barre (`plan.mjs`) est un fichier de
   module par convention, cherché sous `modules/`. */
const EXTENSIONS = /\.(mjs|js|ts|json|jsonc|css|html|md|yml|sql)$/;
const estChemin = (t) => !/\s|[*<>{}]/.test(t) && (EXTENSIONS.test(t) || /^[\w.-]+(\/[\w.-]+)*\/$/.test(t));
const IDENTIFIANT = /^[A-Za-z_$][\w$]*$/;

/* Ce que la construction fabrique : cité pour dire de ne pas y toucher, il
   n'existe pas forcément sur un clone neuf. */
const FABRIQUES = new Set(["src/pages.mjs", "outils/tpl-multi.html", "web/config.js", "web/sw.js",
  "web/console.css", "web/plan-smcl.html", "plan.html", "plan-admin.html", "plan-smcl.html"]);

function trouve(t) {
  if (FABRIQUES.has(t)) return "fabriqué";
  const candidats = [];
  for (const b of BASES) candidats.push(path.join(b, t));
  if (!t.includes("/")) {
    candidats.push(path.join(RACINE, "outils/gabarit/modules", t));
    candidats.push(path.join(RACINE, "outils/essais", t));
    candidats.push(path.join(RACINE, "outils/essais/navigateur", t));
    candidats.push(path.join(RACINE, "outils/anglais", t));
    candidats.push(path.join(RACINE, ".github/workflows", t));
    candidats.push(path.join(RACINE, "src", t));
  }
  return candidats.find((c) => fs.existsSync(c)) || null;
}

const lignes = fs.readFileSync(GUIDE, "utf8").split("\n");
const fautes = [];
let dansCode = false;
lignes.forEach((ligne, i) => {
  if (ligne.startsWith("```")) { dansCode = !dansCode; return; }
  if (dansCode) return;
  let fichier = null;
  for (const [, t] of ligne.matchAll(/`([^`]+)`/g)) {
    if (estChemin(t)) {
      const ou = trouve(t);
      if (!ou) fautes.push(`CLAUDE.md:${i + 1} — \`${t}\` n'existe pas`);
      fichier = ou && ou !== "fabriqué" && fs.statSync(ou).isFile() ? ou : null;
      continue;
    }
    if (fichier && IDENTIFIANT.test(t)) {
      const texte = fs.readFileSync(fichier, "utf8");
      if (!new RegExp("\\b" + t.replace(/\$/g, "\\$") + "\\b").test(texte)) {
        fautes.push(`CLAUDE.md:${i + 1} — \`${t}\` introuvable dans ${path.relative(RACINE, fichier)}`);
      }
    }
  }
});

if (fautes.length) {
  console.error("Le guide cite ce qui n'existe plus :\n  " + fautes.join("\n  "));
  process.exit(1);
}
console.log("Guide : tout ce qu'il cite existe.");
