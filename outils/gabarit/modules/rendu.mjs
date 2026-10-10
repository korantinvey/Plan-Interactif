/* ============================================================
   3. Rendu du pavillon courant

   Le montage d'un pavillon — l'habillage, les zones et les stands, et tout
   ce qui se repose dessus quand ses groupes viennent d'être réécrits —, les
   onglets des pavillons et le passage de l'un à l'autre.

   Il n'a pas de branchement. Le dessin des calques, le tracé de
   l'itinéraire, la liste et le fond d'un pavillon, il les importe ou les
   tient ; la fiche, il la referme par le registre des tiroirs exclusifs
   (`tiroirs-exclusifs.mjs` `fermeTiroir`), sans l'importer — elle et le
   tiroir de l'itinéraire l'importent, pour monter un pavillon ou y passer.
   Ce que l'administration y rattache — la nappe de la grille, le calage de
   la carte, l'éditeur à remettre au repos (emplacement repris, historique,
   boîte à outils) — suit ses trois annonces (`MONTAGE_COMMENCE`,
   `PAVILLON_MONTE`, `PAVILLON_QUITTE`) ; chez le visiteur personne n'écoute. Le panneau des calques s'importe de `ordre-trace.mjs`, qui n'en
   remplit le contenu que chez l'exploitant.

   Le calque ouvert se referme par sa porte (`calques-dessin.mjs`
   `poseCalqueActif`). Le drapeau `MONTE` ne change qu'ici : la police des
   noms, qui ne peut importer ce module, le lit par un lecteur que celui-ci
   lui confie en se chargeant (`confieAuxPolices`).
   ============================================================ */
import { $ } from "./dom.mjs";
import { creeAnnonce } from "./annonce.mjs";
import { esc } from "./texte.mjs";
import { DATA, state, P } from "./donnees.mjs";
import { API, SLUG, entetesApi } from "./salon.mjs";
import { poseEmprise, fit } from "./vue.mjs";
import { oublieDists } from "./distinctions.mjs";
import { marqueRetrait, liste } from "./recherche.mjs";
import { appliqueApparence } from "./apparence.mjs";
import { marqueParcours } from "./parcours.mjs";
import { dessineItineraire } from "./trace-itineraire.mjs";
import { fermeTiroir } from "./tiroirs-exclusifs.mjs";
import { dessineBorne } from "./vous-etes-ici.mjs";
import { ADMIN } from "./mode-admin.mjs";
import { majFondus } from "./bandes.mjs";
import { poseCalqueActif } from "./calques-dessin.mjs";
import { construitPanneau, ordonneDom } from "./ordre-trace.mjs";
import { confieAuxPolices } from "./polices-plan.mjs";
import { dessineDessins } from "./dessin.mjs";

/* Ce que le montage annonce, et que seule l'administration écoute — l'éditeur
   remis au repos (`outil-dessin.mjs`), la nappe de la grille (`nappe.mjs`), le
   calage de la carte en cours (`calage-carte.mjs`). */
/** Les groupes du pavillon vont être réécrits. */
export const MONTAGE_COMMENCE = creeAnnonce();
/** Le pavillon est dessiné, juste avant de se dire monté. */
export const PAVILLON_MONTE = creeAnnonce();
/** On quitte un pavillon pour un autre. */
export const PAVILLON_QUITTE = creeAnnonce();

/* Les calques d'habillage sont recréés à l'arrivée sur un pavillon ; ensuite
   ordonneDom() ne fait que déplacer les nœuds, ce qui rend le réordonnancement
   instantané malgré le poids du fond de plan. */
export function monteHabillage(){
  const c = $("couches");
  c.querySelectorAll(".cal").forEach(g => g.remove());
  P().fond.forEach(f => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("class", "cal");
    g.dataset.cle = f.cle;
    g.innerHTML = f.svg || "";
    c.appendChild(g);
  });
}

