/* ============================================================
   La fenêtre commune : par-dessus le plan, pour confirmer, régler, lire
   ============================================================ */
import { $ } from "./dom.mjs";
import { creeEvenement } from "./evenement.mjs";
/* L'habillage du modèle retenu (`habilleModale`), que la fenêtre reprend à
   chaque ouverture. */
import { habilleModale } from "./modeles.mjs";

/* Ce qu'une fenêtre laisse en train de se faire.
 *
 * Une saisie qui n'a pas de bouton d'enregistrement — on ne « valide » pas une
 * fiche qu'on est en train d'écrire, on la quitte — doit partir avec la fenêtre
 * quelle que soit la porte : la croix, le pied, le voile, « Échap », ou une
 * autre fenêtre qui prend la place. Toutes passent par ici ; le crochet est
 * posé par qui remplit la fenêtre, et ne joue qu'une fois. */
let avantFermeture = null;
/** Le crochet de sortie de la fenêtre en cours, posé par qui la remplit. */
export const poseAvantFermeture = (f) => { avantFermeture = f; };

/* Le retour aux réglages après un aperçu. Deux réglages en ouvrent un — la
   fenêtre qui invite à installer, celle qui propose les rappels —, que le
   visiteur reçoit aussi (`installation.mjs`, `rappels.mjs`) ; mais seule
   l'administration connaît la fenêtre des réglages (`reglages.mjs`), qu'un
   module public ne peut importer : la sortie d'un aperçu s'annonce, avec la
   case qui l'a ouvert, et les réglages l'écoutent. Chez le visiteur, aucun
   aperçu ne s'ouvre, et personne n'écoute. */
/** @type {import("./evenement.mjs").Evenement<[string]>} */
export const APERCU_QUITTE = creeEvenement();

/** Un aperçu a pris la place des réglages : toute sortie y ramène, sur la case
 *  qui l'a ouvert — l'invitation à installer, le rappel des conférences.
 *  @param {string} marque */
export const retourAuxReglages = (marque) => { APERCU_QUITTE.emet(marque); };

function verseModale(){
  const f = avantFermeture;
  avantFermeture = null;
  if (f) f();
}

/* Ce qui attend que la place se libère.
 *
 * Une proposition qui arrive pendant qu'une fenêtre est ouverte ne la remplace
 * pas : on ne retire pas sous les yeux ce qu'on est en train de lire. Elle n'a
 * pas à se perdre pour autant — elle se pose ici, et part quand la fenêtre se
 * ferme. À la fermeture seulement : une fenêtre qui en remplace une autre ne
 * libère rien, et ce qui attendait attend encore. */
let apresFermeture = null;
/** Ce qui attend que la place se libère. */
export const poseApresFermeture = (f) => { apresFermeture = f; };

/* La part du cadre que le visiteur voit.
 *
 * Intégré dans le site d'un salon, le plan vit dans un cadre (`iframe`) plus
 * haut que ce qui en paraît : souvent 80 % de l'écran, posé sous un titre, et
 * dont le bas tombe sous le bord du téléphone. La fenêtre, posée au bas du
 * cadre sur écran étroit, s'y ouvrait à moitié hors de vue — l'invitation à la
 * visite guidée n'en montrait que le titre et deux lignes, sans ses boutons.
 *
 * Le cadre ne sait pas où le site l'a posé, ni lire le défilement d'une page
 * d'une autre origine. Mais un `IntersectionObserver` sans racine mesure,
 * même là, ce qui d'un élément tient dans l'écran de la page qui l'accueille :
 * un témoin collé aux bords du cadre donne donc la bande visible, et la
 * fenêtre s'y range — en bas de ce qu'on voit, et non du cadre. Les seuils, un
 * par centième, la font suivre quand le visiteur fait défiler le site.
 *
 * Trop peu visible pour y tenir — le cadre à peine entré dans l'écran —, elle
 * reprend le cadre entier : la tasser dans un liseré la rendrait illisible
 * aussi, et le visiteur qui descend vers le plan l'y trouvera. Hors d'un cadre,
 * rien de tout cela ne se pose. */
