/* ============================================================
   Socle commun de la console et du rapport — accès au projet

   Tout passe par l'API REST de Supabase. La clé publique et l'adresse du
   projet sont demandées au premier lancement puis conservées sur le poste :
   elles n'ont pas à vivre dans le dépôt, et changent selon l'environnement.

   Le socle a longtemps été le haut du script de la console et du rapport
   (`_console-base.html`), que tout le reste appelait sans le dire. Il vit ici,
   et les modules de la console l'importent : l'appel à la base, la barre
   d'état, les briques d'affichage, l'adresse des pages et la session ne leur
   sont plus confiés par le code soudé. Le projet et la session (`CFG`,
   `SESSION`) sont des états de ce module, qu'il est seul à remplacer
   (`poseSession`) ; le code soudé les lit par accesseur.

   Ce qu'il ne peut pas importer — ce que chaque page fait après la connexion
   (`demarre`) et à la déconnexion (`videEcran`) — lui est confié par
   `brancheSocle`, que `_console-base.html` appelle à la place que ce code
   tenait : ce qui s'exécutait au chargement s'y exécute, au même rang.
   ============================================================ */
/* Les casiers du projet et de la session, la lecture d'un jeton et son
   échange sont communs avec le plan : `modules/session.mjs`. */
import { $ } from "./dom.mjs";
import { CLE_CFG, CLE_SESSION, contenuJeton, resteJeton, echangeSession, RESTE_JETON,
  initialesDe } from "./session.mjs";
import { ouvreModale, fermeModale, poseFenetre } from "./fenetre-console.mjs";

/** Le projet — son adresse et sa clé publique —, puis la session ouverte. */
/** @type {any} */
export let CFG = null;
/** @type {any} */
export let SESSION = null;

/**
 * Remplacer le projet, la session, ou les deux. Un nom inconnu lève une
 * erreur : une faute de frappe ne doit pas poser une variable que personne
 * ne lira.
 *
 * @param {{ CFG?: any, SESSION?: any }} valeurs
 */
function poseSession(valeurs) {
  for (const [nom, v] of Object.entries(valeurs)) {
    switch (nom) {
      case "CFG": CFG = v; break;
      case "SESSION": SESSION = v; break;
      default: throw new Error("poseSession, nom inconnu : « " + nom + " »");
    }
  }
}

/** @type {{ demarre: () => any, videEcran?: () => void }} */
let _page = { demarre: () => {} };

/* ------------------------------------------------------------------
   Appels

   Un jeton d'accès ne vaut qu'une heure ; la console, elle, reste ouverte la
   journée. Celui que la connexion posait périmait donc sur place, et tout ce
   qui partait ensuite revenait refusé : la table déconnectait sans prévenir,
   et les fonctions n'affichaient qu'« Erreur 401 » — au milieu d'une
   invitation, le mot ne dit rien de ce qu'il faut faire. Le jeton de
   renouvellement arrivait pourtant avec lui à la connexion, et dormait.
   ------------------------------------------------------------------ */
function entetes(json) {
  const h = { "apikey": CFG.anonKey };
  if (SESSION?.access_token) h["Authorization"] = "Bearer " + SESSION.access_token;
  if (json) h["Content-Type"] = "application/json";
  return h;
}

/** Renouvelle la session de la console : l'échange est commun avec le plan,
 *  la session qu'il rend est celle de cette page. */
function renouvelle() {
  if (!SESSION?.refresh_token) return Promise.resolve(false);
  return echangeSession(CFG, SESSION).then((neuve) => {
    if (!neuve) return false;
    poseSession({ SESSION: neuve });
    return true;
  });
}

/**
 * Un appel au projet, jeton frais en main : échangé avant de partir s'il
 * touche à sa fin, échangé puis l'appel refait s'il est refusé malgré tout.
 *
 * Le 403 reste où il est : c'est un droit qui manque, pas un jeton qui se
 * périme, et le renouveler ne le donnerait pas.
 *
 * @param {string} url
 * @param {RequestInit} [options]
 */
