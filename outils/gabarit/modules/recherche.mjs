/* ============================================================
   La recherche, la liste et les critères — sans mot-clé ni critère retenu on
   reste sur le pavillon affiché, dès qu'on filtre on balaie les trois

   On ne cherche qu'un exposant. Les zones organisateur — restauration,
   accueil, animations — ne se retiennent pas par leur nom : on les repère
   sur le plan à leur forme et à leur couleur, et le tiroir des calques les
   montre ou les cache. Elles ne paraissent donc plus dans la liste, ni sous
   mot-clé ni sans. Sur le plan, rien ne change : elles gardent leur libellé,
   leur fiche et leur programme.

   Sortis de `_recherche.html` (§ 5) : les critères et leur panneau, le
   retrait du plan, la liste et ses vignettes. Les secteurs vivent dans
   `secteurs.mjs`, les bandes qui défilent dans `bandes.mjs`. L'écran et ce
   que la fiche montre s'importent (`ecran.mjs`, `corps-fiche.mjs`). La fiche
   et la sélection (`fiche.mjs`) ne le peuvent pas : la fiche embarque ce
   module, par le tiroir de l'itinéraire et la borne, et l'importer en retour
   bouclerait. Ce que le code soudé tient encore — la fiche et la sélection,
   les tiroirs, le dessin des
   noms et des distinctions, les repères, le parcours — lui est confié par
   `brancheRecherche`, que `_recherche.html` appelle à la place que ce code
   tenait : l'écoute de la liste s'y pose, au même rang qu'avant. Ce qui se
   déclare plus loin dans le code soudé, ou change sans cesse, vient par des
   détours, lus au moment de s'en servir.
   ============================================================ */
import { $ } from "./dom.mjs";
import { esc, separeValeurs, COLLATION } from "./texte.mjs";
import { DATA, TOUS, parId, HEBERGES, CONFERENCES, PAR_HEBERGE, state, P } from "./donnees.mjs";
import { API, PLAN_ADMIN } from "./salon.mjs";
import { JOURS, momentLocal } from "./temps.mjs";
import { IMAGE_SURE, adresseImage } from "./sur.mjs";
import { marquePrete, recadreMarque } from "./marque.mjs";
import { conf, chercheSorte } from "./configuration.mjs";
import { P_CODE } from "./polices-plan.mjs";
import { secteursMontres, pastilleSecteur, coloreSecteurs } from "./secteurs.mjs";
import { majFondus } from "./bandes.mjs";
import { ETROIT } from "./ecran.mjs";
import { montre } from "./corps-fiche.mjs";

/**
 * Ce que le code soudé confie au branchement.
 * @typedef {object} PageRecherche
 * @property {() => void} ferme referme la fiche (`fiche.mjs`)
 * @property {(id: any, recentrer?: boolean, canal?: string, iSoc?: number) => void} select
 * @property {(id: any, canal?: string) => void} ficheConf
 * @property {(cle: any) => string} adresseVignette
 * @property {() => void} montreTiroir
 * @property {() => void} mesureTiroir
 * @property {() => void} hisseTiroir
 * @property {(hote: HTMLElement) => () => void} poseToutAuParcours
 * @property {() => void} dessineDists
 * @property {() => void} libelles
 * @property {(txt: string, police: any) => number} largeur
 * @property {(porte: (d: any) => boolean) => { avant: string, apres: string, sous: string }} marquesListe
 * @property {(x: any, d: any) => boolean} porteDist
 * @property {(o: any, d: any) => boolean} standPorte
 * @property {(z: any) => string} nomDeLaZone
 * @property {() => any[]} reperesCherchables
 * @property {(id: any, p: number) => void} vaAuRepere
 */
/** @type {PageRecherche} */
let soude;
const ferme = () => soude.ferme();
const select = (/** @type {any} */ id, /** @type {boolean} */ recentrer, /** @type {string} */ canal,
  /** @type {number} */ iSoc) => soude.select(id, recentrer, canal, iSoc);
const ficheConf = (/** @type {any} */ id, /** @type {string} */ canal) => soude.ficheConf(id, canal);
const adresseVignette = (/** @type {any} */ cle) => soude.adresseVignette(cle);
const montreTiroir = () => soude.montreTiroir();
const mesureTiroir = () => soude.mesureTiroir();
const hisseTiroir = () => soude.hisseTiroir();
const poseToutAuParcours = (/** @type {HTMLElement} */ hote) => soude.poseToutAuParcours(hote);
const dessineDists = () => soude.dessineDists();
const libelles = () => soude.libelles();
const largeur = (/** @type {string} */ txt, /** @type {any} */ police) => soude.largeur(txt, police);
const marquesListe = (/** @type {(d: any) => boolean} */ porte) => soude.marquesListe(porte);
const porteDist = (/** @type {any} */ x, /** @type {any} */ d) => soude.porteDist(x, d);
const standPorte = (/** @type {any} */ o, /** @type {any} */ d) => soude.standPorte(o, d);
const nomDeLaZone = (/** @type {any} */ z) => soude.nomDeLaZone(z);
const reperesCherchables = () => soude.reperesCherchables();
const vaAuRepere = (/** @type {any} */ id, /** @type {number} */ p) => soude.vaAuRepere(id, p);

/* Le secteur n'est offert comme critère que là où le plan sectorise et le
   montre : le réglage qui l'éteint doit donc retirer le filtre avec les
   couleurs, et non le laisser retrancher des stands sans que rien ne le dise.
   Un simple changement de couleur, lui, ne rebâtit pas l'index — on le relève
   à chaque glissement du sélecteur. */
let _secteursOfferts = null;

/** Les couleurs du plan et le critère suivent le même réglage. */
export function appliqueSecteurs(){
  coloreSecteurs();
  const offert = secteursMontres();
  if (offert !== _secteursOfferts){ _secteursOfferts = offert; indexeCriteres(); }
}

/**
 * Retenir une seule thématique, celle qu'on vient de lire sur une fiche.
 *
 * C'est l'autre porte d'entrée : de l'exposant vers ses semblables, quand on a
 * trouvé à peu près ce qu'on cherchait et qu'on veut voir le reste. Elle passe
 * par le critère « Thématiques », comme la fenêtre des critères — c'est le même
 * filtre, atteint par un autre chemin.
 *
 * On repart à neuf : mot-clé et autres critères effacés, sinon la liste
 * répondrait à une question qu'on ne pose plus, et paraîtrait vide sans raison.
 */
export function filtreTheme(n){
  if (!themeFiltrable(n)) return;
  state.crit.clear();
  state.crit.set(CLE_THEMES, new Set([n]));
  state.q = ""; state.qn = "";
  if ($("q")) $("q").value = "";
  majVideQ();
  ferme();
  majCriteres();
  reposeRetrait();
  appliqueFiltre();
  // sur téléphone la liste est repliée : le filtre n'aurait rien à montrer
  montreTiroir();
}

/**
 * Ce que la liste retient : une société répond pour elle-même, jamais pour son
 * voisin. Un critère retenu porte, comme un mot-clé, sur tout le salon — un
 * exposant du secteur cherché peut être dans un autre pavillon que celui qu'on
 * regarde — et les deux se cumulent : le mot-clé cherche parmi ce que les
 * critères ont retenu, et non à côté.
 */
