const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const icones = require("./icones.js");
const pwa = require("./pwa.js");
const traductions = require("./traductions.js");
const D = __dirname;
// relatif au script : le dépôt doit se cloner n'importe où
const W = path.join(D, "..", "web") + path.sep;
/* Les pages passent par le Worker, qui relaie et met en cache (src/index.js).
   Adresse relative : même origine que la page, donc aucun contrôle d'origine
   croisée, et un déplacement de domaine ne demande rien. */
const API = "/api/plan";

/**
 * Les polices, déclarées dans l'en-tête des pages qui portent `<!--__POLICES__-->`.
 *
 * Elles venaient de Google, et chaque page ouverte lui transmettait l'adresse
 * IP de son visiteur ; `outils/polices.js` les a rapatriées dans `web/polices/`.
 * Les déclarations sont posées dans la page plutôt que dans une feuille à part :
 * une feuille coûterait un aller-retour de plus avant le premier texte, pour
 * quelques kilo-octets que la page porte sans peine. Le navigateur ne
 * télécharge ensuite que les fichiers dont un texte se sert.
 *
 * La page autonome embarque les fichiers eux-mêmes, en `data:` : publiée
 * seule, aucune adresse voisine ne lui répondrait.
 *
 * Seules les polices des modèles sont déclarées ainsi. Celles qu'un exploitant
 * peut préférer pour les noms ne se chargent qu'une fois choisies, par leur
 * feuille (`polices/<famille>.css`) : les déclarer toutes grossirait chaque
 * page pour des familles qu'un salon sur vingt emploie.
 */
const POLICES_JSON = JSON.parse(fs.readFileSync(D + "/polices.json", "utf8"));
const POLICES = POLICES_JSON.faces.filter((f) => !f.aLaDemande);
function feuillePolices(autonome) {
  return "<style>\n" + POLICES.map((f) =>
    "@font-face{" +
    Object.entries(f.descripteurs).map(([k, v]) => k + ":" + v).join(";") +
    ";src:url(" + (autonome
      ? "data:font/woff2;base64," +
        fs.readFileSync(W + "polices" + path.sep + f.fichier).toString("base64")
      : "polices/" + f.fichier) +
    ") format('woff2')}").join("\n") + "\n</style>";
}

/**
 * La marque du produit, posée dans les pages qui portent `<!--__MARQUE__-->`
 * ou `<!--__MARQUE_NU__-->` — la seconde pour une surface déjà dans la nuit.
 *
 * Elle est injectée plutôt que liée à `icone.svg` pour deux raisons. La page
 * autonome n'a pas de fichier voisin à qui demander quoi que ce soit, et
 * `icones.js` reste la seule description du dessin : un trait corrigé là se
 * retrouve du même coup dans l'onglet, sur l'écran d'accueil et dans la barre
 * d'administration.
 *
 * Sur une seule ligne, parce que deux des trois emplacements sont des chaînes
 * JavaScript — la fenêtre d'accès, la connexion de la console — où un retour
 * à la ligne couperait le littéral en deux.
 */
const uneLigne = (s) => s.replace(/\n/g, "");
function marques(html) {
  return html
    .split("<!--__MARQUE_NU__-->").join(uneLigne(icones.svgPageNu()))
    .split("<!--__MARQUE__-->").join(uneLigne(icones.svgPage()));
}

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
 *   `pleinEcran`  — la page va jusqu'aux bords de l'écran, sous les barres du
 *                   système : l'heure et la poignée de gestes se posent sur
 *                   elle au lieu de la border. `_head.html` reprend alors les
 *                   retraits par ses jetons `--sys-*`, faute de quoi le nom du
 *                   salon passerait sous l'horloge. Les pages du plan, qu'on
 *                   ouvre pour regarder un hall ; pas la console, qu'on lit
 *                   dans un onglet parmi d'autres.
 *   `autonome`    — publiée seule, hors du domaine : rien à lier, pas même
 *                   une icône, le fichier voisin n'existerait pas. Ses
 *                   polices viennent donc avec elle.
 *   `deuxThemes`  — la page a un thème clair et un thème sombre, et suit la
 *                   préférence de l'appareil : la barre du navigateur lui
 *                   demande donc une couleur par préférence. C'est le cas de
 *                   la console et de ce qui l'entoure. Les pages du plan n'ont
 *                   que le clair et n'en veulent qu'une (voir `outils/pwa.js`).
 */
