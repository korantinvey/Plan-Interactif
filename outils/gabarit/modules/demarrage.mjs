/* ============================================================
   12. Démarrage — l'appel du plan, sa version, la panne réseau

   Les données figées si elles sont dans la page (la démonstration), sinon
   l'appel à l'API : l'entête et le plan demandés ensemble, la version
   retenue d'une ouverture à l'autre, la session de l'exploitant présentée en
   administration. Puis l'index, le plan dessiné, et tout ce qui attendait
   qu'il le soit — la borne, le code du hall, un parcours ou une conférence
   reçus par lien, la visite guidée, l'invitation à installer.

   Il se branche par `brancheDemarrage`, que `_admin2.html` appelle à la
   place que ce code tenait, au bout du script : c'est là que la page
   démarre, une fois tout le reste déclaré. La fiche, le montage du plan et
   l'ordre des calques, il les importe (`fiche.mjs`, `rendu.mjs`,
   `ordre-trace.mjs`). Ce qui n'existe qu'en administration
   (`modules/enregistrement.mjs`, `modules/acces-admin.mjs`) lui est confié,
   sous la garde `typeof` qu'il avait.
   ============================================================ */
import { $ } from "./dom.mjs";
import { DATA, TOUS, CONFS, state } from "./donnees.mjs";
import { API, SLUG } from "./salon.mjs";
import { indexe } from "./index-salon.mjs";
import { accueilleSponsor, suitSponsor, fermeSponsor } from "./sponsor.mjs";
import { view, fit } from "./vue.mjs";
import { liste, prechargeLesVignettes } from "./recherche.mjs";
import { demarreBorne } from "./borne.mjs";
import { demarreIci } from "./ici.mjs";
import { accueilleParcoursPartage } from "./parcours-recu.mjs";
import { proposeTutoriel } from "./tutoriel.mjs";
import { accueilleInvitation } from "./installation.mjs";
import { appliqueApparence } from "./apparence.mjs";
import { select, ficheConf } from "./fiche.mjs";
import { montePlan, monteHabillage, confieAuRendu } from "./rendu.mjs";
import { ordonneDom } from "./ordre-trace.mjs";

/* Ce que l'administration seule a — l'état du bouton d'enregistrement et le
   rattrapage d'un envoi en retard (`enregistrement.mjs`), la fenêtre d'accès
   (`acces-admin.mjs`) — et que ces modules confient au démarrage en se
   chargeant. La page publique ne les embarque pas : rien n'est appelé, et
   une session refusée n'ouvre pas de fenêtre qu'elle n'a pas. */
/**
 * @typedef {object} PageDemarrage
 * @property {() => void} majAttente
 * @property {() => void} rattrapeRetard
 * @property {((message: string) => void) | null} ecranAcces
 */
/** @type {PageDemarrage} */
const prete = { majAttente: () => {}, rattrapeRetard: () => {}, ecranAcces: null };

/** La porte de ce que l'administration confie au démarrage.
 *  @param {Partial<PageDemarrage>} o */
export function confieAuDemarrage(o){ Object.assign(prete, o); }
const majAttente = () => prete.majAttente();
const rattrapeRetard = () => prete.rattrapeRetard();

/* ------------------------------------------------------------------
   Démarrage : données figées si elles sont dans la page, sinon appel
   à l'API. Une panne du réseau doit se voir, pas laisser un écran vide.
   ------------------------------------------------------------------ */
/**
 * Le premier cadrage, refait une fois le tiroir de la liste arrivé.
 *
 * Sur un téléphone, le cadrage retire du plan ce que le tiroir en cache, et le
 * mesure à sa position du moment : au chargement, il est encore en train de
 * glisser, puis la liste remplie lui donne sa hauteur et il glisse encore. Le
 * premier cadrage variait donc de quelques pixels d'un chargement à l'autre,
 * selon l'image où il tombait, et ne valait pour aucun. On le refait quand le
 * tiroir s'est posé — sauf si la vue a bougé entre-temps : un geste, ou une
 * fiche ouverte par un lien reçu, ont alors le dernier mot.
 */
function recadreListePosee(){
  const avant = JSON.stringify(view);
  let attendu = false;
  const attend = () => {
    if (JSON.stringify(view) !== avant) return;
    const tiroir = $("side");
    const glisse = tiroir ? tiroir.getAnimations()
      .filter(a => !(a instanceof CSSAnimation) && a.playState === "running") : [];
    if (glisse.length){
      attendu = true;
      Promise.all(glisse.map(a => a.finished.catch(() => {}))).then(attend);
    } else if (attendu) fit();
  };
  attend();
}

