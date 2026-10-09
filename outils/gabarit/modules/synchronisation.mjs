/* ============================================================
   Synchronisation d'un salon — lancement, suivi, vignettes des logos

   Le bouton « Synchroniser maintenant » de la fiche aboutit ici : on prévoit
   les étapes avant que le serveur ne les annonce, on suit son flux dans la
   fenêtre d'avancement (`modules/avancement.mjs`), et, la synchronisation
   finie, on fabrique les vignettes des logos qu'elle a relevés. L'appel des
   fonctions vient de `modules/appel-fonction.mjs`, le recadrage des logos de
   `modules/marque.mjs` — celui du plan.

   Ce que le module ne peut pas importer lui est confié par la console
   (`brancheSynchronisation`, `_console-js.html`) : les pavillons qu'elle tient
   en mémoire, relus à chaque lancement puisque le rechargement les remplace,
   le fournisseur retenu par domaine, la barre d'état, le rechargement de la
   console une fois la synchronisation finie, et le flux qui la raconte
   (`fluxFonction`), resté dans la console.
   ============================================================ */
import { $ } from "./dom.mjs";
import { fenetreAvancement, suitAuServeur } from "./avancement.mjs";
import { fonction } from "./appel-fonction.mjs";
import { vignetteDeLogo } from "./marque.mjs";

/** @type {{
 *   plans: () => Record<string, any[]>,
 *   source: (e: any, dom: string) => string,
 *   signale: (txt: string, erreur?: boolean) => void,
 *   charge: () => Promise<void>,
 *   fluxFonction: (nom: string, corps: any, surLigne: (o: any) => void,
 *     trace?: (o: any) => void) => Promise<any>,
 * }} */
let _console = {
  plans: () => ({}),
  source: () => "klipso",
  signale: () => {},
  charge: async () => {},
  fluxFonction: async () => null,
};

/** Ce que la console confie à la synchronisation : voir `_console`. */
export function brancheSynchronisation(branche) {
  _console = branche;
}

/**
 * Les étapes telles qu'on les attend, avant que le serveur ne les annonce.
 *
 * La fenêtre s'ouvre au clic, mais la première ligne du flux ne vient qu'après
 * la connexion, le contrôle des droits et deux lectures en base. Sans cette
 * prévision, on regarderait une barre vide pendant tout ce temps — et une
 * barre vide se lit comme un blocage.
 *
 * Elle se calcule ici comme là-bas, et à partir des mêmes éléments : les
 * sources réglées sur le salon, et les emplacements du dernier passage, que la
 * console a déjà en mémoire pour les afficher. Les deux listes coïncident donc
 * en pratique ; si elles divergeaient, c'est celle du serveur qui ferait foi,
 * puisqu'elle remplace celle-ci dès son arrivée.
 */
function etapesPressenties(e) {
  const emplacements =
    (_console.plans()[e.id] || []).reduce((a, p) => a + (p.nb_stands || 0), 0) || 300;
  const stands = _console.source(e, "stands"), conf = _console.source(e, "conferences");
  return [
    { cle: "exposants", libelle: "Exposants", source: stands,
      poids: stands === "eventmaker" ? emplacements : 20 },
    { cle: "conferences", libelle: "Conférences", source: conf,
      poids: conf === "eventmaker" ? Math.round(emplacements / 4) : 0 },
    { cle: "produits", libelle: "Produits", source: _console.source(e, "produits"),
      poids: _console.source(e, "produits") === "eventmaker" ? Math.round(emplacements / 20) : 0 },
    { cle: "plan", libelle: "Plan", source: _console.source(e, "plan"), poids: emplacements },
  ];
}

