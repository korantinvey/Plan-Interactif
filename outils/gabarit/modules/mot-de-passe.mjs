/* ============================================================
   Poser un mot de passe

   Une invitation et un oubli de mot de passe arrivent ici par le même chemin :
   Supabase envoie un lien, le lien ouvre cette page avec un jeton, et le jeton
   permet la seule chose qu'on veuille en faire — écrire un mot de passe. La
   page ne sait rien faire d'autre, et n'a besoin d'aucune session préalable.

   Elle sert aussi de porte d'entrée quand on n'a pas de lien : sans jeton, elle
   demande une adresse et en fait envoyer un.

   Le jeton voyage de deux façons selon la version du service : dans le
   fragment (`#access_token=…`), qui ne quitte jamais le navigateur, ou dans la
   requête sous forme de jeton à vérifier (`?token_hash=…&type=…`). On accepte
   les deux plutôt que de dépendre d'un réglage de projet.

   C'était tout le script de la page (`_motdepasse.html`), qui tenait sa propre
   copie de `$` et écrivait en toutes lettres les casiers de la console : il
   les importe désormais de `dom.mjs` et de `session.mjs`, comme la console et
   le plan. La page n'en garde que le branchement, à la place que ce code
   tenait : ce qu'il faisait au chargement s'y fait au même rang.
   ============================================================ */
import { $ } from "./dom.mjs";
import { CLE_CFG, CLE_SESSION } from "./session.mjs";

/** Le projet, tel que la console l'a laissé sur le poste. */
let CFG = null;

const dit = (texte, genre) => {
  $("msg").textContent = texte || "";
  $("msg").className = "msg" + (genre ? " " + genre : "");
};

