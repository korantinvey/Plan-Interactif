/* ============================================================
   Fiche détail d'un salon — ce qu'elle montre, et d'où vient chaque champ

   La fenêtre « Fiche détail » de la console (`ouvreFiche`) et son résumé
   (`resumeFiche`) : les lignes de la fiche et leurs cadres, le tableau des
   champs (`tableauChamps`), la liste déroulante d'une cible et les valeurs
   qui valent oui (`champOrigine`), les catégories d'invités d'Eventmaker, et
   les champs propres au salon — les créer, les renommer dans les deux
   langues, les retirer.

   Ce que le réglage écrit et affiche vient de `correspondance.mjs`, le
   fournisseur retenu de `provenance.mjs`, le salon ouvert et son écriture de
   `evenements.mjs`. Ce qu'il ne peut pas importer lui est confié par la
   console (`brancheFicheDetail`, `_console-js.html`) : la fenêtre du socle,
   les deux fenêtres de saisie qu'on en tire, ce qui garde la place d'une
   fenêtre qui se redessine, et la barre d'état.
   ============================================================ */
import { separeValeurs } from "./texte.mjs";
import { DEFAUT_CHAMP, AUCUN_CHAMP, encode, decode, correspondance, intitule, intituleSuite,
  ACCORDS, aplani, autreFace } from "./correspondance.mjs";
import { courant, majEvenement, slugifie } from "./evenements.mjs";
import { FOURNISSEURS, SOURCES_NOM, source, sourceNom } from "./provenance.mjs";

/** @type {{
 *   ouvreModale: (titre: string, remplit: (corps: HTMLElement) => void,
 *     boutons: Array<{ libelle: string, genre?: string, action?: () => any }>,
 *     apres?: () => void) => void,
 *   demande: (titre: string, libelle: string, valeur: string, suite: (v: string) => any) => void,
 *   confirme: (titre: string, message: string, libelleOui: string, action: () => any) => void,
 *   gardeLaPlace: (redessine: () => void) => () => void,
 *   signale: (txt: string, erreur?: boolean) => void,
 * }} */
let _console = {
  ouvreModale: () => {},
  demande: () => {},
  confirme: () => {},
  gardeLaPlace: (redessine) => redessine,
  signale: () => {},
};

/** Ce que la console confie à la fiche détail : voir `_console`. */
export function brancheFicheDetail(branche) {
  _console = branche;
}

/* ============================================================
   Contenu de la fiche détail
   Deux décisions par ligne, et elles vont ensemble : ce que la fiche montre —
   l'état de commercialisation d'un stand n'a rien à faire sur le site du
   salon — et le champ d'origine qui l'alimente, dont le nom change d'un salon
   à l'autre. Les régler dans deux fenêtres séparées revenait à faire deux fois
   le tour de la même liste.

   Le réglage vit à côté de l'événement, et non dans le navigateur de celui qui
   l'a fait — sinon le visiteur n'en verrait rien.
   ============================================================ */

/**
 * Une ligne de la fiche.
 *
 *   cle     nomme le réglage d'affichage. Absente, la ligne ne se masque pas.
 *   cible   nomme le champ d'origine à associer. Absente, rien n'est à régler :
 *           la valeur vient du plan, pas d'une fiche d'exposant.
 *   fixe    dit d'où vient la valeur quand il n'y a pas de champ à choisir.
 *   source  restreint la ligne à un fournisseur. Absente, elle vaut pour tous.
 *   critere autorise la ligne à servir de critère de recherche sur le plan.
 *           Toutes ne s'y prêtent pas : un numéro de téléphone ou une adresse
 *           ne se choisissent pas dans une liste, et le secteur a déjà sa
 *           bande de puces sur le plan — un second filtre pour lui ferait
 *           double emploi.
 */
const LIGNES_FICHE = [
  /* --- ce que le plan porte --- */
  { groupe: "stand", cle: "hall", libelle: "Hall",
    fixe: "hall de l'emplacement",
    aide: "Affiché devant le numéro de stand, sur les seuls stands dont le " +
      "hall est renseigné. Il se lit sur l'emplacement et non sur le " +
      "pavillon, un même plan pouvant en couvrir deux. Décoché tant qu'on ne " +
      "l'a pas voulu." },
  { groupe: "stand", cle: "code", libelle: "Numéro de stand",
    fixe: "allée et numéro de l'emplacement",
    aide: "Affiché à côté du pavillon." },
  { groupe: "stand", cle: "niveaux", libelle: "Niveaux",
    fixe: "nombre de niveaux de l'emplacement",
    aide: "Seulement au-delà d'un niveau." },
  { groupe: "stand", cle: "secteur", libelle: "Secteur",
    fixe: "secteur de l'emplacement",
    aide: "Le découpage commercial du plan, que Klipso porte sur " +
      "l'emplacement. Les couleurs et le filtre par secteur se règlent, eux, " +
      "depuis le plan." },

  /* --- ce que la fiche de la société porte --- */
  /* La seule ligne dont la source se choisit à part : le nom écrit sur le
     stand n'est pas toujours celui de la fiche société. Klipso tient souvent
     l'enseigne courte que le salon veut lire sur son plan, Eventmaker la
     raison sociale entière — ou l'inverse. */
  { cible: "nom", libelle: "Enseigne", sourcePropre: "nom",
    aide: "Le titre de la fiche, et le nom écrit sur le stand et dans la " +
      "liste : toujours affiché. Il peut venir d'une autre source que le " +
      "reste de la fiche ; à défaut de valeur de ce côté, c'est le nom que " +
      "porte la source des exposants qui paraît." },
  { cle: "raison", cible: "raison", libelle: "Raison sociale",
    aide: "Quand elle diffère de l'enseigne." },
  /* Le seul champ de la fiche qui ne soit pas du texte. Il vaut pour les deux
     fournisseurs : Eventmaker le porte d'office sur l'avatar de la fiche,
     Klipso n'a rien qui s'en approche mais un salon peut tenir une adresse
     d'image dans un champ à lui. */
  { cle: "logo", cible: "logo", libelle: "Logo",
    aide: "Le logo de l'enseigne, en tête de fiche. Sur Eventmaker, c'est " +
      "« avatar » qu'il faut désigner : « avatar_medium » et " +
      "« avatar_thumb » sont recadrés au carré et coupent les bords d'un " +
      "logo en largeur — et sur une fiche sans logo, ils rendent les " +
      "initiales de la personne inscrite." },
  { cle: "adresse", cible: "adresse", libelle: "Adresse" },
  { cible: "codePostal", libelle: "Code postal", montre: "avec la ville",
    suit: "ville",
    aide: "Se pose devant la ville, sur la même ligne, comme sur une " +
      "enveloppe. Il n'entre pas pour autant dans le filtre « Ville », qui " +
      "fait cocher des villes et non des codes postaux." },
  { cle: "ville", cible: "ville", libelle: "Ville", critere: true },
  { cle: "pays", cible: "pays", libelle: "Pays", critere: true },
  /* La console nomme le champ plus précisément que la fiche, qui n'a qu'un
     téléphone à montrer et n'a pas à dire lequel. L'aperçu suit la fiche :
     c'est ce que le visiteur lira. */
  { cle: "telephone", cible: "telephone", libelle: "Téléphone société",
    surFiche: "Téléphone" },
  { cle: "site", cible: "site", libelle: "Site web" },
  { cle: "facebook", cible: "facebook", libelle: "Facebook" },
  { cle: "linkedin", cible: "linkedin", libelle: "LinkedIn" },
  { cle: "instagram", cible: "instagram", libelle: "Instagram" },
  { cle: "nomenclature", cible: "nomenclature", libelle: "Nomenclature",
    critere: true,
    aide: "Les rubriques du catalogue. Plusieurs champs se cumulent." },
  /* Klipso n'a pas de thématiques : ses rubriques passent par la
     nomenclature, et proposer une ligne que rien n'alimenterait ferait
     chercher un champ qui n'existe pas. */
  { cle: "thematiques", cible: "thematiques", libelle: "Thématiques",
    source: "eventmaker", critere: true,
    aide: "Ce que l'exposant vient chercher ou proposer, tel que le salon " +
      "le range. Un champ à valeurs multiples se sépare tout seul ; fiez-vous " +
      "à l'exemple, certains salons n'y portent que des codes. Un salon qui " +
      "les tient dans Eventmaker même, et non dans un champ de fiche, les " +
      "porte sous « thematic_ids »." },
  { cle: "nouveau", cible: "nouveau", libelle: "Nouvel exposant", ouiNon: true,
    critere: true,
    aide: "Pose une pastille en tête de fiche. Le champ n'existe que sur les " +
      "salons qui distinguent leurs nouveaux venus." },
  /* Aucun fournisseur ne porte l'adhésion : c'est le syndicat du salon qui
     tient ses membres, et l'organisateur recopie la réponse dans un champ à
     lui. Souvent avec des valeurs qui ne sont pas des oui — « À jour »,
     « Membre titulaire » —, d'où les valeurs à cocher sous le champ. */
  { cle: "adherent", cible: "adherent", libelle: "Adhérent syndicat", ouiNon: true,
    critere: true,
    aide: "Marque l'exposant membre du syndicat du salon. Le champ porte " +
      "rarement un oui : cochez sous lui celles de ses valeurs qui comptent " +
      "pour une adhésion. Ce que le plan en montre se règle depuis " +
      "l'engrenage du plan, onglet « Adhérents »." },
  /* Seule ligne du cadre à ne pas venir de la fiche société : elle dit donc
     d'où elle vient, sans quoi l'en-tête du cadre mentirait pour elle. */
  { cle: "conferences", libelle: "Conférences", fixe: origineConferences,
    aide: "Les conférences tenues par l'exposant, où qu'elles se tiennent." },
  /* Comme les conférences : ni l'une ni l'autre ne vient de la fiche société,
     et toutes deux ont leur volet sur la fiche plutôt qu'une ligne dans son
     corps. D'où la colonne d'origine, qui dit d'où elles viennent. */
  { cle: "produits", libelle: "Produits", fixe: origineProduits,
    aide: "Le catalogue de l'exposant. Il est rangé sous sa fiche d'invité " +
      "et non dans ses champs : rien à désigner ici, seulement à montrer " +
      "ou non." },
];

