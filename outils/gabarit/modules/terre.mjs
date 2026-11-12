/* ============================================================
   Le plan sur la Terre — le calcul, sans la carte

   Un calage tient en quelques nombres : où tombe un point du plan sur la
   Terre (`lon`, `lat`, `x`, `y`) et vers où pointe l'axe des X (`angle`). Ce
   module fait les passages entre le plan, la Terre et la pyramide de tuiles
   Web Mercator, et mesure les contours qu'OpenStreetMap renvoie. Il ne sait
   rien de la page : `environs.mjs` en tire la carte qu'il pose sous le
   pavillon, `calage-carte.mjs` le hall qu'il y cherche.
   ============================================================ */

export const DEG = Math.PI / 180;
/* WGS84 : demi-grand axe, et première excentricité au carré. */
const RAYON_TERRE = 6378137, EXCENTRICITE2 = 0.00669437999014;

/**
 * Ce que vaut un degré, en mètres, à cette latitude.
 *
 * L'ellipsoïde plutôt que la sphère : cela ne coûte qu'une racine, et l'écart
 * atteint sept mètres au kilomètre sous nos latitudes — de quoi décaler d'une
 * demi-rue le bord du quartier, précisément là où l'on vérifie le calage.
 */
export function metresParDegre(lat){
  const s = Math.sin(lat * DEG), w = 1 - EXCENTRICITE2 * s * s;
  return {
    lat: DEG * RAYON_TERRE * (1 - EXCENTRICITE2) / Math.pow(w, 1.5),
    lon: DEG * RAYON_TERRE * Math.cos(lat * DEG) / Math.sqrt(w),
  };
}

/**
 * Le passage entre le repère du plan et l'est/nord local.
 *
 * Le plan a son Y vers le bas, la Terre son nord vers le haut : à la rotation
 * s'ajoute un retournement, et la matrice qui en résulte se trouve être sa
 * propre réciproque. Une seule fonction sert donc dans les deux sens — ce
 * n'est pas une économie d'écriture mais une garantie : l'aller et le retour
 * ne peuvent pas diverger.
 */
function tourneEnvirons(dx, dy, a){
  const c = Math.cos(a), s = Math.sin(a);
  return [dx * c + dy * s, dx * s - dy * c];
}

/** Un point du plan, en longitude et latitude. */
export function versTerre(pt, cal){
  const m = metresParDegre(cal.lat);
  const [e, n] = tourneEnvirons(pt[0] - cal.x, pt[1] - cal.y, cal.angle);
  return [cal.lon + e / m.lon, cal.lat + n / m.lat];
}

/** Une longitude et une latitude, en mètres du plan. */
export function versLePlan(ll, cal){
  const m = metresParDegre(cal.lat);
  const [dx, dy] = tourneEnvirons((ll[0] - cal.lon) * m.lon,
                                  (ll[1] - cal.lat) * m.lat, cal.angle);
  return [cal.x + dx, cal.y + dy];
}

/**
 * Le même calage, écrit depuis un autre point du plan.
 *
 * Tourner autour de l'origine ferait fuir la carte hors de l'écran dès le
 * premier degré — elle est à sept kilomètres du hall. On ré-ancre donc sur le
 * point qu'on regarde avant de toucher à l'angle : la rotation pivote alors
 * là où l'œil est posé, et régler devient un geste au lieu d'une poursuite.
 */
export function reancre(cal, pt){
  const ll = versTerre(pt, cal);
  /* `style` en fait partie : l'adresse qu'on colle parce que celle du fond
     rend un 404 se perdait au premier ré-ancrage — et la rotation ré-ancre à
     chaque image du geste. La carte repartait sur le style d'origine et le
     champ se vidait au tracé suivant, sans un mot. */
  return { lon: ll[0], lat: ll[1], x: pt[0], y: pt[1], angle: cal.angle,
           fond: cal.fond, force: cal.force, halls: cal.halls, vide: cal.vide,
           style: cal.style };
}

/* ------------------------------------------------------------
   La pyramide de tuiles Web Mercator
   ------------------------------------------------------------ */
export const PX_TUILE = 256;
/* Le tour de la Terre à l'équateur, dans la projection des tuiles. */
export const TOUR_MERCATOR = 40075016.686;

