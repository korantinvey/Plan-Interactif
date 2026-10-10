/* ============================================================
   Accès à l'administration du plan

   Cette page n'existe que pour l'exploitant. On réutilise la session ouverte
   dans la console : même projet, même compte, mêmes clés locales — les
   casiers et la lecture du jeton sont ceux de `session.mjs`, que la console
   emploie aussi.

   Un module de l'administration : `plan-admin.mjs` l'embarque, le visiteur ne
   le reçoit jamais. Ce qu'il n'importe pas — le mode administrateur à
   activer — lui est confié par `brancheAcces`, que le
   code soudé appelle à la place que ce code tenait (`_auth-plan.html`, versé
   par `genere.js` dans la seule page d'administration). Le profil du compte,
   qu'il lit, est à lui : la fenêtre des réglages l'importe (`reglages.mjs`).
   ============================================================ */
import { $ } from "./dom.mjs";
import { CLE_CFG, CLE_SESSION, contenuJeton, initialesDe } from "./session.mjs";
import { charge, confieAuDemarrage } from "./demarrage.mjs";

/* Ce que le code soudé confie encore : l'activation du mode administrateur
   (`modules/bande-admin.mjs`, qui importe l'enregistrement, lequel importe ce
   module — l'importer d'ici les bouclerait). Le chargement du plan, lui,
   s'importe (`demarrage.mjs`). */
/** @type {() => void} */
let activeAdmin;

/* Le profil du compte : « admin » ou non. Il ne fait qu'ajouter l'onglet
   « Admin » aux réglages — la base, elle, ne distingue pas les deux profils
   sur un salon affecté. Posé ici, où on le lit ; la fenêtre des réglages
   l'importe (`reglages.mjs`). */
export let PROFIL_ADMIN = false;

function litLocal(cle){
  try { return JSON.parse(localStorage.getItem(cle) || "null"); } catch (e) { return null; }
}

/** Réglage du poste s'il existe, configuration livrée sinon. */
function configuration(){
  return litLocal(CLE_CFG) || window.PLAN_CONFIG || null;
}

function normaliseUrlA(saisie){
  let u = String(saisie || "").trim();
  while (u.length && u[u.length - 1] === "/") u = u.slice(0, -1);
  if (!u) return "";
  const marque = "supabase.com/dashboard/project/";
  const i = u.toLowerCase().indexOf(marque);
  if (i >= 0){
    const ref = u.slice(i + marque.length).split("/")[0].split("?")[0];
    if (ref) return "https://" + ref + ".supabase.co";
  }
  if (u.indexOf(".") < 0 && u.indexOf(":") < 0) return "https://" + u + ".supabase.co";
  if (u.slice(0, 4).toLowerCase() !== "http") u = "https://" + u;
  return u;
}

/** Le jeton est-il encore valable ? On le vérifie auprès du serveur. */
async function sessionValide(cfg, session){
  if (!cfg?.url || !cfg?.anonKey || !session?.access_token) return false;
  try {
    const r = await fetch(cfg.url + "/auth/v1/user", {
      headers: { "apikey": cfg.anonKey, "Authorization": "Bearer " + session.access_token },
    });
    return r.ok;
  } catch (e) { return false; }
}

/**
 * La fenêtre d'accès. Le plan la rouvre aussi quand la base refuse une
 * session périmée (`demarrage.mjs`, sous garde `typeof` : la page publique,
 * qui ne la reçoit pas, n'a rien à rouvrir ; `enregistrement.mjs`, qui
 * l'importe).
 *
 * @param {string} [message]
 */
