/* ============================================================
   Ce que le doigt désigne — une clé, et non un nœud du SVG

   Un appui sur le plan désigne un emplacement (stand ou zone), un stand
   dessiné, une image liée à un stand, ou un repère. La chaîne des gestes
   (`gestes.mjs`) et tous ceux qu'elle prévient — la recherche qui lève son
   retrait, le cartouche qui oublie sa mise en avant, la borne, la fiche, la
   visée d'un code « Vous êtes ici », la reprise d'un emplacement — recevaient
   le groupe SVG touché, et y lisaient ses attributs et ses classes : son
   `data-id`, son `.dim`, son `.phare`. Ils reçoivent maintenant une
   désignation : la sorte de ce qui est visé, sa clé, et les identifiants
   qu'il portait.

   Pourquoi : c'est le pas de la sortie du SVG (`docs/migration-webgl.md`,
   étape 1, pas 3a) qui permettra de ne plus construire les stands dans le
   SVG caché. Le dessin (`webgl.mjs` `cibleWebgl`) traduit ici ce que la
   carte graphique a peint, le rendu de secours et le clavier ce que le
   navigateur a touché ; ce sont les deux seuls endroits qui lisent encore un
   nœud, et le jour où le dessin désignera sur ses données, ils seront seuls
   à changer. Ce qui se juge de la désignation — retirée par la recherche,
   mise en avant par le cartouche — se lit au modèle et aux données, par ceux
   qui le décident (`recherche.mjs` `estRetiree`, `cartouche-poi.mjs`
   `oublieChoixPoi`) : jamais sur une classe.

   La clé d'un emplacement est celle du modèle (`etat-emplacements.mjs`
   `cleEmplacement`), qui distingue un ajout lié du stand dont il matérialise
   l'exposant ; celle d'une forme dessinée, « f: » et son identifiant. Une
   désignation ne vieillit pas quand le nœud est redessiné entre l'appui et le
   relâché : elle dit encore ce qu'on a touché, là où le nœud détaché ne
   désignait plus rien.

   Sans écran ni état : il n'importe que le modèle, et tous peuvent l'importer.
   ============================================================ */
import { cleDuGroupe } from "./etat-emplacements.mjs";

/**
 * @typedef {object} Designation
 * @property {"stand" | "zone" | "dessine" | "forme" | "repere"} sorte un emplacement du
 *   plan, un stand dessiné, une autre forme liée à un stand (une image), un repère
 * @property {string} cle la clé du modèle pour un emplacement, « f: » et la forme sinon
 * @property {string} [id] l'emplacement dont la désignation ouvre la fiche
 * @property {string} [aj] l'identifiant propre d'un emplacement ajouté à la main
 * @property {number} [soc] le rang de la société qu'on vient voir, quand la cible le porte
 * @property {string} [poi] le repère désigné
 * @property {string} [f] la forme dessinée qui porte la cible
 */

/** Le rang d'une société écrit sur un nœud, s'il y est. */
const rang = (/** @type {string | undefined} */ v) => v === undefined ? undefined : Number(v);

/**
 * Ce que désigne un nœud du plan — le groupe que la carte graphique a peint,
 * ou ce que le navigateur a touché dans le rendu de secours —, rien s'il ne
 * désigne rien.
 * @param {Element | null | undefined} el
 * @returns {Designation | null}
 */
export function designe(el){
  const g = el && typeof el.closest === "function" ? el.closest("[data-id],[data-poi]") : null;
  if (!g) return null;
  const d = /** @type {SVGElement | HTMLElement} */ (g).dataset;
  const cle = cleDuGroupe(g);
  if (cle){
    const parent = /** @type {Element} */ (g.parentNode);
    return { sorte: parent.id === "zones" ? "zone" : "stand", cle, id: d.id, aj: d.aj, soc: rang(d.soc) };
  }
  // une forme dessinée : un repère, qui n'a pas de fiche d'exposant, ou ce qui en mène à une
  const f = d.f || d.poi || d.id || "";
  if (d.id === undefined) return { sorte: "repere", cle: "f:" + f, poi: d.poi, f: d.f };
  return { sorte: g.classList.contains("sdes") ? "dessine" : "forme", cle: "f:" + f,
    id: d.id, soc: rang(d.soc), f: d.f };
}
