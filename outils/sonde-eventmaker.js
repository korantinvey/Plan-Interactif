#!/usr/bin/env node
/* Sonde Eventmaker : par où une conférence tient-elle à un exposant ?
 *
 * Il tient par le graphe, et par lui seul.
 *
 * L'API REST ne le dit nulle part : ni la session, ni ses paramètres, ni les
 * chemins voisins, ni les inscriptions, ni un champ personnalisé. Les sections
 * 1 à 7 ferment ces portes une à une — elles restent là parce qu'un lecteur
 * pressé les rouvrirait sinon. La 8 répond : /api/graphql, celui qui alimente
 * le programme du site public, range sous chaque session ses intervenants, ses
 * animateurs et ses exposants. L'exposant y vient avec l'identifiant de sa
 * fiche d'invité, qui porte le numéro de stand : la chaîne va jusqu'au plan.
 *
 * `eventmaker.md`, à côté, consigne les mesures et ce qu'elles engagent.
 *
 *   EVENTMAKER_TOKEN=... node outils/sonde-eventmaker.js <idEvenement>
 *
 * Le jeton se lit aussi dans .env, à la racine. Rien n'est écrit ailleurs que
 * dans outils/brut/eventmaker/, qui n'est pas versionné : les charges brutes y
 * restent disponibles pour une lecture au calme.
 */
const fs = require("fs"), path = require("path");

/* En session cloud, la sortie HTTPS passe par un proxy que `fetch` n'emprunte
   qu'à la demande — sans quoi l'appel part en direct et se fait refuser. Node
   ne lit l'indicateur qu'au démarrage : on se relance avec. Sur un poste sans
   proxy, la branche ne sert pas. */
if (process.env.HTTPS_PROXY && process.env.NODE_USE_ENV_PROXY !== "1") {
  const r = require("child_process").spawnSync(
    process.execPath, [__filename, ...process.argv.slice(2)],
    { stdio: "inherit", env: { ...process.env, NODE_USE_ENV_PROXY: "1", NODE_NO_WARNINGS: "1" } },
  );
  process.exit(r.status ?? 1);
}

const BASE = "https://app.eventmaker.io/api/v1";
const PAR_PAGE = 500;
/* Vingt-cinq fiches suffisent à dire si une catégorie porte des numéros de
   stand : celle des exposants en est pleine, les autres n'en ont aucune. */
const ECHANTILLON = 25;
const DE_FRONT = 4;
const SORTIE = path.join(__dirname, "brut", "eventmaker");

/* Les noms de champs qui trahiraient un rattachement. On les cherche partout :
   sur la session, sur la fiche d'invité, dans les champs personnalisés. */
const INDICES = /guest|speaker|intervenant|orateur|exhibitor|exposant|stand|booth|compan|societ|partenaire|sponsor|conferen|session|atelier|programme/i;

/* ------------------------------------------------------------------ jeton */

function chargeEnv() {
  const f = path.join(__dirname, "..", ".env");
  if (!fs.existsSync(f)) return;
  for (const ligne of fs.readFileSync(f, "utf8").split("\n")) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(ligne);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}
chargeEnv();

const JETON = process.env.EVENTMAKER_TOKEN;
const ID = process.argv[2];
if (!JETON) {
  console.error("usage : EVENTMAKER_TOKEN=... node outils/sonde-eventmaker.js <idEvenement>");
  process.exit(1);
}

/* ------------------------------------------------------------- mécanique */

/** Un appel qui ne jette pas : un 404 est ici une réponse, pas une panne. */
async function lire(chemin, params = {}) {
  const u = new URL(BASE + chemin);
  u.searchParams.set("auth_token", JETON);
  for (const [k, v] of Object.entries(params)) u.searchParams.append(k, String(v));
  // sans « page », l'API répond 302 vers la même adresse avec page=1
  const r = await fetch(u, { redirect: "follow" });
  const texte = await r.text();
  let corps = null;
  try { corps = JSON.parse(texte); } catch { /* une page d'erreur HTML, parfois */ }
  return { statut: r.status, ok: r.ok, corps, texte };
}

