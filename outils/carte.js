/**
 * Produit `CARTE.md` : l'index fin des sources.
 *
 * Le dépôt tient dans une vingtaine de modules, mais deux d'entre eux passent
 * les 1300 lignes et la moitié du code vit sous des noms de fonctions qu'on ne
 * devine pas. Sans index, retrouver « où se calcule l'ordre de visite »
 * demandait d'ouvrir des fichiers entiers pour n'en garder que trente lignes.
 *
 * L'index est donc *produit*, jamais tenu à la main : un index qui ment coûte
 * plus cher que pas d'index du tout. Il se relit dans les sources à chaque
 * construction, et `npm run verifie` refuse un dépôt où il aurait pris du
 * retard.
 *
 *   node outils/carte.js
 */
const fs = require("fs");
const path = require("path");

const D = __dirname;
const RACINE = path.join(D, "..");
const GABARIT = path.join(D, "gabarit");
const WEB = path.join(RACINE, "web");

const lis = (p) => fs.readFileSync(p, "utf8");
const lignes = (t) => t.split("\n");
// `split` rend une dernière case vide quand le fichier finit par un saut de
// ligne : sans ce retrait, chaque fichier paraîtrait plus long d'une ligne.
const compte = (t) => lignes(t).length - (t.endsWith("\n") ? 1 : 0);

/* ------------------------------------------------------------------
   À quelles pages un module aboutit-il

   La question se pose parce qu'un module ne sait pas où il va : c'est
   `assemble.js` puis `genere.js` qui en décident. Plutôt que de recopier ici
   leur logique — qui se serait désynchronisée au premier changement — on
   cherche dans les pages construites une ligne assez singulière du module. Si
   elle y est, le module y est.
   ------------------------------------------------------------------ */
/**
 * Ce que `genere.js` écrit vraiment. Lu chez lui plutôt que recopié : une page
 * de `web/` absente de cette liste n'est plus reconstruite par personne, et
 * c'est le genre de fichier qu'on croit à jour pendant des mois.
 */
const PRODUITES = new Set(
  [...lis(path.join(D, "genere.js")).matchAll(/W \+ "([^"]+)"/g)].map((m) => m[1])
);

const PAGES = fs.existsSync(WEB)
  ? fs.readdirSync(WEB).filter((f) => /\.(html|css|js)$/.test(f)).sort()
      .map((f) => ({ nom: f, texte: lis(path.join(WEB, f)) }))
  : [];

/**
 * Combien de modules portent chaque ligne. Une ligne présente dans deux
 * modules ne prouve rien : retrouvée dans une page, elle ne dit pas lequel des
 * deux y est. On ne retient donc, comme empreinte, que ce qui n'appartient
 * qu'à un seul module.
 */
const PARTAGE = new Map();
for (const f of fs.readdirSync(GABARIT)) {
  for (const t of new Set(lignes(lis(path.join(GABARIT, f))).map((l) => l.trim()))) {
    PARTAGE.set(t, (PARTAGE.get(t) || 0) + 1);
  }
}

/** La plus longue ligne que ce module est seul à porter. */
function empreinte(texte) {
  let meilleure = "";
  for (const l of lignes(texte)) {
    const t = l.trim();
    if (t.length < 30 || t.length > 180) continue;
    if (/^[=\-*/]/.test(t) || t.includes("__DATA__")) continue;
    if (PARTAGE.get(t) !== 1) continue;
    if (t.length > meilleure.length) meilleure = t;
  }
  return meilleure;
}

function pagesDe(texte) {
  const marque = empreinte(texte);
  if (!marque) return [];
  return PAGES.filter((p) => p.texte.includes(marque)).map((p) => p.nom);
}

/* ------------------------------------------------------------------
   Ce qu'on relève dans un module
   ------------------------------------------------------------------ */

