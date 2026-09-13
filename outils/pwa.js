/**
 * Ce qui fait du plan public une application installable.
 *
 * Trois pièces, et une idée qui les tient ensemble :
 *
 *   — le manifeste (`manifeste.webmanifest`), qui dit au système comment
 *     nommer, peindre et lancer l'application ;
 *   — l'en-tête que porte la page du plan : le lien vers ce manifeste, les
 *     icônes de l'installation, et ce qu'iOS demande en propre ;
 *   — l'inscription du service de second plan (`_sw.js`), qui garde ce qui a
 *     servi et rend le plan consultable sans réseau.
 *
 * **Le plan public, et lui seul.** La console, le rapport, l'administration et
 * la page de mot de passe sont des outils de travail : on les ouvre dans un
 * navigateur, à côté d'autre chose, et on n'a que faire d'une icône de plus sur
 * son bureau. Leur proposer l'installation, c'était offrir une application qui
 * ne sert à rien hors ligne — ces écrans ne tiennent pas sans leur session ni
 * sans la base. Le visiteur du salon, lui, est précisément celui qui veut
 * l'icône et le plan sans réseau. Ces pages-là gardent donc seulement ce qui
 * n'a rien à voir avec l'installation : l'icône d'onglet, et la couleur dont
 * le navigateur peint sa barre.
 *
 * L'idée : **le manifeste fabriqué ici ne vaut que par défaut**, et c'est le
 * relais qui lui donne son salon.
 *
 * Une même page sert tous les salons — c'est le paramètre `?plan=` qui tranche
 * — quand le manifeste, lui, est fabriqué une fois pour toutes. Il ne peut donc
 * désigner une page de départ sans les trahir tous sauf un : installé depuis le
 * plan d'un salon, il rouvrait celui d'un autre. La spécification prévoit bien
 * qu'un `start_url` absent vaille « la page depuis laquelle on installe », ce
 * qui aurait tout réglé, mais Chromium refuse alors d'installer : il vérifie la
 * validité d'une adresse qu'il n'a pas encore remplacée (`start-url-not-valid`).
 *
 * Le manifeste part donc avec l'adresse nue — `plan`, le salon par défaut — et
 * la page, elle, demande le sien : `manifeste.webmanifest?depart=…`. Le relais
 * (`src/index.mjs`) reprend alors ce même fichier et n'y change que l'adresse de
 * départ. Un seul manifeste à tenir, aucun à fabriquer par salon, et rien à lire
 * en base pour le servir. Sans JavaScript, le fichier nu reste installable.
 *
 * `scope` est absent, lui : il se déduit de `start_url` privé de son fichier,
 * soit la racine du domaine. Tout le site reste donc dans l'application, d'un
 * plan à l'autre comme du plan à la console.
 *
 * Ce que le manifeste ne peut pas faire, en revanche, c'est porter le nom du
 * salon : il est lu avant que la page ait appelé l'API. L'onglet et son icône,
 * eux, prennent le nom et l'icône du salon dès que les données arrivent
 * (`_js.html` `poseFavicon`) ; ce qui est écrit ici n'est que ce qu'on voit
 * avant, et ce que l'installation retient.
 */

/* La barre du système prend la couleur de la barre de la page — la surface, et
   non le fond : c'est elle qui touche le haut de l'écran. */
const TON_CLAIR = "#FBFBF8";
const TON_SOMBRE = "#171B1E";
/* Le fond, lui, est celui de la page : c'est lui que le système peint pendant
   le lancement, avant que rien ne soit affiché. */
const FOND = "#E9EAE4";

