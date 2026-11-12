/**
 * Allègement des calques d'habillage.
 *
 * Klipso exporte le bâtiment tel qu'il sort d'AutoCAD : pour un seul pavillon,
 * 2,9 Mo dont l'essentiel est du hachurage — des dizaines de milliers de
 * segments de quatre centimètres, invisibles à tout zoom raisonnable.
 *
 * Sept opérations, dans cet ordre :
 *   0. ne garder des éléments que les attributs de dessin (`PERMIS`) ;
 *   1. écarter les segments plus courts que le seuil (le hachurage) ;
 *   2. arrondir les coordonnées au centimètre ;
 *   3. remplacer les couleurs figées sur les éléments par `currentColor` ;
 *   4. écarter ce qui ne peut rien peindre — étendue nulle ;
 *   5. écarter les répétitions strictes d'un même élément ;
 *   6. retirer les rotations d'un tour complet, qui ne tournent rien.
 *
 * La troisième compte autant que les deux premières : un attribut de couleur posé
 * sur un élément l'emporte sur celui de son groupe. Tant qu'il subsiste, la
 * recolorisation d'un calque ne l'atteint jamais — et l'on obtient une bande
 * dont la moitié seulement change de teinte.
 */

const SEUIL = 0.5;   // mètres : au-dessous, un segment est du hachurage

/* Ce que le plan garde d'un élément : de quoi le dessiner, et rien d'autre.

   Le dessin part tel quel dans la page de chaque visiteur (`innerHTML`, dans
   `modules/apparence.mjs`) : un attribut recopié de l'export est un attribut
   posé chez lui. Les éléments, eux, étaient déjà reconstruits un à un — seules
   les balises qu'on sait lire survivent —, mais leurs attributs passaient en
   bloc, et un `onmouseover="…"` glissé dans un export, par erreur ou par un
   tiers qui aurait eu la main sur la source, serait arrivé jusqu'à la page. La
   CSP du plan refuse de l'exécuter ; ce n'est pas une raison pour l'écrire.

   Liste fermée plutôt que liste de ce qu'on refuse : les attributs dangereux
   sont innombrables (tout `on…`, `href`, `style`, `xlink:*`…), ceux qui
   dessinent tiennent en une ligne. Ce que les plans de Klipso emploient y est
   tout entier (relevé sur l'instantané de `outils/donnees/plans.json`) ; le
   reste n'est que la grammaire voisine du trait et du texte. Ce qui en sort
   est nommé dans `ecartes`, que la synchronisation écrit à son journal : un
   attribut légitime qu'on aurait oublié se voit là, au lieu de manquer en
   silence au dessin d'un salon. */
const TRAIT = ["fill", "fill-opacity", "fill-rule", "stroke", "stroke-width", "stroke-dasharray",
  "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity",
  "opacity", "transform", "vector-effect"];
const PERMIS: Record<string, Set<string>> = {
  path: new Set(["d", ...TRAIT]),
  polyline: new Set(["points", ...TRAIT]),
  circle: new Set(["cx", "cy", "r", ...TRAIT]),
  text: new Set(["x", "y", "dx", "dy", "font-size", "font-weight", "font-style", "font-family",
    "text-anchor", "dominant-baseline", "letter-spacing", ...TRAIT]),
};
/* Une valeur ne charge rien : ni adresse, ni ressource hors du document.
   Ni `\` ni `&` non plus : le navigateur décode une entité (`u&#114;l(`) avant
   de lire la valeur, et le CSS d'un attribut de présentation un échappement
   (`u\72l(`) — l'un et l'autre écriraient `url(` sans que le motif le voie.
   Un tracé, une couleur, une taille n'en ont jamais l'usage. */
