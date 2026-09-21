/**
 * API publique du plan.
 *
 *   GET /plan-public?slug=smcl-2026            l'essentiel, sans le fond
 *   GET /plan-public?slug=…&fond=<idPlan>&v=…   le fond d'un pavillon
 *   GET /plan-public?slug=…&app=1               de quoi nommer l'application
 *   GET /plan-public?slug=…&icone=1             l'icône de l'application
 *
 * Assemble l'instantané, les calques d'habillage, l'apparence choisie et les
 * calques de dessin, et renvoie le document que la page sait déjà lire.
 *
 * Le fond de plan pèse cinquante fois les stands : il part dans un second
 * appel, pour que le plan s'affiche et devienne manipulable sans l'attendre.
 * Son adresse porte une version — `v=` — que le premier appel a donnée, et
 * sous laquelle il est déclaré immuable : le navigateur ne le retélécharge
 * jamais tant qu'elle tient, et ne peut pas resservir l'ancien dès qu'elle
 * change. Cette version est une empreinte de ce qui sera servi, non une date :
 * le dessin de chaque calque, la façon dont cette fonction le découpe, et ce
 * que l'apparence en montre. Une synchronisation qui ne change rien ne fait
 * donc plus rien retélécharger ; une retouche faite hors synchronisation, si.
 *
 * Et le fond ne part qu'amputé de ce que l'exploitant a masqué : le visiteur
 * n'a aucun moyen de rallumer un calque, il n'a donc rien à faire de son
 * dessin. L'exploitant authentifié, lui, reçoit le fond entier — c'est à
 * partir de là qu'il choisit, et sa version ne tient pas compte de l'apparence
 * pour qu'essayer un réglage ne lui coûte pas un téléchargement.
 *
 * Un visiteur ne voit que les événements publiés. Un exploitant authentifié
 * présente sa session et voit aussi ses brouillons : c'est ainsi qu'on prépare
 * la configuration d'un salon avant sa mise en ligne. Pour l'exploitant, c'est
 * la politique de sécurité de la base qui tranche ; pour le visiteur, c'est
 * cette fonction — `db` dit pourquoi.
 *
 * Elle ne parle jamais à Klipso : elle lit ce que la synchronisation a écrit.
 * Le plan reste donc servi si GAIA est indisponible, et la clé API ne peut pas
 * fuiter par ce chemin.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { sansMasques } from "../_partage/svg.ts";
import { versionDuPlan, versionFond } from "../_partage/version.ts";
import { octetsDeVignette } from "../_partage/octets.ts";

/** Origines autorisées. Complétées par la variable ORIGINES_AUTORISEES —
 *  une liste séparée par des virgules — pour qu'un changement de domaine ne
 *  demande pas de modification de code. */
const ORIGINES = [
  ...(Deno.env.get("ORIGINES_AUTORISEES") ?? "")
    .split(",").map((s) => s.trim()).filter(Boolean),
  "https://plan-interactif.interactiveplan.workers.dev",
  "http://localhost:4180",
];
const cors = (req: Request) => {
  const o = req.headers.get("Origin") ?? "";
  return {
    "Access-Control-Allow-Origin": ORIGINES.includes(o) ? o : ORIGINES[0],
    "Access-Control-Allow-Headers": "authorization, content-type, apikey",
    // la réponse dépend aussi de l'identité : un exploitant voit ses brouillons
    "Vary": "Origin, Authorization",
  };
};
const METHODES = { "Access-Control-Allow-Methods": "GET, OPTIONS" };

/**
 * Le client de lecture, en deux régimes.
 *
 * Un appelant qui présente une session lit avec la clé publique et son jeton :
 * la politique de sécurité de la base tranche alors ce qu'il voit — ses salons,
 * brouillons compris. Un visiteur, lui, lit avec la clé de service, et ce sont
 * les filtres de cette fonction qui bornent ce qui sort.
 *
 * Pourquoi ce détour plutôt que la clé publique pour tout le monde : la lecture
 * publique reposait sur des politiques ouvertes au rôle « anon », donc sur la
 * clé livrée avec les pages. Les tables se lisaient alors directement, sans
 * passer par ici, et rendaient bien plus que cette fonction ne consent à
 * rendre : tous les salons d'un coup plutôt que celui qu'on demande, les zones
 * que l'exploitant a masquées, le dessin des calques qu'il a éteints. Le soin
 * pris ici ne protégeait rien tant qu'on pouvait lire à côté. Refermer cet
 * accès demandait de cesser de lire sous « anon ».
 *
 * Le prix est que, pour ce chemin-là, la publication n'est plus gardée par la
 * base mais par `salon()` et `publies()`. Ce sont les deux seules portes du
 * régime visiteur, et tout ce que la fonction lit ensuite pend de l'une ou de
 * l'autre : une lecture ajoutée plus tard part donc de là, faute de quoi un
 * brouillon sortirait.
 */
const db = (req: Request) => {
  const jeton = req.headers.get("Authorization") ?? "";
  const url = Deno.env.get("SUPABASE_URL")!;
  const options = { auth: { persistSession: false } };
  return jeton
    ? createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
      ...options,
      global: { headers: { Authorization: jeton } },
    })
    : createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, options);
};

/** Le même client, mais toujours celui du service : certaines tables ne sont
 *  ouvertes à personne d'autre, et une identité n'y donne pas plus de droits
 *  qu'elle n'en retire. */
const service = () =>
  createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });

/**
 * Les vignettes déjà fabriquées pour les logos d'un salon, par adresse.
 *
 * On interroge par adresse et non par empreinte : la table porte les deux, et
 * calculer cinq cents empreintes à chaque demande du plan coûterait pour rien
 * sur le chemin le plus fréquenté du service.
 *
 * Une table vide ne change rien : la page garde l'adresse d'origine à côté de
 * la clé, et charge le logo chez la source comme elle l'a toujours fait. C'est
 * ce qui permet aux vignettes d'apparaître au fil de leur fabrication, sans
 * que rien ne les attende.
 */
