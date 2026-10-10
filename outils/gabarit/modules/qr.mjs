/* ============================================================
   Le code QR, sans bibliothèque

   Une bibliothèque de plus pour une fonction de plus : le dépôt écrit déjà ses
   propres fichiers Excel (`modules/classeur.mjs`) pour ne pas en dépendre, et un
   encodeur QR tient en moins de place qu'un classeur — la norme est fixée
   depuis 2006 et ne bougera pas.

   Un seul mode, un seul niveau de correction, et c'est assez ici : le mode
   octet accepte n'importe quelle adresse sans avoir à la mettre en majuscules,
   et le niveau M rattrape 15 % du code — ce qu'il faut pour un écran, où la
   gêne n'est pas la saleté mais le reflet et le moiré de la photographie.
   Le niveau L aurait tenu un peu plus court sans jamais faire descendre d'une
   version : le gain n'aurait pas été visible, la tolérance perdue, si.

   Rien du plan n'entre ici : des octets en entrée, un damier en sortie. Le
   parcours partagé (`modules/partage.mjs`) et l'affiche « Vous êtes ici »
   (`modules/affiche-ici.mjs`) s'en servent.
   ============================================================ */
import { esc } from "./texte.mjs";

/* Par version (1 à 40) : mots de correction par bloc, et nombre de blocs.
   Ce sont les deux colonnes « niveau M » des tables de la norme. */
const QR_ECC = [10,16,26,18,24,16,18,22,22,26,30,22,22,24,24,28,28,26,26,26,
                26,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28];
const QR_BLOCS = [1,1,1,2,2,4,4,4,5,5,5,8,9,9,10,10,11,13,14,16,
                  17,17,18,20,21,23,25,26,28,29,31,33,35,37,38,40,43,45,47,49];

/* Au-delà, le code se lit encore mais plus à bout de bras : 97 modules sur les
   trois centimètres d'un téléphone tenu par un autre, c'est la limite de ce
   qu'un appareil photo distingue. La fenêtre le dit plutôt que d'afficher un
   damier que personne n'arrive à scanner. */
export const QR_VERSION_LISIBLE = 20;

/** Combien de mots de huit bits tient une version, correction comprise. */
function qrMotsBruts(v){
  let n = (16 * v + 128) * v + 64;
  if (v >= 2){
    const a = Math.floor(v / 7) + 2;
    n -= (25 * a - 10) * a - 55;      // les motifs d'alignement
    if (v >= 7) n -= 36;              // les deux copies du numéro de version
  }
  return n >> 3;
}
const qrMotsUtiles = v => qrMotsBruts(v) - QR_ECC[v - 1] * QR_BLOCS[v - 1];

/* Le corps fini à 256 éléments dans lequel se calcule la correction d'erreur.
   Deux tables une fois pour toutes : la multiplication y devient une addition
   d'exposants, ce qui est tout l'intérêt. */
const QR_EXP = new Uint8Array(512), QR_LOG = new Uint8Array(256);
for (let i = 0, x = 1; i < 255; i++){
  QR_EXP[i] = x; QR_LOG[x] = i;
  x = (x << 1) ^ ((x >> 7) * 0x11D);  // polynôme générateur de la norme
}
for (let i = 255; i < 512; i++) QR_EXP[i] = QR_EXP[i - 255];
const qrMul = (a, b) => (a && b) ? QR_EXP[QR_LOG[a] + QR_LOG[b]] : 0;

/** Le polynôme générateur de degré `n`, développé par récurrence. */
function qrGenerateur(n){
  let g = [1];
  for (let i = 0; i < n; i++){
    const h = g.concat(0);
    for (let j = 0; j < g.length; j++) h[j + 1] ^= qrMul(g[j], QR_EXP[i]);
    g = h;
  }
  return g;
}

/** Les mots de correction d'un bloc : le reste de sa division polynomiale. */
function qrReste(bloc, n){
  const g = qrGenerateur(n), r = new Uint8Array(n);
  for (const mot of bloc){
    const f = mot ^ r[0];
    r.copyWithin(0, 1); r[n - 1] = 0;
    for (let i = 0; i < n; i++) r[i] ^= qrMul(g[i + 1], f);
  }
  return r;
}

