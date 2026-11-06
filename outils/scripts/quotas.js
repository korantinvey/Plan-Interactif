/**
 * La surveillance des quotas Cloudflare et Supabase, chaque heure.
 *
 * Un salon ouvert concentre en quelques heures ce que le reste de l'année
 * étale sur des semaines : un quota franchi en forfait gratuit bloque le
 * Worker (erreur 1027) ou la base, et rien ne le dit avant que les visiteurs
 * ne voient la page tomber. Ce script lit ce qui a été consommé, le compare
 * aux limites du forfait, le projette au rythme actuel, et tient à jour
 * l'issue « Quotas Cloudflare et Supabase ». Le corps de l'issue est réécrit
 * en silence à chaque passage ; un commentaire — donc une notification — n'y
 * est ajouté que lorsqu'un indicateur se dégrade.
 *
 * Ce qui est lu :
 * - Cloudflare, par l'API GraphQL Analytics : requêtes du Worker et
 *   opérations KV, jour par jour depuis le début du mois, et place occupée
 *   dans KV. Les fichiers de `web/` servis sans réveiller le Worker ne
 *   comptent pas : seuls `/api/…` et le manifeste le réveillent.
 * - Supabase, par l'API de gestion : état du projet (le forfait gratuit se met
 *   en pause après une semaine sans activité), forfait de l'organisation,
 *   taille de la base, du stockage, utilisateurs connectés sur trente jours,
 *   et, sur les dernières vingt-quatre heures, appels des fonctions et octets
 *   sortis de la passerelle — une estimation de la sortie (egress), que le
 *   tableau de bord facture au cycle et que l'API ne donne pas.
 *
 * Les limites sont celles publiées par les deux services ; elles changent, et
 * se reprennent ici (`LIMITES`). Les limites quotidiennes de Cloudflare se
 * remettent à zéro à minuit UTC ; les mensuelles se lisent ici au mois civil,
 * que le cycle de facturation ne suit pas tout à fait.
 *
 * Le dépôt est public : l'issue ne donne que des totaux, ni compte ni salon.
 *
 *   npm run quotas                            lit les deux services, publie l'issue
 *   npm run quotas -- --sec                   imprime la fiche, ne publie rien
 *   npm run quotas -- --sec --depuis mesures.json [--au 2026-11-06T14:00:00Z]
 *
 * Lit `CLOUDFLARE_API_TOKEN` (droit « Account Analytics : Read »),
 * `CLOUDFLARE_ACCOUNT_ID`, `SUPABASE_ACCESS_TOKEN`, et `GH_TOKEN` pour `gh`.
 * `CLOUDFLARE_FORFAIT` (`gratuit`, par défaut, ou `payant`) dit le forfait
 * Workers, que le jeton d'analyse ne peut pas lire ; `SUPABASE_FORFAIT`
 * remplace le forfait lu, si l'API ne le donne pas.
 */
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const { PROJETS } = require("../projet.js");

const ETIQUETTE_ISSUE = "quotas";
const TITRE_ISSUE = "Quotas Cloudflare et Supabase";

const Mo = 1024 * 1024;
const Go = 1024 * Mo;

/* Relevées en novembre 2026 sur les pages de tarifs des deux services. En
   forfait payant, Cloudflare facture au-delà au lieu de bloquer ; Supabase
   Pro aussi, sauf si le plafond de dépenses est posé — il l'est par défaut,
   et alors le projet est restreint comme en gratuit. */
const LIMITES = {
  cloudflare: {
    gratuit: {
      periode: "jour", bloquant: true,
      requetes: 100000, lectures: 100000, ecritures: 1000, suppressions: 1000, listes: 1000,
      stockage: 1 * Go,
    },
    payant: {
      periode: "mois", bloquant: false,
      requetes: 10e6, lectures: 10e6, ecritures: 1e6, suppressions: 1e6, listes: 1e6,
      stockage: 1 * Go,
    },
  },
  supabase: {
    free: { bloquant: true, base: 500 * Mo, stockage: 1 * Go, sortie: 5 * Go, utilisateurs: 50000, fonctions: 500000 },
    pro: { bloquant: false, base: 8 * Go, stockage: 100 * Go, sortie: 250 * Go, utilisateurs: 100000, fonctions: 2e6 },
  },
};
// les forfaits au-dessus de Pro en reprennent les quotas inclus
LIMITES.supabase.team = LIMITES.supabase.pro;
LIMITES.supabase.enterprise = LIMITES.supabase.pro;

