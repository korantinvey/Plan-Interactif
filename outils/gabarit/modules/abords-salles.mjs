/* ============================================================
   Les abords d'une salle qui se vide

   À la fin d'une conférence, le couloir devant la salle se remplit : un
   fauteuil y passe mal. Ce module dit quelles salles se vident à l'heure du
   trajet, épaissit leurs abords sur la grille, et rend au tiroir le détour que
   cela a coûté, pour qu'il le dise. Réglé par l'exploitant (`REGLAGES_FOULE`,
   `regleFoule`), appelé par `troncon.mjs`.
   ============================================================ */
import { DATA, parId } from "./donnees.mjs";
import { momentLocal, minutesDe } from "./temps.mjs";
import {
  DEGAGEMENT, DEGAGEMENT_PMR, PAS_GRILLE, VX, VY, conf, finInstant,
  grille, instantConf
} from "./grille-marche.mjs";
import { cherche } from "./recherche-chemin.mjs";

/* ------------------------------------------------------------
   Les abords d'une salle qui se vide
   ------------------------------------------------------------ */
/**
 * Trois cents personnes sortent d'une conférence en deux minutes, et l'allée
 * qui borde la salle cesse d'être une allée : on s'y arrête, on s'y retourne,
 * on y cherche son voisin. Un marcheur s'y faufile ; un fauteuil attend que
 * ça passe, ou fait demi-tour dans l'allée qu'il vient de remonter — et
 * personne ne lui avait dit qu'elle serait pleine.
 *
 * L'itinéraire accessible s'en écarte donc, aux seules heures où ces abords se
 * remplissent : le mètre y vaut trois mètres — l'exploitant en décide dans
 * l'onglet « PMR » — et l'A* s'en va le dépenser ailleurs. Un prix et non un
 * mur, car si l'allée bordée est la seule à mener au but elle reste ouverte, et
 * le trajet dit alors qu'il y passe. Prévenir vaut mieux que ne rendre aucun
 * chemin.
 *
 * Jamais pour qui s'y rend, enfin : celui qui vise la conférence veut
 * précisément la porte où tout le monde se presse.
 */

/**
 * Les trois valeurs qui règlent tout cela, leurs bornes et leur origine.
 *
 * Un seul tableau, parce que deux endroits les lisent et qu'ils ne doivent pas
 * diverger : le calcul, ici, et l'onglet « PMR » des réglages, qui propose les
 * mêmes bornes. Un salon dont les salles donnent sur une esplanade n'a pas la
 * foule d'un salon dont elles s'ouvrent sur un couloir de six mètres — d'où le
 * réglage, plutôt qu'un chiffre décidé de loin.
 *
 *   poids    ce que vaut le mètre longé, en mètres d'allée libre. Trois :
 *            l'itinéraire accepte un détour jusqu'au double de ce qu'il aurait
 *            longé. À un, plus rien ne l'écarte.
 *   metres   la largeur des abords, depuis le contour de la salle. Quatre,
 *            soit une allée courante — et c'est cette portion-là qui est
 *            chère, non l'allée d'un bout à l'autre.
 *   minutes  ce qui encadre l'heure dite, de part et d'autre du début comme de
 *            la fin : une conférence commence et s'achève rarement à la
 *            minute.
 */
export const REGLAGES_FOULE = {
  poids:   { defaut: 3,  min: 1, max: 10, pas: .5 },
  metres:  { defaut: 4,  min: 1, max: 20, pas: .5 },
  minutes: { defaut: 10, min: 0, max: 60, pas: 5  },
};

/* Une valeur hors bornes — un champ à moitié tapé, une configuration d'une
   version d'avant — retombe sur l'origine plutôt que de fausser un trajet. */
export function regleFoule(k){
  const r = REGLAGES_FOULE[k], v = +(conf()["_foule"] || {})[k];
  return isFinite(v) && v >= r.min && v <= r.max ? v : r.defaut;
}

/* En deçà, le détour ne mérite pas sa phrase : c'est la largeur d'une allée,
   pas un trajet qu'on aurait fait autrement. */
const DETOUR_DIT = 8;   // mètres

/* Le masque code la salle dans un octet, par pas de huit pour qu'un bord
   adouci ne la fasse pas passer pour sa voisine : au-delà de trente et une
   salles en mouvement à la même minute, on ne saurait plus laquelle nommer —
   et un salon qui en est là n'a plus d'allées, il a une foule. */