/* Toutes les collections ne paginent pas. /exhibitors rend ses six cent treize
   fiches quelle que soit la page demandée : une boucle qui n'attend qu'une page
   courte tourne alors sans fin. On s'arrête aussi quand une page rend ce que la
   précédente rendait déjà. */
async function toutesPages(chemin, params = {}) {
  const out = [];
  let precedente = null;
  for (let page = 1; ; page++) {
    const r = await lire(chemin, { ...params, per_page: PAR_PAGE, page });
    if (!r.ok || !Array.isArray(r.corps)) return out;
    const signature = r.corps.map((x) => x?._id).join(",");
    if (signature === precedente) return out;
    precedente = signature;
    out.push(...r.corps);
    if (r.corps.length < PAR_PAGE) return out;
  }
}

/* Le graphe public : ni jeton ni en-tête, l'identifiant de l'événement suffit.
   `publicViewer` est ce que voit un visiteur du site du salon ; `viewer`, qu'on
   n'emprunte pas, est sa version connectée. */
const ROLES = ["speakers", "moderators", "exhibitors"];
const REQUETE_PROGRAMME = `query Programme($eventId: ID!, $id: ID!, $cursor: String) {
  publicViewer(eventId: $eventId) {
    program(id: $id) {
      sessions(after: $cursor) {
        edges { node { id displayName location startDate
          ${ROLES.map((r) => `${r} { id name companyName position }`).join("\n          ")}
        } }
        pageInfo { endCursor hasNextPage }
      }
    }
  }
}`;

