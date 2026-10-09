/* ============================================================
   Les volets Admin, Parcours intelligent, PMR, Distinctions et Apparence —
   l'exploitant seul

   Des onglets de la fenêtre des réglages que `reglages.mjs` ouvre : ce
   module n'est embarqué que par `plan-admin.mjs`, le visiteur ne le reçoit
   jamais. La fenêtre elle-même et ses autres volets sont dans `reglages.mjs`,
   ses aperçus dans `apercus.mjs`, le bloc du rappel dans
   `reglage-rappel.mjs` ; les dates et les heures du salon, posées dans
   l'onglet « Plan », sont ici avec le reste de ce que cette suite portait.

   Les règles que ces volets écrivent — commandes, langues, barre, seuil de
   concentration, dates et heures, distinctions, couleur, modèles et polices —
   sont des modules que le plan public embarque aussi (`configuration.mjs`,
   `apparence.mjs`, `habillage.mjs`, `modeles.mjs`, `polices-plan.mjs`,
   `seuil.mjs`, `horaires.mjs`) : ils s'importent, comme le nuancier. Ce que
   le code soudé tient encore — les options vendues à part, les distinctions —
   lui est confié par `brancheVolets`, à la place que ce code tenait
   (`_volets.html`). Les secteurs, la liste et le filtre de la recherche
   s'importent (`secteurs.mjs`, `recherche.mjs`), comme ce que la fiche montre
   (`corps-fiche.mjs`).
   ============================================================ */
import { DATA, CONFERENCES, parId } from "./donnees.mjs";
import { fermeModale } from "./fenetre.mjs";
import { REGLAGES_FOULE, regleFoule } from "./itineraire.mjs";
import { tutoPropose, reglageTuto, chapitresTuto, lanceTutoriel } from "./tutoriel.mjs";
import { caseInstallation } from "./reglage-installation.mjs";
import { blocApplication } from "./reglage-application.mjs";
import { blocSponsor } from "./reglage-sponsor.mjs";
import { contenuApercu, apercuDuo } from "./apercus.mjs";
import { blocRappel } from "./reglage-rappel.mjs";
import { conf, jeton, optionActive, appliqueLangue } from "./configuration.mjs";
import { COMMANDES, appliqueCommandes } from "./apparence.mjs";
import { appliqueAccent, MARQUES_DIST, modeDist, couleurDist, appliqueDists, modeBarre, appliqueBarre,
  appliqueModele } from "./habillage.mjs";
import { MODELES, modeleRetenu } from "./modeles.mjs";
import { GENRES_POLICE, POLICES_NOMS, policeChoisie, policeDuModele, feuillePolice, posePoliceLibelles }
  from "./polices-plan.mjs";
import { REGLAGES_SEUIL, seuilGere, regleSeuil, phraseSeuil } from "./seuil.mjs";
import { JOURS_SALON_MAX, lueHeure, lueDate, datesSalon, horairesSalon } from "./horaires.mjs";
import { REPOS_NUANCIER, suitNuancier } from "./nuancier.mjs";
import { SECTEURS } from "./secteurs.mjs";
import { appliqueSecteurs, appliqueFiltre, liste } from "./recherche.mjs";
import { montre } from "./corps-fiche.mjs";

/* Ce que le code soudé confie, et rien avant qu'il l'ait fait. */
// l'envoi de la configuration, et l'état de l'administration
let enregistreConf;
let admin;
// les options vendues à part, restées soudées (`_admin1.html`)
let OPTIONS;
let appliqueOptions;
// les distinctions (`_rendu.html`)
let DISTINCTIONS;
let ETOILE_DIST;
// les secteurs du salon, que l'index remplace à chaque chargement
const secteurs = () => SECTEURS;
// ce que la fenêtre des réglages et le reste de l'administration tiennent
let champZone;
let construitPanneau;
let relance;

/**
 * Le branchement des volets, appelé par le code soudé à la place que ce code
 * y tenait (`_volets.html`), dans la tranche que le visiteur ne reçoit pas.
 *
 * L'envoi de la configuration et l'état de l'administration n'y sont déclarés
 * que plus bas : ils viennent par des détours, lus à l'usage.
 */
export function brancheVolets(b){
  ({ enregistreConf, admin, OPTIONS, appliqueOptions, DISTINCTIONS, ETOILE_DIST,
    champZone, construitPanneau, relance } = b);
}

