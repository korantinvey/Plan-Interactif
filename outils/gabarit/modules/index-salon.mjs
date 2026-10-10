/* ============================================================
   1. L'index du salon — la recherche porte sur tous les pavillons

   Un salon arrive de l'API, ou de la page pour la démonstration : `indexe`
   pose ses données (`donnees.mjs`), relève ce qu'on y cherchera, ouvre ses
   réglages et ses calques, et nomme l'onglet. Le programme des conférences
   s'indexe à part, parce qu'il se refait sans recharger quand l'exploitant
   ouvre ou ferme l'option, ou rattache une salle à une zone.

   Les calques dessinés, leur file d'attente et ce que la base en a confirmé
   s'importent (`calques-dessin.mjs`), comme l'oubli des repères
   (`points-interet.mjs`). Ce qui n'existe qu'en administration
   (`modules/enregistrement.mjs`) lui est confié par ce module en se
   chargeant, par la porte `confieALIndex` ; la page publique garde les
   défauts sans effet.
   ============================================================ */
import { $ } from "./dom.mjs";
import { DATA, parId, CONFS, EXPOSANTS, HEBERGES, CONFERENCES, poseDonnees } from "./donnees.mjs";
import { imageSure } from "./sur.mjs";
import { CONF, ouvreConf, reglagesDuSalon, programmeOffert } from "./configuration.mjs";
import { ADMIN } from "./mode-admin.mjs";
import { indexeSecteurs } from "./secteurs.mjs";
import { clesCriteres, valeursCritere, texteCriteres, texteAnglaisPerso, indexeCriteres, liste }
  from "./recherche.mjs";
import { appliqueAjouts, appliqueGeometries } from "./emplacements.mjs";
import { posePoliceLibelles } from "./polices-plan.mjs";
import { modeleRetenu } from "./modeles.mjs";
import { oublieGrilles, oublieLiaisons } from "./itineraire.mjs";
import { nommeApplication } from "./installation.mjs";
import { chargeParcours } from "./parcours.mjs";
import { rafraichitParcours } from "./tiroir-parcours.mjs";
import { confieApresOption } from "./options.mjs";
import { nomsAnglaisDesZones } from "./noms-zones.mjs";
import { DESSINS, ouvreDessins, enAttente, dejaPubliee, marqueAttente, notePubliees, rangeDessins }
  from "./calques-dessin.mjs";
import { oublieReperes } from "./points-interet.mjs";

/* Ce que l'administration seule a (`enregistrement.mjs`), qui le confie à
   l'index en se chargeant : la page publique ne l'embarque pas, et rien
   n'est appelé. */
/**
 * @typedef {object} PageIndex
 * @property {(n: number) => void} compteRescapes
 * @property {(enBase: any) => void} noteReglagesCharges
 */
/** @type {PageIndex} */
const prete = { compteRescapes: () => {}, noteReglagesCharges: () => {} };

/** La porte de l'enregistrement, ouvert au chargement de son module.
 *  @param {Partial<PageIndex>} o */
export function confieALIndex(o){ Object.assign(prete, o); }
const compteRescapes = (/** @type {number} */ n) => prete.compteRescapes(n);
const noteReglagesCharges = (/** @type {any} */ enBase) => prete.noteReglagesCharges(enBase);

/* Ce qu'un catalogue donne à chercher : le nom de chaque produit et ses
   thématiques — tout ce que sa fenêtre montre en propre. Sa présentation reste
   dehors : elle porte du balisage, pèse dix lignes par produit, et un mot-clé
   qui y répondrait retiendrait un exposant sans que rien à l'écran dise
   pourquoi. */
const texteProduits = (l) => (l || [])
  .map(p => (p.nom || "") + " " + (p.themes || []).join(" "))
  .join(" ").toLowerCase();

