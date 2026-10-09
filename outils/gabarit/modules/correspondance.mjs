/* ============================================================
   Correspondance des champs d'origine — le vocabulaire du réglage

   Les champs d'exposant ne portent pas le même nom d'un salon à l'autre :
   « x_Catalogue_RaisonSociale » ici, autre chose ailleurs, et côté Eventmaker
   ce sont des champs de fiche nommés par l'organisateur. La console laisse
   choisir, pour chaque cible, le champ qu'on lira ; ce module tient ce que ce
   choix écrit et ce qu'il affiche — les deux valeurs qui ne sont pas des noms
   de champ, l'écriture d'une suite de champs dans une seule liste déroulante,
   l'intitulé d'un champ, les deux faces d'un oui/non.

   Il ne touche ni à la page ni au salon ouvert : la liste déroulante, qui les
   lit, reste dans la console (`_console-js.html` `champOrigine`).
   ============================================================ */

/* Deux valeurs qui ne sont pas des noms de champ : « rien de réglé », qui
   laisse jouer le champ par défaut, et « ne rien lire », qui est un choix.
   La seconde s'enregistre en chaîne vide ; l'absence, elle, veut dire la
   première. Le « = » de tête les met hors d'atteinte d'un nom de champ. */
export const DEFAUT_CHAMP = "=defaut";
export const AUCUN_CHAMP = "=aucun";

/* Une cible peut lire plusieurs champs — le premier renseigné l'emporte, sauf
   la nomenclature où ils se cumulent. La liste déroulante n'a qu'une valeur
   par ligne : on la compose en les joignant, aucun nom de champ ne portant de
   barre verticale. */
export const encode = (v) => v === undefined || v === null ? DEFAUT_CHAMP
  : ([].concat(v).filter(Boolean).join("|") || AUCUN_CHAMP);
export const decode = (v) => v === DEFAUT_CHAMP ? undefined
  : v === AUCUN_CHAMP ? ""
  : v.indexOf("|") >= 0 ? v.split("|") : v;

/** Le bloc de correspondance d'un fournisseur, jamais nul. */
export const correspondance = (e, src) => (e.correspondances || {})[src] || {};

// le préfixe dit l'origine, que le groupe annonce déjà
const sansPrefixe = (cle) => String(cle).replace(/^[a-z]+:/, "");
const courte = (v) => {
  const t = String(v || "").trim();
  return t.length > 34 ? t.slice(0, 32) + "…" : t;
};

/**
 * L'intitulé d'un champ dans la liste déroulante.
 *
 * Trois choses, dans cet ordre : le nom technique, parce que c'est lui qu'on
 * retrouvera dans l'API ; son libellé quand le schéma en donne un de
 * différent ; et une valeur telle qu'elle a été lue. C'est cette dernière qui
 * fait choisir — « x_Catalogue_RaisonSociale » et « x_Catalogue_Enseigne » ne
 * se distinguent que par ce qu'elles contiennent, et les champs personnalisés
 * d'un salon portent des noms que personne ne reconnaît de mémoire.
 */
export function intitule(d) {
  const technique = sansPrefixe(d.cle);
  const lib = d.libelle && d.libelle !== technique ? technique + " — " + d.libelle : technique;
  return lib + "  ·  " + (d.exemple ? courte(d.exemple) : "(vide sur les fiches lues)");
}

/**
 * L'intitulé d'une cible qui lit plusieurs champs à la suite — « address »,
 * puis « address_2 » quand le premier est vide. L'exemple est celui du premier
 * champ qui en porte un : c'est la valeur que la fiche montrera le plus
 * souvent.
 */
export function intituleSuite(v, detectes) {
  const parts = v.split("|");
  const d = parts.map((c) => detectes.find((x) => x.cle === c)).find((x) => x && x.exemple);
  return parts.map(sansPrefixe).join(", puis ") + (d ? "  ·  " + courte(d.exemple) : "");
}

/* Les accords que la synchronisation reconnaît d'elle-même, quand aucune
   valeur n'a été retenue. La liste est celle de `champs.ts` : la console ne
   peut pas l'importer, elle la recopie — et les deux se corrigent ensemble,
   sans quoi la fenêtre annoncerait l'inverse de ce qui se passe. */
export const ACCORDS = ["true", "1", "oui", "o", "yes", "y", "vrai", "x", "on", "✓", "✔"];

/* Les deux faces d'un oui/non, telles que les sources les écrivent. La
   synchronisation n'a que faire de la seconde colonne — un « non » et une
   valeur quelconque ne déclenchent rien ni l'un ni l'autre — mais ici elle
   compte : c'est en ne voyant que « false » qu'on sait que « true » existe. */
const FACES = [
  ["true", "false"], ["vrai", "faux"], ["oui", "non"], ["yes", "no"],
  ["1", "0"], ["o", "n"], ["y", "n"], ["on", "off"],
];

/** Une valeur comparée sans égard à la casse ni aux espaces, comme au serveur. */
export const aplani = (v) => String(v === null || v === undefined ? "" : v).trim().toLowerCase();

/**
 * L'écriture du voisin : « FALSE » appelle « TRUE », « Non » appelle « Oui ».
 *
 * La valeur déduite est cochée telle quelle et comparée telle quelle à ce que
 * portent les fiches : la comparaison ignore la casse, mais l'exploitant, lui,
 * relit ce qu'il a coché — une face écrite autrement que sa voisine se lirait
 * comme une valeur d'ailleurs.
 */
function memeStyle(modele, mot) {
  const m = String(modele || "");
  if (m && m === m.toUpperCase() && m !== m.toLowerCase()) return mot.toUpperCase();
  if (m && m[0] === m[0].toUpperCase() && m[0] !== m[0].toLowerCase()) {
    return mot[0].toUpperCase() + mot.slice(1);
  }
  return mot;
}

/**
 * L'autre face d'un oui/non dont les fiches ne montrent qu'un côté.
 *
 * Un salon où personne n'est encore exclu porte « false » sur toutes ses
 * fiches : le relevé n'a donc que « false » à proposer, et l'exploitant n'a
 * rien à cocher — alors que c'est « true » qu'il vise. La face manquante se
 * déduit du couple, et se propose signalée : elle existe, elle n'est
 * simplement portée par personne pour l'instant.
 */
export function autreFace(valeurs) {
  const vues = valeurs.map(aplani);
  if (!vues.length) return [];
  const paire = FACES.find((f) => vues.every((v) => f.indexOf(v) >= 0));
  if (!paire) return [];
  return paire.filter((f) => vues.indexOf(f) < 0)
    .map((f) => memeStyle(valeurs[0], f));
}
