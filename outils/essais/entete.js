/**
 * L'entête du plan répond du stockage, sans attendre la base.
 *
 * Chaque ouverture de page demande au relais quelle version du plan se sert
 * (`src/index.mjs` `entete`), et la page attend sa réponse avant de prendre le
 * plan. Quand le relais ne la gardait plus — effacée par un enregistrement de
 * l'administration, ou expirée au bout d'un jour —, la visite attendait que la
 * base refasse le plan entier : 0,8 seconde en médiane, jusqu'à 5,8, relevées
 * par la sonde en octobre. On éprouve donc, sur le vrai Worker avec un stockage
 * et un réseau prêtés, que l'oubli refait au lieu d'effacer, qu'une version
 * périmée se sert encore et se refait derrière, qu'une reconstruction partie
 * plus tôt n'écrase pas une plus récente, et que l'oubli ne coûte pas plus
 * d'écritures qu'avant — le stockage n'en accepte que mille par jour.
 *
 *   node outils/essais/entete.js     (lancé par `npm run essais`, après la construction)
 */
const path = require("path");
const { pathToFileURL } = require("url");

let ko = 0;
const dit = (ok, q, d) => {
  console.log((ok ? "  ok   " : "  ÉCHEC") + "  " + q + (d ? "   → " + d : ""));
  if (!ok) ko++;
};

/** Un stockage KV réduit à ce que le Worker emploie, qui compte ses écritures. */
function stockage() {
  const m = new Map();
  const kv = {
    ecritures: 0,
    async get(k) { return m.has(k) ? m.get(k).v : null; },
    async getWithMetadata(k) { return m.has(k) ? { value: m.get(k).v, metadata: m.get(k).meta ?? null } : null; },
    async put(k, v, o) {
      kv.ecritures++;
      m.set(k, { v: typeof v === "string" ? v : await new Response(v).text(), meta: o?.metadata });
    },
    async delete(k) { kv.ecritures++; m.delete(k); },
    lis: (k) => m.get(k),
  };
  return kv;
}

/* Le réseau prêté. La fonction du plan rend la version que l'essai lui fixe ;
   `retiens` suspend la prochaine réponse, pour croiser deux reconstructions. */
let version = "v1";
let enPanne = false;
let retenue = null;
const appelsPlan = () => appels.filter((u) => u.includes("/functions/v1/plan-public")).length;
const appels = [];
globalThis.fetch = async (adresse) => {
  const u = String(adresse instanceof Request ? adresse.url : adresse);
  appels.push(u);
  if (u.includes("/functions/v1/plan-public")) {
    const v = version;
    const rend = () => enPanne
      ? new Response("panne", { status: 503 })
      : new Response('{"plan":"' + v + '"}', {
          headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=60", "X-Version": v },
        });
    if (retenue) {
      const r = retenue;
      retenue = null;
      await r;
    }
    return rend();
  }
  // la session de l'exploitant, et tout le reste
  return new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } });
};
/** La prochaine demande du plan attend `lache()`. */
function retiens() {
  let lache;
  retenue = new Promise((r) => { lache = r; });
  return lache;
}

