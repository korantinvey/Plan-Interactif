/* ============================================================
   Enregistrer la configuration
   Les couleurs, la visibilité, l'ordre des calques et les dessins vivaient
   dans le navigateur de celui qui les réglait. Un visiteur ne voyait donc
   rien, et l'exploitant retrouvait un plan nu depuis un autre poste ou depuis
   son téléphone.

   Ils partent maintenant en base d'eux-mêmes, dès que la main s'arrête, et le
   service les rend à tout le monde. Un bouton les y envoyait sur demande —
   explicite, pour laisser essayer sans publier. En pratique l'exploitant
   réglait, fermait l'onglet, et perdait tout : le stockage local ne survit ni
   au changement de poste ni au nettoyage du navigateur, et rien dans l'écran
   ne l'annonçait. Ce qu'il restait à éviter — la rafale d'événements d'un
   sélecteur de couleur tiré à la souris — se règle par un temps de repos, pas
   par un clic.

   Le bouton reste, dans un autre rôle : il dit où en est l'enregistrement, et
   rattrape un envoi qui a échoué.

   Un geste d'exploitant : `plan-admin.mjs` embarque ce module, `plan.mjs`
   jamais — la page publique n'a ni session ni bouton, et n'appelle ce qu'il
   expose que sous garde `typeof`. Ce que le code soudé tient encore — le
   mode administrateur, les réglages et leur enregistrement, le panneau des
   calques — lui est confié par `brancheEnregistrement`, que `_pousse.html`
   appelle à la place que ce code y tenait : les écouteurs de la page s'y
   posent au même rang qu'avant. Les calques dessinés et leurs deux relevés
   s'importent (`calques-dessin.mjs`), l'annonce dans la liste aussi
   (`demarrage.mjs`) ; leur enregistrement, que l'outil de dessin tient et
   qui importe ce module-ci, se confie.
   ============================================================ */
import { $ } from "./dom.mjs";
import { DATA } from "./donnees.mjs";
import { API } from "./salon.mjs";
import { accesBase, base } from "./session.mjs";
import { confirme } from "./fenetre.mjs";
import { ecranAcces } from "./acces-admin.mjs";
import { annonce } from "./demarrage.mjs";
import { DESSINS, ATTENTE, PUBLIES, enAttente, notePubliees, marqueAttente } from "./calques-dessin.mjs";
import { dessineDessins } from "./dessin.mjs";

/* Ce que le code soudé confie au branchement. Ce que les chargements
   remplacent — le mode, les réglages (`CONF`) — se lit à l'instant, par un
   lecteur : l'envoi en relit certains après chaque `await`. Les calques et
   leurs deux relevés (`DESSINS`, `ATTENTE`, `PUBLIES`), importés, se lisent
   eux aussi tels qu'ils sont à l'instant. */
/**
 * @typedef {object} PageEnregistrement
 * @property {() => boolean} estAdmin le mode administrateur, `ADMIN`
 * @property {() => Record<string, any>} conf les réglages du moment, `CONF`
 * @property {(source: Record<string, any>) => Record<string, any>} reglagesDuSalon
 * @property {() => void} enregistreConf
 * @property {() => void} enregistreDessins
 * @property {() => void} appliqueApparence
 * @property {() => void} construitPanneau
 */
/** @type {PageEnregistrement} */
let soude;
/** @param {Record<string, any>} source */
const reglagesDuSalon = (source) => soude.reglagesDuSalon(source);
/** @param {string} txt @param {boolean} [erreur] */

/* Le libellé d'avant l'enregistrement automatique. Il ne sert plus que sans
   session — page publique, page à données figées — où rien ne part tout seul. */
const LIBELLE_POUSSE = "Pousser la configuration";

/* Temps de repos avant l'envoi. Assez long pour qu'une couleur tirée à la
   souris ne s'écrive pas cent fois, assez court pour qu'un onglet fermé juste
   après un réglage ne le perde pas. */
export const REPOS = 1200;

