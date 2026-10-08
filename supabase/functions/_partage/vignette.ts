/**
 * La clé d'une vignette de logo.
 *
 * Ce module portait aussi la fabrication, en WebAssembly. La plateforme
 * n'accorde pas assez de temps de calcul à une fonction pour décoder des
 * images : elle refusait l'appel avant même d'avoir décodé le premier logo.
 * La fabrication vit désormais dans le navigateur de l'exploitant — voir
 * `vignetteDeLogo` dans `outils/gabarit/_marque.html` —, et il ne reste ici
 * que la règle qui nomme le résultat.
 */

/**
 * L'empreinte d'une adresse, qui nomme sa vignette.
 *
 * Elle sert aussi de version dans l'adresse publique : le contenu ne peut pas
 * changer sans que l'empreinte change, et tout ce qui la garde — le relais, le
 * navigateur, le service worker — peut la garder pour toujours.
 *
 * Elle se calcule ici et non chez l'appelant : c'est la seule façon de garantir
 * qu'une vignette envoyée par la console et une vignette demandée par la page
 * portent le même nom.
 */
export async function cleDeVignette(source: string): Promise<string> {
  const octets = new TextEncoder().encode(source);
  const empreinte = await crypto.subtle.digest("SHA-256", octets);
  return [...new Uint8Array(empreinte).slice(0, 12)]
    .map((n) => n.toString(16).padStart(2, "0")).join("");
}

/** Une vignette en base64 : trois cents kilo-octets, cent fois la taille
 *  ordinaire d'un logo réduit. */
export const IMAGE_MAX = 300_000;

/** Les formats qu'un navigateur rend par `toBlob` : WebP d'ordinaire, PNG ou
 *  JPEG là où il ne sait pas encoder le WebP. Reconnus à leurs premiers octets,
 *  puisque l'image est servie sous un type d'image : du SVG ou du HTML n'a rien
 *  à faire dans cette table. */
export function imageReconnue(base64: string): boolean {
  if (base64.length > IMAGE_MAX || base64.length < 16) return false;
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) return false;
  let tete: Uint8Array;
  try {
    tete = Uint8Array.from(atob(base64.slice(0, 16)), (c) => c.charCodeAt(0));
  } catch (_e) {
    return false;
  }
  const texte = (de: number, a: number) => String.fromCharCode(...tete.slice(de, a));
  const webp = texte(0, 4) === "RIFF" && texte(8, 12) === "WEBP";
  const png = tete[0] === 0x89 && texte(1, 4) === "PNG";
  const jpeg = tete[0] === 0xff && tete[1] === 0xd8 && tete[2] === 0xff;
  return webp || png || jpeg;
}
