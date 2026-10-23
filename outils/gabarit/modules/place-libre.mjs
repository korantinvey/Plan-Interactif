/* ============================================================
   La place libre d'un emplacement découpé — où son nom peut encore s'écrire

   Un emplacement qui héberge des sociétés porte souvent, posés sur lui, les
   stands que l'exploitant a dessinés pour elles, ou ajoutés et liés : chacun
   écrit son nom sur sa part. Le nom du titulaire, mesuré sur l'emplacement
   entier, s'écrivait alors au centre, par-dessus ces parts (« BERTRAND
   FRANCHISE », FEP27, 23 octobre 2026). Il s'écrit désormais dans la partie
   restée libre, et se tait quand il n'en reste plus.

   Ce module ne fait que le calcul, sur des boîtes : il ne dépend de rien, et
   s'éprouve seul dans Node (`outils/essais/place-libre.js`). La mesure du nom
   lui est confiée par `libelles.mjs`.
   ============================================================ */

/* En deçà, la partie libre n'est qu'un reste — une allée intérieure, un
   liseré entre deux parts — et le nom s'y écrirait en travers de leurs noms. */
export const COTE_MIN = 1, PART_MIN = .1;

/**
 * Le rectangle libre de `b` où le nom s'écrit le mieux, une fois retirés les
 * `trous` — les parts posées sur l'emplacement.
 *
 * Les bords des parts découpent l'emplacement en une grille ; on essaie tous
 * les rectangles de cette grille qu'aucune part n'occupe, et l'on garde celui
 * que `note` préfère — la taille du nom qui y tiendrait, et non la surface :
 * un long rectangle couché vaut mieux pour un nom long qu'un carré plus
 * vaste. Une part compte une douzaine de bords au plus : la grille reste
 * petite, et le calcul se garde (`libelles.mjs`).
 *
 * @param {number[]} b la boîte de l'emplacement, `[x0, y0, x1, y1]`
 * @param {number[][]} trous les boîtes des parts posées dessus
 * @param {(w: number, h: number) => number} [note] la valeur d'un rectangle
 *   de `w` sur `h` ; la surface par défaut
 * @returns {number[] | null} la boîte retenue, `b` elle-même s'il n'y a pas
 *   de trou, `null` s'il ne reste rien d'utile
 */
export function rectangleLibre(b, trous, note = (w, h) => w * h){
  const t = trous
    .map(r => [Math.max(r[0], b[0]), Math.max(r[1], b[1]), Math.min(r[2], b[2]), Math.min(r[3], b[3])])
    .filter(r => r[2] > r[0] && r[3] > r[1]);
  if (!t.length) return b;
  const bords = (i, j) => [...new Set([b[i], b[j], ...t.flatMap(r => [r[i], r[j]])])].sort((x, y) => x - y);
  const xs = bords(0, 2), ys = bords(1, 3);
  const nx = xs.length - 1, ny = ys.length - 1;
  /* Les cases occupées, et leurs sommes cumulées : qu'un rectangle de la
     grille soit libre se lit alors en quatre lectures. */
  const somme = Array.from({ length: nx + 1 }, () => new Array(ny + 1).fill(0));
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++){
    const cx = (xs[i] + xs[i + 1]) / 2, cy = (ys[j] + ys[j + 1]) / 2;
    const pris = t.some(r => cx > r[0] && cx < r[2] && cy > r[1] && cy < r[3]) ? 1 : 0;
    somme[i + 1][j + 1] = pris + somme[i][j + 1] + somme[i + 1][j] - somme[i][j];
  }
  const surface = (b[2] - b[0]) * (b[3] - b[1]);
  let best = null, bestNote = -Infinity;
  for (let i0 = 0; i0 < nx; i0++) for (let i1 = i0 + 1; i1 <= nx; i1++){
    const w = xs[i1] - xs[i0];
    if (w < COTE_MIN) continue;
    for (let j0 = 0; j0 < ny; j0++) for (let j1 = j0 + 1; j1 <= ny; j1++){
      const h = ys[j1] - ys[j0];
      if (h < COTE_MIN || w * h < PART_MIN * surface) continue;
      if (somme[i1][j1] - somme[i0][j1] - somme[i1][j0] + somme[i0][j0]) continue;
      const n = note(w, h);
      if (n > bestNote){ bestNote = n; best = [xs[i0], ys[j0], xs[i1], ys[j1]]; }
    }
  }
  return best;
}