/** Où se posent les motifs d'alignement, en abscisse comme en ordonnée. */
function qrAlignements(v){
  if (v === 1) return [];
  const n = Math.floor(v / 7) + 2, taille = v * 4 + 17;
  // la version 32 est la seule que la formule ne retrouve pas
  const pas = v === 32 ? 26 : Math.ceil((v * 4 + 4) / (n * 2 - 2)) * 2;
  const r = [6];
  for (let p = taille - 7; r.length < n; p -= pas) r.splice(1, 0, p);
  return r;
}

/**
 * La trame du code : un tableau de lignes de 0 et de 1.
 *
 * Cinq temps, dans l'ordre de la norme — le flot de bits, la correction
 * d'erreur, les motifs fixes, les données en zigzag, le masque.
 */
export function qrTrame(octets){
  let v = 1;
  // l'en-tête compte deux octets de plus à partir de la version 10
  while (v <= 40 && qrMotsUtiles(v) * 8 < 4 + (v >= 10 ? 16 : 8) + octets.length * 8) v++;
  if (v > 40) return null;
  const taille = v * 4 + 17;

  /* --- le flot de bits, puis les mots de huit bits --- */
  const bits = [];
  const pousse = (val, n) => { for (let i = n - 1; i >= 0; i--) bits.push((val >>> i) & 1); };
  pousse(4, 4);                                   // mode octet
  pousse(octets.length, v >= 10 ? 16 : 8);
  for (const o of octets) pousse(o, 8);
  pousse(0, Math.min(4, qrMotsUtiles(v) * 8 - bits.length));   // terminateur
  while (bits.length % 8) bits.push(0);
  const donnees = [];
  for (let i = 0; i < bits.length; i += 8)
    donnees.push(bits.slice(i, i + 8).reduce((a, b) => a * 2 + b, 0));
  // le remplissage imposé par la norme, jusqu'à la capacité de la version
  for (let p = 0xEC; donnees.length < qrMotsUtiles(v); p ^= 0xEC ^ 0x11) donnees.push(p);

  /* --- blocs, correction, entrelacement --- */
  const nb = QR_BLOCS[v - 1], ne = QR_ECC[v - 1];
  const court = Math.floor(donnees.length / nb), courts = nb - donnees.length % nb;
  const blocs = [], corrections = [];
  for (let b = 0, i = 0; b < nb; b++){
    const n = court + (b < courts ? 0 : 1);
    blocs.push(donnees.slice(i, i + n)); i += n;
    corrections.push(qrReste(blocs[b], ne));
  }
  /* Les blocs s'entremêlent mot à mot : une éraflure abîme alors un mot de
     chacun plutôt que d'emporter un bloc entier, que rien ne rattraperait. */
  const mots = [];
  for (let j = 0; j <= court; j++)
    for (let b = 0; b < nb; b++) if (j < blocs[b].length) mots.push(blocs[b][j]);
  for (let j = 0; j < ne; j++)
    for (let b = 0; b < nb; b++) mots.push(corrections[b][j]);

  /* --- les motifs que le lecteur cherche en premier --- */
  const m = [], fixe = [];
  for (let y = 0; y < taille; y++){
    m.push(new Uint8Array(taille)); fixe.push(new Uint8Array(taille));
  }
  const pose = (x, y, val) => {
    if (x >= 0 && y >= 0 && x < taille && y < taille){ m[y][x] = val; fixe[y][x] = 1; }
  };
  // les trois cibles des coins, avec leur séparateur blanc
  const cible = (cx, cy) => {
    for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++){
      const d = Math.max(Math.abs(dx), Math.abs(dy));
      pose(cx + dx, cy + dy, d !== 2 && d <= 3 ? 1 : 0);
    }
  };
  cible(3, 3); cible(taille - 4, 3); cible(3, taille - 4);
  // les deux lignes de synchronisation, un module sur deux
  for (let k = 8; k < taille - 8; k++){
    const b = (k % 2) ^ 1;
    pose(6, k, b); pose(k, 6, b);
  }
  const al = qrAlignements(v);
  al.forEach(cy => al.forEach(cx => {
    // les trois qui tomberaient sur une cible de coin n'existent pas
    if ((cx === 6 && cy === 6) || (cx === 6 && cy === taille - 7) ||
        (cx === taille - 7 && cy === 6)) return;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++)
      pose(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1 ? 1 : 0);
  }));
  /* La place du format est réservée avant les données — sans quoi elles s'y
     écriraient. La case 6 en est exclue : elle appartient à la ligne de
     synchronisation, qui la traverse. */
  for (let k = 0; k <= 8; k++) if (k !== 6){ pose(k, 8, 0); pose(8, k, 0); }
  // le format est écrit deux fois : sa seconde copie longe les deux autres cibles
  for (let k = 0; k < 8; k++){ pose(taille - 1 - k, 8, 0); pose(8, taille - 1 - k, 0); }
  pose(8, taille - 8, 1);                          // le module toujours noir
  if (v >= 7){
    let r = v;
    for (let k = 0; k < 12; k++) r = (r << 1) ^ ((r >>> 11) * 0x1F25);
    const num = (v << 12) | r;
    for (let k = 0; k < 18; k++){
      const b = (num >>> k) & 1;
      pose(Math.floor(k / 3), taille - 11 + k % 3, b);
      pose(taille - 11 + k % 3, Math.floor(k / 3), b);
    }
  }

  /* --- les données, en zigzag depuis le coin bas droit --- */
  let ib = 0;
  const bitSuivant = () => {
    const b = ib < mots.length * 8 ? (mots[ib >> 3] >>> (7 - (ib & 7))) & 1 : 0;
    ib++;
    return b;
  };
  for (let droite = taille - 1; droite >= 1; droite -= 2){
    if (droite === 6) droite = 5;                  // la colonne de synchronisation se saute
    for (let k = 0; k < taille; k++) for (let c = 0; c < 2; c++){
      const x = droite - c;
      const y = ((droite + 1) & 2) === 0 ? taille - 1 - k : k;
      if (!fixe[y][x]) m[y][x] = bitSuivant();
    }
  }

  /* --- le masque : celui des huit qui déplaît le moins --- */
  const MASQUES = [
    (x, y) => (x + y) % 2 === 0,
    (x, y) => y % 2 === 0,
    (x, y) => x % 3 === 0,
    (x, y) => (x + y) % 3 === 0,
    (x, y) => (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0,
    (x, y) => (x * y) % 2 + (x * y) % 3 === 0,
    (x, y) => ((x * y) % 2 + (x * y) % 3) % 2 === 0,
    (x, y) => ((x + y) % 2 + (x * y) % 3) % 2 === 0,
  ];
  // appliqué deux fois, un masque s'annule : c'est ce qui permet de les essayer
  const applique = k => {
    for (let y = 0; y < taille; y++) for (let x = 0; x < taille; x++)
      if (!fixe[y][x] && MASQUES[k](x, y)) m[y][x] ^= 1;
  };
  const poseFormat = k => {
    let r = k;                                     // niveau M : deux bits nuls en tête
    for (let i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537);
    const f = ((k << 10) | r) ^ 0x5412;
    for (let i = 0; i <= 5; i++) m[i][8] = (f >>> i) & 1;
    m[7][8] = (f >>> 6) & 1; m[8][8] = (f >>> 7) & 1; m[8][7] = (f >>> 8) & 1;
    for (let i = 9; i < 15; i++) m[8][14 - i] = (f >>> i) & 1;
    for (let i = 0; i < 8; i++) m[8][taille - 1 - i] = (f >>> i) & 1;
    for (let i = 8; i < 15; i++) m[taille - 15 + i][8] = (f >>> i) & 1;
  };
  /* Les quatre pénalités de la norme : les longues plages d'une même couleur,
     les carrés uniformes, tout ce qui ressemble à une cible de coin — c'est la
     plus lourde, elle égarerait le lecteur — et le déséquilibre entre noir et
     blanc. */
  const penalite = () => {
    let p = 0;
    const plage = lit => {
      let n = 1;
      for (let i = 1; i < taille; i++){
        if (lit(i) === lit(i - 1)) n++;
        else { if (n >= 5) p += n - 2; n = 1; }
      }
      if (n >= 5) p += n - 2;
    };
    for (let y = 0; y < taille; y++) plage(x => m[y][x]);
    for (let x = 0; x < taille; x++) plage(y => m[y][x]);
    for (let y = 0; y < taille - 1; y++) for (let x = 0; x < taille - 1; x++)
      if (m[y][x] === m[y][x + 1] && m[y][x] === m[y + 1][x] &&
          m[y][x] === m[y + 1][x + 1]) p += 3;
    // une fenêtre de onze modules : 00001011101 et son miroir
    const cible = lit => {
      let f = 0;
      for (let i = 0; i < taille; i++){
        f = ((f << 1) & 0x7FF) | lit(i);
        if (i >= 10 && (f === 0x05D || f === 0x5D0)) p += 40;
      }
    };
    for (let y = 0; y < taille; y++) cible(x => m[y][x]);
    for (let x = 0; x < taille; x++) cible(y => m[y][x]);
    let noirs = 0;
    for (let y = 0; y < taille; y++) for (let x = 0; x < taille; x++) noirs += m[y][x];
    const total = taille * taille;
    p += Math.floor(Math.abs(noirs * 20 - total * 10) / total) * 10;
    return p;
  };
  let choisi = 0, score = Infinity;
  for (let k = 0; k < 8; k++){
    applique(k); poseFormat(k);
    const s = penalite();
    applique(k);
    if (s < score){ score = s; choisi = k; }
  }
  applique(choisi); poseFormat(choisi);
  return m;
}

