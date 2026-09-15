/**
 * Les vignettes des logos d'un salon : ce qu'il reste à faire, et ce qui vient
 * d'être fait.
 *
 * Cette fonction ne fabrique rien. Elle l'a tenté, en WebAssembly, et la
 * plateforme a refusé l'appel avant même le premier logo décodé : une fonction
 * n'a pas le temps de calcul qu'il faut pour décoder des images. C'est le
 * navigateur de l'exploitant qui s'en charge — il a la puissance, et il ne le
 * fait qu'une fois par salon.
 *
 * Il reste donc deux gestes, et aucun calcul : dire quelles adresses n'ont pas
 * encore leur vignette, et enregistrer celles qu'on lui rend. C'est ici, et
 * non chez l'appelant, que se calcule la clé qui les nomme : une vignette
 * envoyée par la console et une vignette demandée par la page doivent porter
 * le même nom.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { cleDeVignette } from "../_partage/vignette.ts";

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

/* Combien d'adresses on rend à la fois. La console les traite une par une et
   revient en redemander : un lot plus gros ne ferait que retarder son premier
   coup de pioche, et un lot plus petit multiplierait les allers-retours pour
   rien. */
const LOT = Number(Deno.env.get("LOT_VIGNETTES") ?? 40);

const service = () =>
  createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

/** Les adresses de logo d'un salon, sans doublon : une enseigne qui loue
 *  plusieurs stands n'a qu'un logo, et les sociétés hébergées ont le leur. */
function adressesDeLogos(instantanes: { charge: unknown }[]): string[] {
  const vues = new Set<string>();
  for (const inst of instantanes) {
    const charge = (inst?.charge ?? {}) as Record<string, unknown>;
    for (const s of (charge.stands ?? []) as Record<string, unknown>[]) {
      if (typeof s.logo === "string" && s.logo) vues.add(s.logo);
      for (const c of (s.coex ?? []) as Record<string, unknown>[]) {
        if (c && typeof c.logo === "string" && c.logo) vues.add(c.logo);
      }
    }
  }
  return [...vues];
}

Deno.serve(async (req) => {
  const CORS = { ...cors(req), ...METHODES };
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  const repond = (corps: unknown, code = 200) =>
    new Response(JSON.stringify(corps), {
      status: code,
      headers: { ...CORS, "Content-Type": "application/json" },
    });

  try {
    /* Fabriquer écrit dans la base et va chercher des images chez des tiers :
       on exige un utilisateur authentifié, et le droit sur ce salon-là.

       Le contrôle est fait ici et non par la passerelle — « verify_jwt =
       false » dans `config.toml`, comme pour la synchronisation : un refus de
       la passerelle rend un corps que l'appelant ne sait pas lire, quand
       celui-ci nomme ce qui manque. */
    const commeUtilisateur = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
        auth: { persistSession: false },
      },
    );
    if (!(await commeUtilisateur.auth.getUser()).data?.user) {
      return repond({ erreur: "Authentification requise." }, 401);
    }

    const corps = await req.json().catch(() => ({})) as {
      evenementId?: string;
      vignettes?: { source: string; image: string; largeur: number; hauteur: number }[];
    };
    if (!corps.evenementId) return repond({ erreur: "evenementId manquant." }, 400);

    /* La suite écrit avec la clé de service, qui ignore les politiques de la
       base : c'est donc ici, et nulle part plus loin, que se vérifie le droit
       de l'appelant sur ce salon. */
    const { data: permis } = await commeUtilisateur
      .from("evenement").select("id").eq("id", corps.evenementId).maybeSingle();
    if (!permis) return repond({ erreur: "Salon inaccessible." }, 403);

    const db = service();

    /* Ce que la console vient de fabriquer. Elle l'envoie par petits paquets,
       et repart aussitôt chercher la suite : c'est le seul geste qui écrit. */
    if (corps.vignettes?.length) {
      const lignes = [];
      for (const v of corps.vignettes) {
        if (!v?.source || !v.image) continue;
        lignes.push({
          cle: await cleDeVignette(v.source),
          source: v.source,
          image: v.image,
          largeur: v.largeur | 0,
          hauteur: v.hauteur | 0,
          pose: new Date().toISOString(),
        });
      }
      if (!lignes.length) return repond({ enregistrees: 0 });
      const { error } = await db.from("vignette_de_logo")
        .upsert(lignes, { onConflict: "cle" });
      if (error) return repond({ erreur: error.message }, 500);
      return repond({ enregistrees: lignes.length });
    }

    const { data: plans } = await db.from("plan")
      .select("id").eq("evenement_id", corps.evenementId);
    const ids = (plans ?? []).map((p) => (p as { id: string }).id);
    if (!ids.length) return repond({ aFaire: [], reste: 0, total: 0 });

    const { data: instantanes } = await db.from("instantane")
      .select("charge").in("plan_id", ids);
    const adresses = adressesDeLogos((instantanes ?? []) as { charge: unknown }[]);
    if (!adresses.length) return repond({ aFaire: [], reste: 0, total: 0 });

    /* Ce qui est déjà fait, demandé par adresse : la table porte les deux, et
       c'est l'adresse que l'instantané connaît. Par tranches — une requête qui
       porte cinq cents adresses dépasse ce qu'un intermédiaire transmet. */
    const connues = new Set<string>();
    for (let i = 0; i < adresses.length; i += 50) {
      const { data } = await db.from("vignette_de_logo")
        .select("source").in("source", adresses.slice(i, i + 50));
      for (const v of data ?? []) connues.add(String((v as { source: string }).source));
    }

    const aFaire = adresses.filter((a) => !connues.has(a));
    return repond({
      aFaire: aFaire.slice(0, LOT),
      reste: aFaire.length,
      total: adresses.length,
    });
  } catch (err) {
    return repond({ erreur: err instanceof Error ? err.message : String(err) }, 500);
  }
});
