/* ============================================================
   Itinéraire — le tiroir et la visée

   Le calcul — grille de marche, recherche du chemin, faces, passages d'un
   plan à l'autre — vit dans `itineraire.mjs` ; ce module-ci tient ce que le
   visiteur en voit et en fait : le trajet demandé (`ITI`), le tiroir qui le
   dit et la visée qui le désigne sur le plan ; le trait qui s'y trace vit
   dans `trace-itineraire.mjs`. La
   nappe de la grille, outil de l'exploitant, est à part (`nappe.mjs`).

   Il se branche par `brancheTiroirItineraire`, que `lancement.mjs`
   `lancePlan` appelle à son rang : ses écoutes s'y posent parmi celles du
   plan, sans rien recevoir. La vue, qu'il lit et qu'il recadre, les volets
   qu'il mesure et le passage d'un pavillon à l'autre, il les importe ; la
   fiche et le parcours qu'il referme, par le registre des tiroirs
   exclusifs.

   Le trajet demandé ne se remplace jamais, il se modifie : `ITI` s'importe
   tel quel. Le tracé et la visée, eux, sont réaffectés par d'autres — la
   journée organisée prend le trait (`poseTrace`), la borne et l'affiche du
   code arment la visée (`poseVisee`) — et s'importent donc comme des états
   vivants.

   La borne et le code affiché dans le hall importent ce module, et lui ne les
   importe pas : ce qu'il leur doit — le départ qu'ils imposent — vit dans
   `vous-etes-ici.mjs`, et ce qu'ils font d'une visée qui les regarde, ou d'un
   bandeau qui doit céder la place, ils le lui confient en se chargeant
   (`confieVisee`, `suitLaVisee`).

   Le calcul, lui, n'importe ni les réglages, ni les calques, ni ce que le
   parcours et la journée savent des conférences : il s'éprouve seul dans
   Node. Ce module, qui le mène et peut tout importer, les lui confie en se
   chargeant (`brancheItineraire`, au bas du module).
   ============================================================ */
import { $ } from "./dom.mjs";
import { TRACE, poseTrace, dessineItineraire, rafraichitBouts, cadreItineraire } from "./trace-itineraire.mjs";
import { inscritTiroirExclusif, fermeLesAutresTiroirs } from "./tiroirs-exclusifs.mjs";
import { DATA, parId, state, P } from "./donnees.mjs";
import { mesure } from "./mesure.mjs";
import { pointObjet, pointRepere, candidats, pointSaisi, routeEntre, ecritDistance, ecritDuree, phraseLiaison, brancheItineraire } from "./itineraire.mjs";
import { CONF } from "./configuration.mjs";
import { DESSINS } from "./calques-dessin.mjs";
import { instantConf } from "./parcours.mjs";
import { finInstant } from "./sejour.mjs";
import { pointBorne, ecritDepartBorne } from "./vous-etes-ici.mjs";
import { ETROIT } from "./ecran.mjs";
import { formeParId } from "./forme-choisie.mjs";
import { changePlan } from "./rendu.mjs";

/* Le passage d'un pavillon à l'autre s'importe du rendu (`rendu.mjs`), qui
   n'atteint plus ce tiroir depuis que le tracé vit à part ; la fiche et le
   parcours, qu'il referme en s'ouvrant, se referment par le registre des
   tiroirs exclusifs (`tiroirs-exclusifs.mjs`). La vue s'importe de `vue.mjs`,
   sa porte comprise : les gestes la remplacent sans cesse, et le trajet la
   recadre. */
const racine = document.documentElement;

/* ------------------------------------------------------------
   Le trajet demandé
   ------------------------------------------------------------ */
export const ITI = { a: null, b: null, pmr: false };
export let ROUTE = null;

const CLE_PMR = "plan-itineraire-pmr";

