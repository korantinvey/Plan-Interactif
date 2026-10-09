/* ============================================================
   Reprendre à la main la géométrie d'un emplacement — ce que le plan
   public en reçoit

   Les stands et les zones organisateur viennent de la source du plan —
   Klipso aujourd'hui, d'autres demain — et c'est bien ainsi : personne ne
   veut redessiner neuf cents emplacements. Mais la source se trompe, ou
   tarde : un stand posé de travers, une zone qui déborde sur l'allée, un
   îlot recomposé la veille du montage et pas encore ressaisi. L'exploitant
   voit le plan, la source non. Il lui faut pouvoir corriger la forme sans
   attendre, et sans la reperdre à la synchronisation suivante.

   La retouche se range donc dans l'apparence du salon, comme le placement
   d'un libellé, et porte avec elle l'empreinte de la géométrie dont elle
   part. Une synchronisation qui ne touche pas à l'emplacement la laisse en
   place — c'est tout l'objet. Une qui le déplace ou le redécoupe la périme :
   la source a tranché, et la forme qu'elle décrit maintenant n'est plus
   celle qu'on avait reprise. Le réglage n'est pas effacé pour autant, il
   cesse de s'appliquer — si la source revient sur ses pas, il revient avec
   elle.

   L'empreinte porte sur le tracé servi, et sur rien d'autre : elle ne sait
   pas d'où il vient et n'a pas à le savoir. Une seconde sorte de source se
   rangera derrière la même règle sans qu'on y touche.

   Le geste, lui, est celui du dessin : on glisse la forme, on tire ses
   poignées, et les aimants l'accrochent aux emplacements voisins — c'est
   contre eux qu'on la range, et eux seuls sont justes au centimètre.

   Ce module tient ce que le visiteur en reçoit : les retouches et les
   emplacements ajoutés, versés dans le pavillon au chargement (`indexe`, dans
   `_js.html`), et le mode en cours, que le rendu par la carte graphique lit
   (faux hors de l'administration). L'outil qui les écrit — le cadenas des
   couches, la palette, les poignées, le tracé d'un ajout — est d'exploitant :
   il vit dans `modules/reprise-emplacements.mjs`, que seul `plan-admin.mjs`
   embarque, et pose le mode par la porte d'ici. Ce que le code soudé tient
   encore — les réglages, le nom d'une société sur le plan, les noms anglais
   des zones — lui est confié par `brancheEmplacements`, que `_geometrie.html`
   appelle à la place que ce code y tenait.
   ============================================================ */
import { DATA } from "./donnees.mjs";
import { ADMIN } from "./mode-admin.mjs";
import { arrondiGeo, empreinteGeo, anneauxGeo, traceGeo, boiteGeo } from "./forme.mjs";

/* Ce que le code soudé confie au branchement. Les réglages (`CONF`, que le
   changement de salon remplace) se lisent à l'instant ; le nom d'une société
   se déclare dans `_dessin.html`, et se confie par un détour. */
/**
 * @typedef {object} PageEmplacements
 * @property {() => Record<string, any>} conf les réglages du moment, `CONF`
 * @property {(soc: any) => string} nomSurLePlan
 * @property {() => void} nomsAnglaisDesZones
 */
/** @type {PageEmplacements} */
let soude;
const reglages = () => soude.conf();
const nomSurLePlan = (soc) => soude.nomSurLePlan(soc);
const nomsAnglaisDesZones = () => soude.nomsAnglaisDesZones();

/**
 * Appelé par le code soudé à la place que ce code tenait (`_geometrie.html`),
 * avant que la première donnée ne soit indexée.
 *
 * @param {PageEmplacements} page
 */
export function brancheEmplacements(page){
  soude = page;
}

export const cleGeo = (id) => "_geo:" + id;

/* Le mode est transitoire, comme celui des libellés : on y entre pour
   corriger, on en sort. Il ne se retient pas d'une visite à l'autre. */
