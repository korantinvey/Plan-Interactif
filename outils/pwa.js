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
 * la page, elle, nomme le sien : `manifeste.webmanifest?salon=…`. Le relais
 * (`src/index.mjs`) reprend alors ce même fichier et y écrit l'adresse du
 * salon. Un seul manifeste à tenir, aucun à fabriquer par salon. Sans
 * JavaScript, le fichier nu reste installable.
 *
 * **Chaque salon a son chemin**, et c'est ce qui sépare les applications les
 * unes des autres : `/plan-smcl-2026` sert la même page que `/plan?plan=…`, le
 * relais s'en charge. Le paramètre ne pouvait pas y suffire — la portée d'un
 * manifeste ne connaît que des chemins, et ce qui suit le point
 * d'interrogation ne compte pour rien. Tous les salons partageant `/plan`,
 * l'application installée pour l'un revendiquait la racine du domaine, donc
 * tout le site : le système lui donnait le plan de n'importe quel autre salon,
 * et la console avec.
 *
 * `scope` est donc écrit, et vaut l'adresse du salon : l'application n'ouvre
 * plus que lui. Ce qui en sort — un autre salon, la console, la page
 * d'administration — repart dans le navigateur, comme il se doit.
 *
 * Le paramètre `?plan=`, lui, n'a pas changé de sens : c'est toujours lui
 * qu'on imprime, qu'on partage et qu'on scanne. Il ouvre le navigateur, et le
 * visiteur qui a l'application se la voit proposer (`_installation.html`).
 *
 * Le nom suit le même chemin que l'adresse de départ, et pour la même raison :
 * l'icône posée sur l'écran d'accueil doit porter le salon qu'on installe — «
 * Plan SMCL by Event2Map » — non le produit qui le sert. La page ne peut pas
 * le dire : le manifeste est lu avant qu'elle ait reçu quoi que ce soit de
 * l'API. Elle nomme donc le salon, `salon=<slug>`, et c'est le relais qui va
 * chercher son nom et l'écrit (`src/index.mjs` `manifeste`) — ou celui que
 * l'exploitant a écrit pour son application, qui l'emporte. Le slug, lui, est
 * connu dès l'en-tête : il est dans l'adresse, ou c'est celui du salon par
 * défaut, que la construction pose ici.
 *
 * Rien n'est donc pris à l'adresse de la page : un lien fabriqué ne peut pas
 * faire installer une application au nom qu'il choisit. Le nom vient de la
 * base, le tour de phrase du relais, et la page n'y met qu'un slug.
 *
 * Les icônes déclarées plus bas suivent la même règle que le nom : elles ne
 * valent que par défaut. Un salon qui a déposé son logo depuis l'onglet
 * « Admin » du plan (`_application.html`) voit le relais remplacer cette liste
 * par des adresses qu'il sert de la base — celles d'ici restent la marque du
 * produit, pour tous les salons qui n'ont rien déposé.
 *
 * iOS fait exception, et se corrige ailleurs : il ne lit pas le manifeste pour
 * l'écran d'accueil mais `apple-mobile-web-app-title` et `apple-touch-icon`,
 * écrits ici même, avant que le salon soit connu. `_installation.html`
 * `nommeApplication` les reprend dès les données arrivées — les balises sont
 * relues au moment de l'ajout.
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
    /* Le nom du produit, pour le seul cas où le relais n'a pas su nommer le
       salon : un manifeste demandé sans slug, ou une base muette. Autrement
       c'est « Plan <salon> by Event2Map » qui part (`src/index.mjs`). */
    name: "Plan interactif",
    /* Ce que le système écrit sous l'icône : place pour une douzaine de signes.
       Le relais y met le salon seul — c'est lui qu'on y cherche du regard, et
       le reste du nom n'y tiendrait pas. */
    short_name: "Plan",
    description: "Le plan du salon : ses exposants, ses zones et son programme.",
    lang: "fr",
    dir: "ltr",
    /* Trois voies mènent au plan d'un bord à l'autre de l'écran, et chacune a
       son prix. Elles ont toutes été éprouvées sur l'appareil ; ce qui suit
       est le relevé, pour que le jour où l'on rebascule tienne au changement
       d'un mot.

       « standalone », retenu. La fenêtre prend l'écran entier — 835 points sur
       835, mesurés — et la barre du salon s'étend derrière l'heure, qui
       s'écrit alors sur la couleur du salon plutôt que sur du noir. Son prix :
       les quarante-trois points de cette bande restent à l'horloge, et le
       contenu de la barre se range dessous (`viewport-fit=cover`, jetons
       `--sys-*` de `_head.html`).

       « fullscreen ». L'horloge et la poignée de gestes s'effacent, et le
       système ne prévient personne — c'est l'installation qui l'a accordé.
       Mais Android ouvre alors une fenêtre plus courte que l'écran : 792
       points sur 835, la bande de la caméra restant noire, hors de la page et
       impeignable, jusqu'à ce qu'on sorte de l'application et qu'on y revienne.
       Réécrire la balise du viewport pour lui faire revoir cette taille, trois
       fois et à trois moments, n'y a rien changé.

       Le plein écran demandé par la page, enfin. La fenêtre étant déjà grande
       comme l'écran, les quarante-trois points reviennent au plan. Mais un
       navigateur annonce chaque passage par un bandeau — « pour quitter,
       faites glisser », le nom du domaine avec — trois à cinq secondes durant,
       qu'aucune option n'abrège : c'est la garantie qu'une page ne se fera pas
       passer pour le système.

       Bande noire, bandeau, ou l'heure sur la couleur du salon : c'est la
       troisième qui a été choisie. Un plein écran sans rien de tout cela
       demanderait une application native, publiée sur un magasin. */
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
    /* L'application se déclare parente d'elle-même, et ce n'est pas un jeu de
       mots : `getInstalledRelatedApps()` ne sait dire qu'une chose, « telle
       application est-elle posée sur cet appareil ? », et c'est en se nommant
       soi-même qu'une page obtient la réponse pour la sienne. Le plan s'en
       sert pour savoir qu'il est lu dans le navigateur alors que
       l'application est là, à côté (`_installation.html`).

       L'adresse est relative, et le relais la remplace par celle du manifeste
       qu'on lui a demandé — paramètres compris : l'application installée est
       identifiée par l'adresse d'où elle l'a été, et `manifeste.webmanifest`
       tout court n'est celle de personne (`src/index.mjs`).

       `prefer_related_applications` est écrit alors qu'il vaut déjà faux : à
       vrai, il ferait de cette parenté une raison de ne plus proposer
       l'installation du tout, et le lecteur qui découvre la ligne au-dessus
       mérite de voir tout de suite que ce n'est pas ce qui est dit. */
    prefer_related_applications: false,
    related_applications: [{ platform: "webapp", url: "manifeste.webmanifest" }],
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
 */
