/**
 * La table de règles de la fiche de pistes : indicateur → seuil → levier.
 *
 * Une règle regarde les indicateurs d'une page sur un type d'appareil
 * (`outils/performances.js` `indicateurs`) et répond `null` si tout va bien,
 * sinon trois choses : combien de visites sont touchées, de combien l'indicateur
 * dépasse son seuil (en proportion du seuil, pour que des millisecondes et des
 * mégaoctets se classent ensemble), et une phrase qui dit quoi. Le gain estimé
 * d'une piste est le produit des deux : une lenteur modeste que tout le monde
 * subit passe avant une lenteur énorme que trois visiteurs ont vue.
 *
 * LES SEUILS SONT PROVISOIRES. Ils sont posés d'après ce qu'on sait d'un
 * téléphone moyen, pas d'après des mesures du plan : à reposer dès les premiers
 * relevés réels, en regardant où se situent les médianes d'un salon qui se
 * comporte bien. Les changer ne demande que de retoucher les constantes
 * ci-dessous — la fiche, elle, ne bouge pas.
 *
 * Ce module est pur (aucun réseau, aucune date) pour que les essais le
 * éprouvent sur des indicateurs fabriqués.
 */

/* Provisoires — à reposer d'après les premiers relevés réels. */
const SEUIL = {
  /** données du salon reçues (médiane, ms), sur téléphone */
  donneesMs: 1500,
  /** un fichier est « dans les plus lourds » de plus de cette part des visites */
  partLourd: 0.5,
  /** …et pèse au moins autant (ko transférés, médiane) pour mériter d'être cité */
  lourdKo: 100,
  /** préparation (données reçues → plan affiché, médiane, ms) */
  preparationMs: 800,
  /** immersif plus saccadé que classique : écart de part d'images > 33 ms */
  ecartFluidite: 0.10,
  /** visites immersives minimales pour qu'une médiane veuille dire quelque chose */
  immersifMin: 5,
  /** repeint long (centile 95, ms) : au-delà de deux images à 60 Hz */
  repeintMs: 33,
  /** mémoire des textures de logos (médiane, Mo), sur téléphone */
  logosMo: 64,
  /** part de visites d'une famille d'appareils qui perdent le contexte WebGL */
  partPertes: 0.10,
  /** visites minimales d'une famille avant de la mettre en cause */
  familleMin: 5,
};

const arrondi = (x) => Math.round(x * 10) / 10;
const proportion = (valeur, seuil) => valeur / seuil - 1;