export async function synchronise(e) {
  const b = $("btnSync");
  if (b) b.disabled = true;
  /* La fenêtre s'ouvre avant le premier octet, et non à la première ligne du
     flux : entre le clic et la réponse du serveur il s'écoule quelques
     secondes, et un bouton grisé ne dit pas qu'il se passe quelque chose. */
  const vue = fenetreAvancement("Synchronisation — " + (e.nom || "salon"), e.nom);
  vue.ouvre(etapesPressenties(e), true);
  let enCours = null;
  // ce qu'une ligne change à la fenêtre, qu'elle vienne du flux ou du relevé
  const suit = (o) => {
    if (o.etapes) vue.ouvre(o.etapes);
    else if (o.chiffres) vue.chiffres(o.chiffres);
    else if (o.etape) {
      if (o.etat === "encours") enCours = o.etape;
      vue.pas(o);
    }
  };
  /* Le secours est armé dès le départ et se tait tant que le flux coule : là
     où celui-ci passe, il n'aura pas lu une seule fois. */
  const jeton = (crypto.randomUUID && crypto.randomUUID()) ||
    String(Date.now()) + String(Math.random()).slice(2);
  const releve = suitAuServeur(e.id, jeton, suit, vue);
  /* Ce qui tient le flux pour vivant, ce sont ses octets et non ses lignes :
     une étape muette pendant une minute continue de recevoir le remplissage
     que la fonction pousse toutes les deux secondes. */
  const trace = (o) => {
    if (o.evt === "troncon" || o.evt === "reponse") releve.signeDeVie();
    vue.trace(o);
  };
  _console.signale("Synchronisation en cours…");
  try {
    const j = await _console.fluxFonction("sync-evenement", { evenementId: e.id, jeton },
      suit, trace);
    if (!j) throw new Error("Synchronisation interrompue avant la fin.");
    const pav = j.pavillons || [];
    const total = pav.reduce((a, p) => a + (p.stands || 0), 0);
    /* Combien de stands ont trouvé leur fiche chez le fournisseur d'exposants.
       C'est le chiffre qui dit si l'appariement tient : il ne paraît que quand
       les exposants viennent d'ailleurs que du plan, seul cas où il existe.
       « Apparié » n'est pas « nommé » — une fiche trouvée mais exclue du
       catalogue laisse le stand sans nom, et compte quand même ici. */
    const app = pav.some((p) => p.apparies !== undefined)
      ? ", " + pav.reduce((a, p) => a + (p.apparies || 0), 0) + " appariés"
      : "";
    // sans libellés, la nomenclature s'affiche en codes : le dire tout de
    // suite plutôt que de laisser découvrir des « FEP26_NOM10201 » sur le plan
    const n = j.nomenclature || {};
    const suite = n.erreur
      ? " Nomenclature en codes : " + n.erreur
      : n.libelles ? " " + n.libelles + " libellés de nomenclature." : "";
    const mot = pav.length + " pavillon" + (pav.length > 1 ? "s" : "") + ", " +
      total + " emplacements" + app + "." + suite;
    vue.fini(mot, n.erreur ? "alerte" : "ok");
    _console.signale(mot, !!n.erreur);
    await _console.charge();
    /* Les vignettes des logos, une fois la synchronisation finie et annoncée :
       elles ne font pas partie du plan, rien ne les attend, et leur fabrication
       peut durer plusieurs minutes sur un gros salon. Elle se suit dans la
       barre du haut, et s'arrête si l'on quitte la console — le lot suivant
       reprendra où celui-ci s'est arrêté. */
    fabriqueLesVignettes(e);
  } catch (err) {
    // marquer l'étape où l'on s'est arrêté vaut mieux qu'une barre figée
    if (enCours) vue.pas({ etape: enCours, etat: "echec", info: err.message });
    vue.fini(err.message, "echec");
    _console.signale(err.message, true);
  } finally {
    releve.arrete();
    if ($("btnSync")) $("btnSync").disabled = false;
  }
}

