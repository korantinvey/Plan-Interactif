/**
 * Essai de charge avec k6 : des visiteurs qui ouvrent le plan d'un salon, à un
 * débit qui monte par paliers.
 *
 *   k6 run -e SALON=<slug> outils/essais/charge-k6.mjs
 *        [-e BASE=https://…] [-e PIC=5] [-e PALIER=120] [-e VISITE=60]
 *        [-e BUDGET=50000] [-e LOGOS=0]
 *
 * Le même parcours que `charge.js`, celui de la page d'un nouveau venu : la
 * page, l'entête, le plan sous sa version, le fond du premier pavillon, les
 * lots de logos découpés comme `recherche.mjs`, puis des mesures toutes les
 * trente secondes environ. Ce que k6 y ajoute, et pourquoi on le prend :
 *
 *   — un débit imposé (`PIC` ouvertures par seconde au dernier palier), tenu
 *     même quand le serveur ralentit : c'est ce qui montre où il cède, là où
 *     un nombre fixe de visiteurs ralentit avec lui et le masque ;
 *   — des connexions neuves à chaque visiteur (`noVUConnectionReuse`), avec
 *     leur poignée de main TLS, comme de vrais téléphones — Node, lui,
 *     partage les siennes entre tous et mesure des temps trop flatteurs ;
 *   — un arrêt de lui-même au-delà d'un pour cent d'échecs : l'essai vise la
 *     production, il ne doit pas insister quand elle souffre.
 *
 * Les mesures visent un salon qui n'existe pas, pour la raison que donne
 * `charge.js` : toute la chaîne travaille, rien ne rejoint le rapport d'un
 * vrai salon. Les compteurs que les visiteurs se disputent dans la base ne
 * sont donc pas éprouvés ici.
 *
 * Avant de partir, l'essai fait son devis. L'offre gratuite de Cloudflare
 * borne le Worker à cent mille appels par jour et le stockage à autant de
 * lectures, tous salons confondus : les épuiser met les vrais plans hors ligne
 * jusqu'à minuit UTC. Au-delà de `BUDGET`, l'essai refuse de partir.
 */
import http from "k6/http";
import { sleep } from "k6";
import { Rate } from "k6/metrics";

const BASE = (__ENV.BASE || "https://plan-interactif.interactiveplan.workers.dev").replace(/\/$/, "");
const SALON = __ENV.SALON || "";
const PIC = Number(__ENV.PIC || 5);          // ouvertures par seconde, au dernier palier
const PALIER = Number(__ENV.PALIER || 120);  // secondes de chaque montée et de chaque tenue
const VISITE = Number(__ENV.VISITE || 60);   // secondes de mesures après l'ouverture
const BUDGET = Number(__ENV.BUDGET || 50000);
const LOGOS = __ENV.LOGOS !== "0";
/* Le découpage de la page : d'autres lots seraient d'autres clés, absentes du
   cache, et chacune y coûterait une écriture — il n'en accepte que mille. */
const VIGNETTES_PAR_LOT = 96;
const SALON_MESURE = "essai-de-charge-inexistant";

if (!SALON) throw new Error("Nommez le salon : k6 run -e SALON=<slug> outils/essais/charge-k6.mjs");

const API = BASE + "/api/plan?slug=" + encodeURIComponent(SALON);

/* Trois paliers, au quart, à la moitié puis au plein du débit, chacun atteint
   en `PALIER` secondes puis tenu autant. Par minute : k6 ne compte qu'en
   entiers, et cinq ouvertures par seconde au quart n'en feraient pas un. */
const parMinute = (part) => Math.max(1, Math.round(PIC * 60 * part));
const PALIERS = [0.25, 0.5, 1].flatMap((part) => [
  { target: parMinute(part), duration: PALIER + "s" },
  { target: parMinute(part), duration: PALIER + "s" },
]).concat([{ target: 0, duration: "30s" }]);

/* Les ouvertures que ces paliers feront : l'aire sous la courbe. */
const OUVERTURES = Math.round(PALIERS.reduce((somme, p, i) => {
  const avant = i ? PALIERS[i - 1].target : 0;
  return somme + (avant + p.target) / 2 / 60 * parseInt(p.duration, 10);
}, 0));

export const options = {
  scenarios: {
    ouverture: {
      executor: "ramping-arrival-rate",
      startRate: 0,
      timeUnit: "1m",
      stages: PALIERS,
      // chaque visiteur reste `VISITE` secondes : il en faut autant en vol
      preAllocatedVUs: Math.ceil(PIC * (VISITE + 15) * 1.2),
      maxVUs: Math.ceil(PIC * (VISITE + 15) * 2),
    },
  },
  noVUConnectionReuse: true,
  discardResponseBodies: true,
  thresholds: {
    http_req_failed: [{ threshold: "rate<0.01", abortOnFail: true, delayAbortEval: "30s" }],
    "http_req_duration{nom:plan}": ["p(95)<1500"],
    "http_req_duration{nom:entete}": ["p(95)<800"],
  },
};

