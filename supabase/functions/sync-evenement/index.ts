/**
 * Synchronisation d'un événement depuis Klipso.
 *
 *   { evenementId }  → synchronisation complète.
 *
 * Un seul usage, et c'est voulu. Il en existait un second — « action: plans »
 * — qui interrogeait Klipso pour une instance et un identifiant d'événement
 * donnés dans la requête, sans les rapporter à aucun salon de la base : la
 * fonction prêtait alors la clé Klipso de l'exploitant à qui la lui demandait,
 * et rendait les pavillons d'un salon dont l'appelant n'avait pas à connaître
 * l'existence. La console ne s'en servait plus.
 *
 * L'événement à synchroniser est donc toujours un salon de la base, et le
 * droit de l'appelant sur ce salon se vérifie avant tout appel sortant.
 *
 * La clé Klipso vient des secrets de la fonction. Elle ne transite ni par la
 * requête, ni par la base, ni par le navigateur.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { Gaia, egal } from "../_partage/gaia.ts";
import {
  Eventmaker, cleStand, codeSalle,
  type ExposantEm, type ConferenceEm, type ExposantConfEm,
} from "../_partage/eventmaker.ts";
import {
  CHOIX_MAX, DEFAUTS, PREFIXE_PERSO, champs as champsCible, champsPerso, cibles,
  decoupe, imageDistante, lit, noteValeurs, ou, valeursOui, valeurPerso, vrai,
  valeursRelevees,
} from "../_partage/champs.ts";
import { versAnneaux, versTrace, boite, emprise, dedans } from "../_partage/geometrie.ts";
import { allege, textes } from "../_partage/svg.ts";

/** Origines autorisées. Complétées par la variable ORIGINES_AUTORISEES —
 *  une liste séparée par des virgules — pour qu'un changement de domaine ne
 *  demande pas de modification de code. */
const ORIGINES = [
  ...(Deno.env.get("ORIGINES_AUTORISEES") ?? "")
    .split(",").map((s) => s.trim()).filter(Boolean),
  "https://plan-interactif.interactiveplan.workers.dev",
  "http://localhost:4180",
];
const cors = (req: Request) => {
  const o = req.headers.get("Origin") ?? "";
  return {
    "Access-Control-Allow-Origin": ORIGINES.includes(o) ? o : ORIGINES[0],
    "Access-Control-Allow-Headers": "authorization, content-type, apikey",
    "Vary": "Origin",
  };
};
const METHODES = { "Access-Control-Allow-Methods": "POST, OPTIONS" };

const NOMS: Record<string, string> = {
  "Batiment": "Bâtiment",
  "INFOPRO_SURFACE_POTEAUX": "Poteaux",
  "INFOPRO_SECTEURS_DELIMITATION": "Délimitation des secteurs",
  "INFOPRO_SECTEURS_DELIMITATIONS": "Délimitation des secteurs",
  "INFOPRO_FIL_JAUNE": "Fil jaune",
  "INFOPRO_COTES_ALLEES": "Cotes des allées",
  "INFOPRO_COTES_ILOTS": "Cotes des îlots",
  "INFOPRO_LETTRE_ALLEE": "Lettres d'allée",
  "INFOPRO_NUMEROTATION_STAND_VALIDEE": "Numérotation des stands",
  "INFOPRO_TEXTE_ZONES_ORGA": "Textes des zones organisateur",
  "INFOPRO_NOM_ZONE_IG": "Noms des zones IG",
  "INFOPRO_ZONE_NON_ELINGUABLE": "Zones non élingables",
};

/* Le secteur commercial de l'emplacement. GAIA le nomme pareil sur tous les
   salons — c'est une propriété standard du stand, et non un champ de dossier
   que chaque organisateur baptiserait à sa façon : il n'y a donc rien à régler
   pour lui, ni ici ni dans la console. */
const CHAMP_SECTEUR = "SecteurExp";

// Les calques de texte que le rendu recalcule lui-même : conservés, mais c'est
// d'eux qu'on tire les noms de zones tant que x_LibZOD n'est pas renseigné.
const CALQUES_TEXTE = ["INFOPRO_TEXTE_ZONES_ORGA", "INFOPRO_NOM_ZONE_IG"];

// Annotations techniques posées sur le plan : ce ne sont pas des noms de zone.
const TECHNIQUE = /\bkW\b|Hauteur \d|Coffret|Mur inclinable/i;

const client = () =>
  createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

const gaia = (instance: string, eventId?: string) =>
  new Gaia({ instance, apiKey: Deno.env.get("KLIPSO_API_KEY") ?? "", eventId });

/**
 * Les libellés d'un champ « choix », et de quoi dire pourquoi il n'y en a pas.
 *
 * L'échec n'est pas bloquant : sans libellé le plan reste juste, avec des
 * codes. Perdre une synchronisation entière pour un défaut d'habillage serait
 * disproportionné — d'où l'erreur rendue plutôt que jetée, et remontée dans le
 * compte rendu.
 */
async function libellesChoix(g: Gaia, entite: string, champ: string): Promise<{
  libelles: Record<string, string>;
  chemin: string | null;
  erreur: string | null;
}> {
  if (!champ) return { libelles: {}, chemin: null, erreur: null };
  try {
    const chemin = await g.cheminCodification(entite, champ);
    return { libelles: await g.codification(chemin), chemin, erreur: null };
  } catch (e) {
    return {
      libelles: {},
      chemin: null,
      erreur: e instanceof Error ? e.message : String(e),
    };
  }
}

/* Un domaine que rien ne reprend vaut mieux « aucun » qu'un fournisseur choisi
   par défaut : celui-ci laisserait croire à une reprise qui n'a pas lieu. */
const DEFAUT: Record<string, string> = {
  plan: "klipso", stands: "klipso", conferences: "aucun", produits: "aucun",
};

/** Fournisseur retenu pour un domaine. */
const fournisseur = (evt: Record<string, any>, domaine: string) =>
  String((evt.sources ?? {})[domaine]?.fournisseur || DEFAUT[domaine] || "klipso");

/* Vingt-cinq fiches suffisent à savoir quels champs un salon renseigne
   réellement : au-delà on relit les mêmes. */
const ECHANTILLON = 25;

/** Une valeur qu'on peut montrer en exemple : ni objet, ni vide. */
const exemple = (v: unknown): string | null => {
  if (v === null || v === undefined || typeof v === "object") return null;
  const t = String(v).trim();
  return t ? (t.length > 60 ? t.slice(0, 57) + "…" : t) : null;
};

/* Les champs standard sont les mêmes d'un salon à l'autre ; ce sont les
   personnalisés qui diffèrent, et Klipso les préfixe « x_ » précisément pour
   le dire. Séparer les deux dans la liste, c'est montrer d'emblée où se joue
   le réglage. */
const GROUPES_KLIPSO = [
  "Dossier exposant · champ personnalisé",
  "Dossier exposant · champ standard",
  "Emplacement · champ personnalisé",
  "Emplacement · champ standard",
];
const groupeKlipso = (cle: string): string => {
  const stand = cle.startsWith("stand:");
  const perso = /(^|:)x_/.test(cle);
  return (stand ? "Emplacement" : "Dossier exposant") +
    (perso ? " · champ personnalisé" : " · champ standard");
};

/**
 * Range les champs détectés : par groupe d'abord — les personnalisés en tête,
 * ce sont eux qu'on vient régler — puis les renseignés avant les vides, et
 * l'ordre alphabétique pour finir, qui les rend trouvables.
 */
function range(liste: Record<string, unknown>[], ordre: string[]) {
  const rang = (g: unknown) => {
    const i = ordre.indexOf(String(g));
    return i < 0 ? ordre.length : i;
  };
  return liste.sort((a, b) =>
    rang(a.groupe) - rang(b.groupe) ||
    Number(Boolean(b.exemple)) - Number(Boolean(a.exemple)) ||
    String(a.cle).localeCompare(String(b.cle), "fr"));
}

