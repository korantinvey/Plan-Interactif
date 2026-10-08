<!-- Produit par `node outils/carte.js` (via `npm run construire`).
     Ne pas modifier à la main : la prochaine construction l'écrase. -->

# Carte des sources

Index des sources, relu dans les fichiers à chaque construction. Il sert à
ouvrir la bonne portion du bon fichier plutôt que le dépôt entier.

Rappel : `web/` est **fabriqué** depuis `outils/gabarit/`, et n'est donc pas
l'endroit où l'on corrige quoi que ce soit.

## `outils/gabarit/` — la source des pages

### `_admin1.html` — 1533 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 9. Apparence des calques

Fonctions :

`salonRange` 17 · `cleConf` 19 · `ouvreConf` 23 · `reglagesDuSalon` 42 · `conf` 63
`jeton` 64 · `sousCle` 65 · `styleFond` 67 · `sousCalques` 88 · `styleDataGroupe` 110
`appliqueCouleursData` 119 · `styleData` 151 · `appliqueApparence` 157
`appliqueCommandes` 222 · `optionActive` 332 · `programmeOffert` 337
`suggestionOfferte` 338 · `appliqueOptions` 340 · `langueOfferte` 364 · `appliqueLangue` 366
`catalogueTenu` 371 · `chercheSorte` 441 · `voletRecherche` 444 · `blocOrdreCriteres` 505
`minutesVisite` 676 · `seuilGere` 740 · `seuilImpose` 741 · `seuilParSurface` 742
`regleSeuil` 747 · `aireDuStand` 765 · `seuilConcentration` 801 · `phraseSeuil` 824
`lueHeure` 869 · `lueDate` 873 · `datesSalon` 880 · `horairesSalon` 894
`presseNuanciers` 933 · `suitNuancier` 949 · `trio` 977 · `melange` 987
`appliqueAccent` 1001 · `appliqueFond` 1035 · `modeDist` 1082 · `couleurDist` 1094
`appliqueDists` 1116 · `modeBarre` 1146 · `appliqueBarre` 1148 · `modeleRetenu` 1188
`policeChoisie` 1344 · `policeDuModele` 1349 · `feuillePolice` 1359 · `chargePolice` 1381
`policePrete` 1401 · `policeDesNoms` 1419 · `posePoliceLibelles` 1448
`appliqueModele` 1480 · `habilleModale` 1524

### `_admin2.html` — 271 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 12. Démarrage

Fonctions :

`demarre` 8 · `annonce` 67 · `entetesApi` 90 · `chargeFond` 113 · `panneDuChargement` 160
`CLE_VERSION` 170 · `versionRetenue` 171 · `retientVersion` 174 · `demandePlan` 198
`charge` 222

### `_aimants.html` — 488 l. → plan-admin.html

- l.3 · 11 quater. Dessiner juste — cote, aimants, répétition

Fonctions :

`ecritMetres` 16 · `coteCadre` 20 · `montreCote` 32 · `aimantsActifs` 60 · `axesDe` 64
`pointsAimants` 69 · `oublieAimantsDuPlan` 89 · `aimantsDuPlan` 91 · `pasAimant` 124
`cale` 132 · `sousLeGeste` 137 · `cranGrille` 148 · `oublieAimants` 165
`aimantsDessines` 167 · `coinsGeste` 193 · `montreAimants` 215 · `meilleurSommet` 280
`croixAimant` 294 · `correction` 318 · `aimante` 359 · `retientTaille` 373
`reprendTaille` 387 · `dupliqueForme` 408 · `pousseForme` 433 · `ecritDimensions` 450
`appliqueDimension` 469

### `_application.html` — 457 l. → plan-admin.html

- l.1 · 19. L'application installée — son icône et son nom

Fonctions :

`fondPourIconeApp` 93 · `dessineIconeApp` 125 · `reduitIconeApp` 152 · `adresseIconeApp` 187
`appDuSalon` 195 · `iconeDeLApplication` 198 · `nomAppDefaut` 209 · `ecritApplication` 224
`blocApplication` 265

### `_auth-plan.html` — 204 l. → plan-admin.html

- l.2 · Accès à l'administration du plan

Fonctions :

`litLocal` 10 · `configuration` 15 · `normaliseUrlA` 19 · `sessionValide` 35
`ecranAcces` 45 · `contenuDuJeton` 131 · `mailDuJeton` 138 · `litProfilA` 149
`initialesDe` 162 · `poseCompte` 169

Éléments :

`#accesMsg` · `#aUrl` · `#aCle` · `#aMail` · `#aMdp` · `#aPublic` · `#aOubli` · `#aOk`

### `_batiments.html` — 560 l. → plan-admin.html

- l.2 · 11 quinquies. Bâtiments de la bibliothèque

Fonctions :

`CLE_CALAGE` 27 · `bibliothequeDispo` 28 · `refBatiment` 45 · `refForme` 49
`marqueBatiment` 52 · `batimentsPoses` 55 · `estBatiment` 62 · `hallsPoses` 65
`lieuDuCalque` 71 · `poseCalage` 77 · `ouvreBibliotheque` 86 · `vueDuLieu` 182
`lanceCalage` 222 · `effaceLeTempsDuCalage` 250 · `cadreCalage` 269 · `finCalage` 282
`pivoteCalage` 293 · `degresCalage` 309 · `dessineCalage` 314 · `calagePointerDown` 337
`calagePointerMove` 350 · `calagePointerUp` 366 · `reposeBatiment` 379
`ajouteBatiments` 395 · `boutonRecale` 479 · `pictoRecale` 488 · `calageRelu` 505
`rouvreCalage` 531 · `mentionOsm` 555

### `_borne.html` — 370 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 quinquies. La borne interactive — un plan qui sait où il est

Fonctions :

`pointBorne` 62 · `borneRetenue` 70 · `retientBorne` 76 · `oublieBorne` 79 · `lieuBorne` 98
`lieuNomme` 117 · `pointLibre` 122 · `poseDepartImpose` 135 · `poseLaBorne` 146
`remetLeDepart` 165 · `poseBorneIci` 179 · `armeLaPose` 188 · `montreBandeauBorne` 204
`ecritDepartBorne` 218 · `rayonBorne` 231 · `dessineBorne` 236 · `rafraichitBorne` 252
`rempliBorne` 257 · `relanceRepos` 286 · `reposeLaBorne` 293 · `demarreBorne` 329

### `_chaleur.html` — 638 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 14. Les compteurs d'usage, vus du plan — carte de chaleur, remise à zéro
- l.435 · Remise à zéro des compteurs

Fonctions :

`nbChal` 32 · `tonChaleur` 51 · `niveauChaleur` 73 · `valeurChaleur` 76 · `chargeChaleur` 89
`coloreChaleur` 135 · `cartoucheChaleur` 170 · `mesureCartoucheChaleur` 234
`replieChaleur` 240 · `ecritEtatChaleur` 251 · `dessineEchelleChaleur` 259
`dessineTopChaleur` 279 · `phraseChaleur` 321 · `rafraichitChaleur` 346
`montreChaleur` 380 · `rangChaleur` 416 · `aplati` 457 · `voletMesure` 462
`evenementCourant` 488 · `ouvreRemiseAZero` 507 · `lanceRemiseAZero` 599

Éléments :

`#chalReduit` · `#chalPer` · `#chalEch` · `#chalEtat` · `#chalTop`

### `_classeur.html` — 234 l. → admin-plans.html, rapport.html

- l.2 · Classeur — écrire un vrai fichier Excel, sans bibliothèque

Fonctions :

`CRC_TABLE` 29 · `crc32` 39 · `archiveZip` 54 · `texteXml` 110 · `colonneXl` 113
`XL_PARTS` 124 · `feuilleXl` 178 · `classeurXl` 214 · `enregistreFichier` 225

### `_config.js` — 15 l. → config.js

### `_console-base.html` — 477 l. → admin-plans.html, rapport.html

- l.10 · Socle commun de la console et du rapport — accès au projet

Fonctions :

`$` 21 · `esc` 22 · `entetes` 43 · `contenuJeton` 52 · `resteJeton` 62 · `renouvelle` 72
`appel` 106 · `rest` 117 · `verseModale` 147 · `ouvreModale` 153 · `verrouilleModale` 176
`fermeModale` 178 · `gardeLaPlace` 201 · `demande` 206 · `confirme` 228 · `ecranConfig` 239
`ecranConnexion` 267 · `deconnecte` 330 · `signale` 341 · `bloc` 362 · `grille` 380
`idCompte` 423 · `themeSombre` 433 · `initialesDe` 453