/** @type {string | null} */
export let SORTE_GEO = null;    // « stands », « zones », ou rien

/** La porte du mode : l'outil de l'exploitant seul l'ouvre et le ferme
 *  (`modules/reprise-emplacements.mjs` `modeGeometrie`). */
export function poseSorteGeo(sorte){
  SORTE_GEO = sorte;
}

/* Les anneaux, le tracé, l'empreinte et l'ancrage du nom se calculent dans
   `modules/forme.mjs`, comme la synchronisation les calcule. */

/* ------------------------------------------------------------
   Poser une géométrie, et se souvenir de celle qui vient de la source
   ------------------------------------------------------------ */

/** La géométrie servie par la source, relevée avant toute retouche. C'est
 *  elle que l'empreinte décrit, et elle que « Géométrie d'origine » rend. */
export function geometrieSource(o){
  if (!o.geoSource)
    o.geoSource = { d: o.d, c: o.c, bb: o.bb, lc: o.lc, lb: o.lb, a: anneauxGeo(o.d) };
  return o.geoSource;
}

/** Rendre à un emplacement la géométrie servie, telle quelle. Relue plutôt que
 *  recalculée : l'ancrage du nom que la synchronisation a posé fait foi, et
 *  refaire le calcul ici ne pourrait au mieux que retomber dessus. */
export function reposeSource(o){
  const s = geometrieSource(o);
  o.d = s.d; o.c = s.c; o.bb = s.bb;
  if (s.lc){ o.lc = s.lc; o.lb = s.lb; }
  else { delete o.lc; delete o.lb; }
}

/** Une géométrie posée sur un emplacement : son tracé, et tout ce qui s'en
 *  déduit — l'ancrage de son nom, la place autour. */
export function poseGeometrie(o, anneaux){
  /* Le relevé de la source se prend ici, et nulle part ailleurs : c'est le
     seul passage obligé de tout ce qui touche à la forme, et le prendre après
     coup relèverait la retouche en croyant relever la source. Un emplacement
     ajouté à la main n'a pas de source : sa forme est sa seule vérité. */
  if (!o.ajout) geometrieSource(o);
  o.d = traceGeo(anneaux);
  const b = boiteGeo(anneaux);
  o.c = b.c; o.bb = b.bb;
  if (b.lc){ o.lc = b.lc; o.lb = b.lb; }
  else { delete o.lc; delete o.lb; }
}

/** La retouche retenue, si elle décrit encore ce que la source sert. */
function retoucheGeo(o){
  const r = reglages()[cleGeo(o.id)];
  return r && Array.isArray(r.p) && r.p.length &&
         r.e === empreinteGeo(geometrieSource(o)) ? r : null;
}

/**
 * L'emprise du pavillon s'élargit à ce qu'on a repris, jamais elle ne se
 * resserre : un stand tiré hors du cadre d'origine doit rester atteignable
 * par l'ajustement de vue, et un cadre resté un peu large ne coûte rien —
 * alors qu'un cadre qui se referme déplacerait le plan sous la main qui
 * travaille.
 */
export function elargitEmprise(p, o){
  const e = p.emprise;
  if (!e || !o.c || !o.bb) return;
  const m = 12;      // la marge que pose la synchronisation
  e.x0 = Math.min(e.x0, arrondiGeo(o.c[0] - o.bb[0] / 2 - m));
  e.y0 = Math.min(e.y0, arrondiGeo(o.c[1] - o.bb[1] / 2 - m));
  e.x1 = Math.max(e.x1, arrondiGeo(o.c[0] + o.bb[0] / 2 + m));
  e.y1 = Math.max(e.y1, arrondiGeo(o.c[1] + o.bb[1] / 2 + m));
}

/**
 * Les retouches appliquées au plan qu'on vient de charger.
 *
 * Appelée par « indexe », une fois l'apparence lue et avant que rien ne soit
 * dessiné : tout ce qui suit — le tracé, les noms, les aimants, la grille de
 * marche — lit la géométrie de l'objet, et doit lire celle qui vaut.
 *
 * Un emplacement qu'on n'a jamais repris passe sans qu'on lise son tracé : la
 * plupart des salons n'en reprennent aucun, et relever neuf cents contours
 * pour n'en retoucher zéro se paierait à chaque ouverture de page.
 */
