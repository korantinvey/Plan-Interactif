/* ============================================================
   Le trajet complet — points désignables, liaisons, passage d'un plan à l'autre

   Ce que le visiteur peut désigner comme départ ou arrivée (un stand, une
   zone, un repère, ce qu'il tape), les portes d'un pavillon, les liaisons que
   l'exploitant pose entre plans — portes, escaliers, ascenseurs — et le chemin
   qui les enchaîne (`routeEntre`), tronçon par tronçon.
   ============================================================ */
import { DATA, TOUS } from "./donnees.mjs";
import { COLLATION } from "./texte.mjs";
import { pictoForme, nomTypeRepere, estPorte, ouvreEntrant, ouvreSortant } from "./reperes.mjs";
import { ALLURE, ALLURE_PMR, PAS_GRILLE, accroche, calquesDe, grille, reperesDe } from "./grille-marche.mjs";
import { distancesDepuis } from "./recherche-chemin.mjs";
import { troncon } from "./troncon.mjs";

/* ------------------------------------------------------------
   Les points qu'on peut désigner
   ------------------------------------------------------------ */
/**
 * Un stand, une zone ou un repère : trois choses différentes sur le plan, un
 * seul genre de point ici — un pavillon et une position.
 *
 * Les repères comptent autant que les stands, et c'est voulu : sans
 * géolocalisation, le départ le plus probable d'un visiteur qui arrive, c'est
 * l'entrée du hall.
 */
export function pointObjet(o){
  const pl = DATA.plans[o.p];
  return { cle: "o:" + o.id, id: o.id, genre: "objet", p: o.p,
           xy: (o.lc || o.c).slice(), d: o.d, obj: o,
           nom: o.nom || o.plan || (o.kind === "zone" ? "Zone" : "Stand " + (o.code || "")).trim(),
           detail: pl.libelle + (o.code ? " · " + o.code : "") };
}
export function pointRepere(f, p){
  const type = pictoForme(f);
  return { cle: "r:" + f.id, id: f.id, genre: "repere", p: p.i,
           xy: f.pts[0].slice(), nom: nomRepere(f),
           detail: p.libelle + " · " + (type ? nomTypeRepere(type).toLowerCase() : "repère") };
}

/** Les points proposés pour une saisie. Sans mot-clé, les repères seuls : mille
 *  stands en vrac n'aideraient personne, une entrée si. */
export function candidats(q){
  const v = q.trim().toLowerCase();
  const out = [];
  DATA.plans.forEach(p => reperesDe(p).forEach(f => {
    /* Sous le nom que l'écran montre — donc traduit —, et aussi sous celui des
       données. La liste affichait « Exit », le visiteur tapait « Exit », et
       « sortie » ne le contenait pas : la liste se vidait sur « aucun repère ne
       porte ce nom » alors qu'il était là, et la saisie passant par ici, aucun
       trajet ne se calculait. Choisir dans la liste marchait encore ; taper
       non, et sur un téléphone on tape. */
    const nom = nomRepere(f).toLowerCase();
    if (!v || nom.indexOf(v) >= 0 ||
        String(f.txt).toLowerCase().indexOf(v) >= 0) out.push(pointRepere(f, p));
  }));
  if (!v) return out.slice(0, 12);

  const notes = [];
  for (const o of TOUS){
    if (o.kind === "zone" && !o.nom) continue;
    const code = String(o.code || "").toLowerCase();
    const nom = String(o.nom || o.plan || "").toLowerCase();
    let r = -1;
    if (code === v) r = 0;
    else if (code.indexOf(v) === 0) r = 1;
    else if (nom.indexOf(v) === 0) r = 2;
    else if (nom.indexOf(v) >= 0) r = 3;
    if (r >= 0) notes.push({ r: r, o: o });
  }
  notes.sort((a, b) => a.r - b.r || a.o.p - b.o.p ||
    COLLATION.compare(String(a.o.nom || a.o.code || ""), String(b.o.nom || b.o.code || "")));
  return out.concat(notes.slice(0, 12).map(x => pointObjet(x.o))).slice(0, 14);
}

/** Ce que désigne une saisie laissée telle quelle, si c'est sans ambiguïté. */
export function pointSaisi(txt){
  const l = candidats(txt);
  const v = txt.trim().toLowerCase();
  return l.find(x => x.nom.toLowerCase() === v) || (l.length === 1 ? l[0] : null);
}

/* ------------------------------------------------------------
   Le trajet complet
   ------------------------------------------------------------ */
