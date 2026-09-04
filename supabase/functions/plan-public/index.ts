/**
 * API publique du plan.
 *
 *   GET /plan-public?slug=smcl-2026
 *
 * Assemble l'instantané, les calques d'habillage, l'apparence choisie et les
 * calques de dessin, et renvoie le document que la page sait déjà lire.
 *
 * Elle ne parle jamais à Klipso : elle lit ce que la synchronisation a écrit.
 * Le plan reste donc servi si GAIA est indisponible, et la clé API ne peut pas
 * fuiter par ce chemin.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

/** Origines autorisées. Le joker convenait au développement ; le plan
 *  reste public, mais on sait d'où il est appelé. */
const ORIGINES = [
  "https://plan-interactif.korantin-vey.workers.dev",
  "http://localhost:4180",
];
const cors = (req: Request) => {
  const o = req.headers.get("Origin") ?? "";
  return {
    "Access-Control-Allow-Origin": ORIGINES.includes(o) ? o : ORIGINES[0],
    "Access-Control-Allow-Headers": "authorization, content-type, apikey",
    "Vary": "Origin",
  };
};
const METHODES = { "Access-Control-Allow-Methods": "GET, OPTIONS" };

const db = () =>
  createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { auth: { persistSession: false } },
  );

Deno.serve(async (req) => {
  const CORS = { ...cors(req), ...METHODES };
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  const repond = (corps: unknown, code = 200, cache = 60) =>
    new Response(JSON.stringify(corps), {
      status: code,
      headers: {
        ...CORS,
        "Content-Type": "application/json",
        // le contenu ne bouge qu'à la synchronisation : on autorise le cache,
        // avec un délai de grâce large en cas d'indisponibilité
        "Cache-Control": code === 200
          ? `public, max-age=${cache}, stale-while-revalidate=600`
          : "no-store",
      },
    });

  try {
    const slug = new URL(req.url).searchParams.get("slug");
    if (!slug) return repond({ erreur: "Paramètre slug manquant." }, 400);

    const sb = db();

    // la politique de sécurité ne laisse passer que les événements publiés
    const { data: evt } = await sb
      .from("evenement")
      .select("id, nom, slug, derniere_sync")
      .eq("slug", slug)
      .maybeSingle();
    if (!evt) return repond({ erreur: "Événement introuvable ou non publié." }, 404);

    const { data: plans } = await sb
      .from("plan")
      .select("id, id_klipso, libelle, hall, emprise")
      .eq("evenement_id", evt.id)
      .order("libelle", { ascending: true });
    if (!plans?.length) return repond({ erreur: "Aucun pavillon publié." }, 404);

    const ids = plans.map((p) => p.id);
    const [calques, apparences, dessins, instantanes] = await Promise.all([
      sb.from("calque").select("plan_id, id_klipso, cle, libelle, ordre_klipso, svg").in("plan_id", ids),
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
      plans: plans.map((p) => {
        const inst = parInstantane[p.id];
        const charge = (inst?.charge ?? {}) as Record<string, unknown>;
        return {
          id: p.id_klipso,
          libelle: p.libelle,
          hall: p.hall,
          emprise: p.emprise ?? charge.emprise ?? null,
          fond: (parCalque[p.id] ?? [])
            .filter((c) => c.svg)
            .sort((a, b) => (a.ordre_klipso ?? 0) - (b.ordre_klipso ?? 0))
            .map((c) => ({
              // l'identifiant Klipso est la clé stable : les libellés changent
              id: c.id_klipso,
              cle: c.cle,
              nom: c.libelle,
              ordre: c.ordre_klipso,
              svg: c.svg,
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
