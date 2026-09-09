/**
 * Worker Cloudflare : sert les pages, relaie les lectures du plan et les
 * mesures d'utilisation.
 *
 * Sans relais, chaque visiteur paie l'aller-retour jusqu'à la fonction
 * Supabase — environ deux cents millisecondes rien que pour la mettre en
 * route, plus la traversée du réseau. Ici la réponse est gardée dans un
 * stockage KV, répliqué mondialement et tenu en cache au point de présence qui
 * l'a servie : les visiteurs suivants la reçoivent en quelques dizaines de
 * millisecondes, et la base n'est plus sollicitée à chaque visite.
 *
 * Le cache du Worker (`caches.default`) aurait été plus direct, mais il est
 * inopérant sur un sous-domaine workers.dev. KV, lui, fonctionne partout.
 *
 * Trois règles, et rien d'autre :
 *   — un appel porteur d'une identité n'est ni lu ni écrit dans le cache : il
 *     peut contenir un brouillon, qui n'appartient qu'à son exploitant ;
 *   — seuls les paramètres attendus sont relayés, pour que ce chemin ne
 *     devienne pas un proxy ouvert ;
 *   — sans stockage KV attaché, tout continue de fonctionner, sans cache.
 *
 * Le même chemin sert aux mesures d'utilisation, en sens inverse : la page
 * pousse ses gestes, le Worker les passe à la fonction, sans rien garder.
 */
const BASE = "https://jylkfskotuafptaxujao.supabase.co/functions/v1/";
const AMONT = BASE + "plan-public";
const MESURE = BASE + "mesure";
const RDV = BASE + "rdv";
const PARAMS = ["slug", "fond", "v"];

/* Un paquet de mesures pèse quelques centaines d'octets. Au-delà, ce n'est
   plus une visite qu'on décrit : on refuse sans même relayer. */
const MESURE_MAX = 4096;

/* Le plan sans son fond peut changer à chaque synchronisation : dix minutes de
   retard au plus, ce qui reste sous le rythme de synchronisation le plus vif.
   Le fond, lui, porte sa version dans la clé : il ne peut pas être périmé. */
const TTL_PLAN = 600;
const TTL_FOND = 2592000;

/* Une entrée périmée n'est pas jetée : elle est servie telle quelle pendant
   qu'on la rafraîchit derrière. Sans cela l'expiration vide le cache au moment
   même où la charge est la plus forte — l'ouverture du salon — et toutes les
   visites arrivées dans cette seconde repartent ensemble jusqu'à la base, dont
   chacune rejoue les sept requêtes. La garde couvre du même coup une panne en
   amont : mieux vaut un plan d'hier qu'une page vide. */
const GARDE = 86400;

/** Ce que l'on garde à côté de la valeur : de quoi reconstituer la réponse. */
const meta = (r, frais) => ({
  ct: r.headers.get("Content-Type") || "application/json",
  cc: r.headers.get("Cache-Control") || "no-store",
  // au-delà, l'entrée est encore bonne à servir mais demande à être refaite ;
  // le fond, immuable, n'a pas de date de péremption du tout
  frais,
});

/* Les rafraîchissements en vol dans cet isolat. Sans cette retenue, les
   requêtes qui trouvent la même entrée périmée en lanceraient chacune un. */
const _enVol = new Set();

/** On ne garde que ce que la fonction a déclaré public. */
const gardable = (cache, r) =>
  Boolean(cache) && r.ok &&
  (r.headers.get("Cache-Control") || "").includes("public");

/** Range la réponse. */
const range = (cache, cle, reponse, corps, fond) =>
  cache.put(cle, corps, {
    expirationTtl: fond ? TTL_FOND : GARDE,
    metadata: meta(reponse, fond ? null : Date.now() + TTL_PLAN * 1000),
  }).catch(() => {});   // un cache en panne ne doit pas casser une visite

/** Refait une entrée périmée, sans faire attendre la visite qui l'a trouvée. */
function rafraichit(cache, cle, adresse, entetes) {
  if (_enVol.has(cle)) return Promise.resolve();
  _enVol.add(cle);
  return fetch(adresse, { headers: entetes })
    .then((r) => (gardable(cache, r) ? range(cache, cle, r, r.body, false) : null))
    // l'amont muet laisse l'entrée périmée en place : elle resservira
    .catch(() => {})
    .finally(() => _enVol.delete(cle));
}

