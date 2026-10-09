/* ============================================================
   Les modèles d'habillage du plan

   Sortis de `_admin1.html`. Le plan public les lit à chaque chargement : le
   modèle retenu habille la fiche, les tiroirs, la liste, le bandeau et la
   fenêtre commune. Ils ne demandent rien au code soudé — la configuration
   s'importe. Leur pose sur l'écran est dans `habillage.mjs`
   (`appliqueModele`), la police qu'ils donnent aux noms dans
   `polices-plan.mjs`.
   ============================================================ */
import { $ } from "./dom.mjs";
import { CONF } from "./configuration.mjs";

/* Les habillages du plan. Chacun tient en cinq pièces — le bandeau du haut,
   la liste des exposants, la fiche détail, le parcours de visite et
   l'itinéraire — taillées dans la même police et les mêmes couleurs : on ne
   choisit pas l'allure de l'une sans choisir celle des autres, sous peine de
   cinq salons côte à côte. Les trois dernières occupent d'ailleurs la même
   bande de l'écran, et s'ouvrent l'une depuis l'autre. Le premier modèle n'a
   de classe nulle part : c'est le plan tel que la feuille de style le dessine,
   et le point de départ de tous les autres. */
export const MODELES = [
  { cle: "sobre", nom: "Sobre",
    resume: "Le rendu d'origine : un seul rythme, de la liste à la fiche." },
  { cle: "grille", nom: "Grille",
    resume: "Encre pleine, numéro en filigrane, filets francs jusque dans la liste." },
  { cle: "console", nom: "Console",
    resume: "Chasse fixe et invites de commande, sur un phosphore à la couleur du salon." },
  { cle: "billet", nom: "Billet",
    resume: "Bandeau d'accent sur la recherche, numéros comptables, lignes perforées." },
  { cle: "magazine", nom: "Magazine",
    resume: "Serif à fort contraste et italiques : le catalogue et son sommaire." },
  { cle: "brut", nom: "Brut",
    resume: "Trait épais, ombre dure, aplat franc. Papier et noir, sans rien emprunter au salon." },
  { cle: "verre", nom: "Verre",
    resume: "Un bloc de la couleur du salon, champs et lignes en carreaux translucides." },
  { cle: "kraft", nom: "Kraft",
    resume: "Carton et machine à écrire, « nouvel exposant » tamponné de travers." },
  { cle: "signal", nom: "Signalétique",
    resume: "Aplat, flèche et capitales : un stand se lit comme une direction de hall." },
  { cle: "chrono", nom: "Chronologie",
    resume: "Le programme en ligne de temps, et la liste égrenée le long du même rail." },
  { cle: "nu", nom: "Nu",
    resume: "Ni cadre ni libellés : la hiérarchie typographique seule." },
];
export const modeleRetenu = () => {
  const c = (CONF["_fiche"] || {}).modele;
  return MODELES.some(m => m.cle === c) ? c : "sobre";
};

/**
 * L'habillage du salon sur la fenêtre modale.
 *
 * Elle restait au fond neutre pendant que tout le reste portait la couleur du
 * salon, et c'est pourtant là que le visiteur coche ses critères de recherche,
 * lit le programme d'une conférence, choisit une société sur un stand partagé,
 * fait organiser sa journée, confirme un vidage ou reçoit la proposition qui
 * complète sa visite.
 *
 * Sauf les fenêtres d'exploitation, que leur genre nomme : « large » pour les
 * réglages du plan et la fiche d'une zone, « outil » pour la remise à zéro des
 * compteurs, l'ordre des calques et le nom d'un calque. Ce sont les outils de
 * l'exploitant et non des pièces du salon, et deux d'entre elles ne peuvent pas
 * porter d'habillage sans mentir :
 *
 * — les réglages montrent les onze habillages en vignettes, et l'on ne compare
 *   pas onze habillages depuis une fenêtre qui en porte déjà un : celles dont
 *   le modèle ne redéfinit pas son propre fond laissaient voir celui de la
 *   fenêtre au travers, et promettaient une allure qu'elles n'auraient pas ;
 * — la remise à zéro écrit son avertissement en rouge, d'un rouge qui ne
 *   s'accorde à aucun fond puisqu'il ne vient d'aucun jeton. Sur un habillage
 *   coloré il devenait illisible, et c'est le seul écran du plan où quelque
 *   chose se perd sans retour.
 *
 * La classe va sur la fenêtre et non sur le voile qui la porte : celui-ci doit
 * rester le gris sombre qui met le plan en retrait, et prendrait sinon le
 * dégradé du modèle sur tout l'écran.
 */
const GENRES_OUTIL = ["large", "outil"];
export function habilleModale(){
  const m = $("modale");
  const fen = m && m.querySelector(".mfen");
  if (!fen) return;
  const porte = GENRES_OUTIL.indexOf(m.dataset.genre || "") < 0;
  const cle = modeleRetenu();
  MODELES.forEach(x =>
    fen.classList.toggle("modele-" + x.cle, porte && x.cle === cle));
}
