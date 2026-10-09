/* ============================================================
   Provenance des données d'un salon — domaines, fournisseurs, réglage

   Chaque domaine — le plan, les exposants, les conférences, les produits —
   vient d'un fournisseur, que le salon choisit. Ce module tient la liste des
   domaines et des fournisseurs, ce qui se lit du choix d'un salon (`source`,
   `sourceNom`, `fournisseurUtilise`), le résumé de la fiche et la fenêtre qui
   le règle (`ouvreProvenance`). La fiche du salon, la fiche détail et la
   synchronisation l'importent.

   La fenêtre du socle, sa grille et la barre d'état viennent du socle de la
   console (`fenetre-console.mjs`, `socle-console.mjs`). Le salon ouvert et
   son écriture viennent de `evenements.mjs`.
   ============================================================ */
import { courant, majEvenement } from "./evenements.mjs";
import { ouvreModale } from "./fenetre-console.mjs";
import { grille, signale } from "./socle-console.mjs";

/* ============================================================
   Provenance des données
   Un domaine, un fournisseur. La liste des fournisseurs diffère par domaine :
   la géométrie du plan ne vient que de Klipso, le reste pourra venir
   d'ailleurs. La clé d'identification reste celle de l'événement.
   ============================================================ */
/* Par domaine : sa clé, son nom, les sources qui savent le servir, ce qu'il porte. */
/** @type {[string, string, string[], string][]} */
export const DOMAINES = [
  ["plan",        "Plan",        ["klipso"],
   "La géométrie des pavillons et des calques."],
  ["stands",      "Exposants",   ["klipso", "eventmaker"],
   "Les sociétés rattachées aux emplacements. La géométrie et les zones restent au plan."],
  ["conferences", "Conférences", ["aucun", "klipso", "eventmaker"],
   "Le programme du salon. Eventmaker le rend, et dit qui tient quoi ; Klipso ne le reprend pas encore."],
  ["produits",    "Produits",    ["aucun", "klipso", "eventmaker"],
   "Le catalogue que chaque exposant présente, montré sur sa fiche. Eventmaker le rend ; Klipso ne le reprend pas encore."],
];
export const FOURNISSEURS = {
  aucun: "Non synchronisé", klipso: "Klipso", eventmaker: "Eventmaker",
};

/* Un domaine que rien ne reprend vaut mieux « non synchronisé » qu'un
   fournisseur choisi par défaut : celui-ci laisserait croire à une reprise. */
const DEFAUT_DOMAINE = {
  plan: "klipso", stands: "klipso", conferences: "aucun", produits: "aucun",
};

/* Chaque fournisseur désigne l'événement à sa façon. Klipso n'est pas dans
   cette liste : son identité tient dans « Instance » et « Identifiant
   d'événement », déjà saisis plus haut dans la fiche. */
/**
 * Les réglages de raccordement, fournisseur par fournisseur.
 *
 * C'est cette liste qui décide des onglets de la fenêtre « Sources de
 * données » : brancher un outil de plus revient à y ajouter une entrée, sans
 * toucher au reste.
 *
 * Un champ vit soit dans une colonne de l'événement — c'est le cas de Klipso,
 * dont l'instance et l'identifiant précèdent le modèle multi-fournisseurs —
 * soit dans la colonne « cles », indexée par fournisseur.
 */
export const FOURNISSEURS_CONF = [
  {
    cle: "klipso",
    nom: "Klipso",
    champs: [
      { colonne: "instance", libelle: "Instance", aide: "Le sous-domaine Klipso." },
      { colonne: "event_id", libelle: "Identifiant d'événement",
        aide: "Le GUID transmis dans l'en-tête X-GAIA-EventId." },
    ],
  },
  {
    cle: "eventmaker",
    nom: "Eventmaker",
    champs: [
      { dansCles: "eventmaker", libelle: "Identifiant de l'événement",
        aide: "Vingt-quatre caractères, visibles dans l'adresse de l'événement sur app.eventmaker.io.",
        forme: /^[0-9a-f]{24}$/i, exemple: "69ef6fb4406b394eda9b8a3e" },
    ],
  },
];

