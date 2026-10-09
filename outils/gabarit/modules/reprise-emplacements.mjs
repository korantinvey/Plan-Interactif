/* ============================================================
   Reprendre et ajouter des emplacements — l'outil de l'exploitant

   La retouche d'une forme venue de la source et l'ajout d'un emplacement
   qu'elle n'a pas, tels que l'exploitant les fait : le cadenas des deux
   couches de données, l'entrée et la sortie du mode, la palette, les
   poignées, le geste, le tracé d'un ajout, son nom, son lien à un exposant
   et sa suppression. Des gestes d'exploitant, que le visiteur ne reçoit pas :
   `plan-admin.mjs` embarque ce module, `plan.mjs` jamais.

   Ce que le visiteur en reçoit — les retouches et les ajouts versés dans le
   pavillon, et le mode en cours, que ce module pose par sa porte
   (`poseSorteGeo`) — vit dans `modules/emplacements.mjs`, qui en dit le
   pourquoi.

   Ce que le code soudé tient encore — les réglages et leur enregistrement, la
   vue, le panneau des calques, le dessin des noms et des distinctions,
   l'outil de dessin — lui est confié par
   `brancheRepriseEmplacements`, que `_geometrie.html` appelle à la place que
   ce code y tenait. Ce qui change sans cesse — les réglages (`CONF`, que le
   changement de salon remplace), la vue, le calque de dessin ouvert — par des
   lecteurs ; ce qui se déclare dans `_dessin.html` par des détours. La
   recherche et la liste s'importent de `recherche.mjs`, la fiche de
   `fiche.mjs`.
   ============================================================ */
import { $ } from "./dom.mjs";
import { DATA, TOUS, parId, poseDonnees, state, P } from "./donnees.mjs";
import { ADMIN } from "./mode-admin.mjs";
import { confirme } from "./fenetre.mjs";
import { anneauxGeo, traceGeo, empreinteGeo, boiteAnneaux, arrondiGeo } from "./forme.mjs";
import { GL, cibleWebgl, priseWebgl } from "./webgl.mjs";
import { oublieGrilles } from "./itineraire.mjs";
import { dessineMarques } from "./parcours.mjs";
import { PLACE_LIBELLES } from "./libelle-place.mjs";
import { modePlacementLibelles } from "./placement-libelles.mjs";
import { ecritMetres, coteCadre, montreCote, oublieAimantsDuPlan, coinsGeste, montreAimants, correction,
  aimante } from "./aimants.mjs";
import { ficheZone } from "./fiche-zone.mjs";
import { SORTE_GEO, poseSorteGeo, cleGeo, cleAjout, geometrieSource, reposeSource, poseGeometrie,
  elargitEmprise, anneauxValides, rechAjout, objetAjoute, poseLien } from "./emplacements.mjs";
import { svg, vue, cadrePlan, versPlan } from "./vue.mjs";
import { appliqueSecteurs, marqueRetrait, liste } from "./recherche.mjs";
import { ouvre, ferme } from "./fiche.mjs";
import { libelles } from "./libelles.mjs";
import { oublieDists, dessineDists } from "./distinctions.mjs";
import { baliseZone, baliseStand } from "./rendu.mjs";

/**
 * Ce que le code soudé confie au branchement. La vue et le plan s'importent
 * de `vue.mjs`, le dessin des noms, les distinctions et le balisage d'un
 * emplacement de `libelles.mjs`, `distinctions.mjs` et `rendu.mjs`.
 * @typedef {object} PageRepriseEmplacements
 * @property {() => Record<string, any>} conf les réglages du moment, `CONF`
 * @property {(cle: string) => any} confDe une entrée des réglages, ouverte au besoin, `conf`
 * @property {() => any} calqueActif l'identifiant du calque en cours d'édition, `calqueActif`
 * @property {() => void} enregistreConf
 * @property {() => void} construitPanneau
 * @property {() => void} nomsAnglaisDesZones
 * @property {(cle: string) => boolean} optionActive
 * @property {(ferme: boolean) => string} pictoVerrou
 * @property {(id: any) => void} activeCalque
 * @property {() => void} remplitListeSocietes
 * @property {(texte: string) => any} societeSaisie
 * @property {(o: any, soc: any) => string} etiquetteSociete
 * @property {(d: string | null) => void} apercu
 * @property {(d: string | null) => void} apercuGuide
 * @property {(p: number[], pts: number[][]) => boolean} fermeIci
 * @property {(f: any) => string} cheminForme
 * @property {() => string} nouvelId
 */
