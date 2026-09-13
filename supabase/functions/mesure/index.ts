/**
 * Collecte des mesures d'utilisation.
 *
 *   POST /mesure
 *   { "slug": "smcl-2026", "visiteur": "…", "support": "integre", "retenu": false,
 *     "gestes": [{ "genre": "fiche_stand", "canal": "plan", "cible": "s2e90eb0d" }, …] }
 *
 * `support` dit par quelle porte le plan a été atteint — navigateur, cadre posé
 * sur un site tiers, écran d'accueil, coque d'application — et `retenu` si le
 * navigateur a accepté de retenir le jeton du visiteur. Les deux accompagnent le
 * paquet et non chacun de ses gestes : ce sont des propriétés de l'ouverture de
 * la page. La base écarte un support qu'elle ne connaît pas, comme un canal.
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
  /*
   * Les origines des coques, que cette fonction-ci accepte en plus des autres.
   *
   * Un cadre posé sur un site tiers poste depuis notre domaine — le document
   * encadré est le nôtre — et n'a donc rien demandé de spécial. Deux portes
   * font exception, et perdaient jusqu'ici toutes leurs mesures en silence,
   * puisque la réponse ne portait pas leur origine et que `fetch` se tait :
   *
   *   · un cadre en bac à sable sans `allow-same-origin` poste depuis `null` ;
   *   · une coque d'application qui embarque la page au lieu de charger
   *     l'adresse hébergée poste depuis le protocole de son cadre de travail.
   *
   * Ce sont les seules ajoutées : la liste reste close, et une coque imprévue
   * s'ajoute par `ORIGINES_AUTORISEES` sans toucher au code. Rien ici n'ouvre
   * de lecture — la réponse est vide — et aucun appel ne porte d'identité :
   * la fonction ne lit ni cookie, ni session, ni en-tête d'autorisation.
   */
  "null",
  "capacitor://localhost",
  "ionic://localhost",
  "http://localhost",
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
      support?: string;
      retenu?: boolean;
      gestes?: { genre?: string; canal?: string; cible?: string; objet?: string }[];
    } | null;
    if (!corps) return refus("Corps illisible.");

    const slug = String(corps.slug ?? "").slice(0, 80);
    const visiteur = jeton(corps.visiteur);
    if (!slug || !visiteur) return refus("Paramètres manquants.");

    /* Les identifiants de cible sont plus longs qu'un jeton — un identifiant de
       conférence vient d'Eventmaker et n'a pas de forme imposée — mais ils
       restent bornés, et la base écarte de toute façon ceux qu'elle ne connaît
       pas pour cet événement.

       `objet` dit ce que la cible désigne, et n'accompagne que les gestes dont
       l'objet ne se devine pas — un itinéraire, un ajout au programme. La base
       le déduit du genre pour les autres. */
    const gestes = (Array.isArray(corps.gestes) ? corps.gestes : [])
      .slice(0, PAQUET_MAX)
      .map((g) => ({
        genre: jeton(g?.genre, 20),
        canal: jeton(g?.canal, 20),
        cible: jeton(g?.cible, 64),
        objet: jeton(g?.objet, 20),
      }))
      .filter((g) => g.genre);
    // rien à écrire n'est pas une erreur : la page a pu envoyer un paquet
    // vidé par les filtres, et elle n'a rien à en faire
    if (!gestes.length) return new Response(null, { status: 204, headers: CORS });

    const { data, error } = await client().rpc("enregistre_mesures", {
      p_slug: slug,
      p_visiteur: visiteur,
      p_gestes: gestes,
      /* Borné ici, trié là-bas : la liste des quatre portes vit dans
         `enregistre_mesures`, et un support inconnu y rejoint « non précisé »
         plutôt que d'ouvrir une colonne au premier venu. `retenu` ne vaut faux
         que dit faux — une page d'avant ce déploiement ne l'envoie pas, et
         l'absence garde alors la confiance qu'on lui faisait. */
      p_support: jeton(corps.support, 20),
      p_retenu: corps.retenu !== false,
    });
    if (error) return refus(error.message, 500);
    if (data === false) return refus("Événement introuvable ou non publié.", 404);

    return new Response(null, { status: 204, headers: CORS });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return refus(message, 500);
  }
});
