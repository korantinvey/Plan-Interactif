/**
 * Ce qu'un relevé de la sonde doit tenir pour être vraisemblable.
 *
 * Les mesures fausses de la sonde (`outils/gabarit/modules/sonde.mjs`) se
 * découvraient par hasard, en lisant les relevés pour autre chose : un jalon
 * des données négatif, des survols pris pour la pire interaction, un plan
 * « affiché » en deux heures et demie parce que le cadre qui le portait était
 * sorti de l'écran, toute une page « servie par le cache » parce que le
 * service de second plan la servait. Chacune contredisait le relevé lui-même :
 * un instant avant celui qui le précède, une part au-delà du tout, une image
 * plus longue que l'ouverture qui la contient. Ces contradictions sont écrites
 * ici, une fois, et appliquées deux fois :
 *
 *   — les essais de la sonde les imposent à chaque résumé qu'ils reçoivent
 *     (`outils/essais/navigateur/sonde.spec.js`) : une retouche qui fausse une
 *     mesure échoue avant d'être fusionnée ;
 *   — la fiche du lundi (`performances.js`) compte, règle par règle, les
 *     relevés de la semaine qui les contredisent : ce que les essais ne
 *     montrent pas — un navigateur, un cadre, un appareil qu'ils n'ont pas —
 *     se voit sans qu'on le cherche.
 *
 * Une règle porte `corrigee` quand le défaut qu'elle relève a été corrigé à
 * cette révision de la sonde (`rev`) : les relevés d'avant la contredisent
 * encore, ceux d'après ne le doivent plus. Une règle sans `corrigee` vaut
 * pour toutes les révisions.
 *
 *   node outils/scripts/sonde-coherence.js relevés.json
 *     compte les relevés douteux d'un fichier écrit par `lecture-perf.js`.
 *
 * Rien ici ne lit un texte du relevé pour le rendre : les règles ne disent
 * que leur nom et des nombres, que la fiche publique peut citer.
 */

/** Un nombre du relevé, ou `undefined`. */
const n = (v) => (typeof v === "number" && Number.isFinite(v) ? v : undefined);
const somme = (l) => l.reduce((a, b) => a + (n(b) || 0), 0);

/* Au-delà, une image de l'ouverture n'a pas été dessinée lentement : le
   navigateur a cessé d'en donner, la page cachée ou le cadre hors de l'écran. */
const IMAGE_SUSPENDUE = 10000;

const jalonsDe = (r) => (r && r.chargement && r.chargement.jalons) || {};

/**
 * L'ouverture s'est-elle faite sans personne pour la regarder ? Ses délais
 * disent alors quand on est revenu, non ce que la page a coûté : la fiche
 * les retire de ses médianes. La révision 2 le dit (`invisibleAvantMs`,
 * `horsVueAvant`) ; avant, seule la page cachée était marquée, et une image
 * de l'ouverture longue de plus de dix secondes trahit le reste.
 */
function ouvertureInvisible(r) {
  const c = r && r.chargement;
  if (!c) return false;
  if (c.cacheeAvant || c.horsVueAvant || n(c.invisibleAvantMs) > 0) return true;
  if ((n(r.rev) || 1) >= 2) return false;
  return Array.isArray(c.images) && c.images.some((x) => Array.isArray(x) && n(x[0]) > IMAGE_SUSPENDUE);
}

/**
 * Le transfert de l'ouverture est-il connu ? Sous le service de second plan,
 * le navigateur annonce zéro octet, réseau ou copie (`mesures-page.mjs`
 * `trajet`). La révision 2 compte ce qu'elle ne sait pas (`inconnus`) ; avant,
 * une part servie par le cache de 100 % est ce que produisait le service.
 */
function transfertConnu(r) {
  const c = r && r.chargement;
  if (!c || n(c.transfertKo) === undefined) return false;
  if ((n(r.rev) || 1) >= 2) return !(n(c.inconnus) > 0) && !c.parLeService;
  return c.depuisCache !== 1;
}

