/* ============================================================
   « Vous êtes ici » — l'affiche à coller, côté exploitant

   L'exploitant désigne un endroit sur le plan — un stand, une entrée, ou un
   simple point de l'allée — et repart avec une affiche à coller là. Le
   pourquoi de la fonction, et ce que le visiteur reçoit en photographiant le
   code, sont dans `modules/ici.mjs`. Ce module-ci n'est embarqué que par
   `plan-admin.mjs` : le visiteur n'a ni affiche à produire, ni endroit à
   désigner.

   La visée de l'itinéraire, le dessin et le tiroir sont encore soudés :
   `_ici.html` les confie par `brancheAfficheIci`.
   ============================================================ */
import { $ } from "./dom.mjs";
import { esc } from "./texte.mjs";
import { DATA, parId, P } from "./donnees.mjs";
import { SLUG, cheminPartageable } from "./salon.mjs";
import { ouvreModale } from "./fenetre.mjs";
import { qrTrame, qrChemin, qrSvg } from "./qr.mjs";
import { calquesDe, pointObjet, pointRepere } from "./itineraire.mjs";
import { lieuNomme, pointLibre } from "./borne.mjs";
import { ICI_LIBRE } from "./ici.mjs";
import { versPlan } from "./vue.mjs";

/* Ce que le code soudé confie, et rien avant qu'il l'ait fait. La visée est
   un lecteur, avec sa porte : sa variable vit dans `_itineraire.html`. */
/** @type {Record<string, any>} */
let soude = {};
const visee = () => soude.visee();
const vise = (v) => soude.vise(v);
const bandeauVisee = () => soude.bandeauVisee();
const finVisee = () => soude.finVisee();
const ferme = () => soude.ferme();
const fermeItineraire = () => soude.fermeItineraire();
const fermeParcours = () => soude.fermeParcours();
const formeParId = (id) => soude.formeParId(id);
const largeur = (txt, police) => soude.largeur(txt, police);
const racine = document.documentElement;

/* Combien de caractères de l'identifiant du pavillon partent dans l'adresse.
   Huit séparent largement les trois pavillons d'un salon, et `prefixePlan` en
   prend davantage dans le cas, jamais vu, où deux commenceraient pareil. */
const ICI_PREFIXE = 8;

/* ------------------------------------------------------------
   Ce que l'adresse écrit — `modules/ici.mjs` le relit
   ------------------------------------------------------------ */
/**
 * Le pavillon, par le début de son identifiant.
 *
 * Son rang aurait tenu en un caractère, et c'est précisément ce qu'il ne faut
 * pas : une synchronisation qui ajoute un hall décale les rangs, et l'affiche
 * collée la veille désignerait le pavillon d'à côté — la même raison qui fait
 * qu'une borne retient un identifiant (voir `_borne.html`). L'identifiant
 * entier, lui, fait trente-six caractères, que le code QR paierait d'une
 * version de plus et d'autant de portée en moins.
 */
function prefixePlan(i){
  const id = String(DATA.plans[i].id);
  for (let n = ICI_PREFIXE; n < id.length; n++){
    const d = id.slice(0, n);
    if (!DATA.plans.some((p, j) => j !== i && String(p.id).slice(0, n) === d)) return d;
  }
  return id;
}

/* Une coordonnée s'écrit au décimètre. C'est déjà plus fin que l'endroit où
   l'on colle une affiche, et des décimales de plus n'allongeraient que le
   code. */
const coteIci = n => String(Math.round(n * 10) / 10);

