/* ============================================================
   Le générique du démarrage, réglé par l'exploitant

   Un module de l'administration : `plan-admin.mjs` l'embarque, le visiteur ne
   le reçoit jamais. Le générique lui-même — ce que le visiteur voit — est dans
   `sponsor.mjs`.
   ============================================================ */
import { fermeModale } from "./fenetre.mjs";
import { MENTIONS_SPONSOR, MARQUE_SPONSOR, SPONSOR_MIN, SPONSOR_MAX, reglageSponsor,
  secondesSponsor, modeSponsor, sponsorRetenu, ouvreSponsor, fermeSponsor } from "./sponsor.mjs";
import { champZone, cadreLogo } from "./fiche-zone.mjs";
import { enregistreConf } from "./configuration.mjs";

/* Ce que la fenêtre des réglages (`reglages.mjs`), qui importe ce module et
   ne peut donc s'importer d'ici, lui confie en se chargeant : son
   glissement. Le champ intitulé, le cadre de dépôt d'un logo et
   l'enregistrement de la configuration s'importent. */
/**
 * @typedef {object} PreteReglageSponsor
 * @property {typeof import("./reglages.mjs").glisseFenetre} glisseFenetre
 */
/** @type {PreteReglageSponsor} */
const prete = { glisseFenetre: (change) => change() };
const glisseFenetre = (/** @type {() => void} */ change) => prete.glisseFenetre(change);

/** La porte par laquelle la fenêtre des réglages confie son glissement.
 *  @param {Partial<PreteReglageSponsor>} o */
export function confieAuReglageSponsor(o){ Object.assign(prete, o); }

/* ------------------------------------------------------------
   Le générique dans l'onglet « Admin » des réglages
   ------------------------------------------------------------ */
/* Ce que chaque mode propose, dans l'ordre du volet. Le résumé tient en une
   ligne : c'est un choix qu'on fait une fois, et trois paragraphes à comparer
   le rendraient plus difficile qu'il n'est. */
const CHOIX_SPONSOR = [
  { mode: "",
    titre: "Aucun logo",
    resume: "Le plan s'ouvre droit sur le hall." },
  { mode: "marque",
    titre: "Le logo Event2Map",
    resume: "Avec la mention « powered by ». Rien à déposer, rien à régler." },
  { mode: "sponsor",
    titre: "Le logo d'un sponsor",
    resume: "Celui d'un partenaire du salon, avec son nom et son lien." },
];

/**
 * Où l'on choisit ce qui paraît au démarrage, et où on le regarde avant de le
 * vendre.
 *
 * Dans l'onglet « Admin », donc réservé au profil administrateur, comme les
 * cases qui l'entourent. Ce n'est pas un réglage de salon mais un réglage de
 * prestataire : la place du démarrage est celle qu'on vend, ou celle où l'on
 * dit d'où vient le plan, et l'organisateur qui l'ouvrirait n'y trouverait que
 * de quoi retirer la marque de qui le lui fournit.
 *
 * Trois boutons plutôt que trois cases : les modes s'excluent, et une case
 * cochée à côté d'une autre aurait posé la question de ce qui l'emporte. Les
 * champs du sponsor ne paraissent qu'une fois son mode retenu — quatre champs
 * sous un choix qui ne les concerne pas ne se règlent pour rien.
 *
 * L'aperçu est là parce que l'administration ne montre jamais le générique
 * d'elle-même : sans lui, on vendrait un écran qu'on n'a jamais vu.
 */
