/* ============================================================
   11. Calques de dessin — le tracé sur le plan

   Ce que le visiteur voit des calques que l'exploitant a dessinés : chaque
   forme tracée dans son calque, les pointes de flèche à la taille du zoom,
   les repères et leurs pastilles, les images posées et ce qu'elles
   désignent, les stands dessinés à la main, leur nom et leur sélection.
   `plan.mjs` embarque ce module.

   Il n'a plus rien à recevoir du code soudé : la forme choisie dans
   l'éditeur et sa boîte (`forme-choisie.mjs`), l'ordre des couches
   (`ordre-trace.mjs`), la fiche, la recherche, les secteurs et l'écran
   s'importent ; la mention de la source, qu'il est seul à refaire, vit ici.
   Ce module se tient au-dessus de la fiche et des libellés, qui se font donc
   confier ce qu'ils lui empruntent (`decoupeStand`, `marqueStandsDessines`).
   ============================================================ */
import { $ } from "./dom.mjs";
import { esc } from "./texte.mjs";
import { DATA, parId, state, P } from "./donnees.mjs";
import { optionActive } from "./configuration.mjs";
import { svg, vue, cadrePlan } from "./vue.mjs";
import { ADMIN } from "./mode-admin.mjs";
import { roleIti } from "./itineraire.mjs";
import { poseMasqueCarte } from "./environs.mjs";
import { P_NOM } from "./polices-plan.mjs";
import { mesCalques, calqueActif } from "./calques-dessin.mjs";
import { cheminForme, styleTrait, EPAISSEUR_TRAIT } from "./chemin-forme.mjs";
import { PICTOS, pictoForme, nomTypeRepere, modeDit, estTransport, glypheRepere, ligneAffichee,
  couleurRepere, encreRepere } from "./reperes.mjs";
import { cartouchePoi, phareRepere } from "./points-interet.mjs";
import { REDUIT } from "./ecran.mjs";
import { visibleSociete } from "./recherche.mjs";
import { coloreSecteurs } from "./secteurs.mjs";
import { societes } from "./fiche.mjs";
import { largeur } from "./texte-plan.mjs";
import { libelleEmplacement } from "./libelles.mjs";
import { formeSel, boite } from "./forme-choisie.mjs";
import { ordonneDom } from "./ordre-trace.mjs";

/* ------------------------------------------------------------
   La mention de la source

   La licence d'OpenStreetMap demande qu'on la cite partout où ses données se
   montrent, et donc sur le plan public : la mention paraît dès qu'un calque
   visible porte un contour qui en vient, et s'efface avec lui.

   D'où le `f.osm` en propre, et non `refForme` : un contour relevé à la main
   sur un plan coté ne doit rien à OpenStreetMap, et le citer à tort dirait
   d'une donnée qu'elle vient d'ailleurs que de là où elle vient.
   ------------------------------------------------------------ */
function mentionOsm(){
  const m = $("mentionOsm");
  if (!m || !DATA) return;
  m.hidden = !mesCalques().some(c => c.visible !== false &&
    (c.formes || []).some(f => f.osm));
}

/* --- la pointe des flèches ---
   Une ligne dit un chemin ; une flèche dit dans quel sens on le prend — le
   sens d'une allée, la porte par laquelle on entre, le flux d'un jour de
   montage. C'est un réglage du trait et non une forme de plus : la ligne
   reste la même pour l'itinéraire, qui lit ses sommets sans rien savoir de
   sa pointe. */
const ANGLE_FLECHE = .45;   // demi-ouverture des branches, en radians (~26°)

/**
 * La longueur des branches, en mètres, d'après le zoom du moment.
 *
 * Comme l'épaisseur du trait qu'elle termine, et pour la même raison : une
 * pointe comptée en mètres suivrait le plan, et un dézoom la réduirait à rien
 * sur une ligne restée bien visible. Elle grandit avec l'épaisseur, sans quoi
 * un trait très épais avalerait sa propre pointe.
 */
function longueurFleche(f){
  /* Au montage, les calques se dessinent avant que la vue soit posée : lire
     `view.w` arrêtait là tout le démarrage, et une seule ligne fléchée
     laissait le plan vide chez chaque visiteur. La pointe naît donc nulle —
     son tracé existe, et c'est lui que la première pose de la vue,
     `appliqueVue` puis `rafraichitFleches`, met à sa taille. Ne rien tracer
     ne suffisait pas : il n'y aurait eu aucune pointe à reprendre. */
  const view = vue();
  if (!view) return 0;
  const r = cadrePlan();
  const ep = f.ep > 0 ? f.ep : EPAISSEUR_TRAIT;
  return view.w / (r.width || 1) * (4 + ep * 3);
}

