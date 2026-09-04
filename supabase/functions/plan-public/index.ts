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
 * Ce fond ne change qu'à la synchronisation, dont l'horodatage sert de clé de
 * version : le navigateur ne le retélécharge jamais deux fois.
 *
 * Un visiteur ne voit que les événements publiés. Un exploitant authentifié
 * présente sa session et voit aussi ses brouillons : c'est ainsi qu'on prépare
 * la configuration d'un salon avant sa mise en ligne. C'est la politique de
 * sécurité de la base qui tranche, pas cette fonction.
 *
 * Elle ne parle jamais à Klipso : elle lit ce que la synchronisation a écrit.
 * Le plan reste donc servi si GAIA est indisponible, et la clé API ne peut pas
 * fuiter par ce chemin.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

/** Origines autorisées. Complétées par la variable ORIGINES_AUTORISEES —
 *  une liste séparée par des virgules — pour qu'un changement de domaine ne
 *  demande pas de modification de code. */
const ORIGINES = [
  ...(Deno.env.get("ORIGINES_AUTORISEES") ?? "")
    .split(",").map((s) => s.trim()).filter(Boolean),
  "https://plan-interactif.korantin-vey.workers.dev",
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
 * Le client emprunte l'identité de l'appelant quand il en a une : un
 * exploitant authentifié voit ses brouillons, un visiteur ne voit que le
 * publié. C'est la politique de sécurité de la base qui tranche, pas la
 * fonction — elle se contente de transmettre le jeton.
 */
const db = (req: Request) => {
  const jeton = req.headers.get("Authorization") ?? "";
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    {
      auth: { persistSession: false },
      global: jeton ? { headers: { Authorization: jeton } } : {},
    },
  );
};

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

    // la politique de sécurité ne laisse passer que les événements publiés,
    // sauf à l'exploitant dont la session est valide
    const { data: evt, error: err } = await sb
      .from("evenement")
      .select("id, nom, slug, derniere_sync, fiche")
      .eq("slug", slug)
      .maybeSingle();

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
      const { data: pl } = await sb
        .from("plan")
        .select("id")
        .eq("evenement_id", evt.id)
        .eq("id_klipso", fond)
        .maybeSingle();
      if (!pl) return repond({ erreur: "Pavillon introuvable." }, 404);

      const { data: cal } = await sb
        .from("calque")
        .select("cle, svg, ordre_klipso")
        .eq("plan_id", pl.id)
        .not("svg", "is", null)
        .order("ordre_klipso", { ascending: true });

      return repond({
        plan: fond,
        calques: (cal ?? []).map((c) => ({ cle: c.cle, svg: c.svg })),
      });
    }

    const { data: plans } = await sb
      .from("plan")
      .select("id, id_klipso, libelle, hall, emprise")
      .eq("evenement_id", evt.id)
      .order("libelle", { ascending: true });
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
      sb.from("calque").select("plan_id, id_klipso, cle, libelle, ordre_klipso")
        .in("plan_id", ids).not("svg", "is", null),
      sb.from("apparence").select("plan_id, pile, reglages").in("plan_id", ids),
      sb.from("calque_dessin").select("plan_id, id, nom, couleur, rempli, visible, rang, formes")
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

    const sortie = {
      evenement: evt.nom,
      slug: evt.slug,
      genereLe: evt.derniere_sync,
      // ce que la fiche détail montre : décidé par l'exploitant, pas par la page
      fiche: evt.fiche ?? {},
      plans: plans.map((p) => {
        const inst = parInstantane[p.id];
        const charge = (inst?.charge ?? {}) as Record<string, unknown>;
        return {
          id: p.id_klipso,
          libelle: p.libelle,
          hall: p.hall,
          emprise: p.emprise ?? charge.emprise ?? null,
          fond: (parCalque[p.id] ?? [])
            .sort((a, b) => (a.ordre_klipso ?? 0) - (b.ordre_klipso ?? 0))
            .map((c) => ({
              // l'identifiant Klipso est la clé stable : les libellés changent
              id: c.id_klipso,
              cle: c.cle,
              nom: c.libelle,
              ordre: c.ordre_klipso,
            })),
          stands: charge.stands ?? [],
          zones: charge.zones ?? [],
          apparence: parApparence[p.id]
            ? { pile: parApparence[p.id].pile, reglages: parApparence[p.id].reglages }
            : { pile: [], reglages: {} },
          dessins: (parDessin[p.id] ?? []).map((d) => ({
            id: d.id, nom: d.nom, couleur: d.couleur,
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