/* Après un échec — réseau coupé, service en panne — on retente de loin en
   loin plutôt que d'insister : le travail est sur le poste, il attend. */
const REPOS_ECHEC = 20000;

/* Le relais garde le plan public dix minutes, et sert encore l'ancienne copie
   le temps de refaire la nouvelle : la base avait la configuration, les
   visiteurs pas encore. On lui demande donc d'oublier, au même endroit que
   celui où il sert le plan — déduit de son adresse plutôt qu'écrit deux fois. */
const OUBLI = API ? API.replace(/\/[^/]*$/, "/oublie") : "";

let minuteur = null;      // envoi programmé, pas encore parti
let publication = false;  // envoi en cours
let rejoue = false;       // une modification est arrivée pendant l'envoi
let souci = "";           // la dernière erreur, dite par l'infobulle

/* Ce que le bouton raconte, quand il y a quelque chose à raconter :
   « envoi » et « echec » durent le temps qu'ils durent, le reste se déduit. */
let etatEnvoi = "";

/* Les réglages d'apparence sont d'un seul tenant, là où les dessins se notent
   pavillon par pavillon (ATTENTE). On compte donc les modifications, et ce que
   la base en a reçu : une retouche arrivée pendant l'envoi garde ainsi son
   tour, sans qu'un drapeau à deux états l'avale. */
let revision = 0;
let revisionEnvoyee = 0;


/* La session laissée par la console, et l'appel à la base qui la renouvelle
   au besoin : `modules/session.mjs` (`accesBase`, `base`). */

/** L'enregistrement automatique demande l'administration, un plan chargé et une
 *  session : la page publique et celle à données figées n'ont ni la première ni
 *  la dernière, et l'identité est vérifiée avant que le plan arrive. */
const autoDispo = () => soude.estAdmin() && !!DATA?.plans?.length && !!accesBase();

/** Reste-t-il quelque chose qui ne soit que sur ce poste ? */
const enRetard = () => revision !== revisionEnvoyee ||
  (DATA?.plans || []).some(p => enAttente(p.id));

/* Ce que dit le bouton dans chaque état, et son infobulle. */
const DITS = {
  manuel:  [LIBELLE_POUSSE, ""],
  attente: ["Enregistrement…", "Des réglages ne sont encore que sur ce poste."],
  envoi:   ["Enregistrement…", "Les réglages partent vers la base."],
  fait:    ["Configuration enregistrée", "Les visiteurs voient ces réglages."],
  echec:   ["Enregistrer — réessayer", ""],
};

/** Où en est l'enregistrement, du point de vue du bouton. */
const etatCourant = () => etatEnvoi || (!autoDispo() ? "manuel"
  : enRetard() ? "attente" : "fait");

/**
 * Ce que le bouton dit de l'enregistrement.
 *
 * Un dessin s'enregistre sur le poste au fil du geste, ce qui donne le
 * sentiment qu'il est à l'abri : rien ne distinguait un travail publié d'un
 * travail qui n'avait jamais quitté ce navigateur. Le bouton porte donc l'état
 * en clair, et non plus une simple marque.
 */
export function majAttente(){
  const e = etatCourant();
  const b = $("pousseConf");
  if (b){
    b.textContent = DITS[e][0];
    b.title = e === "echec" ? "Enregistrement impossible : " + souci : DITS[e][1];
    b.dataset.etat = e;
  }
  ditAlerte(e);
}

/* Ce que le chargement a retrouvé sur ce poste et remis en file, faute d'avoir
   jamais réussi à le publier. On le dit, puis on l'oublie. */
let _rescapes = 0;
export function compteRescapes(n){ _rescapes += n; majAttente(); }

/**
 * L'alerte, hors du panneau.
 *
 * Le panneau des calques reste fermé la plupart du temps : un enregistrement
 * refusé s'annonçait sur un bouton que personne ne regardait. L'exploitant a
 * dessiné une matinée entière, fermé l'onglet en croyant son travail publié,
 * et ne l'a retrouvé nulle part ailleurs — ni sur son téléphone, ni le
 * lendemain. Un échec prend donc toute la largeur de l'écran, et le
 * rattrapage se dit aussi : c'est la seule chose qui distingue un plan
 * enregistré d'un plan qui ne l'est pas.
 */
