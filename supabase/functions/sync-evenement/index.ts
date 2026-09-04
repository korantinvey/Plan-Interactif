/**
 * Synchronisation d'un événement depuis Klipso.
 *
 * Deux usages :
 *   { action: "plans", instance, eventId }  → liste les pavillons, sans rien
 *                                             écrire. Sert à la console avant
 *                                             qu'un événement soit enregistré.
 *   { evenementId }                         → synchronisation complète.
 *
 * La clé Klipso vient des secrets de la fonction. Elle ne transite ni par la
 * requête, ni par la base, ni par le navigateur.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { Gaia, egal } from "../_partage/gaia.ts";
import { versAnneaux, versTrace, boite, emprise, dedans } from "../_partage/geometrie.ts";
import { allege, textes } from "../_partage/svg.ts";

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

const NOMS: Record<string, string> = {
  "Batiment": "Bâtiment",
  "INFOPRO_SURFACE_POTEAUX": "Poteaux",
  "INFOPRO_SECTEURS_DELIMITATION": "Délimitation des secteurs",
  "INFOPRO_SECTEURS_DELIMITATIONS": "Délimitation des secteurs",
  "INFOPRO_FIL_JAUNE": "Fil jaune",
  "INFOPRO_COTES_ALLEES": "Cotes des allées",
  "INFOPRO_COTES_ILOTS": "Cotes des îlots",
  "INFOPRO_LETTRE_ALLEE": "Lettres d'allée",
  "INFOPRO_NUMEROTATION_STAND_VALIDEE": "Numérotation des stands",
  "INFOPRO_TEXTE_ZONES_ORGA": "Textes des zones organisateur",
  "INFOPRO_NOM_ZONE_IG": "Noms des zones IG",
  "INFOPRO_ZONE_NON_ELINGUABLE": "Zones non élingables",
};

// Les calques de texte que le rendu recalcule lui-même : conservés, mais c'est
// d'eux qu'on tire les noms de zones tant que x_LibZOD n'est pas renseigné.
const CALQUES_TEXTE = ["INFOPRO_TEXTE_ZONES_ORGA", "INFOPRO_NOM_ZONE_IG"];

// Annotations techniques posées sur le plan : ce ne sont pas des noms de zone.
const TECHNIQUE = /\bkW\b|Hauteur \d|Coffret|Mur inclinable/i;

const client = () =>
  createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

const gaia = (instance: string, eventId?: string) =>
  new Gaia({ instance, apiKey: Deno.env.get("KLIPSO_API_KEY") ?? "", eventId });

/** Fournisseur retenu pour un domaine, Klipso à défaut. */
const fournisseur = (evt: Record<string, any>, domaine: string) =>
  String((evt.sources ?? {})[domaine]?.fournisseur || "klipso");