const SALLES_FOULE = 31;

/* L'exploitant peut s'en passer : une salle qui donne sur une esplanade
   n'encombre rien, et le détour ne se justifierait plus. */
const ecarteFoule = () => (conf()["_foule"] || {}).visible !== false && regleFoule("poids") > 1;

/** L'heure qu'il est au salon, et non chez le visiteur : un plan consulté d'un
 *  autre fuseau se lit à l'heure du hall. */
export const heureAuSalon = () => momentLocal(new Date().toISOString(), DATA && DATA.fuseau);

/**
 * Les salles d'un pavillon dont une conférence entre ou sort en ce moment.
 *
 * `exempts` porte le départ et l'arrivée : on ne détourne personne de la salle
 * où il se rend, ni de celle d'où il sort — c'est là que la foule est, et
 * c'est là qu'il va.
 */
export function sallesEnMouvement(p, exempts){
  if (!ecarteFoule() || !p.parZone || !p.parZone.size) return [];
  const t = heureAuSalon();
  if (!t) return [];
  const m = minutesDe(t), marge = regleFoule("minutes");
  const l = [];
  p.parZone.forEach((confs, idZone) => {
    if (exempts.has(String(idZone))) return;
    const z = parId.get(String(idZone));
    if (!z || !z.d) return;
    /* La première qui remplit sa salle suffit : deux conférences qui se
       succèdent y font la même foule, et c'est l'allée qu'on décrit, pas le
       programme. La sortie l'emporte sur l'entrée, elle est plus dense. */
    let quand = null;
    const encadre = (x) => x && x.cle === t.cle &&
      m >= minutesDe(x) - marge && m <= minutesDe(x) + marge;
    for (const c of confs){
      const d = instantConf(c), f = finInstant(c);
      if (!quand && encadre(d)) quand = { quoi: "entre", h: d };
      if (encadre(f)) quand = { quoi: "sort", h: f };
      if (quand && quand.quoi === "sort") break;
    }
    if (quand) l.push({ id: String(idZone), d: z.d, nom: z.nom || "salle de conférence",
                        quoi: quand.quoi, h: quand.h.h + "h" + quand.h.min });
  });
  return l.slice(0, SALLES_FOULE);
}

/* Une nappe de peine par pavillon, et une seule : la liste des salles change
   avec l'heure, et garder celle de chaque quart d'heure coûterait un
   mégaoctet à chacun. */
const FOULES = new Map();
export function oublieFoules(){ FOULES.clear(); }

/**
 * La peine, case par case, aux abords des salles en mouvement.
 *
 * Le masque des salles se peint comme la grille l'a été — même pas, même
 * trait, chacune dans sa teinte — puis la peine se propage de proche en proche
 * dans les allées qui le touchent, sans traverser les murs : une salle ne
 * remplit pas l'allée d'à côté sous prétexte qu'elle en est proche à vol
 * d'oiseau. La teinte suit la propagation, et c'est elle qui dira de quelle
 * salle le trajet longe les abords.
 */
