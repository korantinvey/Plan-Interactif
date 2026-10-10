/* ============================================================
   L'apparence des calques, et les commandes posées sur le plan

   Le plan public la pose à chaque chargement et à
   chaque changement de pavillon (`appliqueApparence`), et l'exploitant y
   revient à chaque couleur ou case de la pile (`pile.mjs`) et des volets
   (`volets.mjs`). Ce qu'il ne peut importer sans boucler — les options et
   leur liste (`options.mjs` `appliqueOptions`), le tiroir du parcours qu'on
   referme (`tiroir-parcours.mjs`), qui importent tous deux ce module-ci — lui
   est confié par la porte `confieALApparence`, que chacun ouvre en se
   chargeant. Les
   secteurs s'importent de `recherche.mjs`, les marques des distinctions de
   `distinctions.mjs`, le tiroir de l'itinéraire de `tiroir-itineraire.mjs`.
   ============================================================ */
import { $ } from "./dom.mjs";
import { P } from "./donnees.mjs";
import { trio, luminance, ecarte } from "./couleurs.mjs";
import { CONF, conf, sousCle, appliqueLangue } from "./configuration.mjs";
import { marqueParcours } from "./parcours.mjs";
import { appliqueAccent, appliqueFond, appliqueDists, appliqueBarre, appliqueModele } from "./habillage.mjs";
import { appliqueSecteurs } from "./recherche.mjs";
import { dessineDists } from "./distinctions.mjs";
import { fermeItineraire } from "./tiroir-itineraire.mjs";

/* Ce qui est confié, et rien avant : le plan ne s'habille qu'à l'arrivée des
   données, bien après le chargement des modules qui l'ouvrent. */
/**
 * @typedef {object} PreteApparence
 * @property {() => void} appliqueOptions les options prises par le salon (`options.mjs`)
 * @property {() => void} fermeParcours referme le tiroir du parcours (`tiroir-parcours.mjs`)
 */
/** @type {PreteApparence} */
const prete = { appliqueOptions: () => {}, fermeParcours: () => {} };

/**
 * La porte de ce que l'apparence ne peut importer sans boucler : `options.mjs`
 * et `tiroir-parcours.mjs` l'ouvrent en se chargeant, donc avant le lancement
 * de la page et tout appel.
 *
 * @param {Partial<PreteApparence>} o
 */
export function confieALApparence(o){
  Object.assign(prete, o);
}

const racine = document.documentElement;

export function styleFond(cle){
  const c = conf(cle);
  const g = $("couches").querySelector('.cal[data-cle="' + CSS.escape(cle) + '"]');
  if (!g) return;
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
export function sousCalques(cle){
  const g = $("couches").querySelector('.cal[data-cle="' + CSS.escape(cle) + '"]');
  return g ? [...g.querySelectorAll("g[data-s]")].map(s => ({ id: s.id, src: s.dataset.s })) : [];
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
  pose(conf("labZone").couleur || general, "--c-lab-zone");
  /* Un stand sélectionné prend deux couleurs — l'aplat et son liseré — et
     l'exploitant n'en règle qu'une : celle qu'il voit. Le liseré s'en déduit,
     sans quoi il faudrait accorder deux nuanciers à la main pour que le second
     reste visible sur le premier. */
  const sel = conf("selection").couleur;
  pose(sel, "--c-sel");
  pose(sel && ecarte(sel), "--c-sel-trait");
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
  prete.appliqueOptions();
  appliqueLangue();
  appliqueSecteurs();
  appliqueAccent();
  appliqueFond();
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
  if (conf("_parcours").visible === false) prete.fermeParcours();
  if (conf("_itineraire").visible === false) fermeItineraire();
}