/** @type {PageRepriseEmplacements} */
let soude;
const reglages = () => soude.conf();
const conf = (/** @type {string} */ cle) => soude.confDe(cle);
const calqueActif = () => soude.calqueActif();
const enregistreConf = () => soude.enregistreConf();
const construitPanneau = () => soude.construitPanneau();
const nomsAnglaisDesZones = () => soude.nomsAnglaisDesZones();
const optionActive = (/** @type {string} */ cle) => soude.optionActive(cle);
const pictoVerrou = (/** @type {boolean} */ f) => soude.pictoVerrou(f);
const activeCalque = (/** @type {any} */ id) => soude.activeCalque(id);
const remplitListeSocietes = () => soude.remplitListeSocietes();
const societeSaisie = (/** @type {string} */ texte) => soude.societeSaisie(texte);
const etiquetteSociete = (/** @type {any} */ o, /** @type {any} */ soc) => soude.etiquetteSociete(o, soc);
const apercu = (/** @type {string | null} */ d) => soude.apercu(d);
const apercuGuide = (/** @type {string | null} */ d) => soude.apercuGuide(d);
const fermeIci = (/** @type {number[]} */ p, /** @type {number[][]} */ pts) => soude.fermeIci(p, pts);
const cheminForme = (/** @type {any} */ f) => soude.cheminForme(f);
const nouvelId = () => soude.nouvelId();
const racine = document.documentElement;

/* Le choix et le geste sont transitoires, comme le mode : ils ne se
   retiennent pas d'une visite à l'autre. */
/** @type {any} */
export let geoSel = null;       // l'emplacement dont on reprend la forme
/** @type {any} */
let glisseGeo = null;    // le geste en cours

/** Le geste abandonné : le pointeur annulé ne relâchera rien (`_gestes.html`). */
export function lacheGeo(){
  glisseGeo = null;
}

export let outilGeo = "";       // « », « rect » ou « poly » : choisir, ou ajouter
/** @type {any} */
export let traceAjout = null;   // la forme en cours de tracé

/* ------------------------------------------------------------
   Le verrou des deux couches de données

   Un calque de dessin naît ouvert : c'est pour y dessiner qu'on le crée. Les
   emplacements, eux, sont là depuis la synchronisation, et neuf fois sur dix
   on ne vient au panneau que pour les recolorer ou les masquer. Leur cadenas
   est donc fermé d'avance — la géométrie du salon ne se reprend pas par
   inadvertance, il faut l'avoir voulu.

   D'où la clé inversée : c'est l'ouverture qui s'écrit, et refermer efface
   plutôt que d'écrire « non ». L'état ordinaire ne laisse rien derrière lui.
   ------------------------------------------------------------ */
const cleVerrouGeo = (sorte) => "_verrouGeo:" + sorte;
export const geoVerrouille = (sorte) => !(reglages()[cleVerrouGeo(sorte)] || {}).ouvert;

export function basculeVerrouGeo(sorte){
  const cle = cleVerrouGeo(sorte);
  if (geoVerrouille(sorte)) conf(cle).ouvert = true;
  else {
    delete reglages()[cle];
    // on referme parfois la couche qu'on vient de reprendre : le mode se
    // ferme avec elle, plutôt que de rester armé sur ce qu'on protège
    if (SORTE_GEO === sorte) modeGeometrie(null);
  }
  enregistreConf();
  construitPanneau();
}

/** Le cadenas d'une couche de données. Comme celui d'un calque de dessin :
 *  un interrupteur, dont l'intitulé dit ce que le clic fera. */
export function boutonVerrouGeo(sorte){
  const ferme = geoVerrouille(sorte);
  return '<button class="verr vgeo" aria-pressed="' + ferme + '" title="' +
    (ferme ? "Déverrouiller : la géométrie pourra être reprise"
           : "Verrouiller : la géométrie ne se reprend plus") +
    '">' + pictoVerrou(ferme) + '</button>';
}

/* ------------------------------------------------------------
   Entrer et sortir du mode
   ------------------------------------------------------------ */
export function modeGeometrie(sorte){
  const avant = SORTE_GEO;
  poseSorteGeo((ADMIN && sorte && !geoVerrouille(sorte)) ? sorte : null);
  racine.classList.toggle("mode-geo-stands", SORTE_GEO === "stands");
  racine.classList.toggle("mode-geo-zones", SORTE_GEO === "zones");
  /* Le dessin, le placement des libellés et la reprise d'une forme se
     disputeraient le glisser : entrer dans l'un referme les autres, plutôt
     que de laisser trois gestes viser le même pointeur. */
  if (SORTE_GEO){
    if (calqueActif()) activeCalque(calqueActif());
    if (PLACE_LIBELLES) modePlacementLibelles(false);
  }
  /* Passer d'une couche à l'autre ne garde pas le choix : ses poignées
     seraient restées sur un stand alors qu'on reprend les zones. */
  if (SORTE_GEO === "stands" && SORTE_GEO !== avant) remplitListeSocietes();
  if (SORTE_GEO !== avant){ glisseGeo = null; fermeAjout(false); outilGeo = ""; svg.style.cursor = ""; choisitGeo(null); }
  /* On sort d'ici par plusieurs chemins — le crayon, la croix de la palette,
     la touche d'échappement, l'ouverture d'un calque, le cadenas qu'on
     referme. Les crayons s'allument donc ici, une fois pour tous. */
  document.querySelectorAll("#pile .rgeo").forEach(b =>
    b.setAttribute("aria-pressed", b.dataset.geo === SORTE_GEO));
  montreAimants(null); montreCote(null); apercuGuide(null);
  dessinePoigneesGeo();
  majPaletteGeo();
}

