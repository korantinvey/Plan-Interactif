/* ============================================================
   Partager son parcours, et en garder une copie

   Deux visiteurs viennent ensemble, un seul a préparé la journée. Jusqu'ici le
   second n'avait qu'à refaire la liste à la main, stand par stand.

   Le partage se fait donc d'appareil à appareil, sans rien demander à
   personne : un code affiché à l'écran, que l'autre téléphone photographie, ou
   le lien qu'on envoie par le moyen déjà installé — la feuille de partage du
   système ouvre WhatsApp, Messenger, Teams, un courriel, ce qu'on veut.

   Le parti pris tient en une phrase : **rien ne transite par le serveur**.
   Aucun code de partage à créer, à stocker, à faire expirer ; aucune adresse
   e-mail à recueillir, donc rien à déclarer, rien à effacer sur demande, et
   pas de bandeau de consentement de plus. La liste voyage entière dans
   l'adresse, et le plan la relit à l'arrivée.

   Ce que cela coûte, en retour : le lien porte autant de caractères qu'il y a
   d'étapes, et un parcours très long finit par faire un code dense. C'est le
   seul plafond, et il se voit — la fenêtre le dit et s'en tient au lien.

   Le codage du lien est à part, sans rien du navigateur
   (`modules/lien-parcours.mjs`). L'accueil d'un parcours reçu aussi
   (`modules/parcours-recu.mjs`) : il verse dans le tiroir, qui importe ce
   module-ci pour la note de la copie à garder.

   Le module se branche dans `_partage.html`, à la place que son bouton y
   tenait. La configuration du salon, il l'importe (`configuration.mjs`).
   ============================================================ */
import { $ } from "./dom.mjs";
import { SLUG, cheminPartageable, BORNE } from "./salon.mjs";
import { mesure } from "./mesure.mjs";
import { ouvreModale, fermeModale, poseApresFermeture } from "./fenetre.mjs";
import { QR_VERSION_LISIBLE, qrTrame, qrSvg } from "./qr.mjs";
import { DATA } from "./donnees.mjs";
import { PARCOURS, tientLeStockage } from "./parcours.mjs";
import { codeParcours } from "./lien-parcours.mjs";
import { conf } from "./configuration.mjs";

/**
 * L'adresse du plan, telle qu'un autre appareil doit la recevoir.
 *
 * Elle se relit dans la barre du navigateur plutôt qu'elle ne se compose :
 * c'est la seule qu'on sache joignable, puisque c'est celle qui a servi à
 * ouvrir cette page-ci. La page d'administration fait exception — elle réclame
 * une session que le visiteur d'en face n'a pas — et renvoie vers la page
 * publique qui vit à côté, comme le fait déjà son écran d'accès.
 */
function lienParcours(){
  const u = new URL(location.href);
  u.hash = "";
  u.pathname = cheminPartageable(u.pathname);
  /* Le salon est nommé même quand la page l'aurait deviné : le lien vaut alors
     ce qu'il dit, et n'ouvrira pas l'édition suivante le jour où c'est elle qui
     devient le salon par défaut. */
  u.search = SLUG ? "?plan=" + encodeURIComponent(SLUG) : "";
  return u.toString() + "#" + codeParcours(PARCOURS);
}

/* Le code QR, sans bibliothèque : `modules/qr.mjs`. */

/* ------------------------------------------------------------
   La fenêtre de partage
   ------------------------------------------------------------ */
