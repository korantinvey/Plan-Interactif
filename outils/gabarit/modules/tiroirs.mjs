/* ============================================================
   Les tiroirs des écrans étroits — la liste, et ceux que la hauteur mène

   Sur un téléphone, la liste, la fiche, le parcours et l'itinéraire se
   partagent le pied de l'écran : chacun y vit en tiroir, hissé ou descendu
   d'une pression ou d'un glissement. Ce module tient la façon de lire ce
   geste, les crans de chaque tiroir et les ordres que le reste du plan leur
   donne — se montrer, se hisser, se mesurer, descendre —, que la recherche et
   la fiche importent.

   Ses écoutes se posent par `brancheTiroirs`, que `_gestes.html` appelle à la
   place que ce code y tenait : elles gardent leur rang parmi celles du plan.
   La recherche, qui importe ce module, ne peut être importée par lui : le
   panneau des critères qu'un tiroir redescendu referme lui est confié.
   ============================================================ */
import { $ } from "./dom.mjs";
import { ETROIT } from "./ecran.mjs";

/* Ce que le code soudé confie au branchement. */
/**
 * @typedef {object} PageTiroirs
 * @property {() => void} fermeCriteres replie le panneau des critères (`modules/recherche.mjs`)
 */
/** @type {PageTiroirs} */
let soude;
const fermeCriteres = () => soude.fermeCriteres();

/* ============================================================
   Ce que les tiroirs lisent d'un geste

   Deux sortes de tiroirs se manœuvrent au doigt — celui de la liste, qui
   glisse, et ceux que la hauteur mène. Ils partagent la façon de lire le
   geste, faute de quoi le même appui ne donnerait pas la même chose selon le
   tiroir touché.
   ============================================================ */
/* Ce qu'un pouce dérive en appuyant. Six pixels ne suffisaient pas : au-delà
   du seuil le geste passait pour un glissement, lequel, n'ayant pas atteint le
   cran suivant, reposait celui d'où il venait — l'appui restait sans effet. */
const GESTE_SEUIL = 10;
/* Au-delà d'un demi-pixel par milliseconde, c'est la direction qui décide et
   non l'endroit où le doigt s'est arrêté : un coup sec part vite et lâche tôt,
   et jugé à l'arrivée il n'avait pas parcouru la moitié du chemin. */
const GESTE_VIF = .5;

/**
 * Le suivi d'un geste, pour en tirer une vitesse.
 *
 * Elle se prend sur les cent dernières millisecondes, et non entre le dernier
 * déplacement et le lâcher : le navigateur livre souvent les deux au même
 * endroit, et tout coup sec comptait alors pour nul.
 */
function traceurDeGeste(){
  const FENETRE = 100;
  let trace = [];
  return {
    repart(){ trace = []; },
    note(y){
      const t = performance.now();
      trace.push({ y: y, t: t });
      while (trace.length > 1 && t - trace[0].t > FENETRE) trace.shift();
    },
    vitesse(){
      if (trace.length < 2) return 0;
      const a = trace[0], b = trace[trace.length - 1];
      return b.t > a.t ? (b.y - a.y) / (b.t - a.t) : 0;
    },
  };
}

/** Le cran d'à côté, vers le haut (+1) ou vers le bas (-1). */
const cranVoisin = (crans, nom, sens) =>
  crans[Math.min(crans.length - 1, Math.max(0, crans.indexOf(nom) + sens))];

/* ============================================================
   Le tiroir de la liste — écrans étroits

   Côte à côte, plan et liste ne tiennent pas sur un téléphone. La liste se
   replie donc en tiroir : seules la recherche et le compteur dépassent, le
   reste se hisse d'une pression ou d'un glissement. Choisir un résultat le
   referme — c'est le plan qu'on voulait voir, et la fiche s'ouvre par-dessus.
   ============================================================ */
/* La bande que le système garde au bas de l'écran — la poignée de gestes, la
   barre d'accueil.

   Les tiroirs descendent leur fond jusqu'au bord de l'écran, une bande de gris
   sous un tiroir de couleur se voyant de loin, mais ils remontent ce qu'ils
   portent d'autant : leur part visible au cran le plus bas vaut donc ce qu'ils
   montrent, plus cette bande. Le geste qui les mène doit compter pareil — il
   posait sinon, au premier millimètre parcouru par le doigt, une hauteur
   amputée de la bande, et le tiroir sautait avant de suivre.

   Mesurée sur une sonde, et non lue : `env(safe-area-inset-bottom)` appartient
   au moteur de style, et rien de `window` ne la donne. Gardée ensuite, parce
   que le glissement la redemande à chaque image : elle ne change qu'avec
   l'écran, et c'est ce que dit le `resize`. */
