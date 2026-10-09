/* ============================================================
   La forme choisie dans l'éditeur, et ce que le plan public en partage

   Choisir une forme dessinée est un geste d'exploitant (`edition.mjs`,
   `outil-dessin.mjs`), mais le plan public lit ce qu'il en reste : le rendu
   des calques marque la forme choisie, la fiche, l'itinéraire, la borne et
   les points d'intérêt retrouvent un repère par son identifiant, les
   libellés mesurent la boîte d'une forme. D'où ce module, que `plan.mjs`
   embarque, et que les autres importent.

   La forme choisie se remplace sans cesse — un clic, la boîte à outils, un
   calque qu'on ferme — : elle ne change que par sa porte (`poseFormeSel`).
   Le code soudé, qui la lit encore (les gestes au clavier), la lit par
   accesseur.
   ============================================================ */
import { mesCalques } from "./calques-dessin.mjs";

/** L'identifiant de la forme choisie dans l'éditeur, ou rien.
 *  @type {any} */
export let formeSel = null;

/** La porte de la forme choisie.
 *  @param {any} id */
export function poseFormeSel(id){
  formeSel = id;
}

export function formeParId(id){
  for (const c of mesCalques()){
    const f = c.formes.find(x => x.id === id);
    if (f) return { c: c, f: f };
  }
  return null;
}

export function boite(f){
  const xs = f.pts.map(p => p[0]), ys = f.pts.map(p => p[1]);
  return [Math.min.apply(null, xs), Math.min.apply(null, ys),
          Math.max.apply(null, xs), Math.max.apply(null, ys)];
}
