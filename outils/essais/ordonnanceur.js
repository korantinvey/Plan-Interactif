/*
 * L'ordonnanceur de la journée, sorti de sa page pour être mis à l'épreuve.
 *
 * `_journee.html` est un gabarit : son code vit dans un `<script>` au milieu
 * du balisage, et rien ne l'exporte. On en découpe donc les quelques fonctions
 * qui se tiennent toutes seules — la courbe de peine, l'écart entre les jours,
 * les tranches, et `rangeSejour` lui-même — pour les charger comme un module.
 *
 * Le découpage se fait par **ancres** et non par numéros de ligne : le
 * gabarit bouge à chaque retouche, et un essai qui se cale sur la ligne 537
 * cesse de mesurer quoi que ce soit au premier ajout. Une ancre qui disparaît
 * fait échouer franchement, ce qui est le seul comportement utile.
 */
const fs = require("fs");
const path = require("path");
const Module = require("module");

const GABARIT = path.join(__dirname, "..", "gabarit", "_journee.html");

/** Le numéro de la ligne qui commence par ce texte, ou une erreur franche. */
function ancre(lignes, debut){
  const i = lignes.findIndex(l => l.startsWith(debut));
  if (i < 0) throw new Error(
    "Ancre introuvable dans _journee.html : « " + debut + " ».\n" +
    "Le gabarit a bougé — corrigez l'ancre dans outils/essais/ordonnanceur.js.");
  return i;
}

/**
 * Extraire l'ordonnanceur d'un gabarit donné.
 *
 * Le chemin est un paramètre pour une seule raison : comparer le moteur du
 * jour à celui d'un commit précédent, ce que fait `simulation.js` en écrivant
 * la version d'avant dans un fichier temporaire. Sans cela, « ce que faisait
 * la version précédente » serait ce que j'en dis, et non ce qu'elle fait.
 */
function depuis(chemin){
const lignes = fs.readFileSync(chemin || GABARIT, "utf8").split("\n");
/* On part du premier des réglages de la congestion, non de la courbe : les
   genres de ressource et l'interrupteur du lissage la précèdent dans le
   gabarit, et les omettre rendrait un module qui ne compile pas. Les versions
   plus anciennes n'ont que la courbe — d'où le repli. */
const tete = lignes.findIndex(l => l.startsWith("const GENRES_RESSOURCE"));
const peine = tete >= 0 ? tete : ancre(lignes, "const PEINE_CHARGE = [");
/* La dilatation n'existe pas dans toutes les versions qu'on peut extraire :
   une ancre absente rend -1, et le morceau est simplement omis. */
const dilat = lignes.findIndex(l => l.startsWith("const DILATATION = ["));
const dilatFin = lignes.findIndex(l => l.startsWith("function dilatationDuJour("));
const ecart = ancre(lignes, "function ecartDesJours(");
const range = ancre(lignes, "function rangeSejour(");
const tranche = ancre(lignes, "const TRANCHES_JOUR = ");
const fin = ancre(lignes, "  return restants;");

const source = [
  /* Le poids de l'équilibre entre les jours, que `rangeSejour` lit chez lui. */
  "const EQUILIBRE = 4;",
  lignes.slice(peine, ecart).join("\n"),
  lignes.slice(ecart, range).join("\n"),
  lignes.slice(tranche, tranche + 4).join("\n"),
  lignes.slice(range, fin + 2).join("\n"),
  /* La dilatation : sa table et son interpolation, sans `dilatationDuJour`
     qui, lui, lit la charge servie à la page et n'a pas de sens hors d'elle. */
  (dilat >= 0 && dilatFin > dilat ? lignes.slice(dilat, dilatFin).join("\n") : ""),
  "module.exports = { rangeSejour, trancheDe, peineDeCharge, PEINE_CHARGE," +
  " PEINE_MAX, SEUIL_PEINE," +
  (dilat >= 0 ? " DILATATION, dilatationPour, TRANCHES_MINI," : "") +
  /* De quoi mesurer le lissage contre son absence, sur le même moteur : le
     comparer d'une version à l'autre mêlerait deux changements. */
  (lignes.some(l => l.startsWith("let LISSAGE_CHARGE"))
    ? " poseLissage: (v) => { LISSAGE_CHARGE = v; }," : "") + " };",
].join("\n");

const m = new Module("ordonnanceur-extrait", module);
m._compile(source, chemin || GABARIT);
return m.exports;
}

module.exports = depuis();
module.exports.depuis = depuis;
