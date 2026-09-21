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
 * l'application installée, complété ici du salon d'où l'on installe — son nom,
 * et l'adresse de ses icônes, que ce même script sert de la base.
 */
const BASE = "https://jylkfskotuafptaxujao.supabase.co/functions/v1/";
const AMONT = BASE + "plan-public";
const MESURE = BASE + "mesure";
const RAPPELS = BASE + "rappels";
/* Oublier n'est pas anonyme : on vérifie la session auprès du même projet que
   celui dont on relaie les fonctions — l'adresse en est déduite, pour qu'un
   changement de projet n'ait qu'un seul endroit à changer. */
const AUTH = BASE.replace("/functions/v1/", "/auth/v1/") + "user";
const PARAMS = ["slug", "fond", "v", "vignette", "vignettes"];

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

/* Le plan sans son fond peut changer à chaque synchronisation. Dix minutes,
   jusqu'ici — mais ce délai-là n'est pas ce qui fait la fraîcheur : c'est
   `/api/oublie` qui la fait, appelé dès que l'administration a fini
   d'enregistrer, et qui retire l'entrée à la seconde. Le délai n'est que le
   filet, pour le jour où cet appel n'aboutit pas. Dix minutes le tendaient
   très haut : le plan se réécrivait cent quarante fois par jour et par salon,
   sur un stockage qui n'accepte que mille écritures quotidiennes. Un plan
   ouvert aux visiteurs ne change qu'une fois par jour, et pas du tout pendant
   le salon : une journée suffit.
   Le fond, lui, porte sa version dans la clé : il ne peut pas être périmé. La
   vignette d'un logo non plus — elle est nommée par l'empreinte de l'adresse
   d'où elle vient, et son contenu ne peut pas changer sans que sa clé change. */
const TTL_PLAN = 86400;
const TTL_FOND = 2592000;

/* Combien de temps l'entrée reste servable une fois sa fraîcheur passée. Elle
   doit tenir bien au-delà : une entrée qui disparaît avant d'avoir été refaite
   renvoie la visite jusqu'à la base, ce que la garde existe précisément pour
   éviter.

   Une entrée périmée n'est pas jetée : elle est servie telle quelle pendant
   qu'on la rafraîchit derrière. Sans cela l'expiration vide le cache au moment
   même où la charge est la plus forte — l'ouverture du salon — et toutes les
   visites arrivées dans cette seconde repartent ensemble jusqu'à la base, dont
   chacune rejoue les sept requêtes. La garde couvre du même coup une panne en
   amont : mieux vaut un plan d'hier qu'une page vide. */
const GARDE = 604800;

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

/** La clé d'un lot de vignettes, qui ne peut pas être la liste elle-même :
 *  quarante-huit empreintes font plus de mille octets, et le stockage n'accepte
 *  pas une clé au-delà de cinq cent douze. On prend donc l'empreinte de la
 *  liste — même lot, même clé, et sa longueur ne dépend plus de rien. */
async function cleDeLot(amont) {
  return "v1lot:" + await condense(amont.searchParams.get("vignettes"), 16);
}

/** L'empreinte d'un texte, tronquée : de quoi distinguer deux états, non de
 *  quoi garder un secret. Elle nomme une clé de cache, et étiquette ce que le
 *  manifeste vient de composer. */
async function condense(texte, octets) {
  const e = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texte));
  return [...new Uint8Array(e)].slice(0, octets)
    .map((n) => n.toString(16).padStart(2, "0")).join("");
}

/* La version de ce que le plan porte, rangée à part.
   L'entête la lit à chaque ouverture de page : la prendre dans la métadonnée du
   plan obligerait à en relire les cinq cents kilo-octets pour en tirer seize
   signes, et c'est précisément le temps qu'on cherche à rendre. Elle est écrite
   avec le plan et retirée avec lui — voir `oublie`. */
const cleVersion = (slug) => "ver1:" + slug;

/** Range la version à côté du plan, sans faire attendre la visite. */
const rangeLaVersion = (cache, slug, v) =>
  cache.put(cleVersion(slug), v, { expirationTtl: GARDE }).catch(() => {});

