/* ============================================================
   Placer un libellé à la main — ce que le plan public en reçoit

   Le nom d'un stand est posé automatiquement : au milieu de l'emplacement, à
   la taille que la place autorise. C'est juste pour un rectangle, et ce l'est
   moins dès que le plan sort du cas d'école — un stand en L dont le nom tombe
   sur la découpe, deux enseignes voisines dont les noms se touchent, une zone
   organisateur dont l'intitulé traverse une allée. L'exploitant voit ces
   cas-là, le calcul non : il lui faut pouvoir déplacer et agrandir un libellé.

   Le réglage se range dans l'apparence du salon, avec les couleurs et l'ordre
   des calques, et part aux visiteurs à la publication.

   Il porte avec lui l'empreinte de ce dont il dépend : ce qui s'écrit, et la
   forme qui le porte. Une synchronisation qui n'y touche pas le laisse en
   place — c'est tout l'objet — mais une qui renomme l'exposant, déplace le
   stand ou le redimensionne le périme : le décalage ne décrit plus rien, et
   laisser le nom flotter à côté serait pire que de le replacer tout seul.
   Le réglage n'est pas effacé pour autant, il cesse de s'appliquer : si la
   forme revient telle qu'elle était, il revient avec elle.

   Ce module tient ce que le dessin des libellés lit, public compris : le
   placement réglé, le mode et le libellé retouché (faux et vide hors de
   l'administration). L'outil qui les change — le mode, la palette, le geste —
   est d'exploitant : il vit dans `modules/placement-libelles.mjs`, que seul
   `plan-admin.mjs` embarque, et pose l'état par les portes d'ici. Le code
   soudé lit le mode et le libellé retouché par accesseur (`plan.mjs`) ; les
   réglages et ce qui situe un nom sur sa forme lui sont confiés par
   `brancheLibellePlace`, que `_mode-admin.html` appelle à la place que ce
   code y tenait.
   ============================================================ */

/* Ce que le code soudé confie : les réglages (`CONF`, que le changement de
   salon remplace), lus à l'instant, et l'ancrage d'un nom et la place dont il
   dispose (`_rendu.html`). */
/**
 * @typedef {object} PageLibellePlace
 * @property {() => Record<string, any>} conf les réglages du moment, `CONF`
 * @property {(o: any) => any} ancre
 * @property {(o: any) => any} place
 */
/** @type {PageLibellePlace} */
let soude;

/**
 * Appelé par le code soudé à la place que ce code tenait (`_mode-admin.html`).
 *
 * @param {PageLibellePlace} page
 */
export function brancheLibellePlace(page){
  soude = page;
}

export const cleLibelle = (id) => "_lab:" + id;

/* Le mode est transitoire : on y entre pour retoucher, on en sort. Il ne se
   retient pas d'une session à l'autre — ce n'est pas un réglage du salon. */
export let PLACE_LIBELLES = false;
/** @type {any} */
export let libSel = null;      // l'objet dont on retouche le libellé

/** La porte du mode : l'outil seul l'ouvre et le ferme (`modePlacementLibelles`). */
export function poseModeLibelles(on){
  PLACE_LIBELLES = on;
}

/** La porte du libellé retouché : l'outil seul le choisit (`choisitLibelle`). */
export function poseLibelleChoisi(id){
  libSel = id;
}

/**
 * Ce dont dépend le placement d'un libellé : ce qui s'y écrit, et la forme qui
 * le porte — son ancrage et la place dont il dispose autour.
 *
 * Le nom retenu est celui qui s'affiche, y compris quand l'exploitant l'a
 * choisi lui-même sur une zone : renommer, c'est écrire autre chose, et cet
 * autre chose n'a pas de raison de tenir à la même taille au même endroit.
 */
export function empreinteLibelle(o){
  const a = soude.ancre(o) || [0, 0], p = soude.place(o) || [0, 0];
  return [o.nom || "", o.code || "",
          (+a[0]).toFixed(2), (+a[1]).toFixed(2),
          (+p[0]).toFixed(2), (+p[1]).toFixed(2)].join("|");
}

/** Le placement réglé à la main, s'il décrit encore ce qui est sur le plan. */
export function placementLibelle(o){
  const r = soude.conf()[cleLibelle(o.id)];
  return r && r.e === empreinteLibelle(o) ? r : null;
}
