/* ============================================================
   Les points d'intérêt — la fiche d'un repère, et le chemin vers lui

   Les repères que l'exploitant a posés sont ce qu'un visiteur cherche sans
   connaître de nom : le vestiaire, le parking, les toilettes. Le cartouche
   du bas les récapitule et met en avant une famille d'un geste, la recherche
   les retrouve à la frappe, et toucher l'un d'eux ouvre sa fiche. Le visiteur
   reçoit tout : `plan.mjs` embarque ce module. Le cartouche et la mise en
   avant, que le plan lit, vivent dans `cartouche-poi.mjs`.

   Rien ne lui est confié : la forme d'un identifiant
   (`forme-choisie.mjs` `formeParId`), le passage à un autre pavillon
   (`rendu.mjs` `changePlan`), les distinctions de la fiche
   (`distinctions.mjs` `poseDistsFiche`) et ce que la fiche des stands prête
   à celle d'un repère (`fiche.mjs`) s'importent.
   ============================================================ */
import { $ } from "./dom.mjs";
import { fermeLesAutresTiroirs } from "./tiroirs-exclusifs.mjs";
import { esc } from "./texte.mjs";
import { P } from "./donnees.mjs";
import { rectVisee } from "./vue.mjs";
import { ecritMinutes } from "./temps.mjs";
import { nomRepere, typeLiaison, liensDe, pointRepere } from "./itineraire.mjs";
import { versItineraireDe } from "./tiroir-itineraire.mjs";
import { nomTypeRepere, pictoForme } from "./reperes.mjs";
import { poseCode, poseMarque, onglet, brancheActesFiche, centrePoint, ecarteClicFantome, anime } from "./fiche.mjs";
import { changePlan } from "./rendu.mjs";
import { poseDistsFiche } from "./distinctions.mjs";
import { formeParId } from "./forme-choisie.mjs";
import { reperesCherchables, oublieReperes, cartouchePoi, phareRepere, phareZone, oublieChoixPoi }
  from "./cartouche-poi.mjs";


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
  fermeLesAutresTiroirs("fiche");

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



/* Le cartouche, la mise en avant et le relevé des repères vivent dans
   `cartouche-poi.mjs`, que le dessin et les noms lisent sans atteindre la
   fiche ; ils s'importent d'ici comme avant. */
export { reperesCherchables, oublieReperes, cartouchePoi, phareRepere, phareZone, oublieChoixPoi };
