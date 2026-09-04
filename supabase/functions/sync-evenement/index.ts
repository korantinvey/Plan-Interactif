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
import {
  Eventmaker, cleStand, codeSalle,
  type ExposantEm, type ConferenceEm,
} from "../_partage/eventmaker.ts";
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

/* Un domaine que rien ne reprend vaut mieux « aucun » qu'un fournisseur choisi
   par défaut : celui-ci laisserait croire à une reprise qui n'a pas lieu. */
const DEFAUT: Record<string, string> = {
  plan: "klipso", stands: "klipso", conferences: "aucun", produits: "aucun",
};

/** Fournisseur retenu pour un domaine. */
const fournisseur = (evt: Record<string, any>, domaine: string) =>
  String((evt.sources ?? {})[domaine]?.fournisseur || DEFAUT[domaine] || "klipso");

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

    // La géométrie vient toujours de Klipso : c'est elle qui porte les stands
    // et leurs contours. Les conférences et les produits se configurent déjà
    // mais rien ne les lit encore.
    if (fournisseur(evt, "plan") !== "klipso") {
      return repond({
        erreur: `Source « ${fournisseur(evt, "plan")} » pas encore prise en charge pour le plan.`,
      }, 400);
    }

    /* Les exposants peuvent venir d'Eventmaker. Le rattachement se fait par le
       numéro de stand : Klipso le compose de l'allée et du numéro, Eventmaker
       le saisit à la main, et les deux sont comparés sous forme normalisée.

       La règle de reprise tient en une phrase : une fiche qui porte un numéro
       de stand nous intéresse, les autres non. Les catégories d'invités
       diffèrent d'un salon à l'autre, elles sont donc détectées et non
       configurées. */
    let expoEm: Map<string, ExposantEm> | null = null;
    let resumeEm: Record<string, unknown> | null = null;
    const srcStands = fournisseur(evt, "stands");
    // Ce qui peut être refusé tout de suite l'est avant d'ouvrir le flux :
    // un message d'erreur vaut mieux qu'une barre d'avancement qui s'arrête.
    if (srcStands === "eventmaker") {
      if (!String((evt.cles ?? {}).eventmaker ?? "")) {
        return repond({
          erreur: "Identifiant de l'événement Eventmaker manquant : " +
            "renseignez-le dans « Source des données ».",
        }, 400);
      }
      if (!Deno.env.get("EVENTMAKER_TOKEN")) {
        return repond({ erreur: "Jeton Eventmaker absent des secrets." }, 500);
      }
    } else if (srcStands !== "klipso") {
      return repond({
        erreur: `Source « ${srcStands} » pas encore prise en charge pour les exposants.`,
      }, 400);
    }

    /* ------------------------------------------------------------------
       Compte rendu au fil de l'eau.

       Une synchronisation dure plusieurs dizaines de secondes et enchaîne des
       étapes de nature différente ; un message figé pendant tout ce temps ne
       dit pas où l'on en est, ni si quelque chose est bloqué. La réponse est
       donc un flux de lignes JSON : la première annonce les étapes, les
       suivantes disent laquelle est en cours, la dernière porte le résultat.

       Les étapes que cette synchronisation ne sait pas encore faire sont
       annoncées « ignorée » plutôt que tues : l'exploitant les a réglées, il
       doit voir qu'elles ne sont pas reprises.
       ------------------------------------------------------------------ */
    const ETAPES = [
      { cle: "plan", libelle: "Plan", domaine: "plan" },
      { cle: "exposants", libelle: "Exposants", domaine: "stands" },
      { cle: "conferences", libelle: "Conférences", domaine: "conferences" },
      { cle: "produits", libelle: "Produits", domaine: "produits" },
    ].map((e) => ({ ...e, source: fournisseur(evt, e.domaine) }));

    const flux = new ReadableStream({
      async start(ctrl) {
        const enc = new TextEncoder();
        const emet = (o: Record<string, unknown>) => {
          ctrl.enqueue(enc.encode(JSON.stringify(o) + String.fromCharCode(10)));
        };
        const etape = (cle: string, etat: string, info?: unknown) =>
          emet({ etape: cle, etat, ...(info === undefined ? {} : { info }) });

        emet({ etapes: ETAPES });
        try {
      const g = gaia(evt.instance, evt.event_id ?? undefined);
      const resume: Record<string, unknown>[] = [];

      /* Les exposants peuvent venir d'Eventmaker. Le rattachement se fait par
         le numéro de stand : Klipso le compose de l'allée et du numéro,
         Eventmaker le saisit à la main, et les deux sont comparés sous forme
         normalisée. C'est l'étape la plus longue — plusieurs centaines de
         fiches à parcourir — d'où sa place dans le flux. */
      etape("exposants", "encours");
      if (srcStands === "eventmaker") {
        const em = new Eventmaker({ jeton: Deno.env.get("EVENTMAKER_TOKEN")! });
        // Les catégories déjà reconnues évitent de tout resonder : la première
        // synchronisation coûte trente-deux appels, les suivantes un seul.
        const connues: string[] = (evt.sources?.stands?.categories ?? []) as string[];

        /* Les numéros de stand du dernier instantané servent de termes de
           recherche : c'est par eux qu'on retrouve les catégories qui portent
           les exposants, sans avoir à toutes les sonder. Au tout premier
           passage il n'y en a pas, et le sondage prend le relais. */
        const { data: pl } = await db.from("plan").select("id").eq("evenement_id", evt.id);
        const { data: inst } = await db.from("instantane").select("charge")
          .in("plan_id", (pl ?? []).map((p) => p.id));
        const codes = (inst ?? [])
          .flatMap((i) => ((i.charge as any)?.stands ?? []) as Record<string, unknown>[])
          .map((st) => String(st.code ?? "")).filter(Boolean);

        const r = await em.exposants(String((evt.cles ?? {}).eventmaker), connues, codes);
        expoEm = r.parStand;
        resumeEm = {
          categories: r.categories,
          voie: r.voie,
          appels: r.appels,
          lus: r.lus,
          exposants: r.retenus,
          nonInscrits: r.ecartesNonInscrits,
        };
        etape("exposants", "encours", r.retenus + " exposants lus");

        // On retient ce qu'on vient d'apprendre. Écriture ciblée : le reste de
        // la configuration appartient à l'exploitant, pas à la synchronisation.
        const memes = connues.length === r.categoriesIds.length &&
          connues.every((c) => r.categoriesIds.includes(c));
        if (!memes) {
          const src = { ...(evt.sources ?? {}) };
          src.stands = { ...(src.stands ?? {}), categories: r.categoriesIds };
          await db.from("evenement").update({ sources: src }).eq("id", evt.id);
        }
      }

      /* Les conférences viennent de l'événement, pas d'un pavillon : on les lit
         une fois, on les rattachera pavillon par pavillon. */
      let confEm: ConferenceEm[] | null = null;
      const sallesConf: Record<string, any> = JSON.parse(JSON.stringify(evt.salles ?? {}));
      if (fournisseur(evt, "conferences") === "eventmaker") {
        etape("conferences", "encours");
        const em = new Eventmaker({ jeton: Deno.env.get("EVENTMAKER_TOKEN")! });
        confEm = await em.conferences(String((evt.cles ?? {}).eventmaker));
        etape("conferences", "encours", confEm.length + " conférences lues");
      }

      etape("plan", "encours");

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
      if (!plans.length) return emet({ erreur: "Aucun pavillon à traiter." });

      for (const plan of plans) {
        etape("plan", "encours", String(plan.Libelle ?? ""));
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
        // Tous les textes du plan, tous calques confondus : c'est parmi eux que
        // se trouvent les numéros d'emplacement — « P160 » — qui désignent les
        // salles de conférence. Le calque qui les porte ne s'appelle pas pareil
        // d'un salon à l'autre, on ne peut donc pas le nommer.
        const tousTextes: { x: number; y: number; txt: string }[] = [];
        for (const c of calques) {
          if (!c.SVG?.idMedia) continue;
          const brut = await g.media(c.SVG.idMedia);
          const lus = textes(brut);
          tousTextes.push(...lus);
          if (CALQUES_TEXTE.includes(c.Libelle)) textesZone.push(...lus);
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
        let apparies = 0;
        for (const s of bruts) {
          const formes = s.SetStandShapeStand ? [].concat(s.SetStandShapeStand) : [];
          const anneaux = formes.flatMap((f: any) => versAnneaux(f?.Shape) ?? []);
          if (!anneaux.length) continue;
          const dos = s.RefDossierExpAff;
          // engagement contractuel : un exposant qui refuse le catalogue ne sort
          // pas, quelle que soit la source
          const exclu = dos?.x_ExcluListeexposants === true;
          const code = [s.Allee, s.NoStand].filter(Boolean).join("") || null;

          // La source choisie fait foi : si elle ne connaît pas ce stand, il
          // reste vide plutôt que de retomber sur l'autre, ce qui donnerait un
          // plan à moitié dans chaque référentiel.
          const em = expoEm && code ? expoEm.get(cleStand(code)) : undefined;
          const ok = expoEm ? Boolean(em) && !em!.exclu : Boolean(dos) && !exclu;
          if (expoEm && em) apparies++;

          stands.push({
            id: "s" + String(s.Id).slice(0, 8),
            code,
            plan: (expoEm ? em?.raison : null) ?? s.NomSurPlan ?? null,
            nom: !ok ? null : expoEm ? em!.nom : dos.x_Catalogue_RaisonSociale,
            site: !ok ? null : expoEm ? nettoieUrl(em!.site) : nettoieUrl(dos.x_Catalogue_SiteWeb),
            nomencl: !ok ? null : expoEm ? (em!.nomencl.length ? em!.nomencl : null)
                                         : nomenclature(dos.x_Nomenclature),
            // Coordonnées et réseaux : Eventmaker les porte, Klipso ne les
            // expose pas dans ce qu'on lui demande. Absents, ils ne
            // s'affichent simplement pas.
            ...(ok && em
              ? {
                adr: em.adresse, ville: em.ville, pays: em.pays, tel: em.tel,
                fb: em.facebook, li: em.linkedin, ig: em.instagram,
              }
              : {}),
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

        /* --- les conférences, rattachées par le code de leur salle ---

           Une salle s'appelle « Agora (P160) ». Le code entre parenthèses est
           un emplacement du plan, posé comme texte : on retrouve sa position,
           puis la zone qui la contient. Dix salles sur onze aboutissent ainsi
           sur Franchise Expo ; la onzième porte un code absent du plan et se
           rattache à la main depuis la console. */
        const conferences: Record<string, unknown>[] = [];
        if (confEm) {
          const parCode = new Map<string, { x: number; y: number }>();
          for (const t of tousTextes) {
            const k = cleStand(t.txt);
            if (k && !parCode.has(k)) parCode.set(k, t);
          }
          const anneauxZone = new Map(zonesBrutes.map((z) => [
            "z" + String(z.Id).slice(0, 8), versAnneaux(z.Shape),
          ]));

          for (const c of confEm) {
            const idSalle = c.salleId || c.salle || "";
            if (!idSalle) continue;
            let fiche = sallesConf[idSalle];
            if (!fiche) fiche = sallesConf[idSalle] = { nom: c.salle, code: null, zone: null, auto: null, manuel: false };
            fiche.nom = c.salle;

            const segments = codeSalle(c.salle);
            fiche.code = segments.join("-") || null;
            const pos = segments.map((x) => parCode.get(cleStand(x))).find(Boolean);
            if (pos) {
              for (const [idZone, anneaux] of anneauxZone) {
                if (anneaux?.some((a) => dedans([pos.x, pos.y], a))) { fiche.auto = idZone; break; }
              }
            }
            // un choix de l'exploitant n'est jamais écrasé
            if (!fiche.manuel && fiche.auto) fiche.zone = fiche.auto;

            if (fiche.zone && anneauxZone.has(fiche.zone)) {
              conferences.push({
                id: c.id, nom: c.nom, texte: c.texte,
                debut: c.debut, fin: c.fin,
                debutLocal: c.debutLocal, finLocal: c.finLocal,
                salle: c.salle, type: c.type, couleur: c.couleur, theme: c.theme,
                zone: fiche.zone,
              });
            }
          }
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
          charge: { stands, zones, conferences, emprise: emp },
          genere_le: new Date().toISOString(),
        }, { onConflict: "plan_id" });

        resume.push({
          pavillon: plan.Libelle,
          stands: stands.length,
          exposants: stands.filter((s) => s.nom).length,
          ...(expoEm ? { apparies } : {}),
          zones: zones.length,
          zonesNommees: zones.filter((z) => z.nom).length,
        });
      }

      etape("plan", "fait", plans.length + (plans.length > 1 ? " pavillons" : " pavillon"));
      etape("exposants", "fait",
        resume.reduce((a, p) => a + Number(p.exposants ?? 0), 0) + " rattachés");
      if (confEm) {
        await db.from("evenement").update({ salles: sallesConf }).eq("id", evt.id);
        const rattachees = Object.values(sallesConf).filter((s: any) => s.zone).length;
        etape("conferences", "fait",
          rattachees + " / " + Object.keys(sallesConf).length + " salles situées");
      }

      /* Deux raisons de ne rien faire, et elles ne se disent pas pareil : soit
         l'exploitant n'a rien demandé, soit il a désigné une source que la
         synchronisation ne sait pas encore lire. */
      for (const cle of ["conferences", "produits"]) {
        if (cle === "conferences" && confEm) continue;
        const src = fournisseur(evt, cle);
        etape(cle, "ignoree",
          src === "aucun" ? "non synchronisé" : src + " — pas encore repris");
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
      return emet({
        ok: true,
        pavillons: resume,
        nomenclature: {
          libelles: Object.keys(libNomencl).length,
          chemin: cheminNomencl,
          erreur: errNomencl,
        },
        ...(resumeEm ? { eventmaker: resumeEm } : {}),
      });
        } catch (e) {
          emet({ erreur: e instanceof Error ? e.message : String(e) });
          try {
            await client().from("evenement")
              .update({ derniere_err: e instanceof Error ? e.message : String(e) })
              .eq("id", corps.evenementId);
          } catch (_) { /* la trace ne doit pas masquer l'erreur d'origine */ }
        } finally {
          ctrl.close();
        }
      },
    });

    return new Response(flux, {
      headers: { ...CORS, "Content-Type": "application/x-ndjson", "Cache-Control": "no-store" },
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