/* La part des lectures servies par le stockage du Worker, sans réveiller la
   base : c'est elle qui dit si la montée en charge reste à la porte. */
const servieDuCache = new Rate("servie_du_cache");

/** Ce que la page demandera après le plan, relevé une fois : lire le plan à
 *  chaque visiteur fictif ferait travailler la machine qui essaie. */
export function setup() {
  const texte = { responseType: "text" };
  const e = http.get(API + "&entete=1", texte);
  const v = e.status === 200 ? (JSON.parse(e.body).v || "") : "";
  if (!v) throw new Error(`Le salon ${SALON} ne répond pas sur ${BASE} : est-il publié, le nom est-il exact ?`);
  const d = JSON.parse(http.get(API + "&v=" + encodeURIComponent(v), texte).body);

  const p = (d.plans || []).find((x) => (x.fond || []).some((c) => c.svg === undefined));
  const fond = p ? API + "&fond=" + encodeURIComponent(p.id) +
    "&v=" + encodeURIComponent(p.versionFond || d.genereLe || "0") : null;
  const cles = new Set();
  for (const x of d.plans || []) {
    for (const s of x.stands || []) {
      for (const soc of [s].concat(s.coex || [])) if (soc && soc.vignette) cles.add(soc.vignette);
    }
  }
  const triees = [...cles].sort();
  const lots = [];
  if (LOGOS) {
    for (let i = 0; i < triees.length; i += VIGNETTES_PAR_LOT) {
      lots.push(BASE + "/api/plan?vignettes=" + triees.slice(i, i + VIGNETTES_PAR_LOT).join(","));
    }
  }

  const lectures = 2 + (fond ? 1 : 0) + lots.length;
  const mesures = 1 + Math.max(0, Math.floor((VISITE - 4.5) / 30));
  const appels = OUVERTURES * (1 + lectures + mesures);
  console.log(`Salon ${SALON}, version ${v} : ${fond ? "un fond" : "pas de fond"}, ` +
    `${triees.length} logos en ${lots.length} lots.`);
  console.log(`Devis : ${OUVERTURES} ouvertures, ${appels} appels du Worker, ` +
    `${OUVERTURES * lectures} lectures du stockage. Quota gratuit : 100 000 de chaque par jour.`);
  if (appels > BUDGET || OUVERTURES * lectures > BUDGET) {
    throw new Error(`Au-delà du budget de ${BUDGET} : baissez PIC, PALIER ou VISITE, ` +
      `ou passez BUDGET en connaissance de cause.`);
  }
  return { v, fond, lots };
}

const note = (r, nom) => {
  const c = r.headers["X-Cache"];
  if (c) servieDuCache.add(c === "hit" || c === "stale", { nom });
};
const lit = (url, nom) => note(http.get(url, { tags: { nom } }), nom);

export default function (releve) {
  http.get(BASE + "/plan-" + encodeURIComponent(SALON), { tags: { nom: "page" } });
  lit(API + "&entete=1", "entete");
  lit(API + "&v=" + encodeURIComponent(releve.v), "plan");
  if (releve.fond) lit(releve.fond, "fond");
  // deux lots à la fois, comme `LOTS_A_LA_FOIS`
  for (let i = 0; i < releve.lots.length; i += 2) {
    http.batch(releve.lots.slice(i, i + 2).map((url) =>
      ["GET", url, null, { tags: { nom: "logos" } }])).forEach((r) => note(r, "logos"));
  }

  const qui = Math.random().toString(36).slice(2, 14);
  const fin = Date.now() + VISITE * 1000;
  let premier = true;
  for (;;) {
    // l'écart aléatoire évite que tous les paquets partent au même tic
    const attente = premier ? 2 + Math.random() * 5 : 25 + Math.random() * 10;
    if (Date.now() + attente * 1000 >= fin) break;
    sleep(attente);
    const gestes = premier
      ? [{ genre: "visite" }]
      : [{ genre: "recherche" }, { genre: "fiche_stand", canal: "liste" }];
    premier = false;
    http.post(BASE + "/api/mesure",
      JSON.stringify({ slug: SALON_MESURE, visiteur: qui, support: "web", gestes }),
      { headers: { "Content-Type": "application/json" }, tags: { nom: "mesure" } });
  }
}
