/* ============================================================
   L'essai d'un vrai rappel, depuis les réglages

   Un module de l'administration : `plan-admin.mjs` l'embarque, le visiteur ne
   le reçoit jamais — seul le volet des réglages (`_reglages.html`
   `blocRappel`) offre l'essai. Le rappel lui-même, ce que le visiteur voit,
   est dans `rappels.mjs`.
   ============================================================ */
import { SLUG } from "./salon.mjs";
import { RAPPELS_API, poussePossible, abonne } from "./notifications.mjs";
import { rappelsDuParcours } from "./rappels.mjs";

/**
 * Un vrai rappel, une minute plus tard.
 *
 * L'aperçu montre la fenêtre ; il ne prouve rien de ce qui vient après. Les
 * clés VAPID posées dans les secrets, la tâche qui tient l'heure à la minute,
 * le service de poussée du navigateur, le service de second plan qui affiche :
 * rien de tout cela ne se voit autrement qu'à la notification reçue. Et une
 * notification ne se reçoit que d'une conférence à venir — l'exploitant qui
 * règle un salon dont le programme est passé, ou pas encore synchronisé, n'a
 * rien à quoi l'accrocher. Il cochait donc une case sans pouvoir vérifier que
 * la plomberie répondait, jusqu'au jour du salon.
 *
 * D'où cet essai, qui n'accroche rien : un rappel posé pour dans une demi-
 * minute, sur cet appareil, avec le texte d'une conférence imaginaire. Il
 * emprunte exactement le chemin des autres, et c'est tout l'intérêt.
 *
 * Deux précautions valent d'être dites. Les rappels déjà posés repartent avec
 * lui : la liste envoyée remplace celle du serveur, et l'exploitant qui suit
 * aussi son propre salon depuis ce navigateur — même origine, même abonnement
 * — les perdrait sans cela. Et l'instant doit être à venir : la fonction SQL
 * écarte un rappel déjà dû, ce qui est la bonne règle et vaut aussi ici.
 */
const ESSAI_RAPPEL_AVANCE = 30000;   // ms : le temps que la tâche de la minute passe

export async function essaieRappelReel(){
  if (!RAPPELS_API || !SLUG || !poussePossible()) return "impossible";
  /* La demande suit le geste sans rien attendre entre les deux, comme pour
     l'interrupteur : un `await` placé avant la ferait refuser par Safari. La
     recherche du service en était un, juste au-dessus — sur un iPhone où
     l'autorisation n'avait jamais été donnée, aucune invite ne paraissait et
     l'écran annonçait un refus. Un faux diagnostic, sur le bouton dont tout
     l'objet est de diagnostiquer. */
  if (await Notification.requestPermission() !== "granted") return "refus";
  const reg = await navigator.serviceWorker.getRegistration().catch(() => null);
  if (!reg) return "sansService";
  let ab;
  try { ab = await abonne(reg); } catch (e) { return "panne"; }
  try {
    const r = await fetch(RAPPELS_API, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: SLUG, abonnement: ab.toJSON(),
        rappels: [{
          conf: "essai",
          envoi_a: new Date(Date.now() + ESSAI_RAPPEL_AVANCE).toISOString(),
          titre: traduit("Essai — le rappel fonctionne"),
          corps: traduit("Ce message vient de votre plan."),
          // la page d'où l'on essaie, sans ancre : toucher le message la rouvre
          adresse: location.href.split("#")[0],
          vie: 600,
        }].concat(rappelsDuParcours()),
      }),
    });
    if (r.status === 404) return "nonPublie";
    return r.ok ? "ok" : "panne";
  } catch (e) { return "panne"; }
}
