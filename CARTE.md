<!-- Produit par `node outils/carte.js` (via `npm run construire`).
     Ne pas modifier à la main : la prochaine construction l'écrase. -->

# Carte des sources

Index des sources, relu dans les fichiers à chaque construction. Il sert à
ouvrir la bonne portion du bon fichier plutôt que le dépôt entier.

Rappel : `web/` est **fabriqué** depuis `outils/gabarit/`, et n'est donc pas
l'endroit où l'on corrige quoi que ce soit.

## `outils/gabarit/` — la source des pages

### `_admin1.html` — 5463 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 9. Apparence des calques
- l.4313 · 10. Mode administration
- l.4421 · La fiche d'une zone organisateur
- l.5191 · Masquer une zone organisateur
- l.5288 · Placer un libellé à la main

Fonctions :

`salonRange` 17 · `cleConf` 19 · `ouvreConf` 23 · `reglagesDuSalon` 42 · `conf` 63
`jeton` 64 · `sousCle` 65 · `styleFond` 67 · `sousCalques` 88 · `styleDataGroupe` 110
`appliqueCouleursData` 119 · `styleData` 151 · `appliqueApparence` 157
`appliqueCommandes` 222 · `optionActive` 326 · `programmeOffert` 331
`suggestionOfferte` 332 · `appliqueOptions` 334 · `langueOfferte` 358 · `appliqueLangue` 360
`catalogueTenu` 365 · `chercheSorte` 435 · `voletRecherche` 438 · `blocOrdreCriteres` 499
`minutesVisite` 670 · `seuilGere` 734 · `seuilImpose` 735 · `seuilParSurface` 736
`regleSeuil` 741 · `aireDuStand` 759 · `seuilConcentration` 795 · `phraseSeuil` 818
`lueHeure` 863 · `lueDate` 867 · `datesSalon` 874 · `horairesSalon` 888 · `salonPartage` 901
`presseNuanciers` 932 · `suitNuancier` 948 · `trio` 976 · `melange` 986
`appliqueAccent` 1000 · `appliqueFond` 1034 · `modeDist` 1081 · `couleurDist` 1093
`appliqueDists` 1115 · `modeBarre` 1145 · `appliqueBarre` 1147 · `modeleRetenu` 1187
`policeChoisie` 1343 · `policeDuModele` 1348 · `feuillePolice` 1358 · `chargePolice` 1380
`policePrete` 1400 · `policeDesNoms` 1418 · `posePoliceLibelles` 1447
`appliqueModele` 1479 · `habilleModale` 1523 · `texteCorps` 1595 · `clesPortees` 1620
`standApercu` 1640 · `lignesApercu` 1664 · `contenuApercu` 1694 · `apercuFiche` 1731
`apercuListe` 1809 · `apercuDuo` 1831 · `glisseFenetre` 1864 · `ouvreReglages` 1875
`voletZones` 2000 · `champsFicheZone` 2102 · `ficheZoneEnPlace` 2172 · `voletPlan` 2190
`blocRappel` 2238 · `ditEssaiRappel` 2349 · `voletAdmin` 2374 · `blocOptions` 2564
`blocLangues` 2611 · `blocLibelles` 2682 · `blocBarre` 2759 · `blocHoraires` 2817
`voletParcours` 2959 · `sallesSituees` 3094 · `voletPmr` 3110 · `nomDuTon` 3201
`svgVignette` 3210 · `barreVignette` 3212 · `vignetteDistPlan` 3216
`vignetteDistListe` 3229 · `vignetteDistFiche` 3243 · `salonDitSes` 3263 · `coinPris` 3270
`voletDist` 3293 · `voletApparence` 3458 · `clesFiche` 3658 · `voletOrdre` 3675
`enregistreConf` 4262 · `rgbHex` 4269 · `hexa` 4276 · `luminance` 4280 · `ecarte` 4294
`joli` 4309 · `retireAdmin` 4330 · `activeAdmin` 4343 · `champZone` 4447 · `champsZone` 4472
`champSalles` 4564 · `nomDeZone` 4616 · `reduitLogo` 4650 · `cadreLogo` 4693
`champLogo` 4765 · `editeurRiche` 4803 · `memeFicheZone` 4960 · `suitFicheZone` 4967
`verseFicheZone` 4975 · `ficheZone` 5001 · `enregistreZone` 5026
`enregistreZoneAjoutee` 5139 · `basculeAffichageZone` 5202 · `marqueZonesMasquees` 5230
`ecritColonnesEvenement` 5250 · `ecritColonneEvenement` 5284 · `cleLibelle` 5309
`empreinteLibelle` 5325 · `placementLibelle` 5333 · `posePlacement` 5343
`libelleAutomatique` 5360 · `modePlacementLibelles` 5369 · `majPaletteLibelle` 5388
`choisitLibelle` 5405 · `pousseLibelle` 5412 · `libellePointerDown` 5420
`libellePointerMove` 5436 · `libellePointerUp` 5445

