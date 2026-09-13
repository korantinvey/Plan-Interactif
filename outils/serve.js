/**
 * Serveur d'essai. Les pages portent désormais leur propre squelette : on les
 * sert telles quelles, sans rien ajouter, pour tester exactement ce qui est
 * déployé.
 */
const http = require("http"), https = require("https"), fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "web") + path.sep;
const AMONT = "https://jylkfskotuafptaxujao.supabase.co/functions/v1/plan-public";

/* La feuille de style ne peut pas tomber dans le type par défaut : un
   navigateur refuse un style qui n'arrive pas en `text/css`, sans rien dire
   d'autre qu'une page sans mise en forme — et la console, dont tout l'écran
   tient dans `console.css`, s'y montrait nue jusqu'à la fenêtre de connexion. */
const TYPES = {
  html: "text/html; charset=utf-8",
  js: "text/javascript; charset=utf-8",
  css: "text/css; charset=utf-8",
  /* Même exigence pour le manifeste et les icônes : un manifeste servi en
     flux d'octets n'est pas lu, et l'essai local ne montrerait pas ce que
     Cloudflare, lui, sert correctement — une application qui ne s'installe
     qu'en production ne se met pas au point. */
  webmanifest: "application/manifest+json; charset=utf-8",
  svg: "image/svg+xml",
  png: "image/png",
};

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

  /* Le manifeste est complété en production par le Worker (`src/index.mjs`) :
     il y reçoit l'adresse du salon d'où l'on installe. Sans ce même geste ici,
     l'essai local montrerait une application installable qui rouvre toujours
     le salon par défaut — le seul défaut qu'on cherche justement à voir. */
  if (u === "/manifeste.webmanifest"){
    const contenu = JSON.parse(fs.readFileSync(DIR + "manifeste.webmanifest", "utf8"));
    const depart = new URLSearchParams(q.url.split("?")[1] || "").get("depart");
    const base = "http://localhost:4180/";
    const cible = depart ? new URL(depart, base) : null;
    if (cible && cible.origin === new URL(base).origin){
      contenu.start_url = cible.pathname + cible.search;
    }
    s.writeHead(200, { "Content-Type": TYPES.webmanifest, "Cache-Control": "no-store" });
    return s.end(JSON.stringify(contenu));
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
