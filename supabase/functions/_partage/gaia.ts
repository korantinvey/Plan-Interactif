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

  /** Un média (les SVG d'habillage) est renvoyé tel quel, pas en JSON. */
  async media(idMedia: string): Promise<string> {
    const r = await fetch(`${this.base}/media/getById?idMedia=${idMedia}`, {
      headers: await this.entetes(),
    });
    if (!r.ok) throw new Error(`Média ${idMedia} indisponible (${r.status}).`);
    return await r.text();
  }
}

/** Raccourci : une condition d'égalité sur un champ. */
export const egal = (champ: string, valeur: unknown) => ({
  type: "Condition",
  leftOperand: { type: "FieldPath", fieldPath: champ },
  operator: "Equal",
  rightOperand: { type: "Value", value: valeur },
});
