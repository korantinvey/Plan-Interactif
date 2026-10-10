/* ============================================================
   Le parcours de visite — le geste et le tiroir

   La liste, son stockage et ses marques vivent dans `parcours.mjs` ; ce
   module-ci tient ce qui la fait changer et ce qui la montre : le signet
   touché, le lot versé d'un coup, le tiroir, son vidage. Il compose ce que
   ses voisins y posent — la proposition (`suggestion.mjs`), l'interrupteur
   des rappels (`rappels.mjs`), la journée organisée (`journee.mjs`), la note
   de la copie à garder (`partage.mjs`) — et les importe.

   Ces voisins le rappellent à leur tour — rafraîchir, rendre un rang —,
   mais ne peuvent l'importer sans boucle. Le signet basculé et le lot versé,
   eux, vivent avec la liste (`parcours.mjs` `basculeParcours`,
   `verseAuParcours`) et annoncent au tiroir ce qui vient de changer
   (`suitLeParcours`, au bas du module) ; le bouton qui prend tout ce que la
   recherche retient vit à part (`tout-au-parcours.mjs`). La
   suggestion et les rappels, qu'il est seul à appeler, reçoivent ce qu'il
   leur faut en argument (`TIROIR_SUGG`, `fenetreRappel`) ; la journée, dont
   les boutons le rappellent plus tard, par sa porte (`confieALaJournee`, au
   bas du module).

   Il se branche par `brancheTiroirParcours`, que `lancement.mjs` `lancePlan`
   appelle à son rang : ses écoutes s'y posent parmi celles du plan. La fiche,
   la configuration et le filtre de la recherche s'importent (`fiche.mjs`,
   `configuration.mjs`, `recherche.mjs`) : il n'a rien à se faire confier.
   Le refermer vit dans `parcours.mjs`, que l'apparence, la fiche et le
   tiroir de l'itinéraire importent aussi.
   ============================================================ */
import { $ } from "./dom.mjs";
import { fermeLesAutresTiroirs } from "./tiroirs-exclusifs.mjs";
import { DATA, parId, CONFS } from "./donnees.mjs";
import { confirme } from "./fenetre.mjs";
import { momentLocal, jourCourt } from "./temps.mjs";
import { PARCOURS, poseParcours, brancheListeParcours, enregistreParcours, plurielParcours, rafraichitMarque, marqueParcours, instantConf, cleTemps, nomDeStand, groupeParcours, fermeParcours, basculeParcours, brancheParcours, suitLeParcours } from "./parcours.mjs";
import { poseGardeParcours } from "./partage.mjs";
import { SUGG_ECARTES, SUGG_MONTREES, poseSuggestion, fenetreSuggestion }
  from "./suggestion.mjs";
import { synchroniseRappels, reprendRappels, poseRappels, fenetreRappel }
  from "./rappels.mjs";
import { appliqueVueParcours, perimeJournee, oublieSejour, confieALaJournee } from "./journee.mjs";
import { select, ficheConf } from "./fiche.mjs";
import { confieApresOption } from "./options.mjs";
const racine = document.documentElement;


/* ------------------------------------------------------------
   Ce que le parcours change à l'écran
   ------------------------------------------------------------ */
export function rafraichitParcours(){
  const n = PARCOURS.stands.length + PARCOURS.confs.length;
  const c = $("nParcours");
  if (c){ c.textContent = n; c.hidden = n === 0; }
  /* Rien à organiser tant que rien n'est retenu : le bouton reste, éteint,
     plutôt que d'apparaître au premier signet — sa présence dit ce à quoi la
     liste servira. Même geste quand le salon n'a pas pris l'option : elle se
     voit pour être prise, et l'éteindre ferme aussi le clavier, que la feuille
     de style seule laissait passer. Le visiteur, lui, ne voit rien
     (`_styles-parcours.css`, « sans-journee »). */
  const org = $("btnJournee");
  if (org) org.disabled = n === 0 || racine.classList.contains("sans-journee");
  /* Et de même le partage : une liste vide se partage techniquement — le lien
     serait valide — mais n'apprendrait rien à personne. */
  const part = $("btnPartage");
  if (part) part.disabled = n === 0;
  /* Une journée calculée sur une autre liste ne vaut plus : on ne la refait
     pas dans le dos du visiteur, on le lui dit. */
  perimeJournee();
  marqueParcours();
  /* Une même conférence se voit à deux endroits — le programme de sa zone et
     sa propre fiche — et le tiroir en montre une troisième. Toutes les marques
     affichées doivent dire la même chose, d'où qu'on ait touché. */
  document.querySelectorAll("[data-mg]").forEach(rafraichitMarque);
  if ($("parcours").classList.contains("open")) remplitParcours();
}

