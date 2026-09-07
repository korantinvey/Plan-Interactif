/**
 * Correspondance entre les champs d'origine et ce qu'une fiche détail montre.
 *
 * Les noms de champs ne se répètent pas d'un salon à l'autre. Klipso les
 * préfixe « x_ » quand ils sont propres au dossier — c'est le cas de tous ceux
 * qui nous intéressent — et Eventmaker les laisse à la main de l'organisateur.
 * Ce module tient les cibles de la fiche, le champ par défaut de chacune, et
 * la lecture d'une valeur d'après le réglage de l'exploitant.
 *
 * Une cible non réglée garde son défaut : celui qui était écrit dans la
 * synchronisation avant que ce réglage existe. Un salon déjà configuré ne
 * change donc pas de comportement, et une cible ajoutée plus tard ne casse
 * rien.
 */

/** Une cible de la fiche : ce qu'on veut afficher, quelle qu'en soit l'origine. */
export interface Cible {
  cle: string;
  libelle: string;
  aide?: string;
  /** Plusieurs champs d'origine se cumulent au lieu de se relayer. */
  multiple?: boolean;
}

/* Les deux premières ne s'affichent pas : elles rattachent la fiche au plan.
   Mal réglées, aucune fiche ne trouve son emplacement — c'est le premier
   endroit où regarder quand un salon revient sans exposants. */
const RATTACHEMENT: Cible[] = [
  { cle: "stand", libelle: "Numéro de stand",
    aide: "Sert à poser la fiche sur le plan. Comparé au numéro Klipso, mise en forme ignorée." },
  { cle: "dossier", libelle: "Identifiant de dossier",
    aide: "Le dossier Klipso recopié sur la fiche. C'est le rattachement le plus sûr." },
];

const AFFICHAGE: Cible[] = [
  { cle: "nom", libelle: "Enseigne", aide: "Le titre de la fiche." },
  { cle: "raison", libelle: "Raison sociale",
    aide: "Affichée seulement si elle diffère de l'enseigne." },
  { cle: "site", libelle: "Site web" },
  { cle: "adresse", libelle: "Adresse" },
  { cle: "codePostal", libelle: "Code postal",
    aide: "Rejoint l'adresse sur la même ligne, comme sur une enveloppe." },
  { cle: "ville", libelle: "Ville" },
  { cle: "pays", libelle: "Pays" },
  { cle: "telephone", libelle: "Téléphone" },
  { cle: "facebook", libelle: "Facebook" },
  { cle: "linkedin", libelle: "LinkedIn" },
  { cle: "instagram", libelle: "Instagram" },
  { cle: "nomenclature", libelle: "Nomenclature", multiple: true,
    aide: "Les rubriques du catalogue. Plusieurs champs se cumulent." },
  { cle: "nouveau", libelle: "Nouvel exposant",
    aide: "Pose une pastille sur la fiche. Valent oui : oui, o, 1, x, vrai, " +
      "true, on. Toute autre valeur ne pose rien." },
  { cle: "exclu", libelle: "Exclu de la liste",
    aide: "Retire l'exposant du plan public, quel que soit le reste. Valent " +
      "oui : oui, o, 1, x, vrai, true, on." },
];

/**
 * Les cibles offertes par fournisseur.
 *
 * Klipso n'a ni numéro de stand ni dossier à régler : le premier se compose de
 * l'allée et du numéro portés par l'emplacement, le second est une clé
 * étrangère du modèle. Ni l'un ni l'autre n'est un champ personnalisé.
 */
export const CIBLES: Record<string, Cible[]> = {
  klipso: AFFICHAGE,
  eventmaker: [...RATTACHEMENT, ...AFFICHAGE],
};

/**
 * Le champ d'origine retenu par défaut pour chaque cible.
 *
 * Une liste vaut « le premier renseigné », sauf pour une cible multiple où
 * elles se cumulent. Une liste vide signifie que le fournisseur n'expose rien
 * pour cette cible : à l'exploitant de désigner un champ s'il en a un.
 *
 * Côté Klipso, un nom nu désigne une propriété du dossier exposant ; le
 * préfixe « stand: » désigne une propriété de l'emplacement. Côté Eventmaker,
 * un nom nu désigne un champ personnalisé de la fiche ; le préfixe
 * « invite: » désigne un champ natif de l'invité.
 */
