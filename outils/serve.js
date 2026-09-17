/**
 * Serveur d'essai. Les pages portent désormais leur propre squelette : on les
 * sert telles quelles, sans rien ajouter, pour tester exactement ce qui est
 * déployé.
 */
const http = require("http"), https = require("https"), fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "web") + path.sep;
const AMONT = "https://jylkfskotuafptaxujao.supabase.co/functions/v1/plan-public";
/* La forme d'un nom de salon, la même qu'au relais : elle sert à reconnaître
   l'adresse propre à un salon comme à contrôler ce qu'on relaie. */
const SALON = /^[a-z0-9][a-z0-9-]{0,63}$/;
/* Et l'adresse qu'un salon porte, celle que son application ouvre. */
const CHEMIN_SALON = /^\/plan-[a-z0-9][a-z0-9-]{0,63}$/;

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
  woff2: "font/woff2",
};

http.createServer((q, s) => {
  let u = q.url.split("?")[0];

  /* L'entête du plan, rendu ici comme le Worker le rend (`src/index.mjs`) : la
     fonction ne connaît pas ce paramètre — c'est le relais qui répond, de son
     stockage. Sans ce détour, l'essai local recevrait le plan entier là où la
     page attend sa version, et le seul geste qu'on voulait éprouver ne
     s'éprouverait pas. Rien n'est gardé ici : un poste d'essai n'a pas de
     stockage, et n'en a pas besoin. */
  if (u === "/api/plan" && new URLSearchParams(q.url.split("?")[1] || "").get("entete")){
    const p = new URLSearchParams(q.url.split("?")[1] || "");
    https.get(AMONT + "?slug=" + encodeURIComponent(p.get("slug") || ""), r => {
      const v = r.headers["x-version"];
      r.resume();                      // on ne lit pas le plan, seulement son entête
      s.writeHead(v ? 200 : 502, { "Content-Type": "application/json",
                                   "Cache-Control": "no-store" });
      s.end(JSON.stringify(v ? { v } : { erreur: "Version absente." }));
    }).on("error", e => { s.writeHead(502); s.end(e.message); });
    return;
  }

  // même chemin qu'en production : les pages appellent /api/plan
  if (u === "/api/plan"){
    const cible = AMONT + "?" + (q.url.split("?")[1] || "");
    const entetes = {};
    ["authorization", "apikey"].forEach(h => { if (q.headers[h]) entetes[h] = q.headers[h]; });
    https.get(cible, { headers: entetes }, r => {
      /* Le type vient de l'amont : ce chemin ne rend pas que du JSON — une
         vignette de logo est une image, et l'annoncer en JSON la laissait
         brisée en tête de fiche, ici seulement. */
      s.writeHead(r.statusCode, {
        "Content-Type": r.headers["content-type"] || "application/json",
        "Cache-Control": "no-store",
      });
      r.pipe(s);
    }).on("error", e => { s.writeHead(502); s.end(e.message); });
    return;
  }

  /* L'icône de l'application, relayée comme le fait le Worker : elle n'est pas
     un fichier de `web/` mais une colonne de la base, et sans ce détour l'essai
     local montrerait une application sans icône là où la production en a une. */
  if (u === "/api/icone"){
    const p = new URLSearchParams(q.url.split("?")[1] || "");
    const salon = p.get("salon") || "";
    if (!SALON.test(salon)){ s.writeHead(400); return s.end("salon invalide"); }
    https.get(AMONT + "?slug=" + encodeURIComponent(salon) + "&icone=1" +
      (p.get("masque") ? "&masque=1" : ""), r => {
      s.writeHead(r.statusCode, {
        "Content-Type": r.headers["content-type"] || "image/png",
        "Cache-Control": "no-store",
      });
      r.pipe(s);
    }).on("error", e => { s.writeHead(502); s.end(e.message); });
    return;
  }

  /* Le manifeste est complété en production par le Worker (`src/index.mjs`) :
     il y reçoit le salon d'où l'on installe, dont il tire le nom de
     l'application et l'adresse qu'elle rouvrira. Sans ce même geste ici,
     l'essai local montrerait une application au nom du produit, qui rouvre
     toujours le salon par défaut — les deux défauts qu'on cherche à voir.

     Le tour de phrase est celui du Worker, redit et non partagé : le Worker
     s'exécute chez Cloudflare, ce fichier sous Node, et rien ne circule de
     l'un à l'autre. */
  if (u === "/manifeste.webmanifest"){
    const contenu = JSON.parse(fs.readFileSync(DIR + "manifeste.webmanifest", "utf8"));
    const params = new URLSearchParams(q.url.split("?")[1] || "");
    const sert = () => {
      s.writeHead(200, { "Content-Type": TYPES.webmanifest, "Cache-Control": "no-store" });
      s.end(JSON.stringify(contenu));
    };
    const salon = params.get("salon") || "";
    if (!SALON.test(salon)) return sert();
    /* Le territoire du salon, déduit de son nom comme le fait le Worker : c'est
       lui qui sépare les applications les unes des autres, et l'essai local
       doit pouvoir le montrer. */
    contenu.start_url = "/plan-" + salon;
    contenu.scope = "/plan-" + salon;
    contenu.id = "/plan-" + salon;
    https.get(AMONT + "?slug=" + encodeURIComponent(salon) + "&app=1", r => {
      let texte = "";
      r.on("data", (c) => { texte += c; });
      r.on("end", () => {
        let dit = {};
        try { dit = JSON.parse(texte) || {}; } catch (e) {}
        const nom = String(dit.evenement || "").trim();
        const choisi = String(dit.app || "").trim();
        if (r.statusCode === 200 && nom){
          contenu.name = choisi || "Plan " + nom + " by Event2Plan";
          contenu.short_name = choisi || nom;
        }
        const empreinte = String(dit.icone || "");
        if (r.statusCode === 200 && /^[0-9a-f]{8,32}$/.test(empreinte)){
          const adresse = (masque) => "/api/icone?salon=" + encodeURIComponent(salon) +
            (masque ? "&masque=1" : "") + "&v=" + empreinte;
          contenu.icons = [
            { src: adresse(false), sizes: "512x512", type: "image/png", purpose: "any" },
            { src: adresse(true), sizes: "512x512", type: "image/png", purpose: "maskable" },
          ];
        }
        sert();
      });
    }).on("error", () => sert());   // sans réseau, le nom du produit fera l'essai
    return;
  }

  /* L'adresse propre à un salon rend la page du plan, comme chez le relais :
     elle ne nomme aucun fichier. Les pages de `web/` qui commencent pareil —
     `plan-admin`, `plan-smcl` — gardent la leur : le fichier passe d'abord. */
  if (CHEMIN_SALON.test(u) && !fs.existsSync(DIR + u.slice(1) + ".html")) u = "/plan.html";

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
