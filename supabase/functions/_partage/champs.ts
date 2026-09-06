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
  { cle: "exclu", libelle: "Exclu de la liste",
    aide: "Vrai retire l'exposant du plan public, quel que soit le reste." },
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
