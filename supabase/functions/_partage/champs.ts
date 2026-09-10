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
  { cle: "coexposant", libelle: "Rattachement des co-exposants",
    aide: "Le champ où un co-exposant porte le stand de son hôte — le numéro de " +
      "stand, sauf si le salon en tient un à part. « Aucun » retire les " +
      "co-exposants du plan." },
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
 * Les thématiques, propres à Eventmaker.
 *
 * Elles ne sont pas la nomenclature : celle-ci range l'exposant dans le
 * catalogue, celles-là disent ce qu'il vient y faire — « Devenir
 * master-franchisé », « Solutions transverses ». Aucun salon ne les nomme
 * pareil, et beaucoup n'en ont pas du tout.
 *
 * Klipso n'en a pas l'équivalent : ses rubriques passent par la nomenclature
 * et sa codification, et rien d'autre n'y range les exposants. Une cible qu'il
 * ne saurait pas alimenter n'a rien à faire dans sa liste.
 *
 * Elle est la seule cible d'affichage sans champ par défaut, et c'est voulu :
 * aucun nom ne revient d'un salon à l'autre — `categories` ici, `expertises`
 * là. Un défaut deviné signalerait en rouge « champ habituel introuvable » sur
 * tous les salons qui n'en tiennent pas, c'est-à-dire la plupart ; rester vide
 * est ici l'état normal, et c'est à l'exploitant de désigner le sien.
 */
const THEMATIQUES: Cible = {
  cle: "thematiques", libelle: "Thématiques", multiple: true,
  aide: "Ce que l'exposant vient chercher ou proposer, tel que le salon le " +
    "range. Plusieurs champs se cumulent, et un champ à valeurs multiples se " +
    "sépare tout seul.",
};

/**
 * Les cibles offertes par fournisseur.
 *
 * Klipso n'a ni numéro de stand ni dossier à régler : le premier se compose de
 * l'allée et du numéro portés par l'emplacement, le second est une clé
 * étrangère du modèle. Ni l'un ni l'autre n'est un champ personnalisé.
 */