export function indexe(/** @type {any} */ d){
  poseDonnees({ DATA: d });
  DATA.plans.forEach((p, i) => {
    p.i = i;
    p.court = String(p.libelle).replace(/^Pavillons*/i, "");
    p.zones = p.zones || [];
    p.stands = p.stands || [];
    p.fond = p.fond || [];
    p.conferences = p.conferences || [];
    /* Une zone organisateur n'a que son nom, et c'est bien lui qu'on tape pour
       la trouver : « accueil », « restauration », « village start-up » sont des
       endroits du salon au même titre qu'un stand. */
    p.zones.forEach(z => {
      z.kind = "zone"; z.p = i;
      // son libellé anglais aussi : un visiteur étranger tape celui qu'il lit
      z.rech = (String(z.nom || "") + " " + String(z.nom_en || "")).toLowerCase();
    });
    /* Ce sur quoi porte la recherche, assemblé et abaissé ici une fois pour
       toutes. Chaque frappe balaie tout le salon — un millier d'objets — et
       reconstruisait jusqu'ici la même chaîne pour chacun d'eux. */
    p.stands.forEach(s => {
      s.kind = "stand"; s.p = i;
      /* Les thématiques y entrent comme le reste — un visiteur qui tape
         « robotique » n'a pas à savoir que c'est un rangement d'exposants et
         non un nom d'enseigne — et les champs retenus comme critères de même :
         un exploitant qui désigne « Gamme de produits » comme critère veut
         qu'on trouve « bio » en le tapant, pas seulement en dépliant un
         filtre. Les thématiques y entrent qu'elles soient un critère ou non :
         dès lors qu'elles paraissent sur la fiche, ce qu'on y lit doit se
         retrouver en le tapant. Elles s'y répètent quand elles en sont un,
         ce dont une recherche par sous-chaîne ne s'aperçoit pas. */
      s.rech = ((s.nom || "") + " " + (s.code || "") + " " + (s.plan || "") +
                " " + (s.sect || "") + " " + (s.themes || []).join(" ") +
                " " + texteCriteres(s)).toLowerCase();
      /* Et l'anglais de ces valeurs, quand la source le donne : un visiteur
         qui lit « Construction » tape « construction », pas « bâtiment ». */
      const anglais = d.anglais || {};
      const traduites = [s.sect].concat(s.themes || [], s.nomencl || [],
        clesCriteres().flatMap(c => valeursCritere(s, c)))
        .map(v => anglais[v]).filter(Boolean);
      if (traduites.length) s.rech += " " + traduites.join(" ").toLowerCase();
      /* L'anglais des champs propres au salon ne vient pas du dictionnaire
         mais de la source, par la seconde origine que l'exploitant lui a
         désignée : il est déjà sur la fiche, il n'a qu'à entrer dans ce qu'on
         cherche. Sans quoi un visiteur taperait un mot qu'il vient de lire
         sans rien trouver. */
      s.rech += texteAnglaisPerso(s);
      /* Le catalogue se range à part, et non dans « rech » : l'exploitant le
         retire ou le remet depuis l'onglet « Recherche » sans que rien ne
         soit réindexé, et le mot-clé n'y répond que si la case est cochée. */
      s.rechProd = texteProduits(s.produits);
    });
  });
  /* Les noms des exposants ne se traduisent jamais, ni seuls ni cités dans une
     phrase : une enseigne « Mars » ou « Accueil » deviendrait sinon « March »
     ou « Reception » dans la version anglaise. */
  const noms = [];
  DATA.plans.forEach(p => {
    p.stands.forEach(s => {
      noms.push(s.nom, s.plan);
      (s.coex || []).forEach(c => noms.push(c.nom, c.plan));
    });
    p.conferences.forEach(c => (c.exposants || []).forEach(e => e && noms.push(e.nom)));
  });
  LANGUE.protege(noms);
  nomsAnglaisDesZones();
  /* L'anglais des valeurs des listes — secteurs, nomenclature, parcours de
     visite — tel que la synchronisation l'a relevé dans les sources. */
  LANGUE.donnees("sources", d.anglais || {});
  /* Et l'intitulé anglais que l'exploitant a donné aux champs propres au
     salon : il nomme la ligne de la fiche et le critère de recherche. */
  const intitules = {};
  (((DATA.fiche || {}).perso) || []).forEach(c => {
    if (c && c.libelle && c.libelle_en) intitules[c.libelle] = c.libelle_en;
  });
  LANGUE.donnees("champs", intitules);
  /* Les secteurs se relèvent avant les réglages, et non après : c'est la liste
     des secteurs de ce salon qui dit lesquelles de leurs couleurs, rangées
     dans la configuration, parlent bien de lui. */
  indexeSecteurs();

  /* L'habillage choisi par l'exploitant vient du service et l'emporte sur ce
     que garde le poste : c'est lui que les visiteurs doivent voir, et un
     téléphone n'a rien dans son stockage local. Le poste ne sert plus que de
     cache, et de refuge si un enregistrement a échoué — celui de ce salon-ci,
     que la clé de rangement désigne maintenant. */
  ouvreConf(d);
  /* Et les calques dessinés, rangés sous le même salon : la boucle qui suit
     confronte la base à ce que le poste garde, et il faut que ce soit ce
     salon-ci qu'il garde. */
  ouvreDessins(d);
  /* Les réglages, posés du plus ancien écrit au plus récent.
     Le même bloc est recopié dans chaque pavillon, un `await` par tour : un
     envoi interrompu à mi-parcours laisse le pavillon 1 porter le réglage neuf
     et les suivants l'ancien. Pris dans l'ordre des pavillons, c'est le dernier
     lu qui gagnait, donc l'ancien — et le réglage neuf disparaissait au
     rechargement, sans que rien ne le rattrape. Par date d'écriture, il tient.
     Un visiteur ne reçoit pas cette date : ses pavillons portent tous le même
     bloc, et l'ordre n'y décide de rien.
     `reglagesDuSalon` au passage : un enregistrement d'avant le cloisonnement
     porte les calques d'autres salons, qui ne désignent rien ici et
     fausseraient la publication. */
  const reglagesEnBase = {};
  DATA.plans
    .filter(p => p.apparence?.reglages && Object.keys(p.apparence.reglages).length)
    .map(p => p.apparence)
    .sort((a, b) => String(a.modifie_le || "").localeCompare(String(b.modifie_le || "")))
    .forEach(a => {
      const bloc = reglagesDuSalon(a.reglages);
      Object.assign(reglagesEnBase, bloc);
      Object.assign(CONF, bloc);
    });

  DATA.plans.forEach(p => {
    const a = p.apparence || {};
    if (Array.isArray(a.pile) && a.pile.length) CONF["_pile:" + p.id] = a.pile;
    /* Les dessins de la base font foi, jusqu'à l'effacement d'un calque retiré
       ailleurs — sauf sur ce que ce poste n'a jamais réussi à publier : cela
       n'existe nulle part ailleurs, et l'écraser le perdait. Une page à
       données figées n'en porte pas du tout : on n'y touche à rien. */
    if (Array.isArray(p.dessins)){
      const deLaBase = p.dessins.map(c => ({ ...c, formes: (c.formes || []).slice() }));
      if (ADMIN && enAttente(p.id)){
        /* Un travail que ce poste n'a pas encore publié : il l'emporte, la base
           ne l'a pas vu passer. Ce que la base a de plus s'y ajoute pourtant —
           un calque tracé depuis un autre poste, que ce poste-ci n'a jamais
           connu : l'ignorer ici, c'était l'effacer au premier envoi. Un calque
           déjà connu puis retiré d'ici, lui, a bien été supprimé à la main, et
           ne revient pas. Dans l'autre sens non plus : un calque que la base
           nous avait rendu et qu'elle n'a plus a été supprimé depuis un autre
           poste, et le travail en attente à côté ne le ressuscite pas. */
        const locaux = (DESSINS[p.id] || []).filter(c =>
          deLaBase.some(b => b.id === c.id) || !dejaPubliee(p.id, c.id));
        const ailleurs = deLaBase.filter(b =>
          !locaux.some(c => c.id === b.id) && !dejaPubliee(p.id, b.id));
        DESSINS[p.id] = locaux.concat(ailleurs);
      } else if (ADMIN){
        /* Rien en attente, et pourtant des calques d'ici que la base n'a jamais
           confirmés : un enregistrement a échoué sans se faire entendre — une
           session expirée suffit, et la page continue de tourner comme si de
           rien n'était. On les garde et on les remet en file plutôt que de les
           effacer : ce navigateur est le seul endroit où ils existent encore.
           Ceux que la base a connus puis perdus, eux, ont bien été supprimés
           ailleurs, et s'oublient. */
        const rescapes = (DESSINS[p.id] || [])
          .filter(c => !deLaBase.some(b => b.id === c.id) && !dejaPubliee(p.id, c.id));
        DESSINS[p.id] = deLaBase.concat(rescapes);
        if (rescapes.length){
          marqueAttente(p.id, true);
          compteRescapes(rescapes.length);
        }
      } else {
        DESSINS[p.id] = deLaBase;
      }
      if (ADMIN) notePubliees(p.id, deLaBase.map(c => c.id));
    }
  });
  /* Et la copie du poste remise dans son rangement telle qu'on vient de la
     reconstituer : elle et la liste des clés publiées doivent décrire le même
     instant, sans quoi l'ouverture suivante les compare de travers — voir
     `rangeDessins`. */
  if (ADMIN) rangeDessins();
  /* Ce que la base disait, et non ce que la page tient : l'envoi comparera le
     poste à cette image pour ne reposer que ce qu'on y a changé. Un réglage
     resté sur le poste faute d'avoir pu partir s'en distingue donc encore, et
     repart au prochain envoi — ce navigateur est le seul endroit où il est. */
  if (ADMIN) noteReglagesCharges(reglagesEnBase);

  /* Les géométries que l'exploitant a reprises à la main, posées avant que
     rien ne soit dessiné : le tracé, les noms, les aimants et la grille de
     marche lisent tous la forme de l'emplacement, et doivent lire celle qui
     vaut. Une forme que la source a déplacée depuis reprend la sienne —
     l'empreinte en décide (voir `modules/emplacements.mjs`). */
  /* Et, avant elles, les stands et les zones que l'exploitant a ajoutés à la
     main : rangés dans la configuration et non dans l'instantané de la
     source, ils traversent les synchronisations, et doivent être dans le
     pavillon avant que quoi que ce soit ne le lise. */
  appliqueAjouts();
  appliqueGeometries();

  /* L'habillage est connu dès ici, et le plan écrit ses libellés dans sa
     police : reposée maintenant, elle vaut dès le premier tracé. Attendre
     « appliqueApparence » la mettait une fois de trop en retard — les stands
     et les repères dessinés à la main sont tracés juste avant, et se
     seraient taillés sur la police d'origine. */
  posePoliceLibelles(modeleRetenu());

  /* Les dessins viennent de changer sous les pieds du calcul d'itinéraire :
     ce qu'il en avait retenu — les allées, les passages d'un plan à l'autre —
     ne décrit plus rien. */
  oublieGrilles();
  oublieLiaisons();
  // et le relevé des repères, que la recherche interroge
  oublieReperes();

  /* Un stand ajouté et lié à un exposant n'est que la forme de celui-ci : il
     reste dans l'index, pour que la reprise de forme le retrouve, mais pas
     dans ce qu'on cherche et qu'on compte — l'exposant y est déjà. */
  const formes = DATA.plans.flatMap(p => [...p.zones, ...p.stands]);
  poseDonnees({ TOUS: formes.filter(o => !o.lien), parId: new Map(formes.map(o => [o.id, o])) });
  /* Un rang de recherche par société hébergée. Il emprunte à son hôte tout ce
     qui décrit l'emplacement — identifiant, numéro, pavillon — et n'a en
     propre que son nom et son rang, par lequel la fiche la retrouvera. */
  poseDonnees({ HEBERGES: DATA.plans.flatMap((p, i) => p.stands.flatMap(s =>
    (s.coex || []).map((x, k) => {
      /* Une hébergée répond pour elle-même : ses thématiques, sa ville, ses
         rubriques, ses champs propres sont les siens et non ceux de son hôte,
         et un filtre doit la retenir pour ce qu'elle est. Elle n'emprunte à
         l'emplacement que ce qui le décrit — numéro, pavillon, secteur. */
      const h = {
        kind: "coex", id: s.id, i: k, p: i, code: s.code, sect: s.sect,
        nom: x.nom, plan: x.plan, ville: x.ville, pays: x.pays,
        nomencl: x.nomencl, themes: x.themes, perso: x.perso,
        perso_en: x.perso_en, neuf: x.neuf, adh: x.adh,
      };
      h.rech = ((x.nom || "") + " " + (s.code || "") + " " + (x.plan || "") +
                " " + (s.sect || "") + " " + (x.themes || []).join(" ") +
                " " + texteCriteres(h)).toLowerCase() + texteAnglaisPerso(h);
      // son catalogue est à elle, comme ses thématiques et ses rubriques
      h.rechProd = texteProduits(x.produits);
      return h;
    }))) });
  poseDonnees({ PAR_HEBERGE: new Map(HEBERGES.map(x => [x.id + "#" + x.i, x])) });
  indexeCriteres();
  indexeConferences();

  const nom = DATA.evenement || "Plan du salon";
  $("titre").textContent = nom;
  $("titre").classList.remove("attente");   // ce n'est plus un intitulé d'attente
  // l'onglet porte le nom de l'événement chargé, pas celui du premier salon
  document.title = (document.documentElement.dataset.role === "admin"
    ? "Administration — " : "") + nom;
  poseFavicon(DATA.favicon);
  poseLogoSalon(DATA.favicon);
  /* Et l'écran d'accueil d'iOS, qui ne lit pas le manifeste : le nom et
     l'icône du salon plutôt que ceux du produit. */
  nommeApplication(nom);
  chargeParcours();
}

