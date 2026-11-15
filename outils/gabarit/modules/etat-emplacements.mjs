/* ============================================================
   L'état des stands et des zones, tel que le dessin le lit

   Chaque emplacement a un état qui change sa couleur : choisi, retiré par la
   recherche, mis en avant par le cartouche des repères, masqué par
   l'exploitant, teint par son secteur ou par la carte de chaleur, repris par
   l'outil de forme. Chaque module qui le décide l'écrivait sur le groupe SVG
   de l'emplacement, en classe ou en variable, et le dessin le relisait là.

   Ici, ces modules le disent au modèle, par un mutateur, au moment où ils
   l'écrivent sur le groupe : `poseChoisi` (`fiche.mjs`, `points-interet.mjs`),
   `poseRetires` (`recherche.mjs`), `posePhares` (`cartouche-poi.mjs`),
   `poseSecteurs` (`secteurs.mjs`), `poseCibleTuto` (`tutoriel.mjs`), `poseChaleurs` (`chaleur.mjs`, en
   administration), `poseRepris` (`reprise-emplacements.mjs`, en
   administration). Le masquage d'une zone se lit dans ses données
   (`z.masquee`). Le dessin lit l'état par `etatEmplacement`, et
   `style-emplacements.mjs` en tire le style.

   C'est le deuxième pas de la sortie du SVG (`docs/migration-webgl.md`). Le
   SVG reste marqué comme avant — il peint encore le repli, et d'autres
   modules le lisent. Le pas suivant ne construira plus les stands dans le
   SVG caché quand le WebGL peint : les écrivains n'auront plus que le modèle
   à prévenir. L'essai `outils/essais/navigateur/etat-emplacements.spec.js`
   vérifie, dans des états réels de la page, que le modèle dit ce que le SVG
   porte.

   Les modules parcourent les emplacements du pavillon dans les données
   (`emplacements`), et non dans le SVG ; ils ne marquent le groupe d'un
   emplacement que s'il est construit (`groupeEmplacement`). Le jour où le
   WebGL ne construira plus ces groupes, ils n'auront rien à changer.

   Un emplacement se désigne par sa clé (`cleEmplacement`) : son identifiant
   propre s'il a été ajouté à la main (`data-aj`), celui de l'emplacement
   sinon. Deux groupes portent le même `data-id` quand un ajout matérialise
   l'exposant d'un stand : seule la clé les distingue.

   Ce module n'importe que les données, la géométrie pure de `forme.mjs` et
   les événements : tous ceux qui l'informent dépendent déjà du dessin, qui le
   lit.

   Il prévient le dessin de ce qui change (`EMPLACEMENTS_CHANGES`) : le
   dessin ne guette plus les groupes des stands et des zones, qui ne lui
   disent plus rien. Chaque mutateur compare l'avant et l'après, et ne dit
   que le bloc qui a bougé — les stands, les zones, ou les deux : sans quoi
   une lettre tapée dans la recherche referait les deux blocs même quand rien
   ne s'y éteint. Ce que les données changent hors d'ici — le décor d'une
   zone, son masquage, une forme reprise, un pavillon monté, un calque
   éteint — se dit par `signaleEmplacements`.
   ============================================================ */
import { parId, P } from "./donnees.mjs";
import { anneauxGeo, boiteAnneaux } from "./forme.mjs";
import { creeEvenement } from "./evenement.mjs";

/**
 * Ce que le dessin peint des stands ou des zones a changé. `stands` et
 * `zones` disent les blocs à relire ; `cles`, les emplacements qui viennent
 * d'être choisis ou de cesser de l'être, dont le volume part sans attendre
 * que le bloc soit relu (`webgl.mjs` `anticipeHausses`).
 * @type {import("./evenement.mjs").Evenement<[{ stands: boolean, zones: boolean, cles: string[] }]>}
 */
export const EMPLACEMENTS_CHANGES = creeEvenement();

