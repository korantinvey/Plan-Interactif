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
 *  origine déclarée : c'est elle qui recevra le jeton du lien.
 *
 *  Une adresse écartée ne se rattrape pas plus loin : privé de `redirectTo`,
 *  Supabase replie le lien sur le « Site URL » du projet — « localhost » tant
 *  qu'on ne l'a pas réglé — et la panne n'apparaît que dans la boîte de
 *  l'invité, des heures plus tard. On refuse donc l'envoi sur-le-champ. */
const RETOUR_REFUSE = "Adresse de retour non autorisée : ajoutez cette origine " +
  "à ORIGINES_AUTORISEES.";

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
      /* Effacer puis poser, dans une seule transaction (`remplace_acces`) :
         en deux requêtes, deux administrateurs qui modifiaient le même compte
         lui laissaient l'union de leurs listes, et un salon retiré restait
         ouvert sans que personne le sache. Un échec n'y change rien du tout. */
      const { error } = await db.rpc("remplace_acces", { p_profil: profilId, p_evenements: voulus });
      if (error) throw new Error(error.message);
    };

    /* ---------------------------------------------------------- liste */
    if (action === "liste") {
      const { data: profils, error } = await db
        .from("profil").select("id,email,nom,prenom,role,cree_le").order("cree_le");
      if (error) throw new Error(error.message);
      /* Lus par tranches, et leur échec dit : une lecture refusée donnait à
         chaque compte une liste vide, une table au-delà du plafond de
         PostgREST (mille lignes) une liste tronquée, sans un mot. Et la
         console renvoie cette liste à l'enregistrement suivant :
         `remplace_acces` effaçait alors les salons manquants.

         Chaque tranche reprend après la dernière ligne lue, et non à un rang :
         les tranches ne partagent pas d'instantané, et une ligne effacée avant
         le rang (`remplace_acces` efface puis repose) faisait reculer la
         suivante d'un cran — jamais lue. Les identifiants sont des uuid : ils
         se posent tels quels dans le filtre. */
      const liens: { profil_id: string; evenement_id: string }[] = [];
      let apres: { profil_id: string; evenement_id: string } | null = null;
      for (;;) {
        let requete = db.from("acces")
          .select("profil_id,evenement_id")
          .order("profil_id").order("evenement_id")
          .limit(1000);
        if (apres) {
          requete = requete.or(`profil_id.gt.${apres.profil_id},and(profil_id.eq.${apres.profil_id},evenement_id.gt.${apres.evenement_id})`);
        }
        const { data: tranche, error: refus } = await requete;
        if (refus) throw new Error(refus.message);
        if (!tranche || !tranche.length) break;
        liens.push(...tranche);
        if (tranche.length < 1000) break;
        apres = tranche[tranche.length - 1];
      }

      /* Une invitation partie mais jamais ouverte se voit ici, et nulle part
         ailleurs : c'est ce qui distingue « compte créé » de « compte actif ».

         La liste se lit page par page. Une seule page de mille suffisait tant
         qu'on comptait les comptes sur les doigts ; le millier passé, tous les
         suivants se seraient affichés « invitation en attente » sans que rien
         ne le dise — et relancer un compte actif n'aurait servi à personne. */
      const PAR_PAGE = 200;
      const confirme = new Map<string, boolean>();
      // le plafond n'est qu'un garde-fou contre une boucle sans fin : c'est la
      // page incomplète qui arrête la lecture, et elle arrive toujours
      for (let page = 1; page <= 50; page++) {
        const { data: comptes, error } = await db.auth.admin.listUsers({ page, perPage: PAR_PAGE });
        if (error) throw new Error(error.message);
        const lot = comptes?.users ?? [];
        for (const u of lot) {
          confirme.set(u.id, Boolean(u.email_confirmed_at ?? u.last_sign_in_at));
        }
        if (lot.length < PAR_PAGE) break;
      }

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
      if (corps.retour && !retour) return repond({ erreur: RETOUR_REFUSE }, 400);

      const { data, error } = await db.auth.admin.inviteUserByEmail(email, {
        redirectTo: retour ?? undefined,
        data: { nom, prenom, role },
      });
      if (error) return repond({ erreur: error.message }, 400);
      const id = data.user.id;

      /* Le déclencheur a posé le profil ; on écrit ensuite ce que le
         déclencheur ne pouvait pas savoir seul — et on le réaffirme, parce
         qu'un tout premier compte naît administrateur quoi qu'on demande. */
      /* Son échec se dit : sans quoi l'invitation répondait « faite » d'un
         compte resté organisateur quand on l'avait voulu administrateur. */
      const { error: profilRefuse } = await db.from("profil")
        .update({ nom, prenom, role, email, modifie_le: new Date().toISOString() })
        .eq("id", id);
      if (profilRefuse) {
        return repond({ erreur: "Invitation envoyée, mais le profil n'a pas pu être réglé : " +
          profilRefuse.message }, 500);
      }
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
      if (corps.retour && !retour) return repond({ erreur: RETOUR_REFUSE }, 400);

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
