/* ============================================================
   La police des noms sur le plan — celle du modèle, ou une autre de la liste

   Sortie de `_admin1.html`. Le plan public la pose à chaque chargement, et
   l'onglet « Apparence » de l'exploitant (`volets.mjs`) y choisit. La
   graisse et la police dans lesquelles le plan écrit ses libellés, `P_NOM`
   et `P_CODE`, vivent ici : le code soudé les lit par accesseur pour mesurer
   ses noms, et seul `posePoliceLibelles` les remplace. Ce qu'il faut retracer
   quand elles changent — les dessins, les libellés, la liste — lui est
   confié par `branchePolices`, à la place que ce code tenait.

   `npm run polices` et la construction relisent `POLICES_NOMS` dans ce
   fichier, sous sa forme exacte (`policesAuChoix`, dans outils/polices.js).
   ============================================================ */
import { CONF } from "./configuration.mjs";
import { modeleRetenu } from "./modeles.mjs";

/* Ce que le code soudé confie : le plan monté ou non (`rendu.mjs` `MONTE`),
   par un lecteur, et ce qui se retrace — les dessins (`dessin.mjs`), les
   libellés (`libelles.mjs`), la liste (`recherche.mjs`). Les deux modules
   importent celui-ci pour la police des noms et des numéros, et le montage
   (`rendu.mjs`) l'embarque en chemin : aucun ne peut s'importer d'ici. */
/** @type {Record<string, any>} */
let soude = { monte: () => false };

/**
 * Le branchement, appelé par `_admin1.html` à la place que ce code tenait.
 *
 * @param {{ monte: () => boolean, dessineDessins: () => void, libelles: () => void,
 *   liste: () => void }} b
 */
export function branchePolices(b){
  soude = b;
}

const racine = document.documentElement;

/* La graisse et la police dans lesquelles le plan écrit ses libellés : le nom
   de l'enseigne, le numéro de l'emplacement. Elles ne sont pas figées — le
   modèle d'habillage les remplace, et `posePoliceLibelles` les repose. Ce
   sont celles-là qu'il faut mesurer, jamais celles d'origine : un nom taillé
   sur une chasse fixe déborde d'un serif, et se perd au milieu d'un stand
   qu'il devait remplir. */
export let P_NOM = ["600", '"Instrument Sans", "Segoe UI", system-ui, sans-serif'];
export let P_CODE = ["500", '"IBM Plex Mono", monospace'];

/* La police des libellés du plan, modèle par modèle.

   Un modèle est un accord typographique, et le plan en fait partie : un salon
   habillé en « Kraft » gardait ses enseignes composées en grotesque au milieu
   de son carton, et le « Magazine » son sommaire en serif à côté d'un plan
   qui n'en avait rien. Chaque ligne reprend donc la police que le modèle pose
   déjà sur le nom et sur le numéro de ses lignes de liste — celui du plan est
   le même nom, écrit sur la cloison plutôt que dans la marge.

   Les onze sont nommés, y compris ceux qui gardent le rendu d'origine : c'est
   la table qu'on relit pour vérifier qu'un modèle dit la même chose des deux
   côtés, et un modèle absent s'y verrait comme un oubli plutôt que comme un
   choix. */
const P_SANS = '"Instrument Sans", "Segoe UI", system-ui, sans-serif',
      P_CHASSE = '"IBM Plex Mono", monospace',
      P_GROTESQUE = '"Archivo", sans-serif', P_SERIF = '"Fraunces", Georgia, serif',
      P_MACHINE = '"Courier Prime", monospace';
const POLICES_LIBELLE = {
  sobre:    { nom: ["600", P_SANS],      code: ["500", P_CHASSE] },
  grille:   { nom: ["600", P_GROTESQUE], code: ["600", P_CHASSE] },
  console:  { nom: ["500", P_CHASSE],    code: ["500", P_CHASSE] },
  billet:   { nom: ["600", P_SANS],      code: ["600", P_CHASSE] },
  magazine: { nom: ["600", P_SERIF],     code: ["600", P_SERIF] },
  brut:     { nom: ["700", P_SANS],      code: ["700", P_CHASSE] },
  verre:    { nom: ["600", P_SANS],      code: ["500", P_CHASSE] },
  kraft:    { nom: ["700", P_MACHINE],   code: ["700", P_MACHINE] },
  signal:   { nom: ["700", P_SANS],      code: ["600", P_CHASSE] },
  chrono:   { nom: ["600", P_SANS],      code: ["500", P_CHASSE] },
  nu:       { nom: ["600", P_SANS],      code: ["500", P_CHASSE] },
};