async function graphql(requete, variables) {
  const r = await fetch(`${BASE.replace("/api/v1", "")}/api/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: requete, variables }),
  });
  try { return JSON.parse(await r.text()); } catch { return { errors: [{ message: `HTTP ${r.status}` }] }; }
}

async function enParallele(items, n, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    for (;;) { const k = i++; if (k >= items.length) return; out[k] = await fn(items[k]); }
  }));
  return out;
}

const apercu = (v) => {
  const s = typeof v === "string" ? v : JSON.stringify(v);
  return String(s ?? "").replace(/\s+/g, " ").slice(0, 72);
};

/** Les clés d'une collection d'objets, avec un exemple de valeur non vide. */
function inventaire(objets) {
  const m = new Map();
  for (const o of objets) {
    for (const [k, v] of Object.entries(o || {})) {
      const e = m.get(k) || { vus: 0, remplis: 0, exemple: null };
      e.vus++;
      const vide = v === null || v === "" || (Array.isArray(v) && !v.length);
      if (!vide) { e.remplis++; if (e.exemple === null) e.exemple = apercu(v); }
      m.set(k, e);
    }
  }
  return m;
}

function montreInventaire(inv, total) {
  for (const [k, e] of [...inv].sort((a, b) => a[0].localeCompare(b[0]))) {
    const marque = INDICES.test(k) ? "◆" : " ";
    const part = String(e.remplis).padStart(String(total).length) + "/" + total;
    console.log(`  ${marque} ${k.padEnd(34)} ${part}  ${e.exemple ?? ""}`);
  }
}

const titre = (t) => console.log("\n\n=== " + t + " " + "=".repeat(Math.max(0, 68 - t.length)));

/** Deux clés d'appariement : le numéro de stand, et le nom d'enseigne. */
const cleStand = (v) => String(v ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
const normalise = (v) => String(v ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "")
  .toUpperCase().replace(/[^A-Z0-9]+/g, " ").trim();

/** Les champs personnalisés arrivent en liste de { name, value }. */
function champs(meta) {
  const out = {};
  if (!Array.isArray(meta)) return out;
  for (const m of meta) {
    if (typeof m?.name === "string" && typeof m?.value === "string" && m.value.trim()) {
      out[m.name] = m.value.trim();
    }
  }
  return out;
}

function garde(nom, donnees) {
  fs.mkdirSync(SORTIE, { recursive: true });
  fs.writeFileSync(path.join(SORTIE, nom), JSON.stringify(donnees, null, 2));
}

/* ------------------------------------------------------------ la sonde */

(async () => {
  /* Sans identifiant, on rend la liste : c'est la question qu'on se pose la
     première fois, et le jeton la porte déjà. */
  if (!ID) {
    const l = await lire("/events.json", { per_page: 100, page: 1 });
    if (!l.ok) { console.error(`/events : ${l.statut} ${l.texte.slice(0, 200)}`); process.exit(1); }
    for (const e of l.corps ?? []) console.log(`  ${String(e._id).padEnd(10)} ${e.title}`);
    console.log("\nrelancez avec l'identifiant de l'événement à sonder");
    return;
  }

  const evt = await lire(`/events/${ID}.json`);
  if (!evt.ok) {
    console.error(`événement ${ID} : ${evt.statut} ${evt.texte.slice(0, 200)}`);
    process.exit(1);
  }
  console.log(`${evt.corps.title}  (${ID})`);

  /* --- 1. la session telle que l'API la donne -------------------------- */
  titre("1. Les sessions, champ par champ");

  const points = await toutesPages(`/events/${ID}/accesspoints.json`);
  const sessions = points.filter((a) => a.session_type_id);
  console.log(`${points.length} points d'accès, dont ${sessions.length} sessions`);
  garde("accesspoints.json", points);
  if (!sessions.length) { console.log("aucune session : la suite n'a rien à mordre"); return; }

  console.log("\nchamps d'une session (◆ = piste) :");
  montreInventaire(inventaire(sessions), sessions.length);

  /* Les champs personnalisés de session vivent dans « traits ». C'est là qu'un
     organisateur logerait « stand de l'intervenant » sans rien demander à
     Eventmaker. */
  const traits = sessions.map((s) => s.traits).filter((t) => t && typeof t === "object");
  console.log(`\nchamps personnalisés (traits), sur ${traits.length} sessions qui en portent :`);
  if (traits.length) montreInventaire(inventaire(traits), traits.length);
  else console.log("  aucun");

  /* La fiche détaillée est parfois plus riche que la ligne de liste — c'est le
     cas des invités, dont les champs personnalisés ne descendent qu'à la
     demande. Vérifions si les sessions cachent la même chose. */
  const s0 = sessions[0];
  const detail = await lire(`/events/${ID}/accesspoints/${s0._id}.json`);
  if (detail.ok && detail.corps) {
    const enPlus = Object.keys(detail.corps).filter((k) => !(k in s0));
    console.log(`\nfiche détaillée : ${enPlus.length ? "champs en plus — " + enPlus.join(", ") : "rien de plus que la liste"}`);
    garde("une-session-detail.json", detail.corps);
  } else {
    console.log(`\nfiche détaillée : ${detail.statut}`);
  }

  /* Les invités ne rendent leurs champs personnalisés qu'avec
     guest_metadata=true. Un interrupteur du même genre existe peut-être pour
     les sessions, et rien ne le dit : on essaie. */
  titre("2. Les paramètres qui ouvriraient la session");
  const variantes = [
    { guest_metadata: "true" }, { accesspoint_metadata: "true" }, { metadata: "true" },
    { traits: "true" }, { extended: "true" }, { full: "true" },
    { include: "speakers" }, { include: "guests" }, { include: "exhibitors" },
    { with_speakers: "true" },
  ];
  for (const v of variantes) {
    const r = await lire(`/events/${ID}/accesspoints.json`, { ...v, per_page: 3, page: 1 });
    const item = Array.isArray(r.corps) ? r.corps.find((a) => a.session_type_id) ?? r.corps[0] : null;
    const enPlus = item ? Object.keys(item).filter((k) => !(k in s0)) : [];
    const nom = Object.entries(v).map(([k, x]) => `${k}=${x}`).join("&");
    console.log(`  ${nom.padEnd(30)} ${r.statut}  ${enPlus.length ? "champs en plus : " + enPlus.join(", ") : "identique"}`);
  }

  /* --- 3. les chemins voisins ------------------------------------------ */
  titre("3. Les chemins que la documentation ne cite pas");

  /* Un exposant pour servir de sujet : sa fiche d'invité, et son identifiant. */
  const cats = await toutesPages(`/events/${ID}/guest_categories.json`);
  const sondes = await enParallele(cats, DE_FRONT, async (c) => {
    const r = await lire(`/events/${ID}/guests.json`,
      { per_page: ECHANTILLON, page: 1, guest_metadata: "true", "category[]": c._id });
    const l = Array.isArray(r.corps) ? r.corps : [];
    return { cat: c, fiches: l, avecStand: l.filter((g) => champs(g.guest_metadata).num_stand).length };
  });
  const catsExpo = sondes.filter((s) => s.avecStand).map((s) => s.cat);
  const unExpo = sondes.flatMap((s) => s.fiches).find((g) => champs(g.guest_metadata).num_stand);
  console.log(`catégories d'invités : ${cats.length}, dont ${catsExpo.length} avec numéros de stand`
    + (catsExpo.length ? " — " + catsExpo.map((c) => c.name).join(", ") : ""));

  const g0 = unExpo?._id ?? sondes.flatMap((s) => s.fiches)[0]?._id;
  const chemins = [
    `/events/${ID}/sessions.json`,
    `/events/${ID}/session_types.json`,
    `/events/${ID}/session_rooms.json`,
    `/events/${ID}/speakers.json`,
    `/events/${ID}/session_speakers.json`,
    `/events/${ID}/exhibitors.json`,
    `/events/${ID}/custom_fields.json`,
    `/events/${ID}/guest_fields.json`,
    `/events/${ID}/registrations.json`,
    `/events/${ID}/bookings.json`,
    `/events/${ID}/attendances.json`,
    `/events/${ID}/programs.json`,
    `/events/${ID}/workshops.json`,
    `/events/${ID}/accesspoints/${s0._id}/speakers.json`,
    `/events/${ID}/accesspoints/${s0._id}/guests.json`,
    `/events/${ID}/accesspoints/${s0._id}/registrations.json`,
    `/events/${ID}/accesspoints/${s0._id}/exhibitors.json`,
    ...(g0 ? [
      `/events/${ID}/guests/${g0}/accesspoints.json`,
      `/events/${ID}/guests/${g0}/sessions.json`,
      `/events/${ID}/guests/${g0}/registrations.json`,
    ] : []),
  ];
  const essais = await enParallele(chemins, DE_FRONT, async (c) => {
    const r = await lire(c, { per_page: 5, page: 1 });
    const n = Array.isArray(r.corps) ? r.corps.length : (r.corps ? 1 : 0);
    const item = Array.isArray(r.corps) ? r.corps[0] : r.corps;
    const cles = item && typeof item === "object" ? Object.keys(item) : [];
    return { chemin: c.replace(`/events/${ID}`, ""), statut: r.statut, n, cles };
  });
  for (const e of essais) {
    const etat = e.statut === 200 ? `${String(e.n).padStart(3)} él.` : String(e.statut).padStart(7);
    console.log(`  ${e.chemin.padEnd(46)} ${etat}  ${e.cles.slice(0, 12).join(", ").slice(0, 90)}`);
  }
  garde("chemins.json", essais);

  /* --- 4. le programme, qui sait ce que l'API tait ---------------------- */
  titre("4. Le programme, qui affiche les exposants d'une session");

  /* Le programme public range trois rôles sous chaque session — intervenants,
     animateurs, exposants — et sait afficher la société de chacun. La relation
     existe donc dans le produit. Reste à savoir si une adresse la rend. */
  const progs = await toutesPages(`/events/${ID}/programs.json`);
  const roles = [["speakers", "intervenants"], ["moderators", "animateurs"], ["exhibitors", "exposants"]];
  for (const p of progs) {
    console.log(`  ${String(p.name).padEnd(24)} `
      + roles.map(([k, f]) => `${f} ${p[`${k}_information_displayed`] ? "affichés" : "masqués"}`
        + ` « ${p[`${k}_label`] ?? ""} »`).join(", "));
  }
  const p0 = progs[0];
  if (p0) {
    console.log("");
    for (const c of ["", "/sessions", "/speakers", "/exhibitors", "/accesspoints", "/guests"]) {
      const r = await lire(`/events/${ID}/programs/${p0._id}${c}.json`, { per_page: 3, page: 1 });
      console.log(`  /programs/:id${c}.json`.padEnd(38) + ` ${r.statut}`);
    }
  }

  /* --- 5. les inscriptions de session ---------------------------------- */
  titre("5. Les inscriptions de session : assister n'est pas animer");

  /* Une fiche d'invité porte ses « access_privileges » : une entrée par session
     à laquelle elle est inscrite, avec l'intitulé et la salle. C'est le seul
     rattachement invité ↔ session que l'API rende — mais il ne porte aucun
     rôle, et un visiteur qui réserve sa place en reçoit un comme l'intervenant
     qui parle. Compter par catégorie suffit à le montrer. */
  const idsSession = new Set(sessions.map((s) => s._id));
  const inscriptions = [];
  for (const s of sondes) {
    for (const g of s.fiches) {
      for (const a of g.access_privileges ?? []) {
        if (a.type === "session" && idsSession.has(a.accesspoint_id)) inscriptions.push({ cat: s.cat.name, g, a });
      }
    }
  }
  const echantillon = sondes.reduce((n, s) => n + s.fiches.length, 0);
  console.log(`${inscriptions.length} inscriptions de session sur ${echantillon} fiches échantillonnées :`);
  const parCat = new Map();
  for (const i of inscriptions) parCat.set(i.cat, (parCat.get(i.cat) ?? 0) + 1);
  for (const [c, n] of [...parCat].sort((a, b) => b[1] - a[1])) console.log(`  ${c.padEnd(40)} ${n}`);
  const desDeux = inscriptions.filter((i) => champs(i.g.guest_metadata).num_stand).length;
  console.log(`\n${desDeux} de ces inscriptions viennent d'une fiche qui porte un numéro de stand`);

  /* Et le sens inverse n'existe pas : les paramètres qui filtreraient les
     invités par session ne sont pas refusés, ils sont ignorés — la liste
     complète revient, comme si le filtre avait mordu. */
  const cible = inscriptions[0]?.a.accesspoint_id;
  if (cible) {
    console.log("\nfiltrer les invités par session :");
    for (const f of [{ "accesspoint[]": cible }, { accesspoint_id: cible }, { session_id: cible }]) {
      const r = await lire(`/events/${ID}/guests.json`, { ...f, per_page: 100, page: 1 });
      const l = Array.isArray(r.corps) ? r.corps : [];
      const bons = l.filter((g) => (g.access_privileges ?? []).some((a) => a.accesspoint_id === cible)).length;
      console.log(`  ${Object.keys(f)[0].padEnd(20)} ${r.statut}  ${l.length} invités rendus, ${bons} inscrits à la session`);
    }
  }

  /* --- 6. les fiches d'invités ----------------------------------------- */
  titre("6. Ce que les fiches d'invités savent des conférences");

  /* Un intervenant est un invité comme un autre : il a sa catégorie, et
     peut-être un champ qui nomme sa société ou son stand. Symétriquement, la
     fiche d'un exposant peut porter la liste de ses conférences. */
  for (const s of sondes) {
    if (!s.fiches.length) continue;
    const noms = new Set();
    for (const g of s.fiches) Object.keys(champs(g.guest_metadata)).forEach((n) => noms.add(n));
    const parlants = [...noms].filter((n) => INDICES.test(n));
    console.log(`\n  ${s.cat.name} — ${s.fiches.length} fiches, ${noms.size} champs personnalisés`
      + (s.avecStand ? `, ${s.avecStand} avec stand` : ""));
    if (parlants.length) {
      for (const n of parlants.sort()) {
        const ex = s.fiches.map((g) => champs(g.guest_metadata)[n]).find(Boolean);
        console.log(`    ◆ ${n.padEnd(34)} ${apercu(ex ?? "")}`);
      }
    }
  }
  garde("echantillon-invites.json", sondes.map((s) => ({ categorie: s.cat, fiches: s.fiches })));

  /* --- 7. le recoupement, à défaut de lien ------------------------------ */
  titre("7. À défaut d'un lien : le nom de l'exposant dans la session");

  const exposants = [];
  for (const cat of catsExpo) {
    for (const g of await toutesPages(`/events/${ID}/guests.json`,
      { guest_metadata: "true", "category[]": cat._id })) {
      const m = champs(g.guest_metadata);
      const stand = cleStand(m.num_stand);
      const nom = m.enseigne || g.company_name;
      if (stand && nom) exposants.push({ stand, nom, cle: normalise(nom) });
    }
  }
  console.log(`${exposants.length} exposants avec stand et enseigne`);

  /* Une enseigne courte — « AXA », « OVH » — se retrouve par hasard dans
     n'importe quel intitulé : on ne recoupe qu'au-delà de cinq caractères. */
  const cherchables = exposants.filter((e) => e.cle.length >= 6);
  /* « en 2026 », « à 17 h », « de 30 ans » ont la forme d'un numéro de stand et
     n'en sont pas. On ne retient que ceux que la liste des exposants porte
     vraiment — sans quoi la section rend surtout du bruit. */
  const standsConnus = new Set(exposants.map((e) => e.stand));
  const trouves = [];
  for (const s of sessions) {
    const texte = normalise([s.display_name, s.name,
      String(s.description?.html ?? "").replace(/<[^>]+>/g, " "),
      ...Object.values(s.traits ?? {}).map(String)].join(" "));
    const expo = cherchables.filter((e) => texte.includes(e.cle));
    const stands = [...new Set((texte.match(/\b[A-Z]{1,2} ?\d{2,4}\b/g) ?? []))]
      .filter((n) => standsConnus.has(cleStand(n)));
    if (expo.length || stands.length) {
      trouves.push({ session: s.display_name || s.name, exposants: expo.map((e) => `${e.nom} (${e.stand})`), stands });
    }
  }
  console.log(`${trouves.length} sessions sur ${sessions.length} nomment un exposant ou un numéro de stand`);
  for (const t of trouves.slice(0, 20)) {
    console.log(`  · ${String(t.session).slice(0, 46).padEnd(48)} ${[...t.exposants, ...t.stands].join(" | ").slice(0, 70)}`);
  }
  garde("recoupement.json", { exposants, trouves });

  /* --- 8. la route qui répond ------------------------------------------ */
  titre("8. Le programme en GraphQL, qui rend ce que REST tait");

  /* Le site public d'un salon affiche les exposants d'une session ; son
     programme ne passe pas par REST mais par /api/graphql, où chaque session
     porte ses `speakers`, ses `moderators` et ses `exhibitors`. La requête est
     publique — aucun jeton — et l'hôte est indifférent : app.eventmaker.io
     répond comme le domaine du salon.

     Un exposant y vient avec l'identifiant de sa fiche d'invité ; le numéro de
     stand, lui, n'est pas dans le graphe et se relit en REST. C'est la chaîne
     complète : session → exhibitors[].id → fiche → NUM stand → plan. */
  const programmes = await toutesPages(`/events/${ID}/programs.json`);
  const parPersonne = new Map();
  /* Un salon range souvent ses sessions dans plusieurs programmes — un complet,
     des thématiques qui y puisent. On dédoublonne, sinon on compte deux fois. */
  const rattachees = new Map();
  for (const p of programmes) {
    const sess = [];
    for (let curseur = null; ;) {
      const r = await graphql(REQUETE_PROGRAMME, { eventId: ID, id: p._id, cursor: curseur });
      const bloc = r?.data?.publicViewer?.program?.sessions;
      if (!bloc) { console.log(`  ${p.name} : ${JSON.stringify(r?.errors?.[0]?.message ?? r).slice(0, 90)}`); break; }
      sess.push(...bloc.edges.map((e) => e.node));
      if (!bloc.pageInfo.hasNextPage) break;
      curseur = bloc.pageInfo.endCursor;
    }
    if (!sess.length) continue;
    const combien = (k) => sess.filter((s) => s[k]?.length).length;
    console.log(`  ${String(p.name).padEnd(24)} ${String(sess.length).padStart(4)} sessions —`
      + ` ${combien("speakers")} avec intervenants, ${combien("moderators")} avec animateurs,`
      + ` ${combien("exhibitors")} avec exposants`);
    for (const s of sess) {
      for (const r of ROLES) for (const g of s[r] ?? []) parPersonne.set(g.id, { ...g, role: r });
      if (s.exhibitors?.length) rattachees.set(s.id, s);
    }
    garde(`programme-${p._id}.json`, sess);
  }

  /* Le rôle « exposant » vaut-il un stand ? C'est toute la question, et elle se
     tranche en relisant les fiches citées. */
  const cites = [...parPersonne.values()];
  const fiches = new Map(await enParallele(cites, DE_FRONT, async (g) => {
    const r = await lire(`/events/${ID}/guests/${g.id}.json`, { guest_metadata: "true" });
    return [g.id, r.ok ? champs(r.corps.guest_metadata) : null];
  }));
  const parRole = new Map();
  for (const g of cites) {
    const m = fiches.get(g.id);
    const e = parRole.get(g.role) ?? { n: 0, resolus: 0, stand: 0 };
    e.n++; if (m) e.resolus++; if (m?.num_stand) e.stand++;
    parRole.set(g.role, e);
  }
  console.log("");
  for (const [r, e] of parRole) {
    console.log(`  ${r.padEnd(12)} ${String(e.n).padStart(4)} personnes citées,`
      + ` ${e.resolus} fiches retrouvées, ${e.stand} avec un numéro de stand`);
  }

  const auStand = [...rattachees.values()]
    .map((s) => ({ s, stands: [...new Set(s.exhibitors.map((g) => fiches.get(g.id)?.num_stand).filter(Boolean))] }))
    .filter((x) => x.stands.length);
  console.log(`\n${auStand.length} sessions rattachées à un stand, sans recoupement ni approximation`);
  for (const { s, stands } of auStand.slice(0, 20)) {
    console.log(`  · ${String(s.displayName).slice(0, 44).padEnd(46)} `
      + `${s.exhibitors.map((g) => g.companyName).join(", ").slice(0, 30).padEnd(32)} → ${stands.join(" / ")}`);
  }
  garde("rattachements.json", auStand.map(({ s, stands }) => ({
    session: s.id, intitule: s.displayName, salle: s.location, stands,
    exposants: s.exhibitors, intervenants: s.speakers, animateurs: s.moderators,
  })));

  console.log(`\n\nCharges brutes : ${path.relative(process.cwd(), SORTIE)}/`);
})().catch((e) => { console.error(e); process.exit(1); });