function page(contenu, options) {
  const { role, tete, application, autonome, deuxThemes, pleinEcran,
          salon } = options || {};
  return '<!doctype html>\n<html lang="fr"' +
    (role ? ' data-role="' + role + '"' : "") + '>\n<head>\n' +
    '<meta charset="utf-8">\n' +
    /* `viewport-fit=cover` étend la page sous les barres du système au lieu de
       l'arrêter à leur bord. Le plan la demandait déjà lui-même, en repli et
       « faute de balise » — mais il n'en a jamais manqué, celle-ci étant posée
       ici depuis toujours : le repli ne s'est donc jamais déclenché, et le plan
       est resté bordé de gris. C'est ici que cela se décide. */
    '<meta name="viewport" content="width=device-width, initial-scale=1' +
      (pleinEcran ? ", viewport-fit=cover" : "") + '">\n' +
    langue(contenu, salon) +
    (tete || "") +
    (autonome ? "" : pwa.TETE + (deuxThemes ? pwa.BARRE_DEUX_THEMES : pwa.BARRE_CLAIRE)) +
    (application && !autonome ? pwa.application(SLUG_DEFAUT) : "") +
    marques(contenu.replace("<!--__POLICES__-->", () => feuillePolices(autonome))) +
    "\n</body>\n</html>\n";
}

/**
 * La version anglaise, posée en tête de chaque page : le moteur
 * (`gabarit/_langue.js`) et la part du dictionnaire que la page affiche.
 *
 * En tête, parce qu'il doit voir passer le balisage : demandée en anglais, la
 * page ne se montre jamais d'abord en français. La part seulement, parce que
 * le dictionnaire couvre toutes les pages — la console n'a que faire des
 * phrases de l'itinéraire, ni le plan public de celles des comptes.
 */
const MOTEUR_LANGUE = fs.readFileSync(D + "/gabarit/_langue.js", "utf8");
const DICTIONNAIRE = traductions.chargeDictionnaire();
function langue(contenu, salon) {
  const table = traductions.dictionnairePour(contenu, DICTIONNAIRE);
  // du texte JSON dans une chaîne JavaScript, où `</script>` ne doit pas paraître
  const texte = JSON.stringify(JSON.stringify(table)).replace(/</g, "\\u003c");
  /* Le salon que cette page montre faute de `?plan=` et de `/plan-<salon>`.
     Le moteur tourne en tête, avant le script qui porte `data-slug` : il ne
     peut pas le lui demander, et sans lui sa clé ne nommait aucun salon — ce
     que l'exploitant ferme sur `/plan` ne se relisait pas sur
     `/plan-<salon>`, et l'anglais reparaissait le temps d'un chargement. Vide
     pour une page qui ne montre aucun plan : elle n'écrit rien, donc ne lit
     rien. */
  return "<script>\n" +
    MOTEUR_LANGUE.replace("__DICTIONNAIRE__", () => texte)
                 .replace("__SALON_DEFAUT__", () => salon || "") +
    "</script>\n";
}

const SLUG_DEFAUT = "smcl-2026";

/**
 * Le plan est ce que le visiteur vient voir : les demandes partent depuis
 * l'en-tête, avant que le navigateur ait lu le reste du document. Cela gagne le
 * temps de lecture et d'analyse de la page — deux cents millisecondes environ.
 *
 * Elles sont deux, et partent ensemble. L'entête dit quelle version du plan se
 * sert aujourd'hui ; le plan, lui, est demandé sous la version qu'on avait la
 * dernière fois — pari qui se gagne presque toujours, un plan ouvert aux
 * visiteurs ne changeant qu'une fois par jour. Gagné, il sort du cache du
 * navigateur sans toucher le réseau ; perdu, `_admin2.html` le redemande sous
 * la bonne version.
 *
 * Réservé à la page publique : l'administration doit d'abord présenter sa
 * session, sans quoi les brouillons resteraient invisibles.
 */
