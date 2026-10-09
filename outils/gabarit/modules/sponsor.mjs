/* ============================================================
   Le sponsor — un logo le temps du chargement

   La part que le visiteur reçoit : le générique, son cache sur l'appareil, et
   ce que le plan en demande au démarrage. Le réglage de l'exploitant vit dans
   `reglage-sponsor.mjs`, que seul `plan-admin.mjs` embarque.
   ============================================================ */
import { $ } from "./dom.mjs";
import { imageSure, adresseSure } from "./sur.mjs";
import { SLUG, PLAN_ADMIN } from "./salon.mjs";
import { DATA } from "./donnees.mjs";
import { vue } from "./vue.mjs";

/* Ce que le code soudé tient encore, et que le branchement confie : la
   configuration du plan (`_admin1.html` `conf`). La page où l'on est
   (`PLAN_ADMIN`) s'importe de `salon.mjs`. La vue dessinée, lue à l'instant,
   s'importe de `vue.mjs`. */
/** @type {(cle: string) => any} */
let conf;
/**
 * Un salon se vend aussi par son plan. L'organisateur qui propose à un
 * partenaire « le plan interactif du salon » lui promet l'écran que tous les
 * visiteurs traversent — et il n'y avait, jusqu'ici, aucune place où le poser.
 * Les seules disponibles étaient dans le plan lui-même, c'est-à-dire là où l'on
 * cherche un exposant : une marque posée là gêne la lecture et se paie en
 * confusion.
 *
 * Le démarrage, lui, est une place vraie, et elle ne coûte rien à personne. La
 * page s'ouvre, les données arrivent, le plan se dessine : cet intervalle est
 * perdu de toute façon, et le visiteur le passait devant un rectangle vide. Le
 * logo l'occupe, puis s'efface de lui-même. Rien n'est à fermer, rien n'attend
 * un geste — un écran qui réclame un clic pour disparaître est une réclame,
 * celui-ci est un générique.
 *
 * Trois règles le tiennent à sa place, et ce sont elles qui font la différence.
 *
 * — **Il ne retarde pas.** Ses secondes se comptent depuis l'ouverture de la
 *   page, jamais depuis l'instant où il paraît : le temps de chargement est
 *   compris dedans, et non ajouté après. Un plan qui met plus longtemps à venir
 *   que le générique ne devait durer n'en reçoit pas du tout — il n'y aurait
 *   plus d'attente à remplir, seulement de l'attente à ajouter.
 * — **Il ne bloque pas.** Un doigt posé dessus l'efface sur-le-champ, la touche
 *   d'échappement aussi, et une panne de chargement de même : le message qui
 *   dit ce qui ne va pas passe avant le logo qui le couvrirait.
 * — **Il couvre le plan, et le plan seul.** La barre du haut, la liste et sa
 *   ligne « Chargement du plan… » restent lisibles dessous ; le visiteur voit
 *   que quelque chose se fait, et sur quoi.
 *
 * Reste le point qui décide de tout : il paraît **au premier trait de la page**,
 * et non à l'arrivée des données — sans quoi il n'aurait rien couvert, étant
 * arrivé avec ce qu'il devait couvrir. Or à cet instant la page ne sait rien du
 * salon qu'elle ouvre. Ce qu'il montre est donc relu sur l'appareil, laissé là
 * par la visite précédente : le stockage local est le seul endroit prêt avant
 * l'API. Une première ouverture sur un appareil neuf le montre à l'arrivée des
 * données, si elles sont venues à temps, et pose le cache pour les suivantes.
 *
 * L'administration ne le voit jamais : l'exploitant y recharge son plan vingt
 * fois par heure, et le générique de son client lui passerait devant à chaque
 * fois. Il l'essaie depuis son volet de réglages, où un bouton le joue.
 */

/* Ce que dure le générique, réglable entre ces bornes. Trois secondes par
   défaut : le temps de reconnaître une marque, pas celui de s'impatienter.
   Au-delà de dix, ce n'est plus un générique mais une page d'accueil — et le
   visiteur qui a photographié un code à l'entrée du hall veut son plan. */
