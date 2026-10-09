/* ============================================================
   11 ter. Organiser sa visite — la question posée, et le tiroir

   Sorti de `_journee.html`, où il se branche encore (`brancheJournee`) : le
   parcours, le tracé de l'itinéraire et les réglages du salon vivent
   toujours dans le code soudé, qui les lui confie à la place que ce code y
   tenait ; la fiche s'importe de `fiche.mjs`. Le calcul — répartir, ordonner, dérouler — est dans
   `sejour.mjs`, que ce module branche à son tour.
   ============================================================ */
import { $ } from "./dom.mjs";
import { DATA, CONFS, state } from "./donnees.mjs";
import { jourCourt, dateDeCle, jourBref, minutesDe, ecritHeure, ecritMinutes } from "./temps.mjs";
import { PARCOURS, identifiantParcours, plurielParcours, contenuParcours, instantConf, nomDeStand }
  from "./parcours.mjs";
import { heureAuSalon, pointRepere, portesDe, ecritDistance, phraseLiaison } from "./itineraire.mjs";
import { pointBorne } from "./borne.mjs";
import { ouvreModale, fermeModale } from "./fenetre.mjs";
import { mesure } from "./mesure.mjs";
import { annoncePlan, litLaCharge, brancheCharge } from "./charge-annoncee.mjs";
import { PLACES, oublieMatrice, calculeSejour, apercuRepartition, brancheSejour } from "./sejour.mjs";
import { ITI, TRACE, poseTrace, dessineItineraire, cadreItineraire } from "./tiroir-itineraire.mjs";
import { select, ficheConf } from "./fiche.mjs";

/* Ce que le code soudé confie, et rien avant qu'il l'ait fait. Le tracé de
   l'itinéraire (`tiroir-itineraire.mjs` `TRACE`) est réaffecté là-bas comme
   ici : on le lit tel qu'il est à l'instant, et on le pose par sa porte. */
/** @type {Record<string, any>} */
let soude = {};

// les jours et les heures du salon, tels que l'exploitant les a saisis (`_admin1.html`)
const datesSalon = () => soude.datesSalon();
const horairesSalon = (jour) => soude.horairesSalon(jour);
const lueHeure = (s) => soude.lueHeure(s);
// le parcours et le plan, que ce tiroir refait ; la fiche s'importe de `fiche.mjs`
const basculeParcours = (...a) => soude.basculeParcours(...a);
const rangParcours = (hote, r) => soude.rangParcours(hote, r);
const rafraichitParcours = () => soude.rafraichitParcours();
const changePlan = (i) => soude.changePlan(i);
// le trait de l'itinéraire, que la journée reprend pour elle
const trace = () => TRACE;

/**
 * Le parcours dit ce qu'on veut voir. Il ne dit ni quel jour, ni dans quel
 * ordre, ni si le temps y suffit — et c'est pourtant là que tout se joue :
 * douze stands retenus au hasard des allées, deux conférences à heure fixe, et
 * un visiteur qui repart en ayant traversé quatre fois le même hall sans voir
 * la moitié de sa liste.
 *
 * On lui demande donc deux choses — quels jours il vient, à quelle heure il
 * arrive — et on range le reste : les conférences sont des rendez-vous qu'on
 * ne déplace pas, et qui tombent le jour qu'elles tombent ; les stands se
 * glissent entre elles, et l'ordre retenu est celui qui fait le moins de
 * chemin. Le temps passé sur un stand ne se devine pas depuis le plan ; c'est
 * l'exploitant qui le fixe, salon par salon.
 *
 * Un salon de trois jours n'est pas trois fois le même salon. Ce qui se
 * répartit n'est pas la liste en trois tas de taille égale, c'est la marche :
 * un visiteur qui fait cinq kilomètres le mardi et huit cents mètres le
 * mercredi n'a pas organisé sa visite, il a rempli son premier jour. On
 * cherche donc des jours qui se ressemblent — et qui, chacun, tiennent entre
 * l'ouverture et la fermeture, autour de conférences qu'on ne bouge pas.
 *
 * Ce qu'on rend n'est pas une promesse : une conversation s'éternise, une
 * conférence commence en retard, et l'heure de seize heures ne vaudra plus
 * rien à quatorze. C'est un ordre de visite, avec des heures qui disent ce
 * qui tient et ce qui ne tient pas — et que le visiteur reprend à la main dès
 * qu'il n'est pas d'accord.
 */

/* L'heure d'arrivée et la répartition voulue, d'une visite à l'autre : celui
   qui vient deux jours de suite vient rarement à deux heures différentes, et
   celui qui charge ses premiers jours a ses raisons — un train, un stand à
   tenir — qui ne changent pas d'un soir à l'autre. */
const CLE_ARRIVEE = "plan-journee-arrivee";
const CLE_PENTE = "plan-journee-pente";

/* Le temps d'immobilité du curseur au bout duquel l'aperçu se refait. Un
   curseur envoie une rafale d'événements pendant qu'on le fait glisser, et
   chacun demanderait une répartition entière : on laisse passer la rafale, et
   l'on compte quand la main s'arrête. Deux dixièmes de seconde — le même repos
   que le nuancier des calques, et pour la même raison. */
const REPOS_APERCU = 180;

export let SEJOUR = null;       // tous les jours calculés, et ce qui n'entre dans aucun
export let JOURNEE = null;      // celui qu'on regarde — un élément de `SEJOUR.jours`
export let vueJournee = false;  // le tiroir montre-t-il la visite ou la liste ?

/**
 * Les jours qu'on a décochés alors qu'une conférence y était retenue.
 *
 * Le jour d'une conférence se coche de lui-même, et à chaque ouverture — mais
 * il se décoche aussi : on a pris le train du soir, et celle de dix-huit
 * heures ne s'aura pas. Ce refus-là tient, sans quoi rouvrir la fenêtre pour
 * changer l'heure d'arrivée recocherait le jour dans le dos du visiteur.
 */
const REFUS = new Set();   // clés de jours décochés à la main

/* ------------------------------------------------------------
   Les jours
   ------------------------------------------------------------ */
/** Les jours du salon, dans l'ordre. Ceux que l'exploitant a datés d'abord :
 *  un salon sans conférence a des jours lui aussi, et c'est parmi eux que le
 *  visiteur choisit les siens. À défaut, les jours où le programme a quelque
 *  chose. */
function joursSalon(){
  const nomme = (cle) => ({ cle: cle, nom: jourCourt(dateDeCle(cle)), court: jourBref(cle) });
  const dates = datesSalon();
  if (dates.length) return dates.map(j => nomme(j.cle));
  const vus = new Set();
  CONFS.forEach(c => {
    const d = instantConf(c);
    if (d) vus.add(d.cle);
  });
  return [...vus].sort().map(nomme);
}

/**
 * Les jours qu'on propose : ceux qui restent.
 *
 * Proposer hier n'aide personne, et le proposer à un visiteur déjà sur place
 * ferait douter du reste : un plan qui offre d'organiser une journée révolue
 * ne sait visiblement pas quel jour on est. La comparaison se fait à l'heure
 * du salon, non à celle de l'appareil — un plan consulté depuis un autre
 * fuseau se lit à l'heure du hall, et c'est elle qui dit si le jour est passé.
 *
 * Le jour même reste proposé tant que les portes ne sont pas fermées : on
 * arrive à quatorze heures pour deux conférences de l'après-midi. Une fois
 * closes, il rejoint les autres — organiser ce qui est fini ne mène à rien.
 *
 * Sans heure lisible — fuseau inconnu — on propose tout plutôt que rien : se
 * tromper de quelques heures vaut mieux que de refuser une visite à qui la
 * prépare.
 */
