/* ============================================================
   Le panneau des calques

   Ce que l'exploitant règle de chaque couche du plan : la montrer ou la
   masquer, sa couleur, trait ou aplat, le cadenas et le crayon d'un calque
   de dessin, ceux des couches que la source dessine, puis ce qui n'est pas un
   calque — les repères et le fond du plan. Des gestes d'exploitant, que le
   visiteur ne reçoit pas : `plan-admin.mjs` embarque ce module, `plan.mjs`
   jamais.

   L'ordre de tracé, lui, sert aussi au visiteur — les couches s'empilent sur
   son plan comme sur celui de l'exploitant : `clePile`, `entrees`, `pile` et
   `ordonneDom` restent dans `_pile.html`, au code soudé.

   Ce que le code soudé tient encore — l'enregistrement des réglages, les
   calques de dessin et leur outil, le placement des libellés, les secteurs —
   lui est confié par `branchePile`,
   que `_pile.html` appelle à la place que ce code y tenait. Ce qui change sans
   cesse — les calques dessinés (`DESSINS`, relus à chaque changement de
   salon), le calque actif, le mode de travail en cours, les secteurs, le mode
   administrateur — par des lecteurs. Les modules d'administration déjà
   sortis — la bibliothèque des bâtiments, le calage de la carte, la carte de
   chaleur, la reprise des emplacements, la fenêtre de réorganisation —, comme
   la configuration et l'apparence des calques, s'importent.
   ============================================================ */
import { $ } from "./dom.mjs";
import { P } from "./donnees.mjs";
import { COLLATION } from "./texte.mjs";
import { rgbHex } from "./couleurs.mjs";
import { confirme } from "./fenetre.mjs";
import { roleIti, nomRoleIti } from "./itineraire.mjs";
import { rangChaleur } from "./chaleur.mjs";
import { bibliothequeDispo, ouvreBibliotheque, boutonRecale, rouvreCalage } from "./batiments.mjs";
import { boutonMasqueCarte, basculeMasqueCarte } from "./calage-carte.mjs";
import { SORTE_GEO } from "./emplacements.mjs";
import { geoVerrouille, basculeVerrouGeo, boutonVerrouGeo, modeGeometrie } from "./reprise-emplacements.mjs";
import { conf, jeton, sousCle } from "./configuration.mjs";
import { sousCalques, styleFond, styleDataGroupe, styleData, appliqueCouleursData } from "./apparence.mjs";
import { appliqueFond } from "./habillage.mjs";
import { suitNuancier } from "./nuancier.mjs";
import { ouvreOrdre } from "./ordre-calques.mjs";

/**
 * Ce que le code soudé confie au branchement.
 * @typedef {object} PagePile
 * @property {() => boolean} estAdmin le mode administrateur, `ADMIN`
 * @property {() => any} dessins les calques dessinés, par pavillon, `DESSINS`
 * @property {() => any} calqueActif l'identifiant du calque en cours d'édition, `calqueActif`
 * @property {() => boolean} placeLibelles le placement des libellés en cours, `PLACE_LIBELLES`
 * @property {() => Map<string, any>} secteurs les secteurs du salon, `SECTEURS`
 * @property {() => { k: string, t: string, nom: string, ref: any }[]} entrees
 * @property {() => void} enregistreConf
 * @property {(id: any) => string} joli
 * @property {() => boolean} secteursMontres
 * @property {(nom: string) => string} couleurSecteur
 * @property {(nom: string) => void} peintSecteur
 * @property {() => any[]} mesCalques
 * @property {() => void} creeCalque
 * @property {() => void} enregistreDessins
 * @property {() => void} dessineDessins
 * @property {(cal: any) => void} peintCalque
 * @property {(c: any) => boolean} verrouille
 * @property {(c: any) => void} basculeVerrou
 * @property {(ferme: boolean) => string} pictoVerrou
 * @property {(id: any) => void} activeCalque
 * @property {() => void} memorise
 * @property {(on: boolean) => void} modePlacementLibelles
 */
