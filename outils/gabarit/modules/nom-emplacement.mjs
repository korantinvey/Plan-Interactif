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
   texte, des polices, de la configuration et du placement à la main.
   ============================================================ */
import { esc } from "./texte.mjs";
import { conf } from "./configuration.mjs";
import { P_NOM, P_CODE } from "./polices-plan.mjs";
import { habille, largeur, lignesSvg } from "./texte-plan.mjs";
import { PLACE_LIBELLES } from "./libelle-place.mjs";

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
export function libelleEmplacement(s, as, w, h, sel, pxParM, reg){
  const k = facteurLibelle(reg), force = libelleForce(reg);
  const nom = s.nom ? habille(s.nom, w * .9, h * .62, 2.4, P_NOM) : null;
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
