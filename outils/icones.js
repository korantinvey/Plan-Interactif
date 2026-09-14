/**
 * L'icône de l'application, dessinée par le code plutôt que déposée en image.
 *
 * Une application installée demande une icône, et pas une seule : Android en
 * veut une carrée qu'il masquera lui-même, iOS une carrée pleine, le navigateur
 * une vectorielle pour l'onglet. Les livrer en binaire, c'était quatre fichiers
 * qu'aucune source ne décrit, qu'on ne peut ni relire ni corriger sans un
 * éditeur d'images — et qui se démentent l'un l'autre dès la première retouche.
 *
 * Le dessin est donc décrit une fois, en coordonnées de 0 à 100, et chaque
 * sortie n'est qu'une façon de le poser : plus ou moins réduit selon ce que le
 * système rognera, un fond arrondi ou carré selon qu'il applique ou non son
 * propre masque.
 *
 * **Ce que la marque raconte.** Un bloc plein, les lettres du monogramme
 * évidées dedans — E2M pour Event2Map. Le 2 ne peut pas être simplement peint
 * en rose sur le bloc : le rose et le cyan de la palette ont presque la même
 * clarté (1,6 pour 1, l'œil ne les sépare pas). Il reçoit donc sa propre
 * réserve, creusée dans le bloc, où le rose remonte à 5,2 pour 1 sans qu'on ait
 * touché à la couleur. Derrière le bloc, deux allées et un repère : le plan
 * passe dessous, il n'entoure pas — c'est ce qui le fait lire comme un fond
 * plutôt que comme un cadre décoratif.
 *
 * **Deux marques, pas une.** Trois signes dans un carré de seize pixels, cela
 * n'existe pas : à cette taille une capitale fait quatre pixels de large. La
 * marque complète sert donc à partir de 32 px — manifeste, écran d'accueil,
 * touche iOS — et l'onglet reçoit une marque réduite. Elle n'est pas le
 * monogramme rogné : un chiffre seul dans un carré de couleur a la forme d'un
 * compteur de notifications, et l'onglet avait l'air d'annoncer deux messages
 * non lus. Ce qui reste est donc l'autre moitié du dessin, celle que le bloc
 * couvrait — les allées et le repère posé dessus. Le monogramme tombe, le
 * plan remonte : à seize pixels, une forme vaut mieux qu'une lettre.
 *
 * Le rendu se fait en deux temps : le dessin est échantillonné seize fois par
 * pixel, ce qui adoucit les bords, puis encodé en PNG à la main — l'encodage
 * tient en trente lignes et évite une dépendance de plus pour quatre images.
 * Il est déterministe : deux constructions d'un même dessin donnent le même
 * octet, sans quoi `npm run verifie` verrait bouger `web/` à chaque appel.
 */
const zlib = require("zlib");

/* Les tons de la marque : la nuit du fond, le cyan du bloc, le rose du chiffre,
   et le cyan rabattu du plan qui passe derrière. Ce dernier n'est pas le cyan
   vif : à valeur égale il rivaliserait avec le bloc, et l'icône deviendrait
   illisible en petit. */
const NUIT = [0x07, 0x1f, 0x3a];
const CYAN = [0x35, 0xc2, 0xff];
const ROSE = [0xff, 0x4d, 0x6d];
const PLAN = [0x1b, 0x5b, 0x84];

/* ------------------------------------------------------------------
   Les lettres

   Elles ne sont pas construites en barres : un caractère a des pleins et des
   déliés, des angles rentrés, des contreformes calculées, et aucune grille de
   rectangles ne rattrape cela. Ce sont donc les vraies courbes d'Archivo 800 —
   la police des titres du produit — figées ici en tracés, une fois pour
   toutes. Les figer plutôt que les composer a deux raisons : la construction
   ne télécharge rien, et un logo se retouche à la main après coup, ce qu'un
   texte composé au vol interdirait.

   Pour les régénérer après un changement de graisse ou de chasse :
   la police en TTF (`fonts.googleapis.com/css?family=Archivo:800` répond en
   TTF à un vieux navigateur), puis `opentype.js` — `glyph.getPath(x, base,
   corps).toPathData(3)`. Composition d'ici : capitale 16, chasse resserrée de
   1,5, ligne de base à 60, le tout centré sur 50.
   ------------------------------------------------------------------ */
