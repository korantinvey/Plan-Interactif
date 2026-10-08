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
import { cleDeVignette, imageReconnue } from "../_partage/vignette.ts";

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

/* Ce qu'un envoi peut porter. La console en envoie huit à la fois, de six
   cents pixels au plus — quelques kilo-octets chacune. Les bornes laissent une
   large marge à cet usage et ferment la porte au reste : sans elles, un compte
   connecté faisait lire à la fonction, puis écrire en base, autant de
   mégaoctets qu'il voulait, dans une table que chaque visiteur relit. */
const PAR_ENVOI = 32;
const CORPS_MAX = 4 * 1024 * 1024;
const COTE_MAX = 4096;

const cote = (v: unknown) => {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 && n <= COTE_MAX ? n : 0;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

/* Relever ces adresses demande de lire les instantanés du salon en entier, et
   la console revient enregistrer par paquets de huit : sans cette mémoire, un
   salon de cinq cents logos ferait relire soixante fois toute sa charge. Elle
   ne vit que le temps d'une préparation, et un instantané refait pendant ce
   temps n'attend qu'une minute pour être vu. */
const VIE_ADRESSES = 60_000;
const memoireDesAdresses = new Map<string, { le: number; adresses: string[] }>();

/** Les adresses de logo que porte ce salon-là, relevées dans ses instantanés.
 *  Elles disent ce qu'il reste à faire, et — l'écriture étant nommée par la
 *  seule empreinte de l'adresse — ce qu'on accepte d'enregistrer. */
async function adressesDuSalon(
  db: ReturnType<typeof service>,
  evenementId: string,
): Promise<string[]> {
  const garde = memoireDesAdresses.get(evenementId);
  if (garde && Date.now() - garde.le < VIE_ADRESSES) return garde.adresses;

  const { data: plans } = await db.from("plan")
    .select("id").eq("evenement_id", evenementId);
  const ids = (plans ?? []).map((p) => (p as { id: string }).id);
  if (!ids.length) return [];
  const { data: instantanes } = await db.from("instantane")
    .select("charge").in("plan_id", ids);
  const adresses = adressesDeLogos((instantanes ?? []) as { charge: unknown }[]);
  memoireDesAdresses.set(evenementId, { le: Date.now(), adresses });
  return adresses;
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

    if (req.method !== "POST") return repond({ erreur: "Méthode non permise." }, 405);
    /* Lu en texte d'abord, pour en borner la taille avant de le déplier : un
       JSON de cent mégaoctets coûte sa mémoire dès qu'on le parse. */
    const brut = await req.text();
    if (brut.length > CORPS_MAX) return repond({ erreur: "Envoi trop lourd." }, 413);
    let corps: {
      evenementId?: string;
      vignettes?: { source: string; image: string; largeur: number; hauteur: number }[];
    };
    try {
      corps = JSON.parse(brut || "{}");
    } catch (_e) {
      return repond({ erreur: "Corps illisible." }, 400);
    }
    if (!corps || typeof corps !== "object") return repond({ erreur: "Corps illisible." }, 400);
    if (typeof corps.evenementId !== "string" || !UUID.test(corps.evenementId)) {
      return repond({ erreur: "evenementId manquant ou invalide." }, 400);
    }
    if (corps.vignettes !== undefined &&
        (!Array.isArray(corps.vignettes) || corps.vignettes.length > PAR_ENVOI)) {
      return repond({ erreur: `Au plus ${PAR_ENVOI} vignettes par envoi.` }, 413);
    }

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
      /* Le droit vérifié plus haut porte sur un salon ; la table, elle, est
         globale et nommée par la seule empreinte de l'adresse. Sans ce filtre,
         un exploitant n'ayant accès qu'au salon A enregistrerait sous l'adresse
         de logo d'un exposant du salon B l'image de son choix, servie un an aux
         visiteurs de B. L'adresse vient du client : elle se relit en base. */
      const permises = new Set(await adressesDuSalon(db, corps.evenementId));
      const lignes = [];
      let refusees = 0;
      for (const v of corps.vignettes) {
        if (typeof v?.source !== "string" || typeof v.image !== "string") { refusees++; continue; }
        if (!permises.has(v.source)) { refusees++; continue; }
        const largeur = cote(v.largeur), hauteur = cote(v.hauteur);
        if (!largeur || !hauteur || !imageReconnue(v.image)) { refusees++; continue; }
        lignes.push({
          cle: await cleDeVignette(v.source),
          source: v.source,
          image: v.image,
          largeur,
          hauteur,
          pose: new Date().toISOString(),
        });
      }
      if (!lignes.length) return repond({ enregistrees: 0, refusees });
      /* Une vignette déjà là ne se remplace pas. Sa clé lui sert de version :
         la page publique la déclare immuable, gardée un an par le relais et
         les navigateurs. La remplacer ne corrigerait donc personne, et la
         table étant commune aux salons, cela laissait l'exploitant d'un salon
         réécrire le logo qu'un exposant présent ailleurs montre aux visiteurs
         des autres. La console ne demande de toute façon que les adresses qui
         n'en ont pas ; une source qui change d'image se rattrape en effaçant
         l'ancienne, comme la table le prévoit. */
      const { error } = await db.from("vignette_de_logo")
        .upsert(lignes, { onConflict: "cle", ignoreDuplicates: true });
      if (error) return repond({ erreur: error.message }, 500);
      return repond({ enregistrees: lignes.length, refusees });
    }

    const adresses = await adressesDuSalon(db, corps.evenementId);
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