/**
 * Ce que l'adresse écrira d'un élément : ce que le plan en montre, et non son
 * identifiant. Un numéro de stand survit au changement d'exposant, et un
 * libellé de repère se relit sur l'affiche en cas de doute — un identifiant
 * Klipso ne dit rien à personne, et l'affiche vit toute la durée du salon.
 *
 * D'un repère, c'est le texte brut qu'on prend, et non le nom que le point
 * porte : `nomRepere` le passe par la traduction, si bien qu'une affiche
 * produite depuis la page anglaise nommerait l'endroit en anglais — et
 * `candidats`, qui filtre sur le texte brut, ne le retrouverait pas chez le
 * visiteur français. Le calque est relu ici plutôt que par `formeParId`, qui
 * ne cherche que le pavillon affiché : l'endroit d'une affiche peut être dans
 * un autre.
 */
function nomCodeIci(pt){
  if (pt.genre === "repere"){
    const f = calquesDe(DATA.plans[pt.p])
      .flatMap(c => c.formes || []).find(x => x.id === pt.id);
    return f && f.txt ? String(f.txt).trim() : pt.nom;
  }
  const o = pt.obj;
  return o && o.code ? String(o.code) : pt.nom;
}

/**
 * La valeur du paramètre pour un point.
 *
 * Le nom ne part que s'il revient. `lieuNomme` classe des candidats, il ne
 * relit pas un identifiant : deux stands dont l'un porte le nom de l'autre en
 * entier, et le mieux classé n'est pas celui qu'on a désigné. Un code imprimé
 * une fois pour tout le salon n'a pas le droit de se tromper de voisin, on
 * vérifie donc l'aller-retour et l'on se rabat sur les coordonnées.
 */
function codeIci(pt){
  if (pt.genre === "repere" || pt.genre === "objet"){
    const nom = nomCodeIci(pt);
    const r = nom && lieuNomme(nom);
    if (r && r.cle === pt.cle) return nom;
  }
  return ICI_LIBRE + prefixePlan(pt.p) + "," + coteIci(pt.xy[0]) + "," + coteIci(pt.xy[1]);
}

/**
 * L'adresse que l'affiche portera.
 *
 * Elle se relit dans la barre du navigateur plutôt qu'elle ne se compose :
 * c'est la seule qu'on sache joignable, puisque c'est celle qui a servi à
 * ouvrir cette page-ci. La page d'administration fait exception — elle réclame
 * une session que le visiteur du hall n'a pas — et renvoie vers la page
 * publique qui vit à côté, comme le fait déjà le partage de parcours.
 */
function lienIci(code){
  const u = new URL(location.href);
  u.hash = "";
  u.pathname = cheminPartageable(u.pathname);
  const q = new URLSearchParams();
  /* Le salon est nommé même quand la page l'aurait deviné : l'affiche vaut
     alors ce qu'elle dit, et n'ouvrira pas l'édition suivante le jour où c'est
     elle qui devient le salon par défaut. */
  if (SLUG) q.set("plan", SLUG);
  q.set("ici", code);
  u.search = "?" + q;
  return u.toString();
}

/* ------------------------------------------------------------
   Côté exploitant — l'affiche à coller
   ------------------------------------------------------------ */
/**
 * Ce que le doigt désigne, du plus nommé au plus nu.
 *
 * Un repère est un lieu nommé, et c'est pour cela qu'on l'a posé : le code en
 * prend le nom et sa position. Un stand est petit, son centre est là où l'on
 * se tient quand on est devant, et son numéro se relit sur l'affiche. Une
 * zone, non : on est *dans* une zone, et son centre peut être à trente mètres
 * du totem — c'est alors l'endroit exact du doigt qui compte, comme sur le
 * fond de plan nu.
 */
function pointTouche(clientX, clientY, cible){
  const id = cible ? cible.dataset.id : null;
  if (cible && !id){
    const rep = formeParId(cible.dataset.poi);
    if (rep && rep.f.t === "repere") return pointRepere(rep.f, P());
  }
  const o = id ? parId.get(id) : null;
  if (o && o.kind !== "zone") return pointObjet(o);
  return pointLibre(versPlan(clientX, clientY));
}

/** Un appui sur le plan pendant qu'on cherche l'endroit d'une affiche. */
export function codeIciAuPoint(clientX, clientY, cible){
  if (visee() !== "ici") return false;
  return ouvreCodeIci(pointTouche(clientX, clientY, cible));
}