/**
 * Le trajet demandé dans le tiroir.
 *
 * Dans un même pavillon il n'y a qu'un tronçon. D'un plan à l'autre, tout
 * dépend de ce que l'exploitant a relié : les passages déclarés enchaînent
 * les plans sans rupture, leur absence laisse le trajet coupé à la porte.
 */
function calculeRoute(){
  const a = ITI.a, b = ITI.b, pmr = ITI.pmr;
  if (!a || !b) return null;
  if (a.cle === b.cle) return { pmr: pmr, etapes: [], m: 0, memePoint: true };
  const r = routeEntre(a, b, pmr);
  r.pmr = pmr;
  return r;
}

/* Le tracé sur le plan — l'état du trait (`TRACE`), sa porte, son dessin
   animé, ses pastilles et le cadrage — vit dans `trace-itineraire.mjs` : le
   montage d'un pavillon le redessine sans importer ce tiroir. Il s'importe
   d'ici comme avant. */
export { TRACE, poseTrace, dessineItineraire, rafraichitBouts, cadreItineraire };

/* ------------------------------------------------------------
   Le tiroir
   ------------------------------------------------------------ */
const champIti = (r) => r === "a" ? $("iDepart") : $("iArrivee");
let champSugg = null;   // le champ auquel appartiennent les suggestions
let survolSugg = -1;    // la suggestion mise en avant au clavier

function fermeSugg(){
  champSugg = null; survolSugg = -1;
  const z = $("iSugg");
  z.hidden = true; z.innerHTML = "";
  [$("iDepart"), $("iArrivee")].forEach(c => c.setAttribute("aria-expanded", "false"));
}

function montreSugg(r){
  // le départ d'une borne ne se saisit pas : il n'y a rien à proposer
  if (r === "a" && pointBorne()) return;
  champSugg = r;
  survolSugg = -1;
  const z = $("iSugg");
  // une seule liste, déplacée dans le champ qu'on remplit
  const hote = champIti(r).parentNode;
  if (z.parentNode !== hote) hote.appendChild(z);
  const l = candidats(champIti(r).value);
  if (!l.length){
    z.innerHTML = '<p class="iRien"></p>';
    z.querySelector(".iRien").textContent = champIti(r).value.trim()
      ? "Aucun stand, zone ni repère ne porte ce nom."
      : "Tapez le nom ou le numéro d'un stand.";
  } else {
    z.innerHTML = "";
    l.forEach((pt, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "iSug" + (pt.genre === "repere" ? " rep" : "");
      b.setAttribute("role", "option");
      b.dataset.i = String(i);
      b.innerHTML = '<span class="n"></span><span class="s"></span>';
      b.querySelector(".n").textContent = pt.nom;
      b.querySelector(".s").textContent = pt.detail;
      b.onclick = () => choisitPoint(r, pt);
      z.appendChild(b);
    });
  }
  z.hidden = false;
  champIti(r).setAttribute("aria-expanded", "true");
}

function choisitPoint(r, pt){
  ITI[r] = pt;
  champIti(r).value = pt.nom;
  fermeSugg();
  relance();
}

/** Une saisie abandonnée sans choix : on tranche pour elle si c'est possible,
 *  on oublie le point sinon — mieux vaut un champ vide qu'un trajet faux. */
function valideSaisie(r){
  // une borne ne se ravise pas : le champ reprend ce qu'il disait
  if (r === "a" && pointBorne()){ ecritDepartBorne(); return; }
  const v = champIti(r).value.trim();
  if (!v){ if (ITI[r]){ ITI[r] = null; relance(); } return; }
  if (ITI[r] && ITI[r].nom === v) return;
  const pt = pointSaisi(v);
  ITI[r] = pt;
  if (pt) champIti(r).value = pt.nom;
  relance();
}

