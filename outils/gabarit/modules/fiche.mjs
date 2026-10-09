/* ============================================================
   La sélection et la fiche d'un exposant

   Choisir un objet du plan — depuis le plan, la liste, la recherche, un
   parcours, un lien reçu —, ouvrir sa fiche et la refermer : l'en-tête et sa
   marque, la pastille de situation, le corps rangé, les onglets du programme
   et des produits, les fiches d'une conférence et d'un produit, et le
   cadrage du plan sur ce qu'on lit. Ce que la fiche montre, et dans quel
   ordre, vient de `corps-fiche.mjs`.

   Il se branche dans `_fiche.html`, à la place que son code tenait : les
   écoutes de la fiche s'y posent au même rang qu'avant parmi celles du plan,
   et ce que le code soudé tient encore lui est confié — le montage du plan,
   les découpages dessinés, les tiroirs et le parcours, et, en administration
   seulement, les deux gestes de l'exploitant sur une zone. La liste, les
   thématiques et les vignettes s'importent de `recherche.mjs` ; le tiroir du
   parcours, qui importe la fiche, lui est confié.

   Le dernier appui — tactile ou non — est écrit par les gestes, restés
   soudés : il vit ici, se remplace par `poseAppuiTactile`, et le code soudé
   le lit par accesseur.
   ============================================================ */
import { $ } from "./dom.mjs";
import { esc, separeValeurs } from "./texte.mjs";
import { DATA, parId, CONFS, EXPOSANTS, state, P } from "./donnees.mjs";
import { API } from "./salon.mjs";
import { ouvreModale, fermeModale } from "./fenetre.mjs";
import { lien, adresseWeb, adresseImage, imageSure, assainitRiche } from "./sur.mjs";
import { JOURS, MOIS, momentLocal, jourLong } from "./temps.mjs";
import { mesure } from "./mesure.mjs";
import { recadreMarque } from "./marque.mjs";
import { signetParcours, boutonParcours, dessineMarques } from "./parcours.mjs";
import { GL, rectEcranWebgl } from "./webgl.mjs";
import { ADMIN } from "./mode-admin.mjs";
import { svg, vue, vise, cadrePlan, masqueHaut, masque, masqueDroite, fit, glisseVers, rectVisee }
  from "./vue.mjs";
import { fermeItineraire, versItineraire } from "./tiroir-itineraire.mjs";
import { REDUIT, ETROIT } from "./ecran.mjs";
import { montre, LIBELLE_CORPS, ordreCorps, champCorps, corpsRange, pictoRS } from "./corps-fiche.mjs";
import { PREFIXE_PERSO, liste, marqueChoisie, filtreTheme, themeFiltrable, VIGNETTES } from "./recherche.mjs";
import { libelles, coexChoisit } from "./libelles.mjs";

/* Ce que le code soudé confie, et rien avant qu'il l'ait fait. Ce qui est
   déclaré plus bas dans le script — les gestes, le dessin, le parcours — l'est
   par un détour, lu au moment de l'appel. */
/** @type {Record<string, any>} */
let soude = {};
const decoupeStand = (/** @type {any} */ id, /** @type {any} */ iSoc) => soude.decoupeStand(id, iSoc);
const formeParId = (/** @type {any} */ id) => soude.formeParId(id);
const montePlan = () => soude.montePlan();
const marqueStandsDessines = () => soude.marqueStandsDessines();
const typeZone = (/** @type {any} */ z) => soude.typeZone(z);
const nomDeLaZone = (/** @type {any} */ z) => soude.nomDeLaZone(z);
const poseDistsFiche = (/** @type {any} */ soc) => soude.poseDistsFiche(soc);
const fermeParcours = () => soude.fermeParcours();
const brancheParcours = (/** @type {any} */ hote, /** @type {any} */ canal) => soude.brancheParcours(hote, canal);
/** Les tiroirs qu'un geste sait baisser, tenus par `_gestes.html`. */
const baisseTiroir = () => soude.baisseTiroir();

/* ============================================================
   7. Sélection et fiche
   ============================================================ */
let anim = null;

/**
 * L'étirement de la fiche depuis la forme qu'on a choisie.
 *
 * `mesure` est une fonction, et non le rectangle qu'elle rend : la mesure
 * coûte, et l'étirement n'a pas toujours lieu. Sur un téléphone la fiche glisse
 * depuis le bas — une mise à l'échelle depuis la forme cliquée se battrait avec
 * ce glissement, et la transition CSS suffit ; on n'y mesurait donc rien, mais
 * on le mesurait quand même, à l'appel. C'était les trois quarts du temps
 * d'ouverture d'une fiche : soixante millisecondes sur un salon de mille
 * stands, parce que lire la boîte d'une forme oblige le navigateur à remettre
 * en page le plan entier — que les libellés, réécrits juste avant, viennent de
 * salir. La fiche s'ouvrait avec un temps de retard, sur l'écran même où elle
 * n'en avait aucun usage.
 */
export function anime(mesure, sens){
  const p = $("detail");
  if (anim){ anim.cancel(); anim = null; }
  if (REDUIT || ETROIT()){ if (sens < 0) p.classList.remove("open"); return; }
  const rect = mesure();
  if (!rect){ if (sens < 0) p.classList.remove("open"); return; }
  const b = p.getBoundingClientRect();
  p.style.transformOrigin = (rect.left + rect.width / 2 - b.left) + "px " +
                            (rect.top + rect.height / 2 - b.top) + "px";
  const seed = { transform: "scale(" + Math.max(.05, rect.width / b.width) + "," +
                            Math.max(.03, rect.height / b.height) + ")", opacity: 0 };
  const plein = { transform: "none", opacity: 1 };
  anim = p.animate(sens > 0 ? [seed, plein] : [plein, seed],
    { duration: sens > 0 ? 340 : 200,
      easing: sens > 0 ? "cubic-bezier(.16,.84,.3,1)" : "cubic-bezier(.4,0,.75,.2)" });
  if (sens < 0) anim.finished.then(() => p.classList.remove("open"), () => {});
}
/* La forme de l'emplacement, et non ce qu'un calque a posé dessus : un logo
   ou un stand dessiné porte le même identifiant, et c'est bien le stand qu'on
   veut allumer, cadrer et animer.

   Sauf quand un découpage matérialise justement la société choisie : lui et
   son hôte portent alors le même identifiant, et allumer les deux donnerait à
   voir un grand stand allumé pour désigner le petit qui est dedans. */
function noeud(id, iSoc){
  const d = decoupeStand(id, iSoc);
  if (d) return d;
  const q = '[data-id="' + CSS.escape(id) + '"]';
  return svg.querySelector("#zones " + q + ", #stands " + q) || svg.querySelector(q);
}

/* Trois façons d'atteindre un stand depuis le plan : sa forme, le logo que
   l'exploitant a posé dessus, ou le découpage qu'il y a dessiné. Le logo seul
   fait un chemin à part — les deux autres sont le plan tel qu'on le voit. */
export function canalPlan(cible){
  if (!cible || !cible.dataset.f) return "plan";
  const c = formeParId(cible.dataset.f);
  return c && c.f.t === "image" ? "image" : "plan";
}

/** Le rang de la société désignée par un nœud du plan, s'il en désigne une :
 *  un stand dessiné nomme la sienne, une forme d'emplacement ne le fait pas. */
export const rangSociete = (el) =>
  el && el.dataset.soc !== undefined ? Number(el.dataset.soc) : undefined;

/**
 * `iSoc` désigne la société qu'on vient voir sur un stand partagé. Absent, la
 * fiche demandera laquelle : c'est le cas d'un clic sur le plan, où l'on a
 * désigné une forme et non un nom. La liste, elle, le passe — elle vient de
 * nommer celle qu'on a choisie.
 */