const LETTRE_E =
  "M37.585 60L24.197 60L24.197 43.977L37.421 43.977L37.421 47.242L28.372 47.242" +
  "L28.372 50.251L36.278 50.251L36.278 53.446L28.372 53.446L28.372 56.735L37.585 56.735";

const LETTRE_2 =
  "M53.685 60L41.370 60L41.370 59.044Q41.370 58.017 41.767 57.155Q42.163 56.292 42.840 55.545" +
  "Q43.516 54.799 44.344 54.111Q45.172 53.423 46.012 52.793Q46.968 52.093 47.808 51.440" +
  "Q48.647 50.787 49.172 50.064Q49.697 49.341 49.697 48.455Q49.697 47.988 49.475 47.557" +
  "Q49.254 47.125 48.776 46.845Q48.297 46.566 47.504 46.566Q46.711 46.566 46.175 46.857" +
  "Q45.638 47.149 45.359 47.662Q45.079 48.175 45.079 48.875L45.079 49.574L41.534 49.574" +
  "Q41.510 49.434 41.499 49.259Q41.487 49.085 41.487 48.851Q41.487 47.172 42.257 46.029" +
  "Q43.026 44.886 44.437 44.292Q45.848 43.697 47.808 43.697Q49.300 43.697 50.385 44.093" +
  "Q51.469 44.490 52.169 45.166Q52.869 45.843 53.207 46.694Q53.545 47.545 53.545 48.455" +
  "Q53.545 49.551 53.149 50.437Q52.752 51.324 52.052 52.105Q51.353 52.886 50.420 53.598" +
  "Q49.487 54.309 48.414 55.032Q47.878 55.405 47.446 55.720Q47.015 56.035 46.758 56.268" +
  "Q46.501 56.501 46.385 56.688L53.685 56.688";

const LETTRE_M =
  "M61.832 60L58.031 60L58.031 43.977L64.118 43.977L66.054 51.114Q66.171 51.487 66.334 52.128" +
  "Q66.497 52.770 66.660 53.469Q66.824 54.169 66.940 54.729L67.127 54.729Q67.220 54.286 67.360 53.668" +
  "Q67.500 53.050 67.663 52.362Q67.827 51.673 67.966 51.090L69.926 43.977L75.850 43.977L75.850 60" +
  "L71.792 60L71.792 53.166Q71.792 52.163 71.803 51.137Q71.815 50.111 71.838 49.271" +
  "Q71.862 48.431 71.862 48.058L71.675 48.058Q71.605 48.408 71.453 49.073Q71.302 49.738 71.127 50.449" +
  "Q70.952 51.160 70.812 51.673L68.480 60L65.121 60L62.765 51.673Q62.649 51.207 62.485 50.554" +
  "Q62.322 49.901 62.171 49.224Q62.019 48.548 61.902 48.082L61.716 48.082Q61.739 48.688 61.762 49.563" +
  "Q61.786 50.437 61.809 51.382Q61.832 52.327 61.832 53.166";

/* ------------------------------------------------------------------
   Les tracés, ramenés à des polygones

   Le test « ce point est-il dans la lettre ? » se fait sur des segments, pas
   sur des courbes : chaque quadratique est donc découpée en droites, une fois,
   au chargement. Le nombre de morceaux suit la longueur de la corde plutôt
   qu'une constante — une courbe de deux unités n'a pas besoin d'autant de
   segments qu'une de vingt — et reste déterminé par le tracé seul, sans quoi
   deux constructions ne donneraient pas le même octet.
   ------------------------------------------------------------------ */
const NOMBRES = /-?\d*\.?\d+(?:e[-+]?\d+)?/gi;

function morceaux(x0, y0, x1, y1) {
  const l = Math.hypot(x1 - x0, y1 - y0);
  return Math.min(24, Math.max(3, Math.ceil(l / 0.4)));
}

