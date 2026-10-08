const fs = require("fs");
const D = __dirname;
const bouts = ["_entete.html", "_styles-jetons.css", "_styles-plan.css", "_styles-modeles.css", "_styles-parcours.css", "_styles-modeles-parcours.css", "_styles-divers.css", "_head.html", "_js.html", "_rendu.html", "_recherche.html", "_vue.html", "_fiche.html", "_gestes.html", "_marque.html", "_admin1.html", "_reglages.html", "_volets.html", "_ordre-fiche.html", "_mode-admin.html", "_dessin.html", "_edition.html", "_aimants.html", "_geometrie.html", "_batiments.html", "_pile.html", "_pousse.html", "_modales.html", "_parcours.html", "_partage.html", "_rappels.html", "_itineraire.html", "_borne.html", "_ici.html", "_journee.html", "_mesure.html", "_chaleur.html", "_suggestion.html", "_environs.html", "_installation.html", "_tutoriel.html", "_webgl.html", "_sponsor.html", "_application.html", "_admin2.html"];
let tpl = "";
for (const b of bouts){
  let t = fs.readFileSync(D + "/gabarit/" + b, "utf8");
  if (b === "_gestes.html") t = t.replace(/<\/script>\s*$/, "");
  tpl += t;
}
fs.writeFileSync(D + "/tpl-multi.html", tpl);
fs.writeFileSync(D + "/chk.js", tpl.match(/<script>([\s\S]*)<\/script>/)[1].replace("/*__DATA__*/", "{}"));
console.log("gabarit :", (tpl.length / 1024).toFixed(0), "Ko");