/* ------------------------------------------------------------
   Les critères de recherche

   Chercher par mot-clé suppose de savoir quoi taper. Un visiteur qui veut
   « les enseignes de restauration présentes en Auvergne-Rhône-Alpes » ne sait
   pas sous quel intitulé le salon range cela — mais l'exploitant, lui, le
   sait : il désigne depuis la console les champs qui font des critères, et
   c'est de la donnée elle-même que les valeurs proposées sont tirées.

   Rien n'est offert d'office. Un plan qui déplierait douze filtres sur un
   téléphone n'aurait plus de plan : les critères tiennent derrière un seul
   bouton, et ce qui est retenu se relit d'un coup d'œil sous la recherche.
   ------------------------------------------------------------ */
export const PREFIXE_PERSO = "perso:";

/* Ce qu'un critère lit sur une fiche. Les champs propres au salon vivent dans
   « perso » ; les autres sont posés à plat, chacun sous le nom que la
   synchronisation lui donne — ce ne sont pas les mêmes que les cibles de la
   console, d'où cette table. */
const LECTURE_CRITERE = {
  secteur: o => [o.sect],
  ville: o => [o.ville],
  pays: o => [o.pays],
  nomenclature: o => o.nomencl,
  thematiques: o => o.themes,
  // un oui/non n'a qu'une valeur à cocher : le champ lui-même
  nouveau: o => o.neuf ? ["Oui"] : [],
  adherent: o => o.adh ? ["Oui"] : [],
};
export const OUI_NON = { nouveau: true, adherent: true };
const LIBELLE_CRITERE = {
  secteur: "Secteur", ville: "Ville", pays: "Pays", nomenclature: "Nomenclature",
  thematiques: "Thématiques", nouveau: "Nouvel exposant",
  adherent: "Adhérent syndicat",
};
/* Thématiques et secteurs ont eu chacun leur bande de puces sous la recherche.
   Elles prenaient la place de deux lignes de résultats — un salon range parfois
   trente thématiques — et rangeaient à part des filtres qui font le même
   travail que la ville ou la nomenclature. Tout tient donc ici.

   Le secteur y garde sa couleur : ailleurs elle serait une décoration, ici elle
   rattache le nom qu'on coche aux stands qu'on voit sur le plan, dont il reste
   la seule légende.

   Une cible absente de cette table ne rend aucune valeur, donc aucun critère —
   un réglage ancien qui la désignerait encore reste sans effet. */
const CLE_THEMES = "thematiques";
export const CLE_SECTEUR = "secteur";

/* Le secteur décrit l'emplacement, pas la société qui l'occupe : le retenir ne
   fait donc pas paraître les sociétés hébergées, qui n'en ont pas en propre —
   elles empruntent celui de leur hôte, et la liste dirait deux fois le même
   emplacement. C'est ce qui le sépare de tous les autres critères. */
const CRITERES_EMPLACEMENT = new Set([CLE_SECTEUR]);

/** Une thématique lue sur une fiche mène-t-elle quelque part ? Seulement si
 *  l'exploitant a fait des thématiques un critère, et si celle-ci en est une
 *  valeur — sinon le lien promettrait une liste qu'on ne saurait pas dresser. */
export const themeFiltrable = (n) => CRITERES.some(c => c.cle === CLE_THEMES &&
  c.valeurs.some(x => x.v === String(n).trim()));

/**
 * L'ordre où le panneau range ses filtres, tel que l'exploitant l'a voulu.
 *
 * Sans réglage, l'ordre reste celui d'origine — le secteur en tête, puis les
 * champs dans l'ordre où la console les a cochés. C'est un ordre de hasard : il
 * dit dans quel ordre on a coché des cases, non par quoi un visiteur commence à
 * trancher son salon. D'où ce rangement, réglé depuis l'onglet « Recherche ».
 *
 * Un critère que le réglage ne connaît pas garde sa place naturelle, derrière
 * le premier voisin de gauche que le réglage connaît : un champ coché dans la
 * console après coup paraît là où il serait paru, et non au bout de la liste où
 * personne ne l'a mis.
 */
function ordreCriteres(cles){
  const regle = ((conf("_crit").ordre) || []).filter(c => cles.indexOf(c) >= 0);
  if (!regle.length) return cles;
  const sortie = regle.slice();
  cles.forEach((c, i) => {
    if (sortie.indexOf(c) >= 0) return;
    let j = -1;
    for (let k = i - 1; k >= 0 && j < 0; k--) j = sortie.indexOf(cles[k]);
    sortie.splice(j + 1, 0, c);
  });
  return sortie;
}

/**
 * Les champs retenus comme critères, dans l'ordre où le panneau les montrera.
 *
 * Le secteur ouvre la marche et ne se coche pas : il ne vient d'aucun champ de
 * fiche à associer mais du plan lui-même, où il est là ou n'est pas. Le
 * réglage qui l'éteint est celui des couleurs, et il l'éteint des deux côtés.
 * C'est aussi le découpage le plus large du salon : le poser en tête range les
 * critères du plus grossier au plus fin — c'est l'ordre par défaut, que
 * l'exploitant refait à sa main si son salon se tranche autrement.
 */
export function clesCriteres(){
  const r = (DATA && DATA.fiche && DATA.fiche.criteres) || {};
  const cochees = Object.keys(r).filter(k => r[k] === true);
  return ordreCriteres(secteursMontres() ? [CLE_SECTEUR].concat(cochees) : cochees);
}

/** L'intitulé d'un critère : celui du salon pour un champ qu'il s'est ajouté. */
export function libelleCritere(cle){
  if (cle.indexOf(PREFIXE_PERSO) !== 0) return LIBELLE_CRITERE[cle] || cle;
  const c = ((DATA && DATA.fiche && DATA.fiche.perso) || [])
    .find(x => x && PREFIXE_PERSO + x.cle === cle);
  return (c && c.libelle) || cle.slice(PREFIXE_PERSO.length);
}

/**
 * Les valeurs d'une fiche pour un critère, toujours une liste de textes.
 *
 * Un champ à choix multiple ne descend pas en liste : la source joint ses
 * valeurs par un point-virgule — « Devenir master-franchisé;Adhérent FFF ».
 * Prise telle quelle, la chaîne entière ferait une valeur à part, et un
 * exposant qui en porte deux ne se retrouverait avec personne : il y aurait
 * autant de valeurs à cocher que de combinaisons. On les sépare donc ici
 * aussi, et pas seulement à la synchronisation — les fiches déjà relevées
 * portent encore la chaîne entière, et n'attendent pas le prochain passage
 * pour se laisser filtrer.
 */
export function valeursCritere(o, cle){
  const brut = cle.indexOf(PREFIXE_PERSO) === 0
    ? (o.perso || {})[cle.slice(PREFIXE_PERSO.length)]
    : (LECTURE_CRITERE[cle] ? LECTURE_CRITERE[cle](o) : null);
  if (brut === null || brut === undefined || brut === "") return [];
  /* Une liste peut porter des trous — une société hébergée sans ville en a un
     là où les autres ont la leur — et « undefined » deviendrait une valeur à
     cocher si on la traduisait en texte avant de l'écarter. */
  return separeValeurs(brut);
}


