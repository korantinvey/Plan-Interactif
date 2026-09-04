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

/* « Inscrit » dans l'interface Eventmaker. Une fiche en attente, refusée ou
   désinscrite ne doit pas paraître sur le plan public. */
const INSCRIT = "registered";

/** Un exposant tel que le plan en a besoin, débarrassé du reste. */
export interface ExposantEm {
  stand: string;
  nom: string | null;
  raison: string | null;
  site: string | null;
  nomencl: string[];
  exclu: boolean;
}

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
   * On ne peut pas balayer tous les invités : un salon en compte des dizaines
   * de milliers et une fiche avec ses champs personnalisés pèse une vingtaine
   * de kilo-octets — près d'un gigaoctet par synchronisation. On sonde donc la
   * première page de chaque catégorie.
   *
   * Les catégories ne portent pas les mêmes noms d'un salon à l'autre, et rien
   * ne dit qu'elles contiennent « exposant » dans leur intitulé : c'est la
   * présence d'un numéro de stand qui décide, pas le libellé. Une catégorie
   * retenue à tort ne coûte rien — les fiches sans numéro sont écartées de
   * toute façon.
   */
  async categoriesAvecStand(
    id: string,
    echantillon = 100,
  ): Promise<{ _id: string; name: string; vus: number; avecStand: number }[]> {
    const cats = await this.categories(id);
    const gardees = [];
    for (const c of cats) {
      const l = await this.json<Record<string, any>[]>(
        `/events/${id}/guests.json`,
        { per_page: echantillon, page: 1, guest_metadata: "true", "category[]": c._id },
      );
      const n = l.filter((g) => Eventmaker.stand(g, champs(g.guest_metadata))).length;
      if (n) gardees.push({ ...c, vus: l.length, avecStand: n });
    }
    return gardees;
  }

  /**
   * Exposants indexés par numéro de stand.
   *
   * Deux règles, et rien d'autre : la fiche porte un numéro de stand, et son
   * inscription est effective. Le reste n'est que le moyen d'y arriver sans
   * télécharger le salon entier.
   */
  async exposants(id: string): Promise<{
    parStand: Map<string, ExposantEm>;
    categories: string[];
    lus: number;
    retenus: number;
    ecartesNonInscrits: number;
  }> {
    const parStand = new Map<string, ExposantEm>();
    const cats = await this.categoriesAvecStand(id);
    let lus = 0, ecartesNonInscrits = 0;

    for (const cat of cats) {
      for (let page = 1; ; page++) {
        const l = await this.json<Record<string, any>[]>(
          `/events/${id}/guests.json`,
          { per_page: PAR_PAGE, page, guest_metadata: "true", "category[]": cat._id },
        );
        for (const g of l) {
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
            nom: m.enseigne || g.company_name || null,
            raison: m.company_name_2 || null,
            site: m.company_website || null,
            nomencl: [m.rubriques2, m.rubriques].filter(Boolean) as string[],
            exclu: String(m.exclu_liste_exposant ?? "").toLowerCase() === "true",
          });
        }
        if (l.length < PAR_PAGE) break;
      }
    }
    return {
      parStand,
      categories: cats.map((c) => c.name),
      lus,
      retenus: parStand.size,
      ecartesNonInscrits,
    };
  }
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
