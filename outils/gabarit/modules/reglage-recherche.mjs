/* ============================================================
   L'onglet « Recherche » des réglages — l'exploitant seul

   Ce que le champ de recherche a le droit de remonter, et l'ordre des
   filtres du panneau des critères. Ce module n'est
   embarqué que par `plan-admin.mjs`, et `reglages.mjs` l'importe pour ouvrir
   l'onglet. Ce que le plan public relit du réglage — une sorte remonte-t-elle
   (`chercheSorte`) — est dans `configuration.mjs`.

   Il n'a rien à se faire confier : les repères s'importent de
   `points-interet.mjs`, l'enregistrement de la configuration de
   `configuration.mjs`, les critères et la liste de `recherche.mjs`, ce que la
   fiche montre de `corps-fiche.mjs`.
   ============================================================ */
import { DATA, TOUS, CONFERENCES } from "./donnees.mjs";
import { conf, programmeOffert, chercheSorte, enregistreConf } from "./configuration.mjs";
import { CLE_SECTEUR, PREFIXE_PERSO, clesCriteres, refaitCriteres, libelleCritere, liste }
  from "./recherche.mjs";
import { montre } from "./corps-fiche.mjs";
import { reperesCherchables } from "./points-interet.mjs";

/* Ce salon tient-il un catalogue ? Les produits suivent la société et non le
   pavillon : c'est sur les stands, et sur les enseignes qu'ils hébergent,
   qu'il faut les chercher pour savoir s'il en est venu. */
const catalogueTenu = () => (DATA?.plans || []).some(p =>
  (p.stands || []).some(s => (s.produits || []).length ||
    (s.coex || []).some(x => (x.produits || []).length)));

/**
 * Ce que la recherche a le droit de remonter.
 *
 * Le champ de recherche balaie tout ce que le salon porte, et cela ne convient
 * pas à tous les salons. Un congrès dont le programme compte trois cents
 * sessions les voit répondre au premier mot courant venu, et noyer les stands
 * qu'on était venu chercher ; un salon de trente exposants veut au contraire
 * qu'un mot ramène tout ce qui s'y rapporte. Rien dans les données ne dit
 * lequel des deux on administre — d'où le réglage, sorte par sorte.
 *
 * Il ne touche qu'à la recherche. Sans mot-clé ni critère, la liste n'est pas
 * un résultat mais le sommaire des emplacements du pavillon : l'y soumettre
 * aurait laissé une colonne blanche à qui décoche « Stands ».
 *
 * Chaque sorte dit aussi ce qu'elle alimente — « Produits » et « Points
 * d'intérêt » ne se devinent pas depuis leur intitulé — et, quand rien ne
 * l'alimente, pourquoi sa case ne répond pas.
 */
const SORTES_RECHERCHE = [
  { cle: "stands", libelle: "Stands et exposants",
    aide: "Le nom d'une enseigne, son numéro d'emplacement, son secteur, " +
      "ses thématiques, et les sociétés hébergées sur un stand partagé.",
    dispo: () => TOUS.some(o => o.kind === "stand"),
    absent: "Ce salon ne porte aucun emplacement." },
  { cle: "zones", libelle: "Zones organisateur",
    aide: "Accueil, restauration, village start-up — les endroits que le " +
      "salon fournit avec son plan.",
    dispo: () => TOUS.some(o => o.kind === "zone"),
    absent: "Ce salon ne porte aucune zone organisateur." },
  { cle: "conferences", libelle: "Conférences",
    aide: "Le titre d'une session, sa salle, son thème, et l'exposant qui " +
      "la tient — souvent le seul nom dont on se souvienne.",
    dispo: () => CONFERENCES.length > 0,
    /* Deux raisons de n'en avoir aucune, et l'exploitant n'a pas le même geste
       à faire selon celle qui vaut : une option fermée se rouvre d'ici, une
       source non réglée se règle dans la console. */
    absent: () => programmeOffert()
      ? "Le programme n'est pas synchronisé : sa source se règle depuis " +
        "la console, dans « Source des données »."
      : "Le programme de conférences n'est pas pris sur ce salon." },
  /* Les produits ne sont pas une sorte d'objet : ils se posent sur la société
     — le stand, et chacune de ses hébergées —, et cocher revient à faire
     répondre un exposant au nom de ce qu'il présente. D'où deux conditions,
     et deux gestes différents pour les remplir : un catalogue synchronisé, et
     une fiche qui le montre — sans elle les produits ne descendent même pas
     chez le visiteur, et il n'y aurait rien à chercher. */
  { cle: "produits", libelle: "Produits",
    aide: "Le nom de ce qu'un exposant présente, et les thématiques du " +
      "produit : le stand qui le porte répond au mot-clé.",
    dispo: () => catalogueTenu() && montre("stand", "produits"),
    absent: () => catalogueTenu()
      ? "La fiche ne montre pas les produits : la case se coche depuis la " +
        "console, dans « Fiche détail »."
      : "Aucun produit n'est remonté par la synchronisation : leur source se " +
        "règle depuis la console, dans « Source des données »." },
  { cle: "poi", libelle: "Points d'intérêt",
    aide: "Les repères posés sur le plan : entrées, WC, escaliers, parkings, " +
      "vestiaires. Le cartouche du bas les récapitule de son côté, que cette " +
      "case soit cochée ou non.",
    dispo: () => reperesCherchables().length > 0,
    absent: "Aucun repère n'est posé sur les plans de ce salon : ils se " +
      "dessinent depuis la boîte à outils." },
];