Éléments :

`#modale` · `#mTitre` · `#mFermer` · `#mCorps` · `#mPied`

### `_console-head.html` — 78 l. → admin-plans.html

Éléments :

`#choixEvt` · `#etatEvt` · `#btnRecharger` · `#btnNouveau` · `#statut` · `#lienPublic`
`#lienAdmin` · `#lienBorne` · `#lienRapport` · `#btnExcel` · `#btnSources` · `#btnEtat`
`#btnDupliquer` · `#btnSupprimer` · `#sepActions` · `#btnComptes` · `#btnProjet`
`#btnExport` · `#btnLangue` · `#btnCompte` · `#initiales` · `#compteMail` · `#btnTheme`
`#btnSortir` · `#fiche`

### `_console-js.html` — 3374 l. → admin-plans.html

- l.959 · Provenance des données
- l.1096 · Contenu de la fiche détail

Fonctions :

`refus` 18 · `fluxFonction` 37 · `fenetreAvancement` 127 · `fonction` 424 · `slugifie` 438
`courant` 442 · `charge` 444 · `chargePlans` 459 · `majEvenement` 464 · `selonAdresse` 484
`majAdresse` 492 · `majBarre` 507 · `dessineChoix` 549 · `champ` 569 · `reduitIcone` 623
`champFavicon` 664 · `fuseauConnu` 760 · `champFuseau` 772 · `dessineFiche` 835
`fournisseurUtilise` 1021 · `sourceNom` 1031 · `source` 1035 · `champCle` 1040
`ligneSource` 1075 · `paraitSurFiche` 1233 · `origineConferences` 1239
`origineProduits` 1246 · `resumeProvenance` 1311 · `resumeFiche` 1332 · `caseFiche` 1377
`cibleEn` 1425 · `champsPersos` 1427 · `criteres` 1433 · `ecritFiche` 1436
`caseCritere` 1451 · `clePerso` 1470 · `ajouteChampPerso` 1478 · `renommeChampPerso` 1496
`retireChampPerso` 1544 · `lignesPerso` 1605 · `ligneOutil` 1626 · `ligneReglage` 1642
`ouvreProvenance` 1654 · `ouvreSources` 1677 · `cadreFiche` 1729 · `ouvreFiche` 1759
`cadreCategories` 1899 · `sousTitre` 1978 · `tableauChamps` 1993 · `encode` 2219
`decode` 2221 · `correspondance` 2226 · `sansPrefixe` 2229 · `courte` 2230 · `intitule` 2245
`intituleSuite` 2257 · `separeValeurs` 2271 · `aplani` 2292 · `memeStyle` 2302
`autreFace` 2320 · `champOrigine` 2336 · `majLiens` 2604 · `majIntegration` 2641
`majMsgSync` 2648 · `etapesPressenties` 2678 · `suitAuServeur` 2728 · `synchronise` 2770
`fabriqueLesVignettes` 2867 · `envoieVignettes` 2920 · `dupliquer` 2929
`litMonProfil` 3029 · `RETOUR_MDP` 3040 · `litComptes` 3042 · `ligneMessage` 3051
`casesSalons` 3061 · `ouvreComptes` 3091 · `ouvreFicheCompte` 3183 · `videEcran` 3342
`dessine` 3347 · `demarre` 3362

Éléments :

`#fuseaux` · `#msgSync` · `#fragment` · `#btnCopier`

### `_console.css` — 725 l. → console.css

- l.666 · Page de rapport

### `_dessin.html` — 2558 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11. Calques de dessin

Fonctions :

`enAttente` 42 · `litRange` 69 · `ouvreDessins` 81 · `reprendCommun` 106
`notePubliees` 132 · `rangeDessins` 150 · `dejaPubliee` 155 · `marqueAttente` 161
`mesCalques` 169 · `enregistreDessins` 171 · `instantane` 215 · `clotSalve` 226
`memorise` 227 · `restaure` 238 · `annule` 254 · `refais` 266 · `trouveCalque` 269
`nouvelId` 270 · `cheminArrondi` 288 · `estCadre` 331 · `cheminForme` 333 · `styleTrait` 353
`longueurFleche` 379 · `cheminFleche` 393 · `marqueFleche` 422 · `rafraichitFleches` 433
`poseTrait` 450 · `traceForme` 461 · `rotationTexte` 480 · `dessineDessins` 485
`redessineForme` 526 · `peintCalque` 550 · `versPlan` 556 · `apercu` 562 · `apercuGuide` 574
`toleranceTrace` 599 · `aimanteContour` 604 · `rayonContour` 607 · `redresseTrace` 626
`traceGuide` 660 · `fermeIci` 667 · `ajouteForme` 674 · `pictoDe` 802
`nomTypeRepereFr` 858 · `nomTypeRepere` 860 · `typeZone` 890 · `pictoForme` 897
`estPorte` 917 · `ouvreEntrant` 918 · `ouvreSortant` 919 · `modeDit` 959 · `lettreMode` 960
`estTransport` 964 · `modeTransport` 967 · `glypheRepere` 979 · `cleLigne` 1016
`ligneAffichee` 1027 · `couleurLigne` 1035 · `couleurRepere` 1041 · `encreRepere` 1047
`nomLigneFr` 1061 · `libelleDoffice` 1069 · `couleurEcrite` 1076 · `traceRepere` 1095
`nomSurLePlan` 1229 · `etiquetteSociete` 1240 · `seRattache` 1268 · `societeDeForme` 1280
`societesDuPlan` 1292 · `poseChampImage` 1314 · `remplitListeSocietes` 1321
`societeSaisie` 1329 · `traceImage` 1357 · `traceStandDessine` 1382
`texteStandDessine` 1406 · `poseLibellesDessines` 1424 · `decoupeStand` 1445
`marqueStandsDessines` 1460 · `rafraichitStandsDessines` 1475 · `oublieReperes` 1505
`reperesCherchables` 1507 · `vaAuRepere` 1551 · `clePoi` 1594 · `pastillePoi` 1603
`cartouchePoi` 1607 · `ouvrePoi` 1726 · `mesureCartouche` 1799 · `pharePoi` 1815
`phareRepere` 1819 · `phareZone` 1821 · `eclairePoi` 1827 · `oublieChoixPoi` 1860
`signale` 1869 · `calquePourImage` 1884 · `lienImageSaisi` 1912 · `formeImage` 1924
`poseImage` 1933 · `ditImagePosee` 1955 · `importeImage` 1963 · `dessinPointerDown` 2014
`dessinPointerMove` 2099 · `dessinPointerUp` 2137 · `termineTrace` 2178 · `aide` 2190
`outilOffert` 2220 · `choisitOutil` 2223 · `enchaineStand` 2254 · `optionsModes` 2284
`proposeCouleurLigne` 2295 · `montreTransport` 2306 · `activeCalque` 2372 · `cleVerrou` 2430
`verrouille` 2431 · `basculeVerrou` 2433 · `pictoVerrou` 2450 · `montreRoleIti` 2484
`creeCalque` 2515 · `demandeNom` 2528 · `renommeCalque` 2547

Éléments :

`#dPaneInfos` · `#dGo` · `#dItin`

### `_edition.html` — 652 l. → plan-admin.html

- l.2 · Édition des formes existantes

Fonctions :

`formeParId` 11 · `boite` 19 · `curseurPoignee` 28 · `poignees` 33 · `dessinePoignees` 42
`cadreTexte` 77 · `poigneeRotation` 97 · `angleBorne` 107 · `choisitForme` 109
`majElement` 120 · `candidatsLiaison` 241 · `ecritDesDeuxCotes` 263 · `changeLien` 275
`changeDureeLien` 291 · `majLiens` 308 · `appliqueSociete` 360 · `appliqueTexte` 376
`appliqueRotation` 388 · `appliqueRayon` 402 · `appliqueTrait` 415 · `appliqueTransport` 443
`appliquePicto` 466 · `supprimeForme` 492 · `editionPointerDown` 502
`editionPointerMove` 562 · `tourneTexte` 625 · `editionPointerUp` 641

