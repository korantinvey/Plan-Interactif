/* ============================================================
   Les couleurs : d'une notation à l'autre, et ce que l'œil en perçoit
   ============================================================ */

/** Une teinte du cercle chromatique en hexadécimal, pour un sélecteur de
 *  couleur — qui ne connaît que cette notation. */
export function hslHex(h, s, l){
  s /= 100; l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => Math.round(255 *
    (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))));
  return "#" + [f(0), f(8), f(4)]
    .map(v => v.toString(16).padStart(2, "0")).join("");
}

/** Une couleur Klipso « rgb(r,g,b) » vers la notation attendue par le
 *  sélecteur de couleur. */
export const rgbHex = (s) => {
  const m = String(s || "").match(/\d+/g);
  if (!m || m.length < 3) return null;
  return "#" + m.slice(0, 3)
    .map((n) => Math.max(0, Math.min(255, +n)).toString(16).padStart(2, "0")).join("");
};

/** Un triplet [r, g, b] en hexadécimal. */
export const hexa = (v) => "#" + v.map(c => c.toString(16).padStart(2, "0")).join("");

/** Luminance relative d'un triplet, au sens du calcul de contraste : 0 pour le
 *  noir, 1 pour le blanc, en passant par la courbe de l'œil. */
export const luminance = (v) => [0.2126, 0.7152, 0.0722].reduce((a, poids, i) => {
  const s = v[i] / 255;
  return a + poids * (s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4));
}, 0);

/** Les trois composantes d'une couleur écrite « #rrggbb ». */
export const trio = (/** @type {any} */ hex) => {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || ""));
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [n >> 16 & 255, n >> 8 & 255, n & 255];
};

/** Deux couleurs mêlées, `t` disant combien on va de la première vers la
 *  seconde. Sert à décliner l'accent sans demander cinq teintes à
 *  l'exploitant : il en choisit une, le reste s'en déduit. */
export const melange = (/** @type {string} */ a, /** @type {string} */ b, /** @type {number} */ t) => {
  const x = trio(a), y = trio(b);
  return x && y ? hexa(x.map((c, i) => Math.round(c + (y[i] - c) * t))) : a;
};

/**
 * Écarte une couleur vers le noir ou vers le blanc, du côté où le contraste
 * gagne le plus. Le liseré d'une sélection se déduit ainsi de son aplat et
 * reste lisible dessus, quel que soit le ton choisi.
 *
 * Le sens ne se devine pas à la clarté seule : un bleu franc et un orange sont
 * tous deux à mi-hauteur, et pourtant l'un gagne à s'éclaircir quand l'autre
 * gagne à s'assombrir. On calcule les deux et on garde le meilleur.
 */
export const ecarte = (/** @type {string} */ hex) => {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || ""));
  if (!m) return hex;
  const n = parseInt(m[1], 16), v = [n >> 16 & 255, n >> 8 & 255, n & 255];
  /* 0,7 plutôt qu'une demi-teinte : le liseré borde l'aplat, mais le numéro du
     stand s'écrit dessus dans la même couleur, et un rapport de contraste de
     trois pour un ne se lit pas en petit. */
  const vers = (/** @type {number} */ but) => v.map(c => Math.round(c + (but - c) * 0.7));
  const base = luminance(v) + 0.05;
  const contraste = (/** @type {number[]} */ w) => { const a = luminance(w) + 0.05; return a > base ? a / base : base / a; };
  const sombre = vers(0), clair = vers(255);
  return hexa(contraste(sombre) >= contraste(clair) ? sombre : clair);
};

/**
 * Une teinte avivée — celle du survol et de la sélection d'une tuile : plus
 * saturée, et poussée vers le milieu de la clarté pour qu'une teinte pâle
 * fonce un peu et qu'une sombre s'éclaire. « assombrit » la descend encore,
 * pour un trait qui doit se lire sur elle. Rien pour une couleur sans teinte.
 * @param {number[]} c  rouge, vert, bleu (0-255), et l'opacité qu'on garde
 * @returns {number[] | null}
 */
export function avive(c, assombrit = 0){
  const [r, g, b] = [c[0] / 255, c[1] / 255, c[2] / 255];
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, e = max - min;
  if (e < .04) return null;
  const sat = e / (1 - Math.abs(2 * l - 1));
  let h = max === r ? ((g - b) / e) % 6 : max === g ? (b - r) / e + 2 : (r - g) / e + 4;
  h = (h * 60 + 360) % 360;
  const s2 = Math.min(1, sat * 1.35 + .12);
  const l2 = Math.max(.08, (l > .55 ? l - .1 : l + .08) - assombrit);
  const k2 = (1 - Math.abs(2 * l2 - 1)) * s2, x = k2 * (1 - Math.abs((h / 60) % 2 - 1)), m = l2 - k2 / 2;
  const [r2, g2, b2] = h < 60 ? [k2, x, 0] : h < 120 ? [x, k2, 0] : h < 180 ? [0, k2, x]
    : h < 240 ? [0, x, k2] : h < 300 ? [x, 0, k2] : [k2, 0, x];
  return [Math.round((r2 + m) * 255), Math.round((g2 + m) * 255), Math.round((b2 + m) * 255), c[3] ?? 255];
}