function ditAlerte(etat){
  const z = $("alerteEnr");
  if (!z) return;
  const txt = $("alerteTxt"), act = $("alerteAct");
  if (etat === "echec"){
    z.hidden = false;
    z.dataset.genre = "echec";
    txt.textContent = "Vos calques ne sont enregistrés que sur ce poste : " + souci;
    act.textContent = "Réessayer";
    act.onclick = () => pousseConfiguration();
    return;
  }
  /* Plus de session du tout : l'enregistrement automatique ne se déclenche même
     pas — « autoDispo » est faux — et le bouton se contente de proposer une
     poussée manuelle qui échouera. C'est le même piège que l'échec, en plus
     silencieux encore, et il ne se dit qu'en présence d'un travail à perdre. */
  if (soude.estAdmin() && etat === "manuel" && enRetard()){
    z.hidden = false;
    z.dataset.genre = "echec";
    txt.textContent = "Vous n'êtes plus connecté : vos calques ne sont enregistrés que sur ce poste.";
    act.textContent = "Se reconnecter";
    act.onclick = () => {
      if (typeof ecranAcces === "function") ecranAcces("Reconnectez-vous pour enregistrer votre travail.");
      else location.reload();
    };
    return;
  }
  if (_rescapes){
    const fini = etat === "fait";
    z.hidden = false;
    z.dataset.genre = "repris";
    txt.textContent = _rescapes > 1
      ? _rescapes + " calques de ce poste n'avaient jamais été enregistrés : ils " +
        (fini ? "sont de nouveau en base." : "repartent vers la base.")
      : "Un calque de ce poste n'avait jamais été enregistré : il " +
        (fini ? "est de nouveau en base." : "repart vers la base.");
    act.textContent = "Fermer";
    act.onclick = () => { _rescapes = 0; majAttente(); };
    return;
  }
  z.hidden = true;
}

/** Passe dans un état, et le fait dire par le bouton. */
function ditEtat(e, detail){
  etatEnvoi = e;
  if (detail) souci = detail;
  majAttente();
}

/** Programme un envoi, en remplaçant celui qui attendait. */
function programmeEnvoi(delai, etiquette){
  if (minuteur) clearTimeout(minuteur);
  minuteur = null;
  if (!autoDispo()){ majAttente(); return; }
  minuteur = setTimeout(envoie, delai);
  ditEtat(etiquette || "");
}

/**
 * Une modification vient d'être posée sur le poste : elle part en base dès que
 * la main s'arrête. Appelée par les deux enregistrements locaux —
 * `enregistreConf` pour l'apparence, `enregistreDessins` pour les calques —
 * c'est le seul point d'entrée de l'enregistrement automatique.
 */
export function programmePublication(){
  revision++;
  programmeEnvoi(REPOS);
}

/** Au chargement : ce qu'une session précédente n'a pas réussi à envoyer part
 *  de lui-même, sans attendre qu'on pense à cliquer. */
export function rattrapeRetard(){
  if (enRetard()) programmeEnvoi(REPOS); else majAttente();
}

/** L'envoi programmé, quand son temps de repos est écoulé. */
function envoie(){
  if (minuteur) clearTimeout(minuteur);
  minuteur = null;
  if (!autoDispo()) return;
  // un envoi est déjà en cours : il reprendra la main en finissant
  if (publication){ rejoue = true; return; }
  if (enRetard()) pousseConfiguration(true);
  else majAttente();
}

/* Un onglet qu'on ferme ne laisse pas le temps de repos s'écouler : ce qui
   attendait part tout de suite. Le navigateur n'en garantit pas l'arrivée —
   d'où la copie sur le poste, et le rattrapage au chargement suivant. */