/** L'emplacement sous le pointeur, s'il est de la sorte qu'on reprend. */
function objetGeoSous(e){
  if (!SORTE_GEO) return null;
  const g = GL.actif ? cibleWebgl(e.clientX, e.clientY)
                     : e.target.closest("#stands > g[data-id], #zones > g[data-id]");
  if (!g || !g.parentNode || g.parentNode.id !== SORTE_GEO) return null;
  // un stand ajouté et lié porte en « data-id » l'exposant, en « data-aj » lui-même
  return parId.get(g.dataset.aj || g.dataset.id) || null;
}

/** Le groupe qui porte le tracé d'un emplacement du pavillon affiché. */
function groupeGeo(o){
  const hote = $(o.kind === "zone" ? "zones" : "stands");
  if (!hote) return null;
  const q = CSS.escape(o.id);
  return o.ajout ? hote.querySelector('g[data-aj="' + q + '"]')
                 : hote.querySelector('g[data-id="' + q + '"]:not([data-aj])');
}

export function choisitGeo(id){
  geoSel = id;
  document.querySelectorAll("#stands > g, #zones > g")
    .forEach(g => g.classList.toggle("geopick",
      Boolean(id) && (g.dataset.aj || g.dataset.id) === id));
  dessinePoigneesGeo();
  majPaletteGeo();
}

/* ------------------------------------------------------------
   Les poignées
   ------------------------------------------------------------ */

/** La géométrie est-elle un rectangle d'aplomb ? Alors ses coins commandent,
 *  et la forme reste un rectangle. */
function cadreGeo(a){
  if (a.length !== 1 || a[0].length !== 4) return null;
  const r = a[0];
  for (let i = 0; i < 4; i++){
    const b = r[(i + 1) % 4];
    if (r[i][0] !== b[0] && r[i][1] !== b[1]) return null;       // un côté oblique
  }
  const xs = new Set(r.map(p => p[0])), ys = new Set(r.map(p => p[1]));
  return xs.size === 2 && ys.size === 2 ? boiteAnneaux(a) : null;
}

/**
 * Ce qu'on peut attraper sur une géométrie, et ce que chaque prise commande.
 *
 * Un rectangle d'aplomb se reprend par ses coins, la poignée opposée tenant
 * bon : c'est ce qu'on attend d'un stand, et tirer un seul de ses quatre
 * sommets en aurait fait un trapèze. Toute autre forme — un L, une zone au
 * contour libre — se reprend sommet par sommet, faute d'une règle qui vaille
 * pour toutes.
 */
function prisesGeo(o){
  const a = anneauxGeo(o.d);
  const b = cadreGeo(a);
  if (b) return { a: a, cadre: true,
                  mains: [[b[0], b[1]], [b[2], b[1]], [b[2], b[3]], [b[0], b[3]]]
                           .map(p => ({ p: p })) };
  return { a: a, cadre: false,
           mains: a.flatMap((r, i) => r.map((p, j) => ({ p: p, r: i, i: j }))) };
}

/** Le curseur annonce ce que la poignée fera : un coin de rectangle tire en
 *  diagonale, un sommet libre va où l'on veut. */
const curseurGeo = (cadre, i) =>
  cadre ? ["nwse-resize", "nesw-resize", "nwse-resize", "nesw-resize"][i] : "move";

export function dessinePoigneesGeo(){
  let g = $("poigneesGeo");
  if (!g){
    g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.id = "poigneesGeo";
    svg.appendChild(g);
  }
  const o = SORTE_GEO && geoSel && parId.get(geoSel);
  if (!o || !ADMIN){ g.innerHTML = ""; return; }
  const pr = prisesGeo(o);
  const r = cadrePlan();
  const t = Math.max(.15, vue().w / (r.width || 1) * 5);     // demi-côté, en mètres
  const b = boiteAnneaux(pr.a);
  g.innerHTML =
    '<rect class="cadreSel" x="' + (b[0] - t) + '" y="' + (b[1] - t) +
    '" width="' + (b[2] - b[0] + 2 * t) + '" height="' + (b[3] - b[1] + 2 * t) + '"/>' +
    pr.mains.map((m, i) =>
      '<rect class="pgn" data-i="' + i + '" style="cursor:' + curseurGeo(pr.cadre, i) + '"' +
      ' x="' + (m.p[0] - t) + '" y="' + (m.p[1] - t) +
      '" width="' + (2 * t) + '" height="' + (2 * t) + '"/>').join("");
}

/* ------------------------------------------------------------
   La palette
   ------------------------------------------------------------ */

/** Ce que les deux champs disent de la forme reprise. On n'écrit que ce qui
 *  change : réécrire un champ qu'on remplit y replacerait le curseur. */
function ecritDimensionsGeo(o){
  const z = $("geoDim");
  if (!z) return;
  const b = o && cadreGeo(anneauxGeo(o.d));
  z.hidden = !b;
  if (!b) return;
  const met = (id, v) => { const c = $(id); if (+c.value !== v) c.value = v; };
  met("geoLargeur", arrondiGeo(b[2] - b[0]));
  met("geoHauteur", arrondiGeo(b[3] - b[1]));
}