/** Tout ce qu'une fiche porte de critères, pour la recherche plein texte. */
export function texteCriteres(o){
  return clesCriteres().flatMap(c => valeursCritere(o, c)).join(" ");
}

/**
 * L'anglais des champs propres au salon, pour la recherche plein texte.
 *
 * Tous, et pas seulement ceux qui sont des critères : ce qu'une fiche montre
 * doit se retrouver en le tapant, et la version anglaise est justement celle
 * que le visiteur anglophone a sous les yeux. Le français entre déjà dans le
 * rang par ailleurs — les deux s'y ajoutent, la recherche ne sachant pas dans
 * quelle langue on lui parle.
 *
 * Elle rend son espace de tête : le rang s'assemble par concaténation, et une
 * fiche sans anglais n'a alors rien à y ajouter.
 */
export function texteAnglaisPerso(o){
  const l = Object.values(o.perso_en || {}).flatMap(v => separeValeurs(v));
  return l.length ? " " + l.join(" ").toLowerCase() : "";
}

/**
 * Les critères et leurs valeurs, relevés dans le salon entier.
 *
 * Les valeurs viennent des fiches, jamais d'une liste tenue à part : un filtre
 * qui proposerait une ville où personne n'expose ne rendrait que des listes
 * vides. Elles sont comptées, et rangées de la plus portée à la moins portée —
 * c'est l'ordre dans lequel on les cherche.
 */
let CRITERES = [];
export function indexeCriteres(){
  const fiches = TOUS.filter(o => o.kind === "stand").concat(HEBERGES);
  CRITERES = clesCriteres().map(cle => {
    const n = new Map();
    fiches.forEach(o => valeursCritere(o, cle)
      .forEach(v => n.set(v, (n.get(v) || 0) + 1)));
    const valeurs = [...n].sort((a, b) => (b[1] - a[1]) || COLLATION.compare(a[0], b[0]))
      .map(([v, k]) => ({ v, n: k }));
    return {
      cle, libelle: libelleCritere(cle), ouiNon: OUI_NON[cle] === true,
      valeurs, vide: !valeurs.length,
    };
  /* Un critère que rien ne renseigne ne rendrait rien : le visiteur ne le voit
     pas. L'exploitant, lui, le voit et lit pourquoi — sans quoi un champ tout
     juste réglé semble n'avoir servi à rien, alors qu'il attend seulement la
     synchronisation qui relèvera ses valeurs. */
  }).filter(c => !c.vide || PLAN_ADMIN);
  /* Un critère retenu avant un rechargement peut avoir disparu du réglage, ou
     n'avoir plus aucune valeur : il resterait sinon à retrancher des fiches
     sans que rien ne le montre. */
  [...state.crit.keys()].forEach(k => {
    if (!CRITERES.some(c => c.cle === k)) state.crit.delete(k);
  });
  majCriteres();
}

/**
 * L'ordre des filtres vient de changer : on refait l'index, et le panneau.
 *
 * `majCriteres` relit le panneau déplié sans le réécrire — c'est ce qui lui
 * garde le groupe ouvert et le tamis tapé —, et un rang échangé ne se lit pas
 * dans une relecture. Le seul geste qui change l'ordre étant le rangement des
 * réglages, il peut bien coûter un panneau réécrit.
 */
export function refaitCriteres(){
  indexeCriteres();
  const pan = $("panCrit");
  if (pan && !pan.hidden) remplitCriteres();
}

/** Ce que la liste retient d'un critère : une valeur cochée suffit. */
function dansCriteres(o){
  for (const [cle, choisies] of state.crit){
    const v = valeursCritere(o, cle);
    if (!v.some(x => choisies.has(x))) return false;
  }
  return true;
}

const critereActif = (cle, v) => state.crit.has(cle) && state.crit.get(cle).has(v);

function basculeCritere(cle, v){
  const l = state.crit.get(cle) || new Set();
  if (l.has(v)) l.delete(v); else l.add(v);
  if (l.size) state.crit.set(cle, l); else state.crit.delete(cle);
  majCriteres();
  reposeRetrait();
  appliqueFiltre();
}

export function videCriteres(){
  state.crit.clear();
  majCriteres();
  reposeRetrait();
  appliqueFiltre();
}

/** La croix du champ ne sert qu'à défaire : elle ne paraît qu'une fois qu'il y
 *  a quelque chose à défaire. */
export function majVideQ(){
  const b = $("videQ");
  if (b) b.hidden = !state.q;
}

/**
 * Reprendre le plan entier, sans effacer le mot-clé lettre à lettre.
 *
 * Une recherche sans résultat éteint la liste et le plan à la fois : il faut
 * pouvoir la défaire d'un geste. Les critères retenus, eux, restent — ils ont
 * leurs propres puces pour cela, et les retirer avec le mot-clé effacerait une
 * question qu'on n'a pas posée.
 */
export function videRecherche(){
  state.q = ""; state.qn = "";
  const champ = $("q");
  if (champ){
    champ.value = "";
    /* Sur un téléphone, rendre la main au champ relèverait le clavier sur le
       plan qu'on vient justement de vouloir revoir. */
    if (!ETROIT()) champ.focus();
  }
  majVideQ();
  reposeRetrait();
  appliqueFiltre();
}

/** Le nombre de valeurs retenues, tous critères confondus. */
const nCriteres = () => [...state.crit.values()].reduce((a, l) => a + l.size, 0);

/* Ce que le panneau des critères, quand il est déplié, doit relire : une valeur
   peut tomber ailleurs que sous ses puces — une puce retirée de la bande des
   retenus, « Tout effacer » à son pied. Posé par le remplissage, oublié à la
   fermeture ; refermé, le panneau n'a plus rien à relire. */
let majPanneauCrit = null;

/**
 * La barre : le bouton qui déplie les critères, et ce qui est retenu.
 *
 * Les valeurs retenues restent sous les yeux, chacune sur une puce qui la
 * retire d'une pression. Sans elles, on ne saurait plus pourquoi la liste est
 * si courte — et sur un téléphone, le panneau qui les porte est fermé.
 */
function majCriteres(){
  const btn = $("btnFiltres"), barre = $("actifs");
  if (!btn || !barre) return;
  btn.hidden = !CRITERES.length;
  // plus rien à offrir : le panneau qui portait ces critères n'a plus d'objet
  if (btn.hidden) fermeCriteres();
  // un panneau qui n'offrirait que des critères vides n'a rien à filtrer : il
  // ne s'ouvre que pour dire ce qui manque, et le bouton le dit aussi
  btn.classList.toggle("vide", CRITERES.every(c => c.vide));
  const n = nCriteres();
  const jeton = $("nFiltres");
  jeton.hidden = !n;
  jeton.textContent = n;
  btn.setAttribute("aria-pressed", String(n > 0));

  /* Le panneau déplié se relit ici, quelle que soit la main qui a touché au
     critère : la sienne, une puce de la bande, « Tout effacer ». */
  if (majPanneauCrit) majPanneauCrit();

  barre.hidden = !n;
  barre.innerHTML = "";
  if (!n) { mesureTiroir(); return; }
  state.crit.forEach((valeurs, cle) => {
    const lib = libelleCritere(cle);
    valeurs.forEach(v => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "actif";
      b.title = "Retirer ce critère";
      b.innerHTML = (cle === CLE_SECTEUR ? pastilleSecteur(v) : "") +
        '<span class="k"></span><span class="v"></span>' +
        '<span class="x" aria-hidden="true">×</span>';
      b.querySelector(".k").textContent = lib;
      b.querySelector(".v").textContent = OUI_NON[cle] ? "" : v;
      b.setAttribute("aria-label", "Retirer le critère " + lib + " " + v);
      b.onclick = () => basculeCritere(cle, v);
      barre.appendChild(b);
    });
  });
  if (n > 1){
    const t = document.createElement("button");
    t.type = "button";
    t.className = "actif vider";
    t.textContent = "Tout effacer";
    t.onclick = videCriteres;
    barre.appendChild(t);
  }
  // la barre fait partie de ce qui dépasse du tiroir replié : sa hauteur change
  mesureTiroir();
  majFondus();
}