/* Une part consommée à partir de laquelle on prévient, et une projection à
   partir de laquelle on crie : un quota atteint à 90 % à midi un jour de
   salon l'est à 100 % avant le soir. */
const SEUILS = { attention: 0.7, critique: 0.9, projectionAttention: 0.8, projectionCritique: 1 };

/* Avant deux heures écoulées, une projection sur la journée multiplie le
   moindre pic par douze : elle ne dit rien et ferait crier pour rien. */
const PROJECTION_DES_HEURES = 2;

const RANG = { inconnu: -1, ok: 0, attention: 1, critique: 2 };
const PASTILLE = { ok: "🟢", attention: "🟠", critique: "🔴", inconnu: "⚪" };

/* ------------------------------------------------------------- lecture --- */

const REQUETE_CLOUDFLARE = `
query Quotas($compte: string!, $de: Date!, $a: Date!) {
  viewer {
    accounts(filter: { accountTag: $compte }) {
      workers: workersInvocationsAdaptive(limit: 5000, filter: { date_geq: $de, date_leq: $a }) {
        dimensions { date }
        sum { requests errors }
      }
      kv: kvOperationsAdaptiveGroups(limit: 5000, filter: { date_geq: $de, date_leq: $a }) {
        dimensions { date actionType }
        sum { requests }
      }
      stockage: kvStorageAdaptiveGroups(limit: 1000, filter: { date_geq: $de, date_leq: $a }) {
        dimensions { date namespaceId }
        max { byteCount }
      }
    }
  }
}`;

const ACTIONS_KV = { read: "lectures", write: "ecritures", delete: "suppressions", list: "listes" };

const jourIso = (d) => d.toISOString().slice(0, 10);
const debutDuMois = (d) => jourIso(d).slice(0, 8) + "01";

/** Les rangées de l'API GraphQL ramenées à un jour par rangée. */
function joursCloudflare(compte) {
  const jours = new Map();
  const jour = (date) => {
    if (!jours.has(date)) jours.set(date, { date, requetes: 0, erreurs: 0, lectures: 0, ecritures: 0, suppressions: 0, listes: 0 });
    return jours.get(date);
  };
  for (const r of compte.workers || []) {
    const j = jour(r.dimensions.date);
    j.requetes += r.sum.requests || 0;
    j.erreurs += r.sum.errors || 0;
  }
  for (const r of compte.kv || []) {
    const cle = ACTIONS_KV[r.dimensions.actionType];
    if (cle) jour(r.dimensions.date)[cle] += r.sum.requests || 0;
  }
  // la place occupée : le dernier jour relevé, tous espaces confondus
  const parJour = new Map();
  for (const r of compte.stockage || []) {
    parJour.set(r.dimensions.date, (parJour.get(r.dimensions.date) || 0) + (r.max.byteCount || 0));
  }
  const dernier = [...parJour.keys()].sort().pop();
  return {
    jours: [...jours.values()].sort((a, b) => a.date.localeCompare(b.date)),
    stockageOctets: dernier ? parJour.get(dernier) : null,
  };
}

async function lisCloudflare(maintenant, env = process.env) {
  const jeton = env.CLOUDFLARE_API_TOKEN, compte = env.CLOUDFLARE_ACCOUNT_ID;
  if (!jeton || !compte) return { absent: "CLOUDFLARE_API_TOKEN ou CLOUDFLARE_ACCOUNT_ID manque" };
  const r = await fetch("https://api.cloudflare.com/client/v4/graphql", {
    method: "POST",
    headers: { "Authorization": "Bearer " + jeton, "Content-Type": "application/json" },
    body: JSON.stringify({
      query: REQUETE_CLOUDFLARE,
      variables: { compte, de: debutDuMois(maintenant), a: jourIso(maintenant) },
    }),
  });
  // la réponse brute n'est pas imprimée : un journal de CI se lit hors de l'équipe
  if (!r.ok) return { indisponible: "API Cloudflare refusée (" + r.status + ")" };
  const corps = await r.json();
  if (corps.errors && corps.errors.length) {
    return { indisponible: "API Cloudflare : " + String(corps.errors[0].message || "erreur").slice(0, 120) };
  }
  const c = corps.data && corps.data.viewer && corps.data.viewer.accounts && corps.data.viewer.accounts[0];
  if (!c) return { indisponible: "compte Cloudflare introuvable avec ce jeton" };
  return joursCloudflare(c);
}

