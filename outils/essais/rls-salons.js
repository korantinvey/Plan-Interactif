/**
 * Aucune table rattachée à un salon ne s'ouvre à tout compte connecté.
 *
 * Rejoue les migrations dans PGlite (`aides/base.js`), puis lit les politiques
 * telles qu'elles partiront en production. Une table qui porte `evenement_id`
 * appartient à un salon : un compte connecté n'en lit que ce qu'`acces_salon()`
 * lui ouvre. Une politique `using (true)` pour `authenticated` y défait ce
 * partage sans que rien ne casse à l'écran — l'exploitant voit toujours ses
 * chiffres, il voit seulement ceux des autres en plus. C'est ainsi que
 * `visiteur_cible` a fui l'audience de tous les salons
 * (`…_la_lecture_des_presences_bornee_au_salon.sql`) ; cet essai empêche que
 * cela revienne avec la table suivante.
 *
 * Le visiteur anonyme (`anon`) n'est pas visé : ce qu'il lit — le plan public —
 * est ouvert exprès, et se règle ailleurs.
 *
 *   node outils/essais/rls-salons.js     (lancé par `npm run essais`)
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

  // Les tables d'un salon, et ce qui les protège.
  const tables = (await db.query(`
    select c.table_name, t.relrowsecurity as rls
    from information_schema.columns c
    join pg_class t on t.relname = c.table_name
    join pg_namespace n on n.oid = t.relnamespace and n.nspname = 'public'
    where c.table_schema = 'public' and c.column_name = 'evenement_id'
      and t.relkind = 'r'
    order by 1`)).rows;
  dit(tables.length > 5, "les tables d'un salon sont trouvées", tables.length + " tables");
  const sansRls = tables.filter((t) => !t.rls).map((t) => t.table_name);
  dit(sansRls.length === 0, "toutes ont la sécurité par ligne", sansRls.join(", "));

  const ouvertes = (await db.query(`
    select p.tablename, p.policyname, p.cmd
    from pg_policies p
    where p.schemaname = 'public'
      and p.tablename = any($1)
      and (p.roles && array['authenticated', 'public']::name[])
      and (btrim(coalesce(p.qual, '')) = 'true' or btrim(coalesce(p.with_check, '')) = 'true')
    order by 1, 2`, [tables.map((t) => t.table_name)])).rows;
  dit(ouvertes.length === 0, "aucune ne s'ouvre à tout compte connecté",
    ouvertes.map((p) => p.tablename + " « " + p.policyname + " » (" + p.cmd + ")").join(" ; "));

  // Et le cas qui a fui, éprouvé en vrai : un organisateur ne lit que son salon.
  await un("insert into auth.users (email) values ('admin@x.fr') returning id");
  const ORGA = (await un("insert into auth.users (email) values ('orga@x.fr') returning id")).id;
  const A = (await un("insert into evenement (nom, slug, instance) values ('A', 'a', 'x') returning id")).id;
  const B = (await un("insert into evenement (nom, slug, instance) values ('B', 'b', 'x') returning id")).id;
  await db.query("insert into acces (profil_id, evenement_id) values ($1, $2)", [ORGA, A]);
  for (const e of [A, B]) {
    await db.query("insert into cible (evenement_id, genre, id) values ($1, 'fiche_stand', 's1')", [e]);
    await db.query(`insert into visiteur_cible (evenement_id, objet, cible, genre, jour, visiteur)
      values ($1, 'fiche_stand', 's1', 'fiche_stand', current_date, 'v1')`, [e]);
  }
  // Supabase accorde la lecture de toute table du schéma public à
  // `authenticated` : seule la sécurité par ligne tient le partage, et c'est
  // elle qu'on éprouve. PGlite ne l'accorde pas — on le fait ici.
  await db.exec("grant select on visiteur_cible to authenticated");
  await commeCompte(db, ORGA);
  await db.exec("set role authenticated");
  let vus;
  try {
    vus = (await db.query("select evenement_id from visiteur_cible")).rows.map((r) => r.evenement_id);
  } finally {
    await db.exec("reset role");
  }
  dit(vus.length === 1 && vus[0] === A,
    "l'organisateur ne lit les présences que de son salon", vus.length + " ligne(s) lue(s)");
}

main().then(() => {
  if (ko) { console.error(ko + " échec(s)"); process.exit(1); }
}, (e) => { console.error(e); process.exit(1); });
