/* ============================================================
   La fiche d'une zone organisateur — ce que l'exploitant en écrit

   Le formulaire d'une zone (libellé, type, traversée, salles, logo,
   description, lien), son enregistrement sur l'événement, le masquage d'une
   zone, et l'écriture des colonnes de l'événement que d'autres réglages
   empruntent. Avec eux, deux pièces que les autres réglages reprennent : le
   champ intitulé (`champZone`) et le cadre de dépôt d'un logo (`cadreLogo`).

   Un module de l'administration : `plan-admin.mjs` l'embarque, le visiteur ne
   le reçoit jamais — le crayon et la pastille qui y mènent ne paraissent
   qu'en administration (`_fiche.html`). Ce que le code soudé tient encore —
   la configuration, l'index de recherche — lui est confié par
   `brancheFicheZone`, que `_mode-admin.html` appelle à la place que ce code y
   tenait. Les types de zone, le cartouche des points d'intérêt et le dessin
   des noms s'importent (`reperes.mjs`, `points-interet.mjs`, `libelles.mjs`).
   ============================================================ */
import { $ } from "./dom.mjs";
import { esc } from "./texte.mjs";
import { DATA, parId, state } from "./donnees.mjs";
import { accesBase, base } from "./session.mjs";
import { adresseSure, imageSure, assainitRiche } from "./sur.mjs";
import { ouvreModale, poseAvantFermeture } from "./fenetre.mjs";
import { oublieGrilles } from "./itineraire.mjs";
import { reduitLogo } from "./depot-image.mjs";
import { cleAjout, rechAjout } from "./emplacements.mjs";
import { nomsAnglaisDesZones } from "./noms-zones.mjs";
import { rangeConferences } from "./index-salon.mjs";
import { annonce } from "./demarrage.mjs";
import { ouvre } from "./fiche.mjs";
import { libelles } from "./libelles.mjs";
import { TYPES_ZONE, typeZone } from "./reperes.mjs";
import { cartouchePoi } from "./points-interet.mjs";

/* Ce que le code soudé confie au branchement. Ce qui change — les réglages
   (`CONF`, que le changement de salon remplace) — se lit à l'instant. */
/**
 * @typedef {object} PageFicheZone
 * @property {() => Record<string, any>} conf les réglages du moment, `CONF`
 * @property {() => void} enregistreConf
 * @property {() => void} liste
 * @property {() => void} majPaletteGeo
 */
/** @type {PageFicheZone} */
let soude;
const reglages = () => soude.conf();
const enregistreConf = () => soude.enregistreConf();
const liste = () => soude.liste();
const majPaletteGeo = () => soude.majPaletteGeo();

/**
 * Appelé par le code soudé à la place que ce code tenait (`_mode-admin.html`),
 * dans une tranche que le visiteur ne reçoit pas.
 *
 * @param {PageFicheZone} page
 */
export function brancheFicheZone(page){
  soude = page;
}

/* ============================================================
   La fiche d'une zone organisateur
   Une zone tire son nom de Klipso, ou des textes posés sur le plan. Quand ni
   l'un ni l'autre ne donne rien — les vingt-deux zones de Franchise Expo
   s'affichent « Zone sans nom » — il faut pouvoir le saisir.

   Et le nom est souvent tout ce qu'elle a : la source ne dit rien d'autre
   d'un espace de restauration, d'une agora ou d'une halte-garderie, qui ont
   pourtant des horaires, un contenu, une page où s'inscrire. Une zone est donc
   la seule chose du plan dont la fiche s'écrit à la main : un libellé, une
   description mise en forme, un lien.

   Le même formulaire s'ouvre de deux endroits — du crayon posé sur la fiche,
   et de la liste des zones dans les réglages, quand on les reprend l'une après
   l'autre sans avoir à les retrouver sur le plan.

   La fiche est enregistrée sur l'événement, pas dans le navigateur : c'est le
   visiteur qui doit la lire. Et elle s'applique à la lecture, si bien qu'elle
   paraît sans attendre la prochaine synchronisation.
   ============================================================ */

/**
 * Un champ du formulaire : son intitulé, ce qu'on y saisit, et la ligne d'aide
 * qui dit ce qu'il devient. Les trois vont ensemble — un champ sans son aide
 * se remplit au jugé.
 */
export function champZone(hote, titre, dedans, aide){
  const bloc = document.createElement("div");
  bloc.className = "champZ";
  const l = document.createElement("span");
  l.className = "tZ";
  l.textContent = titre;
  bloc.appendChild(l);
  bloc.appendChild(dedans);
  if (aide){
    const a = document.createElement("span");
    a.className = "aideZ";
    a.textContent = aide;
    bloc.appendChild(a);
  }
  hote.appendChild(bloc);
  return dedans;
}

/**
 * Les champs d'une zone, posés dans « hote ».
 *
 * Rend de quoi les relire au moment d'enregistrer, plutôt que d'écrire à
 * chaque frappe : une description se rédige, et la sauver en cours de phrase
 * la publierait à moitié faite.
 */