const ORIGINE = "https://plan-interactif.interactiveplan.workers.dev";
const SESSION = { method: "POST", headers: { Authorization: "Bearer x", apikey: "y" } };

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

  const env = () => ({ CACHE: stockage(), ASSETS: { fetch: async () => new Response("") } });
  const contexte = () => ({ attentes: [], waitUntil(p) { this.attentes.push(p); } });
  /** Une requête, et ce qu'elle a laissé à faire derrière, attendu ou non. */
  const sert = async (e, chemin, init, ctx = contexte()) => {
    const r = await worker.fetch(new Request(ORIGINE + chemin, init), e, ctx);
    return { r, derriere: () => Promise.all(ctx.attentes.splice(0)) };
  };
  const entete = async (e) => {
    const { r, derriere } = await sert(e, "/api/plan?entete=1&slug=fep26");
    const v = r.ok ? (await r.json()).v : null;
    await derriere();
    return v;
  };
  const oublie = async (e) => {
    const { r, derriere } = await sert(e, "/api/oublie?slug=fep26", SESSION);
    await derriere();
    return r;
  };

  // — l'oubli refait le plan : la visite suivante est servie du stockage
  {
    const e = env();
    version = "v1";
    dit(await entete(e) === "v1", "première visite : l'entête va chercher la version");
    version = "v2";
    const avant = e.CACHE.ecritures;
    const r = await oublie(e);
    dit(r.status === 204, "l'oubli répond", r.status);
    dit(e.CACHE.ecritures - avant === 3,
      "l'oubli coûte trois écritures, comme quand il effaçait", (e.CACHE.ecritures - avant) + " écriture(s)");
    const n = appelsPlan();
    dit(await entete(e) === "v2", "après l'oubli, l'entête annonce la version neuve");
    dit(appelsPlan() === n, "et la donne sans redemander le plan à la base", (appelsPlan() - n) + " appel(s)");
    const plan = e.CACHE.lis("v1?slug=fep26");
    dit(plan && plan.v === '{"plan":"v2"}' && plan.meta?.v === "v2",
      "le plan sans version est refait avec elle", plan && plan.v);
  }

  // — la base en panne : l'oubli efface, comme avant, plutôt que de taire la modification
  {
    const e = env();
    version = "v1";
    await entete(e);
    enPanne = true;
    await oublie(e);
    enPanne = false;
    dit(!e.CACHE.lis("ver2:fep26") && !e.CACHE.lis("v1?slug=fep26"),
      "base en panne : la version et le plan sont effacés");
  }

  // — une version passée de son jour se sert encore, et se refait derrière
  {
    const e = env();
    await e.CACHE.put("ver2:fep26", "ancienne", { metadata: { depuis: 1, frais: Date.now() - 1000 } });
    version = "v3";
    const { r, derriere } = await sert(e, "/api/plan?entete=1&slug=fep26");
    const servie = (await r.json()).v;
    dit(servie === "ancienne", "version périmée : servie sans attendre la base", servie);
    await derriere();
    dit(e.CACHE.lis("ver2:fep26")?.v === "v3", "puis refaite derrière", e.CACHE.lis("ver2:fep26")?.v);
    const n = appelsPlan();
    dit(await entete(e) === "v3" && appelsPlan() === n, "fraîche de nouveau, elle ne redemande rien");

    // une entrée rangée avant ce relais, sans métadonnée, compte pour périmée
    await e.CACHE.put("ver2:fep26", "sans-date");
    version = "v4";
    dit(await entete(e) === "sans-date" && e.CACHE.lis("ver2:fep26")?.v === "v4",
      "une version d'avant, sans date, se sert et se refait");
  }

  /* — deux reconstructions croisées : celle partie la première, finie la
     dernière, ne remet pas la version d'avant */
  {
    const e = env();
    await e.CACHE.put("ver2:fep26", "v5", { metadata: { depuis: 1, frais: Date.now() - 1000 } });
    version = "v5";
    const lache = retiens();
    // la visite trouve la version périmée : sa reconstruction part, et attend
    const { derriere } = await sert(e, "/api/plan?entete=1&slug=fep26");
    await new Promise((r) => setTimeout(r, 5));
    // l'exploitant enregistre : son oubli part après, et finit avant
    version = "v6";
    await oublie(e);
    dit(e.CACHE.lis("ver2:fep26")?.v === "v6", "l'oubli range la version neuve");
    lache();
    await derriere();
    dit(e.CACHE.lis("ver2:fep26")?.v === "v6",
      "la reconstruction plus ancienne, finie après, ne la remplace pas", e.CACHE.lis("ver2:fep26")?.v);
    dit(e.CACHE.lis("v1?slug=fep26")?.meta?.v === "v6",
      "ni le plan qui va avec", e.CACHE.lis("v1?slug=fep26")?.meta?.v);
  }

  console.log(ko ? "\n" + ko + " échec(s)" : "\nl'entête répond du stockage, et l'oubli le refait");
  process.exit(ko ? 1 : 0);
})();