/* Les champs qui se taisent tant qu'on ne les a pas cochés — l'inverse de la
   règle générale, et pour la raison qui la fonde. Un champ absent du réglage
   paraît parce qu'il paraissait déjà avant que le réglage existe ; le hall,
   lui, n'a jamais paru, et Klipso y porte parfois le code du dossier plutôt
   qu'un nom de hall — « SMCL26_P71 ». S'afficher de lui-même le publierait
   d'un coup sur tous les salons déjà en ligne.

   Le même tableau vit dans la page — « MASQUE_PAR_DEFAUT » de « _js.html »,
   qui décide de ce que le visiteur reçoit : les deux se suivent. */
const FICHE_MASQUEE_PAR_DEFAUT = { hall: true };

/** Un champ paraît-il sur la fiche, réglage ou défaut ? */
function paraitSurFiche(e, type, cle) {
  const regle = ((e.fiche || {})[type] || {})[cle];
  return FICHE_MASQUEE_PAR_DEFAUT[cle] ? regle === true : regle !== false;
}

/** D'où vient le programme, dit dans la colonne d'origine. */
function origineConferences(e) {
  const src = source(e, "conferences");
  return src === "aucun" ? "programme non synchronisé"
    : "programme · " + (FOURNISSEURS[src] || src);
}

/** D'où vient le catalogue, dit dans la colonne d'origine. */
function origineProduits(e) {
  const src = source(e, "produits");
  return src === "aucun" ? "catalogue non synchronisé"
    : "catalogue · " + (FOURNISSEURS[src] || src);
}

/**
 * Les deux cadres de l'onglet Stand.
 *
 * Une fiche d'exposant assemble deux choses qui n'ont ni la même nature ni la
 * même provenance : l'emplacement, que Klipso porte parce que c'est lui qui
 * porte le plan, et la société qui l'occupe, qui peut venir d'ailleurs. Mêlées
 * dans une seule liste, on ne savait plus laquelle des deux sources une ligne
 * interrogeait.
 */
const CADRES_FICHE = [
  { cle: "stand", titre: "Le stand", domaine: "plan",
    aide: "L'emplacement tel que le plan le décrit. Rien ne s'y règle : ces " +
      "valeurs ne sont pas des champs de fiche." },
  { cle: "exposant", titre: "L'exposant", domaine: "stands",
    aide: "La société rattachée à l'emplacement, et ce que sa fiche porte." },
];

/**
 * Ce qui ne paraît jamais sur la fiche, mais décide de ce qu'elle contient.
 *
 * Les deux premières lignes sont les plus lourdes de conséquences de toute la
 * fenêtre : c'est par elles qu'une fiche Eventmaker retrouve son emplacement
 * sur le plan. Mal réglées, aucun exposant n'apparaît. Klipso n'a ni l'une ni
 * l'autre à régler — le numéro se compose de l'allée et du numéro portés par
 * l'emplacement, le dossier est une clé du modèle.
 */
const LIGNES_RATTACHEMENT = {
  klipso: [
    { cible: "exclu", libelle: "Exclu de la liste", ouiNon: true,
      aide: "Une valeur vraie retire l'exposant du plan public, quel que soit le reste." },
  ],
  eventmaker: [
    /* « Numéro de stand » figure déjà plus haut, mais ce n'est pas le même :
       celui-là est affiché et vient du plan, celui-ci est lu sur la fiche de
       l'exposant pour l'y rattacher. Le libellé doit dire lequel des deux. */
    { cible: "stand", libelle: "Numéro de stand de l'exposant",
      aide: "Le numéro tel que sa fiche le porte, comparé à celui du plan, " +
        "mise en forme ignorée. Mal réglé, aucun exposant n'apparaît." },
    { cible: "dossier", libelle: "Identifiant de dossier",
      aide: "Le dossier Klipso recopié sur la fiche : le rattachement le plus sûr." },
    /* Un stand Klipso ne porte que le dossier de son titulaire : les sociétés
       qu'il héberge n'ont que le numéro pour s'y raccrocher, d'où ce champ à
       part — le même que ci-dessus dans presque tous les cas, mais que le
       salon qui range le stand hôte ailleurs peut détourner. */
    { cible: "coexposant", libelle: "Rattachement des co-exposants",
      aide: "Le champ où un co-exposant porte le stand de son hôte. Les fiches " +
        "qui désignent ainsi un stand déjà pris par un dossier sont ses " +
        "co-exposants, et la fiche du stand les liste tous. " +
        "« Aucun » les retire du plan." },
    { cible: "exclu", libelle: "Exclu de la liste", ouiNon: true,
      aide: "Une valeur vraie retire l'exposant du plan public, quel que soit le reste." },
  ],
};

/* Ce qui se règle mais que rien n'alimente : à montrer en retrait plutôt qu'à
   taire, sans quoi on croirait le champ déjà repris. */
const FICHE_INERTE = [];

