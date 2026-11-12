/* ============================================================
   Le SVG relu en nombres : transformations, tracés, couleurs

   Le rendu par la carte graphique (`webgl.mjs`) ne réécrit pas le plan : il
   relit le SVG caché et le repeint. Ce qu'il en lit passe par ici — une
   transformation devenue matrice, un tracé aplati en polylignes, une forme
   simple dite par ses points, une couleur calculée ramenée à quatre octets.

   Rien de tout cela ne tient au plan ni à la bibliothèque : ce sont des
   règles du SVG et de la feuille de style, qui se lisent et s'éprouvent
   seules.
   ============================================================ */
export const M_ID = [1, 0, 0, 1, 0, 0];
export const mulM = (m, n) => [m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1],
  m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3],
  m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]];
export const appM = (m, p) => [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]];
export const echelleM = m => Math.sqrt(Math.abs(m[0] * m[3] - m[1] * m[2]));

export function lisTransform(t){
  let m = M_ID;
  for (const [, nom, args] of t.matchAll(/(matrix|translate|scale|rotate|skewX|skewY)\s*\(([^)]*)\)/g)){
    const a = args.split(/[\s,]+/).filter(Boolean).map(Number);
    let n = M_ID;
    if (nom === "matrix") n = a.slice(0, 6);
    else if (nom === "translate") n = [1, 0, 0, 1, a[0] || 0, a[1] || 0];
    else if (nom === "scale") n = [a[0], 0, 0, a[1] === undefined ? a[0] : a[1], 0, 0];
    else if (nom === "rotate"){
      const r = (a[0] || 0) * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
      n = [c, s, -s, c, 0, 0];
      if (a.length >= 3) n = mulM(mulM([1, 0, 0, 1, a[1], a[2]], n), [1, 0, 0, 1, -a[1], -a[2]]);
    }
    else if (nom === "skewX") n = [1, 0, Math.tan(a[0] * Math.PI / 180), 1, 0, 0];
    else if (nom === "skewY") n = [1, Math.tan(a[0] * Math.PI / 180), 0, 1, 0, 0];
    m = mulM(m, n);
  }
  return m;
}

/** Un tracé en polylignes : droites telles quelles, courbes et arcs aplatis
 *  — assez finement pour qu'aucun zoom du plan n'en montre les facettes. */
