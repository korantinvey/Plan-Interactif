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
 * pousse ses gestes, le Worker les passe à la fonction, sans rien garder.
 *
 * Reste un dernier détour, sans rapport avec le cache : le manifeste de
 * l'application installée, complété ici du salon d'où l'on installe.
 */
const BASE = "https://jylkfskotuafptaxujao.supabase.co/functions/v1/";
const AMONT = BASE + "plan-public";
const MESURE = BASE + "mesure";
const RAPPELS = BASE + "rappels";
/* Oublier n'est pas anonyme : on vérifie la session auprès du même projet que
   celui dont on relaie les fonctions — l'adresse en est déduite, pour qu'un
   changement de projet n'ait qu'un seul endroit à changer. */
const AUTH = BASE.replace("/functions/v1/", "/auth/v1/") + "user";
const PARAMS = ["slug", "fond", "v", "vignette"];

/* Un slug nomme un salon : des minuscules, des chiffres, des traits. Le
   contrôle n'est pas décoratif — la clé de cache se construit avec. */
const SLUG = /^[a-z0-9][a-z0-9-]{0,63}$/;

/* Un paquet de mesures pèse quelques centaines d'octets. Au-delà, ce n'est
   plus une visite qu'on décrit : on refuse sans même relayer. */
const MESURE_MAX = 4096;

/* Une liste de rappels porte, par conférence retenue, un titre et une phrase
   déjà écrite : quelques centaines d'octets, soixante au plus. Au-delà, ce
   n'est plus un parcours. */
const RAPPELS_MAX = 32768;

/* Le plan sans son fond peut changer à chaque synchronisation : dix minutes de
   retard au plus, ce qui reste sous le rythme de synchronisation le plus vif.
   Le fond, lui, porte sa version dans la clé : il ne peut pas être périmé. La
   vignette d'un logo non plus — elle est nommée par l'empreinte de l'adresse
   d'où elle vient, et son contenu ne peut pas changer sans que sa clé change. */
const TTL_PLAN = 600;
const TTL_FOND = 2592000;

/* Une entrée périmée n'est pas jetée : elle est servie telle quelle pendant
   qu'on la rafraîchit derrière. Sans cela l'expiration vide le cache au moment
   même où la charge est la plus forte — l'ouverture du salon — et toutes les
   visites arrivées dans cette seconde repartent ensemble jusqu'à la base, dont
   chacune rejoue les sept requêtes. La garde couvre du même coup une panne en
   amont : mieux vaut un plan d'hier qu'une page vide. */
const GARDE = 86400;

