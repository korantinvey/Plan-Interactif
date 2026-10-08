# Plan interactif — repères de travail

Plans de salon interactifs alimentés par Klipso (API GAIA), avec une console
d'administration multi-événements. Le `README.md` décrit le système et son
déploiement ; ce fichier ne retient que ce qui se paie cher quand on l'ignore.

## La chaîne de fabrication

Les pages de `web/` ne sont pas écrites à la main : elles sont **assemblées**
depuis `outils/gabarit/`, et **ne sont pas versionnées**. Cloudflare les
construit à chaque déploiement (`wrangler.jsonc` `build`), la CI pour ses
contrôles, chacun chez soi par `npm run construire`. Seuls `web/polices/` et
`web/bibliotheques/`, qui ne se refont qu'avec le réseau, restent dans le dépôt.

```
outils/gabarit/*.html, *.css → outils/tpl-multi.html → web/*.html
outils/gabarit/modules/*.mjs  → esbuild, un script par point d'entrée → posé dans web/*.html
outils/gabarit/_console.css                   → web/console.css
outils/gabarit/_sw.js + outils/pwa.js         → web/sw.js, manifeste, icônes
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

`CARTE.md`, lui, reste versionné — on le lit sans rien construire. Lancez
`npm run verifie` avant de valider : il le refait et signale s'il bougeait.

## Les modules, et le code soudé

Le code des pages a longtemps été un seul script par page : des morceaux mis
bout à bout dans un espace de noms unique, où chacun appelle les fonctions de
tous les autres sans le dire. Il en sort **progressivement**, vers de vrais
modules dans `outils/gabarit/modules/` — extension `.mjs`, `import` et
`export` explicites. esbuild (dépendance de développement, version épinglée)
les réunit par point d'entrée — `plan.mjs` pour le plan public et la
démonstration, `plan-admin.mjs` pour l'administration, `console.mjs` et
`rapport.mjs` pour les deux écrans de l'exploitant — en un script posé **avant** le
code soudé, ni minifié ni renommé : une erreur remontée doit désigner une ligne
lisible.

Le code soudé ne sait pas importer. Un point d'entrée lui confie donc ses noms
par `Object.assign(globalThis, { … })`, un objet littéral de noms et rien
d'autre : `outils/modules.js` relit cette liste, et la construction, la
relecture ESLint et les types en tirent ce que la page trouve sans le déclarer
— les types avec la signature réelle de chaque nom, par `typeof import(…)`.

Les gestes qui vont avec :

- **Sortir du code vers un module** : le déplacer avec ses commentaires,
  l'exporter, l'importer et l'exposer dans le point d'entrée des pages qui
  l'emploient, puis supprimer l'original. Une fonction recopiée dans deux pages
  — c'était le cas de `$`, `esc`, `separeValeurs` dans le plan et la console —
  devient un seul module importé deux fois. Ce qui ne sert qu'au module n'est
  pas exporté : il devient privé, invisible du code soudé.
- **Un module n'appelle jamais le code soudé** : il n'importe que d'autres
  modules. On sort donc d'abord ce dont tout dépend, puis ce qui en dépend.
- **Ce que le module ne peut pas importer** — un état du code soudé (`DATA`),
  une de ses fonctions — **lui est confié** par une fonction de branchement que
  le code soudé appelle à la place que le module y tenait : `brancheMesure`,
  dans `_branche-mesure.html`. Ce qui s'exécutait au chargement y passe aussi,
  pour garder son rang parmi le reste du plan.
- **Un nom qui quitte la liste exposée** est un nom que le code soudé n'appelle
  plus : c'est ainsi que la soudure se défait, un domaine après l'autre.
- `npm run verifie`, `npm run lint` et `npm run types` relisent les modules :
  ESLint comme des modules, la traduction comme toute source affichée,
  `CARTE.md` avec les points d'entrée qui les embarquent.

## Ce que le visiteur ne reçoit pas

Les trois pages du plan sont soudées des mêmes modules, et le code
d'administration y est tissé dans le code public. Les tranches qui ne servent
qu'à l'administration sont bornées dans la source :

```
/* @admin — pourquoi */        ou, dans le balisage,   <!-- @admin — pourquoi -->
…
/* @fin-admin */                                        <!-- @fin-admin -->
```

`plan.html` et `plan-smcl.html` les perdent entières ; `plan-admin.html` ne perd
que les lignes des marqueurs, et reste donc identique à ce qu'il serait sans
eux. Le geste qui va avec : **un réglage, un volet, une fenêtre d'exploitant
s'écrit dans une tranche**. `outils/reserve.js` fait échouer la construction si
la page publique cite encore un nom ou un `$("id")` qu'on lui a retiré, et le
nomme — on élargit alors la tranche, ou l'on en sort ce nom. Un appel gardé par
`typeof nom === "function"` reste permis.

Une tranche se borne sur des lignes entières, et doit se suffire : elle refuse
de se fermer sur des accolades déséquilibrées. Le piège est la dernière ligne
d'une propriété qui ferme aussi son objet (`apres: () => {…} },`) : on passe
`},` à la ligne avant de borner. Pour vider une fonction que le public appelle
sans s'en servir — `construitPanneau`, `retourAuxReglages` —, on borne son
corps et l'on garde sa signature.

Les modules suivent la même partition, par leur point d'entrée : une tranche
n'aurait aucun effet dans un module, posé après la découpe. `plan-admin.mjs`
reprend `plan.mjs` en entier (`import "./plan.mjs"`) et expose en plus ce que
seule l'administration reçoit — un seul script par page, sans quoi deux
exemplaires d'un module partagé auraient deux états. Un nom exposé là et non
dans `plan.mjs` compte pour `reserve.js` comme un nom sorti d'une tranche. Le
geste qui va avec : **un module d'exploitant s'importe dans `plan-admin.mjs`,
jamais dans `plan.mjs`**. La relecture et les types relisent `plan.html` tel
qu'il est livré, tranches retirées.

Sont déjà en tranches : la fenêtre des réglages, la fiche d'une zone, et tout
l'outil de dessin — boîte à outils, gestes, aimants, panneau et ordre des
calques, calage des halls, reprise et ajout d'emplacements, placement des
libellés, sauvegarde de la configuration — avec leur balisage.

Ce contrôle ne voit que le JavaScript et les identifiants d'éléments : la
feuille de style n'a pas encore de tranche, faute de pouvoir prouver qu'une
règle ne sert plus au visiteur.

## Ne jamais modifier directement

Les sorties de la construction — `web/` hors `polices/` et `bibliotheques/`,
`outils/tpl-multi.html`, `CARTE.md` — et toute migration déjà sur `main`.
`.claude/hooks/garde.js` refuse ces écritures dans une session Claude Code et
nomme la source à corriger ; la règle vaut aussi hors de lui, pour une retouche
à la main ou le workflow `correctif.yml`.

## Plusieurs sessions en parallèle

Deux conversations ouvertes sur le même dépôt se heurtaient à deux endroits.
Les deux sont désamorcés, chacun avec un geste qui l'accompagne.

**Les fichiers fabriqués ne se fusionnent plus.** Les pages ne sont plus
versionnées du tout : deux branches ne se disputent plus mille lignes de page
recopiées. Reste `CARTE.md`, marqué `merge=ours` dans `.gitattributes` : git
garde la version en place au lieu de mélanger deux index. Le geste qui va avec :
**après toute fusion ou rebasage, `npm run construire`**, qui refait l'index
depuis les sources fusionnées. `npm run verifie` le signale, le workflow `Pages`
le rattrape — un commit plus tard, à tirer avant la poussée suivante.

**Les migrations sont horodatées à la seconde**, non plus numérotées à la
suite : `npm run migration -- "Titre"` produit `AAAAMMJJHHMMSS_titre.sql`.
Deviner « le numéro suivant » revenait à le prendre en même temps que l'autre
session, puis à renommer un fichier peut-être déjà appliqué en production. Une
migration **appliquée** ne se renomme jamais : elle est enregistrée sous son
ancien nom, et rejouerait sous le nouveau.

L'horodatage a son revers, et il se paie à la fusion. Une branche qui vit
plusieurs jours porte une migration datée du jour où on l'a créée ; `main` en
reçoit d'autres pendant ce temps, plus récentes, et déjà appliquées. `supabase
db push` refuse alors d'en insérer une avant la dernière posée — le déploiement
échoue après la fusion, sur `main`, quand il est trop tard pour le voir venir.
**Avant de fusionner une branche qui a vieilli, comparez votre migration à la
dernière de `main`** : si elle lui est antérieure, réhorodatez-la. C'est sans
risque tant qu'elle n'a jamais été appliquée — et le savoir se lit dans le
journal du déploiement, qui la nomme.

**Jamais de poussée forcée** — le garde la refuse : le workflow `Pages` a pu
commiter l'index sur la branche, et `--force` effacerait ce commit. `git pull --rebase`.

## Données figées

`web/plan-smcl.html` embarque ses données au lieu d'appeler l'API : c'est la
version de démonstration, publiable en artefact (une page publiée ne peut
appeler aucune API externe). Sa source est `outils/plans.json`, **versionnée**
— sans elle la construction échoue sur un clone neuf, et elle ne se régénère
qu'avec une clé Klipso. Les mêmes données sont déjà dans la page publiée : la
versionner n'expose rien de plus.

Les polices suivent la même règle : `web/polices/` et `outils/polices.json` sont
versionnés et ne se régénèrent qu'avec le réseau (`npm run polices`). Aucune
page ne doit les demander à Google — chaque visiteur lui transmettrait son
adresse IP, et la mesure du plan tient justement à ne rien laisser fuir sans
consentement. `npm run construire` échoue si une page le fait.

## La version anglaise

Toute page existe en français et en anglais ; le bouton à drapeau passe de
l'une à l'autre sans recharger, `?lang=en` l'impose par l'adresse. Le code
reste écrit en français : `_langue.js`, posé en tête de chaque page, traduit ce
qu'elle affiche en cherchant chaque phrase dans `outils/anglais/`. Les modules
n'appellent donc aucune fonction de traduction — sauf pour ce qui quitte la
page (export tableur, feuille de partage) ou ce que le code mesure et compare :
là, `traduit("…")`.

Le geste qui va avec : **une phrase affichée s'ajoute avec sa traduction**,
dans `outils/anglais/<module>.js`. `npm run verifie` refuse une chaîne visible
qui n'en a pas, et nomme le fichier et la ligne. Une phrase composée —
`n + " exposants retenus"` — se traduit par un modèle : `"{n} exposants
retenus": "{n} exhibitors match"`. Ce que le serveur écrit et que la page
affiche tel quel va dans `serveur.js` ; une chaîne que le contrôle croit
visible à tort, dans `invisibles.js`.

