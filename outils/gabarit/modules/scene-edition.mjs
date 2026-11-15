/* ============================================================
   La scène d'édition — ce que les outils de l'exploitant montrent sur le plan

   Les poignées et le cadre de la forme choisie, ceux d'un emplacement qu'on
   reprend, la cote du geste, les aimants repérés, le guide d'alignement,
   l'ébauche d'un tracé, le contour d'un hall qu'on cale, la grille de
   marche : autant de repères posés par-dessus le plan, à la taille de
   l'écran, que l'exploitant regarde ou saisit.

   Chaque outil les écrivait dans le SVG caché, que le dessin (`webgl.mjs`)
   relisait par son guet, feuille de style comprise, à chaque mouvement de la
   main. Il les pose maintenant ici, en données, sous un nom (`poseReperes`) :
   des aplats, des traits, des textes, une image, chacun avec son style et,
   s'il se saisit, sa prise. Le dessin les peint directement, et la visée lui
   rend la prise (`webgl.mjs` `repereSousWebgl`), non un nœud.

   L'administration exige le WebGL (`docs/migration-webgl.md`, décision du
   15 novembre 2026) : ces repères n'ont pas d'autre peintre.

   Les couleurs sont des jetons de la racine (`--accent`, `--surface`), que le
   dessin résout au moment de peindre : un accent changé repeint le plan, et
   les repères avec. Les tailles sont en mètres, posées par l'outil d'après la
   vue pour rester constantes à l'écran ; les épaisseurs de trait, en pixels.

   Un module neutre, sans écran : les outils et le dessin l'importent tous.
   ============================================================ */
import { creeEvenement } from "./evenement.mjs";

/**
 * Un repère de la scène.
 * @typedef {object} Repere
 * @property {"aplat" | "trait" | "texte" | "image"} sorte
 * @property {number[][][]} [anneaux] un aplat : ses anneaux, en mètres
 * @property {number[][]} [chemin] un trait : ses points, en mètres
 * @property {boolean} [ferme] un trait qui revient à son départ
 * @property {string} [plein] la couleur d'un aplat ou d'un texte : un jeton de la racine (« --accent ») ou une couleur
 * @property {number} [opacite] celle de l'aplat, du trait, du texte ou de l'image
 * @property {string} [trait] la couleur du contour d'un aplat, ou d'un trait
 * @property {number} [epaisseur] l'épaisseur du trait, en pixels d'écran
 * @property {number[]} [tirets] les tirets du trait, en pixels : [plein, vide]
 * @property {string} [texte] un texte : ce qu'il dit
 * @property {number[]} [position] un texte : son point d'ancrage, en mètres
 * @property {number} [taille] un texte : son corps, en mètres
 * @property {number} [graisse] un texte : sa graisse
 * @property {string} [href] une image : son adresse
 * @property {number[]} [bornes] une image : [x0, y0, x1, y1], en mètres
 * @property {Prise | null} [prise] ce que la main saisit en touchant ce repère
 */
/**
 * Ce qu'un repère donne à saisir : l'outil qui le pose, ce qu'il désigne
 * pour lui (le rang d'une poignée, « rot », « contour »…), et le curseur qui
 * le dit au survol.
 * @typedef {{ outil: string, i: number | string, curseur?: string }} Prise
 */

/** La scène a changé : `nom` dit le jeu de repères que le dessin relit.
 *  @type {import("./evenement.mjs").Evenement<[string]>} */
export const SCENE_CHANGEE = creeEvenement();

/**
 * L'ordre où les jeux se peignent, du dessous au dessus. La grille de marche
 * reste sous le trajet ; le reste passe au-dessus de tout le plan — le guide
 * et la cote, qui accompagnent le geste, en dernier.
 */
export const JEUX = ["nappe", "calage", "ebauche", "aimants", "poignees", "poigneesGeo", "guide", "cote"];

/** @type {Map<string, Repere[]>} */
const scene = new Map(JEUX.map(n => [n, []]));

/** Les repères d'un jeu, tels que son outil les a posés. */
export const reperes = (/** @type {string} */ nom) => scene.get(nom) || [];

/**
 * Pose les repères d'un jeu à la place des précédents ; une liste vide
 * l'efface. Une liste identique ne prévient personne : la cote et les aimants
 * se reposent à chaque image d'un geste, souvent à l'identique.
 * @param {string} nom un des `JEUX`
 * @param {Repere[]} liste
 */
export function poseReperes(nom, liste){
  if (!scene.has(nom)) throw new Error("Jeu de repères inconnu : " + nom);
  const avant = scene.get(nom) || [];
  if (!avant.length && !liste.length) return;
  if (avant.length === liste.length && JSON.stringify(avant) === JSON.stringify(liste)) return;
  scene.set(nom, liste);
  SCENE_CHANGEE.emet(nom);
}

/* ------------------------------------------------------------
   Ce que les outils dessinent le plus souvent
   ------------------------------------------------------------ */
/** Un rectangle droit, en mètres : [x0, y0, x1, y1]. */
export const anneauRect = (/** @type {number[]} */ b) =>
  [[b[0], b[1]], [b[2], b[1]], [b[2], b[3]], [b[0], b[3]]];

/** Un cercle en polygone : assez de côtés pour qu'on n'en voie aucun à sa taille. */
export function anneauCercle(/** @type {number[]} */ c, /** @type {number} */ r, n = 24){
  const out = [];
  for (let i = 0; i < n; i++){ const a = i / n * 2 * Math.PI; out.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]); }
  return out;
}

/** Des points tournés de `deg` degrés autour de `o`, comme `rotate(deg o)` en SVG. */
export function tourne(/** @type {number[][]} */ pts, /** @type {number} */ deg, /** @type {number[]} */ o){
  if (!deg) return pts;
  const a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
  return pts.map(p => { const x = p[0] - o[0], y = p[1] - o[1]; return [o[0] + x * c - y * s, o[1] + x * s + y * c]; });
}

/**
 * La poignée carrée d'un outil — celle de l'éditeur, de la reprise : la même
 * main pour le même geste, d'un demi-côté `t` en mètres.
 * @param {number[]} p son centre
 * @param {number} t
 * @param {Prise} prise
 * @returns {Repere}
 */
export const poigneeCarree = (p, t, prise) => ({ sorte: "aplat",
  anneaux: [anneauRect([p[0] - t, p[1] - t, p[0] + t, p[1] + t])],
  plein: "--surface", trait: "--accent", epaisseur: 1.6, prise });

/**
 * Le cadre en pointillés d'une forme choisie, à `marge` mètres autour de sa
 * boîte [x0, y0, x1, y1].
 * @returns {Repere}
 */
export const cadreChoisi = (/** @type {number[]} */ b, /** @type {number} */ marge) => ({ sorte: "trait",
  chemin: anneauRect([b[0] - marge, b[1] - marge, b[2] + marge, b[3] + marge]), ferme: true,
  trait: "--accent", epaisseur: 1, tirets: [5, 4], opacite: .8 });