export function champsZone(hote, o){
  /* Le libellé et la description se saisissent dans les deux langues, et les
     deux champs paraissent quelle que soit la langue de l'écran : l'exploitant
     qui travaille en anglais écrit aussi le français, et inversement. */
  const libelle = champZone(hote, "Libellé en français", document.createElement("input"),
    "Le nom de la zone, sur le plan comme sur sa fiche. Laissez vide pour " +
    "revenir au nom d'origine, s'il y en a un.");
  libelle.type = "text";
  libelle.value = (DATA.nomsZones || {})[o.id] || o.nom || "";
  libelle.placeholder = "Agora, Halte-garderie, Pitch Retail…";
  libelle.lang = "fr";

  const libelleEn = champZone(hote, "Libellé en anglais", document.createElement("input"),
    "Le nom de la zone dans la version anglaise du plan. Laissé vide, c'est le " +
    "libellé en français qui s'y affiche.");
  libelleEn.type = "text";
  libelleEn.value = o.nom_en || "";
  libelleEn.placeholder = "Agora, Childcare, Pitch Retail…";
  libelleEn.lang = "en";

  /* Le type ne décrit pas la zone, il dit à quoi elle sert : c'est ce qu'un
     visiteur cherche quand il cherche où déjeuner, et ce qu'aucun intitulé de
     salon ne dit — « Atmosphère Mobilité » ne se devine pas. */
  const type = champZone(hote, "Type", document.createElement("select"),
    "Ouvre l'entrée correspondante dans le cartouche des points d'intérêt, au " +
    "bas du plan : le visiteur y retrouve d'un geste toutes les zones du même " +
    "type. Sans type, la zone reste sur le plan comme aujourd'hui.");
  type.innerHTML = TYPES_ZONE.map(t =>
    '<option value="' + esc(t.v) + '">' + esc(t.nom) + "</option>").join("");
  type.value = (typeZone(o) || {}).v || "";

  /* Une zone est un mur pour le calcul d'itinéraire, et c'est juste d'une
     réserve, faux d'un accueil qu'on traverse de part en part. Le contour ne
     dit pas lequel des deux : on le demande. */
  const passe = document.createElement("label");
  passe.className = "cocheZ";
  passe.innerHTML = '<input type="checkbox"><span></span>';
  passe.querySelector("span").textContent = "L'itinéraire peut la traverser";
  const traverse = passe.querySelector("input");
  traverse.checked = !!o.traversable;
  champZone(hote, "Itinéraire", passe,
    "Les trajets coupent par cette zone au lieu d'en faire le tour. À cocher " +
    "sur un accueil, une agora, une esplanade — tout sol qu'on franchit à " +
    "pied. À laisser décoché sur une réserve, un local technique, un espace " +
    "clos : le trajet les contourne, comme un stand.");

  const salles = champSalles(hote, o);

  const logo = champLogo(hote, o);

  const riche = editeurRiche(o.description || "");
  riche.cadre.lang = "fr";
  champZone(hote, "Description en français", riche.cadre,
    "Ce qu'on trouve dans cette zone, ses horaires, ses conditions d'accès. " +
    "Le libellé « Description » ne paraît sur la fiche que si vous en écrivez une.");

  const richeEn = editeurRiche(o.description_en || "");
  richeEn.cadre.lang = "en";
  champZone(hote, "Description en anglais", richeEn.cadre,
    "Ce que lit le visiteur de la version anglaise. Laissée vide, la fiche " +
    "anglaise montre la description en français.");

  const lienZ = champZone(hote, "Lien", document.createElement("input"),
    "Une page où en savoir plus. Elle s'ouvre dans un nouvel onglet, et " +
    "n'apparaît sur la fiche que si vous en donnez une.");
  lienZ.type = "url";
  lienZ.placeholder = "https://…";
  lienZ.value = o.lien || "";

  return () => ({ libelle: libelle.value, libelleEn: libelleEn.value,
                  type: type.value, logo: logo(),
                  description: riche.lit(), descriptionEn: richeEn.lit(), lien: lienZ.value,
                  traversable: traverse.checked,
                  salles: salles ? salles() : null });
}

/**
 * Les salles de conférence que cette zone abrite.
 *
 * Une salle du programme s'appelle « Agora (P160) » : le code entre
 * parenthèses est un emplacement du plan, et la synchronisation retrouve la
 * zone qui le contient — dix fois sur onze sur Franchise Expo. La onzième
 * porte un code absent du plan, et rien ne le devinera : elle se désigne ici,
 * à la main, sur la zone qui l'accueille.
 *
 * Tout le programme est montré, et pas seulement ce qui revient déjà à cette
 * zone : c'est de là qu'on voit ce qui n'est encore nulle part. La liste est
 * courte — une dizaine de salles pour un salon qui en a.
 *
 * Une salle n'est que dans une zone à la fois : la cocher ici la retire de là
 * où elle était, ce que sa ligne disait avant qu'on ne la coche.
 */
