/* ============================================================
   Le parcours de visite : la liste, son stockage, sa marque

   Ce que le visiteur retient — des stands, des conférences —, rangé dans son
   navigateur et relu à chaque visite. Le module tient la liste et ce qui
   l'écrit ; le tiroir qui la montre, et le geste qui la change, vivent dans
   `tiroir-parcours.mjs`, qui importe ce module-ci.

   La liste se remplace par `poseParcours({ … })`, comme les données du plan
   par `poseDonnees` : un module l'importe, et seul le tiroir
   (`tiroir-parcours.mjs`) la remplace.
   ============================================================ */
import { $ } from "./dom.mjs";
import { esc } from "./texte.mjs";
import { SLUG } from "./salon.mjs";
import { jetonMesure } from "./mesure.mjs";
import { momentLocal } from "./temps.mjs";
import { DATA, parId, CONFS } from "./donnees.mjs";

/* Ce que la liste fait faire au reste du plan — le tiroir qui la montre, les
   rappels qui en dépendent —, que ce module ne peut importer : tous deux
   l'importent. Le tiroir le lui confie en se branchant
   (`brancheListeParcours`). */
let _rafraichit = () => {};
let _reprendRappels = () => {};
let _synchroniseRappels = () => {};

/**
 * Un visiteur arrive avec trois heures et deux cents exposants devant lui. Il
 * repère de quoi remplir sa journée depuis chez lui, puis vient relire sa
 * liste sur place, entre deux allées.
 *
 * Cette liste vit dans son navigateur, et nulle part ailleurs : le plan n'a
 * pas de comptes, et demander une inscription pour retenir trois stands ferait
 * fuir tout le monde. Elle est rangée par événement — un même téléphone peut
 * ouvrir plusieurs salons — et ne retient que des identifiants : les libellés
 * sont relus dans les données à chaque affichage, si bien qu'un exposant
 * renommé entre deux visites s'affiche sous son nouveau nom.
 *
 * Ce choix a un revers, et « trois semaines avant » est exactement le moment
 * où il se paie : un navigateur fait le ménage. Safari efface tout ce qu'une
 * page a écrit au bout de sept jours passés sans revenir sur le site — la
 * liste préparée en août n'existe plus en septembre. Chrome et Firefox jettent
 * les origines dont rien ne dit qu'elles comptent, quand l'appareil manque de
 * place. Et sur iOS, l'application installée ne partage pas le stockage de
 * Safari : préparer sa visite dans l'onglet puis poser l'icône ouvre une
 * application vide.
 *
 * Trois gestes y répondent, et aucun ne demande de compte. Ce que le plan ne
 * reconnaît plus est mis de côté au lieu d'être effacé (`MIS_DE_COTE`). Le
 * navigateur est prié de garder ce qu'il a (`tientLeStockage`). Et la liste
 * s'emporte hors du navigateur, dans un lien qu'on se donne à soi-même
 * (`modules/partage.mjs`, « La copie qu'on se garde ») — le seul de ces trois
 * gestes qui tienne contre les sept jours de Safari, contre un téléphone
 * changé, et contre l'application installée qui démarre à vide.
 */
export let PARCOURS = { stands: [], confs: [] };

/**
 * Ce que le stockage portait et que les données ne reconnaissent pas — pour
 * l'instant.
 *
 * Jeter tout de suite ce qu'on ne reconnaît plus paraissait sans risque : un
 * stand démonté ne revient pas. Mais « les données ne le connaissent pas » et
 * « il n'existe plus » sont deux choses, et la première arrive sans que rien
 * n'ait disparu : l'option du programme décochée une heure vide `CONFS`, une
 * synchronisation Klipso en cours rend un salon amputé. La liste filtrée était
 * alors réécrite au premier signet touché, et les conférences retenues pour le
 * mois suivant partaient pour de bon.
 *
 * C'est l'ornière des dessins non publiés, décrite dans `calques-dessin.mjs` : « il
 * ne se perdait pas : il devenait invisible, puis l'enregistrement suivant
 * l'effaçait pour de bon ». On la contourne de la même façon — ce qu'on ne
 * comprend plus est mis de côté, daté, et réécrit avec le reste, à la place
 * qu'il occupait. Invisible, mais pas perdu.
 */
let MIS_DE_COTE = { stands: [], confs: [] };

