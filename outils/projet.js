/**
 * Le projet Supabase que parlent les pages, le Worker et le serveur d'essai.
 *
 * L'adresse était écrite trois fois — `_config.js`, `src/index.mjs`,
 * `outils/serve.js` — et rien ne disait qu'il fallait changer les trois
 * ensemble. Elle ne l'est plus qu'ici : `genere.js` la verse dans `config.js`
 * et dans `src/pages.mjs`, que le Worker importe.
 *
 * Surtout, la construction sait désormais pour qui elle construit. Cloudflare
 * construit chaque branche poussée et la sert en prévisualisation
 * (`<branche>-plan-interactif…workers.dev`), mais avec les mêmes liaisons que la
 * production : même stockage KV, même base. Une branche en essai rangeait donc
 * ses réponses dans le cache que lisent les visiteurs, consommait son quota
 * d'écritures, et comptait ses clics dans l'audience des salons. La branche
 * construite se lit dans `WORKERS_CI_BRANCH`, que Cloudflare pose pendant la
 * construction ; `src/index.mjs` en tire `APERCU` et se tient à l'écart.
 *
 * `recette` attend un second projet Supabase. Tant qu'il n'existe pas, une
 * prévisualisation lit la base de production — elle n'a rien d'autre à lire —,
 * mais le Worker n'y écrit plus rien de lui-même. L'administration ouverte en
 * prévisualisation, elle, écrit toujours en production : c'est la page qui
 * parle à la base, avec la session de l'exploitant, et seul un projet de
 * recette l'en sépare.
 */

/* La clé « publishable » est faite pour circuler côté navigateur : c'est son
   rôle. Ce qui protège les données, ce sont les politiques de sécurité de la
   base, pas le secret de cette clé. La clé de service, elle, ne doit jamais
   apparaître ici — elle vit dans les secrets des fonctions. */
const PROJETS = {
  production: {
    url: "https://jylkfskotuafptaxujao.supabase.co",
    cle: "sb_publishable_N5rJYe35-Kcaw70ZoTJRaQ_lvVVc_5F",
  },
  /* À remplir le jour où un projet de recette existe : `{ url, cle }`. Les
     prévisualisations y basculeront d'elles-mêmes, pages et Worker. */
  recette: null,
};

/* La branche que Cloudflare déploie en production. */
const BRANCHE_DE_PRODUCTION = "main";

/**
 * Le projet de cette construction-ci, et si elle part en prévisualisation.
 *
 * `PLAN_PROJET=recette` ou `production` l'impose, pour construire chez soi
 * l'une ou l'autre. Sinon, hors de Cloudflare — chez soi, en intégration —, on
 * construit pour la production : rien de ce qui s'y construit n'est déployé.
 */
function projetDeLaConstruction(env = process.env) {
  const impose = env.PLAN_PROJET;
  if (impose) {
    if (!PROJETS[impose]) throw new Error("PLAN_PROJET inconnu ou sans projet : " + impose);
    return { nom: impose, ...PROJETS[impose], apercu: impose !== "production" };
  }
  /* Une branche inconnue compte pour la production : le doute ne doit pas
     priver le site en ligne de son cache et de sa mesure. Une prévisualisation
     que la construction n'aurait pas reconnue, le Worker la reconnaît encore à
     son adresse (`src/index.mjs` `enApercu`). */
  const branche = (env.WORKERS_CI && env.WORKERS_CI_BRANCH) || BRANCHE_DE_PRODUCTION;
  const apercu = branche !== BRANCHE_DE_PRODUCTION;
  const nom = apercu && PROJETS.recette ? "recette" : "production";
  return { nom, ...PROJETS[nom], apercu };
}

module.exports = { PROJETS, BRANCHE_DE_PRODUCTION, projetDeLaConstruction };
