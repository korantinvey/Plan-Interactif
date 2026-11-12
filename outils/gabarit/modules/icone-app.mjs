/* ============================================================
   L'icône de l'application, fabriquée depuis un logo déposé

   Un module de l'administration : `plan-admin.mjs` l'embarque, le visiteur ne
   le reçoit jamais. Il ne sait rien du salon — un fichier en entrée, deux
   images en sortie —, `reglage-application.mjs` les enregistre.
   ============================================================ */
import { litImage } from "./depot-image.mjs";

/* Ce qu'une icône d'application mesure, et ce que la paire a le droit de
   peser.

   Cinq cent douze pixels : la taille qu'Android demande, et de quoi tenir sur
   un écran d'accueil de forte densité. Les paliers suivants ne servent qu'à
   rattraper un fichier trop lourd — un logo à plat tient largement dans le
   poids, une photographie n'y tient pas, et c'est très bien ainsi : ce qu'on
   dépose ici finit dans un carré d'un centimètre.

   Le poids se compte sur les deux images, qui partent ensemble. Il est plus
   large que celui d'un logo de zone : celles-ci ne voyagent pas avec le plan —
   le manifeste les désigne par une adresse, et le relais va les chercher. */
const ICONE_APP_TAILLES = [512, 384, 256];
const ICONE_APP_POIDS = 240000;

/* La part du carré que le logo occupe. Presque tout pour l'icône que les
   systèmes posent telle quelle — il reste de quoi qu'un logo carré ne touche
   pas les coins arrondis. Bien moins pour celle qu'Android rogne : sa zone
   sûre est le cercle des quatre cinquièmes, où le plus grand carré inscrit
   mesure 80 % divisés par racine de deux, soit cinquante-six. */
const ICONE_APP_PLEIN = 0.88;
const ICONE_APP_SURE = 0.56;

/* Le fond de l'icône rognée. Un logo posé dessus ne remplit jamais le carré —
   la zone sûre est étroite — et ce qui reste autour doit être opaque : une
   transparence rognée par le système donne un contour gris qui bave. Blanc,
   donc, comme le papier sur lequel un logo est dessiné ; la nuit du produit
   pour un logo clair, qui sur du blanc disparaîtrait. */
const ICONE_APP_CLAIR = "#FFFFFF";
const ICONE_APP_SOMBRE = "#171B1E";

/**
 * Sur quel fond poser le logo que le système va rogner.
 *
 * Deux cas, et le premier est le plus heureux : un logo livré sur son propre
 * fond — un fichier opaque, dont les quatre coins s'accordent — voit ce fond
 * prolongé jusqu'au bord du carré, et le rognage ne se voit plus du tout.
 *
 * Faute de quoi on regarde le logo lui-même : clair, il appelle la nuit ;
 * sombre ou coloré, le blanc. Un logo blanc sur fond transparent posé sur du
 * blanc n'aurait laissé qu'une icône vide, et c'est le cas le plus courant —
 * un logo de salon est souvent livré en deux versions dont l'une est claire.
 *
 * La luminance est pondérée comme l'œil la perçoit, et ne compte que les
 * pixels du dessin : le vide autour ne dit rien de sa couleur.
 */
function fondPourIconeApp(img){
  const n = 24;
  const vignette = document.createElement("canvas");
  vignette.width = vignette.height = n;
  const ctx = vignette.getContext("2d");
  ctx.drawImage(img, 0, 0, n, n);
  let d;
  /* Une image lue d'un fichier choisi ne salit pas la toile — c'est un
     data-URI, donc la même origine. La prudence reste : sans les pixels, le
     blanc est le fond le moins risqué. */
  try { d = ctx.getImageData(0, 0, n, n).data; } catch (e) { return ICONE_APP_CLAIR; }

  const coins = [[0, 0], [n - 1, 0], [0, n - 1], [n - 1, n - 1]].map(([x, y]) => (y * n + x) * 4);
  if (coins.every(i => d[i + 3] > 250)){
    const moyenne = k => Math.round(coins.reduce((s, i) => s + d[i + k], 0) / 4);
    const t = [moyenne(0), moyenne(1), moyenne(2)];
    // « s'accordent » : à quelques teintes près, pour un dégradé léger ou un jpeg
    if (coins.every(i => t.every((v, k) => Math.abs(d[i + k] - v) < 14))){
      return "#" + t.map(v => v.toString(16).padStart(2, "0")).join("");
    }
  }

  let somme = 0, pixels = 0;
  for (let i = 0; i < d.length; i += 4){
    if (d[i + 3] < 128) continue;
    somme += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
    pixels++;
  }
  return pixels && somme / pixels > 0.62 * 255 ? ICONE_APP_SOMBRE : ICONE_APP_CLAIR;
}

/** Le logo, centré dans un carré de « taille », occupant « part » de son côté. */
function dessineIconeApp(img, taille, part, fond){
  const carre = document.createElement("canvas");
  carre.width = carre.height = taille;
  const ctx = carre.getContext("2d");
  if (fond){
    ctx.fillStyle = fond;
    ctx.fillRect(0, 0, taille, taille);
  }
  /* Un svg sans dimensions intrinsèques se dessine à rien : on lui en prête,
     comme le fait le logo d'une zone. */
  const l0 = img.naturalWidth || taille, h0 = img.naturalHeight || taille;
  const k = (taille * part) / Math.max(l0, h0);
  const l = Math.max(1, Math.round(l0 * k)), h = Math.max(1, Math.round(h0 * k));
  ctx.drawImage(img, Math.round((taille - l) / 2), Math.round((taille - h) / 2), l, h);
  return carre.toDataURL("image/png");
}

/**
 * Le fichier choisi, ramené aux deux icônes de l'application.
 *
 * Toujours en png : c'est le format que tous les systèmes acceptent pour une
 * icône, le seul que l'écran d'accueil d'iOS lise, et il garde la transparence
 * qu'un logo a presque toujours. Le webp, retenu pour les logos parce qu'il
 * pèse moins, n'aurait ici rien fait gagner qu'un doute. Le svg, lui, ne
 * survit pas au passage : il porte du script, et ces images-là finissent
 * servies à tous les visiteurs.
 */
export function reduitIconeApp(fichier){
  return litImage(fichier).then(img => {
    const fond = fondPourIconeApp(img);
    for (const taille of ICONE_APP_TAILLES){
      const icone = dessineIconeApp(img, taille, ICONE_APP_PLEIN, "");
      const masque = dessineIconeApp(img, taille, ICONE_APP_SURE, fond);
      if (icone.length + masque.length <= ICONE_APP_POIDS)
        return { icone: icone, masque: masque, fond: fond };
    }
    throw new Error("image trop lourde, même réduite — un logo, pas une photo");
  });
}