/** Les bandeaux `/* ==== n. Titre ==== *​/` qui découpent déjà le code. */
function sections(ls) {
  const out = [];
  for (let i = 0; i < ls.length; i++) {
    if (!/^\s*\/\*\s*=+\s*$/.test(ls[i])) continue;
    const titre = (ls[i + 1] || "").trim().replace(/\s*=+\s*\*\/\s*$/, "");
    if (titre && !/^=+$/.test(titre)) out.push({ l: i + 1, titre });
  }
  return out;
}

/**
 * Les fonctions déclarées au premier niveau. Celles imbriquées dans une autre
 * sont volontairement laissées de côté : elles ne se cherchent pas seules, et
 * les lister doublerait la carte sans rien ajouter.
 */
function fonctions(ls) {
  const out = [];
  for (let i = 0; i < ls.length; i++) {
    const m =
      /^(?:async\s+)?function\s*\*?\s*([A-Za-z0-9_$]+)/.exec(ls[i]) ||
      /^(?:const|let)\s+([A-Za-z0-9_$]+)\s*=\s*(?:async\s*)?(?:function\b|\([^)]*\)\s*=>|[A-Za-z0-9_$]+\s*=>)/.exec(ls[i]);
    if (m) out.push({ l: i + 1, nom: m[1] });
  }
  return out;
}

/** Les identifiants du balisage : le chemin le plus court vers un bout d'écran. */
function elements(texte) {
  const vus = new Set();
  for (const m of texte.matchAll(/\sid="([A-Za-z0-9_-]+)"/g)) vus.add(m[1]);
  return [...vus];
}

/** Emballe une liste en lignes courtes : une carte se lit, elle ne défile pas. */
function enveloppe(items, largeur = 92) {
  const out = [];
  let ligne = "";
  for (const it of items) {
    if (ligne && ligne.length + it.length + 3 > largeur) { out.push(ligne); ligne = ""; }
    ligne = ligne ? ligne + " · " + it : it;
  }
  if (ligne) out.push(ligne);
  return out;
}

/* ------------------------------------------------------------------
   La carte
   ------------------------------------------------------------------ */
const doc = [];
const ecrit = (...l) => doc.push(...l);

ecrit(
  "<!-- Produit par `node outils/carte.js` (via `npm run construire`).",
  "     Ne pas modifier à la main : la prochaine construction l'écrase. -->",
  "",
  "# Carte des sources",
  "",
  "Index des sources, relu dans les fichiers à chaque construction. Il sert à",
  "ouvrir la bonne portion du bon fichier plutôt que le dépôt entier.",
  "",
  "Rappel : `web/` est **fabriqué** depuis `outils/gabarit/`, et n'est donc pas",
  "l'endroit où l'on corrige quoi que ce soit.",
  "",
  "## `outils/gabarit/` — la source des pages",
  ""
);

for (const nom of fs.readdirSync(GABARIT).sort()) {
  const chemin = path.join(GABARIT, nom);
  const texte = lis(chemin);
  const ls = lignes(texte);
  const vers = pagesDe(texte);

  ecrit(`### \`${nom}\` — ${compte(texte)} l.` + (vers.length ? ` → ${vers.join(", ")}` : ""));

  const sec = sections(ls);
  if (sec.length) {
    ecrit("");
    for (const s of sec) ecrit(`- l.${s.l} · ${s.titre}`);
  }

  const fns = fonctions(ls);
  if (fns.length) {
    ecrit("", "Fonctions :", "");
    for (const l of enveloppe(fns.map((f) => `\`${f.nom}\` ${f.l}`))) ecrit(l);
  }

  const els = elements(texte);
  if (els.length) {
    ecrit("", "Éléments :", "");
    for (const l of enveloppe(els.map((e) => `\`#${e}\``))) ecrit(l);
  }
  ecrit("");
}

/* --- Le dos du plan : base et fonctions serveur --- */
const SUP = path.join(RACINE, "supabase");