/* Le panneau des calques ne peut se construire qu'une fois le plan monté.
   L'identité de l'exploitant, elle, peut être vérifiée avant ou après :
   ce drapeau permet aux deux ordres d'arrivée d'aboutir. */
export let MONTE = false;

/* Le balisage d'une zone et d'un stand, sortis de « montePlan » pour qu'un
   emplacement ajouté à la main (`reprise-emplacements.mjs`) se pose dans le même
   groupe que ceux de la source, sans qu'on remonte tout le pavillon.

   Une zone que l'exploitant a éteinte ne parvient jamais au visiteur : si
   elle est là, c'est qu'on administre, et la teinte pâlie dit qu'elle ne
   sera pas sur le plan public.

   Une zone ajoutée à la main porte, comme un stand, son identifiant dans
   « data-aj » : c'est le seul attribut par lequel la reprise de forme
   (`groupeGeo`) retrouve un ajout. Sans lui, la forme retouchée
   s'enregistrait mais le tracé restait à sa taille de naissance. */
export const baliseZone = (z) =>
  '<g class="zone' + (z.masquee ? ' masquee' : '') + '" data-id="' + z.id + '"' +
  (z.ajout ? ' data-aj="' + esc(z.id) + '"' : "") +
  ' tabindex="0" role="button" aria-label="' +
  esc(z.nom || "zone") + '"><path d="' + z.d + '"/></g>';
/* Un stand ajouté à la main porte son identifiant propre dans « data-aj » :
   c'est par lui que la reprise de forme le retrouve. Lié à un exposant, il
   prend en « data-id » et « data-soc » l'emplacement et le rang de la société
   qu'il matérialise, comme un stand dessiné : le clic, la fiche, la couleur du
   secteur et la chaleur lisent déjà ces deux-là, et n'ont rien à apprendre. */
export const baliseStand = (s) =>
  '<g class="stand" data-id="' + esc(s.lien ? s.lien.stand : s.id) + '"' +
  (s.ajout ? ' data-aj="' + esc(s.id) + '"' : "") +
  (s.lien ? ' data-soc="' + s.lien.soc + '"' : "") +
  ' tabindex="0" role="button" aria-label="' +
  esc(s.nom || ("Stand " + (s.code || ""))) + '"><path d="' + s.d + '"/></g>';

export function montePlan(){
  const p = P();
  $("zones").innerHTML = p.zones.map(baliseZone).join("");
  $("stands").innerHTML = p.stands.map(baliseStand).join("");
  poseEmprise(p.emprise);
  // les tracés relevés valaient pour les stands du pavillon qu'on quitte
  oublieDists();
  poseCalqueActif(null);
  /* Les groupes viennent d'être réécrits : l'emplacement qu'on reprenait n'est
     plus celui-là, et il appartenait au pavillon qu'on vient de quitter ; la
     boîte à outils n'existe qu'en administration. La page publique n'a rien
     de cela : ni éditeur, ni outils. */
  MONTAGE_COMMENCE.dis();
  monteHabillage();
  dessineDessins();                // crée les calques de dessin puis ordonne la pile
  // les groupes viennent d'être réécrits : le retrait d'une recherche en cours
  // est à reposer dessus, sans quoi le pavillon paraît entier
  marqueRetrait();
  appliqueApparence();
  marqueParcours();
  // le trajet vit hors des calques : il survit au montage, mais son tronçon
  // n'est pas celui du pavillon qu'on vient d'ouvrir
  dessineItineraire();
  // et « Vous êtes ici » n'est posé que dans le pavillon où la borne l'est
  dessineBorne();
  // la nappe de la grille n'est qu'à l'exploitant (`modules/nappe.mjs`)
  PAVILLON_MONTE.dis();
  MONTE = true;
  if (ADMIN) construitPanneau();
  onglets();
}

