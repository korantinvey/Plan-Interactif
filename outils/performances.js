/**
 * La fiche de pistes de performance, chaque lundi.
 *
 * Lit les relevés de la sonde (`releve_perf`) des quatorze derniers jours par
 * l'API de gestion Supabase, en tire les indicateurs de la semaine par page,
 * support et vue, les compare à la semaine d'avant et d'une version des pages
 * à l'autre, applique les règles de `performances-regles.js`, et ouvre — ou
 * met à jour — l'issue « Performances — semaine du AAAA-MM-JJ ».
 *
 * Les relevés et non les bilans : le détail se garde trente jours, deux
 * semaines y tiennent, et un bilan par jour ne refait pas une médiane sur la
 * semaine.
 *
 * Le dépôt est public : l'issue ne nomme aucun salon. Chacun y devient
 * `salon-` et les quatre premiers caractères de `md5(evenement_id)`, la même
 * étiquette d'une semaine à l'autre ; l'exploitant la retrouve dans la base
 * par le même calcul.
 *
 *   npm run performances                     lit la base, publie l'issue
 *   npm run performances -- --sec            imprime la fiche, ne publie rien
 *   npm run performances -- --sec --depuis relevés.json [--au AAAA-MM-JJ]
 *
 * Lit `SUPABASE_ACCESS_TOKEN` (et `GH_TOKEN` pour `gh`) dans l'environnement.
 */
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const { PROJETS } = require("./projet.js");
const { pistes, regressions, SEUILS } = require("./performances-regles.js");

const ETIQUETTE_ISSUE = "performances";

/* Ce que le script lit, rangée par rangée. Rien du résumé n'en sort que ce
   dont une règle se sert : le reste n'a rien à faire dans un journal de CI. */
const REQUETE = `
select r.evenement_id, r.jour::text as jour, r.page, r.mobile, r.immersif, r.version,
       to_char(r.recu at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as recu,
       r.affiche_ms, r.donnees_ms, r.transfert_ko, r.part_plus33_classique,
       r.part_plus33_immersif, r.gels, r.repeint_ms_p95, r.gpu_ms_p95, r.pertes_contexte,
       r.resume #>> '{appareil,systeme}' as famille,
       (r.resume #>> '{gpu,logos,octetsTexture}')::double precision as logos_octets,
       case when jsonb_typeof(r.resume #> '{chargement,lourds}') = 'array'
            then (select jsonb_agg(jsonb_build_object('fichier', l ->> 'fichier', 'sorte', l ->> 'sorte',
                                                   'ms', l -> 'ms', 'tailleKo', l -> 'tailleKo',
                                                   'transfertKo', l -> 'transfertKo'))
                    from jsonb_array_elements(r.resume #> '{chargement,lourds}') l)
       end as lourds
  from releve_perf r
 where r.jour >= current_date - 14
`;

/** L'étiquette publique d'un salon : stable, et sans rien qui le nomme. */
const etiquette = (evenementId) =>
  "salon-" + crypto.createHash("md5").update(String(evenementId)).digest("hex").slice(0, 4);

/**
 * Tout texte venu d'un relevé est écrit par un visiteur anonyme (la clé qui
 * ouvre la porte circule dans chaque page) et l'issue est publique : on n'en
 * garde que lettres, chiffres, espace et `._·+()-`, sur 60 caractères. Sans
 * `/ @ # [ ] ! < > |` ni apostrophe inverse, rien ne s'y lit comme un lien,
 * une mention, une image, une référence ou une cellule de tableau.
 */
function texteSur(s) {
  return String(s == null ? "" : s).normalize("NFC").replace(/[^\p{L}\p{N} ._·+()-]/gu, "")
    .replace(/\s+/g, " ").trim().slice(0, 60);
}