const presse = () => { if (minuteur) envoie(); };

/**
 * Le branchement, appelé par le code soudé à la place que ce code y tenait
 * (`_pousse.html`), dans une tranche que le visiteur ne reçoit pas. Les
 * écouteurs de la page s'y posent, et non au chargement du module : ils
 * gardent ainsi leur rang parmi ceux du plan.
 *
 * @param {PageEnregistrement} s
 */
export function brancheEnregistrement(s){
  soude = s;
  /* Sur le document, où l'événement naît : écouté sur la fenêtre, il n'y arrivait
     que par remontée, et un onglet masqué trop tôt n'aurait rien envoyé. */
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") presse();
  });
  addEventListener("pagehide", presse);

  /* Et quitter la page sur un enregistrement en échec, c'est laisser le travail
     dans ce seul navigateur — sans qu'il y paraisse, puisque le plan s'affiche
     entier. Le navigateur ne laisse pas choisir le texte de sa question, mais il
     la pose, et c'est tout ce qu'on lui demande. */
  addEventListener("beforeunload", (e) => {
    if (etatCourant() === "echec"){ e.preventDefault(); e.returnValue = ""; }
  });
}


/* Le plan connaît les pavillons par leur identifiant Klipso ; la base par le
   sien. Le lien ne change pas d'un envoi à l'autre : le redemander à chaque
   retouche ferait deux requêtes pour rien. On le reprend tant qu'il nomme tous
   les pavillons ouverts — une synchronisation a pu en ajouter un. */
let _ids = null;
export async function identifiants(acces){
  const attendus = (DATA?.plans || []).map(p => p.id);
  if (_ids && _ids.slug === DATA.slug && attendus.every(id => _ids.par[id])) return _ids.par;
  const evt = await base(acces,
    "evenement?select=id&slug=eq." + encodeURIComponent(DATA.slug));
  if (!evt.length) throw new Error("Événement introuvable.");
  const plans = await base(acces,
    "plan?select=id,id_klipso&evenement_id=eq." + evt[0].id);
  _ids = { slug: DATA.slug, par: Object.fromEntries(plans.map(p => [p.id_klipso, p.id])) };
  return _ids.par;
}

/** Les réglages d'apparence de ce salon : sans les ordres de pile, qui sont
 *  par pavillon, et sans ceux d'un salon voisin, qui n'ont rien à faire dans
 *  son enregistrement — c'est par là qu'ils s'y installaient. */
function reglagesSeuls(){
  return reglagesDuSalon(soude.conf());
}

/* Ce que la base disait des réglages quand la page les a chargés, clé par clé
   et rendu en texte : les valeurs sont des objets que la page retouche en
   place, si bien qu'une copie de surface ne dirait plus rien. C'est la seule
   chose qui distingue « ce poste l'a changé » de « ce poste l'a lu comme ça ».
   Retenu tant qu'un envoi n'a pas tout posé : un pavillon laissé en retard
   redemande donc la même clé au geste de réparation. */
let REGLAGES_CHARGES = {};
export function noteReglagesCharges(enBase){
  REGLAGES_CHARGES = {};
  Object.keys(enBase || {}).forEach(k => {
    REGLAGES_CHARGES[k] = JSON.stringify(enBase[k]);
  });
}

/**
 * Demande au relais d'oublier le plan public de ce salon.
 *
 * Sans réponse attendue : un relais absent — page servie autrement, essai en
 * local — ou muet ne remet pas en cause un enregistrement qui, lui, a abouti.
 * Et ce n'est qu'un cache : au pire les visiteurs attendent le délai d'avant.
 */
export function oublieCache(acces){
  if (!OUBLI || !DATA?.slug) return;
  fetch(OUBLI + "?slug=" + encodeURIComponent(DATA.slug), {
    method: "POST",
    headers: {
      "apikey": acces.cfg.anonKey,
      "Authorization": "Bearer " + acces.ses.access_token,
    },
  }).catch(() => {});
}

