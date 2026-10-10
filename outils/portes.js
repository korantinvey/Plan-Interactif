/**
 * Le contrôle des portes et des boucles d'imports : `npm run portes`.
 *
 * Le code des pages s'était soudé parce que chaque morceau pouvait appeler
 * tous les autres sans le dire. Les modules l'ont défait, à deux conditions
 * que rien ne gardait jusqu'ici :
 *
 * - **le graphe des imports reste sans boucle.** esbuild en accepte une sans
 *   rien dire, et l'ordre de chargement devient alors celui du hasard des
 *   imports : un module lit une valeur que l'autre n'a pas encore posée ;
 * - **une porte ne s'ouvre pas sans raison.** Une porte — `confie…`, par
 *   laquelle un module en reçoit au chargement une fonction qu'il ne peut
 *   importer — est le moyen sûr de contourner une boucle, et le plus facile :
 *   c'est par elles que le code se ressouderait. Il y en eut trente-huit ;
 *   il en reste celles de `outils/portes-acceptees.json`, chacune avec son
 *   genre et sa raison.
 *
 * C'est un cliquet, comme celui des types : une porte absente de la liste
 * fait échouer, une porte de la liste qui n'existe plus aussi — la retirer de
 * la liste ferme le cliquet derrière elle. Avant d'en ajouter une, cherchez
 * le module neutre qui défait la boucle (`CLAUDE.md`, « Les modules »).
 *
 * Une porte se reconnaît à son nom, `confie…`, exporté : c'est la convention
 * du dépôt, et ce qui la rend cherchable. Les registres où plusieurs modules
 * s'inscrivent (`inscritMode`, `inscritTiroirExclusif`, `suitLeParcours`)
 * portent un autre nom parce qu'ils sont une autre chose : une règle commune,
 * non une fonction qu'un seul module prête à un seul autre.
 */
const fs = require("fs");
const path = require("path");
const acorn = require("acorn");

const DOSSIER = path.join(__dirname, "gabarit", "modules");
const ACCEPTEES = path.join(__dirname, "portes-acceptees.json");
const GENRES = ["partition", "rendu", "registre", "administration"];

/** Les imports et les portes d'un module, lus par acorn plutôt que par une
 *  expression : un import cité dans un commentaire ne compte pas. */
function lis(fichier){
  const source = fs.readFileSync(path.join(DOSSIER, fichier), "utf8");
  const arbre = acorn.parse(source, { ecmaVersion: "latest", sourceType: "module", locations: true });
  const imports = [], portes = [];
  for (const n of arbre.body){
    const src = n.source && n.source.value;
    if (src && src.startsWith("./")) imports.push(src.slice(2));
    if (n.type !== "ExportNamedDeclaration" || !n.declaration) continue;
    const d = n.declaration;
    const noms = d.type === "FunctionDeclaration" ? [d.id.name]
      : d.type === "VariableDeclaration" ? d.declarations.map(v => v.id.name).filter(Boolean)
      : [];
    noms.filter(nom => /^confie[A-Z]/.test(nom))
      .forEach(nom => portes.push({ nom, ligne: n.loc.start.line }));
  }
  return { imports, portes };
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
   Les portes
   ------------------------------------------------------------ */
const acceptees = JSON.parse(fs.readFileSync(ACCEPTEES, "utf8"));
const trouvees = new Map();
for (const [f, { portes }] of lu)
  portes.forEach(p => trouvees.set(p.nom, { module: f, ligne: p.ligne }));

for (const [nom, ou] of trouvees){
  const a = acceptees[nom];
  if (!a){
    fautes.push(`porte nouvelle : ${nom} (modules/${ou.module}:${ou.ligne}) — ` +
      "défaites la boucle par un module neutre, ou inscrivez-la avec son genre et sa raison " +
      "dans outils/portes-acceptees.json");
  } else if (a.module !== ou.module){
    fautes.push(`porte déplacée : ${nom} est dans modules/${ou.module}, la liste la dit dans ${a.module}`);
  }
}
for (const [nom, a] of Object.entries(acceptees)){
  if (!trouvees.has(nom))
    fautes.push(`porte disparue : ${nom} n'existe plus — retirez-la de outils/portes-acceptees.json`);
  if (!GENRES.includes(a.genre))
    fautes.push(`porte ${nom} : genre « ${a.genre} » inconnu (${GENRES.join(", ")})`);
  if (!a.raison || !String(a.raison).trim())
    fautes.push(`porte ${nom} : sans raison`);
}

if (fautes.length){
  console.error("Portes et imports :\n  " + fautes.join("\n  "));
  process.exit(1);
}
const parGenre = GENRES.map(g => Object.values(acceptees).filter(a => a.genre === g).length + " " + g)
  .join(", ");
console.log(`Portes : ${trouvees.size} (${parGenre}), aucune boucle d'imports entre ${fichiers.length} modules.`);