export function foule(p, pmr, salles){
  if (!salles.length) return null;
  /* La largeur et le poids entrent dans la clé : les retoucher dans les
     réglages doit refaire la nappe, sans quoi le trajet suivant répondrait
     encore à l'ancien chiffre. */
  const portee = Math.max(1, Math.round(regleFoule("metres") / PAS_GRILLE));
  const peineCase = regleFoule("poids") - 1;
  const cleP = p.id + (pmr ? "|pmr" : "");
  const cle = salles.map(s => s.id).join(",") + "|" + portee + "|" + peineCase;
  const garde = FOULES.get(cleP);
  if (garde && garde.cle === cle) return garde;

  const g = grille(p, pmr);
  const cv = document.createElement("canvas");
  cv.width = g.w; cv.height = g.h;
  const ctx = cv.getContext("2d", { willReadFrequently: true });
  ctx.setTransform(g.co / PAS_GRILLE, -g.si / PAS_GRILLE, g.si / PAS_GRILLE, g.co / PAS_GRILLE,
                   -g.x0 / PAS_GRILLE, -g.y0 / PAS_GRILLE);
  ctx.lineJoin = ctx.lineCap = "round";
  ctx.lineWidth = 2 * (pmr ? DEGAGEMENT_PMR : DEGAGEMENT);
  salles.forEach((s, k) => {
    ctx.fillStyle = ctx.strokeStyle = "rgb(" + (k + 1) * 8 + ",0,0)";
    const t = new Path2D(s.d);
    ctx.fill(t); ctx.stroke(t);
  });
  const px = ctx.getImageData(0, 0, g.w, g.h).data;
  const salleDe = (j) => {
    const k = Math.round(px[j * 4] / 8) - 1;
    return k < 0 ? 0 : k >= salles.length ? salles.length - 1 : k;
  };

  const n = g.w * g.h;
  const d = new Int32Array(n).fill(-1);
  const src = new Int8Array(n).fill(-1);
  const file = new Int32Array(n);
  let tete = 0, queue = 0;
  /* Le seuil de la porte, faute de savoir où elle est : toute case d'allée qui
     touche la salle. Une salle dont on connaîtrait les portes ferait une foule
     plus juste, mais rien dans les données ne les donne. */
  for (let i = 0; i < n; i++){
    if (!g.nappe[i]) continue;
    const cx = i % g.w, cy = (i - cx) / g.w;
    for (let v = 0; v < 4; v++){
      const nx = cx + VX[v], ny = cy + VY[v];
      if (nx < 0 || ny < 0 || nx >= g.w || ny >= g.h) continue;
      const j = ny * g.w + nx;
      if (px[j * 4 + 3] <= 128) continue;
      d[i] = 0; src[i] = salleDe(j); file[queue++] = i;
      break;
    }
  }
  while (tete < queue){
    const i = file[tete++];
    if (d[i] >= portee) continue;
    const cx = i % g.w, cy = (i - cx) / g.w;
    for (let v = 0; v < 4; v++){
      const nx = cx + VX[v], ny = cy + VY[v];
      if (nx < 0 || ny < 0 || nx >= g.w || ny >= g.h) continue;
      const j = ny * g.w + nx;
      if (d[j] >= 0 || !g.nappe[j]) continue;
      d[j] = d[i] + 1; src[j] = src[i]; file[queue++] = j;
    }
  }
  /* Le même prix partout dans le masque, sans dégradé : ce qui est cher, c'est
     de traverser la foule, et elle ne s'éclaircit pas régulièrement à mesure
     qu'on s'écarte de la porte. Au bord du masque le pas reprend son prix, ce
     qui suffit à pousser le trait vers l'autre côté d'une allée large. */
  const peine = new Float32Array(n);
  for (let i = 0; i < n; i++) if (d[i] >= 0) peine[i] = peineCase;

  const f = { cle: cle, salles: salles, peine: peine, src: src };
  FOULES.set(cleP, f);
  return f;
}

/**
 * Ce que le trajet a fait de ces abords-là.
 *
 * Deux choses seulement méritent d'être dites : l'allée qu'on va longer,
 * parce qu'on y trouvera du monde, et le détour qu'on fait faire, parce que
 * trente mètres de plus sans un mot passent pour une erreur de calcul.
 *
 * Le détour ne se sait qu'en traçant aussi le trajet qu'on a écarté : c'est un
 * A* de plus, payé les quelques minutes par heure où une salle se vide. Sans
 * cette comparaison on nommerait des salles que le trajet n'a jamais
 * approchées — la moitié du programme du jour, pour un visiteur qui traverse
 * le hall d'un bout à l'autre.
 */
export function bilanFoule(g, f, a, b, suite){
  const nomme = (l, i) => { if (f.peine[i] > 0) l.set(f.src[i], f.salles[f.src[i]]); };
  const longees = new Map();
  for (const i of suite) nomme(longees, i);
  if (longees.size) return { longees: [...longees.values()], contournees: [] };

  const droit = cherche(g, a, b, null);
  if (!droit) return null;
  const genantes = new Map();
  for (const i of droit) nomme(genantes, i);
  // le trajet direct n'y passait pas davantage : il n'y a pas de détour
  if (!genantes.size) return null;
  const sup = (suite.length - droit.length) * PAS_GRILLE;
  if (sup < DETOUR_DIT) return null;
  return { longees: [],
           contournees: [...genantes.values()].map(s => ({ ...s, sup: sup })) };
}
