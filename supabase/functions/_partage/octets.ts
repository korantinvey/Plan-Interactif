/**
 * Les octets d'une image rangée en base64.
 *
 * Deux lignes, dans un fichier à elles : le module qui fabrique les vignettes
 * charge cinq codecs WebAssembly dès qu'on l'importe, et l'API publique n'a
 * besoin que de cette conversion-là pour rendre une vignette déjà faite. Les
 * garder ensemble faisait démarrer des mégaoctets de codecs à chaque
 * réveil de la fonction qui sert le plan à tous les visiteurs.
 */

/** Un tampon, que la réponse prend pour corps sans le recopier. */
export function octetsDeVignette(base64: string): ArrayBuffer {
  const brut = atob(base64);
  const tampon = new ArrayBuffer(brut.length);
  const out = new Uint8Array(tampon);
  for (let i = 0; i < brut.length; i++) out[i] = brut.charCodeAt(i);
  return tampon;
}
