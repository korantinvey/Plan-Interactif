/**
 * Ce que les pages font remonter : mesures d'usage (`/api/mesure`), erreurs
 * (`/api/erreur`) et relevés de performance (`/api/sonde`).
 *
 * Trois allers simples, sans identité et sans cache, vers les portes publiques
 * de la base. Les erreurs et les gels sont ramenés à leur module et à leur
 * ligne par la carte de correspondance du script servi (`carte.mjs`), avant
 * d'être écrits. Rien ne part d'une prévisualisation vers la production.
 */
import { VERSION_DES_PAGES, PROJET } from "./pages.mjs";
import { lisCarte, source } from "./carte.mjs";
import { BASE, CORS_MESURE, ecritEnProduction, ecartee } from "./commun.mjs";

const MESURE = BASE + "mesure";

/* Un paquet de mesures pèse quelques centaines d'octets. Au-delà, ce n'est
   plus une visite qu'on décrit : on refuse sans même relayer. */
const MESURE_MAX = 4096;

/**
 * Les mesures : un aller simple, sans identité et sans cache.
 *
 * Elles vont droit à la base, par son interface REST, et non plus par la
 * fonction `mesure`. Un essai de charge l'a décidé : à cent paquets par
 * seconde, six sur dix n'arrivaient pas en trente secondes — non que la base
 * peinait à écrire, mais parce que chaque paquet réveillait une fonction dont
 * le seul travail était d'appeler la base. La porte `mesure_publique` borne
 * le paquet elle-même (migration `la_porte_publique_des_mesures`) : la clé
 * publique qui l'ouvre circule dans chaque page, rien ne doit donc tenir à ce
 * que le Worker filtre avant elle.
 *
 * La fonction reste le repli : quand la porte manque — le Worker et la base ne
 * se déploient pas au même instant — ou qu'elle flanche. Un paquet refusé à
 * tort serait perdu, la page ne réessayant pas un refus. Le prix de ce choix :
 * une base qui écrit puis répond au-delà du délai verra son paquet compté une
 * seconde fois par la fonction. Rare, et un geste de trop vaut mieux qu'une
 * visite perdue.
 */
const PORTE_MESURES = BASE.replace("/functions/v1/", "/rest/v1/rpc/") + "mesure_publique";
/* La clé « publishable » : faite pour circuler, c'est celle de `config.js`.
   Ce qui protège la base, ce sont ses droits, pas le secret de cette clé. */
const CLE_PUBLIQUE = PROJET.cle;

