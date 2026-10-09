/* ============================================================
   Les repères et les transports en commun — ce qu'ils sont

   Ce qu'un repère est (son type, son pictogramme), ce qu'une zone est, ce
   qu'un arrêt dessert (son mode, sa ligne, sa couleur) : des lectures pures,
   sans document ni état, que le tracé du plan, le cartouche des points
   d'intérêt, l'itinéraire et l'éditeur se partagent. Le visiteur les reçoit
   toutes : `plan.mjs` embarque ce module.

   Le tracé d'un repère sur le plan, lui, vit dans `modules/dessin.mjs`, à
   côté des autres formes dessinées.
   ============================================================ */
import { trio, luminance } from "./couleurs.mjs";

/* Les libellés courants, pour ne pas les ressaisir à chaque salon. */
/**
 * Pictogrammes des points d'intérêt.
 *
 * Tirés de Material Symbols (Google, licence Apache 2.0), dans leur variante
 * au trait. Ils sont recopiés ici plutôt qu'appelés à distance : une page
 * publiée ne doit dépendre d'aucun service tiers pour s'afficher, et le plan
 * se consulte parfois sur un réseau de salon capricieux.
 *
 * Leur grille est celle de Material — 960 unités, origine en haut — d'où le
 * viewBox conservé tel quel et un <svg> imbriqué qui s'en charge. Chaque
 * pictogramme porte donc la sienne, et celui qui vient d'ailleurs — le M du
 * métro — garde celle de son recueil d'origine.
 */
