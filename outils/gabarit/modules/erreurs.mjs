/* ============================================================
   Les erreurs de la page, signalées

   Une page qui plantait chez un visiteur ne le disait à personne : la console
   du navigateur, seul témoin, n'est ouverte que par celui qui la regarde. Ce
   module écoute les erreurs du script et les promesses rejetées sans
   traitement, et les signale au Worker (`/api/erreur`), qui les ramène au
   module et à la ligne d'origine par la carte du script minifié, puis les
   compte par salon et par jour (`src/index.mjs` `erreur`, migration
   `les_erreurs_des_pages_du_plan`). Le rapport d'utilisation les montre.

   Ce qui part ne dit rien du visiteur : un message, un fichier, une ligne et
   une colonne. Ni jeton, ni stockage sur l'appareil, ni adresse de la page —
   l'adresse peut porter un parcours, un code de borne. Et rien ne part chez
   qui a refusé la mesure (`mesure.mjs` `mesureOuverte`) : il a dit non à ce
   que la page envoie d'elle-même, sans distinguer. L'exploitant, sur la page
   d'administration, n'a pas ce choix à faire — c'est son outil qu'on répare.

   Seules les erreurs de notre script comptent : une extension du navigateur,
   un script tiers injecté, une erreur d'une autre origine (« Script error. »,
   sans rien d'autre) ne disent rien de nos pages. Cinq au plus par
   chargement, chacune une fois : une erreur dans une boucle d'animation se
   répéterait soixante fois par seconde, et la base n'en veut qu'un compte.
   ============================================================ */
import { API, SLUG, PLAN_ADMIN } from "./salon.mjs";
import { mesureOuverte } from "./mesure.mjs";

const ERREUR_API = API ? API.replace(/[^/]*$/, "erreur") : "";
const PAR_CHARGEMENT = 5;
// le temps de réunir celles qui arrivent ensemble, une cascade le plus souvent
const DELAI = 2000;

const vues = new Set();
let attente = [];
let minuteur = null;

/** Ce qui vient de notre script : un fichier servi d'ici, sous `versions/`. */
function denous(fichier) {
  try {
    const u = new URL(fichier, location.href);
    return u.origin === location.origin && u.pathname.startsWith("/versions/");
  } catch (e) { return false; }
}

/** La première ligne d'une pile qui désigne notre script : fichier, ligne, colonne. */
function lieuDansLaPile(pile) {
  for (const m of String(pile || "").matchAll(/(https?:\/\/[^\s()]+?):(\d+):(\d+)/g))
    if (denous(m[1])) return { fichier: m[1], ligne: +m[2], colonne: +m[3] };
  return null;
}

function envoie() {
  minuteur = null;
  const erreurs = attente;
  attente = [];
  if (!erreurs.length) return;
  const corps = JSON.stringify({ slug: SLUG, page: PLAN_ADMIN ? "admin" : "plan", erreurs });
  try {
    fetch(ERREUR_API, { method: "POST", headers: { "Content-Type": "application/json" },
      body: corps, keepalive: true }).catch(() => {});
  } catch (e) { /* signaler une erreur ne doit jamais en faire une autre */ }
}

function signale(message, lieu) {
  if (!ERREUR_API || !SLUG || !lieu || vues.size >= PAR_CHARGEMENT) return;
  if (!PLAN_ADMIN && !mesureOuverte()) return;
  const m = String(message || "Erreur").slice(0, 300);
  const cle = m + " " + lieu.fichier + ":" + lieu.ligne + ":" + lieu.colonne;
  if (vues.has(cle)) return;
  vues.add(cle);
  attente.push({ message: m, ...lieu });
  if (!minuteur) minuteur = setTimeout(envoie, DELAI);
}

/**
 * Les écoutes, posées en tête du lancement (`lancement.mjs`) : tout ce qui
 * suit, branchements compris, est couvert.
 */
export function brancheErreurs() {
  if (!ERREUR_API) return;
  addEventListener("error", (e) => {
    // une ressource qui ne charge pas (une image, un script) n'est pas une erreur du code
    if (!(e instanceof ErrorEvent)) return;
    const lieu = denous(e.filename) ? { fichier: e.filename, ligne: e.lineno, colonne: e.colno }
      : lieuDansLaPile(e.error && e.error.stack);
    signale(e.message, lieu);
  });
  addEventListener("unhandledrejection", (e) => {
    const r = e.reason;
    signale(r && r.message ? (r.name ? r.name + ": " : "") + r.message : String(r),
      lieuDansLaPile(r && r.stack));
  });
  // la page qui se ferme emporte ce qui attendait : `keepalive` le laisse partir
  addEventListener("pagehide", () => { if (minuteur) { clearTimeout(minuteur); envoie(); } });
}
