/**
 * Le contrôle des injections de dépendance et des boucles d'imports :
 * `npm run injections`.
 *
 * Le code des pages s'était couplé parce que chaque morceau pouvait appeler
 * tous les autres sans le dire. Les modules l'ont défait, à deux conditions
 * que rien ne gardait jusqu'ici :
 *
 * - **le graphe des imports reste sans boucle.** esbuild en accepte une sans
 *   rien dire, et l'ordre de chargement devient alors celui du hasard des
 *   imports : un module lit une valeur que l'autre n'a pas encore posée ;
 * - **une injection ne s'ajoute pas sans raison.** Une injection —
 *   `injecte…`, par laquelle un module reçoit au chargement une fonction qu'il
 *   ne peut importer (une inversion de dépendance) — est le moyen sûr de
 *   contourner une boucle, et le plus facile : c'est par elles que le code se
 *   recouplerait. Il y en eut trente-huit ; il en reste celles de
 *   `outils/controles/injections-acceptees.json`, chacune avec son genre et sa
 *   raison.
 *
 * C'est une référence figée (*baseline*), comme celle des types : une
 * injection absente de la liste fait échouer, une injection de la liste qui
 * n'existe plus aussi — la retirer de la liste resserre la référence derrière
 * elle. Avant d'en ajouter une, cherchez le module neutre qui défait la boucle
 * (`CLAUDE.md`, « Les modules »).
 *
 * Une injection se reconnaît à son nom, `injecte…`, exporté : c'est la
 * convention du dépôt, et ce qui la rend cherchable. Un **événement**
 * (`evenement.mjs` `creeEvenement`) n'en est pas une : le module qui l'exporte
 * émet un fait sans savoir qui l'écoute, plutôt que d'appeler une fonction
 * qu'on lui injecte. Ils sont comptés à part, sans liste à tenir. Les
 * registres où plusieurs modules s'inscrivent (`inscritMode`,
 * `inscritTiroirExclusif`, `suitLeParcours`) portent un autre nom parce qu'ils
 * sont une autre chose : une règle commune, non une fonction qu'un seul module
 * injecte dans un seul autre.
 */
const fs = require("fs");
const path = require("path");
const acorn = require("acorn");

const DOSSIER = path.join(__dirname, "..", "gabarit", "modules");
const ACCEPTEES = path.join(__dirname, "injections-acceptees.json");
const GENRES = ["partition", "rendu", "registre"];

/** Les imports et les injections d'un module, lus par acorn plutôt que par une
 *  expression : un import cité dans un commentaire ne compte pas. */
function lis(fichier){
  const source = fs.readFileSync(path.join(DOSSIER, fichier), "utf8");
  const arbre = acorn.parse(source, { ecmaVersion: "latest", sourceType: "module", locations: true });
  const imports = [], injections = [], evenements = [];
  for (const n of arbre.body){
    const src = n.source && n.source.value;
    if (src && src.startsWith("./")) imports.push(src.slice(2));
    if (n.type !== "ExportNamedDeclaration" || !n.declaration) continue;
    const d = n.declaration;
    const noms = d.type === "FunctionDeclaration" ? [d.id.name]
      : d.type === "VariableDeclaration" ? d.declarations.map(v => v.id.name).filter(Boolean)
      : [];
    noms.filter(nom => /^injecte[A-Z]/.test(nom))
      .forEach(nom => injections.push({ nom, ligne: n.loc.start.line }));
    if (d.type === "VariableDeclaration")
      d.declarations.filter(v => v.init && v.init.type === "CallExpression" &&
          v.init.callee.name === "creeEvenement")
        .forEach(v => evenements.push(v.id.name));
  }
  return { imports, injections, evenements };
}

const fichiers = fs.readdirSync(DOSSIER).filter(f => f.endsWith(".mjs")).sort();
const lu = new Map(fichiers.map(f => [f, lis(f)]));
const fautes = [];

/* ------------------------------------------------------------
   Les boucles
   ------------------------------------------------------------ */
/* Un parcours en profondeur, qui garde le chemin : une boucle se nomme par
   les modules qu'elle traverse, sans quoi on ne saurait où la couper. Chaque
   boucle n'est dite qu'une fois, depuis le premier module rencontré. */
const etat = new Map(), vues = new Set();
function parcours(f, chemin){
  etat.set(f, "en cours");
  chemin.push(f);
  for (const g of (lu.get(f) || { imports: [] }).imports){
    if (!lu.has(g)) continue;
    if (etat.get(g) === "en cours"){
      const boucle = chemin.slice(chemin.indexOf(g)).concat(g);
      const cle = boucle.slice(0, -1).slice().sort().join(" ");
      if (!vues.has(cle)){
        vues.add(cle);
        fautes.push("boucle d'imports : " + boucle.join(" → "));
      }
    } else if (!etat.has(g)) parcours(g, chemin);
  }
  chemin.pop();
  etat.set(f, "fait");
}
fichiers.forEach(f => { if (!etat.has(f)) parcours(f, []); });

/* ------------------------------------------------------------
   Les injections
   ------------------------------------------------------------ */
const acceptees = JSON.parse(fs.readFileSync(ACCEPTEES, "utf8"));
const trouvees = new Map();
for (const [f, { injections }] of lu)
  injections.forEach(p => trouvees.set(p.nom, { module: f, ligne: p.ligne }));

for (const [nom, ou] of trouvees){
  const a = acceptees[nom];
  if (!a){
    fautes.push(`injection nouvelle : ${nom} (modules/${ou.module}:${ou.ligne}) — ` +
      "défaites la boucle par un module neutre, ou inscrivez-la avec son genre et sa raison " +
      "dans outils/controles/injections-acceptees.json");
  } else if (a.module !== ou.module){
    fautes.push(`injection déplacée : ${nom} est dans modules/${ou.module}, la liste la dit dans ${a.module}`);
  }
}
for (const [nom, a] of Object.entries(acceptees)){
  if (!trouvees.has(nom))
    fautes.push(`injection disparue : ${nom} n'existe plus — retirez-la de outils/controles/injections-acceptees.json`);
  if (!GENRES.includes(a.genre))
    fautes.push(`injection ${nom} : genre « ${a.genre} » inconnu (${GENRES.join(", ")})`);
  if (!a.raison || !String(a.raison).trim())
    fautes.push(`injection ${nom} : sans raison`);
}

if (fautes.length){
  console.error("Injections et imports :\n  " + fautes.join("\n  "));
  process.exit(1);
}
const parGenre = GENRES.map(g => Object.values(acceptees).filter(a => a.genre === g).length + " " + g)
  .join(", ");
/* Les événements ne sont pas une référence figée : un module public en crée un
   quand il a un fait à dire, sans qu'on ait à le justifier. Ils sont seulement
   dits, pour rester visibles — un événement que plus personne n'écoute se voit
   ici avant de se perdre. */
const evenements = [...lu].flatMap(([f, { evenements }]) => evenements.map(a => `${a} (${f})`));
console.log(`Injections : ${trouvees.size} (${parGenre}), aucune boucle d'imports entre ${fichiers.length} modules.`);
console.log(`Événements : ${evenements.length} — ${evenements.join(", ")}.`);