/**
 * Remplacer la liste, ou sa réserve — le tiroir (`tiroir-parcours.mjs`) vide
 * et remplace par ici.
 * Un nom inconnu lève une erreur, comme pour les données du plan.
 *
 * @param {{ PARCOURS?: { stands: string[], confs: string[] },
 *           MIS_DE_COTE?: { stands: any[], confs: any[] } }} valeurs
 */
export function poseParcours(valeurs){
  for (const [nom, v] of Object.entries(valeurs)){
    switch (nom){
      case "PARCOURS": PARCOURS = v; break;
      case "MIS_DE_COTE": MIS_DE_COTE = v; break;
      default: throw new Error("poseParcours : « " + nom + " » n'est pas un état du parcours");
    }
  }
}

/**
 * Brancher la liste sur ce qu'elle fait bouger ailleurs : l'écran qui la
 * montre, et les rappels qui en dépendent. Appelé par le tiroir
 * (`tiroir-parcours.mjs` `brancheTiroirParcours`), avant ses propres écoutes.
 *
 * @param {{ rafraichit: () => void, reprendRappels: () => void,
 *           synchroniseRappels: () => void }} branchements
 */
export function brancheListeParcours({ rafraichit, reprendRappels, synchroniseRappels }){
  _rafraichit = rafraichit;
  _reprendRappels = reprendRappels;
  _synchroniseRappels = synchroniseRappels;
}

/* Au-delà, un rang mis de côté s'en va vraiment. Plus long qu'aucune panne ni
   qu'aucun réglage oublié, plus court que le temps qui sépare deux éditions —
   au-delà duquel les identifiants ne désignent plus rien de toute façon. */
const QUARANTAINE_JOURS = 120;

/* Le nom de l'événement sert de repli pour la page à données figées, qui n'a
   pas de « slug » : sans lui, deux démonstrations partageraient la même liste. */
const cleParcours = () =>
  "plan-parcours:" + (SLUG || (DATA && DATA.evenement) || "");

/**
 * L'identifiant de ce parcours-ci.
 *
 * Il existe pour une seule raison : qu'une personne ne fasse pas un
 * embouteillage à elle seule. La journée organisée se recalcule à chaque
 * retouche — un stand déplacé, un jour changé, un exposant retiré — et sans
 * identifiant, les dix essais d'un même visiteur s'empileraient dans les
 * compteurs de charge comme dix visiteurs distincts. Sous un identifiant, le
 * plan suivant remplace le précédent au lieu de s'y ajouter.
 *
 * Il ne se tire qu'à la première journée organisée, et jamais avant : celui qui
 * compose une liste sans jamais demander qu'on la mette en heures n'a rien à
 * envoyer, et n'a donc pas à porter d'identifiant.
 *
 * Il n'est pas le jeton de mesure, et ne doit jamais voyager avec lui. Les
 * deux sortent du même générateur — c'est du hasard, il n'y en a qu'une sorte
 * — mais les rapprocher rendrait joignables « ce que cette personne compte
 * faire » et « ce qu'elle a consulté », c'est-à-dire une trajectoire. Ils
 * partent par deux chemins séparés, et c'est voulu.
 *
 * Il vit dans le même stockage que la liste, et meurt avec elle : Safari efface
 * au bout de sept jours sans visite (voir plus haut). Le visiteur reconstruit
 * alors un parcours neuf sous un identifiant neuf, et l'ancien plan reste en
 * base jusqu'à la fin de son jour. Cet identifiant-là dédoublonne les
 * retouches, pas les pertes de stockage — et les retouches sont le cas
 * courant.
 */
let ID_PARCOURS = "";

/* Assez long pour ne pas se rencontrer, assez court pour tenir dans une clé
   primaire sans peser. Même forme que les jetons du reste du produit. */
const FORME_ID_PARCOURS = /^[A-Za-z0-9_-]{6,40}$/;

/** L'identifiant, tiré et gardé au premier besoin. */
export function identifiantParcours(){
  if (!FORME_ID_PARCOURS.test(ID_PARCOURS)){
    ID_PARCOURS = jetonMesure();
    enregistreParcours();
  }
  return ID_PARCOURS;
}

export const casierParcours = genre => genre === "conf" ? PARCOURS.confs : PARCOURS.stands;
export const dansParcours = (genre, id) => casierParcours(genre).indexOf(String(id)) >= 0;

/** Le jour, tel qu'il s'écrit à côté d'un rang mis de côté. */
const jourParcours = () => new Date().toISOString().slice(0, 10);

/** Un rang mis de côté depuis assez longtemps pour qu'on cesse de l'attendre.
 *  Une date illisible vaut une date d'aujourd'hui : on garde, plutôt que de
 *  jeter sur un doute. */
