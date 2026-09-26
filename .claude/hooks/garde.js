#!/usr/bin/env node
/**
 * Garde-fou des sessions Claude Code, appelé avant chaque édition et chaque
 * commande shell. Il refuse trois gestes que `CLAUDE.md` interdisait sans
 * pouvoir l'empêcher :
 *
 * - écrire dans un fichier fabriqué. La correction paraît juste et marche en
 *   essai, puis la construction suivante l'efface — ou `merge=ours` la garde
 *   d'un seul côté d'une fusion, et le défaut revient sans qu'on sache d'où ;
 * - toucher une migration déjà sur `origin/main`. Une poussée sur `main` part en
 *   production : la migration y est enregistrée sous son nom et son contenu, et
 *   une réécriture ne rejouerait jamais — la base et le dépôt divergeraient en
 *   silence. Une migration encore propre à la branche reste libre : on la
 *   remplit après `npm run migration`, on la réhorodate avant une fusion ;
 * - pousser en force. Le workflow `Pages` commite sur la branche poussée ; le
 *   clone local est derrière sans l'avoir vu, et `--force` efface ce commit.
 *
 * Un refus sort en code 2 : le message part vers le modèle, qui y lit quoi
 * faire à la place. Tout le reste passe — le garde ne doit jamais bloquer une
 * session pour une entrée qu'il ne comprend pas.
 */
const { execFileSync } = require("child_process");
const path = require("path");

const racine = process.env.CLAUDE_PROJECT_DIR || path.join(__dirname, "..", "..");

// Les sorties de la construction, et où les corriger.
const FABRIQUES = [
  [/^web\/[^/]+\.html$/, "outils/gabarit/"],
  [/^web\/console\.css$/, "outils/gabarit/_console.css"],
  [/^web\/config\.js$/, "outils/genere.js"],
  [/^web\/sw\.js$/, "outils/gabarit/_sw.js ou outils/pwa.js"],
  [/^web\/manifeste\.webmanifest$/, "outils/pwa.js"],
  [/^web\/icone[^/]*$/, "outils/icones.js"],
  [/^outils\/tpl-multi\.html$/, "outils/gabarit/ (assemble.js le régénère)"],
  [/^CARTE\.md$/, "ce qu'il décrit — un bandeau de section, un nom de fonction"],
];

const MIGRATION = /^supabase\/migrations\/[^/]+\.sql$/;

const refuse = (message) => {
  process.stderr.write(message + "\n");
  process.exit(2);
};

const relatif = (p, depuis) => {
  if (!p) return null;
  const r = path.relative(racine, path.resolve(depuis || racine, p));
  return r.startsWith("..") ? null : r.split(path.sep).join("/");
};

const sourceDe = (r) => {
  const trouve = FABRIQUES.find(([motif]) => motif.test(r));
  return trouve && trouve[1];
};

/**
 * `origin/main` tel que le clone le connaît : une migration fusionnée depuis le
 * dernier `fetch` passera pour libre. Le garde n'interroge pas le réseau — il
 * tourne à chaque commande, et un appel distant l'y rendrait insupportable.
 */
const surMain = (r) => {
  try {
    execFileSync("git", ["cat-file", "-e", "origin/main:" + r], { cwd: racine, stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
};

const refuseFabrique = (r) =>
  refuse(
    `${r} est fabriqué par la construction : il serait écrasé au prochain ` +
      `\`npm run construire\`. Corrigez sa source — ${sourceDe(r)} — puis reconstruisez.`
  );

const refuseMigration = (r) =>
  refuse(
    `${r} est déjà sur origin/main, donc appliquée en production sous ce nom et ce ` +
      `contenu : la modifier, la renommer ou la retirer ne rejouerait jamais. ` +
      `Une correction est une migration de plus : \`npm run migration -- "Titre"\`.`
  );

const examine = (r) => {
  if (!r) return;
  if (sourceDe(r)) refuseFabrique(r);
  if (MIGRATION.test(r) && surMain(r)) refuseMigration(r);
};

/**
 * Les chemins qu'une commande shell écrit, déplace ou efface. La lecture reste
 * libre — `sed -n` sur une page construite est le geste que `CLAUDE.md`
 * recommande — : seuls comptent `sed -i`/`perl -i`, les redirections, `tee`, et
 * la cible de `cp`/`mv`, plus toute source d'un `mv`/`rm` pour les migrations.
 */
const examineCommande = (commande, cwd) => {
  if (/\bgit\s+push\b[^;&|]*?(\s--force\b|\s--force-with-lease\b|\s--force-if-includes\b|\s-[a-zA-Z]*f[a-zA-Z]*\b|\s\+[^\s]+)/.test(commande)) {
    refuse(
      "Pas de poussée forcée dans ce dépôt : le workflow `Pages` a peut-être commité " +
        "sur la branche depuis le dernier tirage, et --force effacerait ce commit. " +
        "`git pull --rebase`, puis `npm run construire` si le rebasage a touché le gabarit, puis poussez."
    );
  }

  const mots = (s) => (s.match(/"[^"]*"|'[^']*'|[^\s]+/g) || []).map((m) => m.replace(/^["']|["']$/g, ""));
  const chemin = (m) => relatif(m, cwd);

  for (const [, cible] of commande.matchAll(/>{1,2}\s*("[^"]*"|'[^']*'|[^\s;&|<>]+)/g)) {
    examine(chemin(cible.replace(/^["']|["']$/g, "")));
  }

  for (const troncon of commande.split(/&&|\|\||;|\||\n/)) {
    const m = mots(troncon.trim());
    if (!m.length) continue;
    const verbe = m[0] === "git" ? "git " + (m[1] || "") : m[0];
    const args = m.slice(verbe.startsWith("git ") ? 2 : 1).filter((a) => !a.startsWith("-"));

    if ((verbe === "sed" || verbe === "perl") && m.some((a) => /^-[a-zA-Z]*i/.test(a) || a.startsWith("--in-place"))) {
      args.forEach((a) => examine(chemin(a)));
    } else if (verbe === "tee") {
      args.forEach((a) => examine(chemin(a)));
    } else if (["cp", "mv", "rm", "git mv", "git rm", "truncate"].includes(verbe)) {
      const cible = ["cp", "mv", "git mv"].includes(verbe) ? args[args.length - 1] : null;
      if (cible) examine(chemin(cible));
      if (verbe !== "cp") {
        args.forEach((a) => {
          const r = chemin(a);
          if (r && MIGRATION.test(r) && surMain(r)) refuseMigration(r);
        });
      }
    }
  }
};

let entree = "";
process.stdin.on("data", (d) => (entree += d));
process.stdin.on("end", () => {
  let appel;
  try {
    appel = JSON.parse(entree);
  } catch {
    process.exit(0);
  }
  const outil = appel.tool_name;
  const params = appel.tool_input || {};
  if (outil === "Bash") examineCommande(params.command || "", appel.cwd);
  else examine(relatif(params.file_path || params.notebook_path, appel.cwd));
  process.exit(0);
});
