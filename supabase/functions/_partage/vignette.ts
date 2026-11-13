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
 * L'empreinte d'une vignette, qui la nomme.
 *
 * Elle sert aussi de version dans l'adresse publique, que le relais, le
 * navigateur et le service worker gardent un an : le contenu ne doit donc pas
 * pouvoir changer sans qu'elle change. Tirée de la seule adresse d'origine,
 * elle restait la même quand la vignette était refaite — une grande
 * re-détourée, un logo changé chez la source sous la même adresse — et la
 * nouvelle image n'arrivait chez personne. Elle se tire donc aussi des octets
 * de la vignette et de sa grande. L'adresse y reste : deux exposants au même
 * logo ont chacun leur ligne, que la mise à jour de l'un ne retire pas à
 * l'autre.
 *
 * Elle se calcule ici et non chez l'appelant : c'est la fonction
 * `vignettes` qui la pose, et la page ne fait que la relire dans le plan.
 *
 * Les clés d'avant, tirées de l'adresse seule, restent justes pour les lignes
 * qui les portent : une clé n'a qu'à être unique et changer avec le contenu.
 */
export async function cleDeVignette(
  source: string,
  format: "webp" | "avif",
  image: string,
  grande = "",
): Promise<string> {
  const octets = new TextEncoder().encode([format, source, image, grande].join("\n"));
  const empreinte = await crypto.subtle.digest("SHA-256", octets);
  return [...new Uint8Array(empreinte).slice(0, 12)]
    .map((n) => n.toString(16).padStart(2, "0")).join("");
}