const REQUETE_SUPABASE = `
select pg_database_size(current_database())::bigint as base_octets,
       (select coalesce(sum((metadata ->> 'size')::bigint), 0) from storage.objects)::bigint as stockage_octets,
       (select count(*) from auth.users where last_sign_in_at > now() - interval '30 days')::bigint as utilisateurs
`;

/* Les journaux de la plateforme, en SQL BigQuery. La sortie se lit dans les
   en-têtes des réponses de la passerelle : c'est une estimation — une réponse
   compressée ou sans longueur y échappe. */
const JOURNAL_FONCTIONS = "select count(*) as n from function_edge_logs";
const JOURNAL_SORTIE = "select sum(cast(h.content_length as int64)) as octets from edge_logs " +
  "cross join unnest(metadata) as m cross join unnest(m.response) as r cross join unnest(r.headers) as h";

async function lisSupabase(maintenant, env = process.env) {
  const jeton = env.SUPABASE_ACCESS_TOKEN;
  if (!jeton) return { absent: "SUPABASE_ACCESS_TOKEN manque" };
  const ref = env.SUPABASE_PROJECT_REF || new URL(PROJETS.production.url).hostname.split(".")[0];
  const api = "https://api.supabase.com/v1";
  const entetes = { "Authorization": "Bearer " + jeton, "Content-Type": "application/json" };
  const manques = [];
  const lis = async (nom, chemin, options) => {
    try {
      const r = await fetch(api + chemin, { headers: entetes, ...options });
      if (r.ok) return await r.json();
      manques.push(nom + " (" + r.status + ")");
    } catch (e) {
      manques.push(nom + " (" + e.name + ")");
    }
    return null;
  };

  const projet = await lis("projet", "/projects/" + ref);
  if (!projet) return { indisponible: "API de gestion Supabase refusée : " + manques.join(", ") };
  const organisation = projet.organization_id
    ? await lis("organisation", "/organizations/" + projet.organization_id) : null;
  const sql = await lis("base", "/projects/" + ref + "/database/query",
    { method: "POST", body: JSON.stringify({ query: REQUETE_SUPABASE }) });
  const ligne = Array.isArray(sql) ? sql[0] || {} : {};

  const veille = new Date(maintenant.getTime() - 864e5).toISOString();
  const journal = async (nom, requete) => {
    const q = new URLSearchParams({ sql: requete, iso_timestamp_start: veille, iso_timestamp_end: maintenant.toISOString() });
    const r = await lis(nom, "/projects/" + ref + "/analytics/endpoints/logs.all?" + q);
    if (r && r.error) { manques.push(nom); return null; }
    return r && Array.isArray(r.result) && r.result[0] ? r.result[0] : null;
  };
  const fonctions = await journal("journal des fonctions", JOURNAL_FONCTIONS);
  const sortie = await journal("journal de la passerelle", JOURNAL_SORTIE);

  const nombre = (v) => v == null || v === "" || !isFinite(Number(v)) ? null : Number(v);
  return {
    statut: projet.status || null,
    forfait: env.SUPABASE_FORFAIT || (organisation && organisation.plan) || null,
    baseOctets: nombre(ligne.base_octets),
    stockageOctets: nombre(ligne.stockage_octets),
    utilisateurs: nombre(ligne.utilisateurs),
    fonctions24h: fonctions ? nombre(fonctions.n) : null,
    sortie24hOctets: sortie ? nombre(sortie.octets) : null,
    manques,
  };
}

/* -------------------------------------------------------------- bilan --- */

function niveau(part, projection) {
  if (part == null && projection == null) return "inconnu";
  if ((part ?? 0) >= SEUILS.critique || (projection ?? 0) >= SEUILS.projectionCritique) return "critique";
  if ((part ?? 0) >= SEUILS.attention || (projection ?? 0) >= SEUILS.projectionAttention) return "attention";
  return "ok";
}

/** Une ligne de la fiche : ce qui est consommé, la limite, et où l'on va. */
function ligne(o) {
  const part = o.utilise != null && o.limite ? o.utilise / o.limite : null;
  const partProjetee = o.projection != null && o.limite ? o.projection / o.limite : null;
  return { ...o, part, partProjetee, niveau: o.niveau || niveau(part, partProjetee) };
}