export function select(id, recentrer, canal, iSoc){
  const o = parId.get(id);
  if (!o) return;
  /* Changer de pavillon change la liste elle-même — son sommaire est celui du
     pavillon ouvert, et les lignes d'ailleurs portent une pastille de hall :
     elle se refait alors, quand une simple sélection se contente de déplacer
     sa marque. */
  const ailleurs = o.p !== state.plan;
  if (ailleurs){
    state.plan = o.p; montePlan(); fit();
  }
  document.querySelectorAll(".sel").forEach(n => n.classList.remove("sel"));
  state.sel = id;
  state.selSoc = iSoc === undefined ? -1 : iSoc;
  const n = noeud(id, state.selSoc); if (n) n.classList.add("sel");
  dessineMarques();
  marqueStandsDessines();
  if (ailleurs) liste(); else marqueChoisie();
  libelles();
  /* Le cadrage est passé dans « ouvre » plutôt que de l'encadrer ici : il
     demandait deux ordres — après la fiche sur un téléphone, avant elle sur un
     grand écran — et l'un des deux cadrait toujours sur une géométrie qu'il ne
     connaissait pas encore. */
  ouvre(o, n, canal, iSoc, recentrer);
}
export const centre = (o) => centrePoint(o.c);

/* Les deux actions d'une fiche vivent à deux endroits : les boutons du pied,
   que le grand écran montre sans qu'on déroule, et les pictos de l'en-tête,
   que l'écran étroit met à leur place. Un seul branchement pour les deux —
   posé deux fois, l'un des deux jeux serait resté sur la fiche d'avant. La
   fiche d'un stand et celle d'un repère y passent toutes deux.
 *
 * @param go   cadrer le plan sur ce que la fiche décrit
 * @param itin partir d'ici vers l'itinéraire
 */
export function brancheActesFiche(go, itin){
  const sur = (id, f) => { const b = $(id); if (b) b.onclick = f; };
  const cadre = () => centreEtBaisseLaFiche(go);
  sur("dGo", cadre); sur("dGoIco", cadre);
  sur("dItin", itin); sur("dItinIco", itin);
}

/**
 * Cadre le plan depuis la fiche, après l'avoir fait descendre.
 *
 * Sur un téléphone la fiche occupe plus de la moitié de l'écran : centrer sans
 * la baisser posait le stand visé derrière elle, et le geste avait l'air de ne
 * rien faire. Elle descend donc à son cran le plus bas, et le cadrage attend
 * qu'elle y soit — il mesure ce qu'elle cache du plan, et le mesurerait encore
 * à sa hauteur d'avant.
 */
function centreEtBaisseLaFiche(cadre){
  const fiche = $("detail");
  const baisse = baisseTiroir().detail;
  if (!fiche || !baisse || !baisse()){ cadre(); return; }
  let fait = false;
  const fini = () => { if (fait) return; fait = true; cadre(); };
  fiche.addEventListener("transitionend", function fin(e){
    if (e.target !== fiche || e.propertyName !== "max-height") return;
    fiche.removeEventListener("transitionend", fin);
    fini();
  });
  /* Un tiroir qui ne transitionne pas — mouvement réduit par le système,
     onglet en arrière-plan — n'enverrait jamais l'événement. */
  setTimeout(fini, 350);
}

/* Un repère n'est pas un objet du plan et n'a pas de centre à lui : il n'a
   qu'un point. C'est tout ce qu'il faut pour cadrer. */
export function centrePoint(xy){
  /* Le trajet part de la vue qu'on vise quand il y en a une : un centrage
     demandé pendant qu'un cran de molette finit de glisser s'enchaîne sur son
     arrivée, et non sur le point de passage où il l'a trouvé. */
  const base = vise || vue();
  const w = Math.min(base.w, 55), h = w * (base.h / base.w);
  /* Centrer au milieu du cadre placerait la cible derrière le tiroir ou la
     fiche. On la pose au milieu de ce qui reste visible — d'après ce qui est
     réellement masqué, et non une proportion supposée.

     Les deux côtés comptent, et c'est ce qui manquait : la hauteur du tiroir
     en bas sur un téléphone, la largeur de la fiche à droite sur un grand
     écran. Faute du second, un cadre de mille pixels posait le stand à six
     cent soixante-cinq — c'est-à-dire pile sous la fiche, qui commence à six
     cent soixante. On arrivait sur ce qu'on venait voir, et il était caché.
     Ces deux mesures ne valent qu'une fois la fiche posée : c'est « ouvre »
     qui appelle le cadrage, et non l'inverse. */
  const r = cadrePlan();
  const decale = r.height ? (h * (masque() - masqueHaut())) / (2 * r.height) : 0;
  const decaleX = r.width ? (w * masqueDroite()) / (2 * r.width) : 0;
  /* On y va en glissant plutôt que d'un bond. Le plan sautait à l'autre bout
     du hall sans rien montrer du chemin : on y arrivait sans savoir d'où, et
     il fallait retrouver dans quel coin du salon on venait d'être posé. Le
     trajet le dit de lui-même, et le zoom qu'il resserre au passage montre le
     point s'approcher. L'ajustement au pavillon reste un bond, lui : il n'y a
     pas de chemin à montrer entre deux plans, qui ne partagent aucun repère. */
  glisseVers({ x: xy[0] - w / 2 + decaleX, y: xy[1] - h / 2 + decale, w: w, h: h });
}
/** Le programme d'une zone, ou celui d'un exposant : la même liste, rendue. */
function programme(l, titre){
  l = l || [];
  if (!l.length) return "";
  /* La classe nomme le bloc du programme : deux modèles de fiche le traitent
     à part — l'un le déroule en ligne de temps, l'autre lui laisse son libellé
     quand il efface tous les autres. */
  let out = '<div class="field prog-bloc"><span class="eyebrow">' + esc(titre || "Programme") +
    '</span><div class="prog">';
  let jourCourant = null;
  for (const c of l){
    const fz = DATA.fuseau;
    const d = momentLocal(c.debutLocal, fz) || momentLocal(c.debut, fz);
    const f = momentLocal(c.finLocal, fz) || momentLocal(c.fin, fz);
    if (d && d.cle !== jourCourant){
      jourCourant = d.cle;
      const dt = new Date(d.an, d.mois - 1, d.jour);
      out += '<div class="jour">' + esc(JOURS[dt.getDay()] + " " + d.jour + " " + MOIS[d.mois - 1]) + '</div>';
    }
    const heure = d ? d.h + "h" + d.min + (f ? " – " + f.h + "h" + f.min : "") : "";
    /* Le signet se pose à côté de la vignette et non dedans : un bouton n'en
       contient pas un autre, et l'appui doit choisir entre lire et retenir. */
    out += '<div class="confRang">' +
      '<button type="button" class="conf" data-conf="' + esc(c.id) + '"' +
      (c.couleur ? ' style="--tc:' + esc(c.couleur) + '"' : "") + '>' +
      (heure ? '<span class="h">' + esc(heure) + '</span>' : "") +
      '<span class="t">' + esc(c.nom) + '</span>' +
      (c.type ? '<span class="ty">' + esc(c.type) + '</span>' : "") +
      '</button>' + signetParcours("conf", c.id) + '</div>';
  }
  return out + '</div></div>';
}

/* Les produits de la fiche ouverte, dans l'ordre où elle les montre.

   Ils vivent sur la société et non dans un index global, à la différence des
   conférences : une conférence se cherche depuis le programme d'une salle ou
   depuis un parcours retenu, un produit ne s'atteint que par la fiche qui le
   porte. Le rang suffit donc à le désigner, et il ne vaut que le temps où
   cette fiche est ouverte. */
let produitsOuverts = [];

/**
 * Le catalogue d'un exposant : ce qu'il présente sur son stand.
 *
 * La liste ne montre que la vignette et le nom — un exposant en porte quatre à
 * la médiane et jusqu'à quarante-quatre, et une présentation de dix lignes
 * chacune ferait de la fiche un catalogue à faire défiler. Le reste tient dans
 * la fenêtre qu'un appui ouvre, comme pour une conférence.
 */
