/**
 * La largeur d'une icône png en adresse de données, lue dans son en-tête.
 *
 * La console réduit l'icône d'une application à 384 ou 256 pixels quand elle
 * pèse trop (`outils/gabarit/modules/icone-app.mjs`), et le manifeste doit
 * annoncer la taille qu'elle a vraiment (`src/application.mjs`). On ne
 * décode que le début : la signature, la longueur et le nom du premier bloc
 * (IHDR), puis la largeur, aux octets 16 à 19.
 *
 * Rend null pour ce qui n'a pas la forme d'un png, ou une largeur absurde.
 */
const PREFIXE_PNG = "data:image/png;base64,";

export function largeurPng(src: string | null | undefined): number | null {
  if (!src || !src.startsWith(PREFIXE_PNG)) return null;
  let tete: string;
  try { tete = atob(src.slice(PREFIXE_PNG.length, PREFIXE_PNG.length + 32)); } catch { return null; }
  if (tete.length < 24 || tete.slice(12, 16) !== "IHDR") return null;
  const l = ((tete.charCodeAt(16) << 24) | (tete.charCodeAt(17) << 16) |
             (tete.charCodeAt(18) << 8) | tete.charCodeAt(19)) >>> 0;
  return l > 0 && l <= 4096 ? l : null;
}