/** @type {PagePile} */
let soude;
const estAdmin = () => soude.estAdmin();
const dessins = () => soude.dessins();
const calqueActif = () => soude.calqueActif();
const placeLibelles = () => soude.placeLibelles();
const secteurs = () => soude.secteurs();
const entrees = () => soude.entrees();
const enregistreConf = () => soude.enregistreConf();
const joli = (/** @type {any} */ id) => soude.joli(id);
const secteursMontres = () => soude.secteursMontres();
const couleurSecteur = (/** @type {string} */ nom) => soude.couleurSecteur(nom);
const peintSecteur = (/** @type {string} */ nom) => soude.peintSecteur(nom);
const mesCalques = () => soude.mesCalques();
const creeCalque = () => soude.creeCalque();
const enregistreDessins = () => soude.enregistreDessins();
const dessineDessins = () => soude.dessineDessins();
const peintCalque = (/** @type {any} */ cal) => soude.peintCalque(cal);
const verrouille = (/** @type {any} */ c) => soude.verrouille(c);
const basculeVerrou = (/** @type {any} */ c) => soude.basculeVerrou(c);
const pictoVerrou = (/** @type {boolean} */ ferme) => soude.pictoVerrou(ferme);
const activeCalque = (/** @type {any} */ id) => soude.activeCalque(id);
const memorise = () => soude.memorise();
const modePlacementLibelles = (/** @type {boolean} */ on) => soude.modePlacementLibelles(on);

/** Le branchement : `_pile.html` l'appelle à la place que ce code y tenait.
 *  @param {PagePile} page */
export function branchePile(page){
  soude = page;
}

/* ============================================================
   Panneau : deux sections, chacune rangée par nom

   Deux natures s'y côtoient, et rien ne les distinguait : ce que le salon
   fournit — habillage Klipso, zones, stands, textes — et ce que l'exploitant
   a dessiné lui-même. Les premières se refont à chaque synchronisation, les
   secondes sont son travail : on ne les supprime pas du même cœur léger.
   Chacune a donc sa section, sous son intertitre.

   Le panneau suivait l'ordre de tracé, et ouvrait un intertitre à chaque
   changement de nature : un calque de dessin glissé sous les stands faisait
   naître une seconde section « Ajoutés à la main » plus bas, et l'on ne
   savait plus où chercher. On vient ici montrer, masquer ou recolorer un
   calque qu'on connaît par son nom, pas lire ce qui passe devant quoi — le
   rang se règle et se lit dans la fenêtre de réorganisation. Le panneau range
   donc par nom, et l'ordre de tracé n'y change plus rien.
   ============================================================ */
const NATURES = { salon: "Issus du salon", dessin: "Ajoutés à la main" };
const nature = x => x.t === "dessin" ? "dessin" : "salon";

/* Le bouton d'ajout ferme la section des calques dessinés plutôt que le
   panneau : c'est un de ces calques-là qu'il crée, et au bas de la liste il
   paraissait valoir pour tout ce qui le précédait, couches du salon comprises.
   Restent les plans sans aucun dessin : là il n'a pas de section à fermer, et
   revient en fin de liste. */
function boutonAjout(hote){
  const plus = document.createElement("button");
  plus.className = "ajout";
  plus.textContent = "+ Nouveau calque de dessin";
  plus.onclick = creeCalque;
  hote.appendChild(plus);
  /* Les halls de la bibliothèque sont des calques de dessin comme les autres :
     leur bouton vit à côté de celui qui en crée un vide. */
  if (bibliothequeDispo()){
    const b = document.createElement("button");
    b.className = "ajout";
    b.textContent = "+ Bâtiment de la bibliothèque…";
    b.onclick = ouvreBibliotheque;
    hote.appendChild(b);
  }
}

