/* ============================================================
   « Vous êtes ici » — le code affiché dans le hall, côté visiteur

   Le plan pose à tout le monde la même question — « d'où partez-vous ? » — et
   `_borne.html` a réglé le cas de l'écran vissé à l'entrée, qui ne bouge pas
   de la journée. Reste le visiteur, avec son téléphone, sous la même charpente
   métallique où le GPS ne situe rien. Lui non plus ne sait pas nommer l'allée
   où il se tient, et la seule chose que le salon puisse lui dire, c'est : là
   où tu viens de photographier ce code.

   D'où cette fonction en deux moitiés.

   L'exploitant désigne un endroit sur le plan — un stand, une entrée, ou un
   simple point de l'allée — et repart avec une affiche à coller là. Le
   visiteur qui la photographie ouvre un plan qui sait déjà où il est : le
   point « Vous êtes ici » est posé, et ses itinéraires partent de lui sans
   qu'on lui demande rien.

   Trois partis pris, et le premier commande les deux autres.

   **L'adresse porte tout, et ne garde rien.** La position vit dans `?ici=`, et
   nulle part ailleurs — ni dans la base, ni sur l'appareil. Aucun code à
   créer côté serveur, donc aucun à faire expirer, aucune table à purger après
   le salon, et une affiche qui se scanne hors ligne sur un plan déjà visité
   (voir `_sw.js`). C'est le même parti pris que le partage de parcours, pour
   les mêmes raisons.

   **Ce n'est pas une borne.** Le mode réutilise le départ imposé de
   `_borne.html` — c'est le même besoin, et l'itinéraire n'a qu'une question à
   poser — mais rien du reste : un téléphone n'est pas un écran public, il
   garde son jeton de mesure, son parcours et son invitation à installer. Une
   borne se remet à zéro toutes les quatre-vingt-dix secondes ; un téléphone à
   qui l'on ferait cela passerait pour cassé. Seule la visite guidée cède la
   place, et pour la raison inverse : arriver par un code dit pourquoi on est
   là, et « Première visite ? » passerait devant (voir `modules/tutoriel.mjs`).

   **Cela s'éteint.** Le visiteur avance, et le point cesse d'être vrai au bout
   de quelques allées. Le rappel au bas de l'écran porte donc « Désactiver »,
   et l'éteindre retire aussi `?ici=` de l'adresse : ni le rechargement, ni le
   partage, ni la mise à l'écran d'accueil ne ramènent un point qu'on vient
   d'écarter. Il n'y a pas de bouton pour le rallumer, et c'est volontaire —
   celui qui l'éteint est ailleurs, et l'affiche d'à côté, elle, est au bon
   endroit.

   Ce que l'exploitant fait de son côté — désigner l'endroit, produire
   l'affiche — vit dans `modules/affiche-ici.mjs`, que seul `plan-admin.mjs`
   embarque. Le visiteur ne reçoit que ce qui relit l'adresse et tient le
   rappel du bas de l'écran ; `_ici.html` lui confie le tiroir de
   l'itinéraire (`ITI`, `relance`) par `brancheIci` : ce tiroir est un module
   (`tiroir-itineraire.mjs`), mais qui importe celui-ci pour son rappel, et ne
   peut donc être importé en retour.
   ============================================================ */
import { $ } from "./dom.mjs";
import { DATA } from "./donnees.mjs";
import { BORNE } from "./salon.mjs";
import { LIEU_BORNE, poseLieuBorne, lieuBorne, lieuNomme, poseDepartImpose, ecritDepartBorne,
  dessineBorne } from "./borne.mjs";

/* Ce que le code soudé confie : le trajet demandé, lu à l'instant, et sa
   relance. */
/** @type {Record<string, any>} */
let soude = {};
const relance = () => soude.relance();
const racine = document.documentElement;

/* Ce que l'adresse dit, tel quel. Lu au chargement et non à la demande : le
   mode s'éteint en retirant le paramètre, et le relire ensuite ferait croire
   que rien n'a changé. */
const _iciDit = new URLSearchParams(location.search).get("ici");

