/**
 * Passage du repère Klipso au repère d'affichage.
 *
 * Klipso stocke la géométrie en WKT, en mètres, dans le repère monde AutoCAD
 * du parc — l'origine est loin du hall, les coordonnées tournent autour de
 * (-6800, 8800). La CAO travaille en Y vers le haut, le SVG en Y vers le bas :
 *
 *     x' = x        y' = −y
 *
 * Ce n'est pas une supposition. Klipso applique lui-même cette transformation
 * dans les SVG qu'il génère : pour le pavillon 7.2, Plan.Shape vaut
 * POLYGON((-6951 -8888, …, -6571 -8626, …)) et le viewBox du SVG associé vaut
 * « -6951 8626 380 262 ». Mêmes X, Y de signe opposé, mêmes dimensions.
 *
 * On applique donc le retournement une seule fois, à l'import, et tout ce qui
 * suit — rendu, dessins de l'exploitant, calculs d'emprise — travaille dans un
 * repère écran homogène, en mètres.
 */

export type Point = [number, number];
export type Anneau = Point[];

const r2 = (n: number) => Math.round(n * 100) / 100;

/** WKT (POLYGON, MULTIPOLYGON) vers une liste d'anneaux, Y retourné. */
export function versAnneaux(wkt: string | null | undefined): Anneau[] | null {
  if (!wkt) return null;
  const anneaux: Anneau[] = [];
  const re = /\(([^()]+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(wkt))) {
    const pts = m[1].trim().split(",").map((p) => {
      const [x, y] = p.trim().split(/\s+/).map(Number);
      return [r2(x), r2(-y)] as Point;
    });
    if (pts.length > 2 && pts.every((p) => isFinite(p[0]) && isFinite(p[1]))) {
      anneaux.push(pts);
    }
  }
  return anneaux.length ? anneaux : null;
}

/** Anneaux vers un attribut `d` de tracé SVG. */
export const versTrace = (a: Anneau[]) =>
  a.map((r) => "M" + r.map((p) => p.join(" ")).join("L") + "Z").join("");

export interface Boite {
  c: Point;      // centre
  bb: Point;     // largeur, hauteur
}

export function boite(a: Anneau[]): Boite {
  const pts = a.flat();
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs);
  const y0 = Math.min(...ys), y1 = Math.max(...ys);
  return { c: [r2((x0 + x1) / 2), r2((y0 + y1) / 2)], bb: [r2(x1 - x0), r2(y1 - y0)] };
}

export interface Emprise { x0: number; y0: number; x1: number; y1: number }

/** Emprise réelle des objets, marge comprise. */
export function emprise(objets: { c: Point; bb: Point }[], marge = 12): Emprise {
  if (!objets.length) return { x0: 0, y0: 0, x1: 100, y1: 100 };
  const xs = objets.flatMap((o) => [o.c[0] - o.bb[0] / 2, o.c[0] + o.bb[0] / 2]);
  const ys = objets.flatMap((o) => [o.c[1] - o.bb[1] / 2, o.c[1] + o.bb[1] / 2]);
  return {
    x0: r2(Math.min(...xs) - marge), y0: r2(Math.min(...ys) - marge),
    x1: r2(Math.max(...xs) + marge), y1: r2(Math.max(...ys) + marge),
  };
}

/** Appartenance d'un point à un anneau, par lancer de rayon. */
export function dedans(pt: Point, anneau: Anneau): boolean {
  let ok = false;
  for (let i = 0, j = anneau.length - 1; i < anneau.length; j = i++) {
    const [xi, yi] = anneau[i], [xj, yj] = anneau[j];
    if ((yi > pt[1]) !== (yj > pt[1]) &&
        pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) ok = !ok;
  }
  return ok;
}