function demarre(/** @type {any} */ d){
  indexe(d);
  /* Le générique du sponsor avant le plan, et non après : ce qu'il couvre,
     c'est justement le temps que le plan met à se dessiner. Il sait déjà être
     là depuis l'ouverture de la page, posé d'après ce que l'appareil garde du
     salon ; cet appel-là lui apprend ce que les données en disent vraiment
     (`_sponsor.html`). */
  accueilleSponsor();
  montePlan();
  fit();
  liste();
  recadreListePosee();
  /* Le plan est dessiné : le générique peut finir de compter ses secondes,
     puis s'estomper. Sans ce rappel il attendrait son butoir. */
  suitSponsor();
  /* Le plan chargé, le bouton peut dire où en est l'enregistrement — en
     administration seulement : le visiteur n'a ni bouton ni envoi
     (`modules/enregistrement.mjs`). */
  majAttente();
  /* Et ce qu'une session précédente n'a pas réussi à enregistrer — onglet fermé
     trop vite, réseau coupé — repart de lui-même : c'est la seule occasion de
     le rattraper, personne ne viendra cliquer pour lui. */
  rattrapeRetard();
  // le plan est manipulable : le fond peut arriver derrière
  chargeFond(state.plan);
  /* La borne, s'il s'agit d'une borne : elle sait d'où l'on part, et doit le
     savoir avant qu'un lien reçu n'ouvre une fiche et son « J'y vais ». */
  demarreBorne();
  /* Puis le code affiché dans le hall, si l'adresse en porte un : même besoin,
     et le même empressement — « J'y vais » depuis une fiche ouverte par un lien
     reçu doit déjà savoir d'où l'on part (voir `_ici.html`). */
  demarreIci();
  /* Un parcours reçu par lien se lit avant tout le reste : il est la raison
     pour laquelle cette page vient d'être ouverte, et il retire son fragment
     de l'adresse — sans quoi la recherche d'emplacement qui suit chercherait
     un stand dont le code serait tout le parcours. */
  accueilleParcoursPartage();
  const v = decodeURIComponent((location.hash || "").slice(1)).toLowerCase();
  if (v && v !== "admin"){
    const cible = TOUS.find(o => String(o.code || "").toLowerCase() === v);
    if (cible) setTimeout(() => select(cible.id, true, "lien"), 80);
  }
  /* Un rappel touché sur l'écran de veille ouvre la page sur sa conférence :
     c'est la seule raison pour laquelle elle vient de s'ouvrir, et la fiche est
     ce que le visiteur venait y lire. */
  const rc = new URLSearchParams(location.search).get("conf");
  if (rc && CONFS.has(String(rc))) setTimeout(() => ficheConf(rc, "lien"), 80);
  /* La visite guidée passe après tout cela, et attend son tour : un lien vers
     un stand ou un parcours partagé disent pourquoi on arrive, et elle ne se
     propose que si rien d'autre n'a pris la place entre-temps. */
  proposeTutoriel();
  /* L'invitation à installer vient ensuite. La visite guidée renonce pour toute
     la visite si l'écran est pris quand elle se propose, l'invitation sait
     attendre : c'est donc elle qui cède son tour. */
  accueilleInvitation();
  /* Les vignettes des logos en dernier, et à tête reposée : le plan est
     affiché, le fond en route, et ce chargement-là n'est demandé par personne.
     Il rend instantané le logo de toute fiche ouverte ensuite. */
  if (window.requestIdleCallback) requestIdleCallback(prechargeLesVignettes, { timeout: 4000 });
  else setTimeout(prechargeLesVignettes, 1500);
}

export function annonce(/** @type {string} */ txt, /** @type {boolean=} */ erreur){
  const l = $("list");
  l.innerHTML = '<div class="empty"></div>';
  l.querySelector(".empty").textContent = txt;
  if (erreur) l.querySelector(".empty").style.color = "var(--rouge, #C2372B)";
  /* La ligne du compte se tait hors recherche ; l'état du chargement y passe
     quand même, c'est là qu'on le lit. */
  $("count").hidden = false;
  $("countTxt").textContent = erreur ? "Indisponible" : "Chargement…";
  if (erreur){
    // plus rien n'arrivera : le titre neutre est définitif, il cesse d'attendre
    $("titre").classList.remove("attente");
    /* Et le générique du sponsor s'efface : il couvre le plan, donc la place où
       l'on cherchera pourquoi il n'y en a pas. Le message passe avant le logo. */
    fermeSponsor();
  }
}

/**
 * En-têtes de l'appel. En administration on présente sa session : c'est elle
 * qui donne accès aux événements encore en brouillon. Ils sont lus à chaque
 * appel, pas au démarrage : la session n'existe qu'une fois l'identité vérifiée.
 */
