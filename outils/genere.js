const fs = require("fs");
const tpl = fs.readFileSync(__dirname + "/tpl-multi.html", "utf8");
const W = "C:/projets/Plan Interactif/web/";
const API = "https://jylkfskotuafptaxujao.supabase.co/functions/v1/plan-public";

/* version de démonstration : les données sont dans la page */
fs.writeFileSync(W + "plan-smcl.html",
  tpl.replace("/*__DATA__*/", () => fs.readFileSync(__dirname + "/plans.json", "utf8")));

/* version connectée : la page interroge l'API */
const marque = '<script>\n/* Sans viewport';
if (tpl.indexOf(marque) < 0) throw new Error("balise de script introuvable");
const connecte = tpl
  .replace('<script id="data" type="application/json">/*__DATA__*/</script>',
           '<script id="data" type="application/json"></script>')
  .replace(marque, '<script data-api="' + API + '" data-slug="smcl-2026">\n/* Sans viewport');
fs.writeFileSync(W + "plan.html", connecte);

console.log("plan-smcl.html :", (fs.statSync(W + "plan-smcl.html").size / 1048576).toFixed(2), "Mo (figé)");
console.log("plan.html      :", (fs.statSync(W + "plan.html").size / 1024).toFixed(0), "Ko (connecté)");
console.log("attribut api   :", connecte.indexOf('data-api="' + API) > 0);
