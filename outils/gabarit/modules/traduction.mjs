/* ============================================================
   La traduction par i18next — `t()`, pour les modules migrés

   Les pages sont traduites aujourd'hui par-dessus leur rendu : `_langue.js`
   observe ce que la page écrit et remplace chaque phrase qu'il connaît. Le
   dépôt passe, module par module, à la voie ordinaire d'une bibliothèque :
   le module écrit lui-même sa phrase dans la langue de la page, par
   `t("Centrer sur le plan")`. i18next en est le moteur — des pluriels réglés
   par les règles de chaque langue (`Intl.PluralRules`), un format que les
   outils de traduction savent lire, et une bibliothèque que d'autres tiennent.

   Les deux voies vivent ensemble le temps de la migration, et c'est voulu :
   - **Un seul dictionnaire.** La phrase française reste la clé, le
     dictionnaire de `outils/anglais/` reste la source, et la page le confie
     à i18next tel que `_langue.js` le reçoit (`LANGUE.dictionnaire()`, converti
     par `ressources-langue.mjs`). Rien n'est retraduit pour migrer.
   - **Un seul choix de langue.** `_langue.js` le tient (adresse, appareil,
     navigateur, salon qui ferme l'anglais) et l'annonce par l'événement
     `langue` ; on le suit, sans le refaire.
   - **Aucun conflit d'écriture.** Ce que `t()` a déjà écrit en anglais,
     l'observateur ne le reconnaît pas et n'y touche pas ; ce qu'il écrit en
     français avant que le dictionnaire n'arrive, l'observateur le traduit
     comme le reste. Un module migré se redessine sur `LANGUE_CHANGEE`, et c'est
     lui alors qui écrit la bonne langue.

   Ce que `t()` fait de plus que l'observateur, il le fait pour ce qui sait le
   demander : un nombre s'écrit à la façon de la langue (« 1 234,5 » ou
   « 1,234.5 »), et `{n}` accorde la phrase — `t("{n} fiche ouverte", { n })`
   rend « 2 fiches ouvertes », « 0 records opened ». Les valeurs ne sont ni
   traduites ni échappées : une valeur qui est une phrase passe par son propre
   `t()`, une valeur venue d'ailleurs qui part dans du HTML par `esc()` — la
   règle `outils/controles/regle-html.js` le vérifie.

   La phrase s'écrit en toutes lettres (`t("…")`, jamais `t(variable)`) : c'est
   ainsi que le contrôle des traductions la trouve et exige sa traduction.
   ESLint le refuse sinon (`eslint.config.js`).
   ============================================================ */
import i18next from "i18next";
import { creeEvenement } from "./evenement.mjs";
import { normalise, ressources } from "./ressources-langue.mjs";

/** La langue vient de changer, et le dictionnaire de cette langue est là :
 *  un module migré s'y redessine. Reçoit le code de la langue.
 *  @type {import("./evenement.mjs").Evenement<[string]>} */
export const LANGUE_CHANGEE = creeEvenement();

/* Le moteur de la page, ou rien : un essai dans Node n'en a pas, et la page
   reste alors en français. */
const moteur = () => /** @type {any} */ (globalThis).LANGUE || null;

/* Les pluriels français, versés par la construction (`genere.js` `DEFINIS`) ;
   l'essai les pose sur l'objet global, faute de construction. */
const PLURIELS = typeof PLURIELS_FR !== "undefined" ? PLURIELS_FR
  : (/** @type {any} */ (globalThis).PLURIELS_FR || {});

/** @type {Record<string, string>} */
const FR = {};
/** Forme du pluriel → clé sous laquelle ses formes se rangent.
 *  @type {Map<string, string>} */
const CLE_DU_PLURIEL = new Map();
for (const un of Object.keys(PLURIELS)) {
  FR[un + "_one"] = un;
  FR[un + "_other"] = PLURIELS[un];
  CLE_DU_PLURIEL.set(un, un);
  CLE_DU_PLURIEL.set(PLURIELS[un], un);
}

const i18n = i18next.createInstance();
i18n.init({
  lng: "fr",
  resources: { fr: { translation: FR } },
  /* La clé est la phrase française entière : ses « : » et ses « . » ne
     séparent rien. */
  keySeparator: false,
  nsSeparator: false,
  /* Une phrase que la langue ne connaît pas reste en français — elle-même,
     rendue par `defaultValue` —, comme l'observateur la laisse. */
  fallbackLng: false,
  returnNull: false,
  returnEmptyString: false,
  /* Les trous du dépôt sont à accolades simples, `{n}` ; et rien n'est
     échappé ici : `t()` écrit du texte, et ce qui part dans du HTML s'échappe
     là où on le sait (`esc`). */
  interpolation: { prefix: "{", suffix: "}", escapeValue: false },
  initAsync: false,
});

let langue = "fr";
/** La langue dans laquelle `t()` écrit. */
export const langueDeT = () => langue;

/**
 * Une phrase de la page, dans sa langue.
 *
 * `valeurs` remplit les trous ; un nombre y prend l'écriture de la langue, et
 * `n` accorde une phrase qui a ses deux formes au dictionnaire.
 *
 * @param {string} phrase   la phrase française, écrite en toutes lettres
 * @param {Record<string, string | number>} [valeurs]
 * @returns {string}
 */
export function t(phrase, valeurs) {
  const brute = normalise(phrase);
  const cle = CLE_DU_PLURIEL.get(brute);
  /** @type {Record<string, any>} */
  const options = { defaultValue: brute };
  if (valeurs) {
    const nombres = new Intl.NumberFormat(langue === "en" ? "en-GB" : "fr-FR");
    for (const k of Object.keys(valeurs)) {
      const v = valeurs[k];
      options[k] = typeof v === "number" && Number.isFinite(v) ? nombres.format(v) : v;
    }
    if (cle && typeof valeurs.n === "number") options.count = valeurs.n;
  }
  // une chaîne, toujours : seul `returnObjects`, qu'on ne demande pas, rendrait un objet
  return String(i18n.t(cle && options.count !== undefined ? cle : brute, options));
}

/* Le dictionnaire anglais, versé une fois : il ne change pas d'une langue à
   l'autre, seule la langue demandée change. */
let anglaisVerse = null;
function verseAnglais() {
  const m = moteur();
  if (!m || !m.dictionnaire) return Promise.resolve();
  if (!anglaisVerse) {
    anglaisVerse = m.dictionnaire().then((/** @type {Record<string, string>} */ table) => {
      i18n.addResourceBundle("en", "translation", ressources(table).en, true, true);
    });
  }
  return anglaisVerse;
}

/** Passe à la langue `l`, dictionnaire compris, puis l'annonce. */
async function suis(l) {
  const voulue = l === "en" ? "en" : "fr";
  if (voulue === "en") await verseAnglais();
  langue = voulue;
  await i18n.changeLanguage(voulue);
  LANGUE_CHANGEE.emet(voulue);
}

/* Le moteur annonce chaque bascule une fois son dictionnaire arrivé ; la
   langue de l'ouverture, elle, ne s'annonce pas : on la lit en se chargeant.
   Une page ouverte en anglais écrit donc d'abord en français ce que `t()` rend
   avant que le dictionnaire ne soit versé — l'observateur le traduit dans
   l'intervalle —, puis le module se redessine, en anglais, sur l'annonce. */
if (typeof addEventListener === "function") {
  addEventListener("langue", (/** @type {any} */ e) => { suis(e.detail && e.detail.langue); });
}
if (moteur() && moteur().code === "en") suis("en");