Éléments :

`#sauveConf` · `#restaureConf` · `#fichierConf`

### `_admin2.html` — 271 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 12. Démarrage

Fonctions :

`demarre` 8 · `annonce` 67 · `entetesApi` 90 · `chargeFond` 113 · `panneDuChargement` 160
`CLE_VERSION` 170 · `versionRetenue` 171 · `retientVersion` 174 · `demandePlan` 198
`charge` 222

### `_aimants.html` — 486 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11 quater. Dessiner juste — cote, aimants, répétition

Fonctions :

`ecritMetres` 15 · `coteCadre` 19 · `montreCote` 31 · `aimantsActifs` 59 · `axesDe` 63
`pointsAimants` 68 · `oublieAimantsDuPlan` 88 · `aimantsDuPlan` 90 · `pasAimant` 123
`cale` 131 · `sousLeGeste` 136 · `cranGrille` 147 · `oublieAimants` 164
`aimantsDessines` 166 · `coinsGeste` 192 · `montreAimants` 214 · `meilleurSommet` 279
`croixAimant` 293 · `correction` 317 · `aimante` 358 · `retientTaille` 372
`reprendTaille` 386 · `dupliqueForme` 407 · `pousseForme` 432 · `ecritDimensions` 449
`appliqueDimension` 468

### `_application.html` — 453 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 19. L'application installée — son icône et son nom

Fonctions :

`fondPourIconeApp` 92 · `dessineIconeApp` 124 · `reduitIconeApp` 151 · `adresseIconeApp` 185
`appDuSalon` 193 · `iconeDeLApplication` 196 · `nomAppDefaut` 206 · `ecritApplication` 221
`blocApplication` 262

### `_auth-plan.html` — 204 l. → plan-admin.html

- l.2 · Accès à l'administration du plan

Fonctions :

`litLocal` 10 · `configuration` 15 · `normaliseUrlA` 19 · `sessionValide` 35
`ecranAcces` 45 · `contenuDuJeton` 131 · `mailDuJeton` 138 · `litProfilA` 149
`initialesDe` 162 · `poseCompte` 169

Éléments :

`#accesMsg` · `#aUrl` · `#aCle` · `#aMail` · `#aMdp` · `#aPublic` · `#aOubli` · `#aOk`

### `_batiments.html` — 558 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 quinquies. Bâtiments de la bibliothèque

Fonctions :

`CLE_CALAGE` 26 · `bibliothequeDispo` 27 · `refBatiment` 44 · `refForme` 48
`marqueBatiment` 51 · `batimentsPoses` 54 · `estBatiment` 61 · `hallsPoses` 64
`lieuDuCalque` 70 · `poseCalage` 76 · `ouvreBibliotheque` 85 · `vueDuLieu` 181
`lanceCalage` 221 · `effaceLeTempsDuCalage` 249 · `cadreCalage` 268 · `finCalage` 281
`pivoteCalage` 292 · `degresCalage` 308 · `dessineCalage` 313 · `calagePointerDown` 336
`calagePointerMove` 349 · `calagePointerUp` 365 · `reposeBatiment` 378
`ajouteBatiments` 394 · `boutonRecale` 478 · `pictoRecale` 487 · `calageRelu` 504
`rouvreCalage` 530 · `mentionOsm` 553

### `_borne.html` — 370 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 quinquies. La borne interactive — un plan qui sait où il est

Fonctions :

`pointBorne` 62 · `borneRetenue` 70 · `retientBorne` 76 · `oublieBorne` 79 · `lieuBorne` 98
`lieuNomme` 117 · `pointLibre` 122 · `poseDepartImpose` 135 · `poseLaBorne` 146
`remetLeDepart` 165 · `poseBorneIci` 179 · `armeLaPose` 188 · `montreBandeauBorne` 204
`ecritDepartBorne` 218 · `rayonBorne` 231 · `dessineBorne` 236 · `rafraichitBorne` 252
`rempliBorne` 257 · `relanceRepos` 286 · `reposeLaBorne` 293 · `demarreBorne` 329

