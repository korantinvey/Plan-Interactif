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
 */
const VERSION = "f93a7d910371";
const CACHE = "plan-" + VERSION;
const HORS_LIGNE = "hors-ligne.html";

/* Les polices sont servies depuis `polices/`, sous des noms qui portent leur
   empreinte (voir `outils/polices.js`) : elles ne changent jamais sous une même
   adresse, et se gardent donc telles quelles. Sans elles, le plan mesure ses
   libellés dans une police de remplacement — les noms d'enseignes débordent de
   leurs stands. Les feuilles `.css` du même dossier ne portent pas d'empreinte :
   elles suivent la règle commune. */
const POLICES = /^\/polices\/[^/]+\.woff2$/;
/* La bibliothèque du dessin WebGL porte de même sa version dans son nom. */
const BIBLIOTHEQUES = /^\/bibliotheques\/[^/]+\.js$/;

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
        noms.filter((n) => n.startsWith("plan-") && n !== CACHE)
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
 * Les copies d'un même fond de plan sous une version révolue.
 *
 * Le fond porte sa version dans son adresse : une synchronisation en donne une
 * neuve, et l'ancienne n'a plus rien à servir. Or rien ne l'effaçait — le nom
 * du cache ne change qu'à une mise en ligne des pages, et entre deux le même
 * pavillon s'y empilait une fois par synchronisation, à deux mégaoctets pièce.
 * Un salon qui se resynchronise chaque matin remplissait ainsi le quota du
 * téléphone d'un visiteur avec des plans que personne ne redemanderait, et le
 * navigateur finissait par jeter le cache entier — la consultation hors ligne
 * avec.
 *
 * On ne retient donc qu'une version par pavillon : la dernière servie.
 */
async function oublieLesFondsDAvant(cache, adresse) {
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

/** Ce qui ne change jamais sous une même adresse : gardé d'abord, demandé après. */
async function dabordCache(e, requete) {
  const garde = await caches.match(requete);
  if (garde) return garde;
  const reponse = await fetch(requete);
  if (!reponse.ok) return reponse;
  const copie = reponse.clone();   // avant tout `await` : le corps ne se lit qu'une fois
  const adresse = new URL(requete.url);
  /* Ranger puis faire le ménage, dans cet ordre et d'un seul tenant : le
     ménage reconnaît l'entrée qu'on vient de poser à sa version, et la
     retiendrait pour une ancienne s'il passait avant. */
  e.waitUntil(caches.open(CACHE).then(async (c) => {
    await c.put(requete, copie);
    if (adresse.pathname === "/api/plan" && adresse.searchParams.get("fond")) {
      await oublieLesFondsDAvant(c, adresse);
    }
  }).catch(() => {}));
  return reponse;
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
     resté, sur un poste parfois partagé. */
  const cle = new Request(new URL(requete.url).pathname);
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
      /* Le fond de plan porte sa version dans son adresse : il ne peut pas être
         périmé, et pèse cinquante fois les stands — c'est lui qu'il faut garder
         le plus jalousement. Une vignette de logo suit la même règle pour la
         même raison : elle est nommée par l'empreinte de l'adresse d'où elle
         vient, et son contenu ne peut pas changer sans que sa clé change. Le
         plan lui-même change à chaque synchronisation : on le redemande, et la
         copie gardée ne sert que si le réseau manque. */
      e.respondWith(adresse.searchParams.get("fond") || adresse.searchParams.get("vignette")
        ? dabordCache(e, requete)
        : dabordReseau(e, requete));
      return;
    }
    // les mesures et l'oubli du cache ne font que passer
    if (adresse.pathname.startsWith("/api/")) return;

    e.respondWith(requete.mode === "navigate"
      ? navigation(e, requete)
      : POLICES.test(adresse.pathname) || BIBLIOTHEQUES.test(adresse.pathname)
        ? dabordCache(e, requete)
        : dabordReseau(e, requete));
  }
  // une autre origine n'est rien que le plan demande : elle passe sans lui
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