export function joursAVenir(){
  const jours = joursSalon();
  const t = heureAuSalon();
  if (!t) return jours;
  const fin = horairesSalon(t.cle).fermeture;
  const maintenant = minutesDe(t);
  return jours.filter(j => j.cle > t.cle ||
    (j.cle === t.cle && (fin === null || maintenant < fin)));
}

/**
 * Les jours cochés d'avance.
 *
 * Ceux où le visiteur a retenu une conférence : il y vient, la question ne se
 * pose plus. À défaut le premier qui reste — cocher tout le salon répondrait à
 * sa place, et trois jours proposés d'office feraient trois journées à demi
 * remplies là où une seule suffisait.
 */
function joursDefaut(dispo){
  const dates = confsParJour();
  const retenus = dispo.filter(j => dates.has(j.cle));
  return new Set((retenus.length ? retenus : dispo.slice(0, 1)).map(j => j.cle));
}

/** Les conférences retenues, rangées par jour. Ce sont elles qui cochent un
 *  jour d'office, et qui se comptent sous sa case. Une conférence sans date
 *  n'appartient à aucun jour : elle se dit à la fin du calcul, avec celles
 *  qu'aucune journée ne porte. */
function confsParJour(){
  const m = new Map();
  PARCOURS.confs.map(id => CONFS.get(id)).filter(Boolean).forEach(c => {
    const d = instantConf(c);
    if (!d) return;
    if (!m.has(d.cle)) m.set(d.cle, []);
    m.get(d.cle).push(c);
  });
  return m;
}

/**
 * Les départs qu'on propose : les portes par où l'on entre, et rien d'autre.
 *
 * La liste offrait tous les repères du salon, entrées en tête. On y lisait
 * donc « Escalier », « WC », « Distributeur » — des endroits par lesquels on
 * ne commence pas sa journée, et qui repoussaient les portes hors de l'écran
 * sur un téléphone. La question posée est « par où vous entrez » : seules les
 * portes y répondent, et parmi elles, celles qui ne sont pas des sorties
 * seules.
 *
 * Un hall en a plusieurs, souvent nommées pareil : on les numérote alors, à
 * défaut de pouvoir les distinguer autrement. Les renommer — « Entrée Nord »
 * — reste le vrai remède, et il appartient à l'exploitant.
 */
function departsProposes(){
  /* Une borne sait où elle est posée : la question n'aurait qu'une réponse, et
     la poser ferait croire qu'il y en a d'autres. */
  const borne = pointBorne();
  if (borne) return [borne];
  const l = [];
  DATA.plans.forEach(p => portesDe(p, "entrant").forEach(f => l.push(pointRepere(f, p))));
  const vus = new Map();
  l.forEach(pt => vus.set(pt.nom, (vus.get(pt.nom) || 0) + 1));
  const rang = new Map();
  l.forEach(pt => {
    if (vus.get(pt.nom) < 2) return;
    const n = (rang.get(pt.nom) || 0) + 1;
    rang.set(pt.nom, n);
    pt.nom = pt.nom + " " + n;
  });
  return l.slice(0, 20);
}

/* ------------------------------------------------------------
   Ce que la visite montre
   ------------------------------------------------------------ */
function rangJournee(hote, heure, dedans, classe){
  const d = document.createElement("div");
  d.className = "jRang" + (classe ? " " + classe : "");
  const h = document.createElement("span");
  h.className = "jH";
  h.textContent = heure || "";
  d.appendChild(h);
  d.appendChild(dedans);
  hote.appendChild(d);
  return d;
}

function lienJournee(hote, texte){
  const s = document.createElement("span");
  s.className = "jL";
  s.textContent = texte;
  rangJournee(hote, "", s, "lien");
}

/* Le picto du changement de jour : un calendrier et une flèche. Un mot
   tiendrait mal à côté d'un arrêt sur un téléphone, et une double flèche seule
   ne dirait pas vers quoi. */
const PICTO_JOUR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
  'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>' +
  '<path d="M9 15.5h6m-2.5-2.5 2.5 2.5-2.5 2.5"/></svg>';

/**
 * Le bouton qui ouvre le choix du jour.
 *
 * Il se pose à côté de l'arrêt, et non dessus : l'arrêt ouvre la fiche de
 * l'exposant, c'est ce qu'on attend d'un nom sur lequel on appuie. Il ne
 * paraît que si la visite a plusieurs jours — déplacer vers le seul jour de
 * la visite n'est pas un geste — et sa cible fait la taille d'un pouce.
 */
function boutonJour(o){
  if (!SEJOUR || SEJOUR.jours.length < 2 || !o) return null;
  const b = document.createElement("button");
  b.type = "button";
  b.className = "jBouge";
  b.innerHTML = PICTO_JOUR;
  const dit = "Changer le jour de cet exposant";
  b.title = dit;
  b.setAttribute("aria-label", dit);
  b.onclick = ev => { ev.stopPropagation(); ouvreChoixJour(o); };
  return b;
}

function arretJournee(hote, e){
  const b = document.createElement("button");
  b.type = "button";
  b.className = "jArret" + (e.genre === "conf" ? " conf" : "");
  b.innerHTML = '<span class="jN"></span><span class="jTxt"><span class="jT"></span>' +
                '<span class="jS"></span></span><span class="jD"></span>';
  b.querySelector(".jN").textContent = e.n;
  b.querySelector(".jD").textContent = ecritMinutes(e.t1 - e.t0);
  if (e.genre === "conf"){
    if (e.c.couleur) b.style.setProperty("--tc", e.c.couleur);
    b.querySelector(".jT").textContent = e.c.nom;
    b.querySelector(".jS").textContent =
      ([e.c.salle, e.pt ? e.pt.detail : ""].filter(Boolean).join(" · ") ||
       "Salle non située sur le plan") +
      (e.retard > 1 ? " · vous y seriez à " + ecritHeure(e.t0 + e.retard) : "");
    if (e.retard > 1) b.classList.add("tard");
    b.onclick = () => ficheConf(e.c.id, "parcours");
  } else {
    b.querySelector(".jT").textContent = e.pt.nom;
    b.querySelector(".jS").textContent = e.pt.detail;
    b.onclick = () => { if (e.o) select(e.o.id, true, "parcours"); };
  }
  const rang = rangJournee(hote, ecritHeure(e.t0), b);
  /* Une conférence ne change pas de jour : elle a lieu quand elle a lieu, et
     lui poser le bouton ferait promettre ce qu'aucun calcul ne peut tenir. */
  if (e.genre !== "conf"){
    const bouge = boutonJour(e.o);
    if (bouge){
      rang.appendChild(bouge);
      if (PLACES.has(String(e.o.id))) bouge.classList.add("pose");
    }
  }
  return rang;
}

/* ------------------------------------------------------------
   Les onglets des jours
   ------------------------------------------------------------ */
/**
 * Une rangée d'onglets, un par jour, avec ce que chacun fait marcher.
 *
 * C'est le seul endroit d'où l'on voit l'équilibre de la visite — trois
 * nombres côte à côte disent d'un coup d'œil si le calcul a fait son travail,
 * là où trois écrans successifs ne diraient rien. Elle défile latéralement :
 * un salon de cinq jours ne tient pas en largeur sur un téléphone, et réduire
 * les onglets jusqu'à ce qu'ils tiennent les rendrait illisibles.
 */