### `_entete.html` — 6 l.

### `_environs.html` — 1648 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 16. Les environs — le pavillon dans son quartier

Fonctions :

`metresParDegre` 43 · `tourneEnvirons` 60 · `versTerre` 66 · `versLePlan` 73 · `reancre` 88
`emprisePavillon` 114 · `centrePavillon` 129 · `styleSobre` 206 · `forceCarte` 300
`calagePose` 318 · `calageCourant` 330 · `fondCourant` 333 · `recul` 338
`pixelsMercator` 343 · `latitudeDePixel` 352 · `echelleDesTuiles` 372
`niveauDesTuiles` 384 · `adresseTuile` 391 · `tuilesDeLaVue` 401 · `chargeMapLibre` 466
`vueGL` 497 · `styleDuFond` 517 · `guetteLaCarte` 545 · `poseCarteGL` 556
`diagnostiqueGL` 642 · `relanceCarteGL` 662 · `videCarteGL` 674 · `dessineFondCarte` 699
`cleMasqueCarte` 803 · `masqueCarte` 804 · `basculeMasqueCarte` 806
`boutonMasqueCarte` 817 · `pictoMasque` 828 · `formesMasquantes` 840 · `contourDuHall` 862
`cheminDuHall` 869 · `poseMasqueCarte` 887 · `carreDeTerrain` 921 · `chercheBatiments` 937
`aireDuContour` 964 · `centreDuContour` 973 · `axeDuContour` 986 · `empriseDesObjets` 1003
`batimentsCandidats` 1021 · `caleSurBatiment` 1042 · `retientLeHall` 1068
`manqueCalage` 1090 · `enregistreCalage` 1099 · `calageEnregistre` 1116
`oublieCalageEnCours` 1137 · `litCoordonnees` 1149 · `rafraichitCarte` 1163
`armeCalage` 1205 · `pivotCalage` 1216 · `glisseCarte` 1220 · `cartePointerDown` 1227
`cartePointerMove` 1241 · `cartePointerUp` 1260 · `ditCalage` 1268 · `ditCarte` 1277
`majCalage` 1285 · `appliqueCalage` 1307 · `tourneCalage` 1314 · `construitCalage` 1320
`ouvreCalage` 1485 · `fermeCalage` 1496 · `voletEnvirons` 1524

### `_export.html` — 215 l. → admin-plans.html, rapport.html

- l.2 · Export par exposant — une ligne par stand, une colonne par provenance

Fonctions :

`nb` 22 · `colonnesExport` 106 · `libellePeriode` 138 · `nomFichierExport` 144
`nomFeuilleExport` 154 · `exporteExposants` 170

### `_fiche.html` — 1550 l. → plan-admin.html, plan-smcl.html, plan.html

- l.3 · 7. Sélection et fiche

Fonctions :

`ETROIT` 9 · `anime` 25 · `noeud` 49 · `canalPlan` 59 · `rangSociete` 67 · `select` 76
`centre` 101 · `brancheActesFiche` 112 · `centreEtBaisseLaFiche` 128 · `centrePoint` 146
`montre` 191 · `libelleCorps` 223 · `ordreCorps` 240 · `groupesFiche` 272
`montreIntitule` 285 · `valeurCorps` 305 · `champCorps` 318 · `groupeCorps` 330
`corpsRange` 343 · `momentLocal` 378 · `programme` 401 · `produits` 450 · `ficheProduit` 478
`jourLong` 544 · `ficheConf` 555 · `lien` 702 · `adresseWeb` 710 · `pictoRS` 753
`adresseSure` 771 · `adresseVignette` 802 · `adresseImage` 820 · `imageSure` 833
`assainitRiche` 862 · `enBlocs` 910 · `rangeRiche` 923 · `ecarteClicFantome` 951
`nomSociete` 960 · `societes` 973 · `choisitExposant` 984 · `poseMarque` 1022
`montreMarque` 1082 · `poseCode` 1105 · `rangeMarque` 1146 · `ouvre` 1209 · `ferme` 1521
`onglet` 1539

Éléments :

`#dGo` · `#dItin`

### `_geometrie.html` — 1070 l. → plan-admin.html

- l.2 · 11 octies. Reprendre à la main la géométrie d'un emplacement

Fonctions :

`cleGeo` 30 · `arrondiGeo` 38 · `empreinteGeo` 49 · `anneauxGeo` 69 · `traceGeo` 82
`boiteAnneaux` 86 · `dansAnneau` 104 · `distSegmentGeo` 115 · `distBordGeo` 124
`poleGeo` 134 · `porteeGeo` 153 · `boiteGeo` 161 · `geometrieSource` 186
`reposeSource` 195 · `poseGeometrie` 204 · `retoucheGeo` 218 · `elargitEmprise` 231
`appliqueGeometries` 252 · `cleVerrouGeo` 282 · `geoVerrouille` 283 · `basculeVerrouGeo` 285
`boutonVerrouGeo` 300 · `modeGeometrie` 311 · `objetGeoSous` 338 · `groupeGeo` 348
`choisitGeo` 356 · `cadreGeo` 371 · `prisesGeo` 391 · `curseurGeo` 403
`dessinePoigneesGeo` 406 · `ecritDimensionsGeo` 434 · `nomSorteGeo` 446
`majPaletteGeo` 448 · `finGesteGeo` 487 · `enregistreGeo` 505 · `geometrieOrigine` 519
`retraceGeo` 534 · `pousseGeometrie` 545 · `appliqueDimensionGeo` 562 · `cleAjout` 601
`anneauxValides` 615 · `rechAjout` 620 · `objetAjoute` 629 · `poseLien` 648
`appliqueAjouts` 675 · `enregistreAjout` 711 · `ajouteEmplacement` 726 · `renommeAjout` 754
`lieAjout` 786 · `ecritInfosAjout` 815 · `supprimeAjout` 842 · `choisitOutilGeo` 871
`aideAjout` 878 · `fermeAjout` 888 · `ajoutPointerDown` 897 · `ajoutPointerMove` 913
`ajoutPointerUp` 935 · `geometriePointerDown` 955 · `accrocheGeo` 986
`geometriePointerMove` 988 · `geometriePointerUp` 1039

### `_gestes.html` — 951 l. → plan-admin.html, plan-smcl.html, plan.html

- l.4 · 8. Interactions du plan
- l.451 · Ce que les tiroirs lisent d'un geste
- l.497 · Le tiroir de la liste — écrans étroits
- l.723 · Les tiroirs menés par la hauteur — écrans étroits

Fonctions :

`milieu` 24 · `commencePince` 30 · `suitPince` 44 · `plieLesBandes` 97 · `saisitPlan` 111
`cibleElargie` 197 · `planifieFiltre` 407 · `traceurDeGeste` 475 · `cranVoisin` 494
`retraitBas` 520 · `mesureTiroir` 534 · `montreTiroir` 537 · `hisseTiroir` 541
`tiroirCrante` 750

### `_head.html` — 628 l. → plan-admin.html, plan-smcl.html, plan.html

Éléments :