export function effaceItineraire(){
  /* Effacer, sur une borne, c'est revenir à elle : son départ n'a jamais été
     saisi, et le vider laisserait l'écran incapable de dire d'où l'on part. */
  const borne = pointBorne();
  ITI.a = borne; ITI.b = null;
  ROUTE = null; poseTrace(null);
  /* Deux champs vides dans un tiroir ouvert : c'est l'état d'une ouverture, et
     il appelle la même visée — celle du seul champ qui reste à remplir. */
  visee = borne ? "b" : "a";
  bandeauVisee();
  $("iDepart").value = "";
  $("iArrivee").value = "";
  ecritDepartBorne();
  fermeSugg();
  dessineItineraire();
  montreResultat();
}

/**
 * Le calcul passe par un temps mort volontaire.
 *
 * Pavage du hall, A* et lissage tiennent en quelques dizaines de
 * millisecondes sur un poste, davantage sur un téléphone de salon. Les
 * enchaîner dans la foulée du clic figerait le bouton sans rien dire ; on
 * affiche d'abord, on calcule ensuite.
 */
export let attente = null;
let _dernierTrajet = "";
export function relance(){
  clearTimeout(attente);
  if (!ITI.a || !ITI.b){
    ROUTE = null; poseTrace(null);
    dessineItineraire();
    montreResultat();
    return;
  }
  montreResultat("calcul");
  /* Un calcul, ce sont deux points et une option d'accessibilité. Corriger une
     lettre du champ d'arrivée relance le même trajet : il ne compte qu'une
     fois. */
  const empreinte = ITI.a.cle + ">" + ITI.b.cle + (ITI.pmr ? " pmr" : "");
  if (empreinte !== _dernierTrajet){
    _dernierTrajet = empreinte;
    /* Ce que l'exposant veut savoir, c'est combien de visiteurs ont demandé la
       route jusqu'à lui : le trajet se rattache donc à son arrivée, jamais à
       son départ. Une zone organisateur n'est pas un exposant, un repère non
       plus — dans les deux cas le geste se compte, sans cible. */
    const but = ITI.b.obj;
    mesure("itineraire", "", but && but.kind === "stand" ? but.id : "", "fiche_stand");
  }
  attente = setTimeout(() => {
    attente = null;
    try {
      ROUTE = calculeRoute();
    } catch (e){
      console.warn("Itinéraire :", e);
      ROUTE = { pmr: ITI.pmr, etapes: [], m: 0, panne: true };
    }
    // demander un itinéraire, c'est renoncer à voir la journée sur le plan
    poseTrace(ROUTE);
    /* Le trajet commence dans le pavillon du départ : c'est celui qu'il faut
       montrer, même si l'on regardait ailleurs en le demandant. */
    const premier = ROUTE.etapes.find(e => e.genre === "marche");
    if (premier && premier.p !== state.plan) changePlan(premier.p);
    dessineItineraire();
    montreResultat();
    if (premier) cadreItineraire();
  }, 30);
}

