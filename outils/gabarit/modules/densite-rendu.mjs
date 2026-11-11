/* ============================================================
   La densité du rendu — moins de pixels pour les téléphones modestes

   La carte graphique peint le plan à la densité de l'écran : 2,75 pixels par
   point sur un Redmi Note 9 Pro, sept fois et demie les pixels d'un écran
   ordinaire. Un téléphone d'entrée de gamme n'y suffit pas : la moitié de
   ses images y passaient 33 ms pendant un geste, et l'ouverture six
   secondes (sonde, FUNEXPO 2026, 11 novembre 2026). Les logos des stands,
   taillés à la même densité, débordaient en plus leur planche et se
   renvoyaient sans cesse : 24,7 Mo pour dix-neuf logos.

   Plafonnée à deux, la densité retire à peu près la moitié des pixels, et
   la différence se voit à peine à la distance où l'on tient un téléphone.
   Le plan (`webgl.mjs`) et les logos (`logos-stands.mjs`) la lisent ici, et
   non dans `devicePixelRatio` : des logos taillés plus fins que la toile qui
   les peint seraient du poids pour rien.

   Qui est modeste ? Le navigateur ne dit ni le modèle ni la puissance. Deux
   indices, relevés sur trois semaines de visites Android (sonde, 21 octobre
   au 11 novembre 2026), où huit modèles passaient plus d'un quart de leurs
   images au-delà de 33 ms :
   - la mémoire annoncée (`deviceMemory`, Chrome seul, arrondie à une
     puissance de deux) de quatre gigaoctets ou moins en désignait cinq ;
   - des textures de 4096 pixels au plus, la limite des puces graphiques
     d'entrée de gamme (Adreno 5xx et 6xx, Mali-G52 et G57), six.
   L'un ou l'autre en désigne sept ; le huitième, un Adreno 610 à huit
   gigaoctets, passe au travers. Deux téléphones assez vifs sont désignés à
   tort (Adreno 810, Mali-G77) : ils n'y perdent qu'un peu de finesse. Les
   iPhone ne disent pas leur mémoire, acceptent des textures de 16 384
   pixels, et n'ont pas besoin du plafond.

   Le verdict est lu une fois : le changer en cours de visite referait la
   toile et toutes les planches de logos.
   ============================================================ */
import { carteGraphique } from "./mesures-page.mjs";

/** La densité au-delà de laquelle un appareil modeste n'est plus peint. */
export const DENSITE_MODESTE = 2;
/** La plus grande texture d'une puce d'entrée de gamme. */
export const TEXTURE_MODESTE = 4096;
/** La mémoire, en gigaoctets, d'un appareil d'entrée de gamme. */
export const MEMOIRE_MODESTE = 4;

/**
 * L'appareil est-il modeste ? Pure, pour être éprouvée sans navigateur.
 * Une grandeur inconnue ne désigne personne.
 * @param {{ memoireGo?: number, textureMax?: number }} a
 */
export function estModeste({ memoireGo, textureMax } = {}){
  return (typeof memoireGo === "number" && memoireGo > 0 && memoireGo <= MEMOIRE_MODESTE)
    || (typeof textureMax === "number" && textureMax > 0 && textureMax <= TEXTURE_MODESTE);
}

/**
 * La densité à peindre, pour un écran de densité `ecran`. Pure.
 * @param {number} ecran
 * @param {boolean} modeste
 */
export function plafonne(ecran, modeste){
  const d = ecran > 0 && isFinite(ecran) ? ecran : 1;
  return modeste ? Math.min(d, DENSITE_MODESTE) : d;
}

/** @type {boolean | undefined} */
let _modeste;

/** L'appareil de cette visite est-il modeste ? Lu une fois. */
export function appareilModeste(){
  if (_modeste !== undefined) return _modeste;
  const memoireGo = /** @type {any} */ (navigator).deviceMemory;
  /* La mémoire suffit à conclure ; sinon la carte graphique, dont la question
     coûte une toile jetée — et seulement si le plafond y changerait quelque
     chose. */
  if (estModeste({ memoireGo }) || (window.devicePixelRatio || 1) <= DENSITE_MODESTE)
    return (_modeste = estModeste({ memoireGo }));
  const carte = carteGraphique();
  return (_modeste = estModeste({ memoireGo, textureMax: carte ? carte.textureMax : undefined }));
}

/** La densité à laquelle le plan et ses logos se peignent. Relue à chaque
 *  fois : celle d'un écran de bureau suit le zoom du navigateur. */
export function densiteRendu(){
  return plafonne(window.devicePixelRatio || 1, appareilModeste());
}

/** Ce que la bibliothèque du dessin reçoit pour `useDevicePixels` : la
 *  densité plafonnée, ou `true` — elle suit alors l'écran d'elle-même. */
export function pixelsDuDessin(){
  return appareilModeste() ? densiteRendu() : true;
}