/**
 * La trame en SVG.
 *
 * Noir sur blanc, quelles que soient les couleurs de la page : le code n'est
 * pas une illustration, il
 * doit se photographier. Une marge de quatre modules l'entoure — le lecteur en
 * a besoin pour trouver les bords, et l'oublier est la panne la plus courante.
 *
 * Un seul tracé, par plages horizontales, plutôt qu'un rectangle par module :
 * un code dense en compte plusieurs milliers, et autant d'éléments dans le
 * document se paierait à chaque redessin.
 *
 * Le tracé se rend à part de l'image qui l'encadre : l'affiche d'un code
 * « Vous êtes ici » le pose dans une feuille A4, à côté de son texte, et
 * n'avait que faire d'un second `<svg>` à l'intérieur du premier.
 */
export function qrChemin(m){
  const q = 4, n = m.length;
  let d = "";
  for (let y = 0; y < n; y++){
    for (let x = 0; x < n; x++){
      if (!m[y][x]) continue;
      let l = 1;
      while (x + l < n && m[y][x + l]) l++;
      d += "M" + (x + q) + " " + (y + q) + "h" + l + "v1h-" + l + "z";
      x += l;
    }
  }
  return { d: d, cote: n + 2 * q };
}

/**
 * Le même damier, en une image à poser dans la page.
 *
 * L'étiquette se dit à l'appel : le code du parcours et celui d'un endroit du
 * salon (voir `affiche-ici.mjs`) n'ouvrent pas la même chose, et c'est la seule
 * phrase qu'un lecteur d'écran aura de l'un ou de l'autre.
 */
export function qrSvg(m, etiquette){
  const t = qrChemin(m);
  return '<svg viewBox="0 0 ' + t.cote + ' ' + t.cote + '" shape-rendering="crispEdges" ' +
    'role="img" aria-label="' + esc(traduit(etiquette ||
      "Code à photographier qui ouvre ce parcours")) + '">' +
    '<rect width="' + t.cote + '" height="' + t.cote + '" fill="#fff"/>' +
    '<path d="' + t.d + '" fill="#000"/></svg>';
}
