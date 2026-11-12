/* ============================================================
   Le détourage, hors de la page — le script du travailleur

   Détourer une vignette de six cents pixels coûte une quarantaine de
   millisecondes, et le seuil des logos en demande d'un coup tous ceux autour
   de la vue : mesuré sur Funexpo, quinze logos figeaient la page sept cents
   millisecondes au moment même où le zoom les faisait paraître. Le tri se fait
   donc ici, dans un travailleur (« Worker »), pendant que la page continue de
   dessiner.

   Ce module n'est importé par aucun autre : la construction en fait un script
   à part (`outils/modules.js` `travail`), qu'elle verse dans celui du plan par
   `define` (`TRAVAIL_DETOURAGE`), et `logos-stands.mjs` le lance depuis une
   adresse « blob: ». Un fichier de plus sous `versions/` aurait demandé au
   service hors ligne de le connaître ; quelques kilo-octets dans le script du
   plan ne demandent rien.

   Il reçoit l'image décodée (`ImageBitmap`), la dessine sur une toile hors
   écran, la détoure (`detourage.mjs`, le même tri que la page faisait), et
   rend les octets, transférés sans copie. Ce qu'il ne sait pas faire — une
   toile hors écran sans dessin 2D, sur un navigateur ancien — il le rend
   vide, et la page détoure elle-même.
   ============================================================ */
import { detoure } from "./detourage.mjs";

addEventListener("message", (/** @type {MessageEvent} */ e) => {
  const { n, image } = e.data;
  /** @type {ImageData | null} */
  let img = null;
  try {
    const w = image.width, h = image.height;
    const ctx = new OffscreenCanvas(w, h).getContext("2d", { willReadFrequently: true });
    if (ctx){
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(image, 0, 0, w, h);
      img = ctx.getImageData(0, 0, w, h);
      detoure(img.data, w, h);
    }
  } catch (err) { img = null; }
  if (image && image.close) image.close();
  postMessage({ n, img }, { transfer: img ? [img.data.buffer] : [] });
});