/** Les deux branches de chaque bout fléché, d'un seul tracé. */
function cheminFleche(f){
  const pts = f.pts;
  if (!f.fleche || !pts || pts.length < 2) return "";
  const bouts = [];
  if (f.fleche !== "debut") bouts.push([pts[pts.length - 2], pts[pts.length - 1]]);
  if (f.fleche !== "fin") bouts.push([pts[1], pts[0]]);
  const L = longueurFleche(f);
  let d = "";
  for (const [a, b] of bouts){
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const l = Math.hypot(dx, dy);
    if (!l) continue;                 // deux points confondus n'indiquent rien
    const ux = dx / l, uy = dy / l;
    /* Chaque branche repart de la pointe vers l'arrière, tournée d'un
       demi-angle de part et d'autre du trait. */
    for (const sens of [1, -1]){
      const c = Math.cos(ANGLE_FLECHE), s = Math.sin(ANGLE_FLECHE) * sens;
      const vx = -(ux * c - uy * s), vy = -(uy * c + ux * s);
      d += "M" + b[0].toFixed(2) + " " + b[1].toFixed(2) +
           "L" + (b[0] + vx * L).toFixed(2) + " " + (b[1] + vy * L).toFixed(2);
    }
  }
  return d;
}

/** La pointe prend la couleur et l'épaisseur du trait, jamais son pointillé
 *  ni le remplissage de son calque : une pointe en creux, ou en trois points,
 *  ne montre plus rien. Le style est écrit sur la balise pour tenir devant le
 *  pointillé que le mode édition pose sur les calques porteurs d'un rôle. */
function marqueFleche(f){
  const d = cheminFleche(f);
  if (!d) return "";
  const ep = f.ep > 0 ? f.ep : EPAISSEUR_TRAIT;
  return '<path class="fleche" style="fill:none;stroke-dasharray:none' +
         (ep !== EPAISSEUR_TRAIT ? ";stroke-width:" + ep : "") + '" d="' + d + '"/>';
}

/** Le zoom change : les pointes se reprennent, comme les pastilles de
 *  l'itinéraire — le trait, lui, garde son épaisseur par la feuille de style.
 *  Un plan sans flèche ne coûte que le premier test. */
export function rafraichitFleches(){
  const c = $("couches");
  const pointes = c && c.querySelectorAll(".dcal .fleche");
  if (!pointes || !pointes.length || !vue()) return;
  const par = new Map();
  for (const cal of mesCalques())
    for (const f of cal.formes) if (f.fleche) par.set(f.id, f);
  pointes.forEach(p => {
    const f = par.get(p.parentNode.dataset.f);
    if (f) p.setAttribute("d", cheminFleche(f));
  });
}

/** Le balisage d'une forme, seule. Sorti de « dessineDessins » pour qu'un
 *  geste puisse refaire une forme sans refaire le plan. */
function traceForme(f){
  return f.t === "image"
    ? traceImage(f)
    : f.t === "repere"
    ? traceRepere(f)
    : f.t === "stand"
    ? traceStandDessine(f)
    : f.t === "texte"
    ? '<g class="forme' + (f.id === formeSel ? " pick" : "") + '" data-f="' + f.id + '"><text x="' + f.pts[0][0] + '" y="' + f.pts[0][1] +
      '" font-size="' + (f.taille || 2) + '"' + rotationTexte(f) + '>' + esc(f.txt) + '</text></g>'
    : '<g class="forme' + (f.id === formeSel ? " pick" : "") + '" data-f="' + f.id +
      '"><path' + styleTrait(f) + ' d="' + cheminForme(f) + '"/>' +
      marqueFleche(f) + '</g>';
}

/** Un texte pivote autour de son point d'ancrage, celui qu'on a cliqué pour
 *  le poser : c'est lui qui reste sous la poignée, et le nom d'une allée
 *  oblique se couche le long d'elle sans quitter l'endroit où on l'a mis. Le
 *  rendu WebGL relit l'attribut, et n'a donc rien à rejouer. */
function rotationTexte(f){
  const a = +f.rot || 0;
  return a ? ' transform="rotate(' + a + " " + f.pts[0][0] + " " + f.pts[0][1] + ')"' : "";
}