/** La version, et rien d'autre : une cinquantaine d'octets.
 *
 *  Trente secondes de cache : les ouvertures rapprochées ne repartent pas, et
 *  ce que l'administration vient de publier atteint tout le monde dans la
 *  demi-minute. C'est la seule chose qu'un visiteur redemande vraiment. */
const ditVersion = (v) =>
  new Response(JSON.stringify({ v }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=30",
    },
  });

/** Ce que l'on garde à côté de la valeur : de quoi reconstituer la réponse. */
const meta = (r, frais) => ({
  ct: r.headers.get("Content-Type") || "application/json",
  cc: r.headers.get("Cache-Control") || "no-store",
  // ce que le plan portait quand on l'a rangé : la page s'en sert pour savoir
  // si ce qu'elle tient est encore ce qui se sert
  v: r.headers.get("X-Version") || null,
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
    .then((r) => {
      if (!gardable(cache, r)) return null;
      /* Le plan qu'on vient de refaire ne porte pas forcément la même version :
         sans ce geste, l'entête continuerait d'annoncer celle d'avant, et les
         pages garderaient un plan que personne ne sert plus. */
      const v = r.headers.get("X-Version");
      const slug = new URL(adresse).searchParams.get("slug");
      if (v && slug) rangeLaVersion(cache, slug, v);
      return range(cache, cle, r, r.body, false);
    })
    // l'amont muet laisse l'entrée périmée en place : elle resservira
    .catch(() => {})
    .finally(() => _enVol.delete(cle));
}

/**
 * L'entête du plan : la version de ce qu'il porte, et rien d'autre.
 *
 * C'est elle qui rend le plan gardable pour de bon. Le plan lui-même part
 * désormais sous une adresse qui la contient, déclarée immuable : un visiteur
 * qui l'a déjà ne la redemande jamais, ni au relais ni à la base. Ne reste que
 * cette question-ci, à chaque ouverture de page — « est-ce toujours la
 * même ? » — et elle tient en cinquante octets là où le plan en pèse cinq cent
 * mille.
 *
 * La réponse sort du stockage sans réveiller la base. Quand elle n'y est pas,
 * on va chercher le plan une fois : cela le range, range sa version avec lui,
 * et les ouvertures suivantes ne coûtent plus rien. Le plan ainsi ramené n'est
 * pas rendu ici — la page le demandera à son adresse versionnée, seule à
 * pouvoir entrer dans son cache.
 */
async function entete(url, env, ctx) {
  const slug = url.searchParams.get("slug") || "";
  if (!SLUG.test(slug)) return dit({ erreur: "Paramètre slug absent ou invalide." }, 400);

  if (env.CACHE) {
    const v = await env.CACHE.get(cleVersion(slug)).catch(() => null);
    if (v) return ditVersion(v);
  }

  const amont = amontPour(new URLSearchParams({ slug }));
  const rep = await fetch(amont.toString()).catch(() => null);
  if (!rep || !rep.ok) {
    return dit({ erreur: "Plan indisponible." }, rep ? rep.status : 502);
  }
  const neuve = rep.headers.get("X-Version");
  if (gardable(env.CACHE, rep) && neuve) {
    ctx.waitUntil(range(env.CACHE, cleDe(amont), rep, rep.body, false));
    ctx.waitUntil(rangeLaVersion(env.CACHE, slug, neuve));
  } else {
    // rien à ranger : le corps ne doit pas rester en attente d'un lecteur
    rep.body?.cancel().catch(() => {});
  }
  return neuve ? ditVersion(neuve) : dit({ erreur: "Version absente." }, 502);
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
    /* Le plan, et ce que porte l'application installée : renommer un salon dans
       la console, y déposer une icône doivent se voir au même moment que le
       reste. */
    await Promise.all([
      env.CACHE.delete(cleDe(amontPour(new URLSearchParams({ slug })))),
      env.CACHE.delete(cleApp(slug)),
      /* Et la version : c'est elle que les pages interrogent, et la garder
         reviendrait à leur dire que rien n'a changé. Les plans rangés sous une
         version révolue restent, sans dommage — plus personne ne les demande,
         et ils s'effacent d'eux-mêmes. */
      env.CACHE.delete(cleVersion(slug)),
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

/* Le nom que porte l'application installée faute d'un autre : le salon
   d'abord, la marque en signature — « Plan SMCL by Event2Map ». */
const MARQUE = "Event2Map";
/* Un nom de salon tient en une ligne. Au-delà, ce n'est plus un nom, et rien
   ne l'afficherait de toute façon : les systèmes coupent bien avant. */
const NOM_MAX = 64;
/* L'empreinte que la base calcule de l'icône du salon. Elle entre dans une
   adresse servie à tous : on ne pose dans le manifeste que ce qui en a la
   forme. */
const EMPREINTE = /^[0-9a-f]{8,32}$/;

/** Où l'on garde ce que porte l'application d'un salon. Le rang change quand ce
 *  qui est rangé dessous ne vaut plus : les entrées d'avant vivent leur vie et
 *  s'effacent seules, sans que personne ait à les attendre. */
const cleApp = (slug) => "app2:" + slug;

/* Combien de temps on garde ce que porte l'application — son nom, l'empreinte
   de son icône. Bien moins que le plan, et pour une raison qui n'a rien à voir
   avec le poids : c'est ce que l'exploitant change d'un geste, puis regarde
   aussitôt. L'oubli demandé en fin d'enregistrement reste le chemin normal ;
   ces minutes-ci sont le filet, pour le jour où cet appel n'aboutit pas — sans
   elles, une icône déposée pouvait n'arriver que le lendemain. Le coût est une
   lecture de deux colonnes par salon et par quart d'heure. */
const TTL_APP = 900;

/**
 * L'adresse d'un salon, celle que son application installée ouvre — et la
 * seule qu'elle ait le droit d'ouvrir.
 *
 * Le paramètre `?plan=` ne pouvait pas servir à cela. La portée d'un manifeste
 * ne connaît que des chemins : une adresse en est ou n'en est pas selon ce
 * qu'il y a avant le point d'interrogation, et le reste ne compte pour rien.
 * Tous les salons partageant le chemin `/plan`, l'application installée pour
 * l'un revendiquait la racine du domaine, donc tout le site — et le système
 * lui donnait le plan de n'importe quel autre salon, la console comprise.
 *
 * Chaque salon a donc son chemin, d'un seul segment comme `/plan` : les
 * adresses relatives de la page — son manifeste, ses icônes, son service de
 * second plan — s'y résolvent exactement pareil, et rien d'autre n'a bougé.
 *
 * Reste ce qu'un préfixe partagé ne sait pas séparer : deux salons dont l'un
 * des noms commence par l'autre — `fep27` et `fep27-bis` — tombent dans la
 * même portée, l'un attrapant les adresses de l'autre. C'est le cas d'avant,
 * réduit à deux noms qui se ressemblent.
 */
const cheminDuSalon = (slug) => "/plan-" + slug;
/* Ce que la page rend à ce chemin. Le nom du salon y répond aux mêmes règles
   que partout : `SLUG` plus bas dit lesquelles. */
const CHEMIN_SALON = /^\/plan-([a-z0-9][a-z0-9-]{0,63})$/;

/**
 * La page d'un salon, servie à son adresse à lui.
 *
 * C'est le même fichier qu'à `/plan` — la page y lit son salon dans le chemin
 * plutôt que dans le paramètre (`_js.html` `SLUG`). Rien n'est fabriqué par
 * salon, ni ici ni dans `web/`.
 *
 * Ce chemin-ci n'arrive jusqu'au script que faute de fichier à ce nom : une
 * page de `web/` garde son adresse, et `plan-admin` comme `plan-smcl` sont
 * servies avant que rien de ceci ne tourne. Un salon qui porterait l'un de ces
 * deux noms n'aurait donc pas la sienne.
 */
const pageDuSalon = (requete, env) =>
  env.ASSETS.fetch(new Request(new URL("/plan", requete.url).toString(), { method: "GET" }));

/**
 * Ce que porte l'application installée du salon : son nom, et son icône.
 *
 * Le manifeste est lu avant que la page ait appelé l'API : elle ne peut pas y
 * écrire le nom du salon, elle ne le sait pas encore. Elle nomme donc le slug,
 * et c'est d'ici que le reste vient — d'une lecture à part, qui ne rend que
 * quatre colonnes là où le plan entier pèse ses stands, ses zones et son icône
 * d'onglet. On ne s'en sert que pour nommer et pour habiller : ce que le
 * système ouvrira, `start_url`, continue de sortir de ce que la page a demandé.
 *
 * L'icône n'est pas ramenée, seule son empreinte : le manifeste la désigne par
 * une adresse, et c'est `iconeApp` qui la sert. Deux images de cinq cents
 * pixels dans cette lecture-ci auraient traversé le réseau à chaque manifeste
 * demandé, pour finir dans un fichier qui n'en porte que les adresses.
 *
 * Gardé peu de temps, et tout de suite oublié quand l'administration
 * enregistre : c'est ce qu'un exploitant change puis regarde aussitôt. Un salon
 * qu'on ne sait pas nommer — inconnu, brouillon, base muette — n'est pas gardé :
 * le cache ne doit pas retenir l'absence, et un slug inventé n'y écrit donc
 * rien.
 */
async function appDuSalon(slug, env, ctx) {
  const cle = cleApp(slug);
  if (env.CACHE) {
    const garde = await env.CACHE.get(cle, { type: "json" }).catch(() => null);
    if (garde && garde.nom) return garde;
  }
  const rep = await fetch(AMONT + "?slug=" + encodeURIComponent(slug) + "&app=1")
    .catch(() => null);
  if (!rep || !rep.ok) return null;
  const corps = await rep.json().catch(() => null);
  const nom = String(corps?.evenement ?? "").trim().slice(0, NOM_MAX);
  if (!nom) return null;
  const empreinte = String(corps?.icone ?? "");
  const app = {
    nom,
    /* Le nom que l'exploitant a écrit, borné comme celui du salon : c'est lui
       qui l'emporte, et vide c'est le tour de phrase d'ici qui vaut. */
    choisi: String(corps?.app ?? "").trim().slice(0, NOM_MAX),
    icone: EMPREINTE.test(empreinte) ? empreinte : "",
  };
  if (env.CACHE) {
    ctx.waitUntil(env.CACHE.put(cle, JSON.stringify(app), { expirationTtl: TTL_APP })
      .catch(() => {}));
  }
  return app;
}

/**
 * Les icônes du salon, telles que le manifeste les déclare.
 *
 * Deux entrées pour deux façons de poser une icône : telle quelle, et rognée à
 * la forme du système par Android — l'image de la seconde garde ses bords
 * libres, sans quoi le rognage y mange le logo. Elles sortent du même fichier
 * déposé (`_application.html`), et la base en tient les deux versions.
 *
 * Une seule taille déclarée, et c'est la vraie : cinq cent douze pixels, ce
 * qu'un système demande au plus et bien au-delà du minimum qui rend une page
 * installable. Annoncer la même image en 192 pour faire nombre aurait été
 * déclarer une taille qu'elle n'a pas.
 *
 * L'empreinte dans l'adresse n'est pas un ornement : c'est elle qui fait
 * qu'une icône remplacée se voit. Le navigateur d'un visiteur qui a déjà
 * installé le plan relit le manifeste, y trouve une adresse qu'il ne connaît
 * pas, et va chercher l'image — là où une adresse fixe lui aurait laissé
 * l'ancienne, gardée pour toujours puisqu'elle est déclarée immuable.
 */
function iconesDuSalon(slug, empreinte) {
  const adresse = (masque) => "/api/icone?salon=" + encodeURIComponent(slug) +
    (masque ? "&masque=1" : "") + "&v=" + empreinte;
  return [
    { src: adresse(false), sizes: "512x512", type: "image/png", purpose: "any" },
    { src: adresse(true), sizes: "512x512", type: "image/png", purpose: "maskable" },
  ];
}

/**
 * Le manifeste, complété du salon d'où l'on installe : son nom, ses icônes,
 * l'adresse que l'application rouvrira et celles qu'elle a le droit d'ouvrir.
 *
 * Une même page sert tous les salons — `?plan=` tranche — et le manifeste, lui,
 * est fabriqué une fois pour toutes : l'application installée depuis un salon
 * rouvrait donc celui d'un autre, sous le nom du produit. Le laisser sans
 * adresse de départ, comme la spécification l'autorise, revenait à n'être plus
 * installable du tout : Chromium refuse une adresse qu'il n'a pas encore
 * remplacée.
 *
 * Le fichier construit est donc repris tel quel, et rien n'y change que le nom,
 * les icônes, et le territoire du salon. Un manifeste à tenir, aucun à
 * fabriquer par salon.
 *
 * Rien n'arrive de l'extérieur que le nom du salon, et il n'entre pas tel quel
 * non plus : il est vérifié, puis il sert à chercher — le nom de l'application
 * en base, et l'adresse du salon, composée ici (`cheminDuSalon`). Un lien
 * fabriqué ne peut donc faire poser sur un écran d'accueil ni une application
 * au nom qu'il aurait choisi, ni une application qui ouvrirait autre chose.
 *
 * Le tour de phrase est écrit ici, et nulle part ailleurs : le salon d'abord,
 * c'est lui qu'on cherche du regard, et la marque en signature. Il ne sert
 * qu'à défaut : un salon qui a écrit le nom de son application le porte tel
 * quel, et un salon qui a déposé son logo remplace du même coup les icônes du
 * produit (`_application.html`).
 *
 * Un fichier de `web/` est servi avant que ce script ne tourne : sans le
 * `run_worker_first` de `wrangler.jsonc`, ce chemin-ci ne viendrait jamais
 * jusqu'ici, et le manifeste partirait tel quel sans que rien ne le dise.
 */
async function manifeste(requete, env, ctx) {
  const fichier = new URL("/manifeste.webmanifest", requete.url);
  const rep = await env.ASSETS.fetch(new Request(fichier.toString(), { method: "GET" }));
  const salon = new URL(requete.url).searchParams.get("salon") || "";
  if (!rep.ok) return rep;

  const contenu = await rep.json().catch(() => null);
  if (!contenu) return rep;
  /* Ce que le système ouvrira, et ce qu'il tiendra pour le territoire de
     l'application : l'adresse du salon, et elle seule. Les trois se déduisent
     du nom du salon, dont la page ne donne que le nom — rien n'est reçu ni à
     vérifier, et un lien fabriqué ne peut pas faire poser une application qui
     ouvrirait autre chose.

     `id` est écrit, quand il vaudrait `start_url` de toute façon : c'est sous
     lui que le navigateur reconnaît une application déjà posée, et le laisser
     se déduire, c'était le voir changer le jour où l'adresse de départ change. */
  if (SLUG.test(salon)) {
    contenu.start_url = cheminDuSalon(salon);
    contenu.scope = cheminDuSalon(salon);
    contenu.id = cheminDuSalon(salon);
  }
  /* Le contrôle du slug n'est pas décoratif non plus : il construit une clé de
     cache, et part en amont. Muet sur un salon qu'on ne sait pas nommer, le
     manifeste garde le nom et les icônes du produit — mieux vaut une
     application mal nommée qu'une application qui ne s'installe pas. */
  const app = SLUG.test(salon) ? await appDuSalon(salon, env, ctx) : null;
  if (app) {
    contenu.name = app.choisi || "Plan " + app.nom + " by " + MARQUE;
    /* Ce que le système écrit sous l'icône : le salon seul, faute de mieux —
       le reste du tour de phrase n'y tiendrait pas. Un nom écrit par
       l'exploitant, lui, est déjà celui qu'il veut y lire. */
    contenu.short_name = app.choisi || app.nom;
    if (app.icone) contenu.icons = iconesDuSalon(salon, app.icone);
  }
  /* L'application se nomme elle-même dans `related_applications`, et c'est ce
     qui permet à la page de savoir, plus tard, qu'elle est installée
     (`outils/pwa.js`, `_installation.html`). Encore faut-il qu'elle s'y nomme
     par l'adresse exacte de ce manifeste-ci : le navigateur retient
     l'application sous l'adresse d'où elle a été posée, paramètres compris, et
     l'adresse nue du fichier construit ne désigne alors aucune application
     installée. C'est donc ici qu'elle s'écrit, où la requête la porte. */
  if (Array.isArray(contenu.related_applications)) {
    contenu.related_applications = contenu.related_applications.map(parente =>
      parente && parente.platform === "webapp"
        ? { ...parente, url: requete.url } : parente);
  }
  /* Ce manifeste-ci n'est plus le fichier fabriqué : il porte le nom et les
     icônes que le salon s'est choisis, et ceux-là changent le jour où
     l'exploitant les change. Un jour de cache, qui allait de soi tant que ce
     fichier ne bougeait qu'avec une mise en ligne, lui faisait alors installer
     l'ancienne icône sans que rien ne le dise — et sans moyen d'en sortir, le
     navigateur ne revenant même pas demander.

     Il se relit donc à chaque fois, mais ne se retélécharge que s'il a changé :
     l'étiquette est l'empreinte de ce qui part, et une page déjà venue reçoit
     trois lignes d'en-tête au lieu de sept cents octets. Les icônes, elles,
     gardent leur éternité — leur adresse porte leur empreinte. */
  const corps = JSON.stringify(contenu);
  const etiquette = '"' + await condense(corps, 8) + '"';
  const entetes = {
    "Content-Type": "application/manifest+json; charset=utf-8",
    "Cache-Control": "no-cache",
    "ETag": etiquette,
  };
  if (requete.headers.get("If-None-Match") === etiquette) {
    return new Response(null, { status: 304, headers: entetes });
  }
  return new Response(corps, { headers: entetes });
}

/**
 * L'icône de l'application d'un salon, relayée telle quelle.
 *
 * Le manifeste la désigne par cette adresse, et la page aussi — pour l'écran
 * d'accueil d'iOS, qui ne lit pas le manifeste, et pour la fenêtre qui invite
 * à installer. Deux images sous la même adresse, à un paramètre près :
 * `masque=1` rend celle qu'Android rogne à sa forme.
 *
 * Rien n'est gardé ici, et c'est réfléchi : une icône n'est lue qu'à
 * l'installation, une poignée de fois par salon, là où le plan l'est à chaque
 * ouverture de page. L'aller-retour jusqu'à la fonction ne coûte donc qu'à
 * celui qui installe, et l'adresse porte l'empreinte de l'image : le
 * navigateur, lui, la garde pour toujours et ne revient pas.
 *
 * L'empreinte n'est pas vérifiée — elle ne désigne rien en base, c'est la
 * colonne qui fait foi — mais son absence se paie : sans elle, l'adresse peut
 * changer de contenu, et rien ne doit alors la garder.
 */
async function iconeApp(url) {
  const nu = { "Cache-Control": "no-store" };
  const salon = url.searchParams.get("salon") || "";
  if (!SLUG.test(salon)) {
    return new Response("Paramètre salon absent ou invalide.", { status: 400, headers: nu });
  }
  const amont = AMONT + "?slug=" + encodeURIComponent(salon) + "&icone=1" +
    (url.searchParams.get("masque") ? "&masque=1" : "");
  const rep = await fetch(amont).catch(() => null);
  if (!rep) return new Response("Icône indisponible.", { status: 502, headers: nu });
  const versionnee = rep.ok && EMPREINTE.test(url.searchParams.get("v") ?? "");
  return new Response(rep.body, {
    status: rep.status,
    headers: {
      "Content-Type": rep.headers.get("Content-Type") || "image/png",
      "Cache-Control": versionnee ? "public, max-age=31536000, immutable" : "no-store",
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
    /* Les rappels de conférence prennent le même chemin, pour la même raison :
       l'origine de la page, et rien à reconfigurer si le domaine change. */
    if (url.pathname === "/api/rappels" || url.pathname === "/api/rappels/cle") {
      return rappels(requete, url);
    }
    // l'administration vient d'enregistrer : ce qu'on gardait ne vaut plus
    if (url.pathname === "/api/oublie") return oublie(requete, env);
    if (url.pathname !== "/api/plan") return env.ASSETS.fetch(requete);
    /* La question que chaque ouverture de page pose, et la seule : le plan
       a-t-il changé. Elle se répond du stockage, sans rien relayer. */
    if (url.searchParams.get("entete")) return entete(url, env, ctx);
    if (requete.method !== "GET" && requete.method !== "HEAD") {
      return new Response("Méthode non permise", { status: 405 });
    }

    const amont = amontPour(url.searchParams);
    /* Une vignette de logo ne pend d'aucun salon : elle est nommée par
       l'empreinte de l'adresse d'où elle vient, et c'est tout ce qu'il faut
       pour la rendre. Exiger un slug ici obligerait la page à en porter un
       dans chaque adresse d'image, pour rien. */
    if (!amont.searchParams.get("slug") && !amont.searchParams.get("vignette") &&
        !amont.searchParams.get("vignettes")) {
      return dit({ erreur: "Paramètre slug manquant." }, 400);
    }

    const jeton = requete.headers.get("Authorization");
    const cache = jeton ? null : env.CACHE;      // une identité contourne le cache
    // la clé ne retient que les paramètres attendus : deux adresses qui ne
    // diffèrent que par un paramètre parasite partagent la même entrée
    const cle = amont.searchParams.get("vignettes")
      ? await cleDeLot(amont)
      : cleDe(amont);
    /* Un lot de vignettes vaut celles qu'il porte : nommé par leurs clés, qui
       sont les empreintes de ce qu'elles montrent, il ne peut pas être périmé
       — et la fonction le dit elle-même, en ne déclarant public qu'un lot
       complet (voir `rendVignettes`). */
    const immuable = Boolean(amont.searchParams.get("fond") ||
                             amont.searchParams.get("vignette") ||
                             amont.searchParams.get("vignettes") ||
                             /* Le plan sous sa version en fait partie : son
                                adresse dit ce qu'elle contient, et la fonction
                                ne la déclare publique que si elle porte bien
                                la version qui se sert aujourd'hui. */
                             amont.searchParams.get("v"));

    const entetes = new Headers();
    if (jeton) entetes.set("Authorization", jeton);
    const apikey = requete.headers.get("apikey");
    if (apikey) entetes.set("apikey", apikey);

    if (cache) {
      /* Un stockage qui refuse — quota du jour épuisé, panne passagère — ne doit
         pas emporter la visite avec lui : on descend alors jusqu'à la source,
         comme si l'entrée manquait. C'est la règle que ce fichier suit partout
         ailleurs, et cette lecture-ci était la seule à l'enfreindre. */
      const garde = await cache.getWithMetadata(cle, { type: "stream" })
                               .catch(() => null);
      if (garde && garde.value) {
        const perime = Boolean(garde.metadata?.frais) &&
                       Date.now() > garde.metadata.frais;
        if (perime) {
          ctx.waitUntil(rafraichit(cache, cle, amont.toString(), entetes));
        }
        const entetes = {
          "Content-Type": garde.metadata?.ct || "application/json",
          "Cache-Control": garde.metadata?.cc || "public, max-age=60",
          "X-Cache": perime ? "stale" : "hit",
        };
        // la page compare ce qu'elle tient à ce qui se sert : elle doit la lire
        // sur une copie gardée comme sur une réponse fraîche
        if (garde.metadata?.v) entetes["X-Version"] = garde.metadata.v;
        return new Response(garde.value, { headers: entetes });
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
      /* La version se range à part, et depuis cet appel-ci seulement : c'est le
         plan sans version qui dit ce qui se sert aujourd'hui, celui qui en
         porte une disant seulement ce qu'il portait ce jour-là. */
      const v = reponse.headers.get("X-Version");
      const slug = amont.searchParams.get("slug");
      if (v && slug && !immuable) ctx.waitUntil(rangeLaVersion(cache, slug, v));
    }
    return sortie;
  },
};