### `_chaleur.html` — 636 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 14. Les compteurs d'usage, vus du plan — carte de chaleur, remise à zéro
- l.434 · Remise à zéro des compteurs

Fonctions :

`nbChal` 32 · `tonChaleur` 51 · `niveauChaleur` 73 · `valeurChaleur` 76 · `chargeChaleur` 89
`coloreChaleur` 135 · `cartoucheChaleur` 170 · `mesureCartoucheChaleur` 234
`replieChaleur` 240 · `ecritEtatChaleur` 251 · `dessineEchelleChaleur` 259
`dessineTopChaleur` 279 · `phraseChaleur` 321 · `rafraichitChaleur` 346
`montreChaleur` 380 · `rangChaleur` 416 · `aplati` 456 · `voletMesure` 461
`evenementCourant` 487 · `ouvreRemiseAZero` 506 · `lanceRemiseAZero` 598

Éléments :

`#chalReduit` · `#chalPer` · `#chalEch` · `#chalEtat` · `#chalTop`

### `_classeur.html` — 234 l. → admin-plans.html, rapport.html

- l.2 · Classeur — écrire un vrai fichier Excel, sans bibliothèque

Fonctions :

`CRC_TABLE` 29 · `crc32` 39 · `archiveZip` 54 · `texteXml` 110 · `colonneXl` 113
`XL_PARTS` 124 · `feuilleXl` 178 · `classeurXl` 214 · `enregistreFichier` 225

### `_config.js` — 15 l. → config.js

### `_console-base.html` — 499 l. → admin-plans.html, rapport.html

- l.10 · Socle commun de la console et du rapport — accès au projet

Fonctions :

`$` 16 · `esc` 17 · `entetes` 38 · `contenuJeton` 47 · `resteJeton` 57 · `renouvelle` 67
`appel` 101 · `rest` 112 · `verseModale` 142 · `ouvreModale` 148 · `verrouilleModale` 171
`fermeModale` 173 · `gardeLaPlace` 196 · `demande` 201 · `confirme` 223 · `ecranConfig` 234
`normaliseUrl` 270 · `ecranConnexion` 289 · `deconnecte` 352 · `signale` 363 · `bloc` 384
`grille` 402 · `idCompte` 445 · `themeSombre` 455 · `initialesDe` 475

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

### `_dessin.html` — 2543 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11. Calques de dessin

Fonctions :

`enAttente` 42 · `litRange` 69 · `ouvreDessins` 81 · `reprendCommun` 106
`notePubliees` 132 · `rangeDessins` 150 · `dejaPubliee` 155 · `marqueAttente` 161
`mesCalques` 169 · `enregistreDessins` 170 · `instantane` 212 · `clotSalve` 223
`memorise` 224 · `restaure` 235 · `annule` 251 · `refais` 263 · `trouveCalque` 265
`nouvelId` 266 · `cheminArrondi` 284 · `estCadre` 327 · `cheminForme` 329 · `styleTrait` 349
`longueurFleche` 375 · `cheminFleche` 382 · `marqueFleche` 411 · `rafraichitFleches` 422
`poseTrait` 438 · `traceForme` 448 · `rotationTexte` 467 · `dessineDessins` 472
`redessineForme` 513 · `peintCalque` 537 · `versPlan` 543 · `apercu` 549 · `apercuGuide` 561
`toleranceTrace` 585 · `aimanteContour` 590 · `rayonContour` 593 · `redresseTrace` 612
`traceGuide` 646 · `fermeIci` 653 · `ajouteForme` 658 · `pictoDe` 785
`nomTypeRepereFr` 841 · `nomTypeRepere` 843 · `typeZone` 873 · `pictoForme` 880
`estPorte` 900 · `ouvreEntrant` 901 · `ouvreSortant` 902 · `modeDit` 942 · `lettreMode` 943
`estTransport` 947 · `modeTransport` 950 · `glypheRepere` 962 · `cleLigne` 999
`ligneAffichee` 1010 · `couleurLigne` 1018 · `couleurRepere` 1024 · `encreRepere` 1030
`nomLigneFr` 1044 · `libelleDoffice` 1052 · `couleurEcrite` 1059 · `traceRepere` 1078
`nomSurLePlan` 1212 · `etiquetteSociete` 1223 · `seRattache` 1251 · `societeDeForme` 1263
`societesDuPlan` 1275 · `poseChampImage` 1296 · `remplitListeSocietes` 1303
`societeSaisie` 1311 · `traceImage` 1338 · `traceStandDessine` 1363
`texteStandDessine` 1387 · `poseLibellesDessines` 1411 · `decoupeStand` 1432
`marqueStandsDessines` 1447 · `rafraichitStandsDessines` 1462 · `oublieReperes` 1492
`reperesCherchables` 1494 · `vaAuRepere` 1538 · `clePoi` 1581 · `pastillePoi` 1590
`cartouchePoi` 1594 · `ouvrePoi` 1713 · `mesureCartouche` 1786 · `pharePoi` 1802
`phareRepere` 1806 · `phareZone` 1808 · `eclairePoi` 1814 · `oublieChoixPoi` 1847
`signale` 1856 · `calquePourImage` 1870 · `lienImageSaisi` 1898 · `formeImage` 1910
`poseImage` 1919 · `ditImagePosee` 1941 · `importeImage` 1949 · `dessinPointerDown` 2000
`dessinPointerMove` 2085 · `dessinPointerUp` 2123 · `termineTrace` 2164 · `aide` 2176
`outilOffert` 2206 · `choisitOutil` 2209 · `enchaineStand` 2240 · `optionsModes` 2270
`proposeCouleurLigne` 2281 · `montreTransport` 2292 · `activeCalque` 2358 · `cleVerrou` 2416
`verrouille` 2417 · `basculeVerrou` 2419 · `pictoVerrou` 2436 · `montreRoleIti` 2470
`creeCalque` 2501 · `demandeNom` 2514 · `renommeCalque` 2533