const INTEGRE = (() => { try { return window.top !== window.self; } catch (e) { return true; } })();
let guet = null;
function suisLaPartVisible(){
  if (!INTEGRE || guet || typeof IntersectionObserver !== "function") return;
  const temoin = document.createElement("div");
  temoin.style.cssText = "position:fixed;inset:0;pointer-events:none;opacity:0";
  temoin.setAttribute("aria-hidden", "true");
  document.body.appendChild(temoin);
  const seuils = Array.from({ length: 101 }, (_, i) => i / 100);
  guet = new IntersectionObserver(entrees => {
    const e = entrees[entrees.length - 1];
    const r = e.intersectionRect;
    const m = $("modale");
    if (!e.isIntersecting || r.height < 200) { m.style.top = m.style.bottom = ""; return; }
    m.style.top = Math.max(0, Math.round(r.top)) + "px";
    m.style.bottom = Math.max(0, Math.round(innerHeight - r.bottom)) + "px";
  }, { threshold: seuils });
  guet.observe(temoin);
}

/**
 * Une fenêtre par-dessus le plan.
 *
 * `genre` la range autrement : « cote » la pose à gauche et retire le voile,
 * pour une fenêtre dont on regarde l'effet sur le plan pendant qu'on s'en sert.
 * Sans lui, elle est au milieu, sur fond grisé — ce qu'il faut quand elle
 * demande une réponse avant de rendre la main.
 */
export function ouvreModale(titre, remplitCorps, boutons, genre){
  verseModale();
  if (genre) $("modale").dataset.genre = genre;
  else delete $("modale").dataset.genre;
  /* L'habillage se pose ici plutôt qu'une fois pour toutes : il dépend du
     genre, que chaque fenêtre apporte en s'ouvrant. */
  habilleModale();
  $("mTitre").textContent = titre;
  $("mCorps").innerHTML = "";
  remplitCorps($("mCorps"));
  $("mPied").innerHTML = "";
  boutons.forEach(b => {
    const el = document.createElement("button");
    el.className = "btn" + (b.genre ? " " + b.genre : "");
    el.textContent = b.libelle;
    el.onclick = () => { if (b.action) b.action(); if (b.ferme !== false) fermeModale(); };
    $("mPied").appendChild(el);
  });
  suisLaPartVisible();
  $("modale").classList.add("open");
}
export function fermeModale(){
  verseModale();
  $("modale").classList.remove("open");
  /* Après le retrait, et non avant : ce qui attendait la place ouvre sa propre
     fenêtre, et la trouverait sinon encore occupée. */
  const f = apresFermeture;
  apresFermeture = null;
  if (f) f();
}

export function confirme(titre, message, libelleOui, action){
  ouvreModale(titre, corps => {
    const p = document.createElement("p");
    p.textContent = message;
    corps.appendChild(p);
  }, [
    { libelle: "Annuler" },
    { libelle: libelleOui, genre: "danger", action: action },
  ]);
}

/**
 * Le branchement de la fenêtre, appelé par le lancement (`lancement.mjs`
 * `lancePlan`) au rang que ce code tenait dans le script d'avant : la croix,
 * le voile et « Échap » s'y posent au même rang parmi les écouteurs du plan. « Échap » ferme
 * aussi la fiche et les tiroirs : la fenêtre ouverte le prend avant eux, à la
 * capture, quel que soit ce rang.
 */
export function brancheFenetre(){
  $("mFermer").onclick = fermeModale;
  $("modale").addEventListener("click", e => { if (e.target === $("modale")) fermeModale(); });
  /* La fenêtre est devant tout : « Échap » est à elle, et à elle seule. Les
     autres écoutes de la touche demandaient bien « pas de fenêtre ouverte ? »,
     mais après celle-ci, qui venait de la fermer : la fiche (sur `document`)
     l'entendait avant, le tiroir de la liste, du parcours ou de l'itinéraire
     juste après, et tous partaient avec elle. Prise à la capture, sur la
     fenêtre du navigateur, elle passe la première, et ne va pas plus loin —
     ni aux tiroirs, ni à la visite guidée qui écoute au même rang. */
  addEventListener("keydown", e => {
    if (e.key !== "Escape" || !$("modale").classList.contains("open")) return;
    e.stopImmediatePropagation();
    fermeModale();
  }, true);
}
