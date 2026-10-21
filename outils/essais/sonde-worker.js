/**
 * La porte des relevés de performance, sur le vrai Worker.
 *
 * `POST /api/sonde` relaie le résumé d'une visite à la RPC `sonde_publique`.
 * Ce qu'il doit tenir : la même origine seulement, une taille bornée, rien
 * d'écrit depuis une prévisualisation, un corps lu en texte (un `sendBeacon`
 * part en `text/plain`), et la position des gels — un décalage en caractères
 * dans le script servi — ramenée au module et à la ligne d'origine, car la
 * page n'a pas à décoder 600 Ko sur le téléphone qui vient de geler.
 *
 *   node outils/essais/sonde-worker.js     (chaîné dans `npm run essais`)
 */
const path = require("path");
const { pathToFileURL } = require("url");
const modules = require("../modules.js");

let ko = 0;
const dit = (ok, q, d) => {
  console.log((ok ? "  ok   " : "  ÉCHEC") + "  " + q + (d ? "   → " + d : ""));
  if (!ok) ko++;
};

const PRODUCTION = "https://plan-interactif.interactiveplan.workers.dev";
const BRANCHE = "https://ma-branche-plan-interactif.interactiveplan.workers.dev";
const SCRIPT = "/versions/plan.0123456789.js";

