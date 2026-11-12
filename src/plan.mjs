/**
 * Le plan d'un salon : relais de `/api/plan` vers la fonction `plan-public`,
 * gardé dans le stockage KV, et ce qui le fait oublier (`/api/oublie`).
 *
 * C'est la raison d'être du Worker (voir l'en-tête de `index.mjs`) : la
 * première visite paie l'aller-retour jusqu'à la base, les suivantes sont
 * servies du stockage. Une entrée périmée est servie pendant qu'on la refait
 * derrière, pour que l'ouverture d'un salon ne renvoie pas toutes les visites
 * de la même seconde jusqu'à la base. `entete` répond, sans rien relayer, à la
 * question que pose chaque ouverture de page : le plan a-t-il changé.
 */
import { BASE, AMONT, SLUG, dit, condense, cacheDe } from "./commun.mjs";
import { cleApp } from "./application.mjs";

/* Oublier n'est pas anonyme : on vérifie la session auprès du même projet que
   celui dont on relaie les fonctions — l'adresse en est déduite, pour qu'un
   changement de projet n'ait qu'un seul endroit à changer. */
const AUTH = BASE.replace("/functions/v1/", "/auth/v1/") + "user";
const PARAMS = ["slug", "fond", "v", "vignette", "vignettes", "grande"];


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

/* La version de ce que le plan porte, rangée à part.
   L'entête la lit à chaque ouverture de page : la prendre dans la métadonnée du
   plan obligerait à en relire les cinq cents kilo-octets pour en tirer seize
   signes, et c'est précisément le temps qu'on cherche à rendre. Elle est écrite
   avec le plan et refaite avec lui — voir `oublie`.

   Elle est fraîche un jour : un changement de ce que la fonction produit — une
   mise à jour du code, sans que personne n'enregistre — restait sinon
   invisible, et la galerie traversable de FUNEXPO n'arrivait pas aux
   visiteurs. Mais elle se garde la semaine, comme le plan : quand elle
   disparaissait au bout du jour, la visite qui la trouvait absente attendait
   que la base refasse le plan entier pour apprendre cinquante octets — 2,8 et
   5,8 secondes sur la démo, relevées par la sonde en octobre. Passé son jour,
   elle est donc servie encore une fois et se refait derrière (`entete`).

   `depuis` est l'instant où l'on a demandé le plan qui la porte. Deux
   reconstructions peuvent se croiser — un enregistrement toutes les quelques
   secondes, chacun suivi de la sienne (`oublie`) — et celle partie la
   première, si elle finit la dernière, rangerait la version d'avant : elle
   resterait annoncée jusqu'au lendemain. On ne remplace donc jamais une
   version par une autre tirée d'un plan demandé plus tôt.

   Le « 2 » force chaque salon à la redemander au déploiement de ce relais :
   les entrées d'avant, gardées pour une semaine, taisaient justement ce
   changement. */
const cleVersion = (slug) => "ver2:" + slug;

/** La version qu'on garde, et l'instant où son plan a été demandé — `null` si rien. */
const versionGardee = (cache, slug) =>
  cache.getWithMetadata(cleVersion(slug)).catch(() => null);

/** Range la version à côté du plan, sauf si l'on tient déjà plus récent. */
async function rangeLaVersion(cache, slug, v, depuis) {
  const la = await versionGardee(cache, slug);
  if (la && la.value && (la.metadata?.depuis || 0) > depuis) return;
  await cache.put(cleVersion(slug), v, {
    expirationTtl: GARDE,
    metadata: { depuis, frais: depuis + TTL_PLAN * 1000 },
  }).catch(() => {});
}

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

/** Range le plan sans version qu'on vient de redemander, et sa version avec lui.
 *  Faux si un plan demandé après celui-ci est déjà rangé : ce qu'on tient est
 *  plus ancien, et le ranger effacerait le sien. */
async function rangeLePlan(cache, cle, slug, r, depuis) {
  const la = slug ? await versionGardee(cache, slug) : null;
  if (la && la.value && (la.metadata?.depuis || 0) > depuis) {
    r.body?.cancel().catch(() => {});
    return false;
  }
  /* Le plan qu'on vient de refaire ne porte pas forcément la même version :
     sans ce geste, l'entête continuerait d'annoncer celle d'avant, et les
     pages garderaient un plan que personne ne sert plus. */
  const v = r.headers.get("X-Version");
  if (v && slug) await rangeLaVersion(cache, slug, v, depuis);
  await range(cache, cle, r, r.body, false);
  return true;
}

