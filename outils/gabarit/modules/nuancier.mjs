/* ============================================================
   La rafale du sélecteur de couleur — l'exploitant seul

   Un nuancier n'envoie pas un événement par couleur retenue : le sélecteur du
   système en envoie une rafale pendant qu'on glisse, plusieurs dizaines par
   seconde. Peindre à ce rythme se tient — c'est une variable CSS, ou la
   couleur d'un groupe. Retenir, non : sérialiser toute la configuration ou
   tous les dessins vers le poste, rebâtir le SVG des calques, refaire la
   nappe d'itinéraire, cela demande plus de temps qu'il n'en reste entre deux
   événements. Le retard s'accumule alors, et sur un salon chargé — mille
   stands, des calques dessinés — la couleur traîne plusieurs secondes
   derrière la souris.

   On sépare donc les deux gestes : la peinture suit la main, la mémoire
   attend qu'elle s'arrête. Rien ne part en base pour autant — la publication
   reste un geste à part.

   Seul l'exploitant tient un nuancier — la pile des calques (`pile.mjs`),
   les volets (`volets.mjs`), le dessin (`outil-dessin.mjs`). Ce module n'est
   embarqué que par `plan-admin.mjs`, et ses écoutes de page quittée se posent
   par `brancheNuancier`, à son rang dans le lancement.
   ============================================================ */

/** Le temps d'immobilité, en millisecondes, au bout duquel la couleur est
 *  retenue. Assez court pour qu'un clic sur une pastille paraisse immédiat,
 *  assez long pour traverser une rafale sans en écrire une seule image. */
export const REPOS_NUANCIER = 200;

/* Deux dixièmes de seconde suffisent à fermer un onglet : ce qui attend encore
   est noté ici, et part avant que la page ne s'en aille. Aux deux moments que
   l'enregistrement (`enregistrement.mjs`) guette, et avant lui — ce module se
   branche le premier, donc la couleur est écrite quand il presse l'envoi. */
const NUANCIERS_EN_ATTENTE = new Set();
const presseNuanciers = () => NUANCIERS_EN_ATTENTE.forEach(fixe => fixe());

/** Le branchement, appelé par `plan-admin.mjs` dans l'emplacement que le
 *  lancement lui ouvre après l'habillage (`lancement.mjs`
 *  `confieLancementAdmin`) : les écoutes y passent devant celles de
 *  l'enregistrement (`brancheEnregistrement`). */
export function brancheNuancier(){
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") presseNuanciers();
  });
  addEventListener("pagehide", presseNuanciers);
}

/**
 * Branche un sélecteur de couleur : `peint` à chaque événement reçu, `retient`
 * une fois le glissement fini.
 *
 * `change` ne clôt pas le geste partout — certains navigateurs l'envoient au
 * fil du glissement, comme `input`. On ne s'y fie donc pas : c'est le temps de
 * repos qui décide, et quitter le champ presse ce qui attendait.
 *
 * Rend la fonction qui presse, pour qui a une autre raison de conclure.
 */
export function suitNuancier(input, peint, retient){
  let minuteur = null;
  const fixe = () => {
    if (!minuteur) return;
    clearTimeout(minuteur); minuteur = null;
    NUANCIERS_EN_ATTENTE.delete(fixe);
    retient();
  };
  input.oninput = input.onchange = e => {
    peint(e.target.value);
    if (minuteur) clearTimeout(minuteur);
    minuteur = setTimeout(fixe, REPOS_NUANCIER);
    NUANCIERS_EN_ATTENTE.add(fixe);
  };
  input.onblur = fixe;
  return fixe;
}
