# Plan interactif — repères de travail

Plans de salon interactifs alimentés par Klipso (API GAIA), avec une console
d'administration multi-événements. Le `README.md` décrit le système et son
déploiement ; ce fichier ne retient que ce qui se paie cher quand on l'ignore.

**Ce fichier dit les règles ; `CARTE.md` dit où sont les choses.** La carte est
produite à chaque construction : pour chaque module, ses sections, ses
fonctions avec leur ligne, les éléments qu'il désigne, ce qu'il importe, qui
l'importe, et ses portes. Ce que ce guide en recopiait en prose a vieilli plus
vite qu'on ne le corrigeait — près d'un commit sur deux le retouchait. Il ne
nomme donc plus, par intention, que le module par où entrer, et chaque module
dit en tête ce qu'il fait et pourquoi. `npm run guide` vérifie que tout fichier
et toute fonction cités ici existent encore.

## La chaîne de fabrication

Les pages de `web/` ne sont pas écrites à la main : elles sont **assemblées**
depuis `outils/gabarit/`, et **ne sont pas versionnées**. Cloudflare les
construit à chaque déploiement (`wrangler.jsonc` `build`), la CI pour ses
contrôles, chacun chez soi par `npm run construire`. Seuls `web/polices/` et
`web/bibliotheques/`, qui ne se refont qu'avec le réseau, restent dans le dépôt.

```
outils/gabarit/*.html, *.css → outils/tpl-multi.html → web/*.html
outils/gabarit/modules/*.mjs  → esbuild, un script par point d'entrée → posé dans web/*.html
outils/gabarit/_styles-*.css                  → web/versions/plan.<empreinte>.css
script des modules et moteur de langue        → web/versions/<entrée|langue>.<empreinte>.js
dictionnaire anglais de chaque page du plan   → web/versions/anglais.<empreinte>.js, chargé à la demande
outils/gabarit/_console.css                   → web/console.css
outils/gabarit/_sw.js + outils/pwa.js         → web/sw.js, manifeste, icônes
outils/projet.js                              → web/config.js, src/pages.mjs (projet Supabase)
outils/gabarit/** + supabase/**               → CARTE.md
```

Un déploiement sans construction ne peut pas passer : `genere.js` écrit
`src/pages.mjs` (non versionné), que le Worker importe — s'il manque, le Worker
ne s'empaquette pas, et la production garde la version d'avant au lieu d'un
site vide. `/api/pages` dit quelle construction est en ligne.

```bash
npm run construire   # construit web/ pour essayer chez soi (npm run essai)
npm run verifie      # construit, contrôle tout, et dit si CARTE.md était en retard
```

`CARTE.md` reste versionné — on le lit sans rien construire. Lancez
`npm run verifie` avant de valider : il le refait et signale s'il bougeait.

## Les modules

Tout le JavaScript vit dans `outils/gabarit/modules/*.mjs` ; le gabarit n'est
plus que du balisage (`_head.html`, et la balise des données dans `_js.html`).
esbuild (version épinglée) les réunit par point d'entrée : `plan.mjs` (plan
public et démonstration), `plan-admin.mjs` (administration), `console.mjs`,
`rapport.mjs`, `motdepasse.mjs`, `accueil.mjs`. Le script du plan public et de
l'administration est minifié, avec sa carte de correspondance à côté (sans les
sources) ; `PLAN_LISIBLE=1 npm run construire` le rend lisible. Ce que la
construction verse dans le code passe par `define` (`genere.js` `DEFINIS`),
jamais par une substitution après coup, qui décalerait la carte.

Ce code a longtemps été un seul script par page, des morceaux mis bout à bout
où chacun appelait les fonctions de tous les autres — le « code soudé ». Les
gestes qui l'empêchent de revenir :

- **Une fonction s'importe.** Une fonction recopiée dans deux pages devient un
  seul module importé deux fois. Ce qui ne sert qu'au module n'est pas exporté.
- **Une boucle d'imports se défait d'abord par un module neutre** : la donnée
  ou le dessin rangés dans un module d'interface en sortent (`filtre.mjs`,
  `cartouche-poi.mjs`, `trace-itineraire.mjs`). Une règle que plusieurs
  modules appliquaient chacun pour soi devient un **registre** où ils
  s'inscrivent (`tiroirs-exclusifs.mjs`, `modes-edition.mjs`). Un module de base
  qui doit dire ce qui vient de changer l'**annonce**, et les autres s'y
  inscrivent (`parcours.mjs` `suitLeParcours`).