function remplitOnglets(){
  const hote = $("jJours");
  if (!hote) return;
  hote.innerHTML = "";
  if (!SEJOUR || SEJOUR.jours.length < 2) return;
  SEJOUR.jours.forEach(j => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "jOnglet";
    b.setAttribute("aria-pressed", String(j === JOURNEE));
    b.innerHTML = '<span class="t"></span><span class="s"></span>';
    b.querySelector(".t").textContent = j.court;
    /* Un jour sans arrêt ne montre pas « 0 m » : ce n'est pas une distance
       courte, c'est une journée vide, et le tiret le dit sans mentir. */
    b.querySelector(".s").textContent = j.nArrets ? ecritDistance(j.m) : "—";
    b.onclick = () => montreLeJour(j);
    hote.appendChild(b);
  });
  /* L'onglet du jour regardé se ramène sous les yeux : on arrive souvent sur
     cette rangée par un stand qu'on vient de déplacer au dernier jour, et
     celui-ci est hors de l'écran. */
  const vu = hote.querySelector('[aria-pressed="true"]');
  if (vu && vu.scrollIntoView) vu.scrollIntoView({ block: "nearest", inline: "nearest" });
}

/* ------------------------------------------------------------
   Changer un exposant de jour
   ------------------------------------------------------------ */
/** Le jour où un exposant est tombé, ou rien s'il n'entre dans aucun. */
const jourDuStand = (id) => SEJOUR
  ? SEJOUR.jours.find(j => j.ids && j.ids.has(String(id))) || null : null;

/**
 * La feuille de choix.
 *
 * Un jour par bouton, pleine largeur, avec ce que chacun porte déjà : sur un
 * téléphone, c'est la seule forme qui se touche sans viser. Glisser un rang
 * d'une liste à l'autre aurait demandé de tenir, de viser et de lâcher au bon
 * endroit, dans un tiroir qui défile — un geste de bureau, pas un geste de
 * salon.
 */
function ouvreChoixJour(o){
  if (!SEJOUR) return;
  const id = String(o.id);
  const actuel = jourDuStand(id);
  ouvreModale("Déplacer « " + nomDeStand(o) + " »", corps => {
    const p = document.createElement("p");
    p.textContent = actuel
      ? "Choisissez le jour où vous voulez le voir. Lui seul change de journée ; le reste de votre visite ne bouge pas."
      : "Cet exposant n'entre dans aucune de vos journées. Choisissez celui où vous voulez le voir.";
    corps.appendChild(p);

    const liste = document.createElement("div");
    liste.className = "jChoix";
    SEJOUR.jours.forEach(j => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "jChoixJour";
      if (j === actuel) b.setAttribute("aria-current", "true");
      b.innerHTML = '<span class="t"></span><span class="s"></span>';
      b.querySelector(".t").textContent = j.nom;
      b.querySelector(".s").textContent = j === actuel
        ? "il y est déjà — l'y retenir"
        : plurielParcours(j.nArrets, "arrêt") + " · " + ecritDistance(j.m);
      b.onclick = () => { fermeModale(); placeSurJour(id, j.cle); };
      liste.appendChild(b);
    });
    corps.appendChild(liste);

    /* Revenir en arrière doit être aussi simple que d'avoir choisi : sans
       cela, un jour imposé par mégarde le resterait jusqu'au prochain vidage
       du parcours. */
    if (PLACES.has(id)){
      const l = document.createElement("button");
      l.type = "button";
      l.className = "jChoixLibre";
      l.textContent = "Laisser le plan choisir";
      l.onclick = () => { fermeModale(); rendAuPlan(id); };
      corps.appendChild(l);
    }

    const ote = document.createElement("button");
    ote.type = "button";
    ote.className = "jChoixOte";
    ote.textContent = "Retirer de mon parcours";
    ote.onclick = () => { fermeModale(); retireDuSejour(id); };
    corps.appendChild(ote);
  }, [{ libelle: "Annuler" }]);
}

/**
 * La visite telle qu'elle est, moins un exposant.
 *
 * C'est ce qu'on donne au calcul quand le visiteur retouche : chacun reste le
 * jour où il est, et seul celui qu'on touche bouge. Sans cela le calcul
 * reprendrait tout depuis le début — et rendrait, en toute justesse, une visite
 * où les trois pavillons ont changé de jour parce qu'on a déplacé un stand.
 */
const figeLaVisite = (sauf) => {
  const m = new Map(SEJOUR ? SEJOUR.assignation : []);
  m.delete(String(sauf));
  return m;
};

/** Le visiteur a dit son jour : on le retient, et on refait la visite autour.
 *  Le jour choisi passe devant les yeux — sans quoi le stand disparaîtrait de
 *  l'écran sans dire où il est allé. */
function placeSurJour(id, cle){
  const fige = figeLaVisite(id);
  PLACES.set(String(id), cle);
  refaitSejour(cle, fige);
}

/** Rendre au calcul le choix du jour : il reprend celui-là seul, le reste de
 *  la visite gardant le sien. */
function rendAuPlan(id){
  const fige = figeLaVisite(id);
  PLACES.delete(String(id));
  refaitSejour("", fige);
}

function retireDuSejour(id){
  const fige = figeLaVisite(id);
  PLACES.delete(String(id));
  basculeParcours("stand", id);
  refaitSejour("", fige);
}

/* ------------------------------------------------------------
   Le corps d'une journée
   ------------------------------------------------------------ */