/* Au-delà d'une douzaine de valeurs, on ne les parcourt plus des yeux : une
   ligne de saisie les tamise sur place. */
const VALEURS_TAMIS = 12;

/**
 * Le panneau des critères, déplié dans la colonne.
 *
 * Sous le mot-clé qu'il complète, et de la largeur de la liste. Une fenêtre
 * posée à côté du bouton recouvrait cette liste au moment même où l'on décidait
 * de ce qu'elle garde : on cochait sans voir ce qu'il restait. Déplié à sa
 * place, le panneau la pousse vers le bas au lieu de passer devant — on coche,
 * la liste se raccourcit dessous, le plan s'éteint derrière. Chaque groupe se
 * replie une fois choisi — on ne règle pas douze critères d'affilée — et le
 * pied dit combien de fiches restent.
 */
function remplitCriteres(){
  const corps = $("critCorps"), pied = $("critPied");
  if (!corps || !pied) return;
  corps.innerHTML = "";
  pied.innerHTML = "";
  /* Ce que chaque groupe redit de lui-même quand le panneau se relit. */
  const rappels = [];
  const compte = document.createElement("p");
  compte.className = "compte-crit";
  /* Le pied du panneau se remplit en dernier — il parle de ce qui est coché
     au-dessus — mais il se remet à jour à chaque puce touchée, d'où la
     fonction que l'on garde sous la main. */
  let majTout = () => {};
  const dis = () => {
    const n = TOUS.concat(HEBERGES).filter(o => o.kind !== "zone" && visible(o)).length;
    compte.textContent = n + (n > 1 ? " exposants retenus" : " exposant retenu");
    majTout();
  };

  CRITERES.forEach(c => {
    /* Un critère replié par défaut, sauf s'il est le seul et qu'il tient à
       l'écran : cent trente-neuf rubriques dépliées d'office repoussaient
       les autres critères et le pied du panneau hors de vue, sur
       téléphone comme ailleurs. Le titre dit ce qui est retenu dedans, de
       sorte qu'un critère replié ne cache jamais un choix fait. */
    const g = document.createElement("details");
    g.className = "grp-crit";
    g.open = CRITERES.length === 1 && c.valeurs.length <= VALEURS_TAMIS;
    const h = document.createElement("summary");
    h.innerHTML = '<span class="t"></span><span class="r"></span>';
    h.querySelector(".t").textContent = c.libelle;
    const retenu = h.querySelector(".r");
    /* Le titre ne dit que ce qui est retenu dedans. Compter les valeurs
       offertes n'aidait pas à choisir — on ne coche pas un critère parce
       qu'il en propose quinze — et cette ligne-là devait rester libre pour
       la seule chose qu'un critère replié ne doit jamais cacher. */
    const disRetenu = () => {
      const n = (state.crit.get(c.cle) || new Set()).size;
      retenu.textContent = c.vide ? "aucune valeur relevée"
        : !n ? ""
        : c.ouiNon ? "retenu" : n + " retenue" + (n > 1 ? "s" : "");
      retenu.dataset.on = String(n > 0);
      retenu.dataset.manque = String(Boolean(c.vide));
    };
    disRetenu();
    rappels.push(disRetenu);
    g.appendChild(h);

    const puces = document.createElement("div");
    puces.className = "puces-crit";

    /* Rien à cocher, mais quelque chose à dire : le champ est bien réglé
       comme critère, ses valeurs se relèvent sur les fiches, et aucune n'y
       a été trouvée. */
    if (c.vide){
      g.open = true;
      const rien = document.createElement("p");
      rien.className = "vide-crit";
      rien.textContent = "Aucune valeur sur les fiches. Vérifiez le champ " +
        "d'origine de ce champ dans la console, puis lancez une " +
        "synchronisation : les valeurs proposées ici viennent d'elle.";
      g.appendChild(rien);
      corps.appendChild(g);
      return;
    }

    /* Un oui/non n'a pas de valeurs à choisir : il est lui-même la valeur,
       et deux puces « oui » et « non » diraient deux fois la même chose. */
    const offertes = c.ouiNon ? [c.valeurs[0]] : c.valeurs;

    const dessine = (tamis) => {
      puces.innerHTML = "";
      const t = (tamis || "").trim().toLowerCase();
      const vues = t ? offertes.filter(x => x.v.toLowerCase().includes(t)) : offertes;
      if (!vues.length){
        const vide = document.createElement("span");
        vide.className = "aucune";
        vide.textContent = "Aucune valeur ne correspond.";
        puces.appendChild(vide);
        return;
      }
      vues.forEach(x => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "puce-crit";
        /* De quel critère et de quelle valeur : le panneau se relit de bout en
           bout quand l'un d'eux tombe ailleurs, et ses puces ne lui survivent
           pas — le tamis en refait d'autres à chaque lettre tapée. */
        b.dataset.cle = c.cle;
        b.dataset.val = x.v;
        b.setAttribute("aria-pressed", String(critereActif(c.cle, x.v)));
        b.innerHTML = (c.cle === CLE_SECTEUR ? pastilleSecteur(x.v) : "") +
          '<span class="l"></span><span class="n"></span>';
        b.querySelector(".l").textContent = c.ouiNon ? c.libelle : x.v;
        b.querySelector(".n").textContent = x.n;
        /* Cocher ne fait que cocher : ce que la puce change d'elle-même, son
           titre de groupe et le compte du pied, leur revient par la relecture
           du panneau — la bande des retenus, elle, coche déjà ainsi. */
        b.onclick = () => basculeCritere(c.cle, x.v);
        puces.appendChild(b);
      });
    };

    if (!c.ouiNon && offertes.length > VALEURS_TAMIS){
      const ch = document.createElement("input");
      ch.type = "search";
      ch.className = "tamis";
      ch.placeholder = "Filtrer " + c.libelle.toLowerCase() + "…";
      ch.autocomplete = "off";
      ch.oninput = () => dessine(ch.value);
      g.appendChild(ch);
    }
    dessine("");
    g.appendChild(puces);
    corps.appendChild(g);
  });

  pied.appendChild(compte);
  /* Retenir cinquante exposants d'un geste plutôt que d'ouvrir cinquante
     fiches : ce que la recherche vient de circonscrire est précisément ce
     qu'un visiteur voulait mettre à son programme. Le bouton se pose sous le
     compte, dont il est la suite — et non à côté de « Voir les résultats »,
     dont il prendrait le rang, qui reste le geste attendu. */
  majTout = poseToutAuParcours(pied);
  dis();

  /* Relire plutôt que réécrire : réécrit, le panneau perdrait le groupe qu'on
     vient de déplier, le tamis qu'on vient de taper et l'endroit où l'on en
     était dans deux cents valeurs. */
  majPanneauCrit = () => {
    corps.querySelectorAll(".puce-crit").forEach(b =>
      b.setAttribute("aria-pressed", String(critereActif(b.dataset.cle, b.dataset.val))));
    rappels.forEach(f => f());
    dis();
  };
}