/** Le nom de la couche qu'on reprend, tel que le panneau des calques l'écrit. */
const nomSorteGeo = (sorte) => sorte === "zones" ? "Zones organisateur" : "Stands";

export function majPaletteGeo(){
  const z = $("geoReg");
  if (!z || !ADMIN || !$("geoNom")) return;
  z.classList.toggle("open", Boolean(SORTE_GEO));
  if (!SORTE_GEO) return;
  const o = geoSel && parId.get(geoSel);
  $("geoNom").textContent = o
    ? (o.nom || o.code || (o.kind === "zone" ? "Zone sans nom" : "Stand"))
    : nomSorteGeo(SORTE_GEO);
  $("geoOrigine").disabled = !(o && reglages()[cleGeo(o.id)]);
  // un emplacement ajouté n'a pas d'origine où revenir : il se supprime
  $("geoOrigine").hidden = Boolean(o && o.ajout);
  $("geoSupprime").hidden = !(o && o.ajout);
  $("geoFiche").hidden = !(o && o.ajout && o.kind === "zone");
  ecritInfosAjout(o);
  ecritDimensionsGeo(o);
  $("geoReg").querySelectorAll(".geoOutils button").forEach(b =>
    b.setAttribute("aria-pressed", b.dataset.g === outilGeo));
  $("geoAide").textContent = outilGeo
    ? aideAjout()
    : !o
    ? (SORTE_GEO === "zones" ? "Cliquez une zone pour reprendre sa forme, ou ajoutez-en une."
                             : "Cliquez un emplacement pour reprendre sa forme, ou ajoutez-en un.")
    : (reglages()[cleGeo(o.id)]
        ? "Glissez la forme ou ses poignées, ou ajustez-la aux flèches du clavier."
        : "Glissez la forme pour la déplacer, ou ses poignées pour la redimensionner. " +
          "Elle s'accroche aux emplacements voisins — Alt pour relâcher.");
}

/* ------------------------------------------------------------
   Enregistrer, et rendre sa forme d'origine
   ------------------------------------------------------------ */

/**
 * Ce qu'une forme déplacée périme : les points d'accrochage du pavillon,
 * l'enveloppe du hall et la grille de marche, qui la lisent tous les trois.
 * Refait à la fin du geste, jamais pendant : relever les sommets de neuf
 * cents emplacements à chaque image ne tiendrait pas la cadence.
 */
function finGesteGeo(o){
  const p = DATA.plans[o.p];
  oublieAimantsDuPlan();
  if (p){ p.enveloppe = null; elargitEmprise(p, o); }
  oublieGrilles();
  dessineMarques();
  /* Les marques des distinctions recopient le tracé du stand, ou la boîte de
     son tracé, et leur relevé ne se refaisait qu'au changement de pavillon ou
     de mode : le liseré d'un nouvel exposant restait sur l'ancien contour,
     décalé du stand qu'il désigne. Ici, et non dans `retraceGeo` : la forme se
     tire à la souris, et refaire le relevé de tous les stands à chaque image du
     geste coûterait plus que la marque ne vaut. */
  oublieDists();
  dessineDists();
  libelles();
}

/** Retenir la forme reprise, avec l'empreinte de celle dont elle part. */
function enregistreGeo(o){
  if (o.ajout){ enregistreAjout(o); return; }
  const a = anneauxGeo(o.d);
  const src = geometrieSource(o);
  /* Une forme revenue sur celle de la source n'est pas une retouche : elle
     sort de la configuration plutôt que d'y peser et d'y vieillir. */
  if (traceGeo(a) === traceGeo(src.a)) delete reglages()[cleGeo(o.id)];
  else reglages()[cleGeo(o.id)] = { e: empreinteGeo(src), p: a };
  enregistreConf();
  finGesteGeo(o);
  majPaletteGeo();
}

/** Renoncer à une reprise : l'emplacement retrouve la forme de la source. */
function geometrieOrigine(){
  const o = geoSel && parId.get(geoSel);
  if (!o) return;
  reposeSource(o);
  retraceGeo(o);
  delete reglages()[cleGeo(o.id)];
  enregistreConf();
  finGesteGeo(o);
  dessinePoigneesGeo();
  majPaletteGeo();
}

/** Le tracé du plan suit la géométrie qu'on vient de poser. Le liseré du
 *  parcours et celui de la sélection sont recopiés ailleurs : ils ne suivent
 *  que si l'emplacement en porte un. */
function retraceGeo(o){
  const g = groupeGeo(o);
  if (!g) return;
  const t = g.querySelector("path");
  if (t) t.setAttribute("d", o.d);
  if (g.classList.contains("enparcours") || g.classList.contains("sel")) dessineMarques();
}

/** Le clavier ajuste au quart de mètre ce que la main a posé à peu près, et
 *  au mètre touche majuscule tenue : le pas des libellés et des formes
 *  dessinées, pour n'avoir qu'une convention à retenir. */