const REGLES = [
  {
    id: "donnees",
    titre: "Les données du salon arrivent lentement sur téléphone",
    levier: "Alléger ou différer les données du salon ; vérifier le cache du Worker (`/api/plan`).",
    applique(ind) {
      if (!ind.mobile || ind.donneesP50 == null || ind.donneesP50 <= SEUIL.donneesMs) return null;
      return {
        touche: ind.visites,
        ecart: proportion(ind.donneesP50, SEUIL.donneesMs),
        detail: "les données mettent " + Math.round(ind.donneesP50) + " ms à arriver (médiane ; seuil " + SEUIL.donneesMs + " ms)",
      };
    },
  },
  {
    id: "lourd",
    titre: "Un même gros fichier pèse sur la majorité des visites",
    levier: "Le compresser, le découper, ou le charger plus tard.",
    applique(ind) {
      let meilleur = null;
      for (const f of ind.lourds || []) {
        if (f.part <= SEUIL.partLourd || f.koP50 < SEUIL.lourdKo) continue;
        const touche = Math.round(f.part * ind.visites);
        const ecart = (f.part - SEUIL.partLourd) / SEUIL.partLourd;
        if (!meilleur || touche * ecart > meilleur.touche * meilleur.ecart) {
          meilleur = { touche, ecart, detail: "`" + f.fichier + "` figure parmi les plus lourds de " + Math.round(f.part * 100) + " % des visites (" + Math.round(f.koP50) + " ko, médiane)" };
        }
      }
      return meilleur;
    },
  },
  {
    id: "preparation",
    titre: "La préparation du plan est longue",
    levier: "Réduire le coût du montage ; voir les gels et les scripts qui les causent.",
    applique(ind) {
      if (ind.preparationP50 == null || ind.preparationP50 <= SEUIL.preparationMs) return null;
      return {
        touche: ind.visites,
        ecart: proportion(ind.preparationP50, SEUIL.preparationMs),
        detail: "entre les données reçues et le plan affiché, " + Math.round(ind.preparationP50) + " ms (médiane ; seuil " + SEUIL.preparationMs + " ms)",
      };
    },
  },
  {
    id: "immersif",
    titre: "Le mode immersif est trop lourd à dessiner",
    levier: "Moins de dessin : couches, résolution en mouvement, textures.",
    applique(ind) {
      /* Ni l'un ni l'autre critère ne suppose `gpuTime` : absent de la plupart
         des téléphones, il n'est qu'un indice ajouté au détail quand il existe. */
      const indice = ind.gpuP95 != null ? " ; temps GPU " + arrondi(ind.gpuP95) + " ms (centile 95, indice)" : "";
      let meilleur = null;
      if (ind.nImmersif >= SEUIL.immersifMin && ind.partImmersif != null && ind.partClassique != null) {
        const diff = ind.partImmersif - ind.partClassique;
        if (diff > SEUIL.ecartFluidite) {
          meilleur = {
            touche: ind.nImmersif, ecart: diff / SEUIL.ecartFluidite,
            detail: Math.round(ind.partImmersif * 100) + " % d'images lentes en immersif contre " + Math.round(ind.partClassique * 100) + " % en classique" + indice,
          };
        }
      }
      if (ind.repeintP95 != null && ind.repeintP95 > SEUIL.repeintMs) {
        const b = {
          touche: ind.visites, ecart: proportion(ind.repeintP95, SEUIL.repeintMs),
          detail: "les repeints durent " + arrondi(ind.repeintP95) + " ms (centile 95 ; seuil " + SEUIL.repeintMs + " ms)" + indice,
        };
        if (!meilleur || b.touche * b.ecart > meilleur.touche * meilleur.ecart) meilleur = b;
      }
      return meilleur;
    },
  },
  {
    id: "logos",
    titre: "Les logos occupent beaucoup de mémoire sur téléphone",
    levier: "Réduire la taille des vignettes.",
    applique(ind) {
      if (!ind.mobile || ind.logosMoP50 == null || ind.logosMoP50 <= SEUIL.logosMo) return null;
      return {
        touche: ind.visites, ecart: proportion(ind.logosMoP50, SEUIL.logosMo),
        detail: "les textures de logos prennent " + Math.round(ind.logosMoP50) + " Mo (médiane ; seuil " + SEUIL.logosMo + " Mo)",
      };
    },
  },
  {
    id: "contexte",
    titre: "Une famille d'appareils perd le contexte graphique",
    levier: "Prévoir un mode allégé pour cette famille.",
    applique(ind) {
      let pire = null;
      for (const f of ind.familles || []) {
        if (f.visites < SEUIL.familleMin) continue;
        const part = f.avecPerte / f.visites;
        if (part <= SEUIL.partPertes) continue;
        const r = {
          touche: f.avecPerte, ecart: proportion(part, SEUIL.partPertes),
          detail: f.famille + " : " + f.avecPerte + " visite(s) sur " + f.visites + " (" + Math.round(part * 100) + " %) ont perdu le contexte WebGL",
        };
        if (!pire || r.touche * r.ecart > pire.touche * pire.ecart) pire = r;
      }
      return pire;
    },
  },
];

/** Libellé d'un groupe page × appareil, pour que chaque piste dise de quoi elle parle. */
function groupe(ind) {
  return ind.page + ", " + (ind.mobile ? "téléphone" : "ordinateur");
}

/**
 * Applique toutes les règles à tous les groupes ; le gain estimé est le nombre
 * de visites touchées multiplié par l'écart au seuil. Triées par gain décroissant.
 * @param {object[]} indicateurs
 */
function pistes(indicateurs) {
  const sortie = [];
  for (const ind of indicateurs) {
    for (const r of REGLES) {
      const a = r.applique(ind);
      if (!a) continue;
      sortie.push({ id: r.id, titre: r.titre, levier: r.levier, detail: groupe(ind) + " — " + a.detail, gain: a.touche * a.ecart });
    }
  }
  return sortie.sort((x, y) => y.gain - x.gain);
}

module.exports = { REGLES, SEUIL, pistes };
