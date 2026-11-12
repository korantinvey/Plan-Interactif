/* ============================================================
   L'itinéraire — le calcul d'un trajet d'un point du salon à un autre

   Le point d'entrée du calcul : les modules de la page et les essais
   l'importent, lui seul. Le calcul est rangé en couches, de la plus basse à la
   plus haute, chacune n'important que celles d'en dessous :

   - `grille-marche.mjs` — ce qu'on reçoit, l'enveloppe, les rôles des calques,
     la grille et l'accroche d'un point ;
   - `recherche-chemin.mjs` — A* et les distances de marche ;
   - `abords-salles.mjs` — la foule à la sortie d'une salle ;
   - `trait-chemin.mjs` — du chemin en cases au trait qu'on suit ;
   - `troncon.mjs` — les entrées d'un emplacement, et un tronçon dans un pavillon ;
   - `trajet.mjs` — les points désignables, les liaisons, le trajet complet.

   Ce module réexporte ce que la page en appelle, vide d'un coup les caches de
   toutes les couches (`oublieGrilles`), et garde ce qui suit le calcul : le
   trait mesuré et ce que le trajet dit au visiteur. Le tiroir, la visée et le
   tracé animé vivent dans `tiroir-itineraire.mjs`, qui l'appelle.

   Quelques fonctions de la grille sont exportées sans que la page en ait
   l'usage : `outils/essais/itineraire.js` les éprouve seules, sur des halls
   dessinés case par case.
   ============================================================ */
import { ecritMinutes } from "./temps.mjs";
import { estPorte } from "./reperes.mjs";
import { ALLURE, ALLURE_PMR, oublieGrillesDeMarche } from "./grille-marche.mjs";
import { oublieFoules } from "./abords-salles.mjs";
import { oublieFaces } from "./troncon.mjs";
import { TYPES_LIAISON, oublieBalayages } from "./trajet.mjs";

export {
  brancheItineraire, PAS_GRILLE, ALLURE, ALLURE_PMR, sommets, enveloppe,
  calquesDe, ROLES_ITI, cleRoleIti, roleIti, nomRoleIti, anglePlan,
  grille, distanceAuMur, cretes, nappePrincipale, accroche
} from "./grille-marche.mjs";
export { cherche, distancesDepuis } from "./recherche-chemin.mjs";
export { REGLAGES_FOULE, regleFoule, heureAuSalon } from "./abords-salles.mjs";
export { reduit, lisse, longueur, nettoie } from "./trait-chemin.mjs";
export {
  pointObjet, pointRepere, candidats, pointSaisi, portesDe, typeLiaison,
  nomRepere, oublieLiaisons, lienEcrits, ecritLiens, annuaireLiaisons,
  liensDe, sortiesDe, plansRelies, routeEntre
} from "./trajet.mjs";

/* Les distances de marche, les foules et les façades se déduisent de la
   grille : ce qui périme l'une périme les autres. */
export function oublieGrilles(){
  oublieGrillesDeMarche(); oublieBalayages(); oublieFoules(); oublieFaces();
}

/* ------------------------------------------------------------
   Le trait mesuré
   ------------------------------------------------------------ */
/** Distances cumulées le long des marches d'ici : pour chacune, celle déjà
 *  parcourue à chacun de ses points, et le total à l'arrivée. */
export function mesureMarches(marches){
  let total = 0;
  const cumuls = marches.map(e => {
    const c = [total];
    for (let i = 1; i < e.pts.length; i++){
      total += Math.hypot(e.pts[i][0] - e.pts[i - 1][0], e.pts[i][1] - e.pts[i - 1][1]);
      c.push(total);
    }
    return c;
  });
  return { cumuls, total };
}

/** Une marche arrêtée à la distance « d », son dernier point posé entre deux
 *  sommets. Rien tant que le trait ne l'a pas rejointe. */
export function coupeMarche(pts, cum, d){
  if (d <= cum[0]) return null;
  const out = [pts[0]];
  for (let i = 1; i < pts.length; i++){
    if (cum[i] <= d){ out.push(pts[i]); continue; }
    const k = (d - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1]);
    out.push([pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k,
              pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k]);
    break;
  }
  return out.length > 1 ? out : null;
}

/** Où chaque arrêt tombe le long du trait. Sa pastille attend que le trait
 *  l'ait rejoint : posée d'avance, elle annoncerait la fin d'un trajet qu'on
 *  est encore en train d'écrire. */
export function distancesDesArrets(marches, mes, arrets){
  return arrets.map(a => {
    let mieux = Infinity, d = 0;
    marches.forEach((e, j) => e.pts.forEach((q, i) => {
      const ex = q[0] - a.xy[0], ey = q[1] - a.xy[1], e2 = ex * ex + ey * ey;
      if (e2 < mieux){ mieux = e2; d = mes.cumuls[j][i]; }
    }));
    return d;
  });
}

/* ------------------------------------------------------------
   Ce que le trajet dit au visiteur
   ------------------------------------------------------------ */
export function ecritDistance(m){
  return m < 950 ? Math.round(m / 5) * 5 + " m"
                 : (m / 1000).toFixed(1).replace(".", ",") + " km";
}
/* Les minutes d'un passage s'ajoutent à celles de la marche : monter un
   étage prend le temps de le monter, attendre un ascenseur celui de
   l'attendre, et un trajet qui les tairait promettrait ce qu'il ne tient
   pas. */
export function ecritDuree(m, pmr, passages){
  const min = Math.max(1, Math.round(m / ((pmr ? ALLURE_PMR : ALLURE) * 60)) + (passages || 0));
  return "≈ " + min + " min";
}

/**
 * Ce qu'une étape de passage dit au visiteur.
 *
 * Une porte se franchit d'un pavillon à l'autre et se nomme des deux côtés :
 * savoir par où l'on sort ne suffit pas, il faut savoir par où l'on entre. Un
 * escalier porte le plus souvent le même nom en haut et en bas — le répéter
 * ferait douter qu'on soit au bon endroit, on ne le redit donc que lorsqu'il
 * change.
 */
export function phraseLiaison(e){
  const t = TYPES_LIAISON[e.type] || TYPES_LIAISON.entree;
  /* Le temps du passage se dit là où il se passe : c'est le seul endroit du
     trajet dont les mètres ne rendent pas compte. */
  const duree = e.min ? " Comptez " + ecritMinutes(e.min) + "." : "";
  if (estPorte(e.type))
    return { t: "Changement de pavillon",
             s: "Sortez du " + e.de + " par « " + e.nom + " », puis entrez dans le " +
                e.vers + " par « " + e.nomVers + " »." + duree };
  return { t: t.nom[0].toUpperCase() + t.nom.slice(1) + " · " + e.nom,
           s: "Prenez " + t.art + " « " + e.nom + " » : vous arrivez dans le " + e.vers +
              (e.nomVers !== e.nom ? ", « " + e.nomVers + " »" : "") + "." + duree };
}
