/* ============================================================
   11. Calques de dessin — l'outil de l'exploitant

   Ce que l'exploitant fait des calques : les créer, les renommer, les
   verrouiller, leur donner un rôle dans les itinéraires ; tracer chaque sorte
   de forme, poser une image et la rattacher à un exposant, annuler et
   refaire ; et la boîte à outils qui porte tout cela. Des gestes
   d'exploitant, que le visiteur ne reçoit pas : `plan-admin.mjs` embarque ce
   module, `plan.mjs` jamais.

   Les calques eux-mêmes, le calque ouvert, l'outil tenu et le tracé en cours
   vivent dans `modules/calques-dessin.mjs`, que le visiteur reçoit aussi :
   l'outil les remplace par leurs portes. Leur tracé sur le plan vit dans
   `modules/dessin.mjs`.

   Il se branche par `brancheOutilDessin`, que `_dessin.html` appelle à la
   place que ce code tenait : les boutons et les champs de la boîte à outils,
   le dépôt d'une image sur le plan et son collage s'y branchent, au rang
   qu'ils tenaient parmi les écouteurs de la page. Il n'a plus rien à en
   recevoir : la forme choisie dans l'éditeur et sa porte s'importent de
   `forme-choisie.mjs`, le panneau des calques de `ordre-trace.mjs`, le
   rangement des réglages de `configuration.mjs`.
   ============================================================ */
import { $ } from "./dom.mjs";
import { esc } from "./texte.mjs";
import { P } from "./donnees.mjs";
import { CONF, conf, optionActive, enregistreConf } from "./configuration.mjs";
import { svg, vue, cadrePlan, versPlan } from "./vue.mjs";
import { ADMIN } from "./mode-admin.mjs";
import { ouvreModale, fermeModale } from "./fenetre.mjs";
import { oublieGrilles, oublieLiaisons, roleIti, ROLES_ITI, cleRoleIti } from "./itineraire.mjs";
import { relance } from "./tiroir-itineraire.mjs";
import { poseNappe, rafraichitApercu } from "./nappe.mjs";
import { programmePublication } from "./enregistrement.mjs";
import { suitNuancier } from "./nuancier.mjs";
import { PLACE_LIBELLES } from "./libelle-place.mjs";
import { modePlacementLibelles } from "./placement-libelles.mjs";
import { SORTE_GEO } from "./emplacements.mjs";
import { modeGeometrie } from "./reprise-emplacements.mjs";
import { ecritMetres, coteCadre, montreCote, oublieAimants, montreAimants, aimante, DERNIERE,
  retientTaille, reprendTaille, appliqueDimension } from "./aimants.mjs";
import { geste, dessinePoignees, majElement, changeLien, appliqueSociete, appliqueTexte, appliqueRotation,
  appliqueRayon, appliqueTrait, appliqueTransport, appliquePicto, supprimeForme, editionPointerDown,
  editionPointerMove, editionPointerUp } from "./edition.mjs";
import { DESSINS, cleDessins, marqueAttente, mesCalques, trouveCalque, nouvelId, calqueActif, outil,
  enCours, poseCalqueActif, poseOutil, poseEbauche } from "./calques-dessin.mjs";
import { cheminForme, estCadre, EPAISSEUR_TRAIT } from "./chemin-forme.mjs";
import { TYPES_REPERE, MODES_TRANSPORT, estTransport, couleurLigne, couleurEcrite, libelleDoffice }
  from "./reperes.mjs";
import { dessineDessins, redessineForme, apercu, apercuGuide, signale, TAILLE_REPERE, nomSurLePlan,
  societeDeForme, societesDuPlan } from "./dessin.mjs";
import { oublieReperes } from "./points-interet.mjs";
import { formeSel, poseFormeSel, formeParId } from "./forme-choisie.mjs";
import { construitPanneau } from "./ordre-trace.mjs";
import { confieApresOption } from "./options.mjs";


export const enregistreDessins = () => {
  /* Les repères et les formes dessinées entrent dans le calcul d'itinéraire :
     la grille de marche qui les ignore n'a plus cours, et l'annuaire des
     passages non plus. On attend la fin du geste — dessiner en referait une à
     chaque image, ce qui serait insoutenable. */
  oublieGrilles();
  oublieLiaisons();
  // les formes posées servent d'aimants aux suivantes : le relevé a vieilli
  oublieAimants();
  // un repère vient peut-être d'être posé, renommé ou retiré de la recherche
  oublieReperes();
  rafraichitApercu();
  /* Le geste vient d'écarter le poste de ce que la base contient : c'est vrai
     dès la première forme tracée, et non au moment où l'on pense à publier. */
  marqueAttente(P().id, true);
  try { localStorage.setItem(cleDessins, JSON.stringify(DESSINS)); }
  catch (e) {
    // les images sont encodées dans le document : le quota se remplit vite
    if ($("outilsAide")) $("outilsAide").textContent =
      "Mémoire du navigateur pleine : allégez ou supprimez une image.";
  }
  /* Et en base, dès que le geste s'arrête : le poste n'est qu'un cache, et
     c'est justement quand son quota déborde que la base doit avoir le dessin. */
  programmePublication();
};

/* Historique des dessins. L'instantané copie les calques, leurs tableaux de
   formes, et chaque forme — sans quoi il ne gardait rien de ce qui se retouche
   sur place. Car tous les gestes d'édition écrivent *dans* la forme : le
   glissement, la poignée tirée, l'arrondi, le libellé, la taille au clavier, la
   ligne d'un arrêt, les passages posés. L'instantané pris juste avant portait
   donc le même objet, déjà modifié, et Ctrl+Z retraçait le plan sans rien
   défaire : seuls l'ajout et la suppression, qui touchent le tableau,
   s'annulaient vraiment. `_batiments.html` `reposeBatiment` contourne ce piège
   depuis longtemps en refabriquant ses formes ; il valait mieux le fermer.
   Les points, eux, sont toujours remplacés par un tableau neuf, jamais écrits
   en place : en copier la liste suffit, et `src` d'une image reste partagé. */