Deux pièges. Un code qui relit le texte d'un bouton pour savoir où il en est
lira l'anglais : comparez à `traduit("…")`, ou mieux à un état. Et le contrôle
lit les sources, pas l'écran : `?lang=en&manques` relève dans le navigateur ce
qui reste en français (`LANGUE.manques()`). Ce qui y reste est une donnée —
exposants, nomenclature Klipso, conférences Eventmaker — non une chaîne du code.

## Où vit quoi

| | |
|---|---|
| `outils/gabarit/` | la source des pages |
| `web/` | les pages construites, servies par Cloudflare — non versionnées, sauf `polices/` et `bibliotheques/` |
| `supabase/migrations/` | schéma de la base — horodatées, rejouables |
| `supabase/functions/` | synchronisation Klipso et API publique |
| `src/index.mjs` | Worker Cloudflare : relais et cache de `/api/plan` |
| `.github/workflows/` | reconstruction des pages, déploiement Supabase, sauvegarde et écriture des correctifs |
| `outils/anglais/` | le dictionnaire anglais, un fichier par module |
| `outils/essais/` | les essais hors page — `npm run essais` (les douze cas du moteur, puis `terre.js` : le calage sur la Terre, éprouvé seul ; puis `forme.js` : la forme d'un emplacement, calculée à l'identique par la page et par la synchronisation) et `npm run fep26` (salon synthétique) ; l'ordonnanceur est extrait du gabarit par ancres, jamais recopié |
| `outils/essais/navigateur/` | le plan dans Chromium par Playwright — `npm run navigateur` : ouvert, cherché, lu en fiche, en anglais, sur téléphone ; et les règles de `modules/sur.mjs` éprouvées sur des entrées hostiles. Les données viennent de `outils/plans.json`, interceptées (`aide.js` `prepare`) : un essai ne doit rien au réseau. Une phrase de l'interface citée par un essai change avec lui. `PLAN_ADRESSE=https://<branche>-plan-interactif.interactiveplan.workers.dev npm run navigateur` éprouve un déploiement plutôt que le serveur local |
| `outils/relecture.js`, `eslint.config.js` | la relecture ESLint — `npm run lint`. Le code des pages se relit **tel que la page l'assemble**, jamais module par module (l'espace de noms est unique), et chaque remarque revient au module et à sa ligne ; un nom inutilisé ou inconnu ne compte que s'il l'est dans toutes les pages qui portent le module |
| `outils/types.js` | les types par TypeScript (`checkJs`, sans rien récrire) — `npm run types`. Un **cliquet** dont le stock est **vide** (`outils/types-acceptes.json`) : toute remarque échoue. On la corrige, ou l'on précise le type par `@type` là où le code le sait mieux que TypeScript ; `$` et les recherches par sélecteur rendent un élément sans type précis, à préciser ainsi |
| `outils/gabarit/modules/` | les modules sortis du code soudé, réunis par esbuild — points d'entrée `plan.mjs`, `plan-admin.mjs`, `console.mjs` et `rapport.mjs` ; assemblage, liste exposée et provenance de chaque nom dans `outils/modules.js` |
| `outils/appels.js` | les fonctions appelées que rien ne déclare — le défaut que la soudure des modules en un seul espace de noms rend possible et que la syntaxe ne voit pas. Chaîné dans `npm run verifie` ; seul, `npm run appels` |