export const PICTOS = {
  wc: { vb: "0 -960 960 960", d: "<path d=\"M220-80v-300h-60v-220q0-33 23.5-56.5T240-680h120q33 0 56.5 23.5T440-600v220h-60v300H220Zm80-640q-33 0-56.5-23.5T220-800q0-33 23.5-56.5T300-880q33 0 56.5 23.5T380-800q0 33-23.5 56.5T300-720ZM600-80v-240H480l102-306q8-26 29.5-40t48.5-14q27 0 48.5 14t29.5 40l102 306H720v240H600Zm60-640q-33 0-56.5-23.5T580-800q0-33 23.5-56.5T660-880q33 0 56.5 23.5T740-800q0 33-23.5 56.5T660-720Z\"/>" },
  /* Une porte de hall est le plus souvent les deux à la fois — on y entre le
     matin, on en ressort le soir — et le visiteur qui la cherche cherche par
     où passer : le battant de Material reçoit donc une double flèche à la
     place de la sienne. Les salons qui séparent les deux flux gardent les
     deux battants d'origine, une flèche chacun. */
  entree: { vb: "0 -960 960 960", d: "<path d=\"M480-120v-80h280v-560H480v-80h280q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H480Z\"/><path d=\"M600-480 400-280v-160H280v160L80-480l200-200v160h120v-160l200 200Z\"/>" },
  entree_seule: { vb: "0 -960 960 960", d: "<path d=\"M480-120v-80h280v-560H480v-80h280q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H480Zm-80-160-55-58 102-102H120v-80h327L345-622l55-58 200 200-200 200Z\"/>" },
  sortie: { vb: "0 -960 960 960", d: "<path d=\"M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z\"/>" },
  accueil: { vb: "0 -960 960 960", d: "<path d=\"M440-120v-80h320v-284q0-117-81.5-198.5T480-764q-117 0-198.5 81.5T200-484v244h-40q-33 0-56.5-23.5T80-320v-80q0-21 10.5-39.5T120-469l3-53q8-68 39.5-126t79-101q47.5-43 109-67T480-840q68 0 129 24t109 66.5Q766-707 797-649t40 126l3 52q19 9 29.5 27t10.5 38v92q0 20-10.5 38T840-249v49q0 33-23.5 56.5T760-120H440Zm-80-280q-17 0-28.5-11.5T320-440q0-17 11.5-28.5T360-480q17 0 28.5 11.5T400-440q0 17-11.5 28.5T360-400Zm240 0q-17 0-28.5-11.5T560-440q0-17 11.5-28.5T600-480q17 0 28.5 11.5T640-440q0 17-11.5 28.5T600-400Zm-359-62q-7-106 64-182t177-76q89 0 156.5 56.5T720-519q-91-1-167.5-49T435-698q-16 80-67.5 142.5T241-462Z\"/>" },
  info: { vb: "0 -960 960 960", d: "<path d=\"M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z\"/>" },
  restauration: { vb: "0 -960 960 960", d: "<path d=\"M280-80v-366q-51-14-85.5-56T160-600v-280h80v280h40v-280h80v280h40v-280h80v280q0 56-34.5 98T360-446v366h-80Zm400 0v-320H560v-280q0-83 58.5-141.5T760-880v800h-80Z\"/>" },
  cafe: { vb: "0 -960 960 960", d: "<path d=\"M160-120v-80h640v80H160Zm160-160q-66 0-113-47t-47-113v-400h640q33 0 56.5 23.5T880-760v120q0 33-23.5 56.5T800-560h-80v120q0 66-47 113t-113 47H320Zm0-80h240q33 0 56.5-23.5T640-440v-320H240v320q0 33 23.5 56.5T320-360Zm400-280h80v-120h-80v120ZM320-360h-80 400-320Z\"/>" },
  vestiaire: { vb: "0 -960 960 960", d: "<path d=\"M120-160q-17 0-28.5-11.5T80-200q0-10 4-18.5T96-232l344-258v-70q0-17 12-28.5t29-11.5q25 0 42-18t17-43q0-25-17.5-42T480-720q-25 0-42.5 17.5T420-660h-80q0-58 41-99t99-41q58 0 99 40.5t41 98.5q0 47-27.5 84T520-526v36l344 258q8 5 12 13.5t4 18.5q0 17-11.5 28.5T840-160H120Zm120-80h480L480-420 240-240Z\"/>" },
  ascenseur: { vb: "0 -960 960 960", d: "<path d=\"M280-240h120v-160h40v-100q0-33-23.5-56.5T360-580h-40q-33 0-56.5 23.5T240-500v100h40v160Zm60-380q21 0 35.5-14.5T390-670q0-21-14.5-35.5T340-720q-21 0-35.5 14.5T290-670q0 21 14.5 35.5T340-620Zm180 100h200L620-680 520-520Zm100 240 100-160H520l100 160ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0 0v-560 560Z\"/>" },
  escalier: { vb: "0 -960 960 960", d: "<path d=\"M240-240h177v-133h103v-133h103v-134h97v-80H543v133H440v133H337v134h-97v80Zm-40 120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z\"/>" },
  escalator: { vb: "0 -960 960 960", d: "<path d=\"M280-240h132l200-360h68q25 0 42.5-17.5T740-660q0-25-17.5-42.5T680-720H548L348-360h-68q-25 0-42.5 17.5T220-300q0 25 17.5 42.5T280-240Zm-80 120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z\"/>" },
  secours: { vb: "0 -960 960 960", d: "<path d=\"M160-80q-33 0-56.5-23.5T80-160v-480q0-33 23.5-56.5T160-720h160v-80q0-33 23.5-56.5T400-880h160q33 0 56.5 23.5T640-800v80h160q33 0 56.5 23.5T880-640v480q0 33-23.5 56.5T800-80H160Zm0-80h640v-480H160v480Zm240-560h160v-80H400v80ZM160-160v-480 480Zm280-200v120h80v-120h120v-80H520v-120h-80v120H320v80h120Z\"/>" },
  pmr: { vb: "0 -960 960 960", d: "<path d=\"M480-720q-33 0-56.5-23.5T400-800q0-33 23.5-56.5T480-880q33 0 56.5 23.5T560-800q0 33-23.5 56.5T480-720ZM680-80v-200H480q-33 0-56.5-23.5T400-360v-240q0-33 23.5-56.5T480-680q24 0 41.5 10.5T559-636q55 66 99.5 90.5T760-520v80q-53 0-107-23t-93-55v138h120q33 0 56.5 23.5T760-300v220h-80Zm-280 0q-83 0-141.5-58.5T200-280q0-72 45.5-127T360-476v82q-35 14-57.5 44.5T280-280q0 50 35 85t85 35q39 0 69.5-22.5T514-240h82q-14 69-69 114.5T400-80Z\"/>" },
  parking: { vb: "0 -960 960 960", d: "<path d=\"M240-120v-720h280q100 0 170 70t70 170q0 100-70 170t-170 70H400v240H240Zm160-400h128q33 0 56.5-23.5T608-600q0-33-23.5-56.5T528-680H400v160Z\"/>" },
  distributeur: { vb: "0 -960 960 960", d: "<path d=\"M415-360v-180h-90v-60h240v60h-90v180h-60Zm-335 0v-200q0-17 11.5-28.5T120-600h120q17 0 28.5 11.5T280-560v200h-60v-60h-80v60H80Zm60-120h80v-60h-80v60Zm480 120v-200q0-17 11.5-28.5T660-600h180q17 0 28.5 11.5T880-560v200h-60v-180h-40v140h-60v-140h-40v180h-60Z\"/>" },
  reunion: { vb: "0 -960 960 960", d: "<path d=\"M120-120v-80h80v-640h400v40h160v600h80v80H680v-600h-80v600H120Zm160-640v560-560Zm160 320q17 0 28.5-11.5T480-480q0-17-11.5-28.5T440-520q-17 0-28.5 11.5T400-480q0 17 11.5 28.5T440-440ZM280-200h240v-560H280v560Z\"/>" },
  /* Les transports en commun. Le premier sert le générique — la zone que
     l'exploitant a dite « Transports en commun », le repère dont on n'a pas
     précisé le mode ; les trois autres disent lequel, et c'est à cela qu'un
     visiteur reconnaît de loin ce qui passe là.

     Le métro fait exception au recueil : ce qui annonce une bouche n'est pas
     un wagon vu de face, c'est le M dans son anneau, et c'est lui que le
     visiteur cherche des yeux en sortant du hall. Il vient de Simple Icons,
     qui le verse au domaine public (CC0) — sa grille est celle de ce
     recueil-là, vingt-quatre unités, d'où un « vb » qui n'est pas celui des
     autres. Le tram et le bus gardent les silhouettes de Material, faute
     d'une marque équivalente : celle du bus est déjà celle des abris. */
  transport: { vb: "0 -960 960 960", d: "<path d=\"M240-120v-40l60-40q-59 0-99.5-40.5T160-340v-380q0-83 77-121.5T480-880q172 0 246 37t74 123v380q0 59-40.5 99.5T660-200l60 40v40H240Zm0-440h200v-120H240v120Zm420 80H240h480-60Zm-140-80h200v-120H520v120ZM340-320q25 0 42.5-17.5T400-380q0-25-17.5-42.5T340-440q-25 0-42.5 17.5T280-380q0 25 17.5 42.5T340-320Zm280 0q25 0 42.5-17.5T680-380q0-25-17.5-42.5T620-440q-25 0-42.5 17.5T560-380q0 25 17.5 42.5T620-320Zm-320 40h360q26 0 43-17t17-43v-140H240v140q0 26 17 43t43 17Zm180-520q-86 0-142.5 10T258-760h448q-18-20-74.5-30T480-800Zm0 40h226-448 222Z\"/>" },
  bus: { vb: "0 -960 960 960", d: "<path d=\"M240-120q-17 0-28.5-11.5T200-160v-82q-18-20-29-44.5T160-340v-380q0-83 77-121.5T480-880q172 0 246 37t74 123v380q0 29-11 53.5T760-242v82q0 17-11.5 28.5T720-120h-40q-17 0-28.5-11.5T640-160v-40H320v40q0 17-11.5 28.5T280-120h-40Zm242-640h224-448 224Zm158 280H240h480-80Zm-400-80h480v-120H240v120Zm100 240q25 0 42.5-17.5T400-380q0-25-17.5-42.5T340-440q-25 0-42.5 17.5T280-380q0 25 17.5 42.5T340-320Zm280 0q25 0 42.5-17.5T680-380q0-25-17.5-42.5T620-440q-25 0-42.5 17.5T560-380q0 25 17.5 42.5T620-320ZM258-760h448q-15-17-64.5-28.5T482-800q-107 0-156.5 12.5T258-760Zm62 480h320q33 0 56.5-23.5T720-360v-120H240v120q0 33 23.5 56.5T320-280Z\"/>" },
  metro: { vb: "0 0 24 24", d: "<path d=\"M17.708 18.099c-.202.152-.44.228-.714.228-.242 0-.471-.076-.688-.228-.218-.152-.327-.373-.327-.66V9.626h-.023l-2.984 6.057a1.453 1.453 0 0 1-.385.505c-.145.112-.337.168-.578.168-.24 0-.433-.056-.577-.168a1.442 1.442 0 0 1-.385-.505L8.063 9.627H8.04v7.811a.748.748 0 0 1-.339.66 1.23 1.23 0 0 1-.7.229c-.275 0-.508-.076-.702-.228-.193-.152-.29-.373-.29-.66V6.958c0-.304.096-.589.29-.853.192-.264.537-.396 1.036-.396.37 0 .655.084.856.252.2.169.38.421.542.757l3.277 6.754h.024l3.253-6.754c.16-.336.342-.588.543-.757.2-.168.485-.252.855-.252.498 0 .844.132 1.036.396.193.265.29.55.29.854v10.478c0 .288-.101.509-.302.66zm-5.732 4.156c5.658 0 10.279-4.64 10.279-10.327 0-5.62-4.603-10.183-10.279-10.183-5.674 0-10.23 4.536-10.23 10.183 0 5.59 4.715 10.327 10.23 10.327zm0 1.745C5.495 24 0 18.48 0 11.928 0 5.315 5.34 0 11.976 0 18.613 0 24 5.34 24 11.928 24 18.577 18.6 24 11.976 24Z\"/>" },
  tram: { vb: "0 -960 960 960", d: "<path d=\"M160-260v-380q0-97 85-127t195-33l30-60H280v-60h400v60H550l-30 60q119 3 199.5 32.5T800-640v380q0 59-40.5 99.5T660-120l60 60v20h-80l-80-80H400l-80 80h-80v-20l60-60q-59 0-99.5-40.5T160-260Zm500-140H240h480-60ZM480-240q25 0 42.5-17.5T540-300q0-25-17.5-42.5T480-360q-25 0-42.5 17.5T420-300q0 25 17.5 42.5T480-240Zm-2-440h228-450 222ZM240-480h480v-120H240v120Zm60 280h360q26 0 43-17t17-43v-140H240v140q0 26 17 43t43 17Zm178-520q-134 0-172 14.5T256-680h450q-12-14-52-27t-176-13Z\"/>" },
};

