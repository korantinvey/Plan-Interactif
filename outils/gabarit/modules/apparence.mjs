/* ============================================================
   L'apparence des calques, et les commandes posées sur le plan

   Le plan public la pose à chaque chargement et à
   chaque changement de pavillon (`appliqueApparence`), et l'exploitant y
   revient à chaque couleur ou case de la pile (`pile.mjs`) et des volets
   (`volets.mjs`). Les options prises par le salon s'importent
   (`options.mjs` `appliqueOptions`), les secteurs de `recherche.mjs`, les
   marques des distinctions de `distinctions.mjs`. Le parcours et
   l'itinéraire, qu'on referme quand l'exploitant retire leur commande, se
   referment par le registre des tiroirs exclusifs (`tiroirs-exclusifs.mjs`
   `fermeTiroir`).
   ============================================================ */
import { $ } from "./dom.mjs";
import { P } from "./donnees.mjs";
import { trio, luminance, ecarte } from "./couleurs.mjs";
import { CONF, conf, sousCle, appliqueLangue } from "./configuration.mjs";
import { marqueParcours } from "./parcours.mjs";
import { appliqueAccent, appliqueFond, appliqueBarre, appliqueModele } from "./habillage.mjs";
import { appliqueSecteurs } from "./recherche.mjs";
import { dessineDists, appliqueDists } from "./distinctions.mjs";
import { fermeTiroir } from "./tiroirs-exclusifs.mjs";
import { appliqueOptions } from "./options.mjs";
import { appliqueAmbiance } from "./ambiance.mjs";

const racine = document.documentElement;

/* Le dessin d'un calque du fond n'entre dans le document qu'une fois montré.

   L'exploitant reçoit le fond entier, calques éteints compris : c'est de là
   qu'il choisit d'en rallumer un (`plan-public`). Posé d'office, ce dessin
   invisible faisait l'essentiel du document — chez FEP27, sept calques tous
   éteints, près de dix-neuf mille éléments, quand le plan public en compte
   quatre mille en tout : de la mémoire et du recalcul de style pour rien
   d'affiché. Le groupe, lui, est posé vide dès le montage (`rendu.mjs`
   `monteHabillage`) : il garde sa place dans la pile, et l'ordre ne bouge pas
   quand son contenu arrive. Ceux qu'on a remplis sont retenus ici ; un
   pavillon remonté recrée ses groupes, qui repartent donc vides. */
const remplis = new WeakSet();
const fondDe = (cle) => P().fond.find(f => f.cle === cle);
function remplitCalque(g, cle){
  if (remplis.has(g)) return;
  const f = fondDe(cle);
  // le fond n'est pas encore arrivé : `chargeFond` remontera l'habillage
  if (!f || f.svg === undefined) return;
  g.innerHTML = f.svg || "";
  remplis.add(g);
}

export function styleFond(cle){
  const c = conf(cle);
  const g = $("couches").querySelector('.cal[data-cle="' + CSS.escape(cle) + '"]');
  if (!g) return;
  if (c.visible !== false) remplitCalque(g, cle);
  g.style.display = c.visible === false ? "none" : "";
  g.querySelectorAll("g[data-s]").forEach(sub => {
    const sc = CONF[sousCle(cle, sub.id)] || {};
    const src = sub.dataset.s || "";
    const noir = !src || src === "rgb(0,0,0)";
    sub.style.display = sc.visible === false ? "none" : "";
    sub.style.color = sc.couleur || c.couleur || (noir ? "" : src);
    const rempli = sc.rempli !== undefined ? sc.rempli : c.rempli;
    if (rempli){
      sub.setAttribute("fill", "currentColor");
      sub.setAttribute("stroke", "none");
    } else {
      sub.setAttribute("fill", sub.dataset.f || "none");
      sub.setAttribute("stroke", "currentColor");
    }
  });
}
/* Les sous-calques d'un calque éteint se lisent hors du document.

   Le panneau des calques les liste tous, éteints compris : c'est là qu'on en
   rallume un. Pour un calque que rien n'a encore montré, on les lit dans une
   copie détachée de son dessin, que le ramasse-miettes reprend ensuite — la
   poser dans la page pour la lire y aurait remis tout ce qu'on en retire. Le
   relevé se garde, attaché au dessin lu : le panneau se reconstruit à chaque
   retouche de la pile, et l'aurait chaque fois relu en entier. */