/* Le cadenas d'un calque de dessin : un interrupteur, donc « aria-pressed »
   plutôt que deux boutons qui se remplacent. Son intitulé dit ce que le clic
   fera, et non l'état où l'on est — c'est ce qu'on cherche en le survolant. */
function boutonVerrou(c){
  const ferme = verrouille(c);
  return '<button class="verr" aria-pressed="' + ferme + '" title="' +
    (ferme ? "Déverrouiller le calque"
           : "Verrouiller le calque : ni dessin, ni suppression") +
    '">' + pictoVerrou(ferme) + '</button>';
}

function intertitre(hote, cle){
  const t = document.createElement("span");
  t.className = "eyebrow secpile";
  t.textContent = NATURES[cle];
  hote.appendChild(t);
}

/* Ce que `construitPanneau` faisait : le code soudé garde son nom — le plan
   public l'appelle sans s'en servir —, et ne fait plus qu'appeler celui-ci. */
export function remplitPanneau(){
  const hote = $("pile");
  hote.innerHTML = "";
  const reorg = document.createElement("button");
  reorg.className = "reorg";
  reorg.textContent = "⇅ Réorganiser les calques";
  reorg.onclick = ouvreOrdre;
  hote.appendChild(reorg);
  /* Les calques dessinés en tête : ce sont eux qu'on retouche, et le bouton
     d'ajout qui ferme leur section reste ainsi à portée, au lieu de glisser
     sous la légende des secteurs, longue de vingt lignes sur certains salons.
     Un nom partagé par deux calques garde l'ordre de création — le tri est
     stable. */
  const rangNature = x => nature(x) === "dessin" ? 0 : 1;
  const liste = entrees().sort((a, b) => rangNature(a) - rangNature(b) ||
    COLLATION.compare(String(a.nom || ""), String(b.nom || "")));

  /* Un intertitre ne vaut que s'il sépare : tant que le salon n'a pas de
     calque dessiné, la liste est d'une seule nature et se passe de titre. */
  const melange = liste.some(x => nature(x) === "dessin") &&
                  liste.some(x => nature(x) === "salon");
  const dernierDessin = liste.reduce((r, x, i) => nature(x) === "dessin" ? i : r, -1);
  let natureCourante = null;

  liste.forEach((x, i) => {
    if (melange && nature(x) !== natureCourante){
      natureCourante = nature(x);
      intertitre(hote, natureCourante);
    }
    const d = document.createElement("div");
    d.className = "calq" + (x.t === "dessin" ? " perso" : "") +
                  (x.t === "dessin" && x.ref.id === calqueActif() ? " actif" : "");
    if (x.t === "dessin") d.dataset.dcal = x.ref.id;

    const c = x.t === "dessin" ? x.ref : conf(x.t === "fond" ? x.k.slice(5) : x.k);
    const coche = c.visible === false ? "" : " checked";
    /* Les deux couches que la source dessine — emplacements et zones — se
       reprennent à la main, forme par forme (`reprise-emplacements.mjs`). Leur cadenas
       est fermé d'avance : on ne touche pas à la géométrie d'un salon en
       passant régler une couleur. */
    const sorte = x.k === "data:stands" ? "stands" : x.k === "data:zones" ? "zones" : null;
    d.innerHTML = '<label><input type="checkbox"' + coche + '><span></span></label>' +
      '<span class="opts">' +
      (x.t === "data" ? "" : '<button class="fillbtn" title="Contour seul ou surface remplie"><svg viewBox="0 0 12 12" aria-hidden="true"><rect x="1.6" y="1.6" width="8.8" height="8.8" rx="1.2"/></svg></button>') +
      /* avant la pastille, et non après comme le crayon d'un calque de dessin :
         les couleurs des couches de données forment une colonne, et un bouton
         glissé entre elles la romprait */
      (x.k === "data:labels" ? '<button class="ren rlib" title="Placer les libellés à la main">&#9998;</button>' : "") +
      (sorte ? boutonVerrouGeo(sorte) +
               '<button class="ren rgeo" data-geo="' + sorte +
               '" title="Reprendre ou ajouter des formes à la main">&#9998;</button>' : "") +
      '<input type="color" class="cc">' +
      /* Le cadenas précède le crayon et la croix : c'est eux qu'il éteint, et
         on lit la ligne de gauche à droite — ce qui protège avant ce qui
         modifie. */
      (x.t === "dessin" ? boutonRecale(x.ref) + boutonMasqueCarte(x.ref) + boutonVerrou(x.ref) +
                          '<button class="ren" title="Dessiner sur ce calque">&#9998;</button>' +
                          '<button class="sup" title="Supprimer le calque">&times;</button>' : "") +
      '</span>';

    const nom = d.querySelector("label span");
    nom.textContent = x.nom;

    /* Un calque qui sert aux itinéraires ne se distingue pas à l'écran : le
       rappeler ici évite de le chercher, ou de l'oublier. La coche d'à côté
       n'éteint que l'affichage — le calcul, lui, continue d'en tenir compte,
       et rien d'autre ne le dirait. */
    if (x.t === "dessin" && roleIti(x.ref)){
      const b = document.createElement("i");
      b.className = "rle";
      b.textContent = nomRoleIti(roleIti(x.ref));
      b.title = "Ce calque compte dans les itinéraires, même masqué.";
      nom.after(b);
    }

    /* visibilité */
    d.querySelector('input[type="checkbox"]').onchange = ev => {
      const on = ev.target.checked;
      if (x.t === "dessin"){ x.ref.visible = on; enregistreDessins(); dessineDessins(); }
      else { c.visible = on; enregistreConf();
             x.t === "fond" ? styleFond(x.k.slice(5)) : styleDataGroupe(x.k.slice(5), on); }
    };

    /* couleur — peinte à chaque événement, retenue une fois le glissement
       fini : voir « La rafale du sélecteur de couleur » dans `_admin1.html`. */
    const cc = d.querySelector(".cc");
    cc.value = (x.t === "dessin" ? x.ref.couleur : c.couleur) || defautCouleur(x);
    suitNuancier(cc,
      v => {
        if (x.t === "dessin"){ x.ref.couleur = v; peintCalque(x.ref); }
        else { c.couleur = v;
               x.t === "fond" ? styleFond(x.k.slice(5)) : appliqueCouleursData(); }
      },
      () => { if (x.t === "dessin") enregistreDessins(); else enregistreConf(); });

    /* trait ou aplat */
    const fb = d.querySelector(".fillbtn");
    if (fb){
      fb.setAttribute("aria-pressed", !!c.rempli);
      fb.onclick = () => {
        c.rempli = !c.rempli;
        fb.setAttribute("aria-pressed", !!c.rempli);
        if (x.t === "dessin"){ enregistreDessins(); dessineDessins(); }
        else { enregistreConf(); styleFond(x.k.slice(5)); }
      };
    }

    /* propre aux calques de dessin */
    if (x.t === "dessin"){
      const vr = verrouille(x.ref);
      nom.title = vr ? "Calque verrouillé : ouvrez son cadenas pour y dessiner."
                     : "Cliquez pour dessiner dessus";
      d.querySelector(".verr").onclick = ev => { ev.stopPropagation(); basculeVerrou(x.ref); };
      /* Le perçage du fond de carte : il n'y a de bouton que s'il y a une carte. */
      const mq = d.querySelector(".masq");
      if (mq) mq.onclick = ev => { ev.stopPropagation(); basculeMasqueCarte(x.ref); };
      /* Reprendre le calage d'un hall de la bibliothèque. Le bouton précède le
         cadenas parce que celui-ci ne l'éteint pas : le verrou garde d'un
         glisser distrait, et rouvrir le calage est un geste nommé, qui se
         valide ou s'annule. */
      const rc = d.querySelector(".recal");
      if (rc) rc.onclick = ev => { ev.stopPropagation(); rouvreCalage(x.ref); };
      // Le crayon ouvre les outils de dessin sur ce calque. Le renommage vit
      // dans la fenêtre de réorganisation, où l'on voit tous les calques.
      const cr = d.querySelector(".ren");
      cr.setAttribute("aria-pressed", x.ref.id === calqueActif());
      cr.onclick = ev => { ev.stopPropagation(); activeCalque(x.ref.id); };
      d.querySelector("label").onclick = ev => {
        if (ev.target.tagName !== "INPUT"){ ev.preventDefault(); activeCalque(x.ref.id); }
      };
      /* Verrouillé, le calque n'ouvre plus ses outils et ne se supprime plus :
         les deux boutons s'éteignent, plutôt que de mener à un refus qu'il
         faudrait expliquer une fois le geste fait. */
      [cr, d.querySelector(".sup")].forEach(b => {
        b.disabled = vr;
        if (vr) b.title = "Calque verrouillé";
      });
      d.querySelector(".sup").onclick = () => {
        const n = x.ref.formes.length;
        confirme("Supprimer le calque ?",
          "« " + x.ref.nom + " » et " +
          (n > 1 ? "ses " + n + " formes" : n ? "sa forme" : "son contenu") +
          " seront définitivement perdus.",
          "Supprimer", () => {
            memorise();
            dessins()[P().id] = mesCalques().filter(y => y.id !== x.ref.id);
            if (calqueActif() === x.ref.id) activeCalque(null);
            enregistreDessins(); dessineDessins(); remplitPanneau();
          });
      };
    }

    /* Le crayon des textes ouvre le placement des libellés à la main, comme
       celui d'un calque de dessin ouvre ses outils : deux façons de retoucher
       ce qu'une couche pose sur le plan, donc le même bouton au même endroit.
       Une case à cocher le disait aussi, mais en ligne séparée sous la couche,
       où elle se lisait comme un réglage du salon — alors que c'est un mode de
       travail, qui ne se retient pas d'une visite à l'autre. */
    if (x.k === "data:labels"){
      const cr = d.querySelector(".rlib");
      cr.setAttribute("aria-pressed", placeLibelles());
      cr.onclick = ev => { ev.stopPropagation(); modePlacementLibelles(!placeLibelles()); };
    }

    /* Le crayon des emplacements ouvre la reprise de leur géométrie, comme
       celui des textes ouvre le placement des libellés : la même façon de
       retoucher ce qu'une couche pose sur le plan, donc le même bouton au
       même endroit. Le cadenas le précède, parce qu'on lit la ligne de gauche
       à droite — ce qui protège avant ce qui modifie — et parce que c'est
       justement lui qu'il éteint. */
    if (sorte){
      const ferme = geoVerrouille(sorte);
      d.querySelector(".vgeo").onclick = ev => { ev.stopPropagation(); basculeVerrouGeo(sorte); };
      const cr = d.querySelector(".rgeo");
      cr.setAttribute("aria-pressed", SORTE_GEO === sorte);
      cr.disabled = ferme;
      if (ferme) cr.title = "Couche verrouillée : ouvrez son cadenas pour reprendre ou ajouter une forme.";
      cr.onclick = ev => {
        ev.stopPropagation();
        modeGeometrie(SORTE_GEO === sorte ? null : sorte);
      };
    }

    hote.appendChild(d);

    /* sous-calques de l'habillage : couleur et visibilité, pas d'ordre. Rangés
       par nom eux aussi, comme les secteurs : l'ordre de Klipso reparaissait
       sinon au milieu d'une liste alphabétique. */
    if (x.t === "fond"){
      const sous = sousCalques(x.k.slice(5))
        .sort((a, b) => COLLATION.compare(joli(a.id), joli(b.id)));
      if (sous.length > 1) sous.forEach(sc =>
        rangSous(hote, sousCle(x.k.slice(5), sc.id), joli(sc.id),
                 () => rgbHex(sc.src) || jeton("--plan-line"), () => styleFond(x.k.slice(5))));
    }
    /* La carte de chaleur se range sous la couche Stands : c'est elle qu'elle
       repeint. Elle n'a pas de couleur à régler — les siennes sortent des
       chiffres — et elle ne se publie pas.

       Avant les secteurs, et non après : ceux-ci sont une légende, longue de
       vingt lignes sur un salon qui sectorise finement, et l'interrupteur s'y
       perdait — sur SIMI il tombait hors de l'écran, à croire qu'il manquait.
       Une commande ne se range pas au bout d'une liste de couleurs. */
    if (x.k === "data:stands" && estAdmin()) rangChaleur(hote);
    /* Les couleurs des secteurs se règlent au même endroit : c'est la même
       couche qu'elles repeignent, et il n'y a pas de couche par secteur. Elles
       ne paraissent que si le salon sectorise et que le plan les montre — sans
       quoi ce serait une couleur qui ne peint rien. */
    if (x.k === "data:stands" && secteursMontres())
      secteurs().forEach((h, nom) => rangSecteur(hote, nom));
    /* les deux couleurs de texte se règlent sous la couche Textes */
    if (x.k === "data:labels"){
      rangSous(hote, "labStand", "Textes des stands", () => jeton("--ink"), () => styleData("labStand"));
      rangSous(hote, "labZone", "Textes des zones", () => jeton("--zone"), () => styleData("labZone"));
    }

    if (i === dernierDessin) boutonAjout(hote);
  });

  if (dernierDessin < 0) boutonAjout(hote);

  sectionSelection(hote);
  sectionFond(hote);

  /* Réglages généraux — ils ne portent sur aucun calque, d'où le trait qui les
     sépare de la pile. Comme le reste de CONF, ils partent aux visiteurs à la
     publication : c'est bien l'exploitant qui décide de ce qu'ils voient. */
  /* Les réglages généraux vivent dans leur propre fenêtre, ouverte par
     l'engrenage : ici ils allongeaient une pile déjà longue et se lisaient
     comme une couche de plus. */
}

