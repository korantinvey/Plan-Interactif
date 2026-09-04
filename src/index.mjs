/**
 * Worker Cloudflare : sert les pages, et relaie les lectures du plan.
 *
 * Sans ce relais, chaque visiteur paie l'aller-retour jusqu'à la fonction
 * Supabase — environ 200 ms de mise en route de la fonction, plus la traversée
 * du réseau. En passant par ici, la réponse est gardée dans le cache du point
 * de présence le plus proche : les visiteurs suivants la reçoivent en quelques
 * dizaines de millisecondes, et la base n'est plus sollicitée à chaque visite.
 *
 * Deux règles, et rien d'autre :
 *   — un appel porteur d'une identité n'est jamais mis en cache ni servi depuis
 *     le cache : il peut contenir un brouillon, qui n'appartient qu'à son
 *     exploitant ;
 *   — seuls les paramètres attendus sont relayés, pour que ce chemin ne
 *     devienne pas un proxy ouvert.
 */
const AMONT = "https://jylkfskotuafptaxujao.supabase.co/functions/v1/plan-public";
const PARAMS = ["slug", "fond", "v"];

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
    const cache = caches.default;
    // la clé ne retient que les paramètres retenus : deux adresses qui ne
    // diffèrent que par un paramètre parasite partagent la même entrée
    const cle = new Request(amont.toString(), { method: "GET" });

    if (!jeton) {
      const garde = await cache.match(cle);
      if (garde) {
        const r = new Response(garde.body, garde);
        r.headers.set("X-Cache", "hit");
        return r;
      }
    }

    const entetes = new Headers({ "Accept-Encoding": "gzip, br" });
    if (jeton) entetes.set("Authorization", jeton);
    const apikey = requete.headers.get("apikey");
    if (apikey) entetes.set("apikey", apikey);

    const reponse = await fetch(amont.toString(), { headers: entetes });
    const sortie = new Response(reponse.body, reponse);
    sortie.headers.set("X-Cache", jeton ? "bypass" : "miss");

    // on ne garde que ce que la fonction a déclaré public
    if (!jeton && reponse.ok &&
        (reponse.headers.get("Cache-Control") || "").includes("public")) {
      ctx.waitUntil(cache.put(cle, sortie.clone()));
    }
    return sortie;
  },
};
