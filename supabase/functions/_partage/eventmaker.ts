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
import {
  DEFAUTS, PREFIXE_PERSO, imageDistante, lit, noteValeurs, ou, valeurPerso,
  valeursRelevees, vrai,
} from "./champs.ts";
import type { ChampPerso } from "./champs.ts";

export interface ConfigEm {
  jeton: string;
  /**
   * Champ d'origine retenu pour chaque cible, résolu par l'appelant depuis la
   * correspondance de l'événement. Absent, chaque cible garde son défaut.
   *
   * Ce n'est pas un raffinement : les champs personnalisés d'une fiche
   * Eventmaker sont nommés par l'organisateur, et « num_stand » n'a aucune
   * raison de s'appeler pareil sur le salon d'à côté.
   */
  champs?: Record<string, string[]>;
  /**
   * Les valeurs qui valent oui, par cible, quand le champ retenu est une liste
   * de choix plutôt qu'un oui/non. Sans elles, c'est l'accord usuel qui décide.
   */
  valeurs?: Record<string, string[]>;
  /**
   * Les champs que le salon s'est ajoutés. Ils se lisent comme les autres
   * cibles — leur champ d'origine est dans `champs`, sous le préfixe qui les
   * distingue — mais leur liste n'est connue que de l'événement.
   */
  perso?: ChampPerso[];
  /**
   * Les catégories d'invités qui portent les exposants, désignées depuis la
   * console. Elles remplacent la détection, elles ne s'y ajoutent pas.
   *
   * La détection reconnaît une catégorie à ce que ses fiches portent un numéro
   * de stand ; elle ne sait pas reconnaître celles qui n'en portent aucun, et
   * elle retient une catégorie entière dès qu'une seule de ses fiches en porte
   * un — sur Moove On, « EXPOSANT (raison sociale) » mêle 51 sociétés et 36
   * personnes. L'exploitant, lui, sait laquelle de ses catégories est celle
   * des exposants : quand il le dit, on ne devine plus.
   */
  categories?: string[];
}

const BASE = "https://app.eventmaker.io/api/v1";
const PAR_PAGE = 500;

/* Le programme du site public ne passe pas par REST, où rien ne relie une
   session à un exposant, mais par ce graphe — non documenté, et public : ni
   jeton ni en-tête, l'identifiant de l'événement suffit. `outils/eventmaker.md`
   raconte par où on y est arrivé. */
const GRAPHE = "https://app.eventmaker.io/api/graphql";

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

/* Deux origines sur une fiche : les champs personnalisés, nommés par
   l'organisateur et donc propres au salon, et les champs natifs de l'invité,
   identiques partout. L'ordre les sépare dans la liste de la console. */
const GROUPES = ["Champ personnalisé", "Fiche invité · champ standard"];

/* « Inscrit » dans l'interface Eventmaker. Une fiche en attente, refusée ou
   désinscrite ne doit pas paraître sur le plan public. */
const INSCRIT = "registered";

/* Les thématiques d'un salon sont une ressource d'Eventmaker et non un champ
   de fiche : la fiche n'en porte que les identifiants, dans ce champ natif, et
   c'est `/thematics.json` qui les nomme. Sur Moove On comme sur Open Source
   Experience, rien d'autre ne range les exposants — aucun champ personnalisé
   ne les reprend —, si bien que la cible « Thématiques » n'avait rien à
   désigner : le relevé écarte les valeurs qui sont des listes, et une liste
   d'identifiants MongoDB n'aurait de toute façon rien affiché.

   On les résout donc en noms sur la fiche, à la place des identifiants, et le
   champ redevient un champ à choix multiple comme les autres — relevé avec un
   exemple lisible, désignable depuis la console. La liste reste une liste tout
   du long : la joindre par un point-virgule pour la recouper ensuite aurait
   haché en deux une thématique qui en porte un dans son nom. */
const CHAMP_THEMATIQUES = "thematic_ids";

/* Ce que la console affiche à côté du nom technique. Sans lui, « thematic_ids »
   se lit comme une clé technique de plus dans une liste qui en compte cent. */
const LIBELLE_THEMATIQUES = "Thématiques du salon";

/**
 * Un exposant tel que le plan en a besoin, débarrassé du reste.
 *
 * Une fiche Eventmaker porte deux cent soixante-douze champs ; on n'en retient
 * que ce qu'une fiche détail peut montrer. Le reste — quotas, badges, suivi
 * commercial — n'a rien à faire dans une charge utile publique.
 */