/* Les libellés qui déclenchent un pictogramme. Un libellé libre reste
   possible : il donne alors une pastille de texte. */
const PICTO_MOTS = {
  "wc": "wc",
  "toilettes": "wc",
  "sanitaires": "wc",
  "entrée": "entree",
  "entree": "entree",
  "accès": "entree",
  "acces": "entree",
  "sortie": "entree",
  "issue": "entree",
  "entrée/sortie": "entree",
  "entree/sortie": "entree",
  "accueil": "accueil",
  "réception": "accueil",
  "reception": "accueil",
  "information": "info",
  "informations": "info",
  "info": "info",
  "restauration": "restauration",
  "restaurant": "restauration",
  "café": "cafe",
  "cafe": "cafe",
  "bar": "cafe",
  "vestiaire": "vestiaire",
  "consigne": "vestiaire",
  "ascenseur": "ascenseur",
  "escalier": "escalier",
  "escaliers": "escalier",
  "escalator": "escalator",
  "escalier mécanique": "escalator",
  "escalier mecanique": "escalator",
  "secours": "secours",
  "infirmerie": "secours",
  "premiers secours": "secours",
  "pmr": "pmr",
  "accessibilité": "pmr",
  "accessibilite": "pmr",
  "accessible": "pmr",
  "parking": "parking",
  "stationnement": "parking",
  "distributeur": "distributeur",
  "dab": "distributeur",
  "salle de réunion": "reunion",
  "salle de reunion": "reunion",
  "réunion": "reunion",
  "reunion": "reunion",
  "transports en commun": "transport",
  "transports": "transport",
  "bus": "bus",
  "arrêt de bus": "bus",
  "arret de bus": "bus",
  "métro": "metro",
  "metro": "metro",
  "tram": "tram",
  "tramway": "tram",
};

