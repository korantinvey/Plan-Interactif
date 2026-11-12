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
  c: Point;      // centre de la boîte englobante
  bb: Point;     // largeur, hauteur de la boîte englobante
  lc?: Point;    // ancrage du libellé, si différent du centre
  lb?: Point;    // place disponible autour de cet ancrage
}

/** Distance d'un point à un segment. */
function distSegment(p: Point, a: Point, b: Point): number {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const l = dx * dx + dy * dy;
  let t = l ? ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}

/** Distance au bord, négative à l'extérieur : c'est ce qu'on maximise. */
function distBord(p: Point, a: Anneau[]): number {
  let d = Infinity;
  for (const anneau of a) {
    for (let i = 0, j = anneau.length - 1; i < anneau.length; j = i++) {
      d = Math.min(d, distSegment(p, anneau[j], anneau[i]));
    }
  }
  return dedans(p, a[0]) ? d : -d;
}

/**
 * Le point intérieur le plus éloigné des bords.
 *
 * Sur un stand en L ou en U, le centre de la boîte englobante tombe souvent
 * hors de la forme : le nom s'écrivait alors dans le vide, à cheval sur
 * l'allée. On cherche donc le point le plus « au large », par une grille qu'on
 * resserre autour du meilleur candidat — six passes suffisent à descendre sous
 * le centimètre sur un stand de dix mètres.
 */
function poleInterieur(a: Anneau[], x0: number, y0: number, x1: number, y1: number): Point {
  let cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  let meilleur = distBord([cx, cy], a);
  let dx = (x1 - x0) / 2, dy = (y1 - y0) / 2;

  for (let passe = 0; passe < 6; passe++) {
    const px = dx / 4, py = dy / 4;
    for (let i = -2; i <= 2; i++) {
      for (let j = -2; j <= 2; j++) {
        if (!i && !j) continue;
        const p: Point = [cx + i * px, cy + j * py];
        const d = distBord(p, a);
        if (d > meilleur) { meilleur = d; cx = p[0]; cy = p[1]; }
      }
    }
    dx /= 2; dy /= 2;
  }
  return [cx, cy];
}

/** Jusqu'où l'on peut aller depuis un point dans une direction, sans sortir. */
function portee(p: Point, a: Anneau[], ux: number, uy: number, max: number): number {
  const pas = max / 24;
  let d = 0;
  while (d + pas <= max && dedans([p[0] + (d + pas) * ux, p[1] + (d + pas) * uy], a[0])) {
    d += pas;
  }
  return d;
}

export function boite(a: Anneau[]): Boite {
  const pts = a.flat();
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs);
  const y0 = Math.min(...ys), y1 = Math.max(...ys);
  const c: Point = [r2((x0 + x1) / 2), r2((y0 + y1) / 2)];
  const bb: Point = [r2(x1 - x0), r2(y1 - y0)];

  /* Un rectangle n'a rien à corriger : son centre est déjà le meilleur
     ancrage, et sa boîte englobante décrit exactement sa place. */
  const rectangle = a.length === 1 && a[0].length <= 5 && dedans(c, a[0]);
  if (rectangle) return { c, bb };

  const p = poleInterieur(a, x0, y0, x1, y1);
  const g = portee(p, a, -1, 0, bb[0]), d = portee(p, a, 1, 0, bb[0]);
  const h = portee(p, a, 0, -1, bb[1]), b = portee(p, a, 0, 1, bb[1]);

  /* On recentre le libellé dans l'espace libre trouvé, puis on ne retient que
     la moitié la plus courte de chaque côté : le texte est centré sur son
     ancrage, il déborderait sinon du côté le plus étroit. */
  const lc: Point = [r2(p[0] + (d - g) / 2), r2(p[1] + (b - h) / 2)];
  const lb: Point = [r2(Math.min(g + d, bb[0])), r2(Math.min(h + b, bb[1]))];

  // en deçà d'un cinquième de la boîte, la mesure n'est pas fiable : on renonce
  return lb[0] > bb[0] / 5 && lb[1] > bb[1] / 5 ? { c, bb, lc, lb } : { c, bb };
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