export const HIST = [], REFAIRE = [];
const instantane = () => mesCalques().map(c => Object.assign({}, c, {
  formes: c.formes.map(f => Object.assign({}, f,
    f.pts ? { pts: f.pts.slice() } : null)),
}));
/* Une salve ne mémorise qu'à son premier événement. Un champ de saisie en
   envoie un par frappe, et chacun mémorisait un état : les cinquante
   emplacements se remplissaient de variantes du même mot, et les gestes d'avant
   en étaient chassés. La salve se referme quand on quitte le champ, ou dès
   qu'autre chose se mémorise — c'est ce que fait déjà le nuancier avec son
   drapeau `couleurEnCours`. */
let salveEnCours = "";
const clotSalve = () => { salveEnCours = ""; };
export function memorise(salve){
  if (salve){
    if (salveEnCours === salve) return;
    salveEnCours = salve;
  } else {
    salveEnCours = "";
  }
  HIST.push(instantane());
  if (HIST.length > 50) HIST.shift();
  REFAIRE.length = 0;
}
function restaure(source, autre){
  if (!source.length) return false;
  autre.push(instantane());
  DESSINS[P().id] = source.pop();
  if (calqueActif && !trouveCalque(calqueActif)) activeCalque(null);
  /* La forme choisie a pu partir avec l'état qu'on vient de défaire : Ctrl+D
     puis Ctrl+Z retirait la copie du calque, et laissait son cadre et ses
     quatre poignées affichés sur place, le panneau « Élément » ouvert sur elle.
     Les commandes qui en dépendent ne faisaient alors plus rien, `formeParId`
     ne rendant plus rien — un refus muet. */
  if (formeSel && !formeParId(formeSel)) poseFormeSel(null);
  clotSalve();
  enregistreDessins(); dessineDessins(); dessinePoignees();
  if (ADMIN){ construitPanneau(); majElement(); }
  return true;
}
export function annule(){
  // pendant un tracé, on retire le dernier sommet plutôt que l'action entière
  if (enCours && enCours.pts.length > 1){
    enCours.pts.pop();
    apercu(cheminForme({ t: "ligne", pts: enCours.pts }));
    apercuGuide(null);
    aide();
    return;
  }
  if (enCours){ termineTrace(false); return; }
  if (!restaure(HIST, REFAIRE)) $("outilsAide").textContent = "Rien à annuler.";
}
export function refais(){ restaure(REFAIRE, HIST); }

/** Ce que la palette règle, posé sur la ligne qui vient d'être tracée. On ne
 *  retient que l'écart au trait ordinaire : une ligne sans réglage suit son
 *  calque, aujourd'hui comme le jour où il changera d'allure. */
function poseTrait(f){
  const e = $("traitEpaisseur"), s = $("traitStyle"), fl = $("traitFleche");
  const ep = e ? parseFloat(e.value) : NaN;
  if (isFinite(ep) && ep > 0 && ep !== EPAISSEUR_TRAIT) f.ep = ep;
  if (s && s.value === "pointille") f.pointille = true;
  if (fl && fl.value) f.fleche = fl.value;
}

/* ------------------------------------------------------------
   Aide au tracé d'un contour de hall
   ------------------------------------------------------------
   Le fond de plan vient d'un relevé technique : il porte l'épaisseur des
   murs, le battant de chaque porte, le moindre décrochement de poteau. Un
   visiteur n'a que faire de tout cela — il lui faut la silhouette du
   pavillon, franche, pour savoir où il est. On la retrace donc par-dessus,
   et deux choses suffisent à la rendre nette : des segments redressés, et
   des angles adoucis. Les portes disparaissent d'elles-mêmes, puisqu'on ne
   les suit pas.
   ------------------------------------------------------------ */

/** Ce que la main sait viser : douze pixels d'écran, convertis en mètres. */
export function toleranceTrace(){
  const r = cadrePlan();
  return r.width ? vue().w / r.width * 12 : .3;
}

const aimanteContour = () =>
  !$("contourAimant") || $("contourAimant").checked;

const rayonContour = () => {
  const v = parseFloat($("contourRayon") ? $("contourRayon").value : "");
  return isFinite(v) && v > 0 ? v : 0;
};

/**
 * Le prochain sommet, redressé.
 *
 * Deux corrections, dans cet ordre. La direction d'abord : elle bascule sur
 * le huitième de tour le plus proche, ce qui donne des murs d'équerre et des
 * pans coupés à quarante-cinq degrés sans viser. La longueur ensuite : si le
 * point tombe près de la verticale ou de l'horizontale d'un sommet déjà posé,
 * il s'y accroche. C'est ce second réglage qui fait qu'un contour se referme
 * exactement là où il a commencé, au lieu de laisser un décalage d'un
 * dixième de mètre que le zoom finit toujours par montrer.
 *
 * `guide` reçoit le sommet servi de référence, s'il y en a un : l'appelant en
 * tire le trait qui l'explique.
 */
function redresseTrace(p, pts, guide){
  if (guide) guide.q = null;
  if (!pts.length || !aimanteContour()) return p;
  const tol = toleranceTrace();
  const b = pts[pts.length - 1];
  const dx = p[0] - b[0], dy = p[1] - b[1];
  const l = Math.hypot(dx, dy);
  if (l < 1e-6) return p;
  const a = Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) * (Math.PI / 4);
  const ux = Math.cos(a), uy = Math.sin(a);
  let x = b[0] + ux * l, y = b[1] + uy * l, meilleur = null;
  for (const q of pts){
    /* On cherche la longueur qui met le point sur l'abscisse — ou l'ordonnée
       — du sommet q. Une direction presque parallèle à l'axe visé donnerait
       une longueur démesurée pour un gain nul : on l'écarte. */
    for (const axe of [0, 1]){
      const c = axe ? uy : ux;
      if (Math.abs(c) < .3) continue;
      const l2 = (q[axe] - b[axe]) / c;
      if (l2 < tol) continue;              // derrière soi, ou sur soi
      const px = b[0] + ux * l2, py = b[1] + uy * l2;
      const ecart = Math.hypot(px - x, py - y);
      if (ecart < tol && (!meilleur || ecart < meilleur.ecart))
        meilleur = { x: px, y: py, ecart, q, axe };
    }
  }
  if (meilleur){
    x = meilleur.x; y = meilleur.y;
    if (guide) guide.q = meilleur;
  }
  return [+x.toFixed(2), +y.toFixed(2)];
}

/** Le trait pointillé qui relie le sommet de référence au point accroché. */
function traceGuide(g, p){
  if (!g || !g.q){ apercuGuide(null); return; }
  const q = g.q.q;
  apercuGuide("M" + q[0] + " " + q[1] + "L" + p[0] + " " + p[1]);
}

