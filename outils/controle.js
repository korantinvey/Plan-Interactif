/**
 * Contrôle la syntaxe de tout le JavaScript réellement servi.
 *
 * Le filet précédent — `node --check outils/chk.js` — laissait passer deux
 * choses, et chacune couvrait une part du dépôt qu'on croyait tenue.
 *
 * La première : `chk.js` n'est écrit que pour la famille du plan. La console,
 * le rapport et la page de mot de passe, assemblés par `genere.js` et non par
 * `assemble.js`, n'étaient contrôlés par rien — quatre mille lignes, dont le
 * deuxième plus gros module du dépôt.
 *
 * La seconde est plus sournoise. Le script d'une page est un `<script>`
 * classique, donc analysé en mode permissif, où redéclarer une fonction est
 * légal : `function ouvre(){}` deux fois passe sans un mot, la seconde gagne,
 * et tous les appels partent au mauvais endroit. Or les modules sont soudés
 * dans un espace de noms unique où plus de la moitié des noms sont des
 * fonctions — c'est exactement la collision que la concaténation rend
 * possible, et c'était le seul cas que le contrôle ne voyait pas.
 *
 * D'où l'analyse **en module ES** : elle est strictement plus sévère, et une
 * redéclaration y devient une erreur. Elle ne change rien à ce qui est servi —
 * `--check` ne fait qu'analyser, jamais exécuter — et les quatre paquets y
 * passaient déjà le jour où ce contrôle est né.
 *
 * Les pages construites sont lues plutôt que les sources : c'est ce qui part
 * chez le visiteur, et une page ajoutée demain est couverte sans qu'on y pense.
 *
 *   node outils/controle.js
 */
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const RACINE = path.join(__dirname, "..");
const WEB = path.join(RACINE, "web");

/* Un `<script src=…>` est un fichier à part, contrôlé pour lui-même ; un
   `type="application/json"` porte les données figées, pas du code. */
const aIgnorer = (attributs) =>
  /\bsrc=/.test(attributs) || /type\s*=\s*["']?application\/json/.test(attributs);

/** Les scripts en ligne d'une page, dans l'ordre où le navigateur les lit. */
function scriptsDe(html) {
  const trouves = [];
  const re = /<script([^>]*)>([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(html))) {
    if (aIgnorer(m[1] || "") || !m[2].trim()) continue;
    /* La ligne où le script commence dans la page : sans elle, l'erreur
       renvoie à une ligne du fichier extrait, que personne n'édite. */
    trouves.push({ code: m[2], ligne: html.slice(0, m.index).split("\n").length });
  }
  return trouves;
}

if (!fs.existsSync(WEB)) {
  console.error("`web/` est absent : lancez d'abord `npm run construire`.");
  process.exit(1);
}

const pages = fs.readdirSync(WEB).filter((f) => f.endsWith(".html")).sort();
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "controle-"));
let controles = 0;
const fautes = [];

for (const page of pages) {
  const html = fs.readFileSync(path.join(WEB, page), "utf8");
  scriptsDe(html).forEach((s, i) => {
    /* L'extension décide du mode d'analyse : c'est `.mjs` qui obtient la
       sévérité recherchée. */
    const fichier = path.join(temp, page.replace(/\./g, "_") + "-" + i + ".mjs");
    fs.writeFileSync(fichier, s.code);
    try {
      execFileSync(process.execPath, ["--check", fichier], { stdio: "pipe" });
      controles++;
    } catch (e) {
      fautes.push({ page, ligne: s.ligne, dit: (e.stderr || "").toString().trim() });
    }
  });
}

fs.rmSync(temp, { recursive: true, force: true });

if (fautes.length) {
  console.error("Le JavaScript servi ne passe pas l'analyse :\n");
  for (const f of fautes) {
    console.error("web/" + f.page + " — script ouvert ligne " + f.ligne + " :");
    console.error(f.dit.split("\n").slice(0, 8).join("\n") + "\n");
  }
  console.error("Les numéros de ligne ci-dessus comptent depuis le début du");
  console.error("script, pas de la page. Corrigez dans `outils/gabarit/`.");
  process.exit(1);
}

console.log("Syntaxe : " + controles + " scripts contrôlés sur " + pages.length +
            " pages, aucun défaut.");
