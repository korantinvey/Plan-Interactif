const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const icones = require("./icones.js");
const pwa = require("./pwa.js");
const traductions = require("./traductions.js");
const reserve = require("./reserve.js");
const modules = require("./modules.js");
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
 * Les commentaires retirés de ce qui part chez le visiteur.
 *
 * Le gabarit est abondamment commenté, et c'est voulu : il dit pourquoi chaque
 * chose est comme elle est. Mais ce récit voyageait avec la page — plus de la
 * moitié de `plan.html`, compressé compris — et quiconque ouvrait les sources
 * le lisait, exemples d'adresses compris. Il reste donc dans `outils/gabarit/`
 * et s'arrête ici.
 *
 * Pour les scripts, c'est acorn qui dit où sont les commentaires : un `//` dans
 * une adresse, un `/*` dans une chaîne ou une expression régulière n'en sont
 * pas, et seul un analyseur le sait. Il ne fait que les situer — on les découpe
 * dans le texte d'origine, sans rien réimprimer : le code servi est celui du
 * gabarit, à l'octet près, commentaires en moins. Un outil qui réimprime
 * (esbuild, essayé d'abord) gardait les commentaires posés dans un objet ou au
 * milieu d'une expression, et semait les siens.
 *
 * Les espaces restent : les retirer ne gagnait presque rien une fois la page
 * compressée, et une erreur remontée par un navigateur doit encore désigner
 * une ligne lisible.
 */
const acorn = require("acorn");

function epureScript(code, module) {
  const plages = [];
  acorn.parse(code, {
    ecmaVersion: "latest", sourceType: module ? "module" : "script",
    onComment: (bloc, texte, debut, fin) => plages.push([debut, fin]),
  });
  return retire(code, plages);
}

/* Le CSS n'a que deux pièges, les chaînes et les commentaires : pas besoin
   d'analyseur pour les distinguer. */
function epureStyle(code) {
  const plages = [];
  for (let i = 0; i < code.length; i++) {
    const c = code[i];
    if (c === '"' || c === "'") {
      for (i++; i < code.length && code[i] !== c; i++) if (code[i] === "\\") i++;
    } else if (c === "/" && code[i + 1] === "*") {
      const fin = code.indexOf("*/", i + 2);
      if (fin < 0) throw new Error("commentaire CSS sans fin");
      plages.push([i, fin + 2]);
      i = fin + 1;
    }
  }
  return retire(code, plages);
}

/**
 * Découpe des plages de commentaires dans un texte. Un commentaire seul sur
 * ses lignes les emporte avec lui ; au milieu du code, il cède la place à un
 * blanc — un saut de ligne s'il en contenait un, car pour l'insertion
 * automatique des points-virgules un commentaire qui franchit une ligne vaut
 * une fin de ligne : `return /* … ⏎ … *\/ x` ne renvoie pas `x`, et ne doit
 * pas se mettre à le faire.
 */
function retire(code, plages) {
  const blanc = (c) => c === " " || c === "\t";
  let sortie = "", depuis = 0;
  for (const [debut, fin] of plages) {
    let a = debut, b = fin;
    while (a > depuis && blanc(code[a - 1])) a--;
    while (b < code.length && blanc(code[b])) b++;
    const enTete = a === 0 || code[a - 1] === "\n";
    const enQueue = b === code.length || code[b] === "\n" || code[b] === "\r";
    if (enTete && enQueue) {
      sortie += code.slice(depuis, a);
      depuis = code[b] === "\r" ? b + 2 : b + 1;
    } else {
      sortie += code.slice(depuis, enTete ? debut : a) +
        (/[\n\r\u2028\u2029]/.test(code.slice(debut, fin)) ? "\n" :
         enTete || enQueue ? "" : " ");
      depuis = b;
    }
  }
  return sortie + code.slice(Math.min(depuis, code.length));
}

function epure(html) {
  const morceaux = [];
  const balise = /<(script|style)\b([^>]*)>([\s\S]*?)<\/\1>/gi;
  let depuis = 0;
  for (let m; (m = balise.exec(html)); ) {
    morceaux.push(epureBalisage(html.slice(depuis, m.index)));
    const [, nom, attributs, code] = m;
    const module = /\btype="module"/.test(attributs);
    // un script chargé d'ailleurs n'a pas de corps ; des données ne sont pas du code
    const intact = /\bsrc=/.test(attributs) ||
      (nom.toLowerCase() === "script" && /\btype=/.test(attributs) && !module);
    morceaux.push(intact ? m[0] :
      "<" + nom + attributs + ">" +
      (nom.toLowerCase() === "style" ? epureStyle(code) : epureScript(code, module)) +
      "</" + nom + ">");
    depuis = balise.lastIndex;
  }
  morceaux.push(epureBalisage(html.slice(depuis)));
  return morceaux.join("");
}

/* Seul sur sa ligne, un commentaire l'emporte avec lui ; entre deux mots, il
   laisse un blanc, faute de quoi il les collerait. */
const epureBalisage = (s) =>
  s.replace(/[ \t]*<!--[\s\S]*?-->[ \t]*(\r?\n)?/g, (m, saut, i, tout) =>
    i === 0 || tout[i - 1] === "\n" ? "" : saut || " ");

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
 *                   elle au lieu de la border. `_styles-jetons.css` reprend alors les
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
  return epure('<!doctype html>\n<html lang="fr"' +
    (role ? ' data-role="' + role + '"' : "") + '>\n<head>\n' +
    '<meta charset="utf-8">\n' +
    /* `viewport-fit=cover` étend la page sous les barres du système au lieu de
       l'arrêter à leur bord. Le plan la demandait déjà lui-même, en repli et
       « faute de balise » — mais il n'en a jamais manqué, celle-ci étant posée
       ici depuis toujours : le repli ne s'est donc jamais déclenché, et le plan
       est resté bordé de gris. C'est ici que cela se décide. */
    '<meta name="viewport" content="width=device-width, initial-scale=1' +
      (pleinEcran ? ", viewport-fit=cover" : "") + '">\n' +
    /* L'amorce passe devant la langue : celle-ci peut être un fichier à part,
       que le navigateur attend avant de lire la suite — les demandes du plan
       partiraient sinon après lui. Elle n'a besoin de rien qu'il pose. */
    (tete || "") +
    langue(contenu, salon) +
    (autonome ? "" : pwa.TETE + (deuxThemes ? pwa.BARRE_DEUX_THEMES : pwa.BARRE_CLAIRE)) +
    (application && !autonome ? pwa.application(SLUG_DEFAUT) : "") +
    marques(contenu.replace("<!--__POLICES__-->", () => feuillePolices(autonome))) +
    "\n</body>\n</html>\n");
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
 * navigateur sans toucher le réseau ; perdu, `modules/demarrage.mjs` le redemande sous
 * la bonne version.
 *
 * Réservé à la page publique : l'administration doit d'abord présenter sa
 * session, sans quoi les brouillons resteraient invisibles.
 */
const PRECHARGE = [
  "<script>",
  "{",
  /* Le salon se lit là où il se trouve, comme dans `modules/salon.mjs` `SLUG` et dans
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

/** Branche la page sur l'API plutôt que sur des données figées. Les réglages
 *  se posent sur le script des modules : c'est `modules/salon.mjs` qui les lit. */
function connecte(t) {
  const marque = /<script data-modules="(plan|plan-admin)">/g;
  if ((t.match(marque) || []).length !== 1) throw new Error("script des modules introuvable, ou en double");
  return t
    .replace('<script id="data" type="application/json">/*__DATA__*/</script>',
             '<script id="data" type="application/json"></script>')
    .replace(marque, (m, entree) =>
      '<script data-modules="' + entree + '" data-api="' + API + '" data-slug="' + SLUG_DEFAUT + '">');
}

/* Le script d'un point d'entrée (`outils/gabarit/modules/`), posé en ligne ;
   la page le sort ensuite dans un fichier nommé par son empreinte. */
/* La marque du produit y entre par `define` (`MARQUE_PRODUIT`), et non par
   `marques` après coup : dans un script minifié, une substitution décalerait
   la carte de correspondance. */
const DEFINIS = { MARQUE_PRODUIT: JSON.stringify(uneLigne(icones.svgPage())) };
const scriptDesModules = (entree) =>
  '<script data-modules="' + entree + '">\n' + modules.assemble(entree, DEFINIS) + "</script>\n";
/* Le script des modules se pose après tout le balisage et les données : la
   suite des branchements qu'il lance (`modules/lancement.mjs`) trouve ainsi
   le document entier déjà lu. Un script resté en ligne après les données
   s'exécuterait après les modules, hors de son rang : on le refuse. */
const DONNEES = '<script id="data" type="application/json">/*__DATA__*/</script>';
function poseModulesDuPlan(t, entree) {
  if (t.split(DONNEES).length !== 2) throw new Error("données du plan introuvables, ou en double");
  const [avant, apres] = t.split(DONNEES);
  if (/<script\b(?![^>]*\bsrc=)/.test(apres))
    throw new Error("un script reste après les données du plan : son code doit vivre dans un module");
  return avant + DONNEES + scriptDesModules(entree) + apres;
}
/* Le gabarit sous ses deux formes : entier pour l'administration, amputé de
   ses tranches `@admin` pour le visiteur (voir `outils/reserve.js`). Les
   modules suivent la même partition : l'administration reçoit le point
   d'entrée qui reprend celui du plan et y ajoute les siens. */
const tplAdmin = poseModulesDuPlan(reserve.pourLAdmin(tpl), "plan-admin");
const tplPublic = poseModulesDuPlan(reserve.pourLePublic(tpl), "plan");
/* Un élément retiré du balisage public que le script public irait encore
   chercher ne casse rien ici : il casse chez le visiteur, au moment où ce
   code-là s'exécute. On le refuse donc avant d'écrire la moindre page. */
reserve.verifie(tplAdmin, tplPublic, "Le plan public");

/* La feuille du plan, servie à part.

   Posée dans la page, elle repartait avec elle à chaque mise en ligne : une
   ligne de code changée, et chaque visiteur retéléchargeait ses deux cents
   kilo-octets de styles. À part, sous un nom qui porte son empreinte, elle ne
   change jamais sous une même adresse : le navigateur la garde (`_headers`),
   le service de second plan aussi, et le plan public et l'administration se la
   partagent. La démonstration la garde en elle : publiée seule, elle n'a pas
   de fichier voisin. */
const STYLE_PLAN = /<style>\n(\/\* Les styles du plan, première feuille[\s\S]*?)<\/style>\n/;
const styleDuPlan = tpl.match(STYLE_PLAN);
if (!styleDuPlan) throw new Error("feuille du plan introuvable dans le gabarit");
/* Minifiée, sauf `PLAN_LISIBLE=1`, comme le script du plan (`modules.js`) :
   elle part chez chaque visiteur. Le gain est mince — un vingtième, les
   commentaires étant déjà partis — mais il ne coûte rien : une feuille ne
   remonte pas d'erreur qu'il faudrait relire à sa ligne. */
const minifieStyle = (css) => process.env.PLAN_LISIBLE === "1" ? css :
  require("esbuild").transformSync(css, { loader: "css", minify: true, logLevel: "silent" }).code;
const FEUILLE_PLAN = minifieStyle(epureStyle(styleDuPlan[1]));
const VERSIONS = "versions/";
// ce qu'une construction d'avant y a laissé ne sert plus à aucune page
fs.rmSync(W + VERSIONS, { recursive: true, force: true });
fs.mkdirSync(W + VERSIONS);
/** Ce qui est posé sous `versions/` par cette construction. */
const VERSIONNES = [];
/** Pose un fichier sous un nom qui porte son empreinte, et rend ce nom.
 *  `queue` ajoute au fichier ce qui dépend de ce nom même, hors de l'empreinte. */
function poseVersion(radical, extension, contenu, queue = () => "") {
  const nom = VERSIONS + radical + "." +
    crypto.createHash("sha256").update(contenu).digest("hex").slice(0, 10) + extension;
  if (!VERSIONNES.includes(nom)) {
    fs.writeFileSync(W + nom, contenu + queue(nom));
    VERSIONNES.push(nom);
  }
  return nom;
}
const NOM_FEUILLE = poseVersion("plan", ".css", FEUILLE_PLAN);
/* deck.gl, annoncé dès la tête de la page.

   C'est le plus lourd de ce que reçoit le visiteur, et le plan attend après
   lui pour paraître (`modules/webgl.mjs`, `gl-attente`). Or rien ne le
   demandait avant que le script des modules, posé au bas de la page, se soit
   exécuté : les deux se téléchargeaient l'un après l'autre. Annoncé ici, il
   part avec la feuille de style. Nom et intégrité sont lus dans le module
   même, pour qu'une bibliothèque refaite (`npm run deck`) ne laisse pas la
   page en annoncer une autre — qui partirait pour rien, et en double. */
const DECK = fs.readFileSync(D + "/gabarit/modules/webgl.mjs", "utf8")
  .match(/const DECK_WEBGL = \{\s*src: "([^"]+)",\s*integrite: "([^"]+)"/);
if (!DECK) throw new Error("DECK_WEBGL introuvable dans modules/webgl.mjs");
if (!fs.existsSync(W + DECK[1])) throw new Error("deck.gl absent : " + DECK[1]);
const ANNONCE_DECK = '<link rel="preload" as="script" href="/' + DECK[1] +
  '" integrity="' + DECK[2] + '">\n';
const lieFeuille = (t) =>
  t.replace(STYLE_PLAN, () => '<link rel="stylesheet" href="/' + NOM_FEUILLE + '">\n' + ANNONCE_DECK);
/* Ce qui porte son empreinte ne change jamais : un an, sans revalidation. Les
   pages, elles, gardent la règle de Cloudflare — revalider à chaque fois.
   deck.gl et les polices aussi portent la leur dans leur nom (`outils/deck.js`,
   `outils/polices.js`) ; laissés à cette règle-là, ils coûtaient au visiteur
   qui revient une demande au serveur chacun. Des polices, seuls les fichiers :
   leurs feuilles, `polices/<famille>.css`, gardent un nom fixe. */
const UN_AN = "\n  Cache-Control: public, max-age=31536000, immutable\n";
fs.writeFileSync(W + "_headers",
  ["/" + VERSIONS + "*", "/bibliotheques/*", "/polices/*.woff2"].map((m) => m + UN_AN).join(""));

/* Les scripts du plan, servis à part de même.

   Le script des modules pèse les quatre cinquièmes de la page, et le moteur de
   langue avec son dictionnaire presque tout le reste : la moindre retouche les
   faisait retélécharger entiers. Ils sortent après la construction de la page,
   et non avant — le dictionnaire se choisit d'après les modules que la page
   embarque, qu'il lit dans leur script en ligne. Chacun reste à sa place et
   garde son rang : un script à part, sans `defer` ni `async`, s'exécute là où
   il est posé, comme avant. Le script des modules garde ses réglages
   (`data-api`, `data-slug`) : `modules/salon.mjs` les lit sur
   `document.currentScript`, qui le désigne encore. */
const MODULES_EN_LIGNE = /<script (data-modules="(plan|plan-admin)"[^>]*)>([\s\S]*?)<\/script>/;
const LANGUE_EN_LIGNE = /<script>(\nwindow\.traduit = String;[\s\S]*?)<\/script>/;
/* Un script minifié part avec sa carte (`modules.js` `assemble`), posée à
   côté de lui sous son nom suivi de `.map`, et qu'il désigne en dernière
   ligne. La carte décrit le code tel qu'esbuild l'a rendu : si l'épuration de
   la page y avait touché, elle mentirait — on le refuse plutôt. */
function poseModules(entree, code) {
  if (process.env.PLAN_LISIBLE !== "1" && ["plan", "plan-admin"].includes(entree) &&
      !modules.carteDe(code))
    throw new Error(entree + " : le script minifié a changé depuis esbuild, sa carte ne vaudrait plus");
  const carte = modules.carteDe(code);
  if (!carte) return poseVersion(entree, ".js", code);
  return poseVersion(entree, ".js", code.trim(), (nom) => {
    fs.writeFileSync(W + nom + ".map", carte);
    return "\n//# sourceMappingURL=" + path.basename(nom) + ".map\n";
  });
}
/* Le dictionnaire anglais hors du moteur : il en pesait les trois quarts, et
   la plupart des visiteurs lisent le français. Il part dans son propre
   fichier, que le moteur ne charge qu'à la demande de l'anglais
   (`_langue.js` `chargeDico`) ; le moteur n'en garde que l'adresse. La
   construction s'arrête si l'un des deux repères manque : un moteur qui
   n'attendrait pas son dictionnaire resterait en français sans un mot. */
const SOURCE_EN_LIGNE = /let SOURCE = ("(?:[^"\\]|\\.)*");/;
const DICO_VIDE = 'const DICO_A_PART = "";';
function sortDictionnaire(moteur) {
  const d = moteur.match(SOURCE_EN_LIGNE);
  if (!d || moteur.split(DICO_VIDE).length !== 2) throw new Error("dictionnaire du moteur de langue introuvable");
  const dico = poseVersion("anglais", ".js", "window.__dicoArrive && window.__dicoArrive(" + d[1] + ");\n");
  return moteur.replace(SOURCE_EN_LIGNE, () => "let SOURCE = null;")
               .replace(DICO_VIDE, () => 'const DICO_A_PART = "/' + dico + '";');
}
function sortScripts(html) {
  const m = html.match(MODULES_EN_LIGNE), l = html.match(LANGUE_EN_LIGNE);
  if (!m || !l) throw new Error("script des modules ou de la langue introuvable");
  const modulesJs = poseModules(m[2], m[3]);
  const langueJs = poseVersion("langue", ".js", sortDictionnaire(l[1]));
  return html
    .replace(MODULES_EN_LIGNE, () => '<script ' + m[1] + ' src="/' + modulesJs + '"></script>')
    .replace(LANGUE_EN_LIGNE, () => '<script src="/' + langueJs + '"></script>');
}

/* La politique de sécurité des pages du plan.

   Ce qu'elle garde, c'est le script : une description d'exposant, un nom de
   zone, un logo viennent d'ailleurs, et `modules/sur.mjs` les relit avant de
   les poser ; si une injection passait quand même, elle ne pourrait rien
   exécuter. N'est permis que ce que la page sert elle-même, MapLibre à son
   adresse exacte, et les quelques scripts restés en ligne, chacun par son
   empreinte — calculée ici, sur ce qui part vraiment. Le reste est large à
   dessein : les logos et les tuiles viennent de partout (`img-src https:`),
   l'administration parle au projet Supabase que la console lui a donné
   (`connect-src https:`), et les styles posés par le code exigent
   `'unsafe-inline'`. MapLibre lance ses travaux depuis des `blob:`.

   Posée en balise et non en en-tête : la page se sert telle quelle par les
   fichiers statiques comme par le relais (`/plan-<salon>`), et la balise la
   suit partout. Elle vient juste après le jeu de caractères, avant tout script
   — elle ne protège que ce qui la suit. */
const MAPLIBRE = "https://cdn.jsdelivr.net/npm/maplibre-gl@4/dist/maplibre-gl.";
const EN_LIGNE = /<script((?:(?!\bsrc=)[^>])*)>([\s\S]*?)<\/script>/g;
function poseCsp(html) {
  const empreintes = [...html.matchAll(EN_LIGNE)]
    .filter(([, attributs, code]) => code.trim() && !/type="application\/json"/.test(attributs))
    .map(([, , code]) => "'sha256-" + crypto.createHash("sha256").update(code).digest("base64") + "'");
  const politique = [
    "default-src 'self'",
    /* Ni `eval`, ni WebAssembly : la bibliothèque entière de deck.gl
       compilait un décodeur, que sa version réduite au plan n'embarque plus
       (`outils/deck.js`), et MapLibre n'en a pas. */
    "script-src 'self' " + MAPLIBRE + "js " + empreintes.join(" "),
    "style-src 'self' 'unsafe-inline' " + MAPLIBRE + "css",
    "img-src 'self' https: data: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https: data: blob:",
    "worker-src 'self' blob:",
    "child-src 'self' blob:",
    "media-src 'self' https: data: blob:",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
  const charset = '<meta charset="utf-8">\n';
  if (html.split(charset).length !== 2) throw new Error("jeu de caractères introuvable, ou en double");
  return html.replace(charset, () => charset +
    '<meta http-equiv="Content-Security-Policy" content="' + politique + '">\n');
}

/* --- page publique : le mode administration n'est jamais activé --- */
fs.writeFileSync(W + "plan.html", poseCsp(sortScripts(
  page(lieFeuille(connecte(tplPublic)),
       { tete: PRECHARGE, application: true, pleinEcran: true,
         salon: SLUG_DEFAUT }))));

/* --- page d'administration : accès après authentification --- */
/* La bibliothèque des lieux ne sert qu'à poser des bâtiments : le visiteur
   n'en a que faire, elle ne part qu'avec l'administration. */
const LIEUX = fs.readFileSync(D + "/lieux.json", "utf8").trim().replace(/</g, "\\u003c");
/* Versée en données, devant celles du plan : le point d'entrée de
   l'administration la lit au lancement (`plan-admin.mjs` `lieux`). La balise
   d'ouverture des données ne change pas, alors que leur contenu, lui, est vidé
   sur une page branchée sur l'API (`connecte`) : c'est donc elle qu'on vise,
   et la construction s'arrête si elle manque plutôt que de livrer une
   administration sans bibliothèque. */
const OUVRE_DONNEES = '<script id="data" type="application/json">';
function poseLieux(t) {
  if (t.split(OUVRE_DONNEES).length !== 2) throw new Error("données du plan introuvables pour y poser les lieux");
  return t.replace(OUVRE_DONNEES, () =>
    '<script id="lieux" type="application/json">' + LIEUX + "</script>\n" + OUVRE_DONNEES);
}
fs.writeFileSync(W + "plan-admin.html", poseCsp(sortScripts(
  page(poseLieux(lieFeuille(connecte(tplAdmin))),
       { role: "admin", pleinEcran: true, salon: SLUG_DEFAUT }))));

/* --- démonstration à données figées, publiable en artefact --- */
fs.writeFileSync(W + "plan-smcl.html",
  page(tplPublic.replace("/*__DATA__*/", () => fs.readFileSync(D + "/plans.json", "utf8")),
       { autonome: true, pleinEcran: true }));

/* --- configuration et feuille de style livrées avec les pages --- */
fs.writeFileSync(W + "config.js",
  epureScript(fs.readFileSync(D + "/gabarit/_config.js", "utf8")));
// la console et le rapport la partagent : elle ne peut plus vivre dans l'une
fs.writeFileSync(W + "console.css",
  minifieStyle(epureStyle(fs.readFileSync(D + "/gabarit/_console.css", "utf8"))));


/* --- la console et le rapport ---
   Ils partagent leur socle : accès au projet, fenêtres, connexion, thème.
   Chacun n'écrit ensuite que ce qui lui est propre. */
const socle = fs.readFileSync(D + "/gabarit/_console-base.html", "utf8");

/* Une page dont tout le code est un module. Le script de son point d'entrée se
   pose après tout le balisage, là où se tenait le script de la page, qui n'en
   gardait que les branchements : il les fait lui-même, et ce qu'ils posaient
   au chargement trouve donc la page entière, comme avant. Un script en ligne
   resté dans la source s'exécuterait avant lui, hors de son rang : on le
   refuse plutôt que de le servir. */
function poseModulesSeuls(t, entree) {
  if (/<script\b(?![^>]*\bsrc=)[^>]*>/.test(t))
    throw new Error(entree + " : un script reste dans la page, son code doit vivre dans un module");
  return t + scriptDesModules(entree);
}

/* Chaque écran : son en-tête, le balisage du socle, puis le script de son
   point d'entrée, qui branche le socle, l'export et l'écran, dans cet ordre. */
const assemble = (entree, tete) =>
  poseModulesSeuls(fs.readFileSync(D + "/gabarit/" + tete, "utf8") + socle, entree);

/* Les deux écrans exportent le même classeur : l'écriture et l'export sont des
   modules (`modules/classeur.mjs`, `modules/export.mjs`), que chaque point
   d'entrée branche avant l'écran. La console fabrique en plus les vignettes
   des logos, avec la règle de recadrage du plan (`modules/marque.mjs`) : une
   vignette est cadrée comme la page l'aurait fait. */
fs.writeFileSync(W + "admin-plans.html",
  page(assemble("console", "_console-head.html"), { deuxThemes: true }));

fs.writeFileSync(W + "rapport.html",
  page(assemble("rapport", "_rapport-head.html"), { deuxThemes: true }));

/* --- poser son mot de passe ---
   Elle n'emprunte pas le socle : on y arrive sans session, avec pour seul
   bagage le jeton d'un lien reçu par courriel. Un écran de connexion y serait
   un contresens. */
fs.writeFileSync(W + "motdepasse.html",
  page(poseModulesSeuls(fs.readFileSync(D + "/gabarit/_motdepasse.html", "utf8"), "motdepasse"),
       { deuxThemes: true }));

/* --- page d'accueil : la racine ne doit pas répondre 404 ---
   Elle ne fait qu'aiguiller, comme la page du mot de passe sans socle. */
fs.writeFileSync(W + "index.html",
  page(poseModulesSeuls(fs.readFileSync(D + "/gabarit/_index.html", "utf8"), "accueil")));

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
  "config.js", "console.css", ...VERSIONNES, "_headers", "manifeste.webmanifest",
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

/* La même version, remise au Worker. Les pages ne sont plus versionnées :
   Cloudflare les construit au déploiement (`wrangler.jsonc` `build`). Le
   danger était un déploiement qui passe sans que la construction ait tourné
   — des pages absentes, un site vide. Le Worker importe donc ce fichier, que
   seule la construction écrit : s'il manque, l'empaquetage échoue, et rien
   ne part. La production garde alors la version d'avant, au lieu d'une page
   blanche. `/api/pages` la dit, pour savoir ce qui est en ligne. */
fs.writeFileSync(path.join(D, "..", "src", "pages.mjs"),
  "// Écrit par outils/genere.js — ne pas modifier, ne pas versionner.\n" +
  "export const VERSION_DES_PAGES = " + JSON.stringify(version) + ";\n");

fs.writeFileSync(W + "sw.js",
  epureScript(fs.readFileSync(D + "/gabarit/_sw.js", "utf8").replace("__VERSION__", version)));

for (const f of FABRIQUEES.filter((n) => n.endsWith(".html"))) {
  const s = fs.readFileSync(W + f, "utf8");
  console.log(f.padEnd(18), (s.length / 1024).toFixed(0).padStart(5) + " Ko",
    "· charset " + (s.indexOf('<meta charset="utf-8">') > 0 ? "oui" : "NON"),
    // c'est le script de l'administration qui compte, pas une simple mention :
    // ses noms de fonction ne survivent pas à la minification
    "· admin " + (/<script [^>]*src="\/versions\/plan-admin\./.test(s) ? "authentifié" : "retiré"),
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
  .filter((f) => /\.(html|js|css)$/.test(f) && CHEZ_GOOGLE.test(fs.readFileSync(W + f, "utf8")));
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