export function ouvrePartageParcours(){
  const lien = lienParcours();
  const trame = qrTrame(Array.from(new TextEncoder().encode(lien)));
  const lisible = trame && (trame.length - 17) / 4 <= QR_VERSION_LISIBLE;

  ouvreModale("Partager mon parcours", corps => {
    const p = document.createElement("p");
    p.textContent = lisible
      ? "Faites photographier ce code : le plan s'ouvrira sur le même parcours."
      : "Ce parcours porte trop d'étapes pour un code lisible de loin. " +
        "Envoyez le lien, il fait le même travail.";
    corps.appendChild(p);

    if (lisible){
      const plaque = document.createElement("div");
      plaque.className = "qrPlaque";
      plaque.innerHTML = qrSvg(trame);
      corps.appendChild(plaque);
    }

    /* Le lien en toutes lettres, et non caché derrière le seul bouton : sur un
       ordinateur il se sélectionne à la souris, et il montre au passage qu'il
       ne contient ni compte ni adresse — ce que la phrase suivante affirme. */
    const champ = document.createElement("textarea");
    champ.className = "qrLien";
    champ.readOnly = true;
    champ.rows = 2;
    champ.value = lien;
    champ.onclick = () => champ.select();
    corps.appendChild(champ);

    const note = document.createElement("p");
    note.className = "qrNote";
    note.textContent = "Le parcours tient dans le lien lui-même : rien n'est " +
      "enregistré sur nos serveurs, et il n'y a ni compte ni adresse e-mail à donner.";
    corps.appendChild(note);
  }, boutonsPartage(lien), "partage");
}

/**
 * Les boutons du pied, selon ce que l'appareil sait faire.
 *
 * `compte` dit si le geste est un partage. Il l'est quand la liste part à
 * quelqu'un d'autre, et pas quand elle part à soi-même : « huit parcours
 * partagés » doit se lire « huit visiteurs ont donné leur liste à quelqu'un »,
 * et une copie de sauvegarde n'est pas cela. Faute de quoi, la seule question
 * que le chiffre sache trancher — est-ce que cela arrive à quelqu'un ? — se
 * serait brouillée le jour même où l'on a posé la copie.
 *
 * `navigator.share` est la feuille de partage du système : c'est elle qui
 * ouvre WhatsApp, Messenger, Teams ou le courrier, avec ce que le visiteur y a
 * déjà installé — nous n'avons aucune liste d'applications à tenir, et aucune
 * de ces applications n'a à savoir que ce plan existe. Elle manque sur la
 * plupart des navigateurs de bureau ; la copie prend alors la tête, et le
 * lien se colle où l'on veut.
 */
function boutonsPartage(lien, compte){
  const partageable = typeof navigator.share === "function";
  /* Le geste d'envoyer se compte à part des ajouts : envoyer sa liste ne
     l'allonge ni ne la raccourcit, et c'est l'autre moitié de la seule question
     qui vaille — on partage, mais est-ce que cela arrive à quelqu'un ?

     Une fois par fenêtre ouverte, et non par clic : copier puis envoyer, ou
     recopier parce qu'on a raté son collage, reste un seul parcours partagé.
     Copier compte comme envoyer — sur un ordinateur c'est le seul geste
     possible, et l'écarter ferait paraître la fonction inutilisée au bureau. */
  let fait = false;
  const envoi = () => {
    if (compte === false || fait) return;
    fait = true;
    mesure("partage");
  };

  // retrouvé une fois : son libellé change en route, et ne le désignerait plus
  let bCopie = null;
  const copie = {
    libelle: "Copier le lien", ferme: false, genre: partageable ? "" : "accent",
    action: () => {
      envoi();
      /* Le libellé se relit à l'écran, où la version anglaise l'a peut-être
         réécrit : c'est donc à sa traduction qu'on le compare. */
      bCopie = bCopie ||
        [...$("mPied").children].find(x => x.textContent === traduit("Copier le lien"));
      copieLien(lien).then(
        () => { if (bCopie){ bCopie.textContent = "Copié";
                             setTimeout(() => bCopie.textContent = "Copier le lien", 1700); } },
        () => { if (bCopie) bCopie.textContent = "Échec de la copie"; aCopierALaMain(); });
    },
  };
  const boutons = [{ libelle: "Fermer" }, copie];
  if (partageable) boutons.push({
    libelle: "Partager…", genre: "accent", ferme: false,
    /* Le geste est compté avant, parce qu'un envoi abandonné à mi-chemin ne se
       distingue pas d'un envoi réussi : la feuille ne dit pas où le lien est
       parti. La fenêtre ne se ferme qu'une fois le lien remis à la feuille :
       c'est elle qui porte le repli quand la feuille est refusée. */
    action: () => {
      envoi();
      /* La feuille de partage est au système, hors de la page : la version
         anglaise ne la voit pas passer, le texte part donc déjà traduit. */
      return navigator.share({
        title: traduit("Mon parcours de visite"),
        text: (DATA && DATA.evenement ? DATA.evenement + " — " : "") +
              traduit("voici les stands et les conférences que j'ai retenus."),
        url: lien,
      }).then(() => fermeModale(), (e) => {
        /* Refermer la feuille sans rien choisir n'est pas une panne : la
           fenêtre reste là, et rien ne se dit. Tout autre refus vient de plus
           haut — un cadre que le site hôte n'a pas autorisé à partager, une vue
           web d'application qui n'en a pas le moyen. La feuille existe, mais
           ne s'ouvrira jamais : on passe au lien copié, plutôt que de laisser
           un bouton qui ne répond plus. */
        if (e && e.name === "AbortError") return;
        copie.action();
      });
    },
  });
  return boutons;
}

