/**
 * Comptes et affectations.
 *
 *   POST /comptes
 *   { "action": "liste" }
 *   { "action": "invite",   "email": "…", "nom": "…", "prenom": "…",
 *     "role": "organisateur", "evenements": ["…"], "retour": "https://…/motdepasse" }
 *   { "action": "maj",      "id": "…", "nom": "…", "prenom": "…", "role": "…",
 *     "evenements": [...] }
 *   { "action": "relance",  "id": "…", "retour": "https://…/motdepasse" }
 *   { "action": "supprime", "id": "…" }
 *
 * Pourquoi une fonction, alors que `profil` et `acces` sont des tables que la
 * console pourrait écrire directement : créer un compte, lui envoyer son
 * invitation ou le supprimer relève de l'API d'administration de Supabase, qui
 * exige la clé de service. Cette clé ne peut pas descendre dans un navigateur ;
 * elle reste donc ici, et la fonction vérifie elle-même qui l'appelle.
 *
 * Ce contrôle n'est pas une politesse : avec la clé de service, tout appel non
 * vérifié serait un administrateur. On lit donc le jeton de l'appelant avec la
 * clé publique — seule capable de dire de qui il est — puis on relit son rôle
 * en base. Un jeton valide d'organisateur ne passe pas.
 *
 * Le mot de passe ne transite jamais par ici : Supabase envoie un lien, et
 * c'est la page `motdepasse` qui le pose. Une invitation et un oubli de mot de
 * passe empruntent le même chemin, à ceci près que l'un crée le compte.
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

const service = () =>
  createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

const ROLES = ["admin", "organisateur"];

/** Une adresse de retour venue du navigateur ne vaut que si elle désigne une
 *  origine déclarée : c'est elle qui recevra le jeton du lien. */
