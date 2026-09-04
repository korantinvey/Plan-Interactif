const fs = require("fs");
const D = __dirname;
const W = "C:/projets/Plan Interactif/web/";
const API = "https://jylkfskotuafptaxujao.supabase.co/functions/v1/plan-public";

/**
 * Sans déclaration d'encodage, un navigateur suppose Windows-1252 : les accents
 * se décomposent et tout caractère non-ASCII présent dans le code change de
 * valeur. Le squelette n'est donc pas de la décoration.
 */
function page(contenu, role) {
  return '<!doctype html>\n<html lang="fr"' +
    (role ? ' data-role="' + role + '"' : "") + '>\n<head>\n' +
    '<meta charset="utf-8">\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
    contenu + "\n</body>\n</html>\n";
}

const tpl = fs.readFileSync(D + "/tpl-multi.html", "utf8");
const auth = fs.readFileSync(D + "/gabarit/_auth-plan.html", "utf8");

/** Branche la page sur l'API plutôt que sur des données figées. */
function connecte(t) {
  const marque = '<script>\n/* Sans viewport';
  if (t.indexOf(marque) < 0) throw new Error("balise de script introuvable");
  return t
    .replace('<script id="data" type="application/json">/*__DATA__*/</script>',
             '<script id="data" type="application/json"></script>')
    .replace(marque, '<script data-api="' + API + '" data-slug="smcl-2026">\n/* Sans viewport');
}

/* --- page publique : le mode administration n'est jamais activé --- */
fs.writeFileSync(W + "plan.html",
  page(connecte(tpl).replace("/*__PORTE_ADMIN__*/", "retireAdmin();")));

/* --- page d'administration : accès après authentification --- */
fs.writeFileSync(W + "plan-admin.html",
  page(connecte(tpl).replace("/*__PORTE_ADMIN__*/", auth), "admin"));

/* --- démonstration à données figées, publiable en artefact --- */
fs.writeFileSync(W + "plan-smcl.html",
  page(tpl.replace("/*__DATA__*/", () => fs.readFileSync(D + "/plans.json", "utf8"))
          .replace("/*__PORTE_ADMIN__*/", "retireAdmin();")));

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
    "· admin " + (s.indexOf("ecranAcces") > 0 ? "authentifié" : "retiré"));
}
