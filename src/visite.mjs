/**
 * Ce que le visiteur prépare : ses rappels de conférence (`/api/rappels`), son
 * plan de visite annoncé (`/api/plan-de-visite`) et la charge qu'annoncent ceux
 * des autres (`/api/charge`).
 *
 * Relayés depuis l'origine de la page, pour qu'aucun changement de domaine
 * n'ait rien à reconfigurer. La charge se garde une minute au bord, par
 * l'en-tête : elle n'a pas besoin d'être fraîche à la seconde, seulement de ne
 * pas coûter un aller-retour à chaque retouche d'une journée organisée.
 */
import { BASE, SLUG, CORS_MESURE, ecritEnProduction, ecartee } from "./commun.mjs";

const RAPPELS = BASE + "rappels";
const PLAN_DE_VISITE = BASE + "plan-de-visite";

/* Une liste de rappels porte, par conférence retenue, un titre et une phrase
   déjà écrite : quelques centaines d'octets, soixante au plus. Au-delà, ce
   n'est plus un parcours. */
const RAPPELS_MAX = 32768;

/* Un plan de visite porte deux cents étapes au plus, chacune un jour, une
   demi-heure et un identifiant de stand. Au-delà, ce n'est plus une visite. */
const PLAN_MAX = 16384;

/* Ce que la charge annoncée peut vieillir sans mentir.

   Elle bouge lentement : ce sont des visiteurs qui préparent leur journée, pas
   des gestes de navigation. Une minute de retard sur un compteur qui met
   l'après-midi à changer d'une unité ne fausse aucun arrangement — quand
   relayer sans cache ferait payer un aller-retour à chaque recalcul, et il y
   en a un par retouche. Court exprès, tout de même : trop long et le premier
   visiteur d'une matinée contraindrait encore ceux de midi. */
const CHARGE_TTL = 60;

/* Les mêmes, la lecture de la clé en plus. Un plan posé sur l'écran d'accueil
   d'un iPhone est servi depuis cette origine-ci et n'en aurait pas besoin ;
   une coque d'application qui embarque la page, si. */
const CORS_RAPPELS = {
  ...CORS_MESURE,
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};
/**
 * Relais des rappels de conférence.
 *
 * La page appelle `/api/rappels` sur sa propre origine, comme elle appelle le
 * plan et la mesure : rien à configurer si le domaine change, et rien qui
 * nomme le projet Supabase dans une page. Sans ce relais, l'appel tombait dans
 * les fichiers statiques et rendait un 404 — la fonction ne recevait rien, et
 * le visiteur lisait « Le rappel n'a pas pu être posé » sans que rien ne dise
 * pourquoi.
 *
 * Deux chemins seulement, ceux dont la page a besoin : la clé publique qu'on
 * vient lire pour s'abonner, et la liste qu'on vient poser. L'envoi, lui, est
 * l'affaire de `pg_cron` et n'a rien à faire ici : il ne s'ouvre sur rien,
 * mais l'ouvrir aussi sous ce domaine n'ajouterait qu'une porte à surveiller.
 *
 * Ni lu ni mis en cache dans un sens comme dans l'autre — sauf la clé, que le
 * serveur laisse garder une heure et qui ne change qu'à une rotation.
 */
export async function rappels(requete, url) {
  if (requete.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_RAPPELS });
  }
  const cle = url.pathname === "/api/rappels/cle";
  if (cle ? requete.method !== "GET" : requete.method !== "POST") {
    return new Response("Méthode non permise", { status: 405, headers: CORS_RAPPELS });
  }

  let amont = RAPPELS, envoi = { method: "GET" };
  if (!cle) {
    const corps = await requete.text();
    if (corps.length > RAPPELS_MAX) {
      return new Response(null, { status: 413, headers: CORS_RAPPELS });
    }
    envoi = { method: "POST", headers: { "Content-Type": "application/json" }, body: corps };
  } else {
    amont = RAPPELS + "/cle";
  }

  const reponse = await fetch(amont, envoi);
  return new Response(reponse.body, {
    status: reponse.status,
    headers: {
      ...CORS_RAPPELS,
      "Content-Type": "application/json",
      "Cache-Control": cle ? "public, max-age=3600" : "no-store",
    },
  });
}

/**
 * Relais des plans de visite : un aller simple, sans identité et sans cache.
 *
 * Le même chemin que la mesure, et la même absence de cache — mais pas le même
 * point d'entrée, et c'est voulu. Le plan porte l'identifiant du parcours, la
 * mesure porte le jeton du visiteur : les faire voyager ensemble rendrait
 * joignables « ce que cette personne compte faire » et « ce qu'elle a
 * consulté », c'est-à-dire une trajectoire. Deux chemins séparés, c'est ce qui
 * rend la promesse vérifiable plutôt qu'énoncée.
 */
export async function planDeVisite(requete) {
  if (requete.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_MESURE });
  }
  if (requete.method !== "POST") {
    return new Response("Méthode non permise", { status: 405, headers: CORS_MESURE });
  }
  const corps = await requete.text();
  if (corps.length > PLAN_MAX) {
    return new Response(null, { status: 413, headers: CORS_MESURE });
  }
  if (ecritEnProduction(new URL(requete.url))) return ecartee(CORS_MESURE);
  const reponse = await fetch(PLAN_DE_VISITE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: corps,
  });
  return new Response(reponse.body, {
    status: reponse.status,
    headers: {
      ...CORS_MESURE,
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

/**
 * Relais de la charge annoncée, avec une minute de mémoire.
 *
 * Le cache est celui du bord, par l'en-tête, et non le stockage du Worker : la
 * charge n'a pas besoin d'être oubliée à la seconde comme le plan l'est par
 * `/api/oublie`, elle a besoin de ne pas coûter un aller-retour par recalcul.
 * Une journée organisée se refait à chaque retouche, et il y en a dix.
 *
 * `min` voyage dans l'adresse et entre donc dans la clé du cache : deux pages
 * qui n'ont pas les mêmes stands ne demandent pas le même minimum, et
 * partageraient sinon une réponse amputée.
 */
export async function chargePrevue(url) {
  const slug = url.searchParams.get("slug") ?? "";
  if (!SLUG.test(slug)) {
    return new Response(JSON.stringify({ erreur: "Salon inconnu." }), {
      status: 400,
      headers: { ...CORS_MESURE, "Content-Type": "application/json" },
    });
  }
  const amont = new URL(PLAN_DE_VISITE);
  amont.searchParams.set("slug", slug);
  const min = url.searchParams.get("min");
  if (min && /^[0-9]{1,4}$/.test(min)) amont.searchParams.set("min", min);
  const reponse = await fetch(amont.toString());
  return new Response(reponse.body, {
    status: reponse.status,
    headers: {
      ...CORS_MESURE,
      "Content-Type": "application/json",
      "Cache-Control": reponse.ok
        ? "public, max-age=" + CHARGE_TTL
        : "no-store",
    },
  });
}
