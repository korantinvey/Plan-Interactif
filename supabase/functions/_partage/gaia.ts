/**
 * Client GAIA (Klipso).
 *
 * Le jeton expire au bout de 15 minutes, c'est imposé par Klipso ; on le garde
 * 13 pour ne pas se faire rejeter en plein appel. Cela n'a aucun rapport avec
 * la fréquence de rafraîchissement des plans, réglée par événement.
 */

export interface Config {
  instance: string;
  apiKey: string;
  eventId?: string;
}

export class Gaia {
  private jeton: string | null = null;
  private expire = 0;
  private base: string;
  // les métadonnées décrivent tout le schéma : on ne les lit qu'une fois
  private meta: Record<string, any> | null = null;

  constructor(private cfg: Config) {
    this.base = `https://${cfg.instance}.svc.calypso-event.net/${cfg.instance}`;
  }

  private async token(): Promise<string> {
    if (this.jeton && Date.now() < this.expire) return this.jeton;
    const r = await fetch(`${this.base}/account/getApiKeyAccessToken`, {
      method: "POST",
      headers: { "Content-Type": "Application/Json", "X-GAIA-ClientApp": "ApiWsFO" },
      body: JSON.stringify({ apiKey: this.cfg.apiKey }),
    });
    const j = await r.json();
    if (!j.isValid || !j.data?.accessToken) {
      throw new Error("Clé API refusée par GAIA.");
    }
    this.jeton = j.data.accessToken;
    this.expire = Date.now() + 13 * 60_000;
    return this.jeton!;
  }

  private async entetes(): Promise<HeadersInit> {
    const h: Record<string, string> = {
      "Content-Type": "Application/Json",
      "Authorization": "Bearer " + (await this.token()),
      "X-GAIA-ClientApp": "ApiWsFO",
    };
    if (this.cfg.eventId) h["X-GAIA-EventId"] = this.cfg.eventId;
    return h;
  }

  /** Un appel brut à entity/get. */
  async entite(corps: unknown): Promise<{ data: unknown[]; count: number }> {
    const r = await fetch(`${this.base}/entity/get`, {
      method: "POST",
      headers: await this.entetes(),
      body: JSON.stringify(corps),
    });
    const j = await r.json();
    if (!j.isValid) {
      throw new Error(j.error?.[0]?.message ?? "Réponse GAIA invalide.");
    }
    return { data: j.data ?? [], count: j.count ?? 0 };
  }

  /**
   * Récupère l'intégralité d'une entité, page par page.
   *
   * Le tri explicite n'est pas une commodité : sans lui, l'ordre des lignes
   * n'est pas garanti d'un appel à l'autre et la pagination perd des
   * enregistrements en silence — 19 stands sur 239 lors du premier essai.
   */
  async tout<T = Record<string, unknown>>(
    entite: string,
    spec: Record<string, unknown>,
    triSur = "Id",
  ): Promise<T[]> {
    const out: T[] = [];
    for (let start = 1; ; start += 500) {
      const { data, count } = await this.entite({
        [entite]: {
          ...spec,
          inlineCount: true,
          start,
          take: 500,
          order: spec.order ?? [{ fieldPath: triSur, direction: "asc" }],
        },
      });
      out.push(...(data as T[]));
      if (data.length === 0 || out.length >= count) return out;
    }
  }

  /** Le schéma déclaré par le serveur, lu une fois pour toutes. */
  private async metadonnees(): Promise<Record<string, any>> {
    if (this.meta) return this.meta;
    const r = await fetch(`${this.base}/metadata/get?local=fr`, {
      headers: await this.entetes(),
    });
    const j = await r.json();
    if (!j.isValid) {
      throw new Error(j.error?.[0]?.message ?? "Métadonnées refusées par GAIA.");
    }
    this.meta = j.data ?? {};
    return this.meta!;
  }