/* Une conférence se lit dans l'ordre où elle se tient : l'heure locale d'abord,
   qui est celle qu'affiche la page, et l'heure absolue à défaut. */
const chronoConf = (a, b) => String(a.debutLocal || a.debut || "")
  .localeCompare(String(b.debutLocal || b.debut || ""));

/** Les conférences qu'un pavillon porte — aucune quand le salon n'a pas pris
 *  l'option du programme. */
const confsDuPlan = (p) => programmeOffert() ? (p.conferences || []) : [];

/**
 * Le programme du salon, indexé là où on le lit : par exposant, par zone, et
 * dans la liste globale que la recherche et le parcours balaient.
 *
 * À part de l'indexation pour deux raisons. La première est que cela se refait
 * sans recharger : le programme de conférences est une option du plan
 * (« OPTIONS » de « options.mjs »), et la fermer comme la rouvrir change tout
 * ce qui en découle — la recherche, le programme d'une zone, les conférences
 * d'un exposant, le tiroir du parcours, la journée organisée, les rappels.
 * L'instantané, lui, continue de les porter : fermer l'option n'efface rien,
 * et la rouvrir remet le programme en place.
 *
 * La seconde raison lui donne sa place dans l'indexation : les réglages du
 * salon ne sont ouverts qu'en cours de route (« ouvreConf »), et une option
 * relue avant eux aurait été celle du salon précédent.
 */