/* ------------------------------------------------------------
   Le tiroir
   ------------------------------------------------------------ */
export function rangParcours(hote, r){
  const d = document.createElement("div");
  d.className = "pRang";
  d.innerHTML = '<button type="button" class="pOuvre">' +
    (r.dessus ? '<span class="ps"></span><span class="pt"></span>'
              : '<span class="pt"></span><span class="ps"></span>') +
    '</button><button type="button" class="pOte" title="Retirer du parcours" ' +
    'aria-label="Retirer du parcours">&times;</button>';
  d.querySelector(".pt").textContent = r.titre;
  d.querySelector(".ps").textContent = r.detail || "";
  if (r.couleur) d.querySelector(".pOuvre").style.setProperty("--tc", r.couleur);
  d.querySelector(".pOuvre").onclick = r.ouvre;
  d.querySelector(".pOte").onclick = () => basculeParcours(r.genre, r.id);
  hote.appendChild(d);
  /* Le rang est rendu : la visite organisée y glisse un bouton de plus — celui
     qui change l'exposant de jour — et ne veut pas réécrire la vignette pour
     autant. */
  return d;
}

export function remplitParcours(){
  const hote = $("pCorps");
  hote.innerHTML = "";
  const stands = PARCOURS.stands.map(id => parId.get(id)).filter(Boolean);
  const confs = PARCOURS.confs.map(id => CONFS.get(id)).filter(Boolean)
    .sort((a, b) => cleTemps(a).localeCompare(cleTemps(b)));

  /* Le même compte que la fenêtre d'un lot reçu, au séparateur près : ici les
     deux moitiés se lisent en tête d'une liste, non dans une phrase. */
  $("pResume").textContent = stands.length + confs.length
    ? [stands.length ? plurielParcours(stands.length, "exposant") : "",
       confs.length ? plurielParcours(confs.length, "conférence") : ""]
        .filter(Boolean).join(" · ")
    : "rien pour l'instant";
  $("videParcours").hidden = !(stands.length + confs.length);

  if (!stands.length && !confs.length){
    const v = document.createElement("p");
    v.className = "pVide";
    /* La phrase promettait de tout retrouver à la visite suivante. C'est vrai
       d'une visite à la semaine prochaine, et faux d'une visite préparée un
       mois à l'avance sur un iPhone : le navigateur aura fait le ménage. On
       annonce donc ce qu'on tient — la liste reste ici — et le tiroir garni
       dit, lui, comment l'emporter ailleurs (`poseGardeParcours`). */
    v.textContent = "Ouvrez la fiche d'un exposant, ou le programme d'une zone, " +
      "et touchez le signet pour l'ajouter ici. Votre parcours reste sur cet " +
      "appareil, et vous pourrez en garder une copie pour le jour du salon.";
    hote.appendChild(v);
    return;
  }

  /* Ce qui pourrait compléter la liste passe avant la liste elle-même.
     Elle en découle, et la place logique était donc à la suite — mais sur un
     téléphone le tiroir ne montre que trois rangs, et la proposition tombait
     sous la ligne de flottaison d'une liste que personne ne fait défiler pour
     voir ce qu'il y a après ce qu'il a lui-même retenu. En tête elle se voit,
     et sa première phrase dit d'où elle vient : elle ne se prend pas pour un
     rang du parcours. */
  poseSuggestion(hote, TIROIR_SUGG);

  /* Les conférences d'abord : elles ont une heure, et c'est autour d'elles que
     le reste de la journée se range. */
  if (confs.length){
    const g = groupeParcours(hote, "Conférences");
    /* L'interrupteur du rappel se pose en tête du groupe qu'il concerne, et
       nulle part ailleurs : il ne veut rien dire pour un parcours qui n'a que
       des stands, et le proposer en tête du tiroir l'aurait fait lire comme un
       réglage du parcours entier. */
    poseRappels(g);
    let jour = null;
    confs.forEach(c => {
      const d = instantConf(c);
      const f = momentLocal(c.finLocal, DATA.fuseau) || momentLocal(c.fin, DATA.fuseau);
      if (d && d.cle !== jour){
        jour = d.cle;
        const t = document.createElement("div");
        t.className = "jour";
        t.textContent = jourCourt(d);
        g.appendChild(t);
      }
      rangParcours(g, {
        genre: "conf", id: c.id, couleur: c.couleur, dessus: true,
        titre: c.nom,
        detail: (d ? d.h + "h" + d.min + (f ? " – " + f.h + "h" + f.min : "") : "") +
                (c.salle ? " · " + c.salle : ""),
        ouvre: () => ficheConf(c.id, "parcours"),
      });
    });
  }

  if (stands.length){
    const g = groupeParcours(hote, "Exposants");
    stands.forEach(o => rangParcours(g, {
      genre: "stand", id: o.id, dessus: false,
      titre: nomDeStand(o),
      detail: DATA.plans[o.p].libelle + (o.code ? " · " + o.code : ""),
      // choisir un rang, c'est vouloir le voir sur le plan : la fiche s'ouvre
      // et le tiroir se retire, puisqu'ils occupent la même bande
      ouvre: () => select(o.id, true, "parcours"),
    }));
  }

  /* En dernier, et à dessein : ce qui menace la liste se lit après la liste,
     pas avant. En tête, la mise en garde aurait accueilli chaque ouverture du
     tiroir par un avertissement, là où le visiteur vient voir ce qu'il a
     retenu. */
  poseGardeParcours(hote);
}