/**
 * Mettre le lien dans le presse-papiers, par la voie qui marche ici.
 *
 * L'API du presse-papiers d'abord. Elle manque hors d'une adresse sûre, et se
 * refuse dans un cadre que la page hôte n'a pas autorisé à écrire — le cas
 * d'un plan embarqué dans le site d'un salon, ou dans une application. Reste
 * alors la vieille commande de copie, sur le champ du lien que la fenêtre
 * montre : dépréciée, mais tenue par tous les navigateurs, et permise à un
 * cadre pour peu qu'elle suive un geste du visiteur.
 */
function copieLien(lien){
  const ancienne = () => {
    const champ = champDuLien();
    if (!champ) return Promise.reject();
    champ.focus();
    champ.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (e) {}
    return ok ? Promise.resolve() : Promise.reject();
  };
  return navigator.clipboard
    ? navigator.clipboard.writeText(lien).catch(ancienne)
    : ancienne();
}

/** Le champ qui montre le lien, dans la fenêtre ouverte. */
const champDuLien = () =>
  /** @type {HTMLTextAreaElement | null} */ ($("mCorps").querySelector(".qrLien"));

/**
 * Le dernier recours : le lien sélectionné, et la phrase qui dit quoi en faire.
 *
 * Quand ni la feuille de partage ni le presse-papiers ne sont permis, la page
 * ne peut plus rien pour le visiteur — sinon lui tendre le lien prêt à copier
 * de ses doigts. Le dire vaut mieux qu'un bouton muet : sans cette phrase, le
 * visiteur conclut que le partage ne marche pas, et c'est tout ce qu'il retient.
 */
function aCopierALaMain(){
  const champ = champDuLien();
  if (!champ) return;
  champ.focus();
  champ.select();
  if (champ.nextElementSibling?.classList.contains("qrRefus")) return;
  const p = document.createElement("p");
  p.className = "qrNote qrRefus";
  p.textContent = "Cette page ne nous laisse pas copier pour vous : le lien " +
    "est sélectionné, copiez-le puis collez-le où vous voulez.";
  champ.after(p);
}

/* ------------------------------------------------------------
   La copie qu'on se garde

   Le lien du partage porte le parcours entier, sans serveur ni compte. On l'a
   fait pour le donner à quelqu'un ; il sait faire une autre chose, et la même
   à un détail près — se le donner à soi-même.

   Ce détail est ce qui manquait à une liste préparée longtemps à l'avance. Elle
   ne vit que dans le stockage du navigateur, et un navigateur fait le ménage :
   Safari efface tout ce qu'une page a écrit après sept jours sans revenir sur
   le site, Chrome et Firefox jettent sous la pression du disque, un téléphone
   se change, et sur iOS l'application installée démarre avec une mémoire à
   elle. Aucun de ces cas ne se répare depuis la page. Un lien posé dans une
   conversation, un courrier ou une note, si : il ne dépend plus de rien de ce
   que le navigateur garde, et il reste bon jusqu'au démontage des stands.

   D'où deux entrées vers une seule fenêtre, l'une et l'autre au moment où le
   visiteur a quelque chose à emporter. Une note au pied de la liste, qui est là
   tout le temps et ne se remarque pas ; et la fenêtre d'installation, qui est le
   seul endroit où la perte est certaine et non probable.

   Il y en avait une troisième, qui s'invitait au troisième rang retenu. Elle est
   retirée : au troisième rang la liste est en train de se faire, et proposer
   d'en garder une copie, c'est proposer d'emporter un travail inachevé. La copie
   ne vaut qu'une journée composée, et le pied de la liste l'attend là.

   Savoir s'il y a une liste à copier (`parcoursACopier`) précède l'une et
   l'autre : la réponse dépend de la configuration du salon.
   ------------------------------------------------------------ */
