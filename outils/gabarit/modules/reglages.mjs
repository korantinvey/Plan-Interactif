/* ============================================================
   La fenêtre des réglages du plan — l'exploitant seul

   La fenêtre elle-même et ses onglets, et les volets qui n'ont pas de module à
   eux : « Plan » (le temps d'une visite et les heures du salon), « Zones »
   (les fiches des zones organisateur, l'une après l'autre) et
   « Co-Exposants ». Les autres volets sont importés de leurs modules —
   `volets.mjs`, `reglage-fiche.mjs`, `reglage-suggestion.mjs`,
   `calage-carte.mjs`, `chaleur.mjs` —, la fiche d'une zone de
   `fiche-zone.mjs`.

   Un module de l'administration : `plan-admin.mjs` l'embarque, le visiteur ne
   le reçoit jamais. La configuration, les options du salon, la durée d'une
   visite et le volet « Recherche » s'importent de leurs modules
   (`configuration.mjs`, `horaires.mjs`, `seuil.mjs`, `reglage-recherche.mjs`),
   comme l'enregistrement de la configuration, les distinctions, ce que la
   fiche montre et la fiche elle-même, le dessin des noms : il n'a rien à se
   faire confier.

   La fenêtre se rouvre après un aperçu (`retourAuxReglages`, dont il confie
   le contenu à `fenetre.mjs`), depuis la bande de l'outil et la remise
   à zéro des compteurs (`chaleur.mjs`, à qui il la passe en appelant son volet) ;
   le pas d'une hauteur à l'autre s'importe de `glisse-fenetre.mjs`, comme
   le font les volets du générique et de la suggestion.
   ============================================================ */
import { $ } from "./dom.mjs";
import { DATA, TOUS, parId, state, CONFERENCES } from "./donnees.mjs";
import { ouvreModale, confieRetourAuxReglages } from "./fenetre.mjs";
import { PROFIL_ADMIN } from "./acces-admin.mjs";
import { champsZone, suitFicheZone, verseFicheZone, ecritColonneEvenement } from "./fiche-zone.mjs";
import { voletAdmin, blocHoraires, voletParcours, sallesSituees, voletPmr, MAJ_COIN, voletDist,
  voletApparence } from "./volets.mjs";
import { voletOrdre } from "./reglage-fiche.mjs";
import { NOM_VOLET_SUGGESTION, voletSuggestion }
  from "./reglage-suggestion.mjs";
import { voletEnvirons } from "./calage-carte.mjs";
import { NOM_VOLET_MESURE, voletMesure } from "./chaleur.mjs";
import { conf, optionActive, suggestionOfferte, enregistreConf } from "./configuration.mjs";
import { VISITE_MIN, VISITE_MAX, minutesVisite } from "./horaires.mjs";
import { NOM_VOLET_PARCOURS } from "./seuil.mjs";
import { voletRecherche } from "./reglage-recherche.mjs";
import { glisseFenetre } from "./glisse-fenetre.mjs";
import { montre } from "./corps-fiche.mjs";
import { ouvre } from "./fiche.mjs";
import { DISTINCTIONS } from "./distinctions.mjs";
import { libelles } from "./libelles.mjs";

/* Un aperçu a pris la place des réglages : toute sortie y ramène, sur la case
   qui l'a ouvert. Un temps plus tard, et non dans le crochet : la fenêtre
   achève de se fermer après lui, et refermerait les réglages rouverts
   sur-le-champ.

   La marque dit quelle case a ouvert l'aperçu : deux réglages en offrent un,
   l'invitation à installer et le rappel des conférences, et ils se ressemblent
   assez pour qu'on revienne au mauvais si on ne le nomme pas.

   Le retour est public de nom — l'invitation et le rappel, que le visiteur
   reçoit, l'appellent (`fenetre.mjs` `retourAuxReglages`) —, et
   d'administration de contenu : ce module le confie à la fenêtre commune dès
   que la page d'administration le charge, avant que `plan-admin.mjs` ne
   lance le plan. */
confieRetourAuxReglages((marque) => {
  queueMicrotask(() => {
    ouvreReglages("Admin");
    const aide = $("mCorps").querySelector('[data-reglage="' + marque + '"]');
    if (aide) requestAnimationFrame(() => aide.scrollIntoView({ block: "nearest" }));
  });
});