function produits(l, titre){
  l = l || [];
  if (!l.length) return "";
  let out = '<div class="field prod-bloc"><span class="eyebrow">' +
    esc(titre || "Produits") + '</span><div class="prods">';
  l.forEach((p, i) => {
    /* La vignette est bornée à 500 px par la source, et se charge à la demande :
       une fiche ouverte au large en montre quatre, une à l'étroit une seule
       avant qu'on fasse défiler. Le carré vide tient sa place quand il n'y a
       pas d'image — sans lui, les noms d'une liste mi-illustrée ne
       s'alignaient plus. */
    const v = adresseImage(p.image);
    out += '<button type="button" class="prod" data-prod="' + i + '">' +
      (v ? '<img class="v" src="' + esc(v) + '" alt="" loading="lazy">'
         : '<span class="v vide" aria-hidden="true"></span>') +
      '<span class="t">' + esc(p.nom) + '</span></button>';
  });
  return out + '</div></div>';
}

/**
 * La fiche d'un produit, dans une fenêtre.
 *
 * Elle ne compte pas : le vocabulaire des mesures est fermé — une cible que la
 * synchronisation n'a pas déclarée est écartée à l'écriture — et les produits
 * n'y sont pas déclarés. Mieux vaut ne rien envoyer que d'envoyer ce qui sera
 * jeté sans le dire.
 */
function ficheProduit(rang){
  const p = produitsOuverts[Number(rang)];
  if (!p) return;
  ouvreModale(p.nom, corps => {
    /* L'originale et non la vignette : elle n'est bornée par rien — jusqu'à
       six mille pixels — mais la fenêtre n'en ouvre qu'une à la fois, et c'est
       le seul endroit où l'on regarde vraiment l'image. */
    const img = adresseImage(p.grande || p.image);
    if (img){
      const el = document.createElement("img");
      el.className = "prodImg";
      el.src = img;
      el.alt = "";
      corps.appendChild(el);
    }
    /* La présentation porte du balisage : elle s'écrit dans un éditeur, chez
       l'organisateur, et arrive par la même API que le reste. On ne garde donc
       que ce qu'on reconnaît, comme pour la description d'une zone. Elle est
       dans la langue où l'exposant l'a saisie : Eventmaker en tient bien une
       traduction, mais ne la rend par aucun chemin de son API. */
    if (p.texte){
      const w = document.createElement("div");
      w.className = "field large";
      w.innerHTML = '<span class="eyebrow"></span><div class="riche" translate="no"></div>';
      w.querySelector(".eyebrow").textContent = "Présentation";
      w.querySelector(".riche").innerHTML = assainitRiche(p.texte);
      corps.appendChild(w);
    }
    if ((p.themes || []).length){
      const w = document.createElement("div");
      w.className = "field";
      w.innerHTML = '<span class="eyebrow"></span><span class="v"></span>';
      w.querySelector(".eyebrow").textContent = "Thématiques";
      const v = w.querySelector(".v");
      p.themes.forEach(t => {
        const el = document.createElement("span");
        el.className = "ligne";
        el.textContent = t;
        v.appendChild(el);
      });
      corps.appendChild(w);
    }
    /* La documentation et la vidéo mènent hors du plan : deux boutons au pied
       de la fenêtre, et non deux adresses écrites au long — celles-ci sont des
       chemins de dépôt à rallonge, illisibles et qui coupent la fenêtre en
       deux. */
    const acts = document.createElement("div");
    acts.className = "acts";
    const sortie = (adr, libelle) => {
      const u = adresseWeb(adr);
      if (!u) return;
      const b = document.createElement("a");
      b.className = "btn";
      b.href = u;
      b.target = "_blank";
      b.rel = "noopener";
      b.textContent = libelle;
      acts.appendChild(b);
    };
    sortie(p.doc, "Documentation");
    sortie(p.video, "Vidéo");
    if (acts.childNodes.length) corps.appendChild(acts);
  }, [{ libelle: "Fermer", genre: "primaire" }], "fiche");
}

/**
 * La fiche d'une conférence. Le programme d'une zone ne montre que l'essentiel
 * — l'heure et le titre — parce qu'il en aligne parfois vingt ; le reste,
 * description comprise, tient ici.
 */
export function ficheConf(id, canal){
  // l'index est global : une conférence retenue peut se tenir dans un autre
  // pavillon que celui qu'on regarde
  const c = CONFS.get(String(id));
  if (!c) return;
  mesure("fiche_conf", canal, String(id));
  const fz = DATA.fuseau;
  const d = momentLocal(c.debutLocal, fz) || momentLocal(c.debut, fz);
  const f = momentLocal(c.finLocal, fz) || momentLocal(c.fin, fz);

  ouvreModale(c.nom, corps => {
    const bloc = (l, v, cls) => {
      if (!v) return;
      const w = document.createElement("div");
      w.className = "field" + (cls ? " " + cls : "");
      w.innerHTML = '<span class="eyebrow"></span><span class="v"></span>';
      w.querySelector(".eyebrow").textContent = l;
      w.querySelector(".v").textContent = v;
      corps.appendChild(w);
    };
    if (c.type){
      const t = document.createElement("div");
      t.className = "conf-type";
      if (c.couleur) t.style.setProperty("--tc", c.couleur);
      t.textContent = c.type;
      corps.appendChild(t);
    }
    bloc("Quand", d
      ? jourLong(d) + " · " + d.h + "h" + d.min + (f ? " – " + f.h + "h" + f.min : "")
      : "");
    bloc("Où", c.salle);
    /* Qui la tient, et où le trouver : le numéro de stand situe l'exposant et
       sa fiche s'ouvre d'un appui — c'est souvent pour lui qu'on lisait le
       programme. Ils peuvent être plusieurs, y compris depuis deux pavillons,
       d'où la liste plutôt qu'une ligne. */
    const tenue = (EXPOSANTS.get(String(id)) || [])
      .map(e => ({ e: e, o: parId.get(e.stand) }))
      .filter(x => x.o || x.e.nom);
    if (tenue.length){
      const w = document.createElement("div");
      w.className = "field";
      w.innerHTML = '<span class="eyebrow"></span><div class="expos"></div>';
      w.querySelector(".eyebrow").textContent = "Organisée par";
      const hote = w.querySelector(".expos");
      tenue.forEach(x => {
        const o = x.o;
        const code = o && montre("stand", "code") && o.code ? o.code : "";
        // le pavillon n'apprend rien tant que c'est celui qu'on regarde
        const ou = [o && o.p !== state.plan ? DATA.plans[o.p].libelle : "", code]
          .filter(Boolean).join(" · ");
        // un stand absent du plan — filtré, ou d'un pavillon non publié — se
        // lit quand même, il ne se clique pas
        const el = document.createElement(o ? "button" : "div");
        el.className = "expo" + (o ? "" : " statique");
        if (o) /** @type {HTMLButtonElement} */ (el).type = "button";
        el.innerHTML = '<span class="n"></span><span class="c"></span>';
        el.querySelector(".n").textContent =
          (o && (o.nom || o.plan)) || x.e.nom || ("Stand " + code).trim();
        el.querySelector(".c").textContent = ou;
        /* La fiche de l'exposant prend la place de celle de la conférence, et
           le plan se recentre sur son stand — au besoin en changeant de
           pavillon, ce dont `select` se charge. */
        if (o) el.onclick = () => { fermeModale(); select(o.id, true, "conference"); };
        hote.appendChild(el);
      });
      corps.appendChild(w);
    }
    /* Qui parle, et qui anime. Aucun des deux ne tient de stand — c'est ce qui
       les sépare d'un exposant : on les lit, on ne les suit nulle part. Ils
       prennent donc son rang, en plus sobre : une ligne par personne, le nom
       puis l'enseigne au bout.

       La fonction n'y paraît pas, et c'est délibéré : elle doublait la hauteur
       du bloc — sept intervenants faisaient quatorze lignes, qui repoussaient la
       présentation hors de l'écran — pour ce que « Franchisé », cinquante-sept
       fois sur un même programme, apprend de chacun. L'enseigne, elle, est ce
       qui rattache la personne au salon.

       Les deux rôles tiennent un seul bloc : un intitulé de plus coûtait deux
       lignes sur la moitié des fiches, quand l'animation se dit d'un mot. */
    const gens = [];
    (c.intervenants || []).forEach(p => gens.push({ p: p, role: "" }));
    (c.animateurs || []).forEach(p => {
      // la même personne peut parler et animer : elle ne paraît qu'une fois, et
      // c'est l'animation qu'on retient, puisque c'est ce qui la distingue
      const deja = gens.find(g => g.p.nom === p.nom);
      if (deja) deja.role = "animation"; else gens.push({ p: p, role: "animation" });
    });
    if (gens.length){
      const w = document.createElement("div");
      w.className = "field";
      w.innerHTML = '<span class="eyebrow"></span><div class="expos gens"></div>';
      // une conférence peut n'avoir qu'un animateur : l'appeler intervenant
      // serait le seul endroit de la fiche à nommer quelqu'un de travers
      w.querySelector(".eyebrow").textContent =
        (c.intervenants || []).length ? "Intervenants" : "Animée par";
      const hote = w.querySelector(".gens");
      gens.forEach(g => {
        const el = document.createElement("div");
        el.className = "expo statique";
        /* Le nom et sa mention sont deux cellules, non un texte suivi : c'est
           ce qui garde la seconde sur la ligne de la première quand la place
           manque — seule sous le nom, elle passait pour un intitulé. */
        el.innerHTML = '<span class="n"><span class="nm"></span></span><span class="c"></span>';
        el.querySelector(".nm").textContent = g.p.nom;
        if (g.role && (c.intervenants || []).length){
          const r = document.createElement("span");
          r.className = "r";
          r.textContent = g.role;
          el.querySelector(".n").appendChild(r);
        }
        const ens = el.querySelector(".c");
        ens.textContent = g.p.societe || "";
        // coupée par une ellipse faute de place : elle se lit en entier ici
        if (g.p.societe) ens.title = g.p.societe;
        hote.appendChild(el);
      });
      corps.appendChild(w);
    }
    bloc("Thématique", c.theme);
    bloc("Présentation", c.texte, "large");
    const acts = document.createElement("div");
    acts.className = "acts";
    acts.innerHTML = boutonParcours("conf", c.id);
    /* « Où » nomme la salle ; encore faut-il la trouver. La zone qui l'abrite
       est le seul point du plan que la conférence désigne — et elle peut se
       tenir dans un autre pavillon que celui qu'on regarde. */
    if (c.zone && parId.has(String(c.zone))){
      const b = document.createElement("button");
      b.className = "btn";
      b.textContent = "Situer sur le plan";
      b.onclick = () => { fermeModale(); select(String(c.zone), true); };
      acts.appendChild(b);
    }
    corps.appendChild(acts);
    brancheParcours(corps);
    // « fiche » espace les blocs comme le fait celle d'un stand
  }, [{ libelle: "Fermer", genre: "primaire" }], "fiche");
}

