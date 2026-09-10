/**
 * Collecte des mesures d'utilisation.
 *
 *   POST /mesure
 *   { "slug": "smcl-2026", "visiteur": "…", "session": "…",
 *     "gestes": [{ "genre": "fiche_stand", "canal": "plan", "cible": "s2e90eb0d" }, …] }
 *
 * La page envoie ses gestes par paquets plutôt qu'un par un : un appui sur un
 * stand ne vaut pas un aller-retour réseau, et un visiteur qui fait trente
 * gestes en une visite n'a pas à payer trente requêtes.
 *
 * Pourquoi une fonction plutôt qu'une écriture directe dans la table : une
 * table ouverte en écriture au public est un formulaire de spam. Ici la clé de
 * service reste au serveur, et seul un événement publié est mesuré — un
 * brouillon n'a pas de visiteurs.
 *
 * Tout le travail tient dans un appel : `enregistre_mesures` résout
 * l'événement, filtre le vocabulaire et incrémente les trois compteurs dans une
 * seule transaction. La fonction ne vérifie donc plus ici ce que la base sait
 * déjà refuser — le vocabulaire n'est énuméré qu'à un endroit — et se contente
 * de ce qu'elle seule peut faire : borner ce qui vient du navigateur.
 *
 * Ce qu'elle ne fait pas, et ne fera pas : lire l'adresse IP, retenir l'agent
 * utilisateur, poser un cookie. Le jeton de visiteur est tiré par le
 * navigateur, propre à l'événement, et ne désigne personne.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

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
    "Vary": "Origin",
  };
};
const METHODES = { "Access-Control-Allow-Methods": "POST, OPTIONS" };

/** Un paquet ne peut pas grossir indéfiniment : au-delà, on coupe. */
const PAQUET_MAX = 60;

/** Ce qui vient du navigateur n'entre qu'en une forme connue et bornée. */
const jeton = (v: unknown, max = 40) =>
  String(v ?? "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, max);

const client = () =>
  createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

Deno.serve(async (req) => {
  const CORS = { ...cors(req), ...METHODES };
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ erreur: "Méthode non permise." }), {
      status: 405,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  const refus = (message: string, code = 400) =>
    new Response(JSON.stringify({ erreur: message }), {
      status: code,
      headers: { ...CORS, "Content-Type": "application/json", "Cache-Control": "no-store" },
    });

  try {
    const corps = await req.json().catch(() => null) as {
      slug?: string;
      visiteur?: string;
      session?: string;
      gestes?: { genre?: string; canal?: string; cible?: string }[];
    } | null;
    if (!corps) return refus("Corps illisible.");

    const slug = String(corps.slug ?? "").slice(0, 80);
    const visiteur = jeton(corps.visiteur);
    if (!slug || !visiteur) return refus("Paramètres manquants.");

    /* Les identifiants de cible sont plus longs qu'un jeton — un identifiant de
       conférence vient d'Eventmaker et n'a pas de forme imposée — mais ils
       restent bornés, et la base écarte de toute façon ceux qu'elle ne connaît
       pas pour cet événement. */
    const gestes = (Array.isArray(corps.gestes) ? corps.gestes : [])
      .slice(0, PAQUET_MAX)
      .map((g) => ({
        genre: jeton(g?.genre, 20),
        canal: jeton(g?.canal, 20),
        cible: jeton(g?.cible, 64),
      }))
      .filter((g) => g.genre);
    // rien à écrire n'est pas une erreur : la page a pu envoyer un paquet
    // vidé par les filtres, et elle n'a rien à en faire
    if (!gestes.length) return new Response(null, { status: 204, headers: CORS });

    const { data, error } = await client().rpc("enregistre_mesures", {
      p_slug: slug,
      p_visiteur: visiteur,
      p_gestes: gestes,
    });
    if (error) return refus(error.message, 500);
    if (data === false) return refus("Événement introuvable ou non publié.", 404);

    return new Response(null, { status: 204, headers: CORS });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return refus(message, 500);
  }
});