const LIBELLES_CLOUDFLARE = {
  requetes: "Worker — requêtes", lectures: "KV — lectures", ecritures: "KV — écritures",
  suppressions: "KV — suppressions", listes: "KV — listes",
};

function lignesCloudflare(cf, forfait, maintenant) {
  if (!cf || cf.absent || cf.indisponible) {
    return [ligne({ cle: "cloudflare", service: "Cloudflare", libelle: "Cloudflare", niveau: "inconnu",
                    note: (cf && (cf.absent || cf.indisponible)) || "non lu" })];
  }
  const lim = LIMITES.cloudflare[forfait] || LIMITES.cloudflare.gratuit;
  const aujourdhui = jourIso(maintenant);
  const minuit = Date.parse(aujourdhui + "T00:00:00Z");
  const heures = (maintenant.getTime() - minuit) / 36e5;
  const duJour = cf.jours.find((j) => j.date === aujourdhui) || {};
  const lignes = [];
  for (const cle of Object.keys(LIBELLES_CLOUDFLARE)) {
    let utilise, projection = null, pire = null;
    if (lim.periode === "jour") {
      utilise = duJour[cle] || 0;
      if (heures >= PROJECTION_DES_HEURES) projection = utilise * 24 / heures;
      // le jour le plus chargé du mois, hors aujourd'hui : la marge qu'on a eue
      const passes = cf.jours.filter((j) => j.date !== aujourdhui);
      if (passes.length) pire = Math.max(...passes.map((j) => j[cle] || 0));
    } else {
      utilise = cf.jours.reduce((t, j) => t + (j[cle] || 0), 0);
      const fin = new Date(Date.UTC(maintenant.getUTCFullYear(), maintenant.getUTCMonth() + 1, 1));
      const debut = Date.UTC(maintenant.getUTCFullYear(), maintenant.getUTCMonth(), 1);
      const ecoules = (maintenant.getTime() - debut) / 864e5;
      if (ecoules >= 1) projection = utilise * ((fin.getTime() - debut) / 864e5) / ecoules;
    }
    lignes.push(ligne({
      cle: "cloudflare." + cle, service: "Cloudflare", libelle: LIBELLES_CLOUDFLARE[cle],
      periode: lim.periode, unite: "nombre", utilise, limite: lim[cle], projection, pire,
      bloquant: lim.bloquant,
      note: cle === "requetes" && duJour.erreurs ? duJour.erreurs + " en erreur aujourd'hui" : "",
    }));
  }
  lignes.push(ligne({
    cle: "cloudflare.stockage", service: "Cloudflare", libelle: "KV — place occupée",
    periode: "instant", unite: "octets", utilise: cf.stockageOctets, limite: lim.stockage, bloquant: lim.bloquant,
  }));
  return lignes;
}

function lignesSupabase(sb) {
  if (!sb || sb.absent || sb.indisponible) {
    return [ligne({ cle: "supabase", service: "Supabase", libelle: "Supabase", niveau: "inconnu",
                    note: (sb && (sb.absent || sb.indisponible)) || "non lu" })];
  }
  const forfait = String(sb.forfait || "free").toLowerCase();
  const lim = LIMITES.supabase[forfait] || LIMITES.supabase.free;
  const lignes = [];
  const sain = sb.statut === "ACTIVE_HEALTHY";
  lignes.push(ligne({
    cle: "supabase.etat", service: "Supabase", libelle: "Projet — état",
    niveau: sb.statut == null ? "inconnu" : sain ? "ok" : "critique",
    note: (sb.statut || "inconnu") + (sain ? "" : " : le plan ne charge plus ses données"),
  }));
  lignes.push(ligne({
    cle: "supabase.forfait", service: "Supabase", libelle: "Forfait",
    niveau: forfait === "free" ? "attention" : "ok",
    note: forfait === "free"
      ? "gratuit : pause après une semaine sans activité, quotas bloquants — passer au Pro avant l'ouverture"
      : forfait,
  }));
  const instant = (cle, libelle, utilise, limite) => lignes.push(ligne({
    cle: "supabase." + cle, service: "Supabase", libelle, periode: "instant",
    unite: cle === "utilisateurs" ? "nombre" : "octets", utilise, limite, bloquant: lim.bloquant,
  }));
  instant("base", "Base — taille", sb.baseOctets, lim.base);
  instant("stockage", "Stockage — taille", sb.stockageOctets, lim.stockage);
  instant("utilisateurs", "Comptes actifs (30 jours)", sb.utilisateurs, lim.utilisateurs);
  /* Ces deux-là ne se lisent que sur vingt-quatre heures : on ne sait pas ce
     que le cycle a déjà consommé, seulement où mène le rythme du jour. */
  const rythme = (cle, libelle, sur24h, limite, unite) => lignes.push(ligne({
    cle: "supabase." + cle, service: "Supabase", libelle, periode: "rythme", unite,
    utilise: null, sur24h, projection: sur24h == null ? null : sur24h * 30, limite, bloquant: lim.bloquant,
  }));
  rythme("fonctions", "Fonctions — appels", sb.fonctions24h, lim.fonctions, "nombre");
  rythme("sortie", "Sortie (egress), estimée", sb.sortie24hOctets, lim.sortie, "octets");
  return lignes;
}