export function indexeConferences(){
  DATA.plans.forEach(p => {
    /* Une conférence tient aussi à l'exposant qui l'anime, dont le stand peut
       être ailleurs que sa salle — et qui reste son seul point d'accroche quand
       la salle n'est rattachée à aucune zone. */
    p.parStand = new Map();
    confsDuPlan(p).forEach(c => {
      (c.exposants || []).forEach(e => {
        if (!e || !e.stand) return;
        if (!p.parStand.has(e.stand)) p.parStand.set(e.stand, []);
        p.parStand.get(e.stand).push(c);
      });
    });
    p.parStand.forEach(l => l.sort(chronoConf));
  });
  /* Le programme d'une zone se lit pavillon par pavillon, mais un parcours de
     visite mêle les trois : la conférence retenue hier peut se tenir ailleurs
     que là où l'on se trouve. L'index des conférences est donc global, comme
     celui des stands. */
  poseDonnees({ CONFS: new Map() });
  DATA.plans.forEach((p, i) => confsDuPlan(p).forEach(c => {
    c.kind = "conf"; c.p = i;
    CONFS.set(String(c.id), c);
  }));
  /* Une même conférence est remontée dans chaque pavillon qui la porte, et
     chacun n'y cite que les exposants qu'il héberge : leur liste complète se
     recompose ici, sinon la fiche n'afficherait que ceux du dernier pavillon
     lu. */
  poseDonnees({ EXPOSANTS: new Map() });
  DATA.plans.forEach(p => confsDuPlan(p).forEach(c => {
    const k = String(c.id);
    if (!EXPOSANTS.has(k)) EXPOSANTS.set(k, []);
    const l = EXPOSANTS.get(k);
    (c.exposants || []).forEach(e => {
      if (e && e.stand && !l.some(x => x.stand === e.stand)) l.push(e);
    });
  }));
  /* Ce qu'on tape pour retrouver une conférence : son titre d'abord, puis ce
     qui la fait reconnaître quand on ne l'a pas en tête — sa salle, son type,
     sa thématique, et les noms qu'elle porte : l'exposant qui la tient, ceux
     qui y parlent et l'animent, souvent les seuls dont on se souvienne. Ce que
     la fiche montre doit se retrouver en le tapant. Leur fonction en est
     exclue, comme la présentation : « directeur général » ferait répondre la
     moitié du programme, et un paragraphe entier tout le reste. */
  poseDonnees({ CONFERENCES: [...CONFS.values()] });
  CONFERENCES.forEach(c => {
    const tenue = EXPOSANTS.get(String(c.id)) || [];
    const dits = [...(c.intervenants || []), ...(c.animateurs || [])]
      .map(p => (p.nom || "") + " " + (p.societe || "")).join(" ");
    /* L'exposant se cherche par le nom que la fiche lui donne, et c'est celui
       de son stand qui prime : le programme cite parfois une raison sociale là
       où le salon connaît une enseigne. */
    c.rech = ((c.nom || "") + " " + (c.salle || "") + " " + (c.type || "") +
              " " + (c.theme || "") + " " + dits + " " +
              tenue.map(e => (parId.get(e.stand) || {}).nom || e.nom || "").join(" ")
             ).toLowerCase();
  });
  rangeConferences();
}