/** @type {WeakMap<object, { svg: string, liste: { id: string, src: string }[] }>} */
const sousLus = new WeakMap();
const lisSous = (/** @type {Element} */ g) =>
  [...g.querySelectorAll("g[data-s]")].map(s => ({ id: s.id, src: /** @type {any} */ (s).dataset.s }));
export function sousCalques(cle){
  const g = $("couches").querySelector('.cal[data-cle="' + CSS.escape(cle) + '"]');
  if (!g) return [];
  if (remplis.has(g)) return lisSous(g);
  const f = fondDe(cle);
  if (!f || !f.svg) return [];
  const lu = sousLus.get(f);
  if (lu && lu.svg === f.svg) return lu.liste;
  const copie = document.createElementNS("http://www.w3.org/2000/svg", "g");
  copie.innerHTML = f.svg;
  const liste = lisSous(copie);
  sousLus.set(f, { svg: f.svg, liste });
  return liste;
}

/* Les couches de données n'ont pas de SVG propre : leur visibilité joue sur
   l'affichage du groupe, leur couleur sur une variable CSS. */
export function styleDataGroupe(nom, on){
  $(nom).style.display = on ? "" : "none";
  // le liseré du parcours est tracé hors des couches : il ne suit pas tout seul
  if (nom === "stands" || nom === "zones") marqueParcours();
  /* Les marques des nouveaux venus non plus : la couche éteinte, elles
     resteraient seules au-dessus d'un hall vide. */
  if (nom === "stands") dessineDists();
}

export function appliqueCouleursData(){
  const pose = (v, n) => v ? racine.style.setProperty(n, v) : racine.style.removeProperty(n);
  pose(conf("data:stands").couleur, "--c-stand");
  pose(conf("data:zones").couleur, "--c-zone");
  const general = conf("data:labels").couleur;
  pose(conf("labStand").couleur || general, "--c-lab-stand");
  const labZone = conf("labZone").couleur || general;
  pose(labZone, "--c-lab-zone");
  pose(labZone && trio(labZone) && (luminance(trio(labZone)) > 0.42
    ? "rgba(14,17,19,.75)" : "rgba(255,255,255,.85)"), "--c-lab-zone-lisere");
  /* Un stand sélectionné prend deux couleurs — l'aplat et son liseré — et
     l'exploitant n'en règle qu'une : celle qu'il voit. Le liseré s'en déduit,
     sans quoi il faudrait accorder deux nuanciers à la main pour que le second
     reste visible sur le premier. */
  const sel = conf("selection").couleur;
  pose(sel, "--c-sel");
  pose(sel && ecarte(sel), "--c-sel-trait");
  /* Le survol n'a que son aplat : il passe, et ne laisse aucun liseré. Il se
     règle à part de la sélection, sans quoi le stand qu'on désigne et celui
     sous la souris ne se distingueraient plus. */
  pose(conf("survol").couleur, "--c-survol");
  /* Le parcours n'a qu'un liseré, sans aplat : il double le contour d'un stand
     qui garde par ailleurs sa teinte. Une seule couleur suffit donc, et elle
     se règle à part de la sélection — les deux marques se croisent sur le même
     plan, et se confondraient si l'exploitant ne pouvait les écarter. */
  pose(conf("parcours").couleur, "--c-parc");
  /* Les points d'intérêt. Une seule couleur pour le cartouche et pour ce
     qu'il met en avant : ce sont les deux bouts du même geste — on touche
     « Restauration » en bas de l'écran, et les restaurations s'allument sur le
     plan. Deux teintes n'auraient fait que rompre le lien.

     L'encre du bouton retenu s'en déduit, comme celle des boutons d'accent :
     du blanc sur un bleu, du noir sur un or. */
  const poi = conf("poi").couleur;
  pose(poi, "--c-poi");
  pose(poi && trio(poi) && (luminance(trio(poi)) > 0.42 ? "#0E1113" : "#FFFFFF"),
       "--c-poi-ink");
}

