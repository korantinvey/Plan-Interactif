/* ============================================================
   Les options du plan — ce que le salon a pris

   La liste des options vendues à part, la classe que chacune pose sur la page
   quand elle est fermée, et ce qu'elle refait sur-le-champ. Le visiteur la
   reçoit — les classes retirent ce que son salon n'a pas pris —, d'où
   `plan.mjs` ; la case qui les ouvre et les ferme est dans l'onglet
   « Admin » (`volets.mjs`), d'exploitant.

   Ce qu'une option refait en se fermant touche au parcours, à l'index des
   conférences et à la liste, qui s'importent. Deux d'entre elles touchent
   aussi à l'outil de dessin, que le visiteur ne reçoit pas : l'outil
   (`outil-dessin.mjs`) leur confie lui-même ce qu'elles refont, par
   `confieApresOption`.

   L'apparence des calques (`apparence.mjs`), que le
   tiroir du parcours importe, ne peut importer ce module : celui-ci lui
   confie `appliqueOptions` en se chargeant (`confieALApparence`).
   ============================================================ */
import { optionActive } from "./configuration.mjs";
import { rafraichitParcours } from "./tiroir-parcours.mjs";
import { indexeConferences } from "./index-salon.mjs";
import { liste } from "./recherche.mjs";
import { confieALApparence } from "./apparence.mjs";

const racine = document.documentElement;

/**
 * Les options du plan.
 *
 * Toutes les fonctions du plan ne reviennent pas à tous les salons. Le dessin
 * des stands, les images posées sur un emplacement, la journée organisée, le
 * programme de conférences et la recommandation d'un exposant se prennent à
 * part : un salon de trente enseignes n'en veut aucune, un congrès les veut
 * toutes. Jusqu'ici la seule façon d'en retirer une était de ne pas s'en
 * servir — ce qui ne vaut rien, l'organisateur ayant la main sur son plan.
 *
 * D'où cette liste, dans l'onglet « Admin » et nulle part ailleurs : c'est
 * l'exploitant qui l'ouvre à l'ouverture du salon, et l'organisateur n'y
 * trouverait que de quoi fermer ce qu'on lui a vendu.
 *
 * Ouvertes par défaut, comme les commandes : un réglage absent ne doit rien
 * retirer à un salon déjà en place.
 *
 * Fermer une option grise la porte, jamais ce qui est derrière — c'est la
 * règle du parcours de visite, qui se retire sans vider les listes déjà
 * constituées. Grise et non retirée : une commande absente n'apprend rien, là
 * où une commande grise dit ce que le salon n'a pas pris et ce qui se prend.
 * Chez le visiteur, en revanche, elle disparaît : on ne lui montre pas un
 * produit qu'il ne peut pas acheter. Les stands et les images déjà dessinés restent sur le plan, les
 * conférences restent dans l'instantané, ce qui était réglé pour la suggestion
 * reste écrit : rouvrir l'option retrouve le tout.
 *
 * Une seule chose ne se rend pas, et la case le dit : le parcours d'un
 * visiteur ne garde que ce que le plan connaît encore (« chargeParcours »).
 * Celui qui rouvre le plan pendant que le programme est fermé y perd donc les
 * conférences qu'il avait retenues.
 *
 * « classe » marque celles qui se ferment par la feuille de style — un bouton
 * de la boîte à outils, celui du tiroir du parcours ; « apres » dit ce qui se
 * refait sur-le-champ pour les autres. Celui des deux options de l'outil de
 * dessin, l'outil le leur confie (`confieApresOption`).
 *
 * @type {{ cle: string, classe?: string, libelle: string, aide: string, apres?: () => void }[]}
 */
