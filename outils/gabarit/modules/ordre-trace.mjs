/* ============================================================
   Pile des calques — l'ordre de tracé
   Habillage Klipso, zones, stands, textes et calques de dessin vivent dans
   un seul empilement : n'importe lequel peut se glisser entre deux autres.
   L'ordre de la liste est l'ordre de tracé — le premier est derrière.

   Le visiteur le reçoit : les couches s'empilent sur son plan comme sur
   celui de l'exploitant, d'où `plan.mjs`. Le panneau qui les règle
   (`pile.mjs`) et la fenêtre qui les réordonne (`ordre-calques.mjs`) sont
   d'exploitant, et l'importent.

   Le panneau lui-même n'est qu'à l'administration : le plan public appelle
   `construitPanneau` sans s'en servir. Il garde donc ici sa signature, et
   l'administration son contenu, que `pile.mjs` lui confie en se chargeant
   (`confiePanneau`).
   ============================================================ */
import { $ } from "./dom.mjs";
import { P } from "./donnees.mjs";
import { CONF } from "./configuration.mjs";
import { mesCalques } from "./calques-dessin.mjs";

export const clePile = () => "_pile:" + P().id;

export function entrees(){
  /* `ref` change de nature avec `t` : le fond, le nom de la couche de données,
     le calque de dessin. */
  /** @type {{ k: string, t: string, nom: string, ref: any }[]} */
  const e = [];
  P().fond.forEach(f => e.push({ k: "fond:" + f.cle, t: "fond", nom: f.nom, ref: f }));
  e.push({ k: "data:zones",  t: "data", nom: "Zones organisateur", ref: "zones" });
  e.push({ k: "data:stands", t: "data", nom: "Stands",             ref: "stands" });
  e.push({ k: "data:labels", t: "data", nom: "Textes",             ref: "labels" });
  mesCalques().forEach(c => e.push({ k: "dessin:" + c.id, t: "dessin", nom: c.nom, ref: c }));
  return e;
}

/* ordre effectif : celui qui a été choisi, complété par les nouveautés */
export function pile(){
  const enregistre = CONF[clePile()];
  const e = entrees();
  const defaut = e.map(x => x.k);
  if (!Array.isArray(enregistre)) return e;
  const rang = x => {
    const i = enregistre.indexOf(x.k);
    return i >= 0 ? i : 10000 + defaut.indexOf(x.k);   // les nouvelles couches à la fin
  };
  return e.slice().sort((a, b) => rang(a) - rang(b));
}

function groupe(k){
  const c = $("couches");
  if (k.indexOf("fond:") === 0)   return c.querySelector('.cal[data-cle="' + CSS.escape(k.slice(5)) + '"]');
  if (k.indexOf("dessin:") === 0) return c.querySelector('.dcal[data-dcal="' + CSS.escape(k.slice(7)) + '"]');
  return $(k.slice(5));
}

/* déplacer les nœuds plutôt que tout reconstruire : réordonner est instantané */
export function ordonneDom(){
  const c = $("couches");
  pile().forEach(x => { const g = groupe(x.k); if (g) c.appendChild(g); });
}

/* Le panneau des calques : rien chez le visiteur, ce que `pile.mjs` confie
   chez l'exploitant. */
let remplit = () => {};

/** La porte du panneau, que `pile.mjs` ouvre en se chargeant : un module
 *  public ne peut importer celui de l'exploitant.
 *  @param {() => void} f */
export function confiePanneau(f){
  remplit = f;
}

/* Le plan public l'appelle sans s'en servir : il garde sa signature, et
   l'administration son contenu, dans `modules/pile.mjs`. */
export function construitPanneau(){
  remplit();
}
