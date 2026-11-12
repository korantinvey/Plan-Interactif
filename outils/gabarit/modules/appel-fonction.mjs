/* ============================================================
   L'appel des fonctions du projet, depuis la console

   La console parle à la base de deux façons : par la table (`rest`, dans le
   socle), et par les fonctions du projet — les comptes, les vignettes des
   logos, la synchronisation. Leur appel vit ici, avec ce qu'il faut dire d'un
   refus et le flux d'une fonction qui rend compte au fil de l'eau
   (`fluxFonction`), pour que les modules qui les appellent
   (`comptes.mjs`, `synchronisation.mjs`) l'importent.

   Ce qui porte la session vient du socle (`socle-console.mjs`) : l'adresse
   du projet, qu'on peut changer en cours de route — elle se lit donc au
   moment de l'appel —, l'appel qui renouvelle le jeton, et la déconnexion.
   ============================================================ */
import { CFG, appel, deconnecte } from "./socle-console.mjs";

/**
 * Ce qu'il faut dire d'une fonction qui refuse.
 *
 * Deux refus portent le même numéro sans venir du même endroit. La fonction
 * s'explique dans `erreur` ; la passerelle, elle, écarte les jetons qu'elle
 * juge périmés avant même de l'appeler, et nomme son champ autrement. Faute de
 * lire les deux, un « Erreur 401 » nu tenait lieu d'explication — et la
 * session, elle, restait ouverte sur un jeton qui ne valait plus rien.
 */
export async function refus(r) {
  const j = await r.json().catch(() => ({}));
  /* Le jeton a déjà été renouvelé puis réessayé par `appel` : un 401 qui
     arrive jusqu'ici est une session bel et bien finie. */
  if (r.status === 401) {
    deconnecte("Session expirée, reconnectez-vous.");
    return "Session expirée.";
  }
  return j.erreur || j.message || j.msg || "Erreur " + r.status;
}

export async function fonction(nom, corps) {
  const r = await appel(CFG.url + "/functions/v1/" + nom, {
    method: "POST",
    body: JSON.stringify(corps),
  });
  if (!r.ok) throw new Error(await refus(r));
  return await r.json().catch(() => ({}));
}

/**
 * Appel d'une fonction qui rend compte au fil de l'eau.
 *
 * La réponse est un flux de lignes JSON plutôt qu'un objet unique : une
 * synchronisation dure trop longtemps pour qu'un message figé dise où l'on en
 * est. On lit ligne à ligne, on prévient l'appelant de chacune, et on renvoie
 * la dernière — celle qui porte le résultat.
 *
 * @param {string} nom
 * @param {any} corps
 * @param {(o: any) => void} surLigne
 * @param {(o: any) => void} [trace]
 */
export async function fluxFonction(nom, corps, surLigne, trace) {
  const dit = trace || (() => {});
  const url = CFG.url + "/functions/v1/" + nom;
  dit({ evt: "appel", url });
  const r = await appel(url, { method: "POST", body: JSON.stringify(corps) });
  /* Ce que le serveur a répondu, et surtout par quel chemin : un flux retenu
     par un relais et un serveur lent se ressemblent trait pour trait de
     l'extérieur. Les en-têtes qui les distinguent — l'encodage surtout — ne se
     lisent d'une autre origine que si la fonction les expose, ce qu'elle
     fait. */
  dit({
    evt: "reponse", statut: r.status,
    entetes: ["content-type", "content-encoding", "cache-control",
              "x-accel-buffering", "date"]
      .reduce((o, c) => ({ ...o, [c]: r.headers.get(c) }), {}),
  });
  // un refus arrive avant le flux, sous forme d'objet unique
  if (!r.ok || !r.body) throw new Error(await refus(r));

  const lecteur = r.body.getReader();
  const dec = new TextDecoder();
  const FIN = String.fromCharCode(10);
  let reste = "", dernier = null;
  /* Le flux se referme quoi qu'il arrive. Une erreur annoncée par le serveur
     sortait d'ici par une exception, en laissant la connexion ouverte : le
     navigateur la tenait jusqu'au ramassage, et une synchronisation relancée
     tout de suite en ouvrait une seconde à côté de la première. */
  try {
    for (;;) {
      const { done, value } = await lecteur.read();
      if (done) { dit({ evt: "flux-fini" }); break; }
      /* Le poids de chaque tronçon, et l'instant où il arrive. C'est là que se
         lit un tampon : une synchronisation servie au fil de l'eau rend des
         dizaines de tronçons étalés sur une minute, une réponse retenue n'en
         rend qu'un, à la fin. */
      dit({ evt: "troncon", octets: value.length });
      reste += dec.decode(value, { stream: true });
      let i;
      while ((i = reste.indexOf(FIN)) >= 0) {
        const ligne = reste.slice(0, i).trim();
        reste = reste.slice(i + 1);
        // le remplissage du flux est un commentaire : deux points en tête
        if (!ligne || ligne[0] === ":") continue;
        /* On accepte les deux habillages. Les pages et les fonctions ne se
           déploient pas ensemble — Cloudflare suit le dépôt, Supabase a son
           propre workflow — et pendant quelques minutes une page neuve parle à
           l'ancienne fonction, ou l'inverse. */
        const utile = ligne.slice(0, 5) === "data:" ? ligne.slice(5).trim() : ligne;
        if (!utile) continue;
        let o;
        try { o = JSON.parse(utile); } catch (e) { continue; }
        dit({ evt: "ligne", ligne: o });
        if (o.erreur) throw new Error(o.erreur);
        surLigne(o);
        if (o.ok) dernier = o;
      }
    }
  } finally {
    lecteur.cancel().catch(() => {});
  }
  return dernier;
}