const VALEUR_SURE = /^(?![\s\S]*(?:javascript:|data:|url\(\s*(?!#)))[^<>\\&]*$/i;

/* La couleur d'un groupe, que la page repose en `fill` ou en trait
   (`modules/apparence.mjs`) : une couleur écrite, et rien qui désigne autre
   chose. Les plans de Klipso n'y mettent que `rgb(…)` ou `none`. */
const COULEUR = /^(?:none|currentColor|#[0-9a-f]{3,8}|[a-z]{3,20}|rgba?\(\s*[\d.]+%?(?:\s*,\s*[\d.]+%?){2,3}\s*\))$/i;

/** Les attributs d'un élément, réduits à ceux qui dessinent ; ce qu'on écarte
 *  est noté dans `ecartes`.
 *
 *  Ce qu'on garde est recopié tel que la source l'écrit, espaces comprises, et
 *  non réécrit : Klipso écrit `stroke-width ="0.03"`, et les règles qui suivent
 *  (`currentColor`, le retrait de `font-family` sur les textes) se sont réglées
 *  sur cette écriture-là. La normaliser ici changerait ce qu'elles attrapent —
 *  et l'apparence de plans déjà réglés. Un plan sans attribut de trop sort donc
 *  à l'octet près. Une valeur sans guillemets n'est gardée que faite de
 *  caractères qui ne peuvent rien ouvrir. */
function attributsDeDessin(balise: string, attrs: string, ecartes: Set<string>): string {
  const permis = PERMIS[balise];
  let sortie = "";
  let fin = 0;
  for (const a of attrs.matchAll(/(\s*)([^\s=/>]+)(?:(\s*=\s*)(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
    const nom = a[2].toLowerCase();
    const valeur = a[4] ?? a[5] ?? a[6];
    const sure = valeur !== undefined && VALEUR_SURE.test(valeur) &&
      (a[6] === undefined || /^[\w.,#%+-]+$/.test(a[6]));
    if (sure && permis.has(nom)) sortie += a[0];
    else ecartes.add(balise + "@" + nom);
    fin = (a.index ?? 0) + a[0].length;
  }
  // ce qui suit le dernier attribut — l'espace avant « /> » — reste comme il était
  return sortie + attrs.slice(fin);
}

const r2 = (n: number) => Math.round(n * 100) / 100;

interface Boite {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/**
 * Les points d'un élément, lus sur le seul attribut qui les porte — jamais sur
 * un `transform`, ni sur une épaisseur de trait, qui donneraient des
 * coordonnées imaginaires.
 *
 * Les tracés ne connaissent que trois commandes ici : `M`, `L` et `A`. Après
 * un arc viennent cinq paramètres — deux rayons, une rotation, deux drapeaux —
 * avant le point d'arrivée : les lire comme des coordonnées ferait croire à un
 * dessin qui passe par l'origine. Toute autre commande fait renoncer : on ne
 * jette pas ce qu'on ne sait pas lire.
 */
function points(balise: string, element: string): [number, number][] | null {
  const lus: [number, number][] = [];
  if (balise === "path") {
    const d = /\sd="([^"]*)"/.exec(element);
    if (!d) return null;
    const jetons = d[1].match(/[A-Za-z]|-?\d+(?:\.\d+)?/g) ?? [];
    for (let i = 0; i < jetons.length; i++) {
      const j = jetons[i];
      if (!isNaN(Number(j))) continue;               // nombre : déjà pris
      const c = j.toUpperCase();
      if (c === "M" || c === "L") {
        lus.push([Number(jetons[i + 1]), Number(jetons[i + 2])]);
        i += 2;
      } else if (c === "A") {
        // après un arc viennent cinq paramètres avant le point d'arrivée : les
        // lire comme des coordonnées ferait croire à un dessin qui passe par
        // l'origine, et un arc de rayon nul paraîtrait immense
        lus.push([Number(jetons[i + 6]), Number(jetons[i + 7])]);
        i += 7;
      } else return null;
    }
  } else if (balise === "polyline") {
    const p = /\spoints="([^"]*)"/.exec(element);
    if (!p) return null;
    for (const m of p[1].matchAll(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g)) {
      lus.push([Number(m[1]), Number(m[2])]);
    }
  } else if (balise === "circle") {
    const cx = /\scx="(-?[\d.]+)"/.exec(element);
    const cy = /\scy="(-?[\d.]+)"/.exec(element);
    const r = /\sr="(-?[\d.]+)"/.exec(element);
    if (!cx || !cy) return null;
    const rr = r ? Number(r[1]) : 0;
    lus.push([Number(cx[1]) - rr, Number(cy[1]) - rr], [Number(cx[1]) + rr, Number(cy[1]) + rr]);
  } else return null;
  return lus.every(([x, y]) => isFinite(x) && isFinite(y)) ? lus : null;
}

/** La boîte d'un élément, ou rien si on n'a pas su le lire. */
function boite(balise: string, element: string): Boite | null {
  const p = points(balise, element);
  if (!p || !p.length) return null;
  const xs = p.map((q) => q[0]), ys = p.map((q) => q[1]);
  return {
    x0: Math.min(...xs), y0: Math.min(...ys),
    x1: Math.max(...xs), y1: Math.max(...ys),
  };
}

/**
 * Un élément qui ne peut rien peindre : son étendue est nulle dans les deux
 * sens. Klipso en sort des milliers — des polylignes dont les cinq points sont
 * le même, des arcs de rayon nul, des cercles de rayon nul — et les répète
 * jusqu'à trois cents fois au même endroit.
 *
 * « Nulle », au sens strict, et c'est délibéré : les tracés du fond n'ont pas
 * de terminaison arrondie, si bien qu'une géométrie sans longueur ne dessine
 * rien, à aucun zoom. Un centimètre, en revanche, dessine — les limites de
 * zones sont pointillées, et chaque tiret fait un centimètre. Le seuil qui
 * écarte le hachurage, lui, ne vaut que pour des segments dont on sait qu'ils
 * remplissent une surface ; l'appliquer ici effacerait ces pointillés.
 */
function neDessineRien(balise: string, element: string): boolean {
  const b = boite(balise, element);
  return Boolean(b) && b!.x0 === b!.x1 && b!.y0 === b!.y1;
}

export interface SousCalque {
  id: string;
  trait: string;        // couleur d'origine du tracé
  remplissage: string;  // couleur d'origine du fond
  contenu: string;
}

export function allege(source: string): { svg: string; sousCalques: SousCalque[]; ecartes: string[] } {
  const groupes: SousCalque[] = [];
  const ecartes = new Set<string>();
  const reG = /<g id="([^"]+)"\s*>([\s\S]*?)(?=<g id="|<\/g>\s*<\/svg>|$)/g;
  let m: RegExpExecArray | null;

  while ((m = reG.exec(source))) {
    const id = m[1], corps = m[2];
    const segments: string[] = [];
    const autres: string[] = [];

    const reL = /<line x1="(-?[\d.]+)" y1="(-?[\d.]+)" x2="(-?[\d.]+)" y2="(-?[\d.]+)"/g;
    let l: RegExpExecArray | null;
    while ((l = reL.exec(corps))) {
      const [x1, y1, x2, y2] = [+l[1], +l[2], +l[3], +l[4]];
      if (Math.hypot(x2 - x1, y2 - y1) < SEUIL) continue;
      segments.push(`M${r2(x1)} ${r2(y1)}L${r2(x2)} ${r2(y2)}`);
    }

    /* Deux fois le même élément au même endroit ne se voit pas deux fois.
       Le tri se fait par sous-calque : un même symbole peut légitimement être
       dessiné dans deux calques, de deux couleurs. */
    const vus = new Set<string>();

    const reP = /<(polyline|path|circle)\b([^>]*)\/>/g;
    let p: RegExpExecArray | null;
    while ((p = reP.exec(corps))) {
      const attrs = attributsDeDessin(p[1], p[2], ecartes)
        .replace(/-?\d+\.\d+/g, (s) => String(r2(+s)))
        .replace(/\b(fill|stroke)="(?!none\b)[^"]*"/g, '$1="currentColor"');
      const element = `<${p[1]}${attrs}/>`;
      if (neDessineRien(p[1], element)) continue;
      if (vus.has(element)) continue;
      vus.add(element);
      autres.push(element);
    }

    const reT = /<text\b([^>]*)>([^<]*)<\/text>/g;
    let t: RegExpExecArray | null;
    while ((t = reT.exec(corps))) {
      const attrs = attributsDeDessin("text", t[1], ecartes)
        .replace(/-?\d+\.\d+/g, (s) => String(r2(+s)))
        .replace(/\s*(stroke|fill|font-family)="[^"]*"/g, "")
        // un tour complet, ou pas de tour du tout : le texte est droit, et
        // Klipso l'écrit quand même sur chacun des deux mille textes d'un plan
        .replace(/\s*transform="rotate\(\s*(?:360|0)(?:\.0+)?[ ,][^"]*\)"/g, "");
      const element = `<text${attrs}>${t[2]}</text>`;
      if (vus.has(element)) continue;
      vus.add(element);
      autres.push(element);
    }

    if (!segments.length && !autres.length) continue;

    const st = /<g[^>]*\bstroke="([^"]+)"/.exec(corps);
    const fi = /<g[^>]*\bfill="([^"]+)"/.exec(corps);
    const couleur = (m: RegExpExecArray | null, nom: string) => {
      if (!m) return "";
      if (COULEUR.test(m[1].trim())) return m[1];
      ecartes.add("g@" + nom);
      return "";
    };
    groupes.push({
      id,
      trait: couleur(st, "stroke"),
      remplissage: couleur(fi, "fill"),
      contenu: (segments.length ? `<path d="${segments.join("")}"/>` : "") + autres.join(""),
    });
  }

  const svg = groupes
    .map((g) => `<g id="${g.id}" data-s="${g.trait}" data-f="${g.remplissage}">${g.contenu}</g>`)
    .join("");
  return { svg, sousCalques: groupes.map((g) => ({ ...g, contenu: "" })), ecartes: [...ecartes].sort() };
}