/* Les polices qu'on peut préférer à celle du modèle, pour les noms du plan.

   Le modèle décide d'abord, et en choisir un repose la sienne. Mais un salon
   a souvent sa propre police — celle de sa charte, de ses kakémonos, de la
   signalétique qu'on croise dans les allées — et un plan qui écrit les
   enseignes dans une autre se lit comme une pièce rapportée. Le choix ne vaut
   que pour les noms, des stands comme des zones : le numéro garde la chasse du
   modèle, où les chiffres s'alignent d'un stand à l'autre.

   Une liste plutôt qu'un nom saisi : chaque police est rapatriée de Google une
   fois pour toutes par `npm run polices`, qui relit cette liste, et Google
   répond en erreur à une famille qu'il ne sert pas sous la graisse demandée —
   Lato n'a pas de 600. Chaque ligne porte donc une graisse qu'on sait servie,
   retenue pour se lire petit sur une cloison. Une ligne ajoutée ici fait
   échouer la construction tant que le script n'a pas été relancé.

   Les cinq polices des modèles sont déjà déclarées par l'en-tête de la page, et
   se reconnaissent à la pile qu'elles partagent avec POLICES_LIBELLE — c'est
   par elle que l'onglet sait laquelle est celle du modèle. Les autres ne se
   chargent qu'au besoin, depuis `polices/` : chez le visiteur, la seule de son
   salon ; chez l'exploitant, celles du genre qu'il parcourt.

   Rangées par genre, et par nom dans chacun : soixante polices ne se
   parcourent pas d'un seul tenant, et c'est d'abord une allure qu'on cherche —
   une étroite pour des enseignes longues, une manuscrite pour un salon des
   vins —, puis un nom dans cette allure. Les genres vont du plus sûr sur une
   cloison au plus singulier. Le repli ne sert qu'aux vignettes, le temps que
   leur police arrive : le plan, lui, n'écrit jamais dans une police absente.

   La table garde une ligne par police, son genre écrit dedans, plutôt qu'une
   liste sous chaque genre : `npm run polices` et la construction la relisent
   sous cette forme exacte (`policesAuChoix`, dans outils/polices.js). */
export const GENRES_POLICE = [
  { cle: "sans", nom: "Sans serif", repli: "sans-serif" },
  { cle: "etroite", nom: "Étroites", repli: "sans-serif" },
  { cle: "serif", nom: "Serif", repli: "Georgia, serif" },
  { cle: "arrondie", nom: "Arrondies", repli: "sans-serif" },
  { cle: "lisible", nom: "Haute lisibilité", repli: "sans-serif" },
  { cle: "affiche", nom: "Affiche", repli: "sans-serif" },
  { cle: "manuscrite", nom: "Manuscrites", repli: "cursive" },
  { cle: "chasse", nom: "Chasse fixe", repli: "monospace" },
];
export const POLICES_NOMS = [
  ["Archivo", "600", "sans", P_GROTESQUE],
  ["Barlow", "600", "sans"],
  ["DM Sans", "600", "sans"],
  ["Fira Sans", "600", "sans"],
  ["IBM Plex Sans", "600", "sans"],
  ["Instrument Sans", "600", "sans", P_SANS],
  ["Inter", "600", "sans"],
  ["Jost", "600", "sans"],
  ["Lato", "700", "sans"],
  ["Manrope", "600", "sans"],
  ["Montserrat", "600", "sans"],
  ["Noto Sans", "600", "sans"],
  ["Open Sans", "600", "sans"],
  ["Plus Jakarta Sans", "600", "sans"],
  ["Poppins", "600", "sans"],
  ["Raleway", "600", "sans"],
  ["Roboto", "600", "sans"],
  ["Source Sans 3", "600", "sans"],
  ["Space Grotesk", "600", "sans"],
  ["Work Sans", "600", "sans"],

  ["Anton", "400", "etroite"],
  ["Archivo Narrow", "600", "etroite"],
  ["Barlow Condensed", "600", "etroite"],
  ["Bebas Neue", "400", "etroite"],
  ["Fira Sans Condensed", "600", "etroite"],
  ["Oswald", "500", "etroite"],
  ["PT Sans Narrow", "700", "etroite"],
  ["Roboto Condensed", "600", "etroite"],

  ["Bitter", "600", "serif"],
  ["Cormorant Garamond", "600", "serif"],
  ["EB Garamond", "600", "serif"],
  ["Fraunces", "600", "serif", P_SERIF],
  ["Libre Baskerville", "700", "serif"],
  ["Lora", "600", "serif"],
  ["Merriweather", "700", "serif"],
  ["Playfair Display", "600", "serif"],
  ["PT Serif", "700", "serif"],
  ["Roboto Slab", "600", "serif"],
  ["Source Serif 4", "600", "serif"],

  ["Comfortaa", "700", "arrondie"],
  ["Fredoka", "600", "arrondie"],
  ["Nunito", "700", "arrondie"],
  ["Quicksand", "700", "arrondie"],
  ["Varela Round", "400", "arrondie"],

  ["Andika", "700", "lisible"],
  ["Atkinson Hyperlegible Next", "600", "lisible"],
  ["Lexend", "500", "lisible"],

  ["Abril Fatface", "400", "affiche"],
  ["Alfa Slab One", "400", "affiche"],
  ["Archivo Black", "400", "affiche"],
  ["Bungee", "400", "affiche"],
  ["Righteous", "400", "affiche"],

  ["Caveat", "600", "manuscrite"],
  ["Dancing Script", "600", "manuscrite"],
  ["Kalam", "700", "manuscrite"],
  ["Patrick Hand", "400", "manuscrite"],

  ["Courier Prime", "700", "chasse", P_MACHINE],
  ["IBM Plex Mono", "500", "chasse", P_CHASSE],
  ["Inconsolata", "600", "chasse"],
  ["JetBrains Mono", "600", "chasse"],
  ["Roboto Mono", "600", "chasse"],
  ["Space Mono", "700", "chasse"],
].map(([nom, graisse, genre, pile]) => ({
  nom, graisse, genre,
  // sans pile écrite, la police ne se demande qu'au besoin, à `polices/`
  distante: !pile,
  pile: pile || '"' + nom + '", ' + GENRES_POLICE.find(g => g.cle === genre).repli,
}));

