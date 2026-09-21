/**
 * Le service de second plan : ce qui rend le plan installable et consultable
 * sans réseau.
 *
 * Un salon se visite là où le réseau manque — un hall de béton, un forfait
 * épuisé, un wifi saturé par dix mille visiteurs. Or tout arrivait du serveur à
 * chaque ouverture : la page, ses polices, et le plan lui-même. Une barre à
 * zéro, et il ne restait qu'un écran vide portant « Plan indisponible ».
 *
 * Ce script s'installe au premier passage et se place ensuite entre la page et
 * le réseau. Il ne précharge rien : ce qui a servi une fois est gardé, et c'est
 * suffisant — on installe un plan de salon après l'avoir ouvert, jamais avant.
 * Précharger aurait retéléchargé le mégaoctet de la page au moment même où le
 * visiteur venait de le recevoir.
 *
 * Le principe tient en une ligne : **le réseau d'abord, partout**, et la copie
 * gardée seulement quand il manque. N'y échappe que ce dont l'adresse porte la
 * version — le fond de plan, les polices — qui ne peut pas être périmé. Rien
 * de ce qui est servi n'est donc plus vieux qu'avant ; ce service n'ajoute
 * qu'un secours. Servir d'abord la copie aurait été plus rapide d'un ou deux
 * dixièmes, au prix d'un rechargement de retard sur chaque mise en ligne —
 * une console repeinte par la feuille de style de la veille, par exemple.
 *
 * Trois règles ensuite, qui reprennent celles du relais (`src/index.mjs`)
 * parce que c'est le même document qui passe :
 *   — une demande porteuse d'une identité n'est ni lue ni écrite dans le
 *     cache : elle peut rendre un brouillon, qui n'appartient qu'à son
 *     exploitant, et le poste peut être partagé ;
 *   — les mesures d'usage ne font que passer, dans les deux sens ;
 *   — un cache en panne ne doit jamais empêcher une visite : tout ce qui
 *     s'écrit ici s'écrit sans être attendu, et toute panne retombe sur le
 *     réseau.
 *
 * La version est une empreinte de ce que la construction a produit : elle
 * change quand les pages changent, et pas autrement. Le cache est nommé avec
 * elle, si bien qu'une mise en ligne met au rebut tout ce qui précède plutôt
 * que de resservir la page d'avant sous les données d'après.
 *
 * Tout ne mérite pas ce sort, et c'est la raison du second cache. Ce que le
 * relais sert et dont l'adresse porte sa propre version — un fond de plan, une
 * vignette, un lot de vignettes — ne peut pas être périmé par une mise en
 * ligne : son nom changerait avant son contenu. Or il partait au rebut avec le
 * reste, et trois mises en ligne dans la journée faisaient retélécharger trois
 * fois deux mégaoctets de fond et huit cents kilo-octets de vignettes pour
 * retrouver exactement ce qu'on avait — trois fois, aussi, les lectures que le
 * relais paie à son stockage. Ce cache-là ne porte donc pas de version, et
 * survit aux mises en ligne.
 *
 * Il ne peut pas enfler pour autant : ce qui y entre chasse ce qu'il remplace
 * — voir `oublieLesVersionsDAvant`, `borneLesLots` et `borneLesTuiles`.
 *
 * Le fond de carte y est entré ensuite, et c'est la seule chose qu'on garde
 * d'ailleurs que de chez nous. Une tuile est nommée par son niveau et sa case :
 * elle relève exactement de la règle précédente, à ceci près qu'elle vient d'un
 * tiers, et qu'il faut la redemander pour que ce qu'on range soit lisible — voir
 * `tuileDeCarte`. La liste des fournisseurs est close ; tout le reste du web
 * passe toujours sans que ce service le voie.
 *
 * La mise en ligne qui apporte ce second cache emporte une dernière fois ce
 * qui était rangé sous la version d'avant : ces fonds et ces vignettes sont
 * dans le cache versionné, et c'est lui qu'on jette. C'est la dernière.
 */
const VERSION = "c8cdadfd4ae5";
const CACHE = "plan-" + VERSION;
const DURABLE = "plan-durable";
const HORS_LIGNE = "hors-ligne.html";