const PRECHARGE = [
  "<script>",
  "{",
  /* Le salon se lit là où il se trouve, comme dans `_js.html` `SLUG` et dans
     `outils/pwa.js` : le paramètre qu'on partage, ou le chemin que
     l'application installée ouvre. Ce chemin-là est le seul qu'elle ouvre —
     elle n'a pas de `?plan=` —, si bien qu'un préchargement qui l'ignorait
     partait chercher le salon par défaut. Sur un appareil qui l'avait déjà vu,
     c'est son plan qui se dessinait ; sinon la version demandée n'était jamais
     la bonne, et la réponse ne se gardait nulle part. */
  '  const chemin = location.pathname.match(/^\\/plan-([a-z0-9][a-z0-9-]{0,63})$/);',
  '  const slug = new URLSearchParams(location.search).get("plan") ||',
  '    (chemin && chemin[1]) || "' + SLUG_DEFAUT + '";',
  '  const q = "' + API + '?slug=" + encodeURIComponent(slug);',
  "  /* L'entête dit quelle version se sert : cinquante octets, et c'est lui",
  "     qui nomme l'adresse du plan. */",
  '  window.__entete = fetch(q + "&entete=1")',
  "    .then((r) => (r.ok ? r.json() : null)).catch(() => null);",
  "  /* Et le plan sous la version qu'on avait la dernière fois, sans attendre",
  "     la réponse : si c'est toujours elle, il sort du cache du navigateur",
  "     sans toucher le réseau, et il est là quand l'entête répond. */",
  "  let v = null;",
  '  try { v = localStorage.getItem("plan-version:" + slug); } catch (e) {}',
  '  if (v) window.__plan = fetch(q + "&v=" + encodeURIComponent(v));',
  "}",
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
       { tete: PRECHARGE, application: true, pleinEcran: true,
         salon: SLUG_DEFAUT }));

/* --- page d'administration : accès après authentification --- */
/* La bibliothèque des lieux ne sert qu'à poser des bâtiments : le visiteur
   n'en a que faire, elle ne part qu'avec l'administration. */
const LIEUX = fs.readFileSync(D + "/lieux.json", "utf8").trim().replace(/</g, "\\u003c");
fs.writeFileSync(W + "plan-admin.html",
  page(connecte(tpl).replace("/*__PORTE_ADMIN__*/", auth)
                    .replace("/*__LIEUX__*/null", () => LIEUX),
       { role: "admin", pleinEcran: true, salon: SLUG_DEFAUT }));

/* --- démonstration à données figées, publiable en artefact --- */
fs.writeFileSync(W + "plan-smcl.html",
  page(tpl.replace("/*__DATA__*/", () => fs.readFileSync(D + "/plans.json", "utf8"))
          .replace("/*__PORTE_ADMIN__*/", "retireAdmin();"),
       { autonome: true, pleinEcran: true }));

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

/* Un module écrit pour le plan, qui assemble tout son code en un seul script :
   il n'a donc pas de balises à lui, et la console — qui juxtapose des modules
   qui en portent — les lui prête. */
const enScript = (f) =>
  "<script>\n" + fs.readFileSync(D + "/gabarit/" + f, "utf8") + "\n</script>\n";
const assemble = (tete, ...corps) =>
  fs.readFileSync(D + "/gabarit/" + tete, "utf8") + socle +
  corps.map((c) => fs.readFileSync(D + "/gabarit/" + c, "utf8")).join("");

/* Les deux écrans exportent le même classeur : le module d'écriture puis celui
   de l'export passent avant, et c'est la page qui ferme le script. */