/** Le bouton est la même prise à l'aller et au retour : il déplie ce qu'il a
 *  replié, et son état se lit sur lui. */
export function basculeCriteres(){
  const pan = $("panCrit");
  if (pan && pan.hidden) ouvreCriteres(); else fermeCriteres();
}

function ouvreCriteres(){
  const pan = $("panCrit");
  if (!pan) return;
  remplitCriteres();
  pan.hidden = false;
  $("btnFiltres").setAttribute("aria-expanded", "true");
  /* En tiroir, le panneau se déplie dans la seule bande qui dépasse, et
     pousserait le compte et la liste sous le bord de l'écran. Le tiroir monte
     donc, comme il monte lorsqu'on entre dans le champ de recherche : régler
     ses critères, c'est vouloir la liste. */
  hisseTiroir();
}

/** Replié, le panneau rend sa place à la liste. Ce qui est retenu continue de
 *  se dire sous la recherche : les puces de la bande, elles, ne se replient
 *  pas — sans quoi on ne saurait plus pourquoi la liste est si courte. */
export function fermeCriteres(){
  const pan = $("panCrit");
  if (!pan || pan.hidden) return;
  /* Replié, le panneau emporte avec lui le bouton qu'on venait d'actionner, et
     le clavier se retrouverait au début de la page. La main revient donc à la
     prise, d'où elle pourra redéplier. */
  const dedans = pan.contains(document.activeElement);
  pan.hidden = true;
  majPanneauCrit = null;
  $("critCorps").innerHTML = "";
  $("critPied").innerHTML = "";
  $("btnFiltres").setAttribute("aria-expanded", "false");
  if (dedans) $("btnFiltres").focus();
}

/** Quelque chose retranche-t-il de la liste ? Le mot-clé et les critères se
 *  cumulent, aucun ne prime. */
export const filtre = () => Boolean(state.qn) || state.crit.size > 0;

/* Le retrait du plan, et le geste qui l'en sort.

   Chercher éteint sur le plan ce qui ne répond pas : la liste et le plan sont
   les deux faces du même résultat. Mais on se sert du plan pendant qu'on
   cherche — pour situer ce qu'on a trouvé, et pour regarder ce qu'il y a
   autour. Ce voisin-là était éteint, et l'ouvrir laissait le hall délavé
   autour de sa fiche : on ne voyait plus l'endroit qu'on venait justement
   d'ouvrir.

   Un clic sur ce que la recherche n'a pas retenu lève donc le retrait. Le
   mot-clé, les critères et la liste ne bougent pas : c'est le plan qu'on
   reprend, pas la question qu'on retire — et revenir au menu de recherche la
   repose. */
export let retraitLeve = false;

/** Reposer le retrait. Les fonctions qui changent le filtre l'appellent avant
 *  de le réappliquer : une question qu'on modifie est une question qu'on
 *  repose. */
export const reposeRetrait = () => { retraitLeve = false; };

/* Un critère qui parle de la société fait paraître les hébergées ; le secteur,
   qui parle de l'emplacement, non. */
const critParSociete = () =>
  [...state.crit.keys()].some(k => !CRITERES_EMPLACEMENT.has(k));

/* Sous quel réglage de l'onglet « Recherche » chaque sorte se range. Une
   hébergée suit les stands : c'est un exposant comme un autre, et l'exploitant
   qui montre les stands ne s'attend pas à devoir cocher les deux. */
const SORTE_RECHERCHE = { stand: "stands", coex: "stands", zone: "zones",
                          conf: "conferences", poi: "poi" };

/** L'exploitant laisse-t-il la recherche remonter cet objet ? */
const cherchable = (o) => chercheSorte(SORTE_RECHERCHE[o.kind] || "stands");

/* Une zone et une conférence répondent au mot-clé, jamais aux critères : ceux-ci
   décrivent une société — sa ville, ses rubriques — et rien de tout cela n'est
   d'elles. `dansCriteres` les écarte de lui-même, faute de valeur à opposer aux
   cases cochées ; c'est l'effet voulu, et non un oubli à rattraper : qui filtre
   par « gamme de produits » cherche des exposants. */
export function visible(o){
  if (!filtre()) return true;
  /* Ce que l'exploitant a retiré de la recherche ne répond pas — ni dans la
     liste, ni sur le plan, qui n'est que l'autre face du même résultat. Le
     sommaire du pavillon n'est pas concerné : sans mot-clé ni critère il n'y a
     pas de recherche, et la ligne au-dessus l'a déjà rendu tel quel. */
  if (!cherchable(o)) return false;
  /* Le catalogue n'est pas une sorte d'objet mais un texte de plus sur une
     société : un produit ne se trouve qu'en retenant le stand qui le présente,
     et c'est bien ce qu'on cherche en tapant son nom. D'où ce second rang,
     interrogé après l'autre et seulement s'il le faut. */
  return dansCriteres(o) &&
    (!state.qn || (o.rech || "").includes(state.qn) ||
     (chercheSorte("produits") && (o.rechProd || "").includes(state.qn)));
}

/* Les stands qu'une société hébergée éclaire. Le plan doit rester allumé sur
   le stand où l'on va la trouver, alors qu'il porte le nom d'un autre : c'est
   le seul endroit où une enseigne répond pour son hôte. Le relevé se refait à
   chaque changement de filtre, et non à chaque stand dessiné. */
let HOTES = new Set();
const releveHotes = () => {
  HOTES = new Set(HEBERGES.filter(visible).map(x => x.id));
};

/**
 * Ce que le plan garde allumé : ce que la liste retient, plus les stands qui
 * hébergent une société retenue.
 */
export function visibleSurPlan(o){
  if (retraitLeve) return true;
  return visible(o) || (filtre() && o.kind === "stand" && HOTES.has(o.id));
}

/**
 * Ce qu'un stand dessiné suit : le filtre de la société qu'il désigne, et non
 * celui de l'emplacement. Une hébergée écartée par un critère doit s'éteindre
 * quand bien même son hôte reste allumé — c'est justement pour la distinguer
 * de lui qu'on l'a dessinée.
 */
export function visibleSociete(o, i){
  if (retraitLeve) return true;
  if (!(i >= 0)) return visibleSurPlan(o);
  const h = PAR_HEBERGE.get(o.id + "#" + i);
  return h ? visible(h) : visibleSurPlan(o);
}

/**
 * Le retrait posé sur ce qui est dessiné.
 *
 * À part du reste parce que le montage d'un pavillon le redemande : les
 * groupes de « #stands » et « #zones » y sont réécrits d'un bloc, sans la
 * marque qu'ils portaient. Un résultat ouvert dans un autre pavillon arrivait
 * donc sur un plan entier, où rien ne disait plus ce que la recherche avait
 * retenu — et où le doigt n'avait plus de quoi la reprendre.
 */