/**
 * Réglages généraux du plan.
 *
 * Ils ne portent sur aucun calque : dans la pile ils alourdissaient une liste
 * déjà longue, et se lisaient comme une couche de plus. Une fenêtre à part les
 * range, et laisse la place à celles qui viendront.
 *
 * Deux volets : ce que le plan montre, et de quoi il a l'air. Le second est
 * une planche d'aperçus — empilé sous le premier, il l'aurait poussé hors de
 * l'écran.
 */


export function ouvreReglages(ouvrir){
  ouvreModale("Réglages du plan", corps => {
    const barre = document.createElement("div");
    barre.className = "ongReg";
    corps.appendChild(barre);
    const boutons = [], volets = [];
    /* Le volet à ouvrir peut être nommé : la remise à zéro des compteurs passe
       par une fenêtre de confirmation, qui prend la place de celle-ci, et
       « Annuler » doit ramener là d'où l'on vient plutôt qu'au premier onglet.
       Un nom, et rien d'autre : branchée telle quelle sur un bouton, la
       fonction recevrait l'événement de clic, qui ne désigne aucun volet et
       les fermait tous. */
    const nomme = typeof ouvrir === "string" && ouvrir ? ouvrir : null;
    /* Dix onglets ne tiennent pas sur un téléphone : la barre y défile. Celui
       qu'on vient de retenir se ramène donc sous les yeux — sans lui, le dernier
       restait à moitié coupé après le clic, et la fenêtre ouverte droit sur lui
       ne montrait pas où l'on était. « nearest » et non « center » : la fenêtre
       défile aussi pour son compte, et le centrage la remontait d'un cran.

       À l'image suivante, et non tout de suite : le corps de la fenêtre est
       rempli avant qu'elle ne s'ouvre, et un élément en « display:none » n'a
       aucune position à ramener. */
    const ramene = (b) => requestAnimationFrame(() =>
      b.scrollIntoView({ block: "nearest", inline: "nearest" }));
    const volet = (titre, eteint) => {
      const i = boutons.length;
      const actif = nomme ? titre === nomme : i === 0;
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = titre;
      b.setAttribute("aria-pressed", String(actif));
      /* L'onglet d'une option que le salon n'a pas prise reste là, gris et
         sans prise, plutôt que de disparaître : un onglet absent n'apprend
         rien, et celui-ci dit ce qui se prend. Ce qui était réglé derrière est
         gardé, et se retrouve le jour où l'option s'ouvre. */
      if (eteint){ b.classList.add("eteint"); b.disabled = true; }
      b.onclick = () => {
        // une fiche de zone laissée dans l'onglet d'à côté s'enregistre en le quittant
        verseFicheZone();
        glisseFenetre(() => {
          boutons.forEach((x, j) => x.setAttribute("aria-pressed", String(j === i)));
          volets.forEach((x, j) => { x.hidden = j !== i; });
        });
        /* Un volet qui dépend d'un autre se refait en reparaissant : l'aperçu du
           rangement porte l'habillage retenu, qui a pu changer dans « Apparence »
           pendant qu'il était caché. */
        if (volets[i].rafraichit) volets[i].rafraichit();
        ramene(b);
      };
      barre.appendChild(b);
      boutons.push(b);
      const v = document.createElement("div");
      v.className = "voletReg";
      v.hidden = !actif;
      corps.appendChild(v);
      volets.push(v);
      return v;
    };
    voletPlan(volet("Plan"));
    /* « Recherche » suit « Plan » : les deux parlent de ce que le visiteur
       obtient, quand « Apparence » ne parle que de l'allure. */
    voletRecherche(volet("Recherche"));
    /* La suggestion suit la recherche pour la même raison : elle parle de ce
       que le visiteur obtient, et elle se lit dans la foulée des critères,
       qu'elle emprunte. Son option se ferme depuis « Admin » ; l'onglet reste
       alors là, grisé, parce qu'une option se voit pour être prise. */
    voletSuggestion(volet(NOM_VOLET_SUGGESTION, !suggestionOfferte()));
    /* « Fiche Stand » ferme la série de ce que le visiteur obtient : on ne
       range les champs qu'une fois qu'on sait lesquels paraissent, et son
       aperçu emprunte l'habillage que l'onglet suivant choisit. */
    voletOrdre(volet("Fiche Stand"));
    /* Les distinctions entre la fiche et l'apparence : elles parlent bien de
       l'allure du plan, mais d'une allure qui dit un fait — qui vient
       d'arriver, qui adhère — et non d'un habillage. Elles se lisent donc dans
       la foulée de ce que la fiche montre, avant la planche des modèles, et
       dans l'ordre de leur table. */
    MAJ_COIN.length = 0;
    DISTINCTIONS.forEach(d => voletDist(volet(d.onglet), d));
    voletApparence(volet("Apparence"));
    /* Les environs suivent l'apparence : ils ne changent rien à ce que le
       visiteur trouve, seulement à ce qu'il voit autour. Et c'est un réglage
       de parc plutôt que de salon — posé une fois, repris rarement. */
    voletEnvirons(volet("Environs"));
    /* Les zones n'ont d'onglet que là où il y en a : sur un salon qui n'en
       compte aucune, il n'ouvrirait que sur une liste vide. */
    if (TOUS.some(z => z.kind === "zone")) voletZones(volet("Zones"));
    /* « PMR » ne paraît qu'une fois des salles rattachées à des zones : ce
       qu'il règle — la foule d'une sortie de conférence — n'a aucune prise sur
       un salon dont le programme n'est situé nulle part. Le rattachement se
       fait dans les réglages du plan, et l'onglet apparaît ensuite. */
    /* « Parcours intelligent » précède « PMR » : les deux règlent le moteur
       qui trace et qui ordonne, non ce que la page montre. L'onglet reste là,
       gris, quand la journée organisée n'est pas prise — ce qu'il règle n'a
       alors aucune visite à étaler, et une option se voit pour être prise. */
    voletParcours(volet(NOM_VOLET_PARCOURS, !optionActive("journee")));
    if (sallesSituees()) voletPmr(volet("PMR"));
    /* La mesure a son volet à elle, et en dernier. Elle ne parle ni de ce que
       les visiteurs voient ni de l'allure du plan, et ce qu'on y trouve — un
       effacement sans retour — n'a rien à faire au milieu de cases à cocher. */
    voletMesure(volet(NOM_VOLET_MESURE), ouvreReglages);
    /* « Admin » après tout le reste : l'organisateur ne le voit pas, et les
       onglets qu'il partage avec l'administrateur gardent ainsi la même place
       sous les yeux de l'un et de l'autre. */
    /* « Co-Exposants » juste avant « Admin », et pour le même seul profil : ses
       cases en venaient, et l'organisateur ne les réglait pas. */
    if (PROFIL_ADMIN) voletCoexposants(volet("Co-Exposants"));
    if (PROFIL_ADMIN) voletAdmin(volet("Admin"));
    /* Un nom qui ne désigne aucun volet — un onglet retiré depuis, un salon
       sans zones — laisserait la fenêtre sur rien : on retombe sur le premier
       plutôt que sur le vide. */
    const actif = boutons.find(b => b.getAttribute("aria-pressed") === "true");
    if (actif) ramene(actif); else boutons[0].onclick();
  }, [{ libelle: "Fermer" }], "large");
}