/** Toutes les lignes, des deux services, à l'heure donnée. */
function bilan(mesures, { forfaitCloudflare = "gratuit" } = {}, maintenant = new Date()) {
  return {
    au: maintenant.toISOString(),
    forfaitCloudflare,
    lignes: [
      ...lignesCloudflare(mesures.cloudflare, forfaitCloudflare, maintenant),
      ...lignesSupabase(mesures.supabase),
    ],
    manques: (mesures.supabase && mesures.supabase.manques) || [],
  };
}

/* -------------------------------------------------------------- fiche --- */

function quantite(v, unite) {
  if (v == null) return "—";
  if (unite === "octets") {
    if (v >= Go) return (v / Go).toFixed(2).replace(".", ",") + " Go";
    if (v >= Mo) return (v / Mo).toFixed(1).replace(".", ",") + " Mo";
    return Math.round(v / 1024) + " ko";
  }
  return Math.round(v).toLocaleString("fr-FR").replace(/[\u202f\u00a0]/g, " ");
}
const pourcent = (p) => p == null ? "—" : Math.round(p * 100) + " %";
const PERIODES = { jour: "aujourd'hui (UTC)", mois: "ce mois-ci", rythme: "sur 30 jours", instant: "maintenant" };

/* L'état de la dernière fiche, caché dans l'issue : de quoi savoir, au
   passage suivant, ce qui s'est dégradé — sans rien garder ailleurs. */
const MARQUE_ETAT = /<!-- niveaux: (\{.*?\}) -->/;
const niveauxDe = (b) => Object.fromEntries(b.lignes.map((l) => [l.cle, l.niveau]));

function niveauxPrecedents(texte) {
  const m = MARQUE_ETAT.exec(texte || "");
  try { return m ? JSON.parse(m[1]) : {}; } catch { return {}; }
}

/** Les lignes qui ont monté d'un cran depuis la dernière fiche. */
function degradations(b, avant) {
  return b.lignes.filter((l) => RANG[l.niveau] > Math.max(0, RANG[avant[l.cle]] ?? 0));
}

function corps(b) {
  const pire = b.lignes.reduce((p, l) => RANG[l.niveau] > RANG[p] ? l.niveau : p, "ok");
  const l = [];
  l.push(PASTILLE[pire] + " **" + ({ ok: "Tout est dans les quotas.", attention: "Un quota approche.",
    critique: "Un quota est atteint ou le sera au rythme actuel.", inconnu: "" })[pire] + "**");
  l.push("");
  l.push("Relevé du " + b.au.slice(0, 16).replace("T", " à ") + " UTC. Forfait Workers déclaré : " +
    b.forfaitCloudflare + ".");
  l.push("");
  l.push("| | mesure | période | consommé | limite | part | au rythme actuel | remarque |");
  l.push("|---|---|---|---:|---:|---:|---:|---|");
  for (const x of b.lignes) {
    const rythme = x.projection == null ? "—"
      : quantite(x.projection, x.unite) + " (" + pourcent(x.partProjetee) + ")";
    const consomme = x.sur24h != null ? quantite(x.sur24h, x.unite) + " en 24 h" : quantite(x.utilise, x.unite);
    const notes = [x.note, x.pire != null ? "pire jour du mois : " + quantite(x.pire, x.unite) : "",
      x.bloquant === false && x.limite ? "facturé au-delà" : ""].filter(Boolean).join(" ; ");
    l.push("| " + PASTILLE[x.niveau] + " | " + x.libelle + " | " + (PERIODES[x.periode] || "") + " | " + consomme +
      " | " + (x.limite ? quantite(x.limite, x.unite) : "—") + " | " + pourcent(x.part) + " | " + rythme + " | " + notes + " |");
  }
  if (b.manques.length) {
    l.push("");
    l.push("Non lu côté Supabase : " + b.manques.join(", ") + ".");
  }
  l.push("");
  l.push("<sub>🟠 dès " + pourcent(SEUILS.attention) + " consommés ou " + pourcent(SEUILS.projectionAttention) +
    " au rythme actuel ; 🔴 dès " + pourcent(SEUILS.critique) + " ou " + pourcent(SEUILS.projectionCritique) +
    ". Le rythme d'une journée se projette sur vingt-quatre heures après " + PROJECTION_DES_HEURES +
    " h ; celui de Supabase, sur trente jours. Limites et seuils : `outils/scripts/quotas.js`.</sub>");
  l.push("");
  l.push("<!-- niveaux: " + JSON.stringify(niveauxDe(b)) + " -->");
  return l.join("\n") + "\n";
}