/**
 * Ranger les conférences là où on les lit : au programme de la zone qui les
 * abrite, et dans le pavillon où l'on ira les chercher.
 *
 * À part de l'indexation parce que cela se refait sans recharger : le
 * rattachement d'une salle à une zone se choisit dans les réglages du plan, et
 * paraît aussitôt — comme le nom d'une zone.
 *
 * Ce rattachement l'emporte sur celui que porte l'instantané. C'est la règle
 * que le service applique déjà en servant le plan ; elle est reprise ici pour
 * que le choix se voie avant même d'avoir rechargé. La table des salles n'est
 * servie qu'à l'administration : le visiteur reçoit des conférences déjà
 * rattachées, et n'a rien à réappliquer.
 *
 * Une salle rattachée à une zone d'un autre pavillon n'entre au programme de
 * personne : la conférence n'est pas remontée là-bas, et la prochaine
 * synchronisation l'y portera. Elle se retrouve d'ici là par son exposant.
 */
export function rangeConferences(){
  const parSalle = new Map();
  Object.keys(DATA.salles || {}).forEach(k => {
    const s = DATA.salles[k];
    if (s && s.nom) parSalle.set(s.nom, s.zone || null);
  });
  DATA.plans.forEach(p => {
    const siennes = new Set(p.zones.map(z => z.id));
    // le programme d'une zone se lit d'un coup, et il est déjà chronologique
    p.parZone = new Map();
    confsDuPlan(p).forEach(c => {
      if (parSalle.has(c.salle)) c.zone = parSalle.get(c.salle);
      if (!c.zone || !siennes.has(c.zone)) return;
      if (!p.parZone.has(c.zone)) p.parZone.set(c.zone, []);
      p.parZone.get(c.zone).push(c);
    });
    p.parZone.forEach(l => l.sort(chronoConf));
  });
  /* Une conférence n'appartient pas au pavillon qui l'a remontée — elle est
     remontée par tous ceux qui la touchent — mais à celui où on la trouve : la
     zone de sa salle, ou à défaut le stand de celui qui l'anime. Sans ni l'une
     ni l'autre, elle n'est encore située nulle part et le pavillon que
     porterait sa ligne serait un hasard de synchronisation : elle se cherche et
     se lit, elle ne se rattache à rien tant qu'on ne l'a pas fait. */
  CONFERENCES.forEach(c => {
    const tenue = EXPOSANTS.get(String(c.id)) || [];
    const ou = (c.zone && parId.get(String(c.zone))) ||
               tenue.map(e => parId.get(e.stand)).find(Boolean);
    c.situee = Boolean(ou);
    if (ou) c.p = ou.p;
  });
}