function montreResultat(etat){
  const z = $("iResultat"), badge = $("iResume");
  z.innerHTML = "";
  const dit = (cls, txt) => {
    const p = document.createElement("p");
    p.className = cls;
    p.textContent = txt;
    z.appendChild(p);
    return p;
  };

  if (etat === "calcul"){ badge.textContent = "calcul…"; dit("iNote", "Recherche du chemin…"); return; }
  if (!ITI.a || !ITI.b){
    badge.textContent = "à définir";
    /* « iIntro » : la seule note que l'écran étroit peut taire — les invites
       des deux champs disent la même chose (voir `_styles-modeles-parcours.css`). */
    dit("iNote iIntro", pointBorne()
      ? "Choisissez votre destination : le trajet part de cette borne."
      : "Choisissez un départ et une arrivée. Sans localisation, c'est " +
        "vous qui dites d'où vous partez — l'entrée du hall, ou le stand " +
        "devant lequel vous êtes.");
    return;
  }
  if (!ROUTE) return;

  if (ROUTE.memePoint){ badge.textContent = "—"; dit("iNote", "Vous y êtes déjà."); return; }
  if (ROUTE.panne){ badge.textContent = "—"; dit("iAlerte", "Le calcul n'a pas abouti sur cet appareil."); return; }
  if (ROUTE.sansChemin){
    badge.textContent = "—";
    dit("iAlerte", ROUTE.pmr
      ? "Aucun chemin accessible ne relie ces deux points : les passages disponibles " +
        "sont trop étroits, ou coupés par un escalier. Décochez l'option pour voir le " +
        "trajet ordinaire."
      : "Aucun chemin ne relie ces deux points sur ce plan.");
    return;
  }

  if (ROUTE.aucunTrace){
    badge.textContent = "non tracé";
  } else {
    /* Ce qui sépare deux pavillons que rien ne relie ne figure sur aucun plan
       — ni passerelle, ni allée extérieure : la distance annoncée est alors
       celle des seuls tronçons tracés, et elle le dit. Un trajet qui emprunte
       des passages déclarés, lui, est complet d'un bout à l'autre ; il ne lui
       manque que les mètres de l'escalier, comptés en minutes. */
    badge.textContent = (ROUTE.coupe ? "≥ " : "") + ecritDistance(ROUTE.m) +
      " · " + ecritDuree(ROUTE.m, ROUTE.pmr, ROUTE.minutes);
    const bilan = document.createElement("div");
    bilan.className = "iBilan";
    bilan.innerHTML = '<b></b><span></span>';
    bilan.querySelector("b").textContent = (ROUTE.coupe ? "au moins " : "") + ecritDistance(ROUTE.m);
    bilan.querySelector("span").textContent =
      ecritDuree(ROUTE.m, ROUTE.pmr, ROUTE.minutes) +
      (ROUTE.pmr ? " · itinéraire accessible" : " de marche") +
      (ROUTE.coupe ? " · hors trajet entre pavillons"
                   : ROUTE.liaisons ? " · " + ROUTE.liaisons + " passage" +
                                      (ROUTE.liaisons > 1 ? "s" : "")
                   : "");
    z.appendChild(bilan);
  }

  /* Ce que le calcul a fait des sorties de conférence. Sans un mot, un détour
     de trente mètres passe pour une erreur, et une allée pleine pour une
     mauvaise surprise. */
  (ROUTE.etapes || []).forEach(e => {
    if (!e.foule) return;
    const quand = (s, sujet) => sujet + " conférence " +
      (s.quoi === "sort" ? "se termine à " : "commence à ") + s.h;
    e.foule.contournees.forEach(s => dit("iNote",
      "Le trajet contourne « " + s.nom + " » : " + quand(s, "sa") + ", et l'allée qui la " +
      "borde va se remplir. Environ " + ecritDistance(s.sup) + " de plus."));
    e.foule.longees.forEach(s => dit("iNote",
      "Le trajet longe « " + s.nom + " », où " + quand(s, "une") + " — attendez-vous " +
      "à du monde dans l'allée."));
  });

  /* Un trajet en plusieurs morceaux se lit comme une suite : où l'on marche,
     par où l'on passe. Un tronçon unique n'a rien à énumérer — le trait sur le
     plan le dit mieux qu'une ligne de texte. */
  if (ROUTE.etapes.length > 1){
    const l = document.createElement("div");
    l.className = "iEtapes";
    ROUTE.etapes.forEach(e => {
      const passage = e.genre === "transfert" || e.genre === "liaison";
      /* Le trajet traverse des plans qu'on ne regarde pas : chaque étape de
         marche ouvre le sien. Sans cela, le visiteur lit « 80 m dans le
         pavillon 7.2 » et n'a aucun moyen de voir lesquels. */
      const ailleurs = e.genre === "marche" && e.p !== state.plan;
      const d = document.createElement(ailleurs ? "button" : "div");
      if (ailleurs){
        /** @type {HTMLButtonElement} */ (d).type = "button";
        d.onclick = () => {
          changePlan(e.p);
          dessineItineraire();
          cadreItineraire();
          montreResultat();
        };
      }
      d.className = "iEtape" + (passage ? " transfert" : "") + (ailleurs ? " ailleurs" : "");
      d.innerHTML = '<span class="t"></span><span class="s"></span>';
      const dit2 = (t, s) => {
        d.querySelector(".t").textContent = t;
        d.querySelector(".s").textContent = s;
      };
      if (e.genre === "transfert"){
        dit2("Changement de pavillon",
             "Sortez du " + e.de + ", rejoignez le " + e.vers + ".");
      } else if (e.genre === "liaison"){
        const p = phraseLiaison(e);
        dit2(p.t, p.s);
      } else {
        dit2(DATA.plans[e.p].libelle,
             ecritDistance(e.m) + " dans le pavillon" +
             (e.p === state.plan ? " · tracé à l'écran" : " · voir"));
      }
      l.appendChild(d);
    });
    z.appendChild(l);
    (ROUTE.avertis || []).forEach(t => dit("iAlerte", t));
  }
}

