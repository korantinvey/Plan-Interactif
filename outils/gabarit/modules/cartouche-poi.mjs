/* ============================================================
   Les points d'intérêt sur le plan — le cartouche, la mise en avant, le
   relevé

   Les repères que l'exploitant a posés sont ce qu'un visiteur cherche sans
   connaître de nom : le vestiaire, le parking, les toilettes. Le cartouche
   du bas les récapitule et met en avant une famille d'un geste ; la
   recherche les retrouve à la frappe, d'après le relevé tenu ici.

   Le dessin des calques et les noms du plan lisent ce qui est mis en avant
   (`phareRepere`, `phareZone`) : ce module ne dépend donc d'aucun écran, et
   ne connaît pas la fiche d'un repère, qui vit dans `points-interet.mjs`.
   Il vivait avec elle, et le dessin, en l'important, atteignait la fiche —
   qui ne pouvait plus l'importer en retour.
   ============================================================ */
import { $ } from "./dom.mjs";
import { DATA, parId, P } from "./donnees.mjs";
import { conf } from "./configuration.mjs";
import { fit } from "./vue.mjs";
import { nomRepere } from "./itineraire.mjs";
import { DESSINS, mesCalques } from "./calques-dessin.mjs";
import { PICTOS, nomTypeRepere, typeZone, pictoForme, glypheRepere, pastillePoi } from "./reperes.mjs";
import { majFondus } from "./bandes.mjs";
import { formeParId } from "./forme-choisie.mjs";

/**
 * Les repères, en objets de recherche.
 *
 * Un visiteur qui tape « vestiaire » ou « parking » cherche un endroit du
 * salon, exactement comme il tape le nom d'une enseigne. Le cartouche du bas
 * les récapitule déjà, mais il faut savoir qu'il existe et le parcourir des
 * yeux : la recherche y mène en trois lettres.
 *
 * Ils sont relevés sur les trois pavillons, comme les stands : le sanitaire
 * le plus proche n'est pas forcément dans celui qu'on regarde. Un calque
 * éteint n'en donne aucun — ses repères ne sont pas sur le plan, et la liste
 * promettrait un escalier que le visiteur ne trouverait pas.
 *
 * Le relevé se retient : la recherche le redemande à chaque frappe, et les
 * dessins ne changent qu'entre deux gestes d'édition. « oublieReperes » le
 * jette, aux mêmes endroits que les grilles d'itinéraire.
 */
let REPERES = null;

export function oublieReperes(){ REPERES = null; }

export function reperesCherchables(){
  if (REPERES) return REPERES;
  REPERES = [];
  (DATA?.plans || []).forEach((p, i) => {
    (DESSINS[p.id] || []).forEach(cal => {
      if (cal.visible === false) return;
      (cal.formes || []).forEach(f => {
        if (f.t !== "repere") return;
        const nom = nomRepere(f);
        /* Le type ne compte que s'il ajoute quelque chose au libellé, et il
           compte alors pour les deux : ce qu'on tape et ce que la ligne
           montre. « Hall Sud » gagne à s'annoncer comme une entrée ; un repère
           sans libellé s'appelle déjà « WC » et n'a rien à gagner d'un « WC »
           en dessous, ni d'un second dans sa chaîne de recherche. Une chaîne
           vide, elle, est un choix — « sans pictogramme » — et ne nomme rien
           qu'on irait taper. */
        const picto = pictoForme(f);
        const type = picto ? nomTypeRepere(picto) : "";
        const ajout = type === nom ? "" : type;
        REPERES.push({
          kind: "poi", id: f.id, p: i, nom: nom, type: ajout,
          rech: (nom + " " + ajout).toLowerCase(),
        });
      });
    });
  });
  return REPERES;
}

/**
 * Cartouche des points d'intérêt.
 *
 * Les repères posés sur un plan se répètent — plusieurs sanitaires, plusieurs
 * entrées — et se cherchent à l'œil. Le cartouche les récapitule ; en choisir
 * un met en avant tous ceux qui lui ressemblent, où qu'ils soient.
 *
 * Une pastille tient au couple libellé + type, et non au seul libellé. Un
 * hall nomme volontiers « Entrée » les deux portes qu'il a, puis dit de l'une
 * qu'elle est une sortie : sous le seul libellé, les deux ne faisaient qu'une
 * pastille — le visiteur qui demandait l'entrée se voyait montrer la porte par
 * où l'on ne rentre pas. Deux pastilles sous le même libellé ajoutent alors ce
 * qui les sépare, sauf à celle que son libellé dit déjà.
 *
 * Les zones organisateur auxquelles l'exploitant a donné un type y entrent de
 * la même façon, et sous la même clé : ce qui s'appelle « Restauration » d'un
 * côté et de l'autre est la même chose pour qui cherche à déjeuner, et deux
 * pastilles identiques n'auraient rien appris. Ce que l'une a été dessinée et
 * l'autre fournie par le salon ne regarde pas le visiteur.
 *
 * Les transports font exception, et tous ensemble. Un hall en dessert trois,
 * parfois six : autant de pastilles — « Métro 12 », « Tram T2 », « Tram T3a »
 * — qui poussaient hors de l'écran ce que le cartouche avait d'autre à dire,
 * pour une question que le visiteur ne pose pas ainsi. Il cherche par où
 * repartir, pas la ligne 12 ; la ligne, il la lit sur le plan, où chaque arrêt
 * garde son symbole et sa couleur. Une seule nature les récapitule donc, sous
 * le pictogramme générique, et son compte dit combien d'arrêts elle couvre.
 */