`#bandeAdmin` · `#bandeActs` · `#bandeau` · `#logoSalon` · `#titre` · `#hallsBande`
`#halls` · `#btnLangue` · `#btnParcours` · `#nParcours` · `#btnLayers` · `#btnReglages`
`#btnItineraire` · `#menuCompte` · `#avatarCompte` · `#compteMail` · `#btnSortir`
`#alerteEnr` · `#alerteTxt` · `#alerteAct` · `#side` · `#poignee` · `#q` · `#videQ`
`#btnFiltres` · `#nFiltres` · `#panCrit` · `#critCorps` · `#critPied` · `#critVider`
`#critVoir` · `#actifs` · `#count` · `#countTxt` · `#list` · `#piedSide`
`#btnConfidentialite` · `#stage` · `#fondCarteGL` · `#fondTuiles` · `#fondCarte`
`#trouDuFond` · `#plan` · `#couches` · `#zones` · `#stands` · `#labels` · `#calqueLibelles`
`#zIn` · `#zOut` · `#zFit` · `#scaleBar` · `#scaleTxt` · `#creditCarte` · `#mentionOsm`
`#poi` · `#poiDefile` · `#viseur` · `#viseurTxt` · `#viseurStop` · `#calageBat`
`#calageAngle` · `#calageQuart` · `#calageStop` · `#calageValide` · `#iciRappel`
`#iciRappelTxt` · `#iciStop` · `#bornePose` · `#bornePoser` · `#calage` · `#calageFerme`
`#calageCorps` · `#calageCarte` · `#calageEtat` · `#calageGarde` · `#outils`
`#outilsCalque` · `#renommeOutils` · `#fermeOutils` · `#roleIti` · `#roleAide`
`#voirNappe` · `#aimants` · `#aimantPas` · `#contourReg` · `#contourRayon`
`#contourAimant` · `#traitReg` · `#traitEpaisseur` · `#traitStyle` · `#traitFleche`
`#texteADessiner` · `#repereType` · `#repereTransport` · `#repereMode` · `#repereLigne`
`#repereCouleur` · `#repereTexte` · `#imageSoc` · `#standSoc` · `#listeSoc`
`#fichierImage` · `#choisirImage` · `#vignette` · `#elemSel` · `#elemType`
`#elemSupprimer` · `#elemPicto` · `#elemTransport` · `#elemMode` · `#elemLigne`
`#elemCouleur` · `#elemTexte` · `#elemLiens` · `#elemLiensListe` · `#elemLienAjout`
`#elemLienAide` · `#elemDim` · `#elemLargeur` · `#elemHauteur` · `#elemTailleBloc`
`#elemTaille` · `#elemRotationBloc` · `#elemRotation` · `#elemRotationQuart`
`#elemRayonBloc` · `#elemRayon` · `#elemTraitReg` · `#elemEpaisseur` · `#elemStyle`
`#elemFleche` · `#elemSoc` · `#outilsAide` · `#annuleDernier` · `#libReg` · `#libNom`
`#libFerme` · `#libTaille` · `#libAuto` · `#libAide` · `#geoReg` · `#geoNom` · `#geoFerme`
`#geoInfos` · `#geoCodeL` · `#geoCode` · `#geoSocL` · `#geoSoc` · `#geoTitreL` · `#geoTitre`
`#geoDim` · `#geoLargeur` · `#geoHauteur` · `#geoOrigine` · `#geoFiche` · `#geoSupprime`
`#geoAide` · `#modale` · `#mTitre` · `#mFermer` · `#mCorps` · `#mPied` · `#panel` · `#pile`
`#voile` · `#detail` · `#poigneeFiche` · `#dRubans` · `#dGoIco` · `#dItinIco` · `#dMarque`
`#closeDetail` · `#dKind` · `#dPast` · `#dName` · `#dRen` · `#dLogo` · `#dBadges` · `#dCode`
`#dVis` · `#dPartage` · `#dCorne` · `#dOnglets` · `#dOngInfo` · `#dOngProg` · `#dOngNb`
`#dOngProd` · `#dOngNbProd` · `#dBody` · `#parcours` · `#poigneeParcours` · `#closeParcours`
`#pEyebrow` · `#pTitre` · `#pResume` · `#pActs` · `#btnJournee` · `#jRefaire`
`#btnPartage` · `#jJours` · `#pCorps` · `#jCorps` · `#pPied` · `#videParcours` · `#jPied`
`#jRetour` · `#itineraire` · `#poigneeItineraire` · `#closeItineraire` · `#iResume`
`#iCorps` · `#iDepart` · `#iViseA` · `#iSugg` · `#iEchange` · `#iArrivee` · `#iViseB`
`#iPmr` · `#iResultat` · `#videItineraire`

### `_hors-ligne.html` — 45 l. → hors-ligne.html

Éléments :

`#reessaie`

### `_ici.html` — 572 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 septies. « Vous êtes ici » — le code affiché dans le hall

Fonctions :

`prefixePlan` 83 · `coteIci` 95 · `nomCodeIci` 111 · `codeIci` 130 · `litCodeIci` 145
`lienIci` 165 · `poseIci` 191 · `retireIci` 218 · `oublieIciDeLAdresse` 248
`montreBandeauIci` 264 · `demarreIci` 298 · `pointTouche` 324 · `codeIciAuPoint` 336
`armeCodeIci` 342 · `afficheIci` 364 · `ligneAffiche` 404 · `nomFichierIci` 413
`ouvreCodeIci` 428 · `boutonsCodeIci` 480 · `telechargeAfficheIci` 504
`imprimeAfficheIci` 522 · `boutonCodeIci` 551

### `_index.html` — 45 l. → index.html

Éléments :

`#secours`

### `_installation.html` — 939 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 16. L'invitation à installer le plan

Fonctions :

`reglageInstallation` 98 · `invitationVoulue` 99 · `auDoigt` 129 · `nommeApplication` 165
`reponsesInstallation` 183 · `retientInstallation` 188 · `jourInstallation` 197
`invitationEcartee` 200 · `refuseInstallation` 206 · `faconInstallation` 234
`appliInstallee` 257 · `verifieApplication` 279 · `connaitLApplication` 289
`adresseApplication` 302 · `lanceApplication` 322 · `faconRappel` 355 · `rappelEcarte` 363
`refuseRappel` 369 · `relanceInvitation` 387 · `gesteInstallation` 392 · `doigtPose` 396
`doigtLeve` 397 · `vueInstallation` 400 · `accueilleInvitation` 409
`invitationRetenue` 435 · `suitLesGestes` 456 · `finInvitation` 464 · `rouvreInvitation` 486
`essaieInvitation` 506 · `teteInvitation` 635 · `retourAuxReglages` 656
`poseGardeInstallation` 685 · `remplitInvitation` 708 · `ouvreInvitation` 738
`ouvreRappel` 817 · `ouvreRetrouve` 879 · `caseInstallation` 902

### `_itineraire.html` — 3366 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 ter. Itinéraire — d'un point du salon à un autre

Fonctions :

`sommets` 104 · `enveloppe` 124 · `oublieGrilles` 167 · `calquesDe` 172 · `reperesDe` 177
`zoneTraversee` 257 · `zonesDuTerrain` 266 · `cleRoleIti` 269 · `roleIti` 270
`nomRoleIti` 271 · `estCirculation` 274 · `formesRole` 299 · `anglePlan` 331
`dansGrille` 370 · `horsGrille` 371 · `grille` 381 · `distanceAuMur` 570 · `cretes` 613
`nappePrincipale` 631 · `celluleDe` 666 · `caseDe` 670 · `centreCase` 675 · `empriseDe` 718
`accrocheDepuis` 780 · `versLeMilieu` 853 · `accroche` 888 · `Tas` 903 · `travail` 947
`cherche` 970 · `distancesDepuis` 1037 · `distancesMulti` 1051 · `regleFoule` 1123
`ecarteFoule` 1140 · `heureAuSalon` 1144 · `sallesEnMouvement` 1153 · `foule` 1196
`bilanFoule` 1284 · `reduit` 1313 · `guidageAllees` 1376 · `recentre` 1432 · `passable` 1517
`lisse` 1551 · `longueur` 1578 · `longueurDehors` 1594 · `nettoie` 1636 · `oublieFaces` 1683
`facesLibres` 1685 · `amorce` 1782 · `faceDeSortie` 1817 · `raccordTient` 1863
`accesDe` 1893 · `couplesAcces` 1945 · `troncon` 1978 · `pointObjet` 2021
`pointRepere` 2028 · `candidats` 2037 · `pointSaisi` 2071 · `portesDe` 2089
`versPorte` 2096 · `typeLiaison` 2157 · `nomRepere` 2165 · `oublieLiaisons` 2183
`lienEcrits` 2195 · `ecritLiens` 2204 · `annuaireLiaisons` 2209 · `liensDe` 2241
`coutLiaison` 2261 · `passagePraticable` 2268 · `passagesDe` 2276 · `sortiesDe` 2286
`plansRelies` 2294 · `balayage` 2318 · `distanceDepuis` 2336 · `cheminLiaisons` 2363
`routeParLiaisons` 2447 · `routeEntre` 2483 · `calculeRoute` 2522 · `couleurNappe` 2548
`rafraichitApercu` 2554 · `marchesIci` 2597 · `rayonBout` 2602 · `arreteTracage` 2635
`mesureMarches` 2642 · `coupeMarche` 2657 · `distancesDesArrets` 2673
`peintItineraire` 2685 · `lanceTracage` 2736 · `dessineItineraire` 2761
`rafraichitBouts` 2783 · `cadreItineraire` 2806 · `champIti` 2830 · `ecritDistance` 2834
`ecritDuree` 2842 · `fermeSugg` 2847 · `montreSugg` 2854 · `choisitPoint` 2888
`valideSaisie` 2897 · `effaceItineraire` 2909 · `relance` 2936 · `phraseLiaison` 2987
`montreResultat` 3001 · `bandeauVisee` 3143 · `armeVisee` 3166 · `finVisee` 3184
`viseItineraire` 3200 · `visePoi` 3206 · `visePoint` 3212 · `ouvreItineraire` 3244
`fermeItineraire` 3272 · `versItineraire` 3282 · `versItineraireDe` 3285