/* ============================================================
   Repères
   Ce que le plan pose sur un stand sans que les données le disent : la
   couleur qu'il prend au moment où on le touche, et le liseré de ce qu'un
   visiteur a retenu. Ce ne sont pas des calques : rien ne s'y dessine, rien
   ne s'y masque, et le rang n'y veut rien dire. Rangées dans la pile, les
   lignes se lisaient pourtant comme des couches de plus, entre celles qu'on
   empile vraiment. Un trait les en sépare, un titre les nomme.

   La sélection n'a qu'une couleur à régler, l'aplat : le liseré qui le borde
   s'en déduit, et « appliqueCouleursData » s'en charge. Le parcours n'a que
   son liseré, et il se règle à part — les deux marques se croisent sur le
   même plan, souvent sur le même stand, et l'accent d'origine les confond.
   Les points d'intérêt s'y ajoutent pour la même raison : leur mise en avant
   passe par-dessus tout le reste, y compris un stand déjà sélectionné.
   ============================================================ */
function sectionSelection(hote){
  const bloc = document.createElement("div");
  bloc.className = "apart";
  const titre = document.createElement("span");
  titre.className = "eyebrow";
  titre.textContent = "Repères";
  bloc.appendChild(titre);

  const c = conf("selection");
  bloc.appendChild(ligneCouleur("Élément sélectionné", c.couleur || jeton("--accent-soft"),
    (v) => { c.couleur = v; appliqueCouleursData(); }));

  /* Le parcours retiré, sa couleur ne règle plus rien : la ligne s'efface avec
     lui, et revient si l'exploitant le rouvre. */
  if (conf("_parcours").visible !== false){
    const p = conf("parcours");
    bloc.appendChild(ligneCouleur("Parcours de visite", p.couleur || jeton("--accent"),
      (v) => { p.couleur = v; appliqueCouleursData(); }));
  }

  /* Les points d'intérêt, comme les deux autres : une marque que le plan pose
     par-dessus ce qu'il montre, et non une couche. Une seule couleur pour les
     deux bouts du geste — la pastille retenue dans le cartouche, et le contour
     comme le texte de ce qu'elle allume — sans quoi on cherche laquelle des
     deux on vient de toucher.

     La ligne suit le cartouche : un plan sans repère ni zone typée n'en montre
     pas, et la couleur ne peindrait rien. */
  if ($("poi") && !$("poi").hidden){
    const i = conf("poi");
    bloc.appendChild(ligneCouleur("Points d'intérêt", i.couleur || jeton("--accent"),
      (v) => { i.couleur = v; appliqueCouleursData(); }));
  }
  hote.appendChild(bloc);
}

