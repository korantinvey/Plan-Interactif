/* ============================================================
   L'édition en cours — le plan est-il sous un outil de l'exploitant ?

   Le rendu par la carte graphique (`webgl.mjs`) et la vue (`vue.mjs`) le
   demandent, mais ne peuvent l'importer : ce qu'il lit — le calque ouvert, le
   placement des libellés, la couche reprise — vit dans des modules qui
   importent l'un ou l'autre. Il vit donc ici, et le code soudé le leur
   confie (`_webgl.html`, `_vue.html`). Le visiteur le reçoit, d'où
   `plan.mjs` : hors de l'administration, il est toujours faux.
   ============================================================ */
import { GL } from "./webgl.mjs";
import { ADMIN } from "./mode-admin.mjs";
import { calqueActif } from "./calques-dessin.mjs";
import { PLACE_LIBELLES } from "./libelle-place.mjs";
import { SORTE_GEO } from "./emplacements.mjs";

/* ------------------------------------------------------------
   L'édition.

   Le SVG est le modèle, jamais ce qu'on voit : tout ce qui s'affiche passe
   par la carte graphique, le calque qu'on dessine comme le reste. Montrer le
   calque ouvert en SVG par-dessus aurait fait deux rendus à tenir d'accord —
   et le calque passait devant tout, quel que soit son rang dans la pile.

   Ce que les outils attrapent — une poignée, une forme du calque ouvert, un
   libellé qu'on place — se demande aussi à la carte graphique, comme le clic
   d'un visiteur : elle rend l'élément du SVG qu'elle a peint, et l'éditeur
   le reçoit comme il recevait la cible du navigateur. Le SVG n'a donc jamais
   à suivre la vue, pas plus en édition qu'ailleurs.

   Une forme décorative ne s'attrape que sur le calque ouvert : ailleurs elle
   laisse passer le clic vers le stand qu'elle recouvre, comme en SVG où les
   calques de dessin ne reçoivent pas le pointeur.
   ------------------------------------------------------------ */
export const enEdition = () => GL.actif && ADMIN &&
  (Boolean(calqueActif) || PLACE_LIBELLES || Boolean(SORTE_GEO));