/** Les règles. `test` rend un court détail chiffré si le relevé la contredit, rien sinon. */
const REGLES = [
  {
    cle: "jalons-desordre",
    texte: "jalons de l'ouverture dans le désordre",
    test(r) {
      const j = jalonsDe(r);
      const paires = [["reponse", "domPret"], ["donnees", "plan-affiche"], ["toile", "plan-affiche"], ["reponse", "plan-affiche"]];
      for (const [a, b] of paires) {
        // un zéro est un instant non atteint, que relève la règle suivante
        if (n(j[a]) > 0 && n(j[b]) > 0 && j[a] > j[b]) return a + " " + j[a] + " > " + b + " " + j[b];
      }
    },
  },
  {
    cle: "instant-nul",
    texte: "instant non atteint envoyé comme zéro",
    corrigee: 2,
    test(r) {
      const j = jalonsDe(r);
      for (const k of ["reponse", "domPret"]) if (j[k] === 0) return k;
    },
  },
  {
    cle: "duree-courte",
    texte: "visite plus courte que son ouverture",
    test(r) {
      const a = n(jalonsDe(r)["plan-affiche"]);
      if (r && r.chargement && a !== undefined && n(r.duree) < a) return r.duree + " < " + a;
    },
  },
  {
    cle: "vu-plus-long",
    texte: "temps vu plus long que la visite",
    test(r) {
      if (n(r.visibleMs) > n(r.duree) + 1000) return r.visibleMs + " > " + r.duree;
    },
  },
  {
    cle: "ouverture-suspendue",
    texte: "ouverture suspendue sans être dite invisible",
    corrigee: 2,
    test(r) {
      const c = r && r.chargement;
      if (!c || !Array.isArray(c.images) || c.cacheeAvant || c.horsVueAvant || n(c.invisibleAvantMs) > 0) return;
      const longue = c.images.find((x) => Array.isArray(x) && n(x[0]) > IMAGE_SUSPENDUE);
      if (longue) return "image de " + longue[0] + " ms";
    },
  },
  {
    cle: "images-ouverture",
    texte: "images de l'ouverture incohérentes",
    test(r) {
      const c = r && r.chargement, j = jalonsDe(r);
      if (!c || !Array.isArray(c.images)) return;
      for (const x of c.images) {
        if (!Array.isArray(x)) return "image illisible";
        if (n(x[1]) > n(x[0]) + 2) return "attente " + x[1] + " > image " + x[0];
        if (n(x[2]) < 0) return "programmes négatifs";
      }
      const t = n(j.toile), a = n(j["plan-affiche"]);
      const total = somme(c.images.map((x) => x[0]));
      if (t !== undefined && a !== undefined && total > a - t + 50) return "images " + total + " > ouverture " + (a - t);
    },
  },
  {
    cle: "lcp-tardif",
    texte: "LCP longtemps après l'affichage",
    corrigee: 2,
    test(r) {
      const j = jalonsDe(r);
      if (n(j.lcp) !== undefined && n(j["plan-affiche"]) !== undefined && j.lcp > j["plan-affiche"] + 60000) return "lcp " + j.lcp;
    },
  },
  {
    cle: "cache-sous-le-service",
    texte: "page entière « servie par le cache » avec un appel lent",
    corrigee: 2,
    test(r) {
      const c = r && r.chargement;
      if (!c || c.depuisCache !== 1 || !Array.isArray(c.lourds)) return;
      const lent = c.lourds.find((x) => x && x.sorte === "fetch" && n(x.ms) > 300 && x.transfertKo === 0);
      if (lent) return "appel de " + lent.ms + " ms sans octet";
    },
  },
  {
    cle: "part-cache-bornes",
    texte: "part servie par le cache hors de 0 à 1",
    test(r) {
      const d = r && r.chargement && r.chargement.depuisCache;
      if (d !== undefined && d !== null && !(n(d) >= 0 && d <= 1)) return String(d);
    },
  },
  {
    cle: "gels-comptes",
    texte: "comptes des gels incohérents",
    test(r) {
      const g = r && r.gels;
      if (!g) return;
      if (n(g.maxMs) > n(g.totalMs)) return "max " + g.maxMs + " > total " + g.totalMs;
      const p = Array.isArray(g.pires) ? g.pires : [];
      for (let i = 1; i < p.length; i++) if (n(p[i].ms) > n(p[i - 1].ms)) return "pires non triés";
      if (p.length && Math.abs(n(p[0].ms) - n(g.maxMs)) > 1) return "pire " + p[0].ms + " ≠ max " + g.maxMs;
      if (p.length > n(g.n)) return p.length + " pires pour " + g.n + " gels";
    },
  },
  {
    cle: "gel-hors-visite",
    texte: "gel placé hors de la visite ou de son ouverture",
    test(r) {
      const p = (r && r.gels && Array.isArray(r.gels.pires)) ? r.gels.pires : [];
      const a = n(jalonsDe(r)["plan-affiche"]);
      for (const x of p) {
        if (n(x.t) > n(r.duree) + 1000) return "t " + x.t + " > durée " + r.duree;
        if (x.avantAffichage && r.chargement && a !== undefined && n(x.t) > a) return "avant l'affichage à " + x.t + " > " + a;
      }
    },
  },
  {
    cle: "gel-premiere-ligne",
    texte: "gel rangé à la première ligne du paquet",
    corrigee: 2,
    test(r) {
      const p = (r && r.gels && Array.isArray(r.gels.pires)) ? r.gels.pires : [];
      const x = p.find((y) => /:1:1$/.test(String(y.lieu || "")));
      if (x) return "gel de " + x.ms + " ms";
    },
  },
  {
    cle: "battement",
    texte: "battement incohérent",
    test(r) {
      const b = r && r.gels && r.gels.battement;
      if (!b) return;
      if (n(b.maxMs) > n(b.totalMs)) return "max > total";
      if (n(b.totalMs) > n(b.couvertMs) + 1) return "retard " + b.totalMs + " > couvert " + b.couvertMs;
      if (n(b.avantAffichage) > n(b.n) || n(b.pendantGeste) > n(b.n)) return "parts > total";
    },
  },
  {
    cle: "fluidite",
    texte: "fluidité incohérente",
    test(r) {
      const f = (r && r.fluidite) || {};
      for (const [vue, v] of Object.entries(f)) {
        if (!v || !Array.isArray(v.tranches)) continue;
        const images = somme(v.tranches);
        if (!n(v.gestes) && images > 0) return vue + " : " + images + " images sans geste";
        if (n(v.saccades) > images) return vue + " : saccades > images";
        if (Array.isArray(v.auRepos) && (n(v.auRepos[0]) > images || n(v.auRepos[1]) > n(v.auRepos[0]))) return vue + " : repos > images";
        if (images && n(v.partPlus33) !== undefined) {
          const lentes = somme(v.tranches.slice(3));
          if (Math.abs(100 * lentes / images - v.partPlus33) > 0.2) return vue + " : part " + v.partPlus33 + " ≠ tranches";
        }
      }
    },
  },
  {
    cle: "repeints",
    texte: "centiles des repeints dans le désordre",
    test(r) {
      const p = r && r.gpu && r.gpu.repeints;
      if (p && n(p.p50) !== undefined && !(p.p50 <= p.p95 && p.p95 <= p.max)) return p.p50 + " / " + p.p95 + " / " + p.max;
    },
  },
  {
    cle: "reactivite",
    texte: "pire interaction sans interaction",
    test(r) {
      const x = r && r.reactivite;
      if (x && n(x.pireMs) > 0 && !(n(x.n) > 0)) return x.pireMs + " ms";
    },
  },
  {
    cle: "pertes",
    texte: "plus de raisons que de pertes du dessin",
    test(r) {
      const g = r && r.gpu;
      if (g && Array.isArray(g.raisonsPertes) && g.raisonsPertes.length > (n(g.pertesContexte) || 0)) return g.raisonsPertes.length + " > " + g.pertesContexte;
    },
  },
  {
    cle: "panne-affichee",
    texte: "panne dite pour un plan affiché",
    test(r) {
      const c = r && r.chargement;
      if (c && c.panne && n(jalonsDe(r)["plan-affiche"]) !== undefined) return String(c.panne.sorte || "");
    },
  },
  {
    cle: "aller-retour-nul",
    texte: "aller-retour du réseau nul",
    corrigee: 2,
    test(r) {
      const x = r && r.appareil && r.appareil.reseau;
      if (x && x.rttMs === 0) return "0";
    },
  },
];

