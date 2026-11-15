/* ============================================================
   Le style de l'habillage de Klipso, résolu sans la feuille de style

   L'habillage — les calques que Klipso livre en SVG (`P().fond`) — fait
   l'essentiel du SVG caché : neuf éléments sur dix sur un salon comme SMCL.
   Le dessin (`webgl.mjs`) en relisait chaque élément dans le style que le
   navigateur avait calculé, un `getComputedStyle` par élément, et le
   navigateur tenait à jour, pour cela, le style de milliers d'éléments que
   personne ne voit. Ce module rend le même style sans le lui demander, pour
   que le dessin lise le calque dans une copie détachée de son balisage,
   jamais posée dans la page (`docs/migration-webgl.md`, étape 3).

   La cascade, dans son ordre :
   - le réglage de l'exploitant, par calque et par sous-calque — couleur,
     remplissage ou trait, sous-calque éteint —, que `apparence.mjs`
     `styleFond` pose sur le groupe du sous-calque : le même calcul, ici, sur
     la configuration (`styleSousCalque`) ;
   - les attributs de dessin que Klipso écrit, hérités d'un parent comme la
     feuille les hérite (`fill`, `stroke`, leurs opacités, les tirets,
     l'ancrage et la graisse d'un texte) ;
   - les deux règles de `_styles-plan.css` qui l'emportent sur eux : les
     traits des tracés, polylignes et cercles, épais de 0,7 pixel à l'écran
     quel que soit le zoom, et les textes, qui se peignent à la couleur du
     calque, sans contour, dans la police du plan.

   Les balises sont celles que le nettoyage de Klipso laisse passer
   (`_partage/svg.ts` `PERMIS`) : groupes, tracés, polylignes, cercles,
   textes. Qui change une règle de la feuille sur `#couches .cal` change aussi
   celle d'ici : l'essai `outils/essais/navigateur/habillage.spec.js` compare
   ce que le dessin tire des deux lectures, calque par calque.
   ============================================================ */
import { CONF, conf, sousCle } from "./configuration.mjs";
import { creeEvenement } from "./evenement.mjs";

/** Le réglage d'un calque de l'habillage a changé — sa couleur, son
 *  remplissage, un sous-calque, sa visibilité — : le dessin relit ce calque
 *  (`webgl.mjs`). `apparence.mjs` `styleFond` l'émet, la clé du calque en main.
 *  @type {import("./evenement.mjs").Evenement<[string]>} */
export const CALQUE_CHANGE = creeEvenement();

/**
 * L'opacité d'un calque de l'habillage, comme la feuille la pose sur son
 * groupe : nulle s'il est éteint par l'exploitant, en retrait derrière le
 * cartouche des points d'intérêt (`html.poi-actif #couches .cal`) ou la
 * visite guidée (`html.tuto-retrait #couches .cal`, dans `_styles-divers.css`,
 * qui vient après : à force égale, elle l'emporte). Le dessin ne lit plus le
 * style calculé du groupe ; qui change l'une des deux règles change l'autre.
 * @param {string} cle
 */
export function opaciteCalque(cle){
  if (conf(cle).visible === false) return 0;
  const r = document.documentElement.classList;
  return r.contains("tuto-retrait") ? .22 : r.contains("poi-actif") ? .16 : 1;
}

/* La police du plan telle que le navigateur l'écrit pour un élément qui la
   déclare (`font-family: var(--sans)`) : guillemets et espaces compris, comme
   un style calculé la rendrait. Une sonde hors du plan, où rien ne la guette. */
/** @type {HTMLElement | null} */
let sonde = null;
function famillePlan(){
  if (!sonde || !sonde.isConnected){
    sonde = document.createElement("div");
    sonde.setAttribute("aria-hidden", "true");
    sonde.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;visibility:hidden;font-family:var(--sans)";
    document.body.appendChild(sonde);
  }
  return getComputedStyle(sonde).fontFamily;
}

/**
 * Ce que la page donne à l'habillage, lu une fois pour tout un calque : la
 * couleur des calques (`--plan-line`), la police et la graisse du plan.
 * @param {Element} couches le groupe `#couches`, dont les calques héritent
 */
