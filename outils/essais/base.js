/**
 * Une base Postgres neuve, toutes les migrations rejouées.
 *
 * Pas de Docker sur ce poste : PGlite (Postgres compilé en WASM) rejoue la
 * chaîne des migrations telle qu'elle partira en production, avec ce que
 * Supabase fournit autour — les rôles `anon`, `authenticated`, `service_role`,
 * le schéma `auth` et `auth.uid()`. `pg_cron` n'existe pas ici : seuls les
 * chemins sous garde s'y éprouvent.
 *
 * Le premier compte inséré dans `auth.users` devient administrateur
 * (déclencheur `profil_a_la_creation`) : `commeCompte` le prend pour
 * identité et ouvre `acces_salon()`.
 */
const fs = require("fs");
const path = require("path");

const MIGRATIONS = path.join(__dirname, "..", "..", "supabase", "migrations");

/** Cette migration échoue exprès sans `pg_cron` ni `pg_net` (elle ne programme
 *  que des rappels, et veut le dire à voix haute en production) : ici, aucun
 *  de deux n'existe, et rien de ce qui la suit n'en dépend. */
const SAUTEES = new Set(["20260915131103_programmer_vraiment_la_tache_des_rappels.sql"]);

async function baseNeuve() {
  const { PGlite } = require("@electric-sql/pglite");
  const { pgcrypto } = require("@electric-sql/pglite/contrib/pgcrypto");
  const db = new PGlite({ extensions: { pgcrypto } });
  await db.exec(`
    create role anon nologin; create role authenticated nologin; create role service_role nologin;
    create schema auth;
    create table auth.users (id uuid primary key default gen_random_uuid(), email text, raw_user_meta_data jsonb);
    create function auth.uid() returns uuid language sql stable
      as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to anon, authenticated, service_role;
    grant execute on function auth.uid() to anon, authenticated, service_role;
  `);
  const fichiers = fs.readdirSync(MIGRATIONS).filter((f) => f.endsWith(".sql") && !SAUTEES.has(f)).sort();
  for (const f of fichiers) {
    try {
      await db.exec(fs.readFileSync(path.join(MIGRATIONS, f), "utf8"));
    } catch (e) {
      throw new Error(f + " : " + e.message);
    }
  }
  return db;
}

/** Parle désormais au nom d'un compte : `auth.uid()` rend son identifiant. */
async function commeCompte(db, id) {
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id]);
}

module.exports = { baseNeuve, commeCompte, MIGRATIONS };
