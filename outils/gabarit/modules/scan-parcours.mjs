/* ============================================================
   Lire le code QR d'un parcours, depuis le plan

   Un parcours se donne par son code (`partage.mjs`), et l'appareil photo du
   téléphone d'en face l'ouvre — dans le navigateur. C'est très bien depuis
   un onglet, et c'est la panne quand le plan vit dans une application qui
   l'embarque (Eventmaker, une coque de salon) : le lien part dans Safari ou
   Chrome, loin de l'application où le visiteur tient sa liste, et la
   proposition de charger le parcours s'y affiche sur une liste vide. Lire le
   code sans quitter la page, c'est garder le partage là où il sert.

   Trois portes, essayées dans l'ordre, parce qu'aucune ne s'ouvre partout :

   1. la caméra en direct (`getUserMedia`) — c'est ce qu'on attend, mais une
      vue web ne la reçoit que si l'application qui l'héberge l'accorde ;
   2. une photo du code (`<input capture>`), qui passe par le sélecteur de
      fichiers du système, et que bien des coques laissent passer quand elles
      refusent la caméra ;
   3. le décodage, lui, se fait par `BarcodeDetector` quand le navigateur le
      sait (Chrome sur Android), et sinon par jsQR, rapatrié par
      `npm run jsqr` et chargé à la première lecture seulement : le visiteur
      qui ne scanne rien ne le reçoit jamais.

   Ce qui est lu passe par la même porte qu'un lien ouvert
   (`parcours-recu.mjs` `proposeParcoursRecu`) : même relecture, même fenêtre,
   même canal de mesure.

   Il se retire par « Réglages du plan » (`apparence.mjs` `COMMANDES`,
   `_scanParcours`), et ne se montre ni sur une borne, ni sur un ordinateur
   (`brancheScanParcours`).

   Il se branche par `brancheScanParcours`, que `lancement.mjs` `lancePlan`
   appelle après le partage.
   ============================================================ */
import { $, auDoigt } from "./dom.mjs";
import { SLUG, BORNE } from "./salon.mjs";
import { ouvreModale, poseAvantFermeture } from "./fenetre.mjs";
import { CLE_LIEN_PARCOURS, litCodeParcours } from "./lien-parcours.mjs";
import { proposeParcoursRecu } from "./parcours-recu.mjs";

/* Le nom porte l'empreinte du contenu, et la demande la vérifie : ce dossier
   se garde un an sans revalider. À refaire par `npm run jsqr`. */
const LECTEUR_QR = {
  script: "bibliotheques/jsqr-1.4.0-b6677700.min.js",
  integrite: "sha384-l6zSlrX6P10T9s7xKWTK/RsXfiN3tMUuUwX6xkEtAW6KEj9Cd2D+SgUIfMxH+uGg",
};

/* Cinq images par seconde suffisent à qui tient un téléphone devant un code,
   et laisse respirer un appareil d'entrée de gamme : jsQR lit une image de
   640 pixels en quelques dizaines de millisecondes. */
const ECART_LECTURE = 200;
/* La largeur à laquelle une image de la caméra se lit. Plus grand ne lit pas
   mieux un code qui occupe le viseur, et coûte le carré. */
const LARGEUR_VIDEO = 640;
/* Une photo, elle, peut venir de loin et de biais : on lui laisse plus de
   pixels, une fois. */
const LARGEUR_PHOTO = 1600;

/* ------------------------------------------------------------
   Le décodeur
   ------------------------------------------------------------ */
/** @type {Promise<((t: HTMLCanvasElement, vite: boolean) => Promise<string|null>) | null> | null} */
let decodeurPret = null;

/** Le script de jsQR, posé dans la page ; il s'inscrit sur l'objet global. */
const chargeJsQr = () => new Promise((fin, echec) => {
  const s = document.createElement("script");
  s.src = LECTEUR_QR.script;
  s.integrity = LECTEUR_QR.integrite;
  s.crossOrigin = "anonymous";
  s.onload = fin;
  s.onerror = () => echec(new Error("lecteur de codes QR indisponible"));
  document.head.appendChild(s);
});

/**
 * Une fonction qui lit le code d'une toile — ou `null` si rien ne sait lire
 * ici. Demandée une fois ; les appels suivants reçoivent la même.
 *
 * `BarcodeDetector` d'abord, quand il dit savoir les codes QR : il est natif,
 * plus rapide, et ne coûte aucun téléchargement. Sa seule présence ne suffit
 * pas — Chrome sur ordinateur l'expose sans aucun format sous Linux.
 */
