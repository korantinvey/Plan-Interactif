/**
 * Le minutage du relais (`src/index.mjs` `minute`), sur le vrai Worker.
 *
 * Ce que la page doit pouvoir lire sur tout ce qu'il sert : son temps (`w`),
 * son point de présence (`cf`) quand Cloudflare le nomme, ce que son cache a
 * rendu (`cache`, la valeur d'`X-Cache`), et l'heure de sa réponse (`t`). Rien
 * d'autre n'y passe : une valeur qui n'a pas la forme attendue n'est pas
 * recopiée dans l'en-tête.
 *
 *   node outils/essais/minutage-relais.js     (lancé par `npm run essais`)
 */
const path = require("path");
const { pathToFileURL } = require("url");

let ko = 0;
const dit = (ok, q, d) => {
  console.log((ok ? "  ok   " : "  ÉCHEC") + "  " + q + (d ? "   → " + d : ""));
  if (!ok) ko++;
};

(async () => {
  let worker;
  try {
    worker = (await import(pathToFileURL(path.join(__dirname, "..", "..", "src", "index.mjs")))).default;
  } catch (e) {
    console.log("  ÉCHEC  le Worker ne se charge pas   → " + e.message);
    process.exit(1);
  }
  /* Un fichier de `web/`, servi par la liaison des pages : il porte, comme
     `/api/plan`, ce que le cache a rendu. */
  const env = { ASSETS: { fetch: async () => new Response("<!doctype html>", { headers: { "X-Cache": "hit" } }) } };
  const demande = (cf) => {
    const r = new Request("https://plan-interactif.interactiveplan.workers.dev/hors-ligne.html");
    if (cf) Object.defineProperty(r, "cf", { value: cf });
    return r;
  };

  const st = (await worker.fetch(demande({ colo: "CDG" }), env, {})).headers.get("Server-Timing") || "";
  dit(/(^|, )w;dur=\d+(,|$)/.test(st), "le temps du relais est dit", st);
  dit(st.includes('cf;desc="CDG"'), "son point de présence aussi", st);
  dit(st.includes('cache;desc="hit"'), "et ce que son cache a rendu", st);
  const t = Number((/t;desc="(\d+)"/.exec(st) || [])[1]);
  dit(Math.abs(t - Date.now() / 1000) < 5, "et l'heure de sa réponse, en secondes", st);

  const sans = (await worker.fetch(demande(null), env, {})).headers.get("Server-Timing") || "";
  dit(/^w;dur=\d+/.test(sans) && !sans.includes("cf;"), "sans point de présence nommé, le temps seul", sans);

  const etrange = (await worker.fetch(demande({ colo: 'CDG", x;dur=1' }), env, {})).headers.get("Server-Timing") || "";
  dit(!etrange.includes("x;"), "un point de présence d'une forme inattendue n'est pas recopié", etrange);

  process.exit(ko ? 1 : 0);
})();
