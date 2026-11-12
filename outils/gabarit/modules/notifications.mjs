/* ============================================================
   Les notifications — ce que l'appareil sait recevoir, et l'abonnement

   Le rappel avant une conférence (`rappels.mjs`) passe par le Web Push : un
   service de second plan inscrit, un abonnement chiffré avec la clé publique
   du serveur, une adresse que la notification rouvrira. Tout cela tient à
   l'appareil et au serveur, rien au plan : le choix des conférences, le
   réglage du délai et la fenêtre qui le propose sont dans `rappels.mjs`.
   ============================================================ */
import { API } from "./salon.mjs";
import { supportMesure } from "./mesure.mjs";

/* L'adresse du serveur des rappels, voisine de celle du plan. La page à
   données figées n'a pas d'API, et donc pas de rappel. */
export const RAPPELS_API = API ? API.replace(/[^/]*$/, "rappels") : "";

/** L'appareil peut-il recevoir un rappel ? Trois objets doivent exister, et
 *  leur absence est la façon dont un iPhone non installé se signale. */
export const poussePossible = () => !!(
  "serviceWorker" in navigator && "PushManager" in window && "Notification" in window);

/** Un plan ouvert dans un onglet iOS : le seul cas où l'absence de `PushManager`
 *  se répare, et où dire comment vaut mieux que se taire. */
export const iOSsansInstallation = () => !poussePossible() &&
  /iP(hone|od|ad)|Macintosh/.test(navigator.userAgent) && "ontouchend" in document &&
  supportMesure() === "web";

/** Où mène la notification : cette page, ce salon, cette conférence. L'adresse
 *  est absolue — le service de second plan l'ouvrira sans contexte. */
export function adresseDuRappel(id){
  const u = new URL(location.href);
  u.hash = "";
  u.searchParams.set("conf", id);
  return u.href;
}

/**
 * L'heure que la source donne à une conférence, ramenée à la minute.
 *
 * Elle part avec le rappel, non pour être lue mais pour être relue : le serveur
 * la compare au programme à chaque synchronisation, et oublie le rappel dont
 * l'heure a bougé depuis (`oublie_rappels_perimes`). Sans ce relevé, un rappel
 * posé dix jours avant le salon partirait à l'heure d'alors, et annoncerait un
 * horaire qui n'existe plus.
 *
 * Les deux champs y entrent, et non celui que `instantConf` a retenu : ce qu'on
 * cherche n'est pas l'instant — le serveur ne sait pas analyser une date comme
 * la page — mais de savoir si la source a changé d'avis. À la minute, parce
 * qu'un export qui ajoute des secondes ne déplace aucune conférence.
 *
 * La forme est celle que `empreinte_debut` refait côté base : les deux doivent
 * écrire la même chaîne, sans quoi tout rappel passerait pour démenti.
 */
const heureVue = v => String(v || "").replace(/ /g, "T").slice(0, 16);
export const empreinteDebut = c => heureVue(c.debutLocal) + "|" + heureVue(c.debut);

/** La clé publique du serveur, sous la forme d'octets : Safari n'accepte pas
 *  la chaîne base64url que Chrome tolère. */
export function octetsDeCle(b64){
  const net = String(b64).replace(/-/g, "+").replace(/_/g, "/");
  const brut = atob(net + "=".repeat((4 - net.length % 4) % 4));
  const o = new Uint8Array(brut.length);
  for (let i = 0; i < brut.length; i++) o[i] = brut.charCodeAt(i);
  return o;
}

export async function abonnementCourant(){
  const reg = await navigator.serviceWorker.getRegistration();
  return reg ? await reg.pushManager.getSubscription() : null;
}

/* L'inscription se passe de main en main quand on l'a déjà : `ready` ne répond
   jamais là où rien n'est inscrit, et la page d'administration n'inscrit pas le
   service — c'est le plan public qui le pose. L'essai des réglages va donc la
   chercher lui-même, et la tend plutôt que de laisser attendre. */
export async function abonne(inscription){
  const reg = inscription || await navigator.serviceWorker.ready;
  const deja = await reg.pushManager.getSubscription();
  if (deja) return deja;
  const r = await fetch(RAPPELS_API + "/cle");
  if (!r.ok) throw new Error("clé indisponible");
  const cle = (await r.json()).cle;
  if (!cle) throw new Error("clé absente");
  /* `userVisibleOnly` n'est pas négociable : le navigateur n'accorde le Web
     Push qu'à qui s'engage à montrer chaque message reçu. Cela tombe bien —
     c'est exactement ce qu'on veut en faire. */
  return await reg.pushManager.subscribe({
    userVisibleOnly: true, applicationServerKey: octetsDeCle(cle) });
}