function ouvreParcours(){
  // la fiche et l'itinéraire occupent la même bande : ils cèdent la place
  // plutôt que de s'y superposer
  fermeLesAutresTiroirs("parcours");
  remplitParcours();
  /* Le tiroir se rouvre sur ce qu'on y regardait : consulter une fiche depuis
     la journée organisée ne doit pas la faire disparaître. */
  appliqueVueParcours();
  $("parcours").classList.add("open");
  $("btnParcours").setAttribute("aria-pressed", "true");
}
/**
 * Tout oublier. Le visiteur le demande par le bouton ci-dessous, après
 * confirmation ; une borne interactive le fait d'elle-même en se remettant
 * pour le visiteur suivant, et n'a personne à qui demander.
 */
export function videLeParcours(){
  poseParcours({ PARCOURS: { stands: [], confs: [] } });
  /* Ce qui attendait son retour part avec le reste : la fenêtre promet que
     rien ne permettra de les retrouver, et une réserve qui survivrait au
     vidage ferait mentir la phrase — jusqu'à reparaître le jour où les
     données reconnaissent à nouveau ce qu'elle gardait. */
  poseParcours({ MIS_DE_COTE: { stands: [], confs: [] } });
  /* La visite organisée n'était que cette liste, mise en jours et en heures :
     elle s'en va avec elle, et son tracé avec elle — mais pas un itinéraire
     demandé à côté, qui ne doit rien au parcours. */
  oublieSejour();
  /* Les propositions écartées l'ont été sur cette liste-là : une liste vidée
     repart de zéro, les refus avec elle. */
  SUGG_ECARTES.clear();
  SUGG_MONTREES.clear();
  enregistreParcours();
  appliqueVueParcours();
}

/* ------------------------------------------------------------
   Le branchement
   ------------------------------------------------------------ */
/**
 * Appelé par `lancement.mjs` `lancePlan` à son rang. La liste se
 * branche d'abord sur l'écran qu'elle rafraîchit et les rappels qu'elle
 * entraîne ; puis les écoutes du tiroir se posent à leur place parmi celles
 * du plan — celle de la
 * touche « Échap » comprise, dont l'ordre parmi les autres décide qui la
 * reçoit.
 */
