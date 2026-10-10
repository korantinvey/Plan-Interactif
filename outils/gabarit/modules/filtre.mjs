/* ============================================================
   Le filtre — la question posée, et ce qu'elle retient

   Le mot-clé et les critères (`state.qn`, `state.crit`), ce qu'un critère
   lit sur une fiche, le retrait levé par un clic sur ce qui ne répond pas,
   et les prédicats qui en sortent : ce que la liste retient (`visible`), ce
   que le plan garde allumé (`visibleSurPlan`), ce qu'un stand dessiné suit
   (`visibleSociete`).

   Un modèle, sans écran : la liste (`recherche.mjs`) le présente et le
   change, le dessin des calques et les noms du plan (`dessin.mjs`,
   `libelles.mjs`) le lisent. Il vivait dans la recherche, et ces deux-là
   devaient donc importer la liste pour savoir quoi éteindre — d'où une
   recherche qui ne pouvait plus les importer, et des portes pour le leur
   faire dire. Il ne dépend que des données, de la configuration et du corps
   de la fiche.
   ============================================================ */
import { separeValeurs } from "./texte.mjs";
import { state, HEBERGES, PAR_HEBERGE } from "./donnees.mjs";
import { chercheSorte } from "./configuration.mjs";
import { PREFIXE_PERSO } from "./corps-fiche.mjs";

/* Ce qu'un critère lit sur une fiche. Les champs propres au salon vivent dans
   « perso » ; les autres sont posés à plat, chacun sous le nom que la
   synchronisation lui donne — ce ne sont pas les mêmes que les cibles de la
   console, d'où cette table. */
const LECTURE_CRITERE = {
  secteur: o => [o.sect],
  ville: o => [o.ville],
  pays: o => [o.pays],
  nomenclature: o => o.nomencl,
  thematiques: o => o.themes,
  // un oui/non n'a qu'une valeur à cocher : le champ lui-même
  nouveau: o => o.neuf ? ["Oui"] : [],
  adherent: o => o.adh ? ["Oui"] : [],
};

export const CLE_SECTEUR = "secteur";

/* Le secteur décrit l'emplacement, pas la société qui l'occupe : le retenir ne
   fait donc pas paraître les sociétés hébergées, qui n'en ont pas en propre —
   elles empruntent celui de leur hôte, et la liste dirait deux fois le même
   emplacement. C'est ce qui le sépare de tous les autres critères. */
export const CRITERES_EMPLACEMENT = new Set([CLE_SECTEUR]);

/**
 * Les valeurs d'une fiche pour un critère, toujours une liste de textes.
 *
 * Un champ à choix multiple ne descend pas en liste : la source joint ses
 * valeurs par un point-virgule — « Devenir master-franchisé;Adhérent FFF ».
 * Prise telle quelle, la chaîne entière ferait une valeur à part, et un
 * exposant qui en porte deux ne se retrouverait avec personne : il y aurait
 * autant de valeurs à cocher que de combinaisons. On les sépare donc ici
 * aussi, et pas seulement à la synchronisation — les fiches déjà relevées
 * portent encore la chaîne entière, et n'attendent pas le prochain passage
 * pour se laisser filtrer.
 */
export function valeursCritere(o, cle){
  const brut = cle.indexOf(PREFIXE_PERSO) === 0
    ? (o.perso || {})[cle.slice(PREFIXE_PERSO.length)]
    : (LECTURE_CRITERE[cle] ? LECTURE_CRITERE[cle](o) : null);
  if (brut === null || brut === undefined || brut === "") return [];
  /* Une liste peut porter des trous — une société hébergée sans ville en a un
     là où les autres ont la leur — et « undefined » deviendrait une valeur à
     cocher si on la traduisait en texte avant de l'écarter. */
  return separeValeurs(brut);
}

/** Ce que la liste retient d'un critère : une valeur cochée suffit. */
export function dansCriteres(o){
  for (const [cle, choisies] of state.crit){
    const v = valeursCritere(o, cle);
    if (!v.some(x => choisies.has(x))) return false;
  }
  return true;
}

/** Quelque chose retranche-t-il de la liste ? Le mot-clé et les critères se
 *  cumulent, aucun ne prime. */
export const filtre = () => Boolean(state.qn) || state.crit.size > 0;