export function styleData(cle){
  racine.classList.toggle(cle === "labStand" ? "sans-lab-stand" : "sans-lab-zone",
                          conf(cle).visible === false);
  appliqueCouleursData();
}

export function appliqueApparence(){
  P().fond.forEach(f => {
    // Un calque absent de la configuration est montré. La règle disait
    // l'inverse — masquer tout ce qui n'était pas explicitement marqué visible
    // — et convenait aux données figées, qui portaient ce drapeau. La charge
    // utile servie par l'API n'en porte pas : tout le fond de plan
    // disparaissait, sans que rien ne le signale.
    if (CONF[f.cle] === undefined && f.visible === false) conf(f.cle).visible = false;
    styleFond(f.cle);
  });
  ["zones", "stands", "labels"].forEach(n =>
    styleDataGroupe(n, conf("data:" + n).visible !== false));
  ["labStand", "labZone"].forEach(k =>
    racine.classList.toggle(k === "labStand" ? "sans-lab-stand" : "sans-lab-zone",
                            conf(k).visible === false));
  appliqueCouleursData();
  appliqueCommandes();
  appliqueOptions();
  appliqueLangue();
  appliqueSecteurs();
  appliqueAccent();
  appliqueFond();
  /* L'ambiance d'abord : elle change la forme des stands, que les
     distinctions mesurent pour poser leurs marques d'angle. */
  appliqueAmbiance();
  appliqueDists();
  appliqueBarre();
  appliqueModele();
}

/**
 * Les commandes posées sur le plan, montrées ou non.
 *
 * Le pincement rend les boutons de zoom superflus sur un écran tactile, mais
 * il demande deux doigts : dans une allée de salon, sac à la main, on n'en a
 * souvent qu'un. L'échelle, elle, sert à qui mesure une distance et encombre
 * qui ne la lit pas. Ni l'un ni l'autre ne se tranche par une règle générale :
 * cela dépend du public et du terrain, donc cela revient à l'exploitant.
 *
 * Le parcours de visite se range ici pour la même raison : il vaut pour un
 * salon qu'on parcourt une journée durant, moins pour une exposition d'une
 * heure. Le retirer ne touche pas aux listes déjà constituées sur les
 * téléphones — il masque ce qui y mène, et le réglage peut se rouvrir.
 *
 * Montrées par défaut : un réglage absent ne doit rien retirer à un salon déjà
 * en place.
 *
 * « classe » marque celles dont le retrait déborde de leur propre coin : elle
 * est posée sur la racine, d'où la feuille de style tire le reste.
 */
export const COMMANDES = [
  { cle: "_zoom",     sel: ".zoombar",     libelle: "Afficher les icônes de zoom",
    /* L'échelle s'écartait de la marge pour laisser passer les boutons de
       zoom. Sans eux, ce décalage n'a plus d'objet et laisse un vide. */
    classe: "sans-zoom" },
  { cle: "_echelle",  sel: ".scalebar",    libelle: "Afficher l'échelle" },
  { cle: "_parcours", sel: "#btnParcours", libelle: "Proposer le parcours de visite",
    // les signets des fiches et du programme suivent le bouton de la barre
    classe: "sans-parcours" },
  /* L'itinéraire se calcule sur ce que les données disent du hall : les
     emplacements, et les obstacles que l'exploitant a bien voulu dessiner.
     Sur un plan resté nu, le trajet reste juste mais n'évite que les stands —
     à lui de juger si cela suffit à son salon. */
  { cle: "_itineraire", sel: "#btnItineraire", libelle: "Proposer le calcul d'itinéraire",
    // le bouton « Itinéraire » des fiches suit celui de la barre
    classe: "sans-itineraire" },
];

export function appliqueCommandes(){
  COMMANDES.forEach(c => {
    const retire = conf(c.cle).visible === false;
    const n = document.querySelector(c.sel);
    if (n) n.hidden = retire;
    if (c.classe) racine.classList.toggle(c.classe, retire);
  });
  // un tiroir ouvert sur une fonction qu'on vient de retirer n'aurait plus de
  // bouton pour se refermer
  if (conf("_parcours").visible === false) fermeTiroir("parcours");
  if (conf("_itineraire").visible === false) fermeTiroir("itineraire");
}