/** Désigner l'endroit : le plan redevient une liste de points à toucher. */
function armeCodeIci(){
  ferme();
  fermeItineraire();
  fermeParcours();
  vise("ici");
  bandeauVisee();
}

/**
 * L'affiche, en un fichier.
 *
 * Un SVG plutôt qu'une image : il s'agrandit sans grossir, ce qu'on demande à
 * un code qu'on tirera peut-être en A3 sur un totem, et il part chez
 * l'imprimeur tel quel — personne n'a à refaire la mise en page autour du
 * damier. Les proportions sont celles d'une feuille A4, le format qu'on sort
 * de l'imprimante du bureau le matin même ; une affiche plus grande n'est que
 * la même, tirée plus grand.
 *
 * Le damier reste noir sur blanc quel que soit le thème de la page : un code
 * inversé se lit encore sur un bon appareil, mal sur les autres, et rien
 * n'oblige à courir ce risque sur un papier collé pour huit jours.
 */
function afficheIci(pt, trame){
  const q = qrChemin(trame);
  /* Le damier occupe la largeur utile, marges de la feuille retirées. Son
     tracé compte en modules : une seule mise à l'échelle le porte en
     millimètres, et le silence de quatre modules qui l'entoure vient avec. */
  const cote = 150, x = (210 - cote) / 2, y = 96;
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 297" width="210mm" ' +
    'height="297mm" font-family=\'' + POLICE_AFFICHE[1] + '\'>' +
    '<rect width="210" height="297" fill="#fff"/>' +
    (DATA.evenement ? ligneAffiche(36, 7.5, 400, "#6b7280", DATA.evenement) : "") +
    ligneAffiche(62, 26, 700, "#111827", traduit("Vous êtes ici")) +
    (pt.lieu ? ligneAffiche(78, 13, 500, "#111827", pt.lieu) : "") +
    ligneAffiche(pt.lieu ? 88 : 80, 9.5, 400, "#6b7280", DATA.plans[pt.p].libelle) +
    '<g transform="translate(' + x + ' ' + y + ') scale(' + (cote / q.cote).toFixed(5) +
    ')" shape-rendering="crispEdges">' +
    '<rect width="' + q.cote + '" height="' + q.cote + '" fill="#fff"/>' +
    '<path d="' + q.d + '" fill="#000"/></g>' +
    ligneAffiche(y + cote + 18, 14, 600, "#111827", traduit("Photographiez ce code")) +
    ligneAffiche(y + cote + 30, 9.5, 400, "#6b7280",
                 traduit("Le plan du salon s'ouvre à cet endroit.")) +
    ligneAffiche(y + cote + 40, 9.5, 400, "#6b7280",
                 traduit("Vos itinéraires en partent.")) +
    '</svg>';
}

/* La police de l'affiche, et la largeur qu'il lui reste une fois les marges de
   la feuille retirées. */
const POLICE_AFFICHE = ["400", "Archivo, Inter, Helvetica, Arial, sans-serif"];
const LARGEUR_AFFICHE = 174;

/**
 * Une ligne de l'affiche, ramenée à la largeur de la feuille.
 *
 * Un texte SVG ne se replie pas tout seul, et la moitié de ce qui s'écrit ici
 * vient des données : « Salon des Maires et des Collectivités Locales » ne
 * tient pas là où « SMCL 2026 » flottait, et le libellé d'un repère peut faire
 * trois mots comme quinze. On mesure donc dans la police du tirage — la même
 * mesure que celle des libellés du plan — et l'on rétrécit ce qui dépasse. La
 * seule chose qu'une affiche n'a pas le droit de faire, c'est déborder.
 */
