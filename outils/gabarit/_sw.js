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
 * Trois règles, qui reprennent celles du relais (`src/index.mjs`) parce que
 * c'est le même document qui passe :
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
const VERSION = "__VERSION__";
const CACHE = "plan-" + VERSION;
const HORS_LIGNE = "hors-ligne.html";

/* Les polices sont servies par Google, sous des adresses qui portent leur
   empreinte : elles ne changent jamais sous une même adresse, et se gardent
   donc telles quelles. Sans elles, le plan mesure ses libellés dans une police
   de remplacement — les noms d'enseignes débordent de leurs stands. */
const POLICES = ["https://fonts.googleapis.com", "https://fonts.gstatic.com"];

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
function range(requete, reponse) {
  const copie = reponse.clone();   // avant tout `await` : le corps ne se lit qu'une fois
  caches.open(CACHE).then((c) => c.put(requete, copie)).catch(() => {});
  return reponse;
}

/** Ce qui ne change jamais sous une même adresse : gardé d'abord, demandé après. */
async function dabordCache(requete) {
  const garde = await caches.match(requete);
  if (garde) return garde;
  const reponse = await fetch(requete);
  // une réponse opaque — une police, demandée sans contrôle d'origine — ne dit
  // pas si elle a abouti ; elle se garde quand même, c'est tout ce qu'on aura
  if (reponse.ok || reponse.type === "opaque") range(requete, reponse);
  return reponse;
}

/** Ce qui peut changer : demandé d'abord, et la copie gardée sert de secours. */
async function dabordReseau(requete) {
  try {
    const reponse = await fetch(requete);
    if (reponse.ok) range(requete, reponse);
    return reponse;
  } catch (panne) {
    const garde = await caches.match(requete);
    if (garde) return garde;
    throw panne;
  }
}

/**
 * Le reste des fichiers de la page : rendus depuis le cache, et renouvelés
 * derrière. L'affichage ne dépend donc plus du réseau, et la construction
 * suivante arrive au rechargement d'après — ce qui suffit pour une feuille de
 * style ou une icône, et n'est pas vrai des pages, servies plus haut.
 */
function revalide(e) {
  const requete = e.request;
  const frais = fetch(requete)
    .then((reponse) => (reponse.ok ? range(requete, reponse) : reponse))
    .catch(() => null);
  // le service peut être arrêté sitôt la réponse rendue : sans cette retenue,
  // le renouvellement serait interrompu avant d'avoir rien écrit
  e.waitUntil(frais);
  return caches.match(requete).then((garde) => garde || frais.then((r) => r || Response.error()));
}

/**
 * Une page demandée : le réseau d'abord, toujours.
 *
 * C'est le contraire de ce que fait le reste, et pour une raison précise : une
 * page de ce dépôt porte tout son code. La servir depuis le cache, c'est
 * exécuter la construction d'hier sur les données d'aujourd'hui — et, en
 * administration, laisser un exploitant enregistrer avec un écran périmé. Le
 * cache HTTP du navigateur rend de toute façon ce trajet gratuit tant que la
 * page n'a pas changé.
 */
async function navigation(requete) {
  /* Rangée sous son chemin nu, sans ce que l'adresse transporte. Une page sert
     tous les salons — `?plan=` désigne celui qu'elle ira chercher, jamais un
     autre fichier — et en garder une copie par salon revenait à garder dix
     fois le même mégaoctet. Surtout, rien de ce qui passe par l'adresse
     n'entre ainsi dans le cache : le jeton d'un lien de mot de passe y serait
     resté, sur un poste parfois partagé. */
  const cle = new Request(new URL(requete.url).pathname);
  try {
    const reponse = await fetch(requete);
    if (reponse.ok) range(cle, reponse);
    return reponse;
  } catch (panne) {
    return (await caches.match(cle)) ||
           (await caches.match(HORS_LIGNE)) ||
           Response.error();
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
         le plus jalousement. Le plan lui-même change à chaque synchronisation :
         on le redemande, et la copie gardée ne sert que si le réseau manque. */
      e.respondWith(adresse.searchParams.get("fond")
        ? dabordCache(requete)
        : dabordReseau(requete));
      return;
    }
    // les mesures et l'oubli du cache ne font que passer
    if (adresse.pathname.startsWith("/api/")) return;

    e.respondWith(requete.mode === "navigate" ? navigation(requete) : revalide(e));
    return;
  }

  if (POLICES.includes(adresse.origin)) e.respondWith(dabordCache(requete));
});
