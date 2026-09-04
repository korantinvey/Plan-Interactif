/**
 * Client Eventmaker.
 *
 * L'API s'authentifie par un jeton passé en paramètre d'adresse — ce n'est pas
 * notre choix, c'est son contrat. Le jeton vient des secrets de la fonction et
 * ne transite ni par la base, ni par le navigateur.
 *
 * Deux particularités à connaître :
 *   — une requête sans « page » répond 302 vers la même adresse avec page=1.
 *     On suit donc les redirections plutôt que de les subir ;
 *   — la fiche riche d'un exposant n'est pas sur /exhibitors, qui ne rend que
 *     le nom et le courriel, mais sur l'invité correspondant, dont les champs
 *     personnalisés ne descendent qu'avec guest_metadata=true.
 */
export interface ConfigEm {
  jeton: string;
}

const BASE = "https://app.eventmaker.io/api/v1";
const PAR_PAGE = 500;

/* Sonder chaque catégorie coûte un appel : trente-deux sur un salon comme
   Franchise Expo. Vingt-cinq fiches suffisent à savoir si l'une d'elles porte
   des numéros de stand — la catégorie des exposants en est pleine, les autres
   n'en ont aucune. */
const ECHANTILLON = 25;

/* Douze numéros pris à intervalle régulier dans le plan suffisent à retrouver
   les catégories qui portent les exposants : ils y sont par centaines. */
const SONDES = 12;

/* Les appels sont indépendants et l'attente est celle du réseau, pas du calcul.
   Six de front tiennent l'API sans la brusquer et divisent le temps d'autant. */
const DE_FRONT = 6;

/* « Inscrit » dans l'interface Eventmaker. Une fiche en attente, refusée ou
   désinscrite ne doit pas paraître sur le plan public. */
const INSCRIT = "registered";

/**
 * Un exposant tel que le plan en a besoin, débarrassé du reste.
 *
 * Une fiche Eventmaker porte deux cent soixante-douze champs ; on n'en retient
 * que ce qu'une fiche détail peut montrer. Le reste — quotas, badges, suivi
 * commercial — n'a rien à faire dans une charge utile publique.
 */
export interface ExposantEm {
  stand: string;
  nom: string | null;
  raison: string | null;
  site: string | null;
  adresse: string | null;
  ville: string | null;
  pays: string | null;
  tel: string | null;
  facebook: string | null;
  linkedin: string | null;
  instagram: string | null;
  nomencl: string[];
  exclu: boolean;
}

/** Rien plutôt qu'une chaîne vide : le rendu masque les champs absents. */
const ou = (...v: unknown[]): string | null => {
  for (const x of v) { const s = String(x ?? "").trim(); if (s) return s; }
  return null;
};

/**
 * Le numéro de stand est la clé de rattachement au plan. Klipso le compose de
 * l'allée et du numéro (« W » + « 110 »), Eventmaker le saisit à la main :
 * espaces, tirets et casse varient. On compare des formes normalisées.
 */