function champSalles(hote, o){
  const salles = DATA.salles || {};
  /* Sans nom, une salle ne se distingue pas de la suivante ; l'ordre est celui
     du programme, et il ne bouge pas quand on coche — une liste qui se
     réordonne sous le doigt fait cocher la voisine. */
  const ids = Object.keys(salles).sort((a, b) =>
    String(salles[a].nom || "").localeCompare(String(salles[b].nom || ""), "fr"));
  // sans programme, il n'y a rien à rattacher : le champ n'aurait qu'un vide
  if (!ids.length) return null;

  const liste = document.createElement("div");
  liste.className = "sallesZ";
  const coches = new Map();

  ids.forEach(id => {
    const s = salles[id];
    const l = document.createElement("label");
    l.innerHTML = '<input type="checkbox"><span class="nS"></span>' +
                  '<span class="cS"></span><span class="eS"></span>';
    const c = l.querySelector("input");
    c.checked = s.zone === o.id;
    l.querySelector(".nS").textContent = s.nom || id;
    l.querySelector(".cS").textContent = s.code || "";
    const etat = l.querySelector(".eS");
    /* Ce que la ligne dit d'elle-même : d'où vient ce qui est coché, et où est
       partie une salle qui ne l'est pas. « Trouvée automatiquement » se lit de
       la proposition et non de la marque « manuel » : une salle qu'on a cochée
       là où la synchronisation la mettait est au même endroit qu'elle. */
    const dis = () => {
      const ailleurs = !c.checked && s.zone && s.zone !== o.id;
      etat.textContent = c.checked
        ? (s.auto === o.id ? "trouvée automatiquement" : "choisie à la main")
        : ailleurs ? "rattachée à " + nomDeZone(s.zone)
        : "à situer";
      etat.dataset.genre = c.checked ? (s.auto === o.id ? "auto" : "manuel")
        : ailleurs ? "libre" : "manque";
    };
    dis();
    c.onchange = dis;
    coches.set(id, c);
    liste.appendChild(l);
  });

  champZone(hote, "Salles de conférence", liste,
    "Le programme du salon, salle par salle. Cochez celles qui se tiennent " +
    "dans cette zone : leurs conférences paraissent aussitôt sur sa fiche. " +
    "Un rattachement choisi ici n'est plus modifié par les synchronisations " +
    "suivantes.");
  return () => ids.filter(id => coches.get(id).checked);
}

/** Le nom d'une zone, pour le dire ailleurs que sur elle-même. */
function nomDeZone(id){
  const z = parId.get(id);
  // une zone que le plan n'a plus : le rattachement lui survit, et le dire
  // vaut mieux que de laisser croire à une zone qu'on pourrait aller voir
  if (!z) return "une zone absente du plan";
  return z.nom || "une zone sans nom";
}


/* Le logo déposé, ramené à ce qu'une fiche affiche : `modules/depot-image.mjs`
   `reduitLogo`. */


/**
 * Le cadre où l'on dépose un logo : la vignette, les deux boutons, le poids de
 * ce qu'on vient de choisir.
 *
 * Deux endroits déposent une image de la même façon — la fiche d'une zone et le
 * sponsor du salon — et ne diffèrent que par le moment où elle s'écrit : la
 * fiche relit la sienne en sortant, un réglage enregistre au choix. D'où
 * « pose », appelée à chaque changement pour qui écrit tout de suite, et la
 * lecture rendue pour qui relit à la fin.
 *
 * La vignette est aussi la cible du glisser-déposer : c'est le geste qu'on fait
 * devant elle, et il évite la boîte de dialogue du système.
 */
export function cadreLogo(depart, pose){
  let logo = imageSure(depart);

  const cadre = document.createElement("div");
  cadre.className = "logoZ";
  const vue = document.createElement("div");
  vue.className = "vue";
  const actes = document.createElement("div");
  actes.className = "actes";
  const choisir = document.createElement("button");
  choisir.type = "button";
  const oter = document.createElement("button");
  oter.type = "button";
  oter.textContent = "Retirer";
  const dit = document.createElement("span");
  dit.className = "ditZ";
  const fichier = document.createElement("input");
  fichier.type = "file";
  fichier.accept = "image/*";
  fichier.hidden = true;
  actes.appendChild(choisir);
  actes.appendChild(oter);
  actes.appendChild(dit);
  cadre.appendChild(vue);
  cadre.appendChild(actes);
  cadre.appendChild(fichier);

  /* Le poids annoncé est celui du data-URI, non celui du fichier d'origine :
     c'est lui qui part chez le visiteur, et il pèse un tiers de plus — quatre
     caractères de base64 pour trois octets, d'où le diviseur. */
  const peint = (mot) => {
    vue.innerHTML = logo ? '<img alt="">' : '<span>Aucun logo</span>';
    if (logo) vue.querySelector("img").src = logo;
    choisir.textContent = logo ? "Remplacer…" : "Choisir un fichier…";
    oter.hidden = !logo;
    dit.dataset.mal = "false";
    dit.textContent = mot !== undefined ? mot
      : logo ? Math.round(logo.length / 1365) + " Ko" : "";
  };

  const prend = (f) => {
    if (!f) return;
    peint("Lecture…");
    reduitLogo(f).then(src => { logo = src; peint(); if (pose) pose(logo); }).catch(e => {
      dit.textContent = "Échec : " + e.message;
      dit.dataset.mal = "true";
    });
  };

  choisir.onclick = () => fichier.click();
  fichier.onchange = () => { prend(fichier.files[0]); fichier.value = ""; };
  oter.onclick = () => { logo = ""; peint(); if (pose) pose(logo); };
  vue.addEventListener("dragover", e => { e.preventDefault(); vue.dataset.survol = "1"; });
  vue.addEventListener("dragleave", () => { delete vue.dataset.survol; });
  vue.addEventListener("drop", e => {
    e.preventDefault();
    delete vue.dataset.survol;
    prend(e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]);
  });

  peint();
  return { cadre: cadre, lit: () => logo };
}

