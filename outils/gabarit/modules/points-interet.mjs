/* ============================================================
   Les points d'intérêt — le cartouche, la recherche, la fiche d'un repère

   Les repères que l'exploitant a posés sont ce qu'un visiteur cherche sans
   connaître de nom : le vestiaire, le parking, les toilettes. Le cartouche
   du bas les récapitule et met en avant une famille d'un geste, la recherche
   les retrouve à la frappe, et toucher l'un d'eux ouvre sa fiche. Le visiteur
   reçoit tout : `plan.mjs` embarque ce module.

   Rien ne lui est confié : la forme d'un identifiant
   (`forme-choisie.mjs` `formeParId`), le passage à un autre pavillon
   (`rendu.mjs` `changePlan`), les distinctions de la fiche
   (`distinctions.mjs` `poseDistsFiche`), ce que la fiche des stands prête à
   celle d'un repère (`fiche.mjs`) et le bord estompé du cartouche
   (`bandes.mjs`) s'importent ; la recherche, qui relit les repères et que
   ce module importe, les reçoit de lui en se chargeant
   (`confieALaRecherche`). Les libellés, qui marquent la zone
   mise en avant, reçoivent `phareZone` par la porte que ce module ouvre en
   se chargeant (`confieAuxLibelles`).
   ============================================================ */
import { $ } from "./dom.mjs";
import { esc } from "./texte.mjs";
import { DATA, parId, P } from "./donnees.mjs";
import { conf } from "./configuration.mjs";
import { fit, rectVisee } from "./vue.mjs";
import { ecritMinutes } from "./temps.mjs";
import { nomRepere, typeLiaison, liensDe, pointRepere } from "./itineraire.mjs";
import { fermeParcours } from "./tiroir-parcours.mjs";
import { fermeItineraire, versItineraireDe } from "./tiroir-itineraire.mjs";
import { DESSINS, mesCalques } from "./calques-dessin.mjs";
import { PICTOS, nomTypeRepere, typeZone, pictoForme, glypheRepere, pastillePoi } from "./reperes.mjs";
import { poseCode, poseMarque, onglet, brancheActesFiche, centrePoint, ecarteClicFantome, anime } from "./fiche.mjs";
import { majFondus } from "./bandes.mjs";
import { changePlan } from "./rendu.mjs";
import { poseDistsFiche } from "./distinctions.mjs";
import { formeParId } from "./forme-choisie.mjs";
import { confieALaRecherche } from "./recherche.mjs";
import { confieAuxLibelles } from "./libelles.mjs";

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
 * Un repère ouvert depuis la liste des résultats.
 *
 * Il peut vivre dans un autre pavillon que celui qu'on regarde — la recherche
 * les balaie tous les trois — et sa fiche se lit sur le plan où il est posé.
 * On y passe par « changePlan », qui est le chemin des onglets : il remonte le
 * plan et va chercher le fond du pavillon qu'on n'avait pas encore ouvert. Le
 * montage recrée les calques de dessin, d'où la pastille est relue après lui —
 * pour que la fiche s'anime depuis elle, et non depuis rien.
 *
 * Le dernier argument demande que le plan vienne sur le repère ; la fiche s'en
 * charge une fois posée. Sans lui elle s'ouvrait sur un escalier que rien ne
 * montrait, et il restait à trouver le bouton « Centrer sur le plan » pour voir
 * où il est — le clic dans la liste disait pourtant déjà qu'on y allait.
 */
