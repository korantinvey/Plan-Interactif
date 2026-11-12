/**
 * Ce que tous les chemins du Worker partagent : l'adresse du projet, la
 * distinction entre production et prévisualisation, le contrôle d'un slug, la
 * réponse de service et les en-têtes CORS des relais ouverts.
 *
 * La règle de la prévisualisation (`enApercu`, `cacheDe`, `ecritEnProduction`)
 * est ici et nulle part ailleurs : chaque chemin qui lit le stockage ou relaie
 * une écriture la consulte, et une seconde copie finirait par dire autre chose.
 * Éprouvée par `outils/essais/apercu.js`.
 */
import { PROJET, APERCU } from "./pages.mjs";

/* Le projet vient de la construction (`outils/projet.js`), seul endroit qui
   l'écrit : la production, ou la recette pour une prévisualisation. */
export const BASE = PROJET.url + "/functions/v1/";
/* La fonction qui sert le plan : relayée par `plan.mjs`, interrogée par
   `application.mjs` pour le nom et l'icône d'un salon. */
export const AMONT = BASE + "plan-public";

/* L'adresse d'une prévisualisation : `<branche>-plan-interactif.<compte>.workers.dev`,
   ou le préfixe d'une version à la place de la branche. La production n'en a
   pas devant le nom du Worker. */
const ADRESSE_APERCU = /^[a-z0-9-]+-plan-interactif\.[a-z0-9-]+\.workers\.dev$/;

/**
 * Ce Worker tourne-t-il en prévisualisation ?
 *
 * Cloudflare sert chaque branche poussée sous sa propre adresse, mais avec les
 * liaisons de la production : le même stockage KV, la même base. Sans ce
 * contrôle, une branche en essai rangeait ses réponses dans le cache que lisent
 * les visiteurs — sous des clés que rien ne distinguait —, en dépensait le
 * quota d'écritures quotidien, et comptait les clics de qui la mettait au point
 * dans l'audience des salons.
 *
 * Deux témoins, l'un ou l'autre suffit : la construction, qui sait quelle
 * branche elle construit (`outils/projet.js`), et l'adresse de la requête, si
 * jamais la construction ne l'a pas su.
 */
export const enApercu = (url) => APERCU || ADRESSE_APERCU.test(url.hostname);

/**
 * Le stockage qu'on peut lire et écrire ici.
 *
 * En production, `CACHE`. En prévisualisation, celui de la production est
 * interdit : seul un espace à part, `CACHE_APERCU`, déclaré dans
 * `wrangler.jsonc`, peut servir ; sans lui, on travaille sans cache — ce que ce
 * fichier sait faire partout (voir l'en-tête).
 */
export const cacheDe = (env, url) => (enApercu(url) ? env.CACHE_APERCU : env.CACHE) || null;

/* Les écritures que le Worker relaie de lui-même — mesures, erreurs, plans de
   visite — ne partent pas d'une prévisualisation vers la production : elles y
   fausseraient l'audience, les erreurs d'une version que personne d'autre ne
   reçoit, et la charge annoncée d'où les visiteurs tirent leur journée. Vers un
   projet de recette, si. */
export const ecritEnProduction = (url) => enApercu(url) && PROJET.nom === "production";

/** Une écriture acquittée sans être relayée, et qui le dit. */
export const ecartee = (cors) => new Response(null, {
  status: 204,
  headers: { ...cors, "Cache-Control": "no-store", "X-Apercu": "ecarte" },
});

/* Un slug nomme un salon : des minuscules, des chiffres, des traits. Le
   contrôle n'est pas décoratif — la clé de cache se construit avec. */
export const SLUG = /^[a-z0-9][a-z0-9-]{0,63}$/;

/** Une réponse de service, jamais gardée. */
export const dit = (corps, code) =>
  new Response(JSON.stringify(corps), {
    status: code,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

/** L'empreinte d'un texte, tronquée : de quoi distinguer deux états, non de
 *  quoi garder un secret. Elle nomme une clé de cache, et étiquette ce que le
 *  manifeste vient de composer. */
export async function condense(texte, octets) {
  const e = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texte));
  return [...new Uint8Array(e)].slice(0, octets)
    .map((n) => n.toString(16).padStart(2, "0")).join("");
}

/*
 * Ce relais répond à toutes les origines, et c'est ce qui permet de compter le
 * plan quel que soit l'endroit d'où on l'ouvre.
 *
 * La page ordinaire n'en a pas besoin : servie par ce Worker, elle poste sur
 * `/api/mesure` en relatif, donc sur sa propre origine. Cela couvrait trois
 * portes sur quatre — le navigateur, l'écran d'accueil, et même le cadre posé
 * sur un site tiers, dont le document reste le nôtre. La quatrième tombait :
 * une coque d'application qui embarque la page, ou un cadre en bac à sable,
 * poste depuis une autre origine, le navigateur exigeait un en-tête que rien
 * n'envoyait, et la mesure se taisait — la porte qu'on voulait mesurer était la
 * seule à ne rien compter, et l'oubli ne se voyait qu'au rapport, des semaines
 * plus tard, sous la forme d'un salon qui paraît désert.
 *
 * Ouvrir ne donne rien à personne. La réponse est vide de données, l'appel ne
 * porte aucune identité — ni cookie, ni session, ni en-tête d'autorisation,
 * donc rien qu'une page tierce puisse emprunter — et ce qui protège l'écriture
 * est ailleurs, tout entier côté base : vocabulaire clos, cible qui doit
 * exister dans l'événement, événement qui doit être publié, paquet borné. CORS
 * n'y gardait rien qu'un `curl` n'ignore ; il ne gardait que nos propres
 * visiteurs de compter.
 */
export const CORS_MESURE = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  // une page ne redemande pas la permission à chaque paquet de la visite
  "Access-Control-Max-Age": "86400",
};
