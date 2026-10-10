/* ============================================================
   L'habillage du plan — couleur principale, fond, barre du salon, modèle

   Le plan public le pose à chaque chargement, par
   `appliqueApparence` (`apparence.mjs`) ; l'exploitant le règle dans les
   volets de la fenêtre des réglages (`volets.mjs`). La couleur que le
   système peint derrière l'heure s'importe (`ton-barre.mjs`). Ce qu'on fait
   voir des distinctions — marque par surface, teinte — vit avec elles
   (`distinctions.mjs`).
   `brancheHabillage`, sans rien recevoir, pose au premier trait la barre que
   la visite précédente a laissée, au rang que le lancement lui donne
   (`lancement.mjs`).
   ============================================================ */
import { $ } from "./dom.mjs";
import { trio, melange, luminance } from "./couleurs.mjs";
import { CLE_CONF, conf } from "./configuration.mjs";
import { MODELES, modeleRetenu, habilleModale } from "./modeles.mjs";
import { posePoliceLibelles } from "./polices-plan.mjs";
import { poseTonDeLaBarre } from "./ton-barre.mjs";

const racine = document.documentElement;

/**
 * Le branchement, appelé par le lancement (`lancement.mjs` `lancePlan`) au
 * rang que ce code tenait : la barre du salon s'y pose au premier trait.
 */
export function brancheHabillage(){
  /* La barre du salon sur un téléphone : avec bande, ou sans.

     Le choix se pose ici, au premier trait de la page, sur ce que la visite
     précédente a laissé dans le stockage — comme le générique du sponsor, et
     pour la même raison. Attendu à l'arrivée des données, il aurait ouvert le
     plan sans bande puis fait tomber une bande dessus, sous les yeux du
     visiteur. `appliqueBarre` le repose ensuite d'après la configuration reçue,
     qui seule fait foi. */
  try {
    racine.classList.toggle("barre-bande",
      (JSON.parse(localStorage.getItem(CLE_CONF) || "{}")._barre || {}).mode === "bande");
  } catch (e) {}
}

/* ------------------------------------------------------------
   Couleur principale et modèle de fiche

   Deux réglages d'apparence qui ne portent sur aucun calque : la teinte dont
   le plan se sert partout — sélection, liens, boutons pleins — et l'habillage
   de la fiche détail. Ils vivent dans CONF sous une clé préfixée, donc ils
   partent aux visiteurs avec le reste de la configuration.
   ------------------------------------------------------------ */

/**
 * Pose la couleur principale et ses déclinaisons sur la racine.
 *
 * L'exploitant n'en règle qu'une, celle qu'il voit : l'aplat doux des
 * pastilles, l'encre qui s'écrit sur un bouton plein et les deux nuances dont
 * les modèles de fiche composent leurs fonds s'en déduisent. Sans réglage, on
 * retire les variables plutôt que d'en réécrire : la feuille de style reprend
 * la main, et avec elle le bleu d'origine.
 */
export function appliqueAccent(){
  const noms = ["--accent", "--accent-base", "--accent-soft", "--accent-ink",
                "--accent-clair", "--accent-fort"];
  /* La page n'a qu'un fond, et il est clair : le ton choisi se pose tel quel,
     sans la version éclaircie qu'un fond noir aurait réclamée. */
  const base = trio(conf("_accent").couleur) ? conf("_accent").couleur : null;
  if (!base){
    noms.forEach(n => racine.style.removeProperty(n));
    poseTonDeLaBarre();
    return;
  }
  const pose = (n, v) => racine.style.setProperty(n, v);
  pose("--accent", base);
  pose("--accent-base", base);
  pose("--accent-soft", melange(base, "#FFFFFF", 0.86));
  // le texte d'un bouton plein : noir sur un jaune, blanc sur un bleu
  pose("--accent-ink", luminance(trio(base)) > 0.42 ? "#0E1113" : "#FFFFFF");
  pose("--accent-clair", melange(base, "#FFFFFF", 0.34));
  pose("--accent-fort", melange(base, "#000000", 0.42));
  /* Deux modèles peignent leur bandeau de l'accent, trois autres en tirent
     leur surface : la barre du système, qui prolonge ce bandeau derrière
     l'heure, change avec lui. */
  poseTonDeLaBarre();
}

/**
 * Le fond du plan — le gris qui entoure le bâtiment.
 *
 * Il ne se déduit de rien : c'est un aplat que rien ne recouvre, et l'accent
 * n'a pas à le teinter. La teinte choisie se pose telle quelle : un exploitant
 * qui met l'ivoire de sa charte veut cet ivoire-là, pas un ton recalculé. Sans
 * réglage, on retire le jeton plutôt que d'en écrire un — la feuille de style
 * reprend la main, avec le gris de la page.
 */
export function appliqueFond(){
  const v = conf("_fond").couleur;
  if (trio(v)) racine.style.setProperty("--c-fond", v);
  else racine.style.removeProperty("--c-fond");
}


/**
 * Avec bande, ou sans : ce que la barre du salon devient sur un téléphone.
 *
 * Sans bande, le hall va d'un bord à l'autre de l'écran et les commandes se
 * posent dessus, rangées au bord droit : c'est le plan qu'on vient voir, et
 * quarante-six points de haut valent trois lignes de stands. Avec, le nom du
 * salon reste lu en haut — ce qui compte pour un lieu où l'on arrive sans le
 * connaître — et les commandes ne recouvrent rien.
 *
 * Aucune des deux n'a raison partout, d'où le choix. Il ne vaut que sur écran
 * étroit : au large, la barre garde son rang, et la classe ne rencontre aucune
 * règle (voir `_head.html`, « max-width:900px »).
 */
export const modeBarre = () => conf("_barre").mode === "bande" ? "bande" : "flottante";

export function appliqueBarre(){
  racine.classList.toggle("barre-bande", modeBarre() === "bande");
  /* Ce n'est plus la même couleur qui touche la barre du système : la surface
     de la bande quand elle est là, le fond du plan quand il monte jusqu'en
     haut. */
  poseTonDeLaBarre();
}

/**
 * Pose l'habillage retenu sur les cinq pièces de l'écran : la fiche détail, le
 * parcours de visite, l'itinéraire, la liste des exposants et le bandeau du
 * haut. Un seul geste pour tous — le modèle est un accord, et l'exploitant qui
 * choisit « Kraft » choisit le carton partout.
 *
 * Les trois tiroirs de droite portent le même préfixe : ils sont bâtis des
 * mêmes pièces — en-tête, pastilles, boutons — et un modèle écrit une fois
 * les habille tous les trois. La liste garde le sien, elle n'a ni en-tête ni
 * pastille et se dessine autrement ; le bandeau aussi, qui n'a ni l'une ni
 * l'autre et traverse l'écran de part en part.
 *
 * Une seule classe à la fois par panneau : les modèles se recouvrent, et deux
 * ensemble ne veulent rien dire.
 */
export function appliqueModele(){
  const cle = modeleRetenu();
  const pose = (el, prefixe) => el && MODELES.forEach(m =>
    el.classList.toggle(prefixe + m.cle, m.cle === cle));
  ["detail", "parcours", "itineraire"].forEach(id => pose($(id), "modele-"));
  pose($("side"), "liste-");
  pose($("bandeau"), "bandeau-");
  // une fenêtre ouverte pendant qu'on change de modèle suit, comme les tiroirs
  habilleModale();
  posePoliceLibelles(cle);
  /* Le bandeau vient de changer de fond : la barre du système, qui le
     prolonge derrière l'heure, change avec lui. */
  poseTonDeLaBarre();
}
