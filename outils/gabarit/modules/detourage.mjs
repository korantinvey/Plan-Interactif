/* ============================================================
   Le détourage d'un logo — son fond blanc retiré, pixel par pixel

   Le logo d'un stand s'imprime sur son toit, sans plaque ni bord
   (`logos-stands.mjs`) : le fond blanc que la plupart des vignettes portent
   doit disparaître, et rien d'autre. Ce module ne fait que ce tri, sur les
   octets RGBA d'une image, sans toile ni page : la toile reste à
   `logos-stands.mjs`, et le tri s'éprouve seul dans Node
   (`outils/essais/detourage.js`), sur des logos dessinés au pixel près.
   ============================================================ */

/* Un pixel compte pour du fond au-dessus de ce clair, et s'efface tout à fait
   au-dessus du second ; entre les deux, il s'estompe, pour que le contour du
   logo ne crénelle pas. */
const CLAIR_FOND = 225, BLANC_FOND = 245;

/* Un creux est du fond si les trois quarts du trait qui l'enclôt sont à moins
   de cette part du petit côté du logo — une épaisseur de trait — du fond
   retiré. */
const TRAIT = .12;

/* Ou si ce trait n'est pas plus épais que le creux lui-même n'est large : l'œil
   d'un « p » gras, sur un logo long et bas où le petit côté donne un seuil
   trop mince. Un texte blanc posé sur un aplat ne passe pas pour autant : ses
   lettres sont plus fines que la marge d'aplat qui les sépare du dehors. */
const PART_CREUX = 1;

/* Le seuil tiré du petit côté ne vaut que pour un creux trapu — l'œil d'une
   lettre, plus large ici que le tiers de sa longueur. Une lettre blanche,
   longue et fine, posée dans un bandeau mince en serait enclose d'aussi
   près : elle n'est retirée que si le bandeau est plus mince qu'elle. */
const TRAPU = .35;

/**
 * Retire le fond d'un logo, en place.
 *
 * Trois passes. Le clair qui touche le pourtour, de proche en proche, est du
 * fond ; puis les creux qu'un trait mince sépare de lui (`creux`) ; puis le
 * liseré, où la couleur du logo se mêlait au blanc. Un logo déjà détouré n'a
 * rien de clair au bord, et passe tel quel.
 *
 * @param {Uint8ClampedArray} px les octets RGBA
 * @param {number} w
 * @param {number} h
 */
export function detoure(px, w, h){
  const clarte = (/** @type {number} */ k) => px[k * 4 + 3] < 16 ? 255 : Math.min(px[k * 4], px[k * 4 + 1], px[k * 4 + 2]);
  const vu = new Uint8Array(w * h), file = [];
  for (let x = 0; x < w; x++) file.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y++) file.push(y * w, y * w + w - 1);
  while (file.length){
    const k = /** @type {number} */ (file.pop());
    if (vu[k]) continue;
    vu[k] = 1;
    const c = clarte(k);
    if (c < CLAIR_FOND) continue;
    // le fond s'efface, son liseré s'estompe
    px[k * 4 + 3] = Math.round(px[k * 4 + 3] * Math.max(0, Math.min(1, (BLANC_FOND - c) / (BLANC_FOND - CLAIR_FOND))));
    const x = k % w;
    if (x > 0) file.push(k - 1);
    if (x < w - 1) file.push(k + 1);
    if (k >= w) file.push(k - w);
    if (k < w * (h - 1)) file.push(k + w);
  }
  /* Un creux retiré rapproche du fond ceux qu'il enclôt : les lettres posées
     dans un cadre n'ont de distance qu'une fois le dedans du cadre retiré. On
     remesure donc tant qu'un tour en retire, en bornant les tours — chacun
     reparcourt l'image entière. */
  for (let tour = 0; tour < 4 && creux(px, vu, w, h, clarte); tour++);
  /* Le bord. Un pixel du contour mêle la couleur du logo au blanc du fond :
     laissé tel quel, il dessinait un liseré clair et crénelé sur le toit. On
     défait ce mélange — sa part de blanc devient de la transparence, et sa
     couleur redevient celle du logo, que le plus foncé de ses voisins dit —,
     sur deux pixels de profondeur. */
  const fond = (/** @type {number} */ k) => vu[k] === 1 && px[k * 4 + 3] < 255 * .5;
  // seuls les pixels à deux pas du fond au plus : sur un logo d'origine, tous
  // les parcourir avec leurs vingt-cinq voisins figeait la page
  const bord = new Uint8Array(w * h);
  for (let k = 0; k < w * h; k++){
    if (!fond(k)) continue;
    const x0 = k % w, y0 = (k - x0) / w;
    // un fond qui ne touche pas le logo n'a pas de bord autour de lui
    if (!((x0 > 0 && !fond(k - 1)) || (x0 < w - 1 && !fond(k + 1)) ||
      (y0 > 0 && !fond(k - w)) || (y0 < h - 1 && !fond(k + w)))) continue;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++){
      const xx = x0 + dx, yy = y0 + dy;
      if (xx >= 0 && yy >= 0 && xx < w && yy < h) bord[yy * w + xx] = 1;
    }
  }
  for (let k = 0; k < w * h; k++){
    if (!bord[k] || fond(k)) continue;
    const x = k % w, y = (k - x) / w;
    let pres = false, encre = 255;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++){
      const xx = x + dx, yy = y + dy;
      if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
      const kk = yy * w + xx;
      if (fond(kk)){ pres = true; continue; }
      const m = Math.min(px[kk * 4], px[kk * 4 + 1], px[kk * 4 + 2]);
      if (m < encre) encre = m;
    }
    if (!pres || encre > 235) continue;
    const m = Math.min(px[k * 4], px[k * 4 + 1], px[k * 4 + 2]);
    const a = Math.max(0, Math.min(1, (255 - m) / (255 - encre)));
    if (a >= 1) continue;
    for (let c = 0; c < 3; c++)
      px[k * 4 + c] = a > .02 ? Math.max(0, Math.min(255, Math.round((px[k * 4 + c] - (1 - a) * 255) / a))) : px[k * 4 + c];
    px[k * 4 + 3] = Math.round(px[k * 4 + 3] * a);
  }
}