/**
 * Envoie la configuration en base.
 *
 * `auto` distingue l'envoi programmé du clic : l'un se tait et n'écrit que ce
 * qui a bougé, l'autre parle dans la liste et réécrit tout — c'est le geste de
 * réparation, celui qui remet en base un pavillon qu'un échec y aurait laissé
 * en retard.
 */
export async function pousseConfiguration(auto){
  if (publication){ rejoue = true; return; }
  const acces = accesBase();
  if (!acces){
    const dit = "Session absente : reconnectez-vous pour enregistrer.";
    if (auto) ditEtat("echec", dit); else annonce(dit, true);
    return;
  }
  /* Ce que l'envoi aura mis en base s'il aboutit. Relevé avant d'écrire : une
     retouche arrivée entre-temps garde son tour, et repartira ensuite. */
  const cible = revision;
  publication = true;
  rejoue = false;
  ditEtat("envoi");

  try {
    const parKlipso = await identifiants(acces);
    const reglages = reglagesSeuls();
    /* Ce que ce poste a changé depuis son chargement, et ce qu'il a retiré.
       Renvoyer tout le bloc effaçait en silence ce qu'un autre administrateur
       venait de régler : A change la couleur d'accent, B décoche un calque cinq
       minutes plus tard, et l'accent de A disparaît pour tout le monde. Les
       deux voisins prenaient déjà cette précaution — `calque_dessin` n'efface
       que ce qu'il a vu en base, `ecritColonnesEvenement` relit la colonne. */
    const changees = {};
    Object.keys(reglages).forEach(k => {
      /* La valeur est figée en texte ici, et c'est elle qu'on écrira : une
         couleur retouchée pendant l'envoi resterait sinon « changée » sans que
         le corps déjà parti la porte, et ne repartirait jamais. Figée, elle
         garde son tour, et `revision` la fera repartir. */
      const texte = JSON.stringify(reglages[k]);
      if (texte !== REGLAGES_CHARGES[k]) changees[k] = texte;
    });
    const retirees = Object.keys(REGLAGES_CHARGES).filter(k => !(k in reglages));
    const posees = Object.fromEntries(
      Object.entries(changees).map(([k, texte]) => [k, JSON.parse(texte)]));

    /* Les blocs que la base tient à l'instant, pour tous les pavillons d'un
       coup : un envoi par couleur changée ne doit pas coûter une lecture par
       pavillon en plus. */
    const idsPlans = DATA.plans.map(p => parKlipso[p.id]).filter(Boolean);
    const tenus = {};
    if (idsPlans.length){
      const lignes = await base(acces, "apparence?select=plan_id,reglages&plan_id=in.(" +
        encodeURIComponent(idsPlans.join(",")) + ")");
      (lignes || []).forEach(l => { tenus[l.plan_id] = l.reglages; });
    }
    let calques = 0;
    /* Un pavillon de la page que la base ne nomme pas garde sa marque d'attente,
       et la relancerait indéfiniment : on le compte pour le dire en finissant. */
    let inconnus = 0;

    for (const p of DATA.plans){
      const planId = parKlipso[p.id];
      if (!planId){ inconnus++; continue; }

      /* Un pavillon dont la base ne tient aucun bloc reçoit le nôtre en
         entier : il n'y a là rien à ménager, et c'est ce qu'un envoi
         interrompu laisse derrière lui. Un pavillon qui en a un le garde, et
         n'en voit changer que les clés que ce poste a changées.
         `reglagesDuSalon` au passage : un enregistrement d'avant le
         cloisonnement porte des clés d'autres salons, que le plein
         remplacement retirait au premier envoi. */
      const bloc = tenus[planId]
        ? reglagesDuSalon({ ...tenus[planId] })
        : { ...reglages };
      retirees.forEach(k => { delete bloc[k]; });
      Object.keys(posees).forEach(k => { bloc[k] = posees[k]; });

      await base(acces, "apparence?on_conflict=plan_id", {
        method: "POST",
        headers: { "Prefer": "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify([{
          plan_id: planId,
          pile: soude.conf()["_pile:" + p.id] || [],
          reglages: bloc,
          modifie_le: new Date().toISOString(),
        }]),
      });

      /* Les dessins d'un pavillon qui n'a pas bougé sont déjà en base : les
         réécrire à chaque couleur changée ferait passer des mégaoctets pour
         rien. Le clic, lui, les réécrit tous — c'est ce qu'on lui demande. */
      if (!auto || enAttente(p.id)){
        /* La marque du pavillon, telle qu'elle est en commençant : on ne
           l'effacera que si le geste suivant ne l'a pas relevée entre-temps. */
        const marque = ATTENTE[p.id];
        const liste = DESSINS[p.id] || [];
        if (liste.length){
          await base(acces, "calque_dessin?on_conflict=plan_id,cle", {
            method: "POST",
            headers: { "Prefer": "resolution=merge-duplicates,return=minimal" },
            body: JSON.stringify(liste.map((c, i) => ({
              plan_id: planId, cle: c.id, nom: c.nom || "Calque",
              couleur: c.couleur || "#2F49D1", rempli: !!c.rempli,
              visible: c.visible !== false, rang: i,
              formes: c.formes || [], modifie_le: new Date().toISOString(),
            }))),
          });
          calques += liste.length;
        }

        /* Ce qui a disparu de la page disparaît de la base — mais nommément.
           « Tout ce que je n'ai pas » était une consigne dangereuse : un poste
           dont la copie locale était vide ou en retard emportait le travail
           publié depuis un autre, sans que rien ne le demande. On ne retire
           donc que les calques que la base nous avait rendus et qui ne sont
           plus là ; un poste qui ne connaît rien n'efface rien. Et après avoir
           écrit, jamais avant : un échec en cours de route laisse l'ancienne
           version en place plutôt qu'un plan vide. */
        const partis = (PUBLIES[p.id] || [])
          .filter(cle => !liste.some(c => c.id === cle))
          .map(cle => '"' + String(cle).replace(/"/g, "") + '"');
        if (partis.length){
          await base(acces,
            "calque_dessin?plan_id=eq." + planId +
            "&cle=in.(" + encodeURIComponent(partis.join(",")) + ")",
            { method: "DELETE", headers: { "Prefer": "return=minimal" } });
        }
        /* Ce que la base contient désormais, de notre fait : c'est à cette
           liste que le chargement suivant comparera la copie du poste pour
           distinguer un calque supprimé ailleurs d'un calque jamais publié. */
        notePubliees(p.id, liste.map(c => c.id));

        /* Ce pavillon est en base : le poste ne le devance plus, et le
           chargement suivant peut reprendre ce que la base en dit. On le note
           pavillon par pavillon — un échec à mi-parcours laisse marqués ceux
           qui n'y sont pas encore passés. Et seulement si rien n'a été tracé
           pendant l'envoi : ce trait-là n'existe nulle part ailleurs. */
        if (ATTENTE[p.id] === marque) marqueAttente(p.id, false);
      }
    }

    revisionEnvoyee = cible;
    publication = false;
    /* Tout est posé : ce que ce poste a changé est maintenant ce que la base
       tient, et n'a plus à être reposé par-dessus un réglage venu d'ailleurs.
       Un pavillon absent laisse au contraire ces clés en attente — le geste de
       réparation doit pouvoir les remettre là où elles manquent. */
    if (!inconnus){
      Object.keys(changees).forEach(k => { REGLAGES_CHARGES[k] = changees[k]; });
      retirees.forEach(k => { delete REGLAGES_CHARGES[k]; });
    }
    /* La base a la configuration ; le relais garde encore l'ancienne version du
       plan public. On le lui dit tout de suite, sans quoi l'administration et le
       plan public ne montreraient pas la même chose — et c'est le plan public
       qui compte. Avant de signaler un pavillon manquant : ce qui est écrit est
       écrit, et doit partir aux visiteurs. */
    oublieCache(acces);
    if (inconnus) throw new Error(inconnus +
      (inconnus > 1 ? " pavillons sont absents" : " pavillon est absent") +
      " de la base : lancez une synchronisation depuis la console.");
    ditEtat("");
    if (!auto) annonce("Configuration enregistrée : " + DATA.plans.length +
      (DATA.plans.length > 1 ? " pavillons" : " pavillon") +
      (calques ? ", " + calques + " calque" + (calques > 1 ? "s" : "") + " de dessin" : "") + ".");
    /* Une retouche arrivée pendant l'envoi part à son tour. On s'en remet au
       compteur, et non aux marques d'attente : celles d'un pavillon qu'on vient
       de sauter tourneraient en rond. */
    if (rejoue || revision !== revisionEnvoyee) programmeEnvoi(REPOS);
  } catch (e) {
    publication = false;
    if (!auto) annonce("Enregistrement impossible : " + e.message, true);
    /* Rien n'est perdu : le poste garde sa copie et la marque d'attente. On
       retente de loin en loin, et le bouton dit pourquoi en attendant. L'état se
       pose avant d'être programmé : une session expirée ne reprogramme rien, et
       le bouton resterait à annoncer un envoi qui ne reviendra pas. */
    ditEtat("echec", e.message);
    programmeEnvoi(REPOS_ECHEC, "echec");
  }
}