/** Un point du globe, en pixels de la pyramide, à ce niveau. */
export function pixelsMercator(lon, lat, z){
  const n = PX_TUILE * Math.pow(2, z);
  const s = Math.max(-0.9999, Math.min(0.9999, Math.sin(lat * DEG)));
  return [(lon + 180) / 360 * n,
          (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * n];
}

/** La latitude d'une ligne de pixels — la réciproque de la précédente, dont on
 *  n'a besoin que du Y. */
export function latitudeDePixel(py, z){
  const n = PX_TUILE * Math.pow(2, z);
  return Math.atan(Math.sinh(Math.PI * (1 - 2 * py / n))) / DEG;
}

/**
 * Ce que vaut un pixel de la pyramide, en mètres du plan — vers l'est, et vers
 * le sud.
 *
 * Mesuré dans notre propre repère, et non déduit de la formule sphérique. Web
 * Mercator projette depuis une sphère, `versLePlan` depuis l'ellipsoïde
 * WGS84 ; et sur l'ellipsoïde la projection n'est plus conforme — un pixel ne
 * vaut pas tout à fait le même terrain vers l'est et vers le nord. Supposer
 * l'un et l'autre égaux à la valeur sphérique décalait la carte d'un mètre au
 * bout du quartier : invisible sur un stand, et exactement là où l'œil vérifie
 * que le calage tombe juste.
 *
 * Deux dérivées suffisent, et le reste du placement se fait alors en pixels
 * entiers : le groupe porte l'échelle, les tuiles n'ont plus rien à calculer.
 */
export function echelleDesTuiles(cal, z){
  const m = metresParDegre(cal.lat);
  const py = pixelsMercator(cal.lon, cal.lat, z)[1];
  return {
    x: 360 / (PX_TUILE * Math.pow(2, z)) * m.lon,
    y: (cal.lat - latitudeDePixel(py + 1, z)) * m.lat,
  };
}

/** Le niveau dont les tuiles tombent au plus près de l'échelle affichée : à un
 *  niveau près on afficherait un fond deux fois trop grossier, ou quatre fois
 *  trop de tuiles pour la même image. */
export function niveauDesTuiles(cal, mParPx, max){
  const z = Math.round(
    Math.log(TOUR_MERCATOR * Math.cos(cal.lat * DEG) / (PX_TUILE * mParPx)) / Math.LN2);
  return Math.max(2, Math.min(max, z));
}

/* ------------------------------------------------------------
   Les contours — un hall relevé dans OpenStreetMap
   ------------------------------------------------------------ */
/** L'aire d'un contour fermé, par la formule du lacet. */
export function aireDuContour(pts){
  let s = 0;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++)
    s += pts[j][0] * pts[i][1] - pts[i][0] * pts[j][1];
  return Math.abs(s) / 2;
}

/** Le centre d'un contour fermé — le vrai, celui de la surface. La moyenne des
 *  sommets pencherait du côté où le contributeur en a posé le plus. */
export function centreDuContour(pts){
  let s = 0, cx = 0, cy = 0;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++){
    const f = pts[j][0] * pts[i][1] - pts[i][0] * pts[j][1];
    s += f;
    cx += (pts[j][0] + pts[i][0]) * f;
    cy += (pts[j][1] + pts[i][1]) * f;
  }
  return s ? [cx / (3 * s), cy / (3 * s)] : pts[0];
}

/** La direction dominante d'un contour, au quart de tour près — les façades
 *  d'un hall, comme `anglePlan` fait de ses allées. */
export function axeDuContour(pts){
  let sc = 0, ss = 0;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++){
    const dx = pts[i][0] - pts[j][0], dy = pts[i][1] - pts[j][1];
    const l = Math.hypot(dx, dy);
    if (l < 2) continue;               // un pan coupé ne dit rien de la façade
    const a = Math.atan2(dy, dx);
    /* Quadruplées, comme les allées du plan dans `anglePlan` : au quart de tour
       près, une direction fait alors le tour entier, et 89° se moyenne avec 1°
       au lieu de tomber à 45°. */
    sc += l * Math.cos(4 * a); ss += l * Math.sin(4 * a);
  }
  return (sc || ss) ? Math.atan2(ss, sc) / 4 : 0;
}