function entetesApi(){
  /** @type {Record<string, string>} */
  const e = {};
  if (document.documentElement.dataset.role !== "admin") return e;
  try {
    const cfg = JSON.parse(localStorage.getItem("console-config") || "null")
                || window.PLAN_CONFIG || null;
    const ses = JSON.parse(localStorage.getItem("console-session") || "null");
    if (cfg?.anonKey && ses?.access_token){
      e["apikey"] = cfg.anonKey;
      e["Authorization"] = "Bearer " + ses.access_token;
    }
  } catch (err) {}
  return e;
}

/**
 * Le fond d'un pavillon : cinquante fois le poids des stands, et purement
 * décoratif. On le charge après coup, une seule fois par pavillon, et on
 * l'injecte s'il concerne encore celui qu'on regarde. Son adresse porte une
 * empreinte de ce qu'il contient : le navigateur le garde indéfiniment, et ne
 * le redemande que lorsque le dessin servi n'est plus le même.
 */
const _fonds = new Map();
export function chargeFond(/** @type {number} */ i){
  const p = DATA?.plans?.[i];
  if (!p || !API) return Promise.resolve();
  if (p.fond.length === 0 || p.fond.every(c => c.svg !== undefined)) return Promise.resolve();
  if (_fonds.has(p.id)) return _fonds.get(p.id);

  /* La version vient du service, qui la calcule sur ce qu'il servira vraiment :
     l'empreinte des dessins, sa façon de les découper, et — pour un visiteur,
     seul à recevoir un fond découpé — ce que l'apparence en montre. Tant
     qu'elle ne bouge pas, il n'y a rien à retélécharger ; dès qu'elle bouge,
     le navigateur ne peut pas resservir l'ancien. Un salon servi par une
     version antérieure du service n'en porte pas : on retombe alors sur
     l'horodatage de synchronisation, qui était la règle jusqu'ici. */
  const q = API + "?slug=" + encodeURIComponent(SLUG) +
            "&fond=" + encodeURIComponent(p.id) +
            "&v=" + encodeURIComponent(p.versionFond || DATA.genereLe || "0");
  const promesse = fetch(q, { headers: entetesApi() })
    .then(r => r.ok ? r.json() : Promise.reject(new Error("HTTP " + r.status)))
    .then(d => {
      const par = new Map((d.calques || []).map(c => [c.cle, c.svg]));
      p.fond.forEach(c => { c.svg = par.get(c.cle) || ""; });
      // le pavillon a pu changer pendant le chargement
      if (state.plan === i){ monteHabillage(); ordonneDom(); appliqueApparence(); }
    })
    .catch(e => {
      _fonds.delete(p.id);          // une panne réseau ne doit pas être définitive
      console.warn("Fond de plan indisponible :", e.message);
    });
  _fonds.set(p.id, promesse);
  return promesse;
}

/**
 * Ce qu'on dit d'un chargement qui n'aboutit pas.
 *
 * Depuis que le service de second plan garde ce qui a déjà servi (`_sw.js`),
 * une coupure de réseau ne mène plus ici : le salon ouvert une fois s'affiche
 * sans rien redemander. Ne restent donc que ceux qu'on n'a jamais ouverts sur
 * cet appareil — et c'est cela qu'il faut dire, plutôt que le « Failed to
 * fetch » du navigateur, qui n'est ni en français ni une explication.
 *
 * Seule une demande qui n'aboutit pas vaut ce mot, et c'est `TypeError` qui la
 * désigne : un appel refusé ou un salon vide répondent, eux, et ont déjà leur
 * message. `navigator.onLine` ne sert pas à trancher — il ne dit que l'état de
 * l'interface, et vaut « en ligne » derrière un portail captif ou un serveur
 * muet, c'est-à-dire précisément là où l'on se croyait connecté.
 */
function panneDuChargement(e){
  return e.name === "TypeError"
    ? "Plan indisponible : le réseau est injoignable, et ce salon n'a pas " +
      "encore été ouvert sur cet appareil."
    : "Plan indisponible : " + e.message;
}

/* La version du plan qu'on avait la dernière fois, par salon : c'est elle qui
   nomme l'adresse qu'on redemande, et le navigateur la sert alors de son
   cache. Un stockage qui refuse ne casse rien — on repart de l'entête. */
const CLE_VERSION = () => "plan-version:" + SLUG;
const versionRetenue = () => {
  try { return localStorage.getItem(CLE_VERSION()) || ""; } catch (e) { return ""; }
};
const retientVersion = (v) => {
  try { if (v) localStorage.setItem(CLE_VERSION(), v); } catch (e) {}
};

