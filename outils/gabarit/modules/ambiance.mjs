/* ============================================================
   L'ambiance du plan — Classique, Tuiles, Immersif

   Le modèle habille les panneaux ; l'ambiance habille le plan lui-même, la
   forme de ses stands et de ses zones :

   - Classique : le plan tel qu'il a toujours été, cloisons fines.
   - Tuiles : stands et zones aux coins arrondis, détachés les uns des autres
     par un vide au lieu d'une cloison. Plus calme, plus grand public.
   - Immersif : les tuiles en volume, le hall vu de biais comme une maquette
     posée sur la table. La caméra est dans `camera.mjs`, le volume dans
     `webgl.mjs` ; sans carte graphique, le plan reste en tuiles à plat. Le
     cap — de quel côté on regarde le hall — se règle avec l'ambiance.

   Le monde dans les allées (`figurants.mjs`) se règle à part, pour toutes
   les ambiances : silhouettes debout en immersif, vues d'en haut à plat.

   Une ambiance est une forme, pas une palette : les couleurs restent celles
   que l'exploitant règle — stands, zones, secteurs, fond.

   L'exploitant choisit dans le volet « Apparence » ; le choix part avec la
   configuration publiée, comme la couleur principale.
   ============================================================ */
import { P } from "./donnees.mjs";
import { conf } from "./configuration.mjs";
import { PLAN_ADMIN } from "./salon.mjs";
import { demandeCamera, CLASSE_NOMS_A_PLAT } from "./camera.mjs";
import { CLASSE_LOGOS } from "./logos-stands.mjs";
import { CLASSE_FIGURANTS } from "./figurants.mjs";
import { traceStand, tuilesPosees, poseTuiles } from "./tuiles.mjs";

const racine = document.documentElement;

export const AMBIANCES = [
  { cle: "classique", nom: "Classique", dit: "Cloisons fines, aplats francs." },
  { cle: "tuiles", nom: "Tuiles", dit: "Coins arrondis, stands détachés." },
  { cle: "immersif", nom: "Immersif", dit: "Le hall vu de biais, les stands en volume." },
];

/* Essayer une ambiance sans la publier : « ?ambiance=tuiles » sur le plan
   public la pose pour cette visite seulement. On montre ainsi le rendu à qui
   n'a pas d'accès administrateur, et on compare deux ambiances côte à côte
   dans deux onglets. Pas en administration, où c'est le réglage qu'on voit
   et qu'on change — l'adresse le masquerait. */
let ESSAI = PLAN_ADMIN ? null : new URLSearchParams(location.search).get("ambiance");
/* Et le cap de l'immersif de même : « ?cap=-8 ». */
const ESSAI_CAP = PLAN_ADMIN ? null : new URLSearchParams(location.search).get("cap");

/* Et les logos sur les stands : « ?logos=1 », ou « ?logos=0 » pour les taire. */
const ESSAI_LOGOS = PLAN_ADMIN ? null : new URLSearchParams(location.search).get("logos");

/* Et les noms couchés sur le toit : « ?noms=plat », ou « ?noms=debout ». */
const ESSAI_NOMS = PLAN_ADMIN ? null : new URLSearchParams(location.search).get("noms");

/* Et le monde dans les allées : « ?figurants=1 », ou « ?figurants=0 ». */
const ESSAI_FIGURANTS = PLAN_ADMIN ? null : new URLSearchParams(location.search).get("figurants");

/** Y a-t-il du monde dans les allées ? L'exploitant le dit pour toutes les
 *  ambiances ; tant qu'il n'a rien dit, seul l'immersif en a — c'est là
 *  qu'ils sont nés, et un salon déjà publié en classique ne doit pas se
 *  peupler sans qu'on l'ait voulu. */
export function figurantsRetenus(){
  if (ESSAI_FIGURANTS !== null) return ESSAI_FIGURANTS === "1";
  const v = conf("_ambiance").figurants;
  return typeof v === "boolean" ? v : ambianceRetenue() === "immersif";
}

/** Les noms des stands se couchent-ils sur leur toit, en vue immersive ? */
export function nomsAPlatRetenus(){
  return ESSAI_NOMS !== null ? ESSAI_NOMS === "plat" : conf("_ambiance").nomsAPlat === true;
}

/** Les logos remplacent-ils les noms des stands de près, quelle que soit
 *  l'ambiance ? */
export function logosRetenus(){
  return ESSAI_LOGOS !== null ? ESSAI_LOGOS === "1" : conf("_ambiance").logos === true;
}

/** Le cap de la vue immersive, en degrés : de face quand rien n'est réglé. */
export function capRetenu(){
  const c = Number(ESSAI_CAP !== null ? ESSAI_CAP : conf("_ambiance").cap);
  return Number.isFinite(c) ? Math.max(-180, Math.min(180, c)) : 0;
}

/** L'ambiance retenue — Classique quand rien n'est réglé, ou qu'une clé
 *  inconnue arrive d'une configuration plus récente que la page. */
export function ambianceRetenue(){
  const c = AMBIANCES.some(a => a.cle === ESSAI) ? ESSAI : conf("_ambiance").cle;
  return AMBIANCES.some(a => a.cle === c) ? c : "classique";
}

/** Une autre ambiance pour cette visite, sans rien publier — comme
 *  « ?ambiance= », mais en cours de route : le choix que la démonstration
 *  offre à son visiteur (`choix-ambiance.mjs`). */
export function essaieAmbiance(/** @type {string} */ cle){
  ESSAI = cle;
  appliqueAmbiance();
}

export function appliqueAmbiance(){
  const a = ambianceRetenue();
  /* L'immersif est fait de tuiles : il en porte la classe, et la feuille de
     style les dessine pour lui comme pour elles. Des blocs détachés se lisent
     en volume ; collés cloison contre cloison, ils ne feraient qu'un relief. */
  const enTuiles = a === "tuiles" || a === "immersif";
  AMBIANCES.forEach(x => racine.classList.toggle("ambiance-" + x.cle,
    x.cle === a || (x.cle === "tuiles" && enTuiles)));
  demandeCamera(a === "immersif", capRetenu());
  racine.classList.toggle(CLASSE_LOGOS, logosRetenus());
  racine.classList.toggle(CLASSE_FIGURANTS, figurantsRetenus());
  racine.classList.toggle(CLASSE_NOMS_A_PLAT, a === "immersif" && nomsAPlatRetenus());
  /* Le cap se dit aussi sur la racine : c'est par elle que le dessin apprend
     qu'il doit refaire sa vue — il guette sa classe et son style (`webgl.mjs`),
     et un cap qui tourne ne change aucune classe. */
  if (a === "immersif") racine.style.setProperty("--cap-immersif", capRetenu() + "deg");
  else racine.style.removeProperty("--cap-immersif");
  /* Les tuiles changent la forme des stands et des zones déjà posés : on les
     retrace dans l'ordre où `montePlan` les a écrits, celui des données du
     pavillon. */
  if (tuilesPosees() !== enTuiles){
    poseTuiles(enTuiles);
    const p = P();
    for (const [groupe, formes] of [["stands", p.stands], ["zones", p.zones]])
      document.querySelectorAll("#" + groupe + " > g > path").forEach((el, i) => {
        if (formes[i]) el.setAttribute("d", traceStand(formes[i].d));
      });
    // les stands dessinés portent leurs deux tracés (`dessin.mjs` `cheminStandDessine`)
    document.querySelectorAll(".dcal .sdes > path[data-poly]").forEach(el => {
      el.setAttribute("d", enTuiles ? traceStand(el.dataset.poly) : el.dataset.classique);
    });
  }
}