/** Le contour se referme quand on revient sur son premier sommet. */
export function fermeIci(p, pts){
  if (pts.length < 3) return false;
  return Math.hypot(p[0] - pts[0][0], p[1] - pts[0][1]) < toleranceTrace() * 1.5;
}

export function ajouteForme(f){
  const c = trouveCalque(calqueActif);
  if (!c) return;
  memorise();
  f.id = nouvelId();
  c.formes.push(f);
  enregistreDessins();
  dessineDessins();
  aide();
  return f.id;
}

/* Le champ qui rattache une image à un exposant, posé selon que le salon a
   pris l'option. La feuille de style le grise, mais le gris s'atteint encore
   au clavier, et un champ grisé où l'on peut taper ment sur ce qu'il fera.
   Comme le bouton de la journée, c'est donc « disabled » qui ferme, et il se
   rouvre par le même chemin le jour où l'option se prend. */
export function poseChampImage(){
  const ch = $("imageSoc");
  const offert = optionActive("imageStand");
  if (ch) ch.disabled = !offert;
  if (offert) remplitListeSocietes();
}

export function remplitListeSocietes(){
  const l = $("listeSoc");
  if (!l) return;
  l.innerHTML = societesDuPlan()
    .map(x => '<option value="' + esc(x.etiquette) + '">').join("");
}

/** Retrouve la société désignée par ce qui a été saisi. */
export function societeSaisie(txt){
  const v = String(txt || "").trim().toLowerCase();
  if (!v) return null;
  const l = societesDuPlan();
  return l.find(x => x.etiquette.toLowerCase() === v)
      || l.find(x => nomSurLePlan(x.soc).toLowerCase() === v)
      || null;
}

/* --- import d'image ---
   L'image est réduite et convertie en data-URI : une page publiée ne peut
   charger aucune ressource externe, tout doit vivre dans le document.   */
export let imageEnAttente = null;
const MAX_PX = 1400;

/* On ne refuse plus une image faute de calque actif : on en ouvre un. */
function calquePourImage(){
  if (calqueActif && trouveCalque(calqueActif)) return trouveCalque(calqueActif);
  /* Le dernier calque s'ouvre d'office, mais pas s'il est verrouillé : l'image
     glissée sur le plan est le seul tracé qui n'ait pas eu à choisir son
     calque, et elle se poserait donc sur celui qu'on protège. Tous fermés, on
     en ouvre un neuf plutôt que de refuser l'image. */
  const libres = mesCalques().filter(c => !verrouille(c));
  if (libres.length){ activeCalque(libres[libres.length - 1].id); return trouveCalque(calqueActif); }
  memorise();
  const c = { id: nouvelId(), nom: "Images", couleur: "#2F49D1",
              rempli: false, visible: true, formes: [] };
  mesCalques().push(c); enregistreDessins(); construitPanneau(); activeCalque(c.id);
  return c;
}

/**
 * L'exposant que le champ de l'outil image désigne, s'il en désigne un.
 *
 * Facultatif, à la différence de celui du stand dessiné : une image posée pour
 * ce qu'elle montre — un plan d'aménagement, une affiche, une photo de hall —
 * ne désigne personne et n'a aucune fiche à ouvrir. Nommé, il vaut pour toutes
 * les images qu'on pose ensuite, comme la vignette choisie : on aligne souvent
 * plusieurs logos sur le même stand partagé.
 *
 * Il rend ce qu'une forme retient — l'emplacement et le rang de la société —
 * et non la société elle-même : c'est ce couple que « societeDeForme » relit,
 * et le seul qui survive à une synchronisation.
 */
function lienImageSaisi(){
  /* Le rattachement est une option du salon : fermée, la feuille de style
     grise le champ, mais ce qu'on y avait saisi avant y reste — et se relit,
     puisque le champ demeure. C'est ici qu'on refuse, donc, plutôt que de
     lier depuis un champ que l'option a fermé. */
  if (!optionActive("imageStand")) return null;
  const ch = $("imageSoc");
  const l = ch ? societeSaisie(ch.value) : null;
  return l ? { stand: l.o.id, soc: l.i } : null;
}

/** L'image à poser, rattachée si le champ nomme quelqu'un. */
function formeImage(pts){
  const f = { t: "image", src: imageEnAttente.src, pts: pts };
  const lien = lienImageSaisi();
  if (lien){ f.stand = lien.stand; f.soc = lien.soc; }
  return f;
}

/* Pose l'image autour d'un point, à une taille lisible au zoom courant.
   Plus besoin de tracer un cadre : on ajuste ensuite si besoin. */
function poseImage(centre){
  if (!imageEnAttente) return;
  calquePourImage();
  const view = vue();
  const l = Math.max(4, view.w * .28);
  const ht = l / imageEnAttente.ratio;
  const c = centre || [view.x + view.w / 2, view.y + view.h / 2];
  const f = formeImage(
    [[+(c[0] - l / 2).toFixed(2), +(c[1] - ht / 2).toFixed(2)],
     [+(c[0] + l / 2).toFixed(2), +(c[1] + ht / 2).toFixed(2)]]);
  signale(ajouteForme(f));   // l'emplacement n'a pas été choisi : il faut le montrer
  $("outilsAide").textContent = ditImagePosee(f,
    "Image posée au centre de la vue. Glissez sur le plan pour en poser une autre.");
}

/**
 * Ce qu'on dit d'une image qui vient d'être posée : à qui elle mène, ou qu'elle
 * ne mène nulle part.
 *
 * C'est la seule chose qui ne se voie pas sur le plan — deux images posées se
 * ressemblent, l'une ouvre une fiche et l'autre non — et c'est précisément ce
 * qu'on vient de décider en remplissant le champ, ou en le laissant vide.
 */
function ditImagePosee(f, sinon){
  const l = societeDeForme(f);
  return l
    ? "Image posée sur « " + (nomSurLePlan(l.soc) || ("Stand " + (l.o.code || "")).trim()) +
      " » : la toucher ouvrira sa fiche."
    : sinon;
}