export async function mesure(requete) {
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
  if (ecritEnProduction(new URL(requete.url))) return ecartee(CORS_MESURE);
  const repond = (status, erreur) => new Response(
    erreur ? JSON.stringify({ erreur }) : null,
    { status, headers: { ...CORS_MESURE, "Content-Type": "application/json", "Cache-Control": "no-store" } });

  let paquet;
  try { paquet = JSON.parse(corps); } catch { paquet = null; }
  if (!paquet || typeof paquet !== "object") return repond(400, "Corps illisible.");

  /* Les types seulement : la base attend un booléen et un entier, et refuserait
     le paquet entier pour un `recul` en texte. Le reste se borne là-bas. */
  const recul = Math.round(Number(paquet.recul));
  const parametres = {
    p_slug: String(paquet.slug ?? ""),
    p_visiteur: String(paquet.visiteur ?? ""),
    p_gestes: Array.isArray(paquet.gestes) ? paquet.gestes : [],
    p_support: String(paquet.support ?? ""),
    // `retenu` ne vaut faux que dit faux : une page d'avant ne l'envoie pas
    p_retenu: paquet.retenu !== false,
    p_recul: Number.isFinite(recul) && recul > 0 ? Math.min(recul, 90 * 86400) : 0,
  };

  const base = await fetch(PORTE_MESURES, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: CLE_PUBLIQUE },
    body: JSON.stringify(parametres),
    signal: AbortSignal.timeout(10000),
  }).catch(() => null);

  if (base && base.ok) {
    const pris = await base.json().catch(() => null);
    return pris === false ? repond(404, "Événement introuvable ou non publié.") : repond(204);
  }
  // un paquet que la porte juge mal formé ne passera pas mieux par la fonction
  if (base && base.status === 400) {
    const e = await base.json().catch(() => ({}));
    if (e && e.code === "22023") return repond(400, "Paramètres manquants.");
  }

  /* le repli : la porte absente, en panne, ou muette. Il sert quand quelque
     chose ne va pas : la fonction peut l'être aussi. Borné dans le temps, et
     son échec rendu avec les en-têtes CORS — sans eux, une coque ou un cadre
     d'une autre origine ne lisait qu'une erreur CORS. */
  const reponse = await fetch(MESURE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: corps,
    signal: AbortSignal.timeout(10000),
  }).catch(() => null);
  if (!reponse) return repond(502, "Mesure indisponible.");
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
 * Relais des erreurs des pages (`modules/erreurs.mjs`).
 *
 * La page dit où son script a planté, en position minifiée : « plan.<…>.js,
 * ligne 1, colonne 182 345 ». C'est ici, et non dans la console qui les
 * lira, que cette position redevient un module et une ligne : chaque
 * construction efface les scripts et les cartes d'avant, si bien que la carte
 * d'une erreur n'existe que tant que sa version est en ligne — c'est-à-dire
 * maintenant. Elle se lit dans les fichiers servis (`env.ASSETS`), une fois
 * par version et par instance du Worker.
 *
 * Même origine que la page, et rien d'autre : une erreur ne se signale que de
 * nos propres pages. Ce qui s'écrit est borné par la porte SQL
 * (`erreur_publique`) ; le Worker n'y ajoute que la lecture de la carte et le
 * numéro de la construction en ligne. Rien sur le visiteur — ni jeton, ni
 * adresse, ni agent utilisateur — ne part vers la base.
 */
const PORTE_ERREURS = BASE.replace("/functions/v1/", "/rest/v1/rpc/") + "erreur_publique";
const ERREUR_MAX = 8192;
/* Le script d'une page du plan, tel qu'il est servi : seul lui a une carte. */
const SCRIPT_DU_PLAN = /^\/versions\/(plan|plan-admin)\.[0-9a-f]{10}\.js$/;
const CARTES = new Map();

async function carteDuScript(chemin, env, origine) {
  if (!CARTES.has(chemin)) {
    CARTES.set(chemin, (async () => {
      const r = await env.ASSETS.fetch(new Request(new URL(chemin + ".map", origine).toString()));
      return r.ok ? lisCarte(await r.json()) : null;
    })().catch(() => null));
    // une instance vit longtemps : on n'y garde que les cartes du moment
    if (CARTES.size > 4) CARTES.delete(CARTES.keys().next().value);
  }
  return CARTES.get(chemin);
}

