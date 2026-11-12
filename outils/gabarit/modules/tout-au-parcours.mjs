/* ============================================================
   Tout ce que la recherche a retenu, versé d'un coup au parcours

   Le bouton posé au pied du panneau des critères (`recherche.mjs`
   `remplitCriteres`). Il vit à part du tiroir du parcours, qui importe la
   recherche : la recherche l'importe ici sans boucle, et le lot passe par la
   liste (`parcours.mjs` `verseAuParcours`), qui annonce au tiroir de
   s'ouvrir sur ce qui vient d'arriver.
   ============================================================ */
import { DATA, TOUS, HEBERGES, CONFERENCES } from "./donnees.mjs";
import { ouvreModale } from "./fenetre.mjs";
import { conf } from "./configuration.mjs";
import { filtre, visible } from "./filtre.mjs";
import { dansParcours, contenuParcours, SIGNET, verseAuParcours } from "./parcours.mjs";

/* D'où viennent les rangs pris en bloc. Le canal existait déjà pour les fiches
   ouvertes depuis la liste des résultats : un ajout venu de là raconte la même
   chose, et n'avait pas besoin d'un mot de plus au vocabulaire mesuré. */
const CANAL_RECHERCHE = "recherche";

/**
 * Ce que le filtre retient, et qui n'est pas déjà dans la liste.
 *
 * Le périmètre est celui de la colonne des résultats, aux deux sortes près
 * qu'un parcours ne sait pas porter : une zone ne s'y retient que par les
 * conférences qu'elle abrite, et un repère n'est pas un rendez-vous. Une
 * société hébergée, elle, y entre sous l'emplacement où on la trouvera — c'est
 * déjà ce que fait le signet de sa fiche, et deux hébergées d'un même stand
 * n'ont donc qu'un rang à elles deux.
 *
 * Sans mot-clé ni critère, il n'y a pas de filtre à reprendre : le salon entier
 * n'est pas un parcours de visite, et la fonction ne rend rien plutôt que de le
 * proposer.
 */
function retenusPourParcours(){
  if (!DATA || !filtre()) return { stands: [], confs: [] };
  const vus = new Set(), stands = [];
  TOUS.concat(HEBERGES).forEach(o => {
    if (o.kind === "zone" || !visible(o)) return;
    const id = String(o.id);
    if (vus.has(id)) return;
    vus.add(id);
    if (!dansParcours("stand", id)) stands.push(id);
  });
  /* Une conférence ne répond qu'au mot-clé — les critères décrivent une société
     et n'ont rien à lui opposer —, ce dont « visible » se charge déjà. */
  const confs = CONFERENCES.filter(c => visible(c) && !dansParcours("conf", c.id))
    .map(c => String(c.id));
  return { stands: stands, confs: confs };
}

/**
 * La fenêtre qui demande avant de verser.
 *
 * Un parcours composé signet par signet ne se voit pas doubler de vingt rangs
 * sans qu'on l'ait dit : le compte est annoncé avant. « Annuler » referme, et
 * l'on retrouve derrière le panneau des critères tel qu'on l'avait laissé — il
 * est déplié dans la colonne, cette fenêtre-ci ne lui a jamais pris sa place.
 */
function ajouteToutAuParcours(){
  const r = retenusPourParcours();
  if (!r.stands.length && !r.confs.length) return;
  ouvreModale("Ajouter à mon parcours", corps => {
    const p = document.createElement("p");
    p.textContent = "Ajouter " + contenuParcours(r.stands.length, r.confs.length) +
      " à votre parcours de visite ?";
    corps.appendChild(p);
  }, [
    { libelle: "Annuler" },
    { libelle: "Ajouter", genre: "accent",
      action: () => verseAuParcours(r.stands, r.confs, CANAL_RECHERCHE, false) },
  ]);
}

/**
 * Le bouton qui prend tout, posé au pied d'un panneau de recherche.
 *
 * Rend de quoi le remettre à jour : ce qu'il propose change à chaque critère
 * coché, et le panneau qui le porte ne se réécrit pas pour autant. Il ne paraît
 * qu'une fois la recherche commencée, et s'éteint quand tout ce qu'elle retient
 * est déjà retenu — en le disant, faute de quoi on le croirait en panne.
 */
export function poseToutAuParcours(hote){
  if (conf("_parcours").visible === false) return () => {};
  const b = document.createElement("button");
  b.type = "button";
  b.className = "btn parc tout-parc";
  b.innerHTML = SIGNET + '<span class="l"></span>';
  b.onclick = () => ajouteToutAuParcours();
  hote.appendChild(b);
  return () => {
    const r = retenusPourParcours();
    const reste = r.stands.length + r.confs.length;
    b.hidden = !filtre();
    b.disabled = !reste;
    b.querySelector(".l").textContent = reste
      ? "Ajouter tout à mon parcours"
      : "Déjà dans votre parcours";
  };
}
