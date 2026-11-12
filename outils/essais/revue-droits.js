/**
 * Les droits et les bornes que la revue de novembre 2026 a relevés.
 *
 * Rejoue les migrations dans PGlite (`aides/base.js`) et éprouve en vrai ce
 * que `…_les_droits_et_les_bornes_que_la_revue_a_releves.sql` corrige :
 *
 * - un organisateur ne change ni la base Klipso, ni l'identifiant d'événement,
 *   ni les identifiants d'un autre fournisseur de son salon — il pouvait sinon
 *   faire lire la base d'un autre client avec la clé de ce client ; le reste de
 *   son salon lui reste ouvert, et l'administrateur garde la main ;
 * - trois relevés de performance extrêmes ne font plus échouer le bilan, ni la
 *   purge qui l'appelle ;
 * - un rappel passé sa durée de vie ne part plus ;
 * - un plan de visite ne se pose pas au-delà d'un an.
 *
 *   node outils/essais/revue-droits.js     (lancé par `npm run essais`)
 */
const { baseNeuve, commeCompte } = require("./aides/base.js");

let ko = 0;
const dit = (ok, q, d) => {
  console.log((ok ? "  ok   " : "  ÉCHEC") + "  " + q + (d ? "   → " + d : ""));
  if (!ok) ko++;
};

/** Ce qu'une requête lève, ou null si elle passe. */
async function leve(db, sql, args) {
  try { await db.query(sql, args); return null; } catch (e) { return e; }
}

async function main() {
  const db = await baseNeuve();
  const un = async (sql, args) => (await db.query(sql, args)).rows[0];

  // Le premier compte devient administrateur, le second est un organisateur.
  const ADMIN = (await un("insert into auth.users (email) values ('admin@x.fr') returning id")).id;
  const ORGA = (await un("insert into auth.users (email) values ('orga@x.fr') returning id")).id;
  const A = (await un("insert into evenement (nom, slug, instance, etat) values ('A', 'a', 'client1', 'publie') returning id")).id;
  await db.query("insert into acces (profil_id, evenement_id) values ($1, $2)", [ORGA, A]);
  // Supabase accorde l'écriture des tables du schéma public à `authenticated`,
  // PGlite non : on l'accorde, la sécurité par ligne et le déclencheur restent
  // seuls juges.
  await db.exec("grant select, update on evenement to authenticated");

  const comme = async (id, sql, args) => {
    await commeCompte(db, id);
    await db.exec("set role authenticated");
    try { return await leve(db, sql, args); } finally { await db.exec("reset role"); }
  };

  // ------------------------------------------------ la source d'un salon
  for (const [col, val] of [["instance", "client2"], ["event_id", "00000000-0000-4000-8000-0000000000aa"], ["cles", '{"eventmaker":"x"}']]) {
    const e = await comme(ORGA, `update evenement set ${col} = $1 where id = $2`, [val, A]);
    dit(e && /administrateur/.test(e.message), "un organisateur ne change pas « " + col + " »",
      e ? e.message : "accepté");
  }
  dit((await un("select instance from evenement where id = $1", [A])).instance === "client1",
    "la base Klipso du salon est restée la sienne");
  const nom = await comme(ORGA, "update evenement set nom = 'A bis' where id = $1", [A]);
  dit(!nom, "il modifie toujours le reste de son salon", nom && nom.message);
  const adm = await comme(ADMIN, "update evenement set instance = 'client2' where id = $1", [A]);
  dit(!adm, "l'administrateur change la base Klipso", adm && adm.message);
  const service = await leve(db, "update evenement set instance = 'client1' where id = $1", [A]);
  dit(!service, "la synchronisation et les migrations n'y sont pas soumises", service && service.message);

  // ------------------------------------------------ le bilan de performance
  for (const v of [1, 2, 3].map((n) => "00000000-0000-4000-8000-00000000000" + n)) {
    await db.query(`insert into releve_perf (evenement_id, visite, jour, page, pertes_contexte, resume)
      values ($1, $2, current_date, 'plan', 1000000000, '{}')`, [A, v]);
  }
  // et un groupe sans aucune perte mesurée — une autre page du même salon
  await db.query(`insert into releve_perf (evenement_id, visite, jour, page, resume)
    values ($1, '00000000-0000-4000-8000-000000000009', current_date, 'borne', '{}')`, [A]);
  const bilan = await leve(db, "select purge_perf()");
  dit(!bilan, "trois relevés extrêmes ne font plus échouer le bilan ni la purge", bilan && bilan.message);
  const pertes = await un("select pertes_contexte from perf_bilan where evenement_id = $1 and page = 'plan'", [A]);
  dit(pertes && pertes.pertes_contexte === 2147483647, "la somme se borne au plus grand entier",
    pertes && String(pertes.pertes_contexte));
  const sans = await un("select pertes_contexte from perf_bilan where evenement_id = $1 and page = 'borne'", [A]);
  dit(sans && sans.pertes_contexte === null, "un groupe sans perte mesurée reste sans valeur",
    sans && String(sans.pertes_contexte));

  // --------------------------------------------------- les rappels périmés
  await db.query(`insert into rappel_de_conference
      (evenement, abonnement, p256dh, auth, conference, envoi_a, titre, corps, adresse, vie)
    values ($1, 'https://fcm.googleapis.com/a', 'p', 'k', 'c1', now() - interval '1 hour', 't', 'c', '/', 900),
           ($1, 'https://fcm.googleapis.com/b', 'p', 'k', 'c2', now() - interval '1 minute', 't', 'c', '/', 900)`, [A]);
  const dus = (await db.query("select abonnement, vie from rappels_dus(10)")).rows;
  dit(dus.length === 1 && dus[0].abonnement.endsWith("/b"),
    "un rappel passé sa durée de vie ne part plus", dus.map((r) => r.abonnement).join(", "));
  dit(dus[0] && dus[0].vie > 0 && dus[0].vie <= 840, "il part avec ce qui lui reste à vivre",
    dus[0] && String(dus[0].vie));

  // ------------------------------------------------ les plans de visite
  await db.query("insert into cible (evenement_id, genre, id) values ($1, 'fiche_stand', 's1') on conflict do nothing", [A]);
  const loin = new Date(Date.now() + 400 * 864e5).toISOString().slice(0, 10);
  const pres = new Date(Date.now() + 10 * 864e5).toISOString().slice(0, 10);
  await db.query("select pose_plan_de_visite('a', 'p1', $1::jsonb)",
    [JSON.stringify([{ jour: loin, tranche: "20", cible: "s1" }, { jour: pres, tranche: "20", cible: "s1" }])]);
  const jours = (await db.query("select jour::text as j from plan_de_visite where plan = 'p1'")).rows.map((r) => r.j);
  dit(jours.length === 1 && jours[0] === pres, "un plan de visite ne se pose pas au-delà d'un an", jours.join(", "));
}

main().then(() => {
  if (ko) { console.error(ko + " échec(s)"); process.exit(1); }
}, (e) => { console.error(e); process.exit(1); });
