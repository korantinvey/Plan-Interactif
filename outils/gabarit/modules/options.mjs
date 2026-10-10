/* ============================================================
   Les options du plan — ce que le salon a pris

   La liste des options vendues à part, la classe que chacune pose sur la page
   quand elle est fermée, et ce qu'elle refait sur-le-champ. Le visiteur la
   reçoit — les classes retirent ce que son salon n'a pas pris —, d'où
   `plan.mjs` ; la case qui les ouvre et les ferme est dans l'onglet
   « Admin » (`volets.mjs`), d'exploitant.

   Ce qu'une option refait en se fermant, chacun des modules qu'elle touche
   le lui confie en se chargeant, par `confieApresOption` : le tiroir du
   parcours pour la journée et la suggestion, l'index du salon pour le
   programme, l'outil de dessin (`outil-dessin.mjs`, que le visiteur ne reçoit
   pas) pour ses deux options. Ce module ne dépend ainsi que de la
   configuration, et l'apparence, que tous ceux-là atteignent, l'importe.
   ============================================================ */
import { optionActive } from "./configuration.mjs";

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
 * refait sur-le-champ pour les autres, que le module concerné confie
 * (`confieApresOption`).
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
      "l'itinéraire : la commande retirée plus haut emporte le bouton avec elle." },
  { cle: "programme",
    libelle: "Programme de conférences",
    aide: "Les conférences du salon : le programme d'une zone, celles qu'un " +
      "exposant anime sur sa fiche, la recherche par titre, les horaires que " +
      "le parcours retient et les rappels qui vont avec. Fermée, le plan se " +
      "comporte comme un salon qui n'a pas de programme — la synchronisation " +
      "continue pourtant de le rapporter. Un visiteur qui rouvre le plan " +
      "entre-temps perd de son parcours les conférences qu'il avait retenues : " +
      "il ne garde que ce que le plan connaît encore." },
  { cle: "suggestion",
    libelle: "Recommandations sponsorisées",
    aide: "L'exposant de plus, proposé au visiteur quand plusieurs de ceux " +
      "qu'il a retenus se ressemblent — le plus consulté du salon sur ce " +
      "critère, ou celui que l'organisateur a désigné. Fermée, l'onglet " +
      "« Suggestion » reste ici, grisé, et plus rien n'est proposé ; ce qui " +
      "y était réglé est gardé." },
];

export function appliqueOptions(){
  OPTIONS.forEach(o => {
    if (o.classe) racine.classList.toggle(o.classe, !optionActive(o.cle));
  });
}

/**
 * La porte de ce qu'une option refait en se fermant, que le module qui le
 * sait ouvre en se chargeant — `tiroir-parcours.mjs`, `index-salon.mjs`, et
 * `outil-dessin.mjs`, que la page publique n'a pas : rien derrière les siennes.
 *
 * @param {string} cle
 * @param {() => void} apres
 */
export function confieApresOption(cle, apres){
  const o = OPTIONS.find(x => x.cle === cle);
  if (o) o.apres = apres;
}