export async function appel(url, options = {}) {
  const envoie = () => fetch(url, {
    ...options,
    headers: { ...entetes(!!options.body), ...(options.headers || {}) },
  });
  if (SESSION?.access_token && resteJeton(SESSION.access_token) < RESTE_JETON) await renouvelle();
  const r = await envoie();
  if (r.status !== 401 || !SESSION?.refresh_token) return r;
  return (await renouvelle()) ? envoie() : r;
}

/**
 * @param {string} chemin
 * @param {RequestInit} [options]
 */
export async function rest(chemin, options = {}) {
  const r = await appel(CFG.url + "/rest/v1/" + chemin, options);
  if (r.status === 401 || r.status === 403) {
    deconnecte("Session expirée, reconnectez-vous.");
    throw new Error("Non autorisé.");
  }
  const txt = await r.text();
  let corps = null;
  try { corps = txt ? JSON.parse(txt) : null; } catch (e) { corps = { message: txt }; }
  if (!r.ok) {
    const d = [corps?.message, corps?.details, corps?.hint].filter(Boolean).join(" — ");
    throw new Error(d || "Erreur " + r.status + " sur " + chemin);
  }
  return corps;
}

/* ------------------------------------------------------------------
   Configuration et connexion
   ------------------------------------------------------------------ */
export function ecranConfig() {
  let url, cle;
  ouvreModale("Connexion au projet", (corps) => {
    const p = document.createElement("p");
    p.innerHTML = "L'adresse de l'<strong>API</strong> du projet, en " +
      "<code>.supabase.co</code> — pas celle du tableau de bord. La clé publique " +
      "est faite pour circuler côté navigateur : c'est son rôle. Ne mettez jamais " +
      "ici la clé de service.";
    const l1 = document.createElement("label");
    l1.innerHTML = "<span>Adresse du projet</span><input placeholder='https://xxxx.supabase.co'>";
    const l2 = document.createElement("label");
    l2.innerHTML = "<span>Clé publique (anon)</span><input placeholder='eyJhbGciOi…'>";
    corps.append(p, l1, l2);
    url = l1.querySelector("input");
    cle = l2.querySelector("input");
    url.value = CFG?.url || "";
    cle.value = CFG?.anonKey || "";
    p.hidden = !!(CFG?.url && CFG?.anonKey);
    setTimeout(() => url.focus(), 30);
  }, [{ libelle: "Valider", genre: "primaire", action: () => {
    const u = url.value.trim().replace(/\/+$/, ""), k = cle.value.trim();
    if (!u || !k) return false;
    poseSession({ CFG: { url: u, anonKey: k } });
    localStorage.setItem(CLE_CFG, JSON.stringify(CFG));
    ecranConnexion();
    /* La connexion a pris la place de cette fenêtre : la fermer maintenant,
       ce serait fermer celle qu'on vient d'ouvrir. */
    return false;
  } }]);
}

