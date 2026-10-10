/* ============================================================
   10. Mode administration — son ouverture, et la bande de l'outil

   L'ouverture du mode, une fois l'identité vérifiée : la porte authentifiée
   (`modules/acces-admin.mjs`) l'appelle, et rien d'autre. Elle pose l'état
   (`modules/mode-admin.mjs` `ADMIN`, que tout le plan lit), garnit la bande
   de l'outil et rend les dessins cliquables.

   Un module de l'administration : `plan-admin.mjs` l'embarque, le visiteur ne
   le reçoit jamais. La fenêtre des réglages, les calques de dessin et leur
   panneau, le ton de la barre du système s'importent : il n'a rien à
   recevoir de personne. La porte authentifiée, qui ne peut l'importer
   sans boucle, reçoit de lui l'ouverture du mode en se chargeant.
   ============================================================ */
import { $ } from "./dom.mjs";
import { confieALAcces } from "./acces-admin.mjs";
import { ADMIN, ouvreModeAdmin } from "./mode-admin.mjs";
import { boutonCodeIci } from "./affiche-ici.mjs";
import { majAttente, pousseConfiguration, brancheSauvegarde } from "./enregistrement.mjs";
import { MONTE } from "./rendu.mjs";
import { poseTonDeLaBarre } from "./ton-barre.mjs";
import { ouvreReglages } from "./reglages.mjs";
import { dessineDessins } from "./dessin.mjs";
import { construitPanneau } from "./ordre-trace.mjs";

/* Le plan monté s'importe (`rendu.mjs` `MONTE`) : `montePlan` le pose bien
   après le chargement du script, et on le lit à l'instant. */
const racine = document.documentElement;

/** Ouvre le mode administration, une fois l'identité vérifiée. */
export function activeAdmin(){
  if (ADMIN) return;
  ouvreModeAdmin();
  // l'outil de départ est la sélection : les dessins deviennent cliquables
  racine.classList.add("mode-edition");
  /* La bande de l'outil paraît, et la grille lui ouvre son rang. Elle attend
     que l'identité soit vérifiée : avant, la page n'est que le plan public
     derrière une fenêtre d'accès, et rien n'y est à nous. */
  racine.classList.add("mode-admin");
  const bande = $("bandeAdmin");
  if (bande) bande.hidden = false;
  const acts = $("bandeActs");
  const b = $("btnLayers");
  if (b){
    b.hidden = false;
    b.onclick = () => {
      const o = $("panel").classList.toggle("open");
      b.setAttribute("aria-pressed", o);
    };
  }
  const c = $("menuCompte");
  if (c) c.hidden = false;
  const r = $("btnReglages");
  /* Sans la lambda, le gestionnaire passe l'événement de clic en premier
     argument — soit, pour « ouvreReglages », le nom du volet à ouvrir. Aucun
     onglet ne s'appelant « [object PointerEvent] », la fenêtre s'ouvrait sur
     rien : ni onglet actif, ni contenu. */
  if (r){ r.hidden = false; r.onclick = () => ouvreReglages(); }
  /* Les commandes de l'outil quittent le bandeau du salon pour la bande du
     dessus, dans l'ordre où l'on s'en sert. Elles y portaient l'habillage
     choisi par l'exploitant — cerclées sous « Billet », à angle vif sous
     « Grille » — alors qu'elles ne sont pas de son plan. */
  if (acts) [b, boutonCodeIci(), r, c].forEach(el => { if (el) acts.appendChild(el); });
  const barre = document.createElement("div");
  barre.className = "adminbar";
  /* Copier et importer une configuration servaient à la transporter d'un poste
     à l'autre, faute de mieux. Maintenant qu'elle s'enregistre, ils n'ajoutent
     qu'un chemin de plus pour arriver au même endroit. Rétablir les valeurs
     d'origine est parti pour l'inverse : un clic effaçait sans confirmation
     tout le travail de calques et de libellés, pour un besoin qui ne se
     présente jamais.

     La sauvegarde emportée, elle, revient — mais pour l'autre raison. Ce n'est
     pas un moyen de transport : c'est le seul exemplaire qui ne dépende ni de
     la base ni de ce navigateur, et le jour où les deux ont dit des choses
     différentes, c'est un fichier tenu à part qui a permis de trancher.

     L'état de l'enregistrement, lui, n'est plus ici : il mène la bande de
     l'outil. Au pied d'un panneau qui reste fermé la plupart du temps, il
     s'annonçait à personne — c'est pour cela qu'un échec avait fallu doubler
     d'une alerte en travers de l'écran (voir `ditAlerte`). « majAttente »
     l'habille, où qu'il soit. */
  barre.innerHTML =
    '<button class="reset" id="sauveConf">Télécharger une sauvegarde</button>' +
    '<button class="reset" id="restaureConf">Restaurer une sauvegarde…</button>' +
    '<input type="file" id="fichierConf" accept="application/json,.json" hidden>';
  $("panel").appendChild(barre);
  const pousse = document.createElement("button");
  pousse.className = "reset fort";
  pousse.id = "pousseConf";
  pousse.onclick = () => pousseConfiguration();
  // en tête des commandes : c'est le seul qui dise ce qu'on n'a pas demandé
  if (acts) acts.insertBefore(pousse, acts.firstChild);
  else barre.prepend(pousse);
  brancheSauvegarde();
  /* Le plan a pu être monté avant que l'identité soit vérifiée : une page à
     données figées démarre sans rien attendre. Le panneau des calques n'a
     alors pas été construit — montePlan() n'en bâtit qu'en administration —
     et les dessins ne sont pas cliquables. C'est à cela que sert ce drapeau,
     qui jusqu'ici ne servait à rien. */
  if (MONTE){ dessineDessins(); construitPanneau(); }
  majAttente();
  /* La nuit de la marque touche désormais le haut de l'écran : c'est elle que
     la barre du système prolonge, et non plus le bandeau du salon. */
  poseTonDeLaBarre();
}

/* La porte authentifiée (`acces-admin.mjs`) est importée, par
   l'enregistrement, avant ce module : elle ne peut l'importer sans boucle.
   L'ouverture du mode lui est donc confiée dès que la page d'administration
   charge celui-ci, bien avant que la session soit vérifiée. */
confieALAcces({ activeAdmin });
