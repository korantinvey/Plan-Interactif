/* ============================================================
   3. Rendu du pavillon courant

   Sorti de `_rendu.html` : le montage d'un pavillon — l'habillage, les zones
   et les stands, et tout ce qui se repose dessus quand ses groupes viennent
   d'être réécrits —, les onglets des pavillons et le passage de l'un à
   l'autre.

   Il se branche dans `_rendu.html`, à la place que son code tenait. Ce que le
   code soudé tient encore lui est confié par des détours, lus au moment de
   monter : le dessin des calques (`dessin.mjs`, qui importe la fiche que ce
   module importe), le fond d'un pavillon (`demarrage.mjs`, qui importe ce
   module-ci), et ce que seule l'administration connaît — la nappe de la grille, le calage de la
   carte — sous la garde qu'il avait. La reprise d'un emplacement,
   l'historique de l'éditeur et la boîte à outils, que le visiteur ne reçoit
   pas, restent dans une tranche du branchement : la page publique n'en
   confie rien, et le montage n'a rien à oublier. Le panneau des calques
   s'importe de `ordre-trace.mjs`, qui n'en remplit le contenu que chez
   l'exploitant.

   Le calque ouvert se referme par sa porte (`calques-dessin.mjs`
   `poseCalqueActif`). Le drapeau `MONTE` ne change qu'ici : le code soudé le
   lit par accesseur.
   ============================================================ */
import { $ } from "./dom.mjs";
import { esc } from "./texte.mjs";
import { DATA, state, P } from "./donnees.mjs";
import { poseEmprise, fit } from "./vue.mjs";
import { oublieDists } from "./distinctions.mjs";
import { marqueRetrait, liste } from "./recherche.mjs";
import { appliqueApparence } from "./apparence.mjs";
import { marqueParcours } from "./parcours.mjs";
import { dessineItineraire } from "./tiroir-itineraire.mjs";
import { dessineBorne } from "./vous-etes-ici.mjs";
import { ADMIN } from "./mode-admin.mjs";
import { majFondus } from "./bandes.mjs";
import { ferme } from "./fiche.mjs";
import { poseCalqueActif } from "./calques-dessin.mjs";
import { construitPanneau } from "./ordre-trace.mjs";

/* Ce que le montage appelle chez des modules qui l'importent, et qu'ils lui
   confient en se chargeant (`confieAuRendu`) : le dessin des calques
   (`dessin.mjs`), le fond d'un pavillon chargé après coup (`demarrage.mjs`),
   et ce que seule l'administration a — la nappe de la grille (`nappe.mjs`),
   le calage de la carte en cours (`calage-carte.mjs`), l'éditeur à remettre
   au repos (`outil-dessin.mjs`). La page publique n'embarque pas ces
   derniers : ils restent sans effet. */
/**
 * @typedef {object} PageRendu
 * @property {() => void} dessineDessins
 * @property {(i: number) => void} chargeFond
 * @property {() => void} rafraichitApercu
 * @property {() => void} oublieCalageEnCours
 * @property {(() => void) | null} oublieEdition
 */
/** @type {PageRendu} */
const prete = { dessineDessins: () => {}, chargeFond: () => {}, rafraichitApercu: () => {},
  oublieCalageEnCours: () => {}, oublieEdition: null };

/** La porte des modules qui confient au montage ce qu'il appelle.
 *  @param {Partial<PageRendu>} o */
export function confieAuRendu(o){ Object.assign(prete, o); }

/* Les calques d'habillage sont recréés à l'arrivée sur un pavillon ; ensuite
   ordonneDom() ne fait que déplacer les nœuds, ce qui rend le réordonnancement
   instantané malgré le poids du fond de plan. */
export function monteHabillage(){
  const c = $("couches");
  c.querySelectorAll(".cal").forEach(g => g.remove());
  P().fond.forEach(f => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("class", "cal");
    g.dataset.cle = f.cle;
    g.innerHTML = f.svg || "";
    c.appendChild(g);
  });
}

/* Le panneau des calques ne peut se construire qu'une fois le plan monté.
   L'identité de l'exploitant, elle, peut être vérifiée avant ou après :
   ce drapeau permet aux deux ordres d'arrivée d'aboutir. */
export let MONTE = false;

/* Le balisage d'une zone et d'un stand, sortis de « montePlan » pour qu'un
   emplacement ajouté à la main (`reprise-emplacements.mjs`) se pose dans le même
   groupe que ceux de la source, sans qu'on remonte tout le pavillon.

   Une zone que l'exploitant a éteinte ne parvient jamais au visiteur : si
   elle est là, c'est qu'on administre, et la teinte pâlie dit qu'elle ne
   sera pas sur le plan public.

   Une zone ajoutée à la main porte, comme un stand, son identifiant dans
   « data-aj » : c'est le seul attribut par lequel la reprise de forme
   (`groupeGeo`) retrouve un ajout. Sans lui, la forme retouchée
   s'enregistrait mais le tracé restait à sa taille de naissance. */