let _retraitBas = null;
function retraitBas(){
  if (_retraitBas !== null) return _retraitBas;
  const sonde = document.createElement("i");
  sonde.style.cssText = "position:fixed;left:0;bottom:0;width:0;height:var(--sys-bas)";
  document.body.appendChild(sonde);
  _retraitBas = sonde.getBoundingClientRect().height;
  sonde.remove();
  return _retraitBas;
}

/* La mesure du tiroir appartient à ce module, mais les bandes qui dépassent —
   les secteurs, les critères retenus — paraissent et disparaissent ailleurs :
   on leur laisse de quoi la redemander. */
export let mesureTiroir = () => {};
/* De même, une thématique retenue depuis une fiche doit faire monter le tiroir :
   sur téléphone la liste qui vient de changer est sous le plan. */
export let montreTiroir = () => {};
/* Et le panneau des critères, qui se déplie dans le tiroir, le veut tout en
   haut : déplié dans la bande qui dépasse, il y prendrait la place de ce
   qu'elle doit montrer. */
export let hisseTiroir = () => {};
/* Et un tiroir cranté descend aussi sur ordre d'ailleurs : centrer le plan
   depuis une fiche n'a aucun intérêt tant que la fiche couvre l'endroit visé.
   Un ordre par tiroir, posé par `tiroirCrante`. */
/** @type {Record<string, () => boolean>} */
export const baisseTiroir = {};