/* ------------------------------------------------------------
   Désigner un point sur le plan
   ------------------------------------------------------------ */
/**
 * Taper un nom suppose qu'on le connaisse. Or on voit souvent sa destination
 * avant de savoir comment elle s'appelle — « le grand stand à l'angle, là ».
 * Le viseur laisse la désigner du doigt : le clic suivant sur le plan remplit
 * le champ au lieu d'ouvrir une fiche. C'est le geste ordinaire, et non le
 * détour : l'ouverture du tiroir l'arme sur le premier champ vide (voir
 * « ouvreItineraire »), la cible de chaque champ ne servant plus qu'à y
 * revenir après coup.
 *
 * Sur un téléphone le tiroir tient la moitié basse de l'écran : l'autre
 * moitié se touche, et la visée armée à l'ouverture y suffit le plus souvent.
 * Reste ce qu'il cache : la cible, elle, efface le tiroir le temps du geste et
 * le ramène dès qu'il aboutit — le bandeau, lui, demeure, sans quoi on ne
 * saurait plus ce qu'on est en train de choisir.
 */
export let visee = null;

/** La porte de la visée : la borne et l'affiche du code l'arment pour elles,
 *  la visite guidée l'éteint. */
export function poseVisee(v){ visee = v; }

/* Une visée qui n'est pas un bout de trajet — poser la borne, désigner
   l'endroit d'un code — appartient au module qui l'arme : il dit ici ce que
   devient le point désigné. Et les bandeaux qui occupent la même place que
   celui de la visée lui sont confiés de même, pour céder le passage. Les deux
   s'inscrivent au chargement de leur module. */
/** @type {Record<string, (pt: any) => any>} */
const VISEES = {};
/** @type {Array<() => void>} */
const SUIVENT_LA_VISEE = [];

/** @param {string} genre @param {(pt: any) => any} f */
export function confieVisee(genre, f){ VISEES[genre] = f; }
/** @param {() => void} f */
export function suitLaVisee(f){ SUIVENT_LA_VISEE.push(f); }

export function bandeauVisee(){
  const b = $("viseur");
  if (b){
    b.hidden = !visee;
    /* La visée n'est plus le geste du seul téléphone : le bandeau s'adresse
       aussi bien au doigt qu'au curseur. */
    if (visee) $("viseurTxt").textContent = visee === "borne"
      ? "Touchez le plan à l'endroit où cette borne est posée."
      : visee === "ici"
      ? "Touchez le plan à l'endroit où ce code sera affiché."
      : "Indiquez " + (visee === "a" ? "votre point de départ" : "votre arrivée") + " sur le plan.";
  }
  racine.classList.toggle("vise-plan", !!visee);
  $("iViseA").setAttribute("aria-pressed", String(visee === "a"));
  $("iViseB").setAttribute("aria-pressed", String(visee === "b"));
  /* Le bandeau d'une borne à poser s'efface le temps du geste : c'est le même
     état, dit deux fois, et deux bandeaux ne se lisent plus. Le rappel du code
     affiché, lui, occupe la même place au bas de l'écran : il cède le passage
     plutôt que de se superposer (`borne.mjs`, `ici.mjs`). */
  SUIVENT_LA_VISEE.forEach(f => f());
}