const TETE = [
  // l'onglet prend la marque réduite : le monogramme entier s'y empâte
  '<link rel="icon" href="icone-onglet.svg" type="image/svg+xml">',
  "",
].join("\n");

/**
 * La couleur dont un navigateur mobile peint sa barre d'adresse, application
 * ou pas. Elle se décline en deux, parce que les pages du domaine ne se
 * ressemblent plus sur ce point.
 *
 * Le plan n'a qu'un thème, le clair : une couleur, sans condition. Poser la
 * paire lui laissait une barre nuit au-dessus d'une page claire, sur tout
 * téléphone dont le thème sombre avait été réglé une fois puis oublié.
 *
 * La console, le rapport et l'invitation ont les deux thèmes et suivent la
 * préférence de l'appareil : à eux la paire, une couleur par préférence.
 */
const BARRE_CLAIRE = '<meta name="theme-color" content="' + TON_CLAIR + '">\n';
const BARRE_DEUX_THEMES = [
  '<meta name="theme-color" media="(prefers-color-scheme: light)" content="' + TON_CLAIR + '">',
  '<meta name="theme-color" media="(prefers-color-scheme: dark)" content="' + TON_SOMBRE + '">',
  "",
].join("\n");

/**
 * Ce qui fait l'application, et que seule la page du plan public porte.
 *
 * Deux déclarations et deux scripts : le manifeste à installer, l'icône que
 * réclame iOS, le salon ouvert et son adresse de départ, et le service qui
 * gardera ce qui a servi. Sur toute autre page, ces lignes proposeraient
 * d'installer un outil de travail — et le service s'y installerait pour un
 * écran qui ne sait rien faire sans réseau.
 *
 * Le salon par défaut vient de `genere.js`, qui le connaît : c'est lui que la
 * page ira chercher faute de `?plan=`, et donc lui qu'il faut nommer.
 */
const application = (slugDefaut) => [
  '<link rel="manifest" href="manifeste.webmanifest">',
  /* L'icône que pose un ajout à l'écran d'accueil : iOS ne lit pas celles du
     manifeste, celle-ci est tout ce qu'il a. `nommeApplication` la remplace
     par celle du salon dès les données arrivées, comme il fait du nom plus
     bas — les deux balises sont relues au moment de l'ajout. */
  '<link rel="apple-touch-icon" href="icone-180.png">',
  /* iOS ne lit pas `display` du manifeste : sans cette ligne, le plan ajouté à
     l'écran d'accueil s'y ouvre encore dans Safari, barres comprises. Sa
     remplaçante normalisée est donnée aussi, la première étant dépréciée. */
  '<meta name="mobile-web-app-capable" content="yes">',
  '<meta name="apple-mobile-web-app-capable" content="yes">',
  '<meta name="apple-mobile-web-app-status-bar-style" content="default">',
  '<meta name="apple-mobile-web-app-title" content="Plan">',
  "<script>",
  "/* Le manifeste retenu à l'installation doit porter le salon qu'on regarde :",
  "   son nom, ses icônes, et le territoire où l'application vivra. Le relais",
  "   écrit tout cela ; ce qui est dit ici, c'est de quel salon il s'agit. */",
  "{",
  "  /* Bloc fermé : les modules d'une page sont soudés dans un espace de noms",
  "     unique, où deux noms identiques se marchent dessus. Ceux-là n'ont rien",
  "     à y faire. */",
  '  const lienManifeste = document.querySelector(\'link[rel="manifest"]\');',
  "  /* Le salon se lit là où il se trouve : dans le paramètre qu'on imprime et",
  "     qu'on partage, ou dans le chemin que l'application installée ouvre. La",
  "     même règle que `_js.html` `SLUG`, réécrite ici faute de pouvoir la lui",
  "     emprunter — ce bloc-ci tourne avant que rien d'autre ne soit là. */",
  '  const chemin = location.pathname.match(/^\\/plan-([a-z0-9][a-z0-9-]{0,63})$/);',
  '  const salon = new URLSearchParams(location.search).get("plan") ||',
  "    (chemin && chemin[1]);",
  "  if (lienManifeste){",
  "    /* Le salon est nommé même sans `?plan=` : la page montre alors celui que",
  "       la construction a posé par défaut, et une application installée de là",
  "       doit porter son nom comme les autres. */",
  '    lienManifeste.href = "manifeste.webmanifest?salon=" +',
  "      encodeURIComponent(salon || " + JSON.stringify(slugDefaut) + ");",
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

module.exports = { TETE, BARRE_CLAIRE, BARRE_DEUX_THEMES, application, manifeste };
