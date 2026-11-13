/**
 * Les mesures d'avant une remise à zéro ne reviennent pas
 * (`…_les_mesures_d_avant_une_remise_a_zero_ne_reviennent_pas.sql`).
 *
 * Rejoue les migrations dans PGlite (`aides/base.js`) : un paquet de gestes
 * resté hors ligne pendant la remise à zéro arrive après elle, en disant
 * combien de temps il a attendu ; il ne doit rien recompter. Un paquet récent
 * compte comme avant.
 *
 *   node outils/essais/remise-a-zero.js     (lancé par `npm run essais`)
 */
const { baseNeuve, commeCompte } = require("./aides/base.js");

let ko = 0;
const dit = (ok, q, d) => {
  console.log((ok ? "  ok   " : "  ÉCHEC") + "  " + q + (d ? "   → " + d : ""));
  if (!ok) ko++;
};

async function main() {
  const db = await baseNeuve();
  const un = async (sql, args) => (await db.query(sql, args)).rows[0];

  // le premier compte devient administrateur
  const ADMIN = (await un("insert into auth.users (email) values ('admin@x.fr') returning id")).id;
  const A = (await un("insert into evenement (nom, slug, instance, etat) values ('A', 'a', 'client1', 'publie') returning id")).id;
  // Supabase accorde ces droits à `authenticated`, PGlite non : la sécurité par
  // ligne reste seule juge.
  await db.exec("grant select, update on evenement to authenticated; grant select, delete on compteur, compteur_cible, visiteur_cible, visiteur_jour, plan_de_visite to authenticated");

  const gestes = JSON.stringify([{ genre: "visite" }, { genre: "recherche" }]);
  const envoie = (recul) => db.query(
    "select enregistre_mesures('a', '00000000-0000-4000-8000-000000000001', $1::jsonb, 'web', true, $2)",
    [gestes, recul]);
  const total = async () => Number((await un("select coalesce(sum(n), 0) as n from compteur where evenement_id = $1", [A])).n);

  await envoie(0);
  dit(await total() === 2, "un paquet compte ses gestes", String(await total()));

  // la remise à zéro, par l'exploitant
  await commeCompte(db, ADMIN);
  await db.exec("set role authenticated");
  let e = null;
  try { await db.query("select reinitialise_compteurs($1)", [A]); } catch (x) { e = x; } finally { await db.exec("reset role"); }
  dit(!e && await total() === 0, "la remise à zéro efface les compteurs", e ? e.message : String(await total()));
  const remis = await un("select compteurs_remis_le from evenement where id = $1", [A]);
  dit(remis && remis.compteurs_remis_le, "  et retient son instant");

  // un paquet resté une heure hors ligne arrive maintenant
  const recu = await un("select enregistre_mesures('a', '00000000-0000-4000-8000-000000000002', $1::jsonb, 'web', true, 3600) as ok", [gestes]);
  dit(recu.ok === true && await total() === 0, "un paquet d'avant la remise est reçu, et ne recompte rien",
    "reçu " + recu.ok + ", compteurs " + (await total()));

  // un paquet d'après la remise compte comme avant
  await envoie(0);
  dit(await total() === 2, "un paquet d'après la remise compte", String(await total()));

  await db.close();
  if (ko) { console.log("\n" + ko + " échec(s)"); process.exit(1); }
  console.log("\nTout passe.");
}

main().catch((e) => { console.error(e); process.exit(1); });