function ligneAffiche(y, taille, poids, teinte, txt){
  const police = [String(poids), POLICE_AFFICHE[1]];
  const f = Math.min(taille, LARGEUR_AFFICHE / Math.max(largeur(txt, police), .001));
  return '<text x="105" y="' + y + '" text-anchor="middle" font-size="' + f.toFixed(2) +
    '" font-weight="' + poids + '" fill="' + teinte + '">' + esc(txt) + '</text>';
}

/** Le nom du fichier : l'endroit d'abord, c'est ce qu'on cherche dans un
 *  dossier qui en contiendra trente. */
function nomFichierIci(pt){
  const t = (pt.lieu || DATA.plans[pt.p].libelle || "plan")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase();
  return "vous-etes-ici-" + (t || "plan") + ".svg";
}

/**
 * La fenêtre du code, une fois l'endroit désigné.
 *
 * Elle montre le damier autant qu'elle le livre : l'exploitant le photographie
 * avec son propre téléphone avant d'aller coller quoi que ce soit, et c'est le
 * seul contrôle qui vaille — un code qui s'ouvre sur le bon pavillon, au bon
 * endroit.
 */
export function ouvreCodeIci(pt){
  finVisee();
  const code = codeIci(pt);
  const lien = lienIci(code);
  /* Le damier peut manquer, en théorie seulement : il faudrait deux mille
     caractères d'adresse pour dépasser ce qu'un code sait porter. La fenêtre
     s'ouvre quand même — le lien, lui, vaut toujours, et c'est ainsi que le
     partage traite un parcours trop long. */
  const trame = qrTrame(Array.from(new TextEncoder().encode(lien)));

  ouvreModale("Code « Vous êtes ici »", corps => {
    const p = document.createElement("p");
    p.textContent = trame
      ? "Affichez ce code à cet endroit du salon : celui qui le " +
        "photographie ouvre le plan déjà situé, et ses itinéraires partent d'ici."
      : "Cette adresse est trop longue pour un code. Le lien, lui, fait le même " +
        "travail : il ouvre le plan déjà situé à cet endroit.";
    corps.appendChild(p);

    const ou = document.createElement("p");
    ou.className = "iciOu";
    ou.textContent = DATA.plans[pt.p].libelle + (pt.lieu ? " · " + pt.lieu : "");
    corps.appendChild(ou);

    if (trame){
      const plaque = document.createElement("div");
      plaque.className = "qrPlaque";
      plaque.innerHTML = qrSvg(trame, "Code à photographier qui ouvre le plan à cet endroit");
      corps.appendChild(plaque);
    }

    const champ = document.createElement("textarea");
    champ.className = "qrLien";
    champ.readOnly = true;
    champ.rows = 2;
    champ.value = lien;
    champ.onclick = () => champ.select();
    corps.appendChild(champ);

    const note = document.createElement("p");
    note.className = "qrNote";
    /* Ce qu'il faut savoir avant d'en imprimer trente : la position tient dans
       l'adresse, donc rien à créer ni à tenir à jour côté serveur — mais aussi
       rien qui se corrige à distance une fois l'affiche collée. */
    note.textContent = "La position tient dans l'adresse elle-même : il n'y a rien " +
      "à enregistrer, et le code reste valable tant que l'endroit existe. Un " +
      "code déjà affiché ne se corrige pas — refaites-en un si l'endroit change.";
    corps.appendChild(note);
  }, boutonsCodeIci(pt, lien, trame), "partage");
  return true;
}