export function brancheTiroirParcours(){

  brancheListeParcours({
    rafraichit: () => rafraichitParcours(),
    reprendRappels: () => reprendRappels(),
    synchroniseRappels: () => synchroniseRappels(),
  });

  $("btnParcours").onclick = () =>
    $("parcours").classList.contains("open") ? fermeParcours() : ouvreParcours();
  $("closeParcours").onclick = fermeParcours;

  $("videParcours").onclick = () => confirme("Vider le parcours",
    "Les exposants et les conférences retenus seront oubliés. Ils ne sont " +
    "enregistrés que sur cet appareil : rien ne permettra de les retrouver.",
    "Vider", videLeParcours);

  /* Échap ferme d'abord ce qui est au-dessus : une fenêtre modale se referme sur
     le tiroir, pas avec lui. */
  addEventListener("keydown", e => {
    if (e.key === "Escape" && !$("modale").classList.contains("open")) fermeParcours();
  });
}

/* La recherche, que ce module importe, ne peut l'importer en retour : il lui
   confie en se chargeant ce qu'elle en appelle (le bouton qui verse au parcours tout ce qu'elle a retenu). */

/* La fiche, que ce module importe, ne peut l'importer en retour : il lui
   confie en se chargeant le bouton « au parcours » qu'elle pose dans ses
   actions. Refermer le tiroir, elle l'importe de `parcours.mjs`, comme le
   tiroir de l'itinéraire et l'apparence. */


/* Refermer le tiroir et basculer un signet vivent dans `parcours.mjs` ; ils
   s'importent d'ici comme avant. */
export { fermeParcours, basculeParcours, brancheParcours };

/** Ce que la carte de la suggestion appelle chez ce tiroir, qui la pose :
 *  le tiroir refait, et le bouton « au parcours ». */
const TIROIR_SUGG = { remplit: remplitParcours, branche: brancheParcours };

/* La journée, que ce module importe pour la poser dans son tiroir, ne peut
   l'importer en retour : il lui confie en se chargeant ce qu'elle en appelle
   — un rang du parcours, et le tiroir refait. La suggestion et les rappels,
   que ce module seul appelle, reçoivent le leur à chaque appel
   (`TIROIR_SUGG`, `fenetreRappel`). */
confieALaJournee({ rangParcours, rafraichitParcours });

/* Deux options du salon rouvrent ou ferment un bouton de ce tiroir : la
   journée organisée, la suggestion. Ce que chacune refait en changeant, ce
   module le confie à la liste des options (`confieApresOption`), comme
   l'outil de dessin pour les siennes. Le bouton de la journée s'éteint par
   `rafraichitParcours`, qui l'éteint déjà sur une liste vide : la feuille de
   style seule le laissait prendre au clavier. */
confieApresOption("journee", () => rafraichitParcours());
confieApresOption("suggestion", () => rafraichitParcours());

/* Ce que le tiroir refait quand la liste change d'un signet : lui-même, et
   les deux propositions qu'un ajout peut faire naître. Le geste — ajouter ou
   retirer, enregistrer, compter — vit avec la liste (`parcours.mjs`
   `basculeParcours`), que la fiche et la journée importent ; il annonce ici
   ce qui vient de changer.

   Un ajout peut faire basculer la proposition au premier plan : c'est ici
   qu'on le sait, et nulle part ailleurs — le chargement d'une liste retenue
   lors d'une visite précédente n'est pas un ajout, et accueillir le visiteur
   par une fenêtre qu'il n'a pas demandée n'est pas la même chose. Et, pour
   une conférence, la proposition du rappel : c'est le premier horaire retenu
   qui donne au réveil quelque chose à faire, et celui qui vient de le retenir
   est le seul à qui la question se pose. Un lot versé n'y passe pas
   davantage que la suggestion — le tiroir qui s'ouvre sur ce qu'on vient de
   recevoir porte déjà l'interrupteur, en tête de ses conférences. */
suitLeParcours((quoi, ajout) => {
  rafraichitParcours();
  // un lot ouvre le tiroir sur ce qu'il vient d'y verser
  if (quoi === "lot"){ ouvreParcours(); return; }
  if (ajout && quoi === "stand") fenetreSuggestion(TIROIR_SUGG);
  if (ajout && quoi === "conf") fenetreRappel(rafraichitParcours);
});
