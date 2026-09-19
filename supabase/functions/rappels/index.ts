/**
 * Les rappels avant une conférence.
 *
 * Trois chemins, et ils ne se ressemblent pas :
 *
 *   GET  /rappels/cle     la clé publique dont le navigateur a besoin pour
 *                         s'abonner, et rien d'autre
 *   POST /rappels         { "slug": "smcl-2026",
 *                           "abonnement": { "endpoint": "…", "keys": { … } },
 *                           "rappels": [ { "conf": "…", "envoi_a": "…",
 *                                          "titre": "…", "corps": "…",
 *                                          "adresse": "…", "vie": 900,
 *                                          "debut_vu": "…" }, … ] }
 *                         ce que cet appareil attend de ce salon, en entier —
 *                         une liste vide efface tout
 *   POST /rappels/envoi   ce qui est dû à cette minute part maintenant
 *
 * Le dernier n'est appelé que par `pg_cron`, et il est pourtant ouvert comme
 * les deux autres. Ce n'est pas un oubli. Il ne rend rien, ne lit rien qui
 * sorte, et n'avance l'heure de personne : la requête qu'il exécute ne prend
 * que les rappels dont l'instant est déjà passé, et les marque pris dans le
 * même geste. Deux appels de suite ne font donc pas deux envois, et mille
 * appels n'en font pas un seul de plus que la minute n'en devait. Le fermer
 * aurait voulu dire poser une clé dans la base — à déposer à la main, hors du
 * dépôt, et à retrouver le jour où elle expire — pour garder une porte qui ne
 * s'ouvre sur rien.
 *
 * Les clés VAPID vivent dans les secrets de la fonction, comme la clé Klipso :
 *
 *   npx supabase secrets set VAPID_CLE_PUBLIQUE=… VAPID_CLE_PRIVEE=… \
 *                            VAPID_SUJET=mailto:…
 *
 * Sans elles, rien ne part et la fonction le dit plutôt que de se taire : un
 * rappel qui ne part pas est invisible côté visiteur, et le serait d'autant
 * plus qu'aucun journal ne le nommerait.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { hoteDe, pousse, pousseurConnu } from "../_partage/push.ts";

/*
 * Toutes les origines, comme `mesure`, et pour la même raison : un plan posé
 * sur l'écran d'accueil d'un iPhone poste depuis sa propre origine, une coque
 * d'application depuis le protocole de son cadre de travail. Tenir la liste
 * aurait voulu dire deviner d'avance chaque porte — et CORS n'a de toute façon
 * jamais rien gardé qu'un `curl` n'ignore. Ce qui protège l'écriture est
 * ailleurs : la clé de service reste au serveur, l'événement doit être publié,
 * le paquet est borné, et rien ne sort d'ici que la clé publique, qui est
 * publique.
 */
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

/** Ce qu'un appareil peut poser en une fois. La base reborne de son côté. */
const RANGS_MAX = 60;

/** Ce qu'une minute peut emporter. Au-delà, la minute suivante prend la suite —
 *  un rappel en retard d'une minute reste un rappel. */
const ENVOIS_PAR_MINUTE = 200;

/** Poster deux cents messages l'un après l'autre prendrait plus d'une minute ;
 *  tous d'un coup, on assomme le service de poussée et la fonction manque de
 *  descripteurs. Vingt de front tient les deux bouts. */
const DE_FRONT = 20;

const client = () =>
  createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

const cles = () => ({
  publique: Deno.env.get("VAPID_CLE_PUBLIQUE") ?? "",
  privee: Deno.env.get("VAPID_CLE_PRIVEE") ?? "",
  sujet: Deno.env.get("VAPID_SUJET") ?? "",
});