export function voletAdmin(hote){
  const p = document.createElement("p");
  p.textContent = "Ce que les visiteurs voient sur le plan. " +
    "Publiez la configuration pour que le changement leur parvienne.";
  hote.appendChild(p);

  const bloc = document.createElement("div");
  bloc.className = "reglages";
  /* La visite guidée fait le tour des commandes qu'on coche ici : son aide dit
     lesquelles, et se refait à chaque case touchée. */
  let majTuto = () => {};
  COMMANDES.forEach(cmd => {
    const l = document.createElement("label");
    l.innerHTML = '<input type="checkbox"><span></span>';
    l.querySelector("span").textContent = cmd.libelle;
    const c = l.querySelector("input");
    c.checked = conf(cmd.cle).visible !== false;
    c.onchange = e => {
      conf(cmd.cle).visible = e.target.checked;
      enregistreConf(); appliqueCommandes();
      // la couleur du parcours vit dans la pile : elle suit le réglage
      if (admin()) construitPanneau();
      majTuto();
    };
    bloc.appendChild(l);
  });

  /* Le coloriage par secteur reste hors de COMMANDES : celles-ci montrent ou
     retirent une commande du plan, celui-ci change ce que le plan donne à
     voir. Il ne s'offre que sur un salon sectorisé — ailleurs la case
     promettrait des couleurs qu'aucune donnée ne porte. */
  if (secteurs().size){
    const l = document.createElement("label");
    l.innerHTML = '<input type="checkbox"><span></span>';
    l.querySelector("span").textContent = "Montrer les secteurs — couleurs et filtre";
    const c = l.querySelector("input");
    c.checked = conf("_secteurs").visible !== false;
    c.onchange = e => {
      conf("_secteurs").visible = e.target.checked;
      enregistreConf(); appliqueSecteurs(); appliqueFiltre();
      // les couleurs des secteurs vivent dans la pile : elles suivent
      if (admin()) construitPanneau();
    };
    bloc.appendChild(l);
  }

  /* Sur quoi l'itinéraire se règle. Le hall d'un seul tenant se traverse
     mieux d'équerre, le hall arrondi mieux allée par allée, et le plan seul
     dit lequel des deux il est — d'où la case, plutôt qu'une règle qu'on
     aurait devinée de loin. */
  {
    const l = document.createElement("label");
    l.innerHTML = '<input type="checkbox"><span></span>';
    l.querySelector("span").textContent =
      "Suivre les allées une à une — pour un hall arrondi ou aux rangées désaccordées";
    const c = l.querySelector("input");
    c.checked = conf("_guidage").allees === true;
    c.onchange = e => {
      conf("_guidage").allees = e.target.checked;
      enregistreConf();
      // le trait affiché a été calculé avec l'autre réglage : il se refait
      if (typeof relance === "function") relance();
    };
    bloc.appendChild(l);
  }

  /* L'invitation à installer le plan est une fenêtre de plus sous les yeux du
     visiteur : elle se règle avec ce qu'il voit (`_installation.html`). */
  caseInstallation(bloc);

  /* La visite guidée se propose d'elle-même à la première ouverture. C'est une
     fenêtre de plus devant le plan, et tous les salons n'en veulent pas : d'où
     la case, et de quoi l'essayer d'ici — l'exploitant ne la verrait jamais
     autrement, l'administration ne la proposant pas. Éteinte plutôt que
     décochée sur un salon qui n'a rien à présenter, comme les sortes de la
     recherche : le choix fait vaudra le jour où quelque chose l'alimentera. */
  {
    const l = document.createElement("label");
    l.innerHTML = '<input type="checkbox"><span></span>';
    l.querySelector("span").textContent = "Proposer la visite guidée au premier démarrage";
    const c = l.querySelector("input");
    c.checked = tutoPropose();
    c.onchange = e => { reglageTuto().visible = e.target.checked; enregistreConf(); };
    bloc.appendChild(l);
    const aide = document.createElement("p");
    aide.className = "aideR";
    bloc.appendChild(aide);
    /* Chaque chapitre s'écrit dans son élément, et non fondu dans la phrase :
       la version anglaise traduit un texte à la fois, et une liste composée à
       la volée n'aurait été la clé d'aucune traduction. */
    const morceau = (txt) => {
      const s = document.createElement("span");
      s.textContent = txt;
      aide.appendChild(s);
    };
    majTuto = () => {
      const titres = chapitresTuto().map(ch => ch.titre);
      l.classList.toggle("eteint", !titres.length);
      c.disabled = !titres.length;
      aide.textContent = "";
      if (!titres.length){
        morceau("Rien à présenter sur ce salon : ni programme rattaché à une zone, ni parcours de visite, ni itinéraire.");
        return;
      }
      morceau("Le visiteur y fait lui-même chaque geste. Sur ce salon :");
      titres.forEach((t, i) => {
        aide.appendChild(document.createTextNode(i ? " · " : " "));
        morceau(t);
      });
      aide.appendChild(document.createTextNode(". "));
      morceau("Proposée une fois par appareil.");
      aide.appendChild(document.createTextNode(" "));
      const essai = document.createElement("button");
      essai.type = "button";
      essai.className = "essaiTuto";
      essai.textContent = "Essayer";
      essai.onclick = () => { fermeModale(); lanceTutoriel(); };
      aide.appendChild(essai);
    };
    majTuto();
  }

  hote.appendChild(bloc);

  /* Le rappel avant une conférence ferme la série : c'est une proposition faite
     au visiteur comme les deux précédentes — une fenêtre qui s'ouvre d'elle-même
     —, mais elle traîne un délai derrière elle. D'où sa place au pied de la
     liste plutôt qu'au milieu, où la ligne du délai aurait coupé les cases en
     deux. */
  blocRappel(hote);

  /* Les options viennent après les commandes, sous leur propre intertitre :
     les premières règlent un plan qu'on a, les secondes disent ce qu'on en a
     pris. */
  blocOptions(hote);

  /* Les langues ferment la série des cases : elles ne retirent ni une commande
     du plan ni une option vendue, mais une façon de le lire. */
  blocLangues(hote);

  /* Les derniers réglages ne sont pas des cases : ils passent donc après toutes
     celles-ci, chacun sous son intertitre. La barre du haut sur un téléphone
     d'abord — c'est la mise en page de l'écran, et elle commande ce que les
     réglages du dessous ont pour cadre —, puis ce que porte l'application
     installée (`_application.html`), du même ordre que l'invitation à
     l'installer cochée plus haut, et enfin le générique du démarrage
     (`_sponsor.html`), le plus gros de l'onglet, qui le ferme. */
  blocBarre(hote);
  blocApplication(hote);
  blocSponsor(hote);
}

/**
 * Les options prises par ce salon, dans l'onglet « Admin ».
 *
 * Elles ne se mêlent pas aux commandes du dessus, bien que les unes et les
 * autres soient des cases : une commande retire du plan ce qu'il montre, une
 * option retire ce qu'il sait faire. L'exploitant décoche les premières
 * pour un salon qui s'en passe, et ferme les secondes pour un salon qui ne les
 * a pas prises — deux gestes qu'on ne veut pas confondre en les alignant.
 *
 * Chaque case dit ce qu'elle ferme et ce qu'elle laisse en place : fermer une
 * option n'efface jamais le travail fait sous elle, et c'est la première
 * question que se pose celui qui s'apprête à la fermer.
 */
function blocOptions(hote){
  const tete = document.createElement("div");
  tete.className = "titreReg";
  tete.innerHTML = '<span class="eyebrow"></span><span class="d"></span>';
  tete.querySelector(".eyebrow").textContent = "Les options du plan";
  tete.querySelector(".d").textContent = "Ce que ce salon a pris. Une option " +
    "fermée grise ce qui y mène — un outil de la boîte à outils, un bouton du " +
    "plan, un onglet de ces réglages — pour vous, et le retire au visiteur, " +
    "sans défaire le travail fait dessous : la rouvrir le retrouve.";
  hote.appendChild(tete);

  const bloc = document.createElement("div");
  bloc.className = "reglages";
  OPTIONS.forEach(o => {
    const l = document.createElement("label");
    l.innerHTML = '<input type="checkbox"><span></span>';
    l.querySelector("span").textContent = o.libelle;
    const c = l.querySelector("input");
    c.checked = optionActive(o.cle);
    c.onchange = e => {
      conf("_options")[o.cle] = e.target.checked;
      enregistreConf();
      appliqueOptions();
      if (o.apres) o.apres();
    };
    bloc.appendChild(l);

    const aide = document.createElement("p");
    aide.className = "aideR";
    aide.textContent = o.aide;
    bloc.appendChild(aide);
  });
  hote.appendChild(bloc);
}

/**
 * Les langues du plan, dans l'onglet « Admin ».
 *
 * Une case par plan, et non une seule pour les deux : l'exploitant ouvre
 * souvent l'anglais aux visiteurs bien avant de le vouloir pour lui-même, et
 * l'inverse arrive aussi — une agence étrangère qui règle un salon dont les
 * données n'ont pas encore été traduites.
 *
 * La case de l'administration décide de la page où on la coche : la décocher
 * repasse ces réglages-ci au français sur-le-champ, drapeau compris. C'est
 * voulu — on voit ce qu'on vient de faire —, et la case reste là pour rouvrir.
 */
function blocLangues(hote){
  const tete = document.createElement("div");
  tete.className = "titreReg";
  tete.innerHTML = '<span class="eyebrow"></span><span class="d"></span>';
  tete.querySelector(".eyebrow").textContent = "Les langues du plan";
  tete.querySelector(".d").textContent = "Le bouton à drapeau passe le plan " +
    "en anglais sans le recharger. Fermée, la version anglaise s'en va avec " +
    "son bouton et le plan ne se lit qu'en français.";
  hote.appendChild(tete);

  const bloc = document.createElement("div");
  bloc.className = "reglages";
  [
    { cle: "public", libelle: "Version anglaise du plan public",
      aide: "Ce que voient les visiteurs. Le plan traduit ce qu'il écrit " +
        "lui-même ; ce que le salon porte — noms d'exposants, descriptions, " +
        "nomenclature — reste dans la langue des données, sauf là où la " +
        "source en donne une version anglaise." },
    { cle: "admin", libelle: "Version anglaise de l'administration",
      aide: "Ces réglages, la boîte à outils et la bande du haut, sur le plan " +
        "d'administration. Sans effet sur ce que voient les visiteurs." },
  ].forEach(l => {
    const label = document.createElement("label");
    label.innerHTML = '<input type="checkbox"><span></span>';
    label.querySelector("span").textContent = l.libelle;
    const c = label.querySelector("input");
    c.checked = conf("_langues")[l.cle] !== false;
    c.onchange = e => {
      conf("_langues")[l.cle] = e.target.checked;
      enregistreConf();
      appliqueLangue();
    };
    bloc.appendChild(label);

    const aide = document.createElement("p");
    aide.className = "aideR";
    aide.textContent = l.aide;
    bloc.appendChild(aide);
  });
  hote.appendChild(bloc);
}