export function dessineDessins(){
  const c = $("couches");
  c.querySelectorAll(".dcal").forEach(g => g.remove());
  for (const cal of mesCalques()){
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const role = roleIti(cal);
    g.setAttribute("class", "dcal" + (cal.rempli ? " plein" : "") +
                            (role ? " role " + role : "") +
                            (cal.id === calqueActif && ADMIN ? " editable" : ""));
    g.dataset.dcal = cal.id;
    g.style.color = cal.couleur || "var(--accent)";
    g.style.display = cal.visible === false ? "none" : "";
    g.innerHTML = cal.formes.map(traceForme).join("");
    c.appendChild(g);
  }
  ordonneDom();
  /* Un contour qui perce le fond de carte vient peut-être d'être tracé,
     déplacé ou effacé : le gabarit de découpe suit le dessin, et lui seul sait
     quand il a changé. */
  poseMasqueCarte();
  cartouchePoi();
  mentionOsm();
  /* Les stands dessinés viennent de renaître : la teinte de leur secteur et le
     fondu du filtre se posent sur des nœuds qui n'existaient pas encore. */
  rafraichitStandsDessines();
}

/**
 * Une seule forme refaite, à sa place dans son calque.
 *
 * C'est ce dont un geste a besoin. « dessineDessins » refait les nœuds de tous
 * les calques, puis remesure le cartouche des repères et rallume les zones :
 * soixante-dix millisecondes, dont soixante-huit pour un cartouche que
 * déplacer une forme ne change pas — ni son libellé, ni son type, ni la
 * visibilité de son calque. Appelé à chaque mouvement de souris, il faisait
 * traîner la forme d'une bonne demi-seconde derrière le pointeur, là où le
 * tracé d'une forme neuve, qui ne passe que par « apercu », suit la main.
 *
 * Ne s'en trouve ici que ce qu'un déplacement périme vraiment : le tracé, la
 * découpe du fond de carte, et le nom d'un stand dessiné.
 */
export function redessineForme(f){
  const g = $("couches").querySelector('.forme[data-f="' + CSS.escape(f.id) + '"]');
  if (!g){ dessineDessins(); return; }
  const hote = document.createElementNS("http://www.w3.org/2000/svg", "g");
  hote.innerHTML = traceForme(f);
  const neuf = hote.firstElementChild;
  if (!neuf){ dessineDessins(); return; }
  g.replaceWith(neuf);
  /* La mise en avant d'un point d'intérêt est posée par « eclairePoi », que
     l'on ne rappelle pas : le nœud neuf la reprend ici, sans quoi le repère
     qu'on déplace s'éteindrait sous le doigt. */
  if (f.t === "repere") neuf.classList.toggle("phare", phareRepere(f));
  // un stand dessiné porte son nom et le retrait de son secteur : tous deux
  // se posent sur un nœud qui vient de naître
  if (f.t === "stand") rafraichitStandsDessines();
  /* Un contour qui perce le fond de carte vient de bouger : le gabarit de
     découpe suit le dessin. Il se compare avant de se reposer. */
  poseMasqueCarte();
}

/** La couleur d'un calque posée sans rebâtir son dessin : le groupe la porte,
 *  et ses tracés la prennent par `currentColor`. C'est ce dont le nuancier a
 *  besoin pendant qu'on glisse — `dessineDessins` refait tous les nœuds de
 *  tous les calques, ce qu'une rafale d'événements ne supporte pas. */
export function peintCalque(cal){
  const g = $("couches").querySelector('.dcal[data-dcal="' + CSS.escape(cal.id) + '"]');
  if (g) g.style.color = cal.couleur || "var(--accent)";
}

/* La conversion écran → repère du plan, `versPlan` : `modules/vue.mjs`. */

export function apercu(d){
  let el = $("apercu");
  if (!d){ if (el) el.remove(); return; }
  if (!el){
    el = document.createElementNS("http://www.w3.org/2000/svg", "path");
    el.id = "apercu";
    svg.appendChild(el);
  }
  el.setAttribute("d", d);
}

/** Le trait fin qui montre sur quoi le point vient de s'aligner. */
export function apercuGuide(d){
  let el = $("apercuGuide");
  if (!d){ if (el) el.remove(); return; }
  if (!el){
    el = document.createElementNS("http://www.w3.org/2000/svg", "path");
    el.id = "apercuGuide";
    svg.appendChild(el);
  }
  el.setAttribute("d", d);
}