/**
 * Les creux. Le fond ne se retire que de proche en proche depuis le
 * pourtour : l'œil d'un « a », d'un « e », d'un « A » n'y touche pas, ni le
 * dedans d'un logo encadré d'un filet, et ils restaient blancs sur le toit
 * coloré. Un clair enclos est donc du fond aussi quand le trait qui l'enclôt
 * est mince — le contour de la lettre, le filet du cadre.
 *
 * Ce trait se mesure depuis le dehors : la distance de chaque pixel du logo au
 * fond retiré, en ne passant que par le logo. Une lettre posée dans un cadre
 * n'est reliée au dehors par aucun trait : elle n'a pas de distance, et ne
 * compte pas — une première mesure qui passait aussi par les clairs la
 * comptait, loin du bord, et gardait blanc le dedans du cadre. Le blanc d'un
 * texte posé sur un aplat, lui, est enclos par l'aplat entier, loin du bord :
 * il reste.
 *
 * Rend le nombre de pixels retirés, pour que `detoure` sache s'il faut
 * remesurer.
 *
 * @param {Uint8ClampedArray} px
 * @param {Uint8Array} vu le fond déjà parcouru depuis le pourtour
 * @param {number} w
 * @param {number} h
 * @param {(k: number) => number} clarte
 */
function creux(px, vu, w, h, clarte){
  const n = w * h, clair = (/** @type {number} */ k) => clarte(k) >= CLAIR_FOND;
  const voisins = (/** @type {number} */ k) => {
    const x = k % w;
    return [x > 0 ? k - 1 : -1, x < w - 1 ? k + 1 : -1, k >= w ? k - w : -1, k < n - w ? k + w : -1];
  };
  // la distance au fond retiré de chaque pixel du logo, par le logo seul
  const dist = new Int32Array(n).fill(-1), file = new Int32Array(n);
  let debut = 0, fin = 0;
  for (let k = 0; k < n; k++) if (vu[k] && clair(k)){ dist[k] = 0; file[fin++] = k; }
  if (!fin) return 0;
  while (debut < fin){
    const k = file[debut++], d = dist[k] + 1;
    for (const kk of voisins(k)){
      if (kk < 0 || dist[kk] >= 0 || clair(kk)) continue;
      dist[kk] = d; file[fin++] = kk;
    }
  }
  const seuil = Math.max(2, Math.round(TRAIT * Math.min(w, h)));
  const range = new Uint8Array(n);
  let retires = 0;
  for (let k0 = 0; k0 < n; k0++){
    if (vu[k0] || range[k0] || !clair(k0)) continue;
    // le creux entier, et la distance au fond du trait qui l'enclôt
    const siens = [k0], trait = [];
    range[k0] = 1;
    for (let i = 0; i < siens.length; i++){
      for (const kk of voisins(siens[i])){
        if (kk < 0) continue;
        if (!clair(kk)){ if (dist[kk] > 0) trait.push(dist[kk]); continue; }
        if (!vu[kk] && !range[kk]){ range[kk] = 1; siens.push(kk); }
      }
    }
    if (!trait.length) continue;
    trait.sort((a, b) => a - b);
    const epais = trait[Math.floor(trait.length * .75)];
    const large = largeur(siens, voisins);
    if (epais > PART_CREUX * large && (epais > seuil || large < TRAPU * longueur(siens, w))) continue;
    retires += siens.length;
    for (const k of siens){
      px[k * 4 + 3] = Math.round(px[k * 4 + 3] * Math.max(0, Math.min(1, (BLANC_FOND - clarte(k)) / (BLANC_FOND - CLAIR_FOND))));
      vu[k] = 1;
    }
  }
  return retires;
}

/**
 * La largeur d'un creux : deux fois la distance à son bord de son pixel le
 * plus enfoncé — le diamètre de l'œil d'une lettre, l'épaisseur d'une lettre
 * blanche.
 *
 * @param {number[]} siens les pixels du creux
 * @param {(k: number) => number[]} voisins
 */
function largeur(siens, voisins){
  // à la taille du creux, non de l'image : un logo en compte parfois des centaines
  const prof = new Map(siens.map(k => [k, 0])), file = [];
  for (const k of siens)
    if (voisins(k).some(kk => !prof.has(kk))){ prof.set(k, 1); file.push(k); }
  let p = 0;
  for (let i = 0; i < file.length; i++){
    const k = file[i];
    p = /** @type {number} */ (prof.get(k));
    for (const kk of voisins(k)) if (prof.get(kk) === 0){ prof.set(kk, p + 1); file.push(kk); }
  }
  return 2 * p;
}

/**
 * La longueur d'un creux : le grand côté du rectangle qui l'enclôt.
 *
 * @param {number[]} siens
 * @param {number} w la largeur de l'image
 */
function longueur(siens, w){
  let x0 = Infinity, x1 = -1, y0 = Infinity, y1 = -1;
  for (const k of siens){
    const x = k % w, y = (k - x) / w;
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
  }
  return Math.max(x1 - x0, y1 - y0) + 1;
}