export function pousseGeometrie(dx, dy){
  const o = geoSel && parId.get(geoSel);
  if (!o) return;
  poseGeometrie(o, anneauxGeo(o.d).map(r =>
    r.map(p => [arrondiGeo(p[0] + dx), arrondiGeo(p[1] + dy)])));
  retraceGeo(o);
  dessinePoigneesGeo();
  enregistreGeo(o);
}

/**
 * La taille exacte d'un emplacement rectangulaire.
 *
 * Le coin supérieur gauche ne bouge pas : on corrige une dimension, on ne
 * déplace pas ce qui était déjà bien placé. C'est là qu'on rattrape les
 * six mètres cinq d'un stand que la source dit six mètres.
 */
function appliqueDimensionGeo(){
  const o = geoSel && parId.get(geoSel);
  const b = o && cadreGeo(anneauxGeo(o.d));
  if (!b) return;
  const l = +$("geoLargeur").value, h = +$("geoHauteur").value;
  // un champ vidé, ou en cours de frappe, n'est pas une taille
  if (!(l > 0) || !(h > 0)) return;
  const x1 = arrondiGeo(b[0] + l), y1 = arrondiGeo(b[1] + h);
  poseGeometrie(o, [[[b[0], b[1]], [x1, b[1]], [x1, y1], [b[0], y1]]]);
  retraceGeo(o);
  dessinePoigneesGeo();
  enregistreGeo(o);
}

/** Retenir la forme d'un emplacement ajouté, là où il vit. */
function enregistreAjout(o){
  const r = reglages()[cleAjout(o.id)];
  if (r) r.p = anneauxGeo(o.d);
  enregistreConf();
  finGesteGeo(o);
  majPaletteGeo();
}

/**
 * Un emplacement neuf, à sa place dans la couche.
 *
 * Posé dans le groupe de sa couche plutôt que par un remontage du pavillon :
 * celui-ci viderait l'historique des dessins et refermerait ce qu'on a ouvert,
 * pour un seul stand de plus.
 */
function ajouteEmplacement(anneaux){
  const sorte = SORTE_GEO;
  if (!sorte || !anneauxValides(anneaux)) return;
  const id = "ajout-" + nouvelId();
  const r = { plan: P().id, sorte: sorte, p: anneaux };
  reglages()[cleAjout(id)] = r;
  enregistreConf();
  const o = objetAjoute(id, r, state.plan, (h) => parId.get(h));
  P()[sorte].push(o);
  TOUS.push(o);
  parId.set(o.id, o);
  $(sorte).insertAdjacentHTML("beforeend",
    o.kind === "zone" ? baliseZone(o) : baliseStand(o));
  // la couleur d'un secteur et le retrait d'une recherche se posent sur les
  // groupes : celui-ci vient de naître
  appliqueSecteurs();
  marqueRetrait();
  finGesteGeo(o);
  liste();
  /* L'outil reste pris : un îlot se découpe en cinq stands d'affilée. Le
     dernier posé est choisi, et son champ offert, pour qu'on le numérote
     avant de tracer le suivant. */
  choisitGeo(o.id);
  const champ = $(o.kind === "zone" ? "geoTitre" : "geoCode");
  if (champ){ champ.focus(); champ.select(); }
}

/** Le numéro ou le nom d'un emplacement ajouté, tel qu'on le tape. */
function renommeAjout(champ, valeur){
  const o = geoSel && parId.get(geoSel);
  const r = o && o.ajout && reglages()[cleAjout(o.id)];
  if (!r) return;
  const v = String(valeur || "").trim();
  if (v) r[champ] = v; else delete r[champ];
  // lié, le stand reprend le numéro de l'emplacement quand on efface le sien
  if (champ === "code") o.code = v || (o.lien ? (parId.get(o.lien.stand) || {}).code || "" : "");
  else {
    o.nom = v || null;
    if (o.kind === "stand" && v) LANGUE.protege([v]);
    if (o.kind === "zone") nomsAnglaisDesZones();
  }
  rechAjout(o);
  const g = groupeGeo(o);
  if (g) g.setAttribute("aria-label", o.kind === "zone" ? (o.nom || "zone")
                                      : (o.nom || ("Stand " + (o.code || ""))));
  enregistreConf();
  libelles();
  $("geoNom").textContent = o.nom || o.code ||
    (o.kind === "zone" ? "Zone sans nom" : "Stand");
  if (state.sel === o.id) ouvre(o, null);
}

/**
 * Lier un stand ajouté à un exposant, ou l'en délier.
 *
 * Le groupe se refait sur place : ce sont ses attributs qui disent ce qu'il
 * désigne, et le clic, la couleur du secteur et la chaleur les lisent. Il
 * quitte ou rejoint aussi la liste — lié, il n'est que la forme de l'exposant,
 * qui y figure déjà.
 */