/* Les deux barres qu'un téléphone peut porter, dans l'onglet « Admin ». Une
   vignette chacune : un choix de mise en page se juge d'un coup d'œil, et deux
   lignes de texte n'auraient pas dit où vont les commandes. */
const CHOIX_BARRE = [
  { mode: "flottante",
    titre: "Sans bandeau",
    resume: "Le hall d'un bord à l'autre ; les commandes se posent dessus, au bord droit.",
    vue: '<svg class="vueBarre" viewBox="0 0 34 34" fill="none" aria-hidden="true">' +
      '<rect class="cadre" x="7.5" y="3.5" width="19" height="27" rx="3"/>' +
      '<path class="part" d="M22 8.5h.01M22 13.5h.01M22 18.5h.01" stroke-width="3.4" stroke-linecap="round"/>' +
      '</svg>' },
  { mode: "bande",
    titre: "Bandeau réduit",
    resume: "Une bande aussi basse que possible : le nom du salon, les pavillons, les commandes.",
    vue: '<svg class="vueBarre" viewBox="0 0 34 34" fill="none" aria-hidden="true">' +
      '<rect class="cadre" x="7.5" y="3.5" width="19" height="27" rx="3"/>' +
      '<path class="part" d="M9.5 8h15" stroke-width="4.5"/>' +
      '</svg>' },
];

/**
 * Où l'on choisit la barre du haut pour les téléphones.
 *
 * Dans l'onglet « Admin », comme le générique du démarrage et pour la même
 * raison : ce n'est pas un réglage de salon mais une façon de poser le plan,
 * qu'on arrête une fois et qu'on ne rouvre plus.
 *
 * Le choix se voit sur-le-champ quand on l'ouvre depuis un téléphone, et pas
 * du tout depuis un poste de travail — la barre y garde son rang dans les deux
 * cas. D'où les vignettes : elles sont, sur grand écran, la seule chose qui
 * montre ce qu'on choisit.
 */
function blocBarre(hote){
  const tete = document.createElement("div");
  tete.className = "titreReg";
  tete.innerHTML = '<span class="eyebrow"></span><span class="d"></span>';
  tete.querySelector(".eyebrow").textContent = "La barre du haut, sur un téléphone";
  tete.querySelector(".d").textContent = "Un écran de téléphone se compte en " +
    "lignes de stands : la bande du haut en prend trois. Le plan peut donc " +
    "s'en passer, ses commandes rangées sur le hall, ou la garder pour que le " +
    "nom du salon reste lu. Sans effet sur un ordinateur, où la barre ne coûte " +
    "rien.";
  hote.appendChild(tete);

  const choix = document.createElement("div");
  choix.className = "choixDem";
  hote.appendChild(choix);

  const boutons = CHOIX_BARRE.map(c => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "dem";
    b.innerHTML = '<span class="v"></span><span class="x">' +
      '<span class="t"></span><span class="d"></span></span>' +
      '<span class="coche">\u2713</span>';
    b.querySelector(".v").innerHTML = c.vue;
    b.querySelector(".t").textContent = c.titre;
    b.querySelector(".d").textContent = c.resume;
    b.onclick = () => pose(c.mode);
    choix.appendChild(b);
    return { b: b, c: c };
  });

  const suit = () => {
    const mode = modeBarre();
    boutons.forEach(({ b, c }) => b.setAttribute("aria-pressed", String(c.mode === mode)));
  };
  const pose = (mode) => {
    if (modeBarre() === mode) return;
    conf("_barre").mode = mode;
    enregistreConf();
    appliqueBarre();
    suit();
  };
  suit();
}

/**
 * Les dates et les heures du salon, dans l'onglet « Plan ».
 *
 * Deux dates, puis autant de lignes que de jours entre elles, chacune avec son
 * ouverture et sa fermeture. Les lignes suivent les dates au fil de la saisie :
 * c'est en voyant paraître « samedi 21 mars » qu'on sait avoir tapé la bonne
 * année.
 *
 * Un jour qui paraît reprend les heures de la veille. Un salon garde le plus
 * souvent les mêmes d'un bout à l'autre : les recopier à la main sur quatre
 * lignes était la seule chose que l'écran demandait, et la plus facile à
 * oublier sur la dernière.
 */
export function blocHoraires(hote){
  const bloc = document.createElement("div");
  bloc.className = "reglage-nb horaires";
  const titre = document.createElement("span");
  titre.className = "l";
  titre.textContent = "Dates et heures d'ouverture du salon";
  bloc.appendChild(titre);

  const h = () => conf("_horaires");

  const dates = document.createElement("div");
  dates.className = "hRang hDates";
  dates.innerHTML = '<span class="u">Du</span><input type="date">' +
    '<span class="u">au</span><input type="date">';
  const [du, au] = dates.querySelectorAll("input");
  du.setAttribute("aria-label", "Premier jour du salon");
  au.setAttribute("aria-label", "Dernier jour du salon");
  du.value = h().debut || "";
  au.value = h().fin || "";
  bloc.appendChild(dates);

  const lignes = document.createElement("div");
  lignes.className = "hJours";
  bloc.appendChild(lignes);

  const aide = document.createElement("span");
  aide.className = "aide";
  bloc.appendChild(aide);
  const alerte = document.createElement("span");
  alerte.className = "aide alerte";
  bloc.appendChild(alerte);

  const majAlerte = () => {
    const a = lueDate(h().debut), b = lueDate(h().fin);
    const dit = a && b && b < a
      ? "Le dernier jour précède le premier : corrigez les dates pour régler les heures."
      : a && b && (b.getTime() - a.getTime()) / 864e5 >= JOURS_SALON_MAX
      ? "Plus de " + JOURS_SALON_MAX + " jours entre ces deux dates : seuls les " +
        JOURS_SALON_MAX + " premiers sont proposés. Vérifiez l'année."
      : datesSalon().some(j => horairesSalon(j.cle).incoherent)
      ? "Une fermeture tombe avant l'ouverture : ce jour-là n'a pas d'heures tant " +
        "qu'elle n'est pas corrigée."
      : "";
    alerte.hidden = !dit;
    alerte.textContent = dit;
  };

  const ligne = (j) => {
    const r = document.createElement("div");
    r.className = "hRang";
    r.innerHTML = '<span class="l"></span>' +
      '<span class="u">Ouverture</span><input type="time" step="300">' +
      '<span class="u">Fermeture</span><input type="time" step="300">' +
      '<button type="button" class="hEfface" title="Effacer les heures de ce jour">×</button>';
    r.querySelector(".l").textContent = j.nom;
    const [de, a] = r.querySelectorAll("input");
    const efface = r.querySelector(".hEfface");
    const lu = (h().jours || {})[j.cle] || {};
    de.value = lu.ouverture || "";
    a.value = lu.fermeture || "";
    de.setAttribute("aria-label", "Ouverture, " + j.nom);
    a.setAttribute("aria-label", "Fermeture, " + j.nom);
    const majEfface = () => { efface.hidden = !de.value && !a.value; };
    /* Un champ d'heure n'a de valeur qu'une fois complet : tant qu'on tape, il
       rend une chaîne vide, et l'écrire effacerait l'heure qu'on corrige. On
       n'enregistre donc qu'au changement, où le champ est entier ou vidé. */
    const ecrit = () => {
      const t = h();
      t.jours = t.jours || {};
      const c = {};
      if (lueHeure(de.value) !== null) c.ouverture = de.value;
      if (lueHeure(a.value) !== null) c.fermeture = a.value;
      // un jour sans heures ne laisse pas de casier vide derrière lui
      if (Object.keys(c).length) t.jours[j.cle] = c; else delete t.jours[j.cle];
      enregistreConf();
      majEfface();
      majAlerte();
    };
    de.onchange = a.onchange = ecrit;
    efface.onclick = () => { de.value = a.value = ""; ecrit(); };
    majEfface();
    lignes.appendChild(r);
  };

  const remplit = () => {
    lignes.innerHTML = "";
    const jours = datesSalon();
    jours.forEach(ligne);
    aide.textContent = jours.length
      ? "Aucun stand n'est programmé dans la journée d'un visiteur avant " +
        "l'ouverture ni après la fermeture. Ces jours sont aussi ceux qu'on lui " +
        "propose. Un jour sans heures n'a pas de borne."
      : "Choisissez les dates : une ligne d'heures paraît pour chaque jour. Sans " +
        "elles, la journée d'un visiteur n'a ni début ni fin.";
    majAlerte();
  };

  /* Les jours qui paraissent reprennent les heures de la veille — ou, pour le
     premier, celles qu'on aurait saisies pour tous les jours avant que les
     dates n'existent. Les jours qui sortent des dates gardent les leurs : une
     date corrigée dans le mauvais sens puis rétablie ne doit rien effacer. */
  const recopie = () => {
    const t = h();
    t.jours = t.jours || {};
    let veille = lueHeure(t.ouverture) !== null || lueHeure(t.fermeture) !== null
      ? { ouverture: t.ouverture, fermeture: t.fermeture } : null;
    const jours = datesSalon();
    jours.forEach(j => {
      if (t.jours[j.cle]) veille = t.jours[j.cle];
      else if (veille) t.jours[j.cle] = Object.assign({}, veille);
    });
    if (jours.length){ delete t.ouverture; delete t.fermeture; }
  };

  du.onchange = au.onchange = () => {
    const t = h();
    if (lueDate(du.value)) t.debut = du.value; else delete t.debut;
    if (lueDate(au.value)) t.fin = au.value; else delete t.fin;
    // le calendrier du dernier jour s'ouvre sur le mois du premier
    au.min = du.value || "";
    recopie();
    enregistreConf();
    remplit();
  };
  au.min = du.value || "";

  remplit();
  hote.appendChild(bloc);
}