function importeImage(fichier, centre){
  if (!fichier || fichier.type.indexOf("image/") !== 0) return;
  const fr = new FileReader();
  fr.onload = () => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, MAX_PX / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      const type = fichier.type === "image/jpeg" ? "image/jpeg" : "image/webp";
      imageEnAttente = { src: c.toDataURL(type, .85), ratio: img.width / img.height };
      const v = $("vignette");
      v.innerHTML = '<img alt=""><span></span>';
      v.querySelector("img").src = imageEnAttente.src;
      v.querySelector("span").textContent =
        Math.round(imageEnAttente.src.length / 1365) + " Ko";
      v.dataset.prete = "1";
      choisitOutil("image");
      poseImage(centre);
    };
    img.onerror = () => { $("outilsAide").textContent = "Image illisible."; };
    img.src = String(fr.result);   // un data-URI : `readAsDataURL` ne rend rien d'autre
  };
  fr.readAsDataURL(fichier);
}

/* --- gestion du geste de dessin ; renvoie true si l'événement est consommé --- */
export function dessinPointerDown(e){
  if (editionPointerDown(e)) return true;
  if (!ADMIN || !calqueActif || outil === "main") return false;
  // sans cela le navigateur démarre une sélection de texte et le
  // relâchement du pointeur ne revient jamais
  e.preventDefault();
  if (outil === "rect" || outil === "image" || outil === "stand"){
    try { svg.setPointerCapture(e.pointerId); } catch (err) {}
  }
  /* Le contour de hall garde son propre redressement : deux aimantations qui
     tirent le même point chacune de son côté ne se corrigeraient pas, elles
     se disputeraient. */
  const brut = versPlan(e.clientX, e.clientY);
  const p = outil === "contour" ? brut : aimante(brut, { alt: e.altKey });
  if (outil === "texte"){
    const txt = $("texteADessiner").value.trim();
    if (!txt){ $("texteADessiner").focus(); return true; }
    ajouteForme({ t: "texte", pts: [p], txt: txt, taille: 2 });
    return true;
  }
  if (outil === "repere"){
    const type = $("repereType").value;
    const transport = type === "transport";
    const mode = transport ? $("repereMode").value : "";
    const ligne = transport ? $("repereLigne").value.trim() : "";
    /* Le libellé peut rester vide quand le pictogramme se suffit : c'est le
       cas ordinaire d'un WC, et celui d'un arrêt que sa ligne nomme déjà.
       Sans type ni libellé, en revanche, il n'y aurait rien à poser. */
    const txt = $("repereTexte").value.trim() || libelleDoffice(type, mode, ligne);
    if (!txt){ $("repereTexte").focus(); return true; }
    // un repère se lit de loin : il naît deux fois plus grand qu'un texte
    const f = { t: "repere", pts: [p], txt: txt, picto: type, taille: TAILLE_REPERE };
    if (transport){
      f.mode = mode;
      if (ligne) f.ligne = ligne;
      const c = couleurEcrite(mode, ligne, $("repereCouleur").value,
                              trouveCalque(calqueActif));
      if (c) f.couleur = c;
    }
    ajouteForme(f);
    return true;
  }
  if (outil === "rect"){ poseEbauche({ t: "rect", pts: [p, p] }); return true; }
  /* Un stand dessiné ne vaut que par la société qu'il désigne : sans elle on
     poserait un rectangle muet, invisible pour le visiteur puisqu'il n'ouvre
     aucune fiche. On demande donc l'exposant avant le tracé, comme on demande
     son libellé à un repère. */
  if (outil === "stand"){
    const l = societeSaisie($("standSoc").value);
    if (!l){
      $("outilsAide").textContent = "Choisissez d'abord l'exposant à matérialiser.";
      $("standSoc").focus(); $("standSoc").select();
      return true;
    }
    poseEbauche({ t: "stand", pts: [p, p], stand: l.o.id, soc: l.i });
    return true;
  }
  if (outil === "image"){
    if (!imageEnAttente){ $("outilsAide").textContent = "Choisissez d'abord une image."; return true; }
    poseEbauche(formeImage([p, p]));
    return true;
  }
  /* Le contour est un polygone, tracé la main tenue : chaque sommet est
     redressé sur celui d'avant, et revenir sur le premier referme la
     silhouette — c'est le geste que l'on cherche en arrivant là. */
  if (outil === "contour"){
    if (!enCours) poseEbauche({ t: "poly", pts: [p] });
    else {
      const g = {};
      const q = redresseTrace(p, enCours.pts, g);
      if (fermeIci(q, enCours.pts) || fermeIci(p, enCours.pts)){ termineTrace(true); return true; }
      enCours.pts.push(q);
    }
    apercuGuide(null);
    apercu(cheminForme({ t: "ligne", pts: enCours.pts }));
    aide();
    return true;
  }
  // polygone et ligne : un clic par sommet
  if (!enCours) poseEbauche({ t: outil, pts: [p] });
  else enCours.pts.push(p);
  apercu(cheminForme({ ...enCours, t: "ligne" }));
  aide();
  return true;
}
export function dessinPointerMove(e){
  if (editionPointerMove(e)) return true;
  if (!enCours){
    /* Sans tracé commencé on ne consomme rien — la vue doit rester déplaçable
       — mais on montre déjà ce que l'outil pourrait viser : c'est en
       approchant du stand voisin qu'on veut savoir si son coin se saisit. */
    if (ADMIN && calqueActif && outil !== "main" && outil !== "contour")
      montreAimants([versPlan(e.clientX, e.clientY)], { alt: e.altKey });
    return false;
  }
  const brut = versPlan(e.clientX, e.clientY);
  const p = outil === "contour" ? brut : aimante(brut, { alt: e.altKey });
  if (estCadre(enCours)){
    enCours.pts[1] = p;
    if (enCours.t === "image"){    // on respecte les proportions de l'image
      const l = enCours.pts[1][0] - enCours.pts[0][0];
      enCours.pts[1][1] = +(enCours.pts[0][1] + Math.abs(l) / imageEnAttente.ratio).toFixed(2);
    }
    apercu(cheminForme(enCours));
    montreCote(coteCadre(enCours.pts[0], enCours.pts[1]), enCours.pts[1]);
  } else {
    let q = p;
    if (outil === "contour"){
      const g = {};
      q = redresseTrace(p, enCours.pts, g);
      // de retour sur le premier sommet : montrer la boucle telle qu'elle
      // se fermerait, plutôt qu'un segment qui passe à côté
      if (fermeIci(q, enCours.pts) || fermeIci(p, enCours.pts)){ q = enCours.pts[0]; g.q = null; }
      traceGuide(g, q);
    }
    apercu(cheminForme({ t: "ligne", pts: [...enCours.pts, q] }));
    /* Sur un tracé, la cote est celle du segment qu'on est en train de poser :
       c'est la longueur du mur, ou du côté, qu'on cherche à faire juste. */
    const b = enCours.pts[enCours.pts.length - 1];
    montreCote(ecritMetres(Math.hypot(q[0] - b[0], q[1] - b[1])) + " m", q);
  }
  return true;
}
export function dessinPointerUp(e){
  if (editionPointerUp(e)) return true;
  if (!enCours) return false;
  if (e && e.pointerId != null){
    try { if (svg.hasPointerCapture(e.pointerId)) svg.releasePointerCapture(e.pointerId); } catch (err) {}
  }
  if (estCadre(enCours)){
    const tracee = () => Math.abs(enCours.pts[1][0] - enCours.pts[0][0]) > .3 &&
                         Math.abs(enCours.pts[1][1] - enCours.pts[0][1]) > .3;
    /* Un clic sans glisser n'est pas un geste manqué : c'est la demande de
       reposer la taille précédente, une fois qu'on l'a trouvée. Le coin
       cliqué, que l'aimant vient de poser juste, en devient l'origine. */
    if (!tracee()) reprendTaille(enCours);
    const pose = tracee() ? enCours : null;
    if (pose){
      const a = pose.pts[0], b = pose.pts[1];
      if (pose.t === "image"){
        pose.pts = [[Math.min(a[0], b[0]), Math.min(a[1], b[1])],
                    [Math.max(a[0], b[0]), Math.max(a[1], b[1])]];
        pose.src = imageEnAttente.src;
      }
      retientTaille(pose);
      ajouteForme(pose);
    }
    poseEbauche(null); apercu(null); apercuGuide(null); montreCote(null);
    /* Le curseur n'a pas bougé : les points d'accrochage se recentrent sur
       lui, plutôt que de rester autour du coin d'où partait le tracé. */
    montreAimants(e ? [versPlan(e.clientX, e.clientY)] : null, { alt: e && e.altKey });
    /* Un stand loué à cinq se découpe en cinq : on enchaîne, et le champ redit
       lequel vient d'être posé plutôt que de se vider en silence. Le reste
       reprend la palette, qui annonce alors la taille qu'un clic reposerait —
       appelée avant, elle aurait décrit un tracé qui n'existe plus. */
    if (pose && pose.t === "stand") enchaineStand(pose);
    else if (pose && pose.t === "image" && $("outilsAide"))
      $("outilsAide").textContent = ditImagePosee(pose, optionActive("imageStand")
        ? "Image posée. Elle n'ouvre aucune fiche : nommez un exposant pour cela."
        : "Image posée.");
    else aide();
  }
  return true;   // polygone et ligne restent ouverts jusqu'à Entrée
}
export function termineTrace(valider){
  if (!enCours) return;
  const mini = enCours.t === "ligne" ? 2 : 3;
  // l'arrondi se lit à la validation : on peut le régler le tracé commencé
  if (outil === "contour" && rayonContour() > 0) enCours.r = rayonContour();
  // l'épaisseur et le style se lisent de même, à la fin du tracé
  if (outil === "ligne" && enCours.t === "ligne") poseTrait(enCours);
  if (valider && enCours.pts.length >= mini) ajouteForme(enCours);
  poseEbauche(null); apercu(null); apercuGuide(null); montreCote(null);
  montreAimants(null); aide();
}

