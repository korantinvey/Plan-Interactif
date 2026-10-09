/* ============================================================
   Lire le code d'un parcours avec la caméra du plan

   Le partage d'un parcours se fait par un code QR que l'autre téléphone
   photographie. L'appareil photo du système suit alors le lien, et ouvre le
   plan dans le navigateur. C'est très bien quand le plan est notre page ; ça
   ne l'est plus quand il vit dans le site ou l'application d'un salon : le
   visiteur en sort, et retrouve un plan nu, loin de chez l'organisateur.

   Le lecteur ne suit pas le lien : il lit ce qu'il porte. Le parcours tient
   tout entier dans le fragment (`modules/lien-parcours.mjs`), et l'adresse
   devant lui ne compte pas — un code fait par notre page se lit dans
   l'application d'un salon, et l'inverse. Ce qui est lu passe par la même
   fenêtre qu'un lien ouvert (`modules/parcours-recu.mjs`).

   Rien ne sort de l'appareil : l'image de la caméra est lue sur place, et
   seul le texte du code en est tiré.

   Deux décodeurs. Celui du navigateur d'abord (`BarcodeDetector`), quand il
   lit les codes QR — Chrome sur Android, entre autres. Sinon jsQR, servi par
   le site comme deck.gl et demandé seulement à l'ouverture du lecteur : le
   visiteur qui ne scanne jamais ne le télécharge pas.

   Un plan embarqué dans un cadre n'a la caméra que si la page hôte la lui
   accorde (`allow="camera"`, dans le fragment que donne la console) ; une
   application, que si elle la laisse passer à sa vue web. Faute de quoi le
   refus se dit, et le lien reste le recours.

   Branché par `_partage.html`, après le partage : le bouton vit à côté du
   sien, dans la tête du tiroir.
   ============================================================ */
import { $ } from "./dom.mjs";
import { SLUG, BORNE } from "./salon.mjs";
import { ouvreModale, fermeModale, poseAvantFermeture } from "./fenetre.mjs";
import { CLE_LIEN_PARCOURS } from "./lien-parcours.mjs";
import { proposeParcoursRecu } from "./parcours-recu.mjs";

/* Version figée, empreinte vérifiée, comme deck.gl (`modules/webgl.mjs`). Pour
   en changer : réduire par esbuild le `dist/jsQR.js` du paquet npm `jsqr`,
   le poser dans `web/bibliotheques/` sous le nom de sa version, et reporter
   son empreinte ici. */
const JSQR = {
  src: "bibliotheques/jsQR-1.4.0.min.js",
  integrite: "sha384-RICj30q67hdXNFjnu0YiiS7KiJyI/KcrVQ6Bch8unsNR27o6lx7ClEXpWJCZvIgp",
};

/* Une image lue tous les cent cinquante millièmes de seconde : assez pour que
   le code soit pris dès qu'il est net, sans faire chauffer un téléphone qui
   décode au rythme de l'écran. */
const PAS_LECTURE = 150;

/* La plus grande largeur lue. Un code tenu à bout de bras couvre le tiers de
   l'image : six cent quarante points lui en laissent plus qu'il n'en faut, et
   jsQR coûte en proportion de la surface. */
const LARGEUR_LUE = 640;

/* Les serveurs d'Event2Map, outre celui qui sert cette page : la production,
   et les prévisualisations de branche, `<branche>-plan-interactif…`. Un
   domaine propre ajouté au déploiement s'ajoute ici, sans quoi les codes faits
   depuis lui ne se liraient que sur lui. */
const HOTES_EVENT2MAP = /^(?:[a-z0-9-]+-)?plan-interactif\.interactiveplan\.workers\.dev$/;

/* Les pages d'où un parcours se partage : le plan public, celui d'un salon
   installé (`/plan-<salon>`), la démonstration. */
const PAGE_DU_PLAN = /^\/plan(?:-[a-z0-9-]+)?(?:\.html)?$/;

/** Le plan peut-il lire un code ? Une caméra à demander, et un visiteur à qui
 *  garder ce qu'il lit — une borne se remet à zéro pour le suivant. */
const lecteurOffert = () => !BORNE && !!navigator.mediaDevices?.getUserMedia;

/* ------------------------------------------------------------
   Les décodeurs
   ------------------------------------------------------------ */
/** @type {Promise<any> | null} */
let chargement = null;