export function appliqueGeometries(){
  if (!DATA) return;
  DATA.plans.forEach(p => {
    /* Une zone masquée reprise à la main l'est aussi pour le trajet du
       visiteur, qui n'en a que la forme : c'est la reprise qui doit valoir. */
    for (const o of p.stands.concat(p.zones, p.zonesCachees || [])){
      if (!reglages()[cleGeo(o.id)]) continue;
      // `retoucheGeo` relève la géométrie servie avant d'y toucher : c'est
      // elle que l'empreinte décrit, et c'est encore elle qui est en place
      const r = retoucheGeo(o);
      if (!r) continue;
      poseGeometrie(o, r.p);
      elargitEmprise(p, o);
    }
  });
}

/* ------------------------------------------------------------
   Ajouter à une couche ce que la source n'a pas

   La source ne dit pas tout, ou pas à temps : un stand vendu la veille de
   l'ouverture, un îlot redécoupé au montage, une zone — espace presse,
   point de rendez-vous, garderie — que l'organisateur n'a jamais saisie. On
   les dessine alors là où ils seront cherchés : un stand parmi les stands,
   une zone parmi les zones, et non sur un calque de dessin où ils ne
   prendraient ni la couleur de la couche, ni sa place dans la pile, ni la
   recherche, ni la fiche.

   Ils se rangent dans la configuration du salon, une entrée par élément,
   comme la retouche d'une forme — et pour la même raison : la
   synchronisation réécrit l'instantané de la source, jamais la
   configuration. Ils traversent donc toutes les synchronisations, et la
   publication, qui ne renvoie que les clés changées, n'écrase pas celui
   qu'un autre poste vient d'ajouter.

   Une zone ajoutée garde aussi sa fiche dans son entrée. Celle d'une zone de
   la source vit dans les colonnes de l'événement, que le serveur n'applique
   qu'aux zones de l'instantané : la fiche d'une zone qu'il ne connaît pas n'y
   parviendrait jamais au visiteur.
   ------------------------------------------------------------ */
const PREFIXE_AJOUT = "_ajout:";
export const cleAjout = (id) => PREFIXE_AJOUT + id;
const SORTES_AJOUT = { stands: "stand", zones: "zone" };
/* Ce que la fiche d'une zone ajoutée retient, en plus de son nom. Les salles
   de conférence n'y sont pas : leur colonne est indexée par salle, et le
   serveur retrouve les zones ajoutées dans la configuration du pavillon pour
   y rattacher le programme. */
const FICHE_AJOUT = ["nom_en", "type", "description", "description_en", "lien",
                     "logo", "traversable", "masquee"];

/** Des anneaux lisibles : ce qui vient de la configuration a pu être écrit
 *  par une autre version de la page, ou abîmé en route. */
export const anneauxValides = (a) => Array.isArray(a) && a.length > 0 && a.every(r =>
  Array.isArray(r) && r.length > 2 && r.every(q =>
    Array.isArray(q) && isFinite(q[0]) && isFinite(q[1])));

/** Ce sur quoi porte la recherche, comme `indexe` l'assemble pour la source. */
export function rechAjout(o){
  o.rech = (o.kind === "zone"
    ? String(o.nom || "") + " " + String(o.nom_en || "")
    : String(o.nom || "") + " " + String(o.code || "")).toLowerCase();
  if (o.kind === "stand") o.rechProd = "";
}

/** L'objet du plan qu'une entrée décrit, tel que la source l'aurait servi.
 *  « hotes » retrouve l'emplacement de la source auquel un stand est lié. */