## Chercher sans tout ouvrir

Le dépôt est petit, et pourtant coûteux à lire en aveugle : `web/` recopie
`outils/gabarit/` en quatre exemplaires, si bien qu'une recherche de « calque »
remontait 444 lignes dont 400 étaient la même chose recopiée. Trois choses
règlent cela — servez-vous-en avant d'ouvrir quoi que ce soit.

- **`CARTE.md`** est l'index des sources : pour chaque module, ses sections, ses
  fonctions et ses identifiants, **avec les numéros de ligne**. Il est produit
  par `npm run construire` et vérifié par `npm run verifie` — il ne peut donc
  pas mentir. C'est le premier fichier à lire, et souvent le seul avant d'aller
  droit au bon endroit.
- **`.ignore`** retire de la recherche plein texte `web/`, `tpl-multi.html` et
  `plans.json` : ils sont fabriqués ou figés, on n'y corrige rien. Ils restent
  lisibles en les nommant, quand il faut vraiment vérifier une page construite.
- **Aucun module ne dépasse 3400 lignes**, et quatre passent 2500 —
  `_console-js.html`, `_itineraire.html`, `_journee.html`, `_dessin.html`. On y
  entre par tranche (`sed -n '531,700p'`), jamais en entier : `CARTE.md` donne
  la tranche. Les trois qui dépassaient 5000 lignes — `_js.html`,
  `_admin1.html`, `_head.html` — sont coupés en morceaux consécutifs, chacun
  ouvert par un en-tête qui dit ce qu'il porte ; seul l'ordre de
  `outils/assemble.js` les relie, et la page assemblée est la même qu'avant.

### Ce qu'on veut toucher, et où

