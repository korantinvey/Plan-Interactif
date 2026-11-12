/* ============================================================
   Le dictionnaire, dans la forme qu'i18next lit

   Le dictionnaire anglais (`outils/anglais/`) range chaque phrase sous son
   français : `"{n} exposants retenus": "{n} exhibitors match"`. C'est aussi
   la forme qu'i18next accepte, à trois réglages près — une phrase entière pour
   clé, sans séparateur de clés ni d'espace de noms, et les accolades simples
   du dépôt pour ses trous (`modules/traduction.mjs` les pose). Les phrases
   passent donc telles quelles : rien n'est retraduit, rien n'est renommé, et
   le dictionnaire reste la seule source, que le moteur d'aujourd'hui
   (`_langue.js`) et `t()` lisent ensemble pendant la migration.

   Reste le pluriel, que les deux n'écrivent pas de la même façon. Le
   dictionnaire porte les deux formes d'une phrase chiffrée en deux entrées,
   « {n} fiche ouverte » et « {n} fiches ouvertes », et le code choisissait
   l'une ou l'autre ; le moteur rapprochait ensuite les deux pour mettre zéro
   au pluriel en anglais (« 0 records opened ») quand le français le met au
   singulier. i18next, lui, veut une clé et ses formes : `…_one`, `…_other`,
   choisies par les règles de chaque langue (`Intl.PluralRules`). On les
   rapproche ici par la même règle que le moteur (`sansPluriel`, ses « s » et
   ses « x » ôtés), sous la clé de la forme la plus courte, le singulier : un
   module migré écrit `t("{n} fiche ouverte", { n })`, et chaque langue accorde.

   Aucune dépendance, ni au navigateur ni à i18next : le module s'éprouve seul
   dans Node (`outils/essais/traduction.js`) et sert aussi à l'export du
   dictionnaire pour les traducteurs (`outils/scripts/export-langues.js`).
   ============================================================ */

const ESPACES = /[\s\u00A0\u202F\u2009]+/g;
/** Une phrase telle que le moteur la range : les blancs ramenés à une espace. */
export const normalise = (s) => String(s).replace(ESPACES, " ").trim();

/* La règle du moteur (`_langue.js` `sansPluriel`), recopiée à dessein : c'est
   elle qui décide quelles deux phrases sont les formes d'une même, et les deux
   doivent décider pareil tant qu'ils lisent le même dictionnaire. L'essai
   compare les deux règles. */
const LETTRE_PUIS_PLURIEL = /([A-Za-zÀ-ÖØ-öø-ÿ])[sx](?=[\s.,;:!?)»]|$)/g;
export const sansPluriel = (fr) => fr.replace(LETTRE_PUIS_PLURIEL, "$1");

/** Le trou qui compte : `{n}`, ou `{n2}` pour un second nombre. */
const CHIFFRE = /\{n\d?\}/;

/**
 * Les ressources i18next d'un dictionnaire `{ français: anglais }`.
 *
 * Rend `{ fr, en, pluriels }` : les deux tables de `translation`, et pour
 * chaque phrase chiffrée qui a ses deux formes, la clé sous laquelle elles se
 * rangent (`pluriels`, `Map` : forme → clé). Une phrase identique dans les deux
 * langues n'est pas reprise — i18next rend la phrase demandée quand il ne la
 * trouve pas, et c'est justement elle.
 *
 * @param {Record<string, string>} table
 */
export function ressources(table) {
  /** @type {Record<string, string>} */
  const fr = {};
  /** @type {Record<string, string>} */
  const en = {};
  /** @type {Map<string, string[]>} */
  const groupes = new Map();
  /** @type {Map<string, string>} */
  const anglaisDe = new Map();
  for (const cleBrute of Object.keys(table || {})) {
    const cle = normalise(cleBrute), anglais = table[cleBrute];
    if (!cle || typeof anglais !== "string") continue;
    anglaisDe.set(cle, anglais);
    if (anglais !== cle) en[cle] = anglais;
    if (CHIFFRE.test(cle)) {
      const r = sansPluriel(cle);
      const g = groupes.get(r);
      if (!g) groupes.set(r, [cle]);
      else if (!g.includes(cle)) g.push(cle);
    }
  }
  /** @type {Map<string, string>} */
  const pluriels = new Map();
  for (const formes of groupes.values()) {
    if (formes.length < 2) continue;
    /* Le singulier est la plus courte, le pluriel la plus longue, comme le
       moteur les lit ; une troisième forme, qui n'arrive pas en français, ne
       ferait que suivre la plus longue. */
    const triees = [...formes].sort((a, b) => a.length - b.length);
    const un = triees[0], plusieurs = triees[triees.length - 1];
    fr[un + "_one"] = un;
    fr[un + "_other"] = plusieurs;
    en[un + "_one"] = anglaisDe.get(un) ?? un;
    en[un + "_other"] = anglaisDe.get(plusieurs) ?? plusieurs;
    for (const f of formes) pluriels.set(f, un);
  }
  return { fr, en, pluriels };
}