/**
 * L'onglet « Parcours intelligent ».
 *
 * Une case maîtresse, et sous elle les deux façons de dire ce qu'un stand
 * reçoit. Les deux peuvent tenir ensemble — le nombre fixe sert alors de
 * plancher — et l'aperçu au pied dit ce que cela donne ici, sur les
 * emplacements de ce salon, plutôt que dans l'absolu.
 *
 * Les champs disparaissent avec la case qui les commande, comme les trois
 * chiffres de « PMR » : un champ qu'on modifie sans effet fait douter de tous
 * les autres.
 */
export function voletParcours(hote){
  const p = document.createElement("p");
  p.textContent = "La journée organisée range les stands au plus court depuis " +
    "la porte d'entrée : tout le monde part du même point, à la même heure, et " +
    "reçoit le même ordre — les premières travées se remplissent à l'ouverture " +
    "pendant que le fond reste vide. Ce qui suit apprend au calcul à étaler " +
    "ses propres recommandations dans la journée, plutôt que d'envoyer tout le " +
    "monde au même endroit au même moment.";
  hote.appendChild(p);

  const bloc = document.createElement("div");
  bloc.className = "reglages";
  const l = document.createElement("label");
  l.innerHTML = '<input type="checkbox"><span></span>';
  l.querySelector("span").textContent =
    "Étaler dans le temps les visiteurs qui suivent le plan";
  const c = l.querySelector("input");
  c.checked = seuilGere();
  bloc.appendChild(l);
  const aide = document.createElement("p");
  aide.className = "aideR";
  aide.textContent = "Le plan ne compte que les visiteurs qui organisent leur " +
    "journée avec lui : il ignore tout des autres, et ne mesure donc pas la " +
    "fréquentation de vos stands. Le seuil ci-dessous dit à partir de combien " +
    "de ces visiteurs-là, en même temps sur un stand, le calcul doit chercher " +
    "un autre ordre. Il ne l'interdit jamais, et ne retire l'exposant du " +
    "parcours de personne.";
  bloc.appendChild(aide);
  hote.appendChild(bloc);

  const detail = document.createElement("div");
  const apercu = document.createElement("p");
  apercu.className = "aideR";
  /* Réécrit à chaque frappe : c'est la seule façon de choisir un chiffre en
     voyant ce qu'il fait, et le compte tient en un tour des emplacements. */
  const ecritApercu = () => {
    const t = phraseSeuil();
    apercu.textContent = t;
    apercu.hidden = !t;
  };

  /**
   * Une façon de dire le seuil : sa case, ses chiffres, leurs aides.
   *
   * `cle` porte la case dans la configuration, `k` le chiffre dans
   * `REGLAGES_SEUIL` — les bornes et l'origine viennent de là, et non d'une
   * seconde liste qui finirait par diverger.
   *
   * Les clés gardent leurs noms d'origine (`_capacite`, `fixe`, `nombre`) :
   * elles sont déjà écrites dans la configuration des salons en production, et
   * les renommer perdrait le réglage de ceux qui l'ont activé. Le mot juste
   * est dans le code et à l'écran ; la clé, elle, est une adresse.
   */
  const facon = (cle, libelle, champs) => {
    const b = document.createElement("div");
    b.className = "reglages";
    const lb = document.createElement("label");
    lb.innerHTML = '<input type="checkbox"><span></span>';
    lb.querySelector("span").textContent = libelle;
    const ca = lb.querySelector("input");
    ca.checked = conf("_capacite")[cle] === true;
    b.appendChild(lb);
    detail.appendChild(b);

    const boites = champs.map(ch => {
      const r = REGLAGES_SEUIL[ch.k];
      const d = document.createElement("div");
      d.className = "reglage-nb";
      d.innerHTML = '<label><span class="l"></span>' +
        '<input type="number" min="' + r.min + '" max="' + r.max + '" step="' + r.pas + '">' +
        '<span class="u"></span></label><span class="aide"></span>';
      d.querySelector(".l").textContent = ch.avant;
      d.querySelector(".u").textContent = ch.unite;
      d.querySelector(".aide").textContent = ch.aide;
      const n = d.querySelector("input");
      n.value = regleSeuil(ch.k);
      /* Un champ vidé le temps de retaper ne doit rien écrire : on ne retient
         que ce qui tient dans les bornes, et le champ se remet d'aplomb en le
         quittant — comme le temps de visite et les chiffres de la foule. */
      n.oninput = e => {
        const v = +e.target.value;
        if (!isFinite(v) || v < r.min || v > r.max) return;
        conf("_capacite")[ch.k] = v;
        enregistreConf();
        ecritApercu();
      };
      n.onblur = () => { n.value = regleSeuil(ch.k); };
      detail.appendChild(d);
      return d;
    });

    const maj = () => { boites.forEach(d => { d.hidden = !ca.checked; }); };
    ca.onchange = e => {
      conf("_capacite")[cle] = e.target.checked;
      enregistreConf();
      maj();
      ecritApercu();
    };
    maj();
  };

  facon("surface", "Un seuil calculé sur la surface du stand", [
    { k: "parDix", avant: "Seuil de", unite: "par tranche de 10 m²",
      aide: "La surface se lit sur le plan, telle que le stand y est dessiné. " +
        "Un emplacement que personne n'a dessiné n'a pas de surface, et ne " +
        "porte donc aucun seuil." },
    { k: "plancher", avant: "Jamais moins de", unite: "à la fois",
      aide: "Sans ce plancher, les plus petits stands porteraient un seuil que " +
        "leur seule surface leur invente — un module de six mètres carrés " +
        "tient bien trois visiteurs debout." },
    { k: "plafond", avant: "Jamais plus de", unite: "à la fois",
      aide: "Au-delà, la règle de trois rendrait un seuil si haut qu'il ne se " +
        "déclencherait jamais." },
  ]);
  facon("fixe", "Un seuil fixe, le même pour tous les stands", [
    { k: "nombre", avant: "Seuil de", unite: "à la fois",
      aide: "Le choix d'un salon dont les emplacements se ressemblent, ou " +
        "d'un exploitant qui connaît ses équipes mieux que la surface ne les " +
        "devine. Cochée, cette case l'emporte sur le calcul à la surface." },
  ]);
  detail.appendChild(apercu);
  hote.appendChild(detail);

  const maj = () => { detail.hidden = !c.checked; ecritApercu(); };
  c.onchange = e => {
    conf("_capacite").visible = e.target.checked;
    enregistreConf();
    maj();
  };
  maj();
}