/** L'endroit d'une erreur : module et ligne si la carte le dit, sinon le fichier servi. */
async function lieuDe(e, env, origine) {
  let chemin = "";
  try { chemin = new URL(String(e.fichier || ""), "https://pages").pathname; } catch { /* illisible */ }
  const ligne = Math.trunc(Number(e.ligne)), colonne = Math.trunc(Number(e.colonne));
  if (!chemin) return "";
  if (SCRIPT_DU_PLAN.test(chemin) && ligne > 0 && colonne > 0) {
    const carte = await carteDuScript(chemin, env, origine);
    // la colonne d'un navigateur se compte de un, celle d'une carte de zéro
    const s = carte && source(carte, ligne, colonne - 1);
    if (s) return s.fichier + ":" + s.ligne;
  }
  return chemin.replace(/^\//, "") + (ligne > 0 ? ":" + ligne + (colonne > 0 ? ":" + colonne : "") : "");
}

export async function erreur(requete, env) {
  if (requete.method !== "POST") return new Response("Méthode non permise", { status: 405 });
  const origine = requete.headers.get("Origin");
  if (origine && origine !== new URL(requete.url).origin) return new Response(null, { status: 403 });
  const corps = await requete.text();
  if (corps.length > ERREUR_MAX) return new Response(null, { status: 413 });
  let paquet;
  try { paquet = JSON.parse(corps); } catch { paquet = null; }
  if (!paquet || typeof paquet !== "object" || !Array.isArray(paquet.erreurs)) {
    return new Response(null, { status: 400 });
  }
  if (ecritEnProduction(new URL(requete.url))) return ecartee({});
  const erreurs = await Promise.all(paquet.erreurs.slice(0, 5).map(async (e) => ({
    message: String((e && e.message) || "").slice(0, 300),
    lieu: e && typeof e === "object" ? await lieuDe(e, env, requete.url) : "",
  })));
  await fetch(PORTE_ERREURS, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: CLE_PUBLIQUE },
    body: JSON.stringify({
      p_slug: String(paquet.slug ?? ""),
      p_page: paquet.page === "admin" ? "admin" : "plan",
      p_version: VERSION_DES_PAGES,
      p_erreurs: erreurs,
    }),
    signal: AbortSignal.timeout(10000),
  }).catch(() => null);
  // la page n'attend rien : une erreur qui ne s'écrit pas ne se réessaie pas
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}

/**
 * Relais des relevés de performance (`modules/sonde.mjs`).
 *
 * Même porte que les erreurs, même origine seulement, et pour la même raison :
 * un relevé ne se signale que de nos propres pages. Deux différences. Le corps
 * se lit en texte sans exiger `application/json` — un `sendBeacon` sur une
 * chaîne part en `text/plain`. Et les gels arrivent avec une `position`, un
 * décalage en caractères dans le script servi : décoder 420 à 660 Ko sur un
 * téléphone qui vient de geler coûterait une tâche longue de plus, alors que
 * le Worker lit déjà ces fichiers pour les cartes. C'est donc ici que la
 * position devient une ligne et une colonne, puis un module (`lieuDe`).
 * Les erreurs que la visite a connues (`erreurs.mjs` `bilanErreurs`) arrivent
 * avec leur ligne et leur colonne dans le script servi, et repartent de même
 * avec leur module, comme celles du relais des erreurs.
 * La base borne le reste (`sonde_publique`, 4 Ko de résumé).
 */
const PORTE_SONDE = BASE.replace("/functions/v1/", "/rest/v1/rpc/") + "sonde_publique";
const SONDE_MAX = 6144;
const SCRIPTS = new Map();

/** Le texte d'un script servi, lu une fois : la position se compte dedans. */
async function texteDuScript(chemin, env, origine) {
  if (!SCRIPTS.has(chemin)) {
    SCRIPTS.set(chemin, (async () => {
      const r = await env.ASSETS.fetch(new Request(new URL(chemin, origine).toString()));
      return r.ok ? await r.text() : null;
    })().catch(() => null));
    // deux scripts au plus, plan et plan-admin : une instance vit longtemps
    if (SCRIPTS.size > 2) SCRIPTS.delete(SCRIPTS.keys().next().value);
  }
  return SCRIPTS.get(chemin);
}