/** Le manifeste, tel qu'il part dans `web/`. */
function manifeste() {
  return JSON.stringify({
    name: "Plan interactif",
    // ce que le système écrit sous l'icône : place pour une douzaine de signes
    short_name: "Plan",
    description: "Le plan du salon : ses exposants, ses zones et son programme.",
    lang: "fr",
    dir: "ltr",
    display: "standalone",
    /* L'adresse par défaut, celle d'une visite sans `?plan=` : la page du plan,
       qui retombe alors sur le salon par défaut. Le relais la remplace par
       celle du salon d'où l'on installe. `id` n'est pas déclaré — il vaut
       `start_url`, et chaque salon devient ainsi sa propre application. */
    start_url: "plan",
    orientation: "any",
    background_color: FOND,
    theme_color: TON_CLAIR,
    categories: ["navigation", "business"],
    icons: [
      // la vectorielle d'abord : c'est la seule qui tienne à toutes les tailles
      { src: "icone.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "icone-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "icone-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      /* Android rogne l'icône à la forme du système : sans une version dessinée
         pour l'être, il pose la nôtre dans un carré blanc, en timbre-poste. */
      { src: "icone-masque-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  }, null, 2) + "\n";
}

/**
 * L'en-tête commun à toutes les pages servies depuis le domaine.
 *
 * Rien ici ne relève de l'installation : deux lignes d'habillage, que tout
 * écran mérite. L'icône vectorielle est posée comme icône d'onglet — jusqu'ici
 * les pages n'en déclaraient aucune, et le navigateur réclamait un
 * `/favicon.ico` qui n'existe pas. Sur les pages du plan, celle du salon la
 * remplace dès que les données arrivent : `poseFavicon` reprend ce même lien.
 * La couleur, elle, est celle dont un navigateur mobile peint sa barre
 * d'adresse, application ou pas.
 */
const TETE = [
  '<link rel="icon" href="icone.svg" type="image/svg+xml">',
  '<meta name="theme-color" media="(prefers-color-scheme: light)" content="' + TON_CLAIR + '">',
  '<meta name="theme-color" media="(prefers-color-scheme: dark)" content="' + TON_SOMBRE + '">',
  "",
].join("\n");

/**
 * Ce qui fait l'application, et que seule la page du plan public porte.
 *
 * Deux déclarations et deux scripts : le manifeste à installer, l'icône que
 * réclame iOS, l'adresse de départ propre au salon ouvert, et le service qui
 * gardera ce qui a servi. Sur toute autre page, ces lignes proposeraient
 * d'installer un outil de travail — et le service s'y installerait pour un
 * écran qui ne sait rien faire sans réseau.
 */
const APPLICATION = [
  '<link rel="manifest" href="manifeste.webmanifest">',
  '<link rel="apple-touch-icon" href="icone-180.png">',
  /* iOS ne lit pas `display` du manifeste : sans cette ligne, le plan ajouté à
     l'écran d'accueil s'y ouvre encore dans Safari, barres comprises. Sa
     remplaçante normalisée est donnée aussi, la première étant dépréciée. */
  '<meta name="mobile-web-app-capable" content="yes">',
  '<meta name="apple-mobile-web-app-capable" content="yes">',
  '<meta name="apple-mobile-web-app-status-bar-style" content="default">',
  '<meta name="apple-mobile-web-app-title" content="Plan">',
  "<script>",
  "/* Le manifeste retenu à l'installation doit porter le salon qu'on regarde,",
  "   sans quoi l'application rouvrirait le salon par défaut. Le relais complète",
  "   le manifeste avec l'adresse demandée ici ; elle est reconstruite et non",
  "   recopiée, pour que rien d'autre que le salon n'y entre — ni jeton de",
  "   courriel, ni ancre, ni paramètre de passage. */",
  "{",
  "  /* Bloc fermé : les modules d'une page sont soudés dans un espace de noms",
  "     unique, où deux noms identiques se marchent dessus. Ces deux-là n'ont",
  "     rien à y faire. */",
  '  const lienManifeste = document.querySelector(\'link[rel="manifest"]\');',
  '  const salon = new URLSearchParams(location.search).get("plan");',
  "  if (lienManifeste && salon){",
  '    lienManifeste.href = "manifeste.webmanifest?depart=" +',
  '      encodeURIComponent(location.pathname + "?plan=" + salon);',
  "  }",
  "}",
  "/* Le service de second plan s'inscrit une fois la page chargée : inscrit",
  "   plus tôt, son téléchargement disputerait la bande passante à l'appel qui",
  "   ramène le plan — celui que le visiteur attend. Un refus n'est pas une",
  "   panne : sans lui la page marche comme avant, en ligne seulement.",
  "",
  "   Il n'est inscrit que d'ici, mais un service inscrit vaut pour tout le",
  "   domaine — c'est la règle du navigateur, un fichier servi à la racine ne",
  "   peut pas se limiter à une page. Un exploitant qui ouvre la console après",
  "   avoir vu un plan passera donc par lui : il n'y trouvera que le réseau",
  "   d'abord, et jamais rien de ce qui porte une identité. */",
  'if ("serviceWorker" in navigator){',
  '  addEventListener("load", () => {',
  '    navigator.serviceWorker.register("sw.js").catch(() => {});',
  "  });",
  "}",
  "</" + "script>",
  "",
].join("\n");

module.exports = { TETE, APPLICATION, manifeste };
