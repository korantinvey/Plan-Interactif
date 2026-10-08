/* ============================================================
   Une image déposée par l'exploitant, lue puis réduite

   Un module de l'administration : `plan-admin.mjs` l'embarque, le visiteur ne
   le reçoit jamais. Deux dépôts s'en servent — le logo d'une zone ou du
   sponsor ici, l'icône de l'application dans `icone-app.mjs` — et lisaient
   chacun le fichier à leur façon, avec les mêmes refus.
   ============================================================ */

/**
 * Le fichier choisi, lu en image.
 *
 * Refusé s'il ne se dit pas image, s'il ne se lit pas, ou si le navigateur ne
 * sait pas le décoder — trois phrases que l'exploitant lit telles quelles.
 */
export function litImage(fichier){
  return new Promise((tenu, rompu) => {
    if (!fichier || String(fichier.type).indexOf("image/") !== 0)
      return rompu(new Error("ce fichier n'est pas une image"));
    const fr = new FileReader();
    fr.onerror = () => rompu(new Error("fichier illisible"));
    fr.onload = () => {
      const img = new Image();
      img.onerror = () => rompu(new Error("image illisible"));
      img.onload = () => tenu(img);
      img.src = String(fr.result);   // un data-URI : `readAsDataURL` ne rend rien d'autre
    };
    fr.readAsDataURL(fichier);
  });
}

/* Les tailles successives auxquelles on tente de ramener un logo, de la plus
   confortable à la plus modeste : on garde la première qui tient dans le poids
   qu'on s'autorise. Le logo paraît à peu près 240 points de large sur la
   fiche ; 480 pixels le gardent net sur un écran qui en double la densité.

   Le poids n'est pas une coquetterie : la fiche part avec le plan, à chaque
   visiteur et pour chaque zone. Cent kilo-octets par logo, sur les vingt-deux
   zones d'un salon comme Franchise Expo, sont déjà deux mégaoctets de plan. */
const PALIERS_LOGO = [[480, .85], [480, .7], [380, .7], [300, .62], [220, .6]];
const POIDS_LOGO = 92000;

/**
 * Le fichier choisi, ramené à ce qu'une fiche affiche.
 *
 * Le logo est enregistré dans la fiche elle-même, en data-URI, et non déposé
 * sur un hébergement de fichiers : c'est déjà ainsi que voyagent les images du
 * dessin, une page publiée ne peut charger aucune ressource externe, et un lien
 * vers un fichier ailleurs meurt le jour où l'ailleurs change. Le prix est le
 * poids, payé par chaque visiteur : d'où la réduction, et le refus au-delà.
 *
 * Le format d'arrivée ne dépend pas de celui du fichier : webp là où le
 * navigateur sait l'écrire, png ailleurs — il y répond en png sans rien dire,
 * et le résultat reste affichable. Les deux gardent la transparence, qu'un logo
 * a presque toujours et qu'un jpeg aurait remplie de blanc.
 */
export function reduitLogo(fichier){
  return litImage(fichier).then(img => {
    /* Un svg sans dimensions intrinsèques se dessine à rien : on lui en
       prête plutôt que de rendre une image vide. */
    const l0 = img.naturalWidth || 480, h0 = img.naturalHeight || 480;
    for (const [max, q] of PALIERS_LOGO){
      const k = Math.min(1, max / Math.max(l0, h0));
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(l0 * k));
      c.height = Math.max(1, Math.round(h0 * k));
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      const src = c.toDataURL("image/webp", q);
      if (src.length <= POIDS_LOGO) return src;
    }
    throw new Error("image trop lourde, même réduite — un logo, pas une photo");
  });
}