/** Un tracé SVG (M, L, Q, Z absolus) rendu en listes de sommets plates. */
function contours(d) {
  const sortie = [];
  let pts = null, x = 0, y = 0;
  for (const [, lettre, corps] of d.matchAll(/([MLQZ])([^MLQZ]*)/gi)) {
    const n = (corps.match(NOMBRES) || []).map(Number);
    switch (lettre.toUpperCase()) {
      case "M":
        if (pts && pts.length >= 6) sortie.push(pts);
        pts = [n[0], n[1]];
        x = n[0]; y = n[1];
        break;
      case "L":
        for (let i = 0; i < n.length; i += 2) { pts.push(n[i], n[i + 1]); x = n[i]; y = n[i + 1]; }
        break;
      case "Q":
        for (let i = 0; i < n.length; i += 4) {
          const [cx, cy, ex, ey] = [n[i], n[i + 1], n[i + 2], n[i + 3]];
          const k = morceaux(x, y, ex, ey);
          for (let s = 1; s <= k; s++) {
            const t = s / k, u = 1 - t;
            pts.push(u * u * x + 2 * u * t * cx + t * t * ex,
                     u * u * y + 2 * u * t * cy + t * t * ey);
          }
          x = ex; y = ey;
        }
        break;
      case "Z":
        break;                       // la fermeture est implicite au test
    }
  }
  if (pts && pts.length >= 6) sortie.push(pts);
  return sortie;
}

/**
 * Un point est-il dans le tracé ? Règle du non-nul : on compte les fois où un
 * segment croise l'horizontale du point, un tour dans un sens annulant un tour
 * dans l'autre. C'est ce qui creuse le ventre du 2 sans qu'on ait à dire nulle
 * part quel contour est un trou.
 */
function dansTrace(cs, x, y) {
  let tours = 0;
  for (const p of cs) {
    for (let i = 0, n = p.length; i < n; i += 2) {
      const x1 = p[i], y1 = p[i + 1];
      const j = (i + 2) % n, x2 = p[j], y2 = p[j + 1];
      const cote = (x2 - x1) * (y - y1) - (x - x1) * (y2 - y1);
      if (y1 <= y) { if (y2 > y && cote > 0) tours++; }
      else if (y2 <= y && cote < 0) tours--;
    }
  }
  return tours !== 0;
}

/**
 * Un point est-il dans ce rectangle aux angles arrondis ? Le point est ramené
 * au rectangle intérieur — celui que les arrondis n'entament pas — et l'on
 * mesure la distance qui les sépare : elle ne dépasse le rayon que dans un
 * angle rogné. Un rayon nul retombe sur le test rectangulaire ordinaire.
 */
