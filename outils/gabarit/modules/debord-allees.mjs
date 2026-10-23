/* ============================================================
   Le débord des noms sur les allées — la place libre autour d'un stand

   Quand tous les noms s'écrivent à la même taille (`nom-emplacement.mjs`
   `nomsUniformes`), cette taille est celle du plus petit stand au nom le plus
   long : elle tombe vite à rien. Pour la relever, un nom a le droit de
   déborder de son stand sur l'allée qui le borde — jamais sur un stand
   voisin, ni sur une zone de l'organisateur.

   Ce module ne fait que le calcul, sur les centres et les boîtes des
   emplacements : il ne dépend de rien, et s'éprouve seul dans Node
   (`outils/essais/debord-allees.js`).
   ============================================================ */

/* Deux boîtes qui se touchent à cinq centimètres près se touchent : les
   tracés de Klipso ne joignent pas toujours leurs cloisons au millimètre. */
const JOINT = .05;
/* Ce qu'un nom gagne au plus de chaque côté quand rien ne l'arrête — au bord
   du hall, sur une place vide : sans borne, il irait jusqu'au mur. */
export const DEBORD_MAX = 2;

const boiteDe = (o) => [o.c[0] - o.bb[0] / 2, o.c[1] - o.bb[1] / 2, o.c[0] + o.bb[0] / 2, o.c[1] + o.bb[1] / 2];
const contient = (b, p) => p[0] > b[0] && p[0] < b[2] && p[1] > b[1] && p[1] < b[3];
const croise = (a, b) => a[0] < b[2] - JOINT && a[2] > b[0] + JOINT && a[1] < b[3] - JOINT && a[3] > b[1] + JOINT;

/**
 * Ce que chaque stand nommé peut ajouter à sa place pour écrire son nom.
 *
 * Pour chaque stand, l'écart au premier obstacle de chaque côté, cherché dans
 * la bande qu'occupe le stand : à droite et à gauche parmi ceux qui sont à sa
 * hauteur, en haut et en bas parmi ceux qui sont à son aplomb. Le nom ne
 * prend que la moitié de l'allée, et le même débord des deux côtés, puisqu'il
 * reste centré : le stand d'en face peut ainsi en faire autant sans que les
 * deux noms se chevauchent.
 *
 * Trois places s'offrent alors : élargie, rehaussée, ou les deux. La dernière
 * n'est permise que si son coin ne mord sur rien — un stand en bout d'îlot,
 * au croisement de deux allées, ne doit pas écrire sur celui qui fait l'angle
 * en face. Ce coin se mesure avec la même moitié d'allée, pour que le voisin
 * d'en face y garde sa part.
 *
 * Une zone ou un stand qui contient le centre du stand n'est pas un obstacle :
 * c'est l'espace qui l'abrite — le carré d'un pavillon régional, l'emplacement
 * qui héberge un stand lié.
 *
 * @param {{ nom?: string, c?: number[], bb?: number[] }[]} stands
 * @param {{ c?: number[], bb?: number[] }[]} zones
 * @returns {Map<object, number[][]>} pour chaque stand qui gagne quelque
 *   chose, les ajouts possibles `[largeur, hauteur]`, en mètres et en entier
 *   (les deux côtés compris), du plus sobre au plus large.
 */
export function debordsAuxAllees(stands, zones){
  const obstacles = [];
  for (const o of [...stands, ...zones]) if (o.c && o.bb) obstacles.push({ o, b: boiteDe(o) });
  const out = new Map();
  for (const s of stands){
    if (!s.nom || !s.c || !s.bb) continue;
    const sb = boiteDe(s);
    const autour = obstacles.filter(x => x.o !== s && !contient(x.b, s.c));
    let gauche = Infinity, droite = Infinity, haut = Infinity, bas = Infinity;
    for (const { b } of autour){
      const aHauteur = b[1] < sb[3] - JOINT && b[3] > sb[1] + JOINT;
      const aAplomb = b[0] < sb[2] - JOINT && b[2] > sb[0] + JOINT;
      if (aHauteur){
        if (b[0] >= sb[2] - JOINT) droite = Math.min(droite, b[0] - sb[2]);
        else if (b[2] <= sb[0] + JOINT) gauche = Math.min(gauche, sb[0] - b[2]);
        // un obstacle qui mord sur le stand lui-même ferme les deux côtés
        else if (aAplomb){ gauche = droite = haut = bas = 0; break; }
      }
      if (aAplomb){
        if (b[1] >= sb[3] - JOINT) bas = Math.min(bas, b[1] - sb[3]);
        else if (b[3] <= sb[1] + JOINT) haut = Math.min(haut, sb[1] - b[3]);
      }
    }
    const moitie = (a, b) => Math.max(0, Math.min(DEBORD_MAX, Math.min(a, b) / 2));
    const ex = moitie(gauche, droite), ey = moitie(haut, bas);
    const ajouts = [];
    if (ex > 0) ajouts.push([2 * ex, 0]);
    if (ey > 0) ajouts.push([0, 2 * ey]);
    if (ex > 0 && ey > 0){
      const coin = [sb[0] - 2 * ex, sb[1] - 2 * ey, sb[2] + 2 * ex, sb[3] + 2 * ey];
      if (!autour.some(x => croise(coin, x.b))) ajouts.push([2 * ex, 2 * ey]);
    }
    if (ajouts.length) out.set(s, ajouts);
  }
  return out;
}