/** La police que l'exploitant a préférée pour les noms, s'il en a retenu une. */
export const policeChoisie = () => {
  const n = (CONF["_fiche"] || {}).police;
  return POLICES_NOMS.find(p => p.nom === n) || null;
};
/** La police qu'un modèle pose sur les noms, telle que la liste la connaît. */
export const policeDuModele = (cle) => {
  const pile = (POLICES_LIBELLE[cle] || POLICES_LIBELLE.sobre).nom[1];
  return POLICES_NOMS.find(p => p.pile === pile) || null;
};

/* Une police distante n'est demandée qu'une fois par visite : l'onglet qui les
   montre se rouvre, et l'exploitant qui hésite revient trois fois sur la même.
   La promesse dit si la feuille est arrivée, sans jamais échouer : une police
   qui ne vient pas laisse celle du modèle, ce qui n'a rien d'une erreur. */
const FEUILLES_POLICE = new Map(), FEUILLES_ARRIVEES = new Set();
export function feuillePolice(p){
  if (!p.distante) return Promise.resolve(true);
  if (!FEUILLES_POLICE.has(p.nom)) FEUILLES_POLICE.set(p.nom, new Promise(ok => {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    /* La feuille de la famille, rangée à côté de la page par `npm run polices`.
       La demander à Google transmettrait à celui-ci l'adresse de chaque
       visiteur du salon — et la construction le refuse. */
    l.href = "polices/" + p.nom.toLowerCase().replace(/[^a-z0-9]+/g, "-") + ".css";
    l.onload = () => { FEUILLES_ARRIVEES.add(p.nom); ok(true); };
    l.onerror = () => ok(false);
    document.head.appendChild(l);
  }));
  return FEUILLES_POLICE.get(p.nom);
}

/* La feuille ne suffit pas : elle déclare la police, le fichier ne part qu'au
   premier texte qui s'en sert. Le plan, lui, mesure avant d'écrire — dans une
   police absente, le canevas prend celle de repli, et les noms se tailleraient
   pour une autre que celle où ils s'affichent. On attend donc le fichier, et
   les polices prêtes se retiennent pour que la question ne se repose plus. */