export function vaAuRepere(id, p){
  changePlan(p);
  ouvrePoi(id, $("couches").querySelector('.repere[data-poi="' + CSS.escape(id) + '"]'),
           true);
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
 * La fiche d'un repère.
 *
 * Le plan ne montre plus que le pictogramme ; le nom n'est pas perdu pour
 * autant, il est ce que le clic donne — comme une forme de stand donne la
 * fiche de son exposant. On y lit ce que le repère est, comment il s'appelle,
 * et, quand c'est un passage, ce qu'il dessert : un escalier qui monte à deux
 * étages le dit ici, et nulle part ailleurs.
 *
 * La fiche est celle des stands, remplie autrement : elle partage la même
 * bande que le parcours et l'itinéraire, et deux fiches ouvertes en même
 * temps ne se liraient pas. Elle en reprend donc le contrat : « depuis » est
 * la pastille d'où la fiche s'étire — le nœud, mesuré à la fin — et
 * « recentrer » demande que le plan vienne sur le repère, ce qui n'a de sens
 * qu'une fois la fiche posée, seule à savoir ce qu'elle masque.
 */
export function ouvrePoi(id, depuis, recentrer){
  const cible = formeParId(id);
  if (!cible || cible.f.t !== "repere") return;
  const f = cible.f, p = P();
  fermeParcours(); fermeItineraire();

  document.querySelectorAll(".sel").forEach(n => n.classList.remove("sel"));
  const noeudPoi = $("couches").querySelector('.repere[data-poi="' + CSS.escape(id) + '"]');
  if (noeudPoi) noeudPoi.classList.add("sel");

  const type = pictoForme(f);
  const dit = String(f.txt || "").trim();
  $("dKind").hidden = false;
  $("dKind").textContent = type ? nomTypeRepere(type) : "Repère";
  $("dName").textContent = dit || (type ? nomTypeRepere(type) : "Repère");
  /* Ni numéro ni filigrane : un repère n'en a pas, et sans cette remise à zéro
     la fiche portait celui du stand consulté juste avant. */
  poseCode(p, "", "");
  /* Un repère porte un picto, jamais un logo : sans cet effacement, la fiche
     d'un escalier gardait la marque du stand consulté juste avant. */
  poseMarque("");
  /* Un repère n'est pas un exposant : ni nouveau venu ni adhérent. */
  poseDistsFiche(null);
  $("dPartage").hidden = true;
  /* « Affiché : oui/non » gouverne une zone organisateur, pas un repère. Restée
     visible, elle basculait encore la visibilité de la zone d'avant. */
  if ($("dVis")) $("dVis").hidden = true;
  /* Un repère ne se retient pas dans un parcours : on ne visite pas un
     escalier, on le prend. */
  const sig = $("dMarque");
  sig.hidden = true;
  delete sig.dataset.mg; delete sig.dataset.mi;
  if ($("dRen")) $("dRen").hidden = true;
  $("dOnglets").hidden = true;
  $("detail").classList.remove("deux");
  onglet("detail");

  /* Ce qu'un passage dessert, avec le temps qu'il demande : c'est ce qui
     distingue deux escaliers voisins, et ce qu'un visiteur cherche à savoir
     avant de s'y engager. */
  const liens = typeLiaison(f) ? liensDe(f) : [];
  const dessert = liens.length
    ? '<div class="field"><span class="eyebrow">Mène à</span><span class="v">' +
      liens.map(x => '<span class="ligne">' +
        esc(x.o.p.libelle + " · " + nomRepere(x.o.f)) + " — " +
        esc(ecritMinutes(x.min == null ? typeLiaison(f).min : x.min)) +
        '</span>').join("") + "</span></div>"
    : "";

  $("dBody").innerHTML = '<div class="cInfos" id="dPaneInfos">' + dessert + "</div>" +
    '<div class="acts"><button class="btn" id="dGo">Centrer sur le plan</button>' +
    '<button class="btn itin" id="dItin">Itinéraire</button></div>';
  // « j'y vais » : l'arrivée est ce repère, le départ reste à dire
  brancheActesFiche(() => centrePoint(f.pts[0]),
                    () => versItineraireDe(pointRepere(f, p)));

  $("detail").classList.add("open");
  $("voile").classList.add("on");
  ecarteClicFantome();
  if (recentrer) centrePoint(f.pts[0]);
  anime(() => rectVisee(depuis), 1);
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

/* La recherche, que ce module importe, ne peut l'importer en retour : il lui
   confie en se chargeant ce qu'elle en appelle (les repères qu'elle remonte parmi les exposants, et le chemin vers l'un d'eux). */
confieALaRecherche({ reperesCherchables, vaAuRepere });

/* La mise en avant d'une zone, confiée aux libellés dès que ce module se
   charge : ils la marquent sur le nom de la zone, et ne peuvent importer ce
   module, qui les atteint par la fiche. */
confieAuxLibelles({ phareZone });