/**
 * Le dessin d'un calque, débarrassé des sous-calques que l'exploitant a
 * masqués. `allege` les pose à plat — un `<g>` par sous-calque, jamais
 * imbriqués — d'où ce découpage sur la seule balise ouvrante.
 *
 * C'est là que pèse le fond : chez FEP26, les sous-calques masqués de
 * « Batiment » font 2 Mo des 2,6 Mo servis. Les retirer avant l'envoi, plutôt
 * qu'après réception, épargne au visiteur un dessin qu'il ne verra pas.
 */
export function sansMasques(svg: string, masque: (id: string) => boolean): string {
  return svg
    .split(/(?=<g )/)
    .filter((part) => {
      const m = /^<g[^>]*\bid="([^"]*)"/.exec(part);
      return !m || !masque(m[1]);
    })
    .join("");
}

/** Les textes d'un calque, utilisés pour nommer les zones organisateur. */
export function textes(source: string): { x: number; y: number; txt: string }[] {
  const out: { x: number; y: number; txt: string }[] = [];
  const dec = (t: string) =>
    t.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
     .replace(/&amp;/g, "&").replace(/&#39;/g, "'").trim();
  const re = /<text x="(-?[\d.]+)" y="(-?[\d.]+)"[^>]*>([^<]*)<\/text>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(source))) out.push({ x: +m[1], y: +m[2], txt: dec(m[3]) });
  return out;
}