function aide(){
  if (!$("outilsAide")) return;
  const t = { main: formeSel ? "Glissez pour déplacer, les carrés pour redimensionner."
                             : "Cliquez une forme de ce calque pour la modifier.",
              rect: "Cliquez-glissez pour tracer un rectangle.",
              poly: "Un clic par sommet, Entrée pour fermer, Échap pour annuler.",
              contour: "Un clic par angle du hall. Revenez sur le premier point, " +
                       "ou Entrée, pour fermer le contour.",
              ligne: "Un clic par point, Entrée pour terminer, Échap pour annuler.",
              texte: "Saisissez le texte, puis cliquez à l'emplacement voulu.",
              repere: "Choisissez ou saisissez un libellé, puis cliquez à l'emplacement.",
              stand: "Choisissez l'exposant, puis cliquez-glissez sur sa part du stand.",
              image: imageEnAttente ? "Glissez sur le plan pour poser une autre copie."
                                    : "Choisissez une image, ou déposez le fichier sur le plan.",
              _: "" };
  const n = enCours ? " (" + enCours.pts.length + " point" + (enCours.pts.length > 1 ? "s" : "") + ")" : "";
  /* Ce qu'un simple clic reposerait, dit avec ses mesures : une taille qu'on
     ne voit pas annoncée est une taille qu'on retrace à la main. */
  const d = DERNIERE[outil];
  const bis = d && !enCours
    ? " Un clic simple repose " + ecritMetres(d[0]) + " × " + ecritMetres(d[1]) + " m." : "";
  $("outilsAide").textContent = t[outil] + n + bis;
}

/* L'outil qui est une option du plan : le salon qui n'a pas pris le dessin des
   stands garde son bouton dans la palette, grisé, et c'est ici que le clic
   retombe sur la sélection (voir « OPTIONS » de « options.mjs »). L'image,
   elle, n'est pas une option — c'en est une de la rattacher à un exposant, et
   c'est son champ qui se grise. */
const OPTION_OUTIL = { stand: "dessinStand" };
const outilOffert = (o) => !OPTION_OUTIL[o] || optionActive(OPTION_OUTIL[o]);

/* Ce que ces deux options refont quand l'exploitant les ferme, l'outil le sait
   seul : il le leur confie dès que la page d'administration le charge
   (`options.mjs`). L'outil qu'on ferme ne s'est jamais tenu en main hors de
   l'administration, et le champ image ne se pose qu'outil en main. */
// l'outil qu'on vient de fermer ne peut pas rester celui qu'on tient
confieApresOption("dessinStand", () => { if (outil === "stand") choisitOutil("main"); });
/* Le gris du champ vient de la feuille de style, mais sa prise au clavier
   et sa liste de choix se posent en JS, et seulement l'outil en main : on
   repasse par là pour l'exploitant qui bascule l'option sans le lâcher. */
confieApresOption("imageStand", () => { if (outil === "image") poseChampImage(); });

