/**
 * La forme d'un emplacement, calculée des deux côtés : la synchronisation
 * (`supabase/functions/_partage/geometrie.ts`) et la page (`modules/forme.mjs`).
 *
 * La page refait le calcul pour un stand repris ou ajouté à la main, et le
 * rendu n'a qu'une règle : si les deux divergeaient, un stand retouché
 * écrirait son nom ailleurs que s'il venait ainsi de la source — sans erreur,
 * seulement un nom qui saute d'un côté à l'autre quand on le touche. On fait
 * donc passer les mêmes formes par les deux, sur le chemin réel : le WKT de
 * Klipso lu par le serveur, servi en tracé, relu par la page.
 *
 * Le fichier du serveur est du TypeScript pour Deno : on en retire les types
 * avec le compilateur que `npm run types` emploie déjà, sans rien installer.
 *
 *   node outils/essais/forme.js     (lancé par `npm run essais`)
 */
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const ts = require("typescript");

let ko = 0;
const dit = (ok, q, d) => {
  console.log((ok ? "  ok   " : "  ÉCHEC") + "  " + q + (d ? "   → " + d : ""));
  if (!ok) ko++;
};

/* Un polygone WKT, Y dans le sens de Klipso (le serveur le retourne). */
const wkt = (...anneaux) => "MULTIPOLYGON(" + anneaux.map((a) =>
  "((" + a.concat([a[0]]).map(([x, y]) => x + " " + -y).join(", ") + "))").join(", ") + ")";

const FORMES = {
  "un rectangle": wkt([[0, 0], [6, 0], [6, 3], [0, 3]]),
  "un rectangle de biais": wkt([[0, 0], [5, 2], [3, 7], [-2, 5]]),
  "un carré tourné de 45°": wkt([[5, 0], [10, 5], [5, 10], [0, 5]]),
  "un L": wkt([[0, 0], [10, 0], [10, 4], [4, 4], [4, 10], [0, 10]]),
  "un U": wkt([[0, 0], [12, 0], [12, 9], [9, 9], [9, 3], [3, 3], [3, 9], [0, 9]]),
  "un stand en deux morceaux": wkt([[0, 0], [5, 0], [5, 5], [0, 5]], [[8, 0], [12, 0], [12, 3], [8, 3]]),
  "un îlot percé d'une cour": wkt([[0, 0], [20, 0], [20, 20], [0, 20]], [[7, 7], [13, 7], [13, 13], [7, 13]]),
  "une zone à quarante sommets": wkt(Array.from({ length: 40 }, (_, i) => {
    const a = (i / 40) * 2 * Math.PI, r = i % 2 ? 18 : 30;
    return [Math.round((50 + r * Math.cos(a)) * 100) / 100, Math.round((40 + r * Math.sin(a)) * 100) / 100];
  })),
  "des coordonnées loin de l'origine": wkt([[1204.37, 880.12], [1219.9, 880.12], [1219.9, 891.5], [1210, 891.5], [1210, 897.25], [1204.37, 897.25]]),
};

