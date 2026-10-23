/* ============================================================
   Le nom d'un emplacement sur le plan — l'enseigne, son numéro, ses hébergés

   Ce qu'écrit un stand : le nom de l'enseigne coupé à sa place, le numéro
   dessous, la pastille des sociétés qu'il héberge, et le placement que
   l'exploitant a réglé à la main. Le stand rendu par la synchronisation
   (`libelles.mjs`) et le stand dessiné à la main (`dessin.mjs`) l'écrivent
   à l'identique — c'est tout l'intérêt de dessiner un stand plutôt qu'une
   forme quelconque.

   Il vivait dans `libelles.mjs`, que le dessin importait donc pour écrire
   ses stands : les libellés ne pouvaient plus importer le dessin, qui devait
   leur confier ce qu'ils en appellent. Il ne dépend que de la mesure du
   texte, des polices, de la configuration, du placement à la main et de la
   place libre sur les allées (`debord-allees.mjs`), et des paliers des noms
   (`paliers-noms.mjs`).
   ============================================================ */
import { esc } from "./texte.mjs";
import { conf } from "./configuration.mjs";
import { P_NOM, P_CODE } from "./polices-plan.mjs";
import { habille, largeur, lignesSvg, place } from "./texte-plan.mjs";
import { PLACE_LIBELLES } from "./libelle-place.mjs";
import { debordsAuxAllees } from "./debord-allees.mjs";
import { paliersDe, palierDe } from "./paliers-noms.mjs";

/**
 * Ce que le plan dit des stands partagés, et que l'exploitant peut retirer.
 *
 * Deux réglages, parce que les deux gênes ne sont pas la même : la pastille
 * charge le plan d'un chiffre de plus, la fenêtre de choix ajoute un clic
 * avant toute fiche. Un salon où deux stands seulement sont partagés veut
 * souvent se passer de la seconde sans renoncer à la première.
 *
 * Rien retiré par défaut : un réglage absent laisse le salon tel qu'il était.
 */
export const coexComptes = () => conf("_coexNombre").visible !== false;
export const coexChoisit = () => conf("_coexChoix").visible !== false;

/**
 * La ligne du numéro de stand, et le compte des sociétés qu'il héberge.
 *
 * Un stand partagé garde le nom de son titulaire — c'est le sien, c'est lui
 * qui loue l'emplacement — et une pastille dit combien d'autres l'y
 * accompagnent : « +2 » sous « Airbnb » en annonce deux de plus, que la fiche
 * nomme. Le nombre est celui des hébergés, pas le total : c'est ce que « + »
 * veut dire partout ailleurs.
 *
 * Le couple reste centré sur l'ancre, la pastille poussant le numéro vers la
 * gauche : déborder à droite mènerait sur la cloison du voisin. Faute de
 * place, le numéro reste seul — une pastille hors du stand désignerait
 * quelqu'un d'autre.
 */
function ligneCode(s, xc, yBase, f, wMax, cls){
  const texte = (x, c, txt) =>
    '<text class="' + c + '" x="' + x.toFixed(2) + '" y="' + yBase.toFixed(2) +
    '" font-size="' + f.toFixed(2) + '">' + esc(txt) + '</text>';
  const n = coexComptes() ? (s.coex || []).length : 0;
  const wCode = largeur(s.code, P_CODE) * f;
  const compte = "+" + n;
  const marge = f * .34, ecart = f * .42;
  const wPast = largeur(compte, P_CODE) * f + marge * 2;
  if (!n || wCode + ecart + wPast > wMax) return texte(xc, cls, s.code);
  const g = xc - (wCode + ecart + wPast) / 2;
  const xp = g + wCode + ecart, hp = f * 1.16;
  return texte(g + wCode / 2, cls, s.code) +
    '<rect class="coexPast' + (cls ? " " + cls : "") + '" x="' + xp.toFixed(2) +
    '" y="' + (yBase - f * .84).toFixed(2) +
    '" width="' + wPast.toFixed(2) + '" height="' + hp.toFixed(2) +
    '" rx="' + (hp / 2).toFixed(2) + '"/>' +
    /* Le nombre porte lui aussi la marque de la sélection : c'est elle qui
       décide de sa couleur, comme pour le numéro du stand. */
    texte(xp + wPast / 2, "coexN" + cls, compte);
}

