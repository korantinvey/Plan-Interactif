/**
 * Une clé par base Klipso : `base_klipso`, `prive.cle_klipso` et leurs portes.
 *
 * Rejoue les migrations dans PGlite (`base.js`) puis éprouve ce que promet la
 * migration : les bases des salons en place relevées sans clé, la clé qui
 * entre par `enregistre_base_klipso` et ne ressort que pour la clé de service,
 * jamais pour l'administrateur qui l'a saisie, et rien du tout pour un
 * organisateur ni pour la clé publique.
 *
 *   node outils/essais/bases-klipso.js     (chaîné dans `npm run essais`)
 */
const fs = require("fs");
const path = require("path");
const { baseNeuve, commeCompte, MIGRATIONS } = require("./base.js");

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

  /* Les salons d'avant la migration : on rejoue celle-ci sur une base qui en
     porte, pour voir ce qu'elle relève. */
  await db.exec("insert into evenement (nom, slug, instance, etat) values " +
    "('A', 'a', 'clienta', 'publie'), ('A2', 'a2', ' clienta ', 'brouillon'), " +
    "('D', 'd', 'demo', 'publie'), ('V', 'v', '', 'brouillon')");
  await db.exec("delete from base_klipso");
  const sql = fs.readFileSync(path.join(MIGRATIONS,
    fs.readdirSync(MIGRATIONS).find((f) => f.endsWith("_une_cle_par_base_klipso.sql"))), "utf8");
  await db.exec(sql.slice(sql.indexOf("insert into base_klipso"), sql.indexOf("on conflict do nothing;") + 23));
  const relevees = (await db.query("select instance, cle_modifiee_le from base_klipso order by 1")).rows;
  dit(relevees.length === 1 && relevees[0].instance === "clienta" && relevees[0].cle_modifiee_le === null,
    "les bases des salons en place sont relevées, sans clé, ni « demo » ni vide", JSON.stringify(relevees));

  const ADMIN = (await un("insert into auth.users (email) values ('admin@x.fr') returning id")).id;
  const ORGA = (await un("insert into auth.users (email) values ('orga@x.fr') returning id")).id;

  // --- l'administrateur
  await commeCompte(db, ADMIN);
  const cree = (await sous("authenticated", "select * from enregistre_base_klipso(' clientb ', ' k1 ')"))[0];
  dit(cree && cree.instance === "clientb" && cree.cle_modifiee_le !== null && !("cle" in cree),
    "l'administrateur ajoute une base ; la réponse ne rend pas la clé", JSON.stringify(cree));
  const vues = await sous("authenticated", "select * from base_klipso order by instance");
  dit(vues.length === 2 && vues.every((b) => !("cle" in b)), "l'administrateur lit la liste, sans clé");
  dit(/permission denied/.test(await refuse(() => sous("authenticated", "select * from prive.cle_klipso"))),
    "l'administrateur ne lit pas les clés");
  dit(/permission denied/.test(await refuse(() => sous("authenticated", "select cle_klipso('clientb')"))),
    "l'administrateur ne relit pas une clé par la fonction de la synchronisation");
  dit(/invalide/.test(await refuse(() => sous("authenticated", "select enregistre_base_klipso('x.calypso-event.net', 'k')"))),
    "une adresse entière n'est pas une instance");
  dit(/vide/.test(await refuse(() => sous("authenticated", "select enregistre_base_klipso('clientc', '  ')"))),
    "une clé vide est refusée");
  await sous("authenticated", "select enregistre_base_klipso('clienta', 'ka')");
  await sous("authenticated", "select enregistre_base_klipso('clientb', 'k2')");

  // --- la synchronisation, sous la clé de service
  const cle = async (i) => (await sous("service_role", "select cle_klipso($1) as c", [i]))[0].c;
  dit(await cle("clientb") === "k2", "la clé remplacée est celle que lit la synchronisation");
  dit(await cle("clienta") === "ka", "une base relevée reçoit sa propre clé");
  dit(await cle("inconnue") === null, "sans clé propre : null, la clé commune prendra le relais");
  const a = (await un("select cle_modifiee_le from base_klipso where instance = 'clienta'")).cle_modifiee_le;
  dit(a !== null, "la date de saisie se pose sur une base relevée");

  // --- un organisateur, la clé publique
  await commeCompte(db, ORGA);
  dit((await sous("authenticated", "select * from base_klipso")).length === 0,
    "un organisateur ne voit aucune base");
  dit(/administrateur/.test(await refuse(() => sous("authenticated", "select enregistre_base_klipso('clientd', 'k')"))),
    "un organisateur n'enregistre pas de base");
  dit(/permission denied/.test(await refuse(() => sous("anon", "select enregistre_base_klipso('clientd', 'k')"))),
    "la clé publique n'atteint pas l'enregistrement");
  dit(/permission denied/.test(await refuse(() => sous("anon", "select cle_klipso('clientb')"))),
    "la clé publique ne lit pas de clé");

  // --- une base supprimée emporte sa clé
  await db.exec("delete from base_klipso where instance = 'clientb'");
  dit((await un("select count(*)::int n from prive.cle_klipso where instance = 'clientb'")).n === 0,
    "supprimer une base supprime sa clé");

  console.log(ko ? "\n" + ko + " échec(s)." : "\nTout passe.");
  process.exit(ko ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