(async () => {
  const source = fs.readFileSync(path.join(__dirname, "..", "..", "supabase", "functions", "_partage", "geometrie.ts"), "utf8");
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  const S = await import("data:text/javascript;base64," + Buffer.from(js).toString("base64"));
  const P = await import(pathToFileURL(path.join(__dirname, "..", "gabarit", "modules", "forme.mjs")).href);

  console.log("\n=== 1. Le même ancrage du nom, des deux côtés ===");
  for (const [nom, w] of Object.entries(FORMES)){
    const anneaux = S.versAnneaux(w);
    const serveur = S.boite(anneaux);
    // ce que la page reçoit : le tracé, qu'elle relit en anneaux
    const page = P.boiteGeo(P.anneauxGeo(S.versTrace(anneaux)));
    dit(JSON.stringify(page) === JSON.stringify(serveur), nom,
      serveur.lc ? "nom en " + serveur.lc.join(", ") : "nom au centre");
  }

  /* Quatre sommets ne font pas un rectangle : de biais, sa boîte déborde la
     forme, et le nom mesuré sur elle débordait sur l'allée par les coins. */
  for (const nom of ["un rectangle de biais", "un carré tourné de 45°"]) {
    const b = S.boite(S.versAnneaux(FORMES[nom]));
    dit(Boolean(b.lb) && b.lb[0] < b.bb[0], nom + " : le nom tient dans la forme, pas dans sa boîte",
      b.lb ? "place " + b.lb.join(" × ") + " pour une boîte " + b.bb.join(" × ") : "raccourci du rectangle");
  }
  const droit = S.boite(S.versAnneaux(FORMES["un rectangle"]));
  dit(!droit.lb, "un rectangle droit garde son raccourci");
  /* Le rectangle du nom tient dans la forme, coins compris : un carré tourné
     de 45° (diagonale 10) n'offre qu'un carré droit de 5 de côté. */
  {
    const anneaux = S.versAnneaux(FORMES["un carré tourné de 45°"]);
    const b = S.boite(anneaux);
    const coins = b.lb ? [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([i, j]) =>
      [b.lc[0] + i * b.lb[0] / 2, b.lc[1] + j * b.lb[1] / 2]) : [];
    // le losange de centre (5, 5) et de demi-diagonale 5, relu en Y inversé par le serveur
    const tous = coins.length && coins.every(([x, y]) => Math.abs(x - 5) + Math.abs(Math.abs(y) - 5) <= 5 + 1e-6);
    dit(Boolean(b.lb) && b.lb[0] <= 5.01 && b.lb[0] > 4.5 && b.lb[1] <= 5.01 && b.lb[1] > 4.5,
      "un carré tourné de 45° : le nom tient dans un carré de 5", b.lb ? b.lb.join(" × ") : "rien");
    dit(Boolean(tous), "  ses coins sont dans la forme");
  }
  /* Un rectangle long et penché : réduit, son nom passe sous le cinquième de
     la boîte. Il garde pourtant sa place réduite, au lieu de retomber sur la
     boîte englobante, qui déborde par les coins. */
  {
    const a = S.versAnneaux(wkt([[0, 0], [10, 10], [8, 12], [-2, 2]]));
    const b = S.boite(a);
    dit(Boolean(b.lb) && b.lb[0] < b.bb[0] / 2, "un rectangle long et penché garde un nom qui tient dedans",
      b.lb ? b.lb.join(" × ") + " pour une boîte " + b.bb.join(" × ") : "boîte englobante");
    const page = P.boiteGeo(a);
    dit(JSON.stringify(page) === JSON.stringify(b), "  la page en dit autant", JSON.stringify(page));
  }

  console.log("\n=== 2. Le tracé, et son retour en anneaux ===");
  const l = S.versAnneaux(FORMES["un L"]);
  const relus = P.anneauxGeo(S.versTrace(l));
  dit(relus.length === 1 && relus[0].length === l[0].length - 1,
    "le sommet de fermeture que le relevé répète est retiré", relus[0].length + " sommets");
  dit(P.traceGeo(relus) === S.versTrace(relus), "la page trace comme le serveur");
  dit(JSON.stringify(P.anneauxGeo(P.traceGeo(relus))) === JSON.stringify(relus), "tracer puis relire rend la même forme");
  dit(P.anneauxGeo("M0 0L1 1Z").length === 0, "un anneau de moins de trois sommets n'en est pas un");

  console.log("\n=== 3. Dedans ou dehors ===");
  const u = S.versAnneaux(FORMES["un U"])[0];
  let ecarts = 0, n = 0;
  for (let x = -1; x <= 13; x += 0.37) for (let y = -1; y <= 10; y += 0.29)
    if (++n && P.dansAnneau([x, y], u) !== S.dedans([x, y], u)) ecarts++;
  dit(ecarts === 0, "la page et le serveur classent les mêmes points", ecarts + " désaccord(s) sur " + n + " points");
  dit(!P.dansAnneau([6, 6], u) && P.dansAnneau([1.5, 6], u) && P.dansAnneau([6, 1.5], u), "le creux du U est dehors, ses branches et sa base dedans");

  console.log("\n=== 4. L'empreinte ===");
  const d = S.versTrace(l);
  dit(P.empreinteGeo({ d }) === P.empreinteGeo({ d: String(d) }), "elle ne dépend que du tracé");
  dit(P.empreinteGeo({ d }) !== P.empreinteGeo({ d: d.replace("10", "10.01") }), "un centimètre la change");
  dit(P.empreinteGeo(null) === P.empreinteGeo({ d: "" }), "pas de tracé, une empreinte quand même");

  console.log(ko ? "\n" + ko + " ÉCHEC(S)\n" : "\nLa page et la synchronisation dessinent la même forme.\n");
  process.exit(ko ? 1 : 0);
})();