/** jsQR, demandé une fois. */
function chargeJsQR(){
  const w = /** @type {any} */ (window);
  if (w.jsQR) return Promise.resolve(w.jsQR);
  if (!chargement) chargement = new Promise((ok, ko) => {
    const s = document.createElement("script");
    s.src = JSQR.src; s.integrity = JSQR.integrite;
    s.onload = () => w.jsQR ? ok(w.jsQR) : ko(new Error("jsQR absent"));
    s.onerror = () => { chargement = null; ko(new Error("jsQR introuvable")); };
    document.head.appendChild(s);
  });
  return chargement;
}

/**
 * Le décodeur de cet appareil : une fonction qui lit une image de la vidéo et
 * rend le texte du code, ou rien.
 *
 * @returns {Promise<(video: HTMLVideoElement) => Promise<string | null>>}
 */
async function decodeur(){
  const Detecteur = /** @type {any} */ (window).BarcodeDetector;
  if (Detecteur){
    try {
      const formats = await Detecteur.getSupportedFormats();
      if (formats.includes("qr_code")){
        const d = new Detecteur({ formats: ["qr_code"] });
        return async (v) => {
          const vus = await d.detect(v);
          return vus.length ? vus[0].rawValue : null;
        };
      }
    } catch (e) {}
  }
  const jsQR = await chargeJsQR();
  const toile = document.createElement("canvas");
  const ctx = /** @type {CanvasRenderingContext2D} */
    (toile.getContext("2d", { willReadFrequently: true }));
  return async (v) => {
    const l = v.videoWidth, h = v.videoHeight;
    if (!l || !h) return null;
    const k = Math.min(1, LARGEUR_LUE / l);
    toile.width = Math.round(l * k);
    toile.height = Math.round(h * k);
    ctx.drawImage(v, 0, 0, toile.width, toile.height);
    const img = ctx.getImageData(0, 0, toile.width, toile.height);
    /* Le code du plan est toujours noir sur blanc (`.qrPlaque`) : chercher
       aussi l'inverse doublerait le travail pour rien. */
    const lu = jsQR(img.data, img.width, img.height, { inversionAttempts: "dontInvert" });
    return lu ? lu.data : null;
  };
}

/* ------------------------------------------------------------
   Ce que le code porte
   ------------------------------------------------------------ */
/**
 * Le parcours qu'un texte lu porte, sous la forme du fragment — ou ce qui
 * empêche de le prendre.
 *
 * Seul un lien vers un plan Event2Map est pris. Un code QR peut porter
 * n'importe quoi — l'adresse d'un exposant, un billet, une carte de visite —
 * et le lecteur ne saurait qu'en faire : il ne suit aucun lien, il ne lit
 * que nos parcours. Le serveur se reconnaît (celui de cette page, ou l'un des
 * nôtres), la page aussi, et le fragment doit être un parcours.
 *
 * Le salon se compare quand le lien le nomme : un parcours d'un autre salon
 * se verrait sinon accueilli par « rien de ce salon », qui laisse croire à
 * une panne. Les identifiants, eux, se confrontent plus loin au salon ouvert,
 * comme pour un lien (`proposeParcoursRecu`).
 *
 * @param {string} texte
 * @returns {{ brut: string } | { refus: string }}
 */
