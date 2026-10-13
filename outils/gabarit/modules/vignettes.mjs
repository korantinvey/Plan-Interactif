/* ============================================================
   Les vignettes des logos — ce qui est arrivé, et où le demander

   La recherche les précharge par lots (`recherche.mjs`
   `prechargeLesVignettes`), la fiche les montre, et la vue immersive en fait
   des plaques sur le toit des stands (`logos-stands.mjs`). Ce dernier lecteur
   est peint par la carte graphique, que la recherche atteint déjà : la
   réserve des vignettes sort donc de la recherche, pour que tous la lisent
   sans boucle d'imports.
   ============================================================ */
import { API } from "./salon.mjs";
import { creeAnnonce } from "./annonce.mjs";

/* Ce qui est arrivé, par clé : l'image elle-même, prête à poser. Le lot qui
   l'a apportée reste, lui, dans le cache du navigateur et du service — son
   adresse ne porte que des empreintes, il ne peut pas se périmer — si bien
   que la visite d'après ne redemande rien. */
export const VIGNETTES = new Map();

/** Un lot de vignettes vient d'arriver : qui en attendait peut les poser. */
export const VIGNETTES_ARRIVEES = creeAnnonce();

/**
 * L'adresse d'une vignette fabriquée à la synchronisation.
 *
 * Elle est servie par notre propre API, nommée par l'empreinte de l'adresse
 * d'origine — donc immuable, gardée sans limite par le relais, le navigateur
 * et le service worker. Le préchargement l'a le plus souvent déjà reçue par
 * lot : on rend alors ses octets, et il n'y a plus d'adresse du tout. Recadrée et réduite là-bas, elle pèse trois
 * kilo-octets au lieu de cent cinquante, et n'a plus rien à faire décoder ni
 * analyser ici.
 *
 * Elle ne dit rien de plus que le logo public qu'elle montre : aucun slug ne
 * l'accompagne, et la même vignette sert les salons qui partagent l'enseigne.
 */
export const adresseVignette = (/** @type {any} */ cle) =>
  /* Déjà reçue par lot : ce sont ses octets qu'on rend, et la fiche n'a plus
     rien à demander. Sinon son adresse, qui vaut pour celle qu'on n'a pas
     encore — le lot peut n'être pas arrivé, ou ne jamais partir. */
  VIGNETTES.get(cle) ||
  (API && /^[0-9a-f]{8,64}$/.test(String(cle || ""))
    ? API + "?vignette=" + cle
    : "");

/**
 * L'adresse de la grande vignette d'un logo, que seuls les toits vus de près
 * demandent (`logos-stands.mjs`). Sous la même clé que la petite, aussi
 * immuable qu'elle ; rien sans API — la démonstration n'a que ses petites.
 */
export const adresseGrande = (/** @type {any} */ cle) =>
  API && /^[0-9a-f]{8,64}$/.test(String(cle || "")) ? API + "?grande=" + cle : "";
