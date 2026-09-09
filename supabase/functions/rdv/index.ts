/**
 * Les rendez-vous d'un visiteur, posés sur le plan.
 *
 *   GET /rdv?slug=smcl-2026        en-tête X-Jeton-Eventmaker : la liste
 *   GET /rdv/amorce?slug=…&retour=…                     ouvre la connexion
 *   GET /rdv/retour?code=…&state=…                      la referme
 *
 * Un visiteur qui a pris rendez-vous avec trois exposants depuis l'application
 * du salon a déjà, quelque part, l'essentiel de sa journée. Le plan l'ignorait :
 * il lui demandait de recomposer à la main, en cherchant chaque enseigne, ce
 * qu'il avait déjà réservé ailleurs.
 *
 * Ce que cette fonction fait tient en une phrase : elle échange une identité
 * Eventmaker contre des rendez-vous rattachés à des stands du plan.
 *
 * Deux jetons se croisent ici, et les confondre serait grave. Celui du
 * visiteur, qu'il présente en en-tête, ne sert qu'à demander au graphe « quels
 * sont vos rendez-vous » ; il n'est ni écrit, ni journalisé, ni gardé. Celui de
 * l'organisateur reste dans les secrets et relit les fiches des exposants cités
 * — le visiteur n'a pas ces droits, et n'a aucune raison de les avoir.
 *
 * Pourquoi une fonction, alors que le graphe est joignable depuis la page : le
 * graphe ne connaît que des fiches Eventmaker, jamais des stands. Traduire
 * l'une en l'autre demande la clé de l'organisateur et la correspondance des
 * dossiers, qui n'ont ni l'une ni l'autre à descendre dans un navigateur.
 *
 * L'en-tête n'est pas `Authorization` : cette place-là est prise par la
 * passerelle Supabase, et y glisser un jeton Eventmaker ferait refuser l'appel
 * avant qu'il n'arrive ici.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { Eventmaker } from "../_partage/eventmaker.ts";

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
    "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-jeton-eventmaker",
    "Vary": "Origin",
  };
};
const METHODES = { "Access-Control-Allow-Methods": "GET, OPTIONS" };

/* Le domaine qui porte la connexion Eventmaker. Un salon qui héberge son
   espace visiteur sous son propre nom le désigne par la variable ; sinon c'est
   l'adresse commune, qui répond pour tous. */
const SSO = (Deno.env.get("EVENTMAKER_SSO") ?? "https://app.eventmaker.io")
  .replace(/\/+$/, "");

/* Le seul périmètre qu'Eventmaker propose aujourd'hui. */
const PERIMETRE = "public";

/**
 * L'adresse publique de cette fonction, telle que le visiteur la joint.
 *
 * Elle ne se devine pas : la page passe par le Worker — « /api/rdv » sur le
 * domaine du plan — et c'est cette adresse-là qu'Eventmaker rappellera, pas
 * celle du projet Supabase, que le navigateur ne voit jamais. Elle doit être
 * la même que celle déclarée à l'inscription de l'application, au caractère
 * près : c'est la seule chose qu'Eventmaker vérifie avant de rendre un jeton.
 *
 * Sans elle on retombe sur l'adresse d'appel, ce qui vaut pour un essai en
 * local mais jamais en production.
 */
const adresse = (url: URL) =>
  (Deno.env.get("RDV_ADRESSE") ?? url.origin + url.pathname.replace(/\/[^/]*$/, ""))
    .replace(/\/+$/, "");

/* Ce que la connexion met de côté le temps d'un aller-retour : où revenir, et
   de quoi reconnaître le retour. Un quart d'heure suffit largement — au-delà,
   le visiteur a fermé la page. */
const BISCUIT = "rdv_amorce";
const BISCUIT_S = 900;

const client = () =>
  createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

/** Une chaîne imprévisible, pour l'état et le vérificateur. */
const hasard = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0")).join("");