/**
 * Le plan, à la version qui se sert aujourd'hui.
 *
 * Le plan pèse un demi-mégaoctet et ne change qu'une fois par jour. Le
 * redemander à chaque ouverture de page était payer cinq cent mille octets pour
 * apprendre que rien n'avait bougé ; le garder longtemps pour l'éviter, c'était
 * ne plus pouvoir rien corriger avant l'expiration. L'entête tranche : il dit
 * quelle version se sert, en cinquante octets, et le plan part sous une adresse
 * qui la porte, déclarée immuable. Ce qu'un appareil a déjà, il le garde un an ;
 * ce qui change lui parvient dans la demi-minute.
 *
 * Les deux demandes partent ensemble depuis l'en-tête de la page, le plan sous
 * la version d'hier : le pari se gagne presque toujours, et le plan est là
 * quand l'entête répond. Perdu, on le redemande une fois, sous la bonne.
 *
 * Un entête muet ne bloque rien : ce qu'on avait pris d'avance sert tel quel —
 * mieux vaut le plan d'hier que pas de plan —, et à défaut on retombe sur
 * l'adresse sans version, celle d'avant, qui reste servie. C'est aussi ce qui
 * se passe hors ligne, où le service rend ce qu'il garde.
 */
function demandePlan(){
  const q = (sup) => API + "?slug=" + encodeURIComponent(SLUG) + sup;
  const attendu = versionRetenue();
  const avance = window.__plan ||
    (attendu ? fetch(q("&v=" + encodeURIComponent(attendu))) : null);
  const dit = window.__entete ||
    fetch(q("&entete=1")).then(r => r.ok ? r.json() : null).catch(() => null);
  window.__plan = window.__entete = null;

  return dit.then(async (e) => {
    const v = e && e.v;
    if (avance){
      const r = await avance.catch(() => null);
      if (r && r.ok && (!v || r.headers.get("X-Version") === v)){
        retientVersion(r.headers.get("X-Version") || attendu);
        return r;
      }
    }
    const r = await fetch(v ? q("&v=" + encodeURIComponent(v)) : q(""));
    if (r.ok) retientVersion(r.headers.get("X-Version"));
    return r;
  });
}

export function charge(){
  annonce("Chargement du plan…");
  const entetes = entetesApi();
  /* En administration, la session passe dans la demande et le brouillon qu'elle
     rend ne doit rester nulle part : ni version, ni cache, et donc pas d'entête
     — l'exploitant regarde l'état réel, jamais une copie.
     Pour le visiteur, les demandes sont déjà parties depuis l'en-tête de la
     page : on les récupère plutôt que d'en lancer d'autres. */
  const depart = entetes.Authorization
    ? fetch(API + "?slug=" + encodeURIComponent(SLUG),
            { headers: entetes, cache: "no-store" })
    : demandePlan();
  window.__plan = window.__entete = null;
  return depart
    .then(r => {
      // session périmée : on repasse par l'écran de connexion plutôt que
      // d'afficher une erreur dans laquelle l'exploitant ne peut rien faire
      if (r.status === 401 && prete.ecranAcces){
        try { localStorage.removeItem("console-session"); } catch (e) {}
        prete.ecranAcces("Session expirée, reconnectez-vous.");
        return Promise.reject(new Error("Session expirée."));
      }
      return r.ok ? r.json()
                  : r.json().then(j => Promise.reject(new Error(j.erreur || ("HTTP " + r.status))));
    })
    .then(d => {
      if (!d.plans?.length) throw new Error("Aucun pavillon : lancez une synchronisation depuis la console.");
      demarre(d);
    })
    .catch(e => annonce(panneDuChargement(e), true));
}

/**
 * Le branchement, appelé par `_admin2.html` au bout du script, à la place que
 * ce code tenait : la page démarre ici, et l'écoute du redimensionnement s'y
 * pose au même rang qu'avant parmi celles du plan — après celles de la vue.
 */
export function brancheDemarrage(){
  const fige = document.getElementById("data").textContent.trim();
  if (fige && fige.indexOf("__DATA__") < 0) demarre(JSON.parse(fige));
  else if (!API) annonce("Aucune source de données configurée.", true);
  // en administration, on attend la session : sans elle les brouillons sont invisibles
  else if (document.documentElement.dataset.role === "admin") annonce("Vérification de l'identité…");
  else charge();

  addEventListener("resize", () => { if (DATA && view) fit(); });
}

/* Le fond d'un pavillon se charge après coup, au passage d'un pavillon à
   l'autre : le rendu, que ce module importe, le reçoit d'ici en se chargeant. */
confieAuRendu({ chargeFond });
