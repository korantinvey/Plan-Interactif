/**
 * Une prévisualisation de branche ne touche pas à la production.
 *
 * Cloudflare sert chaque branche poussée avec les liaisons de la production :
 * le même stockage KV, la même base. Le Worker s'en tient donc à l'écart
 * (`src/index.mjs` `enApercu`, `cacheDe`, `ecritEnProduction`). Rien ne se
 * verrait s'il cessait de le faire : le cache des visiteurs se remplirait de
 * réponses d'essai, l'audience des salons de clics de mise au point. On le
 * vérifie donc ici, sur le vrai Worker, avec un stockage et un réseau prêtés :
 * la même requête, servie sous l'adresse de la production puis sous celle
 * d'une branche.
 *
 *   node outils/essais/apercu.js     (chaîné dans `npm run essais`, après la construction)
 */
const path = require("path");
const { pathToFileURL } = require("url");

let ko = 0;
const dit = (ok, q, d) => {
  console.log((ok ? "  ok   " : "  ÉCHEC") + "  " + q + (d ? "   → " + d : ""));
  if (!ok) ko++;
};

/** Un stockage KV réduit à ce que le Worker emploie, qui note qui l'a touché. */
function stockage() {
  const m = new Map();
  const kv = {
    touches: 0,
    async get(k) { kv.touches++; return m.has(k) ? m.get(k).v : null; },
    async getWithMetadata(k) { kv.touches++; return m.has(k) ? { value: m.get(k).v, metadata: m.get(k).meta } : null; },
    async put(k, v, o) {
      kv.touches++;
      m.set(k, { v: typeof v === "string" ? v : await new Response(v).text(), meta: o?.metadata });
    },
    async delete(k) { kv.touches++; m.delete(k); },
    taille: () => m.size,
  };
  return kv;
}

/* Le réseau prêté : la fonction du plan répond un plan public, la base acquitte
   ce qu'on lui écrit. On note chaque adresse appelée. */
const appels = [];
globalThis.fetch = async (adresse, init) => {
  const u = String(adresse instanceof Request ? adresse.url : adresse);
  appels.push({ u, methode: init?.method || "GET" });
  if (u.includes("/functions/v1/plan-public")) {
    return new Response('{"plan":1}', {
      headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=60", "X-Version": "abc" },
    });
  }
  if (u.includes("/rest/v1/rpc/")) return new Response("true", { headers: { "Content-Type": "application/json" } });
  return new Response(null, { status: 204 });
};

const PRODUCTION = "https://plan-interactif.interactiveplan.workers.dev";
const BRANCHE = "https://ma-branche-plan-interactif.interactiveplan.workers.dev";

(async () => {
  let worker;
  try {
    worker = (await import(pathToFileURL(path.join(__dirname, "..", "..", "src", "index.mjs")))).default;
  } catch (e) {
    console.log("  ÉCHEC  le Worker ne se charge pas — `npm run construire` d'abord ?   → " + e.message);
    process.exit(1);
  }
  const { APERCU } = await import(pathToFileURL(path.join(__dirname, "..", "..", "src", "pages.mjs")));
  if (APERCU) {
    console.log("  — construit pour une prévisualisation : l'essai demande la construction de production");
    process.exit(1);
  }

  const ctx = { attentes: [], waitUntil(p) { this.attentes.push(p); } };
  const sert = async (origine, chemin, init, env) => {
    const r = await worker.fetch(new Request(origine + chemin, init), env, ctx);
    await Promise.all(ctx.attentes.splice(0));
    return r;
  };
  const mesure = { method: "POST", body: JSON.stringify({ slug: "fep26", visiteur: "x", gestes: [] }) };
  const ecritures = () => appels.filter(a => a.methode === "POST").length;

  // — la production : le cache se remplit, la mesure part
  {
    const env = { CACHE: stockage(), ASSETS: { fetch: async () => new Response("") } };
    const r = await sert(PRODUCTION, "/api/plan?slug=fep26", {}, env);
    dit(r.headers.get("X-Cache") === "miss", "production : le plan passe par le cache", r.headers.get("X-Cache"));
    dit(env.CACHE.taille() > 0, "production : la réponse est rangée");
    const avant = ecritures();
    await sert(PRODUCTION, "/api/mesure", mesure, env);
    dit(ecritures() > avant, "production : la mesure est relayée à la base");
  }

  // — une branche : le cache de la production n'est ni lu ni écrit, rien n'est écrit en base
  {
    const env = { CACHE: stockage(), ASSETS: { fetch: async () => new Response("") } };
    const r = await sert(BRANCHE, "/api/plan?slug=fep26", {}, env);
    dit(r.ok, "branche : le plan est servi quand même", r.status);
    dit(r.headers.get("X-Cache") === "absent", "branche : sans cache", r.headers.get("X-Cache"));
    await sert(BRANCHE, "/api/plan?entete=1&slug=fep26", {}, env);
    dit(env.CACHE.touches === 0, "branche : le cache de la production n'est pas touché", env.CACHE.touches + " accès");

    const avant = ecritures();
    const m = await sert(BRANCHE, "/api/mesure", mesure, env);
    dit(m.status === 204 && m.headers.get("X-Apercu") === "ecarte", "branche : la mesure est acquittée sans partir");
    await sert(BRANCHE, "/api/plan-de-visite", { method: "POST", body: "{}" }, env);
    await sert(BRANCHE, "/api/erreur", { method: "POST", body: JSON.stringify({ erreurs: [] }) }, env);
    dit(ecritures() === avant, "branche : ni mesure, ni plan de visite, ni erreur n'atteignent la base",
      (ecritures() - avant) + " écriture(s)");
  }

  // — une branche qui a son propre espace : elle s'en sert, et de lui seul
  {
    const env = { CACHE: stockage(), CACHE_APERCU: stockage(), ASSETS: { fetch: async () => new Response("") } };
    await sert(BRANCHE, "/api/plan?slug=fep26", {}, env);
    dit(env.CACHE_APERCU.taille() > 0 && env.CACHE.touches === 0,
      "branche avec CACHE_APERCU : elle range là, et pas ailleurs");
  }

  console.log(ko ? "\n" + ko + " échec(s)" : "\nune prévisualisation reste à l'écart de la production");
  process.exit(ko ? 1 : 0);
})();
