/* ============================================================
   Le corps de la fiche — ce qu'elle montre, dans quel ordre, sous quels
   intitulés

   Les règles que la fiche d'un stand applique à chaque ouverture, et que
   l'aperçu des modèles et le réglage de la fiche relisent pour montrer la
   même chose qu'elle : ce qui paraît (`montre`), l'ordre réglé
   (`ordreCorps`), les sections (`groupesFiche`), les intitulés
   (`montreIntitule`, `libelleCorps`) et le rangement qui en sort
   (`corpsRange`) ; avec eux les pictos des réseaux sociaux.

   Le préfixe des champs propres au salon vit ici, et la recherche le reprend ;
   leur libellé, qu'elle tient, elle le confie en se chargeant
   (`confieAuCorpsDeFiche`) : elle importe ce module et ne peut être importée
   par lui.
   ============================================================ */
import { esc } from "./texte.mjs";
import { DATA } from "./donnees.mjs";
import { lien, adresseWeb } from "./sur.mjs";

/**
 * Ce que le corps de la fiche emprunte à la recherche (`recherche.mjs`), qui
 * l'importe : le libellé d'un champ propre au salon. Elle le lui confie au
 * chargement de son module — jamais le code soudé.
 * @typedef {{ libelleCritere: (cle: string) => string }} PageCorpsFiche
 */
/** @type {PageCorpsFiche} */
const prete = { libelleCritere: (cle) => cle };

/** La porte de la recherche, qui prête au corps de la fiche ce qu'il appelle.
 *  @param {Partial<PageCorpsFiche>} o */
export function confieAuCorpsDeFiche(o){ Object.assign(prete, o); }
const libelleCritere = (/** @type {string} */ cle) => prete.libelleCritere(cle);
/** Le préfixe des champs propres au salon, que la recherche reprend d'ici. */
export const PREFIXE_PERSO = "perso:";

/* Les champs qui se taisent tant qu'on ne les a pas demandés — l'inverse de la
   règle générale, et pour la raison qui la fonde. Un champ absent du réglage
   paraît parce qu'il paraissait déjà avant que le réglage existe ; le hall,
   lui, n'a jamais paru, et Klipso y porte parfois le code du dossier plutôt
   qu'un nom de hall — « SMCL26_P71 ». S'afficher de lui-même le publierait
   d'un coup sur tous les salons déjà en ligne.

   Le même tableau vit dans la console — « FICHE_MASQUEE_PAR_DEFAUT » de
   « modules/fiche-detail.mjs », qui décide de l'état des cases. */
const MASQUE_PAR_DEFAUT = { hall: true };

/**
 * Un champ paraît-il sur la fiche ? L'exploitant en décide depuis la console.
 * Une entrée absente vaut « affiché », pour qu'un champ ajouté plus tard ne
 * disparaisse pas des salons déjà réglés — sauf ceux que le tableau ci-dessus
 * réserve, qui attendent d'être cochés.
 */
export function montre(type, cle){
  const r = (DATA && DATA.fiche && DATA.fiche[type]) || {};
  return MASQUE_PAR_DEFAUT[cle] ? r[cle] === true : r[cle] !== false;
}

/* L'ordre de lecture du corps d'une fiche de stand, tel qu'il vaut tant que
   l'exploitant n'y a pas touché.

   N'y figure que le corps ; le numéro de stand et la pastille des nouveaux
   venus tiennent dans l'en-tête, les conférences ont leur propre volet, et
   rien de tout cela ne se déplace — le volet qui propose de le remanier,
   « voletOrdre » de « reglage-fiche.mjs », le dit à l'exploitant. */
const ORDRE_CORPS_FICHE = ["raison", "secteur", "adresse", "ville", "pays",
  "niveaux", "telephone", "site", "facebook", "linkedin", "instagram",
  "nomenclature", "thematiques"];

/* Les intitulés du corps de la fiche. Ils vivent dans une table plutôt qu'en
   toutes lettres à leur ligne parce qu'ils s'écrivent à deux endroits : sur la
   fiche, et dans l'aperçu des modèles du panneau d'apparence. Un aperçu qui ne
   nommerait pas les champs comme la fiche ne montrerait pas la fiche. */
export const LIBELLE_CORPS = {
  raison: "Raison sociale", secteur: "Secteur", adresse: "Adresse",
  ville: "Ville", pays: "Pays", niveaux: "Niveaux", telephone: "Téléphone",
  site: "Site web", facebook: "Facebook", linkedin: "LinkedIn",
  instagram: "Instagram", nomenclature: "Nomenclature", thematiques: "Thématiques",
  /* Les deux champs qu'une zone organisateur porte en propre : ils ne viennent
     pas d'une fiche d'exposant mais de la main de l'exploitant, et ne
     s'écrivent donc jamais sur un stand. */
  description: "Description", lien: "Lien",
};

