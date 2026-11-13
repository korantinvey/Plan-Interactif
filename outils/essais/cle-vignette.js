/* La clé d'une vignette de logo (`supabase/functions/_partage/vignette.ts`
   `cleDeVignette`). Elle sert de version dans l'adresse publique, gardée un
   an : une vignette refaite doit en changer, sans quoi la nouvelle image
   n'arrive chez personne. La démonstration la calcule de même
   (`outils/scripts/salon-demo.js`). */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const ts = require("typescript");

let ko = 0;
const dit = (ok, q, d) => {
  console.log((ok ? "  ok   " : "  ÉCHEC") + "  " + q + (d ? "   → " + d : ""));
  if (!ok) ko++;
};

(async () => {
  const source = fs.readFileSync(path.join(__dirname, "..", "..", "supabase", "functions", "_partage", "vignette.ts"), "utf8");
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  const { cleDeVignette } = await import("data:text/javascript;base64," + Buffer.from(js).toString("base64"));

  const a = "https://exemple.fr/logo.png";
  const cle = await cleDeVignette(a, "webp", "AAAA", "BBBB");
  dit(/^[0-9a-f]{24}$/.test(cle), "vingt-quatre chiffres hexadécimaux", cle);
  dit(cle === await cleDeVignette(a, "webp", "AAAA", "BBBB"), "le même contenu garde sa clé");
  dit(cle !== await cleDeVignette(a, "webp", "AAAC", "BBBB"), "une vignette refaite en change");
  dit(cle !== await cleDeVignette(a, "webp", "AAAA", "BBBC"), "une grande refaite aussi");
  dit(cle !== await cleDeVignette(a, "avif", "AAAA", "BBBB"), "l'AVIF a la sienne");
  dit(cle !== await cleDeVignette("https://autre.fr/logo.png", "webp", "AAAA", "BBBB"),
    "deux adresses au même logo ont chacune la leur");
  // la règle que la démonstration recopie
  const demo = crypto.createHash("sha256").update(["webp", a, "AAAA", "BBBB"].join("\n")).digest().subarray(0, 12).toString("hex");
  dit(demo === cle, "la démonstration calcule la même clé");

  console.log(ko ? "\n" + ko + " échec(s)" : "\nTout tient.");
  process.exit(ko ? 1 : 0);
})();