function dansCarre(x, y, x0, y0, w, h, r) {
  if (x < x0 || y < y0 || x > x0 + w || y > y0 + h) return false;
  const cx = Math.min(Math.max(x, x0 + r), x0 + w - r);
  const cy = Math.min(Math.max(y, y0 + r), y0 + h - r);
  return (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
}

/* Les trois sortes de formes, décrites à l'identique pour le pixel et pour le
   vecteur : c'est ce qui garantit que le SVG d'onglet et les PNG montrent la
   même chose. */
const carre = (x, y, w, h, r, c) => ({ genre: "carre", x, y, w, h, r, c });
const disque = (cx, cy, r, c) => ({ genre: "disque", cx, cy, r, c });
const trace = (d, c) => ({ genre: "trace", d, cs: contours(d), c });

function dedans(f, x, y) {
  if (f.genre === "carre") return dansCarre(x, y, f.x, f.y, f.w, f.h, f.r);
  if (f.genre === "disque") return (x - f.cx) ** 2 + (y - f.cy) ** 2 <= f.r * f.r;
  return dansTrace(f.cs, x, y);
}

/* ------------------------------------------------------------------
   La marque

   Les formes sont rangées de la plus haute à la plus basse : le premier qui
   contient le point donne sa couleur. Le 2 avant sa réserve, la réserve avant
   le bloc, le bloc avant le plan.
   ------------------------------------------------------------------ */
const MARQUE = [
  trace(LETTRE_2, ROSE),
  carre(39, 38, 17.1, 28, 5, NUIT),        // la réserve où le rose se lit
  trace(LETTRE_E, NUIT),
  trace(LETTRE_M, NUIT),
  carre(17, 17, 66, 66, 14, CYAN),         // le bloc
  disque(92, 50, 5, ROSE),                 // le repère, posé sur un bord
  carre(0, 48, 100, 4, 0, PLAN),           // les deux allées, derrière le bloc
  carre(48, 0, 4, 100, 0, PLAN),
];

/**
 * La marque réduite : les allées et le repère, que le bloc couvrait.
 *
 * Le repère est un disque et une pointe plutôt qu'un tracé d'un seul tenant :
 * deux formes que la règle du non-nul recolle sans qu'on ait à les coudre, et
 * dont l'une se déplace sans qu'il faille redessiner l'autre. Son creux prend
 * la couleur du fond et non celle du bloc, pour la raison qui valait déjà à la
 * marque complète : sur du cyan, le rose ne se détache pas.
 *
 * Les allées sont ici vives et non rabattues comme sous le bloc — plus rien ne
 * passe devant elles, elles portent seules le cyan de la marque.
 */
const REDUITE = [
  disque(50, 40, 10, NUIT),                            // le creux du repère
  disque(50, 40, 26, ROSE),
  trace("M32.06 58.72L67.94 58.72L50 90.70Z", ROSE),   // sa pointe
  carre(0, 44, 100, 12, 0, CYAN),                      // les allées, à découvert
  carre(44, 0, 12, 100, 0, CYAN),
];

/**
 * Les trois façons de poser le dessin.
 *
 * `echelle` réduit la marque autour du centre. Elle n'est pas décorative :
 * Android ne garde d'une icône « maskable » que le disque central — quatre-
 * vingts pour cent du côté — et rogne le reste sans prévenir. Le bloc, dont
 * les angles sont à quarante-sept unités du centre, y perdait ses coins.
 */
const POSES = {
  // l'icône ordinaire porte elle-même ses angles arrondis
  ronde: { rayon: 22, echelle: 1 },
  // Android pose son masque par-dessus : le fond remplit le carré, la marque rentre
  masquable: { rayon: 0, echelle: 0.85 },
  // iOS arrondit aussi lui-même, et ne rogne rien de plus
  pomme: { rayon: 0, echelle: 1 },
};

/** La couleur du dessin en ce point, ou `null` hors de l'icône. */
function couleur(x, y, pose, marque) {
  const ax = (x - 50) / pose.echelle + 50;
  const ay = (y - 50) / pose.echelle + 50;
  for (const f of marque) if (dedans(f, ax, ay)) return f.c;
  return dansCarre(x, y, 0, 0, 100, 100, pose.rayon) ? NUIT : null;
}

/* Seize échantillons par pixel : au-dessous, les arrondis de l'icône de 192 px
   marchent visiblement en escalier. */
const ECHANTILLONS = 4;

/** Les octets RVBA de l'icône, ligne par ligne. */
function rvba(taille, nom) {
  const pose = POSES[nom];
  const out = Buffer.alloc(taille * taille * 4);
  for (let j = 0; j < taille; j++) {
    for (let i = 0; i < taille; i++) {
      let r = 0, v = 0, b = 0, couvert = 0;
      for (let sj = 0; sj < ECHANTILLONS; sj++) {
        for (let si = 0; si < ECHANTILLONS; si++) {
          const c = couleur(
            ((i + (si + 0.5) / ECHANTILLONS) / taille) * 100,
            ((j + (sj + 0.5) / ECHANTILLONS) / taille) * 100,
            pose, MARQUE);
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

/* ------------------------------------------------------------------
   Les sorties vectorielles

   Le même dessin, décrit en formes plutôt qu'en pixels — une icône se lit
   aussi à seize pixels, où le tracé vaut mieux que l'échantillonnage.
   ------------------------------------------------------------------ */
const teinte = (n) => "#" + n.map((v) => v.toString(16).padStart(2, "0")).join("");

function forme(f) {
  const c = ' fill="' + teinte(f.c) + '"/>';
  if (f.genre === "carre") {
    return '<rect x="' + f.x + '" y="' + f.y + '" width="' + f.w + '" height="' + f.h +
      (f.r ? '" rx="' + f.r : "") + '"' + c;
  }
  if (f.genre === "disque") {
    return '<circle cx="' + f.cx + '" cy="' + f.cy + '" r="' + f.r + '"' + c;
  }
  return '<path d="' + f.d + '"' + c;
}

function dessin(marque, titre) {
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" role="img" aria-label="' + titre + '">',
    '<rect width="100" height="100" rx="22" fill="' + teinte(NUIT) + '"/>',
    ...[...marque].reverse().map(forme),   // du fond vers le dessus, cette fois
    "</svg>",
    "",
  ].join("\n");
}

/** La marque complète : celle que le manifeste déclare. */
const svg = () => dessin(MARQUE, "Event2Map");

/** La marque réduite : celle que porte l'onglet, où E et M ne tiendraient pas. */
const svgOnglet = () => dessin(REDUITE, "Event2Map");

module.exports = { png, svg, svgOnglet };
