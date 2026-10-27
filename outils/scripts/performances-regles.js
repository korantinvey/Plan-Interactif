/**
 * Les règles de la fiche de pistes : un indicateur, un seuil, un levier.
 *
 * Chaque règle lit les indicateurs de la semaine (`performances.js`
 * `indicateurs`) et dit, si elle se déclenche, combien de visites elle touche
 * et de combien on dépasse le seuil — en part du seuil, pour que des
 * millisecondes et des pourcentages se classent ensemble. La fiche les range
 * par gain estimé, `touche × ecart` : ce qui gêne beaucoup de monde un peu
 * passe devant ce qui gêne trois visites énormément.
 *
 * Les seuils sont des **premières valeurs**, posées avant tout relevé réel :
 * à reprendre quand quelques semaines de mesures diront où se tient le plan.
 * Une règle qui vaut pour plusieurs choses à la fois (un fichier, une famille
 * d'appareils) rend une liste de pistes, une par chose.
 */

/* Sous ce nombre de visites, un centile se lit dans le bruit : une règle n'en tire rien. */
const MIN_VISITES = 10;

/* Les seuils de départ. */
const SEUILS = {
  // le temps de recevoir les données du salon, sur téléphone : au-delà, le plan reste blanc
  donneesTelephoneMs: 2500,
  // un fichier qui compte parmi les plus lourds d'une visite sur deux pèse sur toutes
  partFichierLourd: 0.5,
  /* Un appel ne figure parmi les ressources relevées que s'il a passé 150 ms
     (`mesures-page.mjs` `chargement`) : y revenir dit déjà qu'il est lent. Une
     visite sur quatre suffit donc, et c'est sa durée qui fait la piste — une
     demi-seconde attendue à l'ouverture. */
  partAppelLent: 0.25,
  appelLentMs: 500,
  // des données reçues au plan affiché : le montage, que le visiteur attend sans rien voir
  preparationMs: 1500,
  // l'immersif peut coûter un peu plus que la vue classique, pas dix points d'images lentes
  ecartImmersifPoints: 10,
  // repeints au 95e centile : au-delà de deux images, le geste accroche
  repeintMs: 33,
  // la mémoire des textures de logos, sur téléphone
  logosTelephoneMo: 64,
  // une perte de contexte sur cinquante visites d'une même famille d'appareils
  partPertes: 0.02,
  // une version qui fait perdre un cinquième sur un indicateur
  regressionVersion: 0.2,
};

const ms = (v) => Math.round(v) + " ms";
const s1 = (v) => (Math.round(v / 100) / 10).toFixed(1).replace(".", ",") + " s";
/** Ce qu'une ressource coûte, en médiane sur les visites où elle figure. */
const mesures = (f) => {
  const m = [];
  if (f.taille_p50 > 0) m.push(Math.round(f.taille_p50) + " Ko");
  if (f.ms_p50 != null) m.push(ms(f.ms_p50));
  return m.length ? ", " + m.join(" et ") + " médians" : "";
};
const nomGroupe = (g) => (g.mobile ? "téléphone" : "bureau") + " · " + g.page;