/* La console fabrique les vignettes des logos : elle emprunte au plan la règle
   de recadrage, pour qu'une vignette soit cadrée comme la page l'aurait fait. */
fs.writeFileSync(W + "admin-plans.html",
  page(assemble("_console-head.html", "_classeur.html", "_export.html", "_console-js.html") +
    enScript("_marque.html"), { deuxThemes: true }));

fs.writeFileSync(W + "rapport.html",
  page(assemble("_rapport-head.html", "_classeur.html", "_export.html", "_rapport-js.html"),
       { deuxThemes: true }));

/* --- poser son mot de passe ---
   Elle n'emprunte pas le socle : on y arrive sans session, avec pour seul
   bagage le jeton d'un lien reçu par courriel. Un écran de connexion y serait
   un contresens. */
fs.writeFileSync(W + "motdepasse.html",
  page(fs.readFileSync(D + "/gabarit/_motdepasse.html", "utf8"), { deuxThemes: true }));

/* --- la page que le service rend quand le réseau manque --- */
fs.writeFileSync(W + "hors-ligne.html",
  page(fs.readFileSync(D + "/gabarit/_hors-ligne.html", "utf8")));

/* --- de quoi s'installer : le manifeste et les icônes ---
   Les icônes sont dessinées par `icones.js` plutôt que déposées en image :
   quatre tailles pour un seul dessin, et rien à rouvrir dans un éditeur le
   jour où l'on change une couleur. */
fs.writeFileSync(W + "manifeste.webmanifest", pwa.manifeste());
fs.writeFileSync(W + "icone.svg", icones.svg());
/* Le monogramme entier ne tient pas dans un onglet — à seize pixels une
   capitale fait quatre pixels de large. L'onglet reçoit donc la marque
   réduite : même bloc, même réserve rose, le seul chiffre. */
fs.writeFileSync(W + "icone-onglet.svg", icones.svgOnglet());
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
  "icone.svg", "icone-onglet.svg",
  "icone-192.png", "icone-512.png", "icone-masque-512.png", "icone-180.png",
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

/* Aucune page ne demande plus rien aux serveurs de polices de Google. Le
   relire ici plutôt qu'en relecture de code : une police ajoutée par l'ancienne
   voie — un `<link>` recopié d'un exemple, un chargement à la demande —
   referait partir l'adresse de chaque visiteur, et rien d'autre ne le dirait. */
const CHEZ_GOOGLE = /fonts\.(googleapis|gstatic)\.com/;
const fautives = FABRIQUEES.concat("sw.js")
  .filter((f) => /\.(html|js)$/.test(f) && CHEZ_GOOGLE.test(fs.readFileSync(W + f, "utf8")));
if (fautives.length) {
  console.error("\nPolices demandées à Google dans : " + fautives.join(", ") + ".\n" +
    "Déclarez la famille dans `outils/polices.js` (ou dans `POLICES_NOMS` pour une police\n" +
    "au choix), lancez `npm run polices`, et servez-la depuis `polices/` : chaque visiteur\n" +
    "transmettrait sinon son adresse IP à Google.");
  process.exit(1);
}

/* Et chaque police que l'onglet propose pour les noms est bien rapatriée, sous
   la graisse qu'il demande. Sans cela, la choisir laisserait le plan dans la
   police du modèle sans rien dire — et la tentation reviendrait de la
   redemander à Google. */
const { policesAuChoix, nomDeFichier, couvre } = require("./polices.js");
const absentes = policesAuChoix().filter((p) =>
  !fs.existsSync(W + "polices" + path.sep + nomDeFichier(p.nom) + ".css") ||
  !POLICES_JSON.faces.some((f) => f.aLaDemande && f.famille === p.nom &&
    couvre(f.descripteurs["font-weight"], p.graisse)));
if (absentes.length) {
  console.error("\nPolices proposées pour les noms, mais pas rapatriées : " +
    absentes.map((p) => p.nom + " " + p.graisse).join(", ") + ".\nLancez `npm run polices`.");
  process.exit(1);
}
