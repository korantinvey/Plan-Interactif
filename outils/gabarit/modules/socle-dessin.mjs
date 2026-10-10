/* ============================================================
   Le socle de l'outil de dessin — ce que l'outil, l'éditeur et la reprise
   des emplacements partagent

   L'historique (`memorise`, `HIST`, `REFAIRE`), l'enregistrement des calques
   sur le poste et en base, la tolérance de la main et la fermeture d'un
   contour, la liste des sociétés qu'on rattache à une forme, les modes de
   transport et le dessin du cadenas.

   Tout cela vivait dans `outil-dessin.mjs`, qui importe l'éditeur
   (`edition.mjs`) et la reprise (`reprise-emplacements.mjs`) : ces deux-là
   ne pouvaient l'importer, et l'outil leur confiait ces fonctions au
   chargement. Rangées ici, sous eux trois, elles s'importent. L'outil les
   réexporte, si bien que les autres modules les importent de lui comme avant.

   Un module de l'administration : le visiteur ne le reçoit jamais.
   ============================================================ */
import { $ } from "./dom.mjs";
import { esc } from "./texte.mjs";
import { P } from "./donnees.mjs";
import { vue, cadrePlan } from "./vue-etat.mjs";
import { oublieGrilles, oublieLiaisons } from "./itineraire.mjs";
import { rafraichitApercu } from "./nappe.mjs";
import { programmePublication } from "./enregistrement.mjs";
import { oublieAimants } from "./aimants.mjs";
import { oublieReperes } from "./points-interet.mjs";
import { DESSINS, cleDessins, marqueAttente, mesCalques } from "./calques-dessin.mjs";
import { nomSurLePlan, societesDuPlan } from "./dessin.mjs";
import { MODES_TRANSPORT } from "./reperes.mjs";

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
   s'annulaient vraiment. `batiments.mjs` `reposeBatiment` contourne ce piège
   depuis longtemps en refabriquant ses formes ; il valait mieux le fermer.
   Les points, eux, sont toujours remplacés par un tableau neuf, jamais écrits
   en place : en copier la liste suffit, et `src` d'une image reste partagé. */
export const HIST = [], REFAIRE = [];
export const instantane = () => mesCalques().map(c => Object.assign({}, c, {
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
export const clotSalve = () => { salveEnCours = ""; };
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

/** Ce que la main sait viser : douze pixels d'écran, convertis en mètres. */
export function toleranceTrace(){
  const r = cadrePlan();
  return r.width ? vue().w / r.width * 12 : .3;
}

/** Le contour se referme quand on revient sur son premier sommet. */
export function fermeIci(p, pts){
  if (pts.length < 3) return false;
  return Math.hypot(p[0] - pts[0][0], p[1] - pts[0][1]) < toleranceTrace() * 1.5;
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

/** Les modes de transport, pour les deux listes qui les proposent — celle de
 *  la boîte à outils et celle du panneau d'édition. */
export const optionsModes = () => MODES_TRANSPORT
  .map(m => '<option value="' + esc(m.v) + '">' + esc(m.nom) + '</option>').join("");

/** Le dessin du cadenas. Fermé, l'anse retombe sur le boîtier ; ouvert, elle
 *  se relève d'un côté — à douze pixels, c'est la seule différence qui se
 *  voie encore, là où deux teintes du même tracé se confondraient. */
export const pictoVerrou = (ferme) =>
  '<svg class="pictoVerrou" viewBox="0 0 12 12" aria-hidden="true">' +
  '<rect x="2.3" y="5.4" width="7.4" height="5.2" rx="1.1"/>' +
  '<path d="' + (ferme ? "M4.3 5.4V3.8a1.7 1.7 0 0 1 3.4 0v1.6"
                       : "M4.3 5.4V3.8a1.7 1.7 0 0 1 3.4 0") + '"/></svg>';