function armeVisee(r){
  /* Une borne sait d'où elle part : sa cible de départ est retirée du tiroir
     (voir « borne.mjs »), et ce garde-fou vaut pour le clavier. */
  if (r === "a" && pointBorne()) return;
  /* La cible d'un champ déjà armé ne désarme pas sur un téléphone : la visée y
     est armée d'office, et ce bouton n'y a plus qu'un sens — « montre-moi tout
     le plan », car il est le seul geste qui retire le tiroir : la prise le
     baisse sans l'emporter, et son en-tête tient toujours le bas. Abandonner
     se dit dans le bandeau, qui porte « Annuler ». Au large, la cible reste
     l'interrupteur qu'elle était. */
  const efface = ETROIT() && $("itineraire").classList.contains("open");
  visee = (visee === r && !efface) ? null : r;
  fermeSugg();
  if (visee && ETROIT()) fermeItineraire();
  bandeauVisee();
}

/** Fin de la visée, quelle qu'en soit la raison. */
export function finVisee(){
  if (!visee) return;
  /* La cible referme le tiroir sur un téléphone : on ne le rouvre que si c'est
     bien lui qui l'a fermé. Ouvert, le rouvrir réarmait la visée que ces deux
     lignes viennent d'éteindre — et l'abandon n'aboutissait jamais. */
  const rouvre = (visee === "a" || visee === "b") && ETROIT() &&
                 !$("itineraire").classList.contains("open");
  visee = null;
  bandeauVisee();
  if (rouvre) ouvreItineraire(false);
}

/**
 * Un clic sur le plan pendant une visée. Rend « vrai » s'il a servi à choisir,
 * auquel cas la fiche ne doit pas s'ouvrir par-dessus.
 */
export function viseItineraire(id){
  const o = parId.get(id);
  return o ? visePoint(pointObjet(o)) : false;
}

/** Viser un repère : le geste est le même, le point vient d'ailleurs. */
export function visePoi(id){
  if (!visee) return false;
  const cible = formeParId(id);
  return cible && cible.f.t === "repere" ? visePoint(pointRepere(cible.f, P())) : false;
}

function visePoint(pt){
  if (!visee) return false;
  /* Poser une borne n'est pas désigner un bout de trajet : le point part
     ailleurs (voir « borne.mjs »). Désigner l'endroit d'un code non plus
     (voir « affiche-ici.mjs ») — et c'est par ici que passe le clavier, là où le
     doigt est tranché plus tôt, dans la chaîne des appuis sur le plan. */
  if (VISEES[visee]) return VISEES[visee](pt);
  const r = visee;
  ITI[r] = pt;
  champIti(r).value = ITI[r].nom;
  /* Deux points à désigner, deux gestes : tant que l'autre champ est vide, on
     enchaîne plutôt que de faire rouvrir le tiroir pour le refermer aussitôt. */
  const autre = r === "a" ? "b" : "a";
  if (!ITI[autre]){ visee = autre; bandeauVisee(); relance(); return true; }
  finVisee();
  relance();
  return true;
}


/* ------------------------------------------------------------
   Ouverture, fermeture, branchements
   ------------------------------------------------------------ */
/**
 * @param arme  Faux pour rouvrir le tiroir sans rien réarmer — c'est le cas
 *   d'une visée abandonnée : la rouvrir doit rendre la main, non relancer le
 *   geste qu'on vient d'annuler.
 */