/** Le pictogramme que suggère un libellé, s'il en existe un. */
const pictoDe = (txt) => PICTO_MOTS[String(txt || "").trim().toLowerCase()] || null;

/**
 * Ce qu'un repère est, et ce qu'il s'appelle.
 *
 * Les deux se confondaient : le pictogramme était deviné depuis le libellé, si
 * bien qu'un repère nommé « Entrée Nord » n'était plus une entrée — ni pour le
 * dessin, ni pour l'itinéraire, ni pour la liste des départs. Un hall qui
 * nomme ses portes perdait donc ce qui les rendait utiles, et il n'y avait pas
 * moyen de nommer deux escaliers sans les déclasser tous les deux.
 *
 * Le type et le libellé sont donc deux choses. Le type porte les propriétés —
 * le pictogramme, l'obstacle en fauteuil, la qualité de porte par où passe un
 * trajet entre pavillons — et se choisit dans une liste. Le libellé ne sert
 * qu'à distinguer un exemplaire d'un autre, et s'écrit librement.
 *
 * Un repère posé avant cette séparation n'a que son libellé : on continue de
 * le deviner pour lui, et son plan s'affiche comme il le faisait. Le type
 * s'écrit dès qu'on y touche.
 *
 * La liste se lit dans l'ordre alphabétique : dix-sept lignes se parcourent à
 * l'œil, et c'est le seul ordre où l'on sait d'avance où regarder. Le tri est
 * fait ici plutôt que laissé à la main, pour qu'un type de plus se range de
 * lui-même. « Sans pictogramme » reste en tête, hors du tri : ce n'est pas un
 * type mais l'absence de choix, et c'est là que `nomTypeRepere` se replie.
 */