/**
 * Les zones organisateur, l'une après l'autre.
 *
 * Une zone se reprend jusqu'ici depuis sa forme sur le plan : encore
 * faut-il la retrouver, et rien ne distingue de loin une réserve d'une agora.
 * L'exploitant qui remplit les fiches d'un salon les veut en liste, et passe
 * de l'une à l'autre sans refermer.
 *
 * D'où les deux volets : la liste à gauche, la fiche de celle qu'on a choisie
 * à droite. Chaque rang dit ce qu'il en est déjà — une fiche écrite, une zone
 * retirée du plan public — pour qu'on voie d'un coup d'œil ce qui reste à
 * faire.
 */
function voletZones(hote){
  const p = document.createElement("p");
  p.textContent = "Ce que le visiteur lit sur une zone organisateur. La source " +
    "n'en donne que le contour et parfois un nom : le reste s'écrit ici, et " +
    "paraît sans attendre la prochaine synchronisation.";
  hote.appendChild(p);

  /* Sans nom, une zone ne se distingue pas de la suivante : celles qui en ont
     un se lisent dans l'ordre alphabétique, les autres attendent à la fin —
     c'est là qu'est le travail. */
  const zones = TOUS.filter(z => z.kind === "zone").slice().sort((a, b) =>
    (a.nom ? 0 : 1) - (b.nom ? 0 : 1) ||
    String(a.nom || "").localeCompare(String(b.nom || ""), "fr") ||
    String(a.id).localeCompare(String(b.id)));

  const grille = document.createElement("div");
  grille.className = "zonesReg";
  const colonne = document.createElement("div");
  colonne.className = "listeZ";
  const detail = document.createElement("div");
  detail.className = "detailZ";
  grille.appendChild(colonne);
  grille.appendChild(detail);
  hote.appendChild(grille);

  const rangs = new Map();
  /* Ce qu'un rang dit de sa zone. Réécrit après chaque enregistrement : le nom
     vient d'y changer, et la fiche d'y apparaître. */
  const ecritRang = (z) => {
    const b = rangs.get(z.id);
    if (!b) return;
    b.innerHTML = "";
    const n = document.createElement("span");
    n.className = "n";
    n.textContent = z.nom || "Zone sans nom";
    b.appendChild(n);
    const dit = [];
    if (z.description || z.lien || z.logo) dit.push("fiche");
    if (z.traversable) dit.push("traversée");
    if (z.masquee) dit.push("masquée");
    if (dit.length){
      const e = document.createElement("span");
      e.className = "etat";
      e.textContent = dit.join(" · ");
      b.appendChild(e);
    }
  };

  const choisit = (z) => {
    // ce qu'on quitte part maintenant : la fiche qu'on ouvre prend sa place
    verseFicheZone();
    rangs.forEach((b, id) => b.setAttribute("aria-pressed", String(id === z.id)));
    detail.innerHTML = "";
    ficheZoneEnPlace(detail, z, () => ecritRang(z));
  };

  zones.forEach(z => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-pressed", "false");
    b.onclick = () => choisit(z);
    colonne.appendChild(b);
    rangs.set(z.id, b);
    ecritRang(z);
  });

  // une liste dont rien n'est choisi n'a que du vide en face d'elle
  choisit(zones[0]);

  champsFicheZone(hote);
}