export const cleStand = (v: unknown): string =>
  String(v ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");

export class Eventmaker {
  constructor(private cfg: ConfigEm) {}

  private adresse(chemin: string, params: Record<string, string | number> = {}) {
    const u = new URL(BASE + chemin);
    u.searchParams.set("auth_token", this.cfg.jeton);
    for (const [k, v] of Object.entries(params)) u.searchParams.append(k, String(v));
    return u.toString();
  }

  private async json<T>(chemin: string, params?: Record<string, string | number>): Promise<T> {
    const r = await fetch(this.adresse(chemin, params), { redirect: "follow" });
    if (!r.ok) {
      const t = await r.text();
      throw new Error(`Eventmaker ${chemin} : ${r.status} ${t.slice(0, 160)}`);
    }
    return await r.json() as T;
  }

  /**
   * L'événement : son intitulé, et surtout son fuseau horaire — sans lui, une
   * heure ISO se lirait dans le fuseau du visiteur, qui peut être ailleurs.
   */
  async evenement(id: string): Promise<{ _id: string; title: string; timezone?: string }> {
    return await this.json(`/events/${id}.json`);
  }

  /** Catégories d'invités, pour que l'exploitant désigne celles des exposants. */
  async categories(id: string): Promise<{ _id: string; name: string }[]> {
    const l = await this.json<Record<string, unknown>[]>(
      `/events/${id}/guest_categories.json`,
      { per_page: PAR_PAGE },
    );
    return l.map((c) => ({ _id: String(c._id), name: String(c.name ?? "") }))
      .sort((a, b) => a.name.localeCompare(b.name, "fr"));
  }

  /**
   * Numéro de stand d'une fiche, sous sa forme normalisée.
   *
   * Un seul champ fait foi : « NUM stand ». Deux autres lui ressemblent —
   * booth_number_ezymob, alimenté pour le site public, et stand_number, natif
   * d'Eventmaker mais vide ici — et s'en servir en repli reviendrait à faire
   * entrer sur le plan des fiches que l'exploitant n'y a pas mises.
   */
  private static stand(_g: Record<string, any>, m: Record<string, string>): string {
    return cleStand(m.num_stand);
  }

  /**
   * Catégories dont les fiches portent des numéros de stand.
   *
   * L'API ne sait pas filtrer sur un champ personnalisé — ni sur sa valeur, ni
   * sur sa présence — et ne sait pas non plus ne renvoyer qu'une partie des
   * champs. Impossible donc de demander « les fiches qui ont un numéro de
   * stand », et hors de question de tout balayer : un salon compte des dizaines
   * de milliers d'invités et une fiche complète pèse une vingtaine de
   * kilo-octets.
   *
   * Mais une recherche plein texte existe, et le plan nous fournit justement
   * des termes à chercher : ses propres numéros de stand. Une poignée de
   * numéros pris à intervalle régulier ramène les fiches correspondantes, qui
   * portent chacune leur catégorie. Douze appels légers au lieu de trente-deux
   * lourds.
   *
   * Le sondage par catégorie reste en second recours, pour le premier passage
   * d'un événement dont on n'a encore aucun plan.
   *
   * Les catégories ne portent pas les mêmes noms d'un salon à l'autre, et rien
   * ne dit qu'elles contiennent « exposant » dans leur intitulé : c'est la
   * présence d'un numéro de stand qui décide, pas le libellé.
   */
  async categoriesAvecStand(
    id: string,
    connues: string[] = [],
    codes: string[] = [],
  ): Promise<{ retenues: { _id: string; name: string }[]; appels: number; voie: string }> {
    const cats = await this.categories(id);
    const parId = new Map(cats.map((c) => [c._id, c]));
    // une catégorie supprimée disparaît d'elle-même de la liste
    const trouvees = new Set(connues.filter((c) => parId.has(c)));

    /* --- première voie : chercher les numéros du plan --- */
    let appels = 1;
    if (codes.length) {
      const pas = Math.max(1, Math.floor(codes.length / SONDES));
      const echantillon = Array.from({ length: Math.min(SONDES, codes.length) },
        (_, i) => codes[i * pas]).filter(Boolean);
      const trouves = await enParallele(echantillon, DE_FRONT, async (code) => {
        const l = await this.json<Record<string, any>[]>(
          `/events/${id}/guests.json`,
          { per_page: ECHANTILLON, page: 1, guest_metadata: "true", search: code },
        );
        return l.filter((g) => Eventmaker.stand(g, champs(g.guest_metadata)))
          .map((g) => String(g.guest_category_id));
      });
      appels += echantillon.length;
      trouves.flat().forEach((c) => { if (parId.has(c)) trouvees.add(c); });
      if (trouvees.size) {
        return {
          retenues: [...trouvees].map((c) => parId.get(c)!),
          appels,
          voie: "recherche par numéro",
        };
      }
    }

    /* --- second recours : sonder chaque catégorie --- */
    const aSonder = cats.filter((c) => !trouvees.has(c._id));
    const sondes = await enParallele(aSonder, DE_FRONT, async (c) => {
      const l = await this.json<Record<string, any>[]>(
        `/events/${id}/guests.json`,
        { per_page: ECHANTILLON, page: 1, guest_metadata: "true", "category[]": c._id },
      );
      return { c, avec: l.filter((g) => Eventmaker.stand(g, champs(g.guest_metadata))).length };
    });
    appels += aSonder.length;
    sondes.filter((s) => s.avec).forEach((s) => trouvees.add(s.c._id));

    return {
      retenues: [...trouvees].map((c) => parId.get(c)!),
      appels,
      voie: "sondage des catégories",
    };
  }

  /**
   * Conférences de l'événement.
   *
   * Une session se distingue d'une entrée ou d'un badge par son type : les
   * « accesspoints » servent aussi bien à contrôler l'accès au salon qu'à
   * décrire le programme, et seuls les seconds portent un session_type_id.
   */
  async conferences(id: string): Promise<ConferenceEm[]> {
    const out: ConferenceEm[] = [];
    for (let page = 1; ; page++) {
      const l = await this.json<Record<string, any>[]>(
        `/events/${id}/accesspoints.json`,
        { per_page: PAR_PAGE, page },
      );
      for (const a of l) {
        if (!a.session_type_id) continue;
        out.push({
          id: String(a._id),
          nom: String(a.display_name || a.name || "").trim(),
          // la description arrive en HTML rédigé ; le plan n'affiche que du texte
          texte: texteSeul(a.description?.html),
          debut: a.start_date ?? null,
          fin: a.end_date ?? null,
          debutLocal: a.start_date_to_timezone ?? null,
          finLocal: a.end_date_to_timezone ?? null,
          salleId: a.session_room_id ? String(a.session_room_id) : null,
          salle: a.session_room?.name ?? a.location ?? null,
          type: a.session_type ?? null,
          couleur: a.session_type_ref?.color ?? null,
          theme: a.traits?.thematique_conference ?? null,
        });
      }
      if (l.length < PAR_PAGE) break;
    }
    // l'ordre chronologique est celui dans lequel on les affichera
    return out.sort((a, b) => String(a.debut).localeCompare(String(b.debut)));
  }

  /**
   * Exposants indexés par numéro de stand.
   *
   * Deux règles, et rien d'autre : la fiche porte un numéro de stand, et son
   * inscription est effective. Le reste n'est que le moyen d'y arriver sans
   * télécharger le salon entier.
   */
  async exposants(id: string, connues: string[] = [], codes: string[] = []): Promise<{
    parStand: Map<string, ExposantEm>;
    categories: string[];
    categoriesIds: string[];
    appels: number;
    voie: string;
    lus: number;
    retenus: number;
    ecartesNonInscrits: number;
  }> {
    const parStand = new Map<string, ExposantEm>();
    const { retenues: cats, appels, voie } = await this.categoriesAvecStand(id, connues, codes);
    let lus = 0, ecartesNonInscrits = 0;

    // Les catégories sont indépendantes : on les lit de front. À l'intérieur,
    // les pages restent séquentielles — on ne sait pas combien il y en a
    // avant d'en recevoir une plus courte que les autres.
    const paquets = await enParallele(cats, DE_FRONT, async (cat) => {
      const tout: Record<string, any>[] = [];
      for (let page = 1; ; page++) {
        const l = await this.json<Record<string, any>[]>(
          `/events/${id}/guests.json`,
          { per_page: PAR_PAGE, page, guest_metadata: "true", "category[]": cat._id },
        );
        tout.push(...l);
        if (l.length < PAR_PAGE) return tout;
      }
    });

    for (const g of paquets.flat()) {
      lus++;
      const m = champs(g.guest_metadata);
      const stand = Eventmaker.stand(g, m);
      if (!stand) continue;
      if (String(g.status ?? "") !== INSCRIT) { ecartesNonInscrits++; continue; }
      // premier arrivé, premier servi : un stand partagé garde l'enseigne
      // rencontrée d'abord plutôt qu'une des suivantes, prise au hasard
      if (parStand.has(stand)) continue;
      parStand.set(stand, {
        stand,
        nom: ou(m.enseigne, g.company_name),
        raison: ou(m.company_name_2),
        site: ou(m.company_website),
        // le code postal n'a pas de champ à lui sur la fiche : il tient sur
        // la même ligne que la voie, comme sur une enveloppe
        adresse: ou([ou(g.address, m.address_2), ou(g.postal_code)]
          .filter(Boolean).join(", ")),
        ville: ou(m.locality, g.city),
        pays: ou(g.country_name),
        tel: ou(m.company_phone, g.phone_number),
        facebook: ou(m.company_facebook),
        linkedin: ou(m.company_linkedin),
        instagram: ou(m.instagram_societe),
        nomencl: [m.rubriques2, m.rubriques].filter(Boolean) as string[],
        exclu: String(m.exclu_liste_exposant ?? "").toLowerCase() === "true",
      });
    }
    return {
      parStand,
      categories: cats.map((c) => c.name),
      categoriesIds: cats.map((c) => c._id),
      appels,
      voie,
      lus,
      retenus: parStand.size,
      ecartesNonInscrits,
    };
  }
}

/** Exécute une tâche par élément, quelques-unes de front, dans l'ordre. */
async function enParallele<T, R>(
  items: T[],
  n: number,
  fn: (x: T) => Promise<R>,
): Promise<R[]> {
  const out = new Array<R>(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(n, items.length) }, async () => {
      for (;;) {
        const k = i++;
        if (k >= items.length) return;
        out[k] = await fn(items[k]);
      }
    }),
  );
  return out;
}

