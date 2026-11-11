/* ============================================================
   La part du cadre que le visiteur voit

   Intégré dans le site d'un salon, le plan vit dans un cadre (`iframe`) plus
   haut que ce qui en paraît : souvent 80 % de l'écran, posé sous un titre, et
   dont le bas tombe sous le bord du téléphone. Tout ce qui se pose au bas du
   cadre y tombe avec lui — la fenêtre commune, qui ne montrait que le titre de
   l'invitation à la visite guidée, et les tiroirs des écrans étroits : sur le
   site de Funexpo 2026, la liste descendue à son cran le plus bas passait sous
   le bord de l'écran, et rien ne permettait plus de la reprendre.

   Le cadre ne sait pas où le site l'a posé, ni lire le défilement d'une page
   d'une autre origine. Mais un `IntersectionObserver` sans racine mesure,
   même là, ce qui d'un élément tient dans l'écran de la page qui l'accueille :
   un témoin collé aux bords du cadre donne donc la bande visible. Les seuils,
   un par centième, la font suivre quand le visiteur fait défiler le site.

   Trop peu visible pour y ranger quoi que ce soit — le cadre à peine entré
   dans l'écran —, la bande rendue est le cadre entier : tasser une fenêtre ou
   un tiroir dans un liseré les rendrait illisibles aussi, et le visiteur qui
   descend vers le plan les y trouvera. Hors d'un cadre, rien ne se pose.

   Un module neutre, qui n'importe rien : la fenêtre et les tiroirs s'y
   inscrivent chacun, sans que l'un ait à connaître l'autre.
   ============================================================ */

/** Le plan vit-il dans le cadre d'une autre page ? */
export const INTEGRE = (() => { try { return window.top !== window.self; } catch (e) { return true; } })();

/* En deçà, la bande visible ne suffit à rien : on rend le cadre entier. */
const VU_MINIMUM = 200;

/**
 * La bande visible du cadre, en pixels comptés depuis son haut : `haut` ce qui
 * en est caché au-dessus, `bas` ce qui l'est au-dessous, `vu` sa hauteur.
 * `null` tant qu'elle est le cadre entier.
 * @typedef {{ haut: number, bas: number, vu: number }} PartVisible
 */
/** @type {PartVisible | null} */
let part = null;
/** @type {Array<(p: PartVisible | null) => void>} */
const suiveurs = [];
let guet = null;

/** La hauteur que le visiteur voit du cadre — celle du cadre, hors intégration. */
export const hauteurVue = () => part ? part.vu : innerHeight;

/**
 * Inscrit `f`, rappelé à chaque changement de la bande visible, et une fois
 * tout de suite. Le guet ne se pose qu'au premier inscrit, et jamais hors
 * d'un cadre.
 * @param {(p: PartVisible | null) => void} f
 */
export function suisLeCadre(f){
  suiveurs.push(f);
  f(part);
  if (!INTEGRE || guet || typeof IntersectionObserver !== "function") return;
  const temoin = document.createElement("div");
  temoin.style.cssText = "position:fixed;inset:0;pointer-events:none;opacity:0";
  temoin.setAttribute("aria-hidden", "true");
  document.body.appendChild(temoin);
  const seuils = Array.from({ length: 101 }, (_, i) => i / 100);
  guet = new IntersectionObserver(entrees => {
    const e = entrees[entrees.length - 1];
    const r = e.intersectionRect;
    let p = null;
    if (e.isIntersecting && r.height >= VU_MINIMUM){
      const haut = Math.max(0, Math.round(r.top));
      const bas = Math.max(0, Math.round(innerHeight - r.bottom));
      p = { haut: haut, bas: bas, vu: innerHeight - haut - bas };
      // le cadre entier en vue : rien à déplacer, comme hors intégration
      if (!haut && !bas) p = null;
    }
    if (p === part || (p && part && p.haut === part.haut && p.bas === part.bas && p.vu === part.vu)) return;
    part = p;
    suiveurs.forEach(s => s(part));
  }, { threshold: seuils });
  guet.observe(temoin);
}