/* ------------------------------------------------------------
 * Le placement réglé à la main, appliqué à ce que le calcul propose : un
 * décalage en mètres, et un facteur de taille.
 *
 * Le facteur multiplie ce que le calcul a trouvé au lieu de le remplacer :
 * l'enseigne garde ainsi le découpage en lignes que sa place lui donnait, et
 * l'agrandir ne la recompose pas d'un coup en travers du stand.
 *
 * En mode placement, un libellé réglé s'affiche quelle que soit sa taille à
 * l'écran. Sans cela, le réduire au point de le faire disparaître le rendrait
 * inatteignable — et le réglage, impossible à défaire.
 * ------------------------------------------------------------ */
export const decaleLibelle = (xy, reg) => reg ? [xy[0] + (reg.dx || 0), xy[1] + (reg.dy || 0)] : xy;
export const facteurLibelle = (reg) => reg && reg.k > 0 ? reg.k : 1;
export const libelleForce = (reg) => Boolean(reg && PLACE_LIBELLES);

/**
 * Le libellé d'un emplacement : le nom de l'enseigne, son numéro dessous.
 *
 * Il s'écrit pour deux choses que rien d'autre ne rapproche — le stand rendu
 * par la synchronisation, qui tient son ancrage et sa place de la source, et
 * le stand dessiné à la main, qui les tient de son rectangle. Le rendu doit
 * être le même : c'est tout l'intérêt de dessiner un stand plutôt qu'une
 * forme quelconque.
 */
export function libelleEmplacement(s, as, l, h0, sel, pxParM, reg){
  /* Un stand couché écrit dans sa longueur : on mesure comme s'il était
     debout, puis on fait tourner l'ensemble — nom, numéro, pastille — autour
     de l'ancre. */
  const tourne = nomCouche(s, l, h0);
  const out = libelleDroit(s, as, tourne ? h0 : l, tourne ? l : h0, sel, pxParM, reg, tourne);
  if (!out || !tourne) return out;
  const xy = decaleLibelle(as, reg);
  return '<g transform="rotate(-90 ' + xy[0].toFixed(2) + ' ' + xy[1].toFixed(2) + ')">' + out + '</g>';
}

/**
 * Le nom d'un stand étroit s'écrit-il à la verticale ?
 *
 * Sur un stand bien plus haut que large, le nom écrit en travers se réduit à
 * la largeur, et devient illisible bien avant celui du voisin, plus trapu.
 * Couché dans la longueur, il garde sa taille — le plan d'Eurosatory le fait,
 * c'est de là que l'idée vient. Mais pencher la tête a un prix : on ne couche
 * le nom que s'il y gagne nettement, d'un sixième au moins. Un stand à peine
 * plus haut que large garde son nom droit, comme ses voisins.
 *
 * Réglage de l'exploitant, éteint par défaut : un salon qui ne l'a pas coché
 * garde le plan qu'il connaissait.
 */
export const nomsPivotes = () => conf("_nomsPivotes").visible === true;

export function nomCouche(s, w, h){
  if (!nomsPivotes() || !(h > w * 1.25)) return false;
  // les mesures de « libelleDroit » : le nom s'il y en a un, sinon le numéro
  const taille = (l, ht) => {
    if (s.nom){ const a = habille(s.nom, l * .9, ht * .62, 2.4, P_NOM); return a ? a.f : 0; }
    return s.code ? Math.min(ht * .34, (l * .9) / largeur(s.code, P_CODE), 1.9) : 0;
  };
  const couche = taille(h, w);
  return couche > 0 && couche > taille(w, h) * 1.15;
}