export function marqueRetrait(){
  releveHotes();
  document.querySelectorAll("#stands g, #zones g").forEach(g => {
    const o = parId.get(g.dataset.id);
    // un stand ajouté et lié suit sa société, comme un stand dessiné
    const vu = !o || (g.dataset.soc !== undefined
      ? visibleSociete(o, Number(g.dataset.soc)) : visibleSurPlan(o));
    g.classList.toggle("dim", !vu);
  });
  document.querySelectorAll("#couches .dcal .sdes[data-id]").forEach(g => {
    const o = parId.get(g.dataset.id);
    g.classList.toggle("dim", !!o && !visibleSociete(o, Number(g.dataset.soc)));
  });
  // les marques des distinctions vivent hors des stands : le retrait ne les
  // atteint pas tout seul
  dessineDists();
}

export function appliqueFiltre(){
  /* On peut taper avant que le plan soit arrivé : la recherche est déjà dans
     `state`, et le montage la reprendra. Peindre maintenant, c'était lire les
     pavillons d'un plan qui n'existe pas encore. */
  if (!DATA) return;
  marqueRetrait();
  libelles(); liste();
}

/**
 * Le retrait ne survit pas au clic qui l'ignore.
 *
 * Ce qui est resté allumé fait exception : l'ouvrir, c'est se servir du
 * résultat, pas en sortir. On reconnaît l'un de l'autre à la marque que
 * « marqueRetrait » leur a posée — celle-là même qui les éteint.
 */
export function oublieRetrait(cible){
  if (retraitLeve || !filtre() || !cible) return;
  if (!cible.classList.contains("dim")) return;
  retraitLeve = true;
  appliqueFiltre();
}

/** Toute reprise du menu de recherche repose le retrait : la question est
 *  rouverte, et le plan redit ce qu'elle retient. */
export function reprendRecherche(){
  if (!retraitLeve) return;
  reposeRetrait();
  appliqueFiltre();
}

/* L'ordre des sortes dans les résultats. On cherche un exposant neuf fois sur
   dix : les stands passent devant, puis les endroits du salon — les zones que
   le salon fournit, puis les repères qu'on y a dessinés — et le programme
   ferme la marche, le plus nombreux et le moins souvent visé. Une hébergée se
   range avec les stands, c'est un exposant comme un autre. Ce rang prime sur le
   pavillon : quatre sortes entremêlées par pavillon ne se lisaient plus. */
const RANGS = { stand: 0, coex: 0, zone: 1, poi: 2, conf: 3 };
const rangSorte = (o) => RANGS[o.kind] || 0;

/** Combien de lignes d'une même sorte la liste veut bien poser. Au-delà, on
 *  n'a plus une liste mais un annuaire : c'est le mot-clé qu'il faut préciser,
 *  et le compte au-dessus le dit. */
const PLAFOND_SORTE = 500;

/* Le premier bloc d'une ligne porte le numéro de stand ; une zone, une
   conférence et un repère n'en ont pas, et laisser la case vide effaçait
   justement ce qui les distingue d'un stand sans numéro. Elle dit alors la
   sorte. */
const CASE_SORTE = { zone: "Zone", conf: "Conf", poi: "Repère" };

/**
 * Ce que la case affiche.
 *
 * Deux emplacements réunis arrivent séparés par un tiret entouré d'espaces —
 * « D70 - E71 ». Ces espaces sont les seuls endroits où le numéro accepte de
 * se couper : dans une case étroite, il s'y coupait, et la liste alignait des
 * numéros en deux morceaux empilés. Le tiret dit déjà la réunion, les espaces
 * n'y ajoutent rien.
 */
export const codeCase = (o) => CASE_SORTE[o.kind] ||
  String(o.code || "").replace(/\s*([-–—/])\s*/g, "$1").trim() || "—";

/**
 * La case du numéro, de même largeur sur toutes les lignes.
 *
 * Une case taillée ligne à ligne mettrait les noms en escalier ; la case fixe
 * qu'elle remplace coupait les numéros doubles. C'est donc le plus long numéro
 * du salon qui la règle — et non le plus long des résultats affichés, qui
 * ferait sauter la colonne des noms à chaque frappe.
 *
 * Un plafond garde au nom la place qui lui revient sur un téléphone : passé
 * lui, c'est la police du numéro qui cède, plutôt que la case. Elle a son
 * propre plancher, sans quoi un numéro aberrant — il en arrive — rendrait
 * illisibles les huit cents autres pour tenir tout entier.
 */
const CASE_MIN = 48, CASE_MAX = 92, CASE_CADRE = 10, CASE_POLICE = 11.5;
function caseNumero(){
  let w = 0;
  for (const o of TOUS)
    if (o.kind === "stand" && o.code) w = Math.max(w, largeur(codeCase(o), P_CODE));
  w *= CASE_POLICE;
  const place = CASE_MAX - CASE_CADRE;
  return {
    l: Math.round(Math.min(Math.max(w + CASE_CADRE, CASE_MIN), CASE_MAX)),
    f: w > place ? Math.max(9, CASE_POLICE * place / w) : CASE_POLICE,
  };
}

/**
 * Ce que la seconde ligne ajoute : pour une conférence, quand et où.
 *
 * Un titre seul ne distingue pas deux sessions d'un programme qui en compte
 * trois cents, et « quand » est la première question qu'on se pose en en
 * trouvant une : le jour s'abrège pour tenir sur la ligne, la fiche l'écrit en
 * toutes lettres.
 */
function sousLigne(o){
  /* Un repère dit ce qu'il est, quand son libellé ne le dit pas déjà : entre
     deux lignes « Hall Sud » et « Hall Nord », savoir qu'il s'agit d'entrées
     est ce qui les rattache à ce qu'on cherchait. */
  if (o.kind === "poi") return o.type || "";
  if (o.kind !== "conf") return "";
  const d = momentLocal(o.debutLocal, DATA.fuseau) || momentLocal(o.debut, DATA.fuseau);
  const quand = d
    ? JOURS[new Date(d.an, d.mois - 1, d.jour).getDay()].slice(0, 3) + ". " +
      d.jour + " · " + d.h + "h" + d.min
    : "";
  return [quand, o.salle].filter(Boolean).join(" · ");
}

