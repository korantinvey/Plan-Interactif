/* ============================================================
   Le parcours reçu

   Un lien de parcours ouvert : ce qu'il porte se relit, se confronte à ce que
   le salon connaît encore, et se propose au visiteur avant d'entrer dans sa
   liste. Le lien lui-même, la fenêtre de partage et la copie qu'on se garde
   vivent dans `partage.mjs`, le codage dans `lien-parcours.mjs`.

   À part de `partage.mjs`, parce que ce qui est accepté se verse dans le
   tiroir (`tiroir-parcours.mjs` `verseAuParcours`), qui importe lui-même
   `partage.mjs` pour la note de la copie à garder : réunis, ils se seraient
   importés l'un l'autre.

   La configuration du salon, il l'importe (`configuration.mjs`) : il n'a
   rien à recevoir du code soudé ; `demarrage.mjs` `demarre` l'appelle une
   fois les données indexées.
   ============================================================ */
import { parId, CONFS } from "./donnees.mjs";
import { ouvreModale } from "./fenetre.mjs";
import { PARCOURS, dansParcours, contenuParcours, nomDeStand } from "./parcours.mjs";
import { CLE_LIEN_PARCOURS, litCodeParcours } from "./lien-parcours.mjs";
import { verseAuParcours } from "./tiroir-parcours.mjs";
import { conf } from "./configuration.mjs";

/* ------------------------------------------------------------
   Le parcours reçu
   ------------------------------------------------------------ */
/**
 * D'où l'on dit que vient un rang repris d'un parcours reçu.
 *
 * Un canal à lui, comme la suggestion en a un : un stand que huit visiteurs ont
 * repris du parcours d'un ami n'a pas été trouvé huit fois, il a été transmis,
 * et l'exposant ne lit pas ce chiffre-là comme les autres. Noyé dans le total
 * des ajouts, il revenait à ne pas être mesuré.
 */
const CANAL_PARTAGE = "partage";

/** Combien de noms la fenêtre montre avant de compter le reste. */
const PARTAGE_APERCU = 6;

/**
 * Un parcours arrivé dans l'adresse.
 *
 * Appelé au démarrage, une fois les données indexées : c'est `parId` et
 * `CONFS` qui disent ce qui existe encore dans ce salon, et un parcours venu
 * d'une autre édition ne doit pas remplir la liste de rangs morts.
 */
export function accueilleParcoursPartage(){
  /* Le fragment se lit tel que le navigateur le rend, sans le décoder ici :
     les échappements qu'il porte appartiennent aux identifiants, et un
     décodage de trop rendrait au séparateur un point qui n'en était pas un. */
  const brut = (location.hash || "").replace(/^#/, "");
  if (brut.indexOf(CLE_LIEN_PARCOURS) !== 0) return;
  /* Le fragment part tout de suite, quoi qu'il advienne ensuite. Il a été lu ;
     le garder ferait reposer la question à chaque rechargement, et un parcours
     mis en signet se réimposerait des semaines plus tard. Un cadre tiers cloisonné
     n'a pas le droit de réécrire l'adresse : le partage y marche quand même. */
  try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
  // l'exploitant a pu retirer le parcours de ce salon : le lien n'a alors nulle
  // part où poser ce qu'il porte
  if (conf("_parcours").visible === false) return;

  const recu = litCodeParcours(brut);
  if (!recu) return;
  const stands = recu.stands.filter(id => parId.has(id) && !dansParcours("stand", id));
  const confs = recu.confs.filter(id => CONFS.has(id) && !dansParcours("conf", id));

  if (!stands.length && !confs.length){
    /* Deux raisons de n'avoir rien à proposer, et elles ne se disent pas
       pareil : le parcours est déjà là — on a rouvert son propre lien, ou
       cliqué deux fois dessus — ou bien il ne parle pas de ce salon. */
    const connus = recu.stands.filter(id => parId.has(id)).length +
                   recu.confs.filter(id => CONFS.has(id)).length;
    ouvreModale("Parcours partagé", corps => {
      const p = document.createElement("p");
      p.textContent = connus
        ? "Tout ce que ce lien propose est déjà dans votre parcours."
        : "Ce lien ne désigne rien de ce salon : il vient sans doute d'une " +
          "autre édition, ou les stands qu'il retenait ont été démontés depuis.";
      corps.appendChild(p);
    }, [{ libelle: "Fermer" }]);
    return;
  }

  const sien = PARCOURS.stands.length + PARCOURS.confs.length;
  ouvreModale("Un parcours partagé", corps => {
    const p = document.createElement("p");
    p.textContent = "Le parcours qui vous a été partagé contient " +
      contenuParcours(stands.length, confs.length) + ".";
    corps.appendChild(p);

    const ul = document.createElement("ul");
    ul.className = "partListe";
    const noms = stands.map(id => nomDeStand(parId.get(id)))
      .concat(confs.map(id => CONFS.get(id).nom));
    noms.slice(0, PARTAGE_APERCU).forEach(n => {
      const li = document.createElement("li");
      li.textContent = n;
      ul.appendChild(li);
    });
    if (noms.length > PARTAGE_APERCU){
      const li = document.createElement("li");
      li.className = "reste";
      li.textContent = "et " + (noms.length - PARTAGE_APERCU) + " de plus";
      ul.appendChild(li);
    }
    corps.appendChild(ul);
  }, sien
    /* Une liste déjà commencée ne se remplace pas sans le dire : la fusion est
       proposée d'abord, c'est elle qui ne perd rien. */
    ? [{ libelle: "Annuler" },
       { libelle: "Remplacer le mien", genre: "danger",
         action: () => adoptePartage(stands, confs, true) },
       { libelle: "Ajouter au mien", genre: "accent",
         action: () => adoptePartage(stands, confs, false) }]
    : [{ libelle: "Annuler" },
       { libelle: "Charger ce parcours", genre: "accent",
         action: () => adoptePartage(stands, confs, true) }]);
}

/**
 * Ce que le visiteur a accepté entre dans sa liste, sous le canal qui dit d'où
 * cela vient. Ce qui ne se compte pas ici, c'est le partage lui-même :
 * personne n'a encore rien visité.
 */
function adoptePartage(stands, confs, remplace){
  verseAuParcours(stands, confs, CANAL_PARTAGE, remplace);
}