/* Taille de naissance d'un repère, en mètres. Un texte libre en fait deux ;
   un repère doit se repérer de loin, sans qu'on le cherche. */
export const TAILLE_REPERE = 4;

/**
 * Un repère : une pastille dans la couleur du calque, son libellé dedans.
 *
 * La largeur suit le texte, mesurée dans la police de rendu — une pastille
 * taillée au jugé serait trop courte sur « Restauration » et trop longue sur
 * « WC ». Tout est en mètres, comme le reste du plan : le repère grandit donc
 * avec le zoom, à l'inverse d'une épingle d'interface.
 */
function traceRepere(f){
  const t = f.taille || 2;
  /* Le repère répond au clic comme un stand : le plan ne montre plus que le
     pictogramme, et c'est la fiche qui dit son nom. Le rôle et le libellé
     partent avec lui, pour qui lit le plan au clavier ou à la synthèse
     vocale. */
  const dit = String(f.txt || "").trim();
  const type = pictoForme(f);
  const nom = dit || (type ? nomTypeRepere(type) : "Repère");
  /* La couleur d'une ligne se pose sur le groupe et non sur l'aplat : la
     pastille la prend par « currentColor », le pictogramme et le numéro
     prennent l'encre qui se lit dessus. Sans ligne connue rien n'est posé, et
     l'arrêt reste de la couleur de son calque comme n'importe quel repère. */
  const fond = couleurRepere(f);
  /* Le tram fait exception : sa couleur ne s'étale pas, elle tient en deux
     barres qui encadrent l'indice sur champ clair. Elle se pose donc toujours
     sur le groupe — les barres la prennent par « currentColor », et un arrêt
     dont la ligne est inconnue les tire de son calque, comme n'importe quel
     repère. Mais l'encre ne se calcule plus ici : le champ est le même pour
     toutes les lignes, et la feuille de style la donne une fois pour toutes. */
  const plaque = Boolean(estTransport(f) && modeDit(f.mode).plaque);
  /* L'anneau du métro tient sa couleur du groupe comme les barres du tram, et
     sur le même champ clair. L'encre, elle, se calcule encore : elle n'écrit
     plus sur le champ mais dans la pastille de l'indice, qui est à la couleur
     de la ligne — blanc dans le vert du 12, noir dans le jaune du 1. */
  const anneau = Boolean(estTransport(f) && modeDit(f.mode).anneau);
  const teinte = fond
    ? ' style="color:' + fond +
      (plaque ? "" : ';--encre-poi:' + encreRepere(fond)) + '"' : "";
  const tete = '<g class="forme repere' + (plaque ? " plaque" : "") +
               (anneau ? " anneau" : "") +
               (f.id === formeSel ? " pick" : "") +
               '" data-f="' + f.id + '" data-poi="' + esc(f.id) +
               '" tabindex="0" role="button" aria-label="' +
               esc(nom + (type && dit ? " — " + nomTypeRepere(type) : "")) + '"' +
               teinte + '>';

  /* Un pictogramme se pose dans un <svg> imbriqué : il porte sa propre grille,
     et le navigateur se charge du cadrage — plus sûr qu'une transformation
     calculée à la main. */
  const g = PICTOS[glypheRepere(f)];
  if (g){
    /* La pastille ne porte que le pictogramme — et le numéro de la ligne,
     * quand c'est un arrêt.
     *
     * Le libellé s'écrivait à côté dès qu'il disait autre chose que lui —
     * « Entrée Nord » avait besoin de son nord. Mais un nom écrit à la taille
     * du plan ne se lit qu'en zoomant, et la pastille s'allongeait de tout ce
     * texte en travers de l'allée qu'elle désigne. Le pictogramme dit ce que
     * c'est, ce qui est la question qu'on se pose de loin ; le nom se demande
     * de près, et c'est la fiche qui le donne. Le cartouche des points
     * d'intérêt, lui, continue de les nommer tous.
     */
    const cote = t * 2.4, retrait = cote * .035;
    /* La plaque réserve ses deux bords aux barres : le pictogramme et l'indice
       se rangent entre elles, d'où une marge un peu plus large qu'ailleurs. */
    const hBarre = plaque ? cote * .11 : 0;
    const m = cote * (plaque ? .165 : .15), k = cote - 2 * m;
    /* Le numéro de la ligne s'écrit à côté du pictogramme, comme sur les
       plaques : le dessin dit ce qui passe, le numéro dit lequel, et la
       pastille s'allonge de ce qu'il mesure. Lui seul s'écrit — un arrêt
       s'appelle « Métro 12 », et le mot « Métro » est déjà dans le dessin. */
    const ligne = estTransport(f) ? ligneAffichee(f.mode, f.ligne) : "";
    const corps = t * 1.1;
    const lt = ligne ? largeur(ligne, P_NOM) * corps : 0;
    const ecart = ligne ? cote * .12 : 0;
    /* Le rond du métro est de la taille du pictogramme, pour que l'anneau et
       l'indice se lisent comme deux pastilles de même poids. Il s'allonge en
       gélule quand le numéro déborde — « 3bis » ne tient pas dans un cercle
       sans qu'on réduise le chiffre au point de ne plus le voir de loin. */
    const rond = anneau && ligne ? Math.max(k, lt + k * .35) : 0;
    const li = rond || lt;
    const w = cote + ecart + li;
    const x = f.pts[0][0] - w / 2, y = f.pts[0][1] - cote / 2;
    /* Les barres se retirent des bords : à ras, leurs angles dépasseraient des
       coins arrondis de la plaque. Elles s'arrondissent comme sur le quai, et
       se groupent pour que les liserés de sélection, qui ne visent que les
       enfants directs de la pastille, les laissent tranquilles. */
    const barre = (by) => '<rect x="' + (x + retrait).toFixed(2) +
      '" y="' + by.toFixed(2) + '" width="' + (w - 2 * retrait).toFixed(2) +
      '" height="' + hBarre.toFixed(2) + '" rx="' + (hBarre / 2).toFixed(2) + '"/>';
    /* L'indice : le numéro seul partout, et dans sa pastille au métro. Celle-ci
       se groupe avec lui, comme les barres du tram et pour la même raison — le
       liseré de sélection ne vise que les enfants directs de la pastille, et
       cernerait sinon le rond au lieu du repère. */
    const indice = (cx) => !ligne ? "" :
      (rond ? '<g class="indice"><rect x="' + (cx - rond / 2).toFixed(2) +
        '" y="' + (f.pts[0][1] - k / 2).toFixed(2) + '" width="' + rond.toFixed(2) +
        '" height="' + k.toFixed(2) + '" rx="' + (k / 2).toFixed(2) + '"/>' : "") +
      '<text x="' + cx.toFixed(2) + '" y="' + (f.pts[0][1] + corps * .35).toFixed(2) +
      '" font-size="' + corps.toFixed(2) + '">' + esc(ligne) + '</text>' +
      (rond ? '</g>' : "");
    return tete +
      '<rect x="' + x.toFixed(2) + '" y="' + y.toFixed(2) + '" width="' + w.toFixed(2) +
      '" height="' + cote.toFixed(2) + '" rx="' + (cote * .2).toFixed(2) + '"/>' +
      (plaque ? '<g class="barres">' + barre(y + retrait) +
        barre(y + cote - retrait - hBarre) + '</g>' : "") +
      '<svg class="glyphe" x="' + (x + m).toFixed(2) + '" y="' + (y + m).toFixed(2) +
      '" width="' + k.toFixed(2) + '" height="' + k.toFixed(2) +
      '" viewBox="' + g.vb + '">' + g.d + '</svg>' +
      indice(x + cote - m + ecart + li / 2) +
      '</g>';
  }

  /* Sans pictogramme, le libellé est tout ce que le repère a à montrer : le
     retirer laisserait une pastille muette. */
  const l = largeur(nom, P_NOM) * t;
  const w = l + t * 1.1, ht = t * 1.65;
  const x = f.pts[0][0] - w / 2, y = f.pts[0][1] - ht / 2;
  return tete +
    '<rect x="' + x.toFixed(2) + '" y="' + y.toFixed(2) + '" width="' + w.toFixed(2) +
    '" height="' + ht.toFixed(2) + '" rx="' + (ht / 2).toFixed(2) + '"/>' +
    '<text x="' + f.pts[0][0] + '" y="' + (f.pts[0][1] + t * .35).toFixed(2) +
    '" font-size="' + t.toFixed(2) + '">' + esc(nom) + '</text></g>';
}