| intention | où |
|---|---|
| recherche, index des exposants, liste | index `_js.html` § 1, recherche et liste `_recherche.html` § 5 |
| panneau des critères déplié sous la recherche | `_recherche.html` `remplitCriteres`, `ouvreCriteres`, `fermeCriteres`, relecture par `majCriteres` ; balisage `_head.html` `#panCrit`, styles `_styles-plan.css` `.pan-crit` |
| ordre des filtres dans ce panneau | réglage `_admin1.html` `blocOrdreCriteres` (onglet « Recherche », au bas de `voletRecherche`), clé `_crit.ordre` de la configuration ; application `_recherche.html` `ordreCriteres`, relue par `clesCriteres`, panneau refait par `refaitCriteres` ; styles `_styles-modeles-parcours.css` `.ordreCrit`, empruntés au rangement de la fiche |
| sortes d'éléments que la recherche remonte | `_admin1.html` `voletRecherche`, porte dans `_recherche.html` `visible` ; repères cherchables dans `_dessin.html` |
| rendu du plan, libellés, zoom, sélection, fiche | rendu et libellés `_rendu.html` § 3, 4 ; zoom `_vue.html` § 6 ; sélection et fiche `_fiche.html` § 7 ; gestes `_gestes.html` § 8 |
| logo en tête de fiche, marges retirées, place à côté du nom ou sous le numéro | `_fiche.html` `poseMarque`, `rangeMarque` ; recadrage par le module `modules/marque.mjs` `recadreMarque` (le plan) et `vignetteDeLogo` (les vignettes que la console fabrique, à la même règle) |
| dessin WebGL du plan (rendu par défaut, `?rendu=svg` pour l'écarter) | `_webgl.html` — il relit le SVG caché : un effet visuel ajouté au plan en CSS (animation, filtre) doit y être rejoué, sans quoi il ne se voit qu'en SVG ; bibliothèque dans `web/bibliotheques/` |
| ce que la fiche montre, ordre des champs, sections, intitulés | réglage `_ordre-fiche.html` `voletOrdre` (réserve à gauche, fiche au milieu, aperçu à droite) ; rendu `_fiche.html` `corpsRange`, `champCorps`, `montreIntitule` ; migrations `groupes_de_champs`, `intitules_des_champs` |
| tiroirs du bas sur écran étroit — liste, fiche, parcours, itinéraire | `_gestes.html` § Le tiroir de la liste, § Les tiroirs menés par la hauteur (`tiroirCrante`, un appel par tiroir) ; crans et prise dans `_styles-plan.css` et `_styles-parcours.css` `.side`, `.detail`, `.parcours`, `.itineraire`, `.poignee` ; la liste cède la bande aux trois autres par `cede` |
| couleurs, visibilité et réglages des calques | `_admin1.html` ; fenêtre des réglages `_reglages.html`, volets `_volets.html` |
| co-exposants sur le plan — pastille du nombre, choix de la société au clic | onglet « Co-Exposants » des réglages, `_reglages.html` `voletCoexposants` (profil administrateur), clés `_coexNombre` et `_coexChoix`, lues par `_rendu.html` `coexComptes` et `coexChoisit` ; rattachement à l'hôte par la synchronisation, cible `coexposant` de `_partage/champs.ts`, réglée dans la console (`_console-js.html`, « Rattachement des co-exposants ») |
| lenteur d'un nuancier, couleur qui traîne derrière la souris | `_admin1.html` § La rafale du sélecteur de couleur, `suitNuancier` ; peintures ciblées `_dessin.html` `peintCalque`, `_recherche.html` `peintSecteur` |
| police des noms sur le plan, celle d'un modèle ou une autre de la liste | `_admin1.html` `POLICES_LIBELLE`, `POLICES_NOMS` (relue par `npm run polices`) et ses genres `GENRES_POLICE`, `posePoliceLibelles` ; vignettes et filtres dans `_volets.html` `voletApparence` ; clé `_fiche.police` |
| fiche d'une zone, salles de conférence qu'elle abrite | `_mode-admin.html` `champsZone`, `champSalles` ; colonne `salles` ; libellé et description anglais `nom_en`, `description_en` dans `zones_fiches`, affichés par `_js.html` `nomDeLaZone` |
| démarrage de la page, appel API, panne réseau | `_admin2.html` |
| tracé des calques de dessin | `_dessin.html` |
| arrêt de transport — mode, ligne, couleur de la signalétique | `_dessin.html` § Les transports en commun (`MODES_TRANSPORT`, `COULEURS_LIGNE`, `couleurRepere`, `ligneAffichee`), type `TYPES_REPERE` « transport » et nature de zone `TYPES_ZONE` ; champs `_head.html` `#repereTransport` et `#elemTransport`, reprise `_edition.html` `appliqueTransport` ; une seule pastille au cartouche pour tous, `pastillePoi` et `PICTOS_TRANSPORT` ; plaque à barres du tram — champ clair, deux barres à la couleur de la ligne — drapeau `plaque` de `MODES_TRANSPORT`, tracée par `traceRepere`, styles `_styles-plan.css` `.repere.plaque` et `.barres` |
| halls d'un lieu connu, calage — le poser, le reprendre —, mention de la source | `_batiments.html` ; ce qui identifie un hall et dit d'où vient son contour `refBatiment`, `refForme`, `marqueBatiment` — `mentionOsm` teste `osm` en propre, un contour saisi ne devant rien à OpenStreetMap ; reprise d'un calage validé § Reprendre le calage, `rouvreCalage`, `calageRelu`, bouton `boutonRecale` posé sur la ligne du calque par `_pile.html` ; bibliothèque `outils/lieux.js` → `outils/lieux.json`, versée par `genere.js` dans `plan-admin.html` seul |
| ajouter un lieu à la bibliothèque — relevé dans OSM, ou saisi sur un plan coté | `outils/lieux.js` `LIEUX` ; `lieuOsm` pour des identifiants OSM, `lieuSaisi` pour des contours en mètres relevés à la main (`source` obligatoire), les deux jamais dans un même lieu ; `npm run lieux` refait tout, `npm run lieux -- <clé>` ce lieu seul et garde les autres — le seul moyen d'ajouter un lieu saisi sans réseau |
| image posée sur le plan et liée à un exposant — clic sur le logo, fiche de l'enseigne | `_dessin.html` `lienImageSaisi`, `formeImage`, `traceImage`, `ditImagePosee` ; champ `#imageSoc` de la boîte à outils ; rattachement après coup `_edition.html` `appliqueSociete` (champ `#elemSoc`, partagé avec le stand dessiné) ; sortes concernées `FORMES_RATTACHEES`, porte de l'option `seRattache` ; canal de mesure `image` par `_fiche.html` `canalPlan` |
| verrouiller un calque de dessin | `_dessin.html` § Le verrou d'un calque, cadenas posé par `_pile.html` `boutonVerrou` |
| déplacer, redimensionner une forme existante | `_edition.html` ; le geste ne refait que la forme tirée, par `_dessin.html` `redessineForme` — `dessineDessins` refait tous les calques et remesure le cartouche, trop lourd pour une rafale de `pointermove` |
| forme d'un emplacement — anneaux et tracé, empreinte, ancrage du nom et place libre autour | `modules/forme.mjs` (`anneauxGeo`, `traceGeo`, `empreinteGeo`, `boiteAnneaux`, `boiteGeo`) — la même règle que `supabase/functions/_partage/geometrie.ts` `boite`, vérifiée par `outils/essais/forme.js` : **qui change l'un change l'autre** |
| reprendre à la main la forme d'un stand ou d'une zone venue de la source | `_geometrie.html` — réglage `_geo:<id>` gardé tant que l'empreinte du tracé source ne bouge pas ; crayon et cadenas (fermé d'avance) posés par `_pile.html` sur les couches `data:stands` et `data:zones` |
| ajouter à la main un stand sur la couche Stands, une zone sur la couche Zones organisateur — gardés à travers les synchronisations | `_geometrie.html` § Ajouter à une couche ce que la source n'a pas — outils rectangle et polygone de la palette `#geoReg` (`choisitOutilGeo`, `ajouteEmplacement`), numéro et nom `renommeAjout`, retrait `supprimeAjout` ; lien d'un stand ajouté à un exposant — champ `#geoSoc`, `lieAjout`, `poseLien` (clés `stand` et `soc` de l'entrée, comme un stand dessiné) : son groupe porte l'exposant en `data-id`/`data-soc` et lui-même en `data-aj`, relu par `objetGeoSous` et `groupeGeo`, trouvé par `_dessin.html` `decoupeStand` ; lié, il sort de `TOUS` et de la liste ; une entrée de configuration par élément, clé `_ajout:<id>`, versée dans le pavillon par `appliqueAjouts` depuis `_js.html` `indexe` ; balisage partagé avec la source `_rendu.html` `baliseStand`, `baliseZone` ; fiche et masquage d'une zone ajoutée rangés dans son entrée, `_mode-admin.html` `enregistreZoneAjoutee` — le serveur n'applique les colonnes de l'événement qu'aux zones de l'instantané ; ses salles de conférence restent dans la colonne `salles`, et `plan-public/` compte les zones ajoutées dans `zonesDuPlan` en relisant les clés `_ajout:` de la configuration du pavillon |
| cote, aimants, grille des stands, taille exacte, duplication | `_aimants.html` |
| ordre des calques, pile, couleur du fond du plan | `_pile.html` |
| fond de carte sous le pavillon, calage du plan sur la Terre | `_environs.html` ; groupe `#fondCarte` posé par `_vue.html` `appliqueVue`, limite de recul `_environs.html` `recul` ; **un calage par pavillon**, colonne `plan.calage` lue par `calagePose` et écrite par `enregistreCalage` (identifiant de base par `_pousse.html` `identifiants`), oubli du réglage en cours à `_rendu.html` `changePlan` ; migrations `calage_du_plan_sur_la_terre` puis `le_calage_de_la_carte_par_pavillon` |
| passages entre le plan, la Terre et les tuiles — degré en mètres sur l'ellipsoïde, Mercator, ré-ancrage, aire, centre et axe d'un contour | `modules/terre.mjs` (`metresParDegre`, `versTerre`, `versLePlan`, `reancre`, `pixelsMercator`, `latitudeDePixel`, `echelleDesTuiles`, `niveauDesTuiles`, `aireDuContour`, `centreDuContour`, `axeDuContour`) ; l'angle se compte de l'est vers le nord ; éprouvé par `outils/essais/terre.js` |
| placer et tourner la carte à la main | `_environs.html` § Placer à la main, branché dans la chaîne des gestes de `_gestes.html` |
| rendu vectoriel du fond, libellés droits sur un plan tourné | `_environs.html` § Le rendu vectoriel — MapLibre chargé à la demande, toile `#fondCarteGL` |
| vider le hall sous la carte | `_environs.html` § Le trou sous le pavillon — contour gelé par `retientLeHall`, aplat `#trouDuFond`, bouton par calque posé par `_pile.html` |
| enregistrer la configuration pour tous | `_pousse.html` |
| parcours de visite | `_parcours.html` |
| garder un parcours préparé longtemps à l'avance — copie emportée, rang mis de côté, stockage persistant | `_partage.html` § La copie qu'on se garde (`ouvreGardeParcours`, `poseGardeParcours`) ; `_parcours.html` `MIS_DE_COTE`, `trieParcours`, `parcoursAEcrire`, `QUARANTAINE_JOURS`, `tientLeStockage` ; ce que l'application installée d'iOS ne reprend pas `_installation.html` `poseGardeInstallation` ; note `_styles-parcours.css` `.pGarde` |
| ajouter d'un coup tout ce que la recherche retient | `_parcours.html` § Tout ce que la recherche a retenu, bouton posé au pied du panneau par `_recherche.html` `remplitCriteres` |
| rappel avant une conférence retenue — notification, délai, abonnement | `_rappels.html` ; interrupteur posé dans le tiroir par `_parcours.html` `remplitParcours`, réglage `_reglages.html` `blocRappel` (onglet « Admin », profil administrateur, à côté de l'invitation à installer) ; fenêtre qui le propose à la première conférence retenue `fenetreRappel`, `proposeRappels`, appelée par `_parcours.html` `basculeParcours`, reportée par `modules/fenetre.mjs` `poseApresFermeture`, aperçu depuis les réglages par `proposeRappels(true)` et `_installation.html` `retourAuxReglages("rappel")`, essai réel par `essaieRappelReel` et `_reglages.html` `ditEssaiRappel` ; réception `_sw.js` § Les rappels de conférence ; relais `src/index.mjs` `rappels` (`/api/rappels`), serveur `supabase/functions/rappels/`, chiffrement `_partage/push.ts`, migration `rappel_avant_une_conference` (tâche `pg_cron` à la minute) ; secrets `VAPID_*` |
| catalogue d'un exposant — produits sur sa fiche, onglet « Produits » | relevé `supabase/functions/_partage/eventmaker.ts` `produits()` (`ProduitEm`), étape `sync-evenement/` domaine `produits`, pose sur le stand et sur les hébergés (`hebergee`) ; retrait `plan-public/` `CHAMPS_FICHE` ; rendu `_fiche.html` `produits`, `ficheProduit`, `produitsOuverts`, troisième position de `onglet` ; balisage `_head.html` `#dOngProd`, styles `_styles-plan.css` volet `.cProd`, vignettes `.prods` ; réglage console `_console-js.html` `origineProduits` ; note `outils/eventmaker-produits.md` |
| suggestion d'un exposant de plus, onglet « Suggestion » | `_suggestion.html` ; canal de mesure `suggestion`, migration `canal_de_mesure` |
| itinéraire d'un point du salon à un autre | `_itineraire.html` |
| mode borne interactive — `?borne`, position de l'écran, remise à zéro | `_borne.html` ; départ figé dans `_itineraire.html` `pointBorne`, marqueur posé par `_rendu.html` `montePlan` |
| code QR « Vous êtes ici » — affiche du hall, plan localisé, désactivation | `_ici.html` (`?ici=`) ; départ imposé partagé avec la borne par `_borne.html` `poseDepartImpose`, tracé du damier `modules/qr.mjs` `qrChemin` ; visée `ici` dans `_itineraire.html` `bandeauVisee`, `visePoint` et la chaîne des appuis de `_gestes.html` ; bouton posé par `_mode-admin.html` `activeAdmin` ; rappel `_styles-parcours.css` `.iciRappel`, affiche imprimée `_styles-modeles-parcours.css` `#afficheQr` |
| ordre de visite, conférences, horaires | `_journee.html` |
| seuil de concentration d'un stand, journée organisée qui s'étale | **ce n'est pas une capacité** — le compteur ne voit que les journées organisées depuis le plan, jamais la fréquentation du salon ; le seuil dit à partir de combien des nôtres le moteur cherche un autre ordre. Trois notions distinctes : `_admin1.html` `seuilConcentration` (configuration, que le moteur ne modifie jamais), **charge annoncée**, et `_journee.html` `seuilEffectif` (interne au calcul) ; réglage `_volets.html` `voletParcours` (onglet « Parcours intelligent ») et ses règles dans `_admin1.html` (`REGLAGES_SEUIL` — `parDix`, `plancher`, `plafond`, `nombre` —, `seuilGere`, `seuilImpose`, `seuilParSurface`, `regleSeuil`, `phraseSeuil`, surface par `aireDuStand`) ; **clé de configuration `_capacite` gardée telle quelle** — déjà écrite chez les salons en production, la renommer perdrait leur réglage ; **un prix, jamais un refus** — courbe `PEINE_CHARGE`, `PEINE_MAX`, `SEUIL_PEINE`, `peineDeCharge`, entrée dans le calcul par `coutCreneau` seul (`peineCreneau`, `peineCandidat`, `peineDecalee`), le visiteur se comptant parmi ceux qu'il gêne ; ce qui se remplit est une **ressource** `GENRES_RESSOURCE`, `RESSOURCES` (stands seuls, la forme est prête pour zone, allée, liaison) ; charge lue autour de l'heure et non dans sa case `chargeAutourDe`, `LISSAGE_CHARGE`, `DUREE_VISITE` ; ordres essayés exhaustivement là où ça paie `permuteCongestion`, `PERMUTE_MAX` ; dilatation progressive et plafonnée `DILATATION`, `dilatationPour`, `dilatationDuJour` (`TRANCHES_MINI`) ; annonce et lecture `_journee.html` § La charge annoncée (`annoncePlan`, `litLaCharge`, `chargeCellule`, `trancheDe`, `celluleUtile`), identifiant du parcours `_parcours.html` `identifiantParcours` ; serveur `supabase/functions/plan-de-visite/`, relais `src/index.mjs` `planDeVisite` et `chargePrevue` (`/api/plan-de-visite`, `/api/charge`), migration `la_charge_prevue_des_stands` ; essais `outils/essais/` — `npm run essais` (douze cas), `npm run fep26` (salon synthétique, cinq taux d'adoption, cinq tirages) |
| visite guidée du premier démarrage | `_tutoriel.html` (chapitres `CHAPITRES_TUTO`), proposée par `_admin2.html` `demarre` ; case et « Essayer » dans `_reglages.html` `voletPlan` ; styles `_styles-divers.css` § La visite guidée ; anglais `outils/anglais/_tutoriel.js` |
| options vendues à part — dessin des stands, images sur un stand, journée organisée, programme de conférences, recommandation sponsorisée | `_admin1.html` `OPTIONS`, `optionActive`, `_volets.html` `blocOptions` (onglet « Admin », profil administrateur) ; ce qui se ferme par la feuille de style sous `html.sans-dessin-stand` (bouton de l'outil), `sans-image-stand` (champ `#imageSoc`, l'outil image restant) et `sans-journee` dans `_styles-plan.css` et `_styles-parcours.css`, le code refusant ensuite par `outilOffert` et `seRattache` ; le programme se refait par `_js.html` `indexeConferences` (clé `_options`) |
| logo au démarrage, le temps du chargement — rien, la marque, un sponsor | `_sponsor.html` (`MODES_SPONSOR`, `modeSponsor`) — posé au premier trait d'après le cache `plan-sponsor:<slug>`, corrigé par `accueilleSponsor` dans `_admin2.html` `demarre`, rendu par `suitSponsor` ; réglage `_sponsor` et bloc `blocSponsor` (`CHOIX_SPONSOR`) au bas de `_volets.html` `voletAdmin`, donc réservé au profil administrateur ; marque du produit par `MARQUE_SPONSOR`, posée par `genere.js` à la place de `<!--__MARQUE__-->` ; styles `_styles-divers.css` § Le générique du sponsor et § Le générique du démarrage ; rejoué par `_borne.html` `reposeLaBorne` ; `resteSponsor` fait attendre `_tutoriel.html` et `_installation.html` |
| comptage d'usage | module `modules/mesure.mjs`, branché par le code soudé à sa place d'origine (`_branche-mesure.html` `brancheMesure`, qui lui confie le nom du salon) ; relais `src/index.mjs` `mesure`, qui écrit **sans fonction intermédiaire** par la porte SQL `mesure_publique` (migration `la_porte_publique_des_mesures`, ouverte à `anon` : c'est elle qui borne le paquet) puis `enregistre_mesures` (migration `compteurs`) ; `supabase/functions/mesure/` n'est plus que le repli — porte absente ou en panne. Essai de charge `npm run charge` (`outils/essais/charge.js`, `--mesures-seules` pour ce seul chemin) |
| mesure faite sans réseau, renvoyée à la reconnexion | `modules/mesure.mjs` § La file, `pousseLaFile`, `beaconne` ; recul porté par le paquet, borné par `mesure_publique` et la migration `les_mesures_qui_ont_attendu_le_reseau` |
| mesure sans bandeau : notice « Confidentialité », refus, vie du jeton, purge | `modules/mesure.mjs` § La notice, et le refus, `MESURE_VIE_MOIS` ; lien `_head.html` `#btnConfidentialite` ; `purge_presences` chaque nuit, migration `conservation_des_jetons` ; README « Sans bandeau de consentement » |
| polices des pages | modèles en tête de `outils/polices.js`, polices au choix relues dans `_admin1.html` `POLICES_NOMS` ; puis `npm run polices` → `web/polices/` ; déclarées par `genere.js` `feuillePolices` à la place de `<!--__POLICES__-->`, les polices au choix chargées par `feuillePolice` |
| porte d'accès au plan — navigateur, cadre, écran d'accueil, application | `modules/mesure.mjs` `supportMesure` ; rendu `_rapport-js.html` `portes` ; migration `support_d_acces_au_plan` |
| visiteurs uniques par stand, par canal, par geste | table `visiteur_cible` et fn `audience_cibles` (clés `v_…`), migration `les_visiteurs_uniques_par_stand` ; colonnes `_export.html` `COL_TETE_V`, `COL_PIED_V` ; cartouche `_chaleur.html` `phraseChaleur` |
| carte de chaleur du plan | `_chaleur.html`, migration `audience` |
| remise à zéro des compteurs | `_chaleur.html` § Remise à zéro, `_reglages.html` `ouvreReglages`, migration `remise_a_zero` |
| thème du plan — un seul, le clair ; pas de mode sombre ni de suivi de l'appareil | jetons `_styles-jetons.css` `:root` ; la nuit ne vit plus que dans la console, `_console.css` et `_console-base.html` ; barre du navigateur `outils/pwa.js` `BARRE_CLAIRE` / `BARRE_DEUX_THEMES`, choisie par l'option `deuxThemes` de `outils/genere.js` `page()` |
| plan d'un bord à l'autre de l'écran — à la place de l'heure et de la poignée de gestes | `display` du manifeste dans `outils/pwa.js`, qui dit aussi ce que coûte chacune des deux voies (bande noire au lancement, ou bandeau du navigateur à chaque demande faite par la page) ; retraits rendus sous `@media (display-mode: fullscreen)` dans `_styles-jetons.css` ; option `pleinEcran` de `outils/genere.js` `page()` (`viewport-fit=cover`) ; jetons `--sys-*` de `_styles-jetons.css` `:root`, repris par `.app`, `.topbar`, `.bandeAdmin`, les tiroirs et `_tutoriel.html` `placeTuto` ; couleur dont le système peint sa barre `_js.html` `poseTonDeLaBarre`, jeton `--ton-barre` posé par `.topbar` et par les modèles qui peignent le bandeau |
| les deux bandes qui s'effacent pendant qu'on manipule le plan — celle du salon, celle de la recherche | sur écran étroit la barre se pose par-dessus la scène, qui prend toute la hauteur : `_styles-modeles-parcours.css` `.topbar` (rangs superposés) et `.side`, toutes deux par la classe `.pliee` ; pliées par `_gestes.html` `plieLesBandes` au glissement et au pincement, rendues par `saisitPlan` ; hauteur mesurée par `mesureBarre` (jeton `--barre`), et ce qu'elle couvre du plan par `masqueHaut`, relu par `fit`, `cadreSur` et le cadrage de `_itineraire.html` |
| barre du salon sur un téléphone — bande retirée, pictos à la verticale au bord droit en légère transparence | `_styles-modeles-parcours.css` § « max-width:900px », les règles `html:not(.mode-admin):not(.barre-bande) .topbar` : fond et titre retirés, `.tools` posée hors du flux à droite, jetons du modèle rendus à la page par `inherit`, onglets des pavillons en pastille ; ton de la barre du système repris au fond du plan (`_js.html` `poseTonDeLaBarre`, relancé au franchissement du seuil) |
| choisir entre ce plan sans bande et un bandeau réduit | `_admin1.html` `modeBarre`, `appliqueBarre` ; `_volets.html` `CHOIX_BARRE`, bloc `blocBarre` (onglet « Admin », profil administrateur) ; réglage `_barre`, classe `barre-bande` posée dès le premier trait d'après le cache `plan-conf:<salon>` ; règles du bandeau réduit `_styles-modeles-parcours.css` § « L'autre choix », logo du salon à côté du nom `_js.html` `poseLogoSalon` (l'icône d'onglet, `#logoSalon`) |
| onglets des pavillons qui débordent — fondu du bord, flèche qui avance | `_styles-plan.css` `.halls-bande` (cadre `.bande`, barre `.defile`), flèche empruntée à `.poi` ; marquage `_recherche.html` `majFondus`, rappelé par `_rendu.html` `onglets` |
| styles et structure de l'écran du plan | balisage `_head.html` ; styles en six feuilles, dans l'ordre de `outils/assemble.js` : `_styles-jetons.css` (jetons, bande d'administration), `_styles-plan.css` (écran du plan), `_styles-modeles.css` (modèles de fiche, liste, bandeau), `_styles-parcours.css` (parcours, journée, itinéraire, borne), `_styles-modeles-parcours.css` (modèles appliqués à ceux-ci, écran étroit), `_styles-divers.css` (alerte, visite guidée, générique) ; en-tête `_entete.html` |
| console multi-événements | `_console-js.html`, socle `_console-base.html` |
| icône d'onglet des pages du plan | `_console-js.html` `champFavicon`, posée par `_js.html` `poseFavicon`, migration `icone_d_onglet_du_salon` |
| rapport d'utilisation | `_rapport-js.html`, styles `_console.css` |
| export tableur des exposants | `_export.html` (console **et** rapport), écriture `.xlsx` dans `_classeur.html` — mêmes chiffres que la carte de chaleur, par `audience_cibles` |
| accès administrateur d'un plan | `_auth-plan.html` |
| utilitaires communs — élément par identifiant `$`, échappement `esc`, valeurs d'un champ à choix `separeValeurs`, tri des noms `COLLATION`, conversions de couleur | modules `dom.mjs`, `texte.mjs`, `couleurs.mjs` dans `outils/gabarit/modules/`, servis au plan par `plan.mjs` et à la console par `console.mjs` |
| ce qui vient d'ailleurs, relu avant d'être affiché — adresse saisie, logo d'une société ou d'une zone, description écrite dans l'éditeur | `modules/sur.mjs` `adresseSure` (page, courriel, numéro, rien d'autre), `adresseWeb` et `lien` (réseaux sociaux saisis à la main), `adresseImage`, `imageSure` et `IMAGE_SURE` (pas de SVG), `assainitRiche` (on ne garde que les balises reconnues) |
| heure d'une conférence dans le fuseau du salon, jours et heures écrits — « samedi 14 mars », « mar. 21 », « 09h30 », « 1 h 15 min » | `modules/temps.mjs` `momentLocal` (les deux formes d'Eventmaker), `dateDeCle`, `jourLong`, `jourCourt`, `jourBref`, `jourISO`, `minutesDe`, `ecritHeure`, `ecritMinutes` ; noms `JOURS`, `MOIS` en français, traduits par la page |
| code QR — l'encodeur, le damier, la taille au-delà de laquelle il ne se lit plus | `modules/qr.mjs` `qrTrame`, `qrChemin`, `qrSvg`, `QR_VERSION_LISIBLE` ; employé par `_partage.html` `ouvrePartageParcours` et `_ici.html` |
| fenêtre commune par-dessus le plan — ouvrir, confirmer, fermer par la croix, le voile ou « Échap » | `modules/fenetre.mjs` `ouvreModale`, `fermeModale`, `confirme` ; ce qu'une fenêtre laisse en train de se faire `poseAvantFermeture`, ce qui attend que la place se libère `poseApresFermeture` ; branchée à sa place parmi les écouteurs par `_modales.html` `brancheFenetre`, qui lui confie l'habillage du modèle `_admin1.html` `habilleModale` ; ordre des calques, dans la même fenêtre, resté en tranche `@admin` de `_modales.html` |
| ce que la page sait d'elle-même — API, salon (`SLUG`), chemins partageables, borne (`BORNE`) | `modules/salon.mjs`, qui lit les réglages que `genere.js` `connecte` pose sur le script des modules (`data-api`, `data-slug`) ; ce que la valeur de `?borne` nomme reste à `_borne.html` |
| retirer du plan public ce qui ne sert qu'à l'administration | tranches `@admin` … `@fin-admin` dans les modules, découpées et contrôlées par `outils/reserve.js`, appliquées par `outils/genere.js` (`tplAdmin`, `tplPublic`) |
| consultation hors ligne, ce que le navigateur garde | `_sw.js`, page de secours `_hors-ligne.html` ; fond de carte gardé par `tuileDeCarte` (tuiles, cache durable) et `fondDeCarte` (MapLibre, styles) — fournisseurs `FONDS_DE_CARTE`, bornes `borneLesLots` et `borneLesTuiles` |
| installation, manifeste, couleur de la barre du système | `outils/pwa.js` — `TETE` pour toutes les pages, `application()` pour le seul plan public ; nom, icônes et adresse de départ par salon dans `src/index.mjs` `manifeste`, `appDuSalon` (`MARQUE`), qui les tient de `plan-public?slug=…&app=1` (`TTL_APP`, réponse non gardée en amont) ; nom et icône sur l'écran d'accueil d'iOS par `_installation.html` `nommeApplication` |
| une application par salon, qui n'ouvre que le sien — portée du manifeste | adresse `/plan-<salon>` : `src/index.mjs` `cheminDuSalon`, `CHEMIN_SALON`, `pageDuSalon`, écrite dans `start_url`, `scope` et `id` par `manifeste` ; lue par `modules/salon.mjs` `SLUG` et par le bloc en tête de `outils/pwa.js` `application()` ; ramenée au plan public pour ce qui se partage par `modules/salon.mjs` `cheminPartageable` (`_partage.html`, `_ici.html`) ; visée par `_installation.html` `adresseApplication` (`intent://`) ; clé du cache hors ligne ramenée à `/plan` dans `_sw.js` `navigation` |
| logo d'une zone ou du sponsor déposé par l'exploitant — lecture du fichier, paliers de réduction, poids permis | `modules/depot-image.mjs` `litImage` (lecture et refus communs, repris par `icone-app.mjs`), `reduitLogo`, `PALIERS_LOGO`, `POIDS_LOGO` ; administration seule, par `plan-admin.mjs` ; cadre de dépôt `_mode-admin.html` |
| icône et nom de l'application d'un salon — déposer un logo, ou garder celui du produit | `_application.html` (`blocApplication`, posé dans `_volets.html` `voletAdmin`) ; deux images d'un fichier par `modules/icone-app.mjs` `reduitIconeApp` (administration seule, par `plan-admin.mjs`), fond du masque par `fondPourIconeApp` ; colonnes `icone_app`, `icone_app_masque`, `nom_app` et empreinte calculée `icone_app_version`, migration `l_icone_et_le_nom_de_l_application_installee` ; servies par `plan-public` (`?icone=1`) et relayées par `src/index.mjs` `iconeApp` (`/api/icone`) |
| commentaires retirés des pages servies — le gabarit garde les siens | `outils/genere.js` `epure` (scripts situés par acorn puis découpés sans réimpression, styles et balisage par `epureStyle`, `epureBalisage`) ; appliqué par `page()` et à `sw.js`, `config.js`, `console.css`. Un commentaire n'atteint donc jamais le visiteur — y nommer une personne reste à éviter : le dépôt, lui, le garde |
| quelle page est installable | `outils/genere.js`, option `application` de `page()` — `plan.html` et rien d'autre |
| fenêtre qui invite le visiteur à installer le plan | `_installation.html` — moment `essaieInvitation` (lancé par `_admin2.html` `demarre`), façon par navigateur `faconInstallation`, confirmation après installation `ouvreInstalle` ; case `caseInstallation`, posée par `_volets.html` `voletAdmin`. Ne jamais y écrire `rel="manifest"` entre guillemets : la construction y reconnaît la page installable |
| rappel au visiteur qui a l'application et lit le navigateur | `_installation.html` § L'application déjà posée sur l'appareil — ce que le rappel peut proposer ici `faconRappel` (« ouvrir » sur Android, « suggerer » sur iOS, où rien ne dit qu'elle est là), `appliInstallee`, démenti du système `verifieApplication`, ouverture `lanceApplication` (`intent://`) ; fenêtre `ouvreRappel` dans ses deux formes et son repli `ouvreRetrouve`, aiguillées par `essaieInvitation` ; délai `RAPPEL_DELAI` ; `related_applications` du manifeste dans `outils/pwa.js`, adressé par `src/index.mjs` `manifeste` |
| icône de l'application | `outils/icones.js` — un dessin, six sorties |
| marque du produit dans une page | `outils/icones.js` `svgPage` (fond nuit) et `svgPageNu` (sans fond), injectées par `genere.js` à la place de `<!--__MARQUE__-->` ; jetons `--m-nuit`, `--m-cyan`, `--m-rose` dans `_styles-jetons.css` |
| bande d'administration — marque, calques, réglages, compte, enregistrement | balisage `_head.html`, styles `_styles-jetons.css` `.bandeAdmin`, garnie par `_mode-admin.html` `activeAdmin`, retirée du public par `retireAdmin` ; gris de l'outil sous `html.mode-admin`, `_styles-plan.css` |
| comptes, profils, salons affectés | `_console-js.html` § Comptes, `supabase/functions/comptes/`, migration `comptes` |
| invitation, mot de passe oublié | `_motdepasse.html` |
| anglais des listes de valeurs (secteurs, nomenclature, champs à choix) | relevé par `sync-evenement` (`Gaia.codificationLangues`, `Eventmaker.listesEnAnglais`), colonne `libelles_en`, servi par `plan-public` sous `anglais`, posé par `_js.html` `indexe` ; intitulé anglais des champs propres `_console-js.html` `renommeChampPerso` |
| anglais d'un champ propre au salon — texte libre, seconde origine | `_partage/champs.ts` `SUFFIXE_EN`, `cibleEn`, versées dans `cibles` ; lecture `_partage/eventmaker.ts` `perso(g, m, suffixe)` et `sync-evenement/` `champsDuSalonEn`, clé `perso_en` du stand ; retrait conjoint `plan-public/` `ampute` ; réglage console `_console-js.html` `lignesPerso` et le second `champOrigine` de `tableauChamps` (styles `_console.css` `.origine-en`) ; fiche `_fiche.html` § les champs que ce salon s'est ajoutés (deux versions marquées `data-lg`), recherche `_recherche.html` `texteAnglaisPerso` |
| version anglaise, bascule FR/EN | moteur `_langue.js`, dictionnaire `outils/anglais/`, contrôle et choix par page `outils/traductions.js`, injection `outils/genere.js` `langue` |
| fermer la version anglaise d'un salon — plan public, administration | `_admin1.html` `langueOfferte`, `appliqueLangue`, `_volets.html` `blocLangues` (onglet « Admin », profil administrateur), réglage `_langues` ; `_langue.js` `offre`, `cleDesLangues` et son cache `plan-langues:` |
| synchronisation Klipso | `supabase/functions/sync-evenement/`, `_partage/gaia.ts`, `champs.ts` |
| fenêtre d'avancement d'une synchronisation, flux retenu en chemin | `_console-js.html` `fenetreAvancement` et `fluxFonction` ; secours qui relit l'avancement à la base `suitAuServeur`, déposé par `sync-evenement/` `garde` et `depose` dans la colonne `sync_avancement`, migration `l_avancement_d_une_synchronisation` |
| API publique du plan, cache | `supabase/functions/plan-public/`, `src/index.mjs` |
| faire écrire un correctif — `@claude …` sous une issue ou une pull request, ou l'onglet « Actions » | `.github/workflows/correctif.yml` ; il édite, valide et laisse la tâche pousser sur `claude/correctif-<run>` puis ouvrir la pull request — aucun outil de poussée ne lui est accordé, et la destination est écrite dans le workflow, jamais choisie par le modèle |
| fraîcheur du plan chez le visiteur — version, entête, publication immédiate | empreinte `_partage/version.ts` `versionDuPlan` (posée en en-tête `X-Version`), entête `src/index.mjs` `entete` (`?entete=1`, clé `ver2:`, gardée un jour), demande `_admin2.html` `demandePlan`, amorce `outils/genere.js` `PRECHARGE` |