/** Une description rédigée en HTML, ramenée à son texte. */
function texteSeul(html: unknown): string | null {
  const t = String(html ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, " ")
    .trim();
  return t || null;
}

/** Les champs personnalisés arrivent en liste de { name, value }. */
function champs(meta: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (!Array.isArray(meta)) return out;
  for (const m of meta) {
    const n = (m as Record<string, unknown>)?.name;
    const v = (m as Record<string, unknown>)?.value;
    if (typeof n === "string" && typeof v === "string" && v.trim()) out[n] = v.trim();
  }
  return out;
}

/** Une conférence telle que le plan en a besoin. */
export interface ConferenceEm {
  id: string;
  nom: string;
  texte: string | null;
  debut: string | null;
  fin: string | null;
  // heure locale du salon, telle qu'Eventmaker la donne : elle évite d'avoir à
  // deviner un fuseau depuis le navigateur d'un visiteur
  debutLocal: string | null;
  finLocal: string | null;
  salleId: string | null;
  salle: string | null;
  type: string | null;
  couleur: string | null;
  theme: string | null;
}

/** Le code d'emplacement caché dans un nom de salle : « Agora (P160) ». */
export const codeSalle = (nom: unknown): string[] => {
  const m = /\(([^)]+)\)\s*$/.exec(String(nom ?? ""));
  // « M52-N51 » désigne deux emplacements réunis : on garde les deux, le
  // premier retrouvé sur le plan suffira à désigner la zone
  return m ? String(m[1]).toUpperCase().split(/[^A-Z0-9]+/).filter(Boolean) : [];
};
