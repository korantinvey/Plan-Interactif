/* ============================================================
   Le lancement du plan — ce que le script soudé faisait encore

   Le code du plan a longtemps été un seul script, fait de morceaux mis bout à
   bout (`outils/gabarit/_*.html`). Ses morceaux sont devenus des modules un à
   un ; il ne restait du script qu'une suite d'appels `brancheX()`, posés là
   où chaque morceau tenait sa place. Cette suite vit ici, et le script soudé
   n'existe plus.

   **L'ordre est le comportement.** Chaque branchement pose des écoutes — sur
   le plan, la page, la fenêtre —, et l'ordre de ces écoutes décide qui reçoit
   un événement le premier : « Échap » referme la fenêtre avant le tiroir
   parce que l'une s'écoute avant l'autre. La suite est donc exactement celle
   du script d'avant, morceau par morceau ; on n'y change un rang qu'en
   sachant ce qu'il déplace.

   **Le moment aussi.** Le script des modules est posé après tout le balisage
   et les données, là où commençait le script soudé : la suite s'exécute à
   l'instant où celui-ci s'exécutait, le document entier déjà lu, avant
   `DOMContentLoaded`.

   **Ce que seule l'administration a** s'intercale dans la suite publique, aux
   rangs que les tranches `@admin` tenaient : le point d'entrée de
   l'administration (`plan-admin.mjs`) remplit ces emplacements avant de
   lancer (`confieLancementAdmin`) ; la page publique les laisse vides. C'est
   pourquoi chaque point d'entrée lance lui-même, à la fin de son chargement :
   l'administration reprend tout le plan public avant d'y ajouter ses modules,
   et la suite doit attendre qu'ils soient là.
   ============================================================ */
import { brancheErreurs } from "./erreurs.mjs";
import { brancheTonDeLaBarre } from "./ton-barre.mjs";
import { brancheBandes } from "./bandes.mjs";
import { brancheRecherche } from "./recherche.mjs";
import { brancheLignesListe } from "./ligne-liste.mjs";
import { brancheVue } from "./vue.mjs";
import { brancheFiche } from "./fiche.mjs";
import { brancheGestes, brancheLangue } from "./gestes.mjs";
import { brancheTiroirs } from "./tiroirs.mjs";
import { brancheHabillage } from "./habillage.mjs";
import { brancheFenetre } from "./fenetre.mjs";
import { brancheTiroirParcours } from "./tiroir-parcours.mjs";
import { branchePartage } from "./partage.mjs";
import { brancheTiroirItineraire } from "./tiroir-itineraire.mjs";
import { brancheBorne } from "./borne.mjs";
import { brancheIci } from "./ici.mjs";
import { brancheJournee } from "./journee.mjs";
import { brancheMesure } from "./mesure.mjs";
import { brancheInstallation } from "./installation.mjs";
import { brancheWebgl } from "./webgl.mjs";
import { brancheSponsor } from "./sponsor.mjs";
import { brancheDemarrage } from "./demarrage.mjs";

/**
 * Les emplacements de l'administration, chacun au rang d'une tranche `@admin`
 * du script d'avant. Vides sur la page publique.
 * @typedef {object} EtapesAdmin
 * @property {() => void} apresLesGestes les gestes de l'exploitant, dans la chaîne des appuis
 * @property {() => void} apresLHabillage nuancier, placement des libellés, outil de dessin,
 *   reprise des emplacements, halls d'un lieu connu, enregistrement
 * @property {() => void} apresLaMesure carte de chaleur, calage de la carte
 * @property {() => void} apresLeDemarrage la fenêtre d'accès et le menu du compte
 */
/** @type {EtapesAdmin} */
const admin = {
  apresLesGestes: () => {}, apresLHabillage: () => {}, apresLaMesure: () => {}, apresLeDemarrage: () => {},
};

/** La porte du point d'entrée de l'administration, ouverte avant de lancer.
 *  @param {Partial<EtapesAdmin>} o */
export function confieLancementAdmin(o){ Object.assign(admin, o); }

/** La suite des branchements, dans l'ordre du script d'avant. */
export function lancePlan(){
  /* Sans viewport, un mobile rend la page dans un viewport virtuel de 980 px :
     les requêtes média ne se déclenchent pas et tout est réduit à la loupe.
     Les pages construites en portent une, posée par `outils/genere.js` avec
     ou sans le `viewport-fit` qui les étend sous les barres du système : ce
     repli-ci ne sert donc qu'au gabarit ouvert tel quel, et il demande la
     même chose. */
  if (!document.querySelector('meta[name="viewport"]')){
    const mv = document.createElement("meta");
    mv.name = "viewport";
    mv.content = "width=device-width, initial-scale=1, viewport-fit=cover";
    document.head.appendChild(mv);
  }
  /* Les erreurs signalées, en premier : elles couvrent ainsi tout ce qui suit.
     Un rang que le script d'avant n'avait pas — ses écoutes ne reçoivent que
     des erreurs, que nulle autre n'écoute. */
  brancheErreurs();
  // la couleur de la barre du système, refaite au franchissement du seuil du téléphone
  brancheTonDeLaBarre();
  // recherche et secteurs ; la recherche pose aussi l'écoute des polices, avant celle du rendu WebGL
  brancheBandes();
  brancheRecherche();
  // ce qu'ouvre une ligne de la liste : avant le repli des tiroirs
  brancheLignesListe();
  // la vue, avant le recadrage que le démarrage pose sur « resize »
  brancheVue();
  // la fiche
  brancheFiche();
  // les gestes : pincement, outils de l'exploitant, puis le visiteur ; la langue en dernier
  brancheGestes();
  admin.apresLesGestes();
  brancheTiroirs();
  brancheLangue();
  // l'habillage pose la barre au premier trait, puis les outils de l'exploitant
  brancheHabillage();
  admin.apresLHabillage();
  // les fenêtres, à leur place parmi les écoutes : « Échap » les referme d'abord
  brancheFenetre();
  brancheTiroirParcours();
  branchePartage();
  brancheTiroirItineraire();
  brancheBorne();
  brancheIci();
  brancheJournee();
  brancheMesure();
  admin.apresLaMesure();
  brancheInstallation();
  brancheWebgl();
  brancheSponsor();
  // la page démarre une fois tout le reste posé — sur la page publique, il
  // retire aussi les commandes de l'exploitant (`demarrage.mjs`)
  brancheDemarrage();
  admin.apresLeDemarrage();
}