/* Les adresses, les logos et les descriptions, relus avant d'être affichés :
   `modules/sur.mjs`. */


/**
 * L'adresse d'une vignette fabriquée à la synchronisation.
 *
 * Elle est servie par notre propre API, nommée par l'empreinte de l'adresse
 * d'origine — donc immuable, gardée sans limite par le relais, le navigateur
 * et le service worker. Le préchargement l'a le plus souvent déjà reçue par
 * lot : on rend alors ses octets, et il n'y a plus d'adresse du tout. Recadrée et réduite là-bas, elle pèse trois
 * kilo-octets au lieu de cent cinquante, et n'a plus rien à faire décoder ni
 * analyser ici.
 *
 * Elle ne dit rien de plus que le logo public qu'elle montre : aucun slug ne
 * l'accompagne, et la même vignette sert les salons qui partagent l'enseigne.
 */
export const adresseVignette = (cle) =>
  /* Déjà reçue par lot : ce sont ses octets qu'on rend, et la fiche n'a plus
     rien à demander. Sinon son adresse, qui vaut pour celle qu'on n'a pas
     encore — le lot peut n'être pas arrivé, ou ne jamais partir. */
  VIGNETTES.get(cle) ||
  (API && /^[0-9a-f]{8,64}$/.test(String(cle || ""))
    ? API + "?vignette=" + cle
    : "");

/* Un appui tactile produit, quelque trois cents millisecondes plus tard, un
   clic de compatibilité aux mêmes coordonnées. La fiche venant d'apparaître
   sous le doigt, ce clic fantôme la refermait aussitôt — d'où l'impression
   d'un double clic — ou suivait un lien qu'elle contient. On la rend
   insensible le temps qu'il passe, et seulement après un appui : à la souris,
   rien ne justifierait ce temps mort. */
export let dernierAppuiTactile = false;
/** La porte du dernier appui : les gestes la passent à chaque doigt posé. */
export function poseAppuiTactile(/** @type {boolean} */ v){ dernierAppuiTactile = v; }
let degel = null;

export function ecarteClicFantome(){
  if (!dernierAppuiTactile) return;
  const zones = [$("detail"), $("voile"), $("modale")].filter(Boolean);
  zones.forEach(z => { z.style.pointerEvents = "none"; });
  clearTimeout(degel);
  degel = setTimeout(() => zones.forEach(z => { z.style.pointerEvents = ""; }), 450);
}

/** Le nom sous lequel une société se présente sur un stand. */
const nomSociete = (x) => x.nom || x.plan || "Sans nom";

/**
 * Les sociétés d'un stand, celle qui le loue en tête.
 *
 * Elle est le stand lui-même : c'est son dossier qui l'a désignée à la
 * synchronisation, et ses champs sont posés à plat sur lui. Les autres vivent
 * dans « coex », dans l'ordre où la source les a rendues.
 *
 * Le rang les distingue, la liste ne le dit pas : qui loue et qui est hébergé
 * relève du contrat entre l'organisateur et ses exposants. Un visiteur cherche
 * une enseigne, pas sa place dans un bail.
 */
export function societes(o){
  return [{ soc: o, i: -1 }].concat((o.coex || []).map((x, i) => ({ soc: x, i: i })));
}

/**
 * Le choix, quand plusieurs sociétés se partagent un stand.
 *
 * Ouvrir d'office la fiche du titulaire donnerait le stand à lui seul,
 * alors qu'un stand de restauration en héberge jusqu'à onze. On demande donc
 * qui l'on vient voir, plutôt que de le supposer.
 */
function choisitExposant(o, depuis, canal, recentrer){
  const tous = societes(o);
  ouvreModale(("Stand " + (o.code || "")).trim(), corps => {
    const p = document.createElement("p");
    p.textContent = tous.length + " sociétés occupent ce stand.";
    const ul = document.createElement("ul");
    ul.className = "expos";
    tous.forEach(x => {
      const li = document.createElement("li");
      const b = document.createElement("button");
      const n = document.createElement("span");
      n.className = "nom";
      n.textContent = nomSociete(x.soc);
      b.appendChild(n);
      b.onclick = () => {
        fermeModale();
        // la liste marque la société ouverte, d'où qu'on l'ait choisie ; le
        // plan, lui, ne bouge pas — il nomme le titulaire quoi qu'on lise
        state.selSoc = x.i; liste();
        ouvre(o, depuis, canal, x.i, recentrer);
      };
      li.appendChild(b);
      ul.appendChild(li);
    });
    corps.appendChild(p); corps.appendChild(ul);
  }, [{ libelle: "Fermer" }]);
  ecarteClicFantome();
}

/**
 * La marque en tête de fiche : le logo d'une enseigne, ou celui que
 * l'exploitant a déposé sur une zone. Une fiche sans marque n'en montre aucune.
 *
 * Elle vit ici pour la même raison que `poseCode` : deux fiches écrivent cette
 * image — celle d'un stand ou d'une zone, et celle d'un repère, qui n'en a
 * jamais et doit donc l'effacer. La seconde ne le faisait pas, et la marque du
 * stand d'avant restait en tête de la fiche d'un escalier.
 */