/* ============================================================
   La sauvegarde emportée

   L'enregistrement automatique met le travail en base, et le poste en garde une
   copie. Deux exemplaires, et pourtant une seule chaîne : le jour où la base
   n'avait rien reçu et où la page s'est réalignée sur elle, il n'est resté que
   le stockage d'un navigateur — récupérable, mais par la console, et à condition
   d'y penser avant le prochain trait tracé.

   D'où un troisième exemplaire, celui-là hors de tout : un fichier daté, sur
   l'ordinateur de l'exploitant. Il ne sert pas à transporter une configuration
   d'un poste à l'autre — l'enregistrement s'en charge — mais à tenir, à part,
   ce que ni la base ni le navigateur ne garantissent.
   ============================================================ */

/** Le format du fichier. Il se lit dans l'en-tête plutôt que dans son nom :
 *  un fichier renommé reste lisible, un fichier étranger est refusé. */
const FORMAT_SAUVEGARDE = "plan-interactif/sauvegarde";

/** Ce qu'un poste sait du salon ouvert, prêt à s'écrire dans un fichier. */
function sauvegardeCourante(){
  const pavillons = {};
  (DATA?.plans || []).forEach(p => {
    pavillons[p.id] = {
      libelle: p.libelle || "",
      dessins: DESSINS[p.id] || [],
      pile: soude.conf()["_pile:" + p.id] || [],
    };
  });
  return {
    format: FORMAT_SAUVEGARDE,
    version: 1,
    salon: DATA?.slug || "",
    nom: DATA?.evenement || "",
    date: new Date().toISOString(),
    reglages: reglagesSeuls(),
    pavillons: pavillons,
  };
}

