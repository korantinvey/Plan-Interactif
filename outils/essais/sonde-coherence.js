/**
 * Ce qu'un relevé de la sonde doit tenir (`outils/scripts/sonde-coherence.js`),
 * et ce que la page sait du trajet de ses ressources (`mesures-page.mjs`
 * `trajet`, `chargement`).
 *
 * Les règles de vraisemblance relèvent les mesures fausses : il faut qu'elles
 * reconnaissent chacun des défauts qu'on leur a confiés, tels que les relevés
 * du 3 au 10 novembre 2026 les portaient, et qu'elles laissent passer un
 * relevé sain — une règle qui crie à tort, on cesse de la lire. Le trajet,
 * lui, est éprouvé sur les entrées que Chromium rend sous le service de
 * second plan : zéro octet et une livraison « cache », réseau ou copie.
 *
 *   node outils/essais/sonde-coherence.js     (lancé par `npm run essais`)
 */
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const { REGLES, incoherences, bilan, ouvertureInvisible, transfertConnu } = require("../scripts/sonde-coherence.js");

let ko = 0;
const dit = (ok, q, d) => {
  console.log((ok ? "  ok   " : "  ÉCHEC") + "  " + q + (d ? "   → " + d : ""));
  if (!ok) ko++;
};
const cles = (r) => incoherences(r).map((x) => x.cle);
const copie = (o) => JSON.parse(JSON.stringify(o));

/* Un relevé sain, de la forme que la sonde envoie à sa révision 2. */
const SAIN = {
  format: "sonde-plan/1", rev: 2, page: "plan", support: "web", duree: 30000, visibleMs: 29000,
  chargement: {
    jalons: { reponse: 80, domPret: 450, "plan-demarre": 1300, donnees: 1100, toile: 640, "plan-affiche": 1420, lcp: 1150 },
    transfertKo: 640, depuisCache: 0.4, inconnus: 0,
    lourds: [{ fichier: "plan", sorte: "fetch", ms: 600, transfertKo: 530, tailleKo: 536 }],
    images: [[2, 0, 1], [122, 46, 1], [288, 9, 1]],
  },
  fluidite: {
    classique: { gestes: 2, tranches: [40, 5, 3, 1, 1, 0, 0], saccades: 1, partPlus33: 4, auRepos: [6, 1] },
    immersif: { gestes: 0, tranches: [0, 0, 0, 0, 0, 0, 0], saccades: 0, partPlus33: null },
  },
  gels: { n: 3, totalMs: 600, maxMs: 257, api: "loaf",
    pires: [{ ms: 257, t: 1136, avantAffichage: true }, { ms: 192, t: 913, avantAffichage: true }, { ms: 151, t: 5000 }],
    battement: { n: 2, totalMs: 300, maxMs: 200, avantAffichage: 1, pendantGeste: 0, couvertMs: 9000 } },
  reactivite: { n: 1, pireMs: 120, survols: { n: 0, pireMs: 0 } },
  gpu: { repeints: { n: 8, p50: 6.1, p95: 40, max: 58.9 }, pertesContexte: 0 },
  appareil: { mobile: false, reseau: { type: "4g", debitMbps: 10 } },
};

