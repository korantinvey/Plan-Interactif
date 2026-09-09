/**
 * Les pages de `web/` sont fabriquées à partir de `gabarit/` puis versionnées :
 * c'est ce qui permet à Cloudflare de les servir sans étape de construction.
 * Le revers est qu'on peut modifier un module et oublier de reconstruire — le
 * dépôt paraît juste, et les visiteurs reçoivent l'ancienne page.
 *
 * Ce script reconstruit puis demande à git si quelque chose a bougé. Si oui,
 * c'est que les pages versionnées étaient en retard sur leurs sources. La même
 * vérification vaut pour `CARTE.md`, l'index des sources : un index en retard
 * envoie chercher au mauvais endroit, ce qui est pire que pas d'index.
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
  console.error("La construction a échoué :\n" + (e.stdout || e.message).toString());
  process.exit(1);
}

let bouge = "";
try {
  bouge = execFileSync("git", ["status", "--porcelain", "web", "CARTE.md"], { cwd: racine })
    .toString().trim();
} catch (e) {
  console.log("Construction faite. (git indisponible : comparaison impossible)");
  process.exit(0);
}

if (!bouge) {
  console.log("Pages à jour : `web/` et `CARTE.md` correspondent bien à `outils/gabarit/`.");
  process.exit(0);
}

console.error("Les pages versionnées étaient en retard sur leurs sources :\n");
console.error(bouge);
console.error("\nElles viennent d'être reconstruites. Relisez le diff, puis validez-le.");
process.exit(1);
