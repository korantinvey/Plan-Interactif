/**
 * Le cliquet du code soudé : `npm run soude`.
 *
 * Le code des pages sort du code soudé vers de vrais modules, un domaine après
 * l'autre (`CLAUDE.md`, « Les modules, et le code soudé »). Ce mouvement ne
 * tient que si rien ne repart dans l'autre sens : une fonction neuve écrite
 * dans un `_*.html` est une fonction de plus à sortir un jour, et la plus
 * commode à écrire là, puisqu'elle y appelle tout sans rien importer. La règle
 * se disait ; elle se contrôle ici.
 *
 * Les fonctions de premier niveau du code soudé — même relevé que
 * `carte.js` `fonctions` — sont inscrites dans `outils/soude-acceptes.json`.
 * Un nom absent de ce stock fait échouer : on écrit la fonction dans un module
 * de `outils/gabarit/modules/`, et on l'expose au code soudé s'il l'appelle.
 * Le stock ne fait que baisser : un nom qui a quitté le code soudé en est
 * retiré au passage, et le fichier est à valider avec le reste.
 *
 * Une seule sorte de fonction neuve y reste permise : `brancheXxx`, la
 * fonction de branchement par laquelle le code soudé confie à un module ce que
 * celui-ci ne peut pas importer. Elle naît justement d'une sortie.
 *
 * Le nom compte, pas le fichier : une fonction déplacée d'un morceau soudé à un
 * autre n'ajoute rien. Une exception vraiment nécessaire s'inscrit à la main
 * dans le stock — elle se voit alors dans le diff, et se discute en revue.
 *
 *   node outils/soude.js
 */
const fs = require("fs");
const path = require("path");

const GABARIT = path.join(__dirname, "gabarit");
const ACCEPTES = path.join(__dirname, "soude-acceptes.json");

const PERMISES = /^branche[A-Z]/;

/* Le code soudé : les morceaux `.html` du gabarit. `_sw.js`, `_langue.js` et
   `_config.js` sont des scripts à part, chargés seuls, que rien ne soude. */
const MORCEAUX = fs.readdirSync(GABARIT).filter((f) => f.endsWith(".html")).sort();

/** Les fonctions de premier niveau, avec le morceau et la ligne de chacune. */
function releve() {
  const vus = new Map();
  for (const f of MORCEAUX) {
    const ls = fs.readFileSync(path.join(GABARIT, f), "utf8").split("\n");
    ls.forEach((l, i) => {
      const m =
        /^(?:async\s+)?function\s*\*?\s*([A-Za-z0-9_$]+)/.exec(l) ||
        /^(?:const|let)\s+([A-Za-z0-9_$]+)\s*=\s*(?:async\s*)?(?:function\b|\([^)]*\)\s*=>|[A-Za-z0-9_$]+\s*=>)/.exec(l);
      if (m && !vus.has(m[1])) vus.set(m[1], `outils/gabarit/${f}:${i + 1}`);
    });
  }
  return vus;
}

const vus = releve();

if (!fs.existsSync(ACCEPTES)) {
  fs.writeFileSync(ACCEPTES, JSON.stringify([...vus.keys()].sort(), null, 1) + "\n");
  console.log(`Stock inscrit : ${vus.size} fonctions soudées.`);
  process.exit(0);
}

const stock = new Set(JSON.parse(fs.readFileSync(ACCEPTES, "utf8")));
const neuves = [...vus].filter(([nom]) => !stock.has(nom) && !PERMISES.test(nom));

if (neuves.length) {
  console.error("Fonction neuve dans le code soudé — elle s'écrit dans un module :\n");
  for (const [nom, ou] of neuves) console.error(`  ${nom}  (${ou})`);
  console.error(
    "\nDéplacez-la dans `outils/gabarit/modules/` (export, import dans le point" +
    "\nd'entrée, `Object.assign(globalThis, …)` si le code soudé l'appelle)." +
    "\nCe qu'elle ne peut pas importer lui est confié par une fonction `brancheXxx`."
  );
  process.exit(1);
}

/* Le stock baisse de lui-même : un nom sorti n'a plus à y être, et le laisser
   permettrait de le réécrire au même endroit sans que rien ne le voie. */
const partis = [...stock].filter((nom) => !vus.has(nom));
if (partis.length) {
  const reste = [...stock].filter((nom) => vus.has(nom)).sort();
  fs.writeFileSync(ACCEPTES, JSON.stringify(reste, null, 1) + "\n");
  console.log(
    `Code soudé : ${partis.length} fonction(s) sortie(s) — ${partis.join(", ")}.` +
    `\nLe stock passe à ${reste.length} ; validez \`outils/soude-acceptes.json\`.`
  );
} else {
  console.log(`Code soudé : ${stock.size} fonctions au stock, aucune neuve.`);
}
