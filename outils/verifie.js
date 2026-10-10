/**
 * Le geste d'avant-validation : reconstruire, puis tout contrôler.
 *
 * Les pages de `web/` ne sont plus versionnées — Cloudflare les construit au
 * déploiement —, il n'y a donc plus de pages en retard à craindre. Reste
 * `CARTE.md`, l'index des sources, qui l'est toujours : on le lit sans rien
 * construire, et un index en retard envoie chercher au mauvais endroit, ce
 * qui est pire que pas d'index. Ce script demande donc à git s'il a bougé.
 *
 * La construction faite, la syntaxe des pages est contrôlée ici plutôt qu'en
 * intégration seulement : c'est ce script que le dépôt désigne comme le geste
 * d'avant-validation, et un défaut qui n'apparaît qu'après la poussée est
 * trouvé trop tard.
 *
 *   node outils/verifie.js
 */
const { execFileSync } = require("child_process");
const path = require("path");

const racine = path.join(__dirname, "..");
const noeud = process.execPath;

const lance = (script) =>
  execFileSync(noeud, [path.join(__dirname, script)], { cwd: racine, stdio: "pipe" });

try {
  lance("assemble.js");
  lance("genere.js");
  lance("carte.js");
} catch (e) {
  console.error("La construction a échoué :\n" + (e.stdout || "").toString() +
    (e.stderr || e.message).toString());
  process.exit(1);
}

try {
  lance("controle.js");
} catch (e) {
  console.error((e.stdout || "").toString() + (e.stderr || e.message).toString());
  process.exit(1);
}

/* La version anglaise se contrôle au même geste : une phrase affichée sans sa
   traduction resterait en français sous les yeux de qui a demandé l'anglais,
   et rien d'autre ne le verrait. */
try {
  lance("traductions.js");
} catch (e) {
  console.error((e.stdout || "").toString() + (e.stderr || e.message).toString());
  process.exit(1);
}

/* La relecture par ESLint, puis le cliquet des types : ce qu'un développeur
   attend d'un dépôt, et ce qui voit une variable morte, un nom que rien ne
   déclare ou un appel faux là où la syntaxe ne regarde pas. */
for (const script of ["relecture.js", "types.js"]) {
  try {
    lance(script);
  } catch (e) {
    console.error((e.stdout || "").toString() + (e.stderr || e.message).toString());
    process.exit(1);
  }
}

let bouge = "";
try {
  bouge = execFileSync("git", ["status", "--porcelain", "CARTE.md"],
    { cwd: racine })
    .toString().trim();
} catch (e) {
  console.log("Construction faite. (git indisponible : comparaison impossible)");
  process.exit(0);
}

if (!bouge) {
  console.log("Tout est en ordre : pages construites et contrôlées, `CARTE.md` à jour.");
  process.exit(0);
}

console.error("`CARTE.md` était en retard sur ses sources :\n");
console.error(bouge);
console.error("\nIl vient d'être refait. Relisez le diff, puis validez-le.");
process.exit(1);
