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

const lignes = fs.readFileSync(GABARIT, "utf8").split("\n");
const peine = ancre(lignes, "const PEINE_CHARGE = [");
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
  "module.exports = { rangeSejour, trancheDe, peineDeCharge, PEINE_CHARGE, PEINE_MAX, SEUIL_PEINE };",
].join("\n");

const m = new Module("ordonnanceur-extrait", module);
m._compile(source, GABARIT);
module.exports = m.exports;