### `_journee.html` — 2797 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 ter. Organiser sa visite

Fonctions :

`peineDeCharge` 134 · `minutesDe` 201 · `finInstant` 202 · `ecritHeure` 204
`ecritMinutes` 209 · `dateDeCle` 222 · `jourBref` 228 · `joursSalon` 238 · `joursAVenir` 267
`joursDefaut` 285 · `confsParJour` 295 · `pointConf` 312 · `departsProposes` 331
`matriceJournee` 364 · `ecartDesJours` 497 · `poidsDesJours` 527 · `chargeDuJour` 550
`rangeSejour` 559 · `derouleJournee` 1113 · `prepareSejour` 1255 · `calculeSejour` 1457
`apercuRepartition` 1491 · `rangJournee` 1505 · `lienJournee` 1517 · `boutonJour` 1540
`arretJournee` 1553 · `remplitOnglets` 1600 · `jourDuStand` 1629 · `ouvreChoixJour` 1641
`figeLaVisite` 1698 · `placeSurJour` 1707 · `rendAuPlan` 1715 · `retireDuSejour` 1721
`remplitJournee` 1731 · `ecritApercu` 1944 · `appliqueVueParcours` 1974
`traceJournee` 2016 · `montreLeJour` 2025 · `perimeJournee` 2040 · `oublieSejour` 2055
`ouvreOrganisation` 2070 · `essaieSejour` 2450 · `lanceSejour` 2480 · `refaitSejour` 2519
`trancheDe` 2552 · `chargeSuivie` 2572 · `jourISO` 2578 · `etapesDuSejour` 2586
`annoncePlan` 2613 · `celluleUtile` 2649 · `dilatationPour` 2712 · `dilatationDuJour` 2728
`litLaCharge` 2765 · `chargeCellule` 2785

### `_js.html` — 598 l. → plan-admin.html, plan-smcl.html, plan.html

- l.84 · 1. Index global — la recherche porte sur tous les pavillons

Fonctions :

`$` 20 · `esc` 22 · `cheminDuSalon` 40 · `cheminPartageable` 51 · `P` 81 · `nomDeLaZone` 101
`nomsAnglaisDesZones` 103 · `texteProduits` 116 · `indexe` 120 · `chronoConf` 360
`confsDuPlan` 365 · `indexeConferences` 383 · `rangeConferences` 461 · `poseFavicon` 508
`poseLogoSalon` 534 · `poseTonDeLaBarre` 571

Éléments :

`#data`

### `_langue.js` — 792 l. → admin-plans.html, hors-ligne.html, index.html, motdepasse.html, plan-admin.html, plan-smcl.html, plan.html, rapport.html

- l.1 · La langue de la page — le français d'origine, l'anglais sur demande

### `_marque.html` — 281 l. → admin-plans.html, plan-admin.html, plan-smcl.html, plan.html

- l.1 · La marque sans le vide qui l'entoure

Fonctions :

`marquePrete` 55 · `recadreMarque` 59 · `marqueRecadree` 85 · `imageChargee` 114
`vignetteMarque` 130 · `boiteMarque` 156 · `toileMarque` 222 · `vignetteDeLogo` 246

### `_mesure.html` — 629 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 13. Mesure d'utilisation

Fonctions :

`mesureOuverte` 61 · `jetonMesure` 64 · `jourIso` 103 · `echeanceMesure` 104
`jetonRetenu` 128 · `supportMesure` 177 · `renouvelleVisiteur` 228 · `fraisEnFile` 295
`litLaFile` 299 · `ecritLaFile` 312 · `metEnFile` 327 · `retireDeLaFile` 338
`chargeDe` 349 · `envoiePaquet` 362 · `beaconne` 387 · `pousseLaFile` 408
`envoieMesures` 427 · `mesure` 464 · `effaceJetonsVisiteur` 530 · `refuseMesure` 548
`ouvreConfidentialite` 575

### `_modales.html` — 191 l. → plan-admin.html

- l.2 · Fenêtres modales : confirmation et réorganisation des calques

Fonctions :

`verseModale` 22 · `ouvreModale` 37 · `fermeModale` 57 · `confirme` 72 · `deplaceVers` 91
`versExtremite` 103 · `remplitOrdre` 111 · `ouvreOrdre` 181

### `_mode-admin.html` — 1157 l. → plan-admin.html, plan-smcl.html, plan.html

- l.3 · 10. Mode administration
- l.114 · La fiche d'une zone organisateur
- l.885 · Masquer une zone organisateur
- l.982 · Placer un libellé à la main

Fonctions :

`retireAdmin` 20 · `activeAdmin` 34 · `champZone` 140 · `champsZone` 165 · `champSalles` 257
`nomDeZone` 309 · `reduitLogo` 343 · `cadreLogo` 386 · `champLogo` 458 · `editeurRiche` 496
`memeFicheZone` 653 · `suitFicheZone` 660 · `verseFicheZone` 668 · `ficheZone` 694
`enregistreZone` 719 · `enregistreZoneAjoutee` 832 · `basculeAffichageZone` 896
`marqueZonesMasquees` 924 · `ecritColonnesEvenement` 944 · `ecritColonneEvenement` 978
`cleLibelle` 1003 · `empreinteLibelle` 1019 · `placementLibelle` 1027 · `posePlacement` 1038
`libelleAutomatique` 1055 · `modePlacementLibelles` 1064 · `majPaletteLibelle` 1083
`choisitLibelle` 1100 · `pousseLibelle` 1107 · `libellePointerDown` 1115
`libellePointerMove` 1131 · `libellePointerUp` 1140

Éléments :

`#sauveConf` · `#restaureConf` · `#fichierConf`

### `_motdepasse.html` — 254 l. → motdepasse.html

- l.61 · Poser un mot de passe

Fonctions :

`$` 82 · `CFG` 84 · `dit` 92 · `fragment` 98 · `garde` 105 · `lit` 109 · `demandeLien` 182
`ouvreSaisie` 191

Éléments :

`#titre` · `#intro` · `#formMdp` · `#mdp1` · `#mdp2` · `#poser` · `#formMail` · `#mail`
`#envoyer` · `#msg` · `#apres` · `#versConsole`

### `_ordre-fiche.html` — 680 l. → plan-admin.html, plan-smcl.html, plan.html

Fonctions :

`clesFiche` 25 · `voletOrdre` 42 · `enregistreConf` 630 · `rgbHex` 637 · `hexa` 644
`luminance` 648 · `ecarte` 662 · `joli` 677

### `_parcours.html` — 758 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11 bis. Parcours de visite

Fonctions :

`cleParcours` 63 · `identifiantParcours` 100 · `casierParcours` 108 · `dansParcours` 109
`jourParcours` 112 · `attenduDepuisTropLongtemps` 117 · `trieParcours` 128
`chargeParcours` 138 · `parcoursAEcrire` 172 · `enregistreParcours` 188
`tientLeStockage` 217 · `basculeParcours` 238 · `verseAuParcours` 283
`plurielParcours` 309 · `contenuParcours` 318 · `retenusPourParcours` 344
`ajouteToutAuParcours` 369 · `poseToutAuParcours` 392 · `signetParcours` 418
`boutonParcours` 424 · `rafraichitMarque` 429 · `brancheParcours` 442 · `calqueMarques` 474
`dessineMarques` 490 · `marqueParcours` 520 · `rafraichitParcours` 534 · `instantConf` 565
`cleTemps` 569 · `jourCourt` 575 · `nomDeStand` 582 · `rangParcours` 584
`groupeParcours` 604 · `remplitParcours` 613 · `ouvreParcours` 702 · `fermeParcours` 714
`videLeParcours` 730