Éléments :

`#dPaneInfos` · `#dGo` · `#dItin`

### `_edition.html` — 650 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · Édition des formes existantes

Fonctions :

`formeParId` 11 · `boite` 19 · `curseurPoignee` 27 · `poignees` 32 · `dessinePoignees` 41
`cadreTexte` 76 · `poigneeRotation` 96 · `angleBorne` 106 · `choisitForme` 108
`majElement` 119 · `candidatsLiaison` 240 · `ecritDesDeuxCotes` 262 · `changeLien` 274
`changeDureeLien` 290 · `majLiens` 307 · `appliqueSociete` 359 · `appliqueTexte` 375
`appliqueRotation` 387 · `appliqueRayon` 401 · `appliqueTrait` 414 · `appliqueTransport` 442
`appliquePicto` 465 · `supprimeForme` 491 · `editionPointerDown` 501
`editionPointerMove` 561 · `tourneTexte` 624 · `editionPointerUp` 640

### `_environs.html` — 1652 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 16. Les environs — le pavillon dans son quartier

Fonctions :

`metresParDegre` 43 · `tourneEnvirons` 60 · `versTerre` 66 · `versLePlan` 73 · `reancre` 88
`emprisePavillon` 114 · `centrePavillon` 129 · `styleSobre` 206 · `forceCarte` 300
`calagePose` 318 · `calageCourant` 330 · `fondCourant` 333 · `recul` 338
`pixelsMercator` 343 · `latitudeDePixel` 352 · `metresParPixel` 360 · `echelleDesTuiles` 378
`niveauDesTuiles` 390 · `adresseTuile` 397 · `tuilesDeLaVue` 407 · `chargeMapLibre` 472
`vueGL` 503 · `styleDuFond` 523 · `guetteLaCarte` 551 · `poseCarteGL` 562
`diagnostiqueGL` 648 · `relanceCarteGL` 668 · `videCarteGL` 680 · `dessineFondCarte` 705
`cleMasqueCarte` 809 · `masqueCarte` 810 · `basculeMasqueCarte` 812
`boutonMasqueCarte` 823 · `pictoMasque` 834 · `formesMasquantes` 846 · `contourDuHall` 868
`cheminDuHall` 875 · `poseMasqueCarte` 893 · `carreDeTerrain` 927 · `chercheBatiments` 943
`aireDuContour` 970 · `centreDuContour` 979 · `axeDuContour` 992 · `empriseDesObjets` 1009
`batimentsCandidats` 1027 · `caleSurBatiment` 1048 · `retientLeHall` 1074
`manqueCalage` 1096 · `enregistreCalage` 1105 · `calageEnregistre` 1122
`oublieCalageEnCours` 1143 · `litCoordonnees` 1155 · `rafraichitCarte` 1169
`armeCalage` 1211 · `pivotCalage` 1222 · `glisseCarte` 1226 · `cartePointerDown` 1233
`cartePointerMove` 1247 · `cartePointerUp` 1266 · `ditCalage` 1274 · `ditCarte` 1283
`majCalage` 1291 · `appliqueCalage` 1313 · `tourneCalage` 1320 · `construitCalage` 1326
`ouvreCalage` 1491 · `fermeCalage` 1500 · `voletEnvirons` 1528