/** Y a-t-il de quoi parler de foule ? Une conférence rattachée à une zone,
 *  c'est-à-dire une salle qui a une place sur le plan. Sans cela, l'onglet
 *  « PMR » ne réglerait qu'un calcul qui n'a jamais lieu. */
export const sallesSituees = () =>
  (CONFERENCES || []).some(c => c.zone && parId.has(String(c.zone)));

/**
 * Ce qui change pour un visiteur en fauteuil.
 *
 * L'itinéraire accessible contourne déjà ce que l'exploitant a dessiné
 * infranchissable — un emmarchement, une estrade — et refuse les passages trop
 * étroits. Reste ce qu'aucun dessin ne peut porter : la foule d'une entrée ou
 * d'une sortie de conférence, qui n'existe que vingt minutes par conférence et
 * qu'on ne saurait tracer à l'avance.
 *
 * Trois chiffres la décrivent, et aucun ne vaut partout le même : une salle
 * qui s'ouvre sur une esplanade ne bouche rien, un couloir de six mètres se
 * ferme à lui seul. D'où l'onglet, plutôt qu'une règle décidée d'ici.
 */
export function voletPmr(hote){
  const p = document.createElement("p");
  p.textContent = "L'itinéraire accessible contourne déjà ce qui est dessiné " +
    "infranchissable. Ceci vise ce qu'aucun dessin ne porte : la foule d'une " +
    "entrée ou d'une sortie de conférence, aux abords de la salle. Le trajet " +
    "du marcheur, lui, n'en tient pas compte — il s'y faufile.";
  hote.appendChild(p);

  const bloc = document.createElement("div");
  bloc.className = "reglages";
  const l = document.createElement("label");
  l.innerHTML = '<input type="checkbox"><span></span>';
  l.querySelector("span").textContent =
    "Écarter l'itinéraire accessible des salles qui se vident";
  const c = l.querySelector("input");
  c.checked = conf("_foule").visible !== false;
  bloc.appendChild(l);
  hote.appendChild(bloc);

  /* Les bornes et les valeurs d'origine viennent du calcul lui-même
     (`REGLAGES_FOULE`) : deux listes de chiffres finiraient par diverger, et
     c'est le champ qui aurait tort. */
  const chiffres = document.createElement("div");
  const champ = (k, libelle, unite, aide) => {
    const r = REGLAGES_FOULE[k];
    const d = document.createElement("div");
    d.className = "reglage-nb";
    d.innerHTML = '<label><span class="l"></span>' +
      '<input type="number" min="' + r.min + '" max="' + r.max + '" step="' + r.pas + '">' +
      '<span class="u"></span></label><span class="aide"></span>';
    d.querySelector(".l").textContent = libelle;
    d.querySelector(".u").textContent = unite;
    d.querySelector(".aide").textContent = aide;
    const n = d.querySelector("input");
    n.value = regleFoule(k);
    /* Un champ vidé le temps de retaper ne doit rien écrire : on ne retient que
       ce qui tient dans les bornes, et le champ se remet d'aplomb en le
       quittant — comme le temps de visite. */
    n.oninput = e => {
      const v = +e.target.value;
      if (!isFinite(v) || v < r.min || v > r.max) return;
      conf("_foule")[k] = v;
      enregistreConf();
      // le trait affiché a été calculé avec l'ancien chiffre : il se refait
      if (typeof relance === "function") relance();
    };
    n.onblur = () => { n.value = regleFoule(k); };
    chiffres.appendChild(d);
  };
  champ("poids", "Un mètre longé en vaut", "mètres",
    "Trois : le trajet accepte un détour jusqu'au double de ce qu'il aurait " +
    "longé, et passe tout de même s'il n'existe pas d'autre chemin. À un, plus " +
    "rien ne l'écarte.");
  champ("metres", "Largeur des abords", "m",
    "Depuis le contour de la salle, et seulement là : c'est la portion qui la " +
    "jouxte qui coûte cher, pas l'allée d'un bout à l'autre. Quatre mètres " +
    "valent une allée courante.");
  champ("minutes", "Autour de l'heure dite", "min",
    "Avant et après le début, avant et après la fin de chaque conférence. En " +
    "dehors de ces minutes, le trajet est celui de toujours.");
  hote.appendChild(chiffres);

  /* Les trois chiffres disparaissent quand la règle est décochée : ils ne
     décriraient plus rien, et un champ qu'on modifie sans effet fait douter de
     tous les autres. */
  const maj = () => { chiffres.hidden = !c.checked; };
  c.onchange = e => {
    conf("_foule").visible = e.target.checked;
    enregistreConf();
    maj();
    if (typeof relance === "function") relance();
  };
  maj();
}

/* Le nuancier. Des tons de charte plutôt qu'une roue : choisir une couleur
   principale, c'est choisir celle du salon, pas la nuance exacte d'un dégradé.
   Ils sont rangés par famille — bleus, verts, chauds, rouges, violets,
   neutres — et tous assez soutenus pour porter du texte, blanc ou noir, sans
   qu'il faille le vérifier au cas par cas. La dernière pastille ouvre le
   nuancier du système, pour une charte à l'hexadécimal près. */
const TONS = [
  ["#2F49D1", "Bleu d'encre"], ["#1B5FD9", "Bleu roi"], ["#23356B", "Bleu nuit"],
  ["#0F6F8A", "Bleu canard"], ["#0E8A7D", "Turquoise"], ["#0E7A3C", "Vert prairie"],
  ["#2C5E4A", "Vert forêt"], ["#5C7A1E", "Olive"],
  ["#B07A0B", "Or brûlé"], ["#C06A0B", "Ambre"], ["#C05621", "Terracotta"],
  ["#B4402F", "Brique"], ["#A82437", "Grenat"], ["#8E1F3F", "Cerise"],
  ["#B32A63", "Framboise"], ["#A8318C", "Fuchsia"],
  ["#7A3DBE", "Violet"], ["#5333C4", "Indigo"], ["#6B3A5E", "Prune"],
  ["#7A5230", "Brun"], ["#3F5566", "Ardoise"], ["#25303A", "Anthracite"],
];
const nomDuTon = (h) => (TONS.find(t => t[0].toLowerCase() === String(h).toLowerCase()) || [])[1];

