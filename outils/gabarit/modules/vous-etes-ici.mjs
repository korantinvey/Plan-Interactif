/* ============================================================
   « Vous êtes ici » — le départ imposé, et son point sur le plan

   Deux chemins mènent un plan à savoir où il est : la borne, vissée à
   l'entrée du hall (`borne.mjs`), et le code photographié sur une affiche
   (`ici.mjs`). Ils posent le même départ, que l'itinéraire et la journée
   organisée lisent ensuite sans demander d'où l'on part, et le même point sur
   le plan.

   Ce départ vivait dans la borne, et tout ce qui le lisait l'importait : le
   tiroir de l'itinéraire, la journée, le rendu, les libellés. La borne, en
   retour, ne pouvait importer aucun d'eux — c'eût été une boucle —, et il
   fallait lui confier la visée, les tiroirs à refermer et le passage d'un
   pavillon à l'autre. Sorti ici, dans un module qui n'importe que les données
   et la vue, le départ se lit sans passer par la borne, et la borne importe
   ce dont elle a besoin.
   ============================================================ */
import { $ } from "./dom.mjs";
import { DATA, state } from "./donnees.mjs";
import { vue, svg, cadrePlan, confieALaVue } from "./vue.mjs";

/* Le point d'où partent les itinéraires. Nul tant que la borne ne sait pas où
   elle est posée — c'est alors la pose qu'on demande, et rien d'autre. */
export let LIEU_BORNE = null;

/** Le départ imposé, lu par l'itinéraire et par l'organisation de la journée. */
export function pointBorne(){ return LIEU_BORNE; }

/** La porte du départ imposé : la borne le pose, le code affiché dans le hall
 *  (`modules/ici.mjs`) le pose et l'éteint — une variable importée ne se
 *  réaffecte pas d'ailleurs que de son module. */
export function poseLieuBorne(lieu){ LIEU_BORNE = lieu; }

/* ------------------------------------------------------------
   Le départ, dans le tiroir
   ------------------------------------------------------------ */
/**
 * Le moteur de langue ne traduit pas la valeur d'un champ de saisie — elle
 * vient du code ici, et non des données : on la réécrit donc soi-même, et
 * encore après une bascule de langue.
 */
export function ecritDepartBorne(){
  if (!LIEU_BORNE) return;
  const c = $("iDepart");
  if (c){ c.value = traduit(LIEU_BORNE.nom); c.title = LIEU_BORNE.detail; }
}

/* ------------------------------------------------------------
   « Vous êtes ici »
   ------------------------------------------------------------ */
/** Rayon du point, constant à l'écran, donc exprimé en mètres d'après le zoom. */
function rayonBorne(){
  const r = cadrePlan();
  return Math.max(.4, vue().w / (r.width || 1) * 7);
}

export function dessineBorne(){
  let g = $("borneIci");
  if (!LIEU_BORNE || !DATA || !vue() || LIEU_BORNE.p !== state.plan){
    if (g) g.remove();
    return;
  }
  if (!g){
    g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.id = "borneIci";
    // sous le trait de l'itinéraire, qui part justement d'ici
    svg.insertBefore(g, svg.querySelector("#itin, #apercu, #poignees"));
  }
  rempliBorne(g);
}

/** Le zoom change : le point garde sa taille à l'écran, pas celle du plan. */
export function rafraichitBorne(){
  const g = $("borneIci");
  if (g && LIEU_BORNE && vue()) rempliBorne(g);
}

function rempliBorne(g){
  const r = rayonBorne(), x = LIEU_BORNE.xy[0], y = LIEU_BORNE.xy[1];
  g.innerHTML = '<title></title>' +
    '<circle class="bOnde" cx="' + x + '" cy="' + y + '" r="' + (r * 2.6).toFixed(2) + '"/>' +
    '<circle class="bPoint" cx="' + x + '" cy="' + y + '" r="' + r.toFixed(2) + '"/>' +
    '<text class="bNom" x="' + x + '" y="' + (y - r * 3.4).toFixed(2) +
    '" font-size="' + (r * 2).toFixed(2) + '"></text>';
  /* Le titre et le nom passent par « textContent » : le moteur de langue les
     traduit là où il ne traduirait pas une valeur d'attribut construite. */
  g.querySelector("title").textContent = LIEU_BORNE.nom;
  g.querySelector(".bNom").textContent = LIEU_BORNE.nom;
}

/* Le point garde sa taille à l'écran : la vue, que ce module importe, le
   refait à chaque changement de vue — il le lui confie en se chargeant. */
confieALaVue({ rafraichitBorne });
