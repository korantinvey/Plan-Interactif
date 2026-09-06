/**
 * Collecte des mesures d'utilisation.
 *
 *   POST /mesure
 *   { "slug": "smcl-2026", "visiteur": "…", "session": "…",
 *     "gestes": [{ "genre": "fiche_stand", "canal": "plan" }, …] }
 *
 * La page envoie ses gestes par paquets plutôt qu'un par un : un appui sur un
 * stand ne vaut pas un aller-retour réseau, et un visiteur qui fait trente
 * gestes en trois minutes n'a pas à payer trente requêtes.
 *
 * Pourquoi une fonction plutôt qu'une écriture directe dans la table : une
 * table ouverte en écriture au public est un formulaire de spam. Ici la clé de
 * service reste au serveur, le vocabulaire est clos — un genre inconnu est
 * refusé, pas enregistré — et seul un événement publié est mesuré : un
 * brouillon n'a pas de visiteurs.
 *
 * Ce que la fonction ne fait pas, et ne fera pas : lire l'adresse IP, retenir
 * l'agent utilisateur, poser un cookie. Le jeton de visiteur est tiré par le
 * navigateur, propre à l'événement, et ne désigne personne.
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
    "Vary": "Origin",
  };
};
const METHODES = { "Access-Control-Allow-Methods": "POST, OPTIONS" };

/* Le vocabulaire, tel que la contrainte de la table le connaît. Une valeur
   hors liste n'est pas corrigée : le geste est écarté. Mieux vaut un compteur
   qui manque une ligne qu'une colonne où l'on ne sait plus ce qu'on lit. */
const GENRES = new Set([
  "visite", "recherche", "itineraire", "parcours", "fiche_stand", "fiche_conf",
]);
const CANAUX = new Set([
  "recherche", "liste", "plan", "image", "conference", "salle", "exposant",
  "parcours", "lien",
]);

/** Un paquet ne peut pas grossir indéfiniment : au-delà, on coupe. */
const PAQUET_MAX = 60;

/** Les jetons viennent du navigateur : on n'en garde qu'une forme connue. */
const jeton = (v: unknown) =>
  String(v ?? "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 40);

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
      gestes?: { genre?: string; canal?: string }[];
    } | null;
    if (!corps) return refus("Corps illisible.");

    const slug = String(corps.slug ?? "").slice(0, 80);
    const visiteur = jeton(corps.visiteur);
    const session = jeton(corps.session);
    if (!slug || !visiteur || !session) return refus("Paramètres manquants.");

    const gestes = (Array.isArray(corps.gestes) ? corps.gestes : [])
      .slice(0, PAQUET_MAX)
      .filter((g) => GENRES.has(String(g?.genre)))
      .map((g) => ({
        genre: String(g.genre),
        canal: CANAUX.has(String(g.canal)) ? String(g.canal) : null,
      }));
    // rien à écrire n'est pas une erreur : la page a pu envoyer un paquet
    // vidé par les filtres, et elle n'a rien à en faire
    if (!gestes.length) return new Response(null, { status: 204, headers: CORS });

    const sb = client();
    // un brouillon n'a pas de visiteurs : ce qu'on mesurerait serait
    // l'exploitant en train de préparer son salon
    const { data: evt, error: errEvt } = await sb
      .from("evenement")
      .select("id")
      .eq("slug", slug)
      .eq("etat", "publie")
      .maybeSingle();
    if (errEvt) return refus(errEvt.message, 500);
    if (!evt) return refus("Événement introuvable ou non publié.", 404);

    const { error } = await sb.from("mesure").insert(
      gestes.map((g) => ({
        evenement_id: evt.id,
        genre: g.genre,
        canal: g.canal,
        visiteur,
        session,
      })),
    );
    if (error) return refus(error.message, 500);

    return new Response(null, { status: 204, headers: CORS });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return refus(message, 500);
  }
});
