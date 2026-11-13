/**
 * La fusion des réglages d'apparence, clé par clé, en base.
 *
 * Rejoue les migrations dans PGlite (`aides/base.js`) et éprouve
 * `fusionne_apparence` (`…_les_reglages_d_apparence_fusionnes_cle_par_cle_en_base.sql`) :
 *
 * - deux enregistrements croisés gardent chacun leurs clés — c'est ce que la
 *   fusion faite par la page, entre une lecture et une écriture, perdait ;
 * - une clé retirée sort, le reste du bloc demeure ;
 * - un pavillon sans bloc reçoit celui qu'on envoie ;
 * - un organisateur ne fusionne que dans les pavillons de ses salons : la
 *   fonction tourne sous ses droits, et la règle d'écriture reste seule juge.
 *
 *   node outils/essais/fusion-apparence.js     (lancé par `npm run essais`)
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

  // le premier compte devient administrateur ; l'organisateur n'a que le salon A
  await un("insert into auth.users (email) values ('admin@x.fr') returning id");
  const ORGA = (await un("insert into auth.users (email) values ('orga@x.fr') returning id")).id;
  const A = (await un("insert into evenement (nom, slug, instance, etat) values ('A', 'a', 'client1', 'publie') returning id")).id;
  const B = (await un("insert into evenement (nom, slug, instance, etat) values ('B', 'b', 'client1', 'publie') returning id")).id;
  await db.query("insert into acces (profil_id, evenement_id) values ($1, $2)", [ORGA, A]);
  const plan = async (evt) => (await un(
    "insert into plan (evenement_id, id_klipso, libelle) values ($1, gen_random_uuid(), 'Hall') returning id", [evt])).id;
  const PA = await plan(A), PA2 = await plan(A), PB = await plan(B);
  // Supabase accorde l'écriture des tables du schéma public à `authenticated`,
  // PGlite non : on l'accorde, la sécurité par ligne reste seule juge.
  await db.exec("grant select, insert, update on apparence to authenticated; grant select on plan to authenticated");

  const fusionne = async (planId, posees, retirees) => {
    await commeCompte(db, ORGA);
    await db.exec("set role authenticated");
    try {
      await db.query("select fusionne_apparence($1, $2, $3, $4)",
        [planId, JSON.stringify(["a", "b"]), JSON.stringify(posees), retirees]);
      return null;
    } catch (e) { return e; } finally { await db.exec("reset role"); }
  };
  const reglages = async (planId) =>
    ((await un("select reglages from apparence where plan_id = $1", [planId])) || {}).reglages;

  await db.query("insert into apparence (plan_id, reglages) values ($1, $2)",
    [PA, JSON.stringify({ _accent: "#111", Batiment: { visible: true } })]);

  // deux postes, chacun sa clé, envoyées l'une après l'autre
  let e = await fusionne(PA, { _accent: "#222" }, []);
  dit(!e, "le premier poste fusionne sa couleur", e && e.message);
  e = await fusionne(PA, { Batiment: { visible: false } }, []);
  dit(!e, "le second poste fusionne son calque", e && e.message);
  let r = await reglages(PA);
  dit(r && r._accent === "#222" && r.Batiment && r.Batiment.visible === false,
    "les deux réglages tiennent ensemble", JSON.stringify(r));

  e = await fusionne(PA, {}, ["Batiment"]);
  r = await reglages(PA);
  dit(!e && r && !("Batiment" in r) && r._accent === "#222", "une clé retirée sort, le reste demeure", JSON.stringify(r));

  e = await fusionne(PA2, { _accent: "#333" }, ["rien"]);
  r = await reglages(PA2);
  dit(!e && r && r._accent === "#333", "un pavillon sans bloc reçoit celui qu'on envoie", e ? e.message : JSON.stringify(r));
  const pile = await un("select pile from apparence where plan_id = $1", [PA2]);
  dit(pile && JSON.stringify(pile.pile) === '["a","b"]', "la pile du pavillon est posée", pile && JSON.stringify(pile.pile));

  e = await fusionne(PB, { _accent: "#444" }, []);
  dit(Boolean(e), "un organisateur ne fusionne pas dans le salon d'un autre", e ? e.message : "accepté");
  dit(!(await reglages(PB)), "  et ce pavillon reste sans bloc");

  const anon = await (async () => {
    await db.exec("set role anon");
    try { await db.query("select fusionne_apparence($1, '[]', '{}', '{}')", [PA]); return null; }
    catch (x) { return x; } finally { await db.exec("reset role"); }
  })();
  dit(Boolean(anon), "un visiteur n'appelle pas la fusion", anon ? anon.message : "accepté");
  /* Et le droit lui-même, pas seulement l'échec : sans la révocation, l'appel
     échouerait encore, mais plus loin, sur les droits de la table. */
  const droit = await un("select has_function_privilege('anon', 'public.fusionne_apparence(uuid,jsonb,jsonb,text[])', 'EXECUTE') as ok");
  dit(droit && droit.ok === false, "  anon n'a pas le droit d'exécuter la fonction", droit && String(droit.ok));

  await db.close();
  if (ko) { console.log("\n" + ko + " échec(s)"); process.exit(1); }
  console.log("\nTout passe.");
}

main().catch((e) => { console.error(e); process.exit(1); });
