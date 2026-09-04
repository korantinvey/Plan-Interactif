/**
 * Serveur d'essai. Les pages portent désormais leur propre squelette : on les
 * sert telles quelles, sans rien ajouter, pour tester exactement ce qui est
 * déployé.
 */
const http = require("http"), fs = require("fs");
const DIR = "C:/projets/Plan Interactif/web/";

const TYPES = { html: "text/html; charset=utf-8", js: "text/javascript; charset=utf-8" };

http.createServer((q, s) => {
  let u = q.url.split("?")[0];
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