### `_partage.html` — 761 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 quinquies. Partager son parcours

Fonctions :

`codeIdParcours` 54 · `codeParcours` 72 · `champParcours` 84 · `litCodeParcours` 91
`lienParcours` 117 · `qrMotsBruts` 157 · `qrMotsUtiles` 166 · `qrMul` 177
`qrGenerateur` 180 · `qrReste` 191 · `qrAlignements` 202 · `qrTrame` 218 · `qrChemin` 407
`qrSvg` 429 · `ouvrePartageParcours` 441 · `boutonsPartage` 497
`accueilleParcoursPartage` 575 · `adoptePartage` 653 · `parcoursACopier` 688
`ouvreGardeParcours` 703 · `demandeGardeParcours` 733 · `poseGardeParcours` 746

### `_pile.html` — 533 l. → plan-admin.html

- l.2 · Pile des calques
- l.47 · Panneau : deux sections, chacune rangée par nom
- l.343 · Repères
- l.395 · Fond du plan

Fonctions :

`clePile` 8 · `entrees` 10 · `pile` 21 · `groupe` 33 · `ordonneDom` 41 · `nature` 65
`boutonAjout` 72 · `boutonVerrou` 92 · `intertitre` 100 · `construitPanneau` 108
`sectionSelection` 359 · `sectionFond` 415 · `ligneCouleur` 473 · `rangSecteur` 493
`rangSous` 506 · `defautCouleur` 528

### `_pousse.html` — 697 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · Enregistrer la configuration
- l.567 · La sauvegarde emportée

Fonctions :

`accesBase` 57 · `autoDispo` 69 · `enRetard` 72 · `etatCourant` 85 · `majAttente` 96
`compteRescapes` 110 · `ditAlerte` 123 · `ditEtat` 167 · `programmeEnvoi` 174
`programmePublication` 188 · `rattrapeRetard` 195 · `envoie` 200 · `presse` 213
`resteSession` 247 · `renouvelleSession` 263 · `base` 287 · `identifiants` 335
`reglagesSeuls` 350 · `noteReglagesCharges` 361 · `oublieCache` 375
`pousseConfiguration` 394 · `sauvegardeCourante` 587 · `telechargeSauvegarde` 609
`appliqueSauvegarde` 632 · `litSauvegarde` 666 · `brancheSauvegarde` 688

### `_rappels.html` — 648 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 sexies. Le rappel avant une conférence

Fonctions :

`reglageRappel` 63 · `rappelsVoulus` 64 · `minutesRappel` 65 · `cleRappels` 78
`chargeRappels` 81 · `retientRappels` 85 · `poussePossible` 94 · `rappelsOfferts` 100
`iOSsansInstallation` 106 · `instantAbsolu` 135 · `confsARappeler` 151 · `heureVue` 175
`empreinteDebut` 176 · `rappelsDuParcours` 187 · `adresseDuRappel` 210 · `octetsDeCle` 222
`abonnementCourant` 230 · `abonne` 239 · `synchroniseRappels` 265 · `eteintRappels` 288
`allumeRappels` 303 · `aideRappel` 320 · `poseRappels` 336 · `cleInviteRappel` 457
`inviteRappelFaite` 460 · `retientInviteRappel` 465 · `fenetreRappel` 500
`proposeRappels` 533 · `essaieRappelReel` 595 · `reprendRappels` 637

### `_rapport-head.html` — 32 l. → rapport.html

Éléments :

`#choixEvt` · `#choixPeriode` · `#statut` · `#lienConsole` · `#btnExcel` · `#btnRecharger`
`#btnLangue` · `#btnTheme` · `#rapport`

### `_rapport-js.html` — 444 l. → rapport.html

- l.2 · Rapport d'utilisation

Fonctions :

`courant` 52 · `chargeEvenements` 57 · `joursPeriode` 75 · `chargeRapport` 77 · `chiffre` 88
`barres` 107 · `portes` 147 · `jours` 198 · `dessineRapport` 219 · `dessineBarre` 372
`rafraichit` 395 · `videEcran` 414 · `demarre` 430

Éléments :

`#lienPublic`

### `_recherche.html` — 1287 l.

- l.3 · 5. Recherche et secteurs — sans mot-clé ni critère retenu on reste sur le

Fonctions :

`indexeSecteurs` 24 · `secteursMontres` 37 · `couleurConf` 41 · `hslHex` 45
`couleurSecteur` 62 · `BANDES` 83 · `majFondus` 91 · `pastilleSecteur` 129
`coloreSecteurs` 142 · `peintSecteur` 193 · `appliqueSecteurs` 206 · `filtreTheme` 223
`themeFiltrable` 303 · `ordreCriteres` 323 · `clesCriteres` 346 · `libelleCritere` 353
`separeValeurs` 361 · `valeursCritere` 378 · `texteCriteres` 391 · `texteAnglaisPerso` 407
`indexeCriteres` 421 · `refaitCriteres` 455 · `dansCriteres` 462 · `critereActif` 470
`basculeCritere` 472 · `videCriteres` 481 · `majVideQ` 490 · `videRecherche` 503
`nCriteres` 518 · `majCriteres` 533 · `remplitCriteres` 600 · `basculeCriteres` 739
`ouvreCriteres` 744 · `fermeCriteres` 760 · `filtre` 777 · `reposeRetrait` 797
`critParSociete` 801 · `cherchable` 811 · `visible` 818 · `releveHotes` 839
`visibleSurPlan` 847 · `visibleSociete` 858 · `marqueRetrait` 874 · `appliqueFiltre` 892
`oublieRetrait` 908 · `reprendRecherche` 917 · `rangSorte` 930 · `codeCase` 952
`caseNumero` 969 · `sousLigne` 989 · `liste` 1003 · `marqueChoisie` 1131
`prechargeMarque` 1157 · `prechargeLesVignettes` 1214 · `chargeUnLot` 1260

### `_reglages.html` — 927 l. → plan-admin.html

Fonctions :

`texteCorps` 66 · `clesPortees` 91 · `standApercu` 111 · `lignesApercu` 135
`contenuApercu` 165 · `apercuFiche` 202 · `apercuListe` 280 · `apercuDuo` 302
`glisseFenetre` 336 · `ouvreReglages` 348 · `voletZones` 476 · `champsFicheZone` 578
`ficheZoneEnPlace` 648 · `voletPlan` 666 · `blocRappel` 714 · `ditEssaiRappel` 825
`voletCoexposants` 859

### `_rendu.html` — 634 l.

- l.3 · 2. Mesure de texte — largeur réelle dans la police de rendu
- l.113 · 3. Rendu du pavillon courant
- l.493 · 4. Libellés — le nom de l'exposant prime sur le numéro

Fonctions :

`largeur` 8 · `decoupe` 33 · `habille` 46 · `lignesSvg` 57 · `coexComptes` 74
`coexChoisit` 75 · `ligneCode` 91 · `monteHabillage` 119 · `baliseZone` 148
`baliseStand` 158 · `montePlan` 165 · `onglets` 200 · `changePlan` 222 · `texteDist` 269
`texteCourtDist` 274 · `porteDist` 278 · `standPorte` 282 · `calqueDists` 291
`traceDist` 322 · `oublieDists` 355 · `modesDuPlan` 359 · `releveDists` 361
`dessineDists` 395 · `marquesListe` 421 · `poseDistsFiche` 451 · `refaitDistsFiche` 491
`ancre` 501 · `place` 502 · `libelles` 504 · `decaleLibelle` 591 · `facteurLibelle` 592
`libelleForce` 593 · `libelleZone` 596 · `libelleEmplacement` 615

### `_sponsor.html` — 571 l. → plan-admin.html

- l.1 · 18. Le sponsor — un logo le temps du chargement

Fonctions :

`reglageSponsor` 96 · `secondesSponsor` 99 · `modeSponsor` 112 · `sponsorRetenu` 131
`cleSponsor` 162 · `sponsorEnCache` 165 · `retientSponsor` 180 · `ouvreSponsor` 205
`suitSponsor` 297 · `resteSponsor` 322 · `fermeSponsor` 328 · `accueilleSponsor` 344
`blocSponsor` 413

### `_styles-divers.css` — 315 l. → plan-admin.html, plan-smcl.html, plan.html

