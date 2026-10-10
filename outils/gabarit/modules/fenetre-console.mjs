/* ============================================================
   La fenêtre de la console et du rapport

   Une seule fenêtre par-dessus l'écran, que la console et le rapport
   partagent avec leur socle (`_console-base.html`, qui en porte le balisage) :
   ouvrir, verrouiller, fermer, garder sa place, et les deux fenêtres qu'on en
   tire — une saisie, une confirmation. Ce n'est pas celle du plan
   (`modules/fenetre.mjs`) : elle n'a ni son habillage ni son ordre des calques.

   Les modules qui l'ouvrent l'importent. Ses écouteurs — la croix, le voile,
   la touche Échap — se posent par `poseFenetre`, que le socle appelle à la
   place qu'ils tenaient, en se branchant.
   ============================================================ */
import { $ } from "./dom.mjs";

/* ------------------------------------------------------------------
   Fenêtres
   ------------------------------------------------------------------ */
// Une fenêtre de réglage doit rafraîchir son résumé en se fermant, et elle se
// ferme de quatre façons : le bouton, la croix, l'arrière-plan, la touche
// Échap. D'où un rappel porté par la fermeture plutôt que par le bouton.
let apresModale = null;

/* Le rappel ne joue qu'une fois, et il joue toujours : une fenêtre remplacée
   par une autre — « Inviter quelqu'un » qui pose la fiche par-dessus la liste —
   n'est pas fermée, mais ce qu'elle tenait doit quand même être rendu. Écraser
   le rappel au lieu de le jouer laissait `hote` pointer sur un corps de fenêtre
   déjà réemployé, et la liste des comptes, en arrivant, effaçait le formulaire
   d'invitation en cours de saisie. */
function verseModale() {
  const f = apresModale;
  apresModale = null;
  if (f) f();
}

/**
 * @param {string} titre
 * @param {(corps: HTMLElement) => void} remplit
 * @param {Array<{ libelle: string, genre?: string, action?: () => any }>} boutons
 * @param {() => void} [apres]
 */
export function ouvreModale(titre, remplit, boutons, apres) {
  verseModale();
  modaleVerrou = false;
  apresModale = apres || null;
  $("mTitre").textContent = titre;
  $("mCorps").innerHTML = "";
  remplit($("mCorps"));
  $("mPied").innerHTML = "";
  boutons.forEach((b) => {
    const el = document.createElement("button");
    el.className = "btn" + (b.genre ? " " + b.genre : "");
    el.textContent = b.libelle;
    el.onclick = () => { if (b.action && b.action() === false) return; fermeModale(); };
    $("mPied").appendChild(el);
  });
  $("modale").classList.add("open");
}
/* Une fenêtre qui rend compte d'un travail en cours ne se ferme pas d'un clic
   à côté ni d'une touche Échap : la synchronisation, elle, continuerait sans
   personne pour la suivre, et son compte rendu serait perdu. Verrouillée, elle
   ne cède qu'à la croix et au bouton — deux gestes qu'on ne fait pas par
   mégarde. */
let modaleVerrou = false;
/** @param {boolean} oui */
export const verrouilleModale = (oui) => { modaleVerrou = !!oui; };

export const fermeModale = () => {
  modaleVerrou = false;
  $("modale").classList.remove("open");
  verseModale();
};

/** Les écouteurs de la fenêtre, posés par le socle à la place qu'ils y
 *  tenaient — après son balisage. */
export function poseFenetre() {
  $("mFermer").onclick = fermeModale;
  $("modale").addEventListener("click", (e) => {
    if (e.target === $("modale") && !modaleVerrou) fermeModale();
  });
  addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modaleVerrou) fermeModale();
  });
}

/**
 * Redessiner une fenêtre sans la faire remonter en haut.
 *
 * Une fenêtre qui se rouvre se remplit de zéro, et son corps repart au
 * premier réglage : les champs propres au salon sont tout en bas de la fiche
 * détail, si bien qu'en ajouter un renvoyait l'exploitant à mille pixels de
 * l'endroit où il travaillait. La place se relève au clic, et non au moment de
 * redessiner : la fenêtre de saisie qui s'intercale réemploie le même corps, et
 * l'aurait déjà effacée.
 *
 * @param {() => void} redessine
 */
export function gardeLaPlace(redessine) {
  const haut = $("mCorps").scrollTop;
  return () => { redessine(); $("mCorps").scrollTop = haut; };
}

/**
 * @param {string} titre
 * @param {string} libelle
 * @param {string} valeur
 * @param {(v: string) => any} suite
 */
export function demande(titre, libelle, valeur, suite) {
  let champ;
  ouvreModale(titre, (corps) => {
    const l = document.createElement("label");
    l.innerHTML = "<span></span><input>";
    l.querySelector("span").textContent = libelle;
    champ = l.querySelector("input");
    champ.value = valeur || "";
    corps.appendChild(l);
    setTimeout(() => { champ.focus(); champ.select(); }, 30);
    champ.onkeydown = (ev) => {
      if (ev.key === "Enter") {
        ev.preventDefault();
        const v = champ.value.trim();
        if (v) { fermeModale(); suite(v); }
      }
    };
  }, [{ libelle: "Annuler" },
      { libelle: "Valider", genre: "primaire",
        action: () => { const v = champ.value.trim(); if (!v) return false; suite(v); } }]);
}

/**
 * @param {string} titre
 * @param {string} message
 * @param {string} libelleOui
 * @param {() => any} action
 */
export function confirme(titre, message, libelleOui, action) {
  ouvreModale(titre, (corps) => {
    const p = document.createElement("p");
    p.textContent = message;
    corps.appendChild(p);
  }, [{ libelle: "Annuler" }, { libelle: libelleOui, genre: "danger", action }]);
}