function attenduDepuisTropLongtemps(depuis){
  const t = Date.parse(depuis);
  return !!t && Date.now() - t > QUARANTAINE_JOURS * 864e5;
}

/**
 * Ranger ce que le stockage a rendu : d'un côté ce que le plan connaît, de
 * l'autre ce qu'il ne connaît plus — avec le rang qu'il occupait, pour le lui
 * rendre s'il revient. L'ordre d'ajout est celui du parcours, et un exposant
 * absent le temps d'une synchronisation n'a pas à finir en queue de liste.
 */
function trieParcours(casier, lus, connu, dates){
  const aujourdhui = jourParcours();
  lus.forEach((id, i) => {
    if (connu(id)) return PARCOURS[casier].push(id);
    const depuis = dates[casier + ":" + id] || aujourdhui;
    if (attenduDepuisTropLongtemps(depuis)) return;
    MIS_DE_COTE[casier].push({ id: id, i: i, depuis: depuis });
  });
}

export function chargeParcours(){
  let b = {};
  try { b = JSON.parse(localStorage.getItem(cleParcours()) || "null") || {}; }
  catch (e) { b = {}; }   // stockage refusé ou contenu illisible
  const dates = b.decote && typeof b.decote === "object" ? b.decote : {};
  /* Un identifiant illisible — un stockage à moitié écrit, une version d'avant
     — vaut une absence : le prochain plan en tire un neuf plutôt que d'écrire
     sous un nom qui ne désigne rien. */
  ID_PARCOURS = FORME_ID_PARCOURS.test(b.id) ? b.id : "";
  PARCOURS = { stands: [], confs: [] };
  MIS_DE_COTE = { stands: [], confs: [] };
  trieParcours("stands", Array.isArray(b.stands) ? b.stands.map(String) : [],
               id => parId.has(id), dates);
  trieParcours("confs", Array.isArray(b.confs) ? b.confs.map(String) : [],
               id => CONFS.has(id), dates);
  /* Une liste rapportée d'une visite d'il y a trois semaines vaut qu'on
     demande au navigateur de ne pas la jeter au premier ménage. */
  if (PARCOURS.stands.length + PARCOURS.confs.length) tientLeStockage();
  _rafraichit();
  /* Les rappels posés lors d'une visite précédente se reprennent ici, une fois
     la liste relue : ils ne portent que sur des conférences qu'elle contient
     encore. */
  _reprendRappels();
}

/**
 * La liste telle qu'elle s'écrit : ce qui s'affiche, et ce qui attend son
 * retour, remis où il était.
 *
 * Un rang mis de côté peut revenir par la porte de devant — un parcours reçu
 * qui le reproposait, les données qui le reconnaissent à nouveau dans un autre
 * onglet. Il est alors des deux côtés, et c'est l'exemplaire de côté qui
 * s'efface : celui de la liste est celui que le visiteur voit.
 */
function parcoursAEcrire(){
  const sortie = { stands: PARCOURS.stands.slice(), confs: PARCOURS.confs.slice() };
  const dates = {};
  ["stands", "confs"].forEach(casier => {
    MIS_DE_COTE[casier].forEach(r => {
      if (sortie[casier].indexOf(r.id) >= 0) return;
      sortie[casier].splice(Math.min(r.i, sortie[casier].length), 0, r.id);
      dates[casier + ":" + r.id] = r.depuis;
    });
  });
  if (Object.keys(dates).length) sortie.decote = dates;
  // tant qu'aucune journée n'a été organisée, il n'y a rien à nommer
  if (ID_PARCOURS) sortie.id = ID_PARCOURS;
  return sortie;
}

export function enregistreParcours(){
  // navigation privée, stockage plein : la visite continue sans le parcours
  try { localStorage.setItem(cleParcours(), JSON.stringify(parcoursAEcrire())); }
  catch (e) {}
  /* La liste a changé : ce que le serveur garde pour rappeler doit changer avec
     elle. Une conférence retirée ne se rappelle plus, une conférence ajoutée
     se rappelle — et le visiteur qui n'a rien demandé n'envoie rien. */
  _synchroniseRappels();
}

/* ------------------------------------------------------------
   Que le navigateur ne fasse pas le ménage dessus
   ------------------------------------------------------------ */
