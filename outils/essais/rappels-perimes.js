/**
 * L'oubli des rappels que le programme dément, et sa garde contre un
 * programme tronqué (`…_les_rappels_ne_s_oublient_pas_sur_un_programme_tronque.sql`).
 *
 * Rejoue les migrations dans PGlite (`aides/base.js`) et éprouve
 * `oublie_rappels_perimes` :
 *
 * - une conférence décalée ou annulée perd son rappel ;
 * - un programme lu à moins de la moitié de ses conférences n'efface rien ;
 * - la synchronisation suivante, s'il est confirmé, efface ;
 * - un salon sans programme n'efface rien.
 *
 *   node outils/essais/rappels-perimes.js     (lancé par `npm run essais`)
 */
const { baseNeuve } = require("./aides/base.js");

let ko = 0;
const dit = (ok, q, d) => {
  console.log((ok ? "  ok   " : "  ÉCHEC") + "  " + q + (d ? "   → " + d : ""));
  if (!ok) ko++;
};

async function main() {
  const db = await baseNeuve();
  const un = async (sql, args) => (await db.query(sql, args)).rows[0];

  const A = (await un("insert into evenement (nom, slug, instance, etat) values ('A', 'a', 'client1', 'publie') returning id")).id;
  const P = (await un("insert into plan (evenement_id, id_klipso, libelle) values ($1, gen_random_uuid(), 'Hall') returning id", [A])).id;

  const conf = (id, debut) => ({ id, debut, debutLocal: debut });
  const programme = async (confs) => {
    await db.query(`insert into instantane (plan_id, charge) values ($1, $2)
      on conflict (plan_id) do update set charge = excluded.charge`, [P, JSON.stringify({ conferences: confs })]);
  };
  const rappel = async (conference, debut) => {
    await db.query(`insert into rappel_de_conference
      (evenement, abonnement, p256dh, auth, conference, envoi_a, titre, debut_vu)
      values ($1, 'https://pousse.essai/' || $2, 'k', 'a', $2, now() + interval '1 day', 'T', $3)`,
      [A, conference, debut.slice(0, 16) + "|" + debut.slice(0, 16)]);
  };
  const restants = async () =>
    (await db.query("select conference from rappel_de_conference order by conference")).rows.map((r) => r.conference);
  const oublie = async () => (await un("select oublie_rappels_perimes($1) as n", [A])).n;

  // dix conférences au programme, trois rappels posés
  const H = "2026-12-01T10:00";
  const dix = Array.from({ length: 10 }, (_, i) => conf("c" + i, H));
  await programme(dix);
  for (const c of ["c0", "c1", "c2"]) await rappel(c, H);
  dit(await oublie() === 0, "un programme intact n'efface rien");

  // c1 décalée d'une heure : son rappel partirait à l'ancienne heure
  await programme(dix.map((c) => c.id === "c1" ? conf("c1", "2026-12-01T11:00") : c));
  let n = await oublie();
  dit(n === 1 && JSON.stringify(await restants()) === '["c0","c2"]', "une conférence décalée perd son rappel",
    n + " oublié(s), restent " + JSON.stringify(await restants()));

  // la source n'en rend plus que trois, sans c2 : lecture tronquée, on garde
  await programme([conf("c0", H), conf("c5", H), conf("c6", H)]);
  n = await oublie();
  dit(n === 0 && (await restants()).includes("c2"), "un programme tronqué de moitié n'efface rien",
    n + " oublié(s), restent " + JSON.stringify(await restants()));

  // la synchronisation suivante rend le même programme : il est confirmé
  n = await oublie();
  dit(n === 1 && JSON.stringify(await restants()) === '["c0"]', "  confirmé au passage suivant, il efface",
    n + " oublié(s), restent " + JSON.stringify(await restants()));

  // plus de programme du tout : rien ne s'efface
  await programme([]);
  n = await oublie();
  dit(n === 0 && JSON.stringify(await restants()) === '["c0"]', "un salon sans programme n'efface rien",
    n + " oublié(s)");

  await db.close();
  if (ko) { console.log("\n" + ko + " échec(s)"); process.exit(1); }
  console.log("\nTout passe.");
}

main().catch((e) => { console.error(e); process.exit(1); });