/** Un gel tel que la base le garde : un lieu si le script le dit, sinon un nom de fichier nu. */
async function geleResolu(g, env, origine) {
  if (!g || typeof g !== "object") return null;
  const sortie = {
    ms: Number(g.ms) || 0,
    geste: String(g.geste ?? "").slice(0, 40),
    fonction: String(g.fonction ?? "").slice(0, 80),
  };
  /* Le moment du gel et ce que deck.gl a fait autour (`sonde.mjs`
     `travauxPendant`) : des nombres seulement, chacun borné — le corps vient
     d'une page, et la base les garde. */
  const entier = (x) => (Number.isFinite(x) && x >= 0 ? Math.min(Math.round(x), 1e9) : undefined);
  if (entier(g.t) !== undefined) sortie.t = entier(g.t);
  if (g.avantAffichage === true) sortie.avantAffichage = true;
  /* Comment le navigateur est entré dans le script — un mot de sa liste —, et
     où l'image a passé son temps (`sonde.mjs` `decoupe`). */
  if (typeof g.invocation === "string" && /^[a-z-]{1,24}$/.test(g.invocation)) sortie.invocation = g.invocation;
  for (const k of ["scriptsMs", "forceeMs", "renduMs", "miseEnPageMs"]) {
    if (entier(g[k]) !== undefined) sortie[k] = entier(g[k]);
  }
  if (g.travaux && typeof g.travaux === "object") {
    const travaux = {};
    for (const k of ["attrMs", "couches", "shaders", "programmes", "textures", "fenetreMs"]) {
      const v = entier(g.travaux[k]);
      if (v) travaux[k] = v;
    }
    sortie.travaux = travaux;
  }
  let chemin = "";
  try { chemin = new URL(String(g.fichier || ""), "https://pages").pathname; } catch { /* illisible */ }
  const position = g.position;
  if (SCRIPT_DU_PLAN.test(chemin) && Number.isInteger(position) && position >= 0) {
    const texte = await texteDuScript(chemin, env, origine);
    if (texte && position < texte.length) {
      // on compte les fins de ligne sans découper : le script pèse 500 Ko et plus,
      // et un découpage par gel allouerait autant de fois le préfixe
      let ligne = 1, debut = 0;
      for (let i = texte.indexOf("\n"); i >= 0 && i < position; i = texte.indexOf("\n", i + 1)) { ligne++; debut = i + 1; }
      // la colonne d'un navigateur se compte de un : `lieuDe` la rend à la carte
      const colonne = position - debut + 1;
      sortie.lieu = await lieuDe({ fichier: chemin, ligne, colonne }, env, origine);
      return sortie;
    }
  }
  sortie.fichier = chemin.split("/").pop().slice(0, 80);
  return sortie;
}

export async function sonde(requete, env) {
  if (requete.method !== "POST") return new Response("Méthode non permise", { status: 405 });
  const origine = requete.headers.get("Origin");
  if (origine && origine !== new URL(requete.url).origin) return new Response(null, { status: 403 });
  const corps = await requete.text();
  // 6 Ko d'octets, non de caractères : un « é » en pèse deux
  if (new TextEncoder().encode(corps).length > SONDE_MAX) return new Response(null, { status: 413 });
  let paquet;
  try { paquet = JSON.parse(corps); } catch { paquet = null; }
  if (!paquet || typeof paquet !== "object" || !paquet.resume || typeof paquet.resume !== "object" || Array.isArray(paquet.resume)) {
    return new Response(null, { status: 400 });
  }
  if (ecritEnProduction(new URL(requete.url))) return ecartee({});
  const resume = paquet.resume;
  if (resume.gels && Array.isArray(resume.gels.pires)) {
    const pires = await Promise.all(resume.gels.pires.slice(0, 3).map((g) => geleResolu(g, env, requete.url)));
    resume.gels.pires = pires.filter(Boolean);
  }
  if (resume.erreurs && typeof resume.erreurs === "object" && Array.isArray(resume.erreurs.premieres)) {
    resume.erreurs.premieres = await Promise.all(resume.erreurs.premieres.slice(0, 3)
      .filter((e) => e && typeof e === "object")
      .map(async (e) => ({ message: String(e.message ?? "").slice(0, 120), lieu: await lieuDe(e, env, requete.url) })));
  }
  await fetch(PORTE_SONDE, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: CLE_PUBLIQUE },
    body: JSON.stringify({
      p_slug: String(paquet.slug ?? ""),
      p_page: paquet.page === "borne" ? "borne" : "plan",
      p_version: VERSION_DES_PAGES,
      p_visite: String(paquet.visite ?? ""),
      p_resume: resume,
    }),
    signal: AbortSignal.timeout(10000),
  }).catch(() => null);
  // la page n'attend rien : un relevé qui ne s'écrit pas ne se réessaie pas
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}
