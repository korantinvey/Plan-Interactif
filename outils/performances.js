/**
 * La fiche de pistes hebdomadaire : ce que la sonde a relevé cette semaine,
 * traduit en pistes classées par gain.
 *
 *   npm run performances                      lit la base, publie l'issue de la semaine
 *   npm run performances -- --sec             l'imprime sans rien publier
 *   npm run performances -- --depuis f.json   lit des relevés dans un fichier (essai, sans jeton)
 *
 * Le script lit la base par l'API de gestion Supabase (`SUPABASE_ACCESS_TOKEN`,
 * déjà secret du dépôt pour `supabase.yml`) : les relevés détaillés ne sont
 * lisibles que par les comptes, et la fiche regarde tous les salons ensemble.
 * Il calcule les indicateurs des sept derniers jours pleins par page × appareil,
 * les met en regard de la semaine d'avant (les bilans quotidiens, qui survivent
 * aux relevés purgés à 30 jours) et de la version des pages, puis applique la
 * table de règles de `performances-regles.js`.
 *
 * Le dépôt est public, donc l'issue aussi : AUCUN slug, aucun nom de salon,
 * aucun identifiant. Un salon y est `salon-` + les 4 premiers caractères du
 * md5 de son identifiant — stable d'une semaine à l'autre, que l'exploitant
 * retrouve en refaisant le calcul dans la base. Les requêtes ne ramènent que
 * cette étiquette, jamais le slug ; et un fichier lourd est nommé sans sa
 * requête ni ce qui suit `/api/…`, où se glisserait un slug.
 *
 * Une semaine sans relevé ne publie rien : une issue vide chaque lundi ferait
 * du bruit sans rien apprendre, et l'absence se lit dans le journal du
 * workflow. Le titre porte le lundi de la semaine en cours : une relance en
 * milieu de semaine retrouve la même issue et la met à jour.
 */
const fs = require("fs");
const crypto = require("crypto");
const { execFileSync } = require("child_process");
const { PROJETS } = require("./projet.js");
const { pistes } = require("./performances-regles.js");

const JOURS_FICHE = 7;
/* Une version n'est comparée à la précédente qu'avec assez de visites des deux
   côtés, et si l'écart dépasse le bruit — provisoires, comme les seuils. */
const VISITES_PAR_VERSION = 5;
/* la part d'images lentes est déjà un pourcentage (0-100) : `part` est en points */
const DEGRADATION = { relatif: 0.2, ms: 200, part: 3 };

/* ---------- Petits outils ---------- */

/** `salon-` + 4 premiers caractères du md5 de l'identifiant : le même calcul que la requête SQL. */
function etiquette(evenementId) {
  return "salon-" + crypto.createHash("md5").update(String(evenementId)).digest("hex").slice(0, 4);
}