export interface ExposantEm {
  stand: string;
  /* Le dossier de la société, et non celui du stand : un co-exposant a le sien,
     distinct de celui du titulaire avec qui il partage pourtant le numéro. */
  dossier: string;
  nom: string | null;
  raison: string | null;
  /* L'avatar de la fiche d'invité : sur une fiche de société, c'est le logo de
     l'enseigne que l'organisateur y a déposé. */
  logo: string | null;
  site: string | null;
  adresse: string | null;
  /* Le code postal garde son champ à lui jusqu'à la fiche, où il se pose
     devant la ville. Le coller ici à la ville ferait du filtre « Ville » une
     liste de codes postaux, et d'une ville à deux codes deux entrées. */
  cp: string | null;
  ville: string | null;
  pays: string | null;
  tel: string | null;
  facebook: string | null;
  linkedin: string | null;
  instagram: string | null;
  nomencl: string[];
  themes: string[];
  /** Les champs propres au salon, par clé. Vide sur un salon qui n'en a pas. */
  perso: Record<string, string | string[]>;
  // une pastille sur la fiche, quand le salon distingue ses nouveaux venus
  neuf: boolean;
  exclu: boolean;
}

/**
 * Le numéro de stand est la clé de rattachement au plan. Klipso le compose de
 * l'allée et du numéro (« W » + « 110 »), Eventmaker le saisit à la main :
 * espaces, tirets et casse varient. On compare des formes normalisées.
 */