/* Les vignettes des volets « Nouveaux » et « Adhérents ». Des schémas, et non
   la chose même : une fiche réduite à soixante pixels ne se lirait pas, et ce
   qui se juge ici est la place de la marque, pas le texte qu'elle porte. Le
   vrai rendu se voit derrière la fenêtre, sur le plan et dans la liste, qui
   suivent le choix au clic. */
const CADRE_VIGNETTE =
  '<rect x=".5" y=".5" width="63" height="39" rx="2" fill="var(--surface)" stroke="var(--line)"/>';
const svgVignette = (dedans) =>
  '<svg viewBox="0 0 64 40" aria-hidden="true">' + CADRE_VIGNETTE + dedans + '</svg>';
const barreVignette = (x, y, l, o) =>
  '<rect x="' + x + '" y="' + y + '" width="' + l + '" height="3" rx="1.5" ' +
  'fill="var(--ink-3)" opacity="' + (o || .45) + '"/>';

function vignetteDistPlan(cle){
  const stand = '<rect x="6" y="6" width="52" height="28" fill="var(--stand)" ' +
    'stroke="var(--stand-line)"/>' + barreVignette(11, 24, 22, .5);
  const m = cle === "point" ? '<circle class="mq" cx="50" cy="12" r="4"/>'
    : cle === "corne" ? '<path class="mq" d="M46 6h12v12Z"/>'
    : cle === "etoile" ? '<g class="mq" transform="translate(44 7) scale(.44)">' +
        ETOILE_DIST + '</g>'
    : cle === "lisere" ? '<rect class="mqT" x="7.3" y="7.3" width="49.4" height="25.4" ' +
        'fill="none" stroke-width="2.6"/>'
    : "";
  return svgVignette(stand + m);
}

function vignetteDistListe(cle){
  const cadre = (y) => '<rect x="6" y="' + y + '" width="11" height="8" rx="1" ' +
    'fill="none" stroke="var(--line-strong)"/>';
  const decale = cle === "point" ? 6 : 0;
  const haut = cadre(7) + barreVignette(21 + decale, 9.5, cle === "cartouche" ? 18 : 26) +
    (cle === "point" ? '<circle class="mq" cx="23" cy="11" r="2.6"/>' : "") +
    (cle === "cartouche" ? '<rect class="mqT" x="42" y="7.2" width="15" height="7" rx="1.5" ' +
      'fill="none" stroke-width="1.2"/>' : "") +
    (cle === "sousligne" ? '<rect class="mq" x="21" y="15" width="17" height="2.4" rx="1.2"/>' : "");
  const bas = cadre(cle === "sousligne" ? 24 : 22) +
    barreVignette(21, cle === "sousligne" ? 26.5 : 24.5, 22, .3);
  return svgVignette(haut + bas);
}

function vignetteDistFiche(cle){
  const m = cle === "pastille"
      ? '<rect class="mq" x="7" y="6" width="30" height="8" rx="4" opacity=".2"/>' +
        '<circle class="mq" cx="12.5" cy="10" r="2.2"/>' +
        '<rect class="mq" x="17" y="8.8" width="16" height="2.4" rx="1.2" opacity=".85"/>'
    : cle === "corne" ? '<path class="mq" d="M.5.5h17L.5 17.5Z"/>'
    : cle === "bandeau" ? '<rect class="mq" x=".5" y=".5" width="63" height="8" rx="2"/>'
    : "";
  const haut = cle === "bandeau" ? 14 : cle === "corne" ? 20 : 19;
  return svgVignette(m + barreVignette(7, haut, 40, .55) +
    barreVignette(7, haut + 7, 22, .3) + barreVignette(7, haut + 13, 30, .3));
}

const VIGNETTES_DIST = {
  plan: vignetteDistPlan, liste: vignetteDistListe, fiche: vignetteDistFiche,
};

/** Ce salon distingue-t-il ses exposants de cette façon ? Le champ n'existe
 *  pas partout, et un volet qui promettrait une marque qu'aucune fiche ne porte
 *  ferait chercher une panne là où il n'y a qu'un champ vide. */
const salonDitSes = (d) =>
  Object.values((DATA || {}).plans || {}).some(pl =>
    (pl.stands || []).some(o => o[d.champ] || (o.coex || []).some(x => x[d.champ])));

/** L'autre distinction tient-elle déjà le coin de la tête de fiche ? Une seule
 *  l'occupe — deux coins au même angle n'en feraient qu'un — et celle qui vient
 *  après dans la table reprend sa pastille. */
const coinPris = (d) => DISTINCTIONS.some(x =>
  x !== d && DISTINCTIONS.indexOf(x) < DISTINCTIONS.indexOf(d) &&
  modeDist(x, "fiche") === "corne");

/* Le coin appartient aux deux volets à la fois : celui qui le prend change ce
   que l'autre peut promettre. Les deux se rafraîchissent donc ensemble, sans
   quoi l'onglet d'à côté gardait une aide devenue fausse. */
export const MAJ_COIN = [];

/**
 * Ce que le plan montre d'une distinction.
 *
 * Trois surfaces, trois questions : le stand qu'on survole, la ligne qu'on
 * balaie, la fiche qu'on ouvre. La même marque ne vaut pas aux trois endroits
 * — un mot se lit sur une fiche, se tronque dans une liste et ne se trace pas
 * du tout sur le plan, dont le rendu WebGL ne rejoue que des formes.
 *
 * Une seule teinte pour les trois, en revanche, et le nuancier vient après
 * elles : les trois marques disent la même chose, et trois teintes en auraient
 * fait trois distinctions à apprendre. Le texte suit la teinte, au pied du
 * volet : c'est la dernière retouche, celle qu'on fait une fois la forme
 * choisie.
 */