const SPONSOR_DEFAUT = 3;
export const SPONSOR_MIN = 2;
export const SPONSOR_MAX = 10;

/* Arrivé en retard — première ouverture sur cet appareil, réseau lent — le logo
   garde au moins ceci sous les yeux : un logo vu deux dixièmes de seconde n'a
   pas été vu, et un clignotement se remarque plus que la marque. */
const SPONSOR_MINI = 1200;

/* Le plan n'est pas venu, et ne viendra peut-être jamais — une API muette, un
   pavillon vide. Au-delà, le générique s'efface quand même : ce qu'il couvre,
   fût-ce un plan à moitié dessiné, vaut mieux qu'un logo qui ne part plus. */
const SPONSOR_BUTOIR = 12000;

/* L'estompe, accordée à la transition de « .sponsor » dans `_head.html` : la
   boîte se retire une fois qu'elle a fini. On ne s'en remet pas à
   « transitionend », qui ne vient pas si l'onglet passe en arrière-plan
   pendant ce temps — le minuteur, lui, vient toujours. */
const SPONSOR_ESTOMPE = 700;

/* Les mentions proposées au-dessus du logo d'un sponsor. Une liste fermée, et
   non un champ libre : ce qui s'écrit ici paraît sur l'écran d'un visiteur qui
   peut lire le plan en anglais, et une phrase tapée à la main n'aurait pas de
   traduction. Le nom du sponsor, lui, est un nom propre et se saisit. */
export const MENTIONS_SPONSOR = ["Avec le soutien de", "Partenaire officiel",
  "Sponsor officiel", "En partenariat avec"];

/* Les trois façons de commencer, dans l'ordre où le volet les propose. La
   première est le défaut, et c'est voulu : un salon déjà en ligne ne se met pas
   à montrer un écran de plus sans que personne l'ait demandé. */
const MODES_SPONSOR = ["", "marque", "sponsor"];

/* La marque du produit, posée par la construction à la place du commentaire
   (`outils/genere.js`, `outils/icones.js`). Celle qui garde son carré de nuit,
   et non la nue : le générique se pose sur le fond du plan — le gris clair
   d'origine, ou la couleur que l'exploitant a réglée —, et une marque qui
   porte son propre fond est la seule qui tienne sur toutes. C'est exactement
   ce qu'on conseille au sponsor pour son logo.

   C'est le seul endroit où la marque paraisse devant un visiteur. Ailleurs elle
   se tient dans ce qui appartient à l'outil — la bande d'administration, la
   console, l'écran d'accès — pour ne pas déguiser le salon en Event2Map. Ici
   elle ne le déguise pas non plus : elle passe, elle dit « powered by », et
   elle cède la place au hall.

   Entre accents graves, et non entre apostrophes : esbuild réécrit une chaîne
   simple entre guillemets droits, et la marque qui prend sa place en porte
   dans chacun de ses attributs. Un gabarit sans substitution, il le laisse
   tel quel. */
export const MARQUE_SPONSOR = `<!--__MARQUE__-->`;

export const reglageSponsor = () => conf("_sponsor");

/** Les secondes réglées, ramenées dans les bornes — trois par défaut. */
export function secondesSponsor(r){
  const s = Math.round(+(r || reglageSponsor()).secondes);
  return s >= SPONSOR_MIN && s <= SPONSOR_MAX ? s : SPONSOR_DEFAUT;
}

/**
 * Lequel des trois modes ce salon a retenu.
 *
 * `actif` est ce que la première version écrivait, du temps où le choix n'était
 * qu'une case à cocher. Un salon réglé avant ce jour porte cela en base, et
 * voulait dire un logo de sponsor : il le garde jusqu'à ce qu'on touche au
 * choix, qui écrit `mode` et décide seul à partir de là.
 */