export function ecranAcces(message){
  const cfg = configuration() || {};
  const voile = document.createElement("div");
  voile.className = "modale open";
  voile.id = "acces";
  voile.innerHTML =
    '<div class="mfen" role="dialog" aria-modal="true">' +
    /* La marque, ici et nulle part ailleurs sur cette page : derrière la
       fenêtre, le plan est déjà celui du salon.
       Entre accents graves, et non entre apostrophes : esbuild réécrit une
       chaîne simple entre guillemets droits, et la marque qui prend sa place
       en porte dans chacun de ses attributs. Un gabarit sans substitution, il
       le laisse tel quel. */
    `<header class="teteMarque"><span class="marqueE2M"><!--__MARQUE__--></span>` +
    '<h2>Administration du plan</h2></header>' +
    '<div class="mcorps">' +
    '<p class="astuce" id="accesMsg"></p>' +
    '<label><span>Adresse du projet</span><input id="aUrl" placeholder="https://xxxx.supabase.co"></label>' +
    '<label><span>Clé publique (anon)</span><input id="aCle" placeholder="eyJhbGciOi…"></label>' +
    '<label><span>Adresse e-mail</span><input id="aMail" type="email" autocomplete="username"></label>' +
    '<label><span>Mot de passe</span><input id="aMdp" type="password" autocomplete="current-password"></label>' +
    '</div>' +
    '<footer><a class="btn" id="aPublic">Voir le plan public</a>' +
    '<a class="btn" id="aOubli" href="motdepasse">Mot de passe oublié</a>' +
    /* « accent » et non « primaire » : c'est ainsi que cette page-ci
       nomme le bouton qui porte ce pour quoi la fenêtre s'est ouverte — le
       second nom est celui de la console, et ne peignait rien ici. */
    '<button class="btn accent" id="aOk">Se connecter</button></footer></div>';
  document.body.appendChild(voile);

  $("aUrl").value = cfg.url || "";
  $("aCle").value = cfg.anonKey || "";
  // la configuration est livrée avec les pages : on ne la redemande pas
  if (cfg.url && cfg.anonKey){
    $("aUrl").closest("label").hidden = true;
    $("aCle").closest("label").hidden = true;
  }
  $("accesMsg").textContent = message || "Cette page est réservée à l'exploitant.";
  $("aPublic").href = "plan" + location.search;
  setTimeout(() => ($("aUrl").value ? $("aMail") : $("aUrl")).focus(), 40);

  const tente = async () => {
    const url = normaliseUrlA($("aUrl").value);
    const anonKey = $("aCle").value.trim();
    $("aUrl").value = url;
    if (!url || !anonKey){ $("accesMsg").textContent = "Adresse et clé publique sont nécessaires."; return; }
    $("accesMsg").textContent = "Connexion…";
    try {
      const r = await fetch(url + "/auth/v1/token?grant_type=password", {
        method: "POST",
        headers: { "apikey": anonKey, "Content-Type": "application/json" },
        body: JSON.stringify({ email: $("aMail").value.trim(), password: $("aMdp").value }),
      });
      // Une réponse vide ne doit pas ressortir en « Unexpected end of JSON
      // input » : on lit le texte, puis on tente de l'interpréter.
      const txt = await r.text();
      let j = {};
      try { j = txt ? JSON.parse(txt) : {}; } catch (e) { j = { msg: txt.slice(0, 120) }; }
      if (!r.ok) {
        throw new Error((j.error_description || j.msg || "Identifiants refusés.") +
          " (HTTP " + r.status + ")");
      }
      if (!j.access_token) {
        throw new Error("Réponse inattendue de " + url + " — HTTP " + r.status +
          (txt ? "" : ", corps vide") + ". Vérifiez l'adresse du projet.");
      }
      localStorage.setItem(CLE_CFG, JSON.stringify({ url, anonKey }));
      localStorage.setItem(CLE_SESSION, JSON.stringify(j));
      voile.remove();
      /* Attendu : le profil ne se connaît qu'au retour de la base, et sans
         cela un administrateur qui ouvrait ses réglages aussitôt, sur un
         réseau lent, n'y trouvait pas son onglet « Admin ». */
      await litProfilA({ url, anonKey }, j);
      activeAdmin();
      poseCompte();
      charge();
    } catch (e) {
      $("accesMsg").textContent = e.message;
    }
  };
  $("aOk").onclick = tente;
  $("aMdp").onkeydown = (e) => { if (e.key === "Enter"){ e.preventDefault(); tente(); } };
}