function tiroirListe(){
  const tiroir = $("side"), prise = $("poignee");
  if (!tiroir || !prise) return;
  const etroit = ETROIT;

  /* La hauteur repliée ne peut pas être une constante : elle dépend de la
     police servie, du retour à la ligne des puces, de la longueur du nom de
     pavillon dans le compteur. On la mesure, et on la redonne au CSS, qui s'en
     sert aussi pour poser les commandes du plan au-dessus du tiroir. */
  function mesure(){
    if (!etroit()) return;
    const part = s => { const n = tiroir.querySelector(s); return n ? n.offsetHeight : 0; };
    const h = prise.offsetHeight + part(".search") + part(".actifs") +
              part(".count");
    /* Sur le corps, pour la même raison que « --cartouche » : posée sur la
       racine, cette hauteur faisait repeindre les six cents stands chaque fois
       que le tiroir replié changeait de taille — l'apparition de la ligne des
       résultats, par exemple, au premier mot tapé dans la recherche. */
    const px = h + "px";
    if (h > 0 && document.body.style.getPropertyValue("--replie") !== px)
      document.body.style.setProperty("--replie", px);
  }

  /* Trois crans, du plus bas au plus haut. Le milieu est le cran utile : la
     liste se lit sans que le plan disparaisse. */
  const CRANS = ["replie", "demi", "plein"];
  const cran = () => tiroir.dataset.cran || "replie";
  function pose(nom){
    tiroir.dataset.cran = nom;
    annonce(nom);
    prise.setAttribute("aria-expanded", nom === "replie" ? "false" : "true");
    /* Redescendu, le tiroir ne montre plus que la recherche, ce qui est retenu
       et le compte : un panneau de critères resté déplié occuperait cette bande
       à lui seul, et pousserait les trois sous le bord de l'écran. */
    if (nom === "replie" && etroit()) fermeCriteres();
  }

  /* Ce qui flotte au-dessus du plan — le cartouche des points d'intérêt, les
     commandes de zoom, l'échelle — est ancré sur la hauteur repliée du tiroir.
     Le tiroir qui monte passe donc dessous sans les déplacer, et ils restaient
     à désigner un plan qu'on ne voyait plus. Le cran vit sur la racine pour que
     la feuille de style les atteigne depuis l'autre bout de la page. */
  const annonce = nom => { document.documentElement.dataset.tiroir = nom; };
  const replie = () => pose("replie");
  /* Une pression fait le tour des crans : on les atteint tous sans rien
     connaître du glissement, et on revient au plan par la même touche. */
  const bascule = () => pose(CRANS[(CRANS.indexOf(cran()) + 1) % CRANS.length]);

  /* Sur le corps, là où « mesure » l'a posée : lue sur la racine, elle revenait
     vide et le repli de 164 px tenait lieu de mesure. Le tiroir sautait alors
     de l'écart au premier millimètre du glissement — soixante-quinze pixels
     pour une bande repliée qui en fait quatre-vingt-dix. */
  const replieePx = () =>
    parseFloat(getComputedStyle(document.body).getPropertyValue("--replie")) || 164;

  /* Hauteur visible du tiroir à un cran donné, en pixels. Le milieu suit la
     règle du CSS — 46 % de la hauteur d'écran. Le plus bas montre ce qui a été
     mesuré, posé au-dessus de la bande rendue au système. */
  function hauteur(nom){
    if (nom === "plein") return tiroir.offsetHeight;
    if (nom === "demi")  return Math.round(innerHeight * .46);
    return replieePx() + retraitBas();
  }

  /* --- le glissement ------------------------------------------------------
     Le doigt mène le tiroir entre le cran le plus bas et le plus haut, puis on
     s'accroche au cran le plus proche de l'endroit où il a lâché. Un seuil de
     distance ne suffirait plus : avec trois crans, c'est la position d'arrivée
     qui décide, pas la longueur du geste. */
  let depart = null, aGlisse = false;

  const geste = traceurDeGeste();

  prise.addEventListener("pointerdown", e => {
    if (!etroit()) return;
    depart = { y: e.clientY, vu: hauteur(cran()), cran: cran() };
    geste.repart();
    geste.note(e.clientY);
    aGlisse = false;
    tiroir.classList.add("glisse");
    prise.setPointerCapture(e.pointerId);
  });

  /** Hauteur visible pendant le geste, bornée aux deux crans extrêmes. */
  const suit = e =>
    Math.min(hauteur("plein"), Math.max(hauteur("replie"), depart.vu - (e.clientY - depart.y)));

  /** Le cran dont la hauteur visible est la plus proche de celle atteinte. */
  function proche(vu){
    let choix = CRANS[0], ecart = Infinity;
    for (const c of CRANS){
      const d = Math.abs(hauteur(c) - vu);
      if (d < ecart){ ecart = d; choix = c; }
    }
    return choix;
  }

  prise.addEventListener("pointermove", e => {
    if (!depart) return;
    if (Math.abs(e.clientY - depart.y) > GESTE_SEUIL) aGlisse = true;
    geste.note(e.clientY);
    const vu = suit(e);
    tiroir.style.transform = "translateY(" + (tiroir.offsetHeight - vu) + "px)";
    /* Le doigt tient encore le tiroir : ce qui flotte s'efface au cran où il
       s'arrêterait, sans attendre qu'il lâche. */
    annonce(proche(vu));
  });

  function relache(e){
    if (!depart) return;
    const vu = suit(e);
    tiroir.classList.remove("glisse");
    tiroir.style.transform = "";
    geste.note(e.clientY);
    const v = geste.vitesse();
    // un geste avorté laisse le cran d'avant, que le glissement avait annoncé
    pose(!aGlisse ? cran()
       : Math.abs(v) > GESTE_VIF ? cranVoisin(CRANS, depart.cran, v < 0 ? 1 : -1)
       : proche(vu));
    depart = null;
  }
  prise.addEventListener("pointerup", relache);
  prise.addEventListener("pointercancel", relache);

  /* Une pression bascule. Le clic sert aussi le clavier — la poignée est un
     bouton — mais il suit tout glissement : on l'ignore dans ce cas. */
  prise.addEventListener("click", () => {
    if (aGlisse){ aGlisse = false; return; }
    bascule();
  });

  /* Chercher, c'est vouloir la liste ; choisir, c'est vouloir le plan. Au cran
     plein pour la recherche : le clavier va manger le bas de l'écran, autant
     que la liste occupe tout ce qui reste. */
  $("q").addEventListener("focus", () => { if (etroit()) pose("plein"); });
  $("list").addEventListener("click", () => { if (etroit()) replie(); });

  /* La fiche occupe le bas de l'écran quand elle s'ouvre — depuis la liste
     comme depuis le plan ; le parcours et l'itinéraire prennent la même bande.
     Le tiroir se retire sous eux plutôt que de lutter pour la même place, et
     s'efface entièrement : replié il garde sa bande de recherche, laquelle
     dépassait derrière l'itinéraire descendu à son cran le plus bas — celui-ci
     est plus court qu'elle. */
  const bandes = [$("detail"), $("parcours"), $("itineraire")].filter(Boolean);
  function cede(){
    const pris = etroit() && bandes.some(n => n.classList.contains("open"));
    if (pris) replie();
    tiroir.classList.toggle("cede", pris);
  }
  const guette = new MutationObserver(cede);
  bandes.forEach(n => guette.observe(n, { attributes: true, attributeFilter: ["class"] }));
  addEventListener("keydown", e => { if (e.key === "Escape" && etroit()) replie(); });

  /* Au retour vers un grand écran, la liste reprend sa colonne : ni classe
     d'ouverture ni transformation résiduelle, qui s'y appliqueraient encore. */
  addEventListener("resize", () => {
    if (!etroit()){ tiroir.style.transform = ""; replie(); }
    else mesure();
    cede();
  });

  mesureTiroir = mesure;
  /* Le cran du milieu, pas le plein écran : on vient de retenir une
     thématique depuis le plan, et on veut voir la liste sans perdre de vue
     l'endroit d'où l'on part. */
  montreTiroir = () => { if (etroit() && cran() === "replie") pose("demi"); };
  /* Le plein écran, et non le cran du milieu : régler ses critères, c'est
     vouloir la liste — comme entrer dans le champ de recherche, qui hisse le
     tiroir de la même façon. */
  hisseTiroir = () => { if (etroit()) pose("plein"); };
  mesure();
  // les polices arrivent après le premier calcul et changent la hauteur mesurée
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(mesure);
  addEventListener("load", mesure);
}

