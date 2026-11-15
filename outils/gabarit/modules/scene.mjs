/* ============================================================
   La scène du plan — ce qui se pose par-dessus les emplacements

   Deux familles de repères, posés par-dessus le plan, que le dessin
   (`webgl.mjs`) peint sans rien relire dans le SVG caché :
   — les surcouches du visiteur : les marques des distinctions, les liserés
     du parcours et de la sélection, la zone que désigne la visite guidée, le
     point « Vous êtes ici » de la borne, le trajet et ses pastilles ;
   — les repères des outils de l'exploitant : poignées et cadres, cote,
     aimants, guide d'alignement, ébauche d'un tracé, contour d'un hall qu'on
     cale, grille de marche — que la main regarde ou saisit.

   Chaque module les écrivait dans le SVG caché, que le dessin relisait par
   son guet, feuille de style ou attributs compris. Il les pose maintenant
   ici, en données, sous le nom de son jeu (`poseReperes`) : des aplats, des
   traits, des textes, une image, chacun avec son style et, s'il se saisit,
   sa prise. Le dessin les peint directement, et la visée lui rend la prise
   (`webgl.mjs` `repereSousWebgl`), non un nœud.

   Les surcouches du visiteur ont un second peintre : quand le SVG montre le
   plan — un poste sans carte graphique —, `scene-svg.mjs` les y pose,
   depuis les mêmes données. Les repères des outils n'en ont pas :
   l'administration exige le WebGL (`docs/migration-webgl.md`, décision du
   15 novembre 2026).

   Les couleurs sont des jetons de la racine (`--accent`, `--surface`), que
   chaque peintre résout au moment de peindre, ou des couleurs écrites. Les
   tailles sont en mètres, posées d'après la vue quand elles doivent rester
   constantes à l'écran ; les épaisseurs de trait, en pixels.

   Un module neutre, sans écran ni import qui en touche un — il s'éprouve dans
   Node avec les aimants (`outils/essais/aimants.js`) : les modules et les
   deux peintres l'importent tous.
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
 * @property {number} [opacite] celle de l'aplat, du texte ou de l'image — et du trait, sauf `opaciteTrait`
 * @property {number} [opaciteTrait] celle du contour d'un aplat, quand elle n'est pas la sienne
 * @property {string} [trait] la couleur du contour d'un aplat, ou d'un trait
 * @property {number} [epaisseur] l'épaisseur du trait, en pixels d'écran
 * @property {number[]} [tirets] les tirets du trait, en pixels : [plein, vide]
 * @property {string} [texte] un texte : ce qu'il dit
 * @property {number[]} [position] un texte : son point d'ancrage, en mètres
 * @property {number} [taille] un texte : son corps, en mètres
 * @property {number} [graisse] un texte : sa graisse
 * @property {string} [href] une image : son adresse
 * @property {number[]} [bornes] une image droite : [x0, y0, x1, y1], en mètres
 * @property {number[][]} [coins] une image tournée : ses quatre coins, en mètres — bas gauche, haut
 *   gauche, haut droit, bas droit, le haut étant le petit y du plan
 * @property {"start" | "middle" | "centre"} [ancre] un texte : son point d'ancrage — au début ou au milieu
 *   de sa ligne de base, ou au centre de ses lettres dans les deux sens (le chiffre d'une pastille)
 * @property {string} [famille] un texte : sa police, celle du plan sinon
 * @property {boolean} [rond] un trait aux bouts et aux angles ronds
 * @property {string} [sur] une marque posée sur le dessus d'un stand : l'identifiant du stand,
 *   dont elle suit le toit en vue immersive
 * @property {string} [classe] la classe du nœud que le SVG de secours pose, pour ce que la
 *   feuille y anime encore
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
 * Les jeux, dans l'ordre où ils se peignent, du dessous au dessus, et leur
 * rang dans la pile du plan :
 * — « stands » : juste au-dessus des stands, sous leurs noms — les marques
 *   des distinctions, dont les textes du plan ne doivent pas manger les lettres ;
 * — « plan » : au-dessus de tous les calques, sous le trajet ;
 * — « trajet » : le trajet lui-même ;
 * — « dessus » : par-dessus tout, les repères des outils — le guide et la
 *   cote, qui accompagnent le geste, en dernier.
 * `public` : un jeu du visiteur, que le SVG de secours peint aussi. Le nom
 * d'un jeu public est l'identifiant de son groupe dans ce SVG, où la feuille
 * retrouve ce qu'elle anime (`#tutoZone`).
 * @type {{ nom: string, rang: "stands" | "plan" | "trajet" | "dessus", public?: boolean }[]}
 */
export const JEUX = [
  { nom: "dists", rang: "stands", public: true },
  { nom: "marques", rang: "plan", public: true },
  { nom: "tutoZone", rang: "plan", public: true },
  { nom: "borneIci", rang: "plan", public: true },
  { nom: "nappe", rang: "plan" },
  { nom: "itin", rang: "trajet", public: true },
  { nom: "calage", rang: "dessus" }, { nom: "ebauche", rang: "dessus" }, { nom: "aimants", rang: "dessus" },
  { nom: "poignees", rang: "dessus" }, { nom: "poigneesGeo", rang: "dessus" },
  { nom: "guide", rang: "dessus" }, { nom: "cote", rang: "dessus" },
];

/** @type {Map<string, Repere[]>} */
const scene = new Map(JEUX.map(j => [j.nom, []]));

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

/** La boîte d'un jeu sur le plan, [x0, y0, x1, y1], tirée de ses repères —
 *  pour qui doit l'éviter à l'écran (la bulle de la visite guidée) ; rien
 *  s'il est vide. */
export function boiteDuJeu(/** @type {string} */ nom){
  const pts = reperes(nom).flatMap(r => r.anneaux ? r.anneaux.flat() : r.chemin || (r.position ? [r.position] : []));
  if (!pts.length) return null;
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
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