export function voletDist(hote, d){
  const p = document.createElement("p");
  p.textContent = "La synchronisation pose un champ « " + d.nomChamp + " » sur " +
    d.quoi + ". Ce que le plan en montre se règle ici, surface par surface : " +
    "le stand sur le plan, la ligne dans la liste des résultats, la tête de la " +
    "fiche qu'on ouvre. Le choix se voit tout de suite derrière cette fenêtre, " +
    "et les deux distinctions se cumulent : un exposant qui les porte toutes " +
    "deux montre les deux marques.";
  hote.appendChild(p);

  const note = (t) => {
    const n = document.createElement("p");
    n.className = "note";
    n.textContent = t;
    hote.appendChild(n);
  };
  if (!salonDitSes(d))
    note("Aucune fiche de ce salon ne porte le champ pour l'instant : les " +
      "marques réglées ici resteront invisibles jusqu'à ce que la source le " +
      "renseigne. Le champ se désigne dans la console, onglet « Stand ».");
  else if (!montre("stand", d.cible))
    note("Le champ « " + d.nomChamp + " » est décoché dans la console : les " +
      "marques réglées ici ne paraîtront qu'une fois le champ rendu visible.");

  /* Les marques d'une surface. Le nuancier et le texte, eux, sont communs aux
     trois : ils viennent après, au pied du volet. */
  const bloc = (surface, titre, aide) => {
    const b = document.createElement("div");
    b.className = "blocDist";
    b.innerHTML = '<span class="eyebrow tDist"></span><p class="aDist"></p>' +
      '<div class="choixDist"></div>';
    b.querySelector(".tDist").textContent = titre;
    const aideDite = b.querySelector(".aDist");
    aideDite.textContent = aide;

    const choix = b.querySelector(".choixDist");
    const tuiles = MARQUES_DIST[surface].map(m => {
      const t = document.createElement("button");
      t.type = "button";
      t.className = "vgN d-" + d.cle;
      t.innerHTML = '<span class="ap">' + VIGNETTES_DIST[surface](m.cle) +
        '</span><span class="n"></span>';
      t.querySelector(".n").textContent = m.nom;
      t.onclick = () => {
        conf(d.reglage)[surface] = m.cle;
        appliqueDists();
        /* La liste s'écrit ligne par ligne : son marquage tient au balisage,
           non à la feuille de style, et ne suit pas tout seul. */
        if (surface === "liste") liste();
        enregistreConf();
        if (surface === "fiche") MAJ_COIN.forEach(f => f()); else majTuiles();
      };
      choix.appendChild(t);
      return { t, m };
    });
    const majTuiles = () => {
      tuiles.forEach(({ t, m }) =>
        t.setAttribute("aria-pressed", String(m.cle === modeDist(d, surface))));
      /* Le coin ne se partage pas, et le dire vaut mieux que le laisser
         découvrir : la marque choisie paraîtrait simplement ailleurs. */
      if (surface === "fiche")
        aideDite.textContent = aide + (coinPris(d)
          ? " Le coin corné est déjà pris par l'autre distinction : choisi ici, " +
            "c'est la pastille qui paraîtra."
          : "");
    };
    majTuiles();
    hote.appendChild(b);
    return majTuiles;
  };

  bloc("plan", "Sur le plan",
    "Une forme posée sur le stand. Le coin corné se place sur l'angle de la " +
    "boîte du tracé : un stand en L n'a pas cet angle-là, et sa corne déborde " +
    "dans l'allée. Le liseré, lui, emprunte le trait que la sélection utilise " +
    "déjà. Deux distinctions affichées prennent chacune un coin, l'une à " +
    "droite et l'autre à gauche : elles ne se recouvrent pas.");
  bloc("liste", "Dans la liste",
    "La ligne des résultats. Le cartouche dit le mot, mais l'ellipse le mange " +
    "sur une enseigne longue ; la mention descend sur la seconde ligne, où " +
    "rien ne la tronque.");
  const majFiche = bloc("fiche", "En tête de fiche",
    "Ce qu'on lit en ouvrant un stand. Le coin corné se pose à gauche : le " +
    "coin droit porte déjà le logo de l'exposant et la croix de fermeture. Le " +
    "bandeau prend toute la largeur et descend le nom d'une ligne.");
  MAJ_COIN.push(majFiche);

  /* Un seul nuancier pour les trois surfaces, et en dernier : les trois marques
     disent la même chose, et trois teintes en auraient fait trois distinctions
     à apprendre. Les vignettes du dessus s'en peignent, si bien qu'une couleur
     choisie se voit sur les onze d'un coup. */
  const coul = document.createElement("div");
  coul.className = "reglage-coul coulDist";
  coul.innerHTML = '<div class="tete"><span class="eyebrow">Couleur des marques</span>' +
    '<span class="val"></span>' +
    '<button type="button" class="raz">Couleur d\'origine</button></div>' +
    '<div class="nuancier"></div>';
  const val = coul.querySelector(".val");
  const nuancier = coul.querySelector(".nuancier");
  const majPastilles = () => {
    const v = couleurDist(d).toLowerCase();
    nuancier.querySelectorAll("button[data-ton]").forEach(b =>
      b.setAttribute("aria-pressed", String(b.dataset.ton.toLowerCase() === v)));
    const n = nomDuTon(v);
    val.textContent = v ? (n ? n + " · " + v.toUpperCase() : v.toUpperCase())
                        : "Couleur principale";
    const libre = nuancier.querySelector(".perso input");
    if (libre) libre.value = couleurDist(d) || jeton("--accent-base") || "#2F49D1";
  };
  /* Peindre ne fait que poser trois jetons sur la racine : c'est ce qui peut
     suivre la rafale du sélecteur de couleur. */
  const peint = (v) => { conf(d.reglage).couleur = v; appliqueDists(); majPastilles(); };
  TONS.forEach(([ton, nom]) => {
    const b = document.createElement("button");
    b.type = "button";
    b.dataset.ton = ton;
    b.style.background = ton;
    b.title = nom + " · " + ton;
    b.setAttribute("aria-label", nom);
    b.onclick = () => { peint(ton); enregistreConf(); };
    nuancier.appendChild(b);
  });
  const libre = document.createElement("label");
  libre.className = "perso";
  libre.title = "Couleur libre";
  libre.innerHTML = '<input type="color"><span></span>';
  suitNuancier(libre.querySelector("input"), peint, enregistreConf);
  nuancier.appendChild(libre);
  coul.querySelector(".raz").onclick = () => {
    delete conf(d.reglage).couleur;
    enregistreConf(); appliqueDists(); majPastilles();
  };
  hote.appendChild(coul);
  majPastilles();

  /* Le texte de la marque. Un syndicat porte son nom — « Adhérent UNAM » —, et
     un salon nomme ses nouveaux venus comme il l'entend. Ce qu'on écrit là est
     une donnée, comme le nom d'un exposant : il paraît tel quel dans les deux
     langues, et le dictionnaire ne le connaît pas. */
  const champ = champZone(hote, "Texte de la marque", document.createElement("input"),
    "Ce que la marque écrit : la pastille, le bandeau et la mention sous le " +
    "nom le portent en entier, le cartouche et le coin corné n'en tiennent " +
    "que deux ou trois mots. Laissez vide pour « " + d.texte + " ». Le texte " +
    "s'affiche tel quel, y compris sur la version anglaise du plan.");
  champ.type = "text";
  champ.placeholder = d.texte;
  champ.value = conf(d.reglage).texte || "";
  /* Après un temps de repos, et non à chaque frappe : réécrire les neuf cents
     lignes de la liste lettre par lettre se sentait sous les doigts. */
  let minuteur = null;
  champ.oninput = () => {
    clearTimeout(minuteur);
    minuteur = setTimeout(() => {
      const t = champ.value.trim();
      if (t) conf(d.reglage).texte = t; else delete conf(d.reglage).texte;
      enregistreConf();
      appliqueDists();
      liste();
    }, REPOS_NUANCIER);
  };
}

/** De quoi le plan a l'air : sa couleur principale, la police des noms qu'il
 *  porte, et l'habillage de ses panneaux — la liste des exposants, la fiche
 *  détail, le parcours de visite et l'itinéraire. */
