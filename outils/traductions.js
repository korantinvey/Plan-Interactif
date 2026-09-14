/**
 * La version anglaise des pages : ce que le dictionnaire doit couvrir, et ce
 * que chaque page en emporte.
 *
 * Les pages restent écrites en français ; `outils/gabarit/_langue.js` les
 * traduit dans le navigateur, phrase par phrase, d'après le dictionnaire de
 * `outils/anglais/`. Deux choses peuvent donc mal tourner sans que rien ne
 * casse : une phrase ajoutée sans sa traduction, qui reste en français au
 * milieu d'une page anglaise, et un dictionnaire qui grossit toutes les pages
 * de phrases qu'elles n'affichent pas. Ce script tient les deux.
 *
 *   node outils/traductions.js               contrôle : sort en erreur s'il manque une traduction
 *   node outils/traductions.js --inventaire  relevé complet des chaînes, en JSON
 *   node outils/traductions.js --orphelines  entrées du dictionnaire que plus rien n'affiche
 *
 * **Ce qui est relevé.** Les textes du balisage et les attributs qu'on lit
 * (`title`, `placeholder`, `aria-label`…), et les chaînes du JavaScript — sauf
 * celles dont l'usage dit qu'elles ne s'affichent pas : un sélecteur, une clé
 * de stockage, un nom de classe, un terme de comparaison. Le relevé est une
 * heuristique : il ne sait pas suivre une chaîne de variable en variable. Il
 * lit donc large, et ce qu'il prend à tort pour du texte visible se déclare
 * dans `outils/anglais/invisibles.js`.
 *
 * **Ce qui est couvert.** Une chaîne entière doit être une clé, ou le morceau
 * fixe d'un modèle (« {n} exposants retenus » couvre « exposants retenus »).
 * Un morceau de chaîne coupée par une concaténation doit se lire dans une clé.
 */
const fs = require("fs");
const path = require("path");

const D = __dirname;
const RACINE = path.join(D, "..");
const GABARIT = path.join(D, "gabarit");
const ANGLAIS = path.join(D, "anglais");

/* ------------------------------------------------------------------
   Découpe du JavaScript en jetons

   Il ne s'agit pas d'analyser le programme, seulement de savoir ce qui est
   une chaîne, ce qui est un commentaire, et ce qui entoure chaque chaîne :
   l'appel dont elle est l'argument, la comparaison dont elle est un terme,
   la concaténation dont elle est un morceau.
   ------------------------------------------------------------------ */
const MOTS_AVANT_REGEX = new Set(["return", "typeof", "case", "in", "of", "new", "delete",
  "void", "throw", "instanceof", "yield", "await", "else", "do"]);
const OPERATEURS = ["===", "!==", "**=", "...", "<<=", ">>=", ">>>", "&&=", "||=", "??=",
  "=>", "==", "!=", "<=", ">=", "&&", "||", "??", "?.", "++", "--", "+=", "-=", "*=", "/=",
  "%=", "&=", "|=", "^=", "<<", ">>"];