export function jetonsHabillage(couches){
  const cs = getComputedStyle(couches);
  return { ligne: cs.getPropertyValue("--plan-line").trim(), graisse: cs.fontWeight, famille: famillePlan(),
    // le corps dont héritent les textes du calque, et celui de la racine, pour `rem`
    corps: parseFloat(cs.fontSize) || 16, racine: parseFloat(getComputedStyle(document.documentElement).fontSize) || 16,
    // l'opacité propre du calque dans la page, posée par qui le lit (`webgl.mjs` `habillageGl`)
    calque: 1 };
}

/**
 * Le style d'un sous-calque, tel que `apparence.mjs` `styleFond` le pose sur
 * son groupe : sa couleur, son remplissage, son trait, et s'il est éteint.
 * @param {string} cle la clé du calque
 * @param {Element} sous le groupe du sous-calque (`g[data-s]`)
 * @param {ReturnType<typeof jetonsHabillage>} j
 */
export function styleSousCalque(cle, sous, j){
  const c = conf(cle), sc = CONF[sousCle(cle, sous.id)] || {};
  const src = sous.getAttribute("data-s") || "", noir = !src || src === "rgb(0,0,0)";
  // une couleur vide rend la main à celle des calques, que le groupe hérite
  const color = sc.couleur || c.couleur || (noir ? j.ligne : src);
  const rempli = sc.rempli !== undefined ? sc.rempli : c.rempli;
  return {
    eteint: sc.visible === false, color,
    fill: rempli ? "currentColor" : (sous.getAttribute("data-f") || "none"),
    stroke: rempli ? "none" : "currentColor",
  };
}

/** Ce qu'un élément hors de tout sous-calque hérite du calque : sa couleur, et
 *  les valeurs initiales du SVG. */
export const styleSansSousCalque = (/** @type {ReturnType<typeof jetonsHabillage>} */ j) =>
  ({ eteint: false, color: j.ligne, fill: "black", stroke: "none" });

/* La valeur d'un attribut de dessin, héritée jusqu'au groupe du sous-calque
   (exclu : la sienne vient du réglage), ou rien. `inherit`, que le nettoyage
   de Klipso laisse passer, renvoie au parent comme une valeur absente : la
   rendre telle quelle donnait une opacité illisible, et le tracé disparaissait
   du dessin seul. */
function herite(/** @type {Element} */ el, /** @type {Element | null} */ sous, /** @type {string} */ nom){
  for (let n = /** @type {Element | null} */ (el); n && n !== sous; n = /** @type {Element | null} */ (n.parentElement)){
    const v = n.getAttribute(nom);
    if (v !== null && v.trim() !== "" && v.trim() !== "inherit") return v.trim();
  }
  return null;
}

/**
 * Une opacité SVG en nombre, bornée à [0, 1] : un nombre, ou un pourcentage
 * (`50%`), que le style calculé convertissait et que `parseFloat` lisait
 * cent fois trop grand. Rien pour une valeur illisible.
 * @param {string | null} v
 */
export function opacite(v){
  if (v === null) return null;
  const t = v.trim(), n = parseFloat(t);
  if (!Number.isFinite(n)) return null;
  return Math.min(1, Math.max(0, t.endsWith("%") ? n / 100 : n));
}

/**
 * L'opacité propre d'un élément — elle ne s'hérite pas, mais `inherit` y
 * prend celle du parent. Un, sans déclaration lisible. Remontée jusqu'au-delà
 * de la racine de la copie détachée, elle prend celle du calque posé dans la
 * page, que la feuille règle (`.16` derrière un cartouche) et que la copie ne
 * porte pas.
 * @param {Element} el
 * @param {number} [calque] l'opacité propre du groupe du calque dans la page
 */
export function opaciteElement(el, calque = 1){
  for (let n = /** @type {Element | null} */ (el); n; n = /** @type {Element | null} */ (n.parentElement)){
    // la racine de la copie tient la place du calque posé : c'est son opacité qui vaut
    if (n !== el && !n.parentElement) return calque;
    const v = n.getAttribute("opacity");
    if (v === null || v.trim() !== "inherit") return opacite(v) ?? 1;
  }
  return calque;
}

/* Le corps d'un texte en pixels, comme le navigateur le calcule : les tailles
   en mots-clés et en unités que le nettoyage laisse passer (`small`, `1.5em`,
   `12pt`, `120%`) se résolvent de l'ancêtre le plus haut vers le texte, sur
   le corps dont le calque hérite. Un nombre seul reste le chemin courant ; une
   valeur illisible est ignorée, comme le ferait la feuille. */