/**
 * Le champ du logo d'une zone.
 *
 * Il se lit comme les autres champs de la fiche — on le remplit, on quitte, il
 * part — d'où la même forme : ce qu'il rend est relu à la sortie, et non écrit
 * au moment du choix. Une image posée puis retirée sans quitter la fiche n'aura
 * donc rien écrit du tout.
 */
function champLogo(hote, o){
  const c = cadreLogo(o.logo);
  champZone(hote, "Logo", c.cadre,
    "L'image paraît dans l'en-tête de la fiche, au-dessus du type et du nom. " +
    "Elle est " +
    "réduite puis enregistrée dans la fiche : elle part avec le plan, sans " +
    "dépendre d'un fichier hébergé ailleurs. Glissez-la sur la vignette, ou " +
    "choisissez-la.");
  return c.lit;
}

/* Ce que la barre de l'éditeur propose. Rien de plus que de la mise en forme :
   une description de zone est un paragraphe et deux listes, pas une page à
   composer — et tout ce qui n'est pas ici serait de toute façon retiré à
   l'affichage. */
const OUTILS_RICHE = [
  { cmd: "bold", signe: "G", titre: "Gras", style: "font-weight:700" },
  { cmd: "italic", signe: "I", titre: "Italique", style: "font-style:italic" },
  { cmd: "insertUnorderedList", signe: "•", titre: "Liste à puces" },
  { cmd: "insertOrderedList", signe: "1.", titre: "Liste numérotée" },
];

/**
 * L'éditeur de la description.
 *
 * Une zone de saisie ordinaire aurait rendu un bloc de texte : or ce qu'on
 * écrit là — des horaires, ce qu'on y trouve, comment s'y inscrire — se lit
 * en paragraphes et en listes. D'où un éditeur, réduit à ce que la fiche sait
 * afficher : gras, italique, listes, liens.
 *
 * Il s'appuie sur « execCommand », que les navigateurs disent déprécié depuis
 * dix ans et qu'aucun n'a retiré : c'est cela, ou réécrire à la main la mise en
 * forme d'une sélection, pour un champ que l'exploitant remplit trois fois.
 *
 * Ce qui est collé arrive en texte nu : coller depuis un traitement de texte
 * apportait sa feuille de style entière, dont il ne restait rien après relecture
 * — l'éditeur montrait alors une mise en forme que la fiche n'affichait pas.
 */