export function resumeFiche(e) {
  const caches = LIGNES_FICHE
    .filter((l) => l.cle && !paraitSurFiche(e, "stand", l.cle)).map((l) => l.libelle);

  /* La correspondance tient dans le même réglage : la dire ici évite d'ouvrir
     la fenêtre pour savoir si elle a été touchée. */
  const src = source(e, "stands");
  const bloc = correspondance(e, src);
  const associes = Object.keys(bloc.champs || {}).length;
  const mots = [caches.length ? "Masqué — " + caches.join(", ") : "Tout affiché"];
  /* Deux réglages qui ne se voient pas dans la liste des champs masqués : les
     champs que le salon s'est ajoutés, et ceux qu'il propose à la recherche. */
  const nPerso = champsPersos(e).length;
  if (nPerso) mots.push(nPerso + " champ" + (nPerso > 1 ? "s" : "") + " propre" +
    (nPerso > 1 ? "s" : "") + " au salon");
  const nCrit = Object.keys(criteres(e)).length;
  mots.push(nCrit ? nCrit + " critère" + (nCrit > 1 ? "s" : "") + " de recherche"
    : "aucun critère de recherche");
  /* Le rangement du corps et les champs d'une fiche de zone se règlent depuis
     le plan, mais ils vivent dans la même colonne : les taire ici ferait
     croire la fiche à son état d'origine. */
  if ((((e.fiche || {}).ordre) || []).length) mots.push("ordre d'affichage remanié");
  const nZone = Object.values(((e.fiche || {}).zone) || {})
    .filter((v) => v === false).length;
  if (nZone) mots.push(nZone + " champ" + (nZone > 1 ? "s" : "") +
    " de zone masqué" + (nZone > 1 ? "s" : ""));
  const nGrp = (((e.fiche || {}).groupes) || []).length;
  if (nGrp) mots.push(nGrp + " groupe" + (nGrp > 1 ? "s" : "") + " de champs");
  if (src !== "aucun") {
    mots.push(associes
      ? associes + " champ" + (associes > 1 ? "s" : "") + " associé" +
        (associes > 1 ? "s" : "") + " à la main"
      : bloc.detecteLe ? "champs d'origine proposés" : "champs d'origine non relevés");
  }
  return mots.join(" · ");
}

/**
 * Une case à cocher. Un champ non réglé est affiché : ajouter un champ plus
 * tard ne doit pas le faire disparaître des salons déjà réglés — sauf ceux
 * que « FICHE_MASQUEE_PAR_DEFAUT » réserve, qui attendent d'être cochés.
 *
 * `apres` sert aux lignes où la case commande autre chose qu'elle-même — le
 * champ d'origine se grise quand le champ ne paraît plus.
 */
function caseFiche(type, cle, libelle, aide, apres) {
  const e = courant();
  const l = document.createElement("label");
  l.className = "case";
  l.innerHTML = '<input type="checkbox"><span></span>' +
                (aide ? '<span class="aide"></span>' : "");
  l.querySelector("span").textContent = libelle;
  if (aide) l.querySelector(".aide").textContent = aide;
  const i = l.querySelector("input");
  i.checked = paraitSurFiche(e, type, cle);
  if (!libelle) i.setAttribute("aria-label", "Afficher ce champ sur la fiche");
  if (apres) apres(i.checked);
  i.onchange = async () => {
    e.fiche = { ...(e.fiche || {}) };
    e.fiche[type] = { ...(e.fiche[type] || {}), [cle]: i.checked };
    if (apres) apres(i.checked);
    try { await majEvenement(e.id, { fiche: e.fiche }); }
    catch (err) {
      _console.signale(err.message, true);
      i.checked = !i.checked;
      if (apres) apres(i.checked);
    }
  };
  return l;
}

/* ------------------------------------------------------------------
   Champs propres au salon

   Les cibles de la fiche sont les mêmes partout, et c'est bien ainsi : une
   enseigne, une ville, un site web se retrouvent d'un salon à l'autre. Mais
   chaque salon a un champ que les autres n'ont pas — « Gamme de produits »,
   « Franchise depuis », « Pays d'origine de l'enseigne » — dont personne
   d'autre n'a l'usage. L'ajouter au code revenait à l'ajouter à tous les
   salons pour qu'un seul s'en serve.

   Un champ créé ici n'appartient donc qu'à son événement : son libellé vit
   dans la fiche, son champ d'origine dans la correspondance, comme n'importe
   quelle cible. Le préfixe le met hors d'atteinte d'une cible du code.
   ------------------------------------------------------------------ */
const PREFIXE_PERSO = "perso:";

/* La seconde origine d'un champ propre au salon : celle qui porte l'anglais.
   Un champ à choix voit ses valeurs traduites toutes seules — la source
   déclare l'anglais de ses listes — mais un texte libre, une description,
   n'a rien de tel : sa version anglaise ne peut venir que d'un second champ
   de la source. Le même suffixe vit dans « champs.ts », côté serveur. */
const SUFFIXE_EN = "@en";
const cibleEn = (cle) => PREFIXE_PERSO + cle + SUFFIXE_EN;

const champsPersos = (e) => {
  const l = e.fiche && e.fiche.perso;
  return Array.isArray(l) ? l : [];
};

/** Les cibles retenues comme critères de recherche, jamais nul. */
const criteres = (e) => (e.fiche && e.fiche.criteres) || {};

/** Écrit la fiche d'un trait, et la remet en place si le service refuse. */
async function ecritFiche(e, part) {
  const avant = e.fiche;
  e.fiche = { ...(e.fiche || {}), ...part };
  try { await majEvenement(e.id, { fiche: e.fiche }); }
  catch (err) { e.fiche = avant; _console.signale(err.message, true); }
}

/**
 * La case « critère de recherche ».
 *
 * Elle ne décide pas de l'affichage mais de la recherche : un champ retenu
 * ici devient un filtre proposé au visiteur, et ses valeurs entrent dans ce
 * que la recherche plein texte balaie. Non cochée par défaut — un plan qui
 * offrirait douze filtres d'office ne se lirait plus.
 */
function caseCritere(cle, apres) {
  const e = courant();
  const l = document.createElement("label");
  l.className = "case";
  l.innerHTML = '<input type="checkbox"><span></span>';
  const i = l.querySelector("input");
  i.checked = criteres(e)[cle] === true;
  i.setAttribute("aria-label", "Proposer ce champ dans les critères de recherche");
  i.onchange = async () => {
    const c = { ...criteres(e) };
    if (i.checked) c[cle] = true; else delete c[cle];
    await ecritFiche(e, { criteres: c });
    i.checked = criteres(courant())[cle] === true;
    if (apres) apres(i.checked);
  };
  return l;
}

/** Une clé technique tirée du libellé, unique dans l'événement. */
function clePerso(e, libelle) {
  const base = slugifie(libelle) || "champ";
  const pris = new Set(champsPersos(e).map((c) => c.cle));
  if (!pris.has(base)) return base;
  for (let n = 2; ; n++) if (!pris.has(base + "-" + n)) return base + "-" + n;
}

/** Crée un champ propre à ce salon, puis redessine la fenêtre. */
function ajouteChampPerso(redessine) {
  const e = courant();
  _console.demande("Nouveau champ", "Intitulé du champ, tel que la fiche l'affichera",
    "", async (libelle) => {
      const perso = champsPersos(e).concat([{ cle: clePerso(e, libelle), libelle }]);
      await ecritFiche(e, { perso });
      redessine();
    });
}

/**
 * Renomme un champ : seuls les intitulés changent, la clé et le réglage restent.
 *
 * L'intitulé se donne dans les deux langues, et les deux champs paraissent
 * quelle que soit la langue de la console : c'est l'exploitant qui l'a écrit,
 * aucun dictionnaire ne le connaît. L'anglais est facultatif — laissé vide, la
 * version anglaise du plan montre l'intitulé français.
 */
