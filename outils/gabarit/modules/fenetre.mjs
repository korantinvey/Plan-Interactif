/* ============================================================
   La fenêtre commune : par-dessus le plan, pour confirmer, régler, lire
   ============================================================ */
import { $ } from "./dom.mjs";

/* L'habillage du modèle retenu, que le code soudé tient (`habilleModale`) :
   il le confie au branchement. Sans lui, la fenêtre reste nue. */
let _habille = () => {};

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
  _habille();
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
 * Le branchement de la fenêtre, appelé par le script soudé à la place que ce
 * module y tenait (`_modales.html`) : la croix, le voile et « Échap » s'y
 * posent au même rang qu'avant parmi les écouteurs du plan — « Échap » ferme
 * aussi la fiche et les tiroirs, et l'ordre décide de qui l'entend d'abord.
 */
export function brancheFenetre({ habille }){
  _habille = habille;
  $("mFermer").onclick = fermeModale;
  $("modale").addEventListener("click", e => { if (e.target === $("modale")) fermeModale(); });
  addEventListener("keydown", e => {
    if (e.key === "Escape" && $("modale").classList.contains("open")) fermeModale();
  });
}