## Déploiement

Rien ne se déploie à la main. Une poussée sur `main` applique les migrations et
redéploie les fonctions (`supabase.yml`) ; Cloudflare suit le dépôt de son côté,
construit les pages et déploie le Worker — en production pour `main`, en
version de prévisualisation pour toute autre branche, à l'adresse
`<branche>-plan-interactif.interactiveplan.workers.dev`. Il construit sous Node
22, fixé par `.nvmrc` : son image passe sinon à Node 24 d'elle-même. Toute
poussée lance aussi `pages.yml` (construction, syntaxe, anglais, index) et
`essais.yml` (relecture, types, moteur, navigateur).

Conséquence à garder en tête : **une migration poussée sur `main` part en
production**. Les migrations sont rejouables et jamais réécrites : une
correction est une migration de plus.

## Secrets

Aucune clé dans le dépôt. `.env` est exclu ; les clés serveur vivent dans les
secrets Supabase (`npx supabase secrets set …`). La clé `service_role` et la
clé Klipso ne doivent jamais atteindre une page ni un commit.

Toute nouvelle adresse de déploiement doit être ajoutée à
`ORIGINES_AUTORISEES`, sans quoi les fonctions refusent ses appels. Une
exception : `mesure` accepte toutes les origines — un cadre ou une coque qu'on
n'a pas prévue doit pouvoir compter sans qu'on tienne une liste, et CORS n'y
gardait rien qu'un `curl` n'ignore.

## Tenir au courant pendant le travail

Un long silence ne se lit pas comme du travail en cours, il se lit comme une
panne. Donc, pendant la réflexion comme pendant la construction, un point
d'avancement **toutes les deux minutes environ** : une ou deux phrases disant
ce qui vient d'être fait et ce qui se fait maintenant. Même sans résultat neuf
— « toujours dans la relecture de `_fiche.html`, rien de concluant pour l'instant »
vaut mieux que rien, parce que c'est justement l'information qui manque.

Ces points ne remplacent pas la liste d'étapes, tenue à jour à mesure qu'elles
se terminent : ils s'y ajoutent.

Et **un travail long s'annonce avant d'être lancé** — une construction, une
batterie de tests, une synchronisation, une mesure. Le dire coûte une ligne ;
le laisser découvrir coûte toute l'attente.

## Conventions

Le code, les commentaires et les messages de commit sont en **français
accentué**. Les commentaires expliquent *pourquoi*, pas *quoi* — c'est le ton
en place dans tout le dépôt, gardez-le.