/** L'empreinte du vérificateur, telle que le protocole la demande. */
async function defi(verificateur: string): Promise<string> {
  const somme = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verificateur),
  );
  return btoa(String.fromCharCode(...new Uint8Array(somme)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * L'adresse de retour, si elle est des nôtres.
 *
 * Sans cette vérification, n'importe qui pourrait faire de la fonction un
 * tremplin : une adresse d'amorce forgée, et le jeton du visiteur repartirait
 * vers un site qui n'est pas le plan. On ne redirige donc que vers une origine
 * déclarée, celles-là mêmes qui ont le droit d'appeler la fonction.
 */
function retourSur(brut: string): string | null {
  try {
    const u = new URL(brut);
    return ORIGINES.includes(u.origin) ? u.origin + u.pathname + u.search : null;
  } catch (_) {
    return null;
  }
}

/** Ce que l'amorce a mis de côté, relu au retour. */
function biscuit(req: Request): Record<string, string> {
  const brut = req.headers.get("Cookie") ?? "";
  for (const part of brut.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k !== BISCUIT) continue;
    try {
      return JSON.parse(atob(decodeURIComponent(v.join("="))));
    } catch (_) {
      return {};
    }
  }
  return {};
}

Deno.serve(async (req) => {
  const CORS = { ...cors(req), ...METHODES };
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  const url = new URL(req.url);
  // « /rdv », « /rdv/amorce », « /rdv/retour » — on ne retient que le dernier
  // segment, le préfixe dépendant du déploiement
  const voie = url.pathname.replace(/\/+$/, "").split("/").pop() ?? "";

  const refus = (message: string, code = 400) =>
    new Response(JSON.stringify({ erreur: message }), {
      status: code,
      headers: { ...CORS, "Content-Type": "application/json", "Cache-Control": "no-store" },
    });

  /* --------------------------------------------------------------
     Ouvrir la connexion — le repli, quand l'application ne passe rien
     -------------------------------------------------------------- */
  if (voie === "amorce") {
    const id = Deno.env.get("EVENTMAKER_OAUTH_ID");
    if (!id) return refus("Connexion Eventmaker non configurée.", 501);
    const retour = retourSur(url.searchParams.get("retour") ?? "");
    if (!retour) return refus("Adresse de retour inconnue.");

    const etat = hasard(), verificateur = hasard();
    const mien = adresse(url) + "/retour";

    const chez = new URL(SSO + "/oauth/authorize");
    chez.searchParams.set("client_id", id);
    chez.searchParams.set("redirect_uri", mien);
    chez.searchParams.set("response_type", "code");
    chez.searchParams.set("scope", PERIMETRE);
    chez.searchParams.set("state", etat);
    chez.searchParams.set("code_challenge", await defi(verificateur));
    chez.searchParams.set("code_challenge_method", "S256");
    chez.searchParams.set("locale", "fr");

    /* L'état et le vérificateur doivent survivre à l'aller-retour sans que le
       visiteur puisse les lire ni les changer : un biscuit du domaine de la
       fonction, et rien en base — il n'y a rien là qui mérite d'être gardé
       plus de quinze minutes. */
    const cache = encodeURIComponent(btoa(JSON.stringify({ etat, verificateur, retour })));
    return new Response(null, {
      status: 302,
      headers: {
        ...CORS,
        "Location": chez.toString(),
        "Cache-Control": "no-store",
        "Set-Cookie": `${BISCUIT}=${cache}; Max-Age=${BISCUIT_S}; Path=/; ` +
          "HttpOnly; Secure; SameSite=Lax",
      },
    });
  }

  /* --------------------------------------------------------------
     La refermer
     -------------------------------------------------------------- */
  if (voie === "retour") {
    const id = Deno.env.get("EVENTMAKER_OAUTH_ID");
    const secret = Deno.env.get("EVENTMAKER_OAUTH_SECRET");
    if (!id || !secret) return refus("Connexion Eventmaker non configurée.", 501);

    const { etat, verificateur, retour } = biscuit(req);
    // un état qui ne correspond pas est un retour qu'on n'a pas demandé
    if (!etat || etat !== url.searchParams.get("state") || !retour) {
      return refus("Connexion expirée : recommencez.", 440);
    }
    const code = url.searchParams.get("code");
    /* Un refus du visiteur n'est pas une panne : il revient sur le plan, qui
       reprend sans rendez-vous plutôt que de lui montrer une erreur. */
    if (!code) {
      return new Response(null, {
        status: 302,
        headers: { ...CORS, "Location": retour + "#rdv=refus", "Cache-Control": "no-store" },
      });
    }

    const corps = new URLSearchParams({
      client_id: id,
      client_secret: secret,
      code,
      redirect_uri: adresse(url) + "/retour",
      code_verifier: verificateur,
      grant_type: "authorization_code",
    });
    const r = await fetch(SSO + "/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: corps.toString(),
    });
    const jeton = await r.json().catch(() => null) as
      { access_token?: string; expires_in?: number } | null;
    if (!r.ok || !jeton?.access_token) return refus("Connexion refusée par Eventmaker.", 502);

    /* Le jeton repart au plan dans le fragment de l'adresse, jamais dans sa
       requête : un fragment ne quitte pas le navigateur, et n'atterrit donc ni
       dans un journal de serveur, ni dans un en-tête de provenance. Le biscuit
       n'a plus lieu d'être et s'efface avec la redirection. */
    const expire = Date.now() + (Number(jeton.expires_in) || 7200) * 1000;
    return new Response(null, {
      status: 302,
      headers: {
        ...CORS,
        "Location": retour + "#rdv=" + encodeURIComponent(jeton.access_token) +
          "&jusqua=" + expire,
        "Cache-Control": "no-store",
        "Set-Cookie": `${BISCUIT}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax`,
      },
    });
  }

  /* --------------------------------------------------------------
     La liste
     -------------------------------------------------------------- */
  if (req.method !== "GET") return refus("Méthode non permise.", 405);

  const jetonVisiteur = req.headers.get("X-Jeton-Eventmaker") ?? "";
  if (!jetonVisiteur) return refus("Identité absente.", 401);
  const slug = (url.searchParams.get("slug") ?? "").slice(0, 80);
  if (!slug) return refus("Paramètres manquants.");

  try {
    const { data: evt } = await client()
      .from("evenement")
      .select("cles, dossiers, fuseau")
      .eq("slug", slug)
      .eq("etat", "publie")
      .maybeSingle();
    if (!evt) return refus("Événement introuvable ou non publié.", 404);

    const idEm = String((evt.cles ?? {}).eventmaker ?? "");
    if (!idEm) return refus("Cet événement n'est pas relié à Eventmaker.", 409);
    if (!Deno.env.get("EVENTMAKER_TOKEN")) {
      return refus("Jeton Eventmaker absent des secrets.", 500);
    }

    const em = new Eventmaker({ jeton: Deno.env.get("EVENTMAKER_TOKEN")! });
    const bruts = await em.rendezVous(jetonVisiteur, idEm);
    const dossiers = (evt.dossiers ?? {}) as Record<string, string>;

    /* Le dossier devient un stand du plan, ou disparaît. Un rendez-vous avec
       une enseigne qui n'a pas de stand — un partenaire, un organisateur — n'en
       est pas moins un rendez-vous : il garde son heure et sa place dans la
       journée, on ne sait simplement pas où le mener. C'est déjà ce qu'une
       conférence sans zone obtient. */
    const rdv = bruts.map((m) => ({
      id: m.id,
      debut: m.debut,
      fin: m.fin,
      statut: m.statut,
      lieu: m.lieu,
      avec: m.exposants.map((e) => e.nom).filter(Boolean),
      stands: [...new Set(
        m.exposants.map((e) => dossiers[e.dossier]).filter(Boolean),
      )],
    }));

    /* Un rendez-vous appartient à une personne : aucun cache, nulle part, ni
       navigateur ni relais. */
    return new Response(JSON.stringify({ rdv, fuseau: evt.fuseau ?? null }), {
      headers: {
        ...CORS,
        "Content-Type": "application/json",
        "Cache-Control": "no-store, private",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    /* Le graphe refuse une identité périmée : ce n'est pas une panne du plan,
       c'est une connexion à refaire, et la page sait quoi en faire. */
    if (/unauthorized|401/i.test(message)) return refus("Identité expirée.", 401);
    return refus(message, 502);
  }
});