/** Refait une entrée périmée, sans faire attendre la visite qui l'a trouvée. */
function rafraichit(cache, cle, adresse, entetes) {
  if (_enVol.has(cle)) return Promise.resolve();
  _enVol.add(cle);
  const depuis = Date.now();
  return fetch(adresse, { headers: entetes })
    .then((r) => gardable(cache, r)
      ? rangeLePlan(cache, cle, new URL(adresse).searchParams.get("slug"), r, depuis)
      : null)
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
export async function entete(url, env, ctx) {
  const slug = url.searchParams.get("slug") || "";
  if (!SLUG.test(slug)) return dit({ erreur: "Paramètre slug absent ou invalide." }, 400);

  const amont = amontPour(new URLSearchParams({ slug }));
  const cache = cacheDe(env, url);
  if (cache) {
    const la = await versionGardee(cache, slug);
    if (la && la.value) {
      /* Passée son jour, elle se sert encore et se refait derrière : c'est le
         plan entier qu'il faut redemander pour la connaître. Une entrée d'avant
         sans métadonnée compte pour périmée. */
      if (!(Date.now() <= la.metadata?.frais)) {
        ctx.waitUntil(rafraichit(cache, cleDe(amont), amont.toString(), new Headers()));
      }
      return ditVersion(la.value);
    }
  }

  const depuis = Date.now();
  const rep = await fetch(amont.toString()).catch(() => null);
  if (!rep || !rep.ok) {
    return dit({ erreur: "Plan indisponible." }, rep ? rep.status : 502);
  }
  const neuve = rep.headers.get("X-Version");
  if (gardable(cache, rep) && neuve) {
    ctx.waitUntil(range(cache, cleDe(amont), rep, rep.body, false));
    ctx.waitUntil(rangeLaVersion(cache, slug, neuve, depuis));
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
 * La page le demande donc en finissant d'enregistrer. Ce n'est pas anonyme :
 * il faut présenter une session de ce projet, sans quoi ce chemin serait un
 * moyen de faire travailler la base en boucle. Le fond de plan n'est pas
 * concerné : son adresse porte sa version, et l'apparence entre dedans.
 *
 * Oublier, ce n'est plus effacer : c'est refaire. Effacé, le plan laissait la
 * visite suivante attendre que la base le reconstruise pour qu'un entête de
 * cinquante octets lui réponde — 0,8 seconde en médiane, jusqu'à cinq, relevées
 * par la sonde pendant qu'on éditait FEP27. Le relais le redemande donc
 * lui-même, avant de répondre : l'administration n'attend pas cette réponse.
 * Réécrire coûte autant d'écritures au stockage qu'effacer, quand une visite
 * devait ensuite tout ranger de nouveau ; et l'enregistrement automatique en
 * appelle une à chaque repos de l'exploitant. Pendant la reconstruction, la
 * version d'avant reste annoncée : quelques secondes, sous les trente que
 * l'entête se garde déjà chez le visiteur.
 */
export async function oublie(requete, env) {
  if (requete.method !== "POST") {
    return new Response("Méthode non permise", { status: 405 });
  }
  const url = new URL(requete.url);
  const slug = url.searchParams.get("slug") || "";
  if (!SLUG.test(slug)) return dit({ erreur: "Paramètre slug absent ou invalide." }, 400);

  const jeton = requete.headers.get("Authorization");
  const apikey = requete.headers.get("apikey");
  if (!jeton || !apikey) return dit({ erreur: "Session absente." }, 401);
  const qui = await fetch(AUTH, { headers: { "Authorization": jeton, apikey } })
    .catch(() => null);
  if (!qui || !qui.ok) return dit({ erreur: "Session refusée." }, 401);

  /* Une prévisualisation n'oublie que ce qu'elle garde elle-même : enregistrer
     depuis elle ne touche plus au cache de la production. */
  const cache = cacheDe(env, url);
  if (cache) {
    const amont = amontPour(new URLSearchParams({ slug }));
    const depuis = Date.now();
    const rep = await fetch(amont.toString()).catch(() => null);
    const v = rep && rep.headers.get("X-Version");
    /* Le plan refait, et sa version avec lui : les plans rangés sous une
       version révolue restent, sans dommage — plus personne ne les demande,
       et ils s'effacent d'eux-mêmes. Ce que porte l'application installée
       s'efface, lui, et se refait à la demande : renommer un salon dans la
       console, y déposer une icône doivent se voir au même moment que le
       reste. */
    const refait = rep && v && gardable(cache, rep)
      ? [rangeLePlan(cache, cleDe(amont), slug, rep, depuis)]
      /* La base n'a pas rendu de plan public : on efface comme avant, plutôt
         que de laisser annoncer une version que l'exploitant vient de
         dépasser. */
      : (rep?.body?.cancel().catch(() => {}),
         [cache.delete(cleDe(amont)), cache.delete(cleVersion(slug))]);
    await Promise.all([...refait, cache.delete(cleApp(slug))])
      .catch(() => {});   // un cache en panne ne doit pas faire échouer l'oubli
  }
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}

/** Le chemin `/api/plan` : servi du stockage s'il le tient, sinon relayé et rangé. */
export async function relaiePlan(requete, env, ctx, url) {
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
      !amont.searchParams.get("vignettes") && !amont.searchParams.get("grande")) {
    return dit({ erreur: "Paramètre slug manquant." }, 400);
  }

  const jeton = requete.headers.get("Authorization");
  /* Une identité contourne le cache. La grande vignette d'un logo aussi :
     demandée une à une, par les seuls toits vus de près, elle aurait coûté
     une écriture du stockage par logo — et il n'en accepte que mille par
     jour. Elle se garde chez le visiteur, au navigateur et au service worker,
     où elle ne périme jamais. */
  const cache = jeton || amont.searchParams.get("grande") ? null : cacheDe(env, url);
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
      /* Sous un autre nom que les en-têtes de la demande : redéclarés ici, ils
         masquaient ceux que le rafraîchissement juste au-dessus emporte, et
         une entrée périmée faisait lever le Worker (erreur 1101) au lieu
         d'être servie — le plan sans version ne se refaisait plus. */
      const servis = {
        "Content-Type": garde.metadata?.ct || "application/json",
        "Cache-Control": garde.metadata?.cc || "public, max-age=60",
        "X-Cache": perime ? "stale" : "hit",
      };
      // la page compare ce qu'elle tient à ce qui se sert : elle doit la lire
      // sur une copie gardée comme sur une réponse fraîche
      if (garde.metadata?.v) servis["X-Version"] = garde.metadata.v;
      return new Response(garde.value, { headers: servis });
    }
  }

  const depuis = Date.now();
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
    if (v && slug && !immuable) ctx.waitUntil(rangeLaVersion(cache, slug, v, depuis));
  }
  return sortie;
}