export function objetAjoute(id, r, i, hotes){
  const zone = r.sorte === "zones";
  const o = { id: id, ajout: true, kind: SORTES_AJOUT[r.sorte], p: i };
  if (zone) FICHE_AJOUT.forEach(k => { if (r[k]) o[k] = r[k]; });
  poseGeometrie(o, r.p);
  poseLien(o, r, hotes);
  rechAjout(o);
  return o;
}

/**
 * Ce qu'un stand ajouté désigne, s'il est lié à un exposant.
 *
 * Il matérialise alors une société de la source, comme le stand dessiné d'un
 * calque : on lui emprunte son nom, et le numéro de son emplacement s'il n'en
 * a pas reçu un en propre. Une société que la synchronisation a retirée depuis
 * ne laisse pas un stand au nom d'une autre : le lien se tait, le stand
 * redevient ce qu'on lui avait écrit, et la palette dit qu'il est à relier.
 */
export function poseLien(o, r, hotes){
  delete o.lien; delete o.lienPerdu;
  const propre = String(r.code || "").trim();
  o.nom = String(r.nom || "").trim() || null;
  if (o.kind === "stand") o.code = propre;
  if (o.kind !== "stand" || !r.stand) return;
  const h = hotes(String(r.stand));
  const i = Number.isInteger(r.soc) ? r.soc : -1;
  const soc = h && (i < 0 ? h : (h.coex || [])[i]);
  if (!soc){ o.lienPerdu = true; return; }
  o.lien = { stand: h.id, soc: i };
  o.nom = nomSurLePlan(soc) || null;
  o.code = propre || h.code || "";
}

/**
 * Les emplacements ajoutés, versés dans leur pavillon.
 *
 * Appelée par « indexe », les réglages lus et avant toute retouche : ce qui
 * suit — le tracé, les noms, la recherche, les aimants, la grille de marche —
 * ne doit pas savoir d'où vient un stand. Ceux d'un chargement précédent sont
 * retirés d'abord : un second passage les aurait posés deux fois.
 *
 * Une zone ajoutée puis retirée du plan public ne part pas chez le visiteur,
 * comme celle de la source que le serveur écarte ; l'administration la garde,
 * pâlie, pour qu'on puisse revenir sur ce choix.
 */
export function appliqueAjouts(){
  if (!DATA) return;
  const admin = ADMIN || document.documentElement.dataset.role === "admin";
  const rang = new Map(DATA.plans.map((p, i) => [String(p.id), i]));
  DATA.plans.forEach(p => {
    p.stands = p.stands.filter(o => !o.ajout);
    p.zones = p.zones.filter(o => !o.ajout);
    p.zonesCachees = (p.zonesCachees || []).filter(o => !o.ajout);
  });
  const noms = [];
  // l'index n'est pas encore bâti : les emplacements de la source, relevés ici
  const source = new Map(DATA.plans.flatMap(p => p.stands).map(s => [String(s.id), s]));
  const hotes = (id) => source.get(id);
  Object.keys(reglages()).forEach(k => {
    if (k.indexOf(PREFIXE_AJOUT) !== 0) return;
    const r = reglages()[k];
    const i = r ? rang.get(String(r.plan)) : undefined;
    if (i === undefined || !SORTES_AJOUT[r.sorte] || !anneauxValides(r.p)) return;
    const o = objetAjoute(k.slice(PREFIXE_AJOUT.length), r, i, hotes);
    /* Masquée, elle ne paraît pas au visiteur mais reste du terrain : le
       trajet se calcule dans sa page, et doit être celui de la console. */
    if (r.masquee && !admin){
      if (o.kind === "zone") DATA.plans[i].zonesCachees.push(o);
      return;
    }
    DATA.plans[i][r.sorte].push(o);
    elargitEmprise(DATA.plans[i], o);
    if (o.kind === "stand" && o.nom) noms.push(o.nom);
  });
  // un nom d'enseigne ne se traduit pas, qu'il vienne de la source ou d'ici
  if (noms.length) LANGUE.protege(noms);
  nomsAnglaisDesZones();
}