export const cleStand = (v: unknown): string =>
  String(v ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");

/**
 * Un exposant tel qu'une conférence le désigne.
 *
 * L'appariement se fait sur le dossier, pas sur le numéro de stand : Klipso
 * porte l'identifiant du dossier sur le stand, Eventmaker le recopie dans
 * `id_dossier`, et c'est la même valeur des deux côtés. Le numéro de stand,
 * lui, est saisi à la main et se compose parfois de deux emplacements
 * (« E58 - F59 ») qu'aucun stand du plan ne porte tels quels.
 */
export interface ExposantConfEm {
  dossier: string;
  nom: string | null;
}

/**
 * Une personne que le programme cite sans lui connaître de stand : celle qui
 * parle, celle qui anime. Elle ne désigne rien sur le plan — la fiche la nomme,
 * et c'est tout ce qu'on lui demande.
 *
 * Le graphe rend `name` d'un bloc, « Prénom NOM » : il n'expose ni prénom ni
 * patronyme à part. On le garde tel quel, n'ayant pas à trier des personnes.
 */
export interface IntervenantEm {
  nom: string;
  societe: string | null;
  fonction: string | null;
}

/* Les trois rôles que le graphe range sous une session. Seuls les exposants
   se posent sur le plan ; les deux autres ne coûtent pourtant rien de plus —
   c'est la même page de la même requête, et eux n'ont aucune fiche à relire. */
const REQUETE_PROGRAMME = `query Programme($eventId: ID!, $id: ID!, $cursor: String) {
  publicViewer(eventId: $eventId) {
    program(id: $id) {
      sessions(after: $cursor) {
        edges { node {
          id
          exhibitors { id name companyName }
          speakers   { id name companyName position }
          moderators { id name companyName position }
        } }
        pageInfo { endCursor hasNextPage }
      }
    }
  }
}`;

/** Un appel au graphe qui ne jette pas : une erreur GraphQL est une réponse. */
async function grapheJson(
  requete: string,
  variables: Record<string, unknown>,
): Promise<any> {
  const r = await fetch(GRAPHE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: requete, variables }),
  });
  try {
    return JSON.parse(await r.text());
  } catch (_) {
    return { errors: [{ message: `Eventmaker /api/graphql : ${r.status}` }] };
  }
}

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
   * L'anglais des listes de valeurs de l'événement : valeur française →
   * valeur anglaise, toutes listes confondues.
   *
   * Eventmaker ne pose pas la traduction sur le champ : il la range à part,
   * dans les traductions de l'événement, sous une clé composée de
   * l'identifiant du champ et de la valeur réduite — minuscules, et chaque
   * suite de signes qui ne sont ni lettre ASCII ni chiffre remplacée par un
   * marqueur. « Bâtiment et habitat » y devient
   * `b…timent…et…habitat`. La règle se vérifie sur Franchise Expo Paris 2027 :
   * 23 secteurs sur 23, 118 sous-secteurs sur 119.
   *
   * Les fiches portent la valeur, et la liste son libellé ponctué — « Automobile
   * cycle moto », « Automobile, cycle, moto » — : les deux mènent à l'anglais.
   * Une valeur sans traduction n'y est pas, et reste en français.
   */
  async listesEnAnglais(id: string): Promise<Record<string, string>> {
    const [champs, traductions, themes] = await Promise.all([
      this.json<Record<string, any>[]>(`/events/${id}/guest_fields.json`, { per_page: 1000 }),
      this.json<Record<string, any>[]>(`/events/${id}/translations.json`),
      /* Les thématiques rangent les exposants sans être un champ : leur anglais
         est dans les mêmes traductions, sous un autre type de parent. */
      this.thematiques(id).catch(() => new Map<string, string>()),
    ]);
    const parChamp = new Map<string, Record<string, unknown>>();
    /* Une thématique porte son propre intitulé, et non une liste de valeurs :
       sa traduction tient dans une seule clé, composée de son identifiant. */
    const parTheme = new Map<string, string>();
    for (const t of traductions ?? []) {
      if (t?.locale !== "en") continue;
      const parent = String(t.translatable_parent_id);
      if (t?.translatable_parent_type === "GuestField") {
        parChamp.set(parent, { ...(parChamp.get(parent) ?? {}), ...(t.table ?? {}) });
      } else if (t?.translatable_parent_type === "Thematic") {
        parTheme.set(parent, String((t.table ?? {})[`${parent}__name`] ?? "").trim());
      }
    }
    const reduit = (v: unknown) =>
      String(v).toLowerCase().replace(/[^a-z0-9]+/g, "SPECIAL_HASH_KEY_CHARACTER");
    const out: Record<string, string> = {};
    for (const c of champs ?? []) {
      const table = parChamp.get(String(c._id));
      if (!table) continue;
      for (const v of (c.available_values ?? []) as Record<string, unknown>[]) {
        const en = table[`${c._id}__available_values__value__${reduit(v.value)}`];
        if (typeof en !== "string" || !en.trim()) continue;
        for (const fr of [v.value, v.label]) {
          const cle = String(fr ?? "").trim();
          // la première liste qui traduit une valeur l'emporte : deux listes
          // qui la partagent la traduisent d'ordinaire pareil
          if (cle && cle !== en.trim() && !(cle in out)) out[cle] = en.trim();
        }
      }
    }
    /* Après les listes de valeurs, et non avant : celles-ci sont le chemin
       ordinaire, et une thématique qui reprend une de leurs valeurs — sur
       Franchise Expo, les thématiques sont la nomenclature — n'a pas à
       reprendre la main sur sa traduction. */
    for (const [theme, en] of parTheme) {
      const fr = themes.get(theme);
      if (fr && en && fr !== en && !(fr in out)) out[fr] = en;
    }
    return out;
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
   * Les thématiques de l'événement, par identifiant.
   *
   * Elles ne sont pas un champ de fiche mais une ressource de l'événement, que
   * les fiches désignent par identifiant. Sans ce catalogue, `thematic_ids` ne
   * porte que des `69bd1a54db9dabf30d7e3ca7` : illisibles sur une fiche, et
   * impossibles à reconnaître dans la liste des champs de la console.
   *
   * Un salon en range parfois deux cents — Eurocoat en a 232, Franchise Expo
   * 133 — et rien ne garantit qu'une page suffise : on pagine comme partout
   * ailleurs. Un salon qui n'en tient aucune rend une liste vide, et c'est son
   * état normal, pas une panne.
   */
  async thematiques(id: string): Promise<Map<string, string>> {
    const out = new Map<string, string>();
    for (let page = 1; ; page++) {
      const l = await this.json<Record<string, any>[]>(
        `/events/${id}/thematics.json`,
        { per_page: PAR_PAGE, page },
      );
      for (const t of l) {
        const nom = String(t.name ?? t.localized_name ?? "").trim();
        if (nom) out.set(String(t._id), nom);
      }
      if (l.length < PAR_PAGE) return out;
    }
  }

  /**
   * Remplace sur une fiche les identifiants de thématiques par leurs noms.
   *
   * En place, et avant toute lecture : le relevé comme la cible lisent la fiche
   * telle qu'elle se présente, et c'est le seul endroit où le catalogue est
   * sous la main. Les noms se joignent par un point-virgule, comme Eventmaker
   * joint partout ailleurs les valeurs d'un champ à choix multiple — la règle
   * commune les sépare ensuite sans rien savoir d'ici.
   *
   * Une thématique que le catalogue ne nomme pas est laissée de côté plutôt que
   * rendue par son identifiant : un identifiant sur une fiche publique ne dit
   * rien à personne.
   *
   * La liste reste une liste : c'est `lit` qui sépare les cibles multiples, et
   * il garde les entrées d'un tableau entières. Les joindre ici pour les
   * recouper là-bas aurait coupé en deux une thématique portant un
   * point-virgule dans son nom.
   */
  private nommeThematiques(g: Record<string, any>, noms: Map<string, string>): void {
    const ids = g[CHAMP_THEMATIQUES];
    if (!Array.isArray(ids)) return;
    g[CHAMP_THEMATIQUES] = ids
      .map((i) => noms.get(String(i)))
      .filter((n): n is string => Boolean(n));
  }

  /**
   * Lit une cible sur une fiche, d'après la correspondance réglée pour
   * l'événement. Les champs personnalisés arrivent aplatis dans `m`, les champs
   * natifs de l'invité restent sur `g` et se désignent « invite: ».
   */
  private valeur(
    g: Record<string, any>,
    m: Record<string, string>,
    cible: string,
    multiple = false,
  ): unknown {
    const liste = this.cfg.champs?.[cible] ?? DEFAUTS.eventmaker[cible] ?? [];
    return lit(liste, { "": m, invite: g }, multiple);
  }

  /** Une cible multiple, déjà séparée en valeurs par `lit`. */
  private multiple(
    g: Record<string, any>,
    m: Record<string, string>,
    cible: string,
  ): string[] {
    return this.valeur(g, m, cible, true) as string[];
  }

  /**
   * Les champs que le salon s'est ajoutés, lus sur une fiche.
   *
   * Rien d'automatique ici : un champ personnalisé n'a pas de défaut — il
   * n'existe que parce qu'un exploitant l'a créé et lui a désigné une origine.
   * Sans origine désignée, il ne descend pas.
   */
  private perso(
    g: Record<string, any>,
    m: Record<string, string>,
  ): Record<string, string | string[]> {
    const out: Record<string, string | string[]> = {};
    for (const c of this.cfg.perso ?? []) {
      const v = valeurPerso(this.valeur(g, m, PREFIXE_PERSO + c.cle, Boolean(c.multiple)));
      if (v !== null) out[c.cle] = v;
    }
    return out;
  }

  /**
   * Numéro de stand d'une fiche, sous sa forme normalisée.
   *
   * Un seul champ fait foi, celui que désigne la correspondance — « NUM stand »
   * par défaut. D'autres lui ressemblent : booth_number_ezymob, alimenté pour
   * le site public, et stand_number, natif d'Eventmaker mais vide ici. Ajouter
   * un repli reviendrait à faire entrer sur le plan des fiches que l'exploitant
   * n'y a pas mises ; c'est à lui de désigner le bon champ.
   */
  private stand(g: Record<string, any>, m: Record<string, string>): string {
    return cleStand(this.valeur(g, m, "stand"));
  }

  /** L'identifiant du dossier Klipso, recopié par Eventmaker sur la fiche. */
  private dossier(g: Record<string, any>, m: Record<string, string>): string {
    return String(this.valeur(g, m, "dossier") ?? "").trim();
  }

  /* Une fiche désigne un exposant si elle porte l'un ou l'autre : les deux
     manquent rarement ensemble, mais ni l'un ni l'autre n'est toujours là. */
  private exposant(g: Record<string, any>, m: Record<string, string>): boolean {
    return Boolean(this.stand(g, m) || this.dossier(g, m));
  }

  /**
   * Catégories dont les fiches désignent des exposants.
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
   * ne dit qu'elles contiennent « exposant » dans leur intitulé : c'est ce que
   * portent leurs fiches qui décide, pas le libellé — un numéro de stand, ou un
   * identifiant de dossier.
   *
   * Une limite à connaître : la première voie cherche des numéros de stand, et
   * ne peut donc pas révéler une catégorie qui n'en porterait aucun tout en
   * ayant des dossiers. Le second recours, lui, la voit. Sinon l'exploitant la
   * désigne une fois depuis la console, et elle est mémorisée.
   */
  async categoriesExposants(
    id: string,
    connues: string[] = [],
    codes: string[] = [],
  ): Promise<{
    retenues: { _id: string; name: string }[];
    /* Toutes les catégories de l'événement, retenues ou non : c'est parmi
       elles que la console fait désigner celles des exposants, et elle n'a
       aucun autre moyen de les connaître. */
    catalogue: { id: string; nom: string }[];
    appels: number;
    voie: string;
  }> {
    const cats = await this.categories(id);
    const parId = new Map(cats.map((c) => [c._id, c]));
    const catalogue = cats.map((c) => ({ id: c._id, nom: c.name }));

    /* --- le choix de l'exploitant, quand il en a fait un ---

       Il passe avant tout le reste, et sans un appel de plus : ce que la
       détection cherche à deviner, il vient de le dire. Une catégorie qu'il
       désigne est retenue même si aucune des fiches sondées ne porte de
       numéro — c'est justement le cas que la détection ne sait pas voir. */
    const voulues = (this.cfg.categories ?? []).filter((c) => parId.has(c));
    if (voulues.length) {
      return {
        retenues: voulues.map((c) => parId.get(c)!),
        catalogue,
        appels: 1,
        voie: "catégories désignées",
      };
    }

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
        return l.filter((g) => this.exposant(g, champs(g.guest_metadata)))
          .map((g) => String(g.guest_category_id));
      });
      appels += echantillon.length;
      trouves.flat().forEach((c) => { if (parId.has(c)) trouvees.add(c); });
      if (trouvees.size) {
        return {
          retenues: [...trouvees].map((c) => parId.get(c)!),
          catalogue,
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
      return { c, avec: l.filter((g) => this.exposant(g, champs(g.guest_metadata))).length };
    });
    appels += aSonder.length;
    sondes.filter((s) => s.avec).forEach((s) => trouvees.add(s.c._id));

    return {
      retenues: [...trouvees].map((c) => parId.get(c)!),
      catalogue,
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
   * Qui tient une conférence, par identifiant de session.
   *
   * Le graphe range sous chaque session trois rôles — intervenants, animateurs,
   * exposants — et les trois viennent du même appel. Seul le troisième se pose
   * sur le plan : c'est le seul dont les fiches portent un numéro de stand, et
   * il se paie d'une relecture REST par personne citée. Les deux autres nomment
   * des conférenciers, qui n'ont pas de stand à eux ; le graphe dit d'eux tout
   * ce que la fiche affichera, si bien qu'ils ne coûtent rien de plus.
   *
   * Le dossier n'est pas dans le graphe : l'exposant y vient avec l'identifiant
   * de sa fiche d'invité, qu'on relit en REST. Une fiche par exposant cité,
   * soit une cinquantaine sur un salon comme Franchise Expo — et rien du tout
   * sur un salon qui laisse le rôle vide, ce qui est fréquent.
   */
  async rolesParConference(id: string): Promise<{
    exposants: Map<string, ExposantConfEm[]>;
    intervenants: Map<string, IntervenantEm[]>;
    animateurs: Map<string, IntervenantEm[]>;
  }> {
    const programmes = await this.json<Record<string, any>[]>(
      `/events/${id}/programs.json`,
      { per_page: PAR_PAGE, page: 1 },
    );

    /* Un salon range souvent ses sessions dans plusieurs programmes — un
       complet, des thématiques qui y puisent : on dédoublonne par session. */
    const citesParSession = new Map<string, Map<string, string | null>>();
    const parlent = new Map<string, Map<string, IntervenantEm>>();
    const animent = new Map<string, Map<string, IntervenantEm>>();

    /* Indexé par fiche, pour la même raison : une session que deux programmes
       portent citerait deux fois les mêmes personnes. */
    const retiens = (
      table: Map<string, Map<string, IntervenantEm>>,
      session: string,
      cites: Record<string, unknown>[] | undefined,
    ) => {
      if (!cites?.length) return;
      const m = table.get(session) ?? new Map<string, IntervenantEm>();
      for (const g of cites) {
        const nom = ou(g.name);
        // sans nom, il n'y a rien à afficher — et l'afficher est tout l'usage
        if (nom) {
          m.set(String(g.id), {
            nom,
            societe: ou(g.companyName),
            fonction: ou(g.position),
          });
        }
      }
      if (m.size) table.set(session, m);
    };

    for (const p of programmes) {
      for (let curseur: string | null = null;;) {
        const r = await grapheJson(REQUETE_PROGRAMME, {
          eventId: id,
          id: String(p._id),
          cursor: curseur,
        });
        const bloc = r?.data?.publicViewer?.program?.sessions;
        // un programme peut être vide, ou refusé : ce n'est pas une panne
        if (!bloc) break;
        for (const { node } of bloc.edges ?? []) {
          if (!node) continue;
          const session = String(node.id);
          retiens(parlent, session, node.speakers);
          retiens(animent, session, node.moderators);
          if (!node.exhibitors?.length) continue;
          const cites = citesParSession.get(session) ?? new Map();
          for (const g of node.exhibitors) cites.set(String(g.id), g.companyName ?? g.name ?? null);
          citesParSession.set(session, cites);
        }
        if (!bloc.pageInfo?.hasNextPage) break;
        curseur = bloc.pageInfo.endCursor;
      }
    }
    const listes = (t: Map<string, Map<string, IntervenantEm>>) =>
      new Map<string, IntervenantEm[]>(
        [...t].map(([session, m]) => [session, [...m.values()]] as [string, IntervenantEm[]]),
      );
    const intervenants = listes(parlent), animateurs = listes(animent);
    /* Un salon nomme souvent ses conférenciers sans jamais renseigner le rôle
       « Exposants » : on rend alors ce qu'on a, et on s'épargne des relectures
       REST qui n'ont plus d'objet. */
    if (!citesParSession.size) return { exposants: new Map(), intervenants, animateurs };

    /* Une fiche par exposant cité, quel que soit le nombre de sessions qu'il
       tient. On ne filtre pas sur l'inscription : ce qu'on publie ici désigne
       une société déjà présente au catalogue, pas la personne qui porte le
       badge. */
    const ids = [...new Set([...citesParSession.values()].flatMap((m) => [...m.keys()]))];
    const dossiers = new Map(await enParallele(ids, DE_FRONT, async (gid) => {
      try {
        const g = await this.json<Record<string, any>>(
          `/events/${id}/guests/${gid}.json`,
          { guest_metadata: "true" },
        );
        return [gid, this.dossier(g, champs(g.guest_metadata))] as [string, string];
      } catch (_) {
        return [gid, ""] as [string, string];
      }
    }));

    const out = new Map<string, ExposantConfEm[]>();
    for (const [session, cites] of citesParSession) {
      const l: ExposantConfEm[] = [];
      for (const [gid, nom] of cites) {
        const dossier = dossiers.get(gid);
        // deux badges d'une même enseigne citent le même dossier : une fois suffit
        if (dossier && !l.some((x) => x.dossier === dossier)) l.push({ dossier, nom: ou(nom) });
      }
      if (l.length) out.set(session, l);
    }
    return { exposants: out, intervenants, animateurs };
  }

  /**
   * Exposants, indexés deux fois : par dossier, et par numéro de stand.
   *
   * Le dossier est la bonne clé — Klipso le porte sur le stand, Eventmaker le
   * recopie —, mais aucune des deux ne couvre tout : sur Franchise Expo, une
   * catégorie d'exposants n'a que des dossiers, une autre que des numéros. On
   * rend donc les deux index, à charge pour l'appelant d'essayer le dossier
   * d'abord.
   *
   * Deux règles pour retenir une fiche, et rien d'autre : elle désigne un
   * exposant, et son inscription est effective. Le reste n'est que le moyen d'y
   * arriver sans télécharger le salon entier.
   */
  async exposants(
    id: string,
    connues: string[] = [],
    codes: string[] = [],
    /* Combien de fiches ont été lues jusqu'ici. Rendu page par page et non à
       la fin : la lecture dure une demi-minute sur un gros salon, et c'est
       elle qui fait attendre — une barre qui ne bouge pas pendant ce temps se
       lit comme une panne. Le total, lui, reste inconnu : on ne sait qu'une
       catégorie est épuisée qu'en recevant une page plus courte que les
       autres. */
    surAvance?: (lus: number) => void,
  ): Promise<{
    parDossier: Map<string, ExposantEm>;
    parStand: Map<string, ExposantEm>;
    tousParStand: Map<string, ExposantEm[]>;
    categories: string[];
    categoriesIds: string[];
    /* Toutes les catégories de l'événement, pour que la console fasse désigner
       celles des exposants sans avoir à les redemander à l'API. */
    catalogue: { id: string; nom: string }[];
    appels: number;
    voie: string;
    lus: number;
    retenus: number;
    ecartesNonInscrits: number;
    champs: { cle: string; libelle: string; groupe: string; exemple: string;
               valeurs: string[]; libre?: boolean }[];
  }> {
    const parDossier = new Map<string, ExposantEm>();
    const parStand = new Map<string, ExposantEm>();
    /* Toutes les fiches qui se réclament d'un même stand, celles du titulaire
       et de ses hébergés mêlées : c'est la synchronisation qui les départage,
       elle seule sachant quel dossier le stand porte côté Klipso. */
    const tousParStand = new Map<string, ExposantEm[]>();
    /* Le catalogue des thématiques se charge de front avec les catégories : il
       ne dépend pas d'elles, et la lecture des fiches attend les deux. */
    const [{ retenues: cats, catalogue, appels, voie }, themes] = await Promise.all([
      this.categoriesExposants(id, connues, codes),
      /* Un salon sans thématiques est le cas courant : son catalogue est vide,
         et une panne de cet appel-là n'a pas à emporter la synchronisation
         entière — les exposants, eux, sont bien là. */
      this.thematiques(id).catch((e) => {
        console.error("catalogue des thématiques :", e);
        return new Map<string, string>();
      }),
    ]);
    let lus = 0, ecartesNonInscrits = 0;
    const releve = new Releve();

    // Les catégories sont indépendantes : on les lit de front. À l'intérieur,
    // les pages restent séquentielles — on ne sait pas combien il y en a
    // avant d'en recevoir une plus courte que les autres.
    let recues = 0;
    const paquets = await enParallele(cats, DE_FRONT, async (cat) => {
      const tout: Record<string, any>[] = [];
      for (let page = 1; ; page++) {
        const l = await this.json<Record<string, any>[]>(
          `/events/${id}/guests.json`,
          { per_page: PAR_PAGE, page, guest_metadata: "true", "category[]": cat._id },
        );
        tout.push(...l);
        recues += l.length;
        surAvance?.(recues);
        if (l.length < PAR_PAGE) return tout;
      }
    });

    for (const g of paquets.flat()) {
      lus++;
      this.nommeThematiques(g, themes);
      const m = champs(g.guest_metadata);
      const stand = this.stand(g, m);
      const dossier = this.dossier(g, m);
      /* Relevé avant le tri sur le statut — une fiche en attente porte les
         mêmes champs qu'une fiche inscrite — mais en disant si elle désigne
         un exposant : une catégorie d'exposants n'en contient pas que, et ce
         sont les valeurs des exposants qu'on veut montrer. */
      releve.ajoute(g, m, Boolean(stand || dossier));
      if (!stand && !dossier) continue;
      if (String(g.status ?? "") !== INSCRIT) { ecartesNonInscrits++; continue; }
      const v = (cible: string) => ou(this.valeur(g, m, cible));
      const fiche: ExposantEm = {
        stand,
        dossier,
        nom: v("nom"),
        raison: v("raison"),
        logo: imageDistante(this.valeur(g, m, "logo")),
        site: v("site"),
        adresse: v("adresse"),
        // le code postal n'a pas de ligne à lui sur la fiche : il se pose
        // devant la ville, comme sur une enveloppe
        cp: v("codePostal"),
        ville: v("ville"),
        pays: v("pays"),
        tel: v("telephone"),
        facebook: v("facebook"),
        linkedin: v("linkedin"),
        instagram: v("instagram"),
        /* Une cible multiple ne descend pas en liste : Eventmaker joint ses
           valeurs par un point-virgule — « SIDO26_NOM101;SIDO26_NOM102 » —, et
           c'est la règle commune à tous les champs à choix qui la défait. */
        nomencl: this.multiple(g, m, "nomenclature"),
        themes: this.multiple(g, m, "thematiques"),
        perso: this.perso(g, m),
        neuf: vrai(this.valeur(g, m, "nouveau"), this.cfg.valeurs?.nouveau),
        exclu: vrai(this.valeur(g, m, "exclu"), this.cfg.valeurs?.exclu),
      };
      /* Le stand de l'hôte, tel que la fiche le porte. Par défaut c'est son
         propre numéro : sur un stand partagé, toutes les fiches tombent donc
         dans le même seau, titulaire compris. */
      const hote = cleStand(this.valeur(g, m, "coexposant"));
      if (hote) {
        const l = tousParStand.get(hote);
        if (l) l.push(fiche);
        else tousParStand.set(hote, [fiche]);
      }
      /* Premier arrivé, premier servi — mais index par index, et c'est tout
         le sujet. Les faire renoncer ensemble revenait à retirer le titulaire
         de l'index des dossiers dès qu'un de ses hébergés avait pris son
         numéro avant lui : son dossier ne désignait plus personne, et le stand
         se retrouvait au nom d'un co-exposant. Un dossier n'appartient qu'à
         une société, il a toujours sa place ici. */
      if (dossier && !parDossier.has(dossier)) parDossier.set(dossier, fiche);
      if (stand && !parStand.has(stand)) parStand.set(stand, fiche);
    }
    return {
      parDossier,
      parStand,
      tousParStand,
      categories: cats.map((c) => c.name),
      categoriesIds: cats.map((c) => c._id),
      catalogue,
      appels,
      voie,
      lus,
      retenus: new Set([...parStand.values(), ...parDossier.values()]).size,
      ecartesNonInscrits,
      champs: lus ? releve.liste() : await this.champsAuHasard(id, releve, themes),
    };
  }

  /**
   * Les champs de quelques fiches, prises sans distinction de catégorie.
   *
   * Le repli du repli. Reconnaître un exposant demande de savoir quel champ
   * porte son numéro de stand ; si ce champ est mal désigné, aucune catégorie
   * n'est retenue, aucune fiche n'est lue — et l'exploitant se retrouve devant
   * une correspondance qu'il ne peut pas corriger, faute de liste. On lit donc
   * quelques fiches au hasard, juste pour savoir ce qu'une fiche porte ici.
   */
  private async champsAuHasard(id: string, releve: Releve, themes: Map<string, string>) {
    try {
      const cats = (await this.categories(id)).slice(0, DE_FRONT);
      const paquets = await enParallele(cats, DE_FRONT, (c) =>
        this.json<Record<string, any>[]>(
          `/events/${id}/guests.json`,
          { per_page: ECHANTILLON, page: 1, guest_metadata: "true", "category[]": c._id },
        ));
      for (const g of paquets.flat()) {
        this.nommeThematiques(g, themes);
        const m = champs(g.guest_metadata);
        releve.ajoute(g, m, this.exposant(g, m));
      }
    } catch (e) {
      console.error("relevé des champs sans catégorie d'exposants :", e);
    }
    return releve.liste();
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

/**
 * Le relevé des champs qu'une fiche porte.
 *
 * L'API ne publie pas la liste des champs personnalisés d'un événement — elle
 * ne les rend qu'attachés à une fiche. On les relève donc en lisant les fiches
 * qu'on lit de toute façon, avec un exemple de valeur : c'est lui qui fait
 * reconnaître un champ dont le nom ne dit rien.
 *
 * Premier exemple rencontré, pas le dernier : les fiches viennent dans l'ordre
 * de l'API, et une valeur du début de liste se retrouve plus vite. Un champ
 * vide sur toutes les fiches lues n'apparaît pas — le proposer ferait perdre
 * du temps.
 *
 * Premier exemple **d'exposant**, cependant, et c'est tout le sujet. Une
 * catégorie d'exposants ne contient pas que des exposants : « EXPOSANT (raison
 * sociale) » de Moove On mêle 51 fiches de société et 36 fiches de personnes,
 * et l'API rend une personne en deuxième position. Le champ natif `uid` y vaut
 * l'identifiant Klipso sur une société — `60f5bfeb-a764-…` — et un code court
 * sur une personne — `CLALKZK` ; la console proposait le second, l'exploitant
 * désignait le champ en le croyant porteur du premier, et le rattachement ne
 * trouvait personne. Un exemple qui ne vient pas d'un exposant décrit un champ
 * que la fiche n'affichera jamais.
 *
 * Dès qu'un exposant renseigne un champ, il reprend donc le relevé de ce champ
 * à zéro et les fiches qui n'en sont pas cessent d'y compter. Un champ
 * qu'aucun exposant ne porte disparaît de la liste — sauf s'il n'y avait aucun
 * exposant à lire, auquel cas tout est gardé : c'est le seul état où
 * l'exploitant ait besoin de voir les autres fiches, puisque c'est de là qu'il
 * corrigera le réglage qui n'en reconnaissait aucune.
 */
class Releve {
  private vus = new Map<
    string,
    {
      cle: string; libelle: string; groupe: string; exemple: string;
      /* Un compte et non une liste : c'est la répétition des valeurs qui dira
         si le champ range les fiches ou s'il porte du texte libre. */
      compte: Map<string, number>;
      /** Ce relevé-ci vient-il d'une fiche d'exposant ? */
      sur: boolean;
    }
  >();

  /** Une fiche de plus, et si elle désigne un exposant. */
  ajoute(g: Record<string, any>, m: Record<string, string>, exposant: boolean): void {
    for (const [k, v] of Object.entries(g)) {
      /* Les thématiques sont la seule liste qu'une fiche affiche : les autres
         valeurs composées sont des objets imbriqués — quotas, badges, suivi
         commercial — qui n'ont rien à faire sur une fiche détail. Et seul
         champ natif dont le nom ne dit pas ce qu'il porte, puisqu'il annonce
         des identifiants là où on a posé des noms. */
      if (k === CHAMP_THEMATIQUES) {
        this.note("invite:" + k, LIBELLE_THEMATIQUES, GROUPES[1], v, exposant);
        continue;
      }
      if (v && typeof v === "object") continue;
      if (/^_|(^|_)id$|_at$/.test(k)) continue;
      this.note("invite:" + k, k, GROUPES[1], v, exposant);
    }
    for (const [k, v] of Object.entries(m)) this.note(k, k, GROUPES[0], v, exposant);
  }

  private note(
    cle: string,
    libelle: string,
    groupe: string,
    valeur: unknown,
    exposant: boolean,
  ): void {
    /* Une liste se montre comme on la lit — « Après-Vente, Commerce » — et non
       jointe par le point-virgule d'un champ à choix multiple : ce
       point-virgule-là est dans la source, celui-ci n'y serait pas, et
       l'exemple sert justement à faire reconnaître ce que la fiche porte. */
    const ex = Array.isArray(valeur)
      ? valeur.map((x) => String(x ?? "").trim()).filter(Boolean).join(", ")
      : String(valeur ?? "").trim();
    if (!ex) return;
    const court = ex.length > 60 ? ex.slice(0, 57) + "…" : ex;
    let d = this.vus.get(cle);
    if (!d) {
      d = { cle, libelle, groupe, exemple: court, compte: new Map(), sur: exposant };
      this.vus.set(cle, d);
    } else if (exposant && !d.sur) {
      // le premier exposant efface ce que les autres fiches avaient relevé :
      // leurs valeurs décrivaient un autre champ que celui-ci
      d.sur = true;
      d.exemple = court;
      d.compte = new Map();
    } else if (d.sur && !exposant) {
      return;
    }
    /* Les valeurs distinctes, et pas seulement la première : c'est à elles
       qu'on reconnaît un champ à choix — « Nouveau Client », « Client N-1 »,
       « Retour » — et c'est parmi elles que l'exploitant désignera celles qui
       déclenchent. */
    noteValeurs(d.compte, valeur);
  }

  /* Les champs personnalisés en tête : ce sont les seuls que l'organisateur
     nomme, donc les seuls qui diffèrent d'un salon à l'autre. Les champs
     natifs de la fiche d'invité, eux, sont les mêmes partout. */
  liste() {
    /* Un champ de texte libre lâche sa liste plutôt que d'en proposer un
       échantillon arbitraire — mais il le dit, sans quoi la console l'annonce
       comme un relevé muet et fait attendre une synchronisation qui ne
       relèverait pas davantage. */
    /* Un seul exposant lu suffit à ne plus montrer que ce que les exposants
       portent : `region`, `jour_de_visite` ou `adherent_de_mobilians` sont des
       champs de visiteur, et les proposer sur une fiche d'exposant n'a jamais
       fait que des réglages qui ne rendent rien. Aucun exposant lu, en
       revanche, et tout est gardé : c'est le relevé du dernier recours. */
    const desExposants = [...this.vus.values()].some((d) => d.sur);
    return [...this.vus.values()]
      .filter((d) => !desExposants || d.sur)
      .map(({ compte, sur: _sur, ...d }) => {
        const { valeurs, libre } = valeursRelevees(compte);
        return libre ? { ...d, valeurs, libre } : { ...d, valeurs };
      }).sort((a, b) =>
        GROUPES.indexOf(a.groupe) - GROUPES.indexOf(b.groupe) ||
        a.cle.localeCompare(b.cle, "fr"));
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