### `_export.html` — 215 l. → admin-plans.html, rapport.html

- l.2 · Export par exposant — une ligne par stand, une colonne par provenance

Fonctions :

`nb` 22 · `colonnesExport` 106 · `libellePeriode` 138 · `nomFichierExport` 144
`nomFeuilleExport` 154 · `exporteExposants` 170

### `_geometrie.html` — 1064 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11 octies. Reprendre à la main la géométrie d'un emplacement

Fonctions :

`cleGeo` 30 · `arrondiGeo` 38 · `empreinteGeo` 49 · `anneauxGeo` 69 · `traceGeo` 82
`boiteAnneaux` 86 · `dansAnneau` 104 · `distSegmentGeo` 115 · `distBordGeo` 124
`poleGeo` 134 · `porteeGeo` 153 · `boiteGeo` 161 · `geometrieSource` 186
`reposeSource` 195 · `poseGeometrie` 204 · `retoucheGeo` 218 · `elargitEmprise` 231
`appliqueGeometries` 252 · `cleVerrouGeo` 281 · `geoVerrouille` 282 · `basculeVerrouGeo` 284
`boutonVerrouGeo` 299 · `modeGeometrie` 310 · `objetGeoSous` 337 · `groupeGeo` 347
`choisitGeo` 355 · `cadreGeo` 370 · `prisesGeo` 390 · `curseurGeo` 402
`dessinePoigneesGeo` 405 · `ecritDimensionsGeo` 433 · `nomSorteGeo` 445
`majPaletteGeo` 447 · `finGesteGeo` 486 · `enregistreGeo` 504 · `geometrieOrigine` 518
`retraceGeo` 533 · `pousseGeometrie` 544 · `appliqueDimensionGeo` 561 · `cleAjout` 599
`anneauxValides` 613 · `rechAjout` 618 · `objetAjoute` 627 · `poseLien` 646
`appliqueAjouts` 673 · `enregistreAjout` 708 · `ajouteEmplacement` 723 · `renommeAjout` 751
`lieAjout` 783 · `ecritInfosAjout` 812 · `supprimeAjout` 839 · `choisitOutilGeo` 868
`aideAjout` 875 · `fermeAjout` 885 · `ajoutPointerDown` 894 · `ajoutPointerMove` 910
`ajoutPointerUp` 932 · `geometriePointerDown` 952 · `accrocheGeo` 983
`geometriePointerMove` 985 · `geometriePointerUp` 1036

### `_head.html` — 5784 l. → plan-admin.html, plan-smcl.html, plan.html

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

### `_installation.html` — 937 l. → plan-admin.html, plan-smcl.html, plan.html

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
`poseGardeInstallation` 683 · `remplitInvitation` 706 · `ouvreInvitation` 736
`ouvreRappel` 815 · `ouvreRetrouve` 877 · `caseInstallation` 900

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

### `_js.html` — 5665 l. → plan-admin.html, plan-smcl.html, plan.html

- l.79 · 1. Index global — la recherche porte sur tous les pavillons
- l.594 · 2. Mesure de texte — largeur réelle dans la police de rendu
- l.704 · 3. Rendu du pavillon courant
- l.1075 · 4. Libellés — le nom de l'exposant prime sur le numéro
- l.1432 · 5. Recherche et secteurs — sans mot-clé ni critère retenu on reste sur le
- l.2713 · 6. Vue
- l.3186 · 7. Sélection et fiche
- l.4732 · 8. Interactions du plan
- l.5165 · Ce que les tiroirs lisent d'un geste
- l.5211 · Le tiroir de la liste — écrans étroits
- l.5437 · Les tiroirs menés par la hauteur — écrans étroits

Fonctions :