/** Les portes d'un pavillon, dans le sens où on les franchit : « entrant »
 *  ne retient que ce par quoi on entre, « sortant » que ce par quoi on sort,
 *  et sans précision toutes celles qui en sont une. */
export function portesDe(p, sens){
  const ouvre = sens === "entrant" ? ouvreEntrant
              : sens === "sortant" ? ouvreSortant : estPorte;
  return reperesDe(p).filter(f => ouvre(pictoForme(f)));
}

/** Le meilleur tronçon entre un point et l'une des portes du pavillon. */
function versPorte(p, pmr, xy, entrant, chez){
  const portes = portesDe(p, entrant ? "entrant" : "sortant");
  if (!portes.length) return null;
  /* Le plus court se juge à l'arrivée, pas à vol d'oiseau : une porte proche
     peut être derrière une rangée de stands. On ne calcule cependant pas
     douze trajets pour rien — les quatre plus proches suffisent à trancher. */
  const proches = portes
    .map(f => ({ f: f, d: Math.hypot(f.pts[0][0] - xy[0], f.pts[0][1] - xy[1]) }))
    .sort((a, b) => a.d - b.d).slice(0, 4);
  let mieux = null;
  for (const q of proches){
    const t = entrant ? troncon(p, pmr, q.f.pts[0], xy, null, chez)
                      : troncon(p, pmr, xy, q.f.pts[0], chez, null);
    if (t && (!mieux || t.m < mieux.m)) mieux = t;
  }
  return mieux;
}

/* ------------------------------------------------------------
   Les liaisons — ce qui relie un plan à un autre
   ------------------------------------------------------------ */
/**
 * Un salon ne tient pas dans un plan.
 *
 * Un hall a deux niveaux, et le premier étage est un plan à part ; deux halls
 * voisins communiquent par une porte, et chacun est un plan. Dans les deux
 * cas le calcul s'arrêtait au bord : le trajet se coupait, et le visiteur
 * lisait « rejoignez le pavillon 7.2 » sans savoir par où. C'était honnête —
 * les données ne disent rien de ce qui relie deux plans — mais cela laissait
 * le visiteur seul à l'endroit précis où il hésite.
 *
 * Ce que les données ne disent pas, l'exploitant le sait : cet escalier-ci
 * monte à celui-là, cette porte-ci donne sur celle-là. Il le déclare donc,
 * d'un repère à l'autre, et le calcul enchaîne alors les plans comme il
 * enchaîne les allées — on marche jusqu'à l'escalier, on le prend, on repart
 * de son jumeau à l'étage.
 *
 * Seuls les repères qui sont un passage peuvent en porter une : une porte, un
 * escalier, un escalator, un ascenseur. Un WC ne relie rien, et pouvoir le
 * relier ne ferait qu'ouvrir la porte aux erreurs de saisie.
 */
export const TYPES_LIAISON = {
  /* Le coût est en mètres, l'unité de la recherche : ce que l'on accepte de
     marcher en plus pour éviter ce passage. Une porte ne se paie presque
     rien ; un ascenseur s'attend, et deux étages à pied lui restent parfois
     préférables. La durée, elle, s'ajoute à celle de la marche. */
  entree:       { nom: "porte", art: "la porte", accessible: true, cout: 15, min: 1 },
  /* Une porte à sens unique se relie comme les autres : le sens qu'elle porte
     vaut pour le visiteur qui cherche le hall, pas pour la liaison que
     l'exploitant a déclarée d'un plan à l'autre — s'il l'a déclarée, c'est
     qu'on y passe. */
  entree_seule: { nom: "porte", art: "la porte", accessible: true, cout: 15, min: 1 },
  sortie:       { nom: "porte", art: "la porte", accessible: true, cout: 15, min: 1 },
  escalier:     { nom: "escalier", art: "l'escalier", accessible: false, cout: 30, min: 1 },
  escalator:    { nom: "escalator", art: "l'escalator", accessible: false, cout: 25, min: 1 },
  /* Le seul passage vertical qu'un fauteuil emprunte : sans lui, un étage
     relié par ses seuls escaliers est simplement hors d'atteinte. */
  ascenseur:    { nom: "ascenseur", art: "l'ascenseur", accessible: true, cout: 45, min: 2 },
};

/** Ce qu'un repère vaut comme passage, ou rien s'il n'en est pas un. */
export const typeLiaison = (f) =>
  f && f.t === "repere" ? TYPES_LIAISON[pictoForme(f)] || null : null;