function lieAjout(texte){
  const o = geoSel && parId.get(geoSel);
  const r = o && o.ajout && o.kind === "stand" && reglages()[cleAjout(o.id)];
  if (!r) return;
  const v = String(texte || "").trim();
  const l = v ? societeSaisie(v) : null;
  if (v && !l){
    $("geoAide").textContent = "Exposant introuvable : choisissez-le dans la liste.";
    return;
  }
  if (l){ r.stand = l.o.id; r.soc = l.i; } else { delete r.stand; delete r.soc; }
  enregistreConf();
  poseLien(o, r, (h) => parId.get(h));
  rechAjout(o);
  poseDonnees({ TOUS: TOUS.filter(x => x !== o) });
  if (!o.lien) TOUS.push(o);
  const g = groupeGeo(o);
  if (g){
    g.outerHTML = baliseStand(o);
    groupeGeo(o).classList.add("geopick");
  }
  appliqueSecteurs();
  marqueRetrait();
  libelles(); liste();
  majPaletteGeo();
}

/** Les champs d'un emplacement ajouté. On n'écrit que ce qui change : réécrire
 *  un champ qu'on remplit y replacerait le curseur. */
function ecritInfosAjout(o){
  const z = $("geoInfos");
  if (!z) return;
  z.hidden = !(o && o.ajout);
  if (z.hidden) return;
  const stand = o.kind === "stand";
  $("geoCodeL").hidden = !stand;
  $("geoSocL").hidden = !stand;
  // lié, le stand porte le nom de l'exposant : il n'y a rien à écrire
  $("geoTitreL").hidden = Boolean(o.lien);
  /* Le lien se vend avec le dessin des stands : sans l'option, le champ se
     ferme comme celui du calque de dessin, et ce qui est déjà lié le reste. */
  $("geoSoc").disabled = !optionActive("dessinStand");
  const r = reglages()[cleAjout(o.id)] || {};
  const met = (id, v) => { const c = $(id); if (c.value !== v && document.activeElement !== c) c.value = v; };
  met("geoCode", String(r.code || (o.lien ? "" : o.code) || ""));
  $("geoCode").placeholder = o.lien ? String(o.code || "B42") : "B42";
  met("geoTitre", String(o.nom || ""));
  const l = o.lien && parId.get(o.lien.stand);
  const soc = l && (o.lien.soc < 0 ? l : (l.coex || [])[o.lien.soc]);
  met("geoSoc", soc ? etiquetteSociete(l, soc) || "" : "");
  $("geoSoc").placeholder = o.lienPerdu ? "Exposant introuvable — à relier"
                                        : "Facultatif — ouvre sa fiche";
  $("geoTitre").placeholder = o.kind === "zone" ? "Espace presse, garderie…" : "Nom de l'exposant";
}

/** Supprimer un emplacement ajouté : lui seul se retire, la source n'y perd rien. */
function supprimeAjout(){
  const o = geoSel && parId.get(geoSel);
  if (!o || !o.ajout) return;
  const zone = o.kind === "zone";
  const nom = o.nom || o.code;
  confirme(zone ? "Supprimer la zone ?" : "Supprimer le stand ?",
    nom ? "« " + nom + " » sera retiré du plan, pour tous les visiteurs une fois publié."
        : zone ? "Cette zone sera retirée du plan, pour tous les visiteurs une fois publié."
               : "Ce stand sera retiré du plan, pour tous les visiteurs une fois publié.",
    "Supprimer", () => {
      delete reglages()[cleAjout(o.id)];
      enregistreConf();
      const p = DATA.plans[o.p];
      const sorte = o.kind === "zone" ? "zones" : "stands";
      p[sorte] = p[sorte].filter(x => x !== o);
      poseDonnees({ TOUS: TOUS.filter(x => x !== o) });
      parId.delete(o.id);
      const g = groupeGeo(o);
      if (g) g.remove();
      if (state.sel === o.id) ferme();
      choisitGeo(null);
      finGesteGeo(o);
      liste();
    });
}

/* ------------------------------------------------------------
   Le tracé d'un emplacement ajouté
   ------------------------------------------------------------ */
export function choisitOutilGeo(o){
  fermeAjout(false);
  outilGeo = o === "rect" || o === "poly" ? o : "";
  svg.style.cursor = outilGeo ? "crosshair" : "";
  majPaletteGeo();
}

function aideAjout(){
  const zone = SORTE_GEO === "zones";
  if (outilGeo === "rect") return zone
    ? "Glissez pour tracer la zone. Elle s'accroche aux emplacements voisins — Alt pour relâcher."
    : "Glissez pour tracer le stand. Il s'accroche aux emplacements voisins — Alt pour relâcher.";
  if (traceAjout)
    return "Cliquez le sommet suivant ; revenez sur le premier, ou Entrée, pour fermer. Échap renonce.";
  return zone ? "Cliquez le premier sommet de la zone." : "Cliquez le premier sommet du stand.";
}

export function fermeAjout(valider){
  const t = traceAjout;
  traceAjout = null;
  apercu(null); apercuGuide(null); montreCote(null); montreAimants(null);
  if (valider && t && t.t === "poly" && t.pts.length >= 3)
    ajouteEmplacement([t.pts.map(q => [arrondiGeo(q[0]), arrondiGeo(q[1])])]);
  if (SORTE_GEO) majPaletteGeo();
}