`$` 15 · `esc` 17 · `cheminDuSalon` 35 · `cheminPartageable` 46 · `P` 76 · `nomDeLaZone` 96
`nomsAnglaisDesZones` 98 · `texteProduits` 111 · `indexe` 115 · `chronoConf` 355
`confsDuPlan` 360 · `indexeConferences` 378 · `rangeConferences` 456 · `poseFavicon` 503
`poseLogoSalon` 529 · `poseTonDeLaBarre` 566 · `largeur` 599 · `decoupe` 624 · `habille` 637
`lignesSvg` 648 · `coexComptes` 665 · `coexChoisit` 666 · `ligneCode` 682
`monteHabillage` 710 · `baliseZone` 739 · `baliseStand` 749 · `montePlan` 756
`onglets` 787 · `changePlan` 809 · `texteDist` 856 · `texteCourtDist` 861 · `porteDist` 865
`standPorte` 869 · `calqueDists` 878 · `traceDist` 909 · `oublieDists` 942
`modesDuPlan` 946 · `releveDists` 948 · `dessineDists` 977 · `marquesListe` 1003
`poseDistsFiche` 1033 · `refaitDistsFiche` 1073 · `ancre` 1083 · `place` 1084
`libelles` 1086 · `decaleLibelle` 1192 · `facteurLibelle` 1193 · `libelleForce` 1194
`libelleZone` 1197 · `libelleEmplacement` 1216 · `modeLibelles` 1264
`etiquettesActives` 1268 · `GRAINE_ETIQUETTES` 1273 · `tirage` 1281
`candidatEtiquette` 1301 · `separationAxe` 1323 · `separation` 1336 · `placeEtiquettes` 1357
`etiquettesDuPlan` 1394 · `etiquetteSvg` 1427 · `indexeSecteurs` 1453
`secteursMontres` 1466 · `couleurConf` 1470 · `hslHex` 1474 · `couleurSecteur` 1491
`BANDES` 1512 · `majFondus` 1520 · `pastilleSecteur` 1558 · `coloreSecteurs` 1571
`peintSecteur` 1622 · `appliqueSecteurs` 1635 · `filtreTheme` 1652 · `themeFiltrable` 1732
`ordreCriteres` 1752 · `clesCriteres` 1775 · `libelleCritere` 1782 · `separeValeurs` 1790
`valeursCritere` 1807 · `texteCriteres` 1820 · `texteAnglaisPerso` 1836
`indexeCriteres` 1850 · `refaitCriteres` 1884 · `dansCriteres` 1891 · `critereActif` 1899
`basculeCritere` 1901 · `videCriteres` 1910 · `majVideQ` 1919 · `videRecherche` 1932
`nCriteres` 1947 · `majCriteres` 1962 · `remplitCriteres` 2029 · `basculeCriteres` 2168
`ouvreCriteres` 2173 · `fermeCriteres` 2189 · `filtre` 2206 · `reposeRetrait` 2226
`critParSociete` 2230 · `cherchable` 2240 · `visible` 2247 · `releveHotes` 2268
`visibleSurPlan` 2276 · `visibleSociete` 2287 · `marqueRetrait` 2303 · `appliqueFiltre` 2321
`oublieRetrait` 2333 · `reprendRecherche` 2342 · `rangSorte` 2355 · `codeCase` 2377
`caseNumero` 2394 · `sousLigne` 2414 · `liste` 2428 · `marqueChoisie` 2556
`prechargeMarque` 2582 · `prechargeLesVignettes` 2639 · `chargeUnLot` 2685
`cadrePlan` 2728 · `oublieCadre` 2729 · `figeTextes` 2745 · `rendTextes` 2753
`cadrage` 2789 · `peintLibelles` 2794 · `detacheLibelles` 2800 · `rattacheLibelles` 2812
`etireLibelles` 2830 · `appliqueVue` 2838 · `libellesDeLaVue` 2902 · `rafraichitVue` 2910
`poseVue` 2924 · `mesureBarre` 2953 · `masqueHaut` 2985 · `masque` 2992
`masqueDroite` 3029 · `fit` 3040 · `stoppeZoom` 3073 · `glisseVersVise` 3079
`glisseVers` 3121 · `rectVisee` 3143 · `zoom` 3163 · `echelle` 3176 · `ETROIT` 3192
`anime` 3208 · `noeud` 3232 · `canalPlan` 3242 · `rangSociete` 3250 · `select` 3259
`centre` 3284 · `brancheActesFiche` 3295 · `centreEtBaisseLaFiche` 3311 · `centrePoint` 3329
`montre` 3374 · `libelleCorps` 3406 · `ordreCorps` 3423 · `groupesFiche` 3455
`montreIntitule` 3468 · `valeurCorps` 3488 · `champCorps` 3501 · `groupeCorps` 3513
`corpsRange` 3526 · `momentLocal` 3561 · `programme` 3584 · `produits` 3633
`ficheProduit` 3661 · `jourLong` 3727 · `ficheConf` 3738 · `lien` 3885 · `adresseWeb` 3893
`pictoRS` 3936 · `adresseSure` 3954 · `adresseVignette` 3985 · `adresseImage` 4003
`imageSure` 4016 · `assainitRiche` 4045 · `enBlocs` 4093 · `rangeRiche` 4106
`ecarteClicFantome` 4134 · `nomSociete` 4143 · `societes` 4156 · `choisitExposant` 4167
`poseMarque` 4205 · `montreMarque` 4265 · `poseCode` 4288 · `rangeMarque` 4329
`ouvre` 4392 · `ferme` 4702 · `onglet` 4720 · `milieu` 4752 · `commencePince` 4758
`suitPince` 4772 · `plieLesBandes` 4825 · `saisitPlan` 4839 · `cibleElargie` 4921
`planifieFiltre` 5121 · `traceurDeGeste` 5189 · `cranVoisin` 5208 · `retraitBas` 5234
`mesureTiroir` 5248 · `montreTiroir` 5251 · `hisseTiroir` 5255 · `tiroirCrante` 5464