/* Combien de lots de vignettes on garde. Un lot pèse quatre cents kilo-octets
   et nomme les exposants qu'il porte : la liste change, l'adresse aussi, et
   l'ancien lot n'a plus rien à servir. Vingt-quatre bornent ce cache à dix
   mégaoctets, et couvrent huit listes d'exposants successives — un salon n'en
   demande que trois. */
const LOTS_GARDES = 24;

/* Les polices sont servies depuis `polices/`, sous des noms qui portent leur
   empreinte (voir `outils/polices.js`) : elles ne changent jamais sous une même
   adresse, et se gardent donc telles quelles. Sans elles, le plan mesure ses
   libellés dans une police de remplacement — les noms d'enseignes débordent de
   leurs stands. Les feuilles `.css` du même dossier ne portent pas d'empreinte :
   elles suivent la règle commune. */
const POLICES = /^\/polices\/[^/]+\.woff2$/;
/* La bibliothèque du dessin WebGL porte de même sa version dans son nom. */
const BIBLIOTHEQUES = /^\/bibliotheques\/[^/]+\.js$/;

/* Les fournisseurs du fond de carte, et eux seuls. Liste close comme les
   vocabulaires du reste du projet : ce service ne garde d'une autre origine
   que ce que le plan lui a explicitement demandé d'afficher.

   Les garder sert deux choses à la fois, et la seconde n'était pas cherchée.
   Hors ligne, le pavillon ne flotte plus sur du vide — c'était la demande. En
   ligne, le visiteur cesse de redemander vingt fois la même tuile à un tiers,
   donc de lui redonner vingt fois son adresse IP. Le plan tient à ne rien
   laisser fuir sans consentement ; un cache va dans ce sens, il ne s'y oppose
   pas. */
const FONDS_DE_CARTE = new Set([
  "https://data.geopf.fr",            // la Géoplateforme de l'IGN — plan, vue aérienne
  "https://tile.openstreetmap.org",   // OpenStreetMap en recours, hors de France
  "https://tiles.versatiles.org",     // les tuiles vectorielles de notre style, et ses glyphes
  "https://tiles.openfreemap.org",    // les styles vectoriels du commerce, en option
  "https://cdn.jsdelivr.net",         // MapLibre, chargé à la demande
]);

/**
 * Ce qui, chez ces fournisseurs, ne peut pas changer sous une même adresse.
 *
 * C'est la distinction déjà faite pour notre propre origine — n'échappe au
 * réseau que ce dont l'adresse porte sa version — appliquée à leur vocabulaire
 * à eux : une tuile est nommée par son niveau et sa case, un lot de glyphes par
 * sa police et sa plage de caractères. Tout cela se garde et se ressert.
 *
 * Le reste — un style, la bibliothèque, dont l'adresse ne nomme qu'une majeure
 * — suit la règle commune : le réseau d'abord, la copie en secours. Un style
 * corrigé chez son éditeur arrive donc au chargement suivant, comme nos propres
 * pages.
 *
 * La tuile d'un fond IGN ne se reconnaît pas au chemin : le service est un WMTS,
 * et sa case voyage dans les paramètres.
 */
const TUILE_XYZ = /\/\d+\/\d+\/\d+(\.\w+)?$/;
const GLYPHES = /\/glyphs\/[^/]+\/\d+-\d+\.pbf$/;
const estUneTuile = (u) =>
  u.searchParams.has("TILEROW") || TUILE_XYZ.test(u.pathname) || GLYPHES.test(u.pathname);

self.addEventListener("install", (e) => {
  /* La seule chose mise de côté d'avance : la page qui s'affiche quand tout le
     reste manque. Elle pèse deux kilo-octets, et c'est la seule qu'on ne peut
     pas avoir déjà visitée au moment où l'on en a besoin. */
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.add(new Request(HORS_LIGNE, { cache: "reload" })))
      .catch(() => {})
      .then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((noms) => Promise.all(
        noms.filter((n) => n.startsWith("plan-") && n !== CACHE && n !== DURABLE)
            .map((n) => caches.delete(n))))
      // sans cela, les onglets déjà ouverts resteraient sans service jusqu'à
      // leur prochain rechargement — soit toute la durée d'une visite
      .then(() => self.clients.claim()));
});

