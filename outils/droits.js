/**
 * Vérifie que toute table créée par une migration y reçoit ses droits.
 *
 * Depuis le 30 octobre 2026, Supabase n'accorde plus rien de lui-même sur une
 * table neuve de `public` : sans `grant`, l'API de données répond « permission
 * denied », aux fonctions — la clé `service_role` ignore le RLS, pas les
 * droits — comme à la console. Le piège est que la migration, elle, passe sans
 * erreur : on ne découvre le défaut qu'au premier appel, en production.
 *
 * La règle est donc simple : chaque `create table` d'une migration a, dans le
 * même fichier, au moins un `grant … on <table>`. Les migrations antérieures à
 * `DEPUIS` en sont dispensées : elles comptaient sur l'ancien comportement, et
 * la migration de rattrapage leur a rendu leurs droits d'un coup.
 *
 *   node outils/droits.js
 */
const fs = require("fs");
const path = require("path");

const DOSSIER = path.join(__dirname, "..", "supabase", "migrations");

/* L'horodatage de la migration de rattrapage : tout ce qui la précède reçoit
   ses droits d'elle. */
const DEPUIS = "20260923181138";

/* Les commentaires retirés d'abord : une table citée dans le « pourquoi » d'une
   migration n'y est pas créée. */
const sansCommentaires = (sql) =>
  sql.replace(/\/\*[\s\S]*?\*\//g, "").replace(/--.*$/gm, "");

const fautes = [];
for (const fichier of fs.readdirSync(DOSSIER).sort()) {
  if (!fichier.endsWith(".sql") || fichier.slice(0, 14) <= DEPUIS) continue;
  const sql = sansCommentaires(fs.readFileSync(path.join(DOSSIER, fichier), "utf8"));
  const creees = [...sql.matchAll(/create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?"?([a-z_][a-z0-9_]*)"?/gi)]
    .map((m) => m[1].toLowerCase());
  for (const table of creees) {
    const droit = new RegExp(
      `grant\\s[^;]*\\son\\s+(?:table\\s+)?(?:[^;]*,\\s*)?(?:public\\.)?"?${table}"?\\b[^;]*\\sto\\s`, "i");
    if (!droit.test(sql)) fautes.push(`${fichier} : la table « ${table} » est créée sans « grant ».`);
  }
}

if (fautes.length) {
  console.error("Des tables naissent sans droits pour l'API de données :\n");
  for (const f of fautes) console.error("  " + f);
  console.error(
    "\nAjoutez dans la même migration, en ne gardant que ce que la table sert :\n\n" +
    "  grant select on public.<table> to anon;\n" +
    "  grant select, insert, update, delete on public.<table> to authenticated;\n" +
    "  grant select, insert, update, delete on public.<table> to service_role;\n");
  process.exit(1);
}
console.log("Droits des tables : chaque table créée depuis le rattrapage reçoit les siens.");
