const fs = require("fs");
const D = __dirname;
const bouts = ["_head.html", "_js.html", "_admin1.html", "_dessin.html", "_edition.html", "_pile.html", "_modales.html", "_admin2.html"];
let tpl = "";
for (const b of bouts){
  let t = fs.readFileSync(D + "/gabarit/" + b, "utf8");
  if (b === "_js.html") t = t.replace(/<\/script>\s*$/, "");
  tpl += t;
}
fs.writeFileSync(D + "/tpl-multi.html", tpl);
fs.writeFileSync(D + "/chk.js", tpl.match(/<script>([\s\S]*)<\/script>/)[1].replace("/*__DATA__*/", "{}"));
console.log("gabarit :", (tpl.length / 1024).toFixed(0), "Ko");

/* la console est assemblée du même mouvement */
{
  const head = fs.readFileSync(D + "/gabarit/_console-head.html", "utf8");
  const js = fs.readFileSync(D + "/gabarit/_console-js.html", "utf8");
  fs.writeFileSync("C:/projets/Plan Interactif/web/admin-plans.html", head + js);
  console.log("console :", ((head + js).length / 1024).toFixed(0), "Ko");
}