export function modeSponsor(r){
  const c = r || reglageSponsor();
  if (typeof c.mode === "string")
    return MODES_SPONSOR.indexOf(c.mode) > 0 ? c.mode : "";
  return c.actif === true ? "sponsor" : "";
}

/**
 * Ce qui paraîtra au démarrage, ou rien du tout.
 *
 * Tout y est relu plutôt que recopié. Le logo d'un sponsor vient de la base et
 * finit dans une balise « img » chez chaque visiteur : c'est le chemin qu'a déjà
 * le logo d'une zone, et il mérite la même méfiance. Le lien de même —
 * « javascript: » est une adresse valide, et celle-ci est posée sur un écran que
 * tout le monde traverse.
 *
 * La marque, elle, n'a rien à relire : elle ne vient pas de la base mais de la
 * construction, et ce qu'elle dit ne se règle pas.
 */
export function sponsorRetenu(source){
  const r = source || reglageSponsor();
  if (!r) return null;
  const mode = modeSponsor(r);
  if (!mode) return null;
  const secondes = secondesSponsor(r);
  if (mode === "marque")
    return { mode: mode, mention: "powered by", nom: "Event2Map",
             lien: "", secondes: secondes };
  const logo = imageSure(r.logo);
  // sans logo il n'y a pas de générique : une mention seule n'est pas un écran
  if (!logo) return null;
  return {
    mode: mode,
    logo: logo,
    nom: String(r.nom || "").trim().slice(0, 80),
    mention: MENTIONS_SPONSOR.indexOf(r.mention) >= 0 ? r.mention : "",
    lien: adresseSure(r.lien),
    secondes: secondes,
  };
}

/* ------------------------------------------------------------
   Ce que l'appareil garde, pour la fois d'après

   Le générique doit être là avant les données, et les données sont justement
   ce qui le nomme. Le nœud se dénoue par le stockage local : chaque ouverture
   y laisse le sponsor qu'elle a appris, la suivante le retrouve au premier
   trait. Une clé par salon, comme le parcours — un même téléphone ouvre
   plusieurs salons, et le partenaire de l'un n'est pas celui de l'autre.
   ------------------------------------------------------------ */
const cleSponsor = () => "plan-sponsor:" + SLUG;

/** Ce que la visite précédente a laissé, déjà relu. */
function sponsorEnCache(){
  if (!SLUG) return null;
  try {
    const garde = JSON.parse(localStorage.getItem(cleSponsor()) || "null");
    return garde ? sponsorRetenu(garde) : null;
  } catch (e) { return null; }
}

/**
 * Met le cache d'accord avec ce que les données viennent de dire.
 *
 * On n'écrit que ce qui change : le logo pèse quelques dizaines de kilo-octets,
 * et le réécrire à chaque ouverture ferait travailler le disque d'un téléphone
 * pour rien.
 */
function retientSponsor(s){
  if (!SLUG) return;
  try {
    const neuf = s ? JSON.stringify(s) : "";
    if ((localStorage.getItem(cleSponsor()) || "") === neuf) return;
    if (neuf) localStorage.setItem(cleSponsor(), neuf);
    else localStorage.removeItem(cleSponsor());
  } catch (e) {}
}

/* ------------------------------------------------------------
   Le générique lui-même
   ------------------------------------------------------------ */
/* Celui qui est à l'écran, ou rien. */
let SPONSOR = null;

/**
 * Pose le générique sur le plan.
 *
 * `horsDemarrage` distingue les deux façons dont il peut paraître. À
 * l'ouverture de la page, ses secondes se comptent depuis cette ouverture —
 * c'est tout le principe : il occupe le chargement au lieu de s'y ajouter. Pour
 * l'aperçu de l'exploitant et pour la borne qui se remet au repos, il n'y a
 * aucun chargement en cours et le compte part d'ici.
 */