/** @param {string} [message] */
export function ecranConnexion(message) {
  let mail, mdp, msg;
  ouvreModale("Connexion", (corps) => {
    const l1 = document.createElement("label");
    l1.innerHTML = "<span>Adresse e-mail</span><input type='email' autocomplete='username'>";
    const l2 = document.createElement("label");
    l2.innerHTML = "<span>Mot de passe</span><input type='password' autocomplete='current-password'>";
    msg = document.createElement("p");
    msg.style.color = "var(--rouge)";
    if (message) msg.textContent = message;
    corps.append(l1, l2, msg);
    mail = l1.querySelector("input");
    mdp = l2.querySelector("input");
    setTimeout(() => mail.focus(), 30);
    mdp.onkeydown = (e) => { if (e.key === "Enter") { e.preventDefault(); tente(); } };
    const info = document.createElement("p");
    info.className = "aide";
    info.style.marginTop = "-4px";
    info.textContent = "Projet : " + (CFG?.url || "non configuré");
    corps.appendChild(info);
  }, [// la configuration prend la place : on ne referme pas ce qu'on vient d'ouvrir
      { libelle: "Changer de projet", action: () => { ecranConfig(); return false; } },
      { libelle: "Mot de passe oublié", action: () => { location.href = PAGE_MDP; } },
      { libelle: "Se connecter", genre: "primaire", action: () => { tente(); return false; } }]);

  async function tente() {
    msg.textContent = "Connexion…";
    msg.style.color = "var(--ink-3)";
    try {
      const url = CFG.url;
      const r = await fetch(url + "/auth/v1/token?grant_type=password", {
        method: "POST",
        headers: { "apikey": CFG.anonKey, "Content-Type": "application/json" },
        body: JSON.stringify({ email: mail.value.trim(), password: mdp.value }),
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
      poseSession({ SESSION: j });
      localStorage.setItem(CLE_SESSION, JSON.stringify(SESSION));
      fermeModale();
      _page.demarre();
    } catch (e) {
      msg.style.color = "var(--rouge)";
      msg.textContent = e.message;
    }
  }
}

/**
 * Fin de session. Ce qu'il faut effacer à l'écran dépend de la page : la
 * console vide sa liste d'événements, le rapport ses chiffres. Chacune le dit
 * en confiant `videEcran` à `brancheSocle`.
 *
 * @param {string} [message]
 */
export function deconnecte(message) {
  poseSession({ SESSION: null });
  // un stockage refusé ne doit pas priver l'exploitant de l'écran de connexion
  try { localStorage.removeItem(CLE_SESSION); } catch (e) {}
  if (typeof _page.videEcran === "function") _page.videEcran();
  ecranConnexion(message);
}

/* Le message va dans la barre du haut, qui existe toujours, et en écho dans
   la fiche quand elle est ouverte. Une erreur avalée est pire qu'une erreur. */
let effaceur;
/**
 * @param {string} txt
 * @param {boolean} [erreur]
 */
export function signale(txt, erreur) {
  const s = $("statut");
  if (s) {
    s.className = "statut " + (erreur ? "err" : "ok");
    s.textContent = txt;
    clearTimeout(effaceur);
    if (!erreur) effaceur = setTimeout(() => { s.textContent = ""; s.className = "statut"; }, 6000);
  }
  const m = $("msgSync");
  if (m) { m.className = erreur ? "err" : "ok"; m.textContent = txt; }
  if (erreur) console.error("[console]", txt);
}

/* ------------------------------------------------------------------
   Briques d'affichage
   ------------------------------------------------------------------ */
/**
 * Un bloc de la fiche : son intitulé, et à droite ce qui se compte sans le lire
 * — « 1 pavillon · 1 publié ». La note est facultative ; les blocs qui n'ont
 * rien à compter n'en portent pas.
 *
 * @param {string} titre
 * @param {string} [note]
 */
export const bloc = (titre, note) => {
  const d = document.createElement("div");
  d.className = "bloc";
  const h = document.createElement("div");
  h.className = "bloc-hd";
  const t = document.createElement("span");
  t.className = "eyebrow";
  t.textContent = titre;
  h.appendChild(t);
  if (note) {
    const n = document.createElement("span");
    n.className = "note";
    n.textContent = note;
    h.appendChild(n);
  }
  d.appendChild(h);
  return d;
};
export const grille = () => { const d = document.createElement("div"); d.className = "grille"; return d; };

/** Adresse de base des pages, déduite de celle de la console. */
export const BASE_PAGES = location.origin + location.pathname.replace(/[^/]*$/, "");

/* La page qui pose un mot de passe, qu'on y arrive par une invitation, par un
   oubli, ou depuis un écran de connexion. Elle est servie sans extension par
   Cloudflare, comme les autres. */
export const PAGE_MDP = BASE_PAGES + "motdepasse";

/**
 * L'identifiant du compte connecté, lu dans le jeton.
 *
 * Il y est déjà — c'est le champ `sub` — et le demander au serveur coûterait
 * un aller-retour à chaque chargement pour une donnée que le navigateur tient
 * en main.
 */
export const idCompte = () => contenuJeton(SESSION?.access_token)?.sub || null;

/* ------------------------------------------------------------------
   Thème
   ------------------------------------------------------------------ */
const CLE_THEME = "console-theme";

/* Sans réglage enregistré, le thème est celui du système : c'est lui qu'il
   faut interroger pour savoir vers quoi bascule le bouton. */
const themeSombre = () => {
  const cur = document.documentElement.getAttribute("data-theme");
  return cur ? cur === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
};

/* ------------------------------------------------------------------
   Le branchement
   ------------------------------------------------------------------ */
/* La page part vers celle du mot de passe. `location.replace` n'arrête pas le
   script : sans cette marque, la page commençait à charger pendant la
   redirection — le profil, les salons partaient ou non selon le moment, avec
   une session qui n'était peut-être pas celle qu'on apportait. */
let enPartance = false;

/**
 * Le premier écran : la configuration du projet, la connexion, ou la page
 * elle-même. Rien, si la page est déjà en train de partir.
 */
export function premierEcran() {
  if (enPartance) return;
  if (!CFG) ecranConfig();
  else if (!SESSION) ecranConnexion();
  else _page.demarre();
}

/**
 * Ce que la page confie au socle, et ce que le socle faisait au chargement,
 * dans l'ordre où il le faisait : relire le projet et la session, poser la
 * fenêtre et les menus, renvoyer un jeton de mot de passe vers sa page, poser
 * le thème et le menu du compte.
 *
 * @param {{ demarre: () => any, videEcran?: () => void }} page
 */
export function brancheSocle(page) {
  _page = page;

  try { poseSession({ CFG: JSON.parse(localStorage.getItem(CLE_CFG) || "null") }); } catch (e) {}
  try { poseSession({ SESSION: JSON.parse(localStorage.getItem(CLE_SESSION) || "null") }); } catch (e) {}
  if (window.PLAN_CONFIG && !CFG) poseSession({ CFG: window.PLAN_CONFIG });

  poseFenetre();

  /* Un menu déplié se referme sur un clic ailleurs et sur Échap : sans cela il
     resterait ouvert au-dessus de la fiche, et rien ne dirait comment le fermer. */
  document.addEventListener("click", (ev) => {
    const cible = /** @type {HTMLElement} */ (ev.target);
    document.querySelectorAll("details.menu[open]").forEach((d) => {
      if (!d.contains(cible) || cible.closest(".menu-pan")) d.open = false;
    });
  });
  document.addEventListener("keydown", (ev) => {
    if (ev.key !== "Escape") return;
    document.querySelectorAll("details.menu[open]").forEach((d) => d.open = false);
  });

  /* Même repli que sur la racine, pour le cas où le « Site URL » du projet
     désigne la console : un jeton de mot de passe n'a rien à faire ici, et
     l'écran de connexion serait une impasse pour celui qui l'apporte. */
  (() => {
    const q = new URLSearchParams(location.search);
    const h = new URLSearchParams((location.hash || "").replace(/^#/, ""));
    const type = h.get("type") || q.get("type") || "";
    const jeton = (h.get("access_token") || q.get("token_hash") || q.get("token")) &&
      (type === "recovery" || type === "invite" || type === "signup");
    if (jeton || h.get("error_description") || q.get("error_description")) {
      enPartance = true;
      location.replace(PAGE_MDP + location.search + location.hash);
    }
  })();

  // le thème
  try { const t = localStorage.getItem(CLE_THEME); if (t) document.documentElement.setAttribute("data-theme", t); } catch (e) {}

  $("btnTheme").onclick = () => {
    const next = themeSombre() ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem(CLE_THEME, next); } catch (e) {}
  };

  /* Le compte. Le panneau se remplit à l'ouverture, jamais au chargement : la
     session peut arriver après — on vient de se connecter — et l'ouverture est
     le seul moment où l'on est sûr d'avoir quelque chose de juste à montrer. */
  const menuCompte = document.querySelector("details.menu.compte");
  if (menuCompte) {
    menuCompte.addEventListener("toggle", () => {
      if (!menuCompte.open) return;
      const mail = contenuJeton(SESSION?.access_token)?.email || "";
      $("initiales").textContent = mail ? initialesDe(mail) : "··";
      $("compteMail").textContent = mail || "session inconnue";
      // le libellé annonce où l'on va, pas où l'on est
      $("btnTheme").textContent = themeSombre() ? "Thème clair" : "Thème sombre";
    });
    $("btnSortir").onclick = () => {
      menuCompte.open = false;
      deconnecte();
    };
  }
}