function retourValide(brut: unknown): string | null {
  const v = String(brut ?? "").trim();
  if (!v) return null;
  try {
    const u = new URL(v);
    return ORIGINES.includes(u.origin) ? u.toString() : null;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  const CORS = { ...cors(req), ...METHODES };
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  const repond = (corps: unknown, code = 200) =>
    new Response(JSON.stringify(corps), {
      status: code,
      headers: { ...CORS, "Content-Type": "application/json", "Cache-Control": "no-store" },
    });

  if (req.method !== "POST") return repond({ erreur: "Méthode non permise." }, 405);

  try {
    /* Qui appelle ? La clé publique ne sait rien faire d'autre que vérifier un
       jeton — c'est exactement ce qu'on lui demande ici. */
    const { data: { user } } = await createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        auth: { persistSession: false },
        global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
      },
    ).auth.getUser();
    if (!user) return repond({ erreur: "Authentification requise." }, 401);

    const db = service();
    const { data: moi } = await db
      .from("profil").select("role").eq("id", user.id).maybeSingle();
    if (moi?.role !== "admin") {
      return repond({ erreur: "Réservé à l'administrateur." }, 403);
    }

    const corps = await req.json().catch(() => null) as Record<string, unknown> | null;
    if (!corps) return repond({ erreur: "Corps illisible." }, 400);
    const action = String(corps.action ?? "");

    /** Les salons affectés à un profil, remplacés en bloc : la console envoie
     *  la liste voulue, pas une différence qu'elle aurait à calculer. */
    const ecritAcces = async (profilId: string, evenements: unknown) => {
      if (!Array.isArray(evenements)) return;
      const voulus = evenements.map((e) => String(e)).filter(Boolean);
      await db.from("acces").delete().eq("profil_id", profilId);
      if (voulus.length) {
        const { error } = await db.from("acces").insert(
          voulus.map((evenement_id) => ({ profil_id: profilId, evenement_id })));
        if (error) throw new Error(error.message);
      }
    };

    /* ---------------------------------------------------------- liste */
    if (action === "liste") {
      const { data: profils, error } = await db
        .from("profil").select("id,email,nom,prenom,role,cree_le").order("cree_le");
      if (error) throw new Error(error.message);
      const { data: liens } = await db.from("acces").select("profil_id,evenement_id");

      /* Une invitation partie mais jamais ouverte se voit ici, et nulle part
         ailleurs : c'est ce qui distingue « compte créé » de « compte actif ». */
      const { data: comptes } = await db.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const confirme = new Map(
        (comptes?.users ?? []).map((u) => [u.id, Boolean(u.email_confirmed_at ?? u.last_sign_in_at)]));

      return repond({
        profils: (profils ?? []).map((p) => ({
          ...p,
          actif: confirme.get(p.id) ?? false,
          evenements: (liens ?? [])
            .filter((a) => a.profil_id === p.id).map((a) => a.evenement_id),
        })),
      });
    }

    /* -------------------------------------------------------- invitation */
    if (action === "invite") {
      const email = String(corps.email ?? "").trim().toLowerCase();
      if (!email || email.indexOf("@") < 1) return repond({ erreur: "Adresse invalide." }, 400);
      const role = ROLES.includes(String(corps.role)) ? String(corps.role) : "organisateur";
      const nom = String(corps.nom ?? "").trim().slice(0, 120) || null;
      const prenom = String(corps.prenom ?? "").trim().slice(0, 120) || null;
      const retour = retourValide(corps.retour);

      const { data, error } = await db.auth.admin.inviteUserByEmail(email, {
        redirectTo: retour ?? undefined,
        data: { nom, prenom, role },
      });
      if (error) return repond({ erreur: error.message }, 400);
      const id = data.user.id;

      /* Le déclencheur a posé le profil ; on écrit ensuite ce que le
         déclencheur ne pouvait pas savoir seul — et on le réaffirme, parce
         qu'un tout premier compte naît administrateur quoi qu'on demande. */
      await db.from("profil")
        .update({ nom, prenom, role, email, modifie_le: new Date().toISOString() })
        .eq("id", id);
      await ecritAcces(id, corps.evenements);
      return repond({ ok: true, id });
    }

    /* ------------------------------------------------------ modification */
    if (action === "maj") {
      const id = String(corps.id ?? "");
      if (!id) return repond({ erreur: "Compte manquant." }, 400);
      const champs: Record<string, unknown> = { modifie_le: new Date().toISOString() };
      if (corps.nom !== undefined) champs.nom = String(corps.nom ?? "").trim().slice(0, 120) || null;
      if (corps.prenom !== undefined) {
        champs.prenom = String(corps.prenom ?? "").trim().slice(0, 120) || null;
      }
      if (corps.role !== undefined) {
        if (!ROLES.includes(String(corps.role))) return repond({ erreur: "Rôle inconnu." }, 400);
        /* Se retirer soi-même l'administration fermerait la porte de
           l'intérieur : plus personne pour rendre le droit. */
        if (id === user.id && String(corps.role) !== "admin") {
          return repond({ erreur: "Vous ne pouvez pas retirer votre propre rôle d'administrateur." }, 400);
        }
        champs.role = String(corps.role);
      }
      const { error } = await db.from("profil").update(champs).eq("id", id);
      if (error) return repond({ erreur: error.message }, 400);
      await ecritAcces(id, corps.evenements);
      return repond({ ok: true });
    }

    /* ------------------------------------------- relance du lien de mot de passe */
    /* Un seul geste pour deux situations que l'exploitant ne distingue pas :
       l'invité qui n'a jamais ouvert son courriel, et celui qui a oublié son
       mot de passe. Les deux reçoivent un lien de réinitialisation, et le
       compte n'est jamais recréé — le recréer lui ferait perdre ses salons. */
    if (action === "relance") {
      const id = String(corps.id ?? "");
      const { data: cible } = await db
        .from("profil").select("email").eq("id", id).maybeSingle();
      if (!cible?.email) return repond({ erreur: "Compte introuvable." }, 404);
      const retour = retourValide(corps.retour);

      const anon = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { auth: { persistSession: false } },
      );
      const { error } = await anon.auth.resetPasswordForEmail(
        cible.email, retour ? { redirectTo: retour } : undefined);
      if (error) return repond({ erreur: error.message }, 400);
      return repond({ ok: true });
    }

    /* ---------------------------------------------------------- suppression */
    if (action === "supprime") {
      const id = String(corps.id ?? "");
      if (id === user.id) {
        return repond({ erreur: "Vous ne pouvez pas supprimer votre propre compte." }, 400);
      }
      const { error } = await db.auth.admin.deleteUser(id);
      if (error) return repond({ erreur: error.message }, 400);
      // la cascade emporte profil et accès ; on ne l'attend pas pour le dire
      return repond({ ok: true });
    }

    return repond({ erreur: "Action inconnue." }, 400);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return repond({ erreur: message }, 500);
  }
});