### `_styles-jetons.css` — 270 l. → plan-admin.html, plan-smcl.html, plan.html

### `_styles-modeles-parcours.css` — 1556 l. → plan-admin.html, plan-smcl.html, plan.html

### `_styles-modeles.css` — 830 l. → plan-admin.html, plan-smcl.html, plan.html

### `_styles-parcours.css` — 601 l. → plan-admin.html, plan-smcl.html, plan.html

### `_styles-plan.css` — 1600 l. → plan-admin.html, plan-smcl.html, plan.html

### `_suggestion.html` — 685 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 15. La suggestion — un exposant de plus, pour compléter la visite

Fonctions :

`reglageSugg` 57 · `seuilSugg` 59 · `presentationsSugg` 83 · `presenteSugg` 89
`critereSugg` 94 · `indexSugg` 106 · `valeursSugg` 131 · `suggestionCourante` 150
`exposantPropose` 186 · `nomValeurSugg` 204 · `phraseSuggestion` 225 · `carteSuggestion` 253
`poseSuggestion` 302 · `fenetreSuggestion` 316 · `relevePalmares` 356 · `etiquetteSugg` 376
`voletSuggestion` 386

### `_sw.js` — 562 l.

Fonctions :

`estUneTuile` 121 · `range` 147 · `oublieLesVersionsDAvant` 173 · `dabordCache` 194
`borneLesLots` 230 · `borneLesTuiles` 268 · `demandeTiers` 323 · `commePosee` 331
`tuileDeCarte` 348 · `fondDeCarte` 384 · `dabordReseau` 411 · `navigation` 428

### `_tutoriel.html` — 903 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 17. La visite guidée — le tour du plan, geste par geste

Fonctions :

`reglageTuto` 52 · `tutoPropose` 61 · `cleTuto` 65 · `tutoOuvert` 67 · `tutoModale` 68
`tutoFicheOuverte` 74 · `tutoFiche` 77 · `tutoParcours` 79 · `tutoItineraire` 82
`tutoJournee` 86 · `zoneDuTuto` 94 · `insecable` 111 · `phraseTrajetTuto` 117
`chapitresTuto` 377 · `proposeTutoriel` 397 · `lanceTutoriel` 455 · `quitteTutoriel` 541
`chapitreTuto` 552 · `battementTuto` 561 · `finTuto` 579 · `afficheTuto` 596 · `pxTuto` 651
`boiteTuto` 654 · `repereTuto` 668 · `rameneTuto` 701 · `placeTuto` 739 · `voileTuto` 820
`rafaleTuto` 837 · `marqueZoneTuto` 857 · `marqueLibelleTuto` 892

Éléments :

`#tutoPoints` · `#tutoAvance` · `#tutoQuitte` · `#tutoTitre` · `#tutoTexte` · `#tutoPied`
`#tutoSuite`

### `_volets.html` — 1165 l. → plan-admin.html

Fonctions :

`voletAdmin` 4 · `blocOptions` 169 · `blocLangues` 216 · `blocBarre` 290
`blocHoraires` 348 · `voletParcours` 490 · `sallesSituees` 625 · `voletPmr` 641
`nomDuTon` 732 · `svgVignette` 741 · `barreVignette` 743 · `vignetteDistPlan` 747
`vignetteDistListe` 760 · `vignetteDistFiche` 774 · `salonDitSes` 794 · `coinPris` 801
`voletDist` 824 · `voletApparence` 989

### `_vue.html` — 479 l. → plan-admin.html, plan-smcl.html, plan.html

- l.3 · 6. Vue

Fonctions :

`cadrePlan` 18 · `oublieCadre` 19 · `figeTextes` 35 · `rendTextes` 43 · `cadrage` 79
`peintLibelles` 84 · `detacheLibelles` 90 · `rattacheLibelles` 102 · `etireLibelles` 120
`appliqueVue` 128 · `libellesDeLaVue` 192 · `rafraichitVue` 200 · `poseVue` 216
`mesureBarre` 247 · `masqueHaut` 279 · `masque` 286 · `masqueDroite` 323 · `fit` 334
`stoppeZoom` 367 · `glisseVersVise` 373 · `glisseVers` 415 · `rectVisee` 437 · `zoom` 457
`echelle` 470

### `_webgl.html` — 1602 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 13 bis. Le plan peint par la carte graphique — WebGL2

Fonctions :

`monteWebgl` 78 · `poseToileWebgl` 179 · `guetteContexteWebgl` 185
`contextePerduWebgl` 195 · `verifieContexteWebgl` 202 · `perdContexteWebgl` 211
`remonteWebgl` 232 · `vueDeck` 249 · `vueWebgl` 258 · `blocDe` 267 · `enEdition` 297
`majEditionWebgl` 301 · `cleBloc` 313 · `planifieWebgl` 339 · `toutRepeindreWebgl` 343
`blocsDansLOrdre` 350 · `repeintWebgl` 355 · `assembleWebgl` 379 · `constTexte` 413
`jeuDeCaracteres` 609 · `sousPixelOffert` 663 · `couchesPetites` 668 · `couchesTexte` 678
`mulM` 712 · `appM` 715 · `echelleM` 716 · `lisTransform` 718 · `lisTrace` 740
`lisPoints` 808 · `num` 814 · `anneau` 816 · `rectArrondi` 822 · `couleurGl` 836
`accVide` 853 · `convertitBloc` 854 · `accDe` 870 · `parcoursGl` 877 · `avecTrous` 917
`formeGl` 938 · `texteGl` 974 · `imageGl` 997 · `partage` 1029 · `designeGl` 1035
`couchesDeBloc` 1037 · `modelesLibellesHtml` 1112 · `poseModelesLibelles` 1122
`lisModelesLibelles` 1128 · `emplacementWebgl` 1157 · `libellesWebgl` 1205
`groupesNoms` 1274 · `couchesNoms` 1291 · `couchesPastilles` 1302
`couchesLibellesWebgl` 1317 · `couchesDessineesWebgl` 1324 · `stage` 1345
`brancheSurvolWebgl` 1349 · `poseSurvolWebgl` 1369 · `poseCurseurWebgl` 1378
`poseFocusWebgl` 1387 · `aplatsDe` 1394 · `coucheSurvol` 1397 · `coucheFocus` 1406
`couchesPhare` 1433 · `lueurDe` 1449 · `opacitePhare` 1487 · `echellePhare` 1488
`couchesPhareNoms` 1491 · `palierDefile` 1516 · `phaseComete` 1518 · `animeCouche` 1521
`majAnimationWebgl` 1538 · `animeWebgl` 1546 · `objetSous` 1569 · `cibleWebgl` 1576
`priseWebgl` 1583 · `libelleSousWebgl` 1588 · `rectEcranWebgl` 1593

## `supabase/functions/` — synchronisation Klipso et API publique

### `supabase/functions/_partage/champs.ts` — 542 l.

`valeursDe` 337

### `supabase/functions/_partage/eventmaker.ts` — 1208 l.

`grapheJson` 233 · `enParallele` 1016 · `texteSeul` 1036 · `champs` 1173

### `supabase/functions/_partage/gaia.ts` — 305 l.

`aplatit` 266

### `supabase/functions/_partage/geometrie.ts` — 163 l.

`r2` 23 · `distSegment` 55 · `distBord` 64 · `poleInterieur` 83 · `portee` 104

### `supabase/functions/_partage/octets.ts` — 18 l.

(aucune fonction de premier niveau)

### `supabase/functions/_partage/push.ts` — 229 l.

`colle` 63 · `texte` 71 · `cleDeSignature` 83 · `jetonVapid` 105 · `derive` 131
`chiffre` 145

### `supabase/functions/_partage/svg.ts` — 216 l.

`r2` 24 · `points` 44 · `boite` 83 · `neDessineRien` 106

### `supabase/functions/_partage/version.ts` — 100 l.

`condense` 96

### `supabase/functions/_partage/vignette.ts` — 28 l.

(aucune fonction de premier niveau)

### `supabase/functions/mesure/index.ts` — 173 l.

`jeton` 80 · `client` 83

### `supabase/functions/plan-public/index.ts` — 1103 l.

