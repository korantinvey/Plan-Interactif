/* ============================================================
   La session de l'exploitant, et l'appel à la base

   La console se connecte, et range sur le poste le projet et la session ; le
   plan d'administration les y relit. Les deux pages lisaient, mesuraient et
   renouvelaient le jeton chacune de son côté, avec la même règle écrite deux
   fois : elle est ici, une fois, et l'une comme l'autre l'importe.
   ============================================================ */

/* Les deux casiers, partagés par la console et le plan. */
export const CLE_CFG = "console-config";
export const CLE_SESSION = "console-session";

/** Session et projet, tels que la console les a laissés sur le poste. */
export function accesBase(){
  try {
    const cfg = JSON.parse(localStorage.getItem(CLE_CFG) || "null") || window.PLAN_CONFIG;
    const ses = JSON.parse(localStorage.getItem(CLE_SESSION) || "null");
    if (cfg?.url && cfg?.anonKey && ses?.access_token) return { cfg, ses };
  } catch (e) {}
  return null;
}

/* ------------------------------------------------------------
   Le jeton, et son renouvellement

   Un jeton d'accès Supabase vit une heure. Personne ne travaille une heure sur
   un plan : on l'ouvre le matin, on y revient dans la journée. Passé ce délai
   la base refusait tout, et chaque appelant le disait à sa façon — le bouton
   d'enregistrement tournait en rond sur son « réessayer », la carte de chaleur
   et le classement de la suggestion rendaient un « JWT expired » brut à qui
   n'avait rien demandé. La session était pourtant récupérable : la console
   range à côté du jeton qui expire celui qui permet d'en obtenir un neuf.

   L'échange se fait donc ici, au seul endroit par lequel passent tous les
   appels à la base, comme la console le fait du sien.
   ------------------------------------------------------------ */
export const RESTE_JETON = 60;   // secondes en deçà desquelles on échange avant de partir

/** La charge utile d'un jeton. Elle se lit sans le serveur — seule la
 *  signature demande sa clé, et c'est lui qui la vérifiera à chaque appel. */
export function contenuJeton(jeton){
  try {
    const p = String(jeton || "").split(".")[1];
    if (!p) return null;
    return JSON.parse(atob(p.replace(/-/g, "+").replace(/_/g, "/")));
  } catch (e) { return null; }
}

/** Secondes restantes à un jeton. Illisible, on le suppose bon : le serveur
 *  tranchera, et son refus déclenchera l'échange. */
export function resteJeton(jeton){
  const exp = contenuJeton(jeton)?.exp;
  return typeof exp === "number" ? exp - Date.now() / 1000 : Infinity;
}

/* Un échange à la fois : un jeton de renouvellement ne sert qu'une fois, et la
   publication écrit pavillon par pavillon — trois échanges lancés de front en
   perdraient deux, et la session avec. */
let echange = null;

/**
 * Échange le jeton de renouvellement contre une session neuve, rangée là où
 * la console la range : c'est le même casier, et la console comme le plan
 * doivent y lire la même chose. Rend la session, ou rien si elle est bel et
 * bien finie.
 */
export function echangeSession(cfg, ses){
  if (!ses?.refresh_token) return Promise.resolve(null);
  if (!echange){
    echange = (async () => {
      try {
        const r = await fetch(cfg.url + "/auth/v1/token?grant_type=refresh_token", {
          method: "POST",
          headers: { "apikey": cfg.anonKey, "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: ses.refresh_token }),
        });
        const j = await r.json().catch(() => null);
        if (!r.ok || !j?.access_token) return null;
        // un stockage refusé ne doit pas coûter la session en cours
        try { localStorage.setItem(CLE_SESSION, JSON.stringify(j)); } catch (e) {}
        return j;
      } catch (e) {
        // une coupure du réseau n'est pas une session finie : on ne déconnecte pas
        return null;
      } finally { echange = null; }
    })();
  }
  return echange;
}

export async function base(acces, chemin, options = {}){
  const envoie = () => fetch(acces.cfg.url + "/rest/v1/" + chemin, {
    ...options,
    headers: {
      "apikey": acces.cfg.anonKey,
      "Authorization": "Bearer " + acces.ses.access_token,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  /* La session neuve est reposée dans « acces », que l'appelant garde d'une
     écriture à l'autre : les pavillons suivants partent avec le jeton frais, et
     la purge du cache aussi. */
  const echangeContre = async () => {
    const neuve = await echangeSession(acces.cfg, acces.ses);
    if (neuve) acces.ses = neuve;
    return !!neuve;
  };

  if (resteJeton(acces.ses.access_token) < RESTE_JETON) await echangeContre();
  let r = await envoie();
  let txt = await r.text();
  /* Et refusé malgré tout — une horloge en retard, un jeton révoqué ailleurs —
     on échange puis on refait l'appel. Le 403 a sa place ici, contre toute
     attente : ce projet répond 403 à un jeton périmé là où l'on guettait un
     401, et le tenir pour un droit manquant faisait tourner l'enregistrement
     en rond — l'exploitant dessinait une matinée entière sans que rien ne
     parte, puis fermait l'onglet. Le corps de la réponse tranche : lui seul
     distingue le jeton mort du droit qui manque vraiment. */
  const jetonMort = (etat, corps) => etat === 401 ||
    (etat === 403 && /jwt|token|expir/i.test(corps));
  if (jetonMort(r.status, txt) && await echangeContre()){
    r = await envoie();
    txt = await r.text();
  }
  /* Une session que même l'échange ne rattrape plus se dit en toutes lettres :
     le corps de la réponse parle de JWT, ce qui ne veut rien dire pour qui
     voulait seulement enregistrer son plan. */
  if (jetonMort(r.status, txt)) throw new Error("session expirée, reconnectez-vous");
  if (!r.ok) throw new Error("HTTP " + r.status + " · " + txt.slice(0, 160));
  return txt ? JSON.parse(txt) : null;
}