/** Y a-t-il une liste, et un visiteur à qui la rendre ? Une borne interactive
 *  se remet à zéro pour le suivant : elle n'a personne à qui garder quoi que
 *  ce soit. */
export const parcoursACopier = () => !BORNE && conf("_parcours").visible !== false &&
  !!(PARCOURS.stands.length + PARCOURS.confs.length);

/**
 * La fenêtre.
 *
 * Sans code QR, à la différence du partage : un écran ne se photographie pas
 * lui-même. Ce qui compte ici est le lien, et la feuille de partage du système
 * qui le pose là où on le retrouvera — les messages qu'on s'envoie, les notes,
 * le courrier.
 *
 * `apres` rend la main à la fenêtre d'où l'on vient : l'installation propose
 * cette copie au milieu de ses gestes, et le visiteur doit retrouver la liste
 * des gestes là où il l'avait laissée (`_modales.html`).
 */
function ouvreGardeParcours(apres){
  const lien = lienParcours();
  ouvreModale("Garder mon parcours", corps => {
    const p = document.createElement("p");
    p.textContent = "Envoyez-vous ce lien : il porte votre parcours entier. " +
      "Ouvert le jour du salon, il le remet en place — même sur un autre " +
      "téléphone, même si ce navigateur a fait le ménage entre-temps.";
    corps.appendChild(p);

    const champ = document.createElement("textarea");
    champ.className = "qrLien";
    champ.readOnly = true;
    champ.rows = 2;
    champ.value = lien;
    champ.onclick = () => champ.select();
    corps.appendChild(champ);

    const note = document.createElement("p");
    note.className = "qrNote";
    note.textContent = "Le parcours tient dans le lien lui-même : rien n'est " +
      "enregistré sur nos serveurs, et il n'y a ni compte ni adresse e-mail à donner.";
    corps.appendChild(note);
  }, boutonsPartage(lien, false), "partage");
  if (apres) poseApresFermeture(apres);
}

/* Le geste qui demande que la liste tienne, et la fenêtre qui s'ensuit. Les
   deux vont ensemble : c'est le seul moment où la question que Firefox pose
   sur le stockage se comprend — le visiteur vient de dire qu'il y tient
   (`tientLeStockage`). */
export const demandeGardeParcours = (apres) => {
  tientLeStockage(true);
  ouvreGardeParcours(apres);
};

/**
 * La note du pied de liste.
 *
 * Elle dit ce qui est vrai et ce que le visiteur ne peut pas deviner : cette
 * liste n'existe qu'ici. Pas d'alarme — la perte n'est pas certaine, et une
 * fenêtre rouge à chaque ouverture du tiroir ferait fuir de la fonction plutôt
 * que du risque. Une phrase, et le geste à côté.
 */
export function poseGardeParcours(hote){
  if (BORNE) return;
  const bloc = document.createElement("div");
  bloc.className = "pGarde";
  const p = document.createElement("p");
  p.textContent = "Ce parcours vit dans ce navigateur, et nulle part ailleurs : " +
    "un ménage, un téléphone changé, et il n'y est plus.";
  bloc.appendChild(p);
  const b = document.createElement("button");
  b.type = "button";
  b.className = "btn";
  b.textContent = "En garder une copie";
  b.onclick = () => demandeGardeParcours();
  bloc.appendChild(b);
  hote.appendChild(bloc);
}

/* ------------------------------------------------------------
   Le branchement
   ------------------------------------------------------------ */
/**
 * Appelé par `_partage.html` à la place que ce code tenait : le bouton du
 * tiroir s'y branche au même moment qu'avant.
 */
export function branchePartage(){
  $("btnPartage").onclick = ouvrePartageParcours;
}