function decodeur(){
  if (!decodeurPret) decodeurPret = (async () => {
    const BD = /** @type {any} */ (globalThis).BarcodeDetector;
    if (BD) try {
      const formats = await BD.getSupportedFormats();
      if (formats.includes("qr_code")){
        const d = new BD({ formats: ["qr_code"] });
        return async (toile) => {
          const r = await d.detect(toile);
          return r.length ? r[0].rawValue : null;
        };
      }
    } catch (e) { /* on passe à jsQR */ }
    try {
      await chargeJsQr();
      const jsQR = /** @type {any} */ (globalThis).lecteurQr;
      return async (toile, vite) => {
        const ctx = toile.getContext("2d", { willReadFrequently: true });
        if (!ctx) return null;
        const img = ctx.getImageData(0, 0, toile.width, toile.height);
        /* Un code imprimé clair sur sombre ne se rencontre presque jamais ;
           le chercher double le temps de chaque image. Une photo, prise une
           fois, peut se l'offrir. */
        const r = jsQR(img.data, img.width, img.height,
          { inversionAttempts: vite ? "dontInvert" : "attemptBoth" });
        return r ? r.data : null;
      };
    } catch (e) {
      console.warn("Parcours : aucun lecteur de codes QR disponible.", e);
      decodeurPret = null;   // le réseau reviendra peut-être
      return null;
    }
  })();
  return decodeurPret;
}

/** Une image — vidéo, photo — posée sur une toile à la largeur voulue. */
function surToile(source, largeur, hauteur, max){
  const k = Math.min(1, max / Math.max(largeur, 1));
  const t = document.createElement("canvas");
  t.width = Math.max(1, Math.round(largeur * k));
  t.height = Math.max(1, Math.round(hauteur * k));
  const ctx = t.getContext("2d", { willReadFrequently: true });
  if (ctx) ctx.drawImage(source, 0, 0, t.width, t.height);
  return t;
}

/* ------------------------------------------------------------
   Ce que dit le code lu
   ------------------------------------------------------------ */
/**
 * Le fragment de parcours que porte le texte lu, ou la raison de le refuser.
 *
 * Un lecteur de codes lit tout ce qu'on lui montre : le code du wifi du hall,
 * celui d'une plaquette, celui du plan d'un autre salon. Seul le lien d'un
 * parcours de ce salon se propose. Le salon se reconnaît à son paramètre
 * `plan`, que le partage écrit toujours quand il le connaît
 * (`partage.mjs` `lienParcours`) ; l'adresse elle-même ne compte pas — la
 * production, une prévisualisation et le plan embarqué d'une application
 * servent les mêmes identifiants.
 *
 * Un texte qui n'est que le fragment (« parcours=2&s=… ») se prend aussi : il
 * se tape à la main aussi bien qu'il s'imprime.
 * @param {string} texte
 * @returns {{ fragment: string } | { refus: string }}
 */