/* ------------------------------------------------------------------
   Le compte, une fois la porte franchie
   ------------------------------------------------------------------ */
/** L'adresse et l'identifiant sont dans le jeton — les demander au serveur
 *  serait un aller-retour de plus pour une donnée que le navigateur tient déjà
 *  en main. La lecture est celle de la console (`session.mjs`) ; un jeton
 *  illisible rend ici un objet vide plutôt que rien. */
const contenuDuJeton = (session) => contenuJeton(session?.access_token) || {};
const mailDuJeton = (session) => contenuDuJeton(session).email || "";

/**
 * Le profil du compte, qui décide de l'onglet « Admin » des réglages.
 *
 * L'organisateur a sur son salon les mêmes droits d'écriture que
 * l'administrateur : ce que la page lui retire ici est une offre, pas un
 * droit. Ces réglages décident du comportement du plan plus que de son
 * contenu, et l'on veut qu'un seul interlocuteur en décide. Sans réponse
 * — réseau, profil illisible —, l'onglet reste caché : c'est l'état sûr.
 */
async function litProfilA(cfg, session){
  const id = contenuDuJeton(session).sub;
  if (!cfg?.url || !id) return;
  try {
    const r = await fetch(cfg.url + "/rest/v1/profil?select=role&id=eq." + encodeURIComponent(id), {
      headers: { "apikey": cfg.anonKey, "Authorization": "Bearer " + session.access_token },
    });
    const j = r.ok ? await r.json() : [];
    PROFIL_ADMIN = Array.isArray(j) && j[0]?.role === "admin";
  } catch (e) { PROFIL_ADMIN = false; }
}

/* Les initiales de l'adresse — « jeanne.martin@… » donne « JM » — suivent la
   règle de la console : `session.mjs` `initialesDe`. */

function poseCompte(){
  const menu = $("menuCompte");
  if (!menu) return;
  const mail = mailDuJeton(litLocal(CLE_SESSION));
  $("avatarCompte").textContent = mail ? initialesDe(mail) : "··";
  $("compteMail").textContent = mail || "session inconnue";

  /* Sortir, c'est effacer la session du poste — la même que celle de la
     console, qui se retrouvera donc déconnectée elle aussi — puis recharger :
     la page repasse alors d'elle-même par son écran d'accès. */
  $("btnSortir").onclick = () => {
    try { localStorage.removeItem(CLE_SESSION); } catch (e) {}
    location.reload();
  };
}

/* ------------------------------------------------------------------
   Le branchement
   ------------------------------------------------------------------ */
/**
 * Appelé par le code soudé à la place que ce code tenait (`_auth-plan.html`) :
 * les écoutes du menu du compte s'y posent au même rang qu'avant parmi celles
 * du plan, et la vérification de la session part au même moment.
 *
 * @param {{ activeAdmin: typeof activeAdmin }} b
 */
export function brancheAcces(b){
  activeAdmin = b.activeAdmin;

  /* Un clic ailleurs, ou Échap, referme le panneau : rien d'autre ne dirait
     comment s'en défaire une fois ouvert au-dessus du plan. */
  document.addEventListener("click", (ev) => {
    const m = $("menuCompte");
    if (m && m.open && !m.contains(ev.target)) m.open = false;
  });
  document.addEventListener("keydown", (ev) => {
    const m = $("menuCompte");
    if (ev.key === "Escape" && m && m.open) m.open = false;
  });

  (async () => {
    const cfg = configuration();
    const session = litLocal(CLE_SESSION);
    if (await sessionValide(cfg, session)){
      await litProfilA(cfg, session);
      activeAdmin(); poseCompte(); charge();
    }
    else ecranAcces(session ? "Session expirée, reconnectez-vous." : null);
  })();
}

/* Une session refusée au chargement rouvre la fenêtre d'accès : le
   démarrage, que ce module importe, la reçoit d'ici en se chargeant. */
confieAuDemarrage({ ecranAcces });