function renommeChampPerso(cle, redessine) {
  const e = courant();
  const actuel = champsPersos(e).find((c) => c.cle === cle) || {};
  let fr, en;
  const champ = (corps, texte, valeur, lang) => {
    const l = document.createElement("label");
    l.innerHTML = "<span></span><input>";
    l.querySelector("span").textContent = texte;
    const i = l.querySelector("input");
    i.value = valeur || "";
    i.lang = lang;
    corps.appendChild(l);
    return i;
  };
  const valide = async () => {
    const libelle = fr.value.trim();
    const libelleEn = en.value.trim();
    const perso = champsPersos(e).map((c) => {
      if (c.cle !== cle) return c;
      const n = { ...c, libelle };
      if (libelleEn) n.libelle_en = libelleEn; else delete n.libelle_en;
      return n;
    });
    await ecritFiche(e, { perso });
    redessine();
  };
  _console.ouvreModale("Renommer le champ", (corps) => {
    fr = champ(corps, "Intitulé en français", actuel.libelle, "fr");
    en = champ(corps, "Intitulé en anglais", actuel.libelle_en, "en");
    const aide = document.createElement("p");
    aide.className = "aide";
    aide.textContent = "Laissé vide, l'intitulé en français s'affiche aussi dans la version " +
      "anglaise du plan.";
    corps.appendChild(aide);
    setTimeout(() => { fr.focus(); fr.select(); }, 30);
  }, [{ libelle: "Annuler" },
      // sans intitulé français, la fenêtre reste ouverte : c'est lui qui nomme le champ
      { libelle: "Valider", genre: "primaire",
        action: () => { if (!fr.value.trim()) { fr.focus(); return false; } valide(); } }]);
}

/**
 * Retire un champ, et tout ce qui parlait de lui.
 *
 * Le laisser dans la correspondance ferait demander à l'API un champ que plus
 * rien n'affiche, et le laisser dans les critères offrirait au visiteur un
 * filtre sans valeurs.
 */
function retireChampPerso(cle, libelle, redessine) {
  const e = courant();
  const cible = PREFIXE_PERSO + cle;
  _console.confirme("Retirer « " + libelle + " » ?",
    "Le champ, son origine et son réglage de recherche sont effacés. Les " +
    "valeurs déjà synchronisées disparaîtront de la fiche à la prochaine " +
    "synchronisation.", "Retirer", async () => {
      const stand = { ...((e.fiche || {}).stand || {}) };
      const crit = { ...criteres(e) };
      delete stand[cible];
      delete crit[cible];
      await ecritFiche(e, {
        perso: champsPersos(e).filter((c) => c.cle !== cle),
        stand, criteres: crit,
        /* Le rang aussi : le garder ferait resurgir un champ recréé plus tard
           sous le même intitulé à la place qu'occupait le premier. Et avec lui
           la section qui le réunissait et le sort réservé à son intitulé, qui
           ne décrivent plus rien. */
        ordre: (((e.fiche || {}).ordre) || []).filter((c) => c !== cible),
        groupes: (((e.fiche || {}).groupes) || [])
          .map((g) => ({ ...g, cles: (g.cles || []).filter((c) => c !== cible) }))
          .filter((g) => g.cles.length),
        intitules: (() => {
          const i = { ...((e.fiche || {}).intitules || {}) };
          delete i[cible];
          return i;
        })(),
      });
      /* La correspondance se nettoie de son côté : elle est rangée par
         fournisseur, et le champ a pu être réglé sous plusieurs d'entre eux. */
      const corr = { ...(e.correspondances || {}) };
      let touche = false;
      Object.keys(corr).forEach((src) => {
        const bloc = { ...(corr[src] || {}) };
        ["champs", "valeurs"].forEach((k) => {
          // l'origine anglaise part avec la française : c'est le même champ
          [cible, cibleEn(cle)].forEach((c) => {
            if (!bloc[k] || bloc[k][c] === undefined) return;
            bloc[k] = { ...bloc[k] };
            delete bloc[k][c];
            touche = true;
          });
        });
        corr[src] = bloc;
      });
      if (touche) {
        e.correspondances = corr;
        try { await majEvenement(e.id, { correspondances: corr }); }
        catch (err) { _console.signale(err.message, true); }
      }
      redessine();
    });
}

/**
 * Les lignes du cadre des champs propres au salon.
 *
 * Mêmes lignes que les autres cadres — une case d'affichage, un champ
 * d'origine, un critère — plus de quoi renommer et retirer : ces champs-là
 * n'existent que parce qu'on les a créés.
 */
function lignesPerso(e, redessine) {
  return champsPersos(e).map((c) => ({
    cle: PREFIXE_PERSO + c.cle,
    cible: PREFIXE_PERSO + c.cle,
    cibleEn: cibleEn(c.cle),
    libelle: c.libelle,
    critere: true,
    outils: [
      { titre: "Renommer", texte: "\u270E",
        action: () => renommeChampPerso(c.cle, _console.gardeLaPlace(redessine)) },
      { titre: "Retirer", texte: "\u00D7", genre: "danger",
        action: () => retireChampPerso(c.cle, c.libelle, _console.gardeLaPlace(redessine)) },
    ],
  }));
}

/**
 * Un cadre de la fenêtre : ce dont il parle, et de qui cela vient.
 *
 * L'en-tête nomme le fournisseur plutôt que de le laisser deviner : c'est la
 * question qu'on se pose devant une ligne mal réglée — « ce champ, je le
 * cherche chez qui ? »
 */
function cadreFiche(def, contenus) {
  const e = courant();
  const src = source(e, def.domaine);
  const d = document.createElement("div");
  d.className = "cadre";
  d.innerHTML = '<div class="cadre-hd"><span class="eyebrow"></span>' +
                '<span class="prov"></span></div>' +
                '<p class="aide"></p>';
  d.querySelector(".eyebrow").textContent = def.titre;
  const prov = d.querySelector(".prov");
  prov.textContent = FOURNISSEURS[src] || src;
  prov.dataset.src = src;
  if (def.aide) d.querySelector(".aide").textContent = def.aide;
  else d.querySelector(".aide").remove();
  contenus.filter(Boolean).forEach((c) => d.appendChild(c));
  return d;
}

/**
 * Fenêtre de la fiche détail : ce qu'elle montre, et ce qui l'alimente.
 *
 * Elle ne parle que du stand. Une zone organisateur ne tire rien d'une fiche
 * d'exposant — tout ce qu'elle montre s'écrit zone par zone, depuis le plan —
 * et ses quatre cases se règlent là où on les écrit, dans l'onglet « Zones »
 * des réglages du plan. Ici, elles n'avaient qu'un onglet pour elles seules.
 *
 * Sur la ligne, la case et la liste déroulante vont ensemble : décider qu'un
 * champ paraît et décider d'où il vient sont la même question, posée deux fois
 * si on les sépare. Décocher retire la liste sans effacer le réglage.
 */