/** Relais des mesures : un aller simple, sans identité et sans cache. */
async function mesure(requete) {
  if (requete.method !== "POST") {
    return new Response("Méthode non permise", { status: 405 });
  }
  const corps = await requete.text();
  if (corps.length > MESURE_MAX) return new Response(null, { status: 413 });
  const reponse = await fetch(MESURE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: corps,
  });
  return new Response(reponse.body, {
    status: reponse.status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

/**
 * Les rendez-vous d'un visiteur, et la connexion qui les ouvre.
 *
 * Rien n'est gardé ici, et rien ne le sera : ce qui passe appartient à une
 * personne. Le relais existe pour une autre raison — l'adresse de retour que
 * l'application Eventmaker a déclarée est celle du plan, pas celle du projet
 * Supabase, que le navigateur ne voit jamais. C'est donc ce chemin-ci qui doit
 * répondre, biscuit compris.
 *
 * Les redirections ne sont pas suivies mais rendues : c'est au navigateur du
 * visiteur d'aller chez Eventmaker, pas au Worker — lui n'y est personne.
 */
async function rdv(requete, url) {
  if (requete.method !== "GET" && requete.method !== "OPTIONS") {
    return new Response("Méthode non permise", { status: 405 });
  }
  const amont = new URL(RDV + url.pathname.slice("/api/rdv".length) + url.search);

  const entetes = new Headers();
  for (const n of ["X-Jeton-Eventmaker", "Cookie", "Origin"]) {
    const v = requete.headers.get(n);
    if (v) entetes.set(n, v);
  }

  const reponse = await fetch(amont.toString(), {
    headers: entetes,
    redirect: "manual",
  });
  const sortie = new Response(reponse.body, reponse);
  sortie.headers.set("Cache-Control", "no-store, private");
  return sortie;
}

export default {
  async fetch(requete, env, ctx) {
    const url = new URL(requete.url);
    /* Les mesures d'utilisation prennent le même chemin que le plan : même
       origine que la page, donc aucun contrôle d'origine croisée à passer, et
       rien à configurer si le domaine change. Elles ne sont ni lues ni mises
       en cache — elles ne font que passer. */
    if (url.pathname === "/api/mesure") return mesure(requete);
    if (url.pathname === "/api/rdv" || url.pathname.startsWith("/api/rdv/")) {
      return rdv(requete, url);
    }
    if (url.pathname !== "/api/plan") return env.ASSETS.fetch(requete);
    if (requete.method !== "GET" && requete.method !== "HEAD") {
      return new Response("Méthode non permise", { status: 405 });
    }

    const amont = new URL(AMONT);
    for (const p of PARAMS) {
      const v = url.searchParams.get(p);
      if (v !== null) amont.searchParams.set(p, v);
    }
    if (!amont.searchParams.get("slug")) {
      return new Response(JSON.stringify({ erreur: "Paramètre slug manquant." }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      });
    }

    const jeton = requete.headers.get("Authorization");
    const cache = jeton ? null : env.CACHE;      // une identité contourne le cache
    // la clé ne retient que les paramètres attendus : deux adresses qui ne
    // diffèrent que par un paramètre parasite partagent la même entrée
    const cle = "v1" + amont.search;
    const fond = Boolean(amont.searchParams.get("fond"));

    const entetes = new Headers();
    if (jeton) entetes.set("Authorization", jeton);
    const apikey = requete.headers.get("apikey");
    if (apikey) entetes.set("apikey", apikey);

    if (cache) {
      const garde = await cache.getWithMetadata(cle, { type: "stream" });
      if (garde && garde.value) {
        const perime = Boolean(garde.metadata?.frais) &&
                       Date.now() > garde.metadata.frais;
        if (perime) {
          ctx.waitUntil(rafraichit(cache, cle, amont.toString(), entetes));
        }
        return new Response(garde.value, {
          headers: {
            "Content-Type": garde.metadata?.ct || "application/json",
            "Cache-Control": garde.metadata?.cc || "public, max-age=60",
            "X-Cache": perime ? "stale" : "hit",
          },
        });
      }
    }

    const reponse = await fetch(amont.toString(), { headers: entetes });
    const sortie = new Response(reponse.body, reponse);
    sortie.headers.set("X-Cache", jeton ? "bypass" : cache ? "miss" : "absent");
    /* Le corps n'est cloné que si l'entrée part vraiment au cache : un clone
       qu'on ne lit pas oblige le runtime à tamponner toute la réponse, et un
       fond de plan pèse deux mégaoctets. */
    if (gardable(cache, reponse)) {
      ctx.waitUntil(range(cache, cle, reponse, sortie.clone().body, fond));
    }
    return sortie;
  },
};