/** La sorte d'un emplacement d'après sa clé, ou rien s'il n'est pas connu. */
const sorteDe = (/** @type {string | null} */ cle) => {
  const o = cle ? parId.get(cle.slice(3)) : null;
  return o && (o.kind === "stand" || o.kind === "zone") ? o.kind : null;
};
/** Dit au dessin les blocs que ces clés touchent — les deux, pour une clé inconnue. */
function signaleCles(/** @type {Iterable<string | null>} */ cles, /** @type {string[]} */ montent = []){
  let stands = false, zones = false;
  for (const c of cles){
    if (c === null) continue;
    const s = sorteDe(c);
    if (s !== "zone") stands = true;
    if (s !== "stand") zones = true;
  }
  if (stands || zones) EMPLACEMENTS_CHANGES.emet({ stands, zones, cles: montent });
}
/** Les clés qui sont dans l'un des deux ensembles et pas dans l'autre. */
const ecart = (/** @type {Set<string>} */ a, /** @type {Set<string>} */ b) =>
  [...a].filter(x => !b.has(x)).concat([...b].filter(x => !a.has(x)));
/** Les clés dont la valeur diffère d'une table à l'autre. */
function ecartTables(/** @type {Map<string, any> | null} */ a, /** @type {Map<string, any> | null} */ b){
  const out = [];
  const sig = (/** @type {any} */ v) => JSON.stringify(v);
  for (const [k, v] of a || []) if (!b || !b.has(k) || sig(b.get(k)) !== sig(v)) out.push(k);
  for (const k of (b || new Map()).keys()) if (!a || !a.has(k)) out.push(k);
  return out;
}

/**
 * Pour qui change ce que le dessin peint sans passer par un mutateur d'ici :
 * le décor ou le masquage d'une zone (`fiche-zone.mjs`, `reglage-comptoir.mjs`,
 * `reglage-foodtrucks.mjs`), un emplacement ajouté, nommé, lié, retiré ou
 * reformé (`reprise-emplacements.mjs`), un pavillon monté (`rendu.mjs`), un
 * calque éteint (`apparence.mjs`).
 */
export function signaleEmplacements(/** @type {"stands" | "zones" | "tous"} */ quoi){
  EMPLACEMENTS_CHANGES.emet({ stands: quoi !== "zones", zones: quoi !== "stands", cles: [] });
}

/**
 * Les emplacements du pavillon affiché, dans l'ordre où le plan pose leurs
 * groupes (`rendu.mjs` `montePlan`) : les zones, puis les stands. Chacun porte
 * ce que son groupe portait en attributs — `id` (`data-id`, l'emplacement que
 * matérialise un ajout lié), `aj` (`data-aj`), `soc` (`data-soc`) —, sa clé,
 * sa donnée propre (`source`) et celle que les modules lisent sous son
 * identifiant (`o`, de `parId`).
 *
 * Recalculé à chaque appel : quelques centaines d'objets, et jamais un index en
 * retard sur un ajout ou une liaison que l'outil de reprise vient de poser.
 * @returns {Array<{ cle: string, id: string, aj: string | undefined, soc: number | undefined,
 *   zone: boolean, source: any, o: any }>}
 */
export function emplacements(){
  const p = P && P();
  if (!p) return [];
  const out = [];
  for (const z of p.zones || []){
    const aj = z.ajout ? z.id : undefined;
    out.push({ cle: cleEmplacement(z.id, aj), id: z.id, aj, soc: undefined, zone: true, source: z, o: parId.get(z.id) });
  }
  for (const s of p.stands || []){
    const id = s.lien ? s.lien.stand : s.id, aj = s.ajout ? s.id : undefined;
    out.push({ cle: cleEmplacement(id, aj), id, aj, soc: s.lien ? Number(s.lien.soc) : undefined, zone: false,
      source: s, o: parId.get(id) });
  }
  return out;
}

/**
 * L'ajout qui matérialise une société sur un emplacement partagé, s'il y en
 * a un : il porte l'identifiant de l'exposant et le rang de la société, comme
 * un stand dessiné (`dessin.mjs` `decoupeStand`). Choisir la société allume
 * alors lui seul, et non l'hôte, qui allumerait aussi la voisine.
 * @param {string} id
 * @param {number} iSoc
 */
export function ajoutLie(id, iSoc){
  return emplacements().find(e => e.aj !== undefined && e.soc !== undefined &&
    e.id === id && e.soc === Number(iSoc)) || null;
}

/**
 * L'emplacement que la fiche d'un exposant allume : l'ajout lié de la
 * société choisie s'il existe, sinon le premier qui porte l'identifiant —
 * celui que l'ordre des groupes donnait au plan. Rien si l'exposant n'a pas
 * d'emplacement dans ce pavillon (un stand dessiné seulement, par exemple).
 * @param {string} id
 * @param {number} iSoc
 */