/* --- suppression au clic en mode sélection --- */
export function choisitOutil(o){
  /* Le bouton retiré ne suffit pas : l'option peut se fermer alors qu'on tient
     l'outil. On retombe sur la sélection plutôt que de refuser le geste. */
  if (!outilOffert(o)) o = "main";
  termineTrace(false);
  // les points visés par l'outil qu'on quitte n'ont plus lieu d'être montrés
  montreAimants(null);
  poseOutil(o);
  const b = $("outils");
  b.querySelectorAll(".outilsBtns button")
    .forEach(x => x.setAttribute("aria-pressed", x.dataset.o === outil));
  if (o !== "main") poseFormeSel(null);
  dessinePoignees(); majElement();
  b.classList.toggle("mode-image", o === "image");
  b.classList.toggle("mode-texte", o === "texte");
  b.classList.toggle("mode-contour", o === "contour");
  b.classList.toggle("mode-ligne", o === "ligne");
  b.classList.toggle("mode-repere", o === "repere");
  b.classList.toggle("mode-stand", o === "stand");
  document.documentElement.classList.toggle("mode-edition", ADMIN && o === "main");
  if (o === "texte") $("texteADessiner").focus();
  if (o === "repere") montreTransport(true);
  if (o === "stand"){ remplitListeSocietes(); $("standSoc").focus(); }
  /* L'outil image remplit la même liste, sans prendre le curseur : son premier
     geste est de choisir un fichier, et le champ n'est qu'une option — au sens
     propre, puisque le salon peut ne pas l'avoir prise. */
  if (o === "image") poseChampImage();
  aide();
}

/** Le stand posé nomme sa société, et rend la main pour la suivante. */
function enchaineStand(f){
  const l = societeDeForme(f);
  const ch = $("standSoc");
  if (l && $("outilsAide"))
    $("outilsAide").textContent = "« " +
      (nomSurLePlan(l.soc) || ("Stand " + (l.o.code || "")).trim()) +
      " » matérialisé. Choisissez l'exposant suivant.";
  if (ch){ ch.focus(); ch.select(); }
}

/** Les modes de transport, pour les deux listes qui les proposent — celle de
 *  la boîte à outils et celle du panneau d'édition. */
export const optionsModes = () => MODES_TRANSPORT
  .map(m => '<option value="' + esc(m.v) + '">' + esc(m.nom) + '</option>').join("");

/* La couleur d'une ligne connue s'impose dès que la ligne est écrite : c'est
   celle de la signalétique, et personne n'a à la retrouver. Celle qu'on a
   choisie à la main tient jusqu'à la prochaine ligne connue — on pose les
   arrêts d'un réseau les uns après les autres, et redire sa couleur à chacun
   serait une corvée. Le calque reprend la main quand ni l'une ni l'autre n'a
   été dite. */
let couleurALaMain = false;
function proposeCouleurLigne(){
  const c = couleurLigne($("repereMode").value, $("repereLigne").value);
  if (c){ $("repereCouleur").value = c; couleurALaMain = false; return; }
  if (couleurALaMain) return;
  const cal = trouveCalque(calqueActif);
  if (cal && cal.couleur) $("repereCouleur").value = cal.couleur;
}

/* Le mode et la ligne ne disent rien d'un vestiaire : ils ne paraissent que
   sous le type qui les appelle. Et ce n'est pas le même champ qui prend la
   suite — d'un arrêt on attend sa ligne, du reste son libellé. */
function montreTransport(prendLaMain){
  const on = $("repereType").value === "transport";
  $("outils").classList.toggle("mode-transport", on);
  if (on) proposeCouleurLigne();
  if (prendLaMain) (on ? $("repereLigne") : $("repereTexte")).focus();
}

let couleurEnCours = false;

export function activeCalque(id){
  /* Un calque verrouillé ne s'ouvre pas : tous les gestes d'édition — tracer,
     saisir une forme, la déplacer, l'effacer — passent par le calque ouvert, et
     le verrou n'a donc rien d'autre à retenir. Le panneau éteint déjà son
     crayon ; restent les chemins de traverse, comme l'image déposée sur le
     plan, qui aboutissent tous ici. */
  const vise = trouveCalque(id);
  if (vise && verrouille(vise)) return;
  poseCalqueActif(calqueActif === id ? null : id);
  /* Les deux crayons du panneau — celui d'un calque, celui des textes — ne
     peuvent pas être allumés ensemble : leurs glissers viseraient le même
     pointeur. Entrer dans le placement des libellés referme déjà le dessin ;
     l'inverse manquait, et le crayon des textes serait resté allumé pour un
     mode qu'on venait de quitter. */
  if (calqueActif && PLACE_LIBELLES) modePlacementLibelles(false);
  // et la reprise d'une géométrie, qui vise le même pointeur
  if (calqueActif && SORTE_GEO) modeGeometrie(null);
  poseFormeSel(null);
  termineTrace(false);
  montreAimants(null);
  const c = trouveCalque(calqueActif);
  { const o = $("outils"); if (o) o.classList.toggle("open", !!c); }
  if (c && $("outilsCalque")) $("outilsCalque").textContent = "Dessin · " + c.nom;
  montreRoleIti(c);
  rafraichitApercu();
  dessineDessins();   // la couche active redevient cliquable
  dessinePoignees(); majElement();
  /* Les lignes des calques de dessin seules : le crayon des textes porte le
     même bouton sans être un calque, et se règle de son côté. */
  document.querySelectorAll("#pile .calq[data-dcal]").forEach(d => {
    const actif = d.dataset.dcal === calqueActif;
    d.classList.toggle("actif", actif);
    const cr = d.querySelector(".ren");
    if (cr) cr.setAttribute("aria-pressed", actif);
  });
  aide();
}

/* ------------------------------------------------------------
   Le verrou d'un calque
   Un plan finit par porter un calque qu'on ne retouche plus : le contour du
   hall, les murs qui barrent les trajets, le repérage posé une fois pour
   toutes. Il reste pourtant à un clic du crayon, et une forme y part à la
   dérive sans qu'on s'en aperçoive — on croyait dessiner sur le calque d'à
   côté. Le cadenas de sa ligne le ferme : il ne s'ouvre plus au dessin, et ne
   se supprime ni ne se renomme.

   Ce qu'il laisse passer, il le laisse exprès. La coche qui le masque et sa
   couleur ne touchent pas à ce qui est dessiné, et c'est justement en les
   réglant qu'on travaille autour d'un calque qu'on protège ; son rang dans la
   pile non plus — il se reprend d'un geste, et se voit.

   Le verrou se range dans les réglages du salon, comme le rôle d'un calque
   dans les itinéraires : la table des calques n'a pas de colonne pour lui, et
   il part ainsi aux autres postes avec eux, tout seul. Ouvert, sa clé disparaît
   plutôt que de valoir « non » : un calque supprimé ne laisse alors rien
   derrière lui.
   ------------------------------------------------------------ */