/** Le nom sous lequel un repère se cherche des yeux : son libellé, et à
 *  défaut le nom de ce qu'il est — une pastille de WC sans libellé s'appelle
 *  « WC », et non rien. Un libellé qui n'est que le nom d'un type — « Entrée »,
 *  posé d'office — se lit dans la langue de l'écran, comme le type lui-même :
 *  c'est ce nom-là qui remplit le champ de l'itinéraire. */
export const nomRepere = (f) => traduit(String(f.txt || "").trim()) ||
  nomTypeRepere(pictoForme(f));

/**
 * L'annuaire des passages : chacun d'eux, et ceux qu'il rejoint.
 *
 * Une liaison s'écrit des deux côtés — on la pose d'un repère, elle apparaît
 * sur l'autre — mais on lit l'union plutôt que l'intersection : une seule des
 * deux écritures suffit à la déclarer. Un dessin repris d'un salon précédent,
 * un côté effacé par mégarde, et le passage existe toujours dans le hall :
 * le refuser au visiteur au nom d'une écriture manquante serait le punir d'un
 * détail qu'il ne voit pas.
 *
 * Les repères des calques masqués figurent dans l'annuaire — l'administration
 * doit pouvoir nommer ce qu'elle relie — mais pas dans le calcul, qui s'en
 * tient à ce que le visiteur voit.
 */
let LIAISONS = null;
export function oublieLiaisons(){ LIAISONS = null; }

/**
 * Ce qu'un repère déclare rejoindre, tel qu'on le relit.
 *
 * Un repère en relie autant qu'il en dessert : l'escalier du rez-de-chaussée
 * monte au premier et au second, et ce sont deux passages, chacun avec son
 * temps. La liaison s'est d'abord écrite comme un simple identifiant ; elle
 * porte maintenant sa durée, et les deux formes se lisent — un plan
 * enregistré avant n'a rien à reprendre et retombe sur le temps ordinaire de
 * son type.
 */
export function lienEcrits(f){
  return ((f && f.liens) || []).map(l => typeof l === "string"
    ? { id: l, min: null }
    : { id: l && l.id, min: l && l.min == null ? null : +l.min })
    .filter(l => l.id);
}

/* On réécrit la forme courte quand aucune durée n'est fixée : un plan qui ne
   s'en sert pas garde un enregistrement inchangé. */
export function ecritLiens(f, l){
  if (!l.length) delete f.liens;
  else f.liens = l.map(x => x.min == null ? x.id : { id: x.id, min: x.min });
}

export function annuaireLiaisons(){
  if (LIAISONS) return LIAISONS;
  const par = new Map();      // id du repère → { f, p, visible }
  for (const p of (DATA && DATA.plans) || []){
    for (const c of calquesDe(p)){
      for (const f of c.formes || []){
        if (typeLiaison(f)) par.set(f.id, { f: f, p: p, visible: c.visible !== false });
      }
    }
  }
  // id → (id rejoint → temps déclaré, ou rien), dans les deux sens
  const vers = new Map();
  const relie = (a, b, min) => {
    if (a === b || !par.has(a) || !par.has(b)) return;
    if (!vers.has(a)) vers.set(a, new Map());
    const m = vers.get(a);
    /* Les deux côtés portent la même durée, écrite d'un seul geste. S'ils
       divergent — une annulation qui n'a défait qu'un côté — on garde la plus
       longue : un passage annoncé trop court se paie sur place. */
    const vu = m.get(b);
    m.set(b, min == null ? (vu == null ? null : vu)
                         : (vu == null ? min : Math.max(vu, min)));
  };
  par.forEach((o, id) => lienEcrits(o.f).forEach(l => {
    relie(id, l.id, l.min); relie(l.id, id, l.min);
  }));
  LIAISONS = { par: par, vers: vers };
  return LIAISONS;
}

/** Ce qu'un repère rejoint, du point de vue de l'administration : les deux
 *  sens confondus, calques masqués compris, chacun avec son temps déclaré. */
export function liensDe(f){
  const an = annuaireLiaisons();
  const out = [];
  (an.vers.get(f.id) || new Map()).forEach((min, id) => {
    const o = an.par.get(id);
    if (o) out.push({ o: o, min: min });
  });
  return out;
}