export const DEFAUTS: Record<string, Record<string, string[]>> = {
  klipso: {
    nom: ["x_Catalogue_RaisonSociale"],
    raison: ["stand:NomSurPlan"],
    site: ["x_Catalogue_SiteWeb"],
    nomenclature: ["x_Nomenclature"],
    exclu: ["x_ExcluListeexposants"],
  },
  eventmaker: {
    stand: ["num_stand"],
    dossier: ["id_dossier"],
    nom: ["enseigne", "invite:company_name"],
    raison: ["company_name_2"],
    site: ["company_website"],
    adresse: ["invite:address", "address_2"],
    codePostal: ["invite:postal_code"],
    ville: ["locality", "invite:city"],
    pays: ["invite:country_name"],
    telephone: ["company_phone", "invite:phone_number"],
    facebook: ["company_facebook"],
    linkedin: ["company_linkedin"],
    instagram: ["instagram_societe"],
    nomenclature: ["rubriques2", "rubriques"],
    exclu: ["exclu_liste_exposant"],
  },
};

/**
 * Les champs d'origine à lire pour une cible.
 *
 * Le réglage de l'exploitant remplace le défaut, il ne s'y ajoute pas : sans
 * quoi un champ écarté volontairement reviendrait par la porte de derrière.
 * Une chaîne vide vaut « ne rien lire », ce qui est un réglage à part entière.
 */
export function champs(
  correspondances: unknown,
  fournisseur: string,
  cible: string,
): string[] {
  const bloc = (correspondances as Record<string, any>)?.[fournisseur]?.champs;
  const regle = bloc?.[cible];
  if (regle === undefined || regle === null) return DEFAUTS[fournisseur]?.[cible] ?? [];
  return ([] as unknown[]).concat(regle).map((v) => String(v ?? "").trim()).filter(Boolean);
}

/** Sépare le préfixe d'origine du nom du champ : « stand:NomSurPlan ». */
export function decoupe(champ: string): { origine: string; nom: string } {
  const i = champ.indexOf(":");
  return i < 0
    ? { origine: "", nom: champ }
    : { origine: champ.slice(0, i), nom: champ.slice(i + 1) };
}

/* Ce qui vaut « oui » dans un champ oui/non. Ces champs sont remplis à la main
   et rien n'impose leur forme : Klipso rend un vrai booléen, Eventmaker une
   chaîne, l'organisateur y met ce qu'il veut.

   L'accord s'énumère, pas le refus. Prendre pour un oui tout ce qui n'est pas
   un non reconnu paraissait plus sûr — c'est l'inverse : un champ qui porte une
   date, un code, un « à confirmer » ou n'importe quoi d'inattendu devient alors
   un oui, et la fiche affirme quelque chose de faux. Une valeur qu'on ne sait
   pas lire ne doit rien déclencher. */
const ACCORDS = new Set([
  "true", "1", "oui", "o", "yes", "y", "vrai", "x", "on", "✓", "✔",
]);

/**
 * Un champ oui/non est-il vrai ?
 *
 * Un champ absent, vide, ou rempli d'une valeur qu'on ne reconnaît pas est
 * faux : c'est l'état de la grande majorité des fiches, et il ne doit rien
 * déclencher.
 */
export const vrai = (v: unknown): boolean =>
  v === true || (typeof v !== "object" && v !== undefined &&
    ACCORDS.has(String(v).trim().toLowerCase()));

/** Rien plutôt qu'une chaîne vide : le rendu masque les champs absents. */
export const ou = (...v: unknown[]): string | null => {
  for (const x of v) {
    const s = String(x ?? "").trim();
    if (s) return s;
  }
  return null;
};

/**
 * Lit une cible dans un jeu de sources, chacune désignée par son préfixe.
 *
 * Le premier champ renseigné l'emporte ; une cible multiple les cumule, en
 * aplatissant les valeurs qui sont déjà des listes — Klipso rend une
 * nomenclature à plusieurs entrées comme un tableau.
 */
export function lit(
  liste: string[],
  sources: Record<string, Record<string, unknown> | undefined>,
  multiple = false,
): unknown {
  const valeurs: unknown[] = [];
  for (const c of liste) {
    const { origine, nom } = decoupe(c);
    const v = sources[origine]?.[nom];
    if (v === undefined || v === null || v === "") continue;
    if (!multiple) return v;
    valeurs.push(...([] as unknown[]).concat(v));
  }
  return multiple ? valeurs : null;
}
