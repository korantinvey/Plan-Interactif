/**
 * Allègement des calques d'habillage.
 *
 * Klipso exporte le bâtiment tel qu'il sort d'AutoCAD : pour un seul pavillon,
 * 2,9 Mo dont l'essentiel est du hachurage — des dizaines de milliers de
 * segments de quatre centimètres, invisibles à tout zoom raisonnable.
 *
 * Trois opérations, dans cet ordre :
 *   1. écarter les segments plus courts que le seuil (le hachurage) ;
 *   2. arrondir les coordonnées au centimètre ;
 *   3. remplacer les couleurs figées sur les éléments par `currentColor`.
 *
 * La troisième compte autant que les deux autres : un attribut de couleur posé
 * sur un élément l'emporte sur celui de son groupe. Tant qu'il subsiste, la
 * recolorisation d'un calque ne l'atteint jamais — et l'on obtient une bande
 * dont la moitié seulement change de teinte.
 */

const SEUIL = 0.5;   // mètres

const r2 = (n: number) => Math.round(n * 100) / 100;

export interface SousCalque {
  id: string;
  trait: string;        // couleur d'origine du tracé
  remplissage: string;  // couleur d'origine du fond
  contenu: string;
}

export function allege(source: string): { svg: string; sousCalques: SousCalque[] } {
  const groupes: SousCalque[] = [];
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

    const reP = /<(polyline|path|circle)\b([^>]*)\/>/g;
    let p: RegExpExecArray | null;
    while ((p = reP.exec(corps))) {
      const attrs = p[2]
        .replace(/-?\d+\.\d+/g, (s) => String(r2(+s)))
        .replace(/\b(fill|stroke)="(?!none\b)[^"]*"/g, '$1="currentColor"');
      autres.push(`<${p[1]}${attrs}/>`);
    }

    const reT = /<text\b([^>]*)>([^<]*)<\/text>/g;
    let t: RegExpExecArray | null;
    while ((t = reT.exec(corps))) {
      const attrs = t[1]
        .replace(/-?\d+\.\d+/g, (s) => String(r2(+s)))
        .replace(/\s*(stroke|fill|font-family)="[^"]*"/g, "");
      autres.push(`<text${attrs}>${t[2]}</text>`);
    }

    if (!segments.length && !autres.length) continue;

    const st = /<g[^>]*\bstroke="([^"]+)"/.exec(corps);
    const fi = /<g[^>]*\bfill="([^"]+)"/.exec(corps);
    groupes.push({
      id,
      trait: st ? st[1] : "",
      remplissage: fi ? fi[1] : "",
      contenu: (segments.length ? `<path d="${segments.join("")}"/>` : "") + autres.join(""),
    });
  }

  const svg = groupes
    .map((g) => `<g id="${g.id}" data-s="${g.trait}" data-f="${g.remplissage}">${g.contenu}</g>`)
    .join("");
  return { svg, sousCalques: groupes.map((g) => ({ ...g, contenu: "" })) };
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
