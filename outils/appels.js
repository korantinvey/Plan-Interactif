/**
 * Cherche les fonctions appelées que rien ne déclare.
 *
 * Le contrôle de syntaxe — `outils/controle.js` — analyse tout le JavaScript
 * servi, redéclarations comprises. Il ne peut pas voir la faute d'à côté : un
 * appel à une fonction qui n'existe nulle part. Analyser ne résout aucun nom,
 * et l'erreur n'apparaît qu'au moment où l'utilisateur clique.
 *
 * Elle est arrivée, et voilà comment. Les modules du plan sont soudés dans un
 * espace de noms unique : `_journee.html` appelle sans façon une fonction
 * définie dans `_admin1.html`. Renommer d'un côté sans l'autre laisse donc un
 * appel orphelin que rien ne signale — ni la construction, ni les essais, qui
 * n'ouvrent jamais la page. C'est ce qui est arrivé à `capaciteFixee`, appelée
 * par la construction des ressources après avoir été renommée dans le volet.
 *
 * La méthode est volontairement grossière, et penche du bon côté. On relève
 * **toute** déclaration du paquet, quelle que soit sa portée, et tout paramètre
 * de fonction ; puis on cherche les appels `nom(` dont le nom ne figure dans
 * aucune de ces listes. Ignorer les portées rend le contrôle indulgent : il
 * laisse passer une fonction déclarée dans un bloc et appelée ailleurs, ce qui
 * est un vrai défaut mais rare, et il ne crie jamais à tort — condition pour
 * qu'on le garde branché.
 *
 *   node outils/appels.js
 */
const fs = require("fs");
const path = require("path");

const RACINE = path.join(__dirname, "..");
const WEB = path.join(RACINE, "web");

/* Ce que le navigateur fournit et que personne ne déclare. La liste n'a pas à
   être exhaustive : tout ce qui manque sort une fois, et s'ajoute ici. */
const FOURNIS = new Set([
  "alert", "confirm", "prompt", "fetch", "setTimeout", "clearTimeout",
  "setInterval", "clearInterval", "requestAnimationFrame",
  "cancelAnimationFrame", "queueMicrotask", "structuredClone", "atob", "btoa",
  "encodeURIComponent", "decodeURIComponent", "encodeURI", "decodeURI",
  "parseInt", "parseFloat", "isNaN", "isFinite", "eval", "matchMedia",
  "getComputedStyle", "scrollTo", "scrollBy", "open", "close", "print",
  "postMessage", "addEventListener", "removeEventListener", "dispatchEvent",
  "importScripts", "import", "require", "reportError",
  /* Les constructeurs et les fonctions du langage, appelés sans `new`. */
  "Object", "Array", "String", "Number", "Boolean", "Symbol", "BigInt",
  "Date", "RegExp", "Error", "TypeError", "RangeError", "Promise", "Map",
  "Set", "WeakMap", "WeakSet", "Proxy", "Reflect", "JSON", "Math", "Intl",
  "ArrayBuffer", "Uint8Array", "Uint8ClampedArray", "Int8Array", "Int32Array",
  "Uint16Array", "Uint32Array", "Float32Array", "Float64Array", "DataView",
  "TextEncoder", "TextDecoder", "URL", "URLSearchParams", "Blob", "File",
  "FileReader", "FormData", "Headers", "Request", "Response", "AbortController",
  "Image", "Audio", "Worker", "Event", "CustomEvent", "MutationObserver",
  "ResizeObserver", "IntersectionObserver", "XMLHttpRequest", "DOMParser",
  "XMLSerializer", "Function", "WebSocket", "Notification", "Option",
  "XPathEvaluator", "OffscreenCanvas", "Path2D", "DOMMatrix", "CSS",
  "ImageData", "createImageBitmap", "WebGLRenderingContext", "Element",
  "HTMLElement", "Node", "NodeFilter", "Range", "Selection", "Text",
  "PerformanceObserver", "IdleDeadline", "requestIdleCallback",
  "BroadcastChannel", "MessageChannel", "ReadableStream", "WritableStream",
  "TransformStream", "CompressionStream", "DecompressionStream", "caches",
  "indexedDB", "crypto", "performance", "console", "navigator", "document",
  "window", "location", "history", "screen", "localStorage", "sessionStorage",
  "self", "globalThis", "clients", "skipWaiting", "registration",
  "getSelection", "getComputedStyle", "scrollX", "scrollY", "focus", "blur",
]);

/* `<script src=…>` est un fichier à part ; `application/json` porte des
   données. Même règle que le contrôle de syntaxe, pour les mêmes raisons. */
