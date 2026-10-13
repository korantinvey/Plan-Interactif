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
 *
 * Une vignette AVIF a la sienne, distincte de celle de la WebP du même logo :
 * changer le contenu sous une clé gardée un an ne l'aurait fait arriver chez
 * personne. La WebP garde la clé d'avant — celles qui sont en base restent
 * justes, et les plans déjà gardés les citent encore.
 */
export async function cleDeVignette(
  source: string,
  format: "webp" | "avif" = "webp",
): Promise<string> {
  const octets = new TextEncoder().encode(format === "webp" ? source : format + ":" + source);
  const empreinte = await crypto.subtle.digest("SHA-256", octets);
  return [...new Uint8Array(empreinte).slice(0, 12)]
    .map((n) => n.toString(16).padStart(2, "0")).join("");
}

/* Ce qu'une demande à la base peut porter d'adresses, en signes. Le filtre
   `in` voyage dans l'adresse de la requête, et un intermédiaire refuse celle
   qui dépasse quelques dizaines de kilo-octets. Cinquante adresses tenaient
   largement avec les logos de Klipso ; celles d'Eventmaker sont signées et
   pèsent six cent soixante signes une fois encodées — cinquante faisaient
   trente-trois kilo-octets, la base ne répondait rien, et tout salon
   Eventmaker passait pour n'avoir aucune vignette. */
const SIGNES_PAR_TRANCHE = 6000;
const ADRESSES_PAR_TRANCHE = 50;

/**
 * Les adresses de logo, en tranches assez courtes pour tenir dans une
 * demande : jamais plus de cinquante, ni plus de six mille signes encodés.
 */
export function tranchesDAdresses(adresses: string[]): string[][] {
  const tranches: string[][] = [];
  let tranche: string[] = [], signes = 0;
  for (const a of adresses) {
    const n = encodeURIComponent(a).length + 3;   // les guillemets et la virgule
    if (tranche.length && (tranche.length >= ADRESSES_PAR_TRANCHE || signes + n > SIGNES_PAR_TRANCHE)) {
      tranches.push(tranche);
      tranche = [];
      signes = 0;
    }
    tranche.push(a);
    signes += n;
  }
  if (tranche.length) tranches.push(tranche);
  return tranches;
}