/* Les champs d'une fiche de zone, et ce que chacun porte.

   Aucun ne vient d'une source : une zone n'a pas de fiche d'exposant derrière
   elle, tout ce qu'on lit sur elle a été écrit juste au-dessus, zone par zone
   — sauf le programme, que la synchronisation apporte. C'est pourquoi le
   réglage a quitté la console, où il voisinait avec les champs d'origine des
   stands : ici, on décoche « Description » en voyant la description qu'on
   vient d'écrire, et sur la fiche ouverte derrière la fenêtre. */
const CHAMPS_FICHE_ZONE = [
  { cle: "logo", libelle: "Logo",
    aide: "L'image déposée sur la zone, dans l'en-tête de sa fiche." },
  { cle: "description", libelle: "Description",
    aide: "Ce qu'on trouve dans la zone, ses horaires, ses conditions " +
      "d'accès. Elle ne paraît que sur les zones où elle est remplie." },
  { cle: "lien", libelle: "Lien",
    aide: "La page où en savoir plus, saisie avec la description." },
  { cle: "conferences", libelle: "Conférences",
    aide: "Le programme tenu dans la zone, par ordre chronologique.",
    dispo: () => CONFERENCES.length > 0,
    absent: "Le programme n'est pas synchronisé : sa source se règle depuis " +
      "la console, dans « Source des données »." },
];

/**
 * Ce que la fiche d'une zone montre, pour toutes les zones du salon.
 *
 * Le réglage ne se publie pas : il vit à côté de l'événement, comme le
 * rangement de la fiche, et parvient aux visiteurs dès l'écriture passée.
 * D'où la ligne d'état plutôt qu'un bouton — il n'y a rien à valider.
 */