export const TYPES_REPERE = [{ v: "", nom: "Sans pictogramme" }].concat([
  { v: "pmr",          nom: "Accessibilité" },
  { v: "accueil",      nom: "Accueil" },
  { v: "ascenseur",    nom: "Ascenseur" },
  { v: "cafe",         nom: "Café" },
  { v: "distributeur", nom: "Distributeur" },
  { v: "entree_seule", nom: "Entrée" },
  { v: "entree",       nom: "Entrée/Sortie" },
  { v: "escalator",    nom: "Escalator" },
  { v: "escalier",     nom: "Escalier" },
  { v: "info",         nom: "Information" },
  { v: "parking",      nom: "Parking" },
  { v: "restauration", nom: "Restauration" },
  { v: "reunion",      nom: "Salle de réunion" },
  { v: "secours",      nom: "Secours" },
  { v: "sortie",       nom: "Sortie" },
  { v: "transport",    nom: "Transports en commun" },
  { v: "vestiaire",    nom: "Vestiaire" },
  { v: "wc",           nom: "WC" },
].sort((a, b) => a.nom.localeCompare(b.nom, "fr")));
/* Le nom d'un type vit sous deux formes. En français, il sert de libellé
   enregistré — un repère posé sans libellé prend celui de son type — et doit le
   rester quelle que soit la langue de l'écran : posé depuis la version
   anglaise, il ne s'appellerait pas « Toilets » chez les visiteurs français.
   Dans la langue de l'écran, il est ce qu'on lit, qu'on mesure et qu'on tape :
   le libellé taillé à sa largeur, la recherche, le champ de l'itinéraire.

   Les modes de transport, plus bas, se nomment de la même façon : le
   pictogramme d'un arrêt est celui de son mode, et c'est « Métro » qu'il faut
   lire sous la pastille, non le type qui l'a posé. */
const nomTypeRepereFr = (v) => (TYPES_REPERE.find(t => t.v === v) ||
  MODES_TRANSPORT.find(m => m.v === v) || TYPES_REPERE[0]).nom;
export const nomTypeRepere = (v) => traduit(nomTypeRepereFr(v));

/**
 * Ce qu'une zone organisateur est, quand elle est quelque chose de connu.
 *
 * Un visiteur qui cherche où déjeuner, où déposer son manteau ou où se tient
 * la prochaine conférence ne cherche pas un nom : il cherche une fonction. La
 * source n'en dit rien — une zone n'a qu'un contour et parfois un intitulé,
 * « Atmosphère Mobilité » ou « LA SERRE », d'où l'on ne devine pas ce qu'on y
 * fait — et c'est l'exploitant qui la donne, zone par zone, depuis sa fiche.
 *
 * Le type ne change rien au dessin du plan : il ouvre l'entrée du cartouche
 * des points d'intérêt, d'où l'on retrouve d'un geste toutes les zones qui le
 * portent. Ce sont donc les pictogrammes des repères qui le figurent — un
 * visiteur ne distingue pas ce que l'exploitant a dessiné de ce que le salon a
 * fourni, et n'a aucune raison de le faire.
 */