/* ============================================================
   Fond du plan
   Le gris qui entoure le bâtiment n'est ni un calque ni un repère : rien ne
   s'y dessine, et il ne marque aucun stand. C'est l'aplat sur lequel tout le
   reste se pose, et le seul que le plan imposait — d'où sa place ici, au bas
   du panneau, juste avant la publication qui l'emporte chez les visiteurs.

   Un nuancier plutôt qu'un simple sélecteur, comme pour la couleur
   principale : on cherche la teinte d'un salon, pas une nuance à
   l'hexadécimal près. Les tons proposés sont tous clairs — le plan se dessine
   à l'encre sombre sur des stands blancs, et un fond soutenu les efface. À
   qui tient une charte plus tranchée, la dernière pastille ouvre le nuancier
   du système.
   ============================================================ */
const FONDS = [
  ["#FFFFFF", "Blanc"], ["#FAF7F0", "Ivoire"], ["#F1F0EA", "Coquille"],
  ["#E3E7EA", "Gris perle"], ["#E4EDE6", "Vert d'eau"], ["#E3EAF6", "Bleu pâle"],
  ["#F5E9DB", "Sable"],
];

function sectionFond(hote){
  const bloc = document.createElement("div");
  bloc.className = "apart fondp";
  bloc.innerHTML = '<div class="tete"><span class="eyebrow">Fond du plan</span>' +
    '<button type="button" class="reset">Couleur d\'origine</button></div>' +
    '<div class="nuancier"></div>';
  const nuancier = bloc.querySelector(".nuancier");
  const c = conf("_fond");

  /* La pastille retenue se cerne, et le retour à l'origine ne s'offre que s'il
     y a quelque chose à défaire : proposé sur un plan resté gris, il annonce
     un réglage là où il n'y en a pas. */
  const majPastilles = () => {
    const v = (c.couleur || "").toLowerCase();
    nuancier.querySelectorAll("button[data-ton]").forEach(b =>
      b.setAttribute("aria-pressed", String(b.dataset.ton.toLowerCase() === v)));
    bloc.querySelector(".reset").hidden = !v;
    const libre = nuancier.querySelector(".perso input");
    if (libre) libre.value = c.couleur || jeton("--ground") || "#E9EAE4";
  };
  const peint = (v) => { c.couleur = v; appliqueFond(); majPastilles(); };
  const choisit = (v) => { peint(v); enregistreConf(); };

  FONDS.forEach(([ton, nom]) => {
    const b = document.createElement("button");
    b.type = "button";
    b.dataset.ton = ton;
    b.style.background = ton;
    b.title = nom + " · " + ton;
    b.setAttribute("aria-label", nom);
    b.onclick = () => choisit(ton);
    nuancier.appendChild(b);
  });
  /* On suit la rafale du sélecteur : c'est le seul moyen de voir le fond
     s'installer sous le plan pendant qu'on le cherche. Seule l'écriture attend
     la fin du geste — voir « La rafale du sélecteur de couleur ». */
  const libre = document.createElement("label");
  libre.className = "perso";
  libre.title = "Couleur libre";
  libre.innerHTML = '<input type="color"><span></span>';
  suitNuancier(libre.querySelector("input"), peint, enregistreConf);
  nuancier.appendChild(libre);

  bloc.querySelector(".reset").onclick = () => {
    delete c.couleur;
    enregistreConf(); appliqueFond(); majPastilles();
  };
  hote.appendChild(bloc);
  majPastilles();
}