/* ------------------------------------------------------------
   Les stands dessinés à la main
   ------------------------------------------------------------
   La synchronisation ne rend qu'une forme par dossier : un stand loué à
   plusieurs n'en a donc qu'une, et les sociétés qui s'y installent n'existent
   que dans une liste. Sur le plan elles ne sont nulle part, et le visiteur qui
   cherche l'une d'elles lit le nom d'une autre peint sur la cloison.

   L'exploitant les matérialise donc lui-même : il découpe le stand en autant
   de rectangles qu'il y a d'enseignes, et rattache chacun à la société qu'il
   désigne. Ce n'est pas un dessin de plus — la forme se lit comme un stand,
   même aplat et même libellé, s'ouvre au clic sur la fiche complète de sa
   société, et renvoie l'itinéraire vers le stand qui la porte : on ne marche
   pas jusqu'à un co-exposant, on marche jusqu'à son hôte.
   ------------------------------------------------------------ */

/** Le nom d'une société tel qu'il s'écrit sur le plan — vide s'il n'y en a
 *  pas, là où la fiche se rabat sur « Sans nom ». */
export const nomSurLePlan = (soc) => soc.nom || soc.plan || "";

/**
 * L'étiquette sous laquelle une société se désigne : « SMC2 — G55 », et pour
 * un co-exposant « BERTRAND FRANCHISE - AU BUREAU — G55 ».
 *
 * Le nom vient d'abord, parce que c'est lui qu'on cherche des yeux dans une
 * liste rangée par ordre alphabétique ; le titulaire préfixe ses hébergés pour
 * qu'ils se lisent sous lui, et non dispersés au fil de l'alphabet. Le numéro
 * reste en queue : deux enseignes portent parfois le même nom.
 */