export function emplacementPour(id, iSoc){
  return ajoutLie(id, iSoc) || emplacements().find(e => e.id === id) || null;
}

/**
 * La boîte d'un emplacement sur le plan, [x0, y0, x1, y1], lue dans son
 * tracé et non sur son groupe (`getBBox`) : la fiche s'étire depuis elle.
 * Rien sans tracé. Le centre des données n'y suffit pas : c'est l'ancrage du
 * nom, qui n'est le milieu de la boîte que pour un rectangle.
 * @param {{ source: any }} e
 */
export function boiteEmplacement(e){
  const a = anneauxGeo(e && e.source && e.source.d);
  return a.length ? boiteAnneaux(a) : null;
}

/* Les groupes SVG des emplacements, par clé : relevés une fois par pavillon
   écrit, et non à chaque recherche — `montePlan` réécrit les deux groupes d'un
   bloc, et la reprise un groupe à la fois. */
/** @type {Map<string, Element>} */
let groupes = new Map();
/** @type {Element | null} */
let premier = null;
let nombre = -1;
/**
 * Le groupe SVG d'un emplacement, s'il est construit — rien sinon. Les
 * modules qui marquent le SVG pour le rendu de secours passent par lui : ils
 * n'ont alors rien à changer le jour où le WebGL ne construit plus ces groupes.
 * @param {string} cle
 */
export function groupeEmplacement(cle){
  const st = document.getElementById("stands"), zo = document.getElementById("zones");
  const n = (st ? st.childElementCount : 0) + (zo ? zo.childElementCount : 0);
  const p = (zo && zo.firstElementChild) || (st && st.firstElementChild) || null;
  const g = groupes.get(cle);
  if (n !== nombre || p !== premier || (g && !g.isConnected)){
    groupes = new Map(); nombre = n; premier = p;
    for (const hote of [zo, st]) if (hote) for (const x of hote.children){
      const c = cleDuGroupe(x);
      if (c) groupes.set(c, x);
    }
  }
  return groupes.get(cle) || null;
}

/** La clé d'un emplacement, d'après les attributs de son groupe. */
export const cleEmplacement = (/** @type {string | undefined} */ id, /** @type {string | undefined} */ aj) =>
  aj ? "aj:" + aj : "id:" + id;

const E = {
  /** @type {string | null} la clé de l'emplacement allumé */
  choisi: null,
  /** @type {Set<string>} les clés que la recherche retire */
  retires: new Set(),
  /** @type {Set<string>} les clés des zones que le cartouche met en avant */
  phares: new Set(),
  /** @type {Map<string, { h: string, c: string | null }>} la teinte du secteur, par clé */
  secteurs: new Map(),
  /** @type {Map<string, string> | null} la couleur de la chaleur, par clé ; rien carte fermée */
  chaleurs: null,
  /** @type {string | null} l'emplacement repris : son identifiant d'ajout, ou le sien */
  repris: null,
  /** @type {string | null} la clé de la zone que la visite guidée désigne */
  cibleTuto: null,
  /** @type {string | null} la zone dont l'exploitant tient le comptoir (`outil-comptoir.mjs`) */
  comptoir: null,
  /** @type {{ cle: string, i: number } | null} la zone et le rang du camion
   *  que l'exploitant tient (`outil-foodtruck.mjs`) */
  camion: null,
};

export function poseChoisi(/** @type {string | null} */ cle){
  const avant = E.choisi;
  if (avant === cle) return;
  E.choisi = cle;
  const montent = /** @type {string[]} */ ([avant, cle].filter(c => c !== null));
  signaleCles([avant, cle], montent);
}
export function poseRetires(/** @type {Set<string>} */ cles){
  const avant = E.retires;
  E.retires = cles;
  signaleCles(ecart(avant, cles));
}
export function posePhares(/** @type {Set<string>} */ cles){
  const avant = E.phares;
  E.phares = cles;
  signaleCles(ecart(avant, cles));
}
/* La table des secteurs se compare par sa signature : `secteurs.mjs`
   `peintSecteur` change une teinte sur place, dans la table qu'il a posée, et
   la repose. */