function ajoutPointerDown(e){
  e.preventDefault();
  const p = aimante(versPlan(e.clientX, e.clientY), { alt: e.altKey });
  if (outilGeo === "rect"){
    traceAjout = { t: "rect", pts: [p, p] };
    try { svg.setPointerCapture(e.pointerId); } catch (err) {}
    return true;
  }
  if (!traceAjout) traceAjout = { t: "poly", pts: [p] };
  else if (fermeIci(p, traceAjout.pts)){ fermeAjout(true); return true; }
  else traceAjout.pts.push(p);
  apercu(cheminForme({ t: "ligne", pts: traceAjout.pts }));
  majPaletteGeo();
  return true;
}

function ajoutPointerMove(e){
  const brut = versPlan(e.clientX, e.clientY);
  if (!traceAjout){
    // rien de commencé : on montre ce qui s'accrocherait, et la vue reste libre
    montreAimants([brut], { alt: e.altKey });
    return false;
  }
  const p = aimante(brut, { alt: e.altKey });
  if (traceAjout.t === "rect"){
    traceAjout.pts[1] = p;
    apercu(cheminForme(traceAjout));
    montreCote(coteCadre(traceAjout.pts[0], p), p);
  } else {
    const pts = traceAjout.pts;
    const q = fermeIci(p, pts) ? pts[0] : p;
    apercu(cheminForme({ t: "ligne", pts: pts.concat([q]) }));
    const b = pts[pts.length - 1];
    montreCote(ecritMetres(Math.hypot(q[0] - b[0], q[1] - b[1])) + " m", q);
  }
  return true;
}

function ajoutPointerUp(e){
  if (!traceAjout) return false;
  // le polygone reste ouvert d'un clic à l'autre
  if (traceAjout.t !== "rect") return true;
  try { if (svg.hasPointerCapture(e.pointerId)) svg.releasePointerCapture(e.pointerId); } catch (err) {}
  const [a, b] = traceAjout.pts;
  traceAjout = null;
  apercu(null); montreCote(null);
  // un clic sans glisser n'est pas un stand : on ne pose pas un point
  if (Math.abs(b[0] - a[0]) > .3 && Math.abs(b[1] - a[1]) > .3){
    const x0 = arrondiGeo(Math.min(a[0], b[0])), y0 = arrondiGeo(Math.min(a[1], b[1]));
    const x1 = arrondiGeo(Math.max(a[0], b[0])), y1 = arrondiGeo(Math.max(a[1], b[1]));
    ajouteEmplacement([[[x0, y0], [x1, y0], [x1, y1], [x0, y1]]]);
  } else majPaletteGeo();
  return true;
}

/* ------------------------------------------------------------
   Le geste ; chaque fonction renvoie vrai si l'événement est consommé
   ------------------------------------------------------------ */
export function geometriePointerDown(e){
  if (!SORTE_GEO) return false;
  if (outilGeo) return ajoutPointerDown(e);
  const o = geoSel && parId.get(geoSel);
  const pgn = GL.actif ? priseWebgl(e.clientX, e.clientY, ".pgn") : e.target.closest(".pgn");
  if (pgn && o){
    e.preventDefault();
    const pr = prisesGeo(o);
    glisseGeo = { o: o, type: "poignee", i: +pgn.dataset.i, depart: versPlan(e.clientX, e.clientY),
                  a: pr.a, cadre: pr.cadre, mains: pr.mains };
    svg.style.cursor = curseurGeo(pr.cadre, glisseGeo.i);
    try { svg.setPointerCapture(e.pointerId); } catch (err) {}
    return true;
  }
  const cible = objetGeoSous(e);
  if (!cible){
    // le vide déselectionne, et laisse le glisser à la vue
    if (geoSel) choisitGeo(null);
    return false;
  }
  e.preventDefault();
  if (cible.id !== geoSel) choisitGeo(cible.id);
  glisseGeo = { o: cible, type: "deplace", depart: versPlan(e.clientX, e.clientY),
                a: anneauxGeo(cible.d) };
  svg.style.cursor = "move";
  try { svg.setPointerCapture(e.pointerId); } catch (err) {}
  return true;
}

/** Une forme ne s'accroche pas à elle-même : ses propres coins la
 *  retiendraient sur place à chaque tentative de la déplacer. */
const accrocheGeo = (e, o) => ({ alt: e.altKey, saufPlan: o.id });