export const TYPES_ZONE = [
  { v: "",             nom: "Sans type" },
  { v: "restauration", nom: "Restauration", picto: "restauration" },
  { v: "conferences",  nom: "Conférences",  picto: "reunion" },
  { v: "vestiaire",    nom: "Vestiaire",    picto: "vestiaire" },
  { v: "accueil",      nom: "Accueil",      picto: "accueil" },
  /* Une gare routière, un parvis de tramway : ce que le salon a dessiné comme
     une zone et qui est, pour le visiteur qui repart, la même chose qu'un
     arrêt. Le pictogramme est le générique — une zone n'a pas de ligne. */
  { v: "transport",    nom: "Transports en commun", picto: "transport" },
];

/** Le type d'une zone, s'il lui en a été donné un. */
export const typeZone = (z) => TYPES_ZONE.find(t => t.v && z && t.v === z.type) || null;

/**
 * Le type d'un repère : celui qu'on lui a donné, ou celui que son libellé
 * laisse deviner s'il est d'avant la séparation. Une chaîne vide est un choix
 * — « sans pictogramme » — et non une absence : elle ne se redevine pas.
 */
export function pictoForme(f){
  return f.picto === undefined ? pictoDe(f.txt) : f.picto;
}

/**
 * Les trois portes, et ce qu'on en fait.
 *
 * Une porte de hall sert le plus souvent dans les deux sens, et c'est
 * « Entrée/Sortie » qui la dit. Certains salons séparent pourtant les flux —
 * on entre par le parvis, on ressort côté parking — et le trajet qui l'ignore
 * fait sortir le visiteur par où personne ne sort. D'où les deux types à sens
 * unique, et ces trois lectures : ce qui est une porte, ce par quoi on entre,
 * ce par quoi on sort.
 *
 * Un libellé, lui, ne dit jamais le sens : « Sortie » sur un repère d'avant
 * les types reste une porte des deux côtés, faute de savoir si l'on y entre.
 * Seul le type choisi dans la liste tranche — y compris celui d'un repère
 * désigné « Sortie » avant la fusion des deux pictogrammes, qui retrouve ici
 * ce que l'exploitant en avait dit.
 */
export const estPorte     = (p) => p === "entree" || p === "entree_seule" || p === "sortie";
export const ouvreEntrant = (p) => p === "entree" || p === "entree_seule";
export const ouvreSortant = (p) => p === "entree" || p === "sortie";

/* ------------------------------------------------------------
   Les transports en commun
   ------------------------------------------------------------
   Un arrêt n'est pas un repère comme les autres : ce que le visiteur cherche
   n'est pas « un transport », c'est sa ligne — le 12, le T3a, le 80. Le type
   dit donc seulement qu'il s'agit d'un transport ; deux précisions le
   complètent, et elles ne valent que pour lui.

   Le mode — bus, métro, tram — décide du pictogramme : c'est celui que la
   signalétique pose au-dessus de la bouche ou de l'abri, et celui qu'on
   reconnaît de loin sans lire. La ligne nomme l'arrêt et lui donne sa
   couleur : un visiteur ne cherche pas « le métro », il cherche le 12, et
   c'est au vert du 12 qu'il le trouve.
   ------------------------------------------------------------ */

/* Les modes, dans l'ordre où on les rencontre en sortant d'un hall. La valeur
   est aussi la clé du pictogramme : les deux ne se séparent jamais, et un
   mode de plus n'a qu'un dessin à ajouter au recueil. */
