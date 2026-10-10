/* ============================================================
   Les données du plan, leurs index, et ce que la vue regarde

   Un salon arrive de l'API (ou de la page, pour la démonstration) : `indexe`
   le pose ici, puis en tire les index que tout le plan consulte — les formes,
   l'objet derrière chaque identifiant, les hébergées, le programme. Ces noms
   ont longtemps été des variables d'un script unique, que chaque morceau
   lisait et que deux d'entre eux réaffectaient.

   Ils vivent désormais dans ce module : on les importe pour les lire, et on
   les remplace par `poseDonnees({ … })`, une seule porte qu'on retrouve d'un
   coup d'œil.
   ============================================================ */

/** Le salon tel que l'API le sert : `evenement`, `plans`, `fuseau`… */
export let DATA = null;
/** Ce qu'on cherche et qu'on compte : stands et zones, hors stands ajoutés
 *  déjà liés à un exposant (l'exposant y est déjà). */
export let TOUS = [];
/** Chaque forme par son identifiant, liées comprises. */
export let parId = new Map();
/** Les conférences par identifiant, tous pavillons confondus. */
export let CONFS = new Map();
/** Les exposants cités par chaque conférence, recomposés d'un pavillon à l'autre. */
export let EXPOSANTS = new Map();
/* Les sociétés hébergées sur le stand d'un autre. Elles n'ont ni forme ni
   identifiant — c'est le stand de leur hôte qu'on va voir — et ne peuvent donc
   pas vivre dans « TOUS », que la carte indexe. Elles ont leur liste, que la
   recherche seule consulte. */
export let HEBERGES = [];
/* Le programme entier, dédoublonné, tel que la recherche le balaie. Une
   conférence n'est ni une forme ni un emplacement : elle n'entre pas dans
   « TOUS » et se cherche depuis sa propre liste, comme les hébergées. */
export let CONFERENCES = [];
/* Les mêmes, retrouvables par le couple qui les désigne — le stand qui les
   héberge, leur rang dedans. C'est ainsi qu'un stand dessiné les nomme, et il
   n'a pas à balayer la liste pour savoir si le filtre les retient. */
export let PAR_HEBERGE = new Map();
/* Les secteurs du salon, chacun avec sa teinte sur la roue — calculés par
   `secteurs.mjs` `indexeSecteurs`, qui les pose ici avec les autres index :
   la configuration les relit pour reconnaître une clé de secteur, et le
   module des secteurs, qui la lit, ne pouvait lui être importé. */
/** @type {Map<string, number>} */
export let SECTEURS = new Map();

/**
 * Remplacer une ou plusieurs de ces valeurs. Un nom inconnu lève une erreur :
 * une faute de frappe ne doit pas poser une variable que personne ne lira.
 *
 * @param {{ DATA?: any, TOUS?: any[], parId?: Map<any, any>, CONFS?: Map<string, any>,
 *           EXPOSANTS?: Map<string, any[]>, HEBERGES?: any[], CONFERENCES?: any[],
 *           PAR_HEBERGE?: Map<string, any>, SECTEURS?: Map<string, number> }} valeurs
 */
export function poseDonnees(valeurs){
  for (const [nom, v] of Object.entries(valeurs)){
    switch (nom){
      case "DATA": DATA = v; break;
      case "TOUS": TOUS = v; break;
      case "parId": parId = v; break;
      case "CONFS": CONFS = v; break;
      case "EXPOSANTS": EXPOSANTS = v; break;
      case "HEBERGES": HEBERGES = v; break;
      case "CONFERENCES": CONFERENCES = v; break;
      case "PAR_HEBERGE": PAR_HEBERGE = v; break;
      case "SECTEURS": SECTEURS = v; break;
      default: throw new Error("poseDonnees : « " + nom + " » n'est pas une donnée du plan");
    }
  }
}

/**
 * Les sociétés d'un stand, celle qui le loue en tête. Une lecture des données,
 * que la fiche, le dessin et les distinctions font tous trois.
 *
 * Elle est le stand lui-même : c'est son dossier qui l'a désignée à la
 * synchronisation, et ses champs sont posés à plat sur lui. Les autres vivent
 * dans « coex », dans l'ordre où la source les a rendues.
 *
 * Le rang les distingue, la liste ne le dit pas : qui loue et qui est hébergé
 * relève du contrat entre l'organisateur et ses exposants. Un visiteur cherche
 * une enseigne, pas sa place dans un bail.
 */
export function societes(o){
  return [{ soc: o, i: -1 }].concat((o.coex || []).map((x, i) => ({ soc: x, i: i })));
}

/* `q` est ce que le visiteur a tapé, `qn` la forme sur laquelle on compare —
   rognée et abaissée. La normaliser une fois par frappe plutôt qu'une fois
   par objet, c'est la même chose en mille fois moins.

   `selSoc` dit laquelle des sociétés d'un stand partagé est ouverte : -1 le
   titulaire, sinon le rang de l'hébergé. Sans lui, la liste marquerait comme
   courants tous les rangs d'un même stand.

   L'objet se modifie en place et n'est jamais remplacé : il se confie donc tel
   quel, sans accesseur. */
export const state = { q: "", qn: "", sel: null, selSoc: -1, plan: 0,
                       /* Les critères retenus : une clé de champ, les valeurs cochées.
                          Un critère sans valeur cochée n'existe pas — il sort de la
                          table plutôt que d'y rester comme un filtre qui ne filtre
                          rien. */
                       crit: new Map() };

/** Le pavillon affiché. */
export const P = () => DATA.plans[state.plan];
