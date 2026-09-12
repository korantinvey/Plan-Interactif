/**
 * L'icône de l'application, dessinée par le code plutôt que déposée en image.
 *
 * Une application installée demande une icône, et pas une seule : Android en
 * veut une carrée qu'il masquera lui-même, iOS une carrée pleine, le navigateur
 * une vectorielle pour l'onglet. Les livrer en binaire, c'était quatre fichiers
 * qu'aucune source ne décrit, qu'on ne peut ni relire ni corriger sans un
 * éditeur d'images — et qui se démentent l'un l'autre dès la première retouche.
 *
 * Le dessin est donc décrit une fois, en coordonnées de 0 à 1, et chaque sortie
 * n'est qu'une façon de le poser : plus ou moins de marge selon ce que le
 * système rognera, un fond arrondi ou carré selon qu'il applique ou non son
 * propre masque. Les couleurs sont celles du plan — l'accent, la surface, le
 * ton des zones — pour que l'icône appartienne visiblement à la page qu'elle
 * ouvre.
 *
 * Le rendu se fait en deux temps : le dessin est échantillonné seize fois par
 * pixel, ce qui adoucit les bords, puis encodé en PNG à la main — l'encodage
 * tient en trente lignes et évite une dépendance de plus pour quatre images.
 * Il est déterministe : deux constructions d'un même dessin donnent le même
 * octet, sans quoi `npm run verifie` verrait bouger `web/` à chaque appel.
 */
const zlib = require("zlib");

/* Les tons du plan : l'accent, la surface des stands, le ton des zones. */
const FOND = [0x2f, 0x49, 0xd1];
const BLOC = [0xfb, 0xfb, 0xf8];
const REPERE = [0xf0, 0xb4, 0x29];

/**
 * Le motif : quatre blocs séparés par deux allées, dont un en couleur de zone.
 * Des tailles inégales plutôt qu'une grille régulière — une grille régulière
 * dessine un tableau de bord, des blocs inégaux dessinent un plan de salon.
 */
const BLOCS = [
  [0, 0, 0.42, 0.6, BLOC],
  [0.54, 0, 0.46, 0.34, BLOC],
  [0.54, 0.46, 0.46, 0.54, BLOC],
  [0, 0.72, 0.42, 0.28, REPERE],
];

/** Le rayon des blocs, rapporté au motif. */
const RAYON_BLOC = 0.05;

/**
 * Les trois façons de poser le dessin.
 *
 * `marge` est la part du carré laissée au fond seul. Elle n'est pas
 * décorative : Android ne garde d'une icône « maskable » que le disque central
 * — quatre-vingts pour cent du côté — et rogne le reste sans prévenir. Un motif
 * dessiné bord à bord y perdait ses angles.
 */
const POSES = {
  // l'icône ordinaire porte elle-même ses angles arrondis
  ronde: { rayon: 0.22, marge: 0.2 },
  // Android pose son masque par-dessus : le fond doit remplir le carré
  masquable: { rayon: 0, marge: 0.28 },
  // iOS arrondit aussi lui-même, mais rogne moins
  pomme: { rayon: 0, marge: 0.18 },
};

/** Le motif replacé dans le carré, marge comprise. */
function motif(marge) {
  const e = 1 - 2 * marge;
  return BLOCS.map(([x, y, w, h, c]) => [marge + x * e, marge + y * e, w * e, h * e, c]);
}

/**
 * Un point est-il dans ce rectangle aux angles arrondis ? Le point est ramené
 * au rectangle intérieur — celui que les arrondis n'entament pas — et l'on
 * mesure la distance qui les sépare : elle ne dépasse le rayon que dans un
 * angle rogné. Un rayon nul retombe sur le test rectangulaire ordinaire.
 */