function remplitJournee(){
  const hote = $("jCorps");
  hote.innerHTML = "";
  const j = JOURNEE;
  if (!j || !SEJOUR) return;
  const plusieurs = SEJOUR.jours.length > 1;

  /* Les notes et les alertes sont celles de l'itinéraire, classes comprises :
     c'est la même voix qui parle du même calcul, à deux endroits du tiroir. */
  const dit = (cls, txt) => {
    const p = document.createElement("p");
    p.className = cls;
    p.textContent = txt;
    hote.appendChild(p);
    return p;
  };

  if (SEJOUR.perime) dit("iAlerte", "Votre parcours a changé depuis ce calcul : " +
    "reprenez-le pour que la visite en tienne compte.");

  /* L'heure affichée en tête n'est plus celle qu'on a saisie : sans un mot,
     le visiteur croirait à une faute de frappe du calcul. */
  if (j.avantOuverture) dit("iNote", "Le salon ouvre à " + ecritHeure(j.ouverture) +
    " : la journée commence à l'ouverture, et non à " + ecritHeure(j.demandee) + ".");

  const bilan = document.createElement("div");
  bilan.className = "jBilan";
  bilan.innerHTML = '<b></b><span></span>';
  bilan.querySelector("b").textContent = ecritHeure(j.arrivee) + " – " + ecritHeure(j.fin);
  bilan.querySelector("span").textContent =
    [j.nArrets + (j.nArrets > 1 ? " arrêts" : " arrêt"),
     (j.coupe ? "au moins " : "") + ecritDistance(j.m) + " de marche",
     SEJOUR.pmr ? "itinéraire accessible" : ""].filter(Boolean).join(" · ");
  /* Le total du séjour sous le total du jour : c'est la seule ligne qui dise
     ce que la visite entière représente, et elle se lit là où l'on regarde
     déjà les chiffres. */
  if (plusieurs){
    const t = document.createElement("i");
    t.textContent = "sur " + SEJOUR.jours.length + " jours · " +
      ecritDistance(SEJOUR.m) + " en tout";
    bilan.appendChild(t);
  }
  hote.appendChild(bilan);

  const fil = document.createElement("div");
  fil.className = "jFil";
  hote.appendChild(fil);

  /* Une journée retenue sans rien à y faire n'est pas une erreur du calcul :
     c'est un jour de trop, ou une liste trop courte, et le dire vaut mieux
     qu'une page blanche. */
  if (!j.nArrets) dit("iNote", plusieurs
    ? "Rien n'est tombé sur cette journée : le calcul a tout fait tenir les " +
      "autres jours. Retirez-la de votre visite, ou déplacez-y un exposant."
    : "Rien à voir ce jour-là : votre parcours est vide, ou rien n'y tient.");

  j.etapes.forEach(e => {
    if (e.genre === "depart"){
      const s = document.createElement("span");
      s.className = "jL";
      s.textContent = "Départ : " + e.nom;
      rangJournee(fil, ecritHeure(e.t), s, "lien");
    } else if (e.genre === "marche"){
      lienJournee(fil, ecritDistance(e.m) + " · " + ecritMinutes(e.min) + " de marche" +
        (e.trace ? "" : " (non tracé)"));
    } else if (e.genre === "liaison"){
      lienJournee(fil, phraseLiaison(e).s);
    } else if (e.genre === "transfert"){
      lienJournee(fil, "Rejoignez le " + e.vers + " · comptez " + ecritMinutes(e.min) +
        ", ce trajet n'est pas sur le plan");
    } else if (e.genre === "attente"){
      lienJournee(fil, ecritMinutes(e.min) + " sur place avant le début" +
        (e.premier && e.min >= 15
          ? " — en arrivant à " + ecritHeure(j.arrivee + e.min) + ", vous ne perdriez rien"
          : ""));
    } else {
      arretJournee(fil, e);
    }
  });

  /* Ce qui n'entre pas dans la visite se dit, et se dit précisément : un
     rang laissé de côté sans un mot passerait pour un oubli du calcul. Ces
     listes empruntent leurs rangs au parcours — même vignette, même croix :
     ce sont les mêmes choses, vues d'ailleurs. Un exposant y garde son bouton
     de jour : c'est de là qu'on le fait entrer dans une journée. */
  const groupe = (titre, liste, rendu, bouge) => {
    if (!liste.length) return;
    const g = document.createElement("div");
    g.className = "pGroupe jReste";
    g.innerHTML = '<span class="eyebrow"></span>';
    g.querySelector(".eyebrow").textContent = titre;
    liste.forEach(x => {
      const rang = rangParcours(g, rendu(x));
      const b = bouge ? boutonJour(x) : null;
      if (b && rang) rang.insertBefore(b, rang.querySelector(".pOte"));
    });
    hote.appendChild(g);
  };

  /* Un rendez-vous qu'on n'atteint pas ne se raye pas tout seul : le visiteur
     décidera ce qu'il sacrifie, pas nous. */
  j.retards.forEach(r => dit("iAlerte", "« " + r.c.nom + " » : au mieux, vous y " +
    "arriveriez " + ecritMinutes(r.min) + " après le début — le trajet n'y suffit " +
    "pas. Arrivez plus tôt, ou retirez ce qui la précède."));

  /* Ce que le visiteur a placé lui-même et qui n'a pas tenu se dit à part : il
     ne cherche pas ce qui manque dans une liste générale, il cherche celui
     qu'il vient de déplacer. */
  SEJOUR.refuses.forEach(o => dit("iAlerte", "« " + nomDeStand(o) + " » ne tient pas " +
    "le jour où vous l'avez placé. Choisissez-lui un autre jour, ou retirez ce " +
    "qui l'y précède."));

  /* Sans heure de fermeture, cette liste reste vide : un stand refusé entre
     deux conférences finit toujours par tenir après la dernière. Avec, c'est
     la fermeture qui l'a refusé, et c'est elle qu'on nomme — le visiteur
     sait alors quoi changer, plutôt que de recompter ses stands. */
  const libres = SEJOUR.restants.filter(o => !PLACES.has(String(o.id)));
  if (libres.length && j.fermeture !== null) dit("iAlerte",
    (libres.length > 1
      ? libres.length + " exposants ne tiennent pas"
      : "Un exposant ne tient pas") +
    (plusieurs
      ? " dans les journées que vous avez retenues : ajoutez un jour, arrivez " +
        "plus tôt, ou retirez ce qui passe avant."
      : " avant la fermeture du salon, à " + ecritHeure(j.fermeture) + " : " +
        (j.arrivee >= j.fermeture
          ? "vous arrivez après."
          : "arrivez plus tôt, ou retirez ce qui passe avant.")));
  groupe(SEJOUR.restants.length && j.fermeture !== null
           ? (plusieurs ? "Dans aucune de vos journées" : "Après la fermeture")
           : "Restés de côté",
    SEJOUR.restants, o => ({
      genre: "stand", id: o.id, dessus: false,
      titre: nomDeStand(o),
      detail: DATA.plans[o.p].libelle + (o.code ? " · " + o.code : ""),
      ouvre: () => select(o.id, true, "parcours"),
    }), true);

  /* Une conférence d'un jour qu'on ne vient pas n'est pas perdue : il suffit
     d'ajouter ce jour à la visite, et le pied du tiroir sait le faire. Encore
     faut-il que ce jour se propose encore — celui d'hier ne se coche nulle
     part, et y envoyer chercher une case qui n'existe plus ferait douter du
     reste. Ces conférences-là se disent, elles ne se rattrapent pas. */
  const cochable = new Set(joursAVenir().map(x => x.cle));
  const revolue = (c) => { const d = instantConf(c); return !!d && !cochable.has(d.cle); };
  const ailleurs = SEJOUR.horsJour.filter(c => !revolue(c));
  const revolues = SEJOUR.horsJour.filter(revolue);
  const rangConf = (c) => ({
    genre: "conf", id: c.id, couleur: c.couleur, dessus: true,
    titre: c.nom, detail: jourCourt(instantConf(c)) || "date inconnue",
    ouvre: () => ficheConf(c.id, "parcours"),
  });
  if (ailleurs.length) dit("iNote", ailleurs.length > 1
    ? "Ces conférences ont lieu un jour que vous n'avez pas retenu. Reprenez " +
      "vos jours de visite pour les y faire entrer."
    : "Cette conférence a lieu un jour que vous n'avez pas retenu. Reprenez vos " +
      "jours de visite pour l'y faire entrer.");
  groupe("Un autre jour", ailleurs, rangConf);

  if (revolues.length) dit("iNote", revolues.length > 1
    ? "Ces conférences ont eu lieu un jour déjà passé : aucune visite ne peut " +
      "plus les contenir."
    : "Cette conférence a eu lieu un jour déjà passé : aucune visite ne peut " +
      "plus la contenir.");
  groupe("Un jour déjà passé", revolues, rangConf);

  groupe("En même temps qu'une autre", j.chevauchent, c => ({
    genre: "conf", id: c.id, couleur: c.couleur, dessus: true,
    titre: c.nom,
    detail: (instantConf(c) ? instantConf(c).h + "h" + instantConf(c).min : "") +
            (c.salle ? " · " + c.salle : ""),
    ouvre: () => ficheConf(c.id, "parcours"),
  }));

  groupe("Déjà commencées à votre arrivée", j.passees, c => ({
    genre: "conf", id: c.id, couleur: c.couleur, dessus: true,
    titre: c.nom,
    detail: (instantConf(c) ? instantConf(c).h + "h" + instantConf(c).min : "") +
            (c.salle ? " · " + c.salle : ""),
    ouvre: () => ficheConf(c.id, "parcours"),
  }));

  if (SEJOUR.sansLieu.length) dit("iNote", SEJOUR.sansLieu.length > 1
    ? "Certaines conférences retenues ne sont rattachées à aucune zone du plan : " +
      "elles gardent leur heure, mais le trajet ne peut pas y mener."
    : "« " + SEJOUR.sansLieu[0].nom + " » n'est rattachée à aucune zone du plan : elle " +
      "garde son heure, mais le trajet ne peut pas y mener.");

  /* Une demi-heure à patienter se remarque, et sans un mot elle passe pour une
     étourderie du calcul. On dit donc d'où elle vient — il n'y avait plus rien
     à voir, ou l'avancer coûtait plus de marche qu'elle ne fait gagner — et ce
     qui la comblerait. */
  if (j.attente >= 30) dit("iNote", "Il reste " + ecritMinutes(j.attente) +
    " d'attente dans cette journée. " + (j.tardifs
      ? "Avancer ce qui suit la dernière conférence demanderait un détour plus " +
        "long que le temps gagné."
      : "Votre parcours ne contient plus rien à visiter d'ici là : ajoutez des " +
        "exposants pour la combler."));

  dit("iNote", "Comptez " + ecritMinutes(SEJOUR.tv) + " par stand. Les heures sont " +
    "indicatives : elles supposent qu'on ne s'attarde pas, et ne tiennent compte " +
    "ni des files ni des pauses.");
}