const MOTS = ["xx-small", "x-small", "small", "medium", "large", "x-large", "xx-large", "xxx-large"];
/* Ce que valent les mots-clés, mesurés une fois sur la sonde : ils suivent la
   taille de police que le visiteur a réglée dans son navigateur — `medium`
   vaut seize pixels d'ordinaire, vingt chez qui agrandit les textes —, et une
   table fixe la lui aurait reprise. */
/** @type {Record<string, number> | null} */
let motsMesures = null;
function motsCorps(){
  if (motsMesures) return motsMesures;
  famillePlan();
  const m = /** @type {Record<string, number>} */ ({}), sd = /** @type {HTMLElement} */ (sonde);
  for (const mot of MOTS){ sd.style.fontSize = mot; m[mot] = parseFloat(getComputedStyle(sd).fontSize) || 16; }
  sd.style.fontSize = "";
  return (motsMesures = m);
}
const UNITES_CORPS = /** @type {Record<string, number>} */ ({ "": 1, px: 1, pt: 4 / 3, pc: 16, in: 96,
  cm: 96 / 2.54, mm: 96 / 25.4, q: 96 / 101.6 });
function corpsDe(/** @type {string} */ v, /** @type {number} */ parent, /** @type {ReturnType<typeof jetonsHabillage>} */ j){
  if (MOTS.includes(v)) return motsCorps()[v];
  if (v === "larger") return parent * 1.2;
  if (v === "smaller") return parent / 1.2;
  const m = /^(\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?\s*([a-z%]*)$/.exec(v);
  if (!m) return parent;
  const n = parseFloat(v), u = m[2];
  if (u === "%") return parent * n / 100;
  if (u === "em") return parent * n;
  if (u === "rem") return j.racine * n;
  return u in UNITES_CORPS ? n * UNITES_CORPS[u] : parent;
}
function corps(/** @type {Element} */ el, /** @type {ReturnType<typeof jetonsHabillage>} */ j){
  /** @type {string[]} */
  const declares = [];
  for (let n = /** @type {Element | null} */ (el); n; n = /** @type {Element | null} */ (n.parentElement)){
    const v = (n.getAttribute("font-size") || "").trim().toLowerCase();
    if (v && v !== "inherit") declares.push(v);
  }
  let px = j.corps;
  for (let i = declares.length - 1; i >= 0; i--) px = corpsDe(declares[i], px, j);
  return px;
}
const couleur = (/** @type {string} */ v, /** @type {{ color: string }} */ s) => v === "currentColor" ? s.color : v;

/** Les tracés dont la feuille fixe le trait à l'écran (`#couches .cal path, polyline, circle`). */
const TRAIT_FIXE = new Set(["path", "polyline", "circle"]);

/**
 * Le style d'un élément de l'habillage, sous la forme que `webgl.mjs`
 * `formeGl` et `texteGl` lisent dans un style calculé.
 * @param {Element} el
 * @param {Element | null} sous le groupe de son sous-calque, s'il en a un
 * @param {ReturnType<typeof styleSousCalque>} s le style de ce sous-calque
 * @param {ReturnType<typeof jetonsHabillage>} j
 */
export function styleElementHabillage(el, sous, s, j){
  const h = (/** @type {string} */ nom) => herite(el, sous, nom);
  const texte = el.localName === "text";
  const fixe = TRAIT_FIXE.has(el.localName);
  return {
    // `#couches .cal text{fill:currentColor;stroke:none}` l'emporte sur les attributs
    fill: texte ? s.color : couleur(h("fill") || s.fill, s),
    fillOpacity: String(opacite(h("fill-opacity")) ?? 1),
    stroke: texte ? "none" : couleur(h("stroke") || s.stroke, s),
    strokeOpacity: String(opacite(h("stroke-opacity")) ?? 1),
    strokeWidth: fixe ? ".7" : h("stroke-width") || "1",
    vectorEffect: fixe ? "non-scaling-stroke" : el.getAttribute("vector-effect") || "none",
    strokeDasharray: h("stroke-dasharray") || "none",
    fontFamily: j.famille, fontWeight: h("font-weight") || j.graisse,
    fontSize: texte ? corps(el, j) + "px" : "16px", textAnchor: h("text-anchor") || "start",
    display: "inline", opacity: String(opaciteElement(el, j.calque)), pointerEvents: "auto",
    getPropertyValue: () => "",
  };
}
