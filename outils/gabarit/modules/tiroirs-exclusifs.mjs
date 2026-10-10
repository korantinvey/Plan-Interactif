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
/** @type {Map<TiroirExclusif, { ferme: () => void, estOuvert: () => boolean }>} */
const FERMETURES = new Map();

/**
 * Inscrire un tiroir. `estOuvert` ne sert qu'à celui dont la fermeture fait
 * autre chose que se refermer — la fiche, qui rend aussi la sélection : ses
 * voisins ne la ferment que si elle est ouverte, alors que le passage d'un
 * pavillon à l'autre la ferme toujours (`fermeTiroir`).
 * @param {TiroirExclusif} nom
 * @param {() => void} ferme
 * @param {() => boolean} [estOuvert]
 */
export function inscritTiroirExclusif(nom, ferme, estOuvert = () => true){
  FERMETURES.set(nom, { ferme, estOuvert });
}

/** Referme un tiroir par son nom, quoi qu'il en soit — le passage d'un pavillon à
 *  l'autre referme la fiche (`rendu.mjs` `changePlan`) sans importer la fiche.
 *  @param {TiroirExclusif} nom */
export function fermeTiroir(nom){
  const t = FERMETURES.get(nom);
  if (t) t.ferme();
}

/** Referme les deux autres, appelé par celui qui s'ouvre.
 *  @param {TiroirExclusif} moi */
export function fermeLesAutresTiroirs(moi){
  for (const nom of ORDRE_EXCLUSIFS){
    const t = nom !== moi && FERMETURES.get(nom);
    if (t && t.estOuvert()) t.ferme();
  }
}