/**
 * L'aperçu de la répartition, écrit sous le curseur.
 *
 * Un jour par ligne, et ce qu'il porte en toutes lettres. C'est le seul retour
 * possible à un curseur qui ne déplace rien à l'écran : sans lui, on le fait
 * glisser sans savoir ce qu'on change. Les conférences y figurent avec les
 * exposants bien qu'elles ne bougent pas — c'est justement ce qui explique
 * qu'un jour reste chargé quand on le décharge.
 */
function ecritApercu(hote, r){
  hote.innerHTML = "";
  r.jours.forEach(j => {
    const d = document.createElement("div");
    d.className = "jApercuRang";
    d.innerHTML = '<span class="j"></span><span class="n"></span>';
    d.querySelector(".j").textContent = j.nom;
    /* Le même compte qu'ailleurs, et dans les mêmes mots : « 7 exposants et
       1 conférence ». Un jour vide se dit, il ne se laisse pas en blanc. */
    d.querySelector(".n").textContent =
      contenuParcours(j.stands, j.confs) || "rien ce jour-là";
    hote.appendChild(d);
  });
  /* Ce qui n'entre nulle part appartient au réglage autant qu'aux journées :
     c'est en chargeant trop un seul jour qu'on le fait apparaître. */
  if (r.restants){
    const p = document.createElement("p");
    p.className = "jApercuReste";
    p.textContent = r.restants > 1
      ? r.restants + " exposants n'entrent dans aucune de ces journées."
      : "Un exposant n'entre dans aucune de ces journées.";
    hote.appendChild(p);
  }
}

/* ------------------------------------------------------------
   Les deux vues du tiroir
   ------------------------------------------------------------ */
/** Le tiroir montre la liste ou la visite, jamais les deux : c'est la même
 *  liste, lue avant puis après le calcul. */
export function appliqueVueParcours(){
  const sur = vueJournee && !!JOURNEE;
  const plusieurs = sur && SEJOUR && SEJOUR.jours.length > 1;
  $("pCorps").hidden = sur;
  /* La rangée de commandes reste dans les deux vues : c'est la journée
     organisée qu'on veut donner à qui vient avec soi, et la cacher avec le
     reste retirait le partage au moment même où il sert. Seule change la
     commande de gauche — organiser une liste, ou reprendre la journée faite ;
     « Organiser ma journée » posé au-dessus de la journée qu'on vient
     d'organiser n'inviterait à rien. */
  $("btnJournee").hidden = sur;
  $("jRefaire").hidden = !sur;
  $("pPied").hidden = sur;
  $("jJours").hidden = !plusieurs;
  $("jCorps").hidden = !sur;
  $("jPied").hidden = !sur;
  $("pEyebrow").textContent = sur ? (plusieurs ? "Ma visite" : "Ma journée") : "Mon parcours";
  $("pTitre").textContent = sur ? (JOURNEE.nom || "Journée organisée") : "Parcours de visite";
  /* La reprise ne propose pas la même chose selon qu'il y a une journée ou
     plusieurs : l'heure d'arrivée seule, ou les jours avec elle. */
  $("jRefaire").textContent = plusieurs
    ? "Changer mes jours et mon heure" : "Changer l'heure d'arrivée";
  if (sur){
    $("pResume").textContent = ecritHeure(JOURNEE.arrivee) + " – " + ecritHeure(JOURNEE.fin);
    remplitOnglets();
    remplitJournee();
    traceJournee();
  } else {
    rafraichitParcours();
  }
}

/**
 * La journée reprend le trait du plan.
 *
 * L'itinéraire d'un point à un autre y prétend aussi, et le visiteur passe de
 * l'un à l'autre : chacun se redonne le trait en revenant, plutôt que de
 * laisser à l'écran le tracé de son voisin. L'objet dessiné est retenu tel
 * quel — c'est à lui qu'on reconnaît, ailleurs, que le trait est celui de la
 * visite et non d'un trajet demandé à côté. Un jour a le sien : passer d'un
 * onglet à l'autre change le trait comme il change la liste.
 */
function traceJournee(){
  if (!JOURNEE) return;
  JOURNEE.dessin = JOURNEE.dessin || { etapes: JOURNEE.trace, arrets: JOURNEE.arrets };
  if (trace() === JOURNEE.dessin) return;
  poseTrace(JOURNEE.dessin);
  dessineItineraire();
}

/** Passer à un jour : le tiroir, le trait et le cadrage le suivent. */
function montreLeJour(j){
  if (!j) return;
  JOURNEE = j;
  vueJournee = true;
  appliqueVueParcours();
  /* La journée commence dans le pavillon de son premier arrêt : c'est celui
     qu'il faut montrer, même si l'on regardait ailleurs en la demandant. */
  const premier = j.trace.find(e => e.genre === "marche");
  if (premier && premier.p !== state.plan) changePlan(premier.p);
  traceJournee();
  if (premier) cadreItineraire();
}

/** Le parcours a changé : la visite calculée ne lui correspond plus. On ne la
 *  refait pas dans le dos du visiteur — on le lui dit. */
export function perimeJournee(){
  if (!SEJOUR || SEJOUR.perime) return;
  SEJOUR.perime = true;
  if (vueJournee) remplitJournee();
}

/**
 * Tout oublier de la visite calculée.
 *
 * Le parcours vidé, elle n'a plus d'objet — et son tracé non plus. Un
 * itinéraire demandé à côté, lui, ne doit rien au parcours et reste à l'écran.
 * Les jours que le visiteur avait imposés s'en vont avec : ils désignaient des
 * exposants qu'il vient d'oublier. Les jours qu'il avait refusés aussi — la
 * conférence qui motivait le refus n'est plus au parcours.
 */
export function oublieSejour(){
  if (SEJOUR && SEJOUR.jours.some(j => j.dessin && trace() === j.dessin)){
    poseTrace(null);
    dessineItineraire();
  }
  SEJOUR = null;
  JOURNEE = null;
  vueJournee = false;
  PLACES.clear();
  REFUS.clear();
}

/* ------------------------------------------------------------
   La question posée avant le calcul
   ------------------------------------------------------------ */