const aIgnorer = (attributs) =>
  /\bsrc=/.test(attributs) || /type\s*=\s*["']?application\/json/.test(attributs);

function scriptsDe(html){
  const l = [];
  const re = /<script([^>]*)>([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(html))){
    if (aIgnorer(m[1] || "") || !m[2].trim()) continue;
    l.push(m[2]);
  }
  return l;
}

/* Les commentaires, les chaînes et les expressions régulières portent des
   parenthèses et des mots qui ressemblent à des appels — « voir `poseTout()` »
   en tête d'une fonction en est un, `/iP(hone|od)/` en est un autre. On les
   blanchit avant de relever quoi que ce soit, en gardant les sauts de ligne
   pour que les numéros restent justes.

   Les expressions régulières ne sont pas un raffinement : une seule d'entre
   elles contenant une apostrophe — et il y en a — ouvrait une chaîne qui
   avalait tout le reste du fichier, si bien que la moitié des déclarations
   disparaissaient et que le contrôle dénonçait des fonctions parfaitement
   déclarées. Les distinguer d'une division se fait au jeton précédent : après
   une valeur, `/` divise ; après un opérateur ou une parenthèse ouvrante, il
   ouvre une expression. */
function sansTexte(js){
  let out = "", i = 0, n = js.length;
  const vide = (s) => s.replace(/[^\n]/g, " ");
  /* Le dernier caractère significatif écrit, pour trancher `/`.

     On garde une queue courte plutôt que de relire `out` : le relire coûtait
     le carré de la taille du fichier, et le contrôle ne finissait plus sur un
     paquet de deux mégaoctets. */
  let queue = "";
  const pousse = (t) => {
    const u = t.replace(/\s+$/, "");
    if (u) queue = (queue + u).slice(-32);
  };
  const APRES = ["return", "typeof", "case", "in", "of", "new", "delete",
                 "void", "instanceof", "do", "else", "yield", "await"];
  const finDeValeur = () => {
    const c = queue[queue.length - 1];
    if (!c) return false;
    if (")]}".includes(c)) return true;
    if (/[\w$]/.test(c))
      return !APRES.includes((queue.match(/[\w$]+$/) || [""])[0]);
    return false;
  };
  while (i < n){
    const c = js[i], d = js[i + 1];
    if (c === "/" && d !== "/" && d !== "*" && !finDeValeur()){
      let j = i + 1, crochet = false;
      while (j < n){
        const x = js[j];
        if (x === "\\"){ j += 2; continue; }
        if (x === "[") crochet = true;
        else if (x === "]") crochet = false;
        else if (x === "/" && !crochet) break;
        else if (x === "\n") break;   // pas une expression régulière après tout
        j++;
      }
      if (j < n && js[j] === "/"){
        out += vide(js.slice(i, j + 1));
        queue = (queue + "/x/").slice(-32);   // une expression est une valeur
        i = j + 1;
        while (i < n && /[gimsuyvd]/.test(js[i])){ out += " "; i++; }
        continue;
      }
    }
    if (c === "/" && d === "/"){
      const f = js.indexOf("\n", i); const j = f < 0 ? n : f;
      out += vide(js.slice(i, j)); i = j; continue;
    }
    if (c === "/" && d === "*"){
      const f = js.indexOf("*/", i + 2); const j = f < 0 ? n : f + 2;
      out += vide(js.slice(i, j)); i = j; continue;
    }
    if (c === '"' || c === "'" || c === "`"){
      let j = i + 1;
      while (j < n && js[j] !== c){ if (js[j] === "\\") j++; j++; }
      out += c + vide(js.slice(i + 1, j)) + (js[j] || "");
      queue = (queue + "'x'").slice(-32); i = j + 1; continue;
    }
    out += c; pousse(c); i++;
  }
  return out;
}

/** Tout ce que le paquet déclare, portées confondues. */
function declares(js){
  const d = new Set();
  const ajoute = (re, g) => { let m; while ((m = re.exec(js))) d.add(m[g || 1]); };
  ajoute(/\bfunction\s*\*?\s*([A-Za-z_$][\w$]*)/g);
  ajoute(/\bclass\s+([A-Za-z_$][\w$]*)/g);
  ajoute(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g);
  /* Les déclarations groupées : `const a = 1, b = 2;` */
  ajoute(/,\s*([A-Za-z_$][\w$]*)\s*=/g);
  /* La déstructuration, sous ses deux formes. */
  let m;
  const re = /\b(?:const|let|var)\s*[{[]([^}\]]*)[}\]]/g;
  while ((m = re.exec(js)))
    m[1].split(",").forEach(x => {
      const n2 = x.split(":").pop().split("=")[0].replace(/\./g, "").trim();
      if (/^[A-Za-z_$][\w$]*$/.test(n2)) d.add(n2);
    });
  /* Les paramètres : tout ce qui tient entre les parenthèses d'une fonction,
     d'une méthode ou d'une flèche, plus la flèche à paramètre nu. */
  const rp = /(?:function\s*\*?\s*[A-Za-z_$][\w$]*\s*|=>\s*|\)\s*=>|\b[A-Za-z_$][\w$]*\s*)\(([^()]*)\)\s*(?:=>|\{)/g;
  while ((m = rp.exec(js)))
    m[1].split(",").forEach(x => {
      const n2 = x.replace(/\.\.\./, "").split("=")[0].trim();
      if (/^[A-Za-z_$][\w$]*$/.test(n2)) d.add(n2);
    });
  /* `((tenu, rompu) => …)` : la flèche suffit, sans rien exiger devant. */
  const rf = /\(([^()]*)\)\s*=>/g;
  while ((m = rf.exec(js)))
    m[1].split(",").forEach(x => {
      const n2 = x.replace(/\.\.\./, "").split("=")[0].trim();
      if (/^[A-Za-z_$][\w$]*$/.test(n2)) d.add(n2);
    });
  ajoute(/\b([A-Za-z_$][\w$]*)\s*=>/g);
  ajoute(/\bcatch\s*\(\s*([A-Za-z_$][\w$]*)/g);
  /* Ce qu'un module pose sur l'objet global : `window.traduit = String;` est
     une déclaration pour tout le reste de la page, et la seule façon qu'a un
     fichier servi à part d'en offrir une. */
  ajoute(/\b(?:window|globalThis|self)\.([A-Za-z_$][\w$]*)\s*=[^=]/g);
  ajoute(/\bfor\s*\(\s*(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g);
  /* Les propriétés abrégées d'un objet littéral sont des méthodes, pas des
     appels libres : `{ nom(){ … } }`. */
  ajoute(/^\s*([A-Za-z_$][\w$]*)\s*\([^()]*\)\s*\{/gm);
  return d;
}

/** Les appels `nom(` dont le nom n'est pas précédé d'un point. */
function appels(js){
  const l = new Map();
  /* `get code(){…}` : le nom suit un mot-clé, ce n'est pas un appel. Le mot
     d'avant se lit dans le groupe capturé, qui le contient. */
  const re = /(^|[^.\w$])(?:(get|set|async|static|function|class|new)\s+)?([A-Za-z_$][\w$]*)\s*\(/g;
  let m;
  /* `get x(){}`, `set x(v){}`, `async (a) => …`, `static m(){}` : le mot
     qu'on lit devant la parenthèse est une syntaxe, pas un appelé. */
  const MOTS = new Set(["if", "for", "while", "switch", "catch", "return",
    "typeof", "function", "new", "delete", "void", "in", "of", "do", "else",
    "case", "yield", "await", "throw", "instanceof", "get", "set", "async",
    "static", "constructor", "super", "this", "try", "finally", "with"]);
  while ((m = re.exec(js))){
    if (m[2]) continue;               // précédé d'un mot-clé : une définition
    if (MOTS.has(m[3])) continue;
    const ligne = js.slice(0, m.index).split("\n").length;
    if (!l.has(m[3])) l.set(m[3], ligne);
  }
  return l;
}

if (!fs.existsSync(WEB)){
  console.error("`web/` est absent : lancez d'abord `npm run construire`.");
  process.exit(1);
}

/* Ce qu'un `<script src=…>` de la page déclare compte comme déclaré : la
   configuration et le moteur de langue posent des noms que les pages
   appellent, et les ignorer ferait crier le contrôle sur du code juste. */
const APPORTES = new Set();
for (const f of fs.readdirSync(WEB).filter(x => x.endsWith(".js")))
  declares(sansTexte(fs.readFileSync(path.join(WEB, f), "utf8")))
    .forEach(n => APPORTES.add(n));

let fautes = 0, pages = 0;
for (const f of fs.readdirSync(WEB).filter(x => /\.(html|js)$/.test(x)).sort()){
  const brut = fs.readFileSync(path.join(WEB, f), "utf8");
  const morceaux = f.endsWith(".js") ? [brut] : scriptsDe(brut);
  if (!morceaux.length) continue;
  pages++;
  /* Les scripts d'une même page partagent un espace de noms : on les juge
     ensemble, sans quoi tout appel d'un bloc à l'autre serait dénoncé. */
  const js = sansTexte(morceaux.join("\n;\n"));
  const connus = declares(js);
  APPORTES.forEach(n => connus.add(n));
  /* Un appel que le code protège lui-même — `typeof nom === "function" &&
     nom()` — est voulu : c'est ainsi qu'un module s'adresse à un autre qui
     peut avoir été retiré de cette page-là par la construction. Le dénoncer
     reviendrait à demander qu'on retire la protection. */
  const optionnels = new Set();
  let mo; const ro = /\btypeof\s+([A-Za-z_$][\w$]*)\s*[=!]==?/g;
  while ((mo = ro.exec(js))) optionnels.add(mo[1]);

  const manquants = [];
  for (const [nom, ligne] of appels(js))
    if (!connus.has(nom) && !FOURNIS.has(nom) && !optionnels.has(nom))
      manquants.push(nom + " (l." + ligne + ")");
  if (manquants.length){
    fautes += manquants.length;
    console.error("\n" + f + " — " + manquants.length +
      " appel(s) que rien ne déclare :");
    manquants.forEach(x => console.error("  " + x));
  }
}

if (fautes){
  console.error("\nUn appel sans déclaration part en erreur au premier clic.\n" +
    "Corrigez-le, ou — si c'est le contrôle qui se trompe — ajoutez le nom à\n" +
    "`FOURNIS` dans `outils/appels.js`.\n");
  process.exit(1);
}
console.log("Appels : " + pages + " paquet(s) contrôlé(s), tous les noms se résolvent.");
