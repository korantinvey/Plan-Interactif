/**
 * Lit les relevés de la sonde de performance par HTTPS, pour les analyser.
 *
 * Pourquoi : le conteneur d'une session Claude Code ne joint Supabase que par
 * HTTPS, avec la clé publiable ; pas de connexion Postgres directe. La fonction
 * SQL `lecture_perf` (lecture seule) n'y répond qu'à qui présente un jeton que
 * l'exploitant a créé lui-même.
 *
 *   node outils/lecture-perf.js releves --de 2026-10-21 --a 2026-10-27 --slug fep27
 *   node outils/lecture-perf.js bilans|jours|salons [--de J] [--a J] [--slug S]
 *   ajouter  --sortie fichier.json  pour écrire au lieu d'imprimer.
 *
 * Créer le jeton : dans l'éditeur SQL de Supabase,
 *   select lecteur_perf_nouveau('claude');
 * Il ne s'affiche qu'une fois, la base n'en garde que l'empreinte.
 * Le ranger : secret d'environnement `SUPABASE_LECTURE` de l'environnement
 * Claude Code (jamais dans le dépôt). Ce script ne l'imprime jamais.
 * Le révoquer : select lecteur_perf_retire('claude');
 */
const fs = require("fs");
const { PROJETS } = require("./projet.js");

const QUOI = ["releves", "bilans", "jours", "salons"];
const PAGE = 1000;

function lisArguments(argv) {
  const [quoi, ...reste] = argv;
  const options = {};
  for (let i = 0; i < reste.length; i += 2) {
    const nom = reste[i];
    if (!/^--(de|a|slug|sortie)$/.test(nom) || reste[i + 1] === undefined) {
      throw new Error("Option inconnue ou sans valeur : " + nom);
    }
    options[nom.slice(2)] = reste[i + 1];
  }
  if (!QUOI.includes(quoi)) {
    throw new Error("Usage : node outils/lecture-perf.js <" + QUOI.join("|") + "> [--de AAAA-MM-JJ] [--a AAAA-MM-JJ] [--slug salon] [--sortie fichier]");
  }
  return { quoi, options };
}

async function appelle(projet, jeton, corps) {
  const reponse = await fetch(projet.url + "/rest/v1/rpc/lecture_perf", {
    method: "POST",
    headers: { apikey: projet.cle, "Content-Type": "application/json" },
    body: JSON.stringify({ p_jeton: jeton, ...corps }),
  });
  const texte = await reponse.text();
  let json = null;
  try { json = JSON.parse(texte); } catch { /* corps non JSON */ }
  if (!reponse.ok) {
    throw new Error("HTTP " + reponse.status + " : " + ((json && json.message) || "sans message"));
  }
  return json;
}

async function main() {
  const jeton = process.env.SUPABASE_LECTURE;
  if (!jeton) {
    throw new Error("SUPABASE_LECTURE manque : créez un jeton (select lecteur_perf_nouveau('claude'); dans l'éditeur SQL de Supabase) et rangez-le dans cette variable d'environnement.");
  }
  const { quoi, options } = lisArguments(process.argv.slice(2));
  for (const nom of ["de", "a"]) {
    const v = options[nom];
    if (v !== undefined && !(/^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(Date.parse(v)))) {
      throw new Error("--" + nom + " attend une date AAAA-MM-JJ : " + v);
    }
  }
  /* Fenêtre fixée une fois : une lecture à cheval sur minuit ne doit pas la
     décaler d'une page à l'autre. */
  const demain = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const a = options.a || demain;
  const de = options.de || new Date(Date.parse(a) - 7 * 86400000).toISOString().slice(0, 10);
  const projet = PROJETS.production;
  const lignes = [];
  for (let decalage = 0; ; decalage += PAGE) {
    const page = await appelle(projet, jeton, {
      p_quoi: quoi, p_de: de, p_a: a,
      p_slug: options.slug || null, p_limite: PAGE, p_decalage: decalage,
    });
    if (page === null) throw new Error("Jeton refusé (inconnu, révoqué ou trop court).");
    lignes.push(...page);
    if (page.length < PAGE) break;
  }
  const sortie = JSON.stringify(lignes, null, 2);
  if (options.sortie) {
    fs.writeFileSync(options.sortie, sortie + "\n");
    console.error(lignes.length + " ligne(s) écrites dans " + options.sortie);
  } else {
    console.log(sortie);
  }
}

main().catch((e) => { console.error(e.message); process.exit(1); });