export function liste(){
  const box = $("list");
  const q = state.qn;
  // un critère retenu déborde le pavillon affiché, comme un mot-clé
  const tout = filtre();
  /* Les sociétés hébergées rejoignent la liste dès qu'on cherche une société,
     et non un emplacement : par son nom, par ce qu'elle vient faire là, ou par
     l'un des champs que l'exploitant propose en critère. Ceux-là sont à elle,
     pas à son hôte — l'en écarter la rendrait introuvable justement là où on la
     cherche. Le secteur fait exception : porté par l'emplacement seul, il ne
     les fait pas paraître. Sans rien de tout cela, la liste reste le sommaire
     des emplacements, et son compte celui qu'annonce l'en-tête. */
  const parSociete = Boolean(q) || critParSociete();
  /* Le programme ne rejoint la liste que sur un mot-clé. Un critère ne dit rien
     d'une conférence, et le sommaire d'un pavillon est celui de ses
     emplacements : ajouter là trois cents sessions noierait les stands qu'on
     est venu parcourir. */
  const portee = (parSociete ? TOUS.concat(HEBERGES) : tout ? TOUS
                   : P().stands.filter(o => !o.lien))
    .concat(q ? CONFERENCES : [])
    /* Les repères rejoignent la liste comme le programme, sur un mot-clé seul :
       un critère décrit une société, et un escalier n'en est pas une. */
    .concat(q ? reperesCherchables() : []);
  const vus = portee.filter(visible).sort((a, b) =>
    (rangSorte(a) - rangSorte(b)) ||
    (a.p - b.p) ||
    ((a.nom ? 0 : 1) - (b.nom ? 0 : 1)) ||
    COLLATION.compare(String(a.nom || a.code || ""), String(b.nom || b.code || "")));

  /* Sans mot-clé ni critère, la liste n'est pas un résultat mais le sommaire
     du pavillon : « 404 résultats · Franchise Expo Paris » répond alors à une
     question que personne n'a posée, et redit le salon que l'en-tête nomme
     déjà. Le compte ne paraît donc qu'une fois la recherche commencée — et
     celle-ci portant sur tout le salon, il n'a plus qu'une portée à dire. */
  const compte = $("count");
  if (compte.hidden === tout){
    compte.hidden = !tout;
    // le compte fait partie de ce qui dépasse du tiroir replié : sa disparition
    // comme son retour changent la hauteur à laquelle s'ancrent les commandes
    mesureTiroir();
  }
  $("countTxt").textContent = vus.length + (vus.length > 1 ? " résultats" : " résultat") +
    " · tous pavillons";

  /* Le plafond se compte par sorte, et non sur la liste entière : les stands
     passant devant, une recherche large le remplissait à eux seuls et les
     zones comme le programme, rangés derrière, disparaissaient sans que rien
     ne le dise — alors que le compte annoncé, lui, les avait comptés. */
  const tenus = new Map();
  const montres = vus.filter(o => {
    const r = rangSorte(o), n = (tenus.get(r) || 0) + 1;
    tenus.set(r, n);
    return n <= PLAFOND_SORTE;
  });

  const boite = caseNumero();
  box.style.setProperty("--caseL", boite.l + "px");
  box.style.setProperty("--caseF", boite.f.toFixed(2) + "px");

  box.innerHTML = montres.length ? montres.map(o => {
    const heberge = o.kind === "coex";
    /* La liste ne porte que ce qui aide à retrouver quelqu'un : son numéro de
       stand et son nom. La surface louée et les angles ouverts regardent la
       commercialisation, jamais le visiteur : ils ne s'affichent nulle part. */
    const conf = o.kind === "conf";
    /* Ni une conférence ni un repère n'est un emplacement : la sélection du
       plan ne les désigne pas, et le clic ne passe pas par « select ». */
    const emplacement = !conf && o.kind !== "poi";
    // une conférence que rien ne situe encore n'est dans aucun pavillon : celui
    // qui l'a remontée n'en dit rien au visiteur
    const badge = o.p !== state.plan && !(conf && !o.situee)
      ? '<span class="hall">' + esc(DATA.plans[o.p].court) + '</span>' : "";
    const rang = heberge ? o.i : -1;
    const sous = sousLigne(o);
    /* Un hébergé se marque pour lui seul : la ligne porte son nom, pas celui
       du stand, et son hôte peut être là depuis dix ans. */
    const mn = marquesListe(d => heberge ? porteDist(o, d) : standPorte(o, d));
    /* Le pavillon part avec la ligne. Un repère ne vit pas dans « parId » —
       c'est une forme dessinée, pas un objet du plan — et son identifiant seul
       ne dirait pas où aller le chercher. */
    return '<button class="row" data-id="' + esc(o.id) +
      '" data-sorte="' + o.kind + '" data-soc="' + rang + '" data-p="' + o.p +
      '" aria-current="' + (emplacement && state.sel === o.id && state.selSoc === rang) + '">' +
      '<span class="code">' + esc(codeCase(o)) + '</span>' +
      '<span><span class="nm">' + mn.avant +
        esc((o.kind === "zone" ? nomDeLaZone(o) : o.nom) || o.plan ||
        (o.kind === "zone" ? "Zone sans nom" : ("Stand " + (o.code || "")).trim())) +
        mn.apres + '</span>' +
      '<span class="s">' + mn.sous + (mn.sous && sous ? " · " : "") + esc(sous) +
        badge + '</span></span></button>';
  }).join("")
    : '<div class="empty">' + (DATA.plans.length > 1
        ? "Aucun résultat dans les " + DATA.plans.length + " pavillons."
        : "Aucun résultat dans ce pavillon.") + '</div>';
  /* Le canal dit d'où vient l'ouverture : la même liste sert de résultat de
     recherche quand un mot-clé est saisi, et de sommaire du pavillon sinon.

     Un rang part avec l'identifiant, et la fiche s'ouvre droit sur la société
     du rang cliqué : la liste vient de la nommer, redemander laquelle on veut
     serait une question dont on a déjà la réponse.

     Une conférence n'est pas un emplacement : `select` ne saurait pas la
     cadrer, et c'est sa fiche qu'on ouvre — d'où elle offre de situer sa
     salle sur le plan. */
  box.querySelectorAll(".row").forEach(b => b.onclick = () => {
    if (b.dataset.sorte === "conf"){ ficheConf(b.dataset.id, "recherche"); return; }
    // un repère s'ouvre sur son plan, et depuis sa pastille : ce n'est pas un
    // emplacement, et « select » n'aurait rien à cadrer
    if (b.dataset.sorte === "poi"){ vaAuRepere(b.dataset.id, +b.dataset.p); return; }
    select(b.dataset.id, true, parSociete ? "recherche" : "liste",
           Number(b.dataset.soc));
  });
}

/**
 * La ligne de la liste qui porte la fiche ouverte.
 *
 * Ouvrir une fiche ne change rien à ce que la liste montre : mêmes résultats,
 * même ordre, même compte — seule la ligne marquée change. La reconstruire
 * entière pour déplacer cette marque coûtait pourtant neuf millisecondes sur
 * un salon de mille stands, cinq cents lignes réécrites et autant de clics
 * rebranchés, à chaque ouverture comme à chaque fermeture. On repose donc
 * l'attribut là où il est.
 *
 * Ce qui, lui, change vraiment la liste passe toujours par « liste » : un
 * mot-clé, un critère, et le pavillon — celui-ci décidant de la pastille de
 * hall que portent les lignes d'ailleurs.
 */
export function marqueChoisie(){
  $("list").querySelectorAll(".row").forEach(b => {
    /* Une conférence et un repère ne sont pas des emplacements : la sélection
       du plan ne les désigne pas, et « liste » ne les marque jamais. */
    const emplacement = b.dataset.sorte !== "conf" && b.dataset.sorte !== "poi";
    b.setAttribute("aria-current", String(emplacement && b.dataset.id === state.sel &&
      Number(b.dataset.soc) === state.selSoc));
  });
}