export function etiquetteSociete(o, soc){
  const titulaire = nomSurLePlan(o);
  const nom = nomSurLePlan(soc);
  const tete = soc === o || !nom || nom === titulaire ? nom
    : (titulaire || o.code) + " - " + nom;
  return [tete, o.code].filter(Boolean).join(" — ");
}

/* Les deux sortes de formes qui se rattachent à une société, et pour deux
   raisons. Un stand dessiné découpe un emplacement : il n'existe que par la
   société qu'il désigne, et sans elle il ne serait qu'un rectangle muet. Une
   image se pose d'abord pour ce qu'elle montre — le logo d'un exposant, une
   affiche, un plan d'aménagement — et son rattachement est ce qui la rend
   cliquable : la toucher ouvre alors la fiche, comme toucher l'emplacement.
   D'où un champ demandé, l'autre facultatif. */
const FORMES_RATTACHEES = new Set(["stand", "image"]);

/**
 * Cette forme accepte-t-elle qu'on la rattache maintenant ?
 *
 * Le stand dessiné, toujours — il n'est que cela. L'image, seulement là où le
 * salon a pris l'option : c'est le rattachement qui se vend, non l'image, et
 * un plan qui ne l'a pas prise pose ses images comme n'importe quel dessin.
 *
 * Elle ne dit rien de ce qui est déjà rattaché : « societeDeForme » continue de
 * lire les liens en place, et une image liée avant que l'option se ferme garde
 * le sien. On retire le geste, pas ce qu'il a produit.
 */
export const seRattache = (f) => !!f && FORMES_RATTACHEES.has(f.t) &&
  (f.t !== "image" || optionActive("imageStand"));

/**
 * Ce qu'une forme rattachée désigne : l'emplacement, le rang de la société, la
 * société elle-même. Rien, si le lien ne mène plus nulle part — un stand
 * disparu du salon, un co-exposant que la synchronisation d'hier a retiré.
 *
 * On ne se rabat pas alors sur le titulaire : ce serait donner à une enseigne
 * la place d'une autre. La forme reste sur le plan, muette et sans clic, et le
 * panneau d'édition invite à la rattacher de nouveau.
 */
export function societeDeForme(f){
  if (!f || !FORMES_RATTACHEES.has(f.t) || !f.stand) return null;
  const o = parId.get(f.stand);
  if (!o || o.kind !== "stand") return null;
  const i = Number.isInteger(f.soc) ? f.soc : -1;
  const soc = i < 0 ? o : (o.coex || [])[i];
  return soc ? { o: o, i: i, soc: soc } : null;
}

/** Les sociétés du pavillon courant, parmi lesquelles se choisit ce qu'un
 *  stand dessiné matérialise : par ordre alphabétique des titulaires, chacun
 *  suivi de ses co-exposants, rangés à leur tour. */
