/**
 * Rejoue toutes les migrations sur une base neuve, avant qu'elles partent en
 * production.
 *
 * Une poussée sur `main` applique les migrations directement à la base de
 * production (`supabase.yml`) : rien ne les exécutait avant. Une faute de SQL,
 * une fonction qui en casse une autre ou un horodatage devenu antérieur à la
 * dernière migration de `main` ne se découvraient qu'au déploiement, quand la
 * migration fautive ne peut plus être réécrite.
 *
 * Trois contrôles, dans l'ordre :
 *   1. l'ordre — une migration de la branche doit être postérieure à la
 *      dernière de `main`, sans quoi `supabase db push` la refusera ;
 *   2. le rejeu — un Postgres Supabase jetable, dans Docker, reçoit les
 *      extensions que la production tient du tableau de bord, puis toutes les
 *      migrations depuis zéro ;
 *   3. le lint — `supabase db lint` relève les fonctions SQL qui citent une
 *      table, une colonne ou une fonction absente.
 *
 *   npm run migrations            les trois
 *   npm run migrations -- ordre   le premier seul, sans Docker
 *
 * La base est arrêtée à la fin, qu'on ait réussi ou non : rien ne reste.
 */
const { execSync, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const RACINE = path.join(__dirname, "..");
const MIGRATIONS = path.join(RACINE, "supabase", "migrations");
const BASE = process.env.BASE_MIGRATIONS || "origin/main";

/* Les extensions que la production a reçues du tableau de bord et qu'aucune
   migration ne sait créer. `pg_net` est la seule : Supabase refuse de la
   créer depuis un bloc `do $$ … $$` pris dans une transaction — le cas de
   toute migration —, et le bloc qui tentait de le faire avalait le refus
   (`le_rappel_avant_une_conference`). En production, elle a donc été activée
   à la main, ce que la migration suivante exige d'ailleurs.

   Une extension ajoutée à la production par le tableau de bord doit l'être
   ici aussi : sans quoi le rejeu ne ressemble plus à ce qu'il protège. */
const EXTENSIONS_DU_TABLEAU_DE_BORD = ["pg_net"];

const sh = (cmd, opts = {}) =>
  execSync(cmd, { cwd: RACINE, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], ...opts }).trim();

function supabase(args, { muet = false } = {}){
  const r = spawnSync("npx", ["--no-install", "supabase", ...args],
    { cwd: RACINE, encoding: "utf8", stdio: muet ? "pipe" : "inherit" });
  if (r.status !== 0){
    /* La migration fautive puis son erreur, en dernier : la liste des
       migrations déjà passées la noyait. */
    if (muet){
      const lignes = (r.stderr || "").split("\n").filter(l => l.trim());
      const derniere = lignes.filter(l => l.startsWith("Applying migration")).at(-1);
      const reste = lignes.filter(l => !l.startsWith("Applying migration"));
      process.stderr.write([...reste, derniere, r.stdout || ""].filter(Boolean).join("\n") + "\n");
    }
    throw new Error("supabase " + args.join(" ") + " a échoué.");
  }
  return r.stdout || "";
}

/* ------------------------------------------------------------ 1. l'ordre */

const horodatage = f => (f.match(/^(\d{14})_/) || [])[1];

