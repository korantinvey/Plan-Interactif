/* ============================================================
   Les salons de la console, celui qu'on regarde, et leurs pavillons

   Trois états que toute la console lit : la liste des salons que la base rend
   au compte (`EVTS`), l'identifiant de celui qui est ouvert (`selection`), et
   les pavillons de chaque salon déjà lu (`PLANS`). Ils ont longtemps été des
   variables du code soudé, que chaque morceau lisait et que quatre d'entre eux
   réaffectaient — le chargement, le choix dans la liste, la création, le
   rechargement.

   Ils vivent désormais dans ce module, comme les données du plan dans
   `donnees.mjs`, remplacés par `poseEvenements({ … })`, une seule porte.
   Les modules les importent : c'est ce qui a permis à la fiche du salon, à sa
   provenance, à la fiche détail et à la duplication de quitter le code
   soudé, et au fuseau, aux comptes et à la synchronisation de ne plus se les
   faire confier. Le point d'entrée confie à l'export le salon ouvert par la
   liaison qu'il importe, toujours à jour.

   S'y ajoute ce qui ne tient qu'à eux : le salon ouvert (`courant`), l'écriture
   d'un salon à la base (`majEvenement`) et la lecture de ses pavillons
   (`chargePlans`). L'appel à la base vient du socle, que le rapport partage
   (`socle-console.mjs`).

   Le rapport a son propre salon choisi (`rapport-utilisation.mjs`) : ce
   module n'est importé que par la console.
   ============================================================ */
import { rest } from "./socle-console.mjs";

/** Les salons que la base rend au compte, le dernier modifié en tête. */
export let EVTS = [];
/** L'identifiant du salon ouvert, ou nul. */
export let selection = null;
/** Les pavillons de chaque salon déjà lu, par identifiant de salon. */
export let PLANS = {};

/**
 * Remplacer une ou plusieurs de ces valeurs. Un nom inconnu lève une erreur :
 * une faute de frappe ne doit pas poser une variable que personne ne lira.
 *
 * @param {{ EVTS?: any[], selection?: any, PLANS?: Record<string, any[]> }} valeurs
 */
export function poseEvenements(valeurs) {
  for (const [nom, v] of Object.entries(valeurs)) {
    switch (nom) {
      case "EVTS": EVTS = v; break;
      case "selection": selection = v; break;
      case "PLANS": PLANS = v; break;
      default: throw new Error("poseEvenements : « " + nom + " » n'est ni EVTS, ni selection, ni PLANS");
    }
  }
}

export const slugifie = (t) => String(t).toLowerCase().normalize("NFD")
  .replace(/\p{Diacritic}/gu, "").replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "").slice(0, 40);

export const courant = () => EVTS.find((e) => e.id === selection);

export async function chargePlans(id) {
  PLANS[id] = await rest("plan?evenement_id=eq." + id +
    "&select=id,id_klipso,libelle,hall,publie,nb_stands,nb_zones&order=libelle.asc");
}

export async function majEvenement(id, champs) {
  await rest("evenement?id=eq." + id, {
    method: "PATCH",
    headers: { "Prefer": "return=minimal" },
    body: JSON.stringify({ ...champs, modifie_le: new Date().toISOString() }),
  });
}