export function ouvreFiche(apres) {
  const e = courant();
  const src = source(e, "stands");
  const bloc = correspondance(e, src);
  const mappable = src !== "aucun";

  /* Une ligne réservée à un autre fournisseur n'a rien à faire ici : le champ
     qu'elle propose n'existe pas de ce côté, et la case masquerait un champ
     que la fiche n'affiche de toute façon pas. */
  const lignes = () => LIGNES_FICHE.filter((l) => !l.source || l.source === src);

  _console.ouvreModale("Fiche détail", (corps) => {
    /* Sans source d'exposants, il n'y a pas de champ d'origine à associer : le
       tableau n'aurait qu'une colonne vide, et la liste de cases suffit. */
    if (!mappable) {
      const cases = document.createElement("div");
      cases.className = "colonne-cases";
      lignes().filter((l) => l.cle).forEach((l) => {
        const c = caseFiche("stand", l.cle, l.libelle, l.aide);
        if (FICHE_INERTE.indexOf(l.cle) >= 0) c.classList.add("source-inerte");
        cases.appendChild(c);
      });
      corps.appendChild(cases);
      const p = document.createElement("p");
      p.className = "aide";
      p.textContent = "Aucune source d'exposants : il n'y a pas de champ " +
        "d'origine à associer. Choisissez-en une dans « Provenance des données ».";
      corps.appendChild(p);
    } else {
      /* Avant les champs, les fiches : désigner un champ d'origine ne sert à
         rien tant qu'on lit les mauvaises fiches. Le cadre vient donc en
         premier, et il n'existe que pour Eventmaker — Klipso range ses
         exposants par dossier, pas par catégorie d'invités. */
      if (src === "eventmaker") corps.appendChild(cadreCategories(src));
      CADRES_FICHE.forEach((def) => {
        const duCadre = lignes().filter((l) => (l.groupe || "exposant") === def.cle);
        /* Le rattachement rejoint le cadre de l'exposant : ces champs sont lus
           sur sa fiche comme les autres, ils n'en sortent simplement rien
           d'affichable. */
        const rattachement = def.cle !== "exposant" ? null
          : (LIGNES_RATTACHEMENT[src] || []);
        corps.appendChild(cadreFiche(def, [
          tableauChamps(duCadre, "stand", src, true, def.cle === "exposant"),
          rattachement && rattachement.length ? sousTitre("Ce qui ne s'affiche pas") : null,
          rattachement && rattachement.length
            ? tableauChamps(rattachement, "stand", src, false) : null,
        ]));
      });

      /* Les champs que ce salon s'est ajoutés, dans un cadre à eux : ils ne
         viennent pas d'une liste que le code tient, et ce sont les seuls
         qu'on puisse renommer ou retirer. */
      const redessine = () => ouvreFiche(apres);
      const perso = lignesPerso(e, redessine);
      corps.appendChild(cadreFiche(
        { titre: "Champs propres à ce salon", domaine: "stands",
          aide: "Un champ que ce salon est seul à tenir. Il se règle comme les " +
            "autres — un champ d'origine, une case pour l'afficher, une case " +
            "pour en faire un critère de recherche — et n'existe que pour cet " +
            "événement. Un champ à choix multiple se sépare tout seul : la " +
            "source joint ses valeurs par un point-virgule, et chacune compte " +
            "pour elle-même. La version anglaise vient d'un second champ de la " +
            "source, à désigner sous le premier : un champ à choix a déjà " +
            "l'anglais de ses valeurs, un texte libre n'en a aucun." },
        [
          perso.length ? tableauChamps(perso, "stand", src, true, true) : null,
          (() => {
            const pied = document.createElement("div");
            pied.className = "pied-perso";
            const b = document.createElement("button");
            b.type = "button";
            b.className = "btn petit";
            b.textContent = "Ajouter un champ";
            b.onclick = () => ajouteChampPerso(_console.gardeLaPlace(redessine));
            pied.appendChild(b);
            if (!perso.length) {
              const p = document.createElement("span");
              p.className = "aide";
              p.textContent = "Aucun champ propre à ce salon pour le moment.";
              pied.appendChild(p);
            }
            return pied;
          })(),
        ]));
    }

    const note = document.createElement("p");
    note.className = "aide";
    note.textContent = mappable
      ? (bloc.detecteLe
        ? "Les champs proposés viennent du relevé de la dernière " +
          "synchronisation, le " + new Date(bloc.detecteLe).toLocaleString("fr-FR",
            { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }) +
          ". Un champ choisi à la main n'est plus jamais reproposé, et le " +
          "réglage prend effet à la synchronisation suivante."
        : "Les champs d'origine se relèvent à la synchronisation : lancez-en " +
          "une pour qu'ils soient proposés ici.")
      : "Le nom et le pavillon sont toujours affichés : sans eux la fiche ne " +
        "désigne plus rien.";
    corps.appendChild(note);

    /* D'où vient un champ se décide ici, et nulle part ailleurs : c'est la
       seule fenêtre qui voie le relevé de la source. Ce que la fiche en montre
       se décide des deux côtés — la case ici, le glissé sur le plan — parce que
       c'est le même réglage, et que le plan seul peut le faire juger : l'aperçu
       y porte l'habillage retenu et les valeurs d'un vrai stand. Le dire, faute
       de quoi on chercherait le reste dans cette fenêtre — c'est là qu'il
       était. */
    const ou = document.createElement("p");
    ou.className = "aide";
    ou.textContent = "Décocher un champ le renvoie en réserve sur le plan, où " +
      "il attend d'être réaffiché. C'est là que se règle le reste de la fiche " +
      "— l'ordre des champs, les sections qui les réunissent sous un même " +
      "titre, les intitulés qui paraissent devant les valeurs : engrenage, " +
      "« Fiche Stand ». Ce qu'une fiche de zone organisateur montre — logo, " +
      "description, lien, programme — s'y règle aussi : engrenage, « Zones ».";
    corps.appendChild(ou);
  }, [{ libelle: "Terminé", genre: "primaire" }], apres);
}

/**
 * Les catégories d'invités qui portent les exposants.
 *
 * Eventmaker range toutes ses fiches — visiteurs, intervenants, organisateurs,
 * exposants — dans les mêmes catégories, nommées librement par l'organisateur.
 * La synchronisation devinait laquelle est celle des exposants en cherchant
 * qui porte un numéro de stand ; elle se trompait de deux façons, et le cadre
 * répond aux deux.
 *
 * Elle retient une catégorie entière dès qu'une seule de ses fiches porte un
 * numéro : « EXPOSANT (raison sociale) » de Moove On mêle 51 sociétés et 36
 * personnes, et c'est le champ d'une personne que la console proposait. Et
 * elle ne voit pas une catégorie d'exposants dont aucune fiche ne porte encore
 * de numéro — au début d'un salon, c'est-à-dire quand on le règle.
 *
 * Cocher, c'est donc décider : la synchronisation suivante ne lit plus que
 * ces catégories-là, sans les sonder. Tout décocher rend la main à la
 * détection, qui reste le bon réglage pour un salon qui n'a jamais posé de
 * problème.
 */
function cadreCategories(src) {
  const e = courant();
  const bloc = correspondance(e, src);
  const catalogue = bloc.catalogue || [];
  const detectees = bloc.retenues || [];
  // le choix vit à côté du relevé, comme les champs : c'est le même réglage
  const choisies = [].concat(bloc.categories || []).map(String);

  const zone = document.createElement("div");
  zone.className = "valeurs";

  const note = document.createElement("p");
  note.className = "aide";

  const AUTO = "Aucune catégorie désignée : la synchronisation cherche " +
    "elle-même celles dont les fiches portent un numéro de stand";
  const dis = () => {
    note.textContent = choisies.length > 1
      ? choisies.length + " catégories désignées : la synchronisation ne lira " +
        "que leurs fiches."
      : choisies.length
      ? "1 catégorie désignée : la synchronisation ne lira que ses fiches."
      : !catalogue.length
      ? "Les catégories se relèvent à la synchronisation : lancez-en une pour " +
        "qu'elles soient proposées ici."
      : detectees.length
      ? AUTO + ", et la dernière en a retenu " + detectees.length + "."
      : AUTO + ", et la dernière n'en a retenu aucune.";
  };

  const enregistre = async () => {
    const e2 = courant();
    const avant = e2.correspondances;
    const corr = { ...(e2.correspondances || {}) };
    const part = { ...(corr[src] || {}) };
    if (choisies.length) part.categories = [...choisies];
    else delete part.categories;
    corr[src] = part;
    e2.correspondances = corr;
    try { await majEvenement(e2.id, { correspondances: corr }); }
    catch (err) { e2.correspondances = avant; _console.signale(err.message, true); }
  };

  catalogue.forEach((c) => {
    const id = String(c.id);
    const l = document.createElement("label");
    l.className = "puce";
    /* Celle que la dernière synchronisation avait retenue d'elle-même se
       signale : c'est la réponse à « laquelle, déjà ? » sur un salon dont on
       ne connaît pas la nomenclature interne. */
    const auto = detectees.indexOf(id) >= 0;
    if (!auto) l.dataset.hors = "1";
    l.innerHTML = '<input type="checkbox"><span></span>';
    l.querySelector("span").textContent = c.nom || id;
    l.title = auto ? "des fiches de cette catégorie portent un numéro de stand"
      : "aucune fiche de cette catégorie ne portait de numéro de stand";
    const i = l.querySelector("input");
    i.checked = choisies.indexOf(id) >= 0;
    i.onchange = () => {
      const k = choisies.indexOf(id);
      if (i.checked && k < 0) choisies.push(id);
      if (!i.checked && k >= 0) choisies.splice(k, 1);
      enregistre();
      dis();
    };
    zone.appendChild(l);
  });

  dis();
  return cadreFiche(
    { titre: "Catégories d'invités", domaine: "stands",
      aide: "Les fiches que la synchronisation lit. Une catégorie Eventmaker " +
        "mêle souvent les sociétés et les personnes qui les représentent : " +
        "cochez celles qui portent les exposants, et rien d'autre n'est lu. " +
        "Tout décocher rend la main à la détection automatique. Le réglage " +
        "prend effet à la synchronisation suivante." },
    [catalogue.length ? zone : null, note]);
}

