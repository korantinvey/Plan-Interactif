/* ============================================================
   La recherche du chemin — A* sur la grille de marche

   Le plus court chemin d'une case à une autre (`cherche`), et les distances de
   marche d'un point à tout le pavillon (`distancesDepuis`), qui servent à
   choisir une entrée et à chiffrer les liaisons entre plans. Rien d'autre :
   la grille vient de `grille-marche.mjs`, et ce qu'on fait du chemin trouvé
   vit dans `trait-chemin.mjs` et `troncon.mjs`.
   ============================================================ */
import { POIDS_CENTRE, PORTEE_CENTRE, TOURNANT, VX, VY } from "./grille-marche.mjs";

/* ------------------------------------------------------------
   A*
   ------------------------------------------------------------ */
/* Un tas binaire sur deux tableaux parallèles. C'est le seul endroit où un A*
   écrit naïvement s'effondre : chercher le minimum d'une liste à chaque tour
   coûte plus que tout le reste du calcul réuni. */
function Tas(){ this.f = []; this.i = []; }
Tas.prototype.pousse = function (f, i){
  const F = this.f, I = this.i;
  let k = F.length;
  F.push(f); I.push(i);
  while (k > 0){
    const p = (k - 1) >> 1;
    if (F[p] <= F[k]) break;
    const a = F[p]; F[p] = F[k]; F[k] = a;
    const b = I[p]; I[p] = I[k]; I[k] = b;
    k = p;
  }
};
Tas.prototype.tire = function (){
  const F = this.f, I = this.i;
  const tete = I[0], n = F.length - 1;
  F[0] = F[n]; I[0] = I[n]; F.pop(); I.pop();
  let k = 0;
  for (;;){
    const g = 2 * k + 1, d = g + 1;
    let m = k;
    if (g < F.length && F[g] < F[m]) m = g;
    if (d < F.length && F[d] < F[m]) m = d;
    if (m === k) break;
    const a = F[m]; F[m] = F[k]; F[k] = a;
    const b = I[m]; I[m] = I[k]; I[k] = b;
    k = m;
  }
  return tete;
};

/**
 * Les tableaux de travail de la recherche, alloués une fois pour toutes.
 *
 * Un état n'est pas une case mais une case abordée dans une direction : il y
 * en a donc quatre fois plus, et les réallouer à chaque trajet coûterait plus
 * que la recherche. Un compteur de tour évite de les remettre à zéro : un état
 * dont le tampon n'est pas celui du tour n'a jamais été visité.
 */
let TRAVAIL = null;
function travail(taille){
  if (!TRAVAIL || TRAVAIL.cout.length < taille){
    TRAVAIL = { cout: new Float32Array(taille), pere: new Int32Array(taille),
                etat: new Int32Array(taille), tour: 0 };
  }
  return TRAVAIL;
}

/**
 * Le plus court chemin de case à case, ou null s'il n'en existe aucun.
 *
 * Quatre voisins, jamais huit : une diagonale de grille n'a pas d'équivalent
 * dans une allée, et c'est elle qui faisait traverser les allées en biais.
 * Reste que mille escaliers valent la même longueur — d'où le prix du virage,
 * qui tranche en faveur des longues lignes droites, et le prix du bord, qui
 * tient le trait au milieu du passage. L'état porte donc la direction d'où
 * l'on vient, sans quoi un virage ne se verrait pas.
 *
 * `peine` ajoute au pas le prix de la case traversée — les abords d'une salle
 * qui se vide, et rien d'autre pour l'instant. Une peine positive laisse
 * l'estimation Manhattan en deçà du trajet réel : le chemin rendu reste le
 * moins cher, ce qui est tout ce qu'on lui demande.
 */
