/**
 * Les vignettes des logos d'un salon, par petits lots.
 *
 * Fabriquer une vignette est du calcul pur — décoder, recadrer, réduire,
 * encoder — et une fonction n'a qu'une part bornée de temps processeur. Ce
 * travail a d'abord été tenté au milieu de la synchronisation : elle s'y
 * faisait tuer avant la fin. Il vit donc ici, où chaque appel repart avec sa
 * propre part : c'est le nombre de logos par appel qui tient dans cette part,
 * et l'appelant en redemande tant qu'il en reste.
 *
 * Rien n'attend ces vignettes. Un logo qui n'en a pas encore se charge chez la
 * source, comme il l'a toujours fait ; aucune panne d'ici n'en est une.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { cleDeVignette, fabriqueVignette } from "../_partage/vignette.ts";

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

/* Combien de logos par appel, et combien de temps au plus.
 *
 * La part de calcul d'une fonction se compte en secondes, et c'est du calcul
 * pur qu'on fait ici. Deux logos, parce que le premier d'un isolat froid paie
 * la mise en route des codecs — une seconde et demie — quand les suivants
 * coûtent deux dixièmes : un lot plus gros passerait tant qu'il passe, et plus
 * du tout le jour où la plateforme resserre. C'est déjà l'erreur qui a tué la
 * synchronisation.
 *
 * La garde de temps double le compte parce qu'ils ne mesurent pas la même
 * chose : le lot borne le travail prévu, la garde arrête celui qui s'éternise
 * — une source lente à répondre, une image plus lourde que prévu. Ce qui reste
 * part au tour suivant, et l'appelant en redemande. */
const LOT = Number(Deno.env.get("LOT_VIGNETTES") ?? 2);
const MS_MAX = Number(Deno.env.get("MS_VIGNETTES") ?? 1200);

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
       on exige un utilisateur authentifié, et le droit sur ce salon-là. */
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

    const corps = await req.json().catch(() => ({})) as { evenementId?: string };
    if (!corps.evenementId) return repond({ erreur: "evenementId manquant." }, 400);

    /* La suite écrit avec la clé de service, qui ignore les politiques de la
       base : c'est donc ici, et nulle part plus loin, que se vérifie le droit
       de l'appelant sur ce salon. */
    const { data: permis } = await commeUtilisateur
      .from("evenement").select("id").eq("id", corps.evenementId).maybeSingle();
    if (!permis) return repond({ erreur: "Salon inaccessible." }, 403);

    const db = service();

    const { data: plans } = await db.from("plan")
      .select("id").eq("evenement_id", corps.evenementId);
    const ids = (plans ?? []).map((p) => (p as { id: string }).id);
    if (!ids.length) return repond({ faites: 0, reste: 0, total: 0 });

    const { data: instantanes } = await db.from("instantane")
      .select("charge").in("plan_id", ids);
    const adresses = adressesDeLogos((instantanes ?? []) as { charge: unknown }[]);
    if (!adresses.length) return repond({ faites: 0, reste: 0, total: 0 });

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
    let faites = 0;
    /* Les échecs comptent comme faits pour l'appelant : sans cela il
       redemanderait sans fin le même logo qu'aucune source ne rend. Ils ne
       sont pas enregistrés pour autant — une source qui revient sera reprise
       au passage suivant. */
    let refusees = 0;
    const debut = Date.now();
    for (const source of aFaire.slice(0, LOT)) {
      /* On ne commence jamais un logo qu'on n'a plus le temps de finir : le
         premier passe toujours, quoi qu'il coûte, et c'est ce qui garantit
         qu'on avance même sur un isolat froid. */
      if (faites + refusees > 0 && Date.now() - debut > MS_MAX) break;
      const v = await fabriqueVignette(source);
      if (!v) { refusees++; continue; }
      const cle = await cleDeVignette(source);
      const { error } = await db.from("vignette_de_logo").upsert({
        cle,
        source,
        image: v.image,
        largeur: v.largeur,
        hauteur: v.hauteur,
        pose: new Date().toISOString(),
      }, { onConflict: "cle" });
      if (!error) faites++;
    }

    return repond({
      faites,
      refusees,
      reste: Math.max(0, aFaire.length - faites - refusees),
      total: adresses.length,
      ms: Date.now() - debut,
    });
  } catch (err) {
    return repond({ erreur: err instanceof Error ? err.message : String(err) }, 500);
  }
});