const json = (corps: unknown, code = 200) =>
  new Response(JSON.stringify(corps), {
    status: code,
    headers: { ...CORS, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

const refus = (message: string, code = 400) => json({ erreur: message }, code);

/* ------------------------------------------------------------------
   Poser ses rappels
   ------------------------------------------------------------------ */
async function enregistre(req: Request) {
  const corps = await req.json().catch(() => null) as {
    slug?: string;
    abonnement?: { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
    rappels?: Record<string, unknown>[];
  } | null;
  if (!corps) return refus("Corps illisible.");

  const slug = String(corps.slug ?? "").slice(0, 80);
  const point = String(corps.abonnement?.endpoint ?? "").slice(0, 2000);
  const p256dh = String(corps.abonnement?.keys?.p256dh ?? "").slice(0, 200);
  const auth = String(corps.abonnement?.keys?.auth ?? "").slice(0, 100);
  if (!slug || !point || !p256dh || !auth) return refus("Paramètres manquants.");
  /* L'abonnement est une adresse, et elle sert telle quelle à poster. On refuse
     donc ici ce qui ne désigne pas un service de poussée connu, plutôt que de
     le découvrir à l'envoi — et surtout plutôt que de poster où l'on nous dit.
     Cette fonction ne demande aucune identité : sans ce contrôle, l'adresse de
     n'importe qui faisait de ce service un émetteur à ses ordres, à l'heure
     qu'il choisissait.

     Le refus se dit, et il nomme l'hôte au journal : c'est ainsi qu'on
     découvre un navigateur qui pousse ailleurs, et qu'on l'ajoute à
     POUSSEURS_AUTORISES sans avoir à redéployer. */
  if (!pousseurConnu(point)) {
    console.error("Abonnement refusé, hôte inconnu :", hoteDe(point));
    return refus("Service de poussée inconnu.");
  }

  const rappels = (Array.isArray(corps.rappels) ? corps.rappels : [])
    .slice(0, RANGS_MAX)
    .map((r) => ({
      conf: String(r?.conf ?? "").slice(0, 200),
      envoi_a: String(r?.envoi_a ?? ""),
      titre: String(r?.titre ?? "").slice(0, 200),
      corps: String(r?.corps ?? "").slice(0, 400),
      adresse: String(r?.adresse ?? "").slice(0, 500),
      vie: Math.round(Number(r?.vie) || 900),
      /* L'heure que la page a lue, telle que la source l'écrivait. Elle ne sert
         pas à l'envoi : elle sert à reconnaître, des jours plus tard, un
         programme qui a bougé sous un rappel déjà posé. */
      debut_vu: String(r?.debut_vu ?? "").slice(0, 80),
    }))
    .filter((r) => r.conf && r.titre && !Number.isNaN(Date.parse(r.envoi_a)));

  const { data, error } = await client().rpc("enregistre_rappels", {
    p_slug: slug,
    p_abonnement: point,
    p_p256dh: p256dh,
    p_auth: auth,
    p_rappels: rappels,
  });
  if (error) return refus(error.message, 500);
  if (data === false) return refus("Événement introuvable ou non publié.", 404);
  return new Response(null, { status: 204, headers: CORS });
}

/* ------------------------------------------------------------------
   Envoyer ce qui est dû
   ------------------------------------------------------------------ */
async function envoie() {
  const v = cles();
  if (!v.publique || !v.privee || !v.sujet) {
    console.error("Clés VAPID absentes : aucun rappel ne peut partir.");
    return refus("Clés VAPID absentes.", 503);
  }

  const bd = client();
  const { data, error } = await bd.rpc("rappels_dus", { p_max: ENVOIS_PAR_MINUTE });
  if (error) return refus(error.message, 500);
  const dus = (data ?? []) as {
    id: string; abonnement: string; p256dh: string; auth: string;
    titre: string; corps: string; adresse: string; vie: number;
  }[];
  if (!dus.length) return new Response(null, { status: 204, headers: CORS });

  /* Les appareils disparus se relèvent en chemin et s'effacent d'un coup à la
     fin : le même abonnement peut porter plusieurs rappels, et il n'y a pas de
     raison de demander trois fois le même effacement. */
  const disparus = new Set<string>();
  let partis = 0, manques = 0;

  for (let i = 0; i < dus.length; i += DE_FRONT) {
    await Promise.all(dus.slice(i, i + DE_FRONT).map(async (r) => {
      try {
        const issue = await pousse(
          { endpoint: r.abonnement, p256dh: r.p256dh, auth: r.auth },
          JSON.stringify({ titre: r.titre, corps: r.corps, adresse: r.adresse }),
          v,
          r.vie,
        );
        if (issue.parti) partis++;
        else {
          manques++;
          if (issue.perime) disparus.add(r.abonnement);
          else console.error("Rappel refusé (" + issue.statut + ") :", r.id);
        }
      } catch (err) {
        manques++;
        console.error("Rappel non parti :", r.id, err instanceof Error ? err.message : err);
      }
    }));
  }

  for (const mort of disparus) {
    /* Ce que rend `rpc` n'est pas une promesse ordinaire : l'échec se lit dans
       la réponse, non par un `catch`. Il ne remet pas l'envoi en cause — les
       messages sont partis — mais il laisse des adresses mortes derrière lui,
       et cela vaut une ligne au journal. */
    const { error: oubli } = await bd.rpc("oublie_abonnement", { p_abonnement: mort });
    if (oubli) console.error("Abonnement non oublié :", mort, oubli.message);
  }
  console.log("Rappels : " + partis + " partis, " + manques + " manqués, " +
              disparus.size + " appareils oubliés.");
  return new Response(null, { status: 204, headers: CORS });
}

/* ------------------------------------------------------------------ */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  /* Supabase sert la fonction sous son propre nom : ce qui suit est le chemin
     qui nous intéresse, et une barre finale ne change rien. */
  const chemin = new URL(req.url).pathname
    .replace(/^\/rappels/, "").replace(/\/+$/, "");

  try {
    if (chemin === "/cle") {
      if (req.method !== "GET") return refus("Méthode non permise.", 405);
      const publique = cles().publique;
      if (!publique) return refus("Clés VAPID absentes.", 503);
      /* La clé publique ne change pas d'un appel à l'autre, et le navigateur
         la redemande à chaque abonnement : une heure de cache lui épargne un
         aller-retour sans jamais retarder une rotation de plus d'une heure. */
      return new Response(JSON.stringify({ cle: publique }), {
        headers: { ...CORS, "Content-Type": "application/json", "Cache-Control": "public, max-age=3600" },
      });
    }
    if (chemin === "/envoi") {
      if (req.method !== "POST") return refus("Méthode non permise.", 405);
      return await envoie();
    }
    if (chemin === "") {
      if (req.method !== "POST") return refus("Méthode non permise.", 405);
      return await enregistre(req);
    }
    return refus("Chemin inconnu.", 404);
  } catch (err) {
    return refus(err instanceof Error ? err.message : String(err), 500);
  }
});