const sousTitre = (txt) => {
  const s = document.createElement("span");
  s.className = "eyebrow sous-titre";
  s.textContent = txt;
  return s;
};

/**
 * Le tableau d'un groupe de lignes.
 *
 * `avecCases` distingue ce que la fiche montre — une case décide de son
 * affichage — de ce qui ne s'affiche jamais mais décide du reste : le numéro
 * de stand par lequel une fiche retrouve son emplacement, l'exclusion du
 * catalogue. Les seconds n'ont rien à cocher.
 */
function tableauChamps(lignes, type, src, avecCases, avecCriteres) {
  const t = document.createElement("table");
  t.className = "champs";
  t.innerHTML = "<thead><tr>" + (avecCases ? "<th>Afficher</th>" : "") +
    "<th>Sur la fiche</th><th>Champ d'origine</th>" +
    (avecCriteres ? "<th>Critère</th>" : "") + "</tr></thead>";
  const tb = document.createElement("tbody");

  /* Une ligne peut n'avoir pas de case à elle et suivre celle d'une autre :
     le code postal tient sur la ligne de l'adresse, et disparaît avec elle.
     Elles s'inscrivent ici, et la case du chef de file les entraîne. */
  const suiveurs = {};
  const affiche = (cle) => paraitSurFiche(courant(), type, cle);

  lignes.forEach((l) => {
    const tr = document.createElement("tr");
    tr.innerHTML = (avecCases ? '<td class="montre"></td>' : "") +
      '<td class="n"><span class="lib"></span><span class="aide"></span></td>' +
      '<td class="orig"></td>' + (avecCriteres ? '<td class="critere"></td>' : "");
    tr.querySelector(".lib").textContent = l.libelle;
    if (l.aide) tr.querySelector(".aide").textContent = l.aide;

    /* Renommer et retirer vivent à côté de l'intitulé : c'est de lui qu'ils
       parlent, et un champ créé à la main est le seul à en avoir. */
    (l.outils || []).forEach((o) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "outil" + (o.genre ? " " + o.genre : "");
      b.title = o.titre;
      b.setAttribute("aria-label", o.titre + " " + l.libelle);
      b.textContent = o.texte;
      b.onclick = o.action;
      // dans l'intitulé et non après lui : ils tiennent sur sa ligne
      tr.querySelector(".lib").appendChild(b);
    });

    /* Le champ d'origine d'abord : c'est lui que la case va montrer ou
       cacher, il doit donc exister avant elle. */
    const cellule = tr.querySelector("td.orig");
    let choix = null, choixEn = null;
    if (l.cible && l.sourcePropre) {
      /* La source d'abord, puis le champ chez elle : changer de fournisseur
         change la liste des champs proposés, et le réglage du champ reste
         rangé chez chacun — revenir à l'autre le retrouve tel qu'on l'a
         laissé. */
      const hote = document.createElement("div");
      hote.className = "source-propre";
      const etiq = document.createElement("span");
      etiq.className = "etiq";
      etiq.textContent = "Source";
      const choixSrc = document.createElement("select");
      SOURCES_NOM.forEach((k) => {
        const o = document.createElement("option");
        o.value = k;
        o.textContent = FOURNISSEURS[k] +
          (k === src ? " — comme les exposants" : "");
        choixSrc.appendChild(o);
      });
      choixSrc.value = sourceNom(courant());
      const note = document.createElement("span");
      note.className = "aide";
      hote.appendChild(etiq);
      hote.appendChild(choixSrc);
      cellule.appendChild(hote);

      const pose = () => {
        const srcN = choixSrc.value;
        const suivant = champOrigine(srcN, l.cible,
          (genre) => { tr.dataset.etat = genre; }, l.ouiNon);
        if (choix) choix.hote.replaceWith(suivant.hote);
        else cellule.appendChild(suivant.hote);
        choix = suivant;
        /* Une source qu'aucune synchronisation n'a encore lue n'a pas de
           champs à proposer : le dire, plutôt que de laisser croire la liste
           complète avec sa seule entrée « Par défaut ». */
        const e2 = courant();
        const sansCle = srcN === "eventmaker" && !(e2.cles || {}).eventmaker;
        note.textContent = sansCle
          ? "Identifiant Eventmaker manquant : renseignez-le dans « Source des données »."
          : !(correspondance(e2, srcN).detectes || []).length
            ? "Les champs de " + FOURNISSEURS[srcN] + " seront proposés après " +
              "la prochaine synchronisation."
            : "";
        note.classList.toggle("alerte", sansCle);
        note.hidden = !note.textContent;
        suivant.hote.after(note);
      };
      pose();

      choixSrc.onchange = async () => {
        const e2 = courant();
        const avant = e2.sources;
        e2.sources = { ...(e2.sources || {}) };
        /* Revenir à la source des exposants efface le réglage plutôt que de
           l'écrire : le nom la suit alors, même si on la change plus tard. */
        if (choixSrc.value === source(e2, "stands")) delete e2.sources.nom;
        else e2.sources.nom = { fournisseur: choixSrc.value };
        pose();
        try { await majEvenement(e2.id, { sources: e2.sources }); }
        catch (err) {
          e2.sources = avant;
          choixSrc.value = sourceNom(e2);
          pose();
          _console.signale(err.message, true);
        }
      };
    } else if (l.cible) {
      choix = champOrigine(src, l.cible, (genre) => { tr.dataset.etat = genre; },
        l.ouiNon);
      cellule.appendChild(choix.hote);
      /* Et l'origine de l'anglais, pour les champs qui en acceptent une : un
         champ à choix voit ses valeurs traduites par la source, un texte libre
         n'a d'anglais que celui qu'un second champ porte. Sous la première et
         non à côté : c'est le même champ en deux temps, et une colonne de plus
         serait à lire sur toutes les lignes qui n'en ont pas. */
      if (l.cibleEn) {
        choixEn = champOrigine(src, l.cibleEn, null, false, "pas de version anglaise");
        const bloc = document.createElement("div");
        bloc.className = "origine-en";
        const e = document.createElement("span");
        e.className = "etiq";
        e.textContent = "Version anglaise";
        bloc.appendChild(e);
        bloc.appendChild(choixEn.hote);
        cellule.appendChild(bloc);
      }
    } else {
      const fixe = document.createElement("span");
      fixe.className = "etat-salle";
      fixe.dataset.genre = "libre";
      // le programme change de fournisseur d'un salon à l'autre : sa mention
      // se calcule, elle ne s'écrit pas
      fixe.textContent = (typeof l.fixe === "function" ? l.fixe(courant()) : l.fixe) ||
        "sans champ à régler";
      cellule.appendChild(fixe);
    }

    /* Un champ que la fiche ne montre pas n'a pas de source à choisir : la
       liste disparaît plutôt que de rester là, grisée, à occuper une ligne
       pour rien. Le réglage, lui, n'est pas effacé — il revient tel quel en
       recochant.

       Sauf s'il sert de critère de recherche : il est alors lu sans paraître,
       et cacher son origine reviendrait à en interdire le réglage. */
    let montreOn = true, critereOn = criteres(courant())[l.cle] === true;
    const bascule = (montre) => {
      if (montre !== undefined) montreOn = montre;
      const sert = montreOn || critereOn;
      tr.classList.toggle("source-inerte", !sert);
      if (!choix) return;
      choix.hote.hidden = !sert;
      if (choixEn) choixEn.hote.parentElement.hidden = !sert;
      // la barre de couleur dit d'où vient un champ : sans champ, elle ne dit
      // plus rien
      if (sert) choix.dis(); else delete tr.dataset.etat;
    };

    /* La case du critère ne décide pas de l'affichage mais de la recherche :
       un champ peut filtrer sans paraître sur la fiche — un code interne, une
       famille de produits — et l'inverse est vrai tout autant. */
    if (avecCriteres && l.critere && l.cle) {
      const cc = tr.querySelector(".critere");
      cc.appendChild(caseCritere(l.cle, (on) => {
        critereOn = on;
        bascule();
      }));
      /* En colonne empilée — un téléphone — les en-têtes du tableau
         disparaissent : la case dirait « oui » à une question qu'on ne lit
         plus. L'étiquette ne paraît que là. */
      const etiq = document.createElement("span");
      etiq.className = "etiq";
      etiq.textContent = "Critère de recherche";
      cc.appendChild(etiq);
    }

    if (avecCases) {
      const c = tr.querySelector(".montre");
      if (!l.cle) {
        // rien à décider ici : la case mentirait en laissant croire au choix
        const tj = document.createElement("span");
        tj.className = "etat-salle";
        tj.dataset.genre = "libre";
        tj.textContent = l.montre || "toujours";
        c.appendChild(tj);
        if (l.suit) {
          (suiveurs[l.suit] = suiveurs[l.suit] || []).push(bascule);
          bascule(affiche(l.suit));
        }
      } else {
        c.appendChild(caseFiche(type, l.cle, "", null, (montre) => {
          bascule(montre);
          (suiveurs[l.cle] || []).forEach((f) => f(montre));
        }));
      }
    }
    tb.appendChild(tr);
  });

  t.appendChild(tb);
  return t;
}