/* Le signe qui ouvre un point nu. Aucun numéro de stand, aucun libellé de
   repère ne commence par là : le lecteur n'a donc jamais à hésiter entre un
   nom et des coordonnées. */
export const ICI_LIBRE = "@";

/** Le mode est-il en cours ? C'est aussi ce que le rappel du bas affiche. */
export let ICI_ACTIF = false;

/* Et l'autre chose que ce rappel peut avoir à dire : un code que le plan ne
   reconnaît plus. Un seul bandeau pour les deux, parce qu'il n'y a jamais
   qu'une chose à dire à la fois — et parce qu'il porte déjà le bouton qui la
   fait taire. */
let ICI_PERDU = false;

/* ------------------------------------------------------------
   Ce que l'adresse relit
   ------------------------------------------------------------ */
/**
 * L'inverse de `codeIci` (`modules/affiche-ici.mjs`), qui n'accorde sa
 * confiance à rien : l'adresse se tape à la main aussi bien qu'elle se scanne,
 * et une affiche survit au stand qu'elle nommait. Rien de reconnaissable, et l'on rend la main — mieux vaut un plan
 * sans position qu'un plan qui en affirme une fausse.
 */
function litCodeIci(txt){
  const v = String(txt || "").trim();
  if (!v) return null;
  if (v[0] !== ICI_LIBRE) return lieuNomme(v);
  const m = /^.([0-9a-f]+),(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)$/i.exec(v);
  if (!m) return null;
  const d = m[1].toLowerCase();
  const i = DATA.plans.findIndex(p => String(p.id).slice(0, d.length).toLowerCase() === d);
  return i < 0 ? null : lieuBorne(i, [parseFloat(m[2]), parseFloat(m[3])], "");
}

/* ------------------------------------------------------------
   Côté visiteur — le plan qui sait où il est
   ------------------------------------------------------------ */
/**
 * Le point, posé pour de bon.
 *
 * Le départ imposé est celui de la borne, et c'est voulu : l'itinéraire et
 * l'organisation de la journée n'ont qu'une question à poser — « le départ
 * est-il déjà connu ? » — et une seule réponse à recevoir. Ce qui diffère est
 * tout autour, et tient dans les deux lignes qui suivent : rien ne
 * s'enregistre, et le champ de départ garde de quoi se rendre.
 */
function poseIci(pt){
  poseDepartImpose(pt);
  ICI_ACTIF = true;
  racine.classList.add("mode-ici");
  /* Le champ de départ devient une étiquette, comme sur une borne : il dit
     d'où l'on part et n'a plus rien à recevoir. Il reste un champ — le tiroir
     garde sa forme, un lecteur d'écran continue d'en lire le libellé — mais
     cesse d'être une liste déroulante, qui n'aurait plus rien à dérouler. */
  const c = $("iDepart");
  if (c){
    c.readOnly = true;
    ["role", "aria-autocomplete", "aria-expanded", "aria-controls"]
      .forEach(a => c.removeAttribute(a));
  }
  ecritDepartBorne();
  montreBandeauIci();
}

/**
 * Éteindre, et retrouver la navigation d'avant.
 *
 * Trois choses à défaire, dans l'ordre où le visiteur les voit : le point
 * quitte le plan, le champ de départ redevient une liste déroulante qu'on
 * remplit, et l'adresse cesse d'affirmer une position. L'arrivée reste, elle :
 * celui qui reprend la main sur son départ n'a pas changé de destination, et
 * le trajet se recalculera dès qu'il l'aura dit.
 */
function retireIci(){
  if (!ICI_ACTIF) return;
  ICI_ACTIF = false;
  poseLieuBorne(null);
  racine.classList.remove("mode-ici");
  /* Les attributs reviennent tels que le balisage les portait. On les réécrit
     plutôt que de relire un état d'avant, parce qu'il n'y a qu'un avant —
     celui de la page — et que le relever pour le seul cas où l'on éteint
     ferait un état de plus à tenir juste. */
  const c = $("iDepart");
  if (c){
    c.readOnly = false;
    c.value = "";
    c.removeAttribute("title");
    c.setAttribute("role", "combobox");
    c.setAttribute("aria-autocomplete", "list");
    c.setAttribute("aria-expanded", "false");
    c.setAttribute("aria-controls", "iSugg");
  }
  soude.iti().a = null;
  dessineBorne();
  montreBandeauIci();
  relance();
  oublieIciDeLAdresse();
}

