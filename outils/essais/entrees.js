/**
 * Ce que les fonctions refusent à l'entrée, éprouvé sur les règles elles-mêmes.
 *
 * Deux règles qu'une fonction Edge applique à ce qu'un navigateur lui envoie,
 * c'est-à-dire à ce que n'importe qui peut lui envoyer :
 *
 *   · `imageReconnue` (`_partage/vignette.ts`) — une vignette de logo n'entre en
 *     base que si elle est une image, et d'une taille raisonnable : elle est
 *     servie sous un type d'image, un an durant, à tous les visiteurs ;
 *   · `servicePush` (`_partage/push.ts`) — un rappel ne part que vers le
 *     service de notification d'un navigateur, jamais vers l'hôte que
 *     l'abonnement voudrait.
 *
 * Le fichier du serveur est du TypeScript pour Deno : on en retire les types
 * avec le compilateur que `npm run types` emploie déjà, comme `forme.js`.
 *
 *   node outils/essais/entrees.js     (chaîné dans `npm run essais`)
 */
const fs = require("fs");
const path = require("path");
const ts = require("typescript");

let ko = 0;
const dit = (ok, q, d) => {
  console.log((ok ? "  ok   " : "  ÉCHEC") + "  " + q + (d ? "   → " + d : ""));
  if (!ok) ko++;
};

async function charge(fichier) {
  const source = fs.readFileSync(
    path.join(__dirname, "..", "..", "supabase", "functions", "_partage", fichier), "utf8");
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  return import("data:text/javascript;base64," + Buffer.from(js).toString("base64"));
}

const b64 = (octets) => Buffer.from(octets).toString("base64");
/* Les têtes réelles des trois formats, suivies d'octets quelconques. */
const WEBP = b64([..."RIFF"].map((c) => c.charCodeAt(0)).concat([0x24, 0, 0, 0],
  [..."WEBPVP8 "].map((c) => c.charCodeAt(0)), new Array(20).fill(7)));
const PNG = b64([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, ...new Array(24).fill(1)]);
const JPEG = b64([0xff, 0xd8, 0xff, 0xe0, ...new Array(28).fill(2)]);
const SVG = b64(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"/>'));
const HTML = b64(Buffer.from("<!doctype html><script>alert(1)</script>"));

(async () => {
  const V = await charge("vignette.ts");
  console.log("Vignettes de logo");
  dit(V.imageReconnue(WEBP), "un WebP passe");
  dit(V.imageReconnue(PNG), "un PNG passe (Safari n'encode pas toujours le WebP)");
  dit(V.imageReconnue(JPEG), "un JPEG passe");
  dit(!V.imageReconnue(SVG), "un SVG est refusé");
  dit(!V.imageReconnue(HTML), "du HTML est refusé");
  dit(!V.imageReconnue(""), "une chaîne vide est refusée");
  dit(!V.imageReconnue("data:image/webp;base64," + WEBP), "une adresse data: est refusée");
  dit(!V.imageReconnue(WEBP.slice(0, 12) + "€€€€" + WEBP.slice(16)), "un base64 abîmé est refusé");
  dit(!V.imageReconnue(WEBP + "A".repeat(V.IMAGE_MAX)), "une image démesurée est refusée",
    "borne " + V.IMAGE_MAX);

  const P = await charge("push.ts");
  console.log("Services de notification");
  for (const hote of ["fcm.googleapis.com", "updates.push.services.mozilla.com",
                      "web.push.apple.com", "api.push.apple.com",
                      "wns2-par02p.notify.windows.com"]) {
    dit(P.servicePush(hote), "accepté : " + hote);
  }
  for (const hote of ["exemple.fr", "fcm.googleapis.com.exemple.fr", "evilpush.apple.com",
                      "169.254.169.254", "localhost", "notify.windows.com.exemple.fr"]) {
    dit(!P.servicePush(hote), "refusé : " + hote);
  }

  console.log(ko ? `\n${ko} échec(s).` : "\nTout passe.");
  process.exit(ko ? 1 : 0);
})();