function champsFicheZone(hote){
  const titre = document.createElement("span");
  titre.className = "eyebrow";
  titre.style.display = "block";
  titre.style.margin = "18px 0 4px";
  titre.textContent = "Ce que la fiche montre";
  hote.appendChild(titre);

  const p = document.createElement("p");
  p.textContent = "Les champs qu'une fiche de zone déroule, pour toutes les " +
    "zones à la fois. Un champ décoché reste écrit : il cesse de paraître, et " +
    "revient tel quel en le recochant.";
  hote.appendChild(p);

  const etat = document.createElement("p");
  etat.className = "etatZ";
  etat.textContent = "Ces cases s'enregistrent dès qu'on les coche.";

  /* Les écritures s'enchaînent plutôt que de partir ensemble : chacune relit
     la colonne avant de la réécrire, et deux qui se croisent perdraient la
     première. */
  let file = Promise.resolve();
  const dit = (txt, mal) => { etat.textContent = txt; etat.dataset.mal = String(!!mal); };

  const bloc = document.createElement("div");
  bloc.className = "reglages";
  CHAMPS_FICHE_ZONE.forEach(c => {
    const l = document.createElement("label");
    l.innerHTML = '<input type="checkbox"><span></span>';
    l.querySelector("span").textContent = c.libelle;
    const i = l.querySelector("input");
    i.checked = montre("zone", c.cle);
    /* Éteinte, et non décochée, quand rien ne l'alimente : la case montre ce
       qui est réglé, et le réglage vaudra le jour où le programme sera
       synchronisé. C'est aussi ce que la console disait de son côté, par la
       provenance affichée en tête du cadre. */
    if (c.dispo && !c.dispo()){ l.classList.add("eteint"); i.disabled = true; }
    i.onchange = () => {
      DATA.fiche = { ...(DATA.fiche || {}) };
      DATA.fiche.zone = { ...(DATA.fiche.zone || {}), [c.cle]: i.checked };
      /* La fiche ouverte derrière la fenêtre lit le même réglage : elle le
         suit sans attendre la réponse du serveur, sans quoi on douterait du
         clic. L'écriture, elle, dira le dernier mot. */
      const o = state.sel && parId.get(state.sel);
      if (o && o.kind === "zone") ouvre(o, null);
      dit("Enregistrement…");
      file = file.then(() => ecritColonneEvenement("fiche", DATA.fiche, t => {
        t.zone = { ...DATA.fiche.zone };
      })).then(t => { DATA.fiche = t; dit("Enregistré."); })
        .catch(e => dit("Échec : " + e.message, true));
    };
    bloc.appendChild(l);

    const aide = document.createElement("p");
    aide.className = "aideR";
    aide.textContent = c.dispo && !c.dispo() ? c.absent : c.aide;
    bloc.appendChild(aide);
  });
  hote.appendChild(bloc);
  hote.appendChild(etat);
}

/**
 * La fiche d'une zone, posée dans les réglages plutôt que dans une fenêtre.
 *
 * Elle n'a pas de bouton : on remplit les zones l'une après l'autre, et un
 * bouton par fiche ferait dix validations pour un même travail. Elle part donc
 * quand on la quitte — pour une autre zone, un autre onglet, ou la sortie — et
 * la ligne d'état dit ce qu'il en est advenu tant qu'on la voit encore.
 */
function ficheZoneEnPlace(hote, o, apres){
  const ou = document.createElement("p");
  ou.className = "ouZ";
  ou.textContent = [(DATA.plans[o.p] || {}).libelle,
    o.masquee ? "retirée du plan public" : ""].filter(Boolean).join(" · ");
  hote.appendChild(ou);

  const valeurs = champsZone(hote, o);

  const etat = document.createElement("p");
  etat.className = "etatZ seul";
  etat.textContent = "Ce que vous écrivez est enregistré en quittant la fiche.";
  hote.appendChild(etat);
  suitFicheZone(o, valeurs, etat, apres);
}

/** La journée d'un visiteur : le temps qu'on passe sur un stand, et les heures
 *  où le salon ouvre. Les commandes du plan sont passées dans « Admin ». */
function voletPlan(hote){
  const p = document.createElement("p");
  p.textContent = "Ce qui règle la journée d'un visiteur. " +
    "Publiez la configuration pour que le changement parvienne aux visiteurs.";
  hote.appendChild(p);

  const duree = document.createElement("div");
  duree.className = "reglage-nb";
  duree.innerHTML = '<label><span class="l"></span>' +
    '<input type="number" min="' + VISITE_MIN + '" max="' + VISITE_MAX + '" step="5">' +
    '<span class="u">min</span></label><span class="aide"></span>';
  duree.querySelector(".l").textContent = "Temps de visite par stand";
  duree.querySelector(".aide").textContent =
    "Sert à organiser la journée d'un visiteur depuis son parcours : c'est ce " +
    "qui décide combien de stands tiennent entre deux conférences.";
  const n = duree.querySelector("input");
  n.value = minutesVisite();
  /* Un champ vidé le temps de retaper ne doit rien écrire : on ne retient
     que ce qui tient dans les bornes, et le champ se remet d'aplomb quand
     on le quitte. */
  n.oninput = e => {
    const v = Math.round(+e.target.value);
    if (v >= VISITE_MIN && v <= VISITE_MAX){ conf("_visite").minutes = v; enregistreConf(); }
  };
  n.onblur = () => { n.value = minutesVisite(); };
  hote.appendChild(duree);

  blocHoraires(hote);
}