/**
 * Les noms des stands harmonisés : trois tailles, les plus grandes plafonnées.
 *
 * Chaque nom prend la plus grande taille que sa place lui permet : un grand
 * stand au nom court écrit en grand, un petit stand au nom long en tout
 * petit, et le plan semble crier certains noms. Allumé, ce réglage ramène les
 * noms du pavillon à trois paliers, le plus haut à la médiane de leurs
 * tailles (`paliers-noms.mjs`) : les grands noms se plafonnent, chacun prend
 * le plus grand palier qu'il atteint, et aucun ne descend sous ce qu'il
 * pouvait faire chez lui. Caler tous les noms sur le plus petit, comme on l'a
 * d'abord fait, les rendait tous illisibles pour un seul long nom.
 *
 * Éteint par défaut comme celui des noms couchés : un salon garde l'écriture
 * qu'il connaissait tant qu'on ne l'a pas choisie pour lui. La clé garde son
 * premier nom, `_nomsUniformes`, pour ne pas perdre la case déjà cochée.
 *
 * Seuls les noms s'harmonisent : les zones gardent leur taille, et le numéro
 * reste sous le nom, plus petit que lui, comme dans « libelleDroit ».
 *
 * Pour atteindre un palier, un nom a le droit, dans ce mode seulement, de
 * déborder de son stand sur l'allée qui le borde — pas sur un stand voisin ni
 * sur une zone (`debord-allees.mjs`). Le numéro, lui, reste dans le stand :
 * c'est lui qui désigne l'emplacement.
 */
export const nomsUniformes = () => conf("_nomsUniformes").visible === true;

/* Les paliers, et ce que chaque stand du pavillon peut prendre sur les
   allées, que les deux rendus fixent au début de chaque écriture
   (`libelles.mjs`). Le stand dessiné à la main suit les paliers sans compter
   dans leur calcul, et ne déborde pas : le dessin importe ce module, et ce
   module ne peut pas l'importer. */
let paliers = [];
let debords = new Map();
/* Les débords comparent chaque stand à tous les autres : on ne les refait
   que si le pavillon a changé — un autre pavillon, un stand repris ou
   déplacé —, et non à chaque arrêt de la vue. */
let cleDebords = "";

/**
 * Fixe les paliers des noms d'après les stands d'un pavillon. Chaque nom se
 * mesure comme « libelleDroit » le ferait, couché s'il doit l'être, avec la
 * place qu'il peut prendre sur les allées, et sans le facteur du placement à
 * la main : ce facteur s'applique ensuite, par-dessus le palier, comme il
 * s'applique à la taille calculée.
 *
 * Les paliers, eux, se refont à chaque écriture : une police qui arrive ou la
 * case des noms couchés les changent, et ils ne coûtent qu'une lecture des
 * mesures déjà gardées.
 *
 * @param {{ nom?: string, code?: string, c?: number[], bb?: number[] }[]} stands
 * @param {{ c?: number[], bb?: number[] }[]} zones
 */
export function posePaliers(stands, zones){
  paliers = [];
  if (!nomsUniformes()){ debords = new Map(); cleDebords = ""; return; }
  let cle = stands.length + ":" + zones.length;
  for (const o of [...stands, ...zones]) if (o.c && o.bb) cle += "|" + o.c.join(",") + "," + o.bb.join(",");
  if (cle !== cleDebords){ debords = debordsAuxAllees(stands, zones); cleDebords = cle; }
  const tailles = [];
  for (const s of stands){
    if (!s.nom) continue;
    const [l, h] = place(s);
    const tourne = nomCouche(s, l, h);
    tailles.push(tailleMax(s, tourne ? h : l, tourne ? l : h, tourne));
  }
  paliers = paliersDe(tailles);
}

/* Les places où le nom peut s'écrire : celle du stand d'abord, puis celles
   qu'offrent les allées, du plus sobre au plus large. Un stand couché lit
   les débords en travers, sa largeur étant la hauteur sur le plan. */
function placesDuNom(s, w, h, tourne){
  return [[w, h], ...(debords.get(s) || []).map(([dw, dh]) => tourne ? [w + dh, h + dw] : [w + dw, h + dh])];
}