/** Range une copie de la réponse, sans faire attendre celle qui repart. */
function range(e, requete, reponse) {
  const copie = reponse.clone();   // avant tout `await` : le corps ne se lit qu'une fois
  /* Le service peut être arrêté sitôt la réponse rendue : sans cette retenue,
     l'écriture serait interrompue avant d'avoir rien rangé — et le secours
     manquerait justement à la visite d'après. */
  e.waitUntil(caches.open(CACHE).then((c) => c.put(requete, copie)).catch(() => {}));
  return reponse;
}

/**
 * Les copies d'un même document sous une version révolue.
 *
 * Le fond de plan porte sa version dans son adresse, et le plan lui-même
 * depuis qu'il a la sienne : une synchronisation en donne une neuve, et
 * l'ancienne n'a plus rien à servir. La comparaison couvre les deux sans rien
 * distinguer — un plan n'a pas de « fond » dans son adresse, et deux absences
 * se valent. Or rien ne l'effaçait — le nom
 * du cache ne change qu'à une mise en ligne des pages, et entre deux le même
 * pavillon s'y empilait une fois par synchronisation, à deux mégaoctets pièce.
 * Un salon qui se resynchronise chaque matin remplissait ainsi le quota du
 * téléphone d'un visiteur avec des plans que personne ne redemanderait, et le
 * navigateur finissait par jeter le cache entier — la consultation hors ligne
 * avec.
 *
 * On ne retient donc qu'une version par pavillon : la dernière servie.
 */
async function oublieLesVersionsDAvant(cache, adresse) {
  const memeFond = (u) =>
    u.origin === adresse.origin && u.pathname === adresse.pathname &&
    u.searchParams.get("slug") === adresse.searchParams.get("slug") &&
    u.searchParams.get("fond") === adresse.searchParams.get("fond") &&
    u.searchParams.get("v") !== adresse.searchParams.get("v");
  for (const cle of await cache.keys()) {
    let u;
    try { u = new URL(cle.url); } catch (_) { continue; }
    if (memeFond(u)) await cache.delete(cle);
  }
}

/**
 * Ce qui ne change jamais sous une même adresse : gardé d'abord, demandé après.
 *
 * Deux sortes s'y présentent, et `ou` dit laquelle. Ce que le relais sert va
 * dans le cache durable, qu'une mise en ligne ne jette pas ; les polices et
 * les bibliothèques restent dans celui des pages, dont elles suivent le sort —
 * elles ne coûtent rien au relais, et se reprennent avec le reste.
 */
async function dabordCache(e, requete, ou) {
  const cache = await caches.open(ou);
  const garde = await cache.match(requete);
  if (garde) return garde;
  const reponse = await fetch(requete);
  if (!reponse.ok) return reponse;
  /* Le service dit lui-même ce qui n'est pas à garder : un lot de vignettes
     auquel il en manque une est complet demain, et le figer ici le laisserait
     troué pour toute la vie du cache. */
  if ((reponse.headers.get("Cache-Control") || "").includes("no-store")) return reponse;
  const copie = reponse.clone();   // avant tout `await` : le corps ne se lit qu'une fois
  const adresse = new URL(requete.url);
  /* Ranger puis faire le ménage, dans cet ordre et d'un seul tenant : le
     ménage reconnaît l'entrée qu'on vient de poser à sa version, et la
     retiendrait pour une ancienne s'il passait avant. */
  e.waitUntil(caches.open(ou).then(async (c) => {
    await c.put(requete, copie);
    if (adresse.pathname !== "/api/plan") return;
    if (adresse.searchParams.get("v")) await oublieLesVersionsDAvant(c, adresse);
    if (adresse.searchParams.get("vignettes")) await borneLesLots(c);
  }).catch(() => {}));
  return reponse;
}

/**
 * Les lots de vignettes en trop, les plus anciens d'abord.
 *
 * Un lot est nommé par les vignettes qu'il porte : un exposant de plus, et
 * c'est une autre adresse — l'ancienne reste, sans plus rien à servir. Rien
 * ne la jetterait désormais, le cache durable ne connaissant pas les mises en
 * ligne ; et une synchronisation par jour y laisserait une génération de
 * lots par jour, à un mégaoctet la génération.
 *
 * `keys()` les rend dans l'ordre où ils ont été rangés : les premiers sont
 * ceux d'une liste d'exposants révolue, et c'est par eux qu'on commence.
 */