(async () => {
  dit(incoherences(SAIN).length === 0, "un relevé sain ne contredit aucune règle", JSON.stringify(incoherences(SAIN)));
  dit(incoherences(null).length === 0 && incoherences("x").length === 0, "ce qui n'est pas un relevé ne contredit rien");
  dit(new Set(REGLES.map((r) => r.cle)).size === REGLES.length, "chaque règle a sa clé");

  /* La révision que les règles nomment existe dans la sonde : une règle
     « corrigée en révision 3 » quand la sonde en est à 2 ne se vérifierait jamais. */
  const sonde = fs.readFileSync(path.join(__dirname, "..", "gabarit", "modules", "sonde.mjs"), "utf8");
  const revision = Number((/const REVISION = (\d+);/.exec(sonde) || [])[1]);
  dit(revision >= 2 && REGLES.every((r) => !r.corrigee || r.corrigee <= revision),
    "les règles corrigées le sont à une révision que la sonde a atteinte", "sonde à la révision " + revision);

  // — chacun des défauts relevés dans les relevés réels
  const cas = [
    ["instant-nul", (r) => { r.chargement.jalons.domPret = 0; r.chargement.jalons.reponse = 200; }],
    ["jalons-desordre", (r) => { r.chargement.jalons.donnees = 2000; }],
    ["duree-courte", (r) => { r.duree = 1000; r.visibleMs = 900; }],
    ["vu-plus-long", (r) => { r.visibleMs = 40000; }],
    ["ouverture-suspendue", (r) => { r.chargement.images.push([353736, 0, 0]); r.chargement.jalons["plan-affiche"] = 359987; }],
    ["images-ouverture", (r) => { r.chargement.images[1] = [100, 180, 1]; }],
    ["lcp-tardif", (r) => { r.chargement.jalons.lcp = 202412; }],
    ["cache-sous-le-service", (r) => { r.chargement.depuisCache = 1; r.chargement.lourds[0] = { fichier: "plan", sorte: "fetch", ms: 974, transfertKo: 0, tailleKo: 536 }; }],
    ["part-cache-bornes", (r) => { r.chargement.depuisCache = 1.5; }],
    ["gels-comptes", (r) => { r.gels.pires.reverse(); }],
    ["gel-hors-visite", (r) => { r.gels.pires[0].t = 4000; }],
    ["gel-premiere-ligne", (r) => { r.gels.pires[0].lieu = "versions/plan.8aa1d9e951.js:1:1"; }],
    ["battement", (r) => { r.gels.battement.totalMs = 12000; r.gels.battement.maxMs = 200; }],
    ["fluidite", (r) => { r.fluidite.classique.partPlus33 = 34; }],
    ["repeints", (r) => { r.gpu.repeints.p50 = 70; }],
    ["reactivite", (r) => { r.reactivite = { n: 0, pireMs: 8900 }; }],
    ["pertes", (r) => { r.gpu.raisonsPertes = [{ raison: "x" }]; }],
    ["panne-affichee", (r) => { r.chargement.panne = { sorte: "reseau" }; }],
    ["aller-retour-nul", (r) => { r.appareil.reseau.rttMs = 0; }],
  ];
  for (const [cle, abime] of cas) {
    const r = copie(SAIN);
    abime(r);
    const l = cles(r);
    dit(l.includes(cle), "la règle « " + cle + " » relève son défaut", l.join(", ") || "rien");
  }
  const essayees = new Set(cas.map((c) => c[0]));
  dit(REGLES.every((r) => essayees.has(r.cle)), "chaque règle a son défaut éprouvé",
    REGLES.filter((r) => !essayees.has(r.cle)).map((r) => r.cle).join(", "));

  // — la fluidité recalcule la part des images lentes à partir de 33 ms, comme la sonde
  {
    const r = copie(SAIN);
    r.fluidite.classique = { gestes: 1, tranches: [10, 0, 0, 10, 0, 0, 0], saccades: 0, partPlus33: 50 };
    dit(!cles(r).includes("fluidite"), "la tranche 33–50 ms compte parmi les lentes");
  }

  // — une règle qui lève ne fait pas tomber le relevé : elle se dit en défaut
  {
    const r = copie(SAIN);
    r.fluidite = { classique: { gestes: 1, tranches: [1, 0, 0, 0, 0, 0, 0], auRepos: null, partPlus33: 0 } };
    Object.defineProperty(r.fluidite.classique, "saccades", { get() { throw new Error("piège"); } });
    const l = incoherences(r);
    dit(l.some((x) => x.cle === "fluidite" && /défaut/.test(x.detail)), "une règle qui lève se dit en défaut", JSON.stringify(l));
  }

  // — l'ouverture que personne ne regardait, d'une révision à l'autre
  {
    const r2 = copie(SAIN);
    dit(!ouvertureInvisible(r2), "une ouverture vue est vue");
    r2.chargement.invisibleAvantMs = 70000;
    dit(ouvertureInvisible(r2), "révision 2 : le temps invisible le dit");
    const r1 = copie(SAIN);
    delete r1.rev;
    r1.chargement.images.push([86482, 0, 0]);
    dit(ouvertureInvisible(r1), "révision 1 : une image de l'ouverture longue de 86 s le trahit");
    r1.chargement.images.pop();
    r1.chargement.cacheeAvant = true;
    dit(ouvertureInvisible(r1), "révision 1 : la page cachée le dit");
  }

  // — le transfert connu, d'une révision à l'autre
  {
    const r2 = copie(SAIN);
    dit(transfertConnu(r2), "révision 2 : sans ressource inconnue, le transfert est connu");
    r2.chargement.inconnus = 11;
    dit(!transfertConnu(r2), "révision 2 : des ressources au trajet inconnu le rendent inconnu");
    const r1 = copie(SAIN);
    delete r1.rev;
    dit(transfertConnu(r1), "révision 1 : une part du cache partielle le laisse connu");
    r1.chargement.depuisCache = 1;
    dit(!transfertConnu(r1), "révision 1 : une page entière « servie par le cache » ne dit rien du transfert");
  }

  // — le bilan sépare la dernière révision des autres
  {
    const vieux = copie(SAIN); delete vieux.rev; vieux.appareil.reseau.rttMs = 0;
    const neuf = copie(SAIN); neuf.appareil.reseau.rttMs = 0;
    const b = bilan([vieux, vieux, neuf, copie(SAIN)]);
    const x = b.regles.find((y) => y.cle === "aller-retour-nul");
    dit(b.revision === 2 && b.douteux === 3 && x && x.n === 3 && x.recents === 1,
      "le bilan compte par règle, et ce qui reste à la dernière révision", JSON.stringify(b));
  }

  // — le trajet des ressources, tel que Chromium le rend (relevé le 10 novembre 2026)
  {
    const m = await import(pathToFileURL(path.join(__dirname, "..", "gabarit", "modules", "mesures-page.mjs")));
    const entree = (o) => ({ name: "https://salon.example/api/plan?slug=s&v=1", initiatorType: "fetch", startTime: 100,
      duration: 300, workerStart: 0, deliveryType: "", transferSize: 0, encodedBodySize: 0, decodedBodySize: 0, ...o });
    const reseau = entree({ transferSize: 200327, decodedBodySize: 200027 });
    const copieHttp = entree({ transferSize: 0, decodedBodySize: 200027, deliveryType: "cache" });
    // l'entête « no-store », venu du réseau en 308 ms au travers du service
    const parLeService = entree({ workerStart: 28, transferSize: 0, decodedBodySize: 200027, deliveryType: "cache", duration: 308 });
    const deSaCopie = entree({ workerStart: 29, transferSize: 0, decodedBodySize: 6181417, deliveryType: "cache-storage" });
    const cachee = entree({ transferSize: 0, decodedBodySize: 0 });
    dit(m.trajet(reseau) === "reseau" && m.trajet(copieHttp) === "garde", "hors du service, le transfert dit le trajet");
    dit(m.trajet(parLeService) === "inconnu", "passée par le service, « cache » ne dit rien");
    dit(m.trajet(deSaCopie) === "garde", "sortie de la copie du service, elle est gardée");
    dit(m.trajet(cachee) === "inconnu", "un corps caché par une autre origine est inconnu");

    const vraie = globalThis.performance.getEntriesByType;
    const pose = (nav, ressources) => {
      globalThis.performance.getEntriesByType = (t) => (t === "navigation" ? [nav] : t === "resource" ? ressources : []);
    };
    try {
      pose({ workerStart: 12, transferSize: 0, responseEnd: 90, domContentLoadedEventEnd: 0, loadEventEnd: 0, type: "navigate" },
        [parLeService, deSaCopie, { ...parLeService, name: "https://salon.example/versions/plan.0123456789.js", initiatorType: "script" }]);
      const c = m.chargement(5);
      dit(c.inconnus === 2 && c.depuisCache === 1 && c.transfertKo === 0,
        "sous le service : deux inconnues, la copie seule compte", JSON.stringify({ i: c.inconnus, d: c.depuisCache, t: c.transfertKo }));
      dit(c.page.parLeService === true && c.page.transfertKo === undefined, "le document passé par le service ne dit pas son transfert");
      dit(c.page.domPret === undefined && c.page.charge === undefined && c.page.reponse === 90,
        "un instant non atteint est absent, non nul", JSON.stringify(c.page));
      const lourd = c.ressources.find((x) => x.ms === 308);
      dit(lourd && lourd.transfertKo === undefined && lourd.tailleKo === 195, "la ressource lourde inconnue n'a pas de transfert", JSON.stringify(lourd));

      pose({ workerStart: 0, transferSize: 4000, responseEnd: 90, domContentLoadedEventEnd: 400, loadEventEnd: 900, type: "navigate" },
        [reseau, copieHttp, cachee]);
      const d = m.chargement(5);
      dit(d.inconnus === 1 && d.depuisCache === 0.5 && d.transfertKo === Math.round((4000 + 200327) / 1024),
        "sans service : le réseau et le cache se comptent, l'inconnue à part", JSON.stringify({ i: d.inconnus, d: d.depuisCache, t: d.transfertKo }));

      pose(null, [cachee]);
      dit(m.chargement(5).depuisCache === undefined, "rien de connu : la part du cache est absente, non nulle");
    } finally {
      globalThis.performance.getEntriesByType = vraie;
    }
    dit(m.PREMIERE_LENTE === 3 && m.TRANCHES[m.PREMIERE_LENTE - 1] === 33, "la première tranche lente commence après 33 ms");
  }

  console.log(ko ? "\n" + ko + " échec(s)." : "\nTout passe.");
  process.exit(ko ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