export const cleVerrou = (id) => "_verrou:" + id;
export const verrouille = (c) => !!c && !!(CONF[cleVerrou(c.id)] || {}).verrou;

export function basculeVerrou(c){
  const cle = cleVerrou(c.id);
  if (verrouille(c)) delete CONF[cle];
  else {
    conf(cle).verrou = true;
    /* On ferme parfois le calque sur lequel on vient de dessiner : les outils
       se replient avec lui, sans quoi le crayon resterait armé sur un calque
       qu'on vient de protéger. */
    if (calqueActif === c.id) activeCalque(null);
  }
  enregistreConf();
  construitPanneau();
}

/** Le dessin du cadenas. Fermé, l'anse retombe sur le boîtier ; ouvert, elle
 *  se relève d'un côté — à douze pixels, c'est la seule différence qui se
 *  voie encore, là où deux teintes du même tracé se confondraient. */
export const pictoVerrou = (ferme) =>
  '<svg class="pictoVerrou" viewBox="0 0 12 12" aria-hidden="true">' +
  '<rect x="2.3" y="5.4" width="7.4" height="5.2" rx="1.1"/>' +
  '<path d="' + (ferme ? "M4.3 5.4V3.8a1.7 1.7 0 0 1 3.4 0v1.6"
                       : "M4.3 5.4V3.8a1.7 1.7 0 0 1 3.4 0") + '"/></svg>';

/* ------------------------------------------------------------
   Le rôle du calque dans les itinéraires
   ------------------------------------------------------------ */
/** Ce que le rôle change, en une phrase — sans quoi on le règle au hasard. */
const AIDE_ROLE = {
  "": "Ce calque n'entre pas dans le calcul des trajets.",
  obstacle: "Ce qui est dessiné ici barre le passage à tout le monde : " +
    "entourez les sanitaires, les locaux, les réserves. C'est le plus court chemin — " +
    "quelques rectangles au lieu de toutes les allées.",
  pmr: "Ce qui est dessiné ici n'est contourné qu'en itinéraire accessible : " +
    "escaliers, escalators, pentes, emmarchements, estrades. Un pictogramme " +
    "posé dessus les signale au visiteur, il ne les fait pas éviter.",
  circulation: "Les trajets ne sortiront plus de ce qui est dessiné ici, et il faudra " +
    "donc tracer toutes les allées. Faites-les telles qu'elles sont : le dégagement " +
    "au bord est retiré tout seul.",
  "circulation-pmr": "Ce qui est dessiné ici ne s'ouvre qu'en itinéraire accessible, " +
    "et reste fermé aux autres : le couloir qui mène à l'ascenseur, la rampe qui " +
    "contourne les marches. Faites-le mordre d'un bon mètre sur l'allée qu'il rejoint, " +
    "sans quoi il débouche sur un mur — cette morsure se ferme aux autres comme le " +
    "reste, ne barrez donc pas l'allée en travers.",
};

/* Un calque de rôle décrit le terrain, pas ce qu'on montre : l'éteindre le
   retire de l'écran sans le retirer du calcul. C'est ce qu'on attend d'un mur,
   et c'est assez surprenant pour être écrit sous la liste. */
const AIDE_ROLE_MASQUE = " Masquer le calque ne change rien au calcul : " +
  "le dessin disparaît de l'écran, pas du terrain.";

function montreRoleIti(c){
  const sel = $("roleIti");
  if (!sel) return;
  // la liste se remplit au premier passage, et non au chargement : les rôles
  // vivaient dans un module assemblé après le dessin, et l'ordre est resté
  if (!sel.options.length)
    sel.innerHTML = ROLES_ITI.map(r =>
      '<option value="' + r.v + '">' + esc(r.nom) + '</option>').join("");
  const r = c ? roleIti(c) : "";
  sel.value = r;
  $("roleAide").textContent = (AIDE_ROLE[r] || "") + (r ? AIDE_ROLE_MASQUE : "");
}

export function creeCalque(){
  demandeNom("Nouveau calque", "Calque " + (mesCalques().length + 1), nom => {
    memorise();
    const c = { id: nouvelId(), nom: nom, couleur: "#2F49D1",
                rempli: false, visible: true, formes: [] };
    mesCalques().push(c);
    enregistreDessins();
    construitPanneau();
    activeCalque(c.id);
  });
}

/* saisie du nom dans une fenêtre : plus visible qu'un double-clic */
function demandeNom(titre, valeur, suite){
  let champ;
  ouvreModale(titre, corps => {
    champ = document.createElement("input");
    champ.className = "nomcalque";
    champ.value = valeur;
    champ.setAttribute("aria-label", "Nom du calque");
    corps.appendChild(champ);
    setTimeout(() => { champ.focus(); champ.select(); }, 30);
    champ.onkeydown = e => {
      if (e.key === "Enter"){ e.preventDefault(); valide(); }
    };
  }, [
    { libelle: "Annuler" },
    { libelle: "Valider", action: () => suite((champ.value || valeur).trim() || valeur) },
  ], "outil");
  function valide(){ const v = (champ.value || valeur).trim() || valeur; fermeModale(); suite(v); }
}

export function renommeCalque(c, apres){
  demandeNom("Renommer le calque", c.nom, nom => {
    memorise();
    c.nom = nom;
    enregistreDessins();
    construitPanneau();
    if (calqueActif === c.id) $("outilsCalque").textContent = "Dessin · " + c.nom;
    if (apres) apres();
  });
}

/**
 * Le branchement : `_dessin.html` l'appelle à la place que ce code tenait. Les
 * boutons et les champs de la boîte à outils s'y branchent, comme le dépôt et
 * le collage d'une image, dans l'ordre où le code soudé les posait.
 */
