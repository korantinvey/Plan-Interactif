/**
 * Worker Cloudflare : sert les pages, relaie les lectures du plan et les
 * mesures d'utilisation.
 *
 * Sans relais, chaque visiteur paie l'aller-retour jusqu'à la fonction
 * Supabase — environ deux cents millisecondes rien que pour la mettre en
 * route, plus la traversée du réseau. Ici la réponse est gardée dans un
 * stockage KV, répliqué mondialement et tenu en cache au point de présence qui
 * l'a servie : les visiteurs suivants la reçoivent en quelques dizaines de
 * millisecondes, et la base n'est plus sollicitée à chaque visite.
 *
 * Le cache du Worker (`caches.default`) aurait été plus direct, mais il est
 * inopérant sur un sous-domaine workers.dev. KV, lui, fonctionne partout.
 *
 * Trois règles, et rien d'autre :
 *   — un appel porteur d'une identité n'est ni lu ni écrit dans le cache : il
 *     peut contenir un brouillon, qui n'appartient qu'à son exploitant ;
 *   — seuls les paramètres attendus sont relayés, pour que ce chemin ne
 *     devienne pas un proxy ouvert ;
 *   — sans stockage KV attaché, tout continue de fonctionner, sans cache.
 *
 * À quoi s'ajoute une porte de sortie : `/api/oublie` fait oublier ce qu'on
 * garde d'un salon. Sans elle, une configuration enregistrée depuis
 * l'administration n'atteignait les visiteurs qu'au bout du délai de fraîcheur.
 *
 * Le même chemin sert aux mesures d'utilisation, en sens inverse : la page
 * pousse ses gestes, le Worker les passe à la fonction, sans rien garder. Et
 * aux erreurs des pages, que le Worker ramène à leur module avant de les écrire.
 *
 * Reste un dernier détour, sans rapport avec le cache : le manifeste de
 * l'application installée, complété ici du salon d'où l'on installe — son nom,
 * et l'adresse de ses icônes, que ce même script sert de la base.
 *
 * Ce fichier n'est plus que l'aiguillage et les en-têtes de sûreté. Chaque
 * domaine a son module, à côté :
 *
 *   — `plan.mjs`         le relais et le cache de `/api/plan`, l'oubli ;
 *   — `application.mjs`  l'adresse propre d'un salon, son manifeste, son icône ;
 *   — `mesures.mjs`      mesures d'usage, erreurs des pages, sonde ;
 *   — `visite.mjs`       rappels, plan de visite, charge annoncée ;
 *   — `commun.mjs`       ce qu'ils partagent, dont la règle de la prévisualisation ;
 *   — `carte.mjs`        la lecture des cartes de correspondance.
 *
 * Ils tenaient tous dans ce fichier, mille trois cents lignes où l'on cherchait
 * le cache au milieu du manifeste ; découpés, chacun se lit seul, et ce qu'il
 * emprunte aux autres se lit dans ses imports.
 */
/* Écrit par la construction, jamais versionné : sans lui, pas de déploiement
   (voir `outils/genere.js`). */
import { VERSION_DES_PAGES, SURETE } from "./pages.mjs";
import { relaiePlan, oublie } from "./plan.mjs";
import { CHEMIN_SALON, pageDuSalon, manifeste, iconeApp } from "./application.mjs";
import { mesure, erreur, sonde } from "./mesures.mjs";
import { rappels, planDeVisite, chargePrevue } from "./visite.mjs";

/**
 * Les en-têtes de sûreté, sur tout ce que le Worker rend.
 *
 * `web/_headers` les pose sur les fichiers servis sans lui, mais pas sur ses
 * réponses à lui — le plan d'un salon (`/plan-<salon>`), l'API, le manifeste.
 * La liste vient de la construction (`outils/genere.js` `SURETE`) : une seule
 * à tenir. Ce que la réponse porte déjà est gardé.
 *
 * Aucune restriction de cadre sur le plan d'un salon, qu'un organisateur
 * intègre à son site ; tout le reste n'a rien à faire dans un cadre.
 */
function surete(reponse, url) {
  const sortie = new Response(reponse.body, reponse);
  for (const [nom, valeur] of Object.entries(SURETE)) {
    if (!sortie.headers.has(nom)) sortie.headers.set(nom, valeur);
  }
  if (!CHEMIN_SALON.test(url.pathname) && !sortie.headers.has("Content-Security-Policy")) {
    sortie.headers.set("Content-Security-Policy", "frame-ancestors 'none'");
  }
  return sortie;
}

export default {
  async fetch(requete, env, ctx) {
    return surete(await aiguille(requete, env, ctx), new URL(requete.url));
  },
};

/** Ce que chaque chemin rend, avant les en-têtes de sûreté. */
async function aiguille(requete, env, ctx) {
  const url = new URL(requete.url);
  /* Le manifeste est un fichier construit, mais l'adresse qu'il fait rouvrir
     dépend du salon d'où l'on installe : il passe par ici pour la recevoir. */
  if (url.pathname === "/manifeste.webmanifest") return manifeste(requete, env, ctx);
  /* Et l'icône que ce manifeste désigne : elle n'est pas un fichier de
     `web/` mais une colonne de la base, déposée salon par salon. */
  if (url.pathname === "/api/icone") return iconeApp(url);
  /* L'adresse propre à un salon, celle que son application ouvre. Elle ne
     nomme aucun fichier : c'est la page du plan qui s'y rend. */
  if (CHEMIN_SALON.test(url.pathname)) return pageDuSalon(requete, env);
  /* Les mesures d'utilisation prennent le même chemin que le plan : même
     origine que la page, donc rien à configurer si le domaine change. Elles
     ne sont ni lues ni mises en cache — elles ne font que passer. Le relais
     répond en outre à toute origine, pour les portes qui ne sont pas servies
     d'ici : voir `mesure` plus haut. */
  if (url.pathname === "/api/mesure") return mesure(requete);
  /* Les erreurs des pages : même origine, et seulement elle. */
  if (url.pathname === "/api/erreur") return erreur(requete, env);
  /* Les relevés de performance : même origine, même porte. */
  if (url.pathname === "/api/sonde") return sonde(requete, env);
  /* Le plan de visite annoncé, et la charge qu'il fait : même chemin, même
     origine, et deux verbes. Le premier écrit sans rien rendre, le second
     rend sans rien écrire. */
  if (url.pathname === "/api/plan-de-visite") return planDeVisite(requete);
  if (url.pathname === "/api/charge") return chargePrevue(url);
  /* Les rappels de conférence prennent le même chemin, pour la même raison :
     l'origine de la page, et rien à reconfigurer si le domaine change. */
  if (url.pathname === "/api/rappels" || url.pathname === "/api/rappels/cle") {
    return rappels(requete, url);
  }
  // l'administration vient d'enregistrer : ce qu'on gardait ne vaut plus
  if (url.pathname === "/api/oublie") return oublie(requete, env);
  // la construction en ligne : ce qu'un déploiement a vraiment emporté
  if (url.pathname === "/api/pages") {
    return new Response(JSON.stringify({ pages: VERSION_DES_PAGES }), {
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  }
  if (url.pathname !== "/api/plan") return env.ASSETS.fetch(requete);
  return relaiePlan(requete, env, ctx, url);
}