/**
 * L'icône de l'onglet, telle que la console l'a déposée.
 *
 * Elle arrive avec les données et non dans l'en-tête de la page : celle-ci est
 * fabriquée une fois pour tous les salons, et ne peut donc rien savoir de
 * celui qu'on ouvre. L'onglet reste blanc le temps de l'appel, comme le titre
 * l'est aussi — c'est le même chargement qui les remplit tous les deux.
 *
 * Rien n'est posé faute d'icône : le navigateur garde la sienne, ce qui est
 * aussi ce qu'on veut quand l'exploitant vient de la retirer. Et l'image est
 * relue avant d'être posée, comme le logo d'une zone : elle a fait le même
 * chemin — saisie chez un exploitant authentifié, rangée en base, resservie
 * par l'API à tous les visiteurs.
 */
function poseFavicon(src){
  const img = imageSure(src);
  if (!img) return;
  let l = document.querySelector('link[rel="icon"]');
  if (!l){
    l = document.createElement("link");
    l.rel = "icon";
    document.head.appendChild(l);
  }
  l.type = img.slice(5, img.indexOf(";"));
  l.href = img;
}

/**
 * Le même logo, mais dans la bande du haut.
 *
 * L'icône de l'onglet est la seule image du salon que la page ait déjà : elle
 * arrive avec les données, et la montrer ne coûte pas un appel de plus. Sur un
 * téléphone réglé en bande réduite, elle dit le salon plus vite que son nom —
 * on reconnaît une marque d'un coup d'œil, on lit un nom.
 *
 * L'attribut plutôt qu'une classe : sans image, l'élément doit quitter la
 * ligne, et non s'y tenir à zéro pixel entre le bord et le nom. La feuille de
 * style décide ensuite s'il y a une bande où le montrer (`_head.html`,
 * « .logoSalon »).
 */
function poseLogoSalon(src){
  const el = $("logoSalon");
  if (!el) return;
  const img = imageSure(src);
  el.hidden = !img;
  if (img) el.src = img;
}

/* Le programme n'est pas une commande qu'on masque : c'est un index qu'on
   refait, celui de ce module, et tout ce qui le lit part de là. La liste
   affichée derrière la fenêtre est peut-être un résultat de recherche, et le
   tiroir du parcours peut être ouvert : les deux obéissent sur-le-champ. Ce
   module le confie à la liste des options en se chargeant
   (`confieApresOption`). */
confieApresOption("programme", () => { indexeConferences(); liste(); rafraichitParcours(); });