export function brancheOutilDessin(){

  $("fichierImage").onchange = e => { importeImage(e.target.files[0]); e.target.value = ""; };
  $("choisirImage").onclick = () => $("fichierImage").click();

  /* glisser-déposer sur le plan, et collage clavier : deux chemins qui ne
     dépendent pas de la boîte de dialogue système */
  // le pointeur sorti du plan ne vise plus rien : les points d'accrochage s'effacent
  svg.addEventListener("pointerleave", () => { if (!enCours && !geste) montreAimants(null); });

  svg.addEventListener("dragover", e => { if (ADMIN) e.preventDefault(); });
  svg.addEventListener("drop", e => {
    if (!ADMIN) return;
    e.preventDefault();
    const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) importeImage(f, versPlan(e.clientX, e.clientY));
  });
  addEventListener("paste", e => {
    if (!ADMIN) return;
    const it = [...(e.clipboardData ? e.clipboardData.items : [])]
      .find(x => x.type.indexOf("image/") === 0);
    if (it) importeImage(it.getAsFile());
  });

  $("outils").querySelectorAll(".outilsBtns button")
    .forEach(b => b.onclick = () => choisitOutil(b.dataset.o));
  $("annuleDernier").onclick = annule;
  /* Changer le pas, ou couper l'accrochage, se voit tout de suite : les points
     montrés sont effacés, et le prochain mouvement les repose au nouveau pas. */
  if ($("aimantPas")) $("aimantPas").onchange = () => montreAimants(null);
  if ($("aimants")) $("aimants").onchange = () => montreAimants(null);
  $("fermeOutils").onclick = () => { if (calqueActif) activeCalque(calqueActif); };
  $("renommeOutils").onclick = () => {
    const c = trouveCalque(calqueActif);
    if (c) renommeCalque(c);
  };
  /* Le type décide de ce que le repère est ; le libellé, de ce qu'il s'appelle.
     Poser un WC ne demande donc rien d'autre que de choisir « WC » — le libellé
     ne sert qu'à distinguer deux exemplaires, « Entrée Nord » de « Entrée Sud ». */
  $("repereType").innerHTML =
    TYPES_REPERE.map(t => '<option value="' + esc(t.v) + '">' + esc(t.nom) + '</option>').join("");

  $("repereMode").innerHTML = optionsModes();

  $("repereType").onchange = () => montreTransport(true);
  $("repereMode").onchange = proposeCouleurLigne;
  $("repereLigne").oninput = proposeCouleurLigne;
  $("repereCouleur").oninput = () => { couleurALaMain = true; };

  $("elemSupprimer").onclick = supprimeForme;
  /* Une frappe n'est pas un geste : la salve entière se défait d'un seul Ctrl+Z
     (voir `memorise`), et la quitter en rouvre une. */
  $("elemTexte").oninput = () => appliqueTexte("texte");
  $("elemTexte").onblur = clotSalve;
  $("elemTaille").oninput = () => appliqueTexte("taille");
  $("elemTaille").onblur = clotSalve;
  $("elemRotation").oninput = () => appliqueRotation("rotation");
  $("elemRotation").onblur = clotSalve;
  $("elemRotationQuart").onclick = () => {
    const r = $("elemRotation");
    r.value = String(((Math.round(+r.value || 0) + 90 + 180) % 360 + 360) % 360 - 180);
    appliqueRotation();
  };
  if ($("elemRayon")) $("elemRayon").oninput = appliqueRayon;
  /* L'épaisseur et le style se reprennent sur une ligne déjà posée : on juge un
     trait sur le plan, pas dans une liste déroulante. */
  if ($("elemEpaisseur")) $("elemEpaisseur").onchange = appliqueTrait;
  if ($("elemStyle")) $("elemStyle").onchange = appliqueTrait;
  if ($("elemFleche")) $("elemFleche").onchange = appliqueTrait;
  /* La largeur et la hauteur au clavier : c'est le seul moyen d'obtenir deux
     fois la même, et de rattraper un stand tracé à peu près. */
  if ($("elemLargeur")) $("elemLargeur").oninput = () => appliqueDimension("l");
  if ($("elemHauteur")) $("elemHauteur").oninput = () => appliqueDimension("h");
  $("elemPicto").onchange = appliquePicto;
  /* Le mode et la ligne d'un arrêt se reprennent comme son type, et dans le même
     panneau : on juge une pastille sur le plan, pas dans une liste. */
  $("elemMode").onchange = () => appliqueTransport();
  $("elemLigne").oninput = () => appliqueTransport("ligne");
  $("elemLigne").onblur = clotSalve;
  /* La couleur, elle, se peint à chaque événement du nuancier et ne s'écrit
     qu'au repos : la rafale ne refait que la forme tirée, jamais tous les
     calques. Le retour en arrière tient le geste entier — on mémorise au premier
     événement, pas à chacun. */
  suitNuancier($("elemCouleur"), (v) => {
    const cible = formeSel && formeParId(formeSel);
    if (!cible || !estTransport(cible.f)) return;
    if (!couleurEnCours){ memorise(); couleurEnCours = true; }
    const c = couleurEcrite(cible.f.mode, cible.f.ligne, v, cible.c);
    if (c) cible.f.couleur = c; else delete cible.f.couleur;
    redessineForme(cible.f);
  }, () => { couleurEnCours = false; enregistreDessins(); });
  /* La liste des passages revient à « Relier à… » dès que le choix est fait :
     c'est une action, pas un réglage — on en pose plusieurs à la suite. */
  $("elemLienAjout").onchange = (e) => {
    const id = e.target.value;
    e.target.value = "";
    if (id) changeLien(id, true);
  };
  /* On valide le rattachement à la sortie du champ, et non à chaque frappe :
     « SM » ne désigne personne et effacerait le lien. */
  $("elemSoc").onchange = appliqueSociete;
  $("elemSoc").onblur = appliqueSociete;

  $("roleIti").onchange = e => {
    const c = trouveCalque(calqueActif);
    if (!c) return;
    const v = e.target.value;
    const cle = cleRoleIti(c.id);
    if (v) conf(cle).role = v; else delete CONF[cle];
    enregistreConf();
    oublieGrilles();
    montreRoleIti(c);
    dessineDessins();
    construitPanneau();
    rafraichitApercu();
    // le trajet affiché doit obéir sur-le-champ : c'est le seul retour visible
    relance();
  };

  $("voirNappe").onchange = e => { poseNappe(e.target.checked); rafraichitApercu(); };
}