/**
 * Les champs d'exposant que porte un événement Klipso.
 *
 * Deux sources, et il faut les deux : le schéma déclare tout ce qui existe et
 * en donne le libellé français, mais ne dit pas ce qui est rempli ; un
 * échantillon de fiches dit ce qui est rempli, mais n'a pas de libellé. On les
 * réunit, et l'exemple de valeur tranche mieux qu'un nom de propriété —
 * « x_Catalogue_RaisonSociale » et « x_Catalogue_Enseigne » ne se distinguent
 * que par ce qu'elles contiennent.
 */
async function champsKlipso(g: Gaia) {
  const groupes: [string, string][] = [
    // l'entité du dossier ne porte pas le même nom d'une instance à l'autre :
    // on demande les deux et on garde ce qui répond
    ["DossierExpAff", ""],
    ["DossierExp", ""],
    ["Stand", "stand:"],
  ];
  const vus = new Map<string, Record<string, unknown>>();
  /* Les valeurs comptées à part : c'est leur répétition qui distinguera une
     liste de choix d'un champ de texte libre, et le relevé ne garde que le
     verdict. */
  const comptes = new Map<string, Map<string, number>>();
  /* Les champs à choix, rangés par la codification qu'ils déclarent — c'est
     par elle qu'on saura tout ce qu'ils peuvent valoir. Plusieurs champs
     partagent parfois la même, d'où la liste de clés. */
  const aCodifier = new Map<string, Map<string, string[]>>();
  for (const [entite, prefixe] of groupes) {
    let props: {
      cle: string; libelle: string; codification: string | null;
    }[] = [];
    try { props = await g.proprietes(entite); } catch (_) { /* schéma muet */ }
    for (const p of props) {
      const cle = prefixe + p.cle;
      if (vus.has(cle)) continue;
      vus.set(cle, {
        cle, libelle: p.libelle, groupe: groupeKlipso(cle), exemple: null,
        valeurs: [] as string[],
      });
      const point = (p.codification ?? "").indexOf(".");
      if (point < 0) continue;
      const ent = p.codification!.slice(0, point);
      const prop = p.codification!.slice(point + 1);
      const parProp = aCodifier.get(ent) ?? new Map<string, string[]>();
      parProp.set(prop, [...(parProp.get(prop) ?? []), cle]);
      aCodifier.set(ent, parProp);
    }
  }

  /* Ce que les fiches portent vraiment. L'échec n'est pas bloquant : sans
     exemples la liste reste utilisable, seulement moins parlante. */
  try {
    const { data } = await g.entite({
      Stand: {
        fields: ["_AllFields"],
        entities: { RefDossierExpAff: { fields: ["_AllFields"] } },
        start: 1,
        take: ECHANTILLON,
        order: [{ fieldPath: "Id", direction: "asc" }],
      },
    });
    for (const brut of data as Record<string, any>[]) {
      const paires: [string, unknown][] = [
        ...Object.entries(brut.RefDossierExpAff ?? {}),
        ...Object.entries(brut).map(([k, v]) => ["stand:" + k, v] as [string, unknown]),
      ];
      for (const [cle, v] of paires) {
        const ex = exemple(v);
        if (!ex) continue;
        const e = vus.get(cle) ?? {
          cle,
          libelle: cle.startsWith("stand:") ? cle.slice(6) : cle,
          groupe: groupeKlipso(cle),
          exemple: null as string | null,
          valeurs: [] as string[],
        };
        if (!e.exemple) e.exemple = ex;
        /* Les valeurs distinctes disent si le champ est une liste de choix.
           C'est parmi elles que l'exploitant désignera celles qui déclenchent
           « Nouvel exposant » ou « Exclu de la liste ». Elles se relèvent sur
           la valeur brute, et non sur l'exemple : celui-ci est tronqué, et un
           champ à choix multiple y perdrait ses dernières valeurs. */
        const compte = comptes.get(cle) ?? new Map<string, number>();
        noteValeurs(compte, v);
        comptes.set(cle, compte);
        vus.set(cle, e);
      }
    }
  } catch (_) { /* l'échantillon manque, le schéma suffit */ }

  /* Le verdict, champ par champ : sa liste de valeurs, ou le fait qu'il est du
     texte libre — ce que la console dit autrement qu'un relevé resté muet. */
  for (const d of vus.values()) {
    const { valeurs, libre } = valeursRelevees(
      comptes.get(String(d.cle)) ?? new Map<string, number>());
    d.valeurs = valeurs;
    if (libre) d.libre = true;
  }

  /* Ce qu'un champ à choix PEUT valoir, et pas seulement ce que l'échantillon
     a montré. Vingt-cinq fiches ne portent pas toutes les valeurs d'une liste :
     une valeur que trois exposants sur mille portent n'y est presque jamais, et
     l'exploitant qui veut la désigner n'a rien à cocher. La codification, elle,
     les déclare toutes — avec leur libellé, que le code seul ne dit pas.

     Un appel par entité de codification, et l'échec de l'une n'emporte pas les
     autres : sans sa liste déclarée, un champ retombe sur ses valeurs relevées,
     comme avant. */
  for (const [entite, parProp] of aCodifier) {
    let tables: Record<string, Record<string, string>> = {};
    try { tables = await g.codifications(entite, [...parProp.keys()]); }
    catch (e) { console.error("codifications de " + entite + " :", e); continue; }
    for (const [prop, cles] of parProp) {
      const table = tables[prop];
      if (!table || Object.keys(table).length > CHOIX_MAX) continue;
      for (const cle of cles) {
        const d = vus.get(cle);
        if (d) d.choix = table;
      }
    }
  }
  return range([...vus.values()], GROUPES_KLIPSO);
}