export function societesDuPlan(){
  const range = (a, b) => a.localeCompare(b, "fr", { sensitivity: "base", numeric: true });
  const cle = (s) => nomSurLePlan(s) || s.code || "";
  const out = [];
  // un stand ajouté à la main n'est pas une société : c'est lui qu'on lie
  P().stands.filter(s => !s.ajout).sort((a, b) => range(cle(a), cle(b))).forEach(s => {
    const liste = societes(s)
      .filter(x => s.code || nomSurLePlan(x.soc))
      .map(x => ({ o: s, i: x.i, soc: x.soc,
                   etiquette: etiquetteSociete(s, x.soc) || s.id }));
    out.push(...liste.filter(x => x.i < 0),
             ...liste.filter(x => x.i >= 0).sort((a, b) => range(a.etiquette, b.etiquette)));
  });
  return out;
}

/**
 * Une image posée sur le plan, et ce qu'elle désigne.
 *
 * Rattachée, elle porte l'identifiant de l'emplacement et le rang de la
 * société : le clic sur le plan cherche l'ancêtre porteur d'un « data-id », et
 * la fiche s'ouvre sans code supplémentaire — celle de l'enseigne désignée, et
 * non le choix entre les deux, quand un stand est partagé. C'est ainsi qu'on
 * pose le logo d'un exposant sur son emplacement.
 *
 * Détachée, elle reste ce qu'elle est — un dessin — et laisse passer le clic
 * vers ce qui est dessous : un plan d'aménagement posé sur un hall n'a pas à
 * empêcher d'ouvrir les stands qu'il recouvre.
 *
 * Elle n'ajoute pas de halte au clavier, là où un stand dessiné en pose une :
 * celui-ci est le seul chemin vers une hébergée qui n'a pas de forme à elle,
 * quand l'image, elle, est posée sur un emplacement que le clavier atteint
 * déjà. Deux arrêts pour la même fiche ne feraient que doubler le parcours.
 */
function traceImage(f){
  const l = societeDeForme(f);
  const nom = l ? nomSurLePlan(l.soc) : "";
  /* Le rang n'est posé que si la forme le porte. Une image d'avant le champ
     désignait l'emplacement et non l'enseigne : sur un stand partagé, la fiche
     doit continuer de demander laquelle on vient voir, plutôt que de trancher
     pour le titulaire au nom d'un choix que personne n'a fait. */
  const rang = Number.isInteger(f.soc) ? ' data-soc="' + f.soc + '"' : "";
  return '<g class="forme' + (f.id === formeSel ? " pick" : "") + (l ? " lie" : "") +
    '" data-f="' + f.id + '"' +
    (l ? ' data-id="' + esc(l.o.id) + '"' + rang +
         ' aria-label="' + esc(nom || ("Stand " + (l.o.code || "")).trim()) + '"' : "") +
    '><image href="' + f.src + '" x="' + f.pts[0][0] +
    '" y="' + f.pts[0][1] + '" width="' + (f.pts[1][0] - f.pts[0][0]) +
    '" height="' + (f.pts[1][1] - f.pts[0][1]) +
    '" preserveAspectRatio="xMidYMid meet"/></g>';
}

/**
 * Un stand dessiné, tracé comme le stand qu'il découpe.
 *
 * Il porte l'identifiant de son hôte et le rang de la société qu'on vient y
 * voir : le reste de la page n'a alors rien de nouveau à apprendre — le clic,
 * la sélection, la fiche et l'itinéraire lisent déjà ces deux-là.
 */
function traceStandDessine(f){
  const l = societeDeForme(f);
  const sel = l && l.o.id === state.sel && l.i === state.selSoc;
  const nom = l ? nomSurLePlan(l.soc) : "";
  return '<g class="forme sdes' + (f.id === formeSel ? " pick" : "") +
    (l ? " lie" : "") + (sel ? " sel" : "") + '" data-f="' + f.id + '"' +
    (l ? ' data-id="' + esc(l.o.id) + '" data-soc="' + l.i +
         '" tabindex="0" role="button" aria-label="' +
         esc(nom || ("Stand " + (l.o.code || "")).trim()) + '"' : "") +
    '><path d="' + cheminForme(f) + '"/><g class="lab"></g></g>';
}

/**
 * Le libellé d'un stand dessiné : le nom de sa société, le numéro de
 * l'emplacement dessous — exactement ce qu'un stand du plan écrit.
 *
 * Il vit dans la forme et non dans « #labels », où vivent ceux du plan. Un
 * calque de dessin peut être empilé par-dessus le calque des textes, et son
 * aplat recouvrait alors le nom qu'il était censé porter. Attaché à sa forme,
 * le libellé la suit jusque dans l'ordre des couches.
 *
 * Il se relit à chaque changement de vue, comme les autres : c'est la taille
 * du texte à l'écran qui décide s'il est lisible ou s'il vaut mieux se taire.
 */