export function blocSponsor(hote){
  const r = reglageSponsor();

  /* Un intertitre, parce que le bloc arrive après une liste de cases : sans
     lui, le premier des trois boutons se lirait comme une case de plus. */
  const tete = document.createElement("div");
  tete.className = "titreReg";
  tete.innerHTML = '<span class="eyebrow"></span><span class="d"></span>';
  tete.querySelector(".eyebrow").textContent = "Au démarrage";
  tete.querySelector(".d").textContent = "Ce que le visiteur voit le temps que " +
    "le plan s'affiche, puis qui s'efface de lui-même. C'est le seul écran que " +
    "tous les visiteurs traversent — chaque visite comptée dans le rapport " +
    "d'utilisation le voit — et il ne retarde personne : l'attente qu'il occupe " +
    "avait lieu de toute façon.";
  hote.appendChild(tete);

  /* Le corps des réglages du sponsor, et celui de la durée : déclarés ici, ils
     sont garnis plus bas et montrés par le choix, qui est posé avant eux. */
  const corps = document.createElement("div");
  corps.className = "voletSpons";
  const duree = document.createElement("div");
  duree.className = "reglage-nb";
  let majEssai = () => {};

  const choix = document.createElement("div");
  choix.className = "choixDem";
  hote.appendChild(choix);

  const boutons = CHOIX_SPONSOR.map(c => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "dem";
    b.innerHTML = '<span class="v"></span><span class="x">' +
      '<span class="t"></span><span class="d"></span></span>' +
      '<span class="coche">✓</span>';
    b.querySelector(".t").textContent = c.titre;
    b.querySelector(".d").textContent = c.resume;
    /* La marque se montre dans son propre bouton : c'est elle qu'on choisit, et
       personne ne sait de mémoire à quoi elle ressemble. Les deux autres n'ont
       rien à montrer — l'un ne montre rien, l'autre montre ce qu'on n'a pas
       encore déposé. */
    if (c.mode === "marque") b.querySelector(".v").innerHTML = MARQUE_SPONSOR;
    else b.querySelector(".v").remove();
    b.onclick = () => pose(c.mode);
    choix.appendChild(b);
    return { b: b, c: c };
  });

  hote.appendChild(corps);

  const suit = () => {
    const mode = modeSponsor(r);
    boutons.forEach(({ b, c }) => b.setAttribute("aria-pressed", String(c.mode === mode)));
    corps.hidden = mode !== "sponsor";
    // la durée vaut pour l'un comme pour l'autre : c'est le même générique
    duree.hidden = !mode;
    actes.hidden = !mode;
    majEssai();
  };
  const pose = (mode) => {
    if (modeSponsor(r) === mode) return;
    r.mode = mode;
    /* Ce que la case d'avant écrivait ne doit plus rien décider : laissé là, il
       contredirait le choix pour qui relit l'enregistrement. */
    delete r.actif;
    enregistreConf();
    glisseFenetre(suit);
    // le générique posé depuis le cache, ou l'aperçu qu'on vient d'ouvrir
    if (mode !== "sponsor") fermeSponsor();
  };

  /* Le logo s'enregistre au choix, et non à la sortie de la fenêtre comme celui
     d'une zone : un volet de réglages n'a pas de bouton « Enregistrer », chaque
     retouche y part d'elle-même. */
  const logo = cadreLogo(r.logo, src => {
    r.logo = src;
    enregistreConf();
    majEssai();
  });
  champZone(corps, "Logo", logo.cadre,
    "Réduite puis enregistrée avec la configuration du plan : elle part avec " +
    "lui, sans dépendre d'un fichier hébergé ailleurs. Glissez-la sur la " +
    "vignette, ou choisissez-la. Elle se pose sur le fond du plan — le gris " +
    "clair d'origine, ou la couleur réglée dans « Apparence » : un logo " +
    "dessiné en blanc sur fond transparent y disparaîtra.");

  const nom = champZone(corps, "Nom du sponsor", document.createElement("input"),
    "Écrit sous le logo. Laissez vide si le logo porte déjà le nom.");
  nom.value = String(r.nom || "");
  nom.oninput = () => { r.nom = nom.value.trim().slice(0, 80); enregistreConf(); };

  const mention = champZone(corps, "Mention au-dessus du logo",
    document.createElement("select"),
    "Choisie dans cette liste, et non écrite : le plan se lit aussi en " +
    "anglais, et une phrase tapée ici n'y serait pas traduite.");
  const vide = document.createElement("option");
  vide.value = "";
  vide.textContent = "Aucune";
  mention.appendChild(vide);
  MENTIONS_SPONSOR.forEach(m => {
    const o = document.createElement("option");
    o.value = m;
    o.textContent = m;
    mention.appendChild(o);
  });
  mention.value = MENTIONS_SPONSOR.indexOf(r.mention) >= 0 ? r.mention : "";
  mention.onchange = () => { r.mention = mention.value; enregistreConf(); };

  const lien = champZone(corps, "Lien", document.createElement("input"),
    "Ouvert dans un nouvel onglet quand le visiteur touche le logo. Laissez " +
    "vide pour que le générique ne mène nulle part.");
  lien.type = "url";
  lien.placeholder = "https://";
  lien.value = String(r.lien || "");
  lien.oninput = () => { r.lien = lien.value.trim(); enregistreConf(); };

  duree.innerHTML = '<label><span class="l"></span>' +
    '<input type="number" min="' + SPONSOR_MIN + '" max="' + SPONSOR_MAX + '" step="1">' +
    '<span class="u">s</span></label><span class="aide"></span>';
  duree.querySelector(".l").textContent = "Durée du générique";
  duree.querySelector(".aide").textContent =
    "Comptée depuis l'ouverture de la page, et non depuis que le logo " +
    "paraît : le chargement est compris dedans. Le logo s'efface dès que le " +
    "plan est là et que ces secondes sont passées. Sur le plan public et sur " +
    "la borne, jamais dans l'administration ; un doigt posé dessus l'efface " +
    "aussitôt, et une panne de chargement aussi.";
  const n = duree.querySelector("input");
  n.value = secondesSponsor(r);
  /* Un champ vidé le temps de retaper ne doit rien écrire : on ne retient que
     ce qui tient dans les bornes, et le champ se remet d'aplomb à la sortie. */
  n.oninput = () => {
    const v = Math.round(+n.value);
    if (v >= SPONSOR_MIN && v <= SPONSOR_MAX){ r.secondes = v; enregistreConf(); }
  };
  n.onblur = () => { n.value = secondesSponsor(r); };
  hote.appendChild(duree);

  /* L'aperçu ferme la fenêtre pour se montrer : le générique se joue sur le
     plan, et une fenêtre posée devant cacherait ce qu'on est venu voir. Sans
     logo il n'y a rien à jouer — le bouton le dit en restant éteint plutôt
     qu'en ouvrant un écran vide. */
  const actes = document.createElement("div");
  actes.className = "sponsActs";
  const essai = document.createElement("button");
  essai.type = "button";
  essai.textContent = "Aperçu";
  essai.onclick = () => {
    const s = sponsorRetenu(r);
    if (!s) return;
    fermeModale();
    ouvreSponsor(s, true);
  };
  actes.appendChild(essai);
  hote.appendChild(actes);
  majEssai = () => { essai.disabled = !sponsorRetenu(r); };

  suit();
}