async function borneLesLots(cache) {
  const lots = (await cache.keys()).filter((c) => {
    try { return new URL(c.url).searchParams.has("vignettes"); } catch (_) { return false; }
  });
  /* Le compte d'abord, la coupe ensuite : `slice(0, -3)` ne rend pas un
     tableau vide mais tout sauf les trois derniers, et le ménage se serait mis
     à jeter des lots bien avant d'en avoir de trop. */
  const trop = lots.length - LOTS_GARDES;
  if (trop <= 0) return;
  for (const vieux of lots.slice(0, trop)) await cache.delete(vieux);
}

/**
 * Les tuiles de fond de carte en trop, les plus anciennes d'abord.
 *
 * Une tuile ne se périme pas — son adresse porte son niveau et sa case — mais
 * rien ne la jetterait non plus, le cache durable ne connaissant pas les mises
 * en ligne. Or un visiteur qui dézoome en traverse des centaines, et le fond
 * n'est que le décor autour du pavillon : il n'a pas à prendre la place du plan
 * lui-même, dont l'éviction coûterait la consultation hors ligne.
 *
 * Cent vingt : six vues pleines du pavillon, soit de quoi retrouver sans réseau
 * ce qu'on regardait et les zooms voisins, pour six mégaoctets au plus.
 */
const TUILES_GARDEES = 120;

/* Le ménage coûte un parcours du cache, et une vue de carte range vingt tuiles
   d'un coup : le faire à chacune reviendrait à parcourir vingt fois de suite ce
   qu'on vient d'écrire, sur le téléphone de quelqu'un qui regarde un plan.

   On l'espace donc, et le compteur part au seuil plutôt qu'à zéro : le premier
   rangement qui suit un réveil du service fait le ménage. Sans quoi un service
   arrêté entre deux poignées de tuiles — c'est la vie ordinaire d'un service de
   second plan — n'en aurait jamais fait aucun, et la borne n'aurait borné que
   le cas où elle ne servait pas. */
const TUILES_ENTRE_MENAGES = 20;
let _depuisLeMenage = TUILES_ENTRE_MENAGES;

async function borneLesTuiles(cache) {
  if (++_depuisLeMenage < TUILES_ENTRE_MENAGES) return;
  _depuisLeMenage = 0;
  /* Ce cache ne porte que deux sortes de choses : ce que le relais nous sert, et
     les tuiles. Le reste de ce qui s'y trouve est donc à nous, et se borne
     ailleurs. */
  const tuiles = (await cache.keys()).filter((c) => {
    try { return new URL(c.url).origin !== location.origin; } catch (_) { return false; }
  });
  const trop = tuiles.length - TUILES_GARDEES;
  if (trop <= 0) return;
  for (const vieille of tuiles.slice(0, trop)) await cache.delete(vieille);
}

/**
 * Une tuile de fond de carte : gardée d'abord, et redemandée en notre nom.
 *
 * Ce détour tient à une chose, et elle vaut pour tout ce qui vient de ces
 * fournisseurs. Le plan pose ses tuiles d'image dans des `<image>` du SVG et
 * charge MapLibre par un `<script>` : deux demandes sans CORS, auxquelles un
 * tiers ne peut répondre qu'une réponse opaque. On a le droit de la ranger, mais
 * elle ne se lit pas — ni son état, ni sa taille — et le navigateur la compte
 * dans le quota bien au-delà de ce qu'elle pèse, précisément pour qu'on ne
 * puisse pas mesurer par le quota ce qu'on n'a pas le droit de lire. Cent vingt
 * tuiles opaques feraient ainsi évincer tout ce que le plan avait gardé, et la
 * consultation hors ligne avec — l'inverse de ce qu'on vient chercher.
 *
 * On redemande donc la même adresse pour notre compte, en CORS et sans cookie ;
 * ces services l'accordent, MapLibre ne saurait pas s'en passer. Ce qui revient
 * est lisible, pèse ce qu'il pèse, et se ressert aussi bien à l'`<image>` ou au
 * `<script>` qui l'attendait — répondre plus largement que la demande est
 * permis, c'est l'inverse qui ne l'est pas.
 *
 * Un fournisseur qui refuserait le CORS ne casse rien : on repasse par la
 * demande d'origine, dont on ne garde rien. Le fond est alors là tant qu'il y a
 * du réseau et manque sans, exactement comme avant ce service — le pire cas est
 * de ne rien gagner, jamais de perdre.
 *
 * Encore ne doit-il pas se payer à chaque tuile. `fetch` lève de la même façon
 * pour un CORS refusé et pour un réseau coupé, et rien dans la réponse ne les
 * distingue ; mais la demande d'origine, elle, trace la ligne — si elle aboutit
 * quand la nôtre a échoué, c'est le CORS qui manquait, pas le réseau. On note
 * alors l'origine, et le détour cesse pour elle le temps que vit ce service.
 */
