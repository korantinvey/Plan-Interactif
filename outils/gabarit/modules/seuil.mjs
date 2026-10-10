/* ============================================================
   Le parcours intelligent — le seuil de concentration

   Ce que le réglage `_capacite` donne pour chaque
   stand, et ce qu'il donne sur tout le salon : la journée organisée le lit
   (`journee.mjs`, `sejour.mjs`, `charge-annoncee.mjs`, chez le visiteur
   comme chez l'exploitant), l'onglet « Parcours intelligent » l'écrit
   (`volets.mjs`). Il n'a rien à se faire confier : la configuration, les
   données du salon, le contour d'un emplacement et son aire s'importent.
   `phraseSeuil` et le nom de l'onglet ne servent qu'à l'exploitant : seuls
   `volets.mjs` et `reglages.mjs`, de l'administration, les importent.
   ============================================================ */
import { DATA } from "./donnees.mjs";
import { conf } from "./configuration.mjs";
import { sommets } from "./itineraire.mjs";
import { aireDuContour } from "./terre.mjs";

/**
 * Ce que ce réglage règle, et ce qu'il ne prétend pas savoir.
 *
 * La journée organisée range les stands au plus court depuis la porte
 * d'entrée. Tous les visiteurs partent donc du même point, et le plus court
 * est le même pour tous : les premières travées se remplissent à l'ouverture
 * pendant que le fond reste vide. C'est **le calcul** qui fabrique cet
 * attroupement, en donnant le même ordre à tout le monde, et c'est lui seul
 * que ce réglage corrige.
 *
 * D'où le mot, et il n'est pas cosmétique. Ce n'est **pas une capacité** :
 * nous ne savons pas combien de personnes un stand reçoit, personne ne nous le
 * dit, et le compteur ne voit que les journées organisées depuis le plan — il
 * ignore tout des visiteurs qui ne l'ouvrent jamais, c'est-à-dire de l'immense
 * majorité. Un seuil de trois ne dit donc pas « ce stand reçoit trois
 * personnes ». Il dit : *au-delà de trois des nôtres en même temps, le moteur
 * cherche un autre ordre*. Prétendre autre chose serait une mesure inventée,
 * affichée à un exploitant qui n'a aucun moyen de la démentir.
 *
 * Le remède, lui, ne coûte presque rien : un stand trop demandé à dix heures
 * s'évite en y allant plus tard. Le visiteur garde son exposant, l'exposant
 * garde sa visite, et seule l'heure bouge.
 *
 * Reste le chiffre. La surface est ce qu'on a, faute de mieux, et deux façons
 * de le dire parce qu'elles ne servent pas les mêmes salons : un chiffre
 * unique quand les emplacements se ressemblent, une règle à la surface quand
 * ils vont du deux-mètres au pavillon. Un relevé empirique, stand par stand,
 * prendrait la place de l'un comme de l'autre sans que rien d'autre bouge.
 */
export const REGLAGES_SEUIL = {
  /* Combien des nôtres, par tranche de dix mètres carrés et par demi-heure,
     avant que le moteur ne cherche un autre ordre. La tranche de dix plutôt
     que le mètre carré parce que c'est ainsi qu'on le dit à voix haute — et
     parce qu'un champ où l'on tape « 0,3 » est un champ où l'on se trompe d'un
     facteur dix. Ce que vaut une règle de trois sur une surface : un point de
     départ, pas une mesure, et c'est pourquoi il se règle. */
  parDix:   { defaut: 3,   min: .5,  max: 20,  pas: .5 },
  /* En dessous, les plus petits stands porteraient une contrainte que leur
     seule surface leur invente : un module de six mètres carrés tient bien
     trois visiteurs debout. */
  plancher: { defaut: 3,   min: 1,   max: 20,  pas: 1 },
  /* Au-delà, la règle de trois rendrait des chiffres qui ne veulent plus rien
     dire, et un seuil si haut qu'il ne se déclencherait jamais. */
  plafond:  { defaut: 60,  min: 5,   max: 300, pas: 5 },
  /* Le seuil que l'exploitant impose lui-même, quand il connaît ses équipes
     mieux que la surface ne les devine. Il remplace le calcul plutôt que de
     s'y ajouter. */
  nombre:   { defaut: 3,   min: 1,   max: 200, pas: 1 },
};

/* Les cases et les chiffres ne partagent jamais une clé : `fixe` dit que la
   première façon est retenue, `nombre` dit combien — sous un seul nom, le
   chiffre saisi écrasait le booléen et la case s'éteignait toute seule.

   Décochées d'avance, toutes les trois : ceci change l'ordre de visite de tout
   le monde, et ne s'allume pas dans le dos de l'exploitant. */
export const seuilGere = () => conf("_capacite").visible === true;
export const seuilImpose = () => conf("_capacite").fixe === true;
export const seuilParSurface = () => conf("_capacite").surface === true;

/* Une valeur hors bornes — un champ à moitié tapé, une configuration d'avant —
   retombe sur l'origine plutôt que de fausser un plafond. Même geste que
   `regleFoule`, et pour la même raison. */