export function poseMarque(blason){
  const marque = $("dLogo");
  if (!marque) return;
  /* Un logo lu chez la source peut n'y être plus : celui qui ne se charge pas
     s'efface, plutôt que de laisser une vignette brisée en tête de fiche.
     Celui d'une zone voyage dans la fiche et ne connaît pas ce sort ; la même
     ligne les couvre tous les deux. */
  marque.onerror = () => { marque.hidden = true; delete marque.dataset.attend; };
  /* Où elle se range dépend de sa largeur, qu'on ne connaît qu'une fois
     l'image tenue : le rangement suit donc l'apparition, jamais avant. */
  marque.onload = () => { marque.hidden = false; delete marque.dataset.attend; rangeMarque(); };
  if (!blason){
    marque.hidden = true;
    delete marque.dataset.attend;
    marqueDemandee = "";
    /* L'adresse est retirée avec l'image cachée, sinon la fiche suivante
       montrerait la marque de la précédente le temps que la sienne arrive. */
    marque.removeAttribute("src");
    return;
  }
  /* La même marque rouverte : posée, ou en route vers sa place. Une image
     déjà tenue par le cache est complète et ne donnera aucun événement — elle
     n'a pas à en attendre un pour paraître, et celle qui a déjà manqué n'en
     attend pas non plus pour s'effacer. */
  if (blason === marqueDemandee){
    if (marque.getAttribute("src") && marque.complete) montreMarque(marque);
    return;
  }
  /* Changer `src` ne retire pas l'image déjà peinte : le navigateur garde la
     précédente à l'écran jusqu'à ce que la nouvelle soit décodée. La fiche
     qu'on vient d'ouvrir portait donc la marque de celle d'avant pendant tout
     le trajet — invisible sur un bureau, très visible sur le réseau d'un
     salon. On la cache donc le temps du trajet, et `onload` la ramène. */
  marqueDemandee = blason;
  /* Elle tient sa place au lieu de disparaître : l'en-tête garde la hauteur
     qu'il aura, et ce qu'on lit dessous ne saute plus à son arrivée. Voir
     « logoZone[data-attend] » dans la feuille de style.

     Sur la ligne du numéro, et non là où la fiche d'avant l'avait laissée :
     une place tenue au hasard n'en est pas une. C'est aussi là que la plupart
     des marques finissent — un logo en largeur, une fois ses marges retirées,
     ne tient plus à côté d'un nom. */
  marque.hidden = false;
  marque.dataset.attend = "";
  const bas = $("dBadges");
  if (bas && marque.parentNode !== bas) bas.appendChild(marque);
  marque.style.maxWidth = "";
  marque.removeAttribute("src");
  recadreMarque(blason).then(src => {
    // une autre fiche a pu s'ouvrir pendant le recadrage : sa marque l'emporte
    if (blason !== marqueDemandee) return;
    marque.src = src;
    if (marque.complete) montreMarque(marque);
  });
}

/* La marque que la fiche attend, telle que la source la donne : c'est elle
   qu'on compare, l'adresse posée sur l'image étant celle du recadrage. */
let marqueDemandee = "";

function montreMarque(marque){
  marque.hidden = !marque.naturalWidth;
  delete marque.dataset.attend;
  if (!marque.hidden) rangeMarque();
}

/**
 * La pastille de situation, et le filigrane que les modèles de fiche lisent
 * sous elle.
 *
 * Le pavillon ne situe la fiche que s'il y en a plusieurs : sur un salon qui
 * tient sur un seul plan, il ne distingue rien, il porte souvent le nom du
 * salon — déjà en tête de la page — et l'onglet des pavillons le nomme de
 * toute façon. Il tombe aussi quand il redit ce nom-là, fût-ce parmi d'autres.
 * La pastille disparaît avec lui s'il ne reste aucun numéro derrière : une
 * zone n'en a jamais, un repère non plus.
 *
 * Elle vit ici parce que deux fiches l'écrivent — celle d'un stand ou d'une
 * zone, et celle d'un repère (`ouvrePoi`, _dessin.html). La seconde la
 * recopiait, et un second écrivain oublie une remise à zéro par champ ajouté :
 * le filigrane gardait le numéro du stand consulté juste avant, et la pastille
 * restait invisible pour avoir été cachée par la fiche d'une zone.
 */
export function poseCode(pl, num, filigrane, salle){
  const memeNom = String(pl.libelle || "").trim().toLowerCase() ===
                  String(DATA.evenement || "").trim().toLowerCase();
  const pav = DATA.plans.length > 1 && !memeNom ? pl.libelle : "";
  /* Le hall tient à l'emplacement, pas au pavillon : un même plan peut en
     couvrir deux, et c'est le stand qui dit lequel. Il se glisse entre le
     pavillon et le numéro — l'ordre dans lequel on cherche un stand sur place,
     le hall puis l'allée.

     Il ne tombe pas, lui, quand le salon n'a qu'un pavillon : le pavillon ne
     distingue alors rien, tandis que le hall reste la porte par laquelle on
     entre. Il reste au contraire muet tant qu'on ne l'a pas coché, et un
     repère n'en a pas — il n'est sur aucun stand. */
  const hall = montre("stand", "hall") ? (salle || "") : "";
  $("dCode").textContent = [pav, hall, num].filter(Boolean).join(" · ");
  $("dCode").hidden = !$("dCode").textContent;
  /* Les modèles de fiche qui impriment le numéro du stand en grand le lisent
     sur l'en-tête : la pastille, elle, porte aussi le pavillon — trop long
     pour un filigrane, et ni une zone ni un repère n'ont de numéro. */
  // la pastille vit désormais dans un bloc à elle : c'est l'en-tête qu'on vise
  $("dCode").closest(".detail-hd").dataset.code = filigrane || "";
}

/**
 * Où se range la marque de la fiche.
 *
 * Le flex sait replier une ligne, il ne sait pas changer de ligne d'accueil :
 * une marque qui ne tient pas à côté du nom se retrouvait seule sur une ligne
 * à elle, entre le nom et le numéro, et coûtait une bande pour ne rien dire de
 * plus. Elle rejoint donc la ligne du numéro, derrière lui.
 *
 * Ce qui tient n'est pas calculé, il est demandé : la marque est posée à côté
 * du nom, on regarde où le navigateur l'a mise, et on la déménage si elle est
 * tombée dessous. Le pli dépend de la fonte, du modèle de fiche et de la
 * largeur du panneau — trois choses qu'un calcul aurait fallu refaire à chaque
 * fois qu'elles changent.
 *
 * Sur la ligne du numéro, sa largeur est bornée à ce qui reste : sans borne
 * elle repartirait à la ligne, et le déménagement n'aurait fait que déplacer
 * la bande perdue.
 */
function rangeMarque(){
  const marque = $("dLogo");
  // rien à ranger tant qu'elle n'est qu'une place tenue : sa largeur décidera
  if (!marque || marque.hidden || marque.dataset.attend !== undefined) return;
  const nom = $("detail").querySelector(".hdNom"), bas = $("dBadges");
  const titre = nom && nom.querySelector("h2");
  if (!titre || !bas) return;
  // remise à l'essai avant de mesurer : la fiche d'avant a pu la déménager
  marque.style.maxWidth = "";
  if (marque.parentNode !== nom) nom.appendChild(marque);
  // elle tient à côté du nom dès que les deux boîtes se croisent en hauteur
  if (marque.getBoundingClientRect().top < titre.getBoundingClientRect().bottom - 2) return;

  /* Tombée dessous, elle tiendrait encore à côté du nom en y rétrécissant. Un
     logo en largeur, une fois ses marges retirées, réclame ses trois cents
     pixels et ne tient plus jamais à côté du nom — alors que, sous le numéro,
     la pastille lui en prend la moitié. On la garde donc là où elle reste la
     plus grande. La place à côté du nom se mesure maintenant, pendant que la
     marque y est encore et que la réserve du coin est donc la sienne. */
  const n = nom.getBoundingClientRect(), sn = getComputedStyle(nom);
  const aCote = Math.floor(n.right - (parseFloat(sn.paddingRight) || 0) -
    titre.getBoundingClientRect().right - (parseFloat(sn.columnGap) || 0)) - 1;

  bas.appendChild(marque);
  /* Ce qui reste sur la ligne du numéro : du bord droit de la dernière
     pastille au bord intérieur du bloc — celui-ci recule là où un modèle de
     fiche réserve la place d'un numéro géant. */
  const r = bas.getBoundingClientRect(), st = getComputedStyle(bas);
  const pastilles = [...bas.children].filter(e => e !== marque && !e.hidden);
  const derniere = pastilles[pastilles.length - 1];
  const gauche = derniere ? derniere.getBoundingClientRect().right
                          : r.left + (parseFloat(st.paddingLeft) || 0);
  const droite = r.right - (parseFloat(st.paddingRight) || 0);
  const dessous = droite - gauche - 10;
  if (aCote >= 90 && aCote > dessous){
    nom.appendChild(marque);
    marque.style.maxWidth = aCote + "px";
    return;
  }
  // réduite à un trait elle ne se lit plus : mieux vaut alors la laisser passer
  marque.style.maxWidth = Math.max(90, dessous) + "px";
}