export function lisTrace(d){
  const out = [];
  /** @type {{ pts: number[][], ferme: boolean } | null} */
  let cur = null;
  let x = 0, y = 0, x0 = 0, y0 = 0, cx = 0, cy = 0, prec = "";
  const jetons = d.match(/[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/g) || [];
  let i = 0, cmd = "";
  const nb = () => parseFloat(jetons[i++]);
  const pousse = (px, py) => { cur.pts.push([px, py]); };
  const debut = (px, py) => { cur = { pts: [[px, py]], ferme: false }; out.push(cur); };
  const courbe = (pts, n) => {
    for (let k = 1; k <= n; k++){
      const t = k / n, u = 1 - t;
      if (pts.length === 3) pousse(u * u * pts[0][0] + 2 * u * t * pts[1][0] + t * t * pts[2][0],
                                   u * u * pts[0][1] + 2 * u * t * pts[1][1] + t * t * pts[2][1]);
      else pousse(u * u * u * pts[0][0] + 3 * u * u * t * pts[1][0] + 3 * u * t * t * pts[2][0] + t * t * t * pts[3][0],
                  u * u * u * pts[0][1] + 3 * u * u * t * pts[1][1] + 3 * u * t * t * pts[2][1] + t * t * t * pts[3][1]);
    }
  };
  const arc = (rx, ry, rot, grand, sens, x2, y2) => {
    if (!rx || !ry){ pousse(x2, y2); return; }
    const phi = rot * Math.PI / 180, cp = Math.cos(phi), sp = Math.sin(phi);
    const dx = (x - x2) / 2, dy = (y - y2) / 2;
    const x1p = cp * dx + sp * dy, y1p = -sp * dx + cp * dy;
    rx = Math.abs(rx); ry = Math.abs(ry);
    const l = x1p * x1p / (rx * rx) + y1p * y1p / (ry * ry);
    if (l > 1){ rx *= Math.sqrt(l); ry *= Math.sqrt(l); }
    const sg = grand === sens ? -1 : 1;
    const num = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p;
    const co = sg * Math.sqrt(Math.max(0, num / (rx * rx * y1p * y1p + ry * ry * x1p * x1p)));
    const cxp = co * rx * y1p / ry, cyp = -co * ry * x1p / rx;
    const ccx = cp * cxp - sp * cyp + (x + x2) / 2, ccy = sp * cxp + cp * cyp + (y + y2) / 2;
    const ang = (ux, uy, vx, vy) => Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
    const t1 = ang(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry);
    let dt = ang((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry);
    if (!sens && dt > 0) dt -= 2 * Math.PI; else if (sens && dt < 0) dt += 2 * Math.PI;
    const n = Math.max(2, Math.ceil(Math.abs(dt) / (Math.PI / 18)));
    for (let k = 1; k <= n; k++){
      const t = t1 + dt * k / n;
      pousse(ccx + rx * Math.cos(t) * cp - ry * Math.sin(t) * sp, ccy + rx * Math.cos(t) * sp + ry * Math.sin(t) * cp);
    }
  };
  while (i < jetons.length){
    if (/[a-zA-Z]/.test(jetons[i])) cmd = jetons[i++];
    const rel = cmd === cmd.toLowerCase(), C = cmd.toUpperCase();
    const ox = rel ? x : 0, oy = rel ? y : 0;
    if (C === "Z"){ if (cur){ cur.ferme = true; x = x0; y = y0; } prec = C; cmd = ""; continue; }
    if (i >= jetons.length || /[a-zA-Z]/.test(jetons[i])){ i++; continue; }
    if (C === "M"){ x = ox + nb(); y = oy + nb(); x0 = x; y0 = y; debut(x, y); cmd = rel ? "l" : "L"; }
    else if (!cur){ debut(x, y); continue; }
    else if (C === "L"){ x = ox + nb(); y = oy + nb(); pousse(x, y); }
    else if (C === "H"){ x = ox + nb(); pousse(x, y); }
    else if (C === "V"){ y = oy + nb(); pousse(x, y); }
    else if (C === "C"){ const a = [ox + nb(), oy + nb()], b = [ox + nb(), oy + nb()], e = [ox + nb(), oy + nb()];
      courbe([[x, y], a, b, e], 12); cx = b[0]; cy = b[1]; x = e[0]; y = e[1]; }
    else if (C === "S"){ const a = prec === "C" || prec === "S" ? [2 * x - cx, 2 * y - cy] : [x, y];
      const b = [ox + nb(), oy + nb()], e = [ox + nb(), oy + nb()];
      courbe([[x, y], a, b, e], 12); cx = b[0]; cy = b[1]; x = e[0]; y = e[1]; }
    else if (C === "Q"){ const a = [ox + nb(), oy + nb()], e = [ox + nb(), oy + nb()];
      courbe([[x, y], a, e], 10); cx = a[0]; cy = a[1]; x = e[0]; y = e[1]; }
    else if (C === "T"){ const a = prec === "Q" || prec === "T" ? [2 * x - cx, 2 * y - cy] : [x, y];
      const e = [ox + nb(), oy + nb()]; courbe([[x, y], a, e], 10); cx = a[0]; cy = a[1]; x = e[0]; y = e[1]; }
    else if (C === "A"){ const rx = nb(), ry = nb(), rot = nb(), g = nb(), s = nb(), ex = ox + nb(), ey = oy + nb();
      arc(rx, ry, rot, g, s, ex, ey); x = ex; y = ey; }
    else { i++; }
    prec = C;
  }
  return out;
}

export const lisPoints = s => {
  const v = (s || "").trim().split(/[\s,]+/).map(Number);
  const pts = [];
  for (let k = 0; k + 1 < v.length; k += 2) pts.push([v[k], v[k + 1]]);
  return pts;
};
export const num = (el, a, d) => { const v = parseFloat(el.getAttribute(a)); return Number.isFinite(v) ? v : (d || 0); };

export function anneau(cx, cy, rx, ry, n){
  const pts = [];
  for (let k = 0; k < n; k++){ const t = 2 * Math.PI * k / n; pts.push([cx + rx * Math.cos(t), cy + ry * Math.sin(t)]); }
  return pts;
}

export function rectArrondi(x, y, w, h, rx, ry){
  if (!(rx > 0) && !(ry > 0)) return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
  rx = Math.min(rx > 0 ? rx : ry, w / 2); ry = Math.min(ry > 0 ? ry : rx, h / 2);
  const pts = [], coin = (cx, cy, a0) => { for (let k = 0; k <= 6; k++){ const t = a0 + Math.PI / 2 * k / 6; pts.push([cx + rx * Math.cos(t), cy + ry * Math.sin(t)]); } };
  coin(x + w - rx, y + ry, -Math.PI / 2); coin(x + w - rx, y + h - ry, 0);
  coin(x + rx, y + h - ry, Math.PI / 2); coin(x + rx, y + ry, Math.PI);
  return pts;
}

/* Les sous-tracés d'une forme ne sont pas des formes à part : un pictogramme
   est un aplat percé de sa silhouette, et les remplir chacun pour soi donnait
   un carré blanc à la place de l'ascenseur. Chaque anneau se range dans le
   plus petit qui le contient ; à profondeur impaire, c'est un trou. */
export function avecTrous(anneaux){
  if (anneaux.length < 2) return anneaux.map(a => [a]);
  const aire = a => { let t = 0; for (let i = 0, j = a.length - 1; i < a.length; j = i++) t += (a[j][0] + a[i][0]) * (a[j][1] - a[i][1]); return Math.abs(t / 2); };
  const dedans = (p, a) => { let c = false;
    for (let i = 0, j = a.length - 1; i < a.length; j = i++){
      const xi = a[i][0], yi = a[i][1], xj = a[j][0], yj = a[j][1];
      if ((yi > p[1]) !== (yj > p[1]) && p[0] < (xj - xi) * (p[1] - yi) / (yj - yi) + xi) c = !c;
    }
    return c; };
  const tri = anneaux.map(a => ({ a, aire: aire(a), parent: null, prof: 0 })).sort((x, y) => y.aire - x.aire);
  for (let i = 0; i < tri.length; i++)
    for (let j = i - 1; j >= 0; j--)
      if (dedans(tri[i].a[0], tri[j].a)){ tri[i].parent = tri[j]; tri[i].prof = tri[j].prof + 1; break; }
  const polys = new Map();
  for (const t of tri){
    if (t.prof % 2 === 0) polys.set(t, [t.a]);
    else if (polys.has(t.parent)) polys.get(t.parent).push(t.a);
  }
  return [...polys.values()];
}

/* Les couleurs calculées ne parlent pas toutes la même langue — rgb(),
   color-mix(), oklch() selon ce que la feuille de style a écrit. Un pixel
   peint puis relu les ramène toutes à quatre octets. */
const _coulCtx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
const _coul = new Map();
export function couleurGl(v, alpha){
  if (!v || v === "none" || v.startsWith("url(")) return null;
  let c = _coul.get(v);
  if (!c){
    _coulCtx.clearRect(0, 0, 1, 1);
    _coulCtx.fillStyle = "rgba(0,0,0,0)"; _coulCtx.fillStyle = v;
    _coulCtx.fillRect(0, 0, 1, 1);
    const d = _coulCtx.getImageData(0, 0, 1, 1).data;
    c = [d[0], d[1], d[2], d[3] / 255];
    _coul.set(v, c);
  }
  const a = Math.round(255 * c[3] * alpha);
  return a > 0 ? [c[0], c[1], c[2], a] : null;
}
