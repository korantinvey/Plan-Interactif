/* ============================================================
   Les calques dessinés, en données : ce qui se peint, et dans quel état

   Le dessin (`webgl.mjs`) relisait les calques que l'exploitant a dessinés
   dans le SVG caché : chaque nœud interrogé sur son style calculé, et les
   classes que sept modules posaient après coup — la sélection, le retrait du
   filtre, la mise en avant du cartouche, le repère ouvert, le hall qu'on cale,
   l'objet tenu. Ce module tient les deux en données.

   Les pièces de chaque forme — tracés, pastilles, pictogrammes, textes,
   images — sont posées par `dessin.mjs`, qui les tire de la même géométrie
   que le balisage du SVG (`poseCalquesPeints`, `poseFormePeinte`). Les
   marques sont posées par les modules qui les décident (`poseMarques`) ; la
   teinte du secteur et de la chaleur d'un stand dessiné, elle, est celle de
   son hôte, que le modèle des emplacements tient déjà
   (`etat-emplacements.mjs`). Le style se résout sans la feuille
   (`style-calques.mjs`).

   Le balisage reste dans le SVG : le clavier y focalise les repères et les
   stands dessinés, l'éditeur y mesure un texte, et le rendu de secours le
   montre. Mais le dessin ne le lit plus : chaque changement se dit ici
   (`CALQUES_PEINTS`), et seul le calque touché se reconvertit.

   Neutre : ni document, ni dessin. Les essais l'importent tel quel.
   ============================================================ */
import { creeEvenement } from "./evenement.mjs";

/**
 * Une pièce d'une forme, dans le repère du plan. Un tracé porte son chemin
 * SVG (`d`) et, pour un pictogramme, la matrice qui le pose dans sa pastille
 * (`m`, `[a, b, c, d, e, f]`) ; un rectangle sa boîte et son arrondi ; un
 * texte son point d'ancrage — au pied des lettres, comme en SVG —, son corps
 * et l'angle dont il tourne autour de ce point ; une image sa boîte et sa
 * source. Le rôle dit quelle règle de style la prend.
 * @typedef {{
 *   sorte: "trace" | "rect" | "texte" | "image",
 *   role: "corps" | "fleche" | "stand" | "pastille" | "barre" | "glyphe" | "rond" | "indice" | "nom" | "texte" | "image",
 *   d?: string, m?: number[],
 *   x?: number, y?: number, w?: number, h?: number, rx?: number,
 *   taille?: number, texte?: string, rot?: number, href?: string,
 * }} Piece
 */
/**
 * Une forme : ce que le style regarde d'elle, et ses pièces dans l'ordre où
 * le SVG les écrit.
 * @typedef {{
 *   id: string, t: string, pieces: Piece[],
 *   lie: { id: string, soc: number | null } | null,
 *   ep: number, pointille: boolean,
 *   teinte: string | null, encre: string | null, plaque: boolean, anneau: boolean,
 *   glyphe: string, sens: number,
 * }} FormePeinte
 */
/**
 * Un calque : sa couleur, son remplissage, son rôle d'itinéraire, s'il se
 * voit et s'il est ouvert à l'édition, et ses formes.
 * @typedef {{
 *   id: string, couleur: string, plein: boolean, role: string, visible: boolean, editable: boolean,
 *   formes: FormePeinte[],
 * }} CalquePeint
 */

/** Un calque a changé — ses formes, sa couleur, les marques de ses formes —,
 *  ou tous (`null`). Le dessin l'écoute et ne reconvertit que lui.
 *  @type {import("./evenement.mjs").Evenement<[string | null]>} */
export const CALQUES_PEINTS = creeEvenement();

/** @type {Map<string, CalquePeint>} */
let CALQUES = new Map();

/** Les calques du pavillon, dans l'ordre de leur création. */
export const calquesPeints = () => [...CALQUES.values()];
/** Un calque par son identifiant. */
export const calquePeint = (/** @type {string} */ id) => CALQUES.get(id) || null;

/** Tous les calques, posés d'un coup par `dessin.mjs` `dessineDessins`. */
export function poseCalquesPeints(/** @type {CalquePeint[]} */ liste){
  CALQUES = new Map(liste.map(c => [c.id, c]));
  CALQUES_PEINTS.emet(null);
}

/** Une forme refaite à sa place, sans rebâtir son calque : ce qu'un geste
 *  demande à chaque mouvement (`dessin.mjs` `redessineForme`). */
export function poseFormePeinte(/** @type {FormePeinte} */ f){
  for (const c of CALQUES.values()){
    const i = c.formes.findIndex(x => x.id === f.id);
    if (i < 0) continue;
    c.formes[i] = f;
    CALQUES_PEINTS.emet(c.id);
    return;
  }
}

/** La couleur d'un calque, posée pendant qu'on glisse sur le nuancier. */
export function poseCouleurCalque(/** @type {string} */ id, /** @type {string} */ couleur){
  const c = CALQUES.get(id);
  if (!c || c.couleur === couleur) return;
  c.couleur = couleur;
  CALQUES_PEINTS.emet(id);
}

/* ------------------------------------------------------------
   Les marques des formes

   Chacune a un seul module qui la décide, et qui la pose ici en même temps
   qu'il marque le nœud du SVG pour le rendu de secours :
     sel     le stand dessiné de la société choisie  (`dessin.mjs` `marqueStandsDessines`)
     ouvert  le repère dont la fiche est ouverte      (`points-interet.mjs` `ouvrePoi`, `fiche.mjs`)
     dim     ce que le filtre écarte                  (`dessin.mjs`, `recherche.mjs`)
     phare   ce que le cartouche met en avant         (`cartouche-poi.mjs` `eclairePoi`)
     cale    le hall qu'on reprend, effacé le temps du calage (`batiments.mjs`)
     tenu    l'escalier que l'exploitant tient en vue immersive (`outil-escalier.mjs`)
   ------------------------------------------------------------ */
/** @typedef {"sel" | "ouvert" | "dim" | "phare" | "cale" | "tenu"} Marque */
/** @type {Record<Marque, Set<string>>} */
const MARQUES = { sel: new Set(), ouvert: new Set(), dim: new Set(), phare: new Set(), cale: new Set(), tenu: new Set() };

/**
 * Les formes qui portent une marque, toutes à la fois. Une liste pareille à
 * celle d'avant ne dit rien : le retrait du filtre se repose à chaque lettre
 * tapée, et reconvertir les calques à chaque fois ne servirait à rien.
 * @param {Marque} nom
 * @param {Iterable<string>} ids
 */
export function poseMarques(nom, ids){
  const neuf = new Set(ids), avant = MARQUES[nom];
  if (neuf.size === avant.size && [...neuf].every(x => avant.has(x))) return;
  MARQUES[nom] = neuf;
  CALQUES_PEINTS.emet(null);
}

/** La forme porte-t-elle cette marque ? */
export const marquee = (/** @type {Marque} */ nom, /** @type {string} */ id) => MARQUES[nom].has(id);
