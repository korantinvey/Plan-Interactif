/* ============================================================
   Le débord des noms sur les allées — la place libre autour d'un stand

   Quand les noms des stands s'harmonisent en trois paliers
   (`nom-emplacement.mjs` `nomsUniformes`), un nom qui n'atteint pas le sien
   dans son stand a le droit, pour y parvenir, de déborder sur l'allée qui le
   borde — jamais sur un stand voisin, ni sur une zone de l'organisateur.

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
 * prend que la moitié de l'allée de chaque côté : le stand d'en face peut
 * ainsi en faire autant sans que les deux noms se chevauchent.
 *
 * Chaque côté a son débord. Un stand collé à son voisin d'un côté et bordé
 * d'une allée de l'autre déborde de ce seul côté, et son nom glisse vers
 * l'allée : le nom resté centré ne débordait que d'autant des deux côtés, et
 * le voisin collé lui interdisait l'allée d'en face (« 3 BRASSEURS », FEP27).
 * Le centré passe pourtant d'abord, à place égale : il se lit comme celui
 * des voisins.
 *
 * Un voisin qui mord sur le stand — les tracés ne joignent pas toujours
 * leurs cloisons — ne ferme que le côté où il se trouve : celui où il
 * pénètre le moins. Il fermait tous les côtés, et le stand perdait l'allée
 * qui le bordait de l'autre.
 *
 * Une place qui déborde dans les deux sens n'est permise que si son coin ne
 * mord sur rien — un stand en bout d'îlot, au croisement de deux allées, ne
 * doit pas écrire sur celui qui fait l'angle en face. Ce coin se mesure avec
 * la même moitié d'allée, pour que le voisin d'en face y garde sa part.
 *
 * Une zone ou un stand qui contient le centre du stand n'est pas un obstacle :
 * c'est l'espace qui l'abrite — le carré d'un pavillon régional, l'emplacement
 * qui héberge un stand lié.
 *
 * @param {{ nom?: string, c?: number[], bb?: number[] }[]} stands
 * @param {{ c?: number[], bb?: number[] }[]} zones
 * @returns {Map<object, number[][]>} pour chaque stand qui gagne quelque
 *   chose, les places possibles, dites par ce qu'elles ajoutent de chaque
 *   côté — `[gauche, haut, droite, bas]`, en mètres —, de la plus sobre à la
 *   plus large, et à place égale la centrée d'abord.
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
      if (aHauteur && aAplomb){
        // il mord : il ferme le côté où il pénètre le moins
        const px = Math.min(b[2], sb[2]) - Math.max(b[0], sb[0]);
        const py = Math.min(b[3], sb[3]) - Math.max(b[1], sb[1]);
        if (px <= py){ if (b[0] + b[2] > sb[0] + sb[2]) droite = 0; else gauche = 0; }
        else if (b[1] + b[3] > sb[1] + sb[3]) bas = 0; else haut = 0;
        continue;
      }
      if (aHauteur){
        if (b[0] >= sb[2] - JOINT) droite = Math.min(droite, b[0] - sb[2]);
        else if (b[2] <= sb[0] + JOINT) gauche = Math.min(gauche, sb[0] - b[2]);
      }
      if (aAplomb){
        if (b[1] >= sb[3] - JOINT) bas = Math.min(bas, b[1] - sb[3]);
        else if (b[3] <= sb[1] + JOINT) haut = Math.min(haut, sb[1] - b[3]);
      }
    }
    const moitie = (g) => Math.max(0, Math.min(DEBORD_MAX, g / 2));
    const [eg, eh, ed, eb] = [gauche, haut, droite, bas].map(moitie);
    /* Dans chaque sens : rien, centré (le moins des deux côtés, de part et
       d'autre), ou chaque côté le sien. */
    const sens = (a, b) => {
      const m = Math.min(a, b), o = [[0, 0]];
      if (m > 0) o.push([m, m]);
      if (a !== b && Math.max(a, b) > 0) o.push([a, b]);
      return o;
    };
    const places = [];
    for (const [g, d] of sens(eg, ed)) for (const [h, b] of sens(eh, eb)){
      if (!(g || d || h || b)) continue;
      if ((g || d) && (h || b)){
        const coin = [sb[0] - 2 * g, sb[1] - 2 * h, sb[2] + 2 * d, sb[3] + 2 * b];
        if (autour.some(x => croise(coin, x.b))) continue;
      }
      places.push([g, h, d, b]);
    }
    const aire = (/** @type {number[]} */ p) => (sb[2] - sb[0] + p[0] + p[2]) * (sb[3] - sb[1] + p[1] + p[3]);
    const decale = (/** @type {number[]} */ p) => Math.abs(p[2] - p[0]) + Math.abs(p[3] - p[1]);
    places.sort((x, y) => aire(x) - aire(y) || decale(x) - decale(y));
    if (places.length) out.set(s, places);
  }
  return out;
}
