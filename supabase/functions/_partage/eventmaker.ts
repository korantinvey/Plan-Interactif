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

  /** Vérifie que l'événement existe et renvoie son intitulé. */
  async evenement(id: string): Promise<{ _id: string; title: string }> {
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
   * Catégories dont au moins une fiche porte un numéro de stand.
   *
   * L'API ne sait pas filtrer sur un champ personnalisé — ni sur sa valeur, ni
   * sur sa présence ; seule une recherche plein texte existe, et elle réclame
   * un terme. Impossible donc de demander « les fiches qui ont un numéro de
   * stand ». Et l'on ne peut pas non plus tout balayer : un salon compte des
   * dizaines de milliers d'invités et une fiche avec ses champs personnalisés
   * pèse une vingtaine de kilo-octets.
   *
   * Reste à sonder la première page de chaque catégorie. C'est le prix d'entrée
   * — d'où le cache : les catégories connues sont reprises telles quelles et
   * seules les nouvelles sont sondées, ce qui ramène les trente-deux appels de
   * la première fois à un seul les fois suivantes.
   *
   * Les catégories ne portent pas les mêmes noms d'un salon à l'autre, et rien
   * ne dit qu'elles contiennent « exposant » dans leur intitulé : c'est la
   * présence d'un numéro de stand qui décide, pas le libellé.
   */
  async categoriesAvecStand(
    id: string,
    connues: string[] = [],
    echantillon = ECHANTILLON,
  ): Promise<{ retenues: { _id: string; name: string }[]; sondees: number }> {
    const cats = await this.categories(id);
    const deja = new Set(connues);
    // une catégorie supprimée disparaît d'elle-même de la liste
    const acquises = cats.filter((c) => deja.has(c._id));
    const aSonder = cats.filter((c) => !deja.has(c._id));

    const sondes = await enParallele(aSonder, DE_FRONT, async (c) => {
      const l = await this.json<Record<string, any>[]>(
        `/events/${id}/guests.json`,
        { per_page: echantillon, page: 1, guest_metadata: "true", "category[]": c._id },
      );
      return { c, avec: l.filter((g) => Eventmaker.stand(g, champs(g.guest_metadata))).length };
    });

    return {
      retenues: [...acquises, ...sondes.filter((s) => s.avec).map((s) => s.c)],
      sondees: aSonder.length,
    };
  }

  /**
   * Exposants indexés par numéro de stand.
   *
   * Deux règles, et rien d'autre : la fiche porte un numéro de stand, et son
   * inscription est effective. Le reste n'est que le moyen d'y arriver sans
   * télécharger le salon entier.
   */
  async exposants(id: string, connues: string[] = []): Promise<{
    parStand: Map<string, ExposantEm>;
    categories: string[];
    categoriesIds: string[];
    sondees: number;
    lus: number;
    retenus: number;
    ecartesNonInscrits: number;
  }> {
    const parStand = new Map<string, ExposantEm>();
    const { retenues: cats, sondees } = await this.categoriesAvecStand(id, connues);
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
      sondees,
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
