/* ============================================================
   Le tracé d'une forme dessinée

   Le chemin SVG d'une forme d'un calque de dessin — rectangle, polygone,
   ligne, coins adoucis —, et le style de son trait : des calculs purs, sans
   document ni état. Le dessin des calques s'en sert, mais aussi la grille de
   marche de l'itinéraire, le trou sous le fond de carte, l'éditeur et la
   reprise d'un emplacement, qui relisent les formes sans les dessiner. Le
   visiteur le reçoit : `plan.mjs` embarque ce module.
   ============================================================ */

/**
 * Le tracé d'une suite de sommets, coins abattus d'un rayon donné.
 *
 * Un relevé de bureau d'études décrit un bâtiment ; un plan de visiteur décrit
 * un lieu. Le second veut des murs francs et des angles doux, là où le premier
 * détaille chaque battant de porte. D'où ce rayon : il tient en mètres, comme
 * le reste du tracé, et suit donc le zoom au lieu de s'épaissir avec lui.
 *
 * Le rayon demandé n'est qu'un maximum. Un angle serré entre deux murs courts
 * n'a pas la place de l'accueillir : la coupe s'arrête alors à la moitié du
 * plus court des deux côtés, et l'arrondi se resserre d'autant. Sans cette
 * limite, deux coins voisins se mangeraient l'un l'autre et le contour se
 * retournerait.
 */
function cheminArrondi(pts, r, ferme){
  const n = pts.length;
  const droit = "M" + pts.map(p => p[0] + " " + p[1]).join("L") + (ferme ? "Z" : "");
  if (!(r > 0) || n < 3) return droit;
  const cm = (x) => +x.toFixed(2);

  /* Les extrémités d'une ligne ouverte restent vives : il n'y a rien à
     raccorder au-delà. */
  const coins = new Array(n).fill(null);
  for (let i = ferme ? 0 : 1; i <= (ferme ? n - 1 : n - 2); i++){
    const a = pts[(i - 1 + n) % n], b = pts[i], c = pts[(i + 1) % n];
    const lu = Math.hypot(a[0] - b[0], a[1] - b[1]);
    const lv = Math.hypot(c[0] - b[0], c[1] - b[1]);
    if (!lu || !lv) continue;
    const u = [(a[0] - b[0]) / lu, (a[1] - b[1]) / lu];
    const v = [(c[0] - b[0]) / lv, (c[1] - b[1]) / lv];
    // un sommet aligné ou replié sur lui-même n'a pas d'angle à adoucir
    const theta = Math.acos(Math.max(-1, Math.min(1, u[0] * v[0] + u[1] * v[1])));
    if (theta < .05 || Math.PI - theta < .05) continue;
    const t = Math.min(r / Math.tan(theta / 2), lu / 2, lv / 2);
    // le sens de l'arc suit celui du virage ; l'axe des ordonnées descend,
    // un produit vectoriel positif tourne donc dans le sens des aiguilles
    const sens = (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]) > 0 ? 1 : 0;
    coins[i] = { e: [cm(b[0] + u[0] * t), cm(b[1] + u[1] * t)],
                 s: [cm(b[0] + v[0] * t), cm(b[1] + v[1] * t)],
                 r: cm(t * Math.tan(theta / 2)), sens };
  }
  if (coins.every(c => !c)) return droit;

  const point = (p) => p[0] + " " + p[1];
  const depart = ferme && coins[0] ? coins[0].s : pts[0];
  let d = "M" + point(depart);
  for (let k = 1; k <= (ferme ? n : n - 1); k++){
    const co = coins[k % n];
    d += co ? "L" + point(co.e) + "A" + co.r + " " + co.r + " 0 0 " + co.sens + " " + point(co.s)
            : "L" + point(pts[k % n]);
  }
  return d + (ferme ? "Z" : "");
}

/* Rectangle, image, stand dessiné : trois formes que deux coins opposés
   suffisent à tenir. Le tracé, les poignées et le redimensionnement les
   traitent donc ensemble. */
export const estCadre = (f) => f.t === "rect" || f.t === "image" || f.t === "stand";

export function cheminForme(f){
  if (estCadre(f)){
    const [a, b] = f.pts;
    const x = Math.min(a[0], b[0]), y = Math.min(a[1], b[1]);
    const w = Math.abs(b[0] - a[0]), h = Math.abs(b[1] - a[1]);
    // une image porte son propre cadrage : l'arrondir rognerait le visuel
    if (f.t !== "image" && f.r > 0)
      return cheminArrondi([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], f.r, true);
    return "M" + x + " " + y + "h" + w + "v" + h + "h" + (-w) + "Z";
  }
  return cheminArrondi(f.pts, f.r || 0, f.t !== "ligne");
}
/* --- épaisseur et style du trait ---
   L'épaisseur réglée d'un trait se compte en pixels d'écran, et l'espacement
   des points avec elle : un trait compté en mètres deviendrait un ruban dès
   qu'on zoome sur une allée. Mais tenue à l'identique en vue d'ensemble, elle
   écrasait le plan — le contour d'un hall, trois pixels sur un pavillon
   entier ramené à la largeur d'un téléphone, mangeait les stands du bord.

   Le trait s'amincit donc avec le plan quand on recule : il garde son
   épaisseur tant qu'un mètre tient au moins `TRAIT_PLEIN` pixels, la perd en
   proportion en deçà, et ne descend pas sous `TRAIT_PLANCHER` de ce qu'il
   vaut — un trait plus fin ne se verrait plus. Le facteur est le même pour
   les deux rendus : le SVG le lit dans la variable `--trait-f`, que la vue
   pose sur `#couches` (`facteurTrait`), la carte graphique le rejoue en
   mètres, bornée par les mêmes deux limites (`webgl.mjs`, couches
   « traits-z »). Les tracés concernés portent la classe `trait`. */
export const EPAISSEUR_TRAIT = 2;
/** Pixels par mètre à partir desquels le trait a toute son épaisseur. */
export const TRAIT_PLEIN = 8;
/** Part de son épaisseur sous laquelle un trait ne s'amincit plus. */
export const TRAIT_PLANCHER = .3;

/** Le facteur d'épaisseur pour un plan vu à tant de pixels par mètre. */
export function facteurTrait(pxParMetre){
  if (!(pxParMetre > 0)) return 1;
  return Math.max(TRAIT_PLANCHER, Math.min(1, pxParMetre / TRAIT_PLEIN));
}

/** Une longueur d'écran qui suit le facteur du trait. */
export const pxTrait = (n) => "calc(var(--trait-f,1) * " + +n.toFixed(2) + "px)";

/* Rien n'est écrit tant que la forme ne demande rien — la feuille de style
   garde alors la main, et le pointillé qui signale un rôle d'itinéraire
   pendant l'édition reste lisible sur les tracés qu'on n'a pas réglés. */
export function styleTrait(f){
  const ep = f.ep > 0 ? f.ep : EPAISSEUR_TRAIT;
  const css = [];
  if (ep !== EPAISSEUR_TRAIT) css.push("stroke-width:" + pxTrait(ep));
  /* Des points ronds plutôt que des tirets : les bouts arrondis du trait les
     dessinent d'eux-mêmes dès que la portion tracée est quasi nulle. */
  if (f.pointille) css.push("stroke-dasharray:.01px " + pxTrait(ep * 2.2));
  return ' class="trait"' + (css.length ? ' style="' + css.join(";") + '"' : "");
}
