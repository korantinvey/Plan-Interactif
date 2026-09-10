/**
 * Crée une migration horodatée à la seconde :
 *
 *     npm run migration -- "Remise à zéro des compteurs"
 *
 * La numérotation par séquence — 000009, puis 000010 — obligeait deux sessions
 * du même jour à deviner le même numéro. Elles le prenaient toutes les deux, et
 * la fusion forçait l'une à renommer son fichier. Ce renommage est plus grave
 * que le conflit qu'il résout : une migration déjà partie sur `main` est
 * appliquée en production sous son ancien nom, et rejouerait sous le nouveau.
 *
 * L'heure de création règle cela sans que personne ait à se coordonner : deux
 * migrations ne naissent pas dans la même seconde. Le format ne change pas pour
 * autant — les migrations en place se lisaient déjà `AAAAMMJJHHMMSS`, avec une
 * heure à zéro faute de mieux.
 */
const fs = require("fs");
const path = require("path");

const titre = process.argv.slice(2).join(" ").trim();
if (!titre) {
  console.error('Usage : npm run migration -- "Titre de la migration"');
  process.exit(1);
}

/**
 * Le nom de fichier reste en ASCII, à l'inverse du reste du dépôt : il voyage
 * jusque dans la table des migrations appliquées et dans les journaux de
 * déploiement, où un accent ne survit pas toujours au transport.
 */
const nom = titre
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "_")
  .replace(/^_+|_+$/g, "");

if (!nom) {
  console.error("Le titre ne laisse aucune lettre une fois translittéré :", titre);
  process.exit(1);
}

/**
 * UTC, et non l'heure locale : l'ordre des migrations est l'ordre dans lequel
 * elles s'appliquent. Deux postes dans deux fuseaux doivent produire des noms
 * qui s'ordonnent comme le temps a réellement passé.
 */
const d = new Date();
const dd = (n) => String(n).padStart(2, "0");
const horodatage = [
  d.getUTCFullYear(),
  dd(d.getUTCMonth() + 1),
  dd(d.getUTCDate()),
  dd(d.getUTCHours()),
  dd(d.getUTCMinutes()),
  dd(d.getUTCSeconds()),
].join("");

const dossier = path.join(__dirname, "..", "supabase", "migrations");
const fichier = path.join(dossier, `${horodatage}_${nom}.sql`);
if (fs.existsSync(fichier)) {
  console.error("Ce fichier existe déjà :", path.basename(fichier));
  process.exit(1);
}

// Le « pourquoi » en tête : c'est la forme qu'ont toutes les migrations en
// place, et la seule chose qu'on regrette de ne pas trouver six mois après.
fs.writeFileSync(fichier, `-- ${titre}\n--\n-- Pourquoi : \n\n`);
console.log("Migration créée :", path.relative(path.join(__dirname, ".."), fichier));