/* ============================================================
   Les tiroirs menés par la hauteur — écrans étroits

   Trois bandes basses partagent le pied de l'écran avec la liste, et toutes
   trois tenaient sur une hauteur fixe. La fiche : un peu plus de la moitié de
   l'écran, quoi qu'elle porte — bien remplie, champs, programme et actions s'y
   lisaient par une fente, en faisant défiler son corps trois écrans durant. Le
   parcours retenu et la journée organisée avaient le défaut inverse : les deux
   tiers de l'écran pour trois exposants, et le plan qu'on venait y chercher
   restait derrière. L'itinéraire, enfin, recouvrait de sa moitié d'écran le
   trajet qu'il venait d'y tracer — celui-là même qu'on lui demandait.

   Les trois prennent donc la prise de la liste et ses trois crans. Le cran ne
   les fait pas glisser sous le bord de l'écran comme la liste, mais change
   leur hauteur : c'est leur corps qui défile, et un tiroir descendu aurait
   poussé sa fin hors de vue. Au cran le plus bas ne reste que l'en-tête —
   assez pour savoir de quel stand, de quelle journée ou de quel trajet il
   s'agit tout en regardant le plan derrière.
   ============================================================ */
/**
 * Pose les trois crans sur un tiroir mené par la hauteur.
 *
 * @param panneau le tiroir — son en-tête est ce qui reste au cran le plus bas
 * @param prise   la poignée qui le hisse
 * @param cle     la variable CSS où déposer la hauteur repliée mesurée
 * @param demi    la part de l'écran qu'il occupe au cran du milieu
 */