let poiChoisi = null;

/* Un libellé qui ne porte qu'un seul type : ce que rejoint alors ce qu'on a
   laissé sans pictogramme, pour que la zone « Restauration » et le repère qui
   la nomme ne fassent pas deux pastilles, dont une muette. Rempli par
   « cartouchePoi », relu par la clé et par la mise en avant. */
let PICTO_SEUL = new Map();

/** Ce qui fait une pastille : ce que la chose s'appelle, et ce qu'elle est. */
const clePoi = (nom, picto) => nom + "\u0000" + (picto || PICTO_SEUL.get(nom) || "");

export function cartouchePoi(){
  const z = $("poi");
  if (!z) return;
  /* Les pastilles vivent dans la bande, pas dans le cadre : celui-ci porte les
     flèches, qu'un « innerHTML » remis à blanc emporterait avec elles. */
  const d = $("poiDefile");
  const tout = [];

  for (const cal of mesCalques()){
    if (cal.visible === false) continue;
    for (const f of cal.formes){
      if (f.t !== "repere" || !f.txt) continue;
      /* Le pictogramme est celui du mode pour un arrêt ; « pastillePoi » le
         ramène ensuite, avec le libellé de la ligne, à la nature commune des
         transports. La clé la suit, et la mise en avant avec elle. */
      tout.push(pastillePoi(f.txt.trim(), glypheRepere(f) || ""));
    }
  }
  /* Une zone que l'exploitant a éteinte, ou tout un calque de zones retiré du
     plan, ne comptent pas : le cartouche promettrait une restauration que le
     visiteur ne trouverait nulle part. */
  if (conf("data:zones").visible !== false){
    for (const zo of P().zones){
      const t = typeZone(zo);
      if (t && !zo.masquee) tout.push(pastillePoi(t.nom, t.picto || ""));
    }
  }

  const types = new Map();
  tout.forEach(o => {
    if (!o.picto) return;
    if (!types.has(o.nom)) types.set(o.nom, new Set());
    types.get(o.nom).add(o.picto);
  });
  PICTO_SEUL = new Map();
  types.forEach((t, nom) => { if (t.size === 1) PICTO_SEUL.set(nom, [...t][0]); });

  const parCle = new Map();
  tout.forEach(o => {
    const cle = clePoi(o.nom, o.picto);
    const picto = o.picto || PICTO_SEUL.get(o.nom) || null;
    if (!parCle.has(cle)) parCle.set(cle, { nom: o.nom, picto: picto, n: 0 });
    parCle.get(cle).n++;
  });

  /* Ce qu'une pastille annonce : son libellé, et ce qu'elle est quand une
     voisine porte le même libellé sans être la même chose. */
  const homonymes = new Map();
  parCle.forEach(o => homonymes.set(o.nom, (homonymes.get(o.nom) || 0) + 1));
  const libellePoi = (o) => {
    const type = o.picto ? nomTypeRepere(o.picto) : "";
    return homonymes.get(o.nom) > 1 && type && type !== o.nom
      ? o.nom + " · " + type : o.nom;
  };

  z.hidden = parCle.size === 0;
  /* Le pavillon d'à côté n'a pas les mêmes points d'intérêt : ce qui n'y est
     plus ne peut pas rester choisi, sans quoi le plan resterait en retrait
     sans que rien n'y soit mis en avant. */
  if (poiChoisi && !parCle.has(poiChoisi)) poiChoisi = null;
  if (z.hidden){ poiChoisi = null; eclairePoi(); mesureCartouche(); majFondus(); return; }

  /* Choisir une pastille reconstruit le cartouche, et un contenu remplacé
     revient au début : la pastille qu'on venait d'aller chercher du doigt
     sortait de l'écran au moment où on la retenait, et le geste était à
     refaire. On repose donc le défilement là où il était. */
  const defile = d.scrollLeft;
  d.innerHTML = "";
  [...parCle.entries()]
    .sort((a, b) => libellePoi(a[1]).localeCompare(libellePoi(b[1]), "fr"))
    .forEach(([cle, o]) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "poiBtn";
      b.setAttribute("aria-pressed", String(cle === poiChoisi));
      const g = PICTOS[o.picto];
      // largeur et hauteur en attributs : un <svg> sans dimension explicite
      // s'étale à la place disponible, et le cartouche y perdait sa mise en page
      b.innerHTML = (g
        ? '<svg class="poiPicto" width="17" height="17" viewBox="' + g.vb +
          '" aria-hidden="true">' + g.d + '</svg>'
        : "") + '<span></span>' + (o.n > 1 ? '<i>' + o.n + '</i>' : "");
      b.querySelector("span").textContent = libellePoi(o);
      b.onclick = () => {
        const choisit = poiChoisi !== cle;
        poiChoisi = choisit ? cle : null;
        /* Les repères d'un même type sont dispersés dans le hall. Les mettre
           en avant sans reculer ne montrerait que ceux déjà à l'écran, et
           l'exploitant conclurait qu'il n'y en a pas d'autres. On revient donc
           sur le plan entier, où ils se comptent d'un coup d'œil. */
        if (choisit) fit();
        cartouchePoi();
      };
      d.appendChild(b);
    });
  d.scrollLeft = defile;
  eclairePoi();
  mesureCartouche();
  /* Le bord à estomper se relit ici : une famille de repères en plus ou en
     moins, et ce qui dépassait tient — ou l'inverse. */
  majFondus();
}

