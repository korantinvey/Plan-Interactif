/**
 * La règle du HTML échappé : `outils/controles/regle-html.js`, éprouvée seule.
 *
 * Elle ne vaut que si elle signale ce qu'on oublie d'échapper sans crier sur ce
 * qui l'est déjà : trop lâche, elle laisse passer la faille qu'elle existe pour
 * arrêter ; trop stricte, on finit par la contourner. D'où deux listes, ce
 * qu'elle doit laisser passer et ce qu'elle doit relever, chacune écrite comme
 * le code des pages l'écrit.
 *
 *   node outils/essais/regle-html.js     (lancé par `npm run essais`)
 */
const { Linter } = require("eslint");
const greffon = require("../controles/regle-html.js");

let ko = 0;
const dit = (ok, q, d) => {
  console.log((ok ? "  ok   " : "  ÉCHEC") + "  " + q + (d ? "   → " + d : ""));
  if (!ok) ko++;
};

const linter = new Linter({ configType: "flat" });
const releve = (code) => linter.verify(code, [{
  plugins: { plan: greffon },
  languageOptions: { ecmaVersion: "latest", sourceType: "module" },
  rules: { "plan/html-echappe": "error" },
}]).map((m) => m.message);

const ENTETE = 'import { esc } from "./texte.mjs"; import { lien } from "./sur.mjs"; import { ailleurs } from "./x.mjs";\n';

console.log("\n=== 1. Ce qui est sûr passe ===");
const SURS = [
  ["un texte écrit dans le code", 'el.innerHTML = "<b>Fond</b>";'],
  ["un vidage", 'el.innerHTML = "";'],
  ["une donnée passée par esc()", "export function f(el, nom) { el.innerHTML = '<b>' + esc(nom) + '</b>'; }"],
  ["un gabarit échappé", "export function f(el, x) { el.innerHTML = `<i>${esc(x.nom)}</i>`; }"],
  ["un lien relu par sur.mjs", "export function f(el, u) { el.innerHTML = lien(u); }"],
  ["une liste par .map(…).join()", "export function f(el, l) { el.innerHTML = l.map((x) => '<li>' + esc(x) + '</li>').join(''); }"],
  ["un nombre", "export function f(el, n) { el.innerHTML = '<b>' + Math.round(n) + '</b> ' + n.toFixed(1) + ' · ' + (n * 2); }"],
  ["une alternative de textes fixes", "export function f(el, ok) { el.innerHTML = ok ? '<b>Oui</b>' : '<i>Non</i>'; }"],
  ["une constante du module", "const PICTO = '<svg></svg>'; export function f(el) { el.innerHTML = PICTO; }"],
  ["une fonction du module qui échappe", "function ligne(x) { return '<td>' + esc(x) + '</td>'; } export function f(el, x) { el.innerHTML = ligne(x); }"],
  ["une variable bâtie de morceaux sûrs", "export function f(el, l) { let h = '<ul>'; for (const x of l) h += '<li>' + esc(x) + '</li>'; el.innerHTML = h; }"],
  ["insertAdjacentHTML échappé", "export function f(el, x) { el.insertAdjacentHTML('beforeend', '<span>' + esc(x) + '</span>'); }"],
];
for (const [q, code] of SURS) {
  const r = releve(ENTETE + code);
  dit(r.length === 0, q, r[0]);
}

console.log("\n=== 2. Ce qui n'est pas prouvé est relevé ===");
const NON_PROUVES = [
  ["un paramètre nu", "export function f(el, nom) { el.innerHTML = '<b>' + nom + '</b>'; }"],
  ["une propriété d'objet", "export function f(el, e) { el.innerHTML = `<b>${e.nom}</b>`; }"],
  ["outerHTML", "export function f(el, x) { el.outerHTML = x; }"],
  ["insertAdjacentHTML", "export function f(el, x) { el.insertAdjacentHTML('beforeend', x); }"],
  ["ce qu'un autre module rend", "export function f(el) { el.innerHTML = ailleurs(); }"],
  ["une liste dont un rendu n'est pas échappé", "export function f(el, l) { el.innerHTML = l.map((x) => '<li>' + x.nom + '</li>').join(''); }"],
  ["une variable qu'on salit plus loin", "export function f(el, x) { let h = '<p>'; h += x; el.innerHTML = h; }"],
  ["une fonction du module qui n'échappe pas", "function ligne(x) { return '<td>' + x + '</td>'; } export function f(el, x) { el.innerHTML = ligne(x); }"],
  ["une alternative dont une branche est sale", "export function f(el, ok, x) { el.innerHTML = ok ? '<b>Oui</b>' : x; }"],
];
for (const [q, code] of NON_PROUVES) {
  const r = releve(ENTETE + code);
  dit(r.length === 1, q, r.length + " relevé(s)");
}

console.log("\n=== 3. Le message nomme le morceau en cause ===");
const r = releve(ENTETE + "export function f(el, e) { el.innerHTML = '<b>' + esc(e.a) + '</b>' + e.nom; }");
dit(r.length === 1 && r[0].includes("« e.nom »"), "le morceau non échappé, et lui seul", r[0]);

console.log(ko ? "\n" + ko + " ÉCHEC(S)\n" : "\nLa règle du HTML échappé relève ce qu'il faut, et rien d'autre.\n");
process.exit(ko ? 1 : 0);
