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

/*
 * Cette fonction-ci accepte toutes les origines, à l'inverse des autres du
 * projet, et il n'y a donc aucune liste à tenir pour qu'une porte compte.
 *
 * Ce n'est pas un relâchement, c'est la reconnaissance de ce que CORS fait et
 * ne fait pas. Il n'a jamais rien gardé ici : un `curl` l'ignore entièrement,
 * et ce qui protège réellement l'écriture est ailleurs — la clé de service
 * reste au serveur, le vocabulaire est clos, la cible doit exister dans
 * l'événement, l'événement doit être publié, le paquet est borné. Ce que la
 * liste d'origines faisait, en revanche, c'était jeter en silence les mesures
 * de tout visiteur qui n'était pas arrivé par un domaine inscrit : un cadre en
 * bac à sable poste depuis `null`, une coque d'application qui embarque la page
 * poste depuis le protocole de son cadre de travail. Le navigateur coupait,
 * `fetch` se taisait, et la porte dont on voulait mesurer l'usage était la
 * seule à ne rien compter — sans qu'aucun écran ne le dise.
 *
 * Tenir la liste à jour aurait voulu dire deviner d'avance chaque coque, chaque
 * site partenaire et chaque bac à sable ; l'oubli ne se voit qu'au rapport, des
 * semaines plus tard, sous la forme d'un salon qui paraît désert.
 *
 * Rien ne sort d'ici : la réponse est vide, on n'y lit aucune donnée, et aucun
 * appel ne porte d'identité — ni cookie, ni session, ni en-tête d'autorisation,
 * donc aucune requête ne peut emprunter les droits de qui la déclenche. Ouvrir
 * n'expose rien de plus que ce qu'un visiteur poste déjà.
 *
 * C'est la seule fonction dans ce cas. `plan-public`, `comptes` et
 * `sync-evenement` gardent leur liste : elles, rendent des données.
 */
const CORS_TOUS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey",
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
  const CORS = { ...CORS_TOUS, ...METHODES };
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