/**
 * Hauteur du cartouche, donnée au CSS.
 *
 * Sur un écran étroit le cartouche est assez large pour recouvrir l'échelle,
 * qui vit dans le même coin bas. Le commentaire de la feuille de style
 * affirmait qu'il « se retire de l'échelle » : c'était vrai sur un grand
 * écran, où il n'atteignait pas la marge gauche. À 412 pixels il la traverse.
 * L'échelle se pose donc au-dessus de lui, d'après sa hauteur réelle — nulle
 * quand il est absent, auquel cas rien ne bouge.
 */
function mesureCartouche(){
  const z = $("poi");
  const h = z && !z.hidden ? z.offsetHeight + 8 : 0;
  /* Sur le corps, et non sur la racine : le rendu WebGL guette les attributs
     de la racine pour savoir quand une couleur ou un calque change, et il y
     repeignait tout le plan pour une hauteur d'habillage qui ne le concerne
     pas. Ceux qui lisent cette variable — l'échelle, la barre de zoom — sont
     tous dans le corps, la feuille de style y trouve donc son compte. */
  const px = h + "px";
  if (document.body.style.getPropertyValue("--cartouche") !== px)
    document.body.style.setProperty("--cartouche", px);
}

/** Ce qu'un point d'intérêt choisi met en avant : repères et zones à la fois,
 *  sur la clé qui a fait la pastille — le libellé seul aurait rallumé la
 *  sortie avec l'entrée qui porte son nom. */
const pharePoi = (nom, picto) => {
  const o = pastillePoi(nom, picto);
  return clePoi(o.nom, o.picto) === poiChoisi;
};
export const phareRepere = (f) => Boolean(poiChoisi && f && f.txt &&
  pharePoi(String(f.txt).trim(), glypheRepere(f) || ""));
export const phareZone = (o) => {
  const t = poiChoisi && o && o.kind === "zone" ? typeZone(o) : null;
  return Boolean(t && pharePoi(t.nom, t.picto || ""));
};

/** Met en avant les repères et les zones du point d'intérêt choisi. */
function eclairePoi(){
  $("couches").querySelectorAll(".dcal .repere").forEach(g => {
    const f = formeParId(g.dataset.f);
    g.classList.toggle("phare", phareRepere(f && f.f));
  });
  $("zones").querySelectorAll("g").forEach(g =>
    g.classList.toggle("phare", phareZone(parId.get(g.dataset.id))));
  /* Le libellé d'une zone mise en avant est ce qui la nomme : le laisser en
     retrait avec le reste du plan aurait effacé la seule chose qui distingue
     deux restaurations. Il se réécrit à chaque déplacement de la vue, et
     reprend donc sa marque dans « libelles() ». Les témoins de style du rendu
     WebGL, qui ne nomment rien, gardent la leur. */
  $("labels").querySelectorAll(".lbl[data-lbl]").forEach(g =>
    g.classList.toggle("phare", phareZone(parId.get(g.dataset.lbl))));
  document.documentElement.classList.toggle("poi-actif", !!poiChoisi);
}

/**
 * Le retrait ne survit pas au geste qui l'ignore.
 *
 * Le cartouche met une famille de repères en avant et recule tout le reste à
 * seize pour cent. Ce retrait est une réponse à une question posée — « où
 * mange-t-on ? » — et il n'a plus rien à dire dès que le visiteur en pose une
 * autre. Or rien sur le plan ne le levait : ouvrir la fiche d'un stand éteint,
 * ou taper le fond pour refermer, laissaient le plan délavé et la pastille
 * allumée. Il fallait retrouver celle-ci dans le cartouche et la rappuyer, ce
 * que personne ne devine.
 *
 * Un repère ou une zone déjà mis en avant font exception : les ouvrir, c'est
 * se servir de la mise en avant, pas en sortir. On reconnaît les uns et les
 * autres à la marque qu'« eclairePoi » leur a posée — la même qui les tient
 * en pleine lumière.
 */
export function oublieChoixPoi(cible){
  if (!poiChoisi) return;
  if (cible && cible.classList.contains("phare")) return;
  poiChoisi = null;
  cartouchePoi();
}