Éléments :

`#data` · `#dGo` · `#dItin`

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

### `_modales.html` — 189 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · Fenêtres modales : confirmation et réorganisation des calques

Fonctions :

`verseModale` 22 · `ouvreModale` 37 · `fermeModale` 57 · `confirme` 72 · `deplaceVers` 90
`versExtremite` 102 · `remplitOrdre` 110 · `ouvreOrdre` 180

### `_motdepasse.html` — 249 l. → motdepasse.html

- l.61 · Poser un mot de passe

Fonctions :

`$` 77 · `CFG` 79 · `dit` 87 · `fragment` 93 · `garde` 100 · `lit` 104 · `demandeLien` 177
`ouvreSaisie` 186

Éléments :

`#titre` · `#intro` · `#formMdp` · `#mdp1` · `#mdp2` · `#poser` · `#formMail` · `#mail`
`#envoyer` · `#msg` · `#apres` · `#versConsole`

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

### `_partage.html` — 766 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 quinquies. Partager son parcours

Fonctions :

`codeIdParcours` 54 · `codeParcours` 72 · `champParcours` 84 · `litCodeParcours` 91
`lienParcours` 117 · `qrMotsBruts` 157 · `qrMotsUtiles` 166 · `qrMul` 177
`qrGenerateur` 180 · `qrReste` 191 · `qrAlignements` 202 · `qrTrame` 218 · `qrChemin` 407
`qrSvg` 429 · `ouvrePartageParcours` 446 · `boutonsPartage` 502
`accueilleParcoursPartage` 580 · `adoptePartage` 658 · `parcoursACopier` 693
`ouvreGardeParcours` 708 · `demandeGardeParcours` 738 · `poseGardeParcours` 751

### `_pile.html` — 538 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · Pile des calques
- l.57 · Panneau : deux sections, chacune rangée par nom
- l.349 · Repères
- l.401 · Fond du plan

Fonctions :

`clePile` 8 · `entrees` 10 · `pile` 21 · `groupe` 33 · `ordonneDom` 41 · `deplaceCouche` 46
`nature` 75 · `boutonAjout` 82 · `boutonVerrou` 102 · `intertitre` 110
`construitPanneau` 117 · `sectionSelection` 365 · `sectionFond` 421 · `ligneCouleur` 479
`rangSecteur` 499 · `rangSous` 512 · `defautCouleur` 534

### `_pousse.html` — 695 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · Enregistrer la configuration
- l.566 · La sauvegarde emportée

Fonctions :

`accesBase` 57 · `autoDispo` 69 · `enRetard` 72 · `etatCourant` 85 · `majAttente` 96
`compteRescapes` 110 · `ditAlerte` 123 · `ditEtat` 167 · `programmeEnvoi` 174
`programmePublication` 188 · `rattrapeRetard` 195 · `envoie` 200 · `presse` 213
`resteSession` 247 · `renouvelleSession` 263 · `base` 287 · `identifiants` 335
`reglagesSeuls` 350 · `noteReglagesCharges` 361 · `oublieCache` 375
`pousseConfiguration` 394 · `sauvegardeCourante` 586 · `telechargeSauvegarde` 608
`appliqueSauvegarde` 631 · `litSauvegarde` 665 · `brancheSauvegarde` 687

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

### `_sponsor.html` — 569 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 18. Le sponsor — un logo le temps du chargement

Fonctions :