/* Le retrait du plan, et le geste qui l'en sort.

   Chercher éteint sur le plan ce qui ne répond pas : la liste et le plan sont
   les deux faces du même résultat. Mais on se sert du plan pendant qu'on
   cherche — pour situer ce qu'on a trouvé, et pour regarder ce qu'il y a
   autour. Ce voisin-là était éteint, et l'ouvrir laissait le hall délavé
   autour de sa fiche : on ne voyait plus l'endroit qu'on venait justement
   d'ouvrir.

   Un clic sur ce que la recherche n'a pas retenu lève donc le retrait. Le
   mot-clé, les critères et la liste ne bougent pas : c'est le plan qu'on
   reprend, pas la question qu'on retire — et revenir au menu de recherche la
   repose. */
/** @type {boolean} */
export let retraitLeve = false;

/** Reposer le retrait. Les fonctions qui changent le filtre l'appellent avant
 *  de le réappliquer : une question qu'on modifie est une question qu'on
 *  repose. */
export const reposeRetrait = () => { retraitLeve = false; };

/** Lever le retrait : un clic sur ce que la recherche n'a pas retenu
 *  (`recherche.mjs` `oublieRetrait`). */
export const leveRetrait = () => { retraitLeve = true; };

/* Un critère qui parle de la société fait paraître les hébergées ; le secteur,
   qui parle de l'emplacement, non. */
export const critParSociete = () =>
  [...state.crit.keys()].some(k => !CRITERES_EMPLACEMENT.has(k));

/* Sous quel réglage de l'onglet « Recherche » chaque sorte se range. Une
   hébergée suit les stands : c'est un exposant comme un autre, et l'exploitant
   qui montre les stands ne s'attend pas à devoir cocher les deux. */
const SORTE_RECHERCHE = { stand: "stands", coex: "stands", zone: "zones",
                          conf: "conferences", poi: "poi" };

/** L'exploitant laisse-t-il la recherche remonter cet objet ? */
const cherchable = (o) => chercheSorte(SORTE_RECHERCHE[o.kind] || "stands");

/* Une zone et une conférence répondent au mot-clé, jamais aux critères : ceux-ci
   décrivent une société — sa ville, ses rubriques — et rien de tout cela n'est
   d'elles. `dansCriteres` les écarte de lui-même, faute de valeur à opposer aux
   cases cochées ; c'est l'effet voulu, et non un oubli à rattraper : qui filtre
   par « gamme de produits » cherche des exposants. */
export function visible(o){
  if (!filtre()) return true;
  /* Ce que l'exploitant a retiré de la recherche ne répond pas — ni dans la
     liste, ni sur le plan, qui n'est que l'autre face du même résultat. Le
     sommaire du pavillon n'est pas concerné : sans mot-clé ni critère il n'y a
     pas de recherche, et la ligne au-dessus l'a déjà rendu tel quel. */
  if (!cherchable(o)) return false;
  /* Le catalogue n'est pas une sorte d'objet mais un texte de plus sur une
     société : un produit ne se trouve qu'en retenant le stand qui le présente,
     et c'est bien ce qu'on cherche en tapant son nom. D'où ce second rang,
     interrogé après l'autre et seulement s'il le faut. */
  return dansCriteres(o) &&
    (!state.qn || (o.rech || "").includes(state.qn) ||
     (chercheSorte("produits") && (o.rechProd || "").includes(state.qn)));
}

/* Les stands qu'une société hébergée éclaire. Le plan doit rester allumé sur
   le stand où l'on va la trouver, alors qu'il porte le nom d'un autre : c'est
   le seul endroit où une enseigne répond pour son hôte. Le relevé se refait à
   chaque changement de filtre, et non à chaque stand dessiné. */
let HOTES = new Set();
export const releveHotes = () => {
  HOTES = new Set(HEBERGES.filter(visible).map(x => x.id));
};

/**
 * Ce que le plan garde allumé : ce que la liste retient, plus les stands qui
 * hébergent une société retenue.
 */
export function visibleSurPlan(o){
  if (retraitLeve) return true;
  return visible(o) || (filtre() && o.kind === "stand" && HOTES.has(o.id));
}

/**
 * Ce qu'un stand dessiné suit : le filtre de la société qu'il désigne, et non
 * celui de l'emplacement. Une hébergée écartée par un critère doit s'éteindre
 * quand bien même son hôte reste allumé — c'est justement pour la distinguer
 * de lui qu'on l'a dessinée.
 */
export function visibleSociete(o, i){
  if (retraitLeve) return true;
  if (!(i >= 0)) return visibleSurPlan(o);
  const h = PAR_HEBERGE.get(o.id + "#" + i);
  return h ? visible(h) : visibleSurPlan(o);
}
