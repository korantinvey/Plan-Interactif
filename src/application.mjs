/**
 * L'application installée d'un salon : son adresse propre (`/plan-<salon>`),
 * son manifeste et son icône.
 *
 * Le manifeste est un fichier construit, mais le nom qu'il porte et l'adresse
 * qu'il fait rouvrir dépendent du salon d'où l'on installe : il passe donc par
 * ici, qui y écrit ce que la base sait du salon, gardé un quart d'heure dans le
 * stockage. `cleApp` est exportée pour que `/api/oublie` l'efface avec le plan.
 */
import { AMONT, SLUG, cacheDe, condense } from "./commun.mjs";

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
export const cleApp = (slug) => "app2:" + slug;

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
export const CHEMIN_SALON = /^\/plan-([a-z0-9][a-z0-9-]{0,63})$/;

/**
 * La page d'un salon, servie à son adresse à lui.
 *
 * C'est le même fichier qu'à `/plan` — la page y lit son salon dans le chemin
 * plutôt que dans le paramètre (`modules/salon.mjs` `SLUG`). Rien n'est fabriqué par
 * salon, ni ici ni dans `web/`.
 *
 * Ce chemin-ci n'arrive jusqu'au script que faute de fichier à ce nom : une
 * page de `web/` garde son adresse, et `plan-admin` comme `plan-smcl` sont
 * servies avant que rien de ceci ne tourne. Un salon qui porterait l'un de ces
 * deux noms n'aurait donc pas la sienne.
 */
export const pageDuSalon = (requete, env) =>
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
async function appDuSalon(slug, cache, ctx) {
  const cle = cleApp(slug);
  if (cache) {
    const garde = await cache.get(cle, { type: "json" }).catch(() => null);
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
  if (cache) {
    ctx.waitUntil(cache.put(cle, JSON.stringify(app), { expirationTtl: TTL_APP })
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
 * déposé (`modules/reglage-application.mjs`), et la base en tient les deux versions.
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
 * produit (`modules/reglage-application.mjs`).
 *
 * Un fichier de `web/` est servi avant que ce script ne tourne : sans le
 * `run_worker_first` de `wrangler.jsonc`, ce chemin-ci ne viendrait jamais
 * jusqu'ici, et le manifeste partirait tel quel sans que rien ne le dise.
 */
export async function manifeste(requete, env, ctx) {
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
  const app = SLUG.test(salon)
    ? await appDuSalon(salon, cacheDe(env, new URL(requete.url)), ctx) : null;
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
     (`outils/pwa.js`, `modules/installation.mjs`). Encore faut-il qu'elle s'y nomme
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
export async function iconeApp(url) {
  const nu = { "Cache-Control": "no-store" };
  const salon = url.searchParams.get("salon") || "";
  if (!SLUG.test(salon)) {
    return new Response("Paramètre salon absent ou invalide.", { status: 400, headers: nu });
  }
  const v = url.searchParams.get("v") ?? "";
  const amont = AMONT + "?slug=" + encodeURIComponent(salon) + "&icone=1" +
    (url.searchParams.get("masque") ? "&masque=1" : "") +
    // la version suit jusqu'à la fonction, qui ne promet l'immuable qu'avec elle
    (EMPREINTE.test(v) ? "&v=" + encodeURIComponent(v) : "");
  const rep = await fetch(amont).catch(() => null);
  if (!rep) return new Response("Icône indisponible.", { status: 502, headers: nu });
  /* La fonction sait si l'icône servie est bien celle de la version demandée,
     et si la demande venait d'un exploitant : son « Cache-Control » fait foi. */
  const versionnee = rep.ok && EMPREINTE.test(url.searchParams.get("v") ?? "") &&
    /immutable/.test(rep.headers.get("Cache-Control") || "");
  return new Response(rep.body, {
    status: rep.status,
    headers: {
      "Content-Type": rep.headers.get("Content-Type") || "image/png",
      "Cache-Control": versionnee ? "public, max-age=31536000, immutable" : "no-store",
    },
  });
}