`cors` 52 · `db` 86 · `service` 101 · `vignettesParAdresse` 118 · `avecVignette` 155
`rendVignette` 191 · `rendVignettes` 282 · `lu` 325 · `salon` 335 · `appDuSalon` 361
`rendIconeApp` 392 · `retraits` 493 · `ampute` 517 · `masquesDe` 560 · `masquesDuPlan` 580

### `supabase/functions/sync-evenement/index.ts` — 1894 l.

`cors` 43 · `bourre` 112 · `client` 122 · `ecrit` 144 · `gaia` 152 · `libellesChoix` 163
`retiensAnglais` 190 · `fournisseur` 208 · `raccourci` 216 · `enClair` 253 · `range` 279
`champsKlipso` 300 · `hebergee` 1842 · `nettoieUrl` 1870 · `groupeTextes` 1880

## `supabase/migrations/` — schéma, numéroté et rejouable

- `20260904000001_init.sql` — evenement, plan, calque, apparence, calque_dessin, instantane
- `20260904000002_sources.sql` — evenement
- `20260904000003_fiche.sql` — evenement
- `20260904000004_cles_fournisseur.sql` — evenement
- `20260904000005_salles.sql` — evenement
- `20260904000006_fuseau.sql` — evenement
- `20260904000007_noms_zones.sql` — evenement
- `20260904000008_cle_dessin.sql` — calque_dessin
- `20260904000009_cle_dessin_index.sql` — —
- `20260904000010_correspondances.sql` — evenement
- `20260904000011_mesures.sql` — mesure, fn rapport_utilisation
- `20260908000001_compteurs.sql` — cible, compteur, compteur_cible, visiteur_jour, fn enregistre_mesures, fn rapport_utilisation
- `20260908000002_empreinte_fond.sql` — plan
- `20260909000001_empreinte_calque.sql` — calque
- `20260909000002_retire_empreinte_plan.sql` — plan
- `20260910000001_champs_perso.sql` — —
- `20260910000002_ordre_fiche.sql` — —
- `20260910000003_zones_masquees.sql` — evenement
- `20260910000004_comptes.sql` — profil, acces, fn est_admin, fn acces_salon, fn profil_a_la_creation, fn profil_suit_adresse
- `20260910000005_prenom.sql` — profil, fn profil_a_la_creation
- `20260910000006_ferme_lecture_anon.sql` — —
- `20260910000007_role_non_declare.sql` — fn profil_a_la_creation
- `20260910000008_audience.sql` — fn audience_cibles
- `20260910000009_fiches_zones.sql` — evenement
- `20260910000010_remise_a_zero.sql` — fn reinitialise_compteurs
- `20260910000011_gestes_par_stand.sql` — compteur_cible, fn enregistre_mesures, fn audience_cibles
- `20260910000012_periode_du_salon.sql` — fn periode_salon, fn rapport_utilisation, fn audience_cibles
- `20260911080023_logo_des_zones_organisateur.sql` — —
- `20260911130920_icone_d_onglet_du_salon.sql` — evenement
- `20260912053447_groupes_de_champs_de_la_fiche.sql` — —
- `20260912055309_suggestion_un_canal_de_mesure_a_elle.sql` — fn enregistre_mesures, fn audience_cibles
- `20260912140943_zones_traversables.sql` — evenement
- `20260913122346_le_support_d_acces_au_plan.sql` — compteur, visiteur_jour, fn enregistre_mesures, fn rapport_utilisation
- `20260913170035_les_visiteurs_uniques_par_stand.sql` — visiteur_cible, fn enregistre_mesures, fn purge_presences, fn reinitialise_compteurs, fn audience_cibles
- `20260913182428_le_partage_d_un_parcours_compte.sql` — compteur, fn enregistre_mesures, fn audience_cibles, fn rapport_utilisation
- `20260913200617_le_fuseau_d_un_salon_au_format_iana.sql` — fn fuseau_iana, fn evenement_fuseau_iana, fn periode_salon, fn enregistre_mesures
- `20260913205218_le_fuseau_d_un_salon_choisi_sinon_eventmaker_sinon_paris.sql` — evenement, fn evenement_fuseau_iana
- `20260913223216_la_conservation_des_jetons_de_visiteur.sql` — fn purge_presences, fn reinitialise_compteurs
- `20260913234328_libelles_anglais_des_listes_de_valeurs.sql` — evenement
- `20260914112229_intitules_des_champs_de_la_fiche.sql` — —
- `20260914231027_le_calage_du_plan_sur_la_terre.sql` — evenement
- `20260915103801_vignettes_des_logos_d_exposants.sql` — vignette_de_logo
- `20260915113207_retrouver_une_vignette_par_son_adresse_d_origine.sql` — —
- `20260915115829_le_rappel_avant_une_conference.sql` — rappel_de_conference, fn enregistre_rappels, fn rappels_dus, fn oublie_abonnement, fn purge_rappels
- `20260915131103_programmer_vraiment_la_tache_des_rappels.sql` — —
- `20260916232846_l_icone_et_le_nom_de_l_application_installee.sql` — evenement
- `20260916235956_les_mesures_qui_ont_attendu_le_reseau.sql` — fn enregistre_mesures
- `20260917004611_oublier_un_rappel_que_le_programme_a_dementi.sql` — rappel_de_conference, fn empreinte_debut, fn enregistre_rappels, fn oublie_rappels_perimes
- `20260917121232_l_avancement_d_une_synchronisation_releve_sur_la_fiche_du_salon.sql` — evenement
- `20260921132502_un_seul_nom_de_produit_dans_le_commentaire_du_nom_de_l_application.sql` — —
- `20260921145417_le_calage_de_la_carte_par_pavillon.sql` — plan
- `20260922144359_la_charge_prevue_des_stands.sql` — plan_de_visite, compteur, fn enregistre_mesures, fn pose_plan_de_visite, fn charge_prevue, fn purge_presences, fn reinitialise_compteurs, fn rapport_utilisation
- `20261008172816_la_porte_publique_des_mesures.sql` — fn mesure_publique

## Le reste

- `src/index.mjs` — 965 l. · Worker Cloudflare : relais et cache de `/api/plan`.
  `dit` 104 · `amontPour` 113 · `cleDe` 121 · `cleDeLot` 127 · `condense` 134 `cleVersion` 158 · `rangeLaVersion` 161 · `ditVersion` 169 · `meta` 178 · `gardable` 194 `range` 200 · `rafraichit` 207 · `entete` 242 · `oublie` 284 · `rappels` 370 · `cleApp` 415 `cheminDuSalon` 446 · `pageDuSalon` 463 · `appDuSalon` 487 · `iconesDuSalon` 533 `manifeste` 573 · `iconeApp` 662 · `mesure` 706 · `planDeVisite` 781 · `chargePrevue` 819
- `outils/assemble.js` — assemble `gabarit/` en `tpl-multi.html`.
- `outils/genere.js` — écrit les pages de `web/` depuis `tpl-multi.html`.
- `outils/pwa.js` — le manifeste et l'en-tête qui rendent les pages installables.
- `outils/icones.js` — dessine l'icône de l'application, et l'encode en PNG.
- `outils/carte.js` — produit ce fichier.
- `outils/verifie.js` — reconstruit, et échoue si le versionné était en retard.
- `outils/controle.js` — analyse le script de chaque page construite, en module
  ES : une redéclaration y est une erreur, là où un `<script>` la tolère.
- `outils/migration.js` — crée une migration horodatée à la seconde.
- `outils/polices.js` — rapatrie les polices de Google dans `web/polices/`, hors
  construction (réseau requis) ; écrit `outils/polices.json`, relu par `genere.js`.
- `outils/gabarit/_langue.js` — la version anglaise : posé en tête de chaque page, il
  traduit ce qu'elle affiche d'après le dictionnaire, et tient la bascule FR/EN.
- `outils/anglais/` — le dictionnaire anglais, un fichier par module ; `serveur.js` et
  `donnees.js` pour ce qui arrive du serveur, `invisibles.js` pour les faux positifs.
- `outils/traductions.js` — relève les chaînes visibles du gabarit, échoue sur celles
  qui n'ont pas de traduction ; choisit aussi ce que chaque page emporte du dictionnaire.
- `outils/fetch-all.js`, `outils/build-all.js`, `outils/optim.js`, `outils/lire-pdf.js` —
  outils hors ligne de récupération et de préparation des plans (clé Klipso requise).