export const CIBLES: Record<string, Cible[]> = {
  klipso: AFFICHAGE,
  eventmaker: [...RATTACHEMENT, ...AFFICHAGE, THEMATIQUES],
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
    /* Un stand n'a qu'un dossier côté Klipso, celui de son titulaire : les
       sociétés qu'il héberge n'ont donc aucun moyen de s'y rattacher par là.
       Ce qu'elles portent, c'est le numéro du stand de leur hôte — c'est le
       même champ que « stand », et c'est bien le défaut. Un salon qui tient
       le stand hôte dans un champ à lui le désigne ici. */
    coexposant: ["num_stand"],
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
    // aucun nom ne revient d'un salon à l'autre : à désigner depuis la console
    thematiques: [],
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

/** Deux valeurs se comparent sans égard à la casse ni aux accents : « Nouveau
 *  Client » et « nouveau client » désignent la même chose. */
const aplani = (v: unknown): string =>
  String(v ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();

/**
 * Un champ déclenche-t-il la cible ?
 *
 * Deux façons de le dire, parce que les sources n'en offrent qu'une chacune :
 *
 *   — sans valeur attendue, le champ est un oui/non et c'est l'accord qui
 *     s'énumère ci-dessus ;
 *   — avec des valeurs attendues, le champ est une liste de choix, et seules
 *     ces valeurs-là déclenchent. Franchise Expo range ainsi ses exposants
 *     entre « Nouveau Client », « Client N-1 » et « Retour » : aucune des
 *     trois n'est un oui, et pourtant l'une désigne bien les nouveaux venus.
 *     Plusieurs peuvent compter à la fois — un salon tiendra « Retour » pour
 *     un retour à signaler, un autre non — d'où une liste et non une valeur.
 *
 * Un champ absent, vide, ou rempli d'une valeur qu'on ne reconnaît pas est
 * faux : c'est l'état de la grande majorité des fiches, et il ne doit rien
 * déclencher.
 */
export const vrai = (v: unknown, attendues?: string[] | null): boolean => {
  if (v === null || v === undefined || typeof v === "object") return false;
  if (attendues && attendues.length) {
    /* Un champ à choix multiple ne porte pas une valeur mais plusieurs, jointes
       dans une seule chaîne par un point-virgule — « Nouveaux exposants;
       Exposants internationaux ». Comparée entière, elle ne reconnaîtrait que
       l'exposant qui n'a qu'une seule catégorie ; la comparaison se fait donc
       valeur par valeur, et des deux côtés — une valeur retenue avant ce
       découpage porte encore la chaîne entière. */
    const portees = separeValeurs(v).map(aplani);
    const veut = separeValeurs(attendues).map(aplani);
    return portees.some((x) => veut.includes(x));
  }
  return v === true || ACCORDS.has(aplani(v));
};

/**
 * Les valeurs qui déclenchent une cible, quand l'exploitant en a désigné.
 *
 * Elles vivent à côté du champ retenu, dans le même bloc : c'est le même
 * réglage en deux temps — quel champ lire, puis, s'il ne répond pas par oui ou
 * non, lesquelles de ses valeurs comptent.
 */
export function valeursOui(
  correspondances: unknown,
  fournisseur: string,
  cible: string,
): string[] {
  const v = (correspondances as Record<string, any>)?.[fournisseur]?.valeurs?.[cible];
  return ([] as unknown[]).concat(v ?? [])
    .map((x) => String(x ?? "").trim()).filter(Boolean);
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

/* ------------------------------------------------------------------
   Champs personnalisés

   Les cibles ci-dessus sont celles que la fiche sait montrer, et elles ne
   bougent pas d'un salon à l'autre. Un salon a pourtant toujours un champ que
   les autres n'ont pas — « Gamme de produits », « Pays d'origine de
   l'enseigne », « Franchise depuis » — dont personne d'autre n'a l'usage.
   Jusqu'ici il fallait l'ajouter au code, donc à tous les salons, pour qu'un
   seul s'en serve.

   Un champ personnalisé vit donc à côté de l'événement qui l'a créé : son
   libellé dans `fiche.perso`, avec les autres décisions d'affichage, et le
   champ d'origine qui l'alimente dans `correspondances`, comme n'importe
   quelle cible. Le préfixe le met hors d'atteinte d'une cible du code : une
   cible nommée « gamme » plus tard ne se confondrait pas avec le champ
   personnalisé d'un salon qui porte déjà ce nom.
   ------------------------------------------------------------------ */

export const PREFIXE_PERSO = "perso:";

/** Un champ personnalisé, tel que la console le définit. */
export interface ChampPerso {
  cle: string;
  libelle: string;
  /** Un champ à valeurs multiples se cumule au lieu de se relayer. */
  multiple?: boolean;
}

/**
 * Les champs personnalisés d'un événement, nettoyés.
 *
 * La console les écrit, mais la synchronisation ne lui fait pas confiance :
 * une entrée sans clé ni libellé ne désigne rien, et deux entrées de même clé
 * s'écraseraient l'une l'autre à l'écriture de la fiche.
 */
export function champsPerso(fiche: unknown): ChampPerso[] {
  const liste = (fiche as Record<string, any>)?.perso;
  if (!Array.isArray(liste)) return [];
  const vus = new Set<string>();
  const out: ChampPerso[] = [];
  for (const x of liste) {
    const cle = String(x?.cle ?? "").trim();
    if (!cle || vus.has(cle)) continue;
    vus.add(cle);
    out.push({
      cle,
      libelle: String(x?.libelle ?? "").trim() || cle,
      ...(x?.multiple ? { multiple: true } : {}),
    });
  }
  return out;
}

/**
 * Les cibles d'un fournisseur, celles du code et celles du salon.
 *
 * Tout ce qui parcourt les cibles — les champs à demander à l'API, la
 * proposition d'après le dernier relevé, la configuration du client
 * Eventmaker — doit voir les deux : un champ personnalisé se règle et se lit
 * exactement comme les autres, c'est tout son intérêt.
 */
export function cibles(fournisseur: string, fiche: unknown): Cible[] {
  return [
    ...(CIBLES[fournisseur] ?? []),
    ...champsPerso(fiche).map((c) => ({
      cle: PREFIXE_PERSO + c.cle,
      libelle: c.libelle,
      multiple: c.multiple,
    })),
  ];
}

/**
 * Les valeurs d'un champ à choix multiple, séparées.
 *
 * Ni Klipso ni Eventmaker ne rendent une liste : ils rendent une chaîne où les
 * valeurs se suivent, séparées par un point-virgule — « Devenir
 * master-franchisé;Adhérent FFF ». Prise telle quelle, la chaîne entière
 * devient une valeur à part entière, et un exposant qui en porte deux ne se
 * retrouve avec personne : autant de valeurs distinctes que de combinaisons.
 * C'est la même règle pour les thématiques et la nomenclature.
 */
export function separeValeurs(v: unknown): string[] {
  return ([] as unknown[]).concat(v ?? [])
    .flatMap((x) => String(x ?? "").split(";"))
    .map((x) => x.trim())
    .filter(Boolean);
}

/* Au-delà de huit valeurs distinctes, un champ n'est plus une liste de choix
   mais du texte libre : en proposer la liste n'aiderait personne. */
export const VALEURS_MAX = 8;

/* Une valeur trop longue n'est pas un choix mais une phrase : la proposer à
   cocher encombrerait la fenêtre sans rien désigner d'utile. */
const VALEUR_LONGUE = 60;

/**
 * Range dans un relevé les valeurs distinctes qu'une fiche porte sur un champ.
 *
 * Les valeurs se séparent avant d'être comptées : sans quoi un champ à choix
 * multiple montre autant d'entrées que de combinaisons cochées — « Nouveaux
 * exposants;Exposants internationaux » en est une, « Exposants
 * internationaux » une autre — et dépasse le seuil du texte libre alors qu'il
 * n'offre que trois choix.
 *
 * Une de plus que le seuil est retenue à dessein : c'est elle qui dira à
 * l'appelant que le champ est du texte libre, et qu'il faut lâcher la liste.
 */
export function noteValeurs(liste: string[], v: unknown): void {
  for (const val of separeValeurs(v)) {
    if (liste.length > VALEURS_MAX) return;
    if (val.length > VALEUR_LONGUE || liste.includes(val)) continue;
    liste.push(val);
  }
}

/**
 * La valeur d'un champ personnalisé, telle que l'instantané la portera.
 *
 * Plusieurs valeurs restent une liste — c'est par elle qu'un critère de
 * recherche les offre une à une — et une seule redevient du texte, que la
 * fiche affiche sur sa ligne. Rien de vide ne descend : l'instantané est servi
 * au public, il n'a pas à porter des chaînes vides par centaines.
 */
export function valeurPerso(v: unknown): string | string[] | null {
  if (typeof v === "boolean") return v ? "oui" : null;
  if (v !== null && v !== undefined && !Array.isArray(v) && typeof v === "object") {
    return null;
  }
  const l = separeValeurs(v);
  return !l.length ? null : l.length === 1 ? l[0] : l;
}
