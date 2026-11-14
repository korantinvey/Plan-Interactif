/* ============================================================
   L'état des stands et des zones, tel que le dessin le lit

   Chaque emplacement a un état qui change sa couleur : choisi, retiré par la
   recherche, mis en avant par le cartouche des repères, masqué par
   l'exploitant, teint par son secteur ou par la carte de chaleur, repris par
   l'outil de forme. Chaque module qui le décide l'écrivait sur le groupe SVG
   de l'emplacement, en classe ou en variable, et le dessin le relisait là.

   Ici, ces modules le disent au modèle, par un mutateur, au moment où ils
   l'écrivent sur le groupe : `poseChoisi` (`fiche.mjs`, `points-interet.mjs`),
   `poseRetires` (`recherche.mjs`), `posePhares` (`cartouche-poi.mjs`),
   `poseSecteurs` (`secteurs.mjs`), `poseChaleurs` (`chaleur.mjs`, en
   administration), `poseRepris` (`reprise-emplacements.mjs`, en
   administration). Le masquage d'une zone se lit dans ses données
   (`z.masquee`). Le dessin lit l'état par `etatEmplacement`, et
   `style-emplacements.mjs` en tire le style.

   C'est le deuxième pas de la sortie du SVG (`docs/migration-webgl.md`). Le
   SVG reste marqué comme avant — il peint encore le repli, et d'autres
   modules le lisent. Le pas suivant ne construira plus les stands dans le
   SVG caché quand le WebGL peint : les écrivains n'auront plus que le modèle
   à prévenir. L'essai `outils/essais/navigateur/etat-emplacements.spec.js`
   vérifie, dans des états réels de la page, que le modèle dit ce que le SVG
   porte.

   Un emplacement se désigne par sa clé (`cleEmplacement`) : son identifiant
   propre s'il a été ajouté à la main (`data-aj`), celui de l'emplacement
   sinon. Deux groupes portent le même `data-id` quand un ajout matérialise
   l'exposant d'un stand : seule la clé les distingue.

   Ce module n'importe que les données : tous ceux qui l'informent dépendent
   déjà du dessin, qui le lit.

   Il ne prévient encore personne d'un changement : le guet du SVG
   (`webgl.mjs`) voit la classe que l'écrivain pose en même temps, et ne
   refait que le bloc qui a bougé. Un événement d'ici, branché sur les deux
   blocs, les referait tous deux à chaque lettre tapée dans la recherche ; il
   viendra quand les stands ne seront plus dans le SVG.
   ============================================================ */
import { parId } from "./donnees.mjs";

/** La clé d'un emplacement, d'après les attributs de son groupe. */
export const cleEmplacement = (/** @type {string | undefined} */ id, /** @type {string | undefined} */ aj) =>
  aj ? "aj:" + aj : "id:" + id;

const E = {
  /** @type {string | null} la clé de l'emplacement allumé */
  choisi: null,
  /** @type {Set<string>} les clés que la recherche retire */
  retires: new Set(),
  /** @type {Set<string>} les clés des zones que le cartouche met en avant */
  phares: new Set(),
  /** @type {Map<string, { h: string, c: string | null }>} la teinte du secteur, par clé */
  secteurs: new Map(),
  /** @type {Map<string, string> | null} la couleur de la chaleur, par clé ; rien carte fermée */
  chaleurs: null,
  /** @type {string | null} l'emplacement repris : son identifiant d'ajout, ou le sien */
  repris: null,
};

export function poseChoisi(/** @type {string | null} */ cle){ E.choisi = cle; }
export function poseRetires(/** @type {Set<string>} */ cles){ E.retires = cles; }
export function posePhares(/** @type {Set<string>} */ cles){ E.phares = cles; }
export function poseSecteurs(/** @type {Map<string, { h: string, c: string | null }>} */ teintes){ E.secteurs = teintes; }
export function poseChaleurs(/** @type {Map<string, string> | null} */ couleurs){ E.chaleurs = couleurs; }
export function poseRepris(/** @type {string | null} */ id){ E.repris = id; }

/** La clé d'un groupe du plan, s'il est celui d'un stand ou d'une zone. */
export function cleDuGroupe(/** @type {Element | null} */ g){
  const p = g && /** @type {Element | null} */ (g.parentNode);
  if (!g || !p || (p.id !== "stands" && p.id !== "zones")) return null;
  const d = /** @type {SVGElement} */ (g).dataset;
  return cleEmplacement(d.id, d.aj);
}

/**
 * L'état d'un emplacement, d'après les attributs de son groupe.
 * @param {string | undefined} id `data-id`
 * @param {string | undefined} aj `data-aj`
 * @param {boolean} zone
 * @param {boolean} focus le focus du clavier, montré (`:focus-visible`)
 */
export function etatEmplacement(id, aj, zone, focus){
  const cle = cleEmplacement(id, aj);
  const o = zone && id !== undefined ? parId.get(id) : null;
  return {
    zone, focus,
    sel: E.choisi === cle,
    dim: E.retires.has(cle),
    phare: zone && E.phares.has(cle),
    masquee: Boolean(o && o.masquee),
    repris: E.repris !== null && (aj || id) === E.repris,
    sect: zone ? null : E.secteurs.get(cle) || null,
    chal: zone || !E.chaleurs ? null : E.chaleurs.get(cle) || null,
  };
}