function onglets(){
  /* Un salon d'un seul pavillon n'a rien à choisir : l'onglet unique ne ferait
     que répéter le titre — souvent mot pour mot, Klipso nommant son plan
     unique comme le salon — et sur un écran étroit il lui prend sa largeur. */
  const seul = DATA.plans.length < 2;
  /* Le cadre et non la barre : vidée, elle laisserait son cadre — un fondu, deux
     flèches et, sur un téléphone, la pastille qui les porte — annoncer des
     onglets qui n'existent pas. */
  $("hallsBande").hidden = seul;
  // la barre s'arrange autrement quand elle n'a plus d'onglets à loger
  document.documentElement.classList.toggle("un-pavillon", seul);
  if (seul) { $("halls").innerHTML = ""; return; }
  $("halls").innerHTML = DATA.plans.map((p, i) =>
    '<button data-p="' + i + '" aria-pressed="' + (i === state.plan) + '"' +
    ' title="' + esc(p.libelle) + '">' +
    esc(p.libelle) + '<span class="n">' + p.stands.length + '</span></button>').join("");
  $("halls").querySelectorAll("button").forEach(b => b.onclick = () => changePlan(+b.dataset.p));
  /* Les onglets viennent d'arriver : personne d'autre ne saura qu'ils débordent
     — le défilement n'a pas bougé, et la fenêtre non plus. */
  majFondus();
}

/**
 * Le fond d'un pavillon : cinquante fois le poids des stands, et purement
 * décoratif. On le charge après coup, une seule fois par pavillon, et on
 * l'injecte s'il concerne encore celui qu'on regarde. Son adresse porte une
 * empreinte de ce qu'il contient : le navigateur le garde indéfiniment, et ne
 * le redemande que lorsque le dessin servi n'est plus le même.
 */
const _fonds = new Map();
export function chargeFond(/** @type {number} */ i){
  const p = DATA?.plans?.[i];
  if (!p || !API) return Promise.resolve();
  if (p.fond.length === 0 || p.fond.every(c => c.svg !== undefined)) return Promise.resolve();
  if (_fonds.has(p.id)) return _fonds.get(p.id);

  /* La version vient du service, qui la calcule sur ce qu'il servira vraiment :
     l'empreinte des dessins, sa façon de les découper, et — pour un visiteur,
     seul à recevoir un fond découpé — ce que l'apparence en montre. Tant
     qu'elle ne bouge pas, il n'y a rien à retélécharger ; dès qu'elle bouge,
     le navigateur ne peut pas resservir l'ancien. Un salon servi par une
     version antérieure du service n'en porte pas : on retombe alors sur
     l'horodatage de synchronisation, qui était la règle jusqu'ici. */
  const q = API + "?slug=" + encodeURIComponent(SLUG) +
            "&fond=" + encodeURIComponent(p.id) +
            "&v=" + encodeURIComponent(p.versionFond || DATA.genereLe || "0");
  const promesse = fetch(q, { headers: entetesApi() })
    .then(r => r.ok ? r.json() : Promise.reject(new Error("HTTP " + r.status)))
    .then(d => {
      const par = new Map((d.calques || []).map(c => [c.cle, c.svg]));
      p.fond.forEach(c => { c.svg = par.get(c.cle) || ""; });
      // le pavillon a pu changer pendant le chargement
      if (state.plan === i){ monteHabillage(); ordonneDom(); appliqueApparence(); }
    })
    .catch(e => {
      _fonds.delete(p.id);          // une panne réseau ne doit pas être définitive
      console.warn("Fond de plan indisponible :", e.message);
    });
  _fonds.set(p.id, promesse);
  return promesse;
}

export function changePlan(i){
  if (i === state.plan) return;
  state.plan = i;
  /* Le calage que l'exploitant règle appartient au pavillon qu'il quitte. */
  PAVILLON_QUITTE.dis();
  fermeTiroir("fiche");
  montePlan(); fit(); liste();
  chargeFond(i);
}

/* Le pavillon monté ou non, confié à la police des noms dès que ce module se
   charge, par un lecteur : elle ne retrace rien avant le premier montage, et
   ne peut importer ce module, qui l'atteint en chemin. */
confieAuxPolices({ monte: () => MONTE });