/**
 * La fiche d'un stand ou d'une zone.
 *
 * `iSoc` désigne la société regardée sur un stand partagé : absent, on demande
 * laquelle ; -1, le titulaire ; sinon le rang du co-exposant. L'emplacement,
 * lui, ne change pas — c'est le même stand qu'on regarde par deux entrées.
 *
 * `depuis` est la forme du plan d'où la fiche s'étire — le nœud, et non sa
 * place à l'écran : celle-ci ne se mesure qu'à la fin, quand la fiche est
 * posée et le plan cadré. `recentrer` dit s'il faut amener le plan sur
 * l'emplacement ; c'est ici que cela se fait, et pas plus tôt, la fiche étant
 * seule à savoir ce qu'elle masque.
 */
export function ouvre(o, depuis, canal, iSoc, recentrer){
  const zone = o.kind === "zone";
  const heberges = (!zone && o.coex) || [];
  /* Le choix retiré, le stand mène droit à son titulaire — c'est lui qui loue
     l'emplacement, et c'est son nom qui est peint sur la cloison. Les sociétés
     qu'il héberge restent atteignables par la liste : le réglage allège le
     plan, il ne retire personne du salon. */
  const plusieurs = heberges.length > 0 && coexChoisit();
  if (plusieurs && iSoc === undefined){ choisitExposant(o, depuis, canal, recentrer); return; }
  /* Un stand sans co-exposant n'a pas de rang à passer : il n'en a qu'un, et
     c'est le titulaire. Le ramener ici évite d'avoir à distinguer « absent »
     de « titulaire » dans tout ce qui suit. */
  const iS = iSoc === undefined ? -1 : iSoc;
  /* La société affichée. Le titulaire porte ses champs à plat sur le stand :
     c'est le stand lui-même qui fait office de fiche. */
  const soc = iS >= 0 ? heberges[iS] : o;
  // la fiche, le parcours et l'itinéraire se partagent la même bande, à
  // droite comme en bas
  fermeParcours(); fermeItineraire();
  const t = zone ? "zone" : "stand";
  const ok = (cle, v) => montre(t, cle) ? v : "";
  /* « Zone organisateur » n'apprenait rien : la forme et la couleur le disent.
     Le type, lui, apprend quelque chose — c'est même tout ce qu'une zone dit
     de sa fonction, et ce qui la fait répondre au cartouche. */
  const genre = zone ? typeZone(o) : null;
  $("dKind").textContent = zone ? (genre ? genre.nom : "") : "Stand";
  $("dKind").hidden = zone && !genre;
  const titre = (zone ? nomDeLaZone(o) : soc.nom) || soc.plan ||
    (zone ? "Zone sans nom" : ("Stand " + (o.code || "")).trim());
  $("dName").textContent = titre;
  /* Le logo, dans l'en-tête avec le type et le nom : c'est une marque, elle se
     lit avec ce qu'elle nomme et non parmi les champs. Sans intitulé au-dessus
     d'elle — une image se reconnaît sans qu'on la nomme.

     Deux origines, une seule place. Sur une zone, c'est ce que l'exploitant y a
     déposé, qui voyage dans la fiche et se relit comme la description — il
     vient du même endroit, et finit au même endroit. Sur un stand, c'est le
     logo de l'enseigne lu chez la source, et il suit la société qu'on regarde
     plutôt que l'emplacement : sur un stand partagé, chaque hébergée montre le
     sien. Celui-là ne se charge qu'à l'ouverture de la fiche, ce qui le garde
     ici et hors de la liste — les cinq cents logos d'un salon comme Franchise
     Expo pèsent soixante-dix mégaoctets, quand une fiche n'en charge qu'un. */
  /* La vignette d'abord : fabriquée à la synchronisation, elle arrive recadrée
     et légère, et se garde d'une visite à l'autre. L'adresse d'origine reste
     le recours — un logo que la synchronisation n'a pas encore vu, ou dont la
     source a refusé de se laisser lire, se charge chez elle comme avant. */
  poseMarque(ok("logo", zone ? imageSure(o.logo)
                             : adresseVignette(soc.vignette) || adresseImage(soc.logo)));
  const pl = DATA.plans[o.p] || P();
  poseCode(pl, ok("code", o.code) ? String(o.code) : "",
           !zone && o.code ? String(o.code) : "", !zone ? o.hall : "");
  /* De quoi revenir au choix sans refermer la fiche : sur un stand partagé, on
     compare souvent deux enseignes voisines. */
  const part = $("dPartage");
  part.hidden = !plusieurs;
  if (plusieurs){
    part.textContent = (heberges.length + 1) + " exposants ici";
    part.onclick = () => choisitExposant(o, null, canal, false);
  }
  /* Les marques de la fiche — nouveau venu, adhérent. Elles ne paraissent que
     si la synchronisation les a posées — les champs qui les portent n'existent
     pas sur tous les salons — et que l'exploitant les laisse voir. Une zone
     organisateur n'en porte aucune : elle n'est pas un exposant. */
  poseDistsFiche(zone ? null : soc);
  // sur une zone, le programme qu'elle accueille ; sur un stand, les
  // conférences que son exposant tient, où qu'elles se tiennent
  /* Le programme est rattaché au stand par le dossier de son titulaire : la
     source ne dit pas quelle conférence revient à une société hébergée, et la
     lui prêter serait une invention. */
  const sien = (!zone && iS < 0 && pl.parStand && pl.parStand.get(o.id)) || [];
  const confs = ok("conferences", zone
    ? programme(P().parZone && P().parZone.get(o.id))
    : programme(sien, "Conférences"));
  /* Le catalogue de la société qu'on regarde, et non celui du stand : chaque
     enseigne hébergée a le sien, et le titulaire n'a aucun titre sur celui de
     qui il loge. Une zone organisateur n'en a pas — elle n'est pas un
     exposant.

     Le rang relevé ici est celui que la liste affichera : c'est lui qui
     désignera le produit à ouvrir, et il ne vaut que tant que cette fiche-ci
     est ouverte. Il se relève donc après le réglage, et non avant — un
     catalogue que le salon ne montre pas n'a pas de rang du tout. */
  const catalogue = (!zone && montre(t, "produits") && soc.produits) || [];
  produitsOuverts = catalogue;
  const prods = produits(catalogue, "Produits");
  /* Le corps de la fiche, champ par champ sous sa clé plutôt que d'un seul
     tenant : l'ordre de lecture n'est pas le même d'un salon à l'autre — ici
     la nomenclature prime, là l'adresse — et c'est l'exploitant qui le règle
     depuis les réglages du plan. Le rangement vient après, une fois tout
     écrit, et réunit sous un même titre les champs qu'il a groupés.

     Ni la surface, ni les angles ouverts, ni l'état de commercialisation
     n'apprennent quoi que ce soit au visiteur : ils n'y figurent pas. */
  const corps = {};
  /**
   * Pose un champ du corps sous sa clé : son intitulé, sa valeur, et la classe
   * qui le range. Un champ que le salon n'affiche pas, ou qui ne porte rien, ne
   * se pose pas du tout — c'est cette absence que le rangement lit ensuite.
   *
   * La valeur est une chaîne quand le champ n'en porte qu'une, un tableau de
   * lignes déjà habillées quand il en porte plusieurs : réunie dans un groupe,
   * la première devient une ligne à son tour, et les secondes s'y versent
   * telles quelles.
   *
   * La classe « court » marque les champs qui tiennent en un mot : sur mobile
   * ils se rangent deux par deux au lieu d'allonger la fiche d'autant de
   * lignes.
   *
   * La clé voyage avec le champ : c'est elle qui dit si son intitulé paraît,
   * et le rangement la perdrait de vue une fois les champs réunis en groupes.
   */
  const met = (cle, libelle, valeur, classe) => {
    const v = Array.isArray(valeur) ? valeur.filter(Boolean) : valeur;
    if (!v || !v.length || !montre(t, cle)) return;
    corps[cle] = { cle: cle, libelle: libelle, valeur: v, classe: classe || "" };
  };
  // la raison sociale n'apprend rien quand elle est déjà le titre
  if (!zone && soc.plan && soc.plan !== titre) met("raison", LIBELLE_CORPS.raison, esc(soc.plan));
  /* Le secteur décrit l'emplacement, pas son occupant : il reste au stand,
     quelle que soit la société qu'on y regarde. Son libellé est résolu à la
     synchronisation, la page l'affiche tel quel. */
  met("secteur", LIBELLE_CORPS.secteur, o.sect ? esc(o.sect) : "");
  met("adresse", LIBELLE_CORPS.adresse, soc.adr ? esc(soc.adr) : "");
  /* Les champs courts s'apparient deux par deux sur mobile : l'ordre réglé
     décide donc aussi de qui se retrouve à côté de qui, et un champ long
     glissé au milieu d'eux y laisse une demi-ligne vide. */
  /* Le code postal n'a pas de ligne à lui : il se pose devant la ville, comme
     sur une enveloppe. Il reste à part jusqu'ici pour que le filtre « Ville »
     coche des villes et non des codes postaux. */
  met("ville", LIBELLE_CORPS.ville,
    esc([soc.cp, soc.ville].filter(Boolean).join(" ")), "court");
  met("pays", LIBELLE_CORPS.pays, soc.pays ? esc(soc.pays) : "", "court");
  /* Les niveaux décrivent l'emplacement, pas son occupant : ils restent au
     stand, quelle que soit la société qu'on y regarde. */
  met("niveaux", LIBELLE_CORPS.niveaux, o.niveaux > 1 ? String(o.niveaux) : "", "court");
  // le téléphone reste appelable d'un mobile, où le plan est le plus consulté
  met("telephone", LIBELLE_CORPS.telephone, soc.tel
    ? '<a href="tel:' + esc(String(soc.tel).replace(/[^+\d]/g, "")) + '">' + esc(soc.tel) + '</a>'
    : "", "court");
  met("site", LIBELLE_CORPS.site, lien(soc.site));
  met("facebook", LIBELLE_CORPS.facebook, pictoRS("facebook", soc.fb));
  met("linkedin", LIBELLE_CORPS.linkedin, pictoRS("linkedin", soc.li));
  met("instagram", LIBELLE_CORPS.instagram, pictoRS("instagram", soc.ig));
  // le libellé est résolu à la synchronisation : la page l'affiche tel quel
  met("nomenclature", LIBELLE_CORPS.nomenclature, (soc.nomencl || [])
    .map(n => '<span class="ligne">' + esc(String(n)) + '</span>'));
  /* Les thématiques disent ce que l'exposant vient faire là, quand la
     nomenclature dit ce qu'il vend ; un salon qui n'en tient pas ne reçoit pas
     la clé du tout.

     Chacune mène aux exposants qui la partagent — mais seulement là où
     l'exploitant en a fait un critère : ailleurs, rien ne saurait dresser la
     liste promise, et une thématique qui ne mène nulle part vaut mieux en
     texte qu'en lien mort. */
  met("thematiques", LIBELLE_CORPS.thematiques, (soc.themes || [])
    .map(n => themeFiltrable(n)
      ? '<button type="button" class="ligne theme" data-t="' +
        esc(String(n)) + '">' + esc(String(n)) + '</button>'
      : '<span class="ligne">' + esc(String(n)) + '</span>'));
  /* Les champs que ce salon-ci s'est ajoutés : l'ordre par défaut les range
     derrière ce que toutes les fiches ont en commun — ils lui sont propres,
     ils ne passent pas d'office devant l'adresse — sans empêcher l'exploitant
     de les faire remonter. */
  const perso = (!zone && DATA.fiche && DATA.fiche.perso) || [];
  perso.forEach(c => {
    // le point-virgule sépare les valeurs d'un champ à choix : la fiche les
    // montre l'une sous l'autre plutôt qu'en une ligne à rallonge
    const fr = separeValeurs((soc.perso || {})[c.cle]);
    const en = separeValeurs((soc.perso_en || {})[c.cle]);
    if (!fr.length && !en.length) return;
    /* Deux versions quand l'exploitant a désigné une origine anglaise : les
       deux sont posées, et la langue de la page dit laquelle se voit — la
       bascule n'a ainsi rien à redessiner, comme pour la description d'une
       zone. Ce qui vient de la source ne passe pas par le dictionnaire : un
       champ à choix y trouve l'anglais de ses valeurs, un texte libre n'y
       trouverait rien. Une seule version sert aux deux langues.

       Le marqueur va sur un bloc qui les réunit, et non sur chaque ligne : la
       règle qui cache l'autre langue est moins spécifique que celle qui fait
       des lignes des blocs, et une ligne marquée restait visible. Le bloc,
       lui, n'a rien qui lui dispute son affichage — et les lignes d'une
       langue gardent entre elles l'écart qu'elles ont ailleurs. */
    const lignes = (l) => l.map(x => '<span class="ligne">' + esc(x) + '</span>');
    const bloc = (l, lg) => '<div data-lg="' + lg + '" translate="no">' +
      lignes(l).join("") + '</div>';
    const seule = fr.length ? fr : en;
    met(PREFIXE_PERSO + c.cle, esc(c.libelle),
      fr.length && en.length ? [bloc(fr, "fr"), bloc(en, "en")]
      : seule.length > 1 ? lignes(seule)
      : esc(seule[0]));
  });
  /* Ce que l'exploitant a écrit sur une zone, depuis les réglages du plan.
     C'est tout ce qu'une zone a en propre : Klipso ne lui donne qu'un nom et
     un contour, et le reste de ce corps décrit un exposant qu'elle n'a pas.

     La description porte du balisage, puisqu'elle s'écrit dans un éditeur :
     elle est relue avant d'être posée dans la fiche. Le libellé du champ ne
     paraît qu'avec lui — une zone sans description n'a pas à annoncer qu'elle
     n'en a pas. */
  if (zone){
    /* Deux descriptions quand l'exploitant a écrit l'anglaise : les deux sont
       posées, et la langue de la page dit laquelle se voit — la bascule n'a
       ainsi rien à redessiner. Ce que l'exploitant a écrit dans une langue ne
       passe pas par le dictionnaire. Sans version anglaise, la française sert
       aux deux. */
    const riche = (h, lg) => '<div class="riche"' + (lg ? ' data-lg="' + lg + '" translate="no"' : "") +
      '>' + assainitRiche(h) + '</div>';
    met("description", LIBELLE_CORPS.description, !o.description && !o.description_en ? ""
      : o.description && o.description_en ? riche(o.description, "fr") + riche(o.description_en, "en")
      : riche(o.description || o.description_en));
    met("lien", LIBELLE_CORPS.lien, lien(o.lien));
  }
  /* Une zone ne se range pas dans l'ordre réglé pour les fiches : celui-ci
     range des champs d'exposant, qu'elle n'a pas, et les deux siens se lisent
     dans le seul ordre qui leur convienne — ce qu'elle est, puis où en savoir
     plus. */
  const infos = zone
    ? [corps.description, corps.lien].filter(Boolean).map(champCorps).join("")
    : corpsRange(ordreCorps(perso.map(c => PREFIXE_PERSO + c.cle)), corps);
  /* Un stand se lit dans cet ordre : qui est l'exposant, puis ce qu'il
     anime — ses conférences peuvent être nombreuses, et repoussaient
     l'adresse et les contacts hors de l'écran. Une zone se présente d'abord —
     ce qu'on y trouve — et déroule son programme ensuite. */
  const bloc2 = (cls, id, h) =>
    '<div class="' + cls + '" id="' + id + '" role="tabpanel">' + h + '</div>';
  /* Ce qu'est l'exposant et ce qu'il anime se partagent la fiche dès qu'il y
     a les deux — un stand sans conférence n'a rien à mettre en face, une zone
     n'a pas de fiche. La forme est la même à toutes les largeurs : un
     interrupteur, un volet à la fois. */
  /* Deux choses peuvent se ranger en face de ce qu'est l'exposant : ce qu'il
     anime, et ce qu'il présente. L'une ou l'autre suffit à partager la fiche,
     et chaque onglet ne paraît que s'il a de quoi remplir son volet — un
     interrupteur à trois positions dont une vide ferait appuyer pour rien. */
  const partage = !zone && (!!confs || !!prods) && !!infos;
  $("detail").classList.toggle("deux", partage);
  $("dOnglets").hidden = !partage;
  $("dOngProg").hidden = !confs;
  $("dOngProd").hidden = !prods;
  $("dOngNb").textContent = partage && sien.length ? sien.length : "";
  $("dOngNbProd").textContent = partage && catalogue.length ? catalogue.length : "";
  // une fiche s'ouvre sur le détail : c'est ce qu'on est venu y lire
  onglet("detail");
  $("dBody").innerHTML = bloc2("cInfos", "dPaneInfos", infos) +
    bloc2("cConf", "dPaneConf", confs) +
    bloc2("cProd", "dPaneProd", prods) +
    '<div class="acts"><button class="btn" id="dGo">Centrer sur le plan</button>' +
    '<button class="btn itin" id="dItin">Itinéraire</button></div>';
  /* Une conférence ouverte d'ici vient soit du programme d'une salle, soit
     de la fiche de l'exposant qui la tient : ce n'est pas le même chemin. */
  const canalConf = zone ? "salle" : "exposant";
  $("dBody").querySelectorAll("[data-conf]").forEach(b =>
    b.onclick = () => ficheConf(b.dataset.conf, canalConf));
  $("dBody").querySelectorAll("[data-prod]").forEach(b =>
    b.onclick = () => ficheProduit(b.dataset.prod));
  /* Le signet du parcours vit en haut, à côté de la croix : retenir un
     exposant porte sur la fiche entière. Une zone organisateur ne se retient
     pas elle-même — ce sont ses conférences qu'on ajoute, chacune à son heure. */
  const sig = $("dMarque");
  sig.hidden = zone;
  if (zone) { delete sig.dataset.mg; delete sig.dataset.mi; }
  else { sig.dataset.mg = "stand"; sig.dataset.mi = o.id; }
  // un seul branchement pour le signet de tête et ceux du programme
  brancheParcours($("detail"));
  /* Une thématique lue sur une fiche est une porte vers les autres exposants
     qui la partagent : c'est le chemin qu'on prend quand on a trouvé à peu
     près ce qu'on cherchait, et qu'on veut voir le reste. */
  $("dBody").querySelectorAll(".theme").forEach(b =>
    b.onclick = () => filtreTheme(b.dataset.t));
  // « j'y vais » : l'arrivée est celle qu'on lit, le départ reste à dire
  brancheActesFiche(() => centre(o), () => versItineraire(o));
  // le crayon vit dans l'en-tête, à côté du nom, et non parmi les actions
  const cr = $("dRen");
  if (cr){
    cr.hidden = !(ADMIN && zone);
    /* Le crayon ne paraît qu'en administration : seule sa page confie le
       geste (`fiche-zone.mjs`), la page publique ne l'a pas. */
    if (soude.ficheZone) cr.onclick = () => soude.ficheZone(o);
  }
  /* Une zone technique — réserve, quai de livraison — n'apprend rien au
     visiteur. L'exploitant l'éteint d'ici, et la pastille dit l'état avant
     d'être un bouton : elle ne paraît qu'en administration, seule vue où une
     zone éteinte soit encore là. */
  const vis = $("dVis");
  if (vis){
    vis.hidden = !(ADMIN && zone);
    if (!vis.hidden){
      const affichee = !o.masquee;
      vis.textContent = "Affiché : " + (affichee ? "oui" : "non");
      vis.setAttribute("aria-pressed", affichee ? "true" : "false");
      vis.title = affichee
        ? "Retirer cette zone du plan public"
        : "Remettre cette zone sur le plan public";
      /* La pastille ne paraît qu'en administration : seule sa page confie le
         geste (`fiche-zone.mjs`), la page publique ne l'a pas. */
      if (soude.basculeAffichageZone) vis.onclick = () => soude.basculeAffichageZone(o);
    }
  }
  /* La marque se range une fois l'en-tête entièrement écrit : c'est la largeur
     des pastilles qui décide de la sienne, et elles viennent d'être posées.
     Une image encore en vol se rangera à son tour, à son « load ». */
  rangeMarque();
  $("detail").classList.add("open");
  $("voile").classList.add("on");
  ecarteClicFantome();
  /* Le plan vient sur l'emplacement maintenant, et non avant d'ouvrir : la
     fiche est posée, et le cadrage sait enfin ce qu'elle couvre — un panneau
     au bord droit sur un écran large, un tiroir au bas d'un téléphone, dont
     la hauteur dépend de ce qu'on vient d'y écrire. Un seul ordre pour les
     deux écrans, là où il en fallait un par écran. */
  if (recentrer) centre(o);
  anime(() => rectVisee(depuis), 1);
  // une zone organisateur n'est pas un exposant : elle ne compte pas ici
  if (!zone) mesure("fiche_stand", canal, o.id);
}
export function ferme(){
  const id = state.sel, ouvert = $("detail").classList.contains("open");
  /* La forme d'où la fiche est partie, relevée tant que la sélection tient
     encore : c'est elle qui dit si l'on repliait vers un emplacement ou vers
     le découpage qu'il héberge. Sa boîte, elle, se mesure plus bas et
     seulement si l'on anime — la classe « sel » qu'on retire ici ne change
     qu'un remplissage, jamais le contour qui la donne. */
  const n = ouvert && id ? noeud(id, state.selSoc) : null;
  document.querySelectorAll(".sel").forEach(x => x.classList.remove("sel"));
  state.sel = null; state.selSoc = -1;
  dessineMarques();
  marqueStandsDessines();
  // fermer ne change que la ligne marquée : la liste reste ce qu'elle montrait
  marqueChoisie(); libelles(); $("voile").classList.remove("on");
  if (ouvert) anime(() => n && (GL.actif ? rectEcranWebgl(n) : n.getBoundingClientRect()), -1);
}
/* Les onglets ne font que choisir ce qu'on regarde : la fiche est construite
   entière, et la bascule ne relit rien. */