/* ------------------------------------------------------------------
   Correspondance des champs d'origine

   Les champs d'exposant ne portent pas le même nom d'un salon à l'autre :
   « x_Catalogue_RaisonSociale » ici, autre chose ailleurs, et côté Eventmaker
   ce sont des champs de fiche nommés par l'organisateur. Écrits dans la
   synchronisation, ils condamnaient un salon nommé autrement à un déploiement.

   La liste des champs disponibles vient de la synchronisation, qui les relève
   en lisant les fiches — il n'y a rien à demander de plus, et rien à détecter
   à part.
   ------------------------------------------------------------------ */

/* Ce que le réglage écrit et affiche — `DEFAUT_CHAMP`, `AUCUN_CHAMP`,
   `encode`, `decode`, `correspondance`, `intitule`, `intituleSuite`,
   `ACCORDS`, `aplani`, `autreFace` — vient de `modules/correspondance.mjs`. */

/**
 * La liste déroulante des champs d'origine d'une cible, et ce qu'elle vaut.
 *
 * Le réglage s'enregistre à chaque changement, comme les cases de la même
 * fenêtre : une fenêtre où la moitié des gestes se valide et l'autre pas
 * serait un piège.
 */
function champOrigine(src, cible, apres, ouiNon, sansChamp) {
  const e = courant();
  const bloc = correspondance(e, src);
  const detectes = bloc.detectes || [];
  const defauts = bloc.defauts || null;
  const propose = bloc.propose || null;
  const regle = (bloc.champs || {})[cible];

  /* Rien de réglé et une proposition sous la main : c'est elle qu'on montre.
     Elle ne s'enregistre pas pour autant — elle décrit ce que la
     synchronisation ferait de toute façon, et l'enregistrer ne changerait
     rien qu'en apparence. */
  const propose1 = propose ? encode(propose[cible] || []) : null;
  const choisi = regle !== undefined ? encode(regle)
    : propose1 !== null ? propose1 : DEFAUT_CHAMP;
  const parDefaut = defauts ? ([].concat(defauts[cible] || []))[0] : null;
  // « proposé » et « choisi à la main » ne se distinguent que par là : le
  // relever une fois pour toutes le figerait au premier état affiché
  let reglee = regle !== undefined;

  const hote = document.createElement("div");
  const sel = document.createElement("select");
  const opt = (v, txt, dans) => {
    const o = document.createElement("option");
    o.value = v;
    o.textContent = txt;
    (dans || sel).appendChild(o);
  };
  opt(DEFAUT_CHAMP, parDefaut ? "Par défaut — " + parDefaut
    : defauts ? "Par défaut — aucun champ" : "Par défaut");
  opt(AUCUN_CHAMP, "Aucun — laisser vide");
  // une cible qui lit plusieurs champs à la suite ne se dit pas dans une liste
  // de champs uniques : elle a son entrée à elle
  const suites = {};
  [choisi, propose1].forEach((v) => {
    if (!v || v.indexOf("|") < 0 || suites[v]) return;
    suites[v] = true;
    opt(v, intituleSuite(v, detectes));
  });
  /* Les champs se rangent par origine — personnalisés d'abord, ce sont eux qui
     diffèrent d'un salon à l'autre — sans quoi deux cents entrées se lisent
     comme une seule. */
  const groupes = {};
  detectes.forEach((d) => {
    const g = d.groupe || "Champs";
    if (!groupes[g]) {
      groupes[g] = document.createElement("optgroup");
      groupes[g].label = g;
      sel.appendChild(groupes[g]);
    }
    opt(d.cle, intitule(d), groupes[g]);
  });
  /* Un champ réglé que le dernier relevé ne connaît pas reste proposé : mieux
     vaut le montrer signalé que le remplacer en silence — il peut n'être
     renseigné sur aucune des fiches lues, et rester le bon. */
  if (choisi !== DEFAUT_CHAMP && choisi !== AUCUN_CHAMP && !suites[choisi] &&
      !detectes.some((d) => d.cle === choisi)) {
    opt(choisi, choisi + " (absent du dernier relevé)");
  }
  sel.value = choisi;
  hote.appendChild(sel);

  const etat = document.createElement("span");
  etat.className = "etat-salle";
  hote.appendChild(etat);

  /* Une cible vide n'appelle pas toujours au secours. Certaines n'ont aucun
     champ d'origine d'office — Klipso ne porte ni adresse ni réseaux sociaux —
     et rester vides est leur état normal ; seules celles dont le champ habituel
     a disparu méritent le rouge. */
  const sansDefaut = defauts !== null && !([].concat(defauts[cible] || [])).length;
  const dis = () => {
    const v = sel.value;
    const vide = v === AUCUN_CHAMP;
    const suggere = propose1 !== null && v === propose1 && !reglee;
    const genre = vide ? (sansDefaut || !propose1 ? "libre" : "manque")
      : v === DEFAUT_CHAMP || suggere ? "auto" : "manuel";
    etat.textContent = vide
      ? (sansChamp ? sansChamp
        : sansDefaut ? "sans champ d'origine connu"
        : propose1 ? "champ habituel introuvable : à désigner" : "laissé vide")
      : v === DEFAUT_CHAMP ? "champ par défaut"
      : suggere ? "proposé d'après le dernier relevé" : "choisi à la main";
    etat.dataset.genre = genre;
    if (apres) apres(genre);
  };
  dis();

  /* Le champ retenu et les valeurs qui le font compter vivent dans le même
     bloc : c'est un seul réglage en deux temps, et il s'enregistre d'un coup. */
  const enregistre = async (part) => {
    const e2 = courant();
    const avant = e2.correspondances;
    const corr = { ...(e2.correspondances || {}) };
    corr[src] = { ...(corr[src] || {}), ...part };
    e2.correspondances = corr;
    try { await majEvenement(e2.id, { correspondances: corr }); }
    catch (err) { e2.correspondances = avant; _console.signale(err.message, true); }
  };

  sel.onchange = () => {
    const champs = { ...(correspondance(courant(), src).champs || {}) };
    const v = decode(sel.value);
    reglee = v !== undefined;
    if (v === undefined) delete champs[cible]; else champs[cible] = v;
    /* Les valeurs retenues appartenaient au champ précédent : les garder
       désignerait des valeurs que le nouveau ne porte pas. */
    const valeurs = { ...(correspondance(courant(), src).valeurs || {}) };
    delete valeurs[cible];
    enregistre({ champs, valeurs });
    dis();
    majValeurs();
  };

  /* ---- les valeurs qui valent oui ----

     Un champ à choix ne répond pas par oui ou non : « anciennete » vaut
     « Nouveau Client », « Client N-1 » ou « Retour », et c'est à l'exploitant
     de dire lesquelles comptent — un salon signalera les retours, un autre
     non. Les valeurs proposées sont celles que le champ peut prendre : celles
     que la synchronisation a vues, celles que la source déclare sans qu'aucune
     fiche ne les porte, et la face manquante d'un oui/non. Un champ de texte
     libre n'en a aucune, et retombe alors sur le oui/non usuel. */
  const zoneValeurs = document.createElement("div");
  zoneValeurs.className = "valeurs";
  if (ouiNon) hote.appendChild(zoneValeurs);

  function majValeurs() {
    if (!ouiNon) return;
    zoneValeurs.innerHTML = "";
    // sans champ désigné, il n'y a pas de valeur à qualifier
    if (sel.value === DEFAUT_CHAMP || sel.value === AUCUN_CHAMP) {
      zoneValeurs.hidden = true;
      return;
    }
    zoneValeurs.hidden = false;

    /* Séparées ici aussi, et pas seulement au relevé : un salon réglé avant ce
       découpage porte encore des valeurs entières, et n'attend pas la
       prochaine synchronisation pour se laisser cocher. */
    const retenues = separeValeurs(
      (correspondance(courant(), src).valeurs || {})[cible] || []);
    const d = detectes.find((x) => x.cle === sel.value);
    const relevees = separeValeurs((d && d.valeurs) || []);
    // la codification du champ, quand la source en déclare une : code → libellé
    const choix = (d && d.choix) || {};
    /* Le relevé a bien lu ce champ, mais ses valeurs ne se ressemblent pas
       assez pour faire une liste : une raison sociale, une date. Le dire
       épargne d'attendre une synchronisation qui n'en relèverait pas plus. */
    const libre = !!(d && d.libre);

    /* Quatre provenances pour une même liste, et l'ordre les range : ce que
       les fiches portent, ce que la source déclare sans que rien ne le porte,
       la face manquante d'un oui/non, puis ce que l'exploitant a retenu — car
       une valeur retenue reste proposée même si le relevé l'ignore : saisie à
       la main, ou relevée avant que la synchronisation ne garde les valeurs
       distinctes. L'effacer de l'affichage reviendrait à l'effacer tout court.

       Tout ce qui n'a été vu sur aucune fiche est marqué : la valeur est
       cochable, mais l'exploitant doit savoir que personne ne la porte —
       c'est parfois le signe qu'il vise le mauvais champ. */
    const offertes = [];
    const offre = (v, hors) => {
      if (!v || offertes.some((o) => o.v === v)) return;
      offertes.push({ v, hors });
    };
    relevees.forEach((v) => offre(v, false));
    Object.keys(choix).forEach((v) => offre(v, true));
    autreFace(relevees).forEach((v) => offre(v, true));
    retenues.forEach((v) => offre(v, true));
    /* Sans valeur retenue, la synchronisation s'en remet aux accords usuels :
       un champ qui peut en porter un signale donc déjà, et le dire en rouge
       comme un réglage manquant serait un faux appel au secours. */
    const accords = offertes.map((o) => o.v).filter((v) => ACCORDS.indexOf(aplani(v)) >= 0);

    const dit = document.createElement("span");
    dit.className = "mini";
    zoneValeurs.appendChild(dit);
    /* Un champ dont on connaît un exemple mais aucune valeur vient d'un relevé
       plus vieux que la façon de les garder : le dire avec sa date épargne
       d'attendre une liste qu'une synchronisation lancée depuis remplirait. */
    const dateReleve = bloc.detecteLe
      ? new Date(bloc.detecteLe).toLocaleString("fr-FR",
        { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })
      : null;
    const rappel = () => {
      dit.textContent = retenues.length
        ? "vaut oui quand la valeur est :"
        : accords.length
          ? "aucune valeur retenue : « " + accords.join(" », « ") + " » " +
            (accords.length > 1 ? "valent" : "vaut") + " oui d'office"
          : offertes.length
            ? "aucune valeur retenue : rien ne sera signalé"
            : libre
              ? "trop de valeurs différentes pour en proposer la liste : " +
                "saisissez celle qui compte"
              : "valeurs inconnues" + (dateReleve ? " au relevé du " + dateReleve : "") +
                " : la prochaine synchronisation les relèvera, ou saisissez-en une ici";
      dit.dataset.genre = retenues.length || accords.length ? "" : "manque";
    };
    rappel();

    /* Le libellé plutôt que le code quand la codification en donne un : un
       champ à choix Klipso ne porte que « FEP26_GAM102 », et c'est
       « Prêt-à-porter » que l'exploitant cherche. Le code reste sous la
       souris — c'est lui qui sera comparé aux fiches. */
    const puce = (v, hors) => {
      const l = document.createElement("label");
      l.className = "puce";
      if (hors) l.dataset.hors = "1";
      l.innerHTML = '<input type="checkbox"><span></span>';
      l.querySelector("span").textContent = choix[v] || v;
      l.title = (choix[v] ? v + " — " : "") +
        (hors ? "portée par aucune des fiches relevées" : "relevée sur les fiches");
      const i = l.querySelector("input");
      i.checked = retenues.indexOf(v) >= 0;
      i.onchange = () => {
        const k = retenues.indexOf(v);
        if (i.checked && k < 0) retenues.push(v);
        if (!i.checked && k >= 0) retenues.splice(k, 1);
        const valeurs = { ...(correspondance(courant(), src).valeurs || {}) };
        if (retenues.length) valeurs[cible] = [...retenues]; else delete valeurs[cible];
        enregistre({ valeurs });
        rappel();
      };
      zoneValeurs.appendChild(l);
      return l;
    };
    offertes.forEach((o) => puce(o.v, o.hors));

    /* De quoi désigner une valeur que le relevé ignore. Il n'en a pas toujours
       une liste : un salon synchronisé avant que la synchronisation ne les
       garde n'en a aucune, et un champ de texte libre non plus. Attendre le
       prochain passage pour régler la fiche serait une attente de trop. */
    const ajout = document.createElement("input");
    ajout.type = "text";
    ajout.className = "ajout-valeur";
    ajout.placeholder = "autre valeur…";
    ajout.spellcheck = false;
    ajout.onkeydown = (ev) => {
      if (ev.key !== "Enter") return;
      ev.preventDefault();
      /* Une saisie recopiée depuis une fiche porte parfois la chaîne entière :
         elle vaut alors autant de valeurs qu'elle en joint. */
      const saisies = separeValeurs(ajout.value)
        .filter((v) => !offertes.some((o) => o.v === v));
      ajout.value = "";
      if (!saisies.length) return;
      saisies.forEach((v) => {
        retenues.push(v);
        offertes.push({ v, hors: true });
        const l = puce(v, true);
        l.querySelector("input").checked = true;
      });
      const valeurs = { ...(correspondance(courant(), src).valeurs || {}) };
      valeurs[cible] = [...retenues];
      enregistre({ valeurs });
      zoneValeurs.appendChild(ajout);
      rappel();
    };
    zoneValeurs.appendChild(ajout);
  }
  majValeurs();

  return { hote, sel, dis };
}