function ouvreOrganisation(){
  /* La matrice gardée l'est pour les retouches, pas pour les demandes : un
     plan dont les cloisons ont bougé entre-temps doit se rebalayer, et c'est
     ici qu'on peut se le permettre. Ici, et non au moment d'organiser : entre
     les deux, l'aperçu du curseur l'aura bâtie, et la jeter reviendrait à
     refaire ce qu'on vient de faire sous les yeux du visiteur. */
  oublieMatrice();
  /* Et la charge annoncée, demandée maintenant pour être là quand on validera.
     Elle ne bloque rien : un calcul lancé avant son arrivée se fait sans
     seuil, et le suivant l'aura. Mieux vaut une journée sans contrainte
     qu'une roue qui tourne devant quelqu'un qui attend son programme. */
  litLaCharge();
  const tous = joursSalon();
  const dispo = joursAVenir();
  /* Sans date connue, on organise une journée sans nom : c'était le cas avant
     qu'on sache en organiser plusieurs, et un salon dont l'exploitant n'a pas
     saisi les dates doit continuer de marcher. */
  const proposables = tous.length ? dispo : [{ cle: "", nom: "", court: "" }];

  if (!proposables.length){
    ouvreModale("Organiser ma visite", corps => {
      const p = document.createElement("p");
      p.textContent = "Le salon est terminé : il n'y a plus de journée à " +
        "organiser. Votre parcours, lui, reste sur cet appareil.";
      corps.appendChild(p);
    }, [{ libelle: "Fermer" }]);
    return;
  }

  let arrivee = "09:00", pente = 0;
  try { arrivee = localStorage.getItem(CLE_ARRIVEE) || arrivee; } catch (e) {}
  try {
    const v = parseFloat(localStorage.getItem(CLE_PENTE));
    if (isFinite(v)) pente = Math.max(-1, Math.min(1, v));
  } catch (e) {}
  const departs = departsProposes();
  /* Les jours déjà retenus se reprennent tels quels : on rouvre souvent cette
     fenêtre pour changer l'heure, non les jours. */
  const coches = SEJOUR
    ? new Set(SEJOUR.jours.map(j => j.cle).filter(c => proposables.some(p => p.cle === c)))
    : new Set();
  if (!coches.size) joursDefaut(proposables).forEach(c => coches.add(c));
  /* Un jour où l'on vient de retenir une conférence se coche à son tour. Le
     défaut ne jouait qu'à la première fenêtre : la deuxième s'ouvrait donc sur
     un jour muet, et ses conférences ne ressortaient qu'après le calcul, tout
     en bas du tiroir. Un refus dit à la main tient contre cela — mais pas
     au-delà de la conférence qui l'a motivé, retirée du parcours depuis. */
  const confsJour = confsParJour();
  REFUS.forEach(cle => { if (!confsJour.has(cle)) REFUS.delete(cle); });
  proposables.forEach(j => {
    if (confsJour.has(j.cle) && !REFUS.has(j.cle)) coches.add(j.cle);
  });

  let champHeure = null, champDepart = null, majValide = () => {};
  /* Une porte unique ne se demande pas, elle se prend : la question n'aurait
     qu'une réponse, et la poser ferait croire qu'il y en a d'autres. */
  const departImpose = departs.length === 1 ? departs[0] : null;

  /* Ce que la fenêtre dit à l'instant. L'aperçu et le calcul le lisent au même
     endroit : deux lectures séparées finiraient par diverger, et l'aperçu
     montrerait alors une visite que le bouton ne rendrait pas. */
  const choixCourant = () => {
    // une heure illisible vaut mieux corrigée que refusée : le champ natif
    // ne rend rien sur les navigateurs qui l'ignorent
    const v = /^(\d{1,2}):(\d{2})$/.exec((champHeure && champHeure.value) || "");
    /* Sans liste, le départ est celui qu'on n'a pas demandé ; avec, c'est le
       choix du visiteur — « Peu importe » compris, qui ne vaut aucun. */
    const d = champDepart ? champDepart.value : null;
    return {
      arrivee: v ? Math.min(1439, +v[1] * 60 + +v[2]) : 9 * 60,
      jours: proposables.filter(j => coches.has(j.cle)),
      depart: d === null ? departImpose : d === "" ? null : departs[+d],
      pente: pente,
    };
  };

  ouvreModale(proposables.length > 1 ? "Organiser ma visite" : "Organiser ma journée", corps => {
    const p = document.createElement("p");
    p.textContent = proposables.length > 1
      ? "On place d'abord les conférences que vous avez retenues — elles se " +
        "posent le jour où elles ont lieu — puis on répartit les stands entre vos " +
        "journées. Le curseur, plus bas, dit si elles doivent se valoir ou non."
      : "On place d'abord les conférences que vous avez retenues — elles ne se " +
        "déplacent pas — puis on glisse les stands entre elles, dans l'ordre qui " +
        "fait le moins de chemin.";
    corps.appendChild(p);

    const form = document.createElement("div");
    form.className = "jForm";

    const bloc = (libelle, champ) => {
      const l = document.createElement("label");
      const e = document.createElement("span");
      e.className = "eyebrow";
      e.textContent = libelle;
      l.appendChild(e);
      l.appendChild(champ);
      form.appendChild(l);
      return champ;
    };
    /* Un groupe de cases à cocher ne s'enveloppe pas d'une étiquette : elle
       désignerait la première case, et c'est le groupe entier qu'on nomme. */
    const blocLibre = (libelle, champ) => {
      const d = document.createElement("div");
      d.className = "jBloc";
      const e = document.createElement("span");
      e.className = "eyebrow";
      e.textContent = libelle;
      d.appendChild(e);
      d.appendChild(champ);
      form.appendChild(d);
      return champ;
    };

    let majHeures = () => {}, poseApercu = () => {}, majDehors = () => {};

    /**
     * Les jours de venue.
     *
     * Une case par jour plutôt qu'une liste déroulante : on en coche deux, et
     * il faut voir d'un coup ceux qu'on a pris. Les jours passés n'y sont pas
     * — `joursAVenir` les a déjà écartés — et rien ne le dit, car il n'y a
     * rien à dire : on ne remarque pas l'absence d'hier.
     */
    if (proposables.length > 1){
      const g = document.createElement("div");
      g.className = "jCases";

      /* Ce qu'un jour décoché laisse dehors, dit là où on le décoche.
         Une conférence ne se déplace pas : le calcul la range déjà sous « un
         autre jour », mais on ne l'y lit qu'après coup, au bas du tiroir — trop
         tard pour qui croyait seulement alléger sa visite. Le dire ici ne
         retient pas la main du visiteur : il décoche s'il le veut, en sachant
         ce qu'il décoche. */
      const dehors = document.createElement("p");
      dehors.className = "jHorsJour";
      majDehors = () => {
        const sortis = proposables.filter(j => !coches.has(j.cle) && confsJour.has(j.cle));
        const n = sortis.reduce((a, j) => a + confsJour.get(j.cle).length, 0);
        dehors.hidden = !n;
        if (!n) return;
        /* Le jour se nomme tant qu'il est seul. Deux jours décochés se lisent
           déjà sur leurs cases, à deux lignes d'ici, et les énumérer ferait
           une phrase qu'on ne dit pas — « des samedi et dimanche ». */
        dehors.textContent = sortis.length > 1
          ? "Vos " + n + " conférences de ces journées ne seront pas dans votre visite."
          : n > 1
            ? "Vos " + n + " conférences du " + sortis[0].nom + " ne seront pas dans votre visite."
            : "Votre conférence du " + sortis[0].nom + " ne sera pas dans votre visite.";
      };

      proposables.forEach(j => {
        const l = document.createElement("label");
        l.className = "jCase";
        const c = document.createElement("input");
        c.type = "checkbox";
        c.checked = coches.has(j.cle);
        c.onchange = () => {
          if (c.checked){ coches.add(j.cle); REFUS.delete(j.cle); }
          else { coches.delete(j.cle); if (confsJour.has(j.cle)) REFUS.add(j.cle); }
          majHeures();
          majValide();
          majDehors();
          poseApercu();
        };
        const s = document.createElement("span");
        s.textContent = j.nom;
        l.appendChild(c);
        l.appendChild(s);
        /* Le compte des conférences déjà retenues ce jour-là : il dit pourquoi
           la case est cochée d'avance, avant même qu'on songe à la décocher. */
        const n = (confsJour.get(j.cle) || []).length;
        if (n){
          const m = document.createElement("small");
          m.className = "jCaseConfs";
          m.textContent = plurielParcours(n, "conférence") + " retenue" + (n > 1 ? "s" : "");
          l.appendChild(m);
        }
        g.appendChild(l);
      });
      blocLibre("Vos jours de visite", g);
      g.parentNode.appendChild(dehors);
      majDehors();
    }

    champHeure = document.createElement("input");
    champHeure.type = "time";
    champHeure.value = arrivee;
    /* L'heure change ce que chaque jour peut tenir : arriver à seize heures
       vide les journées autant qu'un curseur poussé à fond. L'aperçu la suit
       donc, comme il suit le reste. */
    champHeure.oninput = () => poseApercu();
    bloc(proposables.length > 1 ? "Heure d'arrivée, chaque jour" : "Heure d'arrivée", champHeure);
    const heures = document.createElement("span");
    heures.className = "jHeures";
    champHeure.parentNode.appendChild(heures);

    /* Les heures du salon se lisent sous l'heure d'arrivée, là où on la
       choisit, et suivent les jours retenus : le dernier ferme souvent plus
       tôt. Une heure gardée d'une visite précédente qui tombe avant la
       première ouverture est ramenée à celle-ci — la garder proposerait une
       arrivée que le calcul corrigerait aussitôt. */
    majHeures = () => {
      const pris = proposables.filter(j => coches.has(j.cle));
      const hs = (pris.length ? pris : proposables).map(j => horairesSalon(j.cle));
      const memes = hs.every(h => h.ouverture === hs[0].ouverture &&
                                  h.fermeture === hs[0].fermeture);
      const h = hs[0];
      if (!memes){
        heures.hidden = false;
        heures.textContent = "Les horaires changent d'un jour à l'autre : chaque " +
          "journée commence à l'ouverture de son jour.";
      } else {
        heures.hidden = h.ouverture === null && h.fermeture === null;
        heures.textContent = h.ouverture !== null && h.fermeture !== null
          ? "Le salon est ouvert de " + ecritHeure(h.ouverture) + " à " + ecritHeure(h.fermeture) + "."
          : h.ouverture !== null ? "Le salon ouvre à " + ecritHeure(h.ouverture) + "."
          : "Le salon ferme à " + ecritHeure(h.fermeture) + ".";
      }
      const tot = hs.reduce((a, x) =>
        x.ouverture !== null && (a === null || x.ouverture < a) ? x.ouverture : a, null);
      const v = lueHeure(champHeure.value);
      if (tot !== null && (v === null || v < tot))
        champHeure.value = ecritHeure(tot).replace("h", ":");
    };
    majHeures();

    /* Un salon de plusieurs jours dont il ne reste que le dernier : le dire
       évite de chercher où sont passés les autres. */
    if (tous.length > 1 && proposables.length === 1){
      const n = document.createElement("p");
      n.className = "jSansPorte";
      n.textContent = "Il ne reste que le " + proposables[0].nom +
        " : c'est cette journée qu'on organise.";
      form.appendChild(n);
    }

    if (departs.length > 1){
      champDepart = document.createElement("select");
      const vide = document.createElement("option");
      vide.value = "";
      vide.textContent = "Peu importe";
      champDepart.appendChild(vide);
      departs.forEach((pt, i) => {
        const o = document.createElement("option");
        o.value = String(i);
        // le pavillon en second, et seulement s'il y en a plusieurs : sur un
        // salon d'un seul hall, il répétait son nom à chaque ligne
        o.textContent = pt.nom + (DATA.plans.length > 1 ? " — " + pt.detail : "");
        if (i === 0) o.selected = true;
        champDepart.appendChild(o);
      });
      champDepart.onchange = () => poseApercu();
      bloc("Par où vous entrez", champDepart);
    } else if (!departs.length){
      /* Une seule entrée repérée ne se dit plus : la nommer n'apprenait rien
         à qui n'avait de toute façon rien à choisir. Reste le cas ci-dessous.

         Aucune porte marquée sur le plan : la question ne se pose pas, et son
         absence se remarquerait plus que sa réponse. On dit d'où l'on partira
         plutôt que de laisser croire à un oubli — et l'exploitant qui lit son
         propre plan y reconnaît ce qu'il lui reste à poser. */
      const n = document.createElement("p");
      n.className = "jSansPorte";
      n.textContent = "Aucune entrée n'est repérée sur ce plan : la journée " +
        "commencera au premier exposant de votre liste.";
      form.appendChild(n);
    }

    /**
     * Le curseur, et ce qu'il donne à voir.
     *
     * « Des journées égales » n'est un bon réglage que pour qui a trois jours
     * semblables devant lui. Le visiteur qui repart par le train de seize
     * heures veut son gros jour en premier ; celui qui n'arrive que le soir du
     * premier jour veut l'inverse. Le curseur dit lequel, et rien de plus : il
     * ne promet pas un nombre de stands, il incline une répartition.
     *
     * Dessous, ce que chaque journée porterait, recalculé à mesure. C'est le
     * seul retour possible — le curseur ne déplace rien à l'écran, et sans ce
     * compte on le ferait glisser sans savoir ce qu'on change. Le calcul est
     * celui de la vraie répartition, arrêté juste avant les trajets et les
     * heures : ce qu'annonce l'aperçu est ce que « Organiser » rendra.
     */
    if (proposables.length > 1){
      const g = document.createElement("div");
      g.className = "jPente";
      const champPente = document.createElement("input");
      champPente.type = "range";
      champPente.min = "-100";
      champPente.max = "100";
      champPente.step = "5";
      champPente.value = String(Math.round(pente * 100));
      champPente.setAttribute("aria-label", "Répartition entre vos journées");
      const bornes = document.createElement("div");
      bornes.className = "jBornes";
      bornes.innerHTML = "<span></span><span></span>";
      bornes.firstChild.textContent = "premiers jours";
      bornes.lastChild.textContent = "derniers jours";
      const dit = document.createElement("p");
      dit.className = "jPenteDit";
      g.appendChild(champPente);
      g.appendChild(bornes);
      g.appendChild(dit);
      blocLibre("Répartition entre vos journées", g);

      const apercu = document.createElement("div");
      apercu.className = "jApercu";
      form.appendChild(apercu);

      /* Le milieu du curseur n'est pas une position parmi d'autres : c'est le
         réglage par défaut, et il se nomme pour qu'on sache qu'on y est. */
      const nommePente = () => {
        dit.textContent = pente < -0.15 ? "Les premiers jours plus chargés"
                        : pente > 0.15 ? "Les derniers jours plus chargés"
                        : "Des journées également chargées";
      };

      let minuteur = null;
      poseApercu = () => {
        const pris = proposables.filter(j => coches.has(j.cle));
        /* Un seul jour retenu n'a rien à répartir : le curseur s'éteint plutôt
           que de promettre un réglage sans effet. */
        const reglable = pris.length > 1;
        g.classList.toggle("eteint", !reglable);
        champPente.disabled = !reglable;
        apercu.hidden = !pris.length;
        if (!pris.length) return;
        if (!apercu.children.length){
          const a = document.createElement("p");
          a.className = "jApercuReste";
          a.textContent = "calcul…";
          apercu.appendChild(a);
        }
        apercu.classList.add("calcul");
        clearTimeout(minuteur);
        minuteur = setTimeout(() => {
          let r = null;
          /* Une répartition qui n'aboutit pas ne se raconte pas ici : le
             bouton, lui, le dira comme il faut. L'aperçu se tait. */
          try { r = apercuRepartition(choixCourant()); } catch (e) { apercu.hidden = true; return; }
          ecritApercu(apercu, r);
          apercu.classList.remove("calcul");
        }, REPOS_APERCU);
      };

      champPente.oninput = () => {
        pente = (+champPente.value || 0) / 100;
        nommePente();
        poseApercu();
      };
      nommePente();
    }

    corps.appendChild(form);
    poseApercu();
  }, [
    { libelle: "Annuler" },
    { libelle: "Organiser", action: () => {
      const choix = choixCourant();
      try { localStorage.setItem(CLE_ARRIVEE, ecritHeure(choix.arrivee).replace("h", ":")); } catch (e) {}
      try { localStorage.setItem(CLE_PENTE, String(choix.pente)); } catch (e) {}
      lanceSejour(choix);
    } },
  ]);

  /* Aucun jour coché n'est pas une visite : le bouton s'éteint plutôt que
     d'organiser un séjour vide, ou d'en choisir un à la place du visiteur. Le
     pied n'existe qu'une fois la fenêtre ouverte, d'où ce branchement après
     coup. */
  const valide = $("mPied").querySelector(".btn:last-child");
  majValide = () => { valide.disabled = !coches.size; };
  majValide();
}

