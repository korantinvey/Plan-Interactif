# La sonde de performance — design

## Pourquoi

Le plan admin est parfois long à charger, et la vue immersive reste moins
fluide que la vue classique. On le sait parce que l'exploitant l'a vu sur son
poste ; on ne sait pas ce qu'en vivent les visiteurs, sur leurs téléphones, ni
**où** le temps se perd. Sans cela, chaque chantier de fluidité part d'une
intuition.

Le relevé existe déjà, en instrument : `modules/releve.mjs`, activé par `?perf`,
mesure gestes, images, repeints WebGL, images longues, chargement, ressources
lourdes, mémoire, carte graphique, appareil et planche des logos — mais il ne
part qu'à la main (« Partager le relevé »). Il ne dit donc rien des visites
qu'on n'a pas faites soi-même.

On veut, comme pour les erreurs des pages (`erreur_page`), que chaque visite
**dépose en silence un résumé** dans Supabase, et qu'on en tire des **pistes
d'amélioration** : quel levier actionner pour quel gain.

## Ce qu'on veut

- Savoir, par salon, page (plan, admin, borne), appareil (téléphone, bureau) et
  vue (classique, immersive) :
  - combien de temps le plan met à devenir utilisable, et **à quelle étape** ;
  - ce qui pèse : poids transféré, fichiers les plus lourds, cache ou réseau ;
  - si le plan suit la main : images par seconde et saccades pendant les gestes,
    gels de la page ;
  - ce qu'on demande à la carte graphique : temps GPU, résolution de dessin,
    mémoire des textures (logos, fond), pertes de contexte, retours au SVG ;
  - sur quel matériel : modèle de carte graphique, mémoire, cœurs, densité
    d'écran, navigateur, réseau.
- Le lire dans le **rapport d'utilisation**, salon par salon.
- Recevoir **chaque semaine une fiche de pistes**, classées par gain attendu.

### Non-buts

- Pas de chiffres en direct ni de tableau de bord temps réel.
- Pas de suivi d'un visiteur : aucun identifiant qui survive à la page.
- Pas de remplacement de `?perf` : le relevé complet, geste par geste, reste
  l'instrument de diagnostic fin.
- Pas de diagnostic automatique du code par Claude dans cette version (voir
  « Plus tard »).

### Anti-buts — ce qui ferait échouer la sonde même si elle marche

- **La sonde ralentit ce qu'elle mesure.** Le commentaire de `releve.mjs` le dit :
  sa boucle d'images « coûte elle-même un rappel par image : le relevé est un
  instrument, pas un mode à laisser aux visiteurs ». La sonde silencieuse ne
  doit donc **pas** tourner de boucle d'images permanente (voir § 2).
- **La base enfle.** Plafonds et purge obligatoires (§ 4).
- **Une donnée personnelle part.** Rien qui nomme ou suive une personne ; le
  refus de la mesure est respecté.

## Décisions prises avec l'exploitant

- Tout est relevé : chargement, poids, carte graphique, fluidité, matériel.
- **Le modèle de carte graphique et d'appareil est relevé** chez les visiteurs
  qui n'ont pas refusé la mesure (accord explicite de l'exploitant).
