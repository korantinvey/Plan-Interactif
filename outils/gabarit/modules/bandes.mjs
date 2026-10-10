/* ============================================================
   Les bandes qui défilent — fondu du bord, flèche qui avance

   La bande des critères retenus, le cartouche des points d'intérêt et les
   onglets des pavillons marquent le bord par lequel il leur reste quelque
   chose (`majFondus`, que le rendu, la recherche et les repères rappellent). Les écoutes se
   posent par `brancheBandes`, que `lancement.mjs` `lancePlan` appelle juste
   avant la recherche : au rang qu'elles tenaient dans le script d'avant
   parmi celles du plan.
   ============================================================ */

/* Les bandes qui défilent, et ce qui le fait voir.

   En tiroir — sur téléphone — les critères retenus tiennent sur une ligne
   unique qui déborde par le côté : la hauteur s'y paie sur le plan, et deux
   lignes de puces le mangeraient. Le cartouche des points d'intérêt cède de la
   même façon, au bas du plan, et pour la même raison. Mais une puce coupée net
   au bord de l'écran ne se lit pas comme une invitation à pousser du doigt :
   elle se lit comme un défaut de cadrage, et le reste du salon n'est jamais
   visité.

   On marque donc le bord par lequel il reste quelque chose, et lui seul ; le
   CSS l'estompe et y pose une flèche, qui le dit et le fait. Arrivé au bout, plus rien ne s'efface — c'est ainsi qu'on sait
   qu'on a tout vu. Sur grand écran les bandes se replient sur plusieurs lignes
   et ne défilent pas : rien ne déborde, rien ne se marque, la règle ne
   s'applique nulle part sans qu'on ait à la conditionner à la largeur. */
const BANDES = () => [...document.querySelectorAll(".bande")];

/**
 * Marquer, sur chaque cadre, le bord par lequel il reste quelque chose.
 *
 * Le cadre plutôt que la bande : c'est lui qui porte les flèches, et le CSS ne
 * sait pas remonter d'un enfant à son voisin.
 */
export function majFondus(){
  BANDES().forEach(b => {
    const n = b.querySelector(".defile");
    if (!n) return;
    /* Le défilement est fractionnaire — zoom du navigateur, densité d'écran —
       et n'atteint jamais le bout au pixel près : un pixel de marge, sinon le
       fondu de droite ne s'éteint pas là où il n'y a plus rien. */
    const reste = n.scrollWidth - n.clientWidth - n.scrollLeft;
    b.toggleAttribute("data-gauche", n.scrollLeft > 1);
    b.toggleAttribute("data-droite", reste > 1);
  });
}

/** Les écoutes des bandes, posées au chargement de la page. */
export function brancheBandes(){
  BANDES().forEach(b => {
    const n = b.querySelector(".defile");
    if (n) n.addEventListener("scroll", majFondus, { passive: true });
    /* Une pression avance d'un écran, moins une puce : celle qu'on avait sous
       les yeux reste en vue, et l'on garde le fil de ce qu'on parcourt. Le
       défilement doux fait défiler les événements, qui remarquent les bords. */
    b.querySelectorAll(".fleche").forEach(f => f.onclick = () => {
      if (!n) return;
      n.scrollBy({ left: Number(f.dataset.vers) * n.clientWidth * .8, behavior: "smooth" });
    });
  });
  /* La bascule tiroir / colonne change tout : ce qui défilait ne défile plus, et
     les puces se replient. Les polices, elles, arrivent après le premier calcul
     et changent la largeur mesurée. */
  addEventListener("resize", majFondus);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(majFondus);
}