/** Une réponse de service, jamais gardée. */
const dit = (corps, code) =>
  new Response(JSON.stringify(corps), {
    status: code,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

/** L'adresse en amont, réduite aux paramètres attendus : c'est elle qui donne
 *  la clé de cache, et les deux chemins qui s'en servent — servir et oublier —
 *  doivent la construire pareil, sans quoi l'oubli manquerait sa cible. */
function amontPour(parametres) {
  const u = new URL(AMONT);
  for (const p of PARAMS) {
    const v = parametres.get(p);
    if (v !== null) u.searchParams.set(p, v);
  }
  return u;
}
const cleDe = (amont) => "v1" + amont.search;

/** Ce que l'on garde à côté de la valeur : de quoi reconstituer la réponse. */
const meta = (r, frais) => ({
  ct: r.headers.get("Content-Type") || "application/json",
  cc: r.headers.get("Cache-Control") || "no-store",
  // au-delà, l'entrée est encore bonne à servir mais demande à être refaite ;
  // le fond, immuable, n'a pas de date de péremption du tout
  frais,
});

/* Les rafraîchissements en vol dans cet isolat. Sans cette retenue, les
   requêtes qui trouvent la même entrée périmée en lanceraient chacune un. */
const _enVol = new Set();

/** On ne garde que ce que la fonction a déclaré public. */
const gardable = (cache, r) =>
  Boolean(cache) && r.ok &&
  (r.headers.get("Cache-Control") || "").includes("public");

/** Range la réponse. Ce qui porte sa version dans son adresse — un fond, une
 *  vignette — est gardé longtemps et ne périme jamais. */
const range = (cache, cle, reponse, corps, immuable) =>
  cache.put(cle, corps, {
    expirationTtl: immuable ? TTL_FOND : GARDE,
    metadata: meta(reponse, immuable ? null : Date.now() + TTL_PLAN * 1000),
  }).catch(() => {});   // un cache en panne ne doit pas casser une visite

/** Refait une entrée périmée, sans faire attendre la visite qui l'a trouvée. */
function rafraichit(cache, cle, adresse, entetes) {
  if (_enVol.has(cle)) return Promise.resolve();
  _enVol.add(cle);
  return fetch(adresse, { headers: entetes })
    .then((r) => (gardable(cache, r) ? range(cache, cle, r, r.body, false) : null))
    // l'amont muet laisse l'entrée périmée en place : elle resservira
    .catch(() => {})
    .finally(() => _enVol.delete(cle));
}

/**
 * Oublier ce qu'on garde d'un salon.
 *
 * L'exploitant enregistre sa configuration, et les visiteurs continuaient de
 * recevoir l'ancienne : l'entrée gardée ne se périmait que d'elle-même, et la
 * première visite d'après recevait encore la copie dépassée pendant qu'elle se
 * refaisait derrière. Le plan public retardait donc d'un bon quart d'heure sur
 * l'écran d'administration, sans que rien ne le dise — et depuis que
 * l'enregistrement se fait tout seul, plus personne ne pouvait deviner à partir
 * de quand regarder.
 *
 * La page le demande donc en finissant d'enregistrer. Oublier ne coûte qu'une
 * lecture de plus à la prochaine visite : c'est sans danger, mais pas anonyme
 * pour autant — il faut présenter une session de ce projet, sans quoi ce chemin
 * serait un moyen de vider le cache en boucle. Le fond de plan n'est pas
 * concerné : son adresse porte sa version, et l'apparence entre dedans.
 */
async function oublie(requete, env) {
  if (requete.method !== "POST") {
    return new Response("Méthode non permise", { status: 405 });
  }
  const slug = new URL(requete.url).searchParams.get("slug") || "";
  if (!SLUG.test(slug)) return dit({ erreur: "Paramètre slug absent ou invalide." }, 400);

  const jeton = requete.headers.get("Authorization");
  const apikey = requete.headers.get("apikey");
  if (!jeton || !apikey) return dit({ erreur: "Session absente." }, 401);
  const qui = await fetch(AUTH, { headers: { "Authorization": jeton, apikey } })
    .catch(() => null);
  if (!qui || !qui.ok) return dit({ erreur: "Session refusée." }, 401);

  if (env.CACHE) {
    /* Le plan, et le nom que porte l'application installée : renommer un salon
       dans la console doit se voir au même moment que le reste. */
    await Promise.all([
      env.CACHE.delete(cleDe(amontPour(new URLSearchParams({ slug })))),
      env.CACHE.delete("nom1:" + slug),
    ]).catch(() => {});   // un cache en panne ne doit pas faire échouer l'oubli
  }
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
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
const CORS_MESURE = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  // une page ne redemande pas la permission à chaque paquet de la visite
  "Access-Control-Max-Age": "86400",
};

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
async function rappels(requete, url) {
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

/* Le nom que porte l'application installée : le salon d'abord, la marque en
   signature — « Plan SMCL by Event2Plan ». */
const MARQUE = "Event2Plan";
/* Un nom de salon tient en une ligne. Au-delà, ce n'est plus un nom, et rien
   ne l'afficherait de toute façon : les systèmes coupent bien avant. */
const NOM_MAX = 64;

/**
 * Le nom du salon, pour le manifeste de l'application installée.
 *
 * Le manifeste est lu avant que la page ait appelé l'API : elle ne peut pas y
 * écrire le nom du salon, elle ne le sait pas encore. Elle nomme donc le slug,
 * et c'est d'ici que le nom vient — d'une lecture à part, qui ne rend que deux
 * colonnes là où le plan entier pèse ses stands, ses zones et son icône
 * d'onglet. On ne s'en sert que pour nommer : ce que le système ouvrira,
 * `start_url`, continue de sortir de ce que la page a demandé.
 *
 * Gardé le temps qu'on garde le plan lui-même : un salon renommé dans la
 * console porte son nouveau nom à la visite d'après, comme le reste. Un nom
 * introuvable — salon inconnu, brouillon, base muette — n'est pas gardé : le
 * cache ne doit pas retenir l'absence, et un slug inventé n'y écrit donc rien.
 */
async function nomDuSalon(slug, env, ctx) {
  const cle = "nom1:" + slug;
  if (env.CACHE) {
    const garde = await env.CACHE.get(cle).catch(() => null);
    if (garde) return garde;
  }
  const rep = await fetch(AMONT + "?slug=" + encodeURIComponent(slug) + "&nom=1")
    .catch(() => null);
  if (!rep || !rep.ok) return null;
  const corps = await rep.json().catch(() => null);
  const nom = String(corps?.evenement ?? "").trim().slice(0, NOM_MAX);
  if (!nom) return null;
  if (env.CACHE) {
    ctx.waitUntil(env.CACHE.put(cle, nom, { expirationTtl: TTL_PLAN }).catch(() => {}));
  }
  return nom;
}

/**
 * Le manifeste, complété du salon d'où l'on installe : son nom, et l'adresse
 * que l'application rouvrira.
 *
 * Une même page sert tous les salons — `?plan=` tranche — et le manifeste, lui,
 * est fabriqué une fois pour toutes : l'application installée depuis un salon
 * rouvrait donc celui d'un autre, sous le nom du produit. Le laisser sans
 * adresse de départ, comme la spécification l'autorise, revenait à n'être plus
 * installable du tout : Chromium refuse une adresse qu'il n'a pas encore
 * remplacée.
 *
 * Le fichier construit est donc repris tel quel, et rien n'y change que le nom
 * et `start_url`. Un manifeste à tenir, aucun à fabriquer par salon.
 *
 * Deux choses arrivent de l'extérieur, et aucune n'entre telle quelle.
 * L'adresse est vérifiée : `start_url` désigne ce que le système ouvrira
 * ensuite, seul, sans la page, et seul un chemin de ce site passe — même
 * origine, une fois normalisé — son ancre retirée, une application ne s'ouvrant
 * pas au milieu d'un document. Le nom, lui, n'est pas reçu mais cherché : la
 * page ne donne qu'un slug, et un lien fabriqué ne peut donc pas faire poser
 * sur un écran d'accueil une application au nom qu'il aurait choisi.
 *
 * Le tour de phrase est écrit ici, et nulle part ailleurs : le salon d'abord,
 * c'est lui qu'on cherche du regard, et la marque en signature.
 *
 * Un fichier de `web/` est servi avant que ce script ne tourne : sans le
 * `run_worker_first` de `wrangler.jsonc`, ce chemin-ci ne viendrait jamais
 * jusqu'ici, et le manifeste partirait tel quel sans que rien ne le dise.
 */
async function manifeste(requete, env, ctx) {
  const fichier = new URL("/manifeste.webmanifest", requete.url);
  const rep = await env.ASSETS.fetch(new Request(fichier.toString(), { method: "GET" }));
  const params = new URL(requete.url).searchParams;
  const depart = params.get("depart");
  const salon = params.get("salon") || "";
  if (!rep.ok) return rep;

  const contenu = await rep.json().catch(() => null);
  if (!contenu) return rep;
  if (depart) {
    /* `new URL` résout et normalise — `//ailleurs.example` nomme un autre
       domaine, `../..` remonte, un protocole glissé devant change de site — et
       la comparaison d'origine tranche : ce qui n'atterrit pas sur ce domaine
       est écarté, et le manifeste repart avec son adresse par défaut. */
    const cible = new URL(depart, fichier);
    if (cible.origin === fichier.origin) contenu.start_url = cible.pathname + cible.search;
  }
  /* Le contrôle du slug n'est pas décoratif non plus : il construit une clé de
     cache, et part en amont. Muet sur un salon qu'on ne sait pas nommer, le
     manifeste garde le nom du produit — mieux vaut une application mal nommée
     qu'une application qui ne s'installe pas. */
  const nom = SLUG.test(salon) ? await nomDuSalon(salon, env, ctx) : null;
  if (nom) {
    contenu.name = "Plan " + nom + " by " + MARQUE;
    contenu.short_name = nom;
  }
  return new Response(JSON.stringify(contenu), {
    headers: {
      "Content-Type": "application/manifest+json; charset=utf-8",
      // il ne change qu'avec une mise en ligne, et n'est lu qu'à l'installation
      "Cache-Control": "public, max-age=600",
    },
  });
}

/** Relais des mesures : un aller simple, sans identité et sans cache. */
async function mesure(requete) {
  if (requete.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_MESURE });
  }
  if (requete.method !== "POST") {
    return new Response("Méthode non permise", { status: 405, headers: CORS_MESURE });
  }
  const corps = await requete.text();
  if (corps.length > MESURE_MAX) {
    return new Response(null, { status: 413, headers: CORS_MESURE });
  }
  const reponse = await fetch(MESURE, {
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

export default {
  async fetch(requete, env, ctx) {
    const url = new URL(requete.url);
    /* Le manifeste est un fichier construit, mais l'adresse qu'il fait rouvrir
       dépend du salon d'où l'on installe : il passe par ici pour la recevoir. */
    if (url.pathname === "/manifeste.webmanifest") return manifeste(requete, env, ctx);
    /* Les mesures d'utilisation prennent le même chemin que le plan : même
       origine que la page, donc rien à configurer si le domaine change. Elles
       ne sont ni lues ni mises en cache — elles ne font que passer. Le relais
       répond en outre à toute origine, pour les portes qui ne sont pas servies
       d'ici : voir `mesure` plus haut. */
    if (url.pathname === "/api/mesure") return mesure(requete);
    /* Les rappels de conférence prennent le même chemin, pour la même raison :
       l'origine de la page, et rien à reconfigurer si le domaine change. */
    if (url.pathname === "/api/rappels" || url.pathname === "/api/rappels/cle") {
      return rappels(requete, url);
    }
    // l'administration vient d'enregistrer : ce qu'on gardait ne vaut plus
    if (url.pathname === "/api/oublie") return oublie(requete, env);
    if (url.pathname !== "/api/plan") return env.ASSETS.fetch(requete);
    if (requete.method !== "GET" && requete.method !== "HEAD") {
      return new Response("Méthode non permise", { status: 405 });
    }

    const amont = amontPour(url.searchParams);
    /* Une vignette de logo ne pend d'aucun salon : elle est nommée par
       l'empreinte de l'adresse d'où elle vient, et c'est tout ce qu'il faut
       pour la rendre. Exiger un slug ici obligerait la page à en porter un
       dans chaque adresse d'image, pour rien. */
    if (!amont.searchParams.get("slug") && !amont.searchParams.get("vignette")) {
      return dit({ erreur: "Paramètre slug manquant." }, 400);
    }

    const jeton = requete.headers.get("Authorization");
    const cache = jeton ? null : env.CACHE;      // une identité contourne le cache
    // la clé ne retient que les paramètres attendus : deux adresses qui ne
    // diffèrent que par un paramètre parasite partagent la même entrée
    const cle = cleDe(amont);
    const immuable = Boolean(amont.searchParams.get("fond") ||
                             amont.searchParams.get("vignette"));

    const entetes = new Headers();
    if (jeton) entetes.set("Authorization", jeton);
    const apikey = requete.headers.get("apikey");
    if (apikey) entetes.set("apikey", apikey);

    if (cache) {
      const garde = await cache.getWithMetadata(cle, { type: "stream" });
      if (garde && garde.value) {
        const perime = Boolean(garde.metadata?.frais) &&
                       Date.now() > garde.metadata.frais;
        if (perime) {
          ctx.waitUntil(rafraichit(cache, cle, amont.toString(), entetes));
        }
        return new Response(garde.value, {
          headers: {
            "Content-Type": garde.metadata?.ct || "application/json",
            "Cache-Control": garde.metadata?.cc || "public, max-age=60",
            "X-Cache": perime ? "stale" : "hit",
          },
        });
      }
    }

    const reponse = await fetch(amont.toString(), { headers: entetes });
    const sortie = new Response(reponse.body, reponse);
    sortie.headers.set("X-Cache", jeton ? "bypass" : cache ? "miss" : "absent");
    /* Le corps n'est cloné que si l'entrée part vraiment au cache : un clone
       qu'on ne lit pas oblige le runtime à tamponner toute la réponse, et un
       fond de plan pèse deux mégaoctets. */
    if (gardable(cache, reponse)) {
      ctx.waitUntil(range(cache, cle, reponse, sortie.clone().body, immuable));
    }
    return sortie;
  },
};
