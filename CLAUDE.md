# Plan interactif — repères de travail

Plans de salon interactifs alimentés par Klipso (API GAIA), avec une console
d'administration multi-événements. Le `README.md` décrit le système et son
déploiement ; ce fichier ne retient que ce qui se paie cher quand on l'ignore.

## La chaîne de fabrication, et son piège

Les pages de `web/` ne sont pas écrites à la main : elles sont **assemblées**
depuis `outils/gabarit/`, puis **versionnées**, car Cloudflare les sert sans
étape de construction.

```
outils/gabarit/*.html → outils/tpl-multi.html → web/*.html
outils/gabarit/_console.css                   → web/console.css
outils/gabarit/_sw.js + outils/pwa.js         → web/sw.js, manifeste, icônes
outils/gabarit/** + supabase/**               → CARTE.md
```

Le piège tient en une phrase : modifier un module de `outils/gabarit/` sans
reconstruire laisse un dépôt d'apparence juste, et des visiteurs qui reçoivent
l'ancienne page. Donc, après toute retouche du gabarit :

```bash
npm run construire   # reconstruit web/
npm run verifie      # reconstruit, et sort en erreur si web/ était en retard
```

Les pages reconstruites font partie du commit. Le workflow `Pages` rattrape
l'oubli — il reconstruit et valide sur la branche poussée — mais ne comptez pas
dessus : il ajoute alors un commit par-dessus le vôtre, que vous devrez tirer
avant de pousser à nouveau. Lancez `npm run verifie` avant de valider.

## Ne jamais modifier directement

- `web/*.html`, `web/console.css`, `web/config.js`, `web/sw.js`,
  `web/manifeste.webmanifest`, `web/icone*` — sortie de la construction ;
  éditez `outils/gabarit/`, `outils/pwa.js` ou `outils/icones.js`.
- `outils/tpl-multi.html` — intermédiaire, régénéré par `assemble.js`.
- `CARTE.md` — index relu dans les sources par `carte.js`. Pour le corriger,
  corrigez ce qu'il décrit : un bandeau de section, un nom de fonction.

## Plusieurs sessions en parallèle

Deux conversations ouvertes sur le même dépôt se heurtaient à deux endroits.
Les deux sont désamorcés, chacun avec un geste qui l'accompagne.

**Les fichiers fabriqués ne se fusionnent plus.** `.gitattributes` marque
`web/**`, `outils/tpl-multi.html` et `CARTE.md` en `merge=ours` : git garde la
version en place au lieu de mélanger deux reconstructions — une ligne de gabarit
en réécrivait mille, recopiées quatre fois, et le conflit portait sur du contenu
que personne n'avait tapé. Le geste qui va avec n'est pas optionnel : **après
toute fusion ou rebasage, `npm run construire`**, sans quoi `web/` ne reflète
qu'une des deux branches. `npm run verifie` le signale, le workflow `Pages` le
rattrape — un commit plus tard, à retirer avant la poussée suivante.

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

**Jamais de poussée forcée.** Le workflow `Pages` commite sur la branche poussée
quand `web/` était en retard : le clone local se retrouve derrière sans l'avoir
vu, et un `--force` efface alors le travail d'à côté. `git pull --rebase`, et
`npm run verifie` avant de valider pour que le robot n'ait rien à ajouter.

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
| `web/` | les pages construites, servies par Cloudflare |
| `supabase/migrations/` | schéma de la base — horodatées, rejouables |
| `supabase/functions/` | synchronisation Klipso et API publique |
| `src/index.mjs` | Worker Cloudflare : relais et cache de `/api/plan` |
| `.github/workflows/` | reconstruction des pages, déploiement Supabase |
| `outils/anglais/` | le dictionnaire anglais, un fichier par module |

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
- **Deux modules dépassent 1300 lignes.** On y entre par tranche
  (`sed -n '531,700p'`), jamais en entier : `CARTE.md` donne la tranche.

### Ce qu'on veut toucher, et où