/* Les lignes qu'un nom harmonisé peut prendre quand cela le fait monter d'un
   palier : un stand étroit et haut, dont le nom bute sur la largeur, gagne
   à l'écrire en colonne dans la hauteur que le débord lui donne. */
const LIGNES_EN_COLONNE = 5;

/** La plus grande taille que le nom peut prendre, débords compris. */
function tailleMax(s, w, h, tourne, maxLignes = 3){
  let f = 0;
  for (const [pw, ph] of placesDuNom(s, w, h, tourne)){
    const a = habille(s.nom || "", pw * .9, ph * .62, 2.4, P_NOM, maxLignes);
    if (a && a.f > f) f = a.f;
  }
  return f;
}

/**
 * Le nom d'un stand, coupé et mesuré pour une place de `w` sur `h` — `tourne`
 * dit si cette place est celle du stand couché, dont la largeur est la
 * hauteur sur le plan.
 *
 * Harmonisé, le nom vise son palier, qui entre comme plafond de « habille »
 * plutôt qu'en réduisant son résultat après coup : à égalité de taille,
 * « habille » garde le moins de lignes, et un nom qu'on coupait en trois pour
 * l'écrire plus grand se remet sur une seule ligne s'il tient à son palier.
 * Des places possibles, il prend la première qui l'atteint : un nom qui tient
 * chez lui ne déborde pas. Les paliers, eux, se comptent sur trois lignes :
 * la colonne de mots est un recours pour le nom, non une mesure du pavillon.
 *
 * @param {{ nom?: string }} s
 * @param {number} w
 * @param {number} h
 * @param {boolean} [tourne]
 */
export function habilleNom(s, w, h, tourne = false){
  const nom = s.nom || "";
  if (!paliers.length) return habille(nom, w * .9, h * .62, 2.4, P_NOM);
  /* Au-delà de trois lignes, seulement si le nom y gagne un palier : quelques
     centimètres de plus ne valent pas une colonne de mots. */
  let cible = palierDe(tailleMax(s, w, h, tourne), paliers), lignes = 3;
  const enColonne = palierDe(tailleMax(s, w, h, tourne, LIGNES_EN_COLONNE), paliers);
  if (enColonne > cible && paliers.includes(enColonne)){ cible = enColonne; lignes = LIGNES_EN_COLONNE; }
  let best = null;
  for (const [pw, ph] of placesDuNom(s, w, h, tourne)){
    const a = habille(nom, pw * .9, ph * .62, cible, P_NOM, lignes);
    if (a && a.f >= cible * (1 - 1e-9)) return a;
    if (a && (!best || a.f > best.f)) best = a;
  }
  return best;
}

/** Le nom et le numéro, écrits droits dans une place de `w` sur `h`. */
function libelleDroit(s, as, w, h, sel, pxParM, reg, tourne){
  const k = facteurLibelle(reg), force = libelleForce(reg);
  const nom = s.nom ? habilleNom(s, w, h, tourne) : null;
  const fn = nom ? nom.f * k : 0;
  const nomLisible = nom && (sel || force || fn * pxParM >= 4.5);
  const maxCode = s.nom ? Math.min(nom ? nom.f * .78 : 1.2, h * .22) : h * .34;
  const fc = (s.code ? Math.min(maxCode, (w * .9) / largeur(s.code, P_CODE), 1.9) : 0) * k;
  const codeLisible = fc && (sel || force || fc * pxParM >= (nomLisible ? 5 : 6));
  if (!codeLisible && !nomLisible) return "";

  const c = sel ? " sel" : "";
  const xy = decaleLibelle(as, reg);
  const hNom = nomLisible ? nom.lignes.length * fn * 1.18 : 0;
  const hCode = codeLisible ? fc * 1.25 : 0;
  let y = xy[1] - (hNom + hCode) / 2, out = "";
  if (nomLisible){ out += lignesSvg(nom.lignes, fn, xy[0], y + hNom / 2, "nm" + c); y += hNom; }
  if (codeLisible) out += ligneCode(s, xy[0], y + fc * .92, fc, w * .9 * k, c);
  return out;
}
