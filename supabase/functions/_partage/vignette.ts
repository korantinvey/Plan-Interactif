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