let sigSecteurs = "[]";
export function poseSecteurs(/** @type {Map<string, { h: string, c: string | null }>} */ teintes){
  const sig = JSON.stringify([...teintes]);
  const avant = new Map(JSON.parse(sigSecteurs));
  E.secteurs = teintes;
  if (sig === sigSecteurs) return;
  sigSecteurs = sig;
  signaleCles(ecartTables(avant, teintes));
}
export function poseChaleurs(/** @type {Map<string, string> | null} */ couleurs){
  const avant = E.chaleurs;
  E.chaleurs = couleurs;
  signaleCles(ecartTables(avant, couleurs));
}
export function poseRepris(/** @type {string | null} */ id){
  const avant = E.repris;
  if (avant === id) return;
  E.repris = id;
  // l'identifiant propre d'un ajout, ou celui de l'emplacement : sa sorte se lit pareil
  signaleCles([avant, id].map(x => x === null ? null : "id:" + x));
}
export function poseCibleTuto(/** @type {string | null} */ cle){
  const avant = E.cibleTuto;
  if (avant === cle) return;
  E.cibleTuto = cle;
  signaleCles([avant, cle]);
}
export function poseComptoirEnMain(/** @type {string | null} */ cle){
  const avant = E.comptoir;
  if (avant === cle) return;
  E.comptoir = cle;
  signaleCles([avant, cle]);
}
export function poseCamionEnMain(/** @type {{ cle: string, i: number } | null} */ c){
  const avant = E.camion;
  if (JSON.stringify(avant) === JSON.stringify(c)) return;
  E.camion = c;
  signaleCles([avant && avant.cle, c && c.cle]);
}
/** L'exploitant tient-il le comptoir de cette zone ? */
export const comptoirEnMain = (/** @type {string} */ cle) => E.comptoir === cle;
/** Le rang du camion de cette zone que l'exploitant tient, ou rien. */
export const camionEnMain = (/** @type {string} */ cle) => E.camion && E.camion.cle === cle ? E.camion.i : null;

/* Ce que le modèle dit d'une clé, pour qui lisait la classe du groupe : qui
   désigne (`designation.mjs`), la recherche, le cartouche, les marques du
   parcours et des distinctions. */
/** Cet emplacement est-il celui que la fiche allume ? */
export const estChoisi = (/** @type {string} */ cle) => E.choisi === cle;
/** La recherche retire-t-elle cet emplacement ? */
export const estRetire = (/** @type {string} */ cle) => E.retires.has(cle);
/** Le cartouche met-il cette zone en avant ? */
export const estMisEnAvant = (/** @type {string} */ cle) => E.phares.has(cle);

/**
 * La donnée qu'un groupe du plan désigne — l'ajout lui-même pour un
 * emplacement ajouté à la main, l'emplacement sinon —, rien s'il n'est pas
 * celui d'un stand ou d'une zone. C'est par elle que le dessin peint un
 * emplacement : le groupe ne lui sert que de poignée.
 * @param {Element} g
 */
export function donneeDuGroupe(g){
  if (!cleDuGroupe(g)) return null;
  const d = /** @type {SVGElement} */ (g).dataset;
  const o = parId.get(d.aj || d.id || "");
  return o && (o.kind === "stand" || o.kind === "zone") ? o : null;
}

/** La clé d'un groupe du plan, s'il est celui d'un stand ou d'une zone. */
export function cleDuGroupe(/** @type {Element | null} */ g){
  const p = g && /** @type {Element | null} */ (g.parentNode);
  if (!g || !p || (p.id !== "stands" && p.id !== "zones")) return null;
  const d = /** @type {SVGElement} */ (g).dataset;
  return cleEmplacement(d.id, d.aj);
}

/**
 * L'état d'un emplacement, d'après les attributs de son groupe.
 * @param {string | undefined} id `data-id`
 * @param {string | undefined} aj `data-aj`
 * @param {boolean} zone
 * @param {boolean} focus le focus du clavier, montré (`:focus-visible`)
 */
export function etatEmplacement(id, aj, zone, focus){
  const cle = cleEmplacement(id, aj);
  const o = zone && id !== undefined ? parId.get(id) : null;
  return {
    zone, focus,
    sel: E.choisi === cle,
    dim: E.retires.has(cle),
    phare: zone && E.phares.has(cle),
    masquee: Boolean(o && o.masquee),
    repris: E.repris !== null && (aj || id) === E.repris,
    tutoCible: zone && E.cibleTuto === cle,
    sect: zone ? null : E.secteurs.get(cle) || null,
    chal: zone || !E.chaleurs ? null : E.chaleurs.get(cle) || null,
  };
}