export function onglet(n){
  $("detail").dataset.onglet = n;
  $("dOngInfo").setAttribute("aria-selected", String(n === "detail"));
  $("dOngProg").setAttribute("aria-selected", String(n === "prog"));
  $("dOngProd").setAttribute("aria-selected", String(n === "prod"));
}

/* ------------------------------------------------------------
   Le branchement
   ------------------------------------------------------------ */
/**
 * Appelé par `_fiche.html` à la place que ce code tenait : les écoutes de la
 * fiche — le rangement de sa marque au redimensionnement, ses onglets, sa
 * croix et le voile — se posent au même rang qu'avant parmi celles du plan.
 *
 * @param {Record<string, any>} b
 */
export function brancheFiche(b){
  soude = b;
  /* Le panneau ne fait pas la même largeur en colonne et en tiroir, et le pli
     suit : une marque rangée sous le numéro à l'étroit remonte à côté du nom au
     large. Une image seule à mesurer, on ne diffère pas. */
  addEventListener("resize", () => {
    if ($("detail") && $("detail").classList.contains("open")) rangeMarque();
  });
  $("dOngInfo").onclick = () => onglet("detail");
  $("dOngProg").onclick = () => onglet("prog");
  $("dOngProd").onclick = () => onglet("prod");
  $("closeDetail").onclick = ferme;
  $("voile").onclick = ferme;
}