/** L'intitulé d'un champ du corps — un champ propre au salon porte le sien. */
export const libelleCorps = cle => cle.indexOf(PREFIXE_PERSO) === 0
  ? libelleCritere(cle) : (LIBELLE_CORPS[cle] || cle);

/**
 * L'ordre réglé par l'exploitant, complété de ce qu'il ne connaît pas encore.
 *
 * Un champ ajouté après coup — au code, ou par le salon — ne figure pas dans
 * la liste enregistrée. L'oublier le ferait disparaître de la fiche, et le
 * rejeter à la fin le sortirait de son voisinage sans qu'on l'ait demandé : il
 * reprend donc la place que le défaut lui donne, derrière le champ qu'il y
 * suit.
 *
 * Un champ que le salon n'affiche pas n'est pas non plus dans la liste réglée
 * — elle ne range que ce qui paraît — et revient par le même chemin le jour
 * où on le rallume : à la place que le défaut lui donne, à moins qu'on ne
 * l'ait déposé ailleurs, ce qui l'y inscrit.
 */
export function ordreCorps(persos){
  const defaut = ORDRE_CORPS_FICHE.concat(persos || []);
  const regle = ((DATA && DATA.fiche && DATA.fiche.ordre) || [])
    .filter(c => defaut.indexOf(c) >= 0);
  if (!regle.length) return defaut;
  const sortie = regle.slice();
  defaut.forEach((c, i) => {
    if (sortie.indexOf(c) >= 0) return;
    // le premier voisin de gauche que le réglage connaît donne le point d'entrée
    let j = -1;
    for (let k = i - 1; k >= 0 && j < 0; k--) j = sortie.indexOf(defaut[k]);
    sortie.splice(j + 1, 0, c);
  });
  return sortie;
}

/* ------------------------------------------------------------------
   Les groupes de champs

   Trois lignes qui se suivent — l'adresse, la ville, le pays — portaient trois
   intitulés pour une seule information, et la fiche s'allongeait d'autant. Un
   groupe les réunit sous un titre que l'exploitant écrit depuis les réglages
   du plan : les intitulés de ses membres s'effacent, et leurs valeurs se
   lisent l'une sous l'autre, comme les valeurs multiples d'un même champ.

   Les onze modèles n'ont rien à en apprendre : un groupe est un champ de plus,
   avec son intitulé et ses lignes. Ils l'habillent donc comme le reste sans
   qu'aucun ait à le connaître.
   ------------------------------------------------------------------ */

/** Les groupes réglés pour ce salon — ceux qui réunissent vraiment quelque
 *  chose : un groupe vidé de ses membres n'est plus un groupe. */
export const groupesFiche = () => ((DATA && DATA.fiche && DATA.fiche.groupes) || [])
  .filter(g => g && Array.isArray(g.cles) && g.cles.length);

/**
 * L'intitulé d'un champ paraît-il devant sa valeur ?
 *
 * L'exploitant en décide champ par champ, depuis les réglages du plan. Ce qui
 * n'est pas réglé suit l'usage : un champ seul annonce ce qu'il porte, un
 * champ réuni sous un titre ne le répète pas — c'est même ce qui fait un
 * groupe. La case existe parce que l'usage se dément : une adresse web ou un
 * picto de réseau social se reconnaissent sans qu'on les nomme, et trois
 * lignes réunies sous « Contact » ne disent plus laquelle est le téléphone.
 */
export const montreIntitule = (cle, enGroupe) => {
  const r = (DATA && DATA.fiche && DATA.fiche.intitules) || {};
  return typeof r[cle] === "boolean" ? r[cle] : !enGroupe;
};

/**
 * La valeur d'un champ du corps, prête à poser dans la fiche.
 *
 * Une valeur unique s'écrit telle quelle, sur la ligne où l'intitulé l'attend.
 * Plusieurs valeurs arrivent déjà découpées — c'est le champ qui sait comment
 * les siennes se lisent, une thématique étant un bouton là où une ligne de
 * nomenclature n'est que du texte. Dans un groupe, la valeur unique devient
 * une ligne à son tour : elle n'est plus seule sous l'intitulé, elle en côtoie
 * d'autres.
 *
 * Un membre qui garde son intitulé le pose devant sa valeur, sur la même
 * ligne : au-dessus, il ferait un second titre sous celui du groupe. Quand il
 * porte plusieurs valeurs, elles ont déjà leurs lignes et l'intitulé prend la
 * sienne.
 */
const valeurCorps = (c, enGroupe) => {
  if (!enGroupe) return Array.isArray(c.valeur) ? c.valeur.join("") : c.valeur;
  const lib = montreIntitule(c.cle, true)
    ? '<span class="lib">' + c.libelle + '</span>' : "";
  if (Array.isArray(c.valeur)){
    return (lib ? '<span class="ligne">' + lib + '</span>' : "") + c.valeur.join("");
  }
  return '<span class="ligne">' + lib + c.valeur + '</span>';
};