/**
 * Un stockage que le navigateur tient pour jetable, et un qu'il garde.
 *
 * Sans rien demander, ce qu'une page écrit est « au mieux » : Chrome et Firefox
 * l'effacent quand l'appareil manque de place, et ils commencent par les
 * origines dont personne n'a dit qu'elles comptaient. `persist()` le dit.
 *
 * Trois navigateurs, trois réponses. Chromium accorde ou refuse en silence,
 * sur ce qu'il sait de l'usage du site — l'appeler ne coûte rien à personne.
 * Safari ne l'implémente pas, et sa purge à sept jours ne se désarme d'aucune
 * façon : là, seule la copie emportée protège (`modules/partage.mjs`). Firefox,
 * lui, pose la question au visiteur — d'où `demande` : on ne fait pas surgir
 * une permission sur quelqu'un qui vient de toucher un signet, on ne la
 * présente qu'à celui qui demande justement que sa liste tienne.
 */
let PERSISTANCE_DEMANDEE = false;
export async function tientLeStockage(demande){
  const s = navigator.storage;
  if (!s || !s.persist || !s.persisted) return false;
  try {
    if (await s.persisted()) return true;
    // le refus d'hier ne se corrige pas en le redemandant à chaque signet
    if (PERSISTANCE_DEMANDEE && !demande) return false;
    if (!demande && /Firefox\//.test(navigator.userAgent)) return false;
    PERSISTANCE_DEMANDEE = true;
    return await s.persist();
  } catch (e) { return false; }
}

/** « 3 exposants », « 1 conférence » : un compte et son mot, accordés. */
export const plurielParcours = (n, mot) => n + " " + mot + (n > 1 ? "s" : "");

/**
 * Ce qu'un lot contient, en toutes lettres.
 *
 * Les conférences ne se mentionnent que s'il y en a : « 5 exposants et 0
 * conférence » fait lire un manque là où il n'y a rien à lire — et un salon
 * sans programme du tout n'a pas à voir le mot.
 */
export const contenuParcours = (nStands, nConfs) =>
  [nStands ? plurielParcours(nStands, "exposant") : "",
   nConfs ? plurielParcours(nConfs, "conférence") : ""].filter(Boolean).join(" et ");

/* ------------------------------------------------------------
   La marque, partout la même
   ------------------------------------------------------------ */
export const SIGNET = '<svg viewBox="0 0 24 24" aria-hidden="true">' +
  '<path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z"/></svg>';

/** Le signet nu, tel qu'il se pose à côté d'une conférence du programme. */
export function signetParcours(genre, id){
  return '<button type="button" class="marque" data-mg="' + genre +
         '" data-mi="' + esc(id) + '"></button>';
}

/** Le même geste, en toutes lettres : sur une fiche, la place ne manque pas. */
export function boutonParcours(genre, id){
  return '<button type="button" class="btn parc" data-mg="' + genre +
         '" data-mi="' + esc(id) + '">' + SIGNET + '<span class="l"></span></button>';
}

export function rafraichitMarque(el){
  const dedans = dansParcours(el.dataset.mg, el.dataset.mi);
  el.setAttribute("aria-pressed", dedans);
  const dit = dedans ? "Retirer de mon parcours" : "Ajouter à mon parcours";
  el.title = dit;
  el.setAttribute("aria-label", dit);
  const l = el.querySelector(".l");
  if (l) l.textContent = dedans ? "Dans mon parcours" : "Ajouter à mon parcours";
  if (!el.querySelector("svg")) el.insertAdjacentHTML("afterbegin", SIGNET);
}

/* ------------------------------------------------------------
   Ce que le parcours change à l'écran
   ------------------------------------------------------------ */
/**
 * Les liserés du plan.
 *
 * Deux marques se posent sur un stand sans que les données le disent : celle
 * de la sélection, et celle du parcours. Ni l'une ni l'autre ne se peint sur
 * le stand lui-même — elles se recopient dans un calque à part, posé au-dessus
 * des couches.
 *
 * Portées par le stand, elles disparaissaient le long des cloisons mitoyennes :
 * deux stands voisins partagent le même segment, et celui que le plan trace en
 * second y repassait son propre contour par-dessus le liseré du premier. Un
 * stand pris au milieu d'un îlot n'était alors cerné que sur ses côtés libres.
 * Une zone est logée à la même enseigne, et plus mal encore : les stands se
 * tracent après elle et recouvrent tout ce qui passe sous eux.
 *
 * Recopier le tracé plus haut règle la question sans toucher à l'ordre des
 * couches, que l'exploitant règle. L'aplat de la sélection, lui, reste sur le
 * stand : c'est une couleur de surface, elle n'a rien à gagner à monter.
 */
function calqueMarques(){
  let g = $("marques");
  if (!g){
    g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.id = "marques";
    // au-dessus des couches, sous le trajet et les poignées d'édition ; le
    // plan est le `svg` de `vue.mjs`, relu par son identifiant
    const svg = $("plan");
    svg.insertBefore(g, svg.querySelector("#itin, #apercu, #poignees"));
  }
  return g;
}

/**
 * Le calque se relit dans le plan plutôt qu'il ne se tient à jour : les deux
 * marques changent par des chemins sans rapport — un signet, un clic, un
 * changement de pavillon — et une seule lecture les remet d'accord.
 */
export function dessineMarques(){
  /* Les liserés vivent hors des couches : rien ne les masquerait avec elles.
     Une couche de données retirée par l'exploitant doit pourtant emporter les
     marques de ce qu'elle portait, sans quoi le plan garderait des contours
     sans stands. */
  const montree = n => { const g = $(n); return !g || g.style.display !== "none"; };
  const vu = { stands: montree("stands"), zones: montree("zones") };
  let parc = "", sel = "";
  document.querySelectorAll("#stands > g, #zones > g").forEach(g => {
    if (!vu[g.parentNode.id]) return;
    const p = g.querySelector("path");
    if (!p) return;
    /* Une zone garde son trait discontinu jusque dans sa sélection — c'est ce
       qui la distingue d'un stand. Le parcours, lui, se veut continu partout :
       il dit qu'on a retenu l'endroit, pas ce qu'il est. */
    const d = ' d="' + p.getAttribute("d") + '"/>';
    if (g.classList.contains("enparcours")) parc += '<path class="parc"' + d;
    if (g.classList.contains("sel"))
      sel += '<path class="sel' + (g.parentNode.id === "zones" ? " zn" : "") + '"' + d;
  });
  // la sélection en dernier : c'est elle qu'on vient de désigner
  calqueMarques().innerHTML = parc + sel;
}

/**
 * Ce qu'un visiteur a retenu, marqué sur le plan.
 *
 * Une zone y entre par les conférences qu'elle abrite : c'est là qu'il faudra
 * se rendre à l'heure dite, la conférence n'ayant pas de forme propre.
 */
export function marqueParcours(){
  if (!DATA) return;
  const zones = new Set();
  PARCOURS.confs.forEach(id => {
    const c = CONFS.get(id);
    if (c && c.zone) zones.add(String(c.zone));
  });
  document.querySelectorAll("#stands > g, #zones > g").forEach(g => {
    g.classList.toggle("enparcours",
      PARCOURS.stands.indexOf(g.dataset.id) >= 0 || zones.has(g.dataset.id));
  });
  dessineMarques();
}

/* ------------------------------------------------------------
   Ce que le tiroir range et nomme
   ------------------------------------------------------------ */
/** De quoi ranger deux conférences dans l'ordre où on les vivra. */
export function instantConf(c){
  const fz = DATA.fuseau;
  return momentLocal(c.debutLocal, fz) || momentLocal(c.debut, fz);
}
export const cleTemps = c => {
  const d = instantConf(c);
  // sans heure lisible, la conférence se range en fin de liste plutôt que de
  // s'intercaler n'importe où
  return d ? d.cle + d.h + d.min : "999999999999";
};

/** Le nom sous lequel un exposant paraît dans une liste : son enseigne, faute
 *  de quoi ce que le plan porte, faute de quoi son numéro d'emplacement. La
 *  fenêtre d'un parcours reçu montre les mêmes noms que le tiroir. */
export const nomDeStand = o => o.nom || o.plan || ("Stand " + (o.code || "")).trim();

export function groupeParcours(hote, titre){
  const g = document.createElement("div");
  g.className = "pGroupe";
  g.innerHTML = '<span class="eyebrow"></span>';
  g.querySelector(".eyebrow").textContent = titre;
  hote.appendChild(g);
  return g;
}

/* Refermer le tiroir du parcours. Il s'ouvre par `tiroir-parcours.mjs`, qui
   le remplit ; il se referme ici, parce que la fiche, le tiroir de
   l'itinéraire et l'apparence le referment aussi et que ce module-ci, sous
   eux trois, s'importe sans boucle — rangé dans le tiroir, le geste devait
   leur être confié au chargement. */
export function fermeParcours(){
  const t = $("parcours");
  if (!t || !t.classList.contains("open")) return;
  t.classList.remove("open");
  $("btnParcours").setAttribute("aria-pressed", "false");
}
