/* ============================================================
   Le lot du fond figé — la règle, sans la page

   Un fond figé est un lot d'images carrées, en pyramide : le carré entier du
   fond au niveau zéro, coupé en quatre à chaque niveau suivant. L'exploitant
   le photographie (`fige-carte.mjs`), le visiteur en pose ce que sa vue
   demande (`environs.mjs`). Ce module dit, pour l'un comme pour l'autre, ce
   que le lot représente, quelles images couvrent une vue, et dans quel ordre
   on les photographie.

   Il ne sait rien de la page, pour s'éprouver seul dans Node
   (`outils/essais/fond-fige.js`) : une erreur de case n'y fait rien planter,
   elle pose un morceau de quartier à côté de sa place.

   Le lot, tel que `plan.calage.fige` le porte :

     { source, adresse, x0, y0, cote, px, niveaux, ext, le, images, octets }

   `adresse` finit par une barre : une image s'y nomme
   `<niveau>/<colonne>/<ligne>.<ext>`. `x0`, `y0`, `cote` disent le carré en
   mètres du plan, `px` le côté d'une image, `niveaux` le dernier niveau.
   ============================================================ */

/* Jusqu'où l'on recule, en largeurs de pavillon : deux fois et demie tant
   qu'il n'y a rien au-delà des murs, un peu plus dès qu'une carte s'y trouve —
   c'est pour la voir qu'on l'a posée, et la vue s'arrêtait au bord de la
   première rue. Un peu plus, et non huit fois comme d'abord : de si loin le
   hall n'était plus qu'un timbre au milieu du quartier, et l'on regardait la
   ville plutôt que le salon. Trois fois et un tiers montrent les abords —
   parkings, entrées, rues qui y mènent — et s'arrêtent là. L'emprise, elle,
   ne bouge pas : elle tient aussi la grille d'itinéraire, au demi-mètre. */
export const RECUL_CARTE = 3.3;

/* Jusqu'où le milieu de la vue s'écarte du pavillon, en part de la vue : trois
   vingtièmes de part et d'autre de son emprise. Le hall garde ainsi plus d'un
   tiers de l'écran dans chaque sens, quel que soit le zoom — on peut regarder
   ce qui le borde, non le perdre (`vue.mjs` `retiensVue`). Le double, essayé
   d'abord, laissait encore glisser le hall jusqu'au bord de l'écran.

   Pas sur le seul pavillon : le plan s'ajuste et se centre dans
   la bande que le tiroir et la fiche laissent libre, et son milieu tombe
   alors hors du hall — le retenir là défaisait le cadrage. Nul pendant qu'un
   exploitant cale la carte, qui peut avoir à chercher loin. */
export const DEBORD_VUE = 0.3;
/** Le carré de sol que le fond couvre, en mètres du plan, pour l'emprise
 *  d'un pavillon — au-delà, rien ne se télécharge ni ne se photographie
 *  (`environs.mjs` `zoneDuFond`). */
export function carreDuFond(/** @type {{x0:number,y0:number,x1:number,y1:number}} */ e){
  /* Le compte, pour la vue la plus large — `RECUL_CARTE` largeurs, deux fois
     plus haute sur un téléphone — poussée au bout de ce que `DEBORD_VUE`
     permet : son bord le plus lointain tombe à un demi-hall, plus
     `DEBORD_VUE` + 0,5 fois sa hauteur, du centre. */
  const t = Math.max(e.x1 - e.x0, e.y1 - e.y0);
  const d = t * (0.5 + RECUL_CARTE * 2 * (DEBORD_VUE + 0.5));
  const cx = (e.x0 + e.x1) / 2, cy = (e.y0 + e.y1) / 2;
  return { x0: cx - d, y0: cy - d, x1: cx + d, y1: cy + d };
}

/* La forme du lot. Une révision avance quand ce qu'une image représente
   change pour un même calage, et rend caducs les lots d'avant. */
export const REVISION_FIGE = 1;
/* Le côté d'une image, en pixels : assez grand pour que la vue n'en demande
   qu'une poignée, assez petit pour se décoder vite sur un téléphone. */
export const PX_FIGE = 1024;

/** Ce que le lot figé représente, en une chaîne : deux calages qui la
 *  partagent dessinent la même image. */
export function sourceDuFige(/** @type {any} */ cal, /** @type {any} */ zone){
  const r = (/** @type {number} */ v, /** @type {number} */ n) => Math.round(v * n) / n;
  return [REVISION_FIGE, cal.fond || "", cal.style || "",
    r(cal.lon, 1e7), r(cal.lat, 1e7), r(cal.x, 1e3), r(cal.y, 1e3), r(cal.angle, 1e7),
    r(zone.x0, 10), r(zone.y0, 10), r(zone.x1 - zone.x0, 10)].join("|");
}