export function voletApparence(hote){
  const p = document.createElement("p");
  p.textContent = "La couleur principale sert partout : sélection, liens, " +
    "boutons, pastilles, et les modèles s'en habillent. Le modèle décide de " +
    "l'allure de tout l'écran à la fois : le bandeau du haut, la liste des " +
    "exposants, la fiche qui s'ouvre sur un stand, le parcours de visite et " +
    "l'itinéraire. Il pose aussi sa police sur les noms des stands et des " +
    "zones : une autre peut lui être préférée, jusqu'au prochain changement " +
    "de modèle. Les numéros de stand gardent la sienne.";
  hote.appendChild(p);

  const coul = document.createElement("div");
  coul.className = "reglage-coul";
  coul.innerHTML = '<div class="tete"><span class="eyebrow">Couleur principale</span>' +
    '<span class="val"></span>' +
    '<button type="button" class="raz">Couleur d\'origine</button></div>' +
    '<div class="nuancier"></div>';
  const val = coul.querySelector(".val");
  const nuancier = coul.querySelector(".nuancier");
  const majPastilles = () => {
    const v = (conf("_accent").couleur || "").toLowerCase();
    nuancier.querySelectorAll("button[data-ton]").forEach(b =>
      b.setAttribute("aria-pressed", String(b.dataset.ton.toLowerCase() === v)));
    const n = nomDuTon(v);
    val.textContent = v ? (n ? n + " · " + v.toUpperCase() : v.toUpperCase())
                        : "Réglage d'origine";
    const libre = nuancier.querySelector(".perso input");
    if (libre) libre.value = conf("_accent").couleur || jeton("--accent-base") || "#2F49D1";
  };
  /* Peindre : trois mélanges et six variables posées sur la racine, la page
     s'y refait d'elle-même. C'est ce qui peut suivre la rafale du sélecteur. */
  const peint = (v) => {
    conf("_accent").couleur = v;
    appliqueAccent(); majPastilles();
  };
  const choisit = (v) => { peint(v); enregistreConf(); };
  TONS.forEach(([ton, nom]) => {
    const b = document.createElement("button");
    b.type = "button";
    b.dataset.ton = ton;
    b.style.background = ton;
    b.title = nom + " · " + ton;
    b.setAttribute("aria-label", nom);
    b.onclick = () => choisit(ton);
    nuancier.appendChild(b);
  });
  /* La pastille de couleur libre. On suit la rafale du sélecteur : c'est le
     seul moyen de voir la couleur s'installer sur le plan pendant qu'on la
     cherche. Seule l'écriture attend la fin du geste — voir « La rafale du
     sélecteur de couleur ». */
  const libre = document.createElement("label");
  libre.className = "perso";
  libre.title = "Couleur libre";
  libre.innerHTML = '<input type="color"><span></span>';
  suitNuancier(libre.querySelector("input"), peint, enregistreConf);
  nuancier.appendChild(libre);
  coul.querySelector(".raz").onclick = () => {
    delete conf("_accent").couleur;
    enregistreConf(); appliqueAccent(); majPastilles();
  };
  hote.appendChild(coul);
  majPastilles();

  /* La police des noms, avant les modèles et non après : leur planche est
     longue, et un réglage rangé dessous ne se trouvait qu'en la faisant
     défiler en entier. L'ordre des gestes n'en change pas — le modèle choisi
     repose sa police, et la tête de ce bloc dit laquelle est en place. */
  const blocPolice = document.createElement("div");
  blocPolice.className = "reglage-police";
  blocPolice.innerHTML = '<div class="tete"><span class="eyebrow">Police des noms</span>' +
    '<span class="val"></span>' +
    '<button type="button" class="raz">Police du modèle</button></div>' +
    '<div class="genresPol"></div><div class="polices"></div>';
  const valPolice = blocPolice.querySelector(".val");
  const genres = GENRES_POLICE.map(g => {
    const b = document.createElement("button");
    b.type = "button";
    b.innerHTML = '<span></span><span class="n"></span>';
    b.firstChild.textContent = g.nom;
    b.lastChild.textContent = String(POLICES_NOMS.filter(q => q.genre === g.cle).length);
    b.onclick = () => montreGenre(g.cle);
    blocPolice.querySelector(".genresPol").appendChild(b);
    return { b, g };
  });
  const tuiles = POLICES_NOMS.map(q => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "pol";
    b.innerHTML = '<span class="t"></span><span class="g">du modèle</span>';
    /* Chaque nom s'écrit dans sa police, à la graisse où le plan la posera :
       c'est une enseigne qu'on choisit, et un intitulé dans la police de
       l'interface ne dirait rien de la chasse d'une étroite ni du contraste
       d'un serif. */
    const t = b.querySelector(".t");
    t.textContent = q.nom;
    t.style.fontFamily = q.pile;
    t.style.fontWeight = q.graisse;
    b.onclick = () => posePolice(q);
    blocPolice.querySelector(".polices").appendChild(b);
    return { b, q };
  });
  /* Un genre à la fois : soixante vignettes d'un seul bloc repoussaient les
     modèles hors de vue. Celles des autres genres restent bâties mais cachées
     — cachées, elles ne font rien télécharger —, et la feuille d'une police
     n'est demandée qu'au premier passage sur son genre. */
  const montreGenre = (cle) => {
    genres.forEach(({ b, g }) => b.setAttribute("aria-pressed", String(g.cle === cle)));
    tuiles.forEach(({ b, q }) => {
      b.hidden = q.genre !== cle;
      if (!b.hidden) feuillePolice(q);
    });
  };
  const majPolices = () => {
    const modele = policeDuModele(modeleRetenu());
    const choisie = policeChoisie();
    const courante = choisie && choisie !== modele ? choisie : modele;
    tuiles.forEach(({ b, q }) => {
      b.setAttribute("aria-pressed", String(q === courante));
      b.querySelector(".g").hidden = q !== modele;
    });
    valPolice.textContent = !courante ? "" :
      courante === modele ? courante.nom + " · modèle " +
        (MODELES.find(m => m.cle === modeleRetenu()) || {}).nom : courante.nom;
    // le genre montré suit la police en place : le modèle qui repose une serif
    // ouvre les serifs, sans quoi la vignette cochée resterait hors de vue
    montreGenre(courante ? courante.genre : GENRES_POLICE[0].cle);
  };
  const posePolice = (q) => {
    const f = conf("_fiche");
    // retenir celle du modèle, c'est revenir au modèle : le suivant reposera la sienne
    if (!q || q === policeDuModele(modeleRetenu())) delete f.police;
    else f.police = q.nom;
    enregistreConf(); posePoliceLibelles(modeleRetenu()); majPolices();
  };
  blocPolice.querySelector(".raz").onclick = () => posePolice(null);
  hote.appendChild(blocPolice);
  majPolices();

  const titre = document.createElement("span");
  titre.className = "eyebrow";
  titre.textContent = "Modèle d'habillage";
  titre.style.display = "block";
  titre.style.margin = "0 0 9px";
  hote.appendChild(titre);

  const grille = document.createElement("div");
  grille.className = "modeles";
  const courant = modeleRetenu();
  // le même contenu pour les onze : c'est en comparant les mêmes liste et
  // fiche à elles-mêmes qu'on choisit leur habillage
  const vu = contenuApercu();
  MODELES.forEach(m => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "mod";
    b.setAttribute("aria-pressed", String(m.cle === courant));
    b.innerHTML = '<span class="vue"></span>' +
      '<span class="nom"><span class="t"></span><span class="coche">✓</span></span>' +
      '<span class="resume"></span>';
    b.querySelector(".nom .t").textContent = m.nom;
    b.querySelector(".resume").textContent = m.resume;
    b.querySelector(".vue").appendChild(apercuDuo(m.cle, vu));
    b.onclick = () => {
      conf("_fiche").modele = m.cle;
      /* Choisir un modèle, c'est choisir sa police : celle qu'on avait
         préférée à la précédente ne s'accordait qu'à elle. */
      delete conf("_fiche").police;
      enregistreConf(); appliqueModele();
      grille.querySelectorAll(".mod").forEach(x =>
        x.setAttribute("aria-pressed", String(x === b)));
      majPolices();
    };
    grille.appendChild(b);
  });
  hote.appendChild(grille);
}