| intention | où |
|---|---|
| recherche, index des exposants, liste | `_js.html` § 1 et 5 |
| sortes d'éléments que la recherche remonte | `_admin1.html` `voletRecherche`, porte dans `_js.html` `visible` ; repères cherchables dans `_dessin.html` |
| rendu du plan, libellés, zoom, sélection, fiche | `_js.html` § 3, 4, 6, 7, 8 |
| logo en tête de fiche, marges retirées, place à côté du nom ou sous le numéro | `_js.html` `poseMarque`, `recadreMarque`, `rangeMarque` |
| dessin WebGL du plan (rendu par défaut, `?rendu=svg` pour l'écarter) | `_webgl.html` — il relit le SVG caché : un effet visuel ajouté au plan en CSS (animation, filtre) doit y être rejoué, sans quoi il ne se voit qu'en SVG ; bibliothèque dans `web/bibliotheques/` |
| ce que la fiche montre, ordre des champs, sections, intitulés | réglage `_admin1.html` `voletOrdre` (réserve à gauche, fiche au milieu, aperçu à droite) ; rendu `_js.html` `corpsRange`, `champCorps`, `montreIntitule` ; migrations `groupes_de_champs`, `intitules_des_champs` |
| tiroirs de la liste et de la fiche sur écran étroit | `_js.html` § Le tiroir de la liste, § Le tiroir de la fiche ; crans et prise dans `_head.html` `.side`, `.detail`, `.poignee` |
| couleurs, visibilité et réglages des calques | `_admin1.html` |
| lenteur d'un nuancier, couleur qui traîne derrière la souris | `_admin1.html` § La rafale du sélecteur de couleur, `suitNuancier` ; peintures ciblées `_dessin.html` `peintCalque`, `_js.html` `peintSecteur` |
| police des noms sur le plan, celle d'un modèle ou une autre de la liste | `_admin1.html` `POLICES_LIBELLE`, `POLICES_NOMS` (relue par `npm run polices`) et ses genres `GENRES_POLICE`, `posePoliceLibelles` ; vignettes et filtres dans `voletApparence` ; clé `_fiche.police` |
| fiche d'une zone, salles de conférence qu'elle abrite | `_admin1.html` `champsZone`, `champSalles` ; colonne `salles` ; libellé et description anglais `nom_en`, `description_en` dans `zones_fiches`, affichés par `_js.html` `nomDeLaZone` |
| démarrage de la page, appel API, panne réseau | `_admin2.html` |
| tracé des calques de dessin | `_dessin.html` |
| halls d'un lieu connu (OSM), calage en deux coins, mention de la source | `_batiments.html` ; bibliothèque `outils/lieux.js` → `outils/lieux.json`, versée par `genere.js` dans `plan-admin.html` seul |
| image posée sur le plan et liée à un exposant — clic sur le logo, fiche de l'enseigne | `_dessin.html` `lienImageSaisi`, `formeImage`, `traceImage`, `ditImagePosee` ; champ `#imageSoc` de la boîte à outils ; rattachement après coup `_edition.html` `appliqueSociete` (champ `#elemSoc`, partagé avec le stand dessiné) ; sortes concernées `FORMES_RATTACHEES` ; canal de mesure `image` par `_js.html` `canalPlan` |
| verrouiller un calque de dessin | `_dessin.html` § Le verrou d'un calque, cadenas posé par `_pile.html` `boutonVerrou` |
| déplacer, redimensionner une forme existante | `_edition.html` |
| cote, aimants, grille des stands, taille exacte, duplication | `_aimants.html` |
| ordre des calques, pile, couleur du fond du plan | `_pile.html` |
| fond de carte sous le pavillon, calage du plan sur la Terre | `_environs.html` ; groupe `#fondCarte` posé par `_js.html` `appliqueVue`, limite de recul `recul` ; migration `calage_du_plan_sur_la_terre` |
| placer et tourner la carte à la main | `_environs.html` § Placer à la main, branché dans la chaîne des gestes de `_js.html` |
| rendu vectoriel du fond, libellés droits sur un plan tourné | `_environs.html` § Le rendu vectoriel — MapLibre chargé à la demande, toile `#fondCarteGL` |
| vider le hall sous la carte | `_environs.html` § Le trou sous le pavillon — contour gelé par `retientLeHall`, aplat `#trouDuFond`, bouton par calque posé par `_pile.html` |
| enregistrer la configuration pour tous | `_pousse.html` |
| parcours de visite | `_parcours.html` |
| ajouter d'un coup tout ce que la recherche retient | `_parcours.html` § Tout ce que la recherche a retenu, bouton posé au pied du panneau par `_js.html` `ouvreCriteres` |
| rappel avant une conférence retenue — notification, délai, abonnement | `_rappels.html` ; interrupteur posé dans le tiroir par `_parcours.html` `remplitParcours`, réglage `_admin1.html` `blocRappel` ; réception `_sw.js` § Les rappels de conférence ; relais `src/index.mjs` `rappels` (`/api/rappels`), serveur `supabase/functions/rappels/`, chiffrement `_partage/push.ts`, migration `rappel_avant_une_conference` (tâche `pg_cron` à la minute) ; secrets `VAPID_*` |
| suggestion d'un exposant de plus, onglet « Suggestion » | `_suggestion.html` ; canal de mesure `suggestion`, migration `canal_de_mesure` |
| itinéraire d'un point du salon à un autre | `_itineraire.html` |
| mode borne interactive — `?borne`, position de l'écran, remise à zéro | `_borne.html` ; départ figé dans `_itineraire.html` `pointBorne`, marqueur posé par `_js.html` `montePlan` |
| code QR « Vous êtes ici » — affiche du hall, plan localisé, désactivation | `_ici.html` (`?ici=`) ; départ imposé partagé avec la borne par `_borne.html` `poseDepartImpose`, tracé du damier `_partage.html` `qrChemin` ; visée `ici` dans `_itineraire.html` `bandeauVisee`, `visePoint` et la chaîne des appuis de `_js.html` ; bouton posé par `_admin1.html` `activeAdmin` ; rappel `_head.html` `.iciRappel`, affiche imprimée `#afficheQr` |
| ordre de visite, conférences, horaires | `_journee.html` |
| visite guidée du premier démarrage | `_tutoriel.html` (chapitres `CHAPITRES_TUTO`), proposée par `_admin2.html` `demarre` ; case et « Essayer » dans `_admin1.html` `voletPlan` ; styles `_head.html` § La visite guidée ; anglais `outils/anglais/_tutoriel.js` |
| options vendues à part — dessin des stands, images sur un stand, journée organisée, programme de conférences, recommandation sponsorisée | `_admin1.html` `OPTIONS`, `optionActive`, `blocOptions` (onglet « Admin », profil administrateur) ; ce qui se ferme par la feuille de style sous `html.sans-dessin-stand`, `sans-image-stand`, `sans-journee` dans `_head.html` ; le programme se refait par `_js.html` `indexeConferences` (clé `_options`) |
| logo au démarrage, le temps du chargement — rien, la marque, un sponsor | `_sponsor.html` (`MODES_SPONSOR`, `modeSponsor`) — posé au premier trait d'après le cache `plan-sponsor:<slug>`, corrigé par `accueilleSponsor` dans `_admin2.html` `demarre`, rendu par `suitSponsor` ; réglage `_sponsor` et bloc `blocSponsor` (`CHOIX_SPONSOR`) au bas de `_admin1.html` `voletAdmin`, donc réservé au profil administrateur ; marque du produit par `MARQUE_SPONSOR`, posée par `genere.js` à la place de `<!--__MARQUE__-->` ; styles `_head.html` § Le générique du sponsor et § Le générique du démarrage ; rejoué par `_borne.html` `reposeLaBorne` ; `resteSponsor` fait attendre `_tutoriel.html` et `_installation.html` |
| comptage d'usage | `_mesure.html`, `supabase/functions/mesure/`, migration `compteurs` |
| mesure sans bandeau : notice « Confidentialité », refus, vie du jeton, purge | `_mesure.html` § La notice, et le refus, `MESURE_VIE_MOIS` ; lien `_head.html` `#btnConfidentialite` ; `purge_presences` chaque nuit, migration `conservation_des_jetons` ; README « Sans bandeau de consentement » |
| polices des pages | modèles en tête de `outils/polices.js`, polices au choix relues dans `_admin1.html` `POLICES_NOMS` ; puis `npm run polices` → `web/polices/` ; déclarées par `genere.js` `feuillePolices` à la place de `<!--__POLICES__-->`, les polices au choix chargées par `feuillePolice` |
| porte d'accès au plan — navigateur, cadre, écran d'accueil, application | `_mesure.html` `supportMesure` ; rendu `_rapport-js.html` `portes` ; migration `support_d_acces_au_plan` |
| visiteurs uniques par stand, par canal, par geste | table `visiteur_cible` et fn `audience_cibles` (clés `v_…`), migration `les_visiteurs_uniques_par_stand` ; colonnes `_export.html` `COL_TETE_V`, `COL_PIED_V` ; cartouche `_chaleur.html` `phraseChaleur` |
| carte de chaleur du plan | `_chaleur.html`, migration `audience` |
| remise à zéro des compteurs | `_chaleur.html` § Remise à zéro, `_admin1.html` `ouvreReglages`, migration `remise_a_zero` |
| styles et structure de l'écran du plan | `_head.html` (CSS l. 8-1034, balisage l. 1035+) |
| console multi-événements | `_console-js.html`, socle `_console-base.html` |
| icône d'onglet des pages du plan | `_console-js.html` `champFavicon`, posée par `_js.html` `poseFavicon`, migration `icone_d_onglet_du_salon` |
| rapport d'utilisation | `_rapport-js.html`, styles `_console.css` |
| export tableur des exposants | `_export.html` (console **et** rapport), écriture `.xlsx` dans `_classeur.html` — mêmes chiffres que la carte de chaleur, par `audience_cibles` |
| accès administrateur d'un plan | `_auth-plan.html` |
| consultation hors ligne, ce que le navigateur garde | `_sw.js`, page de secours `_hors-ligne.html` |
| installation, manifeste, couleur de la barre du système | `outils/pwa.js` — `TETE` pour toutes les pages, `application()` pour le seul plan public ; nom et adresse de départ par salon dans `src/index.mjs` `manifeste`, `nomDuSalon` (`MARQUE`), qui les tient de `plan-public?slug=…&nom=1` ; nom sur l'écran d'accueil d'iOS par `_installation.html` `nommeApplication` |
| quelle page est installable | `outils/genere.js`, option `application` de `page()` — `plan.html` et rien d'autre |
| fenêtre qui invite le visiteur à installer le plan | `_installation.html` — moment `essaieInvitation` (lancé par `_admin2.html` `demarre`), façon par navigateur `faconInstallation`, confirmation après installation `ouvreInstalle` ; case `caseInstallation`, posée par `_admin1.html` `voletPlan`. Ne jamais y écrire `rel="manifest"` entre guillemets : la construction y reconnaît la page installable |
| icône de l'application | `outils/icones.js` — un dessin, six sorties |
| marque du produit dans une page | `outils/icones.js` `svgPage` (fond nuit) et `svgPageNu` (sans fond), injectées par `genere.js` à la place de `<!--__MARQUE__-->` ; jetons `--m-nuit`, `--m-cyan`, `--m-rose` dans `_head.html` |
| bande d'administration — marque, calques, réglages, compte, enregistrement | `_head.html` `.bandeAdmin`, garnie par `_admin1.html` `activeAdmin`, retirée du public par `retireAdmin` ; gris de l'outil sous `html.mode-admin` |
| comptes, profils, salons affectés | `_console-js.html` § Comptes, `supabase/functions/comptes/`, migration `comptes` |
| invitation, mot de passe oublié | `_motdepasse.html` |
| anglais des listes de valeurs (secteurs, nomenclature, champs à choix) | relevé par `sync-evenement` (`Gaia.codificationLangues`, `Eventmaker.listesEnAnglais`), colonne `libelles_en`, servi par `plan-public` sous `anglais`, posé par `_js.html` `indexe` ; intitulé anglais des champs propres `_console-js.html` `renommeChampPerso` |
| version anglaise, bascule FR/EN | moteur `_langue.js`, dictionnaire `outils/anglais/`, contrôle et choix par page `outils/traductions.js`, injection `outils/genere.js` `langue` |
| synchronisation Klipso | `supabase/functions/sync-evenement/`, `_partage/gaia.ts`, `champs.ts` |
| API publique du plan, cache | `supabase/functions/plan-public/`, `src/index.mjs` |
| fraîcheur du plan chez le visiteur — version, entête, publication immédiate | empreinte `_partage/version.ts` `versionDuPlan` (posée en en-tête `X-Version`), entête `src/index.mjs` `entete` (`?entete=1`, clé `ver1:`), demande `_admin2.html` `demandePlan`, amorce `outils/genere.js` `PRECHARGE` |

## Déploiement

Rien ne se déploie à la main. Une poussée sur `main` applique les migrations et
redéploie les fonctions (`supabase.yml`) ; Cloudflare suit le dépôt de son côté
pour `web/` et le Worker. Toute poussée, sur n'importe quelle branche,
reconstruit les pages (`pages.yml`).

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

## Conventions

Le code, les commentaires et les messages de commit sont en **français
accentué**. Les commentaires expliquent *pourquoi*, pas *quoi* — c'est le ton
en place dans tout le dépôt, gardez-le.
