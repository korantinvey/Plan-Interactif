/* ============================================================
   L'écran — étroit ou large, mouvement réduit ou non

   Deux questions que presque tout le plan pose avant d'agir : la vue pour
   savoir ce que la barre et les tiroirs couvrent, la fiche pour choisir entre
   l'étirement et le glissement, la visite guidée et l'itinéraire pour placer
   leurs bulles et animer leur trait. Elles vivaient en tête de la fiche, d'où
   chacun se les faisait confier ; elles tiennent ici, sans rien importer, pour
   qu'un module les importe au lieu de les recevoir.
   ============================================================ */

/** Le système demande-t-il de réduire les animations ? Lu une fois, au chargement. */
export const REDUIT = matchMedia("(prefers-reduced-motion: reduce)").matches;
/** Écran étroit : la liste et la fiche sont des tiroirs, pas des panneaux. */
export const ETROIT = () => matchMedia("(max-width:900px)").matches;