/**
 * Ce que coûte un passage dans la recherche, en mètres.
 *
 * Le forfait de son type, augmenté de ce que le temps déclaré ajoute au temps
 * ordinaire, converti en mètres au pas de marche. Un ascenseur déclaré à cinq
 * minutes devient donc aussi cher qu'un long détour, et le trajet préfère
 * l'escalier — ce qui est exactement ce qu'on veut dire en le déclarant. Le
 * prix reste positif : un passage annoncé instantané ne doit pas devenir un
 * raccourci qu'on emprunte pour rien.
 */
function coutLiaison(t, min, pmr){
  const sup = (min == null ? 0 : min - t.min) * (pmr ? ALLURE_PMR : ALLURE) * 60;
  return Math.max(5, t.cout + sup);
}

/** Un passage praticable : montré au visiteur, relié à un autre, et permis
 *  dans ce mode — un escalier n'en est pas un pour un fauteuil. */
function passagePraticable(an, id, pmr){
  const o = an.par.get(id);
  if (!o || !o.visible || !an.vers.has(id)) return null;
  const t = typeLiaison(o.f);
  return pmr && !t.accessible ? null : o;
}

/** Les passages praticables d'un plan. */
function passagesDe(p, pmr){
  const an = annuaireLiaisons(), l = [];
  an.par.forEach((o, id) => {
    if (o.p.i === p.i && passagePraticable(an, id, pmr)) l.push(o.f);
  });
  return l;
}

/** Par où l'on quitte un plan : ses portes, et les passages déclarés — un
 *  étage se quitte par son escalier, et non par la porte du hall d'en bas. */
export function sortiesDe(p, pmr){
  const l = portesDe(p, "sortant");
  for (const f of passagesDe(p, pmr)) if (l.indexOf(f) < 0) l.push(f);
  return l;
}

/** Les couples de plans qu'un passage joint directement, pour qui n'a besoin
 *  que de savoir s'ils le sont. */
export function plansRelies(pmr){
  const an = annuaireLiaisons(), out = new Set();
  an.vers.forEach((suite, id) => {
    const o = passagePraticable(an, id, pmr);
    if (!o) return;
    suite.forEach((min, idv) => {
      const v = passagePraticable(an, idv, pmr);
      if (v) out.add(o.p.i + "|" + v.p.i);
    });
  });
  return out;
}

/* ------------------------------------------------------------
   Le chemin qui passe d'un plan à l'autre
   ------------------------------------------------------------ */
/**
 * La distance de marche depuis un point vers tout le reste du pavillon.
 *
 * Un balayage en largeur, comme pour la journée : chercher un A* par couple
 * de passages coûterait davantage pour un chiffre qu'on ne fait que comparer.
 * Le tracé montré au visiteur, lui, reste celui de `troncon`.
 */
const BALAYAGES = new Map();
export function oublieBalayages(){ BALAYAGES.clear(); }
function balayage(p, pmr, xy, chez){
  const cle = p.id + (pmr ? "|pmr" : "") + "|" + xy[0].toFixed(2) + "," + xy[1].toFixed(2);
  const garde = BALAYAGES.get(cle);
  if (garde) return garde;
  const g = grille(p, pmr);
  /* On ne sort pas d'un emplacement en traversant son voisin : l'accroche s'en
     tient à l'emprise du sien, quand on sait laquelle c'est. */
  const c = accroche(g, p, xy, chez);
  const b = { g: g, d: c >= 0 ? distancesDepuis(g, c) : null };
  BALAYAGES.set(cle, b);
  return b;
}

/** Rend -1 quand aucune allée ne mène au point demandé.
 *
 *  Le plan vient en second, comme partout ailleurs : `accroche` en a besoin
 *  pour savoir quelle emprise est celle de l'arrêt, et le lui refuser faisait
 *  chercher l'accroche à partir d'un point indéfini. */
function distanceDepuis(bal, p, xy, chez){
  if (!bal.d) return -1;
  const c = accroche(bal.g, p, xy, chez);
  if (c < 0) return -1;
  return bal.d[c] >= 0 ? bal.d[c] * PAS_GRILLE : -1;
}

/* Ce qu'on s'autorise de balayages pour un trajet. Chacun parcourt un
   pavillon entier case par case — quelques dizaines de millisecondes, plus
   sur un téléphone. Une vingtaine couvre tout salon réel ; la borne n'est là
   que pour l'exploitant qui relierait tout à tout, et le trajet reste alors
   le meilleur de ceux qu'on a eu le temps d'examiner. */
const LIMITE_BALAYAGES = 20;