export function geometriePointerMove(e){
  if (SORTE_GEO && outilGeo) return ajoutPointerMove(e);
  if (!glisseGeo) return false;
  const o = glisseGeo.o;
  const p = versPlan(e.clientX, e.clientY);
  let dx = p[0] - glisseGeo.depart[0], dy = p[1] - glisseGeo.depart[1];
  const acc = accrocheGeo(e, o);
  let anneaux;

  if (glisseGeo.type === "deplace"){
    /* Le déplacement s'accroche par les coins de la forme et par son centre,
       et retient la plus petite correction : glisser un stand contre son
       voisin le range par celui de ses bords qui arrive le premier. */
    const c = correction(coinsGeste(glisseGeo.a.flat(), false).map(q => [q[0] + dx, q[1] + dy]), acc);
    dx += c[0]; dy += c[1];
    anneaux = glisseGeo.a.map(r => r.map(q => [arrondiGeo(q[0] + dx), arrondiGeo(q[1] + dy)]));
  } else if (glisseGeo.cadre){
    // la poignée opposée reste fixe ; le rectangle reste un rectangle
    const coins = glisseGeo.mains.map(m => m.p);
    const fixe = coins[(glisseGeo.i + 2) % 4];
    let mx = coins[glisseGeo.i][0] + dx, my = coins[glisseGeo.i][1] + dy;
    const c = correction([[mx, my]], acc);
    mx += c[0]; my += c[1];
    /* Un emplacement réduit à rien n'est plus saisissable sur le plan, et
       celui-là ne se redessine pas : on l'arrête avant qu'il ne disparaisse. */
    const MINI = .2;
    if (Math.abs(mx - fixe[0]) < MINI) mx = fixe[0] + Math.sign(mx - fixe[0] || 1) * MINI;
    if (Math.abs(my - fixe[1]) < MINI) my = fixe[1] + Math.sign(my - fixe[1] || 1) * MINI;
    const x0 = arrondiGeo(Math.min(fixe[0], mx)), y0 = arrondiGeo(Math.min(fixe[1], my));
    const x1 = arrondiGeo(Math.max(fixe[0], mx)), y1 = arrondiGeo(Math.max(fixe[1], my));
    anneaux = [[[x0, y0], [x1, y0], [x1, y1], [x0, y1]]];
  } else {
    const m = glisseGeo.mains[glisseGeo.i];
    anneaux = glisseGeo.a.map(r => r.map(q => q.slice()));
    anneaux[m.r][m.i] = aimante([arrondiGeo(m.p[0] + dx), arrondiGeo(m.p[1] + dy)], acc);
  }

  poseGeometrie(o, anneaux);
  retraceGeo(o);
  dessinePoigneesGeo();
  /* Le nom suit la forme pendant qu'on la tire : c'est souvent pour lui qu'on
     la reprend — un libellé à cheval sur l'allée dit un stand mal découpé. */
  libelles();
  /* La cote et les champs suivent le geste : c'est en le retenant qu'on
     s'arrête sur douze mètres, pas en le vérifiant après coup. */
  const b = boiteAnneaux(anneaux);
  montreCote(coteCadre([b[0], b[1]], [b[2], b[3]]), [b[2], b[3]]);
  ecritDimensionsGeo(o);
  return true;
}

export function geometriePointerUp(e){
  if (SORTE_GEO && outilGeo) return ajoutPointerUp(e);
  if (!glisseGeo) return false;
  const o = glisseGeo.o;
  glisseGeo = null;
  svg.style.cursor = "";
  try { if (svg.hasPointerCapture(e.pointerId)) svg.releasePointerCapture(e.pointerId); } catch (err) {}
  apercuGuide(null); montreCote(null); montreAimants(null);
  enregistreGeo(o);
  return true;
}

/**
 * Le branchement : `_geometrie.html` l'appelle à la place que ce code y tenait.
 * La palette reçoit ici ses écoutes, à leur rang parmi celles du plan.
 *
 * @param {PageRepriseEmplacements} page
 */
export function brancheRepriseEmplacements(page){
  soude = page;
  if ($("geoFerme")) $("geoFerme").onclick = () => modeGeometrie(null);
  if ($("geoOrigine")) $("geoOrigine").onclick = geometrieOrigine;
  if ($("geoLargeur")) $("geoLargeur").oninput = appliqueDimensionGeo;
  if ($("geoHauteur")) $("geoHauteur").oninput = appliqueDimensionGeo;
  if ($("geoReg")) $("geoReg").querySelectorAll(".geoOutils button").forEach(b =>
    b.onclick = () => choisitOutilGeo(b.dataset.g));
  if ($("geoCode")) $("geoCode").oninput = () => renommeAjout("code", $("geoCode").value);
  if ($("geoTitre")) $("geoTitre").oninput = () => renommeAjout("nom", $("geoTitre").value);
  // le lien ne se pose qu'une fois l'exposant choisi, pas à chaque lettre tapée
  if ($("geoSoc")) $("geoSoc").onchange = () => lieAjout($("geoSoc").value);
  // la liste se range par nom : on la refait une fois le mot écrit, pas à chaque lettre
  ["geoCode", "geoTitre"].forEach(id => { if ($(id)) $(id).onchange = () => liste(); });
  if ($("geoSupprime")) $("geoSupprime").onclick = supprimeAjout;
  if ($("geoFiche")) $("geoFiche").onclick = () => {
    const o = geoSel && parId.get(geoSel);
    if (o && o.ajout && o.kind === "zone") ficheZone(o);
  };
}