/* L'adresse cesse de dire ce que la page ne fait plus. C'est la seule mémoire
   du mode : rien n'est enregistré ailleurs, et la retirer d'ici suffit à ce
   qu'un rechargement, un lien partagé ou un raccourci posé sur l'écran
   d'accueil n'en ramènent rien. */
function oublieIciDeLAdresse(){
  try {
    const u = new URL(location.href);
    if (!u.searchParams.has("ici")) return;
    u.searchParams.delete("ici");
    history.replaceState(history.state, "", u.pathname + u.search + u.hash);
  } catch (e) {}
}

/**
 * Le rappel du bas de l'écran.
 *
 * Il ne s'efface pas une fois lu : il est l'état du mode, et c'est le seul
 * endroit où l'éteindre. Un point qui apparaît sur le plan sans rien pour le
 * retirer serait une panne, pas une fonction.
 */
export function montreBandeauIci(){
  const b = $("iciRappel"), t = $("iciRappelTxt"), s = $("iciStop");
  if (!b) return;
  b.hidden = !ICI_PERDU && (!ICI_ACTIF || !LIEU_BORNE);
  if (b.hidden) return;
  /* Par « textContent » : le moteur de langue traduit ce qui s'écrit dans le
     document, là où il ne traduirait pas une chaîne composée en chemin. Le
     lieu, lui, vient des données et reste dans sa langue — un numéro de stand
     ne se traduit pas. */
  if (t){
    t.textContent = ICI_PERDU
      ? "Ce code désigne un endroit que ce plan ne connaît plus."
      : "Vous êtes ici";
    if (!ICI_PERDU && LIEU_BORNE.lieu){
      const q = document.createElement("b");
      q.textContent = LIEU_BORNE.lieu;
      t.append(" · ", q);
    }
  }
  /* Le même bouton, et deux sens : éteindre une position qui vaut, ou refermer
     une phrase qui n'attend rien. */
  if (s) s.textContent = ICI_PERDU ? "Fermer" : "Désactiver";
}

/**
 * Au démarrage : ce que l'adresse dit, s'il y a quelqu'un pour l'écouter.
 *
 * Une borne l'emporte sans discuter — elle sait où elle est posée, et le lui
 * redire par une adresse scannée n'aurait aucun sens sur un écran vissé au
 * mur. Un code que le plan ne reconnaît plus ne se devine pas non plus : le
 * stand a pu être démonté, le pavillon disparaître d'une édition à l'autre, et
 * le visiteur n'a rien à corriger. On le lui dit une fois, et le plan reste un
 * plan ordinaire.
 */
export function demarreIci(){
  if (BORNE || _iciDit === null) return;
  const pt = litCodeIci(_iciDit);
  if (pt){ poseIci(pt); return; }
  /* L'adresse est nettoyée pour que le rechargement ne rejoue pas l'échec, et
     on le dit une fois : le visiteur n'a rien à corriger, mais il vient de
     photographier un code et mérite de savoir que ce n'est pas le plan qui est
     en panne. */
  oublieIciDeLAdresse();
  ICI_PERDU = true;
  montreBandeauIci();
}

/* ------------------------------------------------------------
   Le branchement
   ------------------------------------------------------------ */
/**
 * Appelé par `_ici.html` à la place que ce code tenait : le bouton du rappel
 * s'y branche au même moment qu'avant.
 *
 * @param {{ iti: () => any, relance: Function }} b
 */
export function brancheIci(b){
  soude = b;

  const _iciStop = $("iciStop");
  if (_iciStop) _iciStop.onclick = () => {
    if (!ICI_PERDU) return retireIci();
    ICI_PERDU = false;
    montreBandeauIci();
  };
}