const REGLES = [
  {
    id: "donnees-telephone",
    titre: "Les données du salon arrivent lentement sur téléphone",
    levier: "Alléger ou différer les données du salon (`/api/plan`) ; vérifier que le Worker les sert depuis son cache.",
    applique: (ind) => ind.groupes
      .filter((g) => g.mobile && g.visites >= MIN_VISITES && g.donnees_p50 > SEUILS.donneesTelephoneMs)
      .map((g) => ({
        touche: g.visites,
        ecart: (g.donnees_p50 - SEUILS.donneesTelephoneMs) / SEUILS.donneesTelephoneMs,
        detail: nomGroupe(g) + " : médiane " + s1(g.donnees_p50) + " (seuil " + s1(SEUILS.donneesTelephoneMs) + ")",
      })),
  },
  {
    id: "fichier-lourd",
    titre: "Un fichier revient parmi les plus lourds ou les plus lents",
    levier: "Le compresser, le découper ou le charger plus tard.",
    /* La taille est celle du fichier lu, et non ce qui a passé le réseau : un
       script servi par le cache n'a rien transféré, mais il se lit et se lance
       quand même — la fiche du 26 octobre en affichait « 0 Ko médian ». */
    applique: (ind) => ind.fichiers
      .filter((f) => !f.appel && f.total >= MIN_VISITES && f.part > SEUILS.partFichierLourd)
      .map((f) => ({
        touche: f.visites,
        ecart: (f.part - SEUILS.partFichierLourd) / SEUILS.partFichierLourd,
        detail: "`" + f.fichier + "` (" + f.page + ") : dans " + Math.round(f.part * 100) +
          " % des visites" + mesures(f),
      })),
  },
  {
    id: "appel-lent",
    titre: "Un appel fait attendre l'ouverture",
    levier: "Le servir de plus près (stockage du Worker, cache du navigateur), le demander plus tôt, ou ne plus faire attendre la page sur lui.",
    applique: (ind) => ind.fichiers
      .filter((f) => f.appel && f.total >= MIN_VISITES && f.part > SEUILS.partAppelLent &&
        f.ms_p50 > SEUILS.appelLentMs)
      .map((f) => ({
        touche: f.visites,
        ecart: (f.ms_p50 - SEUILS.appelLentMs) / SEUILS.appelLentMs,
        detail: "`" + f.fichier + "` (" + f.page + ") : plus de 150 ms dans " + Math.round(f.part * 100) +
          " % des visites" + mesures(f),
      })),
  },
  {
    id: "preparation-longue",
    titre: "Le plan met longtemps à se monter une fois les données reçues",
    levier: "Coût du montage : voir les gels de la semaine et les scripts qu'ils désignent.",
    applique: (ind) => ind.groupes
      .filter((g) => g.visites >= MIN_VISITES && g.preparation_p50 > SEUILS.preparationMs)
      .map((g) => ({
        touche: g.visites,
        ecart: (g.preparation_p50 - SEUILS.preparationMs) / SEUILS.preparationMs,
        detail: nomGroupe(g) + " : médiane " + s1(g.preparation_p50) + " (seuil " + s1(SEUILS.preparationMs) + ")",
      })),
  },
  {
    /* La part d'images lentes et la durée des repeints se mesurent partout ;
       `gpuTime` manque sur la plupart des téléphones. Il s'ajoute au détail
       quand il existe, il ne décide jamais. */
    id: "immersif-lourd",
    titre: "La vue immersive est nettement moins fluide que la classique",
    levier: "Trop de dessin : couches, résolution en mouvement, textures.",
    applique: (ind) => ind.groupes.map((g) => {
      const c = g.vues.classique, i = g.vues.immersif;
      if (!c || !i || c.visites < MIN_VISITES || i.visites < MIN_VISITES) return null;
      const ecartPoints = i.part_p50 - c.part_p50;
      const repeintLong = i.repeint_p50 != null && i.repeint_p50 > SEUILS.repeintMs;
      if (!(ecartPoints > SEUILS.ecartImmersifPoints) && !repeintLong) return null;
      const ecart = Math.max(0, (ecartPoints - SEUILS.ecartImmersifPoints) / SEUILS.ecartImmersifPoints,
        repeintLong ? (i.repeint_p50 - SEUILS.repeintMs) / SEUILS.repeintMs : 0);
      return {
        touche: i.visites,
        ecart,
        detail: nomGroupe(g) + " : " + Math.round(i.part_p50) + " % d'images lentes contre " +
          Math.round(c.part_p50) + " % en classique" +
          (i.repeint_p50 != null ? ", repeints " + ms(i.repeint_p50) + " au 95e centile" : "") +
          (i.gpu_p50 != null ? ", GPU " + ms(i.gpu_p50) : ""),
      };
    }).filter(Boolean),
  },
  {
    id: "logos-telephone",
    titre: "Les logos prennent trop de mémoire sur téléphone",
    levier: "Réduire la taille des vignettes envoyées à la carte graphique.",
    applique: (ind) => ind.groupes
      .filter((g) => g.mobile && g.logos_visites >= MIN_VISITES && g.logos_mo_p50 > SEUILS.logosTelephoneMo)
      .map((g) => ({
        touche: g.logos_visites,
        ecart: (g.logos_mo_p50 - SEUILS.logosTelephoneMo) / SEUILS.logosTelephoneMo,
        detail: nomGroupe(g) + " : " + Math.round(g.logos_mo_p50) + " Mo médian (seuil " +
          SEUILS.logosTelephoneMo + " Mo)",
      })),
  },
  {
    id: "pertes-contexte",
    titre: "Une famille d'appareils perd son contexte WebGL",
    levier: "Un mode allégé pour elle : moins de textures, rendu SVG d'emblée.",
    applique: (ind) => ind.familles
      .filter((f) => f.visites >= MIN_VISITES && f.avecPerte / f.visites > SEUILS.partPertes)
      .map((f) => ({
        touche: f.avecPerte,
        ecart: (f.avecPerte / f.visites - SEUILS.partPertes) / SEUILS.partPertes,
        detail: f.famille + " : " + f.avecPerte + " visites sur " + f.visites,
      })),
  },
];

/** Les pistes de la semaine, la plus rentable d'abord. */
function pistes(indicateurs) {
  const tout = [];
  for (const r of REGLES) {
    const rendu = r.applique(indicateurs);
    for (const p of [].concat(rendu || [])) {
      tout.push({ id: r.id, titre: r.titre, levier: r.levier, detail: p.detail,
                  gain: Math.round(p.touche * p.ecart * 10) / 10 });
    }
  }
  return tout.sort((a, b) => b.gain - a.gain);
}

/* Ce qui se compare d'une version à l'autre, et dans quel sens c'est pire. */
const SUIVIS = [
  ["affiche_p50", "ouverture médiane", s1],
  ["donnees_p50", "données médianes", s1],
  ["part_p50", "images lentes", (v) => Math.round(v) + " %"],
];

/**
 * Les indicateurs qui se dégradent d'une version des pages à la suivante, par
 * page et support. Les versions se suivent dans l'ordre où elles ont paru.
 */
function regressions(indicateurs) {
  const lignes = [];
  const parGroupe = new Map();
  for (const v of indicateurs.versions) {
    const k = v.page + "|" + v.mobile;
    if (!parGroupe.has(k)) parGroupe.set(k, []);
    parGroupe.get(k).push(v);
  }
  for (const liste of parGroupe.values()) {
    const sures = liste.filter((v) => v.visites >= MIN_VISITES).sort((a, b) => a.premier.localeCompare(b.premier));
    for (let i = 1; i < sures.length; i++) {
      const a = sures[i - 1], b = sures[i];
      for (const [cle, nom, dit] of SUIVIS) {
        if (a[cle] == null || b[cle] == null || !(a[cle] > 0)) continue;
        if ((b[cle] - a[cle]) / a[cle] > SEUILS.regressionVersion) {
          lignes.push({ page: b.page, mobile: b.mobile, avant: a.version, apres: b.version,
                        indicateur: nom, de: dit(a[cle]), a: dit(b[cle]) });
        }
      }
    }
  }
  return lignes;
}

module.exports = { REGLES, SEUILS, MIN_VISITES, pistes, regressions };
