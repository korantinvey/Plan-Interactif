/**
 * Le programme d'un salon saisi à la main.
 *
 * Certains salons ne publient leur programme dans aucun outil que la
 * synchronisation sache lire : Funexpo 2026 tient ses conférences sur une
 * page de son site, et nulle part dans Eventmaker. Elles sont alors recopiées
 * dans la colonne `evenement.conferences_saisies`, et ce module les rend sous
 * la forme qu'Eventmaker aurait donnée — le reste de la synchronisation, qui
 * situe les salles, rattache les stands et ouvre les rappels, n'a ainsi rien
 * à savoir de leur provenance.
 *
 * Une entrée saisie ressemble à ceci :
 *
 *   { id, nom, texte, debut, fin, salle, type, couleur, theme,
 *     stands: ["C99"],                       // qui la tient, par emplacement
 *     intervenants: [{ nom, societe, fonction }],
 *     en: { nom, texte, salle, type, theme } } // l'anglais, quand il existe
 *
 * L'exposant se désigne par son numéro d'emplacement et non par sa fiche :
 * c'est ce que donne un programme imprimé — « Stand C99 » — et c'est ce que
 * l'exploitant peut vérifier d'un coup d'œil sur le plan.
 */
import type { ConferenceEm, IntervenantEm } from "./eventmaker.ts";

/** L'anglais d'une conférence : seuls ses textes rédigés en ont un. */
export interface AnglaisConf {
  nom?: string;
  texte?: string;
  salle?: string;
  type?: string;
  theme?: string;
}

export interface ProgrammeSaisi {
  conferences: (ConferenceEm & { en?: AnglaisConf })[];
  // par conférence, les numéros d'emplacement de ceux qui la tiennent
  stands: Map<string, string[]>;
  intervenants: Map<string, IntervenantEm[]>;
}

const texte = (v: unknown): string | null => {
  const t = String(v ?? "").trim();
  return t || null;
};

/**
 * Le programme saisi d'un salon. Une entrée sans identifiant ou sans titre est
 * écartée plutôt que devinée : l'identifiant nomme les rappels et les
 * compteurs de la conférence, le changer d'une synchronisation à l'autre les
 * orphelinerait.
 */
export function programmeSaisi(brut: unknown): ProgrammeSaisi {
  const out: ProgrammeSaisi = { conferences: [], stands: new Map(), intervenants: new Map() };
  for (const c of Array.isArray(brut) ? brut : []) {
    const id = texte(c?.id), nom = texte(c?.nom);
    if (!id || !nom) continue;
    const salle = texte(c.salle);
    out.conferences.push({
      id, nom,
      texte: texte(c.texte),
      debut: texte(c.debut),
      fin: texte(c.fin),
      // l'heure saisie porte son décalage : la page la ramène au fuseau du
      // salon, il n'y a pas d'heure murale à recopier à part
      debutLocal: null,
      finLocal: null,
      // le nom fait office d'identifiant de salle : c'est sous lui que la
      // console rattache une salle à sa zone
      salleId: salle,
      salle,
      type: texte(c.type),
      couleur: texte(c.couleur),
      theme: texte(c.theme),
      ...(c.en && typeof c.en === "object" ? { en: c.en as AnglaisConf } : {}),
    });
    const stands = (Array.isArray(c.stands) ? c.stands : []).map(texte).filter(Boolean) as string[];
    if (stands.length) out.stands.set(id, stands);
    const gens = (Array.isArray(c.intervenants) ? c.intervenants : [])
      .filter((p: any) => texte(p?.nom))
      .map((p: any) => ({ nom: texte(p.nom)!, societe: texte(p.societe), fonction: texte(p.fonction) }));
    if (gens.length) out.intervenants.set(id, gens);
  }
  return out;
}