/** Le volet « Recherche » : les sortes d'éléments que le champ remonte. */
export function voletRecherche(hote){
  const p = document.createElement("p");
  p.textContent = "Ce que le champ de recherche remonte. Le sommaire du " +
    "pavillon n'en dépend pas : sans mot-clé, la liste reste celle de ses " +
    "emplacements. Publiez la configuration pour que le changement parvienne " +
    "aux visiteurs.";
  hote.appendChild(p);

  const bloc = document.createElement("div");
  bloc.className = "reglages";
  SORTES_RECHERCHE.forEach(s => {
    const dispo = s.dispo();
    const l = document.createElement("label");
    l.innerHTML = '<input type="checkbox"><span></span>';
    l.querySelector("span").textContent = s.libelle;
    if (!dispo) l.classList.add("eteint");
    const c = l.querySelector("input");
    c.checked = chercheSorte(s.cle);
    /* Éteinte, et non décochée : la case montre ce qui est réglé, et le
       réglage vaudra le jour où quelque chose l'alimentera. La décocher
       d'office effacerait un choix que l'exploitant a fait. */
    c.disabled = !dispo;
    c.onchange = e => {
      conf("_rech")[s.cle] = e.target.checked;
      enregistreConf();
      /* La liste affichée derrière la fenêtre est peut-être un résultat de
         recherche : elle obéit sur-le-champ, c'est le seul retour visible. */
      liste();
    };
    bloc.appendChild(l);

    const aide = document.createElement("p");
    aide.className = "aideR";
    /* « absent » est une phrase, ou de quoi en choisir une quand la sorte a
       plusieurs façons de manquer. */
    aide.textContent = dispo ? s.aide
      : (typeof s.absent === "function" ? s.absent() : s.absent);
    bloc.appendChild(aide);
  });
  hote.appendChild(bloc);

  blocOrdreCriteres(hote);
}

/**
 * L'ordre des filtres du panneau des critères.
 *
 * Les champs qui servent de filtre se cochent dans la console, un par un, et
 * arrivaient sur le plan dans l'ordre où on avait coché leurs cases — un ordre
 * qui ne dit rien de la façon dont on cherche un exposant. Le premier de la
 * liste est pourtant le seul qu'on lise sans dérouler quand il y en a six : il
 * décide de la première question qu'on pose au salon. Un salon régional range
 * la région en tête, un salon de métiers le profil.
 *
 * Le rangement ne se fait donc pas dans la console, où l'on ne voit pas le
 * plan, mais ici, à côté du panneau qui les montre.
 *
 * Deux façons de déplacer, et il en faut deux : la poignée, qui traverse la
 * liste d'un geste, et les flèches, seul chemin au clavier — et au doigt, le
 * glisser-déposer du navigateur ignorant le tactile.
 */