function decoupeJs(code, depart = 0, arretScript = false) {
  const jetons = [];
  let i = depart;
  const n = code.length;
  const pile = [];
  const gabarits = [];
  const precedent = () => jetons[jetons.length - 1];

  const ajoute = (j) => {
    j.cadre = pile.length ? pile[pile.length - 1] : null;
    j.rang = j.cadre ? j.cadre.virgules : 0;
    jetons.push(j);
    return j;
  };

  function regexPermise() {
    const p = precedent();
    if (!p) return true;
    if (p.type === "nom") return MOTS_AVANT_REGEX.has(p.valeur);
    if (p.type === "nombre" || p.type === "chaine" || p.type === "gabarit" || p.type === "regex") return false;
    if (p.type === "ponct") return !(p.valeur === ")" || p.valeur === "]" || p.valeur === "}");
    return true;
  }

  function lisGabarit(k) {
    let s = "";
    const debut = k;
    while (k < n) {
      if (code[k] === "\\") { s += echappe(code, k); k += longueurEchappe(code, k); continue; }
      if (code[k] === "`") { ajoute({ type: "gabarit", valeur: s, debut, fin: k + 1 }); return k + 1; }
      if (code[k] === "$" && code[k + 1] === "{") {
        ajoute({ type: "gabarit", valeur: s, debut, fin: k, ouvert: true });
        pile.push({ ouvre: "${", appel: null, virgules: 0 });
        gabarits.push(pile.length);
        return k + 2;
      }
      s += code[k++];
    }
    return n;
  }

  function appelAvant(idx) {
    const noms = [];
    let k = idx - 1;
    while (k >= 0 && jetons[k].type === "nom") {
      noms.unshift(jetons[k].valeur);
      if (k >= 1 && jetons[k - 1].type === "ponct" && (jetons[k - 1].valeur === "." || jetons[k - 1].valeur === "?.")) k -= 2;
      else break;
    }
    if (noms.length === 1 && k >= 1 && jetons[k - 1] && jetons[k - 1].type === "nom" && jetons[k - 1].valeur === "new") noms.unshift("new");
    return noms.length ? noms.join(".") : null;
  }

  while (i < n) {
    const c = code[i];
    if (arretScript && c === "<" && code.startsWith("</script", i)) return { jetons, fin: i };

    if (c === "}" && gabarits.length && gabarits[gabarits.length - 1] === pile.length) {
      gabarits.pop();
      pile.pop();
      i = lisGabarit(i + 1);
      continue;
    }
    if (c === " " || c === "\n" || c === "\t" || c === "\r") { i++; continue; }
    if (c === "/" && code[i + 1] === "/") { const k = code.indexOf("\n", i); i = k < 0 ? n : k; continue; }
    if (c === "/" && code[i + 1] === "*") { const k = code.indexOf("*/", i + 2); i = k < 0 ? n : k + 2; continue; }

    if (c === '"' || c === "'") {
      let s = "", k = i + 1;
      while (k < n && code[k] !== c && code[k] !== "\n") {
        if (code[k] === "\\") { s += echappe(code, k); k += longueurEchappe(code, k); continue; }
        s += code[k++];
      }
      ajoute({ type: "chaine", valeur: s, debut: i, fin: k + 1 });
      i = k + 1;
      continue;
    }
    if (c === "`") { i = lisGabarit(i + 1); continue; }

    if (/[A-Za-z_$À-￿]/.test(c)) {
      let k = i + 1;
      while (k < n && /[\w$À-￿]/.test(code[k])) k++;
      ajoute({ type: "nom", valeur: code.slice(i, k), debut: i, fin: k });
      i = k;
      continue;
    }
    if (/[0-9]/.test(c) || (c === "." && /[0-9]/.test(code[i + 1] || ""))) {
      const m = /^(0[xXoObB][0-9a-fA-F_]+|\d[\d_]*\.?\d*(?:[eE][+-]?\d+)?|\.\d+(?:[eE][+-]?\d+)?)n?/.exec(code.slice(i, i + 40));
      const k = i + (m ? m[0].length : 1);
      ajoute({ type: "nombre", valeur: code.slice(i, k), debut: i, fin: k });
      i = k;
      continue;
    }
    if (c === "/" && regexPermise()) {
      let k = i + 1, classe = false;
      while (k < n) {
        const d = code[k];
        if (d === "\\") { k += 2; continue; }
        if (d === "\n") break;
        if (classe) { if (d === "]") classe = false; }
        else if (d === "[") classe = true;
        else if (d === "/") break;
        k++;
      }
      k++;
      while (k < n && /[a-z]/.test(code[k])) k++;
      ajoute({ type: "regex", valeur: code.slice(i, k), debut: i, fin: k });
      i = k;
      continue;
    }

    const op = OPERATEURS.find((o) => code.startsWith(o, i));
    if (op) { ajoute({ type: "ponct", valeur: op, debut: i, fin: i + op.length }); i += op.length; continue; }

    ajoute({ type: "ponct", valeur: c, debut: i, fin: i + 1 });
    if (c === "(" || c === "[" || c === "{") pile.push({ ouvre: c, appel: c === "(" ? appelAvant(jetons.length - 1) : null, virgules: 0 });
    else if (c === ")" || c === "]" || c === "}") pile.pop();
    else if (c === "," && pile.length) pile[pile.length - 1].virgules++;
    i++;
  }
  return { jetons, fin: n };
}

function longueurEchappe(code, k) {
  const d = code[k + 1];
  if (d === "u") return code[k + 2] === "{" ? code.indexOf("}", k) - k + 1 : 6;
  if (d === "x") return 4;
  if (d === "\r" && code[k + 2] === "\n") return 3;
  return 2;
}
function echappe(code, k) {
  const d = code[k + 1];
  if (d === "n") return "\n";
  if (d === "t") return "\t";
  if (d === "u") {
    const hex = code[k + 2] === "{" ? code.slice(k + 3, code.indexOf("}", k)) : code.slice(k + 2, k + 6);
    return String.fromCodePoint(parseInt(hex, 16));
  }
  if (d === "x") return String.fromCharCode(parseInt(code.slice(k + 2, k + 4), 16));
  if (d === "\n" || d === "\r") return "";
  return d;
}

/* ------------------------------------------------------------------
   Le balisage : le texte entre les balises, et les attributs qu'on lit
   ------------------------------------------------------------------ */
const ATTRIBUTS_VISIBLES = ["title", "placeholder", "aria-label", "alt", "label", "data-vide", "value"];
const ENTITES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: "\u00A0", times: "×",
  middot: "·", hellip: "…", laquo: "«", raquo: "»", rarr: "→", larr: "←", mdash: "—", ndash: "–",
  thinsp: "\u2009", ensp: "\u2002", emsp: "\u2003", copy: "©", deg: "°" };
const decode = (s) => String(s).replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) =>
  e[0] === "#" ? String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10))
    : (ENTITES[e.toLowerCase()] ?? m));
const normalise = (s) => decode(s).replace(/[\s\u00A0\u202F\u2009]+/g, " ").trim();

