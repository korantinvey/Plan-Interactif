/* ============================================================
   La forme d'un emplacement — anneaux, tracé, empreinte, ancrage du nom

   Ce que la synchronisation calcule côté serveur (`supabase/functions/
   _partage/geometrie.ts`), refait côté page pour un emplacement repris ou
   ajouté à la main : la même règle des deux côtés, parce que le rendu n'en
   connaît qu'une. `outils/essais/forme.js` vérifie qu'elles tombent d'accord.

   Rien de la page ici : des tracés et des points en entrée, des nombres en
   sortie. `_geometrie.html` s'en sert pour éditer, et pour poser ce qu'on a
   retouché.
   ============================================================ */

export const arrondiGeo = (n) => Math.round(n * 100) / 100;

/**
 * L'empreinte de la géométrie servie par la source.
 *
 * Un condensé plutôt que le tracé lui-même : le tracé d'une zone fait
 * plusieurs centaines de caractères, et le garder en double dans la
 * configuration ferait payer à chaque visiteur une chaîne qui ne dessine
 * rien. Ce qu'on lui demande est d'ailleurs plus étroit — non pas redire la
 * forme, mais répondre « a-t-elle bougé ? ».
 */
export function empreinteGeo(g){
  const t = String((g && g.d) || "");
  let h = 0x811c9dc5;
  for (let i = 0; i < t.length; i++) h = Math.imul(h ^ t.charCodeAt(i), 16777619) >>> 0;
  return t.length.toString(36) + "-" + h.toString(36);
}

/* ------------------------------------------------------------
   Anneaux et tracé

   La source rend un polygone — un anneau, parfois plusieurs pour un stand en
   deux morceaux — et le sert en tracé SVG. On refait le chemin inverse pour
   l'éditer, puis celui-là pour l'afficher : mêmes conventions qu'à la
   synchronisation (« _partage/geometrie.ts »), sans quoi la forme reprise ne
   se lirait pas comme celle qu'on reprend.
   ------------------------------------------------------------ */

/** Le tracé « M x y L x y … Z » découpé en anneaux. Le sommet de fermeture,
 *  que le relevé répète, est retiré : il ferait une poignée posée sur une
 *  autre, et l'on tirerait l'une en croyant tenir l'autre. */
export function anneauxGeo(d){
  const out = [];
  for (const bout of String(d || "").split("M")){
    const n = bout.match(/-?\d*\.?\d+/g) || [];
    const a = [];
    for (let i = 0; i + 1 < n.length; i += 2) a.push([+n[i], +n[i + 1]]);
    const f = a.length;
    if (f > 1 && a[0][0] === a[f - 1][0] && a[0][1] === a[f - 1][1]) a.pop();
    if (a.length > 2) out.push(a);
  }
  return out;
}

export const traceGeo = (a) =>
  a.map(r => "M" + r.map(p => p[0] + " " + p[1]).join("L") + "Z").join("");

/** La boîte englobante d'un jeu d'anneaux : [x0, y0, x1, y1]. */
export function boiteAnneaux(a){
  const pts = a.flat();
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  return [Math.min.apply(null, xs), Math.min.apply(null, ys),
          Math.max.apply(null, xs), Math.max.apply(null, ys)];
}

/* ------------------------------------------------------------
   Où écrire le nom, et de quelle place on dispose

   Ce qui suit refait, côté page, ce que la synchronisation calcule dans
   « _partage/geometrie.ts » : l'ancrage intérieur d'une forme découpée et la
   place réellement libre autour de lui. La même règle des deux côtés, parce
   que le rendu, lui, n'en connaît qu'une — un stand repris à la main doit
   écrire son nom là où il l'écrirait s'il venait ainsi de la source.
   ------------------------------------------------------------ */

/** Appartenance d'un point à un anneau, par lancer de rayon. */
export function dansAnneau(pt, anneau){
  let ok = false;
  for (let i = 0, j = anneau.length - 1; i < anneau.length; j = i++){
    const a = anneau[i], b = anneau[j];
    if ((a[1] > pt[1]) !== (b[1] > pt[1]) &&
        pt[0] < ((b[0] - a[0]) * (pt[1] - a[1])) / (b[1] - a[1]) + a[0]) ok = !ok;
  }
  return ok;
}

/** Distance d'un point à un segment. */
export function distSegmentGeo(p, a, b){
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const l = dx * dx + dy * dy;
  let t = l ? ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}

/** Distance au bord, négative à l'extérieur : c'est ce qu'on maximise. */
function distBordGeo(p, a){
  let d = Infinity;
  for (const anneau of a)
    for (let i = 0, j = anneau.length - 1; i < anneau.length; j = i++)
      d = Math.min(d, distSegmentGeo(p, anneau[j], anneau[i]));
  return dansAnneau(p, a[0]) ? d : -d;
}

/** Le point intérieur le plus éloigné des bords, par une grille qu'on
 *  resserre autour du meilleur candidat. */
function poleGeo(a, x0, y0, x1, y1){
  let cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  let meilleur = distBordGeo([cx, cy], a);
  let dx = (x1 - x0) / 2, dy = (y1 - y0) / 2;
  for (let passe = 0; passe < 6; passe++){
    const px = dx / 4, py = dy / 4;
    for (let i = -2; i <= 2; i++)
      for (let j = -2; j <= 2; j++){
        if (!i && !j) continue;
        const p = [cx + i * px, cy + j * py];
        const d = distBordGeo(p, a);
        if (d > meilleur){ meilleur = d; cx = p[0]; cy = p[1]; }
      }
    dx /= 2; dy /= 2;
  }
  return [cx, cy];
}

/** Jusqu'où l'on peut aller depuis un point dans une direction, sans sortir. */
function porteeGeo(p, a, ux, uy, max){
  const pas = max / 24;
  let d = 0;
  while (d + pas <= max && dansAnneau([p[0] + (d + pas) * ux, p[1] + (d + pas) * uy], a[0])) d += pas;
  return d;
}

/** Le centre, la place, et l'ancrage du libellé quand le centre n'en est pas un. */
export function boiteGeo(a){
  const [x0, y0, x1, y1] = boiteAnneaux(a);
  const c = [arrondiGeo((x0 + x1) / 2), arrondiGeo((y0 + y1) / 2)];
  const bb = [arrondiGeo(x1 - x0), arrondiGeo(y1 - y0)];

  /* Un rectangle n'a rien à corriger : son centre est déjà le meilleur
     ancrage, et sa boîte englobante décrit exactement sa place. */
  if (a.length === 1 && a[0].length <= 4 && dansAnneau(c, a[0])) return { c: c, bb: bb };

  const p = poleGeo(a, x0, y0, x1, y1);
  const g = porteeGeo(p, a, -1, 0, bb[0]), d = porteeGeo(p, a, 1, 0, bb[0]);
  const h = porteeGeo(p, a, 0, -1, bb[1]), b = porteeGeo(p, a, 0, 1, bb[1]);
  const lc = [arrondiGeo(p[0] + (d - g) / 2), arrondiGeo(p[1] + (b - h) / 2)];
  const lb = [arrondiGeo(Math.min(g + d, bb[0])), arrondiGeo(Math.min(h + b, bb[1]))];
  // en deçà d'un cinquième de la boîte, la mesure n'est pas fiable : on renonce
  return lb[0] > bb[0] / 5 && lb[1] > bb[1] / 5
    ? { c: c, bb: bb, lc: lc, lb: lb } : { c: c, bb: bb };
}
