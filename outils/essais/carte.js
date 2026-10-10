/**
 * La carte de correspondance du script minifié, relue par le Worker.
 *
 * Une erreur remontée par une page arrive en position minifiée ; le Worker la
 * ramène au module et à la ligne d'origine (`src/carte.mjs`) avant de
 * l'écrire. Si le décodage se trompait, le rapport désignerait sans un mot une
 * ligne qui n'a rien à voir. On assemble donc le vrai script du plan, tel que
 * la construction le minifie, et l'on y cherche des phrases dont on sait le
 * module : la carte doit tomber sur la ligne qui les porte.
 *
 *   node outils/essais/carte.js     (chaîné dans `npm run essais`)
 */
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const modules = require("../modules.js");

let ko = 0;
const dit = (ok, q, d) => {
  console.log((ok ? "  ok   " : "  ÉCHEC") + "  " + q + (d ? "   → " + d : ""));
  if (!ok) ko++;
};

(async () => {
  const { lisCarte, source } = await import(pathToFileURL(path.join(__dirname, "..", "..", "src", "carte.mjs")));
  const tout = modules.assemble("plan", { MARQUE_PRODUIT: '"<svg></svg>"' });
  const code = tout.slice(0, tout.indexOf("\n// outils/"));
  const brute = modules.carteDe(code);
  dit(!!brute, "le script minifié a sa carte");
  if (!brute) process.exit(1);
  const lue = lisCarte(JSON.parse(brute));
  const lignes = code.split("\n");

  /* Des phrases du code, chacune en un seul endroit du dépôt : la carte doit
     la ramener au module qui la porte, à la ligne même. */
  for (const phrase of ["n'est pas une donnée du plan", "plan-tutoriel:", "Touchez le plan à l'endroit"]) {
    const l = lignes.findIndex((x) => x.includes(phrase));
    const s = l < 0 ? null : source(lue, l + 1, lignes[l].indexOf(phrase));
    const texte = s ? fs.readFileSync(path.join(modules.MODULES, "..", s.fichier), "utf8").split("\n")[s.ligne - 1] : "";
    dit(!!s && texte.includes(phrase.slice(0, 12)), "« " + phrase + " » revient à sa ligne",
      s ? s.fichier + ":" + s.ligne : "introuvable");
  }

  dit(source(lue, 1, -1) === null, "une colonne avant tout segment ne désigne rien");
  dit(source(lue, 9999, 0) === null, "une ligne hors du script ne désigne rien");
  dit(source(lisCarte({ mappings: "", sources: [] }), 1, 0) === null, "une carte vide ne désigne rien");

  /* Le chemin réel : une erreur arrive au Worker, il lit la carte dans les
     fichiers servis, et ne passe à la base que le message et l'endroit. Les
     fichiers sont ceux de `web/`, construits ; sans eux, cette partie se tait. */
  const WEB = path.join(__dirname, "..", "..", "web");
  const script = fs.existsSync(path.join(WEB, "versions")) &&
    fs.readdirSync(path.join(WEB, "versions")).find((f) => /^plan\.[0-9a-f]{10}\.js$/.test(f));
  if (!script) {
    console.log("  —      `web/` absent : le passage par le Worker n'est pas éprouvé (npm run construire)");
  } else {
    const worker = (await import(pathToFileURL(path.join(__dirname, "..", "..", "src", "index.mjs")))).default;
    const env = { ASSETS: { fetch: async (r) => {
      const f = path.join(WEB, new URL(r.url).pathname);
      return fs.existsSync(f) ? new Response(fs.readFileSync(f)) : new Response(null, { status: 404 });
    } } };
    const servi = fs.readFileSync(path.join(WEB, "versions", script), "utf8").split("\n");
    const l = servi.findIndex((x) => x.includes("n'est pas une donnée du plan"));
    const parti = [];
    const vrai = globalThis.fetch;
    globalThis.fetch = async (url, o) => { parti.push({ url: String(url), corps: JSON.parse(o.body) }); return new Response("true"); };
    const appel = (corps, origine = "https://essai.exemple") => worker.fetch(new Request("https://essai.exemple/api/erreur", {
      method: "POST", headers: { Origin: origine, "Content-Type": "application/json" }, body: JSON.stringify(corps),
    }), env, {});
    const r = await appel({ slug: "smcl-2026", page: "plan", erreurs: [
      { message: "TypeError: essai", fichier: "https://essai.exemple/versions/" + script,
        ligne: l + 1, colonne: servi[l].indexOf("n'est pas une donnée du plan") + 1 },
      { message: "ailleurs", fichier: "https://essai.exemple/inconnu.js", ligne: 3, colonne: 7, visiteur: "jeton" },
    ] });
    const c = parti[0] && parti[0].corps;
    dit(r.status === 204 && !!c && /erreur_publique$/.test(parti[0].url), "le Worker passe l'erreur à la porte de la base");
    dit(c && c.p_erreurs[0].lieu === "modules/donnees.mjs:59", "et la ramène à son module",
      c && c.p_erreurs[0].lieu);
    dit(c && c.p_erreurs[1].lieu === "inconnu.js:3:7", "un fichier sans carte garde sa position", c && c.p_erreurs[1].lieu);
    dit(c && !JSON.stringify(c).includes("jeton"), "rien d'autre que le message et l'endroit ne part");
    parti.length = 0;
    const r2 = await appel({ slug: "smcl-2026", erreurs: [{ message: "x" }] }, "https://ailleurs.exemple");
    globalThis.fetch = vrai;
    dit(r2.status === 403 && !parti.length, "une page d'une autre origine est refusée, et rien ne part");
  }

  if (ko) { console.error("\n" + ko + " échec(s)."); process.exit(1); }
  console.log("\nTout passe.");
})().catch((e) => { console.error(e); process.exit(1); });