const _sansCors = new Set();

/**
 * Rend la réponse, quelle qu'elle soit, et `null` pour la seule demande qui n'a
 * pas abouti.
 *
 * La distinction porte : une tuile hors emprise se voit refuser par un 404 chez
 * certains fournisseurs, et confondre ce refus avec un CORS manquant aurait
 * suffi à condamner le détour pour toute l'origine — le cache du fond perdu
 * pour une case de carte que personne ne regardait.
 */
async function demandeTiers(cle) {
  if (_sansCors.has(new URL(cle.url).origin)) return null;
  try {
    return await fetch(cle, { mode: "cors", credentials: "omit" });
  } catch (panne) { return null; }
}

/** La demande telle que la page l'a faite, quand la nôtre n'a rien donné. */
async function commePosee(requete) {
  const brut = await fetch(requete);
  // on n'arrive ici que si elle aboutit : le réseau est donc là, et c'est le
  // CORS qui a manqué
  _sansCors.add(new URL(requete.url).origin);
  return brut;
}

/**
 * Une tuile : gardée d'abord, demandée après — elle ne peut pas se périmer.
 *
 * Rangée sous l'adresse nue, parce que la même tuile est demandée tantôt par une
 * `<image>`, tantôt par MapLibre, et que ce n'est pas deux images. `ignoreVary`
 * pour la même raison : un fournisseur qui déclare varier selon l'encodage ou
 * l'origine ferait manquer la copie à la demande d'après, qui veut pourtant
 * exactement ce qu'on a rangé.
 */
async function tuileDeCarte(e, requete) {
  const cle = new Request(requete.url);
  /* Ouvrir plutôt que viser par son nom : `caches.match` à qui l'on nomme un
     cache qui n'existe pas encore ne rend pas « rien », il rejette — et la
     première tuile d'un plan peut très bien arriver avant le premier fond. */
  const cache = await caches.open(DURABLE);
  const garde = await cache.match(cle, { ignoreVary: true });
  if (garde) return garde;

  const recu = await demandeTiers(cle);
  if (!recu) return commePosee(requete);
  // le fournisseur a répondu, mais pas ce qu'on demandait : rien à garder, et
  // l'`<image>` qui l'attendait sait s'effacer
  if (!recu.ok) return recu;

  const copie = recu.clone();   // avant tout `await` : le corps ne se lit qu'une fois
  e.waitUntil(caches.open(DURABLE).then(async (c) => {
    await c.put(cle, copie);
    await borneLesTuiles(c);
  }).catch(() => {}));
  return recu;
}

/**
 * Le reste du fond de carte — un style, la bibliothèque : le réseau d'abord et
 * la copie en secours, la règle commune, puisque leur adresse ne nomme qu'une
 * majeure et qu'un style se corrige chez son éditeur.
 *
 * Ils passent par le même détour que les tuiles, et il n'est pas facultatif :
 * le fond qu'on sert par défaut est vectoriel, donc il lui faut MapLibre. Sans
 * cela, le seul fond à manquer hors ligne aurait été celui que tout le monde a.
 *
 * Dans le cache des pages et non le durable : deux cent sept kilo-octets qu'une
 * mise en ligne reprendra, comme les polices, plutôt qu'une bibliothèque gelée
 * pour toujours sous une adresse qui, elle, ne l'est pas.
 */