/**
 * Les stands partagés, dans leur onglet à eux.
 *
 * Leurs deux cases vivaient au milieu de « Admin », sous condition : sur un
 * salon dont la synchronisation n'avait rattaché personne, elles n'y étaient
 * pas, et rien ne disait pourquoi — on les cherchait parmi dix autres. L'onglet
 * reste donc là même sans stand partagé, et dit alors où le rattachement se
 * règle : c'est une affaire de source, que la console tient, et non de page.
 */
function voletCoexposants(hote){
  const p = document.createElement("p");
  p.textContent = "Les sociétés hébergées sur le stand d'un autre exposant. " +
    "Publiez la configuration pour que le changement parvienne aux visiteurs.";
  hote.appendChild(p);

  const bloc = document.createElement("div");
  bloc.className = "reglages";
  hote.appendChild(bloc);

  /* Deux emplacements réunis font deux stands qui listent les mêmes sociétés :
     on compte les sociétés par leur nom, pas les listes. */
  const partages = (DATA?.plans || []).flatMap(pl => pl.stands || [])
    .filter(s => (s.coex || []).length);
  if (!partages.length){
    const n = document.createElement("p");
    n.className = "aideR";
    n.textContent = "Aucun stand partagé sur ce salon pour l'instant. Les " +
      "co-exposants se rattachent à leur hôte par la synchronisation : dans la " +
      "console, désignez le champ « Rattachement des co-exposants » — celui où " +
      "une fiche porte le numéro du stand qui l'accueille —, puis synchronisez.";
    bloc.appendChild(n);
    return;
  }
  const societes = new Set(partages.flatMap(s =>
    s.coex.map(x => String(x.nom || x.id || ""))));
  const compte = document.createElement("p");
  compte.className = "aideR";
  /* Quatre phrases entières plutôt qu'un « s » accolé : le dictionnaire
     anglais traduit une phrase par modèle, et un mot recollé n'y répondrait
     pas. Une société seule peut couvrir deux stands — deux emplacements
     réunis —, d'où le singulier devant un pluriel. */
  const n = societes.size, m = partages.length;
  compte.textContent = n > 1
    ? (m > 1 ? n + " co-exposants sur " + m + " stands partagés."
      : n + " co-exposants sur un stand partagé.")
    : (m > 1 ? "Un co-exposant sur " + m + " stands partagés."
      : "Un co-exposant sur un stand partagé.");
  bloc.appendChild(compte);

  [{ cle: "_coexNombre",
     libelle: "Compter les co-exposants sur le plan",
     aide: "Une pastille à côté du numéro du stand dit combien de sociétés il " +
       "héberge, en plus de son titulaire.",
     // le compte fait partie du libellé du stand : il se redessine avec lui
     apres: () => libelles() },
   { cle: "_coexChoix",
     libelle: "Afficher la liste des co-exposants au clic sur le stand",
     aide: "Toucher un stand partagé propose d'abord de choisir la société. " +
       "Décochée, le stand mène droit à son titulaire ; les sociétés hébergées " +
       "restent dans la liste des exposants." }
  ].forEach(r => {
    const l = document.createElement("label");
    l.innerHTML = '<input type="checkbox"><span></span>';
    l.querySelector("span").textContent = r.libelle;
    const c = l.querySelector("input");
    c.checked = conf(r.cle).visible !== false;
    c.onchange = e => {
      conf(r.cle).visible = e.target.checked;
      enregistreConf();
      if (r.apres) r.apres();
    };
    bloc.appendChild(l);
    const aide = document.createElement("p");
    aide.className = "aideR";
    aide.textContent = r.aide;
    bloc.appendChild(aide);
  });
}