/**
 * Les vignettes des logos, fabriquées ici, après la synchronisation.
 *
 * Elles se faisaient au serveur : la plateforme n'accorde pas à une fonction
 * le temps de calcul qu'il faut pour décoder des images, et elle refusait
 * l'appel avant même le premier logo. Ce navigateur, lui, a la puissance — et
 * il ne le fait qu'une fois par salon, pour tous les visiteurs qui suivront.
 *
 * Le recadrage est celui du plan, emprunté au même module : une vignette doit
 * être cadrée comme la page l'aurait fait, puisqu'elle prend sa place.
 *
 * La fonction ne fait que dire ce qui manque et enregistrer ce qu'on lui rend.
 * On lui renvoie par paquets plutôt qu'un par un : chaque envoi est un
 * aller-retour, et cent allers-retours pour cent logos doubleraient la durée.
 *
 * Rien n'attend ces vignettes. Un logo qui n'en a pas se charge chez sa
 * source, comme il l'a toujours fait, et fermer la console ne fait que
 * repousser le reste à la prochaine synchronisation.
 */
const PAQUET_VIGNETTES = 8;
/* Une garde, non une limite du salon : un serveur qui répondrait toujours
   « il en reste » ferait tourner cette boucle sans fin. */
const TOURS_VIGNETTES = 200;

async function fabriqueLesVignettes(e) {
  let faites = 0, refusees = 0, total = 0;
  for (let tour = 0; tour < TOURS_VIGNETTES; tour++) {
    let lot;
    try {
      lot = await fonction("vignettes", { evenementId: e.id });
    } catch (err) {
      /* L'échec se dit, et ne se déduit pas d'une absence : une préparation
         qui ne commence jamais sans rien annoncer laisse chercher du mauvais
         côté. */
      _console.signale(traduit("Préparation des logos impossible : {e}")
        .replace("{e}", err.message), true);
      return;
    }
    total = lot.total || total;
    if (!lot.aFaire || !lot.aFaire.length) break;

    const paquet = [];
    for (const source of lot.aFaire) {
      const v = await vignetteDeLogo(source);
      if (v) paquet.push(v);
      else refusees++;
      if (paquet.length >= PAQUET_VIGNETTES) {
        faites += await envoieVignettes(e, paquet);
        paquet.length = 0;
        _console.signale(traduit("Préparation des logos : {n} sur {t}…")
          .replace("{n}", String(faites + refusees)).replace("{t}", String(total)));
      }
    }
    if (paquet.length) faites += await envoieVignettes(e, paquet);
    _console.signale(traduit("Préparation des logos : {n} sur {t}…")
      .replace("{n}", String(faites + refusees)).replace("{t}", String(total)));
  }

  /* Aucun logo à préparer : le salon n'en a pas, ou ils sont tous faits. Le
     premier cas surprend quand on attend le contraire — un champ de logo non
     désigné dans la correspondance, et pas une fiche n'en porte — et le taire
     laisse chercher du côté de la fabrication ce qui se règle du côté des
     sources. */
  if (!total) { _console.signale(traduit("Aucun logo à préparer sur ce salon.")); return; }
  if (!faites && !refusees) return;
  /* Les refusés se disent avec les autres : une source qui ne rend rien laisse
     un logo qui se chargera chez elle, ce n'est pas une panne — mais un compte
     qui n'atteint jamais son total sans explication en serait une. */
  const mot = refusees
    ? traduit("{n} logos préparés, {r} illisibles chez leur source.")
      .replace("{n}", String(faites)).replace("{r}", String(refusees))
    : traduit("{n} logos préparés pour les fiches.").replace("{n}", String(faites));
  _console.signale(mot);
}

/** Un paquet de vignettes à enregistrer. Un envoi qui échoue ne perd que son
 *  paquet : le tour suivant redemandera les mêmes adresses. */
async function envoieVignettes(e, paquet) {
  try {
    const r = await fonction("vignettes", { evenementId: e.id, vignettes: paquet });
    return r.enregistrees || 0;
  } catch (err) {
    return 0;
  }
}
