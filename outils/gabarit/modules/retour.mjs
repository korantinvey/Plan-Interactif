/* ============================================================
   Le retour sur une page restée ouverte

   Une application installée ne se ferme presque jamais : on la réduit, on y
   revient le lendemain, et c'est la même page, avec le même script, chargé à
   l'ouverture. Le service hors ligne sert le réseau d'abord (`_sw.js`), mais
   il ne sert qu'à un chargement — et une page réduite n'en refait aucun. Une
   correction mise en ligne entre-temps ne l'atteignait donc pas : le plan
   figé au retour, corrigé le 15 octobre 2026, figeait encore le plan des
   visiteurs dont l'application dormait depuis la veille.

   Au retour d'une longue absence, la page relit donc sa propre adresse. Le
   script des modules y est nommé par son empreinte (`versions/plan.<…>.js`) :
   s'il n'est plus celui qui tourne, une autre construction est en ligne, et
   la page se recharge. Le parcours et les rappels sont gardés dans le
   navigateur, la visite déjà comptée pour la session (`mesure.mjs`) : seuls
   la vue et la fiche ouverte se perdent, et après une absence pareille, on
   ne les cherchait plus.

   Deux pages n'en ont pas besoin. L'administration, qui peut tenir un
   brouillon qu'un rechargement jetterait. Et la démonstration, dont le
   script est posé dans la page : elle n'a pas de construction à suivre.
   ============================================================ */
import { PLAN_ADMIN } from "./salon.mjs";

/* Ce qui compte pour une longue absence. Un coup d'œil à un message ne
   recharge rien : l'écran ne doit pas se refaire sous le doigt de qui revient
   aussitôt. */
const ABSENCE_LONGUE = 10 * 60 * 1000;

// lu au chargement du module : c'est ce script-là qui s'exécute en ce moment
const SCRIPT = document.currentScript?.getAttribute("src") || "";
const VERSIONNE = /\/versions\/[^/"]+\.js$/;

let cachee = 0, enCours = false;

async function verifieAuRetour(){
  if (document.visibilityState === "hidden"){ cachee = Date.now(); return; }
  if (!cachee || Date.now() - cachee < ABSENCE_LONGUE || enCours) return;
  cachee = 0;
  // hors réseau, le service hors ligne rendrait la copie gardée : rien à apprendre
  if (navigator.onLine === false) return;
  enCours = true;
  try {
    const r = await fetch(location.href, { cache: "no-store", credentials: "same-origin" });
    if (!r.ok) return;
    const page = await r.text();
    /* La page relue doit encore porter un script versionné du même point
       d'entrée : une page d'erreur, un portail de wifi, n'en ont pas, et ne
       disent rien de ce qui est en ligne. */
    const entree = SCRIPT.replace(/\.[^./]+\.js$/, ".");
    if (page.includes(SCRIPT) || !page.includes(entree)) return;
    location.reload();
  } catch (e) {
    // le réseau a manqué : on regardera au prochain retour
  } finally { enCours = false; }
}

/** Branché par `lancement.mjs` `lancePlan`, parmi les écoutes de la page. */
export function brancheRetour(){
  if (PLAN_ADMIN || !VERSIONNE.test(SCRIPT)) return;
  document.addEventListener("visibilitychange", verifieAuRetour);
}
