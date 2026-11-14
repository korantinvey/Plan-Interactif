/* ============================================================
   Les surcouches qui suivent les jetons de la racine

   Une surcouche du plan qui porte son style en attributs (`style-attributs.mjs`,
   `docs/migration-webgl.md`, étape 2) y écrit des couleurs résolues : l'accent
   du salon, la couleur de sélection, celle du parcours. Peinte par la feuille,
   elle suivait d'elle-même un jeton changé sur la racine (`var(--accent)`) ;
   écrite en attributs, elle garde la couleur du moment où elle a été tracée.
   L'exploitant qui change l'accent dans les réglages verrait donc les marques
   d'un nouveau venu, le liseré du choix ou le trajet garder l'ancien.

   Un registre où chaque surcouche s'inscrit en se chargeant : ce qu'elle tire
   de la racine, réduit à une signature, et de quoi se retracer. Un seul guet
   sur la racine pour toutes, une lecture du style par image au plus, et une
   surcouche ne se retrace que si sa signature a bougé — la racine change à
   chaque frappe dans la recherche (la hauteur du cartouche), et rien de ce
   que les surcouches en tirent n'en dépend.

   Une surcouche se retrace alors qu'elle n'a peut-être encore rien tracé : le
   premier changement de la racine précède le montage du plan. Chacune s'en
   garde elle-même. Un module neutre, qui n'importe rien.
   ============================================================ */

/** @type {{ signature: (cs: CSSStyleDeclaration, racine: Element) => string, retrace: () => void, vu?: string }[]} */
const SUIVIES = [];
let guet = /** @type {MutationObserver | null} */ (null), attente = 0;

function relit(){
  attente = 0;
  const racine = document.documentElement, cs = getComputedStyle(racine);
  for (const s of SUIVIES){
    const v = s.signature(cs, racine);
    if (v === s.vu) continue;
    s.vu = v;
    s.retrace();
  }
}

/**
 * Inscrit une surcouche : elle se retracera quand ce qu'elle tire de la racine
 * aura changé.
 * @param {(cs: CSSStyleDeclaration, racine: Element) => string} signature ce
 *   qu'elle tire du style calculé et des classes de la racine
 * @param {() => void} retrace
 */
export function suitLaRacine(signature, retrace){
  SUIVIES.push({ signature, retrace });
  if (guet) return;
  guet = new MutationObserver(() => { if (!attente) attente = requestAnimationFrame(relit); });
  guet.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });
}

/** Les valeurs de quelques jetons, en une signature. */
export const jetons = (/** @type {CSSStyleDeclaration} */ cs, /** @type {string[]} */ noms) =>
  noms.map(n => cs.getPropertyValue(n).trim()).join("|");
