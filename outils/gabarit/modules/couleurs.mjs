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
