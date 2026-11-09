/**
 * Un jeton refusé et un pavillon mal nommé reçoivent un refus, pas une panne.
 *
 * L'API publique du plan (`supabase/functions/plan-public/`) rendait un 500,
 * avec le message brut de la bibliothèque, à qui présentait un jeton forgé ou
 * sans signature, et à qui demandait `?fond=` avec autre chose qu'un uuid. On
 * éprouve ici les deux règles qui les en distinguent
 * (`supabase/functions/_partage/refus.ts`), telles que la fonction les importe,
 * sur les erreurs que PostgREST rend vraiment — relevées en production.
 *
 *   node outils/essais/refus.js     (lancé par `npm run essais`)
 */
const fs = require("fs");
const path = require("path");
const ts = require("typescript");

let ko = 0;
const dit = (ok, q, d) => {
  console.log((ok ? "  ok   " : "  ÉCHEC") + "  " + q + (d ? "   → " + d : ""));
  if (!ok) ko++;
};

(async () => {
  const source = fs.readFileSync(
    path.join(__dirname, "..", "..", "supabase", "functions", "_partage", "refus.ts"), "utf8");
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const { sessionRefusee, identifiantDePavillon } =
    await import("data:text/javascript;base64," + Buffer.from(js).toString("base64"));

  console.log("Jeton refusé");
  const refuses = {
    "un jeton tronqué": { code: "PGRST301", message: "Expected 3 parts in JWT; got 1" },
    "un jeton forgé": { code: "PGRST301", message: "No suitable key or wrong key type" },
    "un jeton sans signature": { code: "PGRST301", message: "Wrong or unsupported encoding algorithm" },
    "un jeton expiré": { code: "PGRST303", message: "JWT expired" },
    "un jeton expiré, sans code": { message: "JWT expired" },
  };
  for (const [q, e] of Object.entries(refuses)) dit(sessionRefusee(e) === true, q + " est une session refusée");
  const pannes = {
    "aucune erreur": null,
    "une base injoignable": { code: "PGRST000", message: "Could not connect to the database" },
    "une requête trop lente": { code: "57014", message: "canceling statement due to statement timeout" },
  };
  for (const [q, e] of Object.entries(pannes)) dit(sessionRefusee(e) === false, q + " n'en est pas une");

  console.log("Identifiant de pavillon");
  for (const id of ["176f3930-ee58-f111-a8d8-005056ac7c95", "ACF42B84-B25A-F111-A8D8-005056AC7C95"]) {
    dit(identifiantDePavillon(id), id + " est accepté");
  }
  for (const id of ["", "1", "H1", "x' or 1=1", "176f3930-ee58-f111-a8d8-005056ac7c95x",
                    "176f3930ee58f111a8d8005056ac7c95"]) {
    dit(!identifiantDePavillon(id), JSON.stringify(id) + " est refusé");
  }

  if (ko) { console.error(ko + " échec(s)"); process.exit(1); }
  console.log("Tout passe.");
})();