function ordre(){
  let surBase;
  try {
    surBase = sh(`git ls-tree --name-only ${BASE} supabase/migrations/`)
      .split("\n").map(l => path.basename(l)).filter(horodatage);
  } catch (e) {
    console.log(`Ordre : ${BASE} introuvable, contrôle sauté (git fetch origin main).`);
    return true;
  }
  const derniere = surBase.sort().at(-1);
  const connues = new Set(surBase);
  const nouvelles = fs.readdirSync(MIGRATIONS).filter(f => f.endsWith(".sql") && !connues.has(f));

  const sansDate = nouvelles.filter(f => !horodatage(f));
  const enRetard = nouvelles.filter(f => horodatage(f) && f <= derniere);

  if (!nouvelles.length){
    console.log(`Ordre : aucune migration nouvelle par rapport à ${BASE}.`);
    return true;
  }
  if (!sansDate.length && !enRetard.length){
    console.log(`Ordre : ${nouvelles.length} migration(s) nouvelle(s), toutes après ${derniere}.`);
    return true;
  }
  for (const f of sansDate)
    console.error(`✗ ${f} ne commence pas par un horodatage AAAAMMJJHHMMSS_ (npm run migration -- "Titre").`);
  if (enRetard.length){
    /* La date proposée est celle d'aujourd'hui : sans risque tant que la
       migration n'a jamais été appliquée, ce qui est le cas de toute
       migration absente de `main`. */
    const maintenant = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
    console.error(`✗ La dernière migration de ${BASE} est ${derniere}.`);
    console.error(`  Celles-ci lui sont antérieures, et \`supabase db push\` les refuserait après la fusion :`);
    enRetard.forEach((f, i) => {
      const neuve = String(BigInt(maintenant) + BigInt(i)) + f.slice(14);
      console.error(`    git mv supabase/migrations/${f} supabase/migrations/${neuve}`);
    });
  }
  return false;
}

/* ------------------------------------------------------------ 2. le rejeu */

const conteneur = () => {
  const id = fs.readFileSync(path.join(RACINE, "supabase", "config.toml"), "utf8")
    .match(/^project_id\s*=\s*"([^"]+)"/m)[1];
  return "supabase_db_" + id;
};

function psql(sql){
  const r = spawnSync("docker", ["exec", "-i", conteneur(), "psql",
    "postgresql://postgres:postgres@127.0.0.1:5432/postgres", "-v", "ON_ERROR_STOP=1", "-q"],
    { input: sql, encoding: "utf8" });
  if (r.status !== 0) throw new Error("psql : " + (r.stderr || r.stdout));
}

function rejeu(){
  /* `supabase db start` applique les migrations qu'il trouve, avant qu'on ait
     pu poser les extensions. On le démarre donc sur un dossier vide, puis on
     rend les migrations et on les applique nous-mêmes. */
  const cache = MIGRATIONS + ".rejeu";
  fs.renameSync(MIGRATIONS, cache);
  try {
    fs.mkdirSync(MIGRATIONS);
    supabase(["db", "start"], { muet: true });
  } finally {
    fs.rmSync(MIGRATIONS, { recursive: true, force: true });
    fs.renameSync(cache, MIGRATIONS);
  }
  psql(EXTENSIONS_DU_TABLEAU_DE_BORD.map(e => `create extension if not exists ${e};`).join("\n"));
  const n = fs.readdirSync(MIGRATIONS).filter(f => f.endsWith(".sql")).length;
  console.log(`Rejeu : ${n} migrations sur une base neuve…`);
  supabase(["migration", "up", "--local"], { muet: true });
  console.log(`Rejeu : les ${n} migrations passent.`);
}

/* ------------------------------------------------------------ 3. le lint */

function lint(){
  /* Au niveau « error » : les avertissements relèvent des variables jamais
     lues et autres détails, et bloquer là-dessus ferait taire le contrôle. */
  supabase(["db", "lint", "--local", "--level", "error", "--fail-on", "error"]);
  console.log("Lint : aucune erreur de schéma.");
}

/* ------------------------------------------------------------ l'ensemble */

const seul = process.argv[2];
if (seul && seul !== "ordre"){
  console.error(`Inconnu : « ${seul} ». Rien, ou « ordre ».`);
  process.exit(2);
}

let ok = ordre();
if (seul === "ordre") process.exit(ok ? 0 : 1);

try {
  rejeu();
  lint();
} catch (e) {
  console.error("✗ " + e.message);
  ok = false;
} finally {
  try { supabase(["stop", "--no-backup"], { muet: true }); } catch (e) {}
}
process.exit(ok ? 0 : 1);