/**
 * Le logo d'un exposant, mis en route quand la main se pose sur sa ligne.
 *
 * Il ne se charge qu'à l'ouverture de la fiche — les cinq cents logos d'un
 * salon comme Franchise Expo pèsent soixante-dix mégaoctets, et la liste n'en
 * montre aucun. Mais entre le doigt qui se pose et la fiche qui s'ouvre il se
 * passe le temps d'une pression, et c'est autant de trajet réseau qu'on peut
 * avoir déjà fait. Le recadrage garde son résultat par adresse : demandé ici,
 * il est trouvé fait, ou en route, quand la fiche le réclame — jamais deux
 * fois.
 *
 * Une pression sur une ligne est une ouverture : on ne relève pas la liste du
 * doigt sans rien choisir. Le plan, lui, ne s'y prête pas — un déplacement y
 * commence aussi par un doigt posé sur un stand, et chargerait un logo qu'on
 * ne regardera pas.
 */
function prechargeMarque(id, iSoc){
  const o = parId.get(id);
  if (!o || o.kind === "zone" || !montre("stand", "logo")) return;
  const soc = iSoc >= 0 ? (o.coex || [])[iSoc] : o;
  const url = soc && (adresseVignette(soc.vignette) || adresseImage(soc.logo));
  if (!url) return;
  /* Une vignette déjà reçue par lot porte ses octets : il n'y a rien à mettre
     en route. Celle qu'on n'a pas encore n'a rien à préparer non plus — elle
     arrive prête — mais la demander ici fait le trajet réseau d'avance, et le
     navigateur l'aura quand la fiche s'ouvrira. */
  if (url.indexOf("data:") === 0) return;
  if (url.indexOf("vignette=") >= 0) new Image().src = url;
  else recadreMarque(url);
}

/**
 * Les vignettes du salon, chargées en silence une fois le plan affiché.
 *
 * Une vignette pèse trois kilo-octets et vient de notre propre origine : les
 * deux cent dix d'un salon comme Franchise Expo font six cents kilo-octets,
 * une fois. Toute fiche ouverte ensuite trouve son logo déjà là.
 *
 * Ce n'était pas possible avant qu'elles existent : les mêmes logos pris chez
 * leur source pèsent soixante-dix mégaoctets, et les précharger aurait ralenti
 * ce qu'on voulait accélérer.
 *
 * Elles se demandent groupées, et c'est tout le sujet. Une par une, c'étaient
 * deux cent dix allers-retours jusqu'au relais — six en vol à la fois, donc
 * trente-cinq vagues, et sur le réseau d'un salon une vague coûte plus que ce
 * qu'elle rapporte. Le relais, lui, payait une lecture de son stockage par
 * vignette, et le quota d'une journée entière y passait. Par lots, il en reste
 * trois, et trois lectures.
 *
 * Quatre-vingt-seize par lot : deux demandes pour un salon comme Franchise
 * Expo, une adresse de deux kilo-octets et demi — la chaîne en accepte cinq
 * fois plus avant de rompre, la mesure a été faite — et quatre cents
 * kilo-octets, un lot qu'on peut encore abandonner en route sans avoir tout
 * perdu. Tout demander d'un coup tiendrait aussi, jusqu'au salon qui passe les
 * trois cents exposants ; on garde la marge.
 *
 * Trois retenues, parce que ce chargement n'est demandé par personne :
 *
 * — il attend que le plan soit à l'écran et la main immobile ;
 * — il renonce sur un réseau que le navigateur dit lent ou mesuré, où six
 *   cents kilo-octets non réclamés ne se prennent pas ;
 * — il y va deux lots à la fois, pour ne pas disputer la bande passante au
 *   fond de plan, qui pèse cinquante fois plus et qu'on regarde déjà.
 */
const VIGNETTES_PAR_LOT = 96;
const LOTS_A_LA_FOIS = 2;

/* Ce qui est arrivé, par clé : l'image elle-même, prête à poser. Le lot qui
   l'a apportée reste, lui, dans le cache du navigateur et du service — son
   adresse ne porte que des empreintes, il ne peut pas se périmer — si bien
   que la visite d'après ne redemande rien. */
export const VIGNETTES = new Map();

export function prechargeLesVignettes(){
  if (!API) return;
  /* Ce que le navigateur sait du réseau. Rien n'oblige à le dire : en
     l'absence de réponse on charge, comme on le faisait avant de demander. */
  const res = navigator.connection || {};
  if (res.saveData) return;
  if (/(^|-)2g$/.test(res.effectiveType || "")) return;

  const cles = [];
  const vues = new Set();
  for (const o of TOUS){
    if (o.kind !== "stand") continue;
    for (const soc of [o].concat(o.coex || [])){
      const c = soc && soc.vignette;
      if (c && !vues.has(c) && !VIGNETTES.has(c)){ vues.add(c); cles.push(c); }
    }
  }
  if (!cles.length) return;

  /* Triées, et coupées toujours au même endroit : deux visites demandent alors
     les mêmes lots, et celui que le navigateur garde d'hier n'a rien à
     redemander. Dans l'ordre du plan, un stand déplacé suffisait à fabriquer
     des adresses neuves — donc à tout retélécharger. */
  cles.sort();
  const lots = [];
  for (let i = 0; i < cles.length; i += VIGNETTES_PAR_LOT){
    lots.push(cles.slice(i, i + VIGNETTES_PAR_LOT));
  }

  let i = 0;
  const suivant = () => {
    if (i >= lots.length) return Promise.resolve();
    return chargeUnLot(lots[i++]).then(suivant);
  };
  for (let n = 0; n < LOTS_A_LA_FOIS; n++) suivant();
}

/**
 * Un lot demandé, et rangé.
 *
 * Ce qui revient est du texte reçu du réseau et finit dans une image de fiche :
 * on ne garde donc que ce qu'on reconnaît — une clé qu'on a demandée, et une
 * image que la page sait avoir fabriquée elle-même. Un lot qui n'aboutit pas
 * ne se plaint pas : la fiche redemandera la vignette qui lui manque, une par
 * une, comme avant.
 */
function chargeUnLot(lot){
  return fetch(API + "?vignettes=" + lot.join(","), { priority: "low" })
    .then(r => r.ok ? r.json() : null)
    .then(recu => {
      const attendues = new Set(lot);
      for (const cle of Object.keys(recu || {})){
        if (!attendues.has(cle)) continue;
        const src = "data:image/webp;base64," + recu[cle];
        if (!IMAGE_SURE.test(src)) continue;
        VIGNETTES.set(cle, src);
        /* Elle arrive déjà recadrée et à la taille : le dire évite à la fiche
           de la relire pour n'y rien trouver à retirer. Sans cela, une
           vignette qui ne porte plus « vignette= » dans son adresse — elle
           porte ses octets — passerait pour un logo lu chez sa source. */
        marquePrete(src);
      }
    })
    .catch(() => {});
}

/**
 * Le branchement, appelé par `_recherche.html` à la place que ce code tenait :
 * ce que le code soudé tient encore est confié, et l'écoute de la liste posée
 * au même rang qu'avant.
 *
 * @param {PageRecherche} page
 */
export function brancheRecherche(page){
  soude = page;
  /* Un seul écouteur pour toutes les lignes : elles naissent et meurent à chaque
     frappe, et aucune ne garderait le sien. */
  $("list").addEventListener("pointerdown", e => {
    const b = e.target.closest && e.target.closest(".row");
    if (b && (b.dataset.sorte === "stand" || b.dataset.sorte === "coex"))
      prechargeMarque(b.dataset.id, Number(b.dataset.soc));
  });
}