async function vignettesParAdresse(
  instantanes: { charge?: unknown }[],
): Promise<Map<string, string>> {
  const adresses = new Set<string>();
  for (const inst of instantanes) {
    const charge = (inst?.charge ?? {}) as Record<string, unknown>;
    for (const st of (charge.stands ?? []) as Record<string, unknown>[]) {
      if (typeof st.logo === "string" && st.logo) adresses.add(st.logo);
      for (const c of (st.coex ?? []) as Record<string, unknown>[]) {
        if (c && typeof c.logo === "string" && c.logo) adresses.add(c.logo);
      }
    }
  }
  const par = new Map<string, string>();
  if (!adresses.size) return par;
  const liste = [...adresses];
  const sb = service();
  // par tranches : une requête qui porte cinq cents adresses dépasse ce qu'un
  // intermédiaire accepte de transmettre
  for (let i = 0; i < liste.length; i += 50) {
    const { data } = await sb.from("vignette_de_logo")
      .select("cle,source").in("source", liste.slice(i, i + 50));
    for (const v of data ?? []) {
      const r = v as { cle: string; source: string };
      par.set(String(r.source), String(r.cle));
    }
  }
  return par;
}

/**
 * Le stand, augmenté de la clé de vignette de son logo — et de celle de chaque
 * société qu'il héberge, qui a le sien.
 *
 * La clé s'ajoute à l'adresse et ne la remplace pas : elle peut manquer, et la
 * page a besoin des deux pour savoir sur quoi retomber.
 */
function avecVignette(
  st: Record<string, unknown>,
  par: Map<string, string>,
): Record<string, unknown> {
  if (!par.size) return st;
  const cle = typeof st.logo === "string" ? par.get(st.logo) : undefined;
  const coex = (st.coex ?? []) as Record<string, unknown>[];
  const heberges = coex.map((c) => {
    const k = c && typeof c.logo === "string" ? par.get(c.logo) : undefined;
    return k ? { ...c, vignette: k } : c;
  });
  if (!cle && !heberges.some((c, i) => c !== coex[i])) return st;
  return {
    ...st,
    ...(cle ? { vignette: cle } : {}),
    ...(coex.length ? { coex: heberges } : {}),
  };
}

/**
 * La vignette d'un logo d'exposant, en octets.
 *
 * Elle est nommée par l'empreinte de l'adresse d'origine : son contenu ne peut
 * pas changer sans que sa clé change, et tout ce qui la garde — le relais, le
 * navigateur, le service worker — peut donc la garder pour toujours.
 *
 * Elle passe avant la lecture du salon, et sans la faire : une vignette ne dit
 * rien de plus que le logo public qu'elle montre, il n'y a donc rien à y
 * vérifier, et ce chemin-là doit rester le plus court possible — c'est une
 * requête par fiche ouverte.
 *
 * Une vignette inconnue n'est pas une panne : la page garde l'adresse
 * d'origine à côté de la clé, et charge le logo chez la source comme avant.
 * D'où un 404 que rien ne garde, pour que le lot suivant de la synchronisation
 * se voie sans attendre.
 */