export const baliseZone = (z) =>
  '<g class="zone' + (z.masquee ? ' masquee' : '') + '" data-id="' + z.id + '"' +
  (z.ajout ? ' data-aj="' + esc(z.id) + '"' : "") +
  ' tabindex="0" role="button" aria-label="' +
  esc(z.nom || "zone") + '"><path d="' + z.d + '"/></g>';
/* Un stand ajouté à la main porte son identifiant propre dans « data-aj » :
   c'est par lui que la reprise de forme le retrouve. Lié à un exposant, il
   prend en « data-id » et « data-soc » l'emplacement et le rang de la société
   qu'il matérialise, comme un stand dessiné : le clic, la fiche, la couleur du
   secteur et la chaleur lisent déjà ces deux-là, et n'ont rien à apprendre. */
export const baliseStand = (s) =>
  '<g class="stand" data-id="' + esc(s.lien ? s.lien.stand : s.id) + '"' +
  (s.ajout ? ' data-aj="' + esc(s.id) + '"' : "") +
  (s.lien ? ' data-soc="' + s.lien.soc + '"' : "") +
  ' tabindex="0" role="button" aria-label="' +
  esc(s.nom || ("Stand " + (s.code || ""))) + '"><path d="' + s.d + '"/></g>';

export function montePlan(){
  const p = P();
  $("zones").innerHTML = p.zones.map(baliseZone).join("");
  $("stands").innerHTML = p.stands.map(baliseStand).join("");
  poseEmprise(p.emprise);
  // les tracés relevés valaient pour les stands du pavillon qu'on quitte
  oublieDists();
  poseCalqueActif(null);
  /* Les groupes viennent d'être réécrits : l'emplacement qu'on reprenait n'est
     plus celui-là, et il appartenait au pavillon qu'on vient de quitter ; la
     boîte à outils n'existe qu'en administration. La page publique n'a rien
     de cela : ni éditeur, ni outils. */
  if (prete.oublieEdition) prete.oublieEdition();
  monteHabillage();
  prete.dessineDessins();          // crée les calques de dessin puis ordonne la pile
  // les groupes viennent d'être réécrits : le retrait d'une recherche en cours
  // est à reposer dessus, sans quoi le pavillon paraît entier
  marqueRetrait();
  appliqueApparence();
  marqueParcours();
  // le trajet vit hors des calques : il survit au montage, mais son tronçon
  // n'est pas celui du pavillon qu'on vient d'ouvrir
  dessineItineraire();
  // et « Vous êtes ici » n'est posé que dans le pavillon où la borne l'est
  dessineBorne();
  // la nappe de la grille n'est qu'à l'exploitant (`modules/nappe.mjs`)
  prete.rafraichitApercu();
  MONTE = true;
  if (ADMIN) construitPanneau();
  onglets();
}

function onglets(){
  /* Un salon d'un seul pavillon n'a rien à choisir : l'onglet unique ne ferait
     que répéter le titre — souvent mot pour mot, Klipso nommant son plan
     unique comme le salon — et sur un écran étroit il lui prend sa largeur. */
  const seul = DATA.plans.length < 2;
  /* Le cadre et non la barre : vidée, elle laisserait son cadre — un fondu, deux
     flèches et, sur un téléphone, la pastille qui les porte — annoncer des
     onglets qui n'existent pas. */
  $("hallsBande").hidden = seul;
  // la barre s'arrange autrement quand elle n'a plus d'onglets à loger
  document.documentElement.classList.toggle("un-pavillon", seul);
  if (seul) { $("halls").innerHTML = ""; return; }
  $("halls").innerHTML = DATA.plans.map((p, i) =>
    '<button data-p="' + i + '" aria-pressed="' + (i === state.plan) + '"' +
    ' title="' + esc(p.libelle) + '">' +
    esc(p.libelle) + '<span class="n">' + p.stands.length + '</span></button>').join("");
  $("halls").querySelectorAll("button").forEach(b => b.onclick = () => changePlan(+b.dataset.p));
  /* Les onglets viennent d'arriver : personne d'autre ne saura qu'ils débordent
     — le défilement n'a pas bougé, et la fenêtre non plus. */
  majFondus();
}

export function changePlan(i){
  if (i === state.plan) return;
  state.plan = i;
  /* Le calage que l'exploitant règle appartient au pavillon qu'il quitte. */
  prete.oublieCalageEnCours();
  ferme();
  montePlan(); fit(); liste();
  prete.chargeFond(i);
}