const num = (x) => (x == null || x === "" || !Number.isFinite(Number(x)) ? null : Number(x));
const ajoute = (iso, n) => {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const jourDe = (x) => String(x).slice(0, 10);

/** Le lundi de la semaine qui contient ce jour (AAAA-MM-JJ). */
function lundiDe(iso) {
  const d = new Date(iso + "T00:00:00Z");
  return ajoute(iso, -((d.getUTCDay() + 6) % 7));
}

/** Centile à interpolation linéaire, comme `percentile_cont` de la base. */
function centile(valeurs, p) {
  const v = valeurs.map(num).filter((x) => x != null).sort((a, b) => a - b);
  if (!v.length) return null;
  const r = (v.length - 1) * p, i = Math.floor(r);
  return i + 1 < v.length ? v[i] + (v[i + 1] - v[i]) * (r - i) : v[i];
}

/**
 * Tout texte venu d'un relevé est écrit par un visiteur anonyme (la clé qui
 * ouvre la porte circule dans chaque page) : on n'en garde que lettres,
 * chiffres, espace et `._·+()-`, sur 60 caractères. Sans `/ @ # [ ] ! < > |`
 * ni apostrophe inverse, rien ne s'y lit comme un lien, une mention, une
 * image ou une cellule de tableau.
 */
function texteSur(s) {
  return String(s == null ? "" : s).normalize("NFC").replace(/[^\p{L}\p{N} ._·+()-]/gu, "").replace(/\s+/g, " ").trim().slice(0, 60);
}

/* Les fichiers que la page nomme dans `lourds` sont ses derniers segments de chemin
   (`mesures-page.mjs`) : un nom libre — logo de stand, domaine tiers, `plan-<slug>` —
   peut porter un slug. On ne cite donc par leur nom que les fichiers versionnés de nos
   pages (point d'entrée + empreinte, tels que la construction les pose sous
   `web/versions/`) et quelques noms connus ; tout le reste est regroupé par extension. */
const ENTREES = "plan|plan-admin|anglais|langue|console|rapport|motdepasse|accueil";
const FICHIER_VERSIONNE = new RegExp("^(" + ENTREES + ")\\.[0-9a-f]{8,}\\.(js|css)$");
const FICHIER_CONNU = new Set(["plan", "config.js", "sw.js"]);
const EXTENSIONS = new Set(["js", "css", "json", "html", "svg", "png", "jpg", "jpeg", "webp", "avif", "gif", "woff", "woff2", "mp4"]);

function fichierPropre(f) {
  const nom = String(f || "").split(/[?#]/)[0].split("/").pop();
  if (FICHIER_VERSIONNE.test(nom) || FICHIER_CONNU.has(nom)) return nom;
  const ext = /\.([A-Za-z0-9]{1,5})$/.exec(nom);
  const e = ext && ext[1].toLowerCase();
  return e && EXTENSIONS.has(e) ? "autre fichier ." + e : "autre fichier";
}

/* ---------- La lecture ---------- */

function leJour(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) throw new Error("date invalide : " + iso);
  return iso;
}

/** Les deux requêtes de lecture : 14 jours de relevés, 14 jours de bilans. */
function requetes(aujourdhui) {
  const j = leJour(aujourdhui);
  // ce qui ne sert qu'aux indicateurs de la semaine n'est lu que pour elle
  const sem = "jour >= '" + j + "'::date - " + JOURS_FICHE;
  const fenetre = "jour >= '" + j + "'::date - 14 and jour <= '" + j + "'::date";
  const salon = "'salon-' || left(md5(evenement_id::text), 4)";
  return [
    "select " + salon + " as salon, jour::text as jour, page, version, coalesce(mobile, false) as mobile,\n" +
    "  coalesce(immersif, false) as immersif, affiche_ms, donnees_ms,\n" +
    "  part_plus33_classique, part_plus33_immersif,\n" +
    "  case when " + sem + " then repeint_ms_p95 end as repeint_ms_p95,\n" +
    "  case when " + sem + " then gpu_ms_p95 end as gpu_ms_p95,\n" +
    "  case when " + sem + " then pertes_contexte end as pertes_contexte,\n" +
    "  case when " + sem + " then resume #>> '{appareil,systeme}' end as systeme,\n" +
    "  case when " + sem + " then nullif(trim(concat_ws(' ', resume #>> '{appareil,carte,fabricant}', resume #>> '{appareil,carte,puce}')), '') end as carte,\n" +
    "  case when " + sem + " then sonde_nombre(resume #> '{gpu,logos,octetsTexture}') end as logos_octets,\n" +
    "  case when " + sem + " and jsonb_typeof(resume #> '{chargement,lourds}') = 'array' then resume #> '{chargement,lourds}' end as lourds\n" +
    "from releve_perf where " + fenetre + " order by jour",
    "select " + salon + " as salon, jour::text as jour, page, mobile, visites, affiche_p50, donnees_p50,\n" +
    "  part_plus33_p50, gels_moy, pertes_contexte\n" +
    "from perf_bilan where " + fenetre + " order by jour",
  ];
}

async function interroge(ref, jeton, query) {
  const r = await fetch("https://api.supabase.com/v1/projects/" + ref + "/database/query", {
    method: "POST",
    headers: { Authorization: "Bearer " + jeton, "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const texte = await r.text();
  if (!r.ok) {
    // le statut et le message, pas la réponse brute
    let message = "";
    try { message = String(JSON.parse(texte).message || ""); } catch (e) { /* pas du JSON */ }
    throw new Error("API de gestion Supabase : " + r.status + (message ? " " + message.slice(0, 200) : ""));
  }
  const lignes = JSON.parse(texte);
  if (!Array.isArray(lignes)) throw new Error("réponse inattendue de l'API de gestion Supabase");
  return lignes;
}

/** Une ligne lue en base ou dans un fichier, ramenée à sa forme plate ; l'étiquette du salon vient de l'identifiant si la ligne n'en porte pas. */
function normalise(l) {
  return Object.assign({}, l, { salon: l.salon || etiquette(l.evenement_id), jour: jourDe(l.jour), mobile: !!l.mobile });
}

/* ---------- Les indicateurs ---------- */

function lourdsDe(rows) {
  const parFichier = new Map();
  for (const r of rows) {
    const vus = new Set();
    for (const l of Array.isArray(r.lourds) ? r.lourds : []) {
      const f = fichierPropre(l && l.fichier);
      if (!f || vus.has(f)) continue;
      vus.add(f);
      if (!parFichier.has(f)) parFichier.set(f, []);
      parFichier.get(f).push(num(l.transfertKo));
    }
  }
  return [...parFichier].map(([fichier, kos]) => ({
    fichier, visites: kos.length, part: kos.length / rows.length, koP50: centile(kos, 0.5) || 0,
  })).sort((a, b) => b.part - a.part || b.koP50 - a.koP50).slice(0, 5);
}

function famillesDe(rows) {
  const m = new Map();
  for (const r of rows) {
    const nom = [texteSur(r.systeme), texteSur(r.carte)].filter(Boolean).join(" · ") || "appareil inconnu";
    const f = m.get(nom) || { famille: nom, visites: 0, avecPerte: 0 };
    f.visites++;
    if ((num(r.pertes_contexte) || 0) > 0) f.avecPerte++;
    m.set(nom, f);
  }
  return [...m.values()];
}

/** La part d'images lentes de la vue réellement utilisée par la visite. */
const partVue = (r) => num(r.immersif && r.part_plus33_immersif != null ? r.part_plus33_immersif : r.part_plus33_classique);

/** Les indicateurs d'un groupe de visites (une page sur un type d'appareil). */
function indicateursDe(page, mobile, rows) {
  const immersifs = rows.filter((r) => r.immersif);
  const salons = new Map();
  for (const r of rows) salons.set(r.salon, (salons.get(r.salon) || 0) + 1);
  return {
    page, mobile, visites: rows.length, nImmersif: immersifs.length,
    donneesP50: centile(rows.map((r) => r.donnees_ms), 0.5),
    preparationP50: centile(rows.filter((r) => num(r.affiche_ms) != null && num(r.donnees_ms) != null).map((r) => r.affiche_ms - r.donnees_ms), 0.5),
    afficheP50: centile(rows.map((r) => r.affiche_ms), 0.5),
    afficheP90: centile(rows.map((r) => r.affiche_ms), 0.9),
    partP50: centile(rows.map(partVue), 0.5),
    partClassique: centile(rows.map((r) => r.part_plus33_classique), 0.5),
    partImmersif: centile(immersifs.map((r) => r.part_plus33_immersif), 0.5),
    repeintP95: centile(rows.map((r) => r.repeint_ms_p95), 0.95),
    gpuP95: centile(rows.map((r) => r.gpu_ms_p95), 0.95),
    logosMoP50: (() => { const c = centile(rows.map((r) => r.logos_octets), 0.5); return c == null ? null : c / 1048576; })(),
    lourds: lourdsDe(rows),
    familles: famillesDe(rows),
    salons: [...salons].map(([salon, visites]) => ({ salon, visites })).sort((a, b) => b.visites - a.visites || (a.salon < b.salon ? -1 : 1)),
  };
}

/** Les groupes page × appareil d'un ensemble de visites. */
function indicateurs(releves) {
  const g = new Map();
  for (const r of releves) {
    const k = r.page + "|" + r.mobile;
    if (!g.has(k)) g.set(k, []);
    g.get(k).push(r);
  }
  return [...g].map(([k, rows]) => indicateursDe(rows[0].page, rows[0].mobile, rows))
    .sort((a, b) => (a.page < b.page ? -1 : a.page > b.page ? 1 : (b.mobile ? 1 : 0) - (a.mobile ? 1 : 0)));
}

/** Là où un indicateur se dégrade d'une version des pages à la suivante, avec les deux versions. */
function degradations(releves) {
  const lignes = [];
  const g = new Map();
  for (const r of releves) {
    const k = r.page + "|" + r.mobile;
    if (!g.has(k)) g.set(k, new Map());
    const v = g.get(k);
    const nom = texteSur(r.version) || "(sans version)";
    if (!v.has(nom)) v.set(nom, []);
    v.get(nom).push(r);
  }
  for (const [k, versions] of g) {
    const [page, mobile] = k.split("|");
    const suite = [...versions].map(([nom, rows]) => ({ nom, rows, debut: rows.map((r) => r.jour).sort()[0] }))
      .filter((v) => v.rows.length >= VISITES_PAR_VERSION)
      .sort((a, b) => (a.debut < b.debut ? -1 : a.debut > b.debut ? 1 : a.nom < b.nom ? -1 : 1));
    for (let i = 1; i < suite.length; i++) {
      const A = suite[i - 1], B = suite[i], causes = [];
      const mesures = [
        ["affichage", (r) => r.affiche_ms, "ms", DEGRADATION.ms],
        ["données", (r) => r.donnees_ms, "ms", DEGRADATION.ms],
        ["images lentes", partVue, "%", DEGRADATION.part],
      ];
      for (const [nom, lit, unite, plancher] of mesures) {
        const a = centile(A.rows.map(lit), 0.5), b = centile(B.rows.map(lit), 0.5);
        if (a == null || b == null || b - a < plancher || b < a * (1 + DEGRADATION.relatif)) continue;
        const f = unite === "%" ? (x) => Math.round(x) : (x) => Math.round(x);
        causes.push(nom + " " + f(a) + " → " + f(b) + " " + unite);
      }
      if (causes.length) {
        lignes.push("- " + page + ", " + (mobile === "true" ? "téléphone" : "ordinateur") + " : version " + A.nom + " → version " + B.nom + " — " + causes.join(", "));
      }
    }
  }
  return lignes;
}

/** Les bilans d'une semaine, pondérés par les visites : la médiane des médianes quotidiennes, faute de mieux. */
function bilanSemaine(bilans, de, a) {
  const g = new Map();
  for (const b of bilans) {
    if (b.jour < de || b.jour > a) continue;
    const k = b.page + "|" + b.mobile;
    const c = g.get(k) || { visites: 0, pertes: 0, mesures: {} };
    const w = num(b.visites) || 0;
    c.visites += w;
    c.pertes += num(b.pertes_contexte) || 0;
    for (const m of ["affiche_p50", "donnees_p50", "part_plus33_p50", "gels_moy"]) {
      const x = num(b[m]);
      if (x == null || !w) continue;
      const s = c.mesures[m] || (c.mesures[m] = { somme: 0, poids: 0 });
      s.somme += x * w; s.poids += w;
    }
    g.set(k, c);
  }
  const sortie = new Map();
  for (const [k, c] of g) {
    const m = {};
    for (const [nom, s] of Object.entries(c.mesures)) m[nom] = s.somme / s.poids;
    sortie.set(k, { visites: c.visites, pertes: c.pertes, ...m });
  }
  return sortie;
}

/* ---------- Le corps de l'issue ---------- */

const ms = (x) => (x == null ? "—" : Math.round(x) + " ms");
/* déjà un pourcentage : la sonde donne la part d'images lentes sur 0-100 */
const pc = (x) => (x == null ? "—" : Math.round(x) + " %");

function variation(avant, apres) {
  if (avant == null || apres == null || avant === 0) return "";
  const v = Math.round((apres / avant - 1) * 100);
  return " (" + (v > 0 ? "+" : "") + v + " %)";
}

/**
 * Construit la fiche à partir de relevés et de bilans (lignes plates).
 * @returns {{ titre: string, corps: string, vide: boolean }}
 */
function fiche({ releves, bilans, aujourdhui }) {
  const tous = (releves || []).map(normalise);
  const bil = (bilans || []).map(normalise);
  const fin = ajoute(aujourdhui, -1), debut = ajoute(aujourdhui, -JOURS_FICHE);
  const avantFin = ajoute(debut, -1), avantDebut = ajoute(debut, -JOURS_FICHE);
  const semaine = tous.filter((r) => r.jour >= debut && r.jour <= fin);
  const titre = "Performances — semaine du " + lundiDe(aujourdhui);
  if (!semaine.length) {
    return { titre, vide: true, corps: "Aucun relevé du " + debut + " au " + fin + " : rien à analyser cette semaine." };
  }
  const inds = indicateurs(semaine);
  const salons = new Map();
  for (const r of semaine) salons.set(r.salon, (salons.get(r.salon) || 0) + 1);
  const avant = bilanSemaine(bil, avantDebut, avantFin);

  const L = [];
  L.push("Semaine analysée : du " + debut + " au " + fin + " (les sept jours pleins avant le " + aujourdhui + "), **" + semaine.length + " visites**, " + salons.size + " salon(s). Le titre porte le lundi de la semaine en cours : c'est la clé qui fait retrouver cette issue si le script est relancé.");
  L.push("");
  L.push("## Pistes, classées par gain");
  L.push("");
  const p = pistes(inds);
  if (!p.length) L.push("Aucune piste cette semaine : rien ne dépasse les seuils.");
  p.forEach((x, i) => {
    L.push((i + 1) + ". **" + x.titre + "** — " + x.detail + ".");
    L.push("   Levier : " + x.levier + " (gain estimé " + Math.round(x.gain) + ")");
  });
  L.push("");
  L.push("## D'une version des pages à l'autre");
  L.push("");
  const d = degradations(tous);
  if (d.length) L.push(...d); else L.push("Aucun indicateur ne se dégrade d'une version à l'autre.");
  L.push("");
  L.push("## Cette semaine, par page");
  L.push("");
  L.push("| page | appareil | visites | données (médiane) | affichage (médiane) | images lentes (classique) | images lentes (immersif) | affichage, semaine d'avant | données, semaine d'avant | images lentes, semaine d'avant |");
  L.push("|---|---|---|---|---|---|---|---|---|---|");
  for (const i of inds) {
    const b = avant.get(i.page + "|" + i.mobile);
    L.push("| " + i.page + " | " + (i.mobile ? "téléphone" : "ordinateur") + " | " + i.visites + " | " + ms(i.donneesP50) +
      " | " + ms(i.afficheP50) + " | " + pc(i.partClassique) + " | " + (i.nImmersif ? pc(i.partImmersif) + " (" + i.nImmersif + ")" : "—") +
      " | " + (b && b.affiche_p50 != null ? ms(b.affiche_p50) + variation(b.affiche_p50, i.afficheP50) : "—") +
      " | " + (b && b.donnees_p50 != null ? ms(b.donnees_p50) + variation(b.donnees_p50, i.donneesP50) : "—") +
      " | " + (b && b.part_plus33_p50 != null ? pc(b.part_plus33_p50) + variation(b.part_plus33_p50, i.partP50) : "—") + " |");
  }
  L.push("");
  L.push("## Salons relevés");
  L.push("");
  for (const [s, n] of [...salons].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))) L.push("- " + s + " : " + n + " visite(s)");
  L.push("");
  L.push("*Un salon est nommé `salon-` suivi des 4 premiers caractères de `md5(evenement_id)` : refaites le calcul dans la base pour le retrouver. Les seuils des règles sont provisoires (`outils/performances-regles.js`) ; la semaine d'avant vient des bilans quotidiens (médianes pondérées par les visites).*");
  return { titre, vide: false, corps: L.join("\n") };
}

/* ---------- La publication ---------- */

function gh(args, input) {
  return execFileSync("gh", args, { input, encoding: "utf8", stdio: ["pipe", "pipe", "inherit"] });
}

function publie(titre, corps, depot) {
  const R = ["--repo", depot];
  // créée si absente seulement : une couleur ou une description retouchées à la main restent
  const libelles = JSON.parse(gh(["label", "list", ...R, "--search", "performances", "--json", "name"]));
  if (!libelles.some((l) => l.name === "performances")) {
    gh(["label", "create", "performances", ...R, "--description", "Fiche hebdomadaire de pistes de performance", "--color", "1d76db"]);
  }
  const existantes = JSON.parse(gh(["issue", "list", ...R, "--label", "performances", "--state", "all", "--limit", "100", "--json", "number,title"]));
  const deja = existantes.find((i) => i.title === titre);
  if (deja) {
    gh(["issue", "edit", String(deja.number), ...R, "--body-file", "-"], corps);
    console.log("Issue #" + deja.number + " mise à jour.");
  } else {
    const url = gh(["issue", "create", ...R, "--title", titre, "--label", "performances", "--body-file", "-"], corps);
    console.log("Issue créée : " + url.trim());
  }
}

/* ---------- L'exécution ---------- */

async function principal(argv) {
  const sec = argv.includes("--sec");
  const i = argv.indexOf("--depuis");
  let donnees, aujourdhui = new Date().toISOString().slice(0, 10);
  if (i >= 0) {
    if (!argv[i + 1]) throw new Error("--depuis demande un fichier");
    donnees = JSON.parse(fs.readFileSync(argv[i + 1], "utf8"));
    if (donnees.aujourdhui) aujourdhui = donnees.aujourdhui;
  } else {
    const jeton = process.env.SUPABASE_ACCESS_TOKEN;
    if (!jeton) throw new Error("SUPABASE_ACCESS_TOKEN manque (ou passez --depuis <fichier.json>).");
    const ref = process.env.SUPABASE_PROJECT_REF || new URL(PROJETS.production.url).hostname.split(".")[0];
    const [rq, bq] = requetes(aujourdhui);
    donnees = { releves: await interroge(ref, jeton, rq), bilans: await interroge(ref, jeton, bq) };
  }
  const f = fiche({ releves: donnees.releves, bilans: donnees.bilans, aujourdhui });
  if (f.vide) { console.log(f.corps + " Rien n'est publié."); return; }
  if (sec) { console.log("# " + f.titre + "\n\n" + f.corps); return; }
  const depot = process.env.GITHUB_REPOSITORY;
  if (!depot) throw new Error("GITHUB_REPOSITORY manque : impossible de savoir où publier.");
  publie(f.titre, f.corps, depot);
}

if (require.main === module) {
  principal(process.argv.slice(2)).catch((e) => { console.error("performances : " + e.message); process.exit(1); });
}

module.exports = { texteSur, fichierPropre, bilanSemaine, etiquette, lundiDe, requetes, indicateurs, degradations, fiche };