export function regleSeuil(k){
  const r = REGLAGES_SEUIL[k], v = +conf("_capacite")[k];
  return isFinite(v) && v >= r.min && v <= r.max ? v : r.defaut;
}

/**
 * La surface d'un emplacement, en mètres carrés.
 *
 * Les coordonnées du plan sont des mètres : c'est ce dont vit le calcul
 * d'itinéraire, qui y compte ses pas de cinquante centimètres (`PAS_GRILLE`).
 * L'aire du contour est donc une surface, sans conversion ni échelle à lire.
 *
 * `sommets` relit les nombres du tracé sans distinguer une courbe d'un
 * segment : sur un emplacement, quadrilatère dans l'immense majorité des cas,
 * c'est exact ; sur une forme adoucie, c'est approché par ses points de
 * contrôle. Le même raccourci ferme déjà le hall (`enveloppe`), et un plafond
 * de visiteurs ne se joue pas au mètre carré près.
 */
function aireDuStand(o){
  if (!o || !o.d) return 0;
  const pts = sommets(o);
  return pts.length > 2 ? aireDuContour(pts) : 0;
}

/**
 * Ce qu'un stand reçoit à la fois — et zéro quand on n'en sait rien.
 *
 * Zéro ne dit pas « n'accueille personne », il dit « aucun plafond connu ».
 * Un emplacement que personne n'a dessiné n'a pas de surface, et la règle à la
 * surface n'a alors rien à en dire. Confondre les deux fermerait des stands
 * entiers sur un salon à moitié dessiné : c'est à ce qui s'en sert de traiter
 * le zéro comme une absence, jamais comme une limite.
 *
 * Les deux cases cochées, c'est le plus grand des deux qui vaut. Le nombre
 * fixe devient un plancher — une équipe minimale, quelle que soit la taille —
 * et les grands emplacements montent au-dessus à la surface. Les additionner
 * ferait d'un stand de deux cents mètres carrés un guichet de treize
 * personnes, ce qu'aucun salon ne tient.
 *
 * Un emplacement dessiné reçoit toujours au moins un visiteur : à vingt
 * mètres carrés par personne, un stand de neuf tomberait sinon à zéro, et un
 * zéro se lit ici comme une absence de plafond — l'inverse de ce qu'il faut.
 */
/**
 * Le seuil de concentration d'un stand : le nombre d'utilisateurs du plan
 * simultanés au-delà duquel le moteur cherche à répartir.
 *
 * C'est une donnée de la configuration, et **rien dans le moteur ne la modifie
 * jamais**. Ce que l'ordonnanceur manipule, quand il lui faut desserrer la
 * mesure, est un seuil *effectif* qu'il calcule chez lui le temps d'un
 * rangement — voir `seuilEffectif` dans `modules/ordonnanceur.mjs`. Les deux ne se
 * confondent pas : celui-ci se règle et s'affiche, celui-là ne sort pas du
 * calcul.
 */
export function seuilConcentration(o){
  if (!seuilGere()) return 0;
  /* Le chiffre imposé l'emporte : quand l'exploitant connaît ses équipes mieux
     que la surface ne les devine, c'est lui qui a raison. C'est aussi la porte
     par laquelle un seuil relevé stand par stand entrera un jour sans rien
     changer d'autre. */
  if (seuilImpose()) return regleSeuil("nombre");
  if (!seuilParSurface()) return 0;
  const a = aireDuStand(o);
  if (a <= 0) return 0;   // rien de dessiné : on ne sait pas, on ne borne pas
  return Math.max(regleSeuil("plancher"),
                  Math.min(regleSeuil("plafond"),
                           Math.round(a * regleSeuil("parDix") / 10)));
}

/**
 * Ce que les réglages donnent sur ce salon-ci.
 *
 * Un seuil choisi sans voir ce qu'il produit sur six cents emplacements est un
 * seuil choisi au hasard : la médiane dit en un chiffre ce qu'on vient de
 * régler. La médiane et non la moyenne — un pavillon de mille mètres carrés
 * tirerait la seconde à lui tout seul.
 */
export function phraseSeuil(){
  if (!seuilGere() || (!seuilImpose() && !seuilParSurface())) return "";
  const caps = [];
  let dessines = 0;
  ((DATA && DATA.plans) || []).forEach(pl => (pl.stands || []).forEach(o => {
    if (aireDuStand(o) > 0) dessines++;
    const n = seuilConcentration(o);
    if (n > 0) caps.push(n);
  }));
  if (!dessines && seuilParSurface() && !seuilImpose())
    return "Aucun emplacement n'est dessiné sur ce salon : la surface ne dit " +
      "rien d'eux, et aucun ne porte de seuil.";
  if (!caps.length) return "";
  caps.sort((a, b) => a - b);
  const med = caps[caps.length >> 1];
  return "Sur ce salon : " + dessines + " emplacement" + (dessines > 1 ? "s" : "") +
    " dessiné" + (dessines > 1 ? "s" : "") + ". Seuil médian : " + med + ".";
}

/* Nommé plutôt qu'écrit deux fois : l'intitulé sert d'onglet et de nom de
   volet à rouvrir, comme pour la suggestion et la mesure. */
export const NOM_VOLET_PARCOURS = "Parcours intelligent";