/* ------------------------------------------------------------
   Le calcul
   ------------------------------------------------------------ */
/** Le calcul, et ce qu'on montre s'il n'aboutit pas. Rend faux en cas
 *  d'échec : le parcours, lui, est intact — et c'est la seule chose à dire. */
function essaieSejour(choix, cleAffichee, fige){
  let s = null;
  try {
    s = calculeSejour(choix, fige);
  } catch (e){
    console.warn("Visite :", e);
    SEJOUR = null;
    JOURNEE = null;
    $("pResume").textContent = "—";
    $("jJours").hidden = true;
    $("jCorps").innerHTML = '<p class="iAlerte"></p>';
    $("jCorps").querySelector(".iAlerte").textContent =
      "Le calcul de la visite n'a pas abouti sur cet appareil. " +
      "Votre parcours, lui, est intact.";
    return false;
  }
  SEJOUR = s;
  montreLeJour(s.jours.find(j => j.cle === cleAffichee) || s.jours[0]);
  /* Le plan vient de changer : on l'annonce, une fois le calme revenu. Après
     l'affichage et non avant — ce qui se voit passe d'abord. */
  annoncePlan();
  return true;
}

/**
 * Le calcul passe par un temps mort volontaire, comme celui de l'itinéraire :
 * une matrice, une répartition et une centaine de tronçons tiennent en une
 * fraction de seconde sur un poste, davantage sur un téléphone de salon. On
 * annonce d'abord, on calcule ensuite.
 */