export function ouvreSponsor(s, horsDemarrage){
  if (!s || SPONSOR) return;
  const hote = $("stage");
  if (!hote) return;

  const boite = document.createElement("div");
  boite.className = "sponsor";
  const bloc = document.createElement("div");
  bloc.className = "sponsorBloc";
  boite.appendChild(bloc);

  if (s.mention){
    const m = document.createElement("span");
    m.className = "eyebrow sponsorMention";
    m.textContent = s.mention;
    bloc.appendChild(m);
  }

  /* Le logo porte le lien quand il y en a un, et rien d'autre ne le porte : un
     visiteur qui touche l'écran veut son plan, pas la page d'un annonceur. */
  const porte = document.createElement(s.lien ? "a" : "div");
  porte.className = "sponsorLogo";
  if (s.lien){
    const lien = /** @type {HTMLAnchorElement} */ (porte);
    lien.href = s.lien;
    lien.target = "_blank";
    lien.rel = "noopener noreferrer";
  }
  if (s.mode === "marque"){
    /* La marque est un dessin, non une image déposée : elle vient de la
       construction, elle est nette à toute taille, et elle est déjà muette —
       « Event2Map » est écrit juste dessous, en texte. */
    porte.classList.add("sponsorMarque");
    porte.innerHTML = MARQUE_SPONSOR;
  } else {
    const img = document.createElement("img");
    img.src = s.logo;
    /* Le nom est écrit juste dessous : le répéter en texte de remplacement le
       ferait lire deux fois. Sans nom, l'image doit se dire elle-même. */
    img.alt = s.nom ? "" : "Logo du sponsor";
    porte.appendChild(img);
  }
  bloc.appendChild(porte);

  if (s.nom){
    const n = document.createElement("strong");
    n.className = "sponsorNom";
    n.textContent = s.nom;
    bloc.appendChild(n);
  }

  /* Un doigt posé l'efface : rien de ce qu'il couvre ne doit attendre après
     lui. Le logo fait exception quand il porte un lien — on l'a touché pour
     aller voir le sponsor, pas pour s'en débarrasser. */
  boite.addEventListener("pointerdown", e => {
    if (s.lien && porte.contains(/** @type {Node} */ (e.target))) return;
    fermeSponsor();
  });
  /* Et pour qui n'a pas de doigt à poser : la touche qui ferme tout le reste
     de la page ferme aussi celle-ci — et elle seule. Le générique est ce qui
     est devant : posée sur `document`, l'écoute passe avant celle de la page,
     qui refermerait du même coup la fiche qu'un lien vient d'ouvrir dessous. */
  const touche = e => {
    if (e.key !== "Escape") return;
    e.stopPropagation();
    fermeSponsor();
  };
  document.addEventListener("keydown", touche);

  hote.appendChild(boite);
  const pose = performance.now();
  SPONSOR = {
    boite: boite,
    touche: touche,
    pose: pose,
    seul: !!horsDemarrage,
    /* L'échéance, en millisecondes depuis l'ouverture de la page — ce que
       `performance.now()` compte. Au démarrage elle part de cette ouverture, et
       le minimum la repousse juste assez pour que le logo ne clignote pas. */
    echeance: horsDemarrage ? pose + s.secondes * 1000
                            : Math.max(s.secondes * 1000, pose + SPONSOR_MINI),
    minuteur: 0,
  };
  suitSponsor();
}

/**
 * Surveille l'échéance, et le plan qu'on attend derrière.
 *
 * Rappelée par `_admin2.html` quand le plan est dessiné : sans ce rappel, le
 * générique attendrait son butoir pour s'apercevoir que ce qu'il couvrait est
 * arrivé.
 */