export function fragmentDuCode(texte){
  const t = String(texte || "").trim();
  if (t.indexOf(CLE_LIEN_PARCOURS) === 0)
    return litCodeParcours(t) ? { fragment: t } : { refus: "illisible" };
  let u;
  try { u = new URL(t); } catch (e) { return { refus: "etranger" }; }
  const fragment = u.hash.replace(/^#/, "");
  if (fragment.indexOf(CLE_LIEN_PARCOURS) !== 0) return { refus: "etranger" };
  if (!litCodeParcours(fragment)) return { refus: "illisible" };
  const plan = u.searchParams.get("plan");
  if (plan && SLUG && plan !== SLUG) return { refus: "autreSalon" };
  return { fragment };
}

const REFUS = {
  etranger: "Ce code n'est pas celui d'un parcours de visite.",
  illisible: "Ce code de parcours ne se lit pas : il a peut-être été coupé.",
  autreSalon: "Ce parcours vient du plan d'un autre salon.",
};

/* ------------------------------------------------------------
   La fenêtre
   ------------------------------------------------------------ */
export function ouvreScanParcours(){
  /** @type {MediaStream | null} */
  let flux = null;
  let minuterie = 0;
  let fini = false;
  /* Le dernier texte refusé : le même code tenu devant la caméra se relit
     cinq fois par seconde, et le message n'a pas à clignoter. */
  let dernierRefus = "";

  /** La caméra rendue, sans fermer la visée : la photo reste un recours. */
  const rendCamera = () => {
    if (flux) flux.getTracks().forEach(p => p.stop());
    flux = null;
  };
  const arrete = () => {
    fini = true;
    clearTimeout(minuterie);
    rendCamera();
  };

  /** @type {HTMLParagraphElement} */
  let etat;
  const dit = (texte, erreur) => {
    if (!etat) return;
    etat.textContent = texte;
    etat.classList.toggle("erreur", !!erreur);
  };

  /** Un texte lu : proposé s'il est un parcours, dit sinon. Rend `true` quand
   *  la fenêtre a passé la main. */
  const recoit = (texte) => {
    const r = fragmentDuCode(texte);
    if ("refus" in r){
      if (texte !== dernierRefus){ dernierRefus = texte; dit(REFUS[r.refus], true); }
      return false;
    }
    arrete();
    /* La fenêtre du parcours reçu prend la place de celle-ci : elle a déjà
       éteint la caméra en partant (`poseAvantFermeture`). */
    if (!proposeParcoursRecu(r.fragment)){
      dit("Le parcours de visite n'est pas proposé sur ce plan.", true);
    }
    return true;
  };

  ouvreModale("Scanner un parcours", corps => {
    const p = document.createElement("p");
    p.textContent = "Visez le code QR d'un parcours partagé : il s'ouvrira ici, " +
      "sans quitter le plan.";
    corps.appendChild(p);

    const viseur = document.createElement("div");
    viseur.className = "scanViseur";
    viseur.hidden = true;
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");   // Safari d'avant iOS 15 ne lit que l'attribut
    viseur.appendChild(video);
    corps.appendChild(viseur);

    etat = document.createElement("p");
    etat.className = "scanEtat";
    etat.setAttribute("role", "status");
    corps.appendChild(etat);

    /* La photo, toujours offerte : c'est la porte qui reste quand la caméra
       est refusée, et celle d'un code trop petit pour la visée en direct. */
    const photo = document.createElement("label");
    photo.className = "scanPhoto";
    photo.innerHTML = '<input type="file" accept="image/*" capture="environment">' +
      '<span class="btn"></span>';
    photo.querySelector("span").textContent = "Prendre le code en photo";
    const champ = /** @type {HTMLInputElement} */ (photo.querySelector("input"));
    champ.onchange = () => {
      const f = champ.files && champ.files[0];
      champ.value = "";
      if (f) litPhoto(f);
    };
    corps.appendChild(photo);

    demarreCamera(video, viseur);
  }, [{ libelle: "Fermer" }], "scan");
  poseAvantFermeture(arrete);

  async function demarreCamera(video, viseur){
    const md = navigator.mediaDevices;
    if (!md || typeof md.getUserMedia !== "function"){
      dit("La caméra n'est pas accessible ici : prenez le code en photo.");
      return;
    }
    dit("Ouverture de la caméra…");
    try {
      const f = await md.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      /* La fenêtre a pu se fermer pendant que le système demandait la
         permission : on rend aussitôt la caméra qu'il vient d'accorder. */
      if (fini){ f.getTracks().forEach(p => p.stop()); return; }
      flux = f;
      video.srcObject = f;
      viseur.hidden = false;
      await video.play();
    } catch (e) {
      /* Refus du visiteur, refus de l'application qui embarque la page, pas
         de caméra du tout : pour le visiteur, la suite est la même. Une
         caméra accordée dont la vidéo n'a pas démarré se rend aussi. */
      rendCamera();
      viseur.hidden = true;
      dit("La caméra n'est pas accessible ici : prenez le code en photo.");
      return;
    }
    const lit = await decodeur();
    if (fini) return;
    // sans décodeur, la caméra ne lirait rien : elle se rend, la photo reste possible
    if (!lit){ rendCamera(); dit("La lecture des codes n'a pas pu se charger. Vérifiez la connexion.", true); return; }
    dit("Cherche un code…");
    const tour = async () => {
      if (fini) return;
      if (video.readyState >= 2 && video.videoWidth){
        try {
          const texte = await lit(surToile(video, video.videoWidth, video.videoHeight, LARGEUR_VIDEO), true);
          if (fini) return;
          if (texte && recoit(texte)) return;
        } catch (e) { /* une image ratée n'arrête pas la visée */ }
      }
      minuterie = setTimeout(tour, ECART_LECTURE);
    };
    tour();
  }

  async function litPhoto(fichier){
    dit("Lecture de la photo…");
    const lit = await decodeur();
    if (fini) return;
    if (!lit){ dit("La lecture des codes n'a pas pu se charger. Vérifiez la connexion.", true); return; }
    const adresse = URL.createObjectURL(fichier);
    try {
      const img = new Image();
      img.src = adresse;
      await img.decode();
      const texte = await lit(surToile(img, img.naturalWidth, img.naturalHeight, LARGEUR_PHOTO), false);
      if (fini) return;
      dernierRefus = "";
      if (!texte) dit("Aucun code QR sur cette photo. Cadrez-le de plus près.", true);
      else recoit(texte);
    } catch (e) {
      dit("Cette photo ne s'ouvre pas.", true);
    } finally {
      URL.revokeObjectURL(adresse);
    }
  }
}

/* ------------------------------------------------------------
   Le branchement
   ------------------------------------------------------------ */
/**
 * Appelé par `lancement.mjs` `lancePlan`, après le partage. Le bouton s'efface
 * sur une borne — l'écran du hall n'a pas de liste à recevoir — et sur un
 * ordinateur : on n'y vise pas un téléphone avec sa webcam, et le lien d'un
 * parcours s'y colle dans la barre d'adresse. Le lecteur sert au téléphone
 * qui en regarde un autre, d'abord dans une application qui embarque le plan.
 */
export function brancheScanParcours(){
  const b = $("btnScanParcours");
  if (!b) return;
  if (BORNE || !auDoigt()){ b.remove(); return; }
  b.onclick = ouvreScanParcours;
}