/** Les règles qu'un résumé contredit : `[{ cle, texte, detail }]`, vide s'il est vraisemblable. */
function incoherences(r) {
  if (!r || typeof r !== "object") return [];
  const l = [];
  for (const regle of REGLES) {
    let d;
    try { d = regle.test(r); } catch (e) { d = "règle en défaut : " + e.message; }
    if (d) l.push({ cle: regle.cle, texte: regle.texte, detail: String(d) });
  }
  return l;
}

/**
 * Le compte d'une liste de relevés, règle par règle : `n` relevés la
 * contredisent, dont `recents` de la plus haute révision vue. Une règle
 * corrigée qui en compte encore de récents est un défaut revenu.
 */
function bilan(resumes) {
  const l = resumes.filter((r) => r && typeof r === "object");
  const recente = Math.max(1, ...l.map((r) => n(r.rev) || 1));
  const parRegle = new Map(REGLES.map((x) => [x.cle, { cle: x.cle, texte: x.texte, corrigee: x.corrigee, n: 0, recents: 0 }]));
  let douteux = 0;
  for (const r of l) {
    const inc = incoherences(r);
    if (inc.length) douteux++;
    for (const x of inc) {
      const b = parRegle.get(x.cle);
      b.n++;
      if ((n(r.rev) || 1) === recente) b.recents++;
    }
  }
  return { releves: l.length, douteux, revision: recente,
    regles: [...parRegle.values()].filter((x) => x.n).sort((a, b) => b.n - a.n) };
}

module.exports = { REGLES, incoherences, bilan, ouvertureInvisible, transfertConnu, IMAGE_SUSPENDUE };

if (require.main === module) {
  const fichier = process.argv[2];
  if (!fichier) {
    console.error("Usage : node outils/scripts/sonde-coherence.js relevés.json (écrit par lecture-perf.js releves --sortie)");
    process.exit(1);
  }
  const lignes = JSON.parse(require("fs").readFileSync(fichier, "utf8"));
  const resumes = lignes.map((x) => (x && x.resume) || x);
  const b = bilan(resumes);
  console.log(b.releves + " relevés, " + b.douteux + " douteux ; révision la plus récente : " + b.revision);
  for (const x of b.regles) {
    console.log(String(x.n).padStart(5) + "  " + x.texte + (x.corrigee ? " (corrigée en révision " + x.corrigee + ")" : "") +
      (x.recents && x.recents !== x.n ? " — dont " + x.recents + " récents" : ""));
  }
}