export function cherche(g, depart, arrivee, peine){
  if (depart === arrivee) return [depart];
  const m = travail(g.w * g.h * 4);
  const tour = ++m.tour;
  const ax = arrivee % g.w, ay = (arrivee - ax) / g.w;
  // Manhattan : sur quatre voisins et au pas d'une case, elle ne surestime
  // jamais le trajet — condition pour qu'A* rende bien le plus court
  const reste = (i) => {
    const x = i % g.w, y = (i - x) / g.w;
    return Math.abs(x - ax) + Math.abs(y - ay);
  };
  // ce que la case doit à sa crête, et rien de plus
  const bord = (i) => {
    const d = g.crete[i] - g.marge[i];
    return d <= 0 ? 0 : POIDS_CENTRE * d / PORTEE_CENTRE;
  };

  const tas = new Tas();
  /* Les quatre directions de départ coûtent zéro : le premier pas ne paie
     aucun virage, on n'arrivait de nulle part. */
  for (let d = 0; d < 4; d++){
    const s = depart * 4 + d;
    m.etat[s] = tour; m.cout[s] = 0; m.pere[s] = -1;
    tas.pousse(reste(depart), s);
  }

  let dernier = -1;
  while (tas.f.length){
    const s = tas.tire();
    if (m.etat[s] === -tour) continue;      // déjà close
    const i = (s / 4) | 0, d = s & 3;
    if (i === arrivee){ dernier = s; break; }
    m.etat[s] = -tour;
    const cx = i % g.w, cy = (i - cx) / g.w;
    for (let k = 0; k < 4; k++){
      const nx = cx + VX[k], ny = cy + VY[k];
      if (nx < 0 || ny < 0 || nx >= g.w || ny >= g.h) continue;
      const j = ny * g.w + nx;
      if (g.mur[j]) continue;
      const s2 = j * 4 + k;
      if (m.etat[s2] === -tour) continue;
      const c = m.cout[s] + 1 + bord(j) + (k === d ? 0 : TOURNANT) + (peine ? peine[j] : 0);
      if (m.etat[s2] !== tour || c < m.cout[s2]){
        m.etat[s2] = tour; m.cout[s2] = c; m.pere[s2] = s;
        tas.pousse(c + reste(j), s2);
      }
    }
  }
  if (dernier < 0) return null;
  const suite = [];
  for (let s = dernier; s >= 0; s = m.pere[s]) suite.push((s / 4) | 0);
  return suite.reverse();
}

/**
 * Les distances d'une case à toutes les autres, en cases.
 *
 * Organiser une journée ne demande pas un trajet mais une matrice : vingt
 * arrêts en font quatre cents paires, et autant d'A* prendraient plusieurs
 * secondes sur un téléphone de salon. Un balayage en largeur depuis un seul
 * arrêt les donne toutes d'un coup — un pavillon entier coûte moins qu'un A*
 * isolé — au prix d'une longueur sans prix du virage ni du bord : c'est la
 * longueur du couloir, ce qui suffit à comparer deux ordres de visite. Le
 * tracé montré au visiteur, lui, reste celui de `troncon`.
 *
 * Rend -1 pour les cases hors de la nappe, ou qu'aucune allée ne relie.
 */
export function distancesDepuis(g, depart){ return distancesMulti(g, [depart]).d; }

/**
 * Le même balayage, mais depuis plusieurs cases à la fois.
 *
 * Un stand n'a pas une entrée mais autant que de faces libres, et la plus
 * courte des deux extrémités ne se sait qu'une fois les deux essayées. Partir
 * de toutes les arrivées d'un coup donne, pour chaque départ possible, la
 * distance à la plus proche d'entre elles — le meilleur couple sort d'un seul
 * balayage, là où seize A* le paieraient au prix fort.
 *
 * `src` retient de laquelle chaque case est le plus proche : c'est ce qui
 * permet de retrouver la porte à l'autre bout.
 */
export function distancesMulti(g, departs){
  const n = g.w * g.h;
  const d = new Int32Array(n).fill(-1);
  const src = new Int32Array(n).fill(-1);
  const file = new Int32Array(n);
  let tete = 0, queue = 0;
  departs.forEach((c, k) => {
    if (c < 0 || !g.nappe[c] || d[c] >= 0) return;
    d[c] = 0; src[c] = k; file[queue++] = c;
  });
  while (tete < queue){
    const i = file[tete++], cx = i % g.w, cy = (i - cx) / g.w;
    for (let v = 0; v < 4; v++){
      const nx = cx + VX[v], ny = cy + VY[v];
      if (nx < 0 || ny < 0 || nx >= g.w || ny >= g.h) continue;
      const j = ny * g.w + nx;
      if (d[j] >= 0 || !g.nappe[j]) continue;
      d[j] = d[i] + 1; src[j] = src[i];
      file[queue++] = j;
    }
  }
  return { d: d, src: src };
}
