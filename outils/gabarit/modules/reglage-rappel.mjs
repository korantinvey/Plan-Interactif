/* ============================================================
   Le rappel avant une conférence, dans l'onglet « Admin » des réglages

   Un module de l'administration : `plan-admin.mjs` l'embarque, le visiteur ne
   le reçoit jamais. Le volet « Admin » (`volets.mjs`) y pose le bloc ; ce que
   le visiteur voit — l'interrupteur du tiroir, la fenêtre qui propose le
   rappel — est dans `rappels.mjs`, l'essai réel dans `essai-rappel.mjs`.
   ============================================================ */
import { RAPPEL_MIN, RAPPEL_MAX, reglageRappel, rappelsVoulus, minutesRappel, proposeRappels }
  from "./rappels.mjs";
import { essaieRappelReel } from "./essai-rappel.mjs";
/* L'option du programme et l'enregistrement de la configuration
   s'importent : rien ne lui est confié. */
import { programmeOffert, enregistreConf } from "./configuration.mjs";

/**
 * Le rappel avant une conférence.
 *
 * Deux commandes, parce que ce sont deux décisions : offrir la chose, et à
 * quelle avance. Un salon qui n'a pas de programme n'a rien à rappeler ; un
 * salon tenu dans un hall de cinq cents mètres ne prévient pas à la même
 * minute qu'un salon de trois allées.
 *
 * L'aide dit ce que le visiteur devra accepter, et ce que certains n'auront
 * pas. L'exploitant a le droit de le savoir avant de cocher : ce qu'il active
 * ici ne marchera pas pour tout le monde, et une promesse faite sur la
 * plaquette du salon se retournerait contre lui.
 *
 * La case vit dans un conteneur à elle, et pas nue dans le volet : le style
 * des réglages est écrit sous `.reglages`, et une case posée à côté retombait
 * au corps par défaut du navigateur — grosse, noire, désalignée au milieu de
 * ses voisines.
 */
export function blocRappel(hote){
  /* Sans programme, il n'y a pas d'heure à rappeler. La case reste, éteinte
     plutôt que décochée, comme les sortes de la recherche : le choix fait
     vaudra le jour où l'option se rouvrira. */
  const offert = programmeOffert();
  const bloc = document.createElement("div");
  bloc.className = "reglages";
  hote.appendChild(bloc);

  const l = document.createElement("label");
  l.innerHTML = '<input type="checkbox"><span></span>';
  l.querySelector("span").textContent = "Rappeler les conférences retenues";
  if (!offert) l.classList.add("eteint");
  const c = l.querySelector("input");
  c.checked = rappelsVoulus();
  c.disabled = !offert;
  bloc.appendChild(l);

  const aide = document.createElement("p");
  aide.className = "aideR";
  aide.dataset.reglage = "rappel";
  aide.textContent = offert
    ? "Le visiteur qui a retenu une conférence peut demander à " +
      "en être prévenu, plan fermé. Il lui faut l'autoriser, et sur iPhone avoir " +
      "ajouté le plan à son écran d'accueil — sans quoi rien n'est proposé. Les " +
      "heures et les titres retenus sont alors gardés sur nos serveurs jusqu'à " +
      "la conférence."
    : "Le programme de conférences n'est pas pris sur ce salon : il n'y a pas " +
      "d'horaire à rappeler.";
  bloc.appendChild(aide);

  /* La fenêtre qui propose le rappel au visiteur ne paraît jamais ici : le plan
     d'administration n'a pas de visiteur, et `rappelsOfferts` s'y refuse. Sans
     cet aperçu, l'exploitant cocherait une fenêtre qu'il n'a jamais vue — c'est
     le même besoin que l'invitation à installer, et la même réponse.

     L'essai va plus loin, parce que la fenêtre ne prouve que la fenêtre : il
     poste un vrai rappel sur cet appareil, pour dans une demi-minute, et ce
     qui arrive alors dit d'un coup si les clés, la tâche de la minute et le
     service de second plan répondent. */
  if (offert){
    aide.appendChild(document.createTextNode(" "));
    const apercu = document.createElement("button");
    apercu.type = "button";
    apercu.className = "apercuRappel";
    apercu.textContent = "Aperçu";
    apercu.onclick = () => proposeRappels(true);
    aide.appendChild(apercu);

    aide.appendChild(document.createTextNode(" · "));
    const essai = document.createElement("button");
    essai.type = "button";
    essai.className = "apercuRappel";
    essai.textContent = "Essayer un vrai rappel";
    aide.appendChild(essai);

    /* Ce que l'essai a donné, sous l'aide plutôt que dedans : le texte change,
       et une phrase qui remplace un morceau d'une autre se relit mal. */
    const etat = document.createElement("p");
    etat.className = "aideR";
    etat.hidden = true;
    bloc.appendChild(etat);

    essai.onclick = async () => {
      essai.disabled = true;
      ditEssaiRappel(etat, "envoi");
      /* Un navigateur qui rejette la demande d'autorisation, au lieu de rendre
         « refusé », laissait le bouton éteint sur « Envoi… » indéfiniment. */
      try {
        ditEssaiRappel(etat, await essaieRappelReel());
      } catch (e) {
        ditEssaiRappel(etat, "panne");
      } finally {
        essai.disabled = false;
      }
    };
  }

  const duree = document.createElement("div");
  duree.className = "reglage-nb";
  duree.innerHTML = '<label><span class="l"></span>' +
    '<input type="number" min="' + RAPPEL_MIN + '" max="' + RAPPEL_MAX + '" step="5">' +
    '<span class="u">min</span></label>';
  duree.querySelector(".l").textContent = "Prévenir avant le début";
  const n = duree.querySelector("input");
  n.value = minutesRappel();
  n.oninput = e => {
    const v = Math.round(+e.target.value);
    if (v >= RAPPEL_MIN && v <= RAPPEL_MAX){ reglageRappel().minutes = v; enregistreConf(); }
  };
  n.onblur = () => { n.value = minutesRappel(); };
  hote.appendChild(duree);

  const suit = () => {
    const actif = offert && rappelsVoulus();
    duree.hidden = !actif;
    n.value = minutesRappel();
  };
  c.onchange = e => { reglageRappel().actif = e.target.checked; enregistreConf(); suit(); };
  suit();
}

/**
 * Ce que l'essai a donné, en une phrase.
 *
 * Chaque issue en a une, et « sans service » en est une à part : ce n'est ni
 * une panne ni un refus, mais le service de second plan qui n'est pas encore
 * posé sur ce navigateur. Le plan public le pose en s'ouvrant ; la page
 * d'administration ne le fait pas, et ne doit pas le faire — elle passerait
 * sous son cache, et se servirait un jour périmée.
 */
function ditEssaiRappel(etat, issue){
  const phrases = {
    envoi: "Envoi…",
    ok: "Posé. La notification doit arriver dans la minute qui suit.",
    refus: "Les notifications n'ont pas été autorisées sur ce navigateur.",
    sansService: "Ouvrez d'abord votre plan public une fois sur ce navigateur : " +
      "c'est lui qui installe le service qui reçoit les notifications.",
    nonPublie: "Le salon n'est pas publié : le serveur refuse d'enregistrer un rappel.",
    impossible: "Ce navigateur ne sait pas recevoir de notifications. Sur iPhone, " +
      "il faut avoir ajouté le plan à l'écran d'accueil.",
    panne: "Le rappel n'a pas pu être posé. Réessayez dans un instant.",
  };
  etat.textContent = phrases[issue] || phrases.panne;
  etat.hidden = false;
}