`reglageSponsor` 96 · `secondesSponsor` 99 · `modeSponsor` 112 · `sponsorRetenu` 131
`cleSponsor` 162 · `sponsorEnCache` 165 · `retientSponsor` 180 · `ouvreSponsor` 205
`suitSponsor` 297 · `resteSponsor` 322 · `fermeSponsor` 328 · `accueilleSponsor` 344
`blocSponsor` 412

### `_suggestion.html` — 683 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 15. La suggestion — un exposant de plus, pour compléter la visite

Fonctions :

`reglageSugg` 57 · `seuilSugg` 59 · `presentationsSugg` 83 · `presenteSugg` 89
`critereSugg` 94 · `indexSugg` 106 · `valeursSugg` 131 · `suggestionCourante` 150
`exposantPropose` 186 · `nomValeurSugg` 204 · `phraseSuggestion` 225 · `carteSuggestion` 253
`poseSuggestion` 302 · `fenetreSuggestion` 316 · `relevePalmares` 355 · `etiquetteSugg` 375
`voletSuggestion` 385

### `_sw.js` — 562 l. → sw.js

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

### `_webgl.html` — 1640 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 13 bis. Le plan peint par la carte graphique — WebGL2

Fonctions :

`monteWebgl` 78 · `poseToileWebgl` 179 · `guetteContexteWebgl` 185
`contextePerduWebgl` 195 · `verifieContexteWebgl` 202 · `perdContexteWebgl` 211
`remonteWebgl` 232 · `vueDeck` 249 · `vueWebgl` 258 · `blocDe` 267 · `enEdition` 297
`majEditionWebgl` 301 · `cleBloc` 313 · `planifieWebgl` 339 · `toutRepeindreWebgl` 343
`blocsDansLOrdre` 350 · `repeintWebgl` 355 · `assembleWebgl` 379 · `constTexte` 413
`jeuDeCaracteres` 609 · `sousPixelOffert` 663 · `couchesPetites` 668 · `couchesTexte` 678
`mulM` 717 · `appM` 720 · `echelleM` 721 · `lisTransform` 723 · `lisTrace` 745
`lisPoints` 813 · `num` 819 · `anneau` 821 · `rectArrondi` 827 · `couleurGl` 841
`accVide` 858 · `convertitBloc` 859 · `accDe` 875 · `parcoursGl` 882 · `avecTrous` 922
`formeGl` 943 · `texteGl` 979 · `imageGl` 1002 · `partage` 1034 · `designeGl` 1040
`couchesDeBloc` 1042 · `modelesLibellesHtml` 1117 · `poseModelesLibelles` 1127
`lisModelesLibelles` 1133 · `emplacementWebgl` 1162 · `libellesWebgl` 1214
`groupesNoms` 1307 · `couchesNoms` 1326 · `couchesPastilles` 1337
`couchesLibellesWebgl` 1352 · `couchesDessineesWebgl` 1361 · `stage` 1383
`brancheSurvolWebgl` 1387 · `poseSurvolWebgl` 1407 · `poseCurseurWebgl` 1416
`poseFocusWebgl` 1425 · `aplatsDe` 1432 · `coucheSurvol` 1435 · `coucheFocus` 1444
`couchesPhare` 1471 · `lueurDe` 1487 · `opacitePhare` 1525 · `echellePhare` 1526
`couchesPhareNoms` 1529 · `palierDefile` 1554 · `phaseComete` 1556 · `animeCouche` 1559
`majAnimationWebgl` 1576 · `animeWebgl` 1584 · `objetSous` 1607 · `cibleWebgl` 1614
`priseWebgl` 1621 · `libelleSousWebgl` 1626 · `rectEcranWebgl` 1631

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

## Le reste

- `src/index.mjs` — 893 l. · Worker Cloudflare : relais et cache de `/api/plan`.
  `dit` 100 · `amontPour` 109 · `cleDe` 117 · `cleDeLot` 123 · `condense` 130 `cleVersion` 154 · `rangeLaVersion` 157 · `ditVersion` 165 · `meta` 174 · `gardable` 190 `range` 196 · `rafraichit` 203 · `entete` 238 · `oublie` 280 · `rappels` 366 · `cleApp` 411 `cheminDuSalon` 442 · `pageDuSalon` 459 · `appDuSalon` 483 · `iconesDuSalon` 529 `manifeste` 569 · `iconeApp` 658 · `mesure` 679 · `planDeVisite` 715 · `chargePrevue` 753
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