/* Les fichiers que la page nomme dans `lourds` sont les derniers segments de chemin
   (`mesures-page.mjs` `fichier()`) : un nom libre — logo de stand, domaine tiers,
   `plan-<slug>` — peut porter un slug. On ne cite donc par leur nom que les fichiers
   versionnés de nos pages (point d'entrée + empreinte, tels que la construction les
   pose sous `web/versions/`), nos bibliothèques et quelques noms connus ; le reste est
   regroupé par extension.

   L'empreinte tombe : elle change à chaque construction, et la fiche du 26 octobre
   comptait `plan.aafddd7718.js` et `plan.b9000f1f87.js` pour deux fichiers, dont
   aucun ne revenait dans la moitié des visites. */
const ENTREES = "plan|plan-admin|anglais|langue|console|rapport|motdepasse|accueil";
const FICHIER_VERSIONNE = new RegExp("^(" + ENTREES + ")\\.[0-9a-f]{8,}\\.(js|css)$");
const BIBLIOTHEQUE = /^(deck\.gl|maplibre-gl|avif-enc)\b/;
const FICHIER_CONNU = new Set(["config.js", "sw.js", "manifeste.webmanifest"]);
const EXTENSIONS = new Set(["js", "css", "json", "html", "svg", "png", "jpg", "jpeg", "webp", "avif", "gif", "woff", "woff2", "mp4"]);

/* Les appels de nos pages à leurs services, par leur nom : ce sont des noms de
   fonctions ou de routes, sans rien d'un salon. Le plan en porte trois sous le
   même nom, que la fiche doit distinguer — l'entête qui dit la version (une
   cinquantaine d'octets), le plan lui-même, et les vignettes des logos. */
const APPELS = new Set(["plan", "user", "token", "profil", "sonde", "sonde_admin", "mesure",
  "erreur", "oublie", "rappels", "plan-de-visite", "lecture_perf"]);
const SORTES_APPEL = new Set(["fetch", "xmlhttprequest", "beacon"]);
const SORTES = new Set([...SORTES_APPEL, "script", "link", "css", "img", "other", "navigation", "audio", "video"]);