function blocOrdreCriteres(hote){
  const tete = document.createElement("div");
  tete.className = "titreReg";
  tete.innerHTML = '<span class="eyebrow"></span><span class="d"></span>';
  tete.querySelector(".eyebrow").textContent = "L'ordre des filtres";
  tete.querySelector(".d").textContent = "Le panneau qui se déplie sous la " +
    "recherche range ses filtres dans cet ordre. Mettez en tête ce par quoi un " +
    "visiteur de ce salon commence à trancher : c'est le seul filtre qu'il lise " +
    "sans dérouler. Les champs qui servent de filtre, eux, se cochent dans la " +
    "console, dans « Fiche détail ».";
  hote.appendChild(tete);

  /* La copie de travail. Elle part de l'ordre affiché, et non du réglage
     enregistré : celui-ci ne connaît peut-être pas un champ coché depuis, et
     « clesCriteres » lui a déjà rendu la place qui lui revient. */
  let cles = clesCriteres();

  const liste = document.createElement("div");
  liste.className = "ordreListe ordreCrit";
  liste.hidden = !cles.length;
  hote.appendChild(liste);

  const rien = document.createElement("p");
  rien.className = "videO";
  rien.textContent = cles.length
    ? "Un seul filtre : il n'y a pas d'ordre à régler."
    : "Aucun filtre : le panneau des critères ne s'ouvre pas. Les champs qui " +
      "servent de filtre se cochent dans la console, dans « Fiche détail ».";
  rien.hidden = cles.length > 1;
  hote.appendChild(rien);

  /* Le rang part en configuration, et le panneau se refait dans la foulée :
     ouvert derrière la fenêtre, il est le seul retour visible du geste. */
  const enregistre = () => {
    conf("_crit").ordre = cles.slice();
    enregistreConf();
    refaitCriteres();
  };

  /* Ce qu'on tire. Le dessin fait foi pendant le geste : le tableau n'est plus
     qu'un souvenir de ce qu'il était avant, et se relit au lâcher. */
  let tire = null;

  /* Les flèches des deux bouts s'éteignent : sans cela, le premier filtre
     garderait un « monter » actif alors qu'il est déjà en tête. */
  const majBouts = () => {
    [...liste.children].forEach((el, i, tous) => {
      const b = el.querySelectorAll("button.fleche");
      b[0].disabled = i === 0;
      b[1].disabled = i === tous.length - 1;
    });
  };

  liste.addEventListener("dragover", ev => {
    if (!tire) return;
    // sans quoi le navigateur refuse le dépôt et rejoue l'animation de retour
    ev.preventDefault();
    const apres = [...liste.children].find(d => {
      if (d === tire) return false;
      const r = d.getBoundingClientRect();
      /* On vise le milieu de la ligne, et non son bord : le bord ferait
         basculer l'insertion dès qu'on l'effleure, et la liste tremblerait
         sous le curseur au lieu de le suivre. */
      return ev.clientY < r.top + r.height / 2;
    }) || null;
    if (apres === tire.nextSibling || apres === tire) return;
    liste.insertBefore(tire, apres);
    majBouts();
  });

  /* Déplacer d'un rang, puis rendre la main à la flèche qu'on vient
     d'actionner : remonter un filtre de quatre rangs demande quatre clics, et
     le suivant doit tomber au même endroit. */
  const deplace = (cle, pas, sens) => {
    const i = cles.indexOf(cle), j = i + pas;
    if (i < 0 || j < 0 || j >= cles.length) return;
    cles.splice(j, 0, cles.splice(i, 1)[0]);
    rendu({ cle, sens });
    enregistre();
  };

  /** Ce qui distingue deux filtres de même intitulé : d'où le champ vient. */
  const origine = (cle) => cle === CLE_SECTEUR ? "vient du plan"
    : cle.indexOf(PREFIXE_PERSO) === 0 ? "propre au salon" : "";

  const ligne = (cle) => {
    const libelle = libelleCritere(cle);
    const d = document.createElement("div");
    d.className = "ordreLigne";
    d.dataset.cle = cle;
    d.draggable = true;

    const poi = document.createElement("span");
    poi.className = "prise";
    poi.setAttribute("aria-hidden", "true");
    poi.textContent = "⠿";
    d.appendChild(poi);

    const l = document.createElement("span");
    l.className = "lib";
    l.textContent = libelle;
    d.appendChild(l);

    const e = document.createElement("span");
    e.className = "etiq";
    e.textContent = origine(cle);
    d.appendChild(e);

    /** @type {[string, number, number][]} */ ([["Monter", -1, 0], ["Descendre", 1, 1]]).forEach(([titre, pas, sens]) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "outil fleche";
      b.textContent = pas < 0 ? "▲" : "▼";
      b.title = titre;
      b.setAttribute("aria-label", titre + " " + libelle);
      b.onclick = () => deplace(cle, pas, sens);
      d.appendChild(b);
    });

    d.ondragstart = ev => {
      /* Firefox n'ouvre pas de glissé sans donnée transportée, et le texte
         déposé ailleurs vaut mieux que la clé technique. */
      ev.dataTransfer.setData("text/plain", libelle);
      ev.dataTransfer.effectAllowed = "move";
      tire = d;
      // la classe se pose au tour suivant : posée tout de suite, elle entrerait
      // dans l'image que le navigateur vient de prendre de la ligne
      setTimeout(() => d.classList.add("tire"), 0);
    };
    d.ondragend = () => {
      d.classList.remove("tire");
      tire = null;
      const avant = JSON.stringify(cles);
      cles = /** @type {HTMLElement[]} */ ([...liste.children]).map(el => el.dataset.cle);
      // un glissé qui n'a rien déplacé n'a rien à enregistrer
      if (JSON.stringify(cles) === avant) return;
      rendu();
      enregistre();
    };
    return d;
  };

  const rendu = (focus) => {
    liste.textContent = "";
    cles.forEach(cle => liste.appendChild(ligne(cle)));
    majBouts();
    if (!focus) return;
    const el = liste.querySelector('[data-cle="' + CSS.escape(focus.cle) + '"]');
    if (!el) return;
    const b = el.querySelectorAll("button.fleche");
    if (b[focus.sens] && !b[focus.sens].disabled) b[focus.sens].focus();
  };

  rendu();
}