/**
 * Le chemin le plus court d'un point à un autre, passages compris.
 *
 * Dijkstra sur un graphe minuscule : les deux bouts du trajet et les passages
 * praticables. Une arête de marche coûte les mètres d'allée qui séparent deux
 * points d'un même plan ; une arête de passage coûte le forfait de son type.
 * Les distances de marche ne se calculent qu'au moment où un nœud est retenu,
 * et jamais deux fois : un salon dont les plans ne se relient pas ne fait
 * donc qu'un balayage avant de rendre les armes.
 *
 * Rend la suite des sauts, ou rien si les liaisons déclarées ne mènent pas de
 * l'un à l'autre.
 */
function cheminLiaisons(a, b, pmr){
  const an = annuaireLiaisons();
  if (!an.vers.size) return null;

  /* Les deux bouts du trajet peuvent être des emplacements : ils gardent leur
     emprise et leur objet, dont dépendent l'accroche à l'allée et l'amorce. Un
     passage, lui, n'est qu'un point. */
  // le départ et l'arrivée, puis chaque liaison : des nœuds de formes diverses
  /** @type {Record<string, any>[]} */
  const noeuds = [{ ip: a.p, xy: a.xy.slice(), d: a.d, obj: a.obj },
                  { ip: b.p, xy: b.xy.slice(), d: b.d, obj: b.obj }];
  const rang = new Map();
  /* Un escalier ne relie rien pour un fauteuil : le mode accessible retire le
     passage du graphe plutôt que de le pénaliser, faute de quoi il finirait
     par le proposer là où il n'y a rien d'autre. */
  an.par.forEach((o, id) => {
    if (!passagePraticable(an, id, pmr)) return;
    rang.set(id, noeuds.length);
    noeuds.push({ ip: o.p.i, xy: o.f.pts[0].slice(), id: id, f: o.f, t: typeLiaison(o.f) });
  });
  if (noeuds.length < 4) return null;   // il faut au moins les deux bouts d'un passage

  const n = noeuds.length;
  const D = new Float64Array(n).fill(Infinity);
  const vient = new Array(n).fill(null);
  const vu = new Uint8Array(n);
  D[0] = 0;
  let balayages = 0;

  for (;;){
    let u = -1;
    for (let i = 0; i < n; i++) if (!vu[i] && D[i] < Infinity && (u < 0 || D[i] < D[u])) u = i;
    if (u < 0 || u === 1) break;        // plus rien à ouvrir, ou l'arrivée est arrêtée
    vu[u] = 1;

    /* Emprunter le passage : son prix est celui du passage, et non d'un
       chemin — on ne marche pas dans un escalier, on le monte. */
    const suite = noeuds[u].id ? an.vers.get(noeuds[u].id) : null;
    if (suite) suite.forEach((dit, idv) => {
      const v = rang.get(idv);
      /* Un passage joint deux plans. Deux repères du même plan reliés l'un à
         l'autre — ce que l'administration ne propose pas, mais qu'une reprise
         de données peut porter — feraient un raccourci que personne ne peut
         emprunter : on l'ignore plutôt que de tracer un trajet impossible. */
      if (v === undefined || vu[v] || noeuds[v].ip === noeuds[u].ip) return;
      /* Le temps du passage est celui fixé pour ce couple-ci, et à défaut
         celui de son type : le même escalier met une minute au premier étage
         et davantage au second. */
      const min = dit == null ? noeuds[u].t.min : dit;
      const d = D[u] + coutLiaison(noeuds[u].t, dit, pmr);
      if (d < D[v]){ D[v] = d; vient[v] = { de: u, genre: "liaison", min: min }; }
    });

    /* Marcher dans le plan où l'on se trouve. */
    const p = DATA.plans[noeuds[u].ip];
    if (!p || balayages >= LIMITE_BALAYAGES) continue;
    balayages++;
    const bal = balayage(p, pmr, noeuds[u].xy, noeuds[u].d);
    for (let v = 0; v < n; v++){
      if (v === u || vu[v] || noeuds[v].ip !== noeuds[u].ip) continue;
      const m = distanceDepuis(bal, p, noeuds[v].xy, noeuds[v].d);
      if (m < 0) continue;
      const d = D[u] + m;
      if (d < D[v]){ D[v] = d; vient[v] = { de: u, genre: "marche" }; }
    }
  }

  if (!isFinite(D[1])) return null;
  const sauts = [];
  for (let i = 1; i !== 0; ){
    const e = vient[i];
    if (!e) return null;
    sauts.unshift({ a: noeuds[e.de], b: noeuds[i], genre: e.genre, min: e.min });
    i = e.de;
  }
  return sauts;
}

