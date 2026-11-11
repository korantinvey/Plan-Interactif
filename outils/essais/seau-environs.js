/**
 * Le seau du fond figé : qui peut y écrire (`…_le_fond_de_carte_fige.sql`).
 *
 * Rejoue les migrations dans PGlite (`aides/base.js`), puis éprouve les
 * politiques posées sur `storage.objects` : l'exploitant d'un salon range et
 * retire les images de ses pavillons, et de ceux-là seulement ; un compte sans
 * accès, la clé publique et un chemin qui ne nomme pas de pavillon ne passent
 * pas. Une politique trop large laisserait n'importe quel compte remplacer le
 * fond d'un salon qu'il n'administre pas ; trop étroite, la photographie
 * échouerait chez l'exploitant, à la fin de sa minute d'attente.
 *
 *   node outils/essais/seau-environs.js     (lancé par `npm run essais`)
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
  const sous = async (role, sql, args) => {
    await db.exec("set role " + role);
    try { return (await db.query(sql, args)).rows; } finally { await db.exec("reset role"); }
  };
  const refuse = async (f) => { try { await f(); return ""; } catch (e) { return e.message; } };

  const seau = await un("select public, allowed_mime_types from storage.buckets where id = 'environs'");
  dit(seau && seau.public === true, "le seau existe, et se lit sans compte");

  // le premier compte est administrateur ; l'organisateur reçoit le salon A seul
  const ADMIN = (await un("insert into auth.users (email) values ('admin@x.fr') returning id")).id;
  const ORGA = (await un("insert into auth.users (email) values ('orga@x.fr') returning id")).id;
  const A = (await un("insert into evenement (nom, slug, instance) values ('A', 'a', 'x') returning id")).id;
  const B = (await un("insert into evenement (nom, slug, instance) values ('B', 'b', 'x') returning id")).id;
  const PA = (await un("insert into plan (evenement_id, id_klipso, libelle) values ($1, gen_random_uuid(), 'H1') returning id", [A])).id;
  const PB = (await un("insert into plan (evenement_id, id_klipso, libelle) values ($1, gen_random_uuid(), 'H1') returning id", [B])).id;
  await db.query("insert into acces (profil_id, evenement_id) values ($1, $2)", [ORGA, A]);

  const depose = (role, nom) => sous(role,
    "insert into storage.objects (bucket_id, name) values ('environs', $1) returning name", [nom]);
  const chemin = (plan) => plan + "/lot1/0/0/0.webp";

  await commeCompte(db, ORGA);
  dit((await depose("authenticated", chemin(PA))).length === 1, "l'organisateur range une image de son pavillon");
  dit(/row-level security/.test(await refuse(() => depose("authenticated", chemin(PB)))),
    "mais pas dans le pavillon d'un autre salon");
  dit(/row-level security/.test(await refuse(() => depose("authenticated", "pas-un-pavillon/0/0/0.webp"))),
    "un chemin qui ne nomme pas de pavillon est refusé, sans lever");
  // un autre seau n'a pas de politique ici : refusé, quelle qu'en soit la raison
  dit((await refuse(() => sous("authenticated",
    "insert into storage.objects (bucket_id, name) values ('autre', $1)", [chemin(PA)]))) !== "",
    "la règle ne vaut que pour ce seau");
  dit((await sous("authenticated", "select name from storage.objects")).length === 1,
    "l'organisateur liste ses images, pour retirer les lots d'avant");
  dit((await sous("authenticated", "delete from storage.objects where name = $1 returning name", [chemin(PA)])).length === 1,
    "et les retire");

  await commeCompte(db, ADMIN);
  dit((await depose("authenticated", chemin(PB))).length === 1, "l'administrateur range dans tous les salons");

  await commeCompte(db, ORGA);
  dit((await sous("authenticated", "delete from storage.objects where name = $1 returning name", [chemin(PB)])).length === 0,
    "l'organisateur ne retire pas les images d'un autre salon");

  await commeCompte(db, "");
  dit(/permission denied|row-level security/.test(await refuse(() => depose("anon", chemin(PA)))),
    "la clé publique ne range rien");

  console.log(ko ? "\n" + ko + " ÉCHEC(S)\n" : "\nLe seau du fond figé ne s'ouvre qu'à l'exploitant.\n");
  process.exit(ko ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
