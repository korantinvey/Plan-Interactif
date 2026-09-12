const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const icones = require("./icones.js");
const pwa = require("./pwa.js");
const D = __dirname;
// relatif au script : le dépôt doit se cloner n'importe où
const W = path.join(D, "..", "web") + path.sep;
/* Les pages passent par le Worker, qui relaie et met en cache (src/index.js).
   Adresse relative : même origine que la page, donc aucun contrôle d'origine
   croisée, et un déplacement de domaine ne demande rien. */
const API = "/api/plan";

/**
 * Le squelette d'une page.
 *
 * Sans déclaration d'encodage, un navigateur suppose Windows-1252 : les accents
 * se décomposent et tout caractère non-ASCII présent dans le code change de
 * valeur. Ce squelette n'est donc pas de la décoration.
 *
 * Les options, toutes facultatives :
 *   `role`        — `data-role` porté par la page, lu par le chargeur.
 *   `tete`        — ce qui doit venir avant tout le reste (le préchargement).
 *   `application` — la page est installable : manifeste, icônes, service.
 *                   Le plan public, et lui seul (voir `outils/pwa.js`).
 *   `autonome`    — publiée seule, hors du domaine : rien à lier, pas même
 *                   une icône, le fichier voisin n'existerait pas.
 */
function page(contenu, options) {
  const { role, tete, application, autonome } = options || {};
  return '<!doctype html>\n<html lang="fr"' +
    (role ? ' data-role="' + role + '"' : "") + '>\n<head>\n' +
    '<meta charset="utf-8">\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
    (tete || "") +
    (autonome ? "" : pwa.TETE) +
    (application && !autonome ? pwa.APPLICATION : "") +
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
  page(connecte(tpl).replace("/*__PORTE_ADMIN__*/", "retireAdmin();"),
       { tete: PRECHARGE, application: true }));

/* --- page d'administration : accès après authentification --- */
fs.writeFileSync(W + "plan-admin.html",
  page(connecte(tpl).replace("/*__PORTE_ADMIN__*/", auth), { role: "admin" }));

/* --- démonstration à données figées, publiable en artefact --- */
fs.writeFileSync(W + "plan-smcl.html",
  page(tpl.replace("/*__DATA__*/", () => fs.readFileSync(D + "/plans.json", "utf8"))
          .replace("/*__PORTE_ADMIN__*/", "retireAdmin();"), { autonome: true }));

/* --- configuration et feuille de style livrées avec les pages --- */
fs.copyFileSync(D + "/gabarit/_config.js", W + "config.js");
// la console et le rapport la partagent : elle ne peut plus vivre dans l'une
fs.copyFileSync(D + "/gabarit/_console.css", W + "console.css");

/* --- page d'accueil : la racine ne doit pas répondre 404 --- */
fs.writeFileSync(W + "index.html",
  page(fs.readFileSync(D + "/gabarit/_index.html", "utf8")));

/* --- la console et le rapport ---
   Ils partagent leur socle : accès au projet, fenêtres, connexion, thème.
   Chacun n'écrit ensuite que ce qui lui est propre. */
const socle = fs.readFileSync(D + "/gabarit/_console-base.html", "utf8");
const assemble = (tete, ...corps) =>
  fs.readFileSync(D + "/gabarit/" + tete, "utf8") + socle +
  corps.map((c) => fs.readFileSync(D + "/gabarit/" + c, "utf8")).join("");

/* Les deux écrans exportent le même classeur : le module d'écriture puis celui
   de l'export passent avant, et c'est la page qui ferme le script. */
fs.writeFileSync(W + "admin-plans.html",
  page(assemble("_console-head.html", "_classeur.html", "_export.html", "_console-js.html")));

fs.writeFileSync(W + "rapport.html",
  page(assemble("_rapport-head.html", "_classeur.html", "_export.html", "_rapport-js.html")));

/* --- poser son mot de passe ---
   Elle n'emprunte pas le socle : on y arrive sans session, avec pour seul
   bagage le jeton d'un lien reçu par courriel. Un écran de connexion y serait
   un contresens. */
fs.writeFileSync(W + "motdepasse.html",
  page(fs.readFileSync(D + "/gabarit/_motdepasse.html", "utf8")));

/* --- la page que le service rend quand le réseau manque --- */
fs.writeFileSync(W + "hors-ligne.html",
  page(fs.readFileSync(D + "/gabarit/_hors-ligne.html", "utf8")));

/* --- de quoi s'installer : le manifeste et les icônes ---
   Les icônes sont dessinées par `icones.js` plutôt que déposées en image :
   quatre tailles pour un seul dessin, et rien à rouvrir dans un éditeur le
   jour où l'on change une couleur. */
fs.writeFileSync(W + "manifeste.webmanifest", pwa.manifeste());
fs.writeFileSync(W + "icone.svg", icones.svg());
fs.writeFileSync(W + "icone-192.png", icones.png(192));
fs.writeFileSync(W + "icone-512.png", icones.png(512));
fs.writeFileSync(W + "icone-masque-512.png", icones.png(512, "masquable"));
// iOS ne lit pas le manifeste pour cela : il veut son lien et sa taille à lui
fs.writeFileSync(W + "icone-180.png", icones.png(180, "pomme"));

/**
 * Tout ce que la construction pose dans `web/`, service de second plan mis à
 * part : c'est de là qu'il tire sa version, il ne peut pas s'y compter.
 */
const FABRIQUEES = [
  "index.html", "plan.html", "plan-admin.html", "plan-smcl.html",
  "admin-plans.html", "rapport.html", "motdepasse.html", "hors-ligne.html",
  "config.js", "console.css", "manifeste.webmanifest",
  "icone.svg", "icone-192.png", "icone-512.png", "icone-masque-512.png", "icone-180.png",
];

/* --- le service de second plan ---
   Sa version nomme le cache, et met au rebut celui d'avant : elle doit donc
   changer quand les pages changent, et seulement là. Un horodatage aurait
   changé à chaque construction — `npm run verifie` aurait vu `web/` bouger
   sans que rien n'ait été touché, et le cache du visiteur aurait été jeté à
   chaque mise en ligne, y compris celles qui ne le concernaient pas. Une
   empreinte de ce qui vient d'être produit dit exactement la bonne chose. */
const empreinte = crypto.createHash("sha256");
for (const f of FABRIQUEES) empreinte.update(f).update(fs.readFileSync(W + f));
const version = empreinte.digest("hex").slice(0, 12);

fs.writeFileSync(W + "sw.js",
  fs.readFileSync(D + "/gabarit/_sw.js", "utf8").replace("__VERSION__", version));

for (const f of FABRIQUEES.filter((n) => n.endsWith(".html"))) {
  const s = fs.readFileSync(W + f, "utf8");
  console.log(f.padEnd(18), (s.length / 1024).toFixed(0).padStart(5) + " Ko",
    "· charset " + (s.indexOf('<meta charset="utf-8">') > 0 ? "oui" : "NON"),
    // c'est la présence du module d'accès qui compte, pas une simple mention :
    // le chargeur en cite le nom pour rouvrir l'écran sur session expirée
    "· admin " + (s.indexOf("function ecranAcces(") > 0 ? "authentifié" : "retiré"),
    // une seule page doit s'installer : le relire ici évite de le découvrir
    // sur un téléphone, un mois plus tard
    (s.indexOf('rel="manifest"') > 0 ? "· application" : ""));
}
console.log("sw.js".padEnd(18), "version " + version);