const orphelines = PAGES.map((p) => p.nom).filter((n) => !PRODUITES.has(n));
if (orphelines.length) {
  ecrit(
    "## Dans `web/`, mais que la construction ne produit pas",
    "",
    "Ces fichiers sont servis sans qu'aucune source ne les regénère : les",
    "corriger dans `outils/gabarit/` ne les changera pas.",
    "",
    ...orphelines.map((n) => `- \`web/${n}\``),
    ""
  );
}

ecrit("## `supabase/functions/` — synchronisation Klipso et API publique", "");
for (const dossier of ["_partage", "mesure", "plan-public", "sync-evenement"]) {
  const rep = path.join(SUP, "functions", dossier);
  if (!fs.existsSync(rep)) continue;
  for (const f of fs.readdirSync(rep).filter((f) => f.endsWith(".ts")).sort()) {
    const texte = lis(path.join(rep, f));
    const fns = fonctions(lignes(texte)).map((x) => `\`${x.nom}\` ${x.l}`);
    ecrit(`### \`supabase/functions/${dossier}/${f}\` — ${compte(texte)} l.`, "");
    for (const l of enveloppe(fns.length ? fns : ["(aucune fonction de premier niveau)"])) ecrit(l);
    ecrit("");
  }
}

/**
 * Pour les migrations, ce qui se cherche est une table ou une colonne, jamais
 * un numéro de migration : c'est donc ce que chacune touche qu'on relève.
 */
ecrit("## `supabase/migrations/` — schéma, numéroté et rejouable", "");
const MIG = path.join(SUP, "migrations");
for (const f of fs.readdirSync(MIG).filter((f) => f.endsWith(".sql")).sort()) {
  const sql = lis(path.join(MIG, f));
  const objets = new Set();
  const prends = (re, prefixe = "") => {
    for (const m of sql.matchAll(re)) objets.add(prefixe + m[1].replace(/^public\./, ""));
  };
  prends(/create\s+table\s+(?:if\s+not\s+exists\s+)?([A-Za-z0-9_.]+)/gi);
  prends(/alter\s+table\s+(?:if\s+exists\s+)?([A-Za-z0-9_.]+)/gi);
  prends(/create\s+(?:or\s+replace\s+)?(?:function|view|materialized\s+view)\s+([A-Za-z0-9_.]+)/gi, "fn ");
  ecrit(`- \`${f}\` — ${[...objets].join(", ") || "—"}`);
}
ecrit("");

ecrit("## Le reste", "");
const worker = lis(path.join(RACINE, "src", "index.mjs"));
const ls = lignes(worker);
ecrit(
  `- \`src/index.mjs\` — ${compte(worker)} l. · Worker Cloudflare : relais et cache de \`/api/plan\`.`,
  "  " + enveloppe(fonctions(ls).map((f) => `\`${f.nom}\` ${f.l}`)).join(" "),
  "- `outils/assemble.js` — assemble `gabarit/` en `tpl-multi.html`.",
  "- `outils/genere.js` — écrit les pages de `web/` depuis `tpl-multi.html`.",
  "- `outils/pwa.js` — le manifeste et l'en-tête qui rendent les pages installables.",
  "- `outils/icones.js` — dessine l'icône de l'application, et l'encode en PNG.",
  "- `outils/carte.js` — produit ce fichier.",
  "- `outils/verifie.js` — reconstruit, et échoue si le versionné était en retard.",
  "- `outils/controle.js` — analyse le script de chaque page construite, en module",
  "  ES : une redéclaration y est une erreur, là où un `<script>` la tolère.",
  "- `outils/migration.js` — crée une migration horodatée à la seconde.",
  "- `outils/fetch-all.js`, `outils/build-all.js`, `outils/optim.js`, `outils/lire-pdf.js` —",
  "  outils hors ligne de récupération et de préparation des plans (clé Klipso requise).",
  ""
);

fs.writeFileSync(path.join(RACINE, "CARTE.md"), doc.join("\n").replace(/\n{3,}/g, "\n\n"));
console.log("CARTE.md :", doc.length, "lignes");