/** Le fichier, nommé par le salon et le jour : deux sauvegardes d'un même
 *  salon ne se recouvrent pas, et on lit la date sans ouvrir le fichier. */
function telechargeSauvegarde(){
  const s = sauvegardeCourante();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(s, null, 1)],
    { type: "application/json" }));
  a.download = "plan-" + (s.salon || "salon") + "-" + s.date.slice(0, 10) + ".json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 30000);
  const n = Object.values(s.pavillons).reduce((t, p) => t + p.dessins.length, 0);
  annonce("Sauvegarde téléchargée : " + Object.keys(s.pavillons).length +
    " pavillon" + (Object.keys(s.pavillons).length > 1 ? "s" : "") +
    (n ? ", " + n + " calque" + (n > 1 ? "s" : "") + " de dessin" : "") + ".");
}

/**
 * Remet en place ce qu'un fichier contient.
 *
 * On n'y prend que les pavillons du salon ouvert : une sauvegarde d'un salon
 * voisin nomme des pavillons qui ne désignent rien ici, et les poser
 * n'écrirait qu'un mélange. Le reste suit le chemin ordinaire — marque
 * d'attente, puis envoi automatique — plutôt qu'une écriture directe en base :
 * si l'envoi échoue, le bandeau le dira comme pour n'importe quel autre geste.
 */
