/* ============================================================
   La caméra du plan immersif — le hall vu de biais

   L'ambiance « Immersif » (`ambiance.mjs`) montre le plan comme une maquette
   posée sur une table : incliné, la fuite qui rapetisse le fond, les stands
   en volume. Tout le reste du plan ignore qu'il est incliné. La vue reste le
   cadre `{ x, y, w, h }` en mètres que les gestes, le cadrage et le zoom ont
   toujours manipulé (`vue-etat.mjs`) ; la caméra se pose par-dessus, comme
   une transformation fixe de ce cadre à plat vers l'écran.

   Fixe, c'est-à-dire indépendante du zoom et du glissé : elle ne dépend que
   de l'inclinaison, du cap que l'exploitant règle et de la taille de la
   scène. C'est ce qui permet de la tenir à part, sans rien savoir de la vue.

   Deux lecteurs :

   - le dessin par la carte graphique (`webgl.mjs`), qui en tire les matrices
     de sa vue 3D et y monte les stands ;
   - les gestes et la vue (`gestes.mjs`, `vue.mjs`), qui redressent sur le sol
     le point que le doigt touche : glisser, pincer, tourner la molette
     agissent sur le plan à plat, exactement comme avant.

   Le dessin la déclare en jeu (`metsEnJeu`) quand il l'applique, et pas
   avant : le repli en SVG, l'administration en cours d'édition ou une carte
   graphique qui n'arrive pas gardent le plan à plat, et les conversions
   restent alors l'identité.

   Les conversions travaillent en pixels de la scène, mesurés depuis son coin
   haut gauche, comme `cadrePlan` les donne.
   ============================================================ */

import { creeAnnonce } from "./annonce.mjs";

const DEG = Math.PI / 180;

/* L'inclinaison retenue : celle de la maquette. Plus couché, le fond du hall
   se tasse au point que ses noms ne se lisent plus ; plus droit, les volumes
   ne se voient plus. */
const INCLINAISON = 50 * DEG;
/* Ce qu'une hauteur devient à l'écran, rapporté à ce qu'elle y serait vue de
   face : qui veut un écart vertical donné à l'écran monte d'autant plus. */
export const SINUS_INCLINAISON = Math.sin(INCLINAISON);
/* L'œil se tient à une fois et demie la diagonale de la scène : assez près
   pour que le fond rapetisse et que l'entrée avance, assez loin pour qu'un
   hall en longueur ne s'écrase pas en pointe. */
const RECUL = 1.5;

const etat = { voulue: false, enJeu: false, cap: 0 };

/** La caméra vient d'entrer en jeu, d'en sortir ou de tourner : ce qui était
 *  cadré à plat ne l'est plus, et la vue (`vue.mjs`) recadre. */
export const CAMERA_CHANGEE = creeAnnonce();

/** L'ambiance demande la caméra, ou la rend. Le cap est en degrés. */
export function demandeCamera(/** @type {boolean} */ voulue, /** @type {number} */ cap){
  const avant = etat.cap;
  etat.voulue = voulue;
  etat.cap = (Number(cap) || 0) * DEG;
  if (etat.enJeu && etat.cap !== avant) CAMERA_CHANGEE.dis();
}
/** L'ambiance la demande-t-elle ? Le dessin seul décide de l'appliquer. */
export const cameraVoulue = () => etat.voulue;
/** Le cap retenu, en radians. */
export const capCamera = () => etat.cap;
/** Ce qui distingue une caméra d'une autre, pour qui doit savoir qu'elle a tourné. */
export const cleCamera = () => etat.voulue ? String(etat.cap) : "";

/* La hauteur d'un stand en volume, en mètres. Basse : la maquette montre des
   cloisons et non des bâtiments, et un stand plus haut cacherait le nom de
   celui qui le suit. Un emplacement libre reste au ras du sol — il se lit
   comme un vide entre les stands, ce qu'il est. */
export const HAUTEUR_STAND = 1.6, HAUTEUR_LIBRE = .06;
/* Une zone de l'organisateur — restaurant, accueil, salle — monte moins haut
   qu'un stand : elle couvre souvent un grand pan du hall, et à hauteur de
   stand elle cacherait les noms de toute une allée derrière elle. */
export const HAUTEUR_ZONE = 1;
/* Ce qu'on choisit se hausse au-dessus du reste, d'autant. */
export const HAUSSE_CHOIX = 2.2;
/* ------------------------------------------------------------
   Le trajet à l'écran

   Vu de biais, un itinéraire qui passe derrière une rangée de stands s'y
   cache. Tant qu'un trajet est tracé, les stands s'abaissent donc — sauf
   ceux où il part, s'arrête et arrive. Le tracé (`trace-itineraire.mjs`) dit
   ici quels points il relie ; le dessin (`webgl.mjs`) l'écoute et garde haut
   tout stand qui en contient un. Ce module neutre sert de relais : le dessin
   ne peut importer le tracé, qui l'atteint par la vue.
   ------------------------------------------------------------ */