/** Les paramètres du fragment, qui portent le jeton quand il y en a un. */
function fragment() {
  const h = (location.hash || "").replace(/^#/, "");
  return new URLSearchParams(h);
}

/** Le mot de passe posé, la session qui vient de servir est celle de la
 *  console : on la lui laisse, et l'invité entre sans se reconnecter. */
function garde(session) {
  try { localStorage.setItem(CLE_SESSION, JSON.stringify(session)); } catch (e) {}
}

async function lit(reponse) {
  const txt = await reponse.text();
  let j = {};
  try { j = txt ? JSON.parse(txt) : {}; } catch (e) { j = { msg: txt.slice(0, 160) }; }
  return j;
}

let JETON = null;

/* ------------------------------------------------------------------
   Ce que le lien apporte
   ------------------------------------------------------------------ */
function demandeLien(message, genre) {
  $("titre").textContent = "Mot de passe oublié";
  $("intro").textContent = "Indiquez votre adresse : vous recevrez un lien pour " +
    "choisir un nouveau mot de passe.";
  $("formMail").hidden = false;
  if (message) dit(message, genre || "err");
  setTimeout(() => $("mail").focus(), 40);
}

function ouvreSaisie(invitation) {
  $("titre").textContent = invitation ? "Bienvenue" : "Nouveau mot de passe";
  $("intro").textContent = invitation
    ? "Choisissez le mot de passe qui ouvrira votre console."
    : "Choisissez votre nouveau mot de passe.";
  $("formMdp").hidden = false;
  setTimeout(() => $("mdp1").focus(), 40);
}

/* ------------------------------------------------------------------
   Le branchement
   ------------------------------------------------------------------ */
/**
 * Ce que la page faisait au chargement, dans l'ordre où elle le faisait :
 * relire le projet, poser les deux formulaires, puis lire ce que le lien
 * apporte. Appelé par `_motdepasse.html`, à la place que ce code tenait.
 */
export function brancheMotDePasse() {
  CFG = (() => {
    try {
      const local = JSON.parse(localStorage.getItem(CLE_CFG) || "null");
      if (local?.url && local?.anonKey) return local;
    } catch (e) {}
    return window.PLAN_CONFIG || null;
  })();

  /* ----------------------------------------------------------------
     Écrire le mot de passe
     ---------------------------------------------------------------- */
  $("poser").onclick = async () => {
    const a = $("mdp1").value, b = $("mdp2").value;
    if (a.length < 8) return dit("Huit caractères au moins.", "err");
    if (a !== b) return dit("Les deux saisies diffèrent.", "err");
    dit("Enregistrement…");
    $("poser").disabled = true;
    try {
      const r = await fetch(CFG.url + "/auth/v1/user", {
        method: "PUT",
        headers: {
          "apikey": CFG.anonKey,
          "Authorization": "Bearer " + JETON,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: a }),
      });
      const j = await lit(r);
      if (!r.ok) throw new Error(j.error_description || j.msg || j.message || "Refusé (HTTP " + r.status + ")");
      $("formMdp").hidden = true;
      $("apres").hidden = false;
      dit("Mot de passe enregistré.", "ok");
    } catch (e) {
      $("poser").disabled = false;
      dit(e.message, "err");
    }
  };

  /* ----------------------------------------------------------------
     Demander un lien
     ---------------------------------------------------------------- */
  $("envoyer").onclick = async () => {
    const adresse = $("mail").value.trim();
    if (adresse.indexOf("@") < 1) return dit("Adresse incomplète.", "err");
    dit("Envoi…");
    $("envoyer").disabled = true;
    try {
      const r = await fetch(CFG.url + "/auth/v1/recover", {
        method: "POST",
        headers: { "apikey": CFG.anonKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          email: adresse,
          // le lien doit revenir ici, et nulle part ailleurs
          redirect_to: location.origin + location.pathname,
        }),
      });
      const j = await lit(r);
      if (!r.ok) throw new Error(j.error_description || j.msg || j.message || "Envoi refusé.");
      /* On ne dit pas si l'adresse existe : ce serait un moyen commode de
         dresser la liste des comptes du projet. */
      dit("Si un compte porte cette adresse, un lien vient de partir. " +
          "Le message peut mettre une minute, et finir dans les indésirables.", "ok");
    } catch (e) {
      dit(e.message, "err");
    } finally {
      $("envoyer").disabled = false;
    }
  };

  (async () => {
    if (!CFG?.url || !CFG?.anonKey) {
      $("intro").textContent = "";
      return dit("Ce site n'est pas relié à un projet : ouvrez d'abord la console.", "err");
    }

    const f = fragment();
    const q = new URLSearchParams(location.search);

    // un lien périmé ou déjà utilisé revient avec son motif : le dire vaut mieux
    // que de présenter un formulaire qui ne marchera pas
    const souci = f.get("error_description") || q.get("error_description");
    if (souci) {
      $("intro").textContent = "";
      return demandeLien(decodeURIComponent(souci.replace(/\+/g, " ")));
    }

    const type = f.get("type") || q.get("type") || "";

    if (f.get("access_token")) {
      JETON = f.get("access_token");
      garde({ access_token: JETON, refresh_token: f.get("refresh_token") || null });
      // le jeton n'a pas à rester dans la barre d'adresse ni dans l'historique
      history.replaceState(null, "", location.pathname);
      $("intro").textContent = "";
      return ouvreSaisie(type === "invite");
    }

    const hache = q.get("token_hash") || q.get("token");
    if (hache) {
      try {
        const r = await fetch(CFG.url + "/auth/v1/verify", {
          method: "POST",
          headers: { "apikey": CFG.anonKey, "Content-Type": "application/json" },
          body: JSON.stringify({ type: type || "recovery", token_hash: hache }),
        });
        const j = await lit(r);
        if (!r.ok || !j.access_token) {
          throw new Error(j.error_description || j.msg || "Ce lien n'est plus valable.");
        }
        JETON = j.access_token;
        garde(j);
        history.replaceState(null, "", location.pathname);
        $("intro").textContent = "";
        return ouvreSaisie(type === "invite");
      } catch (e) {
        $("intro").textContent = "";
        return demandeLien(e.message);
      }
    }

    $("intro").textContent = "";
    demandeLien();
  })();
}
