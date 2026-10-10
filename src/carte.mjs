/**
 * Ramener une position du script minifié à sa source.
 *
 * Le plan part minifié (`outils/modules.js`), avec sa carte de
 * correspondance posée à côté de lui. Une erreur remontée par une page dit
 * « plan.ba68e5bd86.js, ligne 1, colonne 182 345 » : rien qu'on puisse lire.
 * La carte sait que cette colonne est la ligne 132 de `modules/fiche.mjs`.
 *
 * Lue par le Worker quand une erreur arrive (`index.mjs` `erreur`), et non
 * plus tard dans la console : chaque construction efface les scripts et les
 * cartes d'avant, si bien que la carte d'une erreur n'existe que tant que sa
 * version est en ligne. Éprouvé seul par `outils/essais/carte.js`.
 *
 * Seules les lignes du format qui servent sont lues : `sources` et
 * `mappings`, en quantités variables à la base 64 (VLQ), la norme de la
 * version 3 des cartes. Les noms (`names`) ne disent rien de plus qu'un
 * numéro de ligne, et la carte ne porte pas les sources.
 */
const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const VALEUR = new Map([...B64].map((c, i) => [c, i]));

/** Les nombres d'un segment, chacun en une ou plusieurs lettres de cinq bits. */
function nombres(segment) {
  const r = [];
  let v = 0, decalage = 0;
  for (const c of segment) {
    const d = VALEUR.get(c);
    if (d === undefined) return null;
    v += (d & 31) << decalage;
    if (d & 32) { decalage += 5; continue; }
    r.push(v & 1 ? -(v >>> 1) : v >>> 1);
    v = 0; decalage = 0;
  }
  return r;
}

/**
 * Les segments de chaque ligne du script, rangés par colonne :
 * `[colonne, source, ligne d'origine]`, les deux dernières à compter de zéro.
 * Les valeurs d'une carte sont des écarts au segment précédent ; seule la
 * colonne repart de zéro à chaque ligne du script.
 */
export function lisCarte(carte) {
  const lignes = [];
  let source = 0, ligne = 0;
  for (const texte of String(carte.mappings || "").split(";")) {
    const segments = [];
    let colonne = 0;
    if (texte) for (const s of texte.split(",")) {
      const v = nombres(s);
      if (!v || !v.length) continue;
      colonne += v[0];
      if (v.length < 4) continue;
      source += v[1]; ligne += v[2];
      segments.push([colonne, source, ligne]);
    }
    lignes.push(segments);
  }
  return { sources: carte.sources || [], lignes };
}

/**
 * La source d'une position du script (ligne comptée de un, colonne de zéro) :
 * `{ fichier, ligne }`, la ligne comptée de un — ou `null` si la carte ne la
 * couvre pas. Le segment retenu est le dernier qui commence avant la colonne :
 * c'est lui qui la couvre.
 */
export function source(lue, ligne, colonne) {
  const segments = lue.lignes[ligne - 1];
  if (!segments || !segments.length) return null;
  let bas = 0, haut = segments.length - 1, trouve = -1;
  while (bas <= haut) {
    const m = (bas + haut) >> 1;
    if (segments[m][0] <= colonne) { trouve = m; bas = m + 1; } else haut = m - 1;
  }
  if (trouve < 0) return null;
  const [, s, l] = segments[trouve];
  const fichier = String(lue.sources[s] || "")
    // la carte nomme ses fichiers depuis le dossier du script ; le dépôt, depuis sa racine
    .replace(/^(\.\.\/)+/, "").replace(/^outils\/gabarit\//, "");
  return fichier ? { fichier, ligne: l + 1 } : null;
}