export function suitSponsor(){
  if (!SPONSOR) return;
  clearTimeout(SPONSOR.minuteur);
  const t = performance.now();
  // le plan n'est pas venu : on s'efface quand même plutôt que de rester dessus
  if (t - SPONSOR.pose >= SPONSOR_BUTOIR) return fermeSponsor();
  /* Le plan est dessiné — « view » le dit, comme partout ailleurs dans la page
     — et les secondes sont passées : il n'y a plus rien à couvrir. */
  const plan = SPONSOR.seul || !!(DATA && vue());
  if (plan && t >= SPONSOR.echeance) return fermeSponsor();
  SPONSOR.minuteur = setTimeout(suitSponsor, Math.max(50,
    plan ? SPONSOR.echeance - t : SPONSOR.pose + SPONSOR_BUTOIR - t));
}

/**
 * Ce qu'il reste de générique à l'écran, en millisecondes — rien s'il n'y en a
 * pas.
 *
 * Les deux fenêtres qui se proposent d'elles-mêmes au démarrage — la visite
 * guidée, l'invitation à installer — s'en servent pour attendre leur tour.
 * Elles passent devant tout, y compris devant ce générique : la première se
 * serait posée sur le logo une seconde après qu'il paraît, et le sponsor aurait
 * payé pour l'écran de quelqu'un d'autre. Elles ne renoncent pas pour autant —
 * ce qui est devant part de lui-même, et à une date connue.
 */
export function resteSponsor(){
  if (!SPONSOR) return 0;
  return Math.max(0, SPONSOR.echeance - performance.now()) + SPONSOR_ESTOMPE;
}

/** L'estompe, puis le retrait. Sans effet si rien n'est à l'écran. */
export function fermeSponsor(){
  const s = SPONSOR;
  if (!s) return;
  SPONSOR = null;
  clearTimeout(s.minuteur);
  document.removeEventListener("keydown", s.touche);
  s.boite.classList.add("part");
  setTimeout(() => s.boite.remove(), SPONSOR_ESTOMPE);
}

/**
 * Ce que les données disent du sponsor, au démarrage du plan.
 *
 * Appelée par `demarre` avant que le plan ne soit monté : c'est le dernier
 * moment où poser un générique ait encore un sens.
 */
export function accueilleSponsor(){
  /* L'administration ne joue pas le générique, et n'en garde rien non plus : ce
     qu'elle voit peut être un brouillon que les visiteurs n'ont pas encore, et
     il paraîtrait sur le plan public ouvert depuis le même poste. */
  if (PLAN_ADMIN) return;
  const s = sponsorRetenu();
  // ce qu'on vient d'apprendre servira à la prochaine ouverture, dès son premier trait
  retientSponsor(s);

  if (SPONSOR){
    /* Déjà posé depuis le cache. Si l'exploitant a changé de sponsor depuis la
       dernière visite, c'est l'ancien qui est sous les yeux : on le laisse
       finir — un logo échangé en cours de générique se verrait plus que la
       marque — et la prochaine ouverture montrera le bon. S'il a été retiré,
       en revanche, il n'y a plus rien à laisser finir. */
    if (!s) fermeSponsor();
    return;
  }
  if (!s) return;
  /* Trop tard pour couvrir quoi que ce soit : le plan a mis plus de temps à
     venir que le générique ne devait durer. Le poser maintenant ajouterait à
     l'attente au lieu de la remplir. Le cache, posé à l'instant, fera que la
     prochaine ouverture le montrera dès le premier trait. */
  if (performance.now() > s.secondes * 1000) return;
  ouvreSponsor(s);
}

/**
 * Le branchement du générique, appelé par le code soudé à la place que ce code
 * y tenait (`_sponsor.html`) : c'est là qu'il paraît au premier trait de la
 * page, au même rang qu'avant parmi ce que le plan pose sur la scène.
 *
 * @param {{ conf: typeof conf }} b
 */
export function brancheSponsor(b){
  conf = b.conf;
  /* Le générique, au premier trait de la page : avant les données, avant le plan,
     avant tout ce qu'il est censé couvrir. Il ne peut donc montrer que ce qu'une
     visite précédente a laissé sur l'appareil — voir le cache, plus haut. */
  if (!PLAN_ADMIN) ouvreSponsor(sponsorEnCache());
}