(async () => {
  let worker;
  try {
    worker = (await import(pathToFileURL(path.join(__dirname, "..", "..", "src", "index.mjs")))).default;
  } catch (e) {
    console.log("  ÉCHEC  le Worker ne se charge pas   → " + e.message);
    process.exit(1);
  }
  const { VERSION_DES_PAGES, APERCU } = await import(pathToFileURL(path.join(__dirname, "..", "..", "src", "pages.mjs")));
  if (APERCU) { console.log("  — construit pour une prévisualisation : l'essai demande la construction de production"); process.exit(1); }

  /* Le vrai script du plan, minifié comme la construction le fait, et sa
     carte : on y cherche une phrase dont on connaît le module. */
  const tout = modules.assemble("plan", { MARQUE_PRODUIT: '"<svg></svg>"' });
  const code = tout.slice(0, tout.indexOf("\n// outils/"));
  const carte = modules.carteDe(code);
  const PHRASE = "n'est pas une donnée du plan";
  const lignes = code.split("\n");
  const l = lignes.findIndex((x) => x.includes(PHRASE));
  const colonne0 = lignes[l].indexOf(PHRASE);
  let position = colonne0;
  for (let i = 0; i < l; i++) position += lignes[i].length + 1;

  let lectures = 0;
  const env = { ASSETS: { fetch: async (r) => {
    const p = new URL(r.url).pathname;
    if (p === SCRIPT) { lectures++; return new Response(code); }
    if (p === SCRIPT + ".map") return new Response(carte);
    return new Response(null, { status: 404 });
  } } };

  const parti = [];
  globalThis.fetch = async (u, o) => {
    parti.push({ url: String(u), corps: o && o.body ? JSON.parse(o.body) : null });
    return new Response("true", { headers: { "Content-Type": "application/json" } });
  };
  const ctx = { waitUntil() {} };
  const appel = (origine, corps, init = {}) => worker.fetch(new Request(origine + "/api/sonde", {
    method: "POST", body: typeof corps === "string" ? corps : JSON.stringify(corps), ...init,
  }), env, ctx);
  const resume = (pires) => ({ format: "sonde-plan/1", page: "plan", gels: { n: pires.length, pires } });
  const visite = "5f0c3c1e-8d6b-4b9a-9f43-0d3a6a1e0001";
  const valide = (extra = {}) => ({ slug: "smcl-2026", page: "plan", visite, resume: resume([]), ...extra });

  // — la production : le relevé part vers la RPC, tel quel
  {
    parti.length = 0;
    // un sendBeacon part en text/plain : le Worker lit le texte, il n'exige pas du JSON typé
    const r = await appel(PRODUCTION, valide(), { headers: { "Content-Type": "text/plain;charset=UTF-8" } });
    const c = parti[0];
    dit(r.status === 204, "un corps valide est acquitté", r.status);
    dit(!!c && /\/rest\/v1\/rpc\/sonde_publique$/.test(c.url), "il part vers sonde_publique", c && c.url);
    dit(c && c.corps.p_version === VERSION_DES_PAGES && c.corps.p_slug === "smcl-2026" && c.corps.p_visite === visite,
      "avec la version des pages, le salon et la visite");
    dit(c && c.corps.p_page === "plan" && c.corps.p_resume.format === "sonde-plan/1", "la page et le résumé sont repris");
    parti.length = 0;
    await appel(PRODUCTION, valide({ page: "borne" }));
    dit(parti[0] && parti[0].corps.p_page === "borne", "la borne est reconnue");
    parti.length = 0;
    await appel(PRODUCTION, valide({ page: "admin" }));
    dit(parti[0] && parti[0].corps.p_page === "plan", "toute autre page vaut « plan »", parti[0] && parti[0].corps.p_page);
  }

  // — ce qui est refusé
  {
    parti.length = 0;
    const g = await worker.fetch(new Request(PRODUCTION + "/api/sonde"), env, ctx);
    dit(g.status === 405, "un GET est refusé (405)", g.status);
    const e = await appel(PRODUCTION, valide(), { headers: { Origin: "https://ailleurs.exemple" } });
    dit(e.status === 403, "une autre origine est refusée (403)", e.status);
    const m = await appel(PRODUCTION, "x".repeat(6144));
    dit(m.status === 400, "6144 octets passent la taille (puis 400 : pas du JSON)", m.status);
    const t = await appel(PRODUCTION, "x".repeat(6145));
    dit(t.status === 413, "6145 octets sont refusés (413)", t.status);
    const b = await appel(PRODUCTION, "{");
    dit(b.status === 400, "un corps illisible est refusé (400)", b.status);
    dit(parti.length === 0, "et rien ne part vers la base", parti.length + " appel(s)");
  }

  // — une prévisualisation n'écrit pas
  {
    parti.length = 0;
    const r = await appel(BRANCHE, valide());
    dit(r.status === 204 && r.headers.get("X-Apercu") === "ecarte", "aperçu : acquitté, marqué écarté");
    dit(parti.length === 0, "aperçu : aucun appel", parti.length + " appel(s)");
  }

  // — la position d'un gel redevient un module et une ligne
  {
    parti.length = 0;
    const attendu = require("fs").readFileSync(path.join(__dirname, "..", "gabarit", "modules", "donnees.mjs"), "utf8")
      .split("\n").findIndex((x) => x.includes(PHRASE)) + 1;
    await appel(PRODUCTION, valide({ resume: resume([
      { ms: 180, geste: "zoom", fichier: SCRIPT, fonction: "ouvre", position },
      { ms: 120, geste: "pan", fichier: SCRIPT, fonction: "autre", position: position + 1 },
      { ms: 90, geste: "clic", fichier: "https://cdn.exemple/lib/maplibre.js?v=3", fonction: "", position: 4242 },
    ]) }));
    const p = parti[0] && parti[0].corps.p_resume.gels.pires;
    dit(p && p[0].lieu === "modules/donnees.mjs:" + attendu, "un gel est ramené à son module et à sa ligne", p && p[0].lieu);
    dit(p && p[0].fichier === undefined && p[0].position === undefined, "sans fichier ni position une fois résolu");
    dit(p && p[0].ms === 180 && p[0].geste === "zoom" && p[0].fonction === "ouvre", "le reste du gel est conservé");
    dit(lectures === 1, "le script n'est lu qu'une fois pour deux gels", lectures + " lecture(s)");
    dit(p && p[2].fichier === "maplibre.js" && p[2].position === undefined && p[2].lieu === undefined,
      "un autre fichier ne garde que son dernier segment", p && JSON.stringify(p[2]));
    parti.length = 0;
    await appel(PRODUCTION, valide({ resume: resume([
      { ms: 60, geste: "clic", fichier: SCRIPT, fonction: "sans", position: -1 },
      { ms: 50, geste: "clic", fichier: SCRIPT, fonction: "loin", position: code.length + 10 },
      { ms: 40, geste: "clic", fichier: SCRIPT, fonction: "texte", position: "12" },
      { ms: 30, geste: "clic", fichier: SCRIPT, fonction: "quatrieme", position },
    ]) }));
    const q = parti[0] && parti[0].corps.p_resume.gels.pires;
    dit(q && q.length === 3 && q.every((x) => x.fichier === "plan.0123456789.js" && x.lieu === undefined && x.position === undefined),
      "une position invalide n'est pas résolue, et trois gels au plus sont relayés", q && JSON.stringify(q));
  }

  if (ko) { console.error("\n" + ko + " échec(s)."); process.exit(1); }
  console.log("\nTout passe.");
})().catch((e) => { console.error(e); process.exit(1); });
