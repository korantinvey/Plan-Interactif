/* ============================================================
   Un seul des trois à la fois — la fiche, le parcours, l'itinéraire

   Ils se partagent la même bande, à droite comme en bas : ouvrir l'un
   referme les deux autres, plutôt que de les empiler. La règle était écrite à
   chaque ouverture, et chacune devait appeler les deux autres — la fiche et
   le tiroir de l'itinéraire s'important l'un l'autre, l'un des deux se
   faisait confier la fermeture. Chacun inscrit ici, en se chargeant, de quoi
   se refermer s'il est ouvert, et appelle `fermeLesAutresTiroirs` en
   s'ouvrant. L'ordre est celui que les ouvertures suivaient déjà.

   Sans aucun import : le parcours, que les essais du séjour chargent dans
   Node, s'y inscrit, et ne doit rien atteindre qui veuille la page.
   ============================================================ */
/** @typedef {"fiche" | "parcours" | "itineraire"} TiroirExclusif */
/** @type {TiroirExclusif[]} */
const ORDRE_EXCLUSIFS = ["fiche", "parcours", "itineraire"];
/** @type {Map<TiroirExclusif, () => void>} */
const FERMETURES = new Map();

/** @param {TiroirExclusif} nom @param {() => void} ferme ne fait rien s'il est déjà fermé */
export function inscritTiroirExclusif(nom, ferme){ FERMETURES.set(nom, ferme); }

/** Referme les deux autres, appelé par celui qui s'ouvre.
 *  @param {TiroirExclusif} moi */
export function fermeLesAutresTiroirs(moi){
  for (const nom of ORDRE_EXCLUSIFS){
    const ferme = nom !== moi && FERMETURES.get(nom);
    if (ferme) ferme();
  }
}
