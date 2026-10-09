/* ============================================================
   La case de l'invitation à installer, dans l'onglet « Admin » des réglages

   Un module de l'administration : `plan-admin.mjs` l'embarque, le visiteur ne
   le reçoit jamais. Ce que le visiteur voit — l'invitation, le rappel de
   l'application installée — est dans `installation.mjs`.
   ============================================================ */
import { reglageInstallation, invitationVoulue, ouvreInvitation, ouvreRappel }
  from "./installation.mjs";

/* L'envoi de la configuration, que le code soudé tient encore
   (`_ordre-fiche.html`) et que le branchement confie. */
/** @type {() => void} */
let enregistreConf;

/**
 * Le branchement du réglage, appelé par le code soudé à la place que ce code y
 * tenait (`_installation.html`), dans une tranche que le visiteur ne reçoit pas.
 *
 * @param {{ enregistreConf: typeof enregistreConf }} b
 */
export function brancheReglageInstallation(b){
  enregistreConf = b.enregistreConf;
}

/**
 * La case, dans l'onglet « Admin » des réglages : une fenêtre de plus, c'est
 * encore ce que les visiteurs voient.
 *
 * Avec deux aperçus, parce que l'organisateur règle son salon depuis un
 * ordinateur, où la fenêtre ne paraîtra jamais : sans eux, il allumerait une
 * chose qu'il n'a jamais vue.
 */
export function caseInstallation(bloc){
  const l = document.createElement("label");
  l.innerHTML = '<input type="checkbox"><span></span>';
  l.querySelector("span").textContent = "Inviter les visiteurs à installer le plan";
  const c = l.querySelector("input");
  c.checked = invitationVoulue();
  c.onchange = e => {
    reglageInstallation().active = e.target.checked;
    enregistreConf();
  };
  bloc.appendChild(l);

  const aide = document.createElement("p");
  aide.className = "aideR";
  aide.dataset.reglage = "installation";
  aide.innerHTML = "Sur téléphone et tablette, quand le plan est ouvert dans le " +
    "navigateur : une fenêtre propose de l'ajouter à l'écran d'accueil, dès " +
    "l'ouverture. Une autre rappelle l'application à qui l'a déjà, dix " +
    "secondes après l'ouverture. Une fois par jour au plus chacune, et plus " +
    "du tout après deux refus. Aperçu de l'invitation : " +
    '<button type="button" class="apercuInst" data-facon="bouton">Android</button> · ' +
    '<button type="button" class="apercuInst" data-facon="partage">iPhone</button>' +
    ". Du rappel : " +
    '<button type="button" class="apercuInst" data-facon="rappel:ouvrir">Android</button> · ' +
    '<button type="button" class="apercuInst" data-facon="rappel:suggerer">iPhone</button>';
  /* Les deux rappels se montrent l'un comme l'autre : sur Android la page sait
     l'application posée, sur iPhone elle ne peut que la suggérer, et
     l'organisateur qui allume la case mérite de voir ce que chacun lira. */
  const APERCUS = {
    "rappel:ouvrir": () => ouvreRappel("ouvrir", true),
    "rappel:suggerer": () => ouvreRappel("suggerer", true),
  };
  aide.querySelectorAll(".apercuInst").forEach(b => {
    const propre = APERCUS[b.dataset.facon];
    b.onclick = () => propre ? propre() : ouvreInvitation(b.dataset.facon, true);
  });
  bloc.appendChild(aide);
}