function lanceSejour(choix){
  vueJournee = true;
  SEJOUR = null;
  JOURNEE = null;
  $("pCorps").hidden = $("pPied").hidden = $("btnJournee").hidden = true;
  $("jRefaire").hidden = false;
  $("jJours").hidden = true;
  $("jCorps").hidden = $("jPied").hidden = false;
  $("pEyebrow").textContent = choix.jours.length > 1 ? "Ma visite" : "Ma journée";
  $("pTitre").textContent = choix.jours.length > 1
    ? plurielParcours(choix.jours.length, "journée")
    : (choix.jours[0].nom || "Journée organisée");
  $("pResume").textContent = "calcul…";
  $("jCorps").innerHTML = '<p class="iNote">Recherche du meilleur ordre de visite…</p>';
  /* Organiser une visite se comptait avec les itinéraires, faute d'un genre à
     soi en base. Elle en a un désormais (migration `la_charge_prevue_des_stands`),
     et le chiffre du rapport cesse de mélanger deux gestes qui ne disent pas la
     même chose : calculer un trajet, et mettre une journée en heures.

     Sans cible, comme avant : les rattacher aux stands traversés ferait passer
     pour autant de demandes de visiteurs ce qui n'est qu'un clic sur
     « organiser ». Ce que ces stands deviennent, c'est un plan annoncé — et
     celui-là part par un autre chemin, sous l'identifiant du parcours. */
  mesure("journee");
  setTimeout(() => essaieSejour(choix, ""), 30);
}

/**
 * Refaire la visite sur place — un stand déplacé, un stand retiré.
 *
 * Sans annonce ni temps mort : la matrice est gardée, et le reste tient en
 * quelques dizaines de millisecondes. Afficher « calcul… » le temps d'un
 * clignement ferait douter d'un geste qui a pourtant abouti.
 *
 * `fige` porte la visite telle qu'elle était : une retouche ne rebat pas les
 * cartes, elle déplace ce qu'on lui a dit de déplacer. Reprendre l'ensemble
 * reste possible, et c'est la rangée de commandes qui le propose en toutes
 * lettres.
 */
function refaitSejour(cleAffichee, fige){
  if (!SEJOUR) return;
  essaieSejour(SEJOUR.choix, cleAffichee || (JOURNEE ? JOURNEE.cle : ""), fige);
}

/* ------------------------------------------------------------
   Le branchement
   ------------------------------------------------------------ */
/**
 * Appelé par `_journee.html` à la place que ce code y tenait : il branche le
 * calcul (`sejour.mjs`) et la charge annoncée (`charge-annoncee.mjs`), puis
 * pose les écoutes du tiroir — dans cet ordre, qui était celui de la page.
 *
 * @param {{ datesSalon: () => any[], horairesSalon: (jour: string) => any,
 *   lueHeure: (s: string) => number | null, minutesVisite: () => number,
 *   seuilGere: () => boolean, seuilImpose: () => boolean, seuilConcentration: (o: any) => number,
 *   basculeParcours: Function,
 *   rangParcours: Function, rafraichitParcours: Function, changePlan: Function }} b
 */
export function brancheJournee(b){
  soude = b;
  brancheSejour({ minutesVisite: b.minutesVisite, horairesSalon: b.horairesSalon,
                  seuilConcentration: b.seuilConcentration, seuilImpose: b.seuilImpose,
                  iti: () => ITI });

  /* La charge annoncée — `charge-annoncee.mjs`. Le réglage du salon lui vient
     du code soudé ; le parcours et la visite calculée sont réaffectés, l'un
     dans son module, l'autre ici : elle les lit par une fonction. */
  brancheCharge({ seuilGere: b.seuilGere, seuilConcentration: b.seuilConcentration,
                  identifiantParcours, parcours: () => PARCOURS, sejour: () => SEJOUR });

  /* ------------------------------------------------------------
     Branchements
     ------------------------------------------------------------ */
  $("btnJournee").onclick = ouvreOrganisation;
  $("jRefaire").onclick = ouvreOrganisation;
  $("jRetour").onclick = () => { vueJournee = false; appliqueVueParcours(); };
}