export const MODES_TRANSPORT = [
  { v: "bus",   nom: "Bus" },
  /* L'initiale sert à reconnaître une ligne écrite de deux façons : « M4 » et
     « 4 » sont la même, « T3a » et « 3a » aussi. Celle du métro est de plus
     dans son symbole — l'anneau porte son M — et n'a donc pas à se réécrire à
     côté ; celle du tram fait partie du nom de la ligne, que la signalétique
     écrit « T3a », et le pictogramme ne la dit pas. */
  /* Le métro ne pose pas davantage sa couleur en aplat : la signalétique
     donne son anneau à la couleur de la ligne, sur champ clair, et range
     l'indice dans une pastille pleine de cette même couleur — le M vert, et
     le 12 dans son rond vert. Ce n'est pas la couleur qui s'en va, c'est
     l'aplat : elle passe au symbole, où elle se lit aussi bien. */
  { v: "metro", nom: "Métro", lettre: "m", dansLeSymbole: true, anneau: true },
  /* Le tram porte sa couleur autrement que les deux autres. La signalétique
     n'en fait pas un aplat : elle encadre l'indice de deux barres, sur champ
     clair — c'est ainsi que « T3a » s'écrit sur le quai, et c'est à ces deux
     traits qu'on le reconnaît avant d'avoir lu le numéro. */
  { v: "tram",  nom: "Tram",  lettre: "t", plaque: true },
];

export const modeDit = (mode) => MODES_TRANSPORT.find(m => m.v === mode) ||
  /** @type {Partial<typeof MODES_TRANSPORT[number]>} */ ({});
const lettreMode = (mode) => modeDit(mode).lettre || "";

/** Ce repère est-il un arrêt ? Le type le dit, et lui seul : un repère nommé
 *  « Métro » d'avant les types reste ce que son libellé en a fait. */
export const estTransport = (f) => pictoForme(f) === "transport";

/** Le mode d'un arrêt, s'il a été dit. */
export const modeTransport = (f) => MODES_TRANSPORT.find(m => m.v === (f && f.mode)) || null;


/**
 * Le pictogramme d'un repère : celui de son type, ou celui de son mode quand
 * le type est un transport. C'est le seul endroit où les deux se rejoignent —
 * partout ailleurs `pictoForme` dit le type, et lui seul, parce que c'est le
 * type qui ouvre l'entrée du cartouche et qui se cherche à la frappe.
 *
 * Un arrêt dont personne n'a dit le mode garde le pictogramme générique : il
 * vaut mieux un transport sans précision qu'un bus qui n'en est pas un.
 */
export const glypheRepere = (f) => estTransport(f)
  ? ((modeTransport(f) || {}).v || "transport") : pictoForme(f);

/**
 * Les couleurs des lignes, telles que la signalétique les porte.
 *
 * Une ligne n'a pas de couleur en propre : elle a celle que son réseau lui
 * donne, et le 1 qui est jaune à Paris est bleu à Marseille. La table est donc
 * celle d'un réseau — l'Île-de-France, où se tiennent les salons qui nous
 * occupent — et elle ne prétend pas à davantage. Ailleurs, et pour une ligne
 * ouverte depuis, la couleur se règle à la main : l'exploitant a la
 * signalétique sous les yeux, ce que cette table n'aura jamais.
 *
 * Le bus n'y figure pas, et ce n'est pas un oubli : la signalétique ne donne
 * pas une couleur à chaque ligne de bus, elle en donne une au réseau entier.
 * Un arrêt de bus garde donc la couleur de son calque, à moins qu'on ne lui
 * en pose une.
 */
const COULEURS_LIGNE = {
  metro: {
    "1": "#FFCD00", "2": "#003CA6", "3": "#837902", "3bis": "#6EC4E8",
    "4": "#CF009E", "5": "#FF7E2E", "6": "#6ECA97", "7": "#FA9ABA",
    "7bis": "#6ECA97", "8": "#E19BDF", "9": "#B6BD00", "10": "#C9910D",
    "11": "#704B1C", "12": "#007852", "13": "#6EC4E8", "14": "#62259D",
  },
  tram: {
    "1": "#0064B0", "2": "#CF009E", "3a": "#FF7E2E", "3b": "#00814F",
    "4": "#FFBE00", "5": "#662483", "6": "#E3051C", "7": "#84329B",
    "8": "#837902",
  },
};

/* « T3a », « t 3A », « ligne 3 bis » nomment la même ligne : la clé ne garde
   que ce qui la distingue. L'initiale du mode tombe avec les espaces et les
   tirets — un tram appelé « T1 » est la ligne 1 de son réseau — mais jamais
   seule, sans quoi une ligne qui ne s'appelle que « T » deviendrait un numéro
   vide, et prendrait la couleur de la première venue. */