Deno.serve(async (req) => {
  const CORS = { ...cors(req), ...METHODES };
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  const repond = (corps: unknown, code = 200) =>
    new Response(JSON.stringify(corps), {
      status: code,
      headers: { ...CORS, "Content-Type": "application/json" },
    });

  try {
    /* La synchronisation écrit dans la base et interroge Klipso avec la clé
       de l'organisateur : elle exige un utilisateur authentifié, pas la
       simple clé publique qui circule dans toutes les pages. */
    const utilisateur = await createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
        auth: { persistSession: false } },
    ).auth.getUser();
    if (!utilisateur.data?.user) {
      return repond({ erreur: "Authentification requise." }, 401);
    }

    const corps = await req.json();

    /* ------------------ découverte des pavillons ------------------ */
    if (corps.action === "plans") {
      const instance = corps.instance ?? Deno.env.get("KLIPSO_INSTANCE");
      if (!instance) return repond({ erreur: "Instance manquante." }, 400);
      const g = gaia(instance, corps.eventId);
      const plans = await g.tout<Record<string, unknown>>("Plan", {
        fields: ["Id", "Libelle", "HallExp"],
      });
      return repond({
        plans: plans.map((p) => ({ Id: p.Id, Libelle: p.Libelle, HallExp: p.HallExp })),
      });
    }

    /* ------------------ synchronisation complète ------------------ */
    if (!corps.evenementId) return repond({ erreur: "evenementId manquant." }, 400);
    const db = client();

    const { data: evt, error: e1 } = await db
      .from("evenement").select("*").eq("id", corps.evenementId).single();
    if (e1 || !evt) return repond({ erreur: "Événement introuvable." }, 404);

    // Les domaines que cette synchronisation alimente. Les conférences et les
    // produits se configurent déjà mais rien ne les lit encore : les passer
    // sous silence ferait croire qu'ils sont repris.
    for (const [nom, dom] of [["le plan", "plan"], ["les stands", "stands"]] as const) {
      const f = fournisseur(evt, dom);
      if (f !== "klipso") {
        return repond({
          erreur: `Source « ${f} » pas encore prise en charge pour ${nom}.`,
        }, 400);
      }
    }

    const g = gaia(evt.instance, evt.event_id ?? undefined);
    const resume: Record<string, unknown>[] = [];

    /* Les nomenclatures ne portent qu'un code — « FEP26_NOM10201 » — dont le
       libellé vit dans le service « codification ». On le résout ici, une fois
       pour tout l'événement, plutôt qu'à chaque affichage.

       L'échec n'est pas bloquant : sans libellé le plan reste juste, avec des
       codes. Perdre une synchronisation entière pour un défaut d'habillage
       serait disproportionné. */
    let libNomencl: Record<string, string> = {};
    let errNomencl: string | null = null;
    let cheminNomencl: string | null = null;
    try {
      cheminNomencl = await g.cheminCodification("DossierExp", "x_Nomenclature");
      libNomencl = await g.codification(cheminNomencl);
    } catch (e) {
      errNomencl = e instanceof Error ? e.message : String(e);
    }

    /** Le libellé s'il est connu ; sinon le code, dépouillé de son préfixe de
     *  salon — « FEP26_NOM10201 » ne dit rien de plus que « NOM10201 ». */
    const nomenclature = (v: unknown): string[] | null => {
      if (!v) return null;
      const liste = ([] as unknown[]).concat(v).map(String).filter(Boolean);
      if (!liste.length) return null;
      return liste.map((c) => libNomencl[c] || c.replace(/^[A-Z0-9]+_/, ""));
    };

    let plans = await g.tout<Record<string, any>>("Plan", { fields: ["_AllFields"] });
    // Un pavillon représente plusieurs mégaoctets de SVG à alléger : on peut
    // le traiter seul si la synchronisation complète dépasse le temps imparti.
    if (corps.idPlan) plans = plans.filter((p) => p.Id === corps.idPlan);
    if (!plans.length) return repond({ erreur: "Aucun pavillon à traiter." }, 404);

    for (const plan of plans) {
      /* --- le pavillon --- */
      const { data: ligne } = await db.from("plan").upsert({
        evenement_id: evt.id,
        id_klipso: plan.Id,
        libelle: String(plan.Libelle ?? "")
          .replace(/^[A-Z]+\d*_/, "").replace(/^PAVILLON /i, "Pavillon "),
        hall: plan.HallExp ?? null,
        modifie_le: new Date().toISOString(),
      }, { onConflict: "evenement_id,id_klipso" }).select("id").single();
      if (!ligne) continue;
      const planId = ligne.id as string;

      /* --- calques d'habillage --- */
      const calques = await g.tout<Record<string, any>>("Calque", {
        fields: ["Id", "IdPlan", "Libelle", "Type", "Ordre", "VisibleParDefaut", "SVG"],
        filter: egal("IdPlan", plan.Id),
      }, "Ordre");

      const textesZone: { x: number; y: number; txt: string }[] = [];
      for (const c of calques) {
        if (!c.SVG?.idMedia) continue;
        const brut = await g.media(c.SVG.idMedia);
        if (CALQUES_TEXTE.includes(c.Libelle)) textesZone.push(...textes(brut));
        const { svg } = allege(brut);
        await db.from("calque").upsert({
          plan_id: planId,
          id_klipso: c.Id,
          cle: c.Libelle,
          libelle: NOMS[c.Libelle] ?? c.Libelle,
          type: c.Type ?? null,
          ordre_klipso: c.Ordre ?? null,
          svg,
        }, { onConflict: "plan_id,id_klipso" });
      }

      /* --- stands --- */
      const bruts = await g.tout<Record<string, any>>("Stand", {
        fields: [
          "Id", "IdPlan", "IdIlot", "IdDossierExpAff", "NomSurPlan", "Enseigne",
          "Allee", "NoStand", "Allee2", "NoStand2", "NbAngles", "NbNiveau",
          "Longueur", "Largeur", "SurfaceBrute", "EtatCommercialisation",
          "StandFictif", "x_CouleurPlan",
        ],
        entities: {
          SetStandShapeStand: { fields: ["Shape", "IdCalque", "SurfaceBrute"] },
          RefDossierExpAff: {
            fields: [
              "Id", "AvancementImplantation", "x_ExcluListeexposants",
              "x_Catalogue_RaisonSociale", "x_Nomenclature",
              "x_Catalogue_SiteWeb", "Categorie",
            ],
          },
        },
        filter: egal("IdPlan", plan.Id),
      });

      const stands = [];
      for (const s of bruts) {
        const formes = s.SetStandShapeStand ? [].concat(s.SetStandShapeStand) : [];
        const anneaux = formes.flatMap((f: any) => versAnneaux(f?.Shape) ?? []);
        if (!anneaux.length) continue;
        const dos = s.RefDossierExpAff;
        // engagement contractuel : un exposant qui refuse le catalogue ne sort pas
        const exclu = dos?.x_ExcluListeexposants === true;
        stands.push({
          id: "s" + String(s.Id).slice(0, 8),
          code: [s.Allee, s.NoStand].filter(Boolean).join("") || null,
          plan: s.NomSurPlan ?? null,
          nom: dos && !exclu ? dos.x_Catalogue_RaisonSociale : null,
          site: dos && !exclu ? nettoieUrl(dos.x_Catalogue_SiteWeb) : null,
          nomencl: dos && !exclu ? nomenclature(dos.x_Nomenclature) : null,
          m2: s.SurfaceBrute,
          angles: s.NbAngles,
          niveaux: s.NbNiveau,
          etat: s.EtatCommercialisation,
          d: versTrace(anneaux),
          ...boite(anneaux),
        });
      }

      /* --- zones de dessin --- */
      const grappes = groupeTextes(textesZone);
      const zonesBrutes = await g.tout<Record<string, any>>("ZoneDessin", {
        fields: ["_AllFields"],
        filter: egal("IdPlan", plan.Id),
      });

      const zones = [];
      for (const z of zonesBrutes) {
        const anneaux = versAnneaux(z.Shape);
        if (!anneaux) continue;
        const b = boite(anneaux);
        // à défaut de x_LibZOD renseigné, on lit le libellé posé sur le plan
        const dedansMoi = grappes
          .filter((l) => dedans([l.x, l.y], anneaux[0]) && !TECHNIQUE.test(l.txt))
          .sort((a, c) =>
            Math.hypot(a.x - b.c[0], a.y - b.c[1]) -
            Math.hypot(c.x - b.c[0], c.y - b.c[1]));
        zones.push({
          id: "z" + String(z.Id).slice(0, 8),
          nom: z.x_LibZOD ?? (dedansMoi.length ? dedansMoi[0].txt : null),
          m2: z.Surface,
          d: versTrace(anneaux),
          ...b,
        });
      }

      const emp = emprise([...stands, ...zones]);
      await db.from("plan").update({
        emprise: emp,
        nb_stands: stands.length,
        nb_zones: zones.length,
        modifie_le: new Date().toISOString(),
      }).eq("id", planId);

      await db.from("instantane").upsert({
        plan_id: planId,
        charge: { stands, zones, emprise: emp },
        genere_le: new Date().toISOString(),
      }, { onConflict: "plan_id" });

      resume.push({
        pavillon: plan.Libelle,
        stands: stands.length,
        exposants: stands.filter((s) => s.nom).length,
        zones: zones.length,
        zonesNommees: zones.filter((z) => z.nom).length,
      });
    }

    // une synchronisation partielle ne fait pas foi comme date de référence
    if (!corps.idPlan) {
      await db.from("evenement").update({
        derniere_sync: new Date().toISOString(),
        derniere_err: null,
        modifie_le: new Date().toISOString(),
      }).eq("id", evt.id);
    }

    // Le compte des libellés dit tout de suite si la codification a répondu :
    // sans lui, un plan rempli de codes passerait pour un plan correct.
    return repond({
      ok: true,
      pavillons: resume,
      nomenclature: {
        libelles: Object.keys(libNomencl).length,
        chemin: cheminNomencl,
        erreur: errNomencl,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    try {
      const corps = await req.clone().json().catch(() => ({}));
      if (corps.evenementId) {
        await client().from("evenement")
          .update({ derniere_err: message }).eq("id", corps.evenementId);
      }
    } catch { /* la remontée de l'erreur prime sur son enregistrement */ }
    return repond({ erreur: message }, 500);
  }
});

/** Les adresses saisies à la main contiennent parfois des slashes échappés. */
function nettoieUrl(u: unknown): string | null {
  if (!u) return null;
  const s = String(u).replace(/\\/g, "");
  return /^https?:/i.test(s) ? s : "https://" + s;
}

/**
 * Les libellés de zone sont posés ligne par ligne sur le plan : on regroupe
 * ceux qui se touchent, puis on les lit de haut en bas.
 */
function groupeTextes(mots: { x: number; y: number; txt: string }[]) {
  const grappes: { mots: typeof mots }[] = [];
  for (const w of [...mots].sort((a, b) => a.y - b.y)) {
    const g = grappes.find((g) =>
      g.mots.some((o) => Math.abs(o.x - w.x) < 4.5 && Math.abs(o.y - w.y) < 2.6));
    if (g) g.mots.push(w);
    else grappes.push({ mots: [w] });
  }
  return grappes.map((g) => ({
    x: g.mots.reduce((a, m) => a + m.x, 0) / g.mots.length,
    y: g.mots.reduce((a, m) => a + m.y, 0) / g.mots.length,
    txt: g.mots.sort((a, b) => a.y - b.y).map((m) => m.txt)
      .join(" ").replace(/\s+/g, " ").trim(),
  }));
}