function tiroirCrante({ panneau, prise, cle, demi }){
  const tiroir = $(panneau), poignee = $(prise);
  if (!tiroir || !poignee) return;
  const etroit = ETROIT;
  const CRANS = ["replie", "demi", "plein"];
  /* Le cran du milieu est celui d'avant les crans : un tiroir qu'on ouvre sans
     rien demander occupe la place qu'il a toujours occupée. */
  const cran = () => tiroir.dataset.cran || "demi";

  /* La hauteur repliée se mesure : l'en-tête de la fiche tient une ligne pour
     un numéro de stand, trois pour une enseigne longue suivie de ses
     pastilles, davantage quand la zone porte un logo ; celui du parcours
     change de titre selon qu'on y lit sa liste ou sa journée. */
  function mesure(){
    if (!etroit()) return;
    const hd = tiroir.querySelector(".detail-hd");
    const h = poignee.offsetHeight + (hd ? hd.offsetHeight : 0);
    /* Sur le tiroir, et non sur la racine. Une variable posée sur la racine est
       offerte à toute la page en héritage : le navigateur remet alors en cause
       le style de ses sept mille nœuds — cent quatre-vingts millisecondes dès
       que la valeur change, c'est-à-dire chaque fois qu'un nom de stand tient
       sur un nombre de lignes différent. Seul le tiroir lit celle-ci. */
    if (h > 0) tiroir.style.setProperty(cle, h + "px");
  }

  function pose(nom){
    tiroir.dataset.cran = nom;
    poignee.setAttribute("aria-expanded", nom === "replie" ? "false" : "true");
  }
  const bascule = () => pose(CRANS[(CRANS.indexOf(cran()) + 1) % CRANS.length]);

  /* Descendre sur ordre d'ailleurs, et dire si l'on a bougé : centrer le plan
     depuis une fiche attend la fin de la descente pour mesurer ce que la fiche
     cache encore. Déjà au cran le plus bas, rien ne bouge et rien n'est à
     attendre. */
  baisseTiroir[panneau] = () => {
    if (!etroit() || cran() === "replie") return false;
    pose("replie");
    return true;
  };

  /* Le nombre n'est qu'un garde-fou : `mesure` pose la variable à la
     construction et à chaque ouverture, si bien qu'elle est toujours lue
     mesurée. La hauteur d'avant la première mesure, elle, est celle que la
     feuille de style donne en secours à `var()`, tiroir par tiroir. */
  const replieePx = () =>
    parseFloat(getComputedStyle(tiroir).getPropertyValue(cle)) || 132;

  /** Hauteur du tiroir à un cran donné, en pixels — les parts du CSS. */
  function hauteur(nom){
    if (nom === "plein") return Math.round(innerHeight * .92);
    if (nom === "demi")  return Math.round(innerHeight * demi);
    // l'en-tête mesuré, plus la bande que le tiroir rend au système sous lui
    return replieePx() + retraitBas();
  }

  /* --- le glissement ------------------------------------------------------
     Même geste que sur la liste, à ceci près que le doigt mène une hauteur et
     non une position : on s'accroche au cran le plus proche de celle atteinte.

     La prise ne se limite pas à la pastille. Elle mesure seize pixels de haut
     quand le pouce en demande quarante : on visait, on manquait, et le tiroir
     ne bougeait pas — ce qui se lit comme une panne, pas comme un geste raté.
     L'en-tête qu'elle surmonte se saisit donc aussi, ce qui est de toute façon
     l'endroit que la main vise. Ce qu'il porte de cliquable — fermer, renommer,
     une pastille qui bascule — garde ses appuis. */
  const INERTE = "button,a,input,select,textarea,label,[role=tab]";
  const entete = tiroir.querySelector(".detail-hd");
  const prises = [poignee, entete].filter(Boolean);
  let depart = null, aGlisse = false;

  const geste = traceurDeGeste();

  function saisit(e){
    if (!etroit()) return;
    /* La poignée est elle-même un bouton : le garde-fou ne vaut que pour
       l'en-tête, où il protège les commandes qu'on y a posées. */
    if (e.currentTarget !== poignee && e.target.closest(INERTE)) return;
    depart = { y: e.clientY, vu: hauteur(cran()), cran: cran() };
    geste.repart();
    geste.note(e.clientY);
    aGlisse = false;
    tiroir.classList.add("glisse");
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  /** Hauteur pendant le geste, bornée aux deux crans extrêmes. */
  const suit = e =>
    Math.min(hauteur("plein"), Math.max(hauteur("replie"), depart.vu - (e.clientY - depart.y)));

  /** Le cran dont la hauteur est la plus proche de celle atteinte. */
  function proche(vu){
    let choix = CRANS[0], ecart = Infinity;
    for (const c of CRANS){
      const d = Math.abs(hauteur(c) - vu);
      if (d < ecart){ ecart = d; choix = c; }
    }
    return choix;
  }

  function bouge(e){
    if (!depart) return;
    if (Math.abs(e.clientY - depart.y) > GESTE_SEUIL) aGlisse = true;
    geste.note(e.clientY);
    tiroir.style.maxHeight = suit(e) + "px";
  }

  function relache(e){
    if (!depart) return;
    const vu = suit(e);
    tiroir.classList.remove("glisse");
    /* La hauteur repasse au CSS, qui la tient du cran : gardée en ligne, elle
       aurait survécu à la fermeture et figé le tiroir suivant. */
    tiroir.style.maxHeight = "";
    geste.note(e.clientY);
    const v = geste.vitesse();
    // un geste avorté laisse le cran d'avant ; le clic qui suit fera le tour
    pose(!aGlisse ? cran()
       : Math.abs(v) > GESTE_VIF ? cranVoisin(CRANS, depart.cran, v < 0 ? 1 : -1)
       : proche(vu));
    depart = null;
  }

  /* Une pression fait le tour des crans — sur la pastille comme sur l'en-tête,
     puisque c'est la même prise. Le clic sert aussi le clavier, la poignée
     étant un bouton, mais il suit tout glissement : on l'ignore alors. */
  function presse(e){
    if (aGlisse){ aGlisse = false; return; }
    /* Au large, l'en-tête n'est qu'un en-tête : la poignée y est masquée et le
       tiroir reprend sa colonne, mais l'en-tête, lui, reste cliquable — sans
       ce garde-fou, cliquer un nom de stand posait un cran dans son dos. */
    if (!etroit()) return;
    if (e.currentTarget !== poignee && e.target.closest(INERTE)) return;
    bascule();
  }

  prises.forEach(n => {
    n.addEventListener("pointerdown", saisit);
    n.addEventListener("pointermove", bouge);
    n.addEventListener("pointerup", relache);
    n.addEventListener("pointercancel", relache);
    n.addEventListener("click", presse);
  });

  /* Chaque ouverture repart du cran du milieu : le stand d'avant a pu demander
     toute la hauteur, celui-ci tient peut-être en trois lignes, et le plan
     qu'on vient de désigner doit rester en vue. Le tiroir s'ouvre depuis
     plusieurs endroits — un stand, un repère de dessin, le bouton du
     parcours — d'où la classe guettée plutôt qu'un appel posé dans chacun. */
  let ouvert = tiroir.classList.contains("open");
  new MutationObserver(() => {
    const o = tiroir.classList.contains("open");
    if (o && !ouvert){ pose("demi"); mesure(); }
    ouvert = o;
  }).observe(tiroir, { attributes: true, attributeFilter: ["class"] });

  /* L'en-tête change de hauteur sans que le tiroir se rouvre : un logo qui
     arrive, les polices qui se posent, la bascule vers l'anglais, la journée
     organisée qui prend la place de la liste retenue. Le cran le plus bas vaut
     ce qu'il mesure alors. */
  if (window.ResizeObserver){
    const hd = tiroir.querySelector(".detail-hd");
    if (hd) new ResizeObserver(mesure).observe(hd);
  }

  /* Au retour vers un grand écran, le tiroir reprend sa colonne : ni hauteur
     posée en ligne ni cran, qui s'y appliqueraient encore. */
  addEventListener("resize", () => {
    if (!etroit()){ tiroir.style.maxHeight = ""; pose("demi"); }
    else mesure();
  });

  mesure();
}

/**
 * Pose les écoutes des tiroirs, au rang qu'elles tenaient parmi celles du
 * plan : la bande rendue au système d'abord, puis la liste, puis les trois
 * tiroirs menés par la hauteur.
 *
 * @param {PageTiroirs} page
 */
export function brancheTiroirs(page){
  soude = page;
  addEventListener("resize", () => { _retraitBas = null; });

  tiroirListe();

  tiroirCrante({ panneau: "detail", prise: "poigneeFiche", cle: "--fiche-replie", demi: .56 });
  /* Le parcours monte plus haut au cran du milieu, et la feuille de style dit la
     même part : une liste de rangs se parcourt du regard, quand une fiche se lit
     ligne à ligne. */
  tiroirCrante({ panneau: "parcours", prise: "poigneeParcours", cle: "--parc-replie", demi: .68 });
  /* L'itinéraire s'arrête plus bas que les deux autres : la moitié de l'écran,
     parce qu'on le remplit en regardant le plan. Les crans ne lui retirent pas
     cette mesure — ils la lui rendent, le temps d'un geste. */
  tiroirCrante({ panneau: "itineraire", prise: "poigneeItineraire", cle: "--itin-replie", demi: .5 });
}
