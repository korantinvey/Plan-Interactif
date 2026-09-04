/**
 * Serveur d'essai. Les pages portent désormais leur propre squelette : on les
 * sert telles quelles, sans rien ajouter, pour tester exactement ce qui est
 * déployé.
 */
const http = require("http"), https = require("https"), fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "web") + path.sep;
const AMONT = "https://jylkfskotuafptaxujao.supabase.co/functions/v1/plan-public";

const TYPES = { html: "text/html; charset=utf-8", js: "text/javascript; charset=utf-8" };

http.createServer((q, s) => {
  let u = q.url.split("?")[0];

  // même chemin qu'en production : les pages appellent /api/plan
  if (u === "/api/plan"){
    const cible = AMONT + "?" + (q.url.split("?")[1] || "");
    const entetes = {};
    ["authorization", "apikey"].forEach(h => { if (q.headers[h]) entetes[h] = q.headers[h]; });
    https.get(cible, { headers: entetes }, r => {
      s.writeHead(r.statusCode, { "Content-Type": "application/json", "Cache-Control": "no-store" });
      r.pipe(s);
    }).on("error", e => { s.writeHead(502); s.end(e.message); });
    return;
  }

  if (u === "/") u = "/index.html";
  if (u.indexOf(".") < 0) u += ".html";
  const f = DIR + u.slice(1);
  if (u.indexOf("..") >= 0 || !fs.existsSync(f)) { s.writeHead(404); return s.end("introuvable"); }
  s.writeHead(200, {
    "Content-Type": TYPES[u.split(".").pop()] || "application/octet-stream",
    "Cache-Control": "no-store",
  });
  s.end(fs.readFileSync(f));
}).listen(4180, () => console.log("http://localhost:4180 pret"));
