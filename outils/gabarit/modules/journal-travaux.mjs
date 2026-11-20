/* ============================================================
   Le journal des travaux — ce que la page a fait, et quand

   Les doigts levés lents sur iPhone (FUNEXPO, 19 et 20 novembre 2026)
   passaient presque tout leur temps à attendre que la page les traite :
   194 ms d'attente pour 5 de traitement. Safari ne nomme pas les longues
   tâches qui expliqueraient l'attente, et rien ne disait si c'était notre
   code, ou le navigateur qui retenait le geste. Les gros travaux de la page
   s'inscrivent donc ici, avec leur début et leur durée ; la sonde y retrouve
   ceux qui couvrent l'attente de la pire interaction (`sonde.mjs`
   `pendantLAttente`).

   Il ne coûte presque rien : deux lectures de l'horloge par travail, et une
   liste fixe en mémoire qui écrase les plus anciens. Rien n'en part tel quel :
   la sonde n'en tire que ce qui tombe pendant l'attente de la pire
   interaction, cinq entrées au plus.

   Sans aucun import, comme `geste-tenu.mjs` : tous peuvent l'importer.
   ============================================================ */
/* Un travail plus court se perd dans l'arrondi de ce qu'on cherche : une
   attente de cent millisecondes et davantage. */
const SEUIL = 4;
/* Une attente se lit une image après le geste, et les travaux qui la
   couvrent sont les derniers : au-delà, les plus anciens ne servent plus. */
const TAILLE = 48;

/** @type {{ nom: string, debut: number, duree: number }[]} */
const JOURNAL = [];

/**
 * Inscrire un travail fini : son nom, court, et l'instant où il a commencé,
 * lu sur `performance.now()`. Sous le seuil, rien.
 * @param {string} nom
 * @param {number} debut
 * @param {number} [fin]
 */
export function noteTravail(nom, debut, fin = performance.now()){
  const duree = fin - debut;
  if (!(duree >= SEUIL)) return;
  JOURNAL.push({ nom, debut, duree });
  if (JOURNAL.length > TAILLE) JOURNAL.shift();
}

/**
 * Mener un travail et l'inscrire, qu'il finisse ou qu'il lève.
 * @template T
 * @param {string} nom
 * @param {() => T} f
 * @returns {T}
 */
export function chronometre(nom, f){
  const t0 = performance.now();
  try { return f(); } finally { noteTravail(nom, t0); }
}

/**
 * Les travaux qui recouvrent l'intervalle `[a, b]`, du plus ancien au plus récent.
 * @param {number} a
 * @param {number} b
 */
export const travauxEntre = (a, b) => JOURNAL.filter(x => x.debut < b && x.debut + x.duree > a);
