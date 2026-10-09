/* ============================================================
   L'habillage du plan — couleur principale, fond, distinctions, barre du
   salon, modèle

   Sorti de `_admin1.html`. Le plan public le pose à chaque chargement, par
   `appliqueApparence` (`apparence.mjs`) ; l'exploitant le règle dans les
   volets de la fenêtre des réglages (`volets.mjs`). La couleur que le
   système peint derrière l'heure s'importe (`ton-barre.mjs`). Les
   distinctions et leurs marques sur le plan et sur la fiche
   (`distinctions.mjs`) lui sont confiées par `brancheHabillage`, à la place
   que ce code tenait, parce qu'elles importent ce module pour leur mode et
   leur teinte, et ne peuvent donc s'importer d'ici.
   ============================================================ */
import { $ } from "./dom.mjs";
import { trio, melange, luminance } from "./couleurs.mjs";
import { CLE_CONF, conf } from "./configuration.mjs";
import { MODELES, modeleRetenu, habilleModale } from "./modeles.mjs";
import { posePoliceLibelles } from "./polices-plan.mjs";
import { poseTonDeLaBarre } from "./ton-barre.mjs";

/* Ce que le code soudé confie, et rien avant qu'il l'ait fait : le plan ne
   s'habille qu'à l'arrivée des données, bien après le branchement. */
/** @type {Record<string, any>} */
let soude = {};

const racine = document.documentElement;

/**
 * Le branchement, appelé par `_admin1.html` à la place que ce code tenait.
 *
 * @param {{ distinctions: any[], dessineDists: () => void,
 *   refaitDistsFiche: () => void }} b
 */
export function brancheHabillage(b){
  soude = b;

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

/* ------------------------------------------------------------
   Les distinctions — ce que le plan en montre

   Deux champs viennent de la synchronisation : le nouvel exposant, et
   l'adhérent du syndicat du salon. Ce qu'on en fait voir se règle ici, un
   onglet chacun et la même mécanique pour les deux.

   Trois questions par distinction plutôt qu'une, parce que la même marque ne
   tient pas aux trois endroits : un mot se lit sur une fiche qu'on ouvre, pas
   sur un stand qu'on survole — où le rendu WebGL ne rejoue que des formes.

   Les défauts ne changent rien aux salons déjà en ligne : la fiche garde la
   pastille qu'elle portait, le plan et la liste restent nus tant que
   l'exploitant n'a pas choisi.
   ------------------------------------------------------------ */

export const MARQUES_DIST = {
  plan: [
    { cle: "aucun",  nom: "Aucune" },
    { cle: "point",  nom: "Point d'angle" },
    { cle: "corne",  nom: "Coin corné" },
    { cle: "etoile", nom: "Étincelle" },
    { cle: "lisere", nom: "Liseré" },
  ],
  liste: [
    { cle: "aucun",     nom: "Aucune" },
    { cle: "point",     nom: "Point devant le nom" },
    { cle: "cartouche", nom: "Cartouche" },
    { cle: "sousligne", nom: "Mention sous le nom" },
  ],
  fiche: [
    { cle: "aucun",    nom: "Aucune" },
    { cle: "pastille", nom: "Pastille" },
    { cle: "corne",    nom: "Coin corné" },
    { cle: "bandeau",  nom: "Bandeau" },
  ],
};
const DIST_DEFAUT = { plan: "aucun", liste: "aucun", fiche: "pastille" };

/** La marque retenue pour une surface. Une valeur inconnue — un réglage d'une
 *  version qui proposait autre chose — retombe sur le défaut. */
export function modeDist(d, surface){
  const v = conf(d.reglage)[surface];
  return MARQUES_DIST[surface].some(m => m.cle === v) ? v : DIST_DEFAUT[surface];
}

/** La teinte des marques d'une distinction, ou rien — auquel cas la feuille de
 *  style reprend la main, et avec elle l'accent du salon.
 *
 *  Une seule pour les trois surfaces d'une distinction : ce sont trois façons
 *  de dire la même chose, et trois teintes en auraient fait trois distinctions.
 *  Une par distinction en revanche, et c'est tout le sujet : deux marques de la
 *  même couleur sur un stand ne se distinguent plus l'une de l'autre. */
export const couleurDist = (d) => {
  const v = conf(d.reglage).couleur;
  return trio(v) ? v : "";
};

/**
 * Les teintes des distinctions, posées en jetons sur la racine.
 *
 * Trois par distinction : sa teinte, l'aplat doux de la pastille et l'encre
 * qui se lit dessus. La pastille se peint des deux, comme l'accent dont elle
 * les tenait — une teinte choisie doit rendre les deux, sans quoi le mot
 * disparaîtrait sur son propre fond.
 *
 * En haut plutôt que sur chaque marque : une couleur changée repeint alors les
 * neuf cents lignes de la liste sans qu'on les réécrive, et la classe de la
 * distinction va chercher les siens (voir `_head.html`, « .d-neuf »).
 *
 * Le plan, lui, ne se déduit d'aucun jeton : ses marques sont des formes à
 * tracer, et « dessineDists » les refait. La tête de la fiche ouverte non plus,
 * depuis qu'elles sont deux : c'est le script qui décide laquelle occupe le
 * coin, et « refaitDistsFiche » la repose.
 */
export function appliqueDists(){
  soude.distinctions.forEach(d => {
    const v = couleurDist(d);
    const n = "--d-" + d.cle;
    if (v){
      racine.style.setProperty(n, v);
      racine.style.setProperty(n + "-doux", melange(v, "#FFFFFF", 0.86));
      racine.style.setProperty(n + "-ink",
        luminance(trio(v)) > 0.42 ? "#0E1113" : "#FFFFFF");
    } else {
      [n, n + "-doux", n + "-ink"].forEach(x => racine.style.removeProperty(x));
    }
  });
  soude.dessineDists();
  soude.refaitDistsFiche();
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
