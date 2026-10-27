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
import { creeEvenement } from "./evenement.mjs";
import { IMAGE_SURE } from "./sur.mjs";
import { marquePrete } from "./marque.mjs";

/* Ce qui est arrivé, par clé : l'image elle-même, prête à poser. Le lot qui
   l'a apportée reste, lui, dans le cache du navigateur et du service — son
   adresse ne porte que des empreintes, il ne peut pas se périmer — si bien
   que la visite d'après ne redemande rien. */
export const VIGNETTES = new Map();

/* Le navigateur sait-il lire l'AVIF ? Les vignettes se fabriquent dans ce
   format depuis qu'il pèse moitié moins que le WebP ; les navigateurs qui
   l'ignorent — iOS d'avant la 16.4, Edge d'avant 2024 — prennent la WebP du
   même logo, que l'API publique donne à côté (`vignetteWebp`).

   Une image d'un pixel, essayée dès le chargement : la réponse arrive bien
   avant le plan. On présume qu'il sait tant qu'il n'a pas dit non — c'est
   presque toujours vrai — et un non tardif retouche les données déjà
   reçues. */
let avifLisible = true;
/** @type {any} */
let recues = null;
if (typeof Image !== "undefined"){
  const essai = new Image();
  essai.onerror = () => { avifLisible = false; if (recues) sansAvif(recues); };
  essai.src = "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABoAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACJtZGF0EgAKCBgABggQEDQgMgwYAAooooQAALASmpg=";
}

/** Chaque logo d'AVIF ramené à sa WebP, ou à son logo d'origine s'il n'en a
 *  pas : tout ce qui lit `vignette` lit alors ce que ce navigateur montre.
 *  L'API ne joint plus l'adresse d'origine à une AVIF seule (`plan-public`
 *  `avecVignette`) : ce navigateur n'a alors pas de logo, et le stand garde
 *  son nom. */
function sansAvif(/** @type {any} */ d){
  const ramene = (/** @type {any} */ x) => {
    if (!x || !("vignetteWebp" in x)) return;
    if (x.vignetteWebp) x.vignette = x.vignetteWebp;
    else delete x.vignette;
    delete x.vignetteWebp;
  };
  for (const p of (d && d.plans) || []){
    for (const s of p.stands || []){ ramene(s); (s.coex || []).forEach(ramene); }
  }
}

/** Les données du plan, à leur arrivée : avant l'index, pour que rien n'ait
 *  encore lu une clé que ce navigateur ne saurait montrer. */
export function vignettesLisibles(/** @type {any} */ d){
  recues = d;
  /* Une page à données figées porte ses vignettes avec elle — elle n'a pas
     d'API à qui les demander (la démonstration, `outils/demo.js`). Rangées
     comme celles d'un lot, et relues de même : seule une image que la page
     reconnaît y entre, et elle arrive recadrée — sans le dire, la fiche la
     relirait pour n'y rien trouver à retirer (`recherche.mjs` `chargeUnLot`). */
  for (const [cle, src] of Object.entries((d && d.vignettes) || {})){
    if (!IMAGE_SURE.test(String(src))) continue;
    VIGNETTES.set(cle, String(src));
    marquePrete(String(src));
  }
  if (!avifLisible) sansAvif(d);
}

/** Un lot de vignettes vient d'arriver : qui en attendait peut les poser. */
export const VIGNETTES_ARRIVEES = creeEvenement();

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
 *
 * « d=1 » ne dit rien au service — le relais ne transmet que les paramètres
 * qu'il connaît (`src/index.mjs` `amontPour`) — mais change l'adresse. La
 * grande a changé sous sa clé quand la synchronisation s'est mise à la
 * détourer, et l'ancienne, au fond blanc, se gardait sans fin au navigateur
 * et au service worker : sans ce paramètre, les visiteurs d'avant l'auraient
 * encore détourée eux-mêmes, aussi lentement qu'avant.
 */
export const adresseGrande = (/** @type {any} */ cle) =>
  API && /^[0-9a-f]{8,64}$/.test(String(cle || "")) ? API + "?grande=" + cle + "&d=1" : "";
