const fs = require("fs");
const path = require("path");
const D = __dirname;
// relatif au script : le dépôt doit se cloner n'importe où
const W = path.join(D, "..", "web") + path.sep;
/* Les pages passent par le Worker, qui relaie et met en cache (src/index.js).
   Adresse relative : même origine que la page, donc aucun contrôle d'origine
   croisée, et un déplacement de domaine ne demande rien. */
const API = "/api/plan";

/**
 * Sans déclaration d'encodage, un navigateur suppose Windows-1252 : les accents
 * se décomposent et tout caractère non-ASCII présent dans le code change de
 * valeur. Le squelette n'est donc pas de la décoration.
 */
function page(contenu, role, tete) {
  return '<!doctype html>\n<html lang="fr"' +
    (role ? ' data-role="' + role + '"' : "") + '>\n<head>\n' +
    '<meta charset="utf-8">\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
    (tete || "") +
    contenu + "\n</body>\n</html>\n";
}

const SLUG_DEFAUT = "smcl-2026";

/**
 * Le plan est ce que le visiteur vient voir : la demande part depuis l'en-tête,
 * avant que le navigateur ait lu le reste du document. Cela gagne le temps de
 * lecture et d'analyse de la page — deux cents millisecondes environ.
 *
 * Réservé à la page publique : l'administration doit d'abord présenter sa
 * session, sans quoi les brouillons resteraient invisibles.
 */
const PRECHARGE = [
  "<script>",
  'window.__plan = fetch("' + API + '?slug=" + encodeURIComponent(',
  '  new URLSearchParams(location.search).get("plan") || "' + SLUG_DEFAUT + '"));',
  "</" + "script>",
  "",
].join("\n");

const tpl = fs.readFileSync(D + "/tpl-multi.html", "utf8");
const auth = fs.readFileSync(D + "/gabarit/_auth-plan.html", "utf8");

/** Branche la page sur l'API plutôt que sur des données figées. */
function connecte(t) {
  const marque = '<script>\n/* Sans viewport';
  if (t.indexOf(marque) < 0) throw new Error("balise de script introuvable");
  return t
    .replace('<script id="data" type="application/json">/*__DATA__*/</script>',
             '<script id="data" type="application/json"></script>')
    .replace(marque, '<script data-api="' + API + '" data-slug="' + SLUG_DEFAUT + '">\n/* Sans viewport');
}

/* --- page publique : le mode administration n'est jamais activé --- */
fs.writeFileSync(W + "plan.html",
  page(connecte(tpl).replace("/*__PORTE_ADMIN__*/", "retireAdmin();"), null, PRECHARGE));

/* --- page d'administration : accès après authentification --- */
fs.writeFileSync(W + "plan-admin.html",
  page(connecte(tpl).replace("/*__PORTE_ADMIN__*/", auth), "admin"));

/* --- démonstration à données figées, publiable en artefact --- */
fs.writeFileSync(W + "plan-smcl.html",
  page(tpl.replace("/*__DATA__*/", () => fs.readFileSync(D + "/plans.json", "utf8"))
          .replace("/*__PORTE_ADMIN__*/", "retireAdmin();")));

/* --- configuration livrée avec les pages --- */
fs.copyFileSync(D + "/gabarit/_config.js", W + "config.js");

/* --- page d'accueil : la racine ne doit pas répondre 404 --- */
fs.writeFileSync(W + "index.html",
  page(fs.readFileSync(D + "/gabarit/_index.html", "utf8")));

/* --- la console --- */
fs.writeFileSync(W + "admin-plans.html", page(
  fs.readFileSync(D + "/gabarit/_console-head.html", "utf8") +
  fs.readFileSync(D + "/gabarit/_console-js.html", "utf8")));

for (const f of ["index.html", "plan.html", "plan-admin.html", "plan-smcl.html", "admin-plans.html"]) {
  const s = fs.readFileSync(W + f, "utf8");
  console.log(f.padEnd(18), (s.length / 1024).toFixed(0).padStart(5) + " Ko",
    "· charset " + (s.indexOf('<meta charset="utf-8">') > 0 ? "oui" : "NON"),
    // c'est la présence du module d'accès qui compte, pas une simple mention :
    // le chargeur en cite le nom pour rouvrir l'écran sur session expirée
    "· admin " + (s.indexOf("function ecranAcces(") > 0 ? "authentifié" : "retiré"));
}
