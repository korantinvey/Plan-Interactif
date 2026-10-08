/**
 * Les pages telles qu'elles partent : sans leurs commentaires.
 *
 * Le dépôt se commente abondamment, et c'est voulu — on y dit pourquoi, pas
 * quoi, et ce pourquoi est ce qui se perd le plus vite. Mais ces explications
 * partaient aussi chez chaque visiteur : près de la moitié du plan public,
 * huit cents kilo-octets que personne ne lit et que tout téléphone
 * téléchargeait avant de dessiner le premier stand. Elles restent dans
 * `outils/gabarit/`, où on les lit ; elles quittent `web/`, où on ne les lit
 * pas.
 *
 * Les scripts et les feuilles de style passent par esbuild, qui les analyse
 * pour de bon : une découpe à la main confondrait tôt ou tard un commentaire
 * avec le `//` d'une adresse dans une chaîne, ou le `/*` d'une expression
 * régulière. Rien d'autre n'y change — ni minification, ni renommage, ni
 * réécriture pour d'anciens navigateurs : le code est réimprimé tel qu'il
 * s'exécute, seulement débarrassé de ce qui ne s'exécute pas.
 *
 * Le balisage perd ses `<!-- … -->`, hors des scripts et des styles, où la
 * même suite de caractères peut être une chaîne.
 */
const esbuild = require("esbuild");

/* Ce qui ne s'imprime pas tel quel : un script tiré d'un fichier, ou qui
   porte des données. Le JSON des données figées n'a pas de commentaire, et
   n'est pas du JavaScript à réimprimer. */
const intouchable = (attributs) =>
  /\bsrc=/.test(attributs) || /type\s*=\s*["']?application\/json/.test(attributs);

function transforme(code, loader, ou) {
  try {
    return esbuild.transformSync(code, {
      loader,
      legalComments: "none",
      /* Les accents tels quels : échappés, chaque « é » des messages
         coûterait six octets au lieu de deux. */
      charset: "utf8",
    }).code;
  } catch (e) {
    throw new Error(ou + " : esbuild refuse ce " + (loader === "css" ? "style" : "script") +
      " — " + (e.errors && e.errors[0] ? e.errors[0].text : e.message));
  }
}

/** La page, ses scripts, ses styles et son balisage sans commentaires. */
function epure(html, nom) {
  const morceau = /<(script|style)([^>]*)>([\s\S]*?)<\/\1>/g;
  let sortie = "", fin = 0, m;
  while ((m = morceau.exec(html))) {
    sortie += sansCommentaires(html.slice(fin, m.index));
    const [entier, balise, attributs, corps] = m;
    if (balise === "script" && (intouchable(attributs) || !corps.trim())) sortie += entier;
    else sortie += "<" + balise + attributs + ">\n" +
      transforme(corps, balise === "style" ? "css" : "js", nom) + "</" + balise + ">";
    fin = m.index + entier.length;
  }
  return sortie + sansCommentaires(html.slice(fin));
}

/* Les commentaires du balisage. Celui qui tient ses lignes à lui seul les
   emporte, sans quoi chacun laisserait une ligne vide derrière lui ; celui qui
   partage la sienne part seul, avec ses seuls caractères : en rognant aussi
   les espaces autour, « a <!-- … --> b » deviendrait « ab ».

   Le corps d'un commentaire ne peut pas contenir « --> » : sans cette borne,
   la première règle, faute de trouver une fin de ligne derrière le premier
   « --> », irait chercher celle du commentaire suivant, et emporterait le
   balisage d'entre les deux. */
const COMMENTAIRE = "<!--(?:(?!-->)[\\s\\S])*-->";
const LIGNES = new RegExp("^[ \\t]*" + COMMENTAIRE + "[ \\t]*\\n", "gm");
const SEUL = new RegExp(COMMENTAIRE, "g");
const sansCommentaires = (t) => t.replace(LIGNES, "").replace(SEUL, "");

module.exports = { epure };