/**
 * Les images du lot à poser pour la vue `v` (en mètres du plan), vue à
 * `mParPx` mètres par pixel.
 *
 * Le niveau est le plus proche de l'échelle de la vue, en rapport et non en
 * écart : une image n'y est jamais étirée ni réduite de plus de √2, et ses
 * noms de rues gardent à peu près la taille où ils ont été écrits. Pure, pour être éprouvée sans navigateur.
 */
export function imagesFigees(/** @type {any} */ f, /** @type {any} */ v, /** @type {number} */ mParPx){
  const m0 = f.cote / f.px;
  let k = Math.round(Math.log2(m0 / mParPx));
  k = Math.max(0, Math.min(f.niveaux, Number.isFinite(k) ? k : 0));
  for (;; k--){
    const n = Math.pow(2, k), pas = f.cote / n;
    const i0 = Math.max(0, Math.floor((v.x - f.x0) / pas));
    const i1 = Math.min(n - 1, Math.floor((v.x + v.w - f.x0) / pas));
    const j0 = Math.max(0, Math.floor((v.y - f.y0) / pas));
    const j1 = Math.min(n - 1, Math.floor((v.y + v.h - f.y0) / pas));
    /* Une vue inclinée découvre le sol jusqu'à l'horizon : si elle demande
       trop d'images à ce niveau, le niveau du dessus, moins fin, suffit à ce
       qu'on voit de si loin. */
    if (k > 0 && (i1 - i0 + 1) * (j1 - j0 + 1) > 36) continue;
    /** @type {{k:number,i:number,j:number,x:number,y:number,c:number}[]} */
    const images = [];
    for (let i = i0; i <= i1; i++)
      for (let j = j0; j <= j1; j++)
        images.push({ k: k, i: i, j: j, x: f.x0 + i * pas, y: f.y0 + j * pas, c: pas });
    return { k: k, images: images };
  }
}

/** L'adresse d'une image du lot : niveau, colonne, ligne. */
export const adresseFigee = (/** @type {any} */ f, /** @type {number} */ k,
  /** @type {number} */ i, /** @type {number} */ j) => f.adresse + k + "/" + i + "/" + j + "." + (f.ext || "webp");

/* L'échelle visée au niveau le plus fin, en mètres par pixel : de quoi lire
   une rue de près sans que le lot ne grossisse pour des détails qu'un fond
   pâli ne montre pas. Trois niveaux au plus — quatre-vingt-cinq images. */
const FIN_FIGE = 0.3;
const NIVEAUX_MAX = 3;

/** Le dernier niveau à photographier pour un carré de `cote` mètres. */
export function niveauxDuLot(/** @type {number} */ cote){
  const k = Math.ceil(Math.log2(cote / (PX_FIGE * FIN_FIGE)));
  return Math.max(0, Math.min(NIVEAUX_MAX, Number.isFinite(k) ? k : 0));
}

/**
 * Les vues à photographier, et les images qu'on découpe dans chacune.
 *
 * Un niveau se photographie d'un seul tenant tant qu'il tient dans `maxPx`
 * pixels de côté — la toile la plus grande que la carte graphique accepte —,
 * et en blocs sinon. D'un seul tenant, pour que les noms de rues ne se
 * coupent pas d'une image à l'autre : le moteur les place vue par vue, et
 * deux vues voisines ne les placent pas au même endroit. Les seules coutures
 * qui restent passent au milieu du carré, sous le hall.
 */
export function blocsDeCapture(/** @type {any} */ f, /** @type {number} */ maxPx){
  /** @type {{k:number,x:number,y:number,cote:number,px:number,images:{i:number,j:number,sx:number,sy:number}[]}[]} */
  const blocs = [];
  for (let k = 0; k <= f.niveaux; k++){
    const n = Math.pow(2, k), pas = f.cote / n;
    /* Une puissance de deux d'images par côté de bloc, pour que les blocs
       pavent le niveau sans reste. */
    let parBloc = 1;
    while (parBloc * 2 <= n && parBloc * 2 * f.px <= maxPx) parBloc *= 2;
    const px = parBloc * f.px, nb = n / parBloc;
    for (let bi = 0; bi < nb; bi++){
      for (let bj = 0; bj < nb; bj++){
        const images = [];
        for (let a = 0; a < parBloc; a++)
          for (let b = 0; b < parBloc; b++)
            images.push({ i: bi * parBloc + a, j: bj * parBloc + b, sx: a * f.px, sy: b * f.px });
        blocs.push({ k: k, x: f.x0 + bi * parBloc * pas, y: f.y0 + bj * parBloc * pas,
                     cote: parBloc * pas, px: px, images: images });
      }
    }
  }
  return blocs;
}
