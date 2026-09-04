const fs = require("fs");
const D = __dirname;
const W = "C:/projets/Plan Interactif/web/";
const API = "https://jylkfskotuafptaxujao.supabase.co/functions/v1/plan-public";

/**
 * Sans déclaration d'encodage, un navigateur suppose Windows-1252 : les accents
 * se décomposent et, plus grave, tout caractère non-ASCII présent dans le code
 * change de valeur. Le squelette n'est donc pas de la décoration.
 */
function page(contenu, titreSecours) {
  return '<!doctype html>\n<html lang="fr">\n<head>\n' +
    '<meta charset="utf-8">\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
    (contenu.indexOf("<title>") < 0 ? "<title>" + titreSecours + "</title>\n" : "") +
    contenu +
    "\n</body>\n</html>\n";
}

const tpl = fs.readFileSync(D + "/tpl-multi.html", "utf8");

/* version de démonstration : les données sont dans la page */
fs.writeFileSync(W + "plan-smcl.html",
  page(tpl.replace("/*__DATA__*/", () => fs.readFileSync(D + "/plans.json", "utf8"))));

/* version connectée : la page interroge l'API */
const marque = '<script>\n/* Sans viewport';
if (tpl.indexOf(marque) < 0) throw new Error("balise de script introuvable");
const connecte = tpl
  .replace('<script id="data" type="application/json">/*__DATA__*/</script>',
           '<script id="data" type="application/json"></script>')
  .replace(marque, '<script data-api="' + API + '" data-slug="smcl-2026">\n/* Sans viewport');
fs.writeFileSync(W + "plan.html", page(connecte));

/* la console */
fs.writeFileSync(W + "admin-plans.html", page(
  fs.readFileSync(D + "/gabarit/_console-head.html", "utf8") +
  fs.readFileSync(D + "/gabarit/_console-js.html", "utf8")));

for (const f of ["plan-smcl.html", "plan.html", "admin-plans.html"]) {
  const s = fs.readFileSync(W + f, "utf8");
  console.log(f.padEnd(18),
    (s.length / 1024).toFixed(0).padStart(5) + " Ko",
    "· charset " + (s.indexOf('<meta charset="utf-8">') > 0 ? "oui" : "NON"));
}