- **Une porte, en dernier recours, et avec sa raison.** Une fonction qu'un
  module de base appelle chez un module qui l'importe lui est confiée par ce
  dernier en se chargeant, par une porte `confie…` aux défauts sans effet.
  Chacune est inscrite avec son genre et sa raison dans
  `outils/portes-acceptees.json` — `partition` (le public appelle ce que seule
  l'administration embarque), `rendu`, `registre`, `administration`.
  `npm run portes` fait échouer une porte absente de la liste, une porte de la
  liste qui n'existe plus, et **toute boucle d'imports**, nommée module par
  module : esbuild en accepte une sans rien dire, et l'ordre de chargement
  devient celui du hasard. Pour savoir si un module peut en importer un autre,
  regardez dans `CARTE.md` si le second atteint déjà le premier.
- **Un module que plus rien n'importe mais qui s'inscrit reste chargé** : le
  point d'entrée l'importe sans nom, avec un commentaire
  (`import "./edition-en-cours.mjs";`).
- **Un module qui s'éprouve seul dans Node reçoit ses dépendances** au lieu de
  les importer (`aimants.mjs`, `itineraire.mjs`, `sejour.mjs`) ; c'est le
  module qui les tient qui les lui confie, comme les essais le font.
- **Rien ne s'expose sur l'objet global.** ESLint refuse qu'un module y écrive
  (`eslint.config.js`), hors des noms en `__`. Ce que seuls les essais lisent va
  dans `globalThis.__essais` (`plan.mjs`).

**Le lancement, et son ordre.** `modules/lancement.mjs` `lancePlan` pose les
écoutes de chaque domaine dans un ordre fixe, et **l'ordre est le
comportement** : « Échap » referme la fenêtre avant le tiroir parce que l'une
s'écoute avant l'autre. Un branchement ne change de rang qu'en sachant ce qu'il
déplace. L'administration remplit quatre emplacements avant de lancer
(`confieLancementAdmin`) ; chaque point d'entrée lance lui-même, à la fin de
son chargement.

## Ce que le visiteur ne reçoit pas

**Le JavaScript, par le point d'entrée.** `plan-admin.mjs` reprend `plan.mjs`
en entier et y ajoute les modules de l'exploitant — un seul script par page,
sans quoi deux exemplaires d'un module partagé auraient deux états. **Un module
d'exploitant s'importe dans `plan-admin.mjs`, jamais dans `plan.mjs`** ; ce que
la page publique appelle chez lui lui est confié par une porte de genre
`partition`.

**Le balisage, par des tranches** de `_head.html`, bornées sur des lignes
entières :

```
<!-- @admin — pourquoi -->
…
<!-- @fin-admin -->
```

`plan.html` et `plan-smcl.html` perdent ces tranches entières ; `plan-admin.html`
ne perd que les marqueurs. **Un volet, une fenêtre, un bouton d'exploitant
s'écrit dans une tranche.** `outils/reserve.js` fait échouer la construction si
la page publique cite encore un `$("id")` qu'on lui a retiré. La feuille de
style n'a pas encore de tranche, faute de pouvoir prouver qu'une règle ne sert
plus au visiteur.

## Ne jamais modifier directement

Les sorties de la construction — `web/` hors `polices/` et `bibliotheques/`,
`outils/tpl-multi.html`, `CARTE.md`, `src/pages.mjs` — et toute migration déjà
sur `main`. `.claude/hooks/garde.js` refuse ces écritures dans une session
Claude Code et nomme la source à corriger ; la règle vaut aussi hors de lui.

## Plusieurs sessions en parallèle

**Après toute fusion ou rebasage, `npm run construire`.** `CARTE.md` est marqué
`merge=ours` : git garde la version en place au lieu de mélanger deux index, et
la construction la refait depuis les sources fusionnées. Le workflow `Pages` le
rattrape sinon — un commit plus tard, à tirer avant la poussée suivante.

**Les migrations sont horodatées à la seconde** : `npm run migration -- "Titre"`
produit `<horodatage>_titre.sql`, à la seconde. Une migration **appliquée** ne se renomme
jamais : elle rejouerait sous le nouveau nom. **Avant de fusionner une branche
qui a vieilli, comparez sa migration à la dernière de `main`** : `supabase db
push` refuse d'en insérer une avant la dernière posée, et l'échec n'arrive
qu'après la fusion. Réhorodatez-la tant qu'elle n'a jamais été appliquée — le
journal du déploiement le dit.

**Jamais de poussée forcée** — le garde la refuse : le workflow `Pages` a pu
commiter l'index sur la branche. `git pull --rebase`.

## Données figées

`web/plan-smcl.html` embarque ses données au lieu d'appeler l'API : c'est la
démonstration, publiable en artefact. Sa source, `outils/plans.json`, est
**versionnée** — sans elle la construction échoue sur un clone neuf, et elle ne
se régénère qu'avec une clé Klipso. De même `web/polices/`,
`outils/polices.json` (`npm run polices`) et `outils/lieux.json`
(`npm run lieux`), qui ne se refont qu'avec le réseau. **Aucune page ne demande
ses polices à Google** — chaque visiteur lui transmettrait son adresse IP ;
`npm run construire` échoue si une page le fait.

## La version anglaise

Toute page existe en français et en anglais ; le drapeau passe de l'une à
l'autre sans recharger, `?lang=en` l'impose. Le code reste en français :
`_langue.js` traduit ce que la page affiche en cherchant chaque phrase dans
`outils/anglais/`. Les modules n'appellent donc aucune fonction de traduction —
sauf pour ce qui quitte la page (export, partage) ou ce que le code compare :
là, `traduit("…")`.

**Une phrase affichée s'ajoute avec sa traduction**, dans
`outils/anglais/<module>.js` ; `npm run verifie` refuse une chaîne visible qui
n'en a pas, et nomme le fichier et la ligne. Une phrase composée se traduit par
un modèle : `"{n} exposants retenus": "{n} exhibitors match"`. Ce que le serveur
écrit va dans `serveur.js` ; une chaîne que le contrôle croit visible à tort,
dans `invisibles.js`.

Deux pièges. Un code qui relit le texte d'un bouton lira l'anglais : comparez à
`traduit("…")`, ou mieux à un état. Et le contrôle lit les sources, pas
l'écran : `?lang=en&manques` relève dans le navigateur ce qui reste en français.

## Où vit quoi

| | |
|---|---|
| `outils/gabarit/` | la source des pages ; `modules/` tout le JavaScript |
| `web/` | les pages construites — non versionnées, sauf `polices/` et `bibliotheques/` |
| `src/index.mjs` | Worker Cloudflare : relais et cache de `/api/plan`, mesures, erreurs, manifeste |
| `outils/projet.js` | le projet Supabase des pages et du Worker, production ou recette |
| `supabase/migrations/` | schéma de la base — horodatées, rejouables |
| `supabase/functions/` | synchronisation Klipso, API publique, rappels, comptes ; `_partage/` le commun |
| `.github/workflows/` | construction, essais, déploiement Supabase, sauvegarde, correctifs |
| `outils/anglais/` | le dictionnaire anglais, un fichier par module |
| `outils/essais/` | essais hors page — `npm run essais` ; l'ordonnanceur et les modules purs y sont importés tels que la page les reçoit, jamais recopiés |
| `outils/essais/navigateur/` | le plan dans Chromium — `npm run navigateur` ; données de `plans.json` interceptées (`aide.js`), rien ne doit au réseau ; `PLAN_ADRESSE=<prévisualisation>` éprouve un déploiement |
| `outils/relecture.js`, `types.js`, `portes.js`, `guide.js` | ESLint, TypeScript (cliquet au stock vide), portes et boucles, ce guide — tous lancés par `npm run verifie` |

## Chercher sans tout ouvrir

- **`CARTE.md` d'abord** — souvent le seul fichier à lire avant d'aller droit à
  la bonne ligne. Il ne peut pas mentir : `npm run verifie` le vérifie.
- **`.ignore`** retire de la recherche `web/`, `tpl-multi.html` et `plans.json`,
  fabriqués ou figés.
- **Aucun module ne dépasse 3400 lignes**, un seul passe 2500 (`itineraire.mjs`).
  On y entre par tranche (`sed -n '531,700p'`), jamais en entier.
- **L'en-tête d'un module** dit ce qu'il fait, comment il se branche et ce qu'on
  lui confie.

### Par intention : le module où entrer

Un chemin `modules/…` se lit sous `outils/gabarit/`. Ce qu'il importe, qui
l'importe, ses portes : `CARTE.md`. Son anglais : `outils/anglais/<module>.js`.

| intention | entrer par |
|---|---|
| données du salon (`DATA`, `TOUS`, `parId`…), état de la vue `state`, pavillon `P` | `modules/donnees.mjs`, posées par `modules/index-salon.mjs` `indexe` au travers de `poseDonnees`, seule porte d'écriture |
| démarrage, appel de l'API, panne réseau, version du plan | `modules/demarrage.mjs` (`demarre`, `charge`, `demandePlan`) |
| recherche, liste, panneau des critères | `modules/recherche.mjs` ; la question posée, sans écran, `modules/filtre.mjs` ; ce qu'ouvre une ligne `modules/ligne-liste.mjs` |
| sortes cherchées, ordre des critères (réglages) | `modules/reglage-recherche.mjs` |
| montage d'un pavillon, onglets, passage de l'un à l'autre | `modules/rendu.mjs` (`montePlan`, `changePlan`) |
| libellés, nom d'un emplacement, mesure du texte | `modules/libelles.mjs`, `modules/nom-emplacement.mjs`, `modules/texte-plan.mjs` |
| sélection, fiche d'un stand, d'une conférence, d'un produit | `modules/fiche.mjs` (`select`, `ouvre`, `ferme`) ; ce qu'elle montre `modules/corps-fiche.mjs` ; logo `modules/marque.mjs` |
| réglage de la fiche (champs, sections, intitulés) | `modules/reglage-fiche.mjs` `voletOrdre`, aperçus `modules/apercus.mjs` |
| vue, zoom, cadrage, passage écran → plan | `modules/vue.mjs` ; l'état seul `modules/vue-etat.mjs` (`changeVue`) |
| gestes — glisser, pincer, molette, clavier | `modules/gestes.mjs` `brancheGestes` ; ceux de l'exploitant `modules/gestes-admin.mjs` |
| tiroirs du bas sur écran étroit | `modules/tiroirs.mjs` ; un seul ouvert à la fois `modules/tiroirs-exclusifs.mjs` |
| dessin WebGL | `modules/webgl.mjs` ; lecture du SVG `modules/trace.mjs` ; bibliothèque `npm run deck` |
| configuration (`CONF`, `conf`, `enregistreConf`), options vendues à part | `modules/configuration.mjs`, `modules/options.mjs` |
| apparence des calques, couleurs, habillage, barre | `modules/apparence.mjs`, `modules/habillage.mjs`, `modules/ton-barre.mjs` |
| fenêtre des réglages et ses volets | `modules/reglages.mjs` `ouvreReglages`, `modules/volets.mjs` |
| enregistrement pour tous, publication, oubli du cache | `modules/enregistrement.mjs` |
| calques de dessin — données, tracé, outil | `modules/calques-dessin.mjs`, `modules/dessin.mjs`, `modules/outil-dessin.mjs` ; un seul mode d'édition `modules/modes-edition.mjs` |
| choisir, déplacer, tourner une forme | `modules/edition.mjs` ; forme choisie `modules/forme-choisie.mjs` |
| cote, aimants, grille, duplication | `modules/aimants.mjs` |
| reprendre ou ajouter un stand, une zone | `modules/emplacements.mjs` (ce que le visiteur reçoit), `modules/reprise-emplacements.mjs` (l'outil) |
| fiche d'une zone, salles, masquage | `modules/fiche-zone.mjs` ; nom d'une zone `modules/noms-zones.mjs` |
| repères, transports en commun | `modules/reperes.mjs`, `modules/cartouche-poi.mjs`, `modules/points-interet.mjs` |
| libellé placé à la main | `modules/libelle-place.mjs`, `modules/placement-libelles.mjs` |
| ordre et panneau des calques, fond du plan | `modules/ordre-trace.mjs`, `modules/pile.mjs`, `modules/ordre-calques.mjs` |
| halls d'un lieu connu, bibliothèque des lieux | `modules/batiments.mjs` ; `outils/lieux.js` (`lieuOsm`, `lieuSaisi`) |
| fond de carte, calage sur la Terre | `modules/environs.mjs`, `modules/calage-carte.mjs`, calculs `modules/terre.mjs` |
| secteurs, distinctions, polices des noms | `modules/secteurs.mjs`, `modules/distinctions.mjs`, `modules/polices-plan.mjs` |
| parcours, partage, copie gardée | `modules/parcours.mjs`, `modules/tiroir-parcours.mjs`, `modules/partage.mjs`, `modules/lien-parcours.mjs`, `modules/parcours-recu.mjs` |
| journée organisée, séjour, ordonnanceur | `modules/journee.mjs`, `modules/sejour.mjs`, `modules/ordonnanceur.mjs` |
| seuil de concentration, charge annoncée | `modules/seuil.mjs`, `modules/charge-annoncee.mjs`, `modules/ordonnanceur.mjs` |
| itinéraire | calcul `modules/itineraire.mjs`, tiroir et visée `modules/tiroir-itineraire.mjs`, tracé `modules/trace-itineraire.mjs` |
| borne, code « Vous êtes ici » | `modules/borne.mjs`, `modules/vous-etes-ici.mjs`, `modules/ici.mjs`, `modules/affiche-ici.mjs` |
| rappels de conférence | `modules/rappels.mjs`, `modules/notifications.mjs` ; serveur `supabase/functions/rappels/` |
| suggestion, visite guidée, générique du sponsor | `modules/suggestion.mjs`, `modules/tutoriel.mjs`, `modules/sponsor.mjs` |
| installation, application d'un salon | `modules/installation.mjs`, `modules/application.mjs` ; `outils/pwa.js`, `src/index.mjs` `manifeste` |
| mesure d'usage, erreurs des pages | `modules/mesure.mjs`, `modules/erreurs.mjs` ; relais `src/index.mjs` `mesure`, `erreur` |
| carte de chaleur, remise à zéro | `modules/chaleur.mjs` |
| accès administrateur, session, bande d'administration | `modules/acces-admin.mjs`, `modules/session.mjs`, `modules/bande-admin.mjs`, `modules/mode-admin.mjs` |
| console multi-événements | `modules/console.mjs`, `modules/ecran-console.mjs`, socle `modules/socle-console.mjs` |
| fiche d'un salon, provenance, correspondance des champs | `modules/fiche-evenement.mjs`, `modules/provenance.mjs`, `modules/fiche-detail.mjs`, `modules/correspondance.mjs` |
| synchronisation et son avancement | `supabase/functions/sync-evenement/`, `modules/synchronisation.mjs`, `modules/avancement.mjs` |
| rapport d'utilisation, export tableur | `modules/rapport-utilisation.mjs`, `modules/export.mjs` |
| comptes, mot de passe | `modules/comptes.mjs`, `modules/mot-de-passe.mjs` |
| utilitaires — `$`, `esc`, couleurs, heures, QR | `modules/dom.mjs`, `modules/texte.mjs`, `modules/couleurs.mjs`, `modules/temps.mjs`, `modules/qr.mjs` |
| ce qui vient d'ailleurs, relu avant d'être affiché | `modules/sur.mjs` |
| fenêtre commune par-dessus le plan | `modules/fenetre.mjs` |
| ce que la page sait d'elle-même — API, salon, borne, administration | `modules/salon.mjs` |
| API publique du plan, cache, fraîcheur | `supabase/functions/plan-public/`, `src/index.mjs` |
| politique de sécurité, commentaires retirés | `outils/genere.js` `poseCsp`, `epure` |
| hors ligne | `outils/gabarit/_sw.js` |
| faire écrire un correctif depuis GitHub | `.github/workflows/correctif.yml` |

## Pièges

Ce qui ne se voit ni à la lecture d'un module ni dans la carte.

- **Deux règles tenues en deux langages — qui change l'un change l'autre.** La
  forme d'un emplacement : `modules/forme.mjs` et `_partage/geometrie.ts`
  (`outils/essais/forme.js`). Les accords des champs : `modules/correspondance.mjs`
  `ACCORDS` et `_partage/champs.ts`. L'empreinte d'une conférence :
  `modules/notifications.mjs` `empreinteDebut` et la fonction SQL `empreinte_debut`.
- **Le seuil de concentration n'est pas une capacité** : le compteur ne voit
  que les journées organisées depuis le plan. C'est un prix, jamais un refus
  (`modules/ordonnanceur.mjs` `peineDeCharge`). La clé de configuration
  `_capacite` garde son nom : la renommer perdrait le réglage des salons en
  production.
- **Les gestes ont un ordre de priorité** — pincement, outils de l'exploitant,
  puis glisser et appui du visiteur (`modules/gestes.mjs`) — et ce que
  `modules/vue.mjs` `appliqueVue` rappelle à chaque image d'un geste aussi. Pendant un
  geste, on ne refait que la forme tirée (`modules/dessin.mjs` `redessineForme`) :
  `dessineDessins` est trop lourd pour une rafale de `pointermove`.
- **Un effet visuel ajouté au plan en CSS** (animation, filtre) doit être rejoué
  dans `modules/webgl.mjs`, sans quoi il ne se voit qu'en SVG (`?rendu=svg`).
- **Une ressource d'une origine neuve** (police, script tiers) s'ajoute à
  `outils/genere.js` `poseCsp`, sans quoi la page la refuse et les essais
  échouent sur l'erreur de console. Un script en ligne y est permis par son
  empreinte, recalculée à chaque construction.
- **N'écrivez jamais `rel="manifest"` entre guillemets** dans
  `modules/installation.mjs` : la construction y reconnaît la page installable.
- **Un plan n'a qu'un calage sur la Terre par pavillon**, colonne `plan.calage`.
- **Une zone ajoutée à la main** range sa fiche dans son entrée `_ajout:<id>` :
  le serveur n'applique les colonnes de l'événement qu'aux zones de
  l'instantané (`modules/fiche-zone.mjs` `enregistreZoneAjoutee`).
- **Le thème du plan est le clair, seul** ; la nuit ne vit que dans la console.

## Déploiement

Rien ne se déploie à la main. Une poussée sur `main` applique les migrations et
redéploie les fonctions (`supabase.yml`) ; Cloudflare suit le dépôt, construit
les pages et déploie le Worker — en production pour `main`, en
prévisualisation pour toute autre branche, à
`<branche>-plan-interactif.interactiveplan.workers.dev`. Il construit sous
Node 22, fixé par `.nvmrc`. Toute poussée lance aussi `pages.yml` et
`essais.yml`.

**Une migration poussée sur `main` part en production.** Les migrations sont
rejouables et jamais réécrites : une correction est une migration de plus.

**Une prévisualisation se tient à l'écart de la production**, dont elle partage
pourtant les liaisons. La construction sait quelle branche elle construit
(`WORKERS_CI_BRANCH`, `outils/projet.js`) ; le Worker, qui se reconnaît aussi à
son adresse, n'y lit ni n'écrit le cache `CACHE` des visiteurs — seulement
`CACHE_APERCU` s'il est déclaré — et n'y relaie ni mesures, ni erreurs, ni
plans de visite (`src/index.mjs` `enApercu`, `cacheDe`, `ecritEnProduction`,
éprouvés par `outils/essais/apercu.js`). **Mais l'administration ouverte en
prévisualisation écrit toujours dans la base de production** : c'est la page
qui lui parle, avec la session de l'exploitant. Seul un projet de recette l'en
séparera — il se branche en remplissant `PROJETS.recette`.

## Secrets

Aucune clé dans le dépôt. `.env` est exclu ; les clés serveur vivent dans les
secrets Supabase (`npx supabase secrets set …`). La clé `service_role` et la
clé Klipso ne doivent jamais atteindre une page ni un commit. La clé
« publishable » de `outils/projet.js` est faite pour circuler.

Toute nouvelle adresse de déploiement doit être ajoutée à
`ORIGINES_AUTORISEES`, sans quoi les fonctions refusent ses appels — sauf
`mesure`, ouverte à toutes les origines.

## Tenir au courant pendant le travail

Un long silence se lit comme une panne. Pendant la réflexion comme pendant la
construction, un point d'avancement **toutes les deux minutes environ** : une
ou deux phrases sur ce qui vient d'être fait et ce qui se fait maintenant, même
sans résultat neuf. Ils s'ajoutent à la liste d'étapes, tenue à jour. Et **un
travail long s'annonce avant d'être lancé** — construction, essais,
synchronisation, mesure.

## Conventions

Le code, les commentaires et les messages de commit sont en **français
accentué**. Les commentaires expliquent *pourquoi*, pas *quoi* — c'est le ton
en place dans tout le dépôt, gardez-le.