/* Un champ du corps : son intitulé, puis sa valeur. Sans intitulé, il ne reste
   que la valeur — et la classe, que les habillages qui rangent l'intitulé dans
   une colonne à lui ont besoin de lire pour rendre la place. */
export const champCorps = c => {
  const dit = montreIntitule(c.cle, false);
  return '<div class="field' + (c.classe ? " " + c.classe : "") +
    (dit ? "" : " muet") + '">' +
    (dit ? '<span class="eyebrow">' + c.libelle + '</span>' : "") +
    '<span class="v">' + valeurCorps(c) + '</span></div>';
};

/* Un groupe sans titre reprend l'intitulé de son premier membre : il vaut
   mieux le nom d'un des champs réunis qu'un intitulé vide au-dessus de trois
   lignes. L'intitulé d'un membre est déjà échappé, le titre saisi ne l'est
   pas. */
const groupeCorps = (titre, membres) => '<div class="field groupe">' +
  '<span class="eyebrow">' + (titre ? esc(titre) : membres[0].libelle) + '</span>' +
  '<span class="v">' + membres.map(c => valeurCorps(c, true)).join("") + '</span></div>';

/**
 * Le corps rangé : les champs dans l'ordre réglé, ceux d'un groupe réunis sous
 * son titre à la place du premier d'entre eux.
 *
 * Les membres se lisent dans l'ordre du corps et non dans celui du groupe :
 * c'est la liste rangée qui fait foi. Un membre masqué ou vide n'a pas de
 * ligne à donner, et un groupe dont aucun membre n'en donne ne paraît pas —
 * un titre seul n'annoncerait rien.
 */
export function corpsRange(ordre, champs){
  const groupes = groupesFiche();
  const faits = [];
  return ordre.map(cle => {
    const i = groupes.findIndex(g => g.cles.indexOf(cle) >= 0);
    if (i < 0) return champs[cle] ? champCorps(champs[cle]) : "";
    if (faits.indexOf(i) >= 0) return "";
    faits.push(i);
    const membres = ordre.filter(c => groupes[i].cles.indexOf(c) >= 0 && champs[c])
      .map(c => champs[c]);
    return membres.length ? groupeCorps(groupes[i].titre, membres) : "";
  }).join("");
}

/* Les pictos des réseaux sociaux.

   Une adresse de réseau social n'apprend rien qu'on ne sache déjà : elle
   redit le nom du réseau puis celui de l'exposant, sur une ligne assez longue
   pour revenir à la ligne. Le logo le dit plus vite, et trois logos tiennent
   sur la ligne que prenait une seule adresse.

   Ils sont tracés dans la couleur du texte plutôt que dans celle de la
   marque : la fiche est habillée par l'exploitant, et trois aplats de marque
   posés côte à côte lui prendraient sa page. */
export const PICTO_RS = {
  facebook: '<path d="M24 12.07C24 5.44 18.63.07 12 .07S0 5.44 0 12.07c0 5.99 4.39' +
    ' 10.95 10.13 11.86v-8.39H7.08v-3.47h3.05V9.43c0-3.01 1.79-4.67 4.53-4.67 1.31 0' +
    ' 2.69.24 2.69.24v2.95h-1.51c-1.49 0-1.96.93-1.96 1.88v2.25h3.33l-.53' +
    ' 3.47h-2.8v8.39C19.61 23.02 24 18.06 24 12.07Z"/>',
  linkedin: '<path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85' +
    ' 0-2.13 1.44-2.13 2.94v5.66H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6' +
    ' 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0' +
    ' 4.13Zm1.78 13.02H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0' +
    ' 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z"/>',
  instagram: '<rect x="2.2" y="2.2" width="19.6" height="19.6" rx="5.6" fill="none"' +
    ' stroke="currentColor" stroke-width="2.1"/>' +
    '<circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" stroke-width="2.1"/>' +
    '<circle cx="17.5" cy="6.5" r="1.45"/>',
};

/**
 * Un réseau social, en picto cliquable.
 *
 * La valeur sort déjà sous forme de ligne — ce que la fiche fait d'un champ
 * qui en porte plusieurs — pour que le picto s'affiche pareil seul sous son
 * intitulé ou réuni avec les autres sous un titre commun : c'est la ligne que
 * la feuille de style aligne horizontalement.
 *
 * Un réseau dont on n'a pas le logo ne perd pas son adresse pour autant : il
 * retombe sur le lien écrit en toutes lettres.
 */
export function pictoRS(cle, v){
  const u = adresseWeb(v);
  if (!u) return [];
  if (!PICTO_RS[cle]) return ['<span class="ligne">' + lien(v) + '</span>'];
  const nom = LIBELLE_CORPS[cle] || cle;
  return ['<span class="ligne rs"><a class="rs" href="' + esc(u) +
    '" target="_blank" rel="noopener" title="' + esc(nom) +
    '" aria-label="' + esc(nom) + '">' +
    '<svg viewBox="0 0 24 24" aria-hidden="true">' + PICTO_RS[cle] + '</svg></a></span>'];
}