async function fondDeCarte(e, requete) {
  const cle = new Request(requete.url);
  const recu = await demandeTiers(cle);
  if (recu && recu.ok) {
    const copie = recu.clone();   // avant tout `await` : le corps ne se lit qu'une fois
    e.waitUntil(caches.open(CACHE).then((c) => c.put(cle, copie)).catch(() => {}));
    return recu;
  }
  /* Une réponse d'erreur se rend telle quelle : la copie gardée est le secours
     d'une panne de réseau, pas le rattrapage d'un style qu'on a mal nommé. */
  if (recu) return recu;
  /* La copie avant la demande nue, à l'inverse d'une tuile : c'est justement
     hors ligne qu'elle sert, et `commePosee` y lèverait sans rien apprendre. */
  const garde = await caches.match(cle, { ignoreVary: true });
  return garde || commePosee(requete);
}

/**
 * Tout le reste : demandé d'abord, et la copie gardée ne sert qu'en secours.
 *
 * Une mise en ligne arrive donc au premier chargement qui suit, comme avant ce
 * service. Rendre la copie d'abord aurait valu un rechargement de retard à
 * chaque fichier — la feuille de style de la console repeignant la console
 * d'après, le plan d'hier servi sous les données d'aujourd'hui. Ce que coûte ce
 * choix, une requête conditionnelle que le cache du navigateur rend presque
 * gratuite, est ce qu'on payait déjà.
 */
async function dabordReseau(e, requete, cle) {
  try {
    const reponse = await fetch(requete);
    if (reponse.ok) range(e, cle || requete, reponse);
    return reponse;
  } catch (panne) {
    const garde = await caches.match(cle || requete);
    if (garde) return garde;
    throw panne;
  }
}

/**
 * Une page demandée. Même règle que le reste — le réseau d'abord — mais deux
 * choses lui sont propres : la clé sous laquelle on la range, et la page de
 * secours quand il n'y a décidément rien à montrer.
 */
async function navigation(e, requete) {
  /* Rangée sous son chemin nu, sans ce que l'adresse transporte. Une page sert
     tous les salons — `?plan=` désigne celui qu'elle ira chercher, jamais un
     autre fichier — et en garder une copie par salon revenait à garder dix
     fois le même mégaoctet. Surtout, rien de ce qui passe par l'adresse
     n'entre ainsi dans le cache : le jeton d'un lien de mot de passe y serait
     resté, sur un poste parfois partagé.

     L'adresse propre à un salon — `/plan-<salon>`, celle que son application
     ouvre — est ramenée à ce même chemin nu : c'est le même fichier, servi par
     le relais, et le ranger deux fois aurait rendu au visiteur qui installe la
     copie qu'on venait justement d'éviter. */
  const cle = new Request(new URL(requete.url).pathname
    .replace(/^\/plan-[a-z0-9][a-z0-9-]{0,63}$/, "/plan"));
  try {
    return await dabordReseau(e, requete, cle);
  } catch (panne) {
    // ni réseau ni copie : reste la page mise de côté à l'installation
    return (await caches.match(HORS_LIGNE)) || Response.error();
  }
}