Deno.serve(async (req) => {
  const CORS = { ...cors(req), ...METHODES };
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  const repond = (corps: unknown, code = 200) =>
    new Response(JSON.stringify(corps), {
      status: code,
      headers: { ...CORS, "Content-Type": "application/json" },
    });

  try {
    /* La synchronisation écrit dans la base et interroge Klipso avec la clé
       de l'organisateur : elle exige un utilisateur authentifié, pas la
       simple clé publique qui circule dans toutes les pages. */
    const commeUtilisateur = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
        auth: { persistSession: false } },
    );
    const utilisateur = await commeUtilisateur.auth.getUser();
    if (!utilisateur.data?.user) {
      return repond({ erreur: "Authentification requise." }, 401);
    }

    const corps = await req.json();

    /* ------------------ synchronisation complète ------------------ */
    if (!corps.evenementId) return repond({ erreur: "evenementId manquant." }, 400);

    /* La suite écrit avec la clé de service, qui ignore les politiques de la
       base : c'est donc ici, et nulle part plus loin, que se vérifie le droit
       de l'appelant sur ce salon. On pose la question à la base sous l'identité
       de l'appelant — un organisateur ne lit que les salons qui lui sont
       affectés, et un salon qu'il ne lit pas ne lui revient pas. */
    const { data: permis } = await commeUtilisateur
      .from("evenement").select("id").eq("id", corps.evenementId).maybeSingle();
    if (!permis) return repond({ erreur: "Salon inaccessible." }, 403);

    const db = client();

    const { data: evt, error: e1 } = await db
      .from("evenement").select("*").eq("id", corps.evenementId).single();
    if (e1 || !evt) return repond({ erreur: "Événement introuvable." }, 404);

    /* Le champ d'origine retenu pour chaque cible de la fiche. Résolu une fois
       pour toutes : la boucle des stands le consulte des milliers de fois, et
       le client Eventmaker le reçoit à la construction — jusqu'à la détection
       des champs, qui doit reconnaître une fiche d'exposant pour trouver la
       catégorie qui les porte.

       Deux jeux, parce qu'il y a deux lectures : celle de Klipso vaut même
       quand les exposants viennent d'ailleurs — c'est de lui que vient le nom
       posé sur le plan, et il reste le seul recours pour un emplacement que
       l'autre source ne connaît pas. */
    const srcStands = fournisseur(evt, "stands");
    /* Les champs que ce salon-ci s'est ajoutés. Ils se règlent et se lisent
       comme les autres cibles : tout ce qui parcourt les cibles doit donc voir
       les deux listes réunies, faute de quoi un champ personnalisé ne serait
       ni demandé à l'API, ni proposé dans la console. */
    const persos = champsPerso(evt.fiche);
    const ciblesK = cibles("klipso", evt.fiche);
    const ciblesEm = cibles("eventmaker", evt.fiche);
    const cibleK = (c: string) => champsCible(evt.correspondances, "klipso", c);
    const valeurK = (c: string) => valeursOui(evt.correspondances, "klipso", c);
    const champsEm = Object.fromEntries(
      ciblesEm.map((c) => [c.cle, champsCible(evt.correspondances, "eventmaker", c.cle)]));
    /* Un champ à choix ne répond pas par oui ou non : l'exploitant désigne
       celles de ses valeurs qui déclenchent. */
    const valeursEm = Object.fromEntries(
      ciblesEm.map((c) => [c.cle, valeursOui(evt.correspondances, "eventmaker", c.cle)]));

    // La géométrie vient toujours de Klipso : c'est elle qui porte les stands
    // et leurs contours. Les conférences et les produits se configurent déjà
    // mais rien ne les lit encore.
    if (fournisseur(evt, "plan") !== "klipso") {
      return repond({
        erreur: `Source « ${fournisseur(evt, "plan")} » pas encore prise en charge pour le plan.`,
      }, 400);
    }

    /* Les exposants peuvent venir d'Eventmaker. Le rattachement se fait par le
       numéro de stand : Klipso le compose de l'allée et du numéro, Eventmaker
       le saisit à la main, et les deux sont comparés sous forme normalisée.

       La règle de reprise tient en une phrase : une fiche qui porte un numéro
       de stand nous intéresse, les autres non. Les catégories d'invités
       diffèrent d'un salon à l'autre, elles sont donc détectées et non
       configurées. */
    let expoEm:
      | {
        parDossier: Map<string, ExposantEm>;
        parStand: Map<string, ExposantEm>;
        tousParStand: Map<string, ExposantEm[]>;
      }
      | null = null;
    let resumeEm: Record<string, unknown> | null = null;
    /* Les champs que la source porte, relevés au passage. C'est la matière de
       la correspondance : sans eux la console n'aurait rien à proposer, et il
       serait absurde d'aller les redemander alors qu'on vient de lire les
       fiches où ils se trouvent. */
    let detectes: Record<string, unknown>[] = [];
    // Ce qui peut être refusé tout de suite l'est avant d'ouvrir le flux :
    // un message d'erreur vaut mieux qu'une barre d'avancement qui s'arrête.
    if (srcStands === "eventmaker") {
      if (!String((evt.cles ?? {}).eventmaker ?? "")) {
        return repond({
          erreur: "Identifiant de l'événement Eventmaker manquant : " +
            "renseignez-le dans « Source des données ».",
        }, 400);
      }
      if (!Deno.env.get("EVENTMAKER_TOKEN")) {
        return repond({ erreur: "Jeton Eventmaker absent des secrets." }, 500);
      }
    } else if (srcStands !== "klipso") {
      return repond({
        erreur: `Source « ${srcStands} » pas encore prise en charge pour les exposants.`,
      }, 400);
    }

    /* ------------------------------------------------------------------
       Compte rendu au fil de l'eau.

       Une synchronisation dure plusieurs dizaines de secondes et enchaîne des
       étapes de nature différente ; un message figé pendant tout ce temps ne
       dit pas où l'on en est, ni si quelque chose est bloqué. La réponse est
       donc un flux de lignes JSON : la première annonce les étapes, les
       suivantes disent laquelle est en cours, la dernière porte le résultat.

       Les étapes sont annoncées dans l'ordre où elles tournent, et non dans
       celui où on les nommerait : les exposants se lisent avant le plan, qui
       s'en sert pour nommer ses emplacements.

       Les étapes que cette synchronisation ne sait pas encore faire sont
       annoncées « ignorée » plutôt que tues : l'exploitant les a réglées, il
       doit voir qu'elles ne sont pas reprises.
       ------------------------------------------------------------------ */

    /* Ce que pèse chaque étape, et donc la part de barre qui lui revient.

       Le poids d'une étape, c'est son nombre d'éléments : reprendre quatre
       cents emplacements ne vaut pas relever trois champs. Ce nombre-là ne se
       connaît qu'une fois l'étape faite — on part donc de celui de la dernière
       synchronisation, que la table `plan` a gardé, et chaque étape corrige le
       sien dès qu'elle sait. Un tout premier passage n'a rien à lire : la
       valeur de repli vaut alors un salon moyen.

       Une étape non reprise pèse zéro, faute de quoi la barre s'arrêterait aux
       trois quarts sur un salon qui n'a ni conférences ni produits. */
    const { data: dejaLa } = await db.from("plan")
      .select("nb_stands").eq("evenement_id", evt.id);
    const emplacements =
      (dejaLa ?? []).reduce((a, p) => a + (p.nb_stands ?? 0), 0) || 300;
    const srcConf = fournisseur(evt, "conferences");
    const POIDS: Record<string, number> = {
      /* Klipso rend les exposants avec les stands : l'étape ne fait alors que
         relever les champs, deux appels. Eventmaker, lui, parcourt des
         centaines de fiches — à peu près autant que d'emplacements. */
      exposants: srcStands === "eventmaker" ? emplacements : 20,
      conferences: srcConf === "eventmaker" ? Math.round(emplacements / 4) : 0,
      plan: emplacements,
      produits: 0,
    };
    const ETAPES = [
      { cle: "exposants", libelle: "Exposants", domaine: "stands" },
      { cle: "conferences", libelle: "Conférences", domaine: "conferences" },
      { cle: "plan", libelle: "Plan", domaine: "plan" },
      { cle: "produits", libelle: "Produits", domaine: "produits" },
    ].map((e) => ({
      ...e, source: fournisseur(evt, e.domaine), poids: POIDS[e.cle] ?? 1,
    }));

    const flux = new ReadableStream({
      async start(ctrl) {
        const enc = new TextEncoder();
        const emet = (o: Record<string, unknown>) => {
          ctrl.enqueue(enc.encode(JSON.stringify(o) + String.fromCharCode(10)));
        };
        const etape = (cle: string, etat: string, info?: unknown) =>
          emet({ etape: cle, etat, ...(info === undefined ? {} : { info }) });
        /* Où l'on en est *dans* l'étape : combien d'éléments sur combien, et
           lequel. Le total peut manquer — on ne sait pas d'avance combien de
           fiches une catégorie Eventmaker porte — et la sous-barre bat alors
           au lieu de se remplir, plutôt que de promettre une fin. */
        const avance = (cle: string, fait: number, total: number | null,
                        detail?: string, unite?: string) =>
          emet({
            etape: cle, etat: "encours", fait,
            ...(total === null ? {} : { total }),
            ...(detail === undefined ? {} : { detail }),
            ...(unite === undefined ? {} : { unite }),
          });
        /* Ce qui a été compté jusqu'ici, sous le nom que la fenêtre affichera.
           Les lignes s'écrasent par leur clé : une même mesure reprise à
           chaque pavillon ne fait qu'une ligne, qui monte. */
        const chiffres = (o: Record<string, number>) => emet({ chiffres: o });
        // le poids d'une étape, corrigé dès qu'elle sait ce qu'elle avait à faire
        const pese = (cle: string, poids: number) => emet({ etape: cle, poids });

        /* Deux mille octets de rien, avant toute chose.

           Un relais qui tient un tampon d'entrée ne pousse rien tant qu'il
           n'a pas de quoi le remplir : les premières lignes du flux, qui font
           quelques centaines d'octets, y restaient jusqu'à ce que la fin de la
           synchronisation les chasse — et la barre d'avancement paraissait une
           fois le travail fait. Ce remplissage force le premier envoi. Le
           client l'ignore : c'est une ligne qui ne parle d'aucune étape.

           Ce n'est pas la même précaution que l'en-tête `no-transform` : celui
           -là interdit de recomprimer, celui-ci de retenir. Les deux défauts
           se ressemblent de l'extérieur et ne se corrigent pas au même endroit. */
        emet({ amorce: " ".repeat(2048) });
        emet({ etapes: ETAPES });
        try {
      const g = gaia(evt.instance, evt.event_id ?? undefined);
      const resume: Record<string, unknown>[] = [];

      /* Les exposants peuvent venir d'Eventmaker. Le rattachement se fait par
         le numéro de stand : Klipso le compose de l'allée et du numéro,
         Eventmaker le saisit à la main, et les deux sont comparés sous forme
         normalisée. C'est l'étape la plus longue — plusieurs centaines de
         fiches à parcourir — d'où sa place dans le flux. */
      etape("exposants", "encours");
      if (srcStands === "eventmaker") {
        avance("exposants", 0, null, "Recherche des catégories d'invités");
        const em = new Eventmaker({
          jeton: Deno.env.get("EVENTMAKER_TOKEN")!,
          champs: champsEm, valeurs: valeursEm, perso: persos });
        // Les catégories déjà reconnues évitent de tout resonder : la première
        // synchronisation coûte trente-deux appels, les suivantes un seul.
        const connues: string[] = (evt.sources?.stands?.categories ?? []) as string[];

        /* Les numéros de stand du dernier instantané servent de termes de
           recherche : c'est par eux qu'on retrouve les catégories qui portent
           les exposants, sans avoir à toutes les sonder. Au tout premier
           passage il n'y en a pas, et le sondage prend le relais. */
        const { data: pl } = await db.from("plan").select("id").eq("evenement_id", evt.id);
        const { data: inst } = await db.from("instantane").select("charge")
          .in("plan_id", (pl ?? []).map((p) => p.id));
        const codes = (inst ?? [])
          .flatMap((i) => ((i.charge as any)?.stands ?? []) as Record<string, unknown>[])
          .map((st) => String(st.code ?? "")).filter(Boolean);

        const r = await em.exposants(
          String((evt.cles ?? {}).eventmaker), connues, codes,
          (lus) => avance("exposants", lus, null, "Lecture des fiches", "fiches"));
        expoEm = {
          parDossier: r.parDossier,
          parStand: r.parStand,
          tousParStand: r.tousParStand,
        };
        detectes = r.champs;
        resumeEm = {
          categories: r.categories,
          voie: r.voie,
          appels: r.appels,
          lus: r.lus,
          exposants: r.retenus,
          nonInscrits: r.ecartesNonInscrits,
        };
        // Le compte réel remplace l'estimation : la part de barre que
        // l'étape occupait était celle d'un salon supposé, la voici mesurée.
        pese("exposants", r.lus || 1);
        chiffres({
          "Fiches lues": r.lus,
          "Exposants retenus": r.retenus,
          ...(r.ecartesNonInscrits ? { "Écartés — non inscrits": r.ecartesNonInscrits } : {}),
        });
        etape("exposants", "encours", r.retenus + " exposants lus");

        // On retient ce qu'on vient d'apprendre. Écriture ciblée : le reste de
        // la configuration appartient à l'exploitant, pas à la synchronisation.
        const memes = connues.length === r.categoriesIds.length &&
          connues.every((c) => r.categoriesIds.includes(c));
        if (!memes) {
          const src = { ...(evt.sources ?? {}) };
          src.stands = { ...(src.stands ?? {}), categories: r.categoriesIds };
          await db.from("evenement").update({ sources: src }).eq("id", evt.id);
        }
      }

      /* Les conférences viennent de l'événement, pas d'un pavillon : on les lit
         une fois, on les rattachera pavillon par pavillon. */
      let confEm: ConferenceEm[] | null = null;
      let exposantsConf = new Map<string, ExposantConfEm[]>();
      let fuseau: string | null = null;
      const sallesConf: Record<string, any> = JSON.parse(JSON.stringify(evt.salles ?? {}));
      if (fournisseur(evt, "conferences") === "eventmaker") {
        etape("conferences", "encours");
        avance("conferences", 0, null, "Lecture du programme");
        const em = new Eventmaker({
          jeton: Deno.env.get("EVENTMAKER_TOKEN")!,
          champs: champsEm, valeurs: valeursEm, perso: persos });
        const idEm = String((evt.cles ?? {}).eventmaker);
        confEm = await em.conferences(idEm);
        pese("conferences", confEm.length || 1);
        /* Les conférences sont lues ; reste à savoir qui les tient, et le
           graphe ne dit pas d'avance combien de sessions il rendra. Le compte
           s'affiche donc sans total, et l'étape n'est pas donnée pour finie
           tant qu'elle ne l'est pas. */
        avance("conferences", confEm.length, null,
          "Rattachement des exposants", "conférences");
        try {
          const detail = await em.evenement(idEm);
          if (detail?.timezone) fuseau = String(detail.timezone);
        } catch (_) { /* le fuseau est un confort, pas une condition */ }
        /* Quels exposants tiennent quelle conférence : le graphe le dit, REST
           non. Un salon sur deux laisse le rôle vide — l'absence de
           rattachement n'est donc pas une anomalie, et ne doit pas faire
           échouer une synchronisation par ailleurs bonne. */
        try {
          exposantsConf = await em.exposantsParConference(idEm);
        } catch (e) {
          console.error("rattachement des exposants aux conférences :", e);
        }
        chiffres({
          "Conférences": confEm.length,
          ...(exposantsConf.size ? { "Conférences tenues par un exposant": exposantsConf.size } : {}),
        });
        etape("conferences", "encours", confEm.length + " conférences lues"
          + (exposantsConf.size ? ", " + exposantsConf.size + " tenues par un exposant" : ""));
      }

      /* Klipso ne relève rien en lisant les stands : on ne lui demande que les
         champs de la correspondance, pas les autres. Le schéma et un
         échantillon de fiches disent ce qu'il y a d'autre — deux appels, à
         côté des dizaines que coûte un pavillon. L'échec n'est pas bloquant :
         la correspondance en place continue de fonctionner, seule la liste
         proposée à l'exploitant manquera. */
      if (srcStands === "klipso") {
        try {
          detectes = await champsKlipso(g);
        } catch (e) {
          console.error("relevé des champs d'exposant :", e);
        }
      }

      etape("plan", "encours");
      avance("plan", 0, null, "Codification des champs à choix");

      /* Les champs « choix » ne portent qu'un code — « FEP26_NOM10201 » — dont
         le libellé vit dans le service « codification ». On les résout ici, une
         fois pour tout l'événement, plutôt qu'à chaque affichage.

         Pour la nomenclature, le champ est celui que désigne la correspondance :
         c'est lui qui porte les codes, donc lui dont il faut la codification. */
      const nomencl = await libellesChoix(g, "DossierExp",
        srcStands === "klipso" ? decoupe(cibleK("nomenclature")[0] ?? "").nom : "");
      /* Le secteur est un champ « choix » comme la nomenclature, mais porté par
         l'emplacement : sa codification est celle du stand, et on la demande
         quelle que soit la source des exposants — le plan, lui, vient toujours
         de Klipso. */
      const choixSect = await libellesChoix(g, "Stand", CHAMP_SECTEUR);
      /* Un champ personnalisé peut être un champ « choix » comme la
         nomenclature : il ne porte alors qu'un code, et la fiche afficherait
         « FEP26_GAM102 » là où l'exploitant attend « Prêt-à-porter ». Sa
         codification se demande ici, un appel par champ et pour tout
         l'événement. Un champ de texte libre n'en a pas : la table reste vide
         et la valeur passe telle quelle. */
      const choixPerso: Record<string, Record<string, string>> = {};
      if (srcStands === "klipso") {
        for (const c of persos) {
          const { origine, nom } = decoupe(cibleK(PREFIXE_PERSO + c.cle)[0] ?? "");
          if (!nom) continue;
          const t = await libellesChoix(g, origine === "stand" ? "Stand" : "DossierExp", nom);
          if (Object.keys(t.libelles).length) choixPerso[c.cle] = t.libelles;
        }
      }

      /** Le libellé s'il est connu ; sinon le code, dépouillé de son préfixe de
       *  salon — « FEP26_NOM10201 » ne dit rien de plus que « NOM10201 ». */
      const lisible = (table: Record<string, string>, c: string) =>
        table[c] || c.replace(/^[A-Z0-9]+_/, "");
      const nomenclature = (v: unknown): string[] | null => {
        if (!v) return null;
        const liste = ([] as unknown[]).concat(v).map(String).filter(Boolean);
        if (!liste.length) return null;
        return liste.map((c) => lisible(nomencl.libelles, c));
      };
      const secteur = (v: unknown): string | null => {
        const c = ou(v);
        return c ? lisible(choixSect.libelles, c) : null;
      };

      /**
       * Les champs que ce salon s'est ajoutés, pour une fiche.
       *
       * `lire` dit d'où vient la valeur — le dossier Klipso ou la fiche
       * Eventmaker — parce que le reste ne change pas : même liste de champs,
       * même nettoyage, même codification. Rien de vide ne descend :
       * l'instantané est servi au public.
       */
      const champsDuSalon = (lire: (cle: string) => unknown) => {
        const out: Record<string, string | string[]> = {};
        for (const c of persos) {
          const v = valeurPerso(lire(c.cle));
          if (v === null) continue;
          const table = choixPerso[c.cle];
          out[c.cle] = !table ? v
            : Array.isArray(v) ? v.map((x) => lisible(table, x)) : lisible(table, v);
        }
        return out;
      };

      let plans = await g.tout<Record<string, any>>("Plan", { fields: ["_AllFields"] });
      // Un pavillon représente plusieurs mégaoctets de SVG à alléger : on peut
      // le traiter seul si la synchronisation complète dépasse le temps imparti.
      if (corps.idPlan) plans = plans.filter((p) => p.Id === corps.idPlan);
      if (!plans.length) return emet({ erreur: "Aucun pavillon à traiter." });

      /* La part de l'étape déjà faite se compte en pavillons, fraction
         comprise : un pavillon commencé n'est ni fini ni à faire, et c'est
         justement pendant qu'on l'ouvre — douze calques de plusieurs
         mégaoctets — que la barre resterait immobile le plus longtemps. */
      let faits = 0;
      for (const plan of plans) {
        const part = (f: number, quoi: string) =>
          avance("plan", faits + f, plans.length, quoi, "pavillons");
        etape("plan", "encours", String(plan.Libelle ?? ""));
        part(0.03, "Pavillon « " + String(plan.Libelle ?? "") + " »");
        /* --- le pavillon --- */
        const { data: ligne } = await db.from("plan").upsert({
          evenement_id: evt.id,
          id_klipso: plan.Id,
          libelle: String(plan.Libelle ?? "")
            .replace(/^[A-Z]+\d*_/, "").replace(/^PAVILLON /i, "Pavillon "),
          hall: plan.HallExp ?? null,
          modifie_le: new Date().toISOString(),
        }, { onConflict: "evenement_id,id_klipso" }).select("id").single();
        if (!ligne) continue;
        const planId = ligne.id as string;

        /* --- calques d'habillage --- */
        const calques = await g.tout<Record<string, any>>("Calque", {
          fields: ["Id", "IdPlan", "Libelle", "Type", "Ordre", "VisibleParDefaut", "SVG"],
          filter: egal("IdPlan", plan.Id),
        }, "Ordre");

        let iCalque = 0;
        const textesZone: { x: number; y: number; txt: string }[] = [];
        // Tous les textes du plan, tous calques confondus : c'est parmi eux que
        // se trouvent les numéros d'emplacement — « P160 » — qui désignent les
        // salles de conférence. Le calque qui les porte ne s'appelle pas pareil
        // d'un salon à l'autre, on ne peut donc pas le nommer.
        const tousTextes: { x: number; y: number; txt: string }[] = [];
        for (const c of calques) {
          part(0.05 + 0.45 * (iCalque++ / (calques.length || 1)),
            "Calque « " + (NOMS[c.Libelle] ?? c.Libelle) + " »");
          if (!c.SVG?.idMedia) continue;
          const brut = await g.media(c.SVG.idMedia);
          const lus = textes(brut);
          tousTextes.push(...lus);
          if (CALQUES_TEXTE.includes(c.Libelle)) textesZone.push(...lus);
          const { svg } = allege(brut);
          await db.from("calque").upsert({
            plan_id: planId,
            id_klipso: c.Id,
            cle: c.Libelle,
            libelle: NOMS[c.Libelle] ?? c.Libelle,
            type: c.Type ?? null,
            ordre_klipso: c.Ordre ?? null,
            svg,
          }, { onConflict: "plan_id,id_klipso" });
        }

        /* --- stands ---

           Ce qu'on demande à Klipso dépend du réglage : les champs qui portent
           l'enseigne ou le site web s'appellent autrement d'un salon à l'autre,
           et demander un champ inexistant fait échouer l'appel entier. La liste
           se compose donc de ce dont la géométrie a besoin, plus ce que la
           correspondance désigne. */
        const champsStand = new Set([
          "Id", "IdPlan", "IdIlot", "IdDossierExpAff", "NomSurPlan", "Enseigne",
          "Allee", "NoStand", "Allee2", "NoStand2", "NbAngles", "NbNiveau",
          "Longueur", "Largeur", "SurfaceBrute", "EtatCommercialisation",
          "StandFictif", "x_CouleurPlan", CHAMP_SECTEUR,
        ]);
        const champsDossier = new Set(["Id", "AvancementImplantation", "Categorie"]);
        for (const c of ciblesK) {
          for (const nom of champsCible(evt.correspondances, "klipso", c.cle)) {
            const { origine, nom: n } = decoupe(nom);
            (origine === "stand" ? champsStand : champsDossier).add(n);
          }
        }

        part(0.52, "Emplacements");
        const bruts = await g.tout<Record<string, any>>("Stand", {
          fields: [...champsStand],
          entities: {
            SetStandShapeStand: { fields: ["Shape", "IdCalque", "SurfaceBrute"] },
            RefDossierExpAff: { fields: [...champsDossier] },
          },
          filter: egal("IdPlan", plan.Id),
        });

        const stands = [];
        let apparies = 0;
        const heberges = new Set<ExposantEm>();
        const parDossier = new Map<string, string>();
        for (const s of bruts) {
          const formes = s.SetStandShapeStand ? [].concat(s.SetStandShapeStand) : [];
          const anneaux = formes.flatMap((f: any) => versAnneaux(f?.Shape) ?? []);
          if (!anneaux.length) continue;
          const dos = s.RefDossierExpAff;
          /* Ce que Klipso porte pour cette fiche, lu par la correspondance : le
             dossier exposant d'un côté, l'emplacement de l'autre. */
          const origines = { "": dos ?? {}, stand: s };
          const val = (c: string) => ou(lit(cibleK(c), origines));
          // engagement contractuel : un exposant qui refuse le catalogue ne sort
          // pas, quelle que soit la source
          const exclu = vrai(lit(cibleK("exclu"), origines), valeurK("exclu"));
          const code = [s.Allee, s.NoStand].filter(Boolean).join("") || null;

          /* Le dossier identifie un exposant des deux côtés : Klipso le porte
             sur le stand, Eventmaker le recopie dans « id_dossier ». C'est par
             lui qu'on apparie, et par lui que les conférences retrouvent leur
             stand. Le numéro ne s'y prête qu'en second : saisi à la main, il se
             compose parfois de deux emplacements — « E58 - F59 » — que le plan
             numérote séparément, et il manque à des fiches qui ont un dossier.
             L'inverse existe aussi, d'où le repli plutôt qu'un choix. */
          const dossier = String(s.IdDossierExpAff ?? dos?.Id ?? "");
          if (dossier) parDossier.set(dossier, "s" + String(s.Id).slice(0, 8));

          // La source choisie fait foi : si elle ne connaît pas ce stand, il
          // reste vide plutôt que de retomber sur l'autre, ce qui donnerait un
          // plan à moitié dans chaque référentiel.
          const em = !expoEm ? undefined
            : (dossier ? expoEm.parDossier.get(dossier) : undefined) ??
              (code ? expoEm.parStand.get(cleStand(code)) : undefined);
          const ok = expoEm ? Boolean(em) && !em!.exclu : Boolean(dos) && !exclu;
          if (expoEm && em) apparies++;

          /* --- les co-exposants ---

             Ce schéma-ci et pas un autre : le plan vient de Klipso, les
             sociétés d'Eventmaker. Le stand Klipso ne porte qu'un dossier,
             celui de son titulaire ; les sociétés qu'il héberge se rattachent
             donc par le numéro, seul repère qu'elles partagent avec lui.

             Le titulaire est celui que le dossier a désigné. Faute de dossier
             des deux côtés — c'est le cas de salons entiers — c'est la
             première fiche du numéro qui tient ce rôle : personne n'est perdu
             pour autant, la fiche les liste tous.

             Un stand sans titulaire retenu n'héberge personne non plus : une
             enseigne qui refuse le catalogue emporte son stand entier, et une
             liste dont la tête serait vide ne se lirait pas.

             Le numéro qu'on interroge est celui que porte la fiche du
             titulaire, et non le code du plan. Les deux se ressemblent sans se
             confondre : Klipso numérote « T44 » et « U43 » séparément là où
             Eventmaker saisit « T44 - U43 » pour l'ensemble, et c'est cette
             écriture-là que les hébergés recopient. Chercher sous le code du
             plan ne trouvait donc rien sur les stands à deux emplacements —
             les plus grands, ceux qui hébergent le plus. Le titulaire, lui,
             était trouvé par son dossier : le stand paraissait normal, sans
             personne. Le code du plan ne sert que de repli, quand c'est par
             lui que le titulaire a été trouvé. */
          const numero = (em && em.stand) || (code ? cleStand(code) : "");
          const voisins = !expoEm || !ok || !numero ? []
            : (expoEm.tousParStand.get(numero) ?? []).filter((x) =>
              x !== em && !x.exclu
            );
          /* Deux emplacements réunis font deux stands du plan, qui listent les
             mêmes sociétés : on compte les sociétés, pas les listes. */
          voisins.forEach((x) => heberges.add(x));
          const coex = voisins.map(hebergee);

          /* Coordonnées et réseaux. Eventmaker les porte nativement ; Klipso
             ne les rend que si l'exploitant a désigné les champs qui les
             portent — sur bien des salons ils n'existent pas, et les cibles
             restent alors vides. Une valeur absente ne descend pas du tout :
             la page masque ce qu'elle ne reçoit pas, et l'instantané est
             servi tel quel au public. */
          const contacts = !ok ? {} : expoEm
            ? (em
              ? {
                adr: em.adresse, ville: em.ville, pays: em.pays, tel: em.tel,
                fb: em.facebook, li: em.linkedin, ig: em.instagram,
              }
              : {})
            : {
              adr: ou([val("adresse"), val("codePostal")].filter(Boolean).join(", ")),
              ville: val("ville"), pays: val("pays"), tel: val("telephone"),
              fb: val("facebook"), li: val("linkedin"), ig: val("instagram"),
            };

          /* Le logo suit la société, comme les contacts. Côté Klipso rien ne
             le porte d'office : la cible reste vide tant que l'exploitant n'a
             pas désigné le champ de son salon qui tient une adresse d'image. */
          const logo = !ok ? null
            : expoEm ? (em ? em.logo : null)
            : imageDistante(lit(cibleK("logo"), origines));

          /* Le secteur est une propriété de l'emplacement, pas de la société qui
             l'occupe : un stand encore libre appartient déjà au sien. Il ne
             dépend donc ni de l'appariement, ni de la source des exposants — et
             c'est ce qui rend un plan colorié par secteurs lisible. */
          const sect = secteur(s[CHAMP_SECTEUR]);

          /* Les champs propres au salon. Ils suivent la société, pas
             l'emplacement : c'est sa fiche qui les porte, et un stand dont
             l'exposant n'est pas retenu n'en montre aucun. */
          const perso = !ok ? {} : champsDuSalon((cle) =>
            expoEm ? em!.perso[cle]
              : lit(cibleK(PREFIXE_PERSO + cle), origines,
                    Boolean(persos.find((c) => c.cle === cle)?.multiple)));

          stands.push({
            id: "s" + String(s.Id).slice(0, 8),
            code,
            plan: (expoEm ? em?.raison : null) ?? val("raison"),
            nom: !ok ? null : expoEm ? em!.nom : val("nom"),
            site: !ok ? null : nettoieUrl(expoEm ? em!.site : val("site")),
            /* Le logo en tête de fiche. La clé ne descend pas quand il n'y en
               a pas : l'instantané est servi au public, et une adresse absente
               n'a pas à peser sur chaque stand. Rien n'est recopié ni
               redimensionné — la page charge l'image chez la source, et c'est
               une fiche ouverte à la fois. */
            ...((ok && logo) ? { logo } : {}),
            nomencl: !ok ? null : expoEm ? (em!.nomencl.length ? em!.nomencl : null)
                                         : nomenclature(lit(cibleK("nomenclature"), origines, true)),
            /* Les thématiques n'existent que côté Eventmaker, et seulement sur
               les salons qui en tiennent : ailleurs la clé ne descend pas
               plutôt que de porter des listes vides par centaines. */
            ...((ok && expoEm && em!.themes.length) ? { themes: em!.themes } : {}),
            /* Un nouvel exposant porte une pastille sur sa fiche. Le champ qui
               le dit n'existe que sur les salons qui distinguent leurs
               nouveaux venus : ailleurs la cible reste vide, et la clé ne
               descend pas — l'instantané est servi au public, il n'a pas à
               porter des « false » par centaines. */
            ...((ok && (expoEm ? em!.neuf
              : vrai(lit(cibleK("nouveau"), origines), valeurK("nouveau"))))
              ? { neuf: true } : {}),
            /* Les sociétés hébergées, dans l'ordre où Eventmaker les rend. La
               clé ne descend pas quand il n'y en a pas : la grande majorité
               des stands n'hébergent personne, et l'instantané part au
               public. */
            ...(coex.length ? { coex } : {}),
            ...Object.fromEntries(Object.entries(contacts).filter(([, v]) => v)),
            /* La clé ne descend pas quand le salon ne sectorise pas :
               l'instantané est servi au public, il n'a pas à porter des
               « null » par centaines. */
            ...(sect ? { sect } : {}),
            /* Un salon qui ne s'est ajouté aucun champ ne porte pas la clé :
               elle serait un objet vide sur chacun de ses stands. */
            ...(Object.keys(perso).length ? { perso } : {}),
            m2: s.SurfaceBrute,
            angles: s.NbAngles,
            niveaux: s.NbNiveau,
            etat: s.EtatCommercialisation,
            d: versTrace(anneaux),
            ...boite(anneaux),
          });
        }

        /* --- zones de dessin --- */
        part(0.78, "Zones organisateur");
        const grappes = groupeTextes(textesZone);
        const zonesBrutes = await g.tout<Record<string, any>>("ZoneDessin", {
          fields: ["_AllFields"],
          filter: egal("IdPlan", plan.Id),
        });

        const zones = [];
        for (const z of zonesBrutes) {
          const anneaux = versAnneaux(z.Shape);
          if (!anneaux) continue;
          const b = boite(anneaux);
          // à défaut de x_LibZOD renseigné, on lit le libellé posé sur le plan
          const dedansMoi = grappes
            .filter((l) => dedans([l.x, l.y], anneaux[0]) && !TECHNIQUE.test(l.txt))
            .sort((a, c) =>
              Math.hypot(a.x - b.c[0], a.y - b.c[1]) -
              Math.hypot(c.x - b.c[0], c.y - b.c[1]));
          zones.push({
            id: "z" + String(z.Id).slice(0, 8),
            nom: z.x_LibZOD ?? (dedansMoi.length ? dedansMoi[0].txt : null),
            m2: z.Surface,
            d: versTrace(anneaux),
            ...b,
          });
        }

        /* --- les conférences, rattachées par le code de leur salle ---

           Une salle s'appelle « Agora (P160) ». Le code entre parenthèses est
           un emplacement du plan, posé comme texte : on retrouve sa position,
           puis la zone qui la contient. Dix salles sur onze aboutissent ainsi
           sur Franchise Expo ; la onzième porte un code absent du plan et se
           rattache à la main depuis la console. */
        const conferences: Record<string, unknown>[] = [];
        if (confEm) {
          const parCode = new Map<string, { x: number; y: number }>();
          for (const t of tousTextes) {
            const k = cleStand(t.txt);
            if (k && !parCode.has(k)) parCode.set(k, t);
          }
          const anneauxZone = new Map(zonesBrutes.map((z) => [
            "z" + String(z.Id).slice(0, 8), versAnneaux(z.Shape),
          ]));

          for (const c of confEm) {
            const idSalle = c.salleId || c.salle || "";
            if (!idSalle) continue;
            let fiche = sallesConf[idSalle];
            if (!fiche) fiche = sallesConf[idSalle] = { nom: c.salle, code: null, zone: null, auto: null, manuel: false };
            fiche.nom = c.salle;

            const segments = codeSalle(c.salle);
            fiche.code = segments.join("-") || null;
            const pos = segments.map((x) => parCode.get(cleStand(x))).find(Boolean);
            if (pos) {
              for (const [idZone, anneaux] of anneauxZone) {
                if (anneaux?.some((a) => dedans([pos.x, pos.y], a))) { fiche.auto = idZone; break; }
              }
            }
            // un choix de l'exploitant n'est jamais écrasé
            if (!fiche.manuel && fiche.auto) fiche.zone = fiche.auto;

            /* Une conférence ne tient pas à un pavillon : elle tient à une
               zone d'organisation et à un exposant, qui peuvent être sur deux
               pavillons différents. Elle entre donc dans la charge de celui qui
               porte sa zone, et dans celle de celui qui porte le stand de son
               exposant — au besoin les deux, où elle s'affichera dans le
               programme de la zone ici, sur la fiche de l'exposant là.

               Sans zone ni exposant, elle n'a d'attache nulle part : on la
               remonte partout pour qu'elle existe avant d'être située, la
               console la rattachera. La page, qui range par zone et par stand,
               ne l'affiche d'ici là nulle part. */
            /* On ne garde d'un exposant que le stand qu'il occupe ici : sur un
               autre pavillon, la même conférence citera l'autre stand. */
            const cites = exposantsConf.get(c.id) ?? [];
            const expos = cites
              .map((e) => ({ stand: parDossier.get(e.dossier), nom: e.nom }))
              .filter((e): e is { stand: string; nom: string | null } => Boolean(e.stand));
            const sienne = fiche.zone && anneauxZone.has(fiche.zone);
            // sans zone et sans exposant nulle part, elle n'a d'attache
            // qu'ici : on la remonte pour qu'elle existe, la console la situera
            if (sienne || expos.length || (!fiche.zone && !cites.length)) {
              conferences.push({
                id: c.id, nom: c.nom, texte: c.texte,
                debut: c.debut, fin: c.fin,
                debutLocal: c.debutLocal, finLocal: c.finLocal,
                salle: c.salle, type: c.type, couleur: c.couleur, theme: c.theme,
                zone: sienne ? fiche.zone : null,
                exposants: expos,
              });
            }
          }
        }

        part(0.92, "Enregistrement du pavillon");
        const emp = emprise([...stands, ...zones]);
        await db.from("plan").update({
          emprise: emp,
          nb_stands: stands.length,
          nb_zones: zones.length,
          modifie_le: new Date().toISOString(),
        }).eq("id", planId);

        await db.from("instantane").upsert({
          plan_id: planId,
          charge: { stands, zones, conferences, emprise: emp },
          genere_le: new Date().toISOString(),
        }, { onConflict: "plan_id" });

        /* Ce qu'une mesure pourra désigner. Les compteurs ne retiennent qu'un
           identifiant : c'est ici que se conserve de quoi l'afficher — le
           numéro d'emplacement et l'enseigne — et c'est cette liste qui ferme
           leur vocabulaire, une cible absente étant écartée à l'écriture.

           Les zones n'y figurent pas : une zone organisateur n'est pas un
           exposant, et la page ne la compte pas non plus. */
        const cibles = [
          ...stands.map((s) => ({
            evenement_id: evt.id, genre: "fiche_stand", id: s.id,
            code: s.code ?? null, nom: s.nom ?? s.plan ?? null,
            modifie_le: new Date().toISOString(),
          })),
          ...conferences.map((c) => ({
            evenement_id: evt.id, genre: "fiche_conf", id: String(c.id),
            code: null, nom: (c.nom as string) ?? null,
            modifie_le: new Date().toISOString(),
          })),
        ];
        /* Une même conférence peut être remontée par deux pavillons — elle y
           cite des exposants de chacun. Deux lignes de même clé dans un seul
           envoi font échouer l'upsert entier : on ne garde que la première. */
        const uniques = [...new Map(cibles.map((c) => [c.genre + c.id, c])).values()];
        if (uniques.length) {
          await db.from("cible").upsert(uniques, { onConflict: "evenement_id,genre,id" });
        }

        resume.push({
          pavillon: plan.Libelle,
          stands: stands.length,
          exposants: stands.filter((s) => s.nom).length,
          ...(expoEm ? { apparies } : {}),
          ...(heberges.size ? { coexposants: heberges.size } : {}),
          zones: zones.length,
          zonesNommees: zones.filter((z) => z.nom).length,
        });
        faits++;
        /* Les compteurs montent pavillon par pavillon plutôt qu'à la fin :
           sur un salon à plusieurs pavillons, c'est la seule preuve visible
           que le travail avance et non qu'il tourne à vide. */
        const cumul = (c: string) =>
          resume.reduce((a, p) => a + Number((p as Record<string, unknown>)[c] ?? 0), 0);
        chiffres({
          "Emplacements": cumul("stands"),
          "Emplacements nommés": cumul("exposants"),
          ...(expoEm ? { "Emplacements appariés": cumul("apparies") } : {}),
          ...(cumul("coexposants") ? { "Co-exposants": cumul("coexposants") } : {}),
          "Zones organisateur": cumul("zones"),
        });
        avance("plan", faits, plans.length, "Pavillon terminé", "pavillons");
      }

      pese("plan",
        resume.reduce((a, p) => a + Number(p.stands ?? 0), 0) || 1);
      etape("plan", "fait", plans.length + (plans.length > 1 ? " pavillons" : " pavillon"));
      etape("exposants", "fait",
        resume.reduce((a, p) => a + Number(p.exposants ?? 0), 0) + " rattachés" +
        (detectes.length ? ", " + detectes.length + " champs relevés" : ""));
      if (confEm) {
        await db.from("evenement")
          .update({ salles: sallesConf, fuseau }).eq("id", evt.id);
        const rattachees = Object.values(sallesConf).filter((s: any) => s.zone).length;
        etape("conferences", "fait",
          rattachees + " / " + Object.keys(sallesConf).length + " salles situées");
      }

      /* Deux raisons de ne rien faire, et elles ne se disent pas pareil : soit
         l'exploitant n'a rien demandé, soit il a désigné une source que la
         synchronisation ne sait pas encore lire. */
      for (const cle of ["conferences", "produits"]) {
        if (cle === "conferences" && confEm) continue;
        const src = fournisseur(evt, cle);
        etape(cle, "ignoree",
          src === "aucun" ? "non synchronisé" : src + " — pas encore repris");
      }

      /* Le relevé des champs, rangé à côté de l'événement.

         L'écriture est ciblée et relit d'abord : la correspondance choisie par
         l'exploitant vit dans la même colonne, et une synchronisation lancée
         pendant qu'il la règle ne doit pas l'effacer. Ce qu'on pose ici, c'est
         ce qu'on a vu — jamais ce qu'il a décidé.

         La proposition se calcule ici plutôt que dans la console : c'est la
         synchronisation qui sait quel champ elle lirait à défaut de réglage, et
         deux listes de défauts finiraient par diverger. */
      if (detectes.length) {
        const connus = new Set(detectes.map((d) => String(d.cle)));
        const defauts = DEFAUTS[srcStands] ?? {};
        const propose: Record<string, string[]> = {};
        for (const c of cibles(srcStands, evt.fiche)) {
          propose[c.cle] = (defauts[c.cle] ?? []).filter((n) => connus.has(n));
        }
        const { data: frais } = await db.from("evenement")
          .select("correspondances").eq("id", evt.id).single();
        const corr = { ...((frais?.correspondances ?? {}) as Record<string, any>) };
        corr[srcStands] = {
          ...(corr[srcStands] ?? {}),
          detectes, defauts, propose,
          detecteLe: new Date().toISOString(),
        };
        await db.from("evenement").update({ correspondances: corr }).eq("id", evt.id);
      }

      // une synchronisation partielle ne fait pas foi comme date de référence
      if (!corps.idPlan) {
        await db.from("evenement").update({
          derniere_sync: new Date().toISOString(),
          derniere_err: null,
          modifie_le: new Date().toISOString(),
        }).eq("id", evt.id);
      }

      // Le compte des libellés dit tout de suite si la codification a répondu :
      // sans lui, un plan rempli de codes passerait pour un plan correct.
      return emet({
        ok: true,
        pavillons: resume,
        nomenclature: {
          libelles: Object.keys(nomencl.libelles).length,
          chemin: nomencl.chemin,
          erreur: nomencl.erreur,
        },
        secteurs: {
          libelles: Object.keys(choixSect.libelles).length,
          chemin: choixSect.chemin,
          erreur: choixSect.erreur,
        },
        ...(resumeEm ? { eventmaker: resumeEm } : {}),
      });
        } catch (e) {
          emet({ erreur: e instanceof Error ? e.message : String(e) });
          try {
            await client().from("evenement")
              .update({ derniere_err: e instanceof Error ? e.message : String(e) })
              .eq("id", corps.evenementId);
          } catch (_) { /* la trace ne doit pas masquer l'erreur d'origine */ }
        } finally {
          ctrl.close();
        }
      },
    });

    /* `no-transform` interdit aux relais de recomprimer la réponse, et
       `X-Accel-Buffering` dit la même chose à ceux de la famille nginx, qui
       ignorent le premier. Gzippé, un flux de lignes courtes reste coincé dans
       le tampon du compresseur et n'arrive qu'à la toute fin : la barre
       d'avancement paraissait alors une fois la synchronisation faite. */
    return new Response(flux, {
      headers: {
        ...CORS,
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-store, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    try {
      const corps = await req.clone().json().catch(() => ({}));
      if (corps.evenementId) {
        await client().from("evenement")
          .update({ derniere_err: message }).eq("id", corps.evenementId);
      }
    } catch { /* la remontée de l'erreur prime sur son enregistrement */ }
    return repond({ erreur: message }, 500);
  }
});

/**
 * Une société hébergée, telle que la fiche du stand la portera.
 *
 * Mêmes clés que le stand lui-même : c'est la même fiche qui l'affiche, et
 * dédoubler le rendu pour deux jeux de noms n'aurait servi qu'à les faire
 * diverger. Ni géométrie ni numéro — elle occupe le stand de son hôte — et
 * rien qui soit vide, l'instantané étant servi tel quel au public.
 */
function hebergee(x: ExposantEm): Record<string, unknown> {
  const o: Record<string, unknown> = { nom: x.nom };
  const champs: [string, unknown][] = [
    ["plan", x.raison], ["logo", x.logo], ["site", nettoieUrl(x.site)],
    ["adr", x.adresse], ["ville", x.ville],
    ["pays", x.pays], ["tel", x.tel], ["fb", x.facebook],
    ["li", x.linkedin], ["ig", x.instagram],
  ];
  for (const [k, v] of champs) if (v) o[k] = v;
  if (x.nomencl.length) o.nomencl = x.nomencl;
  if (x.themes.length) o.themes = x.themes;
  if (x.neuf) o.neuf = true;
  // les champs propres au salon suivent la société hébergée comme les autres :
  // c'est bien sa fiche à elle qui les porte
  if (Object.keys(x.perso).length) o.perso = x.perso;
  return o;
}

/** Les adresses saisies à la main contiennent parfois des slashes échappés. */
function nettoieUrl(u: unknown): string | null {
  if (!u) return null;
  const s = String(u).replace(/\\/g, "");
  return /^https?:/i.test(s) ? s : "https://" + s;
}

/**
 * Les libellés de zone sont posés ligne par ligne sur le plan : on regroupe
 * ceux qui se touchent, puis on les lit de haut en bas.
 */
function groupeTextes(mots: { x: number; y: number; txt: string }[]) {
  const grappes: { mots: typeof mots }[] = [];
  for (const w of [...mots].sort((a, b) => a.y - b.y)) {
    const g = grappes.find((g) =>
      g.mots.some((o) => Math.abs(o.x - w.x) < 4.5 && Math.abs(o.y - w.y) < 2.6));
    if (g) g.mots.push(w);
    else grappes.push({ mots: [w] });
  }
  return grappes.map((g) => ({
    x: g.mots.reduce((a, m) => a + m.x, 0) / g.mots.length,
    y: g.mots.reduce((a, m) => a + m.y, 0) / g.mots.length,
    txt: g.mots.sort((a, b) => a.y - b.y).map((m) => m.txt)
      .join(" ").replace(/\s+/g, " ").trim(),
  }));
}