function fichierPropre(f, sorte, tailleKo) {
  const nom = String(f || "").split(/[?#]/)[0].split("/").pop();
  if (SORTES_APPEL.has(sorte)) {
    if (!APPELS.has(nom)) return "autre appel";
    return nom === "plan" && !(tailleKo > 0) ? "plan (entête)" : nom;
  }
  if (nom === "plan" && sorte === "img") return "plan (vignettes)";
  const versionne = FICHIER_VERSIONNE.exec(nom);
  if (versionne) return versionne[1] + "." + versionne[2];
  const bibliotheque = BIBLIOTHEQUE.exec(nom);
  if (bibliotheque) return bibliotheque[1] + "." + ((/\.(js|css|wasm)$/.exec(nom) || [])[1] || "js");
  if (FICHIER_CONNU.has(nom)) return nom;
  const ext = /\.([A-Za-z0-9]{1,5})$/.exec(nom);
  const e = ext && ext[1].toLowerCase();
  return e && EXTENSIONS.has(e) ? "autre fichier ." + e : "autre fichier";
}

/** Un nombre venu d'un relevé, ou rien. */
const nombre = (v) => typeof v === "number" && isFinite(v) ? v : null;

/** Un relevé dont tout texte qui peut atteindre la fiche est assaini, une fois pour toutes. */
const assaini = (r) => ({
  ...r,
  page: texteSur(r.page) || "(sans page)",
  version: texteSur(r.version),
  famille: texteSur(r.famille) || "inconnue",
  lourds: Array.isArray(r.lourds)
    ? r.lourds.filter(Boolean).map((x) => {
        const sorte = SORTES.has(x.sorte) ? x.sorte : "other";
        return { fichier: fichierPropre(x.fichier, sorte, x.tailleKo), appel: SORTES_APPEL.has(sorte),
                 ms: nombre(x.ms), tailleKo: nombre(x.tailleKo), transfertKo: nombre(x.transfertKo) };
      })
    : r.lourds,
});

const jourIso = (d) => d.toISOString().slice(0, 10);
const plusJours = (iso, n) => jourIso(new Date(Date.parse(iso + "T00:00:00Z") + n * 864e5));

/** Le lundi de la semaine mesurée : celui d'avant le jour donné. */
function lundiMesure(au) {
  const d = new Date(Date.parse(au + "T00:00:00Z"));
  const depuisLundi = (d.getUTCDay() + 6) % 7;
  return plusJours(au, -depuisLundi - 7);
}

function mediane(valeurs) {
  const l = valeurs.filter((v) => typeof v === "number" && isFinite(v)).sort((a, b) => a - b);
  if (!l.length) return null;
  const m = (l.length - 1) / 2;
  return (l[Math.floor(m)] + l[Math.ceil(m)]) / 2;
}

const preparation = (r) => r.affiche_ms != null && r.donnees_ms != null ? r.affiche_ms - r.donnees_ms : null;

/** Par page et support : ce que les règles et le tableau lisent. */
function groupes(releves) {
  const m = new Map();
  for (const r of releves) {
    const k = r.page + "|" + Boolean(r.mobile);
    if (!m.has(k)) m.set(k, []);
    m.get(k).push(r);
  }
  return [...m.values()].map((l) => {
    const vue = (cle) => {
      const v = l.filter((r) => r["part_plus33_" + cle] != null &&
        (cle === "immersif" ? r.immersif : true));
      if (!v.length) return null;
      return {
        visites: v.length,
        part_p50: mediane(v.map((r) => r["part_plus33_" + cle])),
        // les repeints ne se séparent pas par vue dans le résumé : ceux des visites qui l'ont utilisée
        repeint_p50: cle === "immersif" ? mediane(v.map((r) => r.repeint_ms_p95)) : null,
        gpu_p50: cle === "immersif" ? mediane(v.map((r) => r.gpu_ms_p95)) : null,
      };
    };
    const logos = l.filter((r) => r.logos_octets != null);
    return {
      page: l[0].page, mobile: Boolean(l[0].mobile), visites: l.length,
      affiche_p50: mediane(l.map((r) => r.affiche_ms)),
      donnees_p50: mediane(l.map((r) => r.donnees_ms)),
      preparation_p50: mediane(l.map(preparation)),
      transfert_p50: mediane(l.map((r) => r.transfert_ko)),
      part_p50: mediane(l.map((r) => r.immersif ? r.part_plus33_immersif ?? r.part_plus33_classique : r.part_plus33_classique)),
      vues: { classique: vue("classique"), immersif: vue("immersif") },
      logos_visites: logos.length,
      logos_mo_p50: mediane(logos.map((r) => r.logos_octets / 1048576)),
    };
  }).sort((a, b) => a.page.localeCompare(b.page) || Number(b.mobile) - Number(a.mobile));
}

/**
 * Les indicateurs d'une semaine, et ceux de la semaine d'avant pour comparer.
 * `au` est le jour où la fiche se fait ; la semaine mesurée va du lundi
 * précédent au dimanche.
 */
function indicateurs(brut, au) {
  const tous = brut.map(assaini);
  const de = lundiMesure(au), a = plusJours(de, 7), avant = plusJours(de, -7);
  const semaine = tous.filter((r) => r.jour >= de && r.jour < a);
  const precedente = tous.filter((r) => r.jour >= avant && r.jour < de);

  const fichiers = [];
  const parPage = new Map();
  for (const r of semaine) {
    if (!parPage.has(r.page)) parPage.set(r.page, []);
    parPage.get(r.page).push(r);
  }
  for (const [page, l] of parPage) {
    const m = new Map();
    for (const r of l) {
      /* Une visite compte une fois par nom ; quand un nom revient — deux
         appels au même service —, on retient le plus lent. */
      const parNom = new Map();
      for (const x of r.lourds || []) {
        if (!x.fichier) continue;
        const deja = parNom.get(x.fichier);
        if (!deja || (x.ms ?? 0) > (deja.ms ?? 0)) parNom.set(x.fichier, x);
      }
      for (const [nom, x] of parNom) {
        if (!m.has(nom)) m.set(nom, []);
        m.get(nom).push(x);
      }
    }
    for (const [fichier, xs] of m) {
      fichiers.push({ page, fichier, appel: xs.some((x) => x.appel), visites: xs.length, total: l.length,
                      part: xs.length / l.length,
                      ms_p50: mediane(xs.map((x) => x.ms)),
                      taille_p50: mediane(xs.map((x) => x.tailleKo)),
                      // ce qui a vraiment passé le réseau : zéro pour ce qui sort du cache
                      transfert_p50: mediane(xs.map((x) => x.transfertKo)) });
    }
  }

  const familles = new Map();
  for (const r of semaine) {
    const f = r.famille || "inconnue";
    const d = familles.get(f) || { famille: f, visites: 0, avecPerte: 0 };
    d.visites++;
    if (r.pertes_contexte > 0) d.avecPerte++;
    familles.set(f, d);
  }

  const versions = new Map();
  for (const r of semaine.concat(precedente)) {
    const k = (r.version || "") + "|" + r.page + "|" + Boolean(r.mobile);
    if (!versions.has(k)) versions.set(k, []);
    versions.get(k).push(r);
  }

  const salons = new Map();
  for (const r of semaine) {
    const e = etiquette(r.evenement_id);
    if (!salons.has(e)) salons.set(e, []);
    salons.get(e).push(r);
  }

  return {
    de, a: plusJours(a, -1),
    visites: semaine.length,
    groupes: groupes(semaine),
    precedente: groupes(precedente),
    fichiers: fichiers.sort((x, y) => y.part - x.part),
    familles: [...familles.values()].sort((x, y) => y.visites - x.visites),
    versions: [...versions.values()].map((l) => ({
      version: l[0].version || "(sans version)", page: l[0].page, mobile: Boolean(l[0].mobile),
      visites: l.length, premier: l.map((r) => r.recu || r.jour).sort()[0],
      affiche_p50: mediane(l.map((r) => r.affiche_ms)),
      donnees_p50: mediane(l.map((r) => r.donnees_ms)),
      part_p50: mediane(l.map((r) => r.immersif ? r.part_plus33_immersif ?? r.part_plus33_classique : r.part_plus33_classique)),
    })),
    salons: [...salons].map(([e, l]) => ({ etiquette: e, visites: l.length,
      affiche_p50: mediane(l.map((r) => r.affiche_ms)) }))
      .sort((x, y) => (y.affiche_p50 ?? 0) - (x.affiche_p50 ?? 0)),
  };
}

const s1 = (v) => v == null ? "—" : (Math.round(v / 100) / 10).toFixed(1).replace(".", ",") + " s";
const pc = (v) => v == null ? "—" : Math.round(v) + " %";

/** Le corps de l'issue, en Markdown. */
function corps(ind) {
  const l = [];
  l.push("Relevés de la sonde du " + ind.de + " au " + ind.a + " : " + ind.visites +
    " visites, tous salons confondus. Fiche refaite chaque lundi par `outils/performances.js`.");
  l.push("");
  l.push("## Pistes, par gain estimé");
  l.push("");
  const p = pistes(ind);
  if (!p.length) l.push("Aucune règle ne se déclenche cette semaine.");
  p.forEach((x, i) => {
    l.push((i + 1) + ". **" + x.titre + "** — " + x.detail + " · gain " + x.gain);
    l.push("   " + x.levier);
  });
  l.push("");
  l.push("## D'une version à l'autre");
  l.push("");
  const r = regressions(ind);
  if (!r.length) l.push("Aucun indicateur ne se dégrade d'une version des pages à la suivante.");
  r.forEach((x) => l.push("- " + (x.mobile ? "téléphone" : "bureau") + " · " + x.page + " — " +
    x.indicateur + " : " + x.de + " → " + x.a + " (version " + x.avant + " → version " + x.apres + ")"));
  l.push("");
  l.push("## La semaine, par page et support");
  l.push("");
  l.push("| page | support | visites | ouverture | semaine d'avant | données | préparation | images lentes classique | immersif |");
  l.push("|---|---|---:|---:|---:|---:|---:|---:|---:|");
  for (const g of ind.groupes) {
    const v = ind.precedente.find((x) => x.page === g.page && x.mobile === g.mobile);
    l.push("| " + [g.page, g.mobile ? "téléphone" : "bureau", g.visites, s1(g.affiche_p50),
      s1(v?.affiche_p50), s1(g.donnees_p50), s1(g.preparation_p50),
      pc(g.vues.classique?.part_p50), pc(g.vues.immersif?.part_p50)].join(" | ") + " |");
  }
  l.push("");
  l.push("## Salons les plus lents à s'ouvrir");
  l.push("");
  l.push("Chaque salon est nommé par `salon-` et les quatre premiers caractères de `md5(evenement_id)`.");
  l.push("");
  ind.salons.slice(0, 10).forEach((x) =>
    l.push("- `" + x.etiquette + "` — " + x.visites + " visites, ouverture médiane " + s1(x.affiche_p50)));
  l.push("");
  l.push("<sub>Seuils de départ, à reprendre d'après les relevés : `outils/performances-regles.js` " +
    "(données sur téléphone " + SEUILS.donneesTelephoneMs + " ms, préparation " + SEUILS.preparationMs + " ms).</sub>");
  return l.join("\n") + "\n";
}

/** Les relevés, par l'API de gestion : la requête tourne avec les droits du propriétaire. */
async function lisBase() {
  const jeton = process.env.SUPABASE_ACCESS_TOKEN;
  if (!jeton) throw new Error("SUPABASE_ACCESS_TOKEN manque : sans lui, la base ne se lit pas.");
  const ref = process.env.SUPABASE_PROJECT_REF || new URL(PROJETS.production.url).hostname.split(".")[0];
  const r = await fetch("https://api.supabase.com/v1/projects/" + ref + "/database/query", {
    method: "POST",
    headers: { "Authorization": "Bearer " + jeton, "Content-Type": "application/json" },
    body: JSON.stringify({ query: REQUETE }),
  });
  // la réponse brute n'est pas imprimée : un journal de CI se lit hors de l'équipe
  if (!r.ok) throw new Error("lecture de la base refusée (" + r.status + ")");
  return r.json();
}

/** Crée ou met à jour l'issue de la semaine, par `gh`. */
function publie(titre, texte) {
  const gh = (...args) => execFileSync("gh", args, { encoding: "utf8" });
  const fichier = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "performances-")), "fiche.md");
  fs.writeFileSync(fichier, texte);
  // `--force` crée l'étiquette au premier lundi, et la laisse telle quelle ensuite
  gh("label", "create", ETIQUETTE_ISSUE, "--force", "--color", "0e8a16",
     "--description", "Pistes tirées des relevés de la sonde");
  const ouvertes = JSON.parse(gh("issue", "list", "--label", ETIQUETTE_ISSUE, "--state", "all",
    "--limit", "50", "--json", "number,title"));
  const deja = ouvertes.find((x) => x.title === titre);
  if (deja) {
    gh("issue", "edit", String(deja.number), "--body-file", fichier);
    console.log("Issue #" + deja.number + " mise à jour.");
  } else {
    console.log(gh("issue", "create", "--title", titre, "--label", ETIQUETTE_ISSUE, "--body-file", fichier).trim());
  }
}

async function principal(argv) {
  const sec = argv.includes("--sec");
  const valeur = (nom) => { const i = argv.indexOf(nom); return i >= 0 ? argv[i + 1] : null; };
  const au = valeur("--au") || jourIso(new Date());
  const depuis = valeur("--depuis");
  const releves = depuis ? JSON.parse(fs.readFileSync(depuis, "utf8")) : await lisBase();
  const ind = indicateurs(releves, au);
  const titre = "Performances — semaine du " + ind.de;
  const texte = corps(ind);
  if (sec) { console.log("# " + titre + "\n\n" + texte); return; }
  publie(titre, texte);
}

if (require.main === module) {
  principal(process.argv.slice(2)).catch((e) => { console.error(e.message); process.exit(1); });
}

module.exports = { texteSur, fichierPropre, indicateurs, corps, etiquette, lundiMesure, REQUETE };