/** @type {{ p: number, xy: number[] }[] | null} */
let bouts = null;
/** Le trajet vient d'apparaître, de changer ou de disparaître. */
export const TRAJET_CHANGE = creeAnnonce();
/** Les points que relie le trajet tracé — départ, arrêts, arrivée —, ou rien. */
export function poseTrajet(/** @type {{ p: number, xy: number[] }[] | null} */ points){
  const avant = JSON.stringify(bouts), apres = JSON.stringify(points);
  bouts = points;
  if (avant !== apres) TRAJET_CHANGE.dis();
}
export const boutsDuTrajet = () => bouts;
/** La hauteur d'un stand abaissé pendant qu'un trajet est tracé. */
export const HAUTEUR_ABAISSEE = .18;

/** Le dessin applique la caméra, ou la retire. */
export function metsEnJeu(/** @type {boolean} */ oui){
  if (etat.enJeu === oui) return;
  etat.enJeu = oui;
  CAMERA_CHANGEE.dis();
}
/** La caméra est-elle à l'écran ? Sinon, toutes les conversions sont l'identité. */
export const cameraEnJeu = () => etat.enJeu;

/** Les grandeurs du moment, pour une scène de `W` × `H` pixels. */
function grandeurs(/** @type {number} */ W, /** @type {number} */ H){
  return { cc: Math.cos(etat.cap), sc: Math.sin(etat.cap),
    ct: Math.cos(INCLINAISON), st: Math.sin(INCLINAISON),
    P: RECUL * Math.hypot(W, H) };
}

/**
 * Le point du sol à plat (pixels de la scène) vu à l'écran.
 * @returns {[number, number]}
 */
export function platVersEcran(/** @type {number} */ fx, /** @type {number} */ fy,
  /** @type {number} */ W, /** @type {number} */ H){
  if (!etat.enJeu) return [fx, fy];
  const { cc, sc, ct, st, P } = grandeurs(W, H);
  const X = fx - W / 2, Y = fy - H / 2;
  const x1 = X * cc - Y * sc, y1 = X * sc + Y * cc;
  const w = 1 - y1 * st / P;
  return [W / 2 + x1 / w, H / 2 + y1 * ct / w];
}

/**
 * Le point de l'écran redressé sur le sol à plat — l'inverse du précédent.
 *
 * Au-delà de l'horizon, l'écran ne montre plus le sol : le point se rabat
 * sur la limite, assez loin pour qu'un geste parti de là pousse le plan sans
 * le jeter à l'infini.
 * @returns {[number, number]}
 */
export function ecranVersPlat(/** @type {number} */ sx, /** @type {number} */ sy,
  /** @type {number} */ W, /** @type {number} */ H){
  if (!etat.enJeu) return [sx, sy];
  const { cc, sc, ct, st, P } = grandeurs(W, H);
  const u = sx - W / 2, v = sy - H / 2;
  const den = Math.max(ct + v * st / P, ct * .08);
  const y1 = v / den, w = 1 - y1 * st / P;
  const x1 = u * w;
  return [W / 2 + x1 * cc + y1 * sc, H / 2 - x1 * sc + y1 * cc];
}

/**
 * Les matrices de la vue 3D, en colonnes comme les veut la carte graphique.
 *
 * La vue mène le monde (mètres, l'axe des y vers le bas comme dans le SVG,
 * la hauteur vers l'œil) aux pixels de la scène comptés depuis son centre,
 * mis à l'échelle `s` du zoom, tournés du cap puis inclinés. La projection
 * fait la fuite et ramène ces pixels à l'écran.
 *
 * La profondeur se compte sur deux fois la distance de l'œil : un point qui
 * s'en éloigne à l'infini tombe à mi-chemin du fond, et le plan ne se coupe
 * jamais au loin, quel que soit le zoom.
 */
export function matricesCamera(/** @type {number} */ W, /** @type {number} */ H, /** @type {number} */ s){
  const { cc, sc, ct, st, P } = grandeurs(W, H);
  const D = 2 * P;
  // R = inclinaison · cap, puis l'échelle ; écrite en colonnes
  const vue = [
    s * cc,       s * sc * ct,  s * sc * st,  0,
    -s * sc,      s * cc * ct,  s * cc * st,  0,
    0,            -s * st,      s * ct,       0,
    0,            0,            0,            1,
  ];
  const projection = [
    2 / W, 0, 0, 0,
    0, -2 / H, 0, 0,
    0, 0, -1 / D, -1 / P,
    0, 0, 0, 1,
  ];
  return { vue, projection };
}