function boutonsCodeIci(pt, lien, trame){
  let bCopie = null;
  const copie = {
    libelle: "Copier le lien", ferme: false,
    action: () => {
      /* Le libellé se relit à l'écran, où la version anglaise l'a peut-être
         réécrit : c'est donc à sa traduction qu'on le compare. */
      bCopie = bCopie ||
        [...$("mPied").children].find(x => x.textContent === traduit("Copier le lien"));
      navigator.clipboard?.writeText(lien).then(
        () => { if (bCopie){ bCopie.textContent = "Copié";
                             setTimeout(() => bCopie.textContent = "Copier le lien", 1700); } },
        () => { if (bCopie) bCopie.textContent = "Échec de la copie"; });
    },
  };
  /** @type {{ libelle: string, genre?: string, ferme?: boolean, action?: () => void }[]} */
  const boutons = [{ libelle: "Fermer" }, copie];
  if (trame) boutons.push(
    { libelle: "Imprimer", ferme: false, action: () => imprimeAfficheIci(pt, trame) },
    { libelle: "Télécharger l'affiche", genre: "accent",
      action: () => telechargeAfficheIci(pt, trame) });
  else copie.genre = "accent";
  return boutons;
}

function telechargeAfficheIci(pt, trame){
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([afficheIci(pt, trame)], { type: "image/svg+xml" }));
  a.download = nomFichierIci(pt);
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

/**
 * Imprimer l'affiche, et elle seule.
 *
 * Le plan, la bande de l'outil et la fenêtre qui a servi à produire le code
 * n'ont rien à faire sur la feuille. Plutôt qu'une deuxième fenêtre — que les
 * navigateurs bloquent, et qui n'aurait ni la police ni le thème de celle-ci —
 * l'affiche est posée à la racine du document, et un cran sur `html` la
 * désigne comme le seul contenu imprimable le temps du tirage. La page revient
 * ensuite telle qu'elle était : il n'y a rien à refermer.
 */
function imprimeAfficheIci(pt, trame){
  let z = $("afficheQr");
  if (!z){
    z = document.createElement("div");
    z.id = "afficheQr";
    /* À la racine du corps, et non dans la fenêtre : la règle d'impression
       éteint les enfants du corps un par un, et n'aurait pas su distinguer
       l'affiche du voile qui la porte. */
    document.body.appendChild(z);
  }
  z.innerHTML = afficheIci(pt, trame);
  racine.classList.add("imprime-qr");
  /* Le cran tombe au retour de `print`, qui rend la main quand la boîte de
     dialogue se referme — et par « afterprint » là où il rend la main avant,
     faute de quoi la page resterait vide à l'écran. */
  const fini = () => racine.classList.remove("imprime-qr");
  addEventListener("afterprint", fini, { once: true });
  print();
  fini();
}

/**
 * Le bouton de la bande de l'outil.
 *
 * Il vit là plutôt que dans les réglages du salon : ce n'est pas une
 * configuration qui part chez tous les visiteurs (voir `_pousse.html`), c'est
 * un geste qu'on refait à chaque affiche, et qui demande le plan sous les
 * yeux.
 */
export function boutonCodeIci(){
  const b = document.createElement("button");
  b.className = "iconbtn";
  b.id = "btnCodeIci";
  b.type = "button";
  b.title = "Produire un code « Vous êtes ici »";
  b.setAttribute("aria-label", "Produire un code « Vous êtes ici »");
  b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M4 9V5a1 1 0 0 1 1-1h4M15 4h4a1 1 0 0 1 1 1v4M20 15v4a1 1 0 0 1-1 1h-4M9 20H5a1 1 0 0 1-1-1v-4"/>' +
    '<path d="M12 7.5a4.5 4.5 0 0 0-4.5 4.5c0 3 4.5 6.5 4.5 6.5s4.5-3.5 4.5-6.5A4.5 4.5 0 0 0 12 7.5Z"/>' +
    '<circle cx="12" cy="11.8" r="1.4" fill="currentColor" stroke="none"/></svg>';
  b.onclick = armeCodeIci;
  return b;
}

/**
 * Le branchement, appelé par `_ici.html` dans sa tranche d'administration.
 *
 * @param {{ visee: () => any, vise: (v: any) => void, bandeauVisee: Function,
 *   finVisee: Function, ferme: Function, fermeItineraire: Function,
 *   fermeParcours: Function, formeParId: Function, largeur: Function }} b
 */
export function brancheAfficheIci(b){ soude = b; }