- Enregistrement silencieux dans Supabase, comme les erreurs.
- Plafond de **300 relevés détaillés par salon et par jour** pour les
  visiteurs (plus 50 pour l'admin et 50 pour la borne, voir § 4) ; détails
  gardés **30 jours**, bilans quotidiens **90 jours**. (Proposés, non
  contestés.)
- Le relevé ne dépend pas de la fermeture de la page : envoi du chargement peu
  après l'affichage, puis à chaque passage en arrière-plan, puis toutes les
  10 minutes d'activité ; une visite reste **une seule ligne**.

## 1. Ce que relève la sonde silencieuse

Un module neuf, `modules/sonde.mjs`, qui **réutilise** les morceaux de
`releve.mjs` sans en reprendre le coût. Les fonctions de mesure communes
(`chargement`, `appareil`, `carteGraphique`, `centile`, tranches
d'histogramme…) sont sorties de `releve.mjs` dans un module partagé, que les
deux importent ; `releve.mjs` garde sa pastille, ses listes détaillées et son
partage.

Le résumé d'une visite (`format: "sonde-plan/1"`), **4 Ko au plus** une fois
sérialisé :

| groupe | contenu |
|---|---|
| visite | `visite` (UUID tiré au chargement, jamais stocké), `page` (`plan`, `admin`, `borne`), `support` (`supportMesure()`), `debut`, `duree` |
| chargement | jalons en ms depuis la navigation : `reponse` (HTML reçu), `domPret`, `plan-demarre` (`PLAN_DEMARRE`), données reçues (fin de la requête `/api/plan` du salon), `plan-affiche` (`quandAffiche`), `largest-contentful-paint` ; `transfertKo` total ; `depuisCache` (part des ressources servies sans transfert) |
| lourds | les **5** ressources les plus coûteuses : nom de fichier seul (sans requête), sorte, ms, Ko transférés, Ko décodés |
| fluidité | par vue (`classique`, `immersif`) : histogramme des intervalles d'image **pendant les gestes** (tranches de `releve.mjs` : ≤17, ≤25, ≤33, ≤50, ≤100, ≤250, >250 ms), nombre de gestes, saccades (>50 ms) |
| gels | nombre d'images longues (`long-animation-frame`, sinon `longtask`), total et maximum en ms, et pour les 3 plus longues : le geste en cours et le premier script fautif (fichier, fonction) |
| réactivité | événements lents (Event Timing > 100 ms) : nombre, pire durée, sa sorte |
| carte graphique | repeints WebGL (`REPEINT_FINI`) : n, p50, p95, max ; `deck.metrics` aux pires : `gpuTime`, `cpuTime`, `fps` ; densité de dessin effective ; `bilanLogos()` (textures, Mo envoyés) ; pertes de contexte, bascule vers le SVG |
| mémoire | pic de `performance.memory` (Chrome) |
| appareil | mobile, système, navigateur et version majeure, densité, écran, cœurs, mémoire (Go), réseau (type, débit, rtt, économie de données), carte graphique (fabricant, puce, WebGL 2, texture max), mouvement réduit |
| plan | nombre d'emplacements, de nœuds du DOM, vue immersive utilisée ou non |

L'agent utilisateur complet n'est **pas** envoyé : la famille et la version
majeure du navigateur suffisent, et le reste rend la visite reconnaissable.

## 2. Ce que la sonde coûte — rien qu'on sente

- **Pas de boucle d'images permanente.** La boucle `requestAnimationFrame` ne
  tourne que **pendant un geste et sa traîne** (le `FIN_GESTE` de 300 ms de
  `releve.mjs`), là où le plan produit des images de toute façon ; elle
  s'arrête d'elle-même ensuite.
- Les observateurs du navigateur (`PerformanceObserver`) ne coûtent rien.
- `deck.metrics` est lu à la fin d'un geste, pas toutes les 5 s.
- **La carte graphique est lue sur le contexte du plan** quand il existe
  (`GL.deck`), non sur un canevas créé pour l'occasion comme le fait
  `carteGraphique()` ; à défaut (rendu SVG), une seule fois, pendant un
  moment creux (`requestIdleCallback`), après l'affichage du plan.
- Les comptes sont bornés comme dans `releve.mjs` (`BORNES`) ; aucune liste ne
  grossit avec la durée de la visite.
- Avec `?perf`, la sonde ne tourne pas : le relevé complet prend sa place.

## 3. Quand le résumé part

- **Le chargement** : 10 s après `plan-affiche` (ou après une panne de
  démarrage), un premier envoi — c'est la partie la plus précieuse, elle ne
  doit pas dépendre de la suite.
- **À chaque passage en arrière-plan** (`visibilitychange` → caché,
  `pagehide`), par `navigator.sendBeacon` — comme `mesure.mjs` `beaconne`.
- **Toutes les 10 minutes** si la page reste visible et qu'il y a eu des
  gestes depuis le dernier envoi.
- Chaque envoi porte **tout** le résumé à jour ; le serveur **remplace** la
  ligne de la visite (même `visite`). Pas de doublon.
- **Borne** (`?borne`) : la visite change d'UUID toutes les heures — on voit
  si la borne se dégrade au fil de la journée sans faire une ligne sans fin.
- **Hors ligne** : un envoi qui échoue rejoint une file `localStorage`
  (`plan-sonde`), bornée à 5 résumés et 7 jours, reprise sur `online` ou à
  l'ouverture suivante — sur le modèle de `plan-mesures` dans `mesure.mjs`.
- **Refus de la mesure** (`mesureOuverte()` faux) : rien n'est relevé ni
  envoyé, sauf sur la page admin — même règle que `erreurs.mjs`.
- **Page admin** : envoi par la RPC authentifiée `sonde_admin` (§ 4), pas par
  le Worker — son salon n'est souvent pas encore publié.

## 4. Le serveur

### Route du Worker — `src/index.mjs`

`/api/sonde`, POST, sur le modèle de `erreur` :
- même origine seulement ; corps ≤ 6 Ko ; JSON valide ;
- `ecritEnProduction` → `ecartee` (un aperçu n'écrit pas dans la base de
  production) ;
- ajoute `VERSION_DES_PAGES` ; ramène, si besoin, les positions de script
  des gels au module d'origine par `lieuDe` ;
- relaie à la RPC `sonde_publique` avec la clé publique ; répond 204 sans
  attendre.

### Migration — `npm run migration -- "Sonde de performance"`

- **`releve_perf`** : une ligne par visite.
  Clé `(evenement_id, visite)`. Colonnes : `jour` (fuseau du salon, comme
  `compteur_cible`), `page`, `support`, `version`, `mobile`, `immersif`,
  `recu` et `maj` (horodatages), quelques **colonnes chiffrées** pour trier et
  agréger sans fouiller le JSON (`affiche_ms`, `donnees_ms`, `transfert_ko`,
  `part_plus33_classique`, `part_plus33_immersif`, `gels`, `gpu_ms_p95`,
  `pertes_contexte`), et `resume jsonb` (le reste, ≤ 4 Ko).
- **`perf_jour`** : `(evenement_id, jour)` → `ecartees` (visites refusées
  au-delà du plafond).
- **`perf_bilan`** : un bilan par `(evenement_id, jour, page, mobile)` : nombre
  de visites, médiane et 90e centile des jalons et de la fluidité, poids
  médian, gels, pertes de contexte ; calculé chaque nuit sur la veille.
  *(Décision du concepteur)* il porte aussi un `detail jsonb` qui garde ce que
  le rapport montre au-delà des 30 jours du détail : la fluidité **par vue**
  (classique, immersive), les **familles d'appareils et cartes graphiques**
  les plus lentes (10 au plus, avec leur nombre de visites), les **fichiers
  lourds** les plus fréquents (10 au plus) et les **étapes** du chargement
  (médiane et 90e centile de chacune). Le rapport lit donc le même contenu
  sur 7 jours comme sur « tout ».
- **`sonde_publique(p_slug, p_page, p_version, p_visite, p_resume)`**,
  `security definer`, sur le modèle d'`erreur_publique` : salon publié
  obligatoire ; UUID valide ; résumé ≤ 4 Ko ; si la visite existe déjà, elle
  est **remplacée** ; sinon elle passe par le **tirage** ci-dessous — refusée,
  elle compte dans `perf_jour.ecartees`.
- **Le tirage, par salon, jour et page** *(décision du concepteur)*. Un
  plafond « les 300 premières » ne mesurerait que le matin d'un gros salon.
  Les quotas sont **par page** : `plan` 300, `admin` 50, `borne` 50 — l'admin
  et la borne ne grignotent pas les visiteurs. Pour `plan`, les 100 premières
  visites du jour entrent toutes ; au-delà, une visite neuve entre avec la
  probabilité `100 / n` (n : visites déjà reçues ce jour-là, entrées ou non,
  comptées dans `perf_jour`), jusqu'au plafond. Le quota se remplit ainsi sur
  toute la journée d'un gros salon, et un petit salon garde tout. Le tirage
  vit **dans la RPC seule** : la page envoie toujours, le serveur décide.
- **L'admin d'un salon pas encore publié** *(décision du concepteur)*. La
  lenteur de l'admin est l'une des deux raisons d'être de la sonde, et
  l'exploitant prépare surtout des salons non publiés. Sur la page admin, la
  sonde n'envoie donc pas au Worker mais à une RPC **authentifiée**,
  `sonde_admin(p_evenement, p_version, p_visite, p_resume)`, `security
  invoker`, appelée avec le jeton de session comme le rapport
  (`socle-console.mjs` `rest`) : elle n'écrit que si l'appelant a accès au
  salon (`acces_salon`), publié ou non. L'identité sert à ouvrir la porte et
  **n'est pas enregistrée** : la ligne est la même que pour une visite.
  La version des pages, que le Worker ajoute ailleurs, est lue par la page
  (scripts sous `/versions/`, comme `releve.mjs`).
- **`performances_du_salon(p_evenement, p_jours)`**, `security invoker` :
  ce que lit le rapport (bilans des jours passés + détail des jours encore
  gardés).
- **Purge** par `pg_cron`, comme `purge_erreurs` : `releve_perf` à **30 jours**,
  `perf_bilan` et `perf_jour` à **90 jours**. La même tâche de nuit calcule
  d'abord le bilan de la veille.
- Lecture : RLS `acces_salon`, comme `erreur_page` et `compteur`.

## 5. La lecture

### Le rapport d'utilisation

Un bloc **« Performances »** dans `rapport-utilisation.mjs` `dessineRapport`,
nourri par `performances_du_salon`, sur la période du rapport. Pour
l'exploitant, en mots simples :
- **Ouverture du plan** : temps médian et des 10 % de visites les plus lentes,
  téléphone et bureau, plan et admin, découpé en étapes (page, données,
  préparation, affichage).
- **Fluidité** : part des images lentes pendant les gestes, classique contre
  immersif.
- **Poids** : poids médian téléchargé, et les fichiers qui reviennent le plus
  souvent parmi les plus lourds.
- **Appareils qui souffrent** : les cartes graphiques ou familles d'appareils
  les plus lentes, avec leur nombre de visites.
- Le nombre de visites relevées et, s'il y en a, celles écartées par le
  plafond.

### La fiche de pistes hebdomadaire

Un script `outils/performances.js` et un workflow
`.github/workflows/performances.yml` (chaque lundi à 5 h 17, et à la demande ;
`npm run performances`). Le script lit la base par l'API de gestion Supabase
(`SUPABASE_ACCESS_TOKEN`, déjà secret du dépôt pour `supabase.yml`) et :

1. calcule, sur les 7 derniers jours et tous salons confondus, les
   indicateurs du § 1, par page × appareil × vue ;
2. les compare à la semaine d'avant et **à la version des pages** : un
   indicateur qui se dégrade d'une version à l'autre est signalé avec les deux
   versions ;
3. applique une **table de règles** indicateur → seuil → levier, écrite dans
   le script et commentée, par exemple :
   - données du salon > X ms sur téléphone → alléger ou différer les données,
     vérifier le cache du Worker ;
   - un fichier dans les plus lourds de plus de N % des visites → le
     compresser, le découper, le charger plus tard ;
   - préparation (données reçues → plan affiché) longue → coût du montage,
     voir les gels et leurs scripts ;
   - immersif nettement moins fluide que classique, repeints longs → trop
     de dessin : couches, résolution en mouvement, textures. *(Décision du
     concepteur)* le critère porte sur la part d'images lentes et la durée
     des repeints, mesurées partout ; `gpuTime`, absent sur la plupart des
     téléphones, n'est qu'un indice ajouté quand il existe, jamais une
     condition ;
   - mémoire des logos élevée sur téléphone → réduire la taille des
     vignettes ;
   - pertes de contexte sur une famille d'appareils → mode allégé pour elle ;
4. ouvre (ou met à jour, si elle existe) **une issue par semaine**, étiquette
   `performances`, avec les pistes **classées par gain estimé** (nombre de
   visites touchées × écart au seuil).

Le dépôt est public : **aucun slug ni nom de salon** dans l'issue.
*(Décision du concepteur)* un salon y est nommé par une **étiquette stable**,
`salon-` suivi des 4 premiers caractères de `md5(evenement_id)` : la même
d'une semaine à l'autre, pour suivre un salon et comparer les versions, sans
table de correspondance — l'identifiant d'un salon n'est pas public, et
l'exploitant retrouve le salon en refaisant le calcul dans la base.

## Contraintes

- Le code, les commentaires et les messages sont en français accentué ; les
  commentaires disent pourquoi.
- Les pages se reconstruisent (`npm run construire`) et `CARTE.md` suit.
- La migration est horodatée (`npm run migration`), rejouable, et part en
  production à la fusion sur `main`.
- Aucune clé dans le dépôt ni dans une page.
- Rien d'identifiant n'est **enregistré** : sur la page publique, ni le Worker
  ni la sonde n'en touchent ; sur la page admin, la session ouvre seulement la
  porte de `sonde_admin`.

## Essais

- **PGlite** (`outils/essais/`, à la manière des essais de migration existants) :
  remplacement d'une visite, quotas par page et tirage au-delà de 100, compte
  des écartées, salon non publié refusé par `sonde_publique` mais accepté par
  `sonde_admin` pour un compte qui y a accès (et refusé sinon), résumé trop
  gros refusé, bilan de nuit avec son `detail`, purge.
- **Navigateur** (Playwright, `outils/essais/navigateur/`) : la sonde envoie
  un résumé valide sur `/api/sonde` (intercepté) après l'affichage ; rien ne
  part quand la mesure est refusée ; avec `?perf`, la sonde ne tourne pas ;
  **sans geste, aucune boucle d'images ne tourne**.
- **Le script hebdomadaire** sur un jeu de relevés fabriqué : les règles
  produisent les bonnes pistes, l'issue ne contient aucun slug.

## Ce qui est laissé au constructeur

- Le découpage exact entre le module partagé et `releve.mjs`.
- Les seuils chiffrés de la table de règles (à poser d'après les premiers
  relevés réels ; une première valeur raisonnable suffit).
- La forme visuelle du bloc du rapport, dans le style des blocs existants.
- Le nom exact des colonnes chiffrées, tant qu'elles couvrent celles du § 4.

## Plus tard

- Brancher la fiche hebdomadaire sur la tâche Claude de diagnostic prévue par
  la remontée des anomalies (`2026-10-21-remontee-des-anomalies-design.md`),
  pour qu'une piste aille jusqu'à une PR.
- Un mode allégé automatique pour les appareils que la sonde désigne.