function ouvreItineraire(arme = true){
  // fiche, parcours et itinéraire se partagent la même bande
  fermeLesAutresTiroirs("itineraire");
  /* Une ouverture repart de zéro : la visée en cours s'éteint ici, et les
     lignes du bas la réarment sur le premier champ vide. On ne passe pas par
     finVisee(), qui rouvrirait ce tiroir déjà en train de s'ouvrir. */
  visee = null;
  bandeauVisee();
  /* La journée organisée a pu prendre le trait entre-temps : le tiroir le
     reprend en s'ouvrant, sinon son bilan parlerait d'un trajet et le plan en
     montrerait un autre. */
  if (ROUTE && TRACE !== ROUTE){ poseTrace(ROUTE); dessineItineraire(); }
  $("itineraire").classList.add("open");
  $("btnItineraire").setAttribute("aria-pressed", "true");
  montreResultat();
  /* Un itinéraire se désigne plus vite qu'il ne se tape : la visée est donc
     armée sur le premier champ vide dès l'ouverture, départ puis arrivée, sans
     passer par la cible. Le clavier reste à portée — cliquer dans un champ y
     renonce. Le téléphone n'en est plus excepté : le tiroir ne prend que la
     moitié basse de l'écran, et ce qui reste du plan se touche. Un stand qu'il
     cache se désigne comme avant, par la cible, qui l'efface le temps du
     geste. */
  if (arme){
    visee = !ITI.a ? "a" : !ITI.b ? "b" : null;
    bandeauVisee();
  }
}
export function fermeItineraire(){
  const t = $("itineraire");
  if (!t || !t.classList.contains("open")) return;
  t.classList.remove("open");
  $("btnItineraire").setAttribute("aria-pressed", "false");
  fermeSugg();
}

/** Depuis une fiche : « j'y vais ». L'arrivée est connue, le départ reste à
 *  dire — c'est lui qu'on met sous le curseur. */
export const versItineraire = (o) => versItineraireDe(pointObjet(o));

/** Le même geste depuis un repère, qui n'est pas un objet du plan. */
export function versItineraireDe(pt){
  ITI.b = pt;
  $("iArrivee").value = ITI.b.nom;
  /* Le départ d'une borne reste le sien même si l'on demande la route
     jusqu'à elle : « vous y êtes déjà » se dit mieux qu'un champ vidé. */
  if (ITI.a && ITI.a.cle === ITI.b.cle && !pointBorne()){
    ITI.a = null; $("iDepart").value = "";
  }
  ouvreItineraire();
  if (ITI.a) relance();
  /* Le tiroir s'ouvre à peine : le champ est encore hors du cadre le temps de
     la transition, et un focus ordinaire ferait défiler la scène pour l'y
     amener. On demande le curseur, pas le déplacement — et seulement là où
     l'ouverture n'a pas armé la visée, que le curseur annulerait aussitôt. */
  else { montreResultat(); if (!visee) $("iDepart").focus({ preventScroll: true }); }
}

/* ------------------------------------------------------------
   Le branchement
   ------------------------------------------------------------ */
/**
 * Appelé par `lancement.mjs` `lancePlan` à son rang : le choix
 * d'accessibilité retenu se relit, puis les écoutes du tiroir et de la visée
 * se posent à leur place parmi celles du plan — celle de la touche
 * « Échap » comprise, dont l'ordre parmi les autres décide qui la reçoit. Il
 * ne reçoit rien : tout ce que le tiroir emprunte s'importe.
 */