async function rendVignette(cle: string, entetes: Record<string, string>) {
  const nu = { ...entetes, "Cache-Control": "no-store" };
  if (!/^[0-9a-f]{8,64}$/.test(cle)) {
    return new Response("Clé de vignette invalide.", { status: 400, headers: nu });
  }
  const { data, error } = await service()
    .from("vignette_de_logo").select("image").eq("cle", cle).maybeSingle();
  if (error) return new Response("Vignette indisponible.", { status: 503, headers: nu });
  if (!data) return new Response("Vignette inconnue.", { status: 404, headers: nu });
  return new Response(octetsDeVignette(String((data as { image: string }).image)), {
    headers: {
      ...entetes,
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

/* Combien de clés une demande groupée porte au plus. La même mesure que les
   tranches d'adresses plus haut, et pour la même raison : au-delà, l'adresse
   qu'on envoie à la base dépasse ce qu'un intermédiaire accepte de
   transmettre. */
const LOT_MAX = 128;

/**
 * Combien de temps le navigateur d'un visiteur garde le plan sans rien
 * redemander.
 *
 * Trente secondes, jusqu'ici : l'exploitant enregistrait depuis
 * l'administration, et le plan public devait suivre sans qu'on ait à
 * l'attendre. Le relais, lui, oublie sur commande — la page le lui demande en
 * finissant d'enregistrer —, mais le navigateur d'un visiteur ne peut rien
 * oublier sur ordre de personne : sa part de cache était donc la plus courte
 * des deux, et c'est elle qui décidait.
 *
 * Un plan ouvert aux visiteurs ne change plus qu'une fois par jour, et pas du
 * tout pendant le salon : ces trente secondes coûtaient un aller-retour par
 * ouverture de page, à des milliers de visiteurs, pour resservir à l'identique
 * ce qu'on avait déjà. Douze heures couvrent une journée de salon d'un seul
 * tenant.
 *
 * Ce que cela coûte, et qu'il faut savoir : une correction faite pendant la
 * préparation n'atteint un visiteur déjà venu qu'au bout de douze heures. La
 * grâce qui suit adoucit la reprise — la copie d'hier s'affiche pendant que la
 * neuve arrive derrière, pour l'ouverture suivante.
 *
 * L'administration, elle, ne voit jamais de copie : elle appelle avec sa
 * session et sans cache (voir `_admin2.html`).
 */
const CACHE_PLAN = 43200;
/**
 * Ce qui nomme et habille l'application installée ne se garde nulle part —
 * sinon au relais, qui sait l'oublier.
 *
 * Cette lecture-ci était déclarée gardable un jour, du temps où elle ne rendait
 * que le nom du salon : il ne change pour ainsi dire jamais. Elle rend
 * maintenant l'empreinte de l'icône, que l'exploitant remplace d'un geste — et
 * un jour de cache l'a fait installer l'ancienne longtemps après l'avoir
 * changée. Pire, ce cache-là n'était pas celui du relais : c'est celui que
 * Cloudflare pose devant tout appel sortant, et que `/api/oublie` ne touche
 * pas. Le relais oubliait, redemandait, et recevait la même réponse périmée.
 *
 * Elle ne se garde donc plus du tout ici. Le relais, lui, en garde ce qu'il
 * faut dans son stockage — quelques minutes, et il l'efface dès que
 * l'administration enregistre.
 */
const CACHE_APP = 0;
/* Passé la fraîcheur, la copie sert encore pendant qu'on va en chercher une
   neuve : personne n'attend le réseau, et la mise à jour est là au chargement
   d'après. */
const GRACE = 86400;

/**
 * Un lot de vignettes, en une seule demande.
 *
 * La page les demandait une par une : deux cent dix allers-retours jusqu'ici
 * pour un salon comme Franchise Expo, dont chacun coûtait au relais une
 * lecture de son stockage — là où le temps d'un salon se passe justement à
 * attendre des allers-retours. Le préchargement qui devait rendre les fiches
 * instantanées vidait ainsi le quota du relais en une journée.
 *
 * Elles voyagent donc groupées, telles qu'elles sont gardées : en base64, ce
 * que la table contient déjà, et qui traverse un JSON sans être converti deux
 * fois. Le tiers que cet encodage ajoute repart compressé, et n'en coûte
 * presque rien.
 *
 * Le lot n'est immuable que s'il est complet. Chaque vignette l'est — sa clé
 * est l'empreinte de ce qu'elle montre —, mais une clé qu'on ne trouve pas
 * peut être fabriquée l'instant d'après, et un trou gardé un an ne se
 * reboucherait jamais.
 */
async function rendVignettes(liste: string, entetes: Record<string, string>) {
  const nu = { ...entetes, "Cache-Control": "no-store" };
  const cles = liste.split(",").filter(Boolean);
  if (!cles.length || cles.length > LOT_MAX) {
    return new Response("Lot de vignettes hors mesure.", { status: 400, headers: nu });
  }
  if (cles.some((c) => !/^[0-9a-f]{8,64}$/.test(c))) {
    return new Response("Clé de vignette invalide.", { status: 400, headers: nu });
  }
  const { data, error } = await service()
    .from("vignette_de_logo").select("cle,image").in("cle", cles);
  if (error) return new Response("Vignettes indisponibles.", { status: 503, headers: nu });

  const par: Record<string, string> = {};
  for (const v of (data ?? []) as { cle: string; image: string }[]) {
    par[String(v.cle)] = String(v.image);
  }
  return new Response(JSON.stringify(par), {
    headers: {
      ...entetes,
      "Content-Type": "application/json",
      "Cache-Control": cles.every((c) => par[c])
        ? "public, max-age=31536000, immutable"
        : "no-store",
    },
  });
}

/**
 * Une lecture dont l'échec ne peut pas passer pour un vide.
 *
 * `supabase-js` ne lève rien : une lecture refusée, expirée en chemin ou trop
 * lourde rend `{ data: null, error }`, et `data ?? []` la change en « ce
 * pavillon n'a pas de calque ». La fonction répondait alors 200 avec un plan
 * vide — et cette réponse-là part au cache : trente jours au relais, un an dans
 * le navigateur pour un fond, que son adresse déclare immuable. Une seconde de
 * panne en base gelait donc un plan blanc pour un an, sans que rien ne le dise
 * ni ne permette de le défaire.
 *
 * L'erreur remonte donc, et le `catch` du gestionnaire en fait un 500 — jamais
 * gardé, retenté à la visite suivante. Mieux vaut une panne qui se voit et se
 * répare qu'un vide qui s'installe.
 */
async function lu<T>(
  requete: PromiseLike<{ data: T; error: { message: string } | null }>,
  quoi: string,
): Promise<T> {
  const { data, error } = await requete;
  if (error) throw new Error(quoi + " : " + error.message);
  return data;
}

/** Le salon : publié pour un visiteur, accessible pour un exploitant. */
const salon = (sb: ReturnType<typeof db>, slug: string, identifie: boolean) => {
  const q = sb
    .from("evenement")
    .select(
      "id, nom, slug, favicon, nom_app, icone_app_version, derniere_sync, fiche, fuseau, calage, zones, zones_masquees, zones_traversables, zones_fiches, salles, libelles_en",
    )
    .eq("slug", slug);
  return (identifie ? q : q.eq("etat", "publie")).maybeSingle();
};

/**
 * De quoi nommer et habiller l'application installée, et rien d'autre.
 *
 * Ce que vient chercher le manifeste, pour que l'icône posée sur l'écran
 * d'accueil porte le salon et non le produit (`src/index.mjs` `appDuSalon`).
 * Une lecture à part, et non la précédente : celle-là ramène les zones, les
 * fiches et l'icône d'onglet du salon, là où quatre colonnes suffisent — et
 * elle est demandée au chargement de chaque page du plan, avant même que le
 * visiteur ait rien vu.
 *
 * L'icône elle-même n'en fait pas partie : seule son empreinte, que la base
 * calcule. Le manifeste n'a pas besoin des octets, il donne une adresse.
 *
 * Publié pour le visiteur, comme tout le reste : un brouillon ne nomme pas une
 * application.
 */
const appDuSalon = (sb: ReturnType<typeof db>, slug: string, identifie: boolean) => {
  const q = sb.from("evenement")
    .select("nom, slug, nom_app, icone_app_version").eq("slug", slug);
  return (identifie ? q : q.eq("etat", "publie")).maybeSingle();
};

/* Ce qu'une icône d'application est en base, et rien d'autre : la console du
   plan la redessine en png quel que soit le format déposé. Ce qui ne porte pas
   cette tête ne sort donc pas d'ici — une colonne qu'on aurait remplie à la
   main ne devient pas une image en étant servie. */
const PREFIXE_PNG = "data:image/png;base64,";

/**
 * L'icône de l'application, en octets.
 *
 * Le manifeste la désigne par une adresse plutôt que de la porter, et c'est
 * cette adresse-là qui aboutit ici, par le relais. Elle porte l'empreinte de
 * l'image (`v=`), sous laquelle la réponse est déclarée immuable : une icône
 * remplacée change d'adresse, et rien de ce qui garde celle-ci ne peut donc
 * servir l'ancienne.
 *
 * Deux images sous la même adresse, à un paramètre près : celle des systèmes
 * qui posent l'icône telle quelle, et celle qu'Android rogne à sa forme
 * (`masque=1`). Faute de la seconde — un salon dont l'icône a été déposée
 * avant qu'on la fabrique — c'est la première qui part : mieux vaut une icône
 * rognée de travers qu'une icône absente.
 *
 * Un salon sans icône n'est pas une panne : le manifeste ne demande cette
 * adresse que là où la base en a une, et la page de secours du produit reste
 * l'icône par défaut. D'où un 404 que rien ne garde.
 */
async function rendIconeApp(
  sb: ReturnType<typeof db>,
  slug: string,
  masque: boolean,
  identifie: boolean,
  entetes: Record<string, string>,
) {
  const nu = { ...entetes, "Cache-Control": "no-store" };
  const q = sb.from("evenement")
    .select("icone_app, icone_app_masque").eq("slug", slug);
  const { data, error } = await (identifie ? q : q.eq("etat", "publie")).maybeSingle();
  if (error) return new Response("Icône indisponible.", { status: 503, headers: nu });
  const ligne = data as { icone_app: string | null; icone_app_masque: string | null } | null;
  const src = (masque ? ligne?.icone_app_masque : null) ?? ligne?.icone_app ?? "";
  const base64 = src.startsWith(PREFIXE_PNG) ? src.slice(PREFIXE_PNG.length) : "";
  if (!base64) return new Response("Ce salon n'a pas d'icône.", { status: 404, headers: nu });
  return new Response(octetsDeVignette(base64), {
    headers: {
      ...entetes,
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

/**
 * Ses pavillons : publiés pour un visiteur, tous pour un exploitant.
 *
 * Le filtre est posé sur la lecture des pavillons et non sur celles qui
 * suivent — calques, apparence, dessins, instantanés pendent tous d'un
 * pavillon, et n'existent pour la fonction que par les identifiants qu'elle
 * tient d'ici. Refermer cette porte-là les referme toutes.
 */
const publies = <Q extends { eq: (colonne: "publie", valeur: boolean) => Q }>(
  q: Q,
  identifie: boolean,
): Q => (identifie ? q : q.eq("publie", true));

/**
 * Ce qu'une fiche ne montre pas ne descend pas.
 *
 * L'exploitant décoche « Téléphone » dans la console et la page cesse de
 * l'afficher — mais l'instantané partait tel quel, coordonnées comprises, chez
 * chaque visiteur : le réglage ne cachait qu'à l'écran, là où il promet de ne
 * pas publier. Il s'applique ici, où il a un sens.
 *
 * N'y figurent que les champs dont rien d'autre ne se sert. La recherche
 * indexe l'enseigne, la raison sociale, le numéro, le secteur et les
 * thématiques : ceux-là restent, décochés ou non, sans quoi on cesserait de
 * trouver en tapant ce qu'on lisait hier. Les autres ne se lisent que sur la
 * fiche — ou comme critère, d'où la réserve de `retraits()`.
 */
const CHAMPS_FICHE: Record<string, string> = {
  logo: "logo",
  hall: "hall",
  adresse: "adr",
  ville: "ville",
  pays: "pays",
  telephone: "tel",
  site: "site",
  facebook: "fb",
  linkedin: "li",
  instagram: "ig",
  nomenclature: "nomencl",
};

/* Les champs qui se taisent tant qu'on ne les a pas cochés — l'inverse de la
   règle générale, et pour la raison qui la fonde. Un champ absent du réglage
   paraît parce qu'il paraissait déjà avant que le réglage existe ; le hall,
   lui, n'a jamais paru. Ici la conséquence va plus loin qu'à l'écran : non
   coché, il ne part pas du tout.

   Le même tableau vit dans la page — « MASQUE_PAR_DEFAUT » de « _js.html » —
   et dans la console : les trois se suivent. */
const MASQUE_PAR_DEFAUT: Record<string, boolean> = { hall: true };

/** Les champs propres au salon portent leur clé préfixée dans le réglage. */
const PREFIXE_PERSO = "perso:";

interface Retraits {
  cles: string[];
  persos: string[];
}

/**
 * Ce qu'il faut retirer des fiches de ce salon, ou rien.
 *
 * Une entrée absente vaut « affiché » — un salon qui n'a jamais touché au
 * réglage ne perd donc rien. Un champ décoché mais retenu comme critère reste
 * envoyé : c'est de lui que la page tire les valeurs du filtre, et la
 * recherche ce qu'elle indexe des critères. Le décocher ne dit alors que « pas
 * sur la fiche », pas « pas du tout ».
 */
function retraits(fiche: Record<string, unknown>): Retraits | null {
  const montre = (fiche.stand ?? {}) as Record<string, boolean>;
  const criteres = (fiche.criteres ?? {}) as Record<string, boolean>;
  const retire = (cible: string) =>
    (MASQUE_PAR_DEFAUT[cible] ? montre[cible] !== true : montre[cible] === false) &&
    criteres[cible] !== true;

  const cles = Object.entries(CHAMPS_FICHE)
    .filter(([cible]) => retire(cible))
    .map(([, cle]) => cle);
  const persos = ((fiche.perso ?? []) as { cle?: string }[])
    .map((c) => String(c?.cle ?? ""))
    .filter((cle) => cle && retire(PREFIXE_PERSO + cle));

  return cles.length || persos.length ? { cles, persos } : null;
}

/**
 * La même fiche, amputée de ce que le salon n'affiche pas.
 *
 * Les sociétés hébergées portent les mêmes champs que leur hôte — c'est bien
 * leur fiche à elles — et le même réglage les gouverne : les oublier laisserait
 * sortir par les co-exposants ce qu'on retire des titulaires.
 */
function ampute(
  stand: Record<string, unknown>,
  r: Retraits,
): Record<string, unknown> {
  const s = { ...stand };
  for (const cle of r.cles) delete s[cle];

  /* Les deux versions d'un champ propre au salon se retirent ensemble :
     l'anglaise n'est pas un autre champ, c'est le même dans l'autre langue. */
  for (const table of ["perso", "perso_en"]) {
    if (!r.persos.length || !s[table]) continue;
    const perso = { ...(s[table] as Record<string, unknown>) };
    for (const cle of r.persos) delete perso[cle];
    // la clé ne descend pas quand elle ne porte plus rien : le stand la portait
    // vide sur tout un salon
    if (Object.keys(perso).length) s[table] = perso;
    else delete s[table];
  }

  if (Array.isArray(s.coex)) {
    s.coex = (s.coex as Record<string, unknown>[]).map((x) => ampute(x, r));
  }
  return s;
}

/**
 * Ce que l'apparence d'un pavillon donne pour masqué : les clés de calques —
 * « Batiment » — et de sous-calques — « Batiment/8-VRD-ASS ».
 *
 * Un réglage absent montre, comme la page l'entend elle aussi : un salon dont
 * l'apparence n'a jamais été publiée continue donc de recevoir tout son fond.
 *
 * La liste des calques n'est pas un ornement. `apparence.reglages` est un
 * dictionnaire plat où cohabitent cinq vocabulaires — calques, sous-calques,
 * couches de données (`data:stands`), réglages d'écran (`_zoom`, `_echelle`),
 * placements de libellés (`_lab:…`) — et tous portent le même `{visible}`.
 * Sans de quoi les distinguer, éteindre l'échelle passait pour un masquage :
 * le filtrage n'en souffrait pas, aucun calque ne s'appelant `_echelle`, mais
 * `versionFond` repliait la clé dans l'empreinte du fond. Le réglage le plus
 * anodin changeait alors l'adresse d'un dessin inchangé, et chaque visiteur
 * retéléchargeait un à deux mégaoctets identiques — souvent au bout du réseau
 * d'un salon.
 */
function masquesDe(
  reglages: unknown,
  calques: { cle: unknown }[],
): Record<string, boolean> {
  const noms = new Set(calques.map((c) => String(c.cle)));
  /* « calque/sous-calque », mais un nom de calque peut lui-même porter une
     barre oblique : la clé est retenue dès qu'une de ses têtes nomme un
     calque. Même règle que la page, `reglagesDuSalon` (_admin1.html). */
  const dUnCalque = (cle: string) =>
    noms.has(cle) ||
    cle.split("/").some((_, i, t) => i > 0 && noms.has(t.slice(0, i).join("/")));

  const masques: Record<string, boolean> = {};
  for (const [cle, r] of Object.entries((reglages ?? {}) as Record<string, { visible?: boolean }>)) {
    if (r && r.visible === false && dUnCalque(cle)) masques[cle] = true;
  }
  return masques;
}

/** Les mêmes, lus pour un seul pavillon — c'est le second appel qui les demande. */
async function masquesDuPlan(
  sb: ReturnType<typeof db>,
  planId: string,
  calques: { cle: unknown }[],
): Promise<Record<string, boolean>> {
  const data = await lu(
    sb.from("apparence").select("reglages").eq("plan_id", planId).maybeSingle(),
    "Lecture de l'apparence du pavillon",
  );
  return masquesDe(data?.reglages, calques);
}

Deno.serve(async (req) => {
  const CORS = { ...cors(req), ...METHODES };
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  // Une réponse rendue à un exploitant authentifié peut contenir des
  // brouillons : elle ne doit jamais atterrir dans un cache partagé.
  const identifie = Boolean(req.headers.get("Authorization"));

  // Un fond porte sa version dans l'adresse : il peut être gardé indéfiniment.
  const versionne = Boolean(new URL(req.url).searchParams.get("v"));

  const repond = (corps: unknown, code = 200, cache = 30) =>
    new Response(JSON.stringify(corps), {
      status: code,
      headers: {
        ...CORS,
        "Content-Type": "application/json",
        /* Le relais garde cette réponse pour tout le monde, et l'oublie dès que
           l'administration enregistre : le navigateur d'un visiteur, lui, ne
           peut rien oublier sur commande. Sa part de cache est donc courte — il
           revient au relais, qui répond de son stockage sans toucher la base,
           ce qui ne coûte presque rien. Une minute de grâce couvre une panne
           sans figer le plan pour un quart d'heure. */
        "Cache-Control": code !== 200
          ? "no-store"
          // le contenu versionné est immuable, mais reste privé à l'exploitant
          // quand il vient d'un brouillon
          : versionne
          ? `${identifie ? "private" : "public"}, max-age=31536000, immutable`
          : identifie
          ? "private, no-store"
          /* Zéro n'est pas « une seconde » : c'est « rien ne garde ceci ». La
             grâce, qui resservirait l'ancienne copie le temps d'en chercher une
             neuve, n'a pas de sens pour une réponse qu'on veut fraîche. */
          : !cache
          ? "no-store"
          : `public, max-age=${cache}, stale-while-revalidate=${GRACE}`,
      },
    });

  try {
    /* Une vignette de logo se rend avant tout le reste : elle ne dépend
       d'aucun salon, et c'est une requête par fiche ouverte. */
    const vignette = new URL(req.url).searchParams.get("vignette");
    if (vignette) return await rendVignette(vignette, CORS);
    /* Et le lot, à côté d'elle : c'est la même chose rendue en gros, pour la
       visite qui les veut toutes. */
    const lot = new URL(req.url).searchParams.get("vignettes");
    if (lot) return await rendVignettes(lot, CORS);

    const slug = new URL(req.url).searchParams.get("slug");
    if (!slug) return repond({ erreur: "Paramètre slug manquant." }, 400);

    const sb = db(req);

    /* L'icône de l'application, avant tout le reste : c'est une image, elle ne
       doit rien lire du plan pour partir. */
    if (new URL(req.url).searchParams.get("icone")) {
      const masque = Boolean(new URL(req.url).searchParams.get("masque"));
      return await rendIconeApp(sb, slug, masque, identifie, CORS);
    }

    /* De quoi nommer et habiller l'application installée : avant la lecture
       complète, puisqu'elle n'a besoin de rien. `nom=1` est l'ancien nom de
       cette demande, du temps où elle ne rendait que le nom du salon ; il reste
       reconnu, un relais pouvant être déployé après cette fonction. Et le
       changement de nom a son utilité propre : il échappe à ce qu'un cache
       garde encore sous l'ancien. */
    if (new URL(req.url).searchParams.get("app") ||
        new URL(req.url).searchParams.get("nom")) {
      const { data: nomme, error: mal } = await appDuSalon(sb, slug, identifie);
      if (mal) return repond({ erreur: mal.message }, 500);
      if (!nomme) {
        return repond({ erreur: "Événement introuvable ou non publié." }, 404);
      }
      return repond({
        evenement: nomme.nom,
        slug: nomme.slug,
        /* Le nom choisi par l'exploitant, et l'empreinte de son icône : le
           relais écrit l'un dans le manifeste et pose l'autre dans l'adresse
           des icônes. Nuls, c'est le nom et l'icône du produit. */
        app: nomme.nom_app ?? null,
        icone: nomme.icone_app_version ?? null,
      }, 200, CACHE_APP);
    }

    // seuls les événements publiés passent, sauf à l'exploitant dont la
    // session est valide : la politique de sécurité tranche pour lui
    const { data: evt, error: err } = await salon(sb, slug, identifie);

    // Un jeton périmé ne doit pas se traduire par « introuvable » : l'appelant
    // a besoin de savoir qu'il lui suffit de se reconnecter.
    if (err) {
      const jwt = /jwt|token|expired/i.test(err.message ?? "");
      if (identifie && jwt) {
        return repond({ erreur: "Session expirée : reconnectez-vous." }, 401);
      }
      return repond({ erreur: err.message }, 500);
    }
    if (!evt) {
      return repond({
        erreur: identifie
          ? "Événement introuvable."
          : "Événement introuvable ou non publié.",
      }, 404);
    }

    // Second appel : uniquement le dessin d'un pavillon.
    const fond = new URL(req.url).searchParams.get("fond");
    if (fond) {
      const pl = await lu(
        publies(
          sb.from("plan").select("id")
            .eq("evenement_id", evt.id)
            .eq("id_klipso", fond),
          identifie,
        ).maybeSingle(),
        "Lecture du pavillon",
      );
      if (!pl) return repond({ erreur: "Pavillon introuvable." }, 404);

      const cal = await lu(
        sb.from("calque")
          .select("cle, svg, ordre_klipso")
          .eq("plan_id", pl.id)
          .not("svg", "is", null)
          .order("ordre_klipso", { ascending: true }),
        "Lecture du dessin du pavillon",
      );
      /* Un fond sans un seul calque n'est pas un fond : la lecture a abouti sur
         rien, et la déclarer immuable pour un an graverait la page blanche.
         Cela n'arrive que si la synchronisation n'a rien écrit — on le dit. */
      if (!cal?.length) {
        return repond({ erreur: "Le dessin de ce pavillon est absent : lancez une synchronisation." }, 404);
      }

      /* Ce que l'exploitant a masqué ne part pas.
         Un visiteur n'a aucun moyen de le rallumer — le panneau des calques
         n'existe qu'en administration — et il en recevait pourtant tout le
         dessin : chez FEP26, 2,5 Mo pour 35 Ko à l'écran. L'exploitant, lui,
         reçoit le fond entier : c'est à partir de là qu'il choisit. Le
         masquage entre dans la version que porte l'adresse, sans quoi le
         navigateur resservirait le découpage d'avant. */
      const masques = identifie ? {} : await masquesDuPlan(sb, pl.id, cal ?? []);
      const retenus = (cal ?? [])
        .filter((c) => !masques[String(c.cle)])
        .map((c) => ({
          cle: c.cle,
          svg: sansMasques(
            String(c.svg),
            (id) => Boolean(masques[String(c.cle) + "/" + id]),
          ),
        }));

      return repond({ plan: fond, calques: retenus });
    }

    const plans = await lu(
      publies(
        sb.from("plan")
          .select("id, id_klipso, libelle, hall, emprise")
          .eq("evenement_id", evt.id),
        identifie,
      ).order("libelle", { ascending: true })
       /* Départage : deux pavillons de même libellé sortiraient dans l'ordre
          que la base veut, et la version du plan changerait toute seule. */
       .order("id", { ascending: true }),
      "Lecture des pavillons",
    );
    if (!plans?.length) {
      return repond({
        erreur: identifie
          ? "Aucun pavillon : lancez une synchronisation."
          : "Aucun pavillon publié.",
      }, 404);
    }

    const ids = plans.map((p) => p.id);
    const [calques, apparences, dessins, instantanes] = await Promise.all([
      // pas de colonne svg ici : c'est elle qui pèse, et le second appel la sert.
      // On filtre quand même dessus : un calque sans dessin n'a rien à lister.
      // L'empreinte, elle, tient en trente-deux octets et dit ce que pèse le
      // dessin sans le lire : c'est d'elle que sort la version du fond.
      lu(
        sb.from("calque")
          .select("plan_id, id_klipso, cle, libelle, ordre_klipso, empreinte")
          .in("plan_id", ids).not("svg", "is", null),
        "Lecture des calques",
      ),
      lu(
        sb.from("apparence").select("plan_id, pile, reglages").in("plan_id", ids),
        "Lecture de l'apparence",
      ),
      lu(
        sb.from("calque_dessin").select("plan_id, id, cle, nom, couleur, rempli, visible, rang, formes")
          .in("plan_id", ids).order("rang", { ascending: true })
          // départage, pour la même raison que les pavillons
          .order("id", { ascending: true }),
        "Lecture des calques de dessin",
      ),
      lu(
        sb.from("instantane").select("plan_id, charge, genere_le").in("plan_id", ids),
        "Lecture des instantanés",
      ),
    ]);

    const par = <T extends { plan_id: string }>(l: T[] | null) => {
      const m: Record<string, T[]> = {};
      (l ?? []).forEach((x) => (m[x.plan_id] ??= []).push(x));
      return m;
    };
    const parCalque = par(calques);
    const parDessin = par(dessins);
    const parApparence = Object.fromEntries((apparences ?? []).map((a) => [a.plan_id, a]));
    const parInstantane = Object.fromEntries((instantanes ?? []).map((i) => [i.plan_id, i]));

    // le même pour tout le salon : il ne dépend que de son réglage de fiche
    const retrait = identifie ? null : retraits((evt.fiche ?? {}) as Record<string, unknown>);

    /* La zone de chaque salle, par son nom — c'est ce qu'une conférence porte
       de sa salle. Une salle connue mais rattachée à rien y figure aussi, avec
       « null » : le rattachement que l'instantané porte encore a été défait
       depuis, et le laisser vivre montrerait un programme sous une zone dont
       l'exploitant l'a retiré. */
    const parSalle = new Map<string, string | null>();
    for (
      const s of Object.values(
        (evt.salles ?? {}) as Record<string, { nom?: string; zone?: string }>,
      )
    ) {
      if (s?.nom) parSalle.set(s.nom, s.zone ?? null);
    }

    /* La version du fond de chaque pavillon, calculée sur ce qui sera servi :
       les empreintes des dessins, et — pour un visiteur seul — le masquage qui
       décide de ce qu'on lui envoie. Le même jeu de masques que celui du second
       appel, pour que la version ne puisse pas dire autre chose que lui. */
    const versions = new Map<string, string>();
    for (const p of plans) {
      versions.set(
        p.id,
        await versionFond(
          parCalque[p.id] ?? [],
          identifie ? null : masquesDe(parApparence[p.id]?.reglages, parCalque[p.id] ?? []),
        ),
      );
    }

    /* Les vignettes de ce salon, relevées une fois pour toute la réponse : la
       page les préférera à l'adresse d'origine, et n'aura plus rien à décoder
       ni à recadrer. */
    const vignettes = await vignettesParAdresse(instantanes ?? []);

    const sortie = {
      evenement: evt.nom,
      slug: evt.slug,
      /* L'icône de l'onglet, déposée dans la console. Elle part au visiteur
         comme à l'exploitant : les deux pages du plan la posent. Nulle tant
         que rien n'a été déposé — la page n'en pose alors aucune. */
      favicon: evt.favicon ?? null,
      /* Ce que porte l'application installée, quand le salon l'a choisi : le
         nom écrit sous l'icône, et l'empreinte de l'icône elle-même — jamais
         l'image, qui pèse un demi-méga et ne se lit qu'à l'installation. La
         page en a besoin pour ce que le manifeste ne couvre pas : l'écran
         d'accueil d'iOS, qui ne le lit pas, et la fenêtre qui invite à
         installer, qui montre ce qu'on installe. */
      app: { nom: evt.nom_app ?? null, icone: evt.icone_app_version ?? null },
      genereLe: evt.derniere_sync,
      // ce que la fiche détail montre : décidé par l'exploitant, pas par la page
      fiche: evt.fiche ?? {},
      // sans lui, une heure ISO se lirait dans le fuseau du visiteur
      fuseau: evt.fuseau ?? null,
      /* Où tombe le repère du plan sur la Terre, et quel fond de carte glisser
         dessous. Le visiteur en a besoin, et pas seulement l'exploitant : c'est
         la page qui pose les tuiles, sous le plan, à chaque changement de vue.
         Trois nombres et un nom : rien qui ne se lise déjà sur n'importe quelle
         carte du même endroit. */
      calage: evt.calage ?? null,
      /* L'anglais des valeurs des listes, relevé dans les sources : la version
         anglaise de la page traduit avec lui secteurs, nomenclature et champs
         à choix, partout où ils paraissent. */
      anglais: evt.libelles_en ?? {},
      // l'administration en a besoin pour savoir ce qui a déjà été renommé
      nomsZones: evt.zones ?? {},
      // et pour savoir ce qu'elle a retiré du plan public : le visiteur, lui,
      // ne reçoit pas les zones masquées, la liste ne lui apprendrait rien
      zonesMasquees: identifie ? (evt.zones_masquees ?? {}) : {},
      /* Les zones que le calcul d'itinéraire traverse. Le visiteur a déjà la
         marque, posée sur chaque zone — la table ne lui apprendrait rien de
         plus ; l'exploitant, lui, la réécrit sans perdre les autres. */
      zonesTraversables: identifie ? (evt.zones_traversables ?? {}) : {},
      /* Les fiches que l'exploitant a écrites, en table : c'est de là que
         l'administration repart pour les réécrire sans perdre les autres. Le
         visiteur les a déjà, posées sur chaque zone — la table ne lui
         apprendrait rien de plus. */
      fichesZones: identifie ? (evt.zones_fiches ?? {}) : {},
      /* Les salles du programme et la zone qui les abrite : l'administration
         les rattache une par une depuis la fiche de la zone, et repart de cette
         table pour la réécrire sans perdre les autres. Le visiteur reçoit des
         conférences déjà rattachées, plus bas — la table ne lui apprendrait
         rien. */
      salles: identifie ? (evt.salles ?? {}) : {},
      plans: plans.map((p) => {
        const inst = parInstantane[p.id];
        const charge = (inst?.charge ?? {}) as Record<string, unknown>;
        const zonesDuPlan = new Set(
          ((charge.zones ?? []) as Record<string, unknown>[])
            .map((z) => String(z.id)),
        );
        return {
          id: p.id_klipso,
          libelle: p.libelle,
          hall: p.hall,
          emprise: p.emprise ?? charge.emprise ?? null,
          // ce que la page joindra à l'adresse du fond : tant qu'elle ne bouge
          // pas, le navigateur ne redemande rien
          versionFond: versions.get(p.id),
          fond: (parCalque[p.id] ?? [])
            // la clé départage les calques de même rang : le tri de JavaScript
            // garde l'ordre d'entrée, qui vient de la base et n'est pas garanti
            .sort((a, b) => (a.ordre_klipso ?? 0) - (b.ordre_klipso ?? 0) ||
                            String(a.cle).localeCompare(String(b.cle)))
            .map((c) => ({
              // l'identifiant Klipso est la clé stable : les libellés changent
              id: c.id_klipso,
              cle: c.cle,
              nom: c.libelle,
              ordre: c.ordre_klipso,
            })),
          /* L'exploitant reçoit les fiches entières : c'est de là qu'il coche.
             Le visiteur ne reçoit que ce que la fiche montre — le reste ne lui
             servirait à rien, et un salon qui a décoché les coordonnées ne les
             publie plus du tout. */
          stands: ((charge.stands ?? []) as Record<string, unknown>[])
            .map((s) => avecVignette(retrait ? ampute(s, retrait) : s, vignettes)),
          // le nom choisi par l'exploitant l'emporte, et s'applique ici plutôt
          // qu'à la synchronisation : renommer doit se voir tout de suite
          /* Ce que l'exploitant a masqué ne part pas chez le visiteur : une
             zone technique — réserve, quai de livraison — occupe le plan sans
             rien lui apprendre. L'exploitant, lui, les reçoit toutes,
             signalées : c'est de là qu'il revient sur son choix. */
          zones: ((charge.zones ?? []) as Record<string, unknown>[])
            .filter((z) =>
              identifie || !(evt.zones_masquees ?? {})[String(z.id)]
            )
            .map((z) => {
              const choisi = (evt.zones ?? {})[String(z.id)];
              const masquee = Boolean((evt.zones_masquees ?? {})[String(z.id)]);
              /* Une zone qu'on traverse — un accueil, une agora, une
                 esplanade — n'est pas un mur pour le calcul d'itinéraire.
                 L'exploitant l'a désignée ; le visiteur reçoit la marque, car
                 c'est sa page qui calcule le trajet. */
              const traversable = Boolean(
                (evt.zones_traversables ?? {})[String(z.id)],
              );
              /* Ce que l'exploitant a écrit sur la zone. Klipso n'en donne
                 rien : sans cette fiche, une agora n'a que son nom à montrer.
                 Elle part au visiteur comme à l'exploitant — c'est pour le
                 visiteur qu'elle a été écrite. */
              const fiche = ((evt.zones_fiches ?? {}) as Record<
                string,
                Record<string, unknown>
              >)[String(z.id)] ?? {};
              return {
                ...z,
                ...(choisi ? { nom: choisi } : {}),
                ...(masquee ? { masquee: true } : {}),
                ...(traversable ? { traversable: true } : {}),
                ...(fiche.type ? { type: fiche.type } : {}),
                ...(fiche.logo ? { logo: fiche.logo } : {}),
                ...(fiche.description ? { description: fiche.description } : {}),
                // la version anglaise, que la page montre à qui lit l'anglais
                ...(fiche.nom_en ? { nom_en: fiche.nom_en } : {}),
                ...(fiche.description_en ? { description_en: fiche.description_en } : {}),
                ...(fiche.lien ? { lien: fiche.lien } : {}),
              };
            }),
          /* Le rattachement d'une salle s'applique ici, comme le nom d'une
             zone : il se choisit depuis les réglages du plan et doit paraître
             sans attendre la prochaine synchronisation, qui seule l'a inscrit
             dans l'instantané.

             Une salle rattachée à une zone d'un autre pavillon fait exception :
             la conférence n'est pas remontée là-bas, et la garder ici la
             rangerait sous une zone que ce pavillon n'a pas. Elle se retrouve
             par son exposant jusqu'à la synchronisation suivante, qui la
             portera où il faut. */
          conferences: ((charge.conferences ?? []) as Record<string, unknown>[])
            .map((c) => {
              const salle = String(c.salle ?? "");
              if (!parSalle.has(salle)) return c;
              const zone = parSalle.get(salle);
              return { ...c, zone: zone && zonesDuPlan.has(zone) ? zone : null };
            }),
          apparence: parApparence[p.id]
            ? { pile: parApparence[p.id].pile, reglages: parApparence[p.id].reglages }
            : { pile: [], reglages: {} },
          // la page reconnaît ses calques à sa propre clé ; l uuid ne lui sert
          // à rien, et changerait son identité à chaque enregistrement
          dessins: (parDessin[p.id] ?? []).map((d) => ({
            id: d.cle ?? d.id, nom: d.nom, couleur: d.couleur,
            rempli: d.rempli, visible: d.visible, formes: d.formes,
          })),
        };
      }),
    };

    /* Le plan, et la version de ce qu'il porte.
     *
     * Elle est prise sur le texte qu'on s'apprête à envoyer, et voyage en
     * en-tête plutôt que dans le corps : le relais la range à côté du plan, et
     * la rend ensuite à qui demande l'entête sans avoir à relire un
     * demi-mégaoctet pour en extraire un champ.
     *
     * Une version demandée qui n'est plus la nôtre reçoit le plan courant,
     * mais elle le recevrait sous l'étiquette d'hier : on ne la laisse alors
     * entrer dans aucun cache, et l'entête dira laquelle demander. */
    const texte = JSON.stringify(sortie);
    const version = await versionDuPlan(texte);
    const demandee = new URL(req.url).searchParams.get("v");
    return new Response(texte, {
      headers: {
        ...CORS,
        "Content-Type": "application/json",
        "X-Version": version,
        // sans quoi une page servie depuis un cadre ou une coque ne la lirait pas
        "Access-Control-Expose-Headers": "X-Version",
        "Cache-Control": identifie
          ? "private, no-store"
          : demandee === version
          ? "public, max-age=31536000, immutable"
          : demandee
          ? "no-store"
          : `public, max-age=${CACHE_PLAN}, stale-while-revalidate=${GRACE}`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return repond({ erreur: message }, 500);
  }
});