  /**
   * Les propriétés d'une entité, telles que le serveur les déclare.
   *
   * Sert à proposer les champs d'origine dans la console : ceux qui portent la
   * raison sociale ou le site web d'un exposant sont personnalisés — préfixés
   * « x_ » — et diffèrent d'un salon à l'autre. Les deviner serait fragile ;
   * le schéma les nomme.
   */
  async proprietes(entite: string): Promise<
    { cle: string; libelle: string; type: string | null }[]
  > {
    const meta = await this.metadonnees();
    const props = meta?.[entite]?.properties ?? {};
    return Object.entries(props).map(([cle, p]) => {
      const d = p as Record<string, any>;
      const lib = d?.label?.fr ?? d?.label?.en ??
        (d?.label && typeof d.label === "object" ? Object.values(d.label)[0] : d?.label);
      return {
        cle,
        libelle: typeof lib === "string" && lib ? lib : cle,
        type: d?.type ?? d?.dataType ?? null,
      };
    }).sort((a, b) => a.cle.localeCompare(b.cle, "fr"));
  }

  /**
   * Chemin de la codification d'une propriété, tel que le déclarent les
   * métadonnées — « Global.Pays » pour un pays, par exemple.
   *
   * Une propriété de type « choix » ne porte pas ses libellés : elle désigne
   * une codification, qui peut appartenir à une autre entité que la sienne.
   * Deviner ce chemin serait fragile ; le serveur le donne.
   */
  async cheminCodification(entite: string, propriete: string): Promise<string> {
    const meta = await this.metadonnees();
    const p = meta?.[entite]?.properties?.[propriete];
    // à défaut de déclaration, la codification porte le nom de la propriété
    return p?.codificationPath || `${entite}.${propriete}`;
  }

  /**
   * Libellés d'une codification désignée par son chemin.
   *
   * La demande nomme l'entité puis ses propriétés :
   *
   *     { "DossierExp": ["x_Nomenclature"] }
   *
   * La réponse est un arbre : entité → propriété → code → { id, label }. Une
   * codification arborescente ajoute des niveaux, d'où l'aplatissement.
   */
  async codification(chemin: string, langue = "fr"): Promise<Record<string, string>> {
    const point = chemin.indexOf(".");
    if (point < 0) throw new Error(`Chemin de codification illisible : ${chemin}`);
    const entite = chemin.slice(0, point);
    const propriete = chemin.slice(point + 1);

    const r = await fetch(`${this.base}/codification/get`, {
      method: "POST",
      headers: await this.entetes(),
      body: JSON.stringify({ [entite]: [propriete] }),
    });
    const j = await r.json();
    if (!j.isValid) {
      throw new Error(j.error?.[0]?.message ?? "Codification refusée par GAIA.");
    }

    const table: Record<string, string> = {};
    aplatit(j.data?.[entite]?.[propriete], table, langue);
    return table;
  }

  /** Un média (les SVG d'habillage) est renvoyé tel quel, pas en JSON. */
  async media(idMedia: string): Promise<string> {
    const r = await fetch(`${this.base}/media/getById?idMedia=${idMedia}`, {
      headers: await this.entetes(),
    });
    if (!r.ok) throw new Error(`Média ${idMedia} indisponible (${r.status}).`);
    return await r.text();
  }
}

/**
 * Parcourt l'arbre d'une codification et retient chaque code portant un
 * libellé. Les nœuds intermédiaires d'une codification arborescente en portent
 * un aussi : les garder ne coûte rien et sert si une fiche référence une
 * branche plutôt qu'une feuille.
 */
function aplatit(
  noeud: unknown,
  table: Record<string, string>,
  langue: string,
  code?: string,
): void {
  if (!noeud || typeof noeud !== "object") return;
  const n = noeud as Record<string, any>;

  const lib = n.label?.[langue] ?? n.label?.fr ??
    (n.label && typeof n.label === "object" ? Object.values(n.label)[0] : undefined);
  const cle = (n.id ?? code) as string | undefined;
  if (code && typeof lib === "string" && lib) table[code] = lib;
  // certaines réponses désignent la valeur par son identifiant plutôt que par
  // la clé de l'objet : on accepte les deux
  if (cle && cle !== code && typeof lib === "string" && lib) table[cle] = lib;

  for (const [k, v] of Object.entries(n)) {
    if (k === "label" || k === "id") continue;
    aplatit(v, table, langue, k);
  }
}

/** Raccourci : une condition d'égalité sur un champ. */
export const egal = (champ: string, valeur: unknown) => ({
  type: "Condition",
  leftOperand: { type: "FieldPath", fieldPath: champ },
  operator: "Equal",
  rightOperand: { type: "Value", value: valeur },
});
