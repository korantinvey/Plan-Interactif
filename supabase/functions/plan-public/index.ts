/**
 * API publique du plan.
 *
 *   GET /plan-public?slug=smcl-2026            l'essentiel, sans le fond
 *   GET /plan-public?slug=…&fond=<idPlan>&v=…   le fond d'un pavillon
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
import { versionFond } from "../_partage/version.ts";

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

/** Le salon : publié pour un visiteur, accessible pour un exploitant. */
const salon = (sb: ReturnType<typeof db>, slug: string, identifie: boolean) => {
  const q = sb
    .from("evenement")
    .select(
      "id, nom, slug, favicon, derniere_sync, fiche, fuseau, zones, zones_masquees, zones_fiches, salles",
    )
    .eq("slug", slug);
  return (identifie ? q : q.eq("etat", "publie")).maybeSingle();
};

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
    montre[cible] === false && criteres[cible] !== true;

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

  if (r.persos.length && s.perso) {
    const perso = { ...(s.perso as Record<string, unknown>) };
    for (const cle of r.persos) delete perso[cle];
    // la clé ne descend pas quand elle ne porte plus rien : le stand la portait
    // vide sur tout un salon
    if (Object.keys(perso).length) s.perso = perso;
    else delete s.perso;
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
  const { data } = await sb
    .from("apparence")
    .select("reglages")
    .eq("plan_id", planId)
    .maybeSingle();
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

  const repond = (corps: unknown, code = 200, cache = 60) =>
    new Response(JSON.stringify(corps), {
      status: code,
      headers: {
        ...CORS,
        "Content-Type": "application/json",
        // le contenu public ne bouge qu'à la synchronisation : on autorise le
        // cache, avec un délai de grâce large en cas d'indisponibilité
        "Cache-Control": code !== 200
          ? "no-store"
          // le contenu versionné est immuable, mais reste privé à l'exploitant
          // quand il vient d'un brouillon
          : versionne
          ? `${identifie ? "private" : "public"}, max-age=31536000, immutable`
          : identifie
          ? "private, no-store"
          : `public, max-age=${cache}, stale-while-revalidate=600`,
      },
    });

  try {
    const slug = new URL(req.url).searchParams.get("slug");
    if (!slug) return repond({ erreur: "Paramètre slug manquant." }, 400);

    const sb = db(req);

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
      const { data: pl } = await publies(
        sb.from("plan").select("id")
          .eq("evenement_id", evt.id)
          .eq("id_klipso", fond),
        identifie,
      ).maybeSingle();
      if (!pl) return repond({ erreur: "Pavillon introuvable." }, 404);

      const { data: cal } = await sb
        .from("calque")
        .select("cle, svg, ordre_klipso")
        .eq("plan_id", pl.id)
        .not("svg", "is", null)
        .order("ordre_klipso", { ascending: true });

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

    const { data: plans } = await publies(
      sb.from("plan")
        .select("id, id_klipso, libelle, hall, emprise")
        .eq("evenement_id", evt.id),
      identifie,
    ).order("libelle", { ascending: true });
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
      sb.from("calque")
        .select("plan_id, id_klipso, cle, libelle, ordre_klipso, empreinte")
        .in("plan_id", ids).not("svg", "is", null),
      sb.from("apparence").select("plan_id, pile, reglages").in("plan_id", ids),
      sb.from("calque_dessin").select("plan_id, id, cle, nom, couleur, rempli, visible, rang, formes")
        .in("plan_id", ids).order("rang", { ascending: true }),
      sb.from("instantane").select("plan_id, charge, genere_le").in("plan_id", ids),
    ]);

    const par = <T extends { plan_id: string }>(l: T[] | null) => {
      const m: Record<string, T[]> = {};
      (l ?? []).forEach((x) => (m[x.plan_id] ??= []).push(x));
      return m;
    };
    const parCalque = par(calques.data);
    const parDessin = par(dessins.data);
    const parApparence = Object.fromEntries((apparences.data ?? []).map((a) => [a.plan_id, a]));
    const parInstantane = Object.fromEntries((instantanes.data ?? []).map((i) => [i.plan_id, i]));

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

    const sortie = {
      evenement: evt.nom,
      slug: evt.slug,
      /* L'icône de l'onglet, déposée dans la console. Elle part au visiteur
         comme à l'exploitant : les deux pages du plan la posent. Nulle tant
         que rien n'a été déposé — la page n'en pose alors aucune. */
      favicon: evt.favicon ?? null,
      genereLe: evt.derniere_sync,
      // ce que la fiche détail montre : décidé par l'exploitant, pas par la page
      fiche: evt.fiche ?? {},
      // sans lui, une heure ISO se lirait dans le fuseau du visiteur
      fuseau: evt.fuseau ?? null,
      // l'administration en a besoin pour savoir ce qui a déjà été renommé
      nomsZones: evt.zones ?? {},
      // et pour savoir ce qu'elle a retiré du plan public : le visiteur, lui,
      // ne reçoit pas les zones masquées, la liste ne lui apprendrait rien
      zonesMasquees: identifie ? (evt.zones_masquees ?? {}) : {},
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
            .sort((a, b) => (a.ordre_klipso ?? 0) - (b.ordre_klipso ?? 0))
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
          stands: retrait
            ? ((charge.stands ?? []) as Record<string, unknown>[])
              .map((s) => ampute(s, retrait))
            : charge.stands ?? [],
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
                ...(fiche.type ? { type: fiche.type } : {}),
                ...(fiche.logo ? { logo: fiche.logo } : {}),
                ...(fiche.description ? { description: fiche.description } : {}),
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

    return repond(sortie);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return repond({ erreur: message }, 500);
  }
});