function editeurRiche(html){
  const cadre = document.createElement("div");
  cadre.className = "edrich";
  const barre = document.createElement("div");
  barre.className = "barre";
  const zone = document.createElement("div");
  zone.className = "zone";
  zone.contentEditable = "true";
  zone.setAttribute("role", "textbox");
  zone.setAttribute("aria-multiline", "true");
  zone.setAttribute("aria-label", "Description de la zone");
  zone.dataset.vide = "Ce qu'on trouve dans cette zone, ses horaires…";
  zone.innerHTML = assainitRiche(html);

  /* Chrome sépare les lignes par des « div », Firefox par des « br » : sans
     cette demande, deux navigateurs produisent deux balisages pour le même
     texte. Elle échoue silencieusement là où elle n'est pas comprise, et la
     relecture ramène de toute façon les deux au paragraphe. */
  try { document.execCommand("defaultParagraphSeparator", false, "p"); } catch (e) {}

  const marques = [];
  const majMarques = () => marques.forEach(m => {
    let on = false;
    try { on = document.queryCommandState(m.cmd); } catch (e) {}
    m.el.setAttribute("aria-pressed", String(on));
  });

  const bouton = (signe, titre) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = signe;
    b.title = titre;
    b.setAttribute("aria-label", titre);
    /* Un bouton qui prend le focus emporte la sélection avec lui : la commande
       s'appliquerait alors à rien. On lui refuse le focus plutôt que de
       relever et reposer la sélection à chaque clic. */
    b.onmousedown = e => e.preventDefault();
    barre.appendChild(b);
    return b;
  };

  OUTILS_RICHE.forEach(t => {
    const b = bouton(t.signe, t.titre);
    if (t.style) b.style.cssText = t.style;
    b.setAttribute("aria-pressed", "false");
    b.onclick = () => {
      zone.focus();
      try { document.execCommand(t.cmd, false, null); } catch (e) {}
      majMarques();
    };
    marques.push({ cmd: t.cmd, el: b });
  });

  /* Poser un lien demande une adresse, qu'il faut bien saisir quelque part :
     une seconde fenêtre par-dessus celle des réglages fermerait la première —
     la page n'en tient qu'une — d'où cette rangée, qui se déplie sous la barre
     et rend la main au texte. */
  const rangee = document.createElement("div");
  rangee.className = "lienbarre";
  rangee.hidden = true;
  const url = document.createElement("input");
  url.type = "url";
  url.placeholder = "https://…";
  rangee.appendChild(url);
  let plage = null;

  /* La sélection du moment, mise de côté : le temps de taper une adresse, le
     focus a quitté le texte, et avec lui ce sur quoi le lien devait porter. */
  const retientPlage = () => {
    const s = getSelection();
    plage = s && s.rangeCount && zone.contains(s.getRangeAt(0).commonAncestorContainer)
      ? s.getRangeAt(0).cloneRange() : null;
  };
  const reposePlage = () => {
    zone.focus();
    if (!plage) return;
    const s = getSelection();
    s.removeAllRanges();
    s.addRange(plage);
  };

  const poser = document.createElement("button");
  poser.type = "button";
  poser.className = "ok";
  poser.textContent = "Poser";
  poser.onclick = () => {
    const u = adresseSure(url.value);
    if (!u){ url.focus(); url.select(); return; }
    reposePlage();
    const s = getSelection();
    try {
      /* Un lien posé sans rien avoir sélectionné n'aurait pas de texte à
         porter : c'est l'adresse elle-même qui en tient lieu. */
      if (s && s.isCollapsed) document.execCommand("insertHTML", false,
        '<a href="' + esc(u) + '">' + esc(u.replace(/^https?:\/\//i, "")) + "</a>");
      else document.execCommand("createLink", false, u);
    } catch (e) {}
    rangee.hidden = true;
    url.value = "";
  };
  rangee.appendChild(poser);

  const retirer = document.createElement("button");
  retirer.type = "button";
  retirer.textContent = "Retirer";
  retirer.onclick = () => {
    reposePlage();
    try { document.execCommand("unlink", false, null); } catch (e) {}
    rangee.hidden = true;
  };
  rangee.appendChild(retirer);

  const bLien = bouton("Lien", "Poser un lien sur le texte choisi");
  bLien.className = "lg";
  bLien.onclick = () => {
    retientPlage();
    rangee.hidden = !rangee.hidden;
    if (!rangee.hidden) setTimeout(() => url.focus(), 20);
  };

  zone.addEventListener("paste", e => {
    e.preventDefault();
    const t = (e.clipboardData || window.clipboardData).getData("text/plain");
    try { document.execCommand("insertText", false, t); } catch (err) {}
  });
  ["keyup", "mouseup", "focus"].forEach(ev => zone.addEventListener(ev, majMarques));

  cadre.appendChild(barre);
  cadre.appendChild(rangee);
  cadre.appendChild(zone);

  return {
    cadre: cadre,
    /* Ce qui sera enregistré : relu ici comme il le sera à l'affichage, et
       ramené à rien s'il ne reste que le paragraphe vide qu'un éditeur vidé
       laisse derrière lui — sans quoi la fiche annoncerait une description
       qui ne dit rien. */
    lit: () => {
      const h = assainitRiche(zone.innerHTML);
      const d = document.createElement("div");
      d.innerHTML = h;
      return d.textContent.trim() ? h : "";
    },
  };
}

/* La fiche de zone en cours de saisie, et ce qu'elle valait en arrivant.
 *
 * Elle n'a pas de bouton d'enregistrement : on ne valide pas une fiche qu'on
 * est en train d'écrire, on la quitte — en passant à une autre zone, à un autre
 * onglet, ou en fermant la fenêtre par où l'on veut. Reste à savoir ce qui a
 * changé, sinon chaque zone seulement regardée serait réécrite : d'où l'état
 * de départ, relevé par le même chemin que celui qu'on comparera. */
let ficheZoneEnCours = null;

/* Les salles cochées se comparent telles quelles : ce sont deux listes des
   mêmes identifiants, dans l'ordre du programme, qui ne bouge pas. */
const memeFicheZone = (a, b) => Boolean(a && b && a.libelle === b.libelle &&
  a.libelleEn === b.libelleEn && a.descriptionEn === b.descriptionEn &&
  a.type === b.type && a.description === b.description && a.lien === b.lien &&
  a.logo === b.logo && a.traversable === b.traversable &&
  String(a.salles) === String(b.salles));

/** Suit la fiche qui vient de paraître : c'est elle qu'on versera en sortant. */
export function suitFicheZone(o, valeurs, etat, apres){
  ficheZoneEnCours = { o, valeurs, etat, apres, depart: valeurs() };
  /* La fenêtre peut se fermer de quatre façons, et par une cinquième quand une
     autre prend sa place : toutes passent par « verseModale ». */
  poseAvantFermeture(() => { verseFicheZone(); ficheZoneEnCours = null; });
}

/** Enregistre la fiche ouverte, si et seulement si elle a changé. */
export function verseFicheZone(){
  const f = ficheZoneEnCours;
  if (!f) return;
  const v = f.valeurs();
  if (memeFicheZone(v, f.depart)) return;
  /* Ce qui part devient l'état de départ tout de suite : la fenêtre se ferme
     avant que la base ait répondu, et deux sorties ne doivent pas envoyer deux
     fois la même chose. Un échec le remet en jeu. */
  const depart = f.depart;
  f.depart = v;
  if (f.etat){ f.etat.textContent = "Enregistrement…"; f.etat.dataset.mal = "false"; }
  enregistreZone(f.o, v, depart).then(() => {
    if (f.etat) f.etat.textContent = "Enregistré.";
    if (f.apres) f.apres();
  }).catch(e => {
    if (f.etat){ f.etat.textContent = "Échec : " + e.message; f.etat.dataset.mal = "true"; }
    /* Fenêtre fermée, la ligne d'état est partie avec elle : l'échec se dit
       alors sur le plan, seul endroit encore sous les yeux. */
    if (!$("modale").classList.contains("open"))
      annonce("Enregistrement de la zone impossible : " + e.message, true);
    // ce qui n'est pas passé reste à écrire : la prochaine sortie réessaiera
    if (f.depart === v) f.depart = null;
  });
}

/** La fiche d'une zone, ouverte du crayon posé sur la fiche du plan. */
export function ficheZone(o){
  ouvreModale(o.nom || "Zone sans nom", corps => {
    const valeurs = champsZone(corps, o);
    const etat = document.createElement("p");
    etat.className = "etatZ seul";
    corps.appendChild(etat);
    suitFicheZone(o, valeurs, etat);
  }, [{ libelle: "Fermer" }], "large");
}

/**
 * Enregistrer la fiche d'une zone.
 *
 * Le libellé et le reste ne vivent pas dans la même colonne — le premier
 * s'applique au plan, où il nomme la forme, les autres n'existent que sur la
 * fiche — mais ils se saisissent ensemble : ils partent donc en une seule
 * écriture, sans quoi un enregistrement à moitié passé laisserait le nom
 * changé et la description perdue.
 *
 * « depart » dit ce que la fiche valait en s'ouvrant. Le champ du libellé
 * arrive rempli du nom en place, qui vient souvent de la source : l'écrire
 * sans y avoir touché le figerait en nom choisi, et une zone renommée chez
 * l'organisateur garderait ici son ancien nom pour toujours. Un champ qu'on
 * n'a pas touché ne touche donc pas à sa colonne.
 */
async function enregistreZone(o, v, depart){
  if (o.ajout) return enregistreZoneAjoutee(o, v, depart);
  const nom = String(v.libelle || "").trim();
  const description = String(v.description || "");
  /* La version anglaise se range dans la fiche, avec le reste de ce que
     l'exploitant écrit : elle ne s'applique pas au plan d'origine, elle
     s'affiche à la place du français pour qui lit l'anglais. */
  const nomEn = String(v.libelleEn || "").trim();
  const descriptionEn = String(v.descriptionEn || "");
  // un type que la page ne connaît pas n'ouvrirait aucune entrée au cartouche
  const genre = TYPES_ZONE.some(t => t.v && t.v === v.type) ? v.type : "";
  // ce qui n'est pas une adresse tenable n'est pas enregistré : la fiche
  // n'aurait qu'un lien mort à montrer
  const adresse = adresseSure(v.lien);
  /* Le logo est relu avant de partir comme il le sera avant de paraître : ce
     qui n'est pas une image fabriquée ici n'a rien à faire dans la colonne. */
  const blason = imageSure(v.logo);
  const renomme = !depart || String(depart.libelle || "").trim() !== nom;
  /* Les salles cochées. Leur colonne n'est pas indexée par zone mais par
     salle, et c'est la zone qu'on y écrit — d'où le détour. On n'y touche que
     si une coche a bougé : une description corrigée ne doit pas réécrire un
     rattachement qu'un autre poste vient de changer. */
  const salles = Array.isArray(v.salles) ? v.salles : null;
  const rattache = salles && (!depart || String(depart.salles) !== String(salles));
  /* La traversée a sa colonne, comme le masquage : elle ne décrit pas ce que
     le visiteur lit sur la zone mais ce que le calcul a le droit d'en faire.
     On n'y touche que si la case a bougé. */
  const traverse = !!v.traversable;
  const ouvre_ = !depart || !!depart.traversable !== traverse;
  const rattacheSalles = (t) => Object.keys(t).forEach(id => {
    const s = t[id];
    const ici = salles.indexOf(id) >= 0;
    // une salle qui est déjà où on la veut n'a pas à être réécrite : le choix
    // d'une zone ne touche pas au rattachement des salles des autres
    if (!s || ici === (s.zone === o.id)) return;
    s.zone = ici ? o.id : null;
    /* « manuel » protège du prochain rattachement automatique. Retirer d'ici
       une salle que la synchronisation y avait posée est un choix comme un
       autre : sans cette marque, elle y reviendrait à la synchronisation
       suivante. */
    s.manuel = ici ? s.zone !== s.auto : Boolean(s.auto);
  });
  /* La fiche de la zone suivante s'ouvre avant que la base ait répondu, et le
     plan se redessine dans la foulée : tous deux doivent lire le rattachement
     qu'on vient de choisir, pas celui d'avant. L'écriture dira le dernier mot,
     et « rattacheSalles » ne fait rien deux fois. */
  if (rattache){ rattacheSalles(DATA.salles); rangeConferences(); }
  const tables = await ecritColonnesEvenement([
    ...(renomme ? [{ colonne: "zones", secours: DATA.nomsZones, change: t => {
        if (nom) t[o.id] = nom; else delete t[o.id];
      } }] : []),
    { colonne: "zones_fiches", secours: DATA.fichesZones, change: t => {
        const fiche = {};
        if (genre) fiche.type = genre;
        if (blason) fiche.logo = blason;
        if (description) fiche.description = description;
        if (nomEn) fiche.nom_en = nomEn;
        if (descriptionEn) fiche.description_en = descriptionEn;
        if (adresse) fiche.lien = adresse;
        // une fiche vidée sort de la table plutôt que d'y rester en creux
        if (Object.keys(fiche).length) t[o.id] = fiche; else delete t[o.id];
      } },
    ...(rattache
      ? [{ colonne: "salles", secours: DATA.salles, change: rattacheSalles }]
      : []),
    ...(ouvre_
      ? [{ colonne: "zones_traversables", secours: DATA.zonesTraversables,
           change: t => { if (traverse) t[o.id] = true; else delete t[o.id]; } }]
      : []),
  ]);
  if (tables.zones) DATA.nomsZones = tables.zones;
  DATA.fichesZones = tables.zones_fiches;
  /* Le programme d'une zone se lit d'un index rangé au chargement : la salle
     qu'on vient de lui rattacher n'y est pas, et attendre la synchronisation
     pour la voir arriver ferait douter du clic. */
  if (tables.salles){ DATA.salles = tables.salles; rangeConferences(); }
  if (tables.zones_traversables) DATA.zonesTraversables = tables.zones_traversables;
  if (ouvre_){
    o.traversable = traverse || undefined;
    /* La grille de marche est gardée d'un trajet à l'autre : elle porte encore
       la zone en mur, et le trajet suivant referait le tour. */
    oublieGrilles();
  }
  if (renomme){
    // le nom d'origine n'est pas perdu : on le garde pour pouvoir y revenir
    if (o.origine === undefined) o.origine = o.nom;
    o.nom = nom || o.origine || null;
  }
  o.description = description;
  o.nom_en = nomEn || undefined;
  o.description_en = descriptionEn || undefined;
  nomsAnglaisDesZones();
  o.lien = adresse;
  o.logo = blason;
  o.type = genre;
  // le nom se lit aussi sur le plan et dans la liste, où on le cherche, dans les deux langues
  o.rech = (String(o.nom || "") + " " + String(o.nom_en || "")).toLowerCase();
  libelles(); liste();
  // le cartouche gagne ou perd une entrée selon le type qu'on vient de poser
  cartouchePoi();
  // la fiche ouverte sur cette zone montre déjà l'ancienne version
  if (state.sel === o.id) ouvre(o, null);
}


/**
 * La fiche d'une zone ajoutée à la main, rangée avec sa forme.
 *
 * Les colonnes de l'événement ne valent que pour les zones de la source : le
 * serveur ne les applique qu'à celles-là. Celle-ci garde donc tout dans son
 * entrée de configuration (`emplacements.mjs`), et part aux visiteurs à la
 * publication, avec le reste de l'apparence.
 */
async function enregistreZoneAjoutee(o, v, depart){
  const r = reglages()[cleAjout(o.id)];
  if (!r) return;
  const fiche = {
    nom_en: String(v.libelleEn || "").trim(),
    type: TYPES_ZONE.some(t => t.v && t.v === v.type) ? v.type : "",
    description: String(v.description || ""),
    description_en: String(v.descriptionEn || ""),
    lien: adresseSure(v.lien),
    logo: imageSure(v.logo),
    traversable: !!v.traversable,
  };
  const nom = String(v.libelle || "").trim();
  if (nom) r.nom = nom; else delete r.nom;
  Object.keys(fiche).forEach(k => {
    if (fiche[k]) r[k] = o[k] = fiche[k];
    else { delete r[k]; o[k] = undefined; }
  });
  o.nom = nom || null;
  enregistreConf();
  oublieGrilles();
  nomsAnglaisDesZones();
  rechAjout(o);
  libelles(); liste();
  cartouchePoi();
  majPaletteGeo();
  if (state.sel === o.id) ouvre(o, null);
  /* Les salles font exception : leur colonne est indexée par salle, non par
     zone, et c'est le serveur qui rattache le programme — il reconnaît les
     zones ajoutées en relisant la configuration du pavillon. On l'écrit donc
     comme pour une zone de la source, et seulement si une coche a bougé —
     en dernier : un échec en base ne doit pas perdre le reste de la fiche,
     déjà rangé dans la configuration. */
  const salles = Array.isArray(v.salles) ? v.salles : null;
  if (salles && (!depart || String(depart.salles) !== String(salles))){
    const rattache = (t) => Object.keys(t).forEach(id => {
      const s = t[id];
      const ici = salles.indexOf(id) >= 0;
      if (!s || ici === (s.zone === o.id)) return;
      s.zone = ici ? o.id : null;
      s.manuel = ici ? s.zone !== s.auto : Boolean(s.auto);
    });
    rattache(DATA.salles || {});
    rangeConferences();
    const tables = await ecritColonnesEvenement([
      { colonne: "salles", secours: DATA.salles, change: rattache }]);
    if (tables.salles){ DATA.salles = tables.salles; rangeConferences(); }
    // la fiche ouverte montrait le programme d'avant la coche
    if (state.sel === o.id) ouvre(o, null);
  }
}

/* ============================================================
   Masquer une zone organisateur
   Toutes les zones que Klipso renvoie ne s'adressent pas au visiteur : un
   local technique, une réserve, un quai de livraison occupent le plan sans
   rien lui apprendre. L'exploitant les éteint une par une depuis leur fiche.

   Une zone éteinte ne part plus dans le plan public ; en administration elle
   reste, en teinte pâlie, car c'est de là qu'on revient sur son choix. Le
   masquage est enregistré sur l'événement, et s'applique à la lecture : il
   paraît sans attendre la prochaine synchronisation.
   ============================================================ */
export async function basculeAffichageZone(o){
  const masquer = !o.masquee;
  // une zone ajoutée à la main se masque dans son entrée, comme sa fiche
  const r = o.ajout && reglages()[cleAjout(o.id)];
  if (r){
    if (masquer) r.masquee = true; else delete r.masquee;
    o.masquee = masquer || undefined;
    enregistreConf();
    marqueZonesMasquees();
    libelles();
    ouvre(o, null);
    return;
  }
  try {
    const masques = await ecritColonneEvenement("zones_masquees", DATA.zonesMasquees, t => {
      if (masquer) t[o.id] = true; else delete t[o.id];
    });
    DATA.zonesMasquees = masques;
    o.masquee = masquer || undefined;
    marqueZonesMasquees();
    libelles();
    ouvre(o, null);
  } catch (e) {
    annonce("Changement impossible : " + e.message, true);
  }
}

/** La teinte pâlie des zones éteintes, reposée sur le plan en place. */
function marqueZonesMasquees(){
  document.querySelectorAll("#zones g").forEach(g => {
    const z = parId.get(g.dataset.id);
    g.classList.toggle("masquee", !!z && !!z.masquee);
  });
}


/**
 * Réécrire des colonnes jsonb de l'événement — les noms de zones, leurs
 * masquages, leurs fiches, le rangement de la fiche détail. Chacune tient d'un
 * seul tenant : la renvoyer telle que la page l'avait chargée effacerait ce
 * qu'un autre poste y a mis depuis. On repart donc de ce que la base contient
 * à l'instant, et « change » n'y touche que ce qui est en cause.
 *
 * Plusieurs colonnes à la fois quand elles se saisissent ensemble : la fiche
 * d'une zone tient à la fois du nom, qui s'écrit sur le plan, et du reste, qui
 * n'existe que sur la fiche. Deux écritures les auraient dissociées à la
 * première qui échoue.
 */
async function ecritColonnesEvenement(travaux){
  const acces = accesBase();
  if (!acces) throw new Error("session absente, reconnectez-vous");

  const colonnes = travaux.map(t => t.colonne).join(",");
  /* Les deux appels passent par `base` (_pousse.html), qui échange le jeton
     d'avance et refait l'appel sur un refus de jeton. Un jeton Supabase vit une
     heure, et cette page peut rester ouverte une matinée sans qu'aucun geste ne
     le renouvelle : la description d'une zone tapée à 10 h 30 partait alors
     dans un 401 que rien ne rattrapait — la fiche en cours étant déjà oubliée,
     le texte saisi n'existait plus nulle part. */
  const enBase = await base(acces,
    "evenement?select=" + colonnes + "&slug=eq." + encodeURIComponent(DATA.slug));

  const tables = {}, corps = { modifie_le: new Date().toISOString() };
  travaux.forEach(t => {
    /* `secours` ne vaut que pour une colonne vide en base. Une lecture manquée
       n'y retombe plus : `base` jette, et l'écriture n'a pas lieu. Repartir de
       ce que la page tenait à son ouverture, puis remplacer la colonne
       entière, effaçait les fiches qu'un collègue y avait mises depuis. */
    const table = { ...(enBase?.[0]?.[t.colonne] || t.secours || {}) };
    t.change(table);
    tables[t.colonne] = corps[t.colonne] = table;
  });

  await base(acces, "evenement?slug=eq." + encodeURIComponent(DATA.slug), {
    method: "PATCH",
    headers: { "Prefer": "return=minimal" },
    body: JSON.stringify(corps),
  });
  return tables;
}

/** La même chose pour une seule colonne, qui est le cas courant. */
export const ecritColonneEvenement = (colonne, secours, change) =>
  ecritColonnesEvenement([{ colonne, secours, change }]).then(t => t[colonne]);