/** Un fournisseur est-il retenu quelque part ? */
export const fournisseurUtilise = (e, cle) =>
  DOMAINES.some(([d]) => ((e.sources || {})[d] || {}).fournisseur === cle) ||
  sourceNom(e) === cle;

/* Les fournisseurs chez qui le nom des stands peut se lire : ceux qui portent
   des fiches d'exposant. */
export const SOURCES_NOM = ["klipso", "eventmaker"];

/** D'où vient le nom posé sur le stand et dans la liste — par défaut, de la
 *  même source que les exposants : c'était la seule règle avant ce choix. */
export const sourceNom = (e) =>
  ((e.sources || {}).nom || {}).fournisseur || source(e, "stands");

/** Le fournisseur retenu pour un domaine, défaut compris. */
export const source = (e, dom) =>
  ((e.sources || {})[dom] || {}).fournisseur || DEFAUT_DOMAINE[dom] || "klipso";

/** Une ligne de provenance, enregistrée à chaque modification. */
function ligneSource(dom, libelle, offerts, aide) {
  const e = courant();
  const src = (e.sources && e.sources[dom]) || {};
  const choisi = src.fournisseur || DEFAUT_DOMAINE[dom] || "klipso";
  const l = document.createElement("label");
  l.innerHTML = '<span></span><select>' +
    offerts.map((k) => '<option value="' + k + '"' +
      (choisi === k ? " selected" : "") + '>' +
      FOURNISSEURS[k] + '</option>').join("") +
    '</select><span class="aide"></span>';
  l.querySelector("span").textContent = libelle;
  l.querySelector(".aide").textContent = aide;
  l.querySelector("select").onchange = async (ev) => {
    e.sources = { ...(e.sources || {}) };
    e.sources[dom] = { fournisseur: ev.target.value };
    try { await majEvenement(e.id, { sources: e.sources }); }
    catch (err) { signale(err.message, true); }
  };
  return l;
}


/** Ce qu'on lit sans ouvrir : les exceptions, pas la liste complète. */
export function resumeProvenance(e) {
  const s = e.sources || {};
  const autres = DOMAINES
    .filter(([d]) => ((s[d] || {}).fournisseur || DEFAUT_DOMAINE[d] || "klipso") !==
      (DEFAUT_DOMAINE[d] || "klipso"))
    .map(([d, lib]) => lib + " : " +
      (FOURNISSEURS[s[d].fournisseur] || s[d].fournisseur));
  // le nom se règle dans la fiche, mais c'est une provenance comme une autre
  if (sourceNom(e) !== source(e, "stands")) {
    autres.push("Nom des stands : " + (FOURNISSEURS[sourceNom(e)] || sourceNom(e)));
  }
  // une source retenue sans son identifiant ne peut rien lire : le dire ici
  // plutôt que d'attendre l'échec de la synchronisation
  const manque = FOURNISSEURS_CONF
    .filter((f) => fournisseurUtilise(e, f.cle) && f.champs.some((c) =>
      c.dansCles ? !(e.cles || {})[c.dansCles] : !e[c.colonne]))
    .map((f) => f.nom);
  if (manque.length) autres.push("raccordement " + manque.join(", ") + " incomplet");
  return autres.length ? autres.join(" · ") : "Klipso pour tout";
}

export function ouvreProvenance(apres) {
  ouvreModale("Provenance des données", (corps) => {
    const e = courant();
    const g = grille();
    DOMAINES.forEach(([dom, lib, offerts, aide]) => {
      const l = ligneSource(dom, lib, offerts, aide);
      if (source(e, dom) === "aucun") l.classList.add("source-inerte");
      g.appendChild(l);
    });
    corps.appendChild(g);
    const note = document.createElement("p");
    note.className = "aide";
    note.textContent = "Les identifiants d'événement se saisissent dans " +
      "« Sources de données », au menu Actions de la fiche.";
    corps.appendChild(note);
  }, [{ libelle: "Terminé", genre: "primaire" }], apres);
}