export const OPTIONS = [
  { cle: "dessinStand", classe: "sans-dessin-stand",
    libelle: "Dessin des stands",
    aide: "L'outil qui matérialise un exposant, ou l'une des enseignes qu'il " +
      "héberge, sur sa part d'un emplacement. Fermée, l'outil reste dans la boîte " +
      "à outils, grisé ; les découpages déjà tracés restent sur le plan.",
  },
  { cle: "imageStand", classe: "sans-image-stand",
    libelle: "Ajout d'images liées à un stand",
    aide: "Le rattachement d'une image du dessin à un exposant : le logo posé " +
      "sur son emplacement ouvre sa fiche au toucher, celle de l'enseigne " +
      "désignée même sur un stand partagé. C'est le lien qui se prend, non " +
      "l'image : fermée, l'outil image reste et les images se posent comme " +
      "n'importe quel dessin, mais le champ qui nomme l'exposant est grisé et " +
      "plus aucune ne se relie. Celles qui l'étaient gardent leur lien.",
  },
  { cle: "journee", classe: "sans-journee",
    libelle: "Organiser ma journée",
    aide: "Le bouton du tiroir du parcours, qui met en heures les stands et " +
      "les conférences retenus et trace le trajet d'un bout à l'autre. " +
      "Fermée, le bouton vous reste, grisé, et le visiteur ne l'a plus : son " +
      "parcours reste une liste. Elle se calcule avec le moteur de " +
      "l'itinéraire : la commande retirée plus haut emporte le bouton avec elle.",
    /* Le bouton s'éteint par `rafraichitParcours`, qui l'éteint déjà sur une
       liste vide : la feuille de style seule le laissait prendre au clavier. */
    apres: () => rafraichitParcours() },
  { cle: "programme",
    libelle: "Programme de conférences",
    aide: "Les conférences du salon : le programme d'une zone, celles qu'un " +
      "exposant anime sur sa fiche, la recherche par titre, les horaires que " +
      "le parcours retient et les rappels qui vont avec. Fermée, le plan se " +
      "comporte comme un salon qui n'a pas de programme — la synchronisation " +
      "continue pourtant de le rapporter. Un visiteur qui rouvre le plan " +
      "entre-temps perd de son parcours les conférences qu'il avait retenues : " +
      "il ne garde que ce que le plan connaît encore.",
    /* Le programme n'est pas une commande qu'on masque : c'est un index qu'on
       refait, et tout ce qui le lit part de là. La liste affichée derrière la
       fenêtre est peut-être un résultat de recherche, et le tiroir du parcours
       peut être ouvert : les deux obéissent sur-le-champ. */
    apres: () => { indexeConferences(); liste(); rafraichitParcours(); } },
  { cle: "suggestion",
    libelle: "Recommandations sponsorisées",
    aide: "L'exposant de plus, proposé au visiteur quand plusieurs de ceux " +
      "qu'il a retenus se ressemblent — le plus consulté du salon sur ce " +
      "critère, ou celui que l'organisateur a désigné. Fermée, l'onglet " +
      "« Suggestion » reste ici, grisé, et plus rien n'est proposé ; ce qui " +
      "y était réglé est gardé.",
    apres: () => rafraichitParcours() },
];

export function appliqueOptions(){
  OPTIONS.forEach(o => {
    if (o.classe) racine.classList.toggle(o.classe, !optionActive(o.cle));
  });
}

/**
 * La porte de ce qu'une option refait en se fermant, quand c'est l'outil de
 * l'exploitant qui le sait : `outil-dessin.mjs` l'ouvre en se chargeant, et la
 * page publique, qui n'a pas l'outil, n'a rien derrière.
 *
 * @param {string} cle
 * @param {() => void} apres
 */
export function confieApresOption(cle, apres){
  const o = OPTIONS.find(x => x.cle === cle);
  if (o) o.apres = apres;
}

/* Les options, confiées à l'apparence dès que ce module se charge : elle les
   repose avec le reste de l'habillage, et ne peut importer ce module, qui
   l'atteint par le tiroir du parcours. */
confieALApparence({ appliqueOptions });