function alerte(lignes) {
  return "Ça se dégrade :\n\n" + lignes.map((x) => "- " + PASTILLE[x.niveau] + " **" + x.libelle + "** — " +
    (x.part != null ? pourcent(x.part) + " consommés" : x.partProjetee != null ? pourcent(x.partProjetee) +
      " au rythme actuel" : x.note || x.niveau)).join("\n") + "\n";
}

/* ---------------------------------------------------------- publication --- */

function publie(b) {
  const gh = (...args) => execFileSync("gh", args, { encoding: "utf8" });
  const dossier = fs.mkdtempSync(path.join(os.tmpdir(), "quotas-"));
  const fichier = path.join(dossier, "fiche.md");
  fs.writeFileSync(fichier, corps(b));
  gh("label", "create", ETIQUETTE_ISSUE, "--force", "--color", "d93f0b",
     "--description", "Consommation des quotas Cloudflare et Supabase");
  const issues = JSON.parse(gh("issue", "list", "--label", ETIQUETTE_ISSUE, "--state", "open",
    "--limit", "20", "--json", "number,title,body"));
  const deja = issues.find((x) => x.title === TITRE_ISSUE);
  if (!deja) {
    console.log(gh("issue", "create", "--title", TITRE_ISSUE, "--label", ETIQUETTE_ISSUE, "--body-file", fichier).trim());
    return;
  }
  const pires = degradations(b, niveauxPrecedents(deja.body));
  gh("issue", "edit", String(deja.number), "--body-file", fichier);
  if (pires.length) {
    const f = path.join(dossier, "alerte.md");
    fs.writeFileSync(f, alerte(pires));
    gh("issue", "comment", String(deja.number), "--body-file", f);
  }
  console.log("Issue #" + deja.number + " mise à jour" + (pires.length ? ", alerte ajoutée." : "."));
}

async function principal(argv, env = process.env) {
  const sec = argv.includes("--sec");
  const valeur = (nom) => { const i = argv.indexOf(nom); return i >= 0 ? argv[i + 1] : null; };
  const maintenant = valeur("--au") ? new Date(valeur("--au")) : new Date();
  const depuis = valeur("--depuis");
  const mesures = depuis ? JSON.parse(fs.readFileSync(depuis, "utf8"))
    : { cloudflare: await lisCloudflare(maintenant, env), supabase: await lisSupabase(maintenant, env) };
  const b = bilan(mesures, { forfaitCloudflare: env.CLOUDFLARE_FORFAIT || "gratuit" }, maintenant);
  if (sec) console.log("# " + TITRE_ISSUE + "\n\n" + corps(b));
  else publie(b);
  /* Un secret absent se dit dans l'issue et en avertissement ; une API qui
     refuse fait échouer le passage, pour que l'échec arrive par courriel :
     une surveillance muette ne surveille rien. */
  for (const [nom, m] of Object.entries(mesures)) {
    if (m && m.absent) console.log("::warning::" + nom + " non mesuré : " + m.absent);
  }
  const panne = Object.entries(mesures).filter(([, m]) => m && m.indisponible);
  if (panne.length) throw new Error(panne.map(([nom, m]) => nom + " : " + m.indisponible).join(" ; "));
}

if (require.main === module) {
  principal(process.argv.slice(2)).catch((e) => { console.error(e.message); process.exit(1); });
}

module.exports = { LIMITES, SEUILS, joursCloudflare, bilan, corps, alerte, degradations, niveauxPrecedents, REQUETE_CLOUDFLARE };