function cleLigne(mode, ligne){
  const s = String(ligne || "").toLowerCase().replace(/[^a-z0-9]/g, "")
    .replace(/^(?:ligne|line)/, "");
  const i = lettreMode(mode);
  return i && s.length > 1 && s[0] === i ? s.slice(1) : s;
}

/** Le numéro tel qu'il s'écrit à côté du symbole : « M4 » s'y lirait deux
 *  fois, et devient « 4 ». Ce que le symbole ne dit pas reste tel que
 *  l'exploitant l'a tapé — « T3a » garde son T, « 3 bis » son espace, qui sont
 *  la façon dont ces lignes s'écrivent. */
export const ligneAffichee = (mode, ligne) => {
  const s = String(ligne || "").trim();
  const m = modeDit(mode);
  return m.dansLeSymbole && s.length > 1 && s[0].toLowerCase() === m.lettre &&
         /[0-9]/.test(s[1]) ? s.slice(1).trim() : s;
};

/** La couleur que la signalétique donne à cette ligne, quand on la connaît. */
export const couleurLigne = (mode, ligne) =>
  (COULEURS_LIGNE[mode] || {})[cleLigne(mode, ligne)] || null;

/** La couleur d'un arrêt : celle que l'exploitant a posée, celle de sa ligne à
 *  défaut. Rien si les deux manquent — la pastille reprend alors la couleur de
 *  son calque, comme tout repère. */
export const couleurRepere = (f) => !estTransport(f) ? null
  : (trio(f.couleur) ? f.couleur : couleurLigne(f.mode, f.ligne));

/** L'encre qui se lit sur une couleur : du blanc sur le vert du 12, du noir
 *  sur le jaune du 1 — la signalétique en décide ainsi, et pour la même
 *  raison. */
export const encreRepere = (c) => {
  const v = trio(c);
  return v && luminance(v) > 0.42 ? "#0E1113" : "#FFFFFF";
};

/**
 * Le nom d'un arrêt : « Métro 12 », « Bus 80 ».
 *
 * En français, parce que c'est le libellé qui s'enregistre, et qu'il doit le
 * rester quelle que soit la langue de l'écran — posé depuis la version
 * anglaise, il ne s'appellerait pas « Metro 12 » chez les visiteurs français.
 * Sans ligne, il ne reste que le mode, ce qui est encore quelque chose : on
 * sait qu'un tram passe là.
 */
const nomLigneFr = (mode, ligne) => [
  modeDit(mode).nom || nomTypeRepereFr("transport"),
  String(ligne || "").trim(),
].filter(Boolean).join(" ");

/** Le libellé qu'un repère prend quand on ne lui en donne pas : le nom de son
 *  type, ou celui de sa ligne quand c'est un arrêt — « Métro 12 » dit plus
 *  que « Transports en commun », et c'est ce qu'on cherche à la frappe. */
export const libelleDoffice = (type, mode, ligne) => type === "transport"
  ? nomLigneFr(mode, ligne) : (type ? nomTypeRepereFr(type) : "");

/** La couleur qu'il vaut la peine d'écrire sur l'arrêt : celle qui dit quelque
 *  chose de plus que la table des lignes et que le calque. Écrire les deux
 *  autres les figerait — une table corrigée ne rattraperait plus rien, et un
 *  calque repeint laisserait ses arrêts derrière lui. */
export function couleurEcrite(mode, ligne, choisie, calque){
  const c = String(choisie || "").toLowerCase();
  const dejaDit = [couleurLigne(mode, ligne), calque && calque.couleur]
    .filter(Boolean).map(x => String(x).toLowerCase());
  return c && !dejaDit.includes(c) ? choisie : "";
}

/* Ce qui, au cartouche, est un transport : le pictogramme le dit mieux que le
   type, car un repère d'avant les types nommé « Métro » n'a jamais eu que
   celui-là — et le visiteur ne fait pas la différence. */
const PICTOS_TRANSPORT = new Set(["transport"].concat(MODES_TRANSPORT.map(m => m.v)));

/** La nature sous laquelle une chose entre au cartouche : son libellé et son
 *  pictogramme, sauf pour un transport — arrêts et gares n'en font qu'une. */
export const pastillePoi = (nom, picto) => PICTOS_TRANSPORT.has(picto)
  ? { nom: "Transports", picto: "transport" }
  : { nom: nom, picto: picto || "" };