function dedans(x, y, [x0, y0, w, h], r) {
  if (x < x0 || y < y0 || x > x0 + w || y > y0 + h) return false;
  const cx = Math.min(Math.max(x, x0 + r), x0 + w - r);
  const cy = Math.min(Math.max(y, y0 + r), y0 + h - r);
  return (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
}

/** La couleur du dessin en ce point, ou `null` hors de l'icône. */
function couleur(x, y, pose, blocs) {
  for (const b of blocs) {
    if (dedans(x, y, b, RAYON_BLOC * (1 - 2 * pose.marge))) return b[4];
  }
  return dedans(x, y, [0, 0, 1, 1], pose.rayon) ? FOND : null;
}

/* Seize échantillons par pixel : au-dessous, les arrondis de l'icône de 192 px
   marchent visiblement en escalier. */
const ECHANTILLONS = 4;

/** Les octets RVBA de l'icône, ligne par ligne. */
function rvba(taille, nom) {
  const pose = POSES[nom];
  const blocs = motif(pose.marge);
  const out = Buffer.alloc(taille * taille * 4);
  for (let j = 0; j < taille; j++) {
    for (let i = 0; i < taille; i++) {
      let r = 0, v = 0, b = 0, couvert = 0;
      for (let sj = 0; sj < ECHANTILLONS; sj++) {
        for (let si = 0; si < ECHANTILLONS; si++) {
          const c = couleur(
            (i + (si + 0.5) / ECHANTILLONS) / taille,
            (j + (sj + 0.5) / ECHANTILLONS) / taille,
            pose, blocs);
          if (!c) continue;
          r += c[0]; v += c[1]; b += c[2]; couvert++;
        }
      }
      const p = (j * taille + i) * 4;
      if (!couvert) continue;   // transparent : les quatre octets sont déjà nuls
      out[p] = Math.round(r / couvert);
      out[p + 1] = Math.round(v / couvert);
      out[p + 2] = Math.round(b / couvert);
      out[p + 3] = Math.round((couvert / (ECHANTILLONS * ECHANTILLONS)) * 255);
    }
  }
  return out;
}

/* ------------------------------------------------------------------
   L'encodage PNG

   Une image PNG est une signature suivie de morceaux, chacun précédé de sa
   longueur et suivi du CRC de son type et de son contenu. Trois morceaux
   suffisent ici : l'en-tête, les pixels compressés, la fin.
   ------------------------------------------------------------------ */
const TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function morceau(type, donnees) {
  const taille = Buffer.alloc(4);
  taille.writeUInt32BE(donnees.length);
  const corps = Buffer.concat([Buffer.from(type, "latin1"), donnees]);
  const somme = Buffer.alloc(4);
  somme.writeUInt32BE(crc32(corps));
  return Buffer.concat([taille, corps, somme]);
}

/** L'icône en PNG, à la taille et dans la pose demandées. */
function png(taille, nom = "ronde") {
  const entete = Buffer.alloc(13);
  entete.writeUInt32BE(taille, 0);
  entete.writeUInt32BE(taille, 4);
  entete[8] = 8;    // huit bits par composante
  entete[9] = 6;    // rouge, vert, bleu, alpha

  /* Chaque ligne est précédée de son filtre. Aucun n'est appliqué : le dessin
     est fait d'aplats, que la compression réduit déjà à presque rien. */
  const pixels = rvba(taille, nom);
  const brut = Buffer.alloc(taille * (taille * 4 + 1));
  for (let j = 0; j < taille; j++) {
    pixels.copy(brut, j * (taille * 4 + 1) + 1, j * taille * 4, (j + 1) * taille * 4);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    morceau("IHDR", entete),
    morceau("IDAT", zlib.deflateSync(brut, { level: 9 })),
    morceau("IEND", Buffer.alloc(0)),
  ]);
}

/**
 * L'icône en SVG : c'est elle que porte l'onglet, tant que le salon ouvert n'a
 * pas déposé la sienne. Le même dessin, décrit en formes plutôt qu'en pixels —
 * une icône d'onglet se lit à seize pixels, où le tracé vaut mieux que
 * l'échantillonnage.
 */
function svg() {
  const pose = POSES.ronde;
  const c = (n) => "#" + n.map((v) => v.toString(16).padStart(2, "0")).join("");
  const n = (v) => Number((v * 100).toFixed(3));
  const r = n(RAYON_BLOC * (1 - 2 * pose.marge));
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" role="img" aria-label="Plan interactif">',
    '<rect width="100" height="100" rx="' + n(pose.rayon) + '" fill="' + c(FOND) + '"/>',
    ...motif(pose.marge).map(([x, y, w, h, t]) =>
      '<rect x="' + n(x) + '" y="' + n(y) + '" width="' + n(w) + '" height="' + n(h) +
      '" rx="' + r + '" fill="' + c(t) + '"/>'),
    "</svg>",
    "",
  ].join("\n");
}

module.exports = { png, svg };