function litParcours(texte){
  /** @type {URL} */
  let u;
  try { u = new URL(texte.trim()); }
  catch (e) { return { refus: "Ce code ne vient pas d'un plan Event2Map." }; }
  const notre = u.origin === location.origin ||
    (u.protocol === "https:" && HOTES_EVENT2MAP.test(u.hostname));
  if (!notre || !PAGE_DU_PLAN.test(u.pathname))
    return { refus: "Ce code ne vient pas d'un plan Event2Map." };
  const brut = u.hash.replace(/^#/, "");
  const salon = u.searchParams.get("plan") || "";
  if (brut.indexOf(CLE_LIEN_PARCOURS) !== 0)
    return { refus: "Ce code mène à un plan, mais ne porte pas de parcours." };
  if (salon && SLUG && salon !== SLUG)
    return { refus: "Ce parcours a été préparé pour un autre salon." };
  return { brut };
}

/* ------------------------------------------------------------
   La fenêtre
   ------------------------------------------------------------ */
function ouvreLecteur(){
  /** @type {MediaStream | null} */
  let flux = null;
  let fini = false;
  /** @type {HTMLVideoElement} */
  let video;
  /** @type {HTMLElement} */
  let etat;

  const arrete = () => {
    fini = true;
    if (flux) flux.getTracks().forEach(t => t.stop());
    flux = null;
  };
  const dit = (texte, erreur) => {
    etat.textContent = texte;
    etat.classList.toggle("refus", !!erreur);
  };

  ouvreModale("Scanner un parcours", corps => {
    const p = document.createElement("p");
    p.textContent = "Visez le code affiché par l'autre téléphone, dans « Partager mon parcours ».";
    corps.appendChild(p);

    const cadre = document.createElement("div");
    cadre.className = "lecteurQr";
    video = document.createElement("video");
    // `playsinline` : sans lui, Safari sur iPhone ouvre la vidéo en plein écran
    video.setAttribute("playsinline", "");
    video.muted = true;
    cadre.appendChild(video);
    const viseur = document.createElement("span");
    viseur.className = "viseur";
    cadre.appendChild(viseur);
    corps.appendChild(cadre);

    etat = document.createElement("p");
    etat.className = "qrNote lecteurEtat";
    etat.setAttribute("role", "status");
    corps.appendChild(etat);
  }, [{ libelle: "Annuler" }], "partage");
  /* Posé après l'ouverture, qui vide le crochet de la fenêtre d'avant : la
     caméra s'éteint quelle que soit la sortie — croix, voile, Échap, ou la
     fenêtre du parcours lu qui prend la place. */
  poseAvantFermeture(arrete);
  dit("Ouverture de la caméra…");

  navigator.mediaDevices.getUserMedia({
    audio: false,
    video: { facingMode: { ideal: "environment" } },
  }).then(async (f) => {
    if (fini){ f.getTracks().forEach(t => t.stop()); return; }
    flux = f;
    video.srcObject = f;
    await video.play().catch(() => {});
    let lit;
    try { lit = await decodeur(); }
    catch (e) {
      /* Le décodeur ne vient pas — réseau coupé avant qu'il soit gardé. La
         caméra s'éteint : elle n'a plus rien à montrer. */
      if (!fini){
        arrete();
        dit("Le lecteur n'a pas pu se charger. Ouvrez plutôt le lien du parcours qu'on vous a envoyé.", true);
      }
      return;
    }
    if (fini) return;
    dit("Cherche un code…");
    let dernierRefus = "";
    const tour = async () => {
      if (fini) return;
      let texte = null;
      try { texte = await lit(video); } catch (e) {}
      if (fini) return;
      if (texte){
        const r = litParcours(texte);
        if ("brut" in r){
          arrete();
          fermeModale();
          proposeParcoursRecu(r.brut);
          return;
        }
        /* Un code étranger ne fait rien : on le dit, et l'on continue de
           chercher — le code d'à côté, une affiche, un billet, passe souvent
           dans le champ avant le bon. */
        if (r.refus !== dernierRefus){ dernierRefus = r.refus; dit(r.refus, true); }
      }
      setTimeout(tour, PAS_LECTURE);
    };
    tour();
  }).catch((e) => {
    if (fini) return;
    // la caméra a pu s'ouvrir avant l'erreur : elle ne reste pas allumée pour rien
    arrete();
    const nom = e && e.name;
    /* Un refus de la caméra a deux auteurs possibles, que le navigateur ne
       distingue pas : le visiteur, ou la page qui embarque le plan sans la
       lui accorder. La phrase vaut pour les deux. */
    dit(nom === "NotAllowedError" || nom === "SecurityError"
      ? "La caméra n'est pas autorisée ici. Autorisez-la, ou ouvrez le lien du parcours qu'on vous a envoyé."
      : nom === "NotFoundError" || nom === "OverconstrainedError"
        ? "Aucune caméra n'a été trouvée sur cet appareil."
        : "La caméra n'a pas pu s'ouvrir. Ouvrez plutôt le lien du parcours qu'on vous a envoyé.", true);
  });
}

/* ------------------------------------------------------------
   Le branchement
   ------------------------------------------------------------ */
/**
 * Appelé par `_partage.html`, juste après le partage. Sans caméra à demander,
 * le bouton s'efface plutôt que de mener à un refus certain.
 */
export function brancheLecteur(){
  const b = $("btnScanner");
  if (!b) return;
  b.hidden = !lecteurOffert();
  b.onclick = ouvreLecteur;
}