/* Une ligne qui n'a qu'une couleur à régler : ni visibilité, ni remplissage,
   ni rang. C'est le cas de tout ce qui n'est pas un calque — la sélection, un
   secteur — et qui n'a donc rien à masquer ni à empiler.

   `peint` ne fait que poser la couleur à l'écran, et se répète autant de fois
   que le sélecteur l'envoie ; l'écriture sur le poste attend la fin du geste
   et se fait ici, une fois pour toutes. */
function ligneCouleur(libelle, valeur, peint){
  const d = document.createElement("div");
  d.className = "calq";
  d.innerHTML = '<label><span></span></label>' +
                '<span class="opts"><input type="color" class="cc"></span>';
  d.querySelector("label span").textContent = libelle;
  const cc = d.querySelector(".cc");
  cc.value = valeur;
  suitNuancier(cc, peint, enregistreConf);
  return d;
}

/**
 * La couleur d'un secteur.
 *
 * Le sélecteur part de ce que le plan montre — la couleur choisie, ou la teinte
 * automatique telle que le plan la résout — de sorte qu'on retouche ce qu'on
 * voit plutôt que de partir du noir. Elle se pose ensuite telle quelle, comme
 * celle des autres couches.
 */
function rangSecteur(hote, nom){
  const c = conf("secteur:" + nom);
  const d = ligneCouleur(nom, couleurSecteur(nom), (v) => {
    c.couleur = v;
    /* Seuls les stands de ce secteur changent de teinte : `appliqueSecteurs`
       relit tout le salon, ce qui ne tient pas au rythme du sélecteur. */
    peintSecteur(nom);
  });
  d.classList.add("sous");
  hote.appendChild(d);
}