function texteStandDessine(f, pxParM){
  const l = societeDeForme(f);
  if (!l) return "";
  const nom = nomSurLePlan(l.soc);
  if (!nom && !l.o.code) return "";
  const b = boite(f);
  const view = vue();
  const cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2;
  const sel = l.o.id === state.sel && l.i === state.selSoc;
  if (!sel && (!visibleSociete(l.o, l.i) ||
               cx < view.x - 25 || cx > view.x + view.w + 25 ||
               cy < view.y - 25 || cy > view.y + view.h + 25)) return "";
  return libelleEmplacement({ nom: nom, code: l.o.code }, [cx, cy],
                            b[2] - b[0], b[3] - b[1], sel, pxParM);
}

/** Les libellés de tous les stands dessinés du pavillon, posés dans leurs
 *  formes. Le pavillon en compte quelques dizaines au plus : on les relit
 *  tous plutôt que de tenir à jour ce qui a bougé. */
export function poseLibellesDessines(pxParM){
  const z = $("couches");
  for (const cal of mesCalques()){
    for (const f of cal.formes){
      if (f.t !== "stand") continue;
      const lab = z.querySelector('.sdes[data-f="' + CSS.escape(f.id) + '"] .lab');
      if (lab) lab.innerHTML = texteStandDessine(f, pxParM);
    }
  }
}

/**
 * Le découpage qui matérialise une société sur un emplacement, s'il a été
 * dessiné.
 *
 * Un stand dessiné porte l'identifiant de son hôte : c'est ce qui lui donne le
 * clic, la fiche et l'itinéraire sans rien apprendre de neuf au reste de la
 * page. Mais quand deux enseignes se partagent un emplacement, allumer l'hôte
 * allumerait du même coup la voisine, qu'on n'a pas demandée. La sélection
 * s'arrête donc au découpage dès qu'il en existe un pour la société choisie.
 */
export function decoupeStand(id, iSoc){
  const z = (id === null || id === undefined) ? null : $("couches");
  /* Un stand ajouté sur la couche Stands et lié à la même société en est un
     aussi : il porte les mêmes deux attributs. */
  const q = '[data-id="' + CSS.escape(String(id)) + '"][data-soc="' + Number(iSoc) + '"]';
  return (z && z.querySelector('.dcal .sdes' + q)) ||
         (z && $("stands").querySelector('g[data-aj]' + q)) || null;
}

/**
 * La sélection des stands dessinés, posée sans retracer les calques : relire
 * un calque réanalyse ses images, ce qui est cher pour un liseré qui change à
 * chaque clic. La classe se pose donc à la main, comme le fait déjà la
 * sélection d'édition.
 */
export function marqueStandsDessines(){
  $("couches").querySelectorAll(".dcal .sdes").forEach(g => {
    g.classList.toggle("sel", g.dataset.id === state.sel &&
                              Number(g.dataset.soc) === state.selSoc);
  });
}

/**
 * Ce qu'un stand dessiné reçoit une fois tracé : la teinte de son secteur, le
 * fondu que le filtre pose sur ce qu'il écarte, et son libellé.
 *
 * Rien de tout cela ne tient dans le gabarit de la forme : les deux premiers
 * se lisent dans les réglages du salon, le troisième dans la vue courante — et
 * le premier montage a lieu avant qu'il y en ait une.
 */
function rafraichitStandsDessines(){
  const view = vue();
  if (!DATA || !view) return;
  coloreSecteurs();
  $("couches").querySelectorAll(".dcal .sdes[data-id]").forEach(g => {
    const o = parId.get(g.dataset.id);
    g.classList.toggle("dim", !!o && !visibleSociete(o, Number(g.dataset.soc)));
  });
  const r = cadrePlan();
  poseLibellesDessines((r.width || 1) / view.w);
}

/* Un bref halo, réservé à l'image posée automatiquement : sans lui on la
   cherche, et on croit qu'il reste un bouton à valider. */
export function signale(id){
  const g = $("couches").querySelector('.forme[data-f="' + CSS.escape(id) + '"]');
  if (!g || REDUIT) return;
  g.classList.add("neuve");
  setTimeout(() => g.classList.remove("neuve"), 1300);
}
