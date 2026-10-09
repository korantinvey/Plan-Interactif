/* ============================================================
   Le nom d'une zone dans la langue de la page

   À part de l'index du salon, dont il est sorti, parce que tout le plan le
   lit — le tracé, la liste, la fiche, la carte graphique — et que des modules
   que l'index importe lui-même en ont besoin : la recherche pour nommer une
   zone dans sa liste, la reprise d'un emplacement et la fiche d'une zone pour
   reposer les libellés anglais. Sans dépendance que les données, il se laisse
   importer par tous sans boucle.
   ============================================================ */
import { DATA } from "./donnees.mjs";

/**
 * Les libellés anglais que l'exploitant a donnés aux zones. Le moteur de
 * langue les substitue au nom français partout où celui-ci paraît — sur le
 * plan, dans la liste, sur la fiche, cité dans un itinéraire — sans que chacun
 * de ces endroits ait à choisir entre les deux. À relancer après chaque
 * enregistrement d'une zone : un libellé effacé doit disparaître aussi.
 */
/**
 * Le nom d'une zone dans la langue de la page. Le dictionnaire ci-dessous ne
 * suffit pas partout : le nom posé sur le plan est coupé en lignes, et une
 * zone peut s'appeler comme l'exposant qu'elle abrite, dont le nom ne se
 * traduit jamais. Là où la zone est nommée en tant que telle — sur le plan,
 * dans la liste, en titre de sa fiche — le nom se choisit donc à la source.
 */
export const nomDeLaZone = (/** @type {any} */ z) => (LANGUE.code === "en" && z.nom_en) || z.nom;

export function nomsAnglaisDesZones(){
  /** @type {Record<string, string>} */
  const t = {};
  DATA.plans.forEach((/** @type {any} */ p) => (p.zones || []).forEach((/** @type {any} */ z) => {
    if (z.nom && z.nom_en) t[z.nom] = z.nom_en;
  }));
  LANGUE.donnees("zones", t);
}