self.addEventListener("fetch", (e) => {
  const requete = e.request;
  // écrire, mesurer, se connecter : rien de tout cela ne se garde ni ne se rejoue
  if (requete.method !== "GET") return;
  // une identité contourne le cache, comme au relais
  if (requete.headers.get("Authorization")) return;

  const adresse = new URL(requete.url);

  if (adresse.origin === location.origin) {
    if (adresse.pathname === "/api/plan") {
      /* Le plan et son fond portent leur version dans leur adresse : ils ne
         peuvent pas être périmés, et le fond pèse cinquante fois les stands —
         c'est lui qu'il faut garder le plus jalousement. Une vignette de logo suit la même règle pour la
         même raison : elle est nommée par l'empreinte de l'adresse d'où elle
         vient, et son contenu ne peut pas changer sans que sa clé change — et
         un lot de vignettes, qui n'est que des clés bout à bout, pas davantage.
         Ne reste au réseau que l'entête, qui dit quelle version se sert : il
         est demandé à chaque ouverture de page, pèse cinquante octets, et sa
         copie gardée est ce qui permet de retrouver le plan hors ligne. */
      e.respondWith(adresse.searchParams.get("v") ||
                    adresse.searchParams.get("vignette") ||
                    adresse.searchParams.get("vignettes")
        ? dabordCache(e, requete, DURABLE)
        : dabordReseau(e, requete));
      return;
    }
    // les mesures et l'oubli du cache ne font que passer
    if (adresse.pathname.startsWith("/api/")) return;

    e.respondWith(requete.mode === "navigate"
      ? navigation(e, requete)
      : POLICES.test(adresse.pathname) || BIBLIOTHEQUES.test(adresse.pathname)
        ? dabordCache(e, requete, CACHE)
        : dabordReseau(e, requete));
    return;
  }

  /* Le fond de carte, seule autre origine que ce service connaisse. Sans lui,
     le pavillon flottait sur du vide dès que le réseau manquait — le plan
     tenait, son décor non. */
  if (FONDS_DE_CARTE.has(adresse.origin)) {
    e.respondWith(estUneTuile(adresse)
      ? tuileDeCarte(e, requete)
      : fondDeCarte(e, requete));
    return;
  }
  // le reste d'une autre origine passe sans lui : le plan ne l'a pas demandé
});

/* ------------------------------------------------------------
   Les rappels de conférence
   ------------------------------------------------------------ */
/**
 * Ce module est la seule chose qui tourne encore quand le plan est fermé — et
 * c'est pour cela que le rappel passe par lui. Le serveur tient l'heure et
 * poste le message ; le navigateur réveille ce service le temps de l'afficher,
 * puis l'arrête aussitôt. Rien n'attend ici entre deux réveils : une minuterie
 * posée dans ce fichier ne survivrait pas plus que dans la page.
 *
 * Le texte arrive tout écrit. Ce n'est pas de la paresse : il a été composé par
 * la page au moment où le visiteur a posé son rappel, donc dans la langue qu'il
 * lisait, et avec le nom que la conférence portait alors. Ce service ne sait ni
 * lire le programme, ni traduire, et n'a pas à l'apprendre.
 */
self.addEventListener("push", (e) => {
  /* Une charge illisible n'est pas une raison de ne rien montrer : le
     navigateur exige qu'un message reçu se voie — faute de quoi il affiche
     lui-même « ce site a été mis à jour en arrière-plan », ce qui n'apprend
     rien à personne. */
  let m = {};
  try { m = (e.data && e.data.json()) || {}; } catch (err) {}
  const titre = m.titre || "Conférence à venir";
  e.waitUntil(self.registration.showNotification(titre, {
    body: m.corps || "",
    icon: "icone-192.png",
    badge: "icone-onglet.svg",
    lang: m.langue || "fr",
    /* Une conférence ne se rappelle qu'une fois : si deux messages se
       croisaient — une reprise du service de poussée, un envoi rejoué — le
       second remplacerait le premier au lieu de s'empiler sous lui. */
    tag: "conf:" + (m.conf || titre),
    renotify: true,
    /* Le rappel vaut pour un instant précis. Le laisser vibrer sans qu'on l'ait
       demandé, alors que le visiteur est peut-être déjà dans la salle, n'aurait
       rien ajouté ; mais il doit rester à l'écran jusqu'à ce qu'on le voie. */
    requireInteraction: true,
    data: { adresse: m.adresse || "./" },
  }));
});

/**
 * Toucher la notification ouvre le plan sur la conférence.
 *
 * Un onglet déjà ouvert est repris plutôt que doublé — un visiteur qui avait le
 * plan sous la main ne veut pas s'en retrouver deux. `navigate` le mène au bon
 * endroit ; si le navigateur le refuse, la fenêtre reprise vaut mieux qu'une
 * nouvelle, et le plan y est déjà.
 */
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const adresse = (e.notification.data && e.notification.data.adresse) || "./";
  e.waitUntil((async () => {
    const cible = new URL(adresse, self.location.origin);
    const ouverts = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of ouverts) {
      if (new URL(c.url).pathname !== cible.pathname) continue;
      try { await c.navigate(cible.href); } catch (err) {}
      return c.focus();
    }
    return self.clients.openWindow(cible.href);
  })());
});
