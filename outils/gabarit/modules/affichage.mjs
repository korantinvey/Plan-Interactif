/* ============================================================
   Le plan est affiché — ce qui attendait peut venir

   Le visiteur vient voir le plan. Tout ce qui ne le dessine pas — la carte du
   quartier, les figurants — peut attendre qu'il soit à l'écran, et pas
   davantage : c'est la première image peinte qui les appelle, non une
   minuterie. Le 13 octobre 2026, sur un téléphone moyen, MapLibre se montait
   dans la foulée de la première image de deck.gl, avant que l'écran ait pu la
   montrer, et retenait le plan deux secondes de plus.

   Le signal part une seule fois par page, de l'un des trois endroits où le
   plan devient visible : la première image WebGL (`webgl.mjs`), le repli sur
   le SVG (`webgl.mjs` `chargeWebgl`), ou la fin du démarrage quand aucun
   dessin WebGL n'est attendu (`demarrage.mjs`). Les inscrits ne partent
   qu'après l'image suivante : le travail repoussé ne peut plus passer devant
   la peinture qu'il attendait.

   À la différence d'une annonce (`annonce.mjs`), il se souvient : qui
   s'inscrit après coup est appelé tout de suite. Sans aucun import : tous
   peuvent l'importer.
   ============================================================ */

/** @type {Array<() => void>} */
const inscrits = [];
let prevu = false, affiche = false;

/** Le plan est-il à l'écran ? */
export function estAffiche(){ return affiche; }

/** Appeler `f` une fois le plan à l'écran — tout de suite s'il y est déjà. */
export function quandAffiche(/** @type {() => void} */ f){
  if (affiche) f(); else inscrits.push(f);
}

/** La même attente, en promesse. */
export function apresAffichage(){
  return new Promise(/** @type {(ok: (v?: any) => void) => void} */ (ok) => quandAffiche(ok));
}

/** Le plan vient de devenir visible : une fois, et les suivantes ne font rien. */
export function planAffiche(){
  if (prevu) return;
  prevu = true;
  /* `requestAnimationFrame` puis `setTimeout` : le rappel passe après l'image
     que le navigateur peint, et non avant. */
  requestAnimationFrame(() => setTimeout(() => {
    affiche = true;
    document.documentElement.classList.add("plan-affiche");
    // un inscrit qui échoue ne doit pas priver les autres
    for (const f of inscrits.splice(0)){
      try { f(); } catch (e) { console.warn("Après l'affichage :", e); }
    }
  }, 0));
}
