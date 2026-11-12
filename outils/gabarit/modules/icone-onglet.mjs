/* ============================================================
   Icône de l'onglet

   Les paliers de réduction, du plus généreux au plus maigre : on descend tant
   que le résultat dépasse le poids retenu. Cent vingt-huit pixels suffisent
   partout — l'onglet en montre seize, la barre des favoris trente-deux, le
   raccourci d'un écran d'accueil rarement plus de cent vingt.

   Le poids se compte en caractères du data-URI, non en octets du fichier
   d'origine : c'est lui qui part avec le plan, chez chaque visiteur, et il
   pèse un tiers de plus que l'image — quatre caractères de base64 pour trois
   octets, d'où le diviseur de l'affichage.
   ============================================================ */
const PALIERS_ICONE = [128, 96, 64, 48];
const POIDS_ICONE = 22000;

/**
 * L'icône, redessinée en png quel que soit le fichier déposé.
 *
 * Le png et non le webp, à l'inverse du logo d'une zone : le second pèse moins,
 * mais l'avantage ne se voit pas sur une image de cette taille, et le premier
 * est le seul format que tous les navigateurs acceptent dans « link rel=icon ».
 * Le svg passe par le même canevas et en ressort matriciel — c'est voulu : il
 * porte du script, et les pages du plan ne reconnaissent à l'affichage que les
 * formats qu'on fabrique ici.
 *
 * Les proportions sont gardées : un logo large écrasé dans un carré ne se
 * reconnaît plus, et le navigateur sait loger une image qui n'est pas carrée.
 */
export function reduitIcone(fichier) {
  return new Promise((tenu, rompu) => {
    if (!fichier || String(fichier.type).indexOf("image/") !== 0) {
      return rompu(new Error("ce fichier n'est pas une image"));
    }
    const fr = new FileReader();
    fr.onerror = () => rompu(new Error("fichier illisible"));
    fr.onload = () => {
      const img = new Image();
      img.onerror = () => rompu(new Error("image illisible"));
      img.onload = () => {
        // un svg sans dimensions intrinsèques se dessine à rien : on lui en prête
        const l0 = img.naturalWidth || 128, h0 = img.naturalHeight || 128;
        for (const max of PALIERS_ICONE) {
          const k = Math.min(1, max / Math.max(l0, h0));
          const c = document.createElement("canvas");
          c.width = Math.max(1, Math.round(l0 * k));
          c.height = Math.max(1, Math.round(h0 * k));
          c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
          const src = c.toDataURL("image/png");
          if (src.length <= POIDS_ICONE) return tenu(src);
        }
        rompu(new Error("image trop lourde, même réduite — une icône, pas une photo"));
      };
      img.src = String(fr.result);   // un data-URI : `readAsDataURL` ne rend rien d'autre
    };
    fr.readAsDataURL(fichier);
  });
}
