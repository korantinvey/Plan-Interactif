/**
 * Les plans de visite annoncés : les poser, et lire la charge qu'ils font.
 *
 *   POST /plan-de-visite
 *   { "slug": "fep-2027", "plan": "a1b2c3…",
 *     "etapes": [{ "jour": "2027-03-22", "tranche": 20, "cible": "s2e90eb0d" }, …] }
 *
 *   GET  /plan-de-visite?slug=fep-2027&min=3
 *   → { "jours": { "20270322": { "s2e90eb0d": { "20": 3, "21": 1 } } } }
 *
 * Ce que `plan` désigne, et surtout ce qu'il ne désigne pas. C'est
 * l'identifiant du parcours, tiré au hasard par le navigateur et gardé avec la
 * liste. Il existe pour une seule raison : qu'une journée recalculée remplace
 * son plan au lieu de s'y ajouter — sans quoi une personne qui retouche dix
 * fois ferait dix visiteurs, et un embouteillage à elle seule.
 *
 * Il n'est pas le jeton de mesure, et c'est pourquoi cette fonction existe à
 * côté de `mesure` plutôt que dedans. Les deux voyagent par deux chemins
 * séparés parce que « ce que cette personne compte faire » joint à « ce qu'elle
 * a consulté » ferait une trajectoire, ce que ce système ne garde pas. Un seul
 * point d'entrée aurait suffi techniquement ; la séparation est ce qui rend la
 * promesse vérifiable, et non seulement énoncée.
 *
 * Rien n'est vérifié ici de ce que la base sait refuser : `pose_plan_de_visite`
 * résout l'événement, écarte les étapes mal formées et les stands que le salon
 * ne porte pas, remplace en bloc et fait le ménage des jours passés — le tout
 * dans une transaction. Cette fonction-ci ne fait que ce qu'elle seule peut
 * faire : borner ce qui vient du navigateur.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

/*
 * Toutes les origines, comme `mesure`, et pour les mêmes raisons — celles-là
 * mêmes que la fonction voisine expose en long.
 *
 * Côté écriture : un cadre en bac à sable poste depuis « null », une coque
 * d'application depuis le protocole de son cadre de travail. Une liste
 * d'origines ne garde rien qu'un `curl` n'ignore, et jetait en silence les
 * plans des portes qu'on n'avait pas devinées.
 *
 * Côté lecture, qui est la nouveauté : ce qui sort d'ici est un entier par
 * (stand, demi-heure), sans jeton, sans identifiant de plan, joignable à rien.
 * Le refuser à une coque reviendrait à lui rendre la journée organisée pire
 * qu'ailleurs, sans rien protéger.
 */
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

/** Une journée organisée porte une vingtaine d'étapes, un séjour de quatre
 *  jours quatre-vingts. Au-delà, ce n'est plus une visite. */
const ETAPES_MAX = 200;

/** Ce qui vient du navigateur n'entre qu'en une forme connue et bornée. */
const jeton = (v: unknown, max = 40) =>
  String(v ?? "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, max);

const client = () =>
  createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

const json = (corps: unknown, statut = 200) =>
  new Response(JSON.stringify(corps), {
    status: statut,
    headers: { ...CORS, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  try {
    const url = new URL(req.url);

    /* La lecture. `min` est la plus petite cellule qui coûte quelque chose à
       la page : au-dessous du seuil de sa courbe, une cellule ne pèse rien
       chez elle, et l'emporter serait payer du réseau pour du silence. La base
       reborne — le chiffre vient du navigateur.

       Le commentaire de la migration qui pose `charge_prevue` décrit, lui, un
       refus de poser sur une demi-heure pleine : c'était la règle du jour où
       elle a été écrite, et une migration ne se réécrit pas. La page en fait
       depuis un prix. */
    if (req.method === "GET") {
      const slug = String(url.searchParams.get("slug") ?? "").slice(0, 80);
      if (!slug) return json({ erreur: "Paramètres manquants." }, 400);
      const min = Math.round(Number(url.searchParams.get("min")));
      const { data, error } = await client().rpc("charge_prevue", {
        p_slug: slug,
        p_min: Number.isFinite(min) && min > 1 ? Math.min(min, 1000) : 1,
      });
      if (error) return json({ erreur: error.message }, 500);
      return json(data ?? { jours: {} });
    }

    if (req.method !== "POST") return json({ erreur: "Méthode non permise." }, 405);

    const corps = await req.json().catch(() => null) as {
      slug?: string;
      plan?: string;
      etapes?: { jour?: string; tranche?: number; cible?: string }[];
    } | null;
    if (!corps) return json({ erreur: "Corps illisible." }, 400);

    const slug = String(corps.slug ?? "").slice(0, 80);
    const plan = jeton(corps.plan);
    if (!slug || !plan) return json({ erreur: "Paramètres manquants." }, 400);

    /* Les identifiants de stand viennent de Klipso et n'ont pas de forme
       imposée : bornés en longueur, et la base écarte de toute façon ceux que
       l'événement ne porte pas. Le jour se borne à sa forme — la base le
       revérifie, et c'est elle qui refuse un jour passé. */
    const etapes = (Array.isArray(corps.etapes) ? corps.etapes : [])
      .slice(0, ETAPES_MAX)
      .map((e) => ({
        jour: String(e?.jour ?? "").slice(0, 10),
        tranche: Math.round(Number(e?.tranche)),
        cible: jeton(e?.cible, 64),
      }))
      .filter((e) => e.cible && Number.isFinite(e.tranche) &&
                     e.tranche >= 0 && e.tranche < 48);

    /* Une liste vide n'est pas une erreur, et n'est pas non plus un
       non-événement : c'est un parcours qu'on a vidé, et son plan doit
       disparaître avec lui. On pose donc quand même — la base efface d'abord,
       et n'insère rien. */
    const { data, error } = await client().rpc("pose_plan_de_visite", {
      p_slug: slug,
      p_plan: plan,
      p_etapes: etapes,
    });
    if (error) return json({ erreur: error.message }, 500);
    if (data === false) return json({ erreur: "Événement introuvable ou non publié." }, 404);

    return new Response(null, { status: 204, headers: CORS });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return json({ erreur: message }, 500);
  }
});