export function brancheTiroirItineraire(){

  try { ITI.pmr = localStorage.getItem(CLE_PMR) === "1"; } catch (e) {}

  $("iViseA").onclick = () => armeVisee("a");
  $("iViseB").onclick = () => armeVisee("b");
  $("viseurStop").onclick = finVisee;

  ["a", "b"].forEach(r => {
    const c = champIti(r);
    c.addEventListener("input", () => montreSugg(r));
    // revenir au clavier, c'est renoncer au doigt
    c.addEventListener("focus", () => { visee = null; bandeauVisee(); montreSugg(r); });
    c.addEventListener("blur", () => { if (champSugg === r) fermeSugg(); valideSaisie(r); });
    c.addEventListener("keydown", e => {
      const z = $("iSugg");
      const opts = z.hidden ? [] : [...z.querySelectorAll(".iSug")];
      if (e.key === "ArrowDown" || e.key === "ArrowUp"){
        if (!opts.length) return;
        e.preventDefault();
        survolSugg = (survolSugg + (e.key === "ArrowDown" ? 1 : opts.length - 1) + opts.length) % opts.length;
        opts.forEach((o, i) => o.classList.toggle("vis", i === survolSugg));
        opts[survolSugg].scrollIntoView({ block: "nearest" });
      } else if (e.key === "Enter"){
        e.preventDefault();
        if (opts[survolSugg]) opts[survolSugg].click();
        else { fermeSugg(); valideSaisie(r); }
      } else if (e.key === "Escape" && !z.hidden){
        e.stopPropagation();
        fermeSugg();
      }
    });
  });
  /* Le clic sur une suggestion arrive après le « blur » du champ : sans cela, la
     liste se referme sous le doigt et le clic tombe dans le vide. */
  $("iSugg").addEventListener("pointerdown", e => e.preventDefault());

  $("iEchange").onclick = () => {
    // une borne ne se déplace pas à l'arrivée d'un trajet
    if (pointBorne()) return;
    const a = ITI.a;
    ITI.a = ITI.b; ITI.b = a;
    $("iDepart").value = ITI.a ? ITI.a.nom : "";
    $("iArrivee").value = ITI.b ? ITI.b.nom : "";
    relance();
  };

  $("iPmr").checked = ITI.pmr;
  $("iPmr").onchange = e => {
    ITI.pmr = e.target.checked;
    // celui qui en a besoin en a besoin à chaque visite
    try { localStorage.setItem(CLE_PMR, ITI.pmr ? "1" : "0"); } catch (err) {}
    relance();
  };

  /* Tout le calcul repose sur le canevas : c'est lui qui remplit les contours et
     les épaissit. Sur un navigateur qui ignore Path2D, mieux vaut retirer la
     fonction que d'ouvrir un tiroir qui ne répondrait jamais. */
  if (typeof Path2D === "undefined"){
    $("btnItineraire").hidden = true;
    racine.classList.add("sans-itineraire");
  }

  $("btnItineraire").onclick = () =>
    $("itineraire").classList.contains("open") ? fermeItineraire() : ouvreItineraire();
  $("closeItineraire").onclick = fermeItineraire;
  $("videItineraire").onclick = effaceItineraire;

  addEventListener("keydown", e => {
    if (e.key !== "Escape" || $("modale").classList.contains("open")) return;
    if (visee){ e.stopPropagation(); finVisee(); return; }
    if ($("iSugg").hidden) fermeItineraire();
  });
}


/* Le calcul s'éprouve seul dans Node (`outils/essais/itineraire.js`,
   `sejour.js`), où l'essai lui prête réglages et calques : il ne les importe
   pas. Ce module, qui le mène et que la page publique embarque, les lui
   confie en se chargeant — avant tout trajet demandé. Les réglages et les
   calques se remplacent en changeant de salon : ils se confient par des
   lecteurs, qui rendent ceux du moment. */
brancheItineraire({ conf: () => CONF, dessins: () => DESSINS, instantConf, finInstant });

/* L'itinéraire est l'un des trois tiroirs qui se partagent la bande : ouvrir
   la fiche ou le parcours le referme, s'il est ouvert. */
inscritTiroirExclusif("itineraire", fermeItineraire);
