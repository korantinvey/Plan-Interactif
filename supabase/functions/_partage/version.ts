/**
 * La version du fond d'un pavillon.
 *
 * Le fond est servi sous une adresse déclarée immuable : le navigateur la garde
 * un an sans jamais revenir demander, le relais un mois. Cette version est donc
 * la seule chose qui puisse dire « ce n'est plus le même dessin » — et elle doit
 * le dire dans les deux sens, sans se tromper ni d'un côté ni de l'autre :
 *
 *   — elle change dès qu'un calque est ajouté, retiré, renommé, réordonné, ou
 *     que son dessin bouge d'un octet ;
 *   — elle ne change pas quand rien de ce qui est servi ne change, sans quoi
 *     chaque synchronisation ferait retélécharger un fond identique.
 *
 * Elle tient à trois choses, et à rien d'autre : l'empreinte de chaque dessin,
 * que la base calcule elle-même ; ce que l'apparence masque, pour un visiteur
 * qui ne reçoit que le montré ; et le format de découpe de la fonction qui sert.
 *
 * Le condensé est tronqué à huit octets. Ce n'est pas un secret à garder, c'est
 * un état à distinguer : soixante-quatre bits laissent une chance sur cinq
 * milliards de milliards qu'un changement passe inaperçu.
 */

/* À incrémenter quand la façon de découper le fond change : deux versions de la
   fonction ne rendent pas le même dessin des mêmes données. C'est le seul geste
   qui force le retéléchargement de tous les fonds, de tous les salons. */
export const FORMAT_FOND = "1";

export interface CalqueVersionne {
  cle: string;
  ordre_klipso?: number | null;
  empreinte?: string | null;
}

/**
 * @param calques  les calques porteurs d'un dessin, dans n'importe quel ordre
 * @param masques  les clés que l'apparence masque, ou `null` pour l'exploitant,
 *                 qui reçoit le fond entier et n'a donc pas à le retélécharger
 *                 chaque fois qu'il essaie un réglage
 */
export async function versionFond(
  calques: CalqueVersionne[],
  masques: Record<string, boolean> | null,
): Promise<string> {
  /* Un calque tient dans sa ligne par tout ce qui le distingue : son rang, son
     nom, son dessin. Les lignes sont triées, et non pas prises dans l'ordre où
     la base les rend — cet ordre-là n'est garanti nulle part, et la version
     doit être la même à chaque appel. */
  const lignes = calques
    .map((c) => [c.ordre_klipso ?? "", c.cle, c.empreinte ?? "?"].join(":"))
    .sort();

  /* Seul le masquage change les octets envoyés : une couleur ou un ordre de
     pile se règlent dans la page, sur un dessin qu'elle a déjà. */
  if (masques) {
    lignes.push("masqués:" + Object.keys(masques).filter((k) => masques[k]).sort().join(","));
  }

  return FORMAT_FOND + "-" + await condense(FORMAT_FOND + "|" + lignes.join("|"));
}

async function condense(texte: string): Promise<string> {
  const octets = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texte));
  return [...new Uint8Array(octets)].slice(0, 8)
    .map((n) => n.toString(16).padStart(2, "0")).join("");
}