/**
 * Le trajet que décrit une suite de sauts : les allées qu'on marche, les
 * passages qu'on emprunte.
 *
 * Un tronçon qui ne se trace pas ne fait pas échouer le trajet : la suite est
 * juste, et mieux vaut un plan où un morceau manque qu'un « aucun chemin »
 * qui serait faux.
 */
function routeParLiaisons(sauts, pmr){
  /** @type {Record<string, any>[]} */   // une marche, une liaison, un passage…
  const etapes = [];
  const avertis = [];
  let minutes = 0, liaisons = 0;
  for (const s of sauts){
    if (s.genre === "liaison"){
      liaisons++;
      minutes += s.min;
      etapes.push({ genre: "liaison", type: pictoForme(s.a.f), p: s.a.ip, pVers: s.b.ip,
                    min: s.min, nom: nomRepere(s.a.f), nomVers: nomRepere(s.b.f),
                    de: DATA.plans[s.a.ip].libelle, vers: DATA.plans[s.b.ip].libelle });
      continue;
    }
    /* Deux points confondus — le départ posé sur l'escalier lui-même : il n'y
       a pas d'allée entre eux, et une étape de zéro mètre n'apprend rien. */
    if (Math.hypot(s.b.xy[0] - s.a.xy[0], s.b.xy[1] - s.a.xy[1]) < .5) continue;
    const p = DATA.plans[s.a.ip];
    const t = troncon(p, pmr, s.a.xy, s.b.xy, s.a.obj, s.b.obj);
    if (t) etapes.push(t);
    else avertis.push("Le chemin dans le " + p.libelle + " n'a pas pu être tracé : " +
                      "cette partie du trajet manque à l'écran.");
  }
  return { etapes: etapes, avertis: avertis, liaisons: liaisons, minutes: minutes,
           partiel: !!avertis.length,
           m: etapes.reduce((s, e) => s + (e.m || 0), 0) };
}

/**
 * Le trajet d'un point à un autre, quel que soit le nombre de plans traversés.
 *
 * Trois cas, dans cet ordre. Le même plan, et c'est un tronçon. Des plans que
 * des passages relient, et c'est la suite de sauts. Des plans que rien ne
 * relie — aucune liaison déclarée, ou aucune praticable en fauteuil — et l'on
 * retombe sur ce qu'on savait faire avant : sortir par la porte la plus
 * proche, dire « rejoignez le pavillon 7.2 », reprendre à l'entrée de
 * l'autre. Le trajet est alors coupé, et il le dit.
 */
export function routeEntre(a, b, pmr){
  if (a.p === b.p){
    const t = troncon(DATA.plans[a.p], pmr, a.xy, b.xy, a.obj, b.obj);
    if (t) return { etapes: [t], m: t.m };
  }

  /* Un plan peut aussi se rejoindre lui-même par un autre — deux moitiés d'un
     hall que seule une passerelle relie : la recherche par liaisons a donc
     lieu même quand le départ et l'arrivée partagent leur plan. */
  const sauts = cheminLiaisons(a, b, pmr);
  if (sauts) return routeParLiaisons(sauts, pmr);
  if (a.p === b.p) return { etapes: [], m: 0, sansChemin: true };

  const pa = DATA.plans[a.p], pb = DATA.plans[b.p];
  const t1 = versPorte(pa, pmr, a.xy, false, a.obj);
  const t2 = versPorte(pb, pmr, b.xy, true, b.obj);
  /** @type {Record<string, any>[]} */
  const etapes = [];
  const avertis = [];
  if (t1) etapes.push(t1);
  else avertis.push("La sortie du " + pa.libelle + " n'est pas repérée sur le plan : " +
                    "cette partie du trajet n'est pas tracée.");
  etapes.push({ genre: "transfert", de: pa.libelle, vers: pb.libelle });
  if (t2) etapes.push(t2);
  else avertis.push("L'entrée du " + pb.libelle + " n'est pas repérée sur le plan : " +
                    "cette partie du trajet n'est pas tracée.");
  /* Sans repère d'entrée ni de sortie, il ne reste que « changez de pavillon » :
     mieux vaut le dire que d'annoncer un trajet de zéro mètre. */
  return { etapes: etapes, avertis: avertis, coupe: true,
           partiel: !t1 || !t2, aucunTrace: !t1 && !t2,
           m: etapes.reduce((s, e) => s + (e.m || 0), 0) };
}