/* ligne secondaire : visibilité et couleur seulement */
function rangSous(hote, cle, libelle, defaut, applique){
  const c = conf(cle);
  const d = document.createElement("div");
  d.className = "calq sous";
  d.innerHTML = '<label><input type="checkbox"' + (c.visible === false ? "" : " checked") +
    '><span></span></label><span class="opts">' +
    '<button class="fillbtn" title="Contour seul ou surface remplie"><svg viewBox="0 0 12 12" aria-hidden="true"><rect x="1.6" y="1.6" width="8.8" height="8.8" rx="1.2"/></svg></button>' +
    '<input type="color" class="cc"></span>';
  d.querySelector("label span").textContent = libelle;
  d.querySelector('input[type="checkbox"]').onchange = e => {
    c.visible = e.target.checked; enregistreConf(); applique();
  };
  const cc = d.querySelector(".cc");
  cc.value = c.couleur || defaut();
  suitNuancier(cc, v => { c.couleur = v; applique(); }, enregistreConf);
  const fb = d.querySelector(".fillbtn");
  fb.setAttribute("aria-pressed", !!c.rempli);
  fb.onclick = () => { c.rempli = !c.rempli; fb.setAttribute("aria-pressed", !!c.rempli);
                       enregistreConf(); applique(); };
  hote.appendChild(d);
}

function defautCouleur(x){
  if (x.t === "dessin") return "#2F49D1";
  if (x.t === "fond") return jeton("--plan-line");
  return jeton(x.k === "data:zones" ? "--zone" : x.k === "data:stands" ? "--stand" : "--ink");
}
