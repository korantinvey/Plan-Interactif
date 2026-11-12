/* ============================================================
   Le focus d'une fenêtre — où il va quand elle s'ouvre, et d'où il revient

   La fenêtre commune du plan (`fenetre.mjs`) et celle de la console
   (`fenetre-console.mjs`) s'ouvraient sans toucher au focus : au clavier, on
   restait sur le bouton qui l'avait ouverte, derrière le voile ; Tab
   parcourait la page qu'elle recouvre ; et la refermer laissait le focus
   nulle part. Une lectrice d'écran n'apprenait même pas qu'elle s'était
   ouverte.

   Ce module ne dépend de rien : les deux fenêtres l'importent, chacune avec
   son élément. À l'ouverture, il retient où l'on était et pose le focus sur
   la fenêtre elle-même — annoncée par son titre (`aria-labelledby`) —, et non
   sur son premier bouton : Entrée y validerait aussitôt, et ce peut être
   « Supprimer ». Un champ que la fenêtre focalise d'elle-même garde la main.
   Tab tourne dans la fenêtre tant qu'elle est ouverte ; à la fermeture, le
   focus revient où il était.
   ============================================================ */

/** Ce qui se tabule dans une fenêtre. */
const TABULABLES = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), ' +
  'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** @type {HTMLElement | null} */
let rendA = null;

/**
 * La fenêtre vient de s'ouvrir, ou de changer de contenu.
 * @param {HTMLElement} fen la fenêtre (`.mfen`)
 */
export function prendLeFocus(fen){
  const actif = document.activeElement;
  // une fenêtre qui en remplace une autre garde l'élément d'origine
  if (!rendA && actif instanceof HTMLElement && actif !== document.body && !fen.contains(actif)) rendA = actif;
  if (!fen.hasAttribute("tabindex")) fen.setAttribute("tabindex", "-1");
  if (!fen.contains(document.activeElement)) fen.focus({ preventScroll: true });
}

/** La fenêtre s'est fermée : le focus revient où il était. */
export function rendLeFocus(){
  const a = rendA;
  rendA = null;
  if (a && a.isConnected) a.focus({ preventScroll: true });
}

/**
 * Tab ne quitte pas la fenêtre ouverte. À brancher sur un `keydown`.
 * @param {HTMLElement} fen
 * @param {KeyboardEvent} e
 */
export function gardeLeFocus(fen, e){
  if (e.key !== "Tab") return;
  const l = /** @type {HTMLElement[]} */ ([...fen.querySelectorAll(TABULABLES)])
    .filter(x => x.offsetParent !== null || x === document.activeElement);
  if (!l.length){ e.preventDefault(); fen.focus({ preventScroll: true }); return; }
  const premier = l[0], dernier = l[l.length - 1], ici = document.activeElement;
  if (e.shiftKey && (ici === premier || ici === fen)){ e.preventDefault(); dernier.focus(); }
  else if (!e.shiftKey && (ici === dernier || !fen.contains(ici))){ e.preventDefault(); premier.focus(); }
}