const POLICES_PRETES = new Set(), CHARGEMENTS_POLICE = new Map();
function chargePolice(p){
  if (!CHARGEMENTS_POLICE.has(p.nom)) CHARGEMENTS_POLICE.set(p.nom, feuillePolice(p)
    .then(arrivee => !arrivee ? false : !document.fonts ? true :
      document.fonts.load(p.graisse + " 16px " + p.pile).then(f => f.length > 0))
    .catch(() => false)
    .then(prete => { if (prete) POLICES_PRETES.add(p.nom); return prete; }));
  return CHARGEMENTS_POLICE.get(p.nom);
}

/**
 * La police est-elle déjà là ? Souvent oui, sans rien avoir attendu : la
 * vignette de l'onglet l'a fait venir en s'affichant. Le demander tout de suite
 * épargne au plan, au clic, un aller-retour par la police du modèle le temps
 * d'une promesse — un saut visible, et un tracé de trop.
 *
 * `check` ne se consulte qu'une fois la famille déclarée : pour une famille
 * inconnue du document, Chrome répond qu'elle est prête, puisqu'il n'a rien à
 * charger. D'où la feuille arrivée exigée d'une police distante — celles des
 * modèles sont déclarées par l'en-tête.
 */
function policePrete(p){
  if (POLICES_PRETES.has(p.nom)) return true;
  if (p.distante && !FEUILLES_ARRIVEES.has(p.nom)) return false;
  let prete = !document.fonts;
  try { prete = prete || document.fonts.check(p.graisse + " 16px " + p.pile); } catch (e) {}
  if (prete) POLICES_PRETES.add(p.nom);
  return prete;
}

/**
 * La police des noms : celle que l'exploitant a préférée dès qu'elle est prête,
 * celle du modèle d'ici là — et pour de bon si elle ne vient jamais.
 *
 * Tant qu'elle manque, les noms restent dans la police du modèle, que la page
 * a déjà. Poser l'autre sans l'avoir aurait écrit le plan dans la police de
 * repli, puis l'aurait réécrit à l'arrivée du fichier : deux sauts au lieu
 * d'un, dont le premier vers une police que personne n'a choisie.
 */
function policeDesNoms(duModele){
  const p = policeChoisie();
  if (!p || p.pile === duModele[1]) return duModele;
  if (policePrete(p)) return [p.graisse, p.pile];
  chargePolice(p).then(prete => { if (prete) posePoliceLibelles(modeleRetenu()); });
  return duModele;
}

/**
 * Pose la police du modèle sur les libellés du plan, et sur les noms celle que
 * l'exploitant lui a préférée.
 *
 * Elle s'écrit à deux endroits qui doivent s'accorder : la feuille de style,
 * qui dessine, lit ces variables ; `habille` et `largeur`, qui taillent le
 * nom à la place dont il dispose, mesurent P_NOM et P_CODE. Les séparer
 * donnerait un nom calculé pour une police et rendu dans une autre — plus
 * large que son stand, ou perdu au milieu.
 *
 * Le tracé ne se refait qu'au changement, et qu'une fois le pavillon monté :
 * la fonction est aussi appelée à l'ouverture d'un salon, où elle précède le
 * premier dessin plutôt que d'avoir à le reprendre. Une police préférée qui
 * n'est pas encore là fait exception : elle rappelle la fonction à son arrivée,
 * et le plan se retrace alors une fois. La liste n'est reprise que pour le
 * numéro, parce que sa case se taille sur P_CODE et jamais sur le nom.
 *
 * Les polices se comparent par leur contenu : celle qu'on a préférée est une
 * paire refaite à chaque appel, et comparée par identité elle aurait retracé
 * le plan à chaque changement de pavillon.
 */
export function posePoliceLibelles(cle){
  const p = POLICES_LIBELLE[cle] || POLICES_LIBELLE.sobre;
  const nom = policeDesNoms(p.nom);
  const autre = (a, b) => a[0] !== b[0] || a[1] !== b[1];
  const changeNom = autre(P_NOM, nom), changeCode = autre(P_CODE, p.code);
  P_NOM = nom; P_CODE = p.code;
  racine.style.setProperty("--police-lab-nom", nom[1]);
  racine.style.setProperty("--graisse-lab-nom", nom[0]);
  racine.style.setProperty("--police-lab-code", p.code[1]);
  racine.style.setProperty("--graisse-lab-code", p.code[0]);
  if (!soude.monte() || !(changeNom || changeCode)) return;
  // les repères et les stands tracés à la main portent leur libellé dans leur
  // propre forme : ils se retracent, ils ne se restylent pas
  soude.dessineDessins(); soude.libelles();
  if (changeCode) soude.liste();
}