/** Les attributs lisibles d'un morceau de balise, valeur ouverte comprise. */
function attributsDe(bout, sorties, pos) {
  const ra = /([\w:-]+)\s*=\s*(?:"([^"]*)("|$)|'([^']*)('|$))/g;
  let a;
  while ((a = ra.exec(bout))) {
    const nom = a[1].toLowerCase();
    if (!ATTRIBUTS_VISIBLES.includes(nom)) continue;
    if (nom === "value" && !/\btype\s*=\s*["']?(button|submit|reset)/i.test(bout)) continue;
    sorties.push({ genre: "attribut", attribut: nom, valeur: a[2] ?? a[4] ?? "", pos });
  }
}

/**
 * Le texte d'un fragment de balisage. Une chaîne JavaScript coupe souvent une
 * balise en deux — `'" aria-label="' + nom + '">'` — : ce qui précède le
 * premier `>` sans `<` avant lui est la fin d'une balise, et ce qui suit le
 * dernier `<` sans `>` après lui en est le début.
 */
function texteDuBalisage(html) {
  const sorties = [];
  let debut = 0;
  const premierFerme = html.indexOf(">"), premierOuvre = html.indexOf("<");
  if (premierFerme >= 0 && (premierOuvre < 0 || premierFerme < premierOuvre) &&
      /=\s*["']|^\s*["']/.test(html.slice(0, premierFerme))) {
    attributsDe(html.slice(0, premierFerme), sorties, 0);
    debut = premierFerme + 1;
  } else if (premierFerme < 0 && premierOuvre < 0 && /^\s*["']?\s*[\w:-]+\s*=\s*["']|["']\s*$/.test(html) &&
             /[\w:-]+\s*=\s*["']/.test(html)) {
    attributsDe(html, sorties, 0);
    return sorties;
  }
  // une balise ouverte en fin de chaîne : `'<text class="' + c + '">'`
  let finTexte = html.length;
  const dernierOuvre = html.lastIndexOf("<");
  if (dernierOuvre >= debut && html.indexOf(">", dernierOuvre) < 0 && /^<\/?[a-zA-Z]/.test(html.slice(dernierOuvre))) {
    attributsDe(html.slice(dernierOuvre), sorties, dernierOuvre);
    finTexte = dernierOuvre;
  }
  const corps = html.slice(0, finTexte);
  const re = /<!--[\s\S]*?-->|<\/?([a-zA-Z][\w-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
  re.lastIndex = debut;
  let dernier = debut, m;
  while ((m = re.exec(corps))) {
    if (m.index > dernier) sorties.push({ genre: "texte", valeur: corps.slice(dernier, m.index), pos: dernier });
    if (m[1]) attributsDe(m[2] || "", sorties, m.index);
    dernier = re.lastIndex;
  }
  if (dernier < corps.length) sorties.push({ genre: "texte", valeur: corps.slice(dernier), pos: dernier });
  return sorties;
}

/* ------------------------------------------------------------------
   Est-ce une phrase qu'on lit ?
   ------------------------------------------------------------------ */
const ACCENTS = /[àâäçéèêëîïôöùûüÿœæ]/i;

function paraitVisible(t) {
  if (!/[A-Za-zÀ-ÿ]{2}/.test(t)) return false;
  if (/^(https?:|mailto:|tel:|data:|blob:|javascript:|\/\/|\.\/|\.\.\/|#[\w-]|\.[a-z_])/i.test(t)) return false;
  if (/^[?&][\w-]+=/.test(t)) return false;                                     // paramètre d'adresse
  if (/^[\w/-]+\?[\w-]+=/.test(t) || /\$\d/.test(t) || /^\|\w+$/.test(t)) return false; // requête, remplacement, clé
  if (/^[\w.-]*\/[\w./-]*$/.test(t)) return false;                               // chemin
  if (/^[;\s]*[a-z-]+:\s*$/.test(t)) return false;                               // propriété CSS
  if (/^[\w.\[\]-]+\.(html?|js|mjs|ts|css|json|png|svg|jpe?g|webp|gif|xlsx|xml|rels|csv|webmanifest|sql)$/i.test(t)) return false;
  if (/^<\?|^=\w+$/.test(t)) return false;                                        // déclaration XML, valeur réservée
  if (/^[;\s]*--[\w-]+:?$|^_[\w-]*:?$|^[a-z][\w-]*:$/.test(t)) return false;  // variable CSS, clé de réglage, préfixe
  if (/^[a-z]+\/[\w.+*-]*$/.test(t)) return false;                              // type MIME
  if (/^[a-z][\w-]*\(/.test(t) && !/\s[a-zà-ÿ]{3,}\s/.test(t)) return false;  // fonction CSS
  if (/\b(sans-serif|monospace|system-ui|serif)\b/.test(t) && /["',]/.test(t)) return false; // pile de polices
  if (/^\d+-digit$|^(numeric|long|short|narrow)$/.test(t)) return false;
  if (!/[a-zà-ÿ]{3,}/i.test(t.replace(/\d+(\.\d+)?/g, "")) || (/^[\d\s.,MLHVCSQTAZmlhvcsqtaz-]+$/.test(t))) return false; // tracé
  if (/(^|[\s;])[-a-z]+\s*:\s*[^;]*;|var\(--|rgba?\(|\b\d+(px|em|rem|vh|vw)\b/.test(t) && !ACCENTS.test(t)) return false; // CSS
  if (/[{};]\s*$|^\s*[{}]|=>|===|!==|\bfunction\b|\breturn\b/.test(t)) return false;
  if (/^[A-Z0-9_]+$/.test(t)) return false;                                     // constante, sigle
  if (!/\s/.test(t) && !ACCENTS.test(t) && /^[.#]?[a-z][\w-]*([.#:\[\]="'][\w-]*)*$/.test(t)) return false; // identifiant, classe, sélecteur
  if (/^[\w-]+(\s[\w-]+)+$/.test(t) && t.split(" ").every((w) => /^[a-z]+(-[a-z0-9]+)+$|^[a-z]+[A-Z]\w*$|^[a-z]{1,3}\d*$/.test(w))) return false; // liste de classes
  if (/^\[?[\w-]+(=|\^=|\*=)["']?/.test(t) && !/\s[a-zà-ÿ]{2,}\s/.test(t)) return false; // sélecteur d'attribut
  return true;
}

/* ------------------------------------------------------------------
   Contexte d'une chaîne JavaScript : montrée, ou tenue par le code ?
   ------------------------------------------------------------------ */
const APPELS_MUETS = new RegExp("^(" + [
  "console\\.\\w+", "\\$", "document\\.getElementById", "getElementById",
  "(\\w+\\.)*querySelector(All)?", "(\\w+\\.)*closest", "(\\w+\\.)*matches",
  "(\\w+\\.)*(add|remove)EventListener", "(\\w+\\.)*classList\\.(add|remove|toggle|contains|replace)",
  "(\\w+\\.)*(get|remove|has|toggle)Attribute(NS)?", "(\\w+\\.)*setAttributeNS",
  "(\\w+\\.)*(local|session)Storage\\.\\w+", "(\\w+\\.)*create(Element|ElementNS|TextNode)?",
  "fetch", "require", "import", "(\\w+\\.)*(startsWith|endsWith|includes|indexOf|lastIndexOf|split|join|padStart|padEnd|test|match|matchAll|search)",
  "(new\\.)?RegExp", "CSS\\.escape", "(\\w+\\.)*(getPropertyValue|setProperty|removeProperty)",
  "(\\w+\\.)*matchMedia", "(new\\.)?Intl\\.\\w+", "(\\w+\\.)*toLocale\\w*", "(\\w+\\.)*localeCompare",
  "(\\w+\\.)*(get|has|delete)", "(\\w+\\.)*postMessage", "(\\w+\\.)*dispatchEvent",
  "(new\\.)?(Custom)?Event", "(\\w+\\.)*(create|revoke)ObjectURL", "(\\w+\\.)*(push|replace)State",
  "Number", "parseInt", "parseFloat", "atob", "btoa", "(en|de)codeURI(Component)?",
  "(\\w+\\.)*(getItem|setItem|removeItem|hasOwnProperty)", "Object\\.\\w+", "(\\w+\\.)*createTreeWalker",
  "(\\w+\\.)*execCommand", "(\\w+\\.)*queryCommand\\w*", "(new\\.)?(Blob|File|URL|URLSearchParams|Date|TextEncoder|DOMParser|Worker|Image)",
  "(\\w+\\.)*(parseFromString|decode|encode)", "(\\w+\\.)*animate", "(\\w+\\.)*scrollIntoView",
  "(\\w+\\.)*(append|set|delete|getAll)Param\\w*", "(\\w+\\.)*searchParams\\.\\w+", "(\\w+\\.)*headers\\.\\w+",
  "(\\w+\\.)*register", "(\\w+\\.)*caches?\\.\\w+", "(\\w+\\.)*json", "(\\w+\\.)*insertAdjacentElement",
  "(\\w+\\.)*getContext", "(\\w+\\.)*toDataURL", "(\\w+\\.)*toBlob", "(\\w+\\.)*setPointerCapture",
  "(\\w+\\.)*rpc", "(\\w+\\.)*from", "(\\w+\\.)*select", "(\\w+\\.)*eq", "(\\w+\\.)*order", "(\\w+\\.)*functions\\.invoke",
  "(\\w+\\.)*env\\.get", "Deno\\.env\\.get", "(\\w+\\.)*sort",
].join("|") + ")$");

const PROPRIETES_MUETTES = new Set(["id", "className", "type", "href", "src", "name", "rel", "target",
  "cssText", "display", "cursor", "value", "accept", "download", "role", "lang", "dir", "method",
  "action", "autocomplete", "inputMode", "pattern", "step", "min", "max", "key", "code", "d",
  "transform", "fill", "stroke", "width", "height", "left", "top", "right", "bottom", "background",
  "color", "position", "visibility", "opacity", "zIndex", "media", "charset", "crossOrigin",
  "referrerPolicy", "loading", "decoding", "tabIndex", "htmlFor", "hash", "search", "pathname",
  "protocol", "host", "hostname", "origin", "port", "mode", "credentials", "cache", "redirect",
  "responseType", "overflow", "pointerEvents", "userSelect", "touchAction", "textAlign",
  "fontFamily", "fontWeight", "fontSize", "font", "lineHeight", "whiteSpace", "boxShadow", "outline",
  "border", "borderColor", "margin", "padding", "gap", "flex", "maxWidth", "minWidth",
  "maxHeight", "minHeight", "transition", "animation", "filter", "strokeDasharray", "effectAllowed",
  "dropEffect", "kind", "genre", "sorte", "o", "cle", "k", "slug", "mime", "format", "fuseau", "etat"]);

function contexteDe(jetons, k) {
  const j = jetons[k];
  const av = jetons[k - 1], av2 = jetons[k - 2], ap = jetons[k + 1];
  const est = (t, v) => t && t.type === "ponct" && t.valeur === v;
  const concat = est(av, "+") || est(ap, "+") || j.type === "gabarit" &&
    (j.ouvert || (av && av.type === "ponct" && av.valeur === "}" && av.cadre && av.cadre.ouvre === "${")) ||
    groupeConcatene(jetons, k);

  if (j.cadre && j.cadre.ouvre === "(" && j.cadre.appel) {
    const a = j.cadre.appel;
    if (APPELS_MUETS.test(a)) return { muet: true };
    if (/(^|\.)setAttribute$/.test(a)) {
      if (j.rang === 0) return { muet: true };
      const nomAttr = premiereChaineDuCadre(jetons, k);
      if (nomAttr && !ATTRIBUTS_VISIBLES.includes(nomAttr)) return { muet: true };
    }
  }
  if ((av && av.type === "ponct" && /^(===|!==|==|!=)$/.test(av.valeur)) ||
      (ap && ap.type === "ponct" && /^(===|!==|==|!=)$/.test(ap.valeur))) {
    return { muet: true, comparaison: true };
  }
  if (av && av.type === "nom" && av.valeur === "case") return { muet: true, comparaison: true };
  if (est(ap, ":") && (est(av, "{") || est(av, ",")) && j.cadre && j.cadre.ouvre === "{") return { muet: true };
  if (est(av, "[") && est(ap, "]") && av2 && (av2.type === "nom" || est(av2, ")") || est(av2, "]"))) return { muet: true };
  if (est(av, "=") && av2 && av2.type === "nom" && PROPRIETES_MUETTES.has(av2.valeur)) return { muet: true };
  if (est(av, "=") && jetons[k - 4] && /^(style|dataset)$/.test(jetons[k - 4].valeur)) return { muet: true };
  if (ap && ap.type === "nom" && ap.valeur === "in") return { muet: true };
  if (est(av, "(") && av2 && av2.type === "nom" && av2.valeur === "import") return { muet: true };
  return { muet: false, concat };
}

/**
 * Une branche de `(cond ? "a" : "b") + suite` est un morceau de phrase, même
 * sans `+` à côté d'elle : c'est la parenthèse qui l'entoure qui se concatène.
 */
function groupeConcatene(jetons, k) {
  const v = (m) => jetons[m] && jetons[m].type === "ponct" ? jetons[m].valeur : null;
  let prof = 0;
  for (let m = k + 1; m < jetons.length && m < k + 300; m++) {
    const c = v(m);
    if (c === "(" || c === "[" || c === "{") prof++;
    else if (c === ")" || c === "]" || c === "}") {
      if (prof === 0) {
        if (c === ")" && v(m + 1) === "+") return true;
        break;
      }
      prof--;
    } else if (prof === 0 && (c === "," || c === ";")) break;
  }
  prof = 0;
  for (let m = k - 1; m >= 0 && m > k - 300; m--) {
    const c = v(m);
    if (c === ")" || c === "]" || c === "}") prof++;
    else if (c === "(" || c === "[" || c === "{") {
      if (prof === 0) return c === "(" && v(m - 1) === "+";
      prof--;
    } else if (prof === 0 && (c === "," || c === ";")) return false;
  }
  return false;
}

function premiereChaineDuCadre(jetons, k) {
  const cadre = jetons[k].cadre;
  for (let m = k - 1; m >= 0; m--) {
    if (jetons[m].cadre === cadre && jetons[m].type === "chaine" && jetons[m].rang === 0) return jetons[m].valeur.toLowerCase();
    if (jetons[m].cadre !== cadre && jetons[m].type === "ponct" && jetons[m].valeur === "(") break;
  }
  return null;
}

/* ------------------------------------------------------------------
   Relever un texte : un module du gabarit, une page construite
   ------------------------------------------------------------------ */
const numeroDeLigne = (texte) => {
  const debuts = [0];
  for (let i = 0; i < texte.length; i++) if (texte[i] === "\n") debuts.push(i + 1);
  return (pos) => {
    let a = 0, b = debuts.length - 1;
    while (a < b) { const m = (a + b + 1) >> 1; if (debuts[m] <= pos) a = m; else b = m - 1; }
    return a + 1;
  };
};

/**
 * Parcourt un texte — balisage, scripts, styles — et rend à `rappel` chaque
 * morceau lisible : `{ valeur, pos, genre, concat, comparaison }`. `debutJs`
 * dit si le texte commence dans un script (un module de pur JavaScript).
 */
function parcours(texte, debutJs, rappel, toutes = false) {
  let i = 0, enJs = debutJs;
  while (i < texte.length) {
    if (enJs) {
      const { jetons, fin } = decoupeJs(texte, i, true);
      jetons.forEach((j, k) => {
        if (j.type !== "chaine" && j.type !== "gabarit") return;
        if (!toutes && !/[A-Za-zÀ-ÿ]{2}/.test(j.valeur)) return;
        const ctx = contexteDe(jetons, k);
        if (/<[a-zA-Z\/!]|=\s*"|"\s*>|^\s*["']\s*$/.test(j.valeur)) {
          for (const p of texteDuBalisage(j.valeur)) {
            rappel({ valeur: p.valeur, pos: j.debut, genre: p.genre === "texte" ? "js-html" : "js-attr",
              concat: true, muet: ctx.muet, comparaison: ctx.comparaison });
          }
        } else {
          rappel({ valeur: j.valeur, pos: j.debut, genre: "js", concat: ctx.concat, muet: ctx.muet, comparaison: ctx.comparaison });
        }
      });
      i = fin;
      if (i < texte.length) { i = texte.indexOf(">", i) + 1; enJs = false; }
    } else {
      const re = /<(script|style)\b([^>]*)>/gi;
      re.lastIndex = i;
      const m = re.exec(texte);
      const fin = m ? m.index : texte.length;
      for (const p of texteDuBalisage(texte.slice(i, fin))) {
        rappel({ valeur: p.valeur, pos: i + p.pos, genre: p.genre === "texte" ? "html" : "attr", concat: false });
      }
      if (!m) break;
      const apres = m.index + m[0].length;
      if (m[1].toLowerCase() === "style" || /\bsrc=|application\/json/.test(m[2])) {
        const f = texte.indexOf("</" + m[1].toLowerCase(), apres);
        i = f < 0 ? texte.length : texte.indexOf(">", f) + 1;
      } else {
        i = apres;
        enJs = true;
      }
    }
  }
}

const commenceEnJs = (fichier, texte) =>
  /\.(js|ts|mjs)$/.test(fichier) || /^\s*(\/\*|\/\/|const |let |var |function |import |export |"use)/.test(texte);

/** Les chaînes visibles d'un fichier source, avec leur ligne. */
function releveFichier(fichier) {
  const texte = fs.readFileSync(fichier, "utf8");
  const ligne = numeroDeLigne(texte);
  const trouves = [];
  parcours(texte, commenceEnJs(fichier, texte), (p) => {
    if (p.muet && !p.comparaison) return;
    for (const morceau of String(p.valeur).split(/\n/)) {
      const t = normalise(morceau);
      if (!t || !paraitVisible(t)) continue;
      // un terme de comparaison n'est retenu que s'il ressemble à une phrase affichée
      if (p.comparaison && !/\s/.test(t) && !ACCENTS.test(t)) continue;
      trouves.push({ texte: t, ligne: ligne(p.pos), genre: p.genre, concat: p.concat || /\n/.test(p.valeur), comparaison: p.comparaison || false });
    }
  });
  return trouves;
}

/* ------------------------------------------------------------------
   Le dictionnaire
   ------------------------------------------------------------------ */
/* Ces fichiers ne correspondent à aucun module : ce qu'ils traduisent arrive
   par les données ou par le serveur, et aucune page ne l'écrit dans son code.
   Toute page qui interroge le serveur les emporte donc. */
const TOUJOURS = new Set(["donnees.js", "serveur.js"]);

function chargeDictionnaire() {
  const entrees = new Map();
  const conflits = [];
  if (!fs.existsSync(ANGLAIS)) return { entrees, conflits, invisibles: new Set() };
  for (const f of fs.readdirSync(ANGLAIS).filter((f) => f.endsWith(".js") && f !== "invisibles.js").sort()) {
    const chemin = path.join(ANGLAIS, f);
    delete require.cache[require.resolve(chemin)];
    const table = require(chemin);
    for (const fr of Object.keys(table)) {
      const k = normalise(fr), en = table[fr];
      if (typeof en !== "string") { conflits.push(`${f} : « ${fr} » n'a pas de texte anglais`); continue; }
      const deja = entrees.get(k);
      if (deja && deja.en !== en) conflits.push(`« ${fr} » : « ${deja.en} » (${deja.fichier}) contre « ${en} » (${f})`);
      /* Une même phrase peut se ranger à deux endroits : « Zones organisateur »
         est un calque du plan et un compteur que la synchronisation envoie. Elle
         part alors avec toute page qui emporte l'un ou l'autre. */
      if (deja) { if (!deja.fichiers.includes(f)) deja.fichiers.push(f); }
      else entrees.set(k, { en, fichier: f, fichiers: [f] });
    }
  }
  const chemin = path.join(ANGLAIS, "invisibles.js");
  let invisibles = new Set();
  if (fs.existsSync(chemin)) {
    delete require.cache[require.resolve(chemin)];
    invisibles = new Set(require(chemin).map(normalise));
  }
  return { entrees, conflits, invisibles };
}

/** Les morceaux fixes d'une clé : « {n} exposants retenus » → [« exposants retenus »]. */
const morceauxFixes = (cle) => cle.split(/\{[^{}]+\}/).map((s) => s.trim()).filter(Boolean);

function couverture(dico) {
  const exactes = new Set();
  const fixes = new Set();
  const tout = [];
  for (const k of dico.entrees.keys()) {
    exactes.add(k);
    for (const m of morceauxFixes(k)) { fixes.add(m); tout.push(m); }
  }
  const corpus = "\u0001" + tout.join("\u0001") + "\u0001";
  const corpusMin = corpus.toLowerCase();
  /* Les modèles, lus comme `_langue.js` les lit : une chaîne entière écrite en
     dur — « 7 derniers jours » dans une liste — n'est pas une clé, mais le
     modèle « {n} derniers jours » la couvre. */
  const modeles = [...dico.entrees.keys()].filter((k) => k.indexOf("{") >= 0).map((k) =>
    new RegExp("^" + k.split(/(\{[^{}]+\})/).map((m) => /^\{[^{}]+\}$/.test(m)
      ? (/^\{n\d?\}$/.test(m) ? "-?\\d[\\d\\s]*(?:[.,]\\d+)?" : ".+?")
      : m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("") + "$"));
  const couvre = (t, concat) => {
    if (dico.invisibles.has(t)) return true;
    if (exactes.has(t) || fixes.has(t)) return true;
    const casse = t[0] === t[0].toLowerCase() ? t[0].toUpperCase() + t.slice(1) : t[0].toLowerCase() + t.slice(1);
    if (exactes.has(casse) || fixes.has(casse)) return true;
    if (modeles.some((re) => re.test(t))) return true;
    if (!concat) return false;
    return corpus.includes(t) || corpusMin.includes(t.toLowerCase());
  };
  return (fragment) => {
    const t = fragment.texte;
    if (couvre(t, fragment.concat)) return true;
    /* Un morceau collé à ce qui le précède par un séparateur — « · tous
       pavillons » — se traduit sans lui : `_langue.js` découpe l'assemblage à
       ses séparateurs avant de chercher chaque morceau. */
    const nu = t.replace(/^[·—|–.,;:]\s*|\s*[·—|–.,;:]$/g, "");
    return nu !== t && nu.length > 1 && couvre(nu, fragment.concat);
  };
}

/* ------------------------------------------------------------------
   Ce qu'une page emporte

   Une entrée part avec la page si ses morceaux fixes se lisent tous dans les
   chaînes de la page — scripts et balisage, commentaires et styles écartés.
   La comparaison se fait blancs retirés : une phrase coupée en trois lignes
   dans le code, ou accordée par un `"s"` ajouté au bout, s'y retrouve
   entière. Elle retient parfois une entrée de trop, jamais une de moins —
   une entrée de trop coûte quelques octets, une de moins laisse une phrase en
   français.

   Un morceau fixe n'a pas à se lire d'un seul tenant : `"Indiquez " + (a ?
   "votre point de départ" : "votre arrivée") + " sur le plan."` range l'autre
   branche au milieu de la phrase. Il suffit qu'il se couvre de bouts présents,
   pris chacun le plus long possible — six signes au moins, pour qu'une
   phrase ne se reconstitue pas lettre à lettre.
   ------------------------------------------------------------------ */
const compacte = (s) => normalise(s).replace(/ /g, "").toLowerCase();

function corpusDe(texte, debutJs = false) {
  const bouts = [];
  parcours(texte, debutJs, (p) => bouts.push(compacte(p.valeur)), true);
  return bouts.join("");
}

function couvertPar(corpus, c) {
  let i = 0;
  while (i < c.length) {
    if (c.length - i < 6) return corpus.includes(c.slice(i));
    // le plus long bout présent à partir de i : on cherche par dichotomie
    let bas = 6, haut = c.length - i;
    if (!corpus.includes(c.slice(i, i + bas))) return false;
    while (bas < haut) {
      const m = (bas + haut + 1) >> 1;
      if (corpus.includes(c.slice(i, i + m))) bas = m; else haut = m - 1;
    }
    i += bas;
  }
  return true;
}

const presente = (corpus) => (fr) =>
  morceauxFixes(fr).every((m) => { const c = compacte(m); return c.length < 2 || couvertPar(corpus, c); });

/**
 * La page porte-t-elle le module dont ce fichier du dictionnaire est la
 * traduction ? Si oui, toutes ses entrées partent avec elle, sans avoir à se
 * retrouver dans le code : c'est le filet des phrases que la page compose de
 * morceaux trop dispersés pour que la lecture des chaînes les reconnaisse.
 *
 * Le module se reconnaît à ses lignes de déclaration — `function x(`,
 * `const X = ` — ou, pour un module de balisage, à ses identifiants.
 */
const _signatures = new Map();
function signaturesDe(fichierDico) {
  if (_signatures.has(fichierDico)) return _signatures.get(fichierDico);
  const module = path.join(GABARIT, fichierDico.replace(/\.js$/, ".html"));
  let sig = [];
  if (fs.existsSync(module)) {
    sig = fs.readFileSync(module, "utf8").split("\n").map((l) => l.trim())
      .filter((l) => l.length >= 18 && (/^(async\s+)?function\s+[\w$]+\s*\(|^(const|let)\s+[\w$]+\s*=/.test(l) ||
        /\sid="[\w-]+"/.test(l)))
      .slice(0, 12);
  }
  _signatures.set(fichierDico, sig);
  return sig;
}
const modulePresent = (html, fichierDico) => signaturesDe(fichierDico).some((l) => html.includes(l));

function dictionnairePour(html, dico = chargeDictionnaire()) {
  const dansPage = presente(corpusDe(html));
  // ce qui arrive par les données ou le serveur ne concerne qu'une page qui les demande
  const parleAuServeur = /\bfetch\s*\(/.test(html);
  const presents = new Map();
  const retenues = {};
  for (const [fr, e] of dico.entrees) {
    // une phrase identique en anglais n'a rien à faire ; un modèle identique réécrit encore ses nombres
    if (e.en === fr && fr.indexOf("{") < 0) continue;
    const present = e.fichiers.some((f) => {
      if (!presents.has(f)) presents.set(f, TOUJOURS.has(f) ? parleAuServeur : modulePresent(html, f));
      return presents.get(f);
    });
    if (present || dansPage(fr)) retenues[fr] = e.en;
  }
  return retenues;
}

/* ------------------------------------------------------------------
   Les sources contrôlées
   ------------------------------------------------------------------ */
function sources() {
  const liste = fs.readdirSync(GABARIT)
    .filter((f) => f.endsWith(".html"))
    .sort()
    .map((f) => path.join(GABARIT, f));
  return liste;
}

if (require.main === module) {
  const dico = chargeDictionnaire();
  const fichiers = sources();

  if (process.argv.includes("--inventaire")) {
    const inv = {};
    for (const f of fichiers) inv[path.relative(RACINE, f).replace(/\\/g, "/")] = releveFichier(f);
    process.stdout.write(JSON.stringify(inv, null, 1) + "\n");
    process.exit(0);
  }

  const couvert = couverture(dico);
  const manques = [];
  const comparaisons = [];
  for (const f of fichiers) {
    const rel = path.relative(RACINE, f).replace(/\\/g, "/");
    const vus = new Set();
    for (const x of releveFichier(f)) {
      if (x.comparaison && dico.entrees.has(x.texte)) comparaisons.push(`${rel}:${x.ligne} « ${x.texte} »`);
      if (couvert(x)) continue;
      const k = x.texte + "\u0001" + x.ligne;
      if (vus.has(k)) continue;
      vus.add(k);
      manques.push({ rel, ...x });
    }
  }

  if (process.argv.includes("--orphelines")) {
    const corpus = fichiers.map((f) => { const t = fs.readFileSync(f, "utf8"); return corpusDe(t, commenceEnJs(f, t)); }).join("");
    const dansSources = presente(corpus);
    const orphelines = [...dico.entrees].filter(([fr, e]) => !e.fichiers.some((f) => TOUJOURS.has(f)) && !dansSources(fr));
    for (const [fr, e] of orphelines) console.log(`${e.fichier} : « ${fr} »`);
    console.log(orphelines.length + " entrée(s) que plus rien n'affiche.");
    process.exit(0);
  }

  let faute = false;
  if (dico.conflits.length) {
    faute = true;
    console.error("Le dictionnaire anglais se contredit :\n");
    dico.conflits.forEach((c) => console.error("  " + c));
    console.error("");
  }
  if (comparaisons.length) {
    /* Une phrase traduite à l'écran ne vaut plus sa version française : un code
       qui relit le texte d'un bouton pour savoir où il en est se tromperait en
       anglais. Signalé, sans bloquer — certaines comparaisons portent sur une
       valeur tenue par le code et jamais relue de l'écran. */
    console.warn("Comparaisons avec une phrase traduite (le code relit-il l'écran ?) :");
    comparaisons.forEach((c) => console.warn("  " + c));
    console.warn("");
  }
  if (manques.length) {
    faute = true;
    console.error(`${manques.length} chaîne(s) visible(s) sans traduction anglaise :\n`);
    let dernier = "";
    for (const m of manques) {
      if (m.rel !== dernier) { console.error(`  ${m.rel}`); dernier = m.rel; }
      console.error(`    l.${String(m.ligne).padEnd(5)} « ${m.texte} »`);
    }
    console.error("\nTraduisez-les dans `outils/anglais/` (le fichier qui porte le nom du module),");
    console.error("ou, si le relevé s'est trompé et que la chaîne ne s'affiche pas, déclarez-la");
    console.error("dans `outils/anglais/invisibles.js`.");
  }
  if (faute) process.exit(1);
  console.log(`Traductions : ${dico.entrees.size} entrées, toutes les chaînes visibles couvertes.`);
}

module.exports = { chargeDictionnaire, dictionnairePour, releveFichier, couverture, normalise, decoupeJs, texteDuBalisage };
