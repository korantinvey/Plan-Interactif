/**
 * Worker Cloudflare : sert les pages, et relaie les lectures du plan.
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
 */
const AMONT = "https://jylkfskotuafptaxujao.supabase.co/functions/v1/plan-public";
const PARAMS = ["slug", "fond", "v"];

/* Le plan sans son fond peut changer à chaque synchronisation : dix minutes de
   retard au plus, ce qui reste sous le rythme de synchronisation le plus vif.
   Le fond, lui, porte sa version dans la clé : il ne peut pas être périmé. */
const TTL_PLAN = 600;
const TTL_FOND = 2592000;

/** Ce que l'on garde à côté de la valeur : de quoi reconstituer la réponse. */
const meta = (r) => ({
  ct: r.headers.get("Content-Type") || "application/json",
  cc: r.headers.get("Cache-Control") || "no-store",
});

export default {
  async fetch(requete, env, ctx) {
    const url = new URL(requete.url);
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

    if (cache) {
      const garde = await cache.getWithMetadata(cle, { type: "stream" });
      if (garde && garde.value) {
        return new Response(garde.value, {
          headers: {
            "Content-Type": garde.metadata?.ct || "application/json",
            "Cache-Control": garde.metadata?.cc || "public, max-age=60",
            "X-Cache": "hit",
          },
        });
      }
    }

    const entetes = new Headers();
    if (jeton) entetes.set("Authorization", jeton);
    const apikey = requete.headers.get("apikey");
    if (apikey) entetes.set("apikey", apikey);

    const reponse = await fetch(amont.toString(), { headers: entetes });
    const sortie = new Response(reponse.body, reponse);
    sortie.headers.set("X-Cache", jeton ? "bypass" : cache ? "miss" : "absent");

    // on ne garde que ce que la fonction a déclaré public
    if (cache && reponse.ok &&
        (reponse.headers.get("Cache-Control") || "").includes("public")) {
      const copie = sortie.clone();
      ctx.waitUntil(
        cache.put(cle, copie.body, {
          expirationTtl: amont.searchParams.get("fond") ? TTL_FOND : TTL_PLAN,
          metadata: meta(reponse),
        }).catch(() => {}),   // un cache en panne ne doit pas casser une visite
      );
    }
    return sortie;
  },
};