function appliqueSauvegarde(s){
  const connus = new Set((DATA?.plans || []).map(p => p.id));
  let pavillons = 0, calques = 0, ignores = 0;
  Object.keys(s.pavillons || {}).forEach(id => {
    if (!connus.has(id)){ ignores++; return; }
    const v = s.pavillons[id] || {};
    if (Array.isArray(v.dessins)){
      DESSINS[id] = v.dessins.map(c => ({ ...c, formes: (c.formes || []).slice() }));
      calques += DESSINS[id].length;
      /* Le fichier l'emporte sur la base : c'est ce qu'on vient de demander.
         La marque le dit au chargement suivant, le temps que l'envoi aboutisse. */
      marqueAttente(id, true);
    }
    if (Array.isArray(v.pile)) soude.conf()["_pile:" + id] = v.pile;
    pavillons++;
  });
  if (s.reglages) Object.assign(soude.conf(), reglagesDuSalon(s.reglages));
  soude.enregistreConf();
  // range les dessins sur le poste, oublie les relevés qui en dépendent, et
  // programme l'envoi — le même geste que pour un trait tracé à la main
  soude.enregistreDessins();
  soude.appliqueApparence();
  dessineDessins();
  soude.construitPanneau();
  annonce("Sauvegarde restaurée : " + pavillons +
    " pavillon" + (pavillons > 1 ? "s" : "") +
    (calques ? ", " + calques + " calque" + (calques > 1 ? "s" : "") + " de dessin" : "") +
    (ignores ? " — " + ignores + " pavillon" + (ignores > 1 ? "s" : "") +
      " du fichier ne concerne" + (ignores > 1 ? "nt" : "") + " pas ce salon." : "."));
}

/** Lit un fichier choisi, et demande confirmation avant d'écraser quoi que ce
 *  soit : une restauration remplace le travail en place, y compris celui d'un
 *  autre poste qui n'est pas encore arrivé ici. */
function litSauvegarde(fichier){
  fichier.text().then(txt => {
    let s = null;
    try { s = JSON.parse(txt); } catch (e) {}
    if (!s || s.format !== FORMAT_SAUVEGARDE){
      annonce("Ce fichier n'est pas une sauvegarde de plan.", true);
      return;
    }
    const compte = Object.values(s.pavillons || {})
      .reduce((t, p) => t + ((p.dessins || []).length), 0);
    const dAilleurs = s.salon && DATA?.slug && s.salon !== DATA.slug;
    confirme("Restaurer cette sauvegarde ?",
      "Elle date du " + String(s.date || "").slice(0, 10) +
      (dAilleurs ? ", vient du salon « " + s.salon + " »" : "") +
      " et porte " + compte + " calque" + (compte > 1 ? "s" : "") + " de dessin. " +
      "Les calques et l'apparence en place seront remplacés" +
      (dAilleurs ? ", pour autant qu'elle nomme des pavillons d'ici." : "."),
      "Restaurer", () => appliqueSauvegarde(s));
  }).catch(() => annonce("Fichier illisible.", true));
}

/** Branche les deux boutons de la barre d'administration. */
export function brancheSauvegarde(){
  const t = $("sauveConf"), r = $("restaureConf"), f = $("fichierConf");
  if (!t || !r || !f) return;
  t.onclick = () => telechargeSauvegarde();
  /* Le champ de fichier est remis à zéro à chaque fois : sans cela, rouvrir la
     même sauvegarde après une hésitation ne déclenchait rien. */
  r.onclick = () => { f.value = ""; f.click(); };
  f.onchange = () => { if (f.files && f.files[0]) litSauvegarde(f.files[0]); };
}
